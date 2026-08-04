(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLeafStates = getLeafStates;
exports.makeCheckboxTree = makeCheckboxTree;
exports.setLeafStates = setLeafStates;
var _html = require("./html");
function getChildren(node) {
  const parent_li = node.parentElement;
  if (!(parent_li instanceof HTMLLIElement)) {
    return [];
  }
  const parent_ul = parent_li.parentElement;
  if (!(parent_ul instanceof HTMLUListElement)) {
    return [];
  }
  for (let childIndex = 0; childIndex < parent_ul.children.length; childIndex++) {
    if (parent_ul.children[childIndex] !== parent_li) {
      continue;
    }
    const potentialSiblingEntry = parent_ul.children[childIndex + 1]?.children[0];
    if (!(potentialSiblingEntry instanceof HTMLUListElement)) {
      break;
    }
    return Array.from(potentialSiblingEntry.children).filter(e => e instanceof HTMLLIElement && e.children[0] instanceof HTMLInputElement).map(e => e.children[0]);
  }
  return [];
}
function applyCheckedToDescendants(node) {
  for (const child of getChildren(node)) {
    if (child.checked !== node.checked) {
      child.checked = node.checked;
      child.indeterminate = false;
      applyCheckedToDescendants(child);
    }
  }
}
function getParent(node) {
  const parent_li = node.parentElement?.parentElement?.parentElement;
  if (!(parent_li instanceof HTMLLIElement)) {
    return;
  }
  const parent_ul = parent_li.parentElement;
  if (!(parent_ul instanceof HTMLUListElement)) {
    return;
  }
  let candidate = undefined;
  for (const child of parent_ul.children) {
    if (child instanceof HTMLLIElement && child.children[0] instanceof HTMLInputElement) {
      candidate = child;
      continue;
    }
    if (child === parent_li && candidate) {
      return candidate.children[0];
    }
  }
}
function updateAncestors(node) {
  const parent = getParent(node);
  if (!parent) {
    return;
  }
  let foundChecked = false;
  let foundUnchecked = false;
  let foundIndeterminate = false;
  for (const child of getChildren(parent)) {
    if (child.checked) {
      foundChecked = true;
    } else {
      foundUnchecked = true;
    }
    if (child.indeterminate) {
      foundIndeterminate = true;
    }
  }
  if (foundIndeterminate || foundChecked && foundUnchecked) {
    parent.indeterminate = true;
  } else if (foundChecked) {
    parent.checked = true;
    parent.indeterminate = false;
  } else if (foundUnchecked) {
    parent.checked = false;
    parent.indeterminate = false;
  }
  updateAncestors(parent);
}
function applyCheckListener(node) {
  node.addEventListener("change", e => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    applyCheckedToDescendants(target);
    updateAncestors(target);
  });
}
function applyCheckListeners(node) {
  for (const element of node.children) {
    if (element instanceof HTMLLIElement) {
      applyCheckListener(element.children[0]);
    } else if (element instanceof HTMLUListElement) {
      applyCheckListeners(element);
    }
  }
}
function makeCheckboxTreeNode(treeNode) {
  if (typeof treeNode === "string") {
    let disabled = false;
    if (treeNode[0] === "-") {
      treeNode = treeNode.substring(1);
      disabled = true;
    }
    let checked = false;
    if (treeNode[0] === "+") {
      treeNode = treeNode.substring(1);
      checked = true;
    }
    const node = (0, _html.createHTML)(["li", ["input", {
      type: "checkbox",
      id: treeNode.replaceAll(" ", "_"),
      ...(checked && {
        checked: "checked"
      })
    }], ["label", {
      for: treeNode.replaceAll(" ", "_")
    }, treeNode]]);
    if (disabled) {
      node.classList.add("disabled");
    }
    return node;
  } else {
    const list = (0, _html.createHTML)(["ul", {
      class: "checkbox"
    }]);
    for (let i = 0; i < treeNode.length; i++) {
      const node = treeNode[i];
      list.appendChild(makeCheckboxTreeNode(node));
    }
    return (0, _html.createHTML)(["li", list]);
  }
}
function makeCheckboxTree(treeNode) {
  let root = makeCheckboxTreeNode(treeNode).children[0];
  if (!(root instanceof HTMLUListElement)) {
    throw "Internal error";
  }
  applyCheckListeners(root);
  for (const leaf of getLeaves(root)) {
    updateAncestors(leaf);
  }
  return root;
}
function getLeaves(node) {
  let result = [];
  for (const element of node.children) {
    const input = element.children[0];
    if (input instanceof HTMLInputElement) {
      if (getChildren(input).length === 0) {
        result.push(input);
      }
    } else if (input instanceof HTMLUListElement) {
      result = result.concat(getLeaves(input));
    }
  }
  return result;
}
function getLeafStates(node) {
  let states = {};
  for (const leaf of getLeaves(node)) {
    states[leaf.id.replaceAll("_", " ")] = leaf.checked;
  }
  return states;
}
function setLeafStates(node, states) {
  for (const leaf of getLeaves(node)) {
    const state = states[leaf.id.replaceAll("_", " ")];
    if (typeof state === "undefined") {
      continue;
    }
    leaf.checked = state;
    updateAncestors(leaf);
  }
}

},{"./html":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapArtLookupKeys = mapArtLookupKeys;
exports.parseShopNobuyProductIndexes = parseShopNobuyProductIndexes;
exports.prettyGuardianMapName = prettyGuardianMapName;
exports.projectGachaAcquisitionChannels = projectGachaAcquisitionChannels;
exports.resolveMapArtFile = resolveMapArtFile;
exports.stageChannelLabel = stageChannelLabel;
exports.stageTitleName = stageTitleName;
/**
 * Pure projection of how a gacha coin can be acquired.
 * Shop denomination (Gold/AP) is separate from Guardian/Boss stage drops.
 */
/** Split CamelCase stage ids from JFTSE GuardianStages.json into readable labels. */
function prettyGuardianMapName(map) {
  return map.replace(/([a-z\d])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").trim();
}
function stageChannelLabel(map, needBoss) {
  const pretty = prettyGuardianMapName(map);
  if (!needBoss) {
    return pretty;
  }
  // Avoid "Boss · Atlantis Boss" — stage ids end in Boss already.
  const withoutBossSuffix = pretty.replace(/\s+Boss$/i, "");
  return `Boss · ${withoutBossSuffix}`;
}
/** Strip trailing Boss so titles read "Atlantis", not "Atlantis Boss". */
function stageTitleName(map) {
  return prettyGuardianMapName(map).replace(/\s+Boss$/i, "").trim();
}
/** Candidate stage keys for map art (Boss suffix + bare map name). */
function mapArtLookupKeys(mapName, needBoss = false) {
  const keys = [mapName];
  if (needBoss && !/Boss$/i.test(mapName)) {
    keys.push(`${mapName}Boss`);
  }
  if (/Boss$/i.test(mapName)) {
    keys.push(mapName.replace(/Boss$/i, ""));
  }
  return keys;
}
/**
 * Resolve authentic client map art for a GuardianStages map name.
 * Prefers UI map-select thumbs; falls back to stage-environment textures when catalogued.
 * Never invents art — only returns an explicit catalog mapping.
 */
function resolveMapArtFile(mapName, catalog, options) {
  for (const name of mapArtLookupKeys(mapName, options?.needBoss ?? false)) {
    const key = catalog.byName[name];
    if (key && catalog.files[key]?.file) {
      return catalog.files[key].file;
    }
  }
  if (typeof options?.mapId === "number") {
    const key = catalog.byMapId?.[`${options.mapId}`];
    if (key && catalog.files[key]?.file) {
      return catalog.files[key].file;
    }
  }
  return undefined;
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
function projectGachaAcquisitionChannels(gacha, sources) {
  const channels = [];
  const stageSources = sources.filter(source => source.kind === "stage");
  const hasStage = stageSources.length > 0;
  const currency = gacha.ap ? "AP" : "Gold";
  if (gacha.purchasable) {
    channels.push({
      kind: "shop",
      currency,
      available: true
    });
  } else if (gacha.enabled) {
    // Listed in shop UI / API but blocked by Nobuy — never imply a buy path.
    channels.push({
      kind: "shop",
      currency,
      available: false,
      reason: "not_for_sale"
    });
  } else if (!hasStage) {
    channels.push({
      kind: "shop",
      currency,
      available: false,
      reason: "not_available"
    });
  }
  const seenMaps = new Set();
  for (const stage of stageSources) {
    if (seenMaps.has(stage.map)) {
      continue;
    }
    seenMaps.add(stage.map);
    channels.push({
      kind: "stage",
      map: stage.map,
      needBoss: stage.needBoss,
      label: stageChannelLabel(stage.map, stage.needBoss)
    });
  }
  return channels;
}
/** Parse product indexes with Nobuy≠0 from JFTSE Shop_Ini3.xml text. */
function parseShopNobuyProductIndexes(shopXml) {
  const nobuy = new Set();
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

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHTML = createHTML;
function createHTML(node) {
  const element = document.createElement(node[0]);
  function handle(parameter) {
    if (typeof parameter === "string" || parameter instanceof HTMLElement) {
      element.append(parameter);
    } else if (Array.isArray(parameter)) {
      element.append(createHTML(parameter));
    } else {
      for (const key in parameter) {
        element.setAttribute(key, parameter[key]);
      }
    }
  }
  for (let i = 1; i < node.length; i++) {
    handle(node[i]);
  }
  return element;
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShopItemSource = exports.ItemSource = exports.Item = exports.GuardianItemSource = exports.GachaItemSource = exports.Gacha = void 0;
exports.applyProductStageDrops = applyProductStageDrops;
exports.characters = void 0;
exports.createGachaDetailsTable = createGachaDetailsTable;
exports.createPopupLink = createPopupLink;
exports.createStageDetailsContent = createStageDetailsContent;
exports.createStageRewardArt = createStageRewardArt;
exports.download = download;
exports.downloadItems = downloadItems;
exports.findGachaForShopItem = findGachaForShopItem;
exports.gachas = void 0;
exports.getGachaTable = getGachaTable;
exports.getMaxItemLevel = getMaxItemLevel;
exports.getResultsTable = getResultsTable;
exports.getResultsTablePlan = getResultsTablePlan;
exports.isCharacter = isCharacter;
exports.isItemCurrentlyAvailable = isItemCurrentlyAvailable;
exports.itemDetailStats = itemDetailStats;
exports.items = void 0;
exports.loadingPhaseForUrl = loadingPhaseForUrl;
Object.defineProperty(exports, "priorityStatHeaderDisplay", {
  enumerable: true,
  get: function () {
    return _priorityStatHeaders.priorityStatHeaderDisplay;
  }
});
exports.projectGachaEconomics = projectGachaEconomics;
Object.defineProperty(exports, "projectStageBosses", {
  enumerable: true,
  get: function () {
    return _stageBosses.projectStageBosses;
  }
});
Object.defineProperty(exports, "resolveMapArtFile", {
  enumerable: true,
  get: function () {
    return _gachaAcquisition.resolveMapArtFile;
  }
});
exports.shop_items = void 0;
Object.defineProperty(exports, "stageTitleName", {
  enumerable: true,
  get: function () {
    return _gachaAcquisition.stageTitleName;
  }
});
var _html = require("./html");
var _gachaAcquisition = require("./gachaAcquisition");
var _priorityStatHeaders = require("./priorityStatHeaders");
var _priority = require("./priority");
var _stageBosses = require("./stageBosses");
const characters = exports.characters = ["Niki", "LunLun", "Lucy", "Shua", "Dhanpir", "Pochi", "Al"];
function isCharacter(character) {
  return characters.includes(character);
}
class ItemSource {
  shop_id;
  constructor(shop_id) {
    this.shop_id = shop_id;
  }
  get requiresGuardian() {
    if (this instanceof ShopItemSource) {
      return false;
    } else if (this instanceof GachaItemSource) {
      return [...this.item.sources.values()].every(source => source.requiresGuardian);
    } else if (this instanceof GuardianItemSource) {
      return true;
    } else {
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
exports.ItemSource = ItemSource;
class ShopItemSource extends ItemSource {
  price;
  ap;
  items;
  constructor(shop_id, price, ap, items) {
    super(shop_id);
    this.price = price;
    this.ap = ap;
    this.items = items;
  }
}
exports.ShopItemSource = ShopItemSource;
class GachaItemSource extends ItemSource {
  constructor(shop_id) {
    super(shop_id);
  }
  gachaTries(item, character) {
    const gacha = gachas.get(this.shop_id);
    if (!gacha) {
      throw "Internal error";
    }
    return gacha.average_tries(item, character);
  }
}
exports.GachaItemSource = GachaItemSource;
function projectGachaEconomics(expectedPulls, source) {
  const chancePercent = expectedPulls > 0 ? 100 / expectedPulls : 0;
  if (!source) {
    return {
      availability: "unavailable",
      chancePercent,
      expectedPulls
    };
  }
  return {
    availability: "direct",
    chancePercent,
    currency: source.ap ? "AP" : "Gold",
    expectedPulls,
    expectedSpend: expectedPulls * source.price,
    pricePerPull: source.price
  };
}
class GuardianItemSource extends ItemSource {
  guardian_map;
  items;
  xp;
  need_boss;
  boss_time;
  constructor(guardian_map, items, xp, need_boss, boss_time) {
    super(GuardianItemSource.guardian_map_id(guardian_map));
    this.guardian_map = guardian_map;
    this.items = items;
    this.xp = xp;
    this.need_boss = need_boss;
    this.boss_time = boss_time;
  }
  static guardian_map_id(map) {
    let index = this.guardian_maps.indexOf(map);
    if (index === -1) {
      index = this.guardian_maps.length;
      this.guardian_maps.push(map);
    }
    return -index;
  }
  static guardian_maps = [""];
}
exports.GuardianItemSource = GuardianItemSource;
class Item {
  id = 0;
  name_kr = "";
  name_en = "";
  useType = "";
  maxUse = 0;
  hidden = false;
  resist = "";
  character;
  part = "Other";
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
  sources = [];
  statFromString(name) {
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
exports.Item = Item;
class Gacha {
  shop_index;
  gacha_index;
  name;
  price;
  ap;
  enabled;
  purchasable;
  constructor(shop_index, gacha_index, name, price = 0, ap = false, /** Listed in the live shop catalog (`enabled`). */
  enabled = false,
  /**
   * Can be purchased with Gold/AP. False when Shop_Ini3 `Nobuy≠0`
   * even if the catalog still lists the product as enabled.
   */
  purchasable = true) {
    this.shop_index = shop_index;
    this.gacha_index = gacha_index;
    this.name = name;
    this.price = price;
    this.ap = ap;
    this.enabled = enabled;
    this.purchasable = purchasable;
    for (const character of characters) {
      this.shop_items.set(character, new Map());
    }
  }
  add(item, probability, character, quantity_min, quantity_max) {
    if (item.character && item.character !== character) {
      // Lottery files list every character's gear under each LotteryItem_* block.
      // Route the entry to the item's owning character so filters stay meaningful.
      character = item.character;
    }
    const map = this.shop_items.get(character);
    const previous = map.get(item);
    // Same Item can appear once per character-block (e.g. 7× Dragon Armor at 1%).
    // Accumulate ChansPer instead of overwriting — otherwise rates stay stuck at 1%
    // while character_probability still sums to 100 (map tickets ≪ pool total).
    if (previous) {
      map.set(item, [previous[0] + probability, Math.min(previous[1], quantity_min), Math.max(previous[2], quantity_max)]);
    } else {
      map.set(item, [probability, quantity_min, quantity_max]);
    }
    this.character_probability.set(character, probability + (this.character_probability.get(character) || 0));
  }
  average_tries(item, character = undefined) {
    const chars = character ? [character] : characters;
    const probability = chars.reduce((p, character) => p + (this.shop_items.get(character).get(item)?.[0] || 0), 0);
    if (probability === 0) {
      return 0;
    }
    const total_probability = chars.reduce((p, character) => p + this.character_probability.get(character), 0);
    return total_probability / probability;
  }
  get total_probability() {
    return characters.reduce((p, character) => p + this.character_probability.get(character), 0);
  }
  character_probability = new Map();
  shop_items = new Map();
}
exports.Gacha = Gacha;
let items = exports.items = new Map();
let shop_items = exports.shop_items = new Map();
let gachas = exports.gachas = new Map();
let dialog;
let itemArtMap = {
  items: {},
  lotteries: {},
  sheets: {}
};
let mapArtMap = {
  files: {},
  byName: {}
};
let stageBossCatalog = {
  bosses: {},
  guardians: {},
  stages: {}
};
let bossArtCatalog = {};
function prettyNumber(n, digits) {
  let s = n.toFixed(digits);
  while (s.endsWith("0")) {
    s = s.slice(0, -1);
  }
  if (s.endsWith(".")) {
    s = s.slice(0, -1);
  }
  return s;
}
function parseItemData(data) {
  if (data.length < 1000) {
    console.warn(`Items file is only ${data.length} bytes long`);
  }
  for (const [, result] of data.matchAll(/\<Item (.*)\/\>/g)) {
    const item = new Item();
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
function isApiItem(obj) {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  return [typeof obj.productIndex === "number", typeof obj.display === "number", typeof obj.hitDisplay === "boolean", typeof obj.enabled === "boolean", typeof obj.useType === "string", typeof obj.use0 === "number", typeof obj.use1 === "number", typeof obj.use2 === "number", typeof obj.priceType === "string", typeof obj.oldPrice0 === "number", typeof obj.oldPrice1 === "number", typeof obj.oldPrice2 === "number", typeof obj.price0 === "number", typeof obj.price1 === "number", typeof obj.price2 === "number", typeof obj.couplePrice === "number", typeof obj.category === "string", typeof obj.name === "string", typeof obj.goldBack === "number", typeof obj.enableParcel === "boolean", typeof obj.forPlayer === "number", typeof obj.item0 === "number", typeof obj.item1 === "number", typeof obj.item2 === "number", typeof obj.item3 === "number", typeof obj.item4 === "number", typeof obj.item5 === "number", typeof obj.item6 === "number", typeof obj.item7 === "number", typeof obj.item8 === "number", typeof obj.item9 === "number"].every(b => b);
}
/** Product indexes that reject shop buys (Shop_Ini3 Nobuy≠0). Live API omits this field. */
let shopNobuyProductIndexes = new Set();
function isShopPurchasable(productIndex, enabled) {
  return enabled && !shopNobuyProductIndexes.has(productIndex);
}
function parseApiShopData(data) {
  for (const apiItem of JSON.parse(data)) {
    if (!isApiItem(apiItem)) {
      console.error(`Incorrect format of item: ${data}`);
      continue;
    }
    const inner_items = [apiItem.item0, apiItem.item1, apiItem.item2, apiItem.item3, apiItem.item4, apiItem.item5, apiItem.item6, apiItem.item7, apiItem.item8, apiItem.item9].filter(id => !!id && items.get(id)).map(id => items.get(id));
    const purchasable = isShopPurchasable(apiItem.productIndex, apiItem.enabled);
    if (apiItem.category === "PARTS") {
      if (inner_items.length === 1) {
        shop_items.set(apiItem.productIndex, inner_items[0]);
      } else {
        const item = new Item();
        item.name_en = apiItem.name;
        shop_items.set(apiItem.productIndex, item);
      }
      // Only real purchase paths count as shop sources (exclude Nobuy catalog rows).
      if (purchasable) {
        const itemSource = new ShopItemSource(apiItem.productIndex, apiItem.price0, apiItem.priceType === "MINT", inner_items);
        for (const item of inner_items) {
          item.sources.push(itemSource);
        }
      }
    } else if (apiItem.category === "LOTTERY") {
      gachas.set(apiItem.productIndex, new Gacha(apiItem.productIndex, apiItem.item0, apiItem.name, apiItem.price0, apiItem.priceType === "MINT", apiItem.enabled, purchasable));
      const gachaItem = new Item();
      // Product index is the shop_items / gachas key — required so reward tiles
      // can resolve coin art with gachas.get(item.id) the same way the table does.
      gachaItem.id = apiItem.productIndex;
      gachaItem.name_en = apiItem.name;
      shop_items.set(apiItem.productIndex, gachaItem);
      if (purchasable) {
        gachaItem.sources.push(new ShopItemSource(apiItem.productIndex, apiItem.price0, apiItem.priceType === "MINT", inner_items));
      }
    } else {
      const otherItem = new Item();
      otherItem.id = apiItem.productIndex;
      otherItem.name_en = apiItem.name;
      shop_items.set(apiItem.productIndex, otherItem);
    }
  }
}
function parseGachaData(data, gacha) {
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
    for (const [item] of map) {
      item.sources.push(new GachaItemSource(gacha.shop_index));
    }
  }
}
function parseGuardianData(data) {
  const guardianData = JSON.parse(data);
  if (!Array.isArray(guardianData)) {
    return;
  }
  function getNumber(o) {
    if (typeof o === "number") {
      return o;
    }
  }
  const bossTimeInfo = new Map();
  for (const mapInfo of guardianData) {
    if (typeof mapInfo !== "object") {
      continue;
    }
    const map_name = mapInfo.Name;
    if (typeof map_name !== "string") {
      continue;
    }
    const rewards = Array.isArray(mapInfo.Rewards) ? [...mapInfo.Rewards] : [];
    const reward_items = rewards.filter(shop_id => typeof shop_id === "number" && shop_items.has(shop_id)).map(shop_id => shop_items.get(shop_id));
    const ExpMultiplier = getNumber(mapInfo.ExpMultiplier) || 0;
    const IsBossStage = !!mapInfo.IsBossStage;
    const MapID = getNumber(mapInfo.MapId) || 0;
    let BossTriggerTimerInSeconds = getNumber(mapInfo.BossTriggerTimerInSeconds) || -1;
    if (BossTriggerTimerInSeconds === -1) {
      BossTriggerTimerInSeconds = bossTimeInfo.get(MapID) || -1;
    } else {
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
/**
 * Merge S_Relationships-derived boss/map drops onto shop products.
 * Dedupes by guardian map name so GuardianStages Rewards paths are not doubled.
 * This is what makes Nobuy coins like Blue Capsule answer "where do I get this?".
 */
function applyProductStageDrops(catalog) {
  const products = catalog.products;
  if (!products || typeof products !== "object") {
    return;
  }
  for (const [productKey, drops] of Object.entries(products)) {
    const productIndex = Number(productKey);
    if (!Number.isFinite(productIndex) || !Array.isArray(drops)) {
      continue;
    }
    const item = shop_items.get(productIndex);
    if (!item) {
      continue;
    }
    const existingMaps = new Set(item.sources.filter(source => source instanceof GuardianItemSource).map(source => source.guardian_map));
    for (const drop of drops) {
      if (!drop || typeof drop.map !== "string" || drop.map.length === 0) {
        continue;
      }
      if (existingMaps.has(drop.map)) {
        continue;
      }
      existingMaps.add(drop.map);
      item.sources.push(new GuardianItemSource(drop.map, [item], typeof drop.xp === "number" ? drop.xp : 0, !!drop.needBoss, typeof drop.bossTime === "number" ? drop.bossTime : -1));
    }
  }
}
/** User-facing lab-prep phases — never expose raw filenames, paths, or XML names. */
function loadingPhaseForUrl(url) {
  if (url.includes("Item_Parts")) {
    return {
      title: "Preparing equipment catalog…",
      detail: "Gathering every wearable for comparison."
    };
  }
  if (url.includes("/api/shop")) {
    return {
      title: "Checking the live shop…",
      detail: "Reading Gold and AP listings."
    };
  }
  if (url.includes("GuardianStages") || url.includes("product-stage-drops")) {
    return {
      title: "Mapping stage rewards…",
      detail: "Finding where gear and coins drop."
    };
  }
  if (url.includes("Ini3_Lot") || url.includes("lottery")) {
    return {
      title: "Loading gacha tables…",
      detail: "Matching capsules to their prizes."
    };
  }
  if (url.includes("item-art") || url.includes("shop-nobuy")) {
    return {
      title: "Finishing the lab…",
      detail: "Syncing art and sale status."
    };
  }
  return {
    title: "Opening the equipment lab…",
    detail: "Almost ready to compare gear."
  };
}
function setLoadingPhase(url) {
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
async function download(url) {
  setLoadingPhase(url);
  const reply = await fetch(url);
  const progressbar = document.getElementById("progressbar");
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value++;
  }
  if (!reply.ok) {
    // Keep technical URL detail in the thrown error for logs; UI uses human copy.
    throw new Error(`Failed downloading ${url}: ${reply.status}${reply.statusText ? ` ${reply.statusText}` : ""}`);
  }
  return reply.text();
}
async function downloadItems() {
  const progressbar = document.getElementById("progressbar");
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value = 0;
    progressbar.max = 124;
  }
  const itemSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/auth-server/src/main/resources/res";
  const gachaSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/game-server/src/main/resources/res/lottery";
  const guardianSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/server-core/src/main/resources/res";
  const itemURL = itemSource + "/Item_Parts_Ini3.xml";
  const itemData = download(itemURL);
  // Compact Nobuy index (from Shop_Ini3) — live shop API omits this field.
  const shopNobuyData = download("assets/shop-nobuy-indexes.json");
  // Boss/map drops from S_Relationships (beyond GuardianStages Rewards lists).
  const productStageDropsData = download("assets/product-stage-drops.json");
  const itemArtData = download("assets/item-art-map.json");
  const mapArtData = download("assets/map-art-map.json");
  const stageBossData = download("assets/stage-bosses.json");
  const bossArtData = download("assets/boss-art-map.json");
  const max_shop_pages = 20; //currently need only 10, should be enough
  const shopURLs = location.hostname.endsWith(".github.io") ? [...Array(max_shop_pages).keys()].map(n => new URL(`shop/${n}.json`, document.baseURI).href) : [...Array(max_shop_pages).keys()].map(n => `/api/shop?size=1000&page=${n}`);
  const shopDatas = shopURLs.map(download);
  const guardianURL = guardianSource + "/GuardianStages.json";
  const guardianData = download(guardianURL);
  parseItemData(await itemData);
  itemArtMap = JSON.parse(await itemArtData);
  try {
    mapArtMap = JSON.parse(await mapArtData);
  } catch (e) {
    console.warn(`Failed loading map art catalog: ${e}`);
    mapArtMap = {
      files: {},
      byName: {}
    };
  }
  try {
    stageBossCatalog = JSON.parse(await stageBossData);
  } catch (e) {
    console.warn(`Failed loading stage boss catalog: ${e}`);
    stageBossCatalog = {
      bosses: {},
      guardians: {},
      stages: {}
    };
  }
  try {
    bossArtCatalog = JSON.parse(await bossArtData);
  } catch (e) {
    console.warn(`Failed loading boss art catalog: ${e}`);
    bossArtCatalog = {};
  }
  try {
    const nobuyJson = JSON.parse(await shopNobuyData);
    const indexes = Array.isArray(nobuyJson.productIndexes) ? nobuyJson.productIndexes.filter(n => typeof n === "number") : [];
    shopNobuyProductIndexes = new Set(indexes);
  } catch (e) {
    console.warn(`Failed loading shop Nobuy index: ${e}`);
    shopNobuyProductIndexes = new Set();
  }
  await Promise.all(shopDatas.map(p => p.then(data => parseApiShopData(data))));
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value = 0;
    progressbar.max = gachas.size + 4;
  }
  const gacha_items = [];
  for (const [, gacha] of gachas) {
    const gacha_url = `${gachaSource}/Ini3_Lot_${`${gacha.gacha_index}`.padStart(2, "0")}.xml`;
    gacha_items.push([download(gacha_url), gacha, gacha_url]);
  }
  parseGuardianData(await guardianData);
  try {
    applyProductStageDrops(JSON.parse(await productStageDropsData));
  } catch (e) {
    console.warn(`Failed loading product stage drops: ${e}`);
  }
  for (const [item, gacha, gacha_url] of gacha_items) {
    try {
      parseGachaData(await item, gacha);
    } catch (e) {
      console.warn(`Failed downloading ${gacha_url} because ${e}`);
    }
  }
}
/** Ban/circle-slash icon for exclude — outline SVG, recolored via currentColor. */
function createExcludeIcon() {
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
function deletableItem(item, character) {
  const excludeLabel = `Exclude ${item.name_en} from results`;
  const excludeButton = (0, _html.createHTML)(["button", {
    class: "item_removal",
    "data-item_index": `${item.id}`,
    "aria-label": excludeLabel,
    type: "button",
    title: excludeLabel
  }]);
  excludeButton.append(createExcludeIcon());
  return (0, _html.createHTML)(["div", {
    class: "item-identity"
  }, excludeButton, ["div", {
    class: "item-identity__meta"
  }, createItemDetailsTrigger(item, character), createItemAvailabilityBadge(item)]]);
}
function lockBackgroundScroll() {
  document.documentElement.classList.add("dialog-open");
}
function unlockBackgroundScroll() {
  document.documentElement.classList.remove("dialog-open");
}
function showDialog(trigger, label, content, dialogClass) {
  const topDiv = document.getElementById("top_div");
  if (!(topDiv instanceof HTMLDivElement)) {
    return;
  }
  if (dialog) {
    const previous = dialog;
    previous.close();
    previous.remove();
  }
  const closeButton = (0, _html.createHTML)(["button", {
    class: dialogClass ? `${dialogClass}__close` : "dialog__close",
    type: "button"
  }, "Close"]);
  const attributes = {
    ...(dialogClass ? {
      class: dialogClass
    } : {}),
    "aria-label": label
  };
  dialog = Array.isArray(content) ? (0, _html.createHTML)(["dialog", attributes, ...content, closeButton]) : (0, _html.createHTML)(["dialog", attributes, content, closeButton]);
  trigger.setAttribute("aria-expanded", "true");
  closeButton.addEventListener("click", () => dialog?.close());
  dialog.addEventListener("close", () => {
    trigger.setAttribute("aria-expanded", "false");
    dialog?.remove();
    dialog = undefined;
    unlockBackgroundScroll();
    trigger.focus();
  }, {
    once: true
  });
  topDiv.appendChild(dialog);
  dialog.showModal();
  lockBackgroundScroll();
}
function createPopupLink(text, content, dialogClass) {
  const button = (0, _html.createHTML)(["button", {
    class: "popup_link",
    type: "button",
    "aria-haspopup": "dialog",
    "aria-expanded": "false"
  }, text]);
  button.addEventListener("click", event => {
    event.stopPropagation();
    showDialog(button, `${text} details`, content, dialogClass);
  });
  return button;
}
function createPriorityStatHeaderCell(stat, primary) {
  const {
    short,
    full,
    abbreviated
  } = (0, _priorityStatHeaders.priorityStatHeaderDisplay)(stat);
  const attributes = {
    class: "numeric",
    scope: "col",
    ...(primary ? {
      "aria-sort": "descending"
    } : {})
  };
  if (!abbreviated) {
    return (0, _html.createHTML)(["th", attributes, short]);
  }
  const popup = createPopupLink(short, (0, _html.createHTML)(["p", full]));
  popup.setAttribute("title", full);
  popup.setAttribute("aria-label", full);
  popup.classList.add("priority-stat-header");
  return (0, _html.createHTML)(["th", attributes, popup]);
}
function quantityString(quantity_min, quantity_max) {
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
function createGachaDetailsTable(gacha, highlightedItem, character) {
  const content = (0, _html.createHTML)(["table", ["tr", ["th", "Item"], ["th", "Chance"], ["th", "Expected pulls"]]]);
  // Character filter: accumulate by Item identity (historical math).
  // Unfiltered: collapse by display name + quantity so per-character clones are one row.
  const byItem = character ? new Map() : undefined;
  const byName = character ? undefined : new Map();
  for (const char of character === undefined ? characters : [character]) {
    const char_items = gacha.shop_items.get(char);
    if (!char_items) {
      continue;
    }
    for (const [char_gacha_item, [tickets, quantity_min, quantity_max]] of char_items) {
      // Character-filtered: keep historical denominator (item character, else filter, else total).
      // Unfiltered collapse: rates are within each character's pool (pools mirror; first row wins).
      // Using total_probability for shared items would dilute ~7× and reintroduce wrong rates.
      const item_tickets = character === undefined ? gacha.character_probability.get(char) : (() => {
        const item_character = char_gacha_item.character || character;
        return item_character ? gacha.character_probability.get(item_character) : gacha.total_probability;
      })();
      const probability = tickets / item_tickets;
      if (byItem) {
        const previous = byItem.get(char_gacha_item);
        byItem.set(char_gacha_item, {
          item: char_gacha_item,
          probability: (previous?.probability ?? 0) + probability,
          quantity_min,
          quantity_max
        });
        continue;
      }
      const key = `${char_gacha_item.name_en}\0${quantity_min}\0${quantity_max}`;
      if (!byName.has(key)) {
        byName.set(key, {
          item: char_gacha_item,
          probability,
          quantity_min,
          quantity_max
        });
      }
    }
  }
  const rows = byItem ? [...byItem.values()] : [...byName.values()];
  for (const row of rows) {
    const highlighted = highlightedItem !== undefined && (highlightedItem === row.item || character === undefined && highlightedItem.name_en === row.item.name_en);
    content.appendChild((0, _html.createHTML)(["tr", highlighted ? {
      class: "highlighted"
    } : "", ["td", row.item.name_en, quantityString(row.quantity_min, row.quantity_max)], ["td", {
      class: "numeric"
    }, `${prettyNumber(row.probability * 100, 2)}%`], ["td", {
      class: "numeric"
    }, `${prettyNumber(1 / row.probability, 2)}`]]));
  }
  return content;
}
function createGachaSourcePopup(item, itemSource, character) {
  const gacha = gachas.get(itemSource.shop_id);
  if (!gacha) {
    throw "Internal error";
  }
  const probabilityTable = (0, _html.createHTML)(["div", {
    class: "gacha-probability-dialog__scroll",
    role: "region",
    tabindex: "0",
    "aria-label": `${itemSource.item.name_en} probabilities`
  }, createGachaDetailsTable(gacha, item, character)]);
  return createPopupLink(itemSource.item.name_en, probabilityTable, "gacha-probability-dialog");
}
function createSetSourcePopup(item, itemSource) {
  const contentTable = (0, _html.createHTML)(["table", ["tr", ["th", "Contents"]]]);
  for (const inner_item of itemSource.items) {
    contentTable.appendChild((0, _html.createHTML)(["tr", inner_item === item ? {
      class: "highlighted"
    } : "", ["td", inner_item.name_en]]));
  }
  // Dialog aria-label already carries the set name — only show the contents table.
  return createPopupLink(itemSource.item.name_en, contentTable);
}
function resolveBossArtFile(bossId, resId) {
  const byId = bossArtCatalog.byBossId?.[`${bossId}`];
  if (byId) {
    return byId;
  }
  if (typeof resId === "number") {
    return bossArtCatalog.byResId?.[`${resId}`];
  }
  return undefined;
}
function createBossPortrait(projection) {
  const primary = projection.bosses[0];
  const bossName = primary?.name ?? (projection.isBossStage ? "Boss" : "Guardian");
  const file = primary ? resolveBossArtFile(primary.id, primary.resId) : undefined;
  if (file) {
    return (0, _html.createHTML)(["div", {
      class: "stage-details__portrait",
      "data-has-boss-art": "true"
    }, ["img", {
      class: "stage-details__portrait-image",
      src: `assets/boss-art/${encodeURIComponent(file)}`,
      alt: `Boss artwork for ${bossName}`,
      width: "128",
      height: "128",
      decoding: "async"
    }]]);
  }
  return (0, _html.createHTML)(["div", {
    class: "stage-details__portrait stage-details__portrait--fallback",
    role: "img",
    "aria-label": `Boss artwork unavailable for ${bossName}`,
    "data-has-boss-art": "false"
  }, ["span", {
    "aria-hidden": "true"
  }, bossName.slice(0, 1).toUpperCase()]]);
}
/**
 * Resolve the Gacha behind a shop product Item (stage rewards are shop_items entries).
 * Lottery items used to leave item.id at 0 — still support reverse lookup for those.
 */
function findGachaForShopItem(item) {
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
function createStageRewardArt(item) {
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
function createStageBossList(projection) {
  if (projection.bossNames.length === 0 && projection.sideGuardianNames.length === 0) {
    return undefined;
  }
  const bossItems = projection.bosses.map(boss => {
    const file = resolveBossArtFile(boss.id, boss.resId);
    const thumb = file ? (0, _html.createHTML)(["img", {
      class: "stage-details__boss-thumb",
      src: `assets/boss-art/${encodeURIComponent(file)}`,
      alt: "",
      width: "40",
      height: "40",
      decoding: "async",
      "aria-hidden": "true"
    }]) : (0, _html.createHTML)(["span", {
      class: "stage-details__boss-thumb stage-details__boss-thumb--fallback",
      "aria-hidden": "true"
    }, boss.name.slice(0, 1)]);
    return (0, _html.createHTML)(["li", {
      class: "stage-details__boss-item stage-details__boss-item--primary"
    }, thumb, ["span", {
      class: "stage-details__boss-role"
    }, "Boss"], ["span", {
      class: "stage-details__boss-name"
    }, boss.name]]);
  });
  // GuardiansLeft/Right/Middle are a spawn *pool* — one left + one right at fight time.
  const sideNote = projection.sideGuardianNames.length > 0 ? (0, _html.createHTML)(["div", {
    class: "stage-details__side-pool"
  }, ["p", {
    class: "stage-details__side-pool-label"
  }, `Side companions (pool of ${projection.sideGuardianNames.length})`], ["p", {
    class: "stage-details__side-pool-names"
  }, projection.sideGuardianNames.join(" · ")], ["p", {
    class: "stage-details__side-pool-hint"
  }, "One left and one right spawn with the boss; the rest are possible draws."]]) : undefined;
  const section = (0, _html.createHTML)(["section", {
    class: "stage-details__section",
    "aria-labelledby": "stage-details-bosses"
  }, ["h3", {
    id: "stage-details-bosses"
  }, projection.bossNames.length > 1 ? "Bosses" : "Boss"], ["ul", {
    class: "stage-details__bosses"
  }, ...bossItems]]);
  if (sideNote) {
    section.appendChild(sideNote);
  }
  return section;
}
/**
 * Stage dossier for Guardian / Boss map chips: boss portrait, JFTSE boss names,
 * readable facts, and reward list with the same art as the results table.
 */
function createStageDetailsContent(item, itemSource) {
  const isBoss = itemSource.need_boss;
  const title = (0, _gachaAcquisition.stageTitleName)(itemSource.guardian_map);
  const eyebrow = isBoss ? "Boss stage" : "Guardian stage";
  const bossProjection = (0, _stageBosses.projectStageBosses)(itemSource.guardian_map, isBoss, stageBossCatalog);
  const rewards = itemSource.items.length > 0 ? (0, _html.createHTML)(["ul", {
    class: "stage-details__rewards"
  }, ...itemSource.items.map(reward => (0, _html.createHTML)(["li", {
    class: reward === item ? "stage-details__reward stage-details__reward--current" : "stage-details__reward"
  }, createStageRewardArt(reward), ["span", {
    class: "stage-details__reward-name"
  }, reward.name_en], ...(reward === item ? [(0, _html.createHTML)(["span", {
    class: "stage-details__reward-badge"
  }, "This item"])] : [])]))]) : (0, _html.createHTML)(["p", {
    class: "stage-details__empty"
  }, "No listed rewards for this stage."]);
  const bossSection = createStageBossList(bossProjection);
  const identity = (0, _html.createHTML)(["div", {
    class: "stage-details__identity"
  }, ["span", {
    class: "stage-details__eyebrow"
  }, eyebrow], ["h2", title]]);
  const header = (0, _html.createHTML)(["header", {
    class: "stage-details__header"
  }, createBossPortrait(bossProjection), identity]);
  const article = (0, _html.createHTML)(["article", {
    class: isBoss ? "stage-details stage-details--boss" : "stage-details stage-details--guardian"
  }, header]);
  if (bossSection) {
    article.appendChild(bossSection);
  }
  article.appendChild((0, _html.createHTML)(["section", {
    class: "stage-details__section",
    "aria-labelledby": "stage-details-rewards"
  }, ["h3", {
    id: "stage-details-rewards"
  }, "Rewards"], rewards]));
  return article;
}
function createGuardianPopup(item, itemSource) {
  const mapLabel = (0, _gachaAcquisition.stageChannelLabel)(itemSource.guardian_map, itemSource.need_boss);
  return createPopupLink(mapLabel, createStageDetailsContent(item, itemSource), "stage-details-dialog");
}
function itemSourcesToElementArray(item, sourceFilter, character) {
  return [...item.sources.values()].filter(sourceFilter).map(itemSource => sourceItemElement(item, itemSource, character));
}
function elementClassTokens(element) {
  // Prefer className over classList — the unit DOM harness sets className via
  // setAttribute("class") and does not implement a full classList.
  const raw = typeof element.className === "string" ? element.className : element.getAttribute("class") || "";
  return raw.split(/\s+/).filter(Boolean);
}
function isGachaSourceGroup(elements) {
  return elements.some(element => typeof element !== "string" && elementClassTokens(element).includes("gacha-source-summary"));
}
function makeSourcesList(list) {
  const result = [];
  function add(element) {
    if (typeof element === "string" && typeof result[result.length - 1] === "string") {
      result[result.length - 1] = result[result.length - 1] + element;
      return;
    }
    result.push(element);
  }
  let previousGroup;
  for (const elements of list) {
    if (elements.length === 0) {
      add(" ");
      continue;
    }
    // Comma between shop/set/guardian paths so dual prices stay legible
    // ("50000 Gold, Supporter Set 350000 Gold"). Never next to gacha coin cards —
    // those are block summaries and a text comma becomes a visual break.
    if (previousGroup !== undefined && !isGachaSourceGroup(previousGroup) && !isGachaSourceGroup(elements)) {
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
function isAvailableItemSource(itemSource) {
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
function isItemCurrentlyAvailable(item) {
  for (const source of item.sources) {
    if (isAvailableItemSource(source)) {
      return true;
    }
  }
  return false;
}
function createItemAvailabilityBadge(item) {
  if (isItemCurrentlyAvailable(item)) {
    return "";
  }
  return (0, _html.createHTML)(["span", {
    class: "item-availability item-availability--unavailable",
    title: "No enabled shop, gacha, or Guardian path in the live shop data"
  }, "Not in game"]);
}
function collectGachaSourceInputs(coin) {
  if (!coin) {
    return [];
  }
  const inputs = [];
  for (const source of coin.sources) {
    if (source instanceof ShopItemSource) {
      inputs.push({
        kind: "shop",
        ap: source.ap
      });
    } else if (source instanceof GuardianItemSource) {
      inputs.push({
        kind: "stage",
        map: source.guardian_map,
        needBoss: source.need_boss
      });
    }
  }
  return inputs;
}
function createGachaShopChannelLabel(currency, available, reason) {
  if (available) {
    if (currency === "AP") {
      return (0, _html.createHTML)(["span", {
        class: "gacha-currency gacha-currency--ap"
      }, "AP"]);
    }
    return (0, _html.createHTML)(["span", {
      class: "gacha-currency gacha-currency--gold"
    }, "Gold"]);
  }
  if (reason === "not_for_sale") {
    return (0, _html.createHTML)(["span", {
      class: "gacha-shop-status gacha-shop-status--not-for-sale",
      title: `${currency} product is listed in the shop catalog but cannot be purchased (Nobuy)`
    }, "Not for sale"]);
  }
  return (0, _html.createHTML)(["span", {
    class: "gacha-shop-status gacha-shop-status--not-available",
    title: `${currency} coin is not currently sold in the live shop`
  }, `${currency} · Not available`]);
}
function createGachaStageChannelLabel(coin, map, needBoss, label) {
  const guardianSource = coin?.sources.find(source => source instanceof GuardianItemSource && source.guardian_map === map);
  const channelClass = needBoss ? "gacha-source-channel gacha-source-channel--boss" : "gacha-source-channel gacha-source-channel--guardian";
  if (guardianSource && coin) {
    const popup = createGuardianPopup(coin, guardianSource);
    const existing = popup.getAttribute("class") || "popup_link";
    popup.setAttribute("class", `${existing} ${channelClass}`);
    popup.setAttribute("aria-label", label);
    return popup;
  }
  if (needBoss) {
    return (0, _html.createHTML)(["span", {
      class: "gacha-source-channel gacha-source-channel--boss",
      title: `Boss stage drop: ${(0, _gachaAcquisition.prettyGuardianMapName)(map)}`
    }, label]);
  }
  return (0, _html.createHTML)(["span", {
    class: "gacha-source-channel gacha-source-channel--guardian",
    title: `Guardian stage drop: ${(0, _gachaAcquisition.prettyGuardianMapName)(map)}`
  }, label]);
}
/** Kept for contracts that pin the helper name; returns shop + stage channel chips. */
function createGachaCurrencyLabel(gacha) {
  const channels = createGachaAcquisitionChannelElements(gacha);
  if (channels.length === 1) {
    return channels[0];
  }
  return (0, _html.createHTML)(["span", {
    class: "gacha-acquisition-channels"
  }, ...channels]);
}
function createGachaAcquisitionChannelElements(gacha) {
  const coin = shop_items.get(gacha.shop_index);
  const projected = (0, _gachaAcquisition.projectGachaAcquisitionChannels)({
    ap: gacha.ap,
    enabled: gacha.enabled,
    purchasable: gacha.purchasable
  }, collectGachaSourceInputs(coin));
  return projected.map(channel => {
    if (channel.kind === "shop") {
      return createGachaShopChannelLabel(channel.currency, channel.available, channel.reason);
    }
    return createGachaStageChannelLabel(coin, channel.map, channel.needBoss, channel.label);
  });
}
function createGachaSourceSummary(item, itemSource, character) {
  const gacha = gachas.get(itemSource.shop_id);
  if (!gacha) {
    throw "Internal error";
  }
  const channelElements = createGachaAcquisitionChannelElements(gacha);
  return (0, _html.createHTML)(["div", {
    class: "gacha-source-summary",
    role: "group",
    "aria-label": `${gacha.name} acquisition`
  }, createGachaCoinArt(gacha), ["div", {
    class: "gacha-source-summary__content"
  }, ["div", {
    class: "gacha-identity"
  }, createGachaSourcePopup(item, itemSource, itemSource.requiresGuardian ? undefined : character)], ["div", {
    class: "gacha-acquisition-channels",
    role: "list",
    "aria-label": `${gacha.name} sources`
  }, ...channelElements.map(element => (0, _html.createHTML)(["span", {
    class: "gacha-acquisition-channels__item",
    role: "listitem"
  }, element]))]]]);
}
function sourceItemElement(item, itemSource, character) {
  if (itemSource instanceof GachaItemSource) {
    return [createGachaSourceSummary(item, itemSource, character)];
  } else if (itemSource instanceof ShopItemSource) {
    if (itemSource.items.length === 1) {
      return [`${itemSource.price} ${itemSource.ap ? "AP" : "Gold"}`];
    }
    return [createSetSourcePopup(item, itemSource), ` ${itemSource.price} ${itemSource.ap ? "AP" : "Gold"}`];
  } else if (itemSource instanceof GuardianItemSource) {
    return [createGuardianPopup(item, itemSource)];
  } else {
    throw "Internal error";
  }
}
function itemDetailStats(item) {
  const characterStats = [{
    label: "Strength",
    base: item.str,
    enchanted: item.max_str
  }, {
    label: "Dexterity",
    base: item.dex,
    enchanted: item.max_dex
  }, {
    label: "Stamina",
    base: item.sta,
    enchanted: item.max_sta
  }, {
    label: "Will",
    base: item.wil,
    enchanted: item.max_wil
  }];
  const fixedStats = [{
    label: "Movement",
    base: item.movement
  }, {
    label: "Charge",
    base: item.charge
  }, {
    label: "Lob",
    base: item.lob
  }, {
    label: "Smash",
    base: item.smash
  }, {
    label: "Serve",
    base: item.serve
  }, {
    label: "HP",
    base: item.hp
  }, {
    label: "Quickslots",
    base: item.quickslots
  }, {
    label: "Buffslots",
    base: item.buffslots
  }];
  return [...characterStats.filter(stat => stat.base !== 0 || item.element_enchantable && stat.enchanted !== 0).map(({
    label,
    base,
    enchanted
  }) => item.element_enchantable ? {
    label,
    base,
    enchanted
  } : {
    label,
    base
  }), ...fixedStats.filter(stat => stat.base !== 0)];
}
function createItemDetailsContent(item, character) {
  const stats = itemDetailStats(item);
  const sources = makeSourcesList(itemSourcesToElementArray(item, () => true, character));
  return (0, _html.createHTML)(["div", {
    class: "item-details"
  }, ["header", {
    class: "item-details__header"
  }, createItemArt(item, 72, "item-details__art"), ["div", ["span", {
    class: "item-details__eyebrow"
  }, "Equipment details"], ["h2", item.name_en], ["p", {
    class: "item-details__meta"
  }, `${character ?? item.character ?? "All characters"} · ${item.part} · Level ${item.level}`]]], ["section", {
    class: "item-details__section",
    "aria-labelledby": "item-details-stats"
  }, ["h3", {
    id: "item-details-stats"
  }, "Stats"], ["p", {
    class: "item-details__stats-note"
  }, item.element_enchantable ? "Character stats show base and fully enchanted values." : "This item has base stats only."], stats.length > 0 ? (0, _html.createHTML)(["dl", {
    class: "item-details__stats"
  }, ...stats.map(({
    label,
    base,
    enchanted
  }) => enchanted === undefined ? (0, _html.createHTML)(["div", ["dt", label], ["dd", `${base}`]]) : (0, _html.createHTML)(["div", {
    class: "item-stat-comparison",
    "aria-label": `${label}: base ${base}, enchanted ${enchanted}`
  }, ["dt", label], ["dd", ["span", {
    class: "item-stat-comparison__value"
  }, ["small", "Base"], ["strong", `${base}`]], ["span", {
    class: "item-stat-comparison__arrow",
    "aria-hidden": "true"
  }, "→"], ["span", {
    class: "item-stat-comparison__value item-stat-comparison__value--enchanted"
  }, ["small", "Enchanted"], ["strong", `${enchanted}`]]]]))]) : (0, _html.createHTML)(["p", {
    class: "item-details__empty"
  }, "No stat bonuses"])], ["section", {
    class: "item-details__section",
    "aria-labelledby": "item-details-sources"
  }, ["h3", {
    id: "item-details-sources"
  }, "How to get it"], sources.length > 0 ? (0, _html.createHTML)(["div", {
    class: "item-details__sources"
  }, ...sources]) : (0, _html.createHTML)(["p", {
    class: "item-details__empty"
  }, "No active acquisition source found."])]]);
}
function createItemDetailsTrigger(item, character) {
  const button = (0, _html.createHTML)(["button", {
    class: "item-details-trigger",
    type: "button",
    "aria-haspopup": "dialog",
    "aria-expanded": "false",
    "aria-label": `View details for ${item.name_en}`
  }, item.name_en]);
  button.addEventListener("click", event => {
    event.stopPropagation();
    showDialog(button, `${item.name_en} item details`, createItemDetailsContent(item, character), "item-details-dialog");
  });
  return button;
}
function createItemArtFallback(item) {
  return (0, _html.createHTML)(["span", {
    class: "item-art-fallback",
    role: "img",
    "aria-label": `Official item art unavailable for ${item.name_en}`
  }, ["span", {
    class: "item-art-fallback__code",
    "aria-hidden": "true"
  }, item.part || "Item"], ["span", {
    "aria-hidden": "true"
  }, "Official art unavailable"]]);
}
function createSpriteArt(sheet, cell, label, className, displaySize = 40) {
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
  return (0, _html.createHTML)(["span", {
    class: className,
    role: "img",
    "aria-label": label,
    style: [`--item-art-image:url("assets/item-art/${encodeURIComponent(sheet)}.webp")`, `--item-art-size:${imageSize}px`, `--item-art-x:${offsetX}px`, `--item-art-y:${offsetY}px`].join(";")
  }]);
}
function createItemArt(item, displaySize = 40, className = "item-art-thumbnail") {
  const art = itemArtMap.items[`${item.id}`];
  if (!art) {
    return createItemArtFallback(item);
  }
  return createSpriteArt(art[0], art[1], `Official item art for ${item.name_en}`, className, displaySize) ?? createItemArtFallback(item);
}
function createGachaCoinArt(gacha) {
  const art = itemArtMap.lotteries[`${gacha.gacha_index}`];
  const fallback = () => (0, _html.createHTML)(["span", {
    class: "gacha-coin-art gacha-coin-art--unavailable",
    role: "img",
    "aria-label": `Coin artwork unavailable for ${gacha.name}`
  }, "?"]);
  if (!art) {
    return fallback();
  }
  return createSpriteArt(art.sheet, art.cell, `${gacha.name} coin artwork`, "gacha-coin-art") ?? fallback();
}
function itemToTableRow(item, sourceFilter, priorityStats, character) {
  const row = (0, _html.createHTML)(["tr", {
    class: "result-row"
  }, ["td", {
    class: "Name_column result-summary",
    "data-label": "Item"
  }, deletableItem(item, character)], ["td", {
    class: "Art_column",
    "data-label": "Art"
  }, createItemArt(item)], ["td", {
    class: "Character_column",
    "data-label": "Character"
  }, item.character ?? "All"], ["td", {
    class: "Part_column",
    "data-label": "Part"
  }, item.part], ...priorityStats.map(stat => {
    const value = stat.split("+").map(s => item.statFromString(s)).join("+");
    return (0, _html.createHTML)(["td", {
      class: "numeric",
      "data-label": stat,
      "data-value": value
    }, value]);
  }), ["td", {
    class: "Level_column numeric",
    "data-label": "Level",
    "data-value": `${item.level}`
  }, `${item.level}`], ["td", {
    class: "Source_column",
    "data-label": "Source"
  }, ...makeSourcesList(itemSourcesToElementArray(item, sourceFilter, character))]]);
  return row;
}
function getGachaTable(filter, char) {
  const table = (0, _html.createHTML)(["table", ["caption", "Gacha coins by shop currency and stage sources"], ["tr", ["th", {
    class: "Name_column"
  }, "Name"]]]);
  for (const [, gacha] of gachas) {
    const gachaItem = shop_items.get(gacha.shop_index);
    if (!gachaItem) {
      throw "Internal error";
    }
    if (filter(gachaItem)) {
      table.appendChild((0, _html.createHTML)(["tr", ["td", {
        class: "Name_column Source_column",
        "data-label": "Gacha"
      }, createGachaSourceSummary(undefined, new GachaItemSource(gacha.shop_index), char)]]));
    }
  }
  return table;
}
function getResultsTablePlan(filter, sourceFilter, priorizer, priorityStats, character) {
  const results = {
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
    "Racket": []
  };
  for (const [, item] of items) {
    if (filter(item)) {
      results[item.part] = priorizer(results[item.part], item);
    }
  }
  const table = (0, _html.createHTML)(["table", ["caption", "Matching equipment globally ranked by selected stat priority"], ["thead", ["tr", ["th", {
    class: "Name_column",
    scope: "col"
  }, "Item"], ["th", {
    class: "Art_column",
    scope: "col"
  }, "Art"], ["th", {
    class: "Character_column",
    scope: "col"
  }, "Character"], ["th", {
    class: "Part_column",
    scope: "col"
  }, "Part"], ...priorityStats.map((stat, index) => createPriorityStatHeaderCell(stat, index === 0)), ["th", {
    class: "Level_column numeric",
    scope: "col"
  }, "Level"], ["th", {
    class: "Source_column",
    scope: "col"
  }, "Source"]]], ["tbody"]]);
  function combineMaps(m1, m2) {
    const result = {
      ...m1
    };
    for (const [map, tries] of Object.entries(m2)) {
      if (result[map]) {
        result[map] = result[map].concat(tries);
      } else {
        result[map] = tries;
      }
    }
    return result;
  }
  function combineCosts(cost1, cost2) {
    return {
      gold: cost1.gold + cost2.gold,
      ap: cost1.ap + cost2.ap,
      maps: combineMaps(cost1.maps, cost2.maps)
    };
  }
  function minMap(m1, m2) {
    const result = {
      ...m1
    };
    for (const [map, tries] of Object.entries(m2)) {
      if (tries.length !== 1) {
        throw "Internal error";
      }
      if (result[map]) {
        result[map] = [Math.min(result[map][0], tries[0])];
      } else {
        result[map] = tries;
      }
    }
    return result;
  }
  function minCost(cost1, cost2) {
    // Lexicographic on (ap, gold): lower AP wins, then lower Gold.
    // Numeric compare only — do not use JS array/string ordering.
    const pickCost1 = cost1.ap < cost2.ap || cost1.ap === cost2.ap && cost1.gold < cost2.gold;
    return pickCost1 ? {
      gold: cost1.gold,
      ap: cost1.ap,
      maps: minMap(cost1.maps, cost2.maps)
    } : {
      gold: cost2.gold,
      ap: cost2.ap,
      maps: minMap(cost1.maps, cost2.maps)
    };
  }
  function costOf(item, character) {
    const sourceCosts = [...item.sources.values()].filter(sourceFilter).map(itemSource => {
      if (itemSource instanceof ShopItemSource) {
        if (itemSource.ap) {
          return {
            gold: 0,
            ap: itemSource.price,
            maps: {}
          };
        }
        return {
          gold: itemSource.price,
          ap: 0,
          maps: {}
        };
      } else if (itemSource instanceof GachaItemSource) {
        const singleCost = costOf(itemSource.item, character);
        const multiplier = itemSource.gachaTries(item, character);
        return {
          gold: singleCost.gold * multiplier,
          ap: singleCost.ap * multiplier,
          maps: Object.fromEntries(Object.entries(singleCost.maps).map(([map, tries]) => [map, tries.map(n => n * multiplier)]))
        };
      } else if (itemSource instanceof GuardianItemSource) {
        return {
          gold: 0,
          ap: 0,
          maps: Object.fromEntries([[itemSource.guardian_map, [itemSource.items.length]]])
        };
      } else {
        throw "Internal error";
      }
    });
    if (sourceCosts.length === 0) {
      return {
        gold: 0,
        ap: 0,
        maps: {}
      };
    }
    // Seed with the first real source cost. A {0,0} identity would always win
    // under a correct min, and the old always-last bug hid that.
    return sourceCosts.reduce((curr, cost) => minCost(curr, cost));
  }
  const priorityStatistics = Object.fromEntries(priorityStats.map(stat => [stat, 0]));
  const statistics = {
    characters: new Set(),
    Level: 0,
    cost: {
      ap: 0,
      gold: 0,
      maps: {}
    }
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
    statistics.cost = combineCosts(costOf(result[0], character && isCharacter(character) ? character : undefined), statistics.cost);
  }
  const displayResults = (0, _priority.mergePriorityRankings)(Object.values(results), priorizer);
  const rowInputs = [];
  for (const item of displayResults) {
    for (const char of item.character ? [item.character] : characters) {
      statistics.characters.add(char);
      rowInputs.push({
        item,
        character: char
      });
    }
  }
  const hiddenColumnClasses = [];
  if (statistics.characters.size === 1) {
    const total_sources = [];
    if (statistics.cost.gold > 0) {
      total_sources.push(`${statistics.cost.gold.toFixed(0)} Gold`);
    }
    if (statistics.cost.ap > 0) {
      total_sources.push(`${statistics.cost.ap.toFixed(0)} AP`);
    }
    //statistics['Guardian games'].forEach((count, map) => total_sources.push(`${count.toFixed(0)} x ${map}`));
    table.appendChild((0, _html.createHTML)(["tfoot", ["tr", ["td", {
      class: "total Name_column"
    }, "Total:"], ["td", {
      class: "total Art_column"
    }], ["td", {
      class: "total Character_column"
    }], ["td", {
      class: "total Part_column"
    }], ...priorityStats.map(stat => (0, _html.createHTML)(["td", {
      class: "total numeric"
    }, `${priorityStatistics[stat]}`])), ["td", {
      class: "total Level_column numeric"
    }, `${statistics.Level}`], ["td", {
      class: "total Source_column"
    }, total_sources.join(", ")]]]));
    hiddenColumnClasses.push("Character_column");
  }
  for (const attribute of priorityStats) {
    if (priorityStatistics[attribute] === 0) {
      hiddenColumnClasses.push(`${attribute}_column`);
    }
  }
  const hideColumns = root => {
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
    createRow(index) {
      const input = rowInputs[index];
      if (!input) {
        throw new RangeError(`Result row ${index} is out of range`);
      }
      const row = itemToTableRow(input.item, sourceFilter, priorityStats, input.character);
      hideColumns(row);
      return row;
    }
  };
}
function getResultsTable(filter, sourceFilter, priorizer, priorityStats, character) {
  const plan = getResultsTablePlan(filter, sourceFilter, priorizer, priorityStats, character);
  const tableBody = plan.table.tBodies[0];
  if (!tableBody) {
    throw "Internal error";
  }
  for (let index = 0; index < plan.totalRows; index += 1) {
    tableBody.appendChild(plan.createRow(index));
  }
  return plan.table;
}
function getMaxItemLevel() {
  //no reduce for Map?
  let max = 0;
  for (const [, item] of items) {
    max = Math.max(max, item.level);
  }
  return max;
}
document.body.addEventListener('click', event => {
  if (dialog && dialog === event.target) {
    dialog.close();
  }
});

},{"./gachaAcquisition":2,"./html":3,"./priority":6,"./priorityStatHeaders":7,"./stageBosses":9}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPriorityListItem = createPriorityListItem;
exports.getPriorityStatLabel = getPriorityStatLabel;
exports.isItemSelector = isItemSelector;
exports.itemSelectors = void 0;
exports.parseExcludedItemIdToken = parseExcludedItemIdToken;
var _checkboxTree = require("./checkboxTree");
var _itemLookup = require("./itemLookup");
var _html = require("./html");
var _priority = require("./priority");
var _progressiveRender = require("./progressiveRender");
var _storage = require("./storage");
const partsFilter = ["Parts", ["Head", ["+Hat", "+Hair", "Dye"], "+Upper", "+Lower", "Legs", ["+Shoes", "Socks"], "Aux", ["+Hand", "+Backpack", "+Face"], "+Racket"]];
const availabilityFilter = ["Availability", ["Shop", ["+Gold", "+AP"], "+Allow gacha", "+Guardian", "+Untradable", "Unavailable items"]];
const excluded_item_ids = new Set();
/** Digits-only safe-integer parse for excluded_item_ids localStorage tokens. */
function parseExcludedItemIdToken(token) {
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
  for (const character of ["All", ..._itemLookup.characters]) {
    const id = `characterSelectors_${character}`;
    const radio_button = (0, _html.createHTML)(["input", {
      id: id,
      type: "radio",
      name: "characterSelectors",
      value: character
    }]);
    radio_button.addEventListener("input", updateResults);
    target.appendChild(radio_button);
    target.appendChild((0, _html.createHTML)(["label", {
      for: id
    }, character]));
    target.appendChild((0, _html.createHTML)(["br"]));
    if (character === "Niki") {
      radio_button.checked = true;
    }
  }
  const filters = [[partsFilter, "partsFilter"], [availabilityFilter, "availabilityFilter"]];
  for (const [filter, name] of filters) {
    const target = document.getElementById(name);
    if (!target) {
      return;
    }
    const tree = (0, _checkboxTree.makeCheckboxTree)(filter);
    tree.addEventListener("change", updateResults);
    target.innerText = "";
    target.appendChild(tree);
  }
}
addFilterTrees();
let dragged;
const dragSeparatorLine = (0, _html.createHTML)(["hr", {
  id: "dragOverBar"
}]);
let dragHighlightedElement;
function createPriorityMoveIcon(direction) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "priority-move__icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", direction === "up" ? "M6 14.5 12 8.5l6 6" : "M6 9.5 12 15.5l6-6");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2.25");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  return svg;
}
/** Read ranking key from the label node so move controls never pollute stat text. */
function getPriorityStatLabel(item) {
  const label = item.querySelector(".priority-stat-label");
  if (label?.textContent) {
    return label.textContent.trim();
  }
  return (item.textContent ?? "").trim();
}
function setPriorityStatLabel(item, stat) {
  const label = item.querySelector(".priority-stat-label");
  if (label instanceof HTMLElement) {
    label.textContent = stat;
  } else {
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
function createPriorityListItem(stat) {
  const up = (0, _html.createHTML)(["button", {
    type: "button",
    class: "priority-move priority-move-up",
    "aria-label": `Raise ${stat} priority`,
    title: `Raise ${stat}`
  }]);
  up.append(createPriorityMoveIcon("up"));
  const down = (0, _html.createHTML)(["button", {
    type: "button",
    class: "priority-move priority-move-down",
    "aria-label": `Lower ${stat} priority`,
    title: `Lower ${stat}`
  }]);
  down.append(createPriorityMoveIcon("down"));
  return (0, _html.createHTML)(["li", {
    class: "dropzone",
    draggable: "true"
  }, ["span", {
    class: "priority-stat-label"
  }, stat], (0, _html.createHTML)(["span", {
    class: "priority-move-controls"
  }, up, down])]);
}
function priorityListItems(list) {
  return Array.from(list.children).filter(node => node instanceof HTMLLIElement && node.classList.contains("dropzone"));
}
function syncRankingSummaryHint(list) {
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
function syncPriorityMoveButtonState(list) {
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
function movePriorityListItem(item, direction) {
  const list = item.parentElement;
  if (!(list instanceof HTMLOListElement)) {
    return;
  }
  let sibling = direction === "up" ? item.previousElementSibling : item.nextElementSibling;
  while (sibling && !(sibling instanceof HTMLLIElement && sibling.classList.contains("dropzone"))) {
    sibling = direction === "up" ? sibling.previousElementSibling : sibling.nextElementSibling;
  }
  if (!(sibling instanceof HTMLLIElement)) {
    return;
  }
  if (direction === "up") {
    sibling.before(item);
  } else {
    sibling.after(item);
  }
  syncPriorityMoveButtonState(list);
  updateResults();
}
function applyDragDrop() {
  document.addEventListener("dragstart", event => {
    const {
      target
    } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.closest(".priority-move, .priority-move-controls")) {
      event.preventDefault();
      return;
    }
    const row = target.classList.contains("dropzone") ? target : target.closest("#priority_list > li.dropzone");
    if (!(row instanceof HTMLElement)) {
      return;
    }
    dragged = row;
  });
  document.addEventListener("dragover", event => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const dropzone = event.target.closest("#priority_list > li.dropzone");
    if (dropzone instanceof HTMLElement) {
      const targetRect = dropzone.getBoundingClientRect();
      const y = event.clientY - targetRect.top;
      const height = targetRect.height;
      let Position;
      (function (Position) {
        Position[Position["above"] = 0] = "above";
        Position[Position["on"] = 1] = "on";
        Position[Position["below"] = 2] = "below";
      })(Position || (Position = {}));
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
  document.addEventListener("drop", ({
    target
  }) => {
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
    const dropRow = target instanceof HTMLElement && target.classList.contains("dropzone") ? target : target.closest("#priority_list > li.dropzone");
    if (dropRow === dragged && dragged instanceof HTMLLIElement) {
      const stats = getPriorityStatLabel(dragged).split("+");
      setPriorityStatLabel(dragged, stats.shift());
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
function hydratePriorityListControls() {
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
function compare(lhs, rhs) {
  if (lhs === rhs) {
    return 0;
  }
  return lhs < rhs ? -1 : 1;
}
function getSelectedCharacter() {
  const characterFilterList = document.getElementsByName("characterSelectors");
  for (const element of characterFilterList) {
    if (!(element instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    if (element.checked) {
      const selection = element.value;
      if ((0, _itemLookup.isCharacter)(selection)) {
        return selection;
      }
      return;
    }
  }
}
function setSelectedCharacter(character) {
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
const itemSelectors = exports.itemSelectors = ["partsSelector", "gachaSelector"];
function isItemSelector(itemSelector) {
  return itemSelectors.includes(itemSelector);
}
function getItemTypeSelection() {
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
  _storage.Variable_storage.set_variable("Character", selectedCharacter);
  {
    //Filters
    const partsFilterList = document.getElementById("partsFilter")?.children[0];
    if (!(partsFilterList instanceof HTMLUListElement)) {
      throw "Internal error";
    }
    for (const [name, value] of Object.entries((0, _checkboxTree.getLeafStates)(partsFilterList))) {
      _storage.Variable_storage.set_variable(name, value);
    }
    const availabilityFilterList = document.getElementById("availabilityFilter")?.children[0];
    if (!(availabilityFilterList instanceof HTMLUListElement)) {
      throw "Internal error";
    }
    for (const [name, value] of Object.entries((0, _checkboxTree.getLeafStates)(availabilityFilterList))) {
      _storage.Variable_storage.set_variable(name, value);
    }
  }
  {
    //misc
    const levelrange = document.getElementById("levelrange");
    if (!(levelrange instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    const maxLevel = parseInt(levelrange.value);
    _storage.Variable_storage.set_variable("maxLevel", maxLevel);
    const namefilter = document.getElementById("nameFilter");
    if (!(namefilter instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    const item_name = namefilter.value;
    if (item_name) {
      _storage.Variable_storage.set_variable("nameFilter", item_name);
    } else {
      _storage.Variable_storage.delete_variable("nameFilter");
    }
    const enchantToggle = document.getElementById("enchantToggle");
    if (!(enchantToggle instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    _storage.Variable_storage.set_variable("enchantToggle", enchantToggle.checked);
  }
  {
    //item selection
    _storage.Variable_storage.set_variable("itemTypeSelector", getItemTypeSelection());
  }
  _storage.Variable_storage.set_variable("excluded_item_ids", Array.from(excluded_item_ids).join(","));
}
function restoreSelection() {
  const stored_character = _storage.Variable_storage.get_variable("Character");
  setSelectedCharacter(typeof stored_character === "string" && (0, _itemLookup.isCharacter)(stored_character) ? stored_character : "Niki");
  {
    //Filters
    let states = {};
    for (const [name, value] of Object.entries(_storage.Variable_storage.variables)) {
      if (typeof value === "boolean") {
        states[name] = value;
      }
    }
    const partsFilterList = document.getElementById("partsFilter")?.children[0];
    if (!(partsFilterList instanceof HTMLUListElement)) {
      throw "Internal error";
    }
    (0, _checkboxTree.setLeafStates)(partsFilterList, states);
    const availabilityFilterList = document.getElementById("availabilityFilter")?.children[0];
    if (!(availabilityFilterList instanceof HTMLUListElement)) {
      throw "Internal error";
    }
    (0, _checkboxTree.setLeafStates)(availabilityFilterList, states);
  }
  const levelrange = document.getElementById("levelrange");
  {
    //misc
    if (!(levelrange instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    const maxLevel = _storage.Variable_storage.get_variable("maxLevel");
    if (typeof maxLevel === "number") {
      levelrange.value = `${maxLevel}`;
    } else {
      levelrange.value = levelrange.max;
    }
    const namefilter = document.getElementById("nameFilter");
    if (!(namefilter instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    const item_name = _storage.Variable_storage.get_variable("nameFilter");
    if (typeof item_name === "string") {
      namefilter.value = item_name;
    }
    const enchantToggle = document.getElementById("enchantToggle");
    if (!(enchantToggle instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    enchantToggle.checked = !!_storage.Variable_storage.get_variable("enchantToggle");
  }
  // Rehydrate exclusions before any save-capable event (change/input → updateResults → saveSelection).
  const excluded_ids = _storage.Variable_storage.get_variable("excluded_item_ids");
  if (typeof excluded_ids === "string") {
    for (const id of excluded_ids.split(",")) {
      const parsed = parseExcludedItemIdToken(id);
      if (parsed !== undefined) {
        excluded_item_ids.add(parsed);
      }
    }
  }
  {
    //item selection
    let itemTypeSelector = _storage.Variable_storage.get_variable("itemTypeSelector");
    if (typeof itemTypeSelector !== "string" || !isItemSelector(itemTypeSelector)) {
      itemTypeSelector = "partsSelector";
    }
    const selector = document.getElementById(itemTypeSelector);
    if (!(selector instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    selector.checked = true;
    selector.dispatchEvent(new Event("change", {
      bubbles: false,
      cancelable: true
    }));
  }
  //must be last because it triggers a store
  levelrange.dispatchEvent(new Event("input"));
}
const INITIAL_RESULT_ROWS = 24;
const RESULT_ROWS_PER_REQUEST = 240;
const MAX_RESULT_ROWS_PER_FRAME = 96;
const RESULT_FRAME_BUDGET_MS = 8;
let activeResultsRenderer;
let activeResultsObserver;
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
  const filters = [];
  const sourceFilters = [];
  let selectedCharacter;
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
  {
    //character filter
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
  {
    //parts filter
    switch (getItemTypeSelection()) {
      case 'partsSelector':
        const partsStates = (0, _checkboxTree.getLeafStates)(partsFilterList);
        filters.push(item => partsStates[item.part]);
        break;
      case 'gachaSelector':
        break;
    }
  }
  {
    //availability filter
    const availabilityFilterList = document.getElementById("availabilityFilter")?.children[0];
    if (!(availabilityFilterList instanceof HTMLUListElement)) {
      throw "Internal error";
    }
    const availabilityStates = (0, _checkboxTree.getLeafStates)(availabilityFilterList);
    if (!availabilityStates["Gold"]) {
      sourceFilters.push(itemSource => !(itemSource instanceof _itemLookup.ShopItemSource && !itemSource.ap && itemSource.price > 0));
    }
    if (!availabilityStates["AP"]) {
      sourceFilters.push(itemSource => !(itemSource instanceof _itemLookup.ShopItemSource && itemSource.ap && itemSource.price > 0));
    }
    if (!availabilityStates["Untradable"]) {
      filters.push(item => item.parcel_enabled);
    }
    if (!availabilityStates["Allow gacha"]) {
      sourceFilters.push(itemSource => !(itemSource instanceof _itemLookup.GachaItemSource));
    }
    if (!availabilityStates["Guardian"]) {
      sourceFilters.push(itemSource => !itemSource.requiresGuardian);
    }
    if (!availabilityStates["Unavailable items"]) {
      const availabilitySourceFilter = [...sourceFilters];
      const sourceFilter = itemSource => availabilitySourceFilter.every(filter => filter(itemSource));
      function isAvailableSource(itemSource) {
        if (!sourceFilter(itemSource)) {
          return false;
        }
        if (itemSource instanceof _itemLookup.GachaItemSource) {
          for (const source of itemSource.item.sources) {
            if (isAvailableSource(source)) {
              return true;
            }
          }
        } else {
          return true;
        }
        return false;
      }
      sourceFilters.push(isAvailableSource);
      function isAvailableItem(item) {
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
  {
    //misc filter
    const levelrange = document.getElementById("levelrange");
    if (!(levelrange instanceof HTMLInputElement)) {
      throw "Internal error";
    }
    const maxLevel = parseInt(levelrange.value);
    filters.push(item => item.level <= maxLevel);
    const item_name = namefilter.value;
    if (item_name) {
      filters.push(item => item.name_en.toLowerCase().includes(item_name.toLowerCase()));
    }
  }
  {
    //id filter
    filters.push(item => !excluded_item_ids.has(item.id));
    const itemFilterList = document.getElementById("itemFilter");
    if (!(itemFilterList instanceof HTMLDivElement)) {
      throw "Internal error";
    }
    itemFilterList.replaceChildren();
    if (excluded_item_ids.size === 0) {
      itemFilterList.appendChild((0, _html.createHTML)(["p", {
        class: "empty-note"
      }, "No excluded items"]));
    } else {
      for (const id of excluded_item_ids) {
        const item = _itemLookup.items.get(id);
        if (!item) {
          continue;
        }
        itemFilterList.appendChild((0, _html.createHTML)(["div", {
          class: "excluded-item"
        }, ["span", {
          class: "excluded-item__name"
        }, item.name_en], (0, _html.createHTML)(["button", {
          class: "item_removal_removal",
          "data-item_index": `${id}`,
          "aria-label": `Restore ${item.name_en}`,
          type: "button"
        }, "Restore"])]));
      }
    }
  }
  const comparators = [];
  const priorityList = document.getElementById("priority_list");
  if (!(priorityList instanceof HTMLOListElement)) {
    throw "Internal error";
  }
  const priorityStats = priorityListItems(priorityList).map(node => getPriorityStatLabel(node)).filter(stat => stat.length > 0);
  {
    for (const stat of priorityStats) {
      const stats = stat.split("+");
      comparators.push((lhs, rhs) => compare(stats.map(stat => lhs.statFromString(stat)).reduce((n, m) => n + m), stats.map(stat => rhs.statFromString(stat)).reduce((n, m) => n + m)));
    }
  }
  const result = (() => {
    switch (getItemTypeSelection()) {
      case 'partsSelector':
        return {
          kind: "equipment",
          plan: (0, _itemLookup.getResultsTablePlan)(item => filters.every(filter => filter(item)), itemSource => sourceFilters.every(filter => filter(itemSource)), (items, item) => (0, _priority.selectByPriority)(items, item, comparators), priorityStats, selectedCharacter)
        };
      case 'gachaSelector':
        return {
          kind: "gacha",
          table: (0, _itemLookup.getGachaTable)(item => filters.every(filter => filter(item)), selectedCharacter)
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
    const resultRows = result.table.tBodies[0]?.rows.length ?? Math.max(0, result.table.rows.length - 1);
    target.replaceChildren();
    if (resultRows === 0) {
      target.appendChild((0, _html.createHTML)(["p", {
        class: "results-empty",
        role: "status"
      }, "No items match these filters."]));
    } else {
      target.appendChild(result.table);
    }
    if (resultsStatus) {
      resultsStatus.textContent = resultRows === 0 ? "No items match these filters." : `${resultRows} matching ${resultRows === 1 ? "item" : "items"}`;
    }
    resultsGroup?.setAttribute("aria-busy", "false");
    resultsGroup?.setAttribute("data-render-state", "complete");
    resultsGroup?.setAttribute("data-rendered-rows", `${resultRows}`);
    resultsGroup?.setAttribute("data-total-rows", `${resultRows}`);
    syncResultsTableScroll();
    return;
  }
  const {
    plan
  } = result;
  if (plan.totalRows === 0) {
    target.replaceChildren((0, _html.createHTML)(["p", {
      class: "results-empty",
      role: "status"
    }, "No items match these filters."]));
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
  const loadMoreRow = (0, _html.createHTML)(["tr", {
    class: "results-load-more"
  }, ["td", {
    colspan: `${priorityStats.length + 6}`
  }, ["button", {
    class: "results-load-more__button",
    type: "button"
  }, "Load more results"]]]);
  const loadMoreButton = loadMoreRow.querySelector("button");
  if (!(loadMoreButton instanceof HTMLButtonElement)) {
    throw "Internal error";
  }
  let renderer;
  const requestMore = () => {
    if (!renderer.continue()) {
      return;
    }
    loadMoreRow.remove();
    resultsGroup?.setAttribute("aria-busy", "true");
    resultsGroup?.setAttribute("data-render-state", "rendering");
  };
  loadMoreButton.addEventListener("click", requestMore);
  const observer = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      requestMore();
    }
  }, {
    root: null,
    rootMargin: "320px 0px"
  });
  activeResultsObserver = observer;
  renderer = new _progressiveRender.ProgressiveBatchRenderer({
    scheduler: _progressiveRender.browserFrameScheduler,
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
        resultsStatus.textContent = `Showing ${state.rendered} of ${state.total} matching items`;
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
        resultsStatus.textContent = `${state.total} matching ${state.total === 1 ? "item" : "items"}`;
      }
      syncResultsTableScroll();
    }
  });
  activeResultsRenderer = renderer;
  renderer.start(Array.from({
    length: plan.totalRows
  }, (_, index) => index));
  observer?.observe(loadMoreRow);
}
let resultsTableScrollBound = false;
let resultsTableWidthObserver;
let resultsColumnPanRevealed = false;
/** Keep the top column scroller width and scrollLeft aligned with the results table. */
function syncResultsTableScroll() {
  const tableScroll = document.getElementById("tableScroll");
  const tableHScroll = document.getElementById("tableHScroll");
  const spacer = document.getElementById("tableHScrollSpacer");
  const columnPan = document.getElementById("tableColumnPan");
  if (!(tableScroll instanceof HTMLElement) || !(tableHScroll instanceof HTMLElement) || !(spacer instanceof HTMLElement) || !(columnPan instanceof HTMLElement)) {
    return;
  }
  if (!resultsTableScrollBound) {
    resultsTableScrollBound = true;
    let syncing = false;
    const mirror = (source, target) => {
      if (syncing) {
        return;
      }
      syncing = true;
      target.scrollLeft = source.scrollLeft;
      syncing = false;
    };
    tableScroll.addEventListener("scroll", () => {
      mirror(tableScroll, tableHScroll);
    }, {
      passive: true
    });
    tableHScroll.addEventListener("scroll", () => {
      mirror(tableHScroll, tableScroll);
    }, {
      passive: true
    });
    window.addEventListener("resize", () => {
      syncResultsTableScroll();
    }, {
      passive: true
    });
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
  if (!(filterToggle instanceof HTMLButtonElement) || !(closeFilters instanceof HTMLButtonElement) || !(filterPanel instanceof HTMLElement) || !(filterBackdrop instanceof HTMLButtonElement)) {
    return;
  }
  const toggleButton = filterToggle;
  const closeButton = closeFilters;
  const panel = filterPanel;
  const backdropButton = filterBackdrop;
  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    toggleButton.setAttribute("aria-expanded", `${open}`);
    backdropButton.hidden = !open;
    document.body.classList.toggle("filters-open", open);
    if (open) {
      const nameFilter = document.getElementById("nameFilter");
      if (nameFilter instanceof HTMLInputElement) {
        const focusAfterOpen = event => {
          if (event.propertyName !== "transform") {
            return;
          }
          panel.removeEventListener("transitionend", focusAfterOpen);
          nameFilter.focus();
        };
        panel.addEventListener("transitionend", focusAfterOpen);
        nameFilter.focus();
      }
    } else {
      toggleButton.focus();
    }
  }
  toggleButton.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));
  backdropButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => {
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
    const focusableElements = Array.from(panel.querySelectorAll('button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
    if (focusableElements.length === 0) {
      return;
    }
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && (!panel.contains(document.activeElement) || document.activeElement === lastElement)) {
      event.preventDefault();
      firstElement.focus();
    }
  });
  window.matchMedia("(min-width: 880px)").addEventListener("change", ({
    matches
  }) => {
    if (matches && panel.classList.contains("is-open")) {
      setOpen(false);
    }
  });
}
setMobileFilterControls();
function setResetFilterControl() {
  const resetFilters = document.getElementById("resetFilters");
  const refinementStatus = document.getElementById("refinementStatus");
  if (!(resetFilters instanceof HTMLButtonElement) || !(refinementStatus instanceof HTMLElement)) {
    return;
  }
  resetFilters.addEventListener("click", () => {
    refinementStatus.textContent = "Resetting filters…";
    _storage.Variable_storage.clear_all();
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
  const loadingCopy = document.querySelector(".loading-state__detail") ?? document.querySelector(".loading-state__copy span");
  const loadingGroup = document.getElementById("loading_group");
  if (!(resultsStatus instanceof HTMLElement) || !(loadingLabel instanceof HTMLLabelElement) || !(loadingCopy instanceof HTMLElement)) {
    throw "Internal error";
  }
  resultsGroup?.setAttribute("aria-busy", "true");
  loadingGroup?.setAttribute("aria-busy", "true");
  setItemTypeSelectorFunctionality();
  restoreSelection();
  try {
    await (0, _itemLookup.downloadItems)();
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
  const maxLevel = (0, _itemLookup.getMaxItemLevel)();
  levelrange.value = `${Math.min(parseInt(levelrange.value), maxLevel)}`;
  levelrange.max = `${maxLevel}`;
  resultsGroup?.setAttribute("aria-busy", "false");
  loadingGroup?.setAttribute("aria-busy", "false");
  levelrange.dispatchEvent(new Event("input"));
  const sort_help = document.getElementById("priority_legend");
  if (sort_help instanceof HTMLLegendElement) {
    sort_help.appendChild((0, _itemLookup.createPopupLink)(" (?)", (0, _html.createHTML)(["p", "Reorder the stats to your liking to affect the results list.", ["br"], "Use the up/down arrows, or drag a stat, to change its importance (for example move Lob above Charge).", ["br"], "Drag a stat onto another to combine them (for example Str onto Dex, the results will display Str+Dex).", ["br"], "Drag a combined stat onto itself to separate them."])));
  }
});
document.body.addEventListener('click', event => {
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

},{"./checkboxTree":1,"./html":3,"./itemLookup":4,"./priority":6,"./progressiveRender":8,"./storage":10}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergePriorityRankings = mergePriorityRankings;
exports.selectByPriority = selectByPriority;
/**
 * Insert `candidate` into a best-first ranking.
 * Higher comparator values mean the left-hand item ranks better.
 * Every candidate is retained so the UI can show the full filtered inventory.
 */
function selectByPriority(current, candidate, comparators) {
  if (current.length === 0) {
    return [candidate];
  }
  let insertAt = current.length;
  for (let index = 0; index < current.length; index += 1) {
    let decided = 0;
    for (const comparator of comparators) {
      const result = comparator(current[index], candidate);
      if (result !== 0) {
        decided = result;
        break;
      }
    }
    if (decided < 0) {
      // current[index] is worse than candidate: insert before it.
      insertAt = index;
      break;
    }
    // decided > 0: current item is better; keep scanning.
    // decided === 0: exact tie; keep scanning so ties stay stable/FIFO.
  }
  return [...current.slice(0, insertAt), candidate, ...current.slice(insertAt)];
}
/**
 * Merge independently ranked runs into one stable best-first ranking.
 * Each input must already use the same `priorizer` ordering.
 */
function mergePriorityRankings(rankings, priorizer) {
  const cursors = rankings.map(() => 0);
  const merged = [];
  while (true) {
    let winnerRun = -1;
    for (let run = 0; run < rankings.length; run += 1) {
      if (cursors[run] >= rankings[run].length) {
        continue;
      }
      if (winnerRun === -1) {
        winnerRun = run;
        continue;
      }
      const winner = rankings[winnerRun][cursors[winnerRun]];
      const challenger = rankings[run][cursors[run]];
      if (priorizer([winner], challenger)[0] === challenger) {
        winnerRun = run;
      }
    }
    if (winnerRun === -1) {
      return merged;
    }
    merged.push(rankings[winnerRun][cursors[winnerRun]]);
    cursors[winnerRun] += 1;
  }
}

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.priorityStatHeaderDisplay = priorityStatHeaderDisplay;
/** Internal priority keys → short table header + human full name for tooltips. */
const PRIORITY_STAT_HEADER_ABBREV = {
  "Mov Speed": {
    short: "MS",
    full: "Mov Speed"
  },
  "Quickslots": {
    short: "QS",
    full: "Quick Slots"
  },
  "Buffslots": {
    short: "BS",
    full: "Buff Slots"
  }
};
/** Map a priority stat key (or combined "A+B") to short header text + full tooltip name. */
function priorityStatHeaderDisplay(stat) {
  const parts = stat.split("+");
  const mapped = parts.map(part => {
    const known = PRIORITY_STAT_HEADER_ABBREV[part];
    return known ?? {
      short: part,
      full: part
    };
  });
  const short = mapped.map(part => part.short).join("+");
  const full = mapped.map(part => part.full).join("+");
  return {
    short,
    full,
    abbreviated: short !== full
  };
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.browserFrameScheduler = exports.ProgressiveBatchRenderer = void 0;
class ProgressiveBatchRenderer {
  options;
  version = 0;
  frameHandle;
  inputs = [];
  rendered = 0;
  running = false;
  constructor(options) {
    this.options = options;
  }
  start(inputs) {
    this.cancelFrame();
    const version = ++this.version;
    this.inputs = inputs;
    this.rendered = 0;
    this.running = true;
    this.commitRows(version, Math.min(inputs.length, Math.max(1, this.options.initialRows)), Math.max(1, this.options.initialRows));
    return version;
  }
  continue() {
    if (this.running || this.rendered >= this.inputs.length) {
      return false;
    }
    this.running = true;
    const version = this.version;
    const target = Math.min(this.inputs.length, this.rendered + Math.max(1, this.options.rowsPerRequest));
    this.frameHandle = this.options.scheduler.request(() => {
      this.runFrame(version, target);
    });
    return true;
  }
  cancel() {
    this.cancelFrame();
    this.version += 1;
    this.inputs = [];
    this.rendered = 0;
    this.running = false;
  }
  runFrame(version, target) {
    this.frameHandle = undefined;
    if (version !== this.version) {
      return;
    }
    this.commitRows(version, target, this.options.maxRowsPerFrame, this.options.frameBudgetMs);
  }
  commitRows(version, target, limit, budgetMs) {
    const startedAt = this.options.now();
    const batch = [];
    while (this.rendered < target && batch.length < limit) {
      batch.push(this.options.create(this.inputs[this.rendered]));
      this.rendered += 1;
      if (budgetMs !== undefined && this.options.now() - startedAt >= budgetMs) {
        break;
      }
    }
    if (version !== this.version) {
      return;
    }
    const state = {
      version,
      rendered: this.rendered,
      total: this.inputs.length,
      complete: this.rendered === this.inputs.length
    };
    this.options.commit(batch, state);
    if (version !== this.version) {
      return;
    }
    if (state.complete) {
      this.running = false;
      this.options.complete(state);
      return;
    }
    if (this.rendered >= target) {
      this.running = false;
      this.options.pause(state);
      return;
    }
    this.frameHandle = this.options.scheduler.request(() => {
      this.runFrame(version, target);
    });
  }
  cancelFrame() {
    if (this.frameHandle === undefined) {
      return;
    }
    this.options.scheduler.cancel(this.frameHandle);
    this.frameHandle = undefined;
  }
}
exports.ProgressiveBatchRenderer = ProgressiveBatchRenderer;
const browserFrameScheduler = exports.browserFrameScheduler = {
  request(callback) {
    return requestAnimationFrame(callback);
  },
  cancel(handle) {
    cancelAnimationFrame(handle);
  }
};

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findStageBossEntry = findStageBossEntry;
exports.projectStageBosses = projectStageBosses;
exports.stageBossLookupKeys = stageBossLookupKeys;
/**
 * Resolve which boss guardian(s) appear on a Guardian / Boss stage.
 * Data comes from JFTSE GuardianStages.json (BossGuardian + side pools)
 * and BossGuardianInfo_Ini3.xml / GuardianInfo.xml names.
 */
function uniqueNames(names) {
  const seen = new Set();
  const out = [];
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
function resolveBoss(catalog, id) {
  const entry = catalog.bosses?.[`${id}`];
  if (entry && typeof entry.name === "string" && entry.name.trim()) {
    return {
      id: entry.id ?? id,
      name: entry.name.trim(),
      resId: entry.resId,
      level: entry.level,
      hpBase: entry.hpBase
    };
  }
  return undefined;
}
function resolveGuardianName(catalog, id) {
  const entry = catalog.guardians?.[`${id}`];
  const name = entry?.name?.trim();
  return name || undefined;
}
function sideIds(pools) {
  if (!pools) {
    return [];
  }
  return [...(pools.left ?? []), ...(pools.middle ?? []), ...(pools.right ?? [])];
}
/**
 * Candidate stage keys for a chip label map name.
 * Boss · Atlantis uses `AtlantisBoss`; some drops use bare map names with needBoss.
 */
function stageBossLookupKeys(mapName, needBoss) {
  const keys = [mapName];
  if (needBoss && !/Boss$/i.test(mapName)) {
    keys.push(`${mapName}Boss`);
  }
  if (!needBoss && /Boss$/i.test(mapName)) {
    keys.push(mapName.replace(/Boss$/i, ""));
  }
  return keys;
}
function entryHasBosses(entry) {
  return !!entry && Array.isArray(entry.bossIds) && entry.bossIds.length > 0;
}
function findStageBossEntry(mapName, needBoss, catalog) {
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
function projectStageBosses(mapName, needBoss, catalog) {
  const entry = findStageBossEntry(mapName, needBoss, catalog);
  if (!entry) {
    return {
      stageName: mapName,
      isBossStage: needBoss,
      bosses: [],
      bossNames: [],
      sideGuardianNames: []
    };
  }
  const bosses = [];
  const seenBossIds = new Set();
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
  const sideGuardianNames = uniqueNames(sideIds(entry.sideGuardianIds).map(id => resolveGuardianName(catalog, id)).filter(n => typeof n === "string"));
  return {
    stageName: entry.name,
    mapId: typeof entry.mapId === "number" ? entry.mapId : undefined,
    isBossStage: !!entry.isBossStage,
    bosses,
    bossNames: uniqueNames(bosses.map(b => b.name)),
    sideGuardianNames
  };
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Variable_storage = void 0;
function variable_to_string(value) {
  switch (typeof value) {
    case "string":
      return `s${value}`;
    case "number":
      return `n${value}`;
    case "boolean":
      return value ? "b1" : "b0";
  }
}
function string_to_variable(vv) {
  const prefix = vv[0];
  const value = vv.substring(1);
  switch (prefix) {
    case 's':
      //string
      return value;
    case 'n':
      //number
      return parseFloat(value);
    case 'b':
      //boolean
      return value === "1" ? true : false;
  }
  throw `invalid value: ${vv}`;
}
function is_storage_value(key) {
  return key.length >= 1 && "snb".includes(key[0]);
}
class Variable_storage {
  static get_variable(variable_name) {
    const stored = localStorage.getItem(`${variable_name}`);
    if (typeof stored !== "string") {
      return;
    }
    if (!is_storage_value(stored)) {
      return;
    }
    return string_to_variable(stored);
  }
  static set_variable(variable_name, value) {
    localStorage.setItem(`${variable_name}`, variable_to_string(value));
  }
  static delete_variable(variable_name) {
    localStorage.removeItem(`${variable_name}`);
  }
  static clear_all() {
    localStorage.clear();
  }
  static get variables() {
    let result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (typeof key !== "string") {
        continue;
      }
      const value = localStorage.getItem(key);
      if (typeof value !== "string") {
        continue;
      }
      if (!is_storage_value(value)) {
        continue;
      }
      result[key] = string_to_variable(value);
    }
    return result;
  }
}
exports.Variable_storage = Variable_storage;

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJnYWNoYUFjcXVpc2l0aW9uLnRzIiwiaHRtbC50cyIsIml0ZW1Mb29rdXAudHMiLCJtYWluLnRzIiwicHJpb3JpdHkudHMiLCJwcmlvcml0eVN0YXRIZWFkZXJzLnRzIiwicHJvZ3Jlc3NpdmVSZW5kZXIudHMiLCJzdGFnZUJvc3Nlcy50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWE7RUFDekMsSUFBSSxFQUFFLFNBQVMsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzFDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO0lBQzNFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDOUM7SUFDSjtJQUNBLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDtJQUNKO0lBQ0EsT0FBTyxLQUFLLENBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUNwQyxNQUFNLENBQUUsQ0FBQyxJQUF5QixDQUFD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LEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssUUFBUTtjQUNULElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUTtjQUNwQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKO2NBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxFQUFFLENBQUM7VUFDbkQ7VUFDQTtRQUNKLEtBQUssT0FBTztVQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUM1QjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssT0FBTztVQUNSLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUN6QjtRQUNKLEtBQUssVUFBVTtVQUNYLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUNqQztR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LENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUI7TUFDSjtNQUNBLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7SUFDM0M7SUFDQSxPQUFPLE1BQU07RUFDakI7O0FBQ0gsT0FBQSxDQUFBLGdCQUFBLEdBQUEsZ0JBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IHR5cGUgVHJlZU5vZGUgPSBzdHJpbmcgfCBUcmVlTm9kZVtdO1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogSFRNTElucHV0RWxlbWVudFtdIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGZvciAobGV0IGNoaWxkSW5kZXggPSAwOyBjaGlsZEluZGV4IDwgcGFyZW50X3VsLmNoaWxkcmVuLmxlbmd0aDsgY2hpbGRJbmRleCsrKSB7XG4gICAgICAgIGlmIChwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleF0gIT09IHBhcmVudF9saSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG90ZW50aWFsU2libGluZ0VudHJ5ID0gcGFyZW50X3VsLmNoaWxkcmVuW2NoaWxkSW5kZXggKyAxXT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBvdGVudGlhbFNpYmxpbmdFbnRyeSBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKHBvdGVudGlhbFNpYmxpbmdFbnRyeS5jaGlsZHJlbilcbiAgICAgICAgICAgIC5maWx0ZXIoKGUpOiBlIGlzIEhUTUxMSUVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgZS5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpXG4gICAgICAgICAgICAubWFwKGUgPT4gZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKG5vZGUpKSB7XG4gICAgICAgIGlmIChjaGlsZC5jaGVja2VkICE9PSBub2RlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNoaWxkLmNoZWNrZWQgPSBub2RlLmNoZWNrZWQ7XG4gICAgICAgICAgICBjaGlsZC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgICAgICAgICBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50KG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50IHwgdm9pZCB7XG4gICAgY29uc3QgcGFyZW50X2xpID0gbm9kZS5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF9saSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50X3VsID0gcGFyZW50X2xpLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X3VsIGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY2FuZGlkYXRlOiBIVE1MTElFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50X3VsLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgY2hpbGQuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjYW5kaWRhdGUgPSBjaGlsZDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gcGFyZW50X2xpICYmIGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBbmNlc3RvcnMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKTtcbiAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBmb3VuZENoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRVbmNoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRJbmRldGVybWluYXRlID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGZvdW5kQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkLmluZGV0ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZvdW5kSW5kZXRlcm1pbmF0ZSB8fCBmb3VuZENoZWNrZWQgJiYgZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZENoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB1cGRhdGVBbmNlc3RvcnMocGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVyKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHModGFyZ2V0KTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKHRhcmdldCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcnMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVyKGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlOiBUcmVlTm9kZSk6IEhUTUxMSUVsZW1lbnQge1xuICAgIGlmICh0eXBlb2YgdHJlZU5vZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCIrXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY2hlY2tlZCAmJiB7IGNoZWNrZWQ6IFwiY2hlY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgeyBmb3I6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSB9LFxuICAgICAgICAgICAgICAgIHRyZWVOb2RlXG4gICAgICAgICAgICBdXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNyZWF0ZUhUTUwoW1widWxcIiwgeyBjbGFzczogXCJjaGVja2JveFwiIH1dKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRyZWVOb2RlW2ldO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChtYWtlQ2hlY2tib3hUcmVlTm9kZShub2RlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1wibGlcIiwgbGlzdF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWUodHJlZU5vZGU6IFRyZWVOb2RlKSB7XG4gICAgbGV0IHJvb3QgPSBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZSkuY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocm9vdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgYXBwbHlDaGVja0xpc3RlbmVycyhyb290KTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKHJvb3QpKSB7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIGdldExlYXZlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHJlc3VsdDogSFRNTElucHV0RWxlbWVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oaW5wdXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZ2V0TGVhdmVzKGlucHV0KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildID0gbGVhZi5jaGVja2VkO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50LCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9KSB7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV07XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxlYWYuY2hlY2tlZCA9IHN0YXRlO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBQdXJlIHByb2plY3Rpb24gb2YgaG93IGEgZ2FjaGEgY29pbiBjYW4gYmUgYWNxdWlyZWQuXG4gKiBTaG9wIGRlbm9taW5hdGlvbiAoR29sZC9BUCkgaXMgc2VwYXJhdGUgZnJvbSBHdWFyZGlhbi9Cb3NzIHN0YWdlIGRyb3BzLlxuICovXG5cbmV4cG9ydCB0eXBlIEdhY2hhU2hvcENoYW5uZWwgPSB7XG4gICAgcmVhZG9ubHkga2luZDogXCJzaG9wXCI7XG4gICAgcmVhZG9ubHkgY3VycmVuY3k6IFwiR29sZFwiIHwgXCJBUFwiO1xuICAgIHJlYWRvbmx5IGF2YWlsYWJsZTogYm9vbGVhbjtcbiAgICAvKiogV2h5IHNob3AgaXMgdW5hdmFpbGFibGUgd2hlbiBhdmFpbGFibGU9ZmFsc2UuICovXG4gICAgcmVhZG9ubHkgcmVhc29uPzogXCJub3RfZm9yX3NhbGVcIiB8IFwibm90X2F2YWlsYWJsZVwiO1xufTtcblxuZXhwb3J0IHR5cGUgR2FjaGFTdGFnZUNoYW5uZWwgPSB7XG4gICAgcmVhZG9ubHkga2luZDogXCJzdGFnZVwiO1xuICAgIHJlYWRvbmx5IG1hcDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG5lZWRCb3NzOiBib29sZWFuO1xuICAgIHJlYWRvbmx5IGxhYmVsOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbCA9IEdhY2hhU2hvcENoYW5uZWwgfCBHYWNoYVN0YWdlQ2hhbm5lbDtcblxuZXhwb3J0IHR5cGUgR2FjaGFBY3F1aXNpdGlvbklucHV0ID0ge1xuICAgIHJlYWRvbmx5IGFwOiBib29sZWFuO1xuICAgIC8qKiBQcm9kdWN0IGlzIGxpc3RlZCBpbiB0aGUgbGl2ZSBzaG9wIGNhdGFsb2cgKGVuYWJsZWQpLiAqL1xuICAgIHJlYWRvbmx5IGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogVHJ1ZSBvbmx5IHdoZW4gdGhlIHByb2R1Y3QgY2FuIGFjdHVhbGx5IGJlIHB1cmNoYXNlZC5cbiAgICAgKiBKRlRTRSBgTm9idXk9MWAgcHJvZHVjdHMgc3RheSBlbmFibGVkIGluIGNhdGFsb2cgYnV0IHJlamVjdCBzaG9wIGJ1eXMuXG4gICAgICovXG4gICAgcmVhZG9ubHkgcHVyY2hhc2FibGU6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBHYWNoYVNvdXJjZUlucHV0ID1cbiAgICB8IHsgcmVhZG9ubHkga2luZDogXCJzaG9wXCI7IHJlYWRvbmx5IGFwOiBib29sZWFuIH1cbiAgICB8IHsgcmVhZG9ubHkga2luZDogXCJzdGFnZVwiOyByZWFkb25seSBtYXA6IHN0cmluZzsgcmVhZG9ubHkgbmVlZEJvc3M6IGJvb2xlYW4gfTtcblxuLyoqIFNwbGl0IENhbWVsQ2FzZSBzdGFnZSBpZHMgZnJvbSBKRlRTRSBHdWFyZGlhblN0YWdlcy5qc29uIGludG8gcmVhZGFibGUgbGFiZWxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXA6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG1hcFxuICAgICAgICAucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgXCIkMSAkMlwiKVxuICAgICAgICAucmVwbGFjZSgvKFtBLVpdKykoW0EtWl1bYS16XSkvZywgXCIkMSAkMlwiKVxuICAgICAgICAudHJpbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2VDaGFubmVsTGFiZWwobWFwOiBzdHJpbmcsIG5lZWRCb3NzOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBjb25zdCBwcmV0dHkgPSBwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKTtcbiAgICBpZiAoIW5lZWRCb3NzKSB7XG4gICAgICAgIHJldHVybiBwcmV0dHk7XG4gICAgfVxuICAgIC8vIEF2b2lkIFwiQm9zcyDCtyBBdGxhbnRpcyBCb3NzXCIg4oCUIHN0YWdlIGlkcyBlbmQgaW4gQm9zcyBhbHJlYWR5LlxuICAgIGNvbnN0IHdpdGhvdXRCb3NzU3VmZml4ID0gcHJldHR5LnJlcGxhY2UoL1xccytCb3NzJC9pLCBcIlwiKTtcbiAgICByZXR1cm4gYEJvc3MgwrcgJHt3aXRob3V0Qm9zc1N1ZmZpeH1gO1xufVxuXG4vKiogU3RyaXAgdHJhaWxpbmcgQm9zcyBzbyB0aXRsZXMgcmVhZCBcIkF0bGFudGlzXCIsIG5vdCBcIkF0bGFudGlzIEJvc3NcIi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZVRpdGxlTmFtZShtYXA6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXApLnJlcGxhY2UoL1xccytCb3NzJC9pLCBcIlwiKS50cmltKCk7XG59XG5cbmV4cG9ydCB0eXBlIE1hcEFydEZpbGUgPSB7XG4gICAgcmVhZG9ubHkgZmlsZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHdpZHRoPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGhlaWdodD86IG51bWJlcjtcbiAgICByZWFkb25seSBraW5kPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgTWFwQXJ0Q2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBmaWxlczogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgTWFwQXJ0RmlsZT4+O1xuICAgIHJlYWRvbmx5IGJ5TmFtZTogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG4gICAgcmVhZG9ubHkgYnlNYXBJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xufTtcblxuLyoqIENhbmRpZGF0ZSBzdGFnZSBrZXlzIGZvciBtYXAgYXJ0IChCb3NzIHN1ZmZpeCArIGJhcmUgbWFwIG5hbWUpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcEFydExvb2t1cEtleXMobWFwTmFtZTogc3RyaW5nLCBuZWVkQm9zcyA9IGZhbHNlKTogcmVhZG9ubHkgc3RyaW5nW10ge1xuICAgIGNvbnN0IGtleXMgPSBbbWFwTmFtZV07XG4gICAgaWYgKG5lZWRCb3NzICYmICEvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChgJHttYXBOYW1lfUJvc3NgKTtcbiAgICB9XG4gICAgaWYgKC9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hcE5hbWUucmVwbGFjZSgvQm9zcyQvaSwgXCJcIikpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGF1dGhlbnRpYyBjbGllbnQgbWFwIGFydCBmb3IgYSBHdWFyZGlhblN0YWdlcyBtYXAgbmFtZS5cbiAqIFByZWZlcnMgVUkgbWFwLXNlbGVjdCB0aHVtYnM7IGZhbGxzIGJhY2sgdG8gc3RhZ2UtZW52aXJvbm1lbnQgdGV4dHVyZXMgd2hlbiBjYXRhbG9ndWVkLlxuICogTmV2ZXIgaW52ZW50cyBhcnQg4oCUIG9ubHkgcmV0dXJucyBhbiBleHBsaWNpdCBjYXRhbG9nIG1hcHBpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTWFwQXJ0RmlsZShcbiAgICBtYXBOYW1lOiBzdHJpbmcsXG4gICAgY2F0YWxvZzogTWFwQXJ0Q2F0YWxvZyxcbiAgICBvcHRpb25zPzogeyByZWFkb25seSBuZWVkQm9zcz86IGJvb2xlYW47IHJlYWRvbmx5IG1hcElkPzogbnVtYmVyIH0sXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBtYXBBcnRMb29rdXBLZXlzKG1hcE5hbWUsIG9wdGlvbnM/Lm5lZWRCb3NzID8/IGZhbHNlKSkge1xuICAgICAgICBjb25zdCBrZXkgPSBjYXRhbG9nLmJ5TmFtZVtuYW1lXTtcbiAgICAgICAgaWYgKGtleSAmJiBjYXRhbG9nLmZpbGVzW2tleV0/LmZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYXRhbG9nLmZpbGVzW2tleV0uZmlsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnM/Lm1hcElkID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGNhdGFsb2cuYnlNYXBJZD8uW2Ake29wdGlvbnMubWFwSWR9YF07XG4gICAgICAgIGlmIChrZXkgJiYgY2F0YWxvZy5maWxlc1trZXldPy5maWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2F0YWxvZy5maWxlc1trZXldLmZpbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBQcm9qZWN0IHNob3AgKyBzdGFnZSBhY3F1aXNpdGlvbiBjaGFubmVscyBmb3IgYSBnYWNoYSBjb2luLlxuICpcbiAqIC0gUHVyY2hhc2FibGUgc2hvcCDihpIgR29sZC9BUCBwaWxsLlxuICogLSBDYXRhbG9nLWxpc3RlZCBidXQgTm9idXkgKGBwdXJjaGFzYWJsZT1mYWxzZWAsIGBlbmFibGVkPXRydWVgKSDihpIgTm90IGZvciBzYWxlXG4gKiAgIChzdGlsbCBzaG93biB3aGVuIHN0YWdlcyBleGlzdCBzbyBwbGF5ZXJzIGRvIG5vdCBhc3N1bWUgYSBwcmljZSkuXG4gKiAtIEZ1bGx5IGRpc2FibGVkIHNob3Agd2l0aCBubyBzdGFnZXMg4oaSIE5vdCBhdmFpbGFibGUuXG4gKiAtIERpc2FibGVkIHNob3Agd2l0aCBzdGFnZXMg4oaSIHN0YWdlcyBvbmx5IChvbWl0IHNob3AgY2hyb21lKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbHMoXG4gICAgZ2FjaGE6IEdhY2hhQWNxdWlzaXRpb25JbnB1dCxcbiAgICBzb3VyY2VzOiByZWFkb25seSBHYWNoYVNvdXJjZUlucHV0W10sXG4pOiByZWFkb25seSBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbFtdIHtcbiAgICBjb25zdCBjaGFubmVsczogR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxbXSA9IFtdO1xuICAgIGNvbnN0IHN0YWdlU291cmNlcyA9IHNvdXJjZXMuZmlsdGVyKFxuICAgICAgICAoc291cmNlKTogc291cmNlIGlzIEV4dHJhY3Q8R2FjaGFTb3VyY2VJbnB1dCwgeyBraW5kOiBcInN0YWdlXCIgfT4gPT5cbiAgICAgICAgICAgIHNvdXJjZS5raW5kID09PSBcInN0YWdlXCIsXG4gICAgKTtcbiAgICBjb25zdCBoYXNTdGFnZSA9IHN0YWdlU291cmNlcy5sZW5ndGggPiAwO1xuICAgIGNvbnN0IGN1cnJlbmN5ID0gZ2FjaGEuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIjtcblxuICAgIGlmIChnYWNoYS5wdXJjaGFzYWJsZSkge1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZ2FjaGEuZW5hYmxlZCkge1xuICAgICAgICAvLyBMaXN0ZWQgaW4gc2hvcCBVSSAvIEFQSSBidXQgYmxvY2tlZCBieSBOb2J1eSDigJQgbmV2ZXIgaW1wbHkgYSBidXkgcGF0aC5cbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYXNvbjogXCJub3RfZm9yX3NhbGVcIixcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghaGFzU3RhZ2UpIHtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYXNvbjogXCJub3RfYXZhaWxhYmxlXCIsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNlZW5NYXBzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBzdGFnZSBvZiBzdGFnZVNvdXJjZXMpIHtcbiAgICAgICAgaWYgKHNlZW5NYXBzLmhhcyhzdGFnZS5tYXApKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuTWFwcy5hZGQoc3RhZ2UubWFwKTtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICBtYXA6IHN0YWdlLm1hcCxcbiAgICAgICAgICAgIG5lZWRCb3NzOiBzdGFnZS5uZWVkQm9zcyxcbiAgICAgICAgICAgIGxhYmVsOiBzdGFnZUNoYW5uZWxMYWJlbChzdGFnZS5tYXAsIHN0YWdlLm5lZWRCb3NzKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5uZWxzO1xufVxuXG4vKiogUGFyc2UgcHJvZHVjdCBpbmRleGVzIHdpdGggTm9idXniiaAwIGZyb20gSkZUU0UgU2hvcF9JbmkzLnhtbCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMoc2hvcFhtbDogc3RyaW5nKTogUmVhZG9ubHlTZXQ8bnVtYmVyPiB7XG4gICAgY29uc3Qgbm9idXkgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIHNob3BYbWwubWF0Y2hBbGwoLzxQcm9kdWN0XFxzKyhbXj5dKz8pXFwvPz4vZykpIHtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBtYXRjaFsxXSA/PyBcIlwiO1xuICAgICAgICBjb25zdCBpbmRleE1hdGNoID0gYXR0cnMubWF0Y2goL1xcYkluZGV4PVwiKFxcZCspXCIvKTtcbiAgICAgICAgY29uc3Qgbm9idXlNYXRjaCA9IGF0dHJzLm1hdGNoKC9cXGJOb2J1eT1cIihcXGQrKVwiLyk7XG4gICAgICAgIGlmICghaW5kZXhNYXRjaCB8fCAhbm9idXlNYXRjaCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vYnV5TWF0Y2hbMV0gIT09IFwiMFwiKSB7XG4gICAgICAgICAgICBub2J1eS5hZGQoTnVtYmVyKGluZGV4TWF0Y2hbMV0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9idXk7XG59XG4iLCJ0eXBlIFRhZ19uYW1lID0ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xudHlwZSBBdHRyaWJ1dGVzID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbnR5cGUgSFRNTF9ub2RlPFQgZXh0ZW5kcyBUYWdfbmFtZT4gPSBbVCwgLi4uKEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IEF0dHJpYnV0ZXMpW11dO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSFRNTDxUIGV4dGVuZHMgVGFnX25hbWU+KG5vZGU6IEhUTUxfbm9kZTxUPik6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZVswXSk7XG4gICAgZnVuY3Rpb24gaGFuZGxlKHBhcmFtZXRlcjogQXR0cmlidXRlcyB8IEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlciA9PT0gXCJzdHJpbmdcIiB8fCBwYXJhbWV0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQocGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBhcmFtZXRlcikpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNyZWF0ZUhUTUwocGFyYW1ldGVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHBhcmFtZXRlcltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFuZGxlKG5vZGVbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuaW1wb3J0IHtcbiAgICBwcmV0dHlHdWFyZGlhbk1hcE5hbWUsXG4gICAgcHJvamVjdEdhY2hhQWNxdWlzaXRpb25DaGFubmVscyxcbiAgICByZXNvbHZlTWFwQXJ0RmlsZSxcbiAgICBzdGFnZUNoYW5uZWxMYWJlbCxcbiAgICBzdGFnZVRpdGxlTmFtZSxcbiAgICB0eXBlIEdhY2hhU291cmNlSW5wdXQsXG4gICAgdHlwZSBNYXBBcnRDYXRhbG9nLFxufSBmcm9tICcuL2dhY2hhQWNxdWlzaXRpb24nO1xuaW1wb3J0IHsgcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5pbXBvcnQgeyBtZXJnZVByaW9yaXR5UmFua2luZ3MgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7XG4gICAgcHJvamVjdFN0YWdlQm9zc2VzLFxuICAgIHR5cGUgU3RhZ2VCb3NzQ2F0YWxvZyxcbiAgICB0eXBlIFN0YWdlQm9zc1Byb2plY3Rpb24sXG59IGZyb20gJy4vc3RhZ2VCb3NzZXMnO1xuXG5leHBvcnQgeyBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IH0gZnJvbSAnLi9wcmlvcml0eVN0YXRIZWFkZXJzJztcbmV4cG9ydCB0eXBlIHsgUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5leHBvcnQge1xuICAgIHJlc29sdmVNYXBBcnRGaWxlLFxuICAgIHN0YWdlVGl0bGVOYW1lLFxufSBmcm9tICcuL2dhY2hhQWNxdWlzaXRpb24nO1xuZXhwb3J0IHtcbiAgICBwcm9qZWN0U3RhZ2VCb3NzZXMsXG59IGZyb20gJy4vc3RhZ2VCb3NzZXMnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVycyA9IFtcIk5pa2lcIiwgXCJMdW5MdW5cIiwgXCJMdWN5XCIsIFwiU2h1YVwiLCBcIkRoYW5waXJcIiwgXCJQb2NoaVwiLCBcIkFsXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0gdHlwZW9mIGNoYXJhY3RlcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoYXJhY3RlcihjaGFyYWN0ZXI6IHN0cmluZyk6IGNoYXJhY3RlciBpcyBDaGFyYWN0ZXIge1xuICAgIHJldHVybiAoY2hhcmFjdGVycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhjaGFyYWN0ZXIpO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gXCJIYXRcIiB8IFwiSGFpclwiIHwgXCJEeWVcIiB8IFwiVXBwZXJcIiB8IFwiTG93ZXJcIiB8IFwiU2hvZXNcIiB8IFwiU29ja3NcIiB8IFwiSGFuZFwiIHwgXCJCYWNrcGFja1wiIHwgXCJGYWNlXCIgfCBcIlJhY2tldFwiIHwgXCJPdGhlclwiO1xuXG5leHBvcnQgY2xhc3MgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pZDogbnVtYmVyKSB7IH1cblxuICAgIGdldCByZXF1aXJlc0d1YXJkaWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi50aGlzLml0ZW0uc291cmNlcy52YWx1ZXMoKV0uZXZlcnkoc291cmNlID0+IHNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgZmluZGluZyBpdGVtIG9mIGl0ZW1Tb3VyY2UgJHt0aGlzLnNob3BfaWR9YCk7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2hvcEl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIsIHJlYWRvbmx5IHByaWNlOiBudW1iZXIsIHJlYWRvbmx5IGFwOiBib29sZWFuLCByZWFkb25seSBpdGVtczogSXRlbVtdKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG5cbiAgICBnYWNoYVRyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFnYWNoYSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnYWNoYS5hdmVyYWdlX3RyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBHYWNoYUVjb25vbWljcyA9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiO1xuICAgICAgICBjaGFuY2VQZXJjZW50OiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICB9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBjdXJyZW5jeTogXCJBUFwiIHwgXCJHb2xkXCI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogbnVtYmVyO1xuICAgICAgICBwcmljZVBlclB1bGw6IG51bWJlcjtcbiAgICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhRWNvbm9taWNzKFxuICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcixcbiAgICBzb3VyY2U/OiB7IHByaWNlOiBudW1iZXI7IGFwOiBib29sZWFuIH0sXG4pOiBHYWNoYUVjb25vbWljcyB7XG4gICAgY29uc3QgY2hhbmNlUGVyY2VudCA9IGV4cGVjdGVkUHVsbHMgPiAwID8gMTAwIC8gZXhwZWN0ZWRQdWxscyA6IDA7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgICAgIGV4cGVjdGVkUHVsbHMsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIixcbiAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgY3VycmVuY3k6IHNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiLFxuICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICBleHBlY3RlZFNwZW5kOiBleHBlY3RlZFB1bGxzICogc291cmNlLnByaWNlLFxuICAgICAgICBwcmljZVBlclB1bGw6IHNvdXJjZS5wcmljZSxcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgR3VhcmRpYW5JdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IGd1YXJkaWFuX21hcDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBpdGVtczogSXRlbVtdLFxuICAgICAgICByZWFkb25seSB4cDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuZWVkX2Jvc3M6IGJvb2xlYW4sXG4gICAgICAgIHJlYWRvbmx5IGJvc3NfdGltZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKEd1YXJkaWFuSXRlbVNvdXJjZS5ndWFyZGlhbl9tYXBfaWQoZ3VhcmRpYW5fbWFwKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGd1YXJkaWFuX21hcF9pZChtYXA6IHN0cmluZykge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMuaW5kZXhPZihtYXApO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmd1YXJkaWFuX21hcHMucHVzaChtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtaW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3VhcmRpYW5fbWFwcyA9IFtcIlwiXTtcbn1cblxuZXhwb3J0IGNsYXNzIEl0ZW0ge1xuICAgIGlkID0gMDtcbiAgICBuYW1lX2tyID0gXCJcIjtcbiAgICBuYW1lX2VuID0gXCJcIjtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICBtYXhVc2UgPSAwO1xuICAgIGhpZGRlbiA9IGZhbHNlO1xuICAgIHJlc2lzdCA9IFwiXCI7XG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyO1xuICAgIHBhcnQ6IFBhcnQgPSBcIk90aGVyXCI7XG4gICAgbGV2ZWwgPSAwO1xuICAgIHN0ciA9IDA7XG4gICAgc3RhID0gMDtcbiAgICBkZXggPSAwO1xuICAgIHdpbCA9IDA7XG4gICAgaHAgPSAwO1xuICAgIHF1aWNrc2xvdHMgPSAwO1xuICAgIGJ1ZmZzbG90cyA9IDA7XG4gICAgc21hc2ggPSAwO1xuICAgIG1vdmVtZW50ID0gMDtcbiAgICBjaGFyZ2UgPSAwO1xuICAgIGxvYiA9IDA7XG4gICAgc2VydmUgPSAwO1xuICAgIG1heF9zdHIgPSAwO1xuICAgIG1heF9zdGEgPSAwO1xuICAgIG1heF9kZXggPSAwO1xuICAgIG1heF93aWwgPSAwO1xuICAgIGVsZW1lbnRfZW5jaGFudGFibGUgPSBmYWxzZTtcbiAgICBwYXJjZWxfZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNwaW4gPSAwO1xuICAgIGF0c3MgPSAwO1xuICAgIGRmc3MgPSAwO1xuICAgIHNvY2tldCA9IDA7XG4gICAgZ2F1Z2UgPSAwO1xuICAgIGdhdWdlX2JhdHRsZSA9IDA7XG4gICAgc291cmNlczogSXRlbVNvdXJjZVtdID0gW107XG4gICAgc3RhdEZyb21TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiTW92IFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZW1lbnQ7XG4gICAgICAgICAgICBjYXNlIFwiQ2hhcmdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlO1xuICAgICAgICAgICAgY2FzZSBcIkxvYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYjtcbiAgICAgICAgICAgIGNhc2UgXCJTbWFzaFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNtYXNoO1xuICAgICAgICAgICAgY2FzZSBcIlN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcbiAgICAgICAgICAgIGNhc2UgXCJEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXg7XG4gICAgICAgICAgICBjYXNlIFwiU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhO1xuICAgICAgICAgICAgY2FzZSBcIldpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53aWw7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdHI7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IERleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9kZXg7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdGE7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFdpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfd2lsO1xuICAgICAgICAgICAgY2FzZSBcIlNlcnZlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmU7XG4gICAgICAgICAgICBjYXNlIFwiUXVpY2tzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1aWNrc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiQnVmZnNsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZnNsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkhQXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgc2hvcF9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBnYWNoYV9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHByaWNlOiBudW1iZXIgPSAwLFxuICAgICAgICByZWFkb25seSBhcDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKiogTGlzdGVkIGluIHRoZSBsaXZlIHNob3AgY2F0YWxvZyAoYGVuYWJsZWRgKS4gKi9cbiAgICAgICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuIGJlIHB1cmNoYXNlZCB3aXRoIEdvbGQvQVAuIEZhbHNlIHdoZW4gU2hvcF9JbmkzIGBOb2J1eeKJoDBgXG4gICAgICAgICAqIGV2ZW4gaWYgdGhlIGNhdGFsb2cgc3RpbGwgbGlzdHMgdGhlIHByb2R1Y3QgYXMgZW5hYmxlZC5cbiAgICAgICAgICovXG4gICAgICAgIHJlYWRvbmx5IHB1cmNoYXNhYmxlOiBib29sZWFuID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgY2hhcmFjdGVycykge1xuICAgICAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLnNldChjaGFyYWN0ZXIsIG5ldyBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+KCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQoaXRlbTogSXRlbSwgcHJvYmFiaWxpdHk6IG51bWJlciwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIsIHF1YW50aXR5X21pbjogbnVtYmVyLCBxdWFudGl0eV9tYXg6IG51bWJlcikge1xuICAgICAgICBpZiAoaXRlbS5jaGFyYWN0ZXIgJiYgaXRlbS5jaGFyYWN0ZXIgIT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgLy8gTG90dGVyeSBmaWxlcyBsaXN0IGV2ZXJ5IGNoYXJhY3RlcidzIGdlYXIgdW5kZXIgZWFjaCBMb3R0ZXJ5SXRlbV8qIGJsb2NrLlxuICAgICAgICAgICAgLy8gUm91dGUgdGhlIGVudHJ5IHRvIHRoZSBpdGVtJ3Mgb3duaW5nIGNoYXJhY3RlciBzbyBmaWx0ZXJzIHN0YXkgbWVhbmluZ2Z1bC5cbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGl0ZW0uY2hhcmFjdGVyO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSE7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gbWFwLmdldChpdGVtKTtcbiAgICAgICAgLy8gU2FtZSBJdGVtIGNhbiBhcHBlYXIgb25jZSBwZXIgY2hhcmFjdGVyLWJsb2NrIChlLmcuIDfDlyBEcmFnb24gQXJtb3IgYXQgMSUpLlxuICAgICAgICAvLyBBY2N1bXVsYXRlIENoYW5zUGVyIGluc3RlYWQgb2Ygb3ZlcndyaXRpbmcg4oCUIG90aGVyd2lzZSByYXRlcyBzdGF5IHN0dWNrIGF0IDElXG4gICAgICAgIC8vIHdoaWxlIGNoYXJhY3Rlcl9wcm9iYWJpbGl0eSBzdGlsbCBzdW1zIHRvIDEwMCAobWFwIHRpY2tldHMg4omqIHBvb2wgdG90YWwpLlxuICAgICAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgICAgIG1hcC5zZXQoaXRlbSwgW1xuICAgICAgICAgICAgICAgIHByZXZpb3VzWzBdICsgcHJvYmFiaWxpdHksXG4gICAgICAgICAgICAgICAgTWF0aC5taW4ocHJldmlvdXNbMV0sIHF1YW50aXR5X21pbiksXG4gICAgICAgICAgICAgICAgTWF0aC5tYXgocHJldmlvdXNbMl0sIHF1YW50aXR5X21heCksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1hcC5zZXQoaXRlbSwgW3Byb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LnNldChjaGFyYWN0ZXIsIHByb2JhYmlsaXR5ICsgKHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpIHx8IDApKTtcbiAgICB9XG5cbiAgICBhdmVyYWdlX3RyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGNoYXJzOiByZWFkb25seSBDaGFyYWN0ZXJbXSA9IGNoYXJhY3RlciA/IChbY2hhcmFjdGVyXSkgOiBjaGFyYWN0ZXJzO1xuICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgKHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuZ2V0KGl0ZW0pPy5bMF0gfHwgMCksIDApO1xuICAgICAgICBpZiAocHJvYmFiaWxpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsX3Byb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgICAgICByZXR1cm4gdG90YWxfcHJvYmFiaWxpdHkgLyBwcm9iYWJpbGl0eTtcbiAgICB9XG5cbiAgICBnZXQgdG90YWxfcHJvYmFiaWxpdHkoKSB7XG4gICAgICAgIHJldHVybiBjaGFyYWN0ZXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICB9XG5cbiAgICBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgPSBuZXcgTWFwPENoYXJhY3RlciwgbnVtYmVyPigpO1xuICAgIHNob3BfaXRlbXMgPSBuZXcgTWFwPENoYXJhY3RlciwgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPj4oKTtcbn1cblxuZXhwb3J0IGxldCBpdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBzaG9wX2l0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5leHBvcnQgbGV0IGdhY2hhcyA9IG5ldyBNYXA8bnVtYmVyLCBHYWNoYT4oKTtcbmxldCBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgdW5kZWZpbmVkO1xudHlwZSBJdGVtQXJ0RW50cnkgPSBbc2hlZXQ6IHN0cmluZywgY2VsbDogbnVtYmVyXTtcbnR5cGUgSXRlbUFydFNoZWV0ID0ge1xuICAgIGxpbmVDb3VudDogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICBzcGFjZTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG59O1xudHlwZSBMb3R0ZXJ5QXJ0RW50cnkgPSB7XG4gICAgc2hlZXQ6IHN0cmluZztcbiAgICBjZWxsOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBzaGFwZTogXCJjb2luXCIgfCBcImN1YmVcIiB8IFwidG9rZW5cIjtcbn07XG50eXBlIEl0ZW1BcnRNYXAgPSB7XG4gICAgaXRlbXM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRFbnRyeT47XG4gICAgbG90dGVyaWVzOiBSZWNvcmQ8c3RyaW5nLCBMb3R0ZXJ5QXJ0RW50cnk+O1xuICAgIHNoZWV0czogUmVjb3JkPHN0cmluZywgSXRlbUFydFNoZWV0Pjtcbn07XG5sZXQgaXRlbUFydE1hcDogSXRlbUFydE1hcCA9IHsgaXRlbXM6IHt9LCBsb3R0ZXJpZXM6IHt9LCBzaGVldHM6IHt9IH07XG5sZXQgbWFwQXJ0TWFwOiBNYXBBcnRDYXRhbG9nID0geyBmaWxlczoge30sIGJ5TmFtZToge30gfTtcbmxldCBzdGFnZUJvc3NDYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG50eXBlIEJvc3NBcnRDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IGJ5Qm9zc0lkPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG4gICAgcmVhZG9ubHkgYnlSZXNJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xuICAgIHJlYWRvbmx5IGZpbGVzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgeyByZWFkb25seSBmaWxlOiBzdHJpbmcgfT4+O1xufTtcbmxldCBib3NzQXJ0Q2F0YWxvZzogQm9zc0FydENhdGFsb2cgPSB7fTtcblxuZnVuY3Rpb24gcHJldHR5TnVtYmVyKG46IG51bWJlciwgZGlnaXRzOiBudW1iZXIpIHtcbiAgICBsZXQgcyA9IG4udG9GaXhlZChkaWdpdHMpO1xuICAgIHdoaWxlIChzLmVuZHNXaXRoKFwiMFwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIGlmIChzLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUl0ZW1EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJdGVtcyBmaWxlIGlzIG9ubHkgJHtkYXRhLmxlbmd0aH0gYnl0ZXMgbG9uZ2ApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIHJlc3VsdF0gb2YgZGF0YS5tYXRjaEFsbCgvXFw8SXRlbSAoLiopXFwvXFw+L2cpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSBuZXcgSXRlbTtcbiAgICAgICAgZm9yIChjb25zdCBbLCBhdHRyaWJ1dGUsIHZhbHVlXSBvZiByZXN1bHQubWF0Y2hBbGwoL1xccz8oW149XSopPVwiKFteXCJdKilcIi9nKSkge1xuICAgICAgICAgICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiSW5kZXhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5pZCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIl9OYW1lX1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfa3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk5hbWVfTlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVzZVR5cGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51c2VUeXBlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNYXhVc2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhVc2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJIaWRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaGlkZGVuID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSZXNpc3RcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZXNpc3QgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk5JS0lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTmlraVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVTkxVTlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdW5MdW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVUNZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1Y3lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTSFVBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlNodWFcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJESEFOUElSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkRoYW5waXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQT0NISVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJQb2NoaVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFMXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkFsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBjaGFyYWN0ZXIgXCIke3ZhbHVlfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlBhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQkFHXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJCYWNrcGFja1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkdMQVNTRVNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkZhY2VcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQU5EXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU09DS1NcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNvY2tzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRk9PVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU2hvZXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDQVBcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBBTlRTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJMb3dlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlJBQ0tFVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiUmFja2V0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQk9EWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiVXBwZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQUlSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYWlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRFlFXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJEeWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHBhcnQgJHt2YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTGV2ZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZXZlbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0ciA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0YSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRleCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIldJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLndpbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEhQXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaHAgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRRdWlja1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnF1aWNrc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRCdWZmXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYnVmZnNsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU21hc2hTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNtYXNoID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTW92ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubW92ZW1lbnQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyZ2VzaG90U3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyZ2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMb2JTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxvYiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNlcnZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXJ2ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RyID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0cik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0YSA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX0RFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9kZXggPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9XSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfd2lsID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLndpbCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmNoYW50RWxlbWVudFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuYWJsZVBhcmNlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcmNlbF9lbmFibGVkID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJCYWxsU3BpblwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNwaW4gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBVFNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXRzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRGU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZnNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU29ja2V0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc29ja2V0ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlQmF0dGxlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2VfYmF0dGxlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gaXRlbSBhdHRyaWJ1dGUgXCIke2F0dHJpYnV0ZX1cImApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGl0ZW1zLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICB9XG59XG5cbmNsYXNzIEFwaUl0ZW0ge1xuICAgIHByb2R1Y3RJbmRleCA9IDA7XG4gICAgZGlzcGxheSA9IDA7XG4gICAgaGl0RGlzcGxheSA9IGZhbHNlO1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICB1c2UwID0gMDtcbiAgICB1c2UxID0gMDtcbiAgICB1c2UyID0gMDtcbiAgICBwcmljZVR5cGUgPSBcIkdPTERcIjtcbiAgICBvbGRQcmljZTAgPSAwO1xuICAgIG9sZFByaWNlMSA9IDA7XG4gICAgb2xkUHJpY2UyID0gMDtcbiAgICBwcmljZTAgPSAwO1xuICAgIHByaWNlMSA9IDA7XG4gICAgcHJpY2UyID0gMDtcbiAgICBjb3VwbGVQcmljZSA9IDA7XG4gICAgY2F0ZWdvcnkgPSBcIlwiO1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGdvbGRCYWNrID0gMDtcbiAgICBlbmFibGVQYXJjZWwgPSBmYWxzZTtcbiAgICBmb3JQbGF5ZXIgPSAwO1xuICAgIGl0ZW0wID0gMDtcbiAgICBpdGVtMSA9IDA7XG4gICAgaXRlbTIgPSAwO1xuICAgIGl0ZW0zID0gMDtcbiAgICBpdGVtNCA9IDA7XG4gICAgaXRlbTUgPSAwO1xuICAgIGl0ZW02ID0gMDtcbiAgICBpdGVtNyA9IDA7XG4gICAgaXRlbTggPSAwO1xuICAgIGl0ZW05ID0gMDtcbn1cblxuZnVuY3Rpb24gaXNBcGlJdGVtKG9iajogYW55KTogb2JqIGlzIEFwaUl0ZW0ge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHR5cGVvZiBvYmoucHJvZHVjdEluZGV4ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmRpc3BsYXkgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaGl0RGlzcGxheSA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlZCA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlVHlwZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY291cGxlUHJpY2UgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY2F0ZWdvcnkgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai5nb2xkQmFjayA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5lbmFibGVQYXJjZWwgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmZvclBsYXllciA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOSA9PT0gXCJudW1iZXJcIlxuICAgIF0uZXZlcnkoYiA9PiBiKTtcbn1cblxuLyoqIFByb2R1Y3QgaW5kZXhlcyB0aGF0IHJlamVjdCBzaG9wIGJ1eXMgKFNob3BfSW5pMyBOb2J1eeKJoDApLiBMaXZlIEFQSSBvbWl0cyB0aGlzIGZpZWxkLiAqL1xubGV0IHNob3BOb2J1eVByb2R1Y3RJbmRleGVzOiBSZWFkb25seVNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuXG5mdW5jdGlvbiBpc1Nob3BQdXJjaGFzYWJsZShwcm9kdWN0SW5kZXg6IG51bWJlciwgZW5hYmxlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbmFibGVkICYmICFzaG9wTm9idXlQcm9kdWN0SW5kZXhlcy5oYXMocHJvZHVjdEluZGV4KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VBcGlTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGFwaUl0ZW0gb2YgSlNPTi5wYXJzZShkYXRhKSkge1xuICAgICAgICBpZiAoIWlzQXBpSXRlbShhcGlJdGVtKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW5jb3JyZWN0IGZvcm1hdCBvZiBpdGVtOiAke2RhdGF9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyX2l0ZW1zID0gW1xuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTEsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0yLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMyxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTQsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW01LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTcsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW04LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOSxcbiAgICAgICAgXS5maWx0ZXIoaWQgPT4gISFpZCAmJiBpdGVtcy5nZXQoaWQpKS5tYXAoaWQgPT4gaXRlbXMuZ2V0KGlkKSEpO1xuXG4gICAgICAgIGNvbnN0IHB1cmNoYXNhYmxlID0gaXNTaG9wUHVyY2hhc2FibGUoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0uZW5hYmxlZCk7XG5cbiAgICAgICAgaWYgKGFwaUl0ZW0uY2F0ZWdvcnkgPT09IFwiUEFSVFNcIikge1xuICAgICAgICAgICAgaWYgKGlubmVyX2l0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpbm5lcl9pdGVtc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT25seSByZWFsIHB1cmNoYXNlIHBhdGhzIGNvdW50IGFzIHNob3Agc291cmNlcyAoZXhjbHVkZSBOb2J1eSBjYXRhbG9nIHJvd3MpLlxuICAgICAgICAgICAgaWYgKHB1cmNoYXNhYmxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoXG4gICAgICAgICAgICAgICAgYXBpSXRlbS5wcm9kdWN0SW5kZXgsXG4gICAgICAgICAgICAgICAgbmV3IEdhY2hhKFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByb2R1Y3RJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByaWNlMCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLmVuYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNhYmxlLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIC8vIFByb2R1Y3QgaW5kZXggaXMgdGhlIHNob3BfaXRlbXMgLyBnYWNoYXMga2V5IOKAlCByZXF1aXJlZCBzbyByZXdhcmQgdGlsZXNcbiAgICAgICAgICAgIC8vIGNhbiByZXNvbHZlIGNvaW4gYXJ0IHdpdGggZ2FjaGFzLmdldChpdGVtLmlkKSB0aGUgc2FtZSB3YXkgdGhlIHRhYmxlIGRvZXMuXG4gICAgICAgICAgICBnYWNoYUl0ZW0uaWQgPSBhcGlJdGVtLnByb2R1Y3RJbmRleDtcbiAgICAgICAgICAgIGdhY2hhSXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGdhY2hhSXRlbSk7XG4gICAgICAgICAgICBpZiAocHVyY2hhc2FibGUpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0uaWQgPSBhcGlJdGVtLnByb2R1Y3RJbmRleDtcbiAgICAgICAgICAgIG90aGVySXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG90aGVySXRlbSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHYWNoYURhdGEoZGF0YTogc3RyaW5nLCBnYWNoYTogR2FjaGEpIHtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGF0YS5zcGxpdChcIlxcblwiKSkge1xuICAgICAgICBpZiAoIWxpbmUuaW5jbHVkZXMoXCI8TG90dGVyeUl0ZW1fXCIpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL1xccyo8TG90dGVyeUl0ZW1fKD88Y2hhcmFjdGVyPlteIF0qKSBJbmRleD1cIlxcZCtcIiBfTmFtZV89XCJbXlwiXSpcIiBTaG9wSW5kZXg9XCIoPzxzaG9wX2lkPlxcZCspXCIgUXVhbnRpdHlNaW49XCIoPzxxdWFudGl0eV9taW4+XFxkKylcIiBRdWFudGl0eU1heD1cIig/PHF1YW50aXR5X21heD5cXGQrKVwiIENoYW5zUGVyPVwiKD88cHJvYmFiaWxpdHk+XFxkK1xcLj9cXGQqKVxccypcIiBFZmZlY3Q9XCJcXGQrXCIgUHJvZHVjdE9wdD1cIlxcZCtcIlxcLz4vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgcGFyc2luZyBnYWNoYSAke2dhY2hhLmdhY2hhX2luZGV4fTpcXG4ke2xpbmV9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1hdGNoLmdyb3Vwcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYXJhY3RlciA9IG1hdGNoLmdyb3Vwcy5jaGFyYWN0ZXI7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTHVubHVuXCIpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0NoYXJhY3RlcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHtjaGFyYWN0ZXJ9XCIgaW4gbG90dGVyeSBmaWxlICR7Z2FjaGEuZ2FjaGFfaW5kZXh9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQocGFyc2VJbnQobWF0Y2guZ3JvdXBzLnNob3BfaWQpKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gc2hvcCBpdGVtIGlkICR7bWF0Y2guZ3JvdXBzLnNob3BfaWR9IGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2FjaGEuYWRkKGl0ZW0sIHBhcnNlRmxvYXQobWF0Y2guZ3JvdXBzLnByb2JhYmlsaXR5KSwgY2hhcmFjdGVyLCBwYXJzZUludChtYXRjaC5ncm91cHMucXVhbnRpdHlfbWluKSwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21heCkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIG1hcF0gb2YgZ2FjaGEuc2hvcF9pdGVtcykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpdGVtLF0gb2YgbWFwKSB7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChuZXcgR2FjaGFJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHdWFyZGlhbkRhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ3VhcmRpYW5EYXRhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE51bWJlcihvOiBhbnkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBib3NzVGltZUluZm8gPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWFwSW5mbyBvZiBndWFyZGlhbkRhdGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBJbmZvICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXBfbmFtZSA9IG1hcEluZm8uTmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBfbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV3YXJkcyA9IEFycmF5LmlzQXJyYXkobWFwSW5mby5SZXdhcmRzKSA/IFsuLi5tYXBJbmZvLlJld2FyZHNdIDogW107XG4gICAgICAgIGNvbnN0IHJld2FyZF9pdGVtcyA9IHJld2FyZHNcbiAgICAgICAgICAgIC5maWx0ZXIoKHNob3BfaWQpOiBzaG9wX2lkIGlzIG51bWJlciA9PiB0eXBlb2Ygc2hvcF9pZCA9PT0gXCJudW1iZXJcIiAmJiBzaG9wX2l0ZW1zLmhhcyhzaG9wX2lkKSlcbiAgICAgICAgICAgIC5tYXAoc2hvcF9pZCA9PiBzaG9wX2l0ZW1zLmdldChzaG9wX2lkKSEpO1xuICAgICAgICBjb25zdCBFeHBNdWx0aXBsaWVyID0gZ2V0TnVtYmVyKG1hcEluZm8uRXhwTXVsdGlwbGllcikgfHwgMDtcbiAgICAgICAgY29uc3QgSXNCb3NzU3RhZ2UgPSAhIW1hcEluZm8uSXNCb3NzU3RhZ2U7XG4gICAgICAgIGNvbnN0IE1hcElEID0gZ2V0TnVtYmVyKG1hcEluZm8uTWFwSWQpIHx8IDA7XG4gICAgICAgIGxldCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID0gZ2V0TnVtYmVyKG1hcEluZm8uQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcykgfHwgLTE7XG4gICAgICAgIGlmIChCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID09PSAtMSkge1xuICAgICAgICAgICAgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGJvc3NUaW1lSW5mby5nZXQoTWFwSUQpIHx8IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKE1hcElEICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYm9zc1RpbWVJbmZvLnNldChNYXBJRCwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJld2FyZF9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBuZXcgR3VhcmRpYW5JdGVtU291cmNlKG1hcF9uYW1lLCByZXdhcmRfaXRlbXMsIEV4cE11bHRpcGxpZXIsIElzQm9zc1N0YWdlLCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKTtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgUHJvZHVjdFN0YWdlRHJvcCA9IHtcbiAgICByZWFkb25seSBtYXA6IHN0cmluZztcbiAgICByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbjtcbiAgICByZWFkb25seSB4cD86IG51bWJlcjtcbiAgICByZWFkb25seSBib3NzVGltZT86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBwcm9kdWN0cz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHJlYWRvbmx5IFByb2R1Y3RTdGFnZURyb3BbXT4+O1xufTtcblxuLyoqXG4gKiBNZXJnZSBTX1JlbGF0aW9uc2hpcHMtZGVyaXZlZCBib3NzL21hcCBkcm9wcyBvbnRvIHNob3AgcHJvZHVjdHMuXG4gKiBEZWR1cGVzIGJ5IGd1YXJkaWFuIG1hcCBuYW1lIHNvIEd1YXJkaWFuU3RhZ2VzIFJld2FyZHMgcGF0aHMgYXJlIG5vdCBkb3VibGVkLlxuICogVGhpcyBpcyB3aGF0IG1ha2VzIE5vYnV5IGNvaW5zIGxpa2UgQmx1ZSBDYXBzdWxlIGFuc3dlciBcIndoZXJlIGRvIEkgZ2V0IHRoaXM/XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVByb2R1Y3RTdGFnZURyb3BzKGNhdGFsb2c6IFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyk6IHZvaWQge1xuICAgIGNvbnN0IHByb2R1Y3RzID0gY2F0YWxvZy5wcm9kdWN0cztcbiAgICBpZiAoIXByb2R1Y3RzIHx8IHR5cGVvZiBwcm9kdWN0cyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgW3Byb2R1Y3RLZXksIGRyb3BzXSBvZiBPYmplY3QuZW50cmllcyhwcm9kdWN0cykpIHtcbiAgICAgICAgY29uc3QgcHJvZHVjdEluZGV4ID0gTnVtYmVyKHByb2R1Y3RLZXkpO1xuICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcm9kdWN0SW5kZXgpIHx8ICFBcnJheS5pc0FycmF5KGRyb3BzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHByb2R1Y3RJbmRleCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhpc3RpbmdNYXBzID0gbmV3IFNldChcbiAgICAgICAgICAgIGl0ZW0uc291cmNlc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT4gc291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKVxuICAgICAgICAgICAgICAgIC5tYXAoKHNvdXJjZSkgPT4gc291cmNlLmd1YXJkaWFuX21hcCksXG4gICAgICAgICk7XG4gICAgICAgIGZvciAoY29uc3QgZHJvcCBvZiBkcm9wcykge1xuICAgICAgICAgICAgaWYgKCFkcm9wIHx8IHR5cGVvZiBkcm9wLm1hcCAhPT0gXCJzdHJpbmdcIiB8fCBkcm9wLm1hcC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleGlzdGluZ01hcHMuaGFzKGRyb3AubWFwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhpc3RpbmdNYXBzLmFkZChkcm9wLm1hcCk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgR3VhcmRpYW5JdGVtU291cmNlKFxuICAgICAgICAgICAgICAgICAgICBkcm9wLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgW2l0ZW1dLFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZHJvcC54cCA9PT0gXCJudW1iZXJcIiA/IGRyb3AueHAgOiAwLFxuICAgICAgICAgICAgICAgICAgICAhIWRyb3AubmVlZEJvc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkcm9wLmJvc3NUaW1lID09PSBcIm51bWJlclwiID8gZHJvcC5ib3NzVGltZSA6IC0xLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKiogVXNlci1mYWNpbmcgbGFiLXByZXAgcGhhc2VzIOKAlCBuZXZlciBleHBvc2UgcmF3IGZpbGVuYW1lcywgcGF0aHMsIG9yIFhNTCBuYW1lcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkaW5nUGhhc2VGb3JVcmwodXJsOiBzdHJpbmcpOiB7IHRpdGxlOiBzdHJpbmc7IGRldGFpbDogc3RyaW5nIH0ge1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJJdGVtX1BhcnRzXCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJQcmVwYXJpbmcgZXF1aXBtZW50IGNhdGFsb2figKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJHYXRoZXJpbmcgZXZlcnkgd2VhcmFibGUgZm9yIGNvbXBhcmlzb24uXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCIvYXBpL3Nob3BcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkNoZWNraW5nIHRoZSBsaXZlIHNob3DigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJSZWFkaW5nIEdvbGQgYW5kIEFQIGxpc3RpbmdzLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiR3VhcmRpYW5TdGFnZXNcIikgfHwgdXJsLmluY2x1ZGVzKFwicHJvZHVjdC1zdGFnZS1kcm9wc1wiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiTWFwcGluZyBzdGFnZSByZXdhcmRz4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiRmluZGluZyB3aGVyZSBnZWFyIGFuZCBjb2lucyBkcm9wLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiSW5pM19Mb3RcIikgfHwgdXJsLmluY2x1ZGVzKFwibG90dGVyeVwiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiTG9hZGluZyBnYWNoYSB0YWJsZXPigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJNYXRjaGluZyBjYXBzdWxlcyB0byB0aGVpciBwcml6ZXMuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJpdGVtLWFydFwiKSB8fCB1cmwuaW5jbHVkZXMoXCJzaG9wLW5vYnV5XCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJGaW5pc2hpbmcgdGhlIGxhYuKAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIlN5bmNpbmcgYXJ0IGFuZCBzYWxlIHN0YXR1cy5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IFwiT3BlbmluZyB0aGUgZXF1aXBtZW50IGxhYuKAplwiLFxuICAgICAgICBkZXRhaWw6IFwiQWxtb3N0IHJlYWR5IHRvIGNvbXBhcmUgZ2Vhci5cIixcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzZXRMb2FkaW5nUGhhc2UodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwaGFzZSA9IGxvYWRpbmdQaGFzZUZvclVybCh1cmwpO1xuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGlmICh0aXRsZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gcGhhc2UudGl0bGU7XG4gICAgfVxuICAgIGNvbnN0IGRldGFpbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGluZy1zdGF0ZV9fZGV0YWlsXCIpO1xuICAgIGlmIChkZXRhaWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBkZXRhaWwudGV4dENvbnRlbnQgPSBwaGFzZS5kZXRhaWw7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHNldExvYWRpbmdQaGFzZSh1cmwpO1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSsrO1xuICAgIH1cbiAgICBpZiAoIXJlcGx5Lm9rKSB7XG4gICAgICAgIC8vIEtlZXAgdGVjaG5pY2FsIFVSTCBkZXRhaWwgaW4gdGhlIHRocm93biBlcnJvciBmb3IgbG9nczsgVUkgdXNlcyBodW1hbiBjb3B5LlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIGRvd25sb2FkaW5nICR7dXJsfTogJHtyZXBseS5zdGF0dXN9JHtyZXBseS5zdGF0dXNUZXh0ID8gYCAke3JlcGx5LnN0YXR1c1RleHR9YCA6IFwiXCJ9YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVwbHkudGV4dCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRJdGVtcygpIHtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IDEyNDtcbiAgICB9XG4gICAgY29uc3QgaXRlbVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2F1dGgtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBnYWNoYVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2dhbWUtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXMvbG90dGVyeVwiO1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvc2VydmVyLWNvcmUvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGl0ZW1VUkwgPSBpdGVtU291cmNlICsgXCIvSXRlbV9QYXJ0c19JbmkzLnhtbFwiO1xuICAgIGNvbnN0IGl0ZW1EYXRhID0gZG93bmxvYWQoaXRlbVVSTCk7XG4gICAgLy8gQ29tcGFjdCBOb2J1eSBpbmRleCAoZnJvbSBTaG9wX0luaTMpIOKAlCBsaXZlIHNob3AgQVBJIG9taXRzIHRoaXMgZmllbGQuXG4gICAgY29uc3Qgc2hvcE5vYnV5RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3Nob3Atbm9idXktaW5kZXhlcy5qc29uXCIpO1xuICAgIC8vIEJvc3MvbWFwIGRyb3BzIGZyb20gU19SZWxhdGlvbnNoaXBzIChiZXlvbmQgR3VhcmRpYW5TdGFnZXMgUmV3YXJkcyBsaXN0cykuXG4gICAgY29uc3QgcHJvZHVjdFN0YWdlRHJvcHNEYXRhID0gZG93bmxvYWQoXCJhc3NldHMvcHJvZHVjdC1zdGFnZS1kcm9wcy5qc29uXCIpO1xuICAgIGNvbnN0IGl0ZW1BcnREYXRhID0gZG93bmxvYWQoXCJhc3NldHMvaXRlbS1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWFwQXJ0RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL21hcC1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3Qgc3RhZ2VCb3NzRGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3N0YWdlLWJvc3Nlcy5qc29uXCIpO1xuICAgIGNvbnN0IGJvc3NBcnREYXRhID0gZG93bmxvYWQoXCJhc3NldHMvYm9zcy1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWF4X3Nob3BfcGFnZXMgPSAyMDsgLy9jdXJyZW50bHkgbmVlZCBvbmx5IDEwLCBzaG91bGQgYmUgZW5vdWdoXG4gICAgY29uc3Qgc2hvcFVSTHMgPSBsb2NhdGlvbi5ob3N0bmFtZS5lbmRzV2l0aChcIi5naXRodWIuaW9cIilcbiAgICAgICAgPyBbLi4uQXJyYXkobWF4X3Nob3BfcGFnZXMpLmtleXMoKV0ubWFwKG4gPT4gbmV3IFVSTChgc2hvcC8ke259Lmpzb25gLCBkb2N1bWVudC5iYXNlVVJJKS5ocmVmKVxuICAgICAgICA6IFsuLi5BcnJheShtYXhfc2hvcF9wYWdlcykua2V5cygpXS5tYXAobiA9PiBgL2FwaS9zaG9wP3NpemU9MTAwMCZwYWdlPSR7bn1gKTtcbiAgICBjb25zdCBzaG9wRGF0YXMgPSBzaG9wVVJMcy5tYXAoZG93bmxvYWQpO1xuICAgIGNvbnN0IGd1YXJkaWFuVVJMID0gZ3VhcmRpYW5Tb3VyY2UgKyBcIi9HdWFyZGlhblN0YWdlcy5qc29uXCI7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gZG93bmxvYWQoZ3VhcmRpYW5VUkwpO1xuICAgIHBhcnNlSXRlbURhdGEoYXdhaXQgaXRlbURhdGEpO1xuICAgIGl0ZW1BcnRNYXAgPSBKU09OLnBhcnNlKGF3YWl0IGl0ZW1BcnREYXRhKSBhcyBJdGVtQXJ0TWFwO1xuICAgIHRyeSB7XG4gICAgICAgIG1hcEFydE1hcCA9IEpTT04ucGFyc2UoYXdhaXQgbWFwQXJ0RGF0YSkgYXMgTWFwQXJ0Q2F0YWxvZztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgbWFwIGFydCBjYXRhbG9nOiAke2V9YCk7XG4gICAgICAgIG1hcEFydE1hcCA9IHsgZmlsZXM6IHt9LCBieU5hbWU6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2cgPSBKU09OLnBhcnNlKGF3YWl0IHN0YWdlQm9zc0RhdGEpIGFzIFN0YWdlQm9zc0NhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIHN0YWdlIGJvc3MgY2F0YWxvZzogJHtlfWApO1xuICAgICAgICBzdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGJvc3NBcnRDYXRhbG9nID0gSlNPTi5wYXJzZShhd2FpdCBib3NzQXJ0RGF0YSkgYXMgQm9zc0FydENhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIGJvc3MgYXJ0IGNhdGFsb2c6ICR7ZX1gKTtcbiAgICAgICAgYm9zc0FydENhdGFsb2cgPSB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgbm9idXlKc29uID0gSlNPTi5wYXJzZShhd2FpdCBzaG9wTm9idXlEYXRhKSBhcyB7XG4gICAgICAgICAgICBwcm9kdWN0SW5kZXhlcz86IHVua25vd247XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBBcnJheS5pc0FycmF5KG5vYnV5SnNvbi5wcm9kdWN0SW5kZXhlcylcbiAgICAgICAgICAgID8gbm9idXlKc29uLnByb2R1Y3RJbmRleGVzLmZpbHRlcigobik6IG4gaXMgbnVtYmVyID0+IHR5cGVvZiBuID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMgPSBuZXcgU2V0KGluZGV4ZXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBzaG9wIE5vYnV5IGluZGV4OiAke2V9YCk7XG4gICAgICAgIHNob3BOb2J1eVByb2R1Y3RJbmRleGVzID0gbmV3IFNldCgpO1xuICAgIH1cbiAgICBhd2FpdCBQcm9taXNlLmFsbChzaG9wRGF0YXMubWFwKHAgPT4gcC50aGVuKGRhdGEgPT4gcGFyc2VBcGlTaG9wRGF0YShkYXRhKSkpKTtcblxuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSBnYWNoYXMuc2l6ZSArIDQ7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhX2l0ZW1zOiBbUHJvbWlzZTxzdHJpbmc+LCBHYWNoYSwgc3RyaW5nXVtdID0gW107XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhX3VybCA9IGAke2dhY2hhU291cmNlfS9JbmkzX0xvdF8ke2Ake2dhY2hhLmdhY2hhX2luZGV4fWAucGFkU3RhcnQoMiwgXCIwXCIpfS54bWxgO1xuICAgICAgICBnYWNoYV9pdGVtcy5wdXNoKFtkb3dubG9hZChnYWNoYV91cmwpLCBnYWNoYSwgZ2FjaGFfdXJsXSk7XG4gICAgfVxuICAgIHBhcnNlR3VhcmRpYW5EYXRhKGF3YWl0IGd1YXJkaWFuRGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbHlQcm9kdWN0U3RhZ2VEcm9wcyhKU09OLnBhcnNlKGF3YWl0IHByb2R1Y3RTdGFnZURyb3BzRGF0YSkgYXMgUHJvZHVjdFN0YWdlRHJvcHNDYXRhbG9nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgcHJvZHVjdCBzdGFnZSBkcm9wczogJHtlfWApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtpdGVtLCBnYWNoYSwgZ2FjaGFfdXJsXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VHYWNoYURhdGEoYXdhaXQgaXRlbSwgZ2FjaGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBkb3dubG9hZGluZyAke2dhY2hhX3VybH0gYmVjYXVzZSAke2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKiBCYW4vY2lyY2xlLXNsYXNoIGljb24gZm9yIGV4Y2x1ZGUg4oCUIG91dGxpbmUgU1ZHLCByZWNvbG9yZWQgdmlhIGN1cnJlbnRDb2xvci4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV4Y2x1ZGVJY29uKCk6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiaXRlbV9yZW1vdmFsX19pY29uXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIFwiMCAwIDI0IDI0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjE2XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxNlwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJmb2N1c2FibGVcIiwgXCJmYWxzZVwiKTtcblxuICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJjaXJjbGVcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN4XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN5XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInJcIiwgXCI5XCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyXCIpO1xuXG4gICAgY29uc3Qgc2xhc2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwibGluZVwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ4MVwiLCBcIjdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTFcIiwgXCI3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcIngyXCIsIFwiMTdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTJcIiwgXCIxN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMlwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWNhcFwiLCBcInJvdW5kXCIpO1xuXG4gICAgc3ZnLmFwcGVuZChjaXJjbGUsIHNsYXNoKTtcbiAgICByZXR1cm4gc3ZnO1xufVxuXG5mdW5jdGlvbiBkZWxldGFibGVJdGVtKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGV4Y2x1ZGVMYWJlbCA9IGBFeGNsdWRlICR7aXRlbS5uYW1lX2VufSBmcm9tIHJlc3VsdHNgO1xuICAgIGNvbnN0IGV4Y2x1ZGVCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsXCIsXG4gICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpdGVtLmlkfWAsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogZXhjbHVkZUxhYmVsLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIHRpdGxlOiBleGNsdWRlTGFiZWwsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgZXhjbHVkZUJ1dHRvbi5hcHBlbmQoY3JlYXRlRXhjbHVkZUljb24oKSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1pZGVudGl0eVwiIH0sXG4gICAgICAgIGV4Y2x1ZGVCdXR0b24sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlfX21ldGFcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW0sIGNoYXJhY3RlciksXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbSksXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCkge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZGlhbG9nLW9wZW5cIik7XG59XG5cbmZ1bmN0aW9uIHVubG9ja0JhY2tncm91bmRTY3JvbGwoKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkaWFsb2ctb3BlblwiKTtcbn1cblxuZnVuY3Rpb24gc2hvd0RpYWxvZyhcbiAgICB0cmlnZ2VyOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgdG9wRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BfZGl2XCIpO1xuICAgIGlmICghKHRvcERpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXMgPSBkaWFsb2c7XG4gICAgICAgIHByZXZpb3VzLmNsb3NlKCk7XG4gICAgICAgIHByZXZpb3VzLnJlbW92ZSgpO1xuICAgIH1cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogZGlhbG9nQ2xhc3MgPyBgJHtkaWFsb2dDbGFzc31fX2Nsb3NlYCA6IFwiZGlhbG9nX19jbG9zZVwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJDbG9zZVwiLFxuICAgIF0pO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7XG4gICAgICAgIC4uLihkaWFsb2dDbGFzcyA/IHsgY2xhc3M6IGRpYWxvZ0NsYXNzIH0gOiB7fSksXG4gICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICB9O1xuICAgIGRpYWxvZyA9IEFycmF5LmlzQXJyYXkoY29udGVudClcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCBhdHRyaWJ1dGVzLCAuLi5jb250ZW50LCBjbG9zZUJ1dHRvbl0pXG4gICAgICAgIDogY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgY29udGVudCwgY2xvc2VCdXR0b25dKTtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJ0cnVlXCIpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBkaWFsb2c/LmNsb3NlKCkpO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgZGlhbG9nPy5yZW1vdmUoKTtcbiAgICAgICAgZGlhbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICB1bmxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgdG9wRGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcInBvcHVwX2xpbmtcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBcImFyaWEtaGFzcG9wdXBcIjogXCJkaWFsb2dcIixcbiAgICAgICAgICAgIFwiYXJpYS1leHBhbmRlZFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHRleHQsXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coYnV0dG9uLCBgJHt0ZXh0fSBkZXRhaWxzYCwgY29udGVudCwgZGlhbG9nQ2xhc3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoXG4gICAgc3RhdDogc3RyaW5nLFxuICAgIHByaW1hcnk6IGJvb2xlYW4sXG4pOiBIVE1MVGFibGVDZWxsRWxlbWVudCB7XG4gICAgY29uc3QgeyBzaG9ydCwgZnVsbCwgYWJicmV2aWF0ZWQgfSA9IHByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkoc3RhdCk7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHtcbiAgICAgICAgY2xhc3M6IFwibnVtZXJpY1wiLFxuICAgICAgICBzY29wZTogXCJjb2xcIixcbiAgICAgICAgLi4uKHByaW1hcnkgPyB7IFwiYXJpYS1zb3J0XCI6IFwiZGVzY2VuZGluZ1wiIH0gOiB7fSksXG4gICAgfTtcbiAgICBpZiAoIWFiYnJldmlhdGVkKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcInRoXCIsIGF0dHJpYnV0ZXMsIHNob3J0XSk7XG4gICAgfVxuICAgIGNvbnN0IHBvcHVwID0gY3JlYXRlUG9wdXBMaW5rKHNob3J0LCBjcmVhdGVIVE1MKFtcInBcIiwgZnVsbF0pKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBmdWxsKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGZ1bGwpO1xuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoXCJwcmlvcml0eS1zdGF0LWhlYWRlclwiKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0aFwiLCBhdHRyaWJ1dGVzLCBwb3B1cF0pO1xufVxuXG5mdW5jdGlvbiBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICBpZiAocXVhbnRpdHlfbWluID09PSAxICYmIHF1YW50aXR5X21heCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gcXVhbnRpdHlfbWF4KSB7XG4gICAgICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9tYXh9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAgeCAke3F1YW50aXR5X21pbn0tJHtxdWFudGl0eV9tYXh9YDtcbn1cblxuLyoqXG4gKiBHYWNoYSBkcm9wLWRldGFpbHMgdGFibGU6IEl0ZW0gfCBDaGFuY2UgfCBFeHBlY3RlZCBwdWxscy5cbiAqIENoYXJhY3RlciBpcyBuZXZlciBhIGNvbHVtbiDigJQgZXF1aXBtZW50IHBvb2xzIG1pcnJvciBhY3Jvc3MgY2hhcmFjdGVycywgc28gbGlzdGluZ1xuICogTmlraS9MdW5MdW4v4oCmIGR1cGxpY2F0ZXMgdGhlIHNhbWUgcm93cy4gV2hlbiBubyBjaGFyYWN0ZXIgZmlsdGVyIGlzIHNldCwgc2FtZS1uYW1lXG4gKiByb3dzICh3aXRoIHRoZSBzYW1lIHF1YW50aXR5IHJhbmdlKSBjb2xsYXBzZSB0byBvbmUgZW50cnkgdXNpbmcgdGhlIGZpcnN0IHBvb2wgcmF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdhY2hhRGV0YWlsc1RhYmxlKFxuICAgIGdhY2hhOiBHYWNoYSxcbiAgICBoaWdobGlnaHRlZEl0ZW0/OiBJdGVtLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcixcbik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYW5jZVwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiRXhwZWN0ZWQgcHVsbHNcIl0sXG4gICAgICAgIF0sXG4gICAgXSk7XG5cbiAgICB0eXBlIFJvdyA9IHtcbiAgICAgICAgaXRlbTogSXRlbTtcbiAgICAgICAgcHJvYmFiaWxpdHk6IG51bWJlcjtcbiAgICAgICAgcXVhbnRpdHlfbWluOiBudW1iZXI7XG4gICAgICAgIHF1YW50aXR5X21heDogbnVtYmVyO1xuICAgIH07XG5cbiAgICAvLyBDaGFyYWN0ZXIgZmlsdGVyOiBhY2N1bXVsYXRlIGJ5IEl0ZW0gaWRlbnRpdHkgKGhpc3RvcmljYWwgbWF0aCkuXG4gICAgLy8gVW5maWx0ZXJlZDogY29sbGFwc2UgYnkgZGlzcGxheSBuYW1lICsgcXVhbnRpdHkgc28gcGVyLWNoYXJhY3RlciBjbG9uZXMgYXJlIG9uZSByb3cuXG4gICAgY29uc3QgYnlJdGVtID0gY2hhcmFjdGVyID8gbmV3IE1hcDxJdGVtLCBSb3c+KCkgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgYnlOYW1lID0gY2hhcmFjdGVyID8gdW5kZWZpbmVkIDogbmV3IE1hcDxzdHJpbmcsIFJvdz4oKTtcblxuICAgIGZvciAoY29uc3QgY2hhciBvZiBjaGFyYWN0ZXIgPT09IHVuZGVmaW5lZCA/IGNoYXJhY3RlcnMgOiBbY2hhcmFjdGVyXSkge1xuICAgICAgICBjb25zdCBjaGFyX2l0ZW1zID0gZ2FjaGEuc2hvcF9pdGVtcy5nZXQoY2hhcik7XG4gICAgICAgIGlmICghY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbY2hhcl9nYWNoYV9pdGVtLCBbdGlja2V0cywgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdXSBvZiBjaGFyX2l0ZW1zKSB7XG4gICAgICAgICAgICAvLyBDaGFyYWN0ZXItZmlsdGVyZWQ6IGtlZXAgaGlzdG9yaWNhbCBkZW5vbWluYXRvciAoaXRlbSBjaGFyYWN0ZXIsIGVsc2UgZmlsdGVyLCBlbHNlIHRvdGFsKS5cbiAgICAgICAgICAgIC8vIFVuZmlsdGVyZWQgY29sbGFwc2U6IHJhdGVzIGFyZSB3aXRoaW4gZWFjaCBjaGFyYWN0ZXIncyBwb29sIChwb29scyBtaXJyb3I7IGZpcnN0IHJvdyB3aW5zKS5cbiAgICAgICAgICAgIC8vIFVzaW5nIHRvdGFsX3Byb2JhYmlsaXR5IGZvciBzaGFyZWQgaXRlbXMgd291bGQgZGlsdXRlIH43w5cgYW5kIHJlaW50cm9kdWNlIHdyb25nIHJhdGVzLlxuICAgICAgICAgICAgY29uc3QgaXRlbV90aWNrZXRzID0gY2hhcmFjdGVyID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcikhXG4gICAgICAgICAgICAgICAgOiAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtX2NoYXJhY3RlciA9IGNoYXJfZ2FjaGFfaXRlbS5jaGFyYWN0ZXIgfHwgY2hhcmFjdGVyO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbV9jaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZ2FjaGEuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChpdGVtX2NoYXJhY3RlcikhXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGdhY2hhLnRvdGFsX3Byb2JhYmlsaXR5O1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IHRpY2tldHMgLyBpdGVtX3RpY2tldHM7XG5cbiAgICAgICAgICAgIGlmIChieUl0ZW0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IGJ5SXRlbS5nZXQoY2hhcl9nYWNoYV9pdGVtKTtcbiAgICAgICAgICAgICAgICBieUl0ZW0uc2V0KGNoYXJfZ2FjaGFfaXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGFyX2dhY2hhX2l0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5OiAocHJldmlvdXM/LnByb2JhYmlsaXR5ID8/IDApICsgcHJvYmFiaWxpdHksXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21pbixcbiAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHlfbWF4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtjaGFyX2dhY2hhX2l0ZW0ubmFtZV9lbn1cXDAke3F1YW50aXR5X21pbn1cXDAke3F1YW50aXR5X21heH1gO1xuICAgICAgICAgICAgaWYgKCFieU5hbWUhLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgYnlOYW1lIS5zZXQoa2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGNoYXJfZ2FjaGFfaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgcHJvYmFiaWxpdHksXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21pbixcbiAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHlfbWF4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgcm93cyA9IGJ5SXRlbSA/IFsuLi5ieUl0ZW0udmFsdWVzKCldIDogWy4uLmJ5TmFtZSEudmFsdWVzKCldO1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZEl0ZW0gIT09IHVuZGVmaW5lZCAmJiAoXG4gICAgICAgICAgICBoaWdobGlnaHRlZEl0ZW0gPT09IHJvdy5pdGVtXG4gICAgICAgICAgICB8fCAoXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAmJiBoaWdobGlnaHRlZEl0ZW0ubmFtZV9lbiA9PT0gcm93Lml0ZW0ubmFtZV9lblxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgPyB7IGNsYXNzOiBcImhpZ2hsaWdodGVkXCIgfSA6IFwiXCIsXG4gICAgICAgICAgICBbXCJ0ZFwiLCByb3cuaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhyb3cucXVhbnRpdHlfbWluLCByb3cucXVhbnRpdHlfbWF4KV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBgJHtwcmV0dHlOdW1iZXIocm93LnByb2JhYmlsaXR5ICogMTAwLCAyKX0lYF0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBgJHtwcmV0dHlOdW1iZXIoMSAvIHJvdy5wcm9iYWJpbGl0eSwgMil9YF0sXG4gICAgICAgIF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGVudDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTb3VyY2VQb3B1cChpdGVtOiBJdGVtIHwgdW5kZWZpbmVkLCBpdGVtU291cmNlOiBJdGVtU291cmNlLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQoaXRlbVNvdXJjZS5zaG9wX2lkKTtcbiAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJvYmFiaWxpdHlUYWJsZSA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1wcm9iYWJpbGl0eS1kaWFsb2dfX3Njcm9sbFwiLFxuICAgICAgICAgICAgcm9sZTogXCJyZWdpb25cIixcbiAgICAgICAgICAgIHRhYmluZGV4OiBcIjBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtpdGVtU291cmNlLml0ZW0ubmFtZV9lbn0gcHJvYmFiaWxpdGllc2AsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUdhY2hhRGV0YWlsc1RhYmxlKGdhY2hhLCBpdGVtLCBjaGFyYWN0ZXIpLFxuICAgIF0pO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLFxuICAgICAgICBwcm9iYWJpbGl0eVRhYmxlLFxuICAgICAgICBcImdhY2hhLXByb2JhYmlsaXR5LWRpYWxvZ1wiLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNldFNvdXJjZVBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IFNob3BJdGVtU291cmNlKSB7XG4gICAgY29uc3QgY29udGVudFRhYmxlID0gY3JlYXRlSFRNTChbXCJ0YWJsZVwiLCBbXCJ0clwiLCBbXCJ0aFwiLCBcIkNvbnRlbnRzXCJdXV0pO1xuICAgIGZvciAoY29uc3QgaW5uZXJfaXRlbSBvZiBpdGVtU291cmNlLml0ZW1zKSB7XG4gICAgICAgIGNvbnRlbnRUYWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcInRyXCIsIGlubmVyX2l0ZW0gPT09IGl0ZW0gPyB7IGNsYXNzOiBcImhpZ2hsaWdodGVkXCIgfSA6IFwiXCIsIFtcInRkXCIsIGlubmVyX2l0ZW0ubmFtZV9lbl1dKSk7XG4gICAgfVxuICAgIC8vIERpYWxvZyBhcmlhLWxhYmVsIGFscmVhZHkgY2FycmllcyB0aGUgc2V0IG5hbWUg4oCUIG9ubHkgc2hvdyB0aGUgY29udGVudHMgdGFibGUuXG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgY29udGVudFRhYmxlKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUJvc3NBcnRGaWxlKGJvc3NJZDogbnVtYmVyLCByZXNJZD86IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYnlJZCA9IGJvc3NBcnRDYXRhbG9nLmJ5Qm9zc0lkPy5bYCR7Ym9zc0lkfWBdO1xuICAgIGlmIChieUlkKSB7XG4gICAgICAgIHJldHVybiBieUlkO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlc0lkID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJldHVybiBib3NzQXJ0Q2F0YWxvZy5ieVJlc0lkPy5bYCR7cmVzSWR9YF07XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJvc3NQb3J0cmFpdChwcm9qZWN0aW9uOiBTdGFnZUJvc3NQcm9qZWN0aW9uKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHByaW1hcnkgPSBwcm9qZWN0aW9uLmJvc3Nlc1swXTtcbiAgICBjb25zdCBib3NzTmFtZSA9IHByaW1hcnk/Lm5hbWUgPz8gKHByb2plY3Rpb24uaXNCb3NzU3RhZ2UgPyBcIkJvc3NcIiA6IFwiR3VhcmRpYW5cIik7XG4gICAgY29uc3QgZmlsZSA9IHByaW1hcnlcbiAgICAgICAgPyByZXNvbHZlQm9zc0FydEZpbGUocHJpbWFyeS5pZCwgcHJpbWFyeS5yZXNJZClcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGZpbGUpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcG9ydHJhaXRcIiwgXCJkYXRhLWhhcy1ib3NzLWFydFwiOiBcInRydWVcIiB9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiaW1nXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19wb3J0cmFpdC1pbWFnZVwiLFxuICAgICAgICAgICAgICAgICAgICBzcmM6IGBhc3NldHMvYm9zcy1hcnQvJHtlbmNvZGVVUklDb21wb25lbnQoZmlsZSl9YCxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBgQm9zcyBhcnR3b3JrIGZvciAke2Jvc3NOYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBcIjEyOFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTI4XCIsXG4gICAgICAgICAgICAgICAgICAgIGRlY29kaW5nOiBcImFzeW5jXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3BvcnRyYWl0IHN0YWdlLWRldGFpbHNfX3BvcnRyYWl0LS1mYWxsYmFja1wiLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgQm9zcyBhcnR3b3JrIHVuYXZhaWxhYmxlIGZvciAke2Jvc3NOYW1lfWAsXG4gICAgICAgICAgICBcImRhdGEtaGFzLWJvc3MtYXJ0XCI6IFwiZmFsc2VcIixcbiAgICAgICAgfSxcbiAgICAgICAgW1wic3BhblwiLCB7IFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSwgYm9zc05hbWUuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKV0sXG4gICAgXSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZSB0aGUgR2FjaGEgYmVoaW5kIGEgc2hvcCBwcm9kdWN0IEl0ZW0gKHN0YWdlIHJld2FyZHMgYXJlIHNob3BfaXRlbXMgZW50cmllcykuXG4gKiBMb3R0ZXJ5IGl0ZW1zIHVzZWQgdG8gbGVhdmUgaXRlbS5pZCBhdCAwIOKAlCBzdGlsbCBzdXBwb3J0IHJldmVyc2UgbG9va3VwIGZvciB0aG9zZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRHYWNoYUZvclNob3BJdGVtKGl0ZW06IEl0ZW0pOiBHYWNoYSB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGl0ZW0uaWQgIT09IDApIHtcbiAgICAgICAgY29uc3QgYnlJZCA9IGdhY2hhcy5nZXQoaXRlbS5pZCk7XG4gICAgICAgIGlmIChieUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnlJZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtzaG9wSW5kZXgsIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgaWYgKHNob3BfaXRlbXMuZ2V0KHNob3BJbmRleCkgPT09IGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBnYWNoYTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGdhY2hhIG9mIGdhY2hhcy52YWx1ZXMoKSkge1xuICAgICAgICBpZiAoZ2FjaGEubmFtZSA9PT0gaXRlbS5uYW1lX2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2FjaGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXdhcmQgdGlsZSBhcnQ6IGdhY2hhIGNvaW5zIHVzZSB0aGUgc2FtZSBsb3R0ZXJ5IHNwcml0ZSBhcyB0aGUgcmVzdWx0cyB0YWJsZVxuICogKGBjcmVhdGVHYWNoYUNvaW5BcnRgKS4gRXF1aXBtZW50IHVzZXMgSXRlbV9QYXJ0cyBzaGVldCBjZWxscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YWdlUmV3YXJkQXJ0KGl0ZW06IEl0ZW0pIHtcbiAgICBjb25zdCBnYWNoYSA9IGZpbmRHYWNoYUZvclNob3BJdGVtKGl0ZW0pO1xuICAgIGlmIChnYWNoYSkge1xuICAgICAgICAvLyBTYW1lIHBhdGggYXMgY3JlYXRlR2FjaGFTb3VyY2VTdW1tYXJ5IC8gZ2FjaGEgdGFibGUgY29sdW1uLlxuICAgICAgICBjb25zdCBjb2luID0gY3JlYXRlR2FjaGFDb2luQXJ0KGdhY2hhKTtcbiAgICAgICAgLy8gS2VlcCByZXdhcmQtcm93IHNpemluZyBob29rcyB3aXRob3V0IGxvc2luZyB0aGUgY2lyY3VsYXIgY29pbiBsb29rLlxuICAgICAgICBjb25zdCBjbGFzc2VzID0gdHlwZW9mIGNvaW4uY2xhc3NOYW1lID09PSBcInN0cmluZ1wiID8gY29pbi5jbGFzc05hbWUgOiBcIlwiO1xuICAgICAgICBpZiAoIWNsYXNzZXMuc3BsaXQoL1xccysvKS5pbmNsdWRlcyhcInN0YWdlLWRldGFpbHNfX3Jld2FyZC1hcnRcIikpIHtcbiAgICAgICAgICAgIGNvaW4uY2xhc3NOYW1lID0gYCR7Y2xhc3Nlc30gc3RhZ2UtZGV0YWlsc19fcmV3YXJkLWFydCBzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0LS1jb2luYC50cmltKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvaW47XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0KGl0ZW0sIDQwLCBcInN0YWdlLWRldGFpbHNfX3Jld2FyZC1hcnRcIik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0YWdlQm9zc0xpc3QocHJvamVjdGlvbjogU3RhZ2VCb3NzUHJvamVjdGlvbikge1xuICAgIGlmIChwcm9qZWN0aW9uLmJvc3NOYW1lcy5sZW5ndGggPT09IDAgJiYgcHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgYm9zc0l0ZW1zID0gcHJvamVjdGlvbi5ib3NzZXMubWFwKChib3NzKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSByZXNvbHZlQm9zc0FydEZpbGUoYm9zcy5pZCwgYm9zcy5yZXNJZCk7XG4gICAgICAgIGNvbnN0IHRodW1iID0gZmlsZVxuICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy10aHVtYlwiLFxuICAgICAgICAgICAgICAgICAgICBzcmM6IGBhc3NldHMvYm9zcy1hcnQvJHtlbmNvZGVVUklDb21wb25lbnQoZmlsZSl9YCxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCI0MFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiNDBcIixcbiAgICAgICAgICAgICAgICAgICAgZGVjb2Rpbmc6IFwiYXN5bmNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLXRodW1iIHN0YWdlLWRldGFpbHNfX2Jvc3MtdGh1bWItLWZhbGxiYWNrXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSxcbiAgICAgICAgICAgICAgICBib3NzLm5hbWUuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLWl0ZW0gc3RhZ2UtZGV0YWlsc19fYm9zcy1pdGVtLS1wcmltYXJ5XCIgfSxcbiAgICAgICAgICAgIHRodW1iLFxuICAgICAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2Jvc3Mtcm9sZVwiIH0sIFwiQm9zc1wiXSxcbiAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLW5hbWVcIiB9LCBib3NzLm5hbWVdLFxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICAvLyBHdWFyZGlhbnNMZWZ0L1JpZ2h0L01pZGRsZSBhcmUgYSBzcGF3biAqcG9vbCog4oCUIG9uZSBsZWZ0ICsgb25lIHJpZ2h0IGF0IGZpZ2h0IHRpbWUuXG4gICAgY29uc3Qgc2lkZU5vdGUgPSBwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmxlbmd0aCA+IDBcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NpZGUtcG9vbFwiIH0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2wtbGFiZWxcIiB9LFxuICAgICAgICAgICAgICAgIGBTaWRlIGNvbXBhbmlvbnMgKHBvb2wgb2YgJHtwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmxlbmd0aH0pYCxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2wtbmFtZXNcIiB9LFxuICAgICAgICAgICAgICAgIHByb2plY3Rpb24uc2lkZUd1YXJkaWFuTmFtZXMuam9pbihcIiDCtyBcIiksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLWhpbnRcIiB9LFxuICAgICAgICAgICAgICAgIFwiT25lIGxlZnQgYW5kIG9uZSByaWdodCBzcGF3biB3aXRoIHRoZSBib3NzOyB0aGUgcmVzdCBhcmUgcG9zc2libGUgZHJhd3MuXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBzZWN0aW9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJzdGFnZS1kZXRhaWxzLWJvc3Nlc1wiIH0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiaDNcIixcbiAgICAgICAgICAgIHsgaWQ6IFwic3RhZ2UtZGV0YWlscy1ib3NzZXNcIiB9LFxuICAgICAgICAgICAgcHJvamVjdGlvbi5ib3NzTmFtZXMubGVuZ3RoID4gMSA/IFwiQm9zc2VzXCIgOiBcIkJvc3NcIixcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzZXNcIiB9LFxuICAgICAgICAgICAgLi4uYm9zc0l0ZW1zLFxuICAgICAgICBdLFxuICAgIF0pO1xuICAgIGlmIChzaWRlTm90ZSkge1xuICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKHNpZGVOb3RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb247XG59XG5cbi8qKlxuICogU3RhZ2UgZG9zc2llciBmb3IgR3VhcmRpYW4gLyBCb3NzIG1hcCBjaGlwczogYm9zcyBwb3J0cmFpdCwgSkZUU0UgYm9zcyBuYW1lcyxcbiAqIHJlYWRhYmxlIGZhY3RzLCBhbmQgcmV3YXJkIGxpc3Qgd2l0aCB0aGUgc2FtZSBhcnQgYXMgdGhlIHJlc3VsdHMgdGFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZURldGFpbHNDb250ZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGlzQm9zcyA9IGl0ZW1Tb3VyY2UubmVlZF9ib3NzO1xuICAgIGNvbnN0IHRpdGxlID0gc3RhZ2VUaXRsZU5hbWUoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXApO1xuICAgIGNvbnN0IGV5ZWJyb3cgPSBpc0Jvc3MgPyBcIkJvc3Mgc3RhZ2VcIiA6IFwiR3VhcmRpYW4gc3RhZ2VcIjtcbiAgICBjb25zdCBib3NzUHJvamVjdGlvbiA9IHByb2plY3RTdGFnZUJvc3NlcyhcbiAgICAgICAgaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsXG4gICAgICAgIGlzQm9zcyxcbiAgICAgICAgc3RhZ2VCb3NzQ2F0YWxvZyxcbiAgICApO1xuICAgIGNvbnN0IHJld2FyZHMgPSBpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA+IDBcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkc1wiIH0sXG4gICAgICAgICAgICAuLi5pdGVtU291cmNlLml0ZW1zLm1hcCgocmV3YXJkKSA9PiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogcmV3YXJkID09PSBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkIHN0YWdlLWRldGFpbHNfX3Jld2FyZC0tY3VycmVudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVTdGFnZVJld2FyZEFydChyZXdhcmQpLFxuICAgICAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtbmFtZVwiIH0sIHJld2FyZC5uYW1lX2VuXSxcbiAgICAgICAgICAgICAgICAuLi4ocmV3YXJkID09PSBpdGVtXG4gICAgICAgICAgICAgICAgICAgID8gW2NyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZC1iYWRnZVwiIH0sIFwiVGhpcyBpdGVtXCJdKV1cbiAgICAgICAgICAgICAgICAgICAgOiBbXSksXG4gICAgICAgICAgICBdKSksXG4gICAgICAgIF0pXG4gICAgICAgIDogY3JlYXRlSFRNTChbXCJwXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fZW1wdHlcIiB9LCBcIk5vIGxpc3RlZCByZXdhcmRzIGZvciB0aGlzIHN0YWdlLlwiXSk7XG5cbiAgICBjb25zdCBib3NzU2VjdGlvbiA9IGNyZWF0ZVN0YWdlQm9zc0xpc3QoYm9zc1Byb2plY3Rpb24pO1xuXG4gICAgY29uc3QgaWRlbnRpdHkgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19pZGVudGl0eVwiIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19leWVicm93XCIgfSwgZXllYnJvd10sXG4gICAgICAgIFtcImgyXCIsIHRpdGxlXSxcbiAgICBdKTtcblxuICAgIGNvbnN0IGhlYWRlciA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImhlYWRlclwiLFxuICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2hlYWRlclwiIH0sXG4gICAgICAgIGNyZWF0ZUJvc3NQb3J0cmFpdChib3NzUHJvamVjdGlvbiksXG4gICAgICAgIGlkZW50aXR5LFxuICAgIF0pO1xuXG4gICAgY29uc3QgYXJ0aWNsZSA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImFydGljbGVcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGlzQm9zc1xuICAgICAgICAgICAgICAgID8gXCJzdGFnZS1kZXRhaWxzIHN0YWdlLWRldGFpbHMtLWJvc3NcIlxuICAgICAgICAgICAgICAgIDogXCJzdGFnZS1kZXRhaWxzIHN0YWdlLWRldGFpbHMtLWd1YXJkaWFuXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcixcbiAgICBdKTtcbiAgICBpZiAoYm9zc1NlY3Rpb24pIHtcbiAgICAgICAgYXJ0aWNsZS5hcHBlbmRDaGlsZChib3NzU2VjdGlvbik7XG4gICAgfVxuICAgIGFydGljbGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJzdGFnZS1kZXRhaWxzLXJld2FyZHNcIiB9LFxuICAgICAgICBbXCJoM1wiLCB7IGlkOiBcInN0YWdlLWRldGFpbHMtcmV3YXJkc1wiIH0sIFwiUmV3YXJkc1wiXSxcbiAgICAgICAgcmV3YXJkcyxcbiAgICBdKSk7XG4gICAgcmV0dXJuIGFydGljbGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgY29uc3QgbWFwTGFiZWwgPSBzdGFnZUNoYW5uZWxMYWJlbChpdGVtU291cmNlLmd1YXJkaWFuX21hcCwgaXRlbVNvdXJjZS5uZWVkX2Jvc3MpO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIG1hcExhYmVsLFxuICAgICAgICBjcmVhdGVTdGFnZURldGFpbHNDb250ZW50KGl0ZW0sIGl0ZW1Tb3VyY2UpLFxuICAgICAgICBcInN0YWdlLWRldGFpbHMtZGlhbG9nXCIsXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShcbiAgICBpdGVtOiBJdGVtLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgcmV0dXJuIFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgIC5maWx0ZXIoc291cmNlRmlsdGVyKVxuICAgICAgICAubWFwKGl0ZW1Tb3VyY2UgPT4gc291cmNlSXRlbUVsZW1lbnQoaXRlbSwgaXRlbVNvdXJjZSwgY2hhcmFjdGVyKSk7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRDbGFzc1Rva2VucyhlbGVtZW50OiBIVE1MRWxlbWVudCk6IHN0cmluZ1tdIHtcbiAgICAvLyBQcmVmZXIgY2xhc3NOYW1lIG92ZXIgY2xhc3NMaXN0IOKAlCB0aGUgdW5pdCBET00gaGFybmVzcyBzZXRzIGNsYXNzTmFtZSB2aWFcbiAgICAvLyBzZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSBhbmQgZG9lcyBub3QgaW1wbGVtZW50IGEgZnVsbCBjbGFzc0xpc3QuXG4gICAgY29uc3QgcmF3ID0gdHlwZW9mIGVsZW1lbnQuY2xhc3NOYW1lID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gZWxlbWVudC5jbGFzc05hbWVcbiAgICAgICAgOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCI7XG4gICAgcmV0dXJuIHJhdy5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKTtcbn1cblxuZnVuY3Rpb24gaXNHYWNoYVNvdXJjZUdyb3VwKGVsZW1lbnRzOiByZWFkb25seSAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudHMuc29tZShcbiAgICAgICAgKGVsZW1lbnQpID0+XG4gICAgICAgICAgICB0eXBlb2YgZWxlbWVudCAhPT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgJiYgZWxlbWVudENsYXNzVG9rZW5zKGVsZW1lbnQpLmluY2x1ZGVzKFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIiksXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gbWFrZVNvdXJjZXNMaXN0KGxpc3Q6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXVtdKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBjb25zdCByZXN1bHQ6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSA9IFtdO1xuICAgIGZ1bmN0aW9uIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdICsgZWxlbWVudDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgbGV0IHByZXZpb3VzR3JvdXA6IHJlYWRvbmx5IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB8IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnRzIG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWRkKFwiIFwiKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbW1hIGJldHdlZW4gc2hvcC9zZXQvZ3VhcmRpYW4gcGF0aHMgc28gZHVhbCBwcmljZXMgc3RheSBsZWdpYmxlXG4gICAgICAgIC8vIChcIjUwMDAwIEdvbGQsIFN1cHBvcnRlciBTZXQgMzUwMDAwIEdvbGRcIikuIE5ldmVyIG5leHQgdG8gZ2FjaGEgY29pbiBjYXJkcyDigJRcbiAgICAgICAgLy8gdGhvc2UgYXJlIGJsb2NrIHN1bW1hcmllcyBhbmQgYSB0ZXh0IGNvbW1hIGJlY29tZXMgYSB2aXN1YWwgYnJlYWsuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHByZXZpb3VzR3JvdXAgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgJiYgIWlzR2FjaGFTb3VyY2VHcm91cChwcmV2aW91c0dyb3VwKVxuICAgICAgICAgICAgJiYgIWlzR2FjaGFTb3VyY2VHcm91cChlbGVtZW50cylcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBhZGQoXCIsIFwiKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91c0dyb3VwID0gZWxlbWVudHM7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW1Tb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSk6IGJvb2xlYW4ge1xuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgfHwgaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgICAgIGlmIChnYWNoYT8uZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UgIT09IGl0ZW1Tb3VyY2UgJiYgaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbUN1cnJlbnRseUF2YWlsYWJsZShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChpc0F2YWlsYWJsZUl0ZW1Tb3VyY2Uoc291cmNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbTogSXRlbSkge1xuICAgIGlmIChpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tYXZhaWxhYmlsaXR5IGl0ZW0tYXZhaWxhYmlsaXR5LS11bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm8gZW5hYmxlZCBzaG9wLCBnYWNoYSwgb3IgR3VhcmRpYW4gcGF0aCBpbiB0aGUgbGl2ZSBzaG9wIGRhdGFcIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJOb3QgaW4gZ2FtZVwiLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0R2FjaGFTb3VyY2VJbnB1dHMoY29pbjogSXRlbSB8IHVuZGVmaW5lZCk6IEdhY2hhU291cmNlSW5wdXRbXSB7XG4gICAgaWYgKCFjb2luKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRzOiBHYWNoYVNvdXJjZUlucHV0W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBjb2luLnNvdXJjZXMpIHtcbiAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICBpbnB1dHMucHVzaCh7IGtpbmQ6IFwic2hvcFwiLCBhcDogc291cmNlLmFwIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwic3RhZ2VcIixcbiAgICAgICAgICAgICAgICBtYXA6IHNvdXJjZS5ndWFyZGlhbl9tYXAsXG4gICAgICAgICAgICAgICAgbmVlZEJvc3M6IHNvdXJjZS5uZWVkX2Jvc3MsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5wdXRzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNob3BDaGFubmVsTGFiZWwoXG4gICAgY3VycmVuY3k6IFwiR29sZFwiIHwgXCJBUFwiLFxuICAgIGF2YWlsYWJsZTogYm9vbGVhbixcbiAgICByZWFzb24/OiBcIm5vdF9mb3Jfc2FsZVwiIHwgXCJub3RfYXZhaWxhYmxlXCIsXG4pOiBIVE1MRWxlbWVudCB7XG4gICAgaWYgKGF2YWlsYWJsZSkge1xuICAgICAgICBpZiAoY3VycmVuY3kgPT09IFwiQVBcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtY3VycmVuY3kgZ2FjaGEtY3VycmVuY3ktLWFwXCIgfSxcbiAgICAgICAgICAgICAgICBcIkFQXCIsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtY3VycmVuY3kgZ2FjaGEtY3VycmVuY3ktLWdvbGRcIiB9LFxuICAgICAgICAgICAgXCJHb2xkXCIsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICBpZiAocmVhc29uID09PSBcIm5vdF9mb3Jfc2FsZVwiKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLXNob3Atc3RhdHVzIGdhY2hhLXNob3Atc3RhdHVzLS1ub3QtZm9yLXNhbGVcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYCR7Y3VycmVuY3l9IHByb2R1Y3QgaXMgbGlzdGVkIGluIHRoZSBzaG9wIGNhdGFsb2cgYnV0IGNhbm5vdCBiZSBwdXJjaGFzZWQgKE5vYnV5KWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJOb3QgZm9yIHNhbGVcIixcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLXNob3Atc3RhdHVzIGdhY2hhLXNob3Atc3RhdHVzLS1ub3QtYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICB0aXRsZTogYCR7Y3VycmVuY3l9IGNvaW4gaXMgbm90IGN1cnJlbnRseSBzb2xkIGluIHRoZSBsaXZlIHNob3BgLFxuICAgICAgICB9LFxuICAgICAgICBgJHtjdXJyZW5jeX0gwrcgTm90IGF2YWlsYWJsZWAsXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU3RhZ2VDaGFubmVsTGFiZWwoXG4gICAgY29pbjogSXRlbSB8IHVuZGVmaW5lZCxcbiAgICBtYXA6IHN0cmluZyxcbiAgICBuZWVkQm9zczogYm9vbGVhbixcbiAgICBsYWJlbDogc3RyaW5nLFxuKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gY29pbj8uc291cmNlcy5maW5kKFxuICAgICAgICAoc291cmNlKTogc291cmNlIGlzIEd1YXJkaWFuSXRlbVNvdXJjZSA9PlxuICAgICAgICAgICAgc291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlICYmIHNvdXJjZS5ndWFyZGlhbl9tYXAgPT09IG1hcCxcbiAgICApO1xuICAgIGNvbnN0IGNoYW5uZWxDbGFzcyA9IG5lZWRCb3NzXG4gICAgICAgID8gXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tYm9zc1wiXG4gICAgICAgIDogXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tZ3VhcmRpYW5cIjtcbiAgICBpZiAoZ3VhcmRpYW5Tb3VyY2UgJiYgY29pbikge1xuICAgICAgICBjb25zdCBwb3B1cCA9IGNyZWF0ZUd1YXJkaWFuUG9wdXAoY29pbiwgZ3VhcmRpYW5Tb3VyY2UpO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IHBvcHVwLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwicG9wdXBfbGlua1wiO1xuICAgICAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBgJHtleGlzdGluZ30gJHtjaGFubmVsQ2xhc3N9YCk7XG4gICAgICAgIHBvcHVwLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgbGFiZWwpO1xuICAgICAgICByZXR1cm4gcG9wdXA7XG4gICAgfVxuICAgIGlmIChuZWVkQm9zcykge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tYm9zc1wiLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBgQm9zcyBzdGFnZSBkcm9wOiAke3ByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXApfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tZ3VhcmRpYW5cIixcbiAgICAgICAgICAgIHRpdGxlOiBgR3VhcmRpYW4gc3RhZ2UgZHJvcDogJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKX1gLFxuICAgICAgICB9LFxuICAgICAgICBsYWJlbCxcbiAgICBdKTtcbn1cblxuLyoqIEtlcHQgZm9yIGNvbnRyYWN0cyB0aGF0IHBpbiB0aGUgaGVscGVyIG5hbWU7IHJldHVybnMgc2hvcCArIHN0YWdlIGNoYW5uZWwgY2hpcHMuICovXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUN1cnJlbmN5TGFiZWwoZ2FjaGE6IEdhY2hhKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGNoYW5uZWxzID0gY3JlYXRlR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxFbGVtZW50cyhnYWNoYSk7XG4gICAgaWYgKGNoYW5uZWxzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gY2hhbm5lbHNbMF0hO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWFjcXVpc2l0aW9uLWNoYW5uZWxzXCIgfSxcbiAgICAgICAgLi4uY2hhbm5lbHMsXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGE6IEdhY2hhKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgY29pbiA9IHNob3BfaXRlbXMuZ2V0KGdhY2hhLnNob3BfaW5kZXgpO1xuICAgIGNvbnN0IHByb2plY3RlZCA9IHByb2plY3RHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIGFwOiBnYWNoYS5hcCxcbiAgICAgICAgICAgIGVuYWJsZWQ6IGdhY2hhLmVuYWJsZWQsXG4gICAgICAgICAgICBwdXJjaGFzYWJsZTogZ2FjaGEucHVyY2hhc2FibGUsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbGxlY3RHYWNoYVNvdXJjZUlucHV0cyhjb2luKSxcbiAgICApO1xuICAgIHJldHVybiBwcm9qZWN0ZWQubWFwKChjaGFubmVsKSA9PiB7XG4gICAgICAgIGlmIChjaGFubmVsLmtpbmQgPT09IFwic2hvcFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlR2FjaGFTaG9wQ2hhbm5lbExhYmVsKFxuICAgICAgICAgICAgICAgIGNoYW5uZWwuY3VycmVuY3ksXG4gICAgICAgICAgICAgICAgY2hhbm5lbC5hdmFpbGFibGUsXG4gICAgICAgICAgICAgICAgY2hhbm5lbC5yZWFzb24sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVHYWNoYVN0YWdlQ2hhbm5lbExhYmVsKFxuICAgICAgICAgICAgY29pbixcbiAgICAgICAgICAgIGNoYW5uZWwubWFwLFxuICAgICAgICAgICAgY2hhbm5lbC5uZWVkQm9zcyxcbiAgICAgICAgICAgIGNoYW5uZWwubGFiZWwsXG4gICAgICAgICk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeShcbiAgICBpdGVtOiBJdGVtIHwgdW5kZWZpbmVkLFxuICAgIGl0ZW1Tb3VyY2U6IEdhY2hhSXRlbVNvdXJjZSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pIHtcbiAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQoaXRlbVNvdXJjZS5zaG9wX2lkKTtcbiAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgY2hhbm5lbEVsZW1lbnRzID0gY3JlYXRlR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxFbGVtZW50cyhnYWNoYSk7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zb3VyY2Utc3VtbWFyeVwiLFxuICAgICAgICAgICAgcm9sZTogXCJncm91cFwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGAke2dhY2hhLm5hbWV9IGFjcXVpc2l0aW9uYCxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlR2FjaGFDb2luQXJ0KGdhY2hhKSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlfX2NvbnRlbnRcIiB9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1pZGVudGl0eVwiIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlR2FjaGFTb3VyY2VQb3B1cChcbiAgICAgICAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuID8gdW5kZWZpbmVkIDogY2hhcmFjdGVyLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1hY3F1aXNpdGlvbi1jaGFubmVsc1wiLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiBcImxpc3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGAke2dhY2hhLm5hbWV9IHNvdXJjZXNgLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4uY2hhbm5lbEVsZW1lbnRzLm1hcCgoZWxlbWVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSFRNTChbXCJzcGFuXCIsIHsgY2xhc3M6IFwiZ2FjaGEtYWNxdWlzaXRpb24tY2hhbm5lbHNfX2l0ZW1cIiwgcm9sZTogXCJsaXN0aXRlbVwiIH0sIGVsZW1lbnRdKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gc291cmNlSXRlbUVsZW1lbnQoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUdhY2hhU291cmNlU3VtbWFyeShpdGVtLCBpdGVtU291cmNlLCBjaGFyYWN0ZXIpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgIGlmIChpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIFtgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSksXG4gICAgICAgICAgICBgICR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YFxuICAgICAgICBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgIHJldHVybiBbY3JlYXRlR3VhcmRpYW5Qb3B1cChpdGVtLCBpdGVtU291cmNlKV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBJdGVtRGV0YWlsU3RhdCA9IHtcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGJhc2U6IG51bWJlcjtcbiAgICBlbmNoYW50ZWQ/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaXRlbURldGFpbFN0YXRzKGl0ZW06IEl0ZW0pOiBJdGVtRGV0YWlsU3RhdFtdIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJTdGF0cyA9IFtcbiAgICAgICAgeyBsYWJlbDogXCJTdHJlbmd0aFwiLCBiYXNlOiBpdGVtLnN0ciwgZW5jaGFudGVkOiBpdGVtLm1heF9zdHIgfSxcbiAgICAgICAgeyBsYWJlbDogXCJEZXh0ZXJpdHlcIiwgYmFzZTogaXRlbS5kZXgsIGVuY2hhbnRlZDogaXRlbS5tYXhfZGV4IH0sXG4gICAgICAgIHsgbGFiZWw6IFwiU3RhbWluYVwiLCBiYXNlOiBpdGVtLnN0YSwgZW5jaGFudGVkOiBpdGVtLm1heF9zdGEgfSxcbiAgICAgICAgeyBsYWJlbDogXCJXaWxsXCIsIGJhc2U6IGl0ZW0ud2lsLCBlbmNoYW50ZWQ6IGl0ZW0ubWF4X3dpbCB9LFxuICAgIF07XG4gICAgY29uc3QgZml4ZWRTdGF0cyA9IFtcbiAgICAgICAgeyBsYWJlbDogXCJNb3ZlbWVudFwiLCBiYXNlOiBpdGVtLm1vdmVtZW50IH0sXG4gICAgICAgIHsgbGFiZWw6IFwiQ2hhcmdlXCIsIGJhc2U6IGl0ZW0uY2hhcmdlIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiTG9iXCIsIGJhc2U6IGl0ZW0ubG9iIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiU21hc2hcIiwgYmFzZTogaXRlbS5zbWFzaCB9LFxuICAgICAgICB7IGxhYmVsOiBcIlNlcnZlXCIsIGJhc2U6IGl0ZW0uc2VydmUgfSxcbiAgICAgICAgeyBsYWJlbDogXCJIUFwiLCBiYXNlOiBpdGVtLmhwIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiUXVpY2tzbG90c1wiLCBiYXNlOiBpdGVtLnF1aWNrc2xvdHMgfSxcbiAgICAgICAgeyBsYWJlbDogXCJCdWZmc2xvdHNcIiwgYmFzZTogaXRlbS5idWZmc2xvdHMgfSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgLi4uY2hhcmFjdGVyU3RhdHNcbiAgICAgICAgICAgIC5maWx0ZXIoc3RhdCA9PiBzdGF0LmJhc2UgIT09IDAgfHwgKGl0ZW0uZWxlbWVudF9lbmNoYW50YWJsZSAmJiBzdGF0LmVuY2hhbnRlZCAhPT0gMCkpXG4gICAgICAgICAgICAubWFwKCh7IGxhYmVsLCBiYXNlLCBlbmNoYW50ZWQgfSkgPT5cbiAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgPyB7IGxhYmVsLCBiYXNlLCBlbmNoYW50ZWQgfSA6IHsgbGFiZWwsIGJhc2UgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgLi4uZml4ZWRTdGF0cy5maWx0ZXIoc3RhdCA9PiBzdGF0LmJhc2UgIT09IDApLFxuICAgIF07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBzdGF0cyA9IGl0ZW1EZXRhaWxTdGF0cyhpdGVtKTtcbiAgICBjb25zdCBzb3VyY2VzID0gbWFrZVNvdXJjZXNMaXN0KFxuICAgICAgICBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW0sICgpID0+IHRydWUsIGNoYXJhY3RlciksXG4gICAgKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzXCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJoZWFkZXJcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19oZWFkZXJcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbUFydChpdGVtLCA3MiwgXCJpdGVtLWRldGFpbHNfX2FydFwiKSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2V5ZWJyb3dcIiB9LCBcIkVxdWlwbWVudCBkZXRhaWxzXCJdLFxuICAgICAgICAgICAgICAgIFtcImgyXCIsIGl0ZW0ubmFtZV9lbl0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX21ldGFcIiB9LFxuICAgICAgICAgICAgICAgICAgICBgJHtjaGFyYWN0ZXIgPz8gaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGwgY2hhcmFjdGVyc1wifSDCtyAke2l0ZW0ucGFydH0gwrcgTGV2ZWwgJHtpdGVtLmxldmVsfWAsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJpdGVtLWRldGFpbHMtc3RhdHNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc3RhdHNcIiB9LCBcIlN0YXRzXCJdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zdGF0cy1ub3RlXCIgfSxcbiAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGVcbiAgICAgICAgICAgICAgICAgICAgPyBcIkNoYXJhY3RlciBzdGF0cyBzaG93IGJhc2UgYW5kIGZ1bGx5IGVuY2hhbnRlZCB2YWx1ZXMuXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIlRoaXMgaXRlbSBoYXMgYmFzZSBzdGF0cyBvbmx5LlwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcImRsXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zdGF0c1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRzLm1hcCgoeyBsYWJlbCwgYmFzZSwgZW5jaGFudGVkIH0pID0+IGVuY2hhbnRlZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiZHRcIiwgbGFiZWxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImRkXCIsIGAke2Jhc2V9YF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1zdGF0LWNvbXBhcmlzb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGAke2xhYmVsfTogYmFzZSAke2Jhc2V9LCBlbmNoYW50ZWQgJHtlbmNoYW50ZWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImR0XCIsIGxhYmVsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tc3RhdC1jb21wYXJpc29uX192YWx1ZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzbWFsbFwiLCBcIkJhc2VcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzdHJvbmdcIiwgYCR7YmFzZX1gXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tc3RhdC1jb21wYXJpc29uX19hcnJvd1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIuKGklwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1zdGF0LWNvbXBhcmlzb25fX3ZhbHVlIGl0ZW0tc3RhdC1jb21wYXJpc29uX192YWx1ZS0tZW5jaGFudGVkXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInNtYWxsXCIsIFwiRW5jaGFudGVkXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic3Ryb25nXCIsIGAke2VuY2hhbnRlZH1gXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcInBcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBzdGF0IGJvbnVzZXNcIl0pLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc291cmNlc1wiIH0sIFwiSG93IHRvIGdldCBpdFwiXSxcbiAgICAgICAgICAgIHNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXCJkaXZcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NvdXJjZXNcIiB9LCAuLi5zb3VyY2VzXSlcbiAgICAgICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJObyBhY3RpdmUgYWNxdWlzaXRpb24gc291cmNlIGZvdW5kLlwiLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICBdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc1RyaWdnZXIoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tZGV0YWlscy10cmlnZ2VyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBWaWV3IGRldGFpbHMgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICBdKTtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd0RpYWxvZyhcbiAgICAgICAgICAgIGJ1dHRvbixcbiAgICAgICAgICAgIGAke2l0ZW0ubmFtZV9lbn0gaXRlbSBkZXRhaWxzYCxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtLCBjaGFyYWN0ZXIpLFxuICAgICAgICAgICAgXCJpdGVtLWRldGFpbHMtZGlhbG9nXCIsXG4gICAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW06IEl0ZW0pIHtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja1wiLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgT2ZmaWNpYWwgaXRlbSBhcnQgdW5hdmFpbGFibGUgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja19fY29kZVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGl0ZW0ucGFydCB8fCBcIkl0ZW1cIl0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIFwiT2ZmaWNpYWwgYXJ0IHVuYXZhaWxhYmxlXCJdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgc2hlZXQ6IHN0cmluZyxcbiAgICBjZWxsOiBudW1iZXIsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjbGFzc05hbWU6IHN0cmluZyxcbiAgICBkaXNwbGF5U2l6ZSA9IDQwLFxuKSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBpdGVtQXJ0TWFwLnNoZWV0c1tzaGVldF07XG4gICAgaWYgKCFnZW9tZXRyeSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvbHVtbiA9IGNlbGwgJSBnZW9tZXRyeS5saW5lQ291bnQ7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihjZWxsIC8gZ2VvbWV0cnkubGluZUNvdW50KTtcbiAgICBjb25zdCBzY2FsZSA9IGRpc3BsYXlTaXplIC8gZ2VvbWV0cnkuc2l6ZTtcbiAgICBjb25zdCBpbWFnZVNpemUgPSBnZW9tZXRyeS53aWR0aCAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFggPSAtKGdlb21ldHJ5LnNwYWNlICsgY29sdW1uICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IC0oZ2VvbWV0cnkuc3BhY2UgKyByb3cgKiAoZ2VvbWV0cnkuc2l6ZSArIGdlb21ldHJ5LnNwYWNlKSkgKiBzY2FsZTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogY2xhc3NOYW1lLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICAgICAgICAgIHN0eWxlOiBbXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtaW1hZ2U6dXJsKFwiYXNzZXRzL2l0ZW0tYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KHNoZWV0KX0ud2VicFwiKWAsXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtc2l6ZToke2ltYWdlU2l6ZX1weGAsXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQteDoke29mZnNldFh9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXk6JHtvZmZzZXRZfXB4YCxcbiAgICAgICAgICAgIF0uam9pbihcIjtcIiksXG4gICAgICAgIH0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnQoXG4gICAgaXRlbTogSXRlbSxcbiAgICBkaXNwbGF5U2l6ZSA9IDQwLFxuICAgIGNsYXNzTmFtZSA9IFwiaXRlbS1hcnQtdGh1bWJuYWlsXCIsXG4pIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLml0ZW1zW2Ake2l0ZW0uaWR9YF07XG4gICAgaWYgKCFhcnQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVNwcml0ZUFydChcbiAgICAgICAgYXJ0WzBdLFxuICAgICAgICBhcnRbMV0sXG4gICAgICAgIGBPZmZpY2lhbCBpdGVtIGFydCBmb3IgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICBkaXNwbGF5U2l6ZSxcbiAgICApID8/IGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFDb2luQXJ0KGdhY2hhOiBHYWNoYSkge1xuICAgIGNvbnN0IGFydCA9IGl0ZW1BcnRNYXAubG90dGVyaWVzW2Ake2dhY2hhLmdhY2hhX2luZGV4fWBdO1xuICAgIGNvbnN0IGZhbGxiYWNrID0gKCkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1jb2luLWFydCBnYWNoYS1jb2luLWFydC0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgQ29pbiBhcnR3b3JrIHVuYXZhaWxhYmxlIGZvciAke2dhY2hhLm5hbWV9YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIj9cIixcbiAgICAgICAgXSk7XG4gICAgaWYgKCFhcnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrKCk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydC5zaGVldCxcbiAgICAgICAgYXJ0LmNlbGwsXG4gICAgICAgIGAke2dhY2hhLm5hbWV9IGNvaW4gYXJ0d29ya2AsXG4gICAgICAgIFwiZ2FjaGEtY29pbi1hcnRcIixcbiAgICApID8/IGZhbGxiYWNrKCk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RhYmxlUm93KGl0ZW06IEl0ZW0sIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcbiAgICBjb25zdCByb3cgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0clwiLCB7IGNsYXNzOiBcInJlc3VsdC1yb3dcIiB9LFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtbiByZXN1bHQtc3VtbWFyeVwiLCBcImRhdGEtbGFiZWxcIjogXCJJdGVtXCIgfSwgZGVsZXRhYmxlSXRlbShpdGVtLCBjaGFyYWN0ZXIpXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJBcnRcIiB9LCBjcmVhdGVJdGVtQXJ0KGl0ZW0pXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJDaGFyYWN0ZXJcIiB9LCBpdGVtLmNoYXJhY3RlciA/PyBcIkFsbFwiXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiUGFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiUGFydFwiIH0sIGl0ZW0ucGFydF0sXG4gICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLm1hcChzID0+IGl0ZW0uc3RhdEZyb21TdHJpbmcocykpLmpvaW4oXCIrXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiLCBcImRhdGEtbGFiZWxcIjogc3RhdCwgXCJkYXRhLXZhbHVlXCI6IHZhbHVlIH0sIHZhbHVlXSk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTGV2ZWxfY29sdW1uIG51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IFwiTGV2ZWxcIiwgXCJkYXRhLXZhbHVlXCI6IGAke2l0ZW0ubGV2ZWx9YCB9LCBgJHtpdGVtLmxldmVsfWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJTb3VyY2VfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlNvdXJjZVwiIH0sIC4uLm1ha2VTb3VyY2VzTGlzdChpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW0sIHNvdXJjZUZpbHRlciwgY2hhcmFjdGVyKSldLFxuICAgICAgICBdXG4gICAgKTtcbiAgICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2FjaGFUYWJsZShmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLCBjaGFyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgdGFibGUgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0YWJsZVwiLFxuICAgICAgICAgICAgW1wiY2FwdGlvblwiLCBcIkdhY2hhIGNvaW5zIGJ5IHNob3AgY3VycmVuY3kgYW5kIHN0YWdlIHNvdXJjZXNcIl0sXG4gICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiB9LCBcIk5hbWVcIl0sXG4gICAgICAgICAgICBdXG4gICAgICAgIF1cbiAgICApO1xuICAgIGZvciAoY29uc3QgWywgZ2FjaGFdIG9mIGdhY2hhcykge1xuICAgICAgICBjb25zdCBnYWNoYUl0ZW0gPSBzaG9wX2l0ZW1zLmdldChnYWNoYS5zaG9wX2luZGV4KTtcbiAgICAgICAgaWYgKCFnYWNoYUl0ZW0pIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVyKGdhY2hhSXRlbSkpIHtcbiAgICAgICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJOYW1lX2NvbHVtbiBTb3VyY2VfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkdhY2hhXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlR2FjaGFTb3VyY2VTdW1tYXJ5KHVuZGVmaW5lZCwgbmV3IEdhY2hhSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSwgY2hhciksXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCB0eXBlIFJlc3VsdHNUYWJsZVBsYW4gPSB7XG4gICAgdGFibGU6IEhUTUxUYWJsZUVsZW1lbnQsXG4gICAgdG90YWxSb3dzOiBudW1iZXIsXG4gICAgY3JlYXRlUm93OiAoaW5kZXg6IG51bWJlcikgPT4gSFRNTFRhYmxlUm93RWxlbWVudCxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXN1bHRzVGFibGVQbGFuKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IChpdGVtczogSXRlbVtdLCBpdGVtOiBJdGVtKSA9PiBJdGVtW10sXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogUmVzdWx0c1RhYmxlUGxhbiB7XG4gICAgY29uc3QgcmVzdWx0czogeyBba2V5OiBzdHJpbmddOiBJdGVtW10gfSA9IHtcbiAgICAgICAgXCJIYXRcIjogW10sXG4gICAgICAgIFwiSGFpclwiOiBbXSxcbiAgICAgICAgXCJEeWVcIjogW10sXG4gICAgICAgIFwiVXBwZXJcIjogW10sXG4gICAgICAgIFwiTG93ZXJcIjogW10sXG4gICAgICAgIFwiU2hvZXNcIjogW10sXG4gICAgICAgIFwiU29ja3NcIjogW10sXG4gICAgICAgIFwiSGFuZFwiOiBbXSxcbiAgICAgICAgXCJCYWNrcGFja1wiOiBbXSxcbiAgICAgICAgXCJGYWNlXCI6IFtdLFxuICAgICAgICBcIlJhY2tldFwiOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAoZmlsdGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHRzW2l0ZW0ucGFydF0gPSBwcmlvcml6ZXIocmVzdWx0c1tpdGVtLnBhcnRdLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJNYXRjaGluZyBlcXVpcG1lbnQgZ2xvYmFsbHkgcmFua2VkIGJ5IHNlbGVjdGVkIHN0YXQgcHJpb3JpdHlcIl0sXG4gICAgICAgICAgICBbXCJ0aGVhZFwiLFxuICAgICAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJBcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkNoYXJhY3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJQYXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlBhcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKChzdGF0LCBpbmRleCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdCwgaW5kZXggPT09IDApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTGV2ZWxfY29sdW1uIG51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJMZXZlbFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJTb3VyY2VfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiU291cmNlXCJdLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1widGJvZHlcIl0sXG4gICAgICAgIF1cbiAgICApO1xuICAgIHR5cGUgTWFwT3B0aW9ucyA9IHsgW2tleTogc3RyaW5nXTogbnVtYmVyW10gfTtcblxuICAgIHR5cGUgQ29zdCA9IHtcbiAgICAgICAgZ29sZDogbnVtYmVyLFxuICAgICAgICBhcDogbnVtYmVyLFxuICAgICAgICBtYXBzOiBNYXBPcHRpb25zLFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjb21iaW5lTWFwcyhtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmIChyZXN1bHRbbWFwXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gcmVzdWx0W21hcF0uY29uY2F0KHRyaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb21iaW5lQ29zdHMoY29zdDE6IENvc3QsIGNvc3QyOiBDb3N0KTogQ29zdCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnb2xkOiBjb3N0MS5nb2xkICsgY29zdDIuZ29sZCxcbiAgICAgICAgICAgIGFwOiBjb3N0MS5hcCArIGNvc3QyLmFwLFxuICAgICAgICAgICAgbWFwczogY29tYmluZU1hcHMoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWluTWFwKG0xOiBNYXBPcHRpb25zLCBtMjogTWFwT3B0aW9ucyk6IE1hcE9wdGlvbnMge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7IC4uLm0xIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcCwgdHJpZXNdIG9mIE9iamVjdC5lbnRyaWVzKG0yKSkge1xuICAgICAgICAgICAgaWYgKHRyaWVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHRbbWFwXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gW01hdGgubWluKHJlc3VsdFttYXBdWzBdLCB0cmllc1swXSldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSB0cmllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbkNvc3QoY29zdDE6IENvc3QsIGNvc3QyOiBDb3N0KTogQ29zdCB7XG4gICAgICAgIC8vIExleGljb2dyYXBoaWMgb24gKGFwLCBnb2xkKTogbG93ZXIgQVAgd2lucywgdGhlbiBsb3dlciBHb2xkLlxuICAgICAgICAvLyBOdW1lcmljIGNvbXBhcmUgb25seSDigJQgZG8gbm90IHVzZSBKUyBhcnJheS9zdHJpbmcgb3JkZXJpbmcuXG4gICAgICAgIGNvbnN0IHBpY2tDb3N0MSA9XG4gICAgICAgICAgICBjb3N0MS5hcCA8IGNvc3QyLmFwIHx8XG4gICAgICAgICAgICAoY29zdDEuYXAgPT09IGNvc3QyLmFwICYmIGNvc3QxLmdvbGQgPCBjb3N0Mi5nb2xkKTtcbiAgICAgICAgcmV0dXJuIHBpY2tDb3N0MSA/XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCxcbiAgICAgICAgICAgICAgICBhcDogY29zdDEuYXAsXG4gICAgICAgICAgICAgICAgbWFwczogbWluTWFwKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ29sZDogY29zdDIuZ29sZCxcbiAgICAgICAgICAgICAgICBhcDogY29zdDIuYXAsXG4gICAgICAgICAgICAgICAgbWFwczogbWluTWFwKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb3N0T2YoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogQ29zdCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUNvc3RzID0gWy4uLml0ZW0uc291cmNlcy52YWx1ZXMoKV1cbiAgICAgICAgICAgIC5maWx0ZXIoc291cmNlRmlsdGVyKVxuICAgICAgICAgICAgLm1hcCgoaXRlbVNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGdvbGQ6IDAsIGFwOiBpdGVtU291cmNlLnByaWNlLCBtYXBzOiB7fSB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGdvbGQ6IGl0ZW1Tb3VyY2UucHJpY2UsIGFwOiAwLCBtYXBzOiB7fSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpbmdsZUNvc3QgPSBjb3N0T2YoaXRlbVNvdXJjZS5pdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtdWx0aXBsaWVyID0gaXRlbVNvdXJjZS5nYWNoYVRyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnb2xkOiBzaW5nbGVDb3N0LmdvbGQgKiBtdWx0aXBsaWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXA6IHNpbmdsZUNvc3QuYXAgKiBtdWx0aXBsaWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHNpbmdsZUNvc3QubWFwcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoW21hcCwgdHJpZXNdKSA9PiBbbWFwLCB0cmllcy5tYXAobiA9PiBuICogbXVsdGlwbGllcildKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnb2xkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXA6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBzOiBPYmplY3QuZnJvbUVudHJpZXMoW1tpdGVtU291cmNlLmd1YXJkaWFuX21hcCwgW2l0ZW1Tb3VyY2UuaXRlbXMubGVuZ3RoXV1dKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAoc291cmNlQ29zdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTZWVkIHdpdGggdGhlIGZpcnN0IHJlYWwgc291cmNlIGNvc3QuIEEgezAsMH0gaWRlbnRpdHkgd291bGQgYWx3YXlzIHdpblxuICAgICAgICAvLyB1bmRlciBhIGNvcnJlY3QgbWluLCBhbmQgdGhlIG9sZCBhbHdheXMtbGFzdCBidWcgaGlkIHRoYXQuXG4gICAgICAgIHJldHVybiBzb3VyY2VDb3N0cy5yZWR1Y2UoKGN1cnIsIGNvc3QpID0+IG1pbkNvc3QoY3VyciwgY29zdCkpO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5U3RhdGlzdGljczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IE9iamVjdC5mcm9tRW50cmllcyhwcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IFtzdGF0LCAwXSkpO1xuICAgIGNvbnN0IHN0YXRpc3RpY3MgPSB7XG4gICAgICAgIGNoYXJhY3RlcnM6IG5ldyBTZXQ8Q2hhcmFjdGVyPixcbiAgICAgICAgTGV2ZWw6IDAsXG4gICAgICAgIGNvc3Q6IHsgYXA6IDAsIGdvbGQ6IDAsIG1hcHM6IHt9IH0gYXMgQ29zdCxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCByZXN1bHQgb2YgT2JqZWN0LnZhbHVlcyhyZXN1bHRzKSkge1xuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHN0YXQgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcmlvcml0eVN0YXRpc3RpY3Nbc3RhdF0gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3RhdC5zcGxpdChcIitcIikucmVkdWNlKChjdXJyLCBzdGF0TmFtZSkgPT4gY3VyciArIHJlc3VsdFswXS5zdGF0RnJvbVN0cmluZyhzdGF0TmFtZSksIDApO1xuICAgICAgICAgICAgcHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdICs9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGlzdGljcy5MZXZlbCA9IE1hdGgubWF4KHJlc3VsdFswXS5sZXZlbCwgc3RhdGlzdGljcy5MZXZlbCk7XG5cbiAgICAgICAgLy8gRm9vdGVyIGNvc3QgbXVzdCBtYXRjaCBzdGF0cy9sZXZlbDogYmVzdCBjYW5kaWRhdGUgcGVyIHNsb3Qgb25seS5cbiAgICAgICAgLy8gVGhlIGJvZHkgc3RpbGwgcmVuZGVycyB0aGUgZnVsbCBnbG9iYWxseSByYW5rZWQgbGlzdCBiZWxvdy5cbiAgICAgICAgc3RhdGlzdGljcy5jb3N0ID0gY29tYmluZUNvc3RzKFxuICAgICAgICAgICAgY29zdE9mKHJlc3VsdFswXSwgY2hhcmFjdGVyICYmIGlzQ2hhcmFjdGVyKGNoYXJhY3RlcikgPyBjaGFyYWN0ZXIgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgc3RhdGlzdGljcy5jb3N0LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc3BsYXlSZXN1bHRzID0gbWVyZ2VQcmlvcml0eVJhbmtpbmdzKFxuICAgICAgICBPYmplY3QudmFsdWVzKHJlc3VsdHMpLFxuICAgICAgICBwcmlvcml6ZXIsXG4gICAgKTtcbiAgICBjb25zdCByb3dJbnB1dHM6IHsgaXRlbTogSXRlbSwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIgfVtdID0gW107XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGRpc3BsYXlSZXN1bHRzKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hhciBvZiBpdGVtLmNoYXJhY3RlciA/IFtpdGVtLmNoYXJhY3Rlcl0gOiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICBzdGF0aXN0aWNzLmNoYXJhY3RlcnMuYWRkKGNoYXIpXG4gICAgICAgICAgICByb3dJbnB1dHMucHVzaCh7IGl0ZW0sIGNoYXJhY3RlcjogY2hhciB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGhpZGRlbkNvbHVtbkNsYXNzZXM6IHN0cmluZ1tdID0gW107XG4gICAgaWYgKHN0YXRpc3RpY3MuY2hhcmFjdGVycy5zaXplID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsX3NvdXJjZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuZ29sZCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuZ29sZC50b0ZpeGVkKDApfSBHb2xkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5hcCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuYXAudG9GaXhlZCgwKX0gQVBgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0YXRpc3RpY3NbJ0d1YXJkaWFuIGdhbWVzJ10uZm9yRWFjaCgoY291bnQsIG1hcCkgPT4gdG90YWxfc291cmNlcy5wdXNoKGAke2NvdW50LnRvRml4ZWQoMCl9IHggJHttYXB9YCkpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidGZvb3RcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBOYW1lX2NvbHVtblwiIH0sIFwiVG90YWw6XCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQ2hhcmFjdGVyX2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgUGFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBudW1lcmljXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7cHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdfWBcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke3N0YXRpc3RpY3MuTGV2ZWx9YF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBTb3VyY2VfY29sdW1uXCIgfSwgdG90YWxfc291cmNlcy5qb2luKFwiLCBcIildLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSkpO1xuICAgICAgICBoaWRkZW5Db2x1bW5DbGFzc2VzLnB1c2goXCJDaGFyYWN0ZXJfY29sdW1uXCIpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgaWYgKHByaW9yaXR5U3RhdGlzdGljc1thdHRyaWJ1dGVdID09PSAwKSB7XG4gICAgICAgICAgICBoaWRkZW5Db2x1bW5DbGFzc2VzLnB1c2goYCR7YXR0cmlidXRlfV9jb2x1bW5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGhpZGVDb2x1bW5zID0gKHJvb3Q6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgY2xhc3NOYW1lIG9mIGhpZGRlbkNvbHVtbkNsYXNzZXMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sdW1uRWxlbWVudCBvZiByb290LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgICAgIGlmIChjb2x1bW5FbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uRWxlbWVudC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgaGlkZUNvbHVtbnModGFibGUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFibGUsXG4gICAgICAgIHRvdGFsUm93czogcm93SW5wdXRzLmxlbmd0aCxcbiAgICAgICAgY3JlYXRlUm93KGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gcm93SW5wdXRzW2luZGV4XTtcbiAgICAgICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgUmVzdWx0IHJvdyAke2luZGV4fSBpcyBvdXQgb2YgcmFuZ2VgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IGl0ZW1Ub1RhYmxlUm93KFxuICAgICAgICAgICAgICAgIGlucHV0Lml0ZW0sXG4gICAgICAgICAgICAgICAgc291cmNlRmlsdGVyLFxuICAgICAgICAgICAgICAgIHByaW9yaXR5U3RhdHMsXG4gICAgICAgICAgICAgICAgaW5wdXQuY2hhcmFjdGVyLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGhpZGVDb2x1bW5zKHJvdyk7XG4gICAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICB9LFxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXN1bHRzVGFibGUoXG4gICAgZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbixcbiAgICBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLFxuICAgIHByaW9yaXplcjogKGl0ZW1zOiBJdGVtW10sIGl0ZW06IEl0ZW0pID0+IEl0ZW1bXSxcbiAgICBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCBwbGFuID0gZ2V0UmVzdWx0c1RhYmxlUGxhbihcbiAgICAgICAgZmlsdGVyLFxuICAgICAgICBzb3VyY2VGaWx0ZXIsXG4gICAgICAgIHByaW9yaXplcixcbiAgICAgICAgcHJpb3JpdHlTdGF0cyxcbiAgICAgICAgY2hhcmFjdGVyLFxuICAgICk7XG4gICAgY29uc3QgdGFibGVCb2R5ID0gcGxhbi50YWJsZS50Qm9kaWVzWzBdO1xuICAgIGlmICghdGFibGVCb2R5KSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBsYW4udG90YWxSb3dzOyBpbmRleCArPSAxKSB7XG4gICAgICAgIHRhYmxlQm9keS5hcHBlbmRDaGlsZChwbGFuLmNyZWF0ZVJvdyhpbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gcGxhbi50YWJsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1heEl0ZW1MZXZlbCgpIHtcbiAgICAvL25vIHJlZHVjZSBmb3IgTWFwP1xuICAgIGxldCBtYXggPSAwO1xuICAgIGZvciAoY29uc3QgWywgaXRlbV0gb2YgaXRlbXMpIHtcbiAgICAgICAgbWF4ID0gTWF0aC5tYXgobWF4LCBpdGVtLmxldmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIG1heDtcbn1cblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmIChkaWFsb2cgJiYgZGlhbG9nID09PSBldmVudC50YXJnZXQpIHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgfVxufSk7XG4iLCJpbXBvcnQgeyBtYWtlQ2hlY2tib3hUcmVlLCBUcmVlTm9kZSwgZ2V0TGVhZlN0YXRlcywgc2V0TGVhZlN0YXRlcyB9IGZyb20gJy4vY2hlY2tib3hUcmVlJztcbmltcG9ydCB7IGNyZWF0ZVBvcHVwTGluaywgZG93bmxvYWRJdGVtcywgZ2V0UmVzdWx0c1RhYmxlUGxhbiwgSXRlbSwgSXRlbVNvdXJjZSwgZ2V0TWF4SXRlbUxldmVsLCBpdGVtcywgQ2hhcmFjdGVyLCBjaGFyYWN0ZXJzLCBpc0NoYXJhY3RlciwgU2hvcEl0ZW1Tb3VyY2UsIEdhY2hhSXRlbVNvdXJjZSwgZ2V0R2FjaGFUYWJsZSB9IGZyb20gJy4vaXRlbUxvb2t1cCc7XG5pbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IHNlbGVjdEJ5UHJpb3JpdHkgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7IGJyb3dzZXJGcmFtZVNjaGVkdWxlciwgUHJvZ3Jlc3NpdmVCYXRjaFJlbmRlcmVyIH0gZnJvbSAnLi9wcm9ncmVzc2l2ZVJlbmRlcic7XG5pbXBvcnQgeyBWYXJpYWJsZV9zdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlJztcblxuY29uc3QgcGFydHNGaWx0ZXIgPSBbXG4gICAgXCJQYXJ0c1wiLCBbXG4gICAgICAgIFwiSGVhZFwiLCBbXG4gICAgICAgICAgICBcIitIYXRcIixcbiAgICAgICAgICAgIFwiK0hhaXJcIixcbiAgICAgICAgICAgIFwiRHllXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1VwcGVyXCIsXG4gICAgICAgIFwiK0xvd2VyXCIsXG4gICAgICAgIFwiTGVnc1wiLCBbXG4gICAgICAgICAgICBcIitTaG9lc1wiLFxuICAgICAgICAgICAgXCJTb2Nrc1wiLFxuICAgICAgICBdLFxuICAgICAgICBcIkF1eFwiLCBbXG4gICAgICAgICAgICBcIitIYW5kXCIsXG4gICAgICAgICAgICBcIitCYWNrcGFja1wiLFxuICAgICAgICAgICAgXCIrRmFjZVwiXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1JhY2tldFwiLFxuICAgIF0sXG5dO1xuXG5jb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXIgPSBbXG4gICAgXCJBdmFpbGFiaWxpdHlcIiwgW1xuICAgICAgICBcIlNob3BcIiwgW1xuICAgICAgICAgICAgXCIrR29sZFwiLFxuICAgICAgICAgICAgXCIrQVBcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrQWxsb3cgZ2FjaGFcIixcbiAgICAgICAgXCIrR3VhcmRpYW5cIixcbiAgICAgICAgXCIrVW50cmFkYWJsZVwiLFxuICAgICAgICBcIlVuYXZhaWxhYmxlIGl0ZW1zXCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGV4Y2x1ZGVkX2l0ZW1faWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbi8qKiBEaWdpdHMtb25seSBzYWZlLWludGVnZXIgcGFyc2UgZm9yIGV4Y2x1ZGVkX2l0ZW1faWRzIGxvY2FsU3RvcmFnZSB0b2tlbnMuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeGNsdWRlZEl0ZW1JZFRva2VuKHRva2VuOiBzdHJpbmcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGlmICghL15cXGQrJC8udGVzdCh0b2tlbikpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBOdW1iZXIodG9rZW4pO1xuICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoaWQpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYWRkRmlsdGVyVHJlZXMoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFyYWN0ZXJGaWx0ZXJzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNoYXJhY3RlciBvZiBbXCJBbGxcIiwgLi4uY2hhcmFjdGVyc10pIHtcbiAgICAgICAgY29uc3QgaWQgPSBgY2hhcmFjdGVyU2VsZWN0b3JzXyR7Y2hhcmFjdGVyfWA7XG4gICAgICAgIGNvbnN0IHJhZGlvX2J1dHRvbiA9IGNyZWF0ZUhUTUwoW1wiaW5wdXRcIiwgeyBpZDogaWQsIHR5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIiwgdmFsdWU6IGNoYXJhY3RlciB9XSk7XG4gICAgICAgIHJhZGlvX2J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdXBkYXRlUmVzdWx0cyk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChyYWRpb19idXR0b24pO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJsYWJlbFwiLCB7IGZvcjogaWQgfSwgY2hhcmFjdGVyXSkpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJiclwiXSkpO1xuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBcIk5pa2lcIikge1xuICAgICAgICAgICAgcmFkaW9fYnV0dG9uLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmlsdGVyczogW1RyZWVOb2RlLCBzdHJpbmddW10gPSBbXG4gICAgICAgIFtwYXJ0c0ZpbHRlciwgXCJwYXJ0c0ZpbHRlclwiXSxcbiAgICAgICAgW2F2YWlsYWJpbGl0eUZpbHRlciwgXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIl0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IFtmaWx0ZXIsIG5hbWVdIG9mIGZpbHRlcnMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJlZSA9IG1ha2VDaGVja2JveFRyZWUoZmlsdGVyKTtcbiAgICAgICAgdHJlZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRyZWUpO1xuICAgIH1cbn1cblxuYWRkRmlsdGVyVHJlZXMoKTtcblxubGV0IGRyYWdnZWQ6IEhUTUxFbGVtZW50O1xuY29uc3QgZHJhZ1NlcGFyYXRvckxpbmUgPSBjcmVhdGVIVE1MKFtcImhyXCIsIHsgaWQ6IFwiZHJhZ092ZXJCYXJcIiB9XSk7XG5sZXQgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TW92ZUljb24oZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwicHJpb3JpdHktbW92ZV9faWNvblwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLCBcIjAgMCAyNCAyNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiZm9jdXNhYmxlXCIsIFwiZmFsc2VcIik7XG4gICAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJwYXRoXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFxuICAgICAgICBcImRcIixcbiAgICAgICAgZGlyZWN0aW9uID09PSBcInVwXCIgPyBcIk02IDE0LjUgMTIgOC41bDYgNlwiIDogXCJNNiA5LjUgMTIgMTUuNWw2LTZcIixcbiAgICApO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyLjI1XCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVjYXBcIiwgXCJyb3VuZFwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lam9pblwiLCBcInJvdW5kXCIpO1xuICAgIHN2Zy5hcHBlbmQocGF0aCk7XG4gICAgcmV0dXJuIHN2Zztcbn1cblxuLyoqIFJlYWQgcmFua2luZyBrZXkgZnJvbSB0aGUgbGFiZWwgbm9kZSBzbyBtb3ZlIGNvbnRyb2xzIG5ldmVyIHBvbGx1dGUgc3RhdCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW9yaXR5U3RhdExhYmVsKGl0ZW06IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxhYmVsID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LXN0YXQtbGFiZWxcIik7XG4gICAgaWYgKGxhYmVsPy50ZXh0Q29udGVudCkge1xuICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBzZXRQcmlvcml0eVN0YXRMYWJlbChpdGVtOiBIVE1MRWxlbWVudCwgc3RhdDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGFiZWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKTtcbiAgICBpZiAobGFiZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHN0YXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gc3RhdDtcbiAgICB9XG4gICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBjb25zdCBkb3duID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAodXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICB1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBSYWlzZSAke3N0YXR9IHByaW9yaXR5YCk7XG4gICAgICAgIHVwLnRpdGxlID0gYFJhaXNlICR7c3RhdH1gO1xuICAgIH1cbiAgICBpZiAoZG93biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgIGRvd24uc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBgTG93ZXIgJHtzdGF0fSBwcmlvcml0eWApO1xuICAgICAgICBkb3duLnRpdGxlID0gYExvd2VyICR7c3RhdH1gO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdDogc3RyaW5nKTogSFRNTExJRWxlbWVudCB7XG4gICAgY29uc3QgdXAgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIGNsYXNzOiBcInByaW9yaXR5LW1vdmUgcHJpb3JpdHktbW92ZS11cFwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSYWlzZSAke3N0YXR9IHByaW9yaXR5YCxcbiAgICAgICAgICAgIHRpdGxlOiBgUmFpc2UgJHtzdGF0fWAsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgdXAuYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oXCJ1cFwiKSk7XG4gICAgY29uc3QgZG93biA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgY2xhc3M6IFwicHJpb3JpdHktbW92ZSBwcmlvcml0eS1tb3ZlLWRvd25cIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgTG93ZXIgJHtzdGF0fSBwcmlvcml0eWAsXG4gICAgICAgICAgICB0aXRsZTogYExvd2VyICR7c3RhdH1gLFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIGRvd24uYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oXCJkb3duXCIpKTtcblxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJsaVwiLFxuICAgICAgICB7IGNsYXNzOiBcImRyb3B6b25lXCIsIGRyYWdnYWJsZTogXCJ0cnVlXCIgfSxcbiAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcInByaW9yaXR5LXN0YXQtbGFiZWxcIiB9LCBzdGF0XSxcbiAgICAgICAgY3JlYXRlSFRNTChbXCJzcGFuXCIsIHsgY2xhc3M6IFwicHJpb3JpdHktbW92ZS1jb250cm9sc1wiIH0sIHVwLCBkb3duXSksXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHByaW9yaXR5TGlzdEl0ZW1zKGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiBIVE1MTElFbGVtZW50W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QuY2hpbGRyZW4pLmZpbHRlcihcbiAgICAgICAgKG5vZGUpOiBub2RlIGlzIEhUTUxMSUVsZW1lbnQgPT4gbm9kZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgbm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBzeW5jUmFua2luZ1N1bW1hcnlIaW50KGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBoaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9zdW1tYXJ5X2hpbnRcIik7XG4gICAgaWYgKCEoaGludCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvcCA9IHByaW9yaXR5TGlzdEl0ZW1zKGxpc3QpWzBdO1xuICAgIGlmICghdG9wKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFiZWwgPSBnZXRQcmlvcml0eVN0YXRMYWJlbCh0b3ApO1xuICAgIGlmIChsYWJlbCkge1xuICAgICAgICBoaW50LnRleHRDb250ZW50ID0gYCR7bGFiZWx9IHJhbmtzIGFsbCBlcXVpcG1lbnRgO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtcyA9IHByaW9yaXR5TGlzdEl0ZW1zKGxpc3QpO1xuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHVwID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtdXBcIik7XG4gICAgICAgIGNvbnN0IGRvd24gPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS1kb3duXCIpO1xuICAgICAgICBpZiAodXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgICAgdXAuZGlzYWJsZWQgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZG93biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgICBkb3duLmRpc2FibGVkID0gaW5kZXggPT09IGl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBzeW5jUmFua2luZ1N1bW1hcnlIaW50KGxpc3QpO1xufVxuXG5mdW5jdGlvbiBtb3ZlUHJpb3JpdHlMaXN0SXRlbShpdGVtOiBIVE1MTElFbGVtZW50LCBkaXJlY3Rpb246IFwidXBcIiB8IFwiZG93blwiKTogdm9pZCB7XG4gICAgY29uc3QgbGlzdCA9IGl0ZW0ucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShsaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgc2libGluZzogRWxlbWVudCB8IG51bGwgPSBkaXJlY3Rpb24gPT09IFwidXBcIiA/IGl0ZW0ucHJldmlvdXNFbGVtZW50U2libGluZyA6IGl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIHdoaWxlIChzaWJsaW5nICYmICEoc2libGluZyBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgc2libGluZy5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKSkpIHtcbiAgICAgICAgc2libGluZyA9IGRpcmVjdGlvbiA9PT0gXCJ1cFwiID8gc2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nIDogc2libGluZy5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgfVxuICAgIGlmICghKHNpYmxpbmcgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaXJlY3Rpb24gPT09IFwidXBcIikge1xuICAgICAgICBzaWJsaW5nLmJlZm9yZShpdGVtKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNpYmxpbmcuYWZ0ZXIoaXRlbSk7XG4gICAgfVxuICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShsaXN0KTtcbiAgICB1cGRhdGVSZXN1bHRzKCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5RHJhZ0Ryb3AoKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgeyB0YXJnZXQgfSA9IGV2ZW50O1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZSwgLnByaW9yaXR5LW1vdmUtY29udHJvbHNcIikpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgcm93ID0gdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpXG4gICAgICAgICAgICA/IHRhcmdldFxuICAgICAgICAgICAgOiB0YXJnZXQuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmICghKHJvdyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdnZWQgPSByb3c7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHJvcHpvbmUgPSBldmVudC50YXJnZXQuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChkcm9wem9uZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRSZWN0ID0gZHJvcHpvbmUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSAtIHRhcmdldFJlY3QudG9wO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGFyZ2V0UmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICBlbnVtIFBvc2l0aW9uIHtcbiAgICAgICAgICAgICAgICBhYm92ZSxcbiAgICAgICAgICAgICAgICBvbixcbiAgICAgICAgICAgICAgICBiZWxvdyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0geSA8IGhlaWdodCAqIDAuMyA/IFBvc2l0aW9uLmFib3ZlIDogeSA+IGhlaWdodCAqIDAuNyA/IFBvc2l0aW9uLmJlbG93IDogUG9zaXRpb24ub247XG4gICAgICAgICAgICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5hYm92ZTpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGRyb3B6b25lLmJlZm9yZShkcmFnU2VwYXJhdG9yTGluZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYmVsb3c6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBkcm9wem9uZS5hZnRlcihkcmFnU2VwYXJhdG9yTGluZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24ub246XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWQgPT09IGRyb3B6b25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gZHJvcHpvbmU7XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsICh7IHRhcmdldCB9KSA9PiB7XG4gICAgICAgIGlmICghZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuKSB7XG4gICAgICAgICAgICBkcmFnZ2VkLnJlbW92ZSgpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuYWZ0ZXIoZHJhZ2dlZCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRyYWdnZWQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIGlmIChsaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShsaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoIShkcm9wVGFyZ2V0IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb21iaW5lZCA9IGAke2dldFByaW9yaXR5U3RhdExhYmVsKGRyb3BUYXJnZXQpfSske2dldFByaW9yaXR5U3RhdExhYmVsKGRyYWdnZWQpfWA7XG4gICAgICAgICAgICBzZXRQcmlvcml0eVN0YXRMYWJlbChkcm9wVGFyZ2V0LCBjb21iaW5lZCk7XG4gICAgICAgICAgICBkcmFnZ2VkLnJlbW92ZSgpO1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRyb3BUYXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIGlmIChsaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShsaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcm9wUm93ID0gdGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpXG4gICAgICAgICAgICA/IHRhcmdldFxuICAgICAgICAgICAgOiB0YXJnZXQuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChkcm9wUm93ID09PSBkcmFnZ2VkICYmIGRyYWdnZWQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGdldFByaW9yaXR5U3RhdExhYmVsKGRyYWdnZWQpLnNwbGl0KFwiK1wiKTtcbiAgICAgICAgICAgIHNldFByaW9yaXR5U3RhdExhYmVsKGRyYWdnZWQsIHN0YXRzLnNoaWZ0KCkhKTtcbiAgICAgICAgICAgIGRyYWdnZWQuYWZ0ZXIoLi4uc3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlUHJpb3JpdHlMaXN0SXRlbShzdGF0KSkpO1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGRyYWdnZWQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIGlmIChsaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShsaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbmFwcGx5RHJhZ0Ryb3AoKTtcblxuZnVuY3Rpb24gaHlkcmF0ZVByaW9yaXR5TGlzdENvbnRyb2xzKCk6IHZvaWQge1xuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBwcmlvcml0eUxpc3RJdGVtcyhwcmlvcml0eUxpc3QpKSB7XG4gICAgICAgIGlmICghaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LXN0YXQtbGFiZWxcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSAoaXRlbS50ZXh0Q29udGVudCA/PyBcIlwiKS50cmltKCk7XG4gICAgICAgICAgICBpZiAoIXN0YXQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0ucmVwbGFjZVdpdGgoY3JlYXRlUHJpb3JpdHlMaXN0SXRlbShzdGF0KSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTdGF0aWMgSFRNTCBzaGlwcyBlbXB0eSBjb250cm9sIHNoZWxsczsgZmlsbCBpY29ucyB3aXRob3V0IGxvc2luZyBsYWJlbHMuXG4gICAgICAgIGZvciAoY29uc3QgYnV0dG9uIG9mIGl0ZW0ucXVlcnlTZWxlY3RvckFsbChcIi5wcmlvcml0eS1tb3ZlXCIpKSB7XG4gICAgICAgICAgICBpZiAoIShidXR0b24gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkgfHwgYnV0dG9uLnF1ZXJ5U2VsZWN0b3IoXCJzdmdcIikpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGJ1dHRvbi5jbGFzc0xpc3QuY29udGFpbnMoXCJwcmlvcml0eS1tb3ZlLXVwXCIpID8gXCJ1cFwiIDogXCJkb3duXCI7XG4gICAgICAgICAgICBidXR0b24uYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oZGlyZWN0aW9uKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKHByaW9yaXR5TGlzdCk7XG59XG5cbmh5ZHJhdGVQcmlvcml0eUxpc3RDb250cm9scygpO1xuXG5mdW5jdGlvbiBjb21wYXJlKGxoczogbnVtYmVyLCByaHM6IG51bWJlcik6IC0xIHwgMCB8IDEge1xuICAgIGlmIChsaHMgPT09IHJocykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIGxocyA8IHJocyA/IC0xIDogMTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIik7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGNoYXJhY3RlckZpbHRlckxpc3QpIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChpc0NoYXJhY3RlcihzZWxlY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0U2VsZWN0ZWRDaGFyYWN0ZXIoY2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCBcIkFsbFwiKSB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LnZhbHVlID09PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGl0ZW1TZWxlY3RvcnMgPSBbXCJwYXJ0c1NlbGVjdG9yXCIsIFwiZ2FjaGFTZWxlY3RvclwiXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEl0ZW1TZWxlY3RvciA9IHR5cGVvZiBpdGVtU2VsZWN0b3JzW251bWJlcl07XG5leHBvcnQgZnVuY3Rpb24gaXNJdGVtU2VsZWN0b3IoaXRlbVNlbGVjdG9yOiBzdHJpbmcpOiBpdGVtU2VsZWN0b3IgaXMgSXRlbVNlbGVjdG9yIHtcbiAgICByZXR1cm4gKGl0ZW1TZWxlY3RvcnMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkuaW5jbHVkZXMoaXRlbVNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKTogSXRlbVNlbGVjdG9yIHtcbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGlmIChwYXJ0c1NlbGVjdG9yLmNoZWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIFwicGFydHNTZWxlY3RvclwiO1xuICAgIH1cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGlmIChnYWNoYVNlbGVjdG9yLmNoZWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIFwiZ2FjaGFTZWxlY3RvclwiO1xuICAgIH1cbiAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG59XG5cbmZ1bmN0aW9uIHNhdmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRDaGFyYWN0ZXIgPSBnZXRTZWxlY3RlZENoYXJhY3RlcigpIHx8IFwiQWxsXCI7XG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJDaGFyYWN0ZXJcIiwgc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgIHsvL0ZpbHRlcnNcbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0KSkpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0KSkpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB7IC8vbWlzY1xuICAgICAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpO1xuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIm1heExldmVsXCIsIG1heExldmVsKTtcblxuICAgICAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBuYW1lZmlsdGVyLnZhbHVlO1xuICAgICAgICBpZiAoaXRlbV9uYW1lKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIiwgaXRlbV9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuZGVsZXRlX3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgICAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIiwgZW5jaGFudFRvZ2dsZS5jaGVja2VkKTtcbiAgICB9XG4gICAgeyAvL2l0ZW0gc2VsZWN0aW9uXG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiLCBnZXRJdGVtVHlwZVNlbGVjdGlvbigpKTtcbiAgICB9XG5cbiAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcImV4Y2x1ZGVkX2l0ZW1faWRzXCIsIEFycmF5LmZyb20oZXhjbHVkZWRfaXRlbV9pZHMpLmpvaW4oXCIsXCIpKTtcbn1cblxuZnVuY3Rpb24gcmVzdG9yZVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzdG9yZWRfY2hhcmFjdGVyID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJDaGFyYWN0ZXJcIik7XG4gICAgc2V0U2VsZWN0ZWRDaGFyYWN0ZXIodHlwZW9mIHN0b3JlZF9jaGFyYWN0ZXIgPT09IFwic3RyaW5nXCIgJiYgaXNDaGFyYWN0ZXIoc3RvcmVkX2NoYXJhY3RlcikgPyBzdG9yZWRfY2hhcmFjdGVyIDogXCJOaWtpXCIpO1xuXG4gICAgey8vRmlsdGVyc1xuICAgICAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoVmFyaWFibGVfc3RvcmFnZS52YXJpYWJsZXMpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIHN0YXRlc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICB7IC8vbWlzY1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIik7XG4gICAgICAgIGlmICh0eXBlb2YgbWF4TGV2ZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHttYXhMZXZlbH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGxldmVscmFuZ2UubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbV9uYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBuYW1lZmlsdGVyLnZhbHVlID0gaXRlbV9uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZW5jaGFudFRvZ2dsZS5jaGVja2VkID0gISFWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgfVxuXG4gICAgLy8gUmVoeWRyYXRlIGV4Y2x1c2lvbnMgYmVmb3JlIGFueSBzYXZlLWNhcGFibGUgZXZlbnQgKGNoYW5nZS9pbnB1dCDihpIgdXBkYXRlUmVzdWx0cyDihpIgc2F2ZVNlbGVjdGlvbikuXG4gICAgY29uc3QgZXhjbHVkZWRfaWRzID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiKTtcbiAgICBpZiAodHlwZW9mIGV4Y2x1ZGVkX2lkcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2lkcy5zcGxpdChcIixcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRXhjbHVkZWRJdGVtSWRUb2tlbihpZCk7XG4gICAgICAgICAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBsZXQgaXRlbVR5cGVTZWxlY3RvciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtVHlwZVNlbGVjdG9yICE9PSBcInN0cmluZ1wiIHx8ICFpc0l0ZW1TZWxlY3RvcihpdGVtVHlwZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaXRlbVR5cGVTZWxlY3RvciA9IFwicGFydHNTZWxlY3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVR5cGVTZWxlY3Rvcik7XG4gICAgICAgIGlmICghKHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZWN0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSk7XG4gICAgfVxuXG4gICAgLy9tdXN0IGJlIGxhc3QgYmVjYXVzZSBpdCB0cmlnZ2VycyBhIHN0b3JlXG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbn1cblxuY29uc3QgSU5JVElBTF9SRVNVTFRfUk9XUyA9IDI0O1xuY29uc3QgUkVTVUxUX1JPV1NfUEVSX1JFUVVFU1QgPSAyNDA7XG5jb25zdCBNQVhfUkVTVUxUX1JPV1NfUEVSX0ZSQU1FID0gOTY7XG5jb25zdCBSRVNVTFRfRlJBTUVfQlVER0VUX01TID0gODtcbmxldCBhY3RpdmVSZXN1bHRzUmVuZGVyZXI6IFByb2dyZXNzaXZlQmF0Y2hSZW5kZXJlcjxudW1iZXIsIEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHwgdW5kZWZpbmVkO1xubGV0IGFjdGl2ZVJlc3VsdHNPYnNlcnZlcjogSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgfCB1bmRlZmluZWQ7XG5sZXQgcmVzdWx0c1JlbmRlclZlcnNpb24gPSAwO1xuXG5mdW5jdGlvbiB1cGRhdGVSZXN1bHRzKCkge1xuICAgIHNhdmVTZWxlY3Rpb24oKTtcbiAgICAvLyBXaGlsZSBmaXJzdC1sb2FkIGxhYiBwcmVwIGlzIGFjdGl2ZSwga2VlcCBmcmllbmRseSBsb2FkaW5nIGNvcHkg4oCUIGRvIG5vdCBwYWludFxuICAgIC8vIGFuIGVtcHR5IGludmVudG9yeSAoXCJObyBpdGVtcyBtYXRjaOKAplwiKSBvdmVyIHRoZSBhbmltYXRlZCBsb2FkZXIuXG4gICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19ncm91cFwiKT8uZ2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIpID09PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGFjdGl2ZVJlc3VsdHNSZW5kZXJlcj8uY2FuY2VsKCk7XG4gICAgYWN0aXZlUmVzdWx0c1JlbmRlcmVyID0gdW5kZWZpbmVkO1xuICAgIGFjdGl2ZVJlc3VsdHNPYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgIGFjdGl2ZVJlc3VsdHNPYnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCByZW5kZXJWZXJzaW9uID0gKytyZXN1bHRzUmVuZGVyVmVyc2lvbjtcbiAgICBjb25zdCBmaWx0ZXJzOiAoKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBjb25zdCBzb3VyY2VGaWx0ZXJzOiAoKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBsZXQgc2VsZWN0ZWRDaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cblxuICAgIHsgLy9jaGFyYWN0ZXIgZmlsdGVyXG4gICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5jaGFyYWN0ZXIgPT09IHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9wYXJ0cyBmaWx0ZXJcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1N0YXRlcyA9IGdldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0KTtcbiAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBwYXJ0c1N0YXRlc1tpdGVtLnBhcnRdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2F2YWlsYWJpbGl0eSBmaWx0ZXJcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0KTtcbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHb2xkXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiAhaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQVBcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmIGl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVudHJhZGFibGVcIl0pIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ucGFyY2VsX2VuYWJsZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQWxsb3cgZ2FjaGFcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR3VhcmRpYW5cIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICFpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW5hdmFpbGFibGUgaXRlbXNcIl0pIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlciA9IFsuLi5zb3VyY2VGaWx0ZXJzXTtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbHRlciA9IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlOiBJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VGaWx0ZXIoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBpdGVtU291cmNlLml0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpc0F2YWlsYWJsZVNvdXJjZSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlSXRlbShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtU291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpc0F2YWlsYWJsZUl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL21pc2MgZmlsdGVyXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIGZpbHRlcnMucHVzaCgoaXRlbTogSXRlbSkgPT4gaXRlbS5sZXZlbCA8PSBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5uYW1lX2VuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoaXRlbV9uYW1lLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pZCBmaWx0ZXJcbiAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gIWV4Y2x1ZGVkX2l0ZW1faWRzLmhhcyhpdGVtLmlkKSk7XG4gICAgICAgIGNvbnN0IGl0ZW1GaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpdGVtRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShpdGVtRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuXG4gICAgICAgIH1cbiAgICAgICAgaXRlbUZpbHRlckxpc3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgIGlmIChleGNsdWRlZF9pdGVtX2lkcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImVtcHR5LW5vdGVcIiB9LFxuICAgICAgICAgICAgICAgIFwiTm8gZXhjbHVkZWQgaXRlbXNcIixcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaXRlbV9pZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gaXRlbXMuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW1GaWx0ZXJMaXN0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImV4Y2x1ZGVkLWl0ZW1cIiB9LFxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZXhjbHVkZWQtaXRlbV9fbmFtZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxfcmVtb3ZhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2lkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSZXN0b3JlICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlc3RvcmVcIixcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBjb21wYXJhdG9yczogKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gbnVtYmVyKVtdID0gW107XG5cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eVN0YXRzID0gcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KVxuICAgICAgICAubWFwKG5vZGUgPT4gZ2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSkpXG4gICAgICAgIC5maWx0ZXIoc3RhdCA9PiBzdGF0Lmxlbmd0aCA+IDApO1xuICAgIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdC5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBjb21wYXJhdG9ycy5wdXNoKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gY29tcGFyZShcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiBsaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pLFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IHJocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBcImVxdWlwbWVudFwiIGFzIGNvbnN0LFxuICAgICAgICAgICAgICAgICAgICBwbGFuOiBnZXRSZXN1bHRzVGFibGVQbGFuKFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZSA9PiBzb3VyY2VGaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgKGl0ZW1zLCBpdGVtKSA9PiBzZWxlY3RCeVByaW9yaXR5KGl0ZW1zLCBpdGVtLCBjb21wYXJhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eVN0YXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXIsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwiZ2FjaGFcIiBhcyBjb25zdCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGU6IGdldEdhY2hhVGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENoYXJhY3RlcixcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1wiKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c19ncm91cFwiKTtcbiAgICBjb25zdCByZXN1bHRzU3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzU3RhdHVzXCIpO1xuICAgIGNvbnN0IHRhYmxlU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZVNjcm9sbFwiKTtcbiAgICBpZiAodGFibGVTY3JvbGwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0YWJsZVNjcm9sbC5zY3JvbGxUb3AgPSAwO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQua2luZCA9PT0gXCJnYWNoYVwiKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdFJvd3MgPSByZXN1bHQudGFibGUudEJvZGllc1swXT8ucm93cy5sZW5ndGhcbiAgICAgICAgICAgID8/IE1hdGgubWF4KDAsIHJlc3VsdC50YWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xuICAgICAgICB0YXJnZXQucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgIGlmIChyZXN1bHRSb3dzID09PSAwKSB7XG4gICAgICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWVtcHR5XCIsIHJvbGU6IFwic3RhdHVzXCIgfSxcbiAgICAgICAgICAgICAgICBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIsXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocmVzdWx0LnRhYmxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0c1N0YXR1cykge1xuICAgICAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IHJlc3VsdFJvd3MgPT09IDBcbiAgICAgICAgICAgICAgICA/IFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIlxuICAgICAgICAgICAgICAgIDogYCR7cmVzdWx0Um93c30gbWF0Y2hpbmcgJHtyZXN1bHRSb3dzID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyLXN0YXRlXCIsIFwiY29tcGxldGVcIik7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXJlZC1yb3dzXCIsIGAke3Jlc3VsdFJvd3N9YCk7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS10b3RhbC1yb3dzXCIsIGAke3Jlc3VsdFJvd3N9YCk7XG4gICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcGxhbiB9ID0gcmVzdWx0O1xuICAgIGlmIChwbGFuLnRvdGFsUm93cyA9PT0gMCkge1xuICAgICAgICB0YXJnZXQucmVwbGFjZUNoaWxkcmVuKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInJlc3VsdHMtZW1wdHlcIiwgcm9sZTogXCJzdGF0dXNcIiB9LFxuICAgICAgICAgICAgXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiLFxuICAgICAgICBdKSk7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMgJiYgKHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIpO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyLXN0YXRlXCIsIFwiY29tcGxldGVcIik7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXJlZC1yb3dzXCIsIFwiMFwiKTtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRvdGFsLXJvd3NcIiwgXCIwXCIpO1xuICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZUJvZHkgPSBwbGFuLnRhYmxlLnRCb2RpZXNbMF07XG4gICAgaWYgKCF0YWJsZUJvZHkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICB0YXJnZXQucmVwbGFjZUNoaWxkcmVuKHBsYW4udGFibGUpO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyLXN0YXRlXCIsIFwicmVuZGVyaW5nXCIpO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZXN1bHRzLXZlcnNpb25cIiwgYCR7cmVuZGVyVmVyc2lvbn1gKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyZWQtcm93c1wiLCBcIjBcIik7XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRvdGFsLXJvd3NcIiwgYCR7cGxhbi50b3RhbFJvd3N9YCk7XG5cbiAgICBjb25zdCBsb2FkTW9yZVJvdyA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInRyXCIsXG4gICAgICAgIHsgY2xhc3M6IFwicmVzdWx0cy1sb2FkLW1vcmVcIiB9LFxuICAgICAgICBbXCJ0ZFwiLFxuICAgICAgICAgICAgeyBjb2xzcGFuOiBgJHtwcmlvcml0eVN0YXRzLmxlbmd0aCArIDZ9YCB9LFxuICAgICAgICAgICAgW1wiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWxvYWQtbW9yZV9fYnV0dG9uXCIsIHR5cGU6IFwiYnV0dG9uXCIgfSxcbiAgICAgICAgICAgICAgICBcIkxvYWQgbW9yZSByZXN1bHRzXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgIF0pO1xuICAgIGNvbnN0IGxvYWRNb3JlQnV0dG9uID0gbG9hZE1vcmVSb3cucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKTtcbiAgICBpZiAoIShsb2FkTW9yZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgbGV0IHJlbmRlcmVyOiBQcm9ncmVzc2l2ZUJhdGNoUmVuZGVyZXI8bnVtYmVyLCBIVE1MVGFibGVSb3dFbGVtZW50PjtcbiAgICBjb25zdCByZXF1ZXN0TW9yZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFyZW5kZXJlci5jb250aW51ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbG9hZE1vcmVSb3cucmVtb3ZlKCk7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXJlbmRlci1zdGF0ZVwiLCBcInJlbmRlcmluZ1wiKTtcbiAgICB9O1xuICAgIGxvYWRNb3JlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByZXF1ZXN0TW9yZSk7XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IHR5cGVvZiBJbnRlcnNlY3Rpb25PYnNlcnZlciA9PT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICA6IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihlbnRyaWVzID0+IHtcbiAgICAgICAgICAgIGlmIChlbnRyaWVzLnNvbWUoZW50cnkgPT4gZW50cnkuaXNJbnRlcnNlY3RpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdE1vcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgcm9vdDogbnVsbCxcbiAgICAgICAgICAgIHJvb3RNYXJnaW46IFwiMzIwcHggMHB4XCIsXG4gICAgICAgIH0pO1xuICAgIGFjdGl2ZVJlc3VsdHNPYnNlcnZlciA9IG9ic2VydmVyO1xuXG4gICAgcmVuZGVyZXIgPSBuZXcgUHJvZ3Jlc3NpdmVCYXRjaFJlbmRlcmVyPG51bWJlciwgSFRNTFRhYmxlUm93RWxlbWVudD4oe1xuICAgICAgICBzY2hlZHVsZXI6IGJyb3dzZXJGcmFtZVNjaGVkdWxlcixcbiAgICAgICAgbm93OiAoKSA9PiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgICAgaW5pdGlhbFJvd3M6IElOSVRJQUxfUkVTVUxUX1JPV1MsXG4gICAgICAgIHJvd3NQZXJSZXF1ZXN0OiBSRVNVTFRfUk9XU19QRVJfUkVRVUVTVCxcbiAgICAgICAgbWF4Um93c1BlckZyYW1lOiBNQVhfUkVTVUxUX1JPV1NfUEVSX0ZSQU1FLFxuICAgICAgICBmcmFtZUJ1ZGdldE1zOiBSRVNVTFRfRlJBTUVfQlVER0VUX01TLFxuICAgICAgICBjcmVhdGU6IGluZGV4ID0+IHBsYW4uY3JlYXRlUm93KGluZGV4KSxcbiAgICAgICAgY29tbWl0KHJvd3MsIHN0YXRlKSB7XG4gICAgICAgICAgICBpZiAocmVuZGVyVmVyc2lvbiAhPT0gcmVzdWx0c1JlbmRlclZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2FkTW9yZVJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kKC4uLnJvd3MpO1xuICAgICAgICAgICAgdGFibGVCb2R5LmFwcGVuZChmcmFnbWVudCk7XG4gICAgICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyZWQtcm93c1wiLCBgJHtzdGF0ZS5yZW5kZXJlZH1gKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGF1c2Uoc3RhdGUpIHtcbiAgICAgICAgICAgIGlmIChyZW5kZXJWZXJzaW9uICE9PSByZXN1bHRzUmVuZGVyVmVyc2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmQobG9hZE1vcmVSb3cpO1xuICAgICAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXItc3RhdGVcIiwgXCJwYXJ0aWFsXCIpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdHNTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgYFNob3dpbmcgJHtzdGF0ZS5yZW5kZXJlZH0gb2YgJHtzdGF0ZS50b3RhbH0gbWF0Y2hpbmcgaXRlbXNgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZShzdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHJlbmRlclZlcnNpb24gIT09IHJlc3VsdHNSZW5kZXJWZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGxvYWRNb3JlUm93LnJlbW92ZSgpO1xuICAgICAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXItc3RhdGVcIiwgXCJjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9XG4gICAgICAgICAgICAgICAgICAgIGAke3N0YXRlLnRvdGFsfSBtYXRjaGluZyAke3N0YXRlLnRvdGFsID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmVSZXN1bHRzUmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICByZW5kZXJlci5zdGFydChBcnJheS5mcm9tKHsgbGVuZ3RoOiBwbGFuLnRvdGFsUm93cyB9LCAoXywgaW5kZXgpID0+IGluZGV4KSk7XG4gICAgb2JzZXJ2ZXI/Lm9ic2VydmUobG9hZE1vcmVSb3cpO1xufVxuXG5sZXQgcmVzdWx0c1RhYmxlU2Nyb2xsQm91bmQgPSBmYWxzZTtcbmxldCByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCByZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQgPSBmYWxzZTtcblxuLyoqIEtlZXAgdGhlIHRvcCBjb2x1bW4gc2Nyb2xsZXIgd2lkdGggYW5kIHNjcm9sbExlZnQgYWxpZ25lZCB3aXRoIHRoZSByZXN1bHRzIHRhYmxlLiAqL1xuZnVuY3Rpb24gc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpIHtcbiAgICBjb25zdCB0YWJsZVNjcm9sbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVTY3JvbGxcIik7XG4gICAgY29uc3QgdGFibGVIU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxcIik7XG4gICAgY29uc3Qgc3BhY2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxTcGFjZXJcIik7XG4gICAgY29uc3QgY29sdW1uUGFuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUNvbHVtblBhblwiKTtcbiAgICBpZiAoISh0YWJsZVNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHRhYmxlSFNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHNwYWNlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGNvbHVtblBhbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHRzVGFibGVTY3JvbGxCb3VuZCkge1xuICAgICAgICByZXN1bHRzVGFibGVTY3JvbGxCb3VuZCA9IHRydWU7XG4gICAgICAgIGxldCBzeW5jaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IG1pcnJvciA9IChzb3VyY2U6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3luY2luZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN5bmNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGFyZ2V0LnNjcm9sbExlZnQgPSBzb3VyY2Uuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHN5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGFibGVTY3JvbGwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBtaXJyb3IodGFibGVTY3JvbGwsIHRhYmxlSFNjcm9sbCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgdGFibGVIU2Nyb2xsLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgbWlycm9yKHRhYmxlSFNjcm9sbCwgdGFibGVTY3JvbGwpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcbiAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXIub2JzZXJ2ZSh0YWJsZVNjcm9sbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlU2Nyb2xsLnF1ZXJ5U2VsZWN0b3IoXCJ0YWJsZVwiKTtcbiAgICBpZiAoISh0YWJsZSBpbnN0YW5jZW9mIEhUTUxUYWJsZUVsZW1lbnQpKSB7XG4gICAgICAgIGNvbHVtblBhbi5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBcIjBweFwiO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudFdpZHRoID0gTWF0aC5tYXgodGFibGUuc2Nyb2xsV2lkdGgsIHRhYmxlU2Nyb2xsLnNjcm9sbFdpZHRoKTtcbiAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBgJHtjb250ZW50V2lkdGh9cHhgO1xuICAgIGNvbnN0IG5lZWRzSG9yaXpvbnRhbFNjcm9sbCA9IGNvbnRlbnRXaWR0aCA+IHRhYmxlU2Nyb2xsLmNsaWVudFdpZHRoICsgMTtcbiAgICBjb25zdCB3YXNIaWRkZW4gPSBjb2x1bW5QYW4uaGlkZGVuO1xuICAgIGNvbHVtblBhbi5oaWRkZW4gPSAhbmVlZHNIb3Jpem9udGFsU2Nyb2xsO1xuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ/LmlzU2FtZU5vZGUodGFibGVIU2Nyb2xsKSkge1xuICAgICAgICB0YWJsZUhTY3JvbGwuc2Nyb2xsTGVmdCA9IHRhYmxlU2Nyb2xsLnNjcm9sbExlZnQ7XG4gICAgfVxuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgd2FzSGlkZGVuICYmICFyZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQpIHtcbiAgICAgICAgcmVzdWx0c0NvbHVtblBhblJldmVhbGVkID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5hZGQoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgfSwgMjQwKTtcbiAgICB9XG4gICAgaWYgKCFuZWVkc0hvcml6b250YWxTY3JvbGwpIHtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpIHtcbiAgICBjb25zdCBsZXZlbERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVsRGlzcGxheVwiKTtcbiAgICBpZiAoIShsZXZlbERpc3BsYXkgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbGV2ZWxyYW5nZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBsZXZlbERpc3BsYXkudGV4dENvbnRlbnQgPSBgTWF4IGxldmVsIHJlcXVpcmVtZW50OiAke2xldmVscmFuZ2UudmFsdWV9YDtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNwbGF5VXBkYXRlcygpIHtcbiAgICBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKTtcbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBuYW1lZmlsdGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcblxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgZW5jaGFudFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyAvXigoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLyA6IC9eTWF4ICgoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLztcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VyID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gXCJNYXggJDFcIiA6IFwiJDFcIjtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChub2RlKS5zcGxpdChcIitcIikubWFwKHMgPT4gcy5yZXBsYWNlKHJlZ2V4LCByZXBsYWNlcikpLmpvaW4oXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSwgbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5zZXREaXNwbGF5VXBkYXRlcygpO1xuXG5mdW5jdGlvbiBzZXRNb2JpbGVGaWx0ZXJDb250cm9scygpIHtcbiAgICBjb25zdCBmaWx0ZXJUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlclRvZ2dsZVwiKTtcbiAgICBjb25zdCBjbG9zZUZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlRmlsdGVyc1wiKTtcbiAgICBjb25zdCBmaWx0ZXJQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbFJhaWxcIik7XG4gICAgY29uc3QgZmlsdGVyQmFja2Ryb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlckJhY2tkcm9wXCIpO1xuICAgIGlmICghKGZpbHRlclRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGNsb3NlRmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlclBhbmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyQmFja2Ryb3AgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b2dnbGVCdXR0b24gPSBmaWx0ZXJUb2dnbGU7XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjbG9zZUZpbHRlcnM7XG4gICAgY29uc3QgcGFuZWwgPSBmaWx0ZXJQYW5lbDtcbiAgICBjb25zdCBiYWNrZHJvcEJ1dHRvbiA9IGZpbHRlckJhY2tkcm9wO1xuXG4gICAgZnVuY3Rpb24gc2V0T3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICB0b2dnbGVCdXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBgJHtvcGVufWApO1xuICAgICAgICBiYWNrZHJvcEJ1dHRvbi5oaWRkZW4gPSAhb3BlbjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZmlsdGVycy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgY29uc3QgbmFtZUZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgICAgIGlmIChuYW1lRmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvY3VzQWZ0ZXJPcGVuID0gKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnByb3BlcnR5TmFtZSAhPT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIGZvY3VzQWZ0ZXJPcGVuKTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgIG5hbWVGaWx0ZXIuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbi5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKHRydWUpKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGJhY2tkcm9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgIT09IFwiVGFiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IEFycmF5LmZyb20ocGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzdW1tYXJ5LCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICkpLmZpbHRlcihlbGVtZW50ID0+IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBsYXN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZmlyc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGFzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZXZlbnQuc2hpZnRLZXlcbiAgICAgICAgICAgICYmICghcGFuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgfHwgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gbGFzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmlyc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3aW5kb3cubWF0Y2hNZWRpYShcIihtaW4td2lkdGg6IDg4MHB4KVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICh7IG1hdGNoZXMgfSkgPT4ge1xuICAgICAgICBpZiAobWF0Y2hlcyAmJiBwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5zZXRNb2JpbGVGaWx0ZXJDb250cm9scygpO1xuXG5mdW5jdGlvbiBzZXRSZXNldEZpbHRlckNvbnRyb2woKSB7XG4gICAgY29uc3QgcmVzZXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldEZpbHRlcnNcIik7XG4gICAgY29uc3QgcmVmaW5lbWVudFN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmaW5lbWVudFN0YXR1c1wiKTtcbiAgICBpZiAoIShyZXNldEZpbHRlcnMgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShyZWZpbmVtZW50U3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzZXRGaWx0ZXJzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHJlZmluZW1lbnRTdGF0dXMudGV4dENvbnRlbnQgPSBcIlJlc2V0dGluZyBmaWx0ZXJz4oCmXCI7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuY2xlYXJfYWxsKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn1cblxuc2V0UmVzZXRGaWx0ZXJDb250cm9sKCk7XG5cbmZ1bmN0aW9uIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCkge1xuICAgIGNvbnN0IHByaW9yaXR5X2dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9ncm91cFwiKTtcbiAgICBpZiAoIShwcmlvcml0eV9ncm91cCBpbnN0YW5jZW9mIEhUTUxGaWVsZFNldEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik7XG4gICAgaWYgKCEocGFydHNGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYXJ0c1NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnYWNoYVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0c0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzX2dyb3VwXCIpO1xuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgY29uc3QgbG9hZGluZ0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdDb3B5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19kZXRhaWxcIilcbiAgICAgICAgPz8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19jb3B5IHNwYW5cIik7XG4gICAgY29uc3QgbG9hZGluZ0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX2dyb3VwXCIpO1xuICAgIGlmICghKHJlc3VsdHNTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShsb2FkaW5nTGFiZWwgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdDb3B5IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJ0cnVlXCIpO1xuICAgIGxvYWRpbmdHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICBzZXRJdGVtVHlwZVNlbGVjdG9yRnVuY3Rpb25hbGl0eSgpO1xuICAgIHJlc3RvcmVTZWxlY3Rpb24oKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkb3dubG9hZEl0ZW1zKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIkl0ZW0gZGF0YSB1bmF2YWlsYWJsZVwiO1xuICAgICAgICBsb2FkaW5nTGFiZWwudGV4dENvbnRlbnQgPSBcIkNvdWxkIG5vdCBsb2FkIGVxdWlwbWVudCBkYXRhXCI7XG4gICAgICAgIGxvYWRpbmdDb3B5LnRleHRDb250ZW50ID0gXCJDaGVjayB0aGUgcHJldmlldyBzZXJ2ZXIgY29ubmVjdGlvbiwgdGhlbiByZWxvYWQgdGhpcyBwYWdlLlwiO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICBsb2FkaW5nR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2hvd19hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJoaWRlX2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBtYXhMZXZlbCA9IGdldE1heEl0ZW1MZXZlbCgpO1xuICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHtNYXRoLm1pbihwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKSwgbWF4TGV2ZWwpfWA7XG4gICAgbGV2ZWxyYW5nZS5tYXggPSBgJHttYXhMZXZlbH1gO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgbG9hZGluZ0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJVc2UgdGhlIHVwL2Rvd24gYXJyb3dzLCBvciBkcmFnIGEgc3RhdCwgdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBtb3ZlIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVVwID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBpZiAocHJpb3JpdHlVcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICFwcmlvcml0eVVwLmRpc2FibGVkKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByaW9yaXR5VXAuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwidXBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5RG93biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAocHJpb3JpdHlEb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiYgIXByaW9yaXR5RG93bi5kaXNhYmxlZCkge1xuICAgICAgICBjb25zdCByb3cgPSBwcmlvcml0eURvd24uY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwiZG93blwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbFwiKTtcbiAgICBpZiAoZXhjbHVkZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdG9yZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIpO1xuICAgIGlmIChyZXN0b3JlQnV0dG9uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuLyoqXG4gKiBJbnNlcnQgYGNhbmRpZGF0ZWAgaW50byBhIGJlc3QtZmlyc3QgcmFua2luZy5cbiAqIEhpZ2hlciBjb21wYXJhdG9yIHZhbHVlcyBtZWFuIHRoZSBsZWZ0LWhhbmQgaXRlbSByYW5rcyBiZXR0ZXIuXG4gKiBFdmVyeSBjYW5kaWRhdGUgaXMgcmV0YWluZWQgc28gdGhlIFVJIGNhbiBzaG93IHRoZSBmdWxsIGZpbHRlcmVkIGludmVudG9yeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdEJ5UHJpb3JpdHk8VD4oXG4gICAgY3VycmVudDogVFtdLFxuICAgIGNhbmRpZGF0ZTogVCxcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBUW10ge1xuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgfVxuXG4gICAgbGV0IGluc2VydEF0ID0gY3VycmVudC5sZW5ndGg7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGN1cnJlbnQubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgIGxldCBkZWNpZGVkID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjb21wYXJhdG9yIG9mIGNvbXBhcmF0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wYXJhdG9yKGN1cnJlbnRbaW5kZXhdLCBjYW5kaWRhdGUpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGRlY2lkZWQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlY2lkZWQgPCAwKSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50W2luZGV4XSBpcyB3b3JzZSB0aGFuIGNhbmRpZGF0ZTogaW5zZXJ0IGJlZm9yZSBpdC5cbiAgICAgICAgICAgIGluc2VydEF0ID0gaW5kZXg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWNpZGVkID4gMDogY3VycmVudCBpdGVtIGlzIGJldHRlcjsga2VlcCBzY2FubmluZy5cbiAgICAgICAgLy8gZGVjaWRlZCA9PT0gMDogZXhhY3QgdGllOyBrZWVwIHNjYW5uaW5nIHNvIHRpZXMgc3RheSBzdGFibGUvRklGTy5cbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKDAsIGluc2VydEF0KSxcbiAgICAgICAgY2FuZGlkYXRlLFxuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKGluc2VydEF0KSxcbiAgICBdO1xufVxuXG4vKipcbiAqIE1lcmdlIGluZGVwZW5kZW50bHkgcmFua2VkIHJ1bnMgaW50byBvbmUgc3RhYmxlIGJlc3QtZmlyc3QgcmFua2luZy5cbiAqIEVhY2ggaW5wdXQgbXVzdCBhbHJlYWR5IHVzZSB0aGUgc2FtZSBgcHJpb3JpemVyYCBvcmRlcmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlUHJpb3JpdHlSYW5raW5nczxUPihcbiAgICByYW5raW5nczogcmVhZG9ubHkgKHJlYWRvbmx5IFRbXSlbXSxcbiAgICBwcmlvcml6ZXI6IChjdXJyZW50OiBUW10sIGNhbmRpZGF0ZTogVCkgPT4gVFtdLFxuKTogVFtdIHtcbiAgICBjb25zdCBjdXJzb3JzID0gcmFua2luZ3MubWFwKCgpID0+IDApO1xuICAgIGNvbnN0IG1lcmdlZDogVFtdID0gW107XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBsZXQgd2lubmVyUnVuID0gLTE7XG4gICAgICAgIGZvciAobGV0IHJ1biA9IDA7IHJ1biA8IHJhbmtpbmdzLmxlbmd0aDsgcnVuICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChjdXJzb3JzW3J1bl0gPj0gcmFua2luZ3NbcnVuXS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3aW5uZXJSdW4gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgd2lubmVyUnVuID0gcnVuO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB3aW5uZXIgPSByYW5raW5nc1t3aW5uZXJSdW5dW2N1cnNvcnNbd2lubmVyUnVuXV07XG4gICAgICAgICAgICBjb25zdCBjaGFsbGVuZ2VyID0gcmFua2luZ3NbcnVuXVtjdXJzb3JzW3J1bl1dO1xuICAgICAgICAgICAgaWYgKHByaW9yaXplcihbd2lubmVyXSwgY2hhbGxlbmdlcilbMF0gPT09IGNoYWxsZW5nZXIpIHtcbiAgICAgICAgICAgICAgICB3aW5uZXJSdW4gPSBydW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2lubmVyUnVuID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1lcmdlZC5wdXNoKHJhbmtpbmdzW3dpbm5lclJ1bl1bY3Vyc29yc1t3aW5uZXJSdW5dXSk7XG4gICAgICAgIGN1cnNvcnNbd2lubmVyUnVuXSArPSAxO1xuICAgIH1cbn1cbiIsIi8qKiBJbnRlcm5hbCBwcmlvcml0eSBrZXlzIOKGkiBzaG9ydCB0YWJsZSBoZWFkZXIgKyBodW1hbiBmdWxsIG5hbWUgZm9yIHRvb2x0aXBzLiAqL1xuY29uc3QgUFJJT1JJVFlfU1RBVF9IRUFERVJfQUJCUkVWOiBSZWFkb25seTxcbiAgICBSZWNvcmQ8c3RyaW5nLCB7IHJlYWRvbmx5IHNob3J0OiBzdHJpbmc7IHJlYWRvbmx5IGZ1bGw6IHN0cmluZyB9PlxuPiA9IHtcbiAgICBcIk1vdiBTcGVlZFwiOiB7IHNob3J0OiBcIk1TXCIsIGZ1bGw6IFwiTW92IFNwZWVkXCIgfSxcbiAgICBcIlF1aWNrc2xvdHNcIjogeyBzaG9ydDogXCJRU1wiLCBmdWxsOiBcIlF1aWNrIFNsb3RzXCIgfSxcbiAgICBcIkJ1ZmZzbG90c1wiOiB7IHNob3J0OiBcIkJTXCIsIGZ1bGw6IFwiQnVmZiBTbG90c1wiIH0sXG59O1xuXG5leHBvcnQgdHlwZSBQcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5ID0ge1xuICAgIHJlYWRvbmx5IHNob3J0OiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZnVsbDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGFiYnJldmlhdGVkOiBib29sZWFuO1xufTtcblxuLyoqIE1hcCBhIHByaW9yaXR5IHN0YXQga2V5IChvciBjb21iaW5lZCBcIkErQlwiKSB0byBzaG9ydCBoZWFkZXIgdGV4dCArIGZ1bGwgdG9vbHRpcCBuYW1lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkoc3RhdDogc3RyaW5nKTogUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB7XG4gICAgY29uc3QgcGFydHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICBjb25zdCBtYXBwZWQgPSBwYXJ0cy5tYXAoKHBhcnQpID0+IHtcbiAgICAgICAgY29uc3Qga25vd24gPSBQUklPUklUWV9TVEFUX0hFQURFUl9BQkJSRVZbcGFydF07XG4gICAgICAgIHJldHVybiBrbm93biA/PyB7IHNob3J0OiBwYXJ0LCBmdWxsOiBwYXJ0IH07XG4gICAgfSk7XG4gICAgY29uc3Qgc2hvcnQgPSBtYXBwZWQubWFwKChwYXJ0KSA9PiBwYXJ0LnNob3J0KS5qb2luKFwiK1wiKTtcbiAgICBjb25zdCBmdWxsID0gbWFwcGVkLm1hcCgocGFydCkgPT4gcGFydC5mdWxsKS5qb2luKFwiK1wiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaG9ydCxcbiAgICAgICAgZnVsbCxcbiAgICAgICAgYWJicmV2aWF0ZWQ6IHNob3J0ICE9PSBmdWxsLFxuICAgIH07XG59XG4iLCJleHBvcnQgdHlwZSBGcmFtZVNjaGVkdWxlciA9IHtcbiAgICByZXF1ZXN0KGNhbGxiYWNrOiBGcmFtZVJlcXVlc3RDYWxsYmFjayk6IG51bWJlcixcbiAgICBjYW5jZWwoaGFuZGxlOiBudW1iZXIpOiB2b2lkLFxufTtcblxuZXhwb3J0IHR5cGUgUHJvZ3Jlc3NpdmVCYXRjaFN0YXRlID0ge1xuICAgIHZlcnNpb246IG51bWJlcixcbiAgICByZW5kZXJlZDogbnVtYmVyLFxuICAgIHRvdGFsOiBudW1iZXIsXG4gICAgY29tcGxldGU6IGJvb2xlYW4sXG59O1xuXG50eXBlIFByb2dyZXNzaXZlQmF0Y2hPcHRpb25zPElucHV0LCBPdXRwdXQ+ID0ge1xuICAgIHNjaGVkdWxlcjogRnJhbWVTY2hlZHVsZXIsXG4gICAgbm93KCk6IG51bWJlcixcbiAgICBpbml0aWFsUm93czogbnVtYmVyLFxuICAgIHJvd3NQZXJSZXF1ZXN0OiBudW1iZXIsXG4gICAgbWF4Um93c1BlckZyYW1lOiBudW1iZXIsXG4gICAgZnJhbWVCdWRnZXRNczogbnVtYmVyLFxuICAgIGNyZWF0ZShpbnB1dDogSW5wdXQpOiBPdXRwdXQsXG4gICAgY29tbWl0KGJhdGNoOiByZWFkb25seSBPdXRwdXRbXSwgc3RhdGU6IFByb2dyZXNzaXZlQmF0Y2hTdGF0ZSk6IHZvaWQsXG4gICAgcGF1c2Uoc3RhdGU6IFByb2dyZXNzaXZlQmF0Y2hTdGF0ZSk6IHZvaWQsXG4gICAgY29tcGxldGUoc3RhdGU6IFByb2dyZXNzaXZlQmF0Y2hTdGF0ZSk6IHZvaWQsXG59O1xuXG5leHBvcnQgY2xhc3MgUHJvZ3Jlc3NpdmVCYXRjaFJlbmRlcmVyPElucHV0LCBPdXRwdXQ+IHtcbiAgICBwcml2YXRlIHZlcnNpb24gPSAwO1xuICAgIHByaXZhdGUgZnJhbWVIYW5kbGU6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGlucHV0czogcmVhZG9ubHkgSW5wdXRbXSA9IFtdO1xuICAgIHByaXZhdGUgcmVuZGVyZWQgPSAwO1xuICAgIHByaXZhdGUgcnVubmluZyA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBQcm9ncmVzc2l2ZUJhdGNoT3B0aW9uczxJbnB1dCwgT3V0cHV0Pikge31cblxuICAgIHN0YXJ0KGlucHV0czogcmVhZG9ubHkgSW5wdXRbXSk6IG51bWJlciB7XG4gICAgICAgIHRoaXMuY2FuY2VsRnJhbWUoKTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9ICsrdGhpcy52ZXJzaW9uO1xuICAgICAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICAgICAgdGhpcy5yZW5kZXJlZCA9IDA7XG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29tbWl0Um93cyhcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICBNYXRoLm1pbihpbnB1dHMubGVuZ3RoLCBNYXRoLm1heCgxLCB0aGlzLm9wdGlvbnMuaW5pdGlhbFJvd3MpKSxcbiAgICAgICAgICAgIE1hdGgubWF4KDEsIHRoaXMub3B0aW9ucy5pbml0aWFsUm93cyksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgIH1cblxuICAgIGNvbnRpbnVlKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nIHx8IHRoaXMucmVuZGVyZWQgPj0gdGhpcy5pbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMudmVyc2lvbjtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gTWF0aC5taW4oXG4gICAgICAgICAgICB0aGlzLmlucHV0cy5sZW5ndGgsXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVkICsgTWF0aC5tYXgoMSwgdGhpcy5vcHRpb25zLnJvd3NQZXJSZXF1ZXN0KSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHRoaXMub3B0aW9ucy5zY2hlZHVsZXIucmVxdWVzdCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bkZyYW1lKHZlcnNpb24sIHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjYW5jZWwoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FuY2VsRnJhbWUoKTtcbiAgICAgICAgdGhpcy52ZXJzaW9uICs9IDE7XG4gICAgICAgIHRoaXMuaW5wdXRzID0gW107XG4gICAgICAgIHRoaXMucmVuZGVyZWQgPSAwO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJ1bkZyYW1lKHZlcnNpb246IG51bWJlciwgdGFyZ2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHZlcnNpb24gIT09IHRoaXMudmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWl0Um93cyhcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4Um93c1BlckZyYW1lLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmZyYW1lQnVkZ2V0TXMsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb21taXRSb3dzKFxuICAgICAgICB2ZXJzaW9uOiBudW1iZXIsXG4gICAgICAgIHRhcmdldDogbnVtYmVyLFxuICAgICAgICBsaW1pdDogbnVtYmVyLFxuICAgICAgICBidWRnZXRNcz86IG51bWJlcixcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhcnRlZEF0ID0gdGhpcy5vcHRpb25zLm5vdygpO1xuICAgICAgICBjb25zdCBiYXRjaDogT3V0cHV0W10gPSBbXTtcbiAgICAgICAgd2hpbGUgKHRoaXMucmVuZGVyZWQgPCB0YXJnZXQgJiYgYmF0Y2gubGVuZ3RoIDwgbGltaXQpIHtcbiAgICAgICAgICAgIGJhdGNoLnB1c2godGhpcy5vcHRpb25zLmNyZWF0ZSh0aGlzLmlucHV0c1t0aGlzLnJlbmRlcmVkXSkpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlZCArPSAxO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGJ1ZGdldE1zICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMubm93KCkgLSBzdGFydGVkQXQgPj0gYnVkZ2V0TXNcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZlcnNpb24gIT09IHRoaXMudmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXRlOiBQcm9ncmVzc2l2ZUJhdGNoU3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJzaW9uLFxuICAgICAgICAgICAgcmVuZGVyZWQ6IHRoaXMucmVuZGVyZWQsXG4gICAgICAgICAgICB0b3RhbDogdGhpcy5pbnB1dHMubGVuZ3RoLFxuICAgICAgICAgICAgY29tcGxldGU6IHRoaXMucmVuZGVyZWQgPT09IHRoaXMuaW5wdXRzLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbW1pdChiYXRjaCwgc3RhdGUpO1xuICAgICAgICBpZiAodmVyc2lvbiAhPT0gdGhpcy52ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb21wbGV0ZShzdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVuZGVyZWQgPj0gdGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYXVzZShzdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHRoaXMub3B0aW9ucy5zY2hlZHVsZXIucmVxdWVzdCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bkZyYW1lKHZlcnNpb24sIHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsRnJhbWUoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lSGFuZGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnMuc2NoZWR1bGVyLmNhbmNlbCh0aGlzLmZyYW1lSGFuZGxlKTtcbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBicm93c2VyRnJhbWVTY2hlZHVsZXI6IEZyYW1lU2NoZWR1bGVyID0ge1xuICAgIHJlcXVlc3QoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk7XG4gICAgfSxcbiAgICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGhhbmRsZSk7XG4gICAgfSxcbn07XG4iLCIvKipcbiAqIFJlc29sdmUgd2hpY2ggYm9zcyBndWFyZGlhbihzKSBhcHBlYXIgb24gYSBHdWFyZGlhbiAvIEJvc3Mgc3RhZ2UuXG4gKiBEYXRhIGNvbWVzIGZyb20gSkZUU0UgR3VhcmRpYW5TdGFnZXMuanNvbiAoQm9zc0d1YXJkaWFuICsgc2lkZSBwb29scylcbiAqIGFuZCBCb3NzR3VhcmRpYW5JbmZvX0luaTMueG1sIC8gR3VhcmRpYW5JbmZvLnhtbCBuYW1lcy5cbiAqL1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NJbmZvID0ge1xuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHJlc0lkPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGxldmVsPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGhwQmFzZT86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlR3VhcmRpYW5JbmZvID0ge1xuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzU2lkZVBvb2xzID0ge1xuICAgIHJlYWRvbmx5IGxlZnQ6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIHJlYWRvbmx5IG1pZGRsZTogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgcmVhZG9ubHkgcmlnaHQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzU3RhZ2VFbnRyeSA9IHtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbWFwSWQ/OiBudW1iZXIgfCBudWxsO1xuICAgIHJlYWRvbmx5IGlzQm9zc1N0YWdlOiBib29sZWFuO1xuICAgIHJlYWRvbmx5IGJvc3NJZHM6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIHJlYWRvbmx5IHNpZGVHdWFyZGlhbklkcz86IFN0YWdlQm9zc1NpZGVQb29scztcbiAgICByZWFkb25seSBleHBNdWx0aXBsaWVyPzogbnVtYmVyIHwgbnVsbDtcbiAgICByZWFkb25seSBib3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzPzogbnVtYmVyIHwgbnVsbDtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc0NhdGFsb2cgPSB7XG4gICAgcmVhZG9ubHkgYm9zc2VzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgU3RhZ2VCb3NzSW5mbz4+O1xuICAgIHJlYWRvbmx5IGd1YXJkaWFucz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFN0YWdlR3VhcmRpYW5JbmZvPj47XG4gICAgcmVhZG9ubHkgc3RhZ2VzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgU3RhZ2VCb3NzU3RhZ2VFbnRyeT4+O1xuICAgIHJlYWRvbmx5IGJ5TWFwSWQ/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCByZWFkb25seSBzdHJpbmdbXT4+O1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzUHJvamVjdGlvbiA9IHtcbiAgICByZWFkb25seSBzdGFnZU5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSBtYXBJZD86IG51bWJlcjtcbiAgICByZWFkb25seSBpc0Jvc3NTdGFnZTogYm9vbGVhbjtcbiAgICAvKiogUHJpbWFyeSBib3NzIGd1YXJkaWFucyBmb3IgdGhpcyBzdGFnZSAodW5pcXVlIGJ5IGlkKS4gKi9cbiAgICByZWFkb25seSBib3NzZXM6IHJlYWRvbmx5IFN0YWdlQm9zc0luZm9bXTtcbiAgICAvKiogVW5pcXVlIGJvc3MgZGlzcGxheSBuYW1lcyAoZGVkdXBlZCwgb3JkZXItcHJlc2VydmluZykuICovXG4gICAgcmVhZG9ubHkgYm9zc05hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbiAgICAvKiogU2lkZS1sYW5lIGd1YXJkaWFuIG5hbWVzIHRoYXQgc3Bhd24gd2l0aCB0aGUgYm9zcyBiYXR0bGUgKGxlZnQvcmlnaHQvbWlkZGxlKS4gKi9cbiAgICByZWFkb25seSBzaWRlR3VhcmRpYW5OYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG59O1xuXG5mdW5jdGlvbiB1bmlxdWVOYW1lcyhuYW1lczogcmVhZG9ubHkgc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gbmFtZS50cmltKCk7XG4gICAgICAgIGlmICgha2V5IHx8IHNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW4uYWRkKGtleSk7XG4gICAgICAgIG91dC5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVCb3NzKGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csIGlkOiBudW1iZXIpOiBTdGFnZUJvc3NJbmZvIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IGNhdGFsb2cuYm9zc2VzPy5bYCR7aWR9YF07XG4gICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5uYW1lID09PSBcInN0cmluZ1wiICYmIGVudHJ5Lm5hbWUudHJpbSgpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogZW50cnkuaWQgPz8gaWQsXG4gICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLnRyaW0oKSxcbiAgICAgICAgICAgIHJlc0lkOiBlbnRyeS5yZXNJZCxcbiAgICAgICAgICAgIGxldmVsOiBlbnRyeS5sZXZlbCxcbiAgICAgICAgICAgIGhwQmFzZTogZW50cnkuaHBCYXNlLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlR3VhcmRpYW5OYW1lKGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csIGlkOiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGVudHJ5ID0gY2F0YWxvZy5ndWFyZGlhbnM/LltgJHtpZH1gXTtcbiAgICBjb25zdCBuYW1lID0gZW50cnk/Lm5hbWU/LnRyaW0oKTtcbiAgICByZXR1cm4gbmFtZSB8fCB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHNpZGVJZHMocG9vbHM6IFN0YWdlQm9zc1NpZGVQb29scyB8IHVuZGVmaW5lZCk6IG51bWJlcltdIHtcbiAgICBpZiAoIXBvb2xzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIFsuLi4ocG9vbHMubGVmdCA/PyBbXSksIC4uLihwb29scy5taWRkbGUgPz8gW10pLCAuLi4ocG9vbHMucmlnaHQgPz8gW10pXTtcbn1cblxuLyoqXG4gKiBDYW5kaWRhdGUgc3RhZ2Uga2V5cyBmb3IgYSBjaGlwIGxhYmVsIG1hcCBuYW1lLlxuICogQm9zcyDCtyBBdGxhbnRpcyB1c2VzIGBBdGxhbnRpc0Jvc3NgOyBzb21lIGRyb3BzIHVzZSBiYXJlIG1hcCBuYW1lcyB3aXRoIG5lZWRCb3NzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2VCb3NzTG9va3VwS2V5cyhtYXBOYW1lOiBzdHJpbmcsIG5lZWRCb3NzOiBib29sZWFuKTogcmVhZG9ubHkgc3RyaW5nW10ge1xuICAgIGNvbnN0IGtleXMgPSBbbWFwTmFtZV07XG4gICAgaWYgKG5lZWRCb3NzICYmICEvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChgJHttYXBOYW1lfUJvc3NgKTtcbiAgICB9XG4gICAgaWYgKCFuZWVkQm9zcyAmJiAvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChtYXBOYW1lLnJlcGxhY2UoL0Jvc3MkL2ksIFwiXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIGVudHJ5SGFzQm9zc2VzKGVudHJ5OiBTdGFnZUJvc3NTdGFnZUVudHJ5IHwgdW5kZWZpbmVkKTogZW50cnkgaXMgU3RhZ2VCb3NzU3RhZ2VFbnRyeSB7XG4gICAgcmV0dXJuICEhZW50cnkgJiYgQXJyYXkuaXNBcnJheShlbnRyeS5ib3NzSWRzKSAmJiBlbnRyeS5ib3NzSWRzLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU3RhZ2VCb3NzRW50cnkoXG4gICAgbWFwTmFtZTogc3RyaW5nLFxuICAgIG5lZWRCb3NzOiBib29sZWFuLFxuICAgIGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csXG4pOiBTdGFnZUJvc3NTdGFnZUVudHJ5IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBzdGFnZXMgPSBjYXRhbG9nLnN0YWdlcztcbiAgICBpZiAoIXN0YWdlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBrZXlzID0gc3RhZ2VCb3NzTG9va3VwS2V5cyhtYXBOYW1lLCBuZWVkQm9zcyk7XG4gICAgLy8gUHJlZmVyIGFuIGVudHJ5IHRoYXQgYWN0dWFsbHkgbGlzdHMgQm9zc0d1YXJkaWFuIGlkcyAoZS5nLiBBdGxhbnRpc0Jvc3Mgb3ZlciBBdGxhbnRpcykuXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBjb25zdCBlbnRyeSA9IHN0YWdlc1trZXldO1xuICAgICAgICBpZiAoZW50cnlIYXNCb3NzZXMoZW50cnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTWFwSWQgYnJpZGdlOiBiYXJlIG1hcCBuYW1lcyBzaGFyZSBNYXBJZCB3aXRoIHRoZSBib3NzLXN0YWdlIHNpYmxpbmcuXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBjb25zdCBzZWVkID0gc3RhZ2VzW2tleV07XG4gICAgICAgIGlmIChzZWVkPy5tYXBJZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaWJsaW5ncyA9IGNhdGFsb2cuYnlNYXBJZD8uW2Ake3NlZWQubWFwSWR9YF0gPz8gW107XG4gICAgICAgIGZvciAoY29uc3Qgc2libGluZ05hbWUgb2Ygc2libGluZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSBzdGFnZXNbc2libGluZ05hbWVdO1xuICAgICAgICAgICAgaWYgKGVudHJ5SGFzQm9zc2VzKHNpYmxpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTGFzdCByZXNvcnQ6IGFueSBtYXRjaGluZyBzdGFnZSByb3cgKG5vbi1ib3NzIFRlbXBsZSwgZXRjLikuXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBpZiAoc3RhZ2VzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFnZXNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFByb2plY3QgdGhlIGJvc3MoZXMpIGFuZCBzaWRlIGd1YXJkaWFucyBmb3IgYSBzdGFnZSBjaGlwLlxuICogU3VwcG9ydHMgbXVsdGktYm9zcyBzdGFnZXMgdmlhIGJvc3NJZHNbXSAoSkZUU0UgY3VycmVudGx5IHNoaXBzIG9uZSBCb3NzR3VhcmRpYW4gcGVyIHN0YWdlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RTdGFnZUJvc3NlcyhcbiAgICBtYXBOYW1lOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZyxcbik6IFN0YWdlQm9zc1Byb2plY3Rpb24ge1xuICAgIGNvbnN0IGVudHJ5ID0gZmluZFN0YWdlQm9zc0VudHJ5KG1hcE5hbWUsIG5lZWRCb3NzLCBjYXRhbG9nKTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFnZU5hbWU6IG1hcE5hbWUsXG4gICAgICAgICAgICBpc0Jvc3NTdGFnZTogbmVlZEJvc3MsXG4gICAgICAgICAgICBib3NzZXM6IFtdLFxuICAgICAgICAgICAgYm9zc05hbWVzOiBbXSxcbiAgICAgICAgICAgIHNpZGVHdWFyZGlhbk5hbWVzOiBbXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBib3NzZXM6IFN0YWdlQm9zc0luZm9bXSA9IFtdO1xuICAgIGNvbnN0IHNlZW5Cb3NzSWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gICAgZm9yIChjb25zdCBpZCBvZiBlbnRyeS5ib3NzSWRzID8/IFtdKSB7XG4gICAgICAgIGlmIChzZWVuQm9zc0lkcy5oYXMoaWQpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuQm9zc0lkcy5hZGQoaWQpO1xuICAgICAgICBjb25zdCBib3NzID0gcmVzb2x2ZUJvc3MoY2F0YWxvZywgaWQpO1xuICAgICAgICBpZiAoYm9zcykge1xuICAgICAgICAgICAgYm9zc2VzLnB1c2goYm9zcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzaWRlR3VhcmRpYW5OYW1lcyA9IHVuaXF1ZU5hbWVzKFxuICAgICAgICBzaWRlSWRzKGVudHJ5LnNpZGVHdWFyZGlhbklkcylcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiByZXNvbHZlR3VhcmRpYW5OYW1lKGNhdGFsb2csIGlkKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKG4pOiBuIGlzIHN0cmluZyA9PiB0eXBlb2YgbiA9PT0gXCJzdHJpbmdcIiksXG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YWdlTmFtZTogZW50cnkubmFtZSxcbiAgICAgICAgbWFwSWQ6IHR5cGVvZiBlbnRyeS5tYXBJZCA9PT0gXCJudW1iZXJcIiA/IGVudHJ5Lm1hcElkIDogdW5kZWZpbmVkLFxuICAgICAgICBpc0Jvc3NTdGFnZTogISFlbnRyeS5pc0Jvc3NTdGFnZSxcbiAgICAgICAgYm9zc2VzLFxuICAgICAgICBib3NzTmFtZXM6IHVuaXF1ZU5hbWVzKGJvc3Nlcy5tYXAoKGIpID0+IGIubmFtZSkpLFxuICAgICAgICBzaWRlR3VhcmRpYW5OYW1lcyxcbiAgICB9O1xufVxuIiwiZXhwb3J0IHR5cGUgVmFyaWFibGVfc3RvcmFnZV90eXBlcyA9IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW47XG5cbnR5cGUgU3RvcmFnZV92YWx1ZSA9IGAke1wic1wiIHwgXCJuXCIgfCBcImJcIn0ke3N0cmluZ31gO1xuXG5mdW5jdGlvbiB2YXJpYWJsZV90b19zdHJpbmcodmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpOiBTdG9yYWdlX3ZhbHVlIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gYHMke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBgbiR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IFwiYjFcIiA6IFwiYjBcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN0cmluZ190b192YXJpYWJsZSh2djogU3RvcmFnZV92YWx1ZSk6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMge1xuICAgIGNvbnN0IHByZWZpeCA9IHZ2WzBdO1xuICAgIGNvbnN0IHZhbHVlID0gdnYuc3Vic3RyaW5nKDEpO1xuICAgIHN3aXRjaCAocHJlZml4KSB7XG4gICAgICAgIGNhc2UgJ3MnOiAvL3N0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICBjYXNlICduJzogLy9udW1iZXJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgY2FzZSAnYic6IC8vYm9vbGVhblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSBcIjFcIiA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gICAgdGhyb3cgYGludmFsaWQgdmFsdWU6ICR7dnZ9YDtcbn1cblxuZnVuY3Rpb24gaXNfc3RvcmFnZV92YWx1ZShrZXk6IHN0cmluZyk6IGtleSBpcyBTdG9yYWdlX3ZhbHVlIHtcbiAgICByZXR1cm4ga2V5Lmxlbmd0aCA+PSAxICYmIFwic25iXCIuaW5jbHVkZXMoa2V5WzBdKTtcbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlX3N0b3JhZ2Uge1xuICAgIHN0YXRpYyBnZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RvcmVkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHN0b3JlZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nX3RvX3ZhcmlhYmxlKHN0b3JlZCk7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nLCB2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcykge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWAsIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZSkpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVsZXRlX3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgIH1cbiAgICBzdGF0aWMgY2xlYXJfYWxsKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9XG4gICAgc3RhdGljIGdldCB2YXJpYWJsZXMoKSB7XG4gICAgICAgIGxldCByZXN1bHQ6IHsgW2tleTogc3RyaW5nXTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxTdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc3RyaW5nX3RvX3ZhcmlhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0iXX0=
