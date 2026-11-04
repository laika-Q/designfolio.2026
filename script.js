(function () {
  var hitArea = document.getElementById('heroSection');
  var stage = document.getElementById('heroVisual');
  var img = document.getElementById('heroImage');
  if (!hitArea || !stage || !img) return;

  var GALLERY_COUNT = 16;
  var gallery = [];
  for (var i = 1; i <= GALLERY_COUNT; i++) {
    gallery.push('assets/hero-gallery-' + (i < 10 ? '0' + i : i) + '.png');
  }

  // Preload so swaps are instant with no flash of empty image.
  gallery.forEach(function (src) {
    var preload = new Image();
    preload.src = src;
  });

  var MOVE_THRESHOLD = 48; // px of cumulative pointer travel before advancing a frame
  var lastX = null;
  var lastY = null;
  var travel = 0;
  var index = -1;

  function showNextFrame() {
    index = (index + 1) % gallery.length;
    img.src = gallery[index];
    stage.classList.add('is-scrubbing');
  }

  hitArea.addEventListener('mousemove', function (e) {
    if (lastX !== null) {
      travel += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (travel >= MOVE_THRESHOLD) {
        travel = 0;
        showNextFrame();
      }
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  hitArea.addEventListener('mouseleave', function () {
    lastX = null;
    lastY = null;
    travel = 0;
  });
})();

(function () {
  var cases = document.querySelectorAll('.cases .case');
  if (!cases.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('is-active', entry.intersectionRatio >= 0.6);
    });
  }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });

  cases.forEach(function (el) { observer.observe(el); });
})();

// Custom cursor label: follows the pointer with easing and scales in over [data-cursor] targets.
(function () {
  var label = document.getElementById('cursorLabel');
  var targets = document.querySelectorAll('[data-cursor]');
  if (!label || !targets.length || !window.matchMedia('(hover: hover)').matches) return;

  var text = label.querySelector('span');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = reduce ? 1 : 0.18;
  var x = 0, y = 0, tx = 0, ty = 0;
  var running = false;

  function tick() {
    x += (tx - x) * EASE;
    y += (ty - y) * EASE;
    label.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  function track(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  targets.forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      text.textContent = el.getAttribute('data-cursor');
      // Snap to the entry point so the label doesn't fly in from the last position.
      x = tx = e.clientX;
      y = ty = e.clientY;
      label.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      label.classList.add('is-visible');
    });
    el.addEventListener('mousemove', track);
    el.addEventListener('mouseleave', function () {
      label.classList.remove('is-visible');
    });
  });

  // Hide if the page scrolls the target out from under a stationary pointer.
  window.addEventListener('scroll', function () {
    if (!label.classList.contains('is-visible')) return;
    var under = document.elementFromPoint(tx, ty);
    if (!under || !under.closest('[data-cursor]')) label.classList.remove('is-visible');
  }, { passive: true });
})();
