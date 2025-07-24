// Custom slider button functionality for desktop
document.addEventListener('DOMContentLoaded', function () {
  // Find all custom desktop slider button containers
  const customDesktopButtons = document.querySelectorAll('.slider-buttons-custom-desktop');

  customDesktopButtons.forEach(function (buttonContainer) {
    // Find the prev and next buttons in this container
    const prevButton = buttonContainer.querySelector('button[name="previous"]');
    const nextButton = buttonContainer.querySelector('button[name="next"]');

    if (prevButton && nextButton) {
      // Find the corresponding thumbnail slider component
      const sliderComponent = buttonContainer
        .closest('media-gallery')
        .querySelector('slider-component[id^="GalleryThumbnails"]');

      if (sliderComponent) {
        // Function to update counter and button states
        function updateCounterAndButtons() {
          // Find the currently active thumbnail
          const currentThumbnail = sliderComponent.querySelector('button[aria-current="true"]');
          if (currentThumbnail) {
            // Get all visible thumbnails
            const allThumbnails = Array.from(sliderComponent.querySelectorAll('li')).filter((thumb) => {
              const computedStyle = window.getComputedStyle(thumb);
              return computedStyle.display !== 'none';
            });

            const currentIndex = allThumbnails.indexOf(currentThumbnail.closest('li'));
            const totalVisible = allThumbnails.length;

            // Update counter (add 1 since we want 1-based indexing)
            const counterElement = buttonContainer.querySelector('.slider-counter--current');
            if (counterElement) {
              counterElement.textContent = currentIndex + 1;
            }

            // Update button states
            const prevButton = buttonContainer.querySelector('button[name="previous"]');
            const nextButton = buttonContainer.querySelector('button[name="next"]');

            if (prevButton) {
              prevButton.disabled = currentIndex === 0;
            }

            if (nextButton) {
              nextButton.disabled = currentIndex === totalVisible - 1;
            }

            console.log(`Updated counter: ${currentIndex + 1}/${totalVisible}`);
          }
        }

        // Function to handle thumbnail navigation
        function navigateThumbnail(direction) {
          // Find the currently active thumbnail
          const currentThumbnail = sliderComponent.querySelector('button[aria-current="true"]');
          if (currentThumbnail) {
            // Get all thumbnail list items
            const allThumbnails = sliderComponent.querySelectorAll('li');
            const currentIndex = Array.from(allThumbnails).indexOf(currentThumbnail.closest('li'));

            console.log(`Current thumbnail index: ${currentIndex}`);
            console.log(`Total thumbnails: ${allThumbnails.length}`);

            // Find the next visible thumbnail based on direction
            let targetThumbnail = null;
            let searchIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

            // Search for the next visible thumbnail
            while (searchIndex >= 0 && searchIndex < allThumbnails.length) {
              const candidateThumbnail = allThumbnails[searchIndex];
              const computedStyle = window.getComputedStyle(candidateThumbnail);

              // Check if the thumbnail is visible (not hidden by CSS)
              if (computedStyle.display !== 'none') {
                targetThumbnail = candidateThumbnail;
                break;
              }

              // Move to next/previous thumbnail
              searchIndex = direction === 'prev' ? searchIndex - 1 : searchIndex + 1;
            }

            if (targetThumbnail) {
              const targetIndex = Array.from(allThumbnails).indexOf(targetThumbnail);
              console.log(`Target thumbnail index: ${targetIndex} (visible)`);

              const targetThumbnailButton = targetThumbnail.querySelector('button');
              if (targetThumbnailButton) {
                console.log(`Clicking ${direction} thumbnail (index ${targetIndex})`);
                targetThumbnailButton.click();

                // Update counter and button states after a short delay
                setTimeout(updateCounterAndButtons, 100);
              } else {
                console.log('Target thumbnail button not found');
              }
            } else {
              console.log(`No visible ${direction} thumbnail found (at boundary)`);
            }
          } else {
            console.log('No current thumbnail found');
          }
        }

        // Add click event listeners to the custom desktop buttons
        prevButton.addEventListener('click', function (e) {
          e.preventDefault();
          console.log('Custom desktop prev button clicked');
          navigateThumbnail('prev');
        });

        nextButton.addEventListener('click', function (e) {
          e.preventDefault();
          console.log('Custom desktop next button clicked');
          navigateThumbnail('next');
        });

        // Set up initial counter and button states
        updateCounterAndButtons();

        // Watch for changes in thumbnail selection (when user clicks thumbnails directly)
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-current') {
              updateCounterAndButtons();
            }
          });
        });

        // Observe all thumbnail buttons for aria-current changes
        const thumbnailButtons = sliderComponent.querySelectorAll('button');
        thumbnailButtons.forEach(function (button) {
          observer.observe(button, { attributes: true, attributeFilter: ['aria-current'] });
        });
      }
    }
  });
});
