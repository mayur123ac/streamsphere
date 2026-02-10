// Listen for the window 'load' event (waits for all images/videos)
window.addEventListener("load", function () {
  const loader = document.getElementById("page-loader");

  // Add the hidden class to trigger the CSS transition
  loader.classList.add("loader-hidden");

  // Optional: Remove the loader from the DOM entirely after the transition
  loader.addEventListener("transitionend", function () {
    document.body.removeChild(loader);
  });
});
