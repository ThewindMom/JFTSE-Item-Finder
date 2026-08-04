import { rename, rm } from "node:fs/promises";

import { parseCatalogV1 } from "../catalog";
import type { CatalogV1 } from "../catalogTypes";
import {
    parseCatalogGacha,
    parseCatalogItems,
    parseCatalogStages,
} from "./catalogSource";
import { parseCatalogProducts } from "./catalogProducts";

const jftseRaw =
    "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development";
const itemUrl =
    `${jftseRaw}/auth-server/src/main/resources/res/Item_Parts_Ini3.xml`;
const guardianUrl =
    `${jftseRaw}/server-core/src/main/resources/res/GuardianStages.json`;
const gachaBase =
    `${jftseRaw}/game-server/src/main/resources/res/lottery`;
const shopBase = "https://jftse.com/jftse-restservice/api/shop";

async function fetchText(url: string): Promise<string> {
    const response = await fetch(url, { headers: { Accept: "*/*" } });
    if (!response.ok) {
        throw new Error(`Catalog source failed: ${response.status} ${url}`);
    }
    return response.text();
}

async function fetchJson(url: string): Promise<unknown> {
    return JSON.parse(await fetchText(url)) as unknown;
}

async function localJson(path: string): Promise<unknown> {
    return JSON.parse(await Bun.file(path).text()) as unknown;
}

function numberArray(value: unknown): number[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((entry): entry is number =>
        typeof entry === "number" && Number.isSafeInteger(entry)
    );
}

async function generateCatalog(): Promise<CatalogV1> {
    const [
        itemXml,
        guardian,
        nobuyInput,
        productStageDrops,
        itemArt,
        mapArt,
        stageBoss,
        bossArt,
        shopPages,
    ] = await Promise.all([
        fetchText(itemUrl),
        fetchJson(guardianUrl),
        localJson("assets/shop-nobuy-indexes.json"),
        localJson("assets/product-stage-drops.json"),
        localJson("assets/item-art-map.json"),
        localJson("assets/map-art-map.json"),
        localJson("assets/stage-bosses.json"),
        localJson("assets/boss-art-map.json"),
        Promise.all(Array.from({ length: 20 }, (_, page) =>
            fetchJson(`${shopBase}?size=1000&page=${page}`)
        )),
    ]);

    const items = parseCatalogItems(itemXml);
    const itemIds = new Set(items.map(item => item.id));
    const nobuyRecord = nobuyInput && typeof nobuyInput === "object"
        ? nobuyInput as Record<string, unknown>
        : {};
    const products = parseCatalogProducts(
        shopPages,
        itemIds,
        new Set(numberArray(nobuyRecord.productIndexes)),
    );
    const productIds = new Set(products.map(product => product.productIndex));
    const lotteryProducts = products.filter(product =>
        product.kind === "lottery"
        && product.gachaIndex !== null
        && product.gachaIndex > 0
    );
    const gachas = await Promise.all(lotteryProducts.map(async product => {
        const index = `${product.gachaIndex}`.padStart(2, "0");
        const xml = await fetchText(`${gachaBase}/Ini3_Lot_${index}.xml`);
        return parseCatalogGacha(product.productIndex, xml, productIds);
    }));
    gachas.sort((lhs, rhs) => lhs.productIndex - rhs.productIndex);

    return parseCatalogV1({
        schemaVersion: 1,
        items,
        products,
        gachas,
        stageSources: parseCatalogStages(
            guardian,
            productStageDrops,
            productIds,
        ),
        art: {
            item: itemArt,
            map: mapArt,
            stageBoss,
            boss: bossArt,
        },
    });
}

if (import.meta.main) {
    const output = "assets/catalog.json";
    const temporary = `${output}.tmp`;
    try {
        const catalog = await generateCatalog();
        await Bun.write(temporary, JSON.stringify(catalog));
        await rename(temporary, output);
        process.stdout.write(JSON.stringify({
            output,
            items: catalog.items.length,
            products: catalog.products.length,
            gachas: catalog.gachas.length,
            stageSources: catalog.stageSources.length,
            bytes: Bun.file(output).size,
        }) + "\n");
    }
    finally {
        await rm(temporary, { force: true });
    }
}
