import { createHTML } from './html';

export const characters = ["Niki", "LunLun", "Lucy", "Shua", "Dhanpir", "Pochi", "Al"] as const;
export type Character = typeof characters[number];
export function isCharacter(character: string): character is Character {
    return (characters as unknown as string[]).includes(character);
}

export type Part = "Hat" | "Hair" | "Dye" | "Upper" | "Lower" | "Shoes" | "Socks" | "Hand" | "Backpack" | "Face" | "Racket" | "Other";

export class ItemSource {
    constructor(readonly shop_id: number) { }

    get requiresGuardian(): boolean {
        if (this instanceof ShopItemSource) {
            return false;
        }
        else if (this instanceof GachaItemSource) {
            return [...this.item.sources.values()].every(source => source.requiresGuardian);
        }
        else if (this instanceof GuardianItemSource) {
            return true;
        }
        else {
            throw "Internal error";
        }
    }

    get item() {
        const item = shop_items.get(this.shop_id);
        if (!item) {
            console.error(`Failed finding item of itemSource ${this.shop_id}`);
            throw "Internal error";
        }
        return item;
    }
}

export class ShopItemSource extends ItemSource {
    constructor(shop_id: number, readonly price: number, readonly ap: boolean, readonly items: Item[]) {
        super(shop_id);
    }
}

export class GachaItemSource extends ItemSource {
    constructor(shop_id: number) {
        super(shop_id);
    }

    gachaTries(item: Item, character?: Character) {
        const gacha = gachas.get(this.shop_id);
        if (!gacha) {
            throw "Internal error";
        }
        return gacha.average_tries(item, character);
    }
}

export type GachaEconomics =
    | {
        availability: "unavailable";
        chancePercent: number;
        expectedPulls: number;
    }
    | {
        availability: "direct";
        chancePercent: number;
        currency: "AP" | "Gold";
        expectedPulls: number;
        expectedSpend: number;
        pricePerPull: number;
    };

export function projectGachaEconomics(
    expectedPulls: number,
    source?: { price: number; ap: boolean },
): GachaEconomics {
    const chancePercent = expectedPulls > 0 ? 100 / expectedPulls : 0;
    if (!source) {
        return {
            availability: "unavailable",
            chancePercent,
            expectedPulls,
        };
    }
    return {
        availability: "direct",
        chancePercent,
        currency: source.ap ? "AP" : "Gold",
        expectedPulls,
        expectedSpend: expectedPulls * source.price,
        pricePerPull: source.price,
    };
}

export class GuardianItemSource extends ItemSource {
    constructor(
        readonly guardian_map: string,
        readonly items: Item[],
        readonly xp: number,
        readonly need_boss: boolean,
        readonly boss_time: number) {
        super(GuardianItemSource.guardian_map_id(guardian_map));
    }

    static guardian_map_id(map: string) {
        let index = this.guardian_maps.indexOf(map);
        if (index === -1) {
            index = this.guardian_maps.length;
            this.guardian_maps.push(map);
        }
        return -index;
    }

    private static guardian_maps = [""];
}

export class Item {
    id = 0;
    name_kr = "";
    name_en = "";
    useType = "";
    maxUse = 0;
    hidden = false;
    resist = "";
    character?: Character;
    part: Part = "Other";
    level = 0;
    str = 0;
    sta = 0;
    dex = 0;
    wil = 0;
    hp = 0;
    quickslots = 0;
    buffslots = 0;
    smash = 0;
    movement = 0;
    charge = 0;
    lob = 0;
    serve = 0;
    max_str = 0;
    max_sta = 0;
    max_dex = 0;
    max_wil = 0;
    element_enchantable = false;
    parcel_enabled = false;
    spin = 0;
    atss = 0;
    dfss = 0;
    socket = 0;
    gauge = 0;
    gauge_battle = 0;
    sources: ItemSource[] = [];
    statFromString(name: string): number {
        switch (name) {
            case "Mov Speed":
                return this.movement;
            case "Charge":
                return this.charge;
            case "Lob":
                return this.lob;
            case "Smash":
                return this.smash;
            case "Str":
                return this.str;
            case "Dex":
                return this.dex;
            case "Sta":
                return this.sta;
            case "Will":
                return this.wil;
            case "Max Str":
                return this.max_str;
            case "Max Dex":
                return this.max_dex;
            case "Max Sta":
                return this.max_sta;
            case "Max Will":
                return this.max_wil;
            case "Serve":
                return this.serve;
            case "Quickslots":
                return this.quickslots;
            case "Buffslots":
                return this.buffslots;
            case "HP":
                return this.hp;
            default:
                throw "Internal error";
        }
    }
}

class Gacha {
    constructor(readonly shop_index: number, readonly gacha_index: number, readonly name: string) {
        for (const character of characters) {
            this.shop_items.set(character, new Map<Item, [/*probability:*/ number, /*quantity_min:*/ number, /*quantity_max:*/ number]>())
        }
    }

    add(item: Item, probability: number, character: Character, quantity_min: number, quantity_max: number) {
        if (item.character && item.character !== character) {
            //console.info(`Item ${item.id} from gacha "${this.name}" ${this.gacha_index} has wrong character`);
            character = item.character;
        }
        this.shop_items.get(character)!.set(item, [probability, quantity_min, quantity_max]);
        this.character_probability.set(character, probability + (this.character_probability.get(character) || 0));
    }

    average_tries(item: Item, character: Character | undefined = undefined) {
        const chars: readonly Character[] = character ? ([character]) : characters;
        const probability = chars.reduce((p, character) => p + (this.shop_items.get(character)!.get(item)?.[0] || 0), 0);
        if (probability === 0) {
            return 0;
        }
        const total_probability = chars.reduce((p, character) => p + this.character_probability.get(character)!, 0);
        return total_probability / probability;
    }

