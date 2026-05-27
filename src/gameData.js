const jobs = {
  novice: {
    name: "초보자",
    levelRequired: 1,
    hpPerLevel: 12,
    mpPerLevel: 4,
    statBonus: { str: 0, dex: 0, int: 0, vit: 0 }
  },
  warrior: {
    name: "전사",
    levelRequired: 5,
    hpPerLevel: 18,
    mpPerLevel: 3,
    statBonus: { str: 3, dex: 0, int: 0, vit: 2 }
  },
  mage: {
    name: "마법사",
    levelRequired: 5,
    hpPerLevel: 9,
    mpPerLevel: 12,
    statBonus: { str: 0, dex: 0, int: 4, vit: 1 }
  },
  archer: {
    name: "궁수",
    levelRequired: 5,
    hpPerLevel: 12,
    mpPerLevel: 5,
    statBonus: { str: 1, dex: 4, int: 0, vit: 0 }
  },
  rogue: {
    name: "도적",
    levelRequired: 5,
    hpPerLevel: 11,
    mpPerLevel: 5,
    statBonus: { str: 1, dex: 3, int: 0, vit: 1 }
  }
};

const skills = {
  novice: [
    { id: "power_strike", name: "강타", level: 1, mpCost: 8, multiplier: 1.55 },
    { id: "focus_hit", name: "집중타", level: 3, mpCost: 12, multiplier: 1.9 }
  ],
  warrior: [
    { id: "power_strike", name: "강타", level: 1, mpCost: 8, multiplier: 1.55 },
    { id: "cleave", name: "가르기", level: 5, mpCost: 14, multiplier: 2.05 },
    { id: "heavy_crash", name: "중격", level: 8, mpCost: 20, multiplier: 2.65 }
  ],
  mage: [
    { id: "magic_bolt", name: "마력탄", level: 1, mpCost: 8, multiplier: 1.65 },
    { id: "fireball", name: "화염구", level: 5, mpCost: 16, multiplier: 2.25 },
    { id: "arcane_lance", name: "비전창", level: 8, mpCost: 24, multiplier: 2.9 }
  ],
  archer: [
    { id: "aimed_shot", name: "조준 사격", level: 1, mpCost: 8, multiplier: 1.6 },
    { id: "double_shot", name: "연속 사격", level: 5, mpCost: 15, multiplier: 2.15 },
    { id: "piercing_arrow", name: "관통 화살", level: 8, mpCost: 22, multiplier: 2.75 }
  ],
  rogue: [
    { id: "quick_stab", name: "기습", level: 1, mpCost: 8, multiplier: 1.6 },
    { id: "shadow_cut", name: "그림자 베기", level: 5, mpCost: 15, multiplier: 2.2 },
    { id: "assassinate", name: "암살", level: 8, mpCost: 24, multiplier: 3.0 }
  ]
};

const towns = {
  start: {
    name: "시작의 마을",
    description: "초보 모험가들이 모이는 작은 마을입니다.",
    connections: ["forest", "mine"],
    shop: [
      "rusty_sword",
      "wooden_staff",
      "training_dagger",
      "cloth_hat",
      "cloth_armor",
      "cloth_pants",
      "leather_cap",
      "leather_armor",
      "leather_pants"
    ],
    huntingGround: "green_field"
  },
  forest: {
    name: "숲 마을",
    description: "깊은 숲 근처에 자리 잡은 사냥꾼의 마을입니다.",
    connections: ["start", "harbor"],
    shop: ["hunter_bow", "iron_sword", "forest_hood", "forest_armor", "forest_pants"],
    huntingGround: "deep_forest"
  },
  mine: {
    name: "광산 마을",
    description: "광부와 대장장이가 모이는 거친 마을입니다.",
    connections: ["start"],
    shop: ["iron_sword", "iron_helmet", "iron_armor", "iron_greaves"],
    huntingGround: "old_mine"
  },
  harbor: {
    name: "항구 마을",
    description: "먼 지역으로 떠나는 배가 정박하는 항구입니다.",
    connections: ["forest"],
    shop: ["steel_sword", "mage_hat", "mage_robe", "mage_pants", "steel_helmet", "steel_armor", "steel_greaves"],
    huntingGround: "pirate_cove"
  }
};

