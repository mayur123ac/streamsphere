// ==========================================
// 1. GLOBAL SERIES DATA
// ==========================================
const seriesData = {
  "squid-game": {
    title: "Squid Game",
    year: "2021",
    desc: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
    image: "https://images.ctfassets.net/4cd45et68cgf/3BJQrujAXLeXXsWXnolmvB/28845a87ecb25a0609c2e9faec57736c/EN_SQdGame_Main_PlayGround_Horizontal_RGB_PRE.jpg?w=1200",
    episodes: {
      1: [
        { num: 1, title: "Red Light, Green Light", time: "60m", img: "https://images.tstatic.net/img/q/2021/10/05/squid-game-red-light-green-light.jpg" },
        { num: 2, title: "Hell", time: "63m", img: "https://hips.hearstapps.com/hmg-prod/images/squid-game-hell-1633633276.jpg" },
        { num: 3, title: "The Man with the Umbrella", time: "54m", img: "https://static1.colliderimages.com/wordpress/wp-content/uploads/2021/10/Squid-Game-Episode-3-The-Man-with-the-Umbrella-Recap.jpg" },
      ],
      2: [
        { num: 1, title: "The Front Man Returns", time: "55m", img: "https://via.placeholder.com/120x70?text=S2+Ep1" },
        { num: 2, title: "New Games", time: "58m", img: "https://via.placeholder.com/120x70?text=S2+Ep2" },
      ],
    },
  },
  "stranger-things": {
    title: "Stranger Things",
    year: "2016",
    desc: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    image: "https://dnm.nflximg.net/api/v6/BvVbc2Wxr2w6QuoANoSpJKEIWjQ/AAAAQRqH7ogwUemf3k4qrfGLG385vAIzZk2FIvl1YMbSj71WovqswVXXEzgBPA2iKen3KFZbbYOVyvcKl4LD5yin_6kdDuiuMAP6x3aKNYmholsJo1bwjT_Fe32kMzfV7IDYWv2p8CxlAd7mF4lXNylqXgc9sQM.jpg?r=e2c",
    episodes: {
      1: [
        { num: 1, title: "Chapter One: The Vanishing of Will Byers", time: "48m", img: "https://image.tmdb.org/t/p/w300/AdwF2jXvhdODr6gUZ61bHKRkz09.jpg", link: "https://player.videasy.net/tv/66732/1/1" },
        { num: 2, title: "Chapter Two: The Weirdo on Maple Street", time: "55m", img: "https://image.tmdb.org/t/p/w300/8iA56ugQyHZmX81wSsNqwXjCE6F.jpg", link: "https://player.videasy.net/tv/66732/1/2" },
        { num: 3, title: "Chapter Three: Holly, Jolly", time: "52m", img: "https://image.tmdb.org/t/p/w300/5snULpWQWp7aqFto7UbRcEkEyyS.jpg", link: "https://player.videasy.net/tv/66732/1/3" },
        { num: 4, title: "Chapter Four: The Body", time: "51m", img: "https://image.tmdb.org/t/p/w300/60wmC1e20HV8gu688GAhsWxqxPx.jpg", link: "https://player.videasy.net/tv/66732/1/4" },
        { num: 5, title: "Chapter Five: The Flea and the Acrobat", time: "53m", img: "https://image.tmdb.org/t/p/w300/exT4NW9EdXG1qLZHKJnRpq3gh1H.jpg", link: "https://player.videasy.net/tv/66732/1/5" },
        { num: 6, title: "Chapter Six: The Monster", time: "47m", img: "https://image.tmdb.org/t/p/w300/lNS6qycyucewz3duTr1tf1LU688.jpg", link: "https://player.videasy.net/tv/66732/1/6" },
        { num: 7, title: "Chapter Seven: The Bathtub", time: "42m", img: "https://image.tmdb.org/t/p/w300/mkZzUTNWYfGwRH2f1TzlRgouypa.jpg", link: "https://player.videasy.net/tv/66732/1/7" },
        { num: 8, title: "Chapter Eight: The Upside Down", time: "55m", img: "https://image.tmdb.org/t/p/w300/1teJ5dbuepfqOOs9uYhYTUjr2qs.jpg", link: "https://player.videasy.net/tv/66732/1/8" },
      ],
      2: [
        { num: 1, title: "Chapter One: MADMAX", time: "48m", img: "https://image.tmdb.org/t/p/w300/efz0MgPAxPw11PIeAJNgKKg3Paa.jpg", link: "https://player.videasy.net/tv/66732/2/1" },
        { num: 2, title: "Chapter Two: Trick or Treat, Freak", time: "56m", img: "https://image.tmdb.org/t/p/w300/oGMZxF4yivOSCGZTMgiDD2Ye2Hi.jpg", link: "https://player.videasy.net/tv/66732/2/2" },
        { num: 3, title: "Chapter Three: The Pollywog", time: "51m", img: "https://image.tmdb.org/t/p/w300/792NQjFydcr5ucb1sga55LS6Vt3.jpg", link: "https://player.videasy.net/tv/66732/2/3" },
        { num: 4, title: "Chapter Four: Will the Wise", time: "46m", img: "https://image.tmdb.org/t/p/w300/wZ7ZDnftX9Y1O25I5tOaEKdK7FT.jpg", link: "https://player.videasy.net/tv/66732/2/4" },
        { num: 5, title: "Chapter Five: Dig Dug", time: "58m", img: "https://image.tmdb.org/t/p/w300/westZSpDwRPjxG2eBWIT7utDcnL.jpg", link: "https://player.videasy.net/tv/66732/2/5" },
        { num: 6, title: "Chapter Six: The Spy", time: "51m", img: "https://image.tmdb.org/t/p/w300/d90nCiTEACFEUd3fcX8DrLBi5DL.jpg", link: "https://player.videasy.net/tv/66732/2/6" },
        { num: 7, title: "Chapter Seven: The Lost Sister", time: "45m", img: "https://image.tmdb.org/t/p/w300/kgOaaTbAutwAoA7tkVzYCfTjPXn.jpg", link: "https://player.videasy.net/tv/66732/2/7" },
        { num: 8, title: "Chapter Eight: The Mind Flayer", time: "47m", img: "https://image.tmdb.org/t/p/w300/k3cEwGAWSWbkauYBHSdFnEdalkb.jpg", link: "https://player.videasy.net/tv/66732/2/8" },
        { num: 9, title: "Chapter Nine: The Gate", time: "1h 2m", img: "https://image.tmdb.org/t/p/w300/wqwAsocYrxl7MtHiY8ZAsIxrX5v.jpg", link: "https://player.videasy.net/tv/66732/2/9" },
      ],
      3: [
        { num: 1, title: "Chapter One: Suzie, Do You Copy?", time: "50m", img: "https://image.tmdb.org/t/p/w300/97PVnrEQWEsdMnD08QDmMxLkV7h.jpg", link: "https://player.videasy.net/tv/66732/3/1" },
        { num: 2, title: "Chapter Two: The Mall Rats", time: "50m", img: "https://image.tmdb.org/t/p/w300/qDlMvdlRGzIGtKYdV9lktEUM4vj.jpg", link: "https://player.videasy.net/tv/66732/3/2" },
        { num: 3, title: "Chapter Three: The Case of the Missing Lifeguard", time: "49m", img: "https://image.tmdb.org/t/p/w300/oaYdVvYwnvoQ7SLelKUcaAt0HKJ.jpg", link: "https://player.videasy.net/tv/66732/3/3" },
        { num: 4, title: "Chapter Four: The Sauna Test", time: "53m", img: "https://image.tmdb.org/t/p/w300/uaI96Adk9Qgl3Yw90CYSjlrVuVq.jpg", link: "https://player.videasy.net/tv/66732/3/4" },
        { num: 5, title: "Chapter Five: The Flayed", time: "52m", img: "https://image.tmdb.org/t/p/w300/40CezQOYMQ1t726K3hqdz7Y1Z6G.jpg", link: "https://player.videasy.net/tv/66732/3/5" },
        { num: 6, title: "Chapter Six: E Pluribus Unum", time: "1h", img: "https://image.tmdb.org/t/p/w300/m4Vb4VjidjS762PdimcZJf7cyxW.jpg", link: "https://player.videasy.net/tv/66732/3/6" },
        { num: 7, title: "Chapter Seven: The Bite", time: "55m", img: "https://image.tmdb.org/t/p/w300/6QA91GJK2ze1EaGPEKhil9MJIXx.jpg", link: "https://player.videasy.net/tv/66732/3/7" },
        { num: 8, title: "Chapter Eight: The Battle of Starcourt", time: "1h 17m", img: "https://image.tmdb.org/t/p/w300/5YcjTWas07RteM9lssOzL9UhmJh.jpg", link: "https://player.videasy.net/tv/66732/3/8" },
      ],
      4: [
        { num: 1, title: "Chapter One: The Hellfire Club", time: "1h 18m", img: "https://image.tmdb.org/t/p/w300/xeNKubDmPiMraW4hXqzEBrN6f4A.jpg", link: "https://player.videasy.net/tv/66732/4/1" },
        { num: 2, title: "Chapter Two: Vecna's Curse", time: "1h 17m", img: "https://image.tmdb.org/t/p/w300/f7TDfu49srrDclKfd9UjQSDhcWA.jpg", link: "https://player.videasy.net/tv/66732/4/2" },
        { num: 3, title: "Chapter Three: The Monster and the Superhero", time: "1h 3m", img: "https://image.tmdb.org/t/p/w300/iSvNiCJ0XIEUyj6kydm1wISZHeM.jpg", link: "https://player.videasy.net/tv/66732/4/3" },
        { num: 4, title: "Chapter Four: Dear Billy", time: "1h 19m", img: "https://image.tmdb.org/t/p/w300/u3LeFRR7AhyPp4y0Ii7hpkD488b.jpg", link: "https://player.videasy.net/tv/66732/4/4" },
        { num: 5, title: "Chapter Five: The Nina Project", time: "1h 16m", img: "https://image.tmdb.org/t/p/w300/yvXXeBv4zfDgwcZyxqH5LJAe4oV.jpg", link: "https://player.videasy.net/tv/66732/4/5" },
        { num: 6, title: "Chapter Six: The Dive", time: "1h 15m", img: "https://image.tmdb.org/t/p/w300/9EbhReDcbfmqLhDBg0Rn97z4lT.jpg", link: "https://player.videasy.net/tv/66732/4/6" },
        { num: 7, title: "Chapter Seven: The Massacre at Hawkins Lab", time: "1h 40m", img: "https://image.tmdb.org/t/p/w300/eoCFavs6fSSxKAhHf0VroO2HFRt.jpg", link: "https://player.videasy.net/tv/66732/4/7" },
        { num: 8, title: "Chapter Eight: Papa", time: "1h 27m", img: "https://image.tmdb.org/t/p/w300/sdNa4Z49RTZDkezFAMg00hciFZZ.jpg", link: "https://player.videasy.net/tv/66732/4/8" },
        { num: 9, title: "Chapter Nine: The Piggyback", time: "2h 22m", img: "https://image.tmdb.org/t/p/w300/fvoa0Hosu4yK7TUiHglV8TvjMUB.jpg", link: "https://player.videasy.net/tv/66732/4/9" },
      ],
      5: [
        { num: 1, title: "Chapter One: The Crawl", time: "1h 11m", img: "https://assets.rollingstonephilippines.com/wp-content/uploads/2025/11/stranger_h.webp", link: "https://player.videasy.net/tv/66732/5/1" },
        { num: 2, title: "Chapter Two: The Vanishing of [Redacted]", time: "TBA", img: "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3413,h_1919/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/ImageExchange/mmsport/385/01jfjqjd6f7a00gcerzp.jpg", link: "/Series/StrangerThingsS05EP2" },
        { num: 3, title: "Chapter Three: The Turnbow Trap", time: "TBA", img: "https://preview.redd.it/stranger-things-season-5-episode-3-the-turnbow-trap-review-v0-69an91wuv54g1.jpeg?width=640&crop=smart&auto=webp&s=602d3d684b7cefcb7414b4664272562eb08b8394", link: "/Series/StrangerThingsS05EP3" },
        { num: 4, title: "Chapter Four: Sorcerer", time: "TBA", img: "https://www.talktoluke.com/images/blog/will-byers-wounded-healer.webp", link: "/Series/StrangerThingsS05EP4" },
        { num: 5, title: "Chapter Five: Shock Jock", time: "TBA", img: "https://www.comicsbeat.com/wp-content/uploads/2025/12/Stranger-Things-5-Shock-Jock-Vecna-possessed.jpg", link: "https://player.videasy.net/tv/66732/5/5" },
        { num: 6, title: "Chapter Six: Escape from Camazotz", time: "TBA", img: "https://m.media-amazon.com/images/M/MV5BMzc3MzE3YjktZjQ1My00NjZhLTgwOTItYWRmNmRjMDI4ZDE1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", link: "https://player.videasy.net/tv/66732/5/6" },
        { num: 7, title: "Chapter Seven: The Bridge", time: "TBA", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7p7EjMF2CbdPgD-EBFr0LBnx8wTRO5FUeGQ&s", link: "https://player.videasy.net/tv/66732/5/7" },
        { num: 8, title: "Chapter Eight: The Rightside Up", time: "TBA", img: "https://m.media-amazon.com/images/M/MV5BNTc1ZWE3YTEtNTc2My00MzM4LTg0ZDYtZDA4ODA2NDE3ZDBiXkEyXkFqcGc@._V1_.jpg", link: "https://player.videasy.net/tv/66732/5/8" },
      ],
    },
  },
  "alice-borderland": {
    title: "Alice in Borderland",
    year: "2020",
    desc: "Obsessed gamer Arisu finds himself in a parallel Tokyo.",
    image: "https://m.media-amazon.com/images/M/MV5BMzlmNmRkOTEtOTYxOC00MTJjLTg1MTgtZGE0Yjk2YjM2ZjUyXkEyXkFqcGc@._V1_.jpg",
    episodes: {}
  },
  "all-of-us-dead": {
    title: "All of Us Are Dead",
    year: "2022",
    desc: "Trapped students must escape their high school which has become ground zero for a zombie virus outbreak.",
    image: "https://m.media-amazon.com/images/M/MV5BNTcyZjZjNjMtMzFhZC00ZDMyLTkyY2QtYzZlM2JjOGJhNzQyXkEyXkFqcGc@._V1_.jpg",
    episodes: {}
  },
  "last-of-us": {
    title: "The Last of Us",
    year: "2023",
    desc: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl.",
    image: "https://m.media-amazon.com/images/M/MV5BYWI3ODJlMzktY2U5NC00ZjdlLWE1MGItNWQxZDk3NWNjN2RhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    episodes: {}
  },
  "default": {
    title: "Series Title",
    year: "2024",
    desc: "Description not available.",
    image: "",
    episodes: {},
  },
};

// ==========================================
// 2. MODAL FUNCTIONS (Global)
// ==========================================

// Global variable to track state
let currentSeriesData = null;

// Function to Open Modal (Callable from HTML or JS)
function openSeriesModal(seriesId) {
  const modal = document.getElementById("seriesModal");
  const seasonSelect = document.getElementById("season-select");
  const epListContainer = document.getElementById("episodes-list");

  // Load Data
  currentSeriesData = seriesData[seriesId] || seriesData["default"];

  // Populate Basic Info
  if(document.getElementById("modal-title")) {
      document.getElementById("modal-title").innerText = currentSeriesData.title;
      document.getElementById("modal-year").innerText = currentSeriesData.year;
      document.getElementById("modal-desc").innerText = currentSeriesData.desc;
      document.getElementById("modal-hero-img").src = currentSeriesData.image;
  
      // Populate Season Dropdown
      const seasons = Object.keys(currentSeriesData.episodes);
      document.getElementById("modal-seasons").innerText = `${seasons.length} Season${seasons.length > 1 ? "s" : ""}`;
  
      seasonSelect.innerHTML = ""; // Clear old options
  
      if (seasons.length > 0) {
        seasons.forEach((seasonKey) => {
          const option = document.createElement("option");
          option.value = seasonKey;
          option.innerText = `Season ${seasonKey}`;
          seasonSelect.appendChild(option);
        });
        // Render Season 1 by default
        renderEpisodes(seasons[0]);
      } else {
        seasonSelect.innerHTML = "<option>No Seasons</option>";
        epListContainer.innerHTML = "<p style='padding:20px; color:#aaa;'>No episode details available.</p>";
      }
  
      // Show Modal
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
  }
}

// Function to Close Modal
function closeSeriesModal() {
  const modal = document.getElementById("seriesModal");
  if(modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
  }
}

// Function to Render Episode List
function renderEpisodes(seasonKey) {
  const epListContainer = document.getElementById("episodes-list");
  epListContainer.innerHTML = ""; // Clear current list

  const episodes = currentSeriesData.episodes[seasonKey] || [];

  if (episodes.length === 0) {
    epListContainer.innerHTML = "<p style='padding:20px; color:#aaa;'>No episodes available for this season.</p>";
    return;
  }

  episodes.forEach((ep) => {
    const episodeLink = ep.link ? ep.link : "#";
    const episodeDesc = ep.desc ? ep.desc : "Episode description unavailable.";

    const row = `
      <a href="${episodeLink}" class="episode-link" style="text-decoration: none; color: inherit; display: block;">
        <div class="episode-row">
          <span class="ep-num">${ep.num}</span>
          <img src="${ep.img}" class="ep-thumb" onerror="this.src='https://via.placeholder.com/120x70'">
          <div class="ep-info">
            <span class="ep-title">${ep.title}</span>
            <span class="ep-desc">${episodeDesc}</span>
          </div>
          <span class="ep-duration">${ep.time}</span>
          <span class="play-icon" style="margin-left: 15px; font-size: 1.2rem;"></span>
        </div>
      </a>
    `;
    epListContainer.insertAdjacentHTML("beforeend", row);
  });
}

// ==========================================
// 3. EVENT LISTENERS (For Static Pages)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Attach Season Change Listener
  const seasonSelect = document.getElementById("season-select");
  if(seasonSelect) {
      seasonSelect.addEventListener("change", (e) => {
        renderEpisodes(e.target.value);
      });
  }

  // Attach Close Button Listener
  const closeBtn = document.querySelector(".close-modal");
  if(closeBtn) {
      closeBtn.addEventListener("click", closeSeriesModal);
  }

  // Close on Outside Click
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("seriesModal");
    if (e.target == modal) {
      closeSeriesModal();
    }
  });

  // Auto-Attach logic for Homepage (Static Cards)
  document.querySelectorAll(".series-card").forEach((card) => {
    const img = card.querySelector("img");
    const infoBtn = card.querySelector(".open-modal-btn");

    function triggerModal(e) {
        e.stopPropagation();
        e.preventDefault();
        const seriesId = card.getAttribute("data-id");
        openSeriesModal(seriesId);
    }

    if (img) img.addEventListener("click", triggerModal);
    if (infoBtn) infoBtn.addEventListener("click", triggerModal);
  });
});