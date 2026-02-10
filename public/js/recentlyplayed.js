document.addEventListener("DOMContentLoaded", () => {
  const recentRow = document.getElementById("recently-played-row");
  const recentSlider = document.getElementById("recently-played-slider");

  // 1. GET EMAIL DIRECTLY FROM THE PAGE
  const emailElement = document.querySelector(".profile-email");
  const currentUserEmail = emailElement ? emailElement.innerText.trim() : null;

  console.log("Current User Email:", currentUserEmail);

  if (!currentUserEmail) {
    recentRow.style.display = "none";
  } else {
    // Load movies from DB
    fetchRecentlyPlayed(currentUserEmail);
  }

  // 2. LISTEN FOR CLICKS ON "PLAY" BUTTONS
  // This detects clicks on Play buttons anywhere on the page to save them
  const playLinks = document.querySelectorAll(".btn-group a, .hero-content a");

  playLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const card = this.closest(".carde");
      const hero = this.closest(".hero-content");

      let movieData = {};

      if (card) {
        movieData = {
          title: card.querySelector("h3")?.innerText || "Unknown Title",
          image: card.querySelector("img")?.src || "",
          link: this.getAttribute("href"),
          genre: card.querySelector(".genre")?.innerText || "",
          description: card.querySelector(".description")?.innerText || "",
        };
      } else if (hero) {
        movieData = {
          title: hero.querySelector("h1")?.innerText || "Unknown Title",
          image: "/assets/f1hero.jpg",
          link: this.getAttribute("href"),
          genre: "Trending Now",
          description: hero.querySelector(".desc")?.innerText || "",
        };
      }

      if (currentUserEmail && movieData.title) {
        addToRecentlyPlayed(movieData, currentUserEmail);
      }
    });
  });

  // --- API Functions ---

  async function addToRecentlyPlayed(movie, email) {
    try {
      await fetch("/api/add-recent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, movie: movie }),
      });
    } catch (error) {
      console.error("Error saving recent movie:", error);
    }
  }

  async function fetchRecentlyPlayed(email) {
    try {
      const response = await fetch(`/api/get-recent?email=${email}`);
      const data = await response.json();

      const recent = data.recentlyPlayed || [];
      renderRecentlyPlayed(recent);
    } catch (error) {
      console.error("Error fetching recent movies:", error);
    }
  }

  function renderRecentlyPlayed(recent) {
    if (!recent || recent.length === 0) {
      recentRow.style.display = "none";
      return;
    }

    recentRow.style.display = "block";
    recentSlider.innerHTML = "";

    recent.forEach((movie) => {
      const cardHTML = `
          <div class="carde">
            <img src="${movie.image}" alt="${movie.title}" />
            <div class="info-right">
              <h3>${movie.title}</h3>
              <p class="genre">${movie.genre}</p>
              <p class="description">${movie.description}</p>
              <div class="btn-group">
                <a href="${movie.link}">
                  <button class="play-btn">▶ Play</button>
                </a>
                <button class="add-btn" onclick="addToMyList(this)">+</button>
              </div>
            </div>
          </div>
        `;
      recentSlider.insertAdjacentHTML("beforeend", cardHTML);
    });

    // 👇 Trigger the Logic to make these new cards clickable/expandable
    reattachCardLogic();
  }

  // --- 3. CARD EXPANSION LOGIC ---
  function reattachCardLogic() {
    // Only select cards inside the Recently Played slider
    const cards = recentSlider.querySelectorAll(".carde");

    cards.forEach((card) => {
      const info = card.querySelector(".info-right");

      card.addEventListener("click", (e) => {
        // Do not expand if clicking the Play or Add button
        if (
          e.target.tagName === "BUTTON" ||
          e.target.closest("button") ||
          e.target.closest("a")
        ) {
          return;
        }

        // Close other open cards in this row
        const openCards = recentSlider.querySelectorAll(".carde.active");
        openCards.forEach((c) => {
          if (c !== card) {
            c.style.width = ""; // Reset width
            const cInfo = c.querySelector(".info-right");
            if (cInfo) cInfo.style.opacity = "0";
            c.classList.remove("active");
          }
        });

        // Toggle current card
        const isOpen = card.classList.contains("active");

        if (!isOpen) {
          // Open it
          const expandedWidth = window.innerWidth < 768 ? "300px" : "420px";
          card.style.width = expandedWidth;
          if (info) {
            info.style.opacity = "1";
            info.style.transform = "translateX(0)";
          }
          card.classList.add("active");
        } else {
          // Close it
          card.style.width = "";
          if (info) {
            info.style.opacity = "0";
          }
          card.classList.remove("active");
        }
      });
    });
  }
});