/**
 * TVC Dual Feature: play block videos when the section is in view; optional mute/unmute toggle.
 */
(function () {
  const ROOT_SELECTOR = '.section-tvc-dual-feature .tvc-dual-feature';
  const VIDEO_SELECTOR = '.tvc-dual-feature__media video, video.tvc-dual-feature__video';

  function setVideoState(video, state) {
    video.setAttribute('data-tvc-video-state', state);
  }

  class TvcDualFeatureVideoController {
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

    initSoundToggles() {
      if (this.root.dataset.showSoundToggle === 'false') return;

      this.root.querySelectorAll('.tvc-dual-feature__sound-toggle').forEach((button) => {
        if (button.dataset.tvcSoundBound === 'true') return;
        button.dataset.tvcSoundBound = 'true';

        const media = button.closest('.tvc-dual-feature__media');
        const video = media?.querySelector('video');
        if (!video) return;

        video.muted = true;
        this.updateSoundToggle(button, video);

        button.addEventListener('click', () => {
          video.muted = !video.muted;
          this.updateSoundToggle(button, video);
          if (!video.paused && !video.muted) {
            video.play().catch(() => {});
          }
        });
      });
    }

    updateSoundToggle(button, video) {
      const unmuted = !video.muted;
      button.setAttribute('aria-pressed', unmuted ? 'true' : 'false');
      button.setAttribute('aria-label', unmuted ? 'Mute video' : 'Unmute video');
      button.setAttribute('data-tvc-sound-state', unmuted ? 'on' : 'off');
    }

    collectVideos() {
      this.videos = Array.from(this.root.querySelectorAll(VIDEO_SELECTOR));
      this.initSoundToggles();
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
    if (!root || root._tvcDualFeatureVideo) return;
    const controller = new TvcDualFeatureVideoController(root);
    if (controller.videos?.length) {
      root._tvcDualFeatureVideo = controller;
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
      root._tvcDualFeatureVideo?.destroy();
      delete root._tvcDualFeatureVideo;
    });
  });
})();
