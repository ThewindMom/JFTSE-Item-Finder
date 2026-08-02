/**
 * Pure projection of how a gacha coin can be acquired.
 * Shop denomination (Gold/AP) is separate from Guardian/Boss stage drops.
 */

export type GachaShopChannel = {
    readonly kind: "shop";
    readonly currency: "Gold" | "AP";
    readonly available: boolean;
    /** Why shop is unavailable when available=false. */
    readonly reason?: "not_for_sale" | "not_available";
};

export type GachaStageChannel = {
    readonly kind: "stage";
    readonly map: string;
    readonly needBoss: boolean;
    readonly label: string;
};

export type GachaAcquisitionChannel = GachaShopChannel | GachaStageChannel;

export type GachaAcquisitionInput = {
    readonly ap: boolean;
    /** Product is listed in the live shop catalog (enabled). */
    readonly enabled: boolean;
    /**
     * True only when the product can actually be purchased.
     * JFTSE `Nobuy=1` products stay enabled in catalog but reject shop buys.
     */
    readonly purchasable: boolean;
};

export type GachaSourceInput =
    | { readonly kind: "shop"; readonly ap: boolean }
    | { readonly kind: "stage"; readonly map: string; readonly needBoss: boolean };

/** Split CamelCase stage ids from JFTSE GuardianStages.json into readable labels. */
export function prettyGuardianMapName(map: string): string {
    return map
        .replace(/([a-z\d])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .trim();
}

export function stageChannelLabel(map: string, needBoss: boolean): string {
    const pretty = prettyGuardianMapName(map);
    if (!needBoss) {
        return pretty;
    }
    // Avoid "Boss · Atlantis Boss" — stage ids end in Boss already.
    const withoutBossSuffix = pretty.replace(/\s+Boss$/i, "");
    return `Boss · ${withoutBossSuffix}`;
}

/**
 * Project shop + stage acquisition channels for a gacha coin.
 *
 * - Purchasable shop → Gold/AP pill.
 * - Catalog-listed but Nobuy (`purchasable=false`, `enabled=true`) → Not for sale
 *   (still shown when stages exist so players do not assume a price).
 * - Fully disabled shop with no stages → Not available.
 * - Disabled shop with stages → stages only (omit shop chrome).
 */
export function projectGachaAcquisitionChannels(
    gacha: GachaAcquisitionInput,
    sources: readonly GachaSourceInput[],
): readonly GachaAcquisitionChannel[] {
    const channels: GachaAcquisitionChannel[] = [];
    const stageSources = sources.filter(
        (source): source is Extract<GachaSourceInput, { kind: "stage" }> =>
            source.kind === "stage",
    );
    const hasStage = stageSources.length > 0;
    const currency = gacha.ap ? "AP" : "Gold";

    if (gacha.purchasable) {
        channels.push({
            kind: "shop",
            currency,
            available: true,
        });
    } else if (gacha.enabled) {
        // Listed in shop UI / API but blocked by Nobuy — never imply a buy path.
        channels.push({
            kind: "shop",
            currency,
            available: false,
            reason: "not_for_sale",
        });
    } else if (!hasStage) {
        channels.push({
            kind: "shop",
            currency,
            available: false,
            reason: "not_available",
        });
    }

    const seenMaps = new Set<string>();
    for (const stage of stageSources) {
        if (seenMaps.has(stage.map)) {
            continue;
        }
        seenMaps.add(stage.map);
        channels.push({
            kind: "stage",
            map: stage.map,
            needBoss: stage.needBoss,
            label: stageChannelLabel(stage.map, stage.needBoss),
        });
    }

    return channels;
}

/** Parse product indexes with Nobuy≠0 from JFTSE Shop_Ini3.xml text. */
export function parseShopNobuyProductIndexes(shopXml: string): ReadonlySet<number> {
    const nobuy = new Set<number>();
    for (const match of shopXml.matchAll(/<Product\s+([^>]+?)\/?>/g)) {
        const attrs = match[1] ?? "";
        const indexMatch = attrs.match(/\bIndex="(\d+)"/);
        const nobuyMatch = attrs.match(/\bNobuy="(\d+)"/);
        if (!indexMatch || !nobuyMatch) {
            continue;
        }
        if (nobuyMatch[1] !== "0") {
            nobuy.add(Number(indexMatch[1]));
        }
    }
    return nobuy;
}
