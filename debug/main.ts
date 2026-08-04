import { makeCheckboxTree, TreeNode, getLeafStates, setLeafStates } from './checkboxTree';
import { createPopupLink, downloadItems, getResultsTablePlan, Item, ItemSource, getMaxItemLevel, items, Character, characters, isCharacter, ShopItemSource, GachaItemSource, getGachaTable } from './itemLookup';
import { createHTML } from './html';
import { createPriorityRanker } from './priority';
import { browserFrameScheduler, ProgressiveBatchRenderer } from './progressiveRender';
import { Variable_storage } from './storage';

const partsFilter = [
    "Parts", [
        "Head", [
            "+Hat",
            "+Hair",
            "Dye",
        ],
        "+Upper",
        "+Lower",
        "Legs", [
            "+Shoes",
            "Socks",
        ],
        "Aux", [
            "+Hand",
            "+Backpack",
            "+Face"
        ],
        "+Racket",
    ],
];

const availabilityFilter = [
    "Availability", [
        "Shop", [
            "+Gold",
            "+AP",
        ],
        "+Allow gacha",
        "+Guardian",
        "+Untradable",
        "Unavailable items",
    ],
];

const excluded_item_ids = new Set<number>();

/** Digits-only safe-integer parse for excluded_item_ids localStorage tokens. */
export function parseExcludedItemIdToken(token: string): number | undefined {
    if (!/^\d+$/.test(token)) {
        return undefined;
    }
    const id = Number(token);
    if (!Number.isSafeInteger(id)) {
        return undefined;
    }
    return id;
}

function addFilterTrees() {
    const target = document.getElementById("characterFilters");
    if (!target) {
        return;
    }

    for (const character of ["All", ...characters]) {
        const id = `characterSelectors_${character}`;
        const radio_button = createHTML(["input", { id: id, type: "radio", name: "characterSelectors", value: character }]);
        radio_button.addEventListener("input", updateResults);
        target.appendChild(radio_button);
        target.appendChild(createHTML(["label", { for: id }, character]));
        target.appendChild(createHTML(["br"]));
        if (character === "Niki") {
            radio_button.checked = true;
        }
    }

    const filters: [TreeNode, string][] = [
        [partsFilter, "partsFilter"],
        [availabilityFilter, "availabilityFilter"],
    ];
    for (const [filter, name] of filters) {
        const target = document.getElementById(name);
        if (!target) {
            return;
        }
        const tree = makeCheckboxTree(filter);
        tree.addEventListener("change", updateResults);
        target.innerText = "";
        target.appendChild(tree);
    }
}

addFilterTrees();

let dragged: HTMLElement;
const dragSeparatorLine = createHTML(["hr", { id: "dragOverBar" }]);
let dragHighlightedElement: HTMLElement | undefined;

function createPriorityMoveIcon(direction: "up" | "down"): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "priority-move__icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS(ns, "path");
    path.setAttribute(
        "d",
        direction === "up" ? "M6 14.5 12 8.5l6 6" : "M6 9.5 12 15.5l6-6",
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2.25");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
}

/** Read ranking key from the label node so move controls never pollute stat text. */
export function getPriorityStatLabel(item: Element): string {
    const label = item.querySelector(".priority-stat-label");
    if (label?.textContent) {
        return label.textContent.trim();
    }
    return (item.textContent ?? "").trim();
}

function setPriorityStatLabel(item: HTMLElement, stat: string): void {
    const label = item.querySelector(".priority-stat-label");
    if (label instanceof HTMLElement) {
        label.textContent = stat;
    }
    else {
        item.textContent = stat;
    }
    const up = item.querySelector(".priority-move-up");
    const down = item.querySelector(".priority-move-down");
    if (up instanceof HTMLButtonElement) {
        up.setAttribute("aria-label", `Raise ${stat} priority`);
        up.title = `Raise ${stat}`;
    }
    if (down instanceof HTMLButtonElement) {
        down.setAttribute("aria-label", `Lower ${stat} priority`);
        down.title = `Lower ${stat}`;
    }
}

export function createPriorityListItem(stat: string): HTMLLIElement {
    const up = createHTML([
        "button",
        {
            type: "button",
            class: "priority-move priority-move-up",
            "aria-label": `Raise ${stat} priority`,
            title: `Raise ${stat}`,
        },
    ]);
    up.append(createPriorityMoveIcon("up"));
    const down = createHTML([
        "button",
        {
            type: "button",
            class: "priority-move priority-move-down",
            "aria-label": `Lower ${stat} priority`,
            title: `Lower ${stat}`,
        },
    ]);
    down.append(createPriorityMoveIcon("down"));

    return createHTML([
        "li",
        { class: "dropzone", draggable: "true" },
        ["span", { class: "priority-stat-label" }, stat],
        createHTML(["span", { class: "priority-move-controls" }, up, down]),
    ]);
}

function priorityListItems(list: HTMLOListElement): HTMLLIElement[] {
    return Array.from(list.children).filter(
        (node): node is HTMLLIElement => node instanceof HTMLLIElement && node.classList.contains("dropzone"),
    );
}

