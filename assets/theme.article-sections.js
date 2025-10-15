document.addEventListener('DOMContentLoaded', function () {
  // Handle inline image positioning
  document.querySelectorAll('.article-container .inline-image').forEach(function (element) {
    let position = element.dataset.position;
    let photoIndex = position ? position : 0;
    let paragraphs = element.parentElement.querySelectorAll('> p');
    console.log('paragraphs.length: ' + paragraphs.length);
    let target = paragraphs[position];
    console.log('target: ' + (target ? 'found' : 'not found'));
    console.log('position: ' + position);
    if (target) {
      element.parentElement.insertBefore(element, target);
    }
  });

  // Initialize Flickity for blog carousels that don't already have data-flickity
  // (blog-carousel-section.liquid already uses data-flickity attribute)
  document.querySelectorAll('.blog-carousel:not([data-flickity])').forEach(function (carousel) {
    if (typeof Flickity !== 'undefined') {
      new Flickity(carousel, {
        freeScroll: true,
        contain: true,
        prevNextButtons: false,
        pageDots: false,
      });
    }
  });

  // Initialize Flickity for favorites section carousel (mobile only)
  document.querySelectorAll('.favorites-section.carousel').forEach(function (carousel) {
    if (typeof Flickity !== 'undefined') {
      let flickityInstance = null;

      function initFavoritesCarousel() {
        const isMobile = window.innerWidth < 768;
        console.log('Favorites carousel init - isMobile:', isMobile, 'width:', window.innerWidth);

        if (isMobile && !flickityInstance) {
          // Initialize Flickity on mobile only
          console.log('Initializing Flickity, items found:', carousel.querySelectorAll('.item').length);
          flickityInstance = new Flickity(carousel, {
            cellAlign: 'left',
            contain: false,
            prevNextButtons: false,
            pageDots: false,
            freeScroll: false,
            wrapAround: false,
            cellSelector: '.item',
          });
          console.log('Flickity initialized successfully');
        } else if (!isMobile && flickityInstance) {
          // Destroy Flickity on desktop
          console.log('Destroying Flickity on desktop');
          flickityInstance.destroy();
          flickityInstance = null;
        }
      }

      initFavoritesCarousel();

      // Debounce resize events
      let resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initFavoritesCarousel, 250);
      });
    }
  });
});
