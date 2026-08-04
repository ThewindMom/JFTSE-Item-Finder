import { createHTML } from './html';
import {
    prettyGuardianMapName,
    projectGachaAcquisitionChannels,
    stageChannelLabel,
    stageTitleName,
    type GachaSourceInput,
} from './gachaAcquisition';
import {
    characters,
    gachas,
    Gacha,
    GachaItemSource,
    GuardianItemSource,
    installItemDomainState,
    isCharacter,
    Item,
    items,
    ItemSource,
    shop_items,
    ShopItemSource,
    type Character,
} from './itemDomain';
import { priorityStatHeaderDisplay } from './priorityStatHeaders';
import {
    mergePriorityRankings,
    type PriorityRanker,
} from './priority';
import { hydrateCatalogState } from './catalogHydration';
import {
    projectStageBosses,
    type StageBossCatalog,
    type StageBossProjection,
} from './stageBosses';

export { priorityStatHeaderDisplay } from './priorityStatHeaders';
export type { PriorityStatHeaderDisplay } from './priorityStatHeaders';
export {
    resolveMapArtFile,
    stageTitleName,
} from './gachaAcquisition';
export {
    projectStageBosses,
} from './stageBosses';

export {
    characters,
    gachas,
    Gacha,
    GachaItemSource,
    GuardianItemSource,
    isCharacter,
    Item,
    items,
    ItemSource,
    shop_items,
    ShopItemSource,
} from './itemDomain';
export type { Character, Part } from './itemDomain';

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
let stageBossCatalog: StageBossCatalog = { bosses: {}, guardians: {}, stages: {} };
type BossArtCatalog = {
    readonly byBossId?: Readonly<Record<string, string>>;
    readonly byResId?: Readonly<Record<string, string>>;
    readonly files?: Readonly<Record<string, { readonly file: string }>>;
};
let bossArtCatalog: BossArtCatalog = {};

export function hydrateCatalog(input: unknown): void {
    const catalog = hydrateCatalogState(input);
    installItemDomainState(catalog);
    itemArtMap = catalog.art.item;
    stageBossCatalog = catalog.art.stageBoss;
    bossArtCatalog = catalog.art.boss;
}

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

/** User-facing lab-prep phases — never expose raw filenames, paths, or XML names. */
export function loadingPhaseForUrl(url: string): { title: string; detail: string } {
    if (url.includes("Item_Parts")) {
        return {
            title: "Preparing equipment catalog…",
            detail: "Gathering every wearable for comparison.",
        };
    }
    if (url.includes("/api/shop")) {
        return {
            title: "Checking the live shop…",
            detail: "Reading Gold and AP listings.",
        };
    }
    if (url.includes("GuardianStages") || url.includes("product-stage-drops")) {
        return {
            title: "Mapping stage rewards…",
            detail: "Finding where gear and coins drop.",
        };
    }
    if (url.includes("Ini3_Lot") || url.includes("lottery")) {
        return {
            title: "Loading gacha tables…",
            detail: "Matching capsules to their prizes.",
        };
    }
    if (url.includes("item-art") || url.includes("shop-nobuy")) {
        return {
            title: "Finishing the lab…",
            detail: "Syncing art and sale status.",
        };
    }
    return {
        title: "Opening the equipment lab…",
        detail: "Almost ready to compare gear.",
    };
}

function setLoadingPhase(url: string): void {
    if (url.includes("catalog.json")) {
        const phase = {
            title: "Preparing equipment catalog…",
            detail: "Loading gear, shops, gachas, and stage rewards.",
        };
        const title = document.getElementById("loading");
        if (title instanceof HTMLElement) {
            title.textContent = phase.title;
        }
        const detail = document.querySelector(".loading-state__detail");
        if (detail instanceof HTMLElement) {
            detail.textContent = phase.detail;
        }
        return;
    }
    const phase = loadingPhaseForUrl(url);
    const title = document.getElementById("loading");
    if (title instanceof HTMLElement) {
        title.textContent = phase.title;
    }
    const detail = document.querySelector(".loading-state__detail");
    if (detail instanceof HTMLElement) {
        detail.textContent = phase.detail;
    }
}

