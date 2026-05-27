const jobs = {
  novice: {
    name: "초보자", tier: 0, levelRequired: 1, hpPerLevel: 12, mpPerLevel: 4,
    statBonus: { str: 0, dex: 0, int: 0, vit: 0 },
    nextJobs: ["warrior", "mage", "archer", "rogue", "cleric", "monk", "bard", "paladin"]
  },
  // ── 1차 직업 (Lv.5) ──────────────────────────────────────────────
  warrior: {
    name: "전사", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["knight"],
    hpPerLevel: 18, mpPerLevel: 3, statBonus: { str: 3, dex: 0, int: 0, vit: 2 }
  },
  mage: {
    name: "마법사", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["wizard"],
    hpPerLevel: 9, mpPerLevel: 12, statBonus: { str: 0, dex: 0, int: 4, vit: 1 }
  },
  archer: {
    name: "궁수", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["ranger"],
    hpPerLevel: 12, mpPerLevel: 5, statBonus: { str: 1, dex: 4, int: 0, vit: 0 }
  },
  rogue: {
    name: "도적", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["assassin"],
    hpPerLevel: 11, mpPerLevel: 5, statBonus: { str: 1, dex: 3, int: 0, vit: 1 }
  },
  cleric: {
    name: "성직자", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["priest"],
    hpPerLevel: 13, mpPerLevel: 10, statBonus: { str: 0, dex: 0, int: 2, vit: 2 }
  },
  monk: {
    name: "무도가", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["fighter"],
    hpPerLevel: 16, mpPerLevel: 4, statBonus: { str: 2, dex: 2, int: 0, vit: 2 }
  },
  bard: {
    name: "음유시인", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["minstrel"],
    hpPerLevel: 10, mpPerLevel: 8, statBonus: { str: 0, dex: 2, int: 2, vit: 1 }
  },
  paladin: {
    name: "팔라딘", tier: 1, levelRequired: 5, prevJob: "novice", nextJobs: ["holy_knight"],
    hpPerLevel: 16, mpPerLevel: 7, statBonus: { str: 2, dex: 0, int: 1, vit: 3 }
  },
  // ── 2차 직업 (Lv.20) ─────────────────────────────────────────────
  knight: {
    name: "검사", tier: 2, levelRequired: 20, prevJob: "warrior", nextJobs: ["crusader"],
    hpPerLevel: 22, mpPerLevel: 4, statBonus: { str: 5, dex: 0, int: 0, vit: 4 }
  },
  wizard: {
    name: "마도사", tier: 2, levelRequired: 20, prevJob: "mage", nextJobs: ["archmage"],
    hpPerLevel: 11, mpPerLevel: 16, statBonus: { str: 0, dex: 0, int: 7, vit: 2 }
  },
  ranger: {
    name: "레인저", tier: 2, levelRequired: 20, prevJob: "archer", nextJobs: ["hawk_eye"],
    hpPerLevel: 15, mpPerLevel: 7, statBonus: { str: 2, dex: 7, int: 0, vit: 1 }
  },
  assassin: {
    name: "암살자", tier: 2, levelRequired: 20, prevJob: "rogue", nextJobs: ["shadow_lord"],
    hpPerLevel: 14, mpPerLevel: 7, statBonus: { str: 2, dex: 6, int: 0, vit: 2 }
  },
  priest: {
    name: "사제", tier: 2, levelRequired: 20, prevJob: "cleric", nextJobs: ["bishop"],
    hpPerLevel: 15, mpPerLevel: 14, statBonus: { str: 0, dex: 0, int: 5, vit: 3 }
  },
  fighter: {
    name: "무신", tier: 2, levelRequired: 20, prevJob: "monk", nextJobs: ["grandmaster"],
    hpPerLevel: 20, mpPerLevel: 5, statBonus: { str: 4, dex: 3, int: 0, vit: 3 }
  },
  minstrel: {
    name: "음유악사", tier: 2, levelRequired: 20, prevJob: "bard", nextJobs: ["legend_bard"],
    hpPerLevel: 13, mpPerLevel: 11, statBonus: { str: 1, dex: 3, int: 4, vit: 2 }
  },
  holy_knight: {
    name: "성기사", tier: 2, levelRequired: 20, prevJob: "paladin", nextJobs: ["divine_knight"],
    hpPerLevel: 20, mpPerLevel: 9, statBonus: { str: 3, dex: 0, int: 2, vit: 5 }
  },
  // ── 3차 직업 (Lv.40) ─────────────────────────────────────────────
  crusader: {
    name: "십자군", tier: 3, levelRequired: 40, prevJob: "knight", nextJobs: [],
    hpPerLevel: 28, mpPerLevel: 5, statBonus: { str: 8, dex: 0, int: 0, vit: 7 }
  },
  archmage: {
    name: "대마법사", tier: 3, levelRequired: 40, prevJob: "wizard", nextJobs: [],
    hpPerLevel: 14, mpPerLevel: 22, statBonus: { str: 0, dex: 0, int: 12, vit: 3 }
  },
  hawk_eye: {
    name: "매의 눈", tier: 3, levelRequired: 40, prevJob: "ranger", nextJobs: [],
    hpPerLevel: 19, mpPerLevel: 9, statBonus: { str: 3, dex: 11, int: 0, vit: 2 }
  },
  shadow_lord: {
    name: "그림자 군주", tier: 3, levelRequired: 40, prevJob: "assassin", nextJobs: [],
    hpPerLevel: 18, mpPerLevel: 9, statBonus: { str: 3, dex: 10, int: 0, vit: 3 }
  },
  bishop: {
    name: "주교", tier: 3, levelRequired: 40, prevJob: "priest", nextJobs: [],
    hpPerLevel: 18, mpPerLevel: 20, statBonus: { str: 0, dex: 0, int: 9, vit: 5 }
  },
  grandmaster: {
    name: "격투왕", tier: 3, levelRequired: 40, prevJob: "fighter", nextJobs: [],
    hpPerLevel: 25, mpPerLevel: 6, statBonus: { str: 7, dex: 5, int: 0, vit: 5 }
  },
  legend_bard: {
    name: "전설의 악사", tier: 3, levelRequired: 40, prevJob: "minstrel", nextJobs: [],
    hpPerLevel: 16, mpPerLevel: 15, statBonus: { str: 2, dex: 5, int: 7, vit: 3 }
  },
  divine_knight: {
    name: "신성기사", tier: 3, levelRequired: 40, prevJob: "holy_knight", nextJobs: [],
    hpPerLevel: 24, mpPerLevel: 12, statBonus: { str: 5, dex: 0, int: 4, vit: 8 }
  }
};

