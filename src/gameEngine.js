const fs = require("fs");
const path = require("path");
const { jobs, skills, towns, items, setBonuses, huntingGrounds, monsters, dungeons, jobUniqueWeapons } = require("./gameData");

const DB_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DB_DIR, "db.json");
const EQUIPMENT_SLOTS = ["weapon", "hat", "top", "bottom"];

// 강화 슬롯별 추가 스탯
const ENHANCE_BONUS = { weapon: { atk: 3 }, hat: { def: 1 }, top: { def: 2 }, bottom: { def: 1 } };
const ENHANCE_COST = (lv) => Math.floor(100 * Math.pow(1.6, lv));  // +0→1: 100G, +1→2: 160G ...
const ENHANCE_MAX = 10;

// 마법 계열 직업 (ATK = INT 기반)
const MAGIC_JOBS = new Set(["mage", "wizard", "archmage", "cleric", "priest", "bishop",
  "bard", "minstrel", "legend_bard"]);
// 하이브리드 (ATK = STR + INT)
const HYBRID_JOBS = new Set(["paladin", "holy_knight", "divine_knight"]);

function loadDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) return { players: {}, battles: {}, parties: {}, nextPartyId: 1 };
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
    inventory: ["rusty_sword", "cloth_hat", "cloth_armor", "cloth_pants"],
    equipment: { weapon: "rusty_sword", hat: "cloth_hat", top: "cloth_armor", bottom: "cloth_pants" },
    enhance: { weapon: 0, hat: 0, top: 0, bottom: 0 },
    partyId: null
  };
}

function getPlayer(db, userId) {
  if (!db.players[userId]) db.players[userId] = createPlayer(userId);
  normalizePlayer(db.players[userId]);
  return db.players[userId];
}

function normalizePlayer(p) {
  p.inventory ||= [];
  p.equipment ||= {};
  if (p.equipment.armor && !p.equipment.top) { p.equipment.top = p.equipment.armor; }
  delete p.equipment.armor;
  for (const slot of EQUIPMENT_SLOTS) { if (!p.equipment[slot]) p.equipment[slot] = null; }
  p.enhance ||= { weapon: 0, hat: 0, top: 0, bottom: 0 };
  for (const slot of EQUIPMENT_SLOTS) { p.enhance[slot] ||= 0; }
}

// ── 직업 트리 ──────────────────────────────────────────────────────────

function getJobChain(jobId) {
  const chain = [jobId];
  let cur = jobs[jobId];
  while (cur && cur.prevJob) {
    chain.unshift(cur.prevJob);
    cur = jobs[cur.prevJob];
  }
  return chain;
}

function getAvailableNextJobs(player) {
  return jobs[player.job]?.nextJobs || [];
}

// ── 스탯/데미지 계산 ───────────────────────────────────────────────────

function expToNext(level) { return 80 + level * level * 25; }

function itemStats(itemId) { return items[itemId] || {}; }

function addStats(target, source) {
  for (const key of ["str", "dex", "int", "vit", "atk", "def", "magic"]) {
    target[key] = (target[key] || 0) + (source[key] || 0);
  }
  return target;
}

function equippedItems(player) {
  normalizePlayer(player);
  return EQUIPMENT_SLOTS.map((slot) => player.equipment[slot]).filter(Boolean);
}

function activeSetBonuses(player) {
  const equipped = new Set(equippedItems(player));
  return Object.values(setBonuses).filter((set) => set.pieces.every((id) => equipped.has(id)));
}

function equipmentStats(player) {
  const total = {};
  for (const itemId of equippedItems(player)) addStats(total, itemStats(itemId));
  for (const set of activeSetBonuses(player)) addStats(total, set.bonus);
  // 강화 보너스
  const enh = player.enhance || {};
  for (const slot of EQUIPMENT_SLOTS) {
    const lv = enh[slot] || 0;
    if (lv > 0 && ENHANCE_BONUS[slot]) {
      for (const [stat, perLv] of Object.entries(ENHANCE_BONUS[slot])) {
        total[stat] = (total[stat] || 0) + lv * perLv;
      }
    }
  }
  return total;
}

function calcStats(player) {
  const job = jobs[player.job];
  const gear = equipmentStats(player);
  const str  = player.stats.str + (job.statBonus.str || 0) + (gear.str || 0);
  const dex  = player.stats.dex + (job.statBonus.dex || 0) + (gear.dex || 0);
  const int_ = player.stats.int + (job.statBonus.int || 0) + (gear.int || 0);
  const vit  = player.stats.vit + (job.statBonus.vit || 0) + (gear.vit || 0);
  const maxHp = 80 + vit * 8 + player.level * job.hpPerLevel;
  const maxMp = 20 + int_ * 4 + player.level * job.mpPerLevel;

  let atk;
  if (MAGIC_JOBS.has(player.job)) {
    atk = 4 + int_ * 3 + (gear.atk || 0) + (gear.magic || 0);
  } else if (HYBRID_JOBS.has(player.job)) {
    atk = 4 + str * 2 + int_ + (gear.atk || 0) + Math.floor((gear.magic || 0) * 0.6);
  } else {
    atk = 4 + str * 2 + dex + (gear.atk || 0);
  }

  return { str, dex, int: int_, vit, maxHp, maxMp, atk, def: Math.floor(vit * 1.4) + (gear.def || 0) };
}

function healToBounds(player) {
  const s = calcStats(player);
  player.hp = Math.min(Math.max(player.hp, 0), s.maxHp);
  player.mp = Math.min(Math.max(player.mp, 0), s.maxMp);
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]; }

