// Toggle mobile menu
    const toggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".navbar ul");

    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    