    get total_probability() {
        return characters.reduce((p, character) => p + this.character_probability.get(character)!, 0);
    }

    character_probability = new Map<Character, number>();
    shop_items = new Map<Character, Map<Item, [/*probability:*/ number, /*quantity_min:*/ number, /*quantity_max:*/ number]>>();
}

export let items = new Map<number, Item>();
export let shop_items = new Map<number, Item>();
let gachas = new Map<number, Gacha>();
let dialog: HTMLDialogElement | undefined;
type ItemArtEntry = [sheet: string, cell: number];
type ItemArtSheet = {
    lineCount: number;
    size: number;
    space: number;
    width: number;
};
type LotteryArtEntry = {
    sheet: string;
    cell: number;
    color: string;
    shape: "coin" | "cube" | "token";
};
type ItemArtMap = {
    items: Record<string, ItemArtEntry>;
    lotteries: Record<string, LotteryArtEntry>;
    sheets: Record<string, ItemArtSheet>;
};
let itemArtMap: ItemArtMap = { items: {}, lotteries: {}, sheets: {} };

function prettyNumber(n: number, digits: number) {
    let s = n.toFixed(digits);
    while (s.endsWith("0")) {
        s = s.slice(0, -1);
    }
    if (s.endsWith(".")) {
        s = s.slice(0, -1);
    }
    return s;
}

function parseItemData(data: string) {
    if (data.length < 1000) {
        console.warn(`Items file is only ${data.length} bytes long`);
    }
    for (const [, result] of data.matchAll(/\<Item (.*)\/\>/g)) {
        const item: Item = new Item;
        for (const [, attribute, value] of result.matchAll(/\s?([^=]*)="([^"]*)"/g)) {
            switch (attribute) {
                case "Index":
                    item.id = parseInt(value);
                    break;
                case "_Name_":
                    item.name_kr = value;
                    break;
                case "Name_N":
                    item.name_en = value;
                    break;
                case "UseType":
                    item.useType = value;
                    break;
                case "MaxUse":
                    item.maxUse = parseInt(value);
                    break;
                case "Hide":
                    item.hidden = !!parseInt(value);
                    break;
                case "Resist":
                    item.resist = value;
                    break;
                case "Char":
                    switch (value) {
                        case "NIKI":
                            item.character = "Niki";
                            break;
                        case "LUNLUN":
                            item.character = "LunLun";
                            break;
                        case "LUCY":
                            item.character = "Lucy";
                            break;
                        case "SHUA":
                            item.character = "Shua";
                            break;
                        case "DHANPIR":
                            item.character = "Dhanpir";
                            break;
                        case "POCHI":
                            item.character = "Pochi";
                            break;
                        case "AL":
                            item.character = "Al";
                            break;
                        default:
                            console.warn(`Found unknown character "${value}"`);
                    }
                    break;
                case "Part":
                    switch (String(value)) {
                        case "BAG":
                            item.part = "Backpack";
                            break;
                        case "GLASSES":
                            item.part = "Face";
                            break;
                        case "HAND":
                            item.part = "Hand";
                            break;
                        case "SOCKS":
                            item.part = "Socks";
                            break;
                        case "FOOT":
                            item.part = "Shoes";
                            break;
                        case "CAP":
                            item.part = "Hat";
                            break;
                        case "PANTS":
                            item.part = "Lower";
                            break;
                        case "RACKET":
                            item.part = "Racket";
                            break;
                        case "BODY":
                            item.part = "Upper";
                            break;
                        case "HAIR":
                            item.part = "Hair";
                            break;
                        case "DYE":
                            item.part = "Dye";
                            break;
                        default:
                            console.warn(`Found unknown part ${value}`);
                    }
                    break;
                case "Level":
                    item.level = parseInt(value);
                    break;
                case "STR":
                    item.str = parseInt(value);
                    break;
                case "STA":
                    item.sta = parseInt(value);
                    break;
                case "DEX":
                    item.dex = parseInt(value);
                    break;
                case "WIL":
                    item.wil = parseInt(value);
                    break;
                case "AddHP":
                    item.hp = parseInt(value);
                    break;
                case "AddQuick":
                    item.quickslots = parseInt(value);
                    break;
                case "AddBuff":
                    item.buffslots = parseInt(value);
                    break;
                case "SmashSpeed":
                    item.smash = parseInt(value);
                    break;
                case "MoveSpeed":
                    item.movement = parseInt(value);
                    break;
                case "ChargeshotSpeed":
                    item.charge = parseInt(value);
                    break;
                case "LobSpeed":
                    item.lob = parseInt(value);
                    break;
                case "ServeSpeed":
                    item.serve = parseInt(value);
                    break;
                case "MAX_STR":
                    item.max_str = Math.max(parseInt(value), item.str);
                    break;
                case "MAX_STA":
                    item.max_sta = Math.max(parseInt(value), item.sta);
                    break;
                case "MAX_DEX":
                    item.max_dex = Math.max(parseInt(value), item.dex);
                    break;
                case "MAX_WIL":
                    item.max_wil = Math.max(parseInt(value), item.wil);
                    break;
                case "EnchantElement":
                    item.element_enchantable = !!parseInt(value);
                    break;
                case "EnableParcel":
                    item.parcel_enabled = !!parseInt(value);
                    break;
                case "BallSpin":
                    item.spin = parseInt(value);
                    break;
                case "ATSS":
                    item.atss = parseInt(value);
                    break;
                case "DFSS":
                    item.dfss = parseInt(value);
                    break;
                case "Socket":
                    item.socket = parseInt(value);
                    break;
                case "Gauge":
                    item.gauge = parseInt(value);
                    break;
                case "GaugeBattle":
                    item.gauge_battle = parseInt(value);
                    break;
                default:
                    console.warn(`Found unknown item attribute "${attribute}"`);
            }
        }
        items.set(item.id, item);
    }
}

