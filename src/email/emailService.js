import nodemailer from 'nodemailer';
import { getDb } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

export async function sendDailyDigest(slappedPersonId) {
    try {
        const db = await getDb();

        const settings = await db.get(
            'SELECT * FROM email_settings WHERE slapped_person_id = ?',
            [slappedPersonId]
        );

        if (!settings || !settings.daily_digest || !settings.email) {
            return false;
        }

        const person = await db.get(
            'SELECT * FROM slapped_people WHERE id = ?',
            [slappedPersonId]
        );

        const today = new Date().toISOString().split('T')[0];
        const todaySlaps = await db.all(`
            SELECT * FROM slaps
            WHERE slapped_person_id = ? AND slap_date = ?
            ORDER BY created_at DESC
        `, [slappedPersonId, today]);

        const html = `
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #ff6b6b; margin-bottom: 20px;">🎯 Daily Slap Digest</h2>
                    <p style="font-size: 16px; color: #333;">Hi there, <strong>${person.name}</strong>!</p>
                    
                    <div style="background-color: #ffe0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 14px; margin: 0; color: #d63031;">
                            You received <strong>${todaySlaps.length} slap${todaySlaps.length !== 1 ? 's' : ''}</strong> today!
                        </p>
                    </div>

                    <p style="color: #666; margin-top: 20px;"><strong>Lifetime Total:</strong> ${person.total_slaps} slaps</p>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            This is a humorous report from Slapping Website. Stay awesome! 😄
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const info = await getTransporter().sendMail({
            from: process.env.EMAIL_USER,
            to: settings.email,
            subject: `🎯 Daily Slap Report - ${todaySlaps.length} slap${todaySlaps.length !== 1 ? 's' : ''} received!`,
            html
        });

        await db.run(
            'UPDATE email_settings SET last_digest_sent = CURRENT_TIMESTAMP WHERE slapped_person_id = ?',
            [slappedPersonId]
        );

        console.log('Daily digest sent to', settings.email);
        return true;
    } catch (error) {
        console.error('Error sending daily digest:', error);
        return false;
    }
}

export async function sendWeeklyChart(slappedPersonId) {
    try {
        const db = await getDb();

        const settings = await db.get(
            'SELECT * FROM email_settings WHERE slapped_person_id = ?',
            [slappedPersonId]
        );

        if (!settings || !settings.weekly_chart || !settings.email) {
            return false;
        }

        const person = await db.get(
            'SELECT * FROM slapped_people WHERE id = ?',
            [slappedPersonId]
        );

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const dailyStats = await db.all(`
            SELECT slap_date, COUNT(*) as count
            FROM slaps
            WHERE slapped_person_id = ? AND slap_date >= ?
            GROUP BY slap_date
            ORDER BY slap_date ASC
        `, [slappedPersonId, weekStartStr]);

        const chartData = dailyStats.map(d => `${d.count}`).join(',');
        const labels = dailyStats.map(d => d.slap_date.substring(5)).join(',');

        const html = `
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #ff6b6b; margin-bottom: 20px;">📊 Weekly Slap Progress</h2>
                    <p style="font-size: 16px; color: #333;">Hey <strong>${person.name}</strong>! Here's your weekly slap breakdown:</p>
                    
                    <div style="margin: 30px 0;">
                        <img src="https://quickchart.io/chart?type=bar&data={labels:[${labels}],datasets:[{label:'Slaps',data:[${chartData}],backgroundColor:'#ff6b6b'}]}" style="width: 100%; max-width: 500px;" alt="Weekly chart" />
                    </div>

                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 14px; margin: 0; color: #1565c0;">
                            <strong>This week:</strong> ${dailyStats.reduce((sum, d) => sum + d.count, 0)} slaps
                        </p>
                    </div>

                    <p style="color: #666; margin-top: 20px; font-size: 14px;">
                        You're becoming a slap legend! Keep up the... well, getting slapped! 😄
                    </p>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            From Slapping Website - Because humor is life! 🎉
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await getTransporter().sendMail({
            from: process.env.EMAIL_USER,
            to: settings.email,
            subject: `📊 Your Weekly Slap Progress Report`,
            html
        });

        console.log('Weekly chart sent to', settings.email);
        return true;
    } catch (error) {
        console.error('Error sending weekly chart:', error);
        return false;
    }
}

export async function checkAndAwardBadges(slappedPersonId) {
    try {
        const db = await getDb();

        const person = await db.get(
            'SELECT * FROM slapped_people WHERE id = ?',
            [slappedPersonId]
        );

        const badges = await db.all('SELECT * FROM badges');

        for (const badge of badges) {
            if (person.total_slaps >= badge.threshold) {
                const existing = await db.get(
                    'SELECT * FROM slapped_badges WHERE slapped_person_id = ? AND badge_id = ?',
                    [slappedPersonId, badge.id]
                );

                if (!existing) {
                    await db.run(
                        'INSERT INTO slapped_badges (slapped_person_id, badge_id) VALUES (?, ?)',
                        [slappedPersonId, badge.id]
                    );
                    console.log(`Badge awarded: ${badge.name} to ${person.name}`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking badges:', error);
    }
}

export default {
    sendDailyDigest,
    sendWeeklyChart,
    checkAndAwardBadges
};
