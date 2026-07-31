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
  let candidate;
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
  let count = 0;
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
    count++;
  }
  console.log(`Found ${count} shop items`);
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
    alert(`Oops, something broke. Complain to Lilli/Kanone/XxharCs about:\nFailed downloading ${url} because of ${reply.status}${reply.statusText ? " " + reply.status : ""}.`);
    if (url.endsWith(".json")) {
      return "[]";
    } else if (url.endsWith(".xml")) {
      return "<_></_>";
    }
    return "";
  }
  return reply.text();
}
async function downloadItems() {
  const progressbar = document.getElementById("progressbar");
  if (progressbar instanceof HTMLProgressElement) {
    progressbar.value = 0;
    progressbar.max = 122;
  }
  const itemSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/auth-server/src/main/resources/res";
  const gachaSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/game-server/src/main/resources/res/lottery";
  const guardianSource = "https://raw.githubusercontent.com/sstokic-tgm/JFTSE/development/server-core/src/main/resources/res";
  const itemURL = itemSource + "/Item_Parts_Ini3.xml";
  const itemData = download(itemURL);
  //const shopURL = itemSource + "/Shop_Ini3.xml";
  const max_shop_pages = 20; //currently need only 10, should be enough
  const shopURL = "https://jftse.com/jftse-restservice/api/shop?size=1000&page=";
  const shopDatas = [...Array(max_shop_pages).keys()].map(n => download(`${shopURL}${n}`));
  const guardianURL = guardianSource + "/GuardianStages.json";
  const guardianData = download(guardianURL);
  parseItemData(await itemData);
  //parseShopData(await shopData);
  await Promise.all(shopDatas.map(p => p.then(data => parseApiShopData(data))));
  console.log(`Found ${gachas.size} gachas`);
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
  console.log(`Loaded ${items.size} items`);
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
  }, "[N/A]"], ["span", {
    "aria-hidden": "true"
  }, "Official art unavailable"]]);
}
function itemToTableRow(item, sourceFilter, priorityStats, character) {
  const row = (0, _html.createHTML)(["tr", ["td", {
    class: "Name_column"
  }, deletableItem(item.name_en, item.id)], ["td", {
    class: "Art_column"
  }, createItemArtFallback(item)], ["td", {
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
  const filterPanel = document.getElementById("filter_group");
  const filterBackdrop = document.getElementById("filterBackdrop");
  if (!(filterToggle instanceof HTMLButtonElement) || !(closeFilters instanceof HTMLButtonElement) || !(filterPanel instanceof HTMLFieldSetElement) || !(filterBackdrop instanceof HTMLButtonElement)) {
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
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
    }
  });
  window.matchMedia("(min-width: 768px)").addEventListener("change", ({
    matches
  }) => {
    if (matches && panel.classList.contains("is-open")) {
      setOpen(false);
    }
  });
}
setMobileFilterControls();
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
  resultsGroup?.setAttribute("aria-busy", "true");
  setItemTypeSelectorFunctionality();
  restoreSelection();
  await (0, _itemLookup.downloadItems)();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJodG1sLnRzIiwiaXRlbUxvb2t1cC50cyIsIm1haW4udHMiLCJwcmlvcml0eS50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTs7RUFFYixNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsYUFBYTtFQUN6QyxJQUFJLEVBQUUsU0FBUyxZQUFZLGdCQUFnQixDQUFDLEVBQUU7SUFDMUMsT0FBTyxFQUFFOztFQUViLEtBQUssSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtJQUMzRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxFQUFFO01BQzlDOztJQUVKLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDs7SUFFSixPQUFPLEtBQUssQ0FDUCxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQ3BDLE1BQU0sQ0FBRSxDQUFDLElBQXlCLENBQUMsWUFBWSxhQUFhLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxnQkFBZ0IsQ0FBQyxDQUMxRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFR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QUcsS0FBSyxRQUFRLEVBQUU7UUFDekI7O01BRUosTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDdkMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0I7O01BRUosSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzFCOztNQUVKLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7O0lBRTNDLE9BQU8sTUFBTTtFQUNqQjs7QUFDSCxPQUFBLENBQUEsZ0JBQUEsR0FBQSxnQkFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgdHlwZSBUcmVlTm9kZSA9IHN0cmluZyB8IFRyZWVOb2RlW107XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50W10ge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgZm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBwYXJlbnRfdWwuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcbiAgICAgICAgaWYgKHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4XSAhPT0gcGFyZW50X2xpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3RlbnRpYWxTaWJsaW5nRW50cnkgPSBwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleCArIDFdPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocG90ZW50aWFsU2libGluZ0VudHJ5IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheVxuICAgICAgICAgICAgLmZyb20ocG90ZW50aWFsU2libGluZ0VudHJ5LmNoaWxkcmVuKVxuICAgICAgICAgICAgLmZpbHRlcigoZSk6IGUgaXMgSFRNTExJRWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudClcbiAgICAgICAgICAgIC5tYXAoZSA9PiBlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4obm9kZSkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQgIT09IG5vZGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hpbGQuY2hlY2tlZCA9IG5vZGUuY2hlY2tlZDtcbiAgICAgICAgICAgIGNoaWxkLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnQobm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnQgfCB2b2lkIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYW5kaWRhdGU6IEhUTUxMSUVsZW1lbnQgfCB2b2lkO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50X3VsLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgY2hpbGQuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjYW5kaWRhdGUgPSBjaGlsZDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gcGFyZW50X2xpICYmIGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBbmNlc3RvcnMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKTtcbiAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBmb3VuZENoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRVbmNoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRJbmRldGVybWluYXRlID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGZvdW5kQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkLmluZGV0ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZvdW5kSW5kZXRlcm1pbmF0ZSB8fCBmb3VuZENoZWNrZWQgJiYgZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZENoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB1cGRhdGVBbmNlc3RvcnMocGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVyKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHModGFyZ2V0KTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKHRhcmdldCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcnMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVyKGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlOiBUcmVlTm9kZSk6IEhUTUxMSUVsZW1lbnQge1xuICAgIGlmICh0eXBlb2YgdHJlZU5vZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCIrXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY2hlY2tlZCAmJiB7IGNoZWNrZWQ6IFwiY2hlY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgeyBmb3I6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSB9LFxuICAgICAgICAgICAgICAgIHRyZWVOb2RlXG4gICAgICAgICAgICBdXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNyZWF0ZUhUTUwoW1widWxcIiwgeyBjbGFzczogXCJjaGVja2JveFwiIH1dKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRyZWVOb2RlW2ldO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChtYWtlQ2hlY2tib3hUcmVlTm9kZShub2RlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1wibGlcIiwgbGlzdF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWUodHJlZU5vZGU6IFRyZWVOb2RlKSB7XG4gICAgbGV0IHJvb3QgPSBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZSkuY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocm9vdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgYXBwbHlDaGVja0xpc3RlbmVycyhyb290KTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKHJvb3QpKSB7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIGdldExlYXZlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHJlc3VsdDogSFRNTElucHV0RWxlbWVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oaW5wdXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZ2V0TGVhdmVzKGlucHV0KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildID0gbGVhZi5jaGVja2VkO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50LCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9KSB7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV07XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxlYWYuY2hlY2tlZCA9IHN0YXRlO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxufSIsInR5cGUgVGFnX25hbWUgPSBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA7XG50eXBlIEF0dHJpYnV0ZXMgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xudHlwZSBIVE1MX25vZGU8VCBleHRlbmRzIFRhZ19uYW1lPiA9IFtULCAuLi4oSFRNTF9ub2RlPFRhZ19uYW1lPiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgQXR0cmlidXRlcylbXV07XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIVE1MPFQgZXh0ZW5kcyBUYWdfbmFtZT4obm9kZTogSFRNTF9ub2RlPFQ+KTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW1RdIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlWzBdKTtcbiAgICBmdW5jdGlvbiBoYW5kbGUocGFyYW1ldGVyOiBBdHRyaWJ1dGVzIHwgSFRNTF9ub2RlPFRhZ19uYW1lPiB8IEhUTUxFbGVtZW50IHwgc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyID09PSBcInN0cmluZ1wiIHx8IHBhcmFtZXRlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChwYXJhbWV0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1ldGVyKSkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoY3JlYXRlSFRNTChwYXJhbWV0ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgcGFyYW1ldGVyW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBoYW5kbGUobm9kZVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xufVxuIiwiaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5cbmV4cG9ydCBjb25zdCBjaGFyYWN0ZXJzID0gW1wiTmlraVwiLCBcIkx1bkx1blwiLCBcIkx1Y3lcIiwgXCJTaHVhXCIsIFwiRGhhbnBpclwiLCBcIlBvY2hpXCIsIFwiQWxcIl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBDaGFyYWN0ZXIgPSB0eXBlb2YgY2hhcmFjdGVyc1tudW1iZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2hhcmFjdGVyKGNoYXJhY3Rlcjogc3RyaW5nKTogY2hhcmFjdGVyIGlzIENoYXJhY3RlciB7XG4gICAgcmV0dXJuIChjaGFyYWN0ZXJzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLmluY2x1ZGVzKGNoYXJhY3Rlcik7XG59XG5cbmV4cG9ydCB0eXBlIFBhcnQgPSBcIkhhdFwiIHwgXCJIYWlyXCIgfCBcIkR5ZVwiIHwgXCJVcHBlclwiIHwgXCJMb3dlclwiIHwgXCJTaG9lc1wiIHwgXCJTb2Nrc1wiIHwgXCJIYW5kXCIgfCBcIkJhY2twYWNrXCIgfCBcIkZhY2VcIiB8IFwiUmFja2V0XCIgfCBcIk90aGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBzaG9wX2lkOiBudW1iZXIpIHsgfVxuXG4gICAgZ2V0IHJlcXVpcmVzR3VhcmRpYW4oKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gWy4uLnRoaXMuaXRlbS5zb3VyY2VzLnZhbHVlcygpXS5ldmVyeShzb3VyY2UgPT4gc291cmNlLnJlcXVpcmVzR3VhcmRpYW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGl0ZW0oKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBzaG9wX2l0ZW1zLmdldCh0aGlzLnNob3BfaWQpO1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCBmaW5kaW5nIGl0ZW0gb2YgaXRlbVNvdXJjZSAke3RoaXMuc2hvcF9pZH1gKTtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaG9wSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlciwgcmVhZG9ubHkgcHJpY2U6IG51bWJlciwgcmVhZG9ubHkgYXA6IGJvb2xlYW4sIHJlYWRvbmx5IGl0ZW1zOiBJdGVtW10pIHtcbiAgICAgICAgc3VwZXIoc2hvcF9pZCk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FjaGFJdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3Ioc2hvcF9pZDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cblxuICAgIGdhY2hhVHJpZXMoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldCh0aGlzLnNob3BfaWQpO1xuICAgICAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdhY2hhLmF2ZXJhZ2VfdHJpZXMoaXRlbSwgY2hhcmFjdGVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHdWFyZGlhbkl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgZ3VhcmRpYW5fbWFwOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IGl0ZW1zOiBJdGVtW10sXG4gICAgICAgIHJlYWRvbmx5IHhwOiBudW1iZXIsXG4gICAgICAgIHJlYWRvbmx5IG5lZWRfYm9zczogYm9vbGVhbixcbiAgICAgICAgcmVhZG9ubHkgYm9zc190aW1lOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoR3VhcmRpYW5JdGVtU291cmNlLmd1YXJkaWFuX21hcF9pZChndWFyZGlhbl9tYXApKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ3VhcmRpYW5fbWFwX2lkKG1hcDogc3RyaW5nKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5pbmRleE9mKG1hcCk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5ndWFyZGlhbl9tYXBzLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuZ3VhcmRpYW5fbWFwcy5wdXNoKG1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC1pbmRleDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBndWFyZGlhbl9tYXBzID0gW1wiXCJdO1xufVxuXG5leHBvcnQgY2xhc3MgSXRlbSB7XG4gICAgaWQgPSAwO1xuICAgIG5hbWVfa3IgPSBcIlwiO1xuICAgIG5hbWVfZW4gPSBcIlwiO1xuICAgIHVzZVR5cGUgPSBcIlwiO1xuICAgIG1heFVzZSA9IDA7XG4gICAgaGlkZGVuID0gZmFsc2U7XG4gICAgcmVzaXN0ID0gXCJcIjtcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXI7XG4gICAgcGFydDogUGFydCA9IFwiT3RoZXJcIjtcbiAgICBsZXZlbCA9IDA7XG4gICAgc3RyID0gMDtcbiAgICBzdGEgPSAwO1xuICAgIGRleCA9IDA7XG4gICAgd2lsID0gMDtcbiAgICBocCA9IDA7XG4gICAgcXVpY2tzbG90cyA9IDA7XG4gICAgYnVmZnNsb3RzID0gMDtcbiAgICBzbWFzaCA9IDA7XG4gICAgbW92ZW1lbnQgPSAwO1xuICAgIGNoYXJnZSA9IDA7XG4gICAgbG9iID0gMDtcbiAgICBzZXJ2ZSA9IDA7XG4gICAgbWF4X3N0ciA9IDA7XG4gICAgbWF4X3N0YSA9IDA7XG4gICAgbWF4X2RleCA9IDA7XG4gICAgbWF4X3dpbCA9IDA7XG4gICAgZWxlbWVudF9lbmNoYW50YWJsZSA9IGZhbHNlO1xuICAgIHBhcmNlbF9lbmFibGVkID0gZmFsc2U7XG4gICAgcGFyY2VsX2Zyb21fc2hvcCA9IGZhbHNlO1xuICAgIHNwaW4gPSAwO1xuICAgIGF0c3MgPSAwO1xuICAgIGRmc3MgPSAwO1xuICAgIHNvY2tldCA9IDA7XG4gICAgZ2F1Z2UgPSAwO1xuICAgIGdhdWdlX2JhdHRsZSA9IDA7XG4gICAgc291cmNlczogSXRlbVNvdXJjZVtdID0gW107XG4gICAgc3RhdEZyb21TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiTW92IFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZW1lbnQ7XG4gICAgICAgICAgICBjYXNlIFwiQ2hhcmdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlO1xuICAgICAgICAgICAgY2FzZSBcIkxvYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYjtcbiAgICAgICAgICAgIGNhc2UgXCJTbWFzaFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNtYXNoO1xuICAgICAgICAgICAgY2FzZSBcIlN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcbiAgICAgICAgICAgIGNhc2UgXCJEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXg7XG4gICAgICAgICAgICBjYXNlIFwiU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhO1xuICAgICAgICAgICAgY2FzZSBcIldpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53aWw7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdHI7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IERleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9kZXg7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdGE7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFdpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfd2lsO1xuICAgICAgICAgICAgY2FzZSBcIlNlcnZlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmU7XG4gICAgICAgICAgICBjYXNlIFwiUXVpY2tzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1aWNrc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiQnVmZnNsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZnNsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkhQXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgR2FjaGEge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNob3BfaW5kZXg6IG51bWJlciwgcmVhZG9ubHkgZ2FjaGFfaW5kZXg6IG51bWJlciwgcmVhZG9ubHkgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIGNoYXJhY3RlcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvcF9pdGVtcy5zZXQoY2hhcmFjdGVyLCBuZXcgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPigpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkKGl0ZW06IEl0ZW0sIHByb2JhYmlsaXR5OiBudW1iZXIsIGNoYXJhY3RlcjogQ2hhcmFjdGVyLCBxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGl0ZW0uY2hhcmFjdGVyICYmIGl0ZW0uY2hhcmFjdGVyICE9PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKGBJdGVtICR7aXRlbS5pZH0gZnJvbSBnYWNoYSBcIiR7dGhpcy5uYW1lfVwiICR7dGhpcy5nYWNoYV9pbmRleH0gaGFzIHdyb25nIGNoYXJhY3RlcmApO1xuICAgICAgICAgICAgY2hhcmFjdGVyID0gaXRlbS5jaGFyYWN0ZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLmdldChjaGFyYWN0ZXIpIS5zZXQoaXRlbSwgW3Byb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5zZXQoY2hhcmFjdGVyLCBwcm9iYWJpbGl0eSArICh0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSB8fCAwKSk7XG4gICAgfVxuXG4gICAgYXZlcmFnZV90cmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBjaGFyczogcmVhZG9ubHkgQ2hhcmFjdGVyW10gPSBjaGFyYWN0ZXIgPyAoW2NoYXJhY3Rlcl0pIDogY2hhcmFjdGVycztcbiAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSBjaGFycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArICh0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhLmdldChpdGVtKT8uWzBdIHx8IDApLCAwKTtcbiAgICAgICAgaWYgKHByb2JhYmlsaXR5ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b3RhbF9wcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICAgICAgcmV0dXJuIHRvdGFsX3Byb2JhYmlsaXR5IC8gcHJvYmFiaWxpdHk7XG4gICAgfVxuXG4gICAgZ2V0IHRvdGFsX3Byb2JhYmlsaXR5KCkge1xuICAgICAgICByZXR1cm4gY2hhcmFjdGVycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpISwgMCk7XG4gICAgfVxuXG4gICAgY2hhcmFjdGVyX3Byb2JhYmlsaXR5ID0gbmV3IE1hcDxDaGFyYWN0ZXIsIG51bWJlcj4oKTtcbiAgICBzaG9wX2l0ZW1zID0gbmV3IE1hcDxDaGFyYWN0ZXIsIE1hcDxJdGVtLCBbLypwcm9iYWJpbGl0eToqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWluOiovIG51bWJlciwgLypxdWFudGl0eV9tYXg6Ki8gbnVtYmVyXT4+KCk7XG59XG5cbmV4cG9ydCBsZXQgaXRlbXMgPSBuZXcgTWFwPG51bWJlciwgSXRlbT4oKTtcbmV4cG9ydCBsZXQgc2hvcF9pdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xubGV0IGdhY2hhcyA9IG5ldyBNYXA8bnVtYmVyLCBHYWNoYT4oKTtcbmxldCBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwcmV0dHlOdW1iZXIobjogbnVtYmVyLCBkaWdpdHM6IG51bWJlcikge1xuICAgIGxldCBzID0gbi50b0ZpeGVkKGRpZ2l0cyk7XG4gICAgd2hpbGUgKHMuZW5kc1dpdGgoXCIwXCIpKSB7XG4gICAgICAgIHMgPSBzLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgaWYgKHMuZW5kc1dpdGgoXCIuXCIpKSB7XG4gICAgICAgIHMgPSBzLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSXRlbURhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoIDwgMTAwMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEl0ZW1zIGZpbGUgaXMgb25seSAke2RhdGEubGVuZ3RofSBieXRlcyBsb25nYCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgWywgcmVzdWx0XSBvZiBkYXRhLm1hdGNoQWxsKC9cXDxJdGVtICguKilcXC9cXD4vZykpIHtcbiAgICAgICAgY29uc3QgaXRlbTogSXRlbSA9IG5ldyBJdGVtO1xuICAgICAgICBmb3IgKGNvbnN0IFssIGF0dHJpYnV0ZSwgdmFsdWVdIG9mIHJlc3VsdC5tYXRjaEFsbCgvXFxzPyhbXj1dKik9XCIoW15cIl0qKVwiL2cpKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJJbmRleFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmlkID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiX05hbWVfXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9rciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTmFtZV9OXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbiA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiVXNlVHlwZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnVzZVR5cGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1heFVzZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heFVzZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkhpZGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5oaWRkZW4gPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlJlc2lzdFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnJlc2lzdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2hhclwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTklLSVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJOaWtpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFVOTFVOXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVQ1lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTHVjeVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNIVUFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiU2h1YVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRIQU5QSVJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiRGhhbnBpclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBPQ0hJXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlBvY2hpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQUxcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiQWxcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7dmFsdWV9XCJgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUGFydFwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFN0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJCQUdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkJhY2twYWNrXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiR0xBU1NFU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiRmFjZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhBTkRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTT0NLU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU29ja3NcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJGT09UXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJTaG9lc1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkNBUFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGF0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUEFOVFNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkxvd2VyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUkFDS0VUXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJSYWNrZXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJCT0RZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJVcHBlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhBSVJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhaXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJEWUVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkR5ZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gcGFydCAke3ZhbHVlfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMZXZlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxldmVsID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU1RSXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3RyID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3RhID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiREVYXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGV4ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiV0lMXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ud2lsID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkSFBcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5ocCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZFF1aWNrXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucXVpY2tzbG90cyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEJ1ZmZcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5idWZmc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTbWFzaFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc21hc2ggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNb3ZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tb3ZlbWVudCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJnZXNob3RTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkxvYlNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubG9iID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU2VydmVTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNlcnZlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1NUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9zdHIgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uc3RyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVEFcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RhID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfREVYXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X2RleCA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1dJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF93aWwgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0ud2lsKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuY2hhbnRFbGVtZW50XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZWxlbWVudF9lbmNoYW50YWJsZSA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRW5hYmxlUGFyY2VsXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFyY2VsX2VuYWJsZWQgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkJhbGxTcGluXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3BpbiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFUU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hdHNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiREZTU1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRmc3MgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTb2NrZXRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zb2NrZXQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJHYXVnZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdhdWdlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VCYXR0bGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZV9iYXR0bGUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBpdGVtIGF0dHJpYnV0ZSBcIiR7YXR0cmlidXRlfVwiYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXRlbXMuc2V0KGl0ZW0uaWQsIGl0ZW0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZWJ1Z1Nob3BQYXJzaW5nID0gZmFsc2U7XG4gICAgaWYgKGRhdGEubGVuZ3RoIDwgMTAwMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFNob3AgZmlsZSBpcyBvbmx5ICR7ZGF0YS5sZW5ndGh9IGJ5dGVzIGxvbmdgKTtcbiAgICB9XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBsZXQgY3VycmVudEluZGV4ID0gMDtcbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIGRhdGEubWF0Y2hBbGwoLzxQcm9kdWN0IERJU1BMQVk9XCJcXGQrXCIgSElUX0RJU1BMQVk9XCJcXGQrXCIgSW5kZXg9XCIoPzxpbmRleD5cXGQrKVwiIEVuYWJsZT1cIig/PGVuYWJsZWQ+MHwxKVwiIE5ldz1cIlxcZCtcIiBIaXQ9XCJcXGQrXCIgRnJlZT1cIlxcZCtcIiBTYWxlPVwiXFxkK1wiIEV2ZW50PVwiXFxkK1wiIENvdXBsZT1cIlxcZCtcIiBOb2J1eT1cIlxcZCtcIiBSYW5kPVwiW15cIl0rXCIgVXNlVHlwZT1cIlteXCJdK1wiIFVzZTA9XCJcXGQrXCIgVXNlMT1cIlxcZCtcIiBVc2UyPVwiXFxkK1wiIFByaWNlVHlwZT1cIig/PHByaWNlX3R5cGU+KD86TUlOVCl8KD86R09MRCkpXCIgT2xkUHJpY2UwPVwiLT9cXGQrXCIgT2xkUHJpY2UxPVwiLT9cXGQrXCIgT2xkUHJpY2UyPVwiLT9cXGQrXCIgUHJpY2UwPVwiKD88cHJpY2U+LT9cXGQrKVwiIFByaWNlMT1cIi0/XFxkK1wiIFByaWNlMj1cIi0/XFxkK1wiIENvdXBsZVByaWNlPVwiLT9cXGQrXCIgQ2F0ZWdvcnk9XCIoPzxjYXRlZ29yeT5bXlwiXSopXCIgTmFtZT1cIig/PG5hbWU+W15cIl0qKVwiIEdvbGRCYWNrPVwiLT9cXGQrXCIgRW5hYmxlUGFyY2VsPVwiKD88cGFyY2VsX2Zyb21fc2hvcD4wfDEpXCIgQ2hhcj1cIi0/XFxkK1wiIEl0ZW0wPVwiKD88aXRlbTA+LT9cXGQrKVwiIEl0ZW0xPVwiKD88aXRlbTE+LT9cXGQrKVwiIEl0ZW0yPVwiKD88aXRlbTI+LT9cXGQrKVwiIEl0ZW0zPVwiKD88aXRlbTM+LT9cXGQrKVwiIEl0ZW00PVwiKD88aXRlbTQ+LT9cXGQrKVwiIEl0ZW01PVwiKD88aXRlbTU+LT9cXGQrKVwiIEl0ZW02PVwiKD88aXRlbTY+LT9cXGQrKVwiIEl0ZW03PVwiKD88aXRlbTc+LT9cXGQrKVwiIEl0ZW04PVwiKD88aXRlbTg+LT9cXGQrKVwiIEl0ZW05PVwiKD88aXRlbTk+LT9cXGQrKVwiID8oPzpJY29uPVwiW15cIl0qXCIgPyk/KD86TmFtZV9rcj1cIlteXCJdKlwiID8pPyg/Ok5hbWVfZW49XCIoPzxuYW1lX2VuPlteXCJdKilcIiA/KT8oPzpOYW1lX3RoPVwiW15cIl0qXCIgPyk/XFwvPi9nKSkge1xuICAgICAgICBpZiAoIW1hdGNoLmdyb3Vwcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5kZXggPSBwYXJzZUludChtYXRjaC5ncm91cHMuaW5kZXgpO1xuICAgICAgICBpZiAoY3VycmVudEluZGV4ICsgMSAhPT0gaW5kZXgpIHtcbiAgICAgICAgICAgIGRlYnVnU2hvcFBhcnNpbmcgJiYgY29uc29sZS53YXJuKGBGYWlsZWQgcGFyc2luZyBzaG9wIGl0ZW0gaW5kZXggJHtjdXJyZW50SW5kZXggKyAyID09PSBpbmRleCA/IGN1cnJlbnRJbmRleCArIDEgOiBgJHtjdXJyZW50SW5kZXggKyAxfSB0byAke2luZGV4IC0gMX1gfWApO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICBjb25zdCBuYW1lID0gbWF0Y2guZ3JvdXBzLm5hbWU7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gbWF0Y2guZ3JvdXBzLmNhdGVnb3J5O1xuICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IFwiTE9UVEVSWVwiKSB7XG4gICAgICAgICAgICBnYWNoYXMuc2V0KGluZGV4LCBuZXcgR2FjaGEoaW5kZXgsIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtMCksIG5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbmFibGVkID0gISFwYXJzZUludChtYXRjaC5ncm91cHMuZW5hYmxlZCk7XG4gICAgICAgIGNvbnN0IHByaWNlX3R5cGU6IFwiYXBcIiB8IFwiZ29sZFwiIHwgXCJub25lXCIgPSBtYXRjaC5ncm91cHMucHJpY2VfdHlwZSA9PT0gXCJNSU5UXCIgPyBcImFwXCIgOiBtYXRjaC5ncm91cHMucHJpY2VfdHlwZSA9PT0gXCJHT0xEXCIgPyBcImdvbGRcIiA6IFwibm9uZVwiO1xuICAgICAgICBjb25zdCBwcmljZSA9IHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5wcmljZSk7XG4gICAgICAgIGNvbnN0IHBhcmNlbF9mcm9tX3Nob3AgPSAhIXBhcnNlSW50KG1hdGNoLmdyb3Vwcy5wYXJjZWxfZnJvbV9zaG9wKTtcbiAgICAgICAgY29uc3QgaXRlbUlEcyA9IFtcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtMCksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTEpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW0yKSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtMyksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTQpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW01KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtNiksXG4gICAgICAgICAgICBwYXJzZUludChtYXRjaC5ncm91cHMuaXRlbTcpLFxuICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLml0ZW04KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5pdGVtOSksXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaW5uZXJfaXRlbXMgPSBpdGVtSURzLmZpbHRlcihpZCA9PiAhIWlkICYmIGl0ZW1zLmdldChpZCkpLm1hcChpZCA9PiBpdGVtcy5nZXQoaWQpISk7XG5cbiAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBcIlBBUlRTXCIpIHtcbiAgICAgICAgICAgIGlmIChpbm5lcl9pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChpbmRleCwgaW5uZXJfaXRlbXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gbWF0Y2guZ3JvdXBzLm5hbWVfZW4gfHwgbWF0Y2guZ3JvdXBzLm5hbWU7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoaW5kZXgsIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtU291cmNlID0gbmV3IFNob3BJdGVtU291cmNlKGluZGV4LCBwcmljZSwgcHJpY2VfdHlwZSA9PT0gXCJhcFwiLCBpbm5lcl9pdGVtcyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGlubmVyX2l0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGl0ZW1Tb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBnYWNoYUl0ZW0ubmFtZV9lbiA9IG1hdGNoLmdyb3Vwcy5uYW1lX2VuIHx8IG1hdGNoLmdyb3Vwcy5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoaW5kZXgsIGdhY2hhSXRlbSk7XG4gICAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGdhY2hhSXRlbS5zb3VyY2VzLnB1c2gobmV3IFNob3BJdGVtU291cmNlKGluZGV4LCBwcmljZSwgcHJpY2VfdHlwZSA9PT0gXCJhcFwiLCBpbm5lcl9pdGVtcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb3RoZXJJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIG90aGVySXRlbS5uYW1lX2VuID0gbWF0Y2guZ3JvdXBzLm5hbWVfZW4gfHwgbWF0Y2guZ3JvdXBzLm5hbWU7XG4gICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChpbmRleCwgb3RoZXJJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBjb3VudCsrO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgRm91bmQgJHtjb3VudH0gc2hvcCBpdGVtc2ApO1xufVxuXG5jbGFzcyBBcGlJdGVtIHtcbiAgICBwcm9kdWN0SW5kZXggPSAwO1xuICAgIGRpc3BsYXkgPSAwO1xuICAgIGhpdERpc3BsYXkgPSBmYWxzZTtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgdXNlMCA9IDA7XG4gICAgdXNlMSA9IDA7XG4gICAgdXNlMiA9IDA7XG4gICAgcHJpY2VUeXBlID0gXCJHT0xEXCI7XG4gICAgb2xkUHJpY2UwID0gMDtcbiAgICBvbGRQcmljZTEgPSAwO1xuICAgIG9sZFByaWNlMiA9IDA7XG4gICAgcHJpY2UwID0gMDtcbiAgICBwcmljZTEgPSAwO1xuICAgIHByaWNlMiA9IDA7XG4gICAgY291cGxlUHJpY2UgPSAwO1xuICAgIGNhdGVnb3J5ID0gXCJcIjtcbiAgICBuYW1lID0gXCJcIjtcbiAgICBnb2xkQmFjayA9IDA7XG4gICAgZW5hYmxlUGFyY2VsID0gZmFsc2U7XG4gICAgZm9yUGxheWVyID0gMDtcbiAgICBpdGVtMCA9IDA7XG4gICAgaXRlbTEgPSAwO1xuICAgIGl0ZW0yID0gMDtcbiAgICBpdGVtMyA9IDA7XG4gICAgaXRlbTQgPSAwO1xuICAgIGl0ZW01ID0gMDtcbiAgICBpdGVtNiA9IDA7XG4gICAgaXRlbTcgPSAwO1xuICAgIGl0ZW04ID0gMDtcbiAgICBpdGVtOSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzQXBpSXRlbShvYmo6IGFueSk6IG9iaiBpcyBBcGlJdGVtIHtcbiAgICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlb2Ygb2JqLnByb2R1Y3RJbmRleCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5kaXNwbGF5ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmhpdERpc3BsYXkgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmVuYWJsZWQgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UxID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2VUeXBlID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNvdXBsZVByaWNlID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNhdGVnb3J5ID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZ29sZEJhY2sgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlUGFyY2VsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgdHlwZW9mIG9iai5mb3JQbGF5ZXIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTAgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTMgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTQgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTUgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTYgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTcgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTggPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTkgPT09IFwibnVtYmVyXCJcbiAgICBdLmV2ZXJ5KGIgPT4gYik7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXBpU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBhcGlJdGVtIG9mIEpTT04ucGFyc2UoZGF0YSkpIHtcbiAgICAgICAgaWYgKCFpc0FwaUl0ZW0oYXBpSXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEluY29ycmVjdCBmb3JtYXQgb2YgaXRlbTogJHtkYXRhfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IFtcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0xLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTMsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW00LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNSxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTYsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW03LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTksXG4gICAgICAgIF0uZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJQQVJUU1wiKSB7XG4gICAgICAgICAgICBpZiAoaW5uZXJfaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGlubmVyX2l0ZW1zWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXBpSXRlbS5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG5ldyBHYWNoYShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5pdGVtMCwgYXBpSXRlbS5uYW1lKSk7XG4gICAgICAgICAgICBjb25zdCBnYWNoYUl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgZ2FjaGFJdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgZ2FjaGFJdGVtKTtcbiAgICAgICAgICAgIGlmIChhcGlJdGVtLmVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBvdGhlckl0ZW0pO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR2FjaGFEYXRhKGRhdGE6IHN0cmluZywgZ2FjaGE6IEdhY2hhKSB7XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGRhdGEuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgaWYgKCFsaW5lLmluY2x1ZGVzKFwiPExvdHRlcnlJdGVtX1wiKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9cXHMqPExvdHRlcnlJdGVtXyg/PGNoYXJhY3Rlcj5bXiBdKikgSW5kZXg9XCJcXGQrXCIgX05hbWVfPVwiW15cIl0qXCIgU2hvcEluZGV4PVwiKD88c2hvcF9pZD5cXGQrKVwiIFF1YW50aXR5TWluPVwiKD88cXVhbnRpdHlfbWluPlxcZCspXCIgUXVhbnRpdHlNYXg9XCIoPzxxdWFudGl0eV9tYXg+XFxkKylcIiBDaGFuc1Blcj1cIig/PHByb2JhYmlsaXR5PlxcZCtcXC4/XFxkKilcXHMqXCIgRWZmZWN0PVwiXFxkK1wiIFByb2R1Y3RPcHQ9XCJcXGQrXCJcXC8+Lyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHBhcnNpbmcgZ2FjaGEgJHtnYWNoYS5nYWNoYV9pbmRleH06XFxuJHtsaW5lfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGFyYWN0ZXIgPSBtYXRjaC5ncm91cHMuY2hhcmFjdGVyO1xuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBcIkx1bmx1blwiKSB7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7Y2hhcmFjdGVyfVwiIGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5zaG9wX2lkKSk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHNob3AgaXRlbSBpZCAke21hdGNoLmdyb3Vwcy5zaG9wX2lkfSBpbiBsb3R0ZXJ5IGZpbGUgJHtnYWNoYS5nYWNoYV9pbmRleH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGdhY2hhLmFkZChpdGVtLCBwYXJzZUZsb2F0KG1hdGNoLmdyb3Vwcy5wcm9iYWJpbGl0eSksIGNoYXJhY3RlciwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21pbiksIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5xdWFudGl0eV9tYXgpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCBtYXBdIG9mIGdhY2hhLnNob3BfaXRlbXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaXRlbSxdIG9mIG1hcCkge1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2gobmV3IEdhY2hhSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR3VhcmRpYW5EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGd1YXJkaWFuRGF0YSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROdW1iZXIobzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YgbyA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYm9zc1RpbWVJbmZvID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hcEluZm8gb2YgZ3VhcmRpYW5EYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwSW5mbyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFwX25hbWUgPSBtYXBJbmZvLk5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwX25hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJld2FyZHMgPSBBcnJheS5pc0FycmF5KG1hcEluZm8uUmV3YXJkcykgPyBbLi4ubWFwSW5mby5SZXdhcmRzXSA6IFtdO1xuICAgICAgICBjb25zdCByZXdhcmRfaXRlbXMgPSByZXdhcmRzXG4gICAgICAgICAgICAuZmlsdGVyKChzaG9wX2lkKTogc2hvcF9pZCBpcyBudW1iZXIgPT4gdHlwZW9mIHNob3BfaWQgPT09IFwibnVtYmVyXCIgJiYgc2hvcF9pdGVtcy5oYXMoc2hvcF9pZCkpXG4gICAgICAgICAgICAubWFwKHNob3BfaWQgPT4gc2hvcF9pdGVtcy5nZXQoc2hvcF9pZCkhKTtcbiAgICAgICAgY29uc3QgRXhwTXVsdGlwbGllciA9IGdldE51bWJlcihtYXBJbmZvLkV4cE11bHRpcGxpZXIpIHx8IDA7XG4gICAgICAgIGNvbnN0IElzQm9zc1N0YWdlID0gISFtYXBJbmZvLklzQm9zc1N0YWdlO1xuICAgICAgICBjb25zdCBNYXBJRCA9IGdldE51bWJlcihtYXBJbmZvLk1hcElkKSB8fCAwO1xuICAgICAgICBsZXQgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGdldE51bWJlcihtYXBJbmZvLkJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpIHx8IC0xO1xuICAgICAgICBpZiAoQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9PT0gLTEpIHtcbiAgICAgICAgICAgIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPSBib3NzVGltZUluZm8uZ2V0KE1hcElEKSB8fCAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXBJRCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJvc3NUaW1lSW5mby5zZXQoTWFwSUQsIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXdhcmRfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShtYXBfbmFtZSwgcmV3YXJkX2l0ZW1zLCBFeHBNdWx0aXBsaWVyLCBJc0Jvc3NTdGFnZSwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChndWFyZGlhblNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSB1cmwuc2xpY2UodXJsLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gYExvYWRpbmcgJHtmaWxlbmFtZX0sIHBsZWFzZSB3YWl0Li4uYDtcbiAgICB9XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgIGNvbnN0IHByb2dyZXNzYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmVzc2JhclwiKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlKys7XG4gICAgfVxuICAgIGlmICghcmVwbHkub2spIHtcbiAgICAgICAgYWxlcnQoYE9vcHMsIHNvbWV0aGluZyBicm9rZS4gQ29tcGxhaW4gdG8gTGlsbGkvS2Fub25lL1h4aGFyQ3MgYWJvdXQ6XFxuRmFpbGVkIGRvd25sb2FkaW5nICR7dXJsfSBiZWNhdXNlIG9mICR7cmVwbHkuc3RhdHVzfSR7cmVwbHkuc3RhdHVzVGV4dCA/IFwiIFwiICsgcmVwbHkuc3RhdHVzIDogXCJcIn0uYCk7XG4gICAgICAgIGlmICh1cmwuZW5kc1dpdGgoXCIuanNvblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiW11cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuZW5kc1dpdGgoXCIueG1sXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCI8Xz48L18+XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiByZXBseS50ZXh0KCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZEl0ZW1zKCkge1xuICAgIGNvbnN0IHByb2dyZXNzYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmVzc2JhclwiKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlID0gMDtcbiAgICAgICAgcHJvZ3Jlc3NiYXIubWF4ID0gMTIyO1xuICAgIH1cbiAgICBjb25zdCBpdGVtU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvYXV0aC1zZXJ2ZXIvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGdhY2hhU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvZ2FtZS1zZXJ2ZXIvc3JjL21haW4vcmVzb3VyY2VzL3Jlcy9sb3R0ZXJ5XCI7XG4gICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9zZXJ2ZXItY29yZS9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzXCI7XG4gICAgY29uc3QgaXRlbVVSTCA9IGl0ZW1Tb3VyY2UgKyBcIi9JdGVtX1BhcnRzX0luaTMueG1sXCI7XG4gICAgY29uc3QgaXRlbURhdGEgPSBkb3dubG9hZChpdGVtVVJMKTtcbiAgICAvL2NvbnN0IHNob3BVUkwgPSBpdGVtU291cmNlICsgXCIvU2hvcF9JbmkzLnhtbFwiO1xuICAgIGNvbnN0IG1heF9zaG9wX3BhZ2VzID0gMjA7IC8vY3VycmVudGx5IG5lZWQgb25seSAxMCwgc2hvdWxkIGJlIGVub3VnaFxuICAgIGNvbnN0IHNob3BVUkwgPSBcImh0dHBzOi8vamZ0c2UuY29tL2pmdHNlLXJlc3RzZXJ2aWNlL2FwaS9zaG9wP3NpemU9MTAwMCZwYWdlPVwiO1xuICAgIGNvbnN0IHNob3BEYXRhcyA9IFsuLi5BcnJheShtYXhfc2hvcF9wYWdlcykua2V5cygpXS5tYXAobiA9PiBkb3dubG9hZChgJHtzaG9wVVJMfSR7bn1gKSk7XG4gICAgY29uc3QgZ3VhcmRpYW5VUkwgPSBndWFyZGlhblNvdXJjZSArIFwiL0d1YXJkaWFuU3RhZ2VzLmpzb25cIjtcbiAgICBjb25zdCBndWFyZGlhbkRhdGEgPSBkb3dubG9hZChndWFyZGlhblVSTCk7XG4gICAgcGFyc2VJdGVtRGF0YShhd2FpdCBpdGVtRGF0YSk7XG4gICAgLy9wYXJzZVNob3BEYXRhKGF3YWl0IHNob3BEYXRhKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChzaG9wRGF0YXMubWFwKHAgPT4gcC50aGVuKGRhdGEgPT4gcGFyc2VBcGlTaG9wRGF0YShkYXRhKSkpKTtcblxuICAgIGNvbnNvbGUubG9nKGBGb3VuZCAke2dhY2hhcy5zaXplfSBnYWNoYXNgKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlID0gMDtcbiAgICAgICAgcHJvZ3Jlc3NiYXIubWF4ID0gZ2FjaGFzLnNpemUgKyAzO1xuICAgIH1cbiAgICBjb25zdCBnYWNoYV9pdGVtczogW1Byb21pc2U8c3RyaW5nPiwgR2FjaGEsIHN0cmluZ11bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgWywgZ2FjaGFdIG9mIGdhY2hhcykge1xuICAgICAgICBjb25zdCBnYWNoYV91cmwgPSBgJHtnYWNoYVNvdXJjZX0vSW5pM19Mb3RfJHtgJHtnYWNoYS5nYWNoYV9pbmRleH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX0ueG1sYDtcbiAgICAgICAgZ2FjaGFfaXRlbXMucHVzaChbZG93bmxvYWQoZ2FjaGFfdXJsKSwgZ2FjaGEsIGdhY2hhX3VybF0pO1xuICAgIH1cbiAgICBwYXJzZUd1YXJkaWFuRGF0YShhd2FpdCBndWFyZGlhbkRhdGEpO1xuICAgIGZvciAoY29uc3QgW2l0ZW0sIGdhY2hhLCBnYWNoYV91cmxdIG9mIGdhY2hhX2l0ZW1zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJzZUdhY2hhRGF0YShhd2FpdCBpdGVtLCBnYWNoYSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGRvd25sb2FkaW5nICR7Z2FjaGFfdXJsfSBiZWNhdXNlICR7ZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgTG9hZGVkICR7aXRlbXMuc2l6ZX0gaXRlbXNgKTtcbn1cblxuZnVuY3Rpb24gZGVsZXRhYmxlSXRlbShuYW1lOiBzdHJpbmcsIGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxcIixcbiAgICAgICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpZH1gLFxuICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgRXhjbHVkZSAke25hbWV9IGZyb20gcmVzdWx0c2AsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIkV4Y2x1ZGVcIixcbiAgICAgICAgXSksXG4gICAgICAgIG5hbWUsXG4gICAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsodGV4dDogc3RyaW5nLCBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJwb3B1cF9saW5rXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICB9LFxuICAgICAgICB0ZXh0LFxuICAgIF0pO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRvcF9kaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcF9kaXZcIik7XG4gICAgICAgIGlmICghKHRvcF9kaXYgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKGRpYWxvZykge1xuICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xvc2VCdXR0b24gPSBjcmVhdGVIVE1MKFtcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIgfSwgXCJDbG9zZVwiXSk7XG4gICAgICAgIGRpYWxvZyA9IEFycmF5LmlzQXJyYXkoY29udGVudClcbiAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgeyBcImFyaWEtbGFiZWxcIjogYCR7dGV4dH0gZGV0YWlsc2AgfSwgLi4uY29udGVudCwgY2xvc2VCdXR0b25dKVxuICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCB7IFwiYXJpYS1sYWJlbFwiOiBgJHt0ZXh0fSBkZXRhaWxzYCB9LCBjb250ZW50LCBjbG9zZUJ1dHRvbl0pO1xuICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcInRydWVcIik7XG4gICAgICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBkaWFsb2c/LmNsb3NlKCkpO1xuICAgICAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIik7XG4gICAgICAgICAgICBkaWFsb2c/LnJlbW92ZSgpO1xuICAgICAgICAgICAgZGlhbG9nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgYnV0dG9uLmZvY3VzKCk7XG4gICAgICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgdG9wX2Rpdi5hcHBlbmRDaGlsZChkaWFsb2cpO1xuICAgICAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hhbmNlUG9wdXAodHJpZXM6IG51bWJlcikge1xuICAgIGZ1bmN0aW9uIHByb2JhYmlsaXR5QWZ0ZXJOVHJpZXMocHJvYmFiaWxpdHk6IG51bWJlciwgdHJpZXM6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gMSAtIChNYXRoLnBvdygoMSAtIHByb2JhYmlsaXR5KSwgdHJpZXMpKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJOdW1iZXIgb2YgZ2FjaGFzXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2UgZm9yIGl0ZW1cIl0sXG4gICAgICAgIF0sXG4gICAgXSk7XG4gICAgZm9yIChjb25zdCBmYWN0b3Igb2YgWzAuMSwgMC41LCAxLCAyLCA1LCAxMF0pIHtcbiAgICAgICAgY29uc3QgZ2FjaGFzID0gTWF0aC5yb3VuZCh0cmllcyAqIGZhY3Rvcik7XG4gICAgICAgIGlmIChnYWNoYXMgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBgJHtnYWNoYXN9YF0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBgJHsocHJvYmFiaWxpdHlBZnRlck5UcmllcygxIC8gdHJpZXMsIGdhY2hhcykgKiAxMDApLnRvRml4ZWQoNCl9JWBdLFxuICAgICAgICBdKSk7XG4gICAgfVxuICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXCJ0clwiXSkpO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoYCR7cHJldHR5TnVtYmVyKHRyaWVzLCAyKX1gLCBjb250ZW50KTtcbn1cblxuZnVuY3Rpb24gcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gMSAmJiBxdWFudGl0eV9tYXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChxdWFudGl0eV9taW4gPT09IHF1YW50aXR5X21heCkge1xuICAgICAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWF4fWA7XG4gICAgfVxuICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9taW59LSR7cXVhbnRpdHlfbWF4fWA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoaXRlbTogSXRlbSB8IHVuZGVmaW5lZCwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgY29udGVudCA9IGNoYXJhY3RlciA/IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInRhYmxlXCIsXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIFtcInRoXCIsIFwiSXRlbVwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiQXZlcmFnZSBUcmllc1wiXSxcbiAgICAgICAgXSxcbiAgICBdKSA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcInRhYmxlXCIsXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIFtcInRoXCIsIFwiSXRlbVwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJBdmVyYWdlIFRyaWVzXCJdLFxuICAgICAgICBdLFxuICAgIF0pO1xuICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldChpdGVtU291cmNlLnNob3BfaWQpO1xuICAgIGlmICghZ2FjaGEpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cblxuICAgIGNvbnN0IGdhY2hhX2l0ZW1zID0gbmV3IE1hcDxJdGVtLCBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0+KCk7XG4gICAgZm9yIChjb25zdCBjaGFyIG9mIGNoYXJhY3RlciA9PT0gdW5kZWZpbmVkID8gY2hhcmFjdGVycyA6IFtjaGFyYWN0ZXJdKSB7XG4gICAgICAgIGNvbnN0IGNoYXJfaXRlbXMgPSBnYWNoYS5zaG9wX2l0ZW1zLmdldChjaGFyKTtcbiAgICAgICAgaWYgKCFjaGFyX2l0ZW1zKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtjaGFyX2dhY2hhX2l0ZW0sIFt0aWNrZXRzLCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF1dIG9mIGNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fY2hhcmFjdGVyID0gY2hhcl9nYWNoYV9pdGVtLmNoYXJhY3RlciB8fCBjaGFyYWN0ZXI7XG4gICAgICAgICAgICBjb25zdCBpdGVtX3RpY2tldHMgPSBpdGVtX2NoYXJhY3RlciA/IGdhY2hhLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoaXRlbV9jaGFyYWN0ZXIpISA6IGdhY2hhLnRvdGFsX3Byb2JhYmlsaXR5O1xuICAgICAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSB0aWNrZXRzIC8gaXRlbV90aWNrZXRzO1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNfcHJvYmFiaWxpdHkgPSBnYWNoYV9pdGVtcy5nZXQoY2hhcl9nYWNoYV9pdGVtKT8uWzBdIHx8IDA7XG4gICAgICAgICAgICBnYWNoYV9pdGVtcy5zZXQoY2hhcl9nYWNoYV9pdGVtLCBbcHJldmlvdXNfcHJvYmFiaWxpdHkgKyBwcm9iYWJpbGl0eSwgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3Byb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF1dIG9mIGdhY2hhX2l0ZW1zKSB7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgICAgIGl0ZW0gPT09IGNoYXJfZ2FjaGFfaXRlbSA/IHsgY2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIiB9IDogXCJcIixcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCBjaGFyX2dhY2hhX2l0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXgpXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBgJHtwcmV0dHlOdW1iZXIoMSAvIHByb2JhYmlsaXR5LCAyKX1gXSxcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgICAgIGl0ZW0gPT09IGNoYXJfZ2FjaGFfaXRlbSA/IHsgY2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIiB9IDogXCJcIixcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCBjaGFyX2dhY2hhX2l0ZW0ubmFtZV9lbiwgcXVhbnRpdHlTdHJpbmcocXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXgpXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IFwiKlwiXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBgJHtwcmV0dHlOdW1iZXIoMSAvIHByb2JhYmlsaXR5LCAyKX1gXSxcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIFtjcmVhdGVIVE1MKFtcImFcIiwgZ2FjaGEubmFtZV0pLCBjb250ZW50XSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNldFNvdXJjZVBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IFNob3BJdGVtU291cmNlKSB7XG4gICAgY29uc3QgY29udGVudFRhYmxlID0gY3JlYXRlSFRNTChbXCJ0YWJsZVwiLCBbXCJ0clwiLCBbXCJ0aFwiLCBcIkNvbnRlbnRzXCJdXV0pO1xuICAgIGZvciAoY29uc3QgaW5uZXJfaXRlbSBvZiBpdGVtU291cmNlLml0ZW1zKSB7XG4gICAgICAgIGNvbnRlbnRUYWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcInRyXCIsIGlubmVyX2l0ZW0gPT09IGl0ZW0gPyB7IGNsYXNzOiBcImhpZ2hsaWdodGVkXCIgfSA6IFwiXCIsIFtcInRkXCIsIGlubmVyX2l0ZW0ubmFtZV9lbl1dKSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIFtjcmVhdGVIVE1MKFtcImFcIiwgaXRlbVNvdXJjZS5pdGVtLm5hbWVfZW4sIGNvbnRlbnRUYWJsZV0pXSk7XG59XG5cbmZ1bmN0aW9uIHByZXR0eVRpbWUoc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGAke01hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKX06JHtgJHtzZWNvbmRzICUgNjB9YC5wYWRTdGFydCgyLCBcIjBcIil9YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR3VhcmRpYW5Qb3B1cChpdGVtOiBJdGVtLCBpdGVtU291cmNlOiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBjb250ZW50ID0gW1xuICAgICAgICBgR3VhcmRpYW4gbWFwICR7aXRlbVNvdXJjZS5ndWFyZGlhbl9tYXB9YCxcbiAgICAgICAgY3JlYXRlSFRNTChcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcInVsXCIsIHsgY2xhc3M6IFwibGF5b3V0XCIgfSxcbiAgICAgICAgICAgICAgICBbXCJsaVwiLCBcIkl0ZW1zOlwiLFxuICAgICAgICAgICAgICAgICAgICBbXCJ1bFwiLCB7IGNsYXNzOiBcImxheW91dFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5pdGVtU291cmNlLml0ZW1zLnJlZHVjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY3VyciwgcmV3YXJkX2l0ZW0pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsuLi5jdXJyLCBjcmVhdGVIVE1MKFtcImxpXCIsIHsgY2xhc3M6IHJld2FyZF9pdGVtID09PSBpdGVtID8gXCJoaWdobGlnaHRlZFwiIDogXCJcIiB9LCByZXdhcmRfaXRlbS5uYW1lX2VuXSldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdIGFzIChIVE1MRWxlbWVudCB8IHN0cmluZylbXVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcImxpXCIsIGBSZXF1aXJlcyBib3NzOiAke2l0ZW1Tb3VyY2UubmVlZF9ib3NzID8gXCJZZXNcIiA6IFwiTm9cIn1gXSxcbiAgICAgICAgICAgICAgICAuLi4oaXRlbVNvdXJjZS5ib3NzX3RpbWUgPiAwID8gW2NyZWF0ZUhUTUwoW1wibGlcIiwgYEJvc3MgdGltZTogJHtwcmV0dHlUaW1lKGl0ZW1Tb3VyY2UuYm9zc190aW1lKX1gXSldIDogW10pLFxuICAgICAgICAgICAgICAgIFtcImxpXCIsIGBFWFAgbXVsdGlwbGllcjogJHtpdGVtU291cmNlLnhwfWBdLFxuICAgICAgICAgICAgXVxuICAgICAgICApXG4gICAgXTtcbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKGl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLCBjb250ZW50KTtcbn1cblxuZnVuY3Rpb24gaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShcbiAgICBpdGVtOiBJdGVtLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgcmV0dXJuIFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgIC5maWx0ZXIoc291cmNlRmlsdGVyKVxuICAgICAgICAubWFwKGl0ZW1Tb3VyY2UgPT4gc291cmNlSXRlbUVsZW1lbnQoaXRlbSwgaXRlbVNvdXJjZSwgc291cmNlRmlsdGVyLCBjaGFyYWN0ZXIpKTtcbn1cblxuZnVuY3Rpb24gbWFrZVNvdXJjZXNMaXN0KGxpc3Q6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXVtdKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBjb25zdCByZXN1bHQ6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSA9IFtdO1xuICAgIGZ1bmN0aW9uIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdICsgZWxlbWVudDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnRzIG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWRkKFwiIFwiKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmlyc3QpIHtcbiAgICAgICAgICAgIGFkZChcIiwgXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc291cmNlSXRlbUVsZW1lbnQoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbiwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICBjb25zdCBjaGFyID0gaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuID8gdW5kZWZpbmVkIDogY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCBzb3VyY2VzID0gaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtU291cmNlLml0ZW0sIHNvdXJjZUZpbHRlciwgY2hhcmFjdGVyKTtcbiAgICAgICAgY29uc3Qgc291cmNlc0xpc3QgPSBtYWtlU291cmNlc0xpc3Qoc291cmNlcyk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBjcmVhdGVHYWNoYVNvdXJjZVBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UsIGNoYXIpLFxuICAgICAgICAgICAgYCB4IGAsXG4gICAgICAgICAgICBjcmVhdGVDaGFuY2VQb3B1cChpdGVtU291cmNlLmdhY2hhVHJpZXMoaXRlbSwgY2hhcmFjdGVyKSksXG4gICAgICAgICAgICAuLi4oc291cmNlc0xpc3QubGVuZ3RoID4gMCA/IFtcIiBcIl0gOiBbXSksXG4gICAgICAgICAgICAuLi5zb3VyY2VzTGlzdCxcbiAgICAgICAgXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgIGlmIChpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIFtgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSksXG4gICAgICAgICAgICBgICR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YFxuICAgICAgICBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgIHJldHVybiBbY3JlYXRlR3VhcmRpYW5Qb3B1cChpdGVtLCBpdGVtU291cmNlKV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbTogSXRlbSkge1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tYXJ0LWZhbGxiYWNrXCIsXG4gICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBPZmZpY2lhbCBpdGVtIGFydCB1bmF2YWlsYWJsZSBmb3IgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgfSxcbiAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcIml0ZW0tYXJ0LWZhbGxiYWNrX19jb2RlXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSwgXCJbTi9BXVwiXSxcbiAgICAgICAgW1wic3BhblwiLCB7IFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSwgXCJPZmZpY2lhbCBhcnQgdW5hdmFpbGFibGVcIl0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RhYmxlUm93KGl0ZW06IEl0ZW0sIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcbiAgICBjb25zdCByb3cgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbS5uYW1lX2VuLCBpdGVtLmlkKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiB9LCBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSldLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIgfSwgaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGxcIl0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIgfSwgaXRlbS5wYXJ0XSxcbiAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiB9LCBzdGF0LnNwbGl0KFwiK1wiKS5tYXAocyA9PiBpdGVtLnN0YXRGcm9tU3RyaW5nKHMpKS5qb2luKFwiK1wiKV0pKSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTGV2ZWxfY29sdW1uIG51bWVyaWNcIiB9LCBgJHtpdGVtLmxldmVsfWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJTb3VyY2VfY29sdW1uXCIgfSwgLi4ubWFrZVNvdXJjZXNMaXN0KGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoaXRlbSwgc291cmNlRmlsdGVyLCBjaGFyYWN0ZXIpKV0sXG4gICAgICAgIF1cbiAgICApO1xuICAgIHJldHVybiByb3c7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHYWNoYVRhYmxlKGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sIGNoYXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVFbGVtZW50IHtcbiAgICBjb25zdCB0YWJsZSA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiB9LCBcIk5hbWVcIl0sXG4gICAgICAgICAgICBdXG4gICAgICAgIF1cbiAgICApO1xuICAgIGZvciAoY29uc3QgWywgZ2FjaGFdIG9mIGdhY2hhcykge1xuICAgICAgICBjb25zdCBnYWNoYUl0ZW0gPSBzaG9wX2l0ZW1zLmdldChnYWNoYS5zaG9wX2luZGV4KTtcbiAgICAgICAgaWYgKCFnYWNoYUl0ZW0pIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVyKGdhY2hhSXRlbSkpIHtcbiAgICAgICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1widHJcIiwgW1widGRcIiwgY3JlYXRlR2FjaGFTb3VyY2VQb3B1cCh1bmRlZmluZWQsIG5ldyBJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpLCBjaGFyKV1dKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdWx0c1RhYmxlKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IChpdGVtczogSXRlbVtdLCBpdGVtOiBJdGVtKSA9PiBJdGVtW10sXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgcmVzdWx0czogeyBba2V5OiBzdHJpbmddOiBJdGVtW10gfSA9IHtcbiAgICAgICAgXCJIYXRcIjogW10sXG4gICAgICAgIFwiSGFpclwiOiBbXSxcbiAgICAgICAgXCJEeWVcIjogW10sXG4gICAgICAgIFwiVXBwZXJcIjogW10sXG4gICAgICAgIFwiTG93ZXJcIjogW10sXG4gICAgICAgIFwiU2hvZXNcIjogW10sXG4gICAgICAgIFwiU29ja3NcIjogW10sXG4gICAgICAgIFwiSGFuZFwiOiBbXSxcbiAgICAgICAgXCJCYWNrcGFja1wiOiBbXSxcbiAgICAgICAgXCJGYWNlXCI6IFtdLFxuICAgICAgICBcIlJhY2tldFwiOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAoZmlsdGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHRzW2l0ZW0ucGFydF0gPSBwcmlvcml6ZXIocmVzdWx0c1tpdGVtLnBhcnRdLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJCZXN0IG1hdGNoaW5nIGVxdWlwbWVudCBieSBzbG90IGFuZCBzZWxlY3RlZCBzdGF0IHByaW9yaXR5XCJdLFxuICAgICAgICAgICAgW1widGhlYWRcIixcbiAgICAgICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiSXRlbVwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJBcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQXJ0XCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJDaGFyYWN0ZXJcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiUGFydF9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJQYXJ0XCJdLFxuICAgICAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGhcIiwgeyBjbGFzczogXCJudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIHN0YXRdKSksXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTGV2ZWxfY29sdW1uIG51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJMZXZlbFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJTb3VyY2VfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiU291cmNlXCJdLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1widGJvZHlcIl0sXG4gICAgICAgIF1cbiAgICApO1xuICAgIGNvbnN0IHRhYmxlQm9keSA9IHRhYmxlLnRCb2RpZXNbMF07XG4gICAgaWYgKCF0YWJsZUJvZHkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cblxuICAgIHR5cGUgTWFwT3B0aW9ucyA9IHsgW2tleTogc3RyaW5nXTogbnVtYmVyW10gfTtcblxuICAgIHR5cGUgQ29zdCA9IHtcbiAgICAgICAgZ29sZDogbnVtYmVyLFxuICAgICAgICBhcDogbnVtYmVyLFxuICAgICAgICBtYXBzOiBNYXBPcHRpb25zLFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjb21iaW5lTWFwcyhtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmIChyZXN1bHRbbWFwXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gcmVzdWx0W21hcF0uY29uY2F0KHRyaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb21iaW5lQ29zdHMoY29zdDE6IENvc3QsIGNvc3QyOiBDb3N0KTogQ29zdCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnb2xkOiBjb3N0MS5nb2xkICsgY29zdDIuZ29sZCxcbiAgICAgICAgICAgIGFwOiBjb3N0MS5hcCArIGNvc3QyLmFwLFxuICAgICAgICAgICAgbWFwczogY29tYmluZU1hcHMoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWluTWFwKG0xOiBNYXBPcHRpb25zLCBtMjogTWFwT3B0aW9ucyk6IE1hcE9wdGlvbnMge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7IC4uLm0xIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcCwgdHJpZXNdIG9mIE9iamVjdC5lbnRyaWVzKG0yKSkge1xuICAgICAgICAgICAgaWYgKHRyaWVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHRbbWFwXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gW01hdGgubWluKHJlc3VsdFttYXBdWzBdLCB0cmllc1swXSldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSB0cmllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbkNvc3QoY29zdDE6IENvc3QsIGNvc3QyOiBDb3N0KTogQ29zdCB7XG4gICAgICAgIHJldHVybiBbY29zdDEuYXAsIGNvc3QxLmdvbGRdIDwgW2Nvc3QxLmFwLCBjb3N0MS5nb2xkXSA/XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCxcbiAgICAgICAgICAgICAgICBhcDogY29zdDEuYXAsXG4gICAgICAgICAgICAgICAgbWFwczogbWluTWFwKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICAgICAgfSA6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ29sZDogY29zdDIuZ29sZCxcbiAgICAgICAgICAgICAgICBhcDogY29zdDIuYXAsXG4gICAgICAgICAgICAgICAgbWFwczogbWluTWFwKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb3N0T2YoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogQ29zdCB7XG4gICAgICAgIHJldHVybiBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgICAgICAucmVkdWNlKChjdXJyLCBpdGVtU291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29zdCA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlLmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IGl0ZW1Tb3VyY2UucHJpY2UsIG1hcHM6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiBpdGVtU291cmNlLnByaWNlLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGVDb3N0ID0gY29zdE9mKGl0ZW1Tb3VyY2UuaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSBpdGVtU291cmNlLmdhY2hhVHJpZXMoaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogc2luZ2xlQ29zdC5nb2xkICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcDogc2luZ2xlQ29zdC5hcCAqIG11bHRpcGxpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzaW5nbGVDb3N0Lm1hcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChbbWFwLCB0cmllc10pID0+IFttYXAsIHRyaWVzLm1hcChuID0+IG4gKiBtdWx0aXBsaWVyKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdvbGQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXA6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFtbaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIFtpdGVtU291cmNlLml0ZW1zLmxlbmd0aF1dXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtaW5Db3N0KGN1cnIsIGNvc3QpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7IGdvbGQ6IDAsIGFwOiAwLCBtYXBzOiB7fSB9XG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXRpc3RpY3MgPSB7XG4gICAgICAgIGNoYXJhY3RlcnM6IG5ldyBTZXQ8Q2hhcmFjdGVyPixcbiAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5yZWR1Y2UoKGN1cnIsIHN0YXQpID0+ICh7IC4uLmN1cnIsIFtzdGF0XTogMCB9KSwge30pLFxuICAgICAgICBMZXZlbDogMCxcbiAgICAgICAgY29zdDogeyBhcDogMCwgZ29sZDogMCwgbWFwczoge30gfSBhcyBDb3N0LFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBPYmplY3QudmFsdWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3Qgc3RhdCBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdGlzdGljc1tzdGF0XSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5yZWR1Y2UoKGN1cnIsIHN0YXROYW1lKSA9PiBjdXJyICsgcmVzdWx0WzBdLnN0YXRGcm9tU3RyaW5nKHN0YXROYW1lKSwgMCk7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIHN0YXRpc3RpY3Nbc3RhdF0gKz0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0aXN0aWNzLkxldmVsID0gTWF0aC5tYXgocmVzdWx0WzBdLmxldmVsLCBzdGF0aXN0aWNzLkxldmVsKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2YgaXRlbS5jaGFyYWN0ZXIgPyBbaXRlbS5jaGFyYWN0ZXJdIDogY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgIHN0YXRpc3RpY3MuY2hhcmFjdGVycy5hZGQoY2hhcilcbiAgICAgICAgICAgICAgICB0YWJsZUJvZHkuYXBwZW5kQ2hpbGQoaXRlbVRvVGFibGVSb3coaXRlbSwgc291cmNlRmlsdGVyLCBwcmlvcml0eVN0YXRzLCBjaGFyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0aXN0aWNzLmNvc3QgPSBjb21iaW5lQ29zdHMoY29zdE9mKGl0ZW0sIGNoYXJhY3RlciAmJiBpc0NoYXJhY3RlcihjaGFyYWN0ZXIpID8gY2hhcmFjdGVyIDogdW5kZWZpbmVkKSwgc3RhdGlzdGljcy5jb3N0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdGF0aXN0aWNzLmNoYXJhY3RlcnMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBjb25zdCB0b3RhbF9zb3VyY2VzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBpZiAoc3RhdGlzdGljcy5jb3N0LmdvbGQgPiAwKSB7XG4gICAgICAgICAgICB0b3RhbF9zb3VyY2VzLnB1c2goYCR7c3RhdGlzdGljcy5jb3N0LmdvbGQudG9GaXhlZCgwKX0gR29sZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuYXAgPiAwKSB7XG4gICAgICAgICAgICB0b3RhbF9zb3VyY2VzLnB1c2goYCR7c3RhdGlzdGljcy5jb3N0LmFwLnRvRml4ZWQoMCl9IEFQYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9zdGF0aXN0aWNzWydHdWFyZGlhbiBnYW1lcyddLmZvckVhY2goKGNvdW50LCBtYXApID0+IHRvdGFsX3NvdXJjZXMucHVzaChgJHtjb3VudC50b0ZpeGVkKDApfSB4ICR7bWFwfWApKTtcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInRmb290XCIsXG4gICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgTmFtZV9jb2x1bW5cIiB9LCBcIlRvdGFsOlwiXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIEFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIENoYXJhY3Rlcl9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIFBhcnRfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgbnVtZXJpY1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBgJHtzdGF0aXN0aWNzW3N0YXRdfWBcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke3N0YXRpc3RpY3MuTGV2ZWx9YF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBTb3VyY2VfY29sdW1uXCIgfSwgdG90YWxfc291cmNlcy5qb2luKFwiLCBcIildLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbl9lbGVtZW50IG9mIHRhYmxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYENoYXJhY3Rlcl9jb2x1bW5gKSkge1xuICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICBpZiAoc3RhdGlzdGljc1thdHRyaWJ1dGVdID09PSAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbl9lbGVtZW50IG9mIHRhYmxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYCR7YXR0cmlidXRlfV9jb2x1bW5gKSkge1xuICAgICAgICAgICAgICAgIGlmICghKGNvbHVtbl9lbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb2x1bW5fZWxlbWVudC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWJsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1heEl0ZW1MZXZlbCgpIHtcbiAgICAvL25vIHJlZHVjZSBmb3IgTWFwP1xuICAgIGxldCBtYXggPSAwO1xuICAgIGZvciAoY29uc3QgWywgaXRlbV0gb2YgaXRlbXMpIHtcbiAgICAgICAgbWF4ID0gTWF0aC5tYXgobWF4LCBpdGVtLmxldmVsKTtcbiAgICB9XG4gICAgcmV0dXJuIG1heDtcbn1cblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmIChkaWFsb2cgJiYgZGlhbG9nID09PSBldmVudC50YXJnZXQpIHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgfVxufSk7XG4iLCJpbXBvcnQgeyBtYWtlQ2hlY2tib3hUcmVlLCBUcmVlTm9kZSwgZ2V0TGVhZlN0YXRlcywgc2V0TGVhZlN0YXRlcyB9IGZyb20gJy4vY2hlY2tib3hUcmVlJztcbmltcG9ydCB7IGNyZWF0ZVBvcHVwTGluaywgZG93bmxvYWRJdGVtcywgZ2V0UmVzdWx0c1RhYmxlLCBJdGVtLCBJdGVtU291cmNlLCBnZXRNYXhJdGVtTGV2ZWwsIGl0ZW1zLCBDaGFyYWN0ZXIsIGNoYXJhY3RlcnMsIGlzQ2hhcmFjdGVyLCBTaG9wSXRlbVNvdXJjZSwgR2FjaGFJdGVtU291cmNlLCBnZXRHYWNoYVRhYmxlIH0gZnJvbSAnLi9pdGVtTG9va3VwJztcbmltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuaW1wb3J0IHsgc2VsZWN0QnlQcmlvcml0eSB9IGZyb20gJy4vcHJpb3JpdHknO1xuaW1wb3J0IHsgVmFyaWFibGVfc3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZSc7XG5cbmNvbnN0IHBhcnRzRmlsdGVyID0gW1xuICAgIFwiUGFydHNcIiwgW1xuICAgICAgICBcIkhlYWRcIiwgW1xuICAgICAgICAgICAgXCIrSGF0XCIsXG4gICAgICAgICAgICBcIitIYWlyXCIsXG4gICAgICAgICAgICBcIkR5ZVwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitVcHBlclwiLFxuICAgICAgICBcIitMb3dlclwiLFxuICAgICAgICBcIkxlZ3NcIiwgW1xuICAgICAgICAgICAgXCIrU2hvZXNcIixcbiAgICAgICAgICAgIFwiU29ja3NcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCJBdXhcIiwgW1xuICAgICAgICAgICAgXCIrSGFuZFwiLFxuICAgICAgICAgICAgXCIrQmFja3BhY2tcIixcbiAgICAgICAgICAgIFwiK0ZhY2VcIlxuICAgICAgICBdLFxuICAgICAgICBcIitSYWNrZXRcIixcbiAgICBdLFxuXTtcblxuY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyID0gW1xuICAgIFwiQXZhaWxhYmlsaXR5XCIsIFtcbiAgICAgICAgXCJTaG9wXCIsIFtcbiAgICAgICAgICAgIFwiK0dvbGRcIixcbiAgICAgICAgICAgIFwiK0FQXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiK0FsbG93IGdhY2hhXCIsXG4gICAgICAgIFwiK0d1YXJkaWFuXCIsXG4gICAgICAgIFwiK1VudHJhZGFibGVcIixcbiAgICAgICAgXCJVbmF2YWlsYWJsZSBpdGVtc1wiLFxuICAgIF0sXG5dO1xuXG5jb25zdCBleGNsdWRlZF9pdGVtX2lkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG5mdW5jdGlvbiBhZGRGaWx0ZXJUcmVlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXJhY3RlckZpbHRlcnNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgW1wiQWxsXCIsIC4uLmNoYXJhY3RlcnNdKSB7XG4gICAgICAgIGNvbnN0IGlkID0gYGNoYXJhY3RlclNlbGVjdG9yc18ke2NoYXJhY3Rlcn1gO1xuICAgICAgICBjb25zdCByYWRpb19idXR0b24gPSBjcmVhdGVIVE1MKFtcImlucHV0XCIsIHsgaWQ6IGlkLCB0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIsIHZhbHVlOiBjaGFyYWN0ZXIgfV0pO1xuICAgICAgICByYWRpb19idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocmFkaW9fYnV0dG9uKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wibGFiZWxcIiwgeyBmb3I6IGlkIH0sIGNoYXJhY3Rlcl0pKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wiYnJcIl0pKTtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICByYWRpb19idXR0b24uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmlsdGVyczogW1RyZWVOb2RlLCBzdHJpbmddW10gPSBbXG4gICAgICAgIFtwYXJ0c0ZpbHRlciwgXCJwYXJ0c0ZpbHRlclwiXSxcbiAgICAgICAgW2F2YWlsYWJpbGl0eUZpbHRlciwgXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIl0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IFtmaWx0ZXIsIG5hbWVdIG9mIGZpbHRlcnMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJlZSA9IG1ha2VDaGVja2JveFRyZWUoZmlsdGVyKTtcbiAgICAgICAgdHJlZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRyZWUpO1xuICAgIH1cbn1cblxuYWRkRmlsdGVyVHJlZXMoKTtcblxubGV0IGRyYWdnZWQ6IEhUTUxFbGVtZW50O1xuY29uc3QgZHJhZ1NlcGFyYXRvckxpbmUgPSBjcmVhdGVIVE1MKFtcImhyXCIsIHsgaWQ6IFwiZHJhZ092ZXJCYXJcIiB9XSk7XG5sZXQgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGFwcGx5RHJhZ0Ryb3AoKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnZ2VkID0gdGFyZ2V0O1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJkcm9wem9uZVwiKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRSZWN0ID0gZXZlbnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgLSB0YXJnZXRSZWN0LnRvcDtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHRhcmdldFJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgZW51bSBQb3NpdGlvbiB7XG4gICAgICAgICAgICAgICAgYWJvdmUsXG4gICAgICAgICAgICAgICAgb24sXG4gICAgICAgICAgICAgICAgYmVsb3csXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHkgPCBoZWlnaHQgKiAwLjMgPyBQb3NpdGlvbi5hYm92ZSA6IHkgPiBoZWlnaHQgKiAwLjcgPyBQb3NpdGlvbi5iZWxvdyA6IFBvc2l0aW9uLm9uO1xuICAgICAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYWJvdmU6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuYmVmb3JlKGRyYWdTZXBhcmF0b3JMaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQb3NpdGlvbi5iZWxvdzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5hZnRlcihkcmFnU2VwYXJhdG9yTGluZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24ub246XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWQgPT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKCFkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4pIHtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5hZnRlcihkcmFnZ2VkKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyYWdIaWdobGlnaHRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50O1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICghKGRyb3BUYXJnZXQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRyb3BUYXJnZXQudGV4dENvbnRlbnQgKz0gYCske2RyYWdnZWQudGV4dENvbnRlbnR9YDtcbiAgICAgICAgICAgIGRyYWdnZWQucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldCA9PT0gZHJhZ2dlZCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBkcmFnZ2VkLnRleHRDb250ZW50IS5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBkcmFnZ2VkLnRleHRDb250ZW50ID0gc3RhdHMuc2hpZnQoKSE7XG4gICAgICAgICAgICBkcmFnZ2VkLmFmdGVyKC4uLnN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1wibGlcIiwgeyBjbGFzczogXCJkcm9wem9uZVwiLCBkcmFnZ2FibGU6IFwidHJ1ZVwiIH0sIHN0YXRdKSkpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuYXBwbHlEcmFnRHJvcCgpO1xuXG5mdW5jdGlvbiBjb21wYXJlKGxoczogbnVtYmVyLCByaHM6IG51bWJlcik6IC0xIHwgMCB8IDEge1xuICAgIGlmIChsaHMgPT09IHJocykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIGxocyA8IHJocyA/IC0xIDogMTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTogQ2hhcmFjdGVyIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJjaGFyYWN0ZXJTZWxlY3RvcnNcIik7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGNoYXJhY3RlckZpbHRlckxpc3QpIHtcbiAgICAgICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQuY2hlY2tlZCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChpc0NoYXJhY3RlcihzZWxlY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0U2VsZWN0ZWRDaGFyYWN0ZXIoY2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCBcIkFsbFwiKSB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LnZhbHVlID09PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGl0ZW1TZWxlY3RvcnMgPSBbXCJwYXJ0c1NlbGVjdG9yXCIsIFwiZ2FjaGFTZWxlY3RvclwiLCBcIm90aGVySXRlbXNTZWxlY3RvclwiXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEl0ZW1TZWxlY3RvciA9IHR5cGVvZiBpdGVtU2VsZWN0b3JzW251bWJlcl07XG5leHBvcnQgZnVuY3Rpb24gaXNJdGVtU2VsZWN0b3IoaXRlbVNlbGVjdG9yOiBzdHJpbmcpOiBpdGVtU2VsZWN0b3IgaXMgSXRlbVNlbGVjdG9yIHtcbiAgICByZXR1cm4gKGl0ZW1TZWxlY3RvcnMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkuaW5jbHVkZXMoaXRlbVNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKTogSXRlbVNlbGVjdG9yIHtcbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGlmIChwYXJ0c1NlbGVjdG9yLmNoZWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIFwicGFydHNTZWxlY3RvclwiO1xuICAgIH1cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGlmIChnYWNoYVNlbGVjdG9yLmNoZWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIFwiZ2FjaGFTZWxlY3RvclwiO1xuICAgIH1cbiAgICBjb25zdCBvdGhlckl0ZW1zU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm90aGVySXRlbXNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShvdGhlckl0ZW1zU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGlmIChvdGhlckl0ZW1zU2VsZWN0b3IuY2hlY2tlZCkge1xuICAgICAgICByZXR1cm4gXCJvdGhlckl0ZW1zU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xufVxuXG5mdW5jdGlvbiBzYXZlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKSB8fCBcIkFsbFwiO1xuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIsIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvL21pc2NcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiLCBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIsIGl0ZW1fbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLmRlbGV0ZV92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIsIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCk7XG4gICAgfVxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIiwgZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiLCBBcnJheS5mcm9tKGV4Y2x1ZGVkX2l0ZW1faWRzKS5qb2luKFwiLFwiKSk7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc3RvcmVkX2NoYXJhY3RlciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIpO1xuICAgIHNldFNlbGVjdGVkQ2hhcmFjdGVyKHR5cGVvZiBzdG9yZWRfY2hhcmFjdGVyID09PSBcInN0cmluZ1wiICYmIGlzQ2hhcmFjdGVyKHN0b3JlZF9jaGFyYWN0ZXIpID8gc3RvcmVkX2NoYXJhY3RlciA6IFwiQWxsXCIpO1xuXG4gICAgey8vRmlsdGVyc1xuICAgICAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoVmFyaWFibGVfc3RvcmFnZS52YXJpYWJsZXMpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIHN0YXRlc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICB7IC8vbWlzY1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIik7XG4gICAgICAgIGlmICh0eXBlb2YgbWF4TGV2ZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHttYXhMZXZlbH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGxldmVscmFuZ2UubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbV9uYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBuYW1lZmlsdGVyLnZhbHVlID0gaXRlbV9uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZW5jaGFudFRvZ2dsZS5jaGVja2VkID0gISFWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgfVxuXG4gICAgeyAvL2l0ZW0gc2VsZWN0aW9uXG4gICAgICAgIGxldCBpdGVtVHlwZVNlbGVjdG9yID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJpdGVtVHlwZVNlbGVjdG9yXCIpO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1UeXBlU2VsZWN0b3IgIT09IFwic3RyaW5nXCIgfHwgIWlzSXRlbVNlbGVjdG9yKGl0ZW1UeXBlU2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBpdGVtVHlwZVNlbGVjdG9yID0gXCJwYXJ0c1NlbGVjdG9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtVHlwZVNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCEoc2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBzZWxlY3Rvci5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGNsdWRlZF9pZHMgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImV4Y2x1ZGVkX2l0ZW1faWRzXCIpO1xuICAgIGlmICh0eXBlb2YgZXhjbHVkZWRfaWRzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgZXhjbHVkZWRfaWRzLnNwbGl0KFwiLFwiKSkge1xuICAgICAgICAgICAgZXhjbHVkZWRfaXRlbV9pZHMuYWRkKHBhcnNlSW50KGlkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhjbHVkZWRfaXRlbV9pZHMuZGVsZXRlKE5hTik7XG5cbiAgICAvL211c3QgYmUgbGFzdCBiZWNhdXNlIGl0IHRyaWdnZXJzIGEgc3RvcmVcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVSZXN1bHRzKCkge1xuICAgIHNhdmVTZWxlY3Rpb24oKTtcbiAgICBjb25zdCBmaWx0ZXJzOiAoKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBjb25zdCBzb3VyY2VGaWx0ZXJzOiAoKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4pW10gPSBbXTtcbiAgICBsZXQgc2VsZWN0ZWRDaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwYXJ0c0ZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhcnRzRmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cblxuICAgIHsgLy9jaGFyYWN0ZXIgZmlsdGVyXG4gICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKTtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5jaGFyYWN0ZXIgPT09IHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ290aGVySXRlbXNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vcGFydHMgZmlsdGVyXG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHNTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCk7XG4gICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gcGFydHNTdGF0ZXNbaXRlbS5wYXJ0XSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ290aGVySXRlbXNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vYXZhaWxhYmlsaXR5IGZpbHRlclxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShhdmFpbGFiaWxpdHlGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QpO1xuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkdvbGRcIl0pIHtcbiAgICAgICAgICAgIHNvdXJjZUZpbHRlcnMucHVzaChpdGVtU291cmNlID0+ICEoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlICYmICFpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJBUFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgaXRlbVNvdXJjZS5hcCAmJiBpdGVtU291cmNlLnByaWNlID4gMCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiVW50cmFkYWJsZVwiXSkge1xuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gaXRlbS5wYXJjZWxfZW5hYmxlZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJBbGxvdyBnYWNoYVwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJHdWFyZGlhblwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIWl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbmF2YWlsYWJsZSBpdGVtc1wiXSkge1xuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyID0gWy4uLnNvdXJjZUZpbHRlcnNdO1xuICAgICAgICAgICAgY29uc3Qgc291cmNlRmlsdGVyID0gKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGF2YWlsYWJpbGl0eVNvdXJjZUZpbHRlci5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZUZpbHRlcihpdGVtU291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR2FjaGFJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGl0ZW1Tb3VyY2UuaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTb3VyY2Uoc291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGlzQXZhaWxhYmxlU291cmNlKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVJdGVtKGl0ZW06IEl0ZW0pOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW1Tb3VyY2Ugb2YgaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShpdGVtU291cmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVycy5wdXNoKGlzQXZhaWxhYmxlSXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vbWlzYyBmaWx0ZXJcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgZmlsdGVycy5wdXNoKChpdGVtOiBJdGVtKSA9PiBpdGVtLmxldmVsIDw9IG1heExldmVsKTtcblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBuYW1lZmlsdGVyLnZhbHVlO1xuICAgICAgICBpZiAoaXRlbV9uYW1lKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLm5hbWVfZW4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhpdGVtX25hbWUudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgeyAvL2lkIGZpbHRlclxuICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiAhZXhjbHVkZWRfaXRlbV9pZHMuaGFzKGl0ZW0uaWQpKTtcbiAgICAgICAgY29uc3QgaXRlbUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIml0ZW1GaWx0ZXJcIik7XG4gICAgICAgIGlmICghKGl0ZW1GaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG5cbiAgICAgICAgfVxuICAgICAgICBpdGVtRmlsdGVyTGlzdC5yZXBsYWNlQ2hpbGRyZW4oKTtcbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBleGNsdWRlZF9pdGVtX2lkcykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zLmdldChpZCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1GaWx0ZXJMaXN0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuLFxuICAgICAgICAgICAgICAgIGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxfcmVtb3ZhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWl0ZW1faW5kZXhcIjogYCR7aWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgUmVtb3ZlICR7aXRlbS5uYW1lX2VufSBmcm9tIGV4Y2x1c2lvbnNgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJSZW1vdmVcIixcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY29uc3QgY29tcGFyYXRvcnM6ICgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IG51bWJlcilbXSA9IFtdO1xuXG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlTdGF0cyA9IEFycmF5XG4gICAgICAgIC5mcm9tKHByaW9yaXR5TGlzdC5jaGlsZE5vZGVzKVxuICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIW5vZGUudGV4dENvbnRlbnQ/LmluY2x1ZGVzKCdcXG4nKSlcbiAgICAgICAgLmZpbHRlcihub2RlID0+IG5vZGUudGV4dENvbnRlbnQpXG4gICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50ISk7XG4gICAge1xuICAgICAgICBmb3IgKGNvbnN0IHN0YXQgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICAgICAgICAgIGNvbXBhcmF0b3JzLnB1c2goKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBjb21wYXJlKFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IGxocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSksXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gcmhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9ICgoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdHNUYWJsZShcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlID0+IHNvdXJjZUZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtcywgaXRlbSkgPT4gc2VsZWN0QnlQcmlvcml0eShpdGVtcywgaXRlbSwgY29tcGFyYXRvcnMpLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eVN0YXRzLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENoYXJhY3RlclxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0R2FjaGFUYWJsZShpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgICAgIGNhc2UgJ290aGVySXRlbXNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoXG4gICAgICAgICAgICAgICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIFwiVE9ETzogT3RoZXIgaXRlbXNcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1wiKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdFJvd3MgPSB0YWJsZS50Qm9kaWVzWzBdPy5yb3dzLmxlbmd0aCA/PyBNYXRoLm1heCgwLCB0YWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xuICAgIHRhcmdldC5pbm5lclRleHQgPSBcIlwiO1xuICAgIGlmIChyZXN1bHRSb3dzID09PSAwKSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWVtcHR5XCIsIHJvbGU6IFwic3RhdHVzXCIgfSxcbiAgICAgICAgICAgIFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIixcbiAgICAgICAgXSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBpZiAocmVzdWx0c1N0YXR1cykge1xuICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID0gcmVzdWx0Um93cyA9PT0gMFxuICAgICAgICAgICAgPyBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCJcbiAgICAgICAgICAgIDogYCR7cmVzdWx0Um93c30gbWF0Y2hpbmcgJHtyZXN1bHRSb3dzID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpIHtcbiAgICBjb25zdCBsZXZlbERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVsRGlzcGxheVwiKTtcbiAgICBpZiAoIShsZXZlbERpc3BsYXkgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbGV2ZWxyYW5nZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBsZXZlbERpc3BsYXkudGV4dENvbnRlbnQgPSBgTWF4IGxldmVsIHJlcXVpcmVtZW50OiAke2xldmVscmFuZ2UudmFsdWV9YDtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNwbGF5VXBkYXRlcygpIHtcbiAgICBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKTtcbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBuYW1lZmlsdGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcblxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgZW5jaGFudFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmlvcml0eVN0YXROb2RlcyA9IEFycmF5XG4gICAgICAgICAgICAuZnJvbShwcmlvcml0eUxpc3QuY2hpbGROb2RlcylcbiAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiAhbm9kZS50ZXh0Q29udGVudD8uaW5jbHVkZXMoJ1xcbicpKVxuICAgICAgICAgICAgLmZpbHRlcihub2RlID0+IG5vZGUudGV4dENvbnRlbnQpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBwcmlvcml0eVN0YXROb2Rlcykge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyAvXigoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLyA6IC9eTWF4ICgoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLztcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VyID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gXCJNYXggJDFcIiA6IFwiJDFcIjtcbiAgICAgICAgICAgIG5vZGUudGV4dENvbnRlbnQgPSBub2RlLnRleHRDb250ZW50IS5zcGxpdChcIitcIikubWFwKHMgPT4gcy5yZXBsYWNlKHJlZ2V4LCByZXBsYWNlcikpLmpvaW4oXCIrXCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuc2V0RGlzcGxheVVwZGF0ZXMoKTtcblxuZnVuY3Rpb24gc2V0TW9iaWxlRmlsdGVyQ29udHJvbHMoKSB7XG4gICAgY29uc3QgZmlsdGVyVG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXJUb2dnbGVcIik7XG4gICAgY29uc3QgY2xvc2VGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZUZpbHRlcnNcIik7XG4gICAgY29uc3QgZmlsdGVyUGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlcl9ncm91cFwiKTtcbiAgICBjb25zdCBmaWx0ZXJCYWNrZHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyQmFja2Ryb3BcIik7XG4gICAgaWYgKCEoZmlsdGVyVG9nZ2xlIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoY2xvc2VGaWx0ZXJzIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyUGFuZWwgaW5zdGFuY2VvZiBIVE1MRmllbGRTZXRFbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlckJhY2tkcm9wIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdG9nZ2xlQnV0dG9uID0gZmlsdGVyVG9nZ2xlO1xuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gY2xvc2VGaWx0ZXJzO1xuICAgIGNvbnN0IHBhbmVsID0gZmlsdGVyUGFuZWw7XG4gICAgY29uc3QgYmFja2Ryb3BCdXR0b24gPSBmaWx0ZXJCYWNrZHJvcDtcblxuICAgIGZ1bmN0aW9uIHNldE9wZW4ob3BlbjogYm9vbGVhbikge1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtb3BlblwiLCBvcGVuKTtcbiAgICAgICAgdG9nZ2xlQnV0dG9uLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgYCR7b3Blbn1gKTtcbiAgICAgICAgYmFja2Ryb3BCdXR0b24uaGlkZGVuID0gIW9wZW47XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImZpbHRlcnMtb3BlblwiLCBvcGVuKTtcbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVGaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgICAgICBpZiAobmFtZUZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBuYW1lRmlsdGVyLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b24uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3Blbih0cnVlKSk7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4oZmFsc2UpKTtcbiAgICBiYWNrZHJvcEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiICYmIHBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgd2luZG93Lm1hdGNoTWVkaWEoXCIobWluLXdpZHRoOiA3NjhweClcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoeyBtYXRjaGVzIH0pID0+IHtcbiAgICAgICAgaWYgKG1hdGNoZXMgJiYgcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuc2V0TW9iaWxlRmlsdGVyQ29udHJvbHMoKTtcblxuZnVuY3Rpb24gc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKSB7XG4gICAgY29uc3QgcHJpb3JpdHlfZ3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2dyb3VwXCIpO1xuICAgIGlmICghKHByaW9yaXR5X2dyb3VwIGluc3RhbmNlb2YgSFRNTEZpZWxkU2V0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlciBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBhcnRzU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdhY2hhU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBvdGhlckl0ZW1zU2VsZWN0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm90aGVySXRlbXNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShvdGhlckl0ZW1zU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIG90aGVySXRlbXNTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgcHJpb3JpdHlfZ3JvdXAuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICBwYXJ0c0ZpbHRlci5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRzR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik7XG4gICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJ0cnVlXCIpO1xuICAgIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCk7XG4gICAgcmVzdG9yZVNlbGVjdGlvbigpO1xuICAgIGF3YWl0IGRvd25sb2FkSXRlbXMoKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNob3dfYWZ0ZXJfbG9hZFwiKSkge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiaGlkZV9hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbWF4TGV2ZWwgPSBnZXRNYXhJdGVtTGV2ZWwoKTtcbiAgICBsZXZlbHJhbmdlLnZhbHVlID0gYCR7TWF0aC5taW4ocGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSksIG1heExldmVsKX1gO1xuICAgIGxldmVscmFuZ2UubWF4ID0gYCR7bWF4TGV2ZWx9YDtcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgc3RhdCB1cCBvciBkb3duIHRvIGNoYW5nZSBpdHMgaW1wb3J0YW5jZSAoZm9yIGV4YW1wbGUgZHJhZyBMb2IgYWJvdmUgQ2hhcmdlKS5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIkRyYWcgYSBzdGF0IG9udG8gYW5vdGhlciB0byBjb21iaW5lIHRoZW0gKGZvciBleGFtcGxlIFN0ciBvbnRvIERleCwgdGhlIHJlc3VsdHMgd2lsbCBkaXNwbGF5IFN0citEZXgpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIGNvbWJpbmVkIHN0YXQgb250byBpdHNlbGYgdG8gc2VwYXJhdGUgdGhlbS5cIl0pKSk7XG4gICAgfVxufSk7XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJpdGVtX3JlbW92YWxcIikge1xuICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldC5jbGFzc05hbWUgPT09IFwiaXRlbV9yZW1vdmFsX3JlbW92YWxcIikge1xuICAgICAgICBpZiAoIWV2ZW50LnRhcmdldC5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5kZWxldGUocGFyc2VJbnQoZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdEJ5UHJpb3JpdHk8VD4oXG4gICAgY3VycmVudDogVFtdLFxuICAgIGNhbmRpZGF0ZTogVCxcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBUW10ge1xuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgfVxuICAgIGZvciAoY29uc3QgY29tcGFyYXRvciBvZiBjb21wYXJhdG9ycykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wYXJhdG9yKGN1cnJlbnRbMF0sIGNhbmRpZGF0ZSk7XG4gICAgICAgIGlmIChyZXN1bHQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3VsdCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbLi4uY3VycmVudCwgY2FuZGlkYXRlXTtcbn1cbiIsImV4cG9ydCB0eXBlIFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMgPSBudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuO1xuXG50eXBlIFN0b3JhZ2VfdmFsdWUgPSBgJHtcInNcIiB8IFwiblwiIHwgXCJiXCJ9JHtzdHJpbmd9YDtcblxuZnVuY3Rpb24gdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKTogU3RvcmFnZV92YWx1ZSB7XG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgcmV0dXJuIGBzJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gYG4ke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBcImIxXCIgOiBcImIwXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdHJpbmdfdG9fdmFyaWFibGUodnY6IFN0b3JhZ2VfdmFsdWUpOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIHtcbiAgICBjb25zdCBwcmVmaXggPSB2dlswXTtcbiAgICBjb25zdCB2YWx1ZSA9IHZ2LnN1YnN0cmluZygxKTtcbiAgICBzd2l0Y2ggKHByZWZpeCkge1xuICAgICAgICBjYXNlICdzJzogLy9zdHJpbmdcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgY2FzZSAnbic6IC8vbnVtYmVyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGNhc2UgJ2InOiAvL2Jvb2xlYW5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA9PT0gXCIxXCIgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIHRocm93IGBpbnZhbGlkIHZhbHVlOiAke3Z2fWA7XG59XG5cbmZ1bmN0aW9uIGlzX3N0b3JhZ2VfdmFsdWUoa2V5OiBzdHJpbmcpOiBrZXkgaXMgU3RvcmFnZV92YWx1ZSB7XG4gICAgcmV0dXJuIGtleS5sZW5ndGggPj0gMSAmJiBcInNuYlwiLmluY2x1ZGVzKGtleVswXSk7XG59XG5cbmV4cG9ydCBjbGFzcyBWYXJpYWJsZV9zdG9yYWdlIHtcbiAgICBzdGF0aWMgZ2V0X3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgICAgICBpZiAodHlwZW9mIHN0b3JlZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZShzdG9yZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ190b192YXJpYWJsZShzdG9yZWQpO1xuICAgIH1cbiAgICBzdGF0aWMgc2V0X3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZywgdmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gLCB2YXJpYWJsZV90b19zdHJpbmcodmFsdWUpKTtcbiAgICB9XG4gICAgc3RhdGljIGRlbGV0ZV92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICB9XG4gICAgc3RhdGljIGNsZWFyX2FsbCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgdmFyaWFibGVzKCkge1xuICAgICAgICBsZXQgcmVzdWx0OiB7IFtrZXk6IHN0cmluZ106IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMgfSA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHN0cmluZ190b192YXJpYWJsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59Il19