class ApiItem {
    productIndex = 0;
    display = 0;
    hitDisplay = false;
    enabled = false;
    useType = "";
    use0 = 0;
    use1 = 0;
    use2 = 0;
    priceType = "GOLD";
    oldPrice0 = 0;
    oldPrice1 = 0;
    oldPrice2 = 0;
    price0 = 0;
    price1 = 0;
    price2 = 0;
    couplePrice = 0;
    category = "";
    name = "";
    goldBack = 0;
    enableParcel = false;
    forPlayer = 0;
    item0 = 0;
    item1 = 0;
    item2 = 0;
    item3 = 0;
    item4 = 0;
    item5 = 0;
    item6 = 0;
    item7 = 0;
    item8 = 0;
    item9 = 0;
}

function isApiItem(obj: any): obj is ApiItem {
    if (obj === null || typeof obj !== "object") {
        return false;
    }
    return [
        typeof obj.productIndex === "number",
        typeof obj.display === "number",
        typeof obj.hitDisplay === "boolean",
        typeof obj.enabled === "boolean",
        typeof obj.useType === "string",
        typeof obj.use0 === "number",
        typeof obj.use1 === "number",
        typeof obj.use2 === "number",
        typeof obj.priceType === "string",
        typeof obj.oldPrice0 === "number",
        typeof obj.oldPrice1 === "number",
        typeof obj.oldPrice2 === "number",
        typeof obj.price0 === "number",
        typeof obj.price1 === "number",
        typeof obj.price2 === "number",
        typeof obj.couplePrice === "number",
        typeof obj.category === "string",
        typeof obj.name === "string",
        typeof obj.goldBack === "number",
        typeof obj.enableParcel === "boolean",
        typeof obj.forPlayer === "number",
        typeof obj.item0 === "number",
        typeof obj.item1 === "number",
        typeof obj.item2 === "number",
        typeof obj.item3 === "number",
        typeof obj.item4 === "number",
        typeof obj.item5 === "number",
        typeof obj.item6 === "number",
        typeof obj.item7 === "number",
        typeof obj.item8 === "number",
        typeof obj.item9 === "number"
    ].every(b => b);
}

function parseApiShopData(data: string) {
    for (const apiItem of JSON.parse(data)) {
        if (!isApiItem(apiItem)) {
            console.error(`Incorrect format of item: ${data}`);
            continue;
        }

        const inner_items = [
            apiItem.item0,
            apiItem.item1,
            apiItem.item2,
            apiItem.item3,
            apiItem.item4,
            apiItem.item5,
            apiItem.item6,
            apiItem.item7,
            apiItem.item8,
            apiItem.item9,
        ].filter(id => !!id && items.get(id)).map(id => items.get(id)!);

        if (apiItem.category === "PARTS") {
            if (inner_items.length === 1) {
                shop_items.set(apiItem.productIndex, inner_items[0]);
            }
            else {
                const item = new Item();
                item.name_en = apiItem.name;
                shop_items.set(apiItem.productIndex, item);
            }
            if (apiItem.enabled) {
                const itemSource = new ShopItemSource(apiItem.productIndex, apiItem.price0, apiItem.priceType === "MINT", inner_items);
                for (const item of inner_items) {
                    item.sources.push(itemSource);
                }
            }
        }
        else if (apiItem.category === "LOTTERY") {
            gachas.set(apiItem.productIndex, new Gacha(apiItem.productIndex, apiItem.item0, apiItem.name));
            const gachaItem = new Item();
            gachaItem.name_en = apiItem.name;
            shop_items.set(apiItem.productIndex, gachaItem);
            if (apiItem.enabled) {
                gachaItem.sources.push(new ShopItemSource(apiItem.productIndex, apiItem.price0, apiItem.priceType === "MINT", inner_items));
            }
        }
        else {
            const otherItem = new Item();
            otherItem.name_en = apiItem.name;
            shop_items.set(apiItem.productIndex, otherItem);
        }

    }
}

function parseGachaData(data: string, gacha: Gacha) {
    for (const line of data.split("\n")) {
        if (!line.includes("<LotteryItem_")) {
            continue;
        }
        const match = line.match(/\s*<LotteryItem_(?<character>[^ ]*) Index="\d+" _Name_="[^"]*" ShopIndex="(?<shop_id>\d+)" QuantityMin="(?<quantity_min>\d+)" QuantityMax="(?<quantity_max>\d+)" ChansPer="(?<probability>\d+\.?\d*)\s*" Effect="\d+" ProductOpt="\d+"\/>/);
        if (!match) {
            console.warn(`Failed parsing gacha ${gacha.gacha_index}:\n${line}`);
            continue;
        }
        if (!match.groups) {
            continue;
        }
        let character = match.groups.character;
        if (character === "Lunlun") {
            character = "LunLun";
        }
        if (!isCharacter(character)) {
            console.warn(`Found unknown character "${character}" in lottery file ${gacha.gacha_index}`);
            continue;
        }
        const item = shop_items.get(parseInt(match.groups.shop_id));
        if (!item) {
            console.warn(`Found unknown shop item id ${match.groups.shop_id} in lottery file ${gacha.gacha_index}`);
            continue;
        }
        gacha.add(item, parseFloat(match.groups.probability), character, parseInt(match.groups.quantity_min), parseInt(match.groups.quantity_max));
    }
    for (const [, map] of gacha.shop_items) {
        for (const [item,] of map) {
            item.sources.push(new GachaItemSource(gacha.shop_index));
        }
    }
}

