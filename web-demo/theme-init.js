// Runs before the first paint. Reads the saved Light / Dark / System choice from this browser,
// so the page shell starts in the right colors instead of flashing the phone's theme.
(function () {
  var dark;
  try {
    var raw = localStorage.getItem('prefs_v1');
    var a = raw ? JSON.parse(raw).appearance : 'system';
    dark = a === 'dark' || (a !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (e) {
    dark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();

// Demo page only: keep the app frame invisible until the app has loaded inside it,
// so its first half-drawn screen never shows. The dark or light screen behind it shows instead.
document.addEventListener('DOMContentLoaded', function () {
  var frame = document.querySelector('.screen iframe');
  if (!frame) return;
  frame.style.opacity = '0';
  frame.style.transition = 'opacity .25s ease';
  var show = function () { frame.style.opacity = '1'; };
  frame.addEventListener('load', show);
  setTimeout(show, 4000);
});
