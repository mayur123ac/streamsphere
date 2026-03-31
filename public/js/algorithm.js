// ============================================================
//  SPHEREBOT v3.0 — Enhanced Movie Intelligence System
//  New: Actor Search · Movie Details · Intent Detection
//  Existing: Mood-based Recommendations (unchanged)
// ============================================================

// ── 1. IDENTITY ─────────────────────────────────────────────
const hiddenNameInput = document.getElementById("userIdentifier");
const actualName = hiddenNameInput?.value?.trim() || "Movie Buff";

const sphereData = {
  isOpen: false,
  userName: actualName !== "" ? actualName : "Movie Buff",
  movies: [],
  sessionRecommended: new Set(),
  conversationStage: "greeting",
  lastMoodKeywords: [],
  awaitingFollowUp: false,
  // v3.0 additions
  movieIndex: {},      // title → movie (lowercased, for fast O(1) lookup)
  actorIndex: {},      // actor_name → [movies] (built once on load)
};

const chatWindow = document.getElementById("sphereChat");
const chatBody   = document.getElementById("chatBody");
const chatInput  = document.getElementById("sphereInput");


// ── 2. RECENTLY WATCHED ENGINE ───────────────────────────────
function getWatchedTitles() {
  try {
    const raw = localStorage.getItem("recentlyPlayed");
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(arr.map(item =>
      (typeof item === "string" ? item : (item.title || item.name || ""))
        .toLowerCase().trim()
    ));
  } catch {
    return new Set();
  }
}

function isWatched(movieTitle) {
  const watched = getWatchedTitles();
  return watched.has(movieTitle.toLowerCase().trim());
}


// ── 3. SCRAPE MOVIES FROM DOM ────────────────────────────────
function getMoviesFromDOM() {
  const allCards = document.querySelectorAll(".carde");
  const movieList = [];
  const seenTitles = new Set();

  allCards.forEach((card) => {
    const title     = card.querySelector("h3")?.innerText?.trim();
    const genreText = card.querySelector(".genre")?.innerText?.toLowerCase() || "";
    const desc      = card.querySelector(".description")?.innerText?.trim() || "";
    const img       = card.querySelector("img")?.src;
    const link      = card.querySelector("a")?.href || "#";

    if (title && !seenTitles.has(title)) {
      seenTitles.add(title);

      const genres = genreText
        .split("•")
        .map(g => g.trim())
        .filter(Boolean);

      const isNew = /202[45]/.test(title);

      // Extract year from title if present (e.g. "Havoc (2025)")
      const yearMatch = title.match(/\((\d{4})\)/);
      const year = yearMatch ? yearMatch[1] : null;

      // Clean title without year for matching
      const cleanTitle = title.replace(/\(\d{4}\)/, "").trim();

      movieList.push({
        title,
        cleanTitle,
        year,
        genres,
        description: desc,
        tags: genreText + " " + title.toLowerCase() + " " + desc.toLowerCase(),
        img,
        link,
        isNew,
        score: 0,
        // cast will be populated from CAST_DATABASE below
        cast: [],
      });
    }
  });

  return movieList;
}


// ── 3b. OMDB CONFIG & RATING CACHE ──────────────────────────
// Free API key → https://www.omdbapi.com/apikey.aspx  (1 000 req/day)
// Paste ONLY the key string, e.g. "215998b1"  ← nothing else
const OMDB_API_KEY = "215998b1";
const ratingCache  = {};   // movieTitle (lower) → { rating, votes }

async function fetchImdbRating(movieTitle) {
  const cacheKey = movieTitle.toLowerCase().trim();
  if (ratingCache[cacheKey]) return ratingCache[cacheKey];   // cache hit

  try {
    const q   = encodeURIComponent(movieTitle.replace(/\(\d{4}\)/g, "").trim());
    const res = await fetch(`https://www.omdbapi.com/?t=${q}&apikey=${OMDB_API_KEY}`);
    const d   = await res.json();
    if (d.Response === "True" && d.imdbRating && d.imdbRating !== "N/A") {
      const result = { rating: d.imdbRating, votes: d.imdbVotes || "" };
      ratingCache[cacheKey] = result;
      return result;
    }
  } catch { /* network error — fail silently, never block UI */ }

  return null;  // null → show "not available" badge, never fake a number
}


