document.addEventListener("DOMContentLoaded", () => {
    const navList = document.getElementById("navList");
    if (!navList) return;
  
    navList.innerHTML = `
      <li><a href="dashboard.html">Dashboard</a></li>
      <li><a href="moneymover.html">Send/Request Money</a></li>
      <li><a href="/">Home</a></li>
      <li><a href="#">Settings</a></li>
      <li id="authMenuItem"><a href="login.html">Login</a></li>
    `;
  
    // Session-based login check
  (async () => {
  try {
    const res = await fetch('https://pagomigo.com/api/user/profile', {
      method: 'GET',
      credentials: 'include'
    });

    const authItem = document.getElementById("authMenuItem");

    if (res.ok && authItem) {
      authItem.innerHTML = `<a href="#">Logout</a>`;
      authItem.addEventListener("click", async (e) => {
        e.preventDefault();
        await fetch('https://pagomigo.com/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        window.location.href = "home.html";
      });
    }
  } catch (err) {
    console.warn("Auth check failed:", err);
  }
})();



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
  
