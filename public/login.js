document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const messageEl = document.getElementById("message");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rawPhone = document.getElementById("login-phone").value;
    const password = document.getElementById("login-password").value;

    const phone = normalizePhone(rawPhone); // 🔄 Format to E.164

    try {
      const response = await fetch("https://pagomigo.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = "dashboard.html";
      } else {
        messageEl.textContent = result.message || "Login failed.";
      }
    } catch (error) {
      console.error("Login error:", error);
      messageEl.textContent = "Error logging in. Please try again.";
    }
  });

  function normalizePhone(input) {
    const digits = input.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('1')
      ? `+${digits}`
      : `+1${digits}`;
  }
});
