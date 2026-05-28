const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players  (user_id  TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS battles  (user_id  TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS parties  (party_id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS trades   (trade_id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS arenas   (arena_id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS counters (name     TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0);
  `);
}

async function loadDb() {
  const [players, battles, parties, trades, arenas, counters] = await Promise.all([
    pool.query("SELECT user_id,  data  FROM players"),
    pool.query("SELECT user_id,  data  FROM battles"),
    pool.query("SELECT party_id, data  FROM parties"),
    pool.query("SELECT trade_id, data  FROM trades"),
    pool.query("SELECT arena_id, data  FROM arenas"),
    pool.query("SELECT name, value     FROM counters"),
  ]);

  const ctr = Object.fromEntries(counters.rows.map((r) => [r.name, Number(r.value)]));

  return {
    players:      Object.fromEntries(players.rows.map((r) => [r.user_id,  r.data])),
    battles:      Object.fromEntries(battles.rows.map((r) => [r.user_id,  r.data])),
    parties:      Object.fromEntries(parties.rows.map((r) => [r.party_id, r.data])),
    trades:       Object.fromEntries(trades.rows.map((r)  => [r.trade_id, r.data])),
    arenas:       Object.fromEntries(arenas.rows.map((r)  => [r.arena_id, r.data])),
    nextPartyId:  ctr.nextPartyId  || 1,
    nextTradeId:  ctr.nextTradeId  || 1,
    nextArenaId:  ctr.nextArenaId  || 1,
  };
}

async function saveDb(db) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const [userId, data] of Object.entries(db.players)) {
      await client.query(
        "INSERT INTO players(user_id,data) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET data=$2",
        [userId, data]
      );
    }

    await client.query("DELETE FROM battles");
    for (const [userId, data] of Object.entries(db.battles)) {
      await client.query("INSERT INTO battles(user_id,data) VALUES($1,$2)", [userId, data]);
    }

    await client.query("DELETE FROM parties");
    for (const [id, data] of Object.entries(db.parties)) {
      await client.query("INSERT INTO parties(party_id,data) VALUES($1,$2)", [id, data]);
    }

    await client.query("DELETE FROM trades");
    for (const [id, data] of Object.entries(db.trades)) {
      await client.query("INSERT INTO trades(trade_id,data) VALUES($1,$2)", [id, data]);
    }

    await client.query("DELETE FROM arenas");
    for (const [id, data] of Object.entries(db.arenas)) {
      await client.query("INSERT INTO arenas(arena_id,data) VALUES($1,$2)", [id, data]);
    }

    for (const [name, value] of [
      ["nextPartyId", db.nextPartyId],
      ["nextTradeId", db.nextTradeId],
      ["nextArenaId", db.nextArenaId],
    ]) {
      await client.query(
        "INSERT INTO counters(name,value) VALUES($1,$2) ON CONFLICT(name) DO UPDATE SET value=$2",
        [name, value]
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { initDb, loadDb, saveDb };
