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
  const shopNobuyData = download("/assets/shop-nobuy-indexes.json");
  // Boss/map drops from S_Relationships (beyond GuardianStages Rewards lists).
  const productStageDropsData = download("/assets/product-stage-drops.json");
  const itemArtData = download("/assets/item-art-map.json");
  const mapArtData = download("/assets/map-art-map.json");
  const stageBossData = download("/assets/stage-bosses.json");
  const bossArtData = download("/assets/boss-art-map.json");
  const max_shop_pages = 20; //currently need only 10, should be enough
  const shopURL = "/api/shop?size=1000&page=";
  const shopDatas = [...Array(max_shop_pages).keys()].map(n => download(`${shopURL}${n}`));
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
      src: `/assets/boss-art/${encodeURIComponent(file)}`,
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
      src: `/assets/boss-art/${encodeURIComponent(file)}`,
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
    style: [`--item-art-image:url("/assets/item-art/${encodeURIComponent(sheet)}.webp")`, `--item-art-size:${imageSize}px`, `--item-art-x:${offsetX}px`, `--item-art-y:${offsetY}px`].join(";")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJnYWNoYUFjcXVpc2l0aW9uLnRzIiwiaHRtbC50cyIsIml0ZW1Mb29rdXAudHMiLCJtYWluLnRzIiwicHJpb3JpdHkudHMiLCJwcmlvcml0eVN0YXRIZWFkZXJzLnRzIiwic3RhZ2VCb3NzZXMudHMiLCJzdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFBLEtBQUEsR0FBQSxPQUFBO0FBSUEsU0FBUyxXQUFXLENBQUMsSUFBc0I7RUFDdkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWE7RUFDcEMsSUFBSSxFQUFFLFNBQVMsWUFBWSxhQUFhLENBQUMsRUFBRTtJQUN2QyxPQUFPLEVBQUU7RUFDYjtFQUNBLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhO0VBQ3pDLElBQUksRUFBRSxTQUFTLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUMxQyxPQUFPLEVBQUU7RUFDYjtFQUNBLEtBQUssSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtJQUMzRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxFQUFFO01BQzlDO0lBQ0o7SUFDQSxNQUFNLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDN0UsSUFBSSxFQUFFLHFCQUFxQixZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDdEQ7SUFDSjtJQUNBLE9BQU8sS0FBSyxDQUNQLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FDcEMsTUFBTSxDQUFFLENBQUMsSUFBeUIsQ0FBQyxZQUFZLGFBQWEsSUFBSSxDQUFDLENB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SSxHQUFHLE9BQU87Y0FDbkI7WUFDSixLQUFLLEtBQUs7Y0FDTixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUs7Y0FDakI7WUFDSixLQUFLLE9BQU87Y0FDUixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87Y0FDbkI7WUFDSixLQUFLLFFBQVE7Y0FDVCxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVE7Y0FDcEI7WUFDSixLQUFLLE1BQU07Y0FDUCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU87Y0FDbkI7WUFDSixLQUFLLE1BQU07Y0FDUCxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU07Y0FDbEI7WUFDSixLQUFLLEtBQUs7Y0FDTixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUs7Y0FDakI7WUFDSjtjQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEtBQUssRUFBRSxDQUFDO1VBQ25EO1VBQ0E7UUFDSixLQUFLLE9BQU87VUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLEtBQUs7VUFDTixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLE9BQU87VUFDUixJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDekI7UUFDSixLQUFLLFVBQVU7VUFDWCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDakM7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDaEM7UUFDSixLQUFLLFlBQVk7VUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUI7UUFDSixLQUFLLFdBQVc7VUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDL0I7UUFDSixLQUFLLGlCQUFpQjtVQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDN0I7UUFDSixLQUFLLFVBQVU7VUFDWCxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDMUI7UUFDSixLQUFLLFlBQVk7VUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUI7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLFNBQVM7VUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7VUFDbEQ7UUFDSixLQUFLLGdCQUFnQjtVQUNqQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7VUFDNUM7UUFDSixLQUFLLGNBQWM7VUFDZixJQUFJLENB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MUMsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDL0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDekI7TUFDSjtNQUNBLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO01BQ3ZDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzNCO01BQ0o7TUFDQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUI7TUFDSjtNQUNBLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7SUFDM0M7SUFDQSxPQUFPLE1BQU07RUFDakI7O0FBQ0gsT0FBQSxDQUFBLGdCQUFBLEdBQUEsZ0JBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IHR5cGUgVHJlZU5vZGUgPSBzdHJpbmcgfCBUcmVlTm9kZVtdO1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogSFRNTElucHV0RWxlbWVudFtdIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGZvciAobGV0IGNoaWxkSW5kZXggPSAwOyBjaGlsZEluZGV4IDwgcGFyZW50X3VsLmNoaWxkcmVuLmxlbmd0aDsgY2hpbGRJbmRleCsrKSB7XG4gICAgICAgIGlmIChwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleF0gIT09IHBhcmVudF9saSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG90ZW50aWFsU2libGluZ0VudHJ5ID0gcGFyZW50X3VsLmNoaWxkcmVuW2NoaWxkSW5kZXggKyAxXT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBvdGVudGlhbFNpYmxpbmdFbnRyeSBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKHBvdGVudGlhbFNpYmxpbmdFbnRyeS5jaGlsZHJlbilcbiAgICAgICAgICAgIC5maWx0ZXIoKGUpOiBlIGlzIEhUTUxMSUVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgZS5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpXG4gICAgICAgICAgICAubWFwKGUgPT4gZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKG5vZGUpKSB7XG4gICAgICAgIGlmIChjaGlsZC5jaGVja2VkICE9PSBub2RlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNoaWxkLmNoZWNrZWQgPSBub2RlLmNoZWNrZWQ7XG4gICAgICAgICAgICBjaGlsZC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgICAgICAgICBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50KG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50IHwgdm9pZCB7XG4gICAgY29uc3QgcGFyZW50X2xpID0gbm9kZS5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF9saSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50X3VsID0gcGFyZW50X2xpLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X3VsIGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY2FuZGlkYXRlOiBIVE1MTElFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50X3VsLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgY2hpbGQuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjYW5kaWRhdGUgPSBjaGlsZDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gcGFyZW50X2xpICYmIGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBbmNlc3RvcnMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKTtcbiAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBmb3VuZENoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRVbmNoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRJbmRldGVybWluYXRlID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGZvdW5kQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkLmluZGV0ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZvdW5kSW5kZXRlcm1pbmF0ZSB8fCBmb3VuZENoZWNrZWQgJiYgZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZENoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB1cGRhdGVBbmNlc3RvcnMocGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVyKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHModGFyZ2V0KTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKHRhcmdldCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcnMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVyKGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlOiBUcmVlTm9kZSk6IEhUTUxMSUVsZW1lbnQge1xuICAgIGlmICh0eXBlb2YgdHJlZU5vZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCIrXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY2hlY2tlZCAmJiB7IGNoZWNrZWQ6IFwiY2hlY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgeyBmb3I6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSB9LFxuICAgICAgICAgICAgICAgIHRyZWVOb2RlXG4gICAgICAgICAgICBdXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNyZWF0ZUhUTUwoW1widWxcIiwgeyBjbGFzczogXCJjaGVja2JveFwiIH1dKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRyZWVOb2RlW2ldO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChtYWtlQ2hlY2tib3hUcmVlTm9kZShub2RlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1wibGlcIiwgbGlzdF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWUodHJlZU5vZGU6IFRyZWVOb2RlKSB7XG4gICAgbGV0IHJvb3QgPSBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZSkuY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocm9vdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgYXBwbHlDaGVja0xpc3RlbmVycyhyb290KTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKHJvb3QpKSB7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIGdldExlYXZlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHJlc3VsdDogSFRNTElucHV0RWxlbWVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oaW5wdXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZ2V0TGVhdmVzKGlucHV0KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildID0gbGVhZi5jaGVja2VkO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50LCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9KSB7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV07XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxlYWYuY2hlY2tlZCA9IHN0YXRlO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBQdXJlIHByb2plY3Rpb24gb2YgaG93IGEgZ2FjaGEgY29pbiBjYW4gYmUgYWNxdWlyZWQuXG4gKiBTaG9wIGRlbm9taW5hdGlvbiAoR29sZC9BUCkgaXMgc2VwYXJhdGUgZnJvbSBHdWFyZGlhbi9Cb3NzIHN0YWdlIGRyb3BzLlxuICovXG5cbmV4cG9ydCB0eXBlIEdhY2hhU2hvcENoYW5uZWwgPSB7XG4gICAgcmVhZG9ubHkga2luZDogXCJzaG9wXCI7XG4gICAgcmVhZG9ubHkgY3VycmVuY3k6IFwiR29sZFwiIHwgXCJBUFwiO1xuICAgIHJlYWRvbmx5IGF2YWlsYWJsZTogYm9vbGVhbjtcbiAgICAvKiogV2h5IHNob3AgaXMgdW5hdmFpbGFibGUgd2hlbiBhdmFpbGFibGU9ZmFsc2UuICovXG4gICAgcmVhZG9ubHkgcmVhc29uPzogXCJub3RfZm9yX3NhbGVcIiB8IFwibm90X2F2YWlsYWJsZVwiO1xufTtcblxuZXhwb3J0IHR5cGUgR2FjaGFTdGFnZUNoYW5uZWwgPSB7XG4gICAgcmVhZG9ubHkga2luZDogXCJzdGFnZVwiO1xuICAgIHJlYWRvbmx5IG1hcDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG5lZWRCb3NzOiBib29sZWFuO1xuICAgIHJlYWRvbmx5IGxhYmVsOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbCA9IEdhY2hhU2hvcENoYW5uZWwgfCBHYWNoYVN0YWdlQ2hhbm5lbDtcblxuZXhwb3J0IHR5cGUgR2FjaGFBY3F1aXNpdGlvbklucHV0ID0ge1xuICAgIHJlYWRvbmx5IGFwOiBib29sZWFuO1xuICAgIC8qKiBQcm9kdWN0IGlzIGxpc3RlZCBpbiB0aGUgbGl2ZSBzaG9wIGNhdGFsb2cgKGVuYWJsZWQpLiAqL1xuICAgIHJlYWRvbmx5IGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogVHJ1ZSBvbmx5IHdoZW4gdGhlIHByb2R1Y3QgY2FuIGFjdHVhbGx5IGJlIHB1cmNoYXNlZC5cbiAgICAgKiBKRlRTRSBgTm9idXk9MWAgcHJvZHVjdHMgc3RheSBlbmFibGVkIGluIGNhdGFsb2cgYnV0IHJlamVjdCBzaG9wIGJ1eXMuXG4gICAgICovXG4gICAgcmVhZG9ubHkgcHVyY2hhc2FibGU6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBHYWNoYVNvdXJjZUlucHV0ID1cbiAgICB8IHsgcmVhZG9ubHkga2luZDogXCJzaG9wXCI7IHJlYWRvbmx5IGFwOiBib29sZWFuIH1cbiAgICB8IHsgcmVhZG9ubHkga2luZDogXCJzdGFnZVwiOyByZWFkb25seSBtYXA6IHN0cmluZzsgcmVhZG9ubHkgbmVlZEJvc3M6IGJvb2xlYW4gfTtcblxuLyoqIFNwbGl0IENhbWVsQ2FzZSBzdGFnZSBpZHMgZnJvbSBKRlRTRSBHdWFyZGlhblN0YWdlcy5qc29uIGludG8gcmVhZGFibGUgbGFiZWxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXA6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG1hcFxuICAgICAgICAucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgXCIkMSAkMlwiKVxuICAgICAgICAucmVwbGFjZSgvKFtBLVpdKykoW0EtWl1bYS16XSkvZywgXCIkMSAkMlwiKVxuICAgICAgICAudHJpbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2VDaGFubmVsTGFiZWwobWFwOiBzdHJpbmcsIG5lZWRCb3NzOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBjb25zdCBwcmV0dHkgPSBwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKTtcbiAgICBpZiAoIW5lZWRCb3NzKSB7XG4gICAgICAgIHJldHVybiBwcmV0dHk7XG4gICAgfVxuICAgIC8vIEF2b2lkIFwiQm9zcyDCtyBBdGxhbnRpcyBCb3NzXCIg4oCUIHN0YWdlIGlkcyBlbmQgaW4gQm9zcyBhbHJlYWR5LlxuICAgIGNvbnN0IHdpdGhvdXRCb3NzU3VmZml4ID0gcHJldHR5LnJlcGxhY2UoL1xccytCb3NzJC9pLCBcIlwiKTtcbiAgICByZXR1cm4gYEJvc3MgwrcgJHt3aXRob3V0Qm9zc1N1ZmZpeH1gO1xufVxuXG4vKiogU3RyaXAgdHJhaWxpbmcgQm9zcyBzbyB0aXRsZXMgcmVhZCBcIkF0bGFudGlzXCIsIG5vdCBcIkF0bGFudGlzIEJvc3NcIi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZVRpdGxlTmFtZShtYXA6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXApLnJlcGxhY2UoL1xccytCb3NzJC9pLCBcIlwiKS50cmltKCk7XG59XG5cbmV4cG9ydCB0eXBlIE1hcEFydEZpbGUgPSB7XG4gICAgcmVhZG9ubHkgZmlsZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHdpZHRoPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGhlaWdodD86IG51bWJlcjtcbiAgICByZWFkb25seSBraW5kPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgTWFwQXJ0Q2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBmaWxlczogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgTWFwQXJ0RmlsZT4+O1xuICAgIHJlYWRvbmx5IGJ5TmFtZTogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG4gICAgcmVhZG9ubHkgYnlNYXBJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xufTtcblxuLyoqIENhbmRpZGF0ZSBzdGFnZSBrZXlzIGZvciBtYXAgYXJ0IChCb3NzIHN1ZmZpeCArIGJhcmUgbWFwIG5hbWUpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcEFydExvb2t1cEtleXMobWFwTmFtZTogc3RyaW5nLCBuZWVkQm9zcyA9IGZhbHNlKTogcmVhZG9ubHkgc3RyaW5nW10ge1xuICAgIGNvbnN0IGtleXMgPSBbbWFwTmFtZV07XG4gICAgaWYgKG5lZWRCb3NzICYmICEvQm9zcyQvaS50ZXN0KG1hcE5hbWUpKSB7XG4gICAgICAgIGtleXMucHVzaChgJHttYXBOYW1lfUJvc3NgKTtcbiAgICB9XG4gICAgaWYgKC9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hcE5hbWUucmVwbGFjZSgvQm9zcyQvaSwgXCJcIikpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGF1dGhlbnRpYyBjbGllbnQgbWFwIGFydCBmb3IgYSBHdWFyZGlhblN0YWdlcyBtYXAgbmFtZS5cbiAqIFByZWZlcnMgVUkgbWFwLXNlbGVjdCB0aHVtYnM7IGZhbGxzIGJhY2sgdG8gc3RhZ2UtZW52aXJvbm1lbnQgdGV4dHVyZXMgd2hlbiBjYXRhbG9ndWVkLlxuICogTmV2ZXIgaW52ZW50cyBhcnQg4oCUIG9ubHkgcmV0dXJucyBhbiBleHBsaWNpdCBjYXRhbG9nIG1hcHBpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTWFwQXJ0RmlsZShcbiAgICBtYXBOYW1lOiBzdHJpbmcsXG4gICAgY2F0YWxvZzogTWFwQXJ0Q2F0YWxvZyxcbiAgICBvcHRpb25zPzogeyByZWFkb25seSBuZWVkQm9zcz86IGJvb2xlYW47IHJlYWRvbmx5IG1hcElkPzogbnVtYmVyIH0sXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBtYXBBcnRMb29rdXBLZXlzKG1hcE5hbWUsIG9wdGlvbnM/Lm5lZWRCb3NzID8/IGZhbHNlKSkge1xuICAgICAgICBjb25zdCBrZXkgPSBjYXRhbG9nLmJ5TmFtZVtuYW1lXTtcbiAgICAgICAgaWYgKGtleSAmJiBjYXRhbG9nLmZpbGVzW2tleV0/LmZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYXRhbG9nLmZpbGVzW2tleV0uZmlsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnM/Lm1hcElkID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGNhdGFsb2cuYnlNYXBJZD8uW2Ake29wdGlvbnMubWFwSWR9YF07XG4gICAgICAgIGlmIChrZXkgJiYgY2F0YWxvZy5maWxlc1trZXldPy5maWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2F0YWxvZy5maWxlc1trZXldLmZpbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBQcm9qZWN0IHNob3AgKyBzdGFnZSBhY3F1aXNpdGlvbiBjaGFubmVscyBmb3IgYSBnYWNoYSBjb2luLlxuICpcbiAqIC0gUHVyY2hhc2FibGUgc2hvcCDihpIgR29sZC9BUCBwaWxsLlxuICogLSBDYXRhbG9nLWxpc3RlZCBidXQgTm9idXkgKGBwdXJjaGFzYWJsZT1mYWxzZWAsIGBlbmFibGVkPXRydWVgKSDihpIgTm90IGZvciBzYWxlXG4gKiAgIChzdGlsbCBzaG93biB3aGVuIHN0YWdlcyBleGlzdCBzbyBwbGF5ZXJzIGRvIG5vdCBhc3N1bWUgYSBwcmljZSkuXG4gKiAtIEZ1bGx5IGRpc2FibGVkIHNob3Agd2l0aCBubyBzdGFnZXMg4oaSIE5vdCBhdmFpbGFibGUuXG4gKiAtIERpc2FibGVkIHNob3Agd2l0aCBzdGFnZXMg4oaSIHN0YWdlcyBvbmx5IChvbWl0IHNob3AgY2hyb21lKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbHMoXG4gICAgZ2FjaGE6IEdhY2hhQWNxdWlzaXRpb25JbnB1dCxcbiAgICBzb3VyY2VzOiByZWFkb25seSBHYWNoYVNvdXJjZUlucHV0W10sXG4pOiByZWFkb25seSBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbFtdIHtcbiAgICBjb25zdCBjaGFubmVsczogR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxbXSA9IFtdO1xuICAgIGNvbnN0IHN0YWdlU291cmNlcyA9IHNvdXJjZXMuZmlsdGVyKFxuICAgICAgICAoc291cmNlKTogc291cmNlIGlzIEV4dHJhY3Q8R2FjaGFTb3VyY2VJbnB1dCwgeyBraW5kOiBcInN0YWdlXCIgfT4gPT5cbiAgICAgICAgICAgIHNvdXJjZS5raW5kID09PSBcInN0YWdlXCIsXG4gICAgKTtcbiAgICBjb25zdCBoYXNTdGFnZSA9IHN0YWdlU291cmNlcy5sZW5ndGggPiAwO1xuICAgIGNvbnN0IGN1cnJlbmN5ID0gZ2FjaGEuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIjtcblxuICAgIGlmIChnYWNoYS5wdXJjaGFzYWJsZSkge1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZ2FjaGEuZW5hYmxlZCkge1xuICAgICAgICAvLyBMaXN0ZWQgaW4gc2hvcCBVSSAvIEFQSSBidXQgYmxvY2tlZCBieSBOb2J1eSDigJQgbmV2ZXIgaW1wbHkgYSBidXkgcGF0aC5cbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYXNvbjogXCJub3RfZm9yX3NhbGVcIixcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghaGFzU3RhZ2UpIHtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYXNvbjogXCJub3RfYXZhaWxhYmxlXCIsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNlZW5NYXBzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBzdGFnZSBvZiBzdGFnZVNvdXJjZXMpIHtcbiAgICAgICAgaWYgKHNlZW5NYXBzLmhhcyhzdGFnZS5tYXApKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuTWFwcy5hZGQoc3RhZ2UubWFwKTtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICBtYXA6IHN0YWdlLm1hcCxcbiAgICAgICAgICAgIG5lZWRCb3NzOiBzdGFnZS5uZWVkQm9zcyxcbiAgICAgICAgICAgIGxhYmVsOiBzdGFnZUNoYW5uZWxMYWJlbChzdGFnZS5tYXAsIHN0YWdlLm5lZWRCb3NzKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5uZWxzO1xufVxuXG4vKiogUGFyc2UgcHJvZHVjdCBpbmRleGVzIHdpdGggTm9idXniiaAwIGZyb20gSkZUU0UgU2hvcF9JbmkzLnhtbCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMoc2hvcFhtbDogc3RyaW5nKTogUmVhZG9ubHlTZXQ8bnVtYmVyPiB7XG4gICAgY29uc3Qgbm9idXkgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIHNob3BYbWwubWF0Y2hBbGwoLzxQcm9kdWN0XFxzKyhbXj5dKz8pXFwvPz4vZykpIHtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBtYXRjaFsxXSA/PyBcIlwiO1xuICAgICAgICBjb25zdCBpbmRleE1hdGNoID0gYXR0cnMubWF0Y2goL1xcYkluZGV4PVwiKFxcZCspXCIvKTtcbiAgICAgICAgY29uc3Qgbm9idXlNYXRjaCA9IGF0dHJzLm1hdGNoKC9cXGJOb2J1eT1cIihcXGQrKVwiLyk7XG4gICAgICAgIGlmICghaW5kZXhNYXRjaCB8fCAhbm9idXlNYXRjaCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vYnV5TWF0Y2hbMV0gIT09IFwiMFwiKSB7XG4gICAgICAgICAgICBub2J1eS5hZGQoTnVtYmVyKGluZGV4TWF0Y2hbMV0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9idXk7XG59XG4iLCJ0eXBlIFRhZ19uYW1lID0ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xudHlwZSBBdHRyaWJ1dGVzID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbnR5cGUgSFRNTF9ub2RlPFQgZXh0ZW5kcyBUYWdfbmFtZT4gPSBbVCwgLi4uKEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IEF0dHJpYnV0ZXMpW11dO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSFRNTDxUIGV4dGVuZHMgVGFnX25hbWU+KG5vZGU6IEhUTUxfbm9kZTxUPik6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZVswXSk7XG4gICAgZnVuY3Rpb24gaGFuZGxlKHBhcmFtZXRlcjogQXR0cmlidXRlcyB8IEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlciA9PT0gXCJzdHJpbmdcIiB8fCBwYXJhbWV0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQocGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBhcmFtZXRlcikpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNyZWF0ZUhUTUwocGFyYW1ldGVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHBhcmFtZXRlcltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFuZGxlKG5vZGVbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuaW1wb3J0IHtcbiAgICBwcmV0dHlHdWFyZGlhbk1hcE5hbWUsXG4gICAgcHJvamVjdEdhY2hhQWNxdWlzaXRpb25DaGFubmVscyxcbiAgICByZXNvbHZlTWFwQXJ0RmlsZSxcbiAgICBzdGFnZUNoYW5uZWxMYWJlbCxcbiAgICBzdGFnZVRpdGxlTmFtZSxcbiAgICB0eXBlIEdhY2hhU291cmNlSW5wdXQsXG4gICAgdHlwZSBNYXBBcnRDYXRhbG9nLFxufSBmcm9tICcuL2dhY2hhQWNxdWlzaXRpb24nO1xuaW1wb3J0IHsgcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5pbXBvcnQge1xuICAgIHByb2plY3RTdGFnZUJvc3NlcyxcbiAgICB0eXBlIFN0YWdlQm9zc0NhdGFsb2csXG4gICAgdHlwZSBTdGFnZUJvc3NQcm9qZWN0aW9uLFxufSBmcm9tICcuL3N0YWdlQm9zc2VzJztcblxuZXhwb3J0IHsgcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5leHBvcnQgdHlwZSB7IFByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkgfSBmcm9tICcuL3ByaW9yaXR5U3RhdEhlYWRlcnMnO1xuZXhwb3J0IHtcbiAgICByZXNvbHZlTWFwQXJ0RmlsZSxcbiAgICBzdGFnZVRpdGxlTmFtZSxcbn0gZnJvbSAnLi9nYWNoYUFjcXVpc2l0aW9uJztcbmV4cG9ydCB7XG4gICAgcHJvamVjdFN0YWdlQm9zc2VzLFxufSBmcm9tICcuL3N0YWdlQm9zc2VzJztcblxuZXhwb3J0IGNvbnN0IGNoYXJhY3RlcnMgPSBbXCJOaWtpXCIsIFwiTHVuTHVuXCIsIFwiTHVjeVwiLCBcIlNodWFcIiwgXCJEaGFucGlyXCIsIFwiUG9jaGlcIiwgXCJBbFwiXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIENoYXJhY3RlciA9IHR5cGVvZiBjaGFyYWN0ZXJzW251bWJlcl07XG5leHBvcnQgZnVuY3Rpb24gaXNDaGFyYWN0ZXIoY2hhcmFjdGVyOiBzdHJpbmcpOiBjaGFyYWN0ZXIgaXMgQ2hhcmFjdGVyIHtcbiAgICByZXR1cm4gKGNoYXJhY3RlcnMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkuaW5jbHVkZXMoY2hhcmFjdGVyKTtcbn1cblxuZXhwb3J0IHR5cGUgUGFydCA9IFwiSGF0XCIgfCBcIkhhaXJcIiB8IFwiRHllXCIgfCBcIlVwcGVyXCIgfCBcIkxvd2VyXCIgfCBcIlNob2VzXCIgfCBcIlNvY2tzXCIgfCBcIkhhbmRcIiB8IFwiQmFja3BhY2tcIiB8IFwiRmFjZVwiIHwgXCJSYWNrZXRcIiB8IFwiT3RoZXJcIjtcblxuZXhwb3J0IGNsYXNzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNob3BfaWQ6IG51bWJlcikgeyB9XG5cbiAgICBnZXQgcmVxdWlyZXNHdWFyZGlhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4udGhpcy5pdGVtLnNvdXJjZXMudmFsdWVzKCldLmV2ZXJ5KHNvdXJjZSA9PiBzb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaXRlbSgpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIGZpbmRpbmcgaXRlbSBvZiBpdGVtU291cmNlICR7dGhpcy5zaG9wX2lkfWApO1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNob3BJdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3Ioc2hvcF9pZDogbnVtYmVyLCByZWFkb25seSBwcmljZTogbnVtYmVyLCByZWFkb25seSBhcDogYm9vbGVhbiwgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSkge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYUl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoc2hvcF9pZCk7XG4gICAgfVxuXG4gICAgZ2FjaGFUcmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghZ2FjaGEpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2FjaGEuYXZlcmFnZV90cmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgR2FjaGFFY29ub21pY3MgPVxuICAgIHwge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwidW5hdmFpbGFibGVcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBleHBlY3RlZFB1bGxzOiBudW1iZXI7XG4gICAgfVxuICAgIHwge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwiZGlyZWN0XCI7XG4gICAgICAgIGNoYW5jZVBlcmNlbnQ6IG51bWJlcjtcbiAgICAgICAgY3VycmVuY3k6IFwiQVBcIiB8IFwiR29sZFwiO1xuICAgICAgICBleHBlY3RlZFB1bGxzOiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkU3BlbmQ6IG51bWJlcjtcbiAgICAgICAgcHJpY2VQZXJQdWxsOiBudW1iZXI7XG4gICAgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RHYWNoYUVjb25vbWljcyhcbiAgICBleHBlY3RlZFB1bGxzOiBudW1iZXIsXG4gICAgc291cmNlPzogeyBwcmljZTogbnVtYmVyOyBhcDogYm9vbGVhbiB9LFxuKTogR2FjaGFFY29ub21pY3Mge1xuICAgIGNvbnN0IGNoYW5jZVBlcmNlbnQgPSBleHBlY3RlZFB1bGxzID4gMCA/IDEwMCAvIGV4cGVjdGVkUHVsbHMgOiAwO1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhdmFpbGFiaWxpdHk6IFwidW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIGNoYW5jZVBlcmNlbnQsXG4gICAgICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwiZGlyZWN0XCIsXG4gICAgICAgIGNoYW5jZVBlcmNlbnQsXG4gICAgICAgIGN1cnJlbmN5OiBzb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIixcbiAgICAgICAgZXhwZWN0ZWRQdWxscyxcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogZXhwZWN0ZWRQdWxscyAqIHNvdXJjZS5wcmljZSxcbiAgICAgICAgcHJpY2VQZXJQdWxsOiBzb3VyY2UucHJpY2UsXG4gICAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIEd1YXJkaWFuSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBndWFyZGlhbl9tYXA6IHN0cmluZyxcbiAgICAgICAgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSxcbiAgICAgICAgcmVhZG9ubHkgeHA6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmVlZF9ib3NzOiBib29sZWFuLFxuICAgICAgICByZWFkb25seSBib3NzX3RpbWU6IG51bWJlcikge1xuICAgICAgICBzdXBlcihHdWFyZGlhbkl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwX2lkKGd1YXJkaWFuX21hcCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBndWFyZGlhbl9tYXBfaWQobWFwOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5ndWFyZGlhbl9tYXBzLmluZGV4T2YobWFwKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5ndWFyZGlhbl9tYXBzLnB1c2gobWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLWluZGV4O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGd1YXJkaWFuX21hcHMgPSBbXCJcIl07XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVtIHtcbiAgICBpZCA9IDA7XG4gICAgbmFtZV9rciA9IFwiXCI7XG4gICAgbmFtZV9lbiA9IFwiXCI7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgbWF4VXNlID0gMDtcbiAgICBoaWRkZW4gPSBmYWxzZTtcbiAgICByZXNpc3QgPSBcIlwiO1xuICAgIGNoYXJhY3Rlcj86IENoYXJhY3RlcjtcbiAgICBwYXJ0OiBQYXJ0ID0gXCJPdGhlclwiO1xuICAgIGxldmVsID0gMDtcbiAgICBzdHIgPSAwO1xuICAgIHN0YSA9IDA7XG4gICAgZGV4ID0gMDtcbiAgICB3aWwgPSAwO1xuICAgIGhwID0gMDtcbiAgICBxdWlja3Nsb3RzID0gMDtcbiAgICBidWZmc2xvdHMgPSAwO1xuICAgIHNtYXNoID0gMDtcbiAgICBtb3ZlbWVudCA9IDA7XG4gICAgY2hhcmdlID0gMDtcbiAgICBsb2IgPSAwO1xuICAgIHNlcnZlID0gMDtcbiAgICBtYXhfc3RyID0gMDtcbiAgICBtYXhfc3RhID0gMDtcbiAgICBtYXhfZGV4ID0gMDtcbiAgICBtYXhfd2lsID0gMDtcbiAgICBlbGVtZW50X2VuY2hhbnRhYmxlID0gZmFsc2U7XG4gICAgcGFyY2VsX2VuYWJsZWQgPSBmYWxzZTtcbiAgICBzcGluID0gMDtcbiAgICBhdHNzID0gMDtcbiAgICBkZnNzID0gMDtcbiAgICBzb2NrZXQgPSAwO1xuICAgIGdhdWdlID0gMDtcbiAgICBnYXVnZV9iYXR0bGUgPSAwO1xuICAgIHNvdXJjZXM6IEl0ZW1Tb3VyY2VbXSA9IFtdO1xuICAgIHN0YXRGcm9tU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSBcIk1vdiBTcGVlZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVtZW50O1xuICAgICAgICAgICAgY2FzZSBcIkNoYXJnZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJnZTtcbiAgICAgICAgICAgIGNhc2UgXCJMb2JcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2I7XG4gICAgICAgICAgICBjYXNlIFwiU21hc2hcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zbWFzaDtcbiAgICAgICAgICAgIGNhc2UgXCJTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdHI7XG4gICAgICAgICAgICBjYXNlIFwiRGV4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV4O1xuICAgICAgICAgICAgY2FzZSBcIlN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YTtcbiAgICAgICAgICAgIGNhc2UgXCJXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lsO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RyO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfZGV4O1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdGFcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RhO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X3dpbDtcbiAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZlO1xuICAgICAgICAgICAgY2FzZSBcIlF1aWNrc2xvdHNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5xdWlja3Nsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkJ1ZmZzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1ZmZzbG90cztcbiAgICAgICAgICAgIGNhc2UgXCJIUFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhwO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHNob3BfaW5kZXg6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgZ2FjaGFfaW5kZXg6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBwcmljZTogbnVtYmVyID0gMCxcbiAgICAgICAgcmVhZG9ubHkgYXA6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgLyoqIExpc3RlZCBpbiB0aGUgbGl2ZSBzaG9wIGNhdGFsb2cgKGBlbmFibGVkYCkuICovXG4gICAgICAgIHJlYWRvbmx5IGVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbiBiZSBwdXJjaGFzZWQgd2l0aCBHb2xkL0FQLiBGYWxzZSB3aGVuIFNob3BfSW5pMyBgTm9idXniiaAwYFxuICAgICAgICAgKiBldmVuIGlmIHRoZSBjYXRhbG9nIHN0aWxsIGxpc3RzIHRoZSBwcm9kdWN0IGFzIGVuYWJsZWQuXG4gICAgICAgICAqL1xuICAgICAgICByZWFkb25seSBwdXJjaGFzYWJsZTogYm9vbGVhbiA9IHRydWUsXG4gICAgKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIGNoYXJhY3RlcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvcF9pdGVtcy5zZXQoY2hhcmFjdGVyLCBuZXcgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPigpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkKGl0ZW06IEl0ZW0sIHByb2JhYmlsaXR5OiBudW1iZXIsIGNoYXJhY3RlcjogQ2hhcmFjdGVyLCBxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGl0ZW0uY2hhcmFjdGVyICYmIGl0ZW0uY2hhcmFjdGVyICE9PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIC8vIExvdHRlcnkgZmlsZXMgbGlzdCBldmVyeSBjaGFyYWN0ZXIncyBnZWFyIHVuZGVyIGVhY2ggTG90dGVyeUl0ZW1fKiBibG9jay5cbiAgICAgICAgICAgIC8vIFJvdXRlIHRoZSBlbnRyeSB0byB0aGUgaXRlbSdzIG93bmluZyBjaGFyYWN0ZXIgc28gZmlsdGVycyBzdGF5IG1lYW5pbmdmdWwuXG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBpdGVtLmNoYXJhY3RlcjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXAgPSB0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhO1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IG1hcC5nZXQoaXRlbSk7XG4gICAgICAgIC8vIFNhbWUgSXRlbSBjYW4gYXBwZWFyIG9uY2UgcGVyIGNoYXJhY3Rlci1ibG9jayAoZS5nLiA3w5cgRHJhZ29uIEFybW9yIGF0IDElKS5cbiAgICAgICAgLy8gQWNjdW11bGF0ZSBDaGFuc1BlciBpbnN0ZWFkIG9mIG92ZXJ3cml0aW5nIOKAlCBvdGhlcndpc2UgcmF0ZXMgc3RheSBzdHVjayBhdCAxJVxuICAgICAgICAvLyB3aGlsZSBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgc3RpbGwgc3VtcyB0byAxMDAgKG1hcCB0aWNrZXRzIOKJqiBwb29sIHRvdGFsKS5cbiAgICAgICAgaWYgKHByZXZpb3VzKSB7XG4gICAgICAgICAgICBtYXAuc2V0KGl0ZW0sIFtcbiAgICAgICAgICAgICAgICBwcmV2aW91c1swXSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgIE1hdGgubWluKHByZXZpb3VzWzFdLCBxdWFudGl0eV9taW4pLFxuICAgICAgICAgICAgICAgIE1hdGgubWF4KHByZXZpb3VzWzJdLCBxdWFudGl0eV9tYXgpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtYXAuc2V0KGl0ZW0sIFtwcm9iYWJpbGl0eSwgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5zZXQoY2hhcmFjdGVyLCBwcm9iYWJpbGl0eSArICh0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSB8fCAwKSk7XG4gICAgfVxuXG4gICAgYXZlcmFnZV90cmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBjaGFyczogcmVhZG9ubHkgQ2hhcmFjdGVyW10gPSBjaGFyYWN0ZXIgPyAoW2NoYXJhY3Rlcl0pIDogY2hhcmFjdGVycztcbiAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSBjaGFycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArICh0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhLmdldChpdGVtKT8uWzBdIHx8IDApLCAwKTtcbiAgICAgICAgaWYgKHByb2JhYmlsaXR5ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b3RhbF9wcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICAgICAgcmV0dXJuIHRvdGFsX3Byb2JhYmlsaXR5IC8gcHJvYmFiaWxpdHk7XG4gICAgfVxuXG4gICAgZ2V0IHRvdGFsX3Byb2JhYmlsaXR5KCkge1xuICAgICAgICByZXR1cm4gY2hhcmFjdGVycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpISwgMCk7XG4gICAgfVxuXG4gICAgY2hhcmFjdGVyX3Byb2JhYmlsaXR5ID0gbmV3IE1hcDxDaGFyYWN0ZXIsIG51bWJlcj4oKTtcbiAgICBzaG9wX2l0ZW1zID0gbmV3IE1hcDxDaGFyYWN0ZXIsIE1hcDxJdGVtLCBbLypwcm9iYWJpbGl0eToqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWluOiovIG51bWJlciwgLypxdWFudGl0eV9tYXg6Ki8gbnVtYmVyXT4+KCk7XG59XG5cbmV4cG9ydCBsZXQgaXRlbXMgPSBuZXcgTWFwPG51bWJlciwgSXRlbT4oKTtcbmV4cG9ydCBsZXQgc2hvcF9pdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBnYWNoYXMgPSBuZXcgTWFwPG51bWJlciwgR2FjaGE+KCk7XG5sZXQgZGlhbG9nOiBIVE1MRGlhbG9nRWxlbWVudCB8IHVuZGVmaW5lZDtcbnR5cGUgSXRlbUFydEVudHJ5ID0gW3NoZWV0OiBzdHJpbmcsIGNlbGw6IG51bWJlcl07XG50eXBlIEl0ZW1BcnRTaGVldCA9IHtcbiAgICBsaW5lQ291bnQ6IG51bWJlcjtcbiAgICBzaXplOiBudW1iZXI7XG4gICAgc3BhY2U6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xufTtcbnR5cGUgTG90dGVyeUFydEVudHJ5ID0ge1xuICAgIHNoZWV0OiBzdHJpbmc7XG4gICAgY2VsbDogbnVtYmVyO1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgc2hhcGU6IFwiY29pblwiIHwgXCJjdWJlXCIgfCBcInRva2VuXCI7XG59O1xudHlwZSBJdGVtQXJ0TWFwID0ge1xuICAgIGl0ZW1zOiBSZWNvcmQ8c3RyaW5nLCBJdGVtQXJ0RW50cnk+O1xuICAgIGxvdHRlcmllczogUmVjb3JkPHN0cmluZywgTG90dGVyeUFydEVudHJ5PjtcbiAgICBzaGVldHM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRTaGVldD47XG59O1xubGV0IGl0ZW1BcnRNYXA6IEl0ZW1BcnRNYXAgPSB7IGl0ZW1zOiB7fSwgbG90dGVyaWVzOiB7fSwgc2hlZXRzOiB7fSB9O1xubGV0IG1hcEFydE1hcDogTWFwQXJ0Q2F0YWxvZyA9IHsgZmlsZXM6IHt9LCBieU5hbWU6IHt9IH07XG5sZXQgc3RhZ2VCb3NzQ2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZyA9IHsgYm9zc2VzOiB7fSwgZ3VhcmRpYW5zOiB7fSwgc3RhZ2VzOiB7fSB9O1xudHlwZSBCb3NzQXJ0Q2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBieUJvc3NJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHN0cmluZz4+O1xuICAgIHJlYWRvbmx5IGJ5UmVzSWQ/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PjtcbiAgICByZWFkb25seSBmaWxlcz86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHsgcmVhZG9ubHkgZmlsZTogc3RyaW5nIH0+Pjtcbn07XG5sZXQgYm9zc0FydENhdGFsb2c6IEJvc3NBcnRDYXRhbG9nID0ge307XG5cbmZ1bmN0aW9uIHByZXR0eU51bWJlcihuOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyKSB7XG4gICAgbGV0IHMgPSBuLnRvRml4ZWQoZGlnaXRzKTtcbiAgICB3aGlsZSAocy5lbmRzV2l0aChcIjBcIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICBpZiAocy5lbmRzV2l0aChcIi5cIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbn1cblxuZnVuY3Rpb24gcGFyc2VJdGVtRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPCAxMDAwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgSXRlbXMgZmlsZSBpcyBvbmx5ICR7ZGF0YS5sZW5ndGh9IGJ5dGVzIGxvbmdgKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCByZXN1bHRdIG9mIGRhdGEubWF0Y2hBbGwoL1xcPEl0ZW0gKC4qKVxcL1xcPi9nKSkge1xuICAgICAgICBjb25zdCBpdGVtOiBJdGVtID0gbmV3IEl0ZW07XG4gICAgICAgIGZvciAoY29uc3QgWywgYXR0cmlidXRlLCB2YWx1ZV0gb2YgcmVzdWx0Lm1hdGNoQWxsKC9cXHM/KFtePV0qKT1cIihbXlwiXSopXCIvZykpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkluZGV4XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaWQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJfTmFtZV9cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2tyID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJOYW1lX05cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJVc2VUeXBlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udXNlVHlwZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTWF4VXNlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4VXNlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiSGlkZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhpZGRlbiA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmVzaXN0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVzaXN0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyXCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJOSUtJXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIk5pa2lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVU5MVU5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFVDWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdWN5XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU0hVQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJTaHVhXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiREhBTlBJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJEaGFucGlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUE9DSElcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiUG9jaGlcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBTFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJBbFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHt2YWx1ZX1cImApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJQYXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJBR1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiQmFja3BhY2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJHTEFTU0VTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJGYWNlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFORFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNPQ0tTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJTb2Nrc1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkZPT1RcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNob2VzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQ0FQXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQQU5UU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiTG93ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJSQUNLRVRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlJhY2tldFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJPRFlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlVwcGVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFpclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRZRVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiRHllXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBwYXJ0ICR7dmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkxldmVsXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGV2ZWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHIgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVEFcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdGEgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZXggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJXSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS53aWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRIUFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhwID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkUXVpY2tcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5xdWlja3Nsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkQnVmZlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmJ1ZmZzbG90cyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNtYXNoU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zbWFzaCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1vdmVTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1vdmVtZW50ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2hhcmdlc2hvdFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmdlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTG9iU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sb2IgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc2VydmUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RSXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0ciA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdHIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1NUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9zdGEgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9ERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfZGV4ID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfV0lMXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3dpbCA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS53aWwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRW5jaGFudEVsZW1lbnRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmFibGVQYXJjZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJjZWxfZW5hYmxlZCA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQmFsbFNwaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zcGluID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQVRTU1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmF0c3MgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERlNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGZzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNvY2tldFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvY2tldCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJHYXVnZUJhdHRsZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdhdWdlX2JhdHRsZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGl0ZW0gYXR0cmlidXRlIFwiJHthdHRyaWJ1dGV9XCJgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpdGVtcy5zZXQoaXRlbS5pZCwgaXRlbSk7XG4gICAgfVxufVxuXG5jbGFzcyBBcGlJdGVtIHtcbiAgICBwcm9kdWN0SW5kZXggPSAwO1xuICAgIGRpc3BsYXkgPSAwO1xuICAgIGhpdERpc3BsYXkgPSBmYWxzZTtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgdXNlMCA9IDA7XG4gICAgdXNlMSA9IDA7XG4gICAgdXNlMiA9IDA7XG4gICAgcHJpY2VUeXBlID0gXCJHT0xEXCI7XG4gICAgb2xkUHJpY2UwID0gMDtcbiAgICBvbGRQcmljZTEgPSAwO1xuICAgIG9sZFByaWNlMiA9IDA7XG4gICAgcHJpY2UwID0gMDtcbiAgICBwcmljZTEgPSAwO1xuICAgIHByaWNlMiA9IDA7XG4gICAgY291cGxlUHJpY2UgPSAwO1xuICAgIGNhdGVnb3J5ID0gXCJcIjtcbiAgICBuYW1lID0gXCJcIjtcbiAgICBnb2xkQmFjayA9IDA7XG4gICAgZW5hYmxlUGFyY2VsID0gZmFsc2U7XG4gICAgZm9yUGxheWVyID0gMDtcbiAgICBpdGVtMCA9IDA7XG4gICAgaXRlbTEgPSAwO1xuICAgIGl0ZW0yID0gMDtcbiAgICBpdGVtMyA9IDA7XG4gICAgaXRlbTQgPSAwO1xuICAgIGl0ZW01ID0gMDtcbiAgICBpdGVtNiA9IDA7XG4gICAgaXRlbTcgPSAwO1xuICAgIGl0ZW04ID0gMDtcbiAgICBpdGVtOSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzQXBpSXRlbShvYmo6IGFueSk6IG9iaiBpcyBBcGlJdGVtIHtcbiAgICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlb2Ygb2JqLnByb2R1Y3RJbmRleCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5kaXNwbGF5ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmhpdERpc3BsYXkgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmVuYWJsZWQgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UxID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2VUeXBlID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNvdXBsZVByaWNlID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNhdGVnb3J5ID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZ29sZEJhY2sgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlUGFyY2VsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgdHlwZW9mIG9iai5mb3JQbGF5ZXIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTAgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTMgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTQgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTUgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTYgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTcgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTggPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTkgPT09IFwibnVtYmVyXCJcbiAgICBdLmV2ZXJ5KGIgPT4gYik7XG59XG5cbi8qKiBQcm9kdWN0IGluZGV4ZXMgdGhhdCByZWplY3Qgc2hvcCBidXlzIChTaG9wX0luaTMgTm9idXniiaAwKS4gTGl2ZSBBUEkgb21pdHMgdGhpcyBmaWVsZC4gKi9cbmxldCBzaG9wTm9idXlQcm9kdWN0SW5kZXhlczogUmVhZG9ubHlTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcblxuZnVuY3Rpb24gaXNTaG9wUHVyY2hhc2FibGUocHJvZHVjdEluZGV4OiBudW1iZXIsIGVuYWJsZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZW5hYmxlZCAmJiAhc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMuaGFzKHByb2R1Y3RJbmRleCk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXBpU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBhcGlJdGVtIG9mIEpTT04ucGFyc2UoZGF0YSkpIHtcbiAgICAgICAgaWYgKCFpc0FwaUl0ZW0oYXBpSXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEluY29ycmVjdCBmb3JtYXQgb2YgaXRlbTogJHtkYXRhfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IFtcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0xLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTMsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW00LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNSxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTYsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW03LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTksXG4gICAgICAgIF0uZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBjb25zdCBwdXJjaGFzYWJsZSA9IGlzU2hvcFB1cmNoYXNhYmxlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLmVuYWJsZWQpO1xuXG4gICAgICAgIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIlBBUlRTXCIpIHtcbiAgICAgICAgICAgIGlmIChpbm5lcl9pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaW5uZXJfaXRlbXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE9ubHkgcmVhbCBwdXJjaGFzZSBwYXRocyBjb3VudCBhcyBzaG9wIHNvdXJjZXMgKGV4Y2x1ZGUgTm9idXkgY2F0YWxvZyByb3dzKS5cbiAgICAgICAgICAgIGlmIChwdXJjaGFzYWJsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBuZXcgU2hvcEl0ZW1Tb3VyY2UoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0ucHJpY2UwLCBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsIGlubmVyX2l0ZW1zKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaW5uZXJfaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goaXRlbVNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFwaUl0ZW0uY2F0ZWdvcnkgPT09IFwiTE9UVEVSWVwiKSB7XG4gICAgICAgICAgICBnYWNoYXMuc2V0KFxuICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJvZHVjdEluZGV4LFxuICAgICAgICAgICAgICAgIG5ldyBHYWNoYShcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcm9kdWN0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcmljZTAsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIixcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5lbmFibGVkLFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzYWJsZSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAvLyBQcm9kdWN0IGluZGV4IGlzIHRoZSBzaG9wX2l0ZW1zIC8gZ2FjaGFzIGtleSDigJQgcmVxdWlyZWQgc28gcmV3YXJkIHRpbGVzXG4gICAgICAgICAgICAvLyBjYW4gcmVzb2x2ZSBjb2luIGFydCB3aXRoIGdhY2hhcy5nZXQoaXRlbS5pZCkgdGhlIHNhbWUgd2F5IHRoZSB0YWJsZSBkb2VzLlxuICAgICAgICAgICAgZ2FjaGFJdGVtLmlkID0gYXBpSXRlbS5wcm9kdWN0SW5kZXg7XG4gICAgICAgICAgICBnYWNoYUl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBnYWNoYUl0ZW0pO1xuICAgICAgICAgICAgaWYgKHB1cmNoYXNhYmxlKSB7XG4gICAgICAgICAgICAgICAgZ2FjaGFJdGVtLnNvdXJjZXMucHVzaChuZXcgU2hvcEl0ZW1Tb3VyY2UoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0ucHJpY2UwLCBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsIGlubmVyX2l0ZW1zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlckl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgb3RoZXJJdGVtLmlkID0gYXBpSXRlbS5wcm9kdWN0SW5kZXg7XG4gICAgICAgICAgICBvdGhlckl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBvdGhlckl0ZW0pO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR2FjaGFEYXRhKGRhdGE6IHN0cmluZywgZ2FjaGE6IEdhY2hhKSB7XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGRhdGEuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgaWYgKCFsaW5lLmluY2x1ZGVzKFwiPExvdHRlcnlJdGVtX1wiKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9cXHMqPExvdHRlcnlJdGVtXyg/PGNoYXJhY3Rlcj5bXiBdKikgSW5kZXg9XCJcXGQrXCIgX05hbWVfPVwiW15cIl0qXCIgU2hvcEluZGV4PVwiKD88c2hvcF9pZD5cXGQrKVwiIFF1YW50aXR5TWluPVwiKD88cXVhbnRpdHlfbWluPlxcZCspXCIgUXVhbnRpdHlNYXg9XCIoPzxxdWFudGl0eV9tYXg+XFxkKylcIiBDaGFuc1Blcj1cIig/PHByb2JhYmlsaXR5PlxcZCtcXC4/XFxkKilcXHMqXCIgRWZmZWN0PVwiXFxkK1wiIFByb2R1Y3RPcHQ9XCJcXGQrXCJcXC8+Lyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHBhcnNpbmcgZ2FjaGEgJHtnYWNoYS5nYWNoYV9pbmRleH06XFxuJHtsaW5lfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGFyYWN0ZXIgPSBtYXRjaC5ncm91cHMuY2hhcmFjdGVyO1xuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBcIkx1bmx1blwiKSB7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7Y2hhcmFjdGVyfVwiIGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5zaG9wX2lkKSk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHNob3AgaXRlbSBpZCAke21hdGNoLmdyb3Vwcy5zaG9wX2lkfSBpbiBsb3R0ZXJ5IGZpbGUgJHtnYWNoYS5nYWNoYV9pbmRleH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGdhY2hhLmFkZChpdGVtLCBwYXJzZUZsb2F0KG1hdGNoLmdyb3Vwcy5wcm9iYWJpbGl0eSksIGNoYXJhY3RlciwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21pbiksIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5xdWFudGl0eV9tYXgpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCBtYXBdIG9mIGdhY2hhLnNob3BfaXRlbXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaXRlbSxdIG9mIG1hcCkge1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2gobmV3IEdhY2hhSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR3VhcmRpYW5EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGd1YXJkaWFuRGF0YSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROdW1iZXIobzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YgbyA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYm9zc1RpbWVJbmZvID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hcEluZm8gb2YgZ3VhcmRpYW5EYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwSW5mbyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFwX25hbWUgPSBtYXBJbmZvLk5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwX25hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJld2FyZHMgPSBBcnJheS5pc0FycmF5KG1hcEluZm8uUmV3YXJkcykgPyBbLi4ubWFwSW5mby5SZXdhcmRzXSA6IFtdO1xuICAgICAgICBjb25zdCByZXdhcmRfaXRlbXMgPSByZXdhcmRzXG4gICAgICAgICAgICAuZmlsdGVyKChzaG9wX2lkKTogc2hvcF9pZCBpcyBudW1iZXIgPT4gdHlwZW9mIHNob3BfaWQgPT09IFwibnVtYmVyXCIgJiYgc2hvcF9pdGVtcy5oYXMoc2hvcF9pZCkpXG4gICAgICAgICAgICAubWFwKHNob3BfaWQgPT4gc2hvcF9pdGVtcy5nZXQoc2hvcF9pZCkhKTtcbiAgICAgICAgY29uc3QgRXhwTXVsdGlwbGllciA9IGdldE51bWJlcihtYXBJbmZvLkV4cE11bHRpcGxpZXIpIHx8IDA7XG4gICAgICAgIGNvbnN0IElzQm9zc1N0YWdlID0gISFtYXBJbmZvLklzQm9zc1N0YWdlO1xuICAgICAgICBjb25zdCBNYXBJRCA9IGdldE51bWJlcihtYXBJbmZvLk1hcElkKSB8fCAwO1xuICAgICAgICBsZXQgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGdldE51bWJlcihtYXBJbmZvLkJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpIHx8IC0xO1xuICAgICAgICBpZiAoQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9PT0gLTEpIHtcbiAgICAgICAgICAgIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPSBib3NzVGltZUluZm8uZ2V0KE1hcElEKSB8fCAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXBJRCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJvc3NUaW1lSW5mby5zZXQoTWFwSUQsIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXdhcmRfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShtYXBfbmFtZSwgcmV3YXJkX2l0ZW1zLCBFeHBNdWx0aXBsaWVyLCBJc0Jvc3NTdGFnZSwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChndWFyZGlhblNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB0eXBlIFByb2R1Y3RTdGFnZURyb3AgPSB7XG4gICAgcmVhZG9ubHkgbWFwOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbmVlZEJvc3M6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgeHA/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgYm9zc1RpbWU/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBQcm9kdWN0U3RhZ2VEcm9wc0NhdGFsb2cgPSB7XG4gICAgcmVhZG9ubHkgcHJvZHVjdHM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCByZWFkb25seSBQcm9kdWN0U3RhZ2VEcm9wW10+Pjtcbn07XG5cbi8qKlxuICogTWVyZ2UgU19SZWxhdGlvbnNoaXBzLWRlcml2ZWQgYm9zcy9tYXAgZHJvcHMgb250byBzaG9wIHByb2R1Y3RzLlxuICogRGVkdXBlcyBieSBndWFyZGlhbiBtYXAgbmFtZSBzbyBHdWFyZGlhblN0YWdlcyBSZXdhcmRzIHBhdGhzIGFyZSBub3QgZG91YmxlZC5cbiAqIFRoaXMgaXMgd2hhdCBtYWtlcyBOb2J1eSBjb2lucyBsaWtlIEJsdWUgQ2Fwc3VsZSBhbnN3ZXIgXCJ3aGVyZSBkbyBJIGdldCB0aGlzP1wiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQcm9kdWN0U3RhZ2VEcm9wcyhjYXRhbG9nOiBQcm9kdWN0U3RhZ2VEcm9wc0NhdGFsb2cpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9kdWN0cyA9IGNhdGFsb2cucHJvZHVjdHM7XG4gICAgaWYgKCFwcm9kdWN0cyB8fCB0eXBlb2YgcHJvZHVjdHMgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtwcm9kdWN0S2V5LCBkcm9wc10gb2YgT2JqZWN0LmVudHJpZXMocHJvZHVjdHMpKSB7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RJbmRleCA9IE51bWJlcihwcm9kdWN0S2V5KTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUocHJvZHVjdEluZGV4KSB8fCAhQXJyYXkuaXNBcnJheShkcm9wcykpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBzaG9wX2l0ZW1zLmdldChwcm9kdWN0SW5kZXgpO1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTWFwcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICBpdGVtLnNvdXJjZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChzb3VyY2UpOiBzb3VyY2UgaXMgR3VhcmRpYW5JdGVtU291cmNlID0+IHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSlcbiAgICAgICAgICAgICAgICAubWFwKChzb3VyY2UpID0+IHNvdXJjZS5ndWFyZGlhbl9tYXApLFxuICAgICAgICApO1xuICAgICAgICBmb3IgKGNvbnN0IGRyb3Agb2YgZHJvcHMpIHtcbiAgICAgICAgICAgIGlmICghZHJvcCB8fCB0eXBlb2YgZHJvcC5tYXAgIT09IFwic3RyaW5nXCIgfHwgZHJvcC5tYXAubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdNYXBzLmhhcyhkcm9wLm1hcCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4aXN0aW5nTWFwcy5hZGQoZHJvcC5tYXApO1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgZHJvcC5tYXAsXG4gICAgICAgICAgICAgICAgICAgIFtpdGVtXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGRyb3AueHAgPT09IFwibnVtYmVyXCIgPyBkcm9wLnhwIDogMCxcbiAgICAgICAgICAgICAgICAgICAgISFkcm9wLm5lZWRCb3NzLFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZHJvcC5ib3NzVGltZSA9PT0gXCJudW1iZXJcIiA/IGRyb3AuYm9zc1RpbWUgOiAtMSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqIFVzZXItZmFjaW5nIGxhYi1wcmVwIHBoYXNlcyDigJQgbmV2ZXIgZXhwb3NlIHJhdyBmaWxlbmFtZXMsIHBhdGhzLCBvciBYTUwgbmFtZXMuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZGluZ1BoYXNlRm9yVXJsKHVybDogc3RyaW5nKTogeyB0aXRsZTogc3RyaW5nOyBkZXRhaWw6IHN0cmluZyB9IHtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiSXRlbV9QYXJ0c1wiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiUHJlcGFyaW5nIGVxdWlwbWVudCBjYXRhbG9n4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiR2F0aGVyaW5nIGV2ZXJ5IHdlYXJhYmxlIGZvciBjb21wYXJpc29uLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiL2FwaS9zaG9wXCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJDaGVja2luZyB0aGUgbGl2ZSBzaG9w4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiUmVhZGluZyBHb2xkIGFuZCBBUCBsaXN0aW5ncy5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIkd1YXJkaWFuU3RhZ2VzXCIpIHx8IHVybC5pbmNsdWRlcyhcInByb2R1Y3Qtc3RhZ2UtZHJvcHNcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIk1hcHBpbmcgc3RhZ2UgcmV3YXJkc+KAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIkZpbmRpbmcgd2hlcmUgZ2VhciBhbmQgY29pbnMgZHJvcC5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIkluaTNfTG90XCIpIHx8IHVybC5pbmNsdWRlcyhcImxvdHRlcnlcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkxvYWRpbmcgZ2FjaGEgdGFibGVz4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiTWF0Y2hpbmcgY2Fwc3VsZXMgdG8gdGhlaXIgcHJpemVzLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiaXRlbS1hcnRcIikgfHwgdXJsLmluY2x1ZGVzKFwic2hvcC1ub2J1eVwiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiRmluaXNoaW5nIHRoZSBsYWLigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJTeW5jaW5nIGFydCBhbmQgc2FsZSBzdGF0dXMuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBcIk9wZW5pbmcgdGhlIGVxdWlwbWVudCBsYWLigKZcIixcbiAgICAgICAgZGV0YWlsOiBcIkFsbW9zdCByZWFkeSB0byBjb21wYXJlIGdlYXIuXCIsXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2V0TG9hZGluZ1BoYXNlKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcGhhc2UgPSBsb2FkaW5nUGhhc2VGb3JVcmwodXJsKTtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ1wiKTtcbiAgICBpZiAodGl0bGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IHBoYXNlLnRpdGxlO1xuICAgIH1cbiAgICBjb25zdCBkZXRhaWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2RldGFpbFwiKTtcbiAgICBpZiAoZGV0YWlsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgZGV0YWlsLnRleHRDb250ZW50ID0gcGhhc2UuZGV0YWlsO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBzZXRMb2FkaW5nUGhhc2UodXJsKTtcbiAgICBjb25zdCByZXBseSA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUrKztcbiAgICB9XG4gICAgaWYgKCFyZXBseS5vaykge1xuICAgICAgICAvLyBLZWVwIHRlY2huaWNhbCBVUkwgZGV0YWlsIGluIHRoZSB0aHJvd24gZXJyb3IgZm9yIGxvZ3M7IFVJIHVzZXMgaHVtYW4gY29weS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCBkb3dubG9hZGluZyAke3VybH06ICR7cmVwbHkuc3RhdHVzfSR7cmVwbHkuc3RhdHVzVGV4dCA/IGAgJHtyZXBseS5zdGF0dXNUZXh0fWAgOiBcIlwifWBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcGx5LnRleHQoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkSXRlbXMoKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSAxMjQ7XG4gICAgfVxuICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9hdXRoLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzXCI7XG4gICAgY29uc3QgZ2FjaGFTb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9nYW1lLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzL2xvdHRlcnlcIjtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L3NlcnZlci1jb3JlL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBpdGVtVVJMID0gaXRlbVNvdXJjZSArIFwiL0l0ZW1fUGFydHNfSW5pMy54bWxcIjtcbiAgICBjb25zdCBpdGVtRGF0YSA9IGRvd25sb2FkKGl0ZW1VUkwpO1xuICAgIC8vIENvbXBhY3QgTm9idXkgaW5kZXggKGZyb20gU2hvcF9JbmkzKSDigJQgbGl2ZSBzaG9wIEFQSSBvbWl0cyB0aGlzIGZpZWxkLlxuICAgIGNvbnN0IHNob3BOb2J1eURhdGEgPSBkb3dubG9hZChcIi9hc3NldHMvc2hvcC1ub2J1eS1pbmRleGVzLmpzb25cIik7XG4gICAgLy8gQm9zcy9tYXAgZHJvcHMgZnJvbSBTX1JlbGF0aW9uc2hpcHMgKGJleW9uZCBHdWFyZGlhblN0YWdlcyBSZXdhcmRzIGxpc3RzKS5cbiAgICBjb25zdCBwcm9kdWN0U3RhZ2VEcm9wc0RhdGEgPSBkb3dubG9hZChcIi9hc3NldHMvcHJvZHVjdC1zdGFnZS1kcm9wcy5qc29uXCIpO1xuICAgIGNvbnN0IGl0ZW1BcnREYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL2l0ZW0tYXJ0LW1hcC5qc29uXCIpO1xuICAgIGNvbnN0IG1hcEFydERhdGEgPSBkb3dubG9hZChcIi9hc3NldHMvbWFwLWFydC1tYXAuanNvblwiKTtcbiAgICBjb25zdCBzdGFnZUJvc3NEYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL3N0YWdlLWJvc3Nlcy5qc29uXCIpO1xuICAgIGNvbnN0IGJvc3NBcnREYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL2Jvc3MtYXJ0LW1hcC5qc29uXCIpO1xuICAgIGNvbnN0IG1heF9zaG9wX3BhZ2VzID0gMjA7IC8vY3VycmVudGx5IG5lZWQgb25seSAxMCwgc2hvdWxkIGJlIGVub3VnaFxuICAgIGNvbnN0IHNob3BVUkwgPSBcIi9hcGkvc2hvcD9zaXplPTEwMDAmcGFnZT1cIjtcbiAgICBjb25zdCBzaG9wRGF0YXMgPSBbLi4uQXJyYXkobWF4X3Nob3BfcGFnZXMpLmtleXMoKV0ubWFwKG4gPT4gZG93bmxvYWQoYCR7c2hvcFVSTH0ke259YCkpO1xuICAgIGNvbnN0IGd1YXJkaWFuVVJMID0gZ3VhcmRpYW5Tb3VyY2UgKyBcIi9HdWFyZGlhblN0YWdlcy5qc29uXCI7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gZG93bmxvYWQoZ3VhcmRpYW5VUkwpO1xuICAgIHBhcnNlSXRlbURhdGEoYXdhaXQgaXRlbURhdGEpO1xuICAgIGl0ZW1BcnRNYXAgPSBKU09OLnBhcnNlKGF3YWl0IGl0ZW1BcnREYXRhKSBhcyBJdGVtQXJ0TWFwO1xuICAgIHRyeSB7XG4gICAgICAgIG1hcEFydE1hcCA9IEpTT04ucGFyc2UoYXdhaXQgbWFwQXJ0RGF0YSkgYXMgTWFwQXJ0Q2F0YWxvZztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgbWFwIGFydCBjYXRhbG9nOiAke2V9YCk7XG4gICAgICAgIG1hcEFydE1hcCA9IHsgZmlsZXM6IHt9LCBieU5hbWU6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHN0YWdlQm9zc0NhdGFsb2cgPSBKU09OLnBhcnNlKGF3YWl0IHN0YWdlQm9zc0RhdGEpIGFzIFN0YWdlQm9zc0NhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIHN0YWdlIGJvc3MgY2F0YWxvZzogJHtlfWApO1xuICAgICAgICBzdGFnZUJvc3NDYXRhbG9nID0geyBib3NzZXM6IHt9LCBndWFyZGlhbnM6IHt9LCBzdGFnZXM6IHt9IH07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGJvc3NBcnRDYXRhbG9nID0gSlNPTi5wYXJzZShhd2FpdCBib3NzQXJ0RGF0YSkgYXMgQm9zc0FydENhdGFsb2c7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIGJvc3MgYXJ0IGNhdGFsb2c6ICR7ZX1gKTtcbiAgICAgICAgYm9zc0FydENhdGFsb2cgPSB7fTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgbm9idXlKc29uID0gSlNPTi5wYXJzZShhd2FpdCBzaG9wTm9idXlEYXRhKSBhcyB7XG4gICAgICAgICAgICBwcm9kdWN0SW5kZXhlcz86IHVua25vd247XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBBcnJheS5pc0FycmF5KG5vYnV5SnNvbi5wcm9kdWN0SW5kZXhlcylcbiAgICAgICAgICAgID8gbm9idXlKc29uLnByb2R1Y3RJbmRleGVzLmZpbHRlcigobik6IG4gaXMgbnVtYmVyID0+IHR5cGVvZiBuID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMgPSBuZXcgU2V0KGluZGV4ZXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBzaG9wIE5vYnV5IGluZGV4OiAke2V9YCk7XG4gICAgICAgIHNob3BOb2J1eVByb2R1Y3RJbmRleGVzID0gbmV3IFNldCgpO1xuICAgIH1cbiAgICBhd2FpdCBQcm9taXNlLmFsbChzaG9wRGF0YXMubWFwKHAgPT4gcC50aGVuKGRhdGEgPT4gcGFyc2VBcGlTaG9wRGF0YShkYXRhKSkpKTtcblxuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSBnYWNoYXMuc2l6ZSArIDQ7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhX2l0ZW1zOiBbUHJvbWlzZTxzdHJpbmc+LCBHYWNoYSwgc3RyaW5nXVtdID0gW107XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhX3VybCA9IGAke2dhY2hhU291cmNlfS9JbmkzX0xvdF8ke2Ake2dhY2hhLmdhY2hhX2luZGV4fWAucGFkU3RhcnQoMiwgXCIwXCIpfS54bWxgO1xuICAgICAgICBnYWNoYV9pdGVtcy5wdXNoKFtkb3dubG9hZChnYWNoYV91cmwpLCBnYWNoYSwgZ2FjaGFfdXJsXSk7XG4gICAgfVxuICAgIHBhcnNlR3VhcmRpYW5EYXRhKGF3YWl0IGd1YXJkaWFuRGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbHlQcm9kdWN0U3RhZ2VEcm9wcyhKU09OLnBhcnNlKGF3YWl0IHByb2R1Y3RTdGFnZURyb3BzRGF0YSkgYXMgUHJvZHVjdFN0YWdlRHJvcHNDYXRhbG9nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGxvYWRpbmcgcHJvZHVjdCBzdGFnZSBkcm9wczogJHtlfWApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtpdGVtLCBnYWNoYSwgZ2FjaGFfdXJsXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VHYWNoYURhdGEoYXdhaXQgaXRlbSwgZ2FjaGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBkb3dubG9hZGluZyAke2dhY2hhX3VybH0gYmVjYXVzZSAke2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKiBCYW4vY2lyY2xlLXNsYXNoIGljb24gZm9yIGV4Y2x1ZGUg4oCUIG91dGxpbmUgU1ZHLCByZWNvbG9yZWQgdmlhIGN1cnJlbnRDb2xvci4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV4Y2x1ZGVJY29uKCk6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiaXRlbV9yZW1vdmFsX19pY29uXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIFwiMCAwIDI0IDI0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIjE2XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCIxNlwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJmb2N1c2FibGVcIiwgXCJmYWxzZVwiKTtcblxuICAgIGNvbnN0IGNpcmNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJjaXJjbGVcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN4XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImN5XCIsIFwiMTJcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInJcIiwgXCI5XCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyXCIpO1xuXG4gICAgY29uc3Qgc2xhc2ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwibGluZVwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ4MVwiLCBcIjdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTFcIiwgXCI3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcIngyXCIsIFwiMTdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieTJcIiwgXCIxN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMlwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWNhcFwiLCBcInJvdW5kXCIpO1xuXG4gICAgc3ZnLmFwcGVuZChjaXJjbGUsIHNsYXNoKTtcbiAgICByZXR1cm4gc3ZnO1xufVxuXG5mdW5jdGlvbiBkZWxldGFibGVJdGVtKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGV4Y2x1ZGVMYWJlbCA9IGBFeGNsdWRlICR7aXRlbS5uYW1lX2VufSBmcm9tIHJlc3VsdHNgO1xuICAgIGNvbnN0IGV4Y2x1ZGVCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsXCIsXG4gICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpdGVtLmlkfWAsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogZXhjbHVkZUxhYmVsLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIHRpdGxlOiBleGNsdWRlTGFiZWwsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgZXhjbHVkZUJ1dHRvbi5hcHBlbmQoY3JlYXRlRXhjbHVkZUljb24oKSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1pZGVudGl0eVwiIH0sXG4gICAgICAgIGV4Y2x1ZGVCdXR0b24sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlfX21ldGFcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW0sIGNoYXJhY3RlciksXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbSksXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCkge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZGlhbG9nLW9wZW5cIik7XG59XG5cbmZ1bmN0aW9uIHVubG9ja0JhY2tncm91bmRTY3JvbGwoKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkaWFsb2ctb3BlblwiKTtcbn1cblxuZnVuY3Rpb24gc2hvd0RpYWxvZyhcbiAgICB0cmlnZ2VyOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgdG9wRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BfZGl2XCIpO1xuICAgIGlmICghKHRvcERpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXMgPSBkaWFsb2c7XG4gICAgICAgIHByZXZpb3VzLmNsb3NlKCk7XG4gICAgICAgIHByZXZpb3VzLnJlbW92ZSgpO1xuICAgIH1cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogZGlhbG9nQ2xhc3MgPyBgJHtkaWFsb2dDbGFzc31fX2Nsb3NlYCA6IFwiZGlhbG9nX19jbG9zZVwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJDbG9zZVwiLFxuICAgIF0pO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7XG4gICAgICAgIC4uLihkaWFsb2dDbGFzcyA/IHsgY2xhc3M6IGRpYWxvZ0NsYXNzIH0gOiB7fSksXG4gICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICB9O1xuICAgIGRpYWxvZyA9IEFycmF5LmlzQXJyYXkoY29udGVudClcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCBhdHRyaWJ1dGVzLCAuLi5jb250ZW50LCBjbG9zZUJ1dHRvbl0pXG4gICAgICAgIDogY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgY29udGVudCwgY2xvc2VCdXR0b25dKTtcbiAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJ0cnVlXCIpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBkaWFsb2c/LmNsb3NlKCkpO1xuICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICB0cmlnZ2VyLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgZGlhbG9nPy5yZW1vdmUoKTtcbiAgICAgICAgZGlhbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICB1bmxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgdG9wRGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIGxvY2tCYWNrZ3JvdW5kU2Nyb2xsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcInBvcHVwX2xpbmtcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBcImFyaWEtaGFzcG9wdXBcIjogXCJkaWFsb2dcIixcbiAgICAgICAgICAgIFwiYXJpYS1leHBhbmRlZFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHRleHQsXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coYnV0dG9uLCBgJHt0ZXh0fSBkZXRhaWxzYCwgY29udGVudCwgZGlhbG9nQ2xhc3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdDogc3RyaW5nKTogSFRNTFRhYmxlQ2VsbEVsZW1lbnQge1xuICAgIGNvbnN0IHsgc2hvcnQsIGZ1bGwsIGFiYnJldmlhdGVkIH0gPSBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5KHN0YXQpO1xuICAgIGlmICghYWJicmV2aWF0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1widGhcIiwgeyBjbGFzczogXCJudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIHNob3J0XSk7XG4gICAgfVxuICAgIGNvbnN0IHBvcHVwID0gY3JlYXRlUG9wdXBMaW5rKHNob3J0LCBjcmVhdGVIVE1MKFtcInBcIiwgZnVsbF0pKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBmdWxsKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGZ1bGwpO1xuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoXCJwcmlvcml0eS1zdGF0LWhlYWRlclwiKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0aFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgcG9wdXBdKTtcbn1cblxuZnVuY3Rpb24gcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gMSAmJiBxdWFudGl0eV9tYXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChxdWFudGl0eV9taW4gPT09IHF1YW50aXR5X21heCkge1xuICAgICAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWF4fWA7XG4gICAgfVxuICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9taW59LSR7cXVhbnRpdHlfbWF4fWA7XG59XG5cbi8qKlxuICogR2FjaGEgZHJvcC1kZXRhaWxzIHRhYmxlOiBJdGVtIHwgQ2hhbmNlIHwgRXhwZWN0ZWQgcHVsbHMuXG4gKiBDaGFyYWN0ZXIgaXMgbmV2ZXIgYSBjb2x1bW4g4oCUIGVxdWlwbWVudCBwb29scyBtaXJyb3IgYWNyb3NzIGNoYXJhY3RlcnMsIHNvIGxpc3RpbmdcbiAqIE5pa2kvTHVuTHVuL+KApiBkdXBsaWNhdGVzIHRoZSBzYW1lIHJvd3MuIFdoZW4gbm8gY2hhcmFjdGVyIGZpbHRlciBpcyBzZXQsIHNhbWUtbmFtZVxuICogcm93cyAod2l0aCB0aGUgc2FtZSBxdWFudGl0eSByYW5nZSkgY29sbGFwc2UgdG8gb25lIGVudHJ5IHVzaW5nIHRoZSBmaXJzdCBwb29sIHJhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShcbiAgICBnYWNoYTogR2FjaGEsXG4gICAgaGlnaGxpZ2h0ZWRJdGVtPzogSXRlbSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pO1xuXG4gICAgdHlwZSBSb3cgPSB7XG4gICAgICAgIGl0ZW06IEl0ZW07XG4gICAgICAgIHByb2JhYmlsaXR5OiBudW1iZXI7XG4gICAgICAgIHF1YW50aXR5X21pbjogbnVtYmVyO1xuICAgICAgICBxdWFudGl0eV9tYXg6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgLy8gQ2hhcmFjdGVyIGZpbHRlcjogYWNjdW11bGF0ZSBieSBJdGVtIGlkZW50aXR5IChoaXN0b3JpY2FsIG1hdGgpLlxuICAgIC8vIFVuZmlsdGVyZWQ6IGNvbGxhcHNlIGJ5IGRpc3BsYXkgbmFtZSArIHF1YW50aXR5IHNvIHBlci1jaGFyYWN0ZXIgY2xvbmVzIGFyZSBvbmUgcm93LlxuICAgIGNvbnN0IGJ5SXRlbSA9IGNoYXJhY3RlciA/IG5ldyBNYXA8SXRlbSwgUm93PigpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGJ5TmFtZSA9IGNoYXJhY3RlciA/IHVuZGVmaW5lZCA6IG5ldyBNYXA8c3RyaW5nLCBSb3c+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgLy8gQ2hhcmFjdGVyLWZpbHRlcmVkOiBrZWVwIGhpc3RvcmljYWwgZGVub21pbmF0b3IgKGl0ZW0gY2hhcmFjdGVyLCBlbHNlIGZpbHRlciwgZWxzZSB0b3RhbCkuXG4gICAgICAgICAgICAvLyBVbmZpbHRlcmVkIGNvbGxhcHNlOiByYXRlcyBhcmUgd2l0aGluIGVhY2ggY2hhcmFjdGVyJ3MgcG9vbCAocG9vbHMgbWlycm9yOyBmaXJzdCByb3cgd2lucykuXG4gICAgICAgICAgICAvLyBVc2luZyB0b3RhbF9wcm9iYWJpbGl0eSBmb3Igc2hhcmVkIGl0ZW1zIHdvdWxkIGRpbHV0ZSB+N8OXIGFuZCByZWludHJvZHVjZSB3cm9uZyByYXRlcy5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBnYWNoYS5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXIpIVxuICAgICAgICAgICAgICAgIDogKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1fY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoaXRlbV9jaGFyYWN0ZXIpIVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBnYWNoYS50b3RhbF9wcm9iYWJpbGl0eTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSB0aWNrZXRzIC8gaXRlbV90aWNrZXRzO1xuXG4gICAgICAgICAgICBpZiAoYnlJdGVtKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBieUl0ZW0uZ2V0KGNoYXJfZ2FjaGFfaXRlbSk7XG4gICAgICAgICAgICAgICAgYnlJdGVtLnNldChjaGFyX2dhY2hhX2l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hhcl9nYWNoYV9pdGVtLFxuICAgICAgICAgICAgICAgICAgICBwcm9iYWJpbGl0eTogKHByZXZpb3VzPy5wcm9iYWJpbGl0eSA/PyAwKSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhcl9nYWNoYV9pdGVtLm5hbWVfZW59XFwwJHtxdWFudGl0eV9taW59XFwwJHtxdWFudGl0eV9tYXh9YDtcbiAgICAgICAgICAgIGlmICghYnlOYW1lIS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIGJ5TmFtZSEuc2V0KGtleSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGFyX2dhY2hhX2l0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJvd3MgPSBieUl0ZW0gPyBbLi4uYnlJdGVtLnZhbHVlcygpXSA6IFsuLi5ieU5hbWUhLnZhbHVlcygpXTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWRJdGVtICE9PSB1bmRlZmluZWQgJiYgKFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRJdGVtID09PSByb3cuaXRlbVxuICAgICAgICAgICAgfHwgKFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgJiYgaGlnaGxpZ2h0ZWRJdGVtLm5hbWVfZW4gPT09IHJvdy5pdGVtLm5hbWVfZW5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgW1widGRcIiwgcm93Lml0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocm93LnF1YW50aXR5X21pbiwgcm93LnF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHJvdy5wcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyByb3cucHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbTogSXRlbSB8IHVuZGVmaW5lZCwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLFxuICAgICAgICBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShnYWNoYSwgaXRlbSwgY2hhcmFjdGVyKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBTaG9wSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnRUYWJsZSA9IGNyZWF0ZUhUTUwoW1widGFibGVcIiwgW1widHJcIiwgW1widGhcIiwgXCJDb250ZW50c1wiXV1dKTtcbiAgICBmb3IgKGNvbnN0IGlubmVyX2l0ZW0gb2YgaXRlbVNvdXJjZS5pdGVtcykge1xuICAgICAgICBjb250ZW50VGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiLCBpbm5lcl9pdGVtID09PSBpdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLCBbXCJ0ZFwiLCBpbm5lcl9pdGVtLm5hbWVfZW5dXSkpO1xuICAgIH1cbiAgICAvLyBEaWFsb2cgYXJpYS1sYWJlbCBhbHJlYWR5IGNhcnJpZXMgdGhlIHNldCBuYW1lIOKAlCBvbmx5IHNob3cgdGhlIGNvbnRlbnRzIHRhYmxlLlxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIGNvbnRlbnRUYWJsZSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVCb3NzQXJ0RmlsZShib3NzSWQ6IG51bWJlciwgcmVzSWQ/OiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGJ5SWQgPSBib3NzQXJ0Q2F0YWxvZy5ieUJvc3NJZD8uW2Ake2Jvc3NJZH1gXTtcbiAgICBpZiAoYnlJZCkge1xuICAgICAgICByZXR1cm4gYnlJZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXNJZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gYm9zc0FydENhdGFsb2cuYnlSZXNJZD8uW2Ake3Jlc0lkfWBdO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCb3NzUG9ydHJhaXQocHJvamVjdGlvbjogU3RhZ2VCb3NzUHJvamVjdGlvbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcHJvamVjdGlvbi5ib3NzZXNbMF07XG4gICAgY29uc3QgYm9zc05hbWUgPSBwcmltYXJ5Py5uYW1lID8/IChwcm9qZWN0aW9uLmlzQm9zc1N0YWdlID8gXCJCb3NzXCIgOiBcIkd1YXJkaWFuXCIpO1xuICAgIGNvbnN0IGZpbGUgPSBwcmltYXJ5XG4gICAgICAgID8gcmVzb2x2ZUJvc3NBcnRGaWxlKHByaW1hcnkuaWQsIHByaW1hcnkucmVzSWQpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3BvcnRyYWl0XCIsIFwiZGF0YS1oYXMtYm9zcy1hcnRcIjogXCJ0cnVlXCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImltZ1wiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcG9ydHJhaXQtaW1hZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBgL2Fzc2V0cy9ib3NzLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChmaWxlKX1gLFxuICAgICAgICAgICAgICAgICAgICBhbHQ6IGBCb3NzIGFydHdvcmsgZm9yICR7Ym9zc05hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMTI4XCIsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIxMjhcIixcbiAgICAgICAgICAgICAgICAgICAgZGVjb2Rpbmc6IFwiYXN5bmNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcG9ydHJhaXQgc3RhZ2UtZGV0YWlsc19fcG9ydHJhaXQtLWZhbGxiYWNrXCIsXG4gICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBCb3NzIGFydHdvcmsgdW5hdmFpbGFibGUgZm9yICR7Ym9zc05hbWV9YCxcbiAgICAgICAgICAgIFwiZGF0YS1oYXMtYm9zcy1hcnRcIjogXCJmYWxzZVwiLFxuICAgICAgICB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBib3NzTmFtZS5zbGljZSgwLCAxKS50b1VwcGVyQ2FzZSgpXSxcbiAgICBdKTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIHRoZSBHYWNoYSBiZWhpbmQgYSBzaG9wIHByb2R1Y3QgSXRlbSAoc3RhZ2UgcmV3YXJkcyBhcmUgc2hvcF9pdGVtcyBlbnRyaWVzKS5cbiAqIExvdHRlcnkgaXRlbXMgdXNlZCB0byBsZWF2ZSBpdGVtLmlkIGF0IDAg4oCUIHN0aWxsIHN1cHBvcnQgcmV2ZXJzZSBsb29rdXAgZm9yIHRob3NlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZEdhY2hhRm9yU2hvcEl0ZW0oaXRlbTogSXRlbSk6IEdhY2hhIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoaXRlbS5pZCAhPT0gMCkge1xuICAgICAgICBjb25zdCBieUlkID0gZ2FjaGFzLmdldChpdGVtLmlkKTtcbiAgICAgICAgaWYgKGJ5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiBieUlkO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgW3Nob3BJbmRleCwgZ2FjaGFdIG9mIGdhY2hhcykge1xuICAgICAgICBpZiAoc2hvcF9pdGVtcy5nZXQoc2hvcEluZGV4KSA9PT0gaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGdhY2hhO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgZ2FjaGEgb2YgZ2FjaGFzLnZhbHVlcygpKSB7XG4gICAgICAgIGlmIChnYWNoYS5uYW1lID09PSBpdGVtLm5hbWVfZW4pIHtcbiAgICAgICAgICAgIHJldHVybiBnYWNoYTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJld2FyZCB0aWxlIGFydDogZ2FjaGEgY29pbnMgdXNlIHRoZSBzYW1lIGxvdHRlcnkgc3ByaXRlIGFzIHRoZSByZXN1bHRzIHRhYmxlXG4gKiAoYGNyZWF0ZUdhY2hhQ29pbkFydGApLiBFcXVpcG1lbnQgdXNlcyBJdGVtX1BhcnRzIHNoZWV0IGNlbGxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhZ2VSZXdhcmRBcnQoaXRlbTogSXRlbSkge1xuICAgIGNvbnN0IGdhY2hhID0gZmluZEdhY2hhRm9yU2hvcEl0ZW0oaXRlbSk7XG4gICAgaWYgKGdhY2hhKSB7XG4gICAgICAgIC8vIFNhbWUgcGF0aCBhcyBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkgLyBnYWNoYSB0YWJsZSBjb2x1bW4uXG4gICAgICAgIGNvbnN0IGNvaW4gPSBjcmVhdGVHYWNoYUNvaW5BcnQoZ2FjaGEpO1xuICAgICAgICAvLyBLZWVwIHJld2FyZC1yb3cgc2l6aW5nIGhvb2tzIHdpdGhvdXQgbG9zaW5nIHRoZSBjaXJjdWxhciBjb2luIGxvb2suXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSB0eXBlb2YgY29pbi5jbGFzc05hbWUgPT09IFwic3RyaW5nXCIgPyBjb2luLmNsYXNzTmFtZSA6IFwiXCI7XG4gICAgICAgIGlmICghY2xhc3Nlcy5zcGxpdCgvXFxzKy8pLmluY2x1ZGVzKFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkLWFydFwiKSkge1xuICAgICAgICAgICAgY29pbi5jbGFzc05hbWUgPSBgJHtjbGFzc2VzfSBzdGFnZS1kZXRhaWxzX19yZXdhcmQtYXJ0IHN0YWdlLWRldGFpbHNfX3Jld2FyZC1hcnQtLWNvaW5gLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29pbjtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUl0ZW1BcnQoaXRlbSwgNDAsIFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkLWFydFwiKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RhZ2VCb3NzTGlzdChwcm9qZWN0aW9uOiBTdGFnZUJvc3NQcm9qZWN0aW9uKSB7XG4gICAgaWYgKHByb2plY3Rpb24uYm9zc05hbWVzLmxlbmd0aCA9PT0gMCAmJiBwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBib3NzSXRlbXMgPSBwcm9qZWN0aW9uLmJvc3Nlcy5tYXAoKGJvc3MpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHJlc29sdmVCb3NzQXJ0RmlsZShib3NzLmlkLCBib3NzLnJlc0lkKTtcbiAgICAgICAgY29uc3QgdGh1bWIgPSBmaWxlXG4gICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwiaW1nXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLXRodW1iXCIsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogYC9hc3NldHMvYm9zcy1hcnQvJHtlbmNvZGVVUklDb21wb25lbnQoZmlsZSl9YCxcbiAgICAgICAgICAgICAgICAgICAgYWx0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCI0MFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiNDBcIixcbiAgICAgICAgICAgICAgICAgICAgZGVjb2Rpbmc6IFwiYXN5bmNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLXRodW1iIHN0YWdlLWRldGFpbHNfX2Jvc3MtdGh1bWItLWZhbGxiYWNrXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSxcbiAgICAgICAgICAgICAgICBib3NzLm5hbWUuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLWl0ZW0gc3RhZ2UtZGV0YWlsc19fYm9zcy1pdGVtLS1wcmltYXJ5XCIgfSxcbiAgICAgICAgICAgIHRodW1iLFxuICAgICAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2Jvc3Mtcm9sZVwiIH0sIFwiQm9zc1wiXSxcbiAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzLW5hbWVcIiB9LCBib3NzLm5hbWVdLFxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICAvLyBHdWFyZGlhbnNMZWZ0L1JpZ2h0L01pZGRsZSBhcmUgYSBzcGF3biAqcG9vbCog4oCUIG9uZSBsZWZ0ICsgb25lIHJpZ2h0IGF0IGZpZ2h0IHRpbWUuXG4gICAgY29uc3Qgc2lkZU5vdGUgPSBwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmxlbmd0aCA+IDBcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NpZGUtcG9vbFwiIH0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2wtbGFiZWxcIiB9LFxuICAgICAgICAgICAgICAgIGBTaWRlIGNvbXBhbmlvbnMgKHBvb2wgb2YgJHtwcm9qZWN0aW9uLnNpZGVHdWFyZGlhbk5hbWVzLmxlbmd0aH0pYCxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19zaWRlLXBvb2wtbmFtZXNcIiB9LFxuICAgICAgICAgICAgICAgIHByb2plY3Rpb24uc2lkZUd1YXJkaWFuTmFtZXMuam9pbihcIiDCtyBcIiksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fc2lkZS1wb29sLWhpbnRcIiB9LFxuICAgICAgICAgICAgICAgIFwiT25lIGxlZnQgYW5kIG9uZSByaWdodCBzcGF3biB3aXRoIHRoZSBib3NzOyB0aGUgcmVzdCBhcmUgcG9zc2libGUgZHJhd3MuXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBzZWN0aW9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJzdGFnZS1kZXRhaWxzLWJvc3Nlc1wiIH0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiaDNcIixcbiAgICAgICAgICAgIHsgaWQ6IFwic3RhZ2UtZGV0YWlscy1ib3NzZXNcIiB9LFxuICAgICAgICAgICAgcHJvamVjdGlvbi5ib3NzTmFtZXMubGVuZ3RoID4gMSA/IFwiQm9zc2VzXCIgOiBcIkJvc3NcIixcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19ib3NzZXNcIiB9LFxuICAgICAgICAgICAgLi4uYm9zc0l0ZW1zLFxuICAgICAgICBdLFxuICAgIF0pO1xuICAgIGlmIChzaWRlTm90ZSkge1xuICAgICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKHNpZGVOb3RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb247XG59XG5cbi8qKlxuICogU3RhZ2UgZG9zc2llciBmb3IgR3VhcmRpYW4gLyBCb3NzIG1hcCBjaGlwczogYm9zcyBwb3J0cmFpdCwgSkZUU0UgYm9zcyBuYW1lcyxcbiAqIHJlYWRhYmxlIGZhY3RzLCBhbmQgcmV3YXJkIGxpc3Qgd2l0aCB0aGUgc2FtZSBhcnQgYXMgdGhlIHJlc3VsdHMgdGFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZURldGFpbHNDb250ZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGlzQm9zcyA9IGl0ZW1Tb3VyY2UubmVlZF9ib3NzO1xuICAgIGNvbnN0IHRpdGxlID0gc3RhZ2VUaXRsZU5hbWUoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXApO1xuICAgIGNvbnN0IGV5ZWJyb3cgPSBpc0Jvc3MgPyBcIkJvc3Mgc3RhZ2VcIiA6IFwiR3VhcmRpYW4gc3RhZ2VcIjtcbiAgICBjb25zdCBib3NzUHJvamVjdGlvbiA9IHByb2plY3RTdGFnZUJvc3NlcyhcbiAgICAgICAgaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsXG4gICAgICAgIGlzQm9zcyxcbiAgICAgICAgc3RhZ2VCb3NzQ2F0YWxvZyxcbiAgICApO1xuICAgIGNvbnN0IHJld2FyZHMgPSBpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA+IDBcbiAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkc1wiIH0sXG4gICAgICAgICAgICAuLi5pdGVtU291cmNlLml0ZW1zLm1hcCgocmV3YXJkKSA9PiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogcmV3YXJkID09PSBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkIHN0YWdlLWRldGFpbHNfX3Jld2FyZC0tY3VycmVudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwic3RhZ2UtZGV0YWlsc19fcmV3YXJkXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVTdGFnZVJld2FyZEFydChyZXdhcmQpLFxuICAgICAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19yZXdhcmQtbmFtZVwiIH0sIHJld2FyZC5uYW1lX2VuXSxcbiAgICAgICAgICAgICAgICAuLi4ocmV3YXJkID09PSBpdGVtXG4gICAgICAgICAgICAgICAgICAgID8gW2NyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3Jld2FyZC1iYWRnZVwiIH0sIFwiVGhpcyBpdGVtXCJdKV1cbiAgICAgICAgICAgICAgICAgICAgOiBbXSksXG4gICAgICAgICAgICBdKSksXG4gICAgICAgIF0pXG4gICAgICAgIDogY3JlYXRlSFRNTChbXCJwXCIsIHsgY2xhc3M6IFwic3RhZ2UtZGV0YWlsc19fZW1wdHlcIiB9LCBcIk5vIGxpc3RlZCByZXdhcmRzIGZvciB0aGlzIHN0YWdlLlwiXSk7XG5cbiAgICBjb25zdCBib3NzU2VjdGlvbiA9IGNyZWF0ZVN0YWdlQm9zc0xpc3QoYm9zc1Byb2plY3Rpb24pO1xuXG4gICAgY29uc3QgaWRlbnRpdHkgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19pZGVudGl0eVwiIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJzdGFnZS1kZXRhaWxzX19leWVicm93XCIgfSwgZXllYnJvd10sXG4gICAgICAgIFtcImgyXCIsIHRpdGxlXSxcbiAgICBdKTtcblxuICAgIGNvbnN0IGhlYWRlciA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImhlYWRlclwiLFxuICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX2hlYWRlclwiIH0sXG4gICAgICAgIGNyZWF0ZUJvc3NQb3J0cmFpdChib3NzUHJvamVjdGlvbiksXG4gICAgICAgIGlkZW50aXR5LFxuICAgIF0pO1xuXG4gICAgY29uc3QgYXJ0aWNsZSA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImFydGljbGVcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGlzQm9zc1xuICAgICAgICAgICAgICAgID8gXCJzdGFnZS1kZXRhaWxzIHN0YWdlLWRldGFpbHMtLWJvc3NcIlxuICAgICAgICAgICAgICAgIDogXCJzdGFnZS1kZXRhaWxzIHN0YWdlLWRldGFpbHMtLWd1YXJkaWFuXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcixcbiAgICBdKTtcbiAgICBpZiAoYm9zc1NlY3Rpb24pIHtcbiAgICAgICAgYXJ0aWNsZS5hcHBlbmRDaGlsZChib3NzU2VjdGlvbik7XG4gICAgfVxuICAgIGFydGljbGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICB7IGNsYXNzOiBcInN0YWdlLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJzdGFnZS1kZXRhaWxzLXJld2FyZHNcIiB9LFxuICAgICAgICBbXCJoM1wiLCB7IGlkOiBcInN0YWdlLWRldGFpbHMtcmV3YXJkc1wiIH0sIFwiUmV3YXJkc1wiXSxcbiAgICAgICAgcmV3YXJkcyxcbiAgICBdKSk7XG4gICAgcmV0dXJuIGFydGljbGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgY29uc3QgbWFwTGFiZWwgPSBzdGFnZUNoYW5uZWxMYWJlbChpdGVtU291cmNlLmd1YXJkaWFuX21hcCwgaXRlbVNvdXJjZS5uZWVkX2Jvc3MpO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIG1hcExhYmVsLFxuICAgICAgICBjcmVhdGVTdGFnZURldGFpbHNDb250ZW50KGl0ZW0sIGl0ZW1Tb3VyY2UpLFxuICAgICAgICBcInN0YWdlLWRldGFpbHMtZGlhbG9nXCIsXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShcbiAgICBpdGVtOiBJdGVtLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgcmV0dXJuIFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgIC5maWx0ZXIoc291cmNlRmlsdGVyKVxuICAgICAgICAubWFwKGl0ZW1Tb3VyY2UgPT4gc291cmNlSXRlbUVsZW1lbnQoaXRlbSwgaXRlbVNvdXJjZSwgY2hhcmFjdGVyKSk7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRDbGFzc1Rva2VucyhlbGVtZW50OiBIVE1MRWxlbWVudCk6IHN0cmluZ1tdIHtcbiAgICAvLyBQcmVmZXIgY2xhc3NOYW1lIG92ZXIgY2xhc3NMaXN0IOKAlCB0aGUgdW5pdCBET00gaGFybmVzcyBzZXRzIGNsYXNzTmFtZSB2aWFcbiAgICAvLyBzZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSBhbmQgZG9lcyBub3QgaW1wbGVtZW50IGEgZnVsbCBjbGFzc0xpc3QuXG4gICAgY29uc3QgcmF3ID0gdHlwZW9mIGVsZW1lbnQuY2xhc3NOYW1lID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gZWxlbWVudC5jbGFzc05hbWVcbiAgICAgICAgOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCI7XG4gICAgcmV0dXJuIHJhdy5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKTtcbn1cblxuZnVuY3Rpb24gaXNHYWNoYVNvdXJjZUdyb3VwKGVsZW1lbnRzOiByZWFkb25seSAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudHMuc29tZShcbiAgICAgICAgKGVsZW1lbnQpID0+XG4gICAgICAgICAgICB0eXBlb2YgZWxlbWVudCAhPT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgJiYgZWxlbWVudENsYXNzVG9rZW5zKGVsZW1lbnQpLmluY2x1ZGVzKFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIiksXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gbWFrZVNvdXJjZXNMaXN0KGxpc3Q6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXVtdKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBjb25zdCByZXN1bHQ6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSA9IFtdO1xuICAgIGZ1bmN0aW9uIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdICsgZWxlbWVudDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgbGV0IHByZXZpb3VzR3JvdXA6IHJlYWRvbmx5IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB8IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnRzIG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWRkKFwiIFwiKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbW1hIGJldHdlZW4gc2hvcC9zZXQvZ3VhcmRpYW4gcGF0aHMgc28gZHVhbCBwcmljZXMgc3RheSBsZWdpYmxlXG4gICAgICAgIC8vIChcIjUwMDAwIEdvbGQsIFN1cHBvcnRlciBTZXQgMzUwMDAwIEdvbGRcIikuIE5ldmVyIG5leHQgdG8gZ2FjaGEgY29pbiBjYXJkcyDigJRcbiAgICAgICAgLy8gdGhvc2UgYXJlIGJsb2NrIHN1bW1hcmllcyBhbmQgYSB0ZXh0IGNvbW1hIGJlY29tZXMgYSB2aXN1YWwgYnJlYWsuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHByZXZpb3VzR3JvdXAgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgJiYgIWlzR2FjaGFTb3VyY2VHcm91cChwcmV2aW91c0dyb3VwKVxuICAgICAgICAgICAgJiYgIWlzR2FjaGFTb3VyY2VHcm91cChlbGVtZW50cylcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBhZGQoXCIsIFwiKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91c0dyb3VwID0gZWxlbWVudHM7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW1Tb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSk6IGJvb2xlYW4ge1xuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgfHwgaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgICAgIGlmIChnYWNoYT8uZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UgIT09IGl0ZW1Tb3VyY2UgJiYgaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbUN1cnJlbnRseUF2YWlsYWJsZShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChpc0F2YWlsYWJsZUl0ZW1Tb3VyY2Uoc291cmNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbTogSXRlbSkge1xuICAgIGlmIChpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tYXZhaWxhYmlsaXR5IGl0ZW0tYXZhaWxhYmlsaXR5LS11bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm8gZW5hYmxlZCBzaG9wLCBnYWNoYSwgb3IgR3VhcmRpYW4gcGF0aCBpbiB0aGUgbGl2ZSBzaG9wIGRhdGFcIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJOb3QgaW4gZ2FtZVwiLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0R2FjaGFTb3VyY2VJbnB1dHMoY29pbjogSXRlbSB8IHVuZGVmaW5lZCk6IEdhY2hhU291cmNlSW5wdXRbXSB7XG4gICAgaWYgKCFjb2luKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRzOiBHYWNoYVNvdXJjZUlucHV0W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBjb2luLnNvdXJjZXMpIHtcbiAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICBpbnB1dHMucHVzaCh7IGtpbmQ6IFwic2hvcFwiLCBhcDogc291cmNlLmFwIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwic3RhZ2VcIixcbiAgICAgICAgICAgICAgICBtYXA6IHNvdXJjZS5ndWFyZGlhbl9tYXAsXG4gICAgICAgICAgICAgICAgbmVlZEJvc3M6IHNvdXJjZS5uZWVkX2Jvc3MsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5wdXRzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNob3BDaGFubmVsTGFiZWwoXG4gICAgY3VycmVuY3k6IFwiR29sZFwiIHwgXCJBUFwiLFxuICAgIGF2YWlsYWJsZTogYm9vbGVhbixcbiAgICByZWFzb24/OiBcIm5vdF9mb3Jfc2FsZVwiIHwgXCJub3RfYXZhaWxhYmxlXCIsXG4pOiBIVE1MRWxlbWVudCB7XG4gICAgaWYgKGF2YWlsYWJsZSkge1xuICAgICAgICBpZiAoY3VycmVuY3kgPT09IFwiQVBcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtY3VycmVuY3kgZ2FjaGEtY3VycmVuY3ktLWFwXCIgfSxcbiAgICAgICAgICAgICAgICBcIkFQXCIsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtY3VycmVuY3kgZ2FjaGEtY3VycmVuY3ktLWdvbGRcIiB9LFxuICAgICAgICAgICAgXCJHb2xkXCIsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICBpZiAocmVhc29uID09PSBcIm5vdF9mb3Jfc2FsZVwiKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLXNob3Atc3RhdHVzIGdhY2hhLXNob3Atc3RhdHVzLS1ub3QtZm9yLXNhbGVcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYCR7Y3VycmVuY3l9IHByb2R1Y3QgaXMgbGlzdGVkIGluIHRoZSBzaG9wIGNhdGFsb2cgYnV0IGNhbm5vdCBiZSBwdXJjaGFzZWQgKE5vYnV5KWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJOb3QgZm9yIHNhbGVcIixcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLXNob3Atc3RhdHVzIGdhY2hhLXNob3Atc3RhdHVzLS1ub3QtYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICB0aXRsZTogYCR7Y3VycmVuY3l9IGNvaW4gaXMgbm90IGN1cnJlbnRseSBzb2xkIGluIHRoZSBsaXZlIHNob3BgLFxuICAgICAgICB9LFxuICAgICAgICBgJHtjdXJyZW5jeX0gwrcgTm90IGF2YWlsYWJsZWAsXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU3RhZ2VDaGFubmVsTGFiZWwoXG4gICAgY29pbjogSXRlbSB8IHVuZGVmaW5lZCxcbiAgICBtYXA6IHN0cmluZyxcbiAgICBuZWVkQm9zczogYm9vbGVhbixcbiAgICBsYWJlbDogc3RyaW5nLFxuKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gY29pbj8uc291cmNlcy5maW5kKFxuICAgICAgICAoc291cmNlKTogc291cmNlIGlzIEd1YXJkaWFuSXRlbVNvdXJjZSA9PlxuICAgICAgICAgICAgc291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlICYmIHNvdXJjZS5ndWFyZGlhbl9tYXAgPT09IG1hcCxcbiAgICApO1xuICAgIGNvbnN0IGNoYW5uZWxDbGFzcyA9IG5lZWRCb3NzXG4gICAgICAgID8gXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tYm9zc1wiXG4gICAgICAgIDogXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tZ3VhcmRpYW5cIjtcbiAgICBpZiAoZ3VhcmRpYW5Tb3VyY2UgJiYgY29pbikge1xuICAgICAgICBjb25zdCBwb3B1cCA9IGNyZWF0ZUd1YXJkaWFuUG9wdXAoY29pbiwgZ3VhcmRpYW5Tb3VyY2UpO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IHBvcHVwLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwicG9wdXBfbGlua1wiO1xuICAgICAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBgJHtleGlzdGluZ30gJHtjaGFubmVsQ2xhc3N9YCk7XG4gICAgICAgIHBvcHVwLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgbGFiZWwpO1xuICAgICAgICByZXR1cm4gcG9wdXA7XG4gICAgfVxuICAgIGlmIChuZWVkQm9zcykge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tYm9zc1wiLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBgQm9zcyBzdGFnZSBkcm9wOiAke3ByZXR0eUd1YXJkaWFuTWFwTmFtZShtYXApfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zb3VyY2UtY2hhbm5lbCBnYWNoYS1zb3VyY2UtY2hhbm5lbC0tZ3VhcmRpYW5cIixcbiAgICAgICAgICAgIHRpdGxlOiBgR3VhcmRpYW4gc3RhZ2UgZHJvcDogJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKX1gLFxuICAgICAgICB9LFxuICAgICAgICBsYWJlbCxcbiAgICBdKTtcbn1cblxuLyoqIEtlcHQgZm9yIGNvbnRyYWN0cyB0aGF0IHBpbiB0aGUgaGVscGVyIG5hbWU7IHJldHVybnMgc2hvcCArIHN0YWdlIGNoYW5uZWwgY2hpcHMuICovXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUN1cnJlbmN5TGFiZWwoZ2FjaGE6IEdhY2hhKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGNoYW5uZWxzID0gY3JlYXRlR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxFbGVtZW50cyhnYWNoYSk7XG4gICAgaWYgKGNoYW5uZWxzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gY2hhbm5lbHNbMF0hO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWFjcXVpc2l0aW9uLWNoYW5uZWxzXCIgfSxcbiAgICAgICAgLi4uY2hhbm5lbHMsXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGE6IEdhY2hhKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgY29uc3QgY29pbiA9IHNob3BfaXRlbXMuZ2V0KGdhY2hhLnNob3BfaW5kZXgpO1xuICAgIGNvbnN0IHByb2plY3RlZCA9IHByb2plY3RHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIGFwOiBnYWNoYS5hcCxcbiAgICAgICAgICAgIGVuYWJsZWQ6IGdhY2hhLmVuYWJsZWQsXG4gICAgICAgICAgICBwdXJjaGFzYWJsZTogZ2FjaGEucHVyY2hhc2FibGUsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbGxlY3RHYWNoYVNvdXJjZUlucHV0cyhjb2luKSxcbiAgICApO1xuICAgIHJldHVybiBwcm9qZWN0ZWQubWFwKChjaGFubmVsKSA9PiB7XG4gICAgICAgIGlmIChjaGFubmVsLmtpbmQgPT09IFwic2hvcFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlR2FjaGFTaG9wQ2hhbm5lbExhYmVsKFxuICAgICAgICAgICAgICAgIGNoYW5uZWwuY3VycmVuY3ksXG4gICAgICAgICAgICAgICAgY2hhbm5lbC5hdmFpbGFibGUsXG4gICAgICAgICAgICAgICAgY2hhbm5lbC5yZWFzb24sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVHYWNoYVN0YWdlQ2hhbm5lbExhYmVsKFxuICAgICAgICAgICAgY29pbixcbiAgICAgICAgICAgIGNoYW5uZWwubWFwLFxuICAgICAgICAgICAgY2hhbm5lbC5uZWVkQm9zcyxcbiAgICAgICAgICAgIGNoYW5uZWwubGFiZWwsXG4gICAgICAgICk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeShcbiAgICBpdGVtOiBJdGVtIHwgdW5kZWZpbmVkLFxuICAgIGl0ZW1Tb3VyY2U6IEdhY2hhSXRlbVNvdXJjZSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pIHtcbiAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQoaXRlbVNvdXJjZS5zaG9wX2lkKTtcbiAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgY2hhbm5lbEVsZW1lbnRzID0gY3JlYXRlR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxFbGVtZW50cyhnYWNoYSk7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zb3VyY2Utc3VtbWFyeVwiLFxuICAgICAgICAgICAgcm9sZTogXCJncm91cFwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGAke2dhY2hhLm5hbWV9IGFjcXVpc2l0aW9uYCxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlR2FjaGFDb2luQXJ0KGdhY2hhKSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlfX2NvbnRlbnRcIiB9LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1pZGVudGl0eVwiIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlR2FjaGFTb3VyY2VQb3B1cChcbiAgICAgICAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuID8gdW5kZWZpbmVkIDogY2hhcmFjdGVyLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1hY3F1aXNpdGlvbi1jaGFubmVsc1wiLFxuICAgICAgICAgICAgICAgICAgICByb2xlOiBcImxpc3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGAke2dhY2hhLm5hbWV9IHNvdXJjZXNgLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4uY2hhbm5lbEVsZW1lbnRzLm1hcCgoZWxlbWVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlSFRNTChbXCJzcGFuXCIsIHsgY2xhc3M6IFwiZ2FjaGEtYWNxdWlzaXRpb24tY2hhbm5lbHNfX2l0ZW1cIiwgcm9sZTogXCJsaXN0aXRlbVwiIH0sIGVsZW1lbnRdKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gc291cmNlSXRlbUVsZW1lbnQoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUdhY2hhU291cmNlU3VtbWFyeShpdGVtLCBpdGVtU291cmNlLCBjaGFyYWN0ZXIpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgIGlmIChpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIFtgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSksXG4gICAgICAgICAgICBgICR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YFxuICAgICAgICBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgIHJldHVybiBbY3JlYXRlR3VhcmRpYW5Qb3B1cChpdGVtLCBpdGVtU291cmNlKV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpdGVtRGV0YWlsU3RhdHMoaXRlbTogSXRlbSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIFtcIk1vdmVtZW50XCIsIGl0ZW0ubW92ZW1lbnRdLFxuICAgICAgICBbXCJDaGFyZ2VcIiwgaXRlbS5jaGFyZ2VdLFxuICAgICAgICBbXCJMb2JcIiwgaXRlbS5sb2JdLFxuICAgICAgICBbXCJTbWFzaFwiLCBpdGVtLnNtYXNoXSxcbiAgICAgICAgW1wiU3RyZW5ndGhcIiwgaXRlbS5zdHJdLFxuICAgICAgICBbXCJEZXh0ZXJpdHlcIiwgaXRlbS5kZXhdLFxuICAgICAgICBbXCJTdGFtaW5hXCIsIGl0ZW0uc3RhXSxcbiAgICAgICAgW1wiV2lsbFwiLCBpdGVtLndpbF0sXG4gICAgICAgIFtcIlNlcnZlXCIsIGl0ZW0uc2VydmVdLFxuICAgICAgICBbXCJIUFwiLCBpdGVtLmhwXSxcbiAgICAgICAgW1wiUXVpY2tzbG90c1wiLCBpdGVtLnF1aWNrc2xvdHNdLFxuICAgICAgICBbXCJCdWZmc2xvdHNcIiwgaXRlbS5idWZmc2xvdHNdLFxuICAgIF0gYXMgY29uc3Q7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBzdGF0cyA9IGl0ZW1EZXRhaWxTdGF0cyhpdGVtKS5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUgIT09IDApO1xuICAgIGNvbnN0IHNvdXJjZXMgPSBtYWtlU291cmNlc0xpc3QoXG4gICAgICAgIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoaXRlbSwgKCkgPT4gdHJ1ZSwgY2hhcmFjdGVyKSxcbiAgICApO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNcIiB9LFxuICAgICAgICBbXG4gICAgICAgICAgICBcImhlYWRlclwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2hlYWRlclwiIH0sXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXJ0KGl0ZW0sIDcyLCBcIml0ZW0tZGV0YWlsc19fYXJ0XCIpLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fZXllYnJvd1wiIH0sIFwiRXF1aXBtZW50IGRldGFpbHNcIl0sXG4gICAgICAgICAgICAgICAgW1wiaDJcIiwgaXRlbS5uYW1lX2VuXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fbWV0YVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGAke2NoYXJhY3RlciA/PyBpdGVtLmNoYXJhY3RlciA/PyBcIkFsbCBjaGFyYWN0ZXJzXCJ9IMK3ICR7aXRlbS5wYXJ0fSDCtyBMZXZlbCAke2l0ZW0ubGV2ZWx9YCxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zdGF0c1wiIH0sXG4gICAgICAgICAgICBbXCJoM1wiLCB7IGlkOiBcIml0ZW0tZGV0YWlscy1zdGF0c1wiIH0sIFwiU3RhdHNcIl0sXG4gICAgICAgICAgICBzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkbFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0cy5tYXAoKFtsYWJlbCwgdmFsdWVdKSA9PiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJkdFwiLCBsYWJlbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJkZFwiLCBgJHt2YWx1ZX1gXSxcbiAgICAgICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcInBcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBzdGF0IGJvbnVzZXNcIl0pLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc291cmNlc1wiIH0sIFwiSG93IHRvIGdldCBpdFwiXSxcbiAgICAgICAgICAgIHNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXCJkaXZcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NvdXJjZXNcIiB9LCAuLi5zb3VyY2VzXSlcbiAgICAgICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJObyBhY3RpdmUgYWNxdWlzaXRpb24gc291cmNlIGZvdW5kLlwiLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICBdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc1RyaWdnZXIoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tZGV0YWlscy10cmlnZ2VyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBWaWV3IGRldGFpbHMgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICBdKTtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd0RpYWxvZyhcbiAgICAgICAgICAgIGJ1dHRvbixcbiAgICAgICAgICAgIGAke2l0ZW0ubmFtZV9lbn0gaXRlbSBkZXRhaWxzYCxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtLCBjaGFyYWN0ZXIpLFxuICAgICAgICAgICAgXCJpdGVtLWRldGFpbHMtZGlhbG9nXCIsXG4gICAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW06IEl0ZW0pIHtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja1wiLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgT2ZmaWNpYWwgaXRlbSBhcnQgdW5hdmFpbGFibGUgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja19fY29kZVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGl0ZW0ucGFydCB8fCBcIkl0ZW1cIl0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIFwiT2ZmaWNpYWwgYXJ0IHVuYXZhaWxhYmxlXCJdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgc2hlZXQ6IHN0cmluZyxcbiAgICBjZWxsOiBudW1iZXIsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjbGFzc05hbWU6IHN0cmluZyxcbiAgICBkaXNwbGF5U2l6ZSA9IDQwLFxuKSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBpdGVtQXJ0TWFwLnNoZWV0c1tzaGVldF07XG4gICAgaWYgKCFnZW9tZXRyeSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvbHVtbiA9IGNlbGwgJSBnZW9tZXRyeS5saW5lQ291bnQ7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihjZWxsIC8gZ2VvbWV0cnkubGluZUNvdW50KTtcbiAgICBjb25zdCBzY2FsZSA9IGRpc3BsYXlTaXplIC8gZ2VvbWV0cnkuc2l6ZTtcbiAgICBjb25zdCBpbWFnZVNpemUgPSBnZW9tZXRyeS53aWR0aCAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFggPSAtKGdlb21ldHJ5LnNwYWNlICsgY29sdW1uICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IC0oZ2VvbWV0cnkuc3BhY2UgKyByb3cgKiAoZ2VvbWV0cnkuc2l6ZSArIGdlb21ldHJ5LnNwYWNlKSkgKiBzY2FsZTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogY2xhc3NOYW1lLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICAgICAgICAgIHN0eWxlOiBbXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtaW1hZ2U6dXJsKFwiL2Fzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbiAgICBjbGFzc05hbWUgPSBcIml0ZW0tYXJ0LXRodW1ibmFpbFwiLFxuKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydFswXSxcbiAgICAgICAgYXJ0WzFdLFxuICAgICAgICBgT2ZmaWNpYWwgaXRlbSBhcnQgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgZGlzcGxheVNpemUsXG4gICAgKSA/PyBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYTogR2FjaGEpIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLmxvdHRlcmllc1tgJHtnYWNoYS5nYWNoYV9pbmRleH1gXTtcbiAgICBjb25zdCBmYWxsYmFjayA9ICgpID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtY29pbi1hcnQgZ2FjaGEtY29pbi1hcnQtLXVuYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYENvaW4gYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI/XCIsXG4gICAgICAgIF0pO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaygpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnQuc2hlZXQsXG4gICAgICAgIGFydC5jZWxsLFxuICAgICAgICBgJHtnYWNoYS5uYW1lfSBjb2luIGFydHdvcmtgLFxuICAgICAgICBcImdhY2hhLWNvaW4tYXJ0XCIsXG4gICAgKSA/PyBmYWxsYmFjaygpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UYWJsZVJvdyhpdGVtOiBJdGVtLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlUm93RWxlbWVudCB7XG4gICAgY29uc3Qgcm93ID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widHJcIiwgeyBjbGFzczogXCJyZXN1bHQtcm93XCIgfSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gcmVzdWx0LXN1bW1hcnlcIiwgXCJkYXRhLWxhYmVsXCI6IFwiSXRlbVwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbSwgY2hhcmFjdGVyKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQXJ0XCIgfSwgY3JlYXRlSXRlbUFydChpdGVtKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQ2hhcmFjdGVyXCIgfSwgaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGxcIl0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlBhcnRcIiB9LCBpdGVtLnBhcnRdLFxuICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5tYXAocyA9PiBpdGVtLnN0YXRGcm9tU3RyaW5nKHMpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IHN0YXQsIFwiZGF0YS12YWx1ZVwiOiB2YWx1ZSB9LCB2YWx1ZV0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkxldmVsXCIsIFwiZGF0YS12YWx1ZVwiOiBgJHtpdGVtLmxldmVsfWAgfSwgYCR7aXRlbS5sZXZlbH1gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJTb3VyY2VcIiB9LCAuLi5tYWtlU291cmNlc0xpc3QoaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgcmV0dXJuIHJvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhY2hhVGFibGUoZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbiwgY2hhcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJHYWNoYSBjb2lucyBieSBzaG9wIGN1cnJlbmN5IGFuZCBzdGFnZSBzb3VyY2VzXCJdLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJHYWNoYVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSh1bmRlZmluZWQsIG5ldyBHYWNoYUl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCksIGNoYXIpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdWx0c1RhYmxlKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IChpdGVtczogSXRlbVtdLCBpdGVtOiBJdGVtKSA9PiBJdGVtW10sXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgcmVzdWx0czogeyBba2V5OiBzdHJpbmddOiBJdGVtW10gfSA9IHtcbiAgICAgICAgXCJIYXRcIjogW10sXG4gICAgICAgIFwiSGFpclwiOiBbXSxcbiAgICAgICAgXCJEeWVcIjogW10sXG4gICAgICAgIFwiVXBwZXJcIjogW10sXG4gICAgICAgIFwiTG93ZXJcIjogW10sXG4gICAgICAgIFwiU2hvZXNcIjogW10sXG4gICAgICAgIFwiU29ja3NcIjogW10sXG4gICAgICAgIFwiSGFuZFwiOiBbXSxcbiAgICAgICAgXCJCYWNrcGFja1wiOiBbXSxcbiAgICAgICAgXCJGYWNlXCI6IFtdLFxuICAgICAgICBcIlJhY2tldFwiOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAoZmlsdGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHRzW2l0ZW0ucGFydF0gPSBwcmlvcml6ZXIocmVzdWx0c1tpdGVtLnBhcnRdLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJNYXRjaGluZyBlcXVpcG1lbnQgYnkgc2xvdCBhbmQgc2VsZWN0ZWQgc3RhdCBwcmlvcml0eVwiXSxcbiAgICAgICAgICAgIFtcInRoZWFkXCIsXG4gICAgICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiUGFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoKHN0YXQpID0+IGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdCkpLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiTGV2ZWxcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlNvdXJjZVwiXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcInRib2R5XCJdLFxuICAgICAgICBdXG4gICAgKTtcbiAgICBjb25zdCB0YWJsZUJvZHkgPSB0YWJsZS50Qm9kaWVzWzBdO1xuICAgIGlmICghdGFibGVCb2R5KSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB0eXBlIE1hcE9wdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH07XG5cbiAgICB0eXBlIENvc3QgPSB7XG4gICAgICAgIGdvbGQ6IG51bWJlcixcbiAgICAgICAgYXA6IG51bWJlcixcbiAgICAgICAgbWFwczogTWFwT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY29tYmluZU1hcHMobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHJlc3VsdFttYXBdLmNvbmNhdCh0cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZUNvc3RzKGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCArIGNvc3QyLmdvbGQsXG4gICAgICAgICAgICBhcDogY29zdDEuYXAgKyBjb3N0Mi5hcCxcbiAgICAgICAgICAgIG1hcHM6IGNvbWJpbmVNYXBzKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbk1hcChtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmICh0cmllcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IFtNYXRoLm1pbihyZXN1bHRbbWFwXVswXSwgdHJpZXNbMF0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5Db3N0KGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICAvLyBMZXhpY29ncmFwaGljIG9uIChhcCwgZ29sZCk6IGxvd2VyIEFQIHdpbnMsIHRoZW4gbG93ZXIgR29sZC5cbiAgICAgICAgLy8gTnVtZXJpYyBjb21wYXJlIG9ubHkg4oCUIGRvIG5vdCB1c2UgSlMgYXJyYXkvc3RyaW5nIG9yZGVyaW5nLlxuICAgICAgICBjb25zdCBwaWNrQ29zdDEgPVxuICAgICAgICAgICAgY29zdDEuYXAgPCBjb3N0Mi5hcCB8fFxuICAgICAgICAgICAgKGNvc3QxLmFwID09PSBjb3N0Mi5hcCAmJiBjb3N0MS5nb2xkIDwgY29zdDIuZ29sZCk7XG4gICAgICAgIHJldHVybiBwaWNrQ29zdDEgP1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QxLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QyLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QyLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29zdE9mKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IENvc3Qge1xuICAgICAgICBjb25zdCBzb3VyY2VDb3N0cyA9IFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgICAgIC5tYXAoKGl0ZW1Tb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlLmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogaXRlbVNvdXJjZS5wcmljZSwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiBpdGVtU291cmNlLnByaWNlLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGVDb3N0ID0gY29zdE9mKGl0ZW1Tb3VyY2UuaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogc2luZ2xlQ29zdC5nb2xkICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiBzaW5nbGVDb3N0LmFwICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzaW5nbGVDb3N0Lm1hcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFttYXAsIHRyaWVzXSkgPT4gW21hcCwgdHJpZXMubWFwKG4gPT4gbiAqIG11bHRpcGxpZXIpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFtbaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIFtpdGVtU291cmNlLml0ZW1zLmxlbmd0aF1dXSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNvdXJjZUNvc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VlZCB3aXRoIHRoZSBmaXJzdCByZWFsIHNvdXJjZSBjb3N0LiBBIHswLDB9IGlkZW50aXR5IHdvdWxkIGFsd2F5cyB3aW5cbiAgICAgICAgLy8gdW5kZXIgYSBjb3JyZWN0IG1pbiwgYW5kIHRoZSBvbGQgYWx3YXlzLWxhc3QgYnVnIGhpZCB0aGF0LlxuICAgICAgICByZXR1cm4gc291cmNlQ29zdHMucmVkdWNlKChjdXJyLCBjb3N0KSA9PiBtaW5Db3N0KGN1cnIsIGNvc3QpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVN0YXRpc3RpY3M6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuZnJvbUVudHJpZXMocHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBbc3RhdCwgMF0pKTtcbiAgICBjb25zdCBzdGF0aXN0aWNzID0ge1xuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgU2V0PENoYXJhY3Rlcj4sXG4gICAgICAgIExldmVsOiAwLFxuICAgICAgICBjb3N0OiB7IGFwOiAwLCBnb2xkOiAwLCBtYXBzOiB7fSB9IGFzIENvc3QsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIE9iamVjdC52YWx1ZXMocmVzdWx0cykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLnJlZHVjZSgoY3Vyciwgc3RhdE5hbWUpID0+IGN1cnIgKyByZXN1bHRbMF0uc3RhdEZyb21TdHJpbmcoc3RhdE5hbWUpLCAwKTtcbiAgICAgICAgICAgIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSArPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpc3RpY3MuTGV2ZWwgPSBNYXRoLm1heChyZXN1bHRbMF0ubGV2ZWwsIHN0YXRpc3RpY3MuTGV2ZWwpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXN1bHQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hhciBvZiBpdGVtLmNoYXJhY3RlciA/IFtpdGVtLmNoYXJhY3Rlcl0gOiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGlzdGljcy5jaGFyYWN0ZXJzLmFkZChjaGFyKVxuICAgICAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmRDaGlsZChpdGVtVG9UYWJsZVJvdyhpdGVtLCBzb3VyY2VGaWx0ZXIsIHByaW9yaXR5U3RhdHMsIGNoYXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb290ZXIgY29zdCBtdXN0IG1hdGNoIHN0YXRzL2xldmVsOiBiZXN0IGNhbmRpZGF0ZSBwZXIgc2xvdCBvbmx5LlxuICAgICAgICAvLyBUaGUgYm9keSBzdGlsbCByZW5kZXJzIHRoZSBmdWxsIHJhbmtlZCBsaXN0IGFib3ZlLlxuICAgICAgICBzdGF0aXN0aWNzLmNvc3QgPSBjb21iaW5lQ29zdHMoXG4gICAgICAgICAgICBjb3N0T2YocmVzdWx0WzBdLCBjaGFyYWN0ZXIgJiYgaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSA/IGNoYXJhY3RlciA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICBzdGF0aXN0aWNzLmNvc3QsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpc3RpY3MuY2hhcmFjdGVycy5zaXplID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsX3NvdXJjZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuZ29sZCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuZ29sZC50b0ZpeGVkKDApfSBHb2xkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5hcCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuYXAudG9GaXhlZCgwKX0gQVBgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0YXRpc3RpY3NbJ0d1YXJkaWFuIGdhbWVzJ10uZm9yRWFjaCgoY291bnQsIG1hcCkgPT4gdG90YWxfc291cmNlcy5wdXNoKGAke2NvdW50LnRvRml4ZWQoMCl9IHggJHttYXB9YCkpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidGZvb3RcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBOYW1lX2NvbHVtblwiIH0sIFwiVG90YWw6XCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQ2hhcmFjdGVyX2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgUGFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBudW1lcmljXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7cHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdfWBcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke3N0YXRpc3RpY3MuTGV2ZWx9YF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBTb3VyY2VfY29sdW1uXCIgfSwgdG90YWxfc291cmNlcy5qb2luKFwiLCBcIildLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbl9lbGVtZW50IG9mIHRhYmxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYENoYXJhY3Rlcl9jb2x1bW5gKSkge1xuICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgIGlmIChwcmlvcml0eVN0YXRpc3RpY3NbYXR0cmlidXRlXSA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke2F0dHJpYnV0ZX1fY29sdW1uYCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShjb2x1bW5fZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sdW1uX2VsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhJdGVtTGV2ZWwoKSB7XG4gICAgLy9ubyByZWR1Y2UgZm9yIE1hcD9cbiAgICBsZXQgbWF4ID0gMDtcbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KG1heCwgaXRlbS5sZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBtYXg7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZGlhbG9nICYmIGRpYWxvZyA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgbWFrZUNoZWNrYm94VHJlZSwgVHJlZU5vZGUsIGdldExlYWZTdGF0ZXMsIHNldExlYWZTdGF0ZXMgfSBmcm9tICcuL2NoZWNrYm94VHJlZSc7XG5pbXBvcnQgeyBjcmVhdGVQb3B1cExpbmssIGRvd25sb2FkSXRlbXMsIGdldFJlc3VsdHNUYWJsZSwgSXRlbSwgSXRlbVNvdXJjZSwgZ2V0TWF4SXRlbUxldmVsLCBpdGVtcywgQ2hhcmFjdGVyLCBjaGFyYWN0ZXJzLCBpc0NoYXJhY3RlciwgU2hvcEl0ZW1Tb3VyY2UsIEdhY2hhSXRlbVNvdXJjZSwgZ2V0R2FjaGFUYWJsZSB9IGZyb20gJy4vaXRlbUxvb2t1cCc7XG5pbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IHNlbGVjdEJ5UHJpb3JpdHkgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7IFZhcmlhYmxlX3N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5jb25zdCBwYXJ0c0ZpbHRlciA9IFtcbiAgICBcIlBhcnRzXCIsIFtcbiAgICAgICAgXCJIZWFkXCIsIFtcbiAgICAgICAgICAgIFwiK0hhdFwiLFxuICAgICAgICAgICAgXCIrSGFpclwiLFxuICAgICAgICAgICAgXCJEeWVcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrVXBwZXJcIixcbiAgICAgICAgXCIrTG93ZXJcIixcbiAgICAgICAgXCJMZWdzXCIsIFtcbiAgICAgICAgICAgIFwiK1Nob2VzXCIsXG4gICAgICAgICAgICBcIlNvY2tzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiQXV4XCIsIFtcbiAgICAgICAgICAgIFwiK0hhbmRcIixcbiAgICAgICAgICAgIFwiK0JhY2twYWNrXCIsXG4gICAgICAgICAgICBcIitGYWNlXCJcbiAgICAgICAgXSxcbiAgICAgICAgXCIrUmFja2V0XCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlciA9IFtcbiAgICBcIkF2YWlsYWJpbGl0eVwiLCBbXG4gICAgICAgIFwiU2hvcFwiLCBbXG4gICAgICAgICAgICBcIitHb2xkXCIsXG4gICAgICAgICAgICBcIitBUFwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitBbGxvdyBnYWNoYVwiLFxuICAgICAgICBcIitHdWFyZGlhblwiLFxuICAgICAgICBcIitVbnRyYWRhYmxlXCIsXG4gICAgICAgIFwiVW5hdmFpbGFibGUgaXRlbXNcIixcbiAgICBdLFxuXTtcblxuY29uc3QgZXhjbHVkZWRfaXRlbV9pZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuLyoqIERpZ2l0cy1vbmx5IHNhZmUtaW50ZWdlciBwYXJzZSBmb3IgZXhjbHVkZWRfaXRlbV9pZHMgbG9jYWxTdG9yYWdlIHRva2Vucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4Y2x1ZGVkSXRlbUlkVG9rZW4odG9rZW46IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHRva2VuKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IE51bWJlcih0b2tlbik7XG4gICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihpZCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBhZGRGaWx0ZXJUcmVlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXJhY3RlckZpbHRlcnNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgW1wiQWxsXCIsIC4uLmNoYXJhY3RlcnNdKSB7XG4gICAgICAgIGNvbnN0IGlkID0gYGNoYXJhY3RlclNlbGVjdG9yc18ke2NoYXJhY3Rlcn1gO1xuICAgICAgICBjb25zdCByYWRpb19idXR0b24gPSBjcmVhdGVIVE1MKFtcImlucHV0XCIsIHsgaWQ6IGlkLCB0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIsIHZhbHVlOiBjaGFyYWN0ZXIgfV0pO1xuICAgICAgICByYWRpb19idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocmFkaW9fYnV0dG9uKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wibGFiZWxcIiwgeyBmb3I6IGlkIH0sIGNoYXJhY3Rlcl0pKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wiYnJcIl0pKTtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICByYWRpb19idXR0b24uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmlsdGVyczogW1RyZWVOb2RlLCBzdHJpbmddW10gPSBbXG4gICAgICAgIFtwYXJ0c0ZpbHRlciwgXCJwYXJ0c0ZpbHRlclwiXSxcbiAgICAgICAgW2F2YWlsYWJpbGl0eUZpbHRlciwgXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIl0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IFtmaWx0ZXIsIG5hbWVdIG9mIGZpbHRlcnMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJlZSA9IG1ha2VDaGVja2JveFRyZWUoZmlsdGVyKTtcbiAgICAgICAgdHJlZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRyZWUpO1xuICAgIH1cbn1cblxuYWRkRmlsdGVyVHJlZXMoKTtcblxubGV0IGRyYWdnZWQ6IEhUTUxFbGVtZW50O1xuY29uc3QgZHJhZ1NlcGFyYXRvckxpbmUgPSBjcmVhdGVIVE1MKFtcImhyXCIsIHsgaWQ6IFwiZHJhZ092ZXJCYXJcIiB9XSk7XG5sZXQgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TW92ZUljb24oZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwicHJpb3JpdHktbW92ZV9faWNvblwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLCBcIjAgMCAyNCAyNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiZm9jdXNhYmxlXCIsIFwiZmFsc2VcIik7XG4gICAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJwYXRoXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFxuICAgICAgICBcImRcIixcbiAgICAgICAgZGlyZWN0aW9uID09PSBcInVwXCIgPyBcIk02IDE0LjUgMTIgOC41bDYgNlwiIDogXCJNNiA5LjUgMTIgMTUuNWw2LTZcIixcbiAgICApO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyLjI1XCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVjYXBcIiwgXCJyb3VuZFwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lam9pblwiLCBcInJvdW5kXCIpO1xuICAgIHN2Zy5hcHBlbmQocGF0aCk7XG4gICAgcmV0dXJuIHN2Zztcbn1cblxuLyoqIFJlYWQgcmFua2luZyBrZXkgZnJvbSB0aGUgbGFiZWwgbm9kZSBzbyBtb3ZlIGNvbnRyb2xzIG5ldmVyIHBvbGx1dGUgc3RhdCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW9yaXR5U3RhdExhYmVsKGl0ZW06IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxhYmVsID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LXN0YXQtbGFiZWxcIik7XG4gICAgaWYgKGxhYmVsPy50ZXh0Q29udGVudCkge1xuICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBzZXRQcmlvcml0eVN0YXRMYWJlbChpdGVtOiBIVE1MRWxlbWVudCwgc3RhdDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGFiZWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKTtcbiAgICBpZiAobGFiZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHN0YXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gc3RhdDtcbiAgICB9XG4gICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBjb25zdCBkb3duID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAodXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICB1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBSYWlzZSAke3N0YXR9IHByaW9yaXR5YCk7XG4gICAgICAgIHVwLnRpdGxlID0gYFJhaXNlICR7c3RhdH1gO1xuICAgIH1cbiAgICBpZiAoZG93biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgIGRvd24uc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBgTG93ZXIgJHtzdGF0fSBwcmlvcml0eWApO1xuICAgICAgICBkb3duLnRpdGxlID0gYExvd2VyICR7c3RhdH1gO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdDogc3RyaW5nKTogSFRNTExJRWxlbWVudCB7XG4gICAgY29uc3QgdXAgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIGNsYXNzOiBcInByaW9yaXR5LW1vdmUgcHJpb3JpdHktbW92ZS11cFwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSYWlzZSAke3N0YXR9IHByaW9yaXR5YCxcbiAgICAgICAgICAgIHRpdGxlOiBgUmFpc2UgJHtzdGF0fWAsXG4gICAgICAgIH0sXG4gICAgXSk7XG4gICAgdXAuYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oXCJ1cFwiKSk7XG4gICAgY29uc3QgZG93biA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgY2xhc3M6IFwicHJpb3JpdHktbW92ZSBwcmlvcml0eS1tb3ZlLWRvd25cIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgTG93ZXIgJHtzdGF0fSBwcmlvcml0eWAsXG4gICAgICAgICAgICB0aXRsZTogYExvd2VyICR7c3RhdH1gLFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIGRvd24uYXBwZW5kKGNyZWF0ZVByaW9yaXR5TW92ZUljb24oXCJkb3duXCIpKTtcblxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJsaVwiLFxuICAgICAgICB7IGNsYXNzOiBcImRyb3B6b25lXCIsIGRyYWdnYWJsZTogXCJ0cnVlXCIgfSxcbiAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcInByaW9yaXR5LXN0YXQtbGFiZWxcIiB9LCBzdGF0XSxcbiAgICAgICAgY3JlYXRlSFRNTChbXCJzcGFuXCIsIHsgY2xhc3M6IFwicHJpb3JpdHktbW92ZS1jb250cm9sc1wiIH0sIHVwLCBkb3duXSksXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHByaW9yaXR5TGlzdEl0ZW1zKGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiBIVE1MTElFbGVtZW50W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGxpc3QuY2hpbGRyZW4pLmZpbHRlcihcbiAgICAgICAgKG5vZGUpOiBub2RlIGlzIEhUTUxMSUVsZW1lbnQgPT4gbm9kZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgbm9kZS5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBzeW5jUmFua2luZ1N1bW1hcnlIaW50KGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBoaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9zdW1tYXJ5X2hpbnRcIik7XG4gICAgaWYgKCEoaGludCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvcCA9IHByaW9yaXR5TGlzdEl0ZW1zKGxpc3QpWzBdO1xuICAgIGlmICghdG9wKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFiZWwgPSBnZXRQcmlvcml0eVN0YXRMYWJlbCh0b3ApO1xuICAgIGlmIChsYWJlbCkge1xuICAgICAgICBoaW50LnRleHRDb250ZW50ID0gYCR7bGFiZWx9IGZpcnN0YDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShsaXN0OiBIVE1MT0xpc3RFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgaXRlbXMgPSBwcmlvcml0eUxpc3RJdGVtcyhsaXN0KTtcbiAgICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCB1cCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLXVwXCIpO1xuICAgICAgICBjb25zdCBkb3duID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICAgICAgaWYgKHVwIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIHVwLmRpc2FibGVkID0gaW5kZXggPT09IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvd24gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgICAgZG93bi5kaXNhYmxlZCA9IGluZGV4ID09PSBpdGVtcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc3luY1JhbmtpbmdTdW1tYXJ5SGludChsaXN0KTtcbn1cblxuZnVuY3Rpb24gbW92ZVByaW9yaXR5TGlzdEl0ZW0oaXRlbTogSFRNTExJRWxlbWVudCwgZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IHZvaWQge1xuICAgIGNvbnN0IGxpc3QgPSBpdGVtLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsID0gZGlyZWN0aW9uID09PSBcInVwXCIgPyBpdGVtLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBpdGVtLm5leHRFbGVtZW50U2libGluZztcbiAgICB3aGlsZSAoc2libGluZyAmJiAhKHNpYmxpbmcgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIHNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIikpKSB7XG4gICAgICAgIHNpYmxpbmcgPSBkaXJlY3Rpb24gPT09IFwidXBcIiA/IHNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZyA6IHNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgICBpZiAoIShzaWJsaW5nIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGlyZWN0aW9uID09PSBcInVwXCIpIHtcbiAgICAgICAgc2libGluZy5iZWZvcmUoaXRlbSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzaWJsaW5nLmFmdGVyKGl0ZW0pO1xuICAgIH1cbiAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xufVxuXG5mdW5jdGlvbiBhcHBseURyYWdEcm9wKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUsIC5wcmlvcml0eS1tb3ZlLWNvbnRyb2xzXCIpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvdyA9IHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKVxuICAgICAgICAgICAgPyB0YXJnZXRcbiAgICAgICAgICAgIDogdGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoIShyb3cgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnZ2VkID0gcm93O1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRyb3B6b25lID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoZHJvcHpvbmUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UmVjdCA9IGRyb3B6b25lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgLSB0YXJnZXRSZWN0LnRvcDtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHRhcmdldFJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgZW51bSBQb3NpdGlvbiB7XG4gICAgICAgICAgICAgICAgYWJvdmUsXG4gICAgICAgICAgICAgICAgb24sXG4gICAgICAgICAgICAgICAgYmVsb3csXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHkgPCBoZWlnaHQgKiAwLjMgPyBQb3NpdGlvbi5hYm92ZSA6IHkgPiBoZWlnaHQgKiAwLjcgPyBQb3NpdGlvbi5iZWxvdyA6IFBvc2l0aW9uLm9uO1xuICAgICAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYWJvdmU6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBkcm9wem9uZS5iZWZvcmUoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmJlbG93OlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZHJvcHpvbmUuYWZ0ZXIoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLm9uOlxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkID09PSBkcm9wem9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IGRyb3B6b25lO1xuICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAoIWRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbikge1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmFmdGVyKGRyYWdnZWQpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcmFnZ2VkLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgY29uc3QgZHJvcFRhcmdldCA9IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKCEoZHJvcFRhcmdldCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29tYmluZWQgPSBgJHtnZXRQcmlvcml0eVN0YXRMYWJlbChkcm9wVGFyZ2V0KX0rJHtnZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkKX1gO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJvcFRhcmdldCwgY29tYmluZWQpO1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcm9wVGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHJvcFJvdyA9IHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKVxuICAgICAgICAgICAgPyB0YXJnZXRcbiAgICAgICAgICAgIDogdGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoZHJvcFJvdyA9PT0gZHJhZ2dlZCAmJiBkcmFnZ2VkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkKS5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBzZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkLCBzdGF0cy5zaGlmdCgpISk7XG4gICAgICAgICAgICBkcmFnZ2VkLmFmdGVyKC4uLnN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdCkpKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcmFnZ2VkLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5hcHBseURyYWdEcm9wKCk7XG5cbmZ1bmN0aW9uIGh5ZHJhdGVQcmlvcml0eUxpc3RDb250cm9scygpOiB2b2lkIHtcbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICBpZiAoIWl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1zdGF0LWxhYmVsXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFzdGF0KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtLnJlcGxhY2VXaXRoKGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdCkpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3RhdGljIEhUTUwgc2hpcHMgZW1wdHkgY29udHJvbCBzaGVsbHM7IGZpbGwgaWNvbnMgd2l0aG91dCBsb3NpbmcgbGFiZWxzLlxuICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBpdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoXCIucHJpb3JpdHktbW92ZVwiKSkge1xuICAgICAgICAgICAgaWYgKCEoYnV0dG9uIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHx8IGJ1dHRvbi5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBidXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwicHJpb3JpdHktbW92ZS11cFwiKSA/IFwidXBcIiA6IFwiZG93blwiO1xuICAgICAgICAgICAgYnV0dG9uLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKGRpcmVjdGlvbikpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShwcmlvcml0eUxpc3QpO1xufVxuXG5oeWRyYXRlUHJpb3JpdHlMaXN0Q29udHJvbHMoKTtcblxuZnVuY3Rpb24gY29tcGFyZShsaHM6IG51bWJlciwgcmhzOiBudW1iZXIpOiAtMSB8IDAgfCAxIHtcbiAgICBpZiAobGhzID09PSByaHMpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBsaHMgPCByaHMgPyAtMSA6IDE7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk6IENoYXJhY3RlciB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNDaGFyYWN0ZXIoc2VsZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkQ2hhcmFjdGVyKGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgXCJBbGxcIikge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSA9PT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBpdGVtU2VsZWN0b3JzID0gW1wicGFydHNTZWxlY3RvclwiLCBcImdhY2hhU2VsZWN0b3JcIl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBJdGVtU2VsZWN0b3IgPSB0eXBlb2YgaXRlbVNlbGVjdG9yc1tudW1iZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbVNlbGVjdG9yKGl0ZW1TZWxlY3Rvcjogc3RyaW5nKTogaXRlbVNlbGVjdG9yIGlzIEl0ZW1TZWxlY3RvciB7XG4gICAgcmV0dXJuIChpdGVtU2VsZWN0b3JzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLmluY2x1ZGVzKGl0ZW1TZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCk6IEl0ZW1TZWxlY3RvciB7XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAocGFydHNTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAoZ2FjaGFTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcImdhY2hhU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xufVxuXG5mdW5jdGlvbiBzYXZlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKSB8fCBcIkFsbFwiO1xuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIsIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvL21pc2NcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiLCBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIsIGl0ZW1fbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLmRlbGV0ZV92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIsIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCk7XG4gICAgfVxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIiwgZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiLCBBcnJheS5mcm9tKGV4Y2x1ZGVkX2l0ZW1faWRzKS5qb2luKFwiLFwiKSk7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc3RvcmVkX2NoYXJhY3RlciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIpO1xuICAgIHNldFNlbGVjdGVkQ2hhcmFjdGVyKHR5cGVvZiBzdG9yZWRfY2hhcmFjdGVyID09PSBcInN0cmluZ1wiICYmIGlzQ2hhcmFjdGVyKHN0b3JlZF9jaGFyYWN0ZXIpID8gc3RvcmVkX2NoYXJhY3RlciA6IFwiQWxsXCIpO1xuXG4gICAgey8vRmlsdGVyc1xuICAgICAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoVmFyaWFibGVfc3RvcmFnZS52YXJpYWJsZXMpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIHN0YXRlc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICB7IC8vbWlzY1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIik7XG4gICAgICAgIGlmICh0eXBlb2YgbWF4TGV2ZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHttYXhMZXZlbH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGxldmVscmFuZ2UubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbV9uYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBuYW1lZmlsdGVyLnZhbHVlID0gaXRlbV9uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZW5jaGFudFRvZ2dsZS5jaGVja2VkID0gISFWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgfVxuXG4gICAgLy8gUmVoeWRyYXRlIGV4Y2x1c2lvbnMgYmVmb3JlIGFueSBzYXZlLWNhcGFibGUgZXZlbnQgKGNoYW5nZS9pbnB1dCDihpIgdXBkYXRlUmVzdWx0cyDihpIgc2F2ZVNlbGVjdGlvbikuXG4gICAgY29uc3QgZXhjbHVkZWRfaWRzID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiKTtcbiAgICBpZiAodHlwZW9mIGV4Y2x1ZGVkX2lkcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2lkcy5zcGxpdChcIixcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRXhjbHVkZWRJdGVtSWRUb2tlbihpZCk7XG4gICAgICAgICAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBsZXQgaXRlbVR5cGVTZWxlY3RvciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtVHlwZVNlbGVjdG9yICE9PSBcInN0cmluZ1wiIHx8ICFpc0l0ZW1TZWxlY3RvcihpdGVtVHlwZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaXRlbVR5cGVTZWxlY3RvciA9IFwicGFydHNTZWxlY3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVR5cGVTZWxlY3Rvcik7XG4gICAgICAgIGlmICghKHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZWN0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSk7XG4gICAgfVxuXG4gICAgLy9tdXN0IGJlIGxhc3QgYmVjYXVzZSBpdCB0cmlnZ2VycyBhIHN0b3JlXG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVzdWx0cygpIHtcbiAgICBzYXZlU2VsZWN0aW9uKCk7XG4gICAgLy8gV2hpbGUgZmlyc3QtbG9hZCBsYWIgcHJlcCBpcyBhY3RpdmUsIGtlZXAgZnJpZW5kbHkgbG9hZGluZyBjb3B5IOKAlCBkbyBub3QgcGFpbnRcbiAgICAvLyBhbiBlbXB0eSBpbnZlbnRvcnkgKFwiTm8gaXRlbXMgbWF0Y2jigKZcIikgb3ZlciB0aGUgYW5pbWF0ZWQgbG9hZGVyLlxuICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik/LmdldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWx0ZXJzOiAoKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBjb25zdCBzb3VyY2VGaWx0ZXJzOiAoKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBsZXQgc2VsZWN0ZWRDaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cblxuICAgIHsgLy9jaGFyYWN0ZXIgZmlsdGVyXG4gICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5jaGFyYWN0ZXIgPT09IHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9wYXJ0cyBmaWx0ZXJcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1N0YXRlcyA9IGdldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0KTtcbiAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBwYXJ0c1N0YXRlc1tpdGVtLnBhcnRdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2F2YWlsYWJpbGl0eSBmaWx0ZXJcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0KTtcbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHb2xkXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiAhaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQVBcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmIGl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVudHJhZGFibGVcIl0pIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ucGFyY2VsX2VuYWJsZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQWxsb3cgZ2FjaGFcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR3VhcmRpYW5cIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICFpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW5hdmFpbGFibGUgaXRlbXNcIl0pIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlciA9IFsuLi5zb3VyY2VGaWx0ZXJzXTtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbHRlciA9IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlOiBJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VGaWx0ZXIoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBpdGVtU291cmNlLml0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpc0F2YWlsYWJsZVNvdXJjZSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlSXRlbShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtU291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpc0F2YWlsYWJsZUl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL21pc2MgZmlsdGVyXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIGZpbHRlcnMucHVzaCgoaXRlbTogSXRlbSkgPT4gaXRlbS5sZXZlbCA8PSBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5uYW1lX2VuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoaXRlbV9uYW1lLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pZCBmaWx0ZXJcbiAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gIWV4Y2x1ZGVkX2l0ZW1faWRzLmhhcyhpdGVtLmlkKSk7XG4gICAgICAgIGNvbnN0IGl0ZW1GaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpdGVtRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShpdGVtRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuXG4gICAgICAgIH1cbiAgICAgICAgaXRlbUZpbHRlckxpc3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgIGlmIChleGNsdWRlZF9pdGVtX2lkcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImVtcHR5LW5vdGVcIiB9LFxuICAgICAgICAgICAgICAgIFwiTm8gZXhjbHVkZWQgaXRlbXNcIixcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaXRlbV9pZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gaXRlbXMuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW1GaWx0ZXJMaXN0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImV4Y2x1ZGVkLWl0ZW1cIiB9LFxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZXhjbHVkZWQtaXRlbV9fbmFtZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxfcmVtb3ZhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2lkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSZXN0b3JlICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlc3RvcmVcIixcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBjb21wYXJhdG9yczogKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gbnVtYmVyKVtdID0gW107XG5cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eVN0YXRzID0gcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KVxuICAgICAgICAubWFwKG5vZGUgPT4gZ2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSkpXG4gICAgICAgIC5maWx0ZXIoc3RhdCA9PiBzdGF0Lmxlbmd0aCA+IDApO1xuICAgIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdC5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBjb21wYXJhdG9ycy5wdXNoKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gY29tcGFyZShcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiBsaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pLFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IHJocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFibGUgPSAoKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHRzVGFibGUoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPT4gZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW0pKSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZSA9PiBzb3VyY2VGaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpLFxuICAgICAgICAgICAgICAgICAgICAoaXRlbXMsIGl0ZW0pID0+IHNlbGVjdEJ5UHJpb3JpdHkoaXRlbXMsIGl0ZW0sIGNvbXBhcmF0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHlTdGF0cyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEdhY2hhVGFibGUoaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0Um93cyA9IHRhYmxlLnRCb2RpZXNbMF0/LnJvd3MubGVuZ3RoID8/IE1hdGgubWF4KDAsIHRhYmxlLnJvd3MubGVuZ3RoIC0gMSk7XG4gICAgdGFyZ2V0LmlubmVyVGV4dCA9IFwiXCI7XG4gICAgaWYgKHJlc3VsdFJvd3MgPT09IDApIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInJlc3VsdHMtZW1wdHlcIiwgcm9sZTogXCJzdGF0dXNcIiB9LFxuICAgICAgICAgICAgXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiLFxuICAgICAgICBdKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQodGFibGUpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRzU3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzU3RhdHVzXCIpO1xuICAgIGlmIChyZXN1bHRzU3RhdHVzKSB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSByZXN1bHRSb3dzID09PSAwXG4gICAgICAgICAgICA/IFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIlxuICAgICAgICAgICAgOiBgJHtyZXN1bHRSb3dzfSBtYXRjaGluZyAke3Jlc3VsdFJvd3MgPT09IDEgPyBcIml0ZW1cIiA6IFwiaXRlbXNcIn1gO1xuICAgIH1cbiAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG59XG5cbmxldCByZXN1bHRzVGFibGVTY3JvbGxCb3VuZCA9IGZhbHNlO1xubGV0IHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXI6IFJlc2l6ZU9ic2VydmVyIHwgdW5kZWZpbmVkO1xubGV0IHJlc3VsdHNDb2x1bW5QYW5SZXZlYWxlZCA9IGZhbHNlO1xuXG4vKiogS2VlcCB0aGUgdG9wIGNvbHVtbiBzY3JvbGxlciB3aWR0aCBhbmQgc2Nyb2xsTGVmdCBhbGlnbmVkIHdpdGggdGhlIHJlc3VsdHMgdGFibGUuICovXG5mdW5jdGlvbiBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCkge1xuICAgIGNvbnN0IHRhYmxlU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZVNjcm9sbFwiKTtcbiAgICBjb25zdCB0YWJsZUhTY3JvbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlSFNjcm9sbFwiKTtcbiAgICBjb25zdCBzcGFjZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlSFNjcm9sbFNwYWNlclwiKTtcbiAgICBjb25zdCBjb2x1bW5QYW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhYmxlQ29sdW1uUGFuXCIpO1xuICAgIGlmICghKHRhYmxlU2Nyb2xsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEodGFibGVIU2Nyb2xsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoc3BhY2VyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoY29sdW1uUGFuIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3VsdHNUYWJsZVNjcm9sbEJvdW5kKSB7XG4gICAgICAgIHJlc3VsdHNUYWJsZVNjcm9sbEJvdW5kID0gdHJ1ZTtcbiAgICAgICAgbGV0IHN5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgbWlycm9yID0gKHNvdXJjZTogSFRNTEVsZW1lbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChzeW5jaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3luY2luZyA9IHRydWU7XG4gICAgICAgICAgICB0YXJnZXQuc2Nyb2xsTGVmdCA9IHNvdXJjZS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgc3luY2luZyA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICB0YWJsZVNjcm9sbC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgICAgICAgIG1pcnJvcih0YWJsZVNjcm9sbCwgdGFibGVIU2Nyb2xsKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICB0YWJsZUhTY3JvbGwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBtaXJyb3IodGFibGVIU2Nyb2xsLCB0YWJsZVNjcm9sbCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdWx0c1RhYmxlV2lkdGhPYnNlcnZlci5vYnNlcnZlKHRhYmxlU2Nyb2xsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gdGFibGVTY3JvbGwucXVlcnlTZWxlY3RvcihcInRhYmxlXCIpO1xuICAgIGlmICghKHRhYmxlIGluc3RhbmNlb2YgSFRNTFRhYmxlRWxlbWVudCkpIHtcbiAgICAgICAgY29sdW1uUGFuLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGNvbHVtblBhbi5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcmV2ZWFsZWRcIik7XG4gICAgICAgIHNwYWNlci5zdHlsZS53aWR0aCA9IFwiMHB4XCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50V2lkdGggPSBNYXRoLm1heCh0YWJsZS5zY3JvbGxXaWR0aCwgdGFibGVTY3JvbGwuc2Nyb2xsV2lkdGgpO1xuICAgIHNwYWNlci5zdHlsZS53aWR0aCA9IGAke2NvbnRlbnRXaWR0aH1weGA7XG4gICAgY29uc3QgbmVlZHNIb3Jpem9udGFsU2Nyb2xsID0gY29udGVudFdpZHRoID4gdGFibGVTY3JvbGwuY2xpZW50V2lkdGggKyAxO1xuICAgIGNvbnN0IHdhc0hpZGRlbiA9IGNvbHVtblBhbi5oaWRkZW47XG4gICAgY29sdW1uUGFuLmhpZGRlbiA9ICFuZWVkc0hvcml6b250YWxTY3JvbGw7XG4gICAgaWYgKG5lZWRzSG9yaXpvbnRhbFNjcm9sbCAmJiAhZG9jdW1lbnQuYWN0aXZlRWxlbWVudD8uaXNTYW1lTm9kZSh0YWJsZUhTY3JvbGwpKSB7XG4gICAgICAgIHRhYmxlSFNjcm9sbC5zY3JvbGxMZWZ0ID0gdGFibGVTY3JvbGwuc2Nyb2xsTGVmdDtcbiAgICB9XG4gICAgaWYgKG5lZWRzSG9yaXpvbnRhbFNjcm9sbCAmJiB3YXNIaWRkZW4gJiYgIXJlc3VsdHNDb2x1bW5QYW5SZXZlYWxlZCkge1xuICAgICAgICByZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LmFkZChcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICB9LCAyNDApO1xuICAgIH1cbiAgICBpZiAoIW5lZWRzSG9yaXpvbnRhbFNjcm9sbCkge1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0TWF4TGV2ZWxEaXNwbGF5VXBkYXRlKCkge1xuICAgIGNvbnN0IGxldmVsRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxEaXNwbGF5XCIpO1xuICAgIGlmICghKGxldmVsRGlzcGxheSBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBsZXZlbHJhbmdlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgIGxldmVsRGlzcGxheS50ZXh0Q29udGVudCA9IGBNYXggbGV2ZWwgcmVxdWlyZW1lbnQ6ICR7bGV2ZWxyYW5nZS52YWx1ZX1gO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldERpc3BsYXlVcGRhdGVzKCkge1xuICAgIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpO1xuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIG5hbWVmaWx0ZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuXG4gICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBlbmNoYW50VG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBwcmlvcml0eUxpc3RJdGVtcyhwcmlvcml0eUxpc3QpKSB7XG4gICAgICAgICAgICBjb25zdCByZWdleCA9IGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA/IC9eKCg/OlN0cil8KD86U3RhKXwoPzpEZXgpfCg/OldpbGwpKSQvIDogL15NYXggKCg/OlN0cil8KD86U3RhKXwoPzpEZXgpfCg/OldpbGwpKSQvO1xuICAgICAgICAgICAgY29uc3QgcmVwbGFjZXIgPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyBcIk1heCAkMVwiIDogXCIkMVwiO1xuICAgICAgICAgICAgY29uc3QgbmV4dCA9IGdldFByaW9yaXR5U3RhdExhYmVsKG5vZGUpLnNwbGl0KFwiK1wiKS5tYXAocyA9PiBzLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VyKSkuam9pbihcIitcIik7XG4gICAgICAgICAgICBzZXRQcmlvcml0eVN0YXRMYWJlbChub2RlLCBuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbnNldERpc3BsYXlVcGRhdGVzKCk7XG5cbmZ1bmN0aW9uIHNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCkge1xuICAgIGNvbnN0IGZpbHRlclRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyVG9nZ2xlXCIpO1xuICAgIGNvbnN0IGNsb3NlRmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2VGaWx0ZXJzXCIpO1xuICAgIGNvbnN0IGZpbHRlclBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250cm9sUmFpbFwiKTtcbiAgICBjb25zdCBmaWx0ZXJCYWNrZHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyQmFja2Ryb3BcIik7XG4gICAgaWYgKCEoZmlsdGVyVG9nZ2xlIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoY2xvc2VGaWx0ZXJzIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyUGFuZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShmaWx0ZXJCYWNrZHJvcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvZ2dsZUJ1dHRvbiA9IGZpbHRlclRvZ2dsZTtcbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNsb3NlRmlsdGVycztcbiAgICBjb25zdCBwYW5lbCA9IGZpbHRlclBhbmVsO1xuICAgIGNvbnN0IGJhY2tkcm9wQnV0dG9uID0gZmlsdGVyQmFja2Ryb3A7XG5cbiAgICBmdW5jdGlvbiBzZXRPcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIGAke29wZW59YCk7XG4gICAgICAgIGJhY2tkcm9wQnV0dG9uLmhpZGRlbiA9ICFvcGVuO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJmaWx0ZXJzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICAgICAgaWYgKG5hbWVGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9jdXNBZnRlck9wZW4gPSAoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJvcGVydHlOYW1lICE9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgICAgICBuYW1lRmlsdGVyLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBmb2N1c0FmdGVyT3Blbik7XG4gICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4odHJ1ZSkpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgYmFja2Ryb3BCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4oZmFsc2UpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gXCJUYWJcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gQXJyYXkuZnJvbShwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHN1bW1hcnksIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICAgKSkuZmlsdGVyKGVsZW1lbnQgPT4gZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA+IDApO1xuICAgICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IGxhc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChldmVudC5zaGlmdEtleSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBmaXJzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsYXN0RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFldmVudC5zaGlmdEtleVxuICAgICAgICAgICAgJiYgKCFwYW5lbC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB8fCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBsYXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1pbi13aWR0aDogODgwcHgpXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKHsgbWF0Y2hlcyB9KSA9PiB7XG4gICAgICAgIGlmIChtYXRjaGVzICYmIHBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbnNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIHNldFJlc2V0RmlsdGVyQ29udHJvbCgpIHtcbiAgICBjb25zdCByZXNldEZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0RmlsdGVyc1wiKTtcbiAgICBjb25zdCByZWZpbmVtZW50U3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZpbmVtZW50U3RhdHVzXCIpO1xuICAgIGlmICghKHJlc2V0RmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKHJlZmluZW1lbnRTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNldEZpbHRlcnMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgcmVmaW5lbWVudFN0YXR1cy50ZXh0Q29udGVudCA9IFwiUmVzZXR0aW5nIGZpbHRlcnPigKZcIjtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5jbGVhcl9hbGwoKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xufVxuXG5zZXRSZXNldEZpbHRlckNvbnRyb2woKTtcblxuZnVuY3Rpb24gc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKSB7XG4gICAgY29uc3QgcHJpb3JpdHlfZ3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2dyb3VwXCIpO1xuICAgIGlmICghKHByaW9yaXR5X2dyb3VwIGluc3RhbmNlb2YgSFRNTEZpZWxkU2V0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlciBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBhcnRzU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdhY2hhU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRzR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik7XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBjb25zdCBsb2FkaW5nTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgY29uc3QgbG9hZGluZ0NvcHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2RldGFpbFwiKVxuICAgICAgICA/PyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2NvcHkgc3BhblwiKTtcbiAgICBjb25zdCBsb2FkaW5nR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfZ3JvdXBcIik7XG4gICAgaWYgKCEocmVzdWx0c1N0YXR1cyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdMYWJlbCBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0NvcHkgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcInRydWVcIik7XG4gICAgbG9hZGluZ0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJ0cnVlXCIpO1xuICAgIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCk7XG4gICAgcmVzdG9yZVNlbGVjdGlvbigpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGRvd25sb2FkSXRlbXMoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IFwiSXRlbSBkYXRhIHVuYXZhaWxhYmxlXCI7XG4gICAgICAgIGxvYWRpbmdMYWJlbC50ZXh0Q29udGVudCA9IFwiQ291bGQgbm90IGxvYWQgZXF1aXBtZW50IGRhdGFcIjtcbiAgICAgICAgbG9hZGluZ0NvcHkudGV4dENvbnRlbnQgPSBcIkNoZWNrIHRoZSBwcmV2aWV3IHNlcnZlciBjb25uZWN0aW9uLCB0aGVuIHJlbG9hZCB0aGlzIHBhZ2UuXCI7XG4gICAgICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGxvYWRpbmdHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzaG93X2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImhpZGVfYWZ0ZXJfbG9hZFwiKSkge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG1heExldmVsID0gZ2V0TWF4SXRlbUxldmVsKCk7XG4gICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGAke01hdGgubWluKHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpLCBtYXhMZXZlbCl9YDtcbiAgICBsZXZlbHJhbmdlLm1heCA9IGAke21heExldmVsfWA7XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICBsb2FkaW5nR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgIGxldmVscmFuZ2UuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJVc2UgdGhlIHVwL2Rvd24gYXJyb3dzLCBvciBkcmFnIGEgc3RhdCwgdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBtb3ZlIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVVwID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBpZiAocHJpb3JpdHlVcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICFwcmlvcml0eVVwLmRpc2FibGVkKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByaW9yaXR5VXAuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwidXBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5RG93biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAocHJpb3JpdHlEb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiYgIXByaW9yaXR5RG93bi5kaXNhYmxlZCkge1xuICAgICAgICBjb25zdCByb3cgPSBwcmlvcml0eURvd24uY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwiZG93blwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbFwiKTtcbiAgICBpZiAoZXhjbHVkZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdG9yZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIpO1xuICAgIGlmIChyZXN0b3JlQnV0dG9uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuLyoqXG4gKiBJbnNlcnQgYGNhbmRpZGF0ZWAgaW50byBhIGJlc3QtZmlyc3QgcmFua2luZy5cbiAqIEhpZ2hlciBjb21wYXJhdG9yIHZhbHVlcyBtZWFuIHRoZSBsZWZ0LWhhbmQgaXRlbSByYW5rcyBiZXR0ZXIuXG4gKiBFdmVyeSBjYW5kaWRhdGUgaXMgcmV0YWluZWQgc28gdGhlIFVJIGNhbiBzaG93IHRoZSBmdWxsIGZpbHRlcmVkIGludmVudG9yeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdEJ5UHJpb3JpdHk8VD4oXG4gICAgY3VycmVudDogVFtdLFxuICAgIGNhbmRpZGF0ZTogVCxcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBUW10ge1xuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgfVxuXG4gICAgbGV0IGluc2VydEF0ID0gY3VycmVudC5sZW5ndGg7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGN1cnJlbnQubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgIGxldCBkZWNpZGVkID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjb21wYXJhdG9yIG9mIGNvbXBhcmF0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wYXJhdG9yKGN1cnJlbnRbaW5kZXhdLCBjYW5kaWRhdGUpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGRlY2lkZWQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlY2lkZWQgPCAwKSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50W2luZGV4XSBpcyB3b3JzZSB0aGFuIGNhbmRpZGF0ZTogaW5zZXJ0IGJlZm9yZSBpdC5cbiAgICAgICAgICAgIGluc2VydEF0ID0gaW5kZXg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWNpZGVkID4gMDogY3VycmVudCBpdGVtIGlzIGJldHRlcjsga2VlcCBzY2FubmluZy5cbiAgICAgICAgLy8gZGVjaWRlZCA9PT0gMDogZXhhY3QgdGllOyBrZWVwIHNjYW5uaW5nIHNvIHRpZXMgc3RheSBzdGFibGUvRklGTy5cbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKDAsIGluc2VydEF0KSxcbiAgICAgICAgY2FuZGlkYXRlLFxuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKGluc2VydEF0KSxcbiAgICBdO1xufVxuIiwiLyoqIEludGVybmFsIHByaW9yaXR5IGtleXMg4oaSIHNob3J0IHRhYmxlIGhlYWRlciArIGh1bWFuIGZ1bGwgbmFtZSBmb3IgdG9vbHRpcHMuICovXG5jb25zdCBQUklPUklUWV9TVEFUX0hFQURFUl9BQkJSRVY6IFJlYWRvbmx5PFxuICAgIFJlY29yZDxzdHJpbmcsIHsgcmVhZG9ubHkgc2hvcnQ6IHN0cmluZzsgcmVhZG9ubHkgZnVsbDogc3RyaW5nIH0+XG4+ID0ge1xuICAgIFwiTW92IFNwZWVkXCI6IHsgc2hvcnQ6IFwiTVNcIiwgZnVsbDogXCJNb3YgU3BlZWRcIiB9LFxuICAgIFwiUXVpY2tzbG90c1wiOiB7IHNob3J0OiBcIlFTXCIsIGZ1bGw6IFwiUXVpY2sgU2xvdHNcIiB9LFxuICAgIFwiQnVmZnNsb3RzXCI6IHsgc2hvcnQ6IFwiQlNcIiwgZnVsbDogXCJCdWZmIFNsb3RzXCIgfSxcbn07XG5cbmV4cG9ydCB0eXBlIFByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkgPSB7XG4gICAgcmVhZG9ubHkgc2hvcnQ6IHN0cmluZztcbiAgICByZWFkb25seSBmdWxsOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgYWJicmV2aWF0ZWQ6IGJvb2xlYW47XG59O1xuXG4vKiogTWFwIGEgcHJpb3JpdHkgc3RhdCBrZXkgKG9yIGNvbWJpbmVkIFwiQStCXCIpIHRvIHNob3J0IGhlYWRlciB0ZXh0ICsgZnVsbCB0b29sdGlwIG5hbWUuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheShzdGF0OiBzdHJpbmcpOiBQcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IHtcbiAgICBjb25zdCBwYXJ0cyA9IHN0YXQuc3BsaXQoXCIrXCIpO1xuICAgIGNvbnN0IG1hcHBlZCA9IHBhcnRzLm1hcCgocGFydCkgPT4ge1xuICAgICAgICBjb25zdCBrbm93biA9IFBSSU9SSVRZX1NUQVRfSEVBREVSX0FCQlJFVltwYXJ0XTtcbiAgICAgICAgcmV0dXJuIGtub3duID8/IHsgc2hvcnQ6IHBhcnQsIGZ1bGw6IHBhcnQgfTtcbiAgICB9KTtcbiAgICBjb25zdCBzaG9ydCA9IG1hcHBlZC5tYXAoKHBhcnQpID0+IHBhcnQuc2hvcnQpLmpvaW4oXCIrXCIpO1xuICAgIGNvbnN0IGZ1bGwgPSBtYXBwZWQubWFwKChwYXJ0KSA9PiBwYXJ0LmZ1bGwpLmpvaW4oXCIrXCIpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNob3J0LFxuICAgICAgICBmdWxsLFxuICAgICAgICBhYmJyZXZpYXRlZDogc2hvcnQgIT09IGZ1bGwsXG4gICAgfTtcbn1cbiIsIi8qKlxuICogUmVzb2x2ZSB3aGljaCBib3NzIGd1YXJkaWFuKHMpIGFwcGVhciBvbiBhIEd1YXJkaWFuIC8gQm9zcyBzdGFnZS5cbiAqIERhdGEgY29tZXMgZnJvbSBKRlRTRSBHdWFyZGlhblN0YWdlcy5qc29uIChCb3NzR3VhcmRpYW4gKyBzaWRlIHBvb2xzKVxuICogYW5kIEJvc3NHdWFyZGlhbkluZm9fSW5pMy54bWwgLyBHdWFyZGlhbkluZm8ueG1sIG5hbWVzLlxuICovXG5cbmV4cG9ydCB0eXBlIFN0YWdlQm9zc0luZm8gPSB7XG4gICAgcmVhZG9ubHkgaWQ6IG51bWJlcjtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgcmVzSWQ/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgbGV2ZWw/OiBudW1iZXI7XG4gICAgcmVhZG9ubHkgaHBCYXNlPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VHdWFyZGlhbkluZm8gPSB7XG4gICAgcmVhZG9ubHkgaWQ6IG51bWJlcjtcbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NTaWRlUG9vbHMgPSB7XG4gICAgcmVhZG9ubHkgbGVmdDogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgcmVhZG9ubHkgbWlkZGxlOiByZWFkb25seSBudW1iZXJbXTtcbiAgICByZWFkb25seSByaWdodDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NTdGFnZUVudHJ5ID0ge1xuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICByZWFkb25seSBtYXBJZD86IG51bWJlciB8IG51bGw7XG4gICAgcmVhZG9ubHkgaXNCb3NzU3RhZ2U6IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgYm9zc0lkczogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgcmVhZG9ubHkgc2lkZUd1YXJkaWFuSWRzPzogU3RhZ2VCb3NzU2lkZVBvb2xzO1xuICAgIHJlYWRvbmx5IGV4cE11bHRpcGxpZXI/OiBudW1iZXIgfCBudWxsO1xuICAgIHJlYWRvbmx5IGJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHM/OiBudW1iZXIgfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgU3RhZ2VCb3NzQ2F0YWxvZyA9IHtcbiAgICByZWFkb25seSBib3NzZXM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBTdGFnZUJvc3NJbmZvPj47XG4gICAgcmVhZG9ubHkgZ3VhcmRpYW5zPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgU3RhZ2VHdWFyZGlhbkluZm8+PjtcbiAgICByZWFkb25seSBzdGFnZXM/OiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBTdGFnZUJvc3NTdGFnZUVudHJ5Pj47XG4gICAgcmVhZG9ubHkgYnlNYXBJZD86IFJlYWRvbmx5PFJlY29yZDxzdHJpbmcsIHJlYWRvbmx5IHN0cmluZ1tdPj47XG59O1xuXG5leHBvcnQgdHlwZSBTdGFnZUJvc3NQcm9qZWN0aW9uID0ge1xuICAgIHJlYWRvbmx5IHN0YWdlTmFtZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG1hcElkPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGlzQm9zc1N0YWdlOiBib29sZWFuO1xuICAgIC8qKiBQcmltYXJ5IGJvc3MgZ3VhcmRpYW5zIGZvciB0aGlzIHN0YWdlICh1bmlxdWUgYnkgaWQpLiAqL1xuICAgIHJlYWRvbmx5IGJvc3NlczogcmVhZG9ubHkgU3RhZ2VCb3NzSW5mb1tdO1xuICAgIC8qKiBVbmlxdWUgYm9zcyBkaXNwbGF5IG5hbWVzIChkZWR1cGVkLCBvcmRlci1wcmVzZXJ2aW5nKS4gKi9cbiAgICByZWFkb25seSBib3NzTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuICAgIC8qKiBTaWRlLWxhbmUgZ3VhcmRpYW4gbmFtZXMgdGhhdCBzcGF3biB3aXRoIHRoZSBib3NzIGJhdHRsZSAobGVmdC9yaWdodC9taWRkbGUpLiAqL1xuICAgIHJlYWRvbmx5IHNpZGVHdWFyZGlhbk5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbn07XG5cbmZ1bmN0aW9uIHVuaXF1ZU5hbWVzKG5hbWVzOiByZWFkb25seSBzdHJpbmdbXSk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3Qgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xuICAgICAgICBjb25zdCBrZXkgPSBuYW1lLnRyaW0oKTtcbiAgICAgICAgaWYgKCFrZXkgfHwgc2Vlbi5oYXMoa2V5KSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2Vlbi5hZGQoa2V5KTtcbiAgICAgICAgb3V0LnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUJvc3MoY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZywgaWQ6IG51bWJlcik6IFN0YWdlQm9zc0luZm8gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGVudHJ5ID0gY2F0YWxvZy5ib3NzZXM/LltgJHtpZH1gXTtcbiAgICBpZiAoZW50cnkgJiYgdHlwZW9mIGVudHJ5Lm5hbWUgPT09IFwic3RyaW5nXCIgJiYgZW50cnkubmFtZS50cmltKCkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBlbnRyeS5pZCA/PyBpZCxcbiAgICAgICAgICAgIG5hbWU6IGVudHJ5Lm5hbWUudHJpbSgpLFxuICAgICAgICAgICAgcmVzSWQ6IGVudHJ5LnJlc0lkLFxuICAgICAgICAgICAgbGV2ZWw6IGVudHJ5LmxldmVsLFxuICAgICAgICAgICAgaHBCYXNlOiBlbnRyeS5ocEJhc2UsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVHdWFyZGlhbk5hbWUoY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZywgaWQ6IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW50cnkgPSBjYXRhbG9nLmd1YXJkaWFucz8uW2Ake2lkfWBdO1xuICAgIGNvbnN0IG5hbWUgPSBlbnRyeT8ubmFtZT8udHJpbSgpO1xuICAgIHJldHVybiBuYW1lIHx8IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gc2lkZUlkcyhwb29sczogU3RhZ2VCb3NzU2lkZVBvb2xzIHwgdW5kZWZpbmVkKTogbnVtYmVyW10ge1xuICAgIGlmICghcG9vbHMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gWy4uLihwb29scy5sZWZ0ID8/IFtdKSwgLi4uKHBvb2xzLm1pZGRsZSA/PyBbXSksIC4uLihwb29scy5yaWdodCA/PyBbXSldO1xufVxuXG4vKipcbiAqIENhbmRpZGF0ZSBzdGFnZSBrZXlzIGZvciBhIGNoaXAgbGFiZWwgbWFwIG5hbWUuXG4gKiBCb3NzIMK3IEF0bGFudGlzIHVzZXMgYEF0bGFudGlzQm9zc2A7IHNvbWUgZHJvcHMgdXNlIGJhcmUgbWFwIG5hbWVzIHdpdGggbmVlZEJvc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZUJvc3NMb29rdXBLZXlzKG1hcE5hbWU6IHN0cmluZywgbmVlZEJvc3M6IGJvb2xlYW4pOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgY29uc3Qga2V5cyA9IFttYXBOYW1lXTtcbiAgICBpZiAobmVlZEJvc3MgJiYgIS9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKGAke21hcE5hbWV9Qm9zc2ApO1xuICAgIH1cbiAgICBpZiAoIW5lZWRCb3NzICYmIC9Cb3NzJC9pLnRlc3QobWFwTmFtZSkpIHtcbiAgICAgICAga2V5cy5wdXNoKG1hcE5hbWUucmVwbGFjZSgvQm9zcyQvaSwgXCJcIikpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gZW50cnlIYXNCb3NzZXMoZW50cnk6IFN0YWdlQm9zc1N0YWdlRW50cnkgfCB1bmRlZmluZWQpOiBlbnRyeSBpcyBTdGFnZUJvc3NTdGFnZUVudHJ5IHtcbiAgICByZXR1cm4gISFlbnRyeSAmJiBBcnJheS5pc0FycmF5KGVudHJ5LmJvc3NJZHMpICYmIGVudHJ5LmJvc3NJZHMubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTdGFnZUJvc3NFbnRyeShcbiAgICBtYXBOYW1lOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgY2F0YWxvZzogU3RhZ2VCb3NzQ2F0YWxvZyxcbik6IFN0YWdlQm9zc1N0YWdlRW50cnkgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHN0YWdlcyA9IGNhdGFsb2cuc3RhZ2VzO1xuICAgIGlmICghc3RhZ2VzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGtleXMgPSBzdGFnZUJvc3NMb29rdXBLZXlzKG1hcE5hbWUsIG5lZWRCb3NzKTtcbiAgICAvLyBQcmVmZXIgYW4gZW50cnkgdGhhdCBhY3R1YWxseSBsaXN0cyBCb3NzR3VhcmRpYW4gaWRzIChlLmcuIEF0bGFudGlzQm9zcyBvdmVyIEF0bGFudGlzKS5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gc3RhZ2VzW2tleV07XG4gICAgICAgIGlmIChlbnRyeUhhc0Jvc3NlcyhlbnRyeSkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBNYXBJZCBicmlkZ2U6IGJhcmUgbWFwIG5hbWVzIHNoYXJlIE1hcElkIHdpdGggdGhlIGJvc3Mtc3RhZ2Ugc2libGluZy5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGNvbnN0IHNlZWQgPSBzdGFnZXNba2V5XTtcbiAgICAgICAgaWYgKHNlZWQ/Lm1hcElkID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNpYmxpbmdzID0gY2F0YWxvZy5ieU1hcElkPy5bYCR7c2VlZC5tYXBJZH1gXSA/PyBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzaWJsaW5nTmFtZSBvZiBzaWJsaW5ncykge1xuICAgICAgICAgICAgY29uc3Qgc2libGluZyA9IHN0YWdlc1tzaWJsaW5nTmFtZV07XG4gICAgICAgICAgICBpZiAoZW50cnlIYXNCb3NzZXMoc2libGluZykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2libGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBMYXN0IHJlc29ydDogYW55IG1hdGNoaW5nIHN0YWdlIHJvdyAobm9uLWJvc3MgVGVtcGxlLCBldGMuKS5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGlmIChzdGFnZXNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWdlc1trZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUHJvamVjdCB0aGUgYm9zcyhlcykgYW5kIHNpZGUgZ3VhcmRpYW5zIGZvciBhIHN0YWdlIGNoaXAuXG4gKiBTdXBwb3J0cyBtdWx0aS1ib3NzIHN0YWdlcyB2aWEgYm9zc0lkc1tdIChKRlRTRSBjdXJyZW50bHkgc2hpcHMgb25lIEJvc3NHdWFyZGlhbiBwZXIgc3RhZ2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdFN0YWdlQm9zc2VzKFxuICAgIG1hcE5hbWU6IHN0cmluZyxcbiAgICBuZWVkQm9zczogYm9vbGVhbixcbiAgICBjYXRhbG9nOiBTdGFnZUJvc3NDYXRhbG9nLFxuKTogU3RhZ2VCb3NzUHJvamVjdGlvbiB7XG4gICAgY29uc3QgZW50cnkgPSBmaW5kU3RhZ2VCb3NzRW50cnkobWFwTmFtZSwgbmVlZEJvc3MsIGNhdGFsb2cpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YWdlTmFtZTogbWFwTmFtZSxcbiAgICAgICAgICAgIGlzQm9zc1N0YWdlOiBuZWVkQm9zcyxcbiAgICAgICAgICAgIGJvc3NlczogW10sXG4gICAgICAgICAgICBib3NzTmFtZXM6IFtdLFxuICAgICAgICAgICAgc2lkZUd1YXJkaWFuTmFtZXM6IFtdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGJvc3NlczogU3RhZ2VCb3NzSW5mb1tdID0gW107XG4gICAgY29uc3Qgc2VlbkJvc3NJZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGVudHJ5LmJvc3NJZHMgPz8gW10pIHtcbiAgICAgICAgaWYgKHNlZW5Cb3NzSWRzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlZW5Cb3NzSWRzLmFkZChpZCk7XG4gICAgICAgIGNvbnN0IGJvc3MgPSByZXNvbHZlQm9zcyhjYXRhbG9nLCBpZCk7XG4gICAgICAgIGlmIChib3NzKSB7XG4gICAgICAgICAgICBib3NzZXMucHVzaChib3NzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNpZGVHdWFyZGlhbk5hbWVzID0gdW5pcXVlTmFtZXMoXG4gICAgICAgIHNpZGVJZHMoZW50cnkuc2lkZUd1YXJkaWFuSWRzKVxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IHJlc29sdmVHdWFyZGlhbk5hbWUoY2F0YWxvZywgaWQpKVxuICAgICAgICAgICAgLmZpbHRlcigobik6IG4gaXMgc3RyaW5nID0+IHR5cGVvZiBuID09PSBcInN0cmluZ1wiKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhZ2VOYW1lOiBlbnRyeS5uYW1lLFxuICAgICAgICBtYXBJZDogdHlwZW9mIGVudHJ5Lm1hcElkID09PSBcIm51bWJlclwiID8gZW50cnkubWFwSWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlzQm9zc1N0YWdlOiAhIWVudHJ5LmlzQm9zc1N0YWdlLFxuICAgICAgICBib3NzZXMsXG4gICAgICAgIGJvc3NOYW1lczogdW5pcXVlTmFtZXMoYm9zc2VzLm1hcCgoYikgPT4gYi5uYW1lKSksXG4gICAgICAgIHNpZGVHdWFyZGlhbk5hbWVzLFxuICAgIH07XG59XG4iLCJleHBvcnQgdHlwZSBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzID0gbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbjtcblxudHlwZSBTdG9yYWdlX3ZhbHVlID0gYCR7XCJzXCIgfCBcIm5cIiB8IFwiYlwifSR7c3RyaW5nfWA7XG5cbmZ1bmN0aW9uIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyk6IFN0b3JhZ2VfdmFsdWUge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBgcyR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgcmV0dXJuIGBuJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gXCJiMVwiIDogXCJiMFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5nX3RvX3ZhcmlhYmxlKHZ2OiBTdG9yYWdlX3ZhbHVlKTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB7XG4gICAgY29uc3QgcHJlZml4ID0gdnZbMF07XG4gICAgY29uc3QgdmFsdWUgPSB2di5zdWJzdHJpbmcoMSk7XG4gICAgc3dpdGNoIChwcmVmaXgpIHtcbiAgICAgICAgY2FzZSAncyc6IC8vc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIGNhc2UgJ24nOiAvL251bWJlclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICBjYXNlICdiJzogLy9ib29sZWFuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IFwiMVwiID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBgaW52YWxpZCB2YWx1ZTogJHt2dn1gO1xufVxuXG5mdW5jdGlvbiBpc19zdG9yYWdlX3ZhbHVlKGtleTogc3RyaW5nKToga2V5IGlzIFN0b3JhZ2VfdmFsdWUge1xuICAgIHJldHVybiBrZXkubGVuZ3RoID49IDEgJiYgXCJzbmJcIi5pbmNsdWRlcyhrZXlbMF0pO1xufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFibGVfc3RvcmFnZSB7XG4gICAgc3RhdGljIGdldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdG9yZWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUoc3RvcmVkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdfdG9fdmFyaWFibGUoc3RvcmVkKTtcbiAgICB9XG4gICAgc3RhdGljIHNldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcsIHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCwgdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlKSk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWxldGVfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgfVxuICAgIHN0YXRpYyBjbGVhcl9hbGwoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHZhcmlhYmxlcygpIHtcbiAgICAgICAgbGV0IHJlc3VsdDogeyBba2V5OiBzdHJpbmddOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIH0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBzdHJpbmdfdG9fdmFyaWFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSJdfQ==
