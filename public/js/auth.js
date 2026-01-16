// Auth JavaScript - Handle login and registration

function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('loginLink').style.display = 'none';
            document.getElementById('dashboardLink').style.display = 'inline';
            document.getElementById('logoutBtn').style.display = 'inline';
        } else {
            document.getElementById('authContainer').style.display = 'block';
            document.getElementById('loginLink').style.display = 'inline';
            document.getElementById('dashboardLink').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Login successful! 🎉');
            window.location.href = '/dashboard';
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! 🚀 Now log in');
            toggleForm();
            document.getElementById('registerFormElement').reset();
        } else {
            alert('Registration failed: ' + data.error);
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

// Set today's date as default
document.getElementById('slapDate').valueAsDate = new Date();

// Check auth on page load
document.addEventListener('DOMContentLoaded', checkAuth);
