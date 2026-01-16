// Leaderboard JavaScript

async function loadLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard?limit=50');
        const data = await response.json();
        
        const container = document.getElementById('leaderboard');
        container.innerHTML = '';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'leaderboard-row header';
        header.innerHTML = `
            <div class="leaderboard-rank">#</div>
            <div class="leaderboard-name">Name</div>
            <div class="leaderboard-slaps">Slaps</div>
            <div class="leaderboard-badge">Badge</div>
        `;
        container.appendChild(header);
        
        // Add rows
        data.leaderboard.forEach((person, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            
            let medal = '';
            if (index === 0) medal = '🥇';
            else if (index === 1) medal = '🥈';
            else if (index === 2) medal = '🥉';
            
            let badge = '';
            if (person.total_slaps >= 500) badge = '😱';
            else if (person.total_slaps >= 250) badge = '🔥';
            else if (person.total_slaps >= 100) badge = '👑';
            else if (person.total_slaps >= 50) badge = '🏆';
            else if (person.total_slaps >= 10) badge = '🎯';
            
            row.innerHTML = `
                <div class="leaderboard-rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</div>
                <div class="leaderboard-name">
                    ${person.name}
                    <br>
                    <span style="font-size: 0.85rem; color: #636e72;">${person.email || 'No email'}</span>
                </div>
                <div class="leaderboard-slaps">${person.total_slaps}</div>
                <div class="leaderboard-badge">${badge}</div>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard').innerHTML = '<p class="loading">Error loading leaderboard</p>';
    }
}

async function loadTopThree() {
    try {
        const response = await fetch('/api/leaderboard?limit=3');
        const data = await response.json();
        
        const container = document.getElementById('topThreeCards');
        container.innerHTML = '';
        
        const medals = ['🥇', '🥈', '🥉'];
        const titles = ['The Slap King 👑', 'The Slap Queen 👸', 'The Slap Knight 🗡️'];
        
        data.leaderboard.forEach((person, index) => {
            const card = document.createElement('div');
            card.className = 'top-person-card';
            card.innerHTML = `
                <div class="top-person-rank">${medals[index]}</div>
                <div class="top-person-name">${person.name}</div>
                <div class="top-person-slaps">${person.total_slaps}</div>
                <p style="color: #636e72; margin-top: 0.5rem;">lifetime slaps</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading top three:', error);
    }
}

async function updateNav() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById('dashboardLink').style.display = 'inline';
            document.getElementById('logoutBtn').style.display = 'inline';
            document.getElementById('loginLink').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    loadTopThree();
    updateNav();
});

// Auto-refresh leaderboard every 30 seconds
setInterval(loadLeaderboard, 30000);
setInterval(loadTopThree, 30000);