function statBar(current, max, length = 10) {
  const ratio = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
  const filled = Math.round(ratio * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
}

function objectParticle(name) {
  const last = String(name).charCodeAt(String(name).length - 1);
  if (last < 0xac00 || last > 0xd7a3) return "을";
  return (last - 0xac00) % 28 === 0 ? "를" : "을";
}

function normalizeName(v) { return String(v || "").replace(/\s+/g, "").toLowerCase(); }

function findItemId(query) {
  const n = normalizeName(query);
  return Object.keys(items).find((id) => id === query || normalizeName(items[id].name) === n);
}

function findTownId(query) {
  const n = normalizeName(query);
  return Object.keys(towns).find((id) => id === query || normalizeName(towns[id].name) === n);
}

function formatStats(stats) {
  return [
    stats.atk   ? `공격+${stats.atk}`  : "",
    stats.def   ? `방어+${stats.def}`  : "",
    stats.magic ? `마력+${stats.magic}` : "",
    stats.str   ? `힘+${stats.str}`    : "",
    stats.dex   ? `민첩+${stats.dex}`  : "",
    stats.int   ? `지능+${stats.int}`  : "",
    stats.vit   ? `체력+${stats.vit}`  : ""
  ].filter(Boolean).join(" / ");
}

// ── 스킬 관련 ──────────────────────────────────────────────────────────

function learnedSkills(player) {
  const map = new Map();
  for (const jobId of getJobChain(player.job)) {
    for (const sk of skills[jobId] || []) map.set(sk.id, sk);
  }
  return [...map.values()].filter((sk) => player.level >= sk.level);
}

function findSkill(player, skillId) {
  return learnedSkills(player).find(
    (sk) => sk.id === skillId || normalizeName(sk.name) === normalizeName(skillId)
  );
}

// ── 보상 ──────────────────────────────────────────────────────────────

function addRewards(player, exp, gold) {
  player.exp  += exp;
  player.gold += gold;
  const lines = [`EXP +${exp}  골드 +${gold}G`];

  while (player.exp >= expToNext(player.level)) {
    player.exp -= expToNext(player.level);
    player.level += 1;
    player.statPoints += 3;
    const s = calcStats(player);
    player.hp = s.maxHp;
    player.mp = s.maxMp;
    lines.push(`★ Lv.${player.level} 달성! 스탯 포인트 +3`);

    const nextJobs = getAvailableNextJobs(player);
    if (nextJobs.length) {
      const tier = jobs[player.job].tier;
      const tierLabel = tier === 0 ? "1차" : tier === 1 ? "2차" : "3차";
      if (player.level === jobs[nextJobs[0]].levelRequired) {
        lines.push(`[전직 가능] ${tierLabel} 전직을 할 수 있습니다! 메뉴에서 전직을 선택하세요.`);
      }
    }
  }

  const needed = expToNext(player.level);
  const pct = Math.floor((player.exp / needed) * 100);
  lines.push(`EXP [${statBar(player.exp, needed)}] ${pct}% (${player.exp}/${needed})`);
  return lines;
}

function rollDrops(player, drops = []) {
  const lines = [];
  for (const drop of drops) {
    if (Math.random() <= drop.chance) {
      player.inventory.push(drop.item);
      const n = items[drop.item]?.name || drop.item;
      lines.push(`${n}${objectParticle(n)} 획득했습니다.`);
    }
  }
  return lines;
}

function rollBossDrops(player, boss) {
  const lines = rollDrops(player, boss.drops || []);
  const weaponId = jobUniqueWeapons[player.job] || jobUniqueWeapons.novice;
  if (weaponId && Math.random() <= (boss.uniqueWeaponChance || 0)) {
    player.inventory.push(weaponId);
    const n = items[weaponId]?.name;
    if (n) lines.push(`${n}${objectParticle(n)} 획득했습니다.`);
  }
  return lines;
}

function sellPrice(itemId) { return Math.max(1, Math.floor((items[itemId]?.price || 1) / 2)); }

// ── 전투 데미지 ────────────────────────────────────────────────────────

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

// 스킬 효과 처리 (솔로 전투용) — returns { dmgLine, healLine, extraLine, stun, guarding }
function applySkillSolo(player, battle, skill) {
  const monster = battle.monster;
  const s = calcStats(player);
  const lines = [];
  let stun = false;

  switch (skill.type) {
    case "heal": {
      const heal = Math.floor(s.maxHp * (skill.healPercent / 100));
      player.hp = Math.min(s.maxHp, player.hp + heal);
      lines.push(`${skill.name}: HP +${heal} 회복`);
      break;
    }
    case "party_heal": {  // 솔로에서는 자신만
      const heal = Math.floor(s.maxHp * (skill.healPercent / 100));
      player.hp = Math.min(s.maxHp, player.hp + heal);
      lines.push(`${skill.name}: HP +${heal} 회복`);
      break;
    }
    case "mp_restore": {
      const restore = Math.min(skill.mpAmount, s.maxMp - player.mp);
      player.mp += restore;
      lines.push(`${skill.name}: MP +${restore} 회복`);
      break;
    }
    case "stun": {
      const effectiveDef = Math.max(0, monster.def - 0);
      const dmg = Math.max(1, playerDamage(player, skill.multiplier) - effectiveDef);
      battle.monsterHp -= dmg;
      lines.push(`${skill.name}으로 ${monster.name}에게 ${dmg} 피해 (다음 반격 무효화)`);
      stun = true;
      break;
    }
    case "def_break": {
      const reducedDef = Math.max(0, monster.def - (skill.defBreak || 0));
      const dmg = Math.max(1, playerDamage(player, skill.multiplier) - reducedDef);
      battle.monsterHp -= dmg;
      lines.push(`${skill.name}으로 ${monster.name} 방어 -${skill.defBreak} 돌파! ${dmg} 피해`);
      break;
    }
    case "damage_heal": {
      const dmg = Math.max(1, playerDamage(player, skill.multiplier) - monster.def);
      battle.monsterHp -= dmg;
      const heal = Math.floor(s.maxHp * (skill.healPercent / 100));
      player.hp = Math.min(s.maxHp, player.hp + heal);
      lines.push(`${skill.name}으로 ${dmg} 피해 & HP +${heal} 회복`);
      break;
    }
    default: { // "damage"
      const dmg = Math.max(1, playerDamage(player, skill.multiplier) - monster.def);
      battle.monsterHp -= dmg;
      lines.push(`${skill.name}으로 ${monster.name}에게 ${dmg} 피해`);
      break;
    }
  }
  return { lines, stun };
}

// ── 상태 표시 ─────────────────────────────────────────────────────────

function status(player) {
  healToBounds(player);
  const s = calcStats(player);
  const activeSets = activeSetBonuses(player);
  const setLines = activeSets.length
    ? ["", "세트 효과", ...activeSets.map((set) => `${set.name}: ${formatStats(set.bonus)}`)]
    : [];

  const enh = player.enhance || {};
  const weaponId = player.equipment.weapon;
  const weaponName = weaponId
    ? `${items[weaponId]?.name || weaponId}${enh.weapon > 0 ? ` +${enh.weapon}` : ""}`
    : "없음";

  return [
    `[${jobs[player.job].name} Lv.${player.level}]`,
    `위치: ${towns[player.town].name}`,
    `HP ${player.hp}/${s.maxHp} / MP ${player.mp}/${s.maxMp}`,
    `EXP ${player.exp}/${expToNext(player.level)} / 골드 ${player.gold}G`,
    `공격 ${s.atk} / 방어 ${s.def}`,
    `힘 ${s.str} / 민첩 ${s.dex} / 지능 ${s.int} / 체력 ${s.vit}`,
    `남은 스탯 포인트: ${player.statPoints}`,
    "",
    "장비",
    `무기: ${weaponName}`,
    `모자: ${player.equipment.hat ? `${items[player.equipment.hat]?.name || ""}${enh.hat > 0 ? ` +${enh.hat}` : ""}` : "없음"}`,
    `상의: ${player.equipment.top ? `${items[player.equipment.top]?.name || ""}${enh.top > 0 ? ` +${enh.top}` : ""}` : "없음"}`,
    `하의: ${player.equipment.bottom ? `${items[player.equipment.bottom]?.name || ""}${enh.bottom > 0 ? ` +${enh.bottom}` : ""}` : "없음"}`,
    ...setLines
  ].join("\n");
}

// ── 사냥 ──────────────────────────────────────────────────────────────

function startHunt(db, player, userId) {
  if (db.battles[userId]) return "이미 전투 중입니다.";
  healToBounds(player);
  if (player.hp <= 0) return "HP가 부족합니다. 휴식 후 다시 시도하세요.";
  const town = towns[player.town];
  const ground = huntingGrounds[town.huntingGround];
  if (!ground) return "이 마을에는 사냥터가 없습니다.";
  if (player.level < (ground.minLevel || 1)) return `이 사냥터는 Lv.${ground.minLevel} 이상부터 입장할 수 있습니다.`;

  const monsterId = pickRandom(ground.monsters);
  const monster = { ...monsters[monsterId], id: monsterId };
  db.battles[userId] = { type: "solo", monster, monsterHp: monster.hp, turn: 1 };
  const s = calcStats(player);
  return [
    `${ground.name}에서 ${monster.name}${objectParticle(monster.name)} 만났습니다.`,
    "",
    `[전투 1턴]`,
    `나    HP [${statBar(player.hp, s.maxHp)}] ${player.hp}/${s.maxHp}  MP [${statBar(player.mp, s.maxMp)}] ${player.mp}/${s.maxMp}`,
    `${monster.name} HP [${statBar(monster.hp, monster.hp)}] ${monster.hp}/${monster.hp}`,
    "",
    "행동을 선택하세요."
  ].join("\n");
}

function doBattleTurn(db, player, userId, action) {
  const battle = db.battles[userId];
  if (!battle) return "진행 중인 전투가 없습니다.";
  const monster = battle.monster;
  const s = calcStats(player);
  const lines = [`[전투 ${battle.turn}턴 결과]`];
  const [actionName, actionArg] = String(action || "").split(/\s+/);

  let stun = false;

  if (actionName === "도망") {
    if (Math.random() < 0.65) { delete db.battles[userId]; return "도망쳤습니다."; }
    lines.push("도망에 실패했습니다.");
  } else if (actionName === "방어") {
    lines.push("방어 태세를 취했습니다.");
    const taken = monsterDamage(player, monster, true);
    player.hp -= taken;
    lines.push(`${monster.name}의 공격: ${taken} 피해 (감소됨)`);
    if (player.hp <= 0) {
      player.hp = 1;
      player.gold = Math.max(0, player.gold - Math.ceil(monster.gold / 2));
      delete db.battles[userId];
      lines.push("쓰러졌습니다. 마을로 귀환하고 일부 골드를 잃었습니다.");
      return lines.join("\n");
    }
    battle.turn += 1;
    lines.push("", `나    HP [${statBar(player.hp, s.maxHp)}] ${player.hp}/${s.maxHp}  MP [${statBar(player.mp, s.maxMp)}] ${player.mp}/${s.maxMp}`);
    lines.push(`${monster.name} HP [${statBar(Math.max(0, battle.monsterHp), monster.hp)}] ${Math.max(0, battle.monsterHp)}/${monster.hp}`);
    lines.push("다음 행동을 선택하세요.");
    return lines.join("\n");
  } else if (actionName === "스킬사용") {
    const skill = findSkill(player, actionArg);
    if (!skill) return "사용할 수 없는 스킬입니다.";
    if (player.mp < skill.mpCost) return `MP가 부족합니다. 필요 MP: ${skill.mpCost}`;
    player.mp -= skill.mpCost;
    const result = applySkillSolo(player, battle, skill);
    lines.push(...result.lines);
    stun = result.stun;
  } else if (actionName === "공격") {
    const dmg = Math.max(1, playerDamage(player) - monster.def);
    battle.monsterHp -= dmg;
    lines.push(`${monster.name}에게 ${dmg} 피해를 입혔습니다.`);
  } else {
    return "전투 행동: 1.공격 2.스킬 3.방어 4.도망";
  }

  if (battle.monsterHp <= 0) {
    lines.push(`${monster.name}${objectParticle(monster.name)} 처치했습니다.`);
    lines.push(...addRewards(player, monster.exp, monster.gold));
    lines.push(...rollDrops(player, monster.drops));
    delete db.battles[userId];
    return lines.join("\n");
  }

  if (!stun) {
    const taken = monsterDamage(player, monster, false);
    player.hp -= taken;
    lines.push(`${monster.name}의 반격: ${taken} 피해`);
  } else {
    lines.push(`${monster.name}은 스턴 상태로 반격하지 못했습니다.`);
  }

  if (player.hp <= 0) {
    player.hp = 1;
    player.gold = Math.max(0, player.gold - Math.ceil(monster.gold / 2));
    delete db.battles[userId];
    lines.push("쓰러졌습니다. 마을로 귀환하고 일부 골드를 잃었습니다.");
    return lines.join("\n");
  }

  battle.turn += 1;
  lines.push("", `나    HP [${statBar(player.hp, s.maxHp)}] ${player.hp}/${s.maxHp}  MP [${statBar(player.mp, s.maxMp)}] ${player.mp}/${s.maxMp}`);
  lines.push(`${monster.name} HP [${statBar(Math.max(0, battle.monsterHp), monster.hp)}] ${Math.max(0, battle.monsterHp)}/${monster.hp}`);
  lines.push("다음 행동을 선택하세요.");
  return lines.join("\n");
}

// ── 마을 / 상점 ───────────────────────────────────────────────────────

function showTown(player) {
  const town = towns[player.town];
  const extras = [];
  if (town.hasSmith) extras.push("대장간 이용 가능");
  return [
    `[${town.name}]`,
    town.description,
    `이동 가능: ${town.connections.map((id) => towns[id].name).join(", ")}`,
    `사냥터: ${huntingGrounds[town.huntingGround]?.name || "없음"}`,
    ...extras
  ].join("\n");
}

function moveTown(player, townQuery) {
  const target = findTownId(townQuery);
  if (!target) return "그 마을을 찾을 수 없습니다.";
  if (!towns[player.town].connections.includes(target)) return `${towns[player.town].name}에서 ${towns[target].name}로 바로 이동할 수 없습니다.`;
  player.town = target;
  const s = calcStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  return `${towns[target].name}로 이동했습니다. 여관에서 회복했습니다.\n\n${showTown(player)}`;
}

function showShop(player) {
  return [`[${towns[player.town].name} 상점]`, `소지금: ${player.gold}G`, "업무를 선택하세요."].join("\n");
}

function showShopBuy(player) {
  const town = towns[player.town];
  return [
    `[${town.name} 상점 - 구매]`,
    `소지금: ${player.gold}G`,
    ...town.shop.map((id) => {
      const item = items[id];
      const stats = formatStats(item);
      return `${item.name} - ${item.price}G${stats ? ` / ${stats}` : ""}`;
    }),
    "",
    "번호로 구매하세요."
  ].join("\n");
}

function showShopSell(player) {
  const choices = shopSellChoices(player);
  return [
    "[상점 - 판매]",
    `소지금: ${player.gold}G`,
    ...(choices.length ? choices.map((c) => c.label) : ["판매할 수 있는 아이템이 없습니다."]),
    "",
    "장착 중인 아이템은 판매 불가합니다."
  ].join("\n");
}

function buyItem(player, itemQuery) {
  const itemId = findItemId(itemQuery);
  if (!itemId) return "그 아이템을 찾을 수 없습니다.";
  if (!towns[player.town].shop.includes(itemId)) return "현재 상점에 없는 아이템입니다.";
  const item = items[itemId];
  if (player.gold < item.price) return `골드가 부족합니다. 필요: ${item.price}G`;
  player.gold -= item.price;
  player.inventory.push(itemId);
  return `${item.name}${objectParticle(item.name)} 구매했습니다. 잔액: ${player.gold}G`;
}

function sellItem(player, itemQuery) {
  const itemId = findItemId(itemQuery);
  if (!itemId || !player.inventory.includes(itemId)) return "인벤토리에 그 아이템이 없습니다.";
  if (equippedItems(player).includes(itemId)) return "장착 중인 아이템은 판매할 수 없습니다.";
  const idx = player.inventory.indexOf(itemId);
  player.inventory.splice(idx, 1);
  player.gold += sellPrice(itemId);
  return `${items[itemId].name}${objectParticle(items[itemId].name)} 판매했습니다. 소지금: ${player.gold}G`;
}

function inventory(player) {
  const counts = {};
  for (const id of player.inventory) counts[id] = (counts[id] || 0) + 1;
  const lines = Object.entries(counts).map(([id, cnt]) => `${items[id]?.name || id}${cnt > 1 ? ` x${cnt}` : ""}`);
  return [`[인벤토리]`, ...(lines.length ? lines : ["비어 있습니다."])].join("\n");
}

function equip(player, itemQuery) {
  const itemId = findItemId(itemQuery);
  if (!itemId || !player.inventory.includes(itemId)) return "인벤토리에 그 아이템이 없습니다.";
  const item = items[itemId];
  if (!EQUIPMENT_SLOTS.includes(item.type)) return "장착할 수 없는 아이템입니다.";
  player.equipment[item.type] = itemId;
  healToBounds(player);
  return `${item.name}${objectParticle(item.name)} 장착했습니다.\n\n${status(player)}`;
}

function addStat(player, statName, amountText) {
  const statMap = { 힘: "str", 민첩: "dex", 지능: "int", 체력: "vit", str: "str", dex: "dex", int: "int", vit: "vit" };
  const key = statMap[statName];
  const amount = Number(amountText || 1);
  if (!key || !Number.isInteger(amount) || amount <= 0) return "스탯 올릴 수치를 선택하세요.";
  if (player.statPoints < amount) return `스탯 포인트 부족. 보유: ${player.statPoints}`;
  player.stats[key] += amount;
  player.statPoints -= amount;
  if (key === "vit") player.hp += amount * 8;
  if (key === "int") player.mp += amount * 4;
  healToBounds(player);
  return `스탯을 올렸습니다.\n\n${status(player)}`;
}

// ── 전직 ──────────────────────────────────────────────────────────────

function changeJob(player, targetJobId) {
  const available = getAvailableNextJobs(player);
  if (!available.includes(targetJobId)) {
    if (!jobs[targetJobId]) return "존재하지 않는 직업입니다.";
    return "현재 직업에서 전직할 수 없는 직업입니다.";
  }
  const nextJob = jobs[targetJobId];
  if (player.level < nextJob.levelRequired) {
    return `${nextJob.name}은(는) Lv.${nextJob.levelRequired}부터 전직 가능합니다.`;
  }
  player.job = targetJobId;
  const s = calcStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  return `${nextJob.name}로 전직했습니다!\n\n${status(player)}`;
}

// ── 대장간 ────────────────────────────────────────────────────────────

function showSmith(player) {
  if (!towns[player.town]?.hasSmith) return "이 마을에는 대장간이 없습니다.";
  const enh = player.enhance || {};
  const lines = [
    "[대장간]",
    `소지금: ${player.gold}G`,
    "",
    "현재 장비 강화 현황"
  ];
  for (const slot of EQUIPMENT_SLOTS) {
    const itemId = player.equipment[slot];
    const lv = enh[slot] || 0;
    const slotName = { weapon: "무기", hat: "모자", top: "상의", bottom: "하의" }[slot];
    if (itemId) {
      const nextCost = lv < ENHANCE_MAX ? ENHANCE_COST(lv) : "최대";
      lines.push(`${slotName}: ${items[itemId]?.name || itemId} +${lv}  (다음 강화: ${nextCost === "최대" ? "최대치" : nextCost + "G"})`);
    } else {
      lines.push(`${slotName}: 장착 없음`);
    }
  }
  lines.push("", "강화할 장비를 선택하세요.");
  return lines.join("\n");
}

function smithEnhance(player, slot) {
  if (!towns[player.town]?.hasSmith) return "이 마을에는 대장간이 없습니다.";
  if (!EQUIPMENT_SLOTS.includes(slot)) return "올바른 장비 슬롯이 아닙니다.";
  const itemId = player.equipment[slot];
  if (!itemId) return "해당 슬롯에 장착된 아이템이 없습니다.";
  const enh = player.enhance;
  const lv = enh[slot] || 0;
  if (lv >= ENHANCE_MAX) return `이미 최대 강화 수치(+${ENHANCE_MAX})입니다.`;
  const cost = ENHANCE_COST(lv);
  if (player.gold < cost) return `골드가 부족합니다. 필요: ${cost}G (보유: ${player.gold}G)`;
  player.gold -= cost;
  enh[slot] = lv + 1;
  const slotName = { weapon: "무기", hat: "모자", top: "상의", bottom: "하의" }[slot];
  const iname = items[itemId]?.name || itemId;
  return `${slotName} [${iname}]${objectParticle(iname)} +${enh[slot]}으로 강화했습니다!\n잔액: ${player.gold}G\n\n${showSmith(player)}`;
}

function rest(player) {
  const s = calcStats(player);
  player.hp = s.maxHp;
  player.mp = s.maxMp;
  return "여관에서 휴식했습니다. HP와 MP가 완전히 회복되었습니다.";
}

// ── 던전 파티 시스템 ───────────────────────────────────────────────────

function showRoomList(db) {
  const open = Object.values(db.parties).filter((p) => !p.started);
  if (!open.length) {
    return { text: "[방 목록]\n현재 열린 방이 없습니다.", choices: [] };
  }
  const lines = ["[방 목록]"];
  const choices = [];
  for (const party of open) {
    const dg = dungeons[party.dungeonId];
    const leader = db.players[party.leader];
    const label = `방 #${party.id} [${dg.name}] ${leader?.name || "?"} - ${party.members.length}/${dg.maxPlayers}명`;
    lines.push(label);
    choices.push({ label, command: `던전참가 ${party.id}` });
  }
  return { text: lines.join("\n"), choices };
}

function showPartyRoom(db, player, userId, prefix) {
  const party = db.parties[player.partyId];
  if (!party) { player.partyId = null; return "파티를 찾을 수 없습니다."; }
  const dg = dungeons[party.dungeonId];
  const lines = [];
  if (prefix) { lines.push(prefix, ""); }
  lines.push(`[${dg.name} - 방 #${party.id}]`);
  lines.push(`인원: ${party.members.length}/${dg.maxPlayers}`);
  lines.push("");
  lines.push("플레이어 목록");
  for (const memberId of party.members) {
    const member = db.players[memberId];
    const isLeader = memberId === party.leader;
    const readyMark = party.ready[memberId] ? "✓ 준비" : "⏳ 대기";
    lines.push(`${member?.name || memberId}${isLeader ? " 👑" : ""}  ${readyMark}`);
  }
  return lines.join("\n");
}

function dungeonSelectChoices(player) {
  return Object.entries(dungeons)
    .filter(([, dg]) => player.level >= dg.minLevel)
    .map(([id, dg]) => ({
      label: `${dg.name} (Lv.${dg.minLevel}+)`,
      command: `던전생성 ${id}`
    }));
}

function partyRoomChoices(party, userId) {
  const isReady = Boolean(party.ready?.[userId]);
  return [
    { label: isReady ? "준비 해제" : "준비", command: "준비" },
    { label: "새로고침", command: "__party_refresh" },
    { label: "나가기", command: "던전나가기" }
  ];
}

function createDungeonParty(db, player, userId, dungeonId) {
  if (player.partyId) return `이미 파티에 있습니다.`;
  const dungeonId_ = dungeonId || "goblin_den";
  const dg = dungeons[dungeonId_];
  if (!dg) return "존재하지 않는 던전입니다.";
  if (player.level < dg.minLevel) return `${dg.name}은 Lv.${dg.minLevel}부터 입장 가능합니다.`;
  const id = String(db.nextPartyId++);
  db.parties[id] = {
    id,
    dungeonId: dungeonId_,
    leader: userId,
    members: [userId],
    ready: {},
    started: false,
    bossHp: dg.boss.hp,
    turn: 1,
    actions: {}
  };
  player.partyId = id;
  return showPartyRoom(db, player, userId, `[${dg.name}] 방을 만들었습니다. 방 번호: #${id}`);
}

function joinDungeonParty(db, player, userId, partyId) {
  const party = db.parties[partyId];
  if (!party) return "해당 방이 사라졌습니다. 방 목록을 새로고침하세요.";
  if (party.started) return "이미 전투가 시작된 방입니다.";
  if (player.partyId) return "이미 파티에 있습니다.";
  const dg = dungeons[party.dungeonId];
  if (party.members.length >= dg.maxPlayers) return `방이 가득 찼습니다. (${dg.maxPlayers}/${dg.maxPlayers})`;
  if (player.level < dg.minLevel) return `${dg.name}은 Lv.${dg.minLevel}부터 입장 가능합니다.`;
  party.members.push(userId);
  player.partyId = party.id;
  return showPartyRoom(db, player, userId, `[${dg.name}] 방에 입장했습니다.`);
}

function leaveDungeon(db, player, userId) {
  if (!player.partyId) return "파티에 참가 중이 아닙니다.";
  const party = db.parties[player.partyId];
  if (!party) { player.partyId = null; return "파티를 찾을 수 없습니다."; }
  if (party.started) return "전투 중에는 나갈 수 없습니다.";
  party.members = party.members.filter((id) => id !== userId);
  delete party.ready[userId];
  player.partyId = null;
  if (party.members.length === 0) {
    delete db.parties[party.id];
    return "방에서 나왔습니다. (방이 해산되었습니다.)";
  }
  if (party.leader === userId) {
    party.leader = party.members[0];
    const newLeader = db.players[party.leader];
    return `방에서 나왔습니다. 파티장이 ${newLeader?.name || "?"}로 변경되었습니다.`;
  }
  return "방에서 나왔습니다.";
}

function readyDungeon(db, player, userId) {
  const party = db.parties[player.partyId];
  if (!party) { player.partyId = null; return "파티를 찾을 수 없습니다."; }
  if (party.started) return "이미 전투가 시작되었습니다.";

  // 준비 토글
  if (party.ready[userId]) {
    delete party.ready[userId];
    return showPartyRoom(db, player, userId, "준비를 해제했습니다.");
  }

  party.ready[userId] = true;
  const readyCount = party.members.filter((id) => party.ready[id]).length;

  if (readyCount >= party.members.length && party.members.length >= 1) {
    party.started = true;
    const dg = dungeons[party.dungeonId];
    const boss = dg.boss;
    return [
      `전원 준비 완료! ${dg.name} 보스전 시작!`,
      "",
      `▶ 보스: ${boss.name}  HP [${statBar(party.bossHp, boss.hp)}] ${party.bossHp}/${boss.hp}`,
      "",
      "각자 행동을 선택하세요."
    ].join("\n");
  }

  return showPartyRoom(db, player, userId, `준비 완료! (${readyCount}/${party.members.length})`);
}

// 파티 던전 행동 처리 (모두 행동 선택 후 턴 진행)
function doDungeonAction(db, player, userId, action) {
  const party = player.partyId ? db.parties[player.partyId] : null;
  if (!party || !party.started) return null;

  const [actionName, actionArg] = String(action || "").split(/\s+/);
  const validActions = ["공격", "방어", "스킬사용"];
  if (!validActions.includes(actionName)) return "던전 전투: 1.공격 2.스킬 3.방어";

  if (actionName === "스킬사용") {
    const skill = findSkill(player, actionArg);
    if (!skill) return "사용할 수 없는 스킬입니다.";
    if (player.mp < skill.mpCost) return `MP가 부족합니다. 필요 MP: ${skill.mpCost}`;
  }

  // 이미 이번 턴에 행동을 선택했는지 확인
  if (party.actions[userId]) return "이미 이번 턴 행동을 선택했습니다. 다른 파티원을 기다리세요.";

  party.actions[userId] = actionName === "스킬사용"
    ? { type: "skill", skillId: actionArg }
    : { type: actionName };

  const missing = party.members.filter((id) => !party.actions[id]);
  if (missing.length > 0) {
    return `행동을 기록했습니다. 대기 중: ${missing.length}명`;
  }

  // ── 전원 행동 선택 완료 → 턴 처리 ──
  const dg = dungeons[party.dungeonId];
  const boss = dg.boss;
  const lines = [`[${dg.name} ${party.turn}턴 결과]`, ""];

  // 플레이어 → 보스 공격 단계
  for (const memberId of party.members) {
    const member = db.players[memberId];
    if (!member || member.hp <= 0) continue;
    const act = party.actions[memberId];

    if (act.type === "방어") {
      lines.push(`${member.name}은 방어 태세를 취했습니다.`);
      continue;
    }

    if (act.type === "skill") {
      const skill = findSkill(member, act.skillId);
      if (!skill) { lines.push(`${member.name}은 스킬을 사용하지 못했습니다.`); continue; }
      if (member.mp < skill.mpCost) {
        lines.push(`${member.name}은 MP 부족으로 기본 공격을 합니다.`);
        const dmg = Math.max(1, playerDamage(member, 1) - boss.def);
        party.bossHp -= dmg;
        lines.push(`${member.name}: ${boss.name}에게 ${dmg} 피해`);
        continue;
      }
      member.mp -= skill.mpCost;

      // 스킬 타입에 따른 처리
      const ms = calcStats(member);
      switch (skill.type) {
        case "heal": {
          const heal = Math.floor(ms.maxHp * (skill.healPercent / 100));
          member.hp = Math.min(ms.maxHp, member.hp + heal);
          lines.push(`${member.name}: ${skill.name} - 자신 HP +${heal} 회복`);
          break;
        }
        case "party_heal": {
          const healLines = [];
          for (const mid of party.members) {
            const m = db.players[mid];
            if (!m) continue;
            const ms2 = calcStats(m);
            const heal = Math.floor(ms2.maxHp * (skill.healPercent / 100));
            m.hp = Math.min(ms2.maxHp, m.hp + heal);
            healLines.push(`${m.name} +${heal}`);
          }
          lines.push(`${member.name}: ${skill.name} - 전체 회복 [${healLines.join(", ")}]`);
          break;
        }
        case "mp_restore": {
          const restore = Math.min(skill.mpAmount, ms.maxMp - member.mp);
          member.mp += restore;
          lines.push(`${member.name}: ${skill.name} - MP +${restore} 회복`);
          break;
        }
        case "stun": {
          const dmg = Math.max(1, playerDamage(member, skill.multiplier) - boss.def);
          party.bossHp -= dmg;
          party.bossStunned = true;
          lines.push(`${member.name}: ${skill.name} - ${boss.name}에게 ${dmg} 피해 + 스턴`);
          break;
        }
        case "def_break": {
          const reducedDef = Math.max(0, boss.def - (skill.defBreak || 0));
          const dmg = Math.max(1, playerDamage(member, skill.multiplier) - reducedDef);
          party.bossHp -= dmg;
          lines.push(`${member.name}: ${skill.name} - 방어 돌파! ${boss.name}에게 ${dmg} 피해`);
          break;
        }
        case "damage_heal": {
          const dmg = Math.max(1, playerDamage(member, skill.multiplier) - boss.def);
          party.bossHp -= dmg;
          const heal = Math.floor(ms.maxHp * (skill.healPercent / 100));
          member.hp = Math.min(ms.maxHp, member.hp + heal);
          lines.push(`${member.name}: ${skill.name} - ${dmg} 피해 & HP +${heal} 회복`);
          break;
        }
        default: {
          const dmg = Math.max(1, playerDamage(member, skill.multiplier) - boss.def);
          party.bossHp -= dmg;
          lines.push(`${member.name}: ${skill.name} - ${boss.name}에게 ${dmg} 피해`);
          break;
        }
      }
    } else {
      // 기본 공격
      const dmg = Math.max(1, playerDamage(member) - boss.def);
      party.bossHp -= dmg;
      lines.push(`${member.name}: ${boss.name}에게 ${dmg} 피해`);
    }
  }

  // 보스 처치 확인
  if (party.bossHp <= 0) {
    lines.push("", `${boss.name}${objectParticle(boss.name)} 처치했습니다!`);
    const rewardExp  = Math.ceil(boss.exp  / party.members.length);
    const rewardGold = Math.ceil(boss.gold / party.members.length);
    for (const memberId of party.members) {
      const member = db.players[memberId];
      if (!member) continue;
      const rewardLines = [...addRewards(member, rewardExp, rewardGold), ...rollBossDrops(member, boss)];
      lines.push(`${member.name}: ${rewardLines.join(" / ")}`);
      member.partyId = null;
    }
    delete db.parties[party.id];
    return lines.join("\n");
  }

  // 보스 → 플레이어 반격 단계
  lines.push("");
  const bossStunned = Boolean(party.bossStunned);
  party.bossStunned = false;

  if (bossStunned) {
    lines.push(`${boss.name}은 스턴 상태로 반격하지 못했습니다.`);
  } else {
    for (const memberId of party.members) {
      const member = db.players[memberId];
      if (!member || member.hp <= 0) continue;
      const act = party.actions[memberId];
      const guarding = act?.type === "방어";
      const taken = monsterDamage(member, boss, guarding);
      member.hp = Math.max(0, member.hp - taken);
      if (member.hp <= 0) {
        member.hp = 1;
        lines.push(`${member.name}: 보스 공격 ${taken} 피해 - 위험!`);
      } else {
        lines.push(`${member.name}: 보스 공격 ${taken} 피해 (HP ${member.hp})`);
      }
    }
  }

  party.turn += 1;
  party.actions = {};
  lines.push("", `보스 HP [${statBar(Math.max(0, party.bossHp), boss.hp)}] ${Math.max(0, party.bossHp)}/${boss.hp}`);
  for (const memberId of party.members) {
    const member = db.players[memberId];
    if (!member) continue;
    const ms = calcStats(member);
    lines.push(`${member.name} HP [${statBar(member.hp, ms.maxHp)}] ${member.hp}/${ms.maxHp}`);
  }
  lines.push("", "다음 행동을 선택하세요.");
  return lines.join("\n");
}

// ── 선택지 빌더 ───────────────────────────────────────────────────────

function generalChoices() {
  return [
    { label: "상태",     command: "상태" },
    { label: "사냥",     command: "사냥" },
    { label: "마을",     command: "마을" },
    { label: "상점",     command: "상점" },
    { label: "인벤토리", command: "인벤토리" },
    { label: "휴식",     command: "휴식" },
    { label: "스탯",     command: "__stat_menu" },
    { label: "전직",     command: "__job_menu" },
    { label: "던전",     command: "__dungeon_menu" },
    { label: "대장간",   command: "__smith_menu" }
  ];
}

function statChoices() {
  return [
    { label: "힘 +1",   command: "스탯 힘 1" },
    { label: "민첩 +1", command: "스탯 민첩 1" },
    { label: "지능 +1", command: "스탯 지능 1" },
    { label: "체력 +1", command: "스탯 체력 1" }
  ];
}

function jobChoices(player) {
  const available = getAvailableNextJobs(player);
  if (!available.length) return [{ label: "더 이상 전직 없음", command: "__main_menu" }];
  return available.map((id) => ({
    label: `${jobs[id].name} (Lv.${jobs[id].levelRequired} 필요)`,
    command: `전직 ${id}`
  }));
}

function dungeonMenuChoices() {
  return [
    { label: "방 만들기",      command: "__dungeon_create" },
    { label: "방 목록 (참가)", command: "__dungeon_room_list" }
  ];
}

function smithChoices() {
  return [
    { label: "무기 강화",  command: "강화 weapon" },
    { label: "모자 강화",  command: "강화 hat" },
    { label: "상의 강화",  command: "강화 top" },
    { label: "하의 강화",  command: "강화 bottom" }
  ];
}

function battleChoices() {
  return [
    { label: "공격", command: "공격" },
    { label: "스킬", command: "__battle_skills" },
    { label: "방어", command: "방어" },
    { label: "도망", command: "도망" }
  ];
}

function dungeonBattleChoices() {
  return [
    { label: "공격", command: "공격" },
    { label: "스킬", command: "__battle_skills" },
    { label: "방어", command: "방어" }
  ];
}

function shopMenuChoices() {
  return [
    { label: "구매", command: "__shop_buy" },
    { label: "판매", command: "__shop_sell" },
    { label: "나가기", command: "__shop_exit" }
  ];
}

function shopBuyChoices(player) {
  return towns[player.town].shop.map((id) => ({
    label: `${items[id].name} (${items[id].price}G)`,
    command: `구매 ${items[id].name}`
  }));
}

function shopSellChoices(player) {
  const equipped = new Set(equippedItems(player));
  const counts = {};
  for (const id of player.inventory) {
    if (equipped.has(id)) continue;
    counts[id] = (counts[id] || 0) + 1;
  }
  return Object.entries(counts).map(([id, cnt]) => ({
    label: `${items[id]?.name || id}${cnt > 1 ? ` x${cnt}` : ""} (${sellPrice(id)}G)`,
    command: `판매 ${items[id]?.name || id}`
  }));
}

function skillChoices(player) {
  return learnedSkills(player).map((sk) => ({
    label: `${sk.name} (MP ${sk.mpCost})`,
    command: `스킬사용 ${sk.id}`
  }));
}

function townChoices(player) {
  const town = towns[player.town];
  return [
    ...town.connections.map((id) => ({ label: `${towns[id].name}으로 이동`, command: `이동 ${towns[id].name}` })),
    { label: "사냥", command: "사냥" },
    { label: "상점", command: "상점" }
  ];
}

function inventoryChoices(player) {
  const seen = new Set();
  return player.inventory
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return EQUIPMENT_SLOTS.includes(items[id]?.type);
    })
    .map((id) => ({ label: `${items[id].name} 장착`, command: `장착 ${items[id].name}` }));
}

