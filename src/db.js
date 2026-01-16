import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const dbPath = path.join(__dirname, '..', 'slaps.db');

let db = null;

async function initializeDatabase() {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS slapped_people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            total_slaps INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, email)
        );

        CREATE TABLE IF NOT EXISTS slaps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            slapped_person_id INTEGER NOT NULL,
            slap_date DATE NOT NULL,
            reason TEXT,
            severity TEXT DEFAULT 'mild',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (slapped_person_id) REFERENCES slapped_people(id)
        );

        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            threshold INTEGER NOT NULL,
            icon TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS slapped_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slapped_person_id INTEGER NOT NULL,
            badge_id INTEGER NOT NULL,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(slapped_person_id, badge_id),
            FOREIGN KEY (slapped_person_id) REFERENCES slapped_people(id),
            FOREIGN KEY (badge_id) REFERENCES badges(id)
        );

        CREATE TABLE IF NOT EXISTS email_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slapped_person_id INTEGER UNIQUE NOT NULL,
            email TEXT NOT NULL,
            daily_digest BOOLEAN DEFAULT 1,
            weekly_chart BOOLEAN DEFAULT 1,
            last_digest_sent DATETIME,
            FOREIGN KEY (slapped_person_id) REFERENCES slapped_people(id)
        );
    `);

    // Insert default badges
    const badgeCount = await db.get('SELECT COUNT(*) as count FROM badges');
    if (badgeCount.count === 0) {
        await db.run(`
            INSERT INTO badges (name, description, threshold, icon) VALUES
            ('Slap Target 🎯', 'Reached 10 lifetime slaps', 10, '🎯'),
            ('Slap Legend 🏆', 'Reached 50 lifetime slaps', 50, '🏆'),
            ('Slap King 👑', 'Reached 100 lifetime slaps', 100, '👑'),
            ('Slap Emperor 🔥', 'Reached 250 lifetime slaps', 250, '🔥'),
            ('Slap Deity 😱', 'Reached 500 lifetime slaps', 500, '😱'),
            ('One in a Day 📈', 'Received 5+ slaps in one day', 5, '📈'),
            ('Slap Streak 🌟', 'Slapped every day for a week', 7, '🌟')
        `);
    }

    return db;
}

export async function getDb() {
    if (!db) {
        await initializeDatabase();
    }
    return db;
}

export default initializeDatabase;
