import Database from "better-sqlite3";

const db = new Database('urls.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
        short_id TEXT PRIMARY KEY,
        original_url TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        click_count INTEGER DEFAULT 0,
        expires_at INTEGER,
        max_clicks INTEGER
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_id TEXT NOT NULL,
        clicked_at INTEGER NOT NULL,
        user_agent TEXT,
        referer TEXT,
        FOREIGN KEY (short_id) REFERENCES urls(short_id)
    )
`);

export const insertUrl = db.prepare(`
    INSERT INTO urls (short_id, original_url, created_at, click_count, expires_at, max_clicks)
    VALUES (?, ?, ?, 0, ?, ?)
`);

export const getUrl = db.prepare(`
    SELECT original_url, click_count, expires_at, max_clicks FROM urls WHERE short_id = ?
`);

export const urlExists = db.prepare(`
    SELECT 1 FROM urls WHERE short_id = ?
`);

export const insertClick = db.prepare(`
    INSERT INTO clicks (short_id, clicked_at, user_agent, referer)
    VALUES (?, ?, ?, ?)
`);

export const incrementClickCount = db.prepare(`
    UPDATE urls SET click_count = click_count + 1 WHERE short_id = ?
`);

export const getStats = db.prepare(`
    SELECT 
        u.short_id,
        u.original_url,
        u.created_at,
        u.expires_at,
        u.max_clicks,
        u.click_count,
        COUNT(c.id) as total_clicks
    FROM urls u
    LEFT JOIN clicks c ON u.short_id = c.short_id
    WHERE u.short_id = ?
    GROUP BY u.short_id
`);

export default db;