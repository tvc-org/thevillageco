/**
 * Cookie consent banner — ported from legacy OneRockwell theme.
 * Uses cookie name acceptcookieterm so returning visitors are not re-prompted.
 */
(function () {
  const COOKIE_NAME = 'acceptcookieterm';
  const banner = document.getElementById('CookieBanner');

  if (!banner) return;

  function getCookie(name) {
    const escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&');
    const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    const maxAge = Math.max(1, parseInt(days, 10) || 365) * 24 * 60 * 60;
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
  }

  function show() {
    banner.hidden = false;
    banner.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cookie-not-accepted');
    requestAnimationFrame(function () {
      banner.classList.add('cookie-banner--visible');
    });
  }

  function hide() {
    banner.classList.remove('cookie-banner--visible');
    banner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cookie-not-accepted');

    banner.addEventListener(
      'transitionend',
      function onEnd(event) {
        if (event.target !== banner || banner.classList.contains('cookie-banner--visible')) return;
        banner.hidden = true;
        banner.removeEventListener('transitionend', onEnd);
      },
      { once: false }
    );
  }

  const acceptButton = banner.querySelector('.cookie-banner__accept');

  if (getCookie(COOKIE_NAME)) return;

  show();

  acceptButton?.addEventListener('click', function () {
    setCookie(COOKIE_NAME, 'true', banner.dataset.days || '365');
    hide();
  });
})();