export async function download(url: string): Promise<string> {
    setLoadingPhase(url);
    const reply = await fetch(url);
    const progressbar = document.getElementById("progressbar");
    if (progressbar instanceof HTMLProgressElement) {
        progressbar.value++;
    }
    if (!reply.ok) {
        // Keep technical URL detail in the thrown error for logs; UI uses human copy.
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
        progressbar.max = 1;
    }
    hydrateCatalog(JSON.parse(await download("assets/catalog.json")) as unknown);
}

/** Ban/circle-slash icon for exclude — outline SVG, recolored via currentColor. */
function createExcludeIcon(): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "item_removal__icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "9");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "currentColor");
    circle.setAttribute("stroke-width", "2");

    const slash = document.createElementNS(ns, "line");
    slash.setAttribute("x1", "7");
    slash.setAttribute("y1", "7");
    slash.setAttribute("x2", "17");
    slash.setAttribute("y2", "17");
    slash.setAttribute("stroke", "currentColor");
    slash.setAttribute("stroke-width", "2");
    slash.setAttribute("stroke-linecap", "round");

    svg.append(circle, slash);
    return svg;
}

function deletableItem(item: Item, character?: Character) {
    const excludeLabel = `Exclude ${item.name_en} from results`;
    const excludeButton = createHTML([
        "button",
        {
            class: "item_removal",
            "data-item_index": `${item.id}`,
            "aria-label": excludeLabel,
            type: "button",
            title: excludeLabel,
        },
    ]);
    excludeButton.append(createExcludeIcon());

    return createHTML([
        "div",
        { class: "item-identity" },
        excludeButton,
        [
            "div",
            { class: "item-identity__meta" },
            createItemDetailsTrigger(item, character),
            createItemAvailabilityBadge(item),
        ],
    ]);
}

function lockBackgroundScroll() {
    document.documentElement.classList.add("dialog-open");
}

function unlockBackgroundScroll() {
    document.documentElement.classList.remove("dialog-open");
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
        const previous = dialog;
        previous.close();
        previous.remove();
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
        unlockBackgroundScroll();
        trigger.focus();
    }, { once: true });
    topDiv.appendChild(dialog);
    dialog.showModal();
    lockBackgroundScroll();
}

export function createPopupLink(
    text: string,
    content: HTMLElement | string | (HTMLElement | string)[],
    dialogClass?: string,
) {
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
        showDialog(button, `${text} details`, content, dialogClass);
    });
    return button;
}