function parseGuardianData(data: string) {
    const guardianData = JSON.parse(data);
    if (!Array.isArray(guardianData)) {
        return;
    }
    function getNumber(o: any) {
        if (typeof o === "number") {
            return o;
        }
    }
    const bossTimeInfo = new Map<number, number>();
    for (const mapInfo of guardianData) {
        if (typeof mapInfo !== "object") {
            continue;
        }
        const map_name = mapInfo.Name;
        if (typeof map_name !== "string") {
            continue;
        }
        const rewards = Array.isArray(mapInfo.Rewards) ? [...mapInfo.Rewards] : [];
        const reward_items = rewards
            .filter((shop_id): shop_id is number => typeof shop_id === "number" && shop_items.has(shop_id))
            .map(shop_id => shop_items.get(shop_id)!);
        const ExpMultiplier = getNumber(mapInfo.ExpMultiplier) || 0;
        const IsBossStage = !!mapInfo.IsBossStage;
        const MapID = getNumber(mapInfo.MapId) || 0;
        let BossTriggerTimerInSeconds = getNumber(mapInfo.BossTriggerTimerInSeconds) || -1;
        if (BossTriggerTimerInSeconds === -1) {
            BossTriggerTimerInSeconds = bossTimeInfo.get(MapID) || -1;
        }
        else {
            if (MapID !== 0) {
                bossTimeInfo.set(MapID, BossTriggerTimerInSeconds);
            }
        }
        for (const item of reward_items) {
            const guardianSource = new GuardianItemSource(map_name, reward_items, ExpMultiplier, IsBossStage, BossTriggerTimerInSeconds);
            item.sources.push(guardianSource);
        }
    }
}

export async function download(url: string): Promise<string> {
    const filename = url.slice(url.lastIndexOf("/") + 1);
    const element = document.getElementById("loading");
    if (element instanceof HTMLElement) {
        element.textContent = `Loading ${filename}, please wait...`;
    }
    const reply = await fetch(url);
    const progressbar = document.getElementById("progressbar");
    if (progressbar instanceof HTMLProgressElement) {
        progressbar.value++;
    }
    if (!reply.ok) {
        throw new Error(
            `Failed downloading ${url}: ${reply.status}${reply.statusText ? ` ${reply.statusText}` : ""}`
        );
    }
    return reply.text();
}

export async function downloadItems() {
    const progressbar = document.getElementById("progressbar");
    if (progressbar instanceof HTMLProgressElement) {
        progressbar.value = 0;
        progressbar.max = 123;
    }
    const itemSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/auth-server/src/main/resources/res";
    const gachaSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/game-server/src/main/resources/res/lottery";
    const guardianSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/server-core/src/main/resources/res";
    const itemURL = itemSource + "/Item_Parts_Ini3.xml";
    const itemData = download(itemURL);
    const itemArtData = download("/assets/item-art-map.json");
    const max_shop_pages = 20; //currently need only 10, should be enough
    const shopURL = "/api/shop?size=1000&page=";
    const shopDatas = [...Array(max_shop_pages).keys()].map(n => download(`${shopURL}${n}`));
    const guardianURL = guardianSource + "/GuardianStages.json";
    const guardianData = download(guardianURL);
    parseItemData(await itemData);
    itemArtMap = JSON.parse(await itemArtData) as ItemArtMap;
    await Promise.all(shopDatas.map(p => p.then(data => parseApiShopData(data))));

    if (progressbar instanceof HTMLProgressElement) {
        progressbar.value = 0;
        progressbar.max = gachas.size + 3;
    }
    const gacha_items: [Promise<string>, Gacha, string][] = [];
    for (const [, gacha] of gachas) {
        const gacha_url = `${gachaSource}/Ini3_Lot_${`${gacha.gacha_index}`.padStart(2, "0")}.xml`;
        gacha_items.push([download(gacha_url), gacha, gacha_url]);
    }
    parseGuardianData(await guardianData);
    for (const [item, gacha, gacha_url] of gacha_items) {
        try {
            parseGachaData(await item, gacha);
        } catch (e) {
            console.warn(`Failed downloading ${gacha_url} because ${e}`);
        }
    }
}

function deletableItem(item: Item, character?: Character) {
    return createHTML([
        "div",
        { class: "item-identity" },
        createHTML([
            "button",
            {
                class: "item_removal",
                "data-item_index": `${item.id}`,
                "aria-label": `Exclude ${item.name_en} from results`,
                type: "button",
            },
            "Exclude",
        ]),
        createItemDetailsTrigger(item, character),
    ]);
}

function showDialog(
    trigger: HTMLButtonElement,
    label: string,
    content: HTMLElement | string | (HTMLElement | string)[],
    dialogClass?: string,
) {
    const topDiv = document.getElementById("top_div");
    if (!(topDiv instanceof HTMLDivElement)) {
        return;
    }
    if (dialog) {
        dialog.close();
        dialog.remove();
    }
    const closeButton = createHTML([
        "button",
        {
            class: dialogClass ? `${dialogClass}__close` : "dialog__close",
            type: "button",
        },
        "Close",
    ]);
    const attributes = {
        ...(dialogClass ? { class: dialogClass } : {}),
        "aria-label": label,
    };
    dialog = Array.isArray(content)
        ? createHTML(["dialog", attributes, ...content, closeButton])
        : createHTML(["dialog", attributes, content, closeButton]);
    trigger.setAttribute("aria-expanded", "true");
    closeButton.addEventListener("click", () => dialog?.close());
    dialog.addEventListener("close", () => {
        trigger.setAttribute("aria-expanded", "false");
        dialog?.remove();
        dialog = undefined;
        trigger.focus();
    }, { once: true });
    topDiv.appendChild(dialog);
    dialog.showModal();
}

