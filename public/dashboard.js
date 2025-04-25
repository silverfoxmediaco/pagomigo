// dashboard.js

// Burger menu logic
const hamburger = document.getElementById("hamburger");
const slideoutMenu = document.getElementById("slideoutMenu");
const closeBtn = document.getElementById("closeMenu");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    slideoutMenu.classList.add("open");
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    slideoutMenu.classList.remove("open");
  });
}

// Use your custom domain as the API base
const API_BASE = 'https://pagomigo.com';

// Fetch user profile, transactions, and incoming requests
async function loadDashboard() {
  try {
    const profileRes = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'GET',
      credentials: 'include'
    });

    if (profileRes.status === 401) {
      window.location.href = 'login.html';
      return;
    }

    const profile = await profileRes.json();

    document.getElementById('user-name').textContent = `Welcome, ${profile.username || profile.name}!`;
    document.getElementById('user-email').textContent = profile.email;
    document.getElementById('user-kyc').textContent = profile.kyc_status;

    const txRes = await fetch(`${API_BASE}/api/transactions/history`, {
      credentials: 'include'
    });

    const transactions = await txRes.json();
    const txList = document.getElementById('transaction-list');
    txList.innerHTML = '';
    transactions.forEach(tx => {
      const li = document.createElement('li');
      li.textContent = `${tx.recipientName} • ${tx.recipientCountry} • $${tx.amountUsd} • ${tx.status}`;
      txList.appendChild(li);
    });

    const reqRes = await fetch(`${API_BASE}/api/requests`, {
      credentials: 'include'
    });

    const requests = await reqRes.json();
    const reqList = document.getElementById('request-list');
    reqList.innerHTML = '';
    requests.forEach(req => {
      const li = document.createElement('li');
      li.textContent = `${req.requestNote} • $${req.amountUsd} • From: ${req.requesterId.name || 'User'}`;

      if (req.status === 'pending') {
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.classList.add('approve-btn');
        approveBtn.addEventListener('click', () => approveRequest(req._id));
        li.appendChild(approveBtn);

        const declineBtn = document.createElement('button');
        declineBtn.textContent = 'Decline';
        declineBtn.classList.add('decline-btn');
        declineBtn.addEventListener('click', () => declineRequest(req._id));
        li.appendChild(declineBtn);
      }

      reqList.appendChild(li);
    });

  } catch (err) {
    console.error('Dashboard load error:', err);
    window.location.href = 'login.html';
  }
}

async function approveRequest(requestId) {
  try {
    const res = await fetch(`${API_BASE}/api/requests/${requestId}/approve`, {
    method: 'PUT',
    credentials: 'include'
  });


    const result = await res.json();
    alert(result.message || 'Request approved');
    loadDashboard();
  } catch (error) {
    console.error('Approve request error:', error);
    alert('Failed to approve request');
  }
}

async function declineRequest(requestId) {
  try {
    const res = await fetch(`${API_BASE}/api/requests/${requestId}/decline`, {
    method: 'PUT',
    credentials: 'include'
  });


    const result = await res.json();
    alert(result.message || 'Request declined');
    loadDashboard();
  } catch (error) {
    console.error('Decline request error:', error);
    alert('Failed to decline request');
  }
}

// Load dashboard data on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDashboard);
} else {
  loadDashboard();
}

const modal = document.getElementById('editProfileModal');
const openBtn = document.getElementById('openEditProfileModal');
const closeProfileBtn = document.querySelector('.close-profile-modal');
const form = document.getElementById('editProfileForm');

openBtn.addEventListener('click', async () => {
  // Load current profile
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    credentials: 'include'
  });

  if (res.ok) {
    const user = await res.json();
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-username').value = user.username || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-address').value = user.address || '';
    modal.classList.add('open');
  }
});

closeProfileBtn.addEventListener('click', () => {
  modal.classList.remove('open');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const updatedUser = {
    name: document.getElementById('edit-name').value,
    username: document.getElementById('edit-username').value,
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value,
    address: document.getElementById('edit-address').value
  };

  const res = await fetch(`${API_BASE}/api/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatedUser)
  });

  if (res.ok) {
    alert("Profile updated!");
    modal.classList.remove('open');
    loadDashboard(); // refresh the UI
  } else {
    alert("Failed to update profile.");
  }
});