// skill types:
//  "damage"      : multiplier 기반 피해 (기본)
//  "heal"        : healPercent % of maxHP 자신 회복
//  "party_heal"  : healPercent % of maxHP 파티원 전체 회복 (솔로 시 자신)
//  "mp_restore"  : mpAmount MP 회복
//  "stun"        : multiplier 피해 + 적 반격 생략
//  "def_break"   : multiplier 피해 + 적 방어 defBreak 감소 (이번 턴)
//  "damage_heal" : multiplier 피해 + healPercent 자신 회복

const skills = {
  novice: [
    { id: "power_strike",   name: "강타",     level: 1,  mpCost: 8,  type: "damage",      multiplier: 1.55 },
    { id: "focus_hit",      name: "집중타",   level: 3,  mpCost: 12, type: "damage",      multiplier: 1.9  }
  ],
  warrior: [
    { id: "power_strike",   name: "강타",     level: 1,  mpCost: 8,  type: "damage",      multiplier: 1.55 },
    { id: "cleave",         name: "가르기",   level: 5,  mpCost: 14, type: "def_break",   multiplier: 1.9,  defBreak: 5  },
    { id: "heavy_crash",    name: "중격",     level: 8,  mpCost: 20, type: "damage",      multiplier: 2.65 },
    { id: "shield_bash",    name: "방패 강타", level: 12, mpCost: 22, type: "stun",        multiplier: 1.8  },
    { id: "battle_roar",    name: "전투 함성", level: 15, mpCost: 15, type: "def_break",   multiplier: 2.0,  defBreak: 10 }
  ],
  mage: [
    { id: "magic_bolt",     name: "마력탄",   level: 1,  mpCost: 8,  type: "damage",      multiplier: 1.65 },
    { id: "fireball",       name: "화염구",   level: 5,  mpCost: 16, type: "damage",      multiplier: 2.25 },
    { id: "arcane_lance",   name: "비전창",   level: 8,  mpCost: 24, type: "damage",      multiplier: 2.9  },
    { id: "frost_nova",     name: "빙결",     level: 12, mpCost: 20, type: "stun",        multiplier: 2.0  },
    { id: "mana_drain",     name: "마나 흡수", level: 15, mpCost: 0,  type: "mp_restore",  mpAmount: 30     }
  ],
  archer: [
    { id: "aimed_shot",     name: "조준 사격", level: 1,  mpCost: 8,  type: "damage",      multiplier: 1.6  },
    { id: "double_shot",    name: "연속 사격", level: 5,  mpCost: 15, type: "damage",      multiplier: 2.15 },
    { id: "piercing_arrow", name: "관통 화살", level: 8,  mpCost: 22, type: "def_break",   multiplier: 2.4,  defBreak: 8  },
    { id: "explosive_shot", name: "폭발 화살", level: 12, mpCost: 25, type: "damage",      multiplier: 2.8  },
    { id: "evasion_shot",   name: "회피 사격", level: 15, mpCost: 18, type: "stun",        multiplier: 1.7  }
  ],
  rogue: [
    { id: "quick_stab",     name: "기습",     level: 1,  mpCost: 8,  type: "damage",      multiplier: 1.6  },
    { id: "shadow_cut",     name: "그림자 베기", level: 5, mpCost: 15, type: "damage",     multiplier: 2.2  },
    { id: "assassinate",    name: "암살",     level: 8,  mpCost: 24, type: "damage",      multiplier: 3.0  },
    { id: "poison_blade",   name: "독 칼날",  level: 12, mpCost: 20, type: "def_break",   multiplier: 2.0,  defBreak: 12 },
    { id: "shadow_vanish",  name: "그림자 소멸", level: 15, mpCost: 18, type: "stun",      multiplier: 2.3  }
  ],
  cleric: [
    { id: "holy_light",     name: "신성광",   level: 1,  mpCost: 10, type: "heal",        healPercent: 20  },
    { id: "smite",          name: "응징",     level: 3,  mpCost: 8,  type: "damage",      multiplier: 1.5  },
    { id: "cure",           name: "치유",     level: 5,  mpCost: 16, type: "heal",        healPercent: 35  },
    { id: "holy_strike",    name: "성스러운 타격", level: 8, mpCost: 18, type: "damage",   multiplier: 2.0  },
    { id: "group_heal",     name: "집단 치유", level: 12, mpCost: 28, type: "party_heal",  healPercent: 15  },
    { id: "divine_grace",   name: "신성 은총", level: 15, mpCost: 30, type: "party_heal",  healPercent: 22  }
  ],
  monk: [
    { id: "iron_fist",      name: "철권",     level: 1,  mpCost: 6,  type: "damage",      multiplier: 1.6  },
    { id: "tiger_strike",   name: "호랑이 타격", level: 3, mpCost: 10, type: "damage",    multiplier: 2.0  },
    { id: "whirlwind",      name: "회오리바람", level: 5, mpCost: 14, type: "damage",      multiplier: 2.3  },
    { id: "meditation",     name: "명상",     level: 8,  mpCost: 0,  type: "mp_restore",  mpAmount: 25     },
    { id: "counter_strike", name: "반격",     level: 12, mpCost: 14, type: "stun",        multiplier: 2.0  },
    { id: "hundred_fists",  name: "백 권",    level: 15, mpCost: 22, type: "def_break",   multiplier: 2.5,  defBreak: 8  }
  ],
  bard: [
    { id: "song_of_healing", name: "치유의 노래", level: 1, mpCost: 10, type: "heal",     healPercent: 15  },
    { id: "dissonance",     name: "불협화음",  level: 3,  mpCost: 10, type: "def_break",  multiplier: 1.4,  defBreak: 8  },
    { id: "war_song",       name: "전쟁의 노래", level: 5, mpCost: 18, type: "damage",    multiplier: 1.9  },
    { id: "lullaby",        name: "자장가",   level: 8,  mpCost: 20, type: "stun",        multiplier: 1.5  },
    { id: "anthem",         name: "찬가",     level: 12, mpCost: 25, type: "party_heal",  healPercent: 12  },
    { id: "hymn_of_valor",  name: "용기의 찬가", level: 15, mpCost: 30, type: "party_heal", healPercent: 20 }
  ],
  paladin: [
    { id: "righteousness",  name: "정의의 일격", level: 1, mpCost: 10, type: "damage_heal", multiplier: 1.4, healPercent: 8 },
    { id: "judgment",       name: "심판",     level: 3,  mpCost: 14, type: "damage",      multiplier: 1.8  },
    { id: "lay_on_hands",   name: "안수 치유", level: 5,  mpCost: 18, type: "heal",        healPercent: 30  },
    { id: "holy_shield",    name: "신성 방패", level: 8,  mpCost: 14, type: "stun",        multiplier: 1.6  },
    { id: "sacred_ground",  name: "성역",     level: 12, mpCost: 28, type: "party_heal",  healPercent: 15  },
    { id: "divine_grace",   name: "신성 은총", level: 15, mpCost: 30, type: "damage_heal", multiplier: 2.0,  healPercent: 15 }
  ],

  // ── 2차 직업 스킬 ─────────────────────────────────────────────────
  knight: [
    { id: "cross_slash",    name: "십자 베기", level: 20, mpCost: 28, type: "damage",      multiplier: 3.0  },
    { id: "provoke",        name: "도발",     level: 23, mpCost: 20, type: "def_break",   multiplier: 1.5,  defBreak: 18 },
    { id: "iron_will",      name: "강철 의지", level: 27, mpCost: 30, type: "heal",        healPercent: 25  },
    { id: "tempest_blade",  name: "폭풍 검",  level: 30, mpCost: 38, type: "damage",      multiplier: 3.6  },
    { id: "blade_dance",    name: "검무",     level: 35, mpCost: 48, type: "def_break",   multiplier: 3.8,  defBreak: 20 }
  ],
  wizard: [
    { id: "chain_lightning", name: "연쇄 번개", level: 20, mpCost: 30, type: "damage",    multiplier: 3.2  },
    { id: "meteor",          name: "유성",    level: 23, mpCost: 42, type: "stun",        multiplier: 3.5  },
    { id: "mana_recovery",   name: "마나 회수", level: 27, mpCost: 0,  type: "mp_restore", mpAmount: 50     },
    { id: "blizzard",        name: "눈보라",  level: 30, mpCost: 48, type: "def_break",   multiplier: 3.8,  defBreak: 22 },
    { id: "time_warp",       name: "시간 왜곡", level: 35, mpCost: 58, type: "damage",    multiplier: 4.5  }
  ],
  ranger: [
    { id: "multi_arrow",    name: "다중 화살", level: 20, mpCost: 28, type: "def_break",  multiplier: 2.8,  defBreak: 12 },
    { id: "hawk_vision",    name: "매의 시야", level: 23, mpCost: 35, type: "damage",     multiplier: 3.5  },
    { id: "trap",           name: "덫",       level: 27, mpCost: 25, type: "stun",        multiplier: 2.5  },
    { id: "storm_arrow",    name: "폭풍 화살", level: 30, mpCost: 45, type: "damage",     multiplier: 4.2  },
    { id: "nature_call",    name: "자연의 부름", level: 35, mpCost: 55, type: "damage",   multiplier: 4.8  }
  ],
  assassin: [
    { id: "shadow_step",    name: "그림자 발걸음", level: 20, mpCost: 28, type: "damage", multiplier: 3.5  },
    { id: "deadly_strike",  name: "치명타",  level: 23, mpCost: 35, type: "damage",      multiplier: 4.0  },
    { id: "shadow_clone",   name: "그림자 분신", level: 27, mpCost: 40, type: "def_break", multiplier: 3.0, defBreak: 18 },
    { id: "marking",        name: "표식",    level: 30, mpCost: 25, type: "def_break",   multiplier: 2.0,  defBreak: 25 },
    { id: "death_mark",     name: "죽음의 낙인", level: 35, mpCost: 58, type: "stun",    multiplier: 4.5  }
  ],
  priest: [
    { id: "greater_heal",   name: "상급 치유", level: 20, mpCost: 22, type: "heal",       healPercent: 45  },
    { id: "resurrection_aura", name: "소생 오라", level: 23, mpCost: 38, type: "party_heal", healPercent: 25 },
    { id: "sacred_fire",    name: "성화",     level: 27, mpCost: 35, type: "damage",      multiplier: 3.0  },
    { id: "rejuvenation",   name: "회복",     level: 30, mpCost: 42, type: "heal",        healPercent: 60  },
    { id: "grand_heal",     name: "대치유",   level: 35, mpCost: 55, type: "party_heal",  healPercent: 35  }
  ],
  fighter: [
    { id: "breaking_wave",  name: "파도 깨기", level: 20, mpCost: 28, type: "damage",    multiplier: 3.2  },
    { id: "focus_energy",   name: "기 집중",  level: 23, mpCost: 20, type: "mp_restore",  mpAmount: 40     },
    { id: "earth_slam",     name: "대지 강타", level: 27, mpCost: 38, type: "stun",       multiplier: 3.5  },
    { id: "ki_blast",       name: "기공파",   level: 30, mpCost: 42, type: "def_break",  multiplier: 3.8,  defBreak: 20 },
    { id: "spiral_kick",    name: "회오리 발차기", level: 35, mpCost: 52, type: "damage", multiplier: 4.6  }
  ],
  minstrel: [
    { id: "ballad_of_fury", name: "분노의 발라드", level: 20, mpCost: 28, type: "damage", multiplier: 2.8  },
    { id: "encore",         name: "앙코르",   level: 23, mpCost: 30, type: "party_heal",  healPercent: 22  },
    { id: "requiem",        name: "레퀴엠",   level: 27, mpCost: 35, type: "def_break",  multiplier: 3.2,  defBreak: 18 },
    { id: "grand_symphony", name: "대교향곡", level: 30, mpCost: 42, type: "party_heal",  healPercent: 32  },
    { id: "aria_of_doom",   name: "멸망의 아리아", level: 35, mpCost: 52, type: "stun",  multiplier: 3.8  }
  ],
  holy_knight: [
    { id: "holy_slash",     name: "성검 베기", level: 20, mpCost: 30, type: "damage_heal", multiplier: 2.8, healPercent: 18 },
    { id: "blessed_armor",  name: "축복의 갑옷", level: 23, mpCost: 25, type: "heal",     healPercent: 30  },
    { id: "sanctuary",      name: "성역",     level: 27, mpCost: 38, type: "party_heal",  healPercent: 28  },
    { id: "divine_sword",   name: "신성검",   level: 30, mpCost: 42, type: "damage",      multiplier: 3.8  },
    { id: "holy_aura",      name: "신성 오라", level: 35, mpCost: 45, type: "damage_heal", multiplier: 3.2, healPercent: 22 }
  ],

  // ── 3차 직업 스킬 ─────────────────────────────────────────────────
  crusader: [
    { id: "holy_blade",     name: "성검 일섬", level: 40, mpCost: 50, type: "damage",      multiplier: 4.8  },
    { id: "divine_smite",   name: "신성 강타", level: 43, mpCost: 60, type: "stun",        multiplier: 5.0  },
    { id: "crusader_aura",  name: "십자군 오라", level: 47, mpCost: 45, type: "party_heal", healPercent: 30 },
    { id: "omega_blade",    name: "오메가 검", level: 50, mpCost: 80, type: "def_break",   multiplier: 6.0,  defBreak: 35 }
  ],
  archmage: [
    { id: "supernova",      name: "초신성",   level: 40, mpCost: 65, type: "stun",        multiplier: 5.5  },
    { id: "arcane_eruption", name: "비전 폭발", level: 43, mpCost: 75, type: "damage",    multiplier: 6.0  },
    { id: "mana_overflow",  name: "마나 범람", level: 47, mpCost: 0,  type: "mp_restore",  mpAmount: 120    },
    { id: "void_explosion", name: "허공 폭발", level: 50, mpCost: 95, type: "def_break",  multiplier: 7.5,  defBreak: 40 }
  ],
  hawk_eye: [
    { id: "snipe",          name: "저격",     level: 40, mpCost: 60, type: "damage",      multiplier: 5.5  },
    { id: "arrow_storm",    name: "화살 폭풍", level: 43, mpCost: 72, type: "stun",       multiplier: 4.8  },
    { id: "piercing_rain",  name: "관통비",   level: 47, mpCost: 82, type: "def_break",   multiplier: 6.0,  defBreak: 35 },
    { id: "infinity_shot",  name: "무한의 화살", level: 50, mpCost: 98, type: "damage",   multiplier: 7.5  }
  ],
  shadow_lord: [
    { id: "shadowbolt",     name: "어둠의 화살", level: 40, mpCost: 60, type: "damage",   multiplier: 5.5  },
    { id: "void_strike",    name: "허공 타격", level: 43, mpCost: 75, type: "stun",       multiplier: 6.0  },
    { id: "chaos_shadow",   name: "혼돈의 그림자", level: 47, mpCost: 85, type: "def_break", multiplier: 6.5, defBreak: 40 },
    { id: "shadow_realm",   name: "그림자 세계", level: 50, mpCost: 100, type: "damage",  multiplier: 8.0  }
  ],
  bishop: [
    { id: "miracle",        name: "기적",     level: 40, mpCost: 52, type: "heal",        healPercent: 100 },
    { id: "holy_word",      name: "성언",     level: 43, mpCost: 65, type: "party_heal",  healPercent: 50  },
    { id: "divine_judgment", name: "신성 심판", level: 47, mpCost: 72, type: "damage_heal", multiplier: 5.5, healPercent: 25 },
    { id: "blessing_of_god", name: "신의 축복", level: 50, mpCost: 85, type: "party_heal", healPercent: 100 }
  ],
  grandmaster: [
    { id: "dragon_fist",    name: "용의 주먹", level: 40, mpCost: 60, type: "stun",       multiplier: 5.5  },
    { id: "nirvana",        name: "열반",     level: 43, mpCost: 0,  type: "mp_restore",  mpAmount: 150    },
    { id: "void_palm",      name: "허공 장",  level: 47, mpCost: 78, type: "def_break",   multiplier: 6.5,  defBreak: 38 },
    { id: "ultimate_arts",  name: "극의",     level: 50, mpCost: 95, type: "damage",      multiplier: 8.0  }
  ],
  legend_bard: [
    { id: "legend_song",    name: "전설의 노래", level: 40, mpCost: 60, type: "party_heal", healPercent: 40 },
    { id: "eternal_melody", name: "영원의 선율", level: 43, mpCost: 68, type: "damage",    multiplier: 5.0  },
    { id: "song_of_ancients", name: "고대의 노래", level: 47, mpCost: 78, type: "damage_heal", multiplier: 5.8, healPercent: 28 },
    { id: "masterpiece",    name: "걸작",     level: 50, mpCost: 90, type: "party_heal",   healPercent: 100 }
  ],
  divine_knight: [
    { id: "divine_wrath",   name: "신성 분노", level: 40, mpCost: 55, type: "damage",      multiplier: 5.0  },
    { id: "gods_hand",      name: "신의 손",  level: 43, mpCost: 65, type: "party_heal",   healPercent: 55  },
    { id: "sacred_vow",     name: "성스러운 서약", level: 47, mpCost: 52, type: "stun",    multiplier: 4.5  },
    { id: "divine_justice", name: "신성 심판", level: 50, mpCost: 85, type: "damage_heal", multiplier: 6.5,  healPercent: 35 }
  ]
};