export function createPopupLink(text: string, content: HTMLElement | string | (HTMLElement | string)[]) {
    const button = createHTML([
        "button",
        {
            class: "popup_link",
            type: "button",
            "aria-haspopup": "dialog",
            "aria-expanded": "false",
        },
        text,
    ]);
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        showDialog(button, `${text} details`, content);
    });
    return button;
}

function quantityString(quantity_min: number, quantity_max: number) {
    if (quantity_min === 1 && quantity_max === 1) {
        return "";
    }
    if (quantity_min === quantity_max) {
        return ` x ${quantity_max}`;
    }
    return ` x ${quantity_min}-${quantity_max}`;
}

function createGachaSourcePopup(item: Item | undefined, itemSource: ItemSource, character?: Character) {
    const content = character ? createHTML([
        "table",
        [
            "tr",
            ["th", "Item"],
            ["th", "Chance"],
            ["th", "Expected pulls"],
        ],
    ]) : createHTML([
        "table",
        [
            "tr",
            ["th", "Item"],
            ["th", "Character"],
            ["th", "Chance"],
            ["th", "Expected pulls"],
        ],
    ]);
    const gacha = gachas.get(itemSource.shop_id);
    if (!gacha) {
        throw "Internal error";
    }

    const gacha_items = new Map<Item, [number, number, number]>();
    for (const char of character === undefined ? characters : [character]) {
        const char_items = gacha.shop_items.get(char);
        if (!char_items) {
            continue;
        }
        for (const [char_gacha_item, [tickets, quantity_min, quantity_max]] of char_items) {
            const item_character = char_gacha_item.character || character;
            const item_tickets = item_character ? gacha.character_probability.get(item_character)! : gacha.total_probability;
            const probability = tickets / item_tickets;
            const previous_probability = gacha_items.get(char_gacha_item)?.[0] || 0;
            gacha_items.set(char_gacha_item, [previous_probability + probability, quantity_min, quantity_max]);
        }
    }

    for (const [char_gacha_item, [probability, quantity_min, quantity_max]] of gacha_items) {
        if (character) {
            content.appendChild(createHTML([
                "tr",
                item === char_gacha_item ? { class: "highlighted" } : "",
                ["td", char_gacha_item.name_en, quantityString(quantity_min, quantity_max)],
                ["td", { class: "numeric" }, `${prettyNumber(probability * 100, 2)}%`],
                ["td", { class: "numeric" }, `${prettyNumber(1 / probability, 2)}`],
            ]));
        }
        else {
            content.appendChild(createHTML([
                "tr",
                item === char_gacha_item ? { class: "highlighted" } : "",
                ["td", char_gacha_item.name_en, quantityString(quantity_min, quantity_max)],
                ["td", char_gacha_item.character || "*"],
                ["td", { class: "numeric" }, `${prettyNumber(probability * 100, 2)}%`],
                ["td", { class: "numeric" }, `${prettyNumber(1 / probability, 2)}`],
            ]));
        }
    }

    return createPopupLink(itemSource.item.name_en, [createHTML(["a", gacha.name]), content]);
}

function createSetSourcePopup(item: Item, itemSource: ShopItemSource) {
    const contentTable = createHTML(["table", ["tr", ["th", "Contents"]]]);
    for (const inner_item of itemSource.items) {
        contentTable.appendChild(createHTML(["tr", inner_item === item ? { class: "highlighted" } : "", ["td", inner_item.name_en]]));
    }
    return createPopupLink(itemSource.item.name_en, [createHTML(["a", itemSource.item.name_en, contentTable])]);
}

function prettyTime(seconds: number) {
    return `${Math.floor(seconds / 60)}:${`${seconds % 60}`.padStart(2, "0")}`;
}

function createGuardianPopup(item: Item, itemSource: GuardianItemSource) {
    const content = [
        `Guardian map ${itemSource.guardian_map}`,
        createHTML(
            [
                "ul", { class: "layout" },
                ["li", "Items:",
                    ["ul", { class: "layout" },
                        ...itemSource.items.reduce(
                            (curr, reward_item) =>
                                [...curr, createHTML(["li", { class: reward_item === item ? "highlighted" : "" }, reward_item.name_en])],
                            [] as (HTMLElement | string)[]
                        ),
                    ],
                ],
                ["li", `Requires boss: ${itemSource.need_boss ? "Yes" : "No"}`],
                ...(itemSource.boss_time > 0 ? [createHTML(["li", `Boss time: ${prettyTime(itemSource.boss_time)}`])] : []),
                ["li", `EXP multiplier: ${itemSource.xp}`],
            ]
        )
    ];
    return createPopupLink(itemSource.guardian_map, content);
}

function itemSourcesToElementArray(
    item: Item,
    sourceFilter: (itemSource: ItemSource) => boolean,
    character?: Character) {
    return [...item.sources.values()]
        .filter(sourceFilter)
        .map(itemSource => sourceItemElement(item, itemSource, sourceFilter, character));
}

function makeSourcesList(list: (HTMLElement | string)[][]): (HTMLElement | string)[] {
    const result: (HTMLElement | string)[] = [];
    function add(element: HTMLElement | string) {
        if (typeof element === "string" && typeof result[result.length - 1] === "string") {
            result[result.length - 1] = result[result.length - 1] + element;
            return;
        }
        result.push(element);
    }
    let first = true;
    for (const elements of list) {
        if (elements.length === 0) {
            add(" ");
            continue;
        }
        if (!first) {
            add(", ");
        }
        else {
            first = false;
        }
        for (const element of elements) {
            if (element === "") {
                continue;
            }
            add(element);
        }
    }
    return result;
}

