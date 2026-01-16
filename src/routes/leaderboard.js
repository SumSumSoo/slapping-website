import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// Get top slapped people
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const limit = req.query.limit || 50;

        const leaderboard = await db.all(`
            SELECT id, name, email, total_slaps FROM slapped_people
            ORDER BY total_slaps DESC
            LIMIT ?
        `, [limit]);

        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get rank of a specific person
router.get('/rank/:slappedPersonId', async (req, res) => {
    try {
        const db = await getDb();
        const { slappedPersonId } = req.params;

        const person = await db.get(
            'SELECT * FROM slapped_people WHERE id = ?',
            [slappedPersonId]
        );

        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        const rank = await db.get(`
            SELECT COUNT(*) + 1 as rank
            FROM slapped_people
            WHERE total_slaps > ?
        `, [person.total_slaps]);

        res.json({ person, rank: rank.rank });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
