// Preloader
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  preloader.style.opacity = "0";
  setTimeout(() => {
    preloader.style.display = "none";
  }, 300);

  // Show hero button with smooth animation
  const heroButton = document.getElementById("hero-button");
  heroButton.classList.add("show");

  // Add click event to hero button to scroll to projects section
  heroButton.addEventListener("click", () => {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      window.scrollTo({
        top: projectsSection.offsetTop - 60,
        behavior: "smooth",
      });
    }
  });

  // Animate skill bars
  animateSkillBars();
});

// Burger menu toggle
const burger = document.getElementById("burger");
const navLinks = document.getElementById("nav-links");

const musicWidget = document.querySelector(".music-widget");

burger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  burger.classList.toggle("open");
  // Toggle aria-expanded attribute for accessibility
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));

  if (musicWidget) {
    if (navLinks.classList.contains("open")) {
      // Menu opened - hide music widget with smooth animation
      musicWidget.classList.remove("scale-fade-in");
      musicWidget.classList.add("scale-fade-out");
      musicWidget.addEventListener(
        "animationend",
        function handler() {
          musicWidget.style.display = "none";
          musicWidget.removeEventListener("animationend", handler);
        },
        { once: true }
      );
    } else {
      // Menu closed - show music widget with smooth animation
      musicWidget.style.display = "flex";
      musicWidget.classList.remove("scale-fade-out");
      musicWidget.classList.add("scale-fade-in");
      musicWidget.addEventListener(
        "animationend",
        function handler() {
          musicWidget.classList.remove("scale-fade-in");
          musicWidget.removeEventListener("animationend", handler);
        },
        { once: true }
      );
    }
  }
});

// Smooth scroll for nav links
const navLinkElements = document.querySelectorAll(".nav-links li a");

navLinkElements.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - 60,
        behavior: "smooth",
      });
    }
    // Close nav menu on mobile after click
    if (navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      burger.classList.remove("open");

      // Show music widget when menu is closed
      if (musicWidget) {
        musicWidget.style.display = "flex";
        musicWidget.classList.remove("scale-fade-out");
        musicWidget.classList.add("scale-fade-in");
        musicWidget.addEventListener(
          "animationend",
          function handler() {
            musicWidget.classList.remove("scale-fade-in");
            musicWidget.removeEventListener("animationend", handler);
          },
          { once: true }
        );
      }
    }
  });
});

// Typing effect for hero subtitle
const typingText = "Welcome To My Personal Website";
const typingElement = document.getElementById("typing");
let index = 0;

function type() {
  if (index === 0) {
    typingElement.textContent = "";
  }
  if (index < typingText.length) {
    typingElement.textContent += typingText.charAt(index);
    index++;
    setTimeout(type, 120);
  } else {
    setTimeout(() => {
      typingElement.textContent = "";
      index = 0;
      type();
    }, 2000);
  }
}

// Start typing animation after hero title and subtitle animations finish (1.7s delay)
setTimeout(() => {
  type();
}, 3700);

function animateSkillBars() {
  const htmlBar = document.querySelector(".skill-progress.html");
  const cssBar = document.querySelector(".skill-progress.css");
  const jsBar = document.querySelector(".skill-progress.js");

  setTimeout(() => {
    htmlBar.style.width = "45%";
    cssBar.style.width = "35%";
    jsBar.style.width = "20%";
  }, 500);
}
