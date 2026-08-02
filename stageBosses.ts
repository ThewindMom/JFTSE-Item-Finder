/**
 * Resolve which boss guardian(s) appear on a Guardian / Boss stage.
 * Data comes from JFTSE GuardianStages.json (BossGuardian + side pools)
 * and BossGuardianInfo_Ini3.xml / GuardianInfo.xml names.
 */

export type StageBossInfo = {
    readonly id: number;
    readonly name: string;
    readonly resId?: number;
    readonly level?: number;
    readonly hpBase?: number;
};

export type StageGuardianInfo = {
    readonly id: number;
    readonly name: string;
};

export type StageBossSidePools = {
    readonly left: readonly number[];
    readonly middle: readonly number[];
    readonly right: readonly number[];
};

export type StageBossStageEntry = {
    readonly name: string;
    readonly mapId?: number | null;
    readonly isBossStage: boolean;
    readonly bossIds: readonly number[];
    readonly sideGuardianIds?: StageBossSidePools;
    readonly expMultiplier?: number | null;
    readonly bossTriggerTimerInSeconds?: number | null;
};

export type StageBossCatalog = {
    readonly bosses?: Readonly<Record<string, StageBossInfo>>;
    readonly guardians?: Readonly<Record<string, StageGuardianInfo>>;
    readonly stages?: Readonly<Record<string, StageBossStageEntry>>;
    readonly byMapId?: Readonly<Record<string, readonly string[]>>;
};

export type StageBossProjection = {
    readonly stageName: string;
    readonly mapId?: number;
    readonly isBossStage: boolean;
    /** Primary boss guardians for this stage (unique by id). */
    readonly bosses: readonly StageBossInfo[];
    /** Unique boss display names (deduped, order-preserving). */
    readonly bossNames: readonly string[];
    /** Side-lane guardian names that spawn with the boss battle (left/right/middle). */
    readonly sideGuardianNames: readonly string[];
};

function uniqueNames(names: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const name of names) {
        const key = name.trim();
        if (!key || seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(key);
    }
    return out;
}

function resolveBoss(catalog: StageBossCatalog, id: number): StageBossInfo | undefined {
    const entry = catalog.bosses?.[`${id}`];
    if (entry && typeof entry.name === "string" && entry.name.trim()) {
        return {
            id: entry.id ?? id,
            name: entry.name.trim(),
            resId: entry.resId,
            level: entry.level,
            hpBase: entry.hpBase,
        };
    }
    return undefined;
}

function resolveGuardianName(catalog: StageBossCatalog, id: number): string | undefined {
    const entry = catalog.guardians?.[`${id}`];
    const name = entry?.name?.trim();
    return name || undefined;
}

function sideIds(pools: StageBossSidePools | undefined): number[] {
    if (!pools) {
        return [];
    }
    return [...(pools.left ?? []), ...(pools.middle ?? []), ...(pools.right ?? [])];
}

/**
 * Candidate stage keys for a chip label map name.
 * Boss · Atlantis uses `AtlantisBoss`; some drops use bare map names with needBoss.
 */
export function stageBossLookupKeys(mapName: string, needBoss: boolean): readonly string[] {
    const keys = [mapName];
    if (needBoss && !/Boss$/i.test(mapName)) {
        keys.push(`${mapName}Boss`);
    }
    if (!needBoss && /Boss$/i.test(mapName)) {
        keys.push(mapName.replace(/Boss$/i, ""));
    }
    return keys;
}

function entryHasBosses(entry: StageBossStageEntry | undefined): entry is StageBossStageEntry {
    return !!entry && Array.isArray(entry.bossIds) && entry.bossIds.length > 0;
}

export function findStageBossEntry(
    mapName: string,
    needBoss: boolean,
    catalog: StageBossCatalog,
): StageBossStageEntry | undefined {
    const stages = catalog.stages;
    if (!stages) {
        return undefined;
    }
    const keys = stageBossLookupKeys(mapName, needBoss);
    // Prefer an entry that actually lists BossGuardian ids (e.g. AtlantisBoss over Atlantis).
    for (const key of keys) {
        const entry = stages[key];
        if (entryHasBosses(entry)) {
            return entry;
        }
    }
    // MapId bridge: bare map names share MapId with the boss-stage sibling.
    for (const key of keys) {
        const seed = stages[key];
        if (seed?.mapId == null) {
            continue;
        }
        const siblings = catalog.byMapId?.[`${seed.mapId}`] ?? [];
        for (const siblingName of siblings) {
            const sibling = stages[siblingName];
            if (entryHasBosses(sibling)) {
                return sibling;
            }
        }
    }
    // Last resort: any matching stage row (non-boss Temple, etc.).
    for (const key of keys) {
        if (stages[key]) {
            return stages[key];
        }
    }
    return undefined;
}

/**
 * Project the boss(es) and side guardians for a stage chip.
 * Supports multi-boss stages via bossIds[] (JFTSE currently ships one BossGuardian per stage).
 */
export function projectStageBosses(
    mapName: string,
    needBoss: boolean,
    catalog: StageBossCatalog,
): StageBossProjection {
    const entry = findStageBossEntry(mapName, needBoss, catalog);
    if (!entry) {
        return {
            stageName: mapName,
            isBossStage: needBoss,
            bosses: [],
            bossNames: [],
            sideGuardianNames: [],
        };
    }

    const bosses: StageBossInfo[] = [];
    const seenBossIds = new Set<number>();
    for (const id of entry.bossIds ?? []) {
        if (seenBossIds.has(id)) {
            continue;
        }
        seenBossIds.add(id);
        const boss = resolveBoss(catalog, id);
        if (boss) {
            bosses.push(boss);
        }
    }

    const sideGuardianNames = uniqueNames(
        sideIds(entry.sideGuardianIds)
            .map((id) => resolveGuardianName(catalog, id))
            .filter((n): n is string => typeof n === "string"),
    );

    return {
        stageName: entry.name,
        mapId: typeof entry.mapId === "number" ? entry.mapId : undefined,
        isBossStage: !!entry.isBossStage,
        bosses,
        bossNames: uniqueNames(bosses.map((b) => b.name)),
        sideGuardianNames,
    };
}
