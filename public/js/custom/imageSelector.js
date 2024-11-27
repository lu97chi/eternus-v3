document.addEventListener("DOMContentLoaded", () => {
 // Step 1: Define the pool of images
 const horizontalImages = [
  "hero-1.jpg",
  "hero-2.jpg",
  "hero-3.jpg",
  "hero-4.jpg",
  "hero-5.jpg",
  "hero-6.jpg",
  "hero-7.jpg",
  "hero-8.jpg",
  "hero-9.jpg",
  "hero-10.jpg",
  "hero-11.jpg",
  "hero-12.jpg",
  "hero-13.jpg",
  "hero-14.jpg",
  "hero-15.jpg",
  "hero-16.jpg",
  "hero-17.jpg",
  "hero-18.jpg",
  "hero-19.jpg",
  "hero-20.jpg",
  "hero-21.jpg",
  "hero-22.jpg",
  "hero-23.jpg",
  "hero-24.jpg",
  "hero-25.jpg",
  "hero-26.jpg",
  "hero-27.jpg",
  "hero-28.jpg",
  "hero-29.jpg",
  "hero-30.jpg",
  "hero-31.jpg",
  "hero-32.jpg",
];

const verticalImages = [
  "hero-33.jpg",
  "hero-34.jpg",
  "hero-35.jpg",
  "hero-36.jpg",
  "hero-37.jpg",
  "hero-38.jpg",
  "hero-39.jpg",
  "hero-40.jpg",
  "hero-41.jpg",
  "hero-42.jpg",
  "hero-43.jpg",
  "hero-44.jpg",
  "hero-45.jpg",
  "hero-46.jpg",
  "hero-47.jpg",
  "hero-48.jpg",
  "hero-49.jpg",
  "hero-50.jpg",
  "hero-51.jpg",
  "hero-52.jpg",
  "hero-53.jpg",
  "hero-54.jpg",
  "hero-55.jpg",
  "hero-56.jpg",
  "hero-57.jpg",
  "hero-58.jpg",
  "hero-59.jpg",
];
  // Step 2: Shuffle arrays
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  shuffleArray(horizontalImages);
  shuffleArray(verticalImages);

  // Step 3: Merge arrays with balanced distribution
  const mergedImages = [];
  const maxImages = Math.min(horizontalImages.length, verticalImages.length);
  for (let i = 0; i < maxImages; i++) {
    mergedImages.push(horizontalImages[i], verticalImages[i]);
  }

  // Step 4: Assign images to slots
  const imageSlots = document.querySelectorAll(".js-screens-wall__list-item .img-wrapper img");
  imageSlots.forEach((slot, index) => {
    if (index < mergedImages.length) {
      const imageUrl = `img/assets/hero/${mergedImages[index]}`;
      const isVertical = verticalImages.includes(mergedImages[index]);

      slot.setAttribute("data-src", imageUrl);
      slot.setAttribute("alt", `Image ${index + 1}`);
      slot.setAttribute("width", "600");
      slot.setAttribute("height", isVertical ? "156" : "312");

      // Dynamically adjust wrapper height
      const wrapper = slot.closest(".img-wrapper");
      if (wrapper) {
        wrapper.style.height = isVertical ? "156px" : "312px";
        wrapper.style.width = "600px";
      }
    }
  });
});
