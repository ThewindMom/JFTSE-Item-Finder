import {
    characters,
    type Character,
    type Part,
} from "./itemTypes";
export {
    characters,
    isCharacter,
    type Character,
    type Part,
} from "./itemTypes";

export class ItemSource {
    constructor(readonly shop_id: number) {}

    get requiresGuardian(): boolean {
        if (this instanceof ShopItemSource) {
            return false;
        }
        if (this instanceof GachaItemSource) {
            return [...this.item.sources].every(source => source.requiresGuardian);
        }
        if (this instanceof GuardianItemSource) {
            return true;
        }
        throw new Error("Unknown item source");
    }

    get item(): Item {
        const item = shop_items.get(this.shop_id);
        if (!item) {
            throw new Error(`Item source ${this.shop_id} has no catalog item`);
        }
        return item;
    }
}

export class ShopItemSource extends ItemSource {
    constructor(
        shop_id: number,
        readonly price: number,
        readonly ap: boolean,
        readonly items: Item[],
    ) {
        super(shop_id);
    }
}

export class GachaItemSource extends ItemSource {
    gachaTries(item: Item, character?: Character): number {
        const gacha = gachas.get(this.shop_id);
        if (!gacha) {
            throw new Error(`Gacha source ${this.shop_id} has no catalog gacha`);
        }
        return gacha.average_tries(item, character);
    }
}

export class GuardianItemSource extends ItemSource {
    private static guardianMaps = [""];

    constructor(
        readonly guardian_map: string,
        readonly items: Item[],
        readonly xp: number,
        readonly need_boss: boolean,
        readonly boss_time: number,
    ) {
        super(GuardianItemSource.guardianMapId(guardian_map));
    }

    private static guardianMapId(map: string): number {
        let index = this.guardianMaps.indexOf(map);
        if (index === -1) {
            index = this.guardianMaps.length;
            this.guardianMaps.push(map);
        }
        return -index;
    }
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
                throw new Error(`Unknown item stat: ${name}`);
        }
    }
}

type GachaDrop = [
    probability: number,
    quantityMin: number,
    quantityMax: number,
];

export class Gacha {
    readonly character_probability = new Map<Character, number>();
    readonly shop_items = new Map<Character, Map<Item, GachaDrop>>();

    constructor(
        readonly shop_index: number,
        readonly gacha_index: number,
        readonly name: string,
        readonly price = 0,
        readonly ap = false,
        readonly enabled = false,
        readonly purchasable = true,
    ) {
        for (const character of characters) {
            this.shop_items.set(character, new Map());
        }
    }

    add(
        item: Item,
        probability: number,
        character: Character,
        quantityMin: number,
        quantityMax: number,
    ): void {
        const owner = item.character ?? character;
        const map = this.shop_items.get(owner);
        if (!map) {
            throw new Error(`Unknown gacha character: ${owner}`);
        }
        const previous = map.get(item);
        map.set(item, previous
            ? [
                previous[0] + probability,
                Math.min(previous[1], quantityMin),
                Math.max(previous[2], quantityMax),
            ]
            : [probability, quantityMin, quantityMax]);
        this.character_probability.set(
            owner,
            probability + (this.character_probability.get(owner) ?? 0),
        );
    }

    average_tries(item: Item, character?: Character): number {
        const selected: readonly Character[] = character
            ? [character]
            : characters;
        const probability = selected.reduce(
            (sum, owner) => sum + (this.shop_items.get(owner)?.get(item)?.[0] ?? 0),
            0,
        );
        if (probability === 0) {
            return 0;
        }
        const total = selected.reduce(
            (sum, owner) => sum + (this.character_probability.get(owner) ?? 0),
            0,
        );
        return total / probability;
    }

    get total_probability(): number {
        return characters.reduce(
            (sum, character) =>
                sum + (this.character_probability.get(character) ?? 0),
            0,
        );
    }
}

export type ItemDomainState = {
    readonly items: Map<number, Item>;
    readonly shopItems: Map<number, Item>;
    readonly gachas: Map<number, Gacha>;
};

export let items = new Map<number, Item>();
export let shop_items = new Map<number, Item>();
export let gachas = new Map<number, Gacha>();

export function installItemDomainState(state: ItemDomainState): void {
    items = state.items;
    shop_items = state.shopItems;
    gachas = state.gachas;
}
