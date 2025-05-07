// home.js — Join Now Modal + Signup Logic

document.addEventListener("DOMContentLoaded", () => {
  // Burger menu
  const hamburger = document.getElementById("hamburger");
  const slideoutMenu = document.getElementById("slideoutMenu");
  const closeBtn = document.getElementById("closeMenu");

  if (hamburger) {
    hamburger.addEventListener("click", () => slideoutMenu.classList.add("open"));
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => slideoutMenu.classList.remove("open"));
  }

  // Animate elements on scroll
  const animatedElements = document.querySelectorAll(".debit-card-text, .debit-card-image");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animatedElements.forEach(el => observer.observe(el));

  // Signup modal
  const modal = document.getElementById("signup-modal");
  const closeSignupBtn = document.getElementById("close-signup");
  const joinNowBtn = document.getElementById("signupbtn");

  if (joinNowBtn) {
    joinNowBtn.addEventListener("click", () => modal.classList.add("active"));
  }

  if (closeSignupBtn) {
    closeSignupBtn.addEventListener("click", () => modal.classList.remove("active"));
  }

  // Signup form
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("signup-message");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!document.getElementById("agreeTerms").checked) {
        alert("You must agree to the Terms & Conditions and Privacy Policy.");
        return;
      }

      const name = document.getElementById("name").value;
      const username = document.getElementById("username").value;
      const phone = document.getElementById("phone").value;
      const password = document.getElementById("signup-password").value;

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, phone, password })
        });

        const text = await res.text(); // read once safely
        let data;

        try {
          data = JSON.parse(text); // parse manually
        } catch (parseErr) {
          console.error("Non-JSON response from /register:", text);
          messageEl.textContent = "Unexpected server response.";
          return;
        }

        if (!res.ok) {
          messageEl.textContent = data.message || "Signup failed. Try again.";
          return;
        }

        // On success
        messageEl.textContent = data.message || "Account created!";
        localStorage.setItem("phone", phone);
        signupForm.reset();

        setTimeout(() => {
          modal.classList.remove("active");
          window.location.href = "/verify.html";
        }, 1500);
      } catch (err) {
        console.error("Signup error:", err);
        messageEl.textContent = "Signup failed. Try again.";
      }
    });
  }
});