// ── 4. CAST DATABASE ─────────────────────────────────────────
// Curated cast data for all movies on the platform.
// Keys must match the cleanTitle (case-insensitive) of DOM-scraped movies.
// Add more entries as movies are added to the platform.
const CAST_DATABASE = {
  "my oxford year": ["Kenya Fehr", "Corey Mylchreest", "Saffron Hocking"],
  "interstellar": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
  "havoc": ["Tom Hardy", "Forest Whitaker", "Timothy Olyphant"],
  "eden": ["Ana de Armas", "Sydney Sweeney", "Jude Law", "Vanessa Kirby"],
  "demon slayer: infinity castle": ["Natsuki Hanae", "Akari Kito", "Hiro Shimono", "Yoshitsugu Matsuoka"],
  "spider-man: homecoming": ["Tom Holland", "Michael Keaton", "Robert Downey Jr.", "Zendaya"],
  "incantation": ["Tsai Hsuan-yen", "Frank Hsieh"],
  "a minecraft movie": ["Jack Black", "Jason Momoa", "Jennifer Coolidge", "Danielle Brooks"],
  "hereditary": ["Toni Collette", "Alex Wolff", "Milly Shapiro", "Gabriel Byrne"],
  "the witch": ["Anya Taylor-Joy", "Ralph Ineson", "Kate Dickie"],
  "insidious: the last key": ["Lin Shaye", "Leigh Whannell", "Angus Sampson"],
  "f1": ["Brad Pitt", "Damson Idris", "Kerry Condon", "Javier Bardem"],
  "materialists": ["Dakota Johnson", "Chris Evans", "Pedro Pascal"],
  "the avengers": ["Robert Downey Jr.", "Chris Evans", "Chris Hemsworth", "Scarlett Johansson", "Mark Ruffalo", "Jeremy Renner"],
  "ballerina": ["Ana de Armas", "Keanu Reeves", "Ian McShane"],
  "final destination": ["Tony Todd", "Kaitlyn Santa Juana"],
  "fantastic four": ["Pedro Pascal", "Vanessa Kirby", "Joseph Quinn", "Ebon Moss-Bachrach"],
  "avatar: the way of water": ["Sam Worthington", "Zoe Saldaña", "Sigourney Weaver", "Kate Winslet"],
  "how to train your dragon": ["Mason Thames", "Nico Parker", "Gerard Butler"],
  "k.g.f: chapter 2": ["Yash", "Sanjay Dutt", "Raveena Tandon", "Srinidhi Shetty"],
  "saiyaara": ["Ahaan Panday", "Aneet Padda"],
  "kantara: chapter 1": ["Rishab Shetty"],
  "aap jaisa koi": ["Varun Dhawan", "Mrunal Thakur"],
  "article 370": ["Yami Gautam", "Priya Mani"],
  "metro in dino": ["Aditya Roy Kapur", "Sara Ali Khan", "Fatima Sana Shaikh", "Ali Fazal"],
  "sector 36": ["Vikrant Massey", "Deepak Dobriyal"],
  "ctrl": ["Ananya Panday", "Vihaan Samat"],
  "housefull 5": ["Akshay Kumar", "Riteish Deshmukh", "Abhishek Bachchan", "Jacqueline Fernandez"],
  "dhurandhar": ["Ranveer Singh", "Sanjay Dutt", "R. Madhavan"],
  "burning betrayal": ["Hong Kyung", "Jun Jong-seo", "Steven Yeun"],
  "anora": ["Yura Borisov", "Mikey Madison", "Yuriy Borisov"],
  "love me love me": ["Francesca Beggio", "Christian Felber"],
  "queen of chess": ["Zsófia Petri"],
  "yeh jawaani hai deewani": ["Ranbir Kapoor", "Deepika Padukone", "Aditya Roy Kapur", "Kalki Koechlin"],
  "salaar": ["Prabhas", "Prithviraj Sukumaran", "Shruti Haasan"],
  "devara: part 1": ["Jr. NTR", "Janhvi Kapoor", "Saif Ali Khan"],
  "oppenheimer": ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr.", "Matt Damon"],
  "parasite": ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
  "everything everywhere all at once": ["Michelle Yeoh", "Ke Huy Quan", "Jamie Lee Curtis", "Stephanie Hsu"],
  "the godfather": ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
  "la la land": ["Ryan Gosling", "Emma Stone", "John Legend"],
  "joker": ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz"],
  "spider-man: into the spider-verse": ["Shameik Moore", "Hailee Steinfeld", "Nicolas Cage"],
  "1917": ["George MacKay", "Dean-Charles Chapman", "Mark Strong"],
  "rrr": ["Jr. NTR", "Ram Charan", "Alia Bhatt", "Ajay Devgn"],
  "haq": ["Huma Qureshi", "Randeep Hooda"],
  "tenet": ["John David Washington", "Robert Pattinson", "Elizabeth Debicki", "Kenneth Branagh"],
  "poor things": ["Emma Stone", "Willem Dafoe", "Mark Ruffalo", "Ramy Youssef"],
  "i want to eat your pancreas": ["Mahiro Takasugi", "Lynn"],
  "5 centimeters per second": ["Kenji Mizuhashi"],
  "your name": ["Ryûnosuke Kamiki", "Mone Kamishiraishi"],
  "spirited away": ["Daveigh Chase", "Suzanne Pleshette"],
  "a silent voice": ["Miyu Irino", "Saori Hayami"],
  "princess mononoke": ["Billy Crudup", "Claire Danes", "Minnie Driver"],
  "weathering with you": ["Kotaro Daigo", "Nana Mori"],
  "howl's moving castle": ["Christian Bale", "Emily Mortimer", "Lauren Bacall"],
  "akira": ["Mitsuo Iwata", "Nozomu Sasaki"],
  "my neighbor totoro": ["Dakota Fanning", "Elle Fanning"],
  "demon slayer: mugen train": ["Natsuki Hanae", "Akari Kito", "Hiro Shimono"],
  "grave of the fireflies": ["Tsutomu Tatsumi", "Ayano Shiraishi"],
  "train to busan": ["Gong Yoo", "Ma Dong-seok", "Jung Yu-mi"],
  "oldboy": ["Choi Min-sik", "Yoo Ji-tae", "Kang Hye-jung"],
  "the handmaiden": ["Kim Min-hee", "Ha Jung-woo", "Cho Jin-woong"],
  "memories of murder": ["Song Kang-ho", "Kim Sang-kyung"],
  "i saw the devil": ["Lee Byung-hun", "Choi Min-sik"],
  "the wailing": ["Kwak Do-won", "Hwang Jung-min", "Jun Kunimura"],
  "exhuma": ["Choi Min-sik", "Kim Go-eun", "Yoo Hae-jin"],
  "a taxi driver": ["Song Kang-ho", "Thomas Kretschmann"],
  "the host": ["Song Kang-ho", "Bae Doona"],
  "decision to leave": ["Park Hae-il", "Tang Wei"],
  "concrete utopia": ["Lee Byung-hun", "Park Seo-jun", "Park Bo-young"],
  "forgotten": ["Kang Ha-neul", "Kim Mu-yeol"],
  "the roundup": ["Ma Dong-seok", "Son Seok-koo"],
};


// ── 5. BUILD INDEXES ─────────────────────────────────────────
// Call once after DOM scrape. Builds O(1) title lookup and actor → movies map.
function buildIndexes(movies) {
  const titleIndex = {};
  const actorIndex = {};

  movies.forEach(movie => {
    // Title index: normalised clean title → movie object
    titleIndex[movie.cleanTitle.toLowerCase()] = movie;
    // Also index by full title (with year) as fallback
    titleIndex[movie.title.toLowerCase()] = movie;

    // Enrich movie.cast from CAST_DATABASE
    const castKey = movie.cleanTitle.toLowerCase();
    if (CAST_DATABASE[castKey]) {
      movie.cast = CAST_DATABASE[castKey];
    }

    // Actor index: actor_name (lowercase) → [movie, ...]
    movie.cast.forEach(actor => {
      const key = actor.toLowerCase().trim();
      if (!actorIndex[key]) actorIndex[key] = [];
      actorIndex[key].push(movie);
    });
  });

  sphereData.movieIndex = titleIndex;
  sphereData.actorIndex = actorIndex;
}

