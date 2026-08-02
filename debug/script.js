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
exports.parseShopNobuyProductIndexes = parseShopNobuyProductIndexes;
exports.prettyGuardianMapName = prettyGuardianMapName;
exports.projectGachaAcquisitionChannels = projectGachaAcquisitionChannels;
exports.stageChannelLabel = stageChannelLabel;
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
exports.download = download;
exports.downloadItems = downloadItems;
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
exports.shop_items = void 0;
var _html = require("./html");
var _gachaAcquisition = require("./gachaAcquisition");
var _priorityStatHeaders = require("./priorityStatHeaders");
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
      //console.info(`Item ${item.id} from gacha "${this.name}" ${this.gacha_index} has wrong character`);
      character = item.character;
    }
    this.shop_items.get(character).set(item, [probability, quantity_min, quantity_max]);
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
      gachaItem.name_en = apiItem.name;
      shop_items.set(apiItem.productIndex, gachaItem);
      if (purchasable) {
        gachaItem.sources.push(new ShopItemSource(apiItem.productIndex, apiItem.price0, apiItem.priceType === "MINT", inner_items));
      }
    } else {
      const otherItem = new Item();
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
  const max_shop_pages = 20; //currently need only 10, should be enough
  const shopURL = "/api/shop?size=1000&page=";
  const shopDatas = [...Array(max_shop_pages).keys()].map(n => download(`${shopURL}${n}`));
  const guardianURL = guardianSource + "/GuardianStages.json";
  const guardianData = download(guardianURL);
  parseItemData(await itemData);
  itemArtMap = JSON.parse(await itemArtData);
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
function showDialog(trigger, label, content, dialogClass) {
  const topDiv = document.getElementById("top_div");
  if (!(topDiv instanceof HTMLDivElement)) {
    return;
  }
  if (dialog) {
    dialog.close();
    dialog.remove();
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
    trigger.focus();
  }, {
    once: true
  });
  topDiv.appendChild(dialog);
  dialog.showModal();
}
function createPopupLink(text, content) {
  const button = (0, _html.createHTML)(["button", {
    class: "popup_link",
    type: "button",
    "aria-haspopup": "dialog",
    "aria-expanded": "false"
  }, text]);
  button.addEventListener("click", event => {
    event.stopPropagation();
    showDialog(button, `${text} details`, content);
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
  return createPopupLink(itemSource.item.name_en, [(0, _html.createHTML)(["a", itemSource.item.name_en, contentTable])]);
}
function prettyTime(seconds) {
  return `${Math.floor(seconds / 60)}:${`${seconds % 60}`.padStart(2, "0")}`;
}
function createGuardianPopup(item, itemSource) {
  const mapLabel = (0, _gachaAcquisition.stageChannelLabel)(itemSource.guardian_map, itemSource.need_boss);
  const content = [`Guardian map ${(0, _gachaAcquisition.prettyGuardianMapName)(itemSource.guardian_map)}`, (0, _html.createHTML)(["ul", {
    class: "layout"
  }, ["li", "Items:", ["ul", {
    class: "layout"
  }, ...itemSource.items.reduce((curr, reward_item) => [...curr, (0, _html.createHTML)(["li", {
    class: reward_item === item ? "highlighted" : ""
  }, reward_item.name_en])], [])]], ["li", `Requires boss: ${itemSource.need_boss ? "Yes" : "No"}`], ...(itemSource.boss_time > 0 ? [(0, _html.createHTML)(["li", `Boss time: ${prettyTime(itemSource.boss_time)}`])] : []), ["li", `EXP multiplier: ${itemSource.xp}`]])];
  return createPopupLink(mapLabel, content);
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

},{"./gachaAcquisition":2,"./html":3,"./priorityStatHeaders":7}],5:[function(require,module,exports){
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

},{"./checkboxTree":1,"./html":3,"./itemLookup":4,"./priority":6,"./storage":8}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJnYWNoYUFjcXVpc2l0aW9uLnRzIiwiaHRtbC50cyIsIml0ZW1Mb29rdXAudHMiLCJtYWluLnRzIiwicHJpb3JpdHkudHMiLCJwcmlvcml0eVN0YXRIZWFkZXJzLnRzIiwic3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBQSxLQUFBLEdBQUEsT0FBQTtBQUlBLFNBQVMsV0FBVyxDQUFDLElBQXNCO0VBQ3ZDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhO0VBQ3BDLElBQUksRUFBRSxTQUFTLFlBQVksYUFBYSxDQUFDLEVBQUU7SUFDdkMsT0FBTyxFQUFFO0VBQ2I7RUFDQSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsYUFBYTtFQUN6QyxJQUFJLEVBQUUsU0FBUyxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDMUMsT0FBTyxFQUFFO0VBQ2I7RUFDQSxLQUFLLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUU7SUFDM0UsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLFNBQVMsRUFBRTtNQUM5QztJQUNKO0lBQ0EsTUFBTSxxQkFBcUIsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdFLElBQUksRUFBRSxxQkFBcUIsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQ3REO0lBQ0o7SUFDQSxPQUFPLEtBQUssQ0FDUCxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQ3BDLE1BQU0sQ0FBRSxDQUFDLElBQXlCLENBQUMsWUFBWSxhQUFhLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFD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Q0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssUUFBUTtjQUNULElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUTtjQUNwQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKO2NBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxFQUFFLENBQUM7VUFDbkQ7VUFDQTtRQUNKLEtBQUssT0FBTztVQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUM1QjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssT0FBTztVQUNSLElB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LEtBQUssUUFBUSxFQUNqQyxPQUFPLEdBQUcsQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUNqQyxPQUFPLEdBQUcsQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUNqQyxPQUFPLEdBQUcsQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUNqQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUM5QixPQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUM5QixPQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUM5QixPQUFPLEdBQUcsQ0FBQyxXQUFXLEtBQUssUUFBUSxFQUNuQyxPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUNoQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUM1QixPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUNoQyxPQUFPLEdBQUcsQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUNyQyxPQUFPLEdBQUcsQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUNqQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUNoQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25CO0FBRUE7QUFDQSxJQUFJLHVCQUF1QixHQUF3QixJQUFJLEdBQUcsRUFBRTtBQUU1RCxTQUFTLGlCQUFpQixDQUFDLFlBQW9CLEVBQUUsT0FBZ0I7RUFDN0QsT0FBTyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO0FBQ2hFO0FBRUEsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFZO0VBQ2xDLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLElBQUksRUFBRSxDQUFDO01BQ2xEO0lBQ0o7SUFFQSxNQUFNLFdBQVcsR0FBRyxDQUNoQixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsS0FBSyxFQUNiLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsS0FBSyxDQUNoQixDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBRS9ELE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUU1RSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO01BQzlCLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDMUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN4RCxDQUFDLE1BQ0k7UUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJO1FBQzNCLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUM7TUFDOUM7TUFDQTtNQUNBLElBQUksV0FBVyxFQUFFO1FBQ2IsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxTQUFTLEtBQUssTUFBTSxFQUFFLFdBQVcsQ0FBQztRQUN0SCxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRTtVQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDakM7TUFDSjtJQUNKLENBQUMsTUFDSSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO01BQ3JDLE1BQU0sQ0FBQyxHQUFHLENBQ04sT0FBTyxDQUFDLFlBQVksRUFDcEIsSUFBSSxLQUFLLENBQ0wsT0FBTyxDQUFDLFlBQVksRUFDcEIsT0FBTyxDQUFDLEtBQUssRUFDYixPQUFPLENBQUMsSUFBSSxFQUNaLE9BQU8sQ0FBQyxNQUFNLEVBQ2QsT0FBTyxDQUFDLFNBQVMsS0FBSyxNQUFNLEVBQzVCLE9BQU8sQ0FBQyxPQUFPLEVBQ2YsV0FBVyxDQUNkLENBQ0o7TUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRTtNQUM1QixTQUFTLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJO01BQ2hDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUM7TUFDL0MsSUFBSSxXQUFXLEVBQUU7UUFDYixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFNBQVMsS0FBSyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7TUFDL0g7SUFDSixDQUFDLE1BQ0k7TUFDRCxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRTtNQUM1QixTQUFTLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJO01BQ2hDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUM7SUFDbkQ7RUFFSjtBQUNKO0FBRUEsU0FBUyxjQUFjLENBQUMsSUFBWSxFQUFFLEtBQVk7RUFDOUMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFO01BQ2pDO0lBQ0o7SUFDQSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDJPQUEyTyxDQUFDO0lBQ3JRLElBQUksQ0FBQyxLQUFLLEVBQUU7TUFDUixPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixLQUFLLENBQUMsV0FBVyxNQUFNLElBQUksRUFBRSxDQUFDO01BQ25FO0lBQ0o7SUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtNQUNmO0lBQ0o7SUFDQSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVM7SUFDdEMsSUFBSSxTQUFTLEtBQUssUUFBUSxFQUFFO01BQ3hCLFNBQVMsR0FBRyxRQUFRO0lBQ3hCO0lBQ0EsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRTtNQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixTQUFTLHFCQUFxQixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7TUFDM0Y7SUFDSjtJQUNBLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0QsSUFBSSxDQUFDLElBQUksRUFBRTtNQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxvQkFBb0IsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO01BQ3ZHO0lBQ0o7SUFDQSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7RUFDOUk7RUFDQSxLQUFLLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO0lBQ3BDLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLEdBQUcsRUFBRTtNQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDNUQ7RUFDSjtBQUNKO0FBRUEsU0FBUyxpQkFBaUIsQ0FBQyxJQUFZO0VBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0VBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO0lBQzlCO0VBQ0o7RUFDQSxTQUFTLFNBQVMsQ0FBQyxDQUFNO0lBQ3JCLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO01BQ3ZCLE9BQU8sQ0FBQztJQUNaO0VBQ0o7RUFDQSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBa0I7RUFDOUMsS0FBSyxNQUFNLE9BQU8sSUFBSSxZQUFZLEVBQUU7SUFDaEMsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7TUFDN0I7SUFDSjtJQUNBLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJO0lBQzdCLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO01BQzlCO0lBQ0o7SUFDQSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7SUFDMUUsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUN2QixNQUFNLENBQUUsT0FBTyxJQUF3QixPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUM5RixHQUFHLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFFLENBQUM7SUFDN0MsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO0lBQzNELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVztJQUN6QyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDM0MsSUFBSSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xGLElBQUkseUJBQXlCLEtBQUssQ0FBQyxDQUFDLEVBQUU7TUFDbEMseUJBQXlCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQyxNQUNJO01BQ0QsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQ2IsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUseUJBQXlCLENBQUM7TUFDdEQ7SUFDSjtJQUNBLEtBQUssTUFBTSxJQUFJLElBQUksWUFBWSxFQUFFO01BQzdCLE1BQU0sY0FBYyxHQUFHLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixDQUFDO01BQzVILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUNyQztFQUNKO0FBQ0o7QUFhQTs7Ozs7QUFLTSxTQUFVLHNCQUFzQixDQUFDLE9BQWlDO0VBQ3BFLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRO0VBQ2pDLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO0lBQzNDO0VBQ0o7RUFDQSxLQUFLLE1BQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUN4RCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtNQUN6RDtJQUNKO0lBQ0EsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7SUFDekMsSUFBSSxDQUFDLElBQUksRUFBRTtNQUNQO0lBQ0o7SUFDQSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FDeEIsSUFBSSxDQUFDLE9BQU8sQ0FDUCxNQUFNLENBQUUsTUFBTSxJQUFtQyxNQUFNLFlBQVksa0JBQWtCLENBQUMsQ0FDdEYsR0FBRyxDQUFFLE1BQU0sSUFBSyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQzVDO0lBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7TUFDdEIsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksQ0FBQyxHQUFHLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNoRTtNQUNKO01BQ0EsSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUM1QjtNQUNKO01BQ0EsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO01BQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNiLElBQUksa0JBQWtCLENBQ2xCLElBQUksQ0FBQyxHQUFHLEVBQ1IsQ0FBQyxJQUFJLENBQUMsRUFDTixPQUFPLElBQUksQ0FBQyxFQUFFLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUN6QyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFDZixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQ3pELENBQ0o7SUFDTDtFQUNKO0FBQ0o7QUFFQTtBQUNNLFNBQVUsa0JBQWtCLENBQUMsR0FBVztFQUMxQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7SUFDNUIsT0FBTztNQUNILEtBQUssRUFBRSw4QkFBOEI7TUFDckMsTUFBTSxFQUFFO0tBQ1g7RUFDTDtFQUNBLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtJQUMzQixPQUFPO01BQ0gsS0FBSyxFQUFFLHlCQUF5QjtNQUNoQyxNQUFNLEVBQUU7S0FDWDtFQUNMO0VBQ0EsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO0lBQ3ZFLE9BQU87TUFDSCxLQUFLLEVBQUUsd0JBQXdCO01BQy9CLE1BQU0sRUFBRTtLQUNYO0VBQ0w7RUFDQSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtJQUNyRCxPQUFPO01BQ0gsS0FBSyxFQUFFLHVCQUF1QjtNQUM5QixNQUFNLEVBQUU7S0FDWDtFQUNMO0VBQ0EsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7SUFDeEQsT0FBTztNQUNILEtBQUssRUFBRSxvQkFBb0I7TUFDM0IsTUFBTSxFQUFFO0tBQ1g7RUFDTDtFQUNBLE9BQU87SUFDSCxLQUFLLEVBQUUsNEJBQTRCO0lBQ25DLE1BQU0sRUFBRTtHQUNYO0FBQ0w7QUFFQSxTQUFTLGVBQWUsQ0FBQyxHQUFXO0VBQ2hDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztFQUNyQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztFQUNoRCxJQUFJLEtBQUssWUFBWSxXQUFXLEVBQUU7SUFDOUIsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsS0FBSztFQUNuQztFQUNBLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUM7RUFDL0QsSUFBSSxNQUFNLFlBQVksV0FBVyxFQUFFO0lBQy9CLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU07RUFDckM7QUFDSjtBQUVPLGVBQWUsUUFBUSxDQUFDLEdBQVc7RUFDdEMsZUFBZSxDQUFDLEdBQUcsQ0FBQztFQUNwQixNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUM7RUFDOUIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUM7RUFDMUQsSUFBSSxXQUFXLFlBQVksbUJBQW1CLEVBQUU7SUFDNUMsV0FBVyxDQUFDLEtBQUssRUFBRTtFQUN2QjtFQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFO0lBQ1g7SUFDQSxNQUFNLElBQUksS0FBSyxDQUNYLHNCQUFzQixHQUFHLEtBQUssS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUNoRztFQUNMO0VBQ0EsT0FBTyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ3ZCO0FBRU8sZUFBZSxhQUFhLENBQUE7RUFDL0IsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUM7RUFDMUQsSUFBSSxXQUFXLFlBQVksbUJBQW1CLEVBQUU7SUFDNUMsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDO0lBQ3JCLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRztFQUN6QjtFQUNBLE1BQU0sVUFBVSxHQUFHLG9HQUFvRztFQUN2SCxNQUFNLFdBQVcsR0FBRyw0R0FBNEc7RUFDaEksTUFBTSxjQUFjLEdBQUcsb0dBQW9HO0VBQzNILE1BQU0sT0FBTyxHQUFHLFVBQVUsR0FBRyxzQkFBc0I7RUFDbkQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztFQUNsQztFQUNBLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxpQ0FBaUMsQ0FBQztFQUNqRTtFQUNBLE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLGtDQUFrQyxDQUFDO0VBQzFFLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQztFQUN6RCxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQztFQUMzQixNQUFNLE9BQU8sR0FBRywyQkFBMkI7RUFDM0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDeEYsTUFBTSxXQUFXLEdBQUcsY0FBYyxHQUFHLHNCQUFzQjtFQUMzRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO0VBQzFDLGFBQWEsQ0FBQyxNQUFNLFFBQVEsQ0FBQztFQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLFdBQVcsQ0FBZTtFQUN4RCxJQUFJO0lBQ0EsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLGFBQWEsQ0FFL0M7SUFDRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FDakQsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUUsQ0FBQyxJQUFrQixPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsR0FDMUUsRUFBRTtJQUNSLHVCQUF1QixHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQztFQUM5QyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUU7SUFDUixPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEVBQUUsQ0FBQztJQUNyRCx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBRTtFQUN2QztFQUNBLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFFN0UsSUFBSSxXQUFXLFlBQVksbUJBQW1CLEVBQUU7SUFDNUMsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDO0lBQ3JCLFdBQVcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDO0VBQ3JDO0VBQ0EsTUFBTSxXQUFXLEdBQXVDLEVBQUU7RUFDMUQsS0FBSyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksTUFBTSxFQUFFO0lBQzVCLE1BQU0sU0FBUyxHQUFHLEdBQUcsV0FBVyxhQUFhLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU07SUFDMUYsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7RUFDN0Q7RUFDQSxpQkFBaUIsQ0FBQyxNQUFNLFlBQVksQ0FBQztFQUNyQyxJQUFJO0lBQ0Esc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLHFCQUFxQixDQUE2QixDQUFDO0VBQy9GLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsRUFBRSxDQUFDO0VBQzVEO0VBQ0EsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxXQUFXLEVBQUU7SUFDaEQsSUFBSTtNQUNBLGNBQWMsQ0FBQyxNQUFNLElBQUksRUFBRSxLQUFLLENBQUM7SUFDckMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsU0FBUyxZQUFZLENBQUMsRUFBRSxDQUFDO0lBQ2hFO0VBQ0o7QUFDSjtBQUVBO0FBQ0EsU0FBUyxpQkFBaUIsQ0FBQTtFQUN0QixNQUFNLEVBQUUsR0FBRyw0QkFBNEI7RUFDdkMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDO0VBQy9DLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDO0VBQy9DLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztFQUN4QyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUM7RUFDL0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDO0VBQ2hDLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztFQUN2QyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUM7RUFFdEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDO0VBQ3JELE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztFQUMvQixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7RUFDL0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQzdCLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztFQUNuQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUM7RUFDN0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDO0VBRXhDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztFQUNsRCxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7RUFDN0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDO0VBQzdCLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztFQUM5QixLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7RUFDOUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDO0VBQzVDLEtBQUssQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztFQUN2QyxLQUFLLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQztFQUU3QyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7RUFDekIsT0FBTyxHQUFHO0FBQ2Q7QUFFQSxTQUFTLGFBQWEsQ0FBQyxJQUFVLEVBQUUsU0FBcUI7RUFDcEQsTUFBTSxZQUFZLEdBQUcsV0FBVyxJQUFJLENBQUMsT0FBTyxlQUFlO0VBQzNELE1BQU0sYUFBYSxHQUFHLElBQUEsZ0JBQVUsRUFBQyxDQUM3QixRQUFRLEVBQ1I7SUFDSSxLQUFLLEVBQUUsY0FBYztJQUNyQixpQkFBaUIsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDL0IsWUFBWSxFQUFFLFlBQVk7SUFDMUIsSUFBSSxFQUFFLFFBQVE7SUFDZCxLQUFLLEVBQUU7R0FDVixDQUNKLENBQUM7RUFDRixhQUFhLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7RUFFekMsT0FBTyxJQUFBLGdCQUFVLEVBQUMsQ0FDZCxLQUFLLEVBQ0w7SUFBRSxLQUFLLEVBQUU7RUFBZSxDQUFFLEVBQzFCLGFBQWEsRUFDYixDQUNJLEtBQUssRUFDTDtJQUFFLEtBQUssRUFBRTtFQUFxQixDQUFFLEVBQ2hDLHdCQUF3QixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFDekMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQ3BDLENBQ0osQ0FBQztBQUNOO0FBRUEsU0FBUyxVQUFVLENBQ2YsT0FBMEIsRUFDMUIsS0FBYSxFQUNiLE9BQXdELEVBQ3hELFdBQW9CO0VBRXBCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO0VBQ2pELElBQUksRUFBRSxNQUFNLFlBQVksY0FBYyxDQUFDLEVBQUU7SUFDckM7RUFDSjtFQUNBLElBQUksTUFBTSxFQUFFO0lBQ1IsTUFBTSxDQUFDLEtBQUssRUFBRTtJQUNkLE1BQU0sQ0FBQyxNQUFNLEVBQUU7RUFDbkI7RUFDQSxNQUFNLFdBQVcsR0FBRyxJQUFBLGdCQUFVLEVBQUMsQ0FDM0IsUUFBUSxFQUNSO0lBQ0ksS0FBSyxFQUFFLFdBQVcsR0FBRyxHQUFHLFdBQVcsU0FBUyxHQUFHLGVBQWU7SUFDOUQsSUFBSSxFQUFFO0dBQ1QsRUFDRCxPQUFPLENBQ1YsQ0FBQztFQUNGLE1BQU0sVUFBVSxHQUFHO0lBQ2YsSUFBSSxXQUFXLEdBQUc7TUFBRSxLQUFLLEVBQUU7SUFBVyxDQUFFLEdBQUcsRUFBRSxDQUFDO0lBQzlDLFlBQVksRUFBRTtHQUNqQjtFQUNELE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUN6QixJQUFBLGdCQUFVLEVBQUMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQzNELElBQUEsZ0JBQVUsRUFBQyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0VBQzlELE9BQU8sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQztFQUM3QyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU0sTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0VBQzVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBSztJQUNsQyxPQUFPLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUM7SUFDOUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtJQUNoQixNQUFNLEdBQUcsU0FBUztJQUNsQixPQUFPLENBQUMsS0FBSyxFQUFFO0VBQ25CLENBQUMsRUFBRTtJQUFFLElBQUksRUFBRTtFQUFJLENBQUUsQ0FBQztFQUNsQixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztFQUMxQixNQUFNLENBQUMsU0FBUyxFQUFFO0FBQ3RCO0FBRU0sU0FBVSxlQUFlLENBQUMsSUFBWSxFQUFFLE9BQXdEO0VBQ2xHLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQVUsRUFBQyxDQUN0QixRQUFRLEVBQ1I7SUFDSSxLQUFLLEVBQUUsWUFBWTtJQUNuQixJQUFJLEVBQUUsUUFBUTtJQUNkLGVBQWUsRUFBRSxRQUFRO0lBQ3pCLGVBQWUsRUFBRTtHQUNwQixFQUNELElBQUksQ0FDUCxDQUFDO0VBQ0YsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRyxLQUFLLElBQUk7SUFDdkMsS0FBSyxDQUFDLGVBQWUsRUFBRTtJQUN2QixVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxVQUFVLEVBQUUsT0FBTyxDQUFDO0VBQ2xELENBQUMsQ0FBQztFQUNGLE9BQU8sTUFBTTtBQUNqQjtBQUVBLFNBQVMsNEJBQTRCLENBQUMsSUFBWTtFQUM5QyxNQUFNO0lBQUUsS0FBSztJQUFFLElBQUk7SUFBRTtFQUFXLENBQUUsR0FBRyxJQUFBLDhDQUF5QixFQUFDLElBQUksQ0FBQztFQUNwRSxJQUFJLENBQUMsV0FBVyxFQUFFO0lBQ2QsT0FBTyxJQUFBLGdCQUFVLEVBQUMsQ0FBQyxJQUFJLEVBQUU7TUFBRSxLQUFLLEVBQUUsU0FBUztNQUFFLEtBQUssRUFBRTtJQUFLLENBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUN4RTtFQUNBLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBQSxnQkFBVSxFQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDN0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDO0VBQ2pDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQztFQUN0QyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztFQUMzQyxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxTQUFTO0lBQUUsS0FBSyxFQUFFO0VBQUssQ0FBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3hFO0FBRUEsU0FBUyxjQUFjLENBQUMsWUFBb0IsRUFBRSxZQUFvQjtFQUM5RCxJQUFJLFlBQVksS0FBSyxDQUFDLElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtJQUMxQyxPQUFPLEVBQUU7RUFDYjtFQUNBLElBQUksWUFBWSxLQUFLLFlBQVksRUFBRTtJQUMvQixPQUFPLE1BQU0sWUFBWSxFQUFFO0VBQy9CO0VBQ0EsT0FBTyxNQUFNLFlBQVksSUFBSSxZQUFZLEVBQUU7QUFDL0M7QUFFQTs7Ozs7O0FBTU0sU0FBVSx1QkFBdUIsQ0FDbkMsS0FBWSxFQUNaLGVBQXNCLEVBQ3RCLFNBQXFCO0VBRXJCLE1BQU0sT0FBTyxHQUFHLElBQUEsZ0JBQVUsRUFBQyxDQUN2QixPQUFPLEVBQ1AsQ0FDSSxJQUFJLEVBQ0osQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQ2QsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQ2hCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQzNCLENBQ0osQ0FBQztFQVNGO0VBQ0E7RUFDQSxNQUFNLE1BQU0sR0FBRyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWEsR0FBRyxTQUFTO0VBQzNELE1BQU0sTUFBTSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWU7RUFFN0QsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLEtBQUssU0FBUyxHQUFHLFVBQVUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0lBQ25FLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztJQUM3QyxJQUFJLENBQUMsVUFBVSxFQUFFO01BQ2I7SUFDSjtJQUNBLEtBQUssTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsSUFBSSxVQUFVLEVBQUU7TUFDL0U7TUFDQTtNQUNBO01BQ0EsTUFBTSxZQUFZLEdBQUcsU0FBUyxLQUFLLFNBQVMsR0FDdEMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsR0FDdEMsQ0FBQyxNQUFLO1FBQ0osTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLFNBQVMsSUFBSSxTQUFTO1FBQzdELE9BQU8sY0FBYyxHQUNmLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFFLEdBQ2hELEtBQUssQ0FBQyxpQkFBaUI7TUFDakMsQ0FBQyxFQUFDLENBQUU7TUFDUixNQUFNLFdBQVcsR0FBRyxPQUFPLEdBQUcsWUFBWTtNQUUxQyxJQUFJLE1BQU0sRUFBRTtRQUNSLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFO1VBQ3hCLElBQUksRUFBRSxlQUFlO1VBQ3JCLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLElBQUksQ0FBQyxJQUFJLFdBQVc7VUFDdkQsWUFBWTtVQUNaO1NBQ0gsQ0FBQztRQUNGO01BQ0o7TUFFQSxNQUFNLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQyxPQUFPLEtBQUssWUFBWSxLQUFLLFlBQVksRUFBRTtNQUMxRSxJQUFJLENBQUMsTUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQixNQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtVQUNiLElBQUksRUFBRSxlQUFlO1VBQ3JCLFdBQVc7VUFDWCxZQUFZO1VBQ1o7U0FDSCxDQUFDO01BQ047SUFDSjtFQUNKO0VBRUEsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2xFLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO0lBQ3BCLE1BQU0sV0FBVyxHQUFHLGVBQWUsS0FBSyxTQUFTLEtBQzdDLGVBQWUsS0FBSyxHQUFHLENBQUMsSUFBSSxJQUV4QixTQUFTLEtBQUssU0FBUyxJQUNwQixlQUFlLENBQUMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FDM0MsQ0FDSjtJQUNELE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBQSxnQkFBVSxFQUFDLENBQzNCLElBQUksRUFDSixXQUFXLEdBQUc7TUFBRSxLQUFLLEVBQUU7SUFBYSxDQUFFLEdBQUcsRUFBRSxFQUMzQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFDNUUsQ0FBQyxJQUFJLEVBQUU7TUFBRSxLQUFLLEVBQUU7SUFBUyxDQUFFLEVBQUUsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUMxRSxDQUFDLElBQUksRUFBRTtNQUFFLEtBQUssRUFBRTtJQUFTLENBQUUsRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQzFFLENBQUMsQ0FBQztFQUNQO0VBRUEsT0FBTyxPQUFPO0FBQ2xCO0FBRUEsU0FBUyxzQkFBc0IsQ0FBQyxJQUFzQixFQUFFLFVBQXNCLEVBQUUsU0FBcUI7RUFDakcsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO0VBQzVDLElBQUksQ0FBQyxLQUFLLEVBQUU7SUFDUixNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE9BQU8sZUFBZSxDQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFDdkIsdUJBQXVCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FDbEQ7QUFDTDtBQUVBLFNBQVMsb0JBQW9CLENBQUMsSUFBVSxFQUFFLFVBQTBCO0VBQ2hFLE1BQU0sWUFBWSxHQUFHLElBQUEsZ0JBQVUsRUFBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEUsS0FBSyxNQUFNLFVBQVUsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO0lBQ3ZDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBQSxnQkFBVSxFQUFDLENBQUMsSUFBSSxFQUFFLFVBQVUsS0FBSyxJQUFJLEdBQUc7TUFBRSxLQUFLLEVBQUU7SUFBYSxDQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakk7RUFDQSxPQUFPLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0c7QUFFQSxTQUFTLFVBQVUsQ0FBQyxPQUFlO0VBQy9CLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQzlFO0FBRUEsU0FBUyxtQkFBbUIsQ0FBQyxJQUFVLEVBQUUsVUFBOEI7RUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBQSxtQ0FBaUIsRUFBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUM7RUFDakYsTUFBTSxPQUFPLEdBQUcsQ0FDWixnQkFBZ0IsSUFBQSx1Q0FBcUIsRUFBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFDaEUsSUFBQSxnQkFBVSxFQUNOLENBQ0ksSUFBSSxFQUFFO0lBQUUsS0FBSyxFQUFFO0VBQVEsQ0FBRSxFQUN6QixDQUFDLElBQUksRUFBRSxRQUFRLEVBQ1gsQ0FBQyxJQUFJLEVBQUU7SUFBRSxLQUFLLEVBQUU7RUFBUSxDQUFFLEVBQ3RCLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQ3RCLENBQUMsSUFBSSxFQUFFLFdBQVcsS0FDZCxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUEsZ0JBQVUsRUFBQyxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxXQUFXLEtBQUssSUFBSSxHQUFHLGFBQWEsR0FBRztFQUFFLENBQUUsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUM1RyxFQUE4QixDQUNqQyxDQUNKLENBQ0osRUFDRCxDQUFDLElBQUksRUFBRSxrQkFBa0IsVUFBVSxDQUFDLFNBQVMsR0FBRyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFDL0QsSUFBSSxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLElBQUksRUFBRSxjQUFjLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFDM0csQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUM3QyxDQUNKLENBQ0o7RUFDRCxPQUFPLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDO0FBQzdDO0FBRUEsU0FBUyx5QkFBeUIsQ0FDOUIsSUFBVSxFQUNWLFlBQWlELEVBQ2pELFNBQXFCO0VBQ3JCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FDNUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUNwQixHQUFHLENBQUMsVUFBVSxJQUFJLGlCQUFpQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDMUU7QUFFQSxTQUFTLGtCQUFrQixDQUFDLE9BQW9CO0VBQzVDO0VBQ0E7RUFDQSxNQUFNLEdBQUcsR0FBRyxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssUUFBUSxHQUMzQyxPQUFPLENBQUMsU0FBUyxHQUNqQixPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7RUFDekMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDM0M7QUFFQSxTQUFTLGtCQUFrQixDQUFDLFFBQTJDO0VBQ25FLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FDZixPQUFPLElBQ0osT0FBTyxPQUFPLEtBQUssUUFBUSxJQUN4QixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FDdEU7QUFDTDtBQUVBLFNBQVMsZUFBZSxDQUFDLElBQWdDO0VBQ3JELE1BQU0sTUFBTSxHQUE2QixFQUFFO0VBQzNDLFNBQVMsR0FBRyxDQUFDLE9BQTZCO0lBQ3RDLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO01BQzlFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU87TUFDL0Q7SUFDSjtJQUNBLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0VBQ3hCO0VBQ0EsSUFBSSxhQUE0RDtFQUNoRSxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksRUFBRTtJQUN6QixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO01BQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUM7TUFDUjtJQUNKO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsSUFDSSxhQUFhLEtBQUssU0FBUyxJQUN4QixDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUNsQyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUNsQztNQUNFLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDYjtJQUNBLGFBQWEsR0FBRyxRQUFRO0lBQ3hCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO01BQzVCLElBQUksT0FBTyxLQUFLLEVBQUUsRUFBRTtRQUNoQjtNQUNKO01BQ0EsR0FBRyxDQUFDLE9BQU8sQ0FBQztJQUNoQjtFQUNKO0VBQ0EsT0FBTyxNQUFNO0FBQ2pCO0FBRUEsU0FBUyxxQkFBcUIsQ0FBQyxVQUFzQjtFQUNqRCxJQUFJLFVBQVUsWUFBWSxjQUFjLElBQUksVUFBVSxZQUFZLGtCQUFrQixFQUFFO0lBQ2xGLE9BQU8sSUFBSTtFQUNmO0VBQ0EsSUFBSSxVQUFVLFlBQVksZUFBZSxFQUFFO0lBQ3ZDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUM1QyxJQUFJLEtBQUssRUFBRSxPQUFPLEVBQUU7TUFDaEIsT0FBTyxJQUFJO0lBQ2Y7SUFDQSxLQUFLLE1BQU0sTUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO01BQzFDLElBQUksTUFBTSxLQUFLLFVBQVUsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN4RCxPQUFPLElBQUk7TUFDZjtJQUNKO0lBQ0EsT0FBTyxLQUFLO0VBQ2hCO0VBQ0EsT0FBTyxLQUFLO0FBQ2hCO0FBRU0sU0FBVSx3QkFBd0IsQ0FBQyxJQUFVO0VBQy9DLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtJQUMvQixJQUFJLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxFQUFFO01BQy9CLE9BQU8sSUFBSTtJQUNmO0VBQ0o7RUFDQSxPQUFPLEtBQUs7QUFDaEI7QUFFQSxTQUFTLDJCQUEyQixDQUFDLElBQVU7RUFDM0MsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtJQUNoQyxPQUFPLEVBQUU7RUFDYjtFQUNBLE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQ2QsTUFBTSxFQUNOO0lBQ0ksS0FBSyxFQUFFLGtEQUFrRDtJQUN6RCxLQUFLLEVBQUU7R0FDVixFQUNELGFBQWEsQ0FDaEIsQ0FBQztBQUNOO0FBRUEsU0FBUyx3QkFBd0IsQ0FBQyxJQUFzQjtFQUNwRCxJQUFJLENBQUMsSUFBSSxFQUFFO0lBQ1AsT0FBTyxFQUFFO0VBQ2I7RUFDQSxNQUFNLE1BQU0sR0FBdUIsRUFBRTtFQUNyQyxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7SUFDL0IsSUFBSSxNQUFNLFlBQVksY0FBYyxFQUFFO01BQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFBRSxJQUFJLEVBQUUsTUFBTTtRQUFFLEVBQUUsRUFBRSxNQUFNLENBQUM7TUFBRSxDQUFFLENBQUM7SUFDaEQsQ0FBQyxNQUFNLElBQUksTUFBTSxZQUFZLGtCQUFrQixFQUFFO01BQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDUixJQUFJLEVBQUUsT0FBTztRQUNiLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWTtRQUN4QixRQUFRLEVBQUUsTUFBTSxDQUFDO09BQ3BCLENBQUM7SUFDTjtFQUNKO0VBQ0EsT0FBTyxNQUFNO0FBQ2pCO0FBRUEsU0FBUywyQkFBMkIsQ0FDaEMsUUFBdUIsRUFDdkIsU0FBa0IsRUFDbEIsTUFBeUM7RUFFekMsSUFBSSxTQUFTLEVBQUU7SUFDWCxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7TUFDbkIsT0FBTyxJQUFBLGdCQUFVLEVBQUMsQ0FDZCxNQUFNLEVBQ047UUFBRSxLQUFLLEVBQUU7TUFBbUMsQ0FBRSxFQUM5QyxJQUFJLENBQ1AsQ0FBQztJQUNOO0lBQ0EsT0FBTyxJQUFBLGdCQUFVLEVBQUMsQ0FDZCxNQUFNLEVBQ047TUFBRSxLQUFLLEVBQUU7SUFBcUMsQ0FBRSxFQUNoRCxNQUFNLENBQ1QsQ0FBQztFQUNOO0VBQ0EsSUFBSSxNQUFNLEtBQUssY0FBYyxFQUFFO0lBQzNCLE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQ2QsTUFBTSxFQUNOO01BQ0ksS0FBSyxFQUFFLG1EQUFtRDtNQUMxRCxLQUFLLEVBQUUsR0FBRyxRQUFRO0tBQ3JCLEVBQ0QsY0FBYyxDQUNqQixDQUFDO0VBQ047RUFDQSxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUNkLE1BQU0sRUFDTjtJQUNJLEtBQUssRUFBRSxvREFBb0Q7SUFDM0QsS0FBSyxFQUFFLEdBQUcsUUFBUTtHQUNyQixFQUNELEdBQUcsUUFBUSxrQkFBa0IsQ0FDaEMsQ0FBQztBQUNOO0FBRUEsU0FBUyw0QkFBNEIsQ0FDakMsSUFBc0IsRUFDdEIsR0FBVyxFQUNYLFFBQWlCLEVBQ2pCLEtBQWE7RUFFYixNQUFNLGNBQWMsR0FBRyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FDcEMsTUFBTSxJQUNILE1BQU0sWUFBWSxrQkFBa0IsSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLEdBQUcsQ0FDMUU7RUFDRCxNQUFNLFlBQVksR0FBRyxRQUFRLEdBQ3ZCLGlEQUFpRCxHQUNqRCxxREFBcUQ7RUFDM0QsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFO0lBQ3hCLE1BQU0sS0FBSyxHQUFHLG1CQUFtQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUM7SUFDdkQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxZQUFZO0lBQzVELEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsUUFBUSxJQUFJLFlBQVksRUFBRSxDQUFDO0lBQzFELEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztJQUN2QyxPQUFPLEtBQUs7RUFDaEI7RUFDQSxJQUFJLFFBQVEsRUFBRTtJQUNWLE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQ2QsTUFBTSxFQUNOO01BQ0ksS0FBSyxFQUFFLGlEQUFpRDtNQUN4RCxLQUFLLEVBQUUsb0JBQW9CLElBQUEsdUNBQXFCLEVBQUMsR0FBRyxDQUFDO0tBQ3hELEVBQ0QsS0FBSyxDQUNSLENBQUM7RUFDTjtFQUNBLE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQ2QsTUFBTSxFQUNOO0lBQ0ksS0FBSyxFQUFFLHFEQUFxRDtJQUM1RCxLQUFLLEVBQUUsd0JBQXdCLElBQUEsdUNBQXFCLEVBQUMsR0FBRyxDQUFDO0dBQzVELEVBQ0QsS0FBSyxDQUNSLENBQUM7QUFDTjtBQUVBO0FBQ0EsU0FBUyx3QkFBd0IsQ0FBQyxLQUFZO0VBQzFDLE1BQU0sUUFBUSxHQUFHLHFDQUFxQyxDQUFDLEtBQUssQ0FBQztFQUM3RCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0lBQ3ZCLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBRTtFQUN2QjtFQUNBLE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQ2QsTUFBTSxFQUNOO0lBQUUsS0FBSyxFQUFFO0VBQTRCLENBQUUsRUFDdkMsR0FBRyxRQUFRLENBQ2QsQ0FBQztBQUNOO0FBRUEsU0FBUyxxQ0FBcUMsQ0FBQyxLQUFZO0VBQ3ZELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztFQUM3QyxNQUFNLFNBQVMsR0FBRyxJQUFBLGlEQUErQixFQUM3QztJQUNJLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtJQUNaLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztJQUN0QixXQUFXLEVBQUUsS0FBSyxDQUFDO0dBQ3RCLEVBQ0Qsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQ2pDO0VBQ0QsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFFLE9BQU8sSUFBSTtJQUM3QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO01BQ3pCLE9BQU8sMkJBQTJCLENBQzlCLE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLE9BQU8sQ0FBQyxTQUFTLEVBQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQ2pCO0lBQ0w7SUFDQSxPQUFPLDRCQUE0QixDQUMvQixJQUFJLEVBQ0osT0FBTyxDQUFDLEdBQUcsRUFDWCxPQUFPLENBQUMsUUFBUSxFQUNoQixPQUFPLENBQUMsS0FBSyxDQUNoQjtFQUNMLENBQUMsQ0FBQztBQUNOO0FBRUEsU0FBUyx3QkFBd0IsQ0FDN0IsSUFBc0IsRUFDdEIsVUFBMkIsRUFDM0IsU0FBcUI7RUFFckIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO0VBQzVDLElBQUksQ0FBQyxLQUFLLEVBQUU7SUFDUixNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE1BQU0sZUFBZSxHQUFHLHFDQUFxQyxDQUFDLEtBQUssQ0FBQztFQUNwRSxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUNkLEtBQUssRUFDTDtJQUNJLEtBQUssRUFBRSxzQkFBc0I7SUFDN0IsSUFBSSxFQUFFLE9BQU87SUFDYixZQUFZLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSTtHQUM5QixFQUNELGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUN6QixDQUNJLEtBQUssRUFDTDtJQUFFLEtBQUssRUFBRTtFQUErQixDQUFFLEVBQzFDLENBQ0ksS0FBSyxFQUNMO0lBQUUsS0FBSyxFQUFFO0VBQWdCLENBQUUsRUFDM0Isc0JBQXNCLENBQ2xCLElBQUksRUFDSixVQUFVLEVBQ1YsVUFBVSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsR0FBRyxTQUFTLENBQ3RELENBQ0osRUFDRCxDQUNJLEtBQUssRUFDTDtJQUNJLEtBQUssRUFBRSw0QkFBNEI7SUFDbkMsSUFBSSxFQUFFLE1BQU07SUFDWixZQUFZLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSTtHQUM5QixFQUNELEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBRSxPQUFPLElBQzNCLElBQUEsZ0JBQVUsRUFBQyxDQUFDLE1BQU0sRUFBRTtJQUFFLEtBQUssRUFBRSxrQ0FBa0M7SUFBRSxJQUFJLEVBQUU7RUFBVSxDQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FDakcsQ0FDSixDQUNKLENBQ0osQ0FBQztBQUNOO0FBRUEsU0FBUyxpQkFBaUIsQ0FBQyxJQUFVLEVBQUUsVUFBc0IsRUFBRSxTQUFxQjtFQUNoRixJQUFJLFVBQVUsWUFBWSxlQUFlLEVBQUU7SUFDdkMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7RUFDbEUsQ0FBQyxNQUNJLElBQUksVUFBVSxZQUFZLGNBQWMsRUFBRTtJQUMzQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtNQUMvQixPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBQ25FO0lBQ0EsT0FBTyxDQUNILG9CQUFvQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFDdEMsSUFBSSxVQUFVLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUMxRDtFQUNMLENBQUMsTUFDSSxJQUFJLFVBQVUsWUFBWSxrQkFBa0IsRUFBRTtJQUMvQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0VBQ2xELENBQUMsTUFDSTtJQUNELE1BQU0sZ0JBQWdCO0VBQzFCO0FBQ0o7QUFFQSxTQUFTLGVBQWUsQ0FBQyxJQUFVO0VBQy9CLE9BQU8sQ0FDSCxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQzNCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDdkIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNqQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3JCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDdEIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUN2QixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ3JCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNyQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQ2YsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUMvQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQ3ZCO0FBQ2Q7QUFFQSxTQUFTLHdCQUF3QixDQUFDLElBQVUsRUFBRSxTQUFxQjtFQUMvRCxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDO0VBQ3RFLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FDM0IseUJBQXlCLENBQUMsSUFBSSxFQUFFLE1BQU0sSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUN6RDtFQUNELE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQ2QsS0FBSyxFQUNMO0lBQUUsS0FBSyxFQUFFO0VBQWMsQ0FBRSxFQUN6QixDQUNJLFFBQVEsRUFDUjtJQUFFLEtBQUssRUFBRTtFQUFzQixDQUFFLEVBQ2pDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLG1CQUFtQixDQUFDLEVBQzVDLENBQ0ksS0FBSyxFQUNMLENBQUMsTUFBTSxFQUFFO0lBQUUsS0FBSyxFQUFFO0VBQXVCLENBQUUsRUFBRSxtQkFBbUIsQ0FBQyxFQUNqRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQ3BCLENBQ0ksR0FBRyxFQUNIO0lBQUUsS0FBSyxFQUFFO0VBQW9CLENBQUUsRUFDL0IsR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxnQkFBZ0IsTUFBTSxJQUFJLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FDNUYsQ0FDSixDQUNKLEVBQ0QsQ0FDSSxTQUFTLEVBQ1Q7SUFBRSxLQUFLLEVBQUUsdUJBQXVCO0lBQUUsaUJBQWlCLEVBQUU7RUFBb0IsQ0FBRSxFQUMzRSxDQUFDLElBQUksRUFBRTtJQUFFLEVBQUUsRUFBRTtFQUFvQixDQUFFLEVBQUUsT0FBTyxDQUFDLEVBQzdDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUNWLElBQUEsZ0JBQVUsRUFBQyxDQUNULElBQUksRUFDSjtJQUFFLEtBQUssRUFBRTtFQUFxQixDQUFFLEVBQ2hDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLElBQUEsZ0JBQVUsRUFBQyxDQUN4QyxLQUFLLEVBQ0wsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQ2IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUNyQixDQUFDLENBQUMsQ0FDTixDQUFDLEdBQ0EsSUFBQSxnQkFBVSxFQUFDLENBQUMsR0FBRyxFQUFFO0lBQUUsS0FBSyxFQUFFO0VBQXFCLENBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQy9FLEVBQ0QsQ0FDSSxTQUFTLEVBQ1Q7SUFBRSxLQUFLLEVBQUUsdUJBQXVCO0lBQUUsaUJBQWlCLEVBQUU7RUFBc0IsQ0FBRSxFQUM3RSxDQUFDLElBQUksRUFBRTtJQUFFLEVBQUUsRUFBRTtFQUFzQixDQUFFLEVBQUUsZUFBZSxDQUFDLEVBQ3ZELE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUNaLElBQUEsZ0JBQVUsRUFBQyxDQUFDLEtBQUssRUFBRTtJQUFFLEtBQUssRUFBRTtFQUF1QixDQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUNuRSxJQUFBLGdCQUFVLEVBQUMsQ0FDVCxHQUFHLEVBQ0g7SUFBRSxLQUFLLEVBQUU7RUFBcUIsQ0FBRSxFQUNoQyxxQ0FBcUMsQ0FDeEMsQ0FBQyxDQUNULENBQ0osQ0FBQztBQUNOO0FBRUEsU0FBUyx3QkFBd0IsQ0FBQyxJQUFVLEVBQUUsU0FBcUI7RUFDL0QsTUFBTSxNQUFNLEdBQUcsSUFBQSxnQkFBVSxFQUFDLENBQ3RCLFFBQVEsRUFDUjtJQUNJLEtBQUssRUFBRSxzQkFBc0I7SUFDN0IsSUFBSSxFQUFFLFFBQVE7SUFDZCxlQUFlLEVBQUUsUUFBUTtJQUN6QixlQUFlLEVBQUUsT0FBTztJQUN4QixZQUFZLEVBQUUsb0JBQW9CLElBQUksQ0FBQyxPQUFPO0dBQ2pELEVBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FDZixDQUFDO0VBQ0YsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRyxLQUFLLElBQUk7SUFDdkMsS0FBSyxDQUFDLGVBQWUsRUFBRTtJQUN2QixVQUFVLENBQ04sTUFBTSxFQUNOLEdBQUcsSUFBSSxDQUFDLE9BQU8sZUFBZSxFQUM5Qix3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQ3pDLHFCQUFxQixDQUN4QjtFQUNMLENBQUMsQ0FBQztFQUNGLE9BQU8sTUFBTTtBQUNqQjtBQUVBLFNBQVMscUJBQXFCLENBQUMsSUFBVTtFQUNyQyxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUNkLE1BQU0sRUFDTjtJQUNJLEtBQUssRUFBRSxtQkFBbUI7SUFDMUIsSUFBSSxFQUFFLEtBQUs7SUFDWCxZQUFZLEVBQUUscUNBQXFDLElBQUksQ0FBQyxPQUFPO0dBQ2xFLEVBQ0QsQ0FBQyxNQUFNLEVBQUU7SUFBRSxLQUFLLEVBQUUseUJBQXlCO0lBQUUsYUFBYSxFQUFFO0VBQU0sQ0FBRSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLEVBQzFGLENBQUMsTUFBTSxFQUFFO0lBQUUsYUFBYSxFQUFFO0VBQU0sQ0FBRSxFQUFFLDBCQUEwQixDQUFDLENBQ2xFLENBQUM7QUFDTjtBQUVBLFNBQVMsZUFBZSxDQUNwQixLQUFhLEVBQ2IsSUFBWSxFQUNaLEtBQWEsRUFDYixTQUFpQixFQUNqQixXQUFXLEdBQUcsRUFBRTtFQUVoQixNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztFQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFO0lBQ1g7RUFDSjtFQUNBLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsU0FBUztFQUN4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0VBQ2pELE1BQU0sS0FBSyxHQUFHLFdBQVcsR0FBRyxRQUFRLENBQUMsSUFBSTtFQUN6QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUs7RUFDeEMsTUFBTSxPQUFPLEdBQUcsRUFBRSxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUs7RUFDckYsTUFBTSxPQUFPLEdBQUcsRUFBRSxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUs7RUFDbEYsT0FBTyxJQUFBLGdCQUFVLEVBQUMsQ0FDZCxNQUFNLEVBQ047SUFDSSxLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFJLEVBQUUsS0FBSztJQUNYLFlBQVksRUFBRSxLQUFLO0lBQ25CLEtBQUssRUFBRSxDQUNILDBDQUEwQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUM1RSxtQkFBbUIsU0FBUyxJQUFJLEVBQ2hDLGdCQUFnQixPQUFPLElBQUksRUFDM0IsZ0JBQWdCLE9BQU8sSUFBSSxDQUM5QixDQUFDLElBQUksQ0FBQyxHQUFHO0dBQ2IsQ0FDSixDQUFDO0FBQ047QUFFQSxTQUFTLGFBQWEsQ0FDbEIsSUFBVSxFQUNWLFdBQVcsR0FBRyxFQUFFLEVBQ2hCLFNBQVMsR0FBRyxvQkFBb0I7RUFFaEMsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUMxQyxJQUFJLENBQUMsR0FBRyxFQUFFO0lBQ04sT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7RUFDdEM7RUFDQSxPQUFPLGVBQWUsQ0FDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNOLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDTix5QkFBeUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUN2QyxTQUFTLEVBQ1QsV0FBVyxDQUNkLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDO0FBQ3BDO0FBRUEsU0FBUyxrQkFBa0IsQ0FBQyxLQUFZO0VBQ3BDLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7RUFDeEQsTUFBTSxRQUFRLEdBQUcsQ0FBQSxLQUFNLElBQUEsZ0JBQVUsRUFBQyxDQUMxQixNQUFNLEVBQ047SUFDSSxLQUFLLEVBQUUsNENBQTRDO0lBQ25ELElBQUksRUFBRSxLQUFLO0lBQ1gsWUFBWSxFQUFFLGdDQUFnQyxLQUFLLENBQUMsSUFBSTtHQUMzRCxFQUNELEdBQUcsQ0FDTixDQUFDO0VBQ04sSUFBSSxDQUFDLEdBQUcsRUFBRTtJQUNOLE9BQU8sUUFBUSxFQUFFO0VBQ3JCO0VBQ0EsT0FBTyxlQUFlLENBQ2xCLEdBQUcsQ0FBQyxLQUFLLEVBQ1QsR0FBRyxDQUFDLElBQUksRUFDUixHQUFHLEtBQUssQ0FBQyxJQUFJLGVBQWUsRUFDNUIsZ0JBQWdCLENBQ25CLElBQUksUUFBUSxFQUFFO0FBQ25CO0FBRUEsU0FBUyxjQUFjLENBQUMsSUFBVSxFQUFFLFlBQWlELEVBQUUsYUFBdUIsRUFBRSxTQUFxQjtFQUNqSSxNQUFNLEdBQUcsR0FBRyxJQUFBLGdCQUFVLEVBQ2xCLENBQUMsSUFBSSxFQUFFO0lBQUUsS0FBSyxFQUFFO0VBQVksQ0FBRSxFQUMxQixDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSw0QkFBNEI7SUFBRSxZQUFZLEVBQUU7RUFBTSxDQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUNyRyxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxZQUFZO0lBQUUsWUFBWSxFQUFFO0VBQUssQ0FBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN6RSxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxrQkFBa0I7SUFBRSxZQUFZLEVBQUU7RUFBVyxDQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUMsRUFDekYsQ0FBQyxJQUFJLEVBQUU7SUFBRSxLQUFLLEVBQUUsYUFBYTtJQUFFLFlBQVksRUFBRTtFQUFNLENBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2pFLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUc7SUFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3hFLE9BQU8sSUFBQSxnQkFBVSxFQUFDLENBQUMsSUFBSSxFQUFFO01BQUUsS0FBSyxFQUFFLFNBQVM7TUFBRSxZQUFZLEVBQUUsSUFBSTtNQUFFLFlBQVksRUFBRTtJQUFLLENBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUNuRyxDQUFDLENBQUMsRUFDRixDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxzQkFBc0I7SUFBRSxZQUFZLEVBQUUsT0FBTztJQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLO0VBQUUsQ0FBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ2hILENBQUMsSUFBSSxFQUFFO0lBQUUsS0FBSyxFQUFFLGVBQWU7SUFBRSxZQUFZLEVBQUU7RUFBUSxDQUFFLEVBQUUsR0FBRyxlQUFlLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQzNJLENBQ0o7RUFDRCxPQUFPLEdBQUc7QUFDZDtBQUVNLFNBQVUsYUFBYSxDQUFDLE1BQStCLEVBQUUsSUFBZ0I7RUFDM0UsTUFBTSxLQUFLLEdBQUcsSUFBQSxnQkFBVSxFQUNwQixDQUFDLE9BQU8sRUFDSixDQUFDLFNBQVMsRUFBRSxnREFBZ0QsQ0FBQyxFQUM3RCxDQUFDLElBQUksRUFDRCxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRTtFQUFhLENBQUUsRUFBRSxNQUFNLENBQUMsQ0FDM0MsQ0FDSixDQUNKO0VBQ0QsS0FBSyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksTUFBTSxFQUFFO0lBQzVCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztJQUNsRCxJQUFJLENBQUMsU0FBUyxFQUFFO01BQ1osTUFBTSxnQkFBZ0I7SUFDMUI7SUFDQSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtNQUNuQixLQUFLLENBQUMsV0FBVyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUN6QixJQUFJLEVBQ0osQ0FDSSxJQUFJLEVBQ0o7UUFBRSxLQUFLLEVBQUUsMkJBQTJCO1FBQUUsWUFBWSxFQUFFO01BQU8sQ0FBRSxFQUM3RCx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUNuRixDQUNKLENBQUMsQ0FBQztJQUNQO0VBQ0o7RUFDQSxPQUFPLEtBQUs7QUFDaEI7QUFFTSxTQUFVLGVBQWUsQ0FDM0IsTUFBK0IsRUFDL0IsWUFBaUQsRUFDakQsU0FBZ0QsRUFDaEQsYUFBdUIsRUFDdkIsU0FBcUI7RUFDckIsTUFBTSxPQUFPLEdBQThCO0lBQ3ZDLEtBQUssRUFBRSxFQUFFO0lBQ1QsTUFBTSxFQUFFLEVBQUU7SUFDVixLQUFLLEVBQUUsRUFBRTtJQUNULE9BQU8sRUFBRSxFQUFFO0lBQ1gsT0FBTyxFQUFFLEVBQUU7SUFDWCxPQUFPLEVBQUUsRUFBRTtJQUNYLE9BQU8sRUFBRSxFQUFFO0lBQ1gsTUFBTSxFQUFFLEVBQUU7SUFDVixVQUFVLEVBQUUsRUFBRTtJQUNkLE1BQU0sRUFBRSxFQUFFO0lBQ1YsUUFBUSxFQUFFO0dBQ2I7RUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUU7SUFDMUIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDZCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQztJQUM1RDtFQUNKO0VBRUEsTUFBTSxLQUFLLEdBQUcsSUFBQSxnQkFBVSxFQUNwQixDQUFDLE9BQU8sRUFDSixDQUFDLFNBQVMsRUFBRSx1REFBdUQsQ0FBQyxFQUNwRSxDQUFDLE9BQU8sRUFDSixDQUFDLElBQUksRUFDRCxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxhQUFhO0lBQUUsS0FBSyxFQUFFO0VBQUssQ0FBRSxFQUFFLE1BQU0sQ0FBQyxFQUN0RCxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxZQUFZO0lBQUUsS0FBSyxFQUFFO0VBQUssQ0FBRSxFQUFFLEtBQUssQ0FBQyxFQUNwRCxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxrQkFBa0I7SUFBRSxLQUFLLEVBQUU7RUFBSyxDQUFFLEVBQUUsV0FBVyxDQUFDLEVBQ2hFLENBQUMsSUFBSSxFQUFFO0lBQUUsS0FBSyxFQUFFLGFBQWE7SUFBRSxLQUFLLEVBQUU7RUFBSyxDQUFFLEVBQUUsTUFBTSxDQUFDLEVBQ3RELEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBRSxJQUFJLElBQUssNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDbEUsQ0FBQyxJQUFJLEVBQUU7SUFBRSxLQUFLLEVBQUUsc0JBQXNCO0lBQUUsS0FBSyxFQUFFO0VBQUssQ0FBRSxFQUFFLE9BQU8sQ0FBQyxFQUNoRSxDQUFDLElBQUksRUFBRTtJQUFFLEtBQUssRUFBRSxlQUFlO0lBQUUsS0FBSyxFQUFFO0VBQUssQ0FBRSxFQUFFLFFBQVEsQ0FBQyxDQUM3RCxDQUNKLEVBQ0QsQ0FBQyxPQUFPLENBQUMsQ0FDWixDQUNKO0VBQ0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7RUFDbEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtJQUNaLE1BQU0sZ0JBQWdCO0VBQzFCO0VBVUEsU0FBUyxXQUFXLENBQUMsRUFBYyxFQUFFLEVBQWM7SUFDL0MsTUFBTSxNQUFNLEdBQUc7TUFBRSxHQUFHO0lBQUUsQ0FBRTtJQUN4QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUMzQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNiLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztNQUMzQyxDQUFDLE1BQ0k7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSztNQUN2QjtJQUNKO0lBQ0EsT0FBTyxNQUFNO0VBQ2pCO0VBRUEsU0FBUyxZQUFZLENBQUMsS0FBVyxFQUFFLEtBQVc7SUFDMUMsT0FBTztNQUNILElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJO01BQzdCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFO01BQ3ZCLElBQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtLQUMzQztFQUNMO0VBRUEsU0FBUyxNQUFNLENBQUMsRUFBYyxFQUFFLEVBQWM7SUFDMUMsTUFBTSxNQUFNLEdBQUc7TUFBRSxHQUFHO0lBQUUsQ0FBRTtJQUN4QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUMzQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLE1BQU0sZ0JBQWdCO01BQzFCO01BQ0EsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDYixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN0RCxDQUFDLE1BQ0k7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSztNQUN2QjtJQUNKO0lBQ0EsT0FBTyxNQUFNO0VBQ2pCO0VBRUEsU0FBUyxPQUFPLENBQUMsS0FBVyxFQUFFLEtBQVc7SUFDckM7SUFDQTtJQUNBLE1BQU0sU0FBUyxHQUNYLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsSUFDbEIsS0FBSyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUs7SUFDdEQsT0FBTyxTQUFTLEdBQ1o7TUFDSSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7TUFDaEIsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO01BQ1osSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO0tBQ3RDLEdBQ0Q7TUFDSSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7TUFDaEIsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO01BQ1osSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO0tBQ3RDO0VBQ1Q7RUFFQSxTQUFTLE1BQU0sQ0FBQyxJQUFVLEVBQUUsU0FBcUI7SUFDN0MsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FDekMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUNwQixHQUFHLENBQUUsVUFBVSxJQUFJO01BQ2hCLElBQUksVUFBVSxZQUFZLGNBQWMsRUFBRTtRQUN0QyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUU7VUFDZixPQUFPO1lBQUUsSUFBSSxFQUFFLENBQUM7WUFBRSxFQUFFLEVBQUUsVUFBVSxDQUFDLEtBQUs7WUFBRSxJQUFJLEVBQUU7VUFBRSxDQUFFO1FBQ3REO1FBQ0EsT0FBTztVQUFFLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSztVQUFFLEVBQUUsRUFBRSxDQUFDO1VBQUUsSUFBSSxFQUFFO1FBQUUsQ0FBRTtNQUN0RCxDQUFDLE1BQ0ksSUFBSSxVQUFVLFlBQVksZUFBZSxFQUFFO1FBQzVDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztRQUNyRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7UUFDekQsT0FBTztVQUNILElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxHQUFHLFVBQVU7VUFDbEMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEdBQUcsVUFBVTtVQUM5QixJQUFJLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FDcEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBRXhFO01BQ0wsQ0FBQyxNQUNJLElBQUksVUFBVSxZQUFZLGtCQUFrQixFQUFFO1FBQy9DLE9BQU87VUFDSCxJQUFJLEVBQUUsQ0FBQztVQUNQLEVBQUUsRUFBRSxDQUFDO1VBQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDbEY7TUFDTCxDQUFDLE1BQ0k7UUFDRCxNQUFNLGdCQUFnQjtNQUMxQjtJQUNKLENBQUMsQ0FBQztJQUNOLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDMUIsT0FBTztRQUFFLElBQUksRUFBRSxDQUFDO1FBQUUsRUFBRSxFQUFFLENBQUM7UUFBRSxJQUFJLEVBQUU7TUFBRSxDQUFFO0lBQ3ZDO0lBQ0E7SUFDQTtJQUNBLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEtBQUssT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNsRTtFQUVBLE1BQU0sa0JBQWtCLEdBQTJCLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRyxNQUFNLFVBQVUsR0FBRztJQUNmLFVBQVUsRUFBRSxJQUFJLEdBQWMsQ0FBZCxDQUFjO0lBQzlCLEtBQUssRUFBRSxDQUFDO0lBQ1IsSUFBSSxFQUFFO01BQUUsRUFBRSxFQUFFLENBQUM7TUFBRSxJQUFJLEVBQUUsQ0FBQztNQUFFLElBQUksRUFBRTtJQUFFO0dBQ25DO0VBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQ3pDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDckI7SUFDSjtJQUVBLEtBQUssTUFBTSxJQUFJLElBQUksYUFBYSxFQUFFO01BQzlCLElBQUksT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFDOUM7TUFDSjtNQUNBLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsS0FBSyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDdEcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSztJQUNyQztJQUVBLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFFOUQsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEVBQUU7TUFDdkIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFVBQVUsRUFBRTtRQUMvRCxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDL0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7TUFDbEY7SUFDSjtJQUNBO0lBQ0E7SUFDQSxVQUFVLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FDMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUMsRUFDOUUsVUFBVSxDQUFDLElBQUksQ0FDbEI7RUFDTDtFQUVBLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO0lBQ2xDLE1BQU0sYUFBYSxHQUFhLEVBQUU7SUFDbEMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7TUFDMUIsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ2pFO0lBQ0EsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7TUFDeEIsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzdEO0lBQ0E7SUFDQSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUN6QixPQUFPLEVBQ1AsQ0FBQyxJQUFJLEVBQ0QsQ0FBQyxJQUFJLEVBQUU7TUFBRSxLQUFLLEVBQUU7SUFBbUIsQ0FBRSxFQUFFLFFBQVEsQ0FBQyxFQUNoRCxDQUFDLElBQUksRUFBRTtNQUFFLEtBQUssRUFBRTtJQUFrQixDQUFFLENBQUMsRUFDckMsQ0FBQyxJQUFJLEVBQUU7TUFBRSxLQUFLLEVBQUU7SUFBd0IsQ0FBRSxDQUFDLEVBQzNDLENBQUMsSUFBSSxFQUFFO01BQUUsS0FBSyxFQUFFO0lBQW1CLENBQUUsQ0FBQyxFQUN0QyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUEsZ0JBQVUsRUFBQyxDQUFDLElBQUksRUFBRTtNQUFFLEtBQUssRUFBRTtJQUFlLENBQUUsRUFDckUsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUNoQyxDQUFDLENBQUMsRUFDSCxDQUFDLElBQUksRUFBRTtNQUFFLEtBQUssRUFBRTtJQUE0QixDQUFFLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDdEUsQ0FBQyxJQUFJLEVBQUU7TUFBRSxLQUFLLEVBQUU7SUFBcUIsQ0FBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDckUsQ0FDSixDQUFDLENBQUM7SUFDSCxLQUFLLE1BQU0sY0FBYyxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO01BQzNFLElBQUksRUFBRSxjQUFjLFlBQVksV0FBVyxDQUFDLEVBQUU7UUFDMUM7TUFDSjtNQUNBLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSTtJQUNoQztFQUNKO0VBRUEsS0FBSyxNQUFNLFNBQVMsSUFBSSxhQUFhLEVBQUU7SUFDbkMsSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7TUFDckMsS0FBSyxNQUFNLGNBQWMsSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxFQUFFO1FBQzlFLElBQUksRUFBRSxjQUFjLFlBQVksV0FBVyxDQUFDLEVBQUU7VUFDMUM7UUFDSjtRQUNBLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSTtNQUNoQztJQUNKO0VBQ0o7RUFDQSxPQUFPLEtBQUs7QUFDaEI7QUFFTSxTQUFVLGVBQWUsQ0FBQTtFQUMzQjtFQUNBLElBQUksR0FBRyxHQUFHLENBQUM7RUFDWCxLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUU7SUFDMUIsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7RUFDbkM7RUFDQSxPQUFPLEdBQUc7QUFDZDtBQUVBLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFHLEtBQUssSUFBSTtFQUM5QyxJQUFJLE1BQU0sSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRTtJQUNuQyxNQUFNLENBQUMsS0FBSyxFQUFFO0VBQ2xCO0FBQ0osQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FDaDVERixJQUFBLGFBQUEsR0FBQSxPQUFBO0FBQ0EsSUFBQSxXQUFBLEdBQUEsT0FBQTtBQUNBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFDQSxJQUFBLFNBQUEsR0FBQSxPQUFBO0FBQ0EsSUFBQSxRQUFBLEdBQUEsT0FBQTtBQUVBLE1BQU0sV0FBVyxHQUFHLENBQ2hCLE9BQU8sRUFBRSxDQUNMLE1BQU0sRUFBRSxDQUNKLE1BQU0sRUFDTixPQUFPLEVBQ1AsS0FBSyxDQUNSLEVBQ0QsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLEVBQUUsQ0FDSixRQUFRLEVBQ1IsT0FBTyxDQUNWLEVBQ0QsS0FBSyxFQUFFLENBQ0gsT0FBTyxFQUNQLFdBQVcsRUFDWCxPQUFPLENBQ1YsRUFDRCxTQUFTLENBQ1osQ0FDSjtBQUVELE1BQU0sa0JBQWtCLEdBQUcsQ0FDdkIsY0FBYyxFQUFFLENBQ1osTUFBTSxFQUFFLENBQ0osT0FBTyxFQUNQLEtBQUssQ0FDUixFQUNELGNBQWMsRUFDZCxXQUFXLEVBQ1gsYUFBYSxFQUNiLG1CQUFtQixDQUN0QixDQUNKO0FBRUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBVTtBQUUzQztBQUNNLFNBQVUsd0JBQXdCLENBQUMsS0FBYTtFQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN0QixPQUFPLFNBQVM7RUFDcEI7RUFDQSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0VBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzNCLE9BQU8sU0FBUztFQUNwQjtFQUNBLE9BQU8sRUFBRTtBQUNiO0FBRUEsU0FBUyxjQUFjLENBQUE7RUFDbkIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQztFQUMxRCxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ1Q7RUFDSjtFQUVBLElBQUksS0FBSyxHQUFHLElBQUk7RUFDaEIsS0FBSyxNQUFNLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLHNCQUFVLENBQUMsRUFBRTtJQUM1QyxNQUFNLEVBQUUsR0FBRyxzQkFBc0IsU0FBUyxFQUFFO0lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUEsZ0JBQVUsRUFBQyxDQUFDLE9BQU8sRUFBRTtNQUFFLEVBQUUsRUFBRSxFQUFFO01BQUUsSUFBSSxFQUFFLE9BQU87TUFBRSxJQUFJLEVBQUUsb0JBQW9CO01BQUUsS0FBSyxFQUFFO0lBQVMsQ0FBRSxDQUFDLENBQUM7SUFDbkgsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUM7SUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7SUFDaEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLGdCQUFVLEVBQUMsQ0FBQyxPQUFPLEVBQUU7TUFBRSxHQUFHLEVBQUU7SUFBRSxDQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNqRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEMsSUFBSSxLQUFLLEVBQUU7TUFDUCxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUk7TUFDM0IsS0FBSyxHQUFHLEtBQUs7SUFDakI7RUFDSjtFQUVBLE1BQU0sT0FBTyxHQUF5QixDQUNsQyxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsRUFDNUIsQ0FBQyxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUM3QztFQUNELEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUU7SUFDbEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDNUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtNQUNUO0lBQ0o7SUFDQSxNQUFNLElBQUksR0FBRyxJQUFBLDhCQUFnQixFQUFDLE1BQU0sQ0FBQztJQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQztJQUM5QyxNQUFNLENBQUMsU0FBUyxHQUFHLEVBQUU7SUFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7RUFDNUI7QUFDSjtBQUVBLGNBQWMsRUFBRTtBQUVoQixJQUFJLE9BQW9CO0FBQ3hCLE1BQU0saUJBQWlCLEdBQUcsSUFBQSxnQkFBVSxFQUFDLENBQUMsSUFBSSxFQUFFO0VBQUUsRUFBRSxFQUFFO0FBQWEsQ0FBRSxDQUFDLENBQUM7QUFDbkUsSUFBSSxzQkFBK0M7QUFFbkQsU0FBUyxzQkFBc0IsQ0FBQyxTQUF3QjtFQUNwRCxNQUFNLEVBQUUsR0FBRyw0QkFBNEI7RUFDdkMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDO0VBQy9DLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDO0VBQ2hELEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztFQUN4QyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUM7RUFDL0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDO0VBQ2hDLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztFQUN2QyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUM7RUFDdEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDO0VBQ2pELElBQUksQ0FBQyxZQUFZLENBQ2IsR0FBRyxFQUNILFNBQVMsS0FBSyxJQUFJLEdBQUcsb0JBQW9CLEdBQUcsb0JBQW9CLENBQ25FO0VBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO0VBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQztFQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7RUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUM7RUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUM7RUFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7RUFDaEIsT0FBTyxHQUFHO0FBQ2Q7QUFFQTtBQUNNLFNBQVUsb0JBQW9CLENBQUMsSUFBYTtFQUM5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDO0VBQ3hELElBQUksS0FBSyxFQUFFLFdBQVcsRUFBRTtJQUNwQixPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO0VBQ25DO0VBQ0EsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRSxFQUFFLElBQUksRUFBRTtBQUMxQztBQUVBLFNBQVMsb0JBQW9CLENBQUMsSUFBaUIsRUFBRSxJQUFZO0VBQ3pELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUM7RUFDeEQsSUFBSSxLQUFLLFlBQVksV0FBVyxFQUFFO0lBQzlCLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSTtFQUM1QixDQUFDLE1BQ0k7SUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUk7RUFDM0I7RUFDQSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDO0VBQ2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUM7RUFDdEQsSUFBSSxFQUFFLFlBQVksaUJBQWlCLEVBQUU7SUFDakMsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsU0FBUyxJQUFJLFdBQVcsQ0FBQztJQUN2RCxFQUFFLENBQUMsS0FBSyxHQUFHLFNBQVMsSUFBSSxFQUFFO0VBQzlCO0VBQ0EsSUFBSSxJQUFJLFlBQVksaUJBQWlCLEVBQUU7SUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsU0FBUyxJQUFJLFdBQVcsQ0FBQztJQUN6RCxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsSUFBSSxFQUFFO0VBQ2hDO0FBQ0o7QUFFTSxTQUFVLHNCQUFzQixDQUFDLElBQVk7RUFDL0MsTUFBTSxFQUFFLEdBQUcsSUFBQSxnQkFBVSxFQUFDLENBQ2xCLFFBQVEsRUFDUjtJQUNJLElBQUksRUFBRSxRQUFRO0lBQ2QsS0FBSyxFQUFFLGdDQUFnQztJQUN2QyxZQUFZLEVBQUUsU0FBUyxJQUFJLFdBQVc7SUFDdEMsS0FBSyxFQUFFLFNBQVMsSUFBSTtHQUN2QixDQUNKLENBQUM7RUFDRixFQUFFLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUEsZ0JBQVUsRUFBQyxDQUNwQixRQUFRLEVBQ1I7SUFDSSxJQUFJLEVBQUUsUUFBUTtJQUNkLEtBQUssRUFBRSxrQ0FBa0M7SUFDekMsWUFBWSxFQUFFLFNBQVMsSUFBSSxXQUFXO0lBQ3RDLEtBQUssRUFBRSxTQUFTLElBQUk7R0FDdkIsQ0FDSixDQUFDO0VBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUUzQyxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUNkLElBQUksRUFDSjtJQUFFLEtBQUssRUFBRSxVQUFVO0lBQUUsU0FBUyxFQUFFO0VBQU0sQ0FBRSxFQUN4QyxDQUFDLE1BQU0sRUFBRTtJQUFFLEtBQUssRUFBRTtFQUFxQixDQUFFLEVBQUUsSUFBSSxDQUFDLEVBQ2hELElBQUEsZ0JBQVUsRUFBQyxDQUFDLE1BQU0sRUFBRTtJQUFFLEtBQUssRUFBRTtFQUF3QixDQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQ3RFLENBQUM7QUFDTjtBQUVBLFNBQVMsaUJBQWlCLENBQUMsSUFBc0I7RUFDN0MsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQ2xDLElBQUksSUFBNEIsSUFBSSxZQUFZLGFBQWEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDeEc7QUFDTDtBQUVBLFNBQVMsc0JBQXNCLENBQUMsSUFBc0I7RUFDbEQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQztFQUM3RCxJQUFJLEVBQUUsSUFBSSxZQUFZLFdBQVcsQ0FBQyxFQUFFO0lBQ2hDO0VBQ0o7RUFDQSxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtJQUNOO0VBQ0o7RUFDQSxNQUFNLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7RUFDdkMsSUFBSSxLQUFLLEVBQUU7SUFDUCxJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsS0FBSyxRQUFRO0VBQ3ZDO0FBQ0o7QUFFQSxTQUFTLDJCQUEyQixDQUFDLElBQXNCO0VBQ3ZELE1BQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQztFQUNyQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssS0FBSTtJQUMxQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDO0lBQ2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUM7SUFDdEQsSUFBSSxFQUFFLFlBQVksaUJBQWlCLEVBQUU7TUFDakMsRUFBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLEtBQUssQ0FBQztJQUM3QjtJQUNBLElBQUksSUFBSSxZQUFZLGlCQUFpQixFQUFFO01BQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxLQUFLLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztJQUM5QztFQUNKLENBQUMsQ0FBQztFQUNGLHNCQUFzQixDQUFDLElBQUksQ0FBQztBQUNoQztBQUVBLFNBQVMsb0JBQW9CLENBQUMsSUFBbUIsRUFBRSxTQUF3QjtFQUN2RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYTtFQUMvQixJQUFJLEVBQUUsSUFBSSxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDckM7RUFDSjtFQUNBLElBQUksT0FBTyxHQUFtQixTQUFTLEtBQUssSUFBSSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCO0VBQ3hHLE9BQU8sT0FBTyxJQUFJLEVBQUUsT0FBTyxZQUFZLGFBQWEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO0lBQzdGLE9BQU8sR0FBRyxTQUFTLEtBQUssSUFBSSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCO0VBQzlGO0VBQ0EsSUFBSSxFQUFFLE9BQU8sWUFBWSxhQUFhLENBQUMsRUFBRTtJQUNyQztFQUNKO0VBQ0EsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0VBQ3hCLENBQUMsTUFDSTtJQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0VBQ3ZCO0VBQ0EsMkJBQTJCLENBQUMsSUFBSSxDQUFDO0VBQ2pDLGFBQWEsRUFBRTtBQUNuQjtBQUVBLFNBQVMsYUFBYSxDQUFBO0VBQ2xCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUcsS0FBSyxJQUFJO0lBQzdDLE1BQU07TUFBRTtJQUFNLENBQUUsR0FBRyxLQUFLO0lBQ3hCLElBQUksRUFBRSxNQUFNLFlBQVksV0FBVyxDQUFDLEVBQUU7TUFDbEM7SUFDSjtJQUNBLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxFQUFFO01BQzNELEtBQUssQ0FBQyxjQUFjLEVBQUU7TUFDdEI7SUFDSjtJQUNBLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUMzQyxNQUFNLEdBQ04sTUFBTSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQztJQUNwRCxJQUFJLEVBQUUsR0FBRyxZQUFZLFdBQVcsQ0FBQyxFQUFFO01BQy9CO0lBQ0o7SUFDQSxPQUFPLEdBQUcsR0FBRztFQUNqQixDQUFDLENBQUM7RUFFRixRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFHLEtBQUssSUFBSTtJQUM1QyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sWUFBWSxPQUFPLENBQUMsRUFBRTtNQUNwQztJQUNKO0lBQ0EsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUM7SUFDckUsSUFBSSxRQUFRLFlBQVksV0FBVyxFQUFFO01BQ2pDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtNQUNuRCxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHO01BQ3hDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNO01BQ2hDLElBQUssUUFJSjtNQUpELFdBQUssUUFBUTtRQUNULFFBQUEsQ0FBQSxRQUFBLHdCQUFLO1FBQ0wsUUFBQSxDQUFBLFFBQUEsa0JBQUU7UUFDRixRQUFBLENBQUEsUUFBQSx3QkFBSztNQUNULENBQUMsRUFKSSxRQUFRLEtBQVIsUUFBUTtNQUtiLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsRUFBRTtNQUNwRyxRQUFRLFFBQVE7UUFDWixLQUFLLFFBQVEsQ0FBQyxLQUFLO1VBQ2YsSUFBSSxzQkFBc0IsRUFBRTtZQUN4QixzQkFBc0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUNwRCxzQkFBc0IsR0FBRyxTQUFTO1VBQ3RDO1VBQ0EsaUJBQWlCLENBQUMsTUFBTSxHQUFHLEtBQUs7VUFDaEMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztVQUNsQztRQUNKLEtBQUssUUFBUSxDQUFDLEtBQUs7VUFDZixJQUFJLHNCQUFzQixFQUFFO1lBQ3hCLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ3BELHNCQUFzQixHQUFHLFNBQVM7VUFDdEM7VUFDQSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsS0FBSztVQUNoQyxRQUFRLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO1VBQ2pDO1FBQ0osS0FBSyxRQUFRLENBQUMsRUFBRTtVQUNaLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxJQUFJO1VBQy9CLElBQUksc0JBQXNCLEVBQUU7WUFDeEIsc0JBQXNCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7VUFDeEQ7VUFDQSxJQUFJLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDdEI7VUFDSjtVQUNBLHNCQUFzQixHQUFHLFFBQVE7VUFDakMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7VUFDakQ7TUFDUjtJQUNKO0lBQ0EsS0FBSyxDQUFDLGNBQWMsRUFBRTtFQUMxQixDQUFDLENBQUM7RUFFRixRQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7SUFBRTtFQUFNLENBQUUsS0FBSTtJQUM3QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFO01BQzNCLE9BQU8sQ0FBQyxNQUFNLEVBQUU7TUFDaEIsaUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztNQUNoQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsSUFBSTtNQUMvQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYTtNQUNsQyxJQUFJLElBQUksWUFBWSxnQkFBZ0IsRUFBRTtRQUNsQywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7TUFDckM7TUFDQSxhQUFhLEVBQUU7TUFDZjtJQUNKO0lBQ0EsaUJBQWlCLENBQUMsTUFBTSxHQUFHLElBQUk7SUFDL0IsSUFBSSxFQUFFLE1BQU0sWUFBWSxPQUFPLENBQUMsRUFBRTtNQUM5QjtJQUNKO0lBQ0EsSUFBSSxzQkFBc0IsRUFBRTtNQUN4QixzQkFBc0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztNQUNwRCxNQUFNLFVBQVUsR0FBRyxzQkFBc0I7TUFDekMsc0JBQXNCLEdBQUcsU0FBUztNQUNsQyxJQUFJLEVBQUUsVUFBVSxZQUFZLGFBQWEsQ0FBQyxFQUFFO1FBQ3hDO01BQ0o7TUFDQSxNQUFNLFFBQVEsR0FBRyxHQUFHLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQ3ZGLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7TUFDMUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtNQUNoQixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsYUFBYTtNQUNyQyxJQUFJLElBQUksWUFBWSxnQkFBZ0IsRUFBRTtRQUNsQywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7TUFDckM7SUFDSjtJQUNBLE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxXQUFXLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQ2hGLE1BQU0sR0FDTixNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDO0lBQ3BELElBQUksT0FBTyxLQUFLLE9BQU8sSUFBSSxPQUFPLFlBQVksYUFBYSxFQUFFO01BQ3pELE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDdEQsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUcsQ0FBQztNQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztNQUNqRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYTtNQUNsQyxJQUFJLElBQUksWUFBWSxnQkFBZ0IsRUFBRTtRQUNsQywyQkFBMkIsQ0FBQyxJQUFJLENBQUM7TUFDckM7SUFDSjtJQUNBLGFBQWEsRUFBRTtFQUNuQixDQUFDLENBQUM7QUFDTjtBQUVBLGFBQWEsRUFBRTtBQUVmLFNBQVMsMkJBQTJCLENBQUE7RUFDaEMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7RUFDN0QsSUFBSSxFQUFFLFlBQVksWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzdDO0VBQ0o7RUFDQSxLQUFLLE1BQU0sSUFBSSxJQUFJLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxFQUFFO0lBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7TUFDN0MsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUU7TUFDNUMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNQO01BQ0o7TUFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO01BQzlDO0lBQ0o7SUFDQTtJQUNBLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLEVBQUU7TUFDMUQsSUFBSSxFQUFFLE1BQU0sWUFBWSxpQkFBaUIsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDdkU7TUFDSjtNQUNBLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsSUFBSSxHQUFHLE1BQU07TUFDL0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRDtFQUNKO0VBQ0EsMkJBQTJCLENBQUMsWUFBWSxDQUFDO0FBQzdDO0FBRUEsMkJBQTJCLEVBQUU7QUFFN0IsU0FBUyxPQUFPLENBQUMsR0FBVyxFQUFFLEdBQVc7RUFDckMsSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFO0lBQ2IsT0FBTyxDQUFDO0VBQ1o7RUFDQSxPQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM3QjtBQUVBLFNBQVMsb0JBQW9CLENBQUE7RUFDekIsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUM7RUFDNUUsS0FBSyxNQUFNLE9BQU8sSUFBSSxtQkFBbUIsRUFBRTtJQUN2QyxJQUFJLEVBQUUsT0FBTyxZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDeEMsTUFBTSxnQkFBZ0I7SUFDMUI7SUFDQSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7TUFDakIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUs7TUFDL0IsSUFBSSxJQUFBLHVCQUFXLEVBQUMsU0FBUyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxTQUFTO01BQ3BCO01BQ0E7SUFDSjtFQUNKO0FBQ0o7QUFFQSxTQUFTLG9CQUFvQixDQUFDLFNBQTRCO0VBQ3RELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDO0VBQzVFLEtBQUssTUFBTSxPQUFPLElBQUksbUJBQW1CLEVBQUU7SUFDdkMsSUFBSSxFQUFFLE9BQU8sWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQ3hDLE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtNQUM3QixPQUFPLENBQUMsT0FBTyxHQUFHLElBQUk7TUFDdEI7SUFDSjtFQUNKO0FBQ0o7QUFHTyxNQUFNLGFBQWEsR0FBQSxPQUFBLENBQUEsYUFBQSxHQUFHLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBVTtBQUVsRSxTQUFVLGNBQWMsQ0FBQyxZQUFvQjtFQUMvQyxPQUFRLGFBQXFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUN4RTtBQUVBLFNBQVMsb0JBQW9CLENBQUE7RUFDekIsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7RUFDOUQsSUFBSSxFQUFFLGFBQWEsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzlDLE1BQU0sZ0JBQWdCO0VBQzFCO0VBQ0EsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO0lBQ3ZCLE9BQU8sZUFBZTtFQUMxQjtFQUNBLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0VBQzlELElBQUksRUFBRSxhQUFhLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUM5QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtJQUN2QixPQUFPLGVBQWU7RUFDMUI7RUFDQSxNQUFNLGdCQUFnQjtBQUMxQjtBQUVBLFNBQVMsYUFBYSxDQUFBO0VBQ2xCLE1BQU0saUJBQWlCLEdBQUcsb0JBQW9CLEVBQUUsSUFBSSxLQUFLO0VBQ3pELHlCQUFnQixDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUM7RUFDN0Q7SUFBQztJQUNHLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUMzRSxJQUFJLEVBQUUsZUFBZSxZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDaEQsTUFBTSxnQkFBZ0I7SUFDMUI7SUFDQSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDJCQUFhLEVBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtNQUN4RSx5QkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztJQUM5QztJQUNBLE1BQU0sc0JBQXNCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekYsSUFBSSxFQUFFLHNCQUFzQixZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDdkQsTUFBTSxnQkFBZ0I7SUFDMUI7SUFDQSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDJCQUFhLEVBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFO01BQy9FLHlCQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO0lBQzlDO0VBQ0o7RUFDQTtJQUFFO0lBQ0UsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7SUFDeEQsSUFBSSxFQUFFLFVBQVUsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQzNDLE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFDM0MseUJBQWdCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7SUFFbkQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7SUFDeEQsSUFBSSxFQUFFLFVBQVUsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQzNDLE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUs7SUFDbEMsSUFBSSxTQUFTLEVBQUU7TUFDWCx5QkFBZ0IsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQztJQUMxRCxDQUFDLE1BQ0k7TUFDRCx5QkFBZ0IsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDO0lBQ2xEO0lBQ0EsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7SUFDOUQsSUFBSSxFQUFFLGFBQWEsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQzlDLE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EseUJBQWdCLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDO0VBQ3pFO0VBQ0E7SUFBRTtJQUNFLHlCQUFnQixDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxDQUFDO0VBQzdFO0VBRUEseUJBQWdCLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0Y7QUFFQSxTQUFTLGdCQUFnQixDQUFBO0VBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcseUJBQWdCLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQztFQUNuRSxvQkFBb0IsQ0FBQyxPQUFPLGdCQUFnQixLQUFLLFFBQVEsSUFBSSxJQUFBLHVCQUFXLEVBQUMsZ0JBQWdCLENBQUMsR0FBRyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7RUFFdEg7SUFBQztJQUNHLElBQUksTUFBTSxHQUErQixFQUFFO0lBQzNDLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO01BQ3BFLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLO01BQ3hCO0lBQ0o7SUFFQSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDM0UsSUFBSSxFQUFFLGVBQWUsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQ2hELE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsSUFBQSwyQkFBYSxFQUFDLGVBQWUsRUFBRSxNQUFNLENBQUM7SUFDdEMsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN6RixJQUFJLEVBQUUsc0JBQXNCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN2RCxNQUFNLGdCQUFnQjtJQUMxQjtJQUNBLElBQUEsMkJBQWEsRUFBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUM7RUFDakQ7RUFDQSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztFQUN4RDtJQUFFO0lBQ0UsSUFBSSxFQUFFLFVBQVUsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQzNDLE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsTUFBTSxRQUFRLEdBQUcseUJBQWdCLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztJQUMxRCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtNQUM5QixVQUFVLENBQUMsS0FBSyxHQUFHLEdBQUcsUUFBUSxFQUFFO0lBQ3BDLENBQUMsTUFDSTtNQUNELFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUc7SUFDckM7SUFFQSxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztJQUN4RCxJQUFJLEVBQUUsVUFBVSxZQUFZLGdCQUFnQixDQUFDLEVBQUU7TUFDM0MsTUFBTSxnQkFBZ0I7SUFDMUI7SUFFQSxNQUFNLFNBQVMsR0FBRyx5QkFBZ0IsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO0lBQzdELElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO01BQy9CLFVBQVUsQ0FBQyxLQUFLLEdBQUcsU0FBUztJQUNoQztJQUVBLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0lBQzlELElBQUksRUFBRSxhQUFhLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUM5QyxNQUFNLGdCQUFnQjtJQUMxQjtJQUNBLGFBQWEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLHlCQUFnQixDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUM7RUFDNUU7RUFFQTtFQUNBLE1BQU0sWUFBWSxHQUFHLHlCQUFnQixDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztFQUN2RSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtJQUNsQyxLQUFLLE1BQU0sRUFBRSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDdEMsTUFBTSxNQUFNLEdBQUcsd0JBQXdCLENBQUMsRUFBRSxDQUFDO01BQzNDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtRQUN0QixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO01BQ2pDO0lBQ0o7RUFDSjtFQUVBO0lBQUU7SUFDRSxJQUFJLGdCQUFnQixHQUFHLHlCQUFnQixDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztJQUN4RSxJQUFJLE9BQU8sZ0JBQWdCLEtBQUssUUFBUSxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7TUFDM0UsZ0JBQWdCLEdBQUcsZUFBZTtJQUN0QztJQUNBLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7SUFDMUQsSUFBSSxFQUFFLFFBQVEsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQ3pDLE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJO0lBQ3ZCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO01BQUUsT0FBTyxFQUFFLEtBQUs7TUFBRSxVQUFVLEVBQUU7SUFBSSxDQUFFLENBQUMsQ0FBQztFQUNyRjtFQUVBO0VBQ0EsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoRDtBQUVBLFNBQVMsYUFBYSxDQUFBO0VBQ2xCLGFBQWEsRUFBRTtFQUNmO0VBQ0E7RUFDQSxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLE1BQU0sRUFBRTtJQUNoRjtFQUNKO0VBQ0EsTUFBTSxPQUFPLEdBQWdDLEVBQUU7RUFDL0MsTUFBTSxhQUFhLEdBQTRDLEVBQUU7RUFDakUsSUFBSSxpQkFBd0M7RUFDNUMsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0VBQzNFLElBQUksRUFBRSxlQUFlLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUNoRCxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0VBQzlELElBQUksRUFBRSxhQUFhLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUM5QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO0VBQ3hELElBQUksRUFBRSxVQUFVLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUMzQyxNQUFNLGdCQUFnQjtFQUMxQjtFQUVBO0lBQUU7SUFDRSxpQkFBaUIsR0FBRyxvQkFBb0IsRUFBRTtJQUMxQyxRQUFRLG9CQUFvQixFQUFFO01BQzFCLEtBQUssZUFBZTtRQUNoQixJQUFJLGlCQUFpQixFQUFFO1VBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssaUJBQWlCLENBQUM7UUFDOUQ7UUFDQTtNQUNKLEtBQUssZUFBZTtRQUNoQjtJQUNSO0VBQ0o7RUFFQTtJQUFFO0lBQ0UsUUFBUSxvQkFBb0IsRUFBRTtNQUMxQixLQUFLLGVBQWU7UUFDaEIsTUFBTSxXQUFXLEdBQUcsSUFBQSwyQkFBYSxFQUFDLGVBQWUsQ0FBQztRQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDO01BQ0osS0FBSyxlQUFlO1FBQ2hCO0lBQ1I7RUFDSjtFQUVBO0lBQUU7SUFDRSxNQUFNLHNCQUFzQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLElBQUksRUFBRSxzQkFBc0IsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO01BQ3ZELE1BQU0sZ0JBQWdCO0lBQzFCO0lBQ0EsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLDJCQUFhLEVBQUMsc0JBQXNCLENBQUM7SUFDaEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFO01BQzdCLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsVUFBVSxZQUFZLDBCQUFjLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkg7SUFDQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDM0IsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxVQUFVLFlBQVksMEJBQWMsSUFBSSxVQUFVLENBQUMsRUFBRSxJQUFJLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEg7SUFDQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLEVBQUU7TUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QztJQUNBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsRUFBRTtNQUNwQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLFVBQVUsWUFBWSwyQkFBZSxDQUFDLENBQUM7SUFDOUU7SUFDQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7TUFDakMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7SUFDbEU7SUFDQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsRUFBRTtNQUMxQyxNQUFNLHdCQUF3QixHQUFHLENBQUMsR0FBRyxhQUFhLENBQUM7TUFDbkQsTUFBTSxZQUFZLEdBQUksVUFBc0IsSUFBSyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztNQUM3RyxTQUFTLGlCQUFpQixDQUFDLFVBQXNCO1FBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUU7VUFDM0IsT0FBTyxLQUFLO1FBQ2hCO1FBQ0EsSUFBSSxVQUFVLFlBQVksMkJBQWUsRUFBRTtVQUN2QyxLQUFLLE1BQU0sTUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzFDLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7Y0FDM0IsT0FBTyxJQUFJO1lBQ2Y7VUFDSjtRQUNKLENBQUMsTUFDSTtVQUNELE9BQU8sSUFBSTtRQUNmO1FBQ0EsT0FBTyxLQUFLO01BQ2hCO01BQ0EsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztNQUVyQyxTQUFTLGVBQWUsQ0FBQyxJQUFVO1FBQy9CLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtVQUNuQyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQy9CLE9BQU8sSUFBSTtVQUNmO1FBQ0o7UUFDQSxPQUFPLEtBQUs7TUFDaEI7TUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNqQztFQUNKO0VBRUE7SUFBRTtJQUNFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO0lBQ3hELElBQUksRUFBRSxVQUFVLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUMzQyxNQUFNLGdCQUFnQjtJQUMxQjtJQUNBLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUUsSUFBVSxJQUFLLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDO0lBRXBELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLO0lBQ2xDLElBQUksU0FBUyxFQUFFO01BQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDdEY7RUFDSjtFQUVBO0lBQUU7SUFDRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7SUFDNUQsSUFBSSxFQUFFLGNBQWMsWUFBWSxjQUFjLENBQUMsRUFBRTtNQUM3QyxNQUFNLGdCQUFnQjtJQUUxQjtJQUNBLGNBQWMsQ0FBQyxlQUFlLEVBQUU7SUFDaEMsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO01BQzlCLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBQSxnQkFBVSxFQUFDLENBQ2xDLEdBQUcsRUFDSDtRQUFFLEtBQUssRUFBRTtNQUFZLENBQUUsRUFDdkIsbUJBQW1CLENBQ3RCLENBQUMsQ0FBQztJQUNQLENBQUMsTUFDSTtNQUNELEtBQUssTUFBTSxFQUFFLElBQUksaUJBQWlCLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEdBQUcsaUJBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUU7VUFDUDtRQUNKO1FBQ0EsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFBLGdCQUFVLEVBQUMsQ0FDbEMsS0FBSyxFQUNMO1VBQUUsS0FBSyxFQUFFO1FBQWUsQ0FBRSxFQUMxQixDQUNJLE1BQU0sRUFDTjtVQUFFLEtBQUssRUFBRTtRQUFxQixDQUFFLEVBQ2hDLElBQUksQ0FBQyxPQUFPLENBQ2YsRUFDRCxJQUFBLGdCQUFVLEVBQUMsQ0FDUCxRQUFRLEVBQ1I7VUFDSSxLQUFLLEVBQUUsc0JBQXNCO1VBQzdCLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxFQUFFO1VBQzFCLFlBQVksRUFBRSxXQUFXLElBQUksQ0FBQyxPQUFPLEVBQUU7VUFDdkMsSUFBSSxFQUFFO1NBQ1QsRUFDRCxTQUFTLENBQ1osQ0FBQyxDQUNMLENBQUMsQ0FBQztNQUNQO0lBQ0o7RUFFSjtFQUVBLE1BQU0sV0FBVyxHQUF5QyxFQUFFO0VBRTVELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0VBQzdELElBQUksRUFBRSxZQUFZLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUM3QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE1BQU0sYUFBYSxHQUFHLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUNoRCxHQUFHLENBQUMsSUFBSSxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3ZDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDcEM7SUFDSSxLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsRUFBRTtNQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztNQUM3QixXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBUyxFQUFFLEdBQVMsS0FBSyxPQUFPLENBQzlDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDbkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUN0RSxDQUFDO0lBQ047RUFDSjtFQUVBLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBSztJQUNoQixRQUFRLG9CQUFvQixFQUFFO01BQzFCLEtBQUssZUFBZTtRQUNoQixPQUFPLElBQUEsMkJBQWUsRUFDbEIsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUM3QyxVQUFVLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQy9ELENBQUMsS0FBSyxFQUFFLElBQUksS0FBSyxJQUFBLDBCQUFnQixFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQzNELGFBQWEsRUFDYixpQkFBaUIsQ0FDcEI7TUFDTCxLQUFLLGVBQWU7UUFDaEIsT0FBTyxJQUFBLHlCQUFhLEVBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDO0lBQzlGO0VBQ0osQ0FBQyxFQUFDLENBQUU7RUFFSixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztFQUNqRCxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ1Q7RUFDSjtFQUNBLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7RUFDdEYsTUFBTSxDQUFDLFNBQVMsR0FBRyxFQUFFO0VBQ3JCLElBQUksVUFBVSxLQUFLLENBQUMsRUFBRTtJQUNsQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUMxQixHQUFHLEVBQ0g7TUFBRSxLQUFLLEVBQUUsZUFBZTtNQUFFLElBQUksRUFBRTtJQUFRLENBQUUsRUFDMUMsK0JBQStCLENBQ2xDLENBQUMsQ0FBQztFQUNQLENBQUMsTUFDSTtJQUNELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0VBQzdCO0VBQ0EsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7RUFDOUQsSUFBSSxhQUFhLEVBQUU7SUFDZixhQUFhLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxDQUFDLEdBQ3RDLCtCQUErQixHQUMvQixHQUFHLFVBQVUsYUFBYSxVQUFVLEtBQUssQ0FBQyxHQUFHLE1BQU0sR0FBRyxPQUFPLEVBQUU7RUFDekU7RUFDQSxzQkFBc0IsRUFBRTtBQUM1QjtBQUVBLElBQUksdUJBQXVCLEdBQUcsS0FBSztBQUNuQyxJQUFJLHlCQUFxRDtBQUN6RCxJQUFJLHdCQUF3QixHQUFHLEtBQUs7QUFFcEM7QUFDQSxTQUFTLHNCQUFzQixDQUFBO0VBQzNCLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDO0VBQzFELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDO0VBQzVELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUM7RUFDNUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztFQUMzRCxJQUFJLEVBQUUsV0FBVyxZQUFZLFdBQVcsQ0FBQyxJQUNsQyxFQUFFLFlBQVksWUFBWSxXQUFXLENBQUMsSUFDdEMsRUFBRSxNQUFNLFlBQVksV0FBVyxDQUFDLElBQ2hDLEVBQUUsU0FBUyxZQUFZLFdBQVcsQ0FBQyxFQUFFO0lBQ3hDO0VBQ0o7RUFFQSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7SUFDMUIsdUJBQXVCLEdBQUcsSUFBSTtJQUM5QixJQUFJLE9BQU8sR0FBRyxLQUFLO0lBQ25CLE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBbUIsRUFBRSxNQUFtQixLQUFJO01BQ3hELElBQUksT0FBTyxFQUFFO1FBQ1Q7TUFDSjtNQUNBLE9BQU8sR0FBRyxJQUFJO01BQ2QsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVTtNQUNyQyxPQUFPLEdBQUcsS0FBSztJQUNuQixDQUFDO0lBQ0QsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxNQUFLO01BQ3hDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDO0lBQ3JDLENBQUMsRUFBRTtNQUFFLE9BQU8sRUFBRTtJQUFJLENBQUUsQ0FBQztJQUNyQixZQUFZLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLE1BQUs7TUFDekMsTUFBTSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7SUFDckMsQ0FBQyxFQUFFO01BQUUsT0FBTyxFQUFFO0lBQUksQ0FBRSxDQUFDO0lBQ3JCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBSztNQUNuQyxzQkFBc0IsRUFBRTtJQUM1QixDQUFDLEVBQUU7TUFBRSxPQUFPLEVBQUU7SUFBSSxDQUFFLENBQUM7SUFDckIsSUFBSSxPQUFPLGNBQWMsS0FBSyxXQUFXLEVBQUU7TUFDdkMseUJBQXlCLEdBQUcsSUFBSSxjQUFjLENBQUMsTUFBSztRQUNoRCxzQkFBc0IsRUFBRTtNQUM1QixDQUFDLENBQUM7TUFDRix5QkFBeUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO0lBQ2xEO0VBQ0o7RUFFQSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztFQUNoRCxJQUFJLEVBQUUsS0FBSyxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDdEMsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJO0lBQ3ZCLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUN6QyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLO0lBQzFCO0VBQ0o7RUFFQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQztFQUN6RSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLFlBQVksSUFBSTtFQUN4QyxNQUFNLHFCQUFxQixHQUFHLFlBQVksR0FBRyxXQUFXLENBQUMsV0FBVyxHQUFHLENBQUM7RUFDeEUsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU07RUFDbEMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLHFCQUFxQjtFQUN6QyxJQUFJLHFCQUFxQixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUU7SUFDNUUsWUFBWSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsVUFBVTtFQUNwRDtFQUNBLElBQUkscUJBQXFCLElBQUksU0FBUyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7SUFDakUsd0JBQXdCLEdBQUcsSUFBSTtJQUMvQixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7SUFDdEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFLO01BQ25CLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUM3QyxDQUFDLEVBQUUsR0FBRyxDQUFDO0VBQ1g7RUFDQSxJQUFJLENBQUMscUJBQXFCLEVBQUU7SUFDeEIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO0VBQzdDO0FBQ0o7QUFFQSxTQUFTLHdCQUF3QixDQUFBO0VBQzdCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDO0VBQzVELElBQUksRUFBRSxZQUFZLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUM3QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO0VBQ3hELElBQUksRUFBRSxVQUFVLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUMzQyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBSztJQUN0QyxZQUFZLENBQUMsV0FBVyxHQUFHLDBCQUEwQixVQUFVLENBQUMsS0FBSyxFQUFFO0lBQ3ZFLGFBQWEsRUFBRTtFQUNuQixDQUFDLENBQUM7QUFDTjtBQUVBLFNBQVMsaUJBQWlCLENBQUE7RUFDdEIsd0JBQXdCLEVBQUU7RUFDMUIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7RUFDeEQsSUFBSSxFQUFFLFVBQVUsWUFBWSxXQUFXLENBQUMsRUFBRTtJQUN0QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDO0VBRW5ELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0VBQzlELElBQUksRUFBRSxhQUFhLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUM5QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0VBQzdELElBQUksRUFBRSxZQUFZLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtJQUM3QyxNQUFNLGdCQUFnQjtFQUMxQjtFQUNBLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBSztJQUN6QyxLQUFLLE1BQU0sSUFBSSxJQUFJLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxFQUFFO01BQ2hELE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEdBQUcsc0NBQXNDLEdBQUcsMENBQTBDO01BQ3pILE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLElBQUk7TUFDeEQsTUFBTSxJQUFJLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO01BQ2pHLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7SUFDcEM7SUFDQSxhQUFhLEVBQUU7RUFDbkIsQ0FBQyxDQUFDO0FBQ047QUFFQSxpQkFBaUIsRUFBRTtBQUVuQixTQUFTLHVCQUF1QixDQUFBO0VBQzVCLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDO0VBQzVELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDO0VBQzVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDO0VBQzFELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7RUFDaEUsSUFBSSxFQUFFLFlBQVksWUFBWSxpQkFBaUIsQ0FBQyxJQUN6QyxFQUFFLFlBQVksWUFBWSxpQkFBaUIsQ0FBQyxJQUM1QyxFQUFFLFdBQVcsWUFBWSxXQUFXLENBQUMsSUFDckMsRUFBRSxjQUFjLFlBQVksaUJBQWlCLENBQUMsRUFBRTtJQUNuRDtFQUNKO0VBQ0EsTUFBTSxZQUFZLEdBQUcsWUFBWTtFQUNqQyxNQUFNLFdBQVcsR0FBRyxZQUFZO0VBQ2hDLE1BQU0sS0FBSyxHQUFHLFdBQVc7RUFDekIsTUFBTSxjQUFjLEdBQUcsY0FBYztFQUVyQyxTQUFTLE9BQU8sQ0FBQyxJQUFhO0lBQzFCLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7SUFDdkMsWUFBWSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztJQUNyRCxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSTtJQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQztJQUNwRCxJQUFJLElBQUksRUFBRTtNQUNOLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO01BQ3hELElBQUksVUFBVSxZQUFZLGdCQUFnQixFQUFFO1FBQ3hDLE1BQU0sY0FBYyxHQUFJLEtBQXNCLElBQUk7VUFDOUMsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLFdBQVcsRUFBRTtZQUNwQztVQUNKO1VBQ0EsS0FBSyxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUM7VUFDMUQsVUFBVSxDQUFDLEtBQUssRUFBRTtRQUN0QixDQUFDO1FBQ0QsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUM7UUFDdkQsVUFBVSxDQUFDLEtBQUssRUFBRTtNQUN0QjtJQUNKLENBQUMsTUFDSTtNQUNELFlBQVksQ0FBQyxLQUFLLEVBQUU7SUFDeEI7RUFDSjtFQUVBLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDM0QsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMzRCxjQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzlELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUcsS0FBSyxJQUFJO0lBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtNQUN0QztJQUNKO0lBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtNQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDO01BQ2Q7SUFDSjtJQUNBLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUU7TUFDckI7SUFDSjtJQUNBLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQ3ZELHlGQUF5RixDQUM1RixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN6RCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDaEM7SUFDSjtJQUNBLE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQztJQUN6QyxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ25FLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsYUFBYSxLQUFLLFlBQVksRUFBRTtNQUMzRCxLQUFLLENBQUMsY0FBYyxFQUFFO01BQ3RCLFdBQVcsQ0FBQyxLQUFLLEVBQUU7SUFDdkIsQ0FBQyxNQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUNoQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEtBQUssV0FBVyxDQUFDLEVBQUU7TUFDeEYsS0FBSyxDQUFDLGNBQWMsRUFBRTtNQUN0QixZQUFZLENBQUMsS0FBSyxFQUFFO0lBQ3hCO0VBQ0osQ0FBQyxDQUFDO0VBQ0YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQUU7RUFBTyxDQUFFLEtBQUk7SUFDL0UsSUFBSSxPQUFPLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7TUFDaEQsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUNsQjtFQUNKLENBQUMsQ0FBQztBQUNOO0FBRUEsdUJBQXVCLEVBQUU7QUFFekIsU0FBUyxxQkFBcUIsQ0FBQTtFQUMxQixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQztFQUM1RCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUM7RUFDcEUsSUFBSSxFQUFFLFlBQVksWUFBWSxpQkFBaUIsQ0FBQyxJQUN6QyxFQUFFLGdCQUFnQixZQUFZLFdBQVcsQ0FBQyxFQUFFO0lBQy9DO0VBQ0o7RUFDQSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQUs7SUFDeEMsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLG9CQUFvQjtJQUNuRCx5QkFBZ0IsQ0FBQyxTQUFTLEVBQUU7SUFDNUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7RUFDNUIsQ0FBQyxDQUFDO0FBQ047QUFFQSxxQkFBcUIsRUFBRTtBQUV2QixTQUFTLGdDQUFnQyxDQUFBO0VBQ3JDLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7RUFDaEUsSUFBSSxFQUFFLGNBQWMsWUFBWSxtQkFBbUIsQ0FBQyxFQUFFO0lBQ2xEO0VBQ0o7RUFDQSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztFQUM5RCxJQUFJLEVBQUUsYUFBYSxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDOUM7RUFDSjtFQUNBLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDO0VBQzFELElBQUksRUFBRSxXQUFXLFlBQVksY0FBYyxDQUFDLEVBQUU7SUFDMUM7RUFDSjtFQUNBLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBSztJQUMxQyxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDM0MsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3hDLGFBQWEsRUFBRTtFQUNuQixDQUFDLENBQUM7RUFFRixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztFQUM5RCxJQUFJLEVBQUUsYUFBYSxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDOUM7RUFDSjtFQUNBLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBSztJQUMxQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDeEMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ3JDLGFBQWEsRUFBRTtFQUNuQixDQUFDLENBQUM7QUFFTjtBQUVBLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsWUFBVztFQUN2QyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztFQUM3RCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQztFQUM5RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztFQUN2RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLElBQzdELFFBQVEsQ0FBQyxhQUFhLENBQUMsMkJBQTJCLENBQUM7RUFDMUQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7RUFDN0QsSUFBSSxFQUFFLGFBQWEsWUFBWSxXQUFXLENBQUMsSUFDcEMsRUFBRSxZQUFZLFlBQVksZ0JBQWdCLENBQUMsSUFDM0MsRUFBRSxXQUFXLFlBQVksV0FBVyxDQUFDLEVBQUU7SUFDMUMsTUFBTSxnQkFBZ0I7RUFDMUI7RUFDQSxZQUFZLEVBQUUsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7RUFDL0MsWUFBWSxFQUFFLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO0VBQy9DLGdDQUFnQyxFQUFFO0VBQ2xDLGdCQUFnQixFQUFFO0VBQ2xCLElBQUk7SUFDQSxNQUFNLElBQUEseUJBQWEsR0FBRTtFQUN6QixDQUFDLENBQUMsTUFBTTtJQUNKLGFBQWEsQ0FBQyxXQUFXLEdBQUcsdUJBQXVCO0lBQ25ELFlBQVksQ0FBQyxXQUFXLEdBQUcsK0JBQStCO0lBQzFELFdBQVcsQ0FBQyxXQUFXLEdBQUcsNkRBQTZEO0lBQ3ZGLFlBQVksRUFBRSxZQUFZLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQztJQUNoRCxZQUFZLEVBQUUsWUFBWSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUM7SUFDaEQ7RUFDSjtFQUNBLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLEVBQUU7SUFDdEUsSUFBSSxPQUFPLFlBQVksV0FBVyxFQUFFO01BQ2hDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSztJQUMxQjtFQUNKO0VBQ0EsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsRUFBRTtJQUN0RSxJQUFJLE9BQU8sWUFBWSxXQUFXLEVBQUU7TUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTTtJQUNsQztFQUNKO0VBQ0EsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7RUFDeEQsSUFBSSxFQUFFLFVBQVUsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzNDLE1BQU0sZ0JBQWdCO0VBQzFCO0VBQ0EsTUFBTSxRQUFRLEdBQUcsSUFBQSwyQkFBZSxHQUFFO0VBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQUU7RUFDdEUsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLFFBQVEsRUFBRTtFQUM5QixZQUFZLEVBQUUsWUFBWSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUM7RUFDaEQsWUFBWSxFQUFFLFlBQVksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDO0VBQ2hELFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDNUMsYUFBYSxFQUFFO0VBQ2YsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztFQUM1RCxJQUFJLFNBQVMsWUFBWSxpQkFBaUIsRUFBRTtJQUN4QyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUEsMkJBQWUsRUFBQyxNQUFNLEVBQUUsSUFBQSxnQkFBVSxFQUFDLENBQUMsR0FBRyxFQUN6RCw4REFBOEQsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUN0RSx1R0FBdUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUMvRyx3R0FBd0csRUFBRSxDQUFDLElBQUksQ0FBQyxFQUNoSCxvREFBb0QsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNoRTtBQUNKLENBQUMsQ0FBQztBQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFHLEtBQUssSUFBSTtFQUM5QyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sWUFBWSxPQUFPLENBQUMsRUFBRTtJQUNwQztFQUNKO0VBRUEsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7RUFDNUQsSUFBSSxVQUFVLFlBQVksaUJBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFO0lBQ2pFLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUM7SUFDOUQsSUFBSSxHQUFHLFlBQVksYUFBYSxFQUFFO01BQzlCLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7SUFDbkM7SUFDQTtFQUNKO0VBRUEsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUM7RUFDaEUsSUFBSSxZQUFZLFlBQVksaUJBQWlCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFO0lBQ3JFLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUM7SUFDaEUsSUFBSSxHQUFHLFlBQVksYUFBYSxFQUFFO01BQzlCLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7SUFDckM7SUFDQTtFQUNKO0VBRUEsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO0VBQzNELElBQUksYUFBYSxZQUFZLFdBQVcsRUFBRTtJQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7TUFDbkM7SUFDSjtJQUNBLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRSxhQUFhLEVBQUU7SUFDZjtFQUNKO0VBRUEsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUM7RUFDbkUsSUFBSSxhQUFhLFlBQVksV0FBVyxFQUFFO0lBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtNQUNuQztJQUNKO0lBQ0EsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BFLGFBQWEsRUFBRTtFQUNuQjtBQUNKLENBQUMsQ0FBQzs7Ozs7Ozs7O0FDOW1DRjs7Ozs7QUFLTSxTQUFVLGdCQUFnQixDQUM1QixPQUFZLEVBQ1osU0FBWSxFQUNaLFdBQTZDO0VBRTdDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7SUFDdEIsT0FBTyxDQUFDLFNBQVMsQ0FBQztFQUN0QjtFQUVBLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNO0VBQzdCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUU7SUFDcEQsSUFBSSxPQUFPLEdBQUcsQ0FBQztJQUNmLEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO01BQ2xDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDO01BQ3BELElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNkLE9BQU8sR0FBRyxNQUFNO1FBQ2hCO01BQ0o7SUFDSjtJQUNBLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRTtNQUNiO01BQ0EsUUFBUSxHQUFHLEtBQUs7TUFDaEI7SUFDSjtJQUNBO0lBQ0E7RUFDSjtFQUVBLE9BQU8sQ0FDSCxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUM3QixTQUFTLEVBQ1QsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUM3QjtBQUNMOzs7Ozs7Ozs7QUN4Q0E7QUFDQSxNQUFNLDJCQUEyQixHQUU3QjtFQUNBLFdBQVcsRUFBRTtJQUFFLEtBQUssRUFBRSxJQUFJO0lBQUUsSUFBSSxFQUFFO0VBQVcsQ0FBRTtFQUMvQyxZQUFZLEVBQUU7SUFBRSxLQUFLLEVBQUUsSUFBSTtJQUFFLElBQUksRUFBRTtFQUFhLENBQUU7RUFDbEQsV0FBVyxFQUFFO0lBQUUsS0FBSyxFQUFFLElBQUk7SUFBRSxJQUFJLEVBQUU7RUFBWTtDQUNqRDtBQVFEO0FBQ00sU0FBVSx5QkFBeUIsQ0FBQyxJQUFZO0VBQ2xELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO0VBQzdCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUUsSUFBSSxJQUFJO0lBQzlCLE1BQU0sS0FBSyxHQUFHLDJCQUEyQixDQUFDLElBQUksQ0FBQztJQUMvQyxPQUFPLEtBQUssSUFBSTtNQUFFLEtBQUssRUFBRSxJQUFJO01BQUUsSUFBSSxFQUFFO0lBQUksQ0FBRTtFQUMvQyxDQUFDLENBQUM7RUFDRixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFFLElBQUksSUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztFQUN4RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFFLElBQUksSUFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztFQUN0RCxPQUFPO0lBQ0gsS0FBSztJQUNMLElBQUk7SUFDSixXQUFXLEVBQUUsS0FBSyxLQUFLO0dBQzFCO0FBQ0w7Ozs7Ozs7OztBQ3pCQSxTQUFTLGtCQUFrQixDQUFDLEtBQTZCO0VBQ3JELFFBQVEsT0FBTyxLQUFLO0lBQ2hCLEtBQUssUUFBUTtNQUNULE9BQU8sSUFBSSxLQUFLLEVBQVc7SUFDL0IsS0FBSyxRQUFRO01BQ1QsT0FBTyxJQUFJLEtBQUssRUFBVztJQUMvQixLQUFLLFNBQVM7TUFDVixPQUFPLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSTtFQUNsQztBQUNKO0FBRUEsU0FBUyxrQkFBa0IsQ0FBQyxFQUFpQjtFQUN6QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3BCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0VBQzdCLFFBQVEsTUFBTTtJQUNWLEtBQUssR0FBRztNQUFFO01BQ04sT0FBTyxLQUFLO0lBQ2hCLEtBQUssR0FBRztNQUFFO01BQ04sT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQzVCLEtBQUssR0FBRztNQUFFO01BQ04sT0FBTyxLQUFLLEtBQUssR0FBRyxHQUFHLElBQUksR0FBRyxLQUFLO0VBQzNDO0VBQ0EsTUFBTSxrQkFBa0IsRUFBRSxFQUFFO0FBQ2hDO0FBRUEsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFXO0VBQ2pDLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQ7QUFFTSxNQUFPLGdCQUFnQjtFQUN6QixPQUFPLFlBQVksQ0FBQyxhQUFxQjtJQUNyQyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUM7SUFDdkQsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7TUFDNUI7SUFDSjtJQUNBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtNQUMzQjtJQUNKO0lBQ0EsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7RUFDckM7RUFDQSxPQUFPLFlBQVksQ0FBQyxhQUFxQixFQUFFLEtBQTZCO0lBQ3BFLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxhQUFhLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUN2RTtFQUNBLE9BQU8sZUFBZSxDQUFDLGFBQXFCO0lBQ3hDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQztFQUMvQztFQUNBLE9BQU8sU0FBUyxDQUFBO0lBQ1osWUFBWSxDQUFDLEtBQUssRUFBRTtFQUN4QjtFQUNBLFdBQVcsU0FBUyxDQUFBO0lBQ2hCLElBQUksTUFBTSxHQUE4QyxFQUFFO0lBQzFELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO01BQzFDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQy9CLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQ3pCO01BQ0o7TUFDQSxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUN2QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUMzQjtNQUNKO01BQ0EsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzFCO01BQ0o7TUFDQSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO0lBQzNDO0lBQ0EsT0FBTyxNQUFNO0VBQ2pCOztBQUNILE9BQUEsQ0FBQSxnQkFBQSxHQUFBLGdCQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5cbmV4cG9ydCB0eXBlIFRyZWVOb2RlID0gc3RyaW5nIHwgVHJlZU5vZGVbXTtcblxuZnVuY3Rpb24gZ2V0Q2hpbGRyZW4obm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnRbXSB7XG4gICAgY29uc3QgcGFyZW50X2xpID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF9saSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50X3VsID0gcGFyZW50X2xpLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X3VsIGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBmb3IgKGxldCBjaGlsZEluZGV4ID0gMDsgY2hpbGRJbmRleCA8IHBhcmVudF91bC5jaGlsZHJlbi5sZW5ndGg7IGNoaWxkSW5kZXgrKykge1xuICAgICAgICBpZiAocGFyZW50X3VsLmNoaWxkcmVuW2NoaWxkSW5kZXhdICE9PSBwYXJlbnRfbGkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvdGVudGlhbFNpYmxpbmdFbnRyeSA9IHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4ICsgMV0/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwb3RlbnRpYWxTaWJsaW5nRW50cnkgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFycmF5XG4gICAgICAgICAgICAuZnJvbShwb3RlbnRpYWxTaWJsaW5nRW50cnkuY2hpbGRyZW4pXG4gICAgICAgICAgICAuZmlsdGVyKChlKTogZSBpcyBIVE1MTElFbGVtZW50ID0+IGUgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIGUuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KVxuICAgICAgICAgICAgLm1hcChlID0+IGUuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyhub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBnZXRDaGlsZHJlbihub2RlKSkge1xuICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCAhPT0gbm9kZS5jaGVja2VkKSB7XG4gICAgICAgICAgICBjaGlsZC5jaGVja2VkID0gbm9kZS5jaGVja2VkO1xuICAgICAgICAgICAgY2hpbGQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyhjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFBhcmVudChub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogSFRNTElucHV0RWxlbWVudCB8IHZvaWQge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudD8ucGFyZW50RWxlbWVudD8ucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNhbmRpZGF0ZTogSFRNTExJRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHBhcmVudF91bC5jaGlsZHJlbikge1xuICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIGNoaWxkLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgY2FuZGlkYXRlID0gY2hpbGQ7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGQgPT09IHBhcmVudF9saSAmJiBjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYW5kaWRhdGUuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlQW5jZXN0b3JzKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSk7XG4gICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZm91bmRDaGVja2VkID0gZmFsc2U7XG4gICAgbGV0IGZvdW5kVW5jaGVja2VkID0gZmFsc2U7XG4gICAgbGV0IGZvdW5kSW5kZXRlcm1pbmF0ZSA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBnZXRDaGlsZHJlbihwYXJlbnQpKSB7XG4gICAgICAgIGlmIChjaGlsZC5jaGVja2VkKSB7XG4gICAgICAgICAgICBmb3VuZENoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm91bmRVbmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZC5pbmRldGVybWluYXRlKSB7XG4gICAgICAgICAgICBmb3VuZEluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZEluZGV0ZXJtaW5hdGUgfHwgZm91bmRDaGVja2VkICYmIGZvdW5kVW5jaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZm91bmRDaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgdXBkYXRlQW5jZXN0b3JzKHBhcmVudCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcihub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGUgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKHRhcmdldCk7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyh0YXJnZXQpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrTGlzdGVuZXJzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcihlbGVtZW50LmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBhcHBseUNoZWNrTGlzdGVuZXJzKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZTogVHJlZU5vZGUpOiBIVE1MTElFbGVtZW50IHtcbiAgICBpZiAodHlwZW9mIHRyZWVOb2RlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodHJlZU5vZGVbMF0gPT09IFwiLVwiKSB7XG4gICAgICAgICAgICB0cmVlTm9kZSA9IHRyZWVOb2RlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodHJlZU5vZGVbMF0gPT09IFwiK1wiKSB7XG4gICAgICAgICAgICB0cmVlTm9kZSA9IHRyZWVOb2RlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9kZSA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiY2hlY2tib3hcIixcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSxcbiAgICAgICAgICAgICAgICAgICAgLi4uKGNoZWNrZWQgJiYgeyBjaGVja2VkOiBcImNoZWNrZWRcIiB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgIHsgZm9yOiB0cmVlTm9kZS5yZXBsYWNlQWxsKFwiIFwiLCBcIl9cIikgfSxcbiAgICAgICAgICAgICAgICB0cmVlTm9kZVxuICAgICAgICAgICAgXVxuICAgICAgICBdKTtcbiAgICAgICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBjcmVhdGVIVE1MKFtcInVsXCIsIHsgY2xhc3M6IFwiY2hlY2tib3hcIiB9XSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJlZU5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0cmVlTm9kZVtpXTtcbiAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQobWFrZUNoZWNrYm94VHJlZU5vZGUobm9kZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcImxpXCIsIGxpc3RdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ2hlY2tib3hUcmVlKHRyZWVOb2RlOiBUcmVlTm9kZSkge1xuICAgIGxldCByb290ID0gbWFrZUNoZWNrYm94VHJlZU5vZGUodHJlZU5vZGUpLmNoaWxkcmVuWzBdO1xuICAgIGlmICghKHJvb3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMocm9vdCk7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhyb290KSkge1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxuICAgIHJldHVybiByb290O1xufVxuXG5mdW5jdGlvbiBnZXRMZWF2ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCByZXN1bHQ6IEhUTUxJbnB1dEVsZW1lbnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gZWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGdldENoaWxkcmVuKGlucHV0KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGdldExlYXZlcyhpbnB1dCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMZWFmU3RhdGVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMobm9kZSkpIHtcbiAgICAgICAgc3RhdGVzW2xlYWYuaWQucmVwbGFjZUFsbChcIl9cIiwgXCIgXCIpXSA9IGxlYWYuY2hlY2tlZDtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCwgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSkge1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMobm9kZSkpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildO1xuICAgICAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBsZWFmLmNoZWNrZWQgPSBzdGF0ZTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKGxlYWYpO1xuICAgIH1cbn1cbiIsIi8qKlxuICogUHVyZSBwcm9qZWN0aW9uIG9mIGhvdyBhIGdhY2hhIGNvaW4gY2FuIGJlIGFjcXVpcmVkLlxuICogU2hvcCBkZW5vbWluYXRpb24gKEdvbGQvQVApIGlzIHNlcGFyYXRlIGZyb20gR3VhcmRpYW4vQm9zcyBzdGFnZSBkcm9wcy5cbiAqL1xuXG5leHBvcnQgdHlwZSBHYWNoYVNob3BDaGFubmVsID0ge1xuICAgIHJlYWRvbmx5IGtpbmQ6IFwic2hvcFwiO1xuICAgIHJlYWRvbmx5IGN1cnJlbmN5OiBcIkdvbGRcIiB8IFwiQVBcIjtcbiAgICByZWFkb25seSBhdmFpbGFibGU6IGJvb2xlYW47XG4gICAgLyoqIFdoeSBzaG9wIGlzIHVuYXZhaWxhYmxlIHdoZW4gYXZhaWxhYmxlPWZhbHNlLiAqL1xuICAgIHJlYWRvbmx5IHJlYXNvbj86IFwibm90X2Zvcl9zYWxlXCIgfCBcIm5vdF9hdmFpbGFibGVcIjtcbn07XG5cbmV4cG9ydCB0eXBlIEdhY2hhU3RhZ2VDaGFubmVsID0ge1xuICAgIHJlYWRvbmx5IGtpbmQ6IFwic3RhZ2VcIjtcbiAgICByZWFkb25seSBtYXA6IHN0cmluZztcbiAgICByZWFkb25seSBuZWVkQm9zczogYm9vbGVhbjtcbiAgICByZWFkb25seSBsYWJlbDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWwgPSBHYWNoYVNob3BDaGFubmVsIHwgR2FjaGFTdGFnZUNoYW5uZWw7XG5cbmV4cG9ydCB0eXBlIEdhY2hhQWNxdWlzaXRpb25JbnB1dCA9IHtcbiAgICByZWFkb25seSBhcDogYm9vbGVhbjtcbiAgICAvKiogUHJvZHVjdCBpcyBsaXN0ZWQgaW4gdGhlIGxpdmUgc2hvcCBjYXRhbG9nIChlbmFibGVkKS4gKi9cbiAgICByZWFkb25seSBlbmFibGVkOiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFRydWUgb25seSB3aGVuIHRoZSBwcm9kdWN0IGNhbiBhY3R1YWxseSBiZSBwdXJjaGFzZWQuXG4gICAgICogSkZUU0UgYE5vYnV5PTFgIHByb2R1Y3RzIHN0YXkgZW5hYmxlZCBpbiBjYXRhbG9nIGJ1dCByZWplY3Qgc2hvcCBidXlzLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IHB1cmNoYXNhYmxlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgR2FjaGFTb3VyY2VJbnB1dCA9XG4gICAgfCB7IHJlYWRvbmx5IGtpbmQ6IFwic2hvcFwiOyByZWFkb25seSBhcDogYm9vbGVhbiB9XG4gICAgfCB7IHJlYWRvbmx5IGtpbmQ6IFwic3RhZ2VcIjsgcmVhZG9ubHkgbWFwOiBzdHJpbmc7IHJlYWRvbmx5IG5lZWRCb3NzOiBib29sZWFuIH07XG5cbi8qKiBTcGxpdCBDYW1lbENhc2Ugc3RhZ2UgaWRzIGZyb20gSkZUU0UgR3VhcmRpYW5TdGFnZXMuanNvbiBpbnRvIHJlYWRhYmxlIGxhYmVscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBtYXBcbiAgICAgICAgLnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0pL2csIFwiJDEgJDJcIilcbiAgICAgICAgLnJlcGxhY2UoLyhbQS1aXSspKFtBLVpdW2Etel0pL2csIFwiJDEgJDJcIilcbiAgICAgICAgLnRyaW0oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YWdlQ2hhbm5lbExhYmVsKG1hcDogc3RyaW5nLCBuZWVkQm9zczogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgY29uc3QgcHJldHR5ID0gcHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCk7XG4gICAgaWYgKCFuZWVkQm9zcykge1xuICAgICAgICByZXR1cm4gcHJldHR5O1xuICAgIH1cbiAgICAvLyBBdm9pZCBcIkJvc3MgwrcgQXRsYW50aXMgQm9zc1wiIOKAlCBzdGFnZSBpZHMgZW5kIGluIEJvc3MgYWxyZWFkeS5cbiAgICBjb25zdCB3aXRob3V0Qm9zc1N1ZmZpeCA9IHByZXR0eS5yZXBsYWNlKC9cXHMrQm9zcyQvaSwgXCJcIik7XG4gICAgcmV0dXJuIGBCb3NzIMK3ICR7d2l0aG91dEJvc3NTdWZmaXh9YDtcbn1cblxuLyoqXG4gKiBQcm9qZWN0IHNob3AgKyBzdGFnZSBhY3F1aXNpdGlvbiBjaGFubmVscyBmb3IgYSBnYWNoYSBjb2luLlxuICpcbiAqIC0gUHVyY2hhc2FibGUgc2hvcCDihpIgR29sZC9BUCBwaWxsLlxuICogLSBDYXRhbG9nLWxpc3RlZCBidXQgTm9idXkgKGBwdXJjaGFzYWJsZT1mYWxzZWAsIGBlbmFibGVkPXRydWVgKSDihpIgTm90IGZvciBzYWxlXG4gKiAgIChzdGlsbCBzaG93biB3aGVuIHN0YWdlcyBleGlzdCBzbyBwbGF5ZXJzIGRvIG5vdCBhc3N1bWUgYSBwcmljZSkuXG4gKiAtIEZ1bGx5IGRpc2FibGVkIHNob3Agd2l0aCBubyBzdGFnZXMg4oaSIE5vdCBhdmFpbGFibGUuXG4gKiAtIERpc2FibGVkIHNob3Agd2l0aCBzdGFnZXMg4oaSIHN0YWdlcyBvbmx5IChvbWl0IHNob3AgY2hyb21lKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbHMoXG4gICAgZ2FjaGE6IEdhY2hhQWNxdWlzaXRpb25JbnB1dCxcbiAgICBzb3VyY2VzOiByZWFkb25seSBHYWNoYVNvdXJjZUlucHV0W10sXG4pOiByZWFkb25seSBHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbFtdIHtcbiAgICBjb25zdCBjaGFubmVsczogR2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxbXSA9IFtdO1xuICAgIGNvbnN0IHN0YWdlU291cmNlcyA9IHNvdXJjZXMuZmlsdGVyKFxuICAgICAgICAoc291cmNlKTogc291cmNlIGlzIEV4dHJhY3Q8R2FjaGFTb3VyY2VJbnB1dCwgeyBraW5kOiBcInN0YWdlXCIgfT4gPT5cbiAgICAgICAgICAgIHNvdXJjZS5raW5kID09PSBcInN0YWdlXCIsXG4gICAgKTtcbiAgICBjb25zdCBoYXNTdGFnZSA9IHN0YWdlU291cmNlcy5sZW5ndGggPiAwO1xuICAgIGNvbnN0IGN1cnJlbmN5ID0gZ2FjaGEuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIjtcblxuICAgIGlmIChnYWNoYS5wdXJjaGFzYWJsZSkge1xuICAgICAgICBjaGFubmVscy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic2hvcFwiLFxuICAgICAgICAgICAgY3VycmVuY3ksXG4gICAgICAgICAgICBhdmFpbGFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZ2FjaGEuZW5hYmxlZCkge1xuICAgICAgICAvLyBMaXN0ZWQgaW4gc2hvcCBVSSAvIEFQSSBidXQgYmxvY2tlZCBieSBOb2J1eSDigJQgbmV2ZXIgaW1wbHkgYSBidXkgcGF0aC5cbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYXNvbjogXCJub3RfZm9yX3NhbGVcIixcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghaGFzU3RhZ2UpIHtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInNob3BcIixcbiAgICAgICAgICAgIGN1cnJlbmN5LFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYXNvbjogXCJub3RfYXZhaWxhYmxlXCIsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNlZW5NYXBzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBzdGFnZSBvZiBzdGFnZVNvdXJjZXMpIHtcbiAgICAgICAgaWYgKHNlZW5NYXBzLmhhcyhzdGFnZS5tYXApKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzZWVuTWFwcy5hZGQoc3RhZ2UubWFwKTtcbiAgICAgICAgY2hhbm5lbHMucHVzaCh7XG4gICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICBtYXA6IHN0YWdlLm1hcCxcbiAgICAgICAgICAgIG5lZWRCb3NzOiBzdGFnZS5uZWVkQm9zcyxcbiAgICAgICAgICAgIGxhYmVsOiBzdGFnZUNoYW5uZWxMYWJlbChzdGFnZS5tYXAsIHN0YWdlLm5lZWRCb3NzKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5uZWxzO1xufVxuXG4vKiogUGFyc2UgcHJvZHVjdCBpbmRleGVzIHdpdGggTm9idXniiaAwIGZyb20gSkZUU0UgU2hvcF9JbmkzLnhtbCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMoc2hvcFhtbDogc3RyaW5nKTogUmVhZG9ubHlTZXQ8bnVtYmVyPiB7XG4gICAgY29uc3Qgbm9idXkgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIHNob3BYbWwubWF0Y2hBbGwoLzxQcm9kdWN0XFxzKyhbXj5dKz8pXFwvPz4vZykpIHtcbiAgICAgICAgY29uc3QgYXR0cnMgPSBtYXRjaFsxXSA/PyBcIlwiO1xuICAgICAgICBjb25zdCBpbmRleE1hdGNoID0gYXR0cnMubWF0Y2goL1xcYkluZGV4PVwiKFxcZCspXCIvKTtcbiAgICAgICAgY29uc3Qgbm9idXlNYXRjaCA9IGF0dHJzLm1hdGNoKC9cXGJOb2J1eT1cIihcXGQrKVwiLyk7XG4gICAgICAgIGlmICghaW5kZXhNYXRjaCB8fCAhbm9idXlNYXRjaCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vYnV5TWF0Y2hbMV0gIT09IFwiMFwiKSB7XG4gICAgICAgICAgICBub2J1eS5hZGQoTnVtYmVyKGluZGV4TWF0Y2hbMV0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9idXk7XG59XG4iLCJ0eXBlIFRhZ19uYW1lID0ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xudHlwZSBBdHRyaWJ1dGVzID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbnR5cGUgSFRNTF9ub2RlPFQgZXh0ZW5kcyBUYWdfbmFtZT4gPSBbVCwgLi4uKEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IEF0dHJpYnV0ZXMpW11dO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSFRNTDxUIGV4dGVuZHMgVGFnX25hbWU+KG5vZGU6IEhUTUxfbm9kZTxUPik6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZVswXSk7XG4gICAgZnVuY3Rpb24gaGFuZGxlKHBhcmFtZXRlcjogQXR0cmlidXRlcyB8IEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlciA9PT0gXCJzdHJpbmdcIiB8fCBwYXJhbWV0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQocGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBhcmFtZXRlcikpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNyZWF0ZUhUTUwocGFyYW1ldGVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHBhcmFtZXRlcltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFuZGxlKG5vZGVbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuaW1wb3J0IHtcbiAgICBwcmV0dHlHdWFyZGlhbk1hcE5hbWUsXG4gICAgcHJvamVjdEdhY2hhQWNxdWlzaXRpb25DaGFubmVscyxcbiAgICBzdGFnZUNoYW5uZWxMYWJlbCxcbiAgICB0eXBlIEdhY2hhU291cmNlSW5wdXQsXG59IGZyb20gJy4vZ2FjaGFBY3F1aXNpdGlvbic7XG5pbXBvcnQgeyBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5IH0gZnJvbSAnLi9wcmlvcml0eVN0YXRIZWFkZXJzJztcblxuZXhwb3J0IHsgcHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB9IGZyb20gJy4vcHJpb3JpdHlTdGF0SGVhZGVycyc7XG5leHBvcnQgdHlwZSB7IFByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkgfSBmcm9tICcuL3ByaW9yaXR5U3RhdEhlYWRlcnMnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVycyA9IFtcIk5pa2lcIiwgXCJMdW5MdW5cIiwgXCJMdWN5XCIsIFwiU2h1YVwiLCBcIkRoYW5waXJcIiwgXCJQb2NoaVwiLCBcIkFsXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0gdHlwZW9mIGNoYXJhY3RlcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoYXJhY3RlcihjaGFyYWN0ZXI6IHN0cmluZyk6IGNoYXJhY3RlciBpcyBDaGFyYWN0ZXIge1xuICAgIHJldHVybiAoY2hhcmFjdGVycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhjaGFyYWN0ZXIpO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gXCJIYXRcIiB8IFwiSGFpclwiIHwgXCJEeWVcIiB8IFwiVXBwZXJcIiB8IFwiTG93ZXJcIiB8IFwiU2hvZXNcIiB8IFwiU29ja3NcIiB8IFwiSGFuZFwiIHwgXCJCYWNrcGFja1wiIHwgXCJGYWNlXCIgfCBcIlJhY2tldFwiIHwgXCJPdGhlclwiO1xuXG5leHBvcnQgY2xhc3MgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pZDogbnVtYmVyKSB7IH1cblxuICAgIGdldCByZXF1aXJlc0d1YXJkaWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi50aGlzLml0ZW0uc291cmNlcy52YWx1ZXMoKV0uZXZlcnkoc291cmNlID0+IHNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgZmluZGluZyBpdGVtIG9mIGl0ZW1Tb3VyY2UgJHt0aGlzLnNob3BfaWR9YCk7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2hvcEl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIsIHJlYWRvbmx5IHByaWNlOiBudW1iZXIsIHJlYWRvbmx5IGFwOiBib29sZWFuLCByZWFkb25seSBpdGVtczogSXRlbVtdKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG5cbiAgICBnYWNoYVRyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFnYWNoYSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnYWNoYS5hdmVyYWdlX3RyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBHYWNoYUVjb25vbWljcyA9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiO1xuICAgICAgICBjaGFuY2VQZXJjZW50OiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICB9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBjdXJyZW5jeTogXCJBUFwiIHwgXCJHb2xkXCI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogbnVtYmVyO1xuICAgICAgICBwcmljZVBlclB1bGw6IG51bWJlcjtcbiAgICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhRWNvbm9taWNzKFxuICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcixcbiAgICBzb3VyY2U/OiB7IHByaWNlOiBudW1iZXI7IGFwOiBib29sZWFuIH0sXG4pOiBHYWNoYUVjb25vbWljcyB7XG4gICAgY29uc3QgY2hhbmNlUGVyY2VudCA9IGV4cGVjdGVkUHVsbHMgPiAwID8gMTAwIC8gZXhwZWN0ZWRQdWxscyA6IDA7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgICAgIGV4cGVjdGVkUHVsbHMsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIixcbiAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgY3VycmVuY3k6IHNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiLFxuICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICBleHBlY3RlZFNwZW5kOiBleHBlY3RlZFB1bGxzICogc291cmNlLnByaWNlLFxuICAgICAgICBwcmljZVBlclB1bGw6IHNvdXJjZS5wcmljZSxcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgR3VhcmRpYW5JdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IGd1YXJkaWFuX21hcDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBpdGVtczogSXRlbVtdLFxuICAgICAgICByZWFkb25seSB4cDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuZWVkX2Jvc3M6IGJvb2xlYW4sXG4gICAgICAgIHJlYWRvbmx5IGJvc3NfdGltZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKEd1YXJkaWFuSXRlbVNvdXJjZS5ndWFyZGlhbl9tYXBfaWQoZ3VhcmRpYW5fbWFwKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGd1YXJkaWFuX21hcF9pZChtYXA6IHN0cmluZykge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMuaW5kZXhPZihtYXApO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmd1YXJkaWFuX21hcHMucHVzaChtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtaW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3VhcmRpYW5fbWFwcyA9IFtcIlwiXTtcbn1cblxuZXhwb3J0IGNsYXNzIEl0ZW0ge1xuICAgIGlkID0gMDtcbiAgICBuYW1lX2tyID0gXCJcIjtcbiAgICBuYW1lX2VuID0gXCJcIjtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICBtYXhVc2UgPSAwO1xuICAgIGhpZGRlbiA9IGZhbHNlO1xuICAgIHJlc2lzdCA9IFwiXCI7XG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyO1xuICAgIHBhcnQ6IFBhcnQgPSBcIk90aGVyXCI7XG4gICAgbGV2ZWwgPSAwO1xuICAgIHN0ciA9IDA7XG4gICAgc3RhID0gMDtcbiAgICBkZXggPSAwO1xuICAgIHdpbCA9IDA7XG4gICAgaHAgPSAwO1xuICAgIHF1aWNrc2xvdHMgPSAwO1xuICAgIGJ1ZmZzbG90cyA9IDA7XG4gICAgc21hc2ggPSAwO1xuICAgIG1vdmVtZW50ID0gMDtcbiAgICBjaGFyZ2UgPSAwO1xuICAgIGxvYiA9IDA7XG4gICAgc2VydmUgPSAwO1xuICAgIG1heF9zdHIgPSAwO1xuICAgIG1heF9zdGEgPSAwO1xuICAgIG1heF9kZXggPSAwO1xuICAgIG1heF93aWwgPSAwO1xuICAgIGVsZW1lbnRfZW5jaGFudGFibGUgPSBmYWxzZTtcbiAgICBwYXJjZWxfZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNwaW4gPSAwO1xuICAgIGF0c3MgPSAwO1xuICAgIGRmc3MgPSAwO1xuICAgIHNvY2tldCA9IDA7XG4gICAgZ2F1Z2UgPSAwO1xuICAgIGdhdWdlX2JhdHRsZSA9IDA7XG4gICAgc291cmNlczogSXRlbVNvdXJjZVtdID0gW107XG4gICAgc3RhdEZyb21TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiTW92IFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZW1lbnQ7XG4gICAgICAgICAgICBjYXNlIFwiQ2hhcmdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlO1xuICAgICAgICAgICAgY2FzZSBcIkxvYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYjtcbiAgICAgICAgICAgIGNhc2UgXCJTbWFzaFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNtYXNoO1xuICAgICAgICAgICAgY2FzZSBcIlN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcbiAgICAgICAgICAgIGNhc2UgXCJEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXg7XG4gICAgICAgICAgICBjYXNlIFwiU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhO1xuICAgICAgICAgICAgY2FzZSBcIldpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53aWw7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdHI7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IERleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9kZXg7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdGE7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFdpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfd2lsO1xuICAgICAgICAgICAgY2FzZSBcIlNlcnZlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmU7XG4gICAgICAgICAgICBjYXNlIFwiUXVpY2tzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1aWNrc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiQnVmZnNsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZnNsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkhQXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgc2hvcF9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBnYWNoYV9pbmRleDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHByaWNlOiBudW1iZXIgPSAwLFxuICAgICAgICByZWFkb25seSBhcDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKiogTGlzdGVkIGluIHRoZSBsaXZlIHNob3AgY2F0YWxvZyAoYGVuYWJsZWRgKS4gKi9cbiAgICAgICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FuIGJlIHB1cmNoYXNlZCB3aXRoIEdvbGQvQVAuIEZhbHNlIHdoZW4gU2hvcF9JbmkzIGBOb2J1eeKJoDBgXG4gICAgICAgICAqIGV2ZW4gaWYgdGhlIGNhdGFsb2cgc3RpbGwgbGlzdHMgdGhlIHByb2R1Y3QgYXMgZW5hYmxlZC5cbiAgICAgICAgICovXG4gICAgICAgIHJlYWRvbmx5IHB1cmNoYXNhYmxlOiBib29sZWFuID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgY2hhcmFjdGVycykge1xuICAgICAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLnNldChjaGFyYWN0ZXIsIG5ldyBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+KCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQoaXRlbTogSXRlbSwgcHJvYmFiaWxpdHk6IG51bWJlciwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIsIHF1YW50aXR5X21pbjogbnVtYmVyLCBxdWFudGl0eV9tYXg6IG51bWJlcikge1xuICAgICAgICBpZiAoaXRlbS5jaGFyYWN0ZXIgJiYgaXRlbS5jaGFyYWN0ZXIgIT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oYEl0ZW0gJHtpdGVtLmlkfSBmcm9tIGdhY2hhIFwiJHt0aGlzLm5hbWV9XCIgJHt0aGlzLmdhY2hhX2luZGV4fSBoYXMgd3JvbmcgY2hhcmFjdGVyYCk7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBpdGVtLmNoYXJhY3RlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhLnNldChpdGVtLCBbcHJvYmFiaWxpdHksIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XSk7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LnNldChjaGFyYWN0ZXIsIHByb2JhYmlsaXR5ICsgKHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpIHx8IDApKTtcbiAgICB9XG5cbiAgICBhdmVyYWdlX3RyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGNoYXJzOiByZWFkb25seSBDaGFyYWN0ZXJbXSA9IGNoYXJhY3RlciA/IChbY2hhcmFjdGVyXSkgOiBjaGFyYWN0ZXJzO1xuICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgKHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuZ2V0KGl0ZW0pPy5bMF0gfHwgMCksIDApO1xuICAgICAgICBpZiAocHJvYmFiaWxpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsX3Byb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgICAgICByZXR1cm4gdG90YWxfcHJvYmFiaWxpdHkgLyBwcm9iYWJpbGl0eTtcbiAgICB9XG5cbiAgICBnZXQgdG90YWxfcHJvYmFiaWxpdHkoKSB7XG4gICAgICAgIHJldHVybiBjaGFyYWN0ZXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICB9XG5cbiAgICBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgPSBuZXcgTWFwPENoYXJhY3RlciwgbnVtYmVyPigpO1xuICAgIHNob3BfaXRlbXMgPSBuZXcgTWFwPENoYXJhY3RlciwgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPj4oKTtcbn1cblxuZXhwb3J0IGxldCBpdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBzaG9wX2l0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5leHBvcnQgbGV0IGdhY2hhcyA9IG5ldyBNYXA8bnVtYmVyLCBHYWNoYT4oKTtcbmxldCBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgdW5kZWZpbmVkO1xudHlwZSBJdGVtQXJ0RW50cnkgPSBbc2hlZXQ6IHN0cmluZywgY2VsbDogbnVtYmVyXTtcbnR5cGUgSXRlbUFydFNoZWV0ID0ge1xuICAgIGxpbmVDb3VudDogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICBzcGFjZTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG59O1xudHlwZSBMb3R0ZXJ5QXJ0RW50cnkgPSB7XG4gICAgc2hlZXQ6IHN0cmluZztcbiAgICBjZWxsOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBzaGFwZTogXCJjb2luXCIgfCBcImN1YmVcIiB8IFwidG9rZW5cIjtcbn07XG50eXBlIEl0ZW1BcnRNYXAgPSB7XG4gICAgaXRlbXM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRFbnRyeT47XG4gICAgbG90dGVyaWVzOiBSZWNvcmQ8c3RyaW5nLCBMb3R0ZXJ5QXJ0RW50cnk+O1xuICAgIHNoZWV0czogUmVjb3JkPHN0cmluZywgSXRlbUFydFNoZWV0Pjtcbn07XG5sZXQgaXRlbUFydE1hcDogSXRlbUFydE1hcCA9IHsgaXRlbXM6IHt9LCBsb3R0ZXJpZXM6IHt9LCBzaGVldHM6IHt9IH07XG5cbmZ1bmN0aW9uIHByZXR0eU51bWJlcihuOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyKSB7XG4gICAgbGV0IHMgPSBuLnRvRml4ZWQoZGlnaXRzKTtcbiAgICB3aGlsZSAocy5lbmRzV2l0aChcIjBcIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICBpZiAocy5lbmRzV2l0aChcIi5cIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbn1cblxuZnVuY3Rpb24gcGFyc2VJdGVtRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPCAxMDAwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgSXRlbXMgZmlsZSBpcyBvbmx5ICR7ZGF0YS5sZW5ndGh9IGJ5dGVzIGxvbmdgKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCByZXN1bHRdIG9mIGRhdGEubWF0Y2hBbGwoL1xcPEl0ZW0gKC4qKVxcL1xcPi9nKSkge1xuICAgICAgICBjb25zdCBpdGVtOiBJdGVtID0gbmV3IEl0ZW07XG4gICAgICAgIGZvciAoY29uc3QgWywgYXR0cmlidXRlLCB2YWx1ZV0gb2YgcmVzdWx0Lm1hdGNoQWxsKC9cXHM/KFtePV0qKT1cIihbXlwiXSopXCIvZykpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkluZGV4XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaWQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJfTmFtZV9cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2tyID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJOYW1lX05cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJVc2VUeXBlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udXNlVHlwZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTWF4VXNlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4VXNlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiSGlkZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhpZGRlbiA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmVzaXN0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVzaXN0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyXCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJOSUtJXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIk5pa2lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVU5MVU5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFVDWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdWN5XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU0hVQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJTaHVhXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiREhBTlBJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJEaGFucGlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUE9DSElcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiUG9jaGlcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBTFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJBbFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHt2YWx1ZX1cImApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJQYXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJBR1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiQmFja3BhY2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJHTEFTU0VTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJGYWNlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFORFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNPQ0tTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJTb2Nrc1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkZPT1RcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNob2VzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQ0FQXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQQU5UU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiTG93ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJSQUNLRVRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlJhY2tldFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJPRFlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlVwcGVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFpclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRZRVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiRHllXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBwYXJ0ICR7dmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkxldmVsXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGV2ZWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHIgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVEFcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdGEgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZXggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJXSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS53aWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRIUFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhwID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkUXVpY2tcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5xdWlja3Nsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkQnVmZlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmJ1ZmZzbG90cyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNtYXNoU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zbWFzaCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1vdmVTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1vdmVtZW50ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2hhcmdlc2hvdFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmdlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTG9iU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sb2IgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc2VydmUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RSXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0ciA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdHIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1NUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9zdGEgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9ERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfZGV4ID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfV0lMXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3dpbCA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS53aWwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRW5jaGFudEVsZW1lbnRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmFibGVQYXJjZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJjZWxfZW5hYmxlZCA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQmFsbFNwaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zcGluID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQVRTU1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmF0c3MgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERlNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGZzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNvY2tldFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvY2tldCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJHYXVnZUJhdHRsZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdhdWdlX2JhdHRsZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGl0ZW0gYXR0cmlidXRlIFwiJHthdHRyaWJ1dGV9XCJgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpdGVtcy5zZXQoaXRlbS5pZCwgaXRlbSk7XG4gICAgfVxufVxuXG5jbGFzcyBBcGlJdGVtIHtcbiAgICBwcm9kdWN0SW5kZXggPSAwO1xuICAgIGRpc3BsYXkgPSAwO1xuICAgIGhpdERpc3BsYXkgPSBmYWxzZTtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgdXNlMCA9IDA7XG4gICAgdXNlMSA9IDA7XG4gICAgdXNlMiA9IDA7XG4gICAgcHJpY2VUeXBlID0gXCJHT0xEXCI7XG4gICAgb2xkUHJpY2UwID0gMDtcbiAgICBvbGRQcmljZTEgPSAwO1xuICAgIG9sZFByaWNlMiA9IDA7XG4gICAgcHJpY2UwID0gMDtcbiAgICBwcmljZTEgPSAwO1xuICAgIHByaWNlMiA9IDA7XG4gICAgY291cGxlUHJpY2UgPSAwO1xuICAgIGNhdGVnb3J5ID0gXCJcIjtcbiAgICBuYW1lID0gXCJcIjtcbiAgICBnb2xkQmFjayA9IDA7XG4gICAgZW5hYmxlUGFyY2VsID0gZmFsc2U7XG4gICAgZm9yUGxheWVyID0gMDtcbiAgICBpdGVtMCA9IDA7XG4gICAgaXRlbTEgPSAwO1xuICAgIGl0ZW0yID0gMDtcbiAgICBpdGVtMyA9IDA7XG4gICAgaXRlbTQgPSAwO1xuICAgIGl0ZW01ID0gMDtcbiAgICBpdGVtNiA9IDA7XG4gICAgaXRlbTcgPSAwO1xuICAgIGl0ZW04ID0gMDtcbiAgICBpdGVtOSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzQXBpSXRlbShvYmo6IGFueSk6IG9iaiBpcyBBcGlJdGVtIHtcbiAgICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlb2Ygb2JqLnByb2R1Y3RJbmRleCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5kaXNwbGF5ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmhpdERpc3BsYXkgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmVuYWJsZWQgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UxID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2VUeXBlID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNvdXBsZVByaWNlID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNhdGVnb3J5ID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZ29sZEJhY2sgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlUGFyY2VsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgdHlwZW9mIG9iai5mb3JQbGF5ZXIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTAgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTMgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTQgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTUgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTYgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTcgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTggPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTkgPT09IFwibnVtYmVyXCJcbiAgICBdLmV2ZXJ5KGIgPT4gYik7XG59XG5cbi8qKiBQcm9kdWN0IGluZGV4ZXMgdGhhdCByZWplY3Qgc2hvcCBidXlzIChTaG9wX0luaTMgTm9idXniiaAwKS4gTGl2ZSBBUEkgb21pdHMgdGhpcyBmaWVsZC4gKi9cbmxldCBzaG9wTm9idXlQcm9kdWN0SW5kZXhlczogUmVhZG9ubHlTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcblxuZnVuY3Rpb24gaXNTaG9wUHVyY2hhc2FibGUocHJvZHVjdEluZGV4OiBudW1iZXIsIGVuYWJsZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZW5hYmxlZCAmJiAhc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMuaGFzKHByb2R1Y3RJbmRleCk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXBpU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBhcGlJdGVtIG9mIEpTT04ucGFyc2UoZGF0YSkpIHtcbiAgICAgICAgaWYgKCFpc0FwaUl0ZW0oYXBpSXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEluY29ycmVjdCBmb3JtYXQgb2YgaXRlbTogJHtkYXRhfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IFtcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0xLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTMsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW00LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNSxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTYsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW03LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTksXG4gICAgICAgIF0uZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBjb25zdCBwdXJjaGFzYWJsZSA9IGlzU2hvcFB1cmNoYXNhYmxlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLmVuYWJsZWQpO1xuXG4gICAgICAgIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIlBBUlRTXCIpIHtcbiAgICAgICAgICAgIGlmIChpbm5lcl9pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaW5uZXJfaXRlbXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE9ubHkgcmVhbCBwdXJjaGFzZSBwYXRocyBjb3VudCBhcyBzaG9wIHNvdXJjZXMgKGV4Y2x1ZGUgTm9idXkgY2F0YWxvZyByb3dzKS5cbiAgICAgICAgICAgIGlmIChwdXJjaGFzYWJsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBuZXcgU2hvcEl0ZW1Tb3VyY2UoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0ucHJpY2UwLCBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsIGlubmVyX2l0ZW1zKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaW5uZXJfaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goaXRlbVNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFwaUl0ZW0uY2F0ZWdvcnkgPT09IFwiTE9UVEVSWVwiKSB7XG4gICAgICAgICAgICBnYWNoYXMuc2V0KFxuICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJvZHVjdEluZGV4LFxuICAgICAgICAgICAgICAgIG5ldyBHYWNoYShcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcm9kdWN0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5wcmljZTAsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIixcbiAgICAgICAgICAgICAgICAgICAgYXBpSXRlbS5lbmFibGVkLFxuICAgICAgICAgICAgICAgICAgICBwdXJjaGFzYWJsZSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBnYWNoYUl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBnYWNoYUl0ZW0pO1xuICAgICAgICAgICAgaWYgKHB1cmNoYXNhYmxlKSB7XG4gICAgICAgICAgICAgICAgZ2FjaGFJdGVtLnNvdXJjZXMucHVzaChuZXcgU2hvcEl0ZW1Tb3VyY2UoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGFwaUl0ZW0ucHJpY2UwLCBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsIGlubmVyX2l0ZW1zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlckl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgb3RoZXJJdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgb3RoZXJJdGVtKTtcbiAgICAgICAgfVxuXG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUdhY2hhRGF0YShkYXRhOiBzdHJpbmcsIGdhY2hhOiBHYWNoYSkge1xuICAgIGZvciAoY29uc3QgbGluZSBvZiBkYXRhLnNwbGl0KFwiXFxuXCIpKSB7XG4gICAgICAgIGlmICghbGluZS5pbmNsdWRlcyhcIjxMb3R0ZXJ5SXRlbV9cIikpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaCgvXFxzKjxMb3R0ZXJ5SXRlbV8oPzxjaGFyYWN0ZXI+W14gXSopIEluZGV4PVwiXFxkK1wiIF9OYW1lXz1cIlteXCJdKlwiIFNob3BJbmRleD1cIig/PHNob3BfaWQ+XFxkKylcIiBRdWFudGl0eU1pbj1cIig/PHF1YW50aXR5X21pbj5cXGQrKVwiIFF1YW50aXR5TWF4PVwiKD88cXVhbnRpdHlfbWF4PlxcZCspXCIgQ2hhbnNQZXI9XCIoPzxwcm9iYWJpbGl0eT5cXGQrXFwuP1xcZCopXFxzKlwiIEVmZmVjdD1cIlxcZCtcIiBQcm9kdWN0T3B0PVwiXFxkK1wiXFwvPi8pO1xuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBwYXJzaW5nIGdhY2hhICR7Z2FjaGEuZ2FjaGFfaW5kZXh9OlxcbiR7bGluZX1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbWF0Y2guZ3JvdXBzKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY2hhcmFjdGVyID0gbWF0Y2guZ3JvdXBzLmNoYXJhY3RlcjtcbiAgICAgICAgaWYgKGNoYXJhY3RlciA9PT0gXCJMdW5sdW5cIikge1xuICAgICAgICAgICAgY2hhcmFjdGVyID0gXCJMdW5MdW5cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzQ2hhcmFjdGVyKGNoYXJhY3RlcikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBjaGFyYWN0ZXIgXCIke2NoYXJhY3Rlcn1cIiBpbiBsb3R0ZXJ5IGZpbGUgJHtnYWNoYS5nYWNoYV9pbmRleH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBzaG9wX2l0ZW1zLmdldChwYXJzZUludChtYXRjaC5ncm91cHMuc2hvcF9pZCkpO1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBzaG9wIGl0ZW0gaWQgJHttYXRjaC5ncm91cHMuc2hvcF9pZH0gaW4gbG90dGVyeSBmaWxlICR7Z2FjaGEuZ2FjaGFfaW5kZXh9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBnYWNoYS5hZGQoaXRlbSwgcGFyc2VGbG9hdChtYXRjaC5ncm91cHMucHJvYmFiaWxpdHkpLCBjaGFyYWN0ZXIsIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5xdWFudGl0eV9taW4pLCBwYXJzZUludChtYXRjaC5ncm91cHMucXVhbnRpdHlfbWF4KSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgWywgbWFwXSBvZiBnYWNoYS5zaG9wX2l0ZW1zKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2l0ZW0sXSBvZiBtYXApIHtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKG5ldyBHYWNoYUl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUd1YXJkaWFuRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBjb25zdCBndWFyZGlhbkRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShndWFyZGlhbkRhdGEpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0TnVtYmVyKG86IGFueSkge1xuICAgICAgICBpZiAodHlwZW9mIG8gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBvO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGJvc3NUaW1lSW5mbyA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XG4gICAgZm9yIChjb25zdCBtYXBJbmZvIG9mIGd1YXJkaWFuRGF0YSkge1xuICAgICAgICBpZiAodHlwZW9mIG1hcEluZm8gIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcF9uYW1lID0gbWFwSW5mby5OYW1lO1xuICAgICAgICBpZiAodHlwZW9mIG1hcF9uYW1lICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXdhcmRzID0gQXJyYXkuaXNBcnJheShtYXBJbmZvLlJld2FyZHMpID8gWy4uLm1hcEluZm8uUmV3YXJkc10gOiBbXTtcbiAgICAgICAgY29uc3QgcmV3YXJkX2l0ZW1zID0gcmV3YXJkc1xuICAgICAgICAgICAgLmZpbHRlcigoc2hvcF9pZCk6IHNob3BfaWQgaXMgbnVtYmVyID0+IHR5cGVvZiBzaG9wX2lkID09PSBcIm51bWJlclwiICYmIHNob3BfaXRlbXMuaGFzKHNob3BfaWQpKVxuICAgICAgICAgICAgLm1hcChzaG9wX2lkID0+IHNob3BfaXRlbXMuZ2V0KHNob3BfaWQpISk7XG4gICAgICAgIGNvbnN0IEV4cE11bHRpcGxpZXIgPSBnZXROdW1iZXIobWFwSW5mby5FeHBNdWx0aXBsaWVyKSB8fCAwO1xuICAgICAgICBjb25zdCBJc0Jvc3NTdGFnZSA9ICEhbWFwSW5mby5Jc0Jvc3NTdGFnZTtcbiAgICAgICAgY29uc3QgTWFwSUQgPSBnZXROdW1iZXIobWFwSW5mby5NYXBJZCkgfHwgMDtcbiAgICAgICAgbGV0IEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPSBnZXROdW1iZXIobWFwSW5mby5Cb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKSB8fCAtMTtcbiAgICAgICAgaWYgKEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPT09IC0xKSB7XG4gICAgICAgICAgICBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID0gYm9zc1RpbWVJbmZvLmdldChNYXBJRCkgfHwgLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWFwSUQgIT09IDApIHtcbiAgICAgICAgICAgICAgICBib3NzVGltZUluZm8uc2V0KE1hcElELCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcmV3YXJkX2l0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IG5ldyBHdWFyZGlhbkl0ZW1Tb3VyY2UobWFwX25hbWUsIHJld2FyZF9pdGVtcywgRXhwTXVsdGlwbGllciwgSXNCb3NzU3RhZ2UsIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpO1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goZ3VhcmRpYW5Tb3VyY2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBQcm9kdWN0U3RhZ2VEcm9wID0ge1xuICAgIHJlYWRvbmx5IG1hcDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IG5lZWRCb3NzOiBib29sZWFuO1xuICAgIHJlYWRvbmx5IHhwPzogbnVtYmVyO1xuICAgIHJlYWRvbmx5IGJvc3NUaW1lPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUHJvZHVjdFN0YWdlRHJvcHNDYXRhbG9nID0ge1xuICAgIHJlYWRvbmx5IHByb2R1Y3RzPzogUmVhZG9ubHk8UmVjb3JkPHN0cmluZywgcmVhZG9ubHkgUHJvZHVjdFN0YWdlRHJvcFtdPj47XG59O1xuXG4vKipcbiAqIE1lcmdlIFNfUmVsYXRpb25zaGlwcy1kZXJpdmVkIGJvc3MvbWFwIGRyb3BzIG9udG8gc2hvcCBwcm9kdWN0cy5cbiAqIERlZHVwZXMgYnkgZ3VhcmRpYW4gbWFwIG5hbWUgc28gR3VhcmRpYW5TdGFnZXMgUmV3YXJkcyBwYXRocyBhcmUgbm90IGRvdWJsZWQuXG4gKiBUaGlzIGlzIHdoYXQgbWFrZXMgTm9idXkgY29pbnMgbGlrZSBCbHVlIENhcHN1bGUgYW5zd2VyIFwid2hlcmUgZG8gSSBnZXQgdGhpcz9cIi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UHJvZHVjdFN0YWdlRHJvcHMoY2F0YWxvZzogUHJvZHVjdFN0YWdlRHJvcHNDYXRhbG9nKTogdm9pZCB7XG4gICAgY29uc3QgcHJvZHVjdHMgPSBjYXRhbG9nLnByb2R1Y3RzO1xuICAgIGlmICghcHJvZHVjdHMgfHwgdHlwZW9mIHByb2R1Y3RzICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbcHJvZHVjdEtleSwgZHJvcHNdIG9mIE9iamVjdC5lbnRyaWVzKHByb2R1Y3RzKSkge1xuICAgICAgICBjb25zdCBwcm9kdWN0SW5kZXggPSBOdW1iZXIocHJvZHVjdEtleSk7XG4gICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHByb2R1Y3RJbmRleCkgfHwgIUFycmF5LmlzQXJyYXkoZHJvcHMpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQocHJvZHVjdEluZGV4KTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleGlzdGluZ01hcHMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgaXRlbS5zb3VyY2VzXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoc291cmNlKTogc291cmNlIGlzIEd1YXJkaWFuSXRlbVNvdXJjZSA9PiBzb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpXG4gICAgICAgICAgICAgICAgLm1hcCgoc291cmNlKSA9PiBzb3VyY2UuZ3VhcmRpYW5fbWFwKSxcbiAgICAgICAgKTtcbiAgICAgICAgZm9yIChjb25zdCBkcm9wIG9mIGRyb3BzKSB7XG4gICAgICAgICAgICBpZiAoIWRyb3AgfHwgdHlwZW9mIGRyb3AubWFwICE9PSBcInN0cmluZ1wiIHx8IGRyb3AubWFwLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nTWFwcy5oYXMoZHJvcC5tYXApKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleGlzdGluZ01hcHMuYWRkKGRyb3AubWFwKTtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKFxuICAgICAgICAgICAgICAgIG5ldyBHdWFyZGlhbkl0ZW1Tb3VyY2UoXG4gICAgICAgICAgICAgICAgICAgIGRyb3AubWFwLFxuICAgICAgICAgICAgICAgICAgICBbaXRlbV0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBkcm9wLnhwID09PSBcIm51bWJlclwiID8gZHJvcC54cCA6IDAsXG4gICAgICAgICAgICAgICAgICAgICEhZHJvcC5uZWVkQm9zcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGRyb3AuYm9zc1RpbWUgPT09IFwibnVtYmVyXCIgPyBkcm9wLmJvc3NUaW1lIDogLTEsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKiBVc2VyLWZhY2luZyBsYWItcHJlcCBwaGFzZXMg4oCUIG5ldmVyIGV4cG9zZSByYXcgZmlsZW5hbWVzLCBwYXRocywgb3IgWE1MIG5hbWVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRpbmdQaGFzZUZvclVybCh1cmw6IHN0cmluZyk6IHsgdGl0bGU6IHN0cmluZzsgZGV0YWlsOiBzdHJpbmcgfSB7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIkl0ZW1fUGFydHNcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIlByZXBhcmluZyBlcXVpcG1lbnQgY2F0YWxvZ+KAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIkdhdGhlcmluZyBldmVyeSB3ZWFyYWJsZSBmb3IgY29tcGFyaXNvbi5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIi9hcGkvc2hvcFwiKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGU6IFwiQ2hlY2tpbmcgdGhlIGxpdmUgc2hvcOKAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIlJlYWRpbmcgR29sZCBhbmQgQVAgbGlzdGluZ3MuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJHdWFyZGlhblN0YWdlc1wiKSB8fCB1cmwuaW5jbHVkZXMoXCJwcm9kdWN0LXN0YWdlLWRyb3BzXCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJNYXBwaW5nIHN0YWdlIHJld2FyZHPigKZcIixcbiAgICAgICAgICAgIGRldGFpbDogXCJGaW5kaW5nIHdoZXJlIGdlYXIgYW5kIGNvaW5zIGRyb3AuXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJJbmkzX0xvdFwiKSB8fCB1cmwuaW5jbHVkZXMoXCJsb3R0ZXJ5XCIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZTogXCJMb2FkaW5nIGdhY2hhIHRhYmxlc+KAplwiLFxuICAgICAgICAgICAgZGV0YWlsOiBcIk1hdGNoaW5nIGNhcHN1bGVzIHRvIHRoZWlyIHByaXplcy5cIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIml0ZW0tYXJ0XCIpIHx8IHVybC5pbmNsdWRlcyhcInNob3Atbm9idXlcIikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkZpbmlzaGluZyB0aGUgbGFi4oCmXCIsXG4gICAgICAgICAgICBkZXRhaWw6IFwiU3luY2luZyBhcnQgYW5kIHNhbGUgc3RhdHVzLlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogXCJPcGVuaW5nIHRoZSBlcXVpcG1lbnQgbGFi4oCmXCIsXG4gICAgICAgIGRldGFpbDogXCJBbG1vc3QgcmVhZHkgdG8gY29tcGFyZSBnZWFyLlwiLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIHNldExvYWRpbmdQaGFzZSh1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHBoYXNlID0gbG9hZGluZ1BoYXNlRm9yVXJsKHVybCk7XG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgaWYgKHRpdGxlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSBwaGFzZS50aXRsZTtcbiAgICB9XG4gICAgY29uc3QgZGV0YWlsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19kZXRhaWxcIik7XG4gICAgaWYgKGRldGFpbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGRldGFpbC50ZXh0Q29udGVudCA9IHBoYXNlLmRldGFpbDtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgc2V0TG9hZGluZ1BoYXNlKHVybCk7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgIGNvbnN0IHByb2dyZXNzYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmVzc2JhclwiKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlKys7XG4gICAgfVxuICAgIGlmICghcmVwbHkub2spIHtcbiAgICAgICAgLy8gS2VlcCB0ZWNobmljYWwgVVJMIGRldGFpbCBpbiB0aGUgdGhyb3duIGVycm9yIGZvciBsb2dzOyBVSSB1c2VzIGh1bWFuIGNvcHkuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgZG93bmxvYWRpbmcgJHt1cmx9OiAke3JlcGx5LnN0YXR1c30ke3JlcGx5LnN0YXR1c1RleHQgPyBgICR7cmVwbHkuc3RhdHVzVGV4dH1gIDogXCJcIn1gXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiByZXBseS50ZXh0KCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZEl0ZW1zKCkge1xuICAgIGNvbnN0IHByb2dyZXNzYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmVzc2JhclwiKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlID0gMDtcbiAgICAgICAgcHJvZ3Jlc3NiYXIubWF4ID0gMTI0O1xuICAgIH1cbiAgICBjb25zdCBpdGVtU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvYXV0aC1zZXJ2ZXIvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGdhY2hhU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvZ2FtZS1zZXJ2ZXIvc3JjL21haW4vcmVzb3VyY2VzL3Jlcy9sb3R0ZXJ5XCI7XG4gICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9zZXJ2ZXItY29yZS9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzXCI7XG4gICAgY29uc3QgaXRlbVVSTCA9IGl0ZW1Tb3VyY2UgKyBcIi9JdGVtX1BhcnRzX0luaTMueG1sXCI7XG4gICAgY29uc3QgaXRlbURhdGEgPSBkb3dubG9hZChpdGVtVVJMKTtcbiAgICAvLyBDb21wYWN0IE5vYnV5IGluZGV4IChmcm9tIFNob3BfSW5pMykg4oCUIGxpdmUgc2hvcCBBUEkgb21pdHMgdGhpcyBmaWVsZC5cbiAgICBjb25zdCBzaG9wTm9idXlEYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL3Nob3Atbm9idXktaW5kZXhlcy5qc29uXCIpO1xuICAgIC8vIEJvc3MvbWFwIGRyb3BzIGZyb20gU19SZWxhdGlvbnNoaXBzIChiZXlvbmQgR3VhcmRpYW5TdGFnZXMgUmV3YXJkcyBsaXN0cykuXG4gICAgY29uc3QgcHJvZHVjdFN0YWdlRHJvcHNEYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL3Byb2R1Y3Qtc3RhZ2UtZHJvcHMuanNvblwiKTtcbiAgICBjb25zdCBpdGVtQXJ0RGF0YSA9IGRvd25sb2FkKFwiL2Fzc2V0cy9pdGVtLWFydC1tYXAuanNvblwiKTtcbiAgICBjb25zdCBtYXhfc2hvcF9wYWdlcyA9IDIwOyAvL2N1cnJlbnRseSBuZWVkIG9ubHkgMTAsIHNob3VsZCBiZSBlbm91Z2hcbiAgICBjb25zdCBzaG9wVVJMID0gXCIvYXBpL3Nob3A/c2l6ZT0xMDAwJnBhZ2U9XCI7XG4gICAgY29uc3Qgc2hvcERhdGFzID0gWy4uLkFycmF5KG1heF9zaG9wX3BhZ2VzKS5rZXlzKCldLm1hcChuID0+IGRvd25sb2FkKGAke3Nob3BVUkx9JHtufWApKTtcbiAgICBjb25zdCBndWFyZGlhblVSTCA9IGd1YXJkaWFuU291cmNlICsgXCIvR3VhcmRpYW5TdGFnZXMuanNvblwiO1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IGRvd25sb2FkKGd1YXJkaWFuVVJMKTtcbiAgICBwYXJzZUl0ZW1EYXRhKGF3YWl0IGl0ZW1EYXRhKTtcbiAgICBpdGVtQXJ0TWFwID0gSlNPTi5wYXJzZShhd2FpdCBpdGVtQXJ0RGF0YSkgYXMgSXRlbUFydE1hcDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBub2J1eUpzb24gPSBKU09OLnBhcnNlKGF3YWl0IHNob3BOb2J1eURhdGEpIGFzIHtcbiAgICAgICAgICAgIHByb2R1Y3RJbmRleGVzPzogdW5rbm93bjtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5kZXhlcyA9IEFycmF5LmlzQXJyYXkobm9idXlKc29uLnByb2R1Y3RJbmRleGVzKVxuICAgICAgICAgICAgPyBub2J1eUpzb24ucHJvZHVjdEluZGV4ZXMuZmlsdGVyKChuKTogbiBpcyBudW1iZXIgPT4gdHlwZW9mIG4gPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICA6IFtdO1xuICAgICAgICBzaG9wTm9idXlQcm9kdWN0SW5kZXhlcyA9IG5ldyBTZXQoaW5kZXhlcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBsb2FkaW5nIHNob3AgTm9idXkgaW5kZXg6ICR7ZX1gKTtcbiAgICAgICAgc2hvcE5vYnV5UHJvZHVjdEluZGV4ZXMgPSBuZXcgU2V0KCk7XG4gICAgfVxuICAgIGF3YWl0IFByb21pc2UuYWxsKHNob3BEYXRhcy5tYXAocCA9PiBwLnRoZW4oZGF0YSA9PiBwYXJzZUFwaVNob3BEYXRhKGRhdGEpKSkpO1xuXG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IGdhY2hhcy5zaXplICsgNDtcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFfaXRlbXM6IFtQcm9taXNlPHN0cmluZz4sIEdhY2hhLCBzdHJpbmddW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFfdXJsID0gYCR7Z2FjaGFTb3VyY2V9L0luaTNfTG90XyR7YCR7Z2FjaGEuZ2FjaGFfaW5kZXh9YC5wYWRTdGFydCgyLCBcIjBcIil9LnhtbGA7XG4gICAgICAgIGdhY2hhX2l0ZW1zLnB1c2goW2Rvd25sb2FkKGdhY2hhX3VybCksIGdhY2hhLCBnYWNoYV91cmxdKTtcbiAgICB9XG4gICAgcGFyc2VHdWFyZGlhbkRhdGEoYXdhaXQgZ3VhcmRpYW5EYXRhKTtcbiAgICB0cnkge1xuICAgICAgICBhcHBseVByb2R1Y3RTdGFnZURyb3BzKEpTT04ucGFyc2UoYXdhaXQgcHJvZHVjdFN0YWdlRHJvcHNEYXRhKSBhcyBQcm9kdWN0U3RhZ2VEcm9wc0NhdGFsb2cpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgbG9hZGluZyBwcm9kdWN0IHN0YWdlIGRyb3BzOiAke2V9YCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgW2l0ZW0sIGdhY2hhLCBnYWNoYV91cmxdIG9mIGdhY2hhX2l0ZW1zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJzZUdhY2hhRGF0YShhd2FpdCBpdGVtLCBnYWNoYSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGRvd25sb2FkaW5nICR7Z2FjaGFfdXJsfSBiZWNhdXNlICR7ZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqIEJhbi9jaXJjbGUtc2xhc2ggaWNvbiBmb3IgZXhjbHVkZSDigJQgb3V0bGluZSBTVkcsIHJlY29sb3JlZCB2aWEgY3VycmVudENvbG9yLiAqL1xuZnVuY3Rpb24gY3JlYXRlRXhjbHVkZUljb24oKTogU1ZHU1ZHRWxlbWVudCB7XG4gICAgY29uc3QgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcInN2Z1wiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJpdGVtX3JlbW92YWxfX2ljb25cIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIiwgXCIwIDAgMjQgMjRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFwiMTZcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjE2XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImZvY3VzYWJsZVwiLCBcImZhbHNlXCIpO1xuXG4gICAgY29uc3QgY2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcImNpcmNsZVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiY3hcIiwgXCIxMlwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiY3lcIiwgXCIxMlwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiclwiLCBcIjlcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJub25lXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBcIjJcIik7XG5cbiAgICBjb25zdCBzbGFzaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJsaW5lXCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcIngxXCIsIFwiN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ5MVwiLCBcIjdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieDJcIiwgXCIxN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ5MlwiLCBcIjE3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBcImN1cnJlbnRDb2xvclwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyXCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lY2FwXCIsIFwicm91bmRcIik7XG5cbiAgICBzdmcuYXBwZW5kKGNpcmNsZSwgc2xhc2gpO1xuICAgIHJldHVybiBzdmc7XG59XG5cbmZ1bmN0aW9uIGRlbGV0YWJsZUl0ZW0oaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZXhjbHVkZUxhYmVsID0gYEV4Y2x1ZGUgJHtpdGVtLm5hbWVfZW59IGZyb20gcmVzdWx0c2A7XG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxcIixcbiAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2l0ZW0uaWR9YCxcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBleGNsdWRlTGFiZWwsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgdGl0bGU6IGV4Y2x1ZGVMYWJlbCxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICBleGNsdWRlQnV0dG9uLmFwcGVuZChjcmVhdGVFeGNsdWRlSWNvbigpKTtcblxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJpdGVtLWlkZW50aXR5XCIgfSxcbiAgICAgICAgZXhjbHVkZUJ1dHRvbixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1pZGVudGl0eV9fbWV0YVwiIH0sXG4gICAgICAgICAgICBjcmVhdGVJdGVtRGV0YWlsc1RyaWdnZXIoaXRlbSwgY2hhcmFjdGVyKSxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1BdmFpbGFiaWxpdHlCYWRnZShpdGVtKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gc2hvd0RpYWxvZyhcbiAgICB0cmlnZ2VyOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgdG9wRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BfZGl2XCIpO1xuICAgIGlmICghKHRvcERpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICB9XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGRpYWxvZ0NsYXNzID8gYCR7ZGlhbG9nQ2xhc3N9X19jbG9zZWAgOiBcImRpYWxvZ19fY2xvc2VcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiQ2xvc2VcIixcbiAgICBdKTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ge1xuICAgICAgICAuLi4oZGlhbG9nQ2xhc3MgPyB7IGNsYXNzOiBkaWFsb2dDbGFzcyB9IDoge30pLFxuICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgfTtcbiAgICBkaWFsb2cgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpXG4gICAgICAgID8gY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgLi4uY29udGVudCwgY2xvc2VCdXR0b25dKVxuICAgICAgICA6IGNyZWF0ZUhUTUwoW1wiZGlhbG9nXCIsIGF0dHJpYnV0ZXMsIGNvbnRlbnQsIGNsb3NlQnV0dG9uXSk7XG4gICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gZGlhbG9nPy5jbG9zZSgpKTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGRpYWxvZz8ucmVtb3ZlKCk7XG4gICAgICAgIGRpYWxvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdHJpZ2dlci5mb2N1cygpO1xuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB0b3BEaXYuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsodGV4dDogc3RyaW5nLCBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJwb3B1cF9saW5rXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICB9LFxuICAgICAgICB0ZXh0LFxuICAgIF0pO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93RGlhbG9nKGJ1dHRvbiwgYCR7dGV4dH0gZGV0YWlsc2AsIGNvbnRlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5U3RhdEhlYWRlckNlbGwoc3RhdDogc3RyaW5nKTogSFRNTFRhYmxlQ2VsbEVsZW1lbnQge1xuICAgIGNvbnN0IHsgc2hvcnQsIGZ1bGwsIGFiYnJldmlhdGVkIH0gPSBwcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5KHN0YXQpO1xuICAgIGlmICghYWJicmV2aWF0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1widGhcIiwgeyBjbGFzczogXCJudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIHNob3J0XSk7XG4gICAgfVxuICAgIGNvbnN0IHBvcHVwID0gY3JlYXRlUG9wdXBMaW5rKHNob3J0LCBjcmVhdGVIVE1MKFtcInBcIiwgZnVsbF0pKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBmdWxsKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGZ1bGwpO1xuICAgIHBvcHVwLmNsYXNzTGlzdC5hZGQoXCJwcmlvcml0eS1zdGF0LWhlYWRlclwiKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0aFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgcG9wdXBdKTtcbn1cblxuZnVuY3Rpb24gcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gMSAmJiBxdWFudGl0eV9tYXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChxdWFudGl0eV9taW4gPT09IHF1YW50aXR5X21heCkge1xuICAgICAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWF4fWA7XG4gICAgfVxuICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9taW59LSR7cXVhbnRpdHlfbWF4fWA7XG59XG5cbi8qKlxuICogR2FjaGEgZHJvcC1kZXRhaWxzIHRhYmxlOiBJdGVtIHwgQ2hhbmNlIHwgRXhwZWN0ZWQgcHVsbHMuXG4gKiBDaGFyYWN0ZXIgaXMgbmV2ZXIgYSBjb2x1bW4g4oCUIGVxdWlwbWVudCBwb29scyBtaXJyb3IgYWNyb3NzIGNoYXJhY3RlcnMsIHNvIGxpc3RpbmdcbiAqIE5pa2kvTHVuTHVuL+KApiBkdXBsaWNhdGVzIHRoZSBzYW1lIHJvd3MuIFdoZW4gbm8gY2hhcmFjdGVyIGZpbHRlciBpcyBzZXQsIHNhbWUtbmFtZVxuICogcm93cyAod2l0aCB0aGUgc2FtZSBxdWFudGl0eSByYW5nZSkgY29sbGFwc2UgdG8gb25lIGVudHJ5IHVzaW5nIHRoZSBmaXJzdCBwb29sIHJhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShcbiAgICBnYWNoYTogR2FjaGEsXG4gICAgaGlnaGxpZ2h0ZWRJdGVtPzogSXRlbSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pO1xuXG4gICAgdHlwZSBSb3cgPSB7XG4gICAgICAgIGl0ZW06IEl0ZW07XG4gICAgICAgIHByb2JhYmlsaXR5OiBudW1iZXI7XG4gICAgICAgIHF1YW50aXR5X21pbjogbnVtYmVyO1xuICAgICAgICBxdWFudGl0eV9tYXg6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgLy8gQ2hhcmFjdGVyIGZpbHRlcjogYWNjdW11bGF0ZSBieSBJdGVtIGlkZW50aXR5IChoaXN0b3JpY2FsIG1hdGgpLlxuICAgIC8vIFVuZmlsdGVyZWQ6IGNvbGxhcHNlIGJ5IGRpc3BsYXkgbmFtZSArIHF1YW50aXR5IHNvIHBlci1jaGFyYWN0ZXIgY2xvbmVzIGFyZSBvbmUgcm93LlxuICAgIGNvbnN0IGJ5SXRlbSA9IGNoYXJhY3RlciA/IG5ldyBNYXA8SXRlbSwgUm93PigpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGJ5TmFtZSA9IGNoYXJhY3RlciA/IHVuZGVmaW5lZCA6IG5ldyBNYXA8c3RyaW5nLCBSb3c+KCk7XG5cbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgLy8gQ2hhcmFjdGVyLWZpbHRlcmVkOiBrZWVwIGhpc3RvcmljYWwgZGVub21pbmF0b3IgKGl0ZW0gY2hhcmFjdGVyLCBlbHNlIGZpbHRlciwgZWxzZSB0b3RhbCkuXG4gICAgICAgICAgICAvLyBVbmZpbHRlcmVkIGNvbGxhcHNlOiByYXRlcyBhcmUgd2l0aGluIGVhY2ggY2hhcmFjdGVyJ3MgcG9vbCAocG9vbHMgbWlycm9yOyBmaXJzdCByb3cgd2lucykuXG4gICAgICAgICAgICAvLyBVc2luZyB0b3RhbF9wcm9iYWJpbGl0eSBmb3Igc2hhcmVkIGl0ZW1zIHdvdWxkIGRpbHV0ZSB+N8OXIGFuZCByZWludHJvZHVjZSB3cm9uZyByYXRlcy5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBnYWNoYS5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXIpIVxuICAgICAgICAgICAgICAgIDogKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1fY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoaXRlbV9jaGFyYWN0ZXIpIVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBnYWNoYS50b3RhbF9wcm9iYWJpbGl0eTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSB0aWNrZXRzIC8gaXRlbV90aWNrZXRzO1xuXG4gICAgICAgICAgICBpZiAoYnlJdGVtKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBieUl0ZW0uZ2V0KGNoYXJfZ2FjaGFfaXRlbSk7XG4gICAgICAgICAgICAgICAgYnlJdGVtLnNldChjaGFyX2dhY2hhX2l0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hhcl9nYWNoYV9pdGVtLFxuICAgICAgICAgICAgICAgICAgICBwcm9iYWJpbGl0eTogKHByZXZpb3VzPy5wcm9iYWJpbGl0eSA/PyAwKSArIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhcl9nYWNoYV9pdGVtLm5hbWVfZW59XFwwJHtxdWFudGl0eV9taW59XFwwJHtxdWFudGl0eV9tYXh9YDtcbiAgICAgICAgICAgIGlmICghYnlOYW1lIS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIGJ5TmFtZSEuc2V0KGtleSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGFyX2dhY2hhX2l0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICBxdWFudGl0eV9taW4sXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5X21heCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJvd3MgPSBieUl0ZW0gPyBbLi4uYnlJdGVtLnZhbHVlcygpXSA6IFsuLi5ieU5hbWUhLnZhbHVlcygpXTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWRJdGVtICE9PSB1bmRlZmluZWQgJiYgKFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRJdGVtID09PSByb3cuaXRlbVxuICAgICAgICAgICAgfHwgKFxuICAgICAgICAgICAgICAgIGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgJiYgaGlnaGxpZ2h0ZWRJdGVtLm5hbWVfZW4gPT09IHJvdy5pdGVtLm5hbWVfZW5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgW1widGRcIiwgcm93Lml0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocm93LnF1YW50aXR5X21pbiwgcm93LnF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHJvdy5wcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyByb3cucHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbTogSXRlbSB8IHVuZGVmaW5lZCwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoXG4gICAgICAgIGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLFxuICAgICAgICBjcmVhdGVHYWNoYURldGFpbHNUYWJsZShnYWNoYSwgaXRlbSwgY2hhcmFjdGVyKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBTaG9wSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnRUYWJsZSA9IGNyZWF0ZUhUTUwoW1widGFibGVcIiwgW1widHJcIiwgW1widGhcIiwgXCJDb250ZW50c1wiXV1dKTtcbiAgICBmb3IgKGNvbnN0IGlubmVyX2l0ZW0gb2YgaXRlbVNvdXJjZS5pdGVtcykge1xuICAgICAgICBjb250ZW50VGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiLCBpbm5lcl9pdGVtID09PSBpdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLCBbXCJ0ZFwiLCBpbm5lcl9pdGVtLm5hbWVfZW5dXSkpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLCBbY3JlYXRlSFRNTChbXCJhXCIsIGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLCBjb250ZW50VGFibGVdKV0pO1xufVxuXG5mdW5jdGlvbiBwcmV0dHlUaW1lKHNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiBgJHtNYXRoLmZsb29yKHNlY29uZHMgLyA2MCl9OiR7YCR7c2Vjb25kcyAlIDYwfWAucGFkU3RhcnQoMiwgXCIwXCIpfWA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgY29uc3QgbWFwTGFiZWwgPSBzdGFnZUNoYW5uZWxMYWJlbChpdGVtU291cmNlLmd1YXJkaWFuX21hcCwgaXRlbVNvdXJjZS5uZWVkX2Jvc3MpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBbXG4gICAgICAgIGBHdWFyZGlhbiBtYXAgJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXApfWAsXG4gICAgICAgIGNyZWF0ZUhUTUwoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJ1bFwiLCB7IGNsYXNzOiBcImxheW91dFwiIH0sXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgXCJJdGVtczpcIixcbiAgICAgICAgICAgICAgICAgICAgW1widWxcIiwgeyBjbGFzczogXCJsYXlvdXRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uaXRlbVNvdXJjZS5pdGVtcy5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGN1cnIsIHJld2FyZF9pdGVtKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbLi4uY3VyciwgY3JlYXRlSFRNTChbXCJsaVwiLCB7IGNsYXNzOiByZXdhcmRfaXRlbSA9PT0gaXRlbSA/IFwiaGlnaGxpZ2h0ZWRcIiA6IFwiXCIgfSwgcmV3YXJkX2l0ZW0ubmFtZV9lbl0pXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSBhcyAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW11cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXCJsaVwiLCBgUmVxdWlyZXMgYm9zczogJHtpdGVtU291cmNlLm5lZWRfYm9zcyA/IFwiWWVzXCIgOiBcIk5vXCJ9YF0sXG4gICAgICAgICAgICAgICAgLi4uKGl0ZW1Tb3VyY2UuYm9zc190aW1lID4gMCA/IFtjcmVhdGVIVE1MKFtcImxpXCIsIGBCb3NzIHRpbWU6ICR7cHJldHR5VGltZShpdGVtU291cmNlLmJvc3NfdGltZSl9YF0pXSA6IFtdKSxcbiAgICAgICAgICAgICAgICBbXCJsaVwiLCBgRVhQIG11bHRpcGxpZXI6ICR7aXRlbVNvdXJjZS54cH1gXSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgIF07XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhtYXBMYWJlbCwgY29udGVudCk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoXG4gICAgaXRlbTogSXRlbSxcbiAgICBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIHJldHVybiBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgLm1hcChpdGVtU291cmNlID0+IHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW0sIGl0ZW1Tb3VyY2UsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50Q2xhc3NUb2tlbnMoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmdbXSB7XG4gICAgLy8gUHJlZmVyIGNsYXNzTmFtZSBvdmVyIGNsYXNzTGlzdCDigJQgdGhlIHVuaXQgRE9NIGhhcm5lc3Mgc2V0cyBjbGFzc05hbWUgdmlhXG4gICAgLy8gc2V0QXR0cmlidXRlKFwiY2xhc3NcIikgYW5kIGRvZXMgbm90IGltcGxlbWVudCBhIGZ1bGwgY2xhc3NMaXN0LlxuICAgIGNvbnN0IHJhdyA9IHR5cGVvZiBlbGVtZW50LmNsYXNzTmFtZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgICA/IGVsZW1lbnQuY2xhc3NOYW1lXG4gICAgICAgIDogZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiO1xuICAgIHJldHVybiByYXcuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIGlzR2FjaGFTb3VyY2VHcm91cChlbGVtZW50czogcmVhZG9ubHkgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLnNvbWUoXG4gICAgICAgIChlbGVtZW50KSA9PlxuICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQgIT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICYmIGVsZW1lbnRDbGFzc1Rva2VucyhlbGVtZW50KS5pbmNsdWRlcyhcImdhY2hhLXNvdXJjZS1zdW1tYXJ5XCIpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1ha2VTb3VyY2VzTGlzdChsaXN0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW11bXSk6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgY29uc3QgcmVzdWx0OiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gPSBbXTtcbiAgICBmdW5jdGlvbiBhZGQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID0gcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSArIGVsZW1lbnQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goZWxlbWVudCk7XG4gICAgfVxuICAgIGxldCBwcmV2aW91c0dyb3VwOiByZWFkb25seSAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10gfCB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBlbGVtZW50cyBvZiBsaXN0KSB7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFkZChcIiBcIik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb21tYSBiZXR3ZWVuIHNob3Avc2V0L2d1YXJkaWFuIHBhdGhzIHNvIGR1YWwgcHJpY2VzIHN0YXkgbGVnaWJsZVxuICAgICAgICAvLyAoXCI1MDAwMCBHb2xkLCBTdXBwb3J0ZXIgU2V0IDM1MDAwMCBHb2xkXCIpLiBOZXZlciBuZXh0IHRvIGdhY2hhIGNvaW4gY2FyZHMg4oCUXG4gICAgICAgIC8vIHRob3NlIGFyZSBibG9jayBzdW1tYXJpZXMgYW5kIGEgdGV4dCBjb21tYSBiZWNvbWVzIGEgdmlzdWFsIGJyZWFrLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwcmV2aW91c0dyb3VwICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAocHJldmlvdXNHcm91cClcbiAgICAgICAgICAgICYmICFpc0dhY2hhU291cmNlR3JvdXAoZWxlbWVudHMpXG4gICAgICAgICkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXNHcm91cCA9IGVsZW1lbnRzO1xuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpOiBib29sZWFuIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlIHx8IGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldChpdGVtU291cmNlLnNob3BfaWQpO1xuICAgICAgICBpZiAoZ2FjaGE/LmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlICE9PSBpdGVtU291cmNlICYmIGlzQXZhaWxhYmxlSXRlbVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICBpZiAoaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUF2YWlsYWJpbGl0eUJhZGdlKGl0ZW06IEl0ZW0pIHtcbiAgICBpZiAoaXNJdGVtQ3VycmVudGx5QXZhaWxhYmxlKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWF2YWlsYWJpbGl0eSBpdGVtLWF2YWlsYWJpbGl0eS0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIHRpdGxlOiBcIk5vIGVuYWJsZWQgc2hvcCwgZ2FjaGEsIG9yIEd1YXJkaWFuIHBhdGggaW4gdGhlIGxpdmUgc2hvcCBkYXRhXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiTm90IGluIGdhbWVcIixcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY29sbGVjdEdhY2hhU291cmNlSW5wdXRzKGNvaW46IEl0ZW0gfCB1bmRlZmluZWQpOiBHYWNoYVNvdXJjZUlucHV0W10ge1xuICAgIGlmICghY29pbikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGlucHV0czogR2FjaGFTb3VyY2VJbnB1dFtdID0gW107XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgY29pbi5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgaW5wdXRzLnB1c2goeyBraW5kOiBcInNob3BcIiwgYXA6IHNvdXJjZS5hcCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcInN0YWdlXCIsXG4gICAgICAgICAgICAgICAgbWFwOiBzb3VyY2UuZ3VhcmRpYW5fbWFwLFxuICAgICAgICAgICAgICAgIG5lZWRCb3NzOiBzb3VyY2UubmVlZF9ib3NzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGlucHV0cztcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTaG9wQ2hhbm5lbExhYmVsKFxuICAgIGN1cnJlbmN5OiBcIkdvbGRcIiB8IFwiQVBcIixcbiAgICBhdmFpbGFibGU6IGJvb2xlYW4sXG4gICAgcmVhc29uPzogXCJub3RfZm9yX3NhbGVcIiB8IFwibm90X2F2YWlsYWJsZVwiLFxuKTogSFRNTEVsZW1lbnQge1xuICAgIGlmIChhdmFpbGFibGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbmN5ID09PSBcIkFQXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1hcFwiIH0sXG4gICAgICAgICAgICAgICAgXCJBUFwiLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWN1cnJlbmN5IGdhY2hhLWN1cnJlbmN5LS1nb2xkXCIgfSxcbiAgICAgICAgICAgIFwiR29sZFwiLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgaWYgKHJlYXNvbiA9PT0gXCJub3RfZm9yX3NhbGVcIikge1xuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWZvci1zYWxlXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBwcm9kdWN0IGlzIGxpc3RlZCBpbiB0aGUgc2hvcCBjYXRhbG9nIGJ1dCBjYW5ub3QgYmUgcHVyY2hhc2VkIChOb2J1eSlgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiTm90IGZvciBzYWxlXCIsXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1zaG9wLXN0YXR1cyBnYWNoYS1zaG9wLXN0YXR1cy0tbm90LWF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IGAke2N1cnJlbmN5fSBjb2luIGlzIG5vdCBjdXJyZW50bHkgc29sZCBpbiB0aGUgbGl2ZSBzaG9wYCxcbiAgICAgICAgfSxcbiAgICAgICAgYCR7Y3VycmVuY3l9IMK3IE5vdCBhdmFpbGFibGVgLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVN0YWdlQ2hhbm5lbExhYmVsKFxuICAgIGNvaW46IEl0ZW0gfCB1bmRlZmluZWQsXG4gICAgbWFwOiBzdHJpbmcsXG4gICAgbmVlZEJvc3M6IGJvb2xlYW4sXG4gICAgbGFiZWw6IHN0cmluZyxcbik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IGNvaW4/LnNvdXJjZXMuZmluZChcbiAgICAgICAgKHNvdXJjZSk6IHNvdXJjZSBpcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgPT5cbiAgICAgICAgICAgIHNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSAmJiBzb3VyY2UuZ3VhcmRpYW5fbWFwID09PSBtYXAsXG4gICAgKTtcbiAgICBjb25zdCBjaGFubmVsQ2xhc3MgPSBuZWVkQm9zc1xuICAgICAgICA/IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIlxuICAgICAgICA6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCI7XG4gICAgaWYgKGd1YXJkaWFuU291cmNlICYmIGNvaW4pIHtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBjcmVhdGVHdWFyZGlhblBvcHVwKGNvaW4sIGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBwb3B1cC5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcInBvcHVwX2xpbmtcIjtcbiAgICAgICAgcG9wdXAuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYCR7ZXhpc3Rpbmd9ICR7Y2hhbm5lbENsYXNzfWApO1xuICAgICAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGxhYmVsKTtcbiAgICAgICAgcmV0dXJuIHBvcHVwO1xuICAgIH1cbiAgICBpZiAobmVlZEJvc3MpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWJvc3NcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYEJvc3Mgc3RhZ2UgZHJvcDogJHtwcmV0dHlHdWFyZGlhbk1hcE5hbWUobWFwKX1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLWNoYW5uZWwgZ2FjaGEtc291cmNlLWNoYW5uZWwtLWd1YXJkaWFuXCIsXG4gICAgICAgICAgICB0aXRsZTogYEd1YXJkaWFuIHN0YWdlIGRyb3A6ICR7cHJldHR5R3VhcmRpYW5NYXBOYW1lKG1hcCl9YCxcbiAgICAgICAgfSxcbiAgICAgICAgbGFiZWwsXG4gICAgXSk7XG59XG5cbi8qKiBLZXB0IGZvciBjb250cmFjdHMgdGhhdCBwaW4gdGhlIGhlbHBlciBuYW1lOyByZXR1cm5zIHNob3AgKyBzdGFnZSBjaGFubmVsIGNoaXBzLiAqL1xuZnVuY3Rpb24gY3JlYXRlR2FjaGFDdXJyZW5jeUxhYmVsKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBjaGFubmVscyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIGlmIChjaGFubmVscy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5uZWxzWzBdITtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAgeyBjbGFzczogXCJnYWNoYS1hY3F1aXNpdGlvbi1jaGFubmVsc1wiIH0sXG4gICAgICAgIC4uLmNoYW5uZWxzLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUFjcXVpc2l0aW9uQ2hhbm5lbEVsZW1lbnRzKGdhY2hhOiBHYWNoYSk6IEhUTUxFbGVtZW50W10ge1xuICAgIGNvbnN0IGNvaW4gPSBzaG9wX2l0ZW1zLmdldChnYWNoYS5zaG9wX2luZGV4KTtcbiAgICBjb25zdCBwcm9qZWN0ZWQgPSBwcm9qZWN0R2FjaGFBY3F1aXNpdGlvbkNoYW5uZWxzKFxuICAgICAgICB7XG4gICAgICAgICAgICBhcDogZ2FjaGEuYXAsXG4gICAgICAgICAgICBlbmFibGVkOiBnYWNoYS5lbmFibGVkLFxuICAgICAgICAgICAgcHVyY2hhc2FibGU6IGdhY2hhLnB1cmNoYXNhYmxlLFxuICAgICAgICB9LFxuICAgICAgICBjb2xsZWN0R2FjaGFTb3VyY2VJbnB1dHMoY29pbiksXG4gICAgKTtcbiAgICByZXR1cm4gcHJvamVjdGVkLm1hcCgoY2hhbm5lbCkgPT4ge1xuICAgICAgICBpZiAoY2hhbm5lbC5raW5kID09PSBcInNob3BcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUdhY2hhU2hvcENoYW5uZWxMYWJlbChcbiAgICAgICAgICAgICAgICBjaGFubmVsLmN1cnJlbmN5LFxuICAgICAgICAgICAgICAgIGNoYW5uZWwuYXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIGNoYW5uZWwucmVhc29uLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlR2FjaGFTdGFnZUNoYW5uZWxMYWJlbChcbiAgICAgICAgICAgIGNvaW4sXG4gICAgICAgICAgICBjaGFubmVsLm1hcCxcbiAgICAgICAgICAgIGNoYW5uZWwubmVlZEJvc3MsXG4gICAgICAgICAgICBjaGFubmVsLmxhYmVsLFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoXG4gICAgaXRlbTogSXRlbSB8IHVuZGVmaW5lZCxcbiAgICBpdGVtU291cmNlOiBHYWNoYUl0ZW1Tb3VyY2UsXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyLFxuKSB7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGNoYW5uZWxFbGVtZW50cyA9IGNyZWF0ZUdhY2hhQWNxdWlzaXRpb25DaGFubmVsRWxlbWVudHMoZ2FjaGEpO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIixcbiAgICAgICAgICAgIHJvbGU6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBhY3F1aXNpdGlvbmAsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSksXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5X19jb250ZW50XCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtaWRlbnRpdHlcIiB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbiA/IHVuZGVmaW5lZCA6IGNoYXJhY3RlcixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtYWNxdWlzaXRpb24tY2hhbm5lbHNcIixcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogXCJsaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBzb3VyY2VzYCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLmNoYW5uZWxFbGVtZW50cy5tYXAoKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcImdhY2hhLWFjcXVpc2l0aW9uLWNoYW5uZWxzX19pdGVtXCIsIHJvbGU6IFwibGlzdGl0ZW1cIiB9LCBlbGVtZW50XSksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UsIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoaXRlbSwgaXRlbVNvdXJjZSwgY2hhcmFjdGVyKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICBpZiAoaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBbYCR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGNyZWF0ZVNldFNvdXJjZVBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UpLFxuICAgICAgICAgICAgYCAke2l0ZW1Tb3VyY2UucHJpY2V9ICR7aXRlbVNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwifWBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUd1YXJkaWFuUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSldO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXRlbURldGFpbFN0YXRzKGl0ZW06IEl0ZW0pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBbXCJNb3ZlbWVudFwiLCBpdGVtLm1vdmVtZW50XSxcbiAgICAgICAgW1wiQ2hhcmdlXCIsIGl0ZW0uY2hhcmdlXSxcbiAgICAgICAgW1wiTG9iXCIsIGl0ZW0ubG9iXSxcbiAgICAgICAgW1wiU21hc2hcIiwgaXRlbS5zbWFzaF0sXG4gICAgICAgIFtcIlN0cmVuZ3RoXCIsIGl0ZW0uc3RyXSxcbiAgICAgICAgW1wiRGV4dGVyaXR5XCIsIGl0ZW0uZGV4XSxcbiAgICAgICAgW1wiU3RhbWluYVwiLCBpdGVtLnN0YV0sXG4gICAgICAgIFtcIldpbGxcIiwgaXRlbS53aWxdLFxuICAgICAgICBbXCJTZXJ2ZVwiLCBpdGVtLnNlcnZlXSxcbiAgICAgICAgW1wiSFBcIiwgaXRlbS5ocF0sXG4gICAgICAgIFtcIlF1aWNrc2xvdHNcIiwgaXRlbS5xdWlja3Nsb3RzXSxcbiAgICAgICAgW1wiQnVmZnNsb3RzXCIsIGl0ZW0uYnVmZnNsb3RzXSxcbiAgICBdIGFzIGNvbnN0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBpdGVtRGV0YWlsU3RhdHMoaXRlbSkuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlICE9PSAwKTtcbiAgICBjb25zdCBzb3VyY2VzID0gbWFrZVNvdXJjZXNMaXN0KFxuICAgICAgICBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW0sICgpID0+IHRydWUsIGNoYXJhY3RlciksXG4gICAgKTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzXCIgfSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJoZWFkZXJcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19oZWFkZXJcIiB9LFxuICAgICAgICAgICAgY3JlYXRlSXRlbUFydChpdGVtLCA3MiwgXCJpdGVtLWRldGFpbHNfX2FydFwiKSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2V5ZWJyb3dcIiB9LCBcIkVxdWlwbWVudCBkZXRhaWxzXCJdLFxuICAgICAgICAgICAgICAgIFtcImgyXCIsIGl0ZW0ubmFtZV9lbl0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX21ldGFcIiB9LFxuICAgICAgICAgICAgICAgICAgICBgJHtjaGFyYWN0ZXIgPz8gaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGwgY2hhcmFjdGVyc1wifSDCtyAke2l0ZW0ucGFydH0gwrcgTGV2ZWwgJHtpdGVtLmxldmVsfWAsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJpdGVtLWRldGFpbHMtc3RhdHNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc3RhdHNcIiB9LCBcIlN0YXRzXCJdLFxuICAgICAgICAgICAgc3RhdHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgIFwiZGxcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3N0YXRzXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdHMubWFwKChbbGFiZWwsIHZhbHVlXSkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1wiZHRcIiwgbGFiZWxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1wiZGRcIiwgYCR7dmFsdWV9YF0sXG4gICAgICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXCJwXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sIFwiTm8gc3RhdCBib251c2VzXCJdKSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zb3VyY2VzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LCBcIkhvdyB0byBnZXQgaXRcIl0sXG4gICAgICAgICAgICBzb3VyY2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1wiZGl2XCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zb3VyY2VzXCIgfSwgLi4uc291cmNlc10pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19lbXB0eVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gYWN0aXZlIGFjcXVpc2l0aW9uIHNvdXJjZSBmb3VuZC5cIixcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWRldGFpbHMtdHJpZ2dlclwiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIFwiYXJpYS1oYXNwb3B1cFwiOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgVmlldyBkZXRhaWxzIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dEaWFsb2coXG4gICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICBgJHtpdGVtLm5hbWVfZW59IGl0ZW0gZGV0YWlsc2AsXG4gICAgICAgICAgICBjcmVhdGVJdGVtRGV0YWlsc0NvbnRlbnQoaXRlbSwgY2hhcmFjdGVyKSxcbiAgICAgICAgICAgIFwiaXRlbS1kZXRhaWxzLWRpYWxvZ1wiLFxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtOiBJdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE9mZmljaWFsIGl0ZW0gYXJ0IHVuYXZhaWxhYmxlIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tfX2NvZGVcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBpdGVtLnBhcnQgfHwgXCJJdGVtXCJdLFxuICAgICAgICBbXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBcIk9mZmljaWFsIGFydCB1bmF2YWlsYWJsZVwiXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3ByaXRlQXJ0KFxuICAgIHNoZWV0OiBzdHJpbmcsXG4gICAgY2VsbDogbnVtYmVyLFxuICAgIGxhYmVsOiBzdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBzdHJpbmcsXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbikge1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gaXRlbUFydE1hcC5zaGVldHNbc2hlZXRdO1xuICAgIGlmICghZ2VvbWV0cnkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjb2x1bW4gPSBjZWxsICUgZ2VvbWV0cnkubGluZUNvdW50O1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoY2VsbCAvIGdlb21ldHJ5LmxpbmVDb3VudCk7XG4gICAgY29uc3Qgc2NhbGUgPSBkaXNwbGF5U2l6ZSAvIGdlb21ldHJ5LnNpemU7XG4gICAgY29uc3QgaW1hZ2VTaXplID0gZ2VvbWV0cnkud2lkdGggKiBzY2FsZTtcbiAgICBjb25zdCBvZmZzZXRYID0gLShnZW9tZXRyeS5zcGFjZSArIGNvbHVtbiAqIChnZW9tZXRyeS5zaXplICsgZ2VvbWV0cnkuc3BhY2UpKSAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFkgPSAtKGdlb21ldHJ5LnNwYWNlICsgcm93ICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgICAgICAgICBzdHlsZTogW1xuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LWltYWdlOnVybChcIi9hc3NldHMvaXRlbS1hcnQvJHtlbmNvZGVVUklDb21wb25lbnQoc2hlZXQpfS53ZWJwXCIpYCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC1zaXplOiR7aW1hZ2VTaXplfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC14OiR7b2Zmc2V0WH1weGAsXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQteToke29mZnNldFl9cHhgLFxuICAgICAgICAgICAgXS5qb2luKFwiO1wiKSxcbiAgICAgICAgfSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUFydChcbiAgICBpdGVtOiBJdGVtLFxuICAgIGRpc3BsYXlTaXplID0gNDAsXG4gICAgY2xhc3NOYW1lID0gXCJpdGVtLWFydC10aHVtYm5haWxcIixcbikge1xuICAgIGNvbnN0IGFydCA9IGl0ZW1BcnRNYXAuaXRlbXNbYCR7aXRlbS5pZH1gXTtcbiAgICBpZiAoIWFydCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnRbMF0sXG4gICAgICAgIGFydFsxXSxcbiAgICAgICAgYE9mZmljaWFsIGl0ZW0gYXJ0IGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgIGRpc3BsYXlTaXplLFxuICAgICkgPz8gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUNvaW5BcnQoZ2FjaGE6IEdhY2hhKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5sb3R0ZXJpZXNbYCR7Z2FjaGEuZ2FjaGFfaW5kZXh9YF07XG4gICAgY29uc3QgZmFsbGJhY2sgPSAoKSA9PiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLWNvaW4tYXJ0IGdhY2hhLWNvaW4tYXJ0LS11bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBDb2luIGFydHdvcmsgdW5hdmFpbGFibGUgZm9yICR7Z2FjaGEubmFtZX1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiP1wiLFxuICAgICAgICBdKTtcbiAgICBpZiAoIWFydCkge1xuICAgICAgICByZXR1cm4gZmFsbGJhY2soKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVNwcml0ZUFydChcbiAgICAgICAgYXJ0LnNoZWV0LFxuICAgICAgICBhcnQuY2VsbCxcbiAgICAgICAgYCR7Z2FjaGEubmFtZX0gY29pbiBhcnR3b3JrYCxcbiAgICAgICAgXCJnYWNoYS1jb2luLWFydFwiLFxuICAgICkgPz8gZmFsbGJhY2soKTtcbn1cblxuZnVuY3Rpb24gaXRlbVRvVGFibGVSb3coaXRlbTogSXRlbSwgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbiwgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZVJvd0VsZW1lbnQge1xuICAgIGNvbnN0IHJvdyA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRyXCIsIHsgY2xhc3M6IFwicmVzdWx0LXJvd1wiIH0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uIHJlc3VsdC1zdW1tYXJ5XCIsIFwiZGF0YS1sYWJlbFwiOiBcIkl0ZW1cIiB9LCBkZWxldGFibGVJdGVtKGl0ZW0sIGNoYXJhY3RlcildLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJBcnRfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkFydFwiIH0sIGNyZWF0ZUl0ZW1BcnQoaXRlbSldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkNoYXJhY3RlclwiIH0sIGl0ZW0uY2hhcmFjdGVyID8/IFwiQWxsXCJdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJQYXJ0X2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJQYXJ0XCIgfSwgaXRlbS5wYXJ0XSxcbiAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3RhdC5zcGxpdChcIitcIikubWFwKHMgPT4gaXRlbS5zdGF0RnJvbVN0cmluZyhzKSkuam9pbihcIitcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIsIFwiZGF0YS1sYWJlbFwiOiBzdGF0LCBcImRhdGEtdmFsdWVcIjogdmFsdWUgfSwgdmFsdWVdKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJMZXZlbF9jb2x1bW4gbnVtZXJpY1wiLCBcImRhdGEtbGFiZWxcIjogXCJMZXZlbFwiLCBcImRhdGEtdmFsdWVcIjogYCR7aXRlbS5sZXZlbH1gIH0sIGAke2l0ZW0ubGV2ZWx9YF0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlNvdXJjZV9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiU291cmNlXCIgfSwgLi4ubWFrZVNvdXJjZXNMaXN0KGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoaXRlbSwgc291cmNlRmlsdGVyLCBjaGFyYWN0ZXIpKV0sXG4gICAgICAgIF1cbiAgICApO1xuICAgIHJldHVybiByb3c7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHYWNoYVRhYmxlKGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sIGNoYXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCB0YWJsZSA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICBbXCJjYXB0aW9uXCIsIFwiR2FjaGEgY29pbnMgYnkgc2hvcCBjdXJyZW5jeSBhbmQgc3RhZ2Ugc291cmNlc1wiXSxcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiIH0sIFwiTmFtZVwiXSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgXVxuICAgICk7XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IHNob3BfaXRlbXMuZ2V0KGdhY2hhLnNob3BfaW5kZXgpO1xuICAgICAgICBpZiAoIWdhY2hhSXRlbSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXIoZ2FjaGFJdGVtKSkge1xuICAgICAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJ0ZFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIk5hbWVfY29sdW1uIFNvdXJjZV9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiR2FjaGFcIiB9LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkodW5kZWZpbmVkLCBuZXcgR2FjaGFJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpLCBjaGFyKSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWJsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3VsdHNUYWJsZShcbiAgICBmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgcHJpb3JpemVyOiAoaXRlbXM6IEl0ZW1bXSwgaXRlbTogSXRlbSkgPT4gSXRlbVtdLFxuICAgIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHJlc3VsdHM6IHsgW2tleTogc3RyaW5nXTogSXRlbVtdIH0gPSB7XG4gICAgICAgIFwiSGF0XCI6IFtdLFxuICAgICAgICBcIkhhaXJcIjogW10sXG4gICAgICAgIFwiRHllXCI6IFtdLFxuICAgICAgICBcIlVwcGVyXCI6IFtdLFxuICAgICAgICBcIkxvd2VyXCI6IFtdLFxuICAgICAgICBcIlNob2VzXCI6IFtdLFxuICAgICAgICBcIlNvY2tzXCI6IFtdLFxuICAgICAgICBcIkhhbmRcIjogW10sXG4gICAgICAgIFwiQmFja3BhY2tcIjogW10sXG4gICAgICAgIFwiRmFjZVwiOiBbXSxcbiAgICAgICAgXCJSYWNrZXRcIjogW10sXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgWywgaXRlbV0gb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGZpbHRlcihpdGVtKSkge1xuICAgICAgICAgICAgcmVzdWx0c1tpdGVtLnBhcnRdID0gcHJpb3JpemVyKHJlc3VsdHNbaXRlbS5wYXJ0XSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICBbXCJjYXB0aW9uXCIsIFwiTWF0Y2hpbmcgZXF1aXBtZW50IGJ5IHNsb3QgYW5kIHNlbGVjdGVkIHN0YXQgcHJpb3JpdHlcIl0sXG4gICAgICAgICAgICBbXCJ0aGVhZFwiLFxuICAgICAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJBcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkNoYXJhY3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJQYXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlBhcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKChzdGF0KSA9PiBjcmVhdGVQcmlvcml0eVN0YXRIZWFkZXJDZWxsKHN0YXQpKSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJMZXZlbF9jb2x1bW4gbnVtZXJpY1wiLCBzY29wZTogXCJjb2xcIiB9LCBcIkxldmVsXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlNvdXJjZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJTb3VyY2VcIl0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXCJ0Ym9keVwiXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgY29uc3QgdGFibGVCb2R5ID0gdGFibGUudEJvZGllc1swXTtcbiAgICBpZiAoIXRhYmxlQm9keSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgdHlwZSBNYXBPcHRpb25zID0geyBba2V5OiBzdHJpbmddOiBudW1iZXJbXSB9O1xuXG4gICAgdHlwZSBDb3N0ID0ge1xuICAgICAgICBnb2xkOiBudW1iZXIsXG4gICAgICAgIGFwOiBudW1iZXIsXG4gICAgICAgIG1hcHM6IE1hcE9wdGlvbnMsXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNvbWJpbmVNYXBzKG0xOiBNYXBPcHRpb25zLCBtMjogTWFwT3B0aW9ucyk6IE1hcE9wdGlvbnMge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7IC4uLm0xIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcCwgdHJpZXNdIG9mIE9iamVjdC5lbnRyaWVzKG0yKSkge1xuICAgICAgICAgICAgaWYgKHJlc3VsdFttYXBdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSByZXN1bHRbbWFwXS5jb25jYXQodHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSB0cmllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbWJpbmVDb3N0cyhjb3N0MTogQ29zdCwgY29zdDI6IENvc3QpOiBDb3N0IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQgKyBjb3N0Mi5nb2xkLFxuICAgICAgICAgICAgYXA6IGNvc3QxLmFwICsgY29zdDIuYXAsXG4gICAgICAgICAgICBtYXBzOiBjb21iaW5lTWFwcyhjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5NYXAobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAodHJpZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdFttYXBdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSBbTWF0aC5taW4ocmVzdWx0W21hcF1bMF0sIHRyaWVzWzBdKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWluQ29zdChjb3N0MTogQ29zdCwgY29zdDI6IENvc3QpOiBDb3N0IHtcbiAgICAgICAgLy8gTGV4aWNvZ3JhcGhpYyBvbiAoYXAsIGdvbGQpOiBsb3dlciBBUCB3aW5zLCB0aGVuIGxvd2VyIEdvbGQuXG4gICAgICAgIC8vIE51bWVyaWMgY29tcGFyZSBvbmx5IOKAlCBkbyBub3QgdXNlIEpTIGFycmF5L3N0cmluZyBvcmRlcmluZy5cbiAgICAgICAgY29uc3QgcGlja0Nvc3QxID1cbiAgICAgICAgICAgIGNvc3QxLmFwIDwgY29zdDIuYXAgfHxcbiAgICAgICAgICAgIChjb3N0MS5hcCA9PT0gY29zdDIuYXAgJiYgY29zdDEuZ29sZCA8IGNvc3QyLmdvbGQpO1xuICAgICAgICByZXR1cm4gcGlja0Nvc3QxID9cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnb2xkOiBjb3N0MS5nb2xkLFxuICAgICAgICAgICAgICAgIGFwOiBjb3N0MS5hcCxcbiAgICAgICAgICAgICAgICBtYXBzOiBtaW5NYXAoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgICAgICB9IDpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnb2xkOiBjb3N0Mi5nb2xkLFxuICAgICAgICAgICAgICAgIGFwOiBjb3N0Mi5hcCxcbiAgICAgICAgICAgICAgICBtYXBzOiBtaW5NYXAoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvc3RPZihpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBDb3N0IHtcbiAgICAgICAgY29uc3Qgc291cmNlQ29zdHMgPSBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgICAgICAubWFwKChpdGVtU291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZS5hcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IGl0ZW1Tb3VyY2UucHJpY2UsIG1hcHM6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogaXRlbVNvdXJjZS5wcmljZSwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlQ29zdCA9IGNvc3RPZihpdGVtU291cmNlLml0ZW0sIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSBpdGVtU291cmNlLmdhY2hhVHJpZXMoaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGQ6IHNpbmdsZUNvc3QuZ29sZCAqIG11bHRpcGxpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcDogc2luZ2xlQ29zdC5hcCAqIG11bHRpcGxpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBzOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoc2luZ2xlQ29zdC5tYXBzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChbbWFwLCB0cmllc10pID0+IFttYXAsIHRyaWVzLm1hcChuID0+IG4gKiBtdWx0aXBsaWVyKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhbW2l0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLCBbaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGhdXV0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmIChzb3VyY2VDb3N0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IGdvbGQ6IDAsIGFwOiAwLCBtYXBzOiB7fSB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIFNlZWQgd2l0aCB0aGUgZmlyc3QgcmVhbCBzb3VyY2UgY29zdC4gQSB7MCwwfSBpZGVudGl0eSB3b3VsZCBhbHdheXMgd2luXG4gICAgICAgIC8vIHVuZGVyIGEgY29ycmVjdCBtaW4sIGFuZCB0aGUgb2xkIGFsd2F5cy1sYXN0IGJ1ZyBoaWQgdGhhdC5cbiAgICAgICAgcmV0dXJuIHNvdXJjZUNvc3RzLnJlZHVjZSgoY3VyciwgY29zdCkgPT4gbWluQ29zdChjdXJyLCBjb3N0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJpb3JpdHlTdGF0aXN0aWNzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0gT2JqZWN0LmZyb21FbnRyaWVzKHByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gW3N0YXQsIDBdKSk7XG4gICAgY29uc3Qgc3RhdGlzdGljcyA9IHtcbiAgICAgICAgY2hhcmFjdGVyczogbmV3IFNldDxDaGFyYWN0ZXI+LFxuICAgICAgICBMZXZlbDogMCxcbiAgICAgICAgY29zdDogeyBhcDogMCwgZ29sZDogMCwgbWFwczoge30gfSBhcyBDb3N0LFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBPYmplY3QudmFsdWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3Qgc3RhdCBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5yZWR1Y2UoKGN1cnIsIHN0YXROYW1lKSA9PiBjdXJyICsgcmVzdWx0WzBdLnN0YXRGcm9tU3RyaW5nKHN0YXROYW1lKSwgMCk7XG4gICAgICAgICAgICBwcmlvcml0eVN0YXRpc3RpY3Nbc3RhdF0gKz0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0aXN0aWNzLkxldmVsID0gTWF0aC5tYXgocmVzdWx0WzBdLmxldmVsLCBzdGF0aXN0aWNzLkxldmVsKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2YgaXRlbS5jaGFyYWN0ZXIgPyBbaXRlbS5jaGFyYWN0ZXJdIDogY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgIHN0YXRpc3RpY3MuY2hhcmFjdGVycy5hZGQoY2hhcilcbiAgICAgICAgICAgICAgICB0YWJsZUJvZHkuYXBwZW5kQ2hpbGQoaXRlbVRvVGFibGVSb3coaXRlbSwgc291cmNlRmlsdGVyLCBwcmlvcml0eVN0YXRzLCBjaGFyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm9vdGVyIGNvc3QgbXVzdCBtYXRjaCBzdGF0cy9sZXZlbDogYmVzdCBjYW5kaWRhdGUgcGVyIHNsb3Qgb25seS5cbiAgICAgICAgLy8gVGhlIGJvZHkgc3RpbGwgcmVuZGVycyB0aGUgZnVsbCByYW5rZWQgbGlzdCBhYm92ZS5cbiAgICAgICAgc3RhdGlzdGljcy5jb3N0ID0gY29tYmluZUNvc3RzKFxuICAgICAgICAgICAgY29zdE9mKHJlc3VsdFswXSwgY2hhcmFjdGVyICYmIGlzQ2hhcmFjdGVyKGNoYXJhY3RlcikgPyBjaGFyYWN0ZXIgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgc3RhdGlzdGljcy5jb3N0LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmIChzdGF0aXN0aWNzLmNoYXJhY3RlcnMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBjb25zdCB0b3RhbF9zb3VyY2VzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBpZiAoc3RhdGlzdGljcy5jb3N0LmdvbGQgPiAwKSB7XG4gICAgICAgICAgICB0b3RhbF9zb3VyY2VzLnB1c2goYCR7c3RhdGlzdGljcy5jb3N0LmdvbGQudG9GaXhlZCgwKX0gR29sZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuYXAgPiAwKSB7XG4gICAgICAgICAgICB0b3RhbF9zb3VyY2VzLnB1c2goYCR7c3RhdGlzdGljcy5jb3N0LmFwLnRvRml4ZWQoMCl9IEFQYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9zdGF0aXN0aWNzWydHdWFyZGlhbiBnYW1lcyddLmZvckVhY2goKGNvdW50LCBtYXApID0+IHRvdGFsX3NvdXJjZXMucHVzaChgJHtjb3VudC50b0ZpeGVkKDApfSB4ICR7bWFwfWApKTtcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInRmb290XCIsXG4gICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgTmFtZV9jb2x1bW5cIiB9LCBcIlRvdGFsOlwiXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIEFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIENoYXJhY3Rlcl9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIFBhcnRfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgbnVtZXJpY1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIGAke3ByaW9yaXR5U3RhdGlzdGljc1tzdGF0XX1gXG4gICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgTGV2ZWxfY29sdW1uIG51bWVyaWNcIiB9LCBgJHtzdGF0aXN0aWNzLkxldmVsfWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgU291cmNlX2NvbHVtblwiIH0sIHRvdGFsX3NvdXJjZXMuam9pbihcIiwgXCIpXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0pKTtcbiAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBDaGFyYWN0ZXJfY29sdW1uYCkpIHtcbiAgICAgICAgICAgIGlmICghKGNvbHVtbl9lbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2x1bW5fZWxlbWVudC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICBpZiAocHJpb3JpdHlTdGF0aXN0aWNzW2F0dHJpYnV0ZV0gPT09IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sdW1uX2VsZW1lbnQgb2YgdGFibGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgJHthdHRyaWJ1dGV9X2NvbHVtbmApKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF4SXRlbUxldmVsKCkge1xuICAgIC8vbm8gcmVkdWNlIGZvciBNYXA/XG4gICAgbGV0IG1heCA9IDA7XG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBtYXggPSBNYXRoLm1heChtYXgsIGl0ZW0ubGV2ZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbWF4O1xufVxuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGRpYWxvZyAmJiBkaWFsb2cgPT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICB9XG59KTtcbiIsImltcG9ydCB7IG1ha2VDaGVja2JveFRyZWUsIFRyZWVOb2RlLCBnZXRMZWFmU3RhdGVzLCBzZXRMZWFmU3RhdGVzIH0gZnJvbSAnLi9jaGVja2JveFRyZWUnO1xuaW1wb3J0IHsgY3JlYXRlUG9wdXBMaW5rLCBkb3dubG9hZEl0ZW1zLCBnZXRSZXN1bHRzVGFibGUsIEl0ZW0sIEl0ZW1Tb3VyY2UsIGdldE1heEl0ZW1MZXZlbCwgaXRlbXMsIENoYXJhY3RlciwgY2hhcmFjdGVycywgaXNDaGFyYWN0ZXIsIFNob3BJdGVtU291cmNlLCBHYWNoYUl0ZW1Tb3VyY2UsIGdldEdhY2hhVGFibGUgfSBmcm9tICcuL2l0ZW1Mb29rdXAnO1xuaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQgeyBzZWxlY3RCeVByaW9yaXR5IH0gZnJvbSAnLi9wcmlvcml0eSc7XG5pbXBvcnQgeyBWYXJpYWJsZV9zdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlJztcblxuY29uc3QgcGFydHNGaWx0ZXIgPSBbXG4gICAgXCJQYXJ0c1wiLCBbXG4gICAgICAgIFwiSGVhZFwiLCBbXG4gICAgICAgICAgICBcIitIYXRcIixcbiAgICAgICAgICAgIFwiK0hhaXJcIixcbiAgICAgICAgICAgIFwiRHllXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1VwcGVyXCIsXG4gICAgICAgIFwiK0xvd2VyXCIsXG4gICAgICAgIFwiTGVnc1wiLCBbXG4gICAgICAgICAgICBcIitTaG9lc1wiLFxuICAgICAgICAgICAgXCJTb2Nrc1wiLFxuICAgICAgICBdLFxuICAgICAgICBcIkF1eFwiLCBbXG4gICAgICAgICAgICBcIitIYW5kXCIsXG4gICAgICAgICAgICBcIitCYWNrcGFja1wiLFxuICAgICAgICAgICAgXCIrRmFjZVwiXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1JhY2tldFwiLFxuICAgIF0sXG5dO1xuXG5jb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXIgPSBbXG4gICAgXCJBdmFpbGFiaWxpdHlcIiwgW1xuICAgICAgICBcIlNob3BcIiwgW1xuICAgICAgICAgICAgXCIrR29sZFwiLFxuICAgICAgICAgICAgXCIrQVBcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrQWxsb3cgZ2FjaGFcIixcbiAgICAgICAgXCIrR3VhcmRpYW5cIixcbiAgICAgICAgXCIrVW50cmFkYWJsZVwiLFxuICAgICAgICBcIlVuYXZhaWxhYmxlIGl0ZW1zXCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGV4Y2x1ZGVkX2l0ZW1faWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbi8qKiBEaWdpdHMtb25seSBzYWZlLWludGVnZXIgcGFyc2UgZm9yIGV4Y2x1ZGVkX2l0ZW1faWRzIGxvY2FsU3RvcmFnZSB0b2tlbnMuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeGNsdWRlZEl0ZW1JZFRva2VuKHRva2VuOiBzdHJpbmcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGlmICghL15cXGQrJC8udGVzdCh0b2tlbikpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBOdW1iZXIodG9rZW4pO1xuICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoaWQpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYWRkRmlsdGVyVHJlZXMoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFyYWN0ZXJGaWx0ZXJzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIFtcIkFsbFwiLCAuLi5jaGFyYWN0ZXJzXSkge1xuICAgICAgICBjb25zdCBpZCA9IGBjaGFyYWN0ZXJTZWxlY3RvcnNfJHtjaGFyYWN0ZXJ9YDtcbiAgICAgICAgY29uc3QgcmFkaW9fYnV0dG9uID0gY3JlYXRlSFRNTChbXCJpbnB1dFwiLCB7IGlkOiBpZCwgdHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImNoYXJhY3RlclNlbGVjdG9yc1wiLCB2YWx1ZTogY2hhcmFjdGVyIH1dKTtcbiAgICAgICAgcmFkaW9fYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHJhZGlvX2J1dHRvbik7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImxhYmVsXCIsIHsgZm9yOiBpZCB9LCBjaGFyYWN0ZXJdKSk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImJyXCJdKSk7XG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgcmFkaW9fYnV0dG9uLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpbHRlcnM6IFtUcmVlTm9kZSwgc3RyaW5nXVtdID0gW1xuICAgICAgICBbcGFydHNGaWx0ZXIsIFwicGFydHNGaWx0ZXJcIl0sXG4gICAgICAgIFthdmFpbGFiaWxpdHlGaWx0ZXIsIFwiYXZhaWxhYmlsaXR5RmlsdGVyXCJdLFxuICAgIF07XG4gICAgZm9yIChjb25zdCBbZmlsdGVyLCBuYW1lXSBvZiBmaWx0ZXJzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5hbWUpO1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyZWUgPSBtYWtlQ2hlY2tib3hUcmVlKGZpbHRlcik7XG4gICAgICAgIHRyZWUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmlubmVyVGV4dCA9IFwiXCI7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZCh0cmVlKTtcbiAgICB9XG59XG5cbmFkZEZpbHRlclRyZWVzKCk7XG5cbmxldCBkcmFnZ2VkOiBIVE1MRWxlbWVudDtcbmNvbnN0IGRyYWdTZXBhcmF0b3JMaW5lID0gY3JlYXRlSFRNTChbXCJoclwiLCB7IGlkOiBcImRyYWdPdmVyQmFyXCIgfV0pO1xubGV0IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBjcmVhdGVQcmlvcml0eU1vdmVJY29uKGRpcmVjdGlvbjogXCJ1cFwiIHwgXCJkb3duXCIpOiBTVkdTVkdFbGVtZW50IHtcbiAgICBjb25zdCBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcbiAgICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwic3ZnXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInByaW9yaXR5LW1vdmVfX2ljb25cIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIiwgXCIwIDAgMjQgMjRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFwiMTRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjE0XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImZvY3VzYWJsZVwiLCBcImZhbHNlXCIpO1xuICAgIGNvbnN0IHBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIFwicGF0aFwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcbiAgICAgICAgXCJkXCIsXG4gICAgICAgIGRpcmVjdGlvbiA9PT0gXCJ1cFwiID8gXCJNNiAxNC41IDEyIDguNWw2IDZcIiA6IFwiTTYgOS41IDEyIDE1LjVsNi02XCIsXG4gICAgKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJub25lXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIFwiY3VycmVudENvbG9yXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMi4yNVwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lY2FwXCIsIFwicm91bmRcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2UtbGluZWpvaW5cIiwgXCJyb3VuZFwiKTtcbiAgICBzdmcuYXBwZW5kKHBhdGgpO1xuICAgIHJldHVybiBzdmc7XG59XG5cbi8qKiBSZWFkIHJhbmtpbmcga2V5IGZyb20gdGhlIGxhYmVsIG5vZGUgc28gbW92ZSBjb250cm9scyBuZXZlciBwb2xsdXRlIHN0YXQgdGV4dC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmlvcml0eVN0YXRMYWJlbChpdGVtOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICBjb25zdCBsYWJlbCA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1zdGF0LWxhYmVsXCIpO1xuICAgIGlmIChsYWJlbD8udGV4dENvbnRlbnQpIHtcbiAgICAgICAgcmV0dXJuIGxhYmVsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIChpdGVtLnRleHRDb250ZW50ID8/IFwiXCIpLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gc2V0UHJpb3JpdHlTdGF0TGFiZWwoaXRlbTogSFRNTEVsZW1lbnQsIHN0YXQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGxhYmVsID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LXN0YXQtbGFiZWxcIik7XG4gICAgaWYgKGxhYmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBzdGF0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaXRlbS50ZXh0Q29udGVudCA9IHN0YXQ7XG4gICAgfVxuICAgIGNvbnN0IHVwID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtdXBcIik7XG4gICAgY29uc3QgZG93biA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLWRvd25cIik7XG4gICAgaWYgKHVwIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgdXAuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBgUmFpc2UgJHtzdGF0fSBwcmlvcml0eWApO1xuICAgICAgICB1cC50aXRsZSA9IGBSYWlzZSAke3N0YXR9YDtcbiAgICB9XG4gICAgaWYgKGRvd24gaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICBkb3duLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgYExvd2VyICR7c3RhdH0gcHJpb3JpdHlgKTtcbiAgICAgICAgZG93bi50aXRsZSA9IGBMb3dlciAke3N0YXR9YDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQ6IHN0cmluZyk6IEhUTUxMSUVsZW1lbnQge1xuICAgIGNvbnN0IHVwID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBjbGFzczogXCJwcmlvcml0eS1tb3ZlIHByaW9yaXR5LW1vdmUtdXBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgUmFpc2UgJHtzdGF0fSBwcmlvcml0eWAsXG4gICAgICAgICAgICB0aXRsZTogYFJhaXNlICR7c3RhdH1gLFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIHVwLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKFwidXBcIikpO1xuICAgIGNvbnN0IGRvd24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIGNsYXNzOiBcInByaW9yaXR5LW1vdmUgcHJpb3JpdHktbW92ZS1kb3duXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYExvd2VyICR7c3RhdH0gcHJpb3JpdHlgLFxuICAgICAgICAgICAgdGl0bGU6IGBMb3dlciAke3N0YXR9YCxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICBkb3duLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKFwiZG93blwiKSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwibGlcIixcbiAgICAgICAgeyBjbGFzczogXCJkcm9wem9uZVwiLCBkcmFnZ2FibGU6IFwidHJ1ZVwiIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJwcmlvcml0eS1zdGF0LWxhYmVsXCIgfSwgc3RhdF0sXG4gICAgICAgIGNyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcInByaW9yaXR5LW1vdmUtY29udHJvbHNcIiB9LCB1cCwgZG93bl0pLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBwcmlvcml0eUxpc3RJdGVtcyhsaXN0OiBIVE1MT0xpc3RFbGVtZW50KTogSFRNTExJRWxlbWVudFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShsaXN0LmNoaWxkcmVuKS5maWx0ZXIoXG4gICAgICAgIChub2RlKTogbm9kZSBpcyBIVE1MTElFbGVtZW50ID0+IG5vZGUgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIG5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIiksXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gc3luY1JhbmtpbmdTdW1tYXJ5SGludChsaXN0OiBIVE1MT0xpc3RFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgaGludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfc3VtbWFyeV9oaW50XCIpO1xuICAgIGlmICghKGhpbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b3AgPSBwcmlvcml0eUxpc3RJdGVtcyhsaXN0KVswXTtcbiAgICBpZiAoIXRvcCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxhYmVsID0gZ2V0UHJpb3JpdHlTdGF0TGFiZWwodG9wKTtcbiAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgaGludC50ZXh0Q29udGVudCA9IGAke2xhYmVsfSBmaXJzdGA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdDogSFRNTE9MaXN0RWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1zID0gcHJpb3JpdHlMaXN0SXRlbXMobGlzdCk7XG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICAgICAgY29uc3QgZG93biA9IGl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1tb3ZlLWRvd25cIik7XG4gICAgICAgIGlmICh1cCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgICB1cC5kaXNhYmxlZCA9IGluZGV4ID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRvd24uZGlzYWJsZWQgPSBpbmRleCA9PT0gaXRlbXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHN5bmNSYW5raW5nU3VtbWFyeUhpbnQobGlzdCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVQcmlvcml0eUxpc3RJdGVtKGl0ZW06IEhUTUxMSUVsZW1lbnQsIGRpcmVjdGlvbjogXCJ1cFwiIHwgXCJkb3duXCIpOiB2b2lkIHtcbiAgICBjb25zdCBsaXN0ID0gaXRlbS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBzaWJsaW5nOiBFbGVtZW50IHwgbnVsbCA9IGRpcmVjdGlvbiA9PT0gXCJ1cFwiID8gaXRlbS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nIDogaXRlbS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgd2hpbGUgKHNpYmxpbmcgJiYgIShzaWJsaW5nIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBzaWJsaW5nLmNsYXNzTGlzdC5jb250YWlucyhcImRyb3B6b25lXCIpKSkge1xuICAgICAgICBzaWJsaW5nID0gZGlyZWN0aW9uID09PSBcInVwXCIgPyBzaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBzaWJsaW5nLm5leHRFbGVtZW50U2libGluZztcbiAgICB9XG4gICAgaWYgKCEoc2libGluZyBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJ1cFwiKSB7XG4gICAgICAgIHNpYmxpbmcuYmVmb3JlKGl0ZW0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2libGluZy5hZnRlcihpdGVtKTtcbiAgICB9XG4gICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlEcmFnRHJvcCgpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7IHRhcmdldCB9ID0gZXZlbnQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuY2xvc2VzdChcIi5wcmlvcml0eS1tb3ZlLCAucHJpb3JpdHktbW92ZS1jb250cm9sc1wiKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3cgPSB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIilcbiAgICAgICAgICAgID8gdGFyZ2V0XG4gICAgICAgICAgICA6IHRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKCEocm93IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ2dlZCA9IHJvdztcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcm9wem9uZSA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKGRyb3B6b25lIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSBkcm9wem9uZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIC0gdGFyZ2V0UmVjdC50b3A7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0YXJnZXRSZWN0LmhlaWdodDtcbiAgICAgICAgICAgIGVudW0gUG9zaXRpb24ge1xuICAgICAgICAgICAgICAgIGFib3ZlLFxuICAgICAgICAgICAgICAgIG9uLFxuICAgICAgICAgICAgICAgIGJlbG93LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB5IDwgaGVpZ2h0ICogMC4zID8gUG9zaXRpb24uYWJvdmUgOiB5ID4gaGVpZ2h0ICogMC43ID8gUG9zaXRpb24uYmVsb3cgOiBQb3NpdGlvbi5vbjtcbiAgICAgICAgICAgIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmFib3ZlOlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZHJvcHpvbmUuYmVmb3JlKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5iZWxvdzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGRyb3B6b25lLmFmdGVyKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5vbjpcbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZCA9PT0gZHJvcHpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSBkcm9wem9uZTtcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKCFkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4pIHtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5hZnRlcihkcmFnZ2VkKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJhZ2dlZC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50O1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICghKGRyb3BUYXJnZXQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gYCR7Z2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJvcFRhcmdldCl9KyR7Z2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCl9YDtcbiAgICAgICAgICAgIHNldFByaW9yaXR5U3RhdExhYmVsKGRyb3BUYXJnZXQsIGNvbWJpbmVkKTtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJvcFRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRyb3BSb3cgPSB0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIilcbiAgICAgICAgICAgID8gdGFyZ2V0XG4gICAgICAgICAgICA6IHRhcmdldC5jbG9zZXN0KFwiI3ByaW9yaXR5X2xpc3QgPiBsaS5kcm9wem9uZVwiKTtcbiAgICAgICAgaWYgKGRyb3BSb3cgPT09IGRyYWdnZWQgJiYgZHJhZ2dlZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZ2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCkuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJhZ2dlZCwgc3RhdHMuc2hpZnQoKSEpO1xuICAgICAgICAgICAgZHJhZ2dlZC5hZnRlciguLi5zdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQpKSk7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gZHJhZ2dlZC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuYXBwbHlEcmFnRHJvcCgpO1xuXG5mdW5jdGlvbiBoeWRyYXRlUHJpb3JpdHlMaXN0Q29udHJvbHMoKTogdm9pZCB7XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHByaW9yaXR5TGlzdEl0ZW1zKHByaW9yaXR5TGlzdCkpIHtcbiAgICAgICAgaWYgKCFpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKSkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdCA9IChpdGVtLnRleHRDb250ZW50ID8/IFwiXCIpLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghc3RhdCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5yZXBsYWNlV2l0aChjcmVhdGVQcmlvcml0eUxpc3RJdGVtKHN0YXQpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFN0YXRpYyBIVE1MIHNoaXBzIGVtcHR5IGNvbnRyb2wgc2hlbGxzOyBmaWxsIGljb25zIHdpdGhvdXQgbG9zaW5nIGxhYmVscy5cbiAgICAgICAgZm9yIChjb25zdCBidXR0b24gb2YgaXRlbS5xdWVyeVNlbGVjdG9yQWxsKFwiLnByaW9yaXR5LW1vdmVcIikpIHtcbiAgICAgICAgICAgIGlmICghKGJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB8fCBidXR0b24ucXVlcnlTZWxlY3RvcihcInN2Z1wiKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gYnV0dG9uLmNsYXNzTGlzdC5jb250YWlucyhcInByaW9yaXR5LW1vdmUtdXBcIikgPyBcInVwXCIgOiBcImRvd25cIjtcbiAgICAgICAgICAgIGJ1dHRvbi5hcHBlbmQoY3JlYXRlUHJpb3JpdHlNb3ZlSWNvbihkaXJlY3Rpb24pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUocHJpb3JpdHlMaXN0KTtcbn1cblxuaHlkcmF0ZVByaW9yaXR5TGlzdENvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIGNvbXBhcmUobGhzOiBudW1iZXIsIHJoczogbnVtYmVyKTogLTEgfCAwIHwgMSB7XG4gICAgaWYgKGxocyA9PT0gcmhzKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gbGhzIDwgcmhzID8gLTEgOiAxO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RlZENoYXJhY3RlcigpOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzQ2hhcmFjdGVyKHNlbGVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRTZWxlY3RlZENoYXJhY3RlcihjaGFyYWN0ZXI6IENoYXJhY3RlciB8IFwiQWxsXCIpIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIik7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGNoYXJhY3RlckZpbHRlckxpc3QpIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUgPT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgaXRlbVNlbGVjdG9ycyA9IFtcInBhcnRzU2VsZWN0b3JcIiwgXCJnYWNoYVNlbGVjdG9yXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgSXRlbVNlbGVjdG9yID0gdHlwZW9mIGl0ZW1TZWxlY3RvcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1TZWxlY3RvcihpdGVtU2VsZWN0b3I6IHN0cmluZyk6IGl0ZW1TZWxlY3RvciBpcyBJdGVtU2VsZWN0b3Ige1xuICAgIHJldHVybiAoaXRlbVNlbGVjdG9ycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhpdGVtU2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtVHlwZVNlbGVjdGlvbigpOiBJdGVtU2VsZWN0b3Ige1xuICAgIGNvbnN0IHBhcnRzU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzU2VsZWN0b3JcIik7XG4gICAgaWYgKCEocGFydHNTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKHBhcnRzU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhY2hhU2VsZWN0b3JcIik7XG4gICAgaWYgKCEoZ2FjaGFTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKGdhY2hhU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJnYWNoYVNlbGVjdG9yXCI7XG4gICAgfVxuICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCkgfHwgXCJBbGxcIjtcbiAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIkNoYXJhY3RlclwiLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgey8vRmlsdGVyc1xuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHsgLy9taXNjXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIiwgbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiLCBpdGVtX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5kZWxldGVfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiLCBlbmNoYW50VG9nZ2xlLmNoZWNrZWQpO1xuICAgIH1cbiAgICB7IC8vaXRlbSBzZWxlY3Rpb25cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIsIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpO1xuICAgIH1cblxuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZXhjbHVkZWRfaXRlbV9pZHNcIiwgQXJyYXkuZnJvbShleGNsdWRlZF9pdGVtX2lkcykuam9pbihcIixcIikpO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHN0b3JlZF9jaGFyYWN0ZXIgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIkNoYXJhY3RlclwiKTtcbiAgICBzZXRTZWxlY3RlZENoYXJhY3Rlcih0eXBlb2Ygc3RvcmVkX2NoYXJhY3RlciA9PT0gXCJzdHJpbmdcIiAmJiBpc0NoYXJhY3RlcihzdG9yZWRfY2hhcmFjdGVyKSA/IHN0b3JlZF9jaGFyYWN0ZXIgOiBcIkFsbFwiKTtcblxuICAgIHsvL0ZpbHRlcnNcbiAgICAgICAgbGV0IHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKFZhcmlhYmxlX3N0b3JhZ2UudmFyaWFibGVzKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0LCBzdGF0ZXMpO1xuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgeyAvL21pc2NcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm1heExldmVsXCIpO1xuICAgICAgICBpZiAodHlwZW9mIG1heExldmVsID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBsZXZlbHJhbmdlLnZhbHVlID0gYCR7bWF4TGV2ZWx9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBsZXZlbHJhbmdlLm1heDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1fbmFtZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgbmFtZWZpbHRlci52YWx1ZSA9IGl0ZW1fbmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA9ICEhVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIH1cblxuICAgIC8vIFJlaHlkcmF0ZSBleGNsdXNpb25zIGJlZm9yZSBhbnkgc2F2ZS1jYXBhYmxlIGV2ZW50IChjaGFuZ2UvaW5wdXQg4oaSIHVwZGF0ZVJlc3VsdHMg4oaSIHNhdmVTZWxlY3Rpb24pLlxuICAgIGNvbnN0IGV4Y2x1ZGVkX2lkcyA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiZXhjbHVkZWRfaXRlbV9pZHNcIik7XG4gICAgaWYgKHR5cGVvZiBleGNsdWRlZF9pZHMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBleGNsdWRlZF9pZHMuc3BsaXQoXCIsXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUV4Y2x1ZGVkSXRlbUlkVG9rZW4oaWQpO1xuICAgICAgICAgICAgaWYgKHBhcnNlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZXhjbHVkZWRfaXRlbV9pZHMuYWRkKHBhcnNlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vaXRlbSBzZWxlY3Rpb25cbiAgICAgICAgbGV0IGl0ZW1UeXBlU2VsZWN0b3IgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVR5cGVTZWxlY3RvciAhPT0gXCJzdHJpbmdcIiB8fCAhaXNJdGVtU2VsZWN0b3IoaXRlbVR5cGVTZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGl0ZW1UeXBlU2VsZWN0b3IgPSBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW1UeXBlU2VsZWN0b3IpO1xuICAgICAgICBpZiAoIShzZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0b3IuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHNlbGVjdG9yLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IHRydWUgfSkpO1xuICAgIH1cblxuICAgIC8vbXVzdCBiZSBsYXN0IGJlY2F1c2UgaXQgdHJpZ2dlcnMgYSBzdG9yZVxuICAgIGxldmVscmFuZ2UuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVJlc3VsdHMoKSB7XG4gICAgc2F2ZVNlbGVjdGlvbigpO1xuICAgIC8vIFdoaWxlIGZpcnN0LWxvYWQgbGFiIHByZXAgaXMgYWN0aXZlLCBrZWVwIGZyaWVuZGx5IGxvYWRpbmcgY29weSDigJQgZG8gbm90IHBhaW50XG4gICAgLy8gYW4gZW1wdHkgaW52ZW50b3J5IChcIk5vIGl0ZW1zIG1hdGNo4oCmXCIpIG92ZXIgdGhlIGFuaW1hdGVkIGxvYWRlci5cbiAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzX2dyb3VwXCIpPy5nZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlsdGVyczogKChpdGVtOiBJdGVtKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgY29uc3Qgc291cmNlRmlsdGVyczogKChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgbGV0IHNlbGVjdGVkQ2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB7IC8vY2hhcmFjdGVyIGZpbHRlclxuICAgICAgICBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkQ2hhcmFjdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0uY2hhcmFjdGVyID09PSBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vcGFydHMgZmlsdGVyXG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHNTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCk7XG4gICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gcGFydHNTdGF0ZXNbaXRlbS5wYXJ0XSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9hdmFpbGFiaWxpdHkgZmlsdGVyXG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVN0YXRlcyA9IGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCk7XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR29sZFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgIWl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFQXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiBpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbnRyYWRhYmxlXCJdKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLnBhcmNlbF9lbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFsbG93IGdhY2hhXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkd1YXJkaWFuXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVuYXZhaWxhYmxlIGl0ZW1zXCJdKSB7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIgPSBbLi4uc291cmNlRmlsdGVyc107XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VGaWx0ZXIgPSAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlRmlsdGVyKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVTb3VyY2UpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW0oaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbVNvdXJjZSBvZiBpdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9taXNjIGZpbHRlclxuICAgICAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpO1xuICAgICAgICBmaWx0ZXJzLnB1c2goKGl0ZW06IEl0ZW0pID0+IGl0ZW0ubGV2ZWwgPD0gbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ubmFtZV9lbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGl0ZW1fbmFtZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vaWQgZmlsdGVyXG4gICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+ICFleGNsdWRlZF9pdGVtX2lkcy5oYXMoaXRlbS5pZCkpO1xuICAgICAgICBjb25zdCBpdGVtRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXRlbUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEoaXRlbUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcblxuICAgICAgICB9XG4gICAgICAgIGl0ZW1GaWx0ZXJMaXN0LnJlcGxhY2VDaGlsZHJlbigpO1xuICAgICAgICBpZiAoZXhjbHVkZWRfaXRlbV9pZHMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgaXRlbUZpbHRlckxpc3QuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJlbXB0eS1ub3RlXCIgfSxcbiAgICAgICAgICAgICAgICBcIk5vIGV4Y2x1ZGVkIGl0ZW1zXCIsXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2l0ZW1faWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zLmdldChpZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJleGNsdWRlZC1pdGVtXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImV4Y2x1ZGVkLWl0ZW1fX25hbWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsX3JlbW92YWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgUmVzdG9yZSAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZXN0b3JlXCIsXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY29uc3QgY29tcGFyYXRvcnM6ICgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IG51bWJlcilbXSA9IFtdO1xuXG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlTdGF0cyA9IHByaW9yaXR5TGlzdEl0ZW1zKHByaW9yaXR5TGlzdClcbiAgICAgICAgLm1hcChub2RlID0+IGdldFByaW9yaXR5U3RhdExhYmVsKG5vZGUpKVxuICAgICAgICAuZmlsdGVyKHN0YXQgPT4gc3RhdC5sZW5ndGggPiAwKTtcbiAgICB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RhdCBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXQuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgY29tcGFyYXRvcnMucHVzaCgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IGNvbXBhcmUoXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gbGhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKSxcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiByaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0c1RhYmxlKFxuICAgICAgICAgICAgICAgICAgICBpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UgPT4gc291cmNlRmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW1Tb3VyY2UpKSxcbiAgICAgICAgICAgICAgICAgICAgKGl0ZW1zLCBpdGVtKSA9PiBzZWxlY3RCeVByaW9yaXR5KGl0ZW1zLCBpdGVtLCBjb21wYXJhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5U3RhdHMsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRHYWNoYVRhYmxlKGl0ZW0gPT4gZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW0pKSwgc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1wiKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdFJvd3MgPSB0YWJsZS50Qm9kaWVzWzBdPy5yb3dzLmxlbmd0aCA/PyBNYXRoLm1heCgwLCB0YWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xuICAgIHRhcmdldC5pbm5lclRleHQgPSBcIlwiO1xuICAgIGlmIChyZXN1bHRSb3dzID09PSAwKSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWVtcHR5XCIsIHJvbGU6IFwic3RhdHVzXCIgfSxcbiAgICAgICAgICAgIFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIixcbiAgICAgICAgXSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBpZiAocmVzdWx0c1N0YXR1cykge1xuICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID0gcmVzdWx0Um93cyA9PT0gMFxuICAgICAgICAgICAgPyBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCJcbiAgICAgICAgICAgIDogYCR7cmVzdWx0Um93c30gbWF0Y2hpbmcgJHtyZXN1bHRSb3dzID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICB9XG4gICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xufVxuXG5sZXQgcmVzdWx0c1RhYmxlU2Nyb2xsQm91bmQgPSBmYWxzZTtcbmxldCByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCByZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQgPSBmYWxzZTtcblxuLyoqIEtlZXAgdGhlIHRvcCBjb2x1bW4gc2Nyb2xsZXIgd2lkdGggYW5kIHNjcm9sbExlZnQgYWxpZ25lZCB3aXRoIHRoZSByZXN1bHRzIHRhYmxlLiAqL1xuZnVuY3Rpb24gc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpIHtcbiAgICBjb25zdCB0YWJsZVNjcm9sbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVTY3JvbGxcIik7XG4gICAgY29uc3QgdGFibGVIU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxcIik7XG4gICAgY29uc3Qgc3BhY2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxTcGFjZXJcIik7XG4gICAgY29uc3QgY29sdW1uUGFuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUNvbHVtblBhblwiKTtcbiAgICBpZiAoISh0YWJsZVNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHRhYmxlSFNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHNwYWNlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGNvbHVtblBhbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHRzVGFibGVTY3JvbGxCb3VuZCkge1xuICAgICAgICByZXN1bHRzVGFibGVTY3JvbGxCb3VuZCA9IHRydWU7XG4gICAgICAgIGxldCBzeW5jaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IG1pcnJvciA9IChzb3VyY2U6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3luY2luZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN5bmNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGFyZ2V0LnNjcm9sbExlZnQgPSBzb3VyY2Uuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHN5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGFibGVTY3JvbGwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBtaXJyb3IodGFibGVTY3JvbGwsIHRhYmxlSFNjcm9sbCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgdGFibGVIU2Nyb2xsLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgbWlycm9yKHRhYmxlSFNjcm9sbCwgdGFibGVTY3JvbGwpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcbiAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXIub2JzZXJ2ZSh0YWJsZVNjcm9sbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlU2Nyb2xsLnF1ZXJ5U2VsZWN0b3IoXCJ0YWJsZVwiKTtcbiAgICBpZiAoISh0YWJsZSBpbnN0YW5jZW9mIEhUTUxUYWJsZUVsZW1lbnQpKSB7XG4gICAgICAgIGNvbHVtblBhbi5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBcIjBweFwiO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudFdpZHRoID0gTWF0aC5tYXgodGFibGUuc2Nyb2xsV2lkdGgsIHRhYmxlU2Nyb2xsLnNjcm9sbFdpZHRoKTtcbiAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBgJHtjb250ZW50V2lkdGh9cHhgO1xuICAgIGNvbnN0IG5lZWRzSG9yaXpvbnRhbFNjcm9sbCA9IGNvbnRlbnRXaWR0aCA+IHRhYmxlU2Nyb2xsLmNsaWVudFdpZHRoICsgMTtcbiAgICBjb25zdCB3YXNIaWRkZW4gPSBjb2x1bW5QYW4uaGlkZGVuO1xuICAgIGNvbHVtblBhbi5oaWRkZW4gPSAhbmVlZHNIb3Jpem9udGFsU2Nyb2xsO1xuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ/LmlzU2FtZU5vZGUodGFibGVIU2Nyb2xsKSkge1xuICAgICAgICB0YWJsZUhTY3JvbGwuc2Nyb2xsTGVmdCA9IHRhYmxlU2Nyb2xsLnNjcm9sbExlZnQ7XG4gICAgfVxuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgd2FzSGlkZGVuICYmICFyZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQpIHtcbiAgICAgICAgcmVzdWx0c0NvbHVtblBhblJldmVhbGVkID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5hZGQoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgfSwgMjQwKTtcbiAgICB9XG4gICAgaWYgKCFuZWVkc0hvcml6b250YWxTY3JvbGwpIHtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpIHtcbiAgICBjb25zdCBsZXZlbERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVsRGlzcGxheVwiKTtcbiAgICBpZiAoIShsZXZlbERpc3BsYXkgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbGV2ZWxyYW5nZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBsZXZlbERpc3BsYXkudGV4dENvbnRlbnQgPSBgTWF4IGxldmVsIHJlcXVpcmVtZW50OiAke2xldmVscmFuZ2UudmFsdWV9YDtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNwbGF5VXBkYXRlcygpIHtcbiAgICBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKTtcbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBuYW1lZmlsdGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcblxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgZW5jaGFudFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyAvXigoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLyA6IC9eTWF4ICgoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLztcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VyID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gXCJNYXggJDFcIiA6IFwiJDFcIjtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChub2RlKS5zcGxpdChcIitcIikubWFwKHMgPT4gcy5yZXBsYWNlKHJlZ2V4LCByZXBsYWNlcikpLmpvaW4oXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSwgbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5zZXREaXNwbGF5VXBkYXRlcygpO1xuXG5mdW5jdGlvbiBzZXRNb2JpbGVGaWx0ZXJDb250cm9scygpIHtcbiAgICBjb25zdCBmaWx0ZXJUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlclRvZ2dsZVwiKTtcbiAgICBjb25zdCBjbG9zZUZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlRmlsdGVyc1wiKTtcbiAgICBjb25zdCBmaWx0ZXJQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbFJhaWxcIik7XG4gICAgY29uc3QgZmlsdGVyQmFja2Ryb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlckJhY2tkcm9wXCIpO1xuICAgIGlmICghKGZpbHRlclRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGNsb3NlRmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlclBhbmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyQmFja2Ryb3AgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b2dnbGVCdXR0b24gPSBmaWx0ZXJUb2dnbGU7XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjbG9zZUZpbHRlcnM7XG4gICAgY29uc3QgcGFuZWwgPSBmaWx0ZXJQYW5lbDtcbiAgICBjb25zdCBiYWNrZHJvcEJ1dHRvbiA9IGZpbHRlckJhY2tkcm9wO1xuXG4gICAgZnVuY3Rpb24gc2V0T3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICB0b2dnbGVCdXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBgJHtvcGVufWApO1xuICAgICAgICBiYWNrZHJvcEJ1dHRvbi5oaWRkZW4gPSAhb3BlbjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZmlsdGVycy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgY29uc3QgbmFtZUZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgICAgIGlmIChuYW1lRmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvY3VzQWZ0ZXJPcGVuID0gKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnByb3BlcnR5TmFtZSAhPT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIGZvY3VzQWZ0ZXJPcGVuKTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgIG5hbWVGaWx0ZXIuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbi5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKHRydWUpKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGJhY2tkcm9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgIT09IFwiVGFiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IEFycmF5LmZyb20ocGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzdW1tYXJ5LCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICkpLmZpbHRlcihlbGVtZW50ID0+IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBsYXN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZmlyc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGFzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZXZlbnQuc2hpZnRLZXlcbiAgICAgICAgICAgICYmICghcGFuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgfHwgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gbGFzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmlyc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3aW5kb3cubWF0Y2hNZWRpYShcIihtaW4td2lkdGg6IDg4MHB4KVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICh7IG1hdGNoZXMgfSkgPT4ge1xuICAgICAgICBpZiAobWF0Y2hlcyAmJiBwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5zZXRNb2JpbGVGaWx0ZXJDb250cm9scygpO1xuXG5mdW5jdGlvbiBzZXRSZXNldEZpbHRlckNvbnRyb2woKSB7XG4gICAgY29uc3QgcmVzZXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldEZpbHRlcnNcIik7XG4gICAgY29uc3QgcmVmaW5lbWVudFN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmaW5lbWVudFN0YXR1c1wiKTtcbiAgICBpZiAoIShyZXNldEZpbHRlcnMgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShyZWZpbmVtZW50U3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzZXRGaWx0ZXJzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHJlZmluZW1lbnRTdGF0dXMudGV4dENvbnRlbnQgPSBcIlJlc2V0dGluZyBmaWx0ZXJz4oCmXCI7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuY2xlYXJfYWxsKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn1cblxuc2V0UmVzZXRGaWx0ZXJDb250cm9sKCk7XG5cbmZ1bmN0aW9uIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCkge1xuICAgIGNvbnN0IHByaW9yaXR5X2dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9ncm91cFwiKTtcbiAgICBpZiAoIShwcmlvcml0eV9ncm91cCBpbnN0YW5jZW9mIEhUTUxGaWVsZFNldEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik7XG4gICAgaWYgKCEocGFydHNGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYXJ0c1NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnYWNoYVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0c0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzX2dyb3VwXCIpO1xuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgY29uc3QgbG9hZGluZ0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdDb3B5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19kZXRhaWxcIilcbiAgICAgICAgPz8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19jb3B5IHNwYW5cIik7XG4gICAgY29uc3QgbG9hZGluZ0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX2dyb3VwXCIpO1xuICAgIGlmICghKHJlc3VsdHNTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShsb2FkaW5nTGFiZWwgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdDb3B5IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJ0cnVlXCIpO1xuICAgIGxvYWRpbmdHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICBzZXRJdGVtVHlwZVNlbGVjdG9yRnVuY3Rpb25hbGl0eSgpO1xuICAgIHJlc3RvcmVTZWxlY3Rpb24oKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkb3dubG9hZEl0ZW1zKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIkl0ZW0gZGF0YSB1bmF2YWlsYWJsZVwiO1xuICAgICAgICBsb2FkaW5nTGFiZWwudGV4dENvbnRlbnQgPSBcIkNvdWxkIG5vdCBsb2FkIGVxdWlwbWVudCBkYXRhXCI7XG4gICAgICAgIGxvYWRpbmdDb3B5LnRleHRDb250ZW50ID0gXCJDaGVjayB0aGUgcHJldmlldyBzZXJ2ZXIgY29ubmVjdGlvbiwgdGhlbiByZWxvYWQgdGhpcyBwYWdlLlwiO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICBsb2FkaW5nR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2hvd19hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJoaWRlX2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBtYXhMZXZlbCA9IGdldE1heEl0ZW1MZXZlbCgpO1xuICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHtNYXRoLm1pbihwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKSwgbWF4TGV2ZWwpfWA7XG4gICAgbGV2ZWxyYW5nZS5tYXggPSBgJHttYXhMZXZlbH1gO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgbG9hZGluZ0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICBjb25zdCBzb3J0X2hlbHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xlZ2VuZFwiKTtcbiAgICBpZiAoc29ydF9oZWxwIGluc3RhbmNlb2YgSFRNTExlZ2VuZEVsZW1lbnQpIHtcbiAgICAgICAgc29ydF9oZWxwLmFwcGVuZENoaWxkKGNyZWF0ZVBvcHVwTGluayhcIiAoPylcIiwgY3JlYXRlSFRNTChbXCJwXCIsXG4gICAgICAgICAgICBcIlJlb3JkZXIgdGhlIHN0YXRzIHRvIHlvdXIgbGlraW5nIHRvIGFmZmVjdCB0aGUgcmVzdWx0cyBsaXN0LlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiVXNlIHRoZSB1cC9kb3duIGFycm93cywgb3IgZHJhZyBhIHN0YXQsIHRvIGNoYW5nZSBpdHMgaW1wb3J0YW5jZSAoZm9yIGV4YW1wbGUgbW92ZSBMb2IgYWJvdmUgQ2hhcmdlKS5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIkRyYWcgYSBzdGF0IG9udG8gYW5vdGhlciB0byBjb21iaW5lIHRoZW0gKGZvciBleGFtcGxlIFN0ciBvbnRvIERleCwgdGhlIHJlc3VsdHMgd2lsbCBkaXNwbGF5IFN0citEZXgpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIGNvbWJpbmVkIHN0YXQgb250byBpdHNlbGYgdG8gc2VwYXJhdGUgdGhlbS5cIl0pKSk7XG4gICAgfVxufSk7XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJpb3JpdHlVcCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUtdXBcIik7XG4gICAgaWYgKHByaW9yaXR5VXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCAmJiAhcHJpb3JpdHlVcC5kaXNhYmxlZCkge1xuICAgICAgICBjb25zdCByb3cgPSBwcmlvcml0eVVwLmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAocm93IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgbW92ZVByaW9yaXR5TGlzdEl0ZW0ocm93LCBcInVwXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eURvd24gPSBldmVudC50YXJnZXQuY2xvc2VzdChcIi5wcmlvcml0eS1tb3ZlLWRvd25cIik7XG4gICAgaWYgKHByaW9yaXR5RG93biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICFwcmlvcml0eURvd24uZGlzYWJsZWQpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gcHJpb3JpdHlEb3duLmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAocm93IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgbW92ZVByaW9yaXR5TGlzdEl0ZW0ocm93LCBcImRvd25cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV4Y2x1ZGVCdXR0b24gPSBldmVudC50YXJnZXQuY2xvc2VzdChcIi5pdGVtX3JlbW92YWxcIik7XG4gICAgaWYgKGV4Y2x1ZGVCdXR0b24gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAoIWV4Y2x1ZGVCdXR0b24uZGF0YXNldC5pdGVtX2luZGV4KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXhjbHVkZWRfaXRlbV9pZHMuYWRkKHBhcnNlSW50KGV4Y2x1ZGVCdXR0b24uZGF0YXNldC5pdGVtX2luZGV4KSk7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3RvcmVCdXR0b24gPSBldmVudC50YXJnZXQuY2xvc2VzdChcIi5pdGVtX3JlbW92YWxfcmVtb3ZhbFwiKTtcbiAgICBpZiAocmVzdG9yZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghcmVzdG9yZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5kZWxldGUocGFyc2VJbnQocmVzdG9yZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH1cbn0pO1xuIiwiZXhwb3J0IHR5cGUgUHJpb3JpdHlDb21wYXJhdG9yPFQ+ID0gKGxoczogVCwgcmhzOiBUKSA9PiBudW1iZXI7XG5cbi8qKlxuICogSW5zZXJ0IGBjYW5kaWRhdGVgIGludG8gYSBiZXN0LWZpcnN0IHJhbmtpbmcuXG4gKiBIaWdoZXIgY29tcGFyYXRvciB2YWx1ZXMgbWVhbiB0aGUgbGVmdC1oYW5kIGl0ZW0gcmFua3MgYmV0dGVyLlxuICogRXZlcnkgY2FuZGlkYXRlIGlzIHJldGFpbmVkIHNvIHRoZSBVSSBjYW4gc2hvdyB0aGUgZnVsbCBmaWx0ZXJlZCBpbnZlbnRvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RCeVByaW9yaXR5PFQ+KFxuICAgIGN1cnJlbnQ6IFRbXSxcbiAgICBjYW5kaWRhdGU6IFQsXG4gICAgY29tcGFyYXRvcnM6IHJlYWRvbmx5IFByaW9yaXR5Q29tcGFyYXRvcjxUPltdLFxuKTogVFtdIHtcbiAgICBpZiAoY3VycmVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFtjYW5kaWRhdGVdO1xuICAgIH1cblxuICAgIGxldCBpbnNlcnRBdCA9IGN1cnJlbnQubGVuZ3RoO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjdXJyZW50Lmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgICBsZXQgZGVjaWRlZCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgY29tcGFyYXRvciBvZiBjb21wYXJhdG9ycykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGFyYXRvcihjdXJyZW50W2luZGV4XSwgY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IDApIHtcbiAgICAgICAgICAgICAgICBkZWNpZGVkID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWNpZGVkIDwgMCkge1xuICAgICAgICAgICAgLy8gY3VycmVudFtpbmRleF0gaXMgd29yc2UgdGhhbiBjYW5kaWRhdGU6IGluc2VydCBiZWZvcmUgaXQuXG4gICAgICAgICAgICBpbnNlcnRBdCA9IGluZGV4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVjaWRlZCA+IDA6IGN1cnJlbnQgaXRlbSBpcyBiZXR0ZXI7IGtlZXAgc2Nhbm5pbmcuXG4gICAgICAgIC8vIGRlY2lkZWQgPT09IDA6IGV4YWN0IHRpZTsga2VlcCBzY2FubmluZyBzbyB0aWVzIHN0YXkgc3RhYmxlL0ZJRk8uXG4gICAgfVxuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgLi4uY3VycmVudC5zbGljZSgwLCBpbnNlcnRBdCksXG4gICAgICAgIGNhbmRpZGF0ZSxcbiAgICAgICAgLi4uY3VycmVudC5zbGljZShpbnNlcnRBdCksXG4gICAgXTtcbn1cbiIsIi8qKiBJbnRlcm5hbCBwcmlvcml0eSBrZXlzIOKGkiBzaG9ydCB0YWJsZSBoZWFkZXIgKyBodW1hbiBmdWxsIG5hbWUgZm9yIHRvb2x0aXBzLiAqL1xuY29uc3QgUFJJT1JJVFlfU1RBVF9IRUFERVJfQUJCUkVWOiBSZWFkb25seTxcbiAgICBSZWNvcmQ8c3RyaW5nLCB7IHJlYWRvbmx5IHNob3J0OiBzdHJpbmc7IHJlYWRvbmx5IGZ1bGw6IHN0cmluZyB9PlxuPiA9IHtcbiAgICBcIk1vdiBTcGVlZFwiOiB7IHNob3J0OiBcIk1TXCIsIGZ1bGw6IFwiTW92IFNwZWVkXCIgfSxcbiAgICBcIlF1aWNrc2xvdHNcIjogeyBzaG9ydDogXCJRU1wiLCBmdWxsOiBcIlF1aWNrIFNsb3RzXCIgfSxcbiAgICBcIkJ1ZmZzbG90c1wiOiB7IHNob3J0OiBcIkJTXCIsIGZ1bGw6IFwiQnVmZiBTbG90c1wiIH0sXG59O1xuXG5leHBvcnQgdHlwZSBQcmlvcml0eVN0YXRIZWFkZXJEaXNwbGF5ID0ge1xuICAgIHJlYWRvbmx5IHNob3J0OiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgZnVsbDogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGFiYnJldmlhdGVkOiBib29sZWFuO1xufTtcblxuLyoqIE1hcCBhIHByaW9yaXR5IHN0YXQga2V5IChvciBjb21iaW5lZCBcIkErQlwiKSB0byBzaG9ydCBoZWFkZXIgdGV4dCArIGZ1bGwgdG9vbHRpcCBuYW1lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW9yaXR5U3RhdEhlYWRlckRpc3BsYXkoc3RhdDogc3RyaW5nKTogUHJpb3JpdHlTdGF0SGVhZGVyRGlzcGxheSB7XG4gICAgY29uc3QgcGFydHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICBjb25zdCBtYXBwZWQgPSBwYXJ0cy5tYXAoKHBhcnQpID0+IHtcbiAgICAgICAgY29uc3Qga25vd24gPSBQUklPUklUWV9TVEFUX0hFQURFUl9BQkJSRVZbcGFydF07XG4gICAgICAgIHJldHVybiBrbm93biA/PyB7IHNob3J0OiBwYXJ0LCBmdWxsOiBwYXJ0IH07XG4gICAgfSk7XG4gICAgY29uc3Qgc2hvcnQgPSBtYXBwZWQubWFwKChwYXJ0KSA9PiBwYXJ0LnNob3J0KS5qb2luKFwiK1wiKTtcbiAgICBjb25zdCBmdWxsID0gbWFwcGVkLm1hcCgocGFydCkgPT4gcGFydC5mdWxsKS5qb2luKFwiK1wiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaG9ydCxcbiAgICAgICAgZnVsbCxcbiAgICAgICAgYWJicmV2aWF0ZWQ6IHNob3J0ICE9PSBmdWxsLFxuICAgIH07XG59XG4iLCJleHBvcnQgdHlwZSBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzID0gbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbjtcblxudHlwZSBTdG9yYWdlX3ZhbHVlID0gYCR7XCJzXCIgfCBcIm5cIiB8IFwiYlwifSR7c3RyaW5nfWA7XG5cbmZ1bmN0aW9uIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyk6IFN0b3JhZ2VfdmFsdWUge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBgcyR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgcmV0dXJuIGBuJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gXCJiMVwiIDogXCJiMFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5nX3RvX3ZhcmlhYmxlKHZ2OiBTdG9yYWdlX3ZhbHVlKTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB7XG4gICAgY29uc3QgcHJlZml4ID0gdnZbMF07XG4gICAgY29uc3QgdmFsdWUgPSB2di5zdWJzdHJpbmcoMSk7XG4gICAgc3dpdGNoIChwcmVmaXgpIHtcbiAgICAgICAgY2FzZSAncyc6IC8vc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIGNhc2UgJ24nOiAvL251bWJlclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICBjYXNlICdiJzogLy9ib29sZWFuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IFwiMVwiID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBgaW52YWxpZCB2YWx1ZTogJHt2dn1gO1xufVxuXG5mdW5jdGlvbiBpc19zdG9yYWdlX3ZhbHVlKGtleTogc3RyaW5nKToga2V5IGlzIFN0b3JhZ2VfdmFsdWUge1xuICAgIHJldHVybiBrZXkubGVuZ3RoID49IDEgJiYgXCJzbmJcIi5pbmNsdWRlcyhrZXlbMF0pO1xufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFibGVfc3RvcmFnZSB7XG4gICAgc3RhdGljIGdldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdG9yZWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUoc3RvcmVkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdfdG9fdmFyaWFibGUoc3RvcmVkKTtcbiAgICB9XG4gICAgc3RhdGljIHNldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcsIHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCwgdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlKSk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWxldGVfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgfVxuICAgIHN0YXRpYyBjbGVhcl9hbGwoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHZhcmlhYmxlcygpIHtcbiAgICAgICAgbGV0IHJlc3VsdDogeyBba2V5OiBzdHJpbmddOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIH0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBzdHJpbmdfdG9fdmFyaWFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSJdfQ==
