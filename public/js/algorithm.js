// --- SPHEREBOT LOGIC ---

// 1. Get the name securely from the hidden HTML element
const hiddenNameInput = document.getElementById("userIdentifier");
const actualName = hiddenNameInput ? hiddenNameInput.value : "";

const sphereData = {
  isOpen: false,
  // If actualName exists, use it. Otherwise, fallback to "Movie Buff"
  userName: actualName && actualName.trim() !== "" ? actualName : "Movie Buff",
  movies: [],
};

// ... rest of your code

const chatWindow = document.getElementById("sphereChat");
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("sphereInput");

// 1. Scrape Movies from Page (The "Algorithm")
function getMoviesFromDOM() {
  const allCards = document.querySelectorAll(".carde");
  const movieList = [];
  const seenTitles = new Set(); // Prevent duplicates

  allCards.forEach((card) => {
    const title = card.querySelector("h3")?.innerText;
    const genreText = card.querySelector(".genre")?.innerText.toLowerCase();
    const img = card.querySelector("img")?.src;
    // Try to find link in 'a' tag wrapping button or image
    let link = card.querySelector("a")?.href;
    if (!link) link = card.querySelector(".btn-group a")?.href;
    if (!link) link = "#";

    if (title && genreText && !seenTitles.has(title)) {
      seenTitles.add(title);
      movieList.push({
        title: title,
        tags: genreText + " " + title.toLowerCase(), // Combine title and genre for search
        img: img,
        link: link,
      });
    }
  });
  return movieList;
}

// Load movies on page load
window.addEventListener("load", () => {
  sphereData.movies = getMoviesFromDOM();
  console.log(`SphereBot loaded ${sphereData.movies.length} movies.`);
});

// 2. Chat UI Toggles
function toggleSphereChat() {
  sphereData.isOpen = !sphereData.isOpen;
  chatWindow.classList.toggle("active");
  document.getElementById("sphereOverlay").classList.toggle("active");

  // Hide welcome bubble permanently on first open
  const welcomeText = document.getElementById("sphereWelcome");
  if (welcomeText) welcomeText.style.display = "none";

  if (sphereData.isOpen && chatBody.children.length === 0) {
    startConversation();
  }
}

// 3. Messaging Functions
function addMessage(text, sender, isHtml = false) {
  const div = document.createElement("div");
  div.classList.add("chat-msg", sender);
  if (isHtml) div.innerHTML = text;
  else div.innerText = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping() {
  const div = document.createElement("div");
  div.classList.add("typing-container");
  div.id = "typingIndicator";
  div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function handleUserMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";

  showTyping();
  setTimeout(() => {
    removeTyping();
    processMood(text.toLowerCase());
  }, 1500);
}

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleUserMessage();
});

// 5. The Mood Matching Algorithm
function processMood(input) {
  // 1. Check for Support/Complex queries
  const supportKeywords = [
    "payment",
    "price",
    "subscription",
    "cost",
    "money",
    "contact",
    "support",
    "help",
    "issue",
    "problem",
    "refund",
    "complex",
  ];

  if (supportKeywords.some((keyword) => input.includes(keyword))) {
    addMessage(
      "It sounds like you need assistance with your account or payments. I'm just a movie bot! 🤖",
      "bot",
    );
    setTimeout(() => {
      addMessage("I'm redirecting you to our support team...", "bot");
      setTimeout(() => {
        window.location.href = "/contactus";
      }, 2000);
    }, 1000);
    return; // Stop processing movies
  }

  // 2. Process Movie Moods
  let moodKeywords = [];
  let replyText = "";

  if (
    input.includes("sad") ||
    input.includes("cry") ||
    input.includes("depressed") ||
    input.includes("upset")
  ) {
    moodKeywords = ["drama", "romance", "slice of life", "musical"];
    replyText =
      "Aww. 🌧️ It's okay to feel down. I've found some emotional stories to help you let it out, or maybe a romance to warm your heart.";
  } else if (
    input.includes("happy") ||
    input.includes("good") ||
    input.includes("great") ||
    input.includes("fun")
  ) {
    moodKeywords = ["comedy", "adventure", "fantasy", "family", "animation"];
    replyText =
      "That's the spirit! ✨ Let's keep the good vibes rolling with these fun picks.";
  } else if (input.includes("bored") || input.includes("tired")) {
    moodKeywords = ["sci-fi", "thriller", "mystery", "crime"];
    replyText =
      "Boredom detected. 🚨 Initiating wake-up protocol. You need something mind-bending or intense.";
  } else if (
    input.includes("scared") ||
    input.includes("horror") ||
    input.includes("spooky") ||
    input.includes("dark")
  ) {
    moodKeywords = ["horror", "thriller", "mystery", "supernatural"];
    replyText =
      "Feeling brave, are we? 👻 Turn off the lights and watch these...";
  } else if (
    input.includes("angry") ||
    input.includes("frustrated") ||
    input.includes("energy")
  ) {
    moodKeywords = ["action", "war", "sports", "crime"];
    replyText =
      "Let's blow off some steam. 💥 Here is some high-octane action.";
  } else {
    // Default Search (Tag matching)
    moodKeywords = [input];
    replyText = `Searching specifically for "${input}" vibes...`;
  }

  // Filter Movies
  let recommendations = sphereData.movies.filter((movie) => {
    return moodKeywords.some((keyword) => movie.tags.includes(keyword));
  });

  // Shuffle and Slice (Get 3 random recommendations)
  recommendations = recommendations.sort(() => 0.5 - Math.random()).slice(0, 3);

  addMessage(replyText, "bot");

  if (recommendations.length > 0) {
    recommendations.forEach((movie) => {
      const cardHtml = `
            <a href="${movie.link}" style="text-decoration:none;">
              <div class="chat-movie-card">
                <img src="${movie.img}">
                <div class="chat-movie-info">
                  <h5>${movie.title}</h5>
                  <p>Watch Now ▶</p>
                </div>
              </div>
            </a>
          `;
      addMessage(cardHtml, "bot", true);
    });
  } else {
    addMessage(
      "I couldn't find a perfect match for that specific mood in our library right now. But you should try 'F1'—it's trending! 🏎️",
      "bot",
    );
  }
}
