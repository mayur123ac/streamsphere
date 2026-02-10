 const slider = document.getElementById("trending-slider1");
    if (!slider) {
      console.error("No element with id 'trending-slider1' found.");
    } else {
      // Collect image elements from the slider (initial snapshot)
      const images = Array.from(slider.querySelectorAll("img"));
      if (images.length === 0) console.warn("No <img> inside #trending-slider1 found.");

      // Map to store click counts and map to remember original wrapper (<a>) nodes
      const clickCounts = new Map(images.map(img => [img, 0]));
      const wrappers = new Map(images.map(img => [img, img.closest("a") || null]));

      // Reorder function used after each click
      function reorderImages() {
        // Create sorted copy based on rules:
        // 1) Any image with >5 clicks should appear *before* those with <=5
        // 2) Within those groups, sort by click count descending
        const sorted = [...images].sort((a, b) => {
          const ca = clickCounts.get(a);
          const cb = clickCounts.get(b);

          // If one has >5 and the other doesn't, that one wins (goes first)
          const aHot = ca > 5;
          const bHot = cb > 5;
          if (aHot !== bHot) return aHot ? -1 : 1;

          // Otherwise sort by descending count
          return cb - ca;
        });

        // Clear slider then re-append nodes using the stored wrapper references
        slider.innerHTML = "";
        const appended = new Set(); // avoid appending the same wrapper twice (shouldn't happen, but safe)

        sorted.forEach(imgEl => {
          const wrapper = wrappers.get(imgEl);
          if (wrapper) {
            // wrapper is an actual DOM node reference; append it only once
            if (!appended.has(wrapper)) {
              slider.appendChild(wrapper);
              appended.add(wrapper);
            }
          } else {
            // no wrapper — append the image itself
            slider.appendChild(imgEl);
          }
        });
      }

      // Attach listeners once
      images.forEach(img => {
        img.addEventListener("click", (ev) => {
          // increment count
          clickCounts.set(img, clickCounts.get(img) + 1);

          // debug log
          console.log(`Image clicked: ${img.src} -> ${clickCounts.get(img)} clicks`);

          // reorder after update
          reorderImages();
        });
      });
    }