function createGachaSourceSummary(
    item: Item,
    itemSource: GachaItemSource,
    sourceFilter: (itemSource: ItemSource) => boolean,
    character?: Character,
) {
    const gacha = gachas.get(itemSource.shop_id);
    if (!gacha) {
        throw "Internal error";
    }
    const directSource = itemSource.item.sources.find(
        (source): source is ShopItemSource => source instanceof ShopItemSource,
    );
    const alternativeSources = itemSourcesToElementArray(
        itemSource.item,
        source => source !== directSource && sourceFilter(source),
        itemSource.requiresGuardian ? undefined : character,
    );
    const alternativeList = makeSourcesList(alternativeSources);

    return createHTML([
        "div",
        {
            class: "gacha-source-summary",
            role: "group",
            "aria-label": `${gacha.name} acquisition`,
        },
        createGachaCoinArt(gacha),
        [
            "div",
            { class: "gacha-source-summary__content" },
            [
                "div",
                { class: "gacha-identity" },
                createGachaSourcePopup(
                    item,
                    itemSource,
                    itemSource.requiresGuardian ? undefined : character,
                ),
            ],
            ...(alternativeList.length > 0
                ? [createHTML([
                "div",
                { class: "gacha-alternatives" },
                ["span", { class: "gacha-alternatives__label" }, "Alternative"],
                ...alternativeList,
            ])]
                : []),
        ],
    ]);
}

function sourceItemElement(item: Item, itemSource: ItemSource, sourceFilter: (itemSource: ItemSource) => boolean, character?: Character): (HTMLElement | string)[] {
    if (itemSource instanceof GachaItemSource) {
        return [createGachaSourceSummary(item, itemSource, sourceFilter, character)];
    }
    else if (itemSource instanceof ShopItemSource) {
        if (itemSource.items.length === 1) {
            return [`${itemSource.price} ${itemSource.ap ? "AP" : "Gold"}`];
        }
        return [
            createSetSourcePopup(item, itemSource),
            ` ${itemSource.price} ${itemSource.ap ? "AP" : "Gold"}`
        ];
    }
    else if (itemSource instanceof GuardianItemSource) {
        return [createGuardianPopup(item, itemSource)];
    }
    else {
        throw "Internal error";
    }
}

function itemDetailStats(item: Item) {
    return [
        ["Movement", item.movement],
        ["Charge", item.charge],
        ["Lob", item.lob],
        ["Smash", item.smash],
        ["Strength", item.str],
        ["Dexterity", item.dex],
        ["Stamina", item.sta],
        ["Will", item.wil],
        ["Serve", item.serve],
        ["HP", item.hp],
        ["Quickslots", item.quickslots],
        ["Buffslots", item.buffslots],
    ] as const;
}

function createItemDetailsContent(item: Item, character?: Character) {
    const stats = itemDetailStats(item).filter(([, value]) => value !== 0);
    const sources = makeSourcesList(
        itemSourcesToElementArray(item, () => true, character),
    );
    return createHTML([
        "div",
        { class: "item-details" },
        [
            "header",
            { class: "item-details__header" },
            createItemArt(item, 72, "item-details__art"),
            [
                "div",
                ["span", { class: "item-details__eyebrow" }, "Equipment details"],
                ["h2", item.name_en],
                [
                    "p",
                    { class: "item-details__meta" },
                    `${character ?? item.character ?? "All characters"} · ${item.part} · Level ${item.level}`,
                ],
            ],
        ],
        [
            "section",
            { class: "item-details__section", "aria-labelledby": "item-details-stats" },
            ["h3", { id: "item-details-stats" }, "Stats"],
            stats.length > 0
                ? createHTML([
                    "dl",
                    { class: "item-details__stats" },
                    ...stats.map(([label, value]) => createHTML([
                        "div",
                        ["dt", label],
                        ["dd", `${value}`],
                    ])),
                ])
                : createHTML(["p", { class: "item-details__empty" }, "No stat bonuses"]),
        ],
        [
            "section",
            { class: "item-details__section", "aria-labelledby": "item-details-sources" },
            ["h3", { id: "item-details-sources" }, "How to get it"],
            sources.length > 0
                ? createHTML(["div", { class: "item-details__sources" }, ...sources])
                : createHTML([
                    "p",
                    { class: "item-details__empty" },
                    "No active acquisition source found.",
                ]),
        ],
    ]);
}

function createItemDetailsTrigger(item: Item, character?: Character) {
    const button = createHTML([
        "button",
        {
            class: "item-details-trigger",
            type: "button",
            "aria-haspopup": "dialog",
            "aria-expanded": "false",
            "aria-label": `View details for ${item.name_en}`,
        },
        item.name_en,
    ]);
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        showDialog(
            button,
            `${item.name_en} item details`,
            createItemDetailsContent(item, character),
            "item-details-dialog",
        );
    });
    return button;
}

function createItemArtFallback(item: Item) {
    return createHTML([
        "span",
        {
            class: "item-art-fallback",
            role: "img",
            "aria-label": `Official item art unavailable for ${item.name_en}`,
        },
        ["span", { class: "item-art-fallback__code", "aria-hidden": "true" }, item.part || "Item"],
        ["span", { "aria-hidden": "true" }, "Official art unavailable"],
    ]);
}

