const slider = document.getElementById("seriesSlider");
const boxes = Array.from(slider.getElementsByClassName("series-box"));

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    let clicks = parseInt(box.dataset.clicks) + 1;
    box.dataset.clicks = clicks;

    // Sort by click count (descending)
    const sorted = boxes.sort((a, b) => b.dataset.clicks - a.dataset.clicks);

    // Reattach sorted boxes
    slider.innerHTML = "";
    sorted.forEach((box, index) => {
      box.querySelector(".rank").textContent = index + 1;
      slider.appendChild(box);
    });
  });
});



//scrollright

