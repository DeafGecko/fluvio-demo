  (function () {
    var frame = document.querySelector('.phone');
    var phone = document.getElementById('btn-phone');
    var tablet = document.getElementById('btn-tablet');
    function set(mode) {
      var isTablet = mode === 'tablet';
      frame.classList.toggle('tablet', isTablet);
      phone.classList.toggle('on', !isTablet); phone.setAttribute('aria-pressed', String(!isTablet));
      tablet.classList.toggle('on', isTablet); tablet.setAttribute('aria-pressed', String(isTablet));
    }
    phone.addEventListener('click', function () { set('phone'); });
    tablet.addEventListener('click', function () { set('tablet'); });
  })();
  (function () {
    var clock = document.getElementById('clock');
    function tick() {
      var d = new Date();
      clock.textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    tick(); setInterval(tick, 30000);
  })();
