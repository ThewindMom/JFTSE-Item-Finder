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
function createPriorityStatHeaderCell(stat) {
  const {
    short,
    full,
    abbreviated
  } = (0, _priorityStatHeaders.priorityStatHeaderDisplay)(stat);
  if (!abbreviated) {
    return (0, _html.createHTML)(["th", {
      class: "numeric",
      scope: "col"
    }, short]);
  }
  const popup = createPopupLink(short, (0, _html.createHTML)(["p", full]));
  popup.setAttribute("title", full);
  popup.setAttribute("aria-label", full);
  popup.classList.add("priority-stat-header");
  return (0, _html.createHTML)(["th", {
    class: "numeric",
    scope: "col"
  }, popup]);
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
  return createPopupLink(itemSource.item.name_en, createGachaDetailsTable(gacha, item, character));
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
function getResultsTable(filter, sourceFilter, priorizer, priorityStats, character) {
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
  const table = (0, _html.createHTML)(["table", ["caption", "Matching equipment by slot and selected stat priority"], ["thead", ["tr", ["th", {
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
  }, "Part"], ...priorityStats.map(stat => createPriorityStatHeaderCell(stat)), ["th", {
    class: "Level_column numeric",
    scope: "col"
  }, "Level"], ["th", {
    class: "Source_column",
    scope: "col"
  }, "Source"]]], ["tbody"]]);
  const tableBody = table.tBodies[0];
  if (!tableBody) {
    throw "Internal error";
  }
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
    for (const item of result) {
      for (const char of item.character ? [item.character] : characters) {
        statistics.characters.add(char);
        tableBody.appendChild(itemToTableRow(item, sourceFilter, priorityStats, char));
      }
    }
    // Footer cost must match stats/level: best candidate per slot only.
    // The body still renders the full ranked list above.
    statistics.cost = combineCosts(costOf(result[0], character && isCharacter(character) ? character : undefined), statistics.cost);
  }
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
    for (const column_element of table.getElementsByClassName(`Character_column`)) {
      if (!(column_element instanceof HTMLElement)) {
        continue;
      }
      column_element.hidden = true;
    }
  }
  for (const attribute of priorityStats) {
    if (priorityStatistics[attribute] === 0) {
      for (const column_element of table.getElementsByClassName(`${attribute}_column`)) {
        if (!(column_element instanceof HTMLElement)) {
          continue;
        }
        column_element.hidden = true;
      }
    }
  }
  return table;
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

},{"./gachaAcquisition":2,"./html":3,"./priorityStatHeaders":7,"./stageBosses":8}],5:[function(require,module,exports){
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
    hint.textContent = `${label} first within each slot`;
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
function updateResults() {
  saveSelection();
  // While first-load lab prep is active, keep friendly loading copy — do not paint
  // an empty inventory ("No items match…") over the animated loader.
  if (document.getElementById("results_group")?.getAttribute("aria-busy") === "true") {
    return;
  }
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
  const table = (() => {
    switch (getItemTypeSelection()) {
      case 'partsSelector':
        return (0, _itemLookup.getResultsTable)(item => filters.every(filter => filter(item)), itemSource => sourceFilters.every(filter => filter(itemSource)), (items, item) => (0, _priority.selectByPriority)(items, item, comparators), priorityStats, selectedCharacter);
      case 'gachaSelector':
        return (0, _itemLookup.getGachaTable)(item => filters.every(filter => filter(item)), selectedCharacter);
    }
  })();
  const target = document.getElementById("results");
  if (!target) {
    return;
  }
  const resultRows = table.tBodies[0]?.rows.length ?? Math.max(0, table.rows.length - 1);
  target.innerText = "";
  if (resultRows === 0) {
    target.appendChild((0, _html.createHTML)(["p", {
      class: "results-empty",
      role: "status"
    }, "No items match these filters."]));
  } else {
    target.appendChild(table);
  }
  const resultsStatus = document.getElementById("resultsStatus");
  if (resultsStatus) {
    resultsStatus.textContent = resultRows === 0 ? "No items match these filters." : `${resultRows} matching ${resultRows === 1 ? "item" : "items"}`;
  }
  syncResultsTableScroll();
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
  updateResults();
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

},{"./checkboxTree":1,"./html":3,"./itemLookup":4,"./priority":6,"./storage":9}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

},{}],9:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJnYWNoYUFjcXVpc2l0aW9uLnRzIiwiaHRtbC50cyIsIml0ZW1Mb29rdXAudHMiLCJtYWluLnRzIiwicHJpb3JpdHkudHMiLCJwcmlvcml0eVN0YXRIZWFkZXJzLnRzIiwic3RhZ2VCb3NzZXMudHMiLCJzdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFBLEtBQUEsR0FBQSxPQUFBO0FBSUEsU0FBUyxXQUFXLENBQUMsSUFBc0I7RUFDdkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWE7RUFDcEMsSUFBSSxFQUFFLFNBQVMsWUFBWSxhQUFhLENBQUMsRUFBRTtJQUN2QyxPQUFPLEVBQUU7RUFDYjtFQUNBLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhO0VBQ3pDLElBQUksRUFBRSxTQUFTLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUMxQyxPQUFPLEVBQUU7RUFDYjtFQUNBLEtBQUssSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtJQUMzRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxFQUFFO01BQzlDO0lBQ0o7SUFDQSxNQUFNLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBSSxFQUFFLHFCQUFxQixZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDdEQ7SUFDSjtJQUNBLE9BQU8sS0FBSyxDQUNQLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FDcEMsTUFBTSxDQUFFLENBQUMsSUFBeUIsQ0FBQyxZQUFZLGFBQWEsSUFBSSxDQUFDLENB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QUNBLE9BQU8sTUFBTTtFQUNqQjs7QUFDSCxPQUFBLENBQUEsZ0JBQUEsR0FBQSxnQkFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgdHlwZSBUcmVlTm9kZSA9IHN0cmluZyB8IFRyZWVOb2RlW107XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50W10ge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgZm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBwYXJlbnRfdWwuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcbiAgICAgICAgaWYgKHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4XSAhPT0gcGFyZW50X2xpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3RlbnRpYWxTaWJsaW5nRW50cnkgPSBwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleCArIDFdPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocG90ZW50aWFsU2libGluZ0VudHJ5IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheVxuICAgICAgICAgICAgLmZyb20ocG90ZW50aWFsU2libGluZ0VudHJ5LmNoaWxkcmVuKVxuICAgICAgICAgICAgLmZpbHRlcigoZSk6IGUgaXMgSFRNTExJRWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudClcbiAgICAgICAgICAgIC5tYXAoZSA9PiBlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4obm9kZSkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQgIT09IG5vZGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hpbGQuY2hlY2tlZCA9IG5vZGUuY2hlY2tlZDtcbiAgICAgICAgICAgIGNoaWxkLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnQobm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnQgfCB2b2lkIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYW5kaWRhdGU6IEhUTUxMSUVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBwYXJlbnRfdWwuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBjaGlsZC5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZSA9IGNoaWxkO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkID09PSBwYXJlbnRfbGkgJiYgY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFuY2VzdG9ycyhub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgY29uc3QgcGFyZW50ID0gZ2V0UGFyZW50KG5vZGUpO1xuICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGZvdW5kQ2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZFVuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZEluZGV0ZXJtaW5hdGUgPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4ocGFyZW50KSkge1xuICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCkge1xuICAgICAgICAgICAgZm91bmRDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvdW5kVW5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGQuaW5kZXRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgZm91bmRJbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJbmRldGVybWluYXRlIHx8IGZvdW5kQ2hlY2tlZCAmJiBmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kQ2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kVW5jaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIHVwZGF0ZUFuY2VzdG9ycyhwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrTGlzdGVuZXIobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyh0YXJnZXQpO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnModGFyZ2V0KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVycyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBhcHBseUNoZWNrTGlzdGVuZXIoZWxlbWVudC5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVycyhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZU5vZGUodHJlZU5vZGU6IFRyZWVOb2RlKTogSFRNTExJRWxlbWVudCB7XG4gICAgaWYgKHR5cGVvZiB0cmVlTm9kZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIi1cIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIitcIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBjaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cmVlTm9kZS5yZXBsYWNlQWxsKFwiIFwiLCBcIl9cIiksXG4gICAgICAgICAgICAgICAgICAgIC4uLihjaGVja2VkICYmIHsgY2hlY2tlZDogXCJjaGVja2VkXCIgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwibGFiZWxcIixcbiAgICAgICAgICAgICAgICB7IGZvcjogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpIH0sXG4gICAgICAgICAgICAgICAgdHJlZU5vZGVcbiAgICAgICAgICAgIF1cbiAgICAgICAgXSk7XG4gICAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsaXN0ID0gY3JlYXRlSFRNTChbXCJ1bFwiLCB7IGNsYXNzOiBcImNoZWNrYm94XCIgfV0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVOb2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdHJlZU5vZGVbaV07XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKG1ha2VDaGVja2JveFRyZWVOb2RlKG5vZGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJsaVwiLCBsaXN0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZSh0cmVlTm9kZTogVHJlZU5vZGUpIHtcbiAgICBsZXQgcm9vdCA9IG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlKS5jaGlsZHJlblswXTtcbiAgICBpZiAoIShyb290IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBhcHBseUNoZWNrTGlzdGVuZXJzKHJvb3QpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMocm9vdCkpIHtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKGxlYWYpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gZ2V0TGVhdmVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBsZXQgcmVzdWx0OiBIVE1MSW5wdXRFbGVtZW50W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChnZXRDaGlsZHJlbihpbnB1dCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChnZXRMZWF2ZXMoaW5wdXQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV0gPSBsZWFmLmNoZWNrZWQ7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRMZWFmU3RhdGVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQsIHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0pIHtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RhdGVzW2xlYWYuaWQucmVwbGFjZUFsbChcIl9cIiwgXCIgXCIpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGVhZi5jaGVja2VkID0gc3RhdGU7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFB1cmUgcHJvamVjdGlvbiBvZiBob3cgYSBnYWNoYSBjb2luIGNhbiBiZSBhY3F1aXJlZC5cbiAqIFNob3AgZGVub21pbmF0aW9uIChHb2xkL0FQKSBpcyBzZXBhcmF0ZSBmcm9tIEd1YXJkaWFuL0Jvc3Mgc3RhZ2UgZHJvcHMuXG4gKi9cblxuZXhwb3J0IHR5cGUgR2FjaGFTaG9wQ2hhbm5lbCA9IHtcbiAgICByZWFkb25seSBraW5kOiBcInNob3BcIjtcbiAgICByZWFkb25seSBjdXJyZW5jeTogXCJHb2xkXCIgfCBcIkFQXCI7XG4gICAgcmVhZG9ubHkgYXZhaWxhYmxlOiBib29sZWFuO1xuICAgIC8qKiBXaHkgc2hvcCBpcyB1bmF2YWlsYWJsZSB3aGVuIGF2YWlsYWJsZT1mYWxzZS4gKi9cbiAgICByZWFkb25seSByZWFzb24/OiBcIm5vdF9mb3Jfc2FsZVwiIHwgXCJub3RfYXZhaWxhYmxlXCI7XG59O1xuXG5leHBvcnQgdHlwZSBHYWNoYVN0YWdlQ2hhbm5lbCA9IHtcbiAgICByZWFkb25seSBraW5kOiBcInN0YWdlXCI7XG4gICAgcmVhZG9ubHkgbWFwOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbmVlZEJvc3M6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgbGFiZWw6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEdhY2hhQWNxdWlzaXRpb25DaGFubmVsID0gR2FjaGFTaG9wQ2hhbm5lbCB8IEdhY2hhU3RhZ2VDaGFubmVsO1xuXG5leHBvcnQgdHlwZSBHYWNoYUFjcXVpc2l0aW9uSW5wdXQgPSB7XG4gICAgcmVhZG9ubHkgYXA6IGJvb2xlYW47XG4gICAgLyoqIFByb2R1Y3QgaXMgbGlzdGVkIGluIHRoZSBsaXZlIHNob3AgY2F0YWxvZyAoZW5hYmxlZCkuICovXG4gICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBUcnVlIG9ubHkgd2hlbiB0aGUgcHJvZHVjdCBjYW4gYWN0dWFsbHkgYmUgcHVyY2hhc2VkLlxuICAgICAqIEpGVFNFIGBOb2J1eT0xYCBwcm9kdWN0cyBzdGF5IGVuYWJsZWQgaW4gY2F0YWxvZyBidXQgcmVqZWN0IHNob3AgYnV5cy5cbiAgICAgKi9cbiAgICByZWFkb25seSBwdXJjaGFzYWJsZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEdhY2hhU291cmNlSW5wdXQgPVxuICAgIHwgeyByZWFkb25seSBraW5kOiBcInNob3BcIjsgcmVhZG9ubHkgYXA6IGJvb2xlYW4gfVxuICAgIHwgeyByZWFkb25seSBraW5kOiBcInN0YWdlXCI7IHJlYWRvbmx5IG1hcDogc3RyaW5nOyByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbiB9O1xuXG4vKiogU3BsaXQgQ2FtZWxDYXNlIHN0YWdlIGlkcyBmcm9tIEpGVFNFIEd1YXJkaWFuU3RhZ2VzLmpzb24gaW50byByZWFkYWJsZSBsYWJlbHMuICovXG5leHBvcnQgZnVuY3Rpb24gcHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbWFwXG4gICAgICAgIC5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCBcIiQxICQyXCIpXG4gICAgICAgIC5yZXBsYWNlKC8oW0EtWl0rKShbQS1aXVthLXpdKS9nLCBcIiQxICQyXCIpXG4gICAgICAgIC50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZUNoYW5uZWxMYWJlbChtYXA6IHN0cmluZywgbmVlZEJvc3M6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGNvbnN0IHByZXR0eSA9IHByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXApO1xuICAgIGlmICghbmVlZEJvc3MpIHtcbiAgICAgICAgcmV0dXJuIHByZXR0eTtcbiAgICB9XG4gICAgLy8gQXZvaWQgXCJCb3NzIMK3IEF0bGFudGlzIEJvc3NcIiDigJQgc3RhZ2UgaWRzIGVuZCBpbiBCb3NzIGFscmVhZHkuXG4gICAgY29uc3Qgd2l0aG91dEJvc3NTdWZmaXggPSBwcmV0dHkucmVwbGFjZSgvXFxzK0Jvc3MkL2ksIFwiXCIpO1xuICAgIHJldHVybiBgQm9zcyDCtyAke3dpdGhvdXRCb3NzU3VmZml4fWA7XG59XG5cbi8qKiBTdHJpcCB0cmFpbGluZyBCb3NzIHNvIHRpdGxlcyByZWFkIFwiQXRsYW50aXNcIiwgbm90IFwiQXRsYW50aXMgQm9zc1wiLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YWdlVGl0bGVOYW1lKG1hcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCkucmVwbGFjZSgvXFxzK0Jvc3MkL2ksIFwiXCIpLnRyaW0oKTtcbn1cblxuZXhwb3J0IHR5cGUgTWFwQXJ0RmlsZSA9IHtcbiAgICByZWFkb25seSBmaWxlOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgd2lkdGg/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgaGVpZ2h0PzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGtpbmQ/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBNYXBBcnRDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IGZpbGVzOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBNYXBBcnRGaWxlPj47XG4gICAgcmVhZG9ubHkgYnlOYW1lOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PjtcbiAgICByZWFkb25seSBieU1hcElkPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG59O1xuXG4vKiogQ2FuZGlkYXRlIHN0YWdlIGtleXMgZm9yIG1hcCBhcnQgKEJvc3Mgc3VmZml4ICsgYmFyZSBtYXAgbmFtZSkuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwQXJ0TG9va3VwS2V5cyhtYXBOYW1lOiBzdHJpbmcsIG5lZWRCb3NzID0gZmFsc2UpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgY29uc3Qga2V5cyA9IFttYXBOYW1lXTtcbiAgICBpZiAobmVlZEJvc3MgJiYgIS9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKGAke21hcE5hbWV9Qm9zc2ApO1xuICAgIH1cbiAgICBpZiAoL0Jvc3MkL2kudGVzdChtYXBOYW1lKSkge1xuICAgICAgICBrZXlzLnB1c2gobWFwTmFtZS5yZXBsYWNlKC9Cb3NzJC9pLCBcIlwiKSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYXV0aGVudGljIGNsaWVudCBtYXAgYXJ0IGZvciBhIEd1YXJkaWFuU3RhZ2VzIG1hcCBuYW1lLlxuICogUHJlZmVycyBVSSBtYXAtc2VsZWN0IHRodW1iczsgZmFsbHMgYmFjayB0byBzdGFnZS1lbnZpcm9ubWVudCB0ZXh0dXJlcyB3aGVuIGNhdGFsb2d1ZWQuXG4gKiBOZXZlciBpbnZlbnRzIGFydCDigJQgb25seSByZXR1cm5zIGFuIGV4cGxpY2l0IGNhdGFsb2cgbWFwcGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVNYXBBcnRGaWxlKFxuICAgIG1hcE5hbWU6IHN0cmluZyxcbiAgICBjYXRhbG9nOiBNYXBBcnRDYXRhbG9nLFxuICAgIG9wdGlvbnM/OiB7IHJlYWRvbmx5IG5lZWRCb3NzPzogYm9vbGVhbjsgcmVhZG9ubHkgbWFwSWQ/OiBudW1iZXIgfSxcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG1hcEFydExvb2t1cEtleXMobWFwTmFtZSwgb3B0aW9ucz8ubmVlZEJvc3MgPz8gZmFsc2UpKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGNhdGFsb2cuYnlOYW1lW25hbWVdO1xuICAgICAgICBpZiAoa2V5ICYmIGNhdGFsb2cuZmlsZXNba2V5XT8uZmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhdGFsb2cuZmlsZXNba2V5XS5maWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ubWFwSWQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gY2F0YWxvZy5ieU1hcElkPy5bYCR7b3B0aW9ucy5tYXBJZH1gXTtcbiAgICAgICAgaWYgKGtleSAmJiBjYXRhbG9nLmZpbGVzW2tleV0/LmZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYXRhbG9nLmZpbGVzW2tleV0uZmlsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFByb2plY3Qgc2hvcCArIHN0YWdlIGFjcXVpc2l0aW9uIGNoYW5uZWxzIGZvciBhIGdhY2hhIGNvaW4uXG4gKlxuICogLSBQdXJjaGFzYWJsZSBzaG9wIOKGkiBHb2xkL0FQIHBpbGwuXG4gKiAtIENhdGFsb2ctbGlzdGVkIGJ1dCBOb2J1eSAoYHB1cmNoYXNhYmxlPWZhbHNlYCwgYGVuYWJsZWQ9dHJ1ZWApIOKGkiBOb3QgZm9yIHNhbGVcbiAqICAgKHN0aWxsIHNob3duIHdoZW4gc3RhZ2VzIGV4aXN0IHNvIHBsYXllcnMgZG8gbm90IGFzc3VtZSBhIHByaWNlKS5cbiAqIC0gRnVsbHkgZGlzYWJsZWQgc2hvcCB3aXRoIG5vIHN0YWdlcyDihpIgTm90IGF2YWlsYWJsZS5cbiAqIC0gRGlzYWJsZWQgc2hvcCB3aXRoIHN0YWdlcyDihpIgc3RhZ2VzIG9ubHkgKG9taXQgc2hvcCBjaHJvbWUpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhQWNxdWlzaXRpb25DaGFubmVscyhcbiAgICBnYWNoYTogR2FjaGFBY3F1aXNpdGlvbklucHV0LFxuICAgIHNvdXJjZXM6IHJlYWRvbmx5IEdhY2hhU291cmNlSW5wdXRbXSxcbik6IHJlYWRvbmx5IEdhY2hhQWNxdWlzaXRpb25DaGFubmVsW10ge1xuICAgIGNvbnN0IGNoYW5uZWxzOiBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbFtdID0gW107XG4gICAgY29uc3Qgc3RhZ2VTb3VyY2VzID0gc291cmNlcy5maWx0ZXIoXG4gICAgICAgIChzb3VyY2UpOiBzb3VyY2UgaXMgRXh0cmFjdDxHYWNoYVNvdXJjZUlucHV0LCB7IGtpbmQ6IFwic3RhZ2VcIiB9PiA9PlxuICAgICAgICAgICAgc291cmNlLmtpbmQgPT09IFwic3RhZ2VcIixcbiAgICApO1xuICAgIGNvbnN0IGhhc1N0YWdlID0gc3RhZ2VTb3VyY2VzLmxlbmd0aCA+IDA7XG4gICAgY29uc3QgY3VycmVuY3kgPSBnYWNoYS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiO1xuXG4gICAgaWYgKGdhY2hhLnB1cmNoYXNhYmxlKSB7XG4gICAgICAgIGNoYW5uZWxzLnB1c2goe1xuICAgICAgICAgICAga2luZDogXCJzaG9wXCIsXG4gICAgICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChnYWNoYS5lbmFibGVkKSB7XG4gICAgICAgIC8vIExpc3RlZCBpbiBzaG9wIFVJIC8gQVBJIGJ1dCBibG9ja2VkIGJ5IE5vYnV5IOKAlCBuZXZlciBpbXBseSBhIGJ1eSBwYXRoLlxuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVhc29uOiBcIm5vdF9mb3Jfc2FsZVwiLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFoYXNTdGFnZSkge1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVhc29uOiBcIm5vdF9hdmFpbGFibGVcIixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2Vlbk1hcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IHN0YWdlIG9mIHN0YWdlU291cmNlcykge1xuICAgICAgICBpZiAoc2Vlbk1hcHMuaGFzKHN0YWdlLm1hcCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW5NYXBzLmFkZChzdGFnZS5tYXApO1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic3RhZ2VcIixcbiAgICAgICAgICAgIG1hcDogc3RhZ2UubWFwLFxuICAgICAgICAgICAgbmVlZEJvc3M6IHN0YWdlLm5lZWRCb3NzLFxuICAgICAgICAgICAgbGFiZWw6IHN0YWdlQ2hhbm5lbExhYmVsKHN0YWdlLm1hcCwgc3RhZ2UubmVlZEJvc3MpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhbm5lbHM7XG59XG5cbi8qKiBQYXJzZSBwcm9kdWN0IGluZGV4ZXMgd2l0aCBOb2J1eeKJoDAgZnJvbSBKRlRTRSBTaG9wX0luaTMueG1sIHRleHQuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTaG9wTm9idXlQcm9kdWN0SW5kZXhlcyhzaG9wWG1sOiBzdHJpbmcpOiBSZWFkb25seVNldDxudW1iZXI+IHtcbiAgICBjb25zdCBub2J1eSA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWF0Y2ggb2Ygc2hvcFhtbC5tYXRjaEFsbCgvPFByb2R1Y3RcXHMrKFtePl0rPylcXC8/Pi9nKSkge1xuICAgICAgICBjb25zdCBhdHRycyA9IG1hdGNoWzFdID8/IFwiXCI7XG4gICAgICAgIGNvbnN0IGluZGV4TWF0Y2ggPSBhdHRycy5tYXRjaCgvXFxiSW5kZXg9XCIoXFxkKylcIi8pO1xuICAgICAgICBjb25zdCBub2J1eU1hdGNoID0gYXR0cnMubWF0Y2goL1xcYk5vYnV5PVwiKFxcZCspXCIvKTtcbiAgICAgICAgaWYgKCFpbmRleE1hdGNoIHx8ICFub2J1eU1hdGNoKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9idXlNYXRjaFsxXSAhPT0gXCIwXCIpIHtcbiAgICAgICAgICAgIG5vYnV5LmFkZChOdW1iZXIoaW5kZXhNYXRjaFsxXSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2J1eTtcbn1cbiIsInR5cGUgVGFnX25hbWUgPSBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA7XG50eXBlIEF0dHJpYnV0ZXMgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xudHlwZSBIVE1MX25vZGU8VCBleHRlbmRzIFRhZ19uYW1lPiA9IFtULCAuLi4oSFRNTF9ub2RlPFRhZ19uYW1lPiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgQXR0cmlidXRlcylbXV07XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIVE1MPFQgZXh0ZW5kcyBUYWdfbmFtZT4obm9kZTogSFRNTF9ub2RlPFQ+KTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW1RdIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlWzBdKTtcbiAgICBmdW5jdGlvbiBoYW5kbGUocGFyYW1ldGVyOiBBdHRyaWJ1dGVzIHwgSFRNTF9ub2RlPFRhZ19uYW1lPiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyID09PSBcInN0cmluZ1wiIHx8IHBhcmFtZXRlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChwYXJhbWV0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1ldGVyKSkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoY3JlYXRlSFRNTChwYXJhbWV0ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgcGFyYW1ldGVyW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBoYW5kbGUobm9kZVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xufVxuIiwiaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQge1xuICAgIHByZXR0eUd1YXJkaWFuTWFwTmFtZSxcbiAgICBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzLFxuICAgIHJlc29sdmVNYXBBcnRGaWxlLFxuICAgIHN0YWdlQ2hhbm5lbExhYmVsLFxuICAgIHN0YWdlVGl0bGVOYW1lLFxuICAgIHR5cGUgR2FjaGFTb3VyY2VJbnB1dCxcbiAgICB0eXBlIE1hcEFydENhdGFsb2csXG59IGZyb20gJy4vZ2FjaGFBY3F1aXNpdGlvbic7XG5pbXBvcnQgeyBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IH0gZnJvbSAnLi9wcmlvcml0eVN0YXRIZWFkZXJzJztcbmltcG9ydCB7XG4gICAgcHJvamVjdFN0YWdlQm9zc2VzLFxuICAgIHR5cGUgU3RhZ2VCb3NzQ2F0YWxvZyxcbiAgICB0eXBlIFN0YWdlQm9zc1Byb2plY3Rpb24sXG59IGZyb20gJy4vc3RhZ2VCb3NzZXMnO1xuXG5leHBvcnQgeyBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IH0gZnJvbSAnLi9wcmlvcml0eVN0YXRIZWFkZXJzJztcbmV4cG9ydCB0eXBlIHsgUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5leHBvcnQge1xuICAgIHJlc29sdmVNYXBBcnRGaWxlLFxuICAgIHN0YWdlVGl0bGVOYW1lLFxufSBmcm9tICcuL2dhY2hhQWNxdWlzaXRpb24nO1xuZXhwb3J0IHtcbiAgICBwcm9qZWN0U3RhZ2VCb3NzZXMsXG59IGZyb20gJy4vc3RhZ2VCb3NzZXMnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVycyA9IFtcIk5pa2lcIiwgXCJMdW5MdW5cIiwgXCJMdWN5XCIsIFwiU2h1YVwiLCBcIkRoYW5waXJcIiwgXCJQb2NoaVwiLCBcIkFsXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0gdHlwZW9mIGNoYXJhY3RlcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoYXJhY3RlcihjaGFyYWN0ZXI6IHN0cmluZyk6IGNoYXJhY3RlciBpcyBDaGFyYWN0ZXIge1xuICAgIHJldHVybiAoY2hhcmFjdGVycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhjaGFyYWN0ZXIpO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gXCJIYXRcIiB8IFwiSGFpclwiIHwgXCJEeWVcIiB8IFwiVXBwZXJcIiB8IFwiTG93ZXJcIiB8IFwiU2hvZXNcIiB8IFwiU29ja3NcIiB8IFwiSGFuZFwiIHwgXCJCYWNrcGFja1wiIHwgXCJGYWNlXCIgfCBcIlJhY2tldFwiIHwgXCJPdGhlclwiO1xuXG5leHBvcnQgY2xhc3MgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pZDogbnVtYmVyKSB7IH1cblxuICAgIGdldCByZXF1aXJlc0d1YXJkaWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi50aGlzLml0ZW0uc291cmNlcy52YWx1ZXMoKV0uZXZlcnkoc291cmNlID0+IHNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgZmluZGluZyBpdGVtIG9mIGl0ZW1Tb3VyY2UgJHt0aGlzLnNob3BfaWR9YCk7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2hvcEl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIsIHJlYWRvbmx5IHByaWNlOiBudW1iZXIsIHJlYWRvbmx5IGFwOiBib29sZWFuLCByZWFkb25seSBpdGVtczogSXRlbVtdKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG5cbiAgICBnYWNoYVRyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFnYWNoYSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnYWNoYS5hdmVyYWdlX3RyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBHYWNoYUVjb25vbWljcyA9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiO1xuICAgICAgICBjaGFuY2VQZXJjZW50OiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICB9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBjdXJyZW5jeTogXCJBUFwiIHwgXCJHb2xkXCI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogbnVtYmVyO1xuICAgICAgICBwcmljZVBlclB1bGw6IG51bWJlcjtcbiAgICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhRWNvbm9taWNzKFxuICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcixcbiAgICBzb3VyY2U/OiB7IHByaWNlOiBudW1iZXI7IGFwOiBib29sZWFuIH0sXG4pOiBHYWNoYUVjb25vbWljcyB7XG4gICAgY29uc3QgY2hhbmNlUGVyY2VudCA9IGV4cGVjdGVkUHVsbHMgPiAwID8gMTAwIC8gZXhwZWN0ZWRQdWxscyA6IDA7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgICAgIGV4cGVjdGVkUHVsbHMsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIixcbiAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgY3VycmVuY3k6IHNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiLFxuICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICBleHBlY3RlZFNwZW5kOiBleHBlY3RlZFB1bGxzICogc291cmNlLnByaWNlLFxuICAgICAgICBwcmljZVBlclB1bGw6IHNvdXJjZS5wcmljZSxcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgR3VhcmRpYW5JdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IGd1YXJkaWFuX21hcDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBpdGVtczogSXRlbVtdLFxuICAgICAgICByZWFkb25seSB4cDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuZWVkX2Jvc3M6IGJvb2xlYW4sXG4gICAgICAgIHJlYWRvbmx5IGJvc3NfdGltZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKEd1YXJkaWFuSXRlbVNvdXJjZS5ndWFyZGlhbl9tYXBfaWQoZ3VhcmRpYW5fbWFwKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGd1YXJkaWFuX21hcF9pZChtYXA6IHN0cmluZykge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMuaW5kZXhPZihtYXApO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmd1YXJkaWFuX21hcHMucHVzaChtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtaW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3VhcmRpYW5fbWFwcyA9IFtcIlwiXTtcbn1cblxuZXhwb3J0IGNsYXNzIEl0ZW0ge1xuICAgIGlkID0gMDtcbiAgICBuYW1lX2tyID0gXCJcIjtcbiAgICBuYW1lX2VuID0gXCJcIjtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICBtYXhVc2UgPSAwO1xuICAgIGhpZGRlbiA9IGZhbHNlO1xuICAgIHJlc2lzdCA9IFwiXCI7XG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyO1xuICAgIHBhcnQ6IFBhcnQgPSBcIk90aGVyXCI7XG4gICAgbGV2ZWwgPSAwO1xuICAgIHN0ciA9IDA7XG4gICAgc3RhID0gMDtcbiAgICBkZXggPSAwO1xuICAgIHdpbCA9IDA7XG4gICAgaHAgPSAwO1xuICAgIHF1aWNrc2xvdHMgPSAwO1xuICAgIGJ1ZmZzbG90cyA9IDA7XG4gICAgc21hc2ggPSAwO1xuICAgIG1vdmVtZW50ID0gMDtcbiAgICBjaGFyZ2UgPSAwO1xuICAgIGxvYiA9IDA7XG4gICAgc2VydmUgPSAwO1xuICAgIG1heF9zdHIgPSAwO1xuICAgIG1heF9zdGEgPSAwO1xuICAgIG1heF9kZXggPSAwO1xuICAgIG1heF93aWwgPSAwO1xuICAgIGVsZW1lbnRfZW5jaGFudGFibGUgPSBmYWxzZTtcbiAgICBwYXJjZWxfZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNwaW4gPSAwO1xuICAgIGF0c3MgPSAwO1xuICAgIGRmc3MgPSAwO1xuICAgIHNvY2tldCA9IDA7XG4gICAgZ2F1Z2UgPSAwO1xuICAgIGdhdWdlX2JhdHRsZSA9IDA7XG4gICAgc291cmNlczogSXRlbVNvdXJjZVtdID0gW107XG4gICAgc3RhdEZyb21TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiTW92IFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZW1lbnQ7XG4gICAgICAgICAgICBjYXNlIFwiQ2hhcmdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlO1xuICAgICAgICAgICAgY2FzZSBcIkxvYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYjtcbiAgICAgICAgICAgIGNhc2UgXCJTbWFzaFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNtYXNoO1xuICAgICAgICAgICAgY2FzZSBcIlN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcbiAgICAgICAgICAgIGNhc2UgXCJEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXg7XG4gICAgICAgICAgICBjYXNlIFwiU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhO1xuICAgICAgICAgICAgY2FzZSBcIldpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53aWw7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdHI7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IERleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9kZXg7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdGE7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFdpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfd2lsO1xuICAgICAgICAgICAgY2FzZSBcIlNlcnZlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmU7XG4gICAgICAgICAgICBjYXNlIFwiUXVpY2tzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1aWNrc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiQnVmZnNsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZnNsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkhQXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgc2hvcF9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBnYWNoYV9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHByaWNlOiBudW1iZXIgPSAwLFxuICAgICAgICByZWFkb25seSBhcDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKiogTGlzdGVkIGluIHRoZSBsaXZlIHNob3AgY2F0YWxvZyAoYGVuYWJsZWRgKS4gKi9cbiAgICAgICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuIGJlIHB1cmNoYXNlZCB3aXRoIEdvbGQvQVAuIEZhbHNlIHdoZW4gU2hvcF9JbmkzIGBOb2J1eeKJoDBgXG4gICAgICAgICAqIGV2ZW4gaWYgdGhlIGNhdGFsb2cgc3RpbGwgbGlzdHMgdGhlIHByb2R1Y3QgYXMgZW5hYmxlZC5cbiAgICAgICAgICovXG4gICAgICAgIHJlYWRvbmx5IHB1cmNoYXNhYmxlOiBib29sZWFuID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgY2hhcmFjdGVycykge1xuICAgICAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLnNldChjaGFyYWN0ZXIsIG5ldyBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+KCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQoaXRlbTogSXRlbSwgcHJvYmFiaWxpdHk6IG51bWJlciwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIsIHF1YW50aXR5X21pbjogbnVtYmVyLCBxdWFudGl0eV9tYXg6IG51bWJlcikge1xuICAgICAgICBpZiAoaXRlbS5jaGFyYWN0ZXIgJiYgaXRlbS5jaGFyYWN0ZXIgIT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgLy8gTG90dGVyeSBmaWxlcyBsaXN0IGV2ZXJ5IGNoYXJhY3RlcidzIGdlYXIgdW5kZXIgZWFjaCBMb3R0ZXJ5SXRlbV8qIGJsb2NrLlxuICAgICAgICAgICAgLy8gUm91dGUgdGhlIGVudHJ5IHRvIHRoZSBpdGVtJ3Mgb3duaW5nIGNoYXJhY3RlciBzbyBmaWx0ZXJzIHN0YXkgbWVhbmluZ2Z1bC5cbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGl0ZW0uY2hhcmFjdGVyO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSE7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gbWFwLmdldChpdGVtKTtcbiAgICAgICAgLy8gU2FtZSBJdGVtIGNhbiBhcHBlYXIgb25jZSBwZXIgY2hhcmFjdGVyLWJsb2NrIChlLmcuIDfDlyBEcmFnb24gQXJtb3IgYXQgMSUpLlxuICAgICAgICAvLyBBY2N1bXVsYXRlIENoYW5zUGVyIGluc3RlYWQgb2Ygb3ZlcndyaXRpbmcg4oCUIG90aGVyd2lzZSByYXRlcyBzdGF5IHN0dWNrIGF0IDElXG4gICAgICAgIC8vIHdoaWxlIGNoYXJhY3Rlcl9wcm9iYWJpbGl0eSBzdGlsbCBzdW1zIHRvIDEwMCAobWFwIHRpY2tldHMg4omqIHBvb2wgdG90YWwpLlxuICAgICAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgICAgIG1hcC5zZXQoaXRlbSwgW1xuICAgICAgICAgICAgICAgIHByZXZpb3VzWzBdICsgcHJvYmFiaWxpdHksXG4gICAgICAgICAgICAgICAgTWF0aC5taW4ocHJldmlvdXNbMV0sIHF1YW50aXR5X21pbiksXG4gICAgICAgICAgICAgICAgTWF0aC5tYXgocHJldmlvdXNbMl0sIHF1YW50aXR5X21heCksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1hcC5zZXQoaXRlbSwgW3Byb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LnNldChjaGFyYWN0ZXIsIHByb2JhYmlsaXR5ICsgKHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpIHx8IDApKTtcbiAgICB9XG5cbiAgICBhdmVyYWdlX3RyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGNoYXJzOiByZWFkb25seSBDaGFyYWN0ZXJbXSA9IGNoYXJhY3RlciA/IChbY2hhcmFjdGVyXSkgOiBjaGFyYWN0ZXJzO1xuICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgKHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuZ2V0KGl0ZW0pPy5bMF0gfHwgMCksIDApO1xuICAgICAgICBpZiAocHJvYmFiaWxpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsX3Byb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgICAgICByZXR1cm4gdG90YWxfcHJvYmFiaWxpdHkgLyBwcm9iYWJpbGl0eTtcbiAgICB9XG5cbiAgICBnZXQgdG90YWxfcHJvYmFiaWxpdHkoKSB7XG4gICAgICAgIHJldHVybiBjaGFyYWN0ZXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICB9XG5cbiAgICBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgPSBuZXcgTWFwPENoYXJhY3RlciwgbnVtYmVyPigpO1xuICAgIHNob3BfaXRlbXMgPSBuZXcgTWFwPENoYXJhY3RlciwgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPj4oKTtcbn1cblxuZXhwb3J0IGxldCBpdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBzaG9wX2l0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5leHBvcnQgbGV0IGdhY2hhcyA9IG5ldyBNYXA8bnVtYmVyLCBHYWNoYT4oKTtcbmxldCBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgdW5kZWZpbmVkO1xudHlwZSBJdGVtQXJ0RW50cnkgPSBbc2hlZXQ6IHN0cmluZywgY2VsbDogbnVtYmVyXTtcbnR5cGUgSXRlbUFydFNoZWV0ID0ge1xuICAgIGxpbmVDb3VudDogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICBzcGFjZTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG59O1xudHlwZSBMb3R0ZXJ5QXJ0RW50cnkgPSB7XG4gICAgc2hlZXQ6IHN0cmluZztcbiAgICBjZWxsOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBzaGFwZTogXCJjb2luXCIgfCBcImN1YmVcIiB8IFwidG9rZW5cIjtcbn07XG50eXBlIEl0ZW1BcnRNYXAgPSB7XG4gICAgaXRlbXM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRFbnRyeT47XG4gICAgbG90dGVyaWVzOiBSZWNvcmQ8c3RyaW5nLCBMb3R0ZXJ5QXJ0RW50cnk+O1xuICAgIHNoZWV0czogUmVjb3JkPHN0cmluZywgSXRlbUFydFNoZWV0Pjtcbn07XG5sZXQgaXRlbUFydE1hcDogSXRlbUFydE1hcCA9IHsgaXRlbXM6IHt9LCBsb3R0ZXJpZXM6IHt9LCBzaGVldHM6IHt9IH07XG5sZXQgbWFwQXJ0TWFwOiBNYXBBcnRDYXRhbG9nID0geyBmaWxlczoge30sIGJ5TmFtZToge30gfTtcbmxldCBzdGFnZUJvc3NDYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG50eXBlIEJvc3NBcnRDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IGJ5Qm9zc0lkPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG4gICAgcmVhZG9ubHkgYnlSZXNJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xuICAgIHJlYWRvbmx5IGZpbGVzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgeyByZWFkb25seSBmaWxlOiBzdHJpbmcgfT4+O1xufTtcbmxldCBib3NzQXJ0Q2F0YWxvZzogQm9zc0FydENhdGFsb2cgPSB7fTtcblxuZnVuY3Rpb24gcHJldHR5TnVtYmVyKG46IG51bWJlciwgZGlnaXRzOiBudW1iZXIpIHtcbiAgICBsZXQgcyA9IG4udG9GaXhlZChkaWdpdHMpO1xuICAgIHdoaWxlIChzLmVuZHNXaXRoKFwiMFwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIGlmIChzLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUl0ZW1EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJdGVtcyBmaWxlIGlzIG9ubHkgJHtkYXRhLmxlbmd0aH0gYnl0ZXMgbG9uZ2ApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIHJlc3VsdF0gb2YgZGF0YS5tYXRjaEFsbCgvXFw8SXRlbSAoLiopXFwvXFw+L2cpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSBuZXcgSXRlbTtcbiAgICAgICAgZm9yIChjb25zdCBbLCBhdHRyaWJ1dGUsIHZhbHVlXSBvZiByZXN1bHQubWF0Y2hBbGwoL1xccz8oW149XSopPVwiKFteXCJdKilcIi9nKSkge1xuICAgICAgICAgICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiSW5kZXhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5pZCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIl9OYW1lX1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfa3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk5hbWVfTlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVzZVR5cGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51c2VUeXBlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNYXhVc2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhVc2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJIaWRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaGlkZGVuID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSZXNpc3RcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZXNpc3QgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk5JS0lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTmlraVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVTkxVTlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdW5MdW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVUNZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1Y3lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTSFVBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlNodWFcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJESEFOUElSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkRoYW5waXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQT0NISVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJQb2NoaVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFMXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkFsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBjaGFyYWN0ZXIgXCIke3ZhbHVlfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlBhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQkFHXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJCYWNrcGFja1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkdMQVNTRVNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkZhY2VcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQU5EXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU09DS1NcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNvY2tzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRk9PVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU2hvZXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDQVBcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBBTlRTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJMb3dlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlJBQ0tFVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiUmFja2V0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQk9EWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiVXBwZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQUlSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYWlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRFlFXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJEeWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHBhcnQgJHt2YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTGV2ZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZXZlbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0ciA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0YSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRleCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIldJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLndpbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEhQXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaHAgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRRdWlja1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnF1aWNrc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRCdWZmXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYnVmZnNsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU21hc2hTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNtYXNoID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTW92ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubW92ZW1lbnQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyZ2VzaG90U3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyZ2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMb2JTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxvYiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNlcnZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXJ2ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RyID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0cik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0YSA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX0RFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9kZXggPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9XSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfd2lsID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLndpbCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmNoYW50RWxlbWVudFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuYWJsZVBhcmNlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcmNlbF9lbmFibGVkID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJCYWxsU3BpblwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNwaW4gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBVFNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXRzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRGU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZnNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU29ja2V0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc29ja2V0ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlQmF0dGxlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2VfYmF0dGxlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gaXRlbSBhdHRyaWJ1dGUgXCIke2F0dHJpYnV0ZX1cImApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGl0ZW1zLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICB9XG59XG5cbmNsYXNzIEFwaUl0ZW0ge1xuICAgIHByb2R1Y3RJbmRleCA9IDA7XG4gICAgZGlzcGxheSA9IDA7XG4gICAgaGl0RGlzcGxheSA9IGZhbHNlO1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICB1c2UwID0gMDtcbiAgICB1c2UxID0gMDtcbiAgICB1c2UyID0gMDtcbiAgICBwcmljZVR5cGUgPSBcIkdPTERcIjtcbiAgICBvbGRQcmljZTAgPSAwO1xuICAgIG9sZFByaWNlMSA9IDA7XG4gICAgb2xkUHJpY2UyID0gMDtcbiAgICBwcmljZTAgPSAwO1xuICAgIHByaWNlMSA9IDA7XG4gICAgcHJpY2UyID0gMDtcbiAgICBjb3VwbGVQcmljZSA9IDA7XG4gICAgY2F0ZWdvcnkgPSBcIlwiO1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGdvbGRCYWNrID0gMDtcbiAgICBlbmFibGVQYXJjZWwgPSBmYWxzZTtcbiAgICBmb3JQbGF5ZXIgPSAwO1xuICAgIGl0ZW0wID0gMDtcbiAgICBpdGVtMSA9IDA7XG4gICAgaXRlbTIgPSAwO1xuICAgIGl0ZW0zID0gMDtcbiAgICBpdGVtNCA9IDA7XG4gICAgaXRlbTUgPSAwO1xuICAgIGl0ZW02ID0gMDtcbiAgICBpdGVtNyA9IDA7XG4gICAgaXRlbTggPSAwO1xuICAgIGl0ZW05ID0gMDtcbn1cblxuZnVuY3Rpb24gaXNBcGlJdGVtKG9iajogYW55KTogb2JqIGlzIEFwaUl0ZW0ge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHR5cGVvZiBvYmoucHJvZHVjdEluZGV4ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmRpc3BsYXkgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaGl0RGlzcGxheSA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlZCA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlVHlwZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY291cGxlUHJpY2UgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY2F0ZWdvcnkgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai5nb2xkQmFjayA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5lbmFibGVQYXJjZWwgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmZvclBsYXllciA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOSA9PT0gXCJudW1iZXJcIlxuICAgIF0uZXZlcnkoYiA9PiBiKTtcbn1cblxuLyoqIFByb2R1Y3QgaW5kZXhlcyB0aGF0IHJlamVjdCBzaG9wIGJ1eXMgKFNob3BfSW5pMyBOb2J1eeKJoDApLiBMaXZlIEFQSSBvbWl0cyB0aGlzIGZpZWxkLiAqL1xubGV0IHNob3BOb2J1eVByb2R1Y3RJbmRleGVzOiBSZWFkb25seVNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuXG5mdW5jdGlvbiBpc1Nob3BQdXJjaGFzYWJsZShwcm9kdWN0SW5kZXg6IG51bWJlciwgZW5hYmxlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbmFibGVkICYmICFzaG9wTm9idXlQcm9kdWN0SW5kZXhlcy5oYXMocHJvZHVjdEluZGV4KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VBcGlTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGFwaUl0ZW0gb2YgSlNPTi5wYXJzZShkYXRhKSkge1xuICAgICAgICBpZiAoIWlzQXBpSXRlbShhcGlJdGVtKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW5jb3JyZWN0IGZvcm1hdCBvZiBpdGVtOiAke2RhdGF9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyX2l0ZW1zID0gW1xuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTEsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0yLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMyxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTQsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW01LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTcsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW04LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOSxcbiAgICAgICAgXS5maWx0ZXIoaWQgPT4gISFpZCAmJiBpdGVtcy5nZXQoaWQpKS5tYXAoaWQgPT4gaXRlbXMuZ2V0KGlkKSEpO1xuXG4gICAgICAgIGNvbnN0IHB1cmNoYXNhYmxlID0gaXNTaG9wUHVyY2hhc2FibGUoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0uZW5hYmxlZCk7XG5cbiAgICAgICAgaWYgKGFwaUl0ZW0uY2F0ZWdvcnkgPT09IFwiUEFSVFNcIikge1xuICAgICAgICAgICAgaWYgKGlubmVyX2l0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpbm5lcl9pdGVtc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT25seSByZWFsIHB1cmNoYXNlIHBhdGhzIGNvdW50IGFzIHNob3Agc291cmNlcyAoZXhjbHVkZSBOb2J1eSBjYXRhbG9nIHJvd3MpLlxuICAgICAgICAgICAgaWYgKHB1cmNoYXNhYmxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoXG4gICAgICAgICAgICAgICAgYXBpSXRlbS5wcm9kdWN0SW5kZXgsXG4gICAgICAgICAgICAgICAgbmV3IEdhY2hhKFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByb2R1Y3RJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByaWNlMCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLmVuYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNhYmxlLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIC8vIFByb2R1Y3QgaW5kZXggaXMgdGhlIHNob3BfaXRlbXMgLyBnYWNoYXMga2V5IOKAlCByZXF1aXJlZCBzbyByZXdhcmQgdGlsZXNcbiAgICAgICAgICAgIC8vIGNhbiByZXNvbHZlIGNvaW4gYXJ0IHdpdGggZ2FjaGFzLmdldChpdGVtLmlkKSB0aGUgc2FtZSB3YXkgdGhlIHRhYmxlIGRvZXMuXG4gICAgICAgICAgICBnYWNoYUl0ZW0uaWQgPSBhcGlJdGVtLnByb2R1Y3RJbmRleDtcbiAgICAgICAgICAgIGdhY2hhSXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGdhY2hhSXRlbSk7XG4gICAgICAgICAgICBpZiAocHVyY2hhc2FibGUpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0uaWQgPSBhcGlJdGVtLnByb2R1Y3RJbmRleDtcbiAgICAgICAgICAgIG90aGVySXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG90aGVySXRlbSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHYWNoYURhdGEoZGF0YTogc3RyaW5nLCBnYWNoYTogR2FjaGEpIHtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGF0YS5zcGxpdChcIlxcblwiKSkge1xuICAgICAgICBpZiAoIWxpbmUuaW5jbHVkZXMoXCI8TG90dGVyeUl0ZW1fXCIpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL1xccyo8TG90dGVyeUl0ZW1fKD88Y2hhcmFjdGVyPlteIF0qKSBJbmRleD1cIlxcZCtcIiBfTmFtZV89XCJbXlwiXSpcIiBTaG9wSW5kZXg9XCIoPzxzaG9wX2lkPlxcZCspXCIgUXVhbnRpdHlNaW49XCIoPzxxdWFudGl0eV9taW4+XFxkKylcIiBRdWFudGl0eU1heD1cIig/PHF1YW50aXR5X21heD5cXGQrKVwiIENoYW5zUGVyPVwiKD88cHJvYmFiaWxpdHk+XFxkK1xcLj9cXGQqKVxccypcIiBFZmZlY3Q9XCJcXGQrXCIgUHJvZHVjdE9wdD1cIlxcZCtcIlxcLz4vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgcGFyc2luZyBnYWNoYSAke2dhY2hhLmdhY2hhX2luZGV4fTpcXG4ke2xpbmV9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1hdGNoLmdyb3Vwcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYXJhY3RlciA9IG1hdGNoLmdyb3Vwcy5jaGFyYWN0ZXI7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTHVubHVuXCIpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0NoYXJhY3RlcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHtjaGFyYWN0ZXJ9XCIgaW4gbG90dGVyeSBmaWxlICR7Z2FjaGEuZ2FjaGFfaW5kZXh9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQocGFyc2VJbnQobWF0Y2guZ3JvdXBzLnNob3BfaWQpKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gc2hvcCBpdGVtIGlkICR7bWF0Y2guZ3JvdXBzLnNob3BfaWR9IGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2FjaGEuYWRkKGl0ZW0sIHBhcnNlRmxvYXQobWF0Y2guZ3JvdXBzLnByb2JhYmlsaXR5KSwgY2hhcmFjdGVyLCBwYXJzZUludChtYXRjaC5ncm91cHMucXVhbnRpdHlfbWluKSwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21heCkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIG1hcF0gb2YgZ2FjaGEuc2hvcF9pdGVtcykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpdGVtLF0gb2YgbWFwKSB7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChuZXcgR2FjaGFJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHdWFyZGlhbkRhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ3VhcmRpYW5EYXRhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE51bWJlcihvOiBhbnkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBib3NzVGltZUluZm8gPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWFwSW5mbyBvZiBndWFyZGlhbkRhdGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBJbmZvICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXBfbmFtZSA9IG1hcEluZm8uTmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBfbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV3YXJkcyA9IEFycmF5LmlzQXJyYXkobWFwSW5mby5SZXdhcmRzKSA/IFsuLi5tYXBJbmZvLlJld2FyZHNdIDogW107XG4gICAgICAgIGNvbnN0IHJld2FyZF9pdGVtcyA9IHJld2FyZHNcbiAgICAgICAgICAgIC5maWx0ZXIoKHNob3BfaWQpOiBzaG9wX2lkIGlzIG51bWJlciA9PiB0eXBlb2Ygc2hvcF9pZCA9PT0gXCJudW1iZXJcIiAmJiBzaG9wX2l0ZW1zLmhhcyhzaG9wX2lkKSlcbiAgICAgICAgICAgIC5tYXAoc2hvcF9pZCA9PiBzaG9wX2l0ZW1zLmdldChzaG9wX2lkKSEpO1xuICAgICAgICBjb25zdCBFeHBNdWx0aXBsaWVyID0gZ2V0TnVtYmVyKG1hcEluZm8uRXhwTXVsdGlwbGllcikgfHwgMDtcbiAgICAgICAgY29uc3QgSXNCb3NzU3RhZ2UgPSAhIW1hcEluZm8uSXNCb3NzU3RhZ2U7XG4gICAgICAgIGNvbnN0IE1hcElEID0gZ2V0TnVtYmVyKG1hcEluZm8uTWFwSWQpIHx8IDA7XG4gICAgICAgIGxldCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID0gZ2V0TnVtYmVyKG1hcEluZm8uQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcykgfHwgLTE7XG4gICAgICAgIGlmIChCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID09PSAtMSkge1xuICAgICAgICAgICAgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGJvc3NUaW1lSW5mby5nZXQoTWFwSUQpIHx8IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKE1hcElEICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYm9zc1RpbWVJbmZvLnNldChNYXBJRCwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJld2FyZF9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBuZXcgR3VhcmRpYW5JdGVtU291cmNlKG1hcF9uYW1lLCByZXdhcmRfaXRlbXMsIEV4cE11bHRpcGxpZXIsIElzQm9zc1N0YWdlLCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKTtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgUHJvZHVjdFN0YWdlRHJvcCA9IHtcbiAgICByZWFkb25seSBtYXA6IHN0cmluZztcbiAgICByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbjtcbiAgICByZWFkb25seSB4cD86IG51bWJlcjtcbiAgICByZWFkb25seSBib3NzVGltZT86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBwcm9kdWN0cz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHJlYWRvbmx5IFByb2R1Y3RTdGFnZURyb3BbXT4+O1xufTtcblxuLyoqXG4gKiBNZXJnZSBTX1JlbGF0aW9uc2hpcHMtZGVyaXZlZCBib3NzL21hcCBkcm9wcyBvbnRvIHNob3AgcHJvZHVjdHMuXG4gKiBEZWR1cGVzIGJ5IGd1YXJkaWFuIG1hcCBuYW1lIHNvIEd1YXJkaWFuU3RhZ2VzIFJld2FyZHMgcGF0aHMgYXJlIG5vdCBkb3VibGVkLlxuICogVGhpcyBpcyB3aGF0IG1ha2VzIE5vYnV5IGNvaW5zIGxpa2UgQmx1ZSBDYXBzdWxlIGFuc3dlciBcIndoZXJlIGRvIEkgZ2V0IHRoaXM/XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVByb2R1Y3RTdGFnZURyb3BzKGNhdGFsb2c6IFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyk6IHZvaWQge1xuICAgIGNvbnN0IHByb2R1Y3RzID0gY2F0YWxvZy5wcm9kdWN0cztcbiAgICBpZiAoIXByb2R1Y3RzIHx8IHR5cGVvZiBwcm9kdWN0cyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgW3Byb2R1Y3RLZXksIGRyb3BzXSBvZiBPYmplY3QuZW50cmllcyhwcm9kdWN0cykpIHtcbiAgICAgICAgY29uc3QgcHJvZHVjdEluZGV4ID0gTnVtYmVyKHByb2R1Y3RLZXkpO1xuICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcm9kdWN0SW5kZXgpIHx8ICFBcnJheS5pc0FycmF5KGRyb3BzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHByb2R1Y3RJbmRleCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhpc3RpbmdNYXBzID0gbmV3IFNldChcbiAgICAgICAgICAgIGl0ZW0uc291cmNlc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT4gc291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKVxuICAgICAgICAgICAgICAgIC5tYXAoKHNvdXJjZSkgPT4gc291cmNlLmd1YXJkaWFuX21hcCksXG4gICAgICAgICk7XG4gICAgICAgIGZvciAoY29uc3QgZHJvcCBvZiBkcm9wcykge1xuICAgICAgICAgICAgaWYgKCFkcm9wIHx8IHR5cGVvZiBkcm9wLm1hcCAhPT0gXCJzdHJpbmdcIiB8fCBkcm9wLm1hcC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleGlzdGluZ01hcHMuaGFzKGRyb3AubWFwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhpc3RpbmdNYXBzLmFkZChkcm9wLm1hcCk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgR3VhcmRpYW5JdGVtU291cmNlKFxuICAgICAgICAgICAgICAgICAgICBkcm9wLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgW2l0ZW1dLFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZHJvcC54cCA9PT0gXCJudW1iZXJcIiA/IGRyb3AueHAgOiAwLFxuICAgICAgICAgICAgICAgICAgICAhIWRyb3AubmVlZEJvc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkcm9wLmJvc3NUaW1lID09PSBcIm51bWJlclwiID8gZHJvcC5ib3NzVGltZSA6IC0xLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKiogVXNlci1mYWNpbmcgbGFiLXByZXAgcGhhc2VzIOKAlCBuZXZlciBleHBvc2UgcmF3IGZpbGVuYW1lcywgcGF0aHMsIG9yIFhNTCBuYW1lcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkaW5nUGhhc2VGb3JVcmwodXJsOiBzdHJpbmcpOiB7IHRpdGxlOiBzdHJpbmc7IGRldGFpbDogc3RyaW5nIH0ge1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJJdGVtX1BhcnRzXCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJQcmVwYXJpbmcgZXF1aXBtZW50IGNhdGFsb2figKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJHYXRoZXJpbmcgZXZlcnkgd2VhcmFibGUgZm9yIGNvbXBhcmlzb24uXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCIvYXBpL3Nob3BcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkNoZWNraW5nIHRoZSBsaXZlIHNob3DigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJSZWFkaW5nIEdvbGQgYW5kIEFQIGxpc3RpbmdzLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiR3VhcmRpYW5TdGFnZXNcIikgfHwgdXJsLmluY2x1ZGVzKFwicHJvZHVjdC1zdGFnZS1kcm9wc1wiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiTWFwcGluZyBzdGFnZSByZXdhcmRz4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiRmluZGluZyB3aGVyZSBnZWFyIGFuZCBjb2lucyBkcm9wLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiSW5pM19Mb3RcIikgfHwgdXJsLmluY2x1ZGVzKFwibG90dGVyeVwiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiTG9hZGluZyBnYWNoYSB0YWJsZXPigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJNYXRjaGluZyBjYXBzdWxlcyB0byB0aGVpciBwcml6ZXMuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJpdGVtLWFydFwiKSB8fCB1cmwuaW5jbHVkZXMoXCJzaG9wLW5vYnV5XCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJGaW5pc2hpbmcgdGhlIGxhYuKAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIlN5bmNpbmcgYXJ0IGFuZCBzYWxlIHN0YXR1cy5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IFwiT3BlbmluZyB0aGUgZXF1aXBtZW50IGxhYuKAplwiLFxuICAgICAgICBkZXRhaWw6IFwiQWxtb3N0IHJlYWR5IHRvIGNvbXBhcmUgZ2Vhci5cIixcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzZXRMb2FkaW5nUGhhc2UodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwaGFzZSA9IGxvYWRpbmdQaGFzZUZvclVybCh1cmwpO1xuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGlmICh0aXRsZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gcGhhc2UudGl0bGU7XG4gICAgfVxuICAgIGNvbnN0IGRldGFpbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGluZy1zdGF0ZV9fZGV0YWlsXCIpO1xuICAgIGlmIChkZXRhaWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBkZXRhaWwudGV4dENvbnRlbnQgPSBwaGFzZS5kZXRhaWw7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHNldExvYWRpbmdQaGFzZSh1cmwpO1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSsrO1xuICAgIH1cbiAgICBpZiAoIXJlcGx5Lm9rKSB7XG4gICAgICAgIC8vIEtlZXAgdGVjaG5pY2FsIFVSTCBkZXRhaWwgaW4gdGhlIHRocm93biBlcnJvciBmb3IgbG9nczsgVUkgdXNlcyBodW1hbiBjb3B5LlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIGRvd25sb2FkaW5nICR7dXJsfTogJHtyZXBseS5zdGF0dXN9JHtyZXBseS5zdGF0dXNUZXh0ID8gYCAke3JlcGx5LnN0YXR1c1RleHR9YCA6IFwiXCJ9YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVwbHkudGV4dCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRJdGVtcygpIHtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IDEyNDtcbiAgICB9XG4gICAgY29uc3QgaXRlbVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2F1dGgtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBnYWNoYVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2dhbWUtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXMvbG90dGVyeVwiO1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvc2VydmVyLWNvcmUvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGl0ZW1VUkwgPSBpdGVtU291cmNlICsgXCIvSXRlbV9QYXJ0c19JbmkzLnhtbFwiO1xuICAgIGNvbnN0IGl0ZW1EYXRhID0gZG93bmxvYWQoaXRlbVVSTCk7XG4gICAgLy8gQ29tcGFjdCBOb2J1eSBpbmRleCAoZnJvbSBTaG9wX0luaTMpIOKAlCBsaXZlIHNob3AgQVBJIG9taXRzIHRoaXMgZmllbGQuXG4gICAgY29uc3Qgc2hvcE5vYnV5RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3Nob3Atbm9idXktaW5kZXhlcy5qc29uXCIpO1xuICAgIC8vIEJvc3MvbWFwIGRyb3BzIGZyb20gU19SZWxhdGlvbnNoaXBzIChiZXlvbmQgR3VhcmRpYW5TdGFnZXMgUmV3YXJkcyBsaXN0cykuXG4gICAgY29uc3QgcHJvZHVjdFN0YWdlRHJvcHNEYXRhID0gZG93bmxvYWQoXCJhc3NldHMvcHJvZHVjdC1zdGFnZS1kcm9wcy5qc29uXCIpO1xuICAgIGNvbnN0IGl0ZW1BcnREYXRhID0gZG93bmxvYWQoXCJhc3NldHMvaXRlbS1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWFwQXJ0RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL21hcC1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3Qgc3RhZ2VCb3NzRGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3N0YWdlLWJvc3Nlcy5qc29uXCIpO1xuICAgIGNvbnN0IGJvc3NBcnREYXRhID0gZG93bmxvYWQoXCJhc3NldHMvYm9zcy1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWF4X3Nob3BfcGFnZXMgPSAyMDsgLy9jdXJyZW50bHkgbmVlZCBvbmx5IDEwLCBzaG91bGQgYmUgZW5vdWdoXG4gICAgY29uc3Qgc2hvcFVSTHMgPSBsb2NhdGlvbi5ob3N0bmFtZS5lbmRzV2l0aChcIi5naXRodWIuaW9cIilcbiAgICAgICAgPyBbLi4uQXJyYXkobWF4X3Nob3BfcGFnZXMpLmtleXMoKV0ubWFwKG4gPT4gbmV3IFVSTChgc2hvcC8ke259Lmpzb25gLCBkb2N1bWVudC5iYXNlVVJJKS5ocmVmKVxuICAgICAgICA6IFsuLi5BcnJheShtYXhfc2hvcF9wYWdlcykua2V5cygpXS5tYXAobiA9PiBgL2FwaS9zaG9wP3NpemU9MTAwMCZwYWdlPSR7bn1gKTtcbiAgICBjb25zdCBzaG9wRGF0YXMgPSBzaG9wVVJMcy5tYXAoZG93bmxvYWQpO1xuICAgIGNvbnN0IGd1YXJkaWFuVVJMID0gZ3VhcmRpYW5Tb3VyY2UgKyBcIi9HdWFyZGlhblN0YWdlcy5qc29uXCI7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gZG93bmxvYWQoZ3VhcmRpYW5VUkwpO1xuICAgIHBhcnNlSXRlbURhdGEoYXdhaXQgaXRlbURhdGEpO1xuICAgIGl0ZW1BcnRNYXAgPSBKU09OLnBhcnNlKGF3YWl0IGl0ZW1BcnREYXRhKSBhcyBJdGVtQXJ0TWFwO1xuICAgIHRyeSB7XG4gICAgICAgIG1hcEFydE1hcCA9IEpTT04ucGFyc2UoYXdhaXQgbWFwQXJ0RGF0YSkgYXMgTWFwQXJ0Q2F0YWxvZztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgbWFwIGFydCBjYXRhbG9nOiAke2V9YCk7XG4gICAgICAgIG1hcEFydE1hcCA9IHsgZmlsZXM6IHt9LCBieU5hbWU6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2cgPSBKU09OLnBhcnNlKGF3YWl0IHN0YWdlQm9zc0RhdGEpIGFzIFN0YWdlQm9zc0NhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIHN0YWdlIGJvc3MgY2F0YWxvZzogJHtlfWApO1xuICAgICAgICBzdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGJvc3NBcnRDYXRhbG9nID0gSlNPTi5wYXJzZShhd2FpdCBib3NzQXJ0RGF0YSkgYXMgQm9zc0FydENhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIGJvc3MgYXJ0IGNhdGFsb2c6ICR7ZX1gKTtcbiAgICAgICAgYm9zc0FydENhdGFsb2cgPSB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgbm9idXlKc29uID0gSlNPTi5wYXJzZShhd2FpdCBzaG9wTm9idXlEYXRhKSBhcyB7XG4gICAgICAgICAgICBwcm9kdWN0SW5kZXhlcz86IHVua25vd247XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBBcnJheS5pc0FycmF5KG5vYnV5SnNvbi5wcm9kdWN0SW5kZXhlcylcbiAgICAgICAgICAgID8gbm9idXlKc29uLnByb2R1Y3RJbmRleGVzLmZpbHRlcigobik6IG4gaXMgbnVtYmVyID0+IHR5cGVvZiBuID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMgPSBuZXcgU2V0KGluZGV4ZXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBzaG9wIE5vYnV5IGluZGV4OiAke2V9YCk7XG4gICAgICAgIHNob3BOb2J1eVByb2R1Y3RJbmRleGVzID0gbmV3IFNldCgpO1xuICAgIH1cbiAgICBhd2FpdCBQcm9taXNlLmFsbChzaG9wRGF0YXMubWFwKHAgPT4gcC50aGVuKGRhdGEgPT4gcGFyc2VBcGlTaG9wRGF0YShkYXRhKSkpKTtcblxuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSBnYWNoYXMuc2l6ZSArIDQ7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhX2l0ZW1zOiBbUHJvbWlzZTxzdHJpbmc+LCBHYWNoYSwgc3RyaW5nXVtdID0gW107XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhX3VybCA9IGAke2dhY2hhU291cmNlfS9JbmkzX0xvdF8ke2Ake2dhY2hhLmdhY2hhX2luZGV4fWAucGFkU3RhcnQoMiwgXCIwXCIpfS54bWxgO1xuICAgICAgICBnYWNoYV9pdGVtcy5wdXNoKFtkb3dubG9hZChnYWNoYV91cmwpLCBnYWNoYSwgZ2FjaGFfdXJsXSk7XG4gICAgfVxuICAgIHBhcnNlR3VhcmRpYW5EYXRhKGF3YWl0IGd1YXJkaWFuRGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbHlQcm9kdWN0U3RhZ2VEcm9wcyhKU09OLnBhcnNlKGF3YWl0IHByb2R1Y3RTdGFnZURyb3BzRGF0YSkgYXMgUHJvZHVjdFN0YWdlRHJvcHNDYXRhbG9nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgcHJvZHVjdCBzdGFnZSBkcm9wczogJHtlfWApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtpdGVtLCBnYWNoYSwgZ2FjaGFfdXJsXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VHYWNoYURhdGEoYXdhaXQgaXRlbSwgZ2FjaGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBkb3dubG9hZGluZyAke2dhY2hhX3VybH0gYmVjYXVzZSAke2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKiBCYW4vY2lyY2xlLXNsYXNoIGljb24gZm9yIGV4Y2x1ZGUg4oCUIG91dGxpbmUgU1ZHLCByZWNvbG9yZWQgdmlhIGN1cnJlbnRDb2xvci4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV4Y2x1ZGVJY29uKCk6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiaXRlbV9yZW1vdmFsX19pY29uXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIFwiMCAwIDI0IDI0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjE2XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxNlwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJmb2N1c2FibGVcIiwgXCJmYWxzZVwiKTtcblxuICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJjaXJjbGVcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN4XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN5XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInJcIiwgXCI5XCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyXCIpO1xuXG4gICAgY29uc3Qgc2xhc2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwibGluZVwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ4MVwiLCBcIjdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTFcIiwgXCI3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcIngyXCIsIFwiMTdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTJcIiwgXCIxN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMlwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWNhcFwiLCBcInJvdW5kXCIpO1xuXG4gICAgc3ZnLmFwcGVuZChjaXJjbGUsIHNsYXNoKTtcbiAgICByZXR1cm4gc3ZnO1xufVxuXG5mdW5jdGlvbiBkZWxldGFibGVJdGVtKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGV4Y2x1ZGVMYWJlbCA9IGBFeGNsdWRlICR7aXRlbS5uYW1lX2VufSBmcm9tIHJlc3VsdHNgO1xuICAgIGNvbnN0IGV4Y2x1ZGVCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsXCIsXG4gICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpdGVtLmlkfWAsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogZXhjbHVkZUxhYmVsLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIHRpdGxlOiBleGNsdWRlTGFiZWwsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgZXhjbHVkZUJ1dHRvbi5hcHBlbmQoY3JlYXRlRXhjbHVkZUljb24oKSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1pZGVudGl0eVwiIH0sXG4gICAgICAgIGV4Y2x1ZGVCdXR0b24sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlfX21ldGFcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW0sIGNoYXJhY3RlciksXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbSksXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCkge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZGlhbG9nLW9wZW5cIik7XG59XG5cbmZ1bmN0aW9uIHVubG9ja0JhY2tncm91bmRTY3JvbGwoKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkaWFsb2ctb3BlblwiKTtcbn1cblxuZnVuY3Rpb24gc2hvd0RpYWxvZyhcbiAgICB0cmlnZ2VyOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgdG9wRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BfZGl2XCIpO1xuICAgIGlmICghKHRvcERpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXMgPSBkaWFsb2c7XG4gICAgICAgIHByZXZpb3VzLmNsb3NlKCk7XG4gICAgICAgIHByZXZpb3VzLnJlbW92ZSgpO1xuICAgIH1cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogZGlhbG9nQ2xhc3MgPyBgJHtkaWFsb2dDbGFzc31fX2Nsb3NlYCA6IFwiZGlhbG9nX19jbG9zZVwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJDbG9zZVwiLFxuICAgIF0pO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7XG4gICAgICAgIC4uLihkaWFsb2dDbGFzcyA/IHsgY2xhc3M6IGRpYWxvZ0NsYXNzIH0gOiB7fSksXG4gICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICB9O1xuICAgIGRpYWxvZyA9IEFycmF5LmlzQXJyYXkoY29udGVudClcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCBhdHRyaWJ1dGVzLCAuLi5jb250ZW50LCBjbG9zZUJ1dHRvbl0pXG4gICAgICAgIDogY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgY29udGVudCwgY2xvc2VCdXR0b25dKTtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJ0cnVlXCIpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBkaWFsb2c/LmNsb3NlKCkpO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgZGlhbG9nPy5yZW1vdmUoKTtcbiAgICAgICAgZGlhbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICB1bmxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgdG9wRGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcInBvcHVwX2xpbmtcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBcImFyaWEtaGFzcG9wdXBcIjogXCJkaWFsb2dcIixcbiAgICAgICAgICAgIFwiYXJpYS1leHBhbmRlZFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHRleHQsXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coYnV0dG9uLCBgJHt0ZXh0fSBkZXRhaWxzYCwgY29udGVudCwgZGlhbG9nQ2xhc3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdDogc3RyaW5nKTogSFRNTFRhYmxlQ2VsbEVsZW1lbnQge1xuICAgIGNvbnN0IHsgc2hvcnQsIGZ1bGwsIGFiYnJldmlhdGVkIH0gPSBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5KHN0YXQpO1xuICAgIGlmICghYWJicmV2aWF0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1widGhcIiwgeyBjbGFzczogXCJudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIHNob3J0XSk7XG4gICAgfVxuICAgIGNvbnN0IHBvcHVwID0gY3JlYXRlUG9wdXBMaW5rKHNob3J0LCBjcmVhdGVIVE1MKFtcInBcIiwgZnVsbF0pKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBmdWxsKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGZ1bGwpO1xuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoXCJwcmlvcml0eS1zdGF0LWhlYWRlclwiKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0aFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgcG9wdXBdKTtcbn1cblxuZnVuY3Rpb24gcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gMSAmJiBxdWFudGl0eV9tYXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChxdWFudGl0eV9taW4gPT09IHF1YW50aXR5X21heCkge1xuICAgICAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWF4fWA7XG4gICAgfVxuICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9taW59LSR7cXVhbnRpdHlfbWF4fWA7XG59XG5cbi8qKlxuICogR2FjaGEgZHJvcC1kZXRhaWxzIHRhYmxlOiBJdGVtIHwgQ2hhbmNlIHwgRXhwZWN0ZWQgcHVsbHMuXG4gKiBDaGFyYWN0ZXIgaXMgbmV2ZXIgYSBjb2x1bW4g4oCUIGVxdWlwbWVudCBwb29scyBtaXJyb3IgYWNyb3NzIGNoYXJhY3RlcnMsIHNvIGxpc3RpbmdcbiAqIE5pa2kvTHVuTHVuL+KApiBkdXBsaWNhdGVzIHRoZSBzYW1lIHJvd3MuIFdoZW4gbm8gY2hhcmFjdGVyIGZpbHRlciBpcyBzZXQsIHNhbWUtbmFtZVxuICogcm93cyAod2l0aCB0aGUgc2FtZSBxdWFudGl0eSByYW5nZSkgY29sbGFwc2UgdG8gb25lIGVudHJ5IHVzaW5nIHRoZSBmaXJzdCBwb29sIHJhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShcbiAgICBnYWNoYTogR2FjaGEsXG4gICAgaGlnaGxpZ2h0ZWRJdGVtPzogSXRlbSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pO1xuXG4gICAgdHlwZSBSb3cgPSB7XG4gICAgICAgIGl0ZW06IEl0ZW07XG4gICAgICAgIHByb2JhYmlsaXR5OiBudW1iZXI7XG4gICAgICAgIHF1YW50aXR5X21pbjogbnVtYmVyO1xuICAgICAgICBxdWFudGl0eV9tYXg6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgLy8gQ2hhcmFjdGVyIGZpbHRlcjogYWNjdW11bGF0ZSBieSBJdGVtIGlkZW50aXR5IChoaXN0b3JpY2FsIG1hdGgpLlxuICAgIC8vIFVuZmlsdGVyZWQ6IGNvbGxhcHNlIGJ5IGRpc3BsYXkgbmFtZSArIHF1YW50aXR5IHNvIHBlci1jaGFyYWN0ZXIgY2xvbmVzIGFyZSBvbmUgcm93LlxuICAgIGNvbnN0IGJ5SXRlbSA9IGNoYXJhY3RlciA/IG5ldyBNYXA8SXRlbSwgUm93PigpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGJ5TmFtZSA9IGNoYXJhY3RlciA/IHVuZGVmaW5lZCA6IG5ldyBNYXA8c3RyaW5nLCBSb3c+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgLy8gQ2hhcmFjdGVyLWZpbHRlcmVkOiBrZWVwIGhpc3RvcmljYWwgZGVub21pbmF0b3IgKGl0ZW0gY2hhcmFjdGVyLCBlbHNlIGZpbHRlciwgZWxzZSB0b3RhbCkuXG4gICAgICAgICAgICAvLyBVbmZpbHRlcmVkIGNvbGxhcHNlOiByYXRlcyBhcmUgd2l0aGluIGVhY2ggY2hhcmFjdGVyJ3MgcG9vbCAocG9vbHMgbWlycm9yOyBmaXJzdCByb3cgd2lucykuXG4gICAgICAgICAgICAvLyBVc2luZyB0b3RhbF9wcm9iYWJpbGl0eSBmb3Igc2hhcmVkIGl0ZW1zIHdvdWxkIGRpbHV0ZSB+N8OXIGFuZCByZWludHJvZHVjZSB3cm9uZyByYXRlcy5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBnYWNoYS5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXIpIVxuICAgICAgICAgICAgICAgIDogKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1fY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoaXRlbV9jaGFyYWN0ZXIpIVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBnYWNoYS50b3RhbF9wcm9iYWJpbGl0eTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSB0aWNrZXRzIC8gaXRlbV90aWNrZXRzO1xuXG4gICAgICAgICAgICBpZiAoYnlJdGVtKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBieUl0ZW0uZ2V0KGNoYXJfZ2FjaGFfaXRlbSk7XG4gICAgICAgICAgICAgICAgYnlJdGVtLnNldChjaGFyX2dhY2hhX2l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hhcl9nYWNoYV9pdGVtLFxuICAgICAgICAgICAgICAgICAgICBwcm9iYWJpbGl0eTogKHByZXZpb3VzPy5wcm9iYWJpbGl0eSA/PyAwKSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhcl9nYWNoYV9pdGVtLm5hbWVfZW59XFwwJHtxdWFudGl0eV9taW59XFwwJHtxdWFudGl0eV9tYXh9YDtcbiAgICAgICAgICAgIGlmICghYnlOYW1lIS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIGJ5TmFtZSEuc2V0KGtleSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGFyX2dhY2hhX2l0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJvd3MgPSBieUl0ZW0gPyBbLi4uYnlJdGVtLnZhbHVlcygpXSA6IFsuLi5ieU5hbWUhLnZhbHVlcygpXTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWRJdGVtICE9PSB1bmRlZmluZWQgJiYgKFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRJdGVtID09PSByb3cuaXRlbVxuICAgICAgICAgICAgfHwgKFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgJiYgaGlnaGxpZ2h0ZWRJdGVtLm5hbWVfZW4gPT09IHJvdy5pdGVtLm5hbWVfZW5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgW1widGRcIiwgcm93Lml0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocm93LnF1YW50aXR5X21pbiwgcm93LnF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHJvdy5wcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyByb3cucHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbTogSXRlbSB8IHVuZGVmaW5lZCwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLFxuICAgICAgICBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShnYWNoYSwgaXRlbSwgY2hhcmFjdGVyKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBTaG9wSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnRUYWJsZSA9IGNyZWF0ZUhUTUwoW1widGFibGVcIiwgW1widHJcIiwgW1widGhcIiwgXCJDb250ZW50c1wiXV1dKTtcbiAgICBmb3IgKGNvbnN0IGlubmVyX2l0ZW0gb2YgaXRlbVNvdXJjZS5pdGVtcykge1xuICAgICAgICBjb250ZW50VGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiLCBpbm5lcl9pdGVtID09PSBpdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLCBbXCJ0ZFwiLCBpbm5lcl9pdGVtLm5hbWVfZW5dXSkpO1xuICAgIH1cbiAgICAvLyBEaWFsb2cgYXJpYS1sYWJlbCBhbHJlYWR5IGNhcnJpZXMgdGhlIHNldCBuYW1lIOKAlCBvbmx5IHNob3cgdGhlIGNvbnRlbnRzIHRhYmxlLlxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIGNvbnRlbnRUYWJsZSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVCb3NzQXJ0RmlsZShib3NzSWQ6IG51bWJlciwgcmVzSWQ/OiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGJ5SWQgPSBib3NzQXJ0Q2F0YWxvZy5ieUJvc3NJZD8uW2Ake2Jvc3NJZH1gXTtcbiAgICBpZiAoYnlJZCkge1xuICAgICAgICByZXR1cm4gYnlJZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXNJZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gYm9zc0FydENhdGFsb2cuYnlSZXNJZD8uW2Ake3Jlc0lkfWBdO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCb3NzUG9ydHJhaXQocHJvamVjdGlvbjogU3RhZ2VCb3NzUHJvamVjdGlvbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcHJvamVjdGlvbi5ib3NzZXNbMF07XG4gICAgY29uc3QgYm9zc05hbWUgPSBwcmltYXJ5Py5uYW1lID8/IChwcm9qZWN0aW9uLmlzQm9zc1N0YWdlID8gXCJCb3NzXCIgOiBcIkd1YXJkaWFuXCIpO1xuICAgIGNvbnN0IGZpbGUgPSBwcmltYXJ5XG4gICAgICAgID8gcmVzb2x2ZUJvc3NBcnRGaWxlKHByaW1hcnkuaWQsIHByaW1hcnkucmVzSWQpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3BvcnRyYWl0XCIsIFwiZGF0YS1oYXMtYm9zcy1hcnRcIjogXCJ0cnVlXCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcG9ydHJhaXQtaW1hZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgYXNzZXRzL2Jvc3MtYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXG4gICAgICAgICAgICAgICAgICAgIGFsdDogYEJvc3MgYXJ0d29yayBmb3IgJHtib3NzTmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIxMjhcIixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjEyOFwiLFxuICAgICAgICAgICAgICAgICAgICBkZWNvZGluZzogXCJhc3luY1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19wb3J0cmFpdCBzdGFnZS1kZXRhaWxzX19wb3J0cmFpdC0tZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYEJvc3MgYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtib3NzTmFtZX1gLFxuICAgICAgICAgICAgXCJkYXRhLWhhcy1ib3NzLWFydFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGJvc3NOYW1lLnNsaWNlKDAsIDEpLnRvVXBwZXJDYXNlKCldLFxuICAgIF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmUgdGhlIEdhY2hhIGJlaGluZCBhIHNob3AgcHJvZHVjdCBJdGVtIChzdGFnZSByZXdhcmRzIGFyZSBzaG9wX2l0ZW1zIGVudHJpZXMpLlxuICogTG90dGVyeSBpdGVtcyB1c2VkIHRvIGxlYXZlIGl0ZW0uaWQgYXQgMCDigJQgc3RpbGwgc3VwcG9ydCByZXZlcnNlIGxvb2t1cCBmb3IgdGhvc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kR2FjaGFGb3JTaG9wSXRlbShpdGVtOiBJdGVtKTogR2FjaGEgfCB1bmRlZmluZWQge1xuICAgIGlmIChpdGVtLmlkICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IGJ5SWQgPSBnYWNoYXMuZ2V0KGl0ZW0uaWQpO1xuICAgICAgICBpZiAoYnlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ5SWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBbc2hvcEluZGV4LCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGlmIChzaG9wX2l0ZW1zLmdldChzaG9wSW5kZXgpID09PSBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2FjaGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBnYWNoYSBvZiBnYWNoYXMudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKGdhY2hhLm5hbWUgPT09IGl0ZW0ubmFtZV9lbikge1xuICAgICAgICAgICAgcmV0dXJuIGdhY2hhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV3YXJkIHRpbGUgYXJ0OiBnYWNoYSBjb2lucyB1c2UgdGhlIHNhbWUgbG90dGVyeSBzcHJpdGUgYXMgdGhlIHJlc3VsdHMgdGFibGVcbiAqIChgY3JlYXRlR2FjaGFDb2luQXJ0YCkuIEVxdWlwbWVudCB1c2VzIEl0ZW1fUGFydHMgc2hlZXQgY2VsbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZVJld2FyZEFydChpdGVtOiBJdGVtKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBmaW5kR2FjaGFGb3JTaG9wSXRlbShpdGVtKTtcbiAgICBpZiAoZ2FjaGEpIHtcbiAgICAgICAgLy8gU2FtZSBwYXRoIGFzIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSAvIGdhY2hhIHRhYmxlIGNvbHVtbi5cbiAgICAgICAgY29uc3QgY29pbiA9IGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSk7XG4gICAgICAgIC8vIEtlZXAgcmV3YXJkLXJvdyBzaXppbmcgaG9va3Mgd2l0aG91dCBsb3NpbmcgdGhlIGNpcmN1bGFyIGNvaW4gbG9vay5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHR5cGVvZiBjb2luLmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIiA/IGNvaW4uY2xhc3NOYW1lIDogXCJcIjtcbiAgICAgICAgaWYgKCFjbGFzc2VzLnNwbGl0KC9cXHMrLykuaW5jbHVkZXMoXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0XCIpKSB7XG4gICAgICAgICAgICBjb2luLmNsYXNzTmFtZSA9IGAke2NsYXNzZXN9IHN0YWdlLWRldGFpbHNfX3Jld2FyZC1hcnQgc3RhZ2UtZGV0YWlsc19fcmV3YXJkLWFydC0tY29pbmAudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2luO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSXRlbUFydChpdGVtLCA0MCwgXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0XCIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdGFnZUJvc3NMaXN0KHByb2plY3Rpb246IFN0YWdlQm9zc1Byb2plY3Rpb24pIHtcbiAgICBpZiAocHJvamVjdGlvbi5ib3NzTmFtZXMubGVuZ3RoID09PSAwICYmIHByb2plY3Rpb24uc2lkZUd1YXJkaWFuTmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGJvc3NJdGVtcyA9IHByb2plY3Rpb24uYm9zc2VzLm1hcCgoYm9zcykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gcmVzb2x2ZUJvc3NBcnRGaWxlKGJvc3MuaWQsIGJvc3MucmVzSWQpO1xuICAgICAgICBjb25zdCB0aHVtYiA9IGZpbGVcbiAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2Jvc3MtdGh1bWJcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgYXNzZXRzL2Jvc3MtYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXG4gICAgICAgICAgICAgICAgICAgIGFsdDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiNDBcIixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjQwXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlY29kaW5nOiBcImFzeW5jXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy10aHVtYiBzdGFnZS1kZXRhaWxzX19ib3NzLXRodW1iLS1mYWxsYmFja1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sXG4gICAgICAgICAgICAgICAgYm9zcy5uYW1lLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy1pdGVtIHN0YWdlLWRldGFpbHNfX2Jvc3MtaXRlbS0tcHJpbWFyeVwiIH0sXG4gICAgICAgICAgICB0aHVtYixcbiAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLXJvbGVcIiB9LCBcIkJvc3NcIl0sXG4gICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy1uYW1lXCIgfSwgYm9zcy5uYW1lXSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgLy8gR3VhcmRpYW5zTGVmdC9SaWdodC9NaWRkbGUgYXJlIGEgc3Bhd24gKnBvb2wqIOKAlCBvbmUgbGVmdCArIG9uZSByaWdodCBhdCBmaWdodCB0aW1lLlxuICAgIGNvbnN0IHNpZGVOb3RlID0gcHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGggPiAwXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2xcIiB9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLWxhYmVsXCIgfSxcbiAgICAgICAgICAgICAgICBgU2lkZSBjb21wYW5pb25zIChwb29sIG9mICR7cHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGh9KWAsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLW5hbWVzXCIgfSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmpvaW4oXCIgwrcgXCIpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NpZGUtcG9vbC1oaW50XCIgfSxcbiAgICAgICAgICAgICAgICBcIk9uZSBsZWZ0IGFuZCBvbmUgcmlnaHQgc3Bhd24gd2l0aCB0aGUgYm9zczsgdGhlIHJlc3QgYXJlIHBvc3NpYmxlIGRyYXdzLlwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwic3RhZ2UtZGV0YWlscy1ib3NzZXNcIiB9LFxuICAgICAgICBbXG4gICAgICAgICAgICBcImgzXCIsXG4gICAgICAgICAgICB7IGlkOiBcInN0YWdlLWRldGFpbHMtYm9zc2VzXCIgfSxcbiAgICAgICAgICAgIHByb2plY3Rpb24uYm9zc05hbWVzLmxlbmd0aCA+IDEgPyBcIkJvc3Nlc1wiIDogXCJCb3NzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zc2VzXCIgfSxcbiAgICAgICAgICAgIC4uLmJvc3NJdGVtcyxcbiAgICAgICAgXSxcbiAgICBdKTtcbiAgICBpZiAoc2lkZU5vdGUpIHtcbiAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChzaWRlTm90ZSk7XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG4vKipcbiAqIFN0YWdlIGRvc3NpZXIgZm9yIEd1YXJkaWFuIC8gQm9zcyBtYXAgY2hpcHM6IGJvc3MgcG9ydHJhaXQsIEpGVFNFIGJvc3MgbmFtZXMsXG4gKiByZWFkYWJsZSBmYWN0cywgYW5kIHJld2FyZCBsaXN0IHdpdGggdGhlIHNhbWUgYXJ0IGFzIHRoZSByZXN1bHRzIHRhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhZ2VEZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBpc0Jvc3MgPSBpdGVtU291cmNlLm5lZWRfYm9zcztcbiAgICBjb25zdCB0aXRsZSA9IHN0YWdlVGl0bGVOYW1lKGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwKTtcbiAgICBjb25zdCBleWVicm93ID0gaXNCb3NzID8gXCJCb3NzIHN0YWdlXCIgOiBcIkd1YXJkaWFuIHN0YWdlXCI7XG4gICAgY29uc3QgYm9zc1Byb2plY3Rpb24gPSBwcm9qZWN0U3RhZ2VCb3NzZXMoXG4gICAgICAgIGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICBpc0Jvc3MsXG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2csXG4gICAgKTtcbiAgICBjb25zdCByZXdhcmRzID0gaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPiAwXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZHNcIiB9LFxuICAgICAgICAgICAgLi4uaXRlbVNvdXJjZS5pdGVtcy5tYXAoKHJld2FyZCkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHJld2FyZCA9PT0gaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInN0YWdlLWRldGFpbHNfX3Jld2FyZCBzdGFnZS1kZXRhaWxzX19yZXdhcmQtLWN1cnJlbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlU3RhZ2VSZXdhcmRBcnQocmV3YXJkKSxcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkLW5hbWVcIiB9LCByZXdhcmQubmFtZV9lbl0sXG4gICAgICAgICAgICAgICAgLi4uKHJld2FyZCA9PT0gaXRlbVxuICAgICAgICAgICAgICAgICAgICA/IFtjcmVhdGVIVE1MKFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYmFkZ2VcIiB9LCBcIlRoaXMgaXRlbVwiXSldXG4gICAgICAgICAgICAgICAgICAgIDogW10pLFxuICAgICAgICAgICAgXSkpLFxuICAgICAgICBdKVxuICAgICAgICA6IGNyZWF0ZUhUTUwoW1wicFwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBsaXN0ZWQgcmV3YXJkcyBmb3IgdGhpcyBzdGFnZS5cIl0pO1xuXG4gICAgY29uc3QgYm9zc1NlY3Rpb24gPSBjcmVhdGVTdGFnZUJvc3NMaXN0KGJvc3NQcm9qZWN0aW9uKTtcblxuICAgIGNvbnN0IGlkZW50aXR5ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19faWRlbnRpdHlcIiB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fZXllYnJvd1wiIH0sIGV5ZWJyb3ddLFxuICAgICAgICBbXCJoMlwiLCB0aXRsZV0sXG4gICAgXSk7XG5cbiAgICBjb25zdCBoZWFkZXIgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJoZWFkZXJcIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19oZWFkZXJcIiB9LFxuICAgICAgICBjcmVhdGVCb3NzUG9ydHJhaXQoYm9zc1Byb2plY3Rpb24pLFxuICAgICAgICBpZGVudGl0eSxcbiAgICBdKTtcblxuICAgIGNvbnN0IGFydGljbGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJhcnRpY2xlXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBpc0Jvc3NcbiAgICAgICAgICAgICAgICA/IFwic3RhZ2UtZGV0YWlscyBzdGFnZS1kZXRhaWxzLS1ib3NzXCJcbiAgICAgICAgICAgICAgICA6IFwic3RhZ2UtZGV0YWlscyBzdGFnZS1kZXRhaWxzLS1ndWFyZGlhblwiLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXIsXG4gICAgXSk7XG4gICAgaWYgKGJvc3NTZWN0aW9uKSB7XG4gICAgICAgIGFydGljbGUuYXBwZW5kQ2hpbGQoYm9zc1NlY3Rpb24pO1xuICAgIH1cbiAgICBhcnRpY2xlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwic3RhZ2UtZGV0YWlscy1yZXdhcmRzXCIgfSxcbiAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJzdGFnZS1kZXRhaWxzLXJld2FyZHNcIiB9LCBcIlJld2FyZHNcIl0sXG4gICAgICAgIHJld2FyZHMsXG4gICAgXSkpO1xuICAgIHJldHVybiBhcnRpY2xlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IG1hcExhYmVsID0gc3RhZ2VDaGFubmVsTGFiZWwoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGl0ZW1Tb3VyY2UubmVlZF9ib3NzKTtcbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKFxuICAgICAgICBtYXBMYWJlbCxcbiAgICAgICAgY3JlYXRlU3RhZ2VEZXRhaWxzQ29udGVudChpdGVtLCBpdGVtU291cmNlKSxcbiAgICAgICAgXCJzdGFnZS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoXG4gICAgaXRlbTogSXRlbSxcbiAgICBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIHJldHVybiBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgLm1hcChpdGVtU291cmNlID0+IHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW0sIGl0ZW1Tb3VyY2UsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50Q2xhc3NUb2tlbnMoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgLy8gUHJlZmVyIGNsYXNzTmFtZSBvdmVyIGNsYXNzTGlzdCDigJQgdGhlIHVuaXQgRE9NIGhhcm5lc3Mgc2V0cyBjbGFzc05hbWUgdmlhXG4gICAgLy8gc2V0QXR0cmlidXRlKFwiY2xhc3NcIikgYW5kIGRvZXMgbm90IGltcGxlbWVudCBhIGZ1bGwgY2xhc3NMaXN0LlxuICAgIGNvbnN0IHJhdyA9IHR5cGVvZiBlbGVtZW50LmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgICA/IGVsZW1lbnQuY2xhc3NOYW1lXG4gICAgICAgIDogZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiO1xuICAgIHJldHVybiByYXcuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIGlzR2FjaGFTb3VyY2VHcm91cChlbGVtZW50czogcmVhZG9ubHkgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLnNvbWUoXG4gICAgICAgIChlbGVtZW50KSA9PlxuICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQgIT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICYmIGVsZW1lbnRDbGFzc1Rva2VucyhlbGVtZW50KS5pbmNsdWRlcyhcImdhY2hhLXNvdXJjZS1zdW1tYXJ5XCIpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1ha2VTb3VyY2VzTGlzdChsaXN0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW11bXSk6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgY29uc3QgcmVzdWx0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gPSBbXTtcbiAgICBmdW5jdGlvbiBhZGQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID0gcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSArIGVsZW1lbnQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XG4gICAgfVxuICAgIGxldCBwcmV2aW91c0dyb3VwOiByZWFkb25seSAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gfCB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBlbGVtZW50cyBvZiBsaXN0KSB7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFkZChcIiBcIik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb21tYSBiZXR3ZWVuIHNob3Avc2V0L2d1YXJkaWFuIHBhdGhzIHNvIGR1YWwgcHJpY2VzIHN0YXkgbGVnaWJsZVxuICAgICAgICAvLyAoXCI1MDAwMCBHb2xkLCBTdXBwb3J0ZXIgU2V0IDM1MDAwMCBHb2xkXCIpLiBOZXZlciBuZXh0IHRvIGdhY2hhIGNvaW4gY2FyZHMg4oCUXG4gICAgICAgIC8vIHRob3NlIGFyZSBibG9jayBzdW1tYXJpZXMgYW5kIGEgdGV4dCBjb21tYSBiZWNvbWVzIGEgdmlzdWFsIGJyZWFrLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwcmV2aW91c0dyb3VwICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAocHJldmlvdXNHcm91cClcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAoZWxlbWVudHMpXG4gICAgICAgICkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXNHcm91cCA9IGVsZW1lbnRzO1xuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpOiBib29sZWFuIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlIHx8IGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldChpdGVtU291cmNlLnNob3BfaWQpO1xuICAgICAgICBpZiAoZ2FjaGE/LmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlICE9PSBpdGVtU291cmNlICYmIGlzQXZhaWxhYmxlSXRlbVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICBpZiAoaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUF2YWlsYWJpbGl0eUJhZGdlKGl0ZW06IEl0ZW0pIHtcbiAgICBpZiAoaXNJdGVtQ3VycmVudGx5QXZhaWxhYmxlKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWF2YWlsYWJpbGl0eSBpdGVtLWF2YWlsYWJpbGl0eS0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vIGVuYWJsZWQgc2hvcCwgZ2FjaGEsIG9yIEd1YXJkaWFuIHBhdGggaW4gdGhlIGxpdmUgc2hvcCBkYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiTm90IGluIGdhbWVcIixcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY29sbGVjdEdhY2hhU291cmNlSW5wdXRzKGNvaW46IEl0ZW0gfCB1bmRlZmluZWQpOiBHYWNoYVNvdXJjZUlucHV0W10ge1xuICAgIGlmICghY29pbikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGlucHV0czogR2FjaGFTb3VyY2VJbnB1dFtdID0gW107XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgY29pbi5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goeyBraW5kOiBcInNob3BcIiwgYXA6IHNvdXJjZS5hcCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICAgICAgbWFwOiBzb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICAgICAgICAgIG5lZWRCb3NzOiBzb3VyY2UubmVlZF9ib3NzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlucHV0cztcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTaG9wQ2hhbm5lbExhYmVsKFxuICAgIGN1cnJlbmN5OiBcIkdvbGRcIiB8IFwiQVBcIixcbiAgICBhdmFpbGFibGU6IGJvb2xlYW4sXG4gICAgcmVhc29uPzogXCJub3RfZm9yX3NhbGVcIiB8IFwibm90X2F2YWlsYWJsZVwiLFxuKTogSFRNTEVsZW1lbnQge1xuICAgIGlmIChhdmFpbGFibGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbmN5ID09PSBcIkFQXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1hcFwiIH0sXG4gICAgICAgICAgICAgICAgXCJBUFwiLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1nb2xkXCIgfSxcbiAgICAgICAgICAgIFwiR29sZFwiLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgaWYgKHJlYXNvbiA9PT0gXCJub3RfZm9yX3NhbGVcIikge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWZvci1zYWxlXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBwcm9kdWN0IGlzIGxpc3RlZCBpbiB0aGUgc2hvcCBjYXRhbG9nIGJ1dCBjYW5ub3QgYmUgcHVyY2hhc2VkIChOb2J1eSlgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiTm90IGZvciBzYWxlXCIsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBjb2luIGlzIG5vdCBjdXJyZW50bHkgc29sZCBpbiB0aGUgbGl2ZSBzaG9wYCxcbiAgICAgICAgfSxcbiAgICAgICAgYCR7Y3VycmVuY3l9IMK3IE5vdCBhdmFpbGFibGVgLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVN0YWdlQ2hhbm5lbExhYmVsKFxuICAgIGNvaW46IEl0ZW0gfCB1bmRlZmluZWQsXG4gICAgbWFwOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgbGFiZWw6IHN0cmluZyxcbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IGNvaW4/LnNvdXJjZXMuZmluZChcbiAgICAgICAgKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT5cbiAgICAgICAgICAgIHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSAmJiBzb3VyY2UuZ3VhcmRpYW5fbWFwID09PSBtYXAsXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsQ2xhc3MgPSBuZWVkQm9zc1xuICAgICAgICA/IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIlxuICAgICAgICA6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCI7XG4gICAgaWYgKGd1YXJkaWFuU291cmNlICYmIGNvaW4pIHtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBjcmVhdGVHdWFyZGlhblBvcHVwKGNvaW4sIGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBwb3B1cC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcInBvcHVwX2xpbmtcIjtcbiAgICAgICAgcG9wdXAuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYCR7ZXhpc3Rpbmd9ICR7Y2hhbm5lbENsYXNzfWApO1xuICAgICAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGxhYmVsKTtcbiAgICAgICAgcmV0dXJuIHBvcHVwO1xuICAgIH1cbiAgICBpZiAobmVlZEJvc3MpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYEJvc3Mgc3RhZ2UgZHJvcDogJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKX1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCIsXG4gICAgICAgICAgICB0aXRsZTogYEd1YXJkaWFuIHN0YWdlIGRyb3A6ICR7cHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCl9YCxcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWwsXG4gICAgXSk7XG59XG5cbi8qKiBLZXB0IGZvciBjb250cmFjdHMgdGhhdCBwaW4gdGhlIGhlbHBlciBuYW1lOyByZXR1cm5zIHNob3AgKyBzdGFnZSBjaGFubmVsIGNoaXBzLiAqL1xuZnVuY3Rpb24gY3JlYXRlR2FjaGFDdXJyZW5jeUxhYmVsKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBjaGFubmVscyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIGlmIChjaGFubmVscy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5uZWxzWzBdITtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAgeyBjbGFzczogXCJnYWNoYS1hY3F1aXNpdGlvbi1jaGFubmVsc1wiIH0sXG4gICAgICAgIC4uLmNoYW5uZWxzLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbEVsZW1lbnRzKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNvaW4gPSBzaG9wX2l0ZW1zLmdldChnYWNoYS5zaG9wX2luZGV4KTtcbiAgICBjb25zdCBwcm9qZWN0ZWQgPSBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzKFxuICAgICAgICB7XG4gICAgICAgICAgICBhcDogZ2FjaGEuYXAsXG4gICAgICAgICAgICBlbmFibGVkOiBnYWNoYS5lbmFibGVkLFxuICAgICAgICAgICAgcHVyY2hhc2FibGU6IGdhY2hhLnB1cmNoYXNhYmxlLFxuICAgICAgICB9LFxuICAgICAgICBjb2xsZWN0R2FjaGFTb3VyY2VJbnB1dHMoY29pbiksXG4gICAgKTtcbiAgICByZXR1cm4gcHJvamVjdGVkLm1hcCgoY2hhbm5lbCkgPT4ge1xuICAgICAgICBpZiAoY2hhbm5lbC5raW5kID09PSBcInNob3BcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUdhY2hhU2hvcENoYW5uZWxMYWJlbChcbiAgICAgICAgICAgICAgICBjaGFubmVsLmN1cnJlbmN5LFxuICAgICAgICAgICAgICAgIGNoYW5uZWwuYXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIGNoYW5uZWwucmVhc29uLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlR2FjaGFTdGFnZUNoYW5uZWxMYWJlbChcbiAgICAgICAgICAgIGNvaW4sXG4gICAgICAgICAgICBjaGFubmVsLm1hcCxcbiAgICAgICAgICAgIGNoYW5uZWwubmVlZEJvc3MsXG4gICAgICAgICAgICBjaGFubmVsLmxhYmVsLFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoXG4gICAgaXRlbTogSXRlbSB8IHVuZGVmaW5lZCxcbiAgICBpdGVtU291cmNlOiBHYWNoYUl0ZW1Tb3VyY2UsXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyLFxuKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGNoYW5uZWxFbGVtZW50cyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIixcbiAgICAgICAgICAgIHJvbGU6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBhY3F1aXNpdGlvbmAsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSksXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5X19jb250ZW50XCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtaWRlbnRpdHlcIiB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbiA/IHVuZGVmaW5lZCA6IGNoYXJhY3RlcixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtYWNxdWlzaXRpb24tY2hhbm5lbHNcIixcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBzb3VyY2VzYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLmNoYW5uZWxFbGVtZW50cy5tYXAoKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcImdhY2hhLWFjcXVpc2l0aW9uLWNoYW5uZWxzX19pdGVtXCIsIHJvbGU6IFwibGlzdGl0ZW1cIiB9LCBlbGVtZW50XSksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UsIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoaXRlbSwgaXRlbVNvdXJjZSwgY2hhcmFjdGVyKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICBpZiAoaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBbYCR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGNyZWF0ZVNldFNvdXJjZVBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UpLFxuICAgICAgICAgICAgYCAke2l0ZW1Tb3VyY2UucHJpY2V9ICR7aXRlbVNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwifWBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSldO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgSXRlbURldGFpbFN0YXQgPSB7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBiYXNlOiBudW1iZXI7XG4gICAgZW5jaGFudGVkPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGl0ZW1EZXRhaWxTdGF0cyhpdGVtOiBJdGVtKTogSXRlbURldGFpbFN0YXRbXSB7XG4gICAgY29uc3QgY2hhcmFjdGVyU3RhdHMgPSBbXG4gICAgICAgIHsgbGFiZWw6IFwiU3RyZW5ndGhcIiwgYmFzZTogaXRlbS5zdHIsIGVuY2hhbnRlZDogaXRlbS5tYXhfc3RyIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiRGV4dGVyaXR5XCIsIGJhc2U6IGl0ZW0uZGV4LCBlbmNoYW50ZWQ6IGl0ZW0ubWF4X2RleCB9LFxuICAgICAgICB7IGxhYmVsOiBcIlN0YW1pbmFcIiwgYmFzZTogaXRlbS5zdGEsIGVuY2hhbnRlZDogaXRlbS5tYXhfc3RhIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiV2lsbFwiLCBiYXNlOiBpdGVtLndpbCwgZW5jaGFudGVkOiBpdGVtLm1heF93aWwgfSxcbiAgICBdO1xuICAgIGNvbnN0IGZpeGVkU3RhdHMgPSBbXG4gICAgICAgIHsgbGFiZWw6IFwiTW92ZW1lbnRcIiwgYmFzZTogaXRlbS5tb3ZlbWVudCB9LFxuICAgICAgICB7IGxhYmVsOiBcIkNoYXJnZVwiLCBiYXNlOiBpdGVtLmNoYXJnZSB9LFxuICAgICAgICB7IGxhYmVsOiBcIkxvYlwiLCBiYXNlOiBpdGVtLmxvYiB9LFxuICAgICAgICB7IGxhYmVsOiBcIlNtYXNoXCIsIGJhc2U6IGl0ZW0uc21hc2ggfSxcbiAgICAgICAgeyBsYWJlbDogXCJTZXJ2ZVwiLCBiYXNlOiBpdGVtLnNlcnZlIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiSFBcIiwgYmFzZTogaXRlbS5ocCB9LFxuICAgICAgICB7IGxhYmVsOiBcIlF1aWNrc2xvdHNcIiwgYmFzZTogaXRlbS5xdWlja3Nsb3RzIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiQnVmZnNsb3RzXCIsIGJhc2U6IGl0ZW0uYnVmZnNsb3RzIH0sXG4gICAgXTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmNoYXJhY3RlclN0YXRzXG4gICAgICAgICAgICAuZmlsdGVyKHN0YXQgPT4gc3RhdC5iYXNlICE9PSAwIHx8IChpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgJiYgc3RhdC5lbmNoYW50ZWQgIT09IDApKVxuICAgICAgICAgICAgLm1hcCgoeyBsYWJlbCwgYmFzZSwgZW5jaGFudGVkIH0pID0+XG4gICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlID8geyBsYWJlbCwgYmFzZSwgZW5jaGFudGVkIH0gOiB7IGxhYmVsLCBiYXNlIH1cbiAgICAgICAgICAgICksXG4gICAgICAgIC4uLmZpeGVkU3RhdHMuZmlsdGVyKHN0YXQgPT4gc3RhdC5iYXNlICE9PSAwKSxcbiAgICBdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBpdGVtRGV0YWlsU3RhdHMoaXRlbSk7XG4gICAgY29uc3Qgc291cmNlcyA9IG1ha2VTb3VyY2VzTGlzdChcbiAgICAgICAgaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCAoKSA9PiB0cnVlLCBjaGFyYWN0ZXIpLFxuICAgICk7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc1wiIH0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiaGVhZGVyXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19faGVhZGVyXCIgfSxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1BcnQoaXRlbSwgNzIsIFwiaXRlbS1kZXRhaWxzX19hcnRcIiksXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19leWVicm93XCIgfSwgXCJFcXVpcG1lbnQgZGV0YWlsc1wiXSxcbiAgICAgICAgICAgICAgICBbXCJoMlwiLCBpdGVtLm5hbWVfZW5dLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19tZXRhXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7Y2hhcmFjdGVyID8/IGl0ZW0uY2hhcmFjdGVyID8/IFwiQWxsIGNoYXJhY3RlcnNcIn0gwrcgJHtpdGVtLnBhcnR9IMK3IExldmVsICR7aXRlbS5sZXZlbH1gLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXN0YXRzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXN0YXRzXCIgfSwgXCJTdGF0c1wiXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHMtbm90ZVwiIH0sXG4gICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlXG4gICAgICAgICAgICAgICAgICAgID8gXCJDaGFyYWN0ZXIgc3RhdHMgc2hvdyBiYXNlIGFuZCBmdWxseSBlbmNoYW50ZWQgdmFsdWVzLlwiXG4gICAgICAgICAgICAgICAgICAgIDogXCJUaGlzIGl0ZW0gaGFzIGJhc2Ugc3RhdHMgb25seS5cIixcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkbFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0cy5tYXAoKHsgbGFiZWwsIGJhc2UsIGVuY2hhbnRlZCB9KSA9PiBlbmNoYW50ZWQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcImR0XCIsIGxhYmVsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJkZFwiLCBgJHtiYXNlfWBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tc3RhdC1jb21wYXJpc29uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtsYWJlbH06IGJhc2UgJHtiYXNlfSwgZW5jaGFudGVkICR7ZW5jaGFudGVkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJkdFwiLCBsYWJlbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLXN0YXQtY29tcGFyaXNvbl9fdmFsdWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic21hbGxcIiwgXCJCYXNlXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wic3Ryb25nXCIsIGAke2Jhc2V9YF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLXN0YXQtY29tcGFyaXNvbl9fYXJyb3dcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCLihpJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tc3RhdC1jb21wYXJpc29uX192YWx1ZSBpdGVtLXN0YXQtY29tcGFyaXNvbl9fdmFsdWUtLWVuY2hhbnRlZFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJzbWFsbFwiLCBcIkVuY2hhbnRlZFwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInN0cm9uZ1wiLCBgJHtlbmNoYW50ZWR9YF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXCJwXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sIFwiTm8gc3RhdCBib251c2VzXCJdKSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zb3VyY2VzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LCBcIkhvdyB0byBnZXQgaXRcIl0sXG4gICAgICAgICAgICBzb3VyY2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1wiZGl2XCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zb3VyY2VzXCIgfSwgLi4uc291cmNlc10pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gYWN0aXZlIGFjcXVpc2l0aW9uIHNvdXJjZSBmb3VuZC5cIixcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWRldGFpbHMtdHJpZ2dlclwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIFwiYXJpYS1oYXNwb3B1cFwiOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgVmlldyBkZXRhaWxzIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coXG4gICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICBgJHtpdGVtLm5hbWVfZW59IGl0ZW0gZGV0YWlsc2AsXG4gICAgICAgICAgICBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbSwgY2hhcmFjdGVyKSxcbiAgICAgICAgICAgIFwiaXRlbS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtOiBJdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE9mZmljaWFsIGl0ZW0gYXJ0IHVuYXZhaWxhYmxlIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tfX2NvZGVcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBpdGVtLnBhcnQgfHwgXCJJdGVtXCJdLFxuICAgICAgICBbXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBcIk9mZmljaWFsIGFydCB1bmF2YWlsYWJsZVwiXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3ByaXRlQXJ0KFxuICAgIHNoZWV0OiBzdHJpbmcsXG4gICAgY2VsbDogbnVtYmVyLFxuICAgIGxhYmVsOiBzdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbikge1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gaXRlbUFydE1hcC5zaGVldHNbc2hlZXRdO1xuICAgIGlmICghZ2VvbWV0cnkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjb2x1bW4gPSBjZWxsICUgZ2VvbWV0cnkubGluZUNvdW50O1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoY2VsbCAvIGdlb21ldHJ5LmxpbmVDb3VudCk7XG4gICAgY29uc3Qgc2NhbGUgPSBkaXNwbGF5U2l6ZSAvIGdlb21ldHJ5LnNpemU7XG4gICAgY29uc3QgaW1hZ2VTaXplID0gZ2VvbWV0cnkud2lkdGggKiBzY2FsZTtcbiAgICBjb25zdCBvZmZzZXRYID0gLShnZW9tZXRyeS5zcGFjZSArIGNvbHVtbiAqIChnZW9tZXRyeS5zaXplICsgZ2VvbWV0cnkuc3BhY2UpKSAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFkgPSAtKGdlb21ldHJ5LnNwYWNlICsgcm93ICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgICAgICAgICBzdHlsZTogW1xuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LWltYWdlOnVybChcImFzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbiAgICBjbGFzc05hbWUgPSBcIml0ZW0tYXJ0LXRodW1ibmFpbFwiLFxuKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydFswXSxcbiAgICAgICAgYXJ0WzFdLFxuICAgICAgICBgT2ZmaWNpYWwgaXRlbSBhcnQgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgZGlzcGxheVNpemUsXG4gICAgKSA/PyBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYTogR2FjaGEpIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLmxvdHRlcmllc1tgJHtnYWNoYS5nYWNoYV9pbmRleH1gXTtcbiAgICBjb25zdCBmYWxsYmFjayA9ICgpID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtY29pbi1hcnQgZ2FjaGEtY29pbi1hcnQtLXVuYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYENvaW4gYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI/XCIsXG4gICAgICAgIF0pO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaygpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnQuc2hlZXQsXG4gICAgICAgIGFydC5jZWxsLFxuICAgICAgICBgJHtnYWNoYS5uYW1lfSBjb2luIGFydHdvcmtgLFxuICAgICAgICBcImdhY2hhLWNvaW4tYXJ0XCIsXG4gICAgKSA/PyBmYWxsYmFjaygpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UYWJsZVJvdyhpdGVtOiBJdGVtLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlUm93RWxlbWVudCB7XG4gICAgY29uc3Qgcm93ID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widHJcIiwgeyBjbGFzczogXCJyZXN1bHQtcm93XCIgfSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gcmVzdWx0LXN1bW1hcnlcIiwgXCJkYXRhLWxhYmVsXCI6IFwiSXRlbVwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbSwgY2hhcmFjdGVyKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQXJ0XCIgfSwgY3JlYXRlSXRlbUFydChpdGVtKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQ2hhcmFjdGVyXCIgfSwgaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGxcIl0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlBhcnRcIiB9LCBpdGVtLnBhcnRdLFxuICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5tYXAocyA9PiBpdGVtLnN0YXRGcm9tU3RyaW5nKHMpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IHN0YXQsIFwiZGF0YS12YWx1ZVwiOiB2YWx1ZSB9LCB2YWx1ZV0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkxldmVsXCIsIFwiZGF0YS12YWx1ZVwiOiBgJHtpdGVtLmxldmVsfWAgfSwgYCR7aXRlbS5sZXZlbH1gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJTb3VyY2VcIiB9LCAuLi5tYWtlU291cmNlc0xpc3QoaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgcmV0dXJuIHJvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhY2hhVGFibGUoZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbiwgY2hhcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJHYWNoYSBjb2lucyBieSBzaG9wIGN1cnJlbmN5IGFuZCBzdGFnZSBzb3VyY2VzXCJdLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJHYWNoYVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSh1bmRlZmluZWQsIG5ldyBHYWNoYUl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCksIGNoYXIpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdWx0c1RhYmxlKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IChpdGVtczogSXRlbVtdLCBpdGVtOiBJdGVtKSA9PiBJdGVtW10sXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgcmVzdWx0czogeyBba2V5OiBzdHJpbmddOiBJdGVtW10gfSA9IHtcbiAgICAgICAgXCJIYXRcIjogW10sXG4gICAgICAgIFwiSGFpclwiOiBbXSxcbiAgICAgICAgXCJEeWVcIjogW10sXG4gICAgICAgIFwiVXBwZXJcIjogW10sXG4gICAgICAgIFwiTG93ZXJcIjogW10sXG4gICAgICAgIFwiU2hvZXNcIjogW10sXG4gICAgICAgIFwiU29ja3NcIjogW10sXG4gICAgICAgIFwiSGFuZFwiOiBbXSxcbiAgICAgICAgXCJCYWNrcGFja1wiOiBbXSxcbiAgICAgICAgXCJGYWNlXCI6IFtdLFxuICAgICAgICBcIlJhY2tldFwiOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAoZmlsdGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHRzW2l0ZW0ucGFydF0gPSBwcmlvcml6ZXIocmVzdWx0c1tpdGVtLnBhcnRdLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJNYXRjaGluZyBlcXVpcG1lbnQgYnkgc2xvdCBhbmQgc2VsZWN0ZWQgc3RhdCBwcmlvcml0eVwiXSxcbiAgICAgICAgICAgIFtcInRoZWFkXCIsXG4gICAgICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiUGFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoKHN0YXQpID0+IGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdCkpLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiTGV2ZWxcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlNvdXJjZVwiXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcInRib2R5XCJdLFxuICAgICAgICBdXG4gICAgKTtcbiAgICBjb25zdCB0YWJsZUJvZHkgPSB0YWJsZS50Qm9kaWVzWzBdO1xuICAgIGlmICghdGFibGVCb2R5KSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB0eXBlIE1hcE9wdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH07XG5cbiAgICB0eXBlIENvc3QgPSB7XG4gICAgICAgIGdvbGQ6IG51bWJlcixcbiAgICAgICAgYXA6IG51bWJlcixcbiAgICAgICAgbWFwczogTWFwT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY29tYmluZU1hcHMobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHJlc3VsdFttYXBdLmNvbmNhdCh0cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZUNvc3RzKGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCArIGNvc3QyLmdvbGQsXG4gICAgICAgICAgICBhcDogY29zdDEuYXAgKyBjb3N0Mi5hcCxcbiAgICAgICAgICAgIG1hcHM6IGNvbWJpbmVNYXBzKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbk1hcChtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmICh0cmllcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IFtNYXRoLm1pbihyZXN1bHRbbWFwXVswXSwgdHJpZXNbMF0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5Db3N0KGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICAvLyBMZXhpY29ncmFwaGljIG9uIChhcCwgZ29sZCk6IGxvd2VyIEFQIHdpbnMsIHRoZW4gbG93ZXIgR29sZC5cbiAgICAgICAgLy8gTnVtZXJpYyBjb21wYXJlIG9ubHkg4oCUIGRvIG5vdCB1c2UgSlMgYXJyYXkvc3RyaW5nIG9yZGVyaW5nLlxuICAgICAgICBjb25zdCBwaWNrQ29zdDEgPVxuICAgICAgICAgICAgY29zdDEuYXAgPCBjb3N0Mi5hcCB8fFxuICAgICAgICAgICAgKGNvc3QxLmFwID09PSBjb3N0Mi5hcCAmJiBjb3N0MS5nb2xkIDwgY29zdDIuZ29sZCk7XG4gICAgICAgIHJldHVybiBwaWNrQ29zdDEgP1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QxLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QyLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QyLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29zdE9mKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IENvc3Qge1xuICAgICAgICBjb25zdCBzb3VyY2VDb3N0cyA9IFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgICAgIC5tYXAoKGl0ZW1Tb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlLmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogaXRlbVNvdXJjZS5wcmljZSwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiBpdGVtU291cmNlLnByaWNlLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGVDb3N0ID0gY29zdE9mKGl0ZW1Tb3VyY2UuaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogc2luZ2xlQ29zdC5nb2xkICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiBzaW5nbGVDb3N0LmFwICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzaW5nbGVDb3N0Lm1hcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFttYXAsIHRyaWVzXSkgPT4gW21hcCwgdHJpZXMubWFwKG4gPT4gbiAqIG11bHRpcGxpZXIpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFtbaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIFtpdGVtU291cmNlLml0ZW1zLmxlbmd0aF1dXSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNvdXJjZUNvc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VlZCB3aXRoIHRoZSBmaXJzdCByZWFsIHNvdXJjZSBjb3N0LiBBIHswLDB9IGlkZW50aXR5IHdvdWxkIGFsd2F5cyB3aW5cbiAgICAgICAgLy8gdW5kZXIgYSBjb3JyZWN0IG1pbiwgYW5kIHRoZSBvbGQgYWx3YXlzLWxhc3QgYnVnIGhpZCB0aGF0LlxuICAgICAgICByZXR1cm4gc291cmNlQ29zdHMucmVkdWNlKChjdXJyLCBjb3N0KSA9PiBtaW5Db3N0KGN1cnIsIGNvc3QpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVN0YXRpc3RpY3M6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuZnJvbUVudHJpZXMocHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBbc3RhdCwgMF0pKTtcbiAgICBjb25zdCBzdGF0aXN0aWNzID0ge1xuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgU2V0PENoYXJhY3Rlcj4sXG4gICAgICAgIExldmVsOiAwLFxuICAgICAgICBjb3N0OiB7IGFwOiAwLCBnb2xkOiAwLCBtYXBzOiB7fSB9IGFzIENvc3QsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIE9iamVjdC52YWx1ZXMocmVzdWx0cykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLnJlZHVjZSgoY3Vyciwgc3RhdE5hbWUpID0+IGN1cnIgKyByZXN1bHRbMF0uc3RhdEZyb21TdHJpbmcoc3RhdE5hbWUpLCAwKTtcbiAgICAgICAgICAgIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSArPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpc3RpY3MuTGV2ZWwgPSBNYXRoLm1heChyZXN1bHRbMF0ubGV2ZWwsIHN0YXRpc3RpY3MuTGV2ZWwpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXN1bHQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hhciBvZiBpdGVtLmNoYXJhY3RlciA/IFtpdGVtLmNoYXJhY3Rlcl0gOiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGlzdGljcy5jaGFyYWN0ZXJzLmFkZChjaGFyKVxuICAgICAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmRDaGlsZChpdGVtVG9UYWJsZVJvdyhpdGVtLCBzb3VyY2VGaWx0ZXIsIHByaW9yaXR5U3RhdHMsIGNoYXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb290ZXIgY29zdCBtdXN0IG1hdGNoIHN0YXRzL2xldmVsOiBiZXN0IGNhbmRpZGF0ZSBwZXIgc2xvdCBvbmx5LlxuICAgICAgICAvLyBUaGUgYm9keSBzdGlsbCByZW5kZXJzIHRoZSBmdWxsIHJhbmtlZCBsaXN0IGFib3ZlLlxuICAgICAgICBzdGF0aXN0aWNzLmNvc3QgPSBjb21iaW5lQ29zdHMoXG4gICAgICAgICAgICBjb3N0T2YocmVzdWx0WzBdLCBjaGFyYWN0ZXIgJiYgaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSA/IGNoYXJhY3RlciA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICBzdGF0aXN0aWNzLmNvc3QsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpc3RpY3MuY2hhcmFjdGVycy5zaXplID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsX3NvdXJjZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuZ29sZCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuZ29sZC50b0ZpeGVkKDApfSBHb2xkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5hcCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuYXAudG9GaXhlZCgwKX0gQVBgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0YXRpc3RpY3NbJ0d1YXJkaWFuIGdhbWVzJ10uZm9yRWFjaCgoY291bnQsIG1hcCkgPT4gdG90YWxfc291cmNlcy5wdXNoKGAke2NvdW50LnRvRml4ZWQoMCl9IHggJHttYXB9YCkpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidGZvb3RcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBOYW1lX2NvbHVtblwiIH0sIFwiVG90YWw6XCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQ2hhcmFjdGVyX2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgUGFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBudW1lcmljXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7cHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdfWBcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke3N0YXRpc3RpY3MuTGV2ZWx9YF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBTb3VyY2VfY29sdW1uXCIgfSwgdG90YWxfc291cmNlcy5qb2luKFwiLCBcIildLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbl9lbGVtZW50IG9mIHRhYmxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYENoYXJhY3Rlcl9jb2x1bW5gKSkge1xuICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgIGlmIChwcmlvcml0eVN0YXRpc3RpY3NbYXR0cmlidXRlXSA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke2F0dHJpYnV0ZX1fY29sdW1uYCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShjb2x1bW5fZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sdW1uX2VsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhJdGVtTGV2ZWwoKSB7XG4gICAgLy9ubyByZWR1Y2UgZm9yIE1hcD9cbiAgICBsZXQgbWF4ID0gMDtcbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KG1heCwgaXRlbS5sZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBtYXg7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZGlhbG9nICYmIGRpYWxvZyA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgbWFrZUNoZWNrYm94VHJlZSwgVHJlZU5vZGUsIGdldExlYWZTdGF0ZXMsIHNldExlYWZTdGF0ZXMgfSBmcm9tICcuL2NoZWNrYm94VHJlZSc7XG5pbXBvcnQgeyBjcmVhdGVQb3B1cExpbmssIGRvd25sb2FkSXRlbXMsIGdldFJlc3VsdHNUYWJsZSwgSXRlbSwgSXRlbVNvdXJjZSwgZ2V0TWF4SXRlbUxldmVsLCBpdGVtcywgQ2hhcmFjdGVyLCBjaGFyYWN0ZXJzLCBpc0NoYXJhY3RlciwgU2hvcEl0ZW1Tb3VyY2UsIEdhY2hhSXRlbVNvdXJjZSwgZ2V0R2FjaGFUYWJsZSB9IGZyb20gJy4vaXRlbUxvb2t1cCc7XG5pbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IHNlbGVjdEJ5UHJpb3JpdHkgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7IFZhcmlhYmxlX3N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5jb25zdCBwYXJ0c0ZpbHRlciA9IFtcbiAgICBcIlBhcnRzXCIsIFtcbiAgICAgICAgXCJIZWFkXCIsIFtcbiAgICAgICAgICAgIFwiK0hhdFwiLFxuICAgICAgICAgICAgXCIrSGFpclwiLFxuICAgICAgICAgICAgXCJEeWVcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrVXBwZXJcIixcbiAgICAgICAgXCIrTG93ZXJcIixcbiAgICAgICAgXCJMZWdzXCIsIFtcbiAgICAgICAgICAgIFwiK1Nob2VzXCIsXG4gICAgICAgICAgICBcIlNvY2tzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiQXV4XCIsIFtcbiAgICAgICAgICAgIFwiK0hhbmRcIixcbiAgICAgICAgICAgIFwiK0JhY2twYWNrXCIsXG4gICAgICAgICAgICBcIitGYWNlXCJcbiAgICAgICAgXSxcbiAgICAgICAgXCIrUmFja2V0XCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlciA9IFtcbiAgICBcIkF2YWlsYWJpbGl0eVwiLCBbXG4gICAgICAgIFwiU2hvcFwiLCBbXG4gICAgICAgICAgICBcIitHb2xkXCIsXG4gICAgICAgICAgICBcIitBUFwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitBbGxvdyBnYWNoYVwiLFxuICAgICAgICBcIitHdWFyZGlhblwiLFxuICAgICAgICBcIitVbnRyYWRhYmxlXCIsXG4gICAgICAgIFwiVW5hdmFpbGFibGUgaXRlbXNcIixcbiAgICBdLFxuXTtcblxuY29uc3QgZXhjbHVkZWRfaXRlbV9pZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuLyoqIERpZ2l0cy1vbmx5IHNhZmUtaW50ZWdlciBwYXJzZSBmb3IgZXhjbHVkZWRfaXRlbV9pZHMgbG9jYWxTdG9yYWdlIHRva2Vucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4Y2x1ZGVkSXRlbUlkVG9rZW4odG9rZW46IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHRva2VuKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IE51bWJlcih0b2tlbik7XG4gICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihpZCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBhZGRGaWx0ZXJUcmVlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXJhY3RlckZpbHRlcnNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIFtcIkFsbFwiLCAuLi5jaGFyYWN0ZXJzXSkge1xuICAgICAgICBjb25zdCBpZCA9IGBjaGFyYWN0ZXJTZWxlY3RvcnNfJHtjaGFyYWN0ZXJ9YDtcbiAgICAgICAgY29uc3QgcmFkaW9fYnV0dG9uID0gY3JlYXRlSFRNTChbXCJpbnB1dFwiLCB7IGlkOiBpZCwgdHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImNoYXJhY3RlclNlbGVjdG9yc1wiLCB2YWx1ZTogY2hhcmFjdGVyIH1dKTtcbiAgICAgICAgcmFkaW9fYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHJhZGlvX2J1dHRvbik7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImxhYmVsXCIsIHsgZm9yOiBpZCB9LCBjaGFyYWN0ZXJdKSk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImJyXCJdKSk7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTmlraVwiKSB7XG4gICAgICAgICAgICByYWRpb19idXR0b24uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaWx0ZXJzOiBbVHJlZU5vZGUsIHN0cmluZ11bXSA9IFtcbiAgICAgICAgW3BhcnRzRmlsdGVyLCBcInBhcnRzRmlsdGVyXCJdLFxuICAgICAgICBbYXZhaWxhYmlsaXR5RmlsdGVyLCBcImF2YWlsYWJpbGl0eUZpbHRlclwiXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgW2ZpbHRlciwgbmFtZV0gb2YgZmlsdGVycykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuYW1lKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmVlID0gbWFrZUNoZWNrYm94VHJlZShmaWx0ZXIpO1xuICAgICAgICB0cmVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdXBkYXRlUmVzdWx0cyk7XG4gICAgICAgIHRhcmdldC5pbm5lclRleHQgPSBcIlwiO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQodHJlZSk7XG4gICAgfVxufVxuXG5hZGRGaWx0ZXJUcmVlcygpO1xuXG5sZXQgZHJhZ2dlZDogSFRNTEVsZW1lbnQ7XG5jb25zdCBkcmFnU2VwYXJhdG9yTGluZSA9IGNyZWF0ZUhUTUwoW1wiaHJcIiwgeyBpZDogXCJkcmFnT3ZlckJhclwiIH1dKTtcbmxldCBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihkaXJlY3Rpb246IFwidXBcIiB8IFwiZG93blwiKTogU1ZHU1ZHRWxlbWVudCB7XG4gICAgY29uc3QgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcInN2Z1wiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJwcmlvcml0eS1tb3ZlX19pY29uXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIFwiMCAwIDI0IDI0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjE0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJmb2N1c2FibGVcIiwgXCJmYWxzZVwiKTtcbiAgICBjb25zdCBwYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcInBhdGhcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgIFwiZFwiLFxuICAgICAgICBkaXJlY3Rpb24gPT09IFwidXBcIiA/IFwiTTYgMTQuNSAxMiA4LjVsNiA2XCIgOiBcIk02IDkuNSAxMiAxNS41bDYtNlwiLFxuICAgICk7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBcImN1cnJlbnRDb2xvclwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBcIjIuMjVcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWNhcFwiLCBcInJvdW5kXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVqb2luXCIsIFwicm91bmRcIik7XG4gICAgc3ZnLmFwcGVuZChwYXRoKTtcbiAgICByZXR1cm4gc3ZnO1xufVxuXG4vKiogUmVhZCByYW5raW5nIGtleSBmcm9tIHRoZSBsYWJlbCBub2RlIHNvIG1vdmUgY29udHJvbHMgbmV2ZXIgcG9sbHV0ZSBzdGF0IHRleHQuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJpb3JpdHlTdGF0TGFiZWwoaXRlbTogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgY29uc3QgbGFiZWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKTtcbiAgICBpZiAobGFiZWw/LnRleHRDb250ZW50KSB7XG4gICAgICAgIHJldHVybiBsYWJlbC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiAoaXRlbS50ZXh0Q29udGVudCA/PyBcIlwiKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIHNldFByaW9yaXR5U3RhdExhYmVsKGl0ZW06IEhUTUxFbGVtZW50LCBzdGF0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBsYWJlbCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1zdGF0LWxhYmVsXCIpO1xuICAgIGlmIChsYWJlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gc3RhdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBzdGF0O1xuICAgIH1cbiAgICBjb25zdCB1cCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLXVwXCIpO1xuICAgIGNvbnN0IGRvd24gPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS1kb3duXCIpO1xuICAgIGlmICh1cCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgIHVwLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgYFJhaXNlICR7c3RhdH0gcHJpb3JpdHlgKTtcbiAgICAgICAgdXAudGl0bGUgPSBgUmFpc2UgJHtzdGF0fWA7XG4gICAgfVxuICAgIGlmIChkb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgZG93bi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBMb3dlciAke3N0YXR9IHByaW9yaXR5YCk7XG4gICAgICAgIGRvd24udGl0bGUgPSBgTG93ZXIgJHtzdGF0fWA7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJpb3JpdHlMaXN0SXRlbShzdGF0OiBzdHJpbmcpOiBIVE1MTElFbGVtZW50IHtcbiAgICBjb25zdCB1cCA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgY2xhc3M6IFwicHJpb3JpdHktbW92ZSBwcmlvcml0eS1tb3ZlLXVwXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYFJhaXNlICR7c3RhdH0gcHJpb3JpdHlgLFxuICAgICAgICAgICAgdGl0bGU6IGBSYWlzZSAke3N0YXR9YCxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICB1cC5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihcInVwXCIpKTtcbiAgICBjb25zdCBkb3duID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBjbGFzczogXCJwcmlvcml0eS1tb3ZlIHByaW9yaXR5LW1vdmUtZG93blwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBMb3dlciAke3N0YXR9IHByaW9yaXR5YCxcbiAgICAgICAgICAgIHRpdGxlOiBgTG93ZXIgJHtzdGF0fWAsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgZG93bi5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihcImRvd25cIikpO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImxpXCIsXG4gICAgICAgIHsgY2xhc3M6IFwiZHJvcHpvbmVcIiwgZHJhZ2dhYmxlOiBcInRydWVcIiB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwicHJpb3JpdHktc3RhdC1sYWJlbFwiIH0sIHN0YXRdLFxuICAgICAgICBjcmVhdGVIVE1MKFtcInNwYW5cIiwgeyBjbGFzczogXCJwcmlvcml0eS1tb3ZlLWNvbnRyb2xzXCIgfSwgdXAsIGRvd25dKSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gcHJpb3JpdHlMaXN0SXRlbXMobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IEhUTUxMSUVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obGlzdC5jaGlsZHJlbikuZmlsdGVyKFxuICAgICAgICAobm9kZSk6IG5vZGUgaXMgSFRNTExJRWxlbWVudCA9PiBub2RlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBub2RlLmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHN5bmNSYW5raW5nU3VtbWFyeUhpbnQobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGhpbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X3N1bW1hcnlfaGludFwiKTtcbiAgICBpZiAoIShoaW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdG9wID0gcHJpb3JpdHlMaXN0SXRlbXMobGlzdClbMF07XG4gICAgaWYgKCF0b3ApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbCA9IGdldFByaW9yaXR5U3RhdExhYmVsKHRvcCk7XG4gICAgaWYgKGxhYmVsKSB7XG4gICAgICAgIGhpbnQudGV4dENvbnRlbnQgPSBgJHtsYWJlbH0gZmlyc3Qgd2l0aGluIGVhY2ggc2xvdGA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1zID0gcHJpb3JpdHlMaXN0SXRlbXMobGlzdCk7XG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICAgICAgY29uc3QgZG93biA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLWRvd25cIik7XG4gICAgICAgIGlmICh1cCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgICB1cC5kaXNhYmxlZCA9IGluZGV4ID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRvd24uZGlzYWJsZWQgPSBpbmRleCA9PT0gaXRlbXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHN5bmNSYW5raW5nU3VtbWFyeUhpbnQobGlzdCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVQcmlvcml0eUxpc3RJdGVtKGl0ZW06IEhUTUxMSUVsZW1lbnQsIGRpcmVjdGlvbjogXCJ1cFwiIHwgXCJkb3duXCIpOiB2b2lkIHtcbiAgICBjb25zdCBsaXN0ID0gaXRlbS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBzaWJsaW5nOiBFbGVtZW50IHwgbnVsbCA9IGRpcmVjdGlvbiA9PT0gXCJ1cFwiID8gaXRlbS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nIDogaXRlbS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgd2hpbGUgKHNpYmxpbmcgJiYgIShzaWJsaW5nIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBzaWJsaW5nLmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpKSkge1xuICAgICAgICBzaWJsaW5nID0gZGlyZWN0aW9uID09PSBcInVwXCIgPyBzaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBzaWJsaW5nLm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gICAgaWYgKCEoc2libGluZyBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJ1cFwiKSB7XG4gICAgICAgIHNpYmxpbmcuYmVmb3JlKGl0ZW0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2libGluZy5hZnRlcihpdGVtKTtcbiAgICB9XG4gICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlEcmFnRHJvcCgpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7IHRhcmdldCB9ID0gZXZlbnQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuY2xvc2VzdChcIi5wcmlvcml0eS1tb3ZlLCAucHJpb3JpdHktbW92ZS1jb250cm9sc1wiKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3cgPSB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIilcbiAgICAgICAgICAgID8gdGFyZ2V0XG4gICAgICAgICAgICA6IHRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKCEocm93IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ2dlZCA9IHJvdztcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcm9wem9uZSA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKGRyb3B6b25lIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSBkcm9wem9uZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIC0gdGFyZ2V0UmVjdC50b3A7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0YXJnZXRSZWN0LmhlaWdodDtcbiAgICAgICAgICAgIGVudW0gUG9zaXRpb24ge1xuICAgICAgICAgICAgICAgIGFib3ZlLFxuICAgICAgICAgICAgICAgIG9uLFxuICAgICAgICAgICAgICAgIGJlbG93LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB5IDwgaGVpZ2h0ICogMC4zID8gUG9zaXRpb24uYWJvdmUgOiB5ID4gaGVpZ2h0ICogMC43ID8gUG9zaXRpb24uYmVsb3cgOiBQb3NpdGlvbi5vbjtcbiAgICAgICAgICAgIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmFib3ZlOlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZHJvcHpvbmUuYmVmb3JlKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5iZWxvdzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGRyb3B6b25lLmFmdGVyKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5vbjpcbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZCA9PT0gZHJvcHpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSBkcm9wem9uZTtcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKCFkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4pIHtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5hZnRlcihkcmFnZ2VkKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJhZ2dlZC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50O1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICghKGRyb3BUYXJnZXQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gYCR7Z2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJvcFRhcmdldCl9KyR7Z2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCl9YDtcbiAgICAgICAgICAgIHNldFByaW9yaXR5U3RhdExhYmVsKGRyb3BUYXJnZXQsIGNvbWJpbmVkKTtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJvcFRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRyb3BSb3cgPSB0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIilcbiAgICAgICAgICAgID8gdGFyZ2V0XG4gICAgICAgICAgICA6IHRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKGRyb3BSb3cgPT09IGRyYWdnZWQgJiYgZHJhZ2dlZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZ2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCkuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCwgc3RhdHMuc2hpZnQoKSEpO1xuICAgICAgICAgICAgZHJhZ2dlZC5hZnRlciguLi5zdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQpKSk7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJhZ2dlZC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuYXBwbHlEcmFnRHJvcCgpO1xuXG5mdW5jdGlvbiBoeWRyYXRlUHJpb3JpdHlMaXN0Q29udHJvbHMoKTogdm9pZCB7XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHByaW9yaXR5TGlzdEl0ZW1zKHByaW9yaXR5TGlzdCkpIHtcbiAgICAgICAgaWYgKCFpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IChpdGVtLnRleHRDb250ZW50ID8/IFwiXCIpLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghc3RhdCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5yZXBsYWNlV2l0aChjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFN0YXRpYyBIVE1MIHNoaXBzIGVtcHR5IGNvbnRyb2wgc2hlbGxzOyBmaWxsIGljb25zIHdpdGhvdXQgbG9zaW5nIGxhYmVscy5cbiAgICAgICAgZm9yIChjb25zdCBidXR0b24gb2YgaXRlbS5xdWVyeVNlbGVjdG9yQWxsKFwiLnByaW9yaXR5LW1vdmVcIikpIHtcbiAgICAgICAgICAgIGlmICghKGJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB8fCBidXR0b24ucXVlcnlTZWxlY3RvcihcInN2Z1wiKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gYnV0dG9uLmNsYXNzTGlzdC5jb250YWlucyhcInByaW9yaXR5LW1vdmUtdXBcIikgPyBcInVwXCIgOiBcImRvd25cIjtcbiAgICAgICAgICAgIGJ1dHRvbi5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihkaXJlY3Rpb24pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUocHJpb3JpdHlMaXN0KTtcbn1cblxuaHlkcmF0ZVByaW9yaXR5TGlzdENvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIGNvbXBhcmUobGhzOiBudW1iZXIsIHJoczogbnVtYmVyKTogLTEgfCAwIHwgMSB7XG4gICAgaWYgKGxocyA9PT0gcmhzKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gbGhzIDwgcmhzID8gLTEgOiAxO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RlZENoYXJhY3RlcigpOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzQ2hhcmFjdGVyKHNlbGVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRTZWxlY3RlZENoYXJhY3RlcihjaGFyYWN0ZXI6IENoYXJhY3RlciB8IFwiQWxsXCIpIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIik7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGNoYXJhY3RlckZpbHRlckxpc3QpIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUgPT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgaXRlbVNlbGVjdG9ycyA9IFtcInBhcnRzU2VsZWN0b3JcIiwgXCJnYWNoYVNlbGVjdG9yXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgSXRlbVNlbGVjdG9yID0gdHlwZW9mIGl0ZW1TZWxlY3RvcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1TZWxlY3RvcihpdGVtU2VsZWN0b3I6IHN0cmluZyk6IGl0ZW1TZWxlY3RvciBpcyBJdGVtU2VsZWN0b3Ige1xuICAgIHJldHVybiAoaXRlbVNlbGVjdG9ycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhpdGVtU2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtVHlwZVNlbGVjdGlvbigpOiBJdGVtU2VsZWN0b3Ige1xuICAgIGNvbnN0IHBhcnRzU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzU2VsZWN0b3JcIik7XG4gICAgaWYgKCEocGFydHNTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKHBhcnRzU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhY2hhU2VsZWN0b3JcIik7XG4gICAgaWYgKCEoZ2FjaGFTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKGdhY2hhU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJnYWNoYVNlbGVjdG9yXCI7XG4gICAgfVxuICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCkgfHwgXCJBbGxcIjtcbiAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIkNoYXJhY3RlclwiLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgey8vRmlsdGVyc1xuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHsgLy9taXNjXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIiwgbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiLCBpdGVtX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5kZWxldGVfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiLCBlbmNoYW50VG9nZ2xlLmNoZWNrZWQpO1xuICAgIH1cbiAgICB7IC8vaXRlbSBzZWxlY3Rpb25cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIsIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpO1xuICAgIH1cblxuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZXhjbHVkZWRfaXRlbV9pZHNcIiwgQXJyYXkuZnJvbShleGNsdWRlZF9pdGVtX2lkcykuam9pbihcIixcIikpO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHN0b3JlZF9jaGFyYWN0ZXIgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIkNoYXJhY3RlclwiKTtcbiAgICBzZXRTZWxlY3RlZENoYXJhY3Rlcih0eXBlb2Ygc3RvcmVkX2NoYXJhY3RlciA9PT0gXCJzdHJpbmdcIiAmJiBpc0NoYXJhY3RlcihzdG9yZWRfY2hhcmFjdGVyKSA/IHN0b3JlZF9jaGFyYWN0ZXIgOiBcIk5pa2lcIik7XG5cbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhWYXJpYWJsZV9zdG9yYWdlLnZhcmlhYmxlcykpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0LCBzdGF0ZXMpO1xuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIHsgLy9taXNjXG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXhMZXZlbCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGAke21heExldmVsfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXZlbHJhbmdlLnZhbHVlID0gbGV2ZWxyYW5nZS5tYXg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtX25hbWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIG5hbWVmaWx0ZXIudmFsdWUgPSBpdGVtX25hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgICAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPSAhIVZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICB9XG5cbiAgICAvLyBSZWh5ZHJhdGUgZXhjbHVzaW9ucyBiZWZvcmUgYW55IHNhdmUtY2FwYWJsZSBldmVudCAoY2hhbmdlL2lucHV0IOKGkiB1cGRhdGVSZXN1bHRzIOKGkiBzYXZlU2VsZWN0aW9uKS5cbiAgICBjb25zdCBleGNsdWRlZF9pZHMgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImV4Y2x1ZGVkX2l0ZW1faWRzXCIpO1xuICAgIGlmICh0eXBlb2YgZXhjbHVkZWRfaWRzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaWRzLnNwbGl0KFwiLFwiKSkge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VFeGNsdWRlZEl0ZW1JZFRva2VuKGlkKTtcbiAgICAgICAgICAgIGlmIChwYXJzZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmFkZChwYXJzZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2l0ZW0gc2VsZWN0aW9uXG4gICAgICAgIGxldCBpdGVtVHlwZVNlbGVjdG9yID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIpO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1UeXBlU2VsZWN0b3IgIT09IFwic3RyaW5nXCIgfHwgIWlzSXRlbVNlbGVjdG9yKGl0ZW1UeXBlU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBpdGVtVHlwZVNlbGVjdG9yID0gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtVHlwZVNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCEoc2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBzZWxlY3Rvci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKTtcbiAgICB9XG5cbiAgICAvL211c3QgYmUgbGFzdCBiZWNhdXNlIGl0IHRyaWdnZXJzIGEgc3RvcmVcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVSZXN1bHRzKCkge1xuICAgIHNhdmVTZWxlY3Rpb24oKTtcbiAgICAvLyBXaGlsZSBmaXJzdC1sb2FkIGxhYiBwcmVwIGlzIGFjdGl2ZSwga2VlcCBmcmllbmRseSBsb2FkaW5nIGNvcHkg4oCUIGRvIG5vdCBwYWludFxuICAgIC8vIGFuIGVtcHR5IGludmVudG9yeSAoXCJObyBpdGVtcyBtYXRjaOKAplwiKSBvdmVyIHRoZSBhbmltYXRlZCBsb2FkZXIuXG4gICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c19ncm91cFwiKT8uZ2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIpID09PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpbHRlcnM6ICgoaXRlbTogSXRlbSkgPT4gYm9vbGVhbilbXSA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZUZpbHRlcnM6ICgoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbilbXSA9IFtdO1xuICAgIGxldCBzZWxlY3RlZENoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgeyAvL2NoYXJhY3RlciBmaWx0ZXJcbiAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXIgPSBnZXRTZWxlY3RlZENoYXJhY3RlcigpO1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZENoYXJhY3Rlcikge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLmNoYXJhY3RlciA9PT0gc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL3BhcnRzIGZpbHRlclxuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzU3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpO1xuICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IHBhcnRzU3RhdGVzW2l0ZW0ucGFydF0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vYXZhaWxhYmlsaXR5IGZpbHRlclxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpO1xuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkdvbGRcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmICFpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJBUFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW50cmFkYWJsZVwiXSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5wYXJjZWxfZW5hYmxlZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJBbGxvdyBnYWNoYVwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHdWFyZGlhblwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIWl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbmF2YWlsYWJsZSBpdGVtc1wiXSkge1xuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyID0gWy4uLnNvdXJjZUZpbHRlcnNdO1xuICAgICAgICAgICAgY29uc3Qgc291cmNlRmlsdGVyID0gKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlci5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZUZpbHRlcihpdGVtU291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2Uoc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGlzQXZhaWxhYmxlU291cmNlKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtKGl0ZW06IEl0ZW0pOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW1Tb3VyY2Ugb2YgaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGlzQXZhaWxhYmxlSXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vbWlzYyBmaWx0ZXJcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgZmlsdGVycy5wdXNoKChpdGVtOiBJdGVtKSA9PiBpdGVtLmxldmVsIDw9IG1heExldmVsKTtcblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBuYW1lZmlsdGVyLnZhbHVlO1xuICAgICAgICBpZiAoaXRlbV9uYW1lKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLm5hbWVfZW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhpdGVtX25hbWUudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2lkIGZpbHRlclxuICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiAhZXhjbHVkZWRfaXRlbV9pZHMuaGFzKGl0ZW0uaWQpKTtcbiAgICAgICAgY29uc3QgaXRlbUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIml0ZW1GaWx0ZXJcIik7XG4gICAgICAgIGlmICghKGl0ZW1GaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG5cbiAgICAgICAgfVxuICAgICAgICBpdGVtRmlsdGVyTGlzdC5yZXBsYWNlQ2hpbGRyZW4oKTtcbiAgICAgICAgaWYgKGV4Y2x1ZGVkX2l0ZW1faWRzLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgIGl0ZW1GaWx0ZXJMaXN0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZW1wdHktbm90ZVwiIH0sXG4gICAgICAgICAgICAgICAgXCJObyBleGNsdWRlZCBpdGVtc1wiLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpZCBvZiBleGNsdWRlZF9pdGVtX2lkcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtcy5nZXQoaWQpO1xuICAgICAgICAgICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbUZpbHRlckxpc3QuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZXhjbHVkZWQtaXRlbVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJleGNsdWRlZC1pdGVtX19uYW1lXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWl0ZW1faW5kZXhcIjogYCR7aWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYFJlc3RvcmUgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVzdG9yZVwiLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IGNvbXBhcmF0b3JzOiAoKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBudW1iZXIpW10gPSBbXTtcblxuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5U3RhdHMgPSBwcmlvcml0eUxpc3RJdGVtcyhwcmlvcml0eUxpc3QpXG4gICAgICAgIC5tYXAobm9kZSA9PiBnZXRQcmlvcml0eVN0YXRMYWJlbChub2RlKSlcbiAgICAgICAgLmZpbHRlcihzdGF0ID0+IHN0YXQubGVuZ3RoID4gMCk7XG4gICAge1xuICAgICAgICBmb3IgKGNvbnN0IHN0YXQgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICAgICAgICAgIGNvbXBhcmF0b3JzLnB1c2goKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBjb21wYXJlKFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IGxocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSksXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gcmhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9ICgoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdHNUYWJsZShcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlID0+IHNvdXJjZUZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtcywgaXRlbSkgPT4gc2VsZWN0QnlQcmlvcml0eShpdGVtcywgaXRlbSwgY29tcGFyYXRvcnMpLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eVN0YXRzLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENoYXJhY3RlclxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0R2FjaGFUYWJsZShpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRSb3dzID0gdGFibGUudEJvZGllc1swXT8ucm93cy5sZW5ndGggPz8gTWF0aC5tYXgoMCwgdGFibGUucm93cy5sZW5ndGggLSAxKTtcbiAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICBpZiAocmVzdWx0Um93cyA9PT0gMCkge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwicmVzdWx0cy1lbXB0eVwiLCByb2xlOiBcInN0YXR1c1wiIH0sXG4gICAgICAgICAgICBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIsXG4gICAgICAgIF0pKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgaWYgKHJlc3VsdHNTdGF0dXMpIHtcbiAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IHJlc3VsdFJvd3MgPT09IDBcbiAgICAgICAgICAgID8gXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiXG4gICAgICAgICAgICA6IGAke3Jlc3VsdFJvd3N9IG1hdGNoaW5nICR7cmVzdWx0Um93cyA9PT0gMSA/IFwiaXRlbVwiIDogXCJpdGVtc1wifWA7XG4gICAgfVxuICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbn1cblxubGV0IHJlc3VsdHNUYWJsZVNjcm9sbEJvdW5kID0gZmFsc2U7XG5sZXQgcmVzdWx0c1RhYmxlV2lkdGhPYnNlcnZlcjogUmVzaXplT2JzZXJ2ZXIgfCB1bmRlZmluZWQ7XG5sZXQgcmVzdWx0c0NvbHVtblBhblJldmVhbGVkID0gZmFsc2U7XG5cbi8qKiBLZWVwIHRoZSB0b3AgY29sdW1uIHNjcm9sbGVyIHdpZHRoIGFuZCBzY3JvbGxMZWZ0IGFsaWduZWQgd2l0aCB0aGUgcmVzdWx0cyB0YWJsZS4gKi9cbmZ1bmN0aW9uIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKSB7XG4gICAgY29uc3QgdGFibGVTY3JvbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlU2Nyb2xsXCIpO1xuICAgIGNvbnN0IHRhYmxlSFNjcm9sbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVIU2Nyb2xsXCIpO1xuICAgIGNvbnN0IHNwYWNlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVIU2Nyb2xsU3BhY2VyXCIpO1xuICAgIGNvbnN0IGNvbHVtblBhbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVDb2x1bW5QYW5cIik7XG4gICAgaWYgKCEodGFibGVTY3JvbGwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgISh0YWJsZUhTY3JvbGwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShzcGFjZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShjb2x1bW5QYW4gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcmVzdWx0c1RhYmxlU2Nyb2xsQm91bmQpIHtcbiAgICAgICAgcmVzdWx0c1RhYmxlU2Nyb2xsQm91bmQgPSB0cnVlO1xuICAgICAgICBsZXQgc3luY2luZyA9IGZhbHNlO1xuICAgICAgICBjb25zdCBtaXJyb3IgPSAoc291cmNlOiBIVE1MRWxlbWVudCwgdGFyZ2V0OiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN5bmNpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzeW5jaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRhcmdldC5zY3JvbGxMZWZ0ID0gc291cmNlLnNjcm9sbExlZnQ7XG4gICAgICAgICAgICBzeW5jaW5nID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHRhYmxlU2Nyb2xsLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgbWlycm9yKHRhYmxlU2Nyb2xsLCB0YWJsZUhTY3JvbGwpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHRhYmxlSFNjcm9sbC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgICAgICAgIG1pcnJvcih0YWJsZUhTY3JvbGwsIHRhYmxlU2Nyb2xsKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVzdWx0c1RhYmxlV2lkdGhPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyLm9ic2VydmUodGFibGVTY3JvbGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFibGUgPSB0YWJsZVNjcm9sbC5xdWVyeVNlbGVjdG9yKFwidGFibGVcIik7XG4gICAgaWYgKCEodGFibGUgaW5zdGFuY2VvZiBIVE1MVGFibGVFbGVtZW50KSkge1xuICAgICAgICBjb2x1bW5QYW4uaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgc3BhY2VyLnN0eWxlLndpZHRoID0gXCIwcHhcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnRXaWR0aCA9IE1hdGgubWF4KHRhYmxlLnNjcm9sbFdpZHRoLCB0YWJsZVNjcm9sbC5zY3JvbGxXaWR0aCk7XG4gICAgc3BhY2VyLnN0eWxlLndpZHRoID0gYCR7Y29udGVudFdpZHRofXB4YDtcbiAgICBjb25zdCBuZWVkc0hvcml6b250YWxTY3JvbGwgPSBjb250ZW50V2lkdGggPiB0YWJsZVNjcm9sbC5jbGllbnRXaWR0aCArIDE7XG4gICAgY29uc3Qgd2FzSGlkZGVuID0gY29sdW1uUGFuLmhpZGRlbjtcbiAgICBjb2x1bW5QYW4uaGlkZGVuID0gIW5lZWRzSG9yaXpvbnRhbFNjcm9sbDtcbiAgICBpZiAobmVlZHNIb3Jpem9udGFsU2Nyb2xsICYmICFkb2N1bWVudC5hY3RpdmVFbGVtZW50Py5pc1NhbWVOb2RlKHRhYmxlSFNjcm9sbCkpIHtcbiAgICAgICAgdGFibGVIU2Nyb2xsLnNjcm9sbExlZnQgPSB0YWJsZVNjcm9sbC5zY3JvbGxMZWZ0O1xuICAgIH1cbiAgICBpZiAobmVlZHNIb3Jpem9udGFsU2Nyb2xsICYmIHdhc0hpZGRlbiAmJiAhcmVzdWx0c0NvbHVtblBhblJldmVhbGVkKSB7XG4gICAgICAgIHJlc3VsdHNDb2x1bW5QYW5SZXZlYWxlZCA9IHRydWU7XG4gICAgICAgIGNvbHVtblBhbi5jbGFzc0xpc3QuYWRkKFwiaXMtcmV2ZWFsZWRcIik7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbHVtblBhbi5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcmV2ZWFsZWRcIik7XG4gICAgICAgIH0sIDI0MCk7XG4gICAgfVxuICAgIGlmICghbmVlZHNIb3Jpem9udGFsU2Nyb2xsKSB7XG4gICAgICAgIGNvbHVtblBhbi5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcmV2ZWFsZWRcIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKSB7XG4gICAgY29uc3QgbGV2ZWxEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbERpc3BsYXlcIik7XG4gICAgaWYgKCEobGV2ZWxEaXNwbGF5IGluc3RhbmNlb2YgSFRNTExhYmVsRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGxldmVscmFuZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgbGV2ZWxEaXNwbGF5LnRleHRDb250ZW50ID0gYE1heCBsZXZlbCByZXF1aXJlbWVudDogJHtsZXZlbHJhbmdlLnZhbHVlfWA7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0RGlzcGxheVVwZGF0ZXMoKSB7XG4gICAgc2V0TWF4TGV2ZWxEaXNwbGF5VXBkYXRlKCk7XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbmFtZWZpbHRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdXBkYXRlUmVzdWx0cyk7XG5cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGVuY2hhbnRUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHByaW9yaXR5TGlzdEl0ZW1zKHByaW9yaXR5TGlzdCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gL14oKD86U3RyKXwoPzpTdGEpfCg/OkRleCl8KD86V2lsbCkpJC8gOiAvXk1heCAoKD86U3RyKXwoPzpTdGEpfCg/OkRleCl8KD86V2lsbCkpJC87XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlciA9IGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA/IFwiTWF4ICQxXCIgOiBcIiQxXCI7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gZ2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSkuc3BsaXQoXCIrXCIpLm1hcChzID0+IHMucmVwbGFjZShyZWdleCwgcmVwbGFjZXIpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgICAgIHNldFByaW9yaXR5U3RhdExhYmVsKG5vZGUsIG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuc2V0RGlzcGxheVVwZGF0ZXMoKTtcblxuZnVuY3Rpb24gc2V0TW9iaWxlRmlsdGVyQ29udHJvbHMoKSB7XG4gICAgY29uc3QgZmlsdGVyVG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJUb2dnbGVcIik7XG4gICAgY29uc3QgY2xvc2VGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZUZpbHRlcnNcIik7XG4gICAgY29uc3QgZmlsdGVyUGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRyb2xSYWlsXCIpO1xuICAgIGNvbnN0IGZpbHRlckJhY2tkcm9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJCYWNrZHJvcFwiKTtcbiAgICBpZiAoIShmaWx0ZXJUb2dnbGUgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShjbG9zZUZpbHRlcnMgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShmaWx0ZXJQYW5lbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlckJhY2tkcm9wIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdG9nZ2xlQnV0dG9uID0gZmlsdGVyVG9nZ2xlO1xuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gY2xvc2VGaWx0ZXJzO1xuICAgIGNvbnN0IHBhbmVsID0gZmlsdGVyUGFuZWw7XG4gICAgY29uc3QgYmFja2Ryb3BCdXR0b24gPSBmaWx0ZXJCYWNrZHJvcDtcblxuICAgIGZ1bmN0aW9uIHNldE9wZW4ob3BlbjogYm9vbGVhbikge1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtb3BlblwiLCBvcGVuKTtcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgYCR7b3Blbn1gKTtcbiAgICAgICAgYmFja2Ryb3BCdXR0b24uaGlkZGVuID0gIW9wZW47XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImZpbHRlcnMtb3BlblwiLCBvcGVuKTtcbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVGaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgICAgICBpZiAobmFtZUZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmb2N1c0FmdGVyT3BlbiA9IChldmVudDogVHJhbnNpdGlvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wcm9wZXJ0eU5hbWUgIT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYW5lbC5yZW1vdmVFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBmb2N1c0FmdGVyT3Blbik7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVGaWx0ZXIuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIGZvY3VzQWZ0ZXJPcGVuKTtcbiAgICAgICAgICAgICAgICBuYW1lRmlsdGVyLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b24uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3Blbih0cnVlKSk7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4oZmFsc2UpKTtcbiAgICBiYWNrZHJvcEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIXBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQua2V5ICE9PSBcIlRhYlwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZm9jdXNhYmxlRWxlbWVudHMgPSBBcnJheS5mcm9tKHBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFxuICAgICAgICAgICAgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc3VtbWFyeSwgW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pJ1xuICAgICAgICApKS5maWx0ZXIoZWxlbWVudCA9PiBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoID4gMCk7XG4gICAgICAgIGlmIChmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaXJzdEVsZW1lbnQgPSBmb2N1c2FibGVFbGVtZW50c1swXTtcbiAgICAgICAgY29uc3QgbGFzdEVsZW1lbnQgPSBmb2N1c2FibGVFbGVtZW50c1tmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGZpcnN0RWxlbWVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGxhc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWV2ZW50LnNoaWZ0S2V5XG4gICAgICAgICAgICAmJiAoIXBhbmVsLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHx8IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGxhc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgd2luZG93Lm1hdGNoTWVkaWEoXCIobWluLXdpZHRoOiA4ODBweClcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoeyBtYXRjaGVzIH0pID0+IHtcbiAgICAgICAgaWYgKG1hdGNoZXMgJiYgcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuc2V0TW9iaWxlRmlsdGVyQ29udHJvbHMoKTtcblxuZnVuY3Rpb24gc2V0UmVzZXRGaWx0ZXJDb250cm9sKCkge1xuICAgIGNvbnN0IHJlc2V0RmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzZXRGaWx0ZXJzXCIpO1xuICAgIGNvbnN0IHJlZmluZW1lbnRTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlZmluZW1lbnRTdGF0dXNcIik7XG4gICAgaWYgKCEocmVzZXRGaWx0ZXJzIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEocmVmaW5lbWVudFN0YXR1cyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc2V0RmlsdGVycy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICByZWZpbmVtZW50U3RhdHVzLnRleHRDb250ZW50ID0gXCJSZXNldHRpbmcgZmlsdGVyc+KAplwiO1xuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLmNsZWFyX2FsbCgpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSk7XG59XG5cbnNldFJlc2V0RmlsdGVyQ29udHJvbCgpO1xuXG5mdW5jdGlvbiBzZXRJdGVtVHlwZVNlbGVjdG9yRnVuY3Rpb25hbGl0eSgpIHtcbiAgICBjb25zdCBwcmlvcml0eV9ncm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfZ3JvdXBcIik7XG4gICAgaWYgKCEocHJpb3JpdHlfZ3JvdXAgaW5zdGFuY2VvZiBIVE1MRmllbGRTZXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzU2VsZWN0b3JcIik7XG4gICAgaWYgKCEocGFydHNTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFydHNGaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpO1xuICAgIGlmICghKHBhcnRzRmlsdGVyIGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcGFydHNTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgcHJpb3JpdHlfZ3JvdXAuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkXCIpO1xuICAgICAgICBwYXJ0c0ZpbHRlci5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGdhY2hhU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhY2hhU2VsZWN0b3JcIik7XG4gICAgaWYgKCEoZ2FjaGFTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZ2FjaGFTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgcHJpb3JpdHlfZ3JvdXAuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICBwYXJ0c0ZpbHRlci5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcblxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdHNHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c19ncm91cFwiKTtcbiAgICBjb25zdCByZXN1bHRzU3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzU3RhdHVzXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ1wiKTtcbiAgICBjb25zdCBsb2FkaW5nQ29weSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGluZy1zdGF0ZV9fZGV0YWlsXCIpXG4gICAgICAgID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGluZy1zdGF0ZV9fY29weSBzcGFuXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdHcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19ncm91cFwiKTtcbiAgICBpZiAoIShyZXN1bHRzU3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0xhYmVsIGluc3RhbmNlb2YgSFRNTExhYmVsRWxlbWVudClcbiAgICAgICAgfHwgIShsb2FkaW5nQ29weSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICBsb2FkaW5nR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcInRydWVcIik7XG4gICAgc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKTtcbiAgICByZXN0b3JlU2VsZWN0aW9uKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZG93bmxvYWRJdGVtcygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID0gXCJJdGVtIGRhdGEgdW5hdmFpbGFibGVcIjtcbiAgICAgICAgbG9hZGluZ0xhYmVsLnRleHRDb250ZW50ID0gXCJDb3VsZCBub3QgbG9hZCBlcXVpcG1lbnQgZGF0YVwiO1xuICAgICAgICBsb2FkaW5nQ29weS50ZXh0Q29udGVudCA9IFwiQ2hlY2sgdGhlIHByZXZpZXcgc2VydmVyIGNvbm5lY3Rpb24sIHRoZW4gcmVsb2FkIHRoaXMgcGFnZS5cIjtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgbG9hZGluZ0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNob3dfYWZ0ZXJfbG9hZFwiKSkge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiaGlkZV9hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbWF4TGV2ZWwgPSBnZXRNYXhJdGVtTGV2ZWwoKTtcbiAgICBsZXZlbHJhbmdlLnZhbHVlID0gYCR7TWF0aC5taW4ocGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSksIG1heExldmVsKX1gO1xuICAgIGxldmVscmFuZ2UubWF4ID0gYCR7bWF4TGV2ZWx9YDtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgIGxvYWRpbmdHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbiAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgY29uc3Qgc29ydF9oZWxwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9sZWdlbmRcIik7XG4gICAgaWYgKHNvcnRfaGVscCBpbnN0YW5jZW9mIEhUTUxMZWdlbmRFbGVtZW50KSB7XG4gICAgICAgIHNvcnRfaGVscC5hcHBlbmRDaGlsZChjcmVhdGVQb3B1cExpbmsoXCIgKD8pXCIsIGNyZWF0ZUhUTUwoW1wicFwiLFxuICAgICAgICAgICAgXCJSZW9yZGVyIHRoZSBzdGF0cyB0byB5b3VyIGxpa2luZyB0byBhZmZlY3QgdGhlIHJlc3VsdHMgbGlzdC5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIlVzZSB0aGUgdXAvZG93biBhcnJvd3MsIG9yIGRyYWcgYSBzdGF0LCB0byBjaGFuZ2UgaXRzIGltcG9ydGFuY2UgKGZvciBleGFtcGxlIG1vdmUgTG9iIGFib3ZlIENoYXJnZSkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgc3RhdCBvbnRvIGFub3RoZXIgdG8gY29tYmluZSB0aGVtIChmb3IgZXhhbXBsZSBTdHIgb250byBEZXgsIHRoZSByZXN1bHRzIHdpbGwgZGlzcGxheSBTdHIrRGV4KS5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIkRyYWcgYSBjb21iaW5lZCBzdGF0IG9udG8gaXRzZWxmIHRvIHNlcGFyYXRlIHRoZW0uXCJdKSkpO1xuICAgIH1cbn0pO1xuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5VXAgPSBldmVudC50YXJnZXQuY2xvc2VzdChcIi5wcmlvcml0eS1tb3ZlLXVwXCIpO1xuICAgIGlmIChwcmlvcml0eVVwIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiYgIXByaW9yaXR5VXAuZGlzYWJsZWQpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gcHJpb3JpdHlVcC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKHJvdyBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIG1vdmVQcmlvcml0eUxpc3RJdGVtKHJvdywgXCJ1cFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJpb3JpdHlEb3duID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZS1kb3duXCIpO1xuICAgIGlmIChwcmlvcml0eURvd24gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCAmJiAhcHJpb3JpdHlEb3duLmRpc2FibGVkKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByaW9yaXR5RG93bi5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKHJvdyBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIG1vdmVQcmlvcml0eUxpc3RJdGVtKHJvdywgXCJkb3duXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBleGNsdWRlQnV0dG9uID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIuaXRlbV9yZW1vdmFsXCIpO1xuICAgIGlmIChleGNsdWRlQnV0dG9uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFleGNsdWRlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmFkZChwYXJzZUludChleGNsdWRlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZXN0b3JlQnV0dG9uID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIuaXRlbV9yZW1vdmFsX3JlbW92YWxcIik7XG4gICAgaWYgKHJlc3RvcmVCdXR0b24gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAoIXJlc3RvcmVCdXR0b24uZGF0YXNldC5pdGVtX2luZGV4KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXhjbHVkZWRfaXRlbV9pZHMuZGVsZXRlKHBhcnNlSW50KHJlc3RvcmVCdXR0b24uZGF0YXNldC5pdGVtX2luZGV4KSk7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9XG59KTtcbiIsImV4cG9ydCB0eXBlIFByaW9yaXR5Q29tcGFyYXRvcjxUPiA9IChsaHM6IFQsIHJoczogVCkgPT4gbnVtYmVyO1xuXG4vKipcbiAqIEluc2VydCBgY2FuZGlkYXRlYCBpbnRvIGEgYmVzdC1maXJzdCByYW5raW5nLlxuICogSGlnaGVyIGNvbXBhcmF0b3IgdmFsdWVzIG1lYW4gdGhlIGxlZnQtaGFuZCBpdGVtIHJhbmtzIGJldHRlci5cbiAqIEV2ZXJ5IGNhbmRpZGF0ZSBpcyByZXRhaW5lZCBzbyB0aGUgVUkgY2FuIHNob3cgdGhlIGZ1bGwgZmlsdGVyZWQgaW52ZW50b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0QnlQcmlvcml0eTxUPihcbiAgICBjdXJyZW50OiBUW10sXG4gICAgY2FuZGlkYXRlOiBULFxuICAgIGNvbXBhcmF0b3JzOiByZWFkb25seSBQcmlvcml0eUNvbXBhcmF0b3I8VD5bXSxcbik6IFRbXSB7XG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbY2FuZGlkYXRlXTtcbiAgICB9XG5cbiAgICBsZXQgaW5zZXJ0QXQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY3VycmVudC5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgbGV0IGRlY2lkZWQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbXBhcmF0b3Igb2YgY29tcGFyYXRvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBhcmF0b3IoY3VycmVudFtpbmRleF0sIGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVjaWRlZCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVjaWRlZCA8IDApIHtcbiAgICAgICAgICAgIC8vIGN1cnJlbnRbaW5kZXhdIGlzIHdvcnNlIHRoYW4gY2FuZGlkYXRlOiBpbnNlcnQgYmVmb3JlIGl0LlxuICAgICAgICAgICAgaW5zZXJ0QXQgPSBpbmRleDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRlY2lkZWQgPiAwOiBjdXJyZW50IGl0ZW0gaXMgYmV0dGVyOyBrZWVwIHNjYW5uaW5nLlxuICAgICAgICAvLyBkZWNpZGVkID09PSAwOiBleGFjdCB0aWU7IGtlZXAgc2Nhbm5pbmcgc28gdGllcyBzdGF5IHN0YWJsZS9GSUZPLlxuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmN1cnJlbnQuc2xpY2UoMCwgaW5zZXJ0QXQpLFxuICAgICAgICBjYW5kaWRhdGUsXG4gICAgICAgIC4uLmN1cnJlbnQuc2xpY2UoaW5zZXJ0QXQpLFxuICAgIF07XG59XG4iLCIvKiogSW50ZXJuYWwgcHJpb3JpdHkga2V5cyDihpIgc2hvcnQgdGFibGUgaGVhZGVyICsgaHVtYW4gZnVsbCBuYW1lIGZvciB0b29sdGlwcy4gKi9cbmNvbnN0IFBSSU9SSVRZX1NUQVRfSEVBREVSX0FCQlJFVjogUmVhZG9ubHk8XG4gICAgUmVjb3JkPHN0cmluZywgeyByZWFkb25seSBzaG9ydDogc3RyaW5nOyByZWFkb25seSBmdWxsOiBzdHJpbmcgfT5cbj4gPSB7XG4gICAgXCJNb3YgU3BlZWRcIjogeyBzaG9ydDogXCJNU1wiLCBmdWxsOiBcIk1vdiBTcGVlZFwiIH0sXG4gICAgXCJRdWlja3Nsb3RzXCI6IHsgc2hvcnQ6IFwiUVNcIiwgZnVsbDogXCJRdWljayBTbG90c1wiIH0sXG4gICAgXCJCdWZmc2xvdHNcIjogeyBzaG9ydDogXCJCU1wiLCBmdWxsOiBcIkJ1ZmYgU2xvdHNcIiB9LFxufTtcblxuZXhwb3J0IHR5cGUgUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSA9IHtcbiAgICByZWFkb25seSBzaG9ydDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGZ1bGw6IHN0cmluZztcbiAgICByZWFkb25seSBhYmJyZXZpYXRlZDogYm9vbGVhbjtcbn07XG5cbi8qKiBNYXAgYSBwcmlvcml0eSBzdGF0IGtleSAob3IgY29tYmluZWQgXCJBK0JcIikgdG8gc2hvcnQgaGVhZGVyIHRleHQgKyBmdWxsIHRvb2x0aXAgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5KHN0YXQ6IHN0cmluZyk6IFByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkge1xuICAgIGNvbnN0IHBhcnRzID0gc3RhdC5zcGxpdChcIitcIik7XG4gICAgY29uc3QgbWFwcGVkID0gcGFydHMubWFwKChwYXJ0KSA9PiB7XG4gICAgICAgIGNvbnN0IGtub3duID0gUFJJT1JJVFlfU1RBVF9IRUFERVJfQUJCUkVWW3BhcnRdO1xuICAgICAgICByZXR1cm4ga25vd24gPz8geyBzaG9ydDogcGFydCwgZnVsbDogcGFydCB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHNob3J0ID0gbWFwcGVkLm1hcCgocGFydCkgPT4gcGFydC5zaG9ydCkuam9pbihcIitcIik7XG4gICAgY29uc3QgZnVsbCA9IG1hcHBlZC5tYXAoKHBhcnQpID0+IHBhcnQuZnVsbCkuam9pbihcIitcIik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2hvcnQsXG4gICAgICAgIGZ1bGwsXG4gICAgICAgIGFiYnJldmlhdGVkOiBzaG9ydCAhPT0gZnVsbCxcbiAgICB9O1xufVxuIiwiLyoqXG4gKiBSZXNvbHZlIHdoaWNoIGJvc3MgZ3VhcmRpYW4ocykgYXBwZWFyIG9uIGEgR3VhcmRpYW4gLyBCb3NzIHN0YWdlLlxuICogRGF0YSBjb21lcyBmcm9tIEpGVFNFIEd1YXJkaWFuU3RhZ2VzLmpzb24gKEJvc3NHdWFyZGlhbiArIHNpZGUgcG9vbHMpXG4gKiBhbmQgQm9zc0d1YXJkaWFuSW5mb19JbmkzLnhtbCAvIEd1YXJkaWFuSW5mby54bWwgbmFtZXMuXG4gKi9cblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzSW5mbyA9IHtcbiAgICByZWFkb25seSBpZDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSByZXNJZD86IG51bWJlcjtcbiAgICByZWFkb25seSBsZXZlbD86IG51bWJlcjtcbiAgICByZWFkb25seSBocEJhc2U/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUd1YXJkaWFuSW5mbyA9IHtcbiAgICByZWFkb25seSBpZDogbnVtYmVyO1xuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc1NpZGVQb29scyA9IHtcbiAgICByZWFkb25seSBsZWZ0OiByZWFkb25seSBudW1iZXJbXTtcbiAgICByZWFkb25seSBtaWRkbGU6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIHJlYWRvbmx5IHJpZ2h0OiByZWFkb25seSBudW1iZXJbXTtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc1N0YWdlRW50cnkgPSB7XG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG1hcElkPzogbnVtYmVyIHwgbnVsbDtcbiAgICByZWFkb25seSBpc0Jvc3NTdGFnZTogYm9vbGVhbjtcbiAgICByZWFkb25seSBib3NzSWRzOiByZWFkb25seSBudW1iZXJbXTtcbiAgICByZWFkb25seSBzaWRlR3VhcmRpYW5JZHM/OiBTdGFnZUJvc3NTaWRlUG9vbHM7XG4gICAgcmVhZG9ubHkgZXhwTXVsdGlwbGllcj86IG51bWJlciB8IG51bGw7XG4gICAgcmVhZG9ubHkgYm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcz86IG51bWJlciB8IG51bGw7XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IGJvc3Nlcz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFN0YWdlQm9zc0luZm8+PjtcbiAgICByZWFkb25seSBndWFyZGlhbnM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBTdGFnZUd1YXJkaWFuSW5mbz4+O1xuICAgIHJlYWRvbmx5IHN0YWdlcz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIFN0YWdlQm9zc1N0YWdlRW50cnk+PjtcbiAgICByZWFkb25seSBieU1hcElkPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgcmVhZG9ubHkgc3RyaW5nW10+Pjtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc1Byb2plY3Rpb24gPSB7XG4gICAgcmVhZG9ubHkgc3RhZ2VOYW1lOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbWFwSWQ/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgaXNCb3NzU3RhZ2U6IGJvb2xlYW47XG4gICAgLyoqIFByaW1hcnkgYm9zcyBndWFyZGlhbnMgZm9yIHRoaXMgc3RhZ2UgKHVuaXF1ZSBieSBpZCkuICovXG4gICAgcmVhZG9ubHkgYm9zc2VzOiByZWFkb25seSBTdGFnZUJvc3NJbmZvW107XG4gICAgLyoqIFVuaXF1ZSBib3NzIGRpc3BsYXkgbmFtZXMgKGRlZHVwZWQsIG9yZGVyLXByZXNlcnZpbmcpLiAqL1xuICAgIHJlYWRvbmx5IGJvc3NOYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG4gICAgLyoqIFNpZGUtbGFuZSBndWFyZGlhbiBuYW1lcyB0aGF0IHNwYXduIHdpdGggdGhlIGJvc3MgYmF0dGxlIChsZWZ0L3JpZ2h0L21pZGRsZSkuICovXG4gICAgcmVhZG9ubHkgc2lkZUd1YXJkaWFuTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xufTtcblxuZnVuY3Rpb24gdW5pcXVlTmFtZXMobmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBjb25zdCBvdXQ6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG5hbWVzKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IG5hbWUudHJpbSgpO1xuICAgICAgICBpZiAoIWtleSB8fCBzZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuLmFkZChrZXkpO1xuICAgICAgICBvdXQucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQm9zcyhjYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nLCBpZDogbnVtYmVyKTogU3RhZ2VCb3NzSW5mbyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW50cnkgPSBjYXRhbG9nLmJvc3Nlcz8uW2Ake2lkfWBdO1xuICAgIGlmIChlbnRyeSAmJiB0eXBlb2YgZW50cnkubmFtZSA9PT0gXCJzdHJpbmdcIiAmJiBlbnRyeS5uYW1lLnRyaW0oKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGVudHJ5LmlkID8/IGlkLFxuICAgICAgICAgICAgbmFtZTogZW50cnkubmFtZS50cmltKCksXG4gICAgICAgICAgICByZXNJZDogZW50cnkucmVzSWQsXG4gICAgICAgICAgICBsZXZlbDogZW50cnkubGV2ZWwsXG4gICAgICAgICAgICBocEJhc2U6IGVudHJ5LmhwQmFzZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUd1YXJkaWFuTmFtZShjYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nLCBpZDogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbnRyeSA9IGNhdGFsb2cuZ3VhcmRpYW5zPy5bYCR7aWR9YF07XG4gICAgY29uc3QgbmFtZSA9IGVudHJ5Py5uYW1lPy50cmltKCk7XG4gICAgcmV0dXJuIG5hbWUgfHwgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBzaWRlSWRzKHBvb2xzOiBTdGFnZUJvc3NTaWRlUG9vbHMgfCB1bmRlZmluZWQpOiBudW1iZXJbXSB7XG4gICAgaWYgKCFwb29scykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBbLi4uKHBvb2xzLmxlZnQgPz8gW10pLCAuLi4ocG9vbHMubWlkZGxlID8/IFtdKSwgLi4uKHBvb2xzLnJpZ2h0ID8/IFtdKV07XG59XG5cbi8qKlxuICogQ2FuZGlkYXRlIHN0YWdlIGtleXMgZm9yIGEgY2hpcCBsYWJlbCBtYXAgbmFtZS5cbiAqIEJvc3MgwrcgQXRsYW50aXMgdXNlcyBgQXRsYW50aXNCb3NzYDsgc29tZSBkcm9wcyB1c2UgYmFyZSBtYXAgbmFtZXMgd2l0aCBuZWVkQm9zcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YWdlQm9zc0xvb2t1cEtleXMobWFwTmFtZTogc3RyaW5nLCBuZWVkQm9zczogYm9vbGVhbik6IHJlYWRvbmx5IHN0cmluZ1tdIHtcbiAgICBjb25zdCBrZXlzID0gW21hcE5hbWVdO1xuICAgIGlmIChuZWVkQm9zcyAmJiAhL0Jvc3MkL2kudGVzdChtYXBOYW1lKSkge1xuICAgICAgICBrZXlzLnB1c2goYCR7bWFwTmFtZX1Cb3NzYCk7XG4gICAgfVxuICAgIGlmICghbmVlZEJvc3MgJiYgL0Jvc3MkL2kudGVzdChtYXBOYW1lKSkge1xuICAgICAgICBrZXlzLnB1c2gobWFwTmFtZS5yZXBsYWNlKC9Cb3NzJC9pLCBcIlwiKSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBlbnRyeUhhc0Jvc3NlcyhlbnRyeTogU3RhZ2VCb3NzU3RhZ2VFbnRyeSB8IHVuZGVmaW5lZCk6IGVudHJ5IGlzIFN0YWdlQm9zc1N0YWdlRW50cnkge1xuICAgIHJldHVybiAhIWVudHJ5ICYmIEFycmF5LmlzQXJyYXkoZW50cnkuYm9zc0lkcykgJiYgZW50cnkuYm9zc0lkcy5sZW5ndGggPiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFN0YWdlQm9zc0VudHJ5KFxuICAgIG1hcE5hbWU6IHN0cmluZyxcbiAgICBuZWVkQm9zczogYm9vbGVhbixcbiAgICBjYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nLFxuKTogU3RhZ2VCb3NzU3RhZ2VFbnRyeSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgc3RhZ2VzID0gY2F0YWxvZy5zdGFnZXM7XG4gICAgaWYgKCFzdGFnZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3Qga2V5cyA9IHN0YWdlQm9zc0xvb2t1cEtleXMobWFwTmFtZSwgbmVlZEJvc3MpO1xuICAgIC8vIFByZWZlciBhbiBlbnRyeSB0aGF0IGFjdHVhbGx5IGxpc3RzIEJvc3NHdWFyZGlhbiBpZHMgKGUuZy4gQXRsYW50aXNCb3NzIG92ZXIgQXRsYW50aXMpLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgY29uc3QgZW50cnkgPSBzdGFnZXNba2V5XTtcbiAgICAgICAgaWYgKGVudHJ5SGFzQm9zc2VzKGVudHJ5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIE1hcElkIGJyaWRnZTogYmFyZSBtYXAgbmFtZXMgc2hhcmUgTWFwSWQgd2l0aCB0aGUgYm9zcy1zdGFnZSBzaWJsaW5nLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgY29uc3Qgc2VlZCA9IHN0YWdlc1trZXldO1xuICAgICAgICBpZiAoc2VlZD8ubWFwSWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2libGluZ3MgPSBjYXRhbG9nLmJ5TWFwSWQ/LltgJHtzZWVkLm1hcElkfWBdID8/IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHNpYmxpbmdOYW1lIG9mIHNpYmxpbmdzKSB7XG4gICAgICAgICAgICBjb25zdCBzaWJsaW5nID0gc3RhZ2VzW3NpYmxpbmdOYW1lXTtcbiAgICAgICAgICAgIGlmIChlbnRyeUhhc0Jvc3NlcyhzaWJsaW5nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzaWJsaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIExhc3QgcmVzb3J0OiBhbnkgbWF0Y2hpbmcgc3RhZ2Ugcm93IChub24tYm9zcyBUZW1wbGUsIGV0Yy4pLlxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgaWYgKHN0YWdlc1trZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RhZ2VzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBQcm9qZWN0IHRoZSBib3NzKGVzKSBhbmQgc2lkZSBndWFyZGlhbnMgZm9yIGEgc3RhZ2UgY2hpcC5cbiAqIFN1cHBvcnRzIG11bHRpLWJvc3Mgc3RhZ2VzIHZpYSBib3NzSWRzW10gKEpGVFNFIGN1cnJlbnRseSBzaGlwcyBvbmUgQm9zc0d1YXJkaWFuIHBlciBzdGFnZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0U3RhZ2VCb3NzZXMoXG4gICAgbWFwTmFtZTogc3RyaW5nLFxuICAgIG5lZWRCb3NzOiBib29sZWFuLFxuICAgIGNhdGFsb2c6IFN0YWdlQm9zc0NhdGFsb2csXG4pOiBTdGFnZUJvc3NQcm9qZWN0aW9uIHtcbiAgICBjb25zdCBlbnRyeSA9IGZpbmRTdGFnZUJvc3NFbnRyeShtYXBOYW1lLCBuZWVkQm9zcywgY2F0YWxvZyk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhZ2VOYW1lOiBtYXBOYW1lLFxuICAgICAgICAgICAgaXNCb3NzU3RhZ2U6IG5lZWRCb3NzLFxuICAgICAgICAgICAgYm9zc2VzOiBbXSxcbiAgICAgICAgICAgIGJvc3NOYW1lczogW10sXG4gICAgICAgICAgICBzaWRlR3VhcmRpYW5OYW1lczogW10sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgYm9zc2VzOiBTdGFnZUJvc3NJbmZvW10gPSBbXTtcbiAgICBjb25zdCBzZWVuQm9zc0lkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgaWQgb2YgZW50cnkuYm9zc0lkcyA/PyBbXSkge1xuICAgICAgICBpZiAoc2VlbkJvc3NJZHMuaGFzKGlkKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2VlbkJvc3NJZHMuYWRkKGlkKTtcbiAgICAgICAgY29uc3QgYm9zcyA9IHJlc29sdmVCb3NzKGNhdGFsb2csIGlkKTtcbiAgICAgICAgaWYgKGJvc3MpIHtcbiAgICAgICAgICAgIGJvc3Nlcy5wdXNoKGJvc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2lkZUd1YXJkaWFuTmFtZXMgPSB1bmlxdWVOYW1lcyhcbiAgICAgICAgc2lkZUlkcyhlbnRyeS5zaWRlR3VhcmRpYW5JZHMpXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gcmVzb2x2ZUd1YXJkaWFuTmFtZShjYXRhbG9nLCBpZCkpXG4gICAgICAgICAgICAuZmlsdGVyKChuKTogbiBpcyBzdHJpbmcgPT4gdHlwZW9mIG4gPT09IFwic3RyaW5nXCIpLFxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFnZU5hbWU6IGVudHJ5Lm5hbWUsXG4gICAgICAgIG1hcElkOiB0eXBlb2YgZW50cnkubWFwSWQgPT09IFwibnVtYmVyXCIgPyBlbnRyeS5tYXBJZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaXNCb3NzU3RhZ2U6ICEhZW50cnkuaXNCb3NzU3RhZ2UsXG4gICAgICAgIGJvc3NlcyxcbiAgICAgICAgYm9zc05hbWVzOiB1bmlxdWVOYW1lcyhib3NzZXMubWFwKChiKSA9PiBiLm5hbWUpKSxcbiAgICAgICAgc2lkZUd1YXJkaWFuTmFtZXMsXG4gICAgfTtcbn1cbiIsImV4cG9ydCB0eXBlIFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMgPSBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuO1xuXG50eXBlIFN0b3JhZ2VfdmFsdWUgPSBgJHtcInNcIiB8IFwiblwiIHwgXCJiXCJ9JHtzdHJpbmd9YDtcblxuZnVuY3Rpb24gdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKTogU3RvcmFnZV92YWx1ZSB7XG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgcmV0dXJuIGBzJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gYG4ke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBcImIxXCIgOiBcImIwXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdHJpbmdfdG9fdmFyaWFibGUodnY6IFN0b3JhZ2VfdmFsdWUpOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIHtcbiAgICBjb25zdCBwcmVmaXggPSB2dlswXTtcbiAgICBjb25zdCB2YWx1ZSA9IHZ2LnN1YnN0cmluZygxKTtcbiAgICBzd2l0Y2ggKHByZWZpeCkge1xuICAgICAgICBjYXNlICdzJzogLy9zdHJpbmdcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgY2FzZSAnbic6IC8vbnVtYmVyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGNhc2UgJ2InOiAvL2Jvb2xlYW5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gXCIxXCIgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIHRocm93IGBpbnZhbGlkIHZhbHVlOiAke3Z2fWA7XG59XG5cbmZ1bmN0aW9uIGlzX3N0b3JhZ2VfdmFsdWUoa2V5OiBzdHJpbmcpOiBrZXkgaXMgU3RvcmFnZV92YWx1ZSB7XG4gICAgcmV0dXJuIGtleS5sZW5ndGggPj0gMSAmJiBcInNuYlwiLmluY2x1ZGVzKGtleVswXSk7XG59XG5cbmV4cG9ydCBjbGFzcyBWYXJpYWJsZV9zdG9yYWdlIHtcbiAgICBzdGF0aWMgZ2V0X3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgICAgICBpZiAodHlwZW9mIHN0b3JlZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZShzdG9yZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ190b192YXJpYWJsZShzdG9yZWQpO1xuICAgIH1cbiAgICBzdGF0aWMgc2V0X3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZywgdmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gLCB2YXJpYWJsZV90b19zdHJpbmcodmFsdWUpKTtcbiAgICB9XG4gICAgc3RhdGljIGRlbGV0ZV92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICB9XG4gICAgc3RhdGljIGNsZWFyX2FsbCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgdmFyaWFibGVzKCkge1xuICAgICAgICBsZXQgcmVzdWx0OiB7IFtrZXk6IHN0cmluZ106IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMgfSA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHN0cmluZ190b192YXJpYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59Il19