window.addEventListener("load", () => {
  sphereData.movies = getMoviesFromDOM();
  buildIndexes(sphereData.movies);
  console.log(`SphereBot v3 loaded ${sphereData.movies.length} movies.`);
  console.log(`Actor index has ${Object.keys(sphereData.actorIndex).length} unique actors.`);
});


// ── 6. USER AFFINITY PROFILE ─────────────────────────────────
function buildAffinityProfile() {
  const genreWeights = {};
  try {
    const raw = localStorage.getItem("recentlyPlayed");
    if (!raw) return genreWeights;
    const watched = JSON.parse(raw);
    watched.forEach((item, index) => {
      const genres = (item.genre || item.genres || "")
        .toLowerCase()
        .split(/[•,]/)
        .map(g => g.trim())
        .filter(Boolean);
      const recencyBoost = Math.max(1, watched.length - index);
      genres.forEach(genre => {
        genreWeights[genre] = (genreWeights[genre] || 0) + recencyBoost;
      });
    });
  } catch { /* silent fail */ }
  return genreWeights;
}


// ── 7. SMART SCORING ENGINE ──────────────────────────────────
function scoreMovies(movies, moodKeywords) {
  const affinityProfile = buildAffinityProfile();
  const watchedTitles   = getWatchedTitles();
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isNight   = hour >= 21 || hour < 6;
  const isMorning = hour >= 6 && hour < 12;

  return movies
    .map(movie => {
      let score = 0;
      if (watchedTitles.has(movie.title.toLowerCase().trim())) return null;
      if (sphereData.sessionRecommended.has(movie.title)) return null;

      const moodMatches = moodKeywords.filter(kw => movie.tags.includes(kw)).length;
      score += moodMatches * 40;

      movie.genres.forEach(genre => {
        if (affinityProfile[genre]) score += affinityProfile[genre] * 8;
      });

      if (movie.isNew) score += 15;

      if (isNight) {
        if (movie.tags.includes("horror") || movie.tags.includes("thriller")) score += 20;
        if (movie.tags.includes("mystery") || movie.tags.includes("crime"))   score += 10;
      }
      if (isMorning) {
        if (movie.tags.includes("comedy") || movie.tags.includes("animation")) score += 15;
      }
      if (isWeekend) {
        if (movie.tags.includes("adventure") || movie.tags.includes("fantasy")) score += 10;
      }

      const genreCount = movies.filter(m =>
        m.genres.some(g => movie.genres.includes(g))
      ).length;
      score -= Math.floor(genreCount / 10);
      score += Math.random() * 10;

      return { ...movie, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}


// ── 8. GENRE DIVERSITY PICKER ────────────────────────────────
function pickDiverseRecs(scored, count = 3) {
  const picked = [];
  const usedGenres = new Set();

  for (const movie of scored) {
    if (picked.length >= count) break;
    const primary = movie.genres[0];
    if (primary && usedGenres.has(primary) && picked.length < count - 1) continue;
    usedGenres.add(primary);
    picked.push(movie);
  }

  for (const movie of scored) {
    if (picked.length >= count) break;
    if (!picked.includes(movie)) picked.push(movie);
  }

  picked.forEach(m => sphereData.sessionRecommended.add(m.title));
  return picked;
}


// ── 9. MOOD MAP ──────────────────────────────────────────────
const MOOD_MAP = [
  {
    triggers: ["sad","cry","depressed","upset","heartbreak","lonely","miss","grief","low","down"],
    keywords: ["drama","romance","slice of life","musical","emotional"],
    reply: `Sending you a virtual hug 💙. Sometimes a good cry is what we need. Here are films that truly feel things...`,
    followUp: "Would you prefer something that helps you cry it out, or something that'll slowly lift your mood? (cry / lift)"
  },
  {
    triggers: ["happy","excited","great","good","amazing","ecstatic","love","joy","awesome"],
    keywords: ["comedy","adventure","fantasy","family","animation","musical"],
    reply: `You're glowing! ✨ Let's match that energy with something that'll make you laugh and love life even more.`,
    followUp: null
  },
  {
    triggers: ["bored","nothing to do","meh","whatever","idk","suggest","random"],
    keywords: ["sci-fi","mystery","crime","thriller","mind-bending","twist"],
    reply: `Boredom is a crime I will not allow. 🚨 These films will grab you by the collar and refuse to let go.`,
    followUp: "Want something that makes you think, or something you can just vibe to? (think / vibe)"
  },
  {
    triggers: ["scared","horror","spooky","dark","creepy","chilling","nightmares"],
    keywords: ["horror","supernatural","thriller","mystery","psychological"],
    reply: `Brave soul, huh? 👻 Lock the doors, turn off the lights. These are genuinely unsettling...`,
    followUp: null
  },
  {
    triggers: ["angry","frustrated","rage","furious","mad","annoyed","pumped","energy","hype"],
    keywords: ["action","war","sports","crime","revenge","martial arts"],
    reply: `Let's channel that fire. 🔥 Pure adrenaline incoming — these will scratch that itch.`,
    followUp: null
  },
  {
    triggers: ["romantic","love","date","crush","relationship","couples","valentine"],
    keywords: ["romance","drama","romantic comedy"],
    reply: `Ohhh someone's feeling the love 💕 Here's what'll set the perfect mood...`,
    followUp: null
  },
  {
    triggers: ["lazy","chill","relax","easy","light","casual","background"],
    keywords: ["comedy","animation","family","adventure","feel-good"],
    reply: `Couch mode activated. 🛋️ Low stakes, high comfort — perfect for when you just want to decompress.`,
    followUp: null
  },
  {
    triggers: ["anime","cartoon","animated","ghibli","manga","japanese"],
    keywords: ["anime","animation","fantasy","dark fantasy"],
    reply: `Taste. Pure taste. 🎌 You clearly know what's good. Here's what you should watch next.`,
    followUp: null
  },
  {
    triggers: ["indian","bollywood","hindi","regional","desi"],
    keywords: ["indian","bollywood","drama","action","romance"],
    reply: `Desi vibes incoming! 🇮🇳 Here are some absolute bangers from Indian cinema.`,
    followUp: null
  },
  {
    triggers: ["korean","kdrama","k-drama","korea"],
    keywords: ["korean"],
    reply: `K-cinema hits different, doesn't it? 🇰🇷 Here are some absolute gems that'll wreck you in the best way.`,
    followUp: null
  },
  {
    triggers: ["think","intellectual","brain","smart","complex","philosophical","deep"],
    keywords: ["sci-fi","biography","history","drama","mystery","psychological"],
    reply: `A person of culture! 🧠 These films will live rent-free in your head for weeks.`,
    followUp: null
  },
  {
    triggers: ["family","kids","children","wholesome","parents"],
    keywords: ["family","animation","adventure","fantasy","comedy"],
    reply: `Perfect for a family night! 🏡 Everyone will love these — promised.`,
    followUp: null
  },
];

function detectMood(input) {
  for (const mood of MOOD_MAP) {
    if (mood.triggers.some(t => input.includes(t))) return mood;
  }
  return null;
}


// ── 10. FOLLOW-UP RESOLUTION ─────────────────────────────────
function resolveFollowUp(input, baseMoodKeywords) {
  if (input.includes("cry") || input.includes("emotional") || input.includes("feel")) {
    return ["drama","tragedy","grief","emotional"];
  }
  if (input.includes("lift") || input.includes("better") || input.includes("happy")) {
    return ["romance","feel-good","comedy","musical"];
  }
  if (input.includes("think") || input.includes("mind") || input.includes("complex")) {
    return ["sci-fi","mystery","psychological","philosophical"];
  }
  if (input.includes("vibe") || input.includes("easy") || input.includes("chill")) {
    return ["comedy","adventure","animation","fun"];
  }
  return baseMoodKeywords;
}


// ── 11. SUPPORT DETECTOR ─────────────────────────────────────
const SUPPORT_KEYWORDS = [
  "payment","price","subscription","cost","money",
  "contact","support","help","issue","problem","refund",
  "login","logout","account","password","cancel","billing"
];
function isSupport(input) {
  return SUPPORT_KEYWORDS.some(kw => input.includes(kw));
}


// ══════════════════════════════════════════════════════════════
//  V3.0 INTELLIGENCE LAYER
// ══════════════════════════════════════════════════════════════

// ── 12. INTENT DETECTION ─────────────────────────────────────
// Returns: "actor_search" | "movie_detail" | "mood" | "more" | "support" | "free_text"
function detectIntent(input) {
  const query = input.toLowerCase().trim();

  // =========================
  // 🎭 ACTOR SEARCH
  // =========================
  const ACTOR_PATTERNS = [
    /\b(movies?|films?|shows?)\s+(of|with|by|featuring|starring)\s+([a-z\s\-\.]+)/i,
    /\b([a-z\s\-\.]+?)\s+(movies?|films?|filmography)\b/i,
    /\bshow\s+me\s+([a-z\s\-\.]+?)\s+(movies?|films?)\b/i,
    /\bwhat\s+(movies?|films?)\s+(has|have|did)\s+([a-z\s\-\.]+?)\s+(done|made|starred|been\s+in|appeared)\b/i,
    /\blist\s+of\s+([a-z\s\-\.]+?)\s+(movies?|films?)\b/i,
    /\b([a-z\s\-\.]+?)\s+acted\s+in\b/i,
    /\bfilms?\s+featuring\s+([a-z\s\-\.]+)/i,
    /\bmovies?\s+by\s+([a-z\s\-\.]+)/i,
  ];

  for (const pat of ACTOR_PATTERNS) {
    if (pat.test(query)) return "actor_search";
  }

  // =========================
  // 🎬 MOVIE DETAILS
  // =========================
  const DETAIL_PATTERNS = [
    /\b(tell\s+me\s+about|what\s+is|about|info\s+on|details?\s+(of|about|on)|describe)\b/i,
    /\bwhat'?s\s+.+?\s+(about|movie|film)\b/i,
    /\b(plot|story|summary|synopsis)\s+(of)\b/i,
    /\bwhat\s+happens\s+in\b/i,
    /\bexplain\s+(the\s+)?movie\b/i,
    /\bcan\s+you\s+tell\s+me\s+about\b/i,
    /\bi\s+want\s+to\s+know\s+about\b/i,
    /\bbrief\s+(about|of)\b/i,
    /\bquick\s+info\s+on\b/i,
    /\bany\s+info\s+on\b/i,
  ];

  for (const pat of DETAIL_PATTERNS) {
    if (pat.test(query)) return "movie_detail";
  }

  // =========================
  // ⭐ RATING / QUALITY (treated as movie_detail)
  // =========================
  const RATING_PATTERNS = [
    /\brating\s+of\b/i,
    /\bimdb\s+rating\s+of\b/i,
    /\bhow\s+good\s+is\b/i,
    /\bis\s+.+\s+worth\s+watching\b/i,
  ];

  for (const pat of RATING_PATTERNS) {
    if (pat.test(query)) return "movie_detail";
  }

  // =========================
  // 🎭 CAST / ACTOR INFO (movie_detail)
  // =========================
  const CAST_PATTERNS = [
    /\bwho\s+is\s+in\b/i,
    /\bcast\s+of\b/i,
    /\bwho\s+acted\s+in\b/i,
    /\bwho\s+stars\s+in\b/i,
  ];

  for (const pat of CAST_PATTERNS) {
    if (pat.test(query)) return "movie_detail";
  }

  // =========================
  // 📅 RELEASE INFO (movie_detail)
  // =========================
  const RELEASE_PATTERNS = [
    /\bwhen\s+was\b/i,
    /\brelease\s+date\s+of\b/i,
    /\bwhen\s+did\b.+\s+release\b/i,
  ];

  for (const pat of RELEASE_PATTERNS) {
    if (pat.test(query)) return "movie_detail";
  }

  // =========================
  // 🔁 MORE / AGAIN
  // =========================
  if (/\b(more|another|different|other|again|next|suggest\s+more)\b/i.test(query)) {
    return "more";
  }

  // =========================
  // 🧠 KEYWORD FALLBACK (VERY IMPORTANT)
  // =========================
  const detailKeywords = [
    "about", "story", "plot", "summary",
    "details", "info", "rating", "cast"
  ];

  if (detailKeywords.some(word => query.includes(word))) {
    return "movie_detail";
  }

  // =========================
  // 🛠 SUPPORT
  // =========================
  if (isSupport(query)) return "support";

  // =========================
  // 😊 MOOD
  // =========================
  if (detectMood(query)) return "mood";

  // =========================
  // 🧪 EDGE CASE: SHORT QUERIES
  // =========================
  if (query.split(" ").length <= 3) {
    // Likely "inception movie", "animal rating"
    return "movie_detail";
  }

  return "free_text";
}


// ── 13. ACTOR NAME EXTRACTOR ─────────────────────────────────
// Returns best-guess actor name string or null
function extractActorName(input) {
  const cleaned = input.replace(/[^\w\s\-\.]/g, " ").trim();

  // Pattern: "movies of X" / "films of X" / "show me X movies"
  const patterns = [
    /(?:movies?|films?)\s+(?:of|by|with|starring|featuring)\s+(.+)/i,
    /(.+?)\s+(?:movies?|films?|filmography)/i,
    /show\s+(?:me\s+)?(.+?)\s+(?:movies?|films?)/i,
    /(?:has|have|did)\s+(.+?)\s+(?:done|made|starred|been\s+in|appeared)/i,
  ];

  for (const pat of patterns) {
    const m = cleaned.match(pat);
    if (m) {
      // Remove trailing/leading filler words
      const candidate = m[1]
        .replace(/\b(the|a|an|any|some|good|great|best|all)\b/gi, "")
        .trim();
      if (candidate.length > 1) return candidate.toLowerCase();
    }
  }
  return null;
}


// ── 14. MOVIE TITLE EXTRACTOR ────────────────────────────────
// Returns best-guess movie title string or null
function extractMovieTitle(input) {
  const cleaned = input.replace(/[^\w\s\-\.]/g, " ").trim();

  const patterns = [
    /(?:tell\s+me\s+about|about|info\s+on|details?\s+(?:of|about|on)|describe)\s+(.+)/i,
    /(?:what\s+is|what'?s)\s+(.+?)\s+(?:about|movie|film)/i,
    /(.+?)\s+(?:movie|film)\s+(?:info|detail|cast|review)/i,
  ];

  for (const pat of patterns) {
    const m = cleaned.match(pat);
    if (m) {
      const candidate = m[1]
        .replace(/\b(the movie|a film|the film|movie|film)\b/gi, "")
        .trim();
      if (candidate.length > 1) return candidate.toLowerCase();
    }
  }

  // Fallback: strip intent words and take remainder
  const stripped = cleaned
    .replace(/\b(tell me about|what is|about|info on|details? of|details? about|describe|what)\b/gi, "")
    .trim();
  if (stripped.length > 1) return stripped.toLowerCase();

  return null;
}


// ── 15. FUZZY TITLE MATCHER ───────────────────────────────────
// Levenshtein distance for typo-tolerance
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Returns a movie object or null. Tries exact → substring → fuzzy match.
function fuzzyFindMovie(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // 1. Exact match in index
  if (sphereData.movieIndex[q]) return sphereData.movieIndex[q];

  // 2. Substring match (query is contained in a title)
  for (const [key, movie] of Object.entries(sphereData.movieIndex)) {
    if (key.includes(q) || q.includes(key)) return movie;
  }

  // 3. Word-overlap match (≥50% of query words match)
  const queryWords = q.split(/\s+/).filter(w => w.length > 2);
  let bestOverlap = 0, bestMovie = null;
  for (const [key, movie] of Object.entries(sphereData.movieIndex)) {
    const keyWords = key.split(/\s+/);
    const overlap = queryWords.filter(w => keyWords.includes(w)).length;
    const score = overlap / Math.max(queryWords.length, 1);
    if (score > bestOverlap && score >= 0.5) {
      bestOverlap = score;
      bestMovie = movie;
    }
  }
  if (bestMovie) return bestMovie;

  // 4. Levenshtein fuzzy match (threshold: distance ≤ 4)
  let minDist = Infinity, fuzzyMovie = null;
  for (const [key, movie] of Object.entries(sphereData.movieIndex)) {
    const dist = levenshtein(q, key);
    if (dist < minDist && dist <= 4) {
      minDist = dist;
      fuzzyMovie = movie;
    }
  }
  return fuzzyMovie;
}


// ── 16. ACTOR LOOKUP ─────────────────────────────────────────
// 4-stage matching: exact → substring → collapsed (no-space) → fuzzy Levenshtein
function getMoviesByActor(actorQuery) {
  if (!actorQuery) return [];

  const q         = actorQuery.toLowerCase().trim();
  const qNoSpace  = q.replace(/\s+/g, "");          // "brad pitt" → "bradpitt"
  const qWords    = q.split(/\s+/).filter(Boolean);  // ["brad","pitt"]

  const results = [];
  const seen    = new Set();

  // Score each actor key and keep matches above threshold
  const scored = [];

  for (const [actorKey, movies] of Object.entries(sphereData.actorIndex)) {
    const keyNoSpace = actorKey.replace(/\s+/g, "");
    const keyWords   = actorKey.split(/\s+/).filter(Boolean);
    let matchScore   = 0;

    // Stage 1 — Exact match
    if (actorKey === q) {
      matchScore = 100;
    }
    // Stage 2 — Substring (partial first/last name): "ranbir" hits "ranbir kapoor"
    else if (actorKey.includes(q) || q.includes(actorKey)) {
      matchScore = 90;
    }
    // Stage 3 — Collapsed comparison: "braddpitt" ≈ "bradpitt" ≈ "brad pitt"
    else if (keyNoSpace.includes(qNoSpace) || qNoSpace.includes(keyNoSpace)) {
      matchScore = 85;
    }
    // Stage 4a — Token overlap: any query word matches any key word
    else if (qWords.some(w => keyWords.some(k => k.includes(w) || w.includes(k)))) {
      matchScore = 75;
    }
    // Stage 4b — Levenshtein on collapsed strings (typo tolerance ≤ 3)
    else {
      const dist = levenshtein(qNoSpace, keyNoSpace);
      // Scale threshold by name length so short names aren't over-matched
      const threshold = Math.max(2, Math.floor(keyNoSpace.length * 0.3));
      if (dist <= threshold) {
        matchScore = Math.max(10, 70 - dist * 10);
      }
    }

    if (matchScore > 0) {
      scored.push({ actorKey, movies, matchScore });
    }
  }

  // Sort by best match score, deduplicate movies
  scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .forEach(({ movies }) => {
      movies.forEach(m => {
        if (!seen.has(m.title)) {
          seen.add(m.title);
          results.push(m);
        }
      });
    });

  return results;
}


// ── 17. MOVIE DETAIL RETRIEVAL ───────────────────────────────
// Returns enriched movie object or null. ONLY uses platform data, never guesses.
function getMovieDetails(titleQuery) {
  return fuzzyFindMovie(titleQuery);
}


// ══════════════════════════════════════════════════════════════
//  CHAT UI COMPONENTS
// ══════════════════════════════════════════════════════════════

// ── 18. CORE UI HELPERS ──────────────────────────────────────
function toggleSphereChat() {
  sphereData.isOpen = !sphereData.isOpen;
  chatWindow.classList.toggle("active");
  document.getElementById("sphereOverlay")?.classList.toggle("active");
  const welcomeText = document.getElementById("sphereWelcome");
  if (welcomeText) welcomeText.style.display = "none";
  if (sphereData.isOpen && chatBody.children.length === 0) startConversation();
}

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
  div.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  document.getElementById("typingIndicator")?.remove();
}

function addChips(options) {
  const wrap = document.createElement("div");
  wrap.className = "chips-row";
  wrap.id = "quickChips";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "sphere-chip";
    btn.innerText = opt;
    btn.onclick = () => {
      document.getElementById("quickChips")?.remove();
      chatInput.value = opt;
      handleUserMessage();
    };
    wrap.appendChild(btn);
  });
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}


// ── 19. MOVIE CARD RENDERER ──────────────────────────────────
function renderMovieCard(movie) {
  return `
    <a href="${movie.link}" style="text-decoration:none;">
      <div class="chat-movie-card" style="position:relative;">
        <img src="${movie.img}" style="width:50px;height:70px;object-fit:cover;border-radius:4px;flex-shrink:0;">
        <div class="chat-movie-info" style="flex:1;min-width:0;">
          <h5 style="margin:0 0 3px;color:#fff;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${movie.title}
          </h5>
          <p style="margin:0 0 4px;color:#74b9ff;font-size:0.7rem;">${movie.genres.slice(0,2).join(" · ")}</p>
          <p style="margin:0;color:#2ed573;font-size:0.7rem;font-weight:600;">▶ Watch Now</p>
        </div>
        ${movie.isNew ? `<span style="position:absolute;top:6px;right:6px;background:#e17055;color:#fff;font-size:0.6rem;font-weight:700;padding:2px 6px;border-radius:3px;">NEW</span>` : ""}
      </div>
    </a>
  `;
}


// ── 20. MOVIE DETAIL PANEL RENDERER (async — fetches live IMDb rating) ──
async function renderMovieDetailPanel(movie) {
  const castList  = movie.cast.length > 0
    ? movie.cast.slice(0, 4).join(", ")
    : "Details not available currently";

  const descText  = movie.description?.length > 0
    ? movie.description
    : "Details not available currently";

  const genreText = movie.genres.length > 0
    ? movie.genres.join(" · ")
    : "Details not available currently";

  // Fetch IMDb rating from OMDb — non-blocking, cached, fail-safe
  const imdbData = await fetchImdbRating(movie.title);

  const ratingBadge = imdbData
    ? `<div class="sdp-imdb-badge">
         <span class="sdp-imdb-star">⭐</span>
         <span class="sdp-imdb-score">${imdbData.rating}</span>
         <span class="sdp-imdb-label">/10 · IMDb</span>
         ${imdbData.votes ? `<span class="sdp-imdb-votes">(${imdbData.votes} votes)</span>` : ""}
       </div>`
    : `<div class="sdp-imdb-badge sdp-imdb-badge--na">
         <span class="sdp-imdb-star">⭐</span>
         <span class="sdp-imdb-na">IMDb rating not available currently</span>
       </div>`;

  return `
    <div class="sphere-detail-panel">
      <div class="sdp-hero">
        <img src="${movie.img}" class="sdp-poster" alt="${movie.title}">
        <div class="sdp-meta">
          <h4 class="sdp-title">${movie.title}</h4>
          <div class="sdp-badges">
            ${movie.isNew ? '<span class="sdp-badge sdp-badge--new">NEW</span>' : ''}
            ${movie.year ? `<span class="sdp-badge sdp-badge--year">${movie.year}</span>` : ''}
          </div>
          <p class="sdp-genres">${genreText}</p>
          ${ratingBadge}
          <div class="sdp-row">
            <span class="sdp-label">Cast</span>
            <span class="sdp-value">${castList}</span>
          </div>
        </div>
      </div>
      <p class="sdp-desc">${descText}</p>
      <a href="${movie.link}" class="sdp-watch-btn">▶ Watch Now on StreamSphere</a>
    </div>
  `;
}


// ── 21. ACTOR RESULTS RENDERER ───────────────────────────────
function renderActorResults(actorName, movies) {
  if (movies.length === 0) {
    return `<div class="sphere-empty-state">
      <span style="font-size:1.5rem">🎭</span>
      <p>No movies found for <strong>${actorName}</strong> on StreamSphere right now.</p>
      <p style="font-size:0.72rem;opacity:0.6;margin-top:4px;">Try a different actor or mood!</p>
    </div>`;
  }

  const cards = movies
    .slice(0, 6) // cap at 6 to avoid overwhelming the chat
    .map(m => renderMovieCard(m))
    .join("");

  return `
    <div class="sdp-actor-header">
      <span class="sdp-actor-icon">🎬</span>
      <span>Found <strong>${movies.length}</strong> movie${movies.length > 1 ? "s" : ""} featuring <strong style="color:#74b9ff;">${actorName}</strong> on StreamSphere</span>
    </div>
    ${cards}
  `;
}


// ══════════════════════════════════════════════════════════════
//  CONVERSATION FLOW
// ══════════════════════════════════════════════════════════════

// ── 22. START ────────────────────────────────────────────────
function startConversation() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Hey" : "Good evening";
  const watchedCount = getWatchedTitles().size;

  showTyping();
  setTimeout(() => {
    removeTyping();
    addMessage(`${greeting}, ${sphereData.userName}! I'm SphereBot 🤖 — your personal streaming co-pilot.`, "bot");
  }, 500);

  setTimeout(() => {
    showTyping();
    setTimeout(() => {
      removeTyping();
      if (watchedCount > 0) {
        addMessage(`I can see you've watched ${watchedCount} title${watchedCount > 1 ? "s" : ""} already — I won't recommend those again. 🧠`, "bot");
      }
    }, 800);
  }, 1200);

  setTimeout(() => {
    showTyping();
    setTimeout(() => {
      removeTyping();
      addMessage("Tell me — how are you feeling, search by actor, or ask about a specific movie!", "bot");
      addChips([
        "😢 Sad", "😄 Happy", "😴 Bored", "👻 Horror mood",
        "🔥 Angry/Hype", "💕 Romantic", "🧠 Intellectual",
        "🎌 Anime", "🇮🇳 Indian films", "🇰🇷 K-Cinema",
        "🎭 Movies of Tom Hardy", "ℹ️ Tell me about Interstellar"
      ]);
    }, 1000);
  }, 2500);
}