const items = {
  rusty_sword: { name: "녹슨 검", type: "weapon", price: 35, atk: 4 },
  wooden_staff: { name: "나무 지팡이", type: "weapon", price: 35, atk: 2, magic: 4 },
  training_dagger: { name: "수련 단검", type: "weapon", price: 45, atk: 3, dex: 1 },
  hunter_bow: { name: "사냥꾼의 활", type: "weapon", price: 90, atk: 7, dex: 1 },
  iron_sword: { name: "철검", type: "weapon", price: 120, atk: 10 },
  steel_sword: { name: "강철검", type: "weapon", price: 260, atk: 18 },
  novice_relic_blade: { name: "모험가의 유산검", type: "weapon", price: 420, atk: 22, vit: 1 },
  warrior_kingslayer: { name: "왕살해자의 대검", type: "weapon", price: 520, atk: 30, str: 3 },
  mage_soul_staff: { name: "혼령의 지팡이", type: "weapon", price: 520, atk: 8, magic: 24, int: 3 },
  archer_goblin_piercer: { name: "고블린 관통궁", type: "weapon", price: 520, atk: 24, dex: 3 },
  rogue_shadow_fang: { name: "그림자 송곳니", type: "weapon", price: 520, atk: 25, dex: 2, str: 1 },
  cloth_hat: { name: "천 모자", type: "hat", price: 15, def: 1, set: "cloth" },
  cloth_armor: { name: "천 상의", type: "top", price: 25, def: 2, set: "cloth" },
  cloth_pants: { name: "천 하의", type: "bottom", price: 20, def: 1, set: "cloth" },
  leather_cap: { name: "가죽 모자", type: "hat", price: 45, def: 2, dex: 1, set: "leather" },
  leather_armor: { name: "가죽 상의", type: "top", price: 60, def: 5, set: "leather" },
  leather_pants: { name: "가죽 하의", type: "bottom", price: 50, def: 3, set: "leather" },
  forest_hood: { name: "숲지기 두건", type: "hat", price: 95, def: 3, dex: 1, set: "forest" },
  forest_armor: { name: "숲지기 상의", type: "top", price: 125, def: 8, dex: 1, set: "forest" },
  forest_pants: { name: "숲지기 하의", type: "bottom", price: 110, def: 5, dex: 1, set: "forest" },
  iron_helmet: { name: "철 투구", type: "hat", price: 110, def: 5, set: "iron" },
  iron_armor: { name: "철 상의", type: "top", price: 150, def: 11, set: "iron" },
  iron_greaves: { name: "철 하의", type: "bottom", price: 130, def: 7, set: "iron" },
  mage_hat: { name: "마도사의 모자", type: "hat", price: 140, def: 2, magic: 3, int: 1, set: "mage" },
  mage_robe: { name: "마도사의 상의", type: "top", price: 180, def: 5, magic: 5, set: "mage" },
  mage_pants: { name: "마도사의 하의", type: "bottom", price: 150, def: 3, magic: 2, set: "mage" },
  steel_helmet: { name: "강철 투구", type: "hat", price: 220, def: 8, set: "steel" },
  steel_armor: { name: "강철 상의", type: "top", price: 300, def: 18, set: "steel" },
  steel_greaves: { name: "강철 하의", type: "bottom", price: 260, def: 12, set: "steel" }
  ,
  slime_jelly: { name: "슬라임 젤리", type: "junk", price: 4 },
  wolf_pelt: { name: "늑대 가죽", type: "junk", price: 8 },
  spider_silk: { name: "거미줄", type: "junk", price: 14 },
  orc_badge: { name: "오크 휘장", type: "junk", price: 22 },
  bat_wing: { name: "박쥐 날개", type: "junk", price: 12 },
  golem_core: { name: "금 간 골렘 핵", type: "junk", price: 30 },
  pirate_coin: { name: "해적 은화", type: "junk", price: 38 },
  witch_pearl: { name: "마녀의 진주", type: "junk", price: 52 },
  goblin_crown_piece: { name: "깨진 고블린 왕관 조각", type: "junk", price: 65 }
};

