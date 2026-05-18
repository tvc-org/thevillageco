/**
 * TVC slideshow: play slide videos only while the section is in view and the slide is active.
 * Video control is standalone so it still runs if custom-element upgrade fails.
 */
(function () {
  const VIDEO_SELECTOR = '.tvc-slideshow__media video, video.tvc-slideshow__video';
  const DEBUG = new URLSearchParams(window.location.search).has('tvc_slideshow_debug');

  function log(...args) {
    if (DEBUG) console.log('[tvc-slideshow]', ...args);
  }

  /** Visible in DevTools: data-tvc-video-state="playing" | "paused" */
  function setVideoState(video, state) {
    video.setAttribute('data-tvc-video-state', state);
  }

  function setSectionInView(root, inView) {
    root.setAttribute('data-tvc-section-in-view', inView ? 'true' : 'false');
  }

  class TvcSlideshowVideoController {
    constructor(root) {
      this.root = root;
      this.sectionInView = false;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.onVisibilityChange = () => this.sync();
      this.onScroll = () => this.sync();

      this.collectVideos();
      if (!this.videos.length) return;

      setSectionInView(root, false);

      this.videos.forEach((video) => {
        video.pause();
        video.autoplay = false;
        setVideoState(video, 'paused');
      });

      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.reducedMotion.addEventListener('change', this.onVisibilityChange);

      const observeTarget = root.closest('.shopify-section') || root;
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          this.sectionInView = entry.isIntersecting && entry.intersectionRatio > 0.05;
          setSectionInView(root, this.sectionInView);
          log('intersection', { inView: this.sectionInView, ratio: entry.intersectionRatio });
          this.sync();
        },
        { root: null, rootMargin: '0px 0px -5% 0px', threshold: [0, 0.05, 0.15, 0.5] }
      );
      this.sectionObserver.observe(observeTarget);

      const slider = root.querySelector('[id^="Slider-"]');
      if (slider) {
        slider.addEventListener('scroll', this.onScroll, { passive: true });
      }

      root.addEventListener('slideChanged', this.onVisibilityChange);

      this.sync();
      log('init', { videos: this.videos.length, observeTarget });
    }

    initSoundToggles() {
      if (this.root.dataset.showSoundToggle === 'false') return;

      this.root.querySelectorAll('.tvc-slideshow__sound-toggle').forEach((button) => {
        if (button.dataset.tvcSoundBound === 'true') return;
        button.dataset.tvcSoundBound = 'true';

        const media = button.closest('.tvc-slideshow__media');
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
      const slider = this.root.querySelector('[id^="Slider-"]');
      slider?.removeEventListener('scroll', this.onScroll);
    }

    getActiveSlide() {
      const visible = this.root.querySelector('.slideshow__slide[aria-hidden="false"]');
      if (visible) return visible;

      const slider = this.root.querySelector('[id^="Slider-"]');
      if (slider) {
        const slides = Array.from(this.root.querySelectorAll('.slideshow__slide')).filter(
          (el) => el.clientWidth > 0
        );
        if (slides.length) {
          const scrollLeft = slider.scrollLeft;
          let active = slides[0];
          slides.forEach((slide) => {
            if (Math.abs(slide.offsetLeft - scrollLeft) < Math.abs(active.offsetLeft - scrollLeft)) {
              active = slide;
            }
          });
          return active;
        }
      }

      return this.root.querySelector('.slideshow__slide');
    }

    sync() {
      this.collectVideos();
      if (!this.videos.length) return;

      setSectionInView(this.root, this.sectionInView);

      if (this.reducedMotion.matches || document.hidden || !this.sectionInView) {
        this.videos.forEach((video) => {
          video.pause();
          setVideoState(video, 'paused');
        });
        log('sync pause all', { reason: 'out of view / hidden / reduced motion' });
        return;
      }

      const activeSlide = this.getActiveSlide();

      this.videos.forEach((video) => {
        const slide = video.closest('.slideshow__slide');
        const isActive = slide && slide === activeSlide;

        if (isActive) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setVideoState(video, 'playing'))
              .catch(() => setVideoState(video, 'paused'));
          } else {
            setVideoState(video, video.paused ? 'paused' : 'playing');
          }
          log('play', slide?.id);
        } else {
          video.pause();
          setVideoState(video, 'paused');
          log('pause', slide?.id);
        }
      });
    }
  }

  function initVideoControl(root) {
    if (!root || root._tvcSlideshowVideo) return;
    const controller = new TvcSlideshowVideoController(root);
    if (controller.videos?.length) {
      root._tvcSlideshowVideo = controller;
    }
  }

  function boot() {
    document.querySelectorAll('tvc-slideshow-component').forEach(initVideoControl);
  }

  function defineSlideshowComponent() {
    if (typeof SlideshowComponent === 'undefined') return false;
    if (customElements.get('tvc-slideshow-component')) return true;

    class TvcSlideshowComponent extends SlideshowComponent {
      connectedCallback() {
        initVideoControl(this);
      }

      setSlideVisibility(event) {
        super.setSlideVisibility(event);
        this._tvcSlideshowVideo?.sync();
      }
    }

    customElements.define('tvc-slideshow-component', TvcSlideshowComponent);
    return true;
  }

  function onReady() {
    defineSlideshowComponent();
    boot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll?.('tvc-slideshow-component').forEach(initVideoControl);
  });

  document.addEventListener('shopify:section:unload', (event) => {
    event.target.querySelectorAll?.('tvc-slideshow-component').forEach((root) => {
      root._tvcSlideshowVideo?.destroy();
      delete root._tvcSlideshowVideo;
    });
  });
})();