// ── 23. INPUT HANDLER ────────────────────────────────────────
function handleUserMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  document.getElementById("quickChips")?.remove();
  addMessage(text, "user");
  chatInput.value = "";
  showTyping();
  setTimeout(() => {
    removeTyping();
    processInput(text.toLowerCase());
  }, 1200);
}

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleUserMessage();
});


// ── 24. MASTER INPUT PROCESSOR ───────────────────────────────
function processInput(rawInput) {
  // Strip emoji noise for analysis (keep original for display)
  const input = rawInput.replace(/[^\w\s\-\.]/g, " ").trim();

  // ── Route via intent detection ──────────────────────────────
  const intent = detectIntent(input);

  // ── SUPPORT ──
  if (intent === "support") {
    addMessage("That sounds like an account question — a bit outside my movie brain! 🤖", "bot");
    setTimeout(() => {
      addMessage("Let me get you to our support team...", "bot");
      setTimeout(() => { window.location.href = "/contactus"; }, 2000);
    }, 800);
    return;
  }

  // ── FOLLOW-UP ──
  if (sphereData.awaitingFollowUp && sphereData.lastMoodKeywords.length > 0) {
    sphereData.awaitingFollowUp = false;
    const refined = resolveFollowUp(input, sphereData.lastMoodKeywords);
    deliverRecommendations(refined);
    return;
  }

  // ── MORE ──
  if (intent === "more") {
    if (sphereData.lastMoodKeywords.length > 0) {
      addMessage("Finding you something fresh you haven't seen yet... 🔄", "bot");
      deliverRecommendations(sphereData.lastMoodKeywords);
    } else {
      addMessage("Give me a mood first and I'll keep the picks coming! 😄", "bot");
    }
    return;
  }

  // ── ACTOR SEARCH (v3.0) ──
  if (intent === "actor_search") {
    handleActorSearch(input);
    return;
  }

  // ── MOVIE DETAIL (v3.0) ──
  if (intent === "movie_detail") {
    handleMovieDetail(input);
    return;
  }

  // ── MOOD ──
  if (intent === "mood") {
    const mood = detectMood(input);
    sphereData.lastMoodKeywords = mood.keywords;
    addMessage(mood.reply, "bot");
    if (mood.followUp) {
      setTimeout(() => {
        addMessage(mood.followUp, "bot");
        sphereData.awaitingFollowUp = true;
        const opts = mood.followUp.includes("cry")
          ? ["cry it out", "lift my mood"]
          : ["make me think", "just vibe"];
        addChips(opts);
      }, 800);
    } else {
      setTimeout(() => deliverRecommendations(mood.keywords), 400);
    }
    return;
  }

  // ── FREE TEXT: try actor → movie → keyword search ──
  // Try actor first
  const actorCandidate = extractActorName(input) || input;
  const actorResults = getMoviesByActor(actorCandidate);
  if (actorResults.length > 0) {
    handleActorSearch(input);
    return;
  }

  // Try movie detail
  const movieCandidate = fuzzyFindMovie(input);
  if (movieCandidate) {
    addMessage(`Found it! Here are the details for "${movieCandidate.title}" 🎬`, "bot");
    // renderMovieDetailPanel is async — must await inside an async wrapper
    setTimeout(async () => {
      const panel = await renderMovieDetailPanel(movieCandidate);
      addMessage(panel, "bot", true);
      setTimeout(() => addChips(["More like this", "Different mood", "Horror", "Anime"]), 600);
    }, 300);
    return; // ← CRITICAL: stops fallback keyword search from also firing
  }

  // Fall back to keyword recommendation
  sphereData.lastMoodKeywords = [input];
  addMessage(`Searching for "${input}" across the library... 🔍`, "bot");
  setTimeout(() => deliverRecommendations([input]), 400);
}