function createPriorityStatHeaderCell(
    stat: string,
    primary: boolean,
): HTMLTableCellElement {
    const { short, full, abbreviated } = priorityStatHeaderDisplay(stat);
    const attributes = {
        class: "numeric",
        scope: "col",
        ...(primary ? { "aria-sort": "descending" } : {}),
    };
    if (!abbreviated) {
        return createHTML(["th", attributes, short]);
    }
    const popup = createPopupLink(short, createHTML(["p", full]));
    popup.setAttribute("title", full);
    popup.setAttribute("aria-label", full);
    popup.classList.add("priority-stat-header");
    return createHTML(["th", attributes, popup]);
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

/**
 * Gacha drop-details table: Item | Chance | Expected pulls.
 * Character is never a column — equipment pools mirror across characters, so listing
 * Niki/LunLun/… duplicates the same rows. When no character filter is set, same-name
 * rows (with the same quantity range) collapse to one entry using the first pool rate.
 */
export function createGachaDetailsTable(
    gacha: Gacha,
    highlightedItem?: Item,
    character?: Character,
): HTMLTableElement {
    const content = createHTML([
        "table",
        [
            "tr",
            ["th", "Item"],
            ["th", "Chance"],
            ["th", "Expected pulls"],
        ],
    ]);

    type Row = {
        item: Item;
        probability: number;
        quantity_min: number;
        quantity_max: number;
    };

    // Character filter: accumulate by Item identity (historical math).
    // Unfiltered: collapse by display name + quantity so per-character clones are one row.
    const byItem = character ? new Map<Item, Row>() : undefined;
    const byName = character ? undefined : new Map<string, Row>();

    for (const char of character === undefined ? characters : [character]) {
        const char_items = gacha.shop_items.get(char);
        if (!char_items) {
            continue;
        }
        for (const [char_gacha_item, [tickets, quantity_min, quantity_max]] of char_items) {
            // Character-filtered: keep historical denominator (item character, else filter, else total).
            // Unfiltered collapse: rates are within each character's pool (pools mirror; first row wins).
            // Using total_probability for shared items would dilute ~7× and reintroduce wrong rates.
            const item_tickets = character === undefined
                ? gacha.character_probability.get(char)!
                : (() => {
                    const item_character = char_gacha_item.character || character;
                    return item_character
                        ? gacha.character_probability.get(item_character)!
                        : gacha.total_probability;
                })();
            const probability = tickets / item_tickets;

            if (byItem) {
                const previous = byItem.get(char_gacha_item);
                byItem.set(char_gacha_item, {
                    item: char_gacha_item,
                    probability: (previous?.probability ?? 0) + probability,
                    quantity_min,
                    quantity_max,
                });
                continue;
            }

            const key = `${char_gacha_item.name_en}\0${quantity_min}\0${quantity_max}`;
            if (!byName!.has(key)) {
                byName!.set(key, {
                    item: char_gacha_item,
                    probability,
                    quantity_min,
                    quantity_max,
                });
            }
        }
    }

    const rows = byItem ? [...byItem.values()] : [...byName!.values()];
    for (const row of rows) {
        const highlighted = highlightedItem !== undefined && (
            highlightedItem === row.item
            || (
                character === undefined
                && highlightedItem.name_en === row.item.name_en
            )
        );
        content.appendChild(createHTML([
            "tr",
            highlighted ? { class: "highlighted" } : "",
            ["td", row.item.name_en, quantityString(row.quantity_min, row.quantity_max)],
            ["td", { class: "numeric" }, `${prettyNumber(row.probability * 100, 2)}%`],
            ["td", { class: "numeric" }, `${prettyNumber(1 / row.probability, 2)}`],
        ]));
    }

    return content;
}

function createGachaSourcePopup(item: Item | undefined, itemSource: ItemSource, character?: Character) {
    const gacha = gachas.get(itemSource.shop_id);
    if (!gacha) {
        throw "Internal error";
    }
    const probabilityTable = createHTML([
        "div",
        {
            class: "gacha-probability-dialog__scroll",
            role: "region",
            tabindex: "0",
            "aria-label": `${itemSource.item.name_en} probabilities`,
        },
        createGachaDetailsTable(gacha, item, character),
    ]);
    return createPopupLink(
        itemSource.item.name_en,
        probabilityTable,
        "gacha-probability-dialog",
    );
}

function createSetSourcePopup(item: Item, itemSource: ShopItemSource) {
    const contentTable = createHTML(["table", ["tr", ["th", "Contents"]]]);
    for (const inner_item of itemSource.items) {
        contentTable.appendChild(createHTML(["tr", inner_item === item ? { class: "highlighted" } : "", ["td", inner_item.name_en]]));
    }
    // Dialog aria-label already carries the set name — only show the contents table.
    return createPopupLink(itemSource.item.name_en, contentTable);
}

function resolveBossArtFile(bossId: number, resId?: number): string | undefined {
    const byId = bossArtCatalog.byBossId?.[`${bossId}`];
    if (byId) {
        return byId;
    }
    if (typeof resId === "number") {
        return bossArtCatalog.byResId?.[`${resId}`];
    }
    return undefined;
}

function createBossPortrait(projection: StageBossProjection): HTMLElement {
    const primary = projection.bosses[0];
    const bossName = primary?.name ?? (projection.isBossStage ? "Boss" : "Guardian");
    const file = primary
        ? resolveBossArtFile(primary.id, primary.resId)
        : undefined;
    if (file) {
        return createHTML([
            "div",
            { class: "stage-details__portrait", "data-has-boss-art": "true" },
            [
                "img",
                {
                    class: "stage-details__portrait-image",
                    src: `assets/boss-art/${encodeURIComponent(file)}`,
                    alt: `Boss artwork for ${bossName}`,
                    width: "128",
                    height: "128",
                    decoding: "async",
                },
            ],
        ]);
    }
    return createHTML([
        "div",
        {
            class: "stage-details__portrait stage-details__portrait--fallback",
            role: "img",
            "aria-label": `Boss artwork unavailable for ${bossName}`,
            "data-has-boss-art": "false",
        },
        ["span", { "aria-hidden": "true" }, bossName.slice(0, 1).toUpperCase()],
    ]);
}

/**
 * Resolve the Gacha behind a shop product Item (stage rewards are shop_items entries).
 * Lottery items used to leave item.id at 0 — still support reverse lookup for those.
 */
export function findGachaForShopItem(item: Item): Gacha | undefined {
    if (item.id !== 0) {
        const byId = gachas.get(item.id);
        if (byId) {
            return byId;
        }
    }
    for (const [shopIndex, gacha] of gachas) {
        if (shop_items.get(shopIndex) === item) {
            return gacha;
        }
    }
    for (const gacha of gachas.values()) {
        if (gacha.name === item.name_en) {
            return gacha;
        }
    }
    return undefined;
}

/**
 * Reward tile art: gacha coins use the same lottery sprite as the results table
 * (`createGachaCoinArt`). Equipment uses Item_Parts sheet cells.
 */
export function createStageRewardArt(item: Item) {
    const gacha = findGachaForShopItem(item);
    if (gacha) {
        // Same path as createGachaSourceSummary / gacha table column.
        const coin = createGachaCoinArt(gacha);
        // Keep reward-row sizing hooks without losing the circular coin look.
        const classes = typeof coin.className === "string" ? coin.className : "";
        if (!classes.split(/\s+/).includes("stage-details__reward-art")) {
            coin.className = `${classes} stage-details__reward-art stage-details__reward-art--coin`.trim();
        }
        return coin;
    }
    return createItemArt(item, 40, "stage-details__reward-art");
}

function createStageBossList(projection: StageBossProjection) {
    if (projection.bossNames.length === 0 && projection.sideGuardianNames.length === 0) {
        return undefined;
    }
    const bossItems = projection.bosses.map((boss) => {
        const file = resolveBossArtFile(boss.id, boss.resId);
        const thumb = file
            ? createHTML([
                "img",
                {
                    class: "stage-details__boss-thumb",
                    src: `assets/boss-art/${encodeURIComponent(file)}`,
                    alt: "",
                    width: "40",
                    height: "40",
                    decoding: "async",
                    "aria-hidden": "true",
                },
            ])
            : createHTML([
                "span",
                { class: "stage-details__boss-thumb stage-details__boss-thumb--fallback", "aria-hidden": "true" },
                boss.name.slice(0, 1),
            ]);
        return createHTML([
            "li",
            { class: "stage-details__boss-item stage-details__boss-item--primary" },
            thumb,
            ["span", { class: "stage-details__boss-role" }, "Boss"],
            ["span", { class: "stage-details__boss-name" }, boss.name],
        ]);
    });
    // GuardiansLeft/Right/Middle are a spawn *pool* — one left + one right at fight time.
    const sideNote = projection.sideGuardianNames.length > 0
        ? createHTML([
            "div",
            { class: "stage-details__side-pool" },
            [
                "p",
                { class: "stage-details__side-pool-label" },
                `Side companions (pool of ${projection.sideGuardianNames.length})`,
            ],
            [
                "p",
                { class: "stage-details__side-pool-names" },
                projection.sideGuardianNames.join(" · "),
            ],
            [
                "p",
                { class: "stage-details__side-pool-hint" },
                "One left and one right spawn with the boss; the rest are possible draws.",
            ],
        ])
        : undefined;
    const section = createHTML([
        "section",
        { class: "stage-details__section", "aria-labelledby": "stage-details-bosses" },
        [
            "h3",
            { id: "stage-details-bosses" },
            projection.bossNames.length > 1 ? "Bosses" : "Boss",
        ],
        [
            "ul",
            { class: "stage-details__bosses" },
            ...bossItems,
        ],
    ]);
    if (sideNote) {
        section.appendChild(sideNote);
    }
    return section;
}

/**
 * Stage dossier for Guardian / Boss map chips: boss portrait, JFTSE boss names,
 * readable facts, and reward list with the same art as the results table.
 */
export function createStageDetailsContent(item: Item, itemSource: GuardianItemSource) {
    const isBoss = itemSource.need_boss;
    const title = stageTitleName(itemSource.guardian_map);
    const eyebrow = isBoss ? "Boss stage" : "Guardian stage";
    const bossProjection = projectStageBosses(
        itemSource.guardian_map,
        isBoss,
        stageBossCatalog,
    );
    const rewards = itemSource.items.length > 0
        ? createHTML([
            "ul",
            { class: "stage-details__rewards" },
            ...itemSource.items.map((reward) => createHTML([
                "li",
                {
                    class: reward === item
                        ? "stage-details__reward stage-details__reward--current"
                        : "stage-details__reward",
                },
                createStageRewardArt(reward),
                ["span", { class: "stage-details__reward-name" }, reward.name_en],
                ...(reward === item
                    ? [createHTML(["span", { class: "stage-details__reward-badge" }, "This item"])]
                    : []),
            ])),
        ])
        : createHTML(["p", { class: "stage-details__empty" }, "No listed rewards for this stage."]);

    const bossSection = createStageBossList(bossProjection);

    const identity = createHTML([
        "div",
        { class: "stage-details__identity" },
        ["span", { class: "stage-details__eyebrow" }, eyebrow],
        ["h2", title],
    ]);

    const header = createHTML([
        "header",
        { class: "stage-details__header" },
        createBossPortrait(bossProjection),
        identity,
    ]);

    const article = createHTML([
        "article",
        {
            class: isBoss
                ? "stage-details stage-details--boss"
                : "stage-details stage-details--guardian",
        },
        header,
    ]);
    if (bossSection) {
        article.appendChild(bossSection);
    }
    article.appendChild(createHTML([
        "section",
        { class: "stage-details__section", "aria-labelledby": "stage-details-rewards" },
        ["h3", { id: "stage-details-rewards" }, "Rewards"],
        rewards,
    ]));
    return article;
}

function createGuardianPopup(item: Item, itemSource: GuardianItemSource) {
    const mapLabel = stageChannelLabel(itemSource.guardian_map, itemSource.need_boss);
    return createPopupLink(
        mapLabel,
        createStageDetailsContent(item, itemSource),
        "stage-details-dialog",
    );
}

function itemSourcesToElementArray(
    item: Item,
    sourceFilter: (itemSource: ItemSource) => boolean,
    character?: Character) {
    return [...item.sources.values()]
        .filter(sourceFilter)
        .map(itemSource => sourceItemElement(item, itemSource, character));
}

function elementClassTokens(element: HTMLElement): string[] {
    // Prefer className over classList — the unit DOM harness sets className via
    // setAttribute("class") and does not implement a full classList.
    const raw = typeof element.className === "string"
        ? element.className
        : element.getAttribute("class") || "";
    return raw.split(/\s+/).filter(Boolean);
}

function isGachaSourceGroup(elements: readonly (HTMLElement | string)[]): boolean {
    return elements.some(
        (element) =>
            typeof element !== "string"
            && elementClassTokens(element).includes("gacha-source-summary"),
    );
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
    let previousGroup: readonly (HTMLElement | string)[] | undefined;
    for (const elements of list) {
        if (elements.length === 0) {
            add(" ");
            continue;
        }
        // Comma between shop/set/guardian paths so dual prices stay legible
        // ("50000 Gold, Supporter Set 350000 Gold"). Never next to gacha coin cards —
        // those are block summaries and a text comma becomes a visual break.
        if (
            previousGroup !== undefined
            && !isGachaSourceGroup(previousGroup)
            && !isGachaSourceGroup(elements)
        ) {
            add(", ");
        }
        previousGroup = elements;
        for (const element of elements) {
            if (element === "") {
                continue;
            }
            add(element);
        }
    }
    return result;
}

function isAvailableItemSource(itemSource: ItemSource): boolean {
    if (itemSource instanceof ShopItemSource || itemSource instanceof GuardianItemSource) {
        return true;
    }
    if (itemSource instanceof GachaItemSource) {
        const gacha = gachas.get(itemSource.shop_id);
        if (gacha?.enabled) {
            return true;
        }
        for (const source of itemSource.item.sources) {
            if (source !== itemSource && isAvailableItemSource(source)) {
                return true;
            }
        }
        return false;
    }
    return false;
}

export function isItemCurrentlyAvailable(item: Item): boolean {
    for (const source of item.sources) {
        if (isAvailableItemSource(source)) {
            return true;
        }
    }
    return false;
}

function createItemAvailabilityBadge(item: Item) {
    if (isItemCurrentlyAvailable(item)) {
        return "";
    }
    return createHTML([
        "span",
        {
            class: "item-availability item-availability--unavailable",
            title: "No enabled shop, gacha, or Guardian path in the live shop data",
        },
        "Not in game",
    ]);
}

function collectGachaSourceInputs(coin: Item | undefined): GachaSourceInput[] {
    if (!coin) {
        return [];
    }
    const inputs: GachaSourceInput[] = [];
    for (const source of coin.sources) {
        if (source instanceof ShopItemSource) {
            inputs.push({ kind: "shop", ap: source.ap });
        } else if (source instanceof GuardianItemSource) {
            inputs.push({
                kind: "stage",
                map: source.guardian_map,
                needBoss: source.need_boss,
            });
        }
    }
    return inputs;
}

function createGachaShopChannelLabel(
    currency: "Gold" | "AP",
    available: boolean,
    reason?: "not_for_sale" | "not_available",
): HTMLElement {
    if (available) {
        if (currency === "AP") {
            return createHTML([
                "span",
                { class: "gacha-currency gacha-currency--ap" },
                "AP",
            ]);
        }
        return createHTML([
            "span",
            { class: "gacha-currency gacha-currency--gold" },
            "Gold",
        ]);
    }
    if (reason === "not_for_sale") {
        return createHTML([
            "span",
            {
                class: "gacha-shop-status gacha-shop-status--not-for-sale",
                title: `${currency} product is listed in the shop catalog but cannot be purchased (Nobuy)`,
            },
            "Not for sale",
        ]);
    }
    return createHTML([
        "span",
        {
            class: "gacha-shop-status gacha-shop-status--not-available",
            title: `${currency} coin is not currently sold in the live shop`,
        },
        `${currency} · Not available`,
    ]);
}

function createGachaStageChannelLabel(
    coin: Item | undefined,
    map: string,
    needBoss: boolean,
    label: string,
): HTMLElement {
    const guardianSource = coin?.sources.find(
        (source): source is GuardianItemSource =>
            source instanceof GuardianItemSource && source.guardian_map === map,
    );
    const channelClass = needBoss
        ? "gacha-source-channel gacha-source-channel--boss"
        : "gacha-source-channel gacha-source-channel--guardian";
    if (guardianSource && coin) {
        const popup = createGuardianPopup(coin, guardianSource);
        const existing = popup.getAttribute("class") || "popup_link";
        popup.setAttribute("class", `${existing} ${channelClass}`);
        popup.setAttribute("aria-label", label);
        return popup;
    }
    if (needBoss) {
        return createHTML([
            "span",
            {
                class: "gacha-source-channel gacha-source-channel--boss",
                title: `Boss stage drop: ${prettyGuardianMapName(map)}`,
            },
            label,
        ]);
    }
    return createHTML([
        "span",
        {
            class: "gacha-source-channel gacha-source-channel--guardian",
            title: `Guardian stage drop: ${prettyGuardianMapName(map)}`,
        },
        label,
    ]);
}

/** Kept for contracts that pin the helper name; returns shop + stage channel chips. */
function createGachaAcquisitionChannelElements(gacha: Gacha): HTMLElement[] {
    const coin = shop_items.get(gacha.shop_index);
    const projected = projectGachaAcquisitionChannels(
        {
            ap: gacha.ap,
            enabled: gacha.enabled,
            purchasable: gacha.purchasable,
        },
        collectGachaSourceInputs(coin),
    );
    return projected.map((channel) => {
        if (channel.kind === "shop") {
            return createGachaShopChannelLabel(
                channel.currency,
                channel.available,
                channel.reason,
            );
        }
        return createGachaStageChannelLabel(
            coin,
            channel.map,
            channel.needBoss,
            channel.label,
        );
    });
}

function createGachaSourceSummary(
    item: Item | undefined,
    itemSource: GachaItemSource,
    character?: Character,
) {
    const gacha = gachas.get(itemSource.shop_id);
    if (!gacha) {
        throw "Internal error";
    }
    const channelElements = createGachaAcquisitionChannelElements(gacha);
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
            [
                "div",
                {
                    class: "gacha-acquisition-channels",
                    role: "list",
                    "aria-label": `${gacha.name} sources`,
                },
                ...channelElements.map((element) =>
                    createHTML(["span", { class: "gacha-acquisition-channels__item", role: "listitem" }, element]),
                ),
            ],
        ],
    ]);
}

