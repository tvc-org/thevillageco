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

  // Blog carousel functionality
  document.querySelectorAll('.blog-carousel').forEach(function (carousel) {
    initCarousel(carousel, {
      arrows: true,
      dots: false,
      infinite: false,
      slidesToShow: 2.5,
      slidesToScroll: 2,
      responsive: [
        {
          breakpoint: 960,
          settings: {
            slidesToShow: 1.5,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1.25,
            slidesToScroll: 1,
          },
        },
      ],
    });
  });

  // Favorites section carousel
  document.querySelectorAll('.favorites-section.carousel').forEach(function (carousel) {
    initCarousel(carousel, {
      mobileFirst: true,
      infinite: false,
      slidesToShow: 1.2,
      arrows: false,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
          },
        },
      ],
    });
  });

  // Basic carousel implementation
  function initCarousel(container, options) {
    const slides = container.querySelectorAll('.carousel-slide, .slide, [data-slide]');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Create carousel wrapper if it doesn't exist
    if (!container.querySelector('.carousel-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'carousel-wrapper';
      wrapper.style.display = 'flex';
      wrapper.style.transition = 'transform 0.3s ease';

      // Move slides into wrapper
      slides.forEach((slide) => {
        wrapper.appendChild(slide);
      });

      container.appendChild(wrapper);
    }

    const wrapper = container.querySelector('.carousel-wrapper');

    // Add navigation arrows if enabled
    if (options.arrows) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-prev';
      prevBtn.innerHTML = '‹';
      prevBtn.addEventListener('click', () => {
        currentSlide = Math.max(0, currentSlide - (options.slidesToScroll || 1));
        updateCarousel();
      });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-next';
      nextBtn.innerHTML = '›';
      nextBtn.addEventListener('click', () => {
        currentSlide = Math.min(totalSlides - 1, currentSlide + (options.slidesToScroll || 1));
        updateCarousel();
      });

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
    }

    // Add dots if enabled
    if (options.dots) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';

      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.addEventListener('click', () => {
          currentSlide = i;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }

      container.appendChild(dotsContainer);
    }

    function updateCarousel() {
      const slideWidth = 100 / (options.slidesToShow || 1);
      const translateX = -currentSlide * slideWidth;
      wrapper.style.transform = `translateX(${translateX}%)`;

      // Update active dot
      if (options.dots) {
        const dots = container.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentSlide);
        });
      }

      // Update arrow states
      if (options.arrows) {
        const prevBtn = container.querySelector('.carousel-prev');
        const nextBtn = container.querySelector('.carousel-next');
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide >= totalSlides - 1;
      }
    }

    // Handle responsive breakpoints
    function handleResize() {
      const width = window.innerWidth;
      let currentOptions = options;

      if (options.responsive) {
        options.responsive.forEach((breakpoint) => {
          if (width <= breakpoint.breakpoint) {
            currentOptions = { ...currentOptions, ...breakpoint.settings };
          }
        });
      }

      // Recalculate slide width
      const slideWidth = 100 / (currentOptions.slidesToShow || 1);
      wrapper.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
    }

    window.addEventListener('resize', handleResize);
    updateCarousel();
  }
});