function syncRankingSummaryHint(list: HTMLOListElement): void {
    const hint = document.getElementById("priority_summary_hint");
    if (!(hint instanceof HTMLElement)) {
        return;
    }
    const top = priorityListItems(list)[0];
    if (!top) {
        return;
    }
    const label = getPriorityStatLabel(top);
    if (label) {
        hint.textContent = `${label} ranks all equipment`;
    }
}

function syncPriorityMoveButtonState(list: HTMLOListElement): void {
    const items = priorityListItems(list);
    items.forEach((item, index) => {
        const up = item.querySelector(".priority-move-up");
        const down = item.querySelector(".priority-move-down");
        if (up instanceof HTMLButtonElement) {
            up.disabled = index === 0;
        }
        if (down instanceof HTMLButtonElement) {
            down.disabled = index === items.length - 1;
        }
    });
    syncRankingSummaryHint(list);
}

function movePriorityListItem(item: HTMLLIElement, direction: "up" | "down"): void {
    const list = item.parentElement;
    if (!(list instanceof HTMLOListElement)) {
        return;
    }
    let sibling: Element | null = direction === "up" ? item.previousElementSibling : item.nextElementSibling;
    while (sibling && !(sibling instanceof HTMLLIElement && sibling.classList.contains("dropzone"))) {
        sibling = direction === "up" ? sibling.previousElementSibling : sibling.nextElementSibling;
    }
    if (!(sibling instanceof HTMLLIElement)) {
        return;
    }
    if (direction === "up") {
        sibling.before(item);
    }
    else {
        sibling.after(item);
    }
    syncPriorityMoveButtonState(list);
    updateResults();
}

function applyDragDrop() {
    document.addEventListener("dragstart", (event) => {
        const { target } = event;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        if (target.closest(".priority-move, .priority-move-controls")) {
            event.preventDefault();
            return;
        }
        const row = target.classList.contains("dropzone")
            ? target
            : target.closest("#priority_list > li.dropzone");
        if (!(row instanceof HTMLElement)) {
            return;
        }
        dragged = row;
    });

    document.addEventListener("dragover", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }
        const dropzone = event.target.closest("#priority_list > li.dropzone");
        if (dropzone instanceof HTMLElement) {
            const targetRect = dropzone.getBoundingClientRect();
            const y = event.clientY - targetRect.top;
            const height = targetRect.height;
            enum Position {
                above,
                on,
                below,
            }
            const position = y < height * 0.3 ? Position.above : y > height * 0.7 ? Position.below : Position.on;
            switch (position) {
                case Position.above:
                    if (dragHighlightedElement) {
                        dragHighlightedElement.classList.remove("drophover");
                        dragHighlightedElement = undefined;
                    }
                    dragSeparatorLine.hidden = false;
                    dropzone.before(dragSeparatorLine);
                    break;
                case Position.below:
                    if (dragHighlightedElement) {
                        dragHighlightedElement.classList.remove("drophover");
                        dragHighlightedElement = undefined;
                    }
                    dragSeparatorLine.hidden = false;
                    dropzone.after(dragSeparatorLine);
                    break;
                case Position.on:
                    dragSeparatorLine.hidden = true;
                    if (dragHighlightedElement) {
                        dragHighlightedElement.classList.remove("drophover");
                    }
                    if (dragged === dropzone) {
                        break;
                    }
                    dragHighlightedElement = dropzone;
                    dragHighlightedElement.classList.add("drophover");
                    break;
            }
        }
        event.preventDefault();
    });

    document.addEventListener("drop", ({ target }) => {
        if (!dragSeparatorLine.hidden) {
            dragged.remove();
            dragSeparatorLine.after(dragged);
            dragSeparatorLine.hidden = true;
            const list = dragged.parentElement;
            if (list instanceof HTMLOListElement) {
                syncPriorityMoveButtonState(list);
            }
            updateResults();
            return;
        }
        dragSeparatorLine.hidden = true;
        if (!(target instanceof Element)) {
            return;
        }
        if (dragHighlightedElement) {
            dragHighlightedElement.classList.remove("drophover");
            const dropTarget = dragHighlightedElement;
            dragHighlightedElement = undefined;
            if (!(dropTarget instanceof HTMLLIElement)) {
                return;
            }
            const combined = `${getPriorityStatLabel(dropTarget)}+${getPriorityStatLabel(dragged)}`;
            setPriorityStatLabel(dropTarget, combined);
            dragged.remove();
            const list = dropTarget.parentElement;
            if (list instanceof HTMLOListElement) {
                syncPriorityMoveButtonState(list);
            }
        }
        const dropRow = target instanceof HTMLElement && target.classList.contains("dropzone")
            ? target
            : target.closest("#priority_list > li.dropzone");
        if (dropRow === dragged && dragged instanceof HTMLLIElement) {
            const stats = getPriorityStatLabel(dragged).split("+");
            setPriorityStatLabel(dragged, stats.shift()!);
            dragged.after(...stats.map(stat => createPriorityListItem(stat)));
            const list = dragged.parentElement;
            if (list instanceof HTMLOListElement) {
                syncPriorityMoveButtonState(list);
            }
        }
        updateResults();
    });
}

applyDragDrop();

