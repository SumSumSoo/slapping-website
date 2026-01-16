import express from 'express';
import { getDb } from '../db.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Log a new slap
router.post('/log', isAuthenticated, async (req, res) => {
    try {
        const { name, email, slap_date, reason, severity } = req.body;
        const db = await getDb();

        if (!name || !slap_date) {
            return res.status(400).json({ error: 'Name and date required' });
        }

        // Get or create the slapped person
        let slappedPerson = await db.get(
            'SELECT * FROM slapped_people WHERE name = ? AND (email = ? OR email IS NULL)',
            [name, email || null]
        );

        if (!slappedPerson) {
            const result = await db.run(
                'INSERT INTO slapped_people (name, email, total_slaps) VALUES (?, ?, 0)',
                [name, email || null]
            );
            slappedPerson = { id: result.lastID };
        }

        // Insert the slap
        await db.run(
            'INSERT INTO slaps (user_id, slapped_person_id, slap_date, reason, severity) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, slappedPerson.id, slap_date, reason || null, severity || 'mild']
        );

        // Update total slaps
        await db.run(
            'UPDATE slapped_people SET total_slaps = total_slaps + 1 WHERE id = ?',
            [slappedPerson.id]
        );

        res.json({ success: true, message: 'Slap logged! 👋' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's slap history
router.get('/history', isAuthenticated, async (req, res) => {
    try {
        const db = await getDb();
        const slaps = await db.all(`
            SELECT s.*, sp.name as slapped_name, sp.email as slapped_email
            FROM slaps s
            JOIN slapped_people sp ON s.slapped_person_id = sp.id
            WHERE s.user_id = ?
            ORDER BY s.slap_date DESC
        `, [req.session.userId]);

        res.json({ slaps });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get slap statistics for a slapped person
router.get('/stats/:slappedPersonId', async (req, res) => {
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

        const slaps = await db.all(`
            SELECT * FROM slaps
            WHERE slapped_person_id = ?
            ORDER BY slap_date DESC
        `, [slappedPersonId]);

        const today = new Date().toISOString().split('T')[0];
        const todaySlaps = slaps.filter(s => s.slap_date === today).length;

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        const weekStart = thisWeek.toISOString().split('T')[0];
        const weekSlaps = slaps.filter(s => s.slap_date >= weekStart).length;

        res.json({
            person,
            totalSlaps: person.total_slaps,
            todaySlaps,
            weekSlaps,
            recentSlaps: slaps.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
