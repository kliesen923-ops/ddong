// 기존 data/db.json → PostgreSQL 마이그레이션
// 사용법: DATABASE_URL=... node migrate.js

const fs = require("fs");
const path = require("path");
const { initDb, saveDb } = require("./src/dbClient");

async function migrate() {
  await initDb();

  const dbPath = path.join(__dirname, "data", "db.json");
  if (!fs.existsSync(dbPath)) {
    console.log("data/db.json 없음. 새 DB로 시작합니다.");
    return;
  }

  const raw = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const db = {
    players:     raw.players     || {},
    battles:     raw.battles     || {},
    parties:     raw.parties     || {},
    trades:      raw.trades      || {},
    arenas:      raw.arenas      || {},
    nextPartyId: raw.nextPartyId || 1,
    nextTradeId: raw.nextTradeId || 1,
    nextArenaId: raw.nextArenaId || 1,
  };

  await saveDb(db);

  console.log("마이그레이션 완료!");
  console.log(`  players : ${Object.keys(db.players).length}명`);
  console.log(`  parties : ${Object.keys(db.parties).length}개`);
  console.log(`  trades  : ${Object.keys(db.trades).length}개`);
  console.log(`  arenas  : ${Object.keys(db.arenas).length}개`);
  console.log(`  battles : ${Object.keys(db.battles).length}개`);
}

migrate().catch(console.error).finally(() => process.exit());