// ── 25. ACTOR SEARCH HANDLER ─────────────────────────────────
function handleActorSearch(input) {
  const actorName = extractActorName(input);

  if (!actorName) {
    addMessage("I couldn't figure out which actor you mean — try something like: \"Movies of Tom Hardy\"", "bot");
    return;
  }

  const results = getMoviesByActor(actorName);

  if (results.length === 0) {
    addMessage(`No movies found for "${actorName}" on StreamSphere right now. 🎭`, "bot");
    addMessage("They might not be in our current library. Try a different actor or a mood!", "bot");
    addChips(["Sad", "Action", "Anime", "Korean"]);
    return;
  }

  // Resolve canonical display name from the actorIndex key so that
  // typos like "braddpitt" render as the correct "Brad Pitt".
  const resolvedKey = resolveActorKey(actorName);
  const displayName = (resolvedKey || actorName)
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  addMessage(renderActorResults(displayName, results), "bot", true);

  setTimeout(() => {
    addMessage("Want to explore more? Tell me a mood or ask about another actor 🎬", "bot");
    addChips(["More like these", "Different mood", "Horror", "Anime", "Korean"]);
  }, results.length * 200 + 600);
}

// Returns the best-matching actorIndex key for a query (for clean display names)
function resolveActorKey(actorQuery) {
  const q        = actorQuery.toLowerCase().trim();
  const qNoSpace = q.replace(/\s+/g, "");
  const qWords   = q.split(/\s+/).filter(Boolean);

  let bestKey   = null;
  let bestScore = 0;

  for (const actorKey of Object.keys(sphereData.actorIndex)) {
    const keyNoSpace = actorKey.replace(/\s+/g, "");
    const keyWords   = actorKey.split(/\s+/).filter(Boolean);
    let score        = 0;

    if (actorKey === q)                                                              score = 100;
    else if (actorKey.includes(q) || q.includes(actorKey))                          score = 90;
    else if (keyNoSpace.includes(qNoSpace) || qNoSpace.includes(keyNoSpace))         score = 85;
    else if (qWords.some(w => keyWords.some(k => k.includes(w) || w.includes(k))))  score = 75;
    else {
      const dist = levenshtein(qNoSpace, keyNoSpace);
      const threshold = Math.max(2, Math.floor(keyNoSpace.length * 0.3));
      if (dist <= threshold) score = Math.max(10, 70 - dist * 10);
    }

    if (score > bestScore) { bestScore = score; bestKey = actorKey; }
  }

  return bestKey;
}