const towns = {
  start: {
    name: "시작의 마을",
    description: "초보 모험가들이 모이는 작은 마을입니다.",
    connections: ["forest", "mine"],
    shop: ["rusty_sword", "wooden_staff", "training_dagger", "cloth_hat", "cloth_armor", "cloth_pants", "leather_cap", "leather_armor", "leather_pants"],
    huntingGround: "green_field",
    hasSmith: true
  },
  forest: {
    name: "숲 마을",
    description: "깊은 숲 근처에 자리 잡은 사냥꾼의 마을입니다.",
    connections: ["start", "harbor"],
    shop: ["hunter_bow", "iron_sword", "forest_hood", "forest_armor", "forest_pants"],
    huntingGround: "deep_forest",
    hasSmith: true
  },
  mine: {
    name: "광산 마을",
    description: "광부와 대장장이가 모이는 거친 마을입니다.",
    connections: ["start", "highland"],
    shop: ["iron_sword", "iron_helmet", "iron_armor", "iron_greaves"],
    huntingGround: "old_mine",
    hasSmith: true
  },
  harbor: {
    name: "항구 마을",
    description: "먼 지역으로 떠나는 배가 정박하는 항구입니다.",
    connections: ["forest", "highland"],
    shop: ["steel_sword", "mage_hat", "mage_robe", "mage_pants", "steel_helmet", "steel_armor", "steel_greaves"],
    huntingGround: "pirate_cove",
    hasSmith: true
  },
  highland: {
    name: "고원 도시",
    description: "험준한 고원에 세워진 중급 모험가의 거점입니다.",
    connections: ["mine", "harbor", "dragon_plains"],
    shop: ["mithril_sword", "mithril_staff", "mithril_bow", "mithril_dagger", "healing_staff",
           "mithril_helmet", "mithril_armor", "mithril_greaves",
           "cleric_hood", "cleric_robe", "cleric_pants",
           "monk_headband", "monk_gi", "monk_pants"],
    huntingGround: "highland_ruins",
    hasSmith: true
  },
  dragon_plains: {
    name: "용의 황야",
    description: "강대한 마수와 드래곤이 출몰하는 최전선 거점입니다.",
    connections: ["highland"],
    shop: ["dragon_sword", "dragon_staff", "dragon_bow", "dragon_fang_dagger", "divine_scepter",
           "dragon_helmet", "dragon_armor", "dragon_greaves",
           "bishop_mitre", "bishop_robe", "bishop_pants",
           "shadow_mask", "shadow_cloak", "shadow_boots",
           "divine_crown", "divine_plate", "divine_greaves"],
    huntingGround: "dragon_wasteland",
    hasSmith: true
  }
};