function createSpriteArt(
    sheet: string,
    cell: number,
    label: string,
    className: string,
    displaySize = 40,
) {
    const geometry = itemArtMap.sheets[sheet];
    if (!geometry) {
        return;
    }
    const column = cell % geometry.lineCount;
    const row = Math.floor(cell / geometry.lineCount);
    const scale = displaySize / geometry.size;
    const imageSize = geometry.width * scale;
    const offsetX = -(geometry.space + column * (geometry.size + geometry.space)) * scale;
    const offsetY = -(geometry.space + row * (geometry.size + geometry.space)) * scale;
    return createHTML([
        "span",
        {
            class: className,
            role: "img",
            "aria-label": label,
            style: [
                `--item-art-image:url("/assets/item-art/${encodeURIComponent(sheet)}.webp")`,
                `--item-art-size:${imageSize}px`,
                `--item-art-x:${offsetX}px`,
                `--item-art-y:${offsetY}px`,
            ].join(";"),
        },
    ]);
}

function createItemArt(
    item: Item,
    displaySize = 40,
    className = "item-art-thumbnail",
) {
    const art = itemArtMap.items[`${item.id}`];
    if (!art) {
        return createItemArtFallback(item);
    }
    return createSpriteArt(
        art[0],
        art[1],
        `Official item art for ${item.name_en}`,
        className,
        displaySize,
    ) ?? createItemArtFallback(item);
}

function createGachaCoinArt(gacha: Gacha) {
    const art = itemArtMap.lotteries[`${gacha.gacha_index}`];
    const fallback = () => createHTML([
            "span",
            {
                class: "gacha-coin-art gacha-coin-art--unavailable",
                role: "img",
                "aria-label": `Coin artwork unavailable for ${gacha.name}`,
            },
            "?",
        ]);
    if (!art) {
        return fallback();
    }
    return createSpriteArt(
        art.sheet,
        art.cell,
        `${gacha.name} coin artwork`,
        "gacha-coin-art",
    ) ?? fallback();
}

function itemToTableRow(item: Item, sourceFilter: (itemSource: ItemSource) => boolean, priorityStats: string[], character?: Character): HTMLTableRowElement {
    const row = createHTML(
        ["tr", { class: "result-row" },
            ["td", { class: "Name_column result-summary", "data-label": "Item" }, deletableItem(item, character)],
            ["td", { class: "Art_column", "data-label": "Art" }, createItemArt(item)],
            ["td", { class: "Character_column", "data-label": "Character" }, item.character ?? "All"],
            ["td", { class: "Part_column", "data-label": "Part" }, item.part],
            ...priorityStats.map(stat => {
                const value = stat.split("+").map(s => item.statFromString(s)).join("+");
                return createHTML(["td", { class: "numeric", "data-label": stat, "data-value": value }, value]);
            }),
            ["td", { class: "Level_column numeric", "data-label": "Level", "data-value": `${item.level}` }, `${item.level}`],
            ["td", { class: "Source_column", "data-label": "Source" }, ...makeSourcesList(itemSourcesToElementArray(item, sourceFilter, character))],
        ]
    );
    return row;
}

export function getGachaTable(filter: (item: Item) => boolean, char?: Character): HTMLTableElement {
    const table = createHTML(
        ["table",
            ["tr",
                ["th", { class: "Name_column" }, "Name"],
            ]
        ]
    );
    for (const [, gacha] of gachas) {
        const gachaItem = shop_items.get(gacha.shop_index);
        if (!gachaItem) {
            throw "Internal error";
        }
        if (filter(gachaItem)) {
            table.appendChild(createHTML(["tr", ["td", createGachaSourcePopup(undefined, new ItemSource(gacha.shop_index), char)]]));
        }
    }
    return table;
}

