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
  return [["Movement", item.movement], ["Charge", item.charge], ["Lob", item.lob], ["Smash", item.smash], ["Strength", item.str], ["Dexterity", item.dex], ["Stamina", item.sta], ["Will", item.wil], ["Serve", item.serve], ["HP", item.hp], ["Quickslots", item.quickslots], ["Buffslots", item.buffslots]];
}
function createItemDetailsContent(item, character) {
  const stats = itemDetailStats(item).filter(([, value]) => value !== 0);
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
  }, "Stats"], stats.length > 0 ? (0, _html.createHTML)(["dl", {
    class: "item-details__stats"
  }, ...stats.map(([label, value]) => (0, _html.createHTML)(["div", ["dt", label], ["dd", `${value}`]]))]) : (0, _html.createHTML)(["p", {
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
  let first = true;
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
    if (first) {
      radio_button.checked = true;
      first = false;
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
    hint.textContent = `${label} first`;
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
  setSelectedCharacter(typeof stored_character === "string" && (0, _itemLookup.isCharacter)(stored_character) ? stored_character : "All");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJnYWNoYUFjcXVpc2l0aW9uLnRzIiwiaHRtbC50cyIsIml0ZW1Mb29rdXAudHMiLCJtYWluLnRzIiwicHJpb3JpdHkudHMiLCJwcmlvcml0eVN0YXRIZWFkZXJzLnRzIiwic3RhZ2VCb3NzZXMudHMiLCJzdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFBLEtBQUEsR0FBQSxPQUFBO0FBSUEsU0FBUyxXQUFXLENBQUMsSUFBc0I7RUFDdkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWE7RUFDcEMsSUFBSSxFQUFFLFNBQVMsWUFBWSxhQUFhLENBQUMsRUFBRTtJQUN2QyxPQUFPLEVBQUU7RUFDYjtFQUNBLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhO0VBQ3pDLElBQUksRUFBRSxTQUFTLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUMxQyxPQUFPLEVBQUU7RUFDYjtFQUNBLEtBQUssSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtJQUMzRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxFQUFFO01BQzlDO0lBQ0o7SUFDQSxNQUFNLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBSSxFQUFFLHFCQUFxQixZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDdEQ7SUFDSjtJQUNBLE9BQU8sS0FBSyxDQUNQLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FDcEMsTUFBTSxDQUFFLENBQUMsSUFBeUIsQ0FBQyxZQUFZLGFBQWEsSUFBSSxDQUFDLENB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SSxHQUFHLE9BQU87Y0FDbkI7WUFDSixLQUFLLEtBQUs7Y0FDTixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUs7Y0FDakI7WUFDSixLQUFLLE9BQU87Y0FDUixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87Y0FDbkI7WUFDSixLQUFLLFFBQVE7Y0FDVCxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVE7Y0FDcEI7WUFDSixLQUFLLE1BQU07Y0FDUCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87Y0FDbkI7WUFDSixLQUFLLE1BQU07Y0FDUCxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU07Y0FDbEI7WUFDSixLQUFLLEtBQUs7Y0FDTixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUs7Y0FDakI7WUFDSjtjQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEtBQUssRUFBRSxDQUFDO1VBQ25EO1VBQ0E7UUFDSixLQUFLLE9BQU87VUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLE9BQU87VUFDUixJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDekI7UUFDSixLQUFLLFVBQVU7VUFDWCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDakM7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDaEM7UUFDSixLQUFLLFlBQVk7VUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUI7UUFDSixLQUFLLFdBQVc7VUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDL0I7UUFDSixLQUFLLGlCQUFpQjtVQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDN0I7UUFDSixLQUFLLFVBQVU7VUFDWCxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLFlBQVk7VUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUI7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLGdCQUFnQjtVQUNqQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUM7UUFDSixLQUFLLGNBQWM7VUFDZixJQUFJLENB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QUFFLENBQUM7RUFDL0M7RUFDQSxPQUFPLFNBQVMsQ0FBQTtJQUNaLFlBQVksQ0FBQyxLQUFLLEVBQUU7RUFDeEI7RUFDQSxXQUFXLFNBQVMsQ0FBQTtJQUNoQixJQUFJLE1BQU0sR0FBOEMsRUFBRTtJQUMxRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMxQyxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztNQUMvQixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUN6QjtNQUNKO01BQ0EsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDdkMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0I7TUFDSjtNQUNBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQjtNQUNKO01BQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQztJQUMzQztJQUNBLE9BQU8sTUFBTTtFQUNqQjs7QUFDSCxPQUFBLENBQUEsZ0JBQUEsR0FBQSxnQkFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgdHlwZSBUcmVlTm9kZSA9IHN0cmluZyB8IFRyZWVOb2RlW107XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50W10ge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgZm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBwYXJlbnRfdWwuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcbiAgICAgICAgaWYgKHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4XSAhPT0gcGFyZW50X2xpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3RlbnRpYWxTaWJsaW5nRW50cnkgPSBwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleCArIDFdPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocG90ZW50aWFsU2libGluZ0VudHJ5IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheVxuICAgICAgICAgICAgLmZyb20ocG90ZW50aWFsU2libGluZ0VudHJ5LmNoaWxkcmVuKVxuICAgICAgICAgICAgLmZpbHRlcigoZSk6IGUgaXMgSFRNTExJRWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudClcbiAgICAgICAgICAgIC5tYXAoZSA9PiBlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4obm9kZSkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQgIT09IG5vZGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hpbGQuY2hlY2tlZCA9IG5vZGUuY2hlY2tlZDtcbiAgICAgICAgICAgIGNoaWxkLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnQobm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnQgfCB2b2lkIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYW5kaWRhdGU6IEhUTUxMSUVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBwYXJlbnRfdWwuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBjaGlsZC5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZSA9IGNoaWxkO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkID09PSBwYXJlbnRfbGkgJiYgY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFuY2VzdG9ycyhub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgY29uc3QgcGFyZW50ID0gZ2V0UGFyZW50KG5vZGUpO1xuICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGZvdW5kQ2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZFVuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZEluZGV0ZXJtaW5hdGUgPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4ocGFyZW50KSkge1xuICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCkge1xuICAgICAgICAgICAgZm91bmRDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvdW5kVW5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGQuaW5kZXRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgZm91bmRJbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJbmRldGVybWluYXRlIHx8IGZvdW5kQ2hlY2tlZCAmJiBmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kQ2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kVW5jaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIHVwZGF0ZUFuY2VzdG9ycyhwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrTGlzdGVuZXIobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyh0YXJnZXQpO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnModGFyZ2V0KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVycyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBhcHBseUNoZWNrTGlzdGVuZXIoZWxlbWVudC5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVycyhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZU5vZGUodHJlZU5vZGU6IFRyZWVOb2RlKTogSFRNTExJRWxlbWVudCB7XG4gICAgaWYgKHR5cGVvZiB0cmVlTm9kZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIi1cIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIitcIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBjaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cmVlTm9kZS5yZXBsYWNlQWxsKFwiIFwiLCBcIl9cIiksXG4gICAgICAgICAgICAgICAgICAgIC4uLihjaGVja2VkICYmIHsgY2hlY2tlZDogXCJjaGVja2VkXCIgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwibGFiZWxcIixcbiAgICAgICAgICAgICAgICB7IGZvcjogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpIH0sXG4gICAgICAgICAgICAgICAgdHJlZU5vZGVcbiAgICAgICAgICAgIF1cbiAgICAgICAgXSk7XG4gICAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsaXN0ID0gY3JlYXRlSFRNTChbXCJ1bFwiLCB7IGNsYXNzOiBcImNoZWNrYm94XCIgfV0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVOb2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdHJlZU5vZGVbaV07XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKG1ha2VDaGVja2JveFRyZWVOb2RlKG5vZGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJsaVwiLCBsaXN0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZSh0cmVlTm9kZTogVHJlZU5vZGUpIHtcbiAgICBsZXQgcm9vdCA9IG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlKS5jaGlsZHJlblswXTtcbiAgICBpZiAoIShyb290IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBhcHBseUNoZWNrTGlzdGVuZXJzKHJvb3QpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMocm9vdCkpIHtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKGxlYWYpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gZ2V0TGVhdmVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBsZXQgcmVzdWx0OiBIVE1MSW5wdXRFbGVtZW50W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChnZXRDaGlsZHJlbihpbnB1dCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChnZXRMZWF2ZXMoaW5wdXQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV0gPSBsZWFmLmNoZWNrZWQ7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRMZWFmU3RhdGVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQsIHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0pIHtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RhdGVzW2xlYWYuaWQucmVwbGFjZUFsbChcIl9cIiwgXCIgXCIpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGVhZi5jaGVja2VkID0gc3RhdGU7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFB1cmUgcHJvamVjdGlvbiBvZiBob3cgYSBnYWNoYSBjb2luIGNhbiBiZSBhY3F1aXJlZC5cbiAqIFNob3AgZGVub21pbmF0aW9uIChHb2xkL0FQKSBpcyBzZXBhcmF0ZSBmcm9tIEd1YXJkaWFuL0Jvc3Mgc3RhZ2UgZHJvcHMuXG4gKi9cblxuZXhwb3J0IHR5cGUgR2FjaGFTaG9wQ2hhbm5lbCA9IHtcbiAgICByZWFkb25seSBraW5kOiBcInNob3BcIjtcbiAgICByZWFkb25seSBjdXJyZW5jeTogXCJHb2xkXCIgfCBcIkFQXCI7XG4gICAgcmVhZG9ubHkgYXZhaWxhYmxlOiBib29sZWFuO1xuICAgIC8qKiBXaHkgc2hvcCBpcyB1bmF2YWlsYWJsZSB3aGVuIGF2YWlsYWJsZT1mYWxzZS4gKi9cbiAgICByZWFkb25seSByZWFzb24/OiBcIm5vdF9mb3Jfc2FsZVwiIHwgXCJub3RfYXZhaWxhYmxlXCI7XG59O1xuXG5leHBvcnQgdHlwZSBHYWNoYVN0YWdlQ2hhbm5lbCA9IHtcbiAgICByZWFkb25seSBraW5kOiBcInN0YWdlXCI7XG4gICAgcmVhZG9ubHkgbWFwOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbmVlZEJvc3M6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgbGFiZWw6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEdhY2hhQWNxdWlzaXRpb25DaGFubmVsID0gR2FjaGFTaG9wQ2hhbm5lbCB8IEdhY2hhU3RhZ2VDaGFubmVsO1xuXG5leHBvcnQgdHlwZSBHYWNoYUFjcXVpc2l0aW9uSW5wdXQgPSB7XG4gICAgcmVhZG9ubHkgYXA6IGJvb2xlYW47XG4gICAgLyoqIFByb2R1Y3QgaXMgbGlzdGVkIGluIHRoZSBsaXZlIHNob3AgY2F0YWxvZyAoZW5hYmxlZCkuICovXG4gICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBUcnVlIG9ubHkgd2hlbiB0aGUgcHJvZHVjdCBjYW4gYWN0dWFsbHkgYmUgcHVyY2hhc2VkLlxuICAgICAqIEpGVFNFIGBOb2J1eT0xYCBwcm9kdWN0cyBzdGF5IGVuYWJsZWQgaW4gY2F0YWxvZyBidXQgcmVqZWN0IHNob3AgYnV5cy5cbiAgICAgKi9cbiAgICByZWFkb25seSBwdXJjaGFzYWJsZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEdhY2hhU291cmNlSW5wdXQgPVxuICAgIHwgeyByZWFkb25seSBraW5kOiBcInNob3BcIjsgcmVhZG9ubHkgYXA6IGJvb2xlYW4gfVxuICAgIHwgeyByZWFkb25seSBraW5kOiBcInN0YWdlXCI7IHJlYWRvbmx5IG1hcDogc3RyaW5nOyByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbiB9O1xuXG4vKiogU3BsaXQgQ2FtZWxDYXNlIHN0YWdlIGlkcyBmcm9tIEpGVFNFIEd1YXJkaWFuU3RhZ2VzLmpzb24gaW50byByZWFkYWJsZSBsYWJlbHMuICovXG5leHBvcnQgZnVuY3Rpb24gcHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbWFwXG4gICAgICAgIC5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCBcIiQxICQyXCIpXG4gICAgICAgIC5yZXBsYWNlKC8oW0EtWl0rKShbQS1aXVthLXpdKS9nLCBcIiQxICQyXCIpXG4gICAgICAgIC50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZUNoYW5uZWxMYWJlbChtYXA6IHN0cmluZywgbmVlZEJvc3M6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGNvbnN0IHByZXR0eSA9IHByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXApO1xuICAgIGlmICghbmVlZEJvc3MpIHtcbiAgICAgICAgcmV0dXJuIHByZXR0eTtcbiAgICB9XG4gICAgLy8gQXZvaWQgXCJCb3NzIMK3IEF0bGFudGlzIEJvc3NcIiDigJQgc3RhZ2UgaWRzIGVuZCBpbiBCb3NzIGFscmVhZHkuXG4gICAgY29uc3Qgd2l0aG91dEJvc3NTdWZmaXggPSBwcmV0dHkucmVwbGFjZSgvXFxzK0Jvc3MkL2ksIFwiXCIpO1xuICAgIHJldHVybiBgQm9zcyDCtyAke3dpdGhvdXRCb3NzU3VmZml4fWA7XG59XG5cbi8qKiBTdHJpcCB0cmFpbGluZyBCb3NzIHNvIHRpdGxlcyByZWFkIFwiQXRsYW50aXNcIiwgbm90IFwiQXRsYW50aXMgQm9zc1wiLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YWdlVGl0bGVOYW1lKG1hcDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCkucmVwbGFjZSgvXFxzK0Jvc3MkL2ksIFwiXCIpLnRyaW0oKTtcbn1cblxuZXhwb3J0IHR5cGUgTWFwQXJ0RmlsZSA9IHtcbiAgICByZWFkb25seSBmaWxlOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgd2lkdGg/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgaGVpZ2h0PzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGtpbmQ/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBNYXBBcnRDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IGZpbGVzOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBNYXBBcnRGaWxlPj47XG4gICAgcmVhZG9ubHkgYnlOYW1lOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PjtcbiAgICByZWFkb25seSBieU1hcElkPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG59O1xuXG4vKiogQ2FuZGlkYXRlIHN0YWdlIGtleXMgZm9yIG1hcCBhcnQgKEJvc3Mgc3VmZml4ICsgYmFyZSBtYXAgbmFtZSkuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwQXJ0TG9va3VwS2V5cyhtYXBOYW1lOiBzdHJpbmcsIG5lZWRCb3NzID0gZmFsc2UpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgY29uc3Qga2V5cyA9IFttYXBOYW1lXTtcbiAgICBpZiAobmVlZEJvc3MgJiYgIS9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKGAke21hcE5hbWV9Qm9zc2ApO1xuICAgIH1cbiAgICBpZiAoL0Jvc3MkL2kudGVzdChtYXBOYW1lKSkge1xuICAgICAgICBrZXlzLnB1c2gobWFwTmFtZS5yZXBsYWNlKC9Cb3NzJC9pLCBcIlwiKSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYXV0aGVudGljIGNsaWVudCBtYXAgYXJ0IGZvciBhIEd1YXJkaWFuU3RhZ2VzIG1hcCBuYW1lLlxuICogUHJlZmVycyBVSSBtYXAtc2VsZWN0IHRodW1iczsgZmFsbHMgYmFjayB0byBzdGFnZS1lbnZpcm9ubWVudCB0ZXh0dXJlcyB3aGVuIGNhdGFsb2d1ZWQuXG4gKiBOZXZlciBpbnZlbnRzIGFydCDigJQgb25seSByZXR1cm5zIGFuIGV4cGxpY2l0IGNhdGFsb2cgbWFwcGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVNYXBBcnRGaWxlKFxuICAgIG1hcE5hbWU6IHN0cmluZyxcbiAgICBjYXRhbG9nOiBNYXBBcnRDYXRhbG9nLFxuICAgIG9wdGlvbnM/OiB7IHJlYWRvbmx5IG5lZWRCb3NzPzogYm9vbGVhbjsgcmVhZG9ubHkgbWFwSWQ/OiBudW1iZXIgfSxcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG1hcEFydExvb2t1cEtleXMobWFwTmFtZSwgb3B0aW9ucz8ubmVlZEJvc3MgPz8gZmFsc2UpKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGNhdGFsb2cuYnlOYW1lW25hbWVdO1xuICAgICAgICBpZiAoa2V5ICYmIGNhdGFsb2cuZmlsZXNba2V5XT8uZmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhdGFsb2cuZmlsZXNba2V5XS5maWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucz8ubWFwSWQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gY2F0YWxvZy5ieU1hcElkPy5bYCR7b3B0aW9ucy5tYXBJZH1gXTtcbiAgICAgICAgaWYgKGtleSAmJiBjYXRhbG9nLmZpbGVzW2tleV0/LmZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYXRhbG9nLmZpbGVzW2tleV0uZmlsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFByb2plY3Qgc2hvcCArIHN0YWdlIGFjcXVpc2l0aW9uIGNoYW5uZWxzIGZvciBhIGdhY2hhIGNvaW4uXG4gKlxuICogLSBQdXJjaGFzYWJsZSBzaG9wIOKGkiBHb2xkL0FQIHBpbGwuXG4gKiAtIENhdGFsb2ctbGlzdGVkIGJ1dCBOb2J1eSAoYHB1cmNoYXNhYmxlPWZhbHNlYCwgYGVuYWJsZWQ9dHJ1ZWApIOKGkiBOb3QgZm9yIHNhbGVcbiAqICAgKHN0aWxsIHNob3duIHdoZW4gc3RhZ2VzIGV4aXN0IHNvIHBsYXllcnMgZG8gbm90IGFzc3VtZSBhIHByaWNlKS5cbiAqIC0gRnVsbHkgZGlzYWJsZWQgc2hvcCB3aXRoIG5vIHN0YWdlcyDihpIgTm90IGF2YWlsYWJsZS5cbiAqIC0gRGlzYWJsZWQgc2hvcCB3aXRoIHN0YWdlcyDihpIgc3RhZ2VzIG9ubHkgKG9taXQgc2hvcCBjaHJvbWUpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhQWNxdWlzaXRpb25DaGFubmVscyhcbiAgICBnYWNoYTogR2FjaGFBY3F1aXNpdGlvbklucHV0LFxuICAgIHNvdXJjZXM6IHJlYWRvbmx5IEdhY2hhU291cmNlSW5wdXRbXSxcbik6IHJlYWRvbmx5IEdhY2hhQWNxdWlzaXRpb25DaGFubmVsW10ge1xuICAgIGNvbnN0IGNoYW5uZWxzOiBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbFtdID0gW107XG4gICAgY29uc3Qgc3RhZ2VTb3VyY2VzID0gc291cmNlcy5maWx0ZXIoXG4gICAgICAgIChzb3VyY2UpOiBzb3VyY2UgaXMgRXh0cmFjdDxHYWNoYVNvdXJjZUlucHV0LCB7IGtpbmQ6IFwic3RhZ2VcIiB9PiA9PlxuICAgICAgICAgICAgc291cmNlLmtpbmQgPT09IFwic3RhZ2VcIixcbiAgICApO1xuICAgIGNvbnN0IGhhc1N0YWdlID0gc3RhZ2VTb3VyY2VzLmxlbmd0aCA+IDA7XG4gICAgY29uc3QgY3VycmVuY3kgPSBnYWNoYS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiO1xuXG4gICAgaWYgKGdhY2hhLnB1cmNoYXNhYmxlKSB7XG4gICAgICAgIGNoYW5uZWxzLnB1c2goe1xuICAgICAgICAgICAga2luZDogXCJzaG9wXCIsXG4gICAgICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChnYWNoYS5lbmFibGVkKSB7XG4gICAgICAgIC8vIExpc3RlZCBpbiBzaG9wIFVJIC8gQVBJIGJ1dCBibG9ja2VkIGJ5IE5vYnV5IOKAlCBuZXZlciBpbXBseSBhIGJ1eSBwYXRoLlxuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVhc29uOiBcIm5vdF9mb3Jfc2FsZVwiLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFoYXNTdGFnZSkge1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVhc29uOiBcIm5vdF9hdmFpbGFibGVcIixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2Vlbk1hcHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBmb3IgKGNvbnN0IHN0YWdlIG9mIHN0YWdlU291cmNlcykge1xuICAgICAgICBpZiAoc2Vlbk1hcHMuaGFzKHN0YWdlLm1hcCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW5NYXBzLmFkZChzdGFnZS5tYXApO1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic3RhZ2VcIixcbiAgICAgICAgICAgIG1hcDogc3RhZ2UubWFwLFxuICAgICAgICAgICAgbmVlZEJvc3M6IHN0YWdlLm5lZWRCb3NzLFxuICAgICAgICAgICAgbGFiZWw6IHN0YWdlQ2hhbm5lbExhYmVsKHN0YWdlLm1hcCwgc3RhZ2UubmVlZEJvc3MpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhbm5lbHM7XG59XG5cbi8qKiBQYXJzZSBwcm9kdWN0IGluZGV4ZXMgd2l0aCBOb2J1eeKJoDAgZnJvbSBKRlRTRSBTaG9wX0luaTMueG1sIHRleHQuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTaG9wTm9idXlQcm9kdWN0SW5kZXhlcyhzaG9wWG1sOiBzdHJpbmcpOiBSZWFkb25seVNldDxudW1iZXI+IHtcbiAgICBjb25zdCBub2J1eSA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWF0Y2ggb2Ygc2hvcFhtbC5tYXRjaEFsbCgvPFByb2R1Y3RcXHMrKFtePl0rPylcXC8/Pi9nKSkge1xuICAgICAgICBjb25zdCBhdHRycyA9IG1hdGNoWzFdID8/IFwiXCI7XG4gICAgICAgIGNvbnN0IGluZGV4TWF0Y2ggPSBhdHRycy5tYXRjaCgvXFxiSW5kZXg9XCIoXFxkKylcIi8pO1xuICAgICAgICBjb25zdCBub2J1eU1hdGNoID0gYXR0cnMubWF0Y2goL1xcYk5vYnV5PVwiKFxcZCspXCIvKTtcbiAgICAgICAgaWYgKCFpbmRleE1hdGNoIHx8ICFub2J1eU1hdGNoKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9idXlNYXRjaFsxXSAhPT0gXCIwXCIpIHtcbiAgICAgICAgICAgIG5vYnV5LmFkZChOdW1iZXIoaW5kZXhNYXRjaFsxXSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2J1eTtcbn1cbiIsInR5cGUgVGFnX25hbWUgPSBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA7XG50eXBlIEF0dHJpYnV0ZXMgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xudHlwZSBIVE1MX25vZGU8VCBleHRlbmRzIFRhZ19uYW1lPiA9IFtULCAuLi4oSFRNTF9ub2RlPFRhZ19uYW1lPiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgQXR0cmlidXRlcylbXV07XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIVE1MPFQgZXh0ZW5kcyBUYWdfbmFtZT4obm9kZTogSFRNTF9ub2RlPFQ+KTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW1RdIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlWzBdKTtcbiAgICBmdW5jdGlvbiBoYW5kbGUocGFyYW1ldGVyOiBBdHRyaWJ1dGVzIHwgSFRNTF9ub2RlPFRhZ19uYW1lPiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyID09PSBcInN0cmluZ1wiIHx8IHBhcmFtZXRlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChwYXJhbWV0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1ldGVyKSkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoY3JlYXRlSFRNTChwYXJhbWV0ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgcGFyYW1ldGVyW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBoYW5kbGUobm9kZVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xufVxuIiwiaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQge1xuICAgIHByZXR0eUd1YXJkaWFuTWFwTmFtZSxcbiAgICBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzLFxuICAgIHJlc29sdmVNYXBBcnRGaWxlLFxuICAgIHN0YWdlQ2hhbm5lbExhYmVsLFxuICAgIHN0YWdlVGl0bGVOYW1lLFxuICAgIHR5cGUgR2FjaGFTb3VyY2VJbnB1dCxcbiAgICB0eXBlIE1hcEFydENhdGFsb2csXG59IGZyb20gJy4vZ2FjaGFBY3F1aXNpdGlvbic7XG5pbXBvcnQgeyBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IH0gZnJvbSAnLi9wcmlvcml0eVN0YXRIZWFkZXJzJztcbmltcG9ydCB7XG4gICAgcHJvamVjdFN0YWdlQm9zc2VzLFxuICAgIHR5cGUgU3RhZ2VCb3NzQ2F0YWxvZyxcbiAgICB0eXBlIFN0YWdlQm9zc1Byb2plY3Rpb24sXG59IGZyb20gJy4vc3RhZ2VCb3NzZXMnO1xuXG5leHBvcnQgeyBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IH0gZnJvbSAnLi9wcmlvcml0eVN0YXRIZWFkZXJzJztcbmV4cG9ydCB0eXBlIHsgUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5leHBvcnQge1xuICAgIHJlc29sdmVNYXBBcnRGaWxlLFxuICAgIHN0YWdlVGl0bGVOYW1lLFxufSBmcm9tICcuL2dhY2hhQWNxdWlzaXRpb24nO1xuZXhwb3J0IHtcbiAgICBwcm9qZWN0U3RhZ2VCb3NzZXMsXG59IGZyb20gJy4vc3RhZ2VCb3NzZXMnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVycyA9IFtcIk5pa2lcIiwgXCJMdW5MdW5cIiwgXCJMdWN5XCIsIFwiU2h1YVwiLCBcIkRoYW5waXJcIiwgXCJQb2NoaVwiLCBcIkFsXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0gdHlwZW9mIGNoYXJhY3RlcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoYXJhY3RlcihjaGFyYWN0ZXI6IHN0cmluZyk6IGNoYXJhY3RlciBpcyBDaGFyYWN0ZXIge1xuICAgIHJldHVybiAoY2hhcmFjdGVycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhjaGFyYWN0ZXIpO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gXCJIYXRcIiB8IFwiSGFpclwiIHwgXCJEeWVcIiB8IFwiVXBwZXJcIiB8IFwiTG93ZXJcIiB8IFwiU2hvZXNcIiB8IFwiU29ja3NcIiB8IFwiSGFuZFwiIHwgXCJCYWNrcGFja1wiIHwgXCJGYWNlXCIgfCBcIlJhY2tldFwiIHwgXCJPdGhlclwiO1xuXG5leHBvcnQgY2xhc3MgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pZDogbnVtYmVyKSB7IH1cblxuICAgIGdldCByZXF1aXJlc0d1YXJkaWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi50aGlzLml0ZW0uc291cmNlcy52YWx1ZXMoKV0uZXZlcnkoc291cmNlID0+IHNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgZmluZGluZyBpdGVtIG9mIGl0ZW1Tb3VyY2UgJHt0aGlzLnNob3BfaWR9YCk7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2hvcEl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIsIHJlYWRvbmx5IHByaWNlOiBudW1iZXIsIHJlYWRvbmx5IGFwOiBib29sZWFuLCByZWFkb25seSBpdGVtczogSXRlbVtdKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG5cbiAgICBnYWNoYVRyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFnYWNoYSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnYWNoYS5hdmVyYWdlX3RyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBHYWNoYUVjb25vbWljcyA9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiO1xuICAgICAgICBjaGFuY2VQZXJjZW50OiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICB9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBjdXJyZW5jeTogXCJBUFwiIHwgXCJHb2xkXCI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogbnVtYmVyO1xuICAgICAgICBwcmljZVBlclB1bGw6IG51bWJlcjtcbiAgICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhRWNvbm9taWNzKFxuICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcixcbiAgICBzb3VyY2U/OiB7IHByaWNlOiBudW1iZXI7IGFwOiBib29sZWFuIH0sXG4pOiBHYWNoYUVjb25vbWljcyB7XG4gICAgY29uc3QgY2hhbmNlUGVyY2VudCA9IGV4cGVjdGVkUHVsbHMgPiAwID8gMTAwIC8gZXhwZWN0ZWRQdWxscyA6IDA7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgICAgIGV4cGVjdGVkUHVsbHMsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIixcbiAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgY3VycmVuY3k6IHNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiLFxuICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICBleHBlY3RlZFNwZW5kOiBleHBlY3RlZFB1bGxzICogc291cmNlLnByaWNlLFxuICAgICAgICBwcmljZVBlclB1bGw6IHNvdXJjZS5wcmljZSxcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgR3VhcmRpYW5JdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IGd1YXJkaWFuX21hcDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBpdGVtczogSXRlbVtdLFxuICAgICAgICByZWFkb25seSB4cDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuZWVkX2Jvc3M6IGJvb2xlYW4sXG4gICAgICAgIHJlYWRvbmx5IGJvc3NfdGltZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKEd1YXJkaWFuSXRlbVNvdXJjZS5ndWFyZGlhbl9tYXBfaWQoZ3VhcmRpYW5fbWFwKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGd1YXJkaWFuX21hcF9pZChtYXA6IHN0cmluZykge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMuaW5kZXhPZihtYXApO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmd1YXJkaWFuX21hcHMucHVzaChtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtaW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3VhcmRpYW5fbWFwcyA9IFtcIlwiXTtcbn1cblxuZXhwb3J0IGNsYXNzIEl0ZW0ge1xuICAgIGlkID0gMDtcbiAgICBuYW1lX2tyID0gXCJcIjtcbiAgICBuYW1lX2VuID0gXCJcIjtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICBtYXhVc2UgPSAwO1xuICAgIGhpZGRlbiA9IGZhbHNlO1xuICAgIHJlc2lzdCA9IFwiXCI7XG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyO1xuICAgIHBhcnQ6IFBhcnQgPSBcIk90aGVyXCI7XG4gICAgbGV2ZWwgPSAwO1xuICAgIHN0ciA9IDA7XG4gICAgc3RhID0gMDtcbiAgICBkZXggPSAwO1xuICAgIHdpbCA9IDA7XG4gICAgaHAgPSAwO1xuICAgIHF1aWNrc2xvdHMgPSAwO1xuICAgIGJ1ZmZzbG90cyA9IDA7XG4gICAgc21hc2ggPSAwO1xuICAgIG1vdmVtZW50ID0gMDtcbiAgICBjaGFyZ2UgPSAwO1xuICAgIGxvYiA9IDA7XG4gICAgc2VydmUgPSAwO1xuICAgIG1heF9zdHIgPSAwO1xuICAgIG1heF9zdGEgPSAwO1xuICAgIG1heF9kZXggPSAwO1xuICAgIG1heF93aWwgPSAwO1xuICAgIGVsZW1lbnRfZW5jaGFudGFibGUgPSBmYWxzZTtcbiAgICBwYXJjZWxfZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNwaW4gPSAwO1xuICAgIGF0c3MgPSAwO1xuICAgIGRmc3MgPSAwO1xuICAgIHNvY2tldCA9IDA7XG4gICAgZ2F1Z2UgPSAwO1xuICAgIGdhdWdlX2JhdHRsZSA9IDA7XG4gICAgc291cmNlczogSXRlbVNvdXJjZVtdID0gW107XG4gICAgc3RhdEZyb21TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiTW92IFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZW1lbnQ7XG4gICAgICAgICAgICBjYXNlIFwiQ2hhcmdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlO1xuICAgICAgICAgICAgY2FzZSBcIkxvYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYjtcbiAgICAgICAgICAgIGNhc2UgXCJTbWFzaFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNtYXNoO1xuICAgICAgICAgICAgY2FzZSBcIlN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcbiAgICAgICAgICAgIGNhc2UgXCJEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXg7XG4gICAgICAgICAgICBjYXNlIFwiU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhO1xuICAgICAgICAgICAgY2FzZSBcIldpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53aWw7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdHI7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IERleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9kZXg7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdGE7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFdpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfd2lsO1xuICAgICAgICAgICAgY2FzZSBcIlNlcnZlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmU7XG4gICAgICAgICAgICBjYXNlIFwiUXVpY2tzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1aWNrc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiQnVmZnNsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZnNsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkhQXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgc2hvcF9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBnYWNoYV9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHByaWNlOiBudW1iZXIgPSAwLFxuICAgICAgICByZWFkb25seSBhcDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKiogTGlzdGVkIGluIHRoZSBsaXZlIHNob3AgY2F0YWxvZyAoYGVuYWJsZWRgKS4gKi9cbiAgICAgICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuIGJlIHB1cmNoYXNlZCB3aXRoIEdvbGQvQVAuIEZhbHNlIHdoZW4gU2hvcF9JbmkzIGBOb2J1eeKJoDBgXG4gICAgICAgICAqIGV2ZW4gaWYgdGhlIGNhdGFsb2cgc3RpbGwgbGlzdHMgdGhlIHByb2R1Y3QgYXMgZW5hYmxlZC5cbiAgICAgICAgICovXG4gICAgICAgIHJlYWRvbmx5IHB1cmNoYXNhYmxlOiBib29sZWFuID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgY2hhcmFjdGVycykge1xuICAgICAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLnNldChjaGFyYWN0ZXIsIG5ldyBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+KCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQoaXRlbTogSXRlbSwgcHJvYmFiaWxpdHk6IG51bWJlciwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIsIHF1YW50aXR5X21pbjogbnVtYmVyLCBxdWFudGl0eV9tYXg6IG51bWJlcikge1xuICAgICAgICBpZiAoaXRlbS5jaGFyYWN0ZXIgJiYgaXRlbS5jaGFyYWN0ZXIgIT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgLy8gTG90dGVyeSBmaWxlcyBsaXN0IGV2ZXJ5IGNoYXJhY3RlcidzIGdlYXIgdW5kZXIgZWFjaCBMb3R0ZXJ5SXRlbV8qIGJsb2NrLlxuICAgICAgICAgICAgLy8gUm91dGUgdGhlIGVudHJ5IHRvIHRoZSBpdGVtJ3Mgb3duaW5nIGNoYXJhY3RlciBzbyBmaWx0ZXJzIHN0YXkgbWVhbmluZ2Z1bC5cbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGl0ZW0uY2hhcmFjdGVyO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSE7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzID0gbWFwLmdldChpdGVtKTtcbiAgICAgICAgLy8gU2FtZSBJdGVtIGNhbiBhcHBlYXIgb25jZSBwZXIgY2hhcmFjdGVyLWJsb2NrIChlLmcuIDfDlyBEcmFnb24gQXJtb3IgYXQgMSUpLlxuICAgICAgICAvLyBBY2N1bXVsYXRlIENoYW5zUGVyIGluc3RlYWQgb2Ygb3ZlcndyaXRpbmcg4oCUIG90aGVyd2lzZSByYXRlcyBzdGF5IHN0dWNrIGF0IDElXG4gICAgICAgIC8vIHdoaWxlIGNoYXJhY3Rlcl9wcm9iYWJpbGl0eSBzdGlsbCBzdW1zIHRvIDEwMCAobWFwIHRpY2tldHMg4omqIHBvb2wgdG90YWwpLlxuICAgICAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgICAgIG1hcC5zZXQoaXRlbSwgW1xuICAgICAgICAgICAgICAgIHByZXZpb3VzWzBdICsgcHJvYmFiaWxpdHksXG4gICAgICAgICAgICAgICAgTWF0aC5taW4ocHJldmlvdXNbMV0sIHF1YW50aXR5X21pbiksXG4gICAgICAgICAgICAgICAgTWF0aC5tYXgocHJldmlvdXNbMl0sIHF1YW50aXR5X21heCksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1hcC5zZXQoaXRlbSwgW3Byb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LnNldChjaGFyYWN0ZXIsIHByb2JhYmlsaXR5ICsgKHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpIHx8IDApKTtcbiAgICB9XG5cbiAgICBhdmVyYWdlX3RyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGNoYXJzOiByZWFkb25seSBDaGFyYWN0ZXJbXSA9IGNoYXJhY3RlciA/IChbY2hhcmFjdGVyXSkgOiBjaGFyYWN0ZXJzO1xuICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgKHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuZ2V0KGl0ZW0pPy5bMF0gfHwgMCksIDApO1xuICAgICAgICBpZiAocHJvYmFiaWxpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsX3Byb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgICAgICByZXR1cm4gdG90YWxfcHJvYmFiaWxpdHkgLyBwcm9iYWJpbGl0eTtcbiAgICB9XG5cbiAgICBnZXQgdG90YWxfcHJvYmFiaWxpdHkoKSB7XG4gICAgICAgIHJldHVybiBjaGFyYWN0ZXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICB9XG5cbiAgICBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgPSBuZXcgTWFwPENoYXJhY3RlciwgbnVtYmVyPigpO1xuICAgIHNob3BfaXRlbXMgPSBuZXcgTWFwPENoYXJhY3RlciwgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPj4oKTtcbn1cblxuZXhwb3J0IGxldCBpdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBzaG9wX2l0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5leHBvcnQgbGV0IGdhY2hhcyA9IG5ldyBNYXA8bnVtYmVyLCBHYWNoYT4oKTtcbmxldCBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgdW5kZWZpbmVkO1xudHlwZSBJdGVtQXJ0RW50cnkgPSBbc2hlZXQ6IHN0cmluZywgY2VsbDogbnVtYmVyXTtcbnR5cGUgSXRlbUFydFNoZWV0ID0ge1xuICAgIGxpbmVDb3VudDogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICBzcGFjZTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG59O1xudHlwZSBMb3R0ZXJ5QXJ0RW50cnkgPSB7XG4gICAgc2hlZXQ6IHN0cmluZztcbiAgICBjZWxsOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBzaGFwZTogXCJjb2luXCIgfCBcImN1YmVcIiB8IFwidG9rZW5cIjtcbn07XG50eXBlIEl0ZW1BcnRNYXAgPSB7XG4gICAgaXRlbXM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRFbnRyeT47XG4gICAgbG90dGVyaWVzOiBSZWNvcmQ8c3RyaW5nLCBMb3R0ZXJ5QXJ0RW50cnk+O1xuICAgIHNoZWV0czogUmVjb3JkPHN0cmluZywgSXRlbUFydFNoZWV0Pjtcbn07XG5sZXQgaXRlbUFydE1hcDogSXRlbUFydE1hcCA9IHsgaXRlbXM6IHt9LCBsb3R0ZXJpZXM6IHt9LCBzaGVldHM6IHt9IH07XG5sZXQgbWFwQXJ0TWFwOiBNYXBBcnRDYXRhbG9nID0geyBmaWxlczoge30sIGJ5TmFtZToge30gfTtcbmxldCBzdGFnZUJvc3NDYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG50eXBlIEJvc3NBcnRDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IGJ5Qm9zc0lkPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG4gICAgcmVhZG9ubHkgYnlSZXNJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xuICAgIHJlYWRvbmx5IGZpbGVzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgeyByZWFkb25seSBmaWxlOiBzdHJpbmcgfT4+O1xufTtcbmxldCBib3NzQXJ0Q2F0YWxvZzogQm9zc0FydENhdGFsb2cgPSB7fTtcblxuZnVuY3Rpb24gcHJldHR5TnVtYmVyKG46IG51bWJlciwgZGlnaXRzOiBudW1iZXIpIHtcbiAgICBsZXQgcyA9IG4udG9GaXhlZChkaWdpdHMpO1xuICAgIHdoaWxlIChzLmVuZHNXaXRoKFwiMFwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIGlmIChzLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUl0ZW1EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJdGVtcyBmaWxlIGlzIG9ubHkgJHtkYXRhLmxlbmd0aH0gYnl0ZXMgbG9uZ2ApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIHJlc3VsdF0gb2YgZGF0YS5tYXRjaEFsbCgvXFw8SXRlbSAoLiopXFwvXFw+L2cpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSBuZXcgSXRlbTtcbiAgICAgICAgZm9yIChjb25zdCBbLCBhdHRyaWJ1dGUsIHZhbHVlXSBvZiByZXN1bHQubWF0Y2hBbGwoL1xccz8oW149XSopPVwiKFteXCJdKilcIi9nKSkge1xuICAgICAgICAgICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiSW5kZXhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5pZCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIl9OYW1lX1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfa3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk5hbWVfTlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVzZVR5cGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51c2VUeXBlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNYXhVc2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhVc2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJIaWRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaGlkZGVuID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSZXNpc3RcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZXNpc3QgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk5JS0lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTmlraVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVTkxVTlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdW5MdW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVUNZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1Y3lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTSFVBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlNodWFcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJESEFOUElSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkRoYW5waXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQT0NISVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJQb2NoaVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFMXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkFsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBjaGFyYWN0ZXIgXCIke3ZhbHVlfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlBhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQkFHXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJCYWNrcGFja1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkdMQVNTRVNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkZhY2VcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQU5EXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU09DS1NcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNvY2tzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRk9PVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU2hvZXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDQVBcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBBTlRTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJMb3dlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlJBQ0tFVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiUmFja2V0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQk9EWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiVXBwZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQUlSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYWlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRFlFXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJEeWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHBhcnQgJHt2YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTGV2ZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZXZlbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0ciA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0YSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRleCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIldJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLndpbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEhQXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaHAgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRRdWlja1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnF1aWNrc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRCdWZmXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYnVmZnNsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU21hc2hTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNtYXNoID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTW92ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubW92ZW1lbnQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyZ2VzaG90U3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyZ2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMb2JTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxvYiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNlcnZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXJ2ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RyID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0cik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0YSA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX0RFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9kZXggPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9XSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfd2lsID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLndpbCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmNoYW50RWxlbWVudFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuYWJsZVBhcmNlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcmNlbF9lbmFibGVkID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJCYWxsU3BpblwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNwaW4gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBVFNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXRzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRGU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZnNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU29ja2V0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc29ja2V0ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlQmF0dGxlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2VfYmF0dGxlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gaXRlbSBhdHRyaWJ1dGUgXCIke2F0dHJpYnV0ZX1cImApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGl0ZW1zLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICB9XG59XG5cbmNsYXNzIEFwaUl0ZW0ge1xuICAgIHByb2R1Y3RJbmRleCA9IDA7XG4gICAgZGlzcGxheSA9IDA7XG4gICAgaGl0RGlzcGxheSA9IGZhbHNlO1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICB1c2UwID0gMDtcbiAgICB1c2UxID0gMDtcbiAgICB1c2UyID0gMDtcbiAgICBwcmljZVR5cGUgPSBcIkdPTERcIjtcbiAgICBvbGRQcmljZTAgPSAwO1xuICAgIG9sZFByaWNlMSA9IDA7XG4gICAgb2xkUHJpY2UyID0gMDtcbiAgICBwcmljZTAgPSAwO1xuICAgIHByaWNlMSA9IDA7XG4gICAgcHJpY2UyID0gMDtcbiAgICBjb3VwbGVQcmljZSA9IDA7XG4gICAgY2F0ZWdvcnkgPSBcIlwiO1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGdvbGRCYWNrID0gMDtcbiAgICBlbmFibGVQYXJjZWwgPSBmYWxzZTtcbiAgICBmb3JQbGF5ZXIgPSAwO1xuICAgIGl0ZW0wID0gMDtcbiAgICBpdGVtMSA9IDA7XG4gICAgaXRlbTIgPSAwO1xuICAgIGl0ZW0zID0gMDtcbiAgICBpdGVtNCA9IDA7XG4gICAgaXRlbTUgPSAwO1xuICAgIGl0ZW02ID0gMDtcbiAgICBpdGVtNyA9IDA7XG4gICAgaXRlbTggPSAwO1xuICAgIGl0ZW05ID0gMDtcbn1cblxuZnVuY3Rpb24gaXNBcGlJdGVtKG9iajogYW55KTogb2JqIGlzIEFwaUl0ZW0ge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHR5cGVvZiBvYmoucHJvZHVjdEluZGV4ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmRpc3BsYXkgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaGl0RGlzcGxheSA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlZCA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlVHlwZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY291cGxlUHJpY2UgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY2F0ZWdvcnkgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai5nb2xkQmFjayA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5lbmFibGVQYXJjZWwgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmZvclBsYXllciA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOSA9PT0gXCJudW1iZXJcIlxuICAgIF0uZXZlcnkoYiA9PiBiKTtcbn1cblxuLyoqIFByb2R1Y3QgaW5kZXhlcyB0aGF0IHJlamVjdCBzaG9wIGJ1eXMgKFNob3BfSW5pMyBOb2J1eeKJoDApLiBMaXZlIEFQSSBvbWl0cyB0aGlzIGZpZWxkLiAqL1xubGV0IHNob3BOb2J1eVByb2R1Y3RJbmRleGVzOiBSZWFkb25seVNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuXG5mdW5jdGlvbiBpc1Nob3BQdXJjaGFzYWJsZShwcm9kdWN0SW5kZXg6IG51bWJlciwgZW5hYmxlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbmFibGVkICYmICFzaG9wTm9idXlQcm9kdWN0SW5kZXhlcy5oYXMocHJvZHVjdEluZGV4KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VBcGlTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGFwaUl0ZW0gb2YgSlNPTi5wYXJzZShkYXRhKSkge1xuICAgICAgICBpZiAoIWlzQXBpSXRlbShhcGlJdGVtKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW5jb3JyZWN0IGZvcm1hdCBvZiBpdGVtOiAke2RhdGF9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyX2l0ZW1zID0gW1xuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTEsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0yLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMyxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTQsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW01LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTcsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW04LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOSxcbiAgICAgICAgXS5maWx0ZXIoaWQgPT4gISFpZCAmJiBpdGVtcy5nZXQoaWQpKS5tYXAoaWQgPT4gaXRlbXMuZ2V0KGlkKSEpO1xuXG4gICAgICAgIGNvbnN0IHB1cmNoYXNhYmxlID0gaXNTaG9wUHVyY2hhc2FibGUoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0uZW5hYmxlZCk7XG5cbiAgICAgICAgaWYgKGFwaUl0ZW0uY2F0ZWdvcnkgPT09IFwiUEFSVFNcIikge1xuICAgICAgICAgICAgaWYgKGlubmVyX2l0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpbm5lcl9pdGVtc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT25seSByZWFsIHB1cmNoYXNlIHBhdGhzIGNvdW50IGFzIHNob3Agc291cmNlcyAoZXhjbHVkZSBOb2J1eSBjYXRhbG9nIHJvd3MpLlxuICAgICAgICAgICAgaWYgKHB1cmNoYXNhYmxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoXG4gICAgICAgICAgICAgICAgYXBpSXRlbS5wcm9kdWN0SW5kZXgsXG4gICAgICAgICAgICAgICAgbmV3IEdhY2hhKFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByb2R1Y3RJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByaWNlMCxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLmVuYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIHB1cmNoYXNhYmxlLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIC8vIFByb2R1Y3QgaW5kZXggaXMgdGhlIHNob3BfaXRlbXMgLyBnYWNoYXMga2V5IOKAlCByZXF1aXJlZCBzbyByZXdhcmQgdGlsZXNcbiAgICAgICAgICAgIC8vIGNhbiByZXNvbHZlIGNvaW4gYXJ0IHdpdGggZ2FjaGFzLmdldChpdGVtLmlkKSB0aGUgc2FtZSB3YXkgdGhlIHRhYmxlIGRvZXMuXG4gICAgICAgICAgICBnYWNoYUl0ZW0uaWQgPSBhcGlJdGVtLnByb2R1Y3RJbmRleDtcbiAgICAgICAgICAgIGdhY2hhSXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGdhY2hhSXRlbSk7XG4gICAgICAgICAgICBpZiAocHVyY2hhc2FibGUpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0uaWQgPSBhcGlJdGVtLnByb2R1Y3RJbmRleDtcbiAgICAgICAgICAgIG90aGVySXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG90aGVySXRlbSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHYWNoYURhdGEoZGF0YTogc3RyaW5nLCBnYWNoYTogR2FjaGEpIHtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGF0YS5zcGxpdChcIlxcblwiKSkge1xuICAgICAgICBpZiAoIWxpbmUuaW5jbHVkZXMoXCI8TG90dGVyeUl0ZW1fXCIpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL1xccyo8TG90dGVyeUl0ZW1fKD88Y2hhcmFjdGVyPlteIF0qKSBJbmRleD1cIlxcZCtcIiBfTmFtZV89XCJbXlwiXSpcIiBTaG9wSW5kZXg9XCIoPzxzaG9wX2lkPlxcZCspXCIgUXVhbnRpdHlNaW49XCIoPzxxdWFudGl0eV9taW4+XFxkKylcIiBRdWFudGl0eU1heD1cIig/PHF1YW50aXR5X21heD5cXGQrKVwiIENoYW5zUGVyPVwiKD88cHJvYmFiaWxpdHk+XFxkK1xcLj9cXGQqKVxccypcIiBFZmZlY3Q9XCJcXGQrXCIgUHJvZHVjdE9wdD1cIlxcZCtcIlxcLz4vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgcGFyc2luZyBnYWNoYSAke2dhY2hhLmdhY2hhX2luZGV4fTpcXG4ke2xpbmV9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1hdGNoLmdyb3Vwcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYXJhY3RlciA9IG1hdGNoLmdyb3Vwcy5jaGFyYWN0ZXI7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTHVubHVuXCIpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0NoYXJhY3RlcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHtjaGFyYWN0ZXJ9XCIgaW4gbG90dGVyeSBmaWxlICR7Z2FjaGEuZ2FjaGFfaW5kZXh9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQocGFyc2VJbnQobWF0Y2guZ3JvdXBzLnNob3BfaWQpKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gc2hvcCBpdGVtIGlkICR7bWF0Y2guZ3JvdXBzLnNob3BfaWR9IGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2FjaGEuYWRkKGl0ZW0sIHBhcnNlRmxvYXQobWF0Y2guZ3JvdXBzLnByb2JhYmlsaXR5KSwgY2hhcmFjdGVyLCBwYXJzZUludChtYXRjaC5ncm91cHMucXVhbnRpdHlfbWluKSwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21heCkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIG1hcF0gb2YgZ2FjaGEuc2hvcF9pdGVtcykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpdGVtLF0gb2YgbWFwKSB7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChuZXcgR2FjaGFJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHdWFyZGlhbkRhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ3VhcmRpYW5EYXRhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE51bWJlcihvOiBhbnkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBib3NzVGltZUluZm8gPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWFwSW5mbyBvZiBndWFyZGlhbkRhdGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBJbmZvICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXBfbmFtZSA9IG1hcEluZm8uTmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBfbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV3YXJkcyA9IEFycmF5LmlzQXJyYXkobWFwSW5mby5SZXdhcmRzKSA/IFsuLi5tYXBJbmZvLlJld2FyZHNdIDogW107XG4gICAgICAgIGNvbnN0IHJld2FyZF9pdGVtcyA9IHJld2FyZHNcbiAgICAgICAgICAgIC5maWx0ZXIoKHNob3BfaWQpOiBzaG9wX2lkIGlzIG51bWJlciA9PiB0eXBlb2Ygc2hvcF9pZCA9PT0gXCJudW1iZXJcIiAmJiBzaG9wX2l0ZW1zLmhhcyhzaG9wX2lkKSlcbiAgICAgICAgICAgIC5tYXAoc2hvcF9pZCA9PiBzaG9wX2l0ZW1zLmdldChzaG9wX2lkKSEpO1xuICAgICAgICBjb25zdCBFeHBNdWx0aXBsaWVyID0gZ2V0TnVtYmVyKG1hcEluZm8uRXhwTXVsdGlwbGllcikgfHwgMDtcbiAgICAgICAgY29uc3QgSXNCb3NzU3RhZ2UgPSAhIW1hcEluZm8uSXNCb3NzU3RhZ2U7XG4gICAgICAgIGNvbnN0IE1hcElEID0gZ2V0TnVtYmVyKG1hcEluZm8uTWFwSWQpIHx8IDA7XG4gICAgICAgIGxldCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID0gZ2V0TnVtYmVyKG1hcEluZm8uQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcykgfHwgLTE7XG4gICAgICAgIGlmIChCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID09PSAtMSkge1xuICAgICAgICAgICAgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGJvc3NUaW1lSW5mby5nZXQoTWFwSUQpIHx8IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKE1hcElEICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYm9zc1RpbWVJbmZvLnNldChNYXBJRCwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJld2FyZF9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBuZXcgR3VhcmRpYW5JdGVtU291cmNlKG1hcF9uYW1lLCByZXdhcmRfaXRlbXMsIEV4cE11bHRpcGxpZXIsIElzQm9zc1N0YWdlLCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKTtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgUHJvZHVjdFN0YWdlRHJvcCA9IHtcbiAgICByZWFkb25seSBtYXA6IHN0cmluZztcbiAgICByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbjtcbiAgICByZWFkb25seSB4cD86IG51bWJlcjtcbiAgICByZWFkb25seSBib3NzVGltZT86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBwcm9kdWN0cz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHJlYWRvbmx5IFByb2R1Y3RTdGFnZURyb3BbXT4+O1xufTtcblxuLyoqXG4gKiBNZXJnZSBTX1JlbGF0aW9uc2hpcHMtZGVyaXZlZCBib3NzL21hcCBkcm9wcyBvbnRvIHNob3AgcHJvZHVjdHMuXG4gKiBEZWR1cGVzIGJ5IGd1YXJkaWFuIG1hcCBuYW1lIHNvIEd1YXJkaWFuU3RhZ2VzIFJld2FyZHMgcGF0aHMgYXJlIG5vdCBkb3VibGVkLlxuICogVGhpcyBpcyB3aGF0IG1ha2VzIE5vYnV5IGNvaW5zIGxpa2UgQmx1ZSBDYXBzdWxlIGFuc3dlciBcIndoZXJlIGRvIEkgZ2V0IHRoaXM/XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVByb2R1Y3RTdGFnZURyb3BzKGNhdGFsb2c6IFByb2R1Y3RTdGFnZURyb3BzQ2F0YWxvZyk6IHZvaWQge1xuICAgIGNvbnN0IHByb2R1Y3RzID0gY2F0YWxvZy5wcm9kdWN0cztcbiAgICBpZiAoIXByb2R1Y3RzIHx8IHR5cGVvZiBwcm9kdWN0cyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgW3Byb2R1Y3RLZXksIGRyb3BzXSBvZiBPYmplY3QuZW50cmllcyhwcm9kdWN0cykpIHtcbiAgICAgICAgY29uc3QgcHJvZHVjdEluZGV4ID0gTnVtYmVyKHByb2R1Y3RLZXkpO1xuICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcm9kdWN0SW5kZXgpIHx8ICFBcnJheS5pc0FycmF5KGRyb3BzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHByb2R1Y3RJbmRleCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhpc3RpbmdNYXBzID0gbmV3IFNldChcbiAgICAgICAgICAgIGl0ZW0uc291cmNlc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT4gc291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKVxuICAgICAgICAgICAgICAgIC5tYXAoKHNvdXJjZSkgPT4gc291cmNlLmd1YXJkaWFuX21hcCksXG4gICAgICAgICk7XG4gICAgICAgIGZvciAoY29uc3QgZHJvcCBvZiBkcm9wcykge1xuICAgICAgICAgICAgaWYgKCFkcm9wIHx8IHR5cGVvZiBkcm9wLm1hcCAhPT0gXCJzdHJpbmdcIiB8fCBkcm9wLm1hcC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleGlzdGluZ01hcHMuaGFzKGRyb3AubWFwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhpc3RpbmdNYXBzLmFkZChkcm9wLm1hcCk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgR3VhcmRpYW5JdGVtU291cmNlKFxuICAgICAgICAgICAgICAgICAgICBkcm9wLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgW2l0ZW1dLFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZHJvcC54cCA9PT0gXCJudW1iZXJcIiA/IGRyb3AueHAgOiAwLFxuICAgICAgICAgICAgICAgICAgICAhIWRyb3AubmVlZEJvc3MsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkcm9wLmJvc3NUaW1lID09PSBcIm51bWJlclwiID8gZHJvcC5ib3NzVGltZSA6IC0xLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKiogVXNlci1mYWNpbmcgbGFiLXByZXAgcGhhc2VzIOKAlCBuZXZlciBleHBvc2UgcmF3IGZpbGVuYW1lcywgcGF0aHMsIG9yIFhNTCBuYW1lcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkaW5nUGhhc2VGb3JVcmwodXJsOiBzdHJpbmcpOiB7IHRpdGxlOiBzdHJpbmc7IGRldGFpbDogc3RyaW5nIH0ge1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJJdGVtX1BhcnRzXCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJQcmVwYXJpbmcgZXF1aXBtZW50IGNhdGFsb2figKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJHYXRoZXJpbmcgZXZlcnkgd2VhcmFibGUgZm9yIGNvbXBhcmlzb24uXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCIvYXBpL3Nob3BcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkNoZWNraW5nIHRoZSBsaXZlIHNob3DigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJSZWFkaW5nIEdvbGQgYW5kIEFQIGxpc3RpbmdzLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiR3VhcmRpYW5TdGFnZXNcIikgfHwgdXJsLmluY2x1ZGVzKFwicHJvZHVjdC1zdGFnZS1kcm9wc1wiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiTWFwcGluZyBzdGFnZSByZXdhcmRz4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiRmluZGluZyB3aGVyZSBnZWFyIGFuZCBjb2lucyBkcm9wLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiSW5pM19Mb3RcIikgfHwgdXJsLmluY2x1ZGVzKFwibG90dGVyeVwiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiTG9hZGluZyBnYWNoYSB0YWJsZXPigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJNYXRjaGluZyBjYXBzdWxlcyB0byB0aGVpciBwcml6ZXMuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJpdGVtLWFydFwiKSB8fCB1cmwuaW5jbHVkZXMoXCJzaG9wLW5vYnV5XCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJGaW5pc2hpbmcgdGhlIGxhYuKAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIlN5bmNpbmcgYXJ0IGFuZCBzYWxlIHN0YXR1cy5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IFwiT3BlbmluZyB0aGUgZXF1aXBtZW50IGxhYuKAplwiLFxuICAgICAgICBkZXRhaWw6IFwiQWxtb3N0IHJlYWR5IHRvIGNvbXBhcmUgZ2Vhci5cIixcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzZXRMb2FkaW5nUGhhc2UodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwaGFzZSA9IGxvYWRpbmdQaGFzZUZvclVybCh1cmwpO1xuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGlmICh0aXRsZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gcGhhc2UudGl0bGU7XG4gICAgfVxuICAgIGNvbnN0IGRldGFpbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGluZy1zdGF0ZV9fZGV0YWlsXCIpO1xuICAgIGlmIChkZXRhaWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBkZXRhaWwudGV4dENvbnRlbnQgPSBwaGFzZS5kZXRhaWw7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHNldExvYWRpbmdQaGFzZSh1cmwpO1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSsrO1xuICAgIH1cbiAgICBpZiAoIXJlcGx5Lm9rKSB7XG4gICAgICAgIC8vIEtlZXAgdGVjaG5pY2FsIFVSTCBkZXRhaWwgaW4gdGhlIHRocm93biBlcnJvciBmb3IgbG9nczsgVUkgdXNlcyBodW1hbiBjb3B5LlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIGRvd25sb2FkaW5nICR7dXJsfTogJHtyZXBseS5zdGF0dXN9JHtyZXBseS5zdGF0dXNUZXh0ID8gYCAke3JlcGx5LnN0YXR1c1RleHR9YCA6IFwiXCJ9YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVwbHkudGV4dCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRJdGVtcygpIHtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IDEyNDtcbiAgICB9XG4gICAgY29uc3QgaXRlbVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2F1dGgtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBnYWNoYVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2dhbWUtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXMvbG90dGVyeVwiO1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvc2VydmVyLWNvcmUvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGl0ZW1VUkwgPSBpdGVtU291cmNlICsgXCIvSXRlbV9QYXJ0c19JbmkzLnhtbFwiO1xuICAgIGNvbnN0IGl0ZW1EYXRhID0gZG93bmxvYWQoaXRlbVVSTCk7XG4gICAgLy8gQ29tcGFjdCBOb2J1eSBpbmRleCAoZnJvbSBTaG9wX0luaTMpIOKAlCBsaXZlIHNob3AgQVBJIG9taXRzIHRoaXMgZmllbGQuXG4gICAgY29uc3Qgc2hvcE5vYnV5RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3Nob3Atbm9idXktaW5kZXhlcy5qc29uXCIpO1xuICAgIC8vIEJvc3MvbWFwIGRyb3BzIGZyb20gU19SZWxhdGlvbnNoaXBzIChiZXlvbmQgR3VhcmRpYW5TdGFnZXMgUmV3YXJkcyBsaXN0cykuXG4gICAgY29uc3QgcHJvZHVjdFN0YWdlRHJvcHNEYXRhID0gZG93bmxvYWQoXCJhc3NldHMvcHJvZHVjdC1zdGFnZS1kcm9wcy5qc29uXCIpO1xuICAgIGNvbnN0IGl0ZW1BcnREYXRhID0gZG93bmxvYWQoXCJhc3NldHMvaXRlbS1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWFwQXJ0RGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL21hcC1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3Qgc3RhZ2VCb3NzRGF0YSA9IGRvd25sb2FkKFwiYXNzZXRzL3N0YWdlLWJvc3Nlcy5qc29uXCIpO1xuICAgIGNvbnN0IGJvc3NBcnREYXRhID0gZG93bmxvYWQoXCJhc3NldHMvYm9zcy1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWF4X3Nob3BfcGFnZXMgPSAyMDsgLy9jdXJyZW50bHkgbmVlZCBvbmx5IDEwLCBzaG91bGQgYmUgZW5vdWdoXG4gICAgY29uc3Qgc2hvcFVSTHMgPSBsb2NhdGlvbi5ob3N0bmFtZS5lbmRzV2l0aChcIi5naXRodWIuaW9cIilcbiAgICAgICAgPyBbLi4uQXJyYXkobWF4X3Nob3BfcGFnZXMpLmtleXMoKV0ubWFwKG4gPT4gbmV3IFVSTChgc2hvcC8ke259Lmpzb25gLCBkb2N1bWVudC5iYXNlVVJJKS5ocmVmKVxuICAgICAgICA6IFsuLi5BcnJheShtYXhfc2hvcF9wYWdlcykua2V5cygpXS5tYXAobiA9PiBgL2FwaS9zaG9wP3NpemU9MTAwMCZwYWdlPSR7bn1gKTtcbiAgICBjb25zdCBzaG9wRGF0YXMgPSBzaG9wVVJMcy5tYXAoZG93bmxvYWQpO1xuICAgIGNvbnN0IGd1YXJkaWFuVVJMID0gZ3VhcmRpYW5Tb3VyY2UgKyBcIi9HdWFyZGlhblN0YWdlcy5qc29uXCI7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gZG93bmxvYWQoZ3VhcmRpYW5VUkwpO1xuICAgIHBhcnNlSXRlbURhdGEoYXdhaXQgaXRlbURhdGEpO1xuICAgIGl0ZW1BcnRNYXAgPSBKU09OLnBhcnNlKGF3YWl0IGl0ZW1BcnREYXRhKSBhcyBJdGVtQXJ0TWFwO1xuICAgIHRyeSB7XG4gICAgICAgIG1hcEFydE1hcCA9IEpTT04ucGFyc2UoYXdhaXQgbWFwQXJ0RGF0YSkgYXMgTWFwQXJ0Q2F0YWxvZztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgbWFwIGFydCBjYXRhbG9nOiAke2V9YCk7XG4gICAgICAgIG1hcEFydE1hcCA9IHsgZmlsZXM6IHt9LCBieU5hbWU6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2cgPSBKU09OLnBhcnNlKGF3YWl0IHN0YWdlQm9zc0RhdGEpIGFzIFN0YWdlQm9zc0NhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIHN0YWdlIGJvc3MgY2F0YWxvZzogJHtlfWApO1xuICAgICAgICBzdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGJvc3NBcnRDYXRhbG9nID0gSlNPTi5wYXJzZShhd2FpdCBib3NzQXJ0RGF0YSkgYXMgQm9zc0FydENhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIGJvc3MgYXJ0IGNhdGFsb2c6ICR7ZX1gKTtcbiAgICAgICAgYm9zc0FydENhdGFsb2cgPSB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgbm9idXlKc29uID0gSlNPTi5wYXJzZShhd2FpdCBzaG9wTm9idXlEYXRhKSBhcyB7XG4gICAgICAgICAgICBwcm9kdWN0SW5kZXhlcz86IHVua25vd247XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBBcnJheS5pc0FycmF5KG5vYnV5SnNvbi5wcm9kdWN0SW5kZXhlcylcbiAgICAgICAgICAgID8gbm9idXlKc29uLnByb2R1Y3RJbmRleGVzLmZpbHRlcigobik6IG4gaXMgbnVtYmVyID0+IHR5cGVvZiBuID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMgPSBuZXcgU2V0KGluZGV4ZXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBzaG9wIE5vYnV5IGluZGV4OiAke2V9YCk7XG4gICAgICAgIHNob3BOb2J1eVByb2R1Y3RJbmRleGVzID0gbmV3IFNldCgpO1xuICAgIH1cbiAgICBhd2FpdCBQcm9taXNlLmFsbChzaG9wRGF0YXMubWFwKHAgPT4gcC50aGVuKGRhdGEgPT4gcGFyc2VBcGlTaG9wRGF0YShkYXRhKSkpKTtcblxuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSBnYWNoYXMuc2l6ZSArIDQ7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhX2l0ZW1zOiBbUHJvbWlzZTxzdHJpbmc+LCBHYWNoYSwgc3RyaW5nXVtdID0gW107XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhX3VybCA9IGAke2dhY2hhU291cmNlfS9JbmkzX0xvdF8ke2Ake2dhY2hhLmdhY2hhX2luZGV4fWAucGFkU3RhcnQoMiwgXCIwXCIpfS54bWxgO1xuICAgICAgICBnYWNoYV9pdGVtcy5wdXNoKFtkb3dubG9hZChnYWNoYV91cmwpLCBnYWNoYSwgZ2FjaGFfdXJsXSk7XG4gICAgfVxuICAgIHBhcnNlR3VhcmRpYW5EYXRhKGF3YWl0IGd1YXJkaWFuRGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbHlQcm9kdWN0U3RhZ2VEcm9wcyhKU09OLnBhcnNlKGF3YWl0IHByb2R1Y3RTdGFnZURyb3BzRGF0YSkgYXMgUHJvZHVjdFN0YWdlRHJvcHNDYXRhbG9nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgcHJvZHVjdCBzdGFnZSBkcm9wczogJHtlfWApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtpdGVtLCBnYWNoYSwgZ2FjaGFfdXJsXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VHYWNoYURhdGEoYXdhaXQgaXRlbSwgZ2FjaGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBkb3dubG9hZGluZyAke2dhY2hhX3VybH0gYmVjYXVzZSAke2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKiBCYW4vY2lyY2xlLXNsYXNoIGljb24gZm9yIGV4Y2x1ZGUg4oCUIG91dGxpbmUgU1ZHLCByZWNvbG9yZWQgdmlhIGN1cnJlbnRDb2xvci4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV4Y2x1ZGVJY29uKCk6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiaXRlbV9yZW1vdmFsX19pY29uXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIFwiMCAwIDI0IDI0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjE2XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxNlwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJmb2N1c2FibGVcIiwgXCJmYWxzZVwiKTtcblxuICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJjaXJjbGVcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN4XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN5XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInJcIiwgXCI5XCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyXCIpO1xuXG4gICAgY29uc3Qgc2xhc2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwibGluZVwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ4MVwiLCBcIjdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTFcIiwgXCI3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcIngyXCIsIFwiMTdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTJcIiwgXCIxN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMlwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWNhcFwiLCBcInJvdW5kXCIpO1xuXG4gICAgc3ZnLmFwcGVuZChjaXJjbGUsIHNsYXNoKTtcbiAgICByZXR1cm4gc3ZnO1xufVxuXG5mdW5jdGlvbiBkZWxldGFibGVJdGVtKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGV4Y2x1ZGVMYWJlbCA9IGBFeGNsdWRlICR7aXRlbS5uYW1lX2VufSBmcm9tIHJlc3VsdHNgO1xuICAgIGNvbnN0IGV4Y2x1ZGVCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsXCIsXG4gICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpdGVtLmlkfWAsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogZXhjbHVkZUxhYmVsLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIHRpdGxlOiBleGNsdWRlTGFiZWwsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgZXhjbHVkZUJ1dHRvbi5hcHBlbmQoY3JlYXRlRXhjbHVkZUljb24oKSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1pZGVudGl0eVwiIH0sXG4gICAgICAgIGV4Y2x1ZGVCdXR0b24sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlfX21ldGFcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW0sIGNoYXJhY3RlciksXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbSksXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCkge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZGlhbG9nLW9wZW5cIik7XG59XG5cbmZ1bmN0aW9uIHVubG9ja0JhY2tncm91bmRTY3JvbGwoKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkaWFsb2ctb3BlblwiKTtcbn1cblxuZnVuY3Rpb24gc2hvd0RpYWxvZyhcbiAgICB0cmlnZ2VyOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgdG9wRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BfZGl2XCIpO1xuICAgIGlmICghKHRvcERpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXMgPSBkaWFsb2c7XG4gICAgICAgIHByZXZpb3VzLmNsb3NlKCk7XG4gICAgICAgIHByZXZpb3VzLnJlbW92ZSgpO1xuICAgIH1cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogZGlhbG9nQ2xhc3MgPyBgJHtkaWFsb2dDbGFzc31fX2Nsb3NlYCA6IFwiZGlhbG9nX19jbG9zZVwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJDbG9zZVwiLFxuICAgIF0pO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7XG4gICAgICAgIC4uLihkaWFsb2dDbGFzcyA/IHsgY2xhc3M6IGRpYWxvZ0NsYXNzIH0gOiB7fSksXG4gICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICB9O1xuICAgIGRpYWxvZyA9IEFycmF5LmlzQXJyYXkoY29udGVudClcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCBhdHRyaWJ1dGVzLCAuLi5jb250ZW50LCBjbG9zZUJ1dHRvbl0pXG4gICAgICAgIDogY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgY29udGVudCwgY2xvc2VCdXR0b25dKTtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJ0cnVlXCIpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBkaWFsb2c/LmNsb3NlKCkpO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgZGlhbG9nPy5yZW1vdmUoKTtcbiAgICAgICAgZGlhbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICB1bmxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgdG9wRGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcInBvcHVwX2xpbmtcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBcImFyaWEtaGFzcG9wdXBcIjogXCJkaWFsb2dcIixcbiAgICAgICAgICAgIFwiYXJpYS1leHBhbmRlZFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHRleHQsXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coYnV0dG9uLCBgJHt0ZXh0fSBkZXRhaWxzYCwgY29udGVudCwgZGlhbG9nQ2xhc3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdDogc3RyaW5nKTogSFRNTFRhYmxlQ2VsbEVsZW1lbnQge1xuICAgIGNvbnN0IHsgc2hvcnQsIGZ1bGwsIGFiYnJldmlhdGVkIH0gPSBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5KHN0YXQpO1xuICAgIGlmICghYWJicmV2aWF0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1widGhcIiwgeyBjbGFzczogXCJudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIHNob3J0XSk7XG4gICAgfVxuICAgIGNvbnN0IHBvcHVwID0gY3JlYXRlUG9wdXBMaW5rKHNob3J0LCBjcmVhdGVIVE1MKFtcInBcIiwgZnVsbF0pKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBmdWxsKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGZ1bGwpO1xuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoXCJwcmlvcml0eS1zdGF0LWhlYWRlclwiKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0aFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgcG9wdXBdKTtcbn1cblxuZnVuY3Rpb24gcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gMSAmJiBxdWFudGl0eV9tYXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChxdWFudGl0eV9taW4gPT09IHF1YW50aXR5X21heCkge1xuICAgICAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWF4fWA7XG4gICAgfVxuICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9taW59LSR7cXVhbnRpdHlfbWF4fWA7XG59XG5cbi8qKlxuICogR2FjaGEgZHJvcC1kZXRhaWxzIHRhYmxlOiBJdGVtIHwgQ2hhbmNlIHwgRXhwZWN0ZWQgcHVsbHMuXG4gKiBDaGFyYWN0ZXIgaXMgbmV2ZXIgYSBjb2x1bW4g4oCUIGVxdWlwbWVudCBwb29scyBtaXJyb3IgYWNyb3NzIGNoYXJhY3RlcnMsIHNvIGxpc3RpbmdcbiAqIE5pa2kvTHVuTHVuL+KApiBkdXBsaWNhdGVzIHRoZSBzYW1lIHJvd3MuIFdoZW4gbm8gY2hhcmFjdGVyIGZpbHRlciBpcyBzZXQsIHNhbWUtbmFtZVxuICogcm93cyAod2l0aCB0aGUgc2FtZSBxdWFudGl0eSByYW5nZSkgY29sbGFwc2UgdG8gb25lIGVudHJ5IHVzaW5nIHRoZSBmaXJzdCBwb29sIHJhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShcbiAgICBnYWNoYTogR2FjaGEsXG4gICAgaGlnaGxpZ2h0ZWRJdGVtPzogSXRlbSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pO1xuXG4gICAgdHlwZSBSb3cgPSB7XG4gICAgICAgIGl0ZW06IEl0ZW07XG4gICAgICAgIHByb2JhYmlsaXR5OiBudW1iZXI7XG4gICAgICAgIHF1YW50aXR5X21pbjogbnVtYmVyO1xuICAgICAgICBxdWFudGl0eV9tYXg6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgLy8gQ2hhcmFjdGVyIGZpbHRlcjogYWNjdW11bGF0ZSBieSBJdGVtIGlkZW50aXR5IChoaXN0b3JpY2FsIG1hdGgpLlxuICAgIC8vIFVuZmlsdGVyZWQ6IGNvbGxhcHNlIGJ5IGRpc3BsYXkgbmFtZSArIHF1YW50aXR5IHNvIHBlci1jaGFyYWN0ZXIgY2xvbmVzIGFyZSBvbmUgcm93LlxuICAgIGNvbnN0IGJ5SXRlbSA9IGNoYXJhY3RlciA/IG5ldyBNYXA8SXRlbSwgUm93PigpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGJ5TmFtZSA9IGNoYXJhY3RlciA/IHVuZGVmaW5lZCA6IG5ldyBNYXA8c3RyaW5nLCBSb3c+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgLy8gQ2hhcmFjdGVyLWZpbHRlcmVkOiBrZWVwIGhpc3RvcmljYWwgZGVub21pbmF0b3IgKGl0ZW0gY2hhcmFjdGVyLCBlbHNlIGZpbHRlciwgZWxzZSB0b3RhbCkuXG4gICAgICAgICAgICAvLyBVbmZpbHRlcmVkIGNvbGxhcHNlOiByYXRlcyBhcmUgd2l0aGluIGVhY2ggY2hhcmFjdGVyJ3MgcG9vbCAocG9vbHMgbWlycm9yOyBmaXJzdCByb3cgd2lucykuXG4gICAgICAgICAgICAvLyBVc2luZyB0b3RhbF9wcm9iYWJpbGl0eSBmb3Igc2hhcmVkIGl0ZW1zIHdvdWxkIGRpbHV0ZSB+N8OXIGFuZCByZWludHJvZHVjZSB3cm9uZyByYXRlcy5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBnYWNoYS5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXIpIVxuICAgICAgICAgICAgICAgIDogKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1fY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoaXRlbV9jaGFyYWN0ZXIpIVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBnYWNoYS50b3RhbF9wcm9iYWJpbGl0eTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSB0aWNrZXRzIC8gaXRlbV90aWNrZXRzO1xuXG4gICAgICAgICAgICBpZiAoYnlJdGVtKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBieUl0ZW0uZ2V0KGNoYXJfZ2FjaGFfaXRlbSk7XG4gICAgICAgICAgICAgICAgYnlJdGVtLnNldChjaGFyX2dhY2hhX2l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hhcl9nYWNoYV9pdGVtLFxuICAgICAgICAgICAgICAgICAgICBwcm9iYWJpbGl0eTogKHByZXZpb3VzPy5wcm9iYWJpbGl0eSA/PyAwKSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhcl9nYWNoYV9pdGVtLm5hbWVfZW59XFwwJHtxdWFudGl0eV9taW59XFwwJHtxdWFudGl0eV9tYXh9YDtcbiAgICAgICAgICAgIGlmICghYnlOYW1lIS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIGJ5TmFtZSEuc2V0KGtleSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGFyX2dhY2hhX2l0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJvd3MgPSBieUl0ZW0gPyBbLi4uYnlJdGVtLnZhbHVlcygpXSA6IFsuLi5ieU5hbWUhLnZhbHVlcygpXTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWRJdGVtICE9PSB1bmRlZmluZWQgJiYgKFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRJdGVtID09PSByb3cuaXRlbVxuICAgICAgICAgICAgfHwgKFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgJiYgaGlnaGxpZ2h0ZWRJdGVtLm5hbWVfZW4gPT09IHJvdy5pdGVtLm5hbWVfZW5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgW1widGRcIiwgcm93Lml0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocm93LnF1YW50aXR5X21pbiwgcm93LnF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHJvdy5wcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyByb3cucHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbTogSXRlbSB8IHVuZGVmaW5lZCwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLFxuICAgICAgICBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShnYWNoYSwgaXRlbSwgY2hhcmFjdGVyKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBTaG9wSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnRUYWJsZSA9IGNyZWF0ZUhUTUwoW1widGFibGVcIiwgW1widHJcIiwgW1widGhcIiwgXCJDb250ZW50c1wiXV1dKTtcbiAgICBmb3IgKGNvbnN0IGlubmVyX2l0ZW0gb2YgaXRlbVNvdXJjZS5pdGVtcykge1xuICAgICAgICBjb250ZW50VGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiLCBpbm5lcl9pdGVtID09PSBpdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLCBbXCJ0ZFwiLCBpbm5lcl9pdGVtLm5hbWVfZW5dXSkpO1xuICAgIH1cbiAgICAvLyBEaWFsb2cgYXJpYS1sYWJlbCBhbHJlYWR5IGNhcnJpZXMgdGhlIHNldCBuYW1lIOKAlCBvbmx5IHNob3cgdGhlIGNvbnRlbnRzIHRhYmxlLlxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIGNvbnRlbnRUYWJsZSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVCb3NzQXJ0RmlsZShib3NzSWQ6IG51bWJlciwgcmVzSWQ/OiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGJ5SWQgPSBib3NzQXJ0Q2F0YWxvZy5ieUJvc3NJZD8uW2Ake2Jvc3NJZH1gXTtcbiAgICBpZiAoYnlJZCkge1xuICAgICAgICByZXR1cm4gYnlJZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXNJZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gYm9zc0FydENhdGFsb2cuYnlSZXNJZD8uW2Ake3Jlc0lkfWBdO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCb3NzUG9ydHJhaXQocHJvamVjdGlvbjogU3RhZ2VCb3NzUHJvamVjdGlvbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcHJvamVjdGlvbi5ib3NzZXNbMF07XG4gICAgY29uc3QgYm9zc05hbWUgPSBwcmltYXJ5Py5uYW1lID8/IChwcm9qZWN0aW9uLmlzQm9zc1N0YWdlID8gXCJCb3NzXCIgOiBcIkd1YXJkaWFuXCIpO1xuICAgIGNvbnN0IGZpbGUgPSBwcmltYXJ5XG4gICAgICAgID8gcmVzb2x2ZUJvc3NBcnRGaWxlKHByaW1hcnkuaWQsIHByaW1hcnkucmVzSWQpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3BvcnRyYWl0XCIsIFwiZGF0YS1oYXMtYm9zcy1hcnRcIjogXCJ0cnVlXCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcG9ydHJhaXQtaW1hZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgYXNzZXRzL2Jvc3MtYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXG4gICAgICAgICAgICAgICAgICAgIGFsdDogYEJvc3MgYXJ0d29yayBmb3IgJHtib3NzTmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIxMjhcIixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjEyOFwiLFxuICAgICAgICAgICAgICAgICAgICBkZWNvZGluZzogXCJhc3luY1wiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19wb3J0cmFpdCBzdGFnZS1kZXRhaWxzX19wb3J0cmFpdC0tZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYEJvc3MgYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtib3NzTmFtZX1gLFxuICAgICAgICAgICAgXCJkYXRhLWhhcy1ib3NzLWFydFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGJvc3NOYW1lLnNsaWNlKDAsIDEpLnRvVXBwZXJDYXNlKCldLFxuICAgIF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmUgdGhlIEdhY2hhIGJlaGluZCBhIHNob3AgcHJvZHVjdCBJdGVtIChzdGFnZSByZXdhcmRzIGFyZSBzaG9wX2l0ZW1zIGVudHJpZXMpLlxuICogTG90dGVyeSBpdGVtcyB1c2VkIHRvIGxlYXZlIGl0ZW0uaWQgYXQgMCDigJQgc3RpbGwgc3VwcG9ydCByZXZlcnNlIGxvb2t1cCBmb3IgdGhvc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kR2FjaGFGb3JTaG9wSXRlbShpdGVtOiBJdGVtKTogR2FjaGEgfCB1bmRlZmluZWQge1xuICAgIGlmIChpdGVtLmlkICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IGJ5SWQgPSBnYWNoYXMuZ2V0KGl0ZW0uaWQpO1xuICAgICAgICBpZiAoYnlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ5SWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBbc2hvcEluZGV4LCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGlmIChzaG9wX2l0ZW1zLmdldChzaG9wSW5kZXgpID09PSBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2FjaGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBnYWNoYSBvZiBnYWNoYXMudmFsdWVzKCkpIHtcbiAgICAgICAgaWYgKGdhY2hhLm5hbWUgPT09IGl0ZW0ubmFtZV9lbikge1xuICAgICAgICAgICAgcmV0dXJuIGdhY2hhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV3YXJkIHRpbGUgYXJ0OiBnYWNoYSBjb2lucyB1c2UgdGhlIHNhbWUgbG90dGVyeSBzcHJpdGUgYXMgdGhlIHJlc3VsdHMgdGFibGVcbiAqIChgY3JlYXRlR2FjaGFDb2luQXJ0YCkuIEVxdWlwbWVudCB1c2VzIEl0ZW1fUGFydHMgc2hlZXQgY2VsbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZVJld2FyZEFydChpdGVtOiBJdGVtKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBmaW5kR2FjaGFGb3JTaG9wSXRlbShpdGVtKTtcbiAgICBpZiAoZ2FjaGEpIHtcbiAgICAgICAgLy8gU2FtZSBwYXRoIGFzIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSAvIGdhY2hhIHRhYmxlIGNvbHVtbi5cbiAgICAgICAgY29uc3QgY29pbiA9IGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSk7XG4gICAgICAgIC8vIEtlZXAgcmV3YXJkLXJvdyBzaXppbmcgaG9va3Mgd2l0aG91dCBsb3NpbmcgdGhlIGNpcmN1bGFyIGNvaW4gbG9vay5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHR5cGVvZiBjb2luLmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIiA/IGNvaW4uY2xhc3NOYW1lIDogXCJcIjtcbiAgICAgICAgaWYgKCFjbGFzc2VzLnNwbGl0KC9cXHMrLykuaW5jbHVkZXMoXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0XCIpKSB7XG4gICAgICAgICAgICBjb2luLmNsYXNzTmFtZSA9IGAke2NsYXNzZXN9IHN0YWdlLWRldGFpbHNfX3Jld2FyZC1hcnQgc3RhZ2UtZGV0YWlsc19fcmV3YXJkLWFydC0tY29pbmAudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2luO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSXRlbUFydChpdGVtLCA0MCwgXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0XCIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdGFnZUJvc3NMaXN0KHByb2plY3Rpb246IFN0YWdlQm9zc1Byb2plY3Rpb24pIHtcbiAgICBpZiAocHJvamVjdGlvbi5ib3NzTmFtZXMubGVuZ3RoID09PSAwICYmIHByb2plY3Rpb24uc2lkZUd1YXJkaWFuTmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGJvc3NJdGVtcyA9IHByb2plY3Rpb24uYm9zc2VzLm1hcCgoYm9zcykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gcmVzb2x2ZUJvc3NBcnRGaWxlKGJvc3MuaWQsIGJvc3MucmVzSWQpO1xuICAgICAgICBjb25zdCB0aHVtYiA9IGZpbGVcbiAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJpbWdcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2Jvc3MtdGh1bWJcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgYXNzZXRzL2Jvc3MtYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUpfWAsXG4gICAgICAgICAgICAgICAgICAgIGFsdDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiNDBcIixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjQwXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlY29kaW5nOiBcImFzeW5jXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy10aHVtYiBzdGFnZS1kZXRhaWxzX19ib3NzLXRodW1iLS1mYWxsYmFja1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sXG4gICAgICAgICAgICAgICAgYm9zcy5uYW1lLnNsaWNlKDAsIDEpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy1pdGVtIHN0YWdlLWRldGFpbHNfX2Jvc3MtaXRlbS0tcHJpbWFyeVwiIH0sXG4gICAgICAgICAgICB0aHVtYixcbiAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLXJvbGVcIiB9LCBcIkJvc3NcIl0sXG4gICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zcy1uYW1lXCIgfSwgYm9zcy5uYW1lXSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgLy8gR3VhcmRpYW5zTGVmdC9SaWdodC9NaWRkbGUgYXJlIGEgc3Bhd24gKnBvb2wqIOKAlCBvbmUgbGVmdCArIG9uZSByaWdodCBhdCBmaWdodCB0aW1lLlxuICAgIGNvbnN0IHNpZGVOb3RlID0gcHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGggPiAwXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2xcIiB9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLWxhYmVsXCIgfSxcbiAgICAgICAgICAgICAgICBgU2lkZSBjb21wYW5pb25zIChwb29sIG9mICR7cHJvamVjdGlvbi5zaWRlR3VhcmRpYW5OYW1lcy5sZW5ndGh9KWAsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLW5hbWVzXCIgfSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmpvaW4oXCIgwrcgXCIpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NpZGUtcG9vbC1oaW50XCIgfSxcbiAgICAgICAgICAgICAgICBcIk9uZSBsZWZ0IGFuZCBvbmUgcmlnaHQgc3Bhd24gd2l0aCB0aGUgYm9zczsgdGhlIHJlc3QgYXJlIHBvc3NpYmxlIGRyYXdzLlwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qgc2VjdGlvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwic3RhZ2UtZGV0YWlscy1ib3NzZXNcIiB9LFxuICAgICAgICBbXG4gICAgICAgICAgICBcImgzXCIsXG4gICAgICAgICAgICB7IGlkOiBcInN0YWdlLWRldGFpbHMtYm9zc2VzXCIgfSxcbiAgICAgICAgICAgIHByb2plY3Rpb24uYm9zc05hbWVzLmxlbmd0aCA+IDEgPyBcIkJvc3Nlc1wiIDogXCJCb3NzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fYm9zc2VzXCIgfSxcbiAgICAgICAgICAgIC4uLmJvc3NJdGVtcyxcbiAgICAgICAgXSxcbiAgICBdKTtcbiAgICBpZiAoc2lkZU5vdGUpIHtcbiAgICAgICAgc2VjdGlvbi5hcHBlbmRDaGlsZChzaWRlTm90ZSk7XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9uO1xufVxuXG4vKipcbiAqIFN0YWdlIGRvc3NpZXIgZm9yIEd1YXJkaWFuIC8gQm9zcyBtYXAgY2hpcHM6IGJvc3MgcG9ydHJhaXQsIEpGVFNFIGJvc3MgbmFtZXMsXG4gKiByZWFkYWJsZSBmYWN0cywgYW5kIHJld2FyZCBsaXN0IHdpdGggdGhlIHNhbWUgYXJ0IGFzIHRoZSByZXN1bHRzIHRhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhZ2VEZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBpc0Jvc3MgPSBpdGVtU291cmNlLm5lZWRfYm9zcztcbiAgICBjb25zdCB0aXRsZSA9IHN0YWdlVGl0bGVOYW1lKGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwKTtcbiAgICBjb25zdCBleWVicm93ID0gaXNCb3NzID8gXCJCb3NzIHN0YWdlXCIgOiBcIkd1YXJkaWFuIHN0YWdlXCI7XG4gICAgY29uc3QgYm9zc1Byb2plY3Rpb24gPSBwcm9qZWN0U3RhZ2VCb3NzZXMoXG4gICAgICAgIGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICBpc0Jvc3MsXG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2csXG4gICAgKTtcbiAgICBjb25zdCByZXdhcmRzID0gaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPiAwXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZHNcIiB9LFxuICAgICAgICAgICAgLi4uaXRlbVNvdXJjZS5pdGVtcy5tYXAoKHJld2FyZCkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHJld2FyZCA9PT0gaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInN0YWdlLWRldGFpbHNfX3Jld2FyZCBzdGFnZS1kZXRhaWxzX19yZXdhcmQtLWN1cnJlbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlU3RhZ2VSZXdhcmRBcnQocmV3YXJkKSxcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkLW5hbWVcIiB9LCByZXdhcmQubmFtZV9lbl0sXG4gICAgICAgICAgICAgICAgLi4uKHJld2FyZCA9PT0gaXRlbVxuICAgICAgICAgICAgICAgICAgICA/IFtjcmVhdGVIVE1MKFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtYmFkZ2VcIiB9LCBcIlRoaXMgaXRlbVwiXSldXG4gICAgICAgICAgICAgICAgICAgIDogW10pLFxuICAgICAgICAgICAgXSkpLFxuICAgICAgICBdKVxuICAgICAgICA6IGNyZWF0ZUhUTUwoW1wicFwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBsaXN0ZWQgcmV3YXJkcyBmb3IgdGhpcyBzdGFnZS5cIl0pO1xuXG4gICAgY29uc3QgYm9zc1NlY3Rpb24gPSBjcmVhdGVTdGFnZUJvc3NMaXN0KGJvc3NQcm9qZWN0aW9uKTtcblxuICAgIGNvbnN0IGlkZW50aXR5ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19faWRlbnRpdHlcIiB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fZXllYnJvd1wiIH0sIGV5ZWJyb3ddLFxuICAgICAgICBbXCJoMlwiLCB0aXRsZV0sXG4gICAgXSk7XG5cbiAgICBjb25zdCBoZWFkZXIgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJoZWFkZXJcIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19oZWFkZXJcIiB9LFxuICAgICAgICBjcmVhdGVCb3NzUG9ydHJhaXQoYm9zc1Byb2plY3Rpb24pLFxuICAgICAgICBpZGVudGl0eSxcbiAgICBdKTtcblxuICAgIGNvbnN0IGFydGljbGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJhcnRpY2xlXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBpc0Jvc3NcbiAgICAgICAgICAgICAgICA/IFwic3RhZ2UtZGV0YWlscyBzdGFnZS1kZXRhaWxzLS1ib3NzXCJcbiAgICAgICAgICAgICAgICA6IFwic3RhZ2UtZGV0YWlscyBzdGFnZS1kZXRhaWxzLS1ndWFyZGlhblwiLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXIsXG4gICAgXSk7XG4gICAgaWYgKGJvc3NTZWN0aW9uKSB7XG4gICAgICAgIGFydGljbGUuYXBwZW5kQ2hpbGQoYm9zc1NlY3Rpb24pO1xuICAgIH1cbiAgICBhcnRpY2xlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwic3RhZ2UtZGV0YWlscy1yZXdhcmRzXCIgfSxcbiAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJzdGFnZS1kZXRhaWxzLXJld2FyZHNcIiB9LCBcIlJld2FyZHNcIl0sXG4gICAgICAgIHJld2FyZHMsXG4gICAgXSkpO1xuICAgIHJldHVybiBhcnRpY2xlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IG1hcExhYmVsID0gc3RhZ2VDaGFubmVsTGFiZWwoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGl0ZW1Tb3VyY2UubmVlZF9ib3NzKTtcbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKFxuICAgICAgICBtYXBMYWJlbCxcbiAgICAgICAgY3JlYXRlU3RhZ2VEZXRhaWxzQ29udGVudChpdGVtLCBpdGVtU291cmNlKSxcbiAgICAgICAgXCJzdGFnZS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoXG4gICAgaXRlbTogSXRlbSxcbiAgICBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIHJldHVybiBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgLm1hcChpdGVtU291cmNlID0+IHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW0sIGl0ZW1Tb3VyY2UsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50Q2xhc3NUb2tlbnMoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgLy8gUHJlZmVyIGNsYXNzTmFtZSBvdmVyIGNsYXNzTGlzdCDigJQgdGhlIHVuaXQgRE9NIGhhcm5lc3Mgc2V0cyBjbGFzc05hbWUgdmlhXG4gICAgLy8gc2V0QXR0cmlidXRlKFwiY2xhc3NcIikgYW5kIGRvZXMgbm90IGltcGxlbWVudCBhIGZ1bGwgY2xhc3NMaXN0LlxuICAgIGNvbnN0IHJhdyA9IHR5cGVvZiBlbGVtZW50LmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgICA/IGVsZW1lbnQuY2xhc3NOYW1lXG4gICAgICAgIDogZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiO1xuICAgIHJldHVybiByYXcuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIGlzR2FjaGFTb3VyY2VHcm91cChlbGVtZW50czogcmVhZG9ubHkgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLnNvbWUoXG4gICAgICAgIChlbGVtZW50KSA9PlxuICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQgIT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICYmIGVsZW1lbnRDbGFzc1Rva2VucyhlbGVtZW50KS5pbmNsdWRlcyhcImdhY2hhLXNvdXJjZS1zdW1tYXJ5XCIpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1ha2VTb3VyY2VzTGlzdChsaXN0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW11bXSk6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgY29uc3QgcmVzdWx0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gPSBbXTtcbiAgICBmdW5jdGlvbiBhZGQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID0gcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSArIGVsZW1lbnQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XG4gICAgfVxuICAgIGxldCBwcmV2aW91c0dyb3VwOiByZWFkb25seSAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gfCB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBlbGVtZW50cyBvZiBsaXN0KSB7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFkZChcIiBcIik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb21tYSBiZXR3ZWVuIHNob3Avc2V0L2d1YXJkaWFuIHBhdGhzIHNvIGR1YWwgcHJpY2VzIHN0YXkgbGVnaWJsZVxuICAgICAgICAvLyAoXCI1MDAwMCBHb2xkLCBTdXBwb3J0ZXIgU2V0IDM1MDAwMCBHb2xkXCIpLiBOZXZlciBuZXh0IHRvIGdhY2hhIGNvaW4gY2FyZHMg4oCUXG4gICAgICAgIC8vIHRob3NlIGFyZSBibG9jayBzdW1tYXJpZXMgYW5kIGEgdGV4dCBjb21tYSBiZWNvbWVzIGEgdmlzdWFsIGJyZWFrLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwcmV2aW91c0dyb3VwICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAocHJldmlvdXNHcm91cClcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAoZWxlbWVudHMpXG4gICAgICAgICkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXNHcm91cCA9IGVsZW1lbnRzO1xuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpOiBib29sZWFuIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlIHx8IGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldChpdGVtU291cmNlLnNob3BfaWQpO1xuICAgICAgICBpZiAoZ2FjaGE/LmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlICE9PSBpdGVtU291cmNlICYmIGlzQXZhaWxhYmxlSXRlbVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICBpZiAoaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUF2YWlsYWJpbGl0eUJhZGdlKGl0ZW06IEl0ZW0pIHtcbiAgICBpZiAoaXNJdGVtQ3VycmVudGx5QXZhaWxhYmxlKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWF2YWlsYWJpbGl0eSBpdGVtLWF2YWlsYWJpbGl0eS0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vIGVuYWJsZWQgc2hvcCwgZ2FjaGEsIG9yIEd1YXJkaWFuIHBhdGggaW4gdGhlIGxpdmUgc2hvcCBkYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiTm90IGluIGdhbWVcIixcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY29sbGVjdEdhY2hhU291cmNlSW5wdXRzKGNvaW46IEl0ZW0gfCB1bmRlZmluZWQpOiBHYWNoYVNvdXJjZUlucHV0W10ge1xuICAgIGlmICghY29pbikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGlucHV0czogR2FjaGFTb3VyY2VJbnB1dFtdID0gW107XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgY29pbi5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goeyBraW5kOiBcInNob3BcIiwgYXA6IHNvdXJjZS5hcCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICAgICAgbWFwOiBzb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICAgICAgICAgIG5lZWRCb3NzOiBzb3VyY2UubmVlZF9ib3NzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlucHV0cztcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTaG9wQ2hhbm5lbExhYmVsKFxuICAgIGN1cnJlbmN5OiBcIkdvbGRcIiB8IFwiQVBcIixcbiAgICBhdmFpbGFibGU6IGJvb2xlYW4sXG4gICAgcmVhc29uPzogXCJub3RfZm9yX3NhbGVcIiB8IFwibm90X2F2YWlsYWJsZVwiLFxuKTogSFRNTEVsZW1lbnQge1xuICAgIGlmIChhdmFpbGFibGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbmN5ID09PSBcIkFQXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1hcFwiIH0sXG4gICAgICAgICAgICAgICAgXCJBUFwiLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1nb2xkXCIgfSxcbiAgICAgICAgICAgIFwiR29sZFwiLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgaWYgKHJlYXNvbiA9PT0gXCJub3RfZm9yX3NhbGVcIikge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWZvci1zYWxlXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBwcm9kdWN0IGlzIGxpc3RlZCBpbiB0aGUgc2hvcCBjYXRhbG9nIGJ1dCBjYW5ub3QgYmUgcHVyY2hhc2VkIChOb2J1eSlgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiTm90IGZvciBzYWxlXCIsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBjb2luIGlzIG5vdCBjdXJyZW50bHkgc29sZCBpbiB0aGUgbGl2ZSBzaG9wYCxcbiAgICAgICAgfSxcbiAgICAgICAgYCR7Y3VycmVuY3l9IMK3IE5vdCBhdmFpbGFibGVgLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVN0YWdlQ2hhbm5lbExhYmVsKFxuICAgIGNvaW46IEl0ZW0gfCB1bmRlZmluZWQsXG4gICAgbWFwOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgbGFiZWw6IHN0cmluZyxcbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IGNvaW4/LnNvdXJjZXMuZmluZChcbiAgICAgICAgKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT5cbiAgICAgICAgICAgIHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSAmJiBzb3VyY2UuZ3VhcmRpYW5fbWFwID09PSBtYXAsXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsQ2xhc3MgPSBuZWVkQm9zc1xuICAgICAgICA/IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIlxuICAgICAgICA6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCI7XG4gICAgaWYgKGd1YXJkaWFuU291cmNlICYmIGNvaW4pIHtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBjcmVhdGVHdWFyZGlhblBvcHVwKGNvaW4sIGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBwb3B1cC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcInBvcHVwX2xpbmtcIjtcbiAgICAgICAgcG9wdXAuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYCR7ZXhpc3Rpbmd9ICR7Y2hhbm5lbENsYXNzfWApO1xuICAgICAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGxhYmVsKTtcbiAgICAgICAgcmV0dXJuIHBvcHVwO1xuICAgIH1cbiAgICBpZiAobmVlZEJvc3MpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYEJvc3Mgc3RhZ2UgZHJvcDogJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKX1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCIsXG4gICAgICAgICAgICB0aXRsZTogYEd1YXJkaWFuIHN0YWdlIGRyb3A6ICR7cHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCl9YCxcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWwsXG4gICAgXSk7XG59XG5cbi8qKiBLZXB0IGZvciBjb250cmFjdHMgdGhhdCBwaW4gdGhlIGhlbHBlciBuYW1lOyByZXR1cm5zIHNob3AgKyBzdGFnZSBjaGFubmVsIGNoaXBzLiAqL1xuZnVuY3Rpb24gY3JlYXRlR2FjaGFDdXJyZW5jeUxhYmVsKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBjaGFubmVscyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIGlmIChjaGFubmVscy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5uZWxzWzBdITtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAgeyBjbGFzczogXCJnYWNoYS1hY3F1aXNpdGlvbi1jaGFubmVsc1wiIH0sXG4gICAgICAgIC4uLmNoYW5uZWxzLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbEVsZW1lbnRzKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNvaW4gPSBzaG9wX2l0ZW1zLmdldChnYWNoYS5zaG9wX2luZGV4KTtcbiAgICBjb25zdCBwcm9qZWN0ZWQgPSBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzKFxuICAgICAgICB7XG4gICAgICAgICAgICBhcDogZ2FjaGEuYXAsXG4gICAgICAgICAgICBlbmFibGVkOiBnYWNoYS5lbmFibGVkLFxuICAgICAgICAgICAgcHVyY2hhc2FibGU6IGdhY2hhLnB1cmNoYXNhYmxlLFxuICAgICAgICB9LFxuICAgICAgICBjb2xsZWN0R2FjaGFTb3VyY2VJbnB1dHMoY29pbiksXG4gICAgKTtcbiAgICByZXR1cm4gcHJvamVjdGVkLm1hcCgoY2hhbm5lbCkgPT4ge1xuICAgICAgICBpZiAoY2hhbm5lbC5raW5kID09PSBcInNob3BcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUdhY2hhU2hvcENoYW5uZWxMYWJlbChcbiAgICAgICAgICAgICAgICBjaGFubmVsLmN1cnJlbmN5LFxuICAgICAgICAgICAgICAgIGNoYW5uZWwuYXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIGNoYW5uZWwucmVhc29uLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlR2FjaGFTdGFnZUNoYW5uZWxMYWJlbChcbiAgICAgICAgICAgIGNvaW4sXG4gICAgICAgICAgICBjaGFubmVsLm1hcCxcbiAgICAgICAgICAgIGNoYW5uZWwubmVlZEJvc3MsXG4gICAgICAgICAgICBjaGFubmVsLmxhYmVsLFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoXG4gICAgaXRlbTogSXRlbSB8IHVuZGVmaW5lZCxcbiAgICBpdGVtU291cmNlOiBHYWNoYUl0ZW1Tb3VyY2UsXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyLFxuKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGNoYW5uZWxFbGVtZW50cyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIixcbiAgICAgICAgICAgIHJvbGU6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBhY3F1aXNpdGlvbmAsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSksXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5X19jb250ZW50XCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtaWRlbnRpdHlcIiB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbiA/IHVuZGVmaW5lZCA6IGNoYXJhY3RlcixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtYWNxdWlzaXRpb24tY2hhbm5lbHNcIixcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBzb3VyY2VzYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLmNoYW5uZWxFbGVtZW50cy5tYXAoKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcImdhY2hhLWFjcXVpc2l0aW9uLWNoYW5uZWxzX19pdGVtXCIsIHJvbGU6IFwibGlzdGl0ZW1cIiB9LCBlbGVtZW50XSksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UsIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoaXRlbSwgaXRlbVNvdXJjZSwgY2hhcmFjdGVyKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICBpZiAoaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBbYCR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGNyZWF0ZVNldFNvdXJjZVBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UpLFxuICAgICAgICAgICAgYCAke2l0ZW1Tb3VyY2UucHJpY2V9ICR7aXRlbVNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwifWBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSldO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXRlbURldGFpbFN0YXRzKGl0ZW06IEl0ZW0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBbXCJNb3ZlbWVudFwiLCBpdGVtLm1vdmVtZW50XSxcbiAgICAgICAgW1wiQ2hhcmdlXCIsIGl0ZW0uY2hhcmdlXSxcbiAgICAgICAgW1wiTG9iXCIsIGl0ZW0ubG9iXSxcbiAgICAgICAgW1wiU21hc2hcIiwgaXRlbS5zbWFzaF0sXG4gICAgICAgIFtcIlN0cmVuZ3RoXCIsIGl0ZW0uc3RyXSxcbiAgICAgICAgW1wiRGV4dGVyaXR5XCIsIGl0ZW0uZGV4XSxcbiAgICAgICAgW1wiU3RhbWluYVwiLCBpdGVtLnN0YV0sXG4gICAgICAgIFtcIldpbGxcIiwgaXRlbS53aWxdLFxuICAgICAgICBbXCJTZXJ2ZVwiLCBpdGVtLnNlcnZlXSxcbiAgICAgICAgW1wiSFBcIiwgaXRlbS5ocF0sXG4gICAgICAgIFtcIlF1aWNrc2xvdHNcIiwgaXRlbS5xdWlja3Nsb3RzXSxcbiAgICAgICAgW1wiQnVmZnNsb3RzXCIsIGl0ZW0uYnVmZnNsb3RzXSxcbiAgICBdIGFzIGNvbnN0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBpdGVtRGV0YWlsU3RhdHMoaXRlbSkuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlICE9PSAwKTtcbiAgICBjb25zdCBzb3VyY2VzID0gbWFrZVNvdXJjZXNMaXN0KFxuICAgICAgICBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW0sICgpID0+IHRydWUsIGNoYXJhY3RlciksXG4gICAgKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzXCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJoZWFkZXJcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19oZWFkZXJcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbUFydChpdGVtLCA3MiwgXCJpdGVtLWRldGFpbHNfX2FydFwiKSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2V5ZWJyb3dcIiB9LCBcIkVxdWlwbWVudCBkZXRhaWxzXCJdLFxuICAgICAgICAgICAgICAgIFtcImgyXCIsIGl0ZW0ubmFtZV9lbl0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX21ldGFcIiB9LFxuICAgICAgICAgICAgICAgICAgICBgJHtjaGFyYWN0ZXIgPz8gaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGwgY2hhcmFjdGVyc1wifSDCtyAke2l0ZW0ucGFydH0gwrcgTGV2ZWwgJHtpdGVtLmxldmVsfWAsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJpdGVtLWRldGFpbHMtc3RhdHNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc3RhdHNcIiB9LCBcIlN0YXRzXCJdLFxuICAgICAgICAgICAgc3RhdHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgIFwiZGxcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3N0YXRzXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdHMubWFwKChbbGFiZWwsIHZhbHVlXSkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1wiZHRcIiwgbGFiZWxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1wiZGRcIiwgYCR7dmFsdWV9YF0sXG4gICAgICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXCJwXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sIFwiTm8gc3RhdCBib251c2VzXCJdKSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zb3VyY2VzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LCBcIkhvdyB0byBnZXQgaXRcIl0sXG4gICAgICAgICAgICBzb3VyY2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1wiZGl2XCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zb3VyY2VzXCIgfSwgLi4uc291cmNlc10pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gYWN0aXZlIGFjcXVpc2l0aW9uIHNvdXJjZSBmb3VuZC5cIixcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWRldGFpbHMtdHJpZ2dlclwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIFwiYXJpYS1oYXNwb3B1cFwiOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgVmlldyBkZXRhaWxzIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coXG4gICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICBgJHtpdGVtLm5hbWVfZW59IGl0ZW0gZGV0YWlsc2AsXG4gICAgICAgICAgICBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbSwgY2hhcmFjdGVyKSxcbiAgICAgICAgICAgIFwiaXRlbS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtOiBJdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE9mZmljaWFsIGl0ZW0gYXJ0IHVuYXZhaWxhYmxlIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tfX2NvZGVcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBpdGVtLnBhcnQgfHwgXCJJdGVtXCJdLFxuICAgICAgICBbXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBcIk9mZmljaWFsIGFydCB1bmF2YWlsYWJsZVwiXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3ByaXRlQXJ0KFxuICAgIHNoZWV0OiBzdHJpbmcsXG4gICAgY2VsbDogbnVtYmVyLFxuICAgIGxhYmVsOiBzdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbikge1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gaXRlbUFydE1hcC5zaGVldHNbc2hlZXRdO1xuICAgIGlmICghZ2VvbWV0cnkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjb2x1bW4gPSBjZWxsICUgZ2VvbWV0cnkubGluZUNvdW50O1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoY2VsbCAvIGdlb21ldHJ5LmxpbmVDb3VudCk7XG4gICAgY29uc3Qgc2NhbGUgPSBkaXNwbGF5U2l6ZSAvIGdlb21ldHJ5LnNpemU7XG4gICAgY29uc3QgaW1hZ2VTaXplID0gZ2VvbWV0cnkud2lkdGggKiBzY2FsZTtcbiAgICBjb25zdCBvZmZzZXRYID0gLShnZW9tZXRyeS5zcGFjZSArIGNvbHVtbiAqIChnZW9tZXRyeS5zaXplICsgZ2VvbWV0cnkuc3BhY2UpKSAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFkgPSAtKGdlb21ldHJ5LnNwYWNlICsgcm93ICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgICAgICAgICBzdHlsZTogW1xuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LWltYWdlOnVybChcImFzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbiAgICBjbGFzc05hbWUgPSBcIml0ZW0tYXJ0LXRodW1ibmFpbFwiLFxuKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydFswXSxcbiAgICAgICAgYXJ0WzFdLFxuICAgICAgICBgT2ZmaWNpYWwgaXRlbSBhcnQgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgZGlzcGxheVNpemUsXG4gICAgKSA/PyBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYTogR2FjaGEpIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLmxvdHRlcmllc1tgJHtnYWNoYS5nYWNoYV9pbmRleH1gXTtcbiAgICBjb25zdCBmYWxsYmFjayA9ICgpID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtY29pbi1hcnQgZ2FjaGEtY29pbi1hcnQtLXVuYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYENvaW4gYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI/XCIsXG4gICAgICAgIF0pO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaygpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnQuc2hlZXQsXG4gICAgICAgIGFydC5jZWxsLFxuICAgICAgICBgJHtnYWNoYS5uYW1lfSBjb2luIGFydHdvcmtgLFxuICAgICAgICBcImdhY2hhLWNvaW4tYXJ0XCIsXG4gICAgKSA/PyBmYWxsYmFjaygpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UYWJsZVJvdyhpdGVtOiBJdGVtLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlUm93RWxlbWVudCB7XG4gICAgY29uc3Qgcm93ID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widHJcIiwgeyBjbGFzczogXCJyZXN1bHQtcm93XCIgfSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gcmVzdWx0LXN1bW1hcnlcIiwgXCJkYXRhLWxhYmVsXCI6IFwiSXRlbVwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbSwgY2hhcmFjdGVyKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQXJ0XCIgfSwgY3JlYXRlSXRlbUFydChpdGVtKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQ2hhcmFjdGVyXCIgfSwgaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGxcIl0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlBhcnRcIiB9LCBpdGVtLnBhcnRdLFxuICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5tYXAocyA9PiBpdGVtLnN0YXRGcm9tU3RyaW5nKHMpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IHN0YXQsIFwiZGF0YS12YWx1ZVwiOiB2YWx1ZSB9LCB2YWx1ZV0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkxldmVsXCIsIFwiZGF0YS12YWx1ZVwiOiBgJHtpdGVtLmxldmVsfWAgfSwgYCR7aXRlbS5sZXZlbH1gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJTb3VyY2VcIiB9LCAuLi5tYWtlU291cmNlc0xpc3QoaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgcmV0dXJuIHJvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhY2hhVGFibGUoZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbiwgY2hhcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJHYWNoYSBjb2lucyBieSBzaG9wIGN1cnJlbmN5IGFuZCBzdGFnZSBzb3VyY2VzXCJdLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJHYWNoYVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSh1bmRlZmluZWQsIG5ldyBHYWNoYUl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCksIGNoYXIpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdWx0c1RhYmxlKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IChpdGVtczogSXRlbVtdLCBpdGVtOiBJdGVtKSA9PiBJdGVtW10sXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgcmVzdWx0czogeyBba2V5OiBzdHJpbmddOiBJdGVtW10gfSA9IHtcbiAgICAgICAgXCJIYXRcIjogW10sXG4gICAgICAgIFwiSGFpclwiOiBbXSxcbiAgICAgICAgXCJEeWVcIjogW10sXG4gICAgICAgIFwiVXBwZXJcIjogW10sXG4gICAgICAgIFwiTG93ZXJcIjogW10sXG4gICAgICAgIFwiU2hvZXNcIjogW10sXG4gICAgICAgIFwiU29ja3NcIjogW10sXG4gICAgICAgIFwiSGFuZFwiOiBbXSxcbiAgICAgICAgXCJCYWNrcGFja1wiOiBbXSxcbiAgICAgICAgXCJGYWNlXCI6IFtdLFxuICAgICAgICBcIlJhY2tldFwiOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAoZmlsdGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHRzW2l0ZW0ucGFydF0gPSBwcmlvcml6ZXIocmVzdWx0c1tpdGVtLnBhcnRdLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJNYXRjaGluZyBlcXVpcG1lbnQgYnkgc2xvdCBhbmQgc2VsZWN0ZWQgc3RhdCBwcmlvcml0eVwiXSxcbiAgICAgICAgICAgIFtcInRoZWFkXCIsXG4gICAgICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiUGFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoKHN0YXQpID0+IGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdCkpLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiTGV2ZWxcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlNvdXJjZVwiXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcInRib2R5XCJdLFxuICAgICAgICBdXG4gICAgKTtcbiAgICBjb25zdCB0YWJsZUJvZHkgPSB0YWJsZS50Qm9kaWVzWzBdO1xuICAgIGlmICghdGFibGVCb2R5KSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB0eXBlIE1hcE9wdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH07XG5cbiAgICB0eXBlIENvc3QgPSB7XG4gICAgICAgIGdvbGQ6IG51bWJlcixcbiAgICAgICAgYXA6IG51bWJlcixcbiAgICAgICAgbWFwczogTWFwT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY29tYmluZU1hcHMobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHJlc3VsdFttYXBdLmNvbmNhdCh0cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZUNvc3RzKGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCArIGNvc3QyLmdvbGQsXG4gICAgICAgICAgICBhcDogY29zdDEuYXAgKyBjb3N0Mi5hcCxcbiAgICAgICAgICAgIG1hcHM6IGNvbWJpbmVNYXBzKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbk1hcChtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmICh0cmllcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IFtNYXRoLm1pbihyZXN1bHRbbWFwXVswXSwgdHJpZXNbMF0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5Db3N0KGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICAvLyBMZXhpY29ncmFwaGljIG9uIChhcCwgZ29sZCk6IGxvd2VyIEFQIHdpbnMsIHRoZW4gbG93ZXIgR29sZC5cbiAgICAgICAgLy8gTnVtZXJpYyBjb21wYXJlIG9ubHkg4oCUIGRvIG5vdCB1c2UgSlMgYXJyYXkvc3RyaW5nIG9yZGVyaW5nLlxuICAgICAgICBjb25zdCBwaWNrQ29zdDEgPVxuICAgICAgICAgICAgY29zdDEuYXAgPCBjb3N0Mi5hcCB8fFxuICAgICAgICAgICAgKGNvc3QxLmFwID09PSBjb3N0Mi5hcCAmJiBjb3N0MS5nb2xkIDwgY29zdDIuZ29sZCk7XG4gICAgICAgIHJldHVybiBwaWNrQ29zdDEgP1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QxLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QyLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QyLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29zdE9mKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IENvc3Qge1xuICAgICAgICBjb25zdCBzb3VyY2VDb3N0cyA9IFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgICAgIC5tYXAoKGl0ZW1Tb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlLmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogaXRlbVNvdXJjZS5wcmljZSwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiBpdGVtU291cmNlLnByaWNlLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGVDb3N0ID0gY29zdE9mKGl0ZW1Tb3VyY2UuaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogc2luZ2xlQ29zdC5nb2xkICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiBzaW5nbGVDb3N0LmFwICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzaW5nbGVDb3N0Lm1hcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFttYXAsIHRyaWVzXSkgPT4gW21hcCwgdHJpZXMubWFwKG4gPT4gbiAqIG11bHRpcGxpZXIpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFtbaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIFtpdGVtU291cmNlLml0ZW1zLmxlbmd0aF1dXSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNvdXJjZUNvc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VlZCB3aXRoIHRoZSBmaXJzdCByZWFsIHNvdXJjZSBjb3N0LiBBIHswLDB9IGlkZW50aXR5IHdvdWxkIGFsd2F5cyB3aW5cbiAgICAgICAgLy8gdW5kZXIgYSBjb3JyZWN0IG1pbiwgYW5kIHRoZSBvbGQgYWx3YXlzLWxhc3QgYnVnIGhpZCB0aGF0LlxuICAgICAgICByZXR1cm4gc291cmNlQ29zdHMucmVkdWNlKChjdXJyLCBjb3N0KSA9PiBtaW5Db3N0KGN1cnIsIGNvc3QpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVN0YXRpc3RpY3M6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuZnJvbUVudHJpZXMocHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBbc3RhdCwgMF0pKTtcbiAgICBjb25zdCBzdGF0aXN0aWNzID0ge1xuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgU2V0PENoYXJhY3Rlcj4sXG4gICAgICAgIExldmVsOiAwLFxuICAgICAgICBjb3N0OiB7IGFwOiAwLCBnb2xkOiAwLCBtYXBzOiB7fSB9IGFzIENvc3QsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIE9iamVjdC52YWx1ZXMocmVzdWx0cykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLnJlZHVjZSgoY3Vyciwgc3RhdE5hbWUpID0+IGN1cnIgKyByZXN1bHRbMF0uc3RhdEZyb21TdHJpbmcoc3RhdE5hbWUpLCAwKTtcbiAgICAgICAgICAgIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSArPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpc3RpY3MuTGV2ZWwgPSBNYXRoLm1heChyZXN1bHRbMF0ubGV2ZWwsIHN0YXRpc3RpY3MuTGV2ZWwpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXN1bHQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hhciBvZiBpdGVtLmNoYXJhY3RlciA/IFtpdGVtLmNoYXJhY3Rlcl0gOiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGlzdGljcy5jaGFyYWN0ZXJzLmFkZChjaGFyKVxuICAgICAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmRDaGlsZChpdGVtVG9UYWJsZVJvdyhpdGVtLCBzb3VyY2VGaWx0ZXIsIHByaW9yaXR5U3RhdHMsIGNoYXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb290ZXIgY29zdCBtdXN0IG1hdGNoIHN0YXRzL2xldmVsOiBiZXN0IGNhbmRpZGF0ZSBwZXIgc2xvdCBvbmx5LlxuICAgICAgICAvLyBUaGUgYm9keSBzdGlsbCByZW5kZXJzIHRoZSBmdWxsIHJhbmtlZCBsaXN0IGFib3ZlLlxuICAgICAgICBzdGF0aXN0aWNzLmNvc3QgPSBjb21iaW5lQ29zdHMoXG4gICAgICAgICAgICBjb3N0T2YocmVzdWx0WzBdLCBjaGFyYWN0ZXIgJiYgaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSA/IGNoYXJhY3RlciA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICBzdGF0aXN0aWNzLmNvc3QsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpc3RpY3MuY2hhcmFjdGVycy5zaXplID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsX3NvdXJjZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuZ29sZCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuZ29sZC50b0ZpeGVkKDApfSBHb2xkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5hcCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuYXAudG9GaXhlZCgwKX0gQVBgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0YXRpc3RpY3NbJ0d1YXJkaWFuIGdhbWVzJ10uZm9yRWFjaCgoY291bnQsIG1hcCkgPT4gdG90YWxfc291cmNlcy5wdXNoKGAke2NvdW50LnRvRml4ZWQoMCl9IHggJHttYXB9YCkpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidGZvb3RcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBOYW1lX2NvbHVtblwiIH0sIFwiVG90YWw6XCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQ2hhcmFjdGVyX2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgUGFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBudW1lcmljXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7cHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdfWBcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke3N0YXRpc3RpY3MuTGV2ZWx9YF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBTb3VyY2VfY29sdW1uXCIgfSwgdG90YWxfc291cmNlcy5qb2luKFwiLCBcIildLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbl9lbGVtZW50IG9mIHRhYmxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYENoYXJhY3Rlcl9jb2x1bW5gKSkge1xuICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgIGlmIChwcmlvcml0eVN0YXRpc3RpY3NbYXR0cmlidXRlXSA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke2F0dHJpYnV0ZX1fY29sdW1uYCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShjb2x1bW5fZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sdW1uX2VsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhJdGVtTGV2ZWwoKSB7XG4gICAgLy9ubyByZWR1Y2UgZm9yIE1hcD9cbiAgICBsZXQgbWF4ID0gMDtcbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KG1heCwgaXRlbS5sZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBtYXg7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZGlhbG9nICYmIGRpYWxvZyA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgbWFrZUNoZWNrYm94VHJlZSwgVHJlZU5vZGUsIGdldExlYWZTdGF0ZXMsIHNldExlYWZTdGF0ZXMgfSBmcm9tICcuL2NoZWNrYm94VHJlZSc7XG5pbXBvcnQgeyBjcmVhdGVQb3B1cExpbmssIGRvd25sb2FkSXRlbXMsIGdldFJlc3VsdHNUYWJsZSwgSXRlbSwgSXRlbVNvdXJjZSwgZ2V0TWF4SXRlbUxldmVsLCBpdGVtcywgQ2hhcmFjdGVyLCBjaGFyYWN0ZXJzLCBpc0NoYXJhY3RlciwgU2hvcEl0ZW1Tb3VyY2UsIEdhY2hhSXRlbVNvdXJjZSwgZ2V0R2FjaGFUYWJsZSB9IGZyb20gJy4vaXRlbUxvb2t1cCc7XG5pbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IHNlbGVjdEJ5UHJpb3JpdHkgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7IFZhcmlhYmxlX3N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5jb25zdCBwYXJ0c0ZpbHRlciA9IFtcbiAgICBcIlBhcnRzXCIsIFtcbiAgICAgICAgXCJIZWFkXCIsIFtcbiAgICAgICAgICAgIFwiK0hhdFwiLFxuICAgICAgICAgICAgXCIrSGFpclwiLFxuICAgICAgICAgICAgXCJEeWVcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrVXBwZXJcIixcbiAgICAgICAgXCIrTG93ZXJcIixcbiAgICAgICAgXCJMZWdzXCIsIFtcbiAgICAgICAgICAgIFwiK1Nob2VzXCIsXG4gICAgICAgICAgICBcIlNvY2tzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiQXV4XCIsIFtcbiAgICAgICAgICAgIFwiK0hhbmRcIixcbiAgICAgICAgICAgIFwiK0JhY2twYWNrXCIsXG4gICAgICAgICAgICBcIitGYWNlXCJcbiAgICAgICAgXSxcbiAgICAgICAgXCIrUmFja2V0XCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlciA9IFtcbiAgICBcIkF2YWlsYWJpbGl0eVwiLCBbXG4gICAgICAgIFwiU2hvcFwiLCBbXG4gICAgICAgICAgICBcIitHb2xkXCIsXG4gICAgICAgICAgICBcIitBUFwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitBbGxvdyBnYWNoYVwiLFxuICAgICAgICBcIitHdWFyZGlhblwiLFxuICAgICAgICBcIitVbnRyYWRhYmxlXCIsXG4gICAgICAgIFwiVW5hdmFpbGFibGUgaXRlbXNcIixcbiAgICBdLFxuXTtcblxuY29uc3QgZXhjbHVkZWRfaXRlbV9pZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuLyoqIERpZ2l0cy1vbmx5IHNhZmUtaW50ZWdlciBwYXJzZSBmb3IgZXhjbHVkZWRfaXRlbV9pZHMgbG9jYWxTdG9yYWdlIHRva2Vucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4Y2x1ZGVkSXRlbUlkVG9rZW4odG9rZW46IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHRva2VuKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IE51bWJlcih0b2tlbik7XG4gICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihpZCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBhZGRGaWx0ZXJUcmVlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXJhY3RlckZpbHRlcnNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgW1wiQWxsXCIsIC4uLmNoYXJhY3RlcnNdKSB7XG4gICAgICAgIGNvbnN0IGlkID0gYGNoYXJhY3RlclNlbGVjdG9yc18ke2NoYXJhY3Rlcn1gO1xuICAgICAgICBjb25zdCByYWRpb19idXR0b24gPSBjcmVhdGVIVE1MKFtcImlucHV0XCIsIHsgaWQ6IGlkLCB0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIsIHZhbHVlOiBjaGFyYWN0ZXIgfV0pO1xuICAgICAgICByYWRpb19idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocmFkaW9fYnV0dG9uKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wibGFiZWxcIiwgeyBmb3I6IGlkIH0sIGNoYXJhY3Rlcl0pKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wiYnJcIl0pKTtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICByYWRpb19idXR0b24uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmlsdGVyczogW1RyZWVOb2RlLCBzdHJpbmddW10gPSBbXG4gICAgICAgIFtwYXJ0c0ZpbHRlciwgXCJwYXJ0c0ZpbHRlclwiXSxcbiAgICAgICAgW2F2YWlsYWJpbGl0eUZpbHRlciwgXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIl0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IFtmaWx0ZXIsIG5hbWVdIG9mIGZpbHRlcnMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJlZSA9IG1ha2VDaGVja2JveFRyZWUoZmlsdGVyKTtcbiAgICAgICAgdHJlZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRyZWUpO1xuICAgIH1cbn1cblxuYWRkRmlsdGVyVHJlZXMoKTtcblxubGV0IGRyYWdnZWQ6IEhUTUxFbGVtZW50O1xuY29uc3QgZHJhZ1NlcGFyYXRvckxpbmUgPSBjcmVhdGVIVE1MKFtcImhyXCIsIHsgaWQ6IFwiZHJhZ092ZXJCYXJcIiB9XSk7XG5sZXQgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TW92ZUljb24oZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwicHJpb3JpdHktbW92ZV9faWNvblwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLCBcIjAgMCAyNCAyNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiZm9jdXNhYmxlXCIsIFwiZmFsc2VcIik7XG4gICAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJwYXRoXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFxuICAgICAgICBcImRcIixcbiAgICAgICAgZGlyZWN0aW9uID09PSBcInVwXCIgPyBcIk02IDE0LjUgMTIgOC41bDYgNlwiIDogXCJNNiA5LjUgMTIgMTUuNWw2LTZcIixcbiAgICApO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyLjI1XCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVjYXBcIiwgXCJyb3VuZFwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lam9pblwiLCBcInJvdW5kXCIpO1xuICAgIHN2Zy5hcHBlbmQocGF0aCk7XG4gICAgcmV0dXJuIHN2Zztcbn1cblxuLyoqIFJlYWQgcmFua2luZyBrZXkgZnJvbSB0aGUgbGFiZWwgbm9kZSBzbyBtb3ZlIGNvbnRyb2xzIG5ldmVyIHBvbGx1dGUgc3RhdCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW9yaXR5U3RhdExhYmVsKGl0ZW06IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxhYmVsID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LXN0YXQtbGFiZWxcIik7XG4gICAgaWYgKGxhYmVsPy50ZXh0Q29udGVudCkge1xuICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBzZXRQcmlvcml0eVN0YXRMYWJlbChpdGVtOiBIVE1MRWxlbWVudCwgc3RhdDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGFiZWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKTtcbiAgICBpZiAobGFiZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHN0YXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gc3RhdDtcbiAgICB9XG4gICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBjb25zdCBkb3duID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAodXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICB1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBSYWlzZSAke3N0YXR9IHByaW9yaXR5YCk7XG4gICAgICAgIHVwLnRpdGxlID0gYFJhaXNlICR7c3RhdH1gO1xuICAgIH1cbiAgICBpZiAoZG93biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgIGRvd24uc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBgTG93ZXIgJHtzdGF0fSBwcmlvcml0eWApO1xuICAgICAgICBkb3duLnRpdGxlID0gYExvd2VyICR7c3RhdH1gO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdDogc3RyaW5nKTogSFRNTExJRWxlbWVudCB7XG4gICAgY29uc3QgdXAgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIGNsYXNzOiBcInByaW9yaXR5LW1vdmUgcHJpb3JpdHktbW92ZS11cFwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSYWlzZSAke3N0YXR9IHByaW9yaXR5YCxcbiAgICAgICAgICAgIHRpdGxlOiBgUmFpc2UgJHtzdGF0fWAsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgdXAuYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oXCJ1cFwiKSk7XG4gICAgY29uc3QgZG93biA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgY2xhc3M6IFwicHJpb3JpdHktbW92ZSBwcmlvcml0eS1tb3ZlLWRvd25cIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgTG93ZXIgJHtzdGF0fSBwcmlvcml0eWAsXG4gICAgICAgICAgICB0aXRsZTogYExvd2VyICR7c3RhdH1gLFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIGRvd24uYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oXCJkb3duXCIpKTtcblxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJsaVwiLFxuICAgICAgICB7IGNsYXNzOiBcImRyb3B6b25lXCIsIGRyYWdnYWJsZTogXCJ0cnVlXCIgfSxcbiAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcInByaW9yaXR5LXN0YXQtbGFiZWxcIiB9LCBzdGF0XSxcbiAgICAgICAgY3JlYXRlSFRNTChbXCJzcGFuXCIsIHsgY2xhc3M6IFwicHJpb3JpdHktbW92ZS1jb250cm9sc1wiIH0sIHVwLCBkb3duXSksXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHByaW9yaXR5TGlzdEl0ZW1zKGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiBIVE1MTElFbGVtZW50W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QuY2hpbGRyZW4pLmZpbHRlcihcbiAgICAgICAgKG5vZGUpOiBub2RlIGlzIEhUTUxMSUVsZW1lbnQgPT4gbm9kZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgbm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBzeW5jUmFua2luZ1N1bW1hcnlIaW50KGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBoaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9zdW1tYXJ5X2hpbnRcIik7XG4gICAgaWYgKCEoaGludCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvcCA9IHByaW9yaXR5TGlzdEl0ZW1zKGxpc3QpWzBdO1xuICAgIGlmICghdG9wKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFiZWwgPSBnZXRQcmlvcml0eVN0YXRMYWJlbCh0b3ApO1xuICAgIGlmIChsYWJlbCkge1xuICAgICAgICBoaW50LnRleHRDb250ZW50ID0gYCR7bGFiZWx9IGZpcnN0YDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShsaXN0OiBIVE1MT0xpc3RFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgaXRlbXMgPSBwcmlvcml0eUxpc3RJdGVtcyhsaXN0KTtcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCB1cCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLXVwXCIpO1xuICAgICAgICBjb25zdCBkb3duID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICAgICAgaWYgKHVwIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIHVwLmRpc2FibGVkID0gaW5kZXggPT09IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvd24gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgICAgZG93bi5kaXNhYmxlZCA9IGluZGV4ID09PSBpdGVtcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc3luY1JhbmtpbmdTdW1tYXJ5SGludChsaXN0KTtcbn1cblxuZnVuY3Rpb24gbW92ZVByaW9yaXR5TGlzdEl0ZW0oaXRlbTogSFRNTExJRWxlbWVudCwgZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IHZvaWQge1xuICAgIGNvbnN0IGxpc3QgPSBpdGVtLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsID0gZGlyZWN0aW9uID09PSBcInVwXCIgPyBpdGVtLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBpdGVtLm5leHRFbGVtZW50U2libGluZztcbiAgICB3aGlsZSAoc2libGluZyAmJiAhKHNpYmxpbmcgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIHNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIikpKSB7XG4gICAgICAgIHNpYmxpbmcgPSBkaXJlY3Rpb24gPT09IFwidXBcIiA/IHNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZyA6IHNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgICBpZiAoIShzaWJsaW5nIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGlyZWN0aW9uID09PSBcInVwXCIpIHtcbiAgICAgICAgc2libGluZy5iZWZvcmUoaXRlbSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzaWJsaW5nLmFmdGVyKGl0ZW0pO1xuICAgIH1cbiAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xufVxuXG5mdW5jdGlvbiBhcHBseURyYWdEcm9wKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUsIC5wcmlvcml0eS1tb3ZlLWNvbnRyb2xzXCIpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvdyA9IHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKVxuICAgICAgICAgICAgPyB0YXJnZXRcbiAgICAgICAgICAgIDogdGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoIShyb3cgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnZ2VkID0gcm93O1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRyb3B6b25lID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoZHJvcHpvbmUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UmVjdCA9IGRyb3B6b25lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgLSB0YXJnZXRSZWN0LnRvcDtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHRhcmdldFJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgZW51bSBQb3NpdGlvbiB7XG4gICAgICAgICAgICAgICAgYWJvdmUsXG4gICAgICAgICAgICAgICAgb24sXG4gICAgICAgICAgICAgICAgYmVsb3csXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHkgPCBoZWlnaHQgKiAwLjMgPyBQb3NpdGlvbi5hYm92ZSA6IHkgPiBoZWlnaHQgKiAwLjcgPyBQb3NpdGlvbi5iZWxvdyA6IFBvc2l0aW9uLm9uO1xuICAgICAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYWJvdmU6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBkcm9wem9uZS5iZWZvcmUoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmJlbG93OlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZHJvcHpvbmUuYWZ0ZXIoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLm9uOlxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkID09PSBkcm9wem9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IGRyb3B6b25lO1xuICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAoIWRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbikge1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmFmdGVyKGRyYWdnZWQpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcmFnZ2VkLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgY29uc3QgZHJvcFRhcmdldCA9IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKCEoZHJvcFRhcmdldCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29tYmluZWQgPSBgJHtnZXRQcmlvcml0eVN0YXRMYWJlbChkcm9wVGFyZ2V0KX0rJHtnZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkKX1gO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJvcFRhcmdldCwgY29tYmluZWQpO1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcm9wVGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHJvcFJvdyA9IHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKVxuICAgICAgICAgICAgPyB0YXJnZXRcbiAgICAgICAgICAgIDogdGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoZHJvcFJvdyA9PT0gZHJhZ2dlZCAmJiBkcmFnZ2VkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkKS5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBzZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkLCBzdGF0cy5zaGlmdCgpISk7XG4gICAgICAgICAgICBkcmFnZ2VkLmFmdGVyKC4uLnN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdCkpKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcmFnZ2VkLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5hcHBseURyYWdEcm9wKCk7XG5cbmZ1bmN0aW9uIGh5ZHJhdGVQcmlvcml0eUxpc3RDb250cm9scygpOiB2b2lkIHtcbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICBpZiAoIWl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1zdGF0LWxhYmVsXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFzdGF0KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtLnJlcGxhY2VXaXRoKGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdCkpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3RhdGljIEhUTUwgc2hpcHMgZW1wdHkgY29udHJvbCBzaGVsbHM7IGZpbGwgaWNvbnMgd2l0aG91dCBsb3NpbmcgbGFiZWxzLlxuICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBpdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoXCIucHJpb3JpdHktbW92ZVwiKSkge1xuICAgICAgICAgICAgaWYgKCEoYnV0dG9uIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHx8IGJ1dHRvbi5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBidXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwicHJpb3JpdHktbW92ZS11cFwiKSA/IFwidXBcIiA6IFwiZG93blwiO1xuICAgICAgICAgICAgYnV0dG9uLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKGRpcmVjdGlvbikpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShwcmlvcml0eUxpc3QpO1xufVxuXG5oeWRyYXRlUHJpb3JpdHlMaXN0Q29udHJvbHMoKTtcblxuZnVuY3Rpb24gY29tcGFyZShsaHM6IG51bWJlciwgcmhzOiBudW1iZXIpOiAtMSB8IDAgfCAxIHtcbiAgICBpZiAobGhzID09PSByaHMpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBsaHMgPCByaHMgPyAtMSA6IDE7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk6IENoYXJhY3RlciB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNDaGFyYWN0ZXIoc2VsZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkQ2hhcmFjdGVyKGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgXCJBbGxcIikge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSA9PT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBpdGVtU2VsZWN0b3JzID0gW1wicGFydHNTZWxlY3RvclwiLCBcImdhY2hhU2VsZWN0b3JcIl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBJdGVtU2VsZWN0b3IgPSB0eXBlb2YgaXRlbVNlbGVjdG9yc1tudW1iZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbVNlbGVjdG9yKGl0ZW1TZWxlY3Rvcjogc3RyaW5nKTogaXRlbVNlbGVjdG9yIGlzIEl0ZW1TZWxlY3RvciB7XG4gICAgcmV0dXJuIChpdGVtU2VsZWN0b3JzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLmluY2x1ZGVzKGl0ZW1TZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCk6IEl0ZW1TZWxlY3RvciB7XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAocGFydHNTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAoZ2FjaGFTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcImdhY2hhU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xufVxuXG5mdW5jdGlvbiBzYXZlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKSB8fCBcIkFsbFwiO1xuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIsIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvL21pc2NcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiLCBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIsIGl0ZW1fbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLmRlbGV0ZV92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIsIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCk7XG4gICAgfVxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIiwgZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiLCBBcnJheS5mcm9tKGV4Y2x1ZGVkX2l0ZW1faWRzKS5qb2luKFwiLFwiKSk7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc3RvcmVkX2NoYXJhY3RlciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIpO1xuICAgIHNldFNlbGVjdGVkQ2hhcmFjdGVyKHR5cGVvZiBzdG9yZWRfY2hhcmFjdGVyID09PSBcInN0cmluZ1wiICYmIGlzQ2hhcmFjdGVyKHN0b3JlZF9jaGFyYWN0ZXIpID8gc3RvcmVkX2NoYXJhY3RlciA6IFwiQWxsXCIpO1xuXG4gICAgey8vRmlsdGVyc1xuICAgICAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoVmFyaWFibGVfc3RvcmFnZS52YXJpYWJsZXMpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIHN0YXRlc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICB7IC8vbWlzY1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIik7XG4gICAgICAgIGlmICh0eXBlb2YgbWF4TGV2ZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHttYXhMZXZlbH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGxldmVscmFuZ2UubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbV9uYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBuYW1lZmlsdGVyLnZhbHVlID0gaXRlbV9uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZW5jaGFudFRvZ2dsZS5jaGVja2VkID0gISFWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgfVxuXG4gICAgLy8gUmVoeWRyYXRlIGV4Y2x1c2lvbnMgYmVmb3JlIGFueSBzYXZlLWNhcGFibGUgZXZlbnQgKGNoYW5nZS9pbnB1dCDihpIgdXBkYXRlUmVzdWx0cyDihpIgc2F2ZVNlbGVjdGlvbikuXG4gICAgY29uc3QgZXhjbHVkZWRfaWRzID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiKTtcbiAgICBpZiAodHlwZW9mIGV4Y2x1ZGVkX2lkcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2lkcy5zcGxpdChcIixcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRXhjbHVkZWRJdGVtSWRUb2tlbihpZCk7XG4gICAgICAgICAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBsZXQgaXRlbVR5cGVTZWxlY3RvciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtVHlwZVNlbGVjdG9yICE9PSBcInN0cmluZ1wiIHx8ICFpc0l0ZW1TZWxlY3RvcihpdGVtVHlwZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaXRlbVR5cGVTZWxlY3RvciA9IFwicGFydHNTZWxlY3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVR5cGVTZWxlY3Rvcik7XG4gICAgICAgIGlmICghKHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZWN0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSk7XG4gICAgfVxuXG4gICAgLy9tdXN0IGJlIGxhc3QgYmVjYXVzZSBpdCB0cmlnZ2VycyBhIHN0b3JlXG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVzdWx0cygpIHtcbiAgICBzYXZlU2VsZWN0aW9uKCk7XG4gICAgLy8gV2hpbGUgZmlyc3QtbG9hZCBsYWIgcHJlcCBpcyBhY3RpdmUsIGtlZXAgZnJpZW5kbHkgbG9hZGluZyBjb3B5IOKAlCBkbyBub3QgcGFpbnRcbiAgICAvLyBhbiBlbXB0eSBpbnZlbnRvcnkgKFwiTm8gaXRlbXMgbWF0Y2jigKZcIikgb3ZlciB0aGUgYW5pbWF0ZWQgbG9hZGVyLlxuICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik/LmdldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWx0ZXJzOiAoKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBjb25zdCBzb3VyY2VGaWx0ZXJzOiAoKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBsZXQgc2VsZWN0ZWRDaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cblxuICAgIHsgLy9jaGFyYWN0ZXIgZmlsdGVyXG4gICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5jaGFyYWN0ZXIgPT09IHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9wYXJ0cyBmaWx0ZXJcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1N0YXRlcyA9IGdldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0KTtcbiAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBwYXJ0c1N0YXRlc1tpdGVtLnBhcnRdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2F2YWlsYWJpbGl0eSBmaWx0ZXJcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0KTtcbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHb2xkXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiAhaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQVBcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmIGl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVudHJhZGFibGVcIl0pIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ucGFyY2VsX2VuYWJsZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQWxsb3cgZ2FjaGFcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR3VhcmRpYW5cIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICFpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW5hdmFpbGFibGUgaXRlbXNcIl0pIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlciA9IFsuLi5zb3VyY2VGaWx0ZXJzXTtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbHRlciA9IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlOiBJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VGaWx0ZXIoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBpdGVtU291cmNlLml0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpc0F2YWlsYWJsZVNvdXJjZSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlSXRlbShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtU291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpc0F2YWlsYWJsZUl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL21pc2MgZmlsdGVyXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIGZpbHRlcnMucHVzaCgoaXRlbTogSXRlbSkgPT4gaXRlbS5sZXZlbCA8PSBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5uYW1lX2VuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoaXRlbV9uYW1lLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pZCBmaWx0ZXJcbiAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gIWV4Y2x1ZGVkX2l0ZW1faWRzLmhhcyhpdGVtLmlkKSk7XG4gICAgICAgIGNvbnN0IGl0ZW1GaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpdGVtRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShpdGVtRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuXG4gICAgICAgIH1cbiAgICAgICAgaXRlbUZpbHRlckxpc3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgIGlmIChleGNsdWRlZF9pdGVtX2lkcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImVtcHR5LW5vdGVcIiB9LFxuICAgICAgICAgICAgICAgIFwiTm8gZXhjbHVkZWQgaXRlbXNcIixcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaXRlbV9pZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gaXRlbXMuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW1GaWx0ZXJMaXN0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImV4Y2x1ZGVkLWl0ZW1cIiB9LFxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZXhjbHVkZWQtaXRlbV9fbmFtZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxfcmVtb3ZhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2lkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSZXN0b3JlICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlc3RvcmVcIixcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBjb21wYXJhdG9yczogKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gbnVtYmVyKVtdID0gW107XG5cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eVN0YXRzID0gcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KVxuICAgICAgICAubWFwKG5vZGUgPT4gZ2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSkpXG4gICAgICAgIC5maWx0ZXIoc3RhdCA9PiBzdGF0Lmxlbmd0aCA+IDApO1xuICAgIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdC5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBjb21wYXJhdG9ycy5wdXNoKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gY29tcGFyZShcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiBsaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pLFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IHJocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFibGUgPSAoKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHRzVGFibGUoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPT4gZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW0pKSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZSA9PiBzb3VyY2VGaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpLFxuICAgICAgICAgICAgICAgICAgICAoaXRlbXMsIGl0ZW0pID0+IHNlbGVjdEJ5UHJpb3JpdHkoaXRlbXMsIGl0ZW0sIGNvbXBhcmF0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHlTdGF0cyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEdhY2hhVGFibGUoaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0Um93cyA9IHRhYmxlLnRCb2RpZXNbMF0/LnJvd3MubGVuZ3RoID8/IE1hdGgubWF4KDAsIHRhYmxlLnJvd3MubGVuZ3RoIC0gMSk7XG4gICAgdGFyZ2V0LmlubmVyVGV4dCA9IFwiXCI7XG4gICAgaWYgKHJlc3VsdFJvd3MgPT09IDApIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInJlc3VsdHMtZW1wdHlcIiwgcm9sZTogXCJzdGF0dXNcIiB9LFxuICAgICAgICAgICAgXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiLFxuICAgICAgICBdKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQodGFibGUpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRzU3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzU3RhdHVzXCIpO1xuICAgIGlmIChyZXN1bHRzU3RhdHVzKSB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSByZXN1bHRSb3dzID09PSAwXG4gICAgICAgICAgICA/IFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIlxuICAgICAgICAgICAgOiBgJHtyZXN1bHRSb3dzfSBtYXRjaGluZyAke3Jlc3VsdFJvd3MgPT09IDEgPyBcIml0ZW1cIiA6IFwiaXRlbXNcIn1gO1xuICAgIH1cbiAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG59XG5cbmxldCByZXN1bHRzVGFibGVTY3JvbGxCb3VuZCA9IGZhbHNlO1xubGV0IHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXI6IFJlc2l6ZU9ic2VydmVyIHwgdW5kZWZpbmVkO1xubGV0IHJlc3VsdHNDb2x1bW5QYW5SZXZlYWxlZCA9IGZhbHNlO1xuXG4vKiogS2VlcCB0aGUgdG9wIGNvbHVtbiBzY3JvbGxlciB3aWR0aCBhbmQgc2Nyb2xsTGVmdCBhbGlnbmVkIHdpdGggdGhlIHJlc3VsdHMgdGFibGUuICovXG5mdW5jdGlvbiBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCkge1xuICAgIGNvbnN0IHRhYmxlU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZVNjcm9sbFwiKTtcbiAgICBjb25zdCB0YWJsZUhTY3JvbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlSFNjcm9sbFwiKTtcbiAgICBjb25zdCBzcGFjZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlSFNjcm9sbFNwYWNlclwiKTtcbiAgICBjb25zdCBjb2x1bW5QYW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlQ29sdW1uUGFuXCIpO1xuICAgIGlmICghKHRhYmxlU2Nyb2xsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEodGFibGVIU2Nyb2xsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoc3BhY2VyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoY29sdW1uUGFuIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3VsdHNUYWJsZVNjcm9sbEJvdW5kKSB7XG4gICAgICAgIHJlc3VsdHNUYWJsZVNjcm9sbEJvdW5kID0gdHJ1ZTtcbiAgICAgICAgbGV0IHN5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgbWlycm9yID0gKHNvdXJjZTogSFRNTEVsZW1lbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChzeW5jaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3luY2luZyA9IHRydWU7XG4gICAgICAgICAgICB0YXJnZXQuc2Nyb2xsTGVmdCA9IHNvdXJjZS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgc3luY2luZyA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICB0YWJsZVNjcm9sbC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgICAgICAgIG1pcnJvcih0YWJsZVNjcm9sbCwgdGFibGVIU2Nyb2xsKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICB0YWJsZUhTY3JvbGwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBtaXJyb3IodGFibGVIU2Nyb2xsLCB0YWJsZVNjcm9sbCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdWx0c1RhYmxlV2lkdGhPYnNlcnZlci5vYnNlcnZlKHRhYmxlU2Nyb2xsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gdGFibGVTY3JvbGwucXVlcnlTZWxlY3RvcihcInRhYmxlXCIpO1xuICAgIGlmICghKHRhYmxlIGluc3RhbmNlb2YgSFRNTFRhYmxlRWxlbWVudCkpIHtcbiAgICAgICAgY29sdW1uUGFuLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGNvbHVtblBhbi5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcmV2ZWFsZWRcIik7XG4gICAgICAgIHNwYWNlci5zdHlsZS53aWR0aCA9IFwiMHB4XCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50V2lkdGggPSBNYXRoLm1heCh0YWJsZS5zY3JvbGxXaWR0aCwgdGFibGVTY3JvbGwuc2Nyb2xsV2lkdGgpO1xuICAgIHNwYWNlci5zdHlsZS53aWR0aCA9IGAke2NvbnRlbnRXaWR0aH1weGA7XG4gICAgY29uc3QgbmVlZHNIb3Jpem9udGFsU2Nyb2xsID0gY29udGVudFdpZHRoID4gdGFibGVTY3JvbGwuY2xpZW50V2lkdGggKyAxO1xuICAgIGNvbnN0IHdhc0hpZGRlbiA9IGNvbHVtblBhbi5oaWRkZW47XG4gICAgY29sdW1uUGFuLmhpZGRlbiA9ICFuZWVkc0hvcml6b250YWxTY3JvbGw7XG4gICAgaWYgKG5lZWRzSG9yaXpvbnRhbFNjcm9sbCAmJiAhZG9jdW1lbnQuYWN0aXZlRWxlbWVudD8uaXNTYW1lTm9kZSh0YWJsZUhTY3JvbGwpKSB7XG4gICAgICAgIHRhYmxlSFNjcm9sbC5zY3JvbGxMZWZ0ID0gdGFibGVTY3JvbGwuc2Nyb2xsTGVmdDtcbiAgICB9XG4gICAgaWYgKG5lZWRzSG9yaXpvbnRhbFNjcm9sbCAmJiB3YXNIaWRkZW4gJiYgIXJlc3VsdHNDb2x1bW5QYW5SZXZlYWxlZCkge1xuICAgICAgICByZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LmFkZChcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICB9LCAyNDApO1xuICAgIH1cbiAgICBpZiAoIW5lZWRzSG9yaXpvbnRhbFNjcm9sbCkge1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0TWF4TGV2ZWxEaXNwbGF5VXBkYXRlKCkge1xuICAgIGNvbnN0IGxldmVsRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxEaXNwbGF5XCIpO1xuICAgIGlmICghKGxldmVsRGlzcGxheSBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBsZXZlbHJhbmdlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgIGxldmVsRGlzcGxheS50ZXh0Q29udGVudCA9IGBNYXggbGV2ZWwgcmVxdWlyZW1lbnQ6ICR7bGV2ZWxyYW5nZS52YWx1ZX1gO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldERpc3BsYXlVcGRhdGVzKCkge1xuICAgIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpO1xuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIG5hbWVmaWx0ZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuXG4gICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBlbmNoYW50VG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBwcmlvcml0eUxpc3RJdGVtcyhwcmlvcml0eUxpc3QpKSB7XG4gICAgICAgICAgICBjb25zdCByZWdleCA9IGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA/IC9eKCg/OlN0cil8KD86U3RhKXwoPzpEZXgpfCg/OldpbGwpKSQvIDogL15NYXggKCg/OlN0cil8KD86U3RhKXwoPzpEZXgpfCg/OldpbGwpKSQvO1xuICAgICAgICAgICAgY29uc3QgcmVwbGFjZXIgPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyBcIk1heCAkMVwiIDogXCIkMVwiO1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IGdldFByaW9yaXR5U3RhdExhYmVsKG5vZGUpLnNwbGl0KFwiK1wiKS5tYXAocyA9PiBzLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VyKSkuam9pbihcIitcIik7XG4gICAgICAgICAgICBzZXRQcmlvcml0eVN0YXRMYWJlbChub2RlLCBuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbnNldERpc3BsYXlVcGRhdGVzKCk7XG5cbmZ1bmN0aW9uIHNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCkge1xuICAgIGNvbnN0IGZpbHRlclRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyVG9nZ2xlXCIpO1xuICAgIGNvbnN0IGNsb3NlRmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2VGaWx0ZXJzXCIpO1xuICAgIGNvbnN0IGZpbHRlclBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250cm9sUmFpbFwiKTtcbiAgICBjb25zdCBmaWx0ZXJCYWNrZHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyQmFja2Ryb3BcIik7XG4gICAgaWYgKCEoZmlsdGVyVG9nZ2xlIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoY2xvc2VGaWx0ZXJzIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyUGFuZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShmaWx0ZXJCYWNrZHJvcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvZ2dsZUJ1dHRvbiA9IGZpbHRlclRvZ2dsZTtcbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNsb3NlRmlsdGVycztcbiAgICBjb25zdCBwYW5lbCA9IGZpbHRlclBhbmVsO1xuICAgIGNvbnN0IGJhY2tkcm9wQnV0dG9uID0gZmlsdGVyQmFja2Ryb3A7XG5cbiAgICBmdW5jdGlvbiBzZXRPcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIGAke29wZW59YCk7XG4gICAgICAgIGJhY2tkcm9wQnV0dG9uLmhpZGRlbiA9ICFvcGVuO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJmaWx0ZXJzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICAgICAgaWYgKG5hbWVGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9jdXNBZnRlck9wZW4gPSAoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJvcGVydHlOYW1lICE9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgICAgICBuYW1lRmlsdGVyLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBmb2N1c0FmdGVyT3Blbik7XG4gICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4odHJ1ZSkpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgYmFja2Ryb3BCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4oZmFsc2UpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gXCJUYWJcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gQXJyYXkuZnJvbShwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHN1bW1hcnksIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICAgKSkuZmlsdGVyKGVsZW1lbnQgPT4gZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA+IDApO1xuICAgICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IGxhc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChldmVudC5zaGlmdEtleSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBmaXJzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsYXN0RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFldmVudC5zaGlmdEtleVxuICAgICAgICAgICAgJiYgKCFwYW5lbC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB8fCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBsYXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1pbi13aWR0aDogODgwcHgpXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKHsgbWF0Y2hlcyB9KSA9PiB7XG4gICAgICAgIGlmIChtYXRjaGVzICYmIHBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbnNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIHNldFJlc2V0RmlsdGVyQ29udHJvbCgpIHtcbiAgICBjb25zdCByZXNldEZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0RmlsdGVyc1wiKTtcbiAgICBjb25zdCByZWZpbmVtZW50U3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZpbmVtZW50U3RhdHVzXCIpO1xuICAgIGlmICghKHJlc2V0RmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKHJlZmluZW1lbnRTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNldEZpbHRlcnMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgcmVmaW5lbWVudFN0YXR1cy50ZXh0Q29udGVudCA9IFwiUmVzZXR0aW5nIGZpbHRlcnPigKZcIjtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5jbGVhcl9hbGwoKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xufVxuXG5zZXRSZXNldEZpbHRlckNvbnRyb2woKTtcblxuZnVuY3Rpb24gc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKSB7XG4gICAgY29uc3QgcHJpb3JpdHlfZ3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2dyb3VwXCIpO1xuICAgIGlmICghKHByaW9yaXR5X2dyb3VwIGluc3RhbmNlb2YgSFRNTEZpZWxkU2V0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlciBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBhcnRzU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdhY2hhU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRzR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik7XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBjb25zdCBsb2FkaW5nTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgY29uc3QgbG9hZGluZ0NvcHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2RldGFpbFwiKVxuICAgICAgICA/PyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2NvcHkgc3BhblwiKTtcbiAgICBjb25zdCBsb2FkaW5nR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfZ3JvdXBcIik7XG4gICAgaWYgKCEocmVzdWx0c1N0YXR1cyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdMYWJlbCBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0NvcHkgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcInRydWVcIik7XG4gICAgbG9hZGluZ0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJ0cnVlXCIpO1xuICAgIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCk7XG4gICAgcmVzdG9yZVNlbGVjdGlvbigpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkSXRlbXMoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IFwiSXRlbSBkYXRhIHVuYXZhaWxhYmxlXCI7XG4gICAgICAgIGxvYWRpbmdMYWJlbC50ZXh0Q29udGVudCA9IFwiQ291bGQgbm90IGxvYWQgZXF1aXBtZW50IGRhdGFcIjtcbiAgICAgICAgbG9hZGluZ0NvcHkudGV4dENvbnRlbnQgPSBcIkNoZWNrIHRoZSBwcmV2aWV3IHNlcnZlciBjb25uZWN0aW9uLCB0aGVuIHJlbG9hZCB0aGlzIHBhZ2UuXCI7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGxvYWRpbmdHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzaG93X2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImhpZGVfYWZ0ZXJfbG9hZFwiKSkge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG1heExldmVsID0gZ2V0TWF4SXRlbUxldmVsKCk7XG4gICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGAke01hdGgubWluKHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpLCBtYXhMZXZlbCl9YDtcbiAgICBsZXZlbHJhbmdlLm1heCA9IGAke21heExldmVsfWA7XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICBsb2FkaW5nR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgIGxldmVscmFuZ2UuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJVc2UgdGhlIHVwL2Rvd24gYXJyb3dzLCBvciBkcmFnIGEgc3RhdCwgdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBtb3ZlIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVVwID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBpZiAocHJpb3JpdHlVcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICFwcmlvcml0eVVwLmRpc2FibGVkKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByaW9yaXR5VXAuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwidXBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5RG93biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAocHJpb3JpdHlEb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiYgIXByaW9yaXR5RG93bi5kaXNhYmxlZCkge1xuICAgICAgICBjb25zdCByb3cgPSBwcmlvcml0eURvd24uY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwiZG93blwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbFwiKTtcbiAgICBpZiAoZXhjbHVkZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdG9yZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIpO1xuICAgIGlmIChyZXN0b3JlQnV0dG9uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuLyoqXG4gKiBJbnNlcnQgYGNhbmRpZGF0ZWAgaW50byBhIGJlc3QtZmlyc3QgcmFua2luZy5cbiAqIEhpZ2hlciBjb21wYXJhdG9yIHZhbHVlcyBtZWFuIHRoZSBsZWZ0LWhhbmQgaXRlbSByYW5rcyBiZXR0ZXIuXG4gKiBFdmVyeSBjYW5kaWRhdGUgaXMgcmV0YWluZWQgc28gdGhlIFVJIGNhbiBzaG93IHRoZSBmdWxsIGZpbHRlcmVkIGludmVudG9yeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdEJ5UHJpb3JpdHk8VD4oXG4gICAgY3VycmVudDogVFtdLFxuICAgIGNhbmRpZGF0ZTogVCxcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBUW10ge1xuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgfVxuXG4gICAgbGV0IGluc2VydEF0ID0gY3VycmVudC5sZW5ndGg7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGN1cnJlbnQubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgIGxldCBkZWNpZGVkID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjb21wYXJhdG9yIG9mIGNvbXBhcmF0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wYXJhdG9yKGN1cnJlbnRbaW5kZXhdLCBjYW5kaWRhdGUpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGRlY2lkZWQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlY2lkZWQgPCAwKSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50W2luZGV4XSBpcyB3b3JzZSB0aGFuIGNhbmRpZGF0ZTogaW5zZXJ0IGJlZm9yZSBpdC5cbiAgICAgICAgICAgIGluc2VydEF0ID0gaW5kZXg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWNpZGVkID4gMDogY3VycmVudCBpdGVtIGlzIGJldHRlcjsga2VlcCBzY2FubmluZy5cbiAgICAgICAgLy8gZGVjaWRlZCA9PT0gMDogZXhhY3QgdGllOyBrZWVwIHNjYW5uaW5nIHNvIHRpZXMgc3RheSBzdGFibGUvRklGTy5cbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKDAsIGluc2VydEF0KSxcbiAgICAgICAgY2FuZGlkYXRlLFxuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKGluc2VydEF0KSxcbiAgICBdO1xufVxuIiwiLyoqIEludGVybmFsIHByaW9yaXR5IGtleXMg4oaSIHNob3J0IHRhYmxlIGhlYWRlciArIGh1bWFuIGZ1bGwgbmFtZSBmb3IgdG9vbHRpcHMuICovXG5jb25zdCBQUklPUklUWV9TVEFUX0hFQURFUl9BQkJSRVY6IFJlYWRvbmx5PFxuICAgIFJlY29yZDxzdHJpbmcsIHsgcmVhZG9ubHkgc2hvcnQ6IHN0cmluZzsgcmVhZG9ubHkgZnVsbDogc3RyaW5nIH0+XG4+ID0ge1xuICAgIFwiTW92IFNwZWVkXCI6IHsgc2hvcnQ6IFwiTVNcIiwgZnVsbDogXCJNb3YgU3BlZWRcIiB9LFxuICAgIFwiUXVpY2tzbG90c1wiOiB7IHNob3J0OiBcIlFTXCIsIGZ1bGw6IFwiUXVpY2sgU2xvdHNcIiB9LFxuICAgIFwiQnVmZnNsb3RzXCI6IHsgc2hvcnQ6IFwiQlNcIiwgZnVsbDogXCJCdWZmIFNsb3RzXCIgfSxcbn07XG5cbmV4cG9ydCB0eXBlIFByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkgPSB7XG4gICAgcmVhZG9ubHkgc2hvcnQ6IHN0cmluZztcbiAgICByZWFkb25seSBmdWxsOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgYWJicmV2aWF0ZWQ6IGJvb2xlYW47XG59O1xuXG4vKiogTWFwIGEgcHJpb3JpdHkgc3RhdCBrZXkgKG9yIGNvbWJpbmVkIFwiQStCXCIpIHRvIHNob3J0IGhlYWRlciB0ZXh0ICsgZnVsbCB0b29sdGlwIG5hbWUuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheShzdGF0OiBzdHJpbmcpOiBQcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IHtcbiAgICBjb25zdCBwYXJ0cyA9IHN0YXQuc3BsaXQoXCIrXCIpO1xuICAgIGNvbnN0IG1hcHBlZCA9IHBhcnRzLm1hcCgocGFydCkgPT4ge1xuICAgICAgICBjb25zdCBrbm93biA9IFBSSU9SSVRZX1NUQVRfSEVBREVSX0FCQlJFVltwYXJ0XTtcbiAgICAgICAgcmV0dXJuIGtub3duID8/IHsgc2hvcnQ6IHBhcnQsIGZ1bGw6IHBhcnQgfTtcbiAgICB9KTtcbiAgICBjb25zdCBzaG9ydCA9IG1hcHBlZC5tYXAoKHBhcnQpID0+IHBhcnQuc2hvcnQpLmpvaW4oXCIrXCIpO1xuICAgIGNvbnN0IGZ1bGwgPSBtYXBwZWQubWFwKChwYXJ0KSA9PiBwYXJ0LmZ1bGwpLmpvaW4oXCIrXCIpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNob3J0LFxuICAgICAgICBmdWxsLFxuICAgICAgICBhYmJyZXZpYXRlZDogc2hvcnQgIT09IGZ1bGwsXG4gICAgfTtcbn1cbiIsIi8qKlxuICogUmVzb2x2ZSB3aGljaCBib3NzIGd1YXJkaWFuKHMpIGFwcGVhciBvbiBhIEd1YXJkaWFuIC8gQm9zcyBzdGFnZS5cbiAqIERhdGEgY29tZXMgZnJvbSBKRlRTRSBHdWFyZGlhblN0YWdlcy5qc29uIChCb3NzR3VhcmRpYW4gKyBzaWRlIHBvb2xzKVxuICogYW5kIEJvc3NHdWFyZGlhbkluZm9fSW5pMy54bWwgLyBHdWFyZGlhbkluZm8ueG1sIG5hbWVzLlxuICovXG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc0luZm8gPSB7XG4gICAgcmVhZG9ubHkgaWQ6IG51bWJlcjtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgcmVzSWQ/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgbGV2ZWw/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgaHBCYXNlPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VHdWFyZGlhbkluZm8gPSB7XG4gICAgcmVhZG9ubHkgaWQ6IG51bWJlcjtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NTaWRlUG9vbHMgPSB7XG4gICAgcmVhZG9ubHkgbGVmdDogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgcmVhZG9ubHkgbWlkZGxlOiByZWFkb25seSBudW1iZXJbXTtcbiAgICByZWFkb25seSByaWdodDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NTdGFnZUVudHJ5ID0ge1xuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSBtYXBJZD86IG51bWJlciB8IG51bGw7XG4gICAgcmVhZG9ubHkgaXNCb3NzU3RhZ2U6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgYm9zc0lkczogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgcmVhZG9ubHkgc2lkZUd1YXJkaWFuSWRzPzogU3RhZ2VCb3NzU2lkZVBvb2xzO1xuICAgIHJlYWRvbmx5IGV4cE11bHRpcGxpZXI/OiBudW1iZXIgfCBudWxsO1xuICAgIHJlYWRvbmx5IGJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHM/OiBudW1iZXIgfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzQ2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBib3NzZXM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBTdGFnZUJvc3NJbmZvPj47XG4gICAgcmVhZG9ubHkgZ3VhcmRpYW5zPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgU3RhZ2VHdWFyZGlhbkluZm8+PjtcbiAgICByZWFkb25seSBzdGFnZXM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBTdGFnZUJvc3NTdGFnZUVudHJ5Pj47XG4gICAgcmVhZG9ubHkgYnlNYXBJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHJlYWRvbmx5IHN0cmluZ1tdPj47XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NQcm9qZWN0aW9uID0ge1xuICAgIHJlYWRvbmx5IHN0YWdlTmFtZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG1hcElkPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGlzQm9zc1N0YWdlOiBib29sZWFuO1xuICAgIC8qKiBQcmltYXJ5IGJvc3MgZ3VhcmRpYW5zIGZvciB0aGlzIHN0YWdlICh1bmlxdWUgYnkgaWQpLiAqL1xuICAgIHJlYWRvbmx5IGJvc3NlczogcmVhZG9ubHkgU3RhZ2VCb3NzSW5mb1tdO1xuICAgIC8qKiBVbmlxdWUgYm9zcyBkaXNwbGF5IG5hbWVzIChkZWR1cGVkLCBvcmRlci1wcmVzZXJ2aW5nKS4gKi9cbiAgICByZWFkb25seSBib3NzTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuICAgIC8qKiBTaWRlLWxhbmUgZ3VhcmRpYW4gbmFtZXMgdGhhdCBzcGF3biB3aXRoIHRoZSBib3NzIGJhdHRsZSAobGVmdC9yaWdodC9taWRkbGUpLiAqL1xuICAgIHJlYWRvbmx5IHNpZGVHdWFyZGlhbk5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbn07XG5cbmZ1bmN0aW9uIHVuaXF1ZU5hbWVzKG5hbWVzOiByZWFkb25seSBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3Qgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xuICAgICAgICBjb25zdCBrZXkgPSBuYW1lLnRyaW0oKTtcbiAgICAgICAgaWYgKCFrZXkgfHwgc2Vlbi5oYXMoa2V5KSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2Vlbi5hZGQoa2V5KTtcbiAgICAgICAgb3V0LnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUJvc3MoY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZywgaWQ6IG51bWJlcik6IFN0YWdlQm9zc0luZm8gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGVudHJ5ID0gY2F0YWxvZy5ib3NzZXM/LltgJHtpZH1gXTtcbiAgICBpZiAoZW50cnkgJiYgdHlwZW9mIGVudHJ5Lm5hbWUgPT09IFwic3RyaW5nXCIgJiYgZW50cnkubmFtZS50cmltKCkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBlbnRyeS5pZCA/PyBpZCxcbiAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUudHJpbSgpLFxuICAgICAgICAgICAgcmVzSWQ6IGVudHJ5LnJlc0lkLFxuICAgICAgICAgICAgbGV2ZWw6IGVudHJ5LmxldmVsLFxuICAgICAgICAgICAgaHBCYXNlOiBlbnRyeS5ocEJhc2UsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVHdWFyZGlhbk5hbWUoY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZywgaWQ6IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW50cnkgPSBjYXRhbG9nLmd1YXJkaWFucz8uW2Ake2lkfWBdO1xuICAgIGNvbnN0IG5hbWUgPSBlbnRyeT8ubmFtZT8udHJpbSgpO1xuICAgIHJldHVybiBuYW1lIHx8IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gc2lkZUlkcyhwb29sczogU3RhZ2VCb3NzU2lkZVBvb2xzIHwgdW5kZWZpbmVkKTogbnVtYmVyW10ge1xuICAgIGlmICghcG9vbHMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gWy4uLihwb29scy5sZWZ0ID8/IFtdKSwgLi4uKHBvb2xzLm1pZGRsZSA/PyBbXSksIC4uLihwb29scy5yaWdodCA/PyBbXSldO1xufVxuXG4vKipcbiAqIENhbmRpZGF0ZSBzdGFnZSBrZXlzIGZvciBhIGNoaXAgbGFiZWwgbWFwIG5hbWUuXG4gKiBCb3NzIMK3IEF0bGFudGlzIHVzZXMgYEF0bGFudGlzQm9zc2A7IHNvbWUgZHJvcHMgdXNlIGJhcmUgbWFwIG5hbWVzIHdpdGggbmVlZEJvc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZUJvc3NMb29rdXBLZXlzKG1hcE5hbWU6IHN0cmluZywgbmVlZEJvc3M6IGJvb2xlYW4pOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgY29uc3Qga2V5cyA9IFttYXBOYW1lXTtcbiAgICBpZiAobmVlZEJvc3MgJiYgIS9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKGAke21hcE5hbWV9Qm9zc2ApO1xuICAgIH1cbiAgICBpZiAoIW5lZWRCb3NzICYmIC9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hcE5hbWUucmVwbGFjZSgvQm9zcyQvaSwgXCJcIikpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gZW50cnlIYXNCb3NzZXMoZW50cnk6IFN0YWdlQm9zc1N0YWdlRW50cnkgfCB1bmRlZmluZWQpOiBlbnRyeSBpcyBTdGFnZUJvc3NTdGFnZUVudHJ5IHtcbiAgICByZXR1cm4gISFlbnRyeSAmJiBBcnJheS5pc0FycmF5KGVudHJ5LmJvc3NJZHMpICYmIGVudHJ5LmJvc3NJZHMubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTdGFnZUJvc3NFbnRyeShcbiAgICBtYXBOYW1lOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZyxcbik6IFN0YWdlQm9zc1N0YWdlRW50cnkgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHN0YWdlcyA9IGNhdGFsb2cuc3RhZ2VzO1xuICAgIGlmICghc3RhZ2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGtleXMgPSBzdGFnZUJvc3NMb29rdXBLZXlzKG1hcE5hbWUsIG5lZWRCb3NzKTtcbiAgICAvLyBQcmVmZXIgYW4gZW50cnkgdGhhdCBhY3R1YWxseSBsaXN0cyBCb3NzR3VhcmRpYW4gaWRzIChlLmcuIEF0bGFudGlzQm9zcyBvdmVyIEF0bGFudGlzKS5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gc3RhZ2VzW2tleV07XG4gICAgICAgIGlmIChlbnRyeUhhc0Jvc3NlcyhlbnRyeSkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBNYXBJZCBicmlkZ2U6IGJhcmUgbWFwIG5hbWVzIHNoYXJlIE1hcElkIHdpdGggdGhlIGJvc3Mtc3RhZ2Ugc2libGluZy5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGNvbnN0IHNlZWQgPSBzdGFnZXNba2V5XTtcbiAgICAgICAgaWYgKHNlZWQ/Lm1hcElkID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNpYmxpbmdzID0gY2F0YWxvZy5ieU1hcElkPy5bYCR7c2VlZC5tYXBJZH1gXSA/PyBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzaWJsaW5nTmFtZSBvZiBzaWJsaW5ncykge1xuICAgICAgICAgICAgY29uc3Qgc2libGluZyA9IHN0YWdlc1tzaWJsaW5nTmFtZV07XG4gICAgICAgICAgICBpZiAoZW50cnlIYXNCb3NzZXMoc2libGluZykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2libGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBMYXN0IHJlc29ydDogYW55IG1hdGNoaW5nIHN0YWdlIHJvdyAobm9uLWJvc3MgVGVtcGxlLCBldGMuKS5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGlmIChzdGFnZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWdlc1trZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUHJvamVjdCB0aGUgYm9zcyhlcykgYW5kIHNpZGUgZ3VhcmRpYW5zIGZvciBhIHN0YWdlIGNoaXAuXG4gKiBTdXBwb3J0cyBtdWx0aS1ib3NzIHN0YWdlcyB2aWEgYm9zc0lkc1tdIChKRlRTRSBjdXJyZW50bHkgc2hpcHMgb25lIEJvc3NHdWFyZGlhbiBwZXIgc3RhZ2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdFN0YWdlQm9zc2VzKFxuICAgIG1hcE5hbWU6IHN0cmluZyxcbiAgICBuZWVkQm9zczogYm9vbGVhbixcbiAgICBjYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nLFxuKTogU3RhZ2VCb3NzUHJvamVjdGlvbiB7XG4gICAgY29uc3QgZW50cnkgPSBmaW5kU3RhZ2VCb3NzRW50cnkobWFwTmFtZSwgbmVlZEJvc3MsIGNhdGFsb2cpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YWdlTmFtZTogbWFwTmFtZSxcbiAgICAgICAgICAgIGlzQm9zc1N0YWdlOiBuZWVkQm9zcyxcbiAgICAgICAgICAgIGJvc3NlczogW10sXG4gICAgICAgICAgICBib3NzTmFtZXM6IFtdLFxuICAgICAgICAgICAgc2lkZUd1YXJkaWFuTmFtZXM6IFtdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGJvc3NlczogU3RhZ2VCb3NzSW5mb1tdID0gW107XG4gICAgY29uc3Qgc2VlbkJvc3NJZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGVudHJ5LmJvc3NJZHMgPz8gW10pIHtcbiAgICAgICAgaWYgKHNlZW5Cb3NzSWRzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW5Cb3NzSWRzLmFkZChpZCk7XG4gICAgICAgIGNvbnN0IGJvc3MgPSByZXNvbHZlQm9zcyhjYXRhbG9nLCBpZCk7XG4gICAgICAgIGlmIChib3NzKSB7XG4gICAgICAgICAgICBib3NzZXMucHVzaChib3NzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNpZGVHdWFyZGlhbk5hbWVzID0gdW5pcXVlTmFtZXMoXG4gICAgICAgIHNpZGVJZHMoZW50cnkuc2lkZUd1YXJkaWFuSWRzKVxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IHJlc29sdmVHdWFyZGlhbk5hbWUoY2F0YWxvZywgaWQpKVxuICAgICAgICAgICAgLmZpbHRlcigobik6IG4gaXMgc3RyaW5nID0+IHR5cGVvZiBuID09PSBcInN0cmluZ1wiKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhZ2VOYW1lOiBlbnRyeS5uYW1lLFxuICAgICAgICBtYXBJZDogdHlwZW9mIGVudHJ5Lm1hcElkID09PSBcIm51bWJlclwiID8gZW50cnkubWFwSWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlzQm9zc1N0YWdlOiAhIWVudHJ5LmlzQm9zc1N0YWdlLFxuICAgICAgICBib3NzZXMsXG4gICAgICAgIGJvc3NOYW1lczogdW5pcXVlTmFtZXMoYm9zc2VzLm1hcCgoYikgPT4gYi5uYW1lKSksXG4gICAgICAgIHNpZGVHdWFyZGlhbk5hbWVzLFxuICAgIH07XG59XG4iLCJleHBvcnQgdHlwZSBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzID0gbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbjtcblxudHlwZSBTdG9yYWdlX3ZhbHVlID0gYCR7XCJzXCIgfCBcIm5cIiB8IFwiYlwifSR7c3RyaW5nfWA7XG5cbmZ1bmN0aW9uIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyk6IFN0b3JhZ2VfdmFsdWUge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBgcyR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgcmV0dXJuIGBuJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gXCJiMVwiIDogXCJiMFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5nX3RvX3ZhcmlhYmxlKHZ2OiBTdG9yYWdlX3ZhbHVlKTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB7XG4gICAgY29uc3QgcHJlZml4ID0gdnZbMF07XG4gICAgY29uc3QgdmFsdWUgPSB2di5zdWJzdHJpbmcoMSk7XG4gICAgc3dpdGNoIChwcmVmaXgpIHtcbiAgICAgICAgY2FzZSAncyc6IC8vc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIGNhc2UgJ24nOiAvL251bWJlclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICBjYXNlICdiJzogLy9ib29sZWFuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IFwiMVwiID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBgaW52YWxpZCB2YWx1ZTogJHt2dn1gO1xufVxuXG5mdW5jdGlvbiBpc19zdG9yYWdlX3ZhbHVlKGtleTogc3RyaW5nKToga2V5IGlzIFN0b3JhZ2VfdmFsdWUge1xuICAgIHJldHVybiBrZXkubGVuZ3RoID49IDEgJiYgXCJzbmJcIi5pbmNsdWRlcyhrZXlbMF0pO1xufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFibGVfc3RvcmFnZSB7XG4gICAgc3RhdGljIGdldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdG9yZWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUoc3RvcmVkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdfdG9fdmFyaWFibGUoc3RvcmVkKTtcbiAgICB9XG4gICAgc3RhdGljIHNldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcsIHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCwgdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlKSk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWxldGVfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgfVxuICAgIHN0YXRpYyBjbGVhcl9hbGwoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHZhcmlhYmxlcygpIHtcbiAgICAgICAgbGV0IHJlc3VsdDogeyBba2V5OiBzdHJpbmddOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIH0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBzdHJpbmdfdG9fdmFyaWFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSJdfQ==
