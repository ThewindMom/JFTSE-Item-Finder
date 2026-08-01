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
function createGachaSourceSummary(item, itemSource, sourceFilter, character) {
  const gacha = gachas.get(itemSource.shop_id);
  if (!gacha) {
    throw "Internal error";
  }
  const directSource = itemSource.item.sources.find(source => source instanceof ShopItemSource);
  const alternativeSources = itemSourcesToElementArray(itemSource.item, source => source !== directSource && sourceFilter(source), itemSource.requiresGuardian ? undefined : character);
  const alternativeList = makeSourcesList(alternativeSources);
  return (0, _html.createHTML)(["div", {
    class: "gacha-source-summary",
    role: "group",
    "aria-label": `${gacha.name} acquisition`
  }, createGachaCoinArt(gacha), ["div", {
    class: "gacha-source-summary__content"
  }, ["div", {
    class: "gacha-identity"
  }, createGachaSourcePopup(item, itemSource, itemSource.requiresGuardian ? undefined : character)], ...(alternativeList.length > 0 ? [(0, _html.createHTML)(["div", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjaGVja2JveFRyZWUudHMiLCJodG1sLnRzIiwiaXRlbUxvb2t1cC50cyIsIm1haW4udHMiLCJwcmlvcml0eS50cyIsInN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQUEsS0FBQSxHQUFBLE9BQUE7QUFJQSxTQUFTLFdBQVcsQ0FBQyxJQUFzQjtFQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYTtFQUNwQyxJQUFJLEVBQUUsU0FBUyxZQUFZLGFBQWEsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLGFBQWE7RUFDekMsSUFBSSxFQUFFLFNBQVMsWUFBWSxnQkFBZ0IsQ0FBQyxFQUFFO0lBQzFDLE9BQU8sRUFBRTtFQUNiO0VBQ0EsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFO0lBQzNFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDOUM7SUFDSjtJQUNBLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM3RSxJQUFJLEVBQUUscUJBQXFCLFlBQVksZ0JBQWdCLENBQUMsRUFBRTtNQUN0RDtJQUNKO0lBQ0EsT0FBTyxLQUFLLENBQ1AsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUNwQyxNQUFNLENBQUUsQ0FBQyxJQUF5QixDQUFDLFlBQVksYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksZ0JBQWdCLENBQUMsQ0FDMUcsR0FBRyxDQUFDLENBQUMsSUFB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LE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMxQyxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztNQUMvQixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUN6QjtNQUNKO01BQ0EsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDdkMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0I7TUFDSjtNQUNBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQjtNQUNKO01BQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQztJQUMzQztJQUNBLE9BQU8sTUFBTTtFQUNqQjs7QUFDSCxPQUFBLENBQUEsZ0JBQUEsR0FBQSxnQkFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgdHlwZSBUcmVlTm9kZSA9IHN0cmluZyB8IFRyZWVOb2RlW107XG5cbmZ1bmN0aW9uIGdldENoaWxkcmVuKG5vZGU6IEhUTUxJbnB1dEVsZW1lbnQpOiBIVE1MSW5wdXRFbGVtZW50W10ge1xuICAgIGNvbnN0IHBhcmVudF9saSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfbGkgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudF91bCA9IHBhcmVudF9saS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghKHBhcmVudF91bCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgZm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBwYXJlbnRfdWwuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcbiAgICAgICAgaWYgKHBhcmVudF91bC5jaGlsZHJlbltjaGlsZEluZGV4XSAhPT0gcGFyZW50X2xpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3RlbnRpYWxTaWJsaW5nRW50cnkgPSBwYXJlbnRfdWwuY2hpbGRyZW5bY2hpbGRJbmRleCArIDFdPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEocG90ZW50aWFsU2libGluZ0VudHJ5IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheVxuICAgICAgICAgICAgLmZyb20ocG90ZW50aWFsU2libGluZ0VudHJ5LmNoaWxkcmVuKVxuICAgICAgICAgICAgLmZpbHRlcigoZSk6IGUgaXMgSFRNTExJRWxlbWVudCA9PiBlIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudClcbiAgICAgICAgICAgIC5tYXAoZSA9PiBlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4obm9kZSkpIHtcbiAgICAgICAgaWYgKGNoaWxkLmNoZWNrZWQgIT09IG5vZGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hpbGQuY2hlY2tlZCA9IG5vZGUuY2hlY2tlZDtcbiAgICAgICAgICAgIGNoaWxkLmluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGFwcGx5Q2hlY2tlZFRvRGVzY2VuZGFudHMoY2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnQobm9kZTogSFRNTElucHV0RWxlbWVudCk6IEhUTUxJbnB1dEVsZW1lbnQgfCB2b2lkIHtcbiAgICBjb25zdCBwYXJlbnRfbGkgPSBub2RlLnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCEocGFyZW50X2xpIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRfdWwgPSBwYXJlbnRfbGkucGFyZW50RWxlbWVudDtcbiAgICBpZiAoIShwYXJlbnRfdWwgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYW5kaWRhdGU6IEhUTUxMSUVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBwYXJlbnRfdWwuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCAmJiBjaGlsZC5jaGlsZHJlblswXSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZSA9IGNoaWxkO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkID09PSBwYXJlbnRfbGkgJiYgY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FuZGlkYXRlLmNoaWxkcmVuWzBdIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFuY2VzdG9ycyhub2RlOiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgY29uc3QgcGFyZW50ID0gZ2V0UGFyZW50KG5vZGUpO1xuICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGZvdW5kQ2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZFVuY2hlY2tlZCA9IGZhbHNlO1xuICAgIGxldCBmb3VuZEluZGV0ZXJtaW5hdGUgPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZ2V0Q2hpbGRyZW4ocGFyZW50KSkge1xuICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCkge1xuICAgICAgICAgICAgZm91bmRDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvdW5kVW5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hpbGQuaW5kZXRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgZm91bmRJbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJbmRldGVybWluYXRlIHx8IGZvdW5kQ2hlY2tlZCAmJiBmb3VuZFVuY2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuaW5kZXRlcm1pbmF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kQ2hlY2tlZCkge1xuICAgICAgICBwYXJlbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKGZvdW5kVW5jaGVja2VkKSB7XG4gICAgICAgIHBhcmVudC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHBhcmVudC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuICAgIHVwZGF0ZUFuY2VzdG9ycyhwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBhcHBseUNoZWNrTGlzdGVuZXIobm9kZTogSFRNTElucHV0RWxlbWVudCkge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXBwbHlDaGVja2VkVG9EZXNjZW5kYW50cyh0YXJnZXQpO1xuICAgICAgICB1cGRhdGVBbmNlc3RvcnModGFyZ2V0KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlDaGVja0xpc3RlbmVycyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50KSB7XG4gICAgICAgICAgICBhcHBseUNoZWNrTGlzdGVuZXIoZWxlbWVudC5jaGlsZHJlblswXSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgYXBwbHlDaGVja0xpc3RlbmVycyhlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZU5vZGUodHJlZU5vZGU6IFRyZWVOb2RlKTogSFRNTExJRWxlbWVudCB7XG4gICAgaWYgKHR5cGVvZiB0cmVlTm9kZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIi1cIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyZWVOb2RlWzBdID09PSBcIitcIikge1xuICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBjaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cmVlTm9kZS5yZXBsYWNlQWxsKFwiIFwiLCBcIl9cIiksXG4gICAgICAgICAgICAgICAgICAgIC4uLihjaGVja2VkICYmIHsgY2hlY2tlZDogXCJjaGVja2VkXCIgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwibGFiZWxcIixcbiAgICAgICAgICAgICAgICB7IGZvcjogdHJlZU5vZGUucmVwbGFjZUFsbChcIiBcIiwgXCJfXCIpIH0sXG4gICAgICAgICAgICAgICAgdHJlZU5vZGVcbiAgICAgICAgICAgIF1cbiAgICAgICAgXSk7XG4gICAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBsaXN0ID0gY3JlYXRlSFRNTChbXCJ1bFwiLCB7IGNsYXNzOiBcImNoZWNrYm94XCIgfV0pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVOb2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdHJlZU5vZGVbaV07XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKG1ha2VDaGVja2JveFRyZWVOb2RlKG5vZGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlSFRNTChbXCJsaVwiLCBsaXN0XSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNoZWNrYm94VHJlZSh0cmVlTm9kZTogVHJlZU5vZGUpIHtcbiAgICBsZXQgcm9vdCA9IG1ha2VDaGVja2JveFRyZWVOb2RlKHRyZWVOb2RlKS5jaGlsZHJlblswXTtcbiAgICBpZiAoIShyb290IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBhcHBseUNoZWNrTGlzdGVuZXJzKHJvb3QpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBnZXRMZWF2ZXMocm9vdCkpIHtcbiAgICAgICAgdXBkYXRlQW5jZXN0b3JzKGxlYWYpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gZ2V0TGVhdmVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQpIHtcbiAgICBsZXQgcmVzdWx0OiBIVE1MSW5wdXRFbGVtZW50W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChnZXRDaGlsZHJlbihpbnB1dCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChnZXRMZWF2ZXMoaW5wdXQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVhZlN0YXRlcyhub2RlOiBIVE1MVUxpc3RFbGVtZW50KSB7XG4gICAgbGV0IHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIHN0YXRlc1tsZWFmLmlkLnJlcGxhY2VBbGwoXCJfXCIsIFwiIFwiKV0gPSBsZWFmLmNoZWNrZWQ7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRMZWFmU3RhdGVzKG5vZGU6IEhUTUxVTGlzdEVsZW1lbnQsIHN0YXRlczogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0pIHtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgZ2V0TGVhdmVzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RhdGVzW2xlYWYuaWQucmVwbGFjZUFsbChcIl9cIiwgXCIgXCIpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbGVhZi5jaGVja2VkID0gc3RhdGU7XG4gICAgICAgIHVwZGF0ZUFuY2VzdG9ycyhsZWFmKTtcbiAgICB9XG59XG4iLCJ0eXBlIFRhZ19uYW1lID0ga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xudHlwZSBBdHRyaWJ1dGVzID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbnR5cGUgSFRNTF9ub2RlPFQgZXh0ZW5kcyBUYWdfbmFtZT4gPSBbVCwgLi4uKEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZyB8IEF0dHJpYnV0ZXMpW11dO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSFRNTDxUIGV4dGVuZHMgVGFnX25hbWU+KG5vZGU6IEhUTUxfbm9kZTxUPik6IEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZVswXSk7XG4gICAgZnVuY3Rpb24gaGFuZGxlKHBhcmFtZXRlcjogQXR0cmlidXRlcyB8IEhUTUxfbm9kZTxUYWdfbmFtZT4gfCBIVE1MRWxlbWVudCB8IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlciA9PT0gXCJzdHJpbmdcIiB8fCBwYXJhbWV0ZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQocGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBhcmFtZXRlcikpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNyZWF0ZUhUTUwocGFyYW1ldGVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHBhcmFtZXRlcltrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFuZGxlKG5vZGVbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUhUTUwgfSBmcm9tICcuL2h0bWwnO1xuXG5leHBvcnQgY29uc3QgY2hhcmFjdGVycyA9IFtcIk5pa2lcIiwgXCJMdW5MdW5cIiwgXCJMdWN5XCIsIFwiU2h1YVwiLCBcIkRoYW5waXJcIiwgXCJQb2NoaVwiLCBcIkFsXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0gdHlwZW9mIGNoYXJhY3RlcnNbbnVtYmVyXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0NoYXJhY3RlcihjaGFyYWN0ZXI6IHN0cmluZyk6IGNoYXJhY3RlciBpcyBDaGFyYWN0ZXIge1xuICAgIHJldHVybiAoY2hhcmFjdGVycyBhcyB1bmtub3duIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhjaGFyYWN0ZXIpO1xufVxuXG5leHBvcnQgdHlwZSBQYXJ0ID0gXCJIYXRcIiB8IFwiSGFpclwiIHwgXCJEeWVcIiB8IFwiVXBwZXJcIiB8IFwiTG93ZXJcIiB8IFwiU2hvZXNcIiB8IFwiU29ja3NcIiB8IFwiSGFuZFwiIHwgXCJCYWNrcGFja1wiIHwgXCJGYWNlXCIgfCBcIlJhY2tldFwiIHwgXCJPdGhlclwiO1xuXG5leHBvcnQgY2xhc3MgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgc2hvcF9pZDogbnVtYmVyKSB7IH1cblxuICAgIGdldCByZXF1aXJlc0d1YXJkaWFuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFNob3BJdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcyBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi50aGlzLml0ZW0uc291cmNlcy52YWx1ZXMoKV0uZXZlcnkoc291cmNlID0+IHNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzIGluc3RhbmNlb2YgR3VhcmRpYW5JdGVtU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gc2hvcF9pdGVtcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgZmluZGluZyBpdGVtIG9mIGl0ZW1Tb3VyY2UgJHt0aGlzLnNob3BfaWR9YCk7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2hvcEl0ZW1Tb3VyY2UgZXh0ZW5kcyBJdGVtU291cmNlIHtcbiAgICBjb25zdHJ1Y3RvcihzaG9wX2lkOiBudW1iZXIsIHJlYWRvbmx5IHByaWNlOiBudW1iZXIsIHJlYWRvbmx5IGFwOiBib29sZWFuLCByZWFkb25seSBpdGVtczogSXRlbVtdKSB7XG4gICAgICAgIHN1cGVyKHNob3BfaWQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhY2hhSXRlbVNvdXJjZSBleHRlbmRzIEl0ZW1Tb3VyY2Uge1xuICAgIGNvbnN0cnVjdG9yKHNob3BfaWQ6IG51bWJlcikge1xuICAgICAgICBzdXBlcihzaG9wX2lkKTtcbiAgICB9XG5cbiAgICBnYWNoYVRyaWVzKGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgICAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQodGhpcy5zaG9wX2lkKTtcbiAgICAgICAgaWYgKCFnYWNoYSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnYWNoYS5hdmVyYWdlX3RyaWVzKGl0ZW0sIGNoYXJhY3Rlcik7XG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBHYWNoYUVjb25vbWljcyA9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiO1xuICAgICAgICBjaGFuY2VQZXJjZW50OiBudW1iZXI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICB9XG4gICAgfCB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIjtcbiAgICAgICAgY2hhbmNlUGVyY2VudDogbnVtYmVyO1xuICAgICAgICBjdXJyZW5jeTogXCJBUFwiIHwgXCJHb2xkXCI7XG4gICAgICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcjtcbiAgICAgICAgZXhwZWN0ZWRTcGVuZDogbnVtYmVyO1xuICAgICAgICBwcmljZVBlclB1bGw6IG51bWJlcjtcbiAgICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdEdhY2hhRWNvbm9taWNzKFxuICAgIGV4cGVjdGVkUHVsbHM6IG51bWJlcixcbiAgICBzb3VyY2U/OiB7IHByaWNlOiBudW1iZXI7IGFwOiBib29sZWFuIH0sXG4pOiBHYWNoYUVjb25vbWljcyB7XG4gICAgY29uc3QgY2hhbmNlUGVyY2VudCA9IGV4cGVjdGVkUHVsbHMgPiAwID8gMTAwIC8gZXhwZWN0ZWRQdWxscyA6IDA7XG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGF2YWlsYWJpbGl0eTogXCJ1bmF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgICAgIGV4cGVjdGVkUHVsbHMsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGF2YWlsYWJpbGl0eTogXCJkaXJlY3RcIixcbiAgICAgICAgY2hhbmNlUGVyY2VudCxcbiAgICAgICAgY3VycmVuY3k6IHNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwiLFxuICAgICAgICBleHBlY3RlZFB1bGxzLFxuICAgICAgICBleHBlY3RlZFNwZW5kOiBleHBlY3RlZFB1bGxzICogc291cmNlLnByaWNlLFxuICAgICAgICBwcmljZVBlclB1bGw6IHNvdXJjZS5wcmljZSxcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgR3VhcmRpYW5JdGVtU291cmNlIGV4dGVuZHMgSXRlbVNvdXJjZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IGd1YXJkaWFuX21hcDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBpdGVtczogSXRlbVtdLFxuICAgICAgICByZWFkb25seSB4cDogbnVtYmVyLFxuICAgICAgICByZWFkb25seSBuZWVkX2Jvc3M6IGJvb2xlYW4sXG4gICAgICAgIHJlYWRvbmx5IGJvc3NfdGltZTogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyKEd1YXJkaWFuSXRlbVNvdXJjZS5ndWFyZGlhbl9tYXBfaWQoZ3VhcmRpYW5fbWFwKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGd1YXJkaWFuX21hcF9pZChtYXA6IHN0cmluZykge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmd1YXJkaWFuX21hcHMuaW5kZXhPZihtYXApO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuZ3VhcmRpYW5fbWFwcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmd1YXJkaWFuX21hcHMucHVzaChtYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtaW5kZXg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ3VhcmRpYW5fbWFwcyA9IFtcIlwiXTtcbn1cblxuZXhwb3J0IGNsYXNzIEl0ZW0ge1xuICAgIGlkID0gMDtcbiAgICBuYW1lX2tyID0gXCJcIjtcbiAgICBuYW1lX2VuID0gXCJcIjtcbiAgICB1c2VUeXBlID0gXCJcIjtcbiAgICBtYXhVc2UgPSAwO1xuICAgIGhpZGRlbiA9IGZhbHNlO1xuICAgIHJlc2lzdCA9IFwiXCI7XG4gICAgY2hhcmFjdGVyPzogQ2hhcmFjdGVyO1xuICAgIHBhcnQ6IFBhcnQgPSBcIk90aGVyXCI7XG4gICAgbGV2ZWwgPSAwO1xuICAgIHN0ciA9IDA7XG4gICAgc3RhID0gMDtcbiAgICBkZXggPSAwO1xuICAgIHdpbCA9IDA7XG4gICAgaHAgPSAwO1xuICAgIHF1aWNrc2xvdHMgPSAwO1xuICAgIGJ1ZmZzbG90cyA9IDA7XG4gICAgc21hc2ggPSAwO1xuICAgIG1vdmVtZW50ID0gMDtcbiAgICBjaGFyZ2UgPSAwO1xuICAgIGxvYiA9IDA7XG4gICAgc2VydmUgPSAwO1xuICAgIG1heF9zdHIgPSAwO1xuICAgIG1heF9zdGEgPSAwO1xuICAgIG1heF9kZXggPSAwO1xuICAgIG1heF93aWwgPSAwO1xuICAgIGVsZW1lbnRfZW5jaGFudGFibGUgPSBmYWxzZTtcbiAgICBwYXJjZWxfZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNwaW4gPSAwO1xuICAgIGF0c3MgPSAwO1xuICAgIGRmc3MgPSAwO1xuICAgIHNvY2tldCA9IDA7XG4gICAgZ2F1Z2UgPSAwO1xuICAgIGdhdWdlX2JhdHRsZSA9IDA7XG4gICAgc291cmNlczogSXRlbVNvdXJjZVtdID0gW107XG4gICAgc3RhdEZyb21TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiTW92IFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW92ZW1lbnQ7XG4gICAgICAgICAgICBjYXNlIFwiQ2hhcmdlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhcmdlO1xuICAgICAgICAgICAgY2FzZSBcIkxvYlwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYjtcbiAgICAgICAgICAgIGNhc2UgXCJTbWFzaFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNtYXNoO1xuICAgICAgICAgICAgY2FzZSBcIlN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cjtcbiAgICAgICAgICAgIGNhc2UgXCJEZXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXg7XG4gICAgICAgICAgICBjYXNlIFwiU3RhXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhO1xuICAgICAgICAgICAgY2FzZSBcIldpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53aWw7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0clwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdHI7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IERleFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9kZXg7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFN0YVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heF9zdGE7XG4gICAgICAgICAgICBjYXNlIFwiTWF4IFdpbGxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhfd2lsO1xuICAgICAgICAgICAgY2FzZSBcIlNlcnZlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VydmU7XG4gICAgICAgICAgICBjYXNlIFwiUXVpY2tzbG90c1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1aWNrc2xvdHM7XG4gICAgICAgICAgICBjYXNlIFwiQnVmZnNsb3RzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZnNsb3RzO1xuICAgICAgICAgICAgY2FzZSBcIkhQXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgR2FjaGEge1xuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNob3BfaW5kZXg6IG51bWJlciwgcmVhZG9ubHkgZ2FjaGFfaW5kZXg6IG51bWJlciwgcmVhZG9ubHkgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIGNoYXJhY3RlcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvcF9pdGVtcy5zZXQoY2hhcmFjdGVyLCBuZXcgTWFwPEl0ZW0sIFsvKnByb2JhYmlsaXR5OiovIG51bWJlciwgLypxdWFudGl0eV9taW46Ki8gbnVtYmVyLCAvKnF1YW50aXR5X21heDoqLyBudW1iZXJdPigpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkKGl0ZW06IEl0ZW0sIHByb2JhYmlsaXR5OiBudW1iZXIsIGNoYXJhY3RlcjogQ2hhcmFjdGVyLCBxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGl0ZW0uY2hhcmFjdGVyICYmIGl0ZW0uY2hhcmFjdGVyICE9PSBjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKGBJdGVtICR7aXRlbS5pZH0gZnJvbSBnYWNoYSBcIiR7dGhpcy5uYW1lfVwiICR7dGhpcy5nYWNoYV9pbmRleH0gaGFzIHdyb25nIGNoYXJhY3RlcmApO1xuICAgICAgICAgICAgY2hhcmFjdGVyID0gaXRlbS5jaGFyYWN0ZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaG9wX2l0ZW1zLmdldChjaGFyYWN0ZXIpIS5zZXQoaXRlbSwgW3Byb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5zZXQoY2hhcmFjdGVyLCBwcm9iYWJpbGl0eSArICh0aGlzLmNoYXJhY3Rlcl9wcm9iYWJpbGl0eS5nZXQoY2hhcmFjdGVyKSB8fCAwKSk7XG4gICAgfVxuXG4gICAgYXZlcmFnZV90cmllcyhpdGVtOiBJdGVtLCBjaGFyYWN0ZXI6IENoYXJhY3RlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBjaGFyczogcmVhZG9ubHkgQ2hhcmFjdGVyW10gPSBjaGFyYWN0ZXIgPyAoW2NoYXJhY3Rlcl0pIDogY2hhcmFjdGVycztcbiAgICAgICAgY29uc3QgcHJvYmFiaWxpdHkgPSBjaGFycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArICh0aGlzLnNob3BfaXRlbXMuZ2V0KGNoYXJhY3RlcikhLmdldChpdGVtKT8uWzBdIHx8IDApLCAwKTtcbiAgICAgICAgaWYgKHByb2JhYmlsaXR5ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b3RhbF9wcm9iYWJpbGl0eSA9IGNoYXJzLnJlZHVjZSgocCwgY2hhcmFjdGVyKSA9PiBwICsgdGhpcy5jaGFyYWN0ZXJfcHJvYmFiaWxpdHkuZ2V0KGNoYXJhY3RlcikhLCAwKTtcbiAgICAgICAgcmV0dXJuIHRvdGFsX3Byb2JhYmlsaXR5IC8gcHJvYmFiaWxpdHk7XG4gICAgfVxuXG4gICAgZ2V0IHRvdGFsX3Byb2JhYmlsaXR5KCkge1xuICAgICAgICByZXR1cm4gY2hhcmFjdGVycy5yZWR1Y2UoKHAsIGNoYXJhY3RlcikgPT4gcCArIHRoaXMuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChjaGFyYWN0ZXIpISwgMCk7XG4gICAgfVxuXG4gICAgY2hhcmFjdGVyX3Byb2JhYmlsaXR5ID0gbmV3IE1hcDxDaGFyYWN0ZXIsIG51bWJlcj4oKTtcbiAgICBzaG9wX2l0ZW1zID0gbmV3IE1hcDxDaGFyYWN0ZXIsIE1hcDxJdGVtLCBbLypwcm9iYWJpbGl0eToqLyBudW1iZXIsIC8qcXVhbnRpdHlfbWluOiovIG51bWJlciwgLypxdWFudGl0eV9tYXg6Ki8gbnVtYmVyXT4+KCk7XG59XG5cbmV4cG9ydCBsZXQgaXRlbXMgPSBuZXcgTWFwPG51bWJlciwgSXRlbT4oKTtcbmV4cG9ydCBsZXQgc2hvcF9pdGVtcyA9IG5ldyBNYXA8bnVtYmVyLCBJdGVtPigpO1xubGV0IGdhY2hhcyA9IG5ldyBNYXA8bnVtYmVyLCBHYWNoYT4oKTtcbmxldCBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgdW5kZWZpbmVkO1xudHlwZSBJdGVtQXJ0RW50cnkgPSBbc2hlZXQ6IHN0cmluZywgY2VsbDogbnVtYmVyXTtcbnR5cGUgSXRlbUFydFNoZWV0ID0ge1xuICAgIGxpbmVDb3VudDogbnVtYmVyO1xuICAgIHNpemU6IG51bWJlcjtcbiAgICBzcGFjZTogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG59O1xudHlwZSBMb3R0ZXJ5QXJ0RW50cnkgPSB7XG4gICAgc2hlZXQ6IHN0cmluZztcbiAgICBjZWxsOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBzaGFwZTogXCJjb2luXCIgfCBcImN1YmVcIiB8IFwidG9rZW5cIjtcbn07XG50eXBlIEl0ZW1BcnRNYXAgPSB7XG4gICAgaXRlbXM6IFJlY29yZDxzdHJpbmcsIEl0ZW1BcnRFbnRyeT47XG4gICAgbG90dGVyaWVzOiBSZWNvcmQ8c3RyaW5nLCBMb3R0ZXJ5QXJ0RW50cnk+O1xuICAgIHNoZWV0czogUmVjb3JkPHN0cmluZywgSXRlbUFydFNoZWV0Pjtcbn07XG5sZXQgaXRlbUFydE1hcDogSXRlbUFydE1hcCA9IHsgaXRlbXM6IHt9LCBsb3R0ZXJpZXM6IHt9LCBzaGVldHM6IHt9IH07XG5cbmZ1bmN0aW9uIHByZXR0eU51bWJlcihuOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyKSB7XG4gICAgbGV0IHMgPSBuLnRvRml4ZWQoZGlnaXRzKTtcbiAgICB3aGlsZSAocy5lbmRzV2l0aChcIjBcIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICBpZiAocy5lbmRzV2l0aChcIi5cIikpIHtcbiAgICAgICAgcyA9IHMuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbn1cblxuZnVuY3Rpb24gcGFyc2VJdGVtRGF0YShkYXRhOiBzdHJpbmcpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPCAxMDAwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgSXRlbXMgZmlsZSBpcyBvbmx5ICR7ZGF0YS5sZW5ndGh9IGJ5dGVzIGxvbmdgKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCByZXN1bHRdIG9mIGRhdGEubWF0Y2hBbGwoL1xcPEl0ZW0gKC4qKVxcL1xcPi9nKSkge1xuICAgICAgICBjb25zdCBpdGVtOiBJdGVtID0gbmV3IEl0ZW07XG4gICAgICAgIGZvciAoY29uc3QgWywgYXR0cmlidXRlLCB2YWx1ZV0gb2YgcmVzdWx0Lm1hdGNoQWxsKC9cXHM/KFtePV0qKT1cIihbXlwiXSopXCIvZykpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkluZGV4XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaWQgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJfTmFtZV9cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2tyID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJOYW1lX05cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJVc2VUeXBlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udXNlVHlwZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTWF4VXNlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4VXNlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiSGlkZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhpZGRlbiA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmVzaXN0XCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVzaXN0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDaGFyXCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJOSUtJXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5jaGFyYWN0ZXIgPSBcIk5pa2lcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMVU5MVU5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiTHVuTHVuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFVDWVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJMdWN5XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU0hVQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJTaHVhXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiREhBTlBJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJEaGFucGlyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUE9DSElcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNoYXJhY3RlciA9IFwiUG9jaGlcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBTFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmFjdGVyID0gXCJBbFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEZvdW5kIHVua25vd24gY2hhcmFjdGVyIFwiJHt2YWx1ZX1cImApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJQYXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJBR1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiQmFja3BhY2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJHTEFTU0VTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJGYWNlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFORFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNPQ0tTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJTb2Nrc1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkZPT1RcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlNob2VzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQ0FQXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0ID0gXCJIYXRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJQQU5UU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiTG93ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJSQUNLRVRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlJhY2tldFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkJPRFlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnQgPSBcIlVwcGVyXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSEFJUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiSGFpclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkRZRVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydCA9IFwiRHllXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRm91bmQgdW5rbm93biBwYXJ0ICR7dmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkxldmVsXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGV2ZWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVFJcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHIgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTVEFcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdGEgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kZXggPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJXSUxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS53aWwgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJBZGRIUFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmhwID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkUXVpY2tcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5xdWlja3Nsb3RzID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQWRkQnVmZlwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmJ1ZmZzbG90cyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNtYXNoU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zbWFzaCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1vdmVTcGVlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1vdmVtZW50ID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ2hhcmdlc2hvdFNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2hhcmdlID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTG9iU3BlZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sb2IgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJTZXJ2ZVNwZWVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc2VydmUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfU1RSXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3N0ciA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS5zdHIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiTUFYX1NUQVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1heF9zdGEgPSBNYXRoLm1heChwYXJzZUludCh2YWx1ZSksIGl0ZW0uc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1BWF9ERVhcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5tYXhfZGV4ID0gTWF0aC5tYXgocGFyc2VJbnQodmFsdWUpLCBpdGVtLmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNQVhfV0lMXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubWF4X3dpbCA9IE1hdGgubWF4KHBhcnNlSW50KHZhbHVlKSwgaXRlbS53aWwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRW5jaGFudEVsZW1lbnRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50X2VuY2hhbnRhYmxlID0gISFwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFbmFibGVQYXJjZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJjZWxfZW5hYmxlZCA9ICEhcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQmFsbFNwaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zcGluID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiQVRTU1wiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmF0c3MgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJERlNTXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGZzcyA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlNvY2tldFwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvY2tldCA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkdhdWdlXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2F1Z2UgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJHYXVnZUJhdHRsZVwiOlxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdhdWdlX2JhdHRsZSA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGl0ZW0gYXR0cmlidXRlIFwiJHthdHRyaWJ1dGV9XCJgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpdGVtcy5zZXQoaXRlbS5pZCwgaXRlbSk7XG4gICAgfVxufVxuXG5jbGFzcyBBcGlJdGVtIHtcbiAgICBwcm9kdWN0SW5kZXggPSAwO1xuICAgIGRpc3BsYXkgPSAwO1xuICAgIGhpdERpc3BsYXkgPSBmYWxzZTtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgdXNlVHlwZSA9IFwiXCI7XG4gICAgdXNlMCA9IDA7XG4gICAgdXNlMSA9IDA7XG4gICAgdXNlMiA9IDA7XG4gICAgcHJpY2VUeXBlID0gXCJHT0xEXCI7XG4gICAgb2xkUHJpY2UwID0gMDtcbiAgICBvbGRQcmljZTEgPSAwO1xuICAgIG9sZFByaWNlMiA9IDA7XG4gICAgcHJpY2UwID0gMDtcbiAgICBwcmljZTEgPSAwO1xuICAgIHByaWNlMiA9IDA7XG4gICAgY291cGxlUHJpY2UgPSAwO1xuICAgIGNhdGVnb3J5ID0gXCJcIjtcbiAgICBuYW1lID0gXCJcIjtcbiAgICBnb2xkQmFjayA9IDA7XG4gICAgZW5hYmxlUGFyY2VsID0gZmFsc2U7XG4gICAgZm9yUGxheWVyID0gMDtcbiAgICBpdGVtMCA9IDA7XG4gICAgaXRlbTEgPSAwO1xuICAgIGl0ZW0yID0gMDtcbiAgICBpdGVtMyA9IDA7XG4gICAgaXRlbTQgPSAwO1xuICAgIGl0ZW01ID0gMDtcbiAgICBpdGVtNiA9IDA7XG4gICAgaXRlbTcgPSAwO1xuICAgIGl0ZW04ID0gMDtcbiAgICBpdGVtOSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzQXBpSXRlbShvYmo6IGFueSk6IG9iaiBpcyBBcGlJdGVtIHtcbiAgICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlb2Ygb2JqLnByb2R1Y3RJbmRleCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5kaXNwbGF5ID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmhpdERpc3BsYXkgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmVuYWJsZWQgPT09IFwiYm9vbGVhblwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZVR5cGUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmoudXNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai51c2UxID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnVzZTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2VUeXBlID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm9sZFByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5vbGRQcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoub2xkUHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLnByaWNlMCA9PT0gXCJudW1iZXJcIixcbiAgICAgICAgdHlwZW9mIG9iai5wcmljZTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmoucHJpY2UyID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNvdXBsZVByaWNlID09PSBcIm51bWJlclwiLFxuICAgICAgICB0eXBlb2Ygb2JqLmNhdGVnb3J5ID09PSBcInN0cmluZ1wiLFxuICAgICAgICB0eXBlb2Ygb2JqLm5hbWUgPT09IFwic3RyaW5nXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZ29sZEJhY2sgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouZW5hYmxlUGFyY2VsID09PSBcImJvb2xlYW5cIixcbiAgICAgICAgdHlwZW9mIG9iai5mb3JQbGF5ZXIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTAgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTEgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTIgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTMgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTQgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTUgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTYgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTcgPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTggPT09IFwibnVtYmVyXCIsXG4gICAgICAgIHR5cGVvZiBvYmouaXRlbTkgPT09IFwibnVtYmVyXCJcbiAgICBdLmV2ZXJ5KGIgPT4gYik7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXBpU2hvcERhdGEoZGF0YTogc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBhcGlJdGVtIG9mIEpTT04ucGFyc2UoZGF0YSkpIHtcbiAgICAgICAgaWYgKCFpc0FwaUl0ZW0oYXBpSXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEluY29ycmVjdCBmb3JtYXQgb2YgaXRlbTogJHtkYXRhfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lcl9pdGVtcyA9IFtcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTAsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW0xLFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtMixcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTMsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW00LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtNSxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTYsXG4gICAgICAgICAgICBhcGlJdGVtLml0ZW03LFxuICAgICAgICAgICAgYXBpSXRlbS5pdGVtOCxcbiAgICAgICAgICAgIGFwaUl0ZW0uaXRlbTksXG4gICAgICAgIF0uZmlsdGVyKGlkID0+ICEhaWQgJiYgaXRlbXMuZ2V0KGlkKSkubWFwKGlkID0+IGl0ZW1zLmdldChpZCkhKTtcblxuICAgICAgICBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJQQVJUU1wiKSB7XG4gICAgICAgICAgICBpZiAoaW5uZXJfaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2hvcF9pdGVtcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIGlubmVyX2l0ZW1zWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgICAgIGl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXBpSXRlbS5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVNvdXJjZSA9IG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbm5lcl9pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChpdGVtU291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXBpSXRlbS5jYXRlZ29yeSA9PT0gXCJMT1RURVJZXCIpIHtcbiAgICAgICAgICAgIGdhY2hhcy5zZXQoYXBpSXRlbS5wcm9kdWN0SW5kZXgsIG5ldyBHYWNoYShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5pdGVtMCwgYXBpSXRlbS5uYW1lKSk7XG4gICAgICAgICAgICBjb25zdCBnYWNoYUl0ZW0gPSBuZXcgSXRlbSgpO1xuICAgICAgICAgICAgZ2FjaGFJdGVtLm5hbWVfZW4gPSBhcGlJdGVtLm5hbWU7XG4gICAgICAgICAgICBzaG9wX2l0ZW1zLnNldChhcGlJdGVtLnByb2R1Y3RJbmRleCwgZ2FjaGFJdGVtKTtcbiAgICAgICAgICAgIGlmIChhcGlJdGVtLmVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBnYWNoYUl0ZW0uc291cmNlcy5wdXNoKG5ldyBTaG9wSXRlbVNvdXJjZShhcGlJdGVtLnByb2R1Y3RJbmRleCwgYXBpSXRlbS5wcmljZTAsIGFwaUl0ZW0ucHJpY2VUeXBlID09PSBcIk1JTlRcIiwgaW5uZXJfaXRlbXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVySXRlbSA9IG5ldyBJdGVtKCk7XG4gICAgICAgICAgICBvdGhlckl0ZW0ubmFtZV9lbiA9IGFwaUl0ZW0ubmFtZTtcbiAgICAgICAgICAgIHNob3BfaXRlbXMuc2V0KGFwaUl0ZW0ucHJvZHVjdEluZGV4LCBvdGhlckl0ZW0pO1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR2FjaGFEYXRhKGRhdGE6IHN0cmluZywgZ2FjaGE6IEdhY2hhKSB7XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGRhdGEuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgaWYgKCFsaW5lLmluY2x1ZGVzKFwiPExvdHRlcnlJdGVtX1wiKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9cXHMqPExvdHRlcnlJdGVtXyg/PGNoYXJhY3Rlcj5bXiBdKikgSW5kZXg9XCJcXGQrXCIgX05hbWVfPVwiW15cIl0qXCIgU2hvcEluZGV4PVwiKD88c2hvcF9pZD5cXGQrKVwiIFF1YW50aXR5TWluPVwiKD88cXVhbnRpdHlfbWluPlxcZCspXCIgUXVhbnRpdHlNYXg9XCIoPzxxdWFudGl0eV9tYXg+XFxkKylcIiBDaGFuc1Blcj1cIig/PHByb2JhYmlsaXR5PlxcZCtcXC4/XFxkKilcXHMqXCIgRWZmZWN0PVwiXFxkK1wiIFByb2R1Y3RPcHQ9XCJcXGQrXCJcXC8+Lyk7XG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHBhcnNpbmcgZ2FjaGEgJHtnYWNoYS5nYWNoYV9pbmRleH06XFxuJHtsaW5lfWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjaGFyYWN0ZXIgPSBtYXRjaC5ncm91cHMuY2hhcmFjdGVyO1xuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBcIkx1bmx1blwiKSB7XG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBcIkx1bkx1blwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNDaGFyYWN0ZXIoY2hhcmFjdGVyKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIGNoYXJhY3RlciBcIiR7Y2hhcmFjdGVyfVwiIGluIGxvdHRlcnkgZmlsZSAke2dhY2hhLmdhY2hhX2luZGV4fWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbSA9IHNob3BfaXRlbXMuZ2V0KHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5zaG9wX2lkKSk7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBGb3VuZCB1bmtub3duIHNob3AgaXRlbSBpZCAke21hdGNoLmdyb3Vwcy5zaG9wX2lkfSBpbiBsb3R0ZXJ5IGZpbGUgJHtnYWNoYS5nYWNoYV9pbmRleH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGdhY2hhLmFkZChpdGVtLCBwYXJzZUZsb2F0KG1hdGNoLmdyb3Vwcy5wcm9iYWJpbGl0eSksIGNoYXJhY3RlciwgcGFyc2VJbnQobWF0Y2guZ3JvdXBzLnF1YW50aXR5X21pbiksIHBhcnNlSW50KG1hdGNoLmdyb3Vwcy5xdWFudGl0eV9tYXgpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbLCBtYXBdIG9mIGdhY2hhLnNob3BfaXRlbXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaXRlbSxdIG9mIG1hcCkge1xuICAgICAgICAgICAgaXRlbS5zb3VyY2VzLnB1c2gobmV3IEdhY2hhSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlR3VhcmRpYW5EYXRhKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IGd1YXJkaWFuRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGd1YXJkaWFuRGF0YSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROdW1iZXIobzogYW55KSB7XG4gICAgICAgIGlmICh0eXBlb2YgbyA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYm9zc1RpbWVJbmZvID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBmb3IgKGNvbnN0IG1hcEluZm8gb2YgZ3VhcmRpYW5EYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwSW5mbyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFwX25hbWUgPSBtYXBJbmZvLk5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgbWFwX25hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJld2FyZHMgPSBBcnJheS5pc0FycmF5KG1hcEluZm8uUmV3YXJkcykgPyBbLi4ubWFwSW5mby5SZXdhcmRzXSA6IFtdO1xuICAgICAgICBjb25zdCByZXdhcmRfaXRlbXMgPSByZXdhcmRzXG4gICAgICAgICAgICAuZmlsdGVyKChzaG9wX2lkKTogc2hvcF9pZCBpcyBudW1iZXIgPT4gdHlwZW9mIHNob3BfaWQgPT09IFwibnVtYmVyXCIgJiYgc2hvcF9pdGVtcy5oYXMoc2hvcF9pZCkpXG4gICAgICAgICAgICAubWFwKHNob3BfaWQgPT4gc2hvcF9pdGVtcy5nZXQoc2hvcF9pZCkhKTtcbiAgICAgICAgY29uc3QgRXhwTXVsdGlwbGllciA9IGdldE51bWJlcihtYXBJbmZvLkV4cE11bHRpcGxpZXIpIHx8IDA7XG4gICAgICAgIGNvbnN0IElzQm9zc1N0YWdlID0gISFtYXBJbmZvLklzQm9zc1N0YWdlO1xuICAgICAgICBjb25zdCBNYXBJRCA9IGdldE51bWJlcihtYXBJbmZvLk1hcElkKSB8fCAwO1xuICAgICAgICBsZXQgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9IGdldE51bWJlcihtYXBJbmZvLkJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpIHx8IC0xO1xuICAgICAgICBpZiAoQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyA9PT0gLTEpIHtcbiAgICAgICAgICAgIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMgPSBib3NzVGltZUluZm8uZ2V0KE1hcElEKSB8fCAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXBJRCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGJvc3NUaW1lSW5mby5zZXQoTWFwSUQsIEJvc3NUcmlnZ2VyVGltZXJJblNlY29uZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiByZXdhcmRfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGd1YXJkaWFuU291cmNlID0gbmV3IEd1YXJkaWFuSXRlbVNvdXJjZShtYXBfbmFtZSwgcmV3YXJkX2l0ZW1zLCBFeHBNdWx0aXBsaWVyLCBJc0Jvc3NTdGFnZSwgQm9zc1RyaWdnZXJUaW1lckluU2Vjb25kcyk7XG4gICAgICAgICAgICBpdGVtLnNvdXJjZXMucHVzaChndWFyZGlhblNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSB1cmwuc2xpY2UodXJsLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gYExvYWRpbmcgJHtmaWxlbmFtZX0sIHBsZWFzZSB3YWl0Li4uYDtcbiAgICB9XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgIGNvbnN0IHByb2dyZXNzYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmVzc2JhclwiKTtcbiAgICBpZiAocHJvZ3Jlc3NiYXIgaW5zdGFuY2VvZiBIVE1MUHJvZ3Jlc3NFbGVtZW50KSB7XG4gICAgICAgIHByb2dyZXNzYmFyLnZhbHVlKys7XG4gICAgfVxuICAgIGlmICghcmVwbHkub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCBkb3dubG9hZGluZyAke3VybH06ICR7cmVwbHkuc3RhdHVzfSR7cmVwbHkuc3RhdHVzVGV4dCA/IGAgJHtyZXBseS5zdGF0dXNUZXh0fWAgOiBcIlwifWBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcGx5LnRleHQoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkSXRlbXMoKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyZXNzYmFyXCIpO1xuICAgIGlmIChwcm9ncmVzc2JhciBpbnN0YW5jZW9mIEhUTUxQcm9ncmVzc0VsZW1lbnQpIHtcbiAgICAgICAgcHJvZ3Jlc3NiYXIudmFsdWUgPSAwO1xuICAgICAgICBwcm9ncmVzc2Jhci5tYXggPSAxMjM7XG4gICAgfVxuICAgIGNvbnN0IGl0ZW1Tb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9hdXRoLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzXCI7XG4gICAgY29uc3QgZ2FjaGFTb3VyY2UgPSBcImh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zc3Rva2ljLXRnbS9KRlRTRS9kZXZlbG9wbWVudC9nYW1lLXNlcnZlci9zcmMvbWFpbi9yZXNvdXJjZXMvcmVzL2xvdHRlcnlcIjtcbiAgICBjb25zdCBndWFyZGlhblNvdXJjZSA9IFwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3NzdG9raWMtdGdtL0pGVFNFL2RldmVsb3BtZW50L3NlcnZlci1jb3JlL3NyYy9tYWluL3Jlc291cmNlcy9yZXNcIjtcbiAgICBjb25zdCBpdGVtVVJMID0gaXRlbVNvdXJjZSArIFwiL0l0ZW1fUGFydHNfSW5pMy54bWxcIjtcbiAgICBjb25zdCBpdGVtRGF0YSA9IGRvd25sb2FkKGl0ZW1VUkwpO1xuICAgIGNvbnN0IGl0ZW1BcnREYXRhID0gZG93bmxvYWQoXCIvYXNzZXRzL2l0ZW0tYXJ0LW1hcC5qc29uXCIpO1xuICAgIGNvbnN0IG1heF9zaG9wX3BhZ2VzID0gMjA7IC8vY3VycmVudGx5IG5lZWQgb25seSAxMCwgc2hvdWxkIGJlIGVub3VnaFxuICAgIGNvbnN0IHNob3BVUkwgPSBcIi9hcGkvc2hvcD9zaXplPTEwMDAmcGFnZT1cIjtcbiAgICBjb25zdCBzaG9wRGF0YXMgPSBbLi4uQXJyYXkobWF4X3Nob3BfcGFnZXMpLmtleXMoKV0ubWFwKG4gPT4gZG93bmxvYWQoYCR7c2hvcFVSTH0ke259YCkpO1xuICAgIGNvbnN0IGd1YXJkaWFuVVJMID0gZ3VhcmRpYW5Tb3VyY2UgKyBcIi9HdWFyZGlhblN0YWdlcy5qc29uXCI7XG4gICAgY29uc3QgZ3VhcmRpYW5EYXRhID0gZG93bmxvYWQoZ3VhcmRpYW5VUkwpO1xuICAgIHBhcnNlSXRlbURhdGEoYXdhaXQgaXRlbURhdGEpO1xuICAgIGl0ZW1BcnRNYXAgPSBKU09OLnBhcnNlKGF3YWl0IGl0ZW1BcnREYXRhKSBhcyBJdGVtQXJ0TWFwO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKHNob3BEYXRhcy5tYXAocCA9PiBwLnRoZW4oZGF0YSA9PiBwYXJzZUFwaVNob3BEYXRhKGRhdGEpKSkpO1xuXG4gICAgaWYgKHByb2dyZXNzYmFyIGluc3RhbmNlb2YgSFRNTFByb2dyZXNzRWxlbWVudCkge1xuICAgICAgICBwcm9ncmVzc2Jhci52YWx1ZSA9IDA7XG4gICAgICAgIHByb2dyZXNzYmFyLm1heCA9IGdhY2hhcy5zaXplICsgMztcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFfaXRlbXM6IFtQcm9taXNlPHN0cmluZz4sIEdhY2hhLCBzdHJpbmddW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFfdXJsID0gYCR7Z2FjaGFTb3VyY2V9L0luaTNfTG90XyR7YCR7Z2FjaGEuZ2FjaGFfaW5kZXh9YC5wYWRTdGFydCgyLCBcIjBcIil9LnhtbGA7XG4gICAgICAgIGdhY2hhX2l0ZW1zLnB1c2goW2Rvd25sb2FkKGdhY2hhX3VybCksIGdhY2hhLCBnYWNoYV91cmxdKTtcbiAgICB9XG4gICAgcGFyc2VHdWFyZGlhbkRhdGEoYXdhaXQgZ3VhcmRpYW5EYXRhKTtcbiAgICBmb3IgKGNvbnN0IFtpdGVtLCBnYWNoYSwgZ2FjaGFfdXJsXSBvZiBnYWNoYV9pdGVtcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyc2VHYWNoYURhdGEoYXdhaXQgaXRlbSwgZ2FjaGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCBkb3dubG9hZGluZyAke2dhY2hhX3VybH0gYmVjYXVzZSAke2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlbGV0YWJsZUl0ZW0oaXRlbTogSXRlbSwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzOiBcIml0ZW0taWRlbnRpdHlcIiB9LFxuICAgICAgICBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsXCIsXG4gICAgICAgICAgICAgICAgXCJkYXRhLWl0ZW1faW5kZXhcIjogYCR7aXRlbS5pZH1gLFxuICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgRXhjbHVkZSAke2l0ZW0ubmFtZV9lbn0gZnJvbSByZXN1bHRzYCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiRXhjbHVkZVwiLFxuICAgICAgICBdKSxcbiAgICAgICAgY3JlYXRlSXRlbURldGFpbHNUcmlnZ2VyKGl0ZW0sIGNoYXJhY3RlciksXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIHNob3dEaWFsb2coXG4gICAgdHJpZ2dlcjogSFRNTEJ1dHRvbkVsZW1lbnQsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjb250ZW50OiBIVE1MRWxlbWVudCB8IHN0cmluZyB8IChIVE1MRWxlbWVudCB8IHN0cmluZylbXSxcbiAgICBkaWFsb2dDbGFzcz86IHN0cmluZyxcbikge1xuICAgIGNvbnN0IHRvcERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wX2RpdlwiKTtcbiAgICBpZiAoISh0b3BEaXYgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGlhbG9nKSB7XG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICBkaWFsb2cucmVtb3ZlKCk7XG4gICAgfVxuICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gY3JlYXRlSFRNTChbXG4gICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBkaWFsb2dDbGFzcyA/IGAke2RpYWxvZ0NsYXNzfV9fY2xvc2VgIDogXCJkaWFsb2dfX2Nsb3NlXCIsXG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICB9LFxuICAgICAgICBcIkNsb3NlXCIsXG4gICAgXSk7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHtcbiAgICAgICAgLi4uKGRpYWxvZ0NsYXNzID8geyBjbGFzczogZGlhbG9nQ2xhc3MgfSA6IHt9KSxcbiAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGxhYmVsLFxuICAgIH07XG4gICAgZGlhbG9nID0gQXJyYXkuaXNBcnJheShjb250ZW50KVxuICAgICAgICA/IGNyZWF0ZUhUTUwoW1wiZGlhbG9nXCIsIGF0dHJpYnV0ZXMsIC4uLmNvbnRlbnQsIGNsb3NlQnV0dG9uXSlcbiAgICAgICAgOiBjcmVhdGVIVE1MKFtcImRpYWxvZ1wiLCBhdHRyaWJ1dGVzLCBjb250ZW50LCBjbG9zZUJ1dHRvbl0pO1xuICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcInRydWVcIik7XG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGRpYWxvZz8uY2xvc2UoKSk7XG4gICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBcImZhbHNlXCIpO1xuICAgICAgICBkaWFsb2c/LnJlbW92ZSgpO1xuICAgICAgICBkaWFsb2cgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRyaWdnZXIuZm9jdXMoKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgdG9wRGl2LmFwcGVuZENoaWxkKGRpYWxvZyk7XG4gICAgZGlhbG9nLnNob3dNb2RhbCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9wdXBMaW5rKHRleHQ6IHN0cmluZywgY29udGVudDogSFRNTEVsZW1lbnQgfCBzdHJpbmcgfCAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10pIHtcbiAgICBjb25zdCBidXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwicG9wdXBfbGlua1wiLFxuICAgICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICAgIFwiYXJpYS1oYXNwb3B1cFwiOiBcImRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dCxcbiAgICBdKTtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd0RpYWxvZyhidXR0b24sIGAke3RleHR9IGRldGFpbHNgLCBjb250ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW46IG51bWJlciwgcXVhbnRpdHlfbWF4OiBudW1iZXIpIHtcbiAgICBpZiAocXVhbnRpdHlfbWluID09PSAxICYmIHF1YW50aXR5X21heCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgaWYgKHF1YW50aXR5X21pbiA9PT0gcXVhbnRpdHlfbWF4KSB7XG4gICAgICAgIHJldHVybiBgIHggJHtxdWFudGl0eV9tYXh9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAgeCAke3F1YW50aXR5X21pbn0tJHtxdWFudGl0eV9tYXh9YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFTb3VyY2VQb3B1cChpdGVtOiBJdGVtIHwgdW5kZWZpbmVkLCBpdGVtU291cmNlOiBJdGVtU291cmNlLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBjb250ZW50ID0gY2hhcmFjdGVyID8gY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFuY2VcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkV4cGVjdGVkIHB1bGxzXCJdLFxuICAgICAgICBdLFxuICAgIF0pIDogY3JlYXRlSFRNTChbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgW1xuICAgICAgICAgICAgXCJ0clwiLFxuICAgICAgICAgICAgW1widGhcIiwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgW1widGhcIiwgXCJDaGFyYWN0ZXJcIl0sXG4gICAgICAgICAgICBbXCJ0aFwiLCBcIkNoYW5jZVwiXSxcbiAgICAgICAgICAgIFtcInRoXCIsIFwiRXhwZWN0ZWQgcHVsbHNcIl0sXG4gICAgICAgIF0sXG4gICAgXSk7XG4gICAgY29uc3QgZ2FjaGEgPSBnYWNoYXMuZ2V0KGl0ZW1Tb3VyY2Uuc2hvcF9pZCk7XG4gICAgaWYgKCFnYWNoYSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgY29uc3QgZ2FjaGFfaXRlbXMgPSBuZXcgTWFwPEl0ZW0sIFtudW1iZXIsIG51bWJlciwgbnVtYmVyXT4oKTtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgY2hhcmFjdGVyID09PSB1bmRlZmluZWQgPyBjaGFyYWN0ZXJzIDogW2NoYXJhY3Rlcl0pIHtcbiAgICAgICAgY29uc3QgY2hhcl9pdGVtcyA9IGdhY2hhLnNob3BfaXRlbXMuZ2V0KGNoYXIpO1xuICAgICAgICBpZiAoIWNoYXJfaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW2NoYXJfZ2FjaGFfaXRlbSwgW3RpY2tldHMsIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgY2hhcl9pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgaXRlbV9jaGFyYWN0ZXIgPSBjaGFyX2dhY2hhX2l0ZW0uY2hhcmFjdGVyIHx8IGNoYXJhY3RlcjtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1fdGlja2V0cyA9IGl0ZW1fY2hhcmFjdGVyID8gZ2FjaGEuY2hhcmFjdGVyX3Byb2JhYmlsaXR5LmdldChpdGVtX2NoYXJhY3RlcikhIDogZ2FjaGEudG90YWxfcHJvYmFiaWxpdHk7XG4gICAgICAgICAgICBjb25zdCBwcm9iYWJpbGl0eSA9IHRpY2tldHMgLyBpdGVtX3RpY2tldHM7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c19wcm9iYWJpbGl0eSA9IGdhY2hhX2l0ZW1zLmdldChjaGFyX2dhY2hhX2l0ZW0pPy5bMF0gfHwgMDtcbiAgICAgICAgICAgIGdhY2hhX2l0ZW1zLnNldChjaGFyX2dhY2hhX2l0ZW0sIFtwcmV2aW91c19wcm9iYWJpbGl0eSArIHByb2JhYmlsaXR5LCBxdWFudGl0eV9taW4sIHF1YW50aXR5X21heF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbY2hhcl9nYWNoYV9pdGVtLCBbcHJvYmFiaWxpdHksIHF1YW50aXR5X21pbiwgcXVhbnRpdHlfbWF4XV0gb2YgZ2FjaGFfaXRlbXMpIHtcbiAgICAgICAgaWYgKGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgaXRlbSA9PT0gY2hhcl9nYWNoYV9pdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW4sIHF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcihwcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcigxIC8gcHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICAgICAgaXRlbSA9PT0gY2hhcl9nYWNoYV9pdGVtID8geyBjbGFzczogXCJoaWdobGlnaHRlZFwiIH0gOiBcIlwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5uYW1lX2VuLCBxdWFudGl0eVN0cmluZyhxdWFudGl0eV9taW4sIHF1YW50aXR5X21heCldLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIGNoYXJfZ2FjaGFfaXRlbS5jaGFyYWN0ZXIgfHwgXCIqXCJdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcihwcm9iYWJpbGl0eSAqIDEwMCwgMil9JWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiIH0sIGAke3ByZXR0eU51bWJlcigxIC8gcHJvYmFiaWxpdHksIDIpfWBdLFxuICAgICAgICAgICAgXSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBnYWNoYS5uYW1lXSksIGNvbnRlbnRdKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2V0U291cmNlUG9wdXAoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICBjb25zdCBjb250ZW50VGFibGUgPSBjcmVhdGVIVE1MKFtcInRhYmxlXCIsIFtcInRyXCIsIFtcInRoXCIsIFwiQ29udGVudHNcIl1dXSk7XG4gICAgZm9yIChjb25zdCBpbm5lcl9pdGVtIG9mIGl0ZW1Tb3VyY2UuaXRlbXMpIHtcbiAgICAgICAgY29udGVudFRhYmxlLmFwcGVuZENoaWxkKGNyZWF0ZUhUTUwoW1widHJcIiwgaW5uZXJfaXRlbSA9PT0gaXRlbSA/IHsgY2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIiB9IDogXCJcIiwgW1widGRcIiwgaW5uZXJfaXRlbS5uYW1lX2VuXV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVBvcHVwTGluayhpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgW2NyZWF0ZUhUTUwoW1wiYVwiLCBpdGVtU291cmNlLml0ZW0ubmFtZV9lbiwgY29udGVudFRhYmxlXSldKTtcbn1cblxuZnVuY3Rpb24gcHJldHR5VGltZShzZWNvbmRzOiBudW1iZXIpIHtcbiAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihzZWNvbmRzIC8gNjApfToke2Ake3NlY29uZHMgJSA2MH1gLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW06IEl0ZW0sIGl0ZW1Tb3VyY2U6IEd1YXJkaWFuSXRlbVNvdXJjZSkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBbXG4gICAgICAgIGBHdWFyZGlhbiBtYXAgJHtpdGVtU291cmNlLmd1YXJkaWFuX21hcH1gLFxuICAgICAgICBjcmVhdGVIVE1MKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFwidWxcIiwgeyBjbGFzczogXCJsYXlvdXRcIiB9LFxuICAgICAgICAgICAgICAgIFtcImxpXCIsIFwiSXRlbXM6XCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInVsXCIsIHsgY2xhc3M6IFwibGF5b3V0XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLml0ZW1Tb3VyY2UuaXRlbXMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJyLCByZXdhcmRfaXRlbSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy4uLmN1cnIsIGNyZWF0ZUhUTUwoW1wibGlcIiwgeyBjbGFzczogcmV3YXJkX2l0ZW0gPT09IGl0ZW0gPyBcImhpZ2hsaWdodGVkXCIgOiBcIlwiIH0sIHJld2FyZF9pdGVtLm5hbWVfZW5dKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10gYXMgKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYFJlcXVpcmVzIGJvc3M6ICR7aXRlbVNvdXJjZS5uZWVkX2Jvc3MgPyBcIlllc1wiIDogXCJOb1wifWBdLFxuICAgICAgICAgICAgICAgIC4uLihpdGVtU291cmNlLmJvc3NfdGltZSA+IDAgPyBbY3JlYXRlSFRNTChbXCJsaVwiLCBgQm9zcyB0aW1lOiAke3ByZXR0eVRpbWUoaXRlbVNvdXJjZS5ib3NzX3RpbWUpfWBdKV0gOiBbXSksXG4gICAgICAgICAgICAgICAgW1wibGlcIiwgYEVYUCBtdWx0aXBsaWVyOiAke2l0ZW1Tb3VyY2UueHB9YF0sXG4gICAgICAgICAgICBdXG4gICAgICAgIClcbiAgICBdO1xuICAgIHJldHVybiBjcmVhdGVQb3B1cExpbmsoaXRlbVNvdXJjZS5ndWFyZGlhbl9tYXAsIGNvbnRlbnQpO1xufVxuXG5mdW5jdGlvbiBpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KFxuICAgIGl0ZW06IEl0ZW0sXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICByZXR1cm4gWy4uLml0ZW0uc291cmNlcy52YWx1ZXMoKV1cbiAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgIC5tYXAoaXRlbVNvdXJjZSA9PiBzb3VyY2VJdGVtRWxlbWVudChpdGVtLCBpdGVtU291cmNlLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcikpO1xufVxuXG5mdW5jdGlvbiBtYWtlU291cmNlc0xpc3QobGlzdDogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdW10pOiAoSFRNTEVsZW1lbnQgfCBzdHJpbmcpW10ge1xuICAgIGNvbnN0IHJlc3VsdDogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdID0gW107XG4gICAgZnVuY3Rpb24gYWRkKGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSA9IHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gKyBlbGVtZW50O1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKGVsZW1lbnQpO1xuICAgIH1cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgZWxlbWVudHMgb2YgbGlzdCkge1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhZGQoXCIgXCIpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICAgICAgYWRkKFwiLCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHYWNoYVNvdXJjZVN1bW1hcnkoXG4gICAgaXRlbTogSXRlbSxcbiAgICBpdGVtU291cmNlOiBHYWNoYUl0ZW1Tb3VyY2UsXG4gICAgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbixcbiAgICBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIsXG4pIHtcbiAgICBjb25zdCBnYWNoYSA9IGdhY2hhcy5nZXQoaXRlbVNvdXJjZS5zaG9wX2lkKTtcbiAgICBpZiAoIWdhY2hhKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0U291cmNlID0gaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMuZmluZChcbiAgICAgICAgKHNvdXJjZSk6IHNvdXJjZSBpcyBTaG9wSXRlbVNvdXJjZSA9PiBzb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSxcbiAgICApO1xuICAgIGNvbnN0IGFsdGVybmF0aXZlU291cmNlcyA9IGl0ZW1Tb3VyY2VzVG9FbGVtZW50QXJyYXkoXG4gICAgICAgIGl0ZW1Tb3VyY2UuaXRlbSxcbiAgICAgICAgc291cmNlID0+IHNvdXJjZSAhPT0gZGlyZWN0U291cmNlICYmIHNvdXJjZUZpbHRlcihzb3VyY2UpLFxuICAgICAgICBpdGVtU291cmNlLnJlcXVpcmVzR3VhcmRpYW4gPyB1bmRlZmluZWQgOiBjaGFyYWN0ZXIsXG4gICAgKTtcbiAgICBjb25zdCBhbHRlcm5hdGl2ZUxpc3QgPSBtYWtlU291cmNlc0xpc3QoYWx0ZXJuYXRpdmVTb3VyY2VzKTtcblxuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiZ2FjaGEtc291cmNlLXN1bW1hcnlcIixcbiAgICAgICAgICAgIHJvbGU6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgJHtnYWNoYS5uYW1lfSBhY3F1aXNpdGlvbmAsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZUdhY2hhQ29pbkFydChnYWNoYSksXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcImdhY2hhLXNvdXJjZS1zdW1tYXJ5X19jb250ZW50XCIgfSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiZ2FjaGEtaWRlbnRpdHlcIiB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Tb3VyY2UucmVxdWlyZXNHdWFyZGlhbiA/IHVuZGVmaW5lZCA6IGNoYXJhY3RlcixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIC4uLihhbHRlcm5hdGl2ZUxpc3QubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gW2NyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJnYWNoYS1hbHRlcm5hdGl2ZXNcIiB9LFxuICAgICAgICAgICAgICAgIFtcInNwYW5cIiwgeyBjbGFzczogXCJnYWNoYS1hbHRlcm5hdGl2ZXNfX2xhYmVsXCIgfSwgXCJBbHRlcm5hdGl2ZVwiXSxcbiAgICAgICAgICAgICAgICAuLi5hbHRlcm5hdGl2ZUxpc3QsXG4gICAgICAgICAgICBdKV1cbiAgICAgICAgICAgICAgICA6IFtdKSxcbiAgICAgICAgXSxcbiAgICBdKTtcbn1cblxuZnVuY3Rpb24gc291cmNlSXRlbUVsZW1lbnQoaXRlbTogSXRlbSwgaXRlbVNvdXJjZTogSXRlbVNvdXJjZSwgc291cmNlRmlsdGVyOiAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYm9vbGVhbiwgY2hhcmFjdGVyPzogQ2hhcmFjdGVyKTogKEhUTUxFbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBpZiAoaXRlbVNvdXJjZSBpbnN0YW5jZW9mIEdhY2hhSXRlbVNvdXJjZSkge1xuICAgICAgICByZXR1cm4gW2NyZWF0ZUdhY2hhU291cmNlU3VtbWFyeShpdGVtLCBpdGVtU291cmNlLCBzb3VyY2VGaWx0ZXIsIGNoYXJhY3RlcildO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgaWYgKGl0ZW1Tb3VyY2UuaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gW2Ake2l0ZW1Tb3VyY2UucHJpY2V9ICR7aXRlbVNvdXJjZS5hcCA/IFwiQVBcIiA6IFwiR29sZFwifWBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBjcmVhdGVTZXRTb3VyY2VQb3B1cChpdGVtLCBpdGVtU291cmNlKSxcbiAgICAgICAgICAgIGAgJHtpdGVtU291cmNlLnByaWNlfSAke2l0ZW1Tb3VyY2UuYXAgPyBcIkFQXCIgOiBcIkdvbGRcIn1gXG4gICAgICAgIF07XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIFtjcmVhdGVHdWFyZGlhblBvcHVwKGl0ZW0sIGl0ZW1Tb3VyY2UpXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGl0ZW1EZXRhaWxTdGF0cyhpdGVtOiBJdGVtKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgW1wiTW92ZW1lbnRcIiwgaXRlbS5tb3ZlbWVudF0sXG4gICAgICAgIFtcIkNoYXJnZVwiLCBpdGVtLmNoYXJnZV0sXG4gICAgICAgIFtcIkxvYlwiLCBpdGVtLmxvYl0sXG4gICAgICAgIFtcIlNtYXNoXCIsIGl0ZW0uc21hc2hdLFxuICAgICAgICBbXCJTdHJlbmd0aFwiLCBpdGVtLnN0cl0sXG4gICAgICAgIFtcIkRleHRlcml0eVwiLCBpdGVtLmRleF0sXG4gICAgICAgIFtcIlN0YW1pbmFcIiwgaXRlbS5zdGFdLFxuICAgICAgICBbXCJXaWxsXCIsIGl0ZW0ud2lsXSxcbiAgICAgICAgW1wiU2VydmVcIiwgaXRlbS5zZXJ2ZV0sXG4gICAgICAgIFtcIkhQXCIsIGl0ZW0uaHBdLFxuICAgICAgICBbXCJRdWlja3Nsb3RzXCIsIGl0ZW0ucXVpY2tzbG90c10sXG4gICAgICAgIFtcIkJ1ZmZzbG90c1wiLCBpdGVtLmJ1ZmZzbG90c10sXG4gICAgXSBhcyBjb25zdDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSXRlbURldGFpbHNDb250ZW50KGl0ZW06IEl0ZW0sIGNoYXJhY3Rlcj86IENoYXJhY3Rlcikge1xuICAgIGNvbnN0IHN0YXRzID0gaXRlbURldGFpbFN0YXRzKGl0ZW0pLmZpbHRlcigoWywgdmFsdWVdKSA9PiB2YWx1ZSAhPT0gMCk7XG4gICAgY29uc3Qgc291cmNlcyA9IG1ha2VTb3VyY2VzTGlzdChcbiAgICAgICAgaXRlbVNvdXJjZXNUb0VsZW1lbnRBcnJheShpdGVtLCAoKSA9PiB0cnVlLCBjaGFyYWN0ZXIpLFxuICAgICk7XG4gICAgcmV0dXJuIGNyZWF0ZUhUTUwoW1xuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc1wiIH0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwiaGVhZGVyXCIsXG4gICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19faGVhZGVyXCIgfSxcbiAgICAgICAgICAgIGNyZWF0ZUl0ZW1BcnQoaXRlbSwgNzIsIFwiaXRlbS1kZXRhaWxzX19hcnRcIiksXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBbXCJzcGFuXCIsIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19leWVicm93XCIgfSwgXCJFcXVpcG1lbnQgZGV0YWlsc1wiXSxcbiAgICAgICAgICAgICAgICBbXCJoMlwiLCBpdGVtLm5hbWVfZW5dLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19tZXRhXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgYCR7Y2hhcmFjdGVyID8/IGl0ZW0uY2hhcmFjdGVyID8/IFwiQWxsIGNoYXJhY3RlcnNcIn0gwrcgJHtpdGVtLnBhcnR9IMK3IExldmVsICR7aXRlbS5sZXZlbH1gLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgICBcInNlY3Rpb25cIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zZWN0aW9uXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IFwiaXRlbS1kZXRhaWxzLXN0YXRzXCIgfSxcbiAgICAgICAgICAgIFtcImgzXCIsIHsgaWQ6IFwiaXRlbS1kZXRhaWxzLXN0YXRzXCIgfSwgXCJTdGF0c1wiXSxcbiAgICAgICAgICAgIHN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICBcImRsXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3M6IFwiaXRlbS1kZXRhaWxzX19zdGF0c1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRzLm1hcCgoW2xhYmVsLCB2YWx1ZV0pID0+IGNyZWF0ZUhUTUwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcImR0XCIsIGxhYmVsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcImRkXCIsIGAke3ZhbHVlfWBdLFxuICAgICAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICA6IGNyZWF0ZUhUTUwoW1wicFwiLCB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fZW1wdHlcIiB9LCBcIk5vIHN0YXQgYm9udXNlc1wiXSksXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICAgIFwic2VjdGlvblwiLFxuICAgICAgICAgICAgeyBjbGFzczogXCJpdGVtLWRldGFpbHNfX3NlY3Rpb25cIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogXCJpdGVtLWRldGFpbHMtc291cmNlc1wiIH0sXG4gICAgICAgICAgICBbXCJoM1wiLCB7IGlkOiBcIml0ZW0tZGV0YWlscy1zb3VyY2VzXCIgfSwgXCJIb3cgdG8gZ2V0IGl0XCJdLFxuICAgICAgICAgICAgc291cmNlcy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBjcmVhdGVIVE1MKFtcImRpdlwiLCB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fc291cmNlc1wiIH0sIC4uLnNvdXJjZXNdKVxuICAgICAgICAgICAgICAgIDogY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgICAgIFwicFwiLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcIml0ZW0tZGV0YWlsc19fZW1wdHlcIiB9LFxuICAgICAgICAgICAgICAgICAgICBcIk5vIGFjdGl2ZSBhY3F1aXNpdGlvbiBzb3VyY2UgZm91bmQuXCIsXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgIF0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1EZXRhaWxzVHJpZ2dlcihpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpIHtcbiAgICBjb25zdCBidXR0b24gPSBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJidXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgY2xhc3M6IFwiaXRlbS1kZXRhaWxzLXRyaWdnZXJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICBcImFyaWEtaGFzcG9wdXBcIjogXCJkaWFsb2dcIixcbiAgICAgICAgICAgIFwiYXJpYS1leHBhbmRlZFwiOiBcImZhbHNlXCIsXG4gICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogYFZpZXcgZGV0YWlscyBmb3IgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgfSxcbiAgICAgICAgaXRlbS5uYW1lX2VuLFxuICAgIF0pO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93RGlhbG9nKFxuICAgICAgICAgICAgYnV0dG9uLFxuICAgICAgICAgICAgYCR7aXRlbS5uYW1lX2VufSBpdGVtIGRldGFpbHNgLFxuICAgICAgICAgICAgY3JlYXRlSXRlbURldGFpbHNDb250ZW50KGl0ZW0sIGNoYXJhY3RlciksXG4gICAgICAgICAgICBcIml0ZW0tZGV0YWlscy1kaWFsb2dcIixcbiAgICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJdGVtQXJ0RmFsbGJhY2soaXRlbTogSXRlbSkge1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBcIml0ZW0tYXJ0LWZhbGxiYWNrXCIsXG4gICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGBPZmZpY2lhbCBpdGVtIGFydCB1bmF2YWlsYWJsZSBmb3IgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgfSxcbiAgICAgICAgW1wic3BhblwiLCB7IGNsYXNzOiBcIml0ZW0tYXJ0LWZhbGxiYWNrX19jb2RlXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSwgaXRlbS5wYXJ0IHx8IFwiSXRlbVwiXSxcbiAgICAgICAgW1wic3BhblwiLCB7IFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSwgXCJPZmZpY2lhbCBhcnQgdW5hdmFpbGFibGVcIl0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwcml0ZUFydChcbiAgICBzaGVldDogc3RyaW5nLFxuICAgIGNlbGw6IG51bWJlcixcbiAgICBsYWJlbDogc3RyaW5nLFxuICAgIGNsYXNzTmFtZTogc3RyaW5nLFxuICAgIGRpc3BsYXlTaXplID0gNDAsXG4pIHtcbiAgICBjb25zdCBnZW9tZXRyeSA9IGl0ZW1BcnRNYXAuc2hlZXRzW3NoZWV0XTtcbiAgICBpZiAoIWdlb21ldHJ5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY29sdW1uID0gY2VsbCAlIGdlb21ldHJ5LmxpbmVDb3VudDtcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGNlbGwgLyBnZW9tZXRyeS5saW5lQ291bnQpO1xuICAgIGNvbnN0IHNjYWxlID0gZGlzcGxheVNpemUgLyBnZW9tZXRyeS5zaXplO1xuICAgIGNvbnN0IGltYWdlU2l6ZSA9IGdlb21ldHJ5LndpZHRoICogc2NhbGU7XG4gICAgY29uc3Qgb2Zmc2V0WCA9IC0oZ2VvbWV0cnkuc3BhY2UgKyBjb2x1bW4gKiAoZ2VvbWV0cnkuc2l6ZSArIGdlb21ldHJ5LnNwYWNlKSkgKiBzY2FsZTtcbiAgICBjb25zdCBvZmZzZXRZID0gLShnZW9tZXRyeS5zcGFjZSArIHJvdyAqIChnZW9tZXRyeS5zaXplICsgZ2VvbWV0cnkuc3BhY2UpKSAqIHNjYWxlO1xuICAgIHJldHVybiBjcmVhdGVIVE1MKFtcbiAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzOiBjbGFzc05hbWUsXG4gICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IGxhYmVsLFxuICAgICAgICAgICAgc3R5bGU6IFtcbiAgICAgICAgICAgICAgICBgLS1pdGVtLWFydC1pbWFnZTp1cmwoXCIvYXNzZXRzL2l0ZW0tYXJ0LyR7ZW5jb2RlVVJJQ29tcG9uZW50KHNoZWV0KX0ud2VicFwiKWAsXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQtc2l6ZToke2ltYWdlU2l6ZX1weGAsXG4gICAgICAgICAgICAgICAgYC0taXRlbS1hcnQteDoke29mZnNldFh9cHhgLFxuICAgICAgICAgICAgICAgIGAtLWl0ZW0tYXJ0LXk6JHtvZmZzZXRZfXB4YCxcbiAgICAgICAgICAgIF0uam9pbihcIjtcIiksXG4gICAgICAgIH0sXG4gICAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUl0ZW1BcnQoXG4gICAgaXRlbTogSXRlbSxcbiAgICBkaXNwbGF5U2l6ZSA9IDQwLFxuICAgIGNsYXNzTmFtZSA9IFwiaXRlbS1hcnQtdGh1bWJuYWlsXCIsXG4pIHtcbiAgICBjb25zdCBhcnQgPSBpdGVtQXJ0TWFwLml0ZW1zW2Ake2l0ZW0uaWR9YF07XG4gICAgaWYgKCFhcnQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVNwcml0ZUFydChcbiAgICAgICAgYXJ0WzBdLFxuICAgICAgICBhcnRbMV0sXG4gICAgICAgIGBPZmZpY2lhbCBpdGVtIGFydCBmb3IgJHtpdGVtLm5hbWVfZW59YCxcbiAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICBkaXNwbGF5U2l6ZSxcbiAgICApID8/IGNyZWF0ZUl0ZW1BcnRGYWxsYmFjayhpdGVtKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR2FjaGFDb2luQXJ0KGdhY2hhOiBHYWNoYSkge1xuICAgIGNvbnN0IGFydCA9IGl0ZW1BcnRNYXAubG90dGVyaWVzW2Ake2dhY2hhLmdhY2hhX2luZGV4fWBdO1xuICAgIGNvbnN0IGZhbGxiYWNrID0gKCkgPT4gY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzczogXCJnYWNoYS1jb2luLWFydCBnYWNoYS1jb2luLWFydC0tdW5hdmFpbGFibGVcIixcbiAgICAgICAgICAgICAgICByb2xlOiBcImltZ1wiLFxuICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgQ29pbiBhcnR3b3JrIHVuYXZhaWxhYmxlIGZvciAke2dhY2hhLm5hbWV9YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIj9cIixcbiAgICAgICAgXSk7XG4gICAgaWYgKCFhcnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbGxiYWNrKCk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVTcHJpdGVBcnQoXG4gICAgICAgIGFydC5zaGVldCxcbiAgICAgICAgYXJ0LmNlbGwsXG4gICAgICAgIGAke2dhY2hhLm5hbWV9IGNvaW4gYXJ0d29ya2AsXG4gICAgICAgIFwiZ2FjaGEtY29pbi1hcnRcIixcbiAgICApID8/IGZhbGxiYWNrKCk7XG59XG5cbmZ1bmN0aW9uIGl0ZW1Ub1RhYmxlUm93KGl0ZW06IEl0ZW0sIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBIVE1MVGFibGVSb3dFbGVtZW50IHtcbiAgICBjb25zdCByb3cgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0clwiLCB7IGNsYXNzOiBcInJlc3VsdC1yb3dcIiB9LFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJOYW1lX2NvbHVtbiByZXN1bHQtc3VtbWFyeVwiLCBcImRhdGEtbGFiZWxcIjogXCJJdGVtXCIgfSwgZGVsZXRhYmxlSXRlbShpdGVtLCBjaGFyYWN0ZXIpXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiQXJ0X2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJBcnRcIiB9LCBjcmVhdGVJdGVtQXJ0KGl0ZW0pXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiLCBcImRhdGEtbGFiZWxcIjogXCJDaGFyYWN0ZXJcIiB9LCBpdGVtLmNoYXJhY3RlciA/PyBcIkFsbFwiXSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiUGFydF9jb2x1bW5cIiwgXCJkYXRhLWxhYmVsXCI6IFwiUGFydFwiIH0sIGl0ZW0ucGFydF0sXG4gICAgICAgICAgICAuLi5wcmlvcml0eVN0YXRzLm1hcChzdGF0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0YXQuc3BsaXQoXCIrXCIpLm1hcChzID0+IGl0ZW0uc3RhdEZyb21TdHJpbmcocykpLmpvaW4oXCIrXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVIVE1MKFtcInRkXCIsIHsgY2xhc3M6IFwibnVtZXJpY1wiLCBcImRhdGEtbGFiZWxcIjogc3RhdCwgXCJkYXRhLXZhbHVlXCI6IHZhbHVlIH0sIHZhbHVlXSk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwiTGV2ZWxfY29sdW1uIG51bWVyaWNcIiwgXCJkYXRhLWxhYmVsXCI6IFwiTGV2ZWxcIiwgXCJkYXRhLXZhbHVlXCI6IGAke2l0ZW0ubGV2ZWx9YCB9LCBgJHtpdGVtLmxldmVsfWBdLFxuICAgICAgICAgICAgW1widGRcIiwgeyBjbGFzczogXCJTb3VyY2VfY29sdW1uXCIsIFwiZGF0YS1sYWJlbFwiOiBcIlNvdXJjZVwiIH0sIC4uLm1ha2VTb3VyY2VzTGlzdChpdGVtU291cmNlc1RvRWxlbWVudEFycmF5KGl0ZW0sIHNvdXJjZUZpbHRlciwgY2hhcmFjdGVyKSldLFxuICAgICAgICBdXG4gICAgKTtcbiAgICByZXR1cm4gcm93O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2FjaGFUYWJsZShmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLCBjaGFyPzogQ2hhcmFjdGVyKTogSFRNTFRhYmxlRWxlbWVudCB7XG4gICAgY29uc3QgdGFibGUgPSBjcmVhdGVIVE1MKFxuICAgICAgICBbXCJ0YWJsZVwiLFxuICAgICAgICAgICAgW1widHJcIixcbiAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIk5hbWVfY29sdW1uXCIgfSwgXCJOYW1lXCJdLFxuICAgICAgICAgICAgXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IFssIGdhY2hhXSBvZiBnYWNoYXMpIHtcbiAgICAgICAgY29uc3QgZ2FjaGFJdGVtID0gc2hvcF9pdGVtcy5nZXQoZ2FjaGEuc2hvcF9pbmRleCk7XG4gICAgICAgIGlmICghZ2FjaGFJdGVtKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcihnYWNoYUl0ZW0pKSB7XG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcInRyXCIsIFtcInRkXCIsIGNyZWF0ZUdhY2hhU291cmNlUG9wdXAodW5kZWZpbmVkLCBuZXcgSXRlbVNvdXJjZShnYWNoYS5zaG9wX2luZGV4KSwgY2hhcildXSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWJsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3VsdHNUYWJsZShcbiAgICBmaWx0ZXI6IChpdGVtOiBJdGVtKSA9PiBib29sZWFuLFxuICAgIHNvdXJjZUZpbHRlcjogKGl0ZW1Tb3VyY2U6IEl0ZW1Tb3VyY2UpID0+IGJvb2xlYW4sXG4gICAgcHJpb3JpemVyOiAoaXRlbXM6IEl0ZW1bXSwgaXRlbTogSXRlbSkgPT4gSXRlbVtdLFxuICAgIHByaW9yaXR5U3RhdHM6IHN0cmluZ1tdLFxuICAgIGNoYXJhY3Rlcj86IENoYXJhY3Rlcik6IEhUTUxUYWJsZUVsZW1lbnQge1xuICAgIGNvbnN0IHJlc3VsdHM6IHsgW2tleTogc3RyaW5nXTogSXRlbVtdIH0gPSB7XG4gICAgICAgIFwiSGF0XCI6IFtdLFxuICAgICAgICBcIkhhaXJcIjogW10sXG4gICAgICAgIFwiRHllXCI6IFtdLFxuICAgICAgICBcIlVwcGVyXCI6IFtdLFxuICAgICAgICBcIkxvd2VyXCI6IFtdLFxuICAgICAgICBcIlNob2VzXCI6IFtdLFxuICAgICAgICBcIlNvY2tzXCI6IFtdLFxuICAgICAgICBcIkhhbmRcIjogW10sXG4gICAgICAgIFwiQmFja3BhY2tcIjogW10sXG4gICAgICAgIFwiRmFjZVwiOiBbXSxcbiAgICAgICAgXCJSYWNrZXRcIjogW10sXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgWywgaXRlbV0gb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGZpbHRlcihpdGVtKSkge1xuICAgICAgICAgICAgcmVzdWx0c1tpdGVtLnBhcnRdID0gcHJpb3JpemVyKHJlc3VsdHNbaXRlbS5wYXJ0XSwgaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IGNyZWF0ZUhUTUwoXG4gICAgICAgIFtcInRhYmxlXCIsXG4gICAgICAgICAgICBbXCJjYXB0aW9uXCIsIFwiTWF0Y2hpbmcgZXF1aXBtZW50IGJ5IHNsb3QgYW5kIHNlbGVjdGVkIHN0YXQgcHJpb3JpdHlcIl0sXG4gICAgICAgICAgICBbXCJ0aGVhZFwiLFxuICAgICAgICAgICAgICAgIFtcInRyXCIsXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiTmFtZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJJdGVtXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIkFydF9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJBcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIFtcInRoXCIsIHsgY2xhc3M6IFwiQ2hhcmFjdGVyX2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIkNoYXJhY3RlclwiXSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJQYXJ0X2NvbHVtblwiLCBzY29wZTogXCJjb2xcIiB9LCBcIlBhcnRcIl0sXG4gICAgICAgICAgICAgICAgICAgIC4uLnByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gY3JlYXRlSFRNTChbXCJ0aFwiLCB7IGNsYXNzOiBcIm51bWVyaWNcIiwgc2NvcGU6IFwiY29sXCIgfSwgc3RhdF0pKSxcbiAgICAgICAgICAgICAgICAgICAgW1widGhcIiwgeyBjbGFzczogXCJMZXZlbF9jb2x1bW4gbnVtZXJpY1wiLCBzY29wZTogXCJjb2xcIiB9LCBcIkxldmVsXCJdLFxuICAgICAgICAgICAgICAgICAgICBbXCJ0aFwiLCB7IGNsYXNzOiBcIlNvdXJjZV9jb2x1bW5cIiwgc2NvcGU6IFwiY29sXCIgfSwgXCJTb3VyY2VcIl0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXCJ0Ym9keVwiXSxcbiAgICAgICAgXVxuICAgICk7XG4gICAgY29uc3QgdGFibGVCb2R5ID0gdGFibGUudEJvZGllc1swXTtcbiAgICBpZiAoIXRhYmxlQm9keSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuXG4gICAgdHlwZSBNYXBPcHRpb25zID0geyBba2V5OiBzdHJpbmddOiBudW1iZXJbXSB9O1xuXG4gICAgdHlwZSBDb3N0ID0ge1xuICAgICAgICBnb2xkOiBudW1iZXIsXG4gICAgICAgIGFwOiBudW1iZXIsXG4gICAgICAgIG1hcHM6IE1hcE9wdGlvbnMsXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNvbWJpbmVNYXBzKG0xOiBNYXBPcHRpb25zLCBtMjogTWFwT3B0aW9ucyk6IE1hcE9wdGlvbnMge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7IC4uLm0xIH07XG4gICAgICAgIGZvciAoY29uc3QgW21hcCwgdHJpZXNdIG9mIE9iamVjdC5lbnRyaWVzKG0yKSkge1xuICAgICAgICAgICAgaWYgKHJlc3VsdFttYXBdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSByZXN1bHRbbWFwXS5jb25jYXQodHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSB0cmllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbWJpbmVDb3N0cyhjb3N0MTogQ29zdCwgY29zdDI6IENvc3QpOiBDb3N0IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdvbGQ6IGNvc3QxLmdvbGQgKyBjb3N0Mi5nb2xkLFxuICAgICAgICAgICAgYXA6IGNvc3QxLmFwICsgY29zdDIuYXAsXG4gICAgICAgICAgICBtYXBzOiBjb21iaW5lTWFwcyhjb3N0MS5tYXBzLCBjb3N0Mi5tYXBzKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5NYXAobTE6IE1hcE9wdGlvbnMsIG0yOiBNYXBPcHRpb25zKTogTWFwT3B0aW9ucyB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4ubTEgfTtcbiAgICAgICAgZm9yIChjb25zdCBbbWFwLCB0cmllc10gb2YgT2JqZWN0LmVudHJpZXMobTIpKSB7XG4gICAgICAgICAgICBpZiAodHJpZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdFttYXBdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W21hcF0gPSBbTWF0aC5taW4ocmVzdWx0W21hcF1bMF0sIHRyaWVzWzBdKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbbWFwXSA9IHRyaWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWluQ29zdChjb3N0MTogQ29zdCwgY29zdDI6IENvc3QpOiBDb3N0IHtcbiAgICAgICAgLy8gTGV4aWNvZ3JhcGhpYyBvbiAoYXAsIGdvbGQpOiBsb3dlciBBUCB3aW5zLCB0aGVuIGxvd2VyIEdvbGQuXG4gICAgICAgIC8vIE51bWVyaWMgY29tcGFyZSBvbmx5IOKAlCBkbyBub3QgdXNlIEpTIGFycmF5L3N0cmluZyBvcmRlcmluZy5cbiAgICAgICAgY29uc3QgcGlja0Nvc3QxID1cbiAgICAgICAgICAgIGNvc3QxLmFwIDwgY29zdDIuYXAgfHxcbiAgICAgICAgICAgIChjb3N0MS5hcCA9PT0gY29zdDIuYXAgJiYgY29zdDEuZ29sZCA8IGNvc3QyLmdvbGQpO1xuICAgICAgICByZXR1cm4gcGlja0Nvc3QxID9cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnb2xkOiBjb3N0MS5nb2xkLFxuICAgICAgICAgICAgICAgIGFwOiBjb3N0MS5hcCxcbiAgICAgICAgICAgICAgICBtYXBzOiBtaW5NYXAoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgICAgICB9IDpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnb2xkOiBjb3N0Mi5nb2xkLFxuICAgICAgICAgICAgICAgIGFwOiBjb3N0Mi5hcCxcbiAgICAgICAgICAgICAgICBtYXBzOiBtaW5NYXAoY29zdDEubWFwcywgY29zdDIubWFwcyksXG4gICAgICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvc3RPZihpdGVtOiBJdGVtLCBjaGFyYWN0ZXI/OiBDaGFyYWN0ZXIpOiBDb3N0IHtcbiAgICAgICAgY29uc3Qgc291cmNlQ29zdHMgPSBbLi4uaXRlbS5zb3VyY2VzLnZhbHVlcygpXVxuICAgICAgICAgICAgLmZpbHRlcihzb3VyY2VGaWx0ZXIpXG4gICAgICAgICAgICAubWFwKChpdGVtU291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVNvdXJjZS5hcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogMCwgYXA6IGl0ZW1Tb3VyY2UucHJpY2UsIG1hcHM6IHt9IH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZ29sZDogaXRlbVNvdXJjZS5wcmljZSwgYXA6IDAsIG1hcHM6IHt9IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlQ29zdCA9IGNvc3RPZihpdGVtU291cmNlLml0ZW0sIGNoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSBpdGVtU291cmNlLmdhY2hhVHJpZXMoaXRlbSwgY2hhcmFjdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGQ6IHNpbmdsZUNvc3QuZ29sZCAqIG11bHRpcGxpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcDogc2luZ2xlQ29zdC5hcCAqIG11bHRpcGxpZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBzOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoc2luZ2xlQ29zdC5tYXBzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChbbWFwLCB0cmllc10pID0+IFttYXAsIHRyaWVzLm1hcChuID0+IG4gKiBtdWx0aXBsaWVyKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHdWFyZGlhbkl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvbGQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHM6IE9iamVjdC5mcm9tRW50cmllcyhbW2l0ZW1Tb3VyY2UuZ3VhcmRpYW5fbWFwLCBbaXRlbVNvdXJjZS5pdGVtcy5sZW5ndGhdXV0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmIChzb3VyY2VDb3N0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IGdvbGQ6IDAsIGFwOiAwLCBtYXBzOiB7fSB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIFNlZWQgd2l0aCB0aGUgZmlyc3QgcmVhbCBzb3VyY2UgY29zdC4gQSB7MCwwfSBpZGVudGl0eSB3b3VsZCBhbHdheXMgd2luXG4gICAgICAgIC8vIHVuZGVyIGEgY29ycmVjdCBtaW4sIGFuZCB0aGUgb2xkIGFsd2F5cy1sYXN0IGJ1ZyBoaWQgdGhhdC5cbiAgICAgICAgcmV0dXJuIHNvdXJjZUNvc3RzLnJlZHVjZSgoY3VyciwgY29zdCkgPT4gbWluQ29zdChjdXJyLCBjb3N0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJpb3JpdHlTdGF0aXN0aWNzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0gT2JqZWN0LmZyb21FbnRyaWVzKHByaW9yaXR5U3RhdHMubWFwKHN0YXQgPT4gW3N0YXQsIDBdKSk7XG4gICAgY29uc3Qgc3RhdGlzdGljcyA9IHtcbiAgICAgICAgY2hhcmFjdGVyczogbmV3IFNldDxDaGFyYWN0ZXI+LFxuICAgICAgICBMZXZlbDogMCxcbiAgICAgICAgY29zdDogeyBhcDogMCwgZ29sZDogMCwgbWFwczoge30gfSBhcyBDb3N0LFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBPYmplY3QudmFsdWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3Qgc3RhdCBvZiBwcmlvcml0eVN0YXRzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByaW9yaXR5U3RhdGlzdGljc1tzdGF0XSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdGF0LnNwbGl0KFwiK1wiKS5yZWR1Y2UoKGN1cnIsIHN0YXROYW1lKSA9PiBjdXJyICsgcmVzdWx0WzBdLnN0YXRGcm9tU3RyaW5nKHN0YXROYW1lKSwgMCk7XG4gICAgICAgICAgICBwcmlvcml0eVN0YXRpc3RpY3Nbc3RhdF0gKz0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0aXN0aWNzLkxldmVsID0gTWF0aC5tYXgocmVzdWx0WzBdLmxldmVsLCBzdGF0aXN0aWNzLkxldmVsKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2YgaXRlbS5jaGFyYWN0ZXIgPyBbaXRlbS5jaGFyYWN0ZXJdIDogY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgIHN0YXRpc3RpY3MuY2hhcmFjdGVycy5hZGQoY2hhcilcbiAgICAgICAgICAgICAgICB0YWJsZUJvZHkuYXBwZW5kQ2hpbGQoaXRlbVRvVGFibGVSb3coaXRlbSwgc291cmNlRmlsdGVyLCBwcmlvcml0eVN0YXRzLCBjaGFyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm9vdGVyIGNvc3QgbXVzdCBtYXRjaCBzdGF0cy9sZXZlbDogYmVzdCBjYW5kaWRhdGUgcGVyIHNsb3Qgb25seS5cbiAgICAgICAgLy8gVGhlIGJvZHkgc3RpbGwgcmVuZGVycyB0aGUgZnVsbCByYW5rZWQgbGlzdCBhYm92ZS5cbiAgICAgICAgc3RhdGlzdGljcy5jb3N0ID0gY29tYmluZUNvc3RzKFxuICAgICAgICAgICAgY29zdE9mKHJlc3VsdFswXSwgY2hhcmFjdGVyICYmIGlzQ2hhcmFjdGVyKGNoYXJhY3RlcikgPyBjaGFyYWN0ZXIgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgc3RhdGlzdGljcy5jb3N0LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmIChzdGF0aXN0aWNzLmNoYXJhY3RlcnMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBjb25zdCB0b3RhbF9zb3VyY2VzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBpZiAoc3RhdGlzdGljcy5jb3N0LmdvbGQgPiAwKSB7XG4gICAgICAgICAgICB0b3RhbF9zb3VyY2VzLnB1c2goYCR7c3RhdGlzdGljcy5jb3N0LmdvbGQudG9GaXhlZCgwKX0gR29sZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0aXN0aWNzLmNvc3QuYXAgPiAwKSB7XG4gICAgICAgICAgICB0b3RhbF9zb3VyY2VzLnB1c2goYCR7c3RhdGlzdGljcy5jb3N0LmFwLnRvRml4ZWQoMCl9IEFQYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9zdGF0aXN0aWNzWydHdWFyZGlhbiBnYW1lcyddLmZvckVhY2goKGNvdW50LCBtYXApID0+IHRvdGFsX3NvdXJjZXMucHVzaChgJHtjb3VudC50b0ZpeGVkKDApfSB4ICR7bWFwfWApKTtcbiAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInRmb290XCIsXG4gICAgICAgICAgICBbXCJ0clwiLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgTmFtZV9jb2x1bW5cIiB9LCBcIlRvdGFsOlwiXSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIEFydF9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIENoYXJhY3Rlcl9jb2x1bW5cIiB9XSxcbiAgICAgICAgICAgICAgICBbXCJ0ZFwiLCB7IGNsYXNzOiBcInRvdGFsIFBhcnRfY29sdW1uXCIgfV0sXG4gICAgICAgICAgICAgICAgLi4ucHJpb3JpdHlTdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgbnVtZXJpY1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIGAke3ByaW9yaXR5U3RhdGlzdGljc1tzdGF0XX1gXG4gICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgTGV2ZWxfY29sdW1uIG51bWVyaWNcIiB9LCBgJHtzdGF0aXN0aWNzLkxldmVsfWBdLFxuICAgICAgICAgICAgICAgIFtcInRkXCIsIHsgY2xhc3M6IFwidG90YWwgU291cmNlX2NvbHVtblwiIH0sIHRvdGFsX3NvdXJjZXMuam9pbihcIiwgXCIpXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIF0pKTtcbiAgICAgICAgZm9yIChjb25zdCBjb2x1bW5fZWxlbWVudCBvZiB0YWJsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBDaGFyYWN0ZXJfY29sdW1uYCkpIHtcbiAgICAgICAgICAgIGlmICghKGNvbHVtbl9lbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2x1bW5fZWxlbWVudC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICBpZiAocHJpb3JpdHlTdGF0aXN0aWNzW2F0dHJpYnV0ZV0gPT09IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sdW1uX2VsZW1lbnQgb2YgdGFibGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgJHthdHRyaWJ1dGV9X2NvbHVtbmApKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoY29sdW1uX2VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbHVtbl9lbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF4SXRlbUxldmVsKCkge1xuICAgIC8vbm8gcmVkdWNlIGZvciBNYXA/XG4gICAgbGV0IG1heCA9IDA7XG4gICAgZm9yIChjb25zdCBbLCBpdGVtXSBvZiBpdGVtcykge1xuICAgICAgICBtYXggPSBNYXRoLm1heChtYXgsIGl0ZW0ubGV2ZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbWF4O1xufVxuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGRpYWxvZyAmJiBkaWFsb2cgPT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICB9XG59KTtcbiIsImltcG9ydCB7IG1ha2VDaGVja2JveFRyZWUsIFRyZWVOb2RlLCBnZXRMZWFmU3RhdGVzLCBzZXRMZWFmU3RhdGVzIH0gZnJvbSAnLi9jaGVja2JveFRyZWUnO1xuaW1wb3J0IHsgY3JlYXRlUG9wdXBMaW5rLCBkb3dubG9hZEl0ZW1zLCBnZXRSZXN1bHRzVGFibGUsIEl0ZW0sIEl0ZW1Tb3VyY2UsIGdldE1heEl0ZW1MZXZlbCwgaXRlbXMsIENoYXJhY3RlciwgY2hhcmFjdGVycywgaXNDaGFyYWN0ZXIsIFNob3BJdGVtU291cmNlLCBHYWNoYUl0ZW1Tb3VyY2UsIGdldEdhY2hhVGFibGUgfSBmcm9tICcuL2l0ZW1Mb29rdXAnO1xuaW1wb3J0IHsgY3JlYXRlSFRNTCB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQgeyBzZWxlY3RCeVByaW9yaXR5IH0gZnJvbSAnLi9wcmlvcml0eSc7XG5pbXBvcnQgeyBWYXJpYWJsZV9zdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlJztcblxuY29uc3QgcGFydHNGaWx0ZXIgPSBbXG4gICAgXCJQYXJ0c1wiLCBbXG4gICAgICAgIFwiSGVhZFwiLCBbXG4gICAgICAgICAgICBcIitIYXRcIixcbiAgICAgICAgICAgIFwiK0hhaXJcIixcbiAgICAgICAgICAgIFwiRHllXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1VwcGVyXCIsXG4gICAgICAgIFwiK0xvd2VyXCIsXG4gICAgICAgIFwiTGVnc1wiLCBbXG4gICAgICAgICAgICBcIitTaG9lc1wiLFxuICAgICAgICAgICAgXCJTb2Nrc1wiLFxuICAgICAgICBdLFxuICAgICAgICBcIkF1eFwiLCBbXG4gICAgICAgICAgICBcIitIYW5kXCIsXG4gICAgICAgICAgICBcIitCYWNrcGFja1wiLFxuICAgICAgICAgICAgXCIrRmFjZVwiXG4gICAgICAgIF0sXG4gICAgICAgIFwiK1JhY2tldFwiLFxuICAgIF0sXG5dO1xuXG5jb25zdCBhdmFpbGFiaWxpdHlGaWx0ZXIgPSBbXG4gICAgXCJBdmFpbGFiaWxpdHlcIiwgW1xuICAgICAgICBcIlNob3BcIiwgW1xuICAgICAgICAgICAgXCIrR29sZFwiLFxuICAgICAgICAgICAgXCIrQVBcIixcbiAgICAgICAgXSxcbiAgICAgICAgXCIrQWxsb3cgZ2FjaGFcIixcbiAgICAgICAgXCIrR3VhcmRpYW5cIixcbiAgICAgICAgXCIrVW50cmFkYWJsZVwiLFxuICAgICAgICBcIlVuYXZhaWxhYmxlIGl0ZW1zXCIsXG4gICAgXSxcbl07XG5cbmNvbnN0IGV4Y2x1ZGVkX2l0ZW1faWRzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbi8qKiBEaWdpdHMtb25seSBzYWZlLWludGVnZXIgcGFyc2UgZm9yIGV4Y2x1ZGVkX2l0ZW1faWRzIGxvY2FsU3RvcmFnZSB0b2tlbnMuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeGNsdWRlZEl0ZW1JZFRva2VuKHRva2VuOiBzdHJpbmcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGlmICghL15cXGQrJC8udGVzdCh0b2tlbikpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBOdW1iZXIodG9rZW4pO1xuICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoaWQpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYWRkRmlsdGVyVHJlZXMoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFyYWN0ZXJGaWx0ZXJzXCIpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgY2hhcmFjdGVyIG9mIFtcIkFsbFwiLCAuLi5jaGFyYWN0ZXJzXSkge1xuICAgICAgICBjb25zdCBpZCA9IGBjaGFyYWN0ZXJTZWxlY3RvcnNfJHtjaGFyYWN0ZXJ9YDtcbiAgICAgICAgY29uc3QgcmFkaW9fYnV0dG9uID0gY3JlYXRlSFRNTChbXCJpbnB1dFwiLCB7IGlkOiBpZCwgdHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImNoYXJhY3RlclNlbGVjdG9yc1wiLCB2YWx1ZTogY2hhcmFjdGVyIH1dKTtcbiAgICAgICAgcmFkaW9fYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHJhZGlvX2J1dHRvbik7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImxhYmVsXCIsIHsgZm9yOiBpZCB9LCBjaGFyYWN0ZXJdKSk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcImJyXCJdKSk7XG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgcmFkaW9fYnV0dG9uLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpbHRlcnM6IFtUcmVlTm9kZSwgc3RyaW5nXVtdID0gW1xuICAgICAgICBbcGFydHNGaWx0ZXIsIFwicGFydHNGaWx0ZXJcIl0sXG4gICAgICAgIFthdmFpbGFiaWxpdHlGaWx0ZXIsIFwiYXZhaWxhYmlsaXR5RmlsdGVyXCJdLFxuICAgIF07XG4gICAgZm9yIChjb25zdCBbZmlsdGVyLCBuYW1lXSBvZiBmaWx0ZXJzKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5hbWUpO1xuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRyZWUgPSBtYWtlQ2hlY2tib3hUcmVlKGZpbHRlcik7XG4gICAgICAgIHRyZWUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB1cGRhdGVSZXN1bHRzKTtcbiAgICAgICAgdGFyZ2V0LmlubmVyVGV4dCA9IFwiXCI7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZCh0cmVlKTtcbiAgICB9XG59XG5cbmFkZEZpbHRlclRyZWVzKCk7XG5cbmxldCBkcmFnZ2VkOiBIVE1MRWxlbWVudDtcbmNvbnN0IGRyYWdTZXBhcmF0b3JMaW5lID0gY3JlYXRlSFRNTChbXCJoclwiLCB7IGlkOiBcImRyYWdPdmVyQmFyXCIgfV0pO1xubGV0IGRyYWdIaWdobGlnaHRlZEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBhcHBseURyYWdEcm9wKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZHJhZ2dlZCA9IHRhcmdldDtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc05hbWUgPT09IFwiZHJvcHpvbmVcIikge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0UmVjdCA9IGV2ZW50LnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBldmVudC5jbGllbnRZIC0gdGFyZ2V0UmVjdC50b3A7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0YXJnZXRSZWN0LmhlaWdodDtcbiAgICAgICAgICAgIGVudW0gUG9zaXRpb24ge1xuICAgICAgICAgICAgICAgIGFib3ZlLFxuICAgICAgICAgICAgICAgIG9uLFxuICAgICAgICAgICAgICAgIGJlbG93LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB5IDwgaGVpZ2h0ICogMC4zID8gUG9zaXRpb24uYWJvdmUgOiB5ID4gaGVpZ2h0ICogMC43ID8gUG9zaXRpb24uYmVsb3cgOiBQb3NpdGlvbi5vbjtcbiAgICAgICAgICAgIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLmFib3ZlOlxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmJlZm9yZShkcmFnU2VwYXJhdG9yTGluZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUG9zaXRpb24uYmVsb3c6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuYWZ0ZXIoZHJhZ1NlcGFyYXRvckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBvc2l0aW9uLm9uOlxuICAgICAgICAgICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ0hpZ2hsaWdodGVkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ0hpZ2hsaWdodGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkID09PSBldmVudC50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyb3Bob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsICh7IHRhcmdldCB9KSA9PiB7XG4gICAgICAgIGlmICghZHJhZ1NlcGFyYXRvckxpbmUuaGlkZGVuKSB7XG4gICAgICAgICAgICBkcmFnZ2VkLnJlbW92ZSgpO1xuICAgICAgICAgICAgZHJhZ1NlcGFyYXRvckxpbmUuYWZ0ZXIoZHJhZ2dlZCk7XG4gICAgICAgICAgICBkcmFnU2VwYXJhdG9yTGluZS5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgdXBkYXRlUmVzdWx0cygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdTZXBhcmF0b3JMaW5lLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICBkcmFnSGlnaGxpZ2h0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9waG92ZXJcIik7XG4gICAgICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZHJhZ0hpZ2hsaWdodGVkRWxlbWVudDtcbiAgICAgICAgICAgIGRyYWdIaWdobGlnaHRlZEVsZW1lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoIShkcm9wVGFyZ2V0IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcm9wVGFyZ2V0LnRleHRDb250ZW50ICs9IGArJHtkcmFnZ2VkLnRleHRDb250ZW50fWA7XG4gICAgICAgICAgICBkcmFnZ2VkLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQgPT09IGRyYWdnZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gZHJhZ2dlZC50ZXh0Q29udGVudCEuc3BsaXQoXCIrXCIpO1xuICAgICAgICAgICAgZHJhZ2dlZC50ZXh0Q29udGVudCA9IHN0YXRzLnNoaWZ0KCkhO1xuICAgICAgICAgICAgZHJhZ2dlZC5hZnRlciguLi5zdGF0cy5tYXAoc3RhdCA9PiBjcmVhdGVIVE1MKFtcImxpXCIsIHsgY2xhc3M6IFwiZHJvcHpvbmVcIiwgZHJhZ2dhYmxlOiBcInRydWVcIiB9LCBzdGF0XSkpKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbmFwcGx5RHJhZ0Ryb3AoKTtcblxuZnVuY3Rpb24gY29tcGFyZShsaHM6IG51bWJlciwgcmhzOiBudW1iZXIpOiAtMSB8IDAgfCAxIHtcbiAgICBpZiAobGhzID09PSByaHMpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBsaHMgPCByaHMgPyAtMSA6IDE7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk6IENoYXJhY3RlciB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY2hhcmFjdGVyRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwiY2hhcmFjdGVyU2VsZWN0b3JzXCIpO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjaGFyYWN0ZXJGaWx0ZXJMaXN0KSB7XG4gICAgICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNDaGFyYWN0ZXIoc2VsZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkQ2hhcmFjdGVyKGNoYXJhY3RlcjogQ2hhcmFjdGVyIHwgXCJBbGxcIikge1xuICAgIGNvbnN0IGNoYXJhY3RlckZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcImNoYXJhY3RlclNlbGVjdG9yc1wiKTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hhcmFjdGVyRmlsdGVyTGlzdCkge1xuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSA9PT0gY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBpdGVtU2VsZWN0b3JzID0gW1wicGFydHNTZWxlY3RvclwiLCBcImdhY2hhU2VsZWN0b3JcIl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBJdGVtU2VsZWN0b3IgPSB0eXBlb2YgaXRlbVNlbGVjdG9yc1tudW1iZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbVNlbGVjdG9yKGl0ZW1TZWxlY3Rvcjogc3RyaW5nKTogaXRlbVNlbGVjdG9yIGlzIEl0ZW1TZWxlY3RvciB7XG4gICAgcmV0dXJuIChpdGVtU2VsZWN0b3JzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLmluY2x1ZGVzKGl0ZW1TZWxlY3Rvcik7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1UeXBlU2VsZWN0aW9uKCk6IEl0ZW1TZWxlY3RvciB7XG4gICAgY29uc3QgcGFydHNTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNTZWxlY3RvclwiKTtcbiAgICBpZiAoIShwYXJ0c1NlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAocGFydHNTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcInBhcnRzU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgY29uc3QgZ2FjaGFTZWxlY3RvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FjaGFTZWxlY3RvclwiKTtcbiAgICBpZiAoIShnYWNoYVNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBpZiAoZ2FjaGFTZWxlY3Rvci5jaGVja2VkKSB7XG4gICAgICAgIHJldHVybiBcImdhY2hhU2VsZWN0b3JcIjtcbiAgICB9XG4gICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xufVxuXG5mdW5jdGlvbiBzYXZlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkQ2hhcmFjdGVyID0gZ2V0U2VsZWN0ZWRDaGFyYWN0ZXIoKSB8fCBcIkFsbFwiO1xuICAgIFZhcmlhYmxlX3N0b3JhZ2Uuc2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIsIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICB7Ly9GaWx0ZXJzXG4gICAgICAgIGNvbnN0IHBhcnRzRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFydHNGaWx0ZXJcIik/LmNoaWxkcmVuWzBdO1xuICAgICAgICBpZiAoIShwYXJ0c0ZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXZhaWxhYmlsaXR5RmlsdGVyXCIpPy5jaGlsZHJlblswXTtcbiAgICAgICAgaWYgKCEoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCkpKSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgeyAvL21pc2NcbiAgICAgICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICAgICAgaWYgKCEobGV2ZWxyYW5nZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4TGV2ZWwgPSBwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKTtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJtYXhMZXZlbFwiLCBtYXhMZXZlbCk7XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbV9uYW1lID0gbmFtZWZpbHRlci52YWx1ZTtcbiAgICAgICAgaWYgKGl0ZW1fbmFtZSkge1xuICAgICAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJuYW1lRmlsdGVyXCIsIGl0ZW1fbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLmRlbGV0ZV92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJlbmNoYW50VG9nZ2xlXCIsIGVuY2hhbnRUb2dnbGUuY2hlY2tlZCk7XG4gICAgfVxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBWYXJpYWJsZV9zdG9yYWdlLnNldF92YXJpYWJsZShcIml0ZW1UeXBlU2VsZWN0b3JcIiwgZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgVmFyaWFibGVfc3RvcmFnZS5zZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiLCBBcnJheS5mcm9tKGV4Y2x1ZGVkX2l0ZW1faWRzKS5qb2luKFwiLFwiKSk7XG59XG5cbmZ1bmN0aW9uIHJlc3RvcmVTZWxlY3Rpb24oKSB7XG4gICAgY29uc3Qgc3RvcmVkX2NoYXJhY3RlciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiQ2hhcmFjdGVyXCIpO1xuICAgIHNldFNlbGVjdGVkQ2hhcmFjdGVyKHR5cGVvZiBzdG9yZWRfY2hhcmFjdGVyID09PSBcInN0cmluZ1wiICYmIGlzQ2hhcmFjdGVyKHN0b3JlZF9jaGFyYWN0ZXIpID8gc3RvcmVkX2NoYXJhY3RlciA6IFwiQWxsXCIpO1xuXG4gICAgey8vRmlsdGVyc1xuICAgICAgICBsZXQgc3RhdGVzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoVmFyaWFibGVfc3RvcmFnZS52YXJpYWJsZXMpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgIHN0YXRlc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKHBhcnRzRmlsdGVyTGlzdCBpbnN0YW5jZW9mIEhUTUxVTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TGVhZlN0YXRlcyhwYXJ0c0ZpbHRlckxpc3QsIHN0YXRlcyk7XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIHNldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCwgc3RhdGVzKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICB7IC8vbWlzY1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwibWF4TGV2ZWxcIik7XG4gICAgICAgIGlmICh0eXBlb2YgbWF4TGV2ZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHttYXhMZXZlbH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV2ZWxyYW5nZS52YWx1ZSA9IGxldmVscmFuZ2UubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtX25hbWUgPSBWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcIm5hbWVGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbV9uYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBuYW1lZmlsdGVyLnZhbHVlID0gaXRlbV9uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jaGFudFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jaGFudFRvZ2dsZVwiKTtcbiAgICAgICAgaWYgKCEoZW5jaGFudFRvZ2dsZSBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgICAgIH1cbiAgICAgICAgZW5jaGFudFRvZ2dsZS5jaGVja2VkID0gISFWYXJpYWJsZV9zdG9yYWdlLmdldF92YXJpYWJsZShcImVuY2hhbnRUb2dnbGVcIik7XG4gICAgfVxuXG4gICAgLy8gUmVoeWRyYXRlIGV4Y2x1c2lvbnMgYmVmb3JlIGFueSBzYXZlLWNhcGFibGUgZXZlbnQgKGNoYW5nZS9pbnB1dCDihpIgdXBkYXRlUmVzdWx0cyDihpIgc2F2ZVNlbGVjdGlvbikuXG4gICAgY29uc3QgZXhjbHVkZWRfaWRzID0gVmFyaWFibGVfc3RvcmFnZS5nZXRfdmFyaWFibGUoXCJleGNsdWRlZF9pdGVtX2lkc1wiKTtcbiAgICBpZiAodHlwZW9mIGV4Y2x1ZGVkX2lkcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2lkcy5zcGxpdChcIixcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRXhjbHVkZWRJdGVtSWRUb2tlbihpZCk7XG4gICAgICAgICAgICBpZiAocGFyc2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBleGNsdWRlZF9pdGVtX2lkcy5hZGQocGFyc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9pdGVtIHNlbGVjdGlvblxuICAgICAgICBsZXQgaXRlbVR5cGVTZWxlY3RvciA9IFZhcmlhYmxlX3N0b3JhZ2UuZ2V0X3ZhcmlhYmxlKFwiaXRlbVR5cGVTZWxlY3RvclwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtVHlwZVNlbGVjdG9yICE9PSBcInN0cmluZ1wiIHx8ICFpc0l0ZW1TZWxlY3RvcihpdGVtVHlwZVNlbGVjdG9yKSkge1xuICAgICAgICAgICAgaXRlbVR5cGVTZWxlY3RvciA9IFwicGFydHNTZWxlY3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVR5cGVTZWxlY3Rvcik7XG4gICAgICAgIGlmICghKHNlbGVjdG9yIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZWN0b3IuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiwgeyBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSk7XG4gICAgfVxuXG4gICAgLy9tdXN0IGJlIGxhc3QgYmVjYXVzZSBpdCB0cmlnZ2VycyBhIHN0b3JlXG4gICAgbGV2ZWxyYW5nZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIpKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVzdWx0cygpIHtcbiAgICBzYXZlU2VsZWN0aW9uKCk7XG4gICAgY29uc3QgZmlsdGVyczogKChpdGVtOiBJdGVtKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgY29uc3Qgc291cmNlRmlsdGVyczogKChpdGVtU291cmNlOiBJdGVtU291cmNlKSA9PiBib29sZWFuKVtdID0gW107XG4gICAgbGV0IHNlbGVjdGVkQ2hhcmFjdGVyOiBDaGFyYWN0ZXIgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgcGFydHNGaWx0ZXJMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgaWYgKCEocGFydHNGaWx0ZXJMaXN0IGluc3RhbmNlb2YgSFRNTFVMaXN0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWx0ZXJcIik7XG4gICAgaWYgKCEobmFtZWZpbHRlciBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG5cbiAgICB7IC8vY2hhcmFjdGVyIGZpbHRlclxuICAgICAgICBzZWxlY3RlZENoYXJhY3RlciA9IGdldFNlbGVjdGVkQ2hhcmFjdGVyKCk7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkQ2hhcmFjdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0uY2hhcmFjdGVyID09PSBzZWxlY3RlZENoYXJhY3Rlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2FjaGFTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vcGFydHMgZmlsdGVyXG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHNTdGF0ZXMgPSBnZXRMZWFmU3RhdGVzKHBhcnRzRmlsdGVyTGlzdCk7XG4gICAgICAgICAgICAgICAgZmlsdGVycy5wdXNoKGl0ZW0gPT4gcGFydHNTdGF0ZXNbaXRlbS5wYXJ0XSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9hdmFpbGFiaWxpdHkgZmlsdGVyXG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF2YWlsYWJpbGl0eUZpbHRlclwiKT8uY2hpbGRyZW5bMF07XG4gICAgICAgIGlmICghKGF2YWlsYWJpbGl0eUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MVUxpc3RFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF2YWlsYWJpbGl0eVN0YXRlcyA9IGdldExlYWZTdGF0ZXMoYXZhaWxhYmlsaXR5RmlsdGVyTGlzdCk7XG4gICAgICAgIGlmICghYXZhaWxhYmlsaXR5U3RhdGVzW1wiR29sZFwiXSkge1xuICAgICAgICAgICAgc291cmNlRmlsdGVycy5wdXNoKGl0ZW1Tb3VyY2UgPT4gIShpdGVtU291cmNlIGluc3RhbmNlb2YgU2hvcEl0ZW1Tb3VyY2UgJiYgIWl0ZW1Tb3VyY2UuYXAgJiYgaXRlbVNvdXJjZS5wcmljZSA+IDApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFQXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBTaG9wSXRlbVNvdXJjZSAmJiBpdGVtU291cmNlLmFwICYmIGl0ZW1Tb3VyY2UucHJpY2UgPiAwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhdmFpbGFiaWxpdHlTdGF0ZXNbXCJVbnRyYWRhYmxlXCJdKSB7XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXRlbSA9PiBpdGVtLnBhcmNlbF9lbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkFsbG93IGdhY2hhXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIkd1YXJkaWFuXCJdKSB7XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXRlbVNvdXJjZSA9PiAhaXRlbVNvdXJjZS5yZXF1aXJlc0d1YXJkaWFuKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWF2YWlsYWJpbGl0eVN0YXRlc1tcIlVuYXZhaWxhYmxlIGl0ZW1zXCJdKSB7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFiaWxpdHlTb3VyY2VGaWx0ZXIgPSBbLi4uc291cmNlRmlsdGVyc107XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VGaWx0ZXIgPSAoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkgPT4gYXZhaWxhYmlsaXR5U291cmNlRmlsdGVyLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbVNvdXJjZSkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gaXNBdmFpbGFibGVTb3VyY2UoaXRlbVNvdXJjZTogSXRlbVNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlRmlsdGVyKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1Tb3VyY2UgaW5zdGFuY2VvZiBHYWNoYUl0ZW1Tb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgaXRlbVNvdXJjZS5pdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNvdXJjZShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VyY2VGaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVTb3VyY2UpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZUl0ZW0oaXRlbTogSXRlbSk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbVNvdXJjZSBvZiBpdGVtLnNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU291cmNlKGl0ZW1Tb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWx0ZXJzLnB1c2goaXNBdmFpbGFibGVJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHsgLy9taXNjIGZpbHRlclxuICAgICAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgICAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IHBhcnNlSW50KGxldmVscmFuZ2UudmFsdWUpO1xuICAgICAgICBmaWx0ZXJzLnB1c2goKGl0ZW06IEl0ZW0pID0+IGl0ZW0ubGV2ZWwgPD0gbWF4TGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1fbmFtZSA9IG5hbWVmaWx0ZXIudmFsdWU7XG4gICAgICAgIGlmIChpdGVtX25hbWUpIHtcbiAgICAgICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+IGl0ZW0ubmFtZV9lbi50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGl0ZW1fbmFtZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB7IC8vaWQgZmlsdGVyXG4gICAgICAgIGZpbHRlcnMucHVzaChpdGVtID0+ICFleGNsdWRlZF9pdGVtX2lkcy5oYXMoaXRlbS5pZCkpO1xuICAgICAgICBjb25zdCBpdGVtRmlsdGVyTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXRlbUZpbHRlclwiKTtcbiAgICAgICAgaWYgKCEoaXRlbUZpbHRlckxpc3QgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcblxuICAgICAgICB9XG4gICAgICAgIGl0ZW1GaWx0ZXJMaXN0LnJlcGxhY2VDaGlsZHJlbigpO1xuICAgICAgICBpZiAoZXhjbHVkZWRfaXRlbV9pZHMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgaXRlbUZpbHRlckxpc3QuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICAgICAgXCJwXCIsXG4gICAgICAgICAgICAgICAgeyBjbGFzczogXCJlbXB0eS1ub3RlXCIgfSxcbiAgICAgICAgICAgICAgICBcIk5vIGV4Y2x1ZGVkIGl0ZW1zXCIsXG4gICAgICAgICAgICBdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIGV4Y2x1ZGVkX2l0ZW1faWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zLmdldChpZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtRmlsdGVyTGlzdC5hcHBlbmRDaGlsZChjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzczogXCJleGNsdWRlZC1pdGVtXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzOiBcImV4Y2x1ZGVkLWl0ZW1fX25hbWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lX2VuLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVIVE1MKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwiaXRlbV9yZW1vdmFsX3JlbW92YWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtaXRlbV9pbmRleFwiOiBgJHtpZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiBgUmVzdG9yZSAke2l0ZW0ubmFtZV9lbn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZXN0b3JlXCIsXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgY29uc3QgY29tcGFyYXRvcnM6ICgobGhzOiBJdGVtLCByaHM6IEl0ZW0pID0+IG51bWJlcilbXSA9IFtdO1xuXG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9saXN0XCIpO1xuICAgIGlmICghKHByaW9yaXR5TGlzdCBpbnN0YW5jZW9mIEhUTUxPTGlzdEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHlTdGF0cyA9IEFycmF5XG4gICAgICAgIC5mcm9tKHByaW9yaXR5TGlzdC5jaGlsZE5vZGVzKVxuICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIW5vZGUudGV4dENvbnRlbnQ/LmluY2x1ZGVzKCdcXG4nKSlcbiAgICAgICAgLmZpbHRlcihub2RlID0+IG5vZGUudGV4dENvbnRlbnQpXG4gICAgICAgIC5tYXAobm9kZSA9PiBub2RlLnRleHRDb250ZW50ISk7XG4gICAge1xuICAgICAgICBmb3IgKGNvbnN0IHN0YXQgb2YgcHJpb3JpdHlTdGF0cykge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0LnNwbGl0KFwiK1wiKTtcbiAgICAgICAgICAgIGNvbXBhcmF0b3JzLnB1c2goKGxoczogSXRlbSwgcmhzOiBJdGVtKSA9PiBjb21wYXJlKFxuICAgICAgICAgICAgICAgIHN0YXRzLm1hcChzdGF0ID0+IGxocy5zdGF0RnJvbVN0cmluZyhzdGF0KSkucmVkdWNlKChuLCBtKSA9PiBuICsgbSksXG4gICAgICAgICAgICAgICAgc3RhdHMubWFwKHN0YXQgPT4gcmhzLnN0YXRGcm9tU3RyaW5nKHN0YXQpKS5yZWR1Y2UoKG4sIG0pID0+IG4gKyBtKVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9ICgoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZ2V0SXRlbVR5cGVTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgY2FzZSAncGFydHNTZWxlY3Rvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdHNUYWJsZShcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9PiBmaWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBmaWx0ZXIoaXRlbSkpLFxuICAgICAgICAgICAgICAgICAgICBpdGVtU291cmNlID0+IHNvdXJjZUZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtU291cmNlKSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtcywgaXRlbSkgPT4gc2VsZWN0QnlQcmlvcml0eShpdGVtcywgaXRlbSwgY29tcGFyYXRvcnMpLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eVN0YXRzLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENoYXJhY3RlclxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjYXNlICdnYWNoYVNlbGVjdG9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0R2FjaGFUYWJsZShpdGVtID0+IGZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGZpbHRlcihpdGVtKSksIHNlbGVjdGVkQ2hhcmFjdGVyKTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNcIik7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHRSb3dzID0gdGFibGUudEJvZGllc1swXT8ucm93cy5sZW5ndGggPz8gTWF0aC5tYXgoMCwgdGFibGUucm93cy5sZW5ndGggLSAxKTtcbiAgICB0YXJnZXQuaW5uZXJUZXh0ID0gXCJcIjtcbiAgICBpZiAocmVzdWx0Um93cyA9PT0gMCkge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoY3JlYXRlSFRNTChbXG4gICAgICAgICAgICBcInBcIixcbiAgICAgICAgICAgIHsgY2xhc3M6IFwicmVzdWx0cy1lbXB0eVwiLCByb2xlOiBcInN0YXR1c1wiIH0sXG4gICAgICAgICAgICBcIk5vIGl0ZW1zIG1hdGNoIHRoZXNlIGZpbHRlcnMuXCIsXG4gICAgICAgIF0pKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHNTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNTdGF0dXNcIik7XG4gICAgaWYgKHJlc3VsdHNTdGF0dXMpIHtcbiAgICAgICAgcmVzdWx0c1N0YXR1cy50ZXh0Q29udGVudCA9IHJlc3VsdFJvd3MgPT09IDBcbiAgICAgICAgICAgID8gXCJObyBpdGVtcyBtYXRjaCB0aGVzZSBmaWx0ZXJzLlwiXG4gICAgICAgICAgICA6IGAke3Jlc3VsdFJvd3N9IG1hdGNoaW5nICR7cmVzdWx0Um93cyA9PT0gMSA/IFwiaXRlbVwiIDogXCJpdGVtc1wifWA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRNYXhMZXZlbERpc3BsYXlVcGRhdGUoKSB7XG4gICAgY29uc3QgbGV2ZWxEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbERpc3BsYXlcIik7XG4gICAgaWYgKCEobGV2ZWxEaXNwbGF5IGluc3RhbmNlb2YgSFRNTExhYmVsRWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBsZXZlbHJhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbHJhbmdlXCIpO1xuICAgIGlmICghKGxldmVscmFuZ2UgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGxldmVscmFuZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgbGV2ZWxEaXNwbGF5LnRleHRDb250ZW50ID0gYE1heCBsZXZlbCByZXF1aXJlbWVudDogJHtsZXZlbHJhbmdlLnZhbHVlfWA7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0RGlzcGxheVVwZGF0ZXMoKSB7XG4gICAgc2V0TWF4TGV2ZWxEaXNwbGF5VXBkYXRlKCk7XG4gICAgY29uc3QgbmFtZWZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpbHRlclwiKTtcbiAgICBpZiAoIShuYW1lZmlsdGVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcbiAgICB9XG4gICAgbmFtZWZpbHRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdXBkYXRlUmVzdWx0cyk7XG5cbiAgICBjb25zdCBlbmNoYW50VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNoYW50VG9nZ2xlXCIpO1xuICAgIGlmICghKGVuY2hhbnRUb2dnbGUgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlfbGlzdFwiKTtcbiAgICBpZiAoIShwcmlvcml0eUxpc3QgaW5zdGFuY2VvZiBIVE1MT0xpc3RFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIGVuY2hhbnRUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJpb3JpdHlTdGF0Tm9kZXMgPSBBcnJheVxuICAgICAgICAgICAgLmZyb20ocHJpb3JpdHlMaXN0LmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIW5vZGUudGV4dENvbnRlbnQ/LmluY2x1ZGVzKCdcXG4nKSlcbiAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnRleHRDb250ZW50KTtcblxuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJpb3JpdHlTdGF0Tm9kZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZW5jaGFudFRvZ2dsZS5jaGVja2VkID8gL14oKD86U3RyKXwoPzpTdGEpfCg/OkRleCl8KD86V2lsbCkpJC8gOiAvXk1heCAoKD86U3RyKXwoPzpTdGEpfCg/OkRleCl8KD86V2lsbCkpJC87XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlciA9IGVuY2hhbnRUb2dnbGUuY2hlY2tlZCA/IFwiTWF4ICQxXCIgOiBcIiQxXCI7XG4gICAgICAgICAgICBub2RlLnRleHRDb250ZW50ID0gbm9kZS50ZXh0Q29udGVudCEuc3BsaXQoXCIrXCIpLm1hcChzID0+IHMucmVwbGFjZShyZWdleCwgcmVwbGFjZXIpKS5qb2luKFwiK1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG59XG5cbnNldERpc3BsYXlVcGRhdGVzKCk7XG5cbmZ1bmN0aW9uIHNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCkge1xuICAgIGNvbnN0IGZpbHRlclRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyVG9nZ2xlXCIpO1xuICAgIGNvbnN0IGNsb3NlRmlsdGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2VGaWx0ZXJzXCIpO1xuICAgIGNvbnN0IGZpbHRlclBhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250cm9sUmFpbFwiKTtcbiAgICBjb25zdCBmaWx0ZXJCYWNrZHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsdGVyQmFja2Ryb3BcIik7XG4gICAgaWYgKCEoZmlsdGVyVG9nZ2xlIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoY2xvc2VGaWx0ZXJzIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpXG4gICAgICAgIHx8ICEoZmlsdGVyUGFuZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICAgICAgfHwgIShmaWx0ZXJCYWNrZHJvcCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvZ2dsZUJ1dHRvbiA9IGZpbHRlclRvZ2dsZTtcbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGNsb3NlRmlsdGVycztcbiAgICBjb25zdCBwYW5lbCA9IGZpbHRlclBhbmVsO1xuICAgIGNvbnN0IGJhY2tkcm9wQnV0dG9uID0gZmlsdGVyQmFja2Ryb3A7XG5cbiAgICBmdW5jdGlvbiBzZXRPcGVuKG9wZW46IGJvb2xlYW4pIHtcbiAgICAgICAgcGFuZWwuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIGAke29wZW59YCk7XG4gICAgICAgIGJhY2tkcm9wQnV0dG9uLmhpZGRlbiA9ICFvcGVuO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJmaWx0ZXJzLW9wZW5cIiwgb3Blbik7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmlsdGVyXCIpO1xuICAgICAgICAgICAgaWYgKG5hbWVGaWx0ZXIgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9jdXNBZnRlck9wZW4gPSAoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucHJvcGVydHlOYW1lICE9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGFuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgZm9jdXNBZnRlck9wZW4pO1xuICAgICAgICAgICAgICAgICAgICBuYW1lRmlsdGVyLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBmb2N1c0FmdGVyT3Blbik7XG4gICAgICAgICAgICAgICAgbmFtZUZpbHRlci5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4odHJ1ZSkpO1xuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRPcGVuKGZhbHNlKSk7XG4gICAgYmFja2Ryb3BCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldE9wZW4oZmFsc2UpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFwYW5lbC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1vcGVuXCIpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmtleSAhPT0gXCJUYWJcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gQXJyYXkuZnJvbShwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcbiAgICAgICAgICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHN1bW1hcnksIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKSdcbiAgICAgICAgKSkuZmlsdGVyKGVsZW1lbnQgPT4gZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA+IDApO1xuICAgICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbMF07XG4gICAgICAgIGNvbnN0IGxhc3RFbGVtZW50ID0gZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChldmVudC5zaGlmdEtleSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBmaXJzdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsYXN0RWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFldmVudC5zaGlmdEtleVxuICAgICAgICAgICAgJiYgKCFwYW5lbC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB8fCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBsYXN0RWxlbWVudCkpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1pbi13aWR0aDogODgwcHgpXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKHsgbWF0Y2hlcyB9KSA9PiB7XG4gICAgICAgIGlmIChtYXRjaGVzICYmIHBhbmVsLmNsYXNzTGlzdC5jb250YWlucyhcImlzLW9wZW5cIikpIHtcbiAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbnNldE1vYmlsZUZpbHRlckNvbnRyb2xzKCk7XG5cbmZ1bmN0aW9uIHNldFJlc2V0RmlsdGVyQ29udHJvbCgpIHtcbiAgICBjb25zdCByZXNldEZpbHRlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0RmlsdGVyc1wiKTtcbiAgICBjb25zdCByZWZpbmVtZW50U3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWZpbmVtZW50U3RhdHVzXCIpO1xuICAgIGlmICghKHJlc2V0RmlsdGVycyBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50KVxuICAgICAgICB8fCAhKHJlZmluZW1lbnRTdGF0dXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNldEZpbHRlcnMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgcmVmaW5lbWVudFN0YXR1cy50ZXh0Q29udGVudCA9IFwiUmVzZXR0aW5nIGZpbHRlcnPigKZcIjtcbiAgICAgICAgVmFyaWFibGVfc3RvcmFnZS5jbGVhcl9hbGwoKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xufVxuXG5zZXRSZXNldEZpbHRlckNvbnRyb2woKTtcblxuZnVuY3Rpb24gc2V0SXRlbVR5cGVTZWxlY3RvckZ1bmN0aW9uYWxpdHkoKSB7XG4gICAgY29uc3QgcHJpb3JpdHlfZ3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5X2dyb3VwXCIpO1xuICAgIGlmICghKHByaW9yaXR5X2dyb3VwIGluc3RhbmNlb2YgSFRNTEZpZWxkU2V0RWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0c1NlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c1NlbGVjdG9yXCIpO1xuICAgIGlmICghKHBhcnRzU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXJ0c0ZpbHRlclwiKTtcbiAgICBpZiAoIShwYXJ0c0ZpbHRlciBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBhcnRzU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBnYWNoYVNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWNoYVNlbGVjdG9yXCIpO1xuICAgIGlmICghKGdhY2hhU2VsZWN0b3IgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdhY2hhU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaW9yaXR5X2dyb3VwLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgcGFydHNGaWx0ZXIuY2xhc3NMaXN0LmFkZChcImRpc2FibGVkXCIpO1xuICAgICAgICB1cGRhdGVSZXN1bHRzKCk7XG4gICAgfSk7XG5cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHRzR3JvdXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfZ3JvdXBcIik7XG4gICAgY29uc3QgcmVzdWx0c1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c1N0YXR1c1wiKTtcbiAgICBjb25zdCBsb2FkaW5nTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XG4gICAgY29uc3QgbG9hZGluZ0NvcHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctc3RhdGVfX2NvcHkgc3BhblwiKTtcbiAgICBpZiAoIShyZXN1bHRzU3RhdHVzIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgICAgIHx8ICEobG9hZGluZ0xhYmVsIGluc3RhbmNlb2YgSFRNTExhYmVsRWxlbWVudClcbiAgICAgICAgfHwgIShsb2FkaW5nQ29weSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICB0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG4gICAgfVxuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwidHJ1ZVwiKTtcbiAgICBzZXRJdGVtVHlwZVNlbGVjdG9yRnVuY3Rpb25hbGl0eSgpO1xuICAgIHJlc3RvcmVTZWxlY3Rpb24oKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkb3dubG9hZEl0ZW1zKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJlc3VsdHNTdGF0dXMudGV4dENvbnRlbnQgPSBcIkl0ZW0gZGF0YSB1bmF2YWlsYWJsZVwiO1xuICAgICAgICBsb2FkaW5nTGFiZWwudGV4dENvbnRlbnQgPSBcIkNvdWxkIG5vdCBsb2FkIGVxdWlwbWVudCBkYXRhXCI7XG4gICAgICAgIGxvYWRpbmdDb3B5LnRleHRDb250ZW50ID0gXCJDaGVjayB0aGUgcHJldmlldyBzZXJ2ZXIgY29ubmVjdGlvbiwgdGhlbiByZWxvYWQgdGhpcyBwYWdlLlwiO1xuICAgICAgICByZXN1bHRzR3JvdXA/LnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcImZhbHNlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2hvd19hZnRlcl9sb2FkXCIpKSB7XG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJoaWRlX2FmdGVyX2xvYWRcIikpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGV2ZWxyYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGV2ZWxyYW5nZVwiKTtcbiAgICBpZiAoIShsZXZlbHJhbmdlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpIHtcbiAgICAgICAgdGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuICAgIH1cbiAgICBjb25zdCBtYXhMZXZlbCA9IGdldE1heEl0ZW1MZXZlbCgpO1xuICAgIGxldmVscmFuZ2UudmFsdWUgPSBgJHtNYXRoLm1pbihwYXJzZUludChsZXZlbHJhbmdlLnZhbHVlKSwgbWF4TGV2ZWwpfWA7XG4gICAgbGV2ZWxyYW5nZS5tYXggPSBgJHttYXhMZXZlbH1gO1xuICAgIGxldmVscmFuZ2UuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XG4gICAgdXBkYXRlUmVzdWx0cygpO1xuICAgIHJlc3VsdHNHcm91cD8uc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIFwiZmFsc2VcIik7XG4gICAgY29uc3Qgc29ydF9oZWxwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eV9sZWdlbmRcIik7XG4gICAgaWYgKHNvcnRfaGVscCBpbnN0YW5jZW9mIEhUTUxMZWdlbmRFbGVtZW50KSB7XG4gICAgICAgIHNvcnRfaGVscC5hcHBlbmRDaGlsZChjcmVhdGVQb3B1cExpbmsoXCIgKD8pXCIsIGNyZWF0ZUhUTUwoW1wicFwiLFxuICAgICAgICAgICAgXCJSZW9yZGVyIHRoZSBzdGF0cyB0byB5b3VyIGxpa2luZyB0byBhZmZlY3QgdGhlIHJlc3VsdHMgbGlzdC5cIiwgW1wiYnJcIl0sXG4gICAgICAgICAgICBcIkRyYWcgYSBzdGF0IHVwIG9yIGRvd24gdG8gY2hhbmdlIGl0cyBpbXBvcnRhbmNlIChmb3IgZXhhbXBsZSBkcmFnIExvYiBhYm92ZSBDaGFyZ2UpLlwiLCBbXCJiclwiXSxcbiAgICAgICAgICAgIFwiRHJhZyBhIHN0YXQgb250byBhbm90aGVyIHRvIGNvbWJpbmUgdGhlbSAoZm9yIGV4YW1wbGUgU3RyIG9udG8gRGV4LCB0aGUgcmVzdWx0cyB3aWxsIGRpc3BsYXkgU3RyK0RleCkuXCIsIFtcImJyXCJdLFxuICAgICAgICAgICAgXCJEcmFnIGEgY29tYmluZWQgc3RhdCBvbnRvIGl0c2VsZiB0byBzZXBhcmF0ZSB0aGVtLlwiXSkpKTtcbiAgICB9XG59KTtcblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NOYW1lID09PSBcIml0ZW1fcmVtb3ZhbFwiKSB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmFkZChwYXJzZUludChldmVudC50YXJnZXQuZGF0YXNldC5pdGVtX2luZGV4KSk7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSA9PT0gXCJpdGVtX3JlbW92YWxfcmVtb3ZhbFwiKSB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0LmRhdGFzZXQuaXRlbV9pbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1ZGVkX2l0ZW1faWRzLmRlbGV0ZShwYXJzZUludChldmVudC50YXJnZXQuZGF0YXNldC5pdGVtX2luZGV4KSk7XG4gICAgICAgIHVwZGF0ZVJlc3VsdHMoKTtcbiAgICB9XG59KTtcbiIsImV4cG9ydCB0eXBlIFByaW9yaXR5Q29tcGFyYXRvcjxUPiA9IChsaHM6IFQsIHJoczogVCkgPT4gbnVtYmVyO1xuXG4vKipcbiAqIEluc2VydCBgY2FuZGlkYXRlYCBpbnRvIGEgYmVzdC1maXJzdCByYW5raW5nLlxuICogSGlnaGVyIGNvbXBhcmF0b3IgdmFsdWVzIG1lYW4gdGhlIGxlZnQtaGFuZCBpdGVtIHJhbmtzIGJldHRlci5cbiAqIEV2ZXJ5IGNhbmRpZGF0ZSBpcyByZXRhaW5lZCBzbyB0aGUgVUkgY2FuIHNob3cgdGhlIGZ1bGwgZmlsdGVyZWQgaW52ZW50b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0QnlQcmlvcml0eTxUPihcbiAgICBjdXJyZW50OiBUW10sXG4gICAgY2FuZGlkYXRlOiBULFxuICAgIGNvbXBhcmF0b3JzOiByZWFkb25seSBQcmlvcml0eUNvbXBhcmF0b3I8VD5bXSxcbik6IFRbXSB7XG4gICAgaWYgKGN1cnJlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbY2FuZGlkYXRlXTtcbiAgICB9XG5cbiAgICBsZXQgaW5zZXJ0QXQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY3VycmVudC5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgbGV0IGRlY2lkZWQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbXBhcmF0b3Igb2YgY29tcGFyYXRvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBhcmF0b3IoY3VycmVudFtpbmRleF0sIGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVjaWRlZCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVjaWRlZCA8IDApIHtcbiAgICAgICAgICAgIC8vIGN1cnJlbnRbaW5kZXhdIGlzIHdvcnNlIHRoYW4gY2FuZGlkYXRlOiBpbnNlcnQgYmVmb3JlIGl0LlxuICAgICAgICAgICAgaW5zZXJ0QXQgPSBpbmRleDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRlY2lkZWQgPiAwOiBjdXJyZW50IGl0ZW0gaXMgYmV0dGVyOyBrZWVwIHNjYW5uaW5nLlxuICAgICAgICAvLyBkZWNpZGVkID09PSAwOiBleGFjdCB0aWU7IGtlZXAgc2Nhbm5pbmcgc28gdGllcyBzdGF5IHN0YWJsZS9GSUZPLlxuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAgIC4uLmN1cnJlbnQuc2xpY2UoMCwgaW5zZXJ0QXQpLFxuICAgICAgICBjYW5kaWRhdGUsXG4gICAgICAgIC4uLmN1cnJlbnQuc2xpY2UoaW5zZXJ0QXQpLFxuICAgIF07XG59XG4iLCJleHBvcnQgdHlwZSBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzID0gbnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbjtcblxudHlwZSBTdG9yYWdlX3ZhbHVlID0gYCR7XCJzXCIgfCBcIm5cIiB8IFwiYlwifSR7c3RyaW5nfWA7XG5cbmZ1bmN0aW9uIHZhcmlhYmxlX3RvX3N0cmluZyh2YWx1ZTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyk6IFN0b3JhZ2VfdmFsdWUge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBgcyR7dmFsdWV9YCBhcyBjb25zdDtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgcmV0dXJuIGBuJHt2YWx1ZX1gIGFzIGNvbnN0O1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID8gXCJiMVwiIDogXCJiMFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RyaW5nX3RvX3ZhcmlhYmxlKHZ2OiBTdG9yYWdlX3ZhbHVlKTogVmFyaWFibGVfc3RvcmFnZV90eXBlcyB7XG4gICAgY29uc3QgcHJlZml4ID0gdnZbMF07XG4gICAgY29uc3QgdmFsdWUgPSB2di5zdWJzdHJpbmcoMSk7XG4gICAgc3dpdGNoIChwcmVmaXgpIHtcbiAgICAgICAgY2FzZSAncyc6IC8vc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIGNhc2UgJ24nOiAvL251bWJlclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICBjYXNlICdiJzogLy9ib29sZWFuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgPT09IFwiMVwiID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICB0aHJvdyBgaW52YWxpZCB2YWx1ZTogJHt2dn1gO1xufVxuXG5mdW5jdGlvbiBpc19zdG9yYWdlX3ZhbHVlKGtleTogc3RyaW5nKToga2V5IGlzIFN0b3JhZ2VfdmFsdWUge1xuICAgIHJldHVybiBrZXkubGVuZ3RoID49IDEgJiYgXCJzbmJcIi5pbmNsdWRlcyhrZXlbMF0pO1xufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFibGVfc3RvcmFnZSB7XG4gICAgc3RhdGljIGdldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7dmFyaWFibGVfbmFtZX1gKTtcbiAgICAgICAgaWYgKHR5cGVvZiBzdG9yZWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzX3N0b3JhZ2VfdmFsdWUoc3RvcmVkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdfdG9fdmFyaWFibGUoc3RvcmVkKTtcbiAgICB9XG4gICAgc3RhdGljIHNldF92YXJpYWJsZSh2YXJpYWJsZV9uYW1lOiBzdHJpbmcsIHZhbHVlOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCwgdmFyaWFibGVfdG9fc3RyaW5nKHZhbHVlKSk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWxldGVfdmFyaWFibGUodmFyaWFibGVfbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke3ZhcmlhYmxlX25hbWV9YCk7XG4gICAgfVxuICAgIHN0YXRpYyBjbGVhcl9hbGwoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IHZhcmlhYmxlcygpIHtcbiAgICAgICAgbGV0IHJlc3VsdDogeyBba2V5OiBzdHJpbmddOiBWYXJpYWJsZV9zdG9yYWdlX3R5cGVzIH0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc19zdG9yYWdlX3ZhbHVlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBzdHJpbmdfdG9fdmFyaWFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufSJdfQ==
