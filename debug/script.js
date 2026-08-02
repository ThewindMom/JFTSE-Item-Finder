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
exports.characters = exports.ShopItemSource = exports.ItemSource = exports.Item = exports.GuardianItemSource = exports.GachaItemSource = exports.Gacha = void 0;
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
  constructor(shop_index, gacha_index, name, price = 0, ap = false, enabled = false) {
    this.shop_index = shop_index;
    this.gacha_index = gacha_index;
    this.name = name;
    this.price = price;
    this.ap = ap;
    this.enabled = enabled;
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
      gachas.set(apiItem.productIndex, new Gacha(apiItem.productIndex, apiItem.item0, apiItem.name, apiItem.price0, apiItem.priceType === "MINT", apiItem.enabled));
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
  const max_shop_pages = 20; //currently need only 10, should be enough
  const shopURL = "/api/shop?size=1000&page=";
  const shopDatas = [...Array(max_shop_pages).keys()].map(n => download(`${shopURL}${n}`));
  const guardianURL = guardianSource + "/GuardianStages.json";
  const guardianData = download(guardianURL);
  parseItemData(await itemData);
  itemArtMap = JSON.parse(await itemArtData);
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
  const excludeButton = (0, _html.createHTML)(["button", {
    class: "item_removal",
    "data-item_index": `${item.id}`,
    "aria-label": `Exclude ${item.name_en} from results`,
    type: "button",
    title: `Exclude ${item.name_en}`
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
  return createPopupLink(itemSource.item.name_en, content);
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
  return [...item.sources.values()].filter(sourceFilter).map(itemSource => sourceItemElement(item, itemSource, character));
}
function isPlainTextSourceGroup(elements) {
  return elements.length > 0 && elements.every(element => typeof element === "string");
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
    // Comma only between adjacent plain-text sources (e.g. "100 Gold, 50 AP").
    // Gacha/guardian cards are block elements — a text comma becomes a visual break.
    if (previousGroup !== undefined && isPlainTextSourceGroup(previousGroup) && isPlainTextSourceGroup(elements)) {
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
function createGachaCurrencyLabel(gacha) {
  if (gacha.enabled) {
    if (gacha.ap) {
      return (0, _html.createHTML)(["span", {
        class: "gacha-currency gacha-currency--ap"
      }, "AP"]);
    }
    return (0, _html.createHTML)(["span", {
      class: "gacha-currency gacha-currency--gold"
    }, "Gold"]);
  }
  const currency = gacha.ap ? "AP" : "Gold";
  return (0, _html.createHTML)(["span", {
    class: "gacha-currency gacha-currency--unavailable",
    title: `${currency} coin is not currently sold in the live shop`
  }, `${currency} · Not available`]);
}
function createGachaSourceSummary(item, itemSource, character) {
  const gacha = gachas.get(itemSource.shop_id);
  if (!gacha) {
    throw "Internal error";
  }
  return (0, _html.createHTML)(["div", {
    class: "gacha-source-summary",
    role: "group",
    "aria-label": `${gacha.name} acquisition`
  }, createGachaCoinArt(gacha), ["div", {
    class: "gacha-source-summary__content"
  }, ["div", {
    class: "gacha-identity"
  }, createGachaSourcePopup(item, itemSource, itemSource.requiresGuardian ? undefined : character), createGachaCurrencyLabel(gacha)]]]);
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
  const table = (0, _html.createHTML)(["table", ["caption", "Gacha coins with Gold or AP denomination"], ["tr", ["th", {
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

},{"./html":2}],4:[function(require,module,exports){
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
    up.setAttribute("aria-label", `Move ${stat} higher in priority`);
    up.title = `Move ${stat} up`;
  }
  if (down instanceof HTMLButtonElement) {
    down.setAttribute("aria-label", `Move ${stat} lower in priority`);
    down.title = `Move ${stat} down`;
  }
}
function createPriorityListItem(stat) {
  const up = (0, _html.createHTML)(["button", {
    type: "button",
    class: "priority-move priority-move-up",
    "aria-label": `Move ${stat} higher in priority`,
    title: `Move ${stat} up`
  }]);
  up.append(createPriorityMoveIcon("up"));
  const down = (0, _html.createHTML)(["button", {
    type: "button",
    class: "priority-move priority-move-down",
    "aria-label": `Move ${stat} lower in priority`,
    title: `Move ${stat} down`
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

},{"./checkboxTree":1,"./html":2,"./itemLookup":3,"./priority":5,"./storage":6}],5:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJodG1sLnRzIiwiaXRlbUxvb2t1cC50cyIsIm1haW4udHMiLCJwcmlvcml0eS50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWE7RUFDekMsSUFBSSxFQUFFLFNBQVMsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzFDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO0lBQzNFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDOUM7SUFDSjtJQUNBLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDtJQUNKO0lBQ0EsT0FBTyxLQUFLLENBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUNwQyxNQUFNLENBQUUsQ0FBQyxJQUF5QixDQUFDLFlBQVksYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksZ0JBQWdCLENBQUMsQ0FDMUcsR0FBRyxDQUFDLENBQUMsSUFB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QUM7RUFDVCxLQUFLLEdBQUcsQ0FBQztFQUNULEtBQUssR0FBRyxDQUFDO0VBQ1QsS0FBSyxHQUFHLENBQUM7RUFDVCxLQUFLLEdBQUcsQ0FBQztFQUNULEtBQUssR0FBRyxDQUFDO0VBQ1QsS0FBSyxHQUFHLENBQUM7RUFDVCxLQUFLLEdBQUcsQ0FBQztFQUNULEtBQUssR0FBRyxDQUFDOztBQUdiLFNBQVMsU0FBUyxDQUFDLEdBQVE7RUFDdkIsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtJQUN6QyxPQUFPLEtBQUs7RUFDaEI7RUFDQSxPQUFPLENBQ0gsT0FBTyxHQUFHLENBQUMsWUFBWSxLQUFLLFFBQVEsRUFDcEMsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFDL0IsT0FBTyxHQUFHLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFDbkMsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFDaEMsT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFDL0IsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUIsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFDakMsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDOUIsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDOUIsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDOUIsT0FBTyxHQUFHLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFDbkMsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFDaEMsT0FBTyxH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T0FBTyxlQUFlLENBQUMsYUFBcUI7SUFDeEMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDO0VBQy9DO0VBQ0EsT0FBTyxTQUFTLENBQUE7SUFDWixZQUFZLENBQUMsS0FBSyxFQUFFO0VBQ3hCO0VBQ0EsV0FBVyxTQUFTLENBQUE7SUFDaEIsSUFBSSxNQUFNLEdBQThDLEVBQUU7SUFDMUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDMUMsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDL0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDekI7TUFDSjtNQUNBLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO01BQ3ZDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzNCO01BQ0o7TUFDQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUI7TUFDSjtNQUNBLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7SUFDM0M7SUFDQSxPQUFPLE1BQU07RUFDakI7O0FBQ0gsT0FBQSxDQUFBLGdCQUFBLEdBQUEsZ0JBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IHR5cGUgVHJlZU5vZGUgPSBzdHJpbmcgfCBUcmVlTm9kZVtdO1xuXG5mdW5jdGlvbiBnZXRDaGlsZHJlbihub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogSFRNTElucHV0RWxlbWVudFtdIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGZvciAobGV0IGNoaWxkSW5kZXggPSAwOyBjaGlsZEluZGV4IDwgcGFyZW50X3VsLmNoaWxkcmVuLmxlbmd0aDsgY2hpbGRJbmRleCsrKSB7XG4gICAgICAgIGlmIChwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleF0gIT09IHBhcmVudF9saSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG90ZW50aWFsU2libGluZ0VudHJ5ID0gcGFyZW50X3VsLmNoaWxkcmVuW2NoaWxkSW5kZXggKyAxXT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBvdGVudGlhbFNpYmxpbmdFbnRyeSBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKHBvdGVudGlhbFNpYmxpbmdFbnRyeS5jaGlsZHJlbilcbiAgICAgICAgICAgIC5maWx0ZXIoKGUpOiBlIGlzIEhUTUxMSUVsZW1lbnQgPT4gZSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgZS5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpXG4gICAgICAgICAgICAubWFwKGUgPT4gZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKG5vZGUpKSB7XG4gICAgICAgIGlmIChjaGlsZC5jaGVja2VkICE9PSBub2RlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNoaWxkLmNoZWNrZWQgPSBub2RlLmNoZWNrZWQ7XG4gICAgICAgICAgICBjaGlsZC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgICAgICAgICBhcHBseUNoZWNrZWRUb0Rlc2NlbmRhbnRzKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50KG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50IHwgdm9pZCB7XG4gICAgY29uc3QgcGFyZW50X2xpID0gbm9kZS5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50Py5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF9saSBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFyZW50X3VsID0gcGFyZW50X2xpLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X3VsIGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY2FuZGlkYXRlOiBIVE1MTElFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50X3VsLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQgJiYgY2hpbGQuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjYW5kaWRhdGUgPSBjaGlsZDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZCA9PT0gcGFyZW50X2xpICYmIGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVBbmNlc3RvcnMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGdldFBhcmVudChub2RlKTtcbiAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBmb3VuZENoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRVbmNoZWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgZm91bmRJbmRldGVybWluYXRlID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdldENoaWxkcmVuKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGZvdW5kQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkLmluZGV0ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGZvdW5kSW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZvdW5kSW5kZXRlcm1pbmF0ZSB8fCBmb3VuZENoZWNrZWQgJiYgZm91bmRVbmNoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmluZGV0ZXJtaW5hdGUgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZENoZWNrZWQpIHtcbiAgICAgICAgcGFyZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmIChmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICB1cGRhdGVBbmNlc3RvcnMocGFyZW50KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVyKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHModGFyZ2V0KTtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKHRhcmdldCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tMaXN0ZW5lcnMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVyKGVsZW1lbnQuY2hpbGRyZW5bMF0gYXMgSFRNTElucHV0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tMaXN0ZW5lcnMoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlOiBUcmVlTm9kZSk6IEhUTUxMSUVsZW1lbnQge1xuICAgIGlmICh0eXBlb2YgdHJlZU5vZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmVlTm9kZVswXSA9PT0gXCIrXCIpIHtcbiAgICAgICAgICAgIHRyZWVOb2RlID0gdHJlZU5vZGUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpLFxuICAgICAgICAgICAgICAgICAgICAuLi4oY2hlY2tlZCAmJiB7IGNoZWNrZWQ6IFwiY2hlY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgeyBmb3I6IHRyZWVOb2RlLnJlcGxhY2VBbGwoXCIgXCIsIFwiX1wiKSB9LFxuICAgICAgICAgICAgICAgIHRyZWVOb2RlXG4gICAgICAgICAgICBdXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IGNyZWF0ZUhUTUwoW1widWxcIiwgeyBjbGFzczogXCJjaGVja2JveFwiIH1dKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRyZWVOb2RlW2ldO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChtYWtlQ2hlY2tib3hUcmVlTm9kZShub2RlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1wibGlcIiwgbGlzdF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDaGVja2JveFRyZWUodHJlZU5vZGU6IFRyZWVOb2RlKSB7XG4gICAgbGV0IHJvb3QgPSBtYWtlQ2hlY2tib3hUcmVlTm9kZSh0cmVlTm9kZSkuY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocm9vdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgYXBwbHlDaGVja0xpc3RlbmVycyhyb290KTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKHJvb3QpKSB7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIGdldExlYXZlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHJlc3VsdDogSFRNTElucHV0RWxlbWVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoZ2V0Q2hpbGRyZW4oaW5wdXQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoZ2V0TGVhdmVzKGlucHV0KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExlYWZTdGF0ZXMobm9kZTogSFRNTFVMaXN0RWxlbWVudCkge1xuICAgIGxldCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9ID0ge307XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBzdGF0ZXNbbGVhZi5pZC5yZXBsYWNlQWxsKFwiX1wiLCBcIiBcIildID0gbGVhZi5jaGVja2VkO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50LCBzdGF0ZXM6IHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9KSB7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGdldExlYXZlcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV07XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxlYWYuY2hlY2tlZCA9IHN0YXRlO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnMobGVhZik7XG4gICAgfVxufVxuIiwidHlwZSBUYWdfbmFtZSA9IGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcDtcbnR5cGUgQXR0cmlidXRlcyA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG50eXBlIEhUTUxfbm9kZTxUIGV4dGVuZHMgVGFnX25hbWU+ID0gW1QsIC4uLihIVE1MX25vZGU8VGFnX25hbWU+IHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCBBdHRyaWJ1dGVzKVtdXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhUTUw8VCBleHRlbmRzIFRhZ19uYW1lPihub2RlOiBIVE1MX25vZGU8VD4pOiBIVE1MRWxlbWVudFRhZ05hbWVNYXBbVF0ge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVbMF0pO1xuICAgIGZ1bmN0aW9uIGhhbmRsZShwYXJhbWV0ZXI6IEF0dHJpYnV0ZXMgfCBIVE1MX25vZGU8VGFnX25hbWU+IHwgSFRNTEVsZW1lbnQgfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXIgPT09IFwic3RyaW5nXCIgfHwgcGFyYW1ldGVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKHBhcmFtZXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwYXJhbWV0ZXIpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChjcmVhdGVIVE1MKHBhcmFtZXRlcikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVyKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBwYXJhbWV0ZXJba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBub2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhbmRsZShub2RlW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG4iLCJpbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcblxuZXhwb3J0IGNvbnN0IGNoYXJhY3RlcnMgPSBbXCJOaWtpXCIsIFwiTHVuTHVuXCIsIFwiTHVjeVwiLCBcIlNodWFcIiwgXCJEaGFucGlyXCIsIFwiUG9jaGlcIiwgXCJBbFwiXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIENoYXJhY3RlciA9IHR5cGVvZiBjaGFyYWN0ZXJzW251bWJlcl07XG5leHBvcnQgZnVuY3Rpb24gaXNDaGFyYWN0ZXIoY2hhcmFjdGVyOiBzdHJpbmcpOiBjaGFyYWN0ZXIgaXMgQ2hhcmFjdGVyIHtcbiAgICByZXR1cm4gKGNoYXJhY3RlcnMgYXMgdW5rbm93biBhcyBzdHJpbmdbXSkuaW5jbHVkZXMoY2hhcmFjdGVyKTtcbn1cblxuZXhwb3J0IHR5cGUgUGFydCA9IFwiSGF0XCIgfCBcIkhhaXJcIiB8IFwiRHllXCIgfCBcIlVwcGVyXCIgfCBcIkxvd2VyXCIgfCBcIlNob2VzXCIgfCBcIlNvY2tzXCIgfCBcIkhhbmRcIiB8IFwiQmFja3BhY2tcIiB8IFwiRmFjZVwiIHwgXCJSYWNrZXRcIiB8IFwiT3RoZXJcIjtcblxuZXhwb3J0IGNsYXNzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNob3BfaWQ6IG51bWJlcikgeyB9XG5cbiAgICBnZXQgcmVxdWlyZXNHdWFyZGlhbigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBbLi4udGhpcy5pdGVtLnNvdXJjZXMudmFsdWVzKCldLmV2ZXJ5KHNvdXJjZSA9PiBzb3VyY2UucmVxdWlyZXNHdWFyZGlhbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaXRlbSgpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIGZpbmRpbmcgaXRlbSBvZiBpdGVtU291cmNlICR7dGhpcy5zaG9wX2lkfWApO1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNob3BJdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3Ioc2hvcF9pZDogbnVtYmVyLCByZWFkb25seSBwcmljZTogbnVtYmVyLCByZWFkb25seSBhcDogYm9vbGVhbiwgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSkge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYUl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIpIHtcbiAgICAgICAgc3VwZXIoc2hvcF9pZCk7XG4gICAgfVxuXG4gICAgZ2FjaGFUcmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KHRoaXMuc2hvcF9pZCk7XG4gICAgICAgIGlmICghZ2FjaGEpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2FjaGEuYXZlcmFnZV90cmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgR2FjaGFFY29ub21pY3MgPVxuICAgIHwge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwidW5hdmFpbGFibGVcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBleHBlY3RlZFB1bGxzOiBudW1iZXI7XG4gICAgfVxuICAgIHwge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwiZGlyZWN0XCI7XG4gICAgICAgIGNoYW5jZVBlcmNlbnQ6IG51bWJlcjtcbiAgICAgICAgY3VycmVuY3k6IFwiQVBcIiB8IFwiR29sZFwiO1xuICAgICAgICBleHBlY3RlZFB1bGxzOiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkU3BlbmQ6IG51bWJlcjtcbiAgICAgICAgcHJpY2VQZXJQdWxsOiBudW1iZXI7XG4gICAgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3RHYWNoYUVjb25vbWljcyhcbiAgICBleHBlY3RlZFB1bGxzOiBudW1iZXIsXG4gICAgc291cmNlPzogeyBwcmljZTogbnVtYmVyOyBhcDogYm9vbGVhbiB9LFxuKTogR2FjaGFFY29ub21pY3Mge1xuICAgIGNvbnN0IGNoYW5jZVBlcmNlbnQgPSBleHBlY3RlZFB1bGxzID4gMCA/IDEwMCAvIGV4cGVjdGVkUHVsbHMgOiAwO1xuICAgIGlmICghc291cmNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhdmFpbGFiaWxpdHk6IFwidW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIGNoYW5jZVBlcmNlbnQsXG4gICAgICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhdmFpbGFiaWxpdHk6IFwiZGlyZWN0XCIsXG4gICAgICAgIGNoYW5jZVBlcmNlbnQsXG4gICAgICAgIGN1cnJlbmN5OiBzb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIixcbiAgICAgICAgZXhwZWN0ZWRQdWxscyxcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogZXhwZWN0ZWRQdWxscyAqIHNvdXJjZS5wcmljZSxcbiAgICAgICAgcHJpY2VQZXJQdWxsOiBzb3VyY2UucHJpY2UsXG4gICAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIEd1YXJkaWFuSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBndWFyZGlhbl9tYXA6IHN0cmluZyxcbiAgICAgICAgcmVhZG9ubHkgaXRlbXM6IEl0ZW1bXSxcbiAgICAgICAgcmVhZG9ubHkgeHA6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmVlZF9ib3NzOiBib29sZWFuLFxuICAgICAgICByZWFkb25seSBib3NzX3RpbWU6IG51bWJlcikge1xuICAgICAgICBzdXBlcihHdWFyZGlhbkl0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwX2lkKGd1YXJkaWFuX21hcCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBndWFyZGlhbl9tYXBfaWQobWFwOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5ndWFyZGlhbl9tYXBzLmluZGV4T2YobWFwKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5ndWFyZGlhbl9tYXBzLnB1c2gobWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLWluZGV4O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGd1YXJkaWFuX21hcHMgPSBbXCJcIl07XG59XG5cbmV4cG9ydCBjbGFzcyBJdGVtIHtcbiAgICBpZCA9IDA7XG4gICAgbmFtZV9rciA9IFwiXCI7XG4gICAgbmFtZV9lbiA9IFwiXCI7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgbWF4VXNlID0gMDtcbiAgICBoaWRkZW4gPSBmYWxzZTtcbiAgICByZXNpc3QgPSBcIlwiO1xuICAgIGNoYXJhY3Rlcj86IENoYXJhY3RlcjtcbiAgICBwYXJ0OiBQYXJ0ID0gXCJPdGhlclwiO1xuICAgIGxldmVsID0gMDtcbiAgICBzdHIgPSAwO1xuICAgIHN0YSA9IDA7XG4gICAgZGV4ID0gMDtcbiAgICB3aWwgPSAwO1xuICAgIGhwID0gMDtcbiAgICBxdWlja3Nsb3RzID0gMDtcbiAgICBidWZmc2xvdHMgPSAwO1xuICAgIHNtYXNoID0gMDtcbiAgICBtb3ZlbWVudCA9IDA7XG4gICAgY2hhcmdlID0gMDtcbiAgICBsb2IgPSAwO1xuICAgIHNlcnZlID0gMDtcbiAgICBtYXhfc3RyID0gMDtcbiAgICBtYXhfc3RhID0gMDtcbiAgICBtYXhfZGV4ID0gMDtcbiAgICBtYXhfd2lsID0gMDtcbiAgICBlbGVtZW50X2VuY2hhbnRhYmxlID0gZmFsc2U7XG4gICAgcGFyY2VsX2VuYWJsZWQgPSBmYWxzZTtcbiAgICBzcGluID0gMDtcbiAgICBhdHNzID0gMDtcbiAgICBkZnNzID0gMDtcbiAgICBzb2NrZXQgPSAwO1xuICAgIGdhdWdlID0gMDtcbiAgICBnYXVnZV9iYXR0bGUgPSAwO1xuICAgIHNvdXJjZXM6IEl0ZW1Tb3VyY2VbXSA9IFtdO1xuICAgIHN0YXRGcm9tU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSBcIk1vdiBTcGVlZFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVtZW50O1xuICAgICAgICAgICAgY2FzZSBcIkNoYXJnZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYXJnZTtcbiAgICAgICAgICAgIGNhc2UgXCJMb2JcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2I7XG4gICAgICAgICAgICBjYXNlIFwiU21hc2hcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zbWFzaDtcbiAgICAgICAgICAgIGNhc2UgXCJTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdHI7XG4gICAgICAgICAgICBjYXNlIFwiRGV4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV4O1xuICAgICAgICAgICAgY2FzZSBcIlN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YTtcbiAgICAgICAgICAgIGNhc2UgXCJXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lsO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdHJcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RyO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfZGV4O1xuICAgICAgICAgICAgY2FzZSBcIk1heCBTdGFcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfc3RhO1xuICAgICAgICAgICAgY2FzZSBcIk1heCBXaWxsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4X3dpbDtcbiAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlcnZlO1xuICAgICAgICAgICAgY2FzZSBcIlF1aWNrc2xvdHNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5xdWlja3Nsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkJ1ZmZzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1ZmZzbG90cztcbiAgICAgICAgICAgIGNhc2UgXCJIUFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhwO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYWNoYSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHNob3BfaW5kZXg6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgZ2FjaGFfaW5kZXg6IG51bWJlcixcbiAgICAgICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBwcmljZTogbnVtYmVyID0gMCxcbiAgICAgICAgcmVhZG9ubHkgYXA6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXJhY3RlciBvZiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnNob3BfaXRlbXMuc2V0KGNoYXJhY3RlciwgbmV3IE1hcDxJdGVtLCBbLypwcm9iYWJpbGl0eToqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWluOiovIG51bWJlciwgLypxdWFudGl0eV9tYXg6Ki8gbnVtYmVyXT4oKSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZChpdGVtOiBJdGVtLCBwcm9iYWJpbGl0eTogbnVtYmVyLCBjaGFyYWN0ZXI6IENoYXJhY3RlciwgcXVhbnRpdHlfbWluOiBudW1iZXIsIHF1YW50aXR5X21heDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpdGVtLmNoYXJhY3RlciAmJiBpdGVtLmNoYXJhY3RlciAhPT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUuaW5mbyhgSXRlbSAke2l0ZW0uaWR9IGZyb20gZ2FjaGEgXCIke3RoaXMubmFtZX1cIiAke3RoaXMuZ2FjaGFfaW5kZXh9IGhhcyB3cm9uZyBjaGFyYWN0ZXJgKTtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGl0ZW0uY2hhcmFjdGVyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2hvcF9pdGVtcy5nZXQoY2hhcmFjdGVyKSEuc2V0KGl0ZW0sIFtwcm9iYWJpbGl0eSwgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdKTtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuc2V0KGNoYXJhY3RlciwgcHJvYmFiaWxpdHkgKyAodGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikgfHwgMCkpO1xuICAgIH1cblxuICAgIGF2ZXJhZ2VfdHJpZXMoaXRlbTogSXRlbSwgY2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgY2hhcnM6IHJlYWRvbmx5IENoYXJhY3RlcltdID0gY2hhcmFjdGVyID8gKFtjaGFyYWN0ZXJdKSA6IGNoYXJhY3RlcnM7XG4gICAgICAgIGNvbnN0IHByb2JhYmlsaXR5ID0gY2hhcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyAodGhpcy5zaG9wX2l0ZW1zLmdldChjaGFyYWN0ZXIpIS5nZXQoaXRlbSk/LlswXSB8fCAwKSwgMCk7XG4gICAgICAgIGlmIChwcm9iYWJpbGl0eSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG90YWxfcHJvYmFiaWxpdHkgPSBjaGFycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpISwgMCk7XG4gICAgICAgIHJldHVybiB0b3RhbF9wcm9iYWJpbGl0eSAvIHByb2JhYmlsaXR5O1xuICAgIH1cblxuICAgIGdldCB0b3RhbF9wcm9iYWJpbGl0eSgpIHtcbiAgICAgICAgcmV0dXJuIGNoYXJhY3RlcnMucmVkdWNlKChwLCBjaGFyYWN0ZXIpID0+IHAgKyB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSEsIDApO1xuICAgIH1cblxuICAgIGNoYXJhY3Rlcl9wcm9iYWJpbGl0eSA9IG5ldyBNYXA8Q2hhcmFjdGVyLCBudW1iZXI+KCk7XG4gICAgc2hvcF9pdGVtcyA9IG5ldyBNYXA8Q2hhcmFjdGVyLCBNYXA8SXRlbSwgWy8qcHJvYmFiaWxpdHk6Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21pbjoqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWF4OiovIG51bWJlcl0+PigpO1xufVxuXG5leHBvcnQgbGV0IGl0ZW1zID0gbmV3IE1hcDxudW1iZXIsIEl0ZW0+KCk7XG5leHBvcnQgbGV0IHNob3BfaXRlbXMgPSBuZXcgTWFwPG51bWJlciwgSXRlbT4oKTtcbmV4cG9ydCBsZXQgZ2FjaGFzID0gbmV3IE1hcDxudW1iZXIsIEdhY2hhPigpO1xubGV0IGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQgfCB1bmRlZmluZWQ7XG50eXBlIEl0ZW1BcnRFbnRyeSA9IFtzaGVldDogc3RyaW5nLCBjZWxsOiBudW1iZXJdO1xudHlwZSBJdGVtQXJ0U2hlZXQgPSB7XG4gICAgbGluZUNvdW50OiBudW1iZXI7XG4gICAgc2l6ZTogbnVtYmVyO1xuICAgIHNwYWNlOiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbn07XG50eXBlIExvdHRlcnlBcnRFbnRyeSA9IHtcbiAgICBzaGVldDogc3RyaW5nO1xuICAgIGNlbGw6IG51bWJlcjtcbiAgICBjb2xvcjogc3RyaW5nO1xuICAgIHNoYXBlOiBcImNvaW5cIiB8IFwiY3ViZVwiIHwgXCJ0b2tlblwiO1xufTtcbnR5cGUgSXRlbUFydE1hcCA9IHtcbiAgICBpdGVtczogUmVjb3JkPHN0cmluZywgSXRlbUFydEVudHJ5PjtcbiAgICBsb3R0ZXJpZXM6IFJlY29yZDxzdHJpbmcsIExvdHRlcnlBcnRFbnRyeT47XG4gICAgc2hlZXRzOiBSZWNvcmQ8c3RyaW5nLCBJdGVtQXJ0U2hlZXQ+O1xufTtcbmxldCBpdGVtQXJ0TWFwOiBJdGVtQXJ0TWFwID0geyBpdGVtczoge30sIGxvdHRlcmllczoge30sIHNoZWV0czoge30gfTtcblxuZnVuY3Rpb24gcHJldHR5TnVtYmVyKG46IG51bWJlciwgZGlnaXRzOiBudW1iZXIpIHtcbiAgICBsZXQgcyA9IG4udG9GaXhlZChkaWdpdHMpO1xuICAgIHdoaWxlIChzLmVuZHNXaXRoKFwiMFwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIGlmIChzLmVuZHNXaXRoKFwiLlwiKSkge1xuICAgICAgICBzID0gcy5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIHJldHVybiBzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUl0ZW1EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJdGVtcyBmaWxlIGlzIG9ubHkgJHtkYXRhLmxlbmd0aH0gYnl0ZXMgbG9uZ2ApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIHJlc3VsdF0gb2YgZGF0YS5tYXRjaEFsbCgvXFw8SXRlbSAoLiopXFwvXFw+L2cpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW06IEl0ZW0gPSBuZXcgSXRlbTtcbiAgICAgICAgZm9yIChjb25zdCBbLCBhdHRyaWJ1dGUsIHZhbHVlXSBvZiByZXN1bHQubWF0Y2hBbGwoL1xccz8oW149XSopPVwiKFteXCJdKilcIi9nKSkge1xuICAgICAgICAgICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiSW5kZXhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5pZCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIl9OYW1lX1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfa3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk5hbWVfTlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm5hbWVfZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVzZVR5cGVcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51c2VUeXBlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNYXhVc2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhVc2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJIaWRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaGlkZGVuID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSZXNpc3RcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZXNpc3QgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNoYXJcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk5JS0lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTmlraVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxVTkxVTlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdW5MdW5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVUNZXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkx1Y3lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTSFVBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIlNodWFcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJESEFOUElSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkRoYW5waXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQT0NISVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJQb2NoaVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFMXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIkFsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBjaGFyYWN0ZXIgXCIke3ZhbHVlfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlBhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQkFHXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJCYWNrcGFja1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkdMQVNTRVNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkZhY2VcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQU5EXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU09DS1NcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNvY2tzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRk9PVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiU2hvZXNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDQVBcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIkhhdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlBBTlRTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJMb3dlclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlJBQ0tFVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiUmFja2V0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQk9EWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiVXBwZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIQUlSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYWlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRFlFXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJEeWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHBhcnQgJHt2YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTGV2ZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZXZlbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUUlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0ciA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0YSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRleCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIldJTFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLndpbCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkFkZEhQXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaHAgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRRdWlja1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnF1aWNrc2xvdHMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRCdWZmXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYnVmZnNsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU21hc2hTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNtYXNoID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTW92ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubW92ZW1lbnQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyZ2VzaG90U3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyZ2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJMb2JTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmxvYiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNlcnZlU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXJ2ZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9TVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfc3RyID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLnN0cik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RBXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0YSA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX0RFWFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9kZXggPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9XSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfd2lsID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLndpbCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmNoYW50RWxlbWVudFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmVsZW1lbnRfZW5jaGFudGFibGUgPSAhIXBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkVuYWJsZVBhcmNlbFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcmNlbF9lbmFibGVkID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJCYWxsU3BpblwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNwaW4gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBVFNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXRzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRGU1NcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZnNzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU29ja2V0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc29ja2V0ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiR2F1Z2VcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nYXVnZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlQmF0dGxlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2VfYmF0dGxlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gaXRlbSBhdHRyaWJ1dGUgXCIke2F0dHJpYnV0ZX1cImApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGl0ZW1zLnNldChpdGVtLmlkLCBpdGVtKTtcbiAgICB9XG59XG5cbmNsYXNzIEFwaUl0ZW0ge1xuICAgIHByb2R1Y3RJbmRleCA9IDA7XG4gICAgZGlzcGxheSA9IDA7XG4gICAgaGl0RGlzcGxheSA9IGZhbHNlO1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICB1c2UwID0gMDtcbiAgICB1c2UxID0gMDtcbiAgICB1c2UyID0gMDtcbiAgICBwcmljZVR5cGUgPSBcIkdPTERcIjtcbiAgICBvbGRQcmljZTAgPSAwO1xuICAgIG9sZFByaWNlMSA9IDA7XG4gICAgb2xkUHJpY2UyID0gMDtcbiAgICBwcmljZTAgPSAwO1xuICAgIHByaWNlMSA9IDA7XG4gICAgcHJpY2UyID0gMDtcbiAgICBjb3VwbGVQcmljZSA9IDA7XG4gICAgY2F0ZWdvcnkgPSBcIlwiO1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGdvbGRCYWNrID0gMDtcbiAgICBlbmFibGVQYXJjZWwgPSBmYWxzZTtcbiAgICBmb3JQbGF5ZXIgPSAwO1xuICAgIGl0ZW0wID0gMDtcbiAgICBpdGVtMSA9IDA7XG4gICAgaXRlbTIgPSAwO1xuICAgIGl0ZW0zID0gMDtcbiAgICBpdGVtNCA9IDA7XG4gICAgaXRlbTUgPSAwO1xuICAgIGl0ZW02ID0gMDtcbiAgICBpdGVtNyA9IDA7XG4gICAgaXRlbTggPSAwO1xuICAgIGl0ZW05ID0gMDtcbn1cblxuZnVuY3Rpb24gaXNBcGlJdGVtKG9iajogYW55KTogb2JqIGlzIEFwaUl0ZW0ge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICAgIHR5cGVvZiBvYmoucHJvZHVjdEluZGV4ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmRpc3BsYXkgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaGl0RGlzcGxheSA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlZCA9PT0gXCJib29sZWFuXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlVHlwZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UwID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY291cGxlUHJpY2UgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouY2F0ZWdvcnkgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoubmFtZSA9PT0gXCJzdHJpbmdcIixcbiAgICAgICAgdHlwZW9mIG9iai5nb2xkQmFjayA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5lbmFibGVQYXJjZWwgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmZvclBsYXllciA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtMyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNSA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNiA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtNyA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5pdGVtOSA9PT0gXCJudW1iZXJcIlxuICAgIF0uZXZlcnkoYiA9PiBiKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VBcGlTaG9wRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBmb3IgKGNvbnN0IGFwaUl0ZW0gb2YgSlNPTi5wYXJzZShkYXRhKSkge1xuICAgICAgICBpZiAoIWlzQXBpSXRlbShhcGlJdGVtKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW5jb3JyZWN0IGZvcm1hdCBvZiBpdGVtOiAke2RhdGF9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubmVyX2l0ZW1zID0gW1xuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTEsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0yLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMyxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTQsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW01LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTcsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW04LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOSxcbiAgICAgICAgXS5maWx0ZXIoaWQgPT4gISFpZCAmJiBpdGVtcy5nZXQoaWQpKS5tYXAoaWQgPT4gaXRlbXMuZ2V0KGlkKSEpO1xuXG4gICAgICAgIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIlBBUlRTXCIpIHtcbiAgICAgICAgICAgIGlmIChpbm5lcl9pdGVtcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaW5uZXJfaXRlbXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcGlJdGVtLmVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtU291cmNlID0gbmV3IFNob3BJdGVtU291cmNlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLnByaWNlMCwgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLCBpbm5lcl9pdGVtcyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGlubmVyX2l0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGl0ZW1Tb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcGlJdGVtLmNhdGVnb3J5ID09PSBcIkxPVFRFUllcIikge1xuICAgICAgICAgICAgZ2FjaGFzLnNldChcbiAgICAgICAgICAgICAgICBhcGlJdGVtLnByb2R1Y3RJbmRleCxcbiAgICAgICAgICAgICAgICBuZXcgR2FjaGEoXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJvZHVjdEluZGV4LFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLml0ZW0wLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0ucHJpY2UwLFxuICAgICAgICAgICAgICAgICAgICBhcGlJdGVtLnByaWNlVHlwZSA9PT0gXCJNSU5UXCIsXG4gICAgICAgICAgICAgICAgICAgIGFwaUl0ZW0uZW5hYmxlZCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGdhY2hhSXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBnYWNoYUl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBnYWNoYUl0ZW0pO1xuICAgICAgICAgICAgaWYgKGFwaUl0ZW0uZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGdhY2hhSXRlbS5zb3VyY2VzLnB1c2gobmV3IFNob3BJdGVtU291cmNlKGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBhcGlJdGVtLnByaWNlMCwgYXBpSXRlbS5wcmljZVR5cGUgPT09IFwiTUlOVFwiLCBpbm5lcl9pdGVtcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb3RoZXJJdGVtID0gbmV3IEl0ZW0oKTtcbiAgICAgICAgICAgIG90aGVySXRlbS5uYW1lX2VuID0gYXBpSXRlbS5uYW1lO1xuICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG90aGVySXRlbSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHYWNoYURhdGEoZGF0YTogc3RyaW5nLCBnYWNoYTogR2FjaGEpIHtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGF0YS5zcGxpdChcIlxcblwiKSkge1xuICAgICAgICBpZiAoIWxpbmUuaW5jbHVkZXMoXCI8TG90dGVyeUl0ZW1fXCIpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL1xccyo8TG90dGVyeUl0ZW1fKD88Y2hhcmFjdGVyPlteIF0qKSBJbmRleD1cIlxcZCtcIiBfTmFtZV89XCJbXlwiXSpcIiBTaG9wSW5kZXg9XCIoPzxzaG9wX2lkPlxcZCspXCIgUXVhbnRpdHlNaW49XCIoPzxxdWFudGl0eV9taW4+XFxkKylcIiBRdWFudGl0eU1heD1cIig/PHF1YW50aXR5X21heD5cXGQrKVwiIENoYW5zUGVyPVwiKD88cHJvYmFiaWxpdHk+XFxkK1xcLj9cXGQqKVxccypcIiBFZmZlY3Q9XCJcXGQrXCIgUHJvZHVjdE9wdD1cIlxcZCtcIlxcLz4vKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGYWlsZWQgcGFyc2luZyBnYWNoYSAke2dhY2hhLmdhY2hhX2luZGV4fTpcXG4ke2xpbmV9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1hdGNoLmdyb3Vwcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoYXJhY3RlciA9IG1hdGNoLmdyb3Vwcy5jaGFyYWN0ZXI7XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IFwiTHVubHVuXCIpIHtcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0NoYXJhY3RlcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHtjaGFyYWN0ZXJ9XCIgaW4gbG90dGVyeSBmaWxlICR7Z2FjaGEuZ2FjaGFfaW5kZXh9YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQocGFyc2VJbnQobWF0Y2guZ3JvdXBzLnNob3BfaWQpKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gc2hvcCBpdGVtIGlkICR7bWF0Y2guZ3JvdXBzLnNob3BfaWR9IGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2FjaGEuYWRkKGl0ZW0sIHBhcnNlRmxvYXQobWF0Y2guZ3JvdXBzLnByb2JhYmlsaXR5KSwgY2hhcmFjdGVyLCBwYXJzZUludChtYXRjaC5ncm91cHMucXVhbnRpdHlfbWluKSwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21heCkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IFssIG1hcF0gb2YgZ2FjaGEuc2hvcF9pdGVtcykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpdGVtLF0gb2YgbWFwKSB7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChuZXcgR2FjaGFJdGVtU291cmNlKGdhY2hhLnNob3BfaW5kZXgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VHdWFyZGlhbkRhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ3VhcmRpYW5EYXRhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE51bWJlcihvOiBhbnkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBib3NzVGltZUluZm8gPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIGZvciAoY29uc3QgbWFwSW5mbyBvZiBndWFyZGlhbkRhdGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBJbmZvICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXBfbmFtZSA9IG1hcEluZm8uTmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBtYXBfbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmV3YXJkcyA9IEFycmF5LmlzQXJyYXkobWFwSW5mby5SZXdhcmRzKSA/IFsuLi5tYXBJbmZvLlJld2FyZHNdIDogW107XG4gICAgICAgIGNvbnN0IHJld2FyZF9pdGVtcyA9IHJld2FyZHNcbiAgICAgICAgICAgIC5maWx0ZXIoKHNob3BfaWQpOiBzaG9wX2lkIGlzIG51bWJlciA9PiB0eXBlb2Ygc2hvcF9pZCA9PT0gXCJudW1iZXJcIiAmJiBzaG9wX2l0ZW1zLmhhcyhzaG9wX2lkKSlcbiAgICAgICAgICAgIC5tYXAoc2hvcF9pZCA9PiBzaG9wX2l0ZW1zLmdldChzaG9wX2lkKSEpO1xuICAgICAgICBjb25zdCBFeHBNdWx0aXBsaWVyID0gZ2V0TnVtYmVyKG1hcEluZm8uRXhwTXVsdGlwbGllcikgfHwgMDtcbiAgICAgICAgY29uc3QgSXNCb3NzU3RhZ2UgPSAhIW1hcEluZm8uSXNCb3NzU3RhZ2U7XG4gICAgICAgIGNvbnN0IE1hcElEID0gZ2V0TnVtYmVyKG1hcEluZm8uTWFwSWQpIHx8IDA7XG4gICAgICAgIGxldCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID0gZ2V0TnVtYmVyKG1hcEluZm8uQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcykgfHwgLTE7XG4gICAgICAgIGlmIChCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzID09PSAtMSkge1xuICAgICAgICAgICAgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGJvc3NUaW1lSW5mby5nZXQoTWFwSUQpIHx8IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKE1hcElEICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYm9zc1RpbWVJbmZvLnNldChNYXBJRCwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHJld2FyZF9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgZ3VhcmRpYW5Tb3VyY2UgPSBuZXcgR3VhcmRpYW5JdGVtU291cmNlKG1hcF9uYW1lLCByZXdhcmRfaXRlbXMsIEV4cE11bHRpcGxpZXIsIElzQm9zc1N0YWdlLCBCb3NzVHJpZ2dlclRpbWVySW5TZWNvbmRzKTtcbiAgICAgICAgICAgIGl0ZW0uc291cmNlcy5wdXNoKGd1YXJkaWFuU291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHVybC5zbGljZSh1cmwubGFzdEluZGV4T2YoXCIvXCIpICsgMSk7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ1wiKTtcbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBgTG9hZGluZyAke2ZpbGVuYW1lfSwgcGxlYXNlIHdhaXQuLi5gO1xuICAgIH1cbiAgICBjb25zdCByZXBseSA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUrKztcbiAgICB9XG4gICAgaWYgKCFyZXBseS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIGRvd25sb2FkaW5nICR7dXJsfTogJHtyZXBseS5zdGF0dXN9JHtyZXBseS5zdGF0dXNUZXh0ID8gYCAke3JlcGx5LnN0YXR1c1RleHR9YCA6IFwiXCJ9YFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVwbHkudGV4dCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRJdGVtcygpIHtcbiAgICBjb25zdCBwcm9ncmVzc2JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZ3Jlc3NiYXJcIik7XG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IDEyMztcbiAgICB9XG4gICAgY29uc3QgaXRlbVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2F1dGgtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBnYWNoYVNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L2dhbWUtc2VydmVyL3NyYy9tYWluL3Jlc291cmNlcy9yZXMvbG90dGVyeVwiO1xuICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3N0b2tpYy10Z20vSkZUU0UvZGV2ZWxvcG1lbnQvc2VydmVyLWNvcmUvc3JjL21haW4vcmVzb3VyY2VzL3Jlc1wiO1xuICAgIGNvbnN0IGl0ZW1VUkwgPSBpdGVtU291cmNlICsgXCIvSXRlbV9QYXJ0c19JbmkzLnhtbFwiO1xuICAgIGNvbnN0IGl0ZW1EYXRhID0gZG93bmxvYWQoaXRlbVVSTCk7XG4gICAgY29uc3QgaXRlbUFydERhdGEgPSBkb3dubG9hZChcIi9hc3NldHMvaXRlbS1hcnQtbWFwLmpzb25cIik7XG4gICAgY29uc3QgbWF4X3Nob3BfcGFnZXMgPSAyMDsgLy9jdXJyZW50bHkgbmVlZCBvbmx5IDEwLCBzaG91bGQgYmUgZW5vdWdoXG4gICAgY29uc3Qgc2hvcFVSTCA9IFwiL2FwaS9zaG9wP3NpemU9MTAwMCZwYWdlPVwiO1xuICAgIGNvbnN0IHNob3BEYXRhcyA9IFsuLi5BcnJheShtYXhfc2hvcF9wYWdlcykua2V5cygpXS5tYXAobiA9PiBkb3dubG9hZChgJHtzaG9wVVJMfSR7bn1gKSk7XG4gICAgY29uc3QgZ3VhcmRpYW5VUkwgPSBndWFyZGlhblNvdXJjZSArIFwiL0d1YXJkaWFuU3RhZ2VzLmpzb25cIjtcbiAgICBjb25zdCBndWFyZGlhbkRhdGEgPSBkb3dubG9hZChndWFyZGlhblVSTCk7XG4gICAgcGFyc2VJdGVtRGF0YShhd2FpdCBpdGVtRGF0YSk7XG4gICAgaXRlbUFydE1hcCA9IEpTT04ucGFyc2UoYXdhaXQgaXRlbUFydERhdGEpIGFzIEl0ZW1BcnRNYXA7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoc2hvcERhdGFzLm1hcChwID0+IHAudGhlbihkYXRhID0+IHBhcnNlQXBpU2hvcERhdGEoZGF0YSkpKSk7XG5cbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlID0gMDtcbiAgICAgICAgcHJvZ3Jlc3NiYXIubWF4ID0gZ2FjaGFzLnNpemUgKyAzO1xuICAgIH1cbiAgICBjb25zdCBnYWNoYV9pdGVtczogW1Byb21pc2U8c3RyaW5nPiwgR2FjaGEsIHN0cmluZ11bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgWywgZ2FjaGFdIG9mIGdhY2hhcykge1xuICAgICAgICBjb25zdCBnYWNoYV91cmwgPSBgJHtnYWNoYVNvdXJjZX0vSW5pM19Mb3RfJHtgJHtnYWNoYS5nYWNoYV9pbmRleH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX0ueG1sYDtcbiAgICAgICAgZ2FjaGFfaXRlbXMucHVzaChbZG93bmxvYWQoZ2FjaGFfdXJsKSwgZ2FjaGEsIGdhY2hhX3VybF0pO1xuICAgIH1cbiAgICBwYXJzZUd1YXJkaWFuRGF0YShhd2FpdCBndWFyZGlhbkRhdGEpO1xuICAgIGZvciAoY29uc3QgW2l0ZW0sIGdhY2hhLCBnYWNoYV91cmxdIG9mIGdhY2hhX2l0ZW1zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJzZUdhY2hhRGF0YShhd2FpdCBpdGVtLCBnYWNoYSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIGRvd25sb2FkaW5nICR7Z2FjaGFfdXJsfSBiZWNhdXNlICR7ZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqIEJhbi9jaXJjbGUtc2xhc2ggaWNvbiBmb3IgZXhjbHVkZSDigJQgb3V0bGluZSBTVkcsIHJlY29sb3JlZCB2aWEgY3VycmVudENvbG9yLiAqL1xuZnVuY3Rpb24gY3JlYXRlRXhjbHVkZUljb24oKTogU1ZHU1ZHRWxlbWVudCB7XG4gICAgY29uc3QgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG4gICAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcInN2Z1wiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJpdGVtX3JlbW92YWxfX2ljb25cIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIiwgXCIwIDAgMjQgMjRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFwiMTZcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIjE2XCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImZvY3VzYWJsZVwiLCBcImZhbHNlXCIpO1xuXG4gICAgY29uc3QgY2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBcImNpcmNsZVwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiY3hcIiwgXCIxMlwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiY3lcIiwgXCIxMlwiKTtcbiAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiclwiLCBcIjlcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJub25lXCIpO1xuICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBcIjJcIik7XG5cbiAgICBjb25zdCBzbGFzaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJsaW5lXCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcIngxXCIsIFwiN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ5MVwiLCBcIjdcIik7XG4gICAgc2xhc2guc2V0QXR0cmlidXRlKFwieDJcIiwgXCIxN1wiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJ5MlwiLCBcIjE3XCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBcImN1cnJlbnRDb2xvclwiKTtcbiAgICBzbGFzaC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyXCIpO1xuICAgIHNsYXNoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lY2FwXCIsIFwicm91bmRcIik7XG5cbiAgICBzdmcuYXBwZW5kKGNpcmNsZSwgc2xhc2gpO1xuICAgIHJldHVybiBzdmc7XG59XG5cbmZ1bmN0aW9uIGRlbGV0YWJsZUl0ZW0oaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtX3JlbW92YWxcIixcbiAgICAgICAgICAgIFwiZGF0YS1pdGVtX2luZGV4XCI6IGAke2l0ZW0uaWR9YCxcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgRXhjbHVkZSAke2l0ZW0ubmFtZV9lbn0gZnJvbSByZXN1bHRzYCxcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICB0aXRsZTogYEV4Y2x1ZGUgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICBleGNsdWRlQnV0dG9uLmFwcGVuZChjcmVhdGVFeGNsdWRlSWNvbigpKTtcblxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJpdGVtLWlkZW50aXR5XCIgfSxcbiAgICAgICAgZXhjbHVkZUJ1dHRvbixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1pZGVudGl0eV9fbWV0YVwiIH0sXG4gICAgICAgICAgICBjcmVhdGVJdGVtRGV0YWlsc1RyaWdnZXIoaXRlbSwgY2hhcmFjdGVyKSxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1BdmFpbGFiaWxpdHlCYWRnZShpdGVtKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gc2hvd0RpYWxvZyhcbiAgICB0cmlnZ2VyOiBIVE1MQnV0dG9uRWxlbWVudCxcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nIHwgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdLFxuICAgIGRpYWxvZ0NsYXNzPzogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgdG9wRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BfZGl2XCIpO1xuICAgIGlmICghKHRvcERpdiBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkaWFsb2cpIHtcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIGRpYWxvZy5yZW1vdmUoKTtcbiAgICB9XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IGRpYWxvZ0NsYXNzID8gYCR7ZGlhbG9nQ2xhc3N9X19jbG9zZWAgOiBcImRpYWxvZ19fY2xvc2VcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiQ2xvc2VcIixcbiAgICBdKTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ge1xuICAgICAgICAuLi4oZGlhbG9nQ2xhc3MgPyB7IGNsYXNzOiBkaWFsb2dDbGFzcyB9IDoge30pLFxuICAgICAgICBcImFyaWEtbGFiZWxcIjogbGFiZWwsXG4gICAgfTtcbiAgICBkaWFsb2cgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpXG4gICAgICAgID8gY3JlYXRlSFRNTChbXCJkaWFsb2dcIiwgYXR0cmlidXRlcywgLi4uY29udGVudCwgY2xvc2VCdXR0b25dKVxuICAgICAgICA6IGNyZWF0ZUhUTUwoW1wiZGlhbG9nXCIsIGF0dHJpYnV0ZXMsIGNvbnRlbnQsIGNsb3NlQnV0dG9uXSk7XG4gICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwidHJ1ZVwiKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gZGlhbG9nPy5jbG9zZSgpKTtcbiAgICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgdHJpZ2dlci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGRpYWxvZz8ucmVtb3ZlKCk7XG4gICAgICAgIGRpYWxvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdHJpZ2dlci5mb2N1cygpO1xuICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB0b3BEaXYuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcbiAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQb3B1cExpbmsodGV4dDogc3RyaW5nLCBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSkge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJwb3B1cF9saW5rXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICB9LFxuICAgICAgICB0ZXh0LFxuICAgIF0pO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93RGlhbG9nKGJ1dHRvbiwgYCR7dGV4dH0gZGV0YWlsc2AsIGNvbnRlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b247XG59XG5cbmZ1bmN0aW9uIHF1YW50aXR5U3RyaW5nKHF1YW50aXR5X21pbjogbnVtYmVyLCBxdWFudGl0eV9tYXg6IG51bWJlcikge1xuICAgIGlmIChxdWFudGl0eV9taW4gPT09IDEgJiYgcXVhbnRpdHlfbWF4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAocXVhbnRpdHlfbWluID09PSBxdWFudGl0eV9tYXgpIHtcbiAgICAgICAgcmV0dXJuIGAgeCAke3F1YW50aXR5X21heH1gO1xuICAgIH1cbiAgICByZXR1cm4gYCB4ICR7cXVhbnRpdHlfbWlufS0ke3F1YW50aXR5X21heH1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVBvcHVwKGl0ZW06IEl0ZW0gfCB1bmRlZmluZWQsIGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UsIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBjaGFyYWN0ZXIgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYW5jZVwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiRXhwZWN0ZWQgcHVsbHNcIl0sXG4gICAgICAgIF0sXG4gICAgXSkgOiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYXJhY3RlclwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiQ2hhbmNlXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJFeHBlY3RlZCBwdWxsc1wiXSxcbiAgICAgICAgXSxcbiAgICBdKTtcbiAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQoaXRlbVNvdXJjZS5zaG9wX2lkKTtcbiAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICBjb25zdCBnYWNoYV9pdGVtcyA9IG5ldyBNYXA8SXRlbSwgW251bWJlciwgbnVtYmVyLCBudW1iZXJdPigpO1xuICAgIGZvciAoY29uc3QgY2hhciBvZiBjaGFyYWN0ZXIgPT09IHVuZGVmaW5lZCA/IGNoYXJhY3RlcnMgOiBbY2hhcmFjdGVyXSkge1xuICAgICAgICBjb25zdCBjaGFyX2l0ZW1zID0gZ2FjaGEuc2hvcF9pdGVtcy5nZXQoY2hhcik7XG4gICAgICAgIGlmICghY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbY2hhcl9nYWNoYV9pdGVtLCBbdGlja2V0cywgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdXSBvZiBjaGFyX2l0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtX2NoYXJhY3RlciA9IGNoYXJfZ2FjaGFfaXRlbS5jaGFyYWN0ZXIgfHwgY2hhcmFjdGVyO1xuICAgICAgICAgICAgY29uc3QgaXRlbV90aWNrZXRzID0gaXRlbV9jaGFyYWN0ZXIgPyBnYWNoYS5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGl0ZW1fY2hhcmFjdGVyKSEgOiBnYWNoYS50b3RhbF9wcm9iYWJpbGl0eTtcbiAgICAgICAgICAgIGNvbnN0IHByb2JhYmlsaXR5ID0gdGlja2V0cyAvIGl0ZW1fdGlja2V0cztcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzX3Byb2JhYmlsaXR5ID0gZ2FjaGFfaXRlbXMuZ2V0KGNoYXJfZ2FjaGFfaXRlbSk/LlswXSB8fCAwO1xuICAgICAgICAgICAgZ2FjaGFfaXRlbXMuc2V0KGNoYXJfZ2FjaGFfaXRlbSwgW3ByZXZpb3VzX3Byb2JhYmlsaXR5ICsgcHJvYmFiaWxpdHksIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtjaGFyX2dhY2hhX2l0ZW0sIFtwcm9iYWJpbGl0eSwgcXVhbnRpdHlfbWluLCBxdWFudGl0eV9tYXhdXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICBpZiAoY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgICAgICBpdGVtID09PSBjaGFyX2dhY2hhX2l0ZW0gPyB7IGNsYXNzOiBcImhpZ2hsaWdodGVkXCIgfSA6IFwiXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgY2hhcl9nYWNoYV9pdGVtLm5hbWVfZW4sIHF1YW50aXR5U3RyaW5nKHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4KV0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHByb2JhYmlsaXR5ICogMTAwLCAyKX0lYF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyBwcm9iYWJpbGl0eSwgMil9YF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgICAgICBpdGVtID09PSBjaGFyX2dhY2hhX2l0ZW0gPyB7IGNsYXNzOiBcImhpZ2hsaWdodGVkXCIgfSA6IFwiXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgY2hhcl9nYWNoYV9pdGVtLm5hbWVfZW4sIHF1YW50aXR5U3RyaW5nKHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4KV0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgY2hhcl9nYWNoYV9pdGVtLmNoYXJhY3RlciB8fCBcIipcIl0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKHByb2JhYmlsaXR5ICogMTAwLCAyKX0lYF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJudW1lcmljXCIgfSwgYCR7cHJldHR5TnVtYmVyKDEgLyBwcm9iYWJpbGl0eSwgMil9YF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlUG9wdXBMaW5rKGl0ZW1Tb3VyY2UuaXRlbS5uYW1lX2VuLCBjb250ZW50KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBjb250ZW50VGFibGUgPSBjcmVhdGVIVE1MKFtcInRhYmxlXCIsIFtcInRyXCIsIFtcInRoXCIsIFwiQ29udGVudHNcIl1dXSk7XG4gICAgZm9yIChjb25zdCBpbm5lcl9pdGVtIG9mIGl0ZW1Tb3VyY2UuaXRlbXMpIHtcbiAgICAgICAgY29udGVudFRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1widHJcIiwgaW5uZXJfaXRlbSA9PT0gaXRlbSA/IHsgY2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIiB9IDogXCJcIiwgW1widGRcIiwgaW5uZXJfaXRlbS5uYW1lX2VuXV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgY29udGVudFRhYmxlXSldKTtcbn1cblxuZnVuY3Rpb24gcHJldHR5VGltZShzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihzZWNvbmRzIC8gNjApfToke2Ake3NlY29uZHMgJSA2MH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBbXG4gICAgICAgIGBHdWFyZGlhbiBtYXAgJHtpdGVtU291cmNlLmd1YXJkaWFuX21hcH1gLFxuICAgICAgICBjcmVhdGVIVE1MKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwidWxcIiwgeyBjbGFzczogXCJsYXlvdXRcIiB9LFxuICAgICAgICAgICAgICAgIFtcImxpXCIsIFwiSXRlbXM6XCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInVsXCIsIHsgY2xhc3M6IFwibGF5b3V0XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLml0ZW1Tb3VyY2UuaXRlbXMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJyLCByZXdhcmRfaXRlbSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy4uLmN1cnIsIGNyZWF0ZUhUTUwoW1wibGlcIiwgeyBjbGFzczogcmV3YXJkX2l0ZW0gPT09IGl0ZW0gPyBcImhpZ2hsaWdodGVkXCIgOiBcIlwiIH0sIHJld2FyZF9pdGVtLm5hbWVfZW5dKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYFJlcXVpcmVzIGJvc3M6ICR7aXRlbVNvdXJjZS5uZWVkX2Jvc3MgPyBcIlllc1wiIDogXCJOb1wifWBdLFxuICAgICAgICAgICAgICAgIC4uLihpdGVtU291cmNlLmJvc3NfdGltZSA+IDAgPyBbY3JlYXRlSFRNTChbXCJsaVwiLCBgQm9zcyB0aW1lOiAke3ByZXR0eVRpbWUoaXRlbVNvdXJjZS5ib3NzX3RpbWUpfWBdKV0gOiBbXSksXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYEVYUCBtdWx0aXBsaWVyOiAke2l0ZW1Tb3VyY2UueHB9YF0sXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICBdO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGNvbnRlbnQpO1xufVxuXG5mdW5jdGlvbiBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICByZXR1cm4gWy4uLml0ZW0uc291cmNlcy52YWx1ZXMoKV1cbiAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgIC5tYXAoaXRlbVNvdXJjZSA9PiBzb3VyY2VJdGVtRWxlbWVudChpdGVtLCBpdGVtU291cmNlLCBjaGFyYWN0ZXIpKTtcbn1cblxuZnVuY3Rpb24gaXNQbGFpblRleHRTb3VyY2VHcm91cChlbGVtZW50czogcmVhZG9ubHkgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLmxlbmd0aCA+IDAgJiYgZWxlbWVudHMuZXZlcnkoKGVsZW1lbnQpID0+IHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiKTtcbn1cblxuZnVuY3Rpb24gbWFrZVNvdXJjZXNMaXN0KGxpc3Q6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXVtdKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBjb25zdCByZXN1bHQ6IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSA9IFtdO1xuICAgIGZ1bmN0aW9uIGFkZChlbGVtZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdICsgZWxlbWVudDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQucHVzaChlbGVtZW50KTtcbiAgICB9XG4gICAgbGV0IHByZXZpb3VzR3JvdXA6IHJlYWRvbmx5IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSB8IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnRzIG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWRkKFwiIFwiKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbW1hIG9ubHkgYmV0d2VlbiBhZGphY2VudCBwbGFpbi10ZXh0IHNvdXJjZXMgKGUuZy4gXCIxMDAgR29sZCwgNTAgQVBcIikuXG4gICAgICAgIC8vIEdhY2hhL2d1YXJkaWFuIGNhcmRzIGFyZSBibG9jayBlbGVtZW50cyDigJQgYSB0ZXh0IGNvbW1hIGJlY29tZXMgYSB2aXN1YWwgYnJlYWsuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHByZXZpb3VzR3JvdXAgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgJiYgaXNQbGFpblRleHRTb3VyY2VHcm91cChwcmV2aW91c0dyb3VwKVxuICAgICAgICAgICAgJiYgaXNQbGFpblRleHRTb3VyY2VHcm91cChlbGVtZW50cylcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBhZGQoXCIsIFwiKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91c0dyb3VwID0gZWxlbWVudHM7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW1Tb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSk6IGJvb2xlYW4ge1xuICAgIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgfHwgaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgICAgIGlmIChnYWNoYT8uZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UgIT09IGl0ZW1Tb3VyY2UgJiYgaXNBdmFpbGFibGVJdGVtU291cmNlKHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbUN1cnJlbnRseUF2YWlsYWJsZShpdGVtOiBJdGVtKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbS5zb3VyY2VzKSB7XG4gICAgICAgIGlmIChpc0F2YWlsYWJsZUl0ZW1Tb3VyY2Uoc291cmNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXZhaWxhYmlsaXR5QmFkZ2UoaXRlbTogSXRlbSkge1xuICAgIGlmIChpc0l0ZW1DdXJyZW50bHlBdmFpbGFibGUoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tYXZhaWxhYmlsaXR5IGl0ZW0tYXZhaWxhYmlsaXR5LS11bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IFwiTm8gZW5hYmxlZCBzaG9wLCBnYWNoYSwgb3IgR3VhcmRpYW4gcGF0aCBpbiB0aGUgbGl2ZSBzaG9wIGRhdGFcIixcbiAgICAgICAgfSxcbiAgICAgICAgXCJOb3QgaW4gZ2FtZVwiLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYUN1cnJlbmN5TGFiZWwoZ2FjaGE6IEdhY2hhKSB7XG4gICAgaWYgKGdhY2hhLmVuYWJsZWQpIHtcbiAgICAgICAgaWYgKGdhY2hhLmFwKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1jdXJyZW5jeSBnYWNoYS1jdXJyZW5jeS0tYXBcIiB9LFxuICAgICAgICAgICAgICAgIFwiQVBcIixcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1jdXJyZW5jeSBnYWNoYS1jdXJyZW5jeS0tZ29sZFwiIH0sXG4gICAgICAgICAgICBcIkdvbGRcIixcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbmN5ID0gZ2FjaGEuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIjtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJnYWNoYS1jdXJyZW5jeSBnYWNoYS1jdXJyZW5jeS0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgIHRpdGxlOiBgJHtjdXJyZW5jeX0gY29pbiBpcyBub3QgY3VycmVudGx5IHNvbGQgaW4gdGhlIGxpdmUgc2hvcGAsXG4gICAgICAgIH0sXG4gICAgICAgIGAke2N1cnJlbmN5fSDCtyBOb3QgYXZhaWxhYmxlYCxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTb3VyY2VTdW1tYXJ5KFxuICAgIGl0ZW06IEl0ZW0gfCB1bmRlZmluZWQsXG4gICAgaXRlbVNvdXJjZTogR2FjaGFJdGVtU291cmNlLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcixcbikge1xuICAgIGNvbnN0IGdhY2hhID0gZ2FjaGFzLmdldChpdGVtU291cmNlLnNob3BfaWQpO1xuICAgIGlmICghZ2FjaGEpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5XCIsXG4gICAgICAgICAgICByb2xlOiBcImdyb3VwXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYCR7Z2FjaGEubmFtZX0gYWNxdWlzaXRpb25gLFxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVHYWNoYUNvaW5BcnQoZ2FjaGEpLFxuICAgICAgICBbXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1zb3VyY2Utc3VtbWFyeV9fY29udGVudFwiIH0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLWlkZW50aXR5XCIgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVHYWNoYVNvdXJjZVBvcHVwKFxuICAgICAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4gPyB1bmRlZmluZWQgOiBjaGFyYWN0ZXIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBjcmVhdGVHYWNoYUN1cnJlbmN5TGFiZWwoZ2FjaGEpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gc291cmNlSXRlbUVsZW1lbnQoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUdhY2hhU291cmNlU3VtbWFyeShpdGVtLCBpdGVtU291cmNlLCBjaGFyYWN0ZXIpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgIGlmIChpdGVtU291cmNlLml0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIFtgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbSwgaXRlbVNvdXJjZSksXG4gICAgICAgICAgICBgICR7aXRlbVNvdXJjZS5wcmljZX0gJHtpdGVtU291cmNlLmFwID8gXCJBUFwiIDogXCJHb2xkXCJ9YFxuICAgICAgICBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgIHJldHVybiBbY3JlYXRlR3VhcmRpYW5Qb3B1cChpdGVtLCBpdGVtU291cmNlKV07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpdGVtRGV0YWlsU3RhdHMoaXRlbTogSXRlbSkge1xuICAgIHJldHVybiBbXG4gICAgICAgIFtcIk1vdmVtZW50XCIsIGl0ZW0ubW92ZW1lbnRdLFxuICAgICAgICBbXCJDaGFyZ2VcIiwgaXRlbS5jaGFyZ2VdLFxuICAgICAgICBbXCJMb2JcIiwgaXRlbS5sb2JdLFxuICAgICAgICBbXCJTbWFzaFwiLCBpdGVtLnNtYXNoXSxcbiAgICAgICAgW1wiU3RyZW5ndGhcIiwgaXRlbS5zdHJdLFxuICAgICAgICBbXCJEZXh0ZXJpdHlcIiwgaXRlbS5kZXhdLFxuICAgICAgICBbXCJTdGFtaW5hXCIsIGl0ZW0uc3RhXSxcbiAgICAgICAgW1wiV2lsbFwiLCBpdGVtLndpbF0sXG4gICAgICAgIFtcIlNlcnZlXCIsIGl0ZW0uc2VydmVdLFxuICAgICAgICBbXCJIUFwiLCBpdGVtLmhwXSxcbiAgICAgICAgW1wiUXVpY2tzbG90c1wiLCBpdGVtLnF1aWNrc2xvdHNdLFxuICAgICAgICBbXCJCdWZmc2xvdHNcIiwgaXRlbS5idWZmc2xvdHNdLFxuICAgIF0gYXMgY29uc3Q7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBzdGF0cyA9IGl0ZW1EZXRhaWxTdGF0cyhpdGVtKS5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUgIT09IDApO1xuICAgIGNvbnN0IHNvdXJjZXMgPSBtYWtlU291cmNlc0xpc3QoXG4gICAgICAgIGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoaXRlbSwgKCkgPT4gdHJ1ZSwgY2hhcmFjdGVyKSxcbiAgICApO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNcIiB9LFxuICAgICAgICBbXG4gICAgICAgICAgICBcImhlYWRlclwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2hlYWRlclwiIH0sXG4gICAgICAgICAgICBjcmVhdGVJdGVtQXJ0KGl0ZW0sIDcyLCBcIml0ZW0tZGV0YWlsc19fYXJ0XCIpLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fZXllYnJvd1wiIH0sIFwiRXF1aXBtZW50IGRldGFpbHNcIl0sXG4gICAgICAgICAgICAgICAgW1wiaDJcIiwgaXRlbS5uYW1lX2VuXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fbWV0YVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGAke2NoYXJhY3RlciA/PyBpdGVtLmNoYXJhY3RlciA/PyBcIkFsbCBjaGFyYWN0ZXJzXCJ9IMK3ICR7aXRlbS5wYXJ0fSDCtyBMZXZlbCAke2l0ZW0ubGV2ZWx9YCxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJzZWN0aW9uXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc2VjdGlvblwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiBcIml0ZW0tZGV0YWlscy1zdGF0c1wiIH0sXG4gICAgICAgICAgICBbXCJoM1wiLCB7IGlkOiBcIml0ZW0tZGV0YWlscy1zdGF0c1wiIH0sIFwiU3RhdHNcIl0sXG4gICAgICAgICAgICBzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkbFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc3RhdHNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0cy5tYXAoKFtsYWJlbCwgdmFsdWVdKSA9PiBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJkdFwiLCBsYWJlbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJkZFwiLCBgJHt2YWx1ZX1gXSxcbiAgICAgICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgOiBjcmVhdGVIVE1MKFtcInBcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSwgXCJObyBzdGF0IGJvbnVzZXNcIl0pLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXNvdXJjZXNcIiB9LFxuICAgICAgICAgICAgW1wiaDNcIiwgeyBpZDogXCJpdGVtLWRldGFpbHMtc291cmNlc1wiIH0sIFwiSG93IHRvIGdldCBpdFwiXSxcbiAgICAgICAgICAgIHNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gY3JlYXRlSFRNTChbXCJkaXZcIiwgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NvdXJjZXNcIiB9LCAuLi5zb3VyY2VzXSlcbiAgICAgICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX2VtcHR5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJObyBhY3RpdmUgYWNxdWlzaXRpb24gc291cmNlIGZvdW5kLlwiLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICBdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtRGV0YWlsc1RyaWdnZXIoaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgY29uc3QgYnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tZGV0YWlscy10cmlnZ2VyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgXCJhcmlhLWhhc3BvcHVwXCI6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICBcImFyaWEtZXhwYW5kZWRcIjogXCJmYWxzZVwiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBWaWV3IGRldGFpbHMgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW0ubmFtZV9lbixcbiAgICBdKTtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd0RpYWxvZyhcbiAgICAgICAgICAgIGJ1dHRvbixcbiAgICAgICAgICAgIGAke2l0ZW0ubmFtZV9lbn0gaXRlbSBkZXRhaWxzYCxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1EZXRhaWxzQ29udGVudChpdGVtLCBjaGFyYWN0ZXIpLFxuICAgICAgICAgICAgXCJpdGVtLWRldGFpbHMtZGlhbG9nXCIsXG4gICAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbUFydEZhbGxiYWNrKGl0ZW06IEl0ZW0pIHtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja1wiLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgT2ZmaWNpYWwgaXRlbSBhcnQgdW5hdmFpbGFibGUgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJpdGVtLWFydC1mYWxsYmFja19fY29kZVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIGl0ZW0ucGFydCB8fCBcIkl0ZW1cIl0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sIFwiT2ZmaWNpYWwgYXJ0IHVuYXZhaWxhYmxlXCJdLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgc2hlZXQ6IHN0cmluZyxcbiAgICBjZWxsOiBudW1iZXIsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjbGFzc05hbWU6IHN0cmluZyxcbiAgICBkaXNwbGF5U2l6ZSA9IDQwLFxuKSB7XG4gICAgY29uc3QgZ2VvbWV0cnkgPSBpdGVtQXJ0TWFwLnNoZWV0c1tzaGVldF07XG4gICAgaWYgKCFnZW9tZXRyeSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvbHVtbiA9IGNlbGwgJSBnZW9tZXRyeS5saW5lQ291bnQ7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihjZWxsIC8gZ2VvbWV0cnkubGluZUNvdW50KTtcbiAgICBjb25zdCBzY2FsZSA9IGRpc3BsYXlTaXplIC8gZ2VvbWV0cnkuc2l6ZTtcbiAgICBjb25zdCBpbWFnZVNpemUgPSBnZW9tZXRyeS53aWR0aCAqIHNjYWxlO1xuICAgIGNvbnN0IG9mZnNldFggPSAtKGdlb21ldHJ5LnNwYWNlICsgY29sdW1uICogKGdlb21ldHJ5LnNpemUgKyBnZW9tZXRyeS5zcGFjZSkpICogc2NhbGU7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IC0oZ2VvbWV0cnkuc3BhY2UgKyByb3cgKiAoZ2VvbWV0cnkuc2l6ZSArIGdlb21ldHJ5LnNwYWNlKSkgKiBzY2FsZTtcbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwic3BhblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGFzczogY2xhc3NOYW1lLFxuICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCxcbiAgICAgICAgICAgIHN0eWxlOiBbXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtaW1hZ2U6dXJsKFwiL2Fzc2V0cy9pdGVtLWFydC8ke2VuY29kZVVSSUNvbXBvbmVudChzaGVldCl9LndlYnBcIilgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXNpemU6JHtpbWFnZVNpemV9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXg6JHtvZmZzZXRYfXB4YCxcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC15OiR7b2Zmc2V0WX1weGAsXG4gICAgICAgICAgICBdLmpvaW4oXCI7XCIpLFxuICAgICAgICB9LFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgZGlzcGxheVNpemUgPSA0MCxcbiAgICBjbGFzc05hbWUgPSBcIml0ZW0tYXJ0LXRodW1ibmFpbFwiLFxuKSB7XG4gICAgY29uc3QgYXJ0ID0gaXRlbUFydE1hcC5pdGVtc1tgJHtpdGVtLmlkfWBdO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydFswXSxcbiAgICAgICAgYXJ0WzFdLFxuICAgICAgICBgT2ZmaWNpYWwgaXRlbSBhcnQgZm9yICR7aXRlbS5uYW1lX2VufWAsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgZGlzcGxheVNpemUsXG4gICAgKSA/PyBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYTogR2FjaGEpIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLmxvdHRlcmllc1tgJHtnYWNoYS5nYWNoYV9pbmRleH1gXTtcbiAgICBjb25zdCBmYWxsYmFjayA9ICgpID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtY29pbi1hcnQgZ2FjaGEtY29pbi1hcnQtLXVuYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICAgICAgcm9sZTogXCJpbWdcIixcbiAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYENvaW4gYXJ0d29yayB1bmF2YWlsYWJsZSBmb3IgJHtnYWNoYS5uYW1lfWAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI/XCIsXG4gICAgICAgIF0pO1xuICAgIGlmICghYXJ0KSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaygpO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlU3ByaXRlQXJ0KFxuICAgICAgICBhcnQuc2hlZXQsXG4gICAgICAgIGFydC5jZWxsLFxuICAgICAgICBgJHtnYWNoYS5uYW1lfSBjb2luIGFydHdvcmtgLFxuICAgICAgICBcImdhY2hhLWNvaW4tYXJ0XCIsXG4gICAgKSA/PyBmYWxsYmFjaygpO1xufVxuXG5mdW5jdGlvbiBpdGVtVG9UYWJsZVJvdyhpdGVtOiBJdGVtLCBzb3VyY2VGaWx0ZXI6IChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuLCBwcmlvcml0eVN0YXRzOiBzdHJpbmdbXSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlUm93RWxlbWVudCB7XG4gICAgY29uc3Qgcm93ID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widHJcIiwgeyBjbGFzczogXCJyZXN1bHQtcm93XCIgfSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gcmVzdWx0LXN1bW1hcnlcIiwgXCJkYXRhLWxhYmVsXCI6IFwiSXRlbVwiIH0sIGRlbGV0YWJsZUl0ZW0oaXRlbSwgY2hhcmFjdGVyKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQXJ0XCIgfSwgY3JlYXRlSXRlbUFydChpdGVtKV0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkNoYXJhY3Rlcl9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiQ2hhcmFjdGVyXCIgfSwgaXRlbS5jaGFyYWN0ZXIgPz8gXCJBbGxcIl0sXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlBhcnRcIiB9LCBpdGVtLnBhcnRdLFxuICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5tYXAocyA9PiBpdGVtLnN0YXRGcm9tU3RyaW5nKHMpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJ0ZFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IHN0YXQsIFwiZGF0YS12YWx1ZVwiOiB2YWx1ZSB9LCB2YWx1ZV0pO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIFwiZGF0YS1sYWJlbFwiOiBcIkxldmVsXCIsIFwiZGF0YS12YWx1ZVwiOiBgJHtpdGVtLmxldmVsfWAgfSwgYCR7aXRlbS5sZXZlbH1gXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJTb3VyY2VcIiB9LCAuLi5tYWtlU291cmNlc0xpc3QoaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgcmV0dXJuIHJvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhY2hhVGFibGUoZmlsdGVyOiAoaXRlbTogSXRlbSkgPT4gYm9vbGVhbiwgY2hhcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJHYWNoYSBjb2lucyB3aXRoIEdvbGQgb3IgQVAgZGVub21pbmF0aW9uXCJdLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW4gU291cmNlX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJHYWNoYVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlU3VtbWFyeSh1bmRlZmluZWQsIG5ldyBHYWNoYUl0ZW1Tb3VyY2UoZ2FjaGEuc2hvcF9pbmRleCksIGNoYXIpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdWx0c1RhYmxlKFxuICAgIGZpbHRlcjogKGl0ZW06IEl0ZW0pID0+IGJvb2xlYW4sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBwcmlvcml6ZXI6IChpdGVtczogSXRlbVtdLCBpdGVtOiBJdGVtKSA9PiBJdGVtW10sXG4gICAgcHJpb3JpdHlTdGF0czogc3RyaW5nW10sXG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgcmVzdWx0czogeyBba2V5OiBzdHJpbmddOiBJdGVtW10gfSA9IHtcbiAgICAgICAgXCJIYXRcIjogW10sXG4gICAgICAgIFwiSGFpclwiOiBbXSxcbiAgICAgICAgXCJEeWVcIjogW10sXG4gICAgICAgIFwiVXBwZXJcIjogW10sXG4gICAgICAgIFwiTG93ZXJcIjogW10sXG4gICAgICAgIFwiU2hvZXNcIjogW10sXG4gICAgICAgIFwiU29ja3NcIjogW10sXG4gICAgICAgIFwiSGFuZFwiOiBbXSxcbiAgICAgICAgXCJCYWNrcGFja1wiOiBbXSxcbiAgICAgICAgXCJGYWNlXCI6IFtdLFxuICAgICAgICBcIlJhY2tldFwiOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAoZmlsdGVyKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXN1bHRzW2l0ZW0ucGFydF0gPSBwcmlvcml6ZXIocmVzdWx0c1tpdGVtLnBhcnRdLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gY3JlYXRlSFRNTChcbiAgICAgICAgW1widGFibGVcIixcbiAgICAgICAgICAgIFtcImNhcHRpb25cIiwgXCJNYXRjaGluZyBlcXVpcG1lbnQgYnkgc2xvdCBhbmQgc2VsZWN0ZWQgc3RhdCBwcmlvcml0eVwiXSxcbiAgICAgICAgICAgIFtcInRoZWFkXCIsXG4gICAgICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkl0ZW1cIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJDaGFyYWN0ZXJfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiQ2hhcmFjdGVyXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlBhcnRfY29sdW1uXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiUGFydFwiXSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcInRoXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiLCBzY29wZTogXCJjb2xcIiB9LCBzdGF0XSkpLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkxldmVsX2NvbHVtbiBudW1lcmljXCIsIHNjb3BlOiBcImNvbFwiIH0sIFwiTGV2ZWxcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiU291cmNlX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlNvdXJjZVwiXSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcInRib2R5XCJdLFxuICAgICAgICBdXG4gICAgKTtcbiAgICBjb25zdCB0YWJsZUJvZHkgPSB0YWJsZS50Qm9kaWVzWzBdO1xuICAgIGlmICghdGFibGVCb2R5KSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB0eXBlIE1hcE9wdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH07XG5cbiAgICB0eXBlIENvc3QgPSB7XG4gICAgICAgIGdvbGQ6IG51bWJlcixcbiAgICAgICAgYXA6IG51bWJlcixcbiAgICAgICAgbWFwczogTWFwT3B0aW9ucyxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY29tYmluZU1hcHMobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHJlc3VsdFttYXBdLmNvbmNhdCh0cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tYmluZUNvc3RzKGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ29sZDogY29zdDEuZ29sZCArIGNvc3QyLmdvbGQsXG4gICAgICAgICAgICBhcDogY29zdDEuYXAgKyBjb3N0Mi5hcCxcbiAgICAgICAgICAgIG1hcHM6IGNvbWJpbmVNYXBzKGNvc3QxLm1hcHMsIGNvc3QyLm1hcHMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pbk1hcChtMTogTWFwT3B0aW9ucywgbTI6IE1hcE9wdGlvbnMpOiBNYXBPcHRpb25zIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0geyAuLi5tMSB9O1xuICAgICAgICBmb3IgKGNvbnN0IFttYXAsIHRyaWVzXSBvZiBPYmplY3QuZW50cmllcyhtMikpIHtcbiAgICAgICAgICAgIGlmICh0cmllcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0W21hcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IFtNYXRoLm1pbihyZXN1bHRbbWFwXVswXSwgdHJpZXNbMF0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFttYXBdID0gdHJpZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5Db3N0KGNvc3QxOiBDb3N0LCBjb3N0MjogQ29zdCk6IENvc3Qge1xuICAgICAgICAvLyBMZXhpY29ncmFwaGljIG9uIChhcCwgZ29sZCk6IGxvd2VyIEFQIHdpbnMsIHRoZW4gbG93ZXIgR29sZC5cbiAgICAgICAgLy8gTnVtZXJpYyBjb21wYXJlIG9ubHkg4oCUIGRvIG5vdCB1c2UgSlMgYXJyYXkvc3RyaW5nIG9yZGVyaW5nLlxuICAgICAgICBjb25zdCBwaWNrQ29zdDEgPVxuICAgICAgICAgICAgY29zdDEuYXAgPCBjb3N0Mi5hcCB8fFxuICAgICAgICAgICAgKGNvc3QxLmFwID09PSBjb3N0Mi5hcCAmJiBjb3N0MS5nb2xkIDwgY29zdDIuZ29sZCk7XG4gICAgICAgIHJldHVybiBwaWNrQ29zdDEgP1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QxLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH0gOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdvbGQ6IGNvc3QyLmdvbGQsXG4gICAgICAgICAgICAgICAgYXA6IGNvc3QyLmFwLFxuICAgICAgICAgICAgICAgIG1hcHM6IG1pbk1hcChjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29zdE9mKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IENvc3Qge1xuICAgICAgICBjb25zdCBzb3VyY2VDb3N0cyA9IFsuLi5pdGVtLnNvdXJjZXMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKHNvdXJjZUZpbHRlcilcbiAgICAgICAgICAgIC5tYXAoKGl0ZW1Tb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtU291cmNlLmFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiAwLCBhcDogaXRlbVNvdXJjZS5wcmljZSwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBnb2xkOiBpdGVtU291cmNlLnByaWNlLCBhcDogMCwgbWFwczoge30gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5nbGVDb3N0ID0gY29zdE9mKGl0ZW1Tb3VyY2UuaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGl0ZW1Tb3VyY2UuZ2FjaGFUcmllcyhpdGVtLCBjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogc2luZ2xlQ29zdC5nb2xkICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiBzaW5nbGVDb3N0LmFwICogbXVsdGlwbGllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhzaW5nbGVDb3N0Lm1hcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFttYXAsIHRyaWVzXSkgPT4gW21hcCwgdHJpZXMubWFwKG4gPT4gbiAqIG11bHRpcGxpZXIpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwczogT2JqZWN0LmZyb21FbnRyaWVzKFtbaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIFtpdGVtU291cmNlLml0ZW1zLmxlbmd0aF1dXSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNvdXJjZUNvc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VlZCB3aXRoIHRoZSBmaXJzdCByZWFsIHNvdXJjZSBjb3N0LiBBIHswLDB9IGlkZW50aXR5IHdvdWxkIGFsd2F5cyB3aW5cbiAgICAgICAgLy8gdW5kZXIgYSBjb3JyZWN0IG1pbiwgYW5kIHRoZSBvbGQgYWx3YXlzLWxhc3QgYnVnIGhpZCB0aGF0LlxuICAgICAgICByZXR1cm4gc291cmNlQ29zdHMucmVkdWNlKChjdXJyLCBjb3N0KSA9PiBtaW5Db3N0KGN1cnIsIGNvc3QpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVN0YXRpc3RpY3M6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuZnJvbUVudHJpZXMocHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBbc3RhdCwgMF0pKTtcbiAgICBjb25zdCBzdGF0aXN0aWNzID0ge1xuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgU2V0PENoYXJhY3Rlcj4sXG4gICAgICAgIExldmVsOiAwLFxuICAgICAgICBjb3N0OiB7IGFwOiAwLCBnb2xkOiAwLCBtYXBzOiB7fSB9IGFzIENvc3QsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIE9iamVjdC52YWx1ZXMocmVzdWx0cykpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGF0IG9mIHByaW9yaXR5U3RhdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLnJlZHVjZSgoY3Vyciwgc3RhdE5hbWUpID0+IGN1cnIgKyByZXN1bHRbMF0uc3RhdEZyb21TdHJpbmcoc3RhdE5hbWUpLCAwKTtcbiAgICAgICAgICAgIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSArPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRpc3RpY3MuTGV2ZWwgPSBNYXRoLm1heChyZXN1bHRbMF0ubGV2ZWwsIHN0YXRpc3RpY3MuTGV2ZWwpO1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXN1bHQpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hhciBvZiBpdGVtLmNoYXJhY3RlciA/IFtpdGVtLmNoYXJhY3Rlcl0gOiBjaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgc3RhdGlzdGljcy5jaGFyYWN0ZXJzLmFkZChjaGFyKVxuICAgICAgICAgICAgICAgIHRhYmxlQm9keS5hcHBlbmRDaGlsZChpdGVtVG9UYWJsZVJvdyhpdGVtLCBzb3VyY2VGaWx0ZXIsIHByaW9yaXR5U3RhdHMsIGNoYXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBGb290ZXIgY29zdCBtdXN0IG1hdGNoIHN0YXRzL2xldmVsOiBiZXN0IGNhbmRpZGF0ZSBwZXIgc2xvdCBvbmx5LlxuICAgICAgICAvLyBUaGUgYm9keSBzdGlsbCByZW5kZXJzIHRoZSBmdWxsIHJhbmtlZCBsaXN0IGFib3ZlLlxuICAgICAgICBzdGF0aXN0aWNzLmNvc3QgPSBjb21iaW5lQ29zdHMoXG4gICAgICAgICAgICBjb3N0T2YocmVzdWx0WzBdLCBjaGFyYWN0ZXIgJiYgaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSA/IGNoYXJhY3RlciA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICBzdGF0aXN0aWNzLmNvc3QsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpc3RpY3MuY2hhcmFjdGVycy5zaXplID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsX3NvdXJjZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuZ29sZCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuZ29sZC50b0ZpeGVkKDApfSBHb2xkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRpc3RpY3MuY29zdC5hcCA+IDApIHtcbiAgICAgICAgICAgIHRvdGFsX3NvdXJjZXMucHVzaChgJHtzdGF0aXN0aWNzLmNvc3QuYXAudG9GaXhlZCgwKX0gQVBgKTtcbiAgICAgICAgfVxuICAgICAgICAvL3N0YXRpc3RpY3NbJ0d1YXJkaWFuIGdhbWVzJ10uZm9yRWFjaCgoY291bnQsIG1hcCkgPT4gdG90YWxfc291cmNlcy5wdXNoKGAke2NvdW50LnRvRml4ZWQoMCl9IHggJHttYXB9YCkpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwidGZvb3RcIixcbiAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBOYW1lX2NvbHVtblwiIH0sIFwiVG90YWw6XCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQXJ0X2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgQ2hhcmFjdGVyX2NvbHVtblwiIH1dLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgUGFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZUhUTUwoW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBudW1lcmljXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7cHJpb3JpdHlTdGF0aXN0aWNzW3N0YXRdfWBcbiAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBMZXZlbF9jb2x1bW4gbnVtZXJpY1wiIH0sIGAke3N0YXRpc3RpY3MuTGV2ZWx9YF0sXG4gICAgICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJ0b3RhbCBTb3VyY2VfY29sdW1uXCIgfSwgdG90YWxfc291cmNlcy5qb2luKFwiLCBcIildLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbHVtbl9lbGVtZW50IG9mIHRhYmxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYENoYXJhY3Rlcl9jb2x1bW5gKSkge1xuICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgIGlmIChwcmlvcml0eVN0YXRpc3RpY3NbYXR0cmlidXRlXSA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGAke2F0dHJpYnV0ZX1fY29sdW1uYCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShjb2x1bW5fZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sdW1uX2VsZW1lbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFibGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhJdGVtTGV2ZWwoKSB7XG4gICAgLy9ubyByZWR1Y2UgZm9yIE1hcD9cbiAgICBsZXQgbWF4ID0gMDtcbiAgICBmb3IgKGNvbnN0IFssIGl0ZW1dIG9mIGl0ZW1zKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KG1heCwgaXRlbS5sZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBtYXg7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZGlhbG9nICYmIGRpYWxvZyA9PT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgIH1cbn0pO1xuIiwiaW1wb3J0IHsgbWFrZUNoZWNrYm94VHJlZSwgVHJlZU5vZGUsIGdldExlYWZTdGF0ZXMsIHNldExlYWZTdGF0ZXMgfSBmcm9tICcuL2NoZWNrYm94VHJlZSc7XG5pbXBvcnQgeyBjcmVhdGVQb3B1cExpbmssIGRvd25sb2FkSXRlbXMsIGdldFJlc3VsdHNUYWJsZSwgSXRlbSwgSXRlbVNvdXJjZSwgZ2V0TWF4SXRlbUxldmVsLCBpdGVtcywgQ2hhcmFjdGVyLCBjaGFyYWN0ZXJzLCBpc0NoYXJhY3RlciwgU2hvcEl0ZW1Tb3VyY2UsIEdhY2hhSXRlbVNvdXJjZSwgZ2V0R2FjaGFUYWJsZSB9IGZyb20gJy4vaXRlbUxvb2t1cCc7XG5pbXBvcnQgeyBjcmVhdGVIVE1MIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IHNlbGVjdEJ5UHJpb3JpdHkgfSBmcm9tICcuL3ByaW9yaXR5JztcbmltcG9ydCB7IFZhcmlhYmxlX3N0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuXG5jb25zdCBwYXJ0c0ZpbHRlciA9IFtcbiAgICBcIlBhcnRzXCIsIFtcbiAgICAgICAgXCJIZWFkXCIsIFtcbiAgICAgICAgICAgIFwiK0hhdFwiLFxuICAgICAgICAgICAgXCIrSGFpclwiLFxuICAgICAgICAgICAgXCJEeWVcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrVXBwZXJcIixcbiAgICAgICAgXCIrTG93ZXJcIixcbiAgICAgICAgXCJMZWdzXCIsIFtcbiAgICAgICAgICAgIFwiK1Nob2VzXCIsXG4gICAgICAgICAgICBcIlNvY2tzXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiQXV4XCIsIFtcbiAgICAgICAgICAgIFwiK0hhbmRcIixcbiAgICAgICAgICAgIFwiK0JhY2twYWNrXCIsXG4gICAgICAgICAgICBcIitGYWNlXCJcbiAgICAgICAgXSxcbiAgICAgICAgXCIrUmFja2V0XCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlciA9IFtcbiAgICBcIkF2YWlsYWJpbGl0eVwiLCBbXG4gICAgICAgIFwiU2hvcFwiLCBbXG4gICAgICAgICAgICBcIitHb2xkXCIsXG4gICAgICAgICAgICBcIitBUFwiLFxuICAgICAgICBdLFxuICAgICAgICBcIitBbGxvdyBnYWNoYVwiLFxuICAgICAgICBcIitHdWFyZGlhblwiLFxuICAgICAgICBcIitVbnRyYWRhYmxlXCIsXG4gICAgICAgIFwiVW5hdmFpbGFibGUgaXRlbXNcIixcbiAgICBdLFxuXTtcblxuY29uc3QgZXhjbHVkZWRfaXRlbV9pZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuLyoqIERpZ2l0cy1vbmx5IHNhZmUtaW50ZWdlciBwYXJzZSBmb3IgZXhjbHVkZWRfaXRlbV9pZHMgbG9jYWxTdG9yYWdlIHRva2Vucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4Y2x1ZGVkSXRlbUlkVG9rZW4odG9rZW46IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEvXlxcZCskLy50ZXN0KHRva2VuKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IE51bWJlcih0b2tlbik7XG4gICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihpZCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBhZGRGaWx0ZXJUcmVlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXJhY3RlckZpbHRlcnNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgZm9yIChjb25zdCBjaGFyYWN0ZXIgb2YgW1wiQWxsXCIsIC4uLmNoYXJhY3RlcnNdKSB7XG4gICAgICAgIGNvbnN0IGlkID0gYGNoYXJhY3RlclNlbGVjdG9yc18ke2NoYXJhY3Rlcn1gO1xuICAgICAgICBjb25zdCByYWRpb19idXR0b24gPSBjcmVhdGVIVE1MKFtcImlucHV0XCIsIHsgaWQ6IGlkLCB0eXBlOiBcInJhZGlvXCIsIG5hbWU6IFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIsIHZhbHVlOiBjaGFyYWN0ZXIgfV0pO1xuICAgICAgICByYWRpb19idXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQocmFkaW9fYnV0dG9uKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wibGFiZWxcIiwgeyBmb3I6IGlkIH0sIGNoYXJhY3Rlcl0pKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1wiYnJcIl0pKTtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICByYWRpb19idXR0b24uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmlsdGVyczogW1RyZWVOb2RlLCBzdHJpbmddW10gPSBbXG4gICAgICAgIFtwYXJ0c0ZpbHRlciwgXCJwYXJ0c0ZpbHRlclwiXSxcbiAgICAgICAgW2F2YWlsYWJpbGl0eUZpbHRlciwgXCJhdmFpbGFiaWxpdHlGaWx0ZXJcIl0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IFtmaWx0ZXIsIG5hbWVdIG9mIGZpbHRlcnMpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSk7XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHJlZSA9IG1ha2VDaGVja2JveFRyZWUoZmlsdGVyKTtcbiAgICAgICAgdHJlZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHVwZGF0ZVJlc3VsdHMpO1xuICAgICAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRyZWUpO1xuICAgIH1cbn1cblxuYWRkRmlsdGVyVHJlZXMoKTtcblxubGV0IGRyYWdnZWQ6IEhUTUxFbGVtZW50O1xuY29uc3QgZHJhZ1NlcGFyYXRvckxpbmUgPSBjcmVhdGVIVE1MKFtcImhyXCIsIHsgaWQ6IFwiZHJhZ092ZXJCYXJcIiB9XSk7XG5sZXQgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGNyZWF0ZVByaW9yaXR5TW92ZUljb24oZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IFNWR1NWR0VsZW1lbnQge1xuICAgIGNvbnN0IG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJzdmdcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwicHJpb3JpdHktbW92ZV9faWNvblwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLCBcIjAgMCAyNCAyNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxNFwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFwiMTRcIik7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKFwiZm9jdXNhYmxlXCIsIFwiZmFsc2VcIik7XG4gICAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgXCJwYXRoXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFxuICAgICAgICBcImRcIixcbiAgICAgICAgZGlyZWN0aW9uID09PSBcInVwXCIgPyBcIk02IDE0LjUgMTIgOC41bDYgNlwiIDogXCJNNiA5LjUgMTIgMTUuNWw2LTZcIixcbiAgICApO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIik7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2Utd2lkdGhcIiwgXCIyLjI1XCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlLWxpbmVjYXBcIiwgXCJyb3VuZFwiKTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS1saW5lam9pblwiLCBcInJvdW5kXCIpO1xuICAgIHN2Zy5hcHBlbmQocGF0aCk7XG4gICAgcmV0dXJuIHN2Zztcbn1cblxuLyoqIFJlYWQgcmFua2luZyBrZXkgZnJvbSB0aGUgbGFiZWwgbm9kZSBzbyBtb3ZlIGNvbnRyb2xzIG5ldmVyIHBvbGx1dGUgc3RhdCB0ZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW9yaXR5U3RhdExhYmVsKGl0ZW06IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxhYmVsID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LXN0YXQtbGFiZWxcIik7XG4gICAgaWYgKGxhYmVsPy50ZXh0Q29udGVudCkge1xuICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xufVxuXG5mdW5jdGlvbiBzZXRQcmlvcml0eVN0YXRMYWJlbChpdGVtOiBIVE1MRWxlbWVudCwgc3RhdDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGFiZWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktc3RhdC1sYWJlbFwiKTtcbiAgICBpZiAobGFiZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHN0YXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gc3RhdDtcbiAgICB9XG4gICAgY29uc3QgdXAgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBjb25zdCBkb3duID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAodXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICB1cC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBNb3ZlICR7c3RhdH0gaGlnaGVyIGluIHByaW9yaXR5YCk7XG4gICAgICAgIHVwLnRpdGxlID0gYE1vdmUgJHtzdGF0fSB1cGA7XG4gICAgfVxuICAgIGlmIChkb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgZG93bi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIGBNb3ZlICR7c3RhdH0gbG93ZXIgaW4gcHJpb3JpdHlgKTtcbiAgICAgICAgZG93bi50aXRsZSA9IGBNb3ZlICR7c3RhdH0gZG93bmA7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJpb3JpdHlMaXN0SXRlbShzdGF0OiBzdHJpbmcpOiBIVE1MTElFbGVtZW50IHtcbiAgICBjb25zdCB1cCA9IGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImJ1dHRvblwiLFxuICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgY2xhc3M6IFwicHJpb3JpdHktbW92ZSBwcmlvcml0eS1tb3ZlLXVwXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE1vdmUgJHtzdGF0fSBoaWdoZXIgaW4gcHJpb3JpdHlgLFxuICAgICAgICAgICAgdGl0bGU6IGBNb3ZlICR7c3RhdH0gdXBgLFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIHVwLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKFwidXBcIikpO1xuICAgIGNvbnN0IGRvd24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIGNsYXNzOiBcInByaW9yaXR5LW1vdmUgcHJpb3JpdHktbW92ZS1kb3duXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYE1vdmUgJHtzdGF0fSBsb3dlciBpbiBwcmlvcml0eWAsXG4gICAgICAgICAgICB0aXRsZTogYE1vdmUgJHtzdGF0fSBkb3duYCxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICBkb3duLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKFwiZG93blwiKSk7XG5cbiAgICByZXR1cm4gY3JlYXRlSFRNTChbXG4gICAgICAgIFwibGlcIixcbiAgICAgICAgeyBjbGFzczogXCJkcm9wem9uZVwiLCBkcmFnZ2FibGU6IFwidHJ1ZVwiIH0sXG4gICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJwcmlvcml0eS1zdGF0LWxhYmVsXCIgfSwgc3RhdF0sXG4gICAgICAgIGNyZWF0ZUhUTUwoW1wic3BhblwiLCB7IGNsYXNzOiBcInByaW9yaXR5LW1vdmUtY29udHJvbHNcIiB9LCB1cCwgZG93bl0pLFxuICAgIF0pO1xufVxuXG5mdW5jdGlvbiBwcmlvcml0eUxpc3RJdGVtcyhsaXN0OiBIVE1MT0xpc3RFbGVtZW50KTogSFRNTExJRWxlbWVudFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShsaXN0LmNoaWxkcmVuKS5maWx0ZXIoXG4gICAgICAgIChub2RlKTogbm9kZSBpcyBIVE1MTElFbGVtZW50ID0+IG5vZGUgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIG5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIiksXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gc3luY1ByaW9yaXR5TW92ZUJ1dHRvblN0YXRlKGxpc3Q6IEhUTUxPTGlzdEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtcyA9IHByaW9yaXR5TGlzdEl0ZW1zKGxpc3QpO1xuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHVwID0gaXRlbS5xdWVyeVNlbGVjdG9yKFwiLnByaW9yaXR5LW1vdmUtdXBcIik7XG4gICAgICAgIGNvbnN0IGRvd24gPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoXCIucHJpb3JpdHktbW92ZS1kb3duXCIpO1xuICAgICAgICBpZiAodXAgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgICAgdXAuZGlzYWJsZWQgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZG93biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgICBkb3duLmRpc2FibGVkID0gaW5kZXggPT09IGl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbW92ZVByaW9yaXR5TGlzdEl0ZW0oaXRlbTogSFRNTExJRWxlbWVudCwgZGlyZWN0aW9uOiBcInVwXCIgfCBcImRvd25cIik6IHZvaWQge1xuICAgIGNvbnN0IGxpc3QgPSBpdGVtLnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsID0gZGlyZWN0aW9uID09PSBcInVwXCIgPyBpdGVtLnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBpdGVtLm5leHRFbGVtZW50U2libGluZztcbiAgICB3aGlsZSAoc2libGluZyAmJiAhKHNpYmxpbmcgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50ICYmIHNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZHJvcHpvbmVcIikpKSB7XG4gICAgICAgIHNpYmxpbmcgPSBkaXJlY3Rpb24gPT09IFwidXBcIiA/IHNpYmxpbmcucHJldmlvdXNFbGVtZW50U2libGluZyA6IHNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgICBpZiAoIShzaWJsaW5nIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGlyZWN0aW9uID09PSBcInVwXCIpIHtcbiAgICAgICAgc2libGluZy5iZWZvcmUoaXRlbSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzaWJsaW5nLmFmdGVyKGl0ZW0pO1xuICAgIH1cbiAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xufVxuXG5mdW5jdGlvbiBhcHBseURyYWdEcm9wKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUsIC5wcmlvcml0eS1tb3ZlLWNvbnRyb2xzXCIpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvdyA9IHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKVxuICAgICAgICAgICAgPyB0YXJnZXRcbiAgICAgICAgICAgIDogdGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoIShyb3cgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkcmFnZ2VkID0gcm93O1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRyb3B6b25lID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoZHJvcHpvbmUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UmVjdCA9IGRyb3B6b25lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgLSB0YXJnZXRSZWN0LnRvcDtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHRhcmdldFJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgZW51bSBQb3NpdGlvbiB7XG4gICAgICAgICAgICAgICAgYWJvdmUsXG4gICAgICAgICAgICAgICAgb24sXG4gICAgICAgICAgICAgICAgYmVsb3csXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHkgPCBoZWlnaHQgKiAwLjMgPyBQb3NpdGlvbi5hYm92ZSA6IHkgPiBoZWlnaHQgKiAwLjcgPyBQb3NpdGlvbi5iZWxvdyA6IFBvc2l0aW9uLm9uO1xuICAgICAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYWJvdmU6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBkcm9wem9uZS5iZWZvcmUoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmJlbG93OlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZHJvcHpvbmUuYWZ0ZXIoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLm9uOlxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkID09PSBkcm9wem9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IGRyb3B6b25lO1xuICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAoIWRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbikge1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmFmdGVyKGRyYWdnZWQpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcmFnZ2VkLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgY29uc3QgZHJvcFRhcmdldCA9IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKCEoZHJvcFRhcmdldCBpbnN0YW5jZW9mIEhUTUxMSUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29tYmluZWQgPSBgJHtnZXRQcmlvcml0eVN0YXRMYWJlbChkcm9wVGFyZ2V0KX0rJHtnZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkKX1gO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwoZHJvcFRhcmdldCwgY29tYmluZWQpO1xuICAgICAgICAgICAgZHJhZ2dlZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcm9wVGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHJvcFJvdyA9IHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJkcm9wem9uZVwiKVxuICAgICAgICAgICAgPyB0YXJnZXRcbiAgICAgICAgICAgIDogdGFyZ2V0LmNsb3Nlc3QoXCIjcHJpb3JpdHlfbGlzdCA+IGxpLmRyb3B6b25lXCIpO1xuICAgICAgICBpZiAoZHJvcFJvdyA9PT0gZHJhZ2dlZCAmJiBkcmFnZ2VkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkKS5zcGxpdChcIitcIik7XG4gICAgICAgICAgICBzZXRQcmlvcml0eVN0YXRMYWJlbChkcmFnZ2VkLCBzdGF0cy5zaGlmdCgpISk7XG4gICAgICAgICAgICBkcmFnZ2VkLmFmdGVyKC4uLnN0YXRzLm1hcChzdGF0ID0+IGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdCkpKTtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBkcmFnZ2VkLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzeW5jUHJpb3JpdHlNb3ZlQnV0dG9uU3RhdGUobGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5hcHBseURyYWdEcm9wKCk7XG5cbmZ1bmN0aW9uIGh5ZHJhdGVQcmlvcml0eUxpc3RDb250cm9scygpOiB2b2lkIHtcbiAgICBjb25zdCBwcmlvcml0eUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2xpc3RcIik7XG4gICAgaWYgKCEocHJpb3JpdHlMaXN0IGluc3RhbmNlb2YgSFRNTE9MaXN0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICBpZiAoIWl0ZW0ucXVlcnlTZWxlY3RvcihcIi5wcmlvcml0eS1zdGF0LWxhYmVsXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gKGl0ZW0udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFzdGF0KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtLnJlcGxhY2VXaXRoKGNyZWF0ZVByaW9yaXR5TGlzdEl0ZW0oc3RhdCkpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3RhdGljIEhUTUwgc2hpcHMgZW1wdHkgY29udHJvbCBzaGVsbHM7IGZpbGwgaWNvbnMgd2l0aG91dCBsb3NpbmcgbGFiZWxzLlxuICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBpdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoXCIucHJpb3JpdHktbW92ZVwiKSkge1xuICAgICAgICAgICAgaWYgKCEoYnV0dG9uIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHx8IGJ1dHRvbi5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBidXR0b24uY2xhc3NMaXN0LmNvbnRhaW5zKFwicHJpb3JpdHktbW92ZS11cFwiKSA/IFwidXBcIiA6IFwiZG93blwiO1xuICAgICAgICAgICAgYnV0dG9uLmFwcGVuZChjcmVhdGVQcmlvcml0eU1vdmVJY29uKGRpcmVjdGlvbikpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN5bmNQcmlvcml0eU1vdmVCdXR0b25TdGF0ZShwcmlvcml0eUxpc3QpO1xufVxuXG5oeWRyYXRlUHJpb3JpdHlMaXN0Q29udHJvbHMoKTtcblxuZnVuY3Rpb24gY29tcGFyZShsaHM6IG51bWJlciwgcmhzOiBudW1iZXIpOiAtMSB8IDAgfCAxIHtcbiAgICBpZiAobGhzID09PSByaHMpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBsaHMgPCByaHMgPyAtMSA6IDE7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk6IENoYXJhY3RlciB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNDaGFyYWN0ZXIoc2VsZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkQ2hhcmFjdGVyKGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgXCJBbGxcIikge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSA9PT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBpdGVtU2VsZWN0b3JzID0gW1wicGFydHNTZWxlY3RvclwiLCBcImdhY2hhU2VsZWN0b3JcIl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBJdGVtU2VsZWN0b3IgPSB0eXBlb2YgaXRlbVNlbGVjdG9yc1tudW1iZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbVNlbGVjdG9yKGl0ZW1TZWxlY3Rvcjogc3RyaW5nKTogaXRlbVNlbGVjdG9yIGlzIEl0ZW1TZWxlY3RvciB7XG4gICAgcmV0dXJuIChpdGVtU2VsZWN0b3JzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLmluY2x1ZGVzKGl0ZW1TZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCk6IEl0ZW1TZWxlY3RvciB7XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAocGFydHNTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAoZ2FjaGFTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcImdhY2hhU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xufVxuXG5mdW5jdGlvbiBzYXZlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKSB8fCBcIkFsbFwiO1xuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIsIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvL21pc2NcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiLCBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIsIGl0ZW1fbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLmRlbGV0ZV92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIsIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCk7XG4gICAgfVxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIiwgZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiLCBBcnJheS5mcm9tKGV4Y2x1ZGVkX2l0ZW1faWRzKS5qb2luKFwiLFwiKSk7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc3RvcmVkX2NoYXJhY3RlciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIpO1xuICAgIHNldFNlbGVjdGVkQ2hhcmFjdGVyKHR5cGVvZiBzdG9yZWRfY2hhcmFjdGVyID09PSBcInN0cmluZ1wiICYmIGlzQ2hhcmFjdGVyKHN0b3JlZF9jaGFyYWN0ZXIpID8gc3RvcmVkX2NoYXJhY3RlciA6IFwiQWxsXCIpO1xuXG4gICAgey8vRmlsdGVyc1xuICAgICAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoVmFyaWFibGVfc3RvcmFnZS52YXJpYWJsZXMpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIHN0YXRlc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICB7IC8vbWlzY1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIik7XG4gICAgICAgIGlmICh0eXBlb2YgbWF4TGV2ZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHttYXhMZXZlbH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGxldmVscmFuZ2UubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbV9uYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBuYW1lZmlsdGVyLnZhbHVlID0gaXRlbV9uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZW5jaGFudFRvZ2dsZS5jaGVja2VkID0gISFWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgfVxuXG4gICAgLy8gUmVoeWRyYXRlIGV4Y2x1c2lvbnMgYmVmb3JlIGFueSBzYXZlLWNhcGFibGUgZXZlbnQgKGNoYW5nZS9pbnB1dCDihpIgdXBkYXRlUmVzdWx0cyDihpIgc2F2ZVNlbGVjdGlvbikuXG4gICAgY29uc3QgZXhjbHVkZWRfaWRzID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiKTtcbiAgICBpZiAodHlwZW9mIGV4Y2x1ZGVkX2lkcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2lkcy5zcGxpdChcIixcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRXhjbHVkZWRJdGVtSWRUb2tlbihpZCk7XG4gICAgICAgICAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBsZXQgaXRlbVR5cGVTZWxlY3RvciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtVHlwZVNlbGVjdG9yICE9PSBcInN0cmluZ1wiIHx8ICFpc0l0ZW1TZWxlY3RvcihpdGVtVHlwZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaXRlbVR5cGVTZWxlY3RvciA9IFwicGFydHNTZWxlY3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVR5cGVTZWxlY3Rvcik7XG4gICAgICAgIGlmICghKHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZWN0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSk7XG4gICAgfVxuXG4gICAgLy9tdXN0IGJlIGxhc3QgYmVjYXVzZSBpdCB0cmlnZ2VycyBhIHN0b3JlXG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVzdWx0cygpIHtcbiAgICBzYXZlU2VsZWN0aW9uKCk7XG4gICAgY29uc3QgZmlsdGVyczogKChpdGVtOiBJdGVtKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgY29uc3Qgc291cmNlRmlsdGVyczogKChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgbGV0IHNlbGVjdGVkQ2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB7IC8vY2hhcmFjdGVyIGZpbHRlclxuICAgICAgICBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkQ2hhcmFjdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0uY2hhcmFjdGVyID09PSBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vcGFydHMgZmlsdGVyXG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHNTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCk7XG4gICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gcGFydHNTdGF0ZXNbaXRlbS5wYXJ0XSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9hdmFpbGFiaWxpdHkgZmlsdGVyXG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVN0YXRlcyA9IGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCk7XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR29sZFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgIWl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFQXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiBpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbnRyYWRhYmxlXCJdKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLnBhcmNlbF9lbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFsbG93IGdhY2hhXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkd1YXJkaWFuXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVuYXZhaWxhYmxlIGl0ZW1zXCJdKSB7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIgPSBbLi4uc291cmNlRmlsdGVyc107XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VGaWx0ZXIgPSAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlRmlsdGVyKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVTb3VyY2UpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW0oaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbVNvdXJjZSBvZiBpdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9taXNjIGZpbHRlclxuICAgICAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpO1xuICAgICAgICBmaWx0ZXJzLnB1c2goKGl0ZW06IEl0ZW0pID0+IGl0ZW0ubGV2ZWwgPD0gbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ubmFtZV9lbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGl0ZW1fbmFtZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vaWQgZmlsdGVyXG4gICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+ICFleGNsdWRlZF9pdGVtX2lkcy5oYXMoaXRlbS5pZCkpO1xuICAgICAgICBjb25zdCBpdGVtRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXRlbUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEoaXRlbUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcblxuICAgICAgICB9XG4gICAgICAgIGl0ZW1GaWx0ZXJMaXN0LnJlcGxhY2VDaGlsZHJlbigpO1xuICAgICAgICBpZiAoZXhjbHVkZWRfaXRlbV9pZHMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgaXRlbUZpbHRlckxpc3QuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJlbXB0eS1ub3RlXCIgfSxcbiAgICAgICAgICAgICAgICBcIk5vIGV4Y2x1ZGVkIGl0ZW1zXCIsXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2l0ZW1faWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zLmdldChpZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJleGNsdWRlZC1pdGVtXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImV4Y2x1ZGVkLWl0ZW1fX25hbWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsX3JlbW92YWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgUmVzdG9yZSAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZXN0b3JlXCIsXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY29uc3QgY29tcGFyYXRvcnM6ICgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IG51bWJlcilbXSA9IFtdO1xuXG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlTdGF0cyA9IHByaW9yaXR5TGlzdEl0ZW1zKHByaW9yaXR5TGlzdClcbiAgICAgICAgLm1hcChub2RlID0+IGdldFByaW9yaXR5U3RhdExhYmVsKG5vZGUpKVxuICAgICAgICAuZmlsdGVyKHN0YXQgPT4gc3RhdC5sZW5ndGggPiAwKTtcbiAgICB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RhdCBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXQuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgY29tcGFyYXRvcnMucHVzaCgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IGNvbXBhcmUoXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gbGhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKSxcbiAgICAgICAgICAgICAgICBzdGF0cy5tYXAoc3RhdCA9PiByaHMuc3RhdEZyb21TdHJpbmcoc3RhdCkpLnJlZHVjZSgobiwgbSkgPT4gbiArIG0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhYmxlID0gKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChnZXRJdGVtVHlwZVNlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICBjYXNlICdwYXJ0c1NlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0c1RhYmxlKFxuICAgICAgICAgICAgICAgICAgICBpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UgPT4gc291cmNlRmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW1Tb3VyY2UpKSxcbiAgICAgICAgICAgICAgICAgICAgKGl0ZW1zLCBpdGVtKSA9PiBzZWxlY3RCeVByaW9yaXR5KGl0ZW1zLCBpdGVtLCBjb21wYXJhdG9ycyksXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5U3RhdHMsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhc2UgJ2dhY2hhU2VsZWN0b3InOlxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRHYWNoYVRhYmxlKGl0ZW0gPT4gZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gZmlsdGVyKGl0ZW0pKSwgc2VsZWN0ZWRDaGFyYWN0ZXIpO1xuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1wiKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdFJvd3MgPSB0YWJsZS50Qm9kaWVzWzBdPy5yb3dzLmxlbmd0aCA/PyBNYXRoLm1heCgwLCB0YWJsZS5yb3dzLmxlbmd0aCAtIDEpO1xuICAgIHRhcmdldC5pbm5lclRleHQgPSBcIlwiO1xuICAgIGlmIChyZXN1bHRSb3dzID09PSAwKSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJyZXN1bHRzLWVtcHR5XCIsIHJvbGU6IFwic3RhdHVzXCIgfSxcbiAgICAgICAgICAgIFwiTm8gaXRlbXMgbWF0Y2ggdGhlc2UgZmlsdGVycy5cIixcbiAgICAgICAgXSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBpZiAocmVzdWx0c1N0YXR1cykge1xuICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID0gcmVzdWx0Um93cyA9PT0gMFxuICAgICAgICAgICAgPyBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCJcbiAgICAgICAgICAgIDogYCR7cmVzdWx0Um93c30gbWF0Y2hpbmcgJHtyZXN1bHRSb3dzID09PSAxID8gXCJpdGVtXCIgOiBcIml0ZW1zXCJ9YDtcbiAgICB9XG4gICAgc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpO1xufVxuXG5sZXQgcmVzdWx0c1RhYmxlU2Nyb2xsQm91bmQgPSBmYWxzZTtcbmxldCByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCByZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQgPSBmYWxzZTtcblxuLyoqIEtlZXAgdGhlIHRvcCBjb2x1bW4gc2Nyb2xsZXIgd2lkdGggYW5kIHNjcm9sbExlZnQgYWxpZ25lZCB3aXRoIHRoZSByZXN1bHRzIHRhYmxlLiAqL1xuZnVuY3Rpb24gc3luY1Jlc3VsdHNUYWJsZVNjcm9sbCgpIHtcbiAgICBjb25zdCB0YWJsZVNjcm9sbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFibGVTY3JvbGxcIik7XG4gICAgY29uc3QgdGFibGVIU2Nyb2xsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxcIik7XG4gICAgY29uc3Qgc3BhY2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUhTY3JvbGxTcGFjZXJcIik7XG4gICAgY29uc3QgY29sdW1uUGFuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YWJsZUNvbHVtblBhblwiKTtcbiAgICBpZiAoISh0YWJsZVNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHRhYmxlSFNjcm9sbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKHNwYWNlciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGNvbHVtblBhbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHRzVGFibGVTY3JvbGxCb3VuZCkge1xuICAgICAgICByZXN1bHRzVGFibGVTY3JvbGxCb3VuZCA9IHRydWU7XG4gICAgICAgIGxldCBzeW5jaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IG1pcnJvciA9IChzb3VyY2U6IEhUTUxFbGVtZW50LCB0YXJnZXQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3luY2luZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN5bmNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGFyZ2V0LnNjcm9sbExlZnQgPSBzb3VyY2Uuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHN5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGFibGVTY3JvbGwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBtaXJyb3IodGFibGVTY3JvbGwsIHRhYmxlSFNjcm9sbCk7XG4gICAgICAgIH0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgdGFibGVIU2Nyb2xsLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgbWlycm9yKHRhYmxlSFNjcm9sbCwgdGFibGVTY3JvbGwpO1xuICAgICAgICB9LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcbiAgICAgICAgICAgIHN5bmNSZXN1bHRzVGFibGVTY3JvbGwoKTtcbiAgICAgICAgfSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXN1bHRzVGFibGVXaWR0aE9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzeW5jUmVzdWx0c1RhYmxlU2Nyb2xsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3VsdHNUYWJsZVdpZHRoT2JzZXJ2ZXIub2JzZXJ2ZSh0YWJsZVNjcm9sbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlU2Nyb2xsLnF1ZXJ5U2VsZWN0b3IoXCJ0YWJsZVwiKTtcbiAgICBpZiAoISh0YWJsZSBpbnN0YW5jZW9mIEhUTUxUYWJsZUVsZW1lbnQpKSB7XG4gICAgICAgIGNvbHVtblBhbi5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBjb2x1bW5QYW4uY2xhc3NMaXN0LnJlbW92ZShcImlzLXJldmVhbGVkXCIpO1xuICAgICAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBcIjBweFwiO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudFdpZHRoID0gTWF0aC5tYXgodGFibGUuc2Nyb2xsV2lkdGgsIHRhYmxlU2Nyb2xsLnNjcm9sbFdpZHRoKTtcbiAgICBzcGFjZXIuc3R5bGUud2lkdGggPSBgJHtjb250ZW50V2lkdGh9cHhgO1xuICAgIGNvbnN0IG5lZWRzSG9yaXpvbnRhbFNjcm9sbCA9IGNvbnRlbnRXaWR0aCA+IHRhYmxlU2Nyb2xsLmNsaWVudFdpZHRoICsgMTtcbiAgICBjb25zdCB3YXNIaWRkZW4gPSBjb2x1bW5QYW4uaGlkZGVuO1xuICAgIGNvbHVtblBhbi5oaWRkZW4gPSAhbmVlZHNIb3Jpem9udGFsU2Nyb2xsO1xuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ/LmlzU2FtZU5vZGUodGFibGVIU2Nyb2xsKSkge1xuICAgICAgICB0YWJsZUhTY3JvbGwuc2Nyb2xsTGVmdCA9IHRhYmxlU2Nyb2xsLnNjcm9sbExlZnQ7XG4gICAgfVxuICAgIGlmIChuZWVkc0hvcml6b250YWxTY3JvbGwgJiYgd2FzSGlkZGVuICYmICFyZXN1bHRzQ29sdW1uUGFuUmV2ZWFsZWQpIHtcbiAgICAgICAgcmVzdWx0c0NvbHVtblBhblJldmVhbGVkID0gdHJ1ZTtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5hZGQoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICAgICAgfSwgMjQwKTtcbiAgICB9XG4gICAgaWYgKCFuZWVkc0hvcml6b250YWxTY3JvbGwpIHtcbiAgICAgICAgY29sdW1uUGFuLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1yZXZlYWxlZFwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldE1heExldmVsRGlzcGxheVVwZGF0ZSgpIHtcbiAgICBjb25zdCBsZXZlbERpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVsRGlzcGxheVwiKTtcbiAgICBpZiAoIShsZXZlbERpc3BsYXkgaW5zdGFuY2VvZiBIVE1MTGFiZWxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbGV2ZWxyYW5nZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBsZXZlbERpc3BsYXkudGV4dENvbnRlbnQgPSBgTWF4IGxldmVsIHJlcXVpcmVtZW50OiAke2xldmVscmFuZ2UudmFsdWV9YDtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNwbGF5VXBkYXRlcygpIHtcbiAgICBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKTtcbiAgICBjb25zdCBuYW1lZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgIGlmICghKG5hbWVmaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBuYW1lZmlsdGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcblxuICAgIGNvbnN0IGVuY2hhbnRUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgZW5jaGFudFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJpb3JpdHlMaXN0SXRlbXMocHJpb3JpdHlMaXN0KSkge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBlbmNoYW50VG9nZ2xlLmNoZWNrZWQgPyAvXigoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLyA6IC9eTWF4ICgoPzpTdHIpfCg/OlN0YSl8KD86RGV4KXwoPzpXaWxsKSkkLztcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VyID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gXCJNYXggJDFcIiA6IFwiJDFcIjtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBnZXRQcmlvcml0eVN0YXRMYWJlbChub2RlKS5zcGxpdChcIitcIikubWFwKHMgPT4gcy5yZXBsYWNlKHJlZ2V4LCByZXBsYWNlcikpLmpvaW4oXCIrXCIpO1xuICAgICAgICAgICAgc2V0UHJpb3JpdHlTdGF0TGFiZWwobm9kZSwgbmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xufVxuXG5zZXREaXNwbGF5VXBkYXRlcygpO1xuXG5mdW5jdGlvbiBzZXRNb2JpbGVGaWx0ZXJDb250cm9scygpIHtcbiAgICBjb25zdCBmaWx0ZXJUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlclRvZ2dsZVwiKTtcbiAgICBjb25zdCBjbG9zZUZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlRmlsdGVyc1wiKTtcbiAgICBjb25zdCBmaWx0ZXJQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udHJvbFJhaWxcIik7XG4gICAgY29uc3QgZmlsdGVyQmFja2Ryb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlckJhY2tkcm9wXCIpO1xuICAgIGlmICghKGZpbHRlclRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGNsb3NlRmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKGZpbHRlclBhbmVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyQmFja2Ryb3AgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0b2dnbGVCdXR0b24gPSBmaWx0ZXJUb2dnbGU7XG4gICAgY29uc3QgY2xvc2VCdXR0b24gPSBjbG9zZUZpbHRlcnM7XG4gICAgY29uc3QgcGFuZWwgPSBmaWx0ZXJQYW5lbDtcbiAgICBjb25zdCBiYWNrZHJvcEJ1dHRvbiA9IGZpbHRlckJhY2tkcm9wO1xuXG4gICAgZnVuY3Rpb24gc2V0T3BlbihvcGVuOiBib29sZWFuKSB7XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICB0b2dnbGVCdXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBgJHtvcGVufWApO1xuICAgICAgICBiYWNrZHJvcEJ1dHRvbi5oaWRkZW4gPSAhb3BlbjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZmlsdGVycy1vcGVuXCIsIG9wZW4pO1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgY29uc3QgbmFtZUZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgICAgIGlmIChuYW1lRmlsdGVyIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZvY3VzQWZ0ZXJPcGVuID0gKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnByb3BlcnR5TmFtZSAhPT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhbmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIGZvY3VzQWZ0ZXJPcGVuKTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgIG5hbWVGaWx0ZXIuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbi5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKHRydWUpKTtcbiAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0T3BlbihmYWxzZSkpO1xuICAgIGJhY2tkcm9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtb3BlblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgIT09IFwiVGFiXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IEFycmF5LmZyb20ocGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXG4gICAgICAgICAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzdW1tYXJ5LCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknXG4gICAgICAgICkpLmZpbHRlcihlbGVtZW50ID0+IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggPiAwKTtcbiAgICAgICAgaWYgKGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzWzBdO1xuICAgICAgICBjb25zdCBsYXN0RWxlbWVudCA9IGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZmlyc3RFbGVtZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGFzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghZXZlbnQuc2hpZnRLZXlcbiAgICAgICAgICAgICYmICghcGFuZWwuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgfHwgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gbGFzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZmlyc3RFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3aW5kb3cubWF0Y2hNZWRpYShcIihtaW4td2lkdGg6IDg4MHB4KVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICh7IG1hdGNoZXMgfSkgPT4ge1xuICAgICAgICBpZiAobWF0Y2hlcyAmJiBwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5zZXRNb2JpbGVGaWx0ZXJDb250cm9scygpO1xuXG5mdW5jdGlvbiBzZXRSZXNldEZpbHRlckNvbnRyb2woKSB7XG4gICAgY29uc3QgcmVzZXRGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldEZpbHRlcnNcIik7XG4gICAgY29uc3QgcmVmaW5lbWVudFN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVmaW5lbWVudFN0YXR1c1wiKTtcbiAgICBpZiAoIShyZXNldEZpbHRlcnMgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudClcbiAgICAgICAgfHwgIShyZWZpbmVtZW50U3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzZXRGaWx0ZXJzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHJlZmluZW1lbnRTdGF0dXMudGV4dENvbnRlbnQgPSBcIlJlc2V0dGluZyBmaWx0ZXJz4oCmXCI7XG4gICAgICAgIFZhcmlhYmxlX3N0b3JhZ2UuY2xlYXJfYWxsKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn1cblxuc2V0UmVzZXRGaWx0ZXJDb250cm9sKCk7XG5cbmZ1bmN0aW9uIHNldEl0ZW1UeXBlU2VsZWN0b3JGdW5jdGlvbmFsaXR5KCkge1xuICAgIGNvbnN0IHByaW9yaXR5X2dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9ncm91cFwiKTtcbiAgICBpZiAoIShwcmlvcml0eV9ncm91cCBpbnN0YW5jZW9mIEhUTUxGaWVsZFNldEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik7XG4gICAgaWYgKCEocGFydHNGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYXJ0c1NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnYWNoYVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBwcmlvcml0eV9ncm91cC5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIHBhcnRzRmlsdGVyLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIH0pO1xuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0c0dyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRzX2dyb3VwXCIpO1xuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgY29uc3QgbG9hZGluZ0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xuICAgIGNvbnN0IGxvYWRpbmdDb3B5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLXN0YXRlX19jb3B5IHNwYW5cIik7XG4gICAgaWYgKCEocmVzdWx0c1N0YXR1cyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICB8fCAhKGxvYWRpbmdMYWJlbCBpbnN0YW5jZW9mIEhUTUxMYWJlbEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0NvcHkgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcInRydWVcIik7XG4gICAgc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKTtcbiAgICByZXN0b3JlU2VsZWN0aW9uKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZG93bmxvYWRJdGVtcygpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXN1bHRzU3RhdHVzLnRleHRDb250ZW50ID0gXCJJdGVtIGRhdGEgdW5hdmFpbGFibGVcIjtcbiAgICAgICAgbG9hZGluZ0xhYmVsLnRleHRDb250ZW50ID0gXCJDb3VsZCBub3QgbG9hZCBlcXVpcG1lbnQgZGF0YVwiO1xuICAgICAgICBsb2FkaW5nQ29weS50ZXh0Q29udGVudCA9IFwiQ2hlY2sgdGhlIHByZXZpZXcgc2VydmVyIGNvbm5lY3Rpb24sIHRoZW4gcmVsb2FkIHRoaXMgcGFnZS5cIjtcbiAgICAgICAgcmVzdWx0c0dyb3VwPy5zZXRBdHRyaWJ1dGUoXCJhcmlhLWJ1c3lcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNob3dfYWZ0ZXJfbG9hZFwiKSkge1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiaGlkZV9hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxldmVscmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVscmFuZ2VcIik7XG4gICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgbWF4TGV2ZWwgPSBnZXRNYXhJdGVtTGV2ZWwoKTtcbiAgICBsZXZlbHJhbmdlLnZhbHVlID0gYCR7TWF0aC5taW4ocGFyc2VJbnQobGV2ZWxyYW5nZS52YWx1ZSksIG1heExldmVsKX1gO1xuICAgIGxldmVscmFuZ2UubWF4ID0gYCR7bWF4TGV2ZWx9YDtcbiAgICBsZXZlbHJhbmdlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xuICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgIGNvbnN0IHNvcnRfaGVscCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGVnZW5kXCIpO1xuICAgIGlmIChzb3J0X2hlbHAgaW5zdGFuY2VvZiBIVE1MTGVnZW5kRWxlbWVudCkge1xuICAgICAgICBzb3J0X2hlbHAuYXBwZW5kQ2hpbGQoY3JlYXRlUG9wdXBMaW5rKFwiICg/KVwiLCBjcmVhdGVIVE1MKFtcInBcIixcbiAgICAgICAgICAgIFwiUmVvcmRlciB0aGUgc3RhdHMgdG8geW91ciBsaWtpbmcgdG8gYWZmZWN0IHRoZSByZXN1bHRzIGxpc3QuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJVc2UgdGhlIHVwL2Rvd24gYXJyb3dzLCBvciBkcmFnIGEgc3RhdCwgdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBtb3ZlIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcmlvcml0eVVwID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoXCIucHJpb3JpdHktbW92ZS11cFwiKTtcbiAgICBpZiAocHJpb3JpdHlVcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmICFwcmlvcml0eVVwLmRpc2FibGVkKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByaW9yaXR5VXAuY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwidXBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW9yaXR5RG93biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnByaW9yaXR5LW1vdmUtZG93blwiKTtcbiAgICBpZiAocHJpb3JpdHlEb3duIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiYgIXByaW9yaXR5RG93bi5kaXNhYmxlZCkge1xuICAgICAgICBjb25zdCByb3cgPSBwcmlvcml0eURvd24uY2xvc2VzdChcIiNwcmlvcml0eV9saXN0ID4gbGkuZHJvcHpvbmVcIik7XG4gICAgICAgIGlmIChyb3cgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBtb3ZlUHJpb3JpdHlMaXN0SXRlbShyb3csIFwiZG93blwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhjbHVkZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbFwiKTtcbiAgICBpZiAoZXhjbHVkZUJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICghZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VJbnQoZXhjbHVkZUJ1dHRvbi5kYXRhc2V0Lml0ZW1faW5kZXgpKTtcbiAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdG9yZUJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLml0ZW1fcmVtb3ZhbF9yZW1vdmFsXCIpO1xuICAgIGlmIChyZXN0b3JlQnV0dG9uIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCFyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChyZXN0b3JlQnV0dG9uLmRhdGFzZXQuaXRlbV9pbmRleCkpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfVxufSk7XG4iLCJleHBvcnQgdHlwZSBQcmlvcml0eUNvbXBhcmF0b3I8VD4gPSAobGhzOiBULCByaHM6IFQpID0+IG51bWJlcjtcblxuLyoqXG4gKiBJbnNlcnQgYGNhbmRpZGF0ZWAgaW50byBhIGJlc3QtZmlyc3QgcmFua2luZy5cbiAqIEhpZ2hlciBjb21wYXJhdG9yIHZhbHVlcyBtZWFuIHRoZSBsZWZ0LWhhbmQgaXRlbSByYW5rcyBiZXR0ZXIuXG4gKiBFdmVyeSBjYW5kaWRhdGUgaXMgcmV0YWluZWQgc28gdGhlIFVJIGNhbiBzaG93IHRoZSBmdWxsIGZpbHRlcmVkIGludmVudG9yeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdEJ5UHJpb3JpdHk8VD4oXG4gICAgY3VycmVudDogVFtdLFxuICAgIGNhbmRpZGF0ZTogVCxcbiAgICBjb21wYXJhdG9yczogcmVhZG9ubHkgUHJpb3JpdHlDb21wYXJhdG9yPFQ+W10sXG4pOiBUW10ge1xuICAgIGlmIChjdXJyZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW2NhbmRpZGF0ZV07XG4gICAgfVxuXG4gICAgbGV0IGluc2VydEF0ID0gY3VycmVudC5sZW5ndGg7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGN1cnJlbnQubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgIGxldCBkZWNpZGVkID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBjb21wYXJhdG9yIG9mIGNvbXBhcmF0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb21wYXJhdG9yKGN1cnJlbnRbaW5kZXhdLCBjYW5kaWRhdGUpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGRlY2lkZWQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlY2lkZWQgPCAwKSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50W2luZGV4XSBpcyB3b3JzZSB0aGFuIGNhbmRpZGF0ZTogaW5zZXJ0IGJlZm9yZSBpdC5cbiAgICAgICAgICAgIGluc2VydEF0ID0gaW5kZXg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWNpZGVkID4gMDogY3VycmVudCBpdGVtIGlzIGJldHRlcjsga2VlcCBzY2FubmluZy5cbiAgICAgICAgLy8gZGVjaWRlZCA9PT0gMDogZXhhY3QgdGllOyBrZWVwIHNjYW5uaW5nIHNvIHRpZXMgc3RheSBzdGFibGUvRklGTy5cbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKDAsIGluc2VydEF0KSxcbiAgICAgICAgY2FuZGlkYXRlLFxuICAgICAgICAuLi5jdXJyZW50LnNsaWNlKGluc2VydEF0KSxcbiAgICBdO1xufVxuIiwiZXhwb3J0IHR5cGUgVmFyaWFibGVfc3RvcmFnZV90eXBlcyA9IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW47XG5cbnR5cGUgU3RvcmFnZV92YWx1ZSA9IGAke1wic1wiIHwgXCJuXCIgfCBcImJcIn0ke3N0cmluZ31gO1xuXG5mdW5jdGlvbiB2YXJpYWJsZV90b19zdHJpbmcodmFsdWU6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMpOiBTdG9yYWdlX3ZhbHVlIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gYHMke3ZhbHVlfWAgYXMgY29uc3Q7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBgbiR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IFwiYjFcIiA6IFwiYjBcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN0cmluZ190b192YXJpYWJsZSh2djogU3RvcmFnZV92YWx1ZSk6IFZhcmlhYmxlX3N0b3JhZ2VfdHlwZXMge1xuICAgIGNvbnN0IHByZWZpeCA9IHZ2WzBdO1xuICAgIGNvbnN0IHZhbHVlID0gdnYuc3Vic3RyaW5nKDEpO1xuICAgIHN3aXRjaCAocHJlZml4KSB7XG4gICAgICAgIGNhc2UgJ3MnOiAvL3N0cmluZ1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICBjYXNlICduJzogLy9udW1iZXJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgY2FzZSAnYic6IC8vYm9vbGVhblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSBcIjFcIiA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gICAgdGhyb3cgYGludmFsaWQgdmFsdWU6ICR7dnZ9YDtcbn1cblxuZnVuY3Rpb24gaXNfc3RvcmFnZV92YWx1ZShrZXk6IHN0cmluZyk6IGtleSBpcyBTdG9yYWdlX3ZhbHVlIHtcbiAgICByZXR1cm4ga2V5Lmxlbmd0aCA+PSAxICYmIFwic25iXCIuaW5jbHVkZXMoa2V5WzBdKTtcbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlX3N0b3JhZ2Uge1xuICAgIHN0YXRpYyBnZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RvcmVkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHN0b3JlZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nX3RvX3ZhcmlhYmxlKHN0b3JlZCk7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nLCB2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcykge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHt2YXJpYWJsZV9uYW1lfWAsIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZSkpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVsZXRlX3ZhcmlhYmxlKHZhcmlhYmxlX25hbWU6IHN0cmluZykge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHt2YXJpYWJsZV9uYW1lfWApO1xuICAgIH1cbiAgICBzdGF0aWMgY2xlYXJfYWxsKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9XG4gICAgc3RhdGljIGdldCB2YXJpYWJsZXMoKSB7XG4gICAgICAgIGxldCByZXN1bHQ6IHsgW2tleTogc3RyaW5nXTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB9ID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxTdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNfc3RvcmFnZV92YWx1ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc3RyaW5nX3RvX3ZhcmlhYmxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn0iXX0=
