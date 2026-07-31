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

},{"./html":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.characters = exports.ShopItemSource = exports.ItemSource = exports.Item = exports.GuardianItemSource = exports.GachaItemSource = void 0;
exports.createPopupLink = createPopupLink;
exports.download = download;
exports.downloadItems = downloadItems;
exports.getGachaTable = getGachaTable;
exports.getMaxItemLevel = getMaxItemLevel;
exports.getResultsTable = getResultsTable;
exports.isCharacter = isCharacter;
exports.items = void 0;
exports.projectGachaEconomics = projectGachaEconomics;
exports.shop_items = void 0;
var _html = require("./html");
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
  parcel_from_shop = false;
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
  constructor(shop_index, gacha_index, name) {
    this.shop_index = shop_index;
    this.gacha_index = gacha_index;
    this.name = name;
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
let items = exports.items = new Map();
let shop_items = exports.shop_items = new Map();
let gachas = new Map();
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
function parseShopData(data) {
  const debugShopParsing = false;
  if (data.length < 1000) {
    console.warn(`Shop file is only ${data.length} bytes long`);
  }
  let currentIndex = 0;
  for (const match of data.matchAll(/<Product DISPLAY="\d+" HIT_DISPLAY="\d+" Index="(?<index>\d+)" Enable="(?<enabled>0|1)" New="\d+" Hit="\d+" Free="\d+" Sale="\d+" Event="\d+" Couple="\d+" Nobuy="\d+" Rand="[^"]+" UseType="[^"]+" Use0="\d+" Use1="\d+" Use2="\d+" PriceType="(?<price_type>(?:MINT)|(?:GOLD))" OldPrice0="-?\d+" OldPrice1="-?\d+" OldPrice2="-?\d+" Price0="(?<price>-?\d+)" Price1="-?\d+" Price2="-?\d+" CouplePrice="-?\d+" Category="(?<category>[^"]*)" Name="(?<name>[^"]*)" GoldBack="-?\d+" EnableParcel="(?<parcel_from_shop>0|1)" Char="-?\d+" Item0="(?<item0>-?\d+)" Item1="(?<item1>-?\d+)" Item2="(?<item2>-?\d+)" Item3="(?<item3>-?\d+)" Item4="(?<item4>-?\d+)" Item5="(?<item5>-?\d+)" Item6="(?<item6>-?\d+)" Item7="(?<item7>-?\d+)" Item8="(?<item8>-?\d+)" Item9="(?<item9>-?\d+)" ?(?:Icon="[^"]*" ?)?(?:Name_kr="[^"]*" ?)?(?:Name_en="(?<name_en>[^"]*)" ?)?(?:Name_th="[^"]*" ?)?\/>/g)) {
    if (!match.groups) {
      continue;
    }
    const index = parseInt(match.groups.index);
    if (currentIndex + 1 !== index) {
      debugShopParsing && console.warn(`Failed parsing shop item index ${currentIndex + 2 === index ? currentIndex + 1 : `${currentIndex + 1} to ${index - 1}`}`);
    }
    currentIndex = index;
    const name = match.groups.name;
    const category = match.groups.category;
    if (category === "LOTTERY") {
      gachas.set(index, new Gacha(index, parseInt(match.groups.item0), name));
    }
    const enabled = !!parseInt(match.groups.enabled);
    const price_type = match.groups.price_type === "MINT" ? "ap" : match.groups.price_type === "GOLD" ? "gold" : "none";
    const price = parseInt(match.groups.price);
    const parcel_from_shop = !!parseInt(match.groups.parcel_from_shop);
    const itemIDs = [parseInt(match.groups.item0), parseInt(match.groups.item1), parseInt(match.groups.item2), parseInt(match.groups.item3), parseInt(match.groups.item4), parseInt(match.groups.item5), parseInt(match.groups.item6), parseInt(match.groups.item7), parseInt(match.groups.item8), parseInt(match.groups.item9)];
    const inner_items = itemIDs.filter(id => !!id && items.get(id)).map(id => items.get(id));
    if (category === "PARTS") {
      if (inner_items.length === 1) {
        shop_items.set(index, inner_items[0]);
      } else {
        const item = new Item();
        item.name_en = match.groups.name_en || match.groups.name;
        shop_items.set(index, item);
      }
      if (enabled) {
        const itemSource = new ShopItemSource(index, price, price_type === "ap", inner_items);
        for (const item of inner_items) {
          item.sources.push(itemSource);
        }
      }
    } else if (category === "LOTTERY") {
      const gachaItem = new Item();
      gachaItem.name_en = match.groups.name_en || match.groups.name;
      shop_items.set(index, gachaItem);
      if (enabled) {
        gachaItem.sources.push(new ShopItemSource(index, price, price_type === "ap", inner_items));
      }
    } else {
      const otherItem = new Item();
      otherItem.name_en = match.groups.name_en || match.groups.name;
      shop_items.set(index, otherItem);
    }
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
function parseApiShopData(data) {
  for (const apiItem of JSON.parse(data)) {
    if (!isApiItem(apiItem)) {
      console.error(`Incorrect format of item: ${data}`);
      continue;
    }
    const inner_items = [apiItem.item0, apiItem.item1, apiItem.item2, apiItem.item3, apiItem.item4, apiItem.item5, apiItem.item6, apiItem.item7, apiItem.item8, apiItem.item9].filter(id => !!id && items.get(id)).map(id => items.get(id));
    if (apiItem.category === "PARTS") {
      if (inner_items.length === 1) {
        shop_items.set(apiItem.productIndex, inner_items[0]);
      } else {
        const item = new Item();
        item.name_en = apiItem.name;
        shop_items.set(apiItem.productIndex, item);
      }
      if (apiItem.enabled) {
        const itemSource = new ShopItemSource(apiItem.productIndex, apiItem.price0, apiItem.priceType === "MINT", inner_items);
        for (const item of inner_items) {
          item.sources.push(itemSource);
        }
      }
    } else if (apiItem.category === "LOTTERY") {
      gachas.set(apiItem.productIndex, new Gacha(apiItem.productIndex, apiItem.item0, apiItem.name));
      const gachaItem = new Item();
      gachaItem.name_en = apiItem.name;
      shop_items.set(apiItem.productIndex, gachaItem);
      if (apiItem.enabled) {
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
async function download(url) {
  const filename = url.slice(url.lastIndexOf("/") + 1);
  const element = document.getElementById("loading");
  if (element instanceof HTMLElement) {
    element.textContent = `Loading ${filename}, please wait...`;
  }
  const reply = await fetch(url);
  const progressbar = document.getElementById("progressbar");
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value++;
  }
  if (!reply.ok) {
    throw new Error(`Failed downloading ${url}: ${reply.status}${reply.statusText ? ` ${reply.statusText}` : ""}`);
  }
  return reply.text();
}
async function downloadItems() {
  const progressbar = document.getElementById("progressbar");
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value = 0;
    progressbar.max = 123;
  }
  const itemSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/auth-server/src/main/resources/res";
  const gachaSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/game-server/src/main/resources/res/lottery";
  const guardianSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/server-core/src/main/resources/res";
  const itemURL = itemSource + "/Item_Parts_Ini3.xml";
  const itemData = download(itemURL);
  const itemArtData = download("/assets/item-art-map.json");
  //const shopURL = itemSource + "/Shop_Ini3.xml";
  const max_shop_pages = 20; //currently need only 10, should be enough
  const shopURL = "/api/shop?size=1000&page=";
  const shopDatas = [...Array(max_shop_pages).keys()].map(n => download(`${shopURL}${n}`));
  const guardianURL = guardianSource + "/GuardianStages.json";
  const guardianData = download(guardianURL);
  parseItemData(await itemData);
  itemArtMap = JSON.parse(await itemArtData);
  //parseShopData(await shopData);
  await Promise.all(shopDatas.map(p => p.then(data => parseApiShopData(data))));
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value = 0;
    progressbar.max = gachas.size + 3;
  }
  const gacha_items = [];
  for (const [, gacha] of gachas) {
    const gacha_url = `${gachaSource}/Ini3_Lot_${`${gacha.gacha_index}`.padStart(2, "0")}.xml`;
    gacha_items.push([download(gacha_url), gacha, gacha_url]);
  }
  parseGuardianData(await guardianData);
  for (const [item, gacha, gacha_url] of gacha_items) {
    try {
      parseGachaData(await item, gacha);
    } catch (e) {
      console.warn(`Failed downloading ${gacha_url} because ${e}`);
    }
  }
}
function deletableItem(item, character) {
  return (0, _html.createHTML)(["div", {
    class: "item-identity"
  }, (0, _html.createHTML)(["button", {
    class: "item_removal",
    "data-item_index": `${item.id}`,
    "aria-label": `Exclude ${item.name_en} from results`,
    type: "button"
  }, "Exclude"]), createItemDetailsTrigger(item, character)]);
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
function createChancePopup(tries) {
  function probabilityAfterNTries(probability, tries) {
    return 1 - Math.pow(1 - probability, tries);
  }
  const content = (0, _html.createHTML)(["table", ["tr", ["th", "Number of gachas"], ["th", "Chance for item"]]]);
  for (const factor of [0.1, 0.5, 1, 2, 5, 10]) {
    const gachas = Math.round(tries * factor);
    if (gachas === 0) {
      continue;
    }
    content.appendChild((0, _html.createHTML)(["tr", ["td", {
      class: "numeric"
    }, `${gachas}`], ["td", {
      class: "numeric"
    }, `${(probabilityAfterNTries(1 / tries, gachas) * 100).toFixed(4)}%`]]));
  }
  content.appendChild((0, _html.createHTML)(["tr"]));
  return createPopupLink(`${prettyNumber(tries, 2)}`, content);
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
function createGachaSourcePopup(item, itemSource, character) {
  const content = character ? (0, _html.createHTML)(["table", ["tr", ["th", "Item"], ["th", "Chance"], ["th", "Expected pulls"]]]) : (0, _html.createHTML)(["table", ["tr", ["th", "Item"], ["th", "Character"], ["th", "Chance"], ["th", "Expected pulls"]]]);
  const gacha = gachas.get(itemSource.shop_id);
  if (!gacha) {
    throw "Internal error";
  }
  const gacha_items = new Map();
  for (const char of character === undefined ? characters : [character]) {
    const char_items = gacha.shop_items.get(char);
    if (!char_items) {
      continue;
    }
    for (const [char_gacha_item, [tickets, quantity_min, quantity_max]] of char_items) {
      const item_character = char_gacha_item.character || character;
      const item_tickets = item_character ? gacha.character_probability.get(item_character) : gacha.total_probability;
      const probability = tickets / item_tickets;
      const previous_probability = gacha_items.get(char_gacha_item)?.[0] || 0;
      gacha_items.set(char_gacha_item, [previous_probability + probability, quantity_min, quantity_max]);
    }
  }
  for (const [char_gacha_item, [probability, quantity_min, quantity_max]] of gacha_items) {
    if (character) {
      content.appendChild((0, _html.createHTML)(["tr", item === char_gacha_item ? {
        class: "highlighted"
      } : "", ["td", char_gacha_item.name_en, quantityString(quantity_min, quantity_max)], ["td", {
        class: "numeric"
      }, `${prettyNumber(probability * 100, 2)}%`], ["td", {
        class: "numeric"
      }, `${prettyNumber(1 / probability, 2)}`]]));
    } else {
      content.appendChild((0, _html.createHTML)(["tr", item === char_gacha_item ? {
        class: "highlighted"
      } : "", ["td", char_gacha_item.name_en, quantityString(quantity_min, quantity_max)], ["td", char_gacha_item.character || "*"], ["td", {
        class: "numeric"
      }, `${prettyNumber(probability * 100, 2)}%`], ["td", {
        class: "numeric"
      }, `${prettyNumber(1 / probability, 2)}`]]));
    }
  }
  return createPopupLink(itemSource.item.name_en, [(0, _html.createHTML)(["a", gacha.name]), content]);
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
  const content = [`Guardian map ${itemSource.guardian_map}`, (0, _html.createHTML)(["ul", {
    class: "layout"
  }, ["li", "Items:", ["ul", {
    class: "layout"
  }, ...itemSource.items.reduce((curr, reward_item) => [...curr, (0, _html.createHTML)(["li", {
    class: reward_item === item ? "highlighted" : ""
  }, reward_item.name_en])], [])]], ["li", `Requires boss: ${itemSource.need_boss ? "Yes" : "No"}`], ...(itemSource.boss_time > 0 ? [(0, _html.createHTML)(["li", `Boss time: ${prettyTime(itemSource.boss_time)}`])] : []), ["li", `EXP multiplier: ${itemSource.xp}`]])];
  return createPopupLink(itemSource.guardian_map, content);
}
function itemSourcesToElementArray(item, sourceFilter, character) {
  return [...item.sources.values()].filter(sourceFilter).map(itemSource => sourceItemElement(item, itemSource, sourceFilter, character));
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
  let first = true;
  for (const elements of list) {
    if (elements.length === 0) {
      add(" ");
      continue;
    }
    if (!first) {
      add(", ");
    } else {
      first = false;
    }
    for (const element of elements) {
      if (element === "") {
        continue;
      }
      add(element);
    }
  }
  return result;
}
function formatPlayerNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value);
}
function createCurrencyChip(currency) {
  return (0, _html.createHTML)(["span", {
    class: `gacha-currency gacha-currency--${currency.toLowerCase()}`,
    "data-currency": currency
  }, currency]);
}
function createGachaSourceSummary(item, itemSource, sourceFilter, character) {
  const gacha = gachas.get(itemSource.shop_id);
  if (!gacha) {
    throw "Internal error";
  }
  const art = itemArtMap.lotteries[`${gacha.gacha_index}`];
  const expectedPulls = itemSource.gachaTries(item, character);
  const directSource = itemSource.item.sources.find(source => source instanceof ShopItemSource);
  const economics = projectGachaEconomics(expectedPulls, directSource);
  const alternativeSources = itemSourcesToElementArray(itemSource.item, source => source !== directSource && sourceFilter(source), itemSource.requiresGuardian ? undefined : character);
  const alternativeList = makeSourcesList(alternativeSources);
  const purchase = economics.availability === "direct" ? (0, _html.createHTML)(["div", {
    class: "gacha-purchase"
  }, createCurrencyChip(economics.currency), ["span", `${formatPlayerNumber(economics.pricePerPull)} per pull`], ["span", {
    class: "gacha-expected-spend"
  }, `Expected spend ~${formatPlayerNumber(economics.expectedSpend)} ${economics.currency}`]]) : (0, _html.createHTML)(["span", {
    class: "gacha-purchase gacha-purchase--unavailable"
  }, "Not directly purchasable"]);
  return (0, _html.createHTML)(["div", {
    class: "gacha-source-summary",
    role: "group",
    "aria-label": `${gacha.name} acquisition`
  }, createGachaCoinArt(gacha), ["div", {
    class: "gacha-source-summary__content"
  }, ["div", {
    class: "gacha-identity"
  }, createGachaSourcePopup(item, itemSource, itemSource.requiresGuardian ? undefined : character), ["span", {
    class: "gacha-coin-color"
  }, art ? `${art.color} ${art.shape}` : "Coin color unavailable"]], ["div", {
    class: "gacha-metrics"
  }, ["dl", {
    class: "gacha-economics"
  }, ["div", ["dt", "Chance"], ["dd", `${formatPlayerNumber(economics.chancePercent)}%`]], ["div", ["dt", "Expected pulls"], ["dd", `~${formatPlayerNumber(economics.expectedPulls)}`]]], purchase], ...(alternativeList.length > 0 ? [(0, _html.createHTML)(["div", {
    class: "gacha-alternatives"
  }, ["span", {
    class: "gacha-alternatives__label"
  }, "Alternative"], ...alternativeList])] : [])]]);
}
function sourceItemElement(item, itemSource, sourceFilter, character) {
  if (itemSource instanceof GachaItemSource) {
    return [createGachaSourceSummary(item, itemSource, sourceFilter, character)];
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
  return createSpriteArt(art.sheet, art.cell, `${art.color} ${art.shape} for ${gacha.name}`, "gacha-coin-art") ?? fallback();
}
function itemToTableRow(item, sourceFilter, priorityStats, character) {
  const row = (0, _html.createHTML)(["tr", ["td", {
    class: "Name_column"
  }, deletableItem(item, character)], ["td", {
    class: "Art_column"
  }, createItemArt(item)], ["td", {
    class: "Character_column"
  }, item.character ?? "All"], ["td", {
    class: "Part_column"
  }, item.part], ...priorityStats.map(stat => (0, _html.createHTML)(["td", {
    class: "numeric"
  }, stat.split("+").map(s => item.statFromString(s)).join("+")])), ["td", {
    class: "Level_column numeric"
  }, `${item.level}`], ["td", {
    class: "Source_column"
  }, ...makeSourcesList(itemSourcesToElementArray(item, sourceFilter, character))]]);
  return row;
}
function getGachaTable(filter, char) {
  const table = (0, _html.createHTML)(["table", ["tr", ["th", {
    class: "Name_column"
  }, "Name"]]]);
  for (const [, gacha] of gachas) {
    const gachaItem = shop_items.get(gacha.shop_index);
    if (!gachaItem) {
      throw "Internal error";
    }
    if (filter(gachaItem)) {
      table.appendChild((0, _html.createHTML)(["tr", ["td", createGachaSourcePopup(undefined, new ItemSource(gacha.shop_index), char)]]));
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
  const table = (0, _html.createHTML)(["table", ["caption", "Best matching equipment by slot and selected stat priority"], ["thead", ["tr", ["th", {
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
  }, "Part"], ...priorityStats.map(stat => (0, _html.createHTML)(["th", {
    class: "numeric",
    scope: "col"
  }, stat])), ["th", {
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
    return [cost1.ap, cost1.gold] < [cost1.ap, cost1.gold] ? {
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
    return [...item.sources.values()].filter(sourceFilter).reduce((curr, itemSource) => {
      const cost = (() => {
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
      })();
      return minCost(curr, cost);
    }, {
      gold: 0,
      ap: 0,
      maps: {}
    });
  }
  const statistics = {
    characters: new Set(),
    ...priorityStats.reduce((curr, stat) => ({
      ...curr,
      [stat]: 0
    }), {}),
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
      //@ts-ignore
      if (typeof statistics[stat] !== "number") {
        continue;
      }
      const value = stat.split("+").reduce((curr, statName) => curr + result[0].statFromString(statName), 0);
      //@ts-ignore
      statistics[stat] += value;
    }
    statistics.Level = Math.max(result[0].level, statistics.Level);
    for (const item of result) {
      for (const char of item.character ? [item.character] : characters) {
        statistics.characters.add(char);
        tableBody.appendChild(itemToTableRow(item, sourceFilter, priorityStats, char));
      }
      statistics.cost = combineCosts(costOf(item, character && isCharacter(character) ? character : undefined), statistics.cost);
    }
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
    },
    //@ts-ignore
    `${statistics[stat]}`])), ["td", {
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
    //@ts-ignore
    if (statistics[attribute] === 0) {
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

},{"./html":2}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isItemSelector = isItemSelector;
exports.itemSelectors = void 0;
var _checkboxTree = require("./checkboxTree");
var _itemLookup = require("./itemLookup");
var _html = require("./html");
var _priority = require("./priority");
var _storage = require("./storage");
const partsFilter = ["Parts", ["Head", ["+Hat", "+Hair", "Dye"], "+Upper", "+Lower", "Legs", ["+Shoes", "Socks"], "Aux", ["+Hand", "+Backpack", "+Face"], "+Racket"]];
const availabilityFilter = ["Availability", ["Shop", ["+Gold", "+AP"], "+Allow gacha", "+Guardian", "+Untradable", "Unavailable items"]];
const excluded_item_ids = new Set();
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
function applyDragDrop() {
  document.addEventListener("dragstart", ({
    target
  }) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    dragged = target;
  });
  document.addEventListener("dragover", event => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    if (event.target.className === "dropzone") {
      const targetRect = event.target.getBoundingClientRect();
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
          event.target.before(dragSeparatorLine);
          break;
        case Position.below:
          if (dragHighlightedElement) {
            dragHighlightedElement.classList.remove("drophover");
            dragHighlightedElement = undefined;
          }
          dragSeparatorLine.hidden = false;
          event.target.after(dragSeparatorLine);
          break;
        case Position.on:
          dragSeparatorLine.hidden = true;
          if (dragHighlightedElement) {
            dragHighlightedElement.classList.remove("drophover");
          }
          if (dragged === event.target) {
            break;
          }
          dragHighlightedElement = event.target;
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
      updateResults();
      return;
    }
    dragSeparatorLine.hidden = true;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (dragHighlightedElement) {
      dragHighlightedElement.classList.remove("drophover");
      const dropTarget = dragHighlightedElement;
      dragHighlightedElement = undefined;
      if (!(dropTarget instanceof HTMLLIElement)) {
        return;
      }
      dropTarget.textContent += `+${dragged.textContent}`;
      dragged.remove();
    }
    if (target === dragged) {
      const stats = dragged.textContent.split("+");
      dragged.textContent = stats.shift();
      dragged.after(...stats.map(stat => (0, _html.createHTML)(["li", {
        class: "dropzone",
        draggable: "true"
      }, stat])));
    }
    updateResults();
  });
}
applyDragDrop();
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
const itemSelectors = exports.itemSelectors = ["partsSelector", "gachaSelector", "otherItemsSelector"];
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
  const otherItemsSelector = document.getElementById("otherItemsSelector");
  if (!(otherItemsSelector instanceof HTMLInputElement)) {
    throw "Internal error";
  }
  if (otherItemsSelector.checked) {
    return "otherItemsSelector";
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
  const excluded_ids = _storage.Variable_storage.get_variable("excluded_item_ids");
  if (typeof excluded_ids === "string") {
    for (const id of excluded_ids.split(",")) {
      excluded_item_ids.add(parseInt(id));
    }
  }
  excluded_item_ids.delete(NaN);
  //must be last because it triggers a store
  levelrange.dispatchEvent(new Event("input"));
}
function updateResults() {
  saveSelection();
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
      case 'otherItemsSelector':
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
      case 'otherItemsSelector':
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
    for (const id of excluded_item_ids) {
      const item = _itemLookup.items.get(id);
      if (!item) {
        continue;
      }
      itemFilterList.appendChild((0, _html.createHTML)(["div", item.name_en, (0, _html.createHTML)(["button", {
        class: "item_removal_removal",
        "data-item_index": `${id}`,
        "aria-label": `Remove ${item.name_en} from exclusions`,
        type: "button"
      }, "Remove"])]));
    }
  }
  const comparators = [];
  const priorityList = document.getElementById("priority_list");
  if (!(priorityList instanceof HTMLOListElement)) {
    throw "Internal error";
  }
  const priorityStats = Array.from(priorityList.childNodes).filter(node => !node.textContent?.includes('\n')).filter(node => node.textContent).map(node => node.textContent);
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
      case 'otherItemsSelector':
        return (0, _html.createHTML)(["table", ["tr", ["th", "TODO: Other items"]]]);
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
    const priorityStatNodes = Array.from(priorityList.childNodes).filter(node => !node.textContent?.includes('\n')).filter(node => node.textContent);
    for (const node of priorityStatNodes) {
      const regex = enchantToggle.checked ? /^((?:Str)|(?:Sta)|(?:Dex)|(?:Will))$/ : /^Max ((?:Str)|(?:Sta)|(?:Dex)|(?:Will))$/;
      const replacer = enchantToggle.checked ? "Max $1" : "$1";
      node.textContent = node.textContent.split("+").map(s => s.replace(regex, replacer)).join("+");
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
  const otherItemsSelector = document.getElementById("otherItemsSelector");
  if (!(otherItemsSelector instanceof HTMLInputElement)) {
    return;
  }
  otherItemsSelector.addEventListener("change", () => {
    priority_group.classList.add("disabled");
    partsFilter.classList.add("disabled");
    updateResults();
  });
}
window.addEventListener("load", async () => {
  const resultsGroup = document.getElementById("results_group");
  const resultsStatus = document.getElementById("resultsStatus");
  const loadingLabel = document.getElementById("loading");
  const loadingCopy = document.querySelector(".loading-state__copy span");
  if (!(resultsStatus instanceof HTMLElement) || !(loadingLabel instanceof HTMLLabelElement) || !(loadingCopy instanceof HTMLElement)) {
    throw "Internal error";
  }
  resultsGroup?.setAttribute("aria-busy", "true");
  setItemTypeSelectorFunctionality();
  restoreSelection();
  try {
    await (0, _itemLookup.downloadItems)();
  } catch {
    resultsStatus.textContent = "Item data unavailable";
    loadingLabel.textContent = "Could not load equipment data";
    loadingCopy.textContent = "Check the preview server connection, then reload this page.";
    resultsGroup?.setAttribute("aria-busy", "false");
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
  levelrange.dispatchEvent(new Event("input"));
  updateResults();
  resultsGroup?.setAttribute("aria-busy", "false");
  const sort_help = document.getElementById("priority_legend");
  if (sort_help instanceof HTMLLegendElement) {
    sort_help.appendChild((0, _itemLookup.createPopupLink)(" (?)", (0, _html.createHTML)(["p", "Reorder the stats to your liking to affect the results list.", ["br"], "Drag a stat up or down to change its importance (for example drag Lob above Charge).", ["br"], "Drag a stat onto another to combine them (for example Str onto Dex, the results will display Str+Dex).", ["br"], "Drag a combined stat onto itself to separate them."])));
  }
});
document.body.addEventListener('click', event => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  if (event.target.className === "item_removal") {
    if (!event.target.dataset.item_index) {
      return;
    }
    excluded_item_ids.add(parseInt(event.target.dataset.item_index));
    updateResults();
  } else if (event.target.className === "item_removal_removal") {
    if (!event.target.dataset.item_index) {
      return;
    }
    excluded_item_ids.delete(parseInt(event.target.dataset.item_index));
    updateResults();
  }
});

},{"./checkboxTree":1,"./html":2,"./itemLookup":3,"./priority":5,"./storage":6}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectByPriority = selectByPriority;
function selectByPriority(current, candidate, comparators) {
  if (current.length === 0) {
    return [candidate];
  }
  for (const comparator of comparators) {
    const result = comparator(current[0], candidate);
    if (result < 0) {
      return [candidate];
    }
    if (result > 0) {
      return current;
    }
  }
  return [...current, candidate];
}

},{}],6:[function(require,module,exports){
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

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJodG1sLnRzIiwiaXRlbUxvb2t1cC50cyIsIm1haW4udHMiLCJwcmlvcml0eS50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWE7RUFDekMsSUFBSSxFQUFFLFNBQVMsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzFDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO0lBQzNFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDOUM7SUFDSjtJQUNBLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDtJQUNKO0lBQ0EsT0FBTyxLQUFLLENBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUNwQyxNQUFNLENBQUUsQ0FBQyxJQUF5QixDQUFDLFlBQVksYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksZ0JBQWdCLENBQUMsQ0FDMUcsR0FBRyxDQUFDLENBQUMsSUFB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Q1QsS0FBSyxHQUFHLENBQUM7RUFDVCxLQUFLLEdBQUcsQ0FBQztFQUNULEtBQUssR0FBRyxDQUFDO0VBQ1QsS0FBSyxHQUFHLENBQUM7RUFDVCxLQUFLLEdBQUcsQ0FBQztFQUNULEtBQUssR0FBRyxDQUFDOztBQUdiLFNBQVMsU0FBUyxDQUFDLEdBQVE7RUFDdkIsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtJQUN6QyxPQUFPLEtBQUs7RUFDaEI7RUFDQSxPQUFPLENBQ0gsT0FBTyxHQUFHLENBQUMsWUFBWSxLQUFLLFFBQVEsRUFDcEMsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFDL0IsT0FBTyxHQUFHLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFDbkMsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFDaEMsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFDL0IsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDOUIsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDOUIsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDOUIsT0FBTyxHQUFHLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFDbkMsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFDaEMsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMs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QUFDLEdBQUcsYUFBYSxFQUFFLENBQUM7RUFDL0M7RUFDQSxPQUFPLFNBQVMsQ0FBQTtJQUNaLFlBQVksQ0FBQyxLQUFLLEVBQUU7RUFDeEI7RUFDQSxXQUFXLFNBQVMsQ0FBQTtJQUNoQixJQUFJLE1BQU0sR0FBOEMsRUFBRTtJQUMxRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMxQyxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztNQUMvQixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUN6QjtNQUNKO01BQ0EsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDdkMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0I7TUFDSjtNQUNBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQjtNQUNKO01BQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQztJQUMzQztJQUNBLE9BQU8sTUFBTTtFQUNqQjs7QUFDSCxPQUFBLENBQUEsZ0JBQUEsR0FBQSxnQkFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgdHlwZSBUcmVlTm9kZSA9IHN0cmluZyB8IFRyZWVOb2RlW107XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50W10ge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgZm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBwYXJlbnRfdWwuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcbiAgICAgICAgaWYgKHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4XSAhPT0gcGFyZW50X2xpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3RlbnRpYWxTaWJsaW5nRW50cnkgPSBwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleCArIDFdPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocG90ZW50aWFsU2libGluZ0VudHJ5IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheVxuICAgICAgICAgICAgLmZyb20ocG90ZW50aWFsU2libGluZ0VudHJ5LmNoaWxkcmVuKVxuICAgICAgICAgICAgLmZpbHRlcigoZSk6IGUgaXMgSFRNTExJRWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudClcbiAgICAgICAgICAgIC5tYXAoZSA9PiBlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4obm9kZSkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQgIT09IG5vZGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hpbGQuY2hlY2tlZCA9IG5vZGUuY2hlY2tlZDtcbiAgICAgICAgICAgIGNoaWxkLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnQobm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnQgfCB2b2lkIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYW5kaWRhdGU6IEhUTUxMSUVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBwYXJlbnRfdWwuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBjaGlsZC5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZSA9IGNoaWxkO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkID09PSBwYXJlbnRfbGkgJiYgY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFuY2VzdG9ycyhub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgY29uc3QgcGFyZW50ID0gZ2V0UGFyZW50KG5vZGUpO1xuICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGZvdW5kQ2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZFVuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZEluZGV0ZXJtaW5hdGUgPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4ocGFyZW50KSkge1xuICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCkge1xuICAgICAgICAgICAgZm91bmRDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvdW5kVW5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGQuaW5kZXRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgZm91bmRJbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJbmRldGVybWluYXRlIHx8IGZvdW5kQ2hlY2tlZCAmJiBmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kQ2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kVW5jaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIHVwZGF0ZUFuY2VzdG9ycyhwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrTGlzdGVuZXIobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyh0YXJnZXQpO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnModGFyZ2V0KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVycyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBhcHBseUNoZWNrTGlzdGVuZXIoZWxlbWVudC5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVycyhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZU5vZGUodHJlZU5vZGU6IFRyZWVOb2RlKTogSFRNTExJRWxlbWVudCB7XG4gICAgaWYgKHR5cGVvZiB0cmVlTm9kZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIi1cIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIitcIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBjaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cmVlTm9kZS5yZXBsYWNlQWxsKFwiIFwiLCBcIl9cIiksXG4gICAgICAgICAgICAgICAgICAgIC4uLihjaGVja2VkICYmIHsgY2hlY2tlZDogXCJjaGVja2VkXCIgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwibGFiZWxcIixcbiAgICAgICAgICAgICAgICB7IGZvcjogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpIH0sXG4gICAgICAgICAgICAgICAgdHJlZU5vZGVcbiAgICAgICAgICAgIF1cbiAgICAgICAgXSk7XG4gICAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsaXN0ID0gY3JlYXRlSFRNTChbXCJ1bFwiLCB7IGNsYXNzOiBcImNoZWNrYm94XCIgfV0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVOb2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdHJlZU5vZGVbaV07XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKG1ha2VDaGVja2JveFRyZWVOb2RlKG5vZGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJsaVwiLCBsaXN0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZSh0cmVlTm9kZTogVHJlZU5vZGUpIHtcbiAgICBsZXQgcm9vdCA9IG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlKS5jaGlsZHJlblswXTtcbiAgICBpZiAoIShyb290IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBhcHBseUNoZWNrTGlzdGVuZXJzKHJvb3QpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMocm9vdCkpIHtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKGxlYWYpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gZ2V0TGVhdmVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBsZXQgcmVzdWx0OiBIVE1MSW5wdXRFbGVtZW50W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChnZXRDaGlsZHJlbihpbnB1dCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChnZXRMZWF2ZXMoaW5wdXQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV0gPSBsZWFmLmNoZWNrZWQ7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRMZWFmU3RhdGVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQsIHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0pIHtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RhdGVzW2xlYWYuaWQucmVwbGFjZUFsbChcIl9cIiwgXCIgXCIpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGVhZi5jaGVja2VkID0gc3RhdGU7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG59XG4iLCJ0eXBlIFRhZ19uYW1lID0ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xudHlwZSBBdHRyaWJ1dGVzID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbnR5cGUgSFRNTF9ub2RlPFQgZXh0ZW5kcyBUYWdfbmFtZT4gPSBbVCwgLi4uKEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IEF0dHJpYnV0ZXMpW11dO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSFRNTDxUIGV4dGVuZHMgVGFnX25hbWU+KG5vZGU6IEhUTUxfbm9kZTxUPik6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZVswXSk7XG4gICAgZnVuY3Rpb24gaGFuZGxlKHBhcmFtZXRlcjogQXR0cmlidXRlcyB8IEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlciA9PT0gXCJzdHJpbmdcIiB8fCBwYXJhbWV0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQocGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBhcmFtZXRlcikpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNyZWF0ZUhUTUwocGFyYW1ldGVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHBhcmFtZXRlcltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFuZGxlKG5vZGVbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVycyA9IFtcIk5pa2lcIiwgXCJMdW5MdW5cIiwgXCJMdWN5XCIsIFwiU2h1YVwiLCBcIkRoYW5waXJcIiwgXCJQb2NoaVwiLCBcIkFsXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0gdHlwZW9mIGNoYXJhY3RlcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoYXJhY3RlcihjaGFyYWN0ZXI6IHN0cmluZyk6IGNoYXJhY3RlciBpcyBDaGFyYWN0ZXIge1xuICAgIHJldHVybiAoY2hhcmFjdGVycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhjaGFyYWN0ZXIpO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gXCJIYXRcIiB8IFwiSGFpclwiIHwgXCJEeWVcIiB8IFwiVXBwZXJcIiB8IFwiTG93ZXJcIiB8IFwiU2hvZXNcIiB8IFwiU29ja3NcIiB8IFwiSGFuZFwiIHwgXCJCYWNrcGFja1wiIHwgXCJGYWNlXCIgfCBcIlJhY2tldFwiIHwgXCJPdGhlclwiO1xuXG5leHBvcnQgY2xhc3MgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pZDogbnVtYmVyKSB7IH1cblxuICAgIGdldCByZXF1aXJlc0d1YXJkaWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi50aGlzLml0ZW0uc291cmNlcy52YWx1ZXMoKV0uZXZlcnkoc291cmNlID0+IHNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgZmluZGluZyBpdGVtIG9mIGl0ZW1Tb3VyY2UgJHt0aGlzLnNob3BfaWR9YCk7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2hvcEl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIsIHJlYWRvbmx5IHByaWNlOiBudW1iZXIsIHJlYWRvbmx5IGFwOiBib29sZWFuLCByZWFkb25seSBpdGVtczogSXRlbVtdKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG5cbiAgICBnYWNoYVRyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFnYWNoYSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnYWNoYS5hdmVyYWdlX3RyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBHYWNoYUVjb25vbWljcyA9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiO1xuICAgICAgICBjaGFuY2VQZXJjZW50OiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICB9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBjdXJyZW5jeTogXCJBUFwiIHwgXCJHb2xkXCI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogbnVtYmVyO1xuICAgICAgICBwcmljZVBlclB1bGw6IG51bWJlcjtcbiAgICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhRWNvbm9taWNzKFxuICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcixcbiAgICBzb3VyY2U/OiB7IHByaWNlOiBudW1iZXI7IGFwOiBib29sZWFuIH0sXG4pOiBHYWNoYUVjb25vbWljcyB7XG4gICAgY29uc3QgY2hhbmNlUGVyY2VudCA9IGV4cGVjdGVkUHVsbHMgPiAwID8gMTAwIC8gZXhwZWN0ZWRQdWxscyA6IDA7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgICAgIGV4cGVjdGVkUHVsbHMsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIixcbiAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgY3VycmVuY3k6IHNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiLFxuICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICBleHBlY3RlZFNwZW5kOiBleHBlY3RlZFB1bGxzICogc291cmNlLnByaWNlLFxuICAgICAgICBwcmljZVBlclB1bGw6IHNvdXJjZS5wcmljZSxcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgR3VhcmRpYW5JdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IGd1YXJkaWFuX21hcDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBpdGVtczogSXRlbVtdLFxuICAgICAgICByZWFkb25seSB4cDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuZWVkX2Jvc3M6IGJvb2xlYW4sXG4gICAgICAgIHJlYWRvbmx5IGJvc3NfdGltZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKEd1YXJkaWFuSXRlbVNvdXJjZS5ndWFyZGlhbl9tYXBfaWQoZ3VhcmRpYW5fbWFwKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGd1YXJkaWFuX21hcF9pZChtYXA6IHN0cmluZykge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMuaW5kZXhPZihtYXApO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmd1YXJkaWFuX21hcHMucHVzaChtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtaW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3VhcmRpYW5fbWFwcyA9IFtcIlwiXTtcbn1cblxuZXhwb3J0IGNsYXNzIEl0ZW0ge1xuICAgIGlkID0gMDtcbiAgICBuYW1lX2tyID0gXCJcIjtcbiAgICBuYW1lX2VuID0gXCJcIjtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICBtYXhVc2UgPSAwO1xuICAgIGhpZGRlbiA9IGZhbHNlO1xuICAgIHJlc2lzdCA9IFwiXCI7XG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyO1xuICAgIHBhcnQ6IFBhcnQgPSBcIk90aGVyXCI7XG4gICAgbGV2ZWwgPSAwO1xuICAgIHN0ciA9IDA7XG4gICAgc3RhID0gMDtcbiAgICBkZXggPSAwO1xuICAgIHdpbCA9IDA7XG4gICAgaHAgPSAwO1xuICAgIHF1aWNrc2xvdHMgPSAwO1xuICAgIGJ1ZmZzbG90cyA9IDA7XG4gICAgc21hc2ggPSAwO1xuICAgIG1vdmVtZW50ID0gMDtcbiAgICBjaGFyZ2UgPSAwO1xuICAgIGxvYiA9IDA7XG4gICAgc2VydmUgPSAwO1xuICAgIG1heF9zdHIgPSAwO1xuICAgIG1heF9zdGEgPSAwO1xuICAgIG1heF9kZXggPSAwO1xuICAgIG1heF93aWwgPSAwO1xuICAgIGVsZW1lbnRfZW5jaGFudGFibGUgPSBmYWxzZTtcbiAgICBwYXJjZWxfZW5hYmxlZCA9IGZhbHNlO1xuICAgIHBhcmNlbF9mcm9tX3Nob3AgPSBmYWxzZTtcbiAgICBzcGluID0gMDtcbiAgICBhdHNzID0gMDtcbiAgICBkZnNzID0gMDtcbiAgICBzb2NrZXQgPSAwO1xuICAgIGdhdWdlID0gMDtcbiAgICBnYXVnZV9iYXR0bGUgPSAwO1xuICAgIHNvdXJjZXM6IEl0ZW1Tb3VyY2VbXSA9IFtdO1xuICAgIHN0YXRGcm9tU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSBcIk1vdiBTcGVlZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVtZW50O1xuICAgICAgICAgICAgY2FzZSBcIkNoYXJnZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJnZTtcbiAgICAgICAgICAgIGNhc2UgXCJMb2JcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2I7XG4gICAgICAgICAgICBjYXNlIFwiU21hc2hcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zbWFzaDtcbiAgICAgICAgICAgIGNhc2UgXCJTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdHI7XG4gICAgICAgICAgICBjYXNlIFwiRGV4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV4O1xuICAgICAgICAgICAgY2FzZSBcIlN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YTtcbiAgICAgICAgICAgIGNhc2UgXCJXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lsO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RyO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfZGV4O1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdGFcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RhO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X3dpbDtcbiAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZlO1xuICAgICAgICAgICAgY2FzZSBcIlF1aWNrc2xvdHNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5xdWlja3Nsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkJ1ZmZzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1ZmZzbG90cztcbiAgICAgICAgICAgIGNhc2UgXCJIUFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhwO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEdhY2hhIHtcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBzaG9wX2luZGV4OiBudW1iZXIsIHJlYWRvbmx5IGdhY2hhX2luZGV4OiBudW1iZXIsIHJlYWRvbmx5IG5hbWU6IHN0cmluZykge1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXJhY3RlciBvZiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnNob3BfaXRlbXMuc2V0KGNoYXJhY3RlciwgbmV3IE1hcDxJdGVtLCBbLypwcm9iYWJpbGl0eToqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWluOiovIG51bWJlciwgLypxdWFudGl0eV9tYXg6Ki8gbnVtYmVyXT4oKSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZChpdGVtOiBJdGVtLCBwcm9iYWJpbGl0eTogbnVtYmVyLCBjaGFyYWN0ZXI6IENoYXJhY3RlciwgcXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpdGVtLmNoYXJhY3RlciAmJiBpdGVtLmNoYXJhY3RlciAhPT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUuaW5mbyhgSXRlbSAke2l0ZW0uaWR9IGZyb20gZ2FjaGEgXCIke3RoaXMubmFtZX1cIiAke3RoaXMuZ2FjaGFfaW5kZXh9IGhhcyB3cm9uZyBjaGFyYWN0ZXJgKTtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGl0ZW0uY2hhcmFjdGVyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuc2V0KGl0ZW0sIFtwcm9iYWJpbGl0eSwgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdKTtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuc2V0KGNoYXJhY3RlciwgcHJvYmFiaWxpdHkgKyAodGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikgfHwgMCkpO1xuICAgIH1cblxuICAgIGF2ZXJhZ2VfdHJpZXMoaXRlbTogSXRlbSwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgY2hhcnM6IHJlYWRvbmx5IENoYXJhY3RlcltdID0gY2hhcmFjdGVyID8gKFtjaGFyYWN0ZXJdKSA6IGNoYXJhY3RlcnM7XG4gICAgICAgIGNvbnN0IHByb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyAodGhpcy5zaG9wX2l0ZW1zLmdldChjaGFyYWN0ZXIpIS5nZXQoaXRlbSk/LlswXSB8fCAwKSwgMCk7XG4gICAgICAgIGlmIChwcm9iYWJpbGl0eSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG90YWxfcHJvYmFiaWxpdHkgPSBjaGFycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpISwgMCk7XG4gICAgICAgIHJldHVybiB0b3RhbF9wcm9iYWJpbGl0eSAvIHByb2JhYmlsaXR5O1xuICAgIH1cblxuICAgIGdldCB0b3RhbF9wcm9iYWJpbGl0eSgpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJhY3RlcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgIH1cblxuICAgIGNoYXJhY3Rlcl9wcm9iYWJpbGl0eSA9IG5ldyBNYXA8Q2hhcmFjdGVyLCBudW1iZXI+KCk7XG4gICAgc2hvcF9pdGVtcyA9IG5ldyBNYXA8Q2hhcmFjdGVyLCBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+PigpO1xufVxuXG5leHBvcnQgbGV0IGl0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5leHBvcnQgbGV0IHNob3BfaXRlbXMgPSBuZXcgTWFwPG51bWJlciwgSXRlbT4oKTtcbmxldCBnYWNoYXMgPSBuZXcgTWFwPG51bWJlciwgR2FjaGE+KCk7XG5sZXQgZGlhbG9nOiBIVE1MRGlhbG9nRWxlbWVudCB8IHVuZGVmaW5lZDtcbnR5cGUgSXRlbUFydEVudHJ5ID0gW3NoZWV0OiBzdHJpbmcsIGNlbGw6IG51bWJlcl07XG50eXBlIEl0ZW1BcnRTaGVldCA9IHtcbiAgICBsaW5lQ291bnQ6IG51bWJlcjtcbiAgICBzaXplOiBudW1iZXI7XG4gICAgc3BhY2U6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xufTtcbnR5cGUgTG90dGVyeUFydEVudHJ5ID0ge1xuICAgIHNoZWV0OiBzdHJpbmc7XG4gICAgY2VsbDogbnVtYmVyO1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgc2hhcGU6IFwiY29pblwiIHwgXCJjdWJlXCIgfCBcInRva2VuXCI7XG59O1xudHlwZSBJdGVtQXJ0TWFwID0ge1xuICAgIGl0ZW1zOiBSZWNvcmQ8c3RyaW5nLCBJdGVtQXJ0RW50cnk+O1xuICAgIGxvdHRlcmllczogUmVjb3JkPHN0cmluZywgTG90dGVyeUFydEVudHJ5PjtcbiAgICBzaGVldHM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRTaGVldD47XG59O1xubGV0IGl0ZW1BcnRNYXA6IEl0ZW1BcnRNYXAgPSB7IGl0ZW1zOiB7fSwgbG90dGVyaWVzOiB7fSwgc2hlZXRzOiB7fSB9O1xuXG5mdW5jdGlvbiBwcmV0dHlOdW1iZXIobjogbnVtYmVyLCBkaWdpdHM6IG51bWJlcikge1xuICAgIGxldCBzID0gbi50b0ZpeGVkKGRpZ2l0cyk7XG4gICAgd2hpbGUgKHMuZW5kc1dpdGgoXCIwXCIpKSB7XG4gICAgICAgIHMgPSBzLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgaWYgKHMuZW5kc1dpdGgoXCIuXCIpKSB7XG4gICAgICAgIHMgPSBzLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSXRlbURhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoIDwgMTAwMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEl0ZW1zIGZpbGUgaXMgb25seSAke2RhdGEubGVuZ3RofSBieXRlcyBsb25nYCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgWywgcmVzdWx0XSBvZiBkYXRhLm1hdGNoQWxsKC9cXDxJdGVtICguKilcXC9cXD4vZykpIHtcbiAgICAgICAgY29uc3QgaXRlbTogSXRlbSA9IG5ldyBJdGVtO1xuICAgICAgICBmb3IgKGNvbnN0IFssIGF0dHJpYnV0ZSwgdmFsdWVdIG9mIHJlc3VsdC5tYXRjaEFsbCgvXFxzPyhbXj1dKik9XCIoW15cIl0qKVwiL2cpKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJJbmRleFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmlkID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiX05hbWVfXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9rciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTmFtZV9OXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbiA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiVXNlVHlwZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnVzZVR5cGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1heFVzZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heFVzZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkhpZGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5oaWRkZW4gPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlJlc2lzdFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnJlc2lzdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2hhclwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTklLSVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJOaWtpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFVOTFVOXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVQ1lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTHVjeVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNIVUFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiU2h1YVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRIQU5QSVJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiRGhhbnBpclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBPQ0hJXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlBvY2hpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQUxcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiQWxcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7dmFsdWV9XCJgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUGFydFwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFN0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJCQUdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkJhY2twYWNrXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiR0xBU1NFU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiRmFjZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhBTkRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTT0NLU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU29ja3NcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJGT09UXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJTaG9lc1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkNBUFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGF0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUEFOVFNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkxvd2VyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUkFDS0VUXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJSYWNrZXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJCT0RZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJVcHBlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhBSVJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhaXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJEWUVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkR5ZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gcGFydCAke3ZhbHVlfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMZXZlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxldmVsID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU1RSXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3RyID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3RhID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiREVYXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGV4ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiV0lMXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ud2lsID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkSFBcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5ocCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZFF1aWNrXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucXVpY2tzbG90cyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEJ1ZmZcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5idWZmc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTbWFzaFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc21hc2ggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNb3ZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tb3ZlbWVudCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJnZXNob3RTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkxvYlNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubG9iID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU2VydmVTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNlcnZlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1NUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9zdHIgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uc3RyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVEFcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RhID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfREVYXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X2RleCA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1dJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF93aWwgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0ud2lsKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuY2hhbnRFbGVtZW50XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZWxlbWVudF9lbmNoYW50YWJsZSA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRW5hYmxlUGFyY2VsXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFyY2VsX2VuYWJsZWQgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkJhbGxTcGluXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3BpbiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFUU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hdHNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiREZTU1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRmc3MgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTb2NrZXRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zb2NrZXQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJHYXVnZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdhdWdlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VCYXR0bGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZV9iYXR0bGUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBpdGVtIGF0dHJpYnV0ZSBcIiR7YXR0cmlidXRlfVwiYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXRlbXMuc2V0KGl0ZW0uaWQsIGl0ZW0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZWJ1Z1Nob3BQYXJzaW5nID0gZmFsc2U7XG4gICAgaWYgKGRhdGEubGVuZ3RoIDwgMTAwMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNob3AgZmlsZSBpcyBvbmx5ICR7ZGF0YS5sZW5ndGh9IGJ5dGVzIGxvbmdgKTtcbiAgICB9XG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IDA7XG4gICAgZm9yIChjb25zdCBtYXRjaCBvZiBkYXRhLm1hdGNoQWxsKC88UHJvZHVjdCBESVNQTEFZPVwiXFxkK1wiIEhJVF9ESVNQTEFZPVwiXFxkK1wiIEluZGV4PVwiKD88aW5kZXg+XFxkKylcIiBFbmFibGU9XCIoPzxlbmFibGVkPjB8MSlcIiBOZXc9XCJcXGQrXCIgSGl0PVwiXFxkK1wiIEZyZWU9XCJcXGQrXCIgU2FsZT1cIlxcZCtcIiBFdmVudD1cIlxcZCtcIiBDb3VwbGU9XCJcXGQrXCIgTm9idXk9XCJcXGQrXCIgUmFuZD1cIlteXCJdK1wiIFVzZVR5cGU9XCJbXlwiXStcIiBVc2UwPVwiXFxkK1wiIFVzZTE9XCJcXGQrXCIgVXNlMj1cIlxcZCtcIiBQcmljZVR5cGU9XCIoPzxwcmljZV90eXBlPig/Ok1JTlQpfCg/OkdPTEQpKVwiIE9sZFByaWNlMD1cIi0/XFxkK1wiIE9sZFByaWNlMT1cIi0/XFxkK1wiIE9sZFByaWNlMj1cIi0/XFxkK1wiIFByaWNlMD1cIig/PHByaWNlPi0/XFxkKylcIiBQcmljZTE9XCItP1xcZCtcIiBQcmljZTI9XCItP1xcZCtcIiBDb3VwbGVQcmljZT1cIi0/XFxkK1wiIENhdGVnb3J5PVwiKD88Y2F0ZWdvcnk+W15cIl0qKVwiIE5hbWU9XCIoPzxuYW1lPlteXCJdKilcIiBHb2xkQmFjaz1cIi0/XFxkK1wiIEVuYWJsZVBhcmNlbD1cIig/PHBhcmNlbF9mcm9tX3Nob3A+MHwxKVwiIENoYXI9XCItP1xcZCtcIiBJdGVtMD1cIig/PGl0ZW0wPi0/XFxkKylcIiBJdGVtMT1cIig/PGl0ZW0xPi0/XFxkKylcIiBJdGVtMj1cIig/PGl0ZW0yPi0/XFxkKylcIiBJdGVtMz1cIig/PGl0ZW0zPi0/XFxkKylcIiBJdGVtND1cIig/PGl0ZW00Pi0/XFxkKylcIiBJdGVtNT1cIig/PGl0ZW01Pi0/XFxkKylcIiBJdGVtNj1cIig/PGl0ZW02Pi0/XFxkKylcIiBJdGVtNz1cIig/PGl0ZW03Pi0/XFxkKylcIiBJdGVtOD1cIig/PGl0ZW04Pi0/XFxkKylcIiBJdGVtOT1cIig/PGl0ZW05Pi0/XFxkKylcIiA/KD86SWNvbj1cIlteXCJdKlwiID8pPyg/Ok5hbWVfa3I9XCJbXlwiXSpcIiA/KT8oPzpOYW1lX2VuPVwiKD88bmFtZV9lbj5bXlwiXSopXCIgPyk/KD86TmFtZV90aD1cIlteXCJdKlwiID8pP1xcLz4vZykpIHtcbiAgICAgICAgaWYgKCFtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQobWF0Y2guZ3JvdXBzLmluZGV4KTtcbiAgICAgICAgaWYgKGN1cnJlbnRJbmRleCArIDEgIT09IGluZGV4KSB7XG4gICAgICAgICAgICBkZWJ1Z1Nob3BQYXJzaW5nICYmIGNvbnNvbGUud2FybihgRmFpbGVkIHBhcnNpbmcgc2hvcCBpdGVtIGluZGV4ICR7Y3VycmVudEluZGV4ICsgMiA9PT0gaW5kZXggPyBjdXJyZW50SW5kZXggKyAxIDogYCR7Y3VycmVudEluZGV4ICsgMX0gdG8gJHtpbmRleCAtIDF9YH1gKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgY29uc3QgbmFtZSA9IG1hdGNoLmdyb3Vwcy5uYW1lO1xuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IG1hdGNoLmdyb3Vwcy5jYXRlZ29yeTtcbiAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBcIkxPVFRFUllcIikge1xuICAgICAgICAgICAgZ2FjaGFzLnNldChpbmRleCwgbmV3IEdhY2hhKGluZGV4LCBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTApLCBuYW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW5hYmxlZCA9ICEhcGFyc2VJbnQobWF0Y2guZ3JvdXBzLmVuYWJsZWQpO1xuICAgICAgICBjb25zdCBwcmljZV90eXBlOiBcImFwXCIgfCBcImdvbGRcIiB8IFwibm9uZVwiID0gbWF0Y2guZ3JvdXBzLnByaWNlX3R5cGUgPT09IFwiTUlOVFwiID8gXCJhcFwiIDogbWF0Y2guZ3JvdXBzLnByaWNlX3R5cGUgPT09IFwiR09MRFwiID8gXCJnb2xkXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgY29uc3QgcHJpY2UgPSBwYXJzZUludChtYXRjaC5ncm91cHMucHJpY2UpO1xuICAgICAgICBjb25zdCBwYXJjZWxfZnJvbV9zaG9wID0gISFwYXJzZUludChtYXRjaC5ncm91cHMucGFyY2VsX2Zyb21fc2hvcCk7XG4gICAgICAgIGNvbnN0IGl0ZW1JRHMgPSBbXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTApLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW0xKSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtMiksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTMpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW00KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtNSksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTYpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW03KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtOCksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTkpLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IGlubmVyX2l0ZW1zID0gaXRlbUlEcy5maWx0ZXIoaWQgPT4gISFpZCAmJiBpdGVtcy5nZXQoaWQpKS5tYXAoaWQgPT4gaXRlbXMuZ2V0KGlkKSEpO1xuXG4gICAgICAgIGlmIChjYXRlZ29yeSA9PT0gXCJQQVJUU1wiKSB7XG4gICAgICAgICAgICBpZiAoaW5uZXJfaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoaW5kZXgsIGlubmVyX2l0ZW1zWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbiA9IG1hdGNoLmdyb3Vwcy5uYW1lX2VuIHx8IG1hdGNoLmdyb3Vwcy5uYW1lO1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGluZGV4LCBpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShpbmRleCwgcHJpY2UsIHByaWNlX3R5cGUgPT09IFwiYXBcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2F0ZWdvcnkgPT09IFwiTE9UVEVSWVwiKSB7XG4gICAgICAgICAgICBjb25zdCBnYWNoYUl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgZ2FjaGFJdGVtLm5hbWVfZW4gPSBtYXRjaC5ncm91cHMubmFtZV9lbiB8fCBtYXRjaC5ncm91cHMubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGluZGV4LCBnYWNoYUl0ZW0pO1xuICAgICAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShpbmRleCwgcHJpY2UsIHByaWNlX3R5cGUgPT09IFwiYXBcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0ubmFtZV9lbiA9IG1hdGNoLmdyb3Vwcy5uYW1lX2VuIHx8IG1hdGNoLmdyb3Vwcy5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoaW5kZXgsIG90aGVySXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEFwaUl0ZW0ge1xuICAgIHByb2R1Y3RJbmRleCA9IDA7XG4gICAgZGlzcGxheSA9IDA7XG4gICAgaGl0RGlzcGxheSA9IGZhbHNlO1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICB1c2UwID0gMDtcbiAgICB1c2UxID0gMDtcbiAgICB1c2UyID0gMDtcbiAgICBwcmljZVR5cGUgPSBcIkdPTERcIjtcbiAgICBvbGRQcmljZTAgPSAwO1xuICAgIG9sZFByaWNlMSA9IDA7XG4gICAgb2xkUHJpY2UyID0gMDtcbiAgICBwcmljZTAgPSAwO1xuICAgIHByaWNlMSA9IDA7XG4gICAgcHJpY2UyID0gMDtcbiAgICBjb3VwbGVQcmljZSA9IDA7XG4gICAgY2F0ZWdvcnkgPSBcIlwiO1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGdvbGRCYWNrID0gMDtcbiAgICBlbmFibGVQYXJjZWwgPSBmYWxzZTtcbiAgICBmb3JQbGF5ZXIgPSAwO1xuICAgIGl0ZW0wID0gMDtcbiAgICBpdGVtMSA9IDA7XG4gICAgaXRlbTIgPSAwO1xuICAgIGl0ZW0zID0gMDtcbiAgICBpdGVtNCA9IDA7XG4gICAgaXRlbTUgPSAwO1xuICAgIGl0ZW02ID0gMDtcbiAgICBpdGVtNyA9IDA7XG4gICAgaXRlbTggPSAwO1xuICAgIGl0ZW05ID0gMDtcbn1cblxuZnVuY3Rpb24gaXNBcGlJdGVtKG9iajogYW55KTogb2JqIGlzIEFwaUl0ZW0ge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHR5cGVvZiBvYmoucHJvZHVjdEluZGV4ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmRpc3BsYXkgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaGl0RGlzcGxheSA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlZCA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlVHlwZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY291cGxlUHJpY2UgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY2F0ZWdvcnkgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai5nb2xkQmFjayA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5lbmFibGVQYXJjZWwgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmZvclBsYXllciA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOSA9PT0gXCJudW1iZXJcIlxuICAgIF0uZXZlcnkoYiA9PiBiKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VBcGlTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGFwaUl0ZW0gb2YgSlNPTi5wYXJzZShkYXRhKSkge1xuICAgICAgICBpZiAoIWlzQXBpSXRlbShhcGlJdGVtKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW5jb3JyZWN0IGZvcm1hdCBvZiBpdGVtOiAke2RhdGF9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyX2l0ZW1zID0gW1xuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTEsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0yLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMyxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTQsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW01LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTcsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW04LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOSxcbiAgICAgICAgXS5maWx0ZXIoaWQgPT4gISFpZCAmJiBpdGVtcy5nZXQoaWQpKS5tYXAoaWQgPT4gaXRlbXMuZ2V0KGlkKSEpO1xuXG4gICAgICAgIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIlBBUlRTXCIpIHtcbiAgICAgICAgICAgIGlmIChpbm5lcl9pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaW5uZXJfaXRlbXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcGlJdGVtLmVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtU291cmNlID0gbmV3IFNob3BJdGVtU291cmNlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLnByaWNlMCwgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLCBpbm5lcl9pdGVtcyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGlubmVyX2l0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGl0ZW1Tb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIkxPVFRFUllcIikge1xuICAgICAgICAgICAgZ2FjaGFzLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgbmV3IEdhY2hhKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLml0ZW0wLCBhcGlJdGVtLm5hbWUpKTtcbiAgICAgICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBnYWNoYUl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBnYWNoYUl0ZW0pO1xuICAgICAgICAgICAgaWYgKGFwaUl0ZW0uZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGdhY2hhSXRlbS5zb3VyY2VzLnB1c2gobmV3IFNob3BJdGVtU291cmNlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLnByaWNlMCwgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLCBpbm5lcl9pdGVtcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb3RoZXJJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIG90aGVySXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG90aGVySXRlbSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHYWNoYURhdGEoZGF0YTogc3RyaW5nLCBnYWNoYTogR2FjaGEpIHtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGF0YS5zcGxpdChcIlxcblwiKSkge1xuICAgICAgICBpZiAoIWxpbmUuaW5jbHVkZXMoXCI8TG90dGVyeUl0ZW1fXCIpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL1xccyo8TG90dGVyeUl0ZW1fKD88Y2hhcmFjdGVyPlteIF0qKSBJbmRleD1cIlxcZCtcIiBfTmFtZV89XCJbXlwiXSpcIiBTaG9wSW5kZXg9XCIoPzxzaG9wX2lkPlxcZCspXCIgUXVhbnRpdHlNaW49XCIoPzxxdWFudGl0eV9taW4+XFxkKylcIiBRdWFudGl0eU1heD1cIig/PHF1YW50aXR5X21heD5cXGQrKVwiIENoYW5zUGVyPVwiKD88cHJvYmFiaWxpdHk+XFxkK1xcLj9cXGQqKVxccypcIiBFZmZlY3Q9XCJcXGQrXCIgUHJvZHVjdE9wdD1cIlxcZCtcIlxcLz4vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgcGFyc2luZyBnYWNoYSAke2dhY2hhLmdhY2hhX2luZGV4fTpcXG4ke2xpbmV9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1hdGNoLmdyb3Vwcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYXJhY3RlciA9IG1hdGNoLmdyb3Vwcy5jaGFyYWN0ZXI7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTHVubHVuXCIpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0NoYXJhY3RlcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHtjaGFyYWN0ZXJ9XCIgaW4gbG90dGVyeSBmaWxlICR7Z2FjaGEuZ2FjaGFfaW5kZXh9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQocGFyc2VJbnQobWF0Y2guZ3JvdXBzLnNob3BfaWQpKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gc2hvcCBpdGVtIGlkICR7bWF0Y2guZ3JvdXBzLnNob3BfaWR9IGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2FjaGEuYWRkKGl0ZW0sIHBhcnNlRmxvYXQobWF0Y2guZ3JvdXBzLnByb2JhYmlsaXR5KSwgY2hhcmFjdGVyLCBwYXJzZUludChtYXRjaC5ncm91cHMucXVhbnRpdHlfbWluKSwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21heCkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIG1hcF0gb2YgZ2FjaGEuc2hvcF9pdGVtcykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpdGVtLF0gb2YgbWFwKSB7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChuZXcgR2FjaGFJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHdWFyZGlhbkRhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ3VhcmRpYW5EYXRhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE51bWJlcihvOiBhbnkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBib3NzVGltZUluZm8gPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWFwSW5mbyBvZiBndWFyZGlhbkRhdGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBJbmZvICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXBfbmFtZSA9IG1hcEluZm8uTmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBfbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV3YXJkcyA9IEFycmF5LmlzQXJyYXkobWFwSW5mby5SZXdhcmRzKSA/IFsuLi5tYXBJbmZvLlJld2FyZHNdIDogW107XG4gICAgICAgIGNvbnN0IHJld2FyZF9pdGVtcyA9IHJld2FyZHNcbiAgICAgICAgICAgIC5maWx0ZXIoKHNob3BfaWQpOiBzaG9wX2lkIGlzIG51bWJlciA9PiB0eXBlb2Ygc2hvcF9pZCA9PT0gXCJudW1iZXJcIiAmJiBzaG9wX2l0ZW1zLmhhcyhzaG9wX2lkKSlcbiAgICAgICAgICAgIC5tYXAoc2hvcF9pZCA9PiBzaG9wX2l0ZW1zLmdldChzaG9wX2lkKSEpO1xuICAgICAgICBjb25zdCBFeHBNdWx0aXBsaWVyID0gZ2V0TnVtYmVyKG1hcEluZm8uRXhwTXVsdGlwbGllcikgfHwgMDtcbiAgICAgICAgY29uc3QgSXNCb3NzU3RhZ2UgPSAhIW1hcEluZm8uSXNCb3NzU3RhZ2U7XG4gICAgICAgIGNvbnN0IE1hcElEID0gZ2V0TnVtYmVyKG1hcEluZm8uTWFwSWQpIHx8IDA7XG4gICAgICAgIGxldCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID0gZ2V0TnVtYmVyKG1hcEluZm8uQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcykgfHwgLTE7XG4gICAgICAgIGlmIChCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID09PSAtMSkge1xuICAgICAgICAgICAgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGJvc3NUaW1lSW5mby5nZXQoTWFwSUQpIHx8IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKE1hcElEICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYm9zc1RpbWVJbmZvLnNldChNYXBJRCwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJld2FyZF9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBuZXcgR3VhcmRpYW5JdGVtU291cmNlKG1hcF9uYW1lLCByZXdhcmRfaXRlbXMsIEV4cE11bHRpcGxpZXIsIElzQm9zc1N0YWdlLCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKTtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHVybC5zbGljZSh1cmwubGFzdEluZGV4T2YoXCIvXCIpICsgMSk7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ1wiKTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBgTG9hZGluZyAke2ZpbGVuYW1lfSwgcGxlYXNlIHdhaXQuLi5gO1xuICAgIH1cbiAgICBjb25zdCByZXBseSA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUrKztcbiAgICB9XG4gICAgaWYgKCFyZXBseS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIGRvd25sb2FkaW5nICR7dXJsfTogJHtyZXBseS5zdGF0dXN9JHtyZXBseS5zdGF0dXNUZXh0ID8gYCAke3JlcGx5LnN0YXR1c1RleHR9YCA6IFwiXCJ9YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVwbHkudGV4dCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRJdGVtcygpIHtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IDEyMztcbiAgICB9XG4gICAgY29uc3QgaXRlbVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2F1dGgtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBnYWNoYVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2dhbWUtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXMvbG90dGVyeVwiO1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvc2VydmVyLWNvcmUvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGl0ZW1VUkwgPSBpdGVtU291cmNlICsgXCIvSXRlbV9QYXJ0c19JbmkzLnhtbFwiO1xuICAgIGNvbnN0IGl0ZW1EYXRhID0gZG93bmxvYWQoaXRlbVVSTCk7XG4gICAgY29uc3QgaXRlbUFydERhdGEgPSBkb3dubG9hZChcIi9hc3NldHMvaXRlbS1hcnQtbWFwLmpzb25cIik7XG4gICAgLy9jb25zdCBzaG9wVVJMID0gaXRlbVNvdXJjZSArIFwiL1Nob3BfSW5pMy54bWxcIjtcbiAgICBjb25zdCBtYXhfc2hvcF9wYWdlcyA9IDIwOyAvL2N1cnJlbnRseSBuZWVkIG9ubHkgMTAsIHNob3VsZCBiZSBlbm91Z2hcbiAgICBjb25zdCBzaG9wVVJMID0gXCIvYXBpL3Nob3A/c2l6ZT0xMDAwJnBhZ2U9XCI7XG4gICAgY29uc3Qgc2hvcERhdGFzID0gWy4uLkFycmF5KG1heF9zaG9wX3BhZ2VzKS5rZXlzKCldLm1hcChuID0+IGRvd25sb2FkKGAke3Nob3BVUkx9JHtufWApKTtcbiAgICBjb25zdCBndWFyZGlhblVSTCA9IGd1YXJkaWFuU291cmNlICsgXCIvR3VhcmRpYW5TdGFnZXMuanNvblwiO1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IGRvd25sb2FkKGd1YXJkaWFuVVJMKTtcbiAgICBwYXJzZUl0ZW1EYXRhKGF3YWl0IGl0ZW1EYXRhKTtcbiAgICBpdGVtQXJ0TWFwID0gSlNPTi5wYXJzZShhd2FpdCBpdGVtQXJ0RGF0YSkgYXMgSXRlbUFydE1hcDtcbiAgICAvL3BhcnNlU2hvcERhdGEoYXdhaXQgc2hvcERhdGEpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHNob3BEYXRhcy5tYXAocCA9PiBwLnRoZW4oZGF0YSA9PiBwYXJzZUFwaVNob3BEYXRhKGRhdGEpKSkpO1xuXG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IGdhY2hhcy5zaXplICsgMztcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFfaXRlbXM6IFtQcm9taXNlPHN0cmluZz4sIEdhY2hhLCBzdHJpbmddW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFfdXJsID0gYCR7Z2FjaGFTb3VyY2V9L0luaTNfTG90XyR7YCR7Z2FjaGEuZ2FjaGFfaW5kZXh9YC5wYWRTdGFydCgyLCBcIjBcIil9LnhtbGA7XG4gICAgICAgIGdhY2hhX2l0ZW1zLnB1c2goW2Rvd25sb2FkKGdhY2hhX3VybCksIGdhY2hhLCBnYWNoYV91cmxdKTtcbiAgICB9XG4gICAgcGFyc2VHdWFyZGlhbkRhdGEoYXdhaXQgZ3VhcmRpYW5EYXRhKTtcbiAgICBmb3IgKGNvbnN0IFtpdGVtLCBnYWNoYSwgZ2FjaGFfdXJsXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VHYWNoYURhdGEoYXdhaXQgaXRlbSwgZ2FjaGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBkb3dubG9hZGluZyAke2dhY2hhX3VybH0gYmVjYXVzZSAke2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0YWJsZUl0ZW0oaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlcIiB9LFxuICAgICAgICBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsXCIsXG4gICAgICAgICAgICAgICAgXCJkYXRhLWl0ZW1faW5kZXhcIjogYCR7aXRlbS5pZH1gLFxuICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgRXhjbHVkZSAke2l0ZW0ubmFtZV9lbn0gZnJvbSByZXN1bHRzYCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiRXhjbHVkZVwiLFxuICAgICAgICBdKSxcbiAgICAgICAgY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW0sIGNoYXJhY3RlciksXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNob3dEaWFsb2coXG4gICAgdHJpZ2dlcjogSFRNTEJ1dHRvbkVsZW1lbnQsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSxcbiAgICBkaWFsb2dDbGFzcz86IHN0cmluZyxcbikge1xuICAgIGNvbnN0IHRvcERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wX2RpdlwiKTtcbiAgICBpZiAoISh0b3BEaXYgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGlhbG9nKSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgfVxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBkaWFsb2dDbGFzcyA/IGAke2RpYWxvZ0NsYXNzfV9fY2xvc2VgIDogXCJkaWFsb2dfX2Nsb3NlXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICB9LFxuICAgICAgICBcIkNsb3NlXCIsXG4gICAgXSk7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHtcbiAgICAgICAgLi4uKGRpYWxvZ0NsYXNzID8geyBjbGFzczogZGlhbG9nQ2xhc3MgfSA6IHt9KSxcbiAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGxhYmVsLFxuICAgIH07XG4gICAgZGlhbG9nID0gQXJyYXkuaXNBcnJheShjb250ZW50KVxuICAgICAgICA/IGNyZWF0ZUhUTUwoW1wiZGlhbG9nXCIsIGF0dHJpYnV0ZXMsIC4uLmNvbnRlbnQsIGNsb3NlQnV0dG9uXSlcbiAgICAgICAgOiBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCBhdHRyaWJ1dGVzLCBjb250ZW50LCBjbG9zZUJ1dHRvbl0pO1xuICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcInRydWVcIik7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGRpYWxvZz8uY2xvc2UoKSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpO1xuICAgICAgICBkaWFsb2c/LnJlbW92ZSgpO1xuICAgICAgICBkaWFsb2cgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgdG9wRGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9wdXBMaW5rKHRleHQ6IHN0cmluZywgY29udGVudDogSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10pIHtcbiAgICBjb25zdCBidXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwicG9wdXBfbGlua1wiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIFwiYXJpYS1oYXNwb3B1cFwiOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dCxcbiAgICBdKTtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd0RpYWxvZyhidXR0b24sIGAke3RleHR9IGRldGFpbHNgLCBjb250ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGFuY2VQb3B1cCh0cmllczogbnVtYmVyKSB7XG4gICAgZnVuY3Rpb24gcHJvYmFiaWxpdHlBZnRlck5Ucmllcyhwcm9iYWJpbGl0eTogbnVtYmVyLCB0cmllczogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAxIC0gKE1hdGgucG93KCgxIC0gcHJvYmFiaWxpdHkpLCB0cmllcykpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIk51bWJlciBvZiBnYWNoYXNcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYW5jZSBmb3IgaXRlbVwiXSxcbiAgICAgICAgXSxcbiAgICBdKTtcbiAgICBmb3IgKGNvbnN0IGZhY3RvciBvZiBbMC4xLCAwLjUsIDEsIDIsIDUsIDEwXSkge1xuICAgICAgICBjb25zdCBnYWNoYXMgPSBNYXRoLnJvdW5kKHRyaWVzICogZmFjdG9yKTtcbiAgICAgICAgaWYgKGdhY2hhcyA9PT0gMCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke2dhY2hhc31gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAkeyhwcm9iYWJpbGl0eUFmdGVyTlRyaWVzKDEgLyB0cmllcywgZ2FjaGFzKSAqIDEwMCkudG9GaXhlZCg0KX0lYF0sXG4gICAgICAgIF0pKTtcbiAgICB9XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcInRyXCJdKSk7XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhgJHtwcmV0dHlOdW1iZXIodHJpZXMsIDIpfWAsIGNvbnRlbnQpO1xufVxuXG5mdW5jdGlvbiBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICBpZiAocXVhbnRpdHlfbWluID09PSAxICYmIHF1YW50aXR5X21heCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gcXVhbnRpdHlfbWF4KSB7XG4gICAgICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9tYXh9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAgeCAke3F1YW50aXR5X21pbn0tJHtxdWFudGl0eV9tYXh9YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTb3VyY2VQb3B1cChpdGVtOiBJdGVtIHwgdW5kZWZpbmVkLCBpdGVtU291cmNlOiBJdGVtU291cmNlLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBjb250ZW50ID0gY2hhcmFjdGVyID8gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pIDogY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFyYWN0ZXJcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYW5jZVwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiRXhwZWN0ZWQgcHVsbHNcIl0sXG4gICAgICAgIF0sXG4gICAgXSk7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgY29uc3QgZ2FjaGFfaXRlbXMgPSBuZXcgTWFwPEl0ZW0sIFtudW1iZXIsIG51bWJlciwgbnVtYmVyXT4oKTtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGl0ZW1fY2hhcmFjdGVyID8gZ2FjaGEuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChpdGVtX2NoYXJhY3RlcikhIDogZ2FjaGEudG90YWxfcHJvYmFiaWxpdHk7XG4gICAgICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IHRpY2tldHMgLyBpdGVtX3RpY2tldHM7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c19wcm9iYWJpbGl0eSA9IGdhY2hhX2l0ZW1zLmdldChjaGFyX2dhY2hhX2l0ZW0pPy5bMF0gfHwgMDtcbiAgICAgICAgICAgIGdhY2hhX2l0ZW1zLnNldChjaGFyX2dhY2hhX2l0ZW0sIFtwcmV2aW91c19wcm9iYWJpbGl0eSArIHByb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbY2hhcl9nYWNoYV9pdGVtLCBbcHJvYmFiaWxpdHksIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgZ2FjaGFfaXRlbXMpIHtcbiAgICAgICAgaWYgKGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgaXRlbSA9PT0gY2hhcl9nYWNoYV9pdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW4sIHF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcihwcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcigxIC8gcHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgaXRlbSA9PT0gY2hhcl9nYWNoYV9pdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW4sIHF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5jaGFyYWN0ZXIgfHwgXCIqXCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcihwcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcigxIC8gcHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBnYWNoYS5uYW1lXSksIGNvbnRlbnRdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBjb250ZW50VGFibGUgPSBjcmVhdGVIVE1MKFtcInRhYmxlXCIsIFtcInRyXCIsIFtcInRoXCIsIFwiQ29udGVudHNcIl1dXSk7XG4gICAgZm9yIChjb25zdCBpbm5lcl9pdGVtIG9mIGl0ZW1Tb3VyY2UuaXRlbXMpIHtcbiAgICAgICAgY29udGVudFRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1widHJcIiwgaW5uZXJfaXRlbSA9PT0gaXRlbSA/IHsgY2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIiB9IDogXCJcIiwgW1widGRcIiwgaW5uZXJfaXRlbS5uYW1lX2VuXV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgY29udGVudFRhYmxlXSldKTtcbn1cblxuZnVuY3Rpb24gcHJldHR5VGltZShzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihzZWNvbmRzIC8gNjApfToke2Ake3NlY29uZHMgJSA2MH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBbXG4gICAgICAgIGBHdWFyZGlhbiBtYXAgJHtpdGVtU291cmNlLmd1YXJkaWFuX21hcH1gLFxuICAgICAgICBjcmVhdGVIVE1MKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwidWxcIiwgeyBjbGFzczogXCJsYXlvdXRcIiB9LFxuICAgICAgICAgICAgICAgIFtcImxpXCIsIFwiSXRlbXM6XCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInVsXCIsIHsgY2xhc3M6IFwibGF5b3V0XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLml0ZW1Tb3VyY2UuaXRlbXMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJyLCByZXdhcmRfaXRlbSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy4uLmN1cnIsIGNyZWF0ZUhUTUwoW1wibGlcIiwgeyBjbGFzczogcmV3YXJkX2l0ZW0gPT09IGl0ZW0gPyBcImhpZ2hsaWdodGVkXCIgOiBcIlwiIH0sIHJld2FyZF9pdGVtLm5hbWVfZW5dKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYFJlcXVpcmVzIGJvc3M6ICR7aXRlbVNvdXJjZS5uZWVkX2Jvc3MgPyBcIlllc1wiIDogXCJOb1wifWBdLFxuICAgICAgICAgICAgICAgIC4uLihpdGVtU291cmNlLmJvc3NfdGltZSA+IDAgPyBbY3JlYXRlSFRNTChbXCJsaVwiLCBgQm9zcyB0aW1lOiAke3ByZXR0eVRpbWUoaXRlbVNvdXJjZS5ib3NzX3RpbWUpfWBdKV0gOiBbXSksXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYEVYUCBtdWx0aXBsaWVyOiAke2l0ZW1Tb3VyY2UueHB9YF0sXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICBdO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGNvbnRlbnQpO1xufVxuXG5mdW5jdGlvbiBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICByZXR1cm4gWy4uLml0ZW0uc291cmNlcy52YWx1ZXMoKV1cbiAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgIC5tYXAoaXRlbVNvdXJjZSA9PiBzb3VyY2VJdGVtRWxlbWVudChpdGVtLCBpdGVtU291cmNlLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBtYWtlU291cmNlc0xpc3QobGlzdDogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdW10pOiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10ge1xuICAgIGNvbnN0IHJlc3VsdDogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdID0gW107XG4gICAgZnVuY3Rpb24gYWRkKGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9IHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gKyBlbGVtZW50O1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xuICAgIH1cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgZWxlbWVudHMgb2YgbGlzdCkge1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhZGQoXCIgXCIpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQbGF5ZXJOdW1iZXIodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQoXCJlbi1VU1wiLCB7XG4gICAgICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcbiAgICB9KS5mb3JtYXQodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDdXJyZW5jeUNoaXAoY3VycmVuY3k6IFwiQVBcIiB8IFwiR29sZFwiKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGBnYWNoYS1jdXJyZW5jeSBnYWNoYS1jdXJyZW5jeS0tJHtjdXJyZW5jeS50b0xvd2VyQ2FzZSgpfWAsXG4gICAgICAgICAgICBcImRhdGEtY3VycmVuY3lcIjogY3VycmVuY3ksXG4gICAgICAgIH0sXG4gICAgICAgIGN1cnJlbmN5LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoXG4gICAgaXRlbTogSXRlbSxcbiAgICBpdGVtU291cmNlOiBHYWNoYUl0ZW1Tb3VyY2UsXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pIHtcbiAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQoaXRlbVNvdXJjZS5zaG9wX2lkKTtcbiAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5sb3R0ZXJpZXNbYCR7Z2FjaGEuZ2FjaGFfaW5kZXh9YF07XG4gICAgY29uc3QgZXhwZWN0ZWRQdWxscyA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgIGNvbnN0IGRpcmVjdFNvdXJjZSA9IGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzLmZpbmQoXG4gICAgICAgIChzb3VyY2UpOiBzb3VyY2UgaXMgU2hvcEl0ZW1Tb3VyY2UgPT4gc291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UsXG4gICAgKTtcbiAgICBjb25zdCBlY29ub21pY3MgPSBwcm9qZWN0R2FjaGFFY29ub21pY3MoZXhwZWN0ZWRQdWxscywgZGlyZWN0U291cmNlKTtcbiAgICBjb25zdCBhbHRlcm5hdGl2ZVNvdXJjZXMgPSBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KFxuICAgICAgICBpdGVtU291cmNlLml0ZW0sXG4gICAgICAgIHNvdXJjZSA9PiBzb3VyY2UgIT09IGRpcmVjdFNvdXJjZSAmJiBzb3VyY2VGaWx0ZXIoc291cmNlKSxcbiAgICAgICAgaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuID8gdW5kZWZpbmVkIDogY2hhcmFjdGVyLFxuICAgICk7XG4gICAgY29uc3QgYWx0ZXJuYXRpdmVMaXN0ID0gbWFrZVNvdXJjZXNMaXN0KGFsdGVybmF0aXZlU291cmNlcyk7XG4gICAgY29uc3QgcHVyY2hhc2UgPSBlY29ub21pY3MuYXZhaWxhYmlsaXR5ID09PSBcImRpcmVjdFwiXG4gICAgICAgID8gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1wdXJjaGFzZVwiIH0sXG4gICAgICAgICAgICBjcmVhdGVDdXJyZW5jeUNoaXAoZWNvbm9taWNzLmN1cnJlbmN5KSxcbiAgICAgICAgICAgIFtcInNwYW5cIiwgYCR7Zm9ybWF0UGxheWVyTnVtYmVyKGVjb25vbWljcy5wcmljZVBlclB1bGwpfSBwZXIgcHVsbGBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtZXhwZWN0ZWQtc3BlbmRcIiB9LFxuICAgICAgICAgICAgICAgIGBFeHBlY3RlZCBzcGVuZCB+JHtmb3JtYXRQbGF5ZXJOdW1iZXIoZWNvbm9taWNzLmV4cGVjdGVkU3BlbmQpfSAke2Vjb25vbWljcy5jdXJyZW5jeX1gLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSlcbiAgICAgICAgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1wdXJjaGFzZSBnYWNoYS1wdXJjaGFzZS0tdW5hdmFpbGFibGVcIiB9LFxuICAgICAgICAgICAgXCJOb3QgZGlyZWN0bHkgcHVyY2hhc2FibGVcIixcbiAgICAgICAgXSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5XCIsXG4gICAgICAgICAgICByb2xlOiBcImdyb3VwXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYCR7Z2FjaGEubmFtZX0gYWNxdWlzaXRpb25gLFxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVHYWNoYUNvaW5BcnQoZ2FjaGEpLFxuICAgICAgICBbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1zb3VyY2Utc3VtbWFyeV9fY29udGVudFwiIH0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWlkZW50aXR5XCIgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVHYWNoYVNvdXJjZVBvcHVwKFxuICAgICAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4gPyB1bmRlZmluZWQgOiBjaGFyYWN0ZXIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWNvaW4tY29sb3JcIiB9LFxuICAgICAgICAgICAgICAgICAgICBhcnQgPyBgJHthcnQuY29sb3J9ICR7YXJ0LnNoYXBlfWAgOiBcIkNvaW4gY29sb3IgdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtbWV0cmljc1wiIH0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcImRsXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtZWNvbm9taWNzXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgW1wiZGl2XCIsIFtcImR0XCIsIFwiQ2hhbmNlXCJdLCBbXCJkZFwiLCBgJHtmb3JtYXRQbGF5ZXJOdW1iZXIoZWNvbm9taWNzLmNoYW5jZVBlcmNlbnQpfSVgXV0sXG4gICAgICAgICAgICAgICAgICAgIFtcImRpdlwiLCBbXCJkdFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLCBbXCJkZFwiLCBgfiR7Zm9ybWF0UGxheWVyTnVtYmVyKGVjb25vbWljcy5leHBlY3RlZFB1bGxzKX1gXV0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBwdXJjaGFzZSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAuLi4oYWx0ZXJuYXRpdmVMaXN0Lmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IFtjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtYWx0ZXJuYXRpdmVzXCIgfSxcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiZ2FjaGEtYWx0ZXJuYXRpdmVzX19sYWJlbFwiIH0sIFwiQWx0ZXJuYXRpdmVcIl0sXG4gICAgICAgICAgICAgICAgLi4uYWx0ZXJuYXRpdmVMaXN0LFxuICAgICAgICAgICAgXSldXG4gICAgICAgICAgICAgICAgOiBbXSksXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNvdXJjZUl0ZW1FbGVtZW50KGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UsIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB7XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoaXRlbSwgaXRlbVNvdXJjZSwgc291cmNlRmlsdGVyLCBjaGFyYWN0ZXIpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgIGlmIChpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIFtgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSksXG4gICAgICAgICAgICBgICR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YFxuICAgICAgICBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgIHJldHVybiBbY3JlYXRlR3VhcmRpYW5Qb3B1cChpdGVtLCBpdGVtU291cmNlKV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpdGVtRGV0YWlsU3RhdHMoaXRlbTogSXRlbSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIFtcIk1vdmVtZW50XCIsIGl0ZW0ubW92ZW1lbnRdLFxuICAgICAgICBbXCJDaGFyZ2VcIiwgaXRlbS5jaGFyZ2VdLFxuICAgICAgICBbXCJMb2JcIiwgaXRlbS5sb2JdLFxuICAgICAgICBbXCJTbWFzaFwiLCBpdGVtLnNtYXNoXSxcbiAgICAgICAgW1wiU3RyZW5ndGhcIiwgaXRlbS5zdHJdLFxuICAgICAgICBbXCJEZXh0ZXJpdHlcIiwgaXRlbS5kZXhdLFxuICAgICAgICBbXCJTdGFtaW5hXCIsIGl0ZW0uc3RhXSxcbiAgICAgICAgW1wiV2lsbFwiLCBpdGVtLndpbF0sXG4gICAgICAgIFtcIlNlcnZlXCIsIGl0ZW0uc2VydmVdLFxuICAgICAgICBbXCJIUFwiLCBpdGVtLmhwXSxcbiAgICAgICAgW1wiUXVpY2tzbG90c1wiLCBpdGVtLnF1aWNrc2xvdHNdLFxuICAgICAgICBbXCJCdWZmc2xvdHNcIiwgaXRlbS5idWZmc2xvdHNdLFxuICAgIF0gYXMgY29uc3Q7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBzdGF0cyA9IGl0ZW1EZXRhaWxTdGF0cyhpdGVtKS5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUgIT09IDApO1xuICAgIGNvbnN0IHNvdXJjZXMgPSBtYWtlU291cmNlc0xpc3QoXG4gICAgICAgIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoaXRlbSwgKCkgPT4gdHJ1ZSwgY2hhcmFjdGVyKSxcbiAgICApO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNcIiB9LFxuICAgICAgICBbXG4gICAgICAgICAgICBcImhlYWRlclwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2hlYWRlclwiIH0sXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXJ0KGl0ZW0sIDcyLCBcIml0ZW0tZGV0YWlsc19fYXJ0XCIpLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fZXllYnJvd1wiIH0sIFwiRXF1aXBtZW50IGRldGFpbHNcIl0sXG4gICAgICAgICAgICAgICAgW1wiaDJcIiwgaXRlbS5uYW1lX2VuXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fbWV0YVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGAke2NoYXJhY3RlciA/PyBpdGVtLmNoYXJhY3RlciA/PyBcIkFsbCBjaGFyYWN0ZXJzXCJ9IMK3ICR7aXRlbS5wYXJ0fSDCtyBMZXZlbCAke2l0ZW0ubGV2ZWx9YCxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zdGF0c1wiIH0sXG4gICAgICAgICAgICBbXCJoM1wiLCB7IGlkOiBcIml0ZW0tZGV0YWlscy1zdGF0c1wiIH0sIFwiU3RhdHNcIl0sXG4gICAgICAgICAgICBzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkbFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0cy5tYXAoKFtsYWJlbCwgdmFsdWVdKSA9PiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJkdFwiLCBsYWJlbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJkZFwiLCBgJHt2YWx1ZX1gXSxcbiAgICAgICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcInBcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBzdGF0IGJvbnVzZXNcIl0pLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc291cmNlc1wiIH0sIFwiSG93IHRvIGdldCBpdFwiXSxcbiAgICAgICAgICAgIHNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXCJkaXZcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NvdXJjZXNcIiB9LCAuLi5zb3VyY2VzXSlcbiAgICAgICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJObyBhY3RpdmUgYWNxdWlzaXRpb24gc291cmNlIGZvdW5kLlwiLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICBdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc1RyaWdnZXIoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tZGV0YWlscy10cmlnZ2VyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBWaWV3IGRldGFpbHMgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICBdKTtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd0RpYWxvZyhcbiAgICAgICAgICAgIGJ1dHRvbixcbiAgICAgICAgICAgIGAke2l0ZW0ubmFtZV9lbn0gaXRlbSBkZXRhaWxzYCxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtLCBjaGFyYWN0ZXIpLFxuICAgICAgICAgICAgXCJpdGVtLWRldGFpbHMtZGlhbG9nXCIsXG4gICAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW06IEl0ZW0pIHtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja1wiLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgT2ZmaWNpYWwgaXRlbSBhcnQgdW5hdmFpbGFibGUgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja19fY29kZVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGl0ZW0ucGFydCB8fCBcIkl0ZW1cIl0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIFwiT2ZmaWNpYWwgYXJ0IHVuYXZhaWxhYmxlXCJdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgc2hlZXQ6IHN0cmluZyxcbiAgICBjZWxsOiBudW1iZXIsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjbGFzc05hbWU6IHN0cmluZyxcbiAgICBkaXNwbGF5U2l6ZSA9IDQwLFxuKSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBpdGVtQXJ0TWFwLnNoZWV0c1tzaGVldF07XG4gICAgaWYgKCFnZW9tZXRyeSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvbHVtbiA9IGNlbGwgJSBnZW9tZXRyeS5saW5lQ291bnQ7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihjZWxsIC8gZ2VvbWV0cnkubGluZUNvdW50KTtcbiAgICBjb25zdCBzY2FsZSA9IGRpc3BsYXlTaXplIC8gZ2VvbWV0cnkuc2l6ZTtcbiAgICBjb25zdCBpbWFnZVNpemUgPSBnZW9tZXRyeS53aWR0aCAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFggPSAtKGdlb21ldHJ5LnNwYWNlICsgY29sdW1uICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IC0oZ2VvbWV0cnkuc3BhY2UgKyByb3cgKiAoZ2VvbWV0cnkuc2l6ZSArIGdlb21ldHJ5LnNwYWNlKSkgKiBzY2FsZTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogY2xhc3NOYW1lLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICAgICAgICAgIHN0eWxlOiBbXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtaW1hZ2U6dXJsKFwiL2Fzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbiAgICBjbGFzc05hbWUgPSBcIml0ZW0tYXJ0LXRodW1ibmFpbFwiLFxuKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydFswXSxcbiAgICAgICAgYXJ0WzFdLFxuICAgICAgICBgT2ZmaWNpYWwgaXRlbSBhcnQgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgZGlzcGxheVNpemUsXG4gICAgKSA/PyBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYTogR2FjaGEpIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLmxvdHRlcmllc1tgJHtnYWNoYS5nYWNoYV9pbmRleH1gXTtcbiAgICBjb25zdCBmYWxsYmFjayA9ICgpID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtY29pbi1hcnQgZ2FjaGEtY29pbi1hcnQtLXVuYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYENvaW4gYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI/XCIsXG4gICAgICAgIF0pO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaygpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnQuc2hlZXQsXG4gICAgICAgIGFydC5jZWxsLFxuICAgICAgICBgJHthcnQuY29sb3J9ICR7YXJ0LnNoYXBlfSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgIFwiZ2FjaGEtY29pbi1hcnRcIixcbiAgICApID8/IGZhbGxiYWNrKCk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RhYmxlUm93KGl0ZW06IEl0ZW0sIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcbiAgICBjb25zdCByb3cgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbSwgY2hhcmFjdGVyKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiB9LCBjcmVhdGVJdGVtQXJ0KGl0ZW0pXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiIH0sIGl0ZW0uY2hhcmFjdGVyID8/IFwiQWxsXCJdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJQYXJ0X2NvbHVtblwiIH0sIGl0ZW0ucGFydF0sXG4gICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgc3RhdC5zcGxpdChcIitcIikubWFwKHMgPT4gaXRlbS5zdGF0RnJvbVN0cmluZyhzKSkuam9pbihcIitcIildKSksXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIgfSwgYCR7aXRlbS5sZXZlbH1gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiIH0sIC4uLm1ha2VTb3VyY2VzTGlzdChpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW0sIHNvdXJjZUZpbHRlciwgY2hhcmFjdGVyKSldLFxuICAgICAgICBdXG4gICAgKTtcbiAgICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2FjaGFUYWJsZShmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLCBjaGFyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgdGFibGUgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0YWJsZVwiLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcInRyXCIsIFtcInRkXCIsIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAodW5kZWZpbmVkLCBuZXcgSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSwgY2hhcildXSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWJsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3VsdHNUYWJsZShcbiAgICBmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgcHJpb3JpemVyOiAoaXRlbXM6IEl0ZW1bXSwgaXRlbTogSXRlbSkgPT4gSXRlbVtdLFxuICAgIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHJlc3VsdHM6IHsgW2tleTogc3RyaW5nXTogSXRlbVtdIH0gPSB7XG4gICAgICAgIFwiSGF0XCI6IFtdLFxuICAgICAgICBcIkhhaXJcIjogW10sXG4gICAgICAgIFwiRHllXCI6IFtdLFxuICAgICAgICBcIlVwcGVyXCI6IFtdLFxuICAgICAgICBcIkxvd2VyXCI6IFtdLFxuICAgICAgICBcIlNob2VzXCI6IFtdLFxuICAgICAgICBcIlNvY2tzXCI6IFtdLFxuICAgICAgICBcIkhhbmRcIjogW10sXG4gICAgICAgIFwiQmFja3BhY2tcIjogW10sXG4gICAgICAgIFwiRmFjZVwiOiBbXSxcbiAgICAgICAgXCJSYWNrZXRcIjogW10sXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgWywgaXRlbV0gb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGZpbHRlcihpdGVtKSkge1xuICAgICAgICAgICAgcmVzdWx0c1tpdGVtLnBhcnRdID0gcHJpb3JpemVyKHJlc3VsdHNbaXRlbS5wYXJ0XSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICBbXCJjYXB0aW9uXCIsIFwiQmVzdCBtYXRjaGluZyBlcXVpcG1lbnQgYnkgc2xvdCBhbmQgc2VsZWN0ZWQgc3RhdCBwcmlvcml0eVwiXSxcbiAgICAgICAgICAgIFtcInRoZWFkXCIsXG4gICAgICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiUGFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcInRoXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiLCBzY29wZTogXCJjb2xcIiB9LCBzdGF0XSkpLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiTGV2ZWxcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlNvdXJjZVwiXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcInRib2R5XCJdLFxuICAgICAgICBdXG4gICAgKTtcbiAgICBjb25zdCB0YWJsZUJvZHkgPSB0YWJsZS50Qm9kaWVzWzBdO1xuICAgIGlmICghdGFibGVCb2R5KSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB0eXBlIE1hcE9wdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH07XG5cbiAgICB0eXBlIENvc3QgPSB7XG4gICAgICAgIGdvbGQ6IG51bWJlcixcbiAgICAgICAgYXA6IG51bWJlcixcbiAgICAgICAgbWFwczogTWFwT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY29tYmluZU1hcHMobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHJlc3VsdFttYXBdLmNvbmNhdCh0cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZUNvc3RzKGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCArIGNvc3QyLmdvbGQsXG4gICAgICAgICAgICBhcDogY29zdDEuYXAgKyBjb3N0Mi5hcCxcbiAgICAgICAgICAgIG1hcHM6IGNvbWJpbmVNYXBzKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbk1hcChtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmICh0cmllcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IFtNYXRoLm1pbihyZXN1bHRbbWFwXVswXSwgdHJpZXNbMF0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5Db3N0KGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4gW2Nvc3QxLmFwLCBjb3N0MS5nb2xkXSA8IFtjb3N0MS5hcCwgY29zdDEuZ29sZF0gP1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QxLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QyLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QyLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29zdE9mKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IENvc3Qge1xuICAgICAgICByZXR1cm4gWy4uLml0ZW0uc291cmNlcy52YWx1ZXMoKV1cbiAgICAgICAgICAgIC5maWx0ZXIoc291cmNlRmlsdGVyKVxuICAgICAgICAgICAgLnJlZHVjZSgoY3VyciwgaXRlbVNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvc3QgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZS5hcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGdvbGQ6IDAsIGFwOiBpdGVtU291cmNlLnByaWNlLCBtYXBzOiB7fSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogaXRlbVNvdXJjZS5wcmljZSwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlQ29zdCA9IGNvc3RPZihpdGVtU291cmNlLml0ZW0sIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtdWx0aXBsaWVyID0gaXRlbVNvdXJjZS5nYWNoYVRyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGQ6IHNpbmdsZUNvc3QuZ29sZCAqIG11bHRpcGxpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXA6IHNpbmdsZUNvc3QuYXAgKiBtdWx0aXBsaWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoc2luZ2xlQ29zdC5tYXBzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoW21hcCwgdHJpZXNdKSA9PiBbbWFwLCB0cmllcy5tYXAobiA9PiBuICogbXVsdGlwbGllcildKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb2xkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhbW2l0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLCBbaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGhdXV0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWluQ29zdChjdXJyLCBjb3N0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeyBnb2xkOiAwLCBhcDogMCwgbWFwczoge30gfVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0aXN0aWNzID0ge1xuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgU2V0PENoYXJhY3Rlcj4sXG4gICAgICAgIC4uLnByaW9yaXR5U3RhdHMucmVkdWNlKChjdXJyLCBzdGF0KSA9PiAoeyAuLi5jdXJyLCBbc3RhdF06IDAgfSksIHt9KSxcbiAgICAgICAgTGV2ZWw6IDAsXG4gICAgICAgIGNvc3Q6IHsgYXA6IDAsIGdvbGQ6IDAsIG1hcHM6IHt9IH0gYXMgQ29zdCxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCByZXN1bHQgb2YgT2JqZWN0LnZhbHVlcyhyZXN1bHRzKSkge1xuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHN0YXQgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRpc3RpY3Nbc3RhdF0gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3RhdC5zcGxpdChcIitcIikucmVkdWNlKChjdXJyLCBzdGF0TmFtZSkgPT4gY3VyciArIHJlc3VsdFswXS5zdGF0RnJvbVN0cmluZyhzdGF0TmFtZSksIDApO1xuICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICBzdGF0aXN0aWNzW3N0YXRdICs9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGlzdGljcy5MZXZlbCA9IE1hdGgubWF4KHJlc3VsdFswXS5sZXZlbCwgc3RhdGlzdGljcy5MZXZlbCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJlc3VsdCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGFyIG9mIGl0ZW0uY2hhcmFjdGVyID8gW2l0ZW0uY2hhcmFjdGVyXSA6IGNoYXJhY3RlcnMpIHtcbiAgICAgICAgICAgICAgICBzdGF0aXN0aWNzLmNoYXJhY3RlcnMuYWRkKGNoYXIpXG4gICAgICAgICAgICAgICAgdGFibGVCb2R5LmFwcGVuZENoaWxkKGl0ZW1Ub1RhYmxlUm93KGl0ZW0sIHNvdXJjZUZpbHRlciwgcHJpb3JpdHlTdGF0cywgY2hhcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGlzdGljcy5jb3N0ID0gY29tYmluZUNvc3RzKGNvc3RPZihpdGVtLCBjaGFyYWN0ZXIgJiYgaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSA/IGNoYXJhY3RlciA6IHVuZGVmaW5lZCksIHN0YXRpc3RpY3MuY29zdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhdGlzdGljcy5jaGFyYWN0ZXJzLnNpemUgPT09IDEpIHtcbiAgICAgICAgY29uc3QgdG90YWxfc291cmNlczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5nb2xkID4gMCkge1xuICAgICAgICAgICAgdG90YWxfc291cmNlcy5wdXNoKGAke3N0YXRpc3RpY3MuY29zdC5nb2xkLnRvRml4ZWQoMCl9IEdvbGRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGlzdGljcy5jb3N0LmFwID4gMCkge1xuICAgICAgICAgICAgdG90YWxfc291cmNlcy5wdXNoKGAke3N0YXRpc3RpY3MuY29zdC5hcC50b0ZpeGVkKDApfSBBUGApO1xuICAgICAgICB9XG4gICAgICAgIC8vc3RhdGlzdGljc1snR3VhcmRpYW4gZ2FtZXMnXS5mb3JFYWNoKChjb3VudCwgbWFwKSA9PiB0b3RhbF9zb3VyY2VzLnB1c2goYCR7Y291bnQudG9GaXhlZCgwKX0geCAke21hcH1gKSk7XG4gICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJ0Zm9vdFwiLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIE5hbWVfY29sdW1uXCIgfSwgXCJUb3RhbDpcIl0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBBcnRfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBDaGFyYWN0ZXJfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBQYXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIG51bWVyaWNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgYCR7c3RhdGlzdGljc1tzdGF0XX1gXG4gICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgTGV2ZWxfY29sdW1uIG51bWVyaWNcIiB9LCBgJHtzdGF0aXN0aWNzLkxldmVsfWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgU291cmNlX2NvbHVtblwiIH0sIHRvdGFsX3NvdXJjZXMuam9pbihcIiwgXCIpXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0pKTtcbiAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBDaGFyYWN0ZXJfY29sdW1uYCkpIHtcbiAgICAgICAgICAgIGlmICghKGNvbHVtbl9lbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2x1bW5fZWxlbWVudC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgaWYgKHN0YXRpc3RpY3NbYXR0cmlidXRlXSA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke2F0dHJpYnV0ZX1fY29sdW1uYCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShjb2x1bW5fZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sdW1uX2VsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhJdGVtTGV2ZWwoKSB7XG4gICAgLy9ubyByZWR1Y2UgZm9yIE1hcD9cbiAgICBsZXQgbWF4ID0gMDtcbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KG1heCwgaXRlbS5sZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBtYXg7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZGlhbG9nICYmIGRpYWxvZyA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgbWFrZUNoZWNrYm94VHJlZSwgVHJlZU5vZGUsIGdldExlYWZTdGF0ZXMsIHNldExlYWZTdGF0ZXMgfSBmcm9tICcuL2NoZWNrYm94VHJlZSc7XG5pbXBvcnQgeyBjcmVhdGVQb3B1cExpbmssIGRvd25sb2FkSXRlbXMsIGdldFJlc3VsdHNUYWJsZSwgSXRlbSwgSXRlbVNvdXJjZSwgZ2V0TWF4SXRlbUxldmVsLCBpdGVtcywgQ2hhcmFjdGVyLCBjaGFyYWN0ZXJzLCBpc0NoYXJhY3RlciwgU2hvcEl0ZW1Tb3VyY2UsIEdhY2hhSXRlbVNvdXJjZSwgZ2V0R2FjaGFUYWJsZSB9IGZyb20gJy4vaXRlbUxvb2t1cCc7XG5pbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IHNlbGVjdEJ5UHJpb3JpdHkgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7IFZhcmlhYmxlX3N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5jb25zdCBwYXJ0c0ZpbHRlciA9IFtcbiAgICBcIlBhcnRzXCIsIFtcbiAgICAgICAgXCJIZWFkXCIsIFtcbiAgICAgICAgICAgIFwiK0hhdFwiLFxuICAgICAgICAgICAgXCIrSGFpclwiLFxuICAgICAgICAgICAgXCJEeWVcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrVXBwZXJcIixcbiAgICAgICAgXCIrTG93ZXJcIixcbiAgICAgICAgXCJMZWdzXCIsIFtcbiAgICAgICAgICAgIFwiK1Nob2VzXCIsXG4gICAgICAgICAgICBcIlNvY2tzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiQXV4XCIsIFtcbiAgICAgICAgICAgIFwiK0hhbmRcIixcbiAgICAgICAgICAgIFwiK0JhY2twYWNrXCIsXG4gICAgICAgICAgICBcIitGYWNlXCJcbiAgICAgICAgXSxcbiAgICAgICAgXCIrUmFja2V0XCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlciA9IFtcbiAgICBcIkF2YWlsYWJpbGl0eVwiLCBbXG4gICAgICAgIFwiU2hvcFwiLCBbXG4gICAgICAgICAgICBcIitHb2xkXCIsXG4gICAgICAgICAgICBcIitBUFwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitBbGxvdyBnYWNoYVwiLFxuICAgICAgICBcIitHdWFyZGlhblwiLFxuICAgICAgICBcIitVbnRyYWRhYmxlXCIsXG4gICAgICAgIFwiVW5hdmFpbGFibGUgaXRlbXNcIixcbiAgICBdLFxuXTtcblxuY29uc3QgZXhjbHVkZWRfaXRlbV9pZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuZnVuY3Rpb24gYWRkRmlsdGVyVHJlZXMoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFyYWN0ZXJGaWx0ZXJzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIFtcIkFsbFwiLCAuLi5jaGFyYWN0ZXJzXSkge1xuICAgICAgICBjb25zdCBpZCA9IGBjaGFyYWN0ZXJTZWxlY3RvcnNfJHtjaGFyYWN0ZXJ9YDtcbiAgICAgICAgY29uc3QgcmFkaW9fYnV0dG9uID0gY3JlYXRlSFRNTChbXCJpbnB1dFwiLCB7IGlkOiBpZCwgdHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImNoYXJhY3RlclNlbGVjdG9yc1wiLCB2YWx1ZTogY2hhcmFjdGVyIH1dKTtcbiAgICAgICAgcmFkaW9fYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHJhZGlvX2J1dHRvbik7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImxhYmVsXCIsIHsgZm9yOiBpZCB9LCBjaGFyYWN0ZXJdKSk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImJyXCJdKSk7XG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgcmFkaW9fYnV0dG9uLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpbHRlcnM6IFtUcmVlTm9kZSwgc3RyaW5nXVtdID0gW1xuICAgICAgICBbcGFydHNGaWx0ZXIsIFwicGFydHNGaWx0ZXJcIl0sXG4gICAgICAgIFthdmFpbGFiaWxpdHlGaWx0ZXIsIFwiYXZhaWxhYmlsaXR5RmlsdGVyXCJdLFxuICAgIF07XG4gICAgZm9yIChjb25zdCBbZmlsdGVyLCBuYW1lXSBvZiBmaWx0ZXJzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5hbWUpO1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyZWUgPSBtYWtlQ2hlY2tib3hUcmVlKGZpbHRlcik7XG4gICAgICAgIHRyZWUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmlubmVyVGV4dCA9IFwiXCI7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZCh0cmVlKTtcbiAgICB9XG59XG5cbmFkZEZpbHRlclRyZWVzKCk7XG5cbmxldCBkcmFnZ2VkOiBIVE1MRWxlbWVudDtcbmNvbnN0IGRyYWdTZXBhcmF0b3JMaW5lID0gY3JlYXRlSFRNTChbXCJoclwiLCB7IGlkOiBcImRyYWdPdmVyQmFyXCIgfV0pO1xubGV0IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBhcHBseURyYWdEcm9wKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ2dlZCA9IHRhcmdldDtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc05hbWUgPT09IFwiZHJvcHpvbmVcIikge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UmVjdCA9IGV2ZW50LnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIC0gdGFyZ2V0UmVjdC50b3A7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0YXJnZXRSZWN0LmhlaWdodDtcbiAgICAgICAgICAgIGVudW0gUG9zaXRpb24ge1xuICAgICAgICAgICAgICAgIGFib3ZlLFxuICAgICAgICAgICAgICAgIG9uLFxuICAgICAgICAgICAgICAgIGJlbG93LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB5IDwgaGVpZ2h0ICogMC4zID8gUG9zaXRpb24uYWJvdmUgOiB5ID4gaGVpZ2h0ICogMC43ID8gUG9zaXRpb24uYmVsb3cgOiBQb3NpdGlvbi5vbjtcbiAgICAgICAgICAgIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmFib3ZlOlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmJlZm9yZShkcmFnU2VwYXJhdG9yTGluZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYmVsb3c6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuYWZ0ZXIoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLm9uOlxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkID09PSBldmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsICh7IHRhcmdldCB9KSA9PiB7XG4gICAgICAgIGlmICghZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuKSB7XG4gICAgICAgICAgICBkcmFnZ2VkLnJlbW92ZSgpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuYWZ0ZXIoZHJhZ2dlZCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoIShkcm9wVGFyZ2V0IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcm9wVGFyZ2V0LnRleHRDb250ZW50ICs9IGArJHtkcmFnZ2VkLnRleHRDb250ZW50fWA7XG4gICAgICAgICAgICBkcmFnZ2VkLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQgPT09IGRyYWdnZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZHJhZ2dlZC50ZXh0Q29udGVudCEuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgZHJhZ2dlZC50ZXh0Q29udGVudCA9IHN0YXRzLnNoaWZ0KCkhO1xuICAgICAgICAgICAgZHJhZ2dlZC5hZnRlciguLi5zdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcImxpXCIsIHsgY2xhc3M6IFwiZHJvcHpvbmVcIiwgZHJhZ2dhYmxlOiBcInRydWVcIiB9LCBzdGF0XSkpKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbmFwcGx5RHJhZ0Ryb3AoKTtcblxuZnVuY3Rpb24gY29tcGFyZShsaHM6IG51bWJlciwgcmhzOiBudW1iZXIpOiAtMSB8IDAgfCAxIHtcbiAgICBpZiAobGhzID09PSByaHMpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBsaHMgPCByaHMgPyAtMSA6IDE7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk6IENoYXJhY3RlciB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNDaGFyYWN0ZXIoc2VsZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkQ2hhcmFjdGVyKGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgXCJBbGxcIikge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSA9PT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBpdGVtU2VsZWN0b3JzID0gW1wicGFydHNTZWxlY3RvclwiLCBcImdhY2hhU2VsZWN0b3JcIiwgXCJvdGhlckl0ZW1zU2VsZWN0b3JcIl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBJdGVtU2VsZWN0b3IgPSB0eXBlb2YgaXRlbVNlbGVjdG9yc1tudW1iZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbVNlbGVjdG9yKGl0ZW1TZWxlY3Rvcjogc3RyaW5nKTogaXRlbVNlbGVjdG9yIGlzIEl0ZW1TZWxlY3RvciB7XG4gICAgcmV0dXJuIChpdGVtU2VsZWN0b3JzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLmluY2x1ZGVzKGl0ZW1TZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCk6IEl0ZW1TZWxlY3RvciB7XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAocGFydHNTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAoZ2FjaGFTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcImdhY2hhU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgY29uc3Qgb3RoZXJJdGVtc1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdGhlckl0ZW1zU2VsZWN0b3JcIik7XG4gICAgaWYgKCEob3RoZXJJdGVtc1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAob3RoZXJJdGVtc1NlbGVjdG9yLmNoZWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIFwib3RoZXJJdGVtc1NlbGVjdG9yXCI7XG4gICAgfVxuICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbn1cblxuZnVuY3Rpb24gc2F2ZVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCkgfHwgXCJBbGxcIjtcbiAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIkNoYXJhY3RlclwiLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgey8vRmlsdGVyc1xuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpKSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHsgLy9taXNjXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIiwgbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiLCBpdGVtX25hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5kZWxldGVfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiLCBlbmNoYW50VG9nZ2xlLmNoZWNrZWQpO1xuICAgIH1cbiAgICB7IC8vaXRlbSBzZWxlY3Rpb25cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIsIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpO1xuICAgIH1cblxuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiZXhjbHVkZWRfaXRlbV9pZHNcIiwgQXJyYXkuZnJvbShleGNsdWRlZF9pdGVtX2lkcykuam9pbihcIixcIikpO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHN0b3JlZF9jaGFyYWN0ZXIgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIkNoYXJhY3RlclwiKTtcbiAgICBzZXRTZWxlY3RlZENoYXJhY3Rlcih0eXBlb2Ygc3RvcmVkX2NoYXJhY3RlciA9PT0gXCJzdHJpbmdcIiAmJiBpc0NoYXJhY3RlcihzdG9yZWRfY2hhcmFjdGVyKSA/IHN0b3JlZF9jaGFyYWN0ZXIgOiBcIkFsbFwiKTtcblxuICAgIHsvL0ZpbHRlcnNcbiAgICAgICAgbGV0IHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKFZhcmlhYmxlX3N0b3JhZ2UudmFyaWFibGVzKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0LCBzdGF0ZXMpO1xuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgeyAvL21pc2NcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm1heExldmVsXCIpO1xuICAgICAgICBpZiAodHlwZW9mIG1heExldmVsID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBsZXZlbHJhbmdlLnZhbHVlID0gYCR7bWF4TGV2ZWx9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBsZXZlbHJhbmdlLm1heDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1fbmFtZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgbmFtZWZpbHRlci52YWx1ZSA9IGl0ZW1fbmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA9ICEhVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIH1cblxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBsZXQgaXRlbVR5cGVTZWxlY3RvciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtVHlwZVNlbGVjdG9yICE9PSBcInN0cmluZ1wiIHx8ICFpc0l0ZW1TZWxlY3RvcihpdGVtVHlwZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaXRlbVR5cGVTZWxlY3RvciA9IFwicGFydHNTZWxlY3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVR5cGVTZWxlY3Rvcik7XG4gICAgICAgIGlmICghKHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZWN0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhjbHVkZWRfaWRzID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiKTtcbiAgICBpZiAodHlwZW9mIGV4Y2x1ZGVkX2lkcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2lkcy5zcGxpdChcIixcIikpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmFkZChwYXJzZUludChpZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShOYU4pO1xuXG4gICAgLy9tdXN0IGJlIGxhc3QgYmVjYXVzZSBpdCB0cmlnZ2VycyBhIHN0b3JlXG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVzdWx0cygpIHtcbiAgICBzYXZlU2VsZWN0aW9uKCk7XG4gICAgY29uc3QgZmlsdGVyczogKChpdGVtOiBJdGVtKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgY29uc3Qgc291cmNlRmlsdGVyczogKChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgbGV0IHNlbGVjdGVkQ2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB7IC8vY2hhcmFjdGVyIGZpbHRlclxuICAgICAgICBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkQ2hhcmFjdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0uY2hhcmFjdGVyID09PSBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvdGhlckl0ZW1zU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL3BhcnRzIGZpbHRlclxuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzU3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QpO1xuICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IHBhcnRzU3RhdGVzW2l0ZW0ucGFydF0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvdGhlckl0ZW1zU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2F2YWlsYWJpbGl0eSBmaWx0ZXJcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U3RhdGVzID0gZ2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0KTtcbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHb2xkXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiAhaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQVBcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmIGl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVudHJhZGFibGVcIl0pIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ucGFyY2VsX2VuYWJsZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiQWxsb3cgZ2FjaGFcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR3VhcmRpYW5cIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICFpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW5hdmFpbGFibGUgaXRlbXNcIl0pIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlciA9IFsuLi5zb3VyY2VGaWx0ZXJzXTtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbHRlciA9IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlOiBJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VGaWx0ZXIoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBpdGVtU291cmNlLml0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpc0F2YWlsYWJsZVNvdXJjZSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlSXRlbShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtU291cmNlIG9mIGl0ZW0uc291cmNlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpc0F2YWlsYWJsZUl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL21pc2MgZmlsdGVyXG4gICAgICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gcGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSk7XG4gICAgICAgIGZpbHRlcnMucHVzaCgoaXRlbTogSXRlbSkgPT4gaXRlbS5sZXZlbCA8PSBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5uYW1lX2VuLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoaXRlbV9uYW1lLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pZCBmaWx0ZXJcbiAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gIWV4Y2x1ZGVkX2l0ZW1faWRzLmhhcyhpdGVtLmlkKSk7XG4gICAgICAgIGNvbnN0IGl0ZW1GaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpdGVtRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShpdGVtRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuXG4gICAgICAgIH1cbiAgICAgICAgaXRlbUZpbHRlckxpc3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaXRlbV9pZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtcy5nZXQoaWQpO1xuICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICAgICAgICAgICAgICBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsX3JlbW92YWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2lkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYFJlbW92ZSAke2l0ZW0ubmFtZV9lbn0gZnJvbSBleGNsdXNpb25zYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiUmVtb3ZlXCIsXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IGNvbXBhcmF0b3JzOiAoKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBudW1iZXIpW10gPSBbXTtcblxuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5U3RhdHMgPSBBcnJheVxuICAgICAgICAuZnJvbShwcmlvcml0eUxpc3QuY2hpbGROb2RlcylcbiAgICAgICAgLmZpbHRlcihub2RlID0+ICFub2RlLnRleHRDb250ZW50Py5pbmNsdWRlcygnXFxuJykpXG4gICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnRleHRDb250ZW50KVxuICAgICAgICAubWFwKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudCEpO1xuICAgIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gc3RhdC5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBjb21wYXJhdG9ycy5wdXNoKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gY29tcGFyZShcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiBsaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pLFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IHJocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFibGUgPSAoKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHRzVGFibGUoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPT4gZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW0pKSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNvdXJjZSA9PiBzb3VyY2VGaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpLFxuICAgICAgICAgICAgICAgICAgICAoaXRlbXMsIGl0ZW0pID0+IHNlbGVjdEJ5UHJpb3JpdHkoaXRlbXMsIGl0ZW0sIGNvbXBhcmF0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHlTdGF0cyxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEdhY2hhVGFibGUoaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLCBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgICAgICBjYXNlICdvdGhlckl0ZW1zU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFxuICAgICAgICAgICAgICAgICAgICBbXCJ0YWJsZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCBcIlRPRE86IE90aGVyIGl0ZW1zXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRSb3dzID0gdGFibGUudEJvZGllc1swXT8ucm93cy5sZW5ndGggPz8gTWF0aC5tYXgoMCwgdGFibGUucm93cy5sZW5ndGggLSAxKTtcbiAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICBpZiAocmVzdWx0Um93cyA9PT0gMCkge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwicmVzdWx0cy1lbXB0eVwiLCByb2xlOiBcInN0YXR1c1wiIH0sXG4gICAgICAgICAgICBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIsXG4gICAgICAgIF0pKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgaWYgKHJlc3VsdHNTdGF0dXMpIHtcbiAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IHJlc3VsdFJvd3MgPT09IDBcbiAgICAgICAgICAgID8gXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiXG4gICAgICAgICAgICA6IGAke3Jlc3VsdFJvd3N9IG1hdGNoaW5nICR7cmVzdWx0Um93cyA9PT0gMSA/IFwiaXRlbVwiIDogXCJpdGVtc1wifWA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKSB7XG4gICAgY29uc3QgbGV2ZWxEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbERpc3BsYXlcIik7XG4gICAgaWYgKCEobGV2ZWxEaXNwbGF5IGluc3RhbmNlb2YgSFRNTExhYmVsRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGxldmVscmFuZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgbGV2ZWxEaXNwbGF5LnRleHRDb250ZW50ID0gYE1heCBsZXZlbCByZXF1aXJlbWVudDogJHtsZXZlbHJhbmdlLnZhbHVlfWA7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0RGlzcGxheVVwZGF0ZXMoKSB7XG4gICAgc2V0TWF4TGV2ZWxEaXNwbGF5VXBkYXRlKCk7XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbmFtZWZpbHRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdXBkYXRlUmVzdWx0cyk7XG5cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGVuY2hhbnRUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJpb3JpdHlTdGF0Tm9kZXMgPSBBcnJheVxuICAgICAgICAgICAgLmZyb20ocHJpb3JpdHlMaXN0LmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIW5vZGUudGV4dENvbnRlbnQ/LmluY2x1ZGVzKCdcXG4nKSlcbiAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnRleHRDb250ZW50KTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJpb3JpdHlTdGF0Tm9kZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gL14oKD86U3RyKXwoPzpTdGEpfCg/OkRleCl8KD86V2lsbCkpJC8gOiAvXk1heCAoKD86U3RyKXwoPzpTdGEpfCg/OkRleCl8KD86V2lsbCkpJC87XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlciA9IGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA/IFwiTWF4ICQxXCIgOiBcIiQxXCI7XG4gICAgICAgICAgICBub2RlLnRleHRDb250ZW50ID0gbm9kZS50ZXh0Q29udGVudCEuc3BsaXQoXCIrXCIpLm1hcChzID0+IHMucmVwbGFjZShyZWdleCwgcmVwbGFjZXIpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbnNldERpc3BsYXlVcGRhdGVzKCk7XG5cbmZ1bmN0aW9uIHNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCkge1xuICAgIGNvbnN0IGZpbHRlclRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyVG9nZ2xlXCIpO1xuICAgIGNvbnN0IGNsb3NlRmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2VGaWx0ZXJzXCIpO1xuICAgIGNvbnN0IGZpbHRlclBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250cm9sUmFpbFwiKTtcbiAgICBjb25zdCBmaWx0ZXJCYWNrZHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyQmFja2Ryb3BcIik7XG4gICAgaWYgKCEoZmlsdGVyVG9nZ2xlIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoY2xvc2VGaWx0ZXJzIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyUGFuZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShmaWx0ZXJCYWNrZHJvcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvZ2dsZUJ1dHRvbiA9IGZpbHRlclRvZ2dsZTtcbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNsb3NlRmlsdGVycztcbiAgICBjb25zdCBwYW5lbCA9IGZpbHRlclBhbmVsO1xuICAgIGNvbnN0IGJhY2tkcm9wQnV0dG9uID0gZmlsdGVyQmFja2Ryb3A7XG5cbiAgICBmdW5jdGlvbiBzZXRPcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIGAke29wZW59YCk7XG4gICAgICAgIGJhY2tkcm9wQnV0dG9uLmhpZGRlbiA9ICFvcGVuO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJmaWx0ZXJzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICAgICAgaWYgKG5hbWVGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9jdXNBZnRlck9wZW4gPSAoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJvcGVydHlOYW1lICE9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgICAgICBuYW1lRmlsdGVyLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBmb2N1c0FmdGVyT3Blbik7XG4gICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4odHJ1ZSkpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgYmFja2Ryb3BCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4oZmFsc2UpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gXCJUYWJcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gQXJyYXkuZnJvbShwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHN1bW1hcnksIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICAgKSkuZmlsdGVyKGVsZW1lbnQgPT4gZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA+IDApO1xuICAgICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IGxhc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChldmVudC5zaGlmdEtleSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBmaXJzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsYXN0RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFldmVudC5zaGlmdEtleVxuICAgICAgICAgICAgJiYgKCFwYW5lbC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB8fCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBsYXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1pbi13aWR0aDogODgwcHgpXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKHsgbWF0Y2hlcyB9KSA9PiB7XG4gICAgICAgIGlmIChtYXRjaGVzICYmIHBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbnNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIHNldFJlc2V0RmlsdGVyQ29udHJvbCgpIHtcbiAgICBjb25zdCByZXNldEZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0RmlsdGVyc1wiKTtcbiAgICBjb25zdCByZWZpbmVtZW50U3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZpbmVtZW50U3RhdHVzXCIpO1xuICAgIGlmICghKHJlc2V0RmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKHJlZmluZW1lbnRTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNldEZpbHRlcnMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgcmVmaW5lbWVudFN0YXR1cy50ZXh0Q29udGVudCA9IFwiUmVzZXR0aW5nIGZpbHRlcnPigKZcIjtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5jbGVhcl9hbGwoKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xufVxuXG5zZXRSZXNldEZpbHRlckNvbnRyb2woKTtcblxuZnVuY3Rpb24gc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKSB7XG4gICAgY29uc3QgcHJpb3JpdHlfZ3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2dyb3VwXCIpO1xuICAgIGlmICghKHByaW9yaXR5X2dyb3VwIGluc3RhbmNlb2YgSFRNTEZpZWxkU2V0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlciBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBhcnRzU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdhY2hhU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBvdGhlckl0ZW1zU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm90aGVySXRlbXNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShvdGhlckl0ZW1zU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIG90aGVySXRlbXNTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgcHJpb3JpdHlfZ3JvdXAuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICBwYXJ0c0ZpbHRlci5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRzR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik7XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBjb25zdCBsb2FkaW5nTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgY29uc3QgbG9hZGluZ0NvcHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2NvcHkgc3BhblwiKTtcbiAgICBpZiAoIShyZXN1bHRzU3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0xhYmVsIGluc3RhbmNlb2YgSFRNTExhYmVsRWxlbWVudClcbiAgICAgICAgfHwgIShsb2FkaW5nQ29weSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICBzZXRJdGVtVHlwZVNlbGVjdG9yRnVuY3Rpb25hbGl0eSgpO1xuICAgIHJlc3RvcmVTZWxlY3Rpb24oKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkb3dubG9hZEl0ZW1zKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIkl0ZW0gZGF0YSB1bmF2YWlsYWJsZVwiO1xuICAgICAgICBsb2FkaW5nTGFiZWwudGV4dENvbnRlbnQgPSBcIkNvdWxkIG5vdCBsb2FkIGVxdWlwbWVudCBkYXRhXCI7XG4gICAgICAgIGxvYWRpbmdDb3B5LnRleHRDb250ZW50ID0gXCJDaGVjayB0aGUgcHJldmlldyBzZXJ2ZXIgY29ubmVjdGlvbiwgdGhlbiByZWxvYWQgdGhpcyBwYWdlLlwiO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2hvd19hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJoaWRlX2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBtYXhMZXZlbCA9IGdldE1heEl0ZW1MZXZlbCgpO1xuICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHtNYXRoLm1pbihwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKSwgbWF4TGV2ZWwpfWA7XG4gICAgbGV2ZWxyYW5nZS5tYXggPSBgJHttYXhMZXZlbH1gO1xuICAgIGxldmVscmFuZ2UuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgY29uc3Qgc29ydF9oZWxwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9sZWdlbmRcIik7XG4gICAgaWYgKHNvcnRfaGVscCBpbnN0YW5jZW9mIEhUTUxMZWdlbmRFbGVtZW50KSB7XG4gICAgICAgIHNvcnRfaGVscC5hcHBlbmRDaGlsZChjcmVhdGVQb3B1cExpbmsoXCIgKD8pXCIsIGNyZWF0ZUhUTUwoW1wicFwiLFxuICAgICAgICAgICAgXCJSZW9yZGVyIHRoZSBzdGF0cyB0byB5b3VyIGxpa2luZyB0byBhZmZlY3QgdGhlIHJlc3VsdHMgbGlzdC5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIkRyYWcgYSBzdGF0IHVwIG9yIGRvd24gdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBkcmFnIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NOYW1lID09PSBcIml0ZW1fcmVtb3ZhbFwiKSB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmFkZChwYXJzZUludChldmVudC50YXJnZXQuZGF0YXNldC5pdGVtX2luZGV4KSk7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJpdGVtX3JlbW92YWxfcmVtb3ZhbFwiKSB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChldmVudC50YXJnZXQuZGF0YXNldC5pdGVtX2luZGV4KSk7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9XG59KTtcbiIsImV4cG9ydCB0eXBlIFByaW9yaXR5Q29tcGFyYXRvcjxUPiA9IChsaHM6IFQsIHJoczogVCkgPT4gbnVtYmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0QnlQcmlvcml0eTxUPihcbiAgICBjdXJyZW50OiBUW10sXG4gICAgY2FuZGlkYXRlOiBULFxuICAgIGNvbXBhcmF0b3JzOiByZWFkb25seSBQcmlvcml0eUNvbXBhcmF0b3I8VD5bXSxcbik6IFRbXSB7XG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbY2FuZGlkYXRlXTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjb21wYXJhdG9yIG9mIGNvbXBhcmF0b3JzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBhcmF0b3IoY3VycmVudFswXSwgY2FuZGlkYXRlKTtcbiAgICAgICAgaWYgKHJlc3VsdCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbY2FuZGlkYXRlXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0ID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFsuLi5jdXJyZW50LCBjYW5kaWRhdGVdO1xufVxuIiwiZXhwb3J0IHR5cGUgVmFyaWFibGVfc3RvcmFnZV90eXBlcyA9IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW47XG5cbnR5cGUgU3RvcmFnZV92YWx1ZSA9IGAke1wic1wiIHwgXCJuXCIgfCBcImJcIn0ke3N0cmluZ31gO1xuXG5mdW5jdGlvbiB2YXJpYWJsZV90b19zdHJpbmcodmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpOiBTdG9yYWdlX3ZhbHVlIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gYHMke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBgbiR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IFwiYjFcIiA6IFwiYjBcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN0cmluZ190b192YXJpYWJsZSh2djogU3RvcmFnZV92YWx1ZSk6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMge1xuICAgIGNvbnN0IHByZWZpeCA9IHZ2WzBdO1xuICAgIGNvbnN0IHZhbHVlID0gdnYuc3Vic3RyaW5nKDEpO1xuICAgIHN3aXRjaCAocHJlZml4KSB7XG4gICAgICAgIGNhc2UgJ3MnOiAvL3N0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICBjYXNlICduJzogLy9udW1iZXJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgY2FzZSAnYic6IC8vYm9vbGVhblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSBcIjFcIiA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gICAgdGhyb3cgYGludmFsaWQgdmFsdWU6ICR7dnZ9YDtcbn1cblxuZnVuY3Rpb24gaXNfc3RvcmFnZV92YWx1ZShrZXk6IHN0cmluZyk6IGtleSBpcyBTdG9yYWdlX3ZhbHVlIHtcbiAgICByZXR1cm4ga2V5Lmxlbmd0aCA+PSAxICYmIFwic25iXCIuaW5jbHVkZXMoa2V5WzBdKTtcbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlX3N0b3JhZ2Uge1xuICAgIHN0YXRpYyBnZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RvcmVkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHN0b3JlZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nX3RvX3ZhcmlhYmxlKHN0b3JlZCk7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nLCB2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcykge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWAsIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZSkpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVsZXRlX3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgIH1cbiAgICBzdGF0aWMgY2xlYXJfYWxsKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9XG4gICAgc3RhdGljIGdldCB2YXJpYWJsZXMoKSB7XG4gICAgICAgIGxldCByZXN1bHQ6IHsgW2tleTogc3RyaW5nXTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxTdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc3RyaW5nX3RvX3ZhcmlhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0iXX0=
