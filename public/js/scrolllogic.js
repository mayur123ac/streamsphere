document.addEventListener("DOMContentLoaded", () => {
  // 1. Manual Scroll Logic (Buttons)
  const containers = document.querySelectorAll(".row, .trending-container");

  containers.forEach((wrapper) => {
    const slider = wrapper.querySelector(".slider, .row-posters, .trending");
    const prevBtn = wrapper.querySelector(".scroll-btn.prev");
    const nextBtn = wrapper.querySelector(".scroll-btn.next");

    if (!slider || !prevBtn || !nextBtn) return;

    nextBtn.addEventListener("click", () => {
      slider.scrollBy({ left: 1000, behavior: "smooth" });
    });

    prevBtn.addEventListener("click", () => {
      slider.scrollBy({ left: -1000, behavior: "smooth" });
    });
  });

  // 2. Card Logic
  const cards = document.querySelectorAll(".carde");

  function closeAllCards() {
    cards.forEach((c) => {
      const info = c.querySelector(".info-right");
      if (info) {
        c.style.width = "";
        info.style.opacity = "0";
        info.style.transform = "translateX(-20px)";
        c.classList.remove("active");
      }
    });
  }

  cards.forEach((card) => {
    const info = card.querySelector(".info-right");
    if (!info) return;

    card.addEventListener("click", (e) => {
      // Ignore buttons/links
      if (
        e.target.tagName === "BUTTON" ||
        e.target.closest("button") ||
        e.target.closest("a")
      ) {
        return;
      }

      const isOpen = card.classList.contains("active");
      closeAllCards();

      if (!isOpen) {
        const expandedWidth = window.innerWidth < 768 ? "300px" : "420px";
        card.style.width = expandedWidth;
        info.style.opacity = "1";
        info.style.transform = "translateX(0)";
        card.classList.add("active");

        // --- AUTO SCROLL LOGIC ---
        const container = card.parentElement;

        if (container) {
          const cardsInThisRow = container.querySelectorAll(".carde");
          const lastCardInRow = cardsInThisRow[cardsInThisRow.length - 1];

          if (card === lastCardInRow) {
            // Scroll immediately to show movement
            container.scrollTo({
              left: container.scrollWidth,
              behavior: "smooth",
            });

            // Scroll AGAIN after 400ms (when animation finishes) to catch the full width
            setTimeout(() => {
              container.scrollTo({
                left: container.scrollWidth,
                behavior: "smooth",
              });
            }, 400);
          } else {
            // Normal scroll logic for other cards
            const containerRect = container.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const spaceOnRight = containerRect.right - cardRect.left;
            const targetWidth = window.innerWidth < 768 ? 300 : 420;

            if (spaceOnRight < targetWidth) {
              const scrollNeeded = targetWidth - spaceOnRight + 20;
              container.scrollBy({
                left: scrollNeeded,
                behavior: "smooth",
              });
            }
          }
        }
      }
    });
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (![...cards].some((card) => card.contains(e.target))) {
      closeAllCards();
    }
  });
});

// Newlist
async function addToMyList(btn) {
  // Prevent the card from expanding when clicking the button
  event.stopPropagation();
  event.preventDefault();

  const card = btn.closest(".carde");

  // Extract data from the card
  const movieData = {
    title: card.querySelector("h3").innerText,
    image: card.querySelector("img").src,
    // We can get the link from the 'a' tag next to the button
    link: card.querySelector(".btn-group a").getAttribute("href"),
    genre: card.querySelector(".genre").innerText,
    description: card.querySelector(".description").innerText,
  };

  // Change button temporarily to show feedback
  const originalText = btn.innerText;
  btn.innerText = "✓";
  btn.style.borderColor = "#46d369"; // Netflix Green

  try {
    const response = await fetch("/api/add-to-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieData),
    });

    if (!response.ok) {
      throw new Error("Failed to add");
    }
    console.log("Added to list!");
  } catch (err) {
    console.error(err);
    btn.innerText = "!"; // Error state
    btn.style.borderColor = "red";
  }

  // Optional: Reset button after 2 seconds
  setTimeout(() => {
    btn.innerText = originalText;
    btn.style.borderColor = "#aaa";
  }, 2000);
}