// ── 선택지 페이징 ─────────────────────────────────────────────────────

function visibleChoices(player, choices) {
  const backCommand = player.choiceBackCommand;
  const hasBack = Boolean(backCommand);
  const maxItems = hasBack ? 5 : 6;
  if (choices.length <= maxItems) {
    player.choicePage = 0;
    const visible = choices.map((c, i) => ({ number: i + 1, ...c }));
    if (hasBack) visible.push({ number: 6, label: "뒤로", command: backCommand });
    return visible;
  }
  const firstPageItems  = hasBack ? 4 : 5;
  const middlePageItems = hasBack ? 3 : 4;
  const maxPage = Math.max(0, Math.ceil((choices.length - firstPageItems) / middlePageItems));
  player.choicePage = Math.min(Math.max(player.choicePage || 0, 0), maxPage);
  const start = player.choicePage === 0 ? 0 : firstPageItems + (player.choicePage - 1) * middlePageItems;
  const isFirst = player.choicePage === 0;
  const isLast  = player.choicePage === maxPage;
  const limit   = isFirst ? firstPageItems : middlePageItems;
  const visible = choices.slice(start, start + limit).map((c, i) => ({ number: i + 1, ...c }));
  if (isFirst) {
    visible.push({ number: hasBack ? 5 : 6, label: "다음", command: "__next_choices" });
  } else if (isLast) {
    visible.push({ number: hasBack ? 5 : 6, label: "이전", command: "__prev_choices" });
  } else {
    visible.push({ number: hasBack ? 4 : 5, label: "이전", command: "__prev_choices" });
    visible.push({ number: hasBack ? 5 : 6, label: "다음", command: "__next_choices" });
  }
  if (hasBack) visible.push({ number: 6, label: "뒤로", command: backCommand });
  return visible;
}

