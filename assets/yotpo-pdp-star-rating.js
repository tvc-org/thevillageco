/**
 * PDP: Yotpo star rating in buy box — scroll to full reviews on click.
 * Supports (1) widgets-repository markup (.yotpo-sr-bottom-line-summary) and
 * (2) legacy bottomLine (.yotpo.bottomLine) which the Shopify app often injects instead.
 */
(function () {
  const REVIEWS_ANCHOR_ID = 'yotpo-reviews-section';

  function scrollToReviews(event, reviewsEl) {
    event.preventDefault();
    event.stopPropagation();
    reviewsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onClickCapture(event) {
    if (!document.body.classList.contains('template-product')) return;

    const reviewsEl = document.getElementById(REVIEWS_ANCHOR_ID);
    if (!reviewsEl) return;

    const info = event.target.closest('.product__info-container');
    if (!info) return;

    const srSummary = event.target.closest('.yotpo-sr-bottom-line-summary');
    if (srSummary && info.contains(srSummary)) {
      scrollToReviews(event, reviewsEl);
      return;
    }

    const legacyRoot = event.target.closest('.product__info-container .yotpo.bottomLine');
    if (legacyRoot && info.contains(legacyRoot)) {
      scrollToReviews(event, reviewsEl);
    }
  }

  document.addEventListener('click', onClickCapture, true);
})();
