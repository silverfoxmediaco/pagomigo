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

// Fetch user profile, transactions, and incoming requests
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');

    const profileRes = await fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await profileRes.json();

    document.getElementById('user-name').textContent = profile.name;
    document.getElementById('user-email').textContent = profile.email;
    document.getElementById('user-kyc').textContent = profile.kyc_status;

    const txRes = await fetch('/api/transactions/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const transactions = await txRes.json();

    const txList = document.getElementById('transaction-list');
    txList.innerHTML = '';
    transactions.forEach(tx => {
      const li = document.createElement('li');
      li.textContent = `${tx.recipientName} • ${tx.recipientCountry} • $${tx.amountUsd} • ${tx.status}`;
      txList.appendChild(li);
    });

    const reqRes = await fetch('/api/requests', {
      headers: { Authorization: `Bearer ${token}` }
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
  }
}

async function approveRequest(requestId) {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/requests/${requestId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
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
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/requests/${requestId}/decline`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
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
