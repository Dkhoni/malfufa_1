/* =============================================
   MALFUFA — scroll-animation.js (Salla)
   Canvas frame-by-frame animation on scroll.
   Reads config from window.MALFUFA set in master.twig
   ============================================= */

(function () {
  const wrapper = document.getElementById('scroll-anim');
  const canvas = document.getElementById('hero-canvas');
  if (!wrapper || !canvas) return;

  const ctx = canvas.getContext('2d');

  // Config is set in master.twig as window.MALFUFA
  const CFG = window.MALFUFA || {};
  const FRAME_COUNT = CFG.frameCount || 60;
  const CDN_URL = CFG.cdnUrl || '';

  // Build URL for each frame
  // Frames must be named: frame_001.jpg, frame_002.jpg ...
  function frameSrc(i) {
    const num = String(i).padStart(3, '0');
    return `${CDN_URL}frame_${num}.jpg`;
  }

  // Image pool
  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = 0;
  let initialized = false;

  // Preload all frames
  function preload() {
    if (!CDN_URL) {
      console.warn('[MALFUFA] hero_cdn_url is not set in Salla theme settings. Canvas animation disabled.');
      return;
    }
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        // Draw first frame as soon as it loads
        if (i === 1 && !initialized) {
          initialized = true;
          resizeCanvas();
          drawFrame(0);
          hideScrollHint();
        }
      };
      img.onerror = () => {
        console.warn(`[MALFUFA] Could not load frame ${i}: ${frameSrc(i)}`);
      };
      img.src = frameSrc(i);
      images[i - 1] = img;
    }
  }

  // Resize canvas to fill sticky viewport
  function resizeCanvas() {
    const sticky = wrapper.querySelector('.canvas-sticky');
    canvas.width = sticky ? sticky.offsetWidth : window.innerWidth;
    canvas.height = sticky ? sticky.offsetHeight : window.innerHeight;
    drawFrame(currentFrame); // Redraw after resize
  }

  // Draw a frame — cover-fit like CSS background-size: cover
  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const x = (cw - iw * scale) / 2;
    const y = (ch - ih * scale) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, iw * scale, ih * scale);
    currentFrame = index;
  }

  // Hide the scroll down arrow after first interaction
  function hideScrollHint() {
    const hint = document.getElementById('scroll-hint');
    if (hint) {
      window.addEventListener('scroll', function once() {
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.5s';
        window.removeEventListener('scroll', once);
      }, { once: true });
    }
  }

  // Scroll → frame mapping
  function onScroll() {
    if (!initialized) return;

    const scrollTop = window.scrollY;
    const wrapperTop = wrapper.offsetTop;
    const scrolled = scrollTop - wrapperTop;
    const total = wrapper.offsetHeight - window.innerHeight;

    const fraction = Math.min(Math.max(scrolled / total, 0), 1);
    const frameIndex = Math.min(Math.floor(fraction * FRAME_COUNT), FRAME_COUNT - 1);

    // Update progress bar
    const bar = document.getElementById('scroll-progress-bar');
    if (bar) bar.style.width = (fraction * 100) + '%';

    // Only redraw if frame changed
    if (frameIndex !== currentFrame) {
      requestAnimationFrame(() => drawFrame(frameIndex));
    }
  }

  // Init
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  if (window.ResizeObserver) {
    new ResizeObserver(resizeCanvas).observe(canvas);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preload);
  } else {
    preload();
  }
})();
