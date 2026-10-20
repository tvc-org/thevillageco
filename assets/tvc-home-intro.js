/**
 * TVC Home Intro: play the leaf animation when the section is in view.
 */
(function () {
  const ROOT_SELECTOR = '.section-tvc-home-intro .tvc-home-intro';
  const PLAYER_SELECTOR = 'lottie-player.tvc-home-intro__lottie';

  function setVideoState(video, state) {
    video.setAttribute('data-tvc-video-state', state);
  }

  class TvcHomeIntroVideoController {
    constructor(root) {
      this.root = root;
      this.sectionInView = false;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.onVisibilityChange = () => this.sync();

      this.collectPlayers();
      if (!this.players.length) return;

      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.reducedMotion.addEventListener('change', this.onVisibilityChange);

      const observeTarget = root.closest('.shopify-section') || root;
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          this.sectionInView = entry.isIntersecting && entry.intersectionRatio > 0.05;
          this.sync();
        },
        { root: null, rootMargin: '0px 0px -5% 0px', threshold: [0, 0.05, 0.15, 0.5] }
      );
      this.sectionObserver.observe(observeTarget);

      if (window.customElements?.whenDefined) {
        window.customElements.whenDefined('lottie-player').then(() => this.sync());
      }
      this.sync();
    }

    collectPlayers() {
      this.players = Array.from(this.root.querySelectorAll(PLAYER_SELECTOR));
    }

    destroy() {
      this.sectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.reducedMotion.removeEventListener('change', this.onVisibilityChange);
    }

    sync() {
      this.collectPlayers();
      if (!this.players.length) return;

      const shouldPause = this.reducedMotion.matches || document.hidden || !this.sectionInView;
      this.players.forEach((player) => {
        if (typeof player.pause !== 'function' || typeof player.play !== 'function') return;
        if (shouldPause) {
          player.pause();
          setVideoState(player, 'paused');
          return;
        }
        player.play();
        setVideoState(player, 'playing');
      });
    }
  }

  function initVideoControl(root) {
    if (!root || root._tvcHomeIntroVideo) return;
    const controller = new TvcHomeIntroVideoController(root);
    if (controller.players?.length) {
      root._tvcHomeIntroVideo = controller;
    }
  }

  function boot() {
    document.querySelectorAll(ROOT_SELECTOR).forEach(initVideoControl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll?.(ROOT_SELECTOR).forEach(initVideoControl);
  });

  document.addEventListener('shopify:section:unload', (event) => {
    event.target.querySelectorAll?.(ROOT_SELECTOR).forEach((root) => {
      root._tvcHomeIntroVideo?.destroy();
      delete root._tvcHomeIntroVideo;
    });
  });
})();