// ── 26. MOVIE DETAIL HANDLER ─────────────────────────────────
function handleMovieDetail(input) {
  const titleQuery = extractMovieTitle(input);

  if (!titleQuery) {
    addMessage("Could you be more specific? Try: \"Tell me about Interstellar\"", "bot");
    return;
  }

  const movie = getMovieDetails(titleQuery);

  if (!movie) {
    addMessage(`"${titleQuery}" doesn't appear to be on StreamSphere right now. 🎬`, "bot");
    addMessage("Try asking about a different title, or tell me your mood for recommendations!", "bot");
    addChips(["😢 Sad", "🔥 Action", "🎌 Anime", "Something new 2025"]);
    return;
  }

  addMessage(`Here's everything we have on <strong>${movie.title}</strong> from our library:`, "bot", true);
  setTimeout(async () => {
    const panel = await renderMovieDetailPanel(movie);
    addMessage(panel, "bot", true);
    setTimeout(() => {
      addMessage("Want more like this? Just say the word 😊", "bot");
      addChips(["More like this", "Different mood", "Horror", "Anime", "Korean"]);
    }, 600);
  }, 300);
}


// ── 27. RECOMMENDATION DELIVERY ──────────────────────────────
function deliverRecommendations(keywords) {
  const scored = scoreMovies(sphereData.movies, keywords);
  const recs   = pickDiverseRecs(scored, 3);

  if (recs.length === 0) {
    addMessage("You've seen everything that matches! Impressive taste. 🎬 Try a different mood?", "bot");
    addChips(["😢 Sad", "🔥 Action", "🎌 Anime", "🇰🇷 Korean"]);
    return;
  }

  addMessage(`Here are ${recs.length} picks curated just for you — none of these are in your watch history:`, "bot");

  recs.forEach((movie, i) => {
    setTimeout(() => addMessage(renderMovieCard(movie), "bot", true), i * 300);
  });

  setTimeout(() => {
    addMessage("Want more? Just say \"more\" or tell me a different mood 😊", "bot");
    addChips(["More like these", "Different mood", "Something new 2025", "Horror", "Anime"]);
  }, recs.length * 300 + 600);
}


