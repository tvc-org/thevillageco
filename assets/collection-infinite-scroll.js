/**
 * Collection grid infinite scroll.
 *
 * REVERT: Theme editor → Collection page → Product grid → disable "Infinite scroll",
 * or remove this file + snippets/collection-infinite-scroll.liquid and restore
 * {% render 'pagination' %} in sections/main-collection-product-grid.liquid.
 */
class CollectionInfiniteScroll extends HTMLElement {
  constructor() {
    super();
    this.loading = false;
    this.observer = null;
    this.boundCheckScroll = null;
  }

  getGridItems() {
    if (!this.grid) return [];
    return [...this.grid.children].filter((el) => !el.classList.contains('collection-infinite-scroll__sentinel'));
  }

  getLoadTrigger() {
    const items = this.getGridItems();
    return items[items.length - 1] || null;
  }

  isLoadTriggerInRange() {
    const trigger = this.getLoadTrigger();
    if (!trigger) return false;

    const rect = trigger.getBoundingClientRect();
    if (rect.height <= 0) return false;

    return rect.top <= window.innerHeight && rect.bottom > 0;
  }

  observeLoadTrigger() {
    if (!this.observer || !this.nextUrl) return;

    if (this.loadTrigger) {
      this.observer.unobserve(this.loadTrigger);
      this.loadTrigger = null;
    }

    const trigger = this.getLoadTrigger();
    if (!trigger) return;

    this.loadTrigger = trigger;
    this.observer.observe(trigger);
  }

  checkScroll() {
    if (!this.getLoadTrigger() || this.loading || !this.nextUrl) return;

    if (this.isLoadTriggerInRange()) {
      this.loadNextPage();
    }
  }

  connectedCallback() {
    this.gridId = this.dataset.gridId || 'product-grid';
    this.grid = document.getElementById(this.gridId);
    this.sentinel = this.grid?.querySelector('.collection-infinite-scroll__sentinel');
    this.loadingEl = this.querySelector('.collection-infinite-scroll__loading');
    this.endEl = this.querySelector('.collection-infinite-scroll__end');
    this.sectionId = this.dataset.sectionId;
    this.nextUrl = this.dataset.nextUrl || null;
    this.currentPage = parseInt(this.dataset.currentPage, 10) || 1;

    if (!this.grid || !this.sentinel || !this.sectionId || !this.nextUrl) {
      this.finish();
      return;
    }

    this.boundCheckScroll = this.checkScroll.bind(this);
    window.addEventListener('scroll', this.boundCheckScroll, { passive: true });
    window.addEventListener('resize', this.boundCheckScroll, { passive: true });

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          this.loadNextPage();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0 }
    );

    this.observeLoadTrigger();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    if (this.boundCheckScroll) {
      window.removeEventListener('scroll', this.boundCheckScroll);
      window.removeEventListener('resize', this.boundCheckScroll);
    }
  }

  appendGridItems(nextGrid) {
    const items = [...nextGrid.children].filter((child) => !child.classList.contains('collection-infinite-scroll__sentinel'));

    items.forEach((child) => {
      if (this.sentinel) {
        this.grid.insertBefore(child, this.sentinel);
      } else {
        this.grid.appendChild(child);
      }
    });
  }

  async loadNextPage() {
    if (this.loading || !this.nextUrl || !this.isLoadTriggerInRange()) return;

    this.loading = true;
    this.loadingEl?.classList.remove('hidden');

    try {
      const url = new URL(this.nextUrl, window.location.origin);
      url.searchParams.set('section_id', this.sectionId);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const nextGrid = doc.getElementById(this.gridId);

      if (nextGrid) {
        this.appendGridItems(nextGrid);
      }

      const nextScroller = doc.querySelector('collection-infinite-scroll');
      if (nextScroller?.dataset.nextUrl) {
        this.nextUrl = nextScroller.dataset.nextUrl;
        this.currentPage = parseInt(nextScroller.dataset.currentPage, 10) || this.currentPage + 1;
      } else {
        this.nextUrl = null;
        this.finish();
      }

      if (typeof initializeScrollAnimationTrigger === 'function') {
        initializeScrollAnimationTrigger(this.grid);
      }

      this.observeLoadTrigger();
    } catch (error) {
      this.nextUrl = null;
      this.finish();
    } finally {
      this.loading = false;
      this.loadingEl?.classList.add('hidden');
    }
  }

  finish() {
    if (this.loadTrigger) {
      this.observer?.unobserve(this.loadTrigger);
      this.loadTrigger = null;
    }

    if (this.boundCheckScroll) {
      window.removeEventListener('scroll', this.boundCheckScroll);
      window.removeEventListener('resize', this.boundCheckScroll);
    }

    this.sentinel?.remove();

    if (this.nextUrl) return;

    this.observer?.disconnect();
    this.endEl?.classList.remove('hidden');
  }
}

if (!customElements.get('collection-infinite-scroll')) {
  customElements.define('collection-infinite-scroll', CollectionInfiniteScroll);
}
