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
      results[item.part].push(item);
    }
  }
  for (const [part, candidates] of Object.entries(results)) {
    results[part] = priorizer.sortAll ? priorizer.sortAll(candidates) : candidates.reduce(priorizer, []);
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
  const comparator = priorizer.compare ?? ((lhs, rhs) => {
    if (priorizer([lhs], rhs)[0] === rhs) {
      return -1;
    }
    if (priorizer([rhs], lhs)[0] === lhs) {
      return 1;
    }
    return 0;
  });
  const displayResults = (0, _priority.mergePriorityRankings)(Object.values(results), comparator);
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
          plan: (0, _itemLookup.getResultsTablePlan)(item => filters.every(filter => filter(item)), itemSource => sourceFilters.every(filter => filter(itemSource)), (0, _priority.createPriorityRanker)(comparators), priorityStats, selectedCharacter)
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
exports.compareByPriority = compareByPriority;
exports.createPriorityRanker = createPriorityRanker;
exports.mergePriorityRankings = mergePriorityRankings;
exports.selectByPriority = selectByPriority;
exports.sortByPriority = sortByPriority;
function compareByPriority(lhs, rhs, comparators) {
  for (const comparator of comparators) {
    const result = comparator(lhs, rhs);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}
/**
 * Rank one complete candidate bucket with a single native stable sort.
 * Higher comparator values rank first; original indexes preserve FIFO ties.
 */
function sortByPriority(items, comparators) {
  return items.map((item, index) => ({
    item,
    index
  })).sort((lhs, rhs) => compareByPriority(rhs.item, lhs.item, comparators) || lhs.index - rhs.index).map(({
    item
  }) => item);
}
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
function createPriorityRanker(comparators) {
  return Object.assign((current, candidate) => selectByPriority(current, candidate, comparators), {
    compare: (lhs, rhs) => compareByPriority(lhs, rhs, comparators),
    sortAll: items => sortByPriority(items, comparators)
  });
}
/**
 * Merge independently ranked runs into one stable best-first ranking.
 * Each input must already use the same `comparator` ordering.
 */
function mergePriorityRankings(rankings, comparator) {
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
      if (comparator(winner, challenger) < 0) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJnYWNoYUFjcXVpc2l0aW9uLnRzIiwiaHRtbC50cyIsIml0ZW1Mb29rdXAudHMiLCJtYWluLnRzIiwicHJpb3JpdHkudHMiLCJwcmlvcml0eVN0YXRIZWFkZXJzLnRzIiwicHJvZ3Jlc3NpdmVSZW5kZXIudHMiLCJzdGFnZUJvc3Nlcy50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWE7RUFDekMsSUFBSSxFQUFFLFNBQVMsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzFDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO0lBQzNFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDOUM7SUFDSjtJQUNBLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDtJQUNKO0lBQ0EsT0FBTyxLQUFLLENBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUNwQyxNQUFNLENBQUUsQ0FBQyxJQUF5QixDQUFDLFlBQVksYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksZ0JBQWdCLENBQUMsQ0FDMUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBcUIsQ0FBQztFQUNwRDtFQUNBLE9BQU8sRUFBRTtBQUNiO0FBRUEsU0FBUyx5QkFBeUIsQ0FBQyxJQUFzQjtFQUNyRCxLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNuQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtNQUNoQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO01BQzVCLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSztNQUMzQix5QkFBeUIsQ0FBQyxLQUFLLENBQUM7SUFDcEM7RUFDSjtBQUNKO0FBRUEsU0FBUyxTQUFTLENBQUMsSUFBc0I7RUFDckMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsYUFBYTtFQUNsRSxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDO0VBQ0o7RUFDQSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsYUFBYTtFQUN6QyxJQUFJLEVBQUUsU0FBUyxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDMUM7RUFDSjtFQUNBLElBQUksU0FBUyxHQUE4QixTQUFTO0VBQ3BELEtBQUssTUFBTSxLQUFLLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtJQUNwQyxJQUFJLEtBQUssWUFBWSxhQUFhLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxnQkFBZ0IsRUFBRTtNQUNqRixTQUFTLEdBQUcsS0FBSztNQUNqQjtJQUNKO0lBQ0EsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLFNBQVMsRUFBRTtNQUNsQyxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFxQjtJQUNwRDtFQUNKO0FBQ0o7QUFFQSxTQUFTLGVBQWUsQ0FBQyxJQUFzQjtFQUMzQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0VBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUU7SUFDVDtFQUNKO0VBQ0EsSUFBSSxZQUFZLEdBQUcsS0FBSztFQUN4QixJQUFJLGNBQWMsR0FBRyxLQUFLO0VBQzFCLElBQUksa0JBQWtCLEdBQUcsS0FBSztFQUM5QixLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRTtJQUNyQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7TUFDZixZQUFZLEdBQUcsSUFBSTtJQUN2QixDQUFDLE1BQ0k7TUFDRCxjQUFjLEdBQUcsSUFBSTtJQUN6QjtJQUNBLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRTtNQUNyQixrQkFBa0IsR0FBRyxJQUFJO0lBQzdCO0VBQ0o7RUFDQSxJQUFJLGtCQUFrQixJQUFJLFlBQVksSUFBSSxjQUFjLEVBQUU7SUFDdEQsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJO0VBQy9CLENBQUMsTUFDSSxJQUFJLFlBQVksRUFBRTtJQUNuQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUk7SUFDckIsTUFBTSxDQUFDLGFBQWEsR0FBRyxLQUFLO0VBQ2hDLENBQUMsTUFDSSxJQUFJLGNBQWMsRUFBRTtJQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDdEIsTUFBTSxDQUFDLGFBQWEsR0FBRyxLQUFLO0VBQ2hDO0VBQ0EsZUFBZSxDQUFDLE1BQU0sQ0FBQztBQUMzQjtBQUVBLFNBQVMsa0JBQWtCLENBQUMsSUFBc0I7RUFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUc7SUFDaEMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU07SUFDdkIsSUFBSSxFQUFFLE1BQU0sWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQ3ZDO0lBQ0o7SUFDQSx5QkFBeUIsQ0FBQyxNQUFNLENBQUM7SUFDakMsZUFBZSxDQUFDLE1BQU0sQ0FBQztFQUMzQixDQUFDLENBQUM7QUFDTjtBQUVBLFNBQVMsbUJBQW1CLENBQUMsSUFBc0I7RUFDL0MsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0lBQ2pDLElBQUksT0FBTyxZQUFZLGFBQWEsRUFBRTtNQUNsQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBcUIsQ0FBQztJQUMvRCxDQUFDLE1BQ0ksSUFBSSxPQUFPLFlBQVksZ0JBQWdCLEVBQUU7TUFDMUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDO0lBQ2hDO0VBQ0o7QUFDSjtBQUVBLFNBQVMsb0JBQW9CLENBQUMsUUFBa0I7RUFDNUMsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7SUFDOUIsSUFBSSxRQUFRLEdBQUcsS0FBSztJQUNwQixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7TUFDckIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO01BQ2hDLFFBQVEsR0FBRyxJQUFJO0lBQ25CO0lBQ0EsSUFBSSxPQUFPLEdBQUcsS0FBSztJQUNuQixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7TUFDckIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO01BQ2hDLE9BQU8sR0FBRyxJQUFJO0lBQ2xCO0lBRUEsTUFBTSxJQUFJLEdBQUcsSUFBQSxnQkFBVSxFQUFDLENBQ3BCLElBQUksRUFDSixDQUNJLE9BQU8sRUFDUDtNQUNJLElBQUksRUFBRSxVQUFVO01BQ2hCLEVBQUUsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7TUFDakMsSUFBSSxPQUFPLElBQUk7UUFBRSxPQUFPLEVBQUU7TUFBUyxDQUFFO0tBQ3hDLENBQ0osRUFDRCxDQUNJLE9BQU8sRUFDUDtNQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHO0lBQUMsQ0FBRSxFQUN0QyxRQUFRLENBQ1gsQ0FDSixDQUFDO0lBQ0YsSUFBSSxRQUFRLEVBQUU7TUFDVixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDbEM7SUFDQSxPQUFPLElBQUk7RUFDZixDQUFDLE1BQ0k7SUFDRCxNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFVLEVBQUMsQ0FBQyxJQUFJLEVBQUU7TUFBRSxLQUFLLEVBQUU7SUFBVSxDQUFFLENBQUMsQ0FBQztJQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO01BQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEQ7SUFDQSxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNuQztBQUNKO0FBRU0sU0FBVSxnQkFBZ0IsQ0FBQyxRQUFrQjtFQUMvQyxJQUFJLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0VBQ3JELElBQUksRUFBRSxJQUFJLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUNyQyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLG1CQUFtQixDQUFDLElBQUksQ0FBQztFQUN6QixLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNoQyxlQUFlLENBQUMsSUFBSSxDQUFDO0VBQ3pCO0VBQ0EsT0FBTyxJQUFJO0FBQ2Y7QUFFQSxTQUFTLFNBQVMsQ0FBQyxJQUFzQjtFQUNyQyxJQUFJLE1BQU0sR0FBdUIsRUFBRTtFQUNuQyxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7SUFDakMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDakMsSUFBSSxLQUFLLFlBQVksZ0JBQWdCLEVBQUU7TUFDbkMsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztNQUN0QjtJQUNKLENBQUMsTUFDSSxJQUFJLEtBQUssWUFBWSxnQkFBZ0IsRUFBRTtNQUN4QyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUM7RUFDSjtFQUNBLE9BQU8sTUFBTTtBQUNqQjtBQUVNLFNBQVUsYUFBYSxDQUFDLElBQXNCO0VBQ2hELElBQUksTUFBTSxHQUErQixFQUFFO0VBQzNDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTztFQUN2RDtFQUNBLE9BQU8sTUFBTTtBQUNqQjtBQUVNLFNBQVUsYUFBYSxDQUFDLElBQXNCLEVBQUUsTUFBa0M7RUFDcEYsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDaEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRTtNQUM5QjtJQUNKO0lBQ0EsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBQ3BCLGVBQWUsQ0FBQyxJQUFJLENBQUM7RUFDekI7QUFDSjs7Ozs7Ozs7Ozs7Ozs7O0FDNU1BOzs7O0FBcUNBO0FBQ00sU0FBVSxxQkFBcUIsQ0FBQyxHQUFXO0VBQzdDLE9BQU8sR0FBRyxDQUNMLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FDckMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUN6QyxJQUFJLEVBQUU7QUFDZjtBQUVNLFNBQVUsaUJBQWlCLENBQUMsR0FBVyxFQUFFLFFBQWlCO0VBQzVELE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQztFQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFO0lBQ1gsT0FBTyxNQUFNO0VBQ2pCO0VBQ0E7RUFDQSxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztFQUN6RCxPQUFPLFVBQVUsaUJBQWlCLEVBQUU7QUFDeEM7QUFFQTtBQUNNLFNBQVUsY0FBYyxDQUFDLEdBQVc7RUFDdEMsT0FBTyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUNyRTtBQWVBO0FBQ00sU0FBVSxnQkFBZ0IsQ0FBQyxPQUFlLEVBQUUsUUFBUSxHQUFHLEtBQUs7RUFDOUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUM7RUFDdEIsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLE1BQU0sQ0FBQztFQUMvQjtFQUNBLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQzVDO0VBQ0EsT0FBTyxJQUFJO0FBQ2Y7QUFFQTs7Ozs7QUFLTSxTQUFVLGlCQUFpQixDQUM3QixPQUFlLEVBQ2YsT0FBc0IsRUFDdEIsT0FBa0U7RUFFbEUsS0FBSyxNQUFNLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsSUFBSSxLQUFLLENBQUMsRUFBRTtJQUN0RSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRTtNQUNqQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtJQUNsQztFQUNKO0VBQ0EsSUFBSSxPQUFPLE9BQU8sRUFBRSxLQUFLLEtBQUssUUFBUSxFQUFFO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakQsSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUU7TUFDakMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUk7SUFDbEM7RUFDSjtFQUNBLE9BQU8sU0FBUztBQUNwQjtBQUVBOzs7Ozs7Ozs7QUFTTSxTQUFVLCtCQUErQixDQUMzQyxLQUE0QixFQUM1QixPQUFvQztFQUVwQyxNQUFNLFFBQVEsR0FBOEIsRUFBRTtFQUM5QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUM5QixNQUFNLElBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxPQUFPLENBQzlCO0VBQ0QsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDO0VBQ3hDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLE1BQU07RUFFekMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO0lBQ25CLFFBQVEsQ0FBQyxJQUFJLENBQUM7TUFDVixJQUFJLEVBQUUsTUFBTTtNQUNaLFFBQVE7TUFDUixTQUFTLEVBQUU7S0FDZCxDQUFDO0VBQ04sQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtJQUN0QjtJQUNBLFFBQVEsQ0FBQyxJQUFJLENBQUM7TUFDVixJQUFJLEVBQUUsTUFBTTtNQUNaLFFBQVE7TUFDUixTQUFTLEVBQUUsS0FBSztNQUNoQixNQUFNLEVBQUU7S0FDWCxDQUFDO0VBQ04sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUU7SUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQztNQUNWLElBQUksRUFBRSxNQUFNO01BQ1osUUFBUTtNQUNSLFNBQVMsRUFBRSxLQUFLO01BQ2hCLE1BQU0sRUFBRTtLQUNYLENBQUM7RUFDTjtFQUVBLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFVO0VBQ2xDLEtBQUssTUFBTSxLQUFLLElBQUksWUFBWSxFQUFFO0lBQzlCLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDekI7SUFDSjtJQUNBLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDO01BQ1YsSUFBSSxFQUFFLE9BQU87TUFDYixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7TUFDZCxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7TUFDeEIsS0FBSyxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVE7S0FDckQsQ0FBQztFQUNOO0VBRUEsT0FBTyxRQUFRO0FBQ25CO0FBRUE7QUFDTSxTQUFVLDRCQUE0QixDQUFDLE9BQWU7RUFDeEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQVU7RUFDL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLEVBQUU7SUFDOUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7SUFDNUIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztJQUNqRCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0lBQ2pELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUU7TUFDNUI7SUFDSjtJQUNBLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtNQUN2QixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQztFQUNKO0VBQ0EsT0FBTyxLQUFLO0FBQ2hCOzs7Ozs7Ozs7QUN0TE0sU0FBVSxVQUFVLENBQXFCLElBQWtCO0VBQzdELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQy9DLFNBQVMsTUFBTSxDQUFDLFNBQWtFO0lBQzlFLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLFNBQVMsWUFBWSxXQUFXLEVBQUU7TUFDbkUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDN0IsQ0FBQyxNQUNJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtNQUMvQixPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QyxDQUFDLE1BQ0k7TUFDRCxLQUFLLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRTtRQUN6QixPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDN0M7SUFDSjtFQUNKO0VBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQjtFQUNBLE9BQU8sT0FBTztBQUNsQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFDQSxJQUFBLGlCQUFBLEdBQUEsT0FBQTtBQVNBLElBQUEsb0JBQUEsR0FBQSxPQUFBO0FBQ0EsSUFBQSxTQUFBLEdBQUEsT0FBQTtBQUlBLElBQUEsWUFBQSxHQUFBLE9BQUE7QUFnQk8sTUFBTSxVQUFVLEdBQUEsT0FBQSxDQUFBLFVBQUEsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBVTtBQUV6RixTQUFVLFdBQVcsQ0FBQyxTQUFpQjtFQUN6QyxPQUFRLFVBQWtDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUNsRTtBQUlNLE1BQU8sVUFBVTtFQUNFLE9BQUE7RUFBckIsWUFBcUIsT0FBZTtJQUFmLEtBQUEsT0FBTyxHQUFQLE9BQU87RUFBWTtFQUV4QyxJQUFJLGdCQUFnQixDQUFBO0lBQ2hCLElBQUksSUFBSSxZQUFZLGNBQWMsRUFBRTtNQUNoQyxPQUFPLEtBQUs7SUFDaEIsQ0FBQyxNQUNJLElBQUksSUFBSSxZQUFZLGVBQWUsRUFBRTtNQUN0QyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDO0lBQ25GLENBQUMsTUFDSSxJQUFJLElBQUksWUFBWSxrQkFBa0IsRUFBRTtNQUN6QyxPQUFPLElBQUk7SUFDZixDQUFDLE1BQ0k7TUFDRCxNQUFNLGdCQUFnQjtJQUMxQjtFQUNKO0VBRUEsSUFBSSxJQUFJLENBQUE7SUFDSixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDekMsSUFBSSxDQUFDLElBQUksRUFBRTtNQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztNQUNsRSxNQUFNLGdCQUFnQjtJQUMxQjtJQUNBLE9BQU8sSUFBSTtFQUNmOztBQUNILE9BQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQTtBQUVLLE1BQU8sY0FBZSxTQUFRLFVBQVU7RUFDSixLQUFBO0VBQXdCLEVBQUE7RUFBc0IsS0FBQTtFQUFwRixZQUFZLE9BQWUsRUFBVyxLQUFhLEVBQVcsRUFBVyxFQUFXLEtBQWE7SUFDN0YsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQURvQixLQUFBLEtBQUssR0FBTCxLQUFLO0lBQW1CLEtBQUEsRUFBRSxHQUFGLEVBQUU7SUFBb0IsS0FBQSxLQUFLLEdBQUwsS0FBSztFQUV6Rjs7QUFDSCxPQUFBLENBQUEsY0FBQSxHQUFBLGNBQUE7QUFFSyxNQUFPLGVBQWdCLFNBQVEsVUFBVTtFQUMzQyxZQUFZLE9BQWU7SUFDdkIsS0FBSyxDQUFDLE9BQU8sQ0FBQztFQUNsQjtFQUVBLFVBQVUsQ0FBQyxJQUFVLEVBQUUsU0FBcUI7SUFDeEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxLQUFLLEVBQUU7TUFDUixNQUFNLGdCQUFnQjtJQUMxQjtJQUNBLE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO0VBQy9DOztBQUNILE9BQUEsQ0FBQSxlQUFBLEdBQUEsZUFBQTtBQWlCSyxTQUFVLHFCQUFxQixDQUNqQyxhQUFxQixFQUNyQixNQUF1QztFQUV2QyxNQUFNLGFBQWEsR0FBRyxhQUFhLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxhQUFhLEdBQUcsQ0FBQztFQUNqRSxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ1QsT0FBTztNQUNILFlBQVksRUFBRSxhQUFhO01BQzNCLGFBQWE7TUFDYjtLQUNIO0VBQ0w7RUFDQSxPQUFPO0lBQ0gsWUFBWSxFQUFFLFFBQVE7SUFDdEIsYUFBYTtJQUNiLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxNQUFNO0lBQ25DLGFBQWE7SUFDYixhQUFhLEVBQUUsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLO0lBQzNDLFlBQVksRUFBRSxNQUFNLENBQUM7R0FDeEI7QUFDTDtBQUVNLE1BQU8sa0JBQW1CLFNBQVEsVUFBVTtFQUVqQyxZQUFBO0VBQ0EsS0FBQTtFQUNBLEVBQUE7RUFDQSxTQUFBO0VBQ0EsU0FBQTtFQUxiLFlBQ2EsWUFBb0IsRUFDcEIsS0FBYSxFQUNiLEVBQVUsRUFDVixTQUFrQixFQUNsQixTQUFpQjtJQUMxQixLQUFLLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBTDlDLEtBQUEsWUFBWSxHQUFaLFlBQVk7SUFDWixLQUFBLEtBQUssR0FBTCxLQUFLO0lBQ0wsS0FBQSxFQUFFLEdBQUYsRUFBRTtJQUNGLEtBQUEsU0FBUyxHQUFULFNBQVM7SUFDVCxLQUFBLFNBQVMsR0FBVCxTQUFTO0VBRXRCO0VBRUEsT0FBTyxlQUFlLENBQUMsR0FBVztJQUM5QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDM0MsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7TUFDZCxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO01BQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNoQztJQUNBLE9BQU8sQ0FBQyxLQUFLO0VBQ2pCO0VBRVEsT0FBTyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUM7OztBQUdqQyxNQUFPLElBQUk7RUFDYixFQUFFLEdBQUcsQ0FBQztFQUNOLE9BQU8sR0FBRyxFQUFFO0VBQ1osT0FBTyxHQUFHLEVBQUU7RUFDWixPQUFPLEdBQUcsRUFBRTtFQUNaLE1BQU0sR0FBRyxDQUFDO0VBQ1YsTUFBTSxHQUFHLEtBQUs7RUFDZCxNQUFNLEdBQUcsRUFBRTtFQUNYLFNBQVM7RUFDVCxJQUFJLEdBQVMsT0FBTztFQUNwQixLQUFLLEdBQUcsQ0FBQztFQUNULEdBQUcsR0FBRyxDQUFDO0VBQ1AsR0FBRyxHQUFHLENBQUM7RUFDUCxHQUFHLEdBQUcsQ0FBQztFQUNQLEdBQUcsR0FBRyxDQUFDO0VBQ1AsRUFBRSxHQUFHLENBQUM7RUFDTixVQUFVLEdBQUcsQ0FBQztFQUNkLFNBQVMsR0FBRyxDQUFDO0VBQ2IsS0FBSyxHQUFHLENBQUM7RUFDVCxRQUFRLEdBQUcsQ0FBQztFQUNaLE1BQU0sR0FBRyxDQUFDO0VBQ1YsR0FBRyxHQUFHLENBQUM7RUFDUCxLQUFLLEdBQUcsQ0FBQztFQUNULE9BQU8sR0FBRyxDQUFDO0VBQ1gsT0FBTyxHQUFHLENBQUM7RUFDWCxPQUFPLEdBQUcsQ0FBQztFQUNYLE9BQU8sR0FBRyxDQUFDO0VBQ1gsbUJBQW1CLEdBQUcsS0FBSztFQUMzQixjQUFjLEdBQUcsS0FBSztFQUN0QixJQUFJLEdBQUcsQ0FBQztFQUNSLElBQUksR0FBRyxDQUFDO0VBQ1IsSUFBSSxHQUFHLENBQUM7RUFDUixNQUFNLEdBQUcsQ0FBQztFQUNWLEtBQUssR0FBRyxDQUFDO0VBQ1QsWUFBWSxHQUFHLENBQUM7RUFDaEIsT0FBTyxHQUFpQixFQUFFO0VBQzFCLGNBQWMsQ0FBQyxJQUFZO0lBQ3ZCLFFBQVEsSUFBSTtNQUNSLEtBQUssV0FBVztRQUNaLE9BQU8sSUFBSSxDQUFDLFFBQVE7TUFDeEIsS0FBSyxRQUFRO1FBQ1QsT0FBTyxJQUFJLENBQUMsTUFBTTtNQUN0QixLQUFLLEtBQUs7UUFDTixPQUFPLElBQUksQ0FBQyxHQUFHO01BQ25CLEtBQUssT0FBTztRQUNSLE9BQU8sSUFBSSxDQUFDLEtBQUs7TUFDckIsS0FBSyxLQUFLO1FBQ04sT0FBTyxJQUFJLENBQUMsR0FBRztNQUNuQixLQUFLLEtBQUs7UUFDTixPQUFPLElBQUksQ0FBQyxHQUFHO01BQ25CLEtBQUssS0FBSztRQUNOLE9BQU8sSUFBSSxDQUFDLEdBQUc7TUFDbkIsS0FBSyxNQUFNO1FBQ1AsT0FBTyxJQUFJLENBQUMsR0FBRztNQUNuQixLQUFLLFNBQVM7UUFDVixPQUFPLElBQUksQ0FBQyxPQUFPO01BQ3ZCLEtBQUssU0FBUztRQUNWLE9BQU8sSUFBSSxDQUFDLE9BQU87TUFDdkIsS0FBSyxTQUFTO1FBQ1YsT0FBTyxJQUFJLENBQUMsT0FBTztNQUN2QixLQUFLLFVBQVU7UUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPO01BQ3ZCLEtBQUssT0FBTztRQUNSLE9BQU8sSUFBSSxDQUFDLEtBQUs7TUFDckIsS0FBSyxZQUFZO1FBQ2IsT0FBTyxJQUFJLENBQUMsVUFBVTtNQUMxQixLQUFLLFdBQVc7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTO01BQ3pCLEtBQUssSUFBSTtRQUNMLE9BQU8sSUFBSSxDQUFDLEVBQUU7TUFDbEI7UUFDSSxNQUFNLGdCQUFnQjtJQUM5QjtFQUNKOztBQUNILE9BQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQTtBQUVLLE1BQU8sS0FBSztFQUVELFVBQUE7RUFDQSxXQUFBO0VBQ0EsSUFBQTtFQUNBLEtBQUE7RUFDQSxFQUFBO0VBRUEsT0FBQTtFQUtBLFdBQUE7RUFaYixZQUNhLFVBQWtCLEVBQ2xCLFdBQW1CLEVBQ25CLElBQVksRUFDWixLQUFBLEdBQWdCLENBQUMsRUFDakIsRUFBQSxHQUFjLEtBQUssRUFDNUI7RUFDUyxPQUFBLEdBQW1CLEtBQUs7RUFDakM7Ozs7RUFJUyxXQUFBLEdBQXVCLElBQUk7SUFYM0IsS0FBQSxVQUFVLEdBQVYsVUFBVTtJQUNWLEtBQUEsV0FBVyxHQUFYLFdBQVc7SUFDWCxLQUFBLElBQUksR0FBSixJQUFJO0lBQ0osS0FBQSxLQUFLLEdBQUwsS0FBSztJQUNMLEtBQUEsRUFBRSxHQUFGLEVBQUU7SUFFRixLQUFBLE9BQU8sR0FBUCxPQUFPO0lBS1AsS0FBQSxXQUFXLEdBQVgsV0FBVztJQUVwQixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtNQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxHQUFHLEVBQXVGLENBQUM7SUFDbEk7RUFDSjtFQUVBLEdBQUcsQ0FBQyxJQUFVLEVBQUUsV0FBbUIsRUFBRSxTQUFvQixFQUFFLFlBQW9CLEVBQUUsWUFBb0I7SUFDakcsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO01BQ2hEO01BQ0E7TUFDQSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVM7SUFDOUI7SUFDQSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUU7SUFDM0MsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDOUI7SUFDQTtJQUNBO0lBQ0EsSUFBSSxRQUFRLEVBQUU7TUFDVixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUNWLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLEVBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxFQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FDdEMsQ0FBQztJQUNOLENBQUMsTUFDSTtNQUNELEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM1RDtJQUNBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQzdHO0VBRUEsYUFBYSxDQUFDLElBQVUsRUFBRSxTQUFBLEdBQW1DLFNBQVM7SUFDbEUsTUFBTSxLQUFLLEdBQXlCLFNBQVMsR0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFJLFVBQVU7SUFDMUUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEgsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO01BQ25CLE9BQU8sQ0FBQztJQUNaO0lBQ0EsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0csT0FBTyxpQkFBaUIsR0FBRyxXQUFXO0VBQzFDO0VBRUEsSUFBSSxpQkFBaUIsQ0FBQTtJQUNqQixPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxFQUFFLENBQUMsQ0FBQztFQUNqRztFQUVBLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFxQjtFQUNwRCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXVHOztBQUM5SCxPQUFBLENBQUEsS0FBQSxHQUFBLEtBQUE7QUFFTSxJQUFJLEtBQUssR0FBQSxPQUFBLENBQUEsS0FBQSxHQUFHLElBQUksR0FBRyxFQUFnQjtBQUNuQyxJQUFJLFVBQVUsR0FBQSxPQUFBLENBQUEsVUFBQSxHQUFHLElBQUksR0FBRyxFQUFnQjtBQUN4QyxJQUFJLE1BQU0sR0FBQSxPQUFBLENBQUEsTUFBQSxHQUFHLElBQUksR0FBRyxFQUFpQjtBQUM1QyxJQUFJLE1BQXFDO0FBbUJ6QyxJQUFJLFVBQVUsR0FBZTtFQUFFLEtBQUssRUFBRSxFQUFFO0VBQUUsU0FBUyxFQUFFLEVBQUU7RUFBRSxNQUFNLEVBQUU7QUFBRSxDQUFFO0FBQ3JFLElBQUksU0FBUyxHQUFrQjtFQUFFLEtBQUssRUFBRSxFQUFFO0VBQUUsTUFBTSxFQUFFO0FBQUUsQ0FBRTtBQUN4RCxJQUFJLGdCQUFnQixHQUFxQjtFQUFFLE1BQU0sRUFBRSxFQUFFO0VBQUUsU0FBUyxFQUFFLEVBQUU7RUFBRSxNQUFNLEVBQUU7QUFBRSxDQUFFO0FBTWxGLElBQUksY0FBYyxHQUFtQixFQUFFO0FBRXZDLFNBQVMsWUFBWSxDQUFDLENBQVMsRUFBRSxNQUFjO0VBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0VBQ3pCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUNwQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDdEI7RUFDQSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDakIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3RCO0VBQ0EsT0FBTyxDQUFDO0FBQ1o7QUFFQSxTQUFTLGFBQWEsQ0FBQyxJQUFZO0VBQy9CLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUU7SUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sYUFBYSxDQUFDO0VBQ2hFO0VBQ0EsS0FBSyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO0lBQ3hELE1BQU0sSUFBSSxHQUFTLElBQUksSUFBSSxDQUFKLENBQUk7SUFDM0IsS0FBSyxNQUFNLEdBQUcsU0FBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsRUFBRTtNQUN6RSxRQUFRLFNBQVM7UUFDYixLQUFLLE9BQU87VUFDUixJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDekI7UUFDSixLQUFLLFFBQVE7VUFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUs7VUFDcEI7UUFDSixLQUFLLFFBQVE7VUFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUs7VUFDcEI7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUs7VUFDcEI7UUFDSixLQUFLLFFBQVE7VUFDVCxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDN0I7UUFDSixLQUFLLE1BQU07VUFDUCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1VBQy9CO1FBQ0osS0FBSyxRQUFRO1VBQ1QsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLO1VBQ25CO1FBQ0osS0FBSyxNQUFNO1VBQ1AsUUFBUSxLQUFLO1lBQ1QsS0FBSyxNQUFNO2NBQ1AsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNO2NBQ3ZCO1lBQ0osS0FBSyxRQUFRO2NBQ1QsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRO2NBQ3pCO1lBQ0osS0FBSyxNQUFNO2NBQ1AsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNO2NBQ3ZCO1lBQ0osS0FBSyxNQUFNO2NBQ1AsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNO2NBQ3ZCO1lBQ0osS0FBSyxTQUFTO2NBQ1YsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTO2NBQzFCO1lBQ0osS0FBSyxPQUFPO2NBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPO2NBQ3hCO1lBQ0osS0FBSyxJQUFJO2NBQ0wsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJO2NBQ3JCO1lBQ0o7Y0FDSSxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixLQUFLLEdBQUcsQ0FBQztVQUMxRDtVQUNBO1FBQ0osS0FBSyxNQUFNO1VBQ1AsUUFBUSxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2pCLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVTtjQUN0QjtZQUNKLEtBQUssU0FBUztjQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssUUFBUTtjQUNULElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUTtjQUNwQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKO2NBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxFQUFFLENBQUM7VUFDbkQ7VUFDQTtRQUNKLEtBQUssT0FBTztVQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUM1QjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssT0FBTztVQUNSLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUN6QjtRQUNKLEtBQUssVUFBVTtVQUNYLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUNqQztR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QUssRUFBRTtFQUN4QjtFQUNBLFdBQVcsU0FBUyxDQUFBO0lBQ2hCLElBQUksTUFBTSxHQUE4QyxFQUFFO0lBQzFELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO01BQzFDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQy9CLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQ3pCO01BQ0o7TUFDQSxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUN2QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUMzQjtNQUNKO01BQ0EsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzFCO01BQ0o7TUFDQSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO0lBQzNDO0lBQ0EsT0FBTyxNQUFNO0VBQ2pCOztBQUNILE9BQUEsQ0FBQSxnQkFBQSxHQUFBLGdCQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5cbmV4cG9ydCB0eXBlIFRyZWVOb2RlID0gc3RyaW5nIHwgVHJlZU5vZGVbXTtcblxuZnVuY3Rpb24gZ2V0Q2hpbGRyZW4obm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnRbXSB7XG4gICAgY29uc3QgcGFyZW50X2xpID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF9saSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50X3VsID0gcGFyZW50X2xpLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X3VsIGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBmb3IgKGxldCBjaGlsZEluZGV4ID0gMDsgY2hpbGRJbmRleCA8IHBhcmVudF91bC5jaGlsZHJlbi5sZW5ndGg7IGNoaWxkSW5kZXgrKykge1xuICAgICAgICBpZiAocGFyZW50X3VsLmNoaWxkcmVuW2NoaWxkSW5kZXhdICE9PSBwYXJlbnRfbGkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvdGVudGlhbFNpYmxpbmdFbnRyeSA9IHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4ICsgMV0/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwb3RlbnRpYWxTaWJsaW5nRW50cnkgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFycmF5XG4gICAgICAgICAgICAuZnJvbShwb3RlbnRpYWxTaWJsaW5nRW50cnkuY2hpbGRyZW4pXG4gICAgICAgICAgICAuZmlsdGVyKChlKTogZSBpcyBIVE1MTElFbGVtZW50ID0+IGUgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIGUuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KVxuICAgICAgICAgICAgLm1hcChlID0+IGUuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyhub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBnZXRDaGlsZHJlbihub2RlKSkge1xuICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCAhPT0gbm9kZS5jaGVja2VkKSB7XG4gICAgICAgICAgICBjaGlsZC5jaGVja2VkID0gbm9kZS5jaGVja2VkO1xuICAgICAgICAgICAgY2hpbGQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyhjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFBhcmVudChub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogSFRNTElucHV0RWxlbWVudCB8IHZvaWQge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudD8ucGFyZW50RWxlbWVudD8ucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNhbmRpZGF0ZTogSFRNTExJRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHBhcmVudF91bC5jaGlsZHJlbikge1xuICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIGNoaWxkLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgY2FuZGlkYXRlID0gY2hpbGQ7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGQgPT09IHBhcmVudF9saSAmJiBjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYW5kaWRhdGUuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlQW5jZXN0b3JzKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSk7XG4gICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZm91bmRDaGVja2VkID0gZmFsc2U7XG4gICAgbGV0IGZvdW5kVW5jaGVja2VkID0gZmFsc2U7XG4gICAgbGV0IGZvdW5kSW5kZXRlcm1pbmF0ZSA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBnZXRDaGlsZHJlbihwYXJlbnQpKSB7XG4gICAgICAgIGlmIChjaGlsZC5jaGVja2VkKSB7XG4gICAgICAgICAgICBmb3VuZENoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm91bmRVbmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZC5pbmRldGVybWluYXRlKSB7XG4gICAgICAgICAgICBmb3VuZEluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZEluZGV0ZXJtaW5hdGUgfHwgZm91bmRDaGVja2VkICYmIGZvdW5kVW5jaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZm91bmRDaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgdXBkYXRlQW5jZXN0b3JzKHBhcmVudCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcihub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGUgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKHRhcmdldCk7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyh0YXJnZXQpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrTGlzdGVuZXJzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcihlbGVtZW50LmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBhcHBseUNoZWNrTGlzdGVuZXJzKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZTogVHJlZU5vZGUpOiBIVE1MTElFbGVtZW50IHtcbiAgICBpZiAodHlwZW9mIHRyZWVOb2RlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodHJlZU5vZGVbMF0gPT09IFwiLVwiKSB7XG4gICAgICAgICAgICB0cmVlTm9kZSA9IHRyZWVOb2RlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodHJlZU5vZGVbMF0gPT09IFwiK1wiKSB7XG4gICAgICAgICAgICB0cmVlTm9kZSA9IHRyZWVOb2RlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9kZSA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiY2hlY2tib3hcIixcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKGNoZWNrZWQgJiYgeyBjaGVja2VkOiBcImNoZWNrZWRcIiB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgIHsgZm9yOiB0cmVlTm9kZS5yZXBsYWNlQWxsKFwiIFwiLCBcIl9cIikgfSxcbiAgICAgICAgICAgICAgICB0cmVlTm9kZVxuICAgICAgICAgICAgXVxuICAgICAgICBdKTtcbiAgICAgICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBjcmVhdGVIVE1MKFtcInVsXCIsIHsgY2xhc3M6IFwiY2hlY2tib3hcIiB9XSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJlZU5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0cmVlTm9kZVtpXTtcbiAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQobWFrZUNoZWNrYm94VHJlZU5vZGUobm9kZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcImxpXCIsIGxpc3RdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ2hlY2tib3hUcmVlKHRyZWVOb2RlOiBUcmVlTm9kZSkge1xuICAgIGxldCByb290ID0gbWFrZUNoZWNrYm94VHJlZU5vZGUodHJlZU5vZGUpLmNoaWxkcmVuWzBdO1xuICAgIGlmICghKHJvb3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMocm9vdCk7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhyb290KSkge1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxuICAgIHJldHVybiByb290O1xufVxuXG5mdW5jdGlvbiBnZXRMZWF2ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCByZXN1bHQ6IEhUTUxJbnB1dEVsZW1lbnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gZWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGdldENoaWxkcmVuKGlucHV0KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGdldExlYXZlcyhpbnB1dCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMZWFmU3RhdGVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMobm9kZSkpIHtcbiAgICAgICAgc3RhdGVzW2xlYWYuaWQucmVwbGFjZUFsbChcIl9cIiwgXCIgXCIpXSA9IGxlYWYuY2hlY2tlZDtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCwgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSkge1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMobm9kZSkpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildO1xuICAgICAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBsZWFmLmNoZWNrZWQgPSBzdGF0ZTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKGxlYWYpO1xuICAgIH1cbn1cbiIsIi8qKlxuICogUHVyZSBwcm9qZWN0aW9uIG9mIGhvdyBhIGdhY2hhIGNvaW4gY2FuIGJlIGFjcXVpcmVkLlxuICogU2hvcCBkZW5vbWluYXRpb24gKEdvbGQvQVApIGlzIHNlcGFyYXRlIGZyb20gR3VhcmRpYW4vQm9zcyBzdGFnZSBkcm9wcy5cbiAqL1xuXG5leHBvcnQgdHlwZSBHYWNoYVNob3BDaGFubmVsID0ge1xuICAgIHJlYWRvbmx5IGtpbmQ6IFwic2hvcFwiO1xuICAgIHJlYWRvbmx5IGN1cnJlbmN5OiBcIkdvbGRcIiB8IFwiQVBcIjtcbiAgICByZWFkb25seSBhdmFpbGFibGU6IGJvb2xlYW47XG4gICAgLyoqIFdoeSBzaG9wIGlzIHVuYXZhaWxhYmxlIHdoZW4gYXZhaWxhYmxlPWZhbHNlLiAqL1xuICAgIHJlYWRvbmx5IHJlYXNvbj86IFwibm90X2Zvcl9zYWxlXCIgfCBcIm5vdF9hdmFpbGFibGVcIjtcbn07XG5cbmV4cG9ydCB0eXBlIEdhY2hhU3RhZ2VDaGFubmVsID0ge1xuICAgIHJlYWRvbmx5IGtpbmQ6IFwic3RhZ2VcIjtcbiAgICByZWFkb25seSBtYXA6IHN0cmluZztcbiAgICByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbjtcbiAgICByZWFkb25seSBsYWJlbDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWwgPSBHYWNoYVNob3BDaGFubmVsIHwgR2FjaGFTdGFnZUNoYW5uZWw7XG5cbmV4cG9ydCB0eXBlIEdhY2hhQWNxdWlzaXRpb25JbnB1dCA9IHtcbiAgICByZWFkb25seSBhcDogYm9vbGVhbjtcbiAgICAvKiogUHJvZHVjdCBpcyBsaXN0ZWQgaW4gdGhlIGxpdmUgc2hvcCBjYXRhbG9nIChlbmFibGVkKS4gKi9cbiAgICByZWFkb25seSBlbmFibGVkOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFRydWUgb25seSB3aGVuIHRoZSBwcm9kdWN0IGNhbiBhY3R1YWxseSBiZSBwdXJjaGFzZWQuXG4gICAgICogSkZUU0UgYE5vYnV5PTFgIHByb2R1Y3RzIHN0YXkgZW5hYmxlZCBpbiBjYXRhbG9nIGJ1dCByZWplY3Qgc2hvcCBidXlzLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IHB1cmNoYXNhYmxlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgR2FjaGFTb3VyY2VJbnB1dCA9XG4gICAgfCB7IHJlYWRvbmx5IGtpbmQ6IFwic2hvcFwiOyByZWFkb25seSBhcDogYm9vbGVhbiB9XG4gICAgfCB7IHJlYWRvbmx5IGtpbmQ6IFwic3RhZ2VcIjsgcmVhZG9ubHkgbWFwOiBzdHJpbmc7IHJlYWRvbmx5IG5lZWRCb3NzOiBib29sZWFuIH07XG5cbi8qKiBTcGxpdCBDYW1lbENhc2Ugc3RhZ2UgaWRzIGZyb20gSkZUU0UgR3VhcmRpYW5TdGFnZXMuanNvbiBpbnRvIHJlYWRhYmxlIGxhYmVscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBtYXBcbiAgICAgICAgLnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0pL2csIFwiJDEgJDJcIilcbiAgICAgICAgLnJlcGxhY2UoLyhbQS1aXSspKFtBLVpdW2Etel0pL2csIFwiJDEgJDJcIilcbiAgICAgICAgLnRyaW0oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YWdlQ2hhbm5lbExhYmVsKG1hcDogc3RyaW5nLCBuZWVkQm9zczogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgY29uc3QgcHJldHR5ID0gcHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCk7XG4gICAgaWYgKCFuZWVkQm9zcykge1xuICAgICAgICByZXR1cm4gcHJldHR5O1xuICAgIH1cbiAgICAvLyBBdm9pZCBcIkJvc3MgwrcgQXRsYW50aXMgQm9zc1wiIOKAlCBzdGFnZSBpZHMgZW5kIGluIEJvc3MgYWxyZWFkeS5cbiAgICBjb25zdCB3aXRob3V0Qm9zc1N1ZmZpeCA9IHByZXR0eS5yZXBsYWNlKC9cXHMrQm9zcyQvaSwgXCJcIik7XG4gICAgcmV0dXJuIGBCb3NzIMK3ICR7d2l0aG91dEJvc3NTdWZmaXh9YDtcbn1cblxuLyoqIFN0cmlwIHRyYWlsaW5nIEJvc3Mgc28gdGl0bGVzIHJlYWQgXCJBdGxhbnRpc1wiLCBub3QgXCJBdGxhbnRpcyBCb3NzXCIuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2VUaXRsZU5hbWUobWFwOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKS5yZXBsYWNlKC9cXHMrQm9zcyQvaSwgXCJcIikudHJpbSgpO1xufVxuXG5leHBvcnQgdHlwZSBNYXBBcnRGaWxlID0ge1xuICAgIHJlYWRvbmx5IGZpbGU6IHN0cmluZztcbiAgICByZWFkb25seSB3aWR0aD86IG51bWJlcjtcbiAgICByZWFkb25seSBoZWlnaHQ/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkga2luZD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIE1hcEFydENhdGFsb2cgPSB7XG4gICAgcmVhZG9ubHkgZmlsZXM6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIE1hcEFydEZpbGU+PjtcbiAgICByZWFkb25seSBieU5hbWU6IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xuICAgIHJlYWRvbmx5IGJ5TWFwSWQ/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pjtcbn07XG5cbi8qKiBDYW5kaWRhdGUgc3RhZ2Uga2V5cyBmb3IgbWFwIGFydCAoQm9zcyBzdWZmaXggKyBiYXJlIG1hcCBuYW1lKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBBcnRMb29rdXBLZXlzKG1hcE5hbWU6IHN0cmluZywgbmVlZEJvc3MgPSBmYWxzZSk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcbiAgICBjb25zdCBrZXlzID0gW21hcE5hbWVdO1xuICAgIGlmIChuZWVkQm9zcyAmJiAhL0Jvc3MkL2kudGVzdChtYXBOYW1lKSkge1xuICAgICAgICBrZXlzLnB1c2goYCR7bWFwTmFtZX1Cb3NzYCk7XG4gICAgfVxuICAgIGlmICgvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChtYXBOYW1lLnJlcGxhY2UoL0Jvc3MkL2ksIFwiXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhdXRoZW50aWMgY2xpZW50IG1hcCBhcnQgZm9yIGEgR3VhcmRpYW5TdGFnZXMgbWFwIG5hbWUuXG4gKiBQcmVmZXJzIFVJIG1hcC1zZWxlY3QgdGh1bWJzOyBmYWxscyBiYWNrIHRvIHN0YWdlLWVudmlyb25tZW50IHRleHR1cmVzIHdoZW4gY2F0YWxvZ3VlZC5cbiAqIE5ldmVyIGludmVudHMgYXJ0IOKAlCBvbmx5IHJldHVybnMgYW4gZXhwbGljaXQgY2F0YWxvZyBtYXBwaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU1hcEFydEZpbGUoXG4gICAgbWFwTmFtZTogc3RyaW5nLFxuICAgIGNhdGFsb2c6IE1hcEFydENhdGFsb2csXG4gICAgb3B0aW9ucz86IHsgcmVhZG9ubHkgbmVlZEJvc3M/OiBib29sZWFuOyByZWFkb25seSBtYXBJZD86IG51bWJlciB9LFxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgbWFwQXJ0TG9va3VwS2V5cyhtYXBOYW1lLCBvcHRpb25zPy5uZWVkQm9zcyA/PyBmYWxzZSkpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gY2F0YWxvZy5ieU5hbWVbbmFtZV07XG4gICAgICAgIGlmIChrZXkgJiYgY2F0YWxvZy5maWxlc1trZXldPy5maWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2F0YWxvZy5maWxlc1trZXldLmZpbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zPy5tYXBJZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBjb25zdCBrZXkgPSBjYXRhbG9nLmJ5TWFwSWQ/LltgJHtvcHRpb25zLm1hcElkfWBdO1xuICAgICAgICBpZiAoa2V5ICYmIGNhdGFsb2cuZmlsZXNba2V5XT8uZmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhdGFsb2cuZmlsZXNba2V5XS5maWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUHJvamVjdCBzaG9wICsgc3RhZ2UgYWNxdWlzaXRpb24gY2hhbm5lbHMgZm9yIGEgZ2FjaGEgY29pbi5cbiAqXG4gKiAtIFB1cmNoYXNhYmxlIHNob3Ag4oaSIEdvbGQvQVAgcGlsbC5cbiAqIC0gQ2F0YWxvZy1saXN0ZWQgYnV0IE5vYnV5IChgcHVyY2hhc2FibGU9ZmFsc2VgLCBgZW5hYmxlZD10cnVlYCkg4oaSIE5vdCBmb3Igc2FsZVxuICogICAoc3RpbGwgc2hvd24gd2hlbiBzdGFnZXMgZXhpc3Qgc28gcGxheWVycyBkbyBub3QgYXNzdW1lIGEgcHJpY2UpLlxuICogLSBGdWxseSBkaXNhYmxlZCBzaG9wIHdpdGggbm8gc3RhZ2VzIOKGkiBOb3QgYXZhaWxhYmxlLlxuICogLSBEaXNhYmxlZCBzaG9wIHdpdGggc3RhZ2VzIOKGkiBzdGFnZXMgb25seSAob21pdCBzaG9wIGNocm9tZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzKFxuICAgIGdhY2hhOiBHYWNoYUFjcXVpc2l0aW9uSW5wdXQsXG4gICAgc291cmNlczogcmVhZG9ubHkgR2FjaGFTb3VyY2VJbnB1dFtdLFxuKTogcmVhZG9ubHkgR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxbXSB7XG4gICAgY29uc3QgY2hhbm5lbHM6IEdhY2hhQWNxdWlzaXRpb25DaGFubmVsW10gPSBbXTtcbiAgICBjb25zdCBzdGFnZVNvdXJjZXMgPSBzb3VyY2VzLmZpbHRlcihcbiAgICAgICAgKHNvdXJjZSk6IHNvdXJjZSBpcyBFeHRyYWN0PEdhY2hhU291cmNlSW5wdXQsIHsga2luZDogXCJzdGFnZVwiIH0+ID0+XG4gICAgICAgICAgICBzb3VyY2Uua2luZCA9PT0gXCJzdGFnZVwiLFxuICAgICk7XG4gICAgY29uc3QgaGFzU3RhZ2UgPSBzdGFnZVNvdXJjZXMubGVuZ3RoID4gMDtcbiAgICBjb25zdCBjdXJyZW5jeSA9IGdhY2hhLmFwID8gXCJBUFwiIDogXCJHb2xkXCI7XG5cbiAgICBpZiAoZ2FjaGEucHVyY2hhc2FibGUpIHtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGdhY2hhLmVuYWJsZWQpIHtcbiAgICAgICAgLy8gTGlzdGVkIGluIHNob3AgVUkgLyBBUEkgYnV0IGJsb2NrZWQgYnkgTm9idXkg4oCUIG5ldmVyIGltcGx5IGEgYnV5IHBhdGguXG4gICAgICAgIGNoYW5uZWxzLnB1c2goe1xuICAgICAgICAgICAga2luZDogXCJzaG9wXCIsXG4gICAgICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWFzb246IFwibm90X2Zvcl9zYWxlXCIsXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoIWhhc1N0YWdlKSB7XG4gICAgICAgIGNoYW5uZWxzLnB1c2goe1xuICAgICAgICAgICAga2luZDogXCJzaG9wXCIsXG4gICAgICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWFzb246IFwibm90X2F2YWlsYWJsZVwiLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWVuTWFwcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGZvciAoY29uc3Qgc3RhZ2Ugb2Ygc3RhZ2VTb3VyY2VzKSB7XG4gICAgICAgIGlmIChzZWVuTWFwcy5oYXMoc3RhZ2UubWFwKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2Vlbk1hcHMuYWRkKHN0YWdlLm1hcCk7XG4gICAgICAgIGNoYW5uZWxzLnB1c2goe1xuICAgICAgICAgICAga2luZDogXCJzdGFnZVwiLFxuICAgICAgICAgICAgbWFwOiBzdGFnZS5tYXAsXG4gICAgICAgICAgICBuZWVkQm9zczogc3RhZ2UubmVlZEJvc3MsXG4gICAgICAgICAgICBsYWJlbDogc3RhZ2VDaGFubmVsTGFiZWwoc3RhZ2UubWFwLCBzdGFnZS5uZWVkQm9zcyksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFubmVscztcbn1cblxuLyoqIFBhcnNlIHByb2R1Y3QgaW5kZXhlcyB3aXRoIE5vYnV54omgMCBmcm9tIEpGVFNFIFNob3BfSW5pMy54bWwgdGV4dC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNob3BOb2J1eVByb2R1Y3RJbmRleGVzKHNob3BYbWw6IHN0cmluZyk6IFJlYWRvbmx5U2V0PG51bWJlcj4ge1xuICAgIGNvbnN0IG5vYnV5ID0gbmV3IFNldDxudW1iZXI+KCk7XG4gICAgZm9yIChjb25zdCBtYXRjaCBvZiBzaG9wWG1sLm1hdGNoQWxsKC88UHJvZHVjdFxccysoW14+XSs/KVxcLz8+L2cpKSB7XG4gICAgICAgIGNvbnN0IGF0dHJzID0gbWF0Y2hbMV0gPz8gXCJcIjtcbiAgICAgICAgY29uc3QgaW5kZXhNYXRjaCA9IGF0dHJzLm1hdGNoKC9cXGJJbmRleD1cIihcXGQrKVwiLyk7XG4gICAgICAgIGNvbnN0IG5vYnV5TWF0Y2ggPSBhdHRycy5tYXRjaCgvXFxiTm9idXk9XCIoXFxkKylcIi8pO1xuICAgICAgICBpZiAoIWluZGV4TWF0Y2ggfHwgIW5vYnV5TWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2J1eU1hdGNoWzFdICE9PSBcIjBcIikge1xuICAgICAgICAgICAgbm9idXkuYWRkKE51bWJlcihpbmRleE1hdGNoWzFdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vYnV5O1xufVxuIiwidHlwZSBUYWdfbmFtZSA9IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcDtcbnR5cGUgQXR0cmlidXRlcyA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG50eXBlIEhUTUxfbm9kZTxUIGV4dGVuZHMgVGFnX25hbWU+ID0gW1QsIC4uLihIVE1MX25vZGU8VGFnX25hbWU+IHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCBBdHRyaWJ1dGVzKVtdXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhUTUw8VCBleHRlbmRzIFRhZ19uYW1lPihub2RlOiBIVE1MX25vZGU8VD4pOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbVF0ge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVbMF0pO1xuICAgIGZ1bmN0aW9uIGhhbmRsZShwYXJhbWV0ZXI6IEF0dHJpYnV0ZXMgfCBIVE1MX25vZGU8VGFnX25hbWU+IHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXIgPT09IFwic3RyaW5nXCIgfHwgcGFyYW1ldGVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHBhcmFtZXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwYXJhbWV0ZXIpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChjcmVhdGVIVE1MKHBhcmFtZXRlcikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVyKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBwYXJhbWV0ZXJba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBub2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhbmRsZShub2RlW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG4iLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7XG4gICAgcHJldHR5R3VhcmRpYW5NYXBOYW1lLFxuICAgIHByb2plY3RHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbHMsXG4gICAgcmVzb2x2ZU1hcEFydEZpbGUsXG4gICAgc3RhZ2VDaGFubmVsTGFiZWwsXG4gICAgc3RhZ2VUaXRsZU5hbWUsXG4gICAgdHlwZSBHYWNoYVNvdXJjZUlucHV0LFxuICAgIHR5cGUgTWFwQXJ0Q2F0YWxvZyxcbn0gZnJvbSAnLi9nYWNoYUFjcXVpc2l0aW9uJztcbmltcG9ydCB7IHByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkgfSBmcm9tICcuL3ByaW9yaXR5U3RhdEhlYWRlcnMnO1xuaW1wb3J0IHtcbiAgICBtZXJnZVByaW9yaXR5UmFua2luZ3MsXG4gICAgdHlwZSBQcmlvcml0eVJhbmtlcixcbn0gZnJvbSAnLi9wcmlvcml0eSc7XG5pbXBvcnQge1xuICAgIHByb2plY3RTdGFnZUJvc3NlcyxcbiAgICB0eXBlIFN0YWdlQm9zc0NhdGFsb2csXG4gICAgdHlwZSBTdGFnZUJvc3NQcm9qZWN0aW9uLFxufSBmcm9tICcuL3N0YWdlQm9zc2VzJztcblxuZXhwb3J0IHsgcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5leHBvcnQgdHlwZSB7IFByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkgfSBmcm9tICcuL3ByaW9yaXR5U3RhdEhlYWRlcnMnO1xuZXhwb3J0IHtcbiAgICByZXNvbHZlTWFwQXJ0RmlsZSxcbiAgICBzdGFnZVRpdGxlTmFtZSxcbn0gZnJvbSAnLi9nYWNoYUFjcXVpc2l0aW9uJztcbmV4cG9ydCB7XG4gICAgcHJvamVjdFN0YWdlQm9zc2VzLFxufSBmcm9tICcuL3N0YWdlQm9zc2VzJztcblxuZXhwb3J0IGNvbnN0IGNoYXJhY3RlcnMgPSBbXCJOaWtpXCIsIFwiTHVuTHVuXCIsIFwiTHVjeVwiLCBcIlNodWFcIiwgXCJEaGFucGlyXCIsIFwiUG9jaGlcIiwgXCJBbFwiXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIENoYXJhY3RlciA9IHR5cGVvZiBjaGFyYWN0ZXJzW251bWJlcl07XG5leHBvcnQgZnVuY3Rpb24gaXNDaGFyYWN0ZXIoY2hhcmFjdGVyOiBzdHJpbmcpOiBjaGFyYWN0ZXIgaXMgQ2hhcmFjdGVyIHtcbiAgICByZXR1cm4gKGNoYXJhY3RlcnMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkuaW5jbHVkZXMoY2hhcmFjdGVyKTtcbn1cblxuZXhwb3J0IHR5cGUgUGFydCA9IFwiSGF0XCIgfCBcIkhhaXJcIiB8IFwiRHllXCIgfCBcIlVwcGVyXCIgfCBcIkxvd2VyXCIgfCBcIlNob2VzXCIgfCBcIlNvY2tzXCIgfCBcIkhhbmRcIiB8IFwiQmFja3BhY2tcIiB8IFwiRmFjZVwiIHwgXCJSYWNrZXRcIiB8IFwiT3RoZXJcIjtcblxuZXhwb3J0IGNsYXNzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNob3BfaWQ6IG51bWJlcikgeyB9XG5cbiAgICBnZXQgcmVxdWlyZXNHdWFyZGlhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4udGhpcy5pdGVtLnNvdXJjZXMudmFsdWVzKCldLmV2ZXJ5KHNvdXJjZSA9PiBzb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaXRlbSgpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIGZpbmRpbmcgaXRlbSBvZiBpdGVtU291cmNlICR7dGhpcy5zaG9wX2lkfWApO1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNob3BJdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3Ioc2hvcF9pZDogbnVtYmVyLCByZWFkb25seSBwcmljZTogbnVtYmVyLCByZWFkb25seSBhcDogYm9vbGVhbiwgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSkge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYUl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoc2hvcF9pZCk7XG4gICAgfVxuXG4gICAgZ2FjaGFUcmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghZ2FjaGEpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2FjaGEuYXZlcmFnZV90cmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgR2FjaGFFY29ub21pY3MgPVxuICAgIHwge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwidW5hdmFpbGFibGVcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBleHBlY3RlZFB1bGxzOiBudW1iZXI7XG4gICAgfVxuICAgIHwge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwiZGlyZWN0XCI7XG4gICAgICAgIGNoYW5jZVBlcmNlbnQ6IG51bWJlcjtcbiAgICAgICAgY3VycmVuY3k6IFwiQVBcIiB8IFwiR29sZFwiO1xuICAgICAgICBleHBlY3RlZFB1bGxzOiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkU3BlbmQ6IG51bWJlcjtcbiAgICAgICAgcHJpY2VQZXJQdWxsOiBudW1iZXI7XG4gICAgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RHYWNoYUVjb25vbWljcyhcbiAgICBleHBlY3RlZFB1bGxzOiBudW1iZXIsXG4gICAgc291cmNlPzogeyBwcmljZTogbnVtYmVyOyBhcDogYm9vbGVhbiB9LFxuKTogR2FjaGFFY29ub21pY3Mge1xuICAgIGNvbnN0IGNoYW5jZVBlcmNlbnQgPSBleHBlY3RlZFB1bGxzID4gMCA/IDEwMCAvIGV4cGVjdGVkUHVsbHMgOiAwO1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhdmFpbGFiaWxpdHk6IFwidW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIGNoYW5jZVBlcmNlbnQsXG4gICAgICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwiZGlyZWN0XCIsXG4gICAgICAgIGNoYW5jZVBlcmNlbnQsXG4gICAgICAgIGN1cnJlbmN5OiBzb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIixcbiAgICAgICAgZXhwZWN0ZWRQdWxscyxcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogZXhwZWN0ZWRQdWxscyAqIHNvdXJjZS5wcmljZSxcbiAgICAgICAgcHJpY2VQZXJQdWxsOiBzb3VyY2UucHJpY2UsXG4gICAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIEd1YXJkaWFuSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBndWFyZGlhbl9tYXA6IHN0cmluZyxcbiAgICAgICAgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSxcbiAgICAgICAgcmVhZG9ubHkgeHA6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmVlZF9ib3NzOiBib29sZWFuLFxuICAgICAgICByZWFkb25seSBib3NzX3RpbWU6IG51bWJlcikge1xuICAgICAgICBzdXBlcihHdWFyZGlhbkl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwX2lkKGd1YXJkaWFuX21hcCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBndWFyZGlhbl9tYXBfaWQobWFwOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5ndWFyZGlhbl9tYXBzLmluZGV4T2YobWFwKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5ndWFyZGlhbl9tYXBzLnB1c2gobWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLWluZGV4O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGd1YXJkaWFuX21hcHMgPSBbXCJcIl07XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVtIHtcbiAgICBpZCA9IDA7XG4gICAgbmFtZV9rciA9IFwiXCI7XG4gICAgbmFtZV9lbiA9IFwiXCI7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgbWF4VXNlID0gMDtcbiAgICBoaWRkZW4gPSBmYWxzZTtcbiAgICByZXNpc3QgPSBcIlwiO1xuICAgIGNoYXJhY3Rlcj86IENoYXJhY3RlcjtcbiAgICBwYXJ0OiBQYXJ0ID0gXCJPdGhlclwiO1xuICAgIGxldmVsID0gMDtcbiAgICBzdHIgPSAwO1xuICAgIHN0YSA9IDA7XG4gICAgZGV4ID0gMDtcbiAgICB3aWwgPSAwO1xuICAgIGhwID0gMDtcbiAgICBxdWlja3Nsb3RzID0gMDtcbiAgICBidWZmc2xvdHMgPSAwO1xuICAgIHNtYXNoID0gMDtcbiAgICBtb3ZlbWVudCA9IDA7XG4gICAgY2hhcmdlID0gMDtcbiAgICBsb2IgPSAwO1xuICAgIHNlcnZlID0gMDtcbiAgICBtYXhfc3RyID0gMDtcbiAgICBtYXhfc3RhID0gMDtcbiAgICBtYXhfZGV4ID0gMDtcbiAgICBtYXhfd2lsID0gMDtcbiAgICBlbGVtZW50X2VuY2hhbnRhYmxlID0gZmFsc2U7XG4gICAgcGFyY2VsX2VuYWJsZWQgPSBmYWxzZTtcbiAgICBzcGluID0gMDtcbiAgICBhdHNzID0gMDtcbiAgICBkZnNzID0gMDtcbiAgICBzb2NrZXQgPSAwO1xuICAgIGdhdWdlID0gMDtcbiAgICBnYXVnZV9iYXR0bGUgPSAwO1xuICAgIHNvdXJjZXM6IEl0ZW1Tb3VyY2VbXSA9IFtdO1xuICAgIHN0YXRGcm9tU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSBcIk1vdiBTcGVlZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVtZW50O1xuICAgICAgICAgICAgY2FzZSBcIkNoYXJnZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJnZTtcbiAgICAgICAgICAgIGNhc2UgXCJMb2JcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2I7XG4gICAgICAgICAgICBjYXNlIFwiU21hc2hcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zbWFzaDtcbiAgICAgICAgICAgIGNhc2UgXCJTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdHI7XG4gICAgICAgICAgICBjYXNlIFwiRGV4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV4O1xuICAgICAgICAgICAgY2FzZSBcIlN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YTtcbiAgICAgICAgICAgIGNhc2UgXCJXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lsO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RyO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfZGV4O1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdGFcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RhO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X3dpbDtcbiAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZlO1xuICAgICAgICAgICAgY2FzZSBcIlF1aWNrc2xvdHNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5xdWlja3Nsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkJ1ZmZzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1ZmZzbG90cztcbiAgICAgICAgICAgIGNhc2UgXCJIUFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhwO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHNob3BfaW5kZXg6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgZ2FjaGFfaW5kZXg6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBwcmljZTogbnVtYmVyID0gMCxcbiAgICAgICAgcmVhZG9ubHkgYXA6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgLyoqIExpc3RlZCBpbiB0aGUgbGl2ZSBzaG9wIGNhdGFsb2cgKGBlbmFibGVkYCkuICovXG4gICAgICAgIHJlYWRvbmx5IGVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbiBiZSBwdXJjaGFzZWQgd2l0aCBHb2xkL0FQLiBGYWxzZSB3aGVuIFNob3BfSW5pMyBgTm9idXniiaAwYFxuICAgICAgICAgKiBldmVuIGlmIHRoZSBjYXRhbG9nIHN0aWxsIGxpc3RzIHRoZSBwcm9kdWN0IGFzIGVuYWJsZWQuXG4gICAgICAgICAqL1xuICAgICAgICByZWFkb25seSBwdXJjaGFzYWJsZTogYm9vbGVhbiA9IHRydWUsXG4gICAgKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIGNoYXJhY3RlcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvcF9pdGVtcy5zZXQoY2hhcmFjdGVyLCBuZXcgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPigpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkKGl0ZW06IEl0ZW0sIHByb2JhYmlsaXR5OiBudW1iZXIsIGNoYXJhY3RlcjogQ2hhcmFjdGVyLCBxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGl0ZW0uY2hhcmFjdGVyICYmIGl0ZW0uY2hhcmFjdGVyICE9PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIC8vIExvdHRlcnkgZmlsZXMgbGlzdCBldmVyeSBjaGFyYWN0ZXIncyBnZWFyIHVuZGVyIGVhY2ggTG90dGVyeUl0ZW1fKiBibG9jay5cbiAgICAgICAgICAgIC8vIFJvdXRlIHRoZSBlbnRyeSB0byB0aGUgaXRlbSdzIG93bmluZyBjaGFyYWN0ZXIgc28gZmlsdGVycyBzdGF5IG1lYW5pbmdmdWwuXG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBpdGVtLmNoYXJhY3RlcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXAgPSB0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhO1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IG1hcC5nZXQoaXRlbSk7XG4gICAgICAgIC8vIFNhbWUgSXRlbSBjYW4gYXBwZWFyIG9uY2UgcGVyIGNoYXJhY3Rlci1ibG9jayAoZS5nLiA3w5cgRHJhZ29uIEFybW9yIGF0IDElKS5cbiAgICAgICAgLy8gQWNjdW11bGF0ZSBDaGFuc1BlciBpbnN0ZWFkIG9mIG92ZXJ3cml0aW5nIOKAlCBvdGhlcndpc2UgcmF0ZXMgc3RheSBzdHVjayBhdCAxJVxuICAgICAgICAvLyB3aGlsZSBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgc3RpbGwgc3VtcyB0byAxMDAgKG1hcCB0aWNrZXRzIOKJqiBwb29sIHRvdGFsKS5cbiAgICAgICAgaWYgKHByZXZpb3VzKSB7XG4gICAgICAgICAgICBtYXAuc2V0KGl0ZW0sIFtcbiAgICAgICAgICAgICAgICBwcmV2aW91c1swXSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgIE1hdGgubWluKHByZXZpb3VzWzFdLCBxdWFudGl0eV9taW4pLFxuICAgICAgICAgICAgICAgIE1hdGgubWF4KHByZXZpb3VzWzJdLCBxdWFudGl0eV9tYXgpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtYXAuc2V0KGl0ZW0sIFtwcm9iYWJpbGl0eSwgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5zZXQoY2hhcmFjdGVyLCBwcm9iYWJpbGl0eSArICh0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSB8fCAwKSk7XG4gICAgfVxuXG4gICAgYXZlcmFnZV90cmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBjaGFyczogcmVhZG9ubHkgQ2hhcmFjdGVyW10gPSBjaGFyYWN0ZXIgPyAoW2NoYXJhY3Rlcl0pIDogY2hhcmFjdGVycztcbiAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSBjaGFycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArICh0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhLmdldChpdGVtKT8uWzBdIHx8IDApLCAwKTtcbiAgICAgICAgaWYgKHByb2JhYmlsaXR5ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b3RhbF9wcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICAgICAgcmV0dXJuIHRvdGFsX3Byb2JhYmlsaXR5IC8gcHJvYmFiaWxpdHk7XG4gICAgfVxuXG4gICAgZ2V0IHRvdGFsX3Byb2JhYmlsaXR5KCkge1xuICAgICAgICByZXR1cm4gY2hhcmFjdGVycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpISwgMCk7XG4gICAgfVxuXG4gICAgY2hhcmFjdGVyX3Byb2JhYmlsaXR5ID0gbmV3IE1hcDxDaGFyYWN0ZXIsIG51bWJlcj4oKTtcbiAgICBzaG9wX2l0ZW1zID0gbmV3IE1hcDxDaGFyYWN0ZXIsIE1hcDxJdGVtLCBbLypwcm9iYWJpbGl0eToqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWluOiovIG51bWJlciwgLypxdWFudGl0eV9tYXg6Ki8gbnVtYmVyXT4+KCk7XG59XG5cbmV4cG9ydCBsZXQgaXRlbXMgPSBuZXcgTWFwPG51bWJlciwgSXRlbT4oKTtcbmV4cG9ydCBsZXQgc2hvcF9pdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBnYWNoYXMgPSBuZXcgTWFwPG51bWJlciwgR2FjaGE+KCk7XG5sZXQgZGlhbG9nOiBIVE1MRGlhbG9nRWxlbWVudCB8IHVuZGVmaW5lZDtcbnR5cGUgSXRlbUFydEVudHJ5ID0gW3NoZWV0OiBzdHJpbmcsIGNlbGw6IG51bWJlcl07XG50eXBlIEl0ZW1BcnRTaGVldCA9IHtcbiAgICBsaW5lQ291bnQ6IG51bWJlcjtcbiAgICBzaXplOiBudW1iZXI7XG4gICAgc3BhY2U6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xufTtcbnR5cGUgTG90dGVyeUFydEVudHJ5ID0ge1xuICAgIHNoZWV0OiBzdHJpbmc7XG4gICAgY2VsbDogbnVtYmVyO1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgc2hhcGU6IFwiY29pblwiIHwgXCJjdWJlXCIgfCBcInRva2VuXCI7XG59O1xudHlwZSBJdGVtQXJ0TWFwID0ge1xuICAgIGl0ZW1zOiBSZWNvcmQ8c3RyaW5nLCBJdGVtQXJ0RW50cnk+O1xuICAgIGxvdHRlcmllczogUmVjb3JkPHN0cmluZywgTG90dGVyeUFydEVudHJ5PjtcbiAgICBzaGVldHM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRTaGVldD47XG59O1xubGV0IGl0ZW1BcnRNYXA6IEl0ZW1BcnRNYXAgPSB7IGl0ZW1zOiB7fSwgbG90dGVyaWVzOiB7fSwgc2hlZXRzOiB7fSB9O1xubGV0IG1hcEFydE1hcDogTWFwQXJ0Q2F0YWxvZyA9IHsgZmlsZXM6IHt9LCBieU5hbWU6IHt9IH07XG5sZXQgc3RhZ2VCb3NzQ2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZyA9IHsgYm9zc2VzOiB7fSwgZ3VhcmRpYW5zOiB7fSwgc3RhZ2VzOiB7fSB9O1xudHlwZSBCb3NzQXJ0Q2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBieUJvc3NJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xuICAgIHJlYWRvbmx5IGJ5UmVzSWQ/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PjtcbiAgICByZWFkb25seSBmaWxlcz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHsgcmVhZG9ubHkgZmlsZTogc3RyaW5nIH0+Pjtcbn07XG5sZXQgYm9zc0FydENhdGFsb2c6IEJvc3NBcnRDYXRhbG9nID0ge307XG5cbmZ1bmN0aW9uIHByZXR0eU51bWJlcihuOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyKSB7XG4gICAgbGV0IHMgPSBuLnRvRml4ZWQoZGlnaXRzKTtcbiAgICB3aGlsZSAocy5lbmRzV2l0aChcIjBcIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICBpZiAocy5lbmRzV2l0aChcIi5cIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbn1cblxuZnVuY3Rpb24gcGFyc2VJdGVtRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPCAxMDAwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgSXRlbXMgZmlsZSBpcyBvbmx5ICR7ZGF0YS5sZW5ndGh9IGJ5dGVzIGxvbmdgKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCByZXN1bHRdIG9mIGRhdGEubWF0Y2hBbGwoL1xcPEl0ZW0gKC4qKVxcL1xcPi9nKSkge1xuICAgICAgICBjb25zdCBpdGVtOiBJdGVtID0gbmV3IEl0ZW07XG4gICAgICAgIGZvciAoY29uc3QgWywgYXR0cmlidXRlLCB2YWx1ZV0gb2YgcmVzdWx0Lm1hdGNoQWxsKC9cXHM/KFtePV0qKT1cIihbXlwiXSopXCIvZykpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkluZGV4XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaWQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJfTmFtZV9cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2tyID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJOYW1lX05cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJVc2VUeXBlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udXNlVHlwZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTWF4VXNlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4VXNlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiSGlkZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhpZGRlbiA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmVzaXN0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVzaXN0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyXCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJOSUtJXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIk5pa2lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVU5MVU5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFVDWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdWN5XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU0hVQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJTaHVhXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiREhBTlBJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJEaGFucGlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUE9DSElcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiUG9jaGlcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBTFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJBbFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHt2YWx1ZX1cImApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJQYXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJBR1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiQmFja3BhY2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJHTEFTU0VTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJGYWNlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFORFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNPQ0tTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJTb2Nrc1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkZPT1RcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNob2VzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQ0FQXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQQU5UU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiTG93ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJSQUNLRVRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlJhY2tldFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJPRFlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlVwcGVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFpclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRZRVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiRHllXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBwYXJ0ICR7dmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkxldmVsXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGV2ZWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHIgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVEFcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdGEgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZXggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJXSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS53aWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRIUFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhwID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkUXVpY2tcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5xdWlja3Nsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkQnVmZlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmJ1ZmZzbG90cyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNtYXNoU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zbWFzaCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1vdmVTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1vdmVtZW50ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2hhcmdlc2hvdFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmdlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTG9iU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sb2IgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc2VydmUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RSXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0ciA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdHIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1NUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9zdGEgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9ERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfZGV4ID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfV0lMXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3dpbCA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS53aWwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRW5jaGFudEVsZW1lbnRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmFibGVQYXJjZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJjZWxfZW5hYmxlZCA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQmFsbFNwaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zcGluID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQVRTU1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmF0c3MgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERlNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGZzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNvY2tldFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvY2tldCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJHYXVnZUJhdHRsZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdhdWdlX2JhdHRsZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGl0ZW0gYXR0cmlidXRlIFwiJHthdHRyaWJ1dGV9XCJgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpdGVtcy5zZXQoaXRlbS5pZCwgaXRlbSk7XG4gICAgfVxufVxuXG5jbGFzcyBBcGlJdGVtIHtcbiAgICBwcm9kdWN0SW5kZXggPSAwO1xuICAgIGRpc3BsYXkgPSAwO1xuICAgIGhpdERpc3BsYXkgPSBmYWxzZTtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgdXNlMCA9IDA7XG4gICAgdXNlMSA9IDA7XG4gICAgdXNlMiA9IDA7XG4gICAgcHJpY2VUeXBlID0gXCJHT0xEXCI7XG4gICAgb2xkUHJpY2UwID0gMDtcbiAgICBvbGRQcmljZTEgPSAwO1xuICAgIG9sZFByaWNlMiA9IDA7XG4gICAgcHJpY2UwID0gMDtcbiAgICBwcmljZTEgPSAwO1xuICAgIHByaWNlMiA9IDA7XG4gICAgY291cGxlUHJpY2UgPSAwO1xuICAgIGNhdGVnb3J5ID0gXCJcIjtcbiAgICBuYW1lID0gXCJcIjtcbiAgICBnb2xkQmFjayA9IDA7XG4gICAgZW5hYmxlUGFyY2VsID0gZmFsc2U7XG4gICAgZm9yUGxheWVyID0gMDtcbiAgICBpdGVtMCA9IDA7XG4gICAgaXRlbTEgPSAwO1xuICAgIGl0ZW0yID0gMDtcbiAgICBpdGVtMyA9IDA7XG4gICAgaXRlbTQgPSAwO1xuICAgIGl0ZW01ID0gMDtcbiAgICBpdGVtNiA9IDA7XG4gICAgaXRlbTcgPSAwO1xuICAgIGl0ZW04ID0gMDtcbiAgICBpdGVtOSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzQXBpSXRlbShvYmo6IGFueSk6IG9iaiBpcyBBcGlJdGVtIHtcbiAgICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlb2Ygb2JqLnByb2R1Y3RJbmRleCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5kaXNwbGF5ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmhpdERpc3BsYXkgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmVuYWJsZWQgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UxID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2VUeXBlID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNvdXBsZVByaWNlID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNhdGVnb3J5ID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZ29sZEJhY2sgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlUGFyY2VsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgdHlwZW9mIG9iai5mb3JQbGF5ZXIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTAgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTMgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTQgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTUgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTYgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTcgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTggPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTkgPT09IFwibnVtYmVyXCJcbiAgICBdLmV2ZXJ5KGIgPT4gYik7XG59XG5cbi8qKiBQcm9kdWN0IGluZGV4ZXMgdGhhdCByZWplY3Qgc2hvcCBidXlzIChTaG9wX0luaTMgTm9idXniiaAwKS4gTGl2ZSBBUEkgb21pdHMgdGhpcyBmaWVsZC4gKi9cbmxldCBzaG9wTm9idXlQcm9kdWN0SW5kZXhlczogUmVhZG9ubHlTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcblxuZnVuY3Rpb24gaXNTaG9wUHVyY2hhc2FibGUocHJvZHVjdEluZGV4OiBudW1iZXIsIGVuYWJsZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZW5hYmxlZCAmJiAhc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMuaGFzKHByb2R1Y3RJbmRleCk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXBpU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBhcGlJdGVtIG9mIEpTT04ucGFyc2UoZGF0YSkpIHtcbiAgICAgICAgaWYgKCFpc0FwaUl0ZW0oYXBpSXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEluY29ycmVjdCBmb3JtYXQgb2YgaXRlbTogJHtkYXRhfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IFtcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0xLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTMsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW00LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNSxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTYsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW03LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTksXG4gICAgICAgIF0uZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBjb25zdCBwdXJjaGFzYWJsZSA9IGlzU2hvcFB1cmNoYXNhYmxlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLmVuYWJsZWQpO1xuXG4gICAgICAgIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIlBBUlRTXCIpIHtcbiAgICAgICAgICAgIGlmIChpbm5lcl9pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaW5uZXJfaXRlbXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE9ubHkgcmVhbCBwdXJjaGFzZSBwYXRocyBjb3VudCBhcyBzaG9wIHNvdXJjZXMgKGV4Y2x1ZGUgTm9idXkgY2F0YWxvZyByb3dzKS5cbiAgICAgICAgICAgIGlmIChwdXJjaGFzYWJsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBuZXcgU2hvcEl0ZW1Tb3VyY2UoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0ucHJpY2UwLCBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsIGlubmVyX2l0ZW1zKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaW5uZXJfaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goaXRlbVNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFwaUl0ZW0uY2F0ZWdvcnkgPT09IFwiTE9UVEVSWVwiKSB7XG4gICAgICAgICAgICBnYWNoYXMuc2V0KFxuICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJvZHVjdEluZGV4LFxuICAgICAgICAgICAgICAgIG5ldyBHYWNoYShcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcm9kdWN0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcmljZTAsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIixcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5lbmFibGVkLFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzYWJsZSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAvLyBQcm9kdWN0IGluZGV4IGlzIHRoZSBzaG9wX2l0ZW1zIC8gZ2FjaGFzIGtleSDigJQgcmVxdWlyZWQgc28gcmV3YXJkIHRpbGVzXG4gICAgICAgICAgICAvLyBjYW4gcmVzb2x2ZSBjb2luIGFydCB3aXRoIGdhY2hhcy5nZXQoaXRlbS5pZCkgdGhlIHNhbWUgd2F5IHRoZSB0YWJsZSBkb2VzLlxuICAgICAgICAgICAgZ2FjaGFJdGVtLmlkID0gYXBpSXRlbS5wcm9kdWN0SW5kZXg7XG4gICAgICAgICAgICBnYWNoYUl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBnYWNoYUl0ZW0pO1xuICAgICAgICAgICAgaWYgKHB1cmNoYXNhYmxlKSB7XG4gICAgICAgICAgICAgICAgZ2FjaGFJdGVtLnNvdXJjZXMucHVzaChuZXcgU2hvcEl0ZW1Tb3VyY2UoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0ucHJpY2UwLCBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsIGlubmVyX2l0ZW1zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlckl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgb3RoZXJJdGVtLmlkID0gYXBpSXRlbS5wcm9kdWN0SW5kZXg7XG4gICAgICAgICAgICBvdGhlckl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBvdGhlckl0ZW0pO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR2FjaGFEYXRhKGRhdGE6IHN0cmluZywgZ2FjaGE6IEdhY2hhKSB7XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGRhdGEuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgaWYgKCFsaW5lLmluY2x1ZGVzKFwiPExvdHRlcnlJdGVtX1wiKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9cXHMqPExvdHRlcnlJdGVtXyg/PGNoYXJhY3Rlcj5bXiBdKikgSW5kZXg9XCJcXGQrXCIgX05hbWVfPVwiW15cIl0qXCIgU2hvcEluZGV4PVwiKD88c2hvcF9pZD5cXGQrKVwiIFF1YW50aXR5TWluPVwiKD88cXVhbnRpdHlfbWluPlxcZCspXCIgUXVhbnRpdHlNYXg9XCIoPzxxdWFudGl0eV9tYXg+XFxkKylcIiBDaGFuc1Blcj1cIig/PHByb2JhYmlsaXR5PlxcZCtcXC4/XFxkKilcXHMqXCIgRWZmZWN0PVwiXFxkK1wiIFByb2R1Y3RPcHQ9XCJcXGQrXCJcXC8+Lyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHBhcnNpbmcgZ2FjaGEgJHtnYWNoYS5nYWNoYV9pbmRleH06XFxuJHtsaW5lfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGFyYWN0ZXIgPSBtYXRjaC5ncm91cHMuY2hhcmFjdGVyO1xuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBcIkx1bmx1blwiKSB7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7Y2hhcmFjdGVyfVwiIGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5zaG9wX2lkKSk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHNob3AgaXRlbSBpZCAke21hdGNoLmdyb3Vwcy5zaG9wX2lkfSBpbiBsb3R0ZXJ5IGZpbGUgJHtnYWNoYS5nYWNoYV9pbmRleH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGdhY2hhLmFkZChpdGVtLCBwYXJzZUZsb2F0KG1hdGNoLmdyb3Vwcy5wcm9iYWJpbGl0eSksIGNoYXJhY3RlciwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21pbiksIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5xdWFudGl0eV9tYXgpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCBtYXBdIG9mIGdhY2hhLnNob3BfaXRlbXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaXRlbSxdIG9mIG1hcCkge1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2gobmV3IEdhY2hhSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR3VhcmRpYW5EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGd1YXJkaWFuRGF0YSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROdW1iZXIobzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YgbyA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYm9zc1RpbWVJbmZvID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hcEluZm8gb2YgZ3VhcmRpYW5EYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwSW5mbyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFwX25hbWUgPSBtYXBJbmZvLk5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwX25hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJld2FyZHMgPSBBcnJheS5pc0FycmF5KG1hcEluZm8uUmV3YXJkcykgPyBbLi4ubWFwSW5mby5SZXdhcmRzXSA6IFtdO1xuICAgICAgICBjb25zdCByZXdhcmRfaXRlbXMgPSByZXdhcmRzXG4gICAgICAgICAgICAuZmlsdGVyKChzaG9wX2lkKTogc2hvcF9pZCBpcyBudW1iZXIgPT4gdHlwZW9mIHNob3BfaWQgPT09IFwibnVtYmVyXCIgJiYgc2hvcF9pdGVtcy5oYXMoc2hvcF9pZCkpXG4gICAgICAgICAgICAubWFwKHNob3BfaWQgPT4gc2hvcF9pdGVtcy5nZXQoc2hvcF9pZCkhKTtcbiAgICAgICAgY29uc3QgRXhwTXVsdGlwbGllciA9IGdldE51bWJlcihtYXBJbmZvLkV4cE11bHRpcGxpZXIpIHx8IDA7XG4gICAgICAgIGNvbnN0IElzQm9zc1N0YWdlID0gISFtYXBJbmZvLklzQm9zc1N0YWdlO1xuICAgICAgICBjb25zdCBNYXBJRCA9IGdldE51bWJlcihtYXBJbmZvLk1hcElkKSB8fCAwO1xuICAgICAgICBsZXQgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGdldE51bWJlcihtYXBJbmZvLkJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpIHx8IC0xO1xuICAgICAgICBpZiAoQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9PT0gLTEpIHtcbiAgICAgICAgICAgIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPSBib3NzVGltZUluZm8uZ2V0KE1hcElEKSB8fCAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXBJRCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJvc3NUaW1lSW5mby5zZXQoTWFwSUQsIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXdhcmRfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShtYXBfbmFtZSwgcmV3YXJkX2l0ZW1zLCBFeHBNdWx0aXBsaWVyLCBJc0Jvc3NTdGFnZSwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChndWFyZGlhblNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB0eXBlIFByb2R1Y3RTdGFnZURyb3AgPSB7XG4gICAgcmVhZG9ubHkgbWFwOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbmVlZEJvc3M6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgeHA/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgYm9zc1RpbWU/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBQcm9kdWN0U3RhZ2VEcm9wc0NhdGFsb2cgPSB7XG4gICAgcmVhZG9ubHkgcHJvZHVjdHM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCByZWFkb25seSBQcm9kdWN0U3RhZ2VEcm9wW10+Pjtcbn07XG5cbi8qKlxuICogTWVyZ2UgU19SZWxhdGlvbnNoaXBzLWRlcml2ZWQgYm9zcy9tYXAgZHJvcHMgb250byBzaG9wIHByb2R1Y3RzLlxuICogRGVkdXBlcyBieSBndWFyZGlhbiBtYXAgbmFtZSBzbyBHdWFyZGlhblN0YWdlcyBSZXdhcmRzIHBhdGhzIGFyZSBub3QgZG91YmxlZC5cbiAqIFRoaXMgaXMgd2hhdCBtYWtlcyBOb2J1eSBjb2lucyBsaWtlIEJsdWUgQ2Fwc3VsZSBhbnN3ZXIgXCJ3aGVyZSBkbyBJIGdldCB0aGlzP1wiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQcm9kdWN0U3RhZ2VEcm9wcyhjYXRhbG9nOiBQcm9kdWN0U3RhZ2VEcm9wc0NhdGFsb2cpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9kdWN0cyA9IGNhdGFsb2cucHJvZHVjdHM7XG4gICAgaWYgKCFwcm9kdWN0cyB8fCB0eXBlb2YgcHJvZHVjdHMgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtwcm9kdWN0S2V5LCBkcm9wc10gb2YgT2JqZWN0LmVudHJpZXMocHJvZHVjdHMpKSB7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RJbmRleCA9IE51bWJlcihwcm9kdWN0S2V5KTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUocHJvZHVjdEluZGV4KSB8fCAhQXJyYXkuaXNBcnJheShkcm9wcykpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBzaG9wX2l0ZW1zLmdldChwcm9kdWN0SW5kZXgpO1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTWFwcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICBpdGVtLnNvdXJjZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChzb3VyY2UpOiBzb3VyY2UgaXMgR3VhcmRpYW5JdGVtU291cmNlID0+IHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSlcbiAgICAgICAgICAgICAgICAubWFwKChzb3VyY2UpID0+IHNvdXJjZS5ndWFyZGlhbl9tYXApLFxuICAgICAgICApO1xuICAgICAgICBmb3IgKGNvbnN0IGRyb3Agb2YgZHJvcHMpIHtcbiAgICAgICAgICAgIGlmICghZHJvcCB8fCB0eXBlb2YgZHJvcC5tYXAgIT09IFwic3RyaW5nXCIgfHwgZHJvcC5tYXAubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdNYXBzLmhhcyhkcm9wLm1hcCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4aXN0aW5nTWFwcy5hZGQoZHJvcC5tYXApO1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgZHJvcC5tYXAsXG4gICAgICAgICAgICAgICAgICAgIFtpdGVtXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGRyb3AueHAgPT09IFwibnVtYmVyXCIgPyBkcm9wLnhwIDogMCxcbiAgICAgICAgICAgICAgICAgICAgISFkcm9wLm5lZWRCb3NzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZHJvcC5ib3NzVGltZSA9PT0gXCJudW1iZXJcIiA/IGRyb3AuYm9zc1RpbWUgOiAtMSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqIFVzZXItZmFjaW5nIGxhYi1wcmVwIHBoYXNlcyDigJQgbmV2ZXIgZXhwb3NlIHJhdyBmaWxlbmFtZXMsIHBhdGhzLCBvciBYTUwgbmFtZXMuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZGluZ1BoYXNlRm9yVXJsKHVybDogc3RyaW5nKTogeyB0aXRsZTogc3RyaW5nOyBkZXRhaWw6IHN0cmluZyB9IHtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiSXRlbV9QYXJ0c1wiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiUHJlcGFyaW5nIGVxdWlwbWVudCBjYXRhbG9n4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiR2F0aGVyaW5nIGV2ZXJ5IHdlYXJhYmxlIGZvciBjb21wYXJpc29uLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiL2FwaS9zaG9wXCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJDaGVja2luZyB0aGUgbGl2ZSBzaG9w4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiUmVhZGluZyBHb2xkIGFuZCBBUCBsaXN0aW5ncy5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIkd1YXJkaWFuU3RhZ2VzXCIpIHx8IHVybC5pbmNsdWRlcyhcInByb2R1Y3Qtc3RhZ2UtZHJvcHNcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIk1hcHBpbmcgc3RhZ2UgcmV3YXJkc+KAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIkZpbmRpbmcgd2hlcmUgZ2VhciBhbmQgY29pbnMgZHJvcC5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIkluaTNfTG90XCIpIHx8IHVybC5pbmNsdWRlcyhcImxvdHRlcnlcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkxvYWRpbmcgZ2FjaGEgdGFibGVz4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiTWF0Y2hpbmcgY2Fwc3VsZXMgdG8gdGhlaXIgcHJpemVzLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiaXRlbS1hcnRcIikgfHwgdXJsLmluY2x1ZGVzKFwic2hvcC1ub2J1eVwiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiRmluaXNoaW5nIHRoZSBsYWLigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJTeW5jaW5nIGFydCBhbmQgc2FsZSBzdGF0dXMuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBcIk9wZW5pbmcgdGhlIGVxdWlwbWVudCBsYWLigKZcIixcbiAgICAgICAgZGV0YWlsOiBcIkFsbW9zdCByZWFkeSB0byBjb21wYXJlIGdlYXIuXCIsXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2V0TG9hZGluZ1BoYXNlKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcGhhc2UgPSBsb2FkaW5nUGhhc2VGb3JVcmwodXJsKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ1wiKTtcbiAgICBpZiAodGl0bGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IHBoYXNlLnRpdGxlO1xuICAgIH1cbiAgICBjb25zdCBkZXRhaWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2RldGFpbFwiKTtcbiAgICBpZiAoZGV0YWlsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgZGV0YWlsLnRleHRDb250ZW50ID0gcGhhc2UuZGV0YWlsO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBzZXRMb2FkaW5nUGhhc2UodXJsKTtcbiAgICBjb25zdCByZXBseSA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUrKztcbiAgICB9XG4gICAgaWYgKCFyZXBseS5vaykge1xuICAgICAgICAvLyBLZWVwIHRlY2huaWNhbCBVUkwgZGV0YWlsIGluIHRoZSB0aHJvd24gZXJyb3IgZm9yIGxvZ3M7IFVJIHVzZXMgaHVtYW4gY29weS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCBkb3dubG9hZGluZyAke3VybH06ICR7cmVwbHkuc3RhdHVzfSR7cmVwbHkuc3RhdHVzVGV4dCA/IGAgJHtyZXBseS5zdGF0dXNUZXh0fWAgOiBcIlwifWBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcGx5LnRleHQoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkSXRlbXMoKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSAxMjQ7XG4gICAgfVxuICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9hdXRoLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzXCI7XG4gICAgY29uc3QgZ2FjaGFTb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9nYW1lLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzL2xvdHRlcnlcIjtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L3NlcnZlci1jb3JlL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBpdGVtVVJMID0gaXRlbVNvdXJjZSArIFwiL0l0ZW1fUGFydHNfSW5pMy54bWxcIjtcbiAgICBjb25zdCBpdGVtRGF0YSA9IGRvd25sb2FkKGl0ZW1VUkwpO1xuICAgIC8vIENvbXBhY3QgTm9idXkgaW5kZXggKGZyb20gU2hvcF9JbmkzKSDigJQgbGl2ZSBzaG9wIEFQSSBvbWl0cyB0aGlzIGZpZWxkLlxuICAgIGNvbnN0IHNob3BOb2J1eURhdGEgPSBkb3dubG9hZChcImFzc2V0cy9zaG9wLW5vYnV5LWluZGV4ZXMuanNvblwiKTtcbiAgICAvLyBCb3NzL21hcCBkcm9wcyBmcm9tIFNfUmVsYXRpb25zaGlwcyAoYmV5b25kIEd1YXJkaWFuU3RhZ2VzIFJld2FyZHMgbGlzdHMpLlxuICAgIGNvbnN0IHByb2R1Y3RTdGFnZURyb3BzRGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3Byb2R1Y3Qtc3RhZ2UtZHJvcHMuanNvblwiKTtcbiAgICBjb25zdCBpdGVtQXJ0RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL2l0ZW0tYXJ0LW1hcC5qc29uXCIpO1xuICAgIGNvbnN0IG1hcEFydERhdGEgPSBkb3dubG9hZChcImFzc2V0cy9tYXAtYXJ0LW1hcC5qc29uXCIpO1xuICAgIGNvbnN0IHN0YWdlQm9zc0RhdGEgPSBkb3dubG9hZChcImFzc2V0cy9zdGFnZS1ib3NzZXMuanNvblwiKTtcbiAgICBjb25zdCBib3NzQXJ0RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL2Jvc3MtYXJ0LW1hcC5qc29uXCIpO1xuICAgIGNvbnN0IG1heF9zaG9wX3BhZ2VzID0gMjA7IC8vY3VycmVudGx5IG5lZWQgb25seSAxMCwgc2hvdWxkIGJlIGVub3VnaFxuICAgIGNvbnN0IHNob3BVUkxzID0gbG9jYXRpb24uaG9zdG5hbWUuZW5kc1dpdGgoXCIuZ2l0aHViLmlvXCIpXG4gICAgICAgID8gWy4uLkFycmF5KG1heF9zaG9wX3BhZ2VzKS5rZXlzKCldLm1hcChuID0+IG5ldyBVUkwoYHNob3AvJHtufS5qc29uYCwgZG9jdW1lbnQuYmFzZVVSSSkuaHJlZilcbiAgICAgICAgOiBbLi4uQXJyYXkobWF4X3Nob3BfcGFnZXMpLmtleXMoKV0ubWFwKG4gPT4gYC9hcGkvc2hvcD9zaXplPTEwMDAmcGFnZT0ke259YCk7XG4gICAgY29uc3Qgc2hvcERhdGFzID0gc2hvcFVSTHMubWFwKGRvd25sb2FkKTtcbiAgICBjb25zdCBndWFyZGlhblVSTCA9IGd1YXJkaWFuU291cmNlICsgXCIvR3VhcmRpYW5TdGFnZXMuanNvblwiO1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IGRvd25sb2FkKGd1YXJkaWFuVVJMKTtcbiAgICBwYXJzZUl0ZW1EYXRhKGF3YWl0IGl0ZW1EYXRhKTtcbiAgICBpdGVtQXJ0TWFwID0gSlNPTi5wYXJzZShhd2FpdCBpdGVtQXJ0RGF0YSkgYXMgSXRlbUFydE1hcDtcbiAgICB0cnkge1xuICAgICAgICBtYXBBcnRNYXAgPSBKU09OLnBhcnNlKGF3YWl0IG1hcEFydERhdGEpIGFzIE1hcEFydENhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIG1hcCBhcnQgY2F0YWxvZzogJHtlfWApO1xuICAgICAgICBtYXBBcnRNYXAgPSB7IGZpbGVzOiB7fSwgYnlOYW1lOiB7fSB9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBzdGFnZUJvc3NDYXRhbG9nID0gSlNPTi5wYXJzZShhd2FpdCBzdGFnZUJvc3NEYXRhKSBhcyBTdGFnZUJvc3NDYXRhbG9nO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBzdGFnZSBib3NzIGNhdGFsb2c6ICR7ZX1gKTtcbiAgICAgICAgc3RhZ2VCb3NzQ2F0YWxvZyA9IHsgYm9zc2VzOiB7fSwgZ3VhcmRpYW5zOiB7fSwgc3RhZ2VzOiB7fSB9O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBib3NzQXJ0Q2F0YWxvZyA9IEpTT04ucGFyc2UoYXdhaXQgYm9zc0FydERhdGEpIGFzIEJvc3NBcnRDYXRhbG9nO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBib3NzIGFydCBjYXRhbG9nOiAke2V9YCk7XG4gICAgICAgIGJvc3NBcnRDYXRhbG9nID0ge307XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5vYnV5SnNvbiA9IEpTT04ucGFyc2UoYXdhaXQgc2hvcE5vYnV5RGF0YSkgYXMge1xuICAgICAgICAgICAgcHJvZHVjdEluZGV4ZXM/OiB1bmtub3duO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBpbmRleGVzID0gQXJyYXkuaXNBcnJheShub2J1eUpzb24ucHJvZHVjdEluZGV4ZXMpXG4gICAgICAgICAgICA/IG5vYnV5SnNvbi5wcm9kdWN0SW5kZXhlcy5maWx0ZXIoKG4pOiBuIGlzIG51bWJlciA9PiB0eXBlb2YgbiA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgIDogW107XG4gICAgICAgIHNob3BOb2J1eVByb2R1Y3RJbmRleGVzID0gbmV3IFNldChpbmRleGVzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgc2hvcCBOb2J1eSBpbmRleDogJHtlfWApO1xuICAgICAgICBzaG9wTm9idXlQcm9kdWN0SW5kZXhlcyA9IG5ldyBTZXQoKTtcbiAgICB9XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoc2hvcERhdGFzLm1hcChwID0+IHAudGhlbihkYXRhID0+IHBhcnNlQXBpU2hvcERhdGEoZGF0YSkpKSk7XG5cbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlID0gMDtcbiAgICAgICAgcHJvZ3Jlc3NiYXIubWF4ID0gZ2FjaGFzLnNpemUgKyA0O1xuICAgIH1cbiAgICBjb25zdCBnYWNoYV9pdGVtczogW1Byb21pc2U8c3RyaW5nPiwgR2FjaGEsIHN0cmluZ11bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgWywgZ2FjaGFdIG9mIGdhY2hhcykge1xuICAgICAgICBjb25zdCBnYWNoYV91cmwgPSBgJHtnYWNoYVNvdXJjZX0vSW5pM19Mb3RfJHtgJHtnYWNoYS5nYWNoYV9pbmRleH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX0ueG1sYDtcbiAgICAgICAgZ2FjaGFfaXRlbXMucHVzaChbZG93bmxvYWQoZ2FjaGFfdXJsKSwgZ2FjaGEsIGdhY2hhX3VybF0pO1xuICAgIH1cbiAgICBwYXJzZUd1YXJkaWFuRGF0YShhd2FpdCBndWFyZGlhbkRhdGEpO1xuICAgIHRyeSB7XG4gICAgICAgIGFwcGx5UHJvZHVjdFN0YWdlRHJvcHMoSlNPTi5wYXJzZShhd2FpdCBwcm9kdWN0U3RhZ2VEcm9wc0RhdGEpIGFzIFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIHByb2R1Y3Qgc3RhZ2UgZHJvcHM6ICR7ZX1gKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbaXRlbSwgZ2FjaGEsIGdhY2hhX3VybF0gb2YgZ2FjaGFfaXRlbXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcnNlR2FjaGFEYXRhKGF3YWl0IGl0ZW0sIGdhY2hhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgZG93bmxvYWRpbmcgJHtnYWNoYV91cmx9IGJlY2F1c2UgJHtlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKiogQmFuL2NpcmNsZS1zbGFzaCBpY29uIGZvciBleGNsdWRlIOKAlCBvdXRsaW5lIFNWRywgcmVjb2xvcmVkIHZpYSBjdXJyZW50Q29sb3IuICovXG5mdW5jdGlvbiBjcmVhdGVFeGNsdWRlSWNvbigpOiBTVkdTVkdFbGVtZW50IHtcbiAgICBjb25zdCBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcbiAgICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwic3ZnXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIml0ZW1fcmVtb3ZhbF9faWNvblwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLCBcIjAgMCAyNCAyNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxNlwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTZcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiZm9jdXNhYmxlXCIsIFwiZmFsc2VcIik7XG5cbiAgICBjb25zdCBjaXJjbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwiY2lyY2xlXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBcIjEyXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJjeVwiLCBcIjEyXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJyXCIsIFwiOVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBcImN1cnJlbnRDb2xvclwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMlwiKTtcblxuICAgIGNvbnN0IHNsYXNoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcImxpbmVcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieDFcIiwgXCI3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInkxXCIsIFwiN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ4MlwiLCBcIjE3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInkyXCIsIFwiMTdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBcIjJcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVjYXBcIiwgXCJyb3VuZFwiKTtcblxuICAgIHN2Zy5hcHBlbmQoY2lyY2xlLCBzbGFzaCk7XG4gICAgcmV0dXJuIHN2Zztcbn1cblxuZnVuY3Rpb24gZGVsZXRhYmxlSXRlbShpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBleGNsdWRlTGFiZWwgPSBgRXhjbHVkZSAke2l0ZW0ubmFtZV9lbn0gZnJvbSByZXN1bHRzYDtcbiAgICBjb25zdCBleGNsdWRlQnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW1fcmVtb3ZhbFwiLFxuICAgICAgICAgICAgXCJkYXRhLWl0ZW1faW5kZXhcIjogYCR7aXRlbS5pZH1gLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGV4Y2x1ZGVMYWJlbCxcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICB0aXRsZTogZXhjbHVkZUxhYmVsLFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIGV4Y2x1ZGVCdXR0b24uYXBwZW5kKGNyZWF0ZUV4Y2x1ZGVJY29uKCkpO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlcIiB9LFxuICAgICAgICBleGNsdWRlQnV0dG9uLFxuICAgICAgICBbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWlkZW50aXR5X19tZXRhXCIgfSxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1EZXRhaWxzVHJpZ2dlcihpdGVtLCBjaGFyYWN0ZXIpLFxuICAgICAgICAgICAgY3JlYXRlSXRlbUF2YWlsYWJpbGl0eUJhZGdlKGl0ZW0pLFxuICAgICAgICBdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBsb2NrQmFja2dyb3VuZFNjcm9sbCgpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRpYWxvZy1vcGVuXCIpO1xufVxuXG5mdW5jdGlvbiB1bmxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCkge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZGlhbG9nLW9wZW5cIik7XG59XG5cbmZ1bmN0aW9uIHNob3dEaWFsb2coXG4gICAgdHJpZ2dlcjogSFRNTEJ1dHRvbkVsZW1lbnQsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSxcbiAgICBkaWFsb2dDbGFzcz86IHN0cmluZyxcbikge1xuICAgIGNvbnN0IHRvcERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wX2RpdlwiKTtcbiAgICBpZiAoISh0b3BEaXYgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGlhbG9nKSB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gZGlhbG9nO1xuICAgICAgICBwcmV2aW91cy5jbG9zZSgpO1xuICAgICAgICBwcmV2aW91cy5yZW1vdmUoKTtcbiAgICB9XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGRpYWxvZ0NsYXNzID8gYCR7ZGlhbG9nQ2xhc3N9X19jbG9zZWAgOiBcImRpYWxvZ19fY2xvc2VcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiQ2xvc2VcIixcbiAgICBdKTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ge1xuICAgICAgICAuLi4oZGlhbG9nQ2xhc3MgPyB7IGNsYXNzOiBkaWFsb2dDbGFzcyB9IDoge30pLFxuICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgfTtcbiAgICBkaWFsb2cgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpXG4gICAgICAgID8gY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgLi4uY29udGVudCwgY2xvc2VCdXR0b25dKVxuICAgICAgICA6IGNyZWF0ZUhUTUwoW1wiZGlhbG9nXCIsIGF0dHJpYnV0ZXMsIGNvbnRlbnQsIGNsb3NlQnV0dG9uXSk7XG4gICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gZGlhbG9nPy5jbG9zZSgpKTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGRpYWxvZz8ucmVtb3ZlKCk7XG4gICAgICAgIGRpYWxvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdW5sb2NrQmFja2dyb3VuZFNjcm9sbCgpO1xuICAgICAgICB0cmlnZ2VyLmZvY3VzKCk7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIHRvcERpdi5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICBsb2NrQmFja2dyb3VuZFNjcm9sbCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9wdXBMaW5rKFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSxcbiAgICBkaWFsb2dDbGFzcz86IHN0cmluZyxcbikge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJwb3B1cF9saW5rXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICB9LFxuICAgICAgICB0ZXh0LFxuICAgIF0pO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93RGlhbG9nKGJ1dHRvbiwgYCR7dGV4dH0gZGV0YWlsc2AsIGNvbnRlbnQsIGRpYWxvZ0NsYXNzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcmlvcml0eVN0YXRIZWFkZXJDZWxsKFxuICAgIHN0YXQ6IHN0cmluZyxcbiAgICBwcmltYXJ5OiBib29sZWFuLFxuKTogSFRNTFRhYmxlQ2VsbEVsZW1lbnQge1xuICAgIGNvbnN0IHsgc2hvcnQsIGZ1bGwsIGFiYnJldmlhdGVkIH0gPSBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5KHN0YXQpO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7XG4gICAgICAgIGNsYXNzOiBcIm51bWVyaWNcIixcbiAgICAgICAgc2NvcGU6IFwiY29sXCIsXG4gICAgICAgIC4uLihwcmltYXJ5ID8geyBcImFyaWEtc29ydFwiOiBcImRlc2NlbmRpbmdcIiB9IDoge30pLFxuICAgIH07XG4gICAgaWYgKCFhYmJyZXZpYXRlZCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0aFwiLCBhdHRyaWJ1dGVzLCBzaG9ydF0pO1xuICAgIH1cbiAgICBjb25zdCBwb3B1cCA9IGNyZWF0ZVBvcHVwTGluayhzaG9ydCwgY3JlYXRlSFRNTChbXCJwXCIsIGZ1bGxdKSk7XG4gICAgcG9wdXAuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgZnVsbCk7XG4gICAgcG9wdXAuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBmdWxsKTtcbiAgICBwb3B1cC5jbGFzc0xpc3QuYWRkKFwicHJpb3JpdHktc3RhdC1oZWFkZXJcIik7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1widGhcIiwgYXR0cmlidXRlcywgcG9wdXBdKTtcbn1cblxuZnVuY3Rpb24gcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gMSAmJiBxdWFudGl0eV9tYXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChxdWFudGl0eV9taW4gPT09IHF1YW50aXR5X21heCkge1xuICAgICAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWF4fWA7XG4gICAgfVxuICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9taW59LSR7cXVhbnRpdHlfbWF4fWA7XG59XG5cbi8qKlxuICogR2FjaGEgZHJvcC1kZXRhaWxzIHRhYmxlOiBJdGVtIHwgQ2hhbmNlIHwgRXhwZWN0ZWQgcHVsbHMuXG4gKiBDaGFyYWN0ZXIgaXMgbmV2ZXIgYSBjb2x1bW4g4oCUIGVxdWlwbWVudCBwb29scyBtaXJyb3IgYWNyb3NzIGNoYXJhY3RlcnMsIHNvIGxpc3RpbmdcbiAqIE5pa2kvTHVuTHVuL+KApiBkdXBsaWNhdGVzIHRoZSBzYW1lIHJvd3MuIFdoZW4gbm8gY2hhcmFjdGVyIGZpbHRlciBpcyBzZXQsIHNhbWUtbmFtZVxuICogcm93cyAod2l0aCB0aGUgc2FtZSBxdWFudGl0eSByYW5nZSkgY29sbGFwc2UgdG8gb25lIGVudHJ5IHVzaW5nIHRoZSBmaXJzdCBwb29sIHJhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShcbiAgICBnYWNoYTogR2FjaGEsXG4gICAgaGlnaGxpZ2h0ZWRJdGVtPzogSXRlbSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pO1xuXG4gICAgdHlwZSBSb3cgPSB7XG4gICAgICAgIGl0ZW06IEl0ZW07XG4gICAgICAgIHByb2JhYmlsaXR5OiBudW1iZXI7XG4gICAgICAgIHF1YW50aXR5X21pbjogbnVtYmVyO1xuICAgICAgICBxdWFudGl0eV9tYXg6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgLy8gQ2hhcmFjdGVyIGZpbHRlcjogYWNjdW11bGF0ZSBieSBJdGVtIGlkZW50aXR5IChoaXN0b3JpY2FsIG1hdGgpLlxuICAgIC8vIFVuZmlsdGVyZWQ6IGNvbGxhcHNlIGJ5IGRpc3BsYXkgbmFtZSArIHF1YW50aXR5IHNvIHBlci1jaGFyYWN0ZXIgY2xvbmVzIGFyZSBvbmUgcm93LlxuICAgIGNvbnN0IGJ5SXRlbSA9IGNoYXJhY3RlciA/IG5ldyBNYXA8SXRlbSwgUm93PigpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGJ5TmFtZSA9IGNoYXJhY3RlciA/IHVuZGVmaW5lZCA6IG5ldyBNYXA8c3RyaW5nLCBSb3c+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgLy8gQ2hhcmFjdGVyLWZpbHRlcmVkOiBrZWVwIGhpc3RvcmljYWwgZGVub21pbmF0b3IgKGl0ZW0gY2hhcmFjdGVyLCBlbHNlIGZpbHRlciwgZWxzZSB0b3RhbCkuXG4gICAgICAgICAgICAvLyBVbmZpbHRlcmVkIGNvbGxhcHNlOiByYXRlcyBhcmUgd2l0aGluIGVhY2ggY2hhcmFjdGVyJ3MgcG9vbCAocG9vbHMgbWlycm9yOyBmaXJzdCByb3cgd2lucykuXG4gICAgICAgICAgICAvLyBVc2luZyB0b3RhbF9wcm9iYWJpbGl0eSBmb3Igc2hhcmVkIGl0ZW1zIHdvdWxkIGRpbHV0ZSB+N8OXIGFuZCByZWludHJvZHVjZSB3cm9uZyByYXRlcy5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBnYWNoYS5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXIpIVxuICAgICAgICAgICAgICAgIDogKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1fY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoaXRlbV9jaGFyYWN0ZXIpIVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBnYWNoYS50b3RhbF9wcm9iYWJpbGl0eTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSB0aWNrZXRzIC8gaXRlbV90aWNrZXRzO1xuXG4gICAgICAgICAgICBpZiAoYnlJdGVtKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBieUl0ZW0uZ2V0KGNoYXJfZ2FjaGFfaXRlbSk7XG4gICAgICAgICAgICAgICAgYnlJdGVtLnNldChjaGFyX2dhY2hhX2l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hhcl9nYWNoYV9pdGVtLFxuICAgICAgICAgICAgICAgICAgICBwcm9iYWJpbGl0eTogKHByZXZpb3VzPy5wcm9iYWJpbGl0eSA/PyAwKSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhcl9nYWNoYV9pdGVtLm5hbWVfZW59XFwwJHtxdWFudGl0eV9taW59XFwwJHtxdWFudGl0eV9tYXh9YDtcbiAgICAgICAgICAgIGlmICghYnlOYW1lIS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIGJ5TmFtZSEuc2V0KGtleSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGFyX2dhY2hhX2l0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJvd3MgPSBieUl0ZW0gPyBbLi4uYnlJdGVtLnZhbHVlcygpXSA6IFsuLi5ieU5hbWUhLnZhbHVlcygpXTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWRJdGVtICE9PSB1bmRlZmluZWQgJiYgKFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRJdGVtID09PSByb3cuaXRlbVxuICAgICAgICAgICAgfHwgKFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgJiYgaGlnaGxpZ2h0ZWRJdGVtLm5hbWVfZW4gPT09IHJvdy5pdGVtLm5hbWVfZW5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgW1widGRcIiwgcm93Lml0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocm93LnF1YW50aXR5X21pbiwgcm93LnF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHJvdy5wcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyByb3cucHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbTogSXRlbSB8IHVuZGVmaW5lZCwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByb2JhYmlsaXR5VGFibGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtcHJvYmFiaWxpdHktZGlhbG9nX19zY3JvbGxcIixcbiAgICAgICAgICAgIHJvbGU6IFwicmVnaW9uXCIsXG4gICAgICAgICAgICB0YWJpbmRleDogXCIwXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYCR7aXRlbVNvdXJjZS5pdGVtLm5hbWVfZW59IHByb2JhYmlsaXRpZXNgLFxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShnYWNoYSwgaXRlbSwgY2hhcmFjdGVyKSxcbiAgICBdKTtcbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKFxuICAgICAgICBpdGVtU291cmNlLml0ZW0ubmFtZV9lbixcbiAgICAgICAgcHJvYmFiaWxpdHlUYWJsZSxcbiAgICAgICAgXCJnYWNoYS1wcm9iYWJpbGl0eS1kaWFsb2dcIixcbiAgICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBTaG9wSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnRUYWJsZSA9IGNyZWF0ZUhUTUwoW1widGFibGVcIiwgW1widHJcIiwgW1widGhcIiwgXCJDb250ZW50c1wiXV1dKTtcbiAgICBmb3IgKGNvbnN0IGlubmVyX2l0ZW0gb2YgaXRlbVNvdXJjZS5pdGVtcykge1xuICAgICAgICBjb250ZW50VGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiLCBpbm5lcl9pdGVtID09PSBpdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLCBbXCJ0ZFwiLCBpbm5lcl9pdGVtLm5hbWVfZW5dXSkpO1xuICAgIH1cbiAgICAvLyBEaWFsb2cgYXJpYS1sYWJlbCBhbHJlYWR5IGNhcnJpZXMgdGhlIHNldCBuYW1lIOKAlCBvbmx5IHNob3cgdGhlIGNvbnRlbnRzIHRhYmxlLlxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIGNvbnRlbnRUYWJsZSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVCb3NzQXJ0RmlsZShib3NzSWQ6IG51bWJlciwgcmVzSWQ/OiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGJ5SWQgPSBib3NzQXJ0Q2F0YWxvZy5ieUJvc3NJZD8uW2Ake2Jvc3NJZH1gXTtcbiAgICBpZiAoYnlJZCkge1xuICAgICAgICByZXR1cm4gYnlJZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXNJZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gYm9zc0FydENhdGFsb2cuYnlSZXNJZD8uW2Ake3Jlc0lkfWBdO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCb3NzUG9ydHJhaXQocHJvamVjdGlvbjogU3RhZ2VCb3NzUHJvamVjdGlvbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcHJvamVjdGlvbi5ib3NzZXNbMF07XG4gICAgY29uc3QgYm9zc05hbWUgPSBwcmltYXJ5Py5uYW1lID8/IChwcm9qZWN0aW9uLmlzQm9zc1N0YWdlID8gXCJCb3NzXCIgOiBcIkd1YXJkaWFuXCIpO1xuICAgIGNvbnN0IGZpbGUgPSBwcmltYXJ5XG4gICAgICAgID8gcmVzb2x2ZUJvc3NBcnRGaWxlKHByaW1hcnkuaWQsIHByaW1hcnkucmVzSWQpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3BvcnRyYWl0XCIsIFwiZGF0YS1oYXMtYm9zcy1hcnRcIjogXCJ0cnVlXCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcG9ydHJhaXQtaW1hZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgYXNzZXRzL2Jvc3MtYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXG4gICAgICAgICAgICAgICAgICAgIGFsdDogYEJvc3MgYXJ0d29yayBmb3IgJHtib3NzTmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIxMjhcIixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjEyOFwiLFxuICAgICAgICAgICAgICAgICAgICBkZWNvZGluZzogXCJhc3luY1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19wb3J0cmFpdCBzdGFnZS1kZXRhaWxzX19wb3J0cmFpdC0tZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYEJvc3MgYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtib3NzTmFtZX1gLFxuICAgICAgICAgICAgXCJkYXRhLWhhcy1ib3NzLWFydFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGJvc3NOYW1lLnNsaWNlKDAsIDEpLnRvVXBwZXJDYXNlKCldLFxuICAgIF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmUgdGhlIEdhY2hhIGJlaGluZCBhIHNob3AgcHJvZHVjdCBJdGVtIChzdGFnZSByZXdhcmRzIGFyZSBzaG9wX2l0ZW1zIGVudHJpZXMpLlxuICogTG90dGVyeSBpdGVtcyB1c2VkIHRvIGxlYXZlIGl0ZW0uaWQgYXQgMCDigJQgc3RpbGwgc3VwcG9ydCByZXZlcnNlIGxvb2t1cCBmb3IgdGhvc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kR2FjaGFGb3JTaG9wSXRlbShpdGVtOiBJdGVtKTogR2FjaGEgfCB1bmRlZmluZWQge1xuICAgIGlmIChpdGVtLmlkICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IGJ5SWQgPSBnYWNoYXMuZ2V0KGl0ZW0uaWQpO1xuICAgICAgICBpZiAoYnlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ5SWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBbc2hvcEluZGV4LCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGlmIChzaG9wX2l0ZW1zLmdldChzaG9wSW5kZXgpID09PSBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2FjaGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBnYWNoYSBvZiBnYWNoYXMudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKGdhY2hhLm5hbWUgPT09IGl0ZW0ubmFtZV9lbikge1xuICAgICAgICAgICAgcmV0dXJuIGdhY2hhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV3YXJkIHRpbGUgYXJ0OiBnYWNoYSBjb2lucyB1c2UgdGhlIHNhbWUgbG90dGVyeSBzcHJpdGUgYXMgdGhlIHJlc3VsdHMgdGFibGVcbiAqIChgY3JlYXRlR2FjaGFDb2luQXJ0YCkuIEVxdWlwbWVudCB1c2VzIEl0ZW1fUGFydHMgc2hlZXQgY2VsbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZVJld2FyZEFydChpdGVtOiBJdGVtKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBmaW5kR2FjaGFGb3JTaG9wSXRlbShpdGVtKTtcbiAgICBpZiAoZ2FjaGEpIHtcbiAgICAgICAgLy8gU2FtZSBwYXRoIGFzIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSAvIGdhY2hhIHRhYmxlIGNvbHVtbi5cbiAgICAgICAgY29uc3QgY29pbiA9IGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSk7XG4gICAgICAgIC8vIEtlZXAgcmV3YXJkLXJvdyBzaXppbmcgaG9va3Mgd2l0aG91dCBsb3NpbmcgdGhlIGNpcmN1bGFyIGNvaW4gbG9vay5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHR5cGVvZiBjb2luLmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIiA/IGNvaW4uY2xhc3NOYW1lIDogXCJcIjtcbiAgICAgICAgaWYgKCFjbGFzc2VzLnNwbGl0KC9cXHMrLykuaW5jbHVkZXMoXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0XCIpKSB7XG4gICAgICAgICAgICBjb2luLmNsYXNzTmFtZSA9IGAke2NsYXNzZXN9IHN0YWdlLWRldGFpbHNfX3Jld2FyZC1hcnQgc3RhZ2UtZGV0YWlsc19fcmV3YXJkLWFydC0tY29pbmAudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2luO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSXRlbUFydChpdGVtLCA0MCwgXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0XCIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdGFnZUJvc3NMaXN0KHByb2plY3Rpb246IFN0YWdlQm9zc1Byb2plY3Rpb24pIHtcbiAgICBpZiAocHJvamVjdGlvbi5ib3NzTmFtZXMubGVuZ3RoID09PSAwICYmIHByb2plY3Rpb24uc2lkZUd1YXJkaWFuTmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGJvc3NJdGVtcyA9IHByb2plY3Rpb24uYm9zc2VzLm1hcCgoYm9zcykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gcmVzb2x2ZUJvc3NBcnRGaWxlKGJvc3MuaWQsIGJvc3MucmVzSWQpO1xuICAgICAgICBjb25zdCB0aHVtYiA9IGZpbGVcbiAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2Jvc3MtdGh1bWJcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgYXNzZXRzL2Jvc3MtYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXG4gICAgICAgICAgICAgICAgICAgIGFsdDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiNDBcIixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjQwXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlY29kaW5nOiBcImFzeW5jXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy10aHVtYiBzdGFnZS1kZXRhaWxzX19ib3NzLXRodW1iLS1mYWxsYmFja1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sXG4gICAgICAgICAgICAgICAgYm9zcy5uYW1lLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy1pdGVtIHN0YWdlLWRldGFpbHNfX2Jvc3MtaXRlbS0tcHJpbWFyeVwiIH0sXG4gICAgICAgICAgICB0aHVtYixcbiAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLXJvbGVcIiB9LCBcIkJvc3NcIl0sXG4gICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy1uYW1lXCIgfSwgYm9zcy5uYW1lXSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgLy8gR3VhcmRpYW5zTGVmdC9SaWdodC9NaWRkbGUgYXJlIGEgc3Bhd24gKnBvb2wqIOKAlCBvbmUgbGVmdCArIG9uZSByaWdodCBhdCBmaWdodCB0aW1lLlxuICAgIGNvbnN0IHNpZGVOb3RlID0gcHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGggPiAwXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2xcIiB9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLWxhYmVsXCIgfSxcbiAgICAgICAgICAgICAgICBgU2lkZSBjb21wYW5pb25zIChwb29sIG9mICR7cHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGh9KWAsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLW5hbWVzXCIgfSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmpvaW4oXCIgwrcgXCIpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NpZGUtcG9vbC1oaW50XCIgfSxcbiAgICAgICAgICAgICAgICBcIk9uZSBsZWZ0IGFuZCBvbmUgcmlnaHQgc3Bhd24gd2l0aCB0aGUgYm9zczsgdGhlIHJlc3QgYXJlIHBvc3NpYmxlIGRyYXdzLlwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwic3RhZ2UtZGV0YWlscy1ib3NzZXNcIiB9LFxuICAgICAgICBbXG4gICAgICAgICAgICBcImgzXCIsXG4gICAgICAgICAgICB7IGlkOiBcInN0YWdlLWRldGFpbHMtYm9zc2VzXCIgfSxcbiAgICAgICAgICAgIHByb2plY3Rpb24uYm9zc05hbWVzLmxlbmd0aCA+IDEgPyBcIkJvc3Nlc1wiIDogXCJCb3NzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zc2VzXCIgfSxcbiAgICAgICAgICAgIC4uLmJvc3NJdGVtcyxcbiAgICAgICAgXSxcbiAgICBdKTtcbiAgICBpZiAoc2lkZU5vdGUpIHtcbiAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChzaWRlTm90ZSk7XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG4vKipcbiAqIFN0YWdlIGRvc3NpZXIgZm9yIEd1YXJkaWFuIC8gQm9zcyBtYXAgY2hpcHM6IGJvc3MgcG9ydHJhaXQsIEpGVFNFIGJvc3MgbmFtZXMsXG4gKiByZWFkYWJsZSBmYWN0cywgYW5kIHJld2FyZCBsaXN0IHdpdGggdGhlIHNhbWUgYXJ0IGFzIHRoZSByZXN1bHRzIHRhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhZ2VEZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBpc0Jvc3MgPSBpdGVtU291cmNlLm5lZWRfYm9zcztcbiAgICBjb25zdCB0aXRsZSA9IHN0YWdlVGl0bGVOYW1lKGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwKTtcbiAgICBjb25zdCBleWVicm93ID0gaXNCb3NzID8gXCJCb3NzIHN0YWdlXCIgOiBcIkd1YXJkaWFuIHN0YWdlXCI7XG4gICAgY29uc3QgYm9zc1Byb2plY3Rpb24gPSBwcm9qZWN0U3RhZ2VCb3NzZXMoXG4gICAgICAgIGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICBpc0Jvc3MsXG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2csXG4gICAgKTtcbiAgICBjb25zdCByZXdhcmRzID0gaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPiAwXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZHNcIiB9LFxuICAgICAgICAgICAgLi4uaXRlbVNvdXJjZS5pdGVtcy5tYXAoKHJld2FyZCkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHJld2FyZCA9PT0gaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInN0YWdlLWRldGFpbHNfX3Jld2FyZCBzdGFnZS1kZXRhaWxzX19yZXdhcmQtLWN1cnJlbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlU3RhZ2VSZXdhcmRBcnQocmV3YXJkKSxcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkLW5hbWVcIiB9LCByZXdhcmQubmFtZV9lbl0sXG4gICAgICAgICAgICAgICAgLi4uKHJld2FyZCA9PT0gaXRlbVxuICAgICAgICAgICAgICAgICAgICA/IFtjcmVhdGVIVE1MKFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYmFkZ2VcIiB9LCBcIlRoaXMgaXRlbVwiXSldXG4gICAgICAgICAgICAgICAgICAgIDogW10pLFxuICAgICAgICAgICAgXSkpLFxuICAgICAgICBdKVxuICAgICAgICA6IGNyZWF0ZUhUTUwoW1wicFwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBsaXN0ZWQgcmV3YXJkcyBmb3IgdGhpcyBzdGFnZS5cIl0pO1xuXG4gICAgY29uc3QgYm9zc1NlY3Rpb24gPSBjcmVhdGVTdGFnZUJvc3NMaXN0KGJvc3NQcm9qZWN0aW9uKTtcblxuICAgIGNvbnN0IGlkZW50aXR5ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19faWRlbnRpdHlcIiB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fZXllYnJvd1wiIH0sIGV5ZWJyb3ddLFxuICAgICAgICBbXCJoMlwiLCB0aXRsZV0sXG4gICAgXSk7XG5cbiAgICBjb25zdCBoZWFkZXIgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJoZWFkZXJcIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19oZWFkZXJcIiB9LFxuICAgICAgICBjcmVhdGVCb3NzUG9ydHJhaXQoYm9zc1Byb2plY3Rpb24pLFxuICAgICAgICBpZGVudGl0eSxcbiAgICBdKTtcblxuICAgIGNvbnN0IGFydGljbGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJhcnRpY2xlXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBpc0Jvc3NcbiAgICAgICAgICAgICAgICA/IFwic3RhZ2UtZGV0YWlscyBzdGFnZS1kZXRhaWxzLS1ib3NzXCJcbiAgICAgICAgICAgICAgICA6IFwic3RhZ2UtZGV0YWlscyBzdGFnZS1kZXRhaWxzLS1ndWFyZGlhblwiLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXIsXG4gICAgXSk7XG4gICAgaWYgKGJvc3NTZWN0aW9uKSB7XG4gICAgICAgIGFydGljbGUuYXBwZW5kQ2hpbGQoYm9zc1NlY3Rpb24pO1xuICAgIH1cbiAgICBhcnRpY2xlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwic3RhZ2UtZGV0YWlscy1yZXdhcmRzXCIgfSxcbiAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJzdGFnZS1kZXRhaWxzLXJld2FyZHNcIiB9LCBcIlJld2FyZHNcIl0sXG4gICAgICAgIHJld2FyZHMsXG4gICAgXSkpO1xuICAgIHJldHVybiBhcnRpY2xlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IG1hcExhYmVsID0gc3RhZ2VDaGFubmVsTGFiZWwoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGl0ZW1Tb3VyY2UubmVlZF9ib3NzKTtcbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKFxuICAgICAgICBtYXBMYWJlbCxcbiAgICAgICAgY3JlYXRlU3RhZ2VEZXRhaWxzQ29udGVudChpdGVtLCBpdGVtU291cmNlKSxcbiAgICAgICAgXCJzdGFnZS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoXG4gICAgaXRlbTogSXRlbSxcbiAgICBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIHJldHVybiBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgLm1hcChpdGVtU291cmNlID0+IHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW0sIGl0ZW1Tb3VyY2UsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50Q2xhc3NUb2tlbnMoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgLy8gUHJlZmVyIGNsYXNzTmFtZSBvdmVyIGNsYXNzTGlzdCDigJQgdGhlIHVuaXQgRE9NIGhhcm5lc3Mgc2V0cyBjbGFzc05hbWUgdmlhXG4gICAgLy8gc2V0QXR0cmlidXRlKFwiY2xhc3NcIikgYW5kIGRvZXMgbm90IGltcGxlbWVudCBhIGZ1bGwgY2xhc3NMaXN0LlxuICAgIGNvbnN0IHJhdyA9IHR5cGVvZiBlbGVtZW50LmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgICA/IGVsZW1lbnQuY2xhc3NOYW1lXG4gICAgICAgIDogZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiO1xuICAgIHJldHVybiByYXcuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIGlzR2FjaGFTb3VyY2VHcm91cChlbGVtZW50czogcmVhZG9ubHkgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLnNvbWUoXG4gICAgICAgIChlbGVtZW50KSA9PlxuICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQgIT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICYmIGVsZW1lbnRDbGFzc1Rva2VucyhlbGVtZW50KS5pbmNsdWRlcyhcImdhY2hhLXNvdXJjZS1zdW1tYXJ5XCIpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1ha2VTb3VyY2VzTGlzdChsaXN0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW11bXSk6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgY29uc3QgcmVzdWx0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gPSBbXTtcbiAgICBmdW5jdGlvbiBhZGQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID0gcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSArIGVsZW1lbnQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XG4gICAgfVxuICAgIGxldCBwcmV2aW91c0dyb3VwOiByZWFkb25seSAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gfCB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBlbGVtZW50cyBvZiBsaXN0KSB7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFkZChcIiBcIik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb21tYSBiZXR3ZWVuIHNob3Avc2V0L2d1YXJkaWFuIHBhdGhzIHNvIGR1YWwgcHJpY2VzIHN0YXkgbGVnaWJsZVxuICAgICAgICAvLyAoXCI1MDAwMCBHb2xkLCBTdXBwb3J0ZXIgU2V0IDM1MDAwMCBHb2xkXCIpLiBOZXZlciBuZXh0IHRvIGdhY2hhIGNvaW4gY2FyZHMg4oCUXG4gICAgICAgIC8vIHRob3NlIGFyZSBibG9jayBzdW1tYXJpZXMgYW5kIGEgdGV4dCBjb21tYSBiZWNvbWVzIGEgdmlzdWFsIGJyZWFrLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwcmV2aW91c0dyb3VwICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAocHJldmlvdXNHcm91cClcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAoZWxlbWVudHMpXG4gICAgICAgICkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXNHcm91cCA9IGVsZW1lbnRzO1xuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpOiBib29sZWFuIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlIHx8IGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldChpdGVtU291cmNlLnNob3BfaWQpO1xuICAgICAgICBpZiAoZ2FjaGE/LmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlICE9PSBpdGVtU291cmNlICYmIGlzQXZhaWxhYmxlSXRlbVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICBpZiAoaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUF2YWlsYWJpbGl0eUJhZGdlKGl0ZW06IEl0ZW0pIHtcbiAgICBpZiAoaXNJdGVtQ3VycmVudGx5QXZhaWxhYmxlKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWF2YWlsYWJpbGl0eSBpdGVtLWF2YWlsYWJpbGl0eS0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vIGVuYWJsZWQgc2hvcCwgZ2FjaGEsIG9yIEd1YXJkaWFuIHBhdGggaW4gdGhlIGxpdmUgc2hvcCBkYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiTm90IGluIGdhbWVcIixcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY29sbGVjdEdhY2hhU291cmNlSW5wdXRzKGNvaW46IEl0ZW0gfCB1bmRlZmluZWQpOiBHYWNoYVNvdXJjZUlucHV0W10ge1xuICAgIGlmICghY29pbikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGlucHV0czogR2FjaGFTb3VyY2VJbnB1dFtdID0gW107XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgY29pbi5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goeyBraW5kOiBcInNob3BcIiwgYXA6IHNvdXJjZS5hcCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICAgICAgbWFwOiBzb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICAgICAgICAgIG5lZWRCb3NzOiBzb3VyY2UubmVlZF9ib3NzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlucHV0cztcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTaG9wQ2hhbm5lbExhYmVsKFxuICAgIGN1cnJlbmN5OiBcIkdvbGRcIiB8IFwiQVBcIixcbiAgICBhdmFpbGFibGU6IGJvb2xlYW4sXG4gICAgcmVhc29uPzogXCJub3RfZm9yX3NhbGVcIiB8IFwibm90X2F2YWlsYWJsZVwiLFxuKTogSFRNTEVsZW1lbnQge1xuICAgIGlmIChhdmFpbGFibGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbmN5ID09PSBcIkFQXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1hcFwiIH0sXG4gICAgICAgICAgICAgICAgXCJBUFwiLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1nb2xkXCIgfSxcbiAgICAgICAgICAgIFwiR29sZFwiLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgaWYgKHJlYXNvbiA9PT0gXCJub3RfZm9yX3NhbGVcIikge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWZvci1zYWxlXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBwcm9kdWN0IGlzIGxpc3RlZCBpbiB0aGUgc2hvcCBjYXRhbG9nIGJ1dCBjYW5ub3QgYmUgcHVyY2hhc2VkIChOb2J1eSlgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiTm90IGZvciBzYWxlXCIsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBjb2luIGlzIG5vdCBjdXJyZW50bHkgc29sZCBpbiB0aGUgbGl2ZSBzaG9wYCxcbiAgICAgICAgfSxcbiAgICAgICAgYCR7Y3VycmVuY3l9IMK3IE5vdCBhdmFpbGFibGVgLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVN0YWdlQ2hhbm5lbExhYmVsKFxuICAgIGNvaW46IEl0ZW0gfCB1bmRlZmluZWQsXG4gICAgbWFwOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgbGFiZWw6IHN0cmluZyxcbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IGNvaW4/LnNvdXJjZXMuZmluZChcbiAgICAgICAgKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT5cbiAgICAgICAgICAgIHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSAmJiBzb3VyY2UuZ3VhcmRpYW5fbWFwID09PSBtYXAsXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsQ2xhc3MgPSBuZWVkQm9zc1xuICAgICAgICA/IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIlxuICAgICAgICA6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCI7XG4gICAgaWYgKGd1YXJkaWFuU291cmNlICYmIGNvaW4pIHtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBjcmVhdGVHdWFyZGlhblBvcHVwKGNvaW4sIGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBwb3B1cC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcInBvcHVwX2xpbmtcIjtcbiAgICAgICAgcG9wdXAuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYCR7ZXhpc3Rpbmd9ICR7Y2hhbm5lbENsYXNzfWApO1xuICAgICAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGxhYmVsKTtcbiAgICAgICAgcmV0dXJuIHBvcHVwO1xuICAgIH1cbiAgICBpZiAobmVlZEJvc3MpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYEJvc3Mgc3RhZ2UgZHJvcDogJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKX1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCIsXG4gICAgICAgICAgICB0aXRsZTogYEd1YXJkaWFuIHN0YWdlIGRyb3A6ICR7cHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCl9YCxcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWwsXG4gICAgXSk7XG59XG5cbi8qKiBLZXB0IGZvciBjb250cmFjdHMgdGhhdCBwaW4gdGhlIGhlbHBlciBuYW1lOyByZXR1cm5zIHNob3AgKyBzdGFnZSBjaGFubmVsIGNoaXBzLiAqL1xuZnVuY3Rpb24gY3JlYXRlR2FjaGFDdXJyZW5jeUxhYmVsKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBjaGFubmVscyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIGlmIChjaGFubmVscy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5uZWxzWzBdITtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAgeyBjbGFzczogXCJnYWNoYS1hY3F1aXNpdGlvbi1jaGFubmVsc1wiIH0sXG4gICAgICAgIC4uLmNoYW5uZWxzLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbEVsZW1lbnRzKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNvaW4gPSBzaG9wX2l0ZW1zLmdldChnYWNoYS5zaG9wX2luZGV4KTtcbiAgICBjb25zdCBwcm9qZWN0ZWQgPSBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzKFxuICAgICAgICB7XG4gICAgICAgICAgICBhcDogZ2FjaGEuYXAsXG4gICAgICAgICAgICBlbmFibGVkOiBnYWNoYS5lbmFibGVkLFxuICAgICAgICAgICAgcHVyY2hhc2FibGU6IGdhY2hhLnB1cmNoYXNhYmxlLFxuICAgICAgICB9LFxuICAgICAgICBjb2xsZWN0R2FjaGFTb3VyY2VJbnB1dHMoY29pbiksXG4gICAgKTtcbiAgICByZXR1cm4gcHJvamVjdGVkLm1hcCgoY2hhbm5lbCkgPT4ge1xuICAgICAgICBpZiAoY2hhbm5lbC5raW5kID09PSBcInNob3BcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUdhY2hhU2hvcENoYW5uZWxMYWJlbChcbiAgICAgICAgICAgICAgICBjaGFubmVsLmN1cnJlbmN5LFxuICAgICAgICAgICAgICAgIGNoYW5uZWwuYXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIGNoYW5uZWwucmVhc29uLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlR2FjaGFTdGFnZUNoYW5uZWxMYWJlbChcbiAgICAgICAgICAgIGNvaW4sXG4gICAgICAgICAgICBjaGFubmVsLm1hcCxcbiAgICAgICAgICAgIGNoYW5uZWwubmVlZEJvc3MsXG4gICAgICAgICAgICBjaGFubmVsLmxhYmVsLFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoXG4gICAgaXRlbTogSXRlbSB8IHVuZGVmaW5lZCxcbiAgICBpdGVtU291cmNlOiBHYWNoYUl0ZW1Tb3VyY2UsXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyLFxuKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGNoYW5uZWxFbGVtZW50cyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIixcbiAgICAgICAgICAgIHJvbGU6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBhY3F1aXNpdGlvbmAsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSksXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5X19jb250ZW50XCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtaWRlbnRpdHlcIiB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbiA/IHVuZGVmaW5lZCA6IGNoYXJhY3RlcixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtYWNxdWlzaXRpb24tY2hhbm5lbHNcIixcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBzb3VyY2VzYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLmNoYW5uZWxFbGVtZW50cy5tYXAoKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcImdhY2hhLWFjcXVpc2l0aW9uLWNoYW5uZWxzX19pdGVtXCIsIHJvbGU6IFwibGlzdGl0ZW1cIiB9LCBlbGVtZW50XSksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UsIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoaXRlbSwgaXRlbVNvdXJjZSwgY2hhcmFjdGVyKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICBpZiAoaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBbYCR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGNyZWF0ZVNldFNvdXJjZVBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UpLFxuICAgICAgICAgICAgYCAke2l0ZW1Tb3VyY2UucHJpY2V9ICR7aXRlbVNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwifWBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSldO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgSXRlbURldGFpbFN0YXQgPSB7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBiYXNlOiBudW1iZXI7XG4gICAgZW5jaGFudGVkPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGl0ZW1EZXRhaWxTdGF0cyhpdGVtOiBJdGVtKTogSXRlbURldGFpbFN0YXRbXSB7XG4gICAgY29uc3QgY2hhcmFjdGVyU3RhdHMgPSBbXG4gICAgICAgIHsgbGFiZWw6IFwiU3RyZW5ndGhcIiwgYmFzZTogaXRlbS5zdHIsIGVuY2hhbnRlZDogaXRlbS5tYXhfc3RyIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiRGV4dGVyaXR5XCIsIGJhc2U6IGl0ZW0uZGV4LCBlbmNoYW50ZWQ6IGl0ZW0ubWF4X2RleCB9LFxuICAgICAgICB7IGxhYmVsOiBcIlN0YW1pbmFcIiwgYmFzZTogaXRlbS5zdGEsIGVuY2hhbnRlZDogaXRlbS5tYXhfc3RhIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiV2lsbFwiLCBiYXNlOiBpdGVtLndpbCwgZW5jaGFudGVkOiBpdGVtLm1heF93aWwgfSxcbiAgICBdO1xuICAgIGNvbnN0IGZpeGVkU3RhdHMgPSBbXG4gICAgICAgIHsgbGFiZWw6IFwiTW92ZW1lbnRcIiwgYmFzZTogaXRlbS5tb3ZlbWVudCB9LFxuICAgICAgICB7IGxhYmVsOiBcIkNoYXJnZVwiLCBiYXNlOiBpdGVtLmNoYXJnZSB9LFxuICAgICAgICB7IGxhYmVsOiBcIkxvYlwiLCBiYXNlOiBpdGVtLmxvYiB9LFxuICAgICAgICB7IGxhYmVsOiBcIlNtYXNoXCIsIGJhc2U6IGl0ZW0uc21hc2ggfSxcbiAgICAgICAgeyBsYWJlbDogXCJTZXJ2ZVwiLCBiYXNlOiBpdGVtLnNlcnZlIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiSFBcIiwgYmFzZTogaXRlbS5ocCB9LFxuICAgICAgICB7IGxhYmVsOiBcIlF1aWNrc2xvdHNcIiwgYmFzZTogaXRlbS5xdWlja3Nsb3RzIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiQnVmZnNsb3RzXCIsIGJhc2U6IGl0ZW0uYnVmZnNsb3RzIH0sXG4gICAgXTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmNoYXJhY3RlclN0YXRzXG4gICAgICAgICAgICAuZmlsdGVyKHN0YXQgPT4gc3RhdC5iYXNlICE9PSAwIHx8IChpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgJiYgc3RhdC5lbmNoYW50ZWQgIT09IDApKVxuICAgICAgICAgICAgLm1hcCgoeyBsYWJlbCwgYmFzZSwgZW5jaGFudGVkIH0pID0+XG4gICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlID8geyBsYWJlbCwgYmFzZSwgZW5jaGFudGVkIH0gOiB7IGxhYmVsLCBiYXNlIH1cbiAgICAgICAgICAgICksXG4gICAgICAgIC4uLmZpeGVkU3RhdHMuZmlsdGVyKHN0YXQgPT4gc3RhdC5iYXNlICE9PSAwKSxcbiAgICBdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBpdGVtRGV0YWlsU3RhdHMoaXRlbSk7XG4gICAgY29uc3Qgc291cmNlcyA9IG1ha2VTb3VyY2VzTGlzdChcbiAgICAgICAgaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCAoKSA9PiB0cnVlLCBjaGFyYWN0ZXIpLFxuICAgICk7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc1wiIH0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiaGVhZGVyXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19faGVhZGVyXCIgfSxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1BcnQoaXRlbSwgNzIsIFwiaXRlbS1kZXRhaWxzX19hcnRcIiksXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19leWVicm93XCIgfSwgXCJFcXVpcG1lbnQgZGV0YWlsc1wiXSxcbiAgICAgICAgICAgICAgICBbXCJoMlwiLCBpdGVtLm5hbWVfZW5dLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19tZXRhXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7Y2hhcmFjdGVyID8/IGl0ZW0uY2hhcmFjdGVyID8/IFwiQWxsIGNoYXJhY3RlcnNcIn0gwrcgJHtpdGVtLnBhcnR9IMK3IExldmVsICR7aXRlbS5sZXZlbH1gLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXN0YXRzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXN0YXRzXCIgfSwgXCJTdGF0c1wiXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHMtbm90ZVwiIH0sXG4gICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlXG4gICAgICAgICAgICAgICAgICAgID8gXCJDaGFyYWN0ZXIgc3RhdHMgc2hvdyBiYXNlIGFuZCBmdWxseSBlbmNoYW50ZWQgdmFsdWVzLlwiXG4gICAgICAgICAgICAgICAgICAgIDogXCJUaGlzIGl0ZW0gaGFzIGJhc2Ugc3RhdHMgb25seS5cIixcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkbFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0cy5tYXAoKHsgbGFiZWwsIGJhc2UsIGVuY2hhbnRlZCB9KSA9PiBlbmNoYW50ZWQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImR0XCIsIGxhYmVsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJkZFwiLCBgJHtiYXNlfWBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tc3RhdC1jb21wYXJpc29uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtsYWJlbH06IGJhc2UgJHtiYXNlfSwgZW5jaGFudGVkICR7ZW5jaGFudGVkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJkdFwiLCBsYWJlbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLXN0YXQtY29tcGFyaXNvbl9fdmFsdWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic21hbGxcIiwgXCJCYXNlXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic3Ryb25nXCIsIGAke2Jhc2V9YF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLXN0YXQtY29tcGFyaXNvbl9fYXJyb3dcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCLihpJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tc3RhdC1jb21wYXJpc29uX192YWx1ZSBpdGVtLXN0YXQtY29tcGFyaXNvbl9fdmFsdWUtLWVuY2hhbnRlZFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzbWFsbFwiLCBcIkVuY2hhbnRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInN0cm9uZ1wiLCBgJHtlbmNoYW50ZWR9YF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXCJwXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sIFwiTm8gc3RhdCBib251c2VzXCJdKSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zb3VyY2VzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LCBcIkhvdyB0byBnZXQgaXRcIl0sXG4gICAgICAgICAgICBzb3VyY2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1wiZGl2XCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zb3VyY2VzXCIgfSwgLi4uc291cmNlc10pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gYWN0aXZlIGFjcXVpc2l0aW9uIHNvdXJjZSBmb3VuZC5cIixcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWRldGFpbHMtdHJpZ2dlclwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIFwiYXJpYS1oYXNwb3B1cFwiOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgVmlldyBkZXRhaWxzIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coXG4gICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICBgJHtpdGVtLm5hbWVfZW59IGl0ZW0gZGV0YWlsc2AsXG4gICAgICAgICAgICBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbSwgY2hhcmFjdGVyKSxcbiAgICAgICAgICAgIFwiaXRlbS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtOiBJdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE9mZmljaWFsIGl0ZW0gYXJ0IHVuYXZhaWxhYmxlIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tfX2NvZGVcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBpdGVtLnBhcnQgfHwgXCJJdGVtXCJdLFxuICAgICAgICBbXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBcIk9mZmljaWFsIGFydCB1bmF2YWlsYWJsZVwiXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3ByaXRlQXJ0KFxuICAgIHNoZWV0OiBzdHJpbmcsXG4gICAgY2VsbDogbnVtYmVyLFxuICAgIGxhYmVsOiBzdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbikge1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gaXRlbUFydE1hcC5zaGVldHNbc2hlZXRdO1xuICAgIGlmICghZ2VvbWV0cnkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjb2x1bW4gPSBjZWxsICUgZ2VvbWV0cnkubGluZUNvdW50O1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoY2VsbCAvIGdlb21ldHJ5LmxpbmVDb3VudCk7XG4gICAgY29uc3Qgc2NhbGUgPSBkaXNwbGF5U2l6ZSAvIGdlb21ldHJ5LnNpemU7XG4gICAgY29uc3QgaW1hZ2VTaXplID0gZ2VvbWV0cnkud2lkdGggKiBzY2FsZTtcbiAgICBjb25zdCBvZmZzZXRYID0gLShnZW9tZXRyeS5zcGFjZSArIGNvbHVtbiAqIChnZW9tZXRyeS5zaXplICsgZ2VvbWV0cnkuc3BhY2UpKSAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFkgPSAtKGdlb21ldHJ5LnNwYWNlICsgcm93ICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgICAgICAgICBzdHlsZTogW1xuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LWltYWdlOnVybChcImFzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbiAgICBjbGFzc05hbWUgPSBcIml0ZW0tYXJ0LXRodW1ibmFpbFwiLFxuKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydFswXSxcbiAgICAgICAgYXJ0WzFdLFxuICAgICAgICBgT2ZmaWNpYWwgaXRlbSBhcnQgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgZGlzcGxheVNpemUsXG4gICAgKSA/PyBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYTogR2FjaGEpIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLmxvdHRlcmllc1tgJHtnYWNoYS5nYWNoYV9pbmRleH1gXTtcbiAgICBjb25zdCBmYWxsYmFjayA9ICgpID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtY29pbi1hcnQgZ2FjaGEtY29pbi1hcnQtLXVuYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYENvaW4gYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI/XCIsXG4gICAgICAgIF0pO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaygpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnQuc2hlZXQsXG4gICAgICAgIGFydC5jZWxsLFxuICAgICAgICBgJHtnYWNoYS5uYW1lfSBjb2luIGFydHdvcmtgLFxuICAgICAgICBcImdhY2hhLWNvaW4tYXJ0XCIsXG4gICAgKSA/PyBmYWxsYmFjaygpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UYWJsZVJvdyhpdGVtOiBJdGVtLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlUm93RWxlbWVudCB7XG4gICAgY29uc3Qgcm93ID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widHJcIiwgeyBjbGFzczogXCJyZXN1bHQtcm93XCIgfSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gcmVzdWx0LXN1bW1hcnlcIiwgXCJkYXRhLWxhYmVsXCI6IFwiSXRlbVwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbSwgY2hhcmFjdGVyKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQXJ0XCIgfSwgY3JlYXRlSXRlbUFydChpdGVtKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQ2hhcmFjdGVyXCIgfSwgaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGxcIl0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlBhcnRcIiB9LCBpdGVtLnBhcnRdLFxuICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5tYXAocyA9PiBpdGVtLnN0YXRGcm9tU3RyaW5nKHMpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IHN0YXQsIFwiZGF0YS12YWx1ZVwiOiB2YWx1ZSB9LCB2YWx1ZV0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkxldmVsXCIsIFwiZGF0YS12YWx1ZVwiOiBgJHtpdGVtLmxldmVsfWAgfSwgYCR7aXRlbS5sZXZlbH1gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJTb3VyY2VcIiB9LCAuLi5tYWtlU291cmNlc0xpc3QoaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgcmV0dXJuIHJvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhY2hhVGFibGUoZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbiwgY2hhcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJHYWNoYSBjb2lucyBieSBzaG9wIGN1cnJlbmN5IGFuZCBzdGFnZSBzb3VyY2VzXCJdLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJHYWNoYVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSh1bmRlZmluZWQsIG5ldyBHYWNoYUl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCksIGNoYXIpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgdHlwZSBSZXN1bHRzVGFibGVQbGFuID0ge1xuICAgIHRhYmxlOiBIVE1MVGFibGVFbGVtZW50LFxuICAgIHRvdGFsUm93czogbnVtYmVyLFxuICAgIGNyZWF0ZVJvdzogKGluZGV4OiBudW1iZXIpID0+IEhUTUxUYWJsZVJvd0VsZW1lbnQsXG59O1xuXG50eXBlIEl0ZW1Qcmlvcml0aXplciA9ICgoaXRlbXM6IEl0ZW1bXSwgaXRlbTogSXRlbSkgPT4gSXRlbVtdKSAmXG4gICAgUGFydGlhbDxQaWNrPFByaW9yaXR5UmFua2VyPEl0ZW0+LCBcImNvbXBhcmVcIiB8IFwic29ydEFsbFwiPj47XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXN1bHRzVGFibGVQbGFuKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IEl0ZW1Qcmlvcml0aXplcixcbiAgICBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBSZXN1bHRzVGFibGVQbGFuIHtcbiAgICBjb25zdCByZXN1bHRzOiB7IFtrZXk6IHN0cmluZ106IEl0ZW1bXSB9ID0ge1xuICAgICAgICBcIkhhdFwiOiBbXSxcbiAgICAgICAgXCJIYWlyXCI6IFtdLFxuICAgICAgICBcIkR5ZVwiOiBbXSxcbiAgICAgICAgXCJVcHBlclwiOiBbXSxcbiAgICAgICAgXCJMb3dlclwiOiBbXSxcbiAgICAgICAgXCJTaG9lc1wiOiBbXSxcbiAgICAgICAgXCJTb2Nrc1wiOiBbXSxcbiAgICAgICAgXCJIYW5kXCI6IFtdLFxuICAgICAgICBcIkJhY2twYWNrXCI6IFtdLFxuICAgICAgICBcIkZhY2VcIjogW10sXG4gICAgICAgIFwiUmFja2V0XCI6IFtdLFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChmaWx0ZXIoaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdHNbaXRlbS5wYXJ0XS5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgW3BhcnQsIGNhbmRpZGF0ZXNdIG9mIE9iamVjdC5lbnRyaWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIHJlc3VsdHNbcGFydF0gPSBwcmlvcml6ZXIuc29ydEFsbFxuICAgICAgICAgICAgPyBwcmlvcml6ZXIuc29ydEFsbChjYW5kaWRhdGVzKVxuICAgICAgICAgICAgOiBjYW5kaWRhdGVzLnJlZHVjZShwcmlvcml6ZXIsIFtdKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICBbXCJjYXB0aW9uXCIsIFwiTWF0Y2hpbmcgZXF1aXBtZW50IGdsb2JhbGx5IHJhbmtlZCBieSBzZWxlY3RlZCBzdGF0IHByaW9yaXR5XCJdLFxuICAgICAgICAgICAgW1widGhlYWRcIixcbiAgICAgICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiSXRlbVwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJBcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQXJ0XCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJDaGFyYWN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiUGFydF9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJQYXJ0XCJdLFxuICAgICAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcCgoc3RhdCwgaW5kZXgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVQcmlvcml0eVN0YXRIZWFkZXJDZWxsKHN0YXQsIGluZGV4ID09PSAwKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiTGV2ZWxcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlNvdXJjZVwiXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcInRib2R5XCJdLFxuICAgICAgICBdXG4gICAgKTtcbiAgICB0eXBlIE1hcE9wdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH07XG5cbiAgICB0eXBlIENvc3QgPSB7XG4gICAgICAgIGdvbGQ6IG51bWJlcixcbiAgICAgICAgYXA6IG51bWJlcixcbiAgICAgICAgbWFwczogTWFwT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY29tYmluZU1hcHMobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHJlc3VsdFttYXBdLmNvbmNhdCh0cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZUNvc3RzKGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCArIGNvc3QyLmdvbGQsXG4gICAgICAgICAgICBhcDogY29zdDEuYXAgKyBjb3N0Mi5hcCxcbiAgICAgICAgICAgIG1hcHM6IGNvbWJpbmVNYXBzKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbk1hcChtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmICh0cmllcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IFtNYXRoLm1pbihyZXN1bHRbbWFwXVswXSwgdHJpZXNbMF0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5Db3N0KGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICAvLyBMZXhpY29ncmFwaGljIG9uIChhcCwgZ29sZCk6IGxvd2VyIEFQIHdpbnMsIHRoZW4gbG93ZXIgR29sZC5cbiAgICAgICAgLy8gTnVtZXJpYyBjb21wYXJlIG9ubHkg4oCUIGRvIG5vdCB1c2UgSlMgYXJyYXkvc3RyaW5nIG9yZGVyaW5nLlxuICAgICAgICBjb25zdCBwaWNrQ29zdDEgPVxuICAgICAgICAgICAgY29zdDEuYXAgPCBjb3N0Mi5hcCB8fFxuICAgICAgICAgICAgKGNvc3QxLmFwID09PSBjb3N0Mi5hcCAmJiBjb3N0MS5nb2xkIDwgY29zdDIuZ29sZCk7XG4gICAgICAgIHJldHVybiBwaWNrQ29zdDEgP1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QxLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QyLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QyLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29zdE9mKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IENvc3Qge1xuICAgICAgICBjb25zdCBzb3VyY2VDb3N0cyA9IFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgICAgIC5tYXAoKGl0ZW1Tb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlLmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogaXRlbVNvdXJjZS5wcmljZSwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiBpdGVtU291cmNlLnByaWNlLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGVDb3N0ID0gY29zdE9mKGl0ZW1Tb3VyY2UuaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogc2luZ2xlQ29zdC5nb2xkICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiBzaW5nbGVDb3N0LmFwICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzaW5nbGVDb3N0Lm1hcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFttYXAsIHRyaWVzXSkgPT4gW21hcCwgdHJpZXMubWFwKG4gPT4gbiAqIG11bHRpcGxpZXIpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFtbaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIFtpdGVtU291cmNlLml0ZW1zLmxlbmd0aF1dXSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNvdXJjZUNvc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VlZCB3aXRoIHRoZSBmaXJzdCByZWFsIHNvdXJjZSBjb3N0LiBBIHswLDB9IGlkZW50aXR5IHdvdWxkIGFsd2F5cyB3aW5cbiAgICAgICAgLy8gdW5kZXIgYSBjb3JyZWN0IG1pbiwgYW5kIHRoZSBvbGQgYWx3YXlzLWxhc3QgYnVnIGhpZCB0aGF0LlxuICAgICAgICByZXR1cm4gc291cmNlQ29zdHMucmVkdWNlKChjdXJyLCBjb3N0KSA9PiBtaW5Db3N0KGN1cnIsIGNvc3QpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVN0YXRpc3RpY3M6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuZnJvbUVudHJpZXMocHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBbc3RhdCwgMF0pKTtcbiAgICBjb25zdCBzdGF0aXN0aWNzID0ge1xuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgU2V0PENoYXJhY3Rlcj4sXG4gICAgICAgIExldmVsOiAwLFxuICAgICAgICBjb3N0OiB7IGFwOiAwLCBnb2xkOiAwLCBtYXBzOiB7fSB9IGFzIENvc3QsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIE9iamVjdC52YWx1ZXMocmVzdWx0cykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLnJlZHVjZSgoY3Vyciwgc3RhdE5hbWUpID0+IGN1cnIgKyByZXN1bHRbMF0uc3RhdEZyb21TdHJpbmcoc3RhdE5hbWUpLCAwKTtcbiAgICAgICAgICAgIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSArPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpc3RpY3MuTGV2ZWwgPSBNYXRoLm1heChyZXN1bHRbMF0ubGV2ZWwsIHN0YXRpc3RpY3MuTGV2ZWwpO1xuXG4gICAgICAgIC8vIEZvb3RlciBjb3N0IG11c3QgbWF0Y2ggc3RhdHMvbGV2ZWw6IGJlc3QgY2FuZGlkYXRlIHBlciBzbG90IG9ubHkuXG4gICAgICAgIC8vIFRoZSBib2R5IHN0aWxsIHJlbmRlcnMgdGhlIGZ1bGwgZ2xvYmFsbHkgcmFua2VkIGxpc3QgYmVsb3cuXG4gICAgICAgIHN0YXRpc3RpY3MuY29zdCA9IGNvbWJpbmVDb3N0cyhcbiAgICAgICAgICAgIGNvc3RPZihyZXN1bHRbMF0sIGNoYXJhY3RlciAmJiBpc0NoYXJhY3RlcihjaGFyYWN0ZXIpID8gY2hhcmFjdGVyIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgIHN0YXRpc3RpY3MuY29zdCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wYXJhdG9yID0gcHJpb3JpemVyLmNvbXBhcmUgPz8gKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4ge1xuICAgICAgICBpZiAocHJpb3JpemVyKFtsaHNdLCByaHMpWzBdID09PSByaHMpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJpb3JpemVyKFtyaHNdLCBsaHMpWzBdID09PSBsaHMpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIGNvbnN0IGRpc3BsYXlSZXN1bHRzID0gbWVyZ2VQcmlvcml0eVJhbmtpbmdzKE9iamVjdC52YWx1ZXMocmVzdWx0cyksIGNvbXBhcmF0b3IpO1xuICAgIGNvbnN0IHJvd0lucHV0czogeyBpdGVtOiBJdGVtLCBjaGFyYWN0ZXI6IENoYXJhY3RlciB9W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZGlzcGxheVJlc3VsdHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGFyIG9mIGl0ZW0uY2hhcmFjdGVyID8gW2l0ZW0uY2hhcmFjdGVyXSA6IGNoYXJhY3RlcnMpIHtcbiAgICAgICAgICAgIHN0YXRpc3RpY3MuY2hhcmFjdGVycy5hZGQoY2hhcilcbiAgICAgICAgICAgIHJvd0lucHV0cy5wdXNoKHsgaXRlbSwgY2hhcmFjdGVyOiBjaGFyIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGlkZGVuQ29sdW1uQ2xhc3Nlczogc3RyaW5nW10gPSBbXTtcbiAgICBpZiAoc3RhdGlzdGljcy5jaGFyYWN0ZXJzLnNpemUgPT09IDEpIHtcbiAgICAgICAgY29uc3QgdG90YWxfc291cmNlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5nb2xkID4gMCkge1xuICAgICAgICAgICAgdG90YWxfc291cmNlcy5wdXNoKGAke3N0YXRpc3RpY3MuY29zdC5nb2xkLnRvRml4ZWQoMCl9IEdvbGRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGlzdGljcy5jb3N0LmFwID4gMCkge1xuICAgICAgICAgICAgdG90YWxfc291cmNlcy5wdXNoKGAke3N0YXRpc3RpY3MuY29zdC5hcC50b0ZpeGVkKDApfSBBUGApO1xuICAgICAgICB9XG4gICAgICAgIC8vc3RhdGlzdGljc1snR3VhcmRpYW4gZ2FtZXMnXS5mb3JFYWNoKChjb3VudCwgbWFwKSA9PiB0b3RhbF9zb3VyY2VzLnB1c2goYCR7Y291bnQudG9GaXhlZCgwKX0geCAke21hcH1gKSk7XG4gICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJ0Zm9vdFwiLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIE5hbWVfY29sdW1uXCIgfSwgXCJUb3RhbDpcIl0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBBcnRfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBDaGFyYWN0ZXJfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBQYXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIG51bWVyaWNcIiB9LFxuICAgICAgICAgICAgICAgICAgICBgJHtwcmlvcml0eVN0YXRpc3RpY3Nbc3RhdF19YFxuICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIExldmVsX2NvbHVtbiBudW1lcmljXCIgfSwgYCR7c3RhdGlzdGljcy5MZXZlbH1gXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIFNvdXJjZV9jb2x1bW5cIiB9LCB0b3RhbF9zb3VyY2VzLmpvaW4oXCIsIFwiKV0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKSk7XG4gICAgICAgIGhpZGRlbkNvbHVtbkNsYXNzZXMucHVzaChcIkNoYXJhY3Rlcl9jb2x1bW5cIik7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICBpZiAocHJpb3JpdHlTdGF0aXN0aWNzW2F0dHJpYnV0ZV0gPT09IDApIHtcbiAgICAgICAgICAgIGhpZGRlbkNvbHVtbkNsYXNzZXMucHVzaChgJHthdHRyaWJ1dGV9X2NvbHVtbmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGlkZUNvbHVtbnMgPSAocm9vdDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBjbGFzc05hbWUgb2YgaGlkZGVuQ29sdW1uQ2xhc3Nlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2x1bW5FbGVtZW50IG9mIHJvb3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbkVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW5FbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBoaWRlQ29sdW1ucyh0YWJsZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0YWJsZSxcbiAgICAgICAgdG90YWxSb3dzOiByb3dJbnB1dHMubGVuZ3RoLFxuICAgICAgICBjcmVhdGVSb3coaW5kZXg6IG51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSByb3dJbnB1dHNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBSZXN1bHQgcm93ICR7aW5kZXh9IGlzIG91dCBvZiByYW5nZWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm93ID0gaXRlbVRvVGFibGVSb3coXG4gICAgICAgICAgICAgICAgaW5wdXQuaXRlbSxcbiAgICAgICAgICAgICAgICBzb3VyY2VGaWx0ZXIsXG4gICAgICAgICAgICAgICAgcHJpb3JpdHlTdGF0cyxcbiAgICAgICAgICAgICAgICBpbnB1dC5jaGFyYWN0ZXIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaGlkZUNvbHVtbnMocm93KTtcbiAgICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3VsdHNUYWJsZShcbiAgICBmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgcHJpb3JpemVyOiBJdGVtUHJpb3JpdGl6ZXIsXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgcGxhbiA9IGdldFJlc3VsdHNUYWJsZVBsYW4oXG4gICAgICAgIGZpbHRlcixcbiAgICAgICAgc291cmNlRmlsdGVyLFxuICAgICAgICBwcmlvcml6ZXIsXG4gICAgICAgIHByaW9yaXR5U3RhdHMsXG4gICAgICAgIGNoYXJhY3RlcixcbiAgICApO1xuICAgIGNvbnN0IHRhYmxlQm9keSA9IHBsYW4udGFibGUudEJvZGllc1swXTtcbiAgICBpZiAoIXRhYmxlQm9keSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwbGFuLnRvdGFsUm93czsgaW5kZXggKz0gMSkge1xuICAgICAgICB0YWJsZUJvZHkuYXBwZW5kQ2hpbGQocGxhbi5jcmVhdGVSb3coaW5kZXgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHBsYW4udGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhJdGVtTGV2ZWwoKSB7XG4gICAgLy9ubyByZWR1Y2UgZm9yIE1hcD9cbiAgICBsZXQgbWF4ID0gMDtcbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KG1heCwgaXRlbS5sZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBtYXg7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZGlhbG9nICYmIGRpYWxvZyA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgbWFrZUNoZWNrYm94VHJlZSwgVHJlZU5vZGUsIGdldExlYWZTdGF0ZXMsIHNldExlYWZTdGF0ZXMgfSBmcm9tICcuL2NoZWNrYm94VHJlZSc7XG5pbXBvcnQgeyBjcmVhdGVQb3B1cExpbmssIGRvd25sb2FkSXRlbXMsIGdldFJlc3VsdHNUYWJsZVBsYW4sIEl0ZW0sIEl0ZW1Tb3VyY2UsIGdldE1heEl0ZW1MZXZlbCwgaXRlbXMsIENoYXJhY3RlciwgY2hhcmFjdGVycywgaXNDaGFyYWN0ZXIsIFNob3BJdGVtU291cmNlLCBHYWNoYUl0ZW1Tb3VyY2UsIGdldEdhY2hhVGFibGUgfSBmcm9tICcuL2l0ZW1Mb29rdXAnO1xuaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQgeyBjcmVhdGVQcmlvcml0eVJhbmtlciB9IGZyb20gJy4vcHJpb3JpdHknO1xuaW1wb3J0IHsgYnJvd3NlckZyYW1lU2NoZWR1bGVyLCBQcm9ncmVzc2l2ZUJhdGNoUmVuZGVyZXIgfSBmcm9tICcuL3Byb2dyZXNzaXZlUmVuZGVyJztcbmltcG9ydCB7IFZhcmlhYmxlX3N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5jb25zdCBwYXJ0c0ZpbHRlciA9IFtcbiAgICBcIlBhcnRzXCIsIFtcbiAgICAgICAgXCJIZWFkXCIsIFtcbiAgICAgICAgICAgIFwiK0hhdFwiLFxuICAgICAgICAgICAgXCIrSGFpclwiLFxuICAgICAgICAgICAgXCJEeWVcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrVXBwZXJcIixcbiAgICAgICAgXCIrTG93ZXJcIixcbiAgICAgICAgXCJMZWdzXCIsIFtcbiAgICAgICAgICAgIFwiK1Nob2VzXCIsXG4gICAgICAgICAgICBcIlNvY2tzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiQXV4XCIsIFtcbiAgICAgICAgICAgIFwiK0hhbmRcIixcbiAgICAgICAgICAgIFwiK0JhY2twYWNrXCIsXG4gICAgICAgICAgICBcIitGYWNlXCJcbiAgICAgICAgXSxcbiAgICAgICAgXCIrUmFja2V0XCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlciA9IFtcbiAgICBcIkF2YWlsYWJpbGl0eVwiLCBbXG4gICAgICAgIFwiU2hvcFwiLCBbXG4gICAgICAgICAgICBcIitHb2xkXCIsXG4gICAgICAgICAgICBcIitBUFwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitBbGxvdyBnYWNoYVwiLFxuICAgICAgICBcIitHdWFyZGlhblwiLFxuICAgICAgICBcIitVbnRyYWRhYmxlXCIsXG4gICAgICAgIFwiVW5hdmFpbGFibGUgaXRlbXNcIixcbiAgICBdLFxuXTtcblxuY29uc3QgZXhjbHVkZWRfaXRlbV9pZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuLyoqIERpZ2l0cy1vbmx5IHNhZmUtaW50ZWdlciBwYXJzZSBmb3IgZXhjbHVkZWRfaXRlbV9pZHMgbG9jYWxTdG9yYWdlIHRva2Vucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4Y2x1ZGVkSXRlbUlkVG9rZW4odG9rZW46IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHRva2VuKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IE51bWJlcih0b2tlbik7XG4gICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihpZCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBhZGRGaWx0ZXJUcmVlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXJhY3RlckZpbHRlcnNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIFtcIkFsbFwiLCAuLi5jaGFyYWN0ZXJzXSkge1xuICAgICAgICBjb25zdCBpZCA9IGBjaGFyYWN0ZXJTZWxlY3RvcnNfJHtjaGFyYWN0ZXJ9YDtcbiAgICAgICAgY29uc3QgcmFkaW9fYnV0dG9uID0gY3JlYXRlSFRNTChbXCJpbnB1dFwiLCB7IGlkOiBpZCwgdHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImNoYXJhY3RlclNlbGVjdG9yc1wiLCB2YWx1ZTogY2hhcmFjdGVyIH1dKTtcbiAgICAgICAgcmFkaW9fYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHJhZGlvX2J1dHRvbik7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImxhYmVsXCIsIHsgZm9yOiBpZCB9LCBjaGFyYWN0ZXJdKSk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImJyXCJdKSk7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTmlraVwiKSB7XG4gICAgICAgICAgICByYWRpb19idXR0b24uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaWx0ZXJzOiBbVHJlZU5vZGUsIHN0cmluZ11bXSA9IFtcbiAgICAgICAgW3BhcnRzRmlsdGVyLCBcInBhcnRzRmlsdGVyXCJdLFxuICAgICAgICBbYXZhaWxhYmlsaXR5RmlsdGVyLCBcImF2YWlsYWJpbGl0eUZpbHRlclwiXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgW2ZpbHRlciwgbmFtZV0gb2YgZmlsdGVycykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuYW1lKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmVlID0gbWFrZUNoZWNrYm94VHJlZShmaWx0ZXIpO1xuICAgICAgICB0cmVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdXBkYXRlUmVzdWx0cyk7XG4gICAgICAgIHRhcmdldC5pbm5lclRleHQgPSBcIlwiO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQodHJlZSk7XG4gICAgfVxufVxuXG5hZGRGaWx0ZXJUcmVlcygpO1xuXG5sZXQgZHJhZ2dlZDogSFRNTEVsZW1lbnQ7XG5jb25zdCBkcmFnU2VwYXJhdG9yTGluZSA9IGNyZWF0ZUhUTUwoW1wiaHJcIiwgeyBpZDogXCJkcmFnT3ZlckJhclwiIH1dKTtcbmxldCBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihkaXJlY3Rpb246IFwidXBcIiB8IFwiZG93blwiKTogU1ZHU1ZHRWxlbWVudCB7XG4gICAgY29uc3QgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcInN2Z1wiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJwcmlvcml0eS1tb3ZlX19pY29uXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIFwiMCAwIDI0IDI0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjE0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJmb2N1c2FibGVcIiwgXCJmYWxzZVwiKTtcbiAgICBjb25zdCBwYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcInBhdGhcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgIFwiZFwiLFxuICAgICAgICBkaXJlY3Rpb24gPT09IFwidXBcIiA/IFwiTTYgMTQuNSAxMiA4LjVsNiA2XCIgOiBcIk02IDkuNSAxMiAxNS41bDYtNlwiLFxuICAgICk7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBcImN1cnJlbnRDb2xvclwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBcIjIuMjVcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWNhcFwiLCBcInJvdW5kXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVqb2luXCIsIFwicm91bmRcIik7XG4gICAgc3ZnLmFwcGVuZChwYXRoKTtcbiAgICByZXR1cm4gc3ZnO1xufVxuXG4vKiogUmVhZCByYW5raW5nIGtleSBmcm9tIHRoZSBsYWJlbCBub2RlIHNvIG1vdmUgY29udHJvbHMgbmV2ZXIgcG9sbHV0ZSBzdGF0IHRleHQuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJpb3JpdHlTdGF0TGFiZWwoaXRlbTogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgY29uc3QgbGFiZWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKTtcbiAgICBpZiAobGFiZWw/LnRleHRDb250ZW50KSB7XG4gICAgICAgIHJldHVybiBsYWJlbC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiAoaXRlbS50ZXh0Q29udGVudCA/PyBcIlwiKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIHNldFByaW9yaXR5U3RhdExhYmVsKGl0ZW06IEhUTUxFbGVtZW50LCBzdGF0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsYWJlbCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1zdGF0LWxhYmVsXCIpO1xuICAgIGlmIChsYWJlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gc3RhdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBzdGF0O1xuICAgIH1cbiAgICBjb25zdCB1cCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLXVwXCIpO1xuICAgIGNvbnN0IGRvd24gPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS1kb3duXCIpO1xuICAgIGlmICh1cCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgIHVwLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgYFJhaXNlICR7c3RhdH0gcHJpb3JpdHlgKTtcbiAgICAgICAgdXAudGl0bGUgPSBgUmFpc2UgJHtzdGF0fWA7XG4gICAgfVxuICAgIGlmIChkb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgZG93bi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBMb3dlciAke3N0YXR9IHByaW9yaXR5YCk7XG4gICAgICAgIGRvd24udGl0bGUgPSBgTG93ZXIgJHtzdGF0fWA7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJpb3JpdHlMaXN0SXRlbShzdGF0OiBzdHJpbmcpOiBIVE1MTElFbGVtZW50IHtcbiAgICBjb25zdCB1cCA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgY2xhc3M6IFwicHJpb3JpdHktbW92ZSBwcmlvcml0eS1tb3ZlLXVwXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYFJhaXNlICR7c3RhdH0gcHJpb3JpdHlgLFxuICAgICAgICAgICAgdGl0bGU6IGBSYWlzZSAke3N0YXR9YCxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICB1cC5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihcInVwXCIpKTtcbiAgICBjb25zdCBkb3duID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBjbGFzczogXCJwcmlvcml0eS1tb3ZlIHByaW9yaXR5LW1vdmUtZG93blwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBMb3dlciAke3N0YXR9IHByaW9yaXR5YCxcbiAgICAgICAgICAgIHRpdGxlOiBgTG93ZXIgJHtzdGF0fWAsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgZG93bi5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihcImRvd25cIikpO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImxpXCIsXG4gICAgICAgIHsgY2xhc3M6IFwiZHJvcHpvbmVcIiwgZHJhZ2dhYmxlOiBcInRydWVcIiB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwicHJpb3JpdHktc3RhdC1sYWJlbFwiIH0sIHN0YXRdLFxuICAgICAgICBjcmVhdGVIVE1MKFtcInNwYW5cIiwgeyBjbGFzczogXCJwcmlvcml0eS1tb3ZlLWNvbnRyb2xzXCIgfSwgdXAsIGRvd25dKSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gcHJpb3JpdHlMaXN0SXRlbXMobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IEhUTUxMSUVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5jaGlsZHJlbikuZmlsdGVyKFxuICAgICAgICAobm9kZSk6IG5vZGUgaXMgSFRNTExJRWxlbWVudCA9PiBub2RlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBub2RlLmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHN5bmNSYW5raW5nU3VtbWFyeUhpbnQobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGhpbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X3N1bW1hcnlfaGludFwiKTtcbiAgICBpZiAoIShoaW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdG9wID0gcHJpb3JpdHlMaXN0SXRlbXMobGlzdClbMF07XG4gICAgaWYgKCF0b3ApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbCA9IGdldFByaW9yaXR5U3RhdExhYmVsKHRvcCk7XG4gICAgaWYgKGxhYmVsKSB7XG4gICAgICAgIGhpbnQudGV4dENvbnRlbnQgPSBgJHtsYWJlbH0gcmFua3MgYWxsIGVxdWlwbWVudGA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1zID0gcHJpb3JpdHlMaXN0SXRlbXMobGlzdCk7XG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICAgICAgY29uc3QgZG93biA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLWRvd25cIik7XG4gICAgICAgIGlmICh1cCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgICB1cC5kaXNhYmxlZCA9IGluZGV4ID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRvd24uZGlzYWJsZWQgPSBpbmRleCA9PT0gaXRlbXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHN5bmNSYW5raW5nU3VtbWFyeUhpbnQobGlzdCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVQcmlvcml0eUxpc3RJdGVtKGl0ZW06IEhUTUxMSUVsZW1lbnQsIGRpcmVjdGlvbjogXCJ1cFwiIHwgXCJkb3duXCIpOiB2b2lkIHtcbiAgICBjb25zdCBsaXN0ID0gaXRlbS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBzaWJsaW5nOiBFbGVtZW50IHwgbnVsbCA9IGRpcmVjdGlvbiA9PT0gXCJ1cFwiID8gaXRlbS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nIDogaXRlbS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgd2hpbGUgKHNpYmxpbmcgJiYgIShzaWJsaW5nIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBzaWJsaW5nLmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpKSkge1xuICAgICAgICBzaWJsaW5nID0gZGlyZWN0aW9uID09PSBcInVwXCIgPyBzaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBzaWJsaW5nLm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gICAgaWYgKCEoc2libGluZyBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJ1cFwiKSB7XG4gICAgICAgIHNpYmxpbmcuYmVmb3JlKGl0ZW0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2libGluZy5hZnRlcihpdGVtKTtcbiAgICB9XG4gICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlEcmFnRHJvcCgpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7IHRhcmdldCB9ID0gZXZlbnQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuY2xvc2VzdChcIi5wcmlvcml0eS1tb3ZlLCAucHJpb3JpdHktbW92ZS1jb250cm9sc1wiKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3cgPSB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIilcbiAgICAgICAgICAgID8gdGFyZ2V0XG4gICAgICAgICAgICA6IHRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKCEocm93IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ2dlZCA9IHJvdztcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcm9wem9uZSA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKGRyb3B6b25lIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSBkcm9wem9uZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIC0gdGFyZ2V0UmVjdC50b3A7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0YXJnZXRSZWN0LmhlaWdodDtcbiAgICAgICAgICAgIGVudW0gUG9zaXRpb24ge1xuICAgICAgICAgICAgICAgIGFib3ZlLFxuICAgICAgICAgICAgICAgIG9uLFxuICAgICAgICAgICAgICAgIGJlbG93LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB5IDwgaGVpZ2h0ICogMC4zID8gUG9zaXRpb24uYWJvdmUgOiB5ID4gaGVpZ2h0ICogMC43ID8gUG9zaXRpb24uYmVsb3cgOiBQb3NpdGlvbi5vbjtcbiAgICAgICAgICAgIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmFib3ZlOlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZHJvcHpvbmUuYmVmb3JlKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5iZWxvdzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGRyb3B6b25lLmFmdGVyKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5vbjpcbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZCA9PT0gZHJvcHpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSBkcm9wem9uZTtcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKCFkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4pIHtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5hZnRlcihkcmFnZ2VkKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJhZ2dlZC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50O1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICghKGRyb3BUYXJnZXQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gYCR7Z2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJvcFRhcmdldCl9KyR7Z2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCl9YDtcbiAgICAgICAgICAgIHNldFByaW9yaXR5U3RhdExhYmVsKGRyb3BUYXJnZXQsIGNvbWJpbmVkKTtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJvcFRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRyb3BSb3cgPSB0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIilcbiAgICAgICAgICAgID8gdGFyZ2V0XG4gICAgICAgICAgICA6IHRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKGRyb3BSb3cgPT09IGRyYWdnZWQgJiYgZHJhZ2dlZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZ2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCkuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCwgc3RhdHMuc2hpZnQoKSEpO1xuICAgICAgICAgICAgZHJhZ2dlZC5hZnRlciguLi5zdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQpKSk7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJhZ2dlZC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuYXBwbHlEcmFnRHJvcCgpO1xuXG5mdW5jdGlvbiBoeWRyYXRlUHJpb3JpdHlMaXN0Q29udHJvbHMoKTogdm9pZCB7XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHByaW9yaXR5TGlzdEl0ZW1zKHByaW9yaXR5TGlzdCkpIHtcbiAgICAgICAgaWYgKCFpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IChpdGVtLnRleHRDb250ZW50ID8/IFwiXCIpLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghc3RhdCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5yZXBsYWNlV2l0aChjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFN0YXRpYyBIVE1MIHNoaXBzIGVtcHR5IGNvbnRyb2wgc2hlbGxzOyBmaWxsIGljb25zIHdpdGhvdXQgbG9zaW5nIGxhYmVscy5cbiAgICAgICAgZm9yIChjb25zdCBidXR0b24gb2YgaXRlbS5xdWVyeVNlbGVjdG9yQWxsKFwiLnByaW9yaXR5LW1vdmVcIikpIHtcbiAgICAgICAgICAgIGlmICghKGJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB8fCBidXR0b24ucXVlcnlTZWxlY3RvcihcInN2Z1wiKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gYnV0dG9uLmNsYXNzTGlzdC5jb250YWlucyhcInByaW9yaXR5LW1vdmUtdXBcIikgPyBcInVwXCIgOiBcImRvd25cIjtcbiAgICAgICAgICAgIGJ1dHRvbi5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihkaXJlY3Rpb24pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUocHJpb3JpdHlMaXN0KTtcbn1cblxuaHlkcmF0ZVByaW9yaXR5TGlzdENvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIGNvbXBhcmUobGhzOiBudW1iZXIsIHJoczogbnVtYmVyKTogLTEgfCAwIHwgMSB7XG4gICAgaWYgKGxocyA9PT0gcmhzKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gbGhzIDwgcmhzID8gLTEgOiAxO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RlZENoYXJhY3RlcigpOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzQ2hhcmFjdGVyKHNlbGVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRTZWxlY3RlZENoYXJhY3RlcihjaGFyYWN0ZXI6IENoYXJhY3RlciB8IFwiQWxsXCIpIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIik7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGNoYXJhY3RlckZpbHRlckxpc3QpIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUgPT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgaXRlbVNlbGVjdG9ycyA9IFtcInBhcnRzU2VsZWN0b3JcIiwgXCJnYWNoYVNlbGVjdG9yXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgSXRlbVNlbGVjdG9yID0gdHlwZW9mIGl0ZW1TZWxlY3RvcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1TZWxlY3RvcihpdGVtU2VsZWN0b3I6IHN0cmluZyk6IGl0ZW1TZWxlY3RvciBpcyBJdGVtU2VsZWN0b3Ige1xuICAgIHJldHVybiAoaXRlbVNlbGVjdG9ycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhpdGVtU2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtVHlwZVNlbGVjdGlvbigpOiBJdGVtU2VsZWN0b3Ige1xuICAgIGNvbnN0IHBhcnRzU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzU2VsZWN0b3JcIik7XG4gICAgaWYgKCEocGFydHNTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKHBhcnRzU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhY2hhU2VsZWN0b3JcIik7XG4gICAgaWYgKCEoZ2FjaGFTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKGdhY2hhU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJnYWNoYVNlbGVjdG9yXCI7XG4gICAgfVxuICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCkgfHwgXCJBbGxcIjtcbiAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIkNoYXJhY3RlclwiLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgey8vRmlsdGVyc1xuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHsgLy9taXNjXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIiwgbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiLCBpdGVtX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5kZWxldGVfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiLCBlbmNoYW50VG9nZ2xlLmNoZWNrZWQpO1xuICAgIH1cbiAgICB7IC8vaXRlbSBzZWxlY3Rpb25cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIsIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpO1xuICAgIH1cblxuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZXhjbHVkZWRfaXRlbV9pZHNcIiwgQXJyYXkuZnJvbShleGNsdWRlZF9pdGVtX2lkcykuam9pbihcIixcIikpO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHN0b3JlZF9jaGFyYWN0ZXIgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIkNoYXJhY3RlclwiKTtcbiAgICBzZXRTZWxlY3RlZENoYXJhY3Rlcih0eXBlb2Ygc3RvcmVkX2NoYXJhY3RlciA9PT0gXCJzdHJpbmdcIiAmJiBpc0NoYXJhY3RlcihzdG9yZWRfY2hhcmFjdGVyKSA/IHN0b3JlZF9jaGFyYWN0ZXIgOiBcIk5pa2lcIik7XG5cbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhWYXJpYWJsZV9zdG9yYWdlLnZhcmlhYmxlcykpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0LCBzdGF0ZXMpO1xuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIHsgLy9taXNjXG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXhMZXZlbCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGAke21heExldmVsfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXZlbHJhbmdlLnZhbHVlID0gbGV2ZWxyYW5nZS5tYXg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtX25hbWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIG5hbWVmaWx0ZXIudmFsdWUgPSBpdGVtX25hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgICAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPSAhIVZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICB9XG5cbiAgICAvLyBSZWh5ZHJhdGUgZXhjbHVzaW9ucyBiZWZvcmUgYW55IHNhdmUtY2FwYWJsZSBldmVudCAoY2hhbmdlL2lucHV0IOKGkiB1cGRhdGVSZXN1bHRzIOKGkiBzYXZlU2VsZWN0aW9uKS5cbiAgICBjb25zdCBleGNsdWRlZF9pZHMgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImV4Y2x1ZGVkX2l0ZW1faWRzXCIpO1xuICAgIGlmICh0eXBlb2YgZXhjbHVkZWRfaWRzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaWRzLnNwbGl0KFwiLFwiKSkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VFeGNsdWRlZEl0ZW1JZFRva2VuKGlkKTtcbiAgICAgICAgICAgIGlmIChwYXJzZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmFkZChwYXJzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2l0ZW0gc2VsZWN0aW9uXG4gICAgICAgIGxldCBpdGVtVHlwZVNlbGVjdG9yID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIpO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1UeXBlU2VsZWN0b3IgIT09IFwic3RyaW5nXCIgfHwgIWlzSXRlbVNlbGVjdG9yKGl0ZW1UeXBlU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBpdGVtVHlwZVNlbGVjdG9yID0gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtVHlwZVNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCEoc2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBzZWxlY3Rvci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKTtcbiAgICB9XG5cbiAgICAvL211c3QgYmUgbGFzdCBiZWNhdXNlIGl0IHRyaWdnZXJzIGEgc3RvcmVcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xufVxuXG5jb25zdCBJTklUSUFMX1JFU1VMVF9ST1dTID0gMjQ7XG5jb25zdCBSRVNVTFRfUk9XU19QRVJfUkVRVUVTVCA9IDI0MDtcbmNvbnN0IE1BWF9SRVNVTFRfUk9XU19QRVJfRlJBTUUgPSA5NjtcbmNvbnN0IFJFU1VMVF9GUkFNRV9CVURHRVRfTVMgPSA4O1xubGV0IGFjdGl2ZVJlc3VsdHNSZW5kZXJlcjogUHJvZ3Jlc3NpdmVCYXRjaFJlbmRlcmVyPG51bWJlciwgSFRNTFRhYmxlUm93RWxlbWVudD4gfCB1bmRlZmluZWQ7XG5sZXQgYWN0aXZlUmVzdWx0c09ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCByZXN1bHRzUmVuZGVyVmVyc2lvbiA9IDA7XG5cbmZ1bmN0aW9uIHVwZGF0ZVJlc3VsdHMoKSB7XG4gICAgc2F2ZVNlbGVjdGlvbigpO1xuICAgIC8vIFdoaWxlIGZpcnN0LWxvYWQgbGFiIHByZXAgaXMgYWN0aXZlLCBrZWVwIGZyaWVuZGx5IGxvYWRpbmcgY29weSDigJQgZG8gbm90IHBhaW50XG4gICAgLy8gYW4gZW1wdHkgaW52ZW50b3J5IChcIk5vIGl0ZW1zIG1hdGNo4oCmXCIpIG92ZXIgdGhlIGFuaW1hdGVkIGxvYWRlci5cbiAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX2dyb3VwXCIpPy5nZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYWN0aXZlUmVzdWx0c1JlbmRlcmVyPy5jYW5jZWwoKTtcbiAgICBhY3RpdmVSZXN1bHRzUmVuZGVyZXIgPSB1bmRlZmluZWQ7XG4gICAgYWN0aXZlUmVzdWx0c09ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgYWN0aXZlUmVzdWx0c09ic2VydmVyID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IHJlbmRlclZlcnNpb24gPSArK3Jlc3VsdHNSZW5kZXJWZXJzaW9uO1xuICAgIGNvbnN0IGZpbHRlcnM6ICgoaXRlbTogSXRlbSkgPT4gYm9vbGVhbilbXSA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZUZpbHRlcnM6ICgoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbilbXSA9IFtdO1xuICAgIGxldCBzZWxlY3RlZENoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgeyAvL2NoYXJhY3RlciBmaWx0ZXJcbiAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXIgPSBnZXRTZWxlY3RlZENoYXJhY3RlcigpO1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZENoYXJhY3Rlcikge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLmNoYXJhY3RlciA9PT0gc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL3BhcnRzIGZpbHRlclxuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzU3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpO1xuICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IHBhcnRzU3RhdGVzW2l0ZW0ucGFydF0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vYXZhaWxhYmlsaXR5IGZpbHRlclxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpO1xuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkdvbGRcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmICFpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJBUFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW50cmFkYWJsZVwiXSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5wYXJjZWxfZW5hYmxlZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJBbGxvdyBnYWNoYVwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHdWFyZGlhblwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIWl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbmF2YWlsYWJsZSBpdGVtc1wiXSkge1xuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyID0gWy4uLnNvdXJjZUZpbHRlcnNdO1xuICAgICAgICAgICAgY29uc3Qgc291cmNlRmlsdGVyID0gKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlci5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZUZpbHRlcihpdGVtU291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2Uoc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGlzQXZhaWxhYmxlU291cmNlKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtKGl0ZW06IEl0ZW0pOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW1Tb3VyY2Ugb2YgaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGlzQXZhaWxhYmxlSXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vbWlzYyBmaWx0ZXJcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgZmlsdGVycy5wdXNoKChpdGVtOiBJdGVtKSA9PiBpdGVtLmxldmVsIDw9IG1heExldmVsKTtcblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBuYW1lZmlsdGVyLnZhbHVlO1xuICAgICAgICBpZiAoaXRlbV9uYW1lKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLm5hbWVfZW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhpdGVtX25hbWUudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2lkIGZpbHRlclxuICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiAhZXhjbHVkZWRfaXRlbV9pZHMuaGFzKGl0ZW0uaWQpKTtcbiAgICAgICAgY29uc3QgaXRlbUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIml0ZW1GaWx0ZXJcIik7XG4gICAgICAgIGlmICghKGl0ZW1GaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG5cbiAgICAgICAgfVxuICAgICAgICBpdGVtRmlsdGVyTGlzdC5yZXBsYWNlQ2hpbGRyZW4oKTtcbiAgICAgICAgaWYgKGV4Y2x1ZGVkX2l0ZW1faWRzLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgIGl0ZW1GaWx0ZXJMaXN0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZW1wdHktbm90ZVwiIH0sXG4gICAgICAgICAgICAgICAgXCJObyBleGNsdWRlZCBpdGVtc1wiLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpZCBvZiBleGNsdWRlZF9pdGVtX2lkcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtcy5nZXQoaWQpO1xuICAgICAgICAgICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbUZpbHRlckxpc3QuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZXhjbHVkZWQtaXRlbVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJleGNsdWRlZC1pdGVtX19uYW1lXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWl0ZW1faW5kZXhcIjogYCR7aWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYFJlc3RvcmUgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVzdG9yZVwiLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IGNvbXBhcmF0b3JzOiAoKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBudW1iZXIpW10gPSBbXTtcblxuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5U3RhdHMgPSBwcmlvcml0eUxpc3RJdGVtcyhwcmlvcml0eUxpc3QpXG4gICAgICAgIC5tYXAobm9kZSA9PiBnZXRQcmlvcml0eVN0YXRMYWJlbChub2RlKSlcbiAgICAgICAgLmZpbHRlcihzdGF0ID0+IHN0YXQubGVuZ3RoID4gMCk7XG4gICAge1xuICAgICAgICBmb3IgKGNvbnN0IHN0YXQgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICAgICAgICAgIGNvbXBhcmF0b3JzLnB1c2goKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBjb21wYXJlKFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IGxocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSksXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gcmhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSAoKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwiZXF1aXBtZW50XCIgYXMgY29uc3QsXG4gICAgICAgICAgICAgICAgICAgIHBsYW46IGdldFJlc3VsdHNUYWJsZVBsYW4oXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlID0+IHNvdXJjZUZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVQcmlvcml0eVJhbmtlcihjb21wYXJhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eVN0YXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXIsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IFwiZ2FjaGFcIiBhcyBjb25zdCxcbiAgICAgICAgICAgICAgICAgICAgdGFibGU6IGdldEdhY2hhVGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENoYXJhY3RlcixcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1wiKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c19ncm91cFwiKTtcbiAgICBjb25zdCByZXN1bHRzU3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzU3RhdHVzXCIpO1xuICAgIGNvbnN0IHRhYmxlU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZVNjcm9sbFwiKTtcbiAgICBpZiAodGFibGVTY3JvbGwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0YWJsZVNjcm9sbC5zY3JvbGxUb3AgPSAwO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQua2luZCA9PT0gXCJnYWNoYVwiKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdFJvd3MgPSByZXN1bHQudGFibGUudEJvZGllc1swXT8ucm93cy5sZW5ndGhcbiAgICAgICAgICAgID8/IE1hdGgubWF4KDAsIHJlc3VsdC50YWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xuICAgICAgICB0YXJnZXQucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgIGlmIChyZXN1bHRSb3dzID09PSAwKSB7XG4gICAgICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWVtcHR5XCIsIHJvbGU6IFwic3RhdHVzXCIgfSxcbiAgICAgICAgICAgICAgICBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIsXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocmVzdWx0LnRhYmxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0c1N0YXR1cykge1xuICAgICAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IHJlc3VsdFJvd3MgPT09IDBcbiAgICAgICAgICAgICAgICA/IFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIlxuICAgICAgICAgICAgICAgIDogYCR7cmVzdWx0Um93c30gbWF0Y2hpbmcgJHtyZXN1bHRSb3dzID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyLXN0YXRlXCIsIFwiY29tcGxldGVcIik7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXJlZC1yb3dzXCIsIGAke3Jlc3VsdFJvd3N9YCk7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS10b3RhbC1yb3dzXCIsIGAke3Jlc3VsdFJvd3N9YCk7XG4gICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcGxhbiB9ID0gcmVzdWx0O1xuICAgIGlmIChwbGFuLnRvdGFsUm93cyA9PT0gMCkge1xuICAgICAgICB0YXJnZXQucmVwbGFjZUNoaWxkcmVuKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInJlc3VsdHMtZW1wdHlcIiwgcm9sZTogXCJzdGF0dXNcIiB9LFxuICAgICAgICAgICAgXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiLFxuICAgICAgICBdKSk7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMgJiYgKHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIpO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyLXN0YXRlXCIsIFwiY29tcGxldGVcIik7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXJlZC1yb3dzXCIsIFwiMFwiKTtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRvdGFsLXJvd3NcIiwgXCIwXCIpO1xuICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZUJvZHkgPSBwbGFuLnRhYmxlLnRCb2RpZXNbMF07XG4gICAgaWYgKCF0YWJsZUJvZHkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICB0YXJnZXQucmVwbGFjZUNoaWxkcmVuKHBsYW4udGFibGUpO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyLXN0YXRlXCIsIFwicmVuZGVyaW5nXCIpO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZXN1bHRzLXZlcnNpb25cIiwgYCR7cmVuZGVyVmVyc2lvbn1gKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyZWQtcm93c1wiLCBcIjBcIik7XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRvdGFsLXJvd3NcIiwgYCR7cGxhbi50b3RhbFJvd3N9YCk7XG5cbiAgICBjb25zdCBsb2FkTW9yZVJvdyA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInRyXCIsXG4gICAgICAgIHsgY2xhc3M6IFwicmVzdWx0cy1sb2FkLW1vcmVcIiB9LFxuICAgICAgICBbXCJ0ZFwiLFxuICAgICAgICAgICAgeyBjb2xzcGFuOiBgJHtwcmlvcml0eVN0YXRzLmxlbmd0aCArIDZ9YCB9LFxuICAgICAgICAgICAgW1wiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWxvYWQtbW9yZV9fYnV0dG9uXCIsIHR5cGU6IFwiYnV0dG9uXCIgfSxcbiAgICAgICAgICAgICAgICBcIkxvYWQgbW9yZSByZXN1bHRzXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgIF0pO1xuICAgIGNvbnN0IGxvYWRNb3JlQnV0dG9uID0gbG9hZE1vcmVSb3cucXVlcnlTZWxlY3RvcihcImJ1dHRvblwiKTtcbiAgICBpZiAoIShsb2FkTW9yZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgbGV0IHJlbmRlcmVyOiBQcm9ncmVzc2l2ZUJhdGNoUmVuZGVyZXI8bnVtYmVyLCBIVE1MVGFibGVSb3dFbGVtZW50PjtcbiAgICBjb25zdCByZXF1ZXN0TW9yZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFyZW5kZXJlci5jb250aW51ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbG9hZE1vcmVSb3cucmVtb3ZlKCk7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXJlbmRlci1zdGF0ZVwiLCBcInJlbmRlcmluZ1wiKTtcbiAgICB9O1xuICAgIGxvYWRNb3JlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByZXF1ZXN0TW9yZSk7XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IHR5cGVvZiBJbnRlcnNlY3Rpb25PYnNlcnZlciA9PT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICA6IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihlbnRyaWVzID0+IHtcbiAgICAgICAgICAgIGlmIChlbnRyaWVzLnNvbWUoZW50cnkgPT4gZW50cnkuaXNJbnRlcnNlY3RpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdE1vcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgcm9vdDogbnVsbCxcbiAgICAgICAgICAgIHJvb3RNYXJnaW46IFwiMzIwcHggMHB4XCIsXG4gICAgICAgIH0pO1xuICAgIGFjdGl2ZVJlc3VsdHNPYnNlcnZlciA9IG9ic2VydmVyO1xuXG4gICAgcmVuZGVyZXIgPSBuZXcgUHJvZ3Jlc3NpdmVCYXRjaFJlbmRlcmVyPG51bWJlciwgSFRNTFRhYmxlUm93RWxlbWVudD4oe1xuICAgICAgICBzY2hlZHVsZXI6IGJyb3dzZXJGcmFtZVNjaGVkdWxlcixcbiAgICAgICAgbm93OiAoKSA9PiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgICAgaW5pdGlhbFJvd3M6IElOSVRJQUxfUkVTVUxUX1JPV1MsXG4gICAgICAgIHJvd3NQZXJSZXF1ZXN0OiBSRVNVTFRfUk9XU19QRVJfUkVRVUVTVCxcbiAgICAgICAgbWF4Um93c1BlckZyYW1lOiBNQVhfUkVTVUxUX1JPV1NfUEVSX0ZSQU1FLFxuICAgICAgICBmcmFtZUJ1ZGdldE1zOiBSRVNVTFRfRlJBTUVfQlVER0VUX01TLFxuICAgICAgICBjcmVhdGU6IGluZGV4ID0+IHBsYW4uY3JlYXRlUm93KGluZGV4KSxcbiAgICAgICAgY29tbWl0KHJvd3MsIHN0YXRlKSB7XG4gICAgICAgICAgICBpZiAocmVuZGVyVmVyc2lvbiAhPT0gcmVzdWx0c1JlbmRlclZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2FkTW9yZVJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kKC4uLnJvd3MpO1xuICAgICAgICAgICAgdGFibGVCb2R5LmFwcGVuZChmcmFnbWVudCk7XG4gICAgICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImRhdGEtcmVuZGVyZWQtcm93c1wiLCBgJHtzdGF0ZS5yZW5kZXJlZH1gKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGF1c2Uoc3RhdGUpIHtcbiAgICAgICAgICAgIGlmIChyZW5kZXJWZXJzaW9uICE9PSByZXN1bHRzUmVuZGVyVmVyc2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmQobG9hZE1vcmVSb3cpO1xuICAgICAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXItc3RhdGVcIiwgXCJwYXJ0aWFsXCIpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdHNTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgYFNob3dpbmcgJHtzdGF0ZS5yZW5kZXJlZH0gb2YgJHtzdGF0ZS50b3RhbH0gbWF0Y2hpbmcgaXRlbXNgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZShzdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHJlbmRlclZlcnNpb24gIT09IHJlc3VsdHNSZW5kZXJWZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIGxvYWRNb3JlUm93LnJlbW92ZSgpO1xuICAgICAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiZGF0YS1yZW5kZXItc3RhdGVcIiwgXCJjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRzU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9XG4gICAgICAgICAgICAgICAgICAgIGAke3N0YXRlLnRvdGFsfSBtYXRjaGluZyAke3N0YXRlLnRvdGFsID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmVSZXN1bHRzUmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICByZW5kZXJlci5zdGFydChBcnJheS5mcm9tKHsgbGVuZ3RoOiBwbGFuLnRvdGFsUm93cyB9LCAoXywgaW5kZXgpID0+IGluZGV4KSk7XG4gICAgb2JzZXJ2ZXI/Lm9ic2VydmUobG9hZE1vcmVSb3cpO1xufVxuXG5sZXQgcmVzdWx0c1RhYmxlU2Nyb2xsQm91bmQgPSBmYWxzZTtcbmxldCByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCByZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQgPSBmYWxzZTtcblxuLyoqIEtlZXAgdGhlIHRvcCBjb2x1bW4gc2Nyb2xsZXIgd2lkdGggYW5kIHNjcm9sbExlZnQgYWxpZ25lZCB3aXRoIHRoZSByZXN1bHRzIHRhYmxlLiAqL1xuZnVuY3Rpb24gc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpIHtcbiAgICBjb25zdCB0YWJsZVNjcm9sbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVTY3JvbGxcIik7XG4gICAgY29uc3QgdGFibGVIU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxcIik7XG4gICAgY29uc3Qgc3BhY2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxTcGFjZXJcIik7XG4gICAgY29uc3QgY29sdW1uUGFuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUNvbHVtblBhblwiKTtcbiAgICBpZiAoISh0YWJsZVNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHRhYmxlSFNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHNwYWNlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGNvbHVtblBhbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHRzVGFibGVTY3JvbGxCb3VuZCkge1xuICAgICAgICByZXN1bHRzVGFibGVTY3JvbGxCb3VuZCA9IHRydWU7XG4gICAgICAgIGxldCBzeW5jaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IG1pcnJvciA9IChzb3VyY2U6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3luY2luZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN5bmNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGFyZ2V0LnNjcm9sbExlZnQgPSBzb3VyY2Uuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHN5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGFibGVTY3JvbGwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBtaXJyb3IodGFibGVTY3JvbGwsIHRhYmxlSFNjcm9sbCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgdGFibGVIU2Nyb2xsLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgbWlycm9yKHRhYmxlSFNjcm9sbCwgdGFibGVTY3JvbGwpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcbiAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXIub2JzZXJ2ZSh0YWJsZVNjcm9sbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlU2Nyb2xsLnF1ZXJ5U2VsZWN0b3IoXCJ0YWJsZVwiKTtcbiAgICBpZiAoISh0YWJsZSBpbnN0YW5jZW9mIEhUTUxUYWJsZUVsZW1lbnQpKSB7XG4gICAgICAgIGNvbHVtblBhbi5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBcIjBweFwiO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudFdpZHRoID0gTWF0aC5tYXgodGFibGUuc2Nyb2xsV2lkdGgsIHRhYmxlU2Nyb2xsLnNjcm9sbFdpZHRoKTtcbiAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBgJHtjb250ZW50V2lkdGh9cHhgO1xuICAgIGNvbnN0IG5lZWRzSG9yaXpvbnRhbFNjcm9sbCA9IGNvbnRlbnRXaWR0aCA+IHRhYmxlU2Nyb2xsLmNsaWVudFdpZHRoICsgMTtcbiAgICBjb25zdCB3YXNIaWRkZW4gPSBjb2x1bW5QYW4uaGlkZGVuO1xuICAgIGNvbHVtblBhbi5oaWRkZW4gPSAhbmVlZHNIb3Jpem9udGFsU2Nyb2xsO1xuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ/LmlzU2FtZU5vZGUodGFibGVIU2Nyb2xsKSkge1xuICAgICAgICB0YWJsZUhTY3JvbGwuc2Nyb2xsTGVmdCA9IHRhYmxlU2Nyb2xsLnNjcm9sbExlZnQ7XG4gICAgfVxuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgd2FzSGlkZGVuICYmICFyZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQpIHtcbiAgICAgICAgcmVzdWx0c0NvbHVtblBhblJldmVhbGVkID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5hZGQoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgfSwgMjQwKTtcbiAgICB9XG4gICAgaWYgKCFuZWVkc0hvcml6b250YWxTY3JvbGwpIHtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpIHtcbiAgICBjb25zdCBsZXZlbERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVsRGlzcGxheVwiKTtcbiAgICBpZiAoIShsZXZlbERpc3BsYXkgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbGV2ZWxyYW5nZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBsZXZlbERpc3BsYXkudGV4dENvbnRlbnQgPSBgTWF4IGxldmVsIHJlcXVpcmVtZW50OiAke2xldmVscmFuZ2UudmFsdWV9YDtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNwbGF5VXBkYXRlcygpIHtcbiAgICBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKTtcbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBuYW1lZmlsdGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcblxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgZW5jaGFudFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyAvXigoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLyA6IC9eTWF4ICgoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLztcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VyID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gXCJNYXggJDFcIiA6IFwiJDFcIjtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChub2RlKS5zcGxpdChcIitcIikubWFwKHMgPT4gcy5yZXBsYWNlKHJlZ2V4LCByZXBsYWNlcikpLmpvaW4oXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSwgbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5zZXREaXNwbGF5VXBkYXRlcygpO1xuXG5mdW5jdGlvbiBzZXRNb2JpbGVGaWx0ZXJDb250cm9scygpIHtcbiAgICBjb25zdCBmaWx0ZXJUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlclRvZ2dsZVwiKTtcbiAgICBjb25zdCBjbG9zZUZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlRmlsdGVyc1wiKTtcbiAgICBjb25zdCBmaWx0ZXJQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbFJhaWxcIik7XG4gICAgY29uc3QgZmlsdGVyQmFja2Ryb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlckJhY2tkcm9wXCIpO1xuICAgIGlmICghKGZpbHRlclRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGNsb3NlRmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlclBhbmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyQmFja2Ryb3AgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b2dnbGVCdXR0b24gPSBmaWx0ZXJUb2dnbGU7XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjbG9zZUZpbHRlcnM7XG4gICAgY29uc3QgcGFuZWwgPSBmaWx0ZXJQYW5lbDtcbiAgICBjb25zdCBiYWNrZHJvcEJ1dHRvbiA9IGZpbHRlckJhY2tkcm9wO1xuXG4gICAgZnVuY3Rpb24gc2V0T3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICB0b2dnbGVCdXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBgJHtvcGVufWApO1xuICAgICAgICBiYWNrZHJvcEJ1dHRvbi5oaWRkZW4gPSAhb3BlbjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZmlsdGVycy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgY29uc3QgbmFtZUZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgICAgIGlmIChuYW1lRmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvY3VzQWZ0ZXJPcGVuID0gKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnByb3BlcnR5TmFtZSAhPT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIGZvY3VzQWZ0ZXJPcGVuKTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgIG5hbWVGaWx0ZXIuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbi5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKHRydWUpKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGJhY2tkcm9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgIT09IFwiVGFiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IEFycmF5LmZyb20ocGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzdW1tYXJ5LCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICkpLmZpbHRlcihlbGVtZW50ID0+IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBsYXN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZmlyc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGFzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZXZlbnQuc2hpZnRLZXlcbiAgICAgICAgICAgICYmICghcGFuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgfHwgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gbGFzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmlyc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3aW5kb3cubWF0Y2hNZWRpYShcIihtaW4td2lkdGg6IDg4MHB4KVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICh7IG1hdGNoZXMgfSkgPT4ge1xuICAgICAgICBpZiAobWF0Y2hlcyAmJiBwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5zZXRNb2JpbGVGaWx0ZXJDb250cm9scygpO1xuXG5mdW5jdGlvbiBzZXRSZXNldEZpbHRlckNvbnRyb2woKSB7XG4gICAgY29uc3QgcmVzZXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldEZpbHRlcnNcIik7XG4gICAgY29uc3QgcmVmaW5lbWVudFN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmaW5lbWVudFN0YXR1c1wiKTtcbiAgICBpZiAoIShyZXNldEZpbHRlcnMgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShyZWZpbmVtZW50U3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzZXRGaWx0ZXJzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHJlZmluZW1lbnRTdGF0dXMudGV4dENvbnRlbnQgPSBcIlJlc2V0dGluZyBmaWx0ZXJz4oCmXCI7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuY2xlYXJfYWxsKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn1cblxuc2V0UmVzZXRGaWx0ZXJDb250cm9sKCk7XG5cbmZ1bmN0aW9uIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCkge1xuICAgIGNvbnN0IHByaW9yaXR5X2dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9ncm91cFwiKTtcbiAgICBpZiAoIShwcmlvcml0eV9ncm91cCBpbnN0YW5jZW9mIEhUTUxGaWVsZFNldEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik7XG4gICAgaWYgKCEocGFydHNGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYXJ0c1NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnYWNoYVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0c0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzX2dyb3VwXCIpO1xuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgY29uc3QgbG9hZGluZ0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdDb3B5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19kZXRhaWxcIilcbiAgICAgICAgPz8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19jb3B5IHNwYW5cIik7XG4gICAgY29uc3QgbG9hZGluZ0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX2dyb3VwXCIpO1xuICAgIGlmICghKHJlc3VsdHNTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShsb2FkaW5nTGFiZWwgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdDb3B5IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJ0cnVlXCIpO1xuICAgIGxvYWRpbmdHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICBzZXRJdGVtVHlwZVNlbGVjdG9yRnVuY3Rpb25hbGl0eSgpO1xuICAgIHJlc3RvcmVTZWxlY3Rpb24oKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkb3dubG9hZEl0ZW1zKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIkl0ZW0gZGF0YSB1bmF2YWlsYWJsZVwiO1xuICAgICAgICBsb2FkaW5nTGFiZWwudGV4dENvbnRlbnQgPSBcIkNvdWxkIG5vdCBsb2FkIGVxdWlwbWVudCBkYXRhXCI7XG4gICAgICAgIGxvYWRpbmdDb3B5LnRleHRDb250ZW50ID0gXCJDaGVjayB0aGUgcHJldmlldyBzZXJ2ZXIgY29ubmVjdGlvbiwgdGhlbiByZWxvYWQgdGhpcyBwYWdlLlwiO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICBsb2FkaW5nR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2hvd19hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJoaWRlX2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBtYXhMZXZlbCA9IGdldE1heEl0ZW1MZXZlbCgpO1xuICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHtNYXRoLm1pbihwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKSwgbWF4TGV2ZWwpfWA7XG4gICAgbGV2ZWxyYW5nZS5tYXggPSBgJHttYXhMZXZlbH1gO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgbG9hZGluZ0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJVc2UgdGhlIHVwL2Rvd24gYXJyb3dzLCBvciBkcmFnIGEgc3RhdCwgdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBtb3ZlIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVVwID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBpZiAocHJpb3JpdHlVcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICFwcmlvcml0eVVwLmRpc2FibGVkKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByaW9yaXR5VXAuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwidXBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5RG93biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAocHJpb3JpdHlEb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiYgIXByaW9yaXR5RG93bi5kaXNhYmxlZCkge1xuICAgICAgICBjb25zdCByb3cgPSBwcmlvcml0eURvd24uY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwiZG93blwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbFwiKTtcbiAgICBpZiAoZXhjbHVkZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdG9yZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIpO1xuICAgIGlmIChyZXN0b3JlQnV0dG9uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuZXhwb3J0IHR5cGUgUHJpb3JpdHlSYW5rZXI8VD4gPSB7XG4gICAgKGN1cnJlbnQ6IFRbXSwgY2FuZGlkYXRlOiBUKTogVFtdO1xuICAgIGNvbXBhcmUobGhzOiBULCByaHM6IFQpOiBudW1iZXI7XG4gICAgc29ydEFsbChpdGVtczogcmVhZG9ubHkgVFtdKTogVFtdO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVCeVByaW9yaXR5PFQ+KFxuICAgIGxoczogVCxcbiAgICByaHM6IFQsXG4gICAgY29tcGFyYXRvcnM6IHJlYWRvbmx5IFByaW9yaXR5Q29tcGFyYXRvcjxUPltdLFxuKTogbnVtYmVyIHtcbiAgICBmb3IgKGNvbnN0IGNvbXBhcmF0b3Igb2YgY29tcGFyYXRvcnMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGFyYXRvcihsaHMsIHJocyk7XG4gICAgICAgIGlmIChyZXN1bHQgIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogUmFuayBvbmUgY29tcGxldGUgY2FuZGlkYXRlIGJ1Y2tldCB3aXRoIGEgc2luZ2xlIG5hdGl2ZSBzdGFibGUgc29ydC5cbiAqIEhpZ2hlciBjb21wYXJhdG9yIHZhbHVlcyByYW5rIGZpcnN0OyBvcmlnaW5hbCBpbmRleGVzIHByZXNlcnZlIEZJRk8gdGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvcnRCeVByaW9yaXR5PFQ+KFxuICAgIGl0ZW1zOiByZWFkb25seSBUW10sXG4gICAgY29tcGFyYXRvcnM6IHJlYWRvbmx5IFByaW9yaXR5Q29tcGFyYXRvcjxUPltdLFxuKTogVFtdIHtcbiAgICByZXR1cm4gaXRlbXNcbiAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAuc29ydCgobGhzLCByaHMpID0+XG4gICAgICAgICAgICBjb21wYXJlQnlQcmlvcml0eShyaHMuaXRlbSwgbGhzLml0ZW0sIGNvbXBhcmF0b3JzKVxuICAgICAgICAgICAgfHwgbGhzLmluZGV4IC0gcmhzLmluZGV4XG4gICAgICAgIClcbiAgICAgICAgLm1hcCgoeyBpdGVtIH0pID0+IGl0ZW0pO1xufVxuXG4vKipcbiAqIEluc2VydCBgY2FuZGlkYXRlYCBpbnRvIGEgYmVzdC1maXJzdCByYW5raW5nLlxuICogSGlnaGVyIGNvbXBhcmF0b3IgdmFsdWVzIG1lYW4gdGhlIGxlZnQtaGFuZCBpdGVtIHJhbmtzIGJldHRlci5cbiAqIEV2ZXJ5IGNhbmRpZGF0ZSBpcyByZXRhaW5lZCBzbyB0aGUgVUkgY2FuIHNob3cgdGhlIGZ1bGwgZmlsdGVyZWQgaW52ZW50b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0QnlQcmlvcml0eTxUPihcbiAgICBjdXJyZW50OiBUW10sXG4gICAgY2FuZGlkYXRlOiBULFxuICAgIGNvbXBhcmF0b3JzOiByZWFkb25seSBQcmlvcml0eUNvbXBhcmF0b3I8VD5bXSxcbik6IFRbXSB7XG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbY2FuZGlkYXRlXTtcbiAgICB9XG5cbiAgICBsZXQgaW5zZXJ0QXQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY3VycmVudC5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgbGV0IGRlY2lkZWQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbXBhcmF0b3Igb2YgY29tcGFyYXRvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBhcmF0b3IoY3VycmVudFtpbmRleF0sIGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVjaWRlZCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVjaWRlZCA8IDApIHtcbiAgICAgICAgICAgIC8vIGN1cnJlbnRbaW5kZXhdIGlzIHdvcnNlIHRoYW4gY2FuZGlkYXRlOiBpbnNlcnQgYmVmb3JlIGl0LlxuICAgICAgICAgICAgaW5zZXJ0QXQgPSBpbmRleDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRlY2lkZWQgPiAwOiBjdXJyZW50IGl0ZW0gaXMgYmV0dGVyOyBrZWVwIHNjYW5uaW5nLlxuICAgICAgICAvLyBkZWNpZGVkID09PSAwOiBleGFjdCB0aWU7IGtlZXAgc2Nhbm5pbmcgc28gdGllcyBzdGF5IHN0YWJsZS9GSUZPLlxuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmN1cnJlbnQuc2xpY2UoMCwgaW5zZXJ0QXQpLFxuICAgICAgICBjYW5kaWRhdGUsXG4gICAgICAgIC4uLmN1cnJlbnQuc2xpY2UoaW5zZXJ0QXQpLFxuICAgIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcmlvcml0eVJhbmtlcjxUPihcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBQcmlvcml0eVJhbmtlcjxUPiB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIChjdXJyZW50OiBUW10sIGNhbmRpZGF0ZTogVCkgPT5cbiAgICAgICAgICAgIHNlbGVjdEJ5UHJpb3JpdHkoY3VycmVudCwgY2FuZGlkYXRlLCBjb21wYXJhdG9ycyksXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbXBhcmU6IChsaHM6IFQsIHJoczogVCkgPT5cbiAgICAgICAgICAgICAgICBjb21wYXJlQnlQcmlvcml0eShsaHMsIHJocywgY29tcGFyYXRvcnMpLFxuICAgICAgICAgICAgc29ydEFsbDogKGl0ZW1zOiByZWFkb25seSBUW10pID0+XG4gICAgICAgICAgICAgICAgc29ydEJ5UHJpb3JpdHkoaXRlbXMsIGNvbXBhcmF0b3JzKSxcbiAgICAgICAgfSxcbiAgICApO1xufVxuXG4vKipcbiAqIE1lcmdlIGluZGVwZW5kZW50bHkgcmFua2VkIHJ1bnMgaW50byBvbmUgc3RhYmxlIGJlc3QtZmlyc3QgcmFua2luZy5cbiAqIEVhY2ggaW5wdXQgbXVzdCBhbHJlYWR5IHVzZSB0aGUgc2FtZSBgY29tcGFyYXRvcmAgb3JkZXJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVByaW9yaXR5UmFua2luZ3M8VD4oXG4gICAgcmFua2luZ3M6IHJlYWRvbmx5IChyZWFkb25seSBUW10pW10sXG4gICAgY29tcGFyYXRvcjogUHJpb3JpdHlDb21wYXJhdG9yPFQ+LFxuKTogVFtdIHtcbiAgICBjb25zdCBjdXJzb3JzID0gcmFua2luZ3MubWFwKCgpID0+IDApO1xuICAgIGNvbnN0IG1lcmdlZDogVFtdID0gW107XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBsZXQgd2lubmVyUnVuID0gLTE7XG4gICAgICAgIGZvciAobGV0IHJ1biA9IDA7IHJ1biA8IHJhbmtpbmdzLmxlbmd0aDsgcnVuICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChjdXJzb3JzW3J1bl0gPj0gcmFua2luZ3NbcnVuXS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3aW5uZXJSdW4gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgd2lubmVyUnVuID0gcnVuO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB3aW5uZXIgPSByYW5raW5nc1t3aW5uZXJSdW5dW2N1cnNvcnNbd2lubmVyUnVuXV07XG4gICAgICAgICAgICBjb25zdCBjaGFsbGVuZ2VyID0gcmFua2luZ3NbcnVuXVtjdXJzb3JzW3J1bl1dO1xuICAgICAgICAgICAgaWYgKGNvbXBhcmF0b3Iod2lubmVyLCBjaGFsbGVuZ2VyKSA8IDApIHtcbiAgICAgICAgICAgICAgICB3aW5uZXJSdW4gPSBydW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2lubmVyUnVuID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1lcmdlZC5wdXNoKHJhbmtpbmdzW3dpbm5lclJ1bl1bY3Vyc29yc1t3aW5uZXJSdW5dXSk7XG4gICAgICAgIGN1cnNvcnNbd2lubmVyUnVuXSArPSAxO1xuICAgIH1cbn1cbiIsIi8qKiBJbnRlcm5hbCBwcmlvcml0eSBrZXlzIOKGkiBzaG9ydCB0YWJsZSBoZWFkZXIgKyBodW1hbiBmdWxsIG5hbWUgZm9yIHRvb2x0aXBzLiAqL1xuY29uc3QgUFJJT1JJVFlfU1RBVF9IRUFERVJfQUJCUkVWOiBSZWFkb25seTxcbiAgICBSZWNvcmQ8c3RyaW5nLCB7IHJlYWRvbmx5IHNob3J0OiBzdHJpbmc7IHJlYWRvbmx5IGZ1bGw6IHN0cmluZyB9PlxuPiA9IHtcbiAgICBcIk1vdiBTcGVlZFwiOiB7IHNob3J0OiBcIk1TXCIsIGZ1bGw6IFwiTW92IFNwZWVkXCIgfSxcbiAgICBcIlF1aWNrc2xvdHNcIjogeyBzaG9ydDogXCJRU1wiLCBmdWxsOiBcIlF1aWNrIFNsb3RzXCIgfSxcbiAgICBcIkJ1ZmZzbG90c1wiOiB7IHNob3J0OiBcIkJTXCIsIGZ1bGw6IFwiQnVmZiBTbG90c1wiIH0sXG59O1xuXG5leHBvcnQgdHlwZSBQcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5ID0ge1xuICAgIHJlYWRvbmx5IHNob3J0OiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZnVsbDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGFiYnJldmlhdGVkOiBib29sZWFuO1xufTtcblxuLyoqIE1hcCBhIHByaW9yaXR5IHN0YXQga2V5IChvciBjb21iaW5lZCBcIkErQlwiKSB0byBzaG9ydCBoZWFkZXIgdGV4dCArIGZ1bGwgdG9vbHRpcCBuYW1lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkoc3RhdDogc3RyaW5nKTogUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB7XG4gICAgY29uc3QgcGFydHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICBjb25zdCBtYXBwZWQgPSBwYXJ0cy5tYXAoKHBhcnQpID0+IHtcbiAgICAgICAgY29uc3Qga25vd24gPSBQUklPUklUWV9TVEFUX0hFQURFUl9BQkJSRVZbcGFydF07XG4gICAgICAgIHJldHVybiBrbm93biA/PyB7IHNob3J0OiBwYXJ0LCBmdWxsOiBwYXJ0IH07XG4gICAgfSk7XG4gICAgY29uc3Qgc2hvcnQgPSBtYXBwZWQubWFwKChwYXJ0KSA9PiBwYXJ0LnNob3J0KS5qb2luKFwiK1wiKTtcbiAgICBjb25zdCBmdWxsID0gbWFwcGVkLm1hcCgocGFydCkgPT4gcGFydC5mdWxsKS5qb2luKFwiK1wiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaG9ydCxcbiAgICAgICAgZnVsbCxcbiAgICAgICAgYWJicmV2aWF0ZWQ6IHNob3J0ICE9PSBmdWxsLFxuICAgIH07XG59XG4iLCJleHBvcnQgdHlwZSBGcmFtZVNjaGVkdWxlciA9IHtcbiAgICByZXF1ZXN0KGNhbGxiYWNrOiBGcmFtZVJlcXVlc3RDYWxsYmFjayk6IG51bWJlcixcbiAgICBjYW5jZWwoaGFuZGxlOiBudW1iZXIpOiB2b2lkLFxufTtcblxuZXhwb3J0IHR5cGUgUHJvZ3Jlc3NpdmVCYXRjaFN0YXRlID0ge1xuICAgIHZlcnNpb246IG51bWJlcixcbiAgICByZW5kZXJlZDogbnVtYmVyLFxuICAgIHRvdGFsOiBudW1iZXIsXG4gICAgY29tcGxldGU6IGJvb2xlYW4sXG59O1xuXG50eXBlIFByb2dyZXNzaXZlQmF0Y2hPcHRpb25zPElucHV0LCBPdXRwdXQ+ID0ge1xuICAgIHNjaGVkdWxlcjogRnJhbWVTY2hlZHVsZXIsXG4gICAgbm93KCk6IG51bWJlcixcbiAgICBpbml0aWFsUm93czogbnVtYmVyLFxuICAgIHJvd3NQZXJSZXF1ZXN0OiBudW1iZXIsXG4gICAgbWF4Um93c1BlckZyYW1lOiBudW1iZXIsXG4gICAgZnJhbWVCdWRnZXRNczogbnVtYmVyLFxuICAgIGNyZWF0ZShpbnB1dDogSW5wdXQpOiBPdXRwdXQsXG4gICAgY29tbWl0KGJhdGNoOiByZWFkb25seSBPdXRwdXRbXSwgc3RhdGU6IFByb2dyZXNzaXZlQmF0Y2hTdGF0ZSk6IHZvaWQsXG4gICAgcGF1c2Uoc3RhdGU6IFByb2dyZXNzaXZlQmF0Y2hTdGF0ZSk6IHZvaWQsXG4gICAgY29tcGxldGUoc3RhdGU6IFByb2dyZXNzaXZlQmF0Y2hTdGF0ZSk6IHZvaWQsXG59O1xuXG5leHBvcnQgY2xhc3MgUHJvZ3Jlc3NpdmVCYXRjaFJlbmRlcmVyPElucHV0LCBPdXRwdXQ+IHtcbiAgICBwcml2YXRlIHZlcnNpb24gPSAwO1xuICAgIHByaXZhdGUgZnJhbWVIYW5kbGU6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGlucHV0czogcmVhZG9ubHkgSW5wdXRbXSA9IFtdO1xuICAgIHByaXZhdGUgcmVuZGVyZWQgPSAwO1xuICAgIHByaXZhdGUgcnVubmluZyA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBQcm9ncmVzc2l2ZUJhdGNoT3B0aW9uczxJbnB1dCwgT3V0cHV0Pikge31cblxuICAgIHN0YXJ0KGlucHV0czogcmVhZG9ubHkgSW5wdXRbXSk6IG51bWJlciB7XG4gICAgICAgIHRoaXMuY2FuY2VsRnJhbWUoKTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9ICsrdGhpcy52ZXJzaW9uO1xuICAgICAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICAgICAgdGhpcy5yZW5kZXJlZCA9IDA7XG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuY29tbWl0Um93cyhcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICBNYXRoLm1pbihpbnB1dHMubGVuZ3RoLCBNYXRoLm1heCgxLCB0aGlzLm9wdGlvbnMuaW5pdGlhbFJvd3MpKSxcbiAgICAgICAgICAgIE1hdGgubWF4KDEsIHRoaXMub3B0aW9ucy5pbml0aWFsUm93cyksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgIH1cblxuICAgIGNvbnRpbnVlKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nIHx8IHRoaXMucmVuZGVyZWQgPj0gdGhpcy5pbnB1dHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMudmVyc2lvbjtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gTWF0aC5taW4oXG4gICAgICAgICAgICB0aGlzLmlucHV0cy5sZW5ndGgsXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVkICsgTWF0aC5tYXgoMSwgdGhpcy5vcHRpb25zLnJvd3NQZXJSZXF1ZXN0KSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHRoaXMub3B0aW9ucy5zY2hlZHVsZXIucmVxdWVzdCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bkZyYW1lKHZlcnNpb24sIHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjYW5jZWwoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FuY2VsRnJhbWUoKTtcbiAgICAgICAgdGhpcy52ZXJzaW9uICs9IDE7XG4gICAgICAgIHRoaXMuaW5wdXRzID0gW107XG4gICAgICAgIHRoaXMucmVuZGVyZWQgPSAwO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJ1bkZyYW1lKHZlcnNpb246IG51bWJlciwgdGFyZ2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHZlcnNpb24gIT09IHRoaXMudmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29tbWl0Um93cyhcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4Um93c1BlckZyYW1lLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmZyYW1lQnVkZ2V0TXMsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb21taXRSb3dzKFxuICAgICAgICB2ZXJzaW9uOiBudW1iZXIsXG4gICAgICAgIHRhcmdldDogbnVtYmVyLFxuICAgICAgICBsaW1pdDogbnVtYmVyLFxuICAgICAgICBidWRnZXRNcz86IG51bWJlcixcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhcnRlZEF0ID0gdGhpcy5vcHRpb25zLm5vdygpO1xuICAgICAgICBjb25zdCBiYXRjaDogT3V0cHV0W10gPSBbXTtcbiAgICAgICAgd2hpbGUgKHRoaXMucmVuZGVyZWQgPCB0YXJnZXQgJiYgYmF0Y2gubGVuZ3RoIDwgbGltaXQpIHtcbiAgICAgICAgICAgIGJhdGNoLnB1c2godGhpcy5vcHRpb25zLmNyZWF0ZSh0aGlzLmlucHV0c1t0aGlzLnJlbmRlcmVkXSkpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlZCArPSAxO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGJ1ZGdldE1zICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMubm93KCkgLSBzdGFydGVkQXQgPj0gYnVkZ2V0TXNcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZlcnNpb24gIT09IHRoaXMudmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXRlOiBQcm9ncmVzc2l2ZUJhdGNoU3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJzaW9uLFxuICAgICAgICAgICAgcmVuZGVyZWQ6IHRoaXMucmVuZGVyZWQsXG4gICAgICAgICAgICB0b3RhbDogdGhpcy5pbnB1dHMubGVuZ3RoLFxuICAgICAgICAgICAgY29tcGxldGU6IHRoaXMucmVuZGVyZWQgPT09IHRoaXMuaW5wdXRzLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vcHRpb25zLmNvbW1pdChiYXRjaCwgc3RhdGUpO1xuICAgICAgICBpZiAodmVyc2lvbiAhPT0gdGhpcy52ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb21wbGV0ZShzdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVuZGVyZWQgPj0gdGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYXVzZShzdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHRoaXMub3B0aW9ucy5zY2hlZHVsZXIucmVxdWVzdCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bkZyYW1lKHZlcnNpb24sIHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsRnJhbWUoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lSGFuZGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnMuc2NoZWR1bGVyLmNhbmNlbCh0aGlzLmZyYW1lSGFuZGxlKTtcbiAgICAgICAgdGhpcy5mcmFtZUhhbmRsZSA9IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBicm93c2VyRnJhbWVTY2hlZHVsZXI6IEZyYW1lU2NoZWR1bGVyID0ge1xuICAgIHJlcXVlc3QoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk7XG4gICAgfSxcbiAgICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGhhbmRsZSk7XG4gICAgfSxcbn07XG4iLCIvKipcbiAqIFJlc29sdmUgd2hpY2ggYm9zcyBndWFyZGlhbihzKSBhcHBlYXIgb24gYSBHdWFyZGlhbiAvIEJvc3Mgc3RhZ2UuXG4gKiBEYXRhIGNvbWVzIGZyb20gSkZUU0UgR3VhcmRpYW5TdGFnZXMuanNvbiAoQm9zc0d1YXJkaWFuICsgc2lkZSBwb29scylcbiAqIGFuZCBCb3NzR3VhcmRpYW5JbmZvX0luaTMueG1sIC8gR3VhcmRpYW5JbmZvLnhtbCBuYW1lcy5cbiAqL1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NJbmZvID0ge1xuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHJlc0lkPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGxldmVsPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGhwQmFzZT86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlR3VhcmRpYW5JbmZvID0ge1xuICAgIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzU2lkZVBvb2xzID0ge1xuICAgIHJlYWRvbmx5IGxlZnQ6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIHJlYWRvbmx5IG1pZGRsZTogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgcmVhZG9ubHkgcmlnaHQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzU3RhZ2VFbnRyeSA9IHtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbWFwSWQ/OiBudW1iZXIgfCBudWxsO1xuICAgIHJlYWRvbmx5IGlzQm9zc1N0YWdlOiBib29sZWFuO1xuICAgIHJlYWRvbmx5IGJvc3NJZHM6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIHJlYWRvbmx5IHNpZGVHdWFyZGlhbklkcz86IFN0YWdlQm9zc1NpZGVQb29scztcbiAgICByZWFkb25seSBleHBNdWx0aXBsaWVyPzogbnVtYmVyIHwgbnVsbDtcbiAgICByZWFkb25seSBib3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzPzogbnVtYmVyIHwgbnVsbDtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc0NhdGFsb2cgPSB7XG4gICAgcmVhZG9ubHkgYm9zc2VzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgU3RhZ2VCb3NzSW5mbz4+O1xuICAgIHJlYWRvbmx5IGd1YXJkaWFucz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFN0YWdlR3VhcmRpYW5JbmZvPj47XG4gICAgcmVhZG9ubHkgc3RhZ2VzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgU3RhZ2VCb3NzU3RhZ2VFbnRyeT4+O1xuICAgIHJlYWRvbmx5IGJ5TWFwSWQ/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCByZWFkb25seSBzdHJpbmdbXT4+O1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzUHJvamVjdGlvbiA9IHtcbiAgICByZWFkb25seSBzdGFnZU5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSBtYXBJZD86IG51bWJlcjtcbiAgICByZWFkb25seSBpc0Jvc3NTdGFnZTogYm9vbGVhbjtcbiAgICAvKiogUHJpbWFyeSBib3NzIGd1YXJkaWFucyBmb3IgdGhpcyBzdGFnZSAodW5pcXVlIGJ5IGlkKS4gKi9cbiAgICByZWFkb25seSBib3NzZXM6IHJlYWRvbmx5IFN0YWdlQm9zc0luZm9bXTtcbiAgICAvKiogVW5pcXVlIGJvc3MgZGlzcGxheSBuYW1lcyAoZGVkdXBlZCwgb3JkZXItcHJlc2VydmluZykuICovXG4gICAgcmVhZG9ubHkgYm9zc05hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbiAgICAvKiogU2lkZS1sYW5lIGd1YXJkaWFuIG5hbWVzIHRoYXQgc3Bhd24gd2l0aCB0aGUgYm9zcyBiYXR0bGUgKGxlZnQvcmlnaHQvbWlkZGxlKS4gKi9cbiAgICByZWFkb25seSBzaWRlR3VhcmRpYW5OYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG59O1xuXG5mdW5jdGlvbiB1bmlxdWVOYW1lcyhuYW1lczogcmVhZG9ubHkgc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IG91dDogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gbmFtZS50cmltKCk7XG4gICAgICAgIGlmICgha2V5IHx8IHNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW4uYWRkKGtleSk7XG4gICAgICAgIG91dC5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVCb3NzKGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csIGlkOiBudW1iZXIpOiBTdGFnZUJvc3NJbmZvIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IGNhdGFsb2cuYm9zc2VzPy5bYCR7aWR9YF07XG4gICAgaWYgKGVudHJ5ICYmIHR5cGVvZiBlbnRyeS5uYW1lID09PSBcInN0cmluZ1wiICYmIGVudHJ5Lm5hbWUudHJpbSgpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogZW50cnkuaWQgPz8gaWQsXG4gICAgICAgICAgICBuYW1lOiBlbnRyeS5uYW1lLnRyaW0oKSxcbiAgICAgICAgICAgIHJlc0lkOiBlbnRyeS5yZXNJZCxcbiAgICAgICAgICAgIGxldmVsOiBlbnRyeS5sZXZlbCxcbiAgICAgICAgICAgIGhwQmFzZTogZW50cnkuaHBCYXNlLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlR3VhcmRpYW5OYW1lKGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csIGlkOiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGVudHJ5ID0gY2F0YWxvZy5ndWFyZGlhbnM/LltgJHtpZH1gXTtcbiAgICBjb25zdCBuYW1lID0gZW50cnk/Lm5hbWU/LnRyaW0oKTtcbiAgICByZXR1cm4gbmFtZSB8fCB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHNpZGVJZHMocG9vbHM6IFN0YWdlQm9zc1NpZGVQb29scyB8IHVuZGVmaW5lZCk6IG51bWJlcltdIHtcbiAgICBpZiAoIXBvb2xzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIFsuLi4ocG9vbHMubGVmdCA/PyBbXSksIC4uLihwb29scy5taWRkbGUgPz8gW10pLCAuLi4ocG9vbHMucmlnaHQgPz8gW10pXTtcbn1cblxuLyoqXG4gKiBDYW5kaWRhdGUgc3RhZ2Uga2V5cyBmb3IgYSBjaGlwIGxhYmVsIG1hcCBuYW1lLlxuICogQm9zcyDCtyBBdGxhbnRpcyB1c2VzIGBBdGxhbnRpc0Jvc3NgOyBzb21lIGRyb3BzIHVzZSBiYXJlIG1hcCBuYW1lcyB3aXRoIG5lZWRCb3NzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2VCb3NzTG9va3VwS2V5cyhtYXBOYW1lOiBzdHJpbmcsIG5lZWRCb3NzOiBib29sZWFuKTogcmVhZG9ubHkgc3RyaW5nW10ge1xuICAgIGNvbnN0IGtleXMgPSBbbWFwTmFtZV07XG4gICAgaWYgKG5lZWRCb3NzICYmICEvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChgJHttYXBOYW1lfUJvc3NgKTtcbiAgICB9XG4gICAgaWYgKCFuZWVkQm9zcyAmJiAvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChtYXBOYW1lLnJlcGxhY2UoL0Jvc3MkL2ksIFwiXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIGVudHJ5SGFzQm9zc2VzKGVudHJ5OiBTdGFnZUJvc3NTdGFnZUVudHJ5IHwgdW5kZWZpbmVkKTogZW50cnkgaXMgU3RhZ2VCb3NzU3RhZ2VFbnRyeSB7XG4gICAgcmV0dXJuICEhZW50cnkgJiYgQXJyYXkuaXNBcnJheShlbnRyeS5ib3NzSWRzKSAmJiBlbnRyeS5ib3NzSWRzLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU3RhZ2VCb3NzRW50cnkoXG4gICAgbWFwTmFtZTogc3RyaW5nLFxuICAgIG5lZWRCb3NzOiBib29sZWFuLFxuICAgIGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csXG4pOiBTdGFnZUJvc3NTdGFnZUVudHJ5IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBzdGFnZXMgPSBjYXRhbG9nLnN0YWdlcztcbiAgICBpZiAoIXN0YWdlcykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBrZXlzID0gc3RhZ2VCb3NzTG9va3VwS2V5cyhtYXBOYW1lLCBuZWVkQm9zcyk7XG4gICAgLy8gUHJlZmVyIGFuIGVudHJ5IHRoYXQgYWN0dWFsbHkgbGlzdHMgQm9zc0d1YXJkaWFuIGlkcyAoZS5nLiBBdGxhbnRpc0Jvc3Mgb3ZlciBBdGxhbnRpcykuXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBjb25zdCBlbnRyeSA9IHN0YWdlc1trZXldO1xuICAgICAgICBpZiAoZW50cnlIYXNCb3NzZXMoZW50cnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZW50cnk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTWFwSWQgYnJpZGdlOiBiYXJlIG1hcCBuYW1lcyBzaGFyZSBNYXBJZCB3aXRoIHRoZSBib3NzLXN0YWdlIHNpYmxpbmcuXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBjb25zdCBzZWVkID0gc3RhZ2VzW2tleV07XG4gICAgICAgIGlmIChzZWVkPy5tYXBJZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaWJsaW5ncyA9IGNhdGFsb2cuYnlNYXBJZD8uW2Ake3NlZWQubWFwSWR9YF0gPz8gW107XG4gICAgICAgIGZvciAoY29uc3Qgc2libGluZ05hbWUgb2Ygc2libGluZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSBzdGFnZXNbc2libGluZ05hbWVdO1xuICAgICAgICAgICAgaWYgKGVudHJ5SGFzQm9zc2VzKHNpYmxpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpYmxpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTGFzdCByZXNvcnQ6IGFueSBtYXRjaGluZyBzdGFnZSByb3cgKG5vbi1ib3NzIFRlbXBsZSwgZXRjLikuXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICBpZiAoc3RhZ2VzW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFnZXNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFByb2plY3QgdGhlIGJvc3MoZXMpIGFuZCBzaWRlIGd1YXJkaWFucyBmb3IgYSBzdGFnZSBjaGlwLlxuICogU3VwcG9ydHMgbXVsdGktYm9zcyBzdGFnZXMgdmlhIGJvc3NJZHNbXSAoSkZUU0UgY3VycmVudGx5IHNoaXBzIG9uZSBCb3NzR3VhcmRpYW4gcGVyIHN0YWdlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RTdGFnZUJvc3NlcyhcbiAgICBtYXBOYW1lOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZyxcbik6IFN0YWdlQm9zc1Byb2plY3Rpb24ge1xuICAgIGNvbnN0IGVudHJ5ID0gZmluZFN0YWdlQm9zc0VudHJ5KG1hcE5hbWUsIG5lZWRCb3NzLCBjYXRhbG9nKTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFnZU5hbWU6IG1hcE5hbWUsXG4gICAgICAgICAgICBpc0Jvc3NTdGFnZTogbmVlZEJvc3MsXG4gICAgICAgICAgICBib3NzZXM6IFtdLFxuICAgICAgICAgICAgYm9zc05hbWVzOiBbXSxcbiAgICAgICAgICAgIHNpZGVHdWFyZGlhbk5hbWVzOiBbXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBib3NzZXM6IFN0YWdlQm9zc0luZm9bXSA9IFtdO1xuICAgIGNvbnN0IHNlZW5Cb3NzSWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gICAgZm9yIChjb25zdCBpZCBvZiBlbnRyeS5ib3NzSWRzID8/IFtdKSB7XG4gICAgICAgIGlmIChzZWVuQm9zc0lkcy5oYXMoaWQpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuQm9zc0lkcy5hZGQoaWQpO1xuICAgICAgICBjb25zdCBib3NzID0gcmVzb2x2ZUJvc3MoY2F0YWxvZywgaWQpO1xuICAgICAgICBpZiAoYm9zcykge1xuICAgICAgICAgICAgYm9zc2VzLnB1c2goYm9zcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzaWRlR3VhcmRpYW5OYW1lcyA9IHVuaXF1ZU5hbWVzKFxuICAgICAgICBzaWRlSWRzKGVudHJ5LnNpZGVHdWFyZGlhbklkcylcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiByZXNvbHZlR3VhcmRpYW5OYW1lKGNhdGFsb2csIGlkKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKG4pOiBuIGlzIHN0cmluZyA9PiB0eXBlb2YgbiA9PT0gXCJzdHJpbmdcIiksXG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YWdlTmFtZTogZW50cnkubmFtZSxcbiAgICAgICAgbWFwSWQ6IHR5cGVvZiBlbnRyeS5tYXBJZCA9PT0gXCJudW1iZXJcIiA/IGVudHJ5Lm1hcElkIDogdW5kZWZpbmVkLFxuICAgICAgICBpc0Jvc3NTdGFnZTogISFlbnRyeS5pc0Jvc3NTdGFnZSxcbiAgICAgICAgYm9zc2VzLFxuICAgICAgICBib3NzTmFtZXM6IHVuaXF1ZU5hbWVzKGJvc3Nlcy5tYXAoKGIpID0+IGIubmFtZSkpLFxuICAgICAgICBzaWRlR3VhcmRpYW5OYW1lcyxcbiAgICB9O1xufVxuIiwiZXhwb3J0IHR5cGUgVmFyaWFibGVfc3RvcmFnZV90eXBlcyA9IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW47XG5cbnR5cGUgU3RvcmFnZV92YWx1ZSA9IGAke1wic1wiIHwgXCJuXCIgfCBcImJcIn0ke3N0cmluZ31gO1xuXG5mdW5jdGlvbiB2YXJpYWJsZV90b19zdHJpbmcodmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpOiBTdG9yYWdlX3ZhbHVlIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gYHMke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBgbiR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IFwiYjFcIiA6IFwiYjBcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN0cmluZ190b192YXJpYWJsZSh2djogU3RvcmFnZV92YWx1ZSk6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMge1xuICAgIGNvbnN0IHByZWZpeCA9IHZ2WzBdO1xuICAgIGNvbnN0IHZhbHVlID0gdnYuc3Vic3RyaW5nKDEpO1xuICAgIHN3aXRjaCAocHJlZml4KSB7XG4gICAgICAgIGNhc2UgJ3MnOiAvL3N0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICBjYXNlICduJzogLy9udW1iZXJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgY2FzZSAnYic6IC8vYm9vbGVhblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSBcIjFcIiA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gICAgdGhyb3cgYGludmFsaWQgdmFsdWU6ICR7dnZ9YDtcbn1cblxuZnVuY3Rpb24gaXNfc3RvcmFnZV92YWx1ZShrZXk6IHN0cmluZyk6IGtleSBpcyBTdG9yYWdlX3ZhbHVlIHtcbiAgICByZXR1cm4ga2V5Lmxlbmd0aCA+PSAxICYmIFwic25iXCIuaW5jbHVkZXMoa2V5WzBdKTtcbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlX3N0b3JhZ2Uge1xuICAgIHN0YXRpYyBnZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RvcmVkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHN0b3JlZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nX3RvX3ZhcmlhYmxlKHN0b3JlZCk7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nLCB2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcykge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWAsIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZSkpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVsZXRlX3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgIH1cbiAgICBzdGF0aWMgY2xlYXJfYWxsKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9XG4gICAgc3RhdGljIGdldCB2YXJpYWJsZXMoKSB7XG4gICAgICAgIGxldCByZXN1bHQ6IHsgW2tleTogc3RyaW5nXTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxTdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc3RyaW5nX3RvX3ZhcmlhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0iXX0=
