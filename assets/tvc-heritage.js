/**
 * TVC Heritage: play section video when in view (muted, no sound controls).
 */
(function () {
  const ROOT_SELECTOR = '.section-tvc-heritage .tvc-heritage';
  const VIDEO_SELECTOR = '.tvc-heritage__media video, video.tvc-heritage__video';

  function setVideoState(video, state) {
    video.setAttribute('data-tvc-video-state', state);
  }

  class TvcHeritageVideoController {
    constructor(root) {
      this.root = root;
      this.sectionInView = false;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.onVisibilityChange = () => this.sync();

      this.collectVideos();
      if (!this.videos.length) return;

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

      this.sync();
    }

    collectVideos() {
      this.videos = Array.from(this.root.querySelectorAll(VIDEO_SELECTOR));
      this.videos.forEach((video) => {
        video.muted = true;
        video.autoplay = false;
      });
    }

    destroy() {
      this.sectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.reducedMotion.removeEventListener('change', this.onVisibilityChange);
    }

    sync() {
      this.collectVideos();
      if (!this.videos.length) return;

      if (this.reducedMotion.matches || document.hidden || !this.sectionInView) {
        this.videos.forEach((video) => {
          video.pause();
          setVideoState(video, 'paused');
        });
        return;
      }

      this.videos.forEach((video) => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setVideoState(video, 'playing'))
            .catch(() => setVideoState(video, 'paused'));
        } else {
          setVideoState(video, video.paused ? 'paused' : 'playing');
        }
      });
    }
  }

  function initVideoControl(root) {
    if (!root || root._tvcHeritageVideo) return;
    const controller = new TvcHeritageVideoController(root);
    if (controller.videos?.length) {
      root._tvcHeritageVideo = controller;
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
      root._tvcHeritageVideo?.destroy();
      delete root._tvcHeritageVideo;
    });
  });
})();