function appendChoices(player, text, choices) {
  if (!choices.length) return text;
  const visible = visibleChoices(player, choices);
  const hasBack = Boolean(player.choiceBackCommand);
  const firstPageItems  = hasBack ? 4 : 5;
  const middlePageItems = hasBack ? 3 : 4;
  const pageText = choices.length > (hasBack ? 5 : 6)
    ? ` (${player.choicePage + 1}/${Math.max(1, Math.ceil((choices.length - firstPageItems) / middlePageItems) + 1)})`
    : "";
  return [text, "", `[선택${pageText}]`, ...visible.map((c) => `${c.number}. ${c.label}`)].join("\n");
}

// ── 숫자 선택지 해석 ─────────────────────────────────────────────────

function resolveNumberChoice(db, player, userId, text) {
  if (!/^\d+$/.test(text)) return text;
  const number = Number(text);
  const index  = number - 1;

  // 전투/파티 상태는 항상 최우선 (다른 플레이어의 행동으로 상태가 바뀌었을 수 있음)
  if (db.battles[userId]) {
    return battleChoices()[index]?.command || text;
  }
  const party = player.partyId ? db.parties[player.partyId] : null;
  if (party?.started) {
    return dungeonBattleChoices()[index]?.command || text;
  }
  if (party && !party.started) {
    return partyRoomChoices(party, userId)[index]?.command || text;
  }

  // 메뉴 선택지 (페이징 포함)
  if (player.choices?.length) {
    const command = visibleChoices(player, player.choices).find((c) => c.number === number)?.command;
    if (command === "__prev_choices") {
      player.choicePage = Math.max(0, (player.choicePage || 0) - 1);
      return "__show_choices";
    }
    if (command === "__next_choices") {
      const hasBack = Boolean(player.choiceBackCommand);
      const fpi = hasBack ? 4 : 5;
      const mpi = hasBack ? 3 : 4;
      const maxPage = Math.max(0, Math.ceil((player.choices.length - fpi) / mpi));
      player.choicePage = Math.min(maxPage, (player.choicePage || 0) + 1);
      return "__show_choices";
    }
    return command || text;
  }

  return generalChoices()[index]?.command || text;
}

