document.addEventListener("DOMContentLoaded", () => {
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
  
    // Animation logic
    const animatedElements = document.querySelectorAll(".debit-card-text, .debit-card-image");
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate once
        }
      });
    }, { threshold: 0.1 });
  
    animatedElements.forEach(el => observer.observe(el));
  });
  