const items = {
  // ── 무기 ────────────────────────────────────────────────────────
  rusty_sword:        { name: "녹슨 검",          type: "weapon", price: 35,   atk: 4 },
  wooden_staff:       { name: "나무 지팡이",       type: "weapon", price: 35,   atk: 2,  magic: 4 },
  training_dagger:    { name: "수련 단검",         type: "weapon", price: 45,   atk: 3,  dex: 1 },
  hunter_bow:         { name: "사냥꾼의 활",       type: "weapon", price: 90,   atk: 7,  dex: 1 },
  iron_sword:         { name: "철검",             type: "weapon", price: 120,  atk: 10 },
  steel_sword:        { name: "강철검",           type: "weapon", price: 260,  atk: 18 },
  mithril_sword:      { name: "미스릴 검",         type: "weapon", price: 680,  atk: 32, str: 2 },
  dragon_sword:       { name: "용의 검",           type: "weapon", price: 1800, atk: 58, str: 5 },
  wooden_staff:       { name: "나무 지팡이",       type: "weapon", price: 35,   atk: 2,  magic: 4 },
  mithril_staff:      { name: "미스릴 지팡이",     type: "weapon", price: 650,  atk: 8,  magic: 28, int: 3 },
  dragon_staff:       { name: "용의 지팡이",       type: "weapon", price: 1750, atk: 12, magic: 55, int: 6 },
  healing_staff:      { name: "치유의 지팡이",     type: "weapon", price: 700,  atk: 5,  magic: 24, int: 2, vit: 2 },
  divine_scepter:     { name: "신성 홀",           type: "weapon", price: 1850, atk: 10, magic: 50, int: 5, vit: 4 },
  mithril_bow:        { name: "미스릴 활",         type: "weapon", price: 660,  atk: 30, dex: 3 },
  dragon_bow:         { name: "용의 활",           type: "weapon", price: 1800, atk: 55, dex: 6 },
  mithril_dagger:     { name: "미스릴 단검",       type: "weapon", price: 640,  atk: 28, dex: 2, str: 1 },
  dragon_fang_dagger: { name: "용의 송곳니",       type: "weapon", price: 1750, atk: 52, dex: 5, str: 3 },

  // 직업 전용 무기 (몬스터 드롭)
  novice_relic_blade:     { name: "모험가의 유산검",   type: "weapon", price: 420,  atk: 22, vit: 1 },
  warrior_kingslayer:     { name: "왕살해자의 대검",   type: "weapon", price: 520,  atk: 30, str: 3 },
  mage_soul_staff:        { name: "혼령의 지팡이",     type: "weapon", price: 520,  atk: 8,  magic: 24, int: 3 },
  archer_goblin_piercer:  { name: "고블린 관통궁",     type: "weapon", price: 520,  atk: 24, dex: 3 },
  rogue_shadow_fang:      { name: "그림자 송곳니",     type: "weapon", price: 520,  atk: 25, dex: 2, str: 1 },
  cleric_blessed_mace:    { name: "축복받은 철퇴",     type: "weapon", price: 520,  atk: 18, magic: 10, vit: 2 },
  monk_iron_gauntlet:     { name: "철 권갑",           type: "weapon", price: 520,  atk: 26, str: 2, dex: 1 },
  bard_silver_lute:       { name: "은빛 류트",         type: "weapon", price: 520,  atk: 10, magic: 16, dex: 2 },
  paladin_holy_lance:     { name: "성스러운 창",       type: "weapon", price: 520,  atk: 20, magic: 12, vit: 2 },
  knight_zweihander:      { name: "기사 대검",         type: "weapon", price: 1200, atk: 48, str: 4, vit: 2 },
  wizard_arcane_tome:     { name: "비전 마법서",       type: "weapon", price: 1200, atk: 10, magic: 46, int: 5 },
  ranger_composite_bow:   { name: "복합 강궁",         type: "weapon", price: 1200, atk: 45, dex: 5 },
  assassin_void_blade:    { name: "허공 단검",         type: "weapon", price: 1200, atk: 44, dex: 4, str: 2 },
  priest_grand_cross:     { name: "대성십자가",        type: "weapon", price: 1200, atk: 12, magic: 44, int: 4, vit: 2 },
  fighter_dragon_knuckle: { name: "용의 권갑",         type: "weapon", price: 1200, atk: 46, str: 4, dex: 2 },
  minstrel_golden_lute:   { name: "황금 류트",         type: "weapon", price: 1200, atk: 12, magic: 38, dex: 4, int: 2 },
  holy_knight_blessed_sword: { name: "축복의 성검",    type: "weapon", price: 1200, atk: 40, magic: 20, vit: 3 },

  // ── 방어구 – 모자 ───────────────────────────────────────────────
  cloth_hat:      { name: "천 모자",           type: "hat",    price: 15,   def: 1,  set: "cloth" },
  leather_cap:    { name: "가죽 모자",         type: "hat",    price: 45,   def: 2,  dex: 1, set: "leather" },
  forest_hood:    { name: "숲지기 두건",       type: "hat",    price: 95,   def: 3,  dex: 1, set: "forest" },
  iron_helmet:    { name: "철 투구",           type: "hat",    price: 110,  def: 5,  set: "iron" },
  mage_hat:       { name: "마도사의 모자",     type: "hat",    price: 140,  def: 2,  magic: 3, int: 1, set: "mage" },
  steel_helmet:   { name: "강철 투구",         type: "hat",    price: 220,  def: 8,  set: "steel" },
  mithril_helmet: { name: "미스릴 투구",       type: "hat",    price: 580,  def: 14, vit: 1, set: "mithril" },
  dragon_helmet:  { name: "용의 투구",         type: "hat",    price: 1600, def: 26, str: 2, vit: 2, set: "dragon" },
  cleric_hood:    { name: "성직자 두건",       type: "hat",    price: 590,  def: 9,  magic: 5, int: 1, set: "cleric" },
  monk_headband:  { name: "무도가 머리띠",     type: "hat",    price: 570,  def: 11, str: 1, dex: 1, set: "monk_set" },
  bishop_mitre:   { name: "주교 관",           type: "hat",    price: 1620, def: 16, magic: 12, int: 3, set: "bishop_set" },
  shadow_mask:    { name: "그림자 복면",       type: "hat",    price: 1580, def: 18, dex: 4, set: "shadow" },
  divine_crown:   { name: "신성 왕관",         type: "hat",    price: 1650, def: 20, magic: 10, vit: 3, set: "divine" },

  // ── 방어구 – 상의 ───────────────────────────────────────────────
  cloth_armor:    { name: "천 상의",           type: "top",    price: 25,   def: 2,  set: "cloth" },
  leather_armor:  { name: "가죽 상의",         type: "top",    price: 60,   def: 5,  set: "leather" },
  forest_armor:   { name: "숲지기 상의",       type: "top",    price: 125,  def: 8,  dex: 1, set: "forest" },
  iron_armor:     { name: "철 상의",           type: "top",    price: 150,  def: 11, set: "iron" },
  mage_robe:      { name: "마도사의 상의",     type: "top",    price: 180,  def: 5,  magic: 5, set: "mage" },
  steel_armor:    { name: "강철 상의",         type: "top",    price: 300,  def: 18, set: "steel" },
  mithril_armor:  { name: "미스릴 상의",       type: "top",    price: 780,  def: 30, vit: 2, set: "mithril" },
  dragon_armor:   { name: "용의 갑옷",         type: "top",    price: 2100, def: 55, str: 3, vit: 4, set: "dragon" },
  cleric_robe:    { name: "성직자 법의",       type: "top",    price: 790,  def: 18, magic: 10, int: 2, set: "cleric" },
  monk_gi:        { name: "무도가 도복",       type: "top",    price: 760,  def: 22, str: 2, dex: 2, set: "monk_set" },
  bishop_robe:    { name: "주교 법의",         type: "top",    price: 2150, def: 32, magic: 24, int: 5, set: "bishop_set" },
  shadow_cloak:   { name: "그림자 망토",       type: "top",    price: 2050, def: 38, dex: 6, set: "shadow" },
  divine_plate:   { name: "신성 흉갑",         type: "top",    price: 2200, def: 45, magic: 18, vit: 5, set: "divine" },

  // ── 방어구 – 하의 ───────────────────────────────────────────────
  cloth_pants:    { name: "천 하의",           type: "bottom", price: 20,   def: 1,  set: "cloth" },
  leather_pants:  { name: "가죽 하의",         type: "bottom", price: 50,   def: 3,  set: "leather" },
  forest_pants:   { name: "숲지기 하의",       type: "bottom", price: 110,  def: 5,  dex: 1, set: "forest" },
  iron_greaves:   { name: "철 하의",           type: "bottom", price: 130,  def: 7,  set: "iron" },
  mage_pants:     { name: "마도사의 하의",     type: "bottom", price: 150,  def: 3,  magic: 2, set: "mage" },
  steel_greaves:  { name: "강철 하의",         type: "bottom", price: 260,  def: 12, set: "steel" },
  mithril_greaves:{ name: "미스릴 하의",       type: "bottom", price: 660,  def: 22, vit: 1, set: "mithril" },
  dragon_greaves: { name: "용의 하의",         type: "bottom", price: 1850, def: 40, str: 2, vit: 3, set: "dragon" },
  cleric_pants:   { name: "성직자 하의",       type: "bottom", price: 660,  def: 13, magic: 6, set: "cleric" },
  monk_pants:     { name: "무도가 하의",       type: "bottom", price: 640,  def: 16, dex: 1, set: "monk_set" },
  bishop_pants:   { name: "주교 하의",         type: "bottom", price: 1850, def: 24, magic: 16, int: 3, set: "bishop_set" },
  shadow_boots:   { name: "그림자 장화",       type: "bottom", price: 1800, def: 28, dex: 4, set: "shadow" },
  divine_greaves: { name: "신성 하의",         type: "bottom", price: 1950, def: 34, magic: 12, vit: 4, set: "divine" },

  // ── 소모품/재료 ─────────────────────────────────────────────────
  slime_jelly:            { name: "슬라임 젤리",         type: "junk", price: 4  },
  wolf_pelt:              { name: "늑대 가죽",           type: "junk", price: 8  },
  spider_silk:            { name: "거미줄",              type: "junk", price: 14 },
  orc_badge:              { name: "오크 휘장",           type: "junk", price: 22 },
  bat_wing:               { name: "박쥐 날개",           type: "junk", price: 12 },
  golem_core:             { name: "금 간 골렘 핵",       type: "junk", price: 30 },
  pirate_coin:            { name: "해적 은화",           type: "junk", price: 38 },
  witch_pearl:            { name: "마녀의 진주",         type: "junk", price: 52 },
  goblin_crown_piece:     { name: "깨진 고블린 왕관 조각", type: "junk", price: 65 },
  dark_crystal:           { name: "어둠의 수정",         type: "junk", price: 90 },
  wyvern_scale:           { name: "와이번 비늘",         type: "junk", price: 120},
  stone_golem_fragment:   { name: "석상 파편",           type: "junk", price: 80 },
  banshee_tear:           { name: "밴시의 눈물",         type: "junk", price: 100},
  lich_bone:              { name: "리치의 뼛조각",       type: "junk", price: 150},
  demon_horn:             { name: "악마의 뿔",           type: "junk", price: 200},
  dragon_scale:           { name: "용의 비늘",           type: "junk", price: 280},
  ancient_relic:          { name: "고대 유물 파편",      type: "junk", price: 350}
};

const setBonuses = {
  cloth:      { name: "수습자 세트",   pieces: ["cloth_hat",    "cloth_armor",   "cloth_pants"],   bonus: { def: 2, vit: 1 } },
  leather:    { name: "가죽 세트",     pieces: ["leather_cap",  "leather_armor", "leather_pants"], bonus: { def: 3, dex: 1 } },
  forest:     { name: "숲지기 세트",   pieces: ["forest_hood",  "forest_armor",  "forest_pants"],  bonus: { atk: 2, dex: 2 } },
  iron:       { name: "철갑 세트",     pieces: ["iron_helmet",  "iron_armor",    "iron_greaves"],   bonus: { def: 6, vit: 2 } },
  mage:       { name: "마도사 세트",   pieces: ["mage_hat",     "mage_robe",     "mage_pants"],     bonus: { magic: 5, int: 2 } },
  steel:      { name: "강철 세트",     pieces: ["steel_helmet", "steel_armor",   "steel_greaves"],  bonus: { def: 9, str: 2, vit: 1 } },
  mithril:    { name: "미스릴 세트",   pieces: ["mithril_helmet","mithril_armor", "mithril_greaves"],bonus: { def: 12, vit: 3, str: 1 } },
  dragon:     { name: "용의 세트",     pieces: ["dragon_helmet","dragon_armor",  "dragon_greaves"], bonus: { def: 20, str: 5, vit: 5 } },
  cleric:     { name: "성직자 세트",   pieces: ["cleric_hood",  "cleric_robe",   "cleric_pants"],   bonus: { magic: 8, int: 2, vit: 1 } },
  monk_set:   { name: "무도가 세트",   pieces: ["monk_headband","monk_gi",       "monk_pants"],     bonus: { atk: 4, str: 2, dex: 2 } },
  bishop_set: { name: "주교 세트",     pieces: ["bishop_mitre", "bishop_robe",   "bishop_pants"],   bonus: { magic: 18, int: 5, vit: 2 } },
  shadow:     { name: "그림자 세트",   pieces: ["shadow_mask",  "shadow_cloak",  "shadow_boots"],   bonus: { atk: 8, dex: 8 } },
  divine:     { name: "신성 세트",     pieces: ["divine_crown", "divine_plate",  "divine_greaves"], bonus: { def: 15, magic: 12, vit: 6 } }
};