// ── 메인 핸들러 ──────────────────────────────────────────────────────

function handleCommand(userId, rawText) {
  const db     = loadDb();
  const player = getPlayer(db, userId);
  const text   = resolveNumberChoice(db, player, userId, String(rawText || "").trim());
  const [command, ...args] = text.split(/\s+/);
  const arg1    = args[0];
  const arg2    = args[1];
  const restText = args.join(" ");
  let reply;
  let choices    = [];
  let backCommand = null;

  try {
    // 던전 파티 전투 중이면 먼저 확인
    const dungeonReply =
      command === "__show_choices" || command === "__battle_skills" || command === "스킬"
        ? null
        : doDungeonAction(db, player, userId, text);

    if (dungeonReply) {
      reply = dungeonReply;
    } else if (command === "__show_choices") {
      reply = "선택지를 이동했습니다.";
      choices     = player.choices || generalChoices();
      backCommand = player.choiceBackCommand || null;
    // ── 메인 메뉴 ──
    } else if (command === "__main_menu") {
      reply   = "메인 메뉴입니다.";
      choices = generalChoices();
    } else if (!command || command === "help") {
      reply = [
        "숫자로 모든 메뉴를 이용할 수 있습니다.",
        "메뉴 → 상태, 사냥, 마을, 상점, 인벤토리, 휴식, 스탯, 전직, 던전, 대장간",
        "전투 → 1.공격 2.스킬 3.방어 4.도망",
        "파티방 → 1.준비(해제) 2.새로고침 3.나가기"
      ].join("\n");
    // ── 상태 ──
    } else if (command === "상태") {
      reply = status(player);
    // ── 마을 ──
    } else if (command === "마을") {
      reply   = showTown(player);
      choices = townChoices(player);
      backCommand = "__main_menu";
    } else if (command === "이동") {
      reply   = moveTown(player, restText);
      choices = townChoices(player);
      backCommand = "__main_menu";
    // ── 사냥 ──
    } else if (command === "사냥") {
      reply = startHunt(db, player, userId);
    } else if (["공격", "방어", "도망"].includes(command) || command === "스킬사용") {
      reply = doBattleTurn(db, player, userId, text);
    // ── 스킬 선택 ──
    } else if (command === "__battle_skills" || command === "스킬") {
      const avail = skillChoices(player);
      reply   = avail.length ? "사용할 스킬을 선택하세요." : "사용 가능한 스킬이 없습니다.";
      choices = avail.length ? avail : battleChoices();
      backCommand = avail.length ? "__battle_menu" : null;
    } else if (command === "__battle_menu") {
      reply   = "전투 행동을 선택하세요.";
      choices = (player.partyId && db.parties[player.partyId]?.started) ? dungeonBattleChoices() : battleChoices();
    // ── 상점 ──
    } else if (command === "상점") {
      reply   = showShop(player);
      choices = shopMenuChoices();
    } else if (command === "__shop_menu") {
      reply   = showShop(player);
      choices = shopMenuChoices();
    } else if (command === "__shop_buy") {
      reply   = showShopBuy(player);
      choices = shopBuyChoices(player);
      backCommand = "__shop_menu";
    } else if (command === "__shop_sell") {
      reply   = showShopSell(player);
      choices = shopSellChoices(player);
      if (!choices.length) choices = [{ label: "판매 가능한 아이템 없음", command: "__show_choices" }];
      backCommand = "__shop_menu";
    } else if (command === "__shop_exit") {
      reply   = "상점을 나왔습니다.";
    } else if (command === "구매") {
      reply   = `${buyItem(player, restText)}\n\n${showShopBuy(player)}`;
      choices = shopBuyChoices(player);
      backCommand = "__shop_menu";
    } else if (command === "판매") {
      reply   = `${sellItem(player, restText)}\n\n${showShopSell(player)}`;
      choices = shopSellChoices(player);
      if (!choices.length) choices = [{ label: "판매 가능한 아이템 없음", command: "__show_choices" }];
      backCommand = "__shop_menu";
    // ── 인벤토리 ──
    } else if (command === "인벤토리" || command === "가방") {
      reply   = inventory(player);
      choices = inventoryChoices(player);
      backCommand = "__main_menu";
    } else if (command === "장착") {
      reply   = equip(player, restText);
      choices = inventoryChoices(player);
      backCommand = "__main_menu";
    // ── 스탯 ──
    } else if (command === "__stat_menu") {
      reply   = [`[스탯]`, `남은 포인트: ${player.statPoints}`, "올릴 능력치를 선택하세요."].join("\n");
      choices = statChoices();
      backCommand = "__main_menu";
    } else if (command === "스탯") {
      reply   = addStat(player, arg1, arg2);
      choices = statChoices();
      backCommand = "__main_menu";
    // ── 전직 ──
    } else if (command === "__job_menu") {
      reply   = [`[전직]`, `현재 직업: ${jobs[player.job].name}`, "전직할 직업을 선택하세요."].join("\n");
      choices = jobChoices(player);
      backCommand = "__main_menu";
    } else if (command === "전직") {
      reply   = changeJob(player, arg1);
      choices = jobChoices(player);
      backCommand = "__main_menu";
    // ── 휴식 ──
    } else if (command === "휴식") {
      reply = rest(player);
    // ── 대장간 ──
    } else if (command === "__smith_menu") {
      reply   = showSmith(player);
      choices = smithChoices();
      backCommand = "__main_menu";
    } else if (command === "강화") {
      reply   = smithEnhance(player, arg1);
      choices = smithChoices();
      backCommand = "__smith_menu";
    // ── 던전 ──
    } else if (command === "__dungeon_menu") {
      reply   = ["[던전]", "방을 만들거나, 열린 방에 참가하세요."].join("\n");
      choices = dungeonMenuChoices();
      backCommand = "__main_menu";
    } else if (command === "__dungeon_create") {
      const selectable = dungeonSelectChoices(player);
      reply   = selectable.length ? "[던전 선택]\n입장 가능한 던전을 선택하세요." : "입장 가능한 던전이 없습니다. 레벨을 올리세요.";
      choices = selectable.length ? selectable : dungeonMenuChoices();
      backCommand = "__dungeon_menu";
    } else if (command === "던전생성") {
      reply   = createDungeonParty(db, player, userId, arg1);
    } else if (command === "__dungeon_room_list") {
      const { text: listText, choices: roomChoices } = showRoomList(db);
      reply   = listText;
      choices = [...roomChoices, { label: "새로고침", command: "__dungeon_room_list" }];
      backCommand = "__dungeon_menu";
    } else if (command === "던전참가") {
      const party = db.parties[arg1];
      if (!party) {
        reply   = "해당 방이 사라졌습니다.";
        const { text: listText, choices: roomChoices } = showRoomList(db);
        reply  += "\n\n" + listText;
        choices = [...roomChoices, { label: "새로고침", command: "__dungeon_room_list" }];
        backCommand = "__dungeon_menu";
      } else if (party.members.length >= dungeons[party.dungeonId].maxPlayers) {
        reply   = "방이 가득 찼습니다.";
        const { text: listText, choices: roomChoices } = showRoomList(db);
        reply  += "\n\n" + listText;
        choices = [...roomChoices, { label: "새로고침", command: "__dungeon_room_list" }];
        backCommand = "__dungeon_menu";
      } else {
        reply = joinDungeonParty(db, player, userId, arg1);
      }
    } else if (command === "준비") {
      reply = readyDungeon(db, player, userId);
    } else if (command === "__party_refresh") {
      reply = showPartyRoom(db, player, userId, null);
    } else if (command === "던전나가기") {
      reply = leaveDungeon(db, player, userId);
    } else if (/^\d+$/.test(command)) {
      reply   = "해당 번호의 선택지가 없습니다.";
      choices = player.choices || [];
      backCommand = player.choiceBackCommand || null;
    } else {
      reply = "알 수 없는 명령입니다.\n숫자로 메뉴를 선택하세요.";
    }

    // ── 기본 선택지 결정 ──
    const party = player.partyId ? db.parties[player.partyId] : null;
    if (db.battles[userId] && !choices.length) {
      choices = battleChoices();
    } else if (party?.started && !choices.length) {
      choices = dungeonBattleChoices();
    } else if (party && !choices.length) {
      choices = partyRoomChoices(party, userId);
    } else if (!choices.length) {
      choices = generalChoices();
    }

    if (command !== "__show_choices" && !/^\d+$/.test(command)) player.choicePage = 0;
    player.choices = choices;
    player.choiceBackCommand = backCommand;
    reply = appendChoices(player, reply, choices);
  } finally {
    saveDb(db);
  }

  return reply;
}

module.exports = { handleCommand };