export function getResultsTable(
    filter: (item: Item) => boolean,
    sourceFilter: (itemSource: ItemSource) => boolean,
    priorizer: (items: Item[], item: Item) => Item[],
    priorityStats: string[],
    character?: Character): HTMLTableElement {
    const results: { [key: string]: Item[] } = {
        "Hat": [],
        "Hair": [],
        "Dye": [],
        "Upper": [],
        "Lower": [],
        "Shoes": [],
        "Socks": [],
        "Hand": [],
        "Backpack": [],
        "Face": [],
        "Racket": [],
    };

    for (const [, item] of items) {
        if (filter(item)) {
            results[item.part] = priorizer(results[item.part], item);
        }
    }

    const table = createHTML(
        ["table",
            ["caption", "Matching equipment by slot and selected stat priority"],
            ["thead",
                ["tr",
                    ["th", { class: "Name_column", scope: "col" }, "Item"],
                    ["th", { class: "Art_column", scope: "col" }, "Art"],
                    ["th", { class: "Character_column", scope: "col" }, "Character"],
                    ["th", { class: "Part_column", scope: "col" }, "Part"],
                    ...priorityStats.map(stat => createHTML(["th", { class: "numeric", scope: "col" }, stat])),
                    ["th", { class: "Level_column numeric", scope: "col" }, "Level"],
                    ["th", { class: "Source_column", scope: "col" }, "Source"],
                ],
            ],
            ["tbody"],
        ]
    );
    const tableBody = table.tBodies[0];
    if (!tableBody) {
        throw "Internal error";
    }

    type MapOptions = { [key: string]: number[] };

    type Cost = {
        gold: number,
        ap: number,
        maps: MapOptions,
    };

    function combineMaps(m1: MapOptions, m2: MapOptions): MapOptions {
        const result = { ...m1 };
        for (const [map, tries] of Object.entries(m2)) {
            if (result[map]) {
                result[map] = result[map].concat(tries);
            }
            else {
                result[map] = tries;
            }
        }
        return result;
    }

    function combineCosts(cost1: Cost, cost2: Cost): Cost {
        return {
            gold: cost1.gold + cost2.gold,
            ap: cost1.ap + cost2.ap,
            maps: combineMaps(cost1.maps, cost2.maps),
        };
    }

    function minMap(m1: MapOptions, m2: MapOptions): MapOptions {
        const result = { ...m1 };
        for (const [map, tries] of Object.entries(m2)) {
            if (tries.length !== 1) {
                throw "Internal error";
            }
            if (result[map]) {
                result[map] = [Math.min(result[map][0], tries[0])];
            }
            else {
                result[map] = tries;
            }
        }
        return result;
    }

    function minCost(cost1: Cost, cost2: Cost): Cost {
        // Lexicographic on (ap, gold): lower AP wins, then lower Gold.
        // Numeric compare only — do not use JS array/string ordering.
        const pickCost1 =
            cost1.ap < cost2.ap ||
            (cost1.ap === cost2.ap && cost1.gold < cost2.gold);
        return pickCost1 ?
            {
                gold: cost1.gold,
                ap: cost1.ap,
                maps: minMap(cost1.maps, cost2.maps),
            } :
            {
                gold: cost2.gold,
                ap: cost2.ap,
                maps: minMap(cost1.maps, cost2.maps),
            };
    }

    function costOf(item: Item, character?: Character): Cost {
        const sourceCosts = [...item.sources.values()]
            .filter(sourceFilter)
            .map((itemSource) => {
                if (itemSource instanceof ShopItemSource) {
                    if (itemSource.ap) {
                        return { gold: 0, ap: itemSource.price, maps: {} };
                    }
                    return { gold: itemSource.price, ap: 0, maps: {} };
                }
                else if (itemSource instanceof GachaItemSource) {
                    const singleCost = costOf(itemSource.item, character);
                    const multiplier = itemSource.gachaTries(item, character);
                    return {
                        gold: singleCost.gold * multiplier,
                        ap: singleCost.ap * multiplier,
                        maps: Object.fromEntries(
                            Object.entries(singleCost.maps)
                                .map(([map, tries]) => [map, tries.map(n => n * multiplier)])
                        )
                    };
                }
                else if (itemSource instanceof GuardianItemSource) {
                    return {
                        gold: 0,
                        ap: 0,
                        maps: Object.fromEntries([[itemSource.guardian_map, [itemSource.items.length]]])
                    };
                }
                else {
                    throw "Internal error";
                }
            });
        if (sourceCosts.length === 0) {
            return { gold: 0, ap: 0, maps: {} };
        }
        // Seed with the first real source cost. A {0,0} identity would always win
        // under a correct min, and the old always-last bug hid that.
        return sourceCosts.reduce((curr, cost) => minCost(curr, cost));
    }

    const priorityStatistics: Record<string, number> = Object.fromEntries(priorityStats.map(stat => [stat, 0]));
    const statistics = {
        characters: new Set<Character>,
        Level: 0,
        cost: { ap: 0, gold: 0, maps: {} } as Cost,
    };

    for (const result of Object.values(results)) {
        if (result.length === 0) {
            continue;
        }

        for (const stat of priorityStats) {
            if (typeof priorityStatistics[stat] !== "number") {
                continue;
            }
            const value = stat.split("+").reduce((curr, statName) => curr + result[0].statFromString(statName), 0);
            priorityStatistics[stat] += value;
        }

        statistics.Level = Math.max(result[0].level, statistics.Level);

        for (const item of result) {
            for (const char of item.character ? [item.character] : characters) {
                statistics.characters.add(char)
                tableBody.appendChild(itemToTableRow(item, sourceFilter, priorityStats, char));
            }
        }
        // Footer cost must match stats/level: best candidate per slot only.
        // The body still renders the full ranked list above.
        statistics.cost = combineCosts(
            costOf(result[0], character && isCharacter(character) ? character : undefined),
            statistics.cost,
        );
    }

    if (statistics.characters.size === 1) {
        const total_sources: string[] = [];
        if (statistics.cost.gold > 0) {
            total_sources.push(`${statistics.cost.gold.toFixed(0)} Gold`);
        }
        if (statistics.cost.ap > 0) {
            total_sources.push(`${statistics.cost.ap.toFixed(0)} AP`);
        }
        //statistics['Guardian games'].forEach((count, map) => total_sources.push(`${count.toFixed(0)} x ${map}`));
        table.appendChild(createHTML([
            "tfoot",
            ["tr",
                ["td", { class: "total Name_column" }, "Total:"],
                ["td", { class: "total Art_column" }],
                ["td", { class: "total Character_column" }],
                ["td", { class: "total Part_column" }],
                ...priorityStats.map(stat => createHTML(["td", { class: "total numeric" },
                    `${priorityStatistics[stat]}`
                ])),
                ["td", { class: "total Level_column numeric" }, `${statistics.Level}`],
                ["td", { class: "total Source_column" }, total_sources.join(", ")],
            ],
        ]));
        for (const column_element of table.getElementsByClassName(`Character_column`)) {
            if (!(column_element instanceof HTMLElement)) {
                continue;
            }
            column_element.hidden = true;
        }
    }

    for (const attribute of priorityStats) {
        if (priorityStatistics[attribute] === 0) {
            for (const column_element of table.getElementsByClassName(`${attribute}_column`)) {
                if (!(column_element instanceof HTMLElement)) {
                    continue;
                }
                column_element.hidden = true;
            }
        }
    }
    return table;
}

export function getMaxItemLevel() {
    //no reduce for Map?
    let max = 0;
    for (const [, item] of items) {
        max = Math.max(max, item.level);
    }
    return max;
}

document.body.addEventListener('click', (event) => {
    if (dialog && dialog === event.target) {
        dialog.close();
    }
});
