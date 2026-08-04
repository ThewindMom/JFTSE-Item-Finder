/// <reference types="bun" />

import { expect, test } from "bun:test";

import {
    findStageBossEntry,
    projectStageBosses,
    stageBossLookupKeys,
    type StageBossCatalog,
} from "./stageBosses";
import { projectJson } from "./test-support/ui-contract-fixtures";

test("stageBossLookupKeys tries Boss suffix for needBoss chips", () => {
    expect(stageBossLookupKeys("Atlantis", true)).toEqual(["Atlantis", "AtlantisBoss"]);
    expect(stageBossLookupKeys("AtlantisBoss", true)).toEqual(["AtlantisBoss"]);
    expect(stageBossLookupKeys("Temple", false)).toEqual(["Temple"]);
});

test("shipped stage-bosses catalog maps each boss stage to a named boss", async () => {
    const catalog = await projectJson<StageBossCatalog>("./assets/stage-bosses.json");

    const expected: Record<string, string> = {
        ArenaBoss: "Hell Blood",
        DevaBergBoss: "Hera",
        AtlantisBoss: "Royal Lizard",
        TempleBoss: "TossakanBoss",
        MachineCityBoss: "TB-255",
        DanceTimeBoss: "Dance King",
    };

    for (const [stage, bossName] of Object.entries(expected)) {
        const projected = projectStageBosses(stage, true, catalog);
        expect(projected.bossNames).toContain(bossName);
        expect(projected.isBossStage).toBe(true);
        expect(projected.bosses.length).toBeGreaterThanOrEqual(1);
    }
});

test("Atlantis chip without Boss suffix still resolves Royal Lizard", async () => {
    const catalog = await projectJson<StageBossCatalog>("./assets/stage-bosses.json");
    const projected = projectStageBosses("Atlantis", true, catalog);
    expect(projected.stageName).toBe("AtlantisBoss");
    expect(projected.bossNames).toEqual(["Royal Lizard"]);
});

test("projectStageBosses supports multi-boss stages and dedupes names", () => {
    const catalog: StageBossCatalog = {
        bosses: {
            "1": { id: 1, name: "Hell Blood" },
            "2": { id: 2, name: "Hell Blood" },
            "3": { id: 3, name: "Hera" },
        },
        guardians: {
            "19": { id: 19, name: "Dogoliath" },
            "25": { id: 25, name: "Doblood" },
        },
        stages: {
            MultiBoss: {
                name: "MultiBoss",
                mapId: 99,
                isBossStage: true,
                bossIds: [1, 2, 3, 1],
                sideGuardianIds: {
                    left: [25],
                    middle: [],
                    right: [19, 25],
                },
            },
        },
    };

    const projected = projectStageBosses("MultiBoss", true, catalog);
    expect(projected.bosses.map((b) => b.id)).toEqual([1, 2, 3]);
    expect(projected.bossNames).toEqual(["Hell Blood", "Hera"]);
    expect(projected.sideGuardianNames).toEqual(["Doblood", "Dogoliath"]);
});

test("findStageBossEntry prefers sibling boss stage on same MapId", () => {
    const catalog: StageBossCatalog = {
        bosses: { "4": { id: 4, name: "Royal Lizard" } },
        stages: {
            Atlantis: {
                name: "Atlantis",
                mapId: 10,
                isBossStage: false,
                bossIds: [],
            },
            AtlantisBoss: {
                name: "AtlantisBoss",
                mapId: 10,
                isBossStage: true,
                bossIds: [4],
            },
        },
        byMapId: {
            "10": ["Atlantis", "AtlantisBoss"],
        },
    };

    // Bare map name + needBoss should walk to AtlantisBoss via suffix first.
    expect(findStageBossEntry("Atlantis", true, catalog)?.name).toBe("AtlantisBoss");
    expect(projectStageBosses("Atlantis", true, catalog).bossNames).toEqual(["Royal Lizard"]);
});
