document.addEventListener("DOMContentLoaded", () => {
  const profileContainer = document.querySelector(".profile-container");

  // 1. Toggle the menu when clicking the profile icon
  profileContainer.addEventListener("click", (e) => {
    e.stopPropagation(); // Stop click from bubbling to document
    profileContainer.classList.toggle("active");
  });

  // 2. Close the menu if clicking anywhere else on the screen
  document.addEventListener("click", () => {
    if (profileContainer.classList.contains("active")) {
      profileContainer.classList.remove("active");
    }
  });
});
