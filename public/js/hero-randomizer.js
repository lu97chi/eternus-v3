/**
 * Hero Section Randomizer
 * Randomly selects and displays images from the hero folder
 * Handles both JPG and PNG formats
 */

class HeroRandomizer {
  constructor() {
    this.heroFolder = 'img/assets/hero/';
    this.totalImages = 76; // Total number of images in hero folder
    this.imagesToDisplay = 24; // We need 24 images for the 4 lanes (6 each)
    this.selectedImages = [];
  }

  /**
   * Generate array of image filenames (1-76)
   */
  getAllImagePaths() {
    const images = [];
    for (let i = 1; i <= this.totalImages; i++) {
      // Assume all are JPG by default (check if PNG exists would require server-side)
      // For now, we'll use JPG since that's what exists
      images.push(`${this.heroFolder}hero-${i}.jpg`);
    }
    return images;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get random unique images
   */
  getRandomImages() {
    const allImages = this.getAllImagePaths();
    const shuffled = this.shuffleArray(allImages);
    return shuffled.slice(0, this.imagesToDisplay);
  }

  /**
   * Create image HTML element
   */
  createImageElement(imagePath) {
    const div = document.createElement('div');
    div.className = 'w-100 d-block p-1 p-md-2 js-screens-wall__list-item';
    div.innerHTML = `
      <div class="img-wrapper">
        <img class="lazy of-cover w-full h-full"
          src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='100%25'%20height='100%25'%3E%3C/svg%3E"
          decoding="async"
          data-src="${imagePath}"
          width="184"
          height="1020"
          alt="" />
      </div>
    `;
    return div;
  }

  /**
   * Populate hero section with random images
   */
  populate() {
    // Get 24 random images
    const randomImages = this.getRandomImages();

    // Find all lanes
    const lanes = document.querySelectorAll('.js-screens-wall__list-lane');

    if (lanes.length === 0) {
      console.warn('HeroRandomizer: No lanes found. Make sure the DOM is loaded.');
      return;
    }

    // Distribute images across 4 lanes (6 images per lane)
    let imageIndex = 0;
    lanes.forEach((lane) => {
      // Clear existing images
      lane.innerHTML = '';

      // Add 6 random images to this lane
      for (let i = 0; i < 6; i++) {
        if (imageIndex < randomImages.length) {
          const imageElement = this.createImageElement(randomImages[imageIndex]);
          lane.appendChild(imageElement);
          imageIndex++;
        }
      }
    });

    console.log('HeroRandomizer: Successfully populated hero section with random images');
  }

  /**
   * Initialize on DOM ready
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.populate());
    } else {
      this.populate();
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const randomizer = new HeroRandomizer();
  randomizer.init();
});

// Also handle AJAX page transitions (for navigation back to home)
document.addEventListener('arts/barba/transition/init/after', () => {
  const randomizer = new HeroRandomizer();
  randomizer.init();
});
