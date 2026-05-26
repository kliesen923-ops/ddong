const fs = require("fs");
const path = require("path");
const { jobs, towns, items, huntingGrounds, monsters, dungeons } = require("./gameData");

const DB_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DB_DIR, "db.json");

function loadDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    return { players: {}, battles: {}, parties: {}, nextPartyId: 1 };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function createPlayer(userId) {
  return {
    userId,
    name: `모험가${String(userId).slice(-4)}`,
    job: "novice",
    level: 1,
    exp: 0,
    gold: 50,
    statPoints: 0,
    stats: { str: 5, dex: 5, int: 5, vit: 5 },
    hp: 999,
    mp: 999,
    town: "start",
    inventory: ["rusty_sword", "cloth_armor"],
    equipment: { weapon: "rusty_sword", armor: "cloth_armor" },
    partyId: null
  };
}

function getPlayer(db, userId) {
  if (!db.players[userId]) db.players[userId] = createPlayer(userId);
  return db.players[userId];
}

function expToNext(level) {
  return 80 + level * level * 25;
}

function itemStats(itemId) {
  return items[itemId] || {};
}

function calcStats(player) {
  const job = jobs[player.job];
  const weapon = itemStats(player.equipment.weapon);
  const armor = itemStats(player.equipment.armor);
  const str = player.stats.str + (job.statBonus.str || 0) + (weapon.str || 0) + (armor.str || 0);
  const dex = player.stats.dex + (job.statBonus.dex || 0) + (weapon.dex || 0) + (armor.dex || 0);
  const int = player.stats.int + (job.statBonus.int || 0) + (weapon.int || 0) + (armor.int || 0);
  const vit = player.stats.vit + (job.statBonus.vit || 0) + (weapon.vit || 0) + (armor.vit || 0);
  const maxHp = 80 + vit * 8 + player.level * job.hpPerLevel;
  const maxMp = 20 + int * 4 + player.level * job.mpPerLevel;
  return {
    str,
    dex,
    int,
    vit,
    maxHp,
    maxMp,
    atk: 4 + str * 2 + dex + (weapon.atk || 0) + (weapon.magic || 0),
    def: Math.floor(vit * 1.4) + (armor.def || 0)
  };
}

function healToBounds(player) {
  const stats = calcStats(player);
  player.hp = Math.min(Math.max(player.hp, 0), stats.maxHp);
  player.mp = Math.min(Math.max(player.mp, 0), stats.maxMp);
}

function findItemId(query) {
  const normalized = normalizeName(query);
  return Object.keys(items).find((id) => id === query || normalizeName(items[id].name) === normalized);
}

function findTownId(query) {
  const normalized = normalizeName(query);
  return Object.keys(towns).find((id) => id === query || normalizeName(towns[id].name) === normalized);
}

