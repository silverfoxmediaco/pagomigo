// login.js

const API_BASE = 'https://pagomigo.com';

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const messageEl = document.getElementById("message");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        window.location.href = "dashboard.html"; // or wherever your dashboard lives
      } else {
        messageEl.textContent = result.message || "Login failed.";
      }
    } catch (error) {
      console.error("Login error:", error);
      messageEl.textContent = "Error logging in. Please try again.";
    }
  });
});
