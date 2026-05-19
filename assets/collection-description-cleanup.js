/**
 * Removes legacy spacer <p> tags from collection hero descriptions (e.g. &nbsp;-only).
 */
(function () {
  const DESCRIPTION_SELECTOR = '.collection-hero__description.rte';

  function isSpacerParagraph(paragraph) {
    const clone = paragraph.cloneNode(true);
    clone.querySelectorAll('br, wbr').forEach((node) => node.remove());
    return clone.textContent.replace(/\u00a0/g, ' ').replace(/\s/g, '') === '';
  }

  function removeSpacerParagraphs(root) {
    root.querySelectorAll('p').forEach((paragraph) => {
      if (isSpacerParagraph(paragraph)) {
        paragraph.remove();
      }
    });
  }

  function init() {
    document.querySelectorAll(DESCRIPTION_SELECTOR).forEach(removeSpacerParagraphs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