const huntingGrounds = {
  green_field:      { name: "초록 들판",     minLevel: 1,  monsters: ["slime", "wild_wolf"] },
  deep_forest:      { name: "깊은 숲",       minLevel: 5,  monsters: ["wild_wolf", "forest_spider", "orc_scout"] },
  old_mine:         { name: "낡은 광산",     minLevel: 5,  monsters: ["cave_bat", "mine_golem"] },
  pirate_cove:      { name: "해적 소굴",     minLevel: 10, monsters: ["pirate", "sea_witch"] },
  highland_ruins:   { name: "고원 유적",     minLevel: 15, monsters: ["dark_elf", "wyvern", "stone_golem", "banshee"] },
  dragon_wasteland: { name: "용의 황야",     minLevel: 30, monsters: ["lich", "demon_soldier", "earth_dragon", "ancient_golem"] }
};

const monsters = {
  // Lv.1-5
  slime:           { name: "슬라임",      level: 1,  hp: 28,   atk: 6,  def: 1,  exp: 18,  gold: 12,  drops: [{ item: "slime_jelly", chance: 1 }, { item: "cloth_hat", chance: 0.08 }] },
  wild_wolf:       { name: "야생 늑대",   level: 3,  hp: 45,   atk: 10, def: 2,  exp: 35,  gold: 20,  drops: [{ item: "wolf_pelt", chance: 1 }, { item: "leather_cap", chance: 0.08 }, { item: "training_dagger", chance: 0.04 }] },
  // Lv.5-10
  forest_spider:   { name: "숲 거미",     level: 5,  hp: 70,   atk: 14, def: 4,  exp: 60,  gold: 35,  drops: [{ item: "spider_silk", chance: 1 }, { item: "forest_hood", chance: 0.07 }, { item: "forest_pants", chance: 0.05 }] },
  orc_scout:       { name: "오크 정찰병", level: 7,  hp: 95,   atk: 19, def: 6,  exp: 85,  gold: 55,  drops: [{ item: "orc_badge", chance: 1 }, { item: "iron_sword", chance: 0.06 }, { item: "iron_helmet", chance: 0.05 }] },
  cave_bat:        { name: "동굴 박쥐",   level: 4,  hp: 58,   atk: 13, def: 3,  exp: 48,  gold: 28,  drops: [{ item: "bat_wing", chance: 1 }, { item: "leather_pants", chance: 0.08 }] },
  mine_golem:      { name: "광산 골렘",   level: 8,  hp: 130,  atk: 21, def: 10, exp: 110, gold: 70,  drops: [{ item: "golem_core", chance: 1 }, { item: "iron_armor", chance: 0.07 }, { item: "iron_greaves", chance: 0.06 }] },
  // Lv.10-15
  pirate:          { name: "해적",        level: 10, hp: 150,  atk: 27, def: 9,  exp: 150, gold: 105, drops: [{ item: "pirate_coin", chance: 1 }, { item: "steel_sword", chance: 0.05 }, { item: "steel_greaves", chance: 0.04 }] },
  sea_witch:       { name: "바다 마녀",   level: 12, hp: 170,  atk: 31, def: 8,  exp: 190, gold: 130, drops: [{ item: "witch_pearl", chance: 1 }, { item: "mage_hat", chance: 0.06 }, { item: "mage_robe", chance: 0.05 }] },
  // Lv.15-25
  dark_elf:        { name: "다크 엘프",   level: 15, hp: 220,  atk: 38, def: 13, exp: 280, gold: 180, drops: [{ item: "dark_crystal", chance: 1 }, { item: "steel_armor", chance: 0.06 }, { item: "steel_helmet", chance: 0.05 }] },
  wyvern:          { name: "와이번",      level: 18, hp: 290,  atk: 46, def: 16, exp: 380, gold: 240, drops: [{ item: "wyvern_scale", chance: 1 }, { item: "mithril_helmet", chance: 0.07 }, { item: "mithril_sword", chance: 0.04 }] },
  stone_golem:     { name: "석상 골렘",   level: 20, hp: 360,  atk: 52, def: 22, exp: 460, gold: 290, drops: [{ item: "stone_golem_fragment", chance: 1 }, { item: "mithril_armor", chance: 0.07 }, { item: "mithril_greaves", chance: 0.06 }] },
  banshee:         { name: "밴시",        level: 22, hp: 310,  atk: 58, def: 14, exp: 520, gold: 320, drops: [{ item: "banshee_tear", chance: 1 }, { item: "mithril_staff", chance: 0.05 }, { item: "cleric_hood", chance: 0.05 }] },
  // Lv.30-50
  lich:            { name: "리치",        level: 30, hp: 580,  atk: 90, def: 28, exp: 900, gold: 580, drops: [{ item: "lich_bone", chance: 1 }, { item: "dragon_staff", chance: 0.04 }, { item: "bishop_mitre", chance: 0.04 }] },
  demon_soldier:   { name: "악마 병사",   level: 33, hp: 680,  atk: 105,def: 35, exp: 1050,gold: 680, drops: [{ item: "demon_horn", chance: 1 }, { item: "dragon_sword", chance: 0.04 }, { item: "shadow_cloak", chance: 0.04 }] },
  earth_dragon:    { name: "대지 드래곤", level: 38, hp: 920,  atk: 130,def: 45, exp: 1450,gold: 900, drops: [{ item: "dragon_scale", chance: 1 }, { item: "dragon_armor", chance: 0.05 }, { item: "dragon_helmet", chance: 0.04 }] },
  ancient_golem:   { name: "고대 골렘",   level: 42, hp: 1100, atk: 155,def: 55, exp: 1800,gold: 1100,drops: [{ item: "ancient_relic", chance: 1 }, { item: "dragon_greaves", chance: 0.05 }, { item: "divine_plate", chance: 0.03 }] }
};

