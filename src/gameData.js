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

const towns = {
  start: {
    name: "시작의 마을",
    description: "초보 모험가들이 모이는 작은 마을입니다.",
    connections: ["forest", "mine"],
    shop: ["rusty_sword", "wooden_staff", "cloth_armor", "leather_armor"],
    huntingGround: "green_field"
  },
  forest: {
    name: "숲 마을",
    description: "깊은 숲 근처에 자리 잡은 사냥꾼의 마을입니다.",
    connections: ["start", "harbor"],
    shop: ["hunter_bow", "iron_sword", "forest_armor"],
    huntingGround: "deep_forest"
  },
  mine: {
    name: "광산 마을",
    description: "광부와 대장장이가 모이는 거친 마을입니다.",
    connections: ["start"],
    shop: ["iron_sword", "iron_armor"],
    huntingGround: "old_mine"
  },
  harbor: {
    name: "항구 마을",
    description: "먼 지역으로 떠나는 배가 정박하는 항구입니다.",
    connections: ["forest"],
    shop: ["steel_sword", "mage_robe", "steel_armor"],
    huntingGround: "pirate_cove"
  }
};

const items = {
  rusty_sword: { name: "녹슨 검", type: "weapon", price: 35, atk: 4 },
  wooden_staff: { name: "나무 지팡이", type: "weapon", price: 35, atk: 2, magic: 4 },
  hunter_bow: { name: "사냥꾼의 활", type: "weapon", price: 90, atk: 7, dex: 1 },
  iron_sword: { name: "철검", type: "weapon", price: 120, atk: 10 },
  steel_sword: { name: "강철검", type: "weapon", price: 260, atk: 18 },
  cloth_armor: { name: "천 옷", type: "armor", price: 25, def: 2 },
  leather_armor: { name: "가죽 갑옷", type: "armor", price: 60, def: 5 },
  forest_armor: { name: "숲지기 갑옷", type: "armor", price: 125, def: 8, dex: 1 },
  iron_armor: { name: "철 갑옷", type: "armor", price: 150, def: 11 },
  mage_robe: { name: "마도사의 로브", type: "armor", price: 180, def: 5, magic: 5 },
  steel_armor: { name: "강철 갑옷", type: "armor", price: 300, def: 18 }
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
  slime: { name: "슬라임", level: 1, hp: 28, atk: 6, def: 1, exp: 18, gold: 12 },
  wild_wolf: { name: "야생 늑대", level: 3, hp: 45, atk: 10, def: 2, exp: 35, gold: 20 },
  forest_spider: { name: "숲 거미", level: 5, hp: 70, atk: 14, def: 4, exp: 60, gold: 35 },
  orc_scout: { name: "오크 정찰병", level: 7, hp: 95, atk: 19, def: 6, exp: 85, gold: 55 },
  cave_bat: { name: "동굴 박쥐", level: 4, hp: 58, atk: 13, def: 3, exp: 48, gold: 28 },
  mine_golem: { name: "광산 골렘", level: 8, hp: 130, atk: 21, def: 10, exp: 110, gold: 70 },
  pirate: { name: "해적", level: 10, hp: 150, atk: 27, def: 9, exp: 150, gold: 105 },
  sea_witch: { name: "바다 마녀", level: 12, hp: 170, atk: 31, def: 8, exp: 190, gold: 130 }
};

const dungeons = {
  goblin_den: {
    name: "고블린 동굴",
    minLevel: 3,
    maxPlayers: 4,
    boss: { name: "고블린 왕", level: 8, hp: 420, atk: 22, def: 7, exp: 160, gold: 100 }
  }
};

module.exports = { jobs, towns, items, huntingGrounds, monsters, dungeons };
