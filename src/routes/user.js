import express from 'express';
import { getDb } from '../db.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get user dashboard info
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.session.userId;

        const stats = await db.get(`
            SELECT
                COUNT(DISTINCT sp.id) as people_slapped,
                COUNT(s.id) as total_slaps_logged
            FROM slaps s
            LEFT JOIN slapped_people sp ON s.slapped_person_id = sp.id
            WHERE s.user_id = ?
        `, [userId]);

        const topTargets = await db.all(`
            SELECT sp.id, sp.name, sp.email, COUNT(s.id) as slap_count
            FROM slaps s
            JOIN slapped_people sp ON s.slapped_person_id = sp.id
            WHERE s.user_id = ?
            GROUP BY sp.id
            ORDER BY slap_count DESC
            LIMIT 5
        `, [userId]);

        res.json({ stats, topTargets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get badges for a slapped person
router.get('/badges/:slappedPersonId', async (req, res) => {
    try {
        const db = await getDb();
        const { slappedPersonId } = req.params;

        const badges = await db.all(`
            SELECT b.*, sb.earned_at
            FROM slapped_badges sb
            JOIN badges b ON sb.badge_id = b.id
            WHERE sb.slapped_person_id = ?
            ORDER BY sb.earned_at DESC
        `, [slappedPersonId]);

        res.json({ badges });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update email settings
router.post('/email-settings', isAuthenticated, async (req, res) => {
    try {
        const { slappedPersonId, email, daily_digest, weekly_chart } = req.body;
        const db = await getDb();

        await db.run(`
            INSERT INTO email_settings (slapped_person_id, email, daily_digest, weekly_chart)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(slapped_person_id) DO UPDATE SET
                email = ?, daily_digest = ?, weekly_chart = ?
        `, [slappedPersonId, email, daily_digest ? 1 : 0, weekly_chart ? 1 : 0,
            email, daily_digest ? 1 : 0, weekly_chart ? 1 : 0]);

        res.json({ success: true, message: 'Email settings updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
