import type {
    CatalogCharacter,
    CatalogGacha,
    CatalogItem,
    CatalogPart,
    CatalogStageSource,
} from "../catalogTypes";
const characterMap: Readonly<Record<string, CatalogCharacter>> = {
    NIKI: "Niki",
    LUNLUN: "LunLun",
    LUCY: "Lucy",
    SHUA: "Shua",
    DHANPIR: "Dhanpir",
    POCHI: "Pochi",
    AL: "Al",
};
const partMap: Readonly<Record<string, CatalogPart>> = {
    BAG: "Backpack",
    GLASSES: "Face",
    HAND: "Hand",
    SOCKS: "Socks",
    FOOT: "Shoes",
    CAP: "Hat",
    PANTS: "Lower",
    RACKET: "Racket",
    BODY: "Upper",
    HAIR: "Hair",
    DYE: "Dye",
};
function attributes(source: string): Record<string, string> {
    return Object.fromEntries(
        [...source.matchAll(/\s?([^=\s]+)="([^"]*)"/g)]
            .map(([, key, value]) => [key, value]),
    );
}
function numeric(values: Record<string, string>, key: string): number {
    const value = Number(values[key] ?? 0);
    if (!Number.isFinite(value)) {
        throw new Error(`Invalid numeric ${key}`);
    }
    return value;
}
export function parseCatalogItems(xml: string): CatalogItem[] {
    const result: CatalogItem[] = [];
    for (const match of xml.matchAll(/<Item (.*?)\/>/g)) {
        const value = attributes(match[1]);
        const str = numeric(value, "STR");
        const sta = numeric(value, "STA");
        const dex = numeric(value, "DEX");
        const wil = numeric(value, "WIL");
        result.push({
            id: numeric(value, "Index"),
            name_kr: value._Name_ ?? "",
            name_en: value.Name_N ?? "",
            useType: value.UseType ?? "",
            maxUse: numeric(value, "MaxUse"),
            hidden: numeric(value, "Hide") !== 0,
            resist: value.Resist ?? "",
            character: characterMap[value.Char] ?? null,
            part: partMap[value.Part] ?? "Other",
            level: numeric(value, "Level"),
            str,
            sta,
            dex,
            wil,
            hp: numeric(value, "AddHP"),
            quickslots: numeric(value, "AddQuick"),
            buffslots: numeric(value, "AddBuff"),
            smash: numeric(value, "SmashSpeed"),
            movement: numeric(value, "MoveSpeed"),
            charge: numeric(value, "ChargeshotSpeed"),
            lob: numeric(value, "LobSpeed"),
            serve: numeric(value, "ServeSpeed"),
            max_str: Math.max(numeric(value, "MAX_STR"), str),
            max_sta: Math.max(numeric(value, "MAX_STA"), sta),
            max_dex: Math.max(numeric(value, "MAX_DEX"), dex),
            max_wil: Math.max(numeric(value, "MAX_WIL"), wil),
            element_enchantable: numeric(value, "EnchantElement") !== 0,
            parcel_enabled: numeric(value, "EnableParcel") !== 0,
            spin: numeric(value, "BallSpin"),
            atss: numeric(value, "ATSS"),
            dfss: numeric(value, "DFSS"),
            socket: numeric(value, "Socket"),
            gauge: numeric(value, "Gauge"),
            gauge_battle: numeric(value, "GaugeBattle"),
        });
    }
    return result.sort((lhs, rhs) => lhs.id - rhs.id);
}
function object(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Invalid ${label}`);
    }
    return value as Record<string, unknown>;
}
export function parseCatalogGacha(
    productIndex: number,
    xml: string,
    productIds: ReadonlySet<number>,
): CatalogGacha {
    const drops: CatalogGacha["drops"] = [];
    for (const line of xml.split("\n")) {
        if (!line.includes("<LotteryItem_")) {
            continue;
        }
        const match = line.match(
            /\s*<LotteryItem_(?<character>[^ ]*) Index="\d+" _Name_="[^"]*" ShopIndex="(?<shop>\d+)" QuantityMin="(?<min>\d+)" QuantityMax="(?<max>\d+)" ChansPer="(?<probability>\d+\.?\d*)\s*"/,
        );
        const groups = match?.groups;
        const character = groups?.character === "Lunlun"
            ? "LunLun"
            : groups?.character;
        const shopProductIndex = Number(groups?.shop);
        if (!groups
            || !character
            || !Object.values(characterMap).includes(character as CatalogCharacter)
            || !productIds.has(shopProductIndex)) {
            continue;
        }
        const firstQuantity = Number(groups.min);
        const secondQuantity = Number(groups.max);
        drops.push({
            character: character as CatalogCharacter,
            shopProductIndex,
            probability: Number(groups.probability),
            quantityMin: Math.min(firstQuantity, secondQuantity),
            quantityMax: Math.max(firstQuantity, secondQuantity),
        });
    }
    return { productIndex, drops };
}
export function parseCatalogStages(
    guardianInput: unknown,
    supplementalInput: unknown,
    productIds: ReadonlySet<number>,
): CatalogStageSource[] {
    if (!Array.isArray(guardianInput)) {
        throw new Error("Invalid GuardianStages data");
    }
    const result: CatalogStageSource[] = [];
    const bossTimes = new Map<number, number>();
    for (const input of guardianInput) {
        const value = object(input, "Guardian stage");
        const map = typeof value.Name === "string" ? value.Name : "";
        const rewards = Array.isArray(value.Rewards)
            ? value.Rewards.filter((id): id is number =>
                typeof id === "number" && productIds.has(id)
            )
            : [];
        const mapId = typeof value.MapId === "number" ? value.MapId : 0;
        let bossTime = typeof value.BossTriggerTimerInSeconds === "number"
            ? value.BossTriggerTimerInSeconds
            : -1;
        if (bossTime === -1) {
            bossTime = bossTimes.get(mapId) ?? -1;
        }
        else if (mapId !== 0) {
            bossTimes.set(mapId, bossTime);
        }
        for (const attachedProductIndex of rewards) {
            result.push({
                attachedProductIndex,
                rewardProductIndexes: rewards,
                map,
                xp: typeof value.ExpMultiplier === "number" ? value.ExpMultiplier : 0,
                needBoss: value.IsBossStage === true,
                bossTime,
            });
        }
    }

    const supplemental = object(supplementalInput, "product stage drops");
    const products = object(supplemental.products ?? {}, "product stage products");
    const seen = new Set(result.map(source =>
        `${source.attachedProductIndex}\0${source.map}`
    ));
    for (const [key, input] of Object.entries(products)) {
        const attachedProductIndex = Number(key);
        if (!productIds.has(attachedProductIndex) || !Array.isArray(input)) {
            continue;
        }
        for (const dropInput of input) {
            const drop = object(dropInput, "product stage drop");
            const map = typeof drop.map === "string" ? drop.map : "";
            const identity = `${attachedProductIndex}\0${map}`;
            if (!map || seen.has(identity)) {
                continue;
            }
            seen.add(identity);
            result.push({
                attachedProductIndex,
                rewardProductIndexes: [attachedProductIndex],
                map,
                xp: typeof drop.xp === "number" ? drop.xp : 0,
                needBoss: drop.needBoss === true,
                bossTime: typeof drop.bossTime === "number" ? drop.bossTime : -1,
            });
        }
    }
    return result.sort((lhs, rhs) =>
        lhs.attachedProductIndex - rhs.attachedProductIndex
        || lhs.map.localeCompare(rhs.map)
    );
}
