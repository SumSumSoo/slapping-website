// Dashboard JavaScript - Main user dashboard

async function loadDashboard() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/';
            return;
        }
        
        document.getElementById('userGreeting').textContent = `Welcome back, ${data.username}! 👋`;
        
        // Load stats
        const statsResponse = await fetch('/api/user/dashboard');
        const statsData = await statsResponse.json();
        
        document.getElementById('peopleSlaped').textContent = statsData.stats.people_slapped;
        document.getElementById('totalSlaps').textContent = statsData.stats.total_slaps_logged;
        
        // Load top targets
        loadTopTargets(statsData.topTargets);
        
        // Load slap history
        loadSlapHistory();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadTopTargets(targets) {
    const container = document.getElementById('topTargets');
    container.innerHTML = '';
    
    if (targets.length === 0) {
        container.innerHTML = '<p class="text-center">No slaps logged yet. Start slapping! 👋</p>';
        return;
    }
    
    targets.forEach((target, index) => {
        const div = document.createElement('div');
        div.className = 'target-item';
        div.innerHTML = `
            <div class="target-info">
                <div class="target-name">${target.name}</div>
                <div class="target-slaps">${target.email ? target.email : 'No email'}</div>
            </div>
            <div class="target-count">${target.slap_count} 👋</div>
        `;
        container.appendChild(div);
    });
}

async function loadSlapHistory() {
    try {
        const response = await fetch('/api/slaps/history');
        const data = await response.json();
        
        const container = document.getElementById('slapHistory');
        container.innerHTML = '';
        
        if (data.slaps.length === 0) {
            container.innerHTML = '<p class="text-center">No slaps logged yet</p>';
            return;
        }
        
        data.slaps.slice(0, 10).forEach(slap => {
            const date = new Date(slap.slap_date).toLocaleDateString();
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <div class="history-person">${slap.slapped_name}</div>
                    <div class="history-reason">${slap.reason || 'No reason given'}</div>
                </div>
                <span class="severity-badge severity-${slap.severity}">${slap.severity}</span>
                <div class="history-date">${date}</div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading slap history:', error);
    }
}

// Set today's date as default
const today = new Date().toISOString().split('T')[0];
document.getElementById('slapDate').value = today;

document.getElementById('logSlapForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('slapName').value;
    const email = document.getElementById('slapEmail').value;
    const slap_date = document.getElementById('slapDate').value;
    const reason = document.getElementById('slapReason').value;
    const severity = document.getElementById('slapSeverity').value;
    
    try {
        const response = await fetch('/api/slaps/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, slap_date, reason, severity })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Slap logged successfully! 👋');
            document.getElementById('logSlapForm').reset();
            document.getElementById('slapDate').value = today;
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);
