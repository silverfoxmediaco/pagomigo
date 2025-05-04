// signup.js

const API_BASE = 'https://pagomigo.com';

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");

  if (!signupForm) return;

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      const result = await response.json();
      messageEl.textContent = result.message;

      if (response.ok) {
        signupForm.reset();
        alert("Signup successful! Please check your email to verify.");
      }

    } catch (error) {
      console.error("Signup error:", error);
      messageEl.textContent = "Error signing up. Please try again later.";
    }
  });
});
