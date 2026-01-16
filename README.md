# 👋 Slapping Website

A humorous web application where users can log and track playful slaps they "owe" people who've irritated them. Features include user authentication, slap logging, real-time leaderboards, email digests, and achievement badges.

## Features 🎯

### Core Features
- **User Authentication**: Secure login/registration with hashed passwords
- **Slap Logging**: Log slaps by date, severity, reason, and target person
- **Multiple Targets**: Log slaps for different people with their emails
- **Real-time Leaderboard**: See who receives the most slaps
- **Badge System**: Unlock achievements at milestones (10, 50, 100, 250, 500 slaps)

### Email Features
- **Daily Digest**: Recipients get daily email summaries of slaps received
- **Weekly Progress Charts**: Visual charts of slap trends over the week
- **Email Notifications**: Optional email settings for tracked recipients

### User Dashboard
- Personal statistics (people slapped, total slaps)
- Top slap targets
- Recent slap history
- Severity levels (Mild, Moderate, Severe, Legendary 🔥)

## Project Structure

```
├── src/
│   ├── server.js              # Express server
│   ├── db.js                  # SQLite database setup
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Login/register endpoints
│   │   ├── slaps.js           # Slap logging endpoints
│   │   ├── leaderboard.js     # Leaderboard endpoints
│   │   └── user.js            # User dashboard endpoints
│   ├── email/
│   │   └── emailService.js    # Email sending service
│   └── tasks/
│       └── dailyDigest.js     # Scheduled email tasks
├── public/
│   ├── index.html             # Login/landing page
│   ├── dashboard.html         # User dashboard
│   ├── leaderboard.html       # Leaderboard page
│   ├── css/
│   │   └── style.css          # All styling
│   └── js/
│       ├── auth.js            # Authentication logic
│       ├── dashboard.js       # Dashboard interactions
│       └── leaderboard.js     # Leaderboard interactions
├── package.json               # Dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm package manager

### Steps

1. **Install dependencies**:
```bash
npm install
```

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Configure environment** (optional, for email features):
Edit `.env` and add:
```
PORT=3000
SESSION_SECRET=your_super_secret_session_key_here
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
DATABASE_URL=slaps.db
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Visit the app**:
Open `http://localhost:3000` in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status

### Slaps
- `POST /api/slaps/log` - Log a new slap
- `GET /api/slaps/history` - Get user's slap history
- `GET /api/slaps/stats/:id` - Get statistics for a person

### Leaderboard
- `GET /api/leaderboard` - Get top slapped people
- `GET /api/leaderboard/rank/:id` - Get rank of specific person

### User
- `GET /api/user/dashboard` - Get user dashboard stats
- `GET /api/user/badges/:id` - Get badges earned
- `POST /api/user/email-settings` - Update email preferences

## Badge System

Unlock badges based on slap milestones:
- 🎯 **Slap Target** - 10 lifetime slaps
- 🏆 **Slap Legend** - 50 lifetime slaps
- 👑 **Slap King** - 100 lifetime slaps
- 🔥 **Slap Emperor** - 250 lifetime slaps
- 😱 **Slap Deity** - 500 lifetime slaps
- 📈 **One in a Day** - 5+ slaps in one day
- 🌟 **Slap Streak** - Slapped every day for a week

## Humor & Design

The website embraces its humorous nature with:
- Playful copy and emoji throughout
- Professional yet fun design with pink/red gradients
- Achievement-based gamification
- Funny email digest templates
- Witty badge descriptions

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Authentication**: bcrypt for password hashing, express-session
- **Email**: Nodemailer
- **Scheduling**: node-cron (for future scheduled emails)

## Future Enhancements

- [ ] Social sharing features
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Team slapping competitions
- [ ] Slap history search/filtering
- [ ] Profile customization
- [ ] Photo uploads for recipients
- [ ] Integration with calendar apps

## License

MIT

## Created with ❤️ and lots of humor 😄

---

**Note**: This is a humorous project intended for fun among friends. Use responsibly!
