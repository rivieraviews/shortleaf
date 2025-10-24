import Database from "better-sqlite3";

const db = new Database('urls.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
        short_id TEXT PRIMARY KEY,
        original_url TEXT NOT NULL,
        created_at INTEGER NOT NULL
    )
`);

export const insertUrl = db.prepare(`
    INSERT INTO urls (short_id, original_url, created_at)
    VALUES (?, ?, ?)
`);

export const getUrl = db.prepare(`
    SELECT original_url FROM urls WHERE short_id = ?
`);

export const urlExists = db.prepare(`
    SELECT 1 FROM urls WHERE short_id = ?
`);

export default db;