function sourceItemElement(item: Item, itemSource: ItemSource, character?: Character): (HTMLElement | string)[] {
    if (itemSource instanceof GachaItemSource) {
        return [createGachaSourceSummary(item, itemSource, character)];
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

export type ItemDetailStat = {
    label: string;
    base: number;
    enchanted?: number;
};

export function itemDetailStats(item: Item): ItemDetailStat[] {
    const characterStats = [
        { label: "Strength", base: item.str, enchanted: item.max_str },
        { label: "Dexterity", base: item.dex, enchanted: item.max_dex },
        { label: "Stamina", base: item.sta, enchanted: item.max_sta },
        { label: "Will", base: item.wil, enchanted: item.max_wil },
    ];
    const fixedStats = [
        { label: "Movement", base: item.movement },
        { label: "Charge", base: item.charge },
        { label: "Lob", base: item.lob },
        { label: "Smash", base: item.smash },
        { label: "Serve", base: item.serve },
        { label: "HP", base: item.hp },
        { label: "Quickslots", base: item.quickslots },
        { label: "Buffslots", base: item.buffslots },
    ];

    return [
        ...characterStats
            .filter(stat => stat.base !== 0 || (item.element_enchantable && stat.enchanted !== 0))
            .map(({ label, base, enchanted }) =>
                item.element_enchantable ? { label, base, enchanted } : { label, base }
            ),
        ...fixedStats.filter(stat => stat.base !== 0),
    ];
}

function createItemDetailsContent(item: Item, character?: Character) {
    const stats = itemDetailStats(item);
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
            [
                "p",
                { class: "item-details__stats-note" },
                item.element_enchantable
                    ? "Character stats show base and fully enchanted values."
                    : "This item has base stats only.",
            ],
            stats.length > 0
                ? createHTML([
                    "dl",
                    { class: "item-details__stats" },
                    ...stats.map(({ label, base, enchanted }) => enchanted === undefined
                        ? createHTML([
                            "div",
                            ["dt", label],
                            ["dd", `${base}`],
                        ])
                        : createHTML([
                            "div",
                            {
                                class: "item-stat-comparison",
                                "aria-label": `${label}: base ${base}, enchanted ${enchanted}`,
                            },
                            ["dt", label],
                            [
                                "dd",
                                [
                                    "span",
                                    { class: "item-stat-comparison__value" },
                                    ["small", "Base"],
                                    ["strong", `${base}`],
                                ],
                                [
                                    "span",
                                    { class: "item-stat-comparison__arrow", "aria-hidden": "true" },
                                    "→",
                                ],
                                [
                                    "span",
                                    { class: "item-stat-comparison__value item-stat-comparison__value--enchanted" },
                                    ["small", "Enchanted"],
                                    ["strong", `${enchanted}`],
                                ],
                            ],
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
                `--item-art-image:url("assets/item-art/${encodeURIComponent(sheet)}.webp")`,
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
            ["caption", "Gacha coins by shop currency and stage sources"],
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
            table.appendChild(createHTML([
                "tr",
                [
                    "td",
                    { class: "Name_column Source_column", "data-label": "Gacha" },
                    createGachaSourceSummary(undefined, new GachaItemSource(gacha.shop_index), char),
                ],
            ]));
        }
    }
    return table;
}

export type ResultsTablePlan = {
    table: HTMLTableElement,
    totalRows: number,
    createRow: (index: number) => HTMLTableRowElement,
};

type ItemPrioritizer = ((items: Item[], item: Item) => Item[]) &
    Partial<Pick<PriorityRanker<Item>, "compare" | "sortAll">>;

export function getResultsTablePlan(
    filter: (item: Item) => boolean,
    sourceFilter: (itemSource: ItemSource) => boolean,
    priorizer: ItemPrioritizer,
    priorityStats: string[],
    character?: Character): ResultsTablePlan {
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
            results[item.part].push(item);
        }
    }
    for (const [part, candidates] of Object.entries(results)) {
        results[part] = priorizer.sortAll
            ? priorizer.sortAll(candidates)
            : candidates.reduce(priorizer, []);
    }

    const table = createHTML(
        ["table",
            ["caption", "Matching equipment globally ranked by selected stat priority"],
            ["thead",
                ["tr",
                    ["th", { class: "Name_column", scope: "col" }, "Item"],
                    ["th", { class: "Art_column", scope: "col" }, "Art"],
                    ["th", { class: "Character_column", scope: "col" }, "Character"],
                    ["th", { class: "Part_column", scope: "col" }, "Part"],
                    ...priorityStats.map((stat, index) =>
                        createPriorityStatHeaderCell(stat, index === 0)
                    ),
                    ["th", { class: "Level_column numeric", scope: "col" }, "Level"],
                    ["th", { class: "Source_column", scope: "col" }, "Source"],
                ],
            ],
            ["tbody"],
        ]
    );
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

        // Footer cost must match stats/level: best candidate per slot only.
        // The body still renders the full globally ranked list below.
        statistics.cost = combineCosts(
            costOf(result[0], character && isCharacter(character) ? character : undefined),
            statistics.cost,
        );
    }

    const comparator = priorizer.compare ?? ((lhs: Item, rhs: Item) => {
        if (priorizer([lhs], rhs)[0] === rhs) {
            return -1;
        }
        if (priorizer([rhs], lhs)[0] === lhs) {
            return 1;
        }
        return 0;
    });
    const displayResults = mergePriorityRankings(Object.values(results), comparator);
    const rowInputs: { item: Item, character: Character }[] = [];
    for (const item of displayResults) {
        for (const char of item.character ? [item.character] : characters) {
            statistics.characters.add(char)
            rowInputs.push({ item, character: char });
        }
    }

    const hiddenColumnClasses: string[] = [];
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
        hiddenColumnClasses.push("Character_column");
    }

    for (const attribute of priorityStats) {
        if (priorityStatistics[attribute] === 0) {
            hiddenColumnClasses.push(`${attribute}_column`);
        }
    }

    const hideColumns = (root: HTMLElement) => {
        for (const className of hiddenColumnClasses) {
            for (const columnElement of root.getElementsByClassName(className)) {
                if (columnElement instanceof HTMLElement) {
                    columnElement.hidden = true;
                }
            }
        }
    };
    hideColumns(table);

    return {
        table,
        totalRows: rowInputs.length,
        createRow(index: number) {
            const input = rowInputs[index];
            if (!input) {
                throw new RangeError(`Result row ${index} is out of range`);
            }
            const row = itemToTableRow(
                input.item,
                sourceFilter,
                priorityStats,
                input.character,
            );
            hideColumns(row);
            return row;
        },
    };
}

export function getResultsTable(
    filter: (item: Item) => boolean,
    sourceFilter: (itemSource: ItemSource) => boolean,
    priorizer: ItemPrioritizer,
    priorityStats: string[],
    character?: Character): HTMLTableElement {
    const plan = getResultsTablePlan(
        filter,
        sourceFilter,
        priorizer,
        priorityStats,
        character,
    );
    const tableBody = plan.table.tBodies[0];
    if (!tableBody) {
        throw "Internal error";
    }
    for (let index = 0; index < plan.totalRows; index += 1) {
        tableBody.appendChild(plan.createRow(index));
    }
    return plan.table;
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