const setBonuses = {
  cloth: { name: "수습자 세트", pieces: ["cloth_hat", "cloth_armor", "cloth_pants"], bonus: { def: 2, vit: 1 } },
  leather: { name: "가죽 세트", pieces: ["leather_cap", "leather_armor", "leather_pants"], bonus: { def: 3, dex: 1 } },
  forest: { name: "숲지기 세트", pieces: ["forest_hood", "forest_armor", "forest_pants"], bonus: { atk: 2, dex: 2 } },
  iron: { name: "철갑 세트", pieces: ["iron_helmet", "iron_armor", "iron_greaves"], bonus: { def: 6, vit: 2 } },
  mage: { name: "마도사 세트", pieces: ["mage_hat", "mage_robe", "mage_pants"], bonus: { magic: 5, int: 2 } },
  steel: { name: "강철 세트", pieces: ["steel_helmet", "steel_armor", "steel_greaves"], bonus: { def: 9, str: 2, vit: 1 } }
};

const huntingGrounds = {
  green_field: {
    name: "초록 들판",
    monsters: ["slime", "wild_wolf"]
  },
  deep_forest: {
    name: "깊은 숲",
    monsters: ["wild_wolf", "forest_spider", "orc_scout"]
  },
  old_mine: {
    name: "낡은 광산",
    monsters: ["cave_bat", "mine_golem"]
  },
  pirate_cove: {
    name: "해적 소굴",
    monsters: ["pirate", "sea_witch"]
  }
};

const monsters = {
  slime: { name: "슬라임", level: 1, hp: 28, atk: 6, def: 1, exp: 18, gold: 12, drops: [{ item: "slime_jelly", chance: 1 }, { item: "cloth_hat", chance: 0.08 }] },
  wild_wolf: { name: "야생 늑대", level: 3, hp: 45, atk: 10, def: 2, exp: 35, gold: 20, drops: [{ item: "wolf_pelt", chance: 1 }, { item: "leather_cap", chance: 0.08 }, { item: "training_dagger", chance: 0.04 }] },
  forest_spider: { name: "숲 거미", level: 5, hp: 70, atk: 14, def: 4, exp: 60, gold: 35, drops: [{ item: "spider_silk", chance: 1 }, { item: "forest_hood", chance: 0.07 }, { item: "forest_pants", chance: 0.05 }] },
  orc_scout: { name: "오크 정찰병", level: 7, hp: 95, atk: 19, def: 6, exp: 85, gold: 55, drops: [{ item: "orc_badge", chance: 1 }, { item: "iron_sword", chance: 0.06 }, { item: "iron_helmet", chance: 0.05 }] },
  cave_bat: { name: "동굴 박쥐", level: 4, hp: 58, atk: 13, def: 3, exp: 48, gold: 28, drops: [{ item: "bat_wing", chance: 1 }, { item: "leather_pants", chance: 0.08 }] },
  mine_golem: { name: "광산 골렘", level: 8, hp: 130, atk: 21, def: 10, exp: 110, gold: 70, drops: [{ item: "golem_core", chance: 1 }, { item: "iron_armor", chance: 0.07 }, { item: "iron_greaves", chance: 0.06 }] },
  pirate: { name: "해적", level: 10, hp: 150, atk: 27, def: 9, exp: 150, gold: 105, drops: [{ item: "pirate_coin", chance: 1 }, { item: "steel_sword", chance: 0.05 }, { item: "steel_greaves", chance: 0.04 }] },
  sea_witch: { name: "바다 마녀", level: 12, hp: 170, atk: 31, def: 8, exp: 190, gold: 130, drops: [{ item: "witch_pearl", chance: 1 }, { item: "mage_hat", chance: 0.06 }, { item: "mage_robe", chance: 0.05 }] }
};

const jobUniqueWeapons = {
  novice: "novice_relic_blade",
  warrior: "warrior_kingslayer",
  mage: "mage_soul_staff",
  archer: "archer_goblin_piercer",
  rogue: "rogue_shadow_fang"
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
  }
};

module.exports = { jobs, skills, towns, items, setBonuses, huntingGrounds, monsters, dungeons, jobUniqueWeapons };
