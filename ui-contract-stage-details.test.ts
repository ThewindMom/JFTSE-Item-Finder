/// <reference types="bun" />

import { expect, test } from "bun:test";

import {
    resolveMapArtFile,
    stageTitleName,
    type MapArtCatalog,
} from "./gachaAcquisition";
import {
    projectFile,
    projectJson,
} from "./test-support/ui-contract-fixtures";

test("stageTitleName strips trailing Boss for dossier titles", () => {
    expect(stageTitleName("AtlantisBoss")).toBe("Atlantis");
    expect(stageTitleName("MachineCityBoss")).toBe("Machine City");
    expect(stageTitleName("Temple")).toBe("Temple");
});

test("resolveMapArtFile returns authentic map art for UI thumbs and stage envs", async () => {
    const catalog = await projectJson<MapArtCatalog>("./assets/map-art-map.json");

    expect(resolveMapArtFile("ArenaBoss", catalog)).toBe("UI11_Map06.webp");
    expect(resolveMapArtFile("DanceTimeBoss", catalog)).toBe("UI11_Map08.webp");
    expect(resolveMapArtFile("MonsLava", catalog)).toBe("UI11_Map07.webp");
    // Stage-environment banners for maps without UI11 thumbs.
    expect(resolveMapArtFile("AtlantisBoss", catalog)).toBe("Stage_Atlantis.webp");
    expect(resolveMapArtFile("TempleBoss", catalog)).toBe("Stage_Temple.webp");
    expect(resolveMapArtFile("DevaBergBoss", catalog)).toBe("Stage_DevaBerg.webp");
    expect(resolveMapArtFile("MachineCityBoss", catalog)).toBe("Stage_MachineCity.webp");
    // Bare map name + needBoss still resolves via catalog / suffix keys.
    expect(resolveMapArtFile("Atlantis", catalog, { needBoss: true })).toBe("Stage_Atlantis.webp");
    expect(resolveMapArtFile("Atlantis", catalog, { mapId: 10 })).toBe("Stage_Atlantis.webp");
});

test("ships map art catalog files for every byName mapping", async () => {
    const catalog = await projectJson<MapArtCatalog>("./assets/map-art-map.json");
    for (const key of Object.values(catalog.byName)) {
        const entry = catalog.files[key];
        expect(entry).toBeDefined();
        expect(await Bun.file(`./assets/map-art/${entry!.file}`).exists()).toBe(true);
    }
});

test("stage details dialog is a dossier with map art and structured facts", async () => {
    const [renderer, css, server, design] = await Promise.all([
        projectFile("./itemLookup.ts"),
        projectFile("./style.css"),
        projectFile("./server.ts"),
        projectFile("./DESIGN.md"),
    ]);

    expect(renderer).toContain("function createStageDetailsContent");
    expect(renderer).toContain('"stage-details stage-details--boss"');
    expect(renderer).toContain('"stage-details stage-details--guardian"');
    expect(renderer).toContain("createBossPortrait");
    expect(renderer).toContain("stage-details__portrait");
    expect(renderer).toContain("stage-details__portrait-image");
    expect(renderer).toContain("assets/boss-art/");
    expect(renderer).toContain("bossArtCatalog = catalog.art.boss");
    expect(renderer).toContain("createStageRewardArt");
    expect(renderer).toContain("stage-details__reward-art--coin");
    expect(renderer).toContain('class: "stage-details__rewards"');
    expect(renderer).toContain("stage-details__reward--current");
    expect(renderer).toContain("This item");
    expect(renderer).toContain('"stage-details-dialog"');
    expect(renderer).toContain("stageBossCatalog = catalog.art.stageBoss");
    expect(renderer).toContain("projectStageBosses");
    expect(renderer).toContain("stage-details__bosses");
    // Map banner removed — boss portrait is the hero image.
    expect(renderer).not.toContain("createStageMapArt");
    expect(renderer).not.toContain("stage-details__art-image");
    // Removed noisy duplicate chrome.
    expect(renderer).not.toContain("stage-details__boss-summary");
    expect(renderer).not.toContain("stage-details__meta");
    expect(renderer).not.toContain("stage-details-facts");
    expect(renderer).not.toContain("stage-details__facts");
    // Flat legacy list must not remain as the stage popup body.
    expect(renderer).not.toContain("Guardian map ${prettyGuardianMapName");
    expect(renderer).not.toContain("Requires boss: ${itemSource.need_boss");

    expect(css).toMatch(/\.stage-details-dialog[\s\S]*width:\s*min\(92vw,\s*560px\)/);
    expect(css).toMatch(/\.stage-details__portrait/);
    expect(css).toMatch(/\.stage-details__portrait-image/);
    expect(css).toMatch(/\.stage-details--boss[\s\S]*--jf-source-boss/);
    expect(css).toMatch(/\.stage-details__reward--current/);
    expect(css).toMatch(/\.stage-details__reward-art--coin/);
    expect(css).toMatch(/\.stage-details__boss-item--primary/);
    expect(css).toMatch(/\.stage-details__side-pool/);
    expect(renderer).toContain("stage-details__side-pool");
    expect(renderer).toContain("Side companions (pool");

    expect(server).toContain('"/assets/stage-bosses.json"');
    expect(server).toContain('"/assets/boss-art-map.json"');
    expect(server).toContain('"/assets/boss-art/:file"');

    expect(design).toContain("stage details dossier");
    expect(design).toContain("BossGuardian");
    expect(design).toContain("Boss portrait");
});