function normalizeName(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function objectParticle(name) {
  const last = String(name).charCodeAt(String(name).length - 1);
  if (last < 0xac00 || last > 0xd7a3) return "을";
  return (last - 0xac00) % 28 === 0 ? "를" : "을";
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function addRewards(player, exp, gold) {
  const lines = [`경험치 ${exp}, 골드 ${gold}을 획득했습니다.`];
  player.exp += exp;
  player.gold += gold;

  while (player.exp >= expToNext(player.level)) {
    player.exp -= expToNext(player.level);
    player.level += 1;
    player.statPoints += 3;
    const stats = calcStats(player);
    player.hp = stats.maxHp;
    player.mp = stats.maxMp;
    lines.push(`레벨이 ${player.level}이 되었습니다. 스탯 포인트 3을 얻었습니다.`);
    if (player.level === 5 && player.job === "novice") {
      lines.push("전직이 가능합니다. 전직 전사 / 전직 마법사 / 전직 궁수 / 전직 도적");
    }
  }

  return lines;
}

function status(player) {
  healToBounds(player);
  const s = calcStats(player);
  return [
    `[${jobs[player.job].name} Lv.${player.level}]`,
    `위치: ${towns[player.town].name}`,
    `HP ${player.hp}/${s.maxHp} / MP ${player.mp}/${s.maxMp}`,
    `EXP ${player.exp}/${expToNext(player.level)} / 골드 ${player.gold}`,
    `공격 ${s.atk} / 방어 ${s.def}`,
    `힘 ${s.str} / 민첩 ${s.dex} / 지능 ${s.int} / 체력 ${s.vit}`,
    `남은 스탯 포인트: ${player.statPoints}`,
    "",
    "장비",
    `무기: ${items[player.equipment.weapon]?.name || "없음"}`,
    `방어구: ${items[player.equipment.armor]?.name || "없음"}`
  ].join("\n");
}

function help() {
  return [
    "명령어",
    "상태, 마을, 이동 [마을명], 사냥",
    "공격, 방어, 스킬, 도망",
    "상점, 구매 [아이템명], 인벤토리, 장착 [아이템명]",
    "스탯 [힘/민첩/지능/체력] [수치], 전직 [전사/마법사/궁수/도적]",
    "던전생성, 던전참가 [번호], 준비"
  ].join("\n");
}

function startHunt(db, player, userId) {
  if (db.battles[userId]) return "이미 전투 중입니다. 공격 / 방어 / 스킬 / 도망 중 하나를 입력하세요.";
  healToBounds(player);
  if (player.hp <= 0) return "HP가 부족합니다. 마을에서 휴식 후 다시 시도하세요. 명령어: 휴식";

  const ground = huntingGrounds[towns[player.town].huntingGround];
  const monsterId = pickRandom(ground.monsters);
  const monster = { ...monsters[monsterId], id: monsterId };
  db.battles[userId] = { type: "solo", monster, monsterHp: monster.hp, turn: 1 };

  return [
    `${ground.name}에서 ${monster.name}${objectParticle(monster.name)} 만났습니다.`,
    "",
    `[전투 1턴]`,
    `나 HP ${player.hp}/${calcStats(player).maxHp}`,
    `${monster.name} HP ${monster.hp}/${monster.hp}`,
    "",
    "행동: 공격 / 방어 / 스킬 / 도망"
  ].join("\n");
}

function playerDamage(player, multiplier = 1) {
  const s = calcStats(player);
  const spread = Math.floor(Math.random() * 7) - 3;
  return Math.max(1, Math.floor((s.atk + spread) * multiplier));
}

function monsterDamage(player, monster, guarding) {
  const s = calcStats(player);
  const spread = Math.floor(Math.random() * 5) - 2;
  const raw = Math.max(1, monster.atk + spread - Math.floor(s.def * 0.55));
  return guarding ? Math.ceil(raw * 0.45) : raw;
}

function doBattleTurn(db, player, userId, action) {
  const battle = db.battles[userId];
  if (!battle) return "진행 중인 전투가 없습니다. 사냥을 입력하면 전투를 시작합니다.";
  const monster = battle.monster;
  const lines = [`[전투 ${battle.turn}턴 결과]`];

  if (action === "도망") {
    if (Math.random() < 0.65) {
      delete db.battles[userId];
      return "도망쳤습니다. 전투가 종료되었습니다.";
    }
    lines.push("도망에 실패했습니다.");
  }

  let guarding = false;
  if (action === "방어") {
    guarding = true;
    lines.push("방어 태세를 취했습니다.");
  } else if (action === "스킬") {
    const cost = 8;
    if (player.mp < cost) {
      lines.push("MP가 부족해 기본 공격을 했습니다.");
      const dmg = Math.max(1, playerDamage(player) - monster.def);
      battle.monsterHp -= dmg;
      lines.push(`${monster.name}에게 ${dmg} 피해를 입혔습니다.`);
    } else {
      player.mp -= cost;
      const dmg = Math.max(1, playerDamage(player, 1.65) - monster.def);
      battle.monsterHp -= dmg;
      lines.push(`스킬을 사용해 ${monster.name}에게 ${dmg} 피해를 입혔습니다.`);
    }
  } else if (action === "공격") {
    const dmg = Math.max(1, playerDamage(player) - monster.def);
    battle.monsterHp -= dmg;
    lines.push(`${monster.name}에게 ${dmg} 피해를 입혔습니다.`);
  } else {
    return "전투 행동을 이해하지 못했습니다. 공격 / 방어 / 스킬 / 도망 중 하나를 입력하세요.";
  }

  if (battle.monsterHp <= 0) {
    lines.push(`${monster.name}을 처치했습니다.`);
    lines.push(...addRewards(player, monster.exp, monster.gold));
    delete db.battles[userId];
    return lines.join("\n");
  }

  const taken = monsterDamage(player, monster, guarding);
  player.hp -= taken;
  lines.push(`${monster.name}의 반격으로 ${taken} 피해를 받았습니다.`);

  if (player.hp <= 0) {
    player.hp = 1;
    player.gold = Math.max(0, player.gold - Math.ceil(monster.gold / 2));
    delete db.battles[userId];
    lines.push("쓰러졌습니다. 마을로 귀환했고 일부 골드를 잃었습니다.");
    return lines.join("\n");
  }

  battle.turn += 1;
  lines.push("");
  lines.push(`나 HP ${player.hp}/${calcStats(player).maxHp} / MP ${player.mp}/${calcStats(player).maxMp}`);
  lines.push(`${monster.name} HP ${Math.max(0, battle.monsterHp)}/${monster.hp}`);
  lines.push("다음 행동: 공격 / 방어 / 스킬 / 도망");
  return lines.join("\n");
}

function showTown(player) {
  const town = towns[player.town];
  return [
    `[${town.name}]`,
    town.description,
    `이동 가능: ${town.connections.map((id) => towns[id].name).join(", ")}`,
    `사냥터: ${huntingGrounds[town.huntingGround].name}`,
    "상점 목록은 상점 입력"
  ].join("\n");
}

function moveTown(player, townQuery) {
  const target = findTownId(townQuery);
  if (!target) return "그 마을을 찾을 수 없습니다. 마을 명령어로 이동 가능한 마을을 확인하세요.";
  if (!towns[player.town].connections.includes(target)) return `${towns[player.town].name}에서 ${towns[target].name}로 바로 이동할 수 없습니다.`;
  player.town = target;
  const s = calcStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  return `${towns[target].name}로 이동했습니다. 여관에서 회복했습니다.\n\n${showTown(player)}`;
}

function showShop(player) {
  const town = towns[player.town];
  return [
    `[${town.name} 상점]`,
    ...town.shop.map((id) => {
      const item = items[id];
      const stats = [`가격 ${item.price}G`, item.atk ? `공격+${item.atk}` : "", item.def ? `방어+${item.def}` : "", item.magic ? `마력+${item.magic}` : ""].filter(Boolean);
      return `${item.name} - ${stats.join(" / ")}`;
    }),
    "",
    "구매 [아이템명]으로 구매합니다."
  ].join("\n");
}

function buyItem(player, itemQuery) {
  const itemId = findItemId(itemQuery);
  if (!itemId) return "그 아이템을 찾을 수 없습니다.";
  if (!towns[player.town].shop.includes(itemId)) return "현재 마을 상점에서는 판매하지 않습니다.";
  const item = items[itemId];
  if (player.gold < item.price) return `골드가 부족합니다. 필요 골드: ${item.price}`;
  player.gold -= item.price;
  player.inventory.push(itemId);
  return `${item.name}을 구매했습니다. 남은 골드: ${player.gold}`;
}

function inventory(player) {
  const counts = {};
  for (const itemId of player.inventory) counts[itemId] = (counts[itemId] || 0) + 1;
  const lines = Object.entries(counts).map(([id, count]) => `${items[id].name}${count > 1 ? ` x${count}` : ""}`);
  return [`[인벤토리]`, ...(lines.length ? lines : ["비어 있습니다."]), "", "장착 [아이템명]으로 장착합니다."].join("\n");
}

function equip(player, itemQuery) {
  const itemId = findItemId(itemQuery);
  if (!itemId || !player.inventory.includes(itemId)) return "인벤토리에 그 아이템이 없습니다.";
  const item = items[itemId];
  if (!["weapon", "armor"].includes(item.type)) return "장착할 수 없는 아이템입니다.";
  player.equipment[item.type] = itemId;
  healToBounds(player);
  return `${item.name}을 장착했습니다.\n\n${status(player)}`;
}

function addStat(player, statName, amountText) {
  const statMap = { 힘: "str", 민첩: "dex", 지능: "int", 체력: "vit", str: "str", dex: "dex", int: "int", vit: "vit" };
  const key = statMap[statName];
  const amount = Number(amountText || 1);
  if (!key || !Number.isInteger(amount) || amount <= 0) return "사용법: 스탯 힘 1";
  if (player.statPoints < amount) return `스탯 포인트가 부족합니다. 남은 포인트: ${player.statPoints}`;
  player.stats[key] += amount;
  player.statPoints -= amount;
  if (key === "vit") player.hp += amount * 8;
  if (key === "int") player.mp += amount * 4;
  healToBounds(player);
  return `스탯을 올렸습니다.\n\n${status(player)}`;
}

function changeJob(player, jobName) {
  const jobMap = { 전사: "warrior", 마법사: "mage", 궁수: "archer", 도적: "rogue" };
  const nextJob = jobMap[jobName] || jobName;
  if (!jobs[nextJob] || nextJob === "novice") return "전직 가능한 직업: 전사, 마법사, 궁수, 도적";
  if (player.job !== "novice") return "이미 전직했습니다.";
  if (player.level < jobs[nextJob].levelRequired) return `Lv.${jobs[nextJob].levelRequired}부터 전직할 수 있습니다.`;
  player.job = nextJob;
  const s = calcStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  return `${jobs[nextJob].name}로 전직했습니다.\n\n${status(player)}`;
}

function createDungeonParty(db, player, userId) {
  if (player.partyId) return `이미 파티에 있습니다. 파티 번호: ${player.partyId}`;
  const dungeon = dungeons.goblin_den;
  if (player.level < dungeon.minLevel) return `${dungeon.name}은 Lv.${dungeon.minLevel}부터 입장할 수 있습니다.`;
  const id = String(db.nextPartyId++);
  db.parties[id] = {
    id,
    dungeonId: "goblin_den",
    leader: userId,
    members: [userId],
    ready: {},
    started: false,
    bossHp: dungeon.boss.hp,
    turn: 1,
    actions: {}
  };
  player.partyId = id;
  return `던전 파티를 만들었습니다.\n파티 번호: ${id}\n다른 플레이어는 던전참가 ${id} 입력\n모두 준비를 입력하면 보스전이 시작됩니다.`;
}

function joinDungeonParty(db, player, userId, partyId) {
  const party = db.parties[partyId];
  if (!party) return "그 파티를 찾을 수 없습니다.";
  if (party.started) return "이미 시작한 파티입니다.";
  if (player.partyId) return `이미 파티에 있습니다. 파티 번호: ${player.partyId}`;
  const dungeon = dungeons[party.dungeonId];
  if (party.members.length >= dungeon.maxPlayers) return "파티가 가득 찼습니다.";
  if (player.level < dungeon.minLevel) return `${dungeon.name}은 Lv.${dungeon.minLevel}부터 입장할 수 있습니다.`;
  party.members.push(userId);
  player.partyId = party.id;
  return `${dungeon.name} 파티에 참가했습니다. 준비를 입력하세요.\n현재 인원: ${party.members.length}/${dungeon.maxPlayers}`;
}

function readyDungeon(db, player, userId) {
  const party = db.parties[player.partyId];
  if (!party) {
    player.partyId = null;
    return "참가 중인 파티가 없습니다.";
  }
  party.ready[userId] = true;
  const readyCount = party.members.filter((id) => party.ready[id]).length;
  if (readyCount < party.members.length) return `준비 완료. 현재 준비: ${readyCount}/${party.members.length}`;
  party.started = true;
  return [
    `${dungeons[party.dungeonId].name} 보스전이 시작됩니다.`,
    `보스: ${dungeons[party.dungeonId].boss.name} HP ${party.bossHp}`,
    "각자 공격 / 방어 / 스킬 중 하나를 입력하세요."
  ].join("\n");
}

function doDungeonAction(db, player, userId, action) {
  const party = db.parties[player.partyId];
  if (!party || !party.started) return null;
  if (!["공격", "방어", "스킬"].includes(action)) return "던전 전투 행동: 공격 / 방어 / 스킬";
  party.actions[userId] = action;
  const missing = party.members.filter((id) => !party.actions[id]);
  if (missing.length > 0) return `행동을 기록했습니다. 대기 중: ${missing.length}명`;

  const dungeon = dungeons[party.dungeonId];
  const boss = dungeon.boss;
  const lines = [`[${dungeon.name} ${party.turn}턴 결과]`];

  for (const memberId of party.members) {
    const member = db.players[memberId];
    if (!member || member.hp <= 0) continue;
    const memberAction = party.actions[memberId];
    if (memberAction === "방어") {
      lines.push(`${member.name}은 방어 태세를 취했습니다.`);
      continue;
    }
    let multiplier = 1;
    if (memberAction === "스킬") {
      if (member.mp >= 8) {
        member.mp -= 8;
        multiplier = 1.55;
      } else {
        lines.push(`${member.name}은 MP가 부족해 기본 공격을 했습니다.`);
      }
    }
    const dmg = Math.max(1, playerDamage(member, multiplier) - boss.def);
    party.bossHp -= dmg;
    lines.push(`${member.name}이 ${boss.name}에게 ${dmg} 피해를 입혔습니다.`);
  }

  if (party.bossHp <= 0) {
    lines.push(`${boss.name}을 처치했습니다.`);
    const rewardExp = Math.ceil(boss.exp / party.members.length);
    const rewardGold = Math.ceil(boss.gold / party.members.length);
    for (const memberId of party.members) {
      const member = db.players[memberId];
      if (!member) continue;
      lines.push(`${member.name}: ${addRewards(member, rewardExp, rewardGold).join(" ")}`);
      member.partyId = null;
    }
    delete db.parties[party.id];
    return lines.join("\n");
  }

  for (const memberId of party.members) {
    const member = db.players[memberId];
    if (!member || member.hp <= 0) continue;
    const guarding = party.actions[memberId] === "방어";
    const taken = monsterDamage(member, boss, guarding);
    member.hp = Math.max(1, member.hp - taken);
    lines.push(`${member.name}이 보스의 공격으로 ${taken} 피해를 받았습니다.`);
  }

  party.turn += 1;
  party.actions = {};
  lines.push(`보스 HP ${Math.max(0, party.bossHp)}/${boss.hp}`);
  lines.push("다음 행동: 공격 / 방어 / 스킬");
  return lines.join("\n");
}

function rest(player) {
  const s = calcStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  return "여관에서 휴식했습니다. HP와 MP가 모두 회복되었습니다.";
}

function handleCommand(userId, rawText) {
  const db = loadDb();
  const player = getPlayer(db, userId);
  const text = String(rawText || "").trim();
  const [command, ...args] = text.split(/\s+/);
  const arg1 = args[0];
  const arg2 = args[1];
  const rest = args.join(" ");
  let reply;

  try {
    const dungeonReply = doDungeonAction(db, player, userId, command);
    if (dungeonReply) {
      reply = dungeonReply;
    } else if (!command || command === "도움" || command === "도움말" || command === "help") {
      reply = help();
    } else if (command === "상태") {
      reply = status(player);
    } else if (command === "마을") {
      reply = showTown(player);
    } else if (command === "이동") {
      reply = moveTown(player, rest);
    } else if (command === "휴식") {
      reply = rest(player);
    } else if (command === "사냥") {
      reply = startHunt(db, player, userId);
    } else if (["공격", "방어", "스킬", "도망"].includes(command)) {
      reply = doBattleTurn(db, player, userId, command);
    } else if (command === "상점") {
      reply = showShop(player);
    } else if (command === "구매") {
      reply = buyItem(player, rest);
    } else if (command === "인벤토리" || command === "가방") {
      reply = inventory(player);
    } else if (command === "장착") {
      reply = equip(player, rest);
    } else if (command === "스탯") {
      reply = addStat(player, arg1, arg2);
    } else if (command === "전직") {
      reply = changeJob(player, arg1);
    } else if (command === "던전생성") {
      reply = createDungeonParty(db, player, userId);
    } else if (command === "던전참가") {
      reply = joinDungeonParty(db, player, userId, arg1);
    } else if (command === "준비") {
      reply = readyDungeon(db, player, userId);
    } else {
      reply = `알 수 없는 명령어입니다.\n\n${help()}`;
    }
  } finally {
    saveDb(db);
  }

  return reply;
}

module.exports = { handleCommand };
