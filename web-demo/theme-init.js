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