function hydratePriorityListControls(): void {
    const priorityList = document.getElementById("priority_list");
    if (!(priorityList instanceof HTMLOListElement)) {
        return;
    }
    for (const item of priorityListItems(priorityList)) {
        if (!item.querySelector(".priority-stat-label")) {
            const stat = (item.textContent ?? "").trim();
            if (!stat) {
                continue;
            }
            item.replaceWith(createPriorityListItem(stat));
            continue;
        }
        // Static HTML ships empty control shells; fill icons without losing labels.
        for (const button of item.querySelectorAll(".priority-move")) {
            if (!(button instanceof HTMLButtonElement) || button.querySelector("svg")) {
                continue;
            }
            const direction = button.classList.contains("priority-move-up") ? "up" : "down";
            button.append(createPriorityMoveIcon(direction));
        }
    }
    syncPriorityMoveButtonState(priorityList);
}

hydratePriorityListControls();

function compare(lhs: number, rhs: number): -1 | 0 | 1 {
    if (lhs === rhs) {
        return 0;
    }
    return lhs < rhs ? -1 : 1;
}

function getSelectedCharacter(): Character | undefined {
    const characterFilterList = document.getElementsByName("characterSelectors");
    for (const element of characterFilterList) {
        if (!(element instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        if (element.checked) {
            const selection = element.value;
            if (isCharacter(selection)) {
                return selection;
            }
            return;
        }
    }
}

function setSelectedCharacter(character: Character | "All") {
    const characterFilterList = document.getElementsByName("characterSelectors");
    for (const element of characterFilterList) {
        if (!(element instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        if (element.value === character) {
            element.checked = true;
            return;
        }
    }
}


export const itemSelectors = ["partsSelector", "gachaSelector"] as const;
export type ItemSelector = typeof itemSelectors[number];
export function isItemSelector(itemSelector: string): itemSelector is ItemSelector {
    return (itemSelectors as unknown as string[]).includes(itemSelector);
}

function getItemTypeSelection(): ItemSelector {
    const partsSelector = document.getElementById("partsSelector");
    if (!(partsSelector instanceof HTMLInputElement)) {
        throw "Internal error";
    }
    if (partsSelector.checked) {
        return "partsSelector";
    }
    const gachaSelector = document.getElementById("gachaSelector");
    if (!(gachaSelector instanceof HTMLInputElement)) {
        throw "Internal error";
    }
    if (gachaSelector.checked) {
        return "gachaSelector";
    }
    throw "Internal error";
}

function saveSelection() {
    const selectedCharacter = getSelectedCharacter() || "All";
    Variable_storage.set_variable("Character", selectedCharacter);
    {//Filters
        const partsFilterList = document.getElementById("partsFilter")?.children[0];
        if (!(partsFilterList instanceof HTMLUListElement)) {
            throw "Internal error";
        }
        for (const [name, value] of Object.entries(getLeafStates(partsFilterList))) {
            Variable_storage.set_variable(name, value);
        }
        const availabilityFilterList = document.getElementById("availabilityFilter")?.children[0];
        if (!(availabilityFilterList instanceof HTMLUListElement)) {
            throw "Internal error";
        }
        for (const [name, value] of Object.entries(getLeafStates(availabilityFilterList))) {
            Variable_storage.set_variable(name, value);
        }
    }
    { //misc
        const levelrange = document.getElementById("levelrange");
        if (!(levelrange instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        const maxLevel = parseInt(levelrange.value);
        Variable_storage.set_variable("maxLevel", maxLevel);

        const namefilter = document.getElementById("nameFilter");
        if (!(namefilter instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        const item_name = namefilter.value;
        if (item_name) {
            Variable_storage.set_variable("nameFilter", item_name);
        }
        else {
            Variable_storage.delete_variable("nameFilter");
        }
        const enchantToggle = document.getElementById("enchantToggle");
        if (!(enchantToggle instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        Variable_storage.set_variable("enchantToggle", enchantToggle.checked);
    }
    { //item selection
        Variable_storage.set_variable("itemTypeSelector", getItemTypeSelection());
    }

    Variable_storage.set_variable("excluded_item_ids", Array.from(excluded_item_ids).join(","));
}

function restoreSelection() {
    const stored_character = Variable_storage.get_variable("Character");
    setSelectedCharacter(typeof stored_character === "string" && isCharacter(stored_character) ? stored_character : "Niki");

    {//Filters
        let states: { [key: string]: boolean } = {};
        for (const [name, value] of Object.entries(Variable_storage.variables)) {
            if (typeof value === "boolean") {
                states[name] = value;
            }
        }

        const partsFilterList = document.getElementById("partsFilter")?.children[0];
        if (!(partsFilterList instanceof HTMLUListElement)) {
            throw "Internal error";
        }
        setLeafStates(partsFilterList, states);
        const availabilityFilterList = document.getElementById("availabilityFilter")?.children[0];
        if (!(availabilityFilterList instanceof HTMLUListElement)) {
            throw "Internal error";
        }
        setLeafStates(availabilityFilterList, states);
    }
    const levelrange = document.getElementById("levelrange");
    { //misc
        if (!(levelrange instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        const maxLevel = Variable_storage.get_variable("maxLevel");
        if (typeof maxLevel === "number") {
            levelrange.value = `${maxLevel}`;
        }
        else {
            levelrange.value = levelrange.max;
        }

        const namefilter = document.getElementById("nameFilter");
        if (!(namefilter instanceof HTMLInputElement)) {
            throw "Internal error";
        }

        const item_name = Variable_storage.get_variable("nameFilter");
        if (typeof item_name === "string") {
            namefilter.value = item_name;
        }

        const enchantToggle = document.getElementById("enchantToggle");
        if (!(enchantToggle instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        enchantToggle.checked = !!Variable_storage.get_variable("enchantToggle");
    }

    // Rehydrate exclusions before any save-capable event (change/input → updateResults → saveSelection).
    const excluded_ids = Variable_storage.get_variable("excluded_item_ids");
    if (typeof excluded_ids === "string") {
        for (const id of excluded_ids.split(",")) {
            const parsed = parseExcludedItemIdToken(id);
            if (parsed !== undefined) {
                excluded_item_ids.add(parsed);
            }
        }
    }

    { //item selection
        let itemTypeSelector = Variable_storage.get_variable("itemTypeSelector");
        if (typeof itemTypeSelector !== "string" || !isItemSelector(itemTypeSelector)) {
            itemTypeSelector = "partsSelector";
        }
        const selector = document.getElementById(itemTypeSelector);
        if (!(selector instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        selector.checked = true;
        selector.dispatchEvent(new Event("change", { bubbles: false, cancelable: true }));
    }

    //must be last because it triggers a store
    levelrange.dispatchEvent(new Event("input"));
}

const INITIAL_RESULT_ROWS = 24;
const RESULT_ROWS_PER_REQUEST = 240;
const MAX_RESULT_ROWS_PER_FRAME = 96;
const RESULT_FRAME_BUDGET_MS = 8;
let activeResultsRenderer: ProgressiveBatchRenderer<number, HTMLTableRowElement> | undefined;
let activeResultsObserver: IntersectionObserver | undefined;
let resultsRenderVersion = 0;

function updateResults() {
    saveSelection();
    // While first-load lab prep is active, keep friendly loading copy — do not paint
    // an empty inventory ("No items match…") over the animated loader.
    if (document.getElementById("loading_group")?.getAttribute("aria-busy") === "true") {
        return;
    }
    activeResultsRenderer?.cancel();
    activeResultsRenderer = undefined;
    activeResultsObserver?.disconnect();
    activeResultsObserver = undefined;
    const renderVersion = ++resultsRenderVersion;
    const filters: ((item: Item) => boolean)[] = [];
    const sourceFilters: ((itemSource: ItemSource) => boolean)[] = [];
    let selectedCharacter: Character | undefined;
    const partsFilterList = document.getElementById("partsFilter")?.children[0];
    if (!(partsFilterList instanceof HTMLUListElement)) {
        throw "Internal error";
    }
    const enchantToggle = document.getElementById("enchantToggle");
    if (!(enchantToggle instanceof HTMLInputElement)) {
        throw "Internal error";
    }
    const namefilter = document.getElementById("nameFilter");
    if (!(namefilter instanceof HTMLInputElement)) {
        throw "Internal error";
    }

    { //character filter
        selectedCharacter = getSelectedCharacter();
        switch (getItemTypeSelection()) {
            case 'partsSelector':
                if (selectedCharacter) {
                    filters.push(item => item.character === selectedCharacter);
                }
                break;
            case 'gachaSelector':
                break;
        }
    }

    { //parts filter
        switch (getItemTypeSelection()) {
            case 'partsSelector':
                const partsStates = getLeafStates(partsFilterList);
                filters.push(item => partsStates[item.part]);
                break;
            case 'gachaSelector':
                break;
        }
    }

    { //availability filter
        const availabilityFilterList = document.getElementById("availabilityFilter")?.children[0];
        if (!(availabilityFilterList instanceof HTMLUListElement)) {
            throw "Internal error";
        }
        const availabilityStates = getLeafStates(availabilityFilterList);
        if (!availabilityStates["Gold"]) {
            sourceFilters.push(itemSource => !(itemSource instanceof ShopItemSource && !itemSource.ap && itemSource.price > 0));
        }
        if (!availabilityStates["AP"]) {
            sourceFilters.push(itemSource => !(itemSource instanceof ShopItemSource && itemSource.ap && itemSource.price > 0));
        }
        if (!availabilityStates["Untradable"]) {
            filters.push(item => item.parcel_enabled);
        }
        if (!availabilityStates["Allow gacha"]) {
            sourceFilters.push(itemSource => !(itemSource instanceof GachaItemSource));
        }
        if (!availabilityStates["Guardian"]) {
            sourceFilters.push(itemSource => !itemSource.requiresGuardian);
        }
        if (!availabilityStates["Unavailable items"]) {
            const availabilitySourceFilter = [...sourceFilters];
            const sourceFilter = (itemSource: ItemSource) => availabilitySourceFilter.every(filter => filter(itemSource));
            function isAvailableSource(itemSource: ItemSource) {
                if (!sourceFilter(itemSource)) {
                    return false;
                }
                if (itemSource instanceof GachaItemSource) {
                    for (const source of itemSource.item.sources) {
                        if (isAvailableSource(source)) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
                return false;
            }
            sourceFilters.push(isAvailableSource);

            function isAvailableItem(item: Item): boolean {
                for (const itemSource of item.sources) {
                    if (isAvailableSource(itemSource)) {
                        return true;
                    }
                }
                return false;
            }
            filters.push(isAvailableItem);
        }
    }

    { //misc filter
        const levelrange = document.getElementById("levelrange");
        if (!(levelrange instanceof HTMLInputElement)) {
            throw "Internal error";
        }
        const maxLevel = parseInt(levelrange.value);
        filters.push((item: Item) => item.level <= maxLevel);

        const item_name = namefilter.value;
        if (item_name) {
            filters.push(item => item.name_en.toLowerCase().includes(item_name.toLowerCase()));
        }
    }

    { //id filter
        filters.push(item => !excluded_item_ids.has(item.id));
        const itemFilterList = document.getElementById("itemFilter");
        if (!(itemFilterList instanceof HTMLDivElement)) {
            throw "Internal error";

        }
        itemFilterList.replaceChildren();
        if (excluded_item_ids.size === 0) {
            itemFilterList.appendChild(createHTML([
                "p",
                { class: "empty-note" },
                "No excluded items",
            ]));
        }
        else {
            for (const id of excluded_item_ids) {
                const item = items.get(id);
                if (!item) {
                    continue;
                }
                itemFilterList.appendChild(createHTML([
                    "div",
                    { class: "excluded-item" },
                    [
                        "span",
                        { class: "excluded-item__name" },
                        item.name_en,
                    ],
                    createHTML([
                        "button",
                        {
                            class: "item_removal_removal",
                            "data-item_index": `${id}`,
                            "aria-label": `Restore ${item.name_en}`,
                            type: "button",
                        },
                        "Restore",
                    ]),
                ]));
            }
        }

    }

    const comparators: ((lhs: Item, rhs: Item) => number)[] = [];

    const priorityList = document.getElementById("priority_list");
    if (!(priorityList instanceof HTMLOListElement)) {
        throw "Internal error";
    }
    const priorityStats = priorityListItems(priorityList)
        .map(node => getPriorityStatLabel(node))
        .filter(stat => stat.length > 0);
    {
        for (const stat of priorityStats) {
            const stats = stat.split("+");
            comparators.push((lhs: Item, rhs: Item) => compare(
                stats.map(stat => lhs.statFromString(stat)).reduce((n, m) => n + m),
                stats.map(stat => rhs.statFromString(stat)).reduce((n, m) => n + m)
            ));
        }
    }

    const result = (() => {
        switch (getItemTypeSelection()) {
            case 'partsSelector':
                return {
                    kind: "equipment" as const,
                    plan: getResultsTablePlan(
                        item => filters.every(filter => filter(item)),
                        itemSource => sourceFilters.every(filter => filter(itemSource)),
                        createPriorityRanker(comparators),
                        priorityStats,
                        selectedCharacter,
                    ),
                };
            case 'gachaSelector':
                return {
                    kind: "gacha" as const,
                    table: getGachaTable(
                        item => filters.every(filter => filter(item)),
                        selectedCharacter,
                    ),
                };
        }
    })();

    const target = document.getElementById("results");
    if (!target) {
        return;
    }
    const resultsGroup = document.getElementById("results_group");
    const resultsStatus = document.getElementById("resultsStatus");
    const tableScroll = document.getElementById("tableScroll");
    if (tableScroll instanceof HTMLElement) {
        tableScroll.scrollTop = 0;
    }

    if (result.kind === "gacha") {
        const resultRows = result.table.tBodies[0]?.rows.length
            ?? Math.max(0, result.table.rows.length - 1);
        target.replaceChildren();
        if (resultRows === 0) {
            target.appendChild(createHTML([
                "p",
                { class: "results-empty", role: "status" },
                "No items match these filters.",
            ]));
        }
        else {
            target.appendChild(result.table);
        }
        if (resultsStatus) {
            resultsStatus.textContent = resultRows === 0
                ? "No items match these filters."
                : `${resultRows} matching ${resultRows === 1 ? "item" : "items"}`;
        }
        resultsGroup?.setAttribute("aria-busy", "false");
        resultsGroup?.setAttribute("data-render-state", "complete");
        resultsGroup?.setAttribute("data-rendered-rows", `${resultRows}`);
        resultsGroup?.setAttribute("data-total-rows", `${resultRows}`);
        syncResultsTableScroll();
        return;
    }

    const { plan } = result;
    if (plan.totalRows === 0) {
        target.replaceChildren(createHTML([
            "p",
            { class: "results-empty", role: "status" },
            "No items match these filters.",
        ]));
        resultsStatus && (resultsStatus.textContent = "No items match these filters.");
        resultsGroup?.setAttribute("aria-busy", "false");
        resultsGroup?.setAttribute("data-render-state", "complete");
        resultsGroup?.setAttribute("data-rendered-rows", "0");
        resultsGroup?.setAttribute("data-total-rows", "0");
        syncResultsTableScroll();
        return;
    }

    const tableBody = plan.table.tBodies[0];
    if (!tableBody) {
        throw "Internal error";
    }
    target.replaceChildren(plan.table);
    resultsGroup?.setAttribute("aria-busy", "true");
    resultsGroup?.setAttribute("data-render-state", "rendering");
    resultsGroup?.setAttribute("data-results-version", `${renderVersion}`);
    resultsGroup?.setAttribute("data-rendered-rows", "0");
    resultsGroup?.setAttribute("data-total-rows", `${plan.totalRows}`);

    const loadMoreRow = createHTML([
        "tr",
        { class: "results-load-more" },
        ["td",
            { colspan: `${priorityStats.length + 6}` },
            ["button",
                { class: "results-load-more__button", type: "button" },
                "Load more results",
            ],
        ],
    ]);
    const loadMoreButton = loadMoreRow.querySelector("button");
    if (!(loadMoreButton instanceof HTMLButtonElement)) {
        throw "Internal error";
    }

    let renderer: ProgressiveBatchRenderer<number, HTMLTableRowElement>;
    const requestMore = () => {
        if (!renderer.continue()) {
            return;
        }
        loadMoreRow.remove();
        resultsGroup?.setAttribute("aria-busy", "true");
        resultsGroup?.setAttribute("data-render-state", "rendering");
    };
    loadMoreButton.addEventListener("click", requestMore);

    const observer = typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                requestMore();
            }
        }, {
            root: null,
            rootMargin: "320px 0px",
        });
    activeResultsObserver = observer;

    renderer = new ProgressiveBatchRenderer<number, HTMLTableRowElement>({
        scheduler: browserFrameScheduler,
        now: () => performance.now(),
        initialRows: INITIAL_RESULT_ROWS,
        rowsPerRequest: RESULT_ROWS_PER_REQUEST,
        maxRowsPerFrame: MAX_RESULT_ROWS_PER_FRAME,
        frameBudgetMs: RESULT_FRAME_BUDGET_MS,
        create: index => plan.createRow(index),
        commit(rows, state) {
            if (renderVersion !== resultsRenderVersion) {
                return;
            }
            loadMoreRow.remove();
            const fragment = document.createDocumentFragment();
            fragment.append(...rows);
            tableBody.append(fragment);
            resultsGroup?.setAttribute("data-rendered-rows", `${state.rendered}`);
        },
        pause(state) {
            if (renderVersion !== resultsRenderVersion) {
                return;
            }
            tableBody.append(loadMoreRow);
            resultsGroup?.setAttribute("aria-busy", "false");
            resultsGroup?.setAttribute("data-render-state", "partial");
            if (resultsStatus) {
                resultsStatus.textContent =
                    `Showing ${state.rendered} of ${state.total} matching items`;
            }
            syncResultsTableScroll();
        },
        complete(state) {
            if (renderVersion !== resultsRenderVersion) {
                return;
            }
            observer?.disconnect();
            loadMoreRow.remove();
            resultsGroup?.setAttribute("aria-busy", "false");
            resultsGroup?.setAttribute("data-render-state", "complete");
            if (resultsStatus) {
                resultsStatus.textContent =
                    `${state.total} matching ${state.total === 1 ? "item" : "items"}`;
            }
            syncResultsTableScroll();
        },
    });
    activeResultsRenderer = renderer;
    renderer.start(Array.from({ length: plan.totalRows }, (_, index) => index));
    observer?.observe(loadMoreRow);
}

let resultsTableScrollBound = false;
let resultsTableWidthObserver: ResizeObserver | undefined;
let resultsColumnPanRevealed = false;

/** Keep the top column scroller width and scrollLeft aligned with the results table. */
function syncResultsTableScroll() {
    const tableScroll = document.getElementById("tableScroll");
    const tableHScroll = document.getElementById("tableHScroll");
    const spacer = document.getElementById("tableHScrollSpacer");
    const columnPan = document.getElementById("tableColumnPan");
    if (!(tableScroll instanceof HTMLElement)
        || !(tableHScroll instanceof HTMLElement)
        || !(spacer instanceof HTMLElement)
        || !(columnPan instanceof HTMLElement)) {
        return;
    }

    if (!resultsTableScrollBound) {
        resultsTableScrollBound = true;
        let syncing = false;
        const mirror = (source: HTMLElement, target: HTMLElement) => {
            if (syncing) {
                return;
            }
            syncing = true;
            target.scrollLeft = source.scrollLeft;
            syncing = false;
        };
        tableScroll.addEventListener("scroll", () => {
            mirror(tableScroll, tableHScroll);
        }, { passive: true });
        tableHScroll.addEventListener("scroll", () => {
            mirror(tableHScroll, tableScroll);
        }, { passive: true });
        window.addEventListener("resize", () => {
            syncResultsTableScroll();
        }, { passive: true });
        if (typeof ResizeObserver !== "undefined") {
            resultsTableWidthObserver = new ResizeObserver(() => {
                syncResultsTableScroll();
            });
            resultsTableWidthObserver.observe(tableScroll);
        }
    }

    const table = tableScroll.querySelector("table");
    if (!(table instanceof HTMLTableElement)) {
        columnPan.hidden = true;
        columnPan.classList.remove("is-revealed");
        spacer.style.width = "0px";
        return;
    }

    const contentWidth = Math.max(table.scrollWidth, tableScroll.scrollWidth);
    spacer.style.width = `${contentWidth}px`;
    const needsHorizontalScroll = contentWidth > tableScroll.clientWidth + 1;
    const wasHidden = columnPan.hidden;
    columnPan.hidden = !needsHorizontalScroll;
    if (needsHorizontalScroll && !document.activeElement?.isSameNode(tableHScroll)) {
        tableHScroll.scrollLeft = tableScroll.scrollLeft;
    }
    if (needsHorizontalScroll && wasHidden && !resultsColumnPanRevealed) {
        resultsColumnPanRevealed = true;
        columnPan.classList.add("is-revealed");
        window.setTimeout(() => {
            columnPan.classList.remove("is-revealed");
        }, 240);
    }
    if (!needsHorizontalScroll) {
        columnPan.classList.remove("is-revealed");
    }
}

function setMaxLevelDisplayUpdate() {
    const levelDisplay = document.getElementById("levelDisplay");
    if (!(levelDisplay instanceof HTMLLabelElement)) {
        throw "Internal error";
    }
    const levelrange = document.getElementById("levelrange");
    if (!(levelrange instanceof HTMLInputElement)) {
        throw "Internal error";
    }
    levelrange.addEventListener("input", () => {
        levelDisplay.textContent = `Max level requirement: ${levelrange.value}`;
        updateResults();
    });
}

function setDisplayUpdates() {
    setMaxLevelDisplayUpdate();
    const namefilter = document.getElementById("nameFilter");
    if (!(namefilter instanceof HTMLElement)) {
        throw "Internal error";
    }
    namefilter.addEventListener("input", updateResults);

    const enchantToggle = document.getElementById("enchantToggle");
    if (!(enchantToggle instanceof HTMLInputElement)) {
        throw "Internal error";
    }
    const priorityList = document.getElementById("priority_list");
    if (!(priorityList instanceof HTMLOListElement)) {
        throw "Internal error";
    }
    enchantToggle.addEventListener("input", () => {
        for (const node of priorityListItems(priorityList)) {
            const regex = enchantToggle.checked ? /^((?:Str)|(?:Sta)|(?:Dex)|(?:Will))$/ : /^Max ((?:Str)|(?:Sta)|(?:Dex)|(?:Will))$/;
            const replacer = enchantToggle.checked ? "Max $1" : "$1";
            const next = getPriorityStatLabel(node).split("+").map(s => s.replace(regex, replacer)).join("+");
            setPriorityStatLabel(node, next);
        }
        updateResults();
    });
}

setDisplayUpdates();

function setMobileFilterControls() {
    const filterToggle = document.getElementById("filterToggle");
    const closeFilters = document.getElementById("closeFilters");
    const filterPanel = document.getElementById("controlRail");
    const filterBackdrop = document.getElementById("filterBackdrop");
    if (!(filterToggle instanceof HTMLButtonElement)
        || !(closeFilters instanceof HTMLButtonElement)
        || !(filterPanel instanceof HTMLElement)
        || !(filterBackdrop instanceof HTMLButtonElement)) {
        return;
    }
    const toggleButton = filterToggle;
    const closeButton = closeFilters;
    const panel = filterPanel;
    const backdropButton = filterBackdrop;

    function setOpen(open: boolean) {
        panel.classList.toggle("is-open", open);
        toggleButton.setAttribute("aria-expanded", `${open}`);
        backdropButton.hidden = !open;
        document.body.classList.toggle("filters-open", open);
        if (open) {
            const nameFilter = document.getElementById("nameFilter");
            if (nameFilter instanceof HTMLInputElement) {
                const focusAfterOpen = (event: TransitionEvent) => {
                    if (event.propertyName !== "transform") {
                        return;
                    }
                    panel.removeEventListener("transitionend", focusAfterOpen);
                    nameFilter.focus();
                };
                panel.addEventListener("transitionend", focusAfterOpen);
                nameFilter.focus();
            }
        }
        else {
            toggleButton.focus();
        }
    }

    toggleButton.addEventListener("click", () => setOpen(true));
    closeButton.addEventListener("click", () => setOpen(false));
    backdropButton.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
        if (!panel.classList.contains("is-open")) {
            return;
        }
        if (event.key === "Escape") {
            setOpen(false);
            return;
        }
        if (event.key !== "Tab") {
            return;
        }
        const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        )).filter(element => element.getClientRects().length > 0);
        if (focusableElements.length === 0) {
            return;
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
        else if (!event.shiftKey
            && (!panel.contains(document.activeElement) || document.activeElement === lastElement)) {
            event.preventDefault();
            firstElement.focus();
        }
    });
    window.matchMedia("(min-width: 880px)").addEventListener("change", ({ matches }) => {
        if (matches && panel.classList.contains("is-open")) {
            setOpen(false);
        }
    });
}

setMobileFilterControls();

function setResetFilterControl() {
    const resetFilters = document.getElementById("resetFilters");
    const refinementStatus = document.getElementById("refinementStatus");
    if (!(resetFilters instanceof HTMLButtonElement)
        || !(refinementStatus instanceof HTMLElement)) {
        return;
    }
    resetFilters.addEventListener("click", () => {
        refinementStatus.textContent = "Resetting filters…";
        Variable_storage.clear_all();
        window.location.reload();
    });
}

setResetFilterControl();

function setItemTypeSelectorFunctionality() {
    const priority_group = document.getElementById("priority_group");
    if (!(priority_group instanceof HTMLFieldSetElement)) {
        return;
    }
    const partsSelector = document.getElementById("partsSelector");
    if (!(partsSelector instanceof HTMLInputElement)) {
        return;
    }
    const partsFilter = document.getElementById("partsFilter");
    if (!(partsFilter instanceof HTMLDivElement)) {
        return;
    }
    partsSelector.addEventListener("change", () => {
        priority_group.classList.remove("disabled");
        partsFilter.classList.remove("disabled");
        updateResults();
    });

    const gachaSelector = document.getElementById("gachaSelector");
    if (!(gachaSelector instanceof HTMLInputElement)) {
        return;
    }
    gachaSelector.addEventListener("change", () => {
        priority_group.classList.add("disabled");
        partsFilter.classList.add("disabled");
        updateResults();
    });

}

window.addEventListener("load", async () => {
    const resultsGroup = document.getElementById("results_group");
    const resultsStatus = document.getElementById("resultsStatus");
    const loadingLabel = document.getElementById("loading");
    const loadingCopy = document.querySelector(".loading-state__detail")
        ?? document.querySelector(".loading-state__copy span");
    const loadingGroup = document.getElementById("loading_group");
    if (!(resultsStatus instanceof HTMLElement)
        || !(loadingLabel instanceof HTMLLabelElement)
        || !(loadingCopy instanceof HTMLElement)) {
        throw "Internal error";
    }
    resultsGroup?.setAttribute("aria-busy", "true");
    loadingGroup?.setAttribute("aria-busy", "true");
    setItemTypeSelectorFunctionality();
    restoreSelection();
    try {
        await downloadItems();
    } catch {
        resultsStatus.textContent = "Item data unavailable";
        loadingLabel.textContent = "Could not load equipment data";
        loadingCopy.textContent = "Check the preview server connection, then reload this page.";
        resultsGroup?.setAttribute("aria-busy", "false");
        loadingGroup?.setAttribute("aria-busy", "false");
        return;
    }
    for (const element of document.getElementsByClassName("show_after_load")) {
        if (element instanceof HTMLElement) {
            element.hidden = false;
        }
    }
    for (const element of document.getElementsByClassName("hide_after_load")) {
        if (element instanceof HTMLElement) {
            element.style.display = "none";
        }
    }
    const levelrange = document.getElementById("levelrange");
    if (!(levelrange instanceof HTMLInputElement)) {
        throw "Internal error";
    }
    const maxLevel = getMaxItemLevel();
    levelrange.value = `${Math.min(parseInt(levelrange.value), maxLevel)}`;
    levelrange.max = `${maxLevel}`;
    resultsGroup?.setAttribute("aria-busy", "false");
    loadingGroup?.setAttribute("aria-busy", "false");
    levelrange.dispatchEvent(new Event("input"));
    const sort_help = document.getElementById("priority_legend");
    if (sort_help instanceof HTMLLegendElement) {
        sort_help.appendChild(createPopupLink(" (?)", createHTML(["p",
            "Reorder the stats to your liking to affect the results list.", ["br"],
            "Use the up/down arrows, or drag a stat, to change its importance (for example move Lob above Charge).", ["br"],
            "Drag a stat onto another to combine them (for example Str onto Dex, the results will display Str+Dex).", ["br"],
            "Drag a combined stat onto itself to separate them."])));
    }
});

document.body.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const priorityUp = event.target.closest(".priority-move-up");
    if (priorityUp instanceof HTMLButtonElement && !priorityUp.disabled) {
        const row = priorityUp.closest("#priority_list > li.dropzone");
        if (row instanceof HTMLLIElement) {
            movePriorityListItem(row, "up");
        }
        return;
    }

    const priorityDown = event.target.closest(".priority-move-down");
    if (priorityDown instanceof HTMLButtonElement && !priorityDown.disabled) {
        const row = priorityDown.closest("#priority_list > li.dropzone");
        if (row instanceof HTMLLIElement) {
            movePriorityListItem(row, "down");
        }
        return;
    }

    const excludeButton = event.target.closest(".item_removal");
    if (excludeButton instanceof HTMLElement) {
        if (!excludeButton.dataset.item_index) {
            return;
        }
        excluded_item_ids.add(parseInt(excludeButton.dataset.item_index));
        updateResults();
        return;
    }

    const restoreButton = event.target.closest(".item_removal_removal");
    if (restoreButton instanceof HTMLElement) {
        if (!restoreButton.dataset.item_index) {
            return;
        }
        excluded_item_ids.delete(parseInt(restoreButton.dataset.item_index));
        updateResults();
    }
});