// ══════════════════════════════════════════════════════════════
//  V3.0 CSS INJECTION
//  Injects required styles for detail panel & actor results.
//  Keeps chat.css clean; styles are scoped to sphere components.
// ══════════════════════════════════════════════════════════════
(function injectSphereBotV3Styles() {
  if (document.getElementById("spherebot-v3-styles")) return;
  const style = document.createElement("style");
  style.id = "spherebot-v3-styles";
  style.textContent = `
    /* ── Movie Detail Panel ─────────────────────────── */
    .sphere-detail-panel {
      background: linear-gradient(135deg, rgba(9,132,227,0.08) 0%, rgba(116,185,255,0.05) 100%);
      border: 1px solid rgba(116,185,255,0.2);
      border-radius: 12px;
      padding: 12px;
      margin: 4px 0;
      font-size: 0.78rem;
      color: #dfe6e9;
    }
    .sdp-hero {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }
    .sdp-poster {
      width: 64px;
      height: 90px;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .sdp-meta {
      flex: 1;
      min-width: 0;
    }
    .sdp-title {
      margin: 0 0 5px;
      color: #fff;
      font-size: 0.88rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .sdp-badges {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-bottom: 5px;
    }
    .sdp-badge {
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .sdp-badge--new  { background: #e17055; color: #fff; }
    .sdp-badge--year { background: rgba(116,185,255,0.2); color: #74b9ff; border: 1px solid rgba(116,185,255,0.35); }
    .sdp-genres {
      color: #74b9ff;
      font-size: 0.7rem;
      margin: 0 0 6px;
    }
    .sdp-row {
      display: flex;
      gap: 6px;
      align-items: flex-start;
      margin-bottom: 3px;
    }
    .sdp-label {
      color: #b2bec3;
      font-size: 0.68rem;
      font-weight: 600;
      min-width: 32px;
      padding-top: 1px;
    }
    .sdp-value {
      color: #dfe6e9;
      font-size: 0.7rem;
      line-height: 1.4;
    }
    .sdp-desc {
      font-size: 0.72rem;
      line-height: 1.5;
      color: #b2bec3;
      margin: 0 0 10px;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .sdp-watch-btn {
      display: block;
      background: linear-gradient(90deg, #0984e3, #74b9ff);
      color: #fff;
      text-align: center;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.74rem;
      font-weight: 700;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .sdp-watch-btn:hover { opacity: 0.85; }

    /* ── IMDb Rating Badge ──────────────────────────── */
    .sdp-imdb-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(245,197,24,0.1);
      border: 1px solid rgba(245,197,24,0.3);
      border-radius: 6px;
      padding: 4px 9px;
      margin-bottom: 6px;
      width: fit-content;
    }
    .sdp-imdb-star   { font-size: 0.78rem; }
    .sdp-imdb-score  { color: #f5c518; font-weight: 800; font-size: 0.92rem; letter-spacing: 0.01em; }
    .sdp-imdb-label  { color: #b2bec3; font-size: 0.67rem; }
    .sdp-imdb-votes  { color: #636e72; font-size: 0.63rem; margin-left: 2px; }
    .sdp-imdb-badge--na { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.07); }
    .sdp-imdb-na     { color: #636e72; font-size: 0.68rem; font-style: italic; }

    /* ── Actor Results Header ───────────────────────── */
    .sdp-actor-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(116,185,255,0.07);
      border: 1px solid rgba(116,185,255,0.18);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.75rem;
      color: #dfe6e9;
      margin-bottom: 6px;
    }
    .sdp-actor-icon { font-size: 1.1rem; }

    /* ── Empty State ────────────────────────────────── */
    .sphere-empty-state {
      text-align: center;
      padding: 16px 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      border: 1px dashed rgba(255,255,255,0.1);
      font-size: 0.75rem;
      color: #b2bec3;
    }
    .sphere-empty-state strong { color: #fff; }
  `;
  document.head.appendChild(style);
})();
