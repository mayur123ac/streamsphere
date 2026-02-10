const video = document.getElementById("heroVideo");
const btn = document.getElementById("unmuteBtn");
const btnimg = btn.querySelector("img");
const hero1 = document.querySelector(".hero");

let fadeInterval;
let userMuted = false; // ⭐ NEW — track manual mute

// 🔘 Manual button toggle
btn.addEventListener("click", () => {
  if (video.muted) {
    video.muted = false;
    video.volume = 1;
    btnimg.src = "/assets/mute.png";
    userMuted = false; // user wants sound
    video.play();
  } else {
    video.muted = true;
    btnimg.src = "/assets/unmute.png";
    userMuted = true; // user forced mute
  }
});

// 🎚️ Fade functions (ONLY if userMuted == false)
function fadeOutVolume(videoElement, duration = 1000) {
  if (userMuted) return; // ⭐ Don't fade if user muted manually

  clearInterval(fadeInterval);
  let volume = videoElement.volume;
  const step = volume / (duration / 20);

  fadeInterval = setInterval(() => {
    volume -= step;
    if (volume <= 0) {
      volume = 0;
      videoElement.volume = 0;
      videoElement.muted = true;
      clearInterval(fadeInterval);
    } else {
      videoElement.volume = volume;
    }
  }, 20);
}

function fadeInVolume(videoElement, duration = 1000) {
  if (userMuted) return; // ⭐ Don't fade if user muted manually

  clearInterval(fadeInterval);
  videoElement.muted = false;
  let volume = videoElement.volume;
  const step = (1 - volume) / (duration / 20);

  fadeInterval = setInterval(() => {
    volume += step;
    if (volume >= 1) {
      volume = 1;
      videoElement.volume = 1;
      clearInterval(fadeInterval);
    } else {
      videoElement.volume = volume;
    }
  }, 20);
}

// 📜 Scroll behavior
window.addEventListener("scroll", () => {
  const hero1Bottom = hero1.offsetTop + hero1.offsetHeight;
  const scrollY = window.scrollY;

  if (scrollY > hero1Bottom) {
    fadeOutVolume(video, 1000);
    if (!userMuted) btnimg.src = "/assets/mute.png";
  } else {
    fadeInVolume(video, 1000);
    if (!userMuted) btnimg.src = "/assets/unmute.png";
  }
});
