document.addEventListener("DOMContentLoaded", () => {
    const navList = document.getElementById("navList");
    if (!navList) return;
  
    navList.innerHTML = `
      <li><a href="dashboard.html">Dashboard</a></li>
      <li><a href="moneymover.html">Send/Request Money</a></li>
      <li><a href="home.html">Home</a></li>
      <li><a href="#">Settings</a></li>
      <li id="authMenuItem"><a href="login.html">Login</a></li>
    `;
  
    // Token check to swap Login -> Logout
    const token = localStorage.getItem("token");
    const authItem = document.getElementById("authMenuItem");
    if (authItem) {
      if (token) {
        authItem.innerHTML = `<a href="#">Logout</a>`;
        authItem.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("token");
          window.location.href = "home.html";
        });
      }
    }
  });
  