const jobUniqueWeapons = {
  novice:      "novice_relic_blade",
  warrior:     "warrior_kingslayer",
  mage:        "mage_soul_staff",
  archer:      "archer_goblin_piercer",
  rogue:       "rogue_shadow_fang",
  cleric:      "cleric_blessed_mace",
  monk:        "monk_iron_gauntlet",
  bard:        "bard_silver_lute",
  paladin:     "paladin_holy_lance",
  knight:      "knight_zweihander",
  wizard:      "wizard_arcane_tome",
  ranger:      "ranger_composite_bow",
  assassin:    "assassin_void_blade",
  priest:      "priest_grand_cross",
  fighter:     "fighter_dragon_knuckle",
  minstrel:    "minstrel_golden_lute",
  holy_knight: "holy_knight_blessed_sword"
};

const dungeons = {
  goblin_den: {
    name: "고블린 동굴",
    minLevel: 3,
    maxPlayers: 4,
    boss: {
      name: "고블린 왕",
      level: 8,
      hp: 420,
      atk: 22,
      def: 7,
      exp: 160,
      gold: 100,
      drops: [{ item: "goblin_crown_piece", chance: 1 }],
      uniqueWeaponChance: 0.2
    }
  },
  dark_fortress: {
    name: "어둠의 요새",
    minLevel: 20,
    maxPlayers: 4,
    boss: {
      name: "어둠의 군주",
      level: 28,
      hp: 2800,
      atk: 85,
      def: 28,
      exp: 900,
      gold: 600,
      drops: [{ item: "dark_crystal", chance: 1 }, { item: "lich_bone", chance: 0.5 }],
      uniqueWeaponChance: 0.25
    }
  },
  dragon_lair: {
    name: "용의 소굴",
    minLevel: 38,
    maxPlayers: 4,
    boss: {
      name: "고룡",
      level: 48,
      hp: 8500,
      atk: 220,
      def: 60,
      exp: 3500,
      gold: 2000,
      drops: [{ item: "dragon_scale", chance: 1 }, { item: "ancient_relic", chance: 0.6 }],
      uniqueWeaponChance: 0.3
    }
  }
};

module.exports = { jobs, skills, towns, items, setBonuses, huntingGrounds, monsters, dungeons, jobUniqueWeapons };
