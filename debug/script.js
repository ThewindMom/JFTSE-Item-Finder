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
exports.shop_items = exports.items = void 0;
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
function deletableItem(name, id) {
  return (0, _html.createHTML)(["div", (0, _html.createHTML)(["button", {
    class: "item_removal",
    "data-item_index": `${id}`,
    "aria-label": `Exclude ${name} from results`,
    type: "button"
  }, "Exclude"]), name]);
}
function createPopupLink(text, content) {
  const button = (0, _html.createHTML)(["button", {
    class: "popup_link",
    type: "button",
    "aria-haspopup": "dialog",
    "aria-expanded": "false"
  }, text]);
  button.addEventListener("click", event => {
    const top_div = document.getElementById("top_div");
    if (!(top_div instanceof HTMLDivElement)) {
      return;
    }
    event.stopPropagation();
    if (dialog) {
      dialog.close();
      dialog.remove();
    }
    const closeButton = (0, _html.createHTML)(["button", {
      type: "button"
    }, "Close"]);
    dialog = Array.isArray(content) ? (0, _html.createHTML)(["dialog", {
      "aria-label": `${text} details`
    }, ...content, closeButton]) : (0, _html.createHTML)(["dialog", {
      "aria-label": `${text} details`
    }, content, closeButton]);
    button.setAttribute("aria-expanded", "true");
    closeButton.addEventListener("click", () => dialog?.close());
    dialog.addEventListener("close", () => {
      button.setAttribute("aria-expanded", "false");
      dialog?.remove();
      dialog = undefined;
      button.focus();
    }, {
      once: true
    });
    top_div.appendChild(dialog);
    dialog.showModal();
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
  const content = character ? (0, _html.createHTML)(["table", ["tr", ["th", "Item"], ["th", "Average Tries"]]]) : (0, _html.createHTML)(["table", ["tr", ["th", "Item"], ["th", "Character"], ["th", "Average Tries"]]]);
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
      }, `${prettyNumber(1 / probability, 2)}`]]));
    } else {
      content.appendChild((0, _html.createHTML)(["tr", item === char_gacha_item ? {
        class: "highlighted"
      } : "", ["td", char_gacha_item.name_en, quantityString(quantity_min, quantity_max)], ["td", char_gacha_item.character || "*"], ["td", {
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
function sourceItemElement(item, itemSource, sourceFilter, character) {
  if (itemSource instanceof GachaItemSource) {
    const char = itemSource.requiresGuardian ? undefined : character;
    const sources = itemSourcesToElementArray(itemSource.item, sourceFilter, character);
    const sourcesList = makeSourcesList(sources);
    return [createGachaSourcePopup(item, itemSource, char), ` x `, createChancePopup(itemSource.gachaTries(item, character)), ...(sourcesList.length > 0 ? [" "] : []), ...sourcesList];
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
function createItemArt(item) {
  const art = itemArtMap.items[`${item.id}`];
  if (!art) {
    return createItemArtFallback(item);
  }
  const [sheet, cell] = art;
  const geometry = itemArtMap.sheets[sheet];
  if (!geometry) {
    return createItemArtFallback(item);
  }
  const column = cell % geometry.lineCount;
  const row = Math.floor(cell / geometry.lineCount);
  const scale = 40 / geometry.size;
  const imageSize = geometry.width * scale;
  const offsetX = -(geometry.space + column * (geometry.size + geometry.space)) * scale;
  const offsetY = -(geometry.space + row * (geometry.size + geometry.space)) * scale;
  return (0, _html.createHTML)(["span", {
    class: "item-art-thumbnail",
    role: "img",
    "aria-label": `Official item art for ${item.name_en}`,
    style: [`--item-art-image:url("/assets/item-art/${encodeURIComponent(sheet)}.webp")`, `--item-art-size:${imageSize}px`, `--item-art-x:${offsetX}px`, `--item-art-y:${offsetY}px`].join(";")
  }]);
}
function itemToTableRow(item, sourceFilter, priorityStats, character) {
  const row = (0, _html.createHTML)(["tr", ["td", {
    class: "Name_column"
  }, deletableItem(item.name_en, item.id)], ["td", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJodG1sLnRzIiwiaXRlbUxvb2t1cC50cyIsIm1haW4udHMiLCJwcmlvcml0eS50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWE7RUFDekMsSUFBSSxFQUFFLFNBQVMsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzFDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO0lBQzNFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDOUM7SUFDSjtJQUNBLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDtJQUNKO0lBQ0EsT0FBTyxLQUFLLENBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUNwQyxNQUFNLENBQUUsQ0FBQyxJQUF5QixDQUFDLFlBQVksYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksZ0JBQWdCLENBQUMsQ0FDMUcsR0FBRyxDQUFDLENBQUMsSUFB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QUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKLEtBQUssT0FBTztjQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssUUFBUTtjQUNULElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUTtjQUNwQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTztjQUNuQjtZQUNKLEtBQUssTUFBTTtjQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTTtjQUNsQjtZQUNKLEtBQUssS0FBSztjQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSztjQUNqQjtZQUNKO2NBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxFQUFFLENBQUM7VUFDbkQ7VUFDQTtRQUNKLEtBQUssT0FBTztVQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUM1QjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssS0FBSztVQUNOLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztVQUMxQjtRQUNKLEtBQUssT0FBTztVQUNS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QUFDLE9BQU8sS0FBSyxRQUFRLEVBQy9CLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQzVCLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQzVCLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQzVCLE9BQU8sR0FBRyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQ2pDLE9BQU8sR0FBRyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQ2pDLE9BQU8sR0FBRyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQ2pDLE9BQU8sR0FBRyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQ2pDLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQzlCLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQzlCLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQzlCLE9BQU8sR0FBRyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQ25DLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQ2hDLE9BQU8sR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQzVCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQ2hDLE9BQU8sR0FBRyxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQ3JDLE9BQU8sR0FBRyxDQUFDLFNBQVMsS0FBSyxRQUFRLEVBQ2pDLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzdCLE9BQU8sR0FBRyxD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LENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDMUMsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDL0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDekI7TUFDSjtNQUNBLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO01BQ3ZDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzNCO01BQ0o7TUFDQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUI7TUFDSjtNQUNBLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7SUFDM0M7SUFDQSxPQUFPLE1BQU07RUFDakI7O0FBQ0gsT0FBQSxDQUFBLGdCQUFBLEdBQUEsZ0JBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IHR5cGUgVHJlZU5vZGUgPSBzdHJpbmcgfCBUcmVlTm9kZVtdO1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogSFRNTElucHV0RWxlbWVudFtdIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGZvciAobGV0IGNoaWxkSW5kZXggPSAwOyBjaGlsZEluZGV4IDwgcGFyZW50X3VsLmNoaWxkcmVuLmxlbmd0aDsgY2hpbGRJbmRleCsrKSB7XG4gICAgICAgIGlmIChwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleF0gIT09IHBhcmVudF9saSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG90ZW50aWFsU2libGluZ0VudHJ5ID0gcGFyZW50X3VsLmNoaWxkcmVuW2NoaWxkSW5kZXggKyAxXT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBvdGVudGlhbFNpYmxpbmdFbnRyeSBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKHBvdGVudGlhbFNpYmxpbmdFbnRyeS5jaGlsZHJlbilcbiAgICAgICAgICAgIC5maWx0ZXIoKGUpOiBlIGlzIEhUTUxMSUVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgZS5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpXG4gICAgICAgICAgICAubWFwKGUgPT4gZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKG5vZGUpKSB7XG4gICAgICAgIGlmIChjaGlsZC5jaGVja2VkICE9PSBub2RlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNoaWxkLmNoZWNrZWQgPSBub2RlLmNoZWNrZWQ7XG4gICAgICAgICAgICBjaGlsZC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgICAgICAgICBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50KG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50IHwgdm9pZCB7XG4gICAgY29uc3QgcGFyZW50X2xpID0gbm9kZS5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF9saSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50X3VsID0gcGFyZW50X2xpLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X3VsIGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY2FuZGlkYXRlOiBIVE1MTElFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50X3VsLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgY2hpbGQuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjYW5kaWRhdGUgPSBjaGlsZDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gcGFyZW50X2xpICYmIGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBbmNlc3RvcnMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKTtcbiAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBmb3VuZENoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRVbmNoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRJbmRldGVybWluYXRlID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGZvdW5kQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkLmluZGV0ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZvdW5kSW5kZXRlcm1pbmF0ZSB8fCBmb3VuZENoZWNrZWQgJiYgZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZENoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB1cGRhdGVBbmNlc3RvcnMocGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVyKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHModGFyZ2V0KTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKHRhcmdldCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcnMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVyKGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlOiBUcmVlTm9kZSk6IEhUTUxMSUVsZW1lbnQge1xuICAgIGlmICh0eXBlb2YgdHJlZU5vZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCIrXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY2hlY2tlZCAmJiB7IGNoZWNrZWQ6IFwiY2hlY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgeyBmb3I6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSB9LFxuICAgICAgICAgICAgICAgIHRyZWVOb2RlXG4gICAgICAgICAgICBdXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNyZWF0ZUhUTUwoW1widWxcIiwgeyBjbGFzczogXCJjaGVja2JveFwiIH1dKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRyZWVOb2RlW2ldO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChtYWtlQ2hlY2tib3hUcmVlTm9kZShub2RlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1wibGlcIiwgbGlzdF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWUodHJlZU5vZGU6IFRyZWVOb2RlKSB7XG4gICAgbGV0IHJvb3QgPSBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZSkuY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocm9vdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgYXBwbHlDaGVja0xpc3RlbmVycyhyb290KTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKHJvb3QpKSB7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIGdldExlYXZlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHJlc3VsdDogSFRNTElucHV0RWxlbWVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oaW5wdXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZ2V0TGVhdmVzKGlucHV0KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildID0gbGVhZi5jaGVja2VkO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50LCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9KSB7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV07XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxlYWYuY2hlY2tlZCA9IHN0YXRlO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxufVxuIiwidHlwZSBUYWdfbmFtZSA9IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcDtcbnR5cGUgQXR0cmlidXRlcyA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG50eXBlIEhUTUxfbm9kZTxUIGV4dGVuZHMgVGFnX25hbWU+ID0gW1QsIC4uLihIVE1MX25vZGU8VGFnX25hbWU+IHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCBBdHRyaWJ1dGVzKVtdXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhUTUw8VCBleHRlbmRzIFRhZ19uYW1lPihub2RlOiBIVE1MX25vZGU8VD4pOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbVF0ge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVbMF0pO1xuICAgIGZ1bmN0aW9uIGhhbmRsZShwYXJhbWV0ZXI6IEF0dHJpYnV0ZXMgfCBIVE1MX25vZGU8VGFnX25hbWU+IHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXIgPT09IFwic3RyaW5nXCIgfHwgcGFyYW1ldGVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHBhcmFtZXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwYXJhbWV0ZXIpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChjcmVhdGVIVE1MKHBhcmFtZXRlcikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVyKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBwYXJhbWV0ZXJba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBub2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhbmRsZShub2RlW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG4iLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IGNvbnN0IGNoYXJhY3RlcnMgPSBbXCJOaWtpXCIsIFwiTHVuTHVuXCIsIFwiTHVjeVwiLCBcIlNodWFcIiwgXCJEaGFucGlyXCIsIFwiUG9jaGlcIiwgXCJBbFwiXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIENoYXJhY3RlciA9IHR5cGVvZiBjaGFyYWN0ZXJzW251bWJlcl07XG5leHBvcnQgZnVuY3Rpb24gaXNDaGFyYWN0ZXIoY2hhcmFjdGVyOiBzdHJpbmcpOiBjaGFyYWN0ZXIgaXMgQ2hhcmFjdGVyIHtcbiAgICByZXR1cm4gKGNoYXJhY3RlcnMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkuaW5jbHVkZXMoY2hhcmFjdGVyKTtcbn1cblxuZXhwb3J0IHR5cGUgUGFydCA9IFwiSGF0XCIgfCBcIkhhaXJcIiB8IFwiRHllXCIgfCBcIlVwcGVyXCIgfCBcIkxvd2VyXCIgfCBcIlNob2VzXCIgfCBcIlNvY2tzXCIgfCBcIkhhbmRcIiB8IFwiQmFja3BhY2tcIiB8IFwiRmFjZVwiIHwgXCJSYWNrZXRcIiB8IFwiT3RoZXJcIjtcblxuZXhwb3J0IGNsYXNzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNob3BfaWQ6IG51bWJlcikgeyB9XG5cbiAgICBnZXQgcmVxdWlyZXNHdWFyZGlhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4udGhpcy5pdGVtLnNvdXJjZXMudmFsdWVzKCldLmV2ZXJ5KHNvdXJjZSA9PiBzb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaXRlbSgpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIGZpbmRpbmcgaXRlbSBvZiBpdGVtU291cmNlICR7dGhpcy5zaG9wX2lkfWApO1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNob3BJdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3Ioc2hvcF9pZDogbnVtYmVyLCByZWFkb25seSBwcmljZTogbnVtYmVyLCByZWFkb25seSBhcDogYm9vbGVhbiwgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSkge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYUl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoc2hvcF9pZCk7XG4gICAgfVxuXG4gICAgZ2FjaGFUcmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghZ2FjaGEpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2FjaGEuYXZlcmFnZV90cmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEd1YXJkaWFuSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBndWFyZGlhbl9tYXA6IHN0cmluZyxcbiAgICAgICAgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSxcbiAgICAgICAgcmVhZG9ubHkgeHA6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmVlZF9ib3NzOiBib29sZWFuLFxuICAgICAgICByZWFkb25seSBib3NzX3RpbWU6IG51bWJlcikge1xuICAgICAgICBzdXBlcihHdWFyZGlhbkl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwX2lkKGd1YXJkaWFuX21hcCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBndWFyZGlhbl9tYXBfaWQobWFwOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5ndWFyZGlhbl9tYXBzLmluZGV4T2YobWFwKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5ndWFyZGlhbl9tYXBzLnB1c2gobWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLWluZGV4O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGd1YXJkaWFuX21hcHMgPSBbXCJcIl07XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVtIHtcbiAgICBpZCA9IDA7XG4gICAgbmFtZV9rciA9IFwiXCI7XG4gICAgbmFtZV9lbiA9IFwiXCI7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgbWF4VXNlID0gMDtcbiAgICBoaWRkZW4gPSBmYWxzZTtcbiAgICByZXNpc3QgPSBcIlwiO1xuICAgIGNoYXJhY3Rlcj86IENoYXJhY3RlcjtcbiAgICBwYXJ0OiBQYXJ0ID0gXCJPdGhlclwiO1xuICAgIGxldmVsID0gMDtcbiAgICBzdHIgPSAwO1xuICAgIHN0YSA9IDA7XG4gICAgZGV4ID0gMDtcbiAgICB3aWwgPSAwO1xuICAgIGhwID0gMDtcbiAgICBxdWlja3Nsb3RzID0gMDtcbiAgICBidWZmc2xvdHMgPSAwO1xuICAgIHNtYXNoID0gMDtcbiAgICBtb3ZlbWVudCA9IDA7XG4gICAgY2hhcmdlID0gMDtcbiAgICBsb2IgPSAwO1xuICAgIHNlcnZlID0gMDtcbiAgICBtYXhfc3RyID0gMDtcbiAgICBtYXhfc3RhID0gMDtcbiAgICBtYXhfZGV4ID0gMDtcbiAgICBtYXhfd2lsID0gMDtcbiAgICBlbGVtZW50X2VuY2hhbnRhYmxlID0gZmFsc2U7XG4gICAgcGFyY2VsX2VuYWJsZWQgPSBmYWxzZTtcbiAgICBwYXJjZWxfZnJvbV9zaG9wID0gZmFsc2U7XG4gICAgc3BpbiA9IDA7XG4gICAgYXRzcyA9IDA7XG4gICAgZGZzcyA9IDA7XG4gICAgc29ja2V0ID0gMDtcbiAgICBnYXVnZSA9IDA7XG4gICAgZ2F1Z2VfYmF0dGxlID0gMDtcbiAgICBzb3VyY2VzOiBJdGVtU291cmNlW10gPSBbXTtcbiAgICBzdGF0RnJvbVN0cmluZyhuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJNb3YgU3BlZWRcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tb3ZlbWVudDtcbiAgICAgICAgICAgIGNhc2UgXCJDaGFyZ2VcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFyZ2U7XG4gICAgICAgICAgICBjYXNlIFwiTG9iXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9iO1xuICAgICAgICAgICAgY2FzZSBcIlNtYXNoXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc21hc2g7XG4gICAgICAgICAgICBjYXNlIFwiU3RyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RyO1xuICAgICAgICAgICAgY2FzZSBcIkRleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRleDtcbiAgICAgICAgICAgIGNhc2UgXCJTdGFcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdGE7XG4gICAgICAgICAgICBjYXNlIFwiV2lsbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndpbDtcbiAgICAgICAgICAgIGNhc2UgXCJNYXggU3RyXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X3N0cjtcbiAgICAgICAgICAgIGNhc2UgXCJNYXggRGV4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X2RleDtcbiAgICAgICAgICAgIGNhc2UgXCJNYXggU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X3N0YTtcbiAgICAgICAgICAgIGNhc2UgXCJNYXggV2lsbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF93aWw7XG4gICAgICAgICAgICBjYXNlIFwiU2VydmVcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXJ2ZTtcbiAgICAgICAgICAgIGNhc2UgXCJRdWlja3Nsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVpY2tzbG90cztcbiAgICAgICAgICAgIGNhc2UgXCJCdWZmc2xvdHNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiSFBcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ocDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBHYWNoYSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pbmRleDogbnVtYmVyLCByZWFkb25seSBnYWNoYV9pbmRleDogbnVtYmVyLCByZWFkb25seSBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgY2hhcmFjdGVycykge1xuICAgICAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLnNldChjaGFyYWN0ZXIsIG5ldyBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+KCkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGQoaXRlbTogSXRlbSwgcHJvYmFiaWxpdHk6IG51bWJlciwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIsIHF1YW50aXR5X21pbjogbnVtYmVyLCBxdWFudGl0eV9tYXg6IG51bWJlcikge1xuICAgICAgICBpZiAoaXRlbS5jaGFyYWN0ZXIgJiYgaXRlbS5jaGFyYWN0ZXIgIT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oYEl0ZW0gJHtpdGVtLmlkfSBmcm9tIGdhY2hhIFwiJHt0aGlzLm5hbWV9XCIgJHt0aGlzLmdhY2hhX2luZGV4fSBoYXMgd3JvbmcgY2hhcmFjdGVyYCk7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBpdGVtLmNoYXJhY3RlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhLnNldChpdGVtLCBbcHJvYmFiaWxpdHksIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XSk7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LnNldChjaGFyYWN0ZXIsIHByb2JhYmlsaXR5ICsgKHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpIHx8IDApKTtcbiAgICB9XG5cbiAgICBhdmVyYWdlX3RyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGNoYXJzOiByZWFkb25seSBDaGFyYWN0ZXJbXSA9IGNoYXJhY3RlciA/IChbY2hhcmFjdGVyXSkgOiBjaGFyYWN0ZXJzO1xuICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgKHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuZ2V0KGl0ZW0pPy5bMF0gfHwgMCksIDApO1xuICAgICAgICBpZiAocHJvYmFiaWxpdHkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsX3Byb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgICAgICByZXR1cm4gdG90YWxfcHJvYmFiaWxpdHkgLyBwcm9iYWJpbGl0eTtcbiAgICB9XG5cbiAgICBnZXQgdG90YWxfcHJvYmFiaWxpdHkoKSB7XG4gICAgICAgIHJldHVybiBjaGFyYWN0ZXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICB9XG5cbiAgICBjaGFyYWN0ZXJfcHJvYmFiaWxpdHkgPSBuZXcgTWFwPENoYXJhY3RlciwgbnVtYmVyPigpO1xuICAgIHNob3BfaXRlbXMgPSBuZXcgTWFwPENoYXJhY3RlciwgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPj4oKTtcbn1cblxuZXhwb3J0IGxldCBpdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xuZXhwb3J0IGxldCBzaG9wX2l0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5sZXQgZ2FjaGFzID0gbmV3IE1hcDxudW1iZXIsIEdhY2hhPigpO1xubGV0IGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQgfCB1bmRlZmluZWQ7XG50eXBlIEl0ZW1BcnRFbnRyeSA9IFtzaGVldDogc3RyaW5nLCBjZWxsOiBudW1iZXJdO1xudHlwZSBJdGVtQXJ0U2hlZXQgPSB7XG4gICAgbGluZUNvdW50OiBudW1iZXI7XG4gICAgc2l6ZTogbnVtYmVyO1xuICAgIHNwYWNlOiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbn07XG50eXBlIEl0ZW1BcnRNYXAgPSB7XG4gICAgaXRlbXM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRFbnRyeT47XG4gICAgc2hlZXRzOiBSZWNvcmQ8c3RyaW5nLCBJdGVtQXJ0U2hlZXQ+O1xufTtcbmxldCBpdGVtQXJ0TWFwOiBJdGVtQXJ0TWFwID0geyBpdGVtczoge30sIHNoZWV0czoge30gfTtcblxuZnVuY3Rpb24gcHJldHR5TnVtYmVyKG46IG51bWJlciwgZGlnaXRzOiBudW1iZXIpIHtcbiAgICBsZXQgcyA9IG4udG9GaXhlZChkaWdpdHMpO1xuICAgIHdoaWxlIChzLmVuZHNXaXRoKFwiMFwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIGlmIChzLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUl0ZW1EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJdGVtcyBmaWxlIGlzIG9ubHkgJHtkYXRhLmxlbmd0aH0gYnl0ZXMgbG9uZ2ApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIHJlc3VsdF0gb2YgZGF0YS5tYXRjaEFsbCgvXFw8SXRlbSAoLiopXFwvXFw+L2cpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSBuZXcgSXRlbTtcbiAgICAgICAgZm9yIChjb25zdCBbLCBhdHRyaWJ1dGUsIHZhbHVlXSBvZiByZXN1bHQubWF0Y2hBbGwoL1xccz8oW149XSopPVwiKFteXCJdKilcIi9nKSkge1xuICAgICAgICAgICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiSW5kZXhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5pZCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIl9OYW1lX1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfa3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk5hbWVfTlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVzZVR5cGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51c2VUeXBlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNYXhVc2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhVc2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJIaWRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaGlkZGVuID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSZXNpc3RcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZXNpc3QgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk5JS0lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTmlraVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVTkxVTlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdW5MdW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVUNZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1Y3lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTSFVBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlNodWFcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJESEFOUElSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkRoYW5waXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQT0NISVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJQb2NoaVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFMXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkFsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBjaGFyYWN0ZXIgXCIke3ZhbHVlfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlBhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQkFHXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJCYWNrcGFja1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkdMQVNTRVNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkZhY2VcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQU5EXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU09DS1NcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNvY2tzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRk9PVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU2hvZXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDQVBcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBBTlRTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJMb3dlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlJBQ0tFVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiUmFja2V0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQk9EWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiVXBwZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQUlSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYWlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRFlFXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJEeWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHBhcnQgJHt2YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTGV2ZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZXZlbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0ciA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0YSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRleCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIldJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLndpbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEhQXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaHAgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRRdWlja1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnF1aWNrc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRCdWZmXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYnVmZnNsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU21hc2hTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNtYXNoID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTW92ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubW92ZW1lbnQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyZ2VzaG90U3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyZ2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMb2JTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxvYiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNlcnZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXJ2ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RyID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0cik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0YSA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX0RFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9kZXggPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9XSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfd2lsID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLndpbCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmNoYW50RWxlbWVudFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuYWJsZVBhcmNlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcmNlbF9lbmFibGVkID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJCYWxsU3BpblwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNwaW4gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBVFNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXRzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRGU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZnNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU29ja2V0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc29ja2V0ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlQmF0dGxlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2VfYmF0dGxlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gaXRlbSBhdHRyaWJ1dGUgXCIke2F0dHJpYnV0ZX1cImApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGl0ZW1zLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgZGVidWdTaG9wUGFyc2luZyA9IGZhbHNlO1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBTaG9wIGZpbGUgaXMgb25seSAke2RhdGEubGVuZ3RofSBieXRlcyBsb25nYCk7XG4gICAgfVxuICAgIGxldCBjdXJyZW50SW5kZXggPSAwO1xuICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgZGF0YS5tYXRjaEFsbCgvPFByb2R1Y3QgRElTUExBWT1cIlxcZCtcIiBISVRfRElTUExBWT1cIlxcZCtcIiBJbmRleD1cIig/PGluZGV4PlxcZCspXCIgRW5hYmxlPVwiKD88ZW5hYmxlZD4wfDEpXCIgTmV3PVwiXFxkK1wiIEhpdD1cIlxcZCtcIiBGcmVlPVwiXFxkK1wiIFNhbGU9XCJcXGQrXCIgRXZlbnQ9XCJcXGQrXCIgQ291cGxlPVwiXFxkK1wiIE5vYnV5PVwiXFxkK1wiIFJhbmQ9XCJbXlwiXStcIiBVc2VUeXBlPVwiW15cIl0rXCIgVXNlMD1cIlxcZCtcIiBVc2UxPVwiXFxkK1wiIFVzZTI9XCJcXGQrXCIgUHJpY2VUeXBlPVwiKD88cHJpY2VfdHlwZT4oPzpNSU5UKXwoPzpHT0xEKSlcIiBPbGRQcmljZTA9XCItP1xcZCtcIiBPbGRQcmljZTE9XCItP1xcZCtcIiBPbGRQcmljZTI9XCItP1xcZCtcIiBQcmljZTA9XCIoPzxwcmljZT4tP1xcZCspXCIgUHJpY2UxPVwiLT9cXGQrXCIgUHJpY2UyPVwiLT9cXGQrXCIgQ291cGxlUHJpY2U9XCItP1xcZCtcIiBDYXRlZ29yeT1cIig/PGNhdGVnb3J5PlteXCJdKilcIiBOYW1lPVwiKD88bmFtZT5bXlwiXSopXCIgR29sZEJhY2s9XCItP1xcZCtcIiBFbmFibGVQYXJjZWw9XCIoPzxwYXJjZWxfZnJvbV9zaG9wPjB8MSlcIiBDaGFyPVwiLT9cXGQrXCIgSXRlbTA9XCIoPzxpdGVtMD4tP1xcZCspXCIgSXRlbTE9XCIoPzxpdGVtMT4tP1xcZCspXCIgSXRlbTI9XCIoPzxpdGVtMj4tP1xcZCspXCIgSXRlbTM9XCIoPzxpdGVtMz4tP1xcZCspXCIgSXRlbTQ9XCIoPzxpdGVtND4tP1xcZCspXCIgSXRlbTU9XCIoPzxpdGVtNT4tP1xcZCspXCIgSXRlbTY9XCIoPzxpdGVtNj4tP1xcZCspXCIgSXRlbTc9XCIoPzxpdGVtNz4tP1xcZCspXCIgSXRlbTg9XCIoPzxpdGVtOD4tP1xcZCspXCIgSXRlbTk9XCIoPzxpdGVtOT4tP1xcZCspXCIgPyg/Okljb249XCJbXlwiXSpcIiA/KT8oPzpOYW1lX2tyPVwiW15cIl0qXCIgPyk/KD86TmFtZV9lbj1cIig/PG5hbWVfZW4+W15cIl0qKVwiID8pPyg/Ok5hbWVfdGg9XCJbXlwiXSpcIiA/KT9cXC8+L2cpKSB7XG4gICAgICAgIGlmICghbWF0Y2guZ3JvdXBzKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pbmRleCk7XG4gICAgICAgIGlmIChjdXJyZW50SW5kZXggKyAxICE9PSBpbmRleCkge1xuICAgICAgICAgICAgZGVidWdTaG9wUGFyc2luZyAmJiBjb25zb2xlLndhcm4oYEZhaWxlZCBwYXJzaW5nIHNob3AgaXRlbSBpbmRleCAke2N1cnJlbnRJbmRleCArIDIgPT09IGluZGV4ID8gY3VycmVudEluZGV4ICsgMSA6IGAke2N1cnJlbnRJbmRleCArIDF9IHRvICR7aW5kZXggLSAxfWB9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBtYXRjaC5ncm91cHMubmFtZTtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBtYXRjaC5ncm91cHMuY2F0ZWdvcnk7XG4gICAgICAgIGlmIChjYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoaW5kZXgsIG5ldyBHYWNoYShpbmRleCwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW0wKSwgbmFtZSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVuYWJsZWQgPSAhIXBhcnNlSW50KG1hdGNoLmdyb3Vwcy5lbmFibGVkKTtcbiAgICAgICAgY29uc3QgcHJpY2VfdHlwZTogXCJhcFwiIHwgXCJnb2xkXCIgfCBcIm5vbmVcIiA9IG1hdGNoLmdyb3Vwcy5wcmljZV90eXBlID09PSBcIk1JTlRcIiA/IFwiYXBcIiA6IG1hdGNoLmdyb3Vwcy5wcmljZV90eXBlID09PSBcIkdPTERcIiA/IFwiZ29sZFwiIDogXCJub25lXCI7XG4gICAgICAgIGNvbnN0IHByaWNlID0gcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnByaWNlKTtcbiAgICAgICAgY29uc3QgcGFyY2VsX2Zyb21fc2hvcCA9ICEhcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnBhcmNlbF9mcm9tX3Nob3ApO1xuICAgICAgICBjb25zdCBpdGVtSURzID0gW1xuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW0wKSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtMSksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTIpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW0zKSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtNCksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTUpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW02KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtNyksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTgpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW05KSxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IGl0ZW1JRHMuZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IFwiUEFSVFNcIikge1xuICAgICAgICAgICAgaWYgKGlubmVyX2l0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGluZGV4LCBpbm5lcl9pdGVtc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSBtYXRjaC5ncm91cHMubmFtZV9lbiB8fCBtYXRjaC5ncm91cHMubmFtZTtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChpbmRleCwgaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBuZXcgU2hvcEl0ZW1Tb3VyY2UoaW5kZXgsIHByaWNlLCBwcmljZV90eXBlID09PSBcImFwXCIsIGlubmVyX2l0ZW1zKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaW5uZXJfaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2goaXRlbVNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNhdGVnb3J5ID09PSBcIkxPVFRFUllcIikge1xuICAgICAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIGdhY2hhSXRlbS5uYW1lX2VuID0gbWF0Y2guZ3JvdXBzLm5hbWVfZW4gfHwgbWF0Y2guZ3JvdXBzLm5hbWU7XG4gICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChpbmRleCwgZ2FjaGFJdGVtKTtcbiAgICAgICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgZ2FjaGFJdGVtLnNvdXJjZXMucHVzaChuZXcgU2hvcEl0ZW1Tb3VyY2UoaW5kZXgsIHByaWNlLCBwcmljZV90eXBlID09PSBcImFwXCIsIGlubmVyX2l0ZW1zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlckl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgb3RoZXJJdGVtLm5hbWVfZW4gPSBtYXRjaC5ncm91cHMubmFtZV9lbiB8fCBtYXRjaC5ncm91cHMubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGluZGV4LCBvdGhlckl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBBcGlJdGVtIHtcbiAgICBwcm9kdWN0SW5kZXggPSAwO1xuICAgIGRpc3BsYXkgPSAwO1xuICAgIGhpdERpc3BsYXkgPSBmYWxzZTtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgdXNlMCA9IDA7XG4gICAgdXNlMSA9IDA7XG4gICAgdXNlMiA9IDA7XG4gICAgcHJpY2VUeXBlID0gXCJHT0xEXCI7XG4gICAgb2xkUHJpY2UwID0gMDtcbiAgICBvbGRQcmljZTEgPSAwO1xuICAgIG9sZFByaWNlMiA9IDA7XG4gICAgcHJpY2UwID0gMDtcbiAgICBwcmljZTEgPSAwO1xuICAgIHByaWNlMiA9IDA7XG4gICAgY291cGxlUHJpY2UgPSAwO1xuICAgIGNhdGVnb3J5ID0gXCJcIjtcbiAgICBuYW1lID0gXCJcIjtcbiAgICBnb2xkQmFjayA9IDA7XG4gICAgZW5hYmxlUGFyY2VsID0gZmFsc2U7XG4gICAgZm9yUGxheWVyID0gMDtcbiAgICBpdGVtMCA9IDA7XG4gICAgaXRlbTEgPSAwO1xuICAgIGl0ZW0yID0gMDtcbiAgICBpdGVtMyA9IDA7XG4gICAgaXRlbTQgPSAwO1xuICAgIGl0ZW01ID0gMDtcbiAgICBpdGVtNiA9IDA7XG4gICAgaXRlbTcgPSAwO1xuICAgIGl0ZW04ID0gMDtcbiAgICBpdGVtOSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzQXBpSXRlbShvYmo6IGFueSk6IG9iaiBpcyBBcGlJdGVtIHtcbiAgICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlb2Ygb2JqLnByb2R1Y3RJbmRleCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5kaXNwbGF5ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmhpdERpc3BsYXkgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmVuYWJsZWQgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UxID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2VUeXBlID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNvdXBsZVByaWNlID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNhdGVnb3J5ID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZ29sZEJhY2sgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlUGFyY2VsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgdHlwZW9mIG9iai5mb3JQbGF5ZXIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTAgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTMgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTQgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTUgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTYgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTcgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTggPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTkgPT09IFwibnVtYmVyXCJcbiAgICBdLmV2ZXJ5KGIgPT4gYik7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXBpU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBhcGlJdGVtIG9mIEpTT04ucGFyc2UoZGF0YSkpIHtcbiAgICAgICAgaWYgKCFpc0FwaUl0ZW0oYXBpSXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEluY29ycmVjdCBmb3JtYXQgb2YgaXRlbTogJHtkYXRhfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IFtcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0xLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTMsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW00LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNSxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTYsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW03LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTksXG4gICAgICAgIF0uZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJQQVJUU1wiKSB7XG4gICAgICAgICAgICBpZiAoaW5uZXJfaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGlubmVyX2l0ZW1zWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXBpSXRlbS5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG5ldyBHYWNoYShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5pdGVtMCwgYXBpSXRlbS5uYW1lKSk7XG4gICAgICAgICAgICBjb25zdCBnYWNoYUl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgZ2FjaGFJdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgZ2FjaGFJdGVtKTtcbiAgICAgICAgICAgIGlmIChhcGlJdGVtLmVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBvdGhlckl0ZW0pO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR2FjaGFEYXRhKGRhdGE6IHN0cmluZywgZ2FjaGE6IEdhY2hhKSB7XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGRhdGEuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgaWYgKCFsaW5lLmluY2x1ZGVzKFwiPExvdHRlcnlJdGVtX1wiKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9cXHMqPExvdHRlcnlJdGVtXyg/PGNoYXJhY3Rlcj5bXiBdKikgSW5kZXg9XCJcXGQrXCIgX05hbWVfPVwiW15cIl0qXCIgU2hvcEluZGV4PVwiKD88c2hvcF9pZD5cXGQrKVwiIFF1YW50aXR5TWluPVwiKD88cXVhbnRpdHlfbWluPlxcZCspXCIgUXVhbnRpdHlNYXg9XCIoPzxxdWFudGl0eV9tYXg+XFxkKylcIiBDaGFuc1Blcj1cIig/PHByb2JhYmlsaXR5PlxcZCtcXC4/XFxkKilcXHMqXCIgRWZmZWN0PVwiXFxkK1wiIFByb2R1Y3RPcHQ9XCJcXGQrXCJcXC8+Lyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHBhcnNpbmcgZ2FjaGEgJHtnYWNoYS5nYWNoYV9pbmRleH06XFxuJHtsaW5lfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGFyYWN0ZXIgPSBtYXRjaC5ncm91cHMuY2hhcmFjdGVyO1xuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBcIkx1bmx1blwiKSB7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7Y2hhcmFjdGVyfVwiIGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5zaG9wX2lkKSk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHNob3AgaXRlbSBpZCAke21hdGNoLmdyb3Vwcy5zaG9wX2lkfSBpbiBsb3R0ZXJ5IGZpbGUgJHtnYWNoYS5nYWNoYV9pbmRleH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGdhY2hhLmFkZChpdGVtLCBwYXJzZUZsb2F0KG1hdGNoLmdyb3Vwcy5wcm9iYWJpbGl0eSksIGNoYXJhY3RlciwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21pbiksIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5xdWFudGl0eV9tYXgpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCBtYXBdIG9mIGdhY2hhLnNob3BfaXRlbXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaXRlbSxdIG9mIG1hcCkge1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2gobmV3IEdhY2hhSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR3VhcmRpYW5EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGd1YXJkaWFuRGF0YSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROdW1iZXIobzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YgbyA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYm9zc1RpbWVJbmZvID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hcEluZm8gb2YgZ3VhcmRpYW5EYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwSW5mbyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFwX25hbWUgPSBtYXBJbmZvLk5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwX25hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJld2FyZHMgPSBBcnJheS5pc0FycmF5KG1hcEluZm8uUmV3YXJkcykgPyBbLi4ubWFwSW5mby5SZXdhcmRzXSA6IFtdO1xuICAgICAgICBjb25zdCByZXdhcmRfaXRlbXMgPSByZXdhcmRzXG4gICAgICAgICAgICAuZmlsdGVyKChzaG9wX2lkKTogc2hvcF9pZCBpcyBudW1iZXIgPT4gdHlwZW9mIHNob3BfaWQgPT09IFwibnVtYmVyXCIgJiYgc2hvcF9pdGVtcy5oYXMoc2hvcF9pZCkpXG4gICAgICAgICAgICAubWFwKHNob3BfaWQgPT4gc2hvcF9pdGVtcy5nZXQoc2hvcF9pZCkhKTtcbiAgICAgICAgY29uc3QgRXhwTXVsdGlwbGllciA9IGdldE51bWJlcihtYXBJbmZvLkV4cE11bHRpcGxpZXIpIHx8IDA7XG4gICAgICAgIGNvbnN0IElzQm9zc1N0YWdlID0gISFtYXBJbmZvLklzQm9zc1N0YWdlO1xuICAgICAgICBjb25zdCBNYXBJRCA9IGdldE51bWJlcihtYXBJbmZvLk1hcElkKSB8fCAwO1xuICAgICAgICBsZXQgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGdldE51bWJlcihtYXBJbmZvLkJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpIHx8IC0xO1xuICAgICAgICBpZiAoQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9PT0gLTEpIHtcbiAgICAgICAgICAgIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPSBib3NzVGltZUluZm8uZ2V0KE1hcElEKSB8fCAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXBJRCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJvc3NUaW1lSW5mby5zZXQoTWFwSUQsIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXdhcmRfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShtYXBfbmFtZSwgcmV3YXJkX2l0ZW1zLCBFeHBNdWx0aXBsaWVyLCBJc0Jvc3NTdGFnZSwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChndWFyZGlhblNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSB1cmwuc2xpY2UodXJsLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gYExvYWRpbmcgJHtmaWxlbmFtZX0sIHBsZWFzZSB3YWl0Li4uYDtcbiAgICB9XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgIGNvbnN0IHByb2dyZXNzYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmVzc2JhclwiKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlKys7XG4gICAgfVxuICAgIGlmICghcmVwbHkub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCBkb3dubG9hZGluZyAke3VybH06ICR7cmVwbHkuc3RhdHVzfSR7cmVwbHkuc3RhdHVzVGV4dCA/IGAgJHtyZXBseS5zdGF0dXNUZXh0fWAgOiBcIlwifWBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcGx5LnRleHQoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkSXRlbXMoKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSAxMjM7XG4gICAgfVxuICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9hdXRoLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzXCI7XG4gICAgY29uc3QgZ2FjaGFTb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9nYW1lLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzL2xvdHRlcnlcIjtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L3NlcnZlci1jb3JlL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBpdGVtVVJMID0gaXRlbVNvdXJjZSArIFwiL0l0ZW1fUGFydHNfSW5pMy54bWxcIjtcbiAgICBjb25zdCBpdGVtRGF0YSA9IGRvd25sb2FkKGl0ZW1VUkwpO1xuICAgIGNvbnN0IGl0ZW1BcnREYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL2l0ZW0tYXJ0LW1hcC5qc29uXCIpO1xuICAgIC8vY29uc3Qgc2hvcFVSTCA9IGl0ZW1Tb3VyY2UgKyBcIi9TaG9wX0luaTMueG1sXCI7XG4gICAgY29uc3QgbWF4X3Nob3BfcGFnZXMgPSAyMDsgLy9jdXJyZW50bHkgbmVlZCBvbmx5IDEwLCBzaG91bGQgYmUgZW5vdWdoXG4gICAgY29uc3Qgc2hvcFVSTCA9IFwiL2FwaS9zaG9wP3NpemU9MTAwMCZwYWdlPVwiO1xuICAgIGNvbnN0IHNob3BEYXRhcyA9IFsuLi5BcnJheShtYXhfc2hvcF9wYWdlcykua2V5cygpXS5tYXAobiA9PiBkb3dubG9hZChgJHtzaG9wVVJMfSR7bn1gKSk7XG4gICAgY29uc3QgZ3VhcmRpYW5VUkwgPSBndWFyZGlhblNvdXJjZSArIFwiL0d1YXJkaWFuU3RhZ2VzLmpzb25cIjtcbiAgICBjb25zdCBndWFyZGlhbkRhdGEgPSBkb3dubG9hZChndWFyZGlhblVSTCk7XG4gICAgcGFyc2VJdGVtRGF0YShhd2FpdCBpdGVtRGF0YSk7XG4gICAgaXRlbUFydE1hcCA9IEpTT04ucGFyc2UoYXdhaXQgaXRlbUFydERhdGEpIGFzIEl0ZW1BcnRNYXA7XG4gICAgLy9wYXJzZVNob3BEYXRhKGF3YWl0IHNob3BEYXRhKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChzaG9wRGF0YXMubWFwKHAgPT4gcC50aGVuKGRhdGEgPT4gcGFyc2VBcGlTaG9wRGF0YShkYXRhKSkpKTtcblxuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSBnYWNoYXMuc2l6ZSArIDM7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhX2l0ZW1zOiBbUHJvbWlzZTxzdHJpbmc+LCBHYWNoYSwgc3RyaW5nXVtdID0gW107XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhX3VybCA9IGAke2dhY2hhU291cmNlfS9JbmkzX0xvdF8ke2Ake2dhY2hhLmdhY2hhX2luZGV4fWAucGFkU3RhcnQoMiwgXCIwXCIpfS54bWxgO1xuICAgICAgICBnYWNoYV9pdGVtcy5wdXNoKFtkb3dubG9hZChnYWNoYV91cmwpLCBnYWNoYSwgZ2FjaGFfdXJsXSk7XG4gICAgfVxuICAgIHBhcnNlR3VhcmRpYW5EYXRhKGF3YWl0IGd1YXJkaWFuRGF0YSk7XG4gICAgZm9yIChjb25zdCBbaXRlbSwgZ2FjaGEsIGdhY2hhX3VybF0gb2YgZ2FjaGFfaXRlbXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBhcnNlR2FjaGFEYXRhKGF3YWl0IGl0ZW0sIGdhY2hhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgZG93bmxvYWRpbmcgJHtnYWNoYV91cmx9IGJlY2F1c2UgJHtlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZWxldGFibGVJdGVtKG5hbWU6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBcIml0ZW1fcmVtb3ZhbFwiLFxuICAgICAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2lkfWAsXG4gICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBFeGNsdWRlICR7bmFtZX0gZnJvbSByZXN1bHRzYCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiRXhjbHVkZVwiLFxuICAgICAgICBdKSxcbiAgICAgICAgbmFtZSxcbiAgICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBvcHVwTGluayh0ZXh0OiBzdHJpbmcsIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcInBvcHVwX2xpbmtcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBcImFyaWEtaGFzcG9wdXBcIjogXCJkaWFsb2dcIixcbiAgICAgICAgICAgIFwiYXJpYS1leHBhbmRlZFwiOiBcImZhbHNlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHRleHQsXG4gICAgXSk7XG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdG9wX2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wX2RpdlwiKTtcbiAgICAgICAgaWYgKCEodG9wX2RpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiAoZGlhbG9nKSB7XG4gICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1wiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiB9LCBcIkNsb3NlXCJdKTtcbiAgICAgICAgZGlhbG9nID0gQXJyYXkuaXNBcnJheShjb250ZW50KVxuICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCB7IFwiYXJpYS1sYWJlbFwiOiBgJHt0ZXh0fSBkZXRhaWxzYCB9LCAuLi5jb250ZW50LCBjbG9zZUJ1dHRvbl0pXG4gICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1wiZGlhbG9nXCIsIHsgXCJhcmlhLWxhYmVsXCI6IGAke3RleHR9IGRldGFpbHNgIH0sIGNvbnRlbnQsIGNsb3NlQnV0dG9uXSk7XG4gICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGRpYWxvZz8uY2xvc2UoKSk7XG4gICAgICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgIGRpYWxvZz8ucmVtb3ZlKCk7XG4gICAgICAgICAgICBkaWFsb2cgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBidXR0b24uZm9jdXMoKTtcbiAgICAgICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICB0b3BfZGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGFuY2VQb3B1cCh0cmllczogbnVtYmVyKSB7XG4gICAgZnVuY3Rpb24gcHJvYmFiaWxpdHlBZnRlck5Ucmllcyhwcm9iYWJpbGl0eTogbnVtYmVyLCB0cmllczogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAxIC0gKE1hdGgucG93KCgxIC0gcHJvYmFiaWxpdHkpLCB0cmllcykpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIk51bWJlciBvZiBnYWNoYXNcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYW5jZSBmb3IgaXRlbVwiXSxcbiAgICAgICAgXSxcbiAgICBdKTtcbiAgICBmb3IgKGNvbnN0IGZhY3RvciBvZiBbMC4xLCAwLjUsIDEsIDIsIDUsIDEwXSkge1xuICAgICAgICBjb25zdCBnYWNoYXMgPSBNYXRoLnJvdW5kKHRyaWVzICogZmFjdG9yKTtcbiAgICAgICAgaWYgKGdhY2hhcyA9PT0gMCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke2dhY2hhc31gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAkeyhwcm9iYWJpbGl0eUFmdGVyTlRyaWVzKDEgLyB0cmllcywgZ2FjaGFzKSAqIDEwMCkudG9GaXhlZCg0KX0lYF0sXG4gICAgICAgIF0pKTtcbiAgICB9XG4gICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcInRyXCJdKSk7XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhgJHtwcmV0dHlOdW1iZXIodHJpZXMsIDIpfWAsIGNvbnRlbnQpO1xufVxuXG5mdW5jdGlvbiBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICBpZiAocXVhbnRpdHlfbWluID09PSAxICYmIHF1YW50aXR5X21heCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gcXVhbnRpdHlfbWF4KSB7XG4gICAgICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9tYXh9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAgeCAke3F1YW50aXR5X21pbn0tJHtxdWFudGl0eV9tYXh9YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTb3VyY2VQb3B1cChpdGVtOiBJdGVtIHwgdW5kZWZpbmVkLCBpdGVtU291cmNlOiBJdGVtU291cmNlLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBjb250ZW50ID0gY2hhcmFjdGVyID8gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJBdmVyYWdlIFRyaWVzXCJdLFxuICAgICAgICBdLFxuICAgIF0pIDogY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFyYWN0ZXJcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkF2ZXJhZ2UgVHJpZXNcIl0sXG4gICAgICAgIF0sXG4gICAgXSk7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgY29uc3QgZ2FjaGFfaXRlbXMgPSBuZXcgTWFwPEl0ZW0sIFtudW1iZXIsIG51bWJlciwgbnVtYmVyXT4oKTtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGl0ZW1fY2hhcmFjdGVyID8gZ2FjaGEuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChpdGVtX2NoYXJhY3RlcikhIDogZ2FjaGEudG90YWxfcHJvYmFiaWxpdHk7XG4gICAgICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IHRpY2tldHMgLyBpdGVtX3RpY2tldHM7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c19wcm9iYWJpbGl0eSA9IGdhY2hhX2l0ZW1zLmdldChjaGFyX2dhY2hhX2l0ZW0pPy5bMF0gfHwgMDtcbiAgICAgICAgICAgIGdhY2hhX2l0ZW1zLnNldChjaGFyX2dhY2hhX2l0ZW0sIFtwcmV2aW91c19wcm9iYWJpbGl0eSArIHByb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbY2hhcl9nYWNoYV9pdGVtLCBbcHJvYmFiaWxpdHksIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgZ2FjaGFfaXRlbXMpIHtcbiAgICAgICAgaWYgKGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgaXRlbSA9PT0gY2hhcl9nYWNoYV9pdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW4sIHF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcigxIC8gcHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgaXRlbSA9PT0gY2hhcl9nYWNoYV9pdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW4sIHF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5jaGFyYWN0ZXIgfHwgXCIqXCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcigxIC8gcHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBnYWNoYS5uYW1lXSksIGNvbnRlbnRdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBjb250ZW50VGFibGUgPSBjcmVhdGVIVE1MKFtcInRhYmxlXCIsIFtcInRyXCIsIFtcInRoXCIsIFwiQ29udGVudHNcIl1dXSk7XG4gICAgZm9yIChjb25zdCBpbm5lcl9pdGVtIG9mIGl0ZW1Tb3VyY2UuaXRlbXMpIHtcbiAgICAgICAgY29udGVudFRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1widHJcIiwgaW5uZXJfaXRlbSA9PT0gaXRlbSA/IHsgY2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIiB9IDogXCJcIiwgW1widGRcIiwgaW5uZXJfaXRlbS5uYW1lX2VuXV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgY29udGVudFRhYmxlXSldKTtcbn1cblxuZnVuY3Rpb24gcHJldHR5VGltZShzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihzZWNvbmRzIC8gNjApfToke2Ake3NlY29uZHMgJSA2MH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBbXG4gICAgICAgIGBHdWFyZGlhbiBtYXAgJHtpdGVtU291cmNlLmd1YXJkaWFuX21hcH1gLFxuICAgICAgICBjcmVhdGVIVE1MKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwidWxcIiwgeyBjbGFzczogXCJsYXlvdXRcIiB9LFxuICAgICAgICAgICAgICAgIFtcImxpXCIsIFwiSXRlbXM6XCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInVsXCIsIHsgY2xhc3M6IFwibGF5b3V0XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLml0ZW1Tb3VyY2UuaXRlbXMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJyLCByZXdhcmRfaXRlbSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy4uLmN1cnIsIGNyZWF0ZUhUTUwoW1wibGlcIiwgeyBjbGFzczogcmV3YXJkX2l0ZW0gPT09IGl0ZW0gPyBcImhpZ2hsaWdodGVkXCIgOiBcIlwiIH0sIHJld2FyZF9pdGVtLm5hbWVfZW5dKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYFJlcXVpcmVzIGJvc3M6ICR7aXRlbVNvdXJjZS5uZWVkX2Jvc3MgPyBcIlllc1wiIDogXCJOb1wifWBdLFxuICAgICAgICAgICAgICAgIC4uLihpdGVtU291cmNlLmJvc3NfdGltZSA+IDAgPyBbY3JlYXRlSFRNTChbXCJsaVwiLCBgQm9zcyB0aW1lOiAke3ByZXR0eVRpbWUoaXRlbVNvdXJjZS5ib3NzX3RpbWUpfWBdKV0gOiBbXSksXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYEVYUCBtdWx0aXBsaWVyOiAke2l0ZW1Tb3VyY2UueHB9YF0sXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICBdO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGNvbnRlbnQpO1xufVxuXG5mdW5jdGlvbiBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICByZXR1cm4gWy4uLml0ZW0uc291cmNlcy52YWx1ZXMoKV1cbiAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgIC5tYXAoaXRlbVNvdXJjZSA9PiBzb3VyY2VJdGVtRWxlbWVudChpdGVtLCBpdGVtU291cmNlLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBtYWtlU291cmNlc0xpc3QobGlzdDogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdW10pOiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10ge1xuICAgIGNvbnN0IHJlc3VsdDogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdID0gW107XG4gICAgZnVuY3Rpb24gYWRkKGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9IHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gKyBlbGVtZW50O1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xuICAgIH1cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgZWxlbWVudHMgb2YgbGlzdCkge1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhZGQoXCIgXCIpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBzb3VyY2VJdGVtRWxlbWVudChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBJdGVtU291cmNlLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10ge1xuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgIGNvbnN0IGNoYXIgPSBpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4gPyB1bmRlZmluZWQgOiBjaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW1Tb3VyY2UuaXRlbSwgc291cmNlRmlsdGVyLCBjaGFyYWN0ZXIpO1xuICAgICAgICBjb25zdCBzb3VyY2VzTGlzdCA9IG1ha2VTb3VyY2VzTGlzdChzb3VyY2VzKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSwgY2hhciksXG4gICAgICAgICAgICBgIHggYCxcbiAgICAgICAgICAgIGNyZWF0ZUNoYW5jZVBvcHVwKGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpKSxcbiAgICAgICAgICAgIC4uLihzb3VyY2VzTGlzdC5sZW5ndGggPiAwID8gW1wiIFwiXSA6IFtdKSxcbiAgICAgICAgICAgIC4uLnNvdXJjZXNMaXN0LFxuICAgICAgICBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgaWYgKGl0ZW1Tb3VyY2UuaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gW2Ake2l0ZW1Tb3VyY2UucHJpY2V9ICR7aXRlbVNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwifWBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtLCBpdGVtU291cmNlKSxcbiAgICAgICAgICAgIGAgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXG4gICAgICAgIF07XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UpXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtOiBJdGVtKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tcIixcbiAgICAgICAgICAgIHJvbGU6IFwiaW1nXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE9mZmljaWFsIGl0ZW0gYXJ0IHVuYXZhaWxhYmxlIGZvciAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICB9LFxuICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1hcnQtZmFsbGJhY2tfX2NvZGVcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBpdGVtLnBhcnQgfHwgXCJJdGVtXCJdLFxuICAgICAgICBbXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9LCBcIk9mZmljaWFsIGFydCB1bmF2YWlsYWJsZVwiXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUFydChpdGVtOiBJdGVtKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIGNvbnN0IFtzaGVldCwgY2VsbF0gPSBhcnQ7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBpdGVtQXJ0TWFwLnNoZWV0c1tzaGVldF07XG4gICAgaWYgKCFnZW9tZXRyeSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW0pO1xuICAgIH1cbiAgICBjb25zdCBjb2x1bW4gPSBjZWxsICUgZ2VvbWV0cnkubGluZUNvdW50O1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoY2VsbCAvIGdlb21ldHJ5LmxpbmVDb3VudCk7XG4gICAgY29uc3Qgc2NhbGUgPSA0MCAvIGdlb21ldHJ5LnNpemU7XG4gICAgY29uc3QgaW1hZ2VTaXplID0gZ2VvbWV0cnkud2lkdGggKiBzY2FsZTtcbiAgICBjb25zdCBvZmZzZXRYID0gLShnZW9tZXRyeS5zcGFjZSArIGNvbHVtbiAqIChnZW9tZXRyeS5zaXplICsgZ2VvbWV0cnkuc3BhY2UpKSAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFkgPSAtKGdlb21ldHJ5LnNwYWNlICsgcm93ICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInNwYW5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1hcnQtdGh1bWJuYWlsXCIsXG4gICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBPZmZpY2lhbCBpdGVtIGFydCBmb3IgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgICAgIHN0eWxlOiBbXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtaW1hZ2U6dXJsKFwiL2Fzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UYWJsZVJvdyhpdGVtOiBJdGVtLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlUm93RWxlbWVudCB7XG4gICAgY29uc3Qgcm93ID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiB9LCBkZWxldGFibGVJdGVtKGl0ZW0ubmFtZV9lbiwgaXRlbS5pZCldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJBcnRfY29sdW1uXCIgfSwgY3JlYXRlSXRlbUFydChpdGVtKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiB9LCBpdGVtLmNoYXJhY3RlciA/PyBcIkFsbFwiXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiUGFydF9jb2x1bW5cIiB9LCBpdGVtLnBhcnRdLFxuICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIHN0YXQuc3BsaXQoXCIrXCIpLm1hcChzID0+IGl0ZW0uc3RhdEZyb21TdHJpbmcocykpLmpvaW4oXCIrXCIpXSkpLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke2l0ZW0ubGV2ZWx9YF0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlNvdXJjZV9jb2x1bW5cIiB9LCAuLi5tYWtlU291cmNlc0xpc3QoaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgcmV0dXJuIHJvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhY2hhVGFibGUoZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbiwgY2hhcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiIH0sIFwiTmFtZVwiXSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgXVxuICAgICk7XG4gICAgZm9yIChjb25zdCBbLCBnYWNoYV0gb2YgZ2FjaGFzKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IHNob3BfaXRlbXMuZ2V0KGdhY2hhLnNob3BfaW5kZXgpO1xuICAgICAgICBpZiAoIWdhY2hhSXRlbSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXIoZ2FjaGFJdGVtKSkge1xuICAgICAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiLCBbXCJ0ZFwiLCBjcmVhdGVHYWNoYVNvdXJjZVBvcHVwKHVuZGVmaW5lZCwgbmV3IEl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCksIGNoYXIpXV0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXN1bHRzVGFibGUoXG4gICAgZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbixcbiAgICBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLFxuICAgIHByaW9yaXplcjogKGl0ZW1zOiBJdGVtW10sIGl0ZW06IEl0ZW0pID0+IEl0ZW1bXSxcbiAgICBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSxcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCByZXN1bHRzOiB7IFtrZXk6IHN0cmluZ106IEl0ZW1bXSB9ID0ge1xuICAgICAgICBcIkhhdFwiOiBbXSxcbiAgICAgICAgXCJIYWlyXCI6IFtdLFxuICAgICAgICBcIkR5ZVwiOiBbXSxcbiAgICAgICAgXCJVcHBlclwiOiBbXSxcbiAgICAgICAgXCJMb3dlclwiOiBbXSxcbiAgICAgICAgXCJTaG9lc1wiOiBbXSxcbiAgICAgICAgXCJTb2Nrc1wiOiBbXSxcbiAgICAgICAgXCJIYW5kXCI6IFtdLFxuICAgICAgICBcIkJhY2twYWNrXCI6IFtdLFxuICAgICAgICBcIkZhY2VcIjogW10sXG4gICAgICAgIFwiUmFja2V0XCI6IFtdLFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChmaWx0ZXIoaXRlbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdHNbaXRlbS5wYXJ0XSA9IHByaW9yaXplcihyZXN1bHRzW2l0ZW0ucGFydF0sIGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFibGUgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0YWJsZVwiLFxuICAgICAgICAgICAgW1wiY2FwdGlvblwiLCBcIkJlc3QgbWF0Y2hpbmcgZXF1aXBtZW50IGJ5IHNsb3QgYW5kIHNlbGVjdGVkIHN0YXQgcHJpb3JpdHlcIl0sXG4gICAgICAgICAgICBbXCJ0aGVhZFwiLFxuICAgICAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJBcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkNoYXJhY3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJQYXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlBhcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlSFRNTChbXCJ0aFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgc3RhdF0pKSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJMZXZlbF9jb2x1bW4gbnVtZXJpY1wiLCBzY29wZTogXCJjb2xcIiB9LCBcIkxldmVsXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlNvdXJjZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJTb3VyY2VcIl0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXCJ0Ym9keVwiXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgY29uc3QgdGFibGVCb2R5ID0gdGFibGUudEJvZGllc1swXTtcbiAgICBpZiAoIXRhYmxlQm9keSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgdHlwZSBNYXBPcHRpb25zID0geyBba2V5OiBzdHJpbmddOiBudW1iZXJbXSB9O1xuXG4gICAgdHlwZSBDb3N0ID0ge1xuICAgICAgICBnb2xkOiBudW1iZXIsXG4gICAgICAgIGFwOiBudW1iZXIsXG4gICAgICAgIG1hcHM6IE1hcE9wdGlvbnMsXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNvbWJpbmVNYXBzKG0xOiBNYXBPcHRpb25zLCBtMjogTWFwT3B0aW9ucyk6IE1hcE9wdGlvbnMge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7IC4uLm0xIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcCwgdHJpZXNdIG9mIE9iamVjdC5lbnRyaWVzKG0yKSkge1xuICAgICAgICAgICAgaWYgKHJlc3VsdFttYXBdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSByZXN1bHRbbWFwXS5jb25jYXQodHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSB0cmllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbWJpbmVDb3N0cyhjb3N0MTogQ29zdCwgY29zdDI6IENvc3QpOiBDb3N0IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQgKyBjb3N0Mi5nb2xkLFxuICAgICAgICAgICAgYXA6IGNvc3QxLmFwICsgY29zdDIuYXAsXG4gICAgICAgICAgICBtYXBzOiBjb21iaW5lTWFwcyhjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5NYXAobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAodHJpZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdFttYXBdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSBbTWF0aC5taW4ocmVzdWx0W21hcF1bMF0sIHRyaWVzWzBdKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWluQ29zdChjb3N0MTogQ29zdCwgY29zdDI6IENvc3QpOiBDb3N0IHtcbiAgICAgICAgcmV0dXJuIFtjb3N0MS5hcCwgY29zdDEuZ29sZF0gPCBbY29zdDEuYXAsIGNvc3QxLmdvbGRdID9cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnb2xkOiBjb3N0MS5nb2xkLFxuICAgICAgICAgICAgICAgIGFwOiBjb3N0MS5hcCxcbiAgICAgICAgICAgICAgICBtYXBzOiBtaW5NYXAoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgICAgICB9IDpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnb2xkOiBjb3N0Mi5nb2xkLFxuICAgICAgICAgICAgICAgIGFwOiBjb3N0Mi5hcCxcbiAgICAgICAgICAgICAgICBtYXBzOiBtaW5NYXAoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvc3RPZihpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBDb3N0IHtcbiAgICAgICAgcmV0dXJuIFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgICAgIC5yZWR1Y2UoKGN1cnIsIGl0ZW1Tb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3N0ID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UuYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogaXRlbVNvdXJjZS5wcmljZSwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGdvbGQ6IGl0ZW1Tb3VyY2UucHJpY2UsIGFwOiAwLCBtYXBzOiB7fSB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpbmdsZUNvc3QgPSBjb3N0T2YoaXRlbVNvdXJjZS5pdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb2xkOiBzaW5nbGVDb3N0LmdvbGQgKiBtdWx0aXBsaWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwOiBzaW5nbGVDb3N0LmFwICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBzOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHNpbmdsZUNvc3QubWFwcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFttYXAsIHRyaWVzXSkgPT4gW21hcCwgdHJpZXMubWFwKG4gPT4gbiAqIG11bHRpcGxpZXIpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBzOiBPYmplY3QuZnJvbUVudHJpZXMoW1tpdGVtU291cmNlLmd1YXJkaWFuX21hcCwgW2l0ZW1Tb3VyY2UuaXRlbXMubGVuZ3RoXV1dKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1pbkNvc3QoY3VyciwgY29zdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHsgZ29sZDogMCwgYXA6IDAsIG1hcHM6IHt9IH1cbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGlzdGljcyA9IHtcbiAgICAgICAgY2hhcmFjdGVyczogbmV3IFNldDxDaGFyYWN0ZXI+LFxuICAgICAgICAuLi5wcmlvcml0eVN0YXRzLnJlZHVjZSgoY3Vyciwgc3RhdCkgPT4gKHsgLi4uY3VyciwgW3N0YXRdOiAwIH0pLCB7fSksXG4gICAgICAgIExldmVsOiAwLFxuICAgICAgICBjb3N0OiB7IGFwOiAwLCBnb2xkOiAwLCBtYXBzOiB7fSB9IGFzIENvc3QsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIE9iamVjdC52YWx1ZXMocmVzdWx0cykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0aXN0aWNzW3N0YXRdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLnJlZHVjZSgoY3Vyciwgc3RhdE5hbWUpID0+IGN1cnIgKyByZXN1bHRbMF0uc3RhdEZyb21TdHJpbmcoc3RhdE5hbWUpLCAwKTtcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgc3RhdGlzdGljc1tzdGF0XSArPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpc3RpY3MuTGV2ZWwgPSBNYXRoLm1heChyZXN1bHRbMF0ubGV2ZWwsIHN0YXRpc3RpY3MuTGV2ZWwpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXN1bHQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hhciBvZiBpdGVtLmNoYXJhY3RlciA/IFtpdGVtLmNoYXJhY3Rlcl0gOiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGlzdGljcy5jaGFyYWN0ZXJzLmFkZChjaGFyKVxuICAgICAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmRDaGlsZChpdGVtVG9UYWJsZVJvdyhpdGVtLCBzb3VyY2VGaWx0ZXIsIHByaW9yaXR5U3RhdHMsIGNoYXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRpc3RpY3MuY29zdCA9IGNvbWJpbmVDb3N0cyhjb3N0T2YoaXRlbSwgY2hhcmFjdGVyICYmIGlzQ2hhcmFjdGVyKGNoYXJhY3RlcikgPyBjaGFyYWN0ZXIgOiB1bmRlZmluZWQpLCBzdGF0aXN0aWNzLmNvc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpc3RpY3MuY2hhcmFjdGVycy5zaXplID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsX3NvdXJjZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuZ29sZCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuZ29sZC50b0ZpeGVkKDApfSBHb2xkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5hcCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuYXAudG9GaXhlZCgwKX0gQVBgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0YXRpc3RpY3NbJ0d1YXJkaWFuIGdhbWVzJ10uZm9yRWFjaCgoY291bnQsIG1hcCkgPT4gdG90YWxfc291cmNlcy5wdXNoKGAke2NvdW50LnRvRml4ZWQoMCl9IHggJHttYXB9YCkpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidGZvb3RcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBOYW1lX2NvbHVtblwiIH0sIFwiVG90YWw6XCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQ2hhcmFjdGVyX2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgUGFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBudW1lcmljXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGAke3N0YXRpc3RpY3Nbc3RhdF19YFxuICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIExldmVsX2NvbHVtbiBudW1lcmljXCIgfSwgYCR7c3RhdGlzdGljcy5MZXZlbH1gXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIFNvdXJjZV9jb2x1bW5cIiB9LCB0b3RhbF9zb3VyY2VzLmpvaW4oXCIsIFwiKV0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29sdW1uX2VsZW1lbnQgb2YgdGFibGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgQ2hhcmFjdGVyX2NvbHVtbmApKSB7XG4gICAgICAgICAgICBpZiAoIShjb2x1bW5fZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29sdW1uX2VsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIGlmIChzdGF0aXN0aWNzW2F0dHJpYnV0ZV0gPT09IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sdW1uX2VsZW1lbnQgb2YgdGFibGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgJHthdHRyaWJ1dGV9X2NvbHVtbmApKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF4SXRlbUxldmVsKCkge1xuICAgIC8vbm8gcmVkdWNlIGZvciBNYXA/XG4gICAgbGV0IG1heCA9IDA7XG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBtYXggPSBNYXRoLm1heChtYXgsIGl0ZW0ubGV2ZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbWF4O1xufVxuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGRpYWxvZyAmJiBkaWFsb2cgPT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICB9XG59KTtcbiIsImltcG9ydCB7IG1ha2VDaGVja2JveFRyZWUsIFRyZWVOb2RlLCBnZXRMZWFmU3RhdGVzLCBzZXRMZWFmU3RhdGVzIH0gZnJvbSAnLi9jaGVja2JveFRyZWUnO1xuaW1wb3J0IHsgY3JlYXRlUG9wdXBMaW5rLCBkb3dubG9hZEl0ZW1zLCBnZXRSZXN1bHRzVGFibGUsIEl0ZW0sIEl0ZW1Tb3VyY2UsIGdldE1heEl0ZW1MZXZlbCwgaXRlbXMsIENoYXJhY3RlciwgY2hhcmFjdGVycywgaXNDaGFyYWN0ZXIsIFNob3BJdGVtU291cmNlLCBHYWNoYUl0ZW1Tb3VyY2UsIGdldEdhY2hhVGFibGUgfSBmcm9tICcuL2l0ZW1Mb29rdXAnO1xuaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQgeyBzZWxlY3RCeVByaW9yaXR5IH0gZnJvbSAnLi9wcmlvcml0eSc7XG5pbXBvcnQgeyBWYXJpYWJsZV9zdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlJztcblxuY29uc3QgcGFydHNGaWx0ZXIgPSBbXG4gICAgXCJQYXJ0c1wiLCBbXG4gICAgICAgIFwiSGVhZFwiLCBbXG4gICAgICAgICAgICBcIitIYXRcIixcbiAgICAgICAgICAgIFwiK0hhaXJcIixcbiAgICAgICAgICAgIFwiRHllXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1VwcGVyXCIsXG4gICAgICAgIFwiK0xvd2VyXCIsXG4gICAgICAgIFwiTGVnc1wiLCBbXG4gICAgICAgICAgICBcIitTaG9lc1wiLFxuICAgICAgICAgICAgXCJTb2Nrc1wiLFxuICAgICAgICBdLFxuICAgICAgICBcIkF1eFwiLCBbXG4gICAgICAgICAgICBcIitIYW5kXCIsXG4gICAgICAgICAgICBcIitCYWNrcGFja1wiLFxuICAgICAgICAgICAgXCIrRmFjZVwiXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1JhY2tldFwiLFxuICAgIF0sXG5dO1xuXG5jb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXIgPSBbXG4gICAgXCJBdmFpbGFiaWxpdHlcIiwgW1xuICAgICAgICBcIlNob3BcIiwgW1xuICAgICAgICAgICAgXCIrR29sZFwiLFxuICAgICAgICAgICAgXCIrQVBcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrQWxsb3cgZ2FjaGFcIixcbiAgICAgICAgXCIrR3VhcmRpYW5cIixcbiAgICAgICAgXCIrVW50cmFkYWJsZVwiLFxuICAgICAgICBcIlVuYXZhaWxhYmxlIGl0ZW1zXCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGV4Y2x1ZGVkX2l0ZW1faWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbmZ1bmN0aW9uIGFkZEZpbHRlclRyZWVzKCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcmFjdGVyRmlsdGVyc1wiKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGNoYXJhY3RlciBvZiBbXCJBbGxcIiwgLi4uY2hhcmFjdGVyc10pIHtcbiAgICAgICAgY29uc3QgaWQgPSBgY2hhcmFjdGVyU2VsZWN0b3JzXyR7Y2hhcmFjdGVyfWA7XG4gICAgICAgIGNvbnN0IHJhZGlvX2J1dHRvbiA9IGNyZWF0ZUhUTUwoW1wiaW5wdXRcIiwgeyBpZDogaWQsIHR5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIiwgdmFsdWU6IGNoYXJhY3RlciB9XSk7XG4gICAgICAgIHJhZGlvX2J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdXBkYXRlUmVzdWx0cyk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChyYWRpb19idXR0b24pO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJsYWJlbFwiLCB7IGZvcjogaWQgfSwgY2hhcmFjdGVyXSkpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJiclwiXSkpO1xuICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgIHJhZGlvX2J1dHRvbi5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaWx0ZXJzOiBbVHJlZU5vZGUsIHN0cmluZ11bXSA9IFtcbiAgICAgICAgW3BhcnRzRmlsdGVyLCBcInBhcnRzRmlsdGVyXCJdLFxuICAgICAgICBbYXZhaWxhYmlsaXR5RmlsdGVyLCBcImF2YWlsYWJpbGl0eUZpbHRlclwiXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgW2ZpbHRlciwgbmFtZV0gb2YgZmlsdGVycykge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuYW1lKTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmVlID0gbWFrZUNoZWNrYm94VHJlZShmaWx0ZXIpO1xuICAgICAgICB0cmVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdXBkYXRlUmVzdWx0cyk7XG4gICAgICAgIHRhcmdldC5pbm5lclRleHQgPSBcIlwiO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQodHJlZSk7XG4gICAgfVxufVxuXG5hZGRGaWx0ZXJUcmVlcygpO1xuXG5sZXQgZHJhZ2dlZDogSFRNTEVsZW1lbnQ7XG5jb25zdCBkcmFnU2VwYXJhdG9yTGluZSA9IGNyZWF0ZUhUTUwoW1wiaHJcIiwgeyBpZDogXCJkcmFnT3ZlckJhclwiIH1dKTtcbmxldCBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gYXBwbHlEcmFnRHJvcCgpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsICh7IHRhcmdldCB9KSA9PiB7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdnZWQgPSB0YXJnZXQ7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NOYW1lID09PSBcImRyb3B6b25lXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSBldmVudC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCB5ID0gZXZlbnQuY2xpZW50WSAtIHRhcmdldFJlY3QudG9wO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGFyZ2V0UmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICBlbnVtIFBvc2l0aW9uIHtcbiAgICAgICAgICAgICAgICBhYm92ZSxcbiAgICAgICAgICAgICAgICBvbixcbiAgICAgICAgICAgICAgICBiZWxvdyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0geSA8IGhlaWdodCAqIDAuMyA/IFBvc2l0aW9uLmFib3ZlIDogeSA+IGhlaWdodCAqIDAuNyA/IFBvc2l0aW9uLmJlbG93IDogUG9zaXRpb24ub247XG4gICAgICAgICAgICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5hYm92ZTpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5iZWZvcmUoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmJlbG93OlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmFmdGVyKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5vbjpcbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZCA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAoIWRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbikge1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmFmdGVyKGRyYWdnZWQpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgY29uc3QgZHJvcFRhcmdldCA9IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKCEoZHJvcFRhcmdldCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZHJvcFRhcmdldC50ZXh0Q29udGVudCArPSBgKyR7ZHJhZ2dlZC50ZXh0Q29udGVudH1gO1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0ID09PSBkcmFnZ2VkKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGRyYWdnZWQudGV4dENvbnRlbnQhLnNwbGl0KFwiK1wiKTtcbiAgICAgICAgICAgIGRyYWdnZWQudGV4dENvbnRlbnQgPSBzdGF0cy5zaGlmdCgpITtcbiAgICAgICAgICAgIGRyYWdnZWQuYWZ0ZXIoLi4uc3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlSFRNTChbXCJsaVwiLCB7IGNsYXNzOiBcImRyb3B6b25lXCIsIGRyYWdnYWJsZTogXCJ0cnVlXCIgfSwgc3RhdF0pKSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5hcHBseURyYWdEcm9wKCk7XG5cbmZ1bmN0aW9uIGNvbXBhcmUobGhzOiBudW1iZXIsIHJoczogbnVtYmVyKTogLTEgfCAwIHwgMSB7XG4gICAgaWYgKGxocyA9PT0gcmhzKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gbGhzIDwgcmhzID8gLTEgOiAxO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RlZENoYXJhY3RlcigpOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jaGVja2VkKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzQ2hhcmFjdGVyKHNlbGVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRTZWxlY3RlZENoYXJhY3RlcihjaGFyYWN0ZXI6IENoYXJhY3RlciB8IFwiQWxsXCIpIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIik7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGNoYXJhY3RlckZpbHRlckxpc3QpIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUgPT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgaXRlbVNlbGVjdG9ycyA9IFtcInBhcnRzU2VsZWN0b3JcIiwgXCJnYWNoYVNlbGVjdG9yXCIsIFwib3RoZXJJdGVtc1NlbGVjdG9yXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgSXRlbVNlbGVjdG9yID0gdHlwZW9mIGl0ZW1TZWxlY3RvcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1TZWxlY3RvcihpdGVtU2VsZWN0b3I6IHN0cmluZyk6IGl0ZW1TZWxlY3RvciBpcyBJdGVtU2VsZWN0b3Ige1xuICAgIHJldHVybiAoaXRlbVNlbGVjdG9ycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhpdGVtU2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtVHlwZVNlbGVjdGlvbigpOiBJdGVtU2VsZWN0b3Ige1xuICAgIGNvbnN0IHBhcnRzU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzU2VsZWN0b3JcIik7XG4gICAgaWYgKCEocGFydHNTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKHBhcnRzU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGdhY2hhU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhY2hhU2VsZWN0b3JcIik7XG4gICAgaWYgKCEoZ2FjaGFTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKGdhY2hhU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJnYWNoYVNlbGVjdG9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG90aGVySXRlbXNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3RoZXJJdGVtc1NlbGVjdG9yXCIpO1xuICAgIGlmICghKG90aGVySXRlbXNTZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgaWYgKG90aGVySXRlbXNTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcIm90aGVySXRlbXNTZWxlY3RvclwiO1xuICAgIH1cbiAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG59XG5cbmZ1bmN0aW9uIHNhdmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRDaGFyYWN0ZXIgPSBnZXRTZWxlY3RlZENoYXJhY3RlcigpIHx8IFwiQWxsXCI7XG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJDaGFyYWN0ZXJcIiwgc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgIHsvL0ZpbHRlcnNcbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0KSkpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0KSkpIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB7IC8vbWlzY1xuICAgICAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpO1xuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIm1heExldmVsXCIsIG1heExldmVsKTtcblxuICAgICAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBuYW1lZmlsdGVyLnZhbHVlO1xuICAgICAgICBpZiAoaXRlbV9uYW1lKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIiwgaXRlbV9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuZGVsZXRlX3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgICAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIiwgZW5jaGFudFRvZ2dsZS5jaGVja2VkKTtcbiAgICB9XG4gICAgeyAvL2l0ZW0gc2VsZWN0aW9uXG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiLCBnZXRJdGVtVHlwZVNlbGVjdGlvbigpKTtcbiAgICB9XG5cbiAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcImV4Y2x1ZGVkX2l0ZW1faWRzXCIsIEFycmF5LmZyb20oZXhjbHVkZWRfaXRlbV9pZHMpLmpvaW4oXCIsXCIpKTtcbn1cblxuZnVuY3Rpb24gcmVzdG9yZVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzdG9yZWRfY2hhcmFjdGVyID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJDaGFyYWN0ZXJcIik7XG4gICAgc2V0U2VsZWN0ZWRDaGFyYWN0ZXIodHlwZW9mIHN0b3JlZF9jaGFyYWN0ZXIgPT09IFwic3RyaW5nXCIgJiYgaXNDaGFyYWN0ZXIoc3RvcmVkX2NoYXJhY3RlcikgPyBzdG9yZWRfY2hhcmFjdGVyIDogXCJBbGxcIik7XG5cbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhWYXJpYWJsZV9zdG9yYWdlLnZhcmlhYmxlcykpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0LCBzdGF0ZXMpO1xuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIHsgLy9taXNjXG4gICAgICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heExldmVsID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXhMZXZlbCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGAke21heExldmVsfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXZlbHJhbmdlLnZhbHVlID0gbGV2ZWxyYW5nZS5tYXg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtX25hbWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIG5hbWVmaWx0ZXIudmFsdWUgPSBpdGVtX25hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgICAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPSAhIVZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICB9XG5cbiAgICB7IC8vaXRlbSBzZWxlY3Rpb25cbiAgICAgICAgbGV0IGl0ZW1UeXBlU2VsZWN0b3IgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVR5cGVTZWxlY3RvciAhPT0gXCJzdHJpbmdcIiB8fCAhaXNJdGVtU2VsZWN0b3IoaXRlbVR5cGVTZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGl0ZW1UeXBlU2VsZWN0b3IgPSBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW1UeXBlU2VsZWN0b3IpO1xuICAgICAgICBpZiAoIShzZWxlY3RvciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0b3IuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHNlbGVjdG9yLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IHRydWUgfSkpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4Y2x1ZGVkX2lkcyA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiZXhjbHVkZWRfaXRlbV9pZHNcIik7XG4gICAgaWYgKHR5cGVvZiBleGNsdWRlZF9pZHMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBleGNsdWRlZF9pZHMuc3BsaXQoXCIsXCIpKSB7XG4gICAgICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoaWQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleGNsdWRlZF9pdGVtX2lkcy5kZWxldGUoTmFOKTtcblxuICAgIC8vbXVzdCBiZSBsYXN0IGJlY2F1c2UgaXQgdHJpZ2dlcnMgYSBzdG9yZVxuICAgIGxldmVscmFuZ2UuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVJlc3VsdHMoKSB7XG4gICAgc2F2ZVNlbGVjdGlvbigpO1xuICAgIGNvbnN0IGZpbHRlcnM6ICgoaXRlbTogSXRlbSkgPT4gYm9vbGVhbilbXSA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZUZpbHRlcnM6ICgoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbilbXSA9IFtdO1xuICAgIGxldCBzZWxlY3RlZENoYXJhY3RlcjogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgeyAvL2NoYXJhY3RlciBmaWx0ZXJcbiAgICAgICAgc2VsZWN0ZWRDaGFyYWN0ZXIgPSBnZXRTZWxlY3RlZENoYXJhY3RlcigpO1xuICAgICAgICBzd2l0Y2ggKGdldEl0ZW1UeXBlU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BhcnRzU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZENoYXJhY3Rlcikge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLmNoYXJhY3RlciA9PT0gc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnb3RoZXJJdGVtc1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9wYXJ0cyBmaWx0ZXJcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0c1N0YXRlcyA9IGdldExlYWZTdGF0ZXMocGFydHNGaWx0ZXJMaXN0KTtcbiAgICAgICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBwYXJ0c1N0YXRlc1tpdGVtLnBhcnRdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnb3RoZXJJdGVtc1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9hdmFpbGFiaWxpdHkgZmlsdGVyXG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVN0YXRlcyA9IGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCk7XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR29sZFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgIWl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFQXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiBpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbnRyYWRhYmxlXCJdKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLnBhcmNlbF9lbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFsbG93IGdhY2hhXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkd1YXJkaWFuXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVuYXZhaWxhYmxlIGl0ZW1zXCJdKSB7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIgPSBbLi4uc291cmNlRmlsdGVyc107XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VGaWx0ZXIgPSAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlRmlsdGVyKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVTb3VyY2UpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW0oaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbVNvdXJjZSBvZiBpdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9taXNjIGZpbHRlclxuICAgICAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpO1xuICAgICAgICBmaWx0ZXJzLnB1c2goKGl0ZW06IEl0ZW0pID0+IGl0ZW0ubGV2ZWwgPD0gbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ubmFtZV9lbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGl0ZW1fbmFtZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vaWQgZmlsdGVyXG4gICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+ICFleGNsdWRlZF9pdGVtX2lkcy5oYXMoaXRlbS5pZCkpO1xuICAgICAgICBjb25zdCBpdGVtRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXRlbUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEoaXRlbUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcblxuICAgICAgICB9XG4gICAgICAgIGl0ZW1GaWx0ZXJMaXN0LnJlcGxhY2VDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2l0ZW1faWRzKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gaXRlbXMuZ2V0KGlkKTtcbiAgICAgICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbUZpbHRlckxpc3QuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4sXG4gICAgICAgICAgICAgICAgY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBSZW1vdmUgJHtpdGVtLm5hbWVfZW59IGZyb20gZXhjbHVzaW9uc2AsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIlJlbW92ZVwiLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBjb21wYXJhdG9yczogKChsaHM6IEl0ZW0sIHJoczogSXRlbSkgPT4gbnVtYmVyKVtdID0gW107XG5cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eVN0YXRzID0gQXJyYXlcbiAgICAgICAgLmZyb20ocHJpb3JpdHlMaXN0LmNoaWxkTm9kZXMpXG4gICAgICAgIC5maWx0ZXIobm9kZSA9PiAhbm9kZS50ZXh0Q29udGVudD8uaW5jbHVkZXMoJ1xcbicpKVxuICAgICAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudClcbiAgICAgICAgLm1hcChub2RlID0+IG5vZGUudGV4dENvbnRlbnQhKTtcbiAgICB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RhdCBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXQuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgY29tcGFyYXRvcnMucHVzaCgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IGNvbXBhcmUoXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gbGhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKSxcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiByaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0c1RhYmxlKFxuICAgICAgICAgICAgICAgICAgICBpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UgPT4gc291cmNlRmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW1Tb3VyY2UpKSxcbiAgICAgICAgICAgICAgICAgICAgKGl0ZW1zLCBpdGVtKSA9PiBzZWxlY3RCeVByaW9yaXR5KGl0ZW1zLCBpdGVtLCBjb21wYXJhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5U3RhdHMsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRHYWNoYVRhYmxlKGl0ZW0gPT4gZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW0pKSwgc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgICAgICAgICAgY2FzZSAnb3RoZXJJdGVtc1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChcbiAgICAgICAgICAgICAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgXCJUT0RPOiBPdGhlciBpdGVtc1wiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0Um93cyA9IHRhYmxlLnRCb2RpZXNbMF0/LnJvd3MubGVuZ3RoID8/IE1hdGgubWF4KDAsIHRhYmxlLnJvd3MubGVuZ3RoIC0gMSk7XG4gICAgdGFyZ2V0LmlubmVyVGV4dCA9IFwiXCI7XG4gICAgaWYgKHJlc3VsdFJvd3MgPT09IDApIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcInJlc3VsdHMtZW1wdHlcIiwgcm9sZTogXCJzdGF0dXNcIiB9LFxuICAgICAgICAgICAgXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiLFxuICAgICAgICBdKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQodGFibGUpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRzU3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzU3RhdHVzXCIpO1xuICAgIGlmIChyZXN1bHRzU3RhdHVzKSB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSByZXN1bHRSb3dzID09PSAwXG4gICAgICAgICAgICA/IFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIlxuICAgICAgICAgICAgOiBgJHtyZXN1bHRSb3dzfSBtYXRjaGluZyAke3Jlc3VsdFJvd3MgPT09IDEgPyBcIml0ZW1cIiA6IFwiaXRlbXNcIn1gO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0TWF4TGV2ZWxEaXNwbGF5VXBkYXRlKCkge1xuICAgIGNvbnN0IGxldmVsRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxEaXNwbGF5XCIpO1xuICAgIGlmICghKGxldmVsRGlzcGxheSBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBsZXZlbHJhbmdlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgIGxldmVsRGlzcGxheS50ZXh0Q29udGVudCA9IGBNYXggbGV2ZWwgcmVxdWlyZW1lbnQ6ICR7bGV2ZWxyYW5nZS52YWx1ZX1gO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldERpc3BsYXlVcGRhdGVzKCkge1xuICAgIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpO1xuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIG5hbWVmaWx0ZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuXG4gICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICBpZiAoIShlbmNoYW50VG9nZ2xlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBlbmNoYW50VG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByaW9yaXR5U3RhdE5vZGVzID0gQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKHByaW9yaXR5TGlzdC5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgLmZpbHRlcihub2RlID0+ICFub2RlLnRleHRDb250ZW50Py5pbmNsdWRlcygnXFxuJykpXG4gICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS50ZXh0Q29udGVudCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHByaW9yaXR5U3RhdE5vZGVzKSB7XG4gICAgICAgICAgICBjb25zdCByZWdleCA9IGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA/IC9eKCg/OlN0cil8KD86U3RhKXwoPzpEZXgpfCg/OldpbGwpKSQvIDogL15NYXggKCg/OlN0cil8KD86U3RhKXwoPzpEZXgpfCg/OldpbGwpKSQvO1xuICAgICAgICAgICAgY29uc3QgcmVwbGFjZXIgPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyBcIk1heCAkMVwiIDogXCIkMVwiO1xuICAgICAgICAgICAgbm9kZS50ZXh0Q29udGVudCA9IG5vZGUudGV4dENvbnRlbnQhLnNwbGl0KFwiK1wiKS5tYXAocyA9PiBzLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VyKSkuam9pbihcIitcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5zZXREaXNwbGF5VXBkYXRlcygpO1xuXG5mdW5jdGlvbiBzZXRNb2JpbGVGaWx0ZXJDb250cm9scygpIHtcbiAgICBjb25zdCBmaWx0ZXJUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlclRvZ2dsZVwiKTtcbiAgICBjb25zdCBjbG9zZUZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlRmlsdGVyc1wiKTtcbiAgICBjb25zdCBmaWx0ZXJQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbFJhaWxcIik7XG4gICAgY29uc3QgZmlsdGVyQmFja2Ryb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlckJhY2tkcm9wXCIpO1xuICAgIGlmICghKGZpbHRlclRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGNsb3NlRmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlclBhbmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyQmFja2Ryb3AgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b2dnbGVCdXR0b24gPSBmaWx0ZXJUb2dnbGU7XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjbG9zZUZpbHRlcnM7XG4gICAgY29uc3QgcGFuZWwgPSBmaWx0ZXJQYW5lbDtcbiAgICBjb25zdCBiYWNrZHJvcEJ1dHRvbiA9IGZpbHRlckJhY2tkcm9wO1xuXG4gICAgZnVuY3Rpb24gc2V0T3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICB0b2dnbGVCdXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBgJHtvcGVufWApO1xuICAgICAgICBiYWNrZHJvcEJ1dHRvbi5oaWRkZW4gPSAhb3BlbjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZmlsdGVycy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgY29uc3QgbmFtZUZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgICAgIGlmIChuYW1lRmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIG5hbWVGaWx0ZXIuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbi5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKHRydWUpKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGJhY2tkcm9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgIT09IFwiVGFiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IEFycmF5LmZyb20ocGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzdW1tYXJ5LCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICkpLmZpbHRlcihlbGVtZW50ID0+IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBsYXN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZmlyc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGFzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZXZlbnQuc2hpZnRLZXlcbiAgICAgICAgICAgICYmICghcGFuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgfHwgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gbGFzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmlyc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3aW5kb3cubWF0Y2hNZWRpYShcIihtaW4td2lkdGg6IDg4MHB4KVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICh7IG1hdGNoZXMgfSkgPT4ge1xuICAgICAgICBpZiAobWF0Y2hlcyAmJiBwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5zZXRNb2JpbGVGaWx0ZXJDb250cm9scygpO1xuXG5mdW5jdGlvbiBzZXRSZXNldEZpbHRlckNvbnRyb2woKSB7XG4gICAgY29uc3QgcmVzZXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldEZpbHRlcnNcIik7XG4gICAgY29uc3QgcmVmaW5lbWVudFN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmaW5lbWVudFN0YXR1c1wiKTtcbiAgICBpZiAoIShyZXNldEZpbHRlcnMgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShyZWZpbmVtZW50U3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzZXRGaWx0ZXJzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHJlZmluZW1lbnRTdGF0dXMudGV4dENvbnRlbnQgPSBcIlJlc2V0dGluZyBmaWx0ZXJz4oCmXCI7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuY2xlYXJfYWxsKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn1cblxuc2V0UmVzZXRGaWx0ZXJDb250cm9sKCk7XG5cbmZ1bmN0aW9uIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCkge1xuICAgIGNvbnN0IHByaW9yaXR5X2dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9ncm91cFwiKTtcbiAgICBpZiAoIShwcmlvcml0eV9ncm91cCBpbnN0YW5jZW9mIEhUTUxGaWVsZFNldEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik7XG4gICAgaWYgKCEocGFydHNGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYXJ0c1NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnYWNoYVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb3RoZXJJdGVtc1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvdGhlckl0ZW1zU2VsZWN0b3JcIik7XG4gICAgaWYgKCEob3RoZXJJdGVtc1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBvdGhlckl0ZW1zU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0c0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzX2dyb3VwXCIpO1xuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgY29uc3QgbG9hZGluZ0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdDb3B5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19jb3B5IHNwYW5cIik7XG4gICAgaWYgKCEocmVzdWx0c1N0YXR1cyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdMYWJlbCBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0NvcHkgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcInRydWVcIik7XG4gICAgc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKTtcbiAgICByZXN0b3JlU2VsZWN0aW9uKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZG93bmxvYWRJdGVtcygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID0gXCJJdGVtIGRhdGEgdW5hdmFpbGFibGVcIjtcbiAgICAgICAgbG9hZGluZ0xhYmVsLnRleHRDb250ZW50ID0gXCJDb3VsZCBub3QgbG9hZCBlcXVpcG1lbnQgZGF0YVwiO1xuICAgICAgICBsb2FkaW5nQ29weS50ZXh0Q29udGVudCA9IFwiQ2hlY2sgdGhlIHByZXZpZXcgc2VydmVyIGNvbm5lY3Rpb24sIHRoZW4gcmVsb2FkIHRoaXMgcGFnZS5cIjtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNob3dfYWZ0ZXJfbG9hZFwiKSkge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiaGlkZV9hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbWF4TGV2ZWwgPSBnZXRNYXhJdGVtTGV2ZWwoKTtcbiAgICBsZXZlbHJhbmdlLnZhbHVlID0gYCR7TWF0aC5taW4ocGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSksIG1heExldmVsKX1gO1xuICAgIGxldmVscmFuZ2UubWF4ID0gYCR7bWF4TGV2ZWx9YDtcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgc3RhdCB1cCBvciBkb3duIHRvIGNoYW5nZSBpdHMgaW1wb3J0YW5jZSAoZm9yIGV4YW1wbGUgZHJhZyBMb2IgYWJvdmUgQ2hhcmdlKS5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIkRyYWcgYSBzdGF0IG9udG8gYW5vdGhlciB0byBjb21iaW5lIHRoZW0gKGZvciBleGFtcGxlIFN0ciBvbnRvIERleCwgdGhlIHJlc3VsdHMgd2lsbCBkaXNwbGF5IFN0citEZXgpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIGNvbWJpbmVkIHN0YXQgb250byBpdHNlbGYgdG8gc2VwYXJhdGUgdGhlbS5cIl0pKSk7XG4gICAgfVxufSk7XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJpdGVtX3JlbW92YWxcIikge1xuICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldC5jbGFzc05hbWUgPT09IFwiaXRlbV9yZW1vdmFsX3JlbW92YWxcIikge1xuICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5kZWxldGUocGFyc2VJbnQoZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdEJ5UHJpb3JpdHk8VD4oXG4gICAgY3VycmVudDogVFtdLFxuICAgIGNhbmRpZGF0ZTogVCxcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBUW10ge1xuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgfVxuICAgIGZvciAoY29uc3QgY29tcGFyYXRvciBvZiBjb21wYXJhdG9ycykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wYXJhdG9yKGN1cnJlbnRbMF0sIGNhbmRpZGF0ZSk7XG4gICAgICAgIGlmIChyZXN1bHQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3VsdCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbLi4uY3VycmVudCwgY2FuZGlkYXRlXTtcbn1cbiIsImV4cG9ydCB0eXBlIFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMgPSBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuO1xuXG50eXBlIFN0b3JhZ2VfdmFsdWUgPSBgJHtcInNcIiB8IFwiblwiIHwgXCJiXCJ9JHtzdHJpbmd9YDtcblxuZnVuY3Rpb24gdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKTogU3RvcmFnZV92YWx1ZSB7XG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgcmV0dXJuIGBzJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gYG4ke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBcImIxXCIgOiBcImIwXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdHJpbmdfdG9fdmFyaWFibGUodnY6IFN0b3JhZ2VfdmFsdWUpOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIHtcbiAgICBjb25zdCBwcmVmaXggPSB2dlswXTtcbiAgICBjb25zdCB2YWx1ZSA9IHZ2LnN1YnN0cmluZygxKTtcbiAgICBzd2l0Y2ggKHByZWZpeCkge1xuICAgICAgICBjYXNlICdzJzogLy9zdHJpbmdcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgY2FzZSAnbic6IC8vbnVtYmVyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGNhc2UgJ2InOiAvL2Jvb2xlYW5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gXCIxXCIgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIHRocm93IGBpbnZhbGlkIHZhbHVlOiAke3Z2fWA7XG59XG5cbmZ1bmN0aW9uIGlzX3N0b3JhZ2VfdmFsdWUoa2V5OiBzdHJpbmcpOiBrZXkgaXMgU3RvcmFnZV92YWx1ZSB7XG4gICAgcmV0dXJuIGtleS5sZW5ndGggPj0gMSAmJiBcInNuYlwiLmluY2x1ZGVzKGtleVswXSk7XG59XG5cbmV4cG9ydCBjbGFzcyBWYXJpYWJsZV9zdG9yYWdlIHtcbiAgICBzdGF0aWMgZ2V0X3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgICAgICBpZiAodHlwZW9mIHN0b3JlZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZShzdG9yZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ190b192YXJpYWJsZShzdG9yZWQpO1xuICAgIH1cbiAgICBzdGF0aWMgc2V0X3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZywgdmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gLCB2YXJpYWJsZV90b19zdHJpbmcodmFsdWUpKTtcbiAgICB9XG4gICAgc3RhdGljIGRlbGV0ZV92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICB9XG4gICAgc3RhdGljIGNsZWFyX2FsbCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgdmFyaWFibGVzKCkge1xuICAgICAgICBsZXQgcmVzdWx0OiB7IFtrZXk6IHN0cmluZ106IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMgfSA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHN0cmluZ190b192YXJpYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59Il19
