// Keep the model's original eye texture and fin animation, with calm body movement.
customElements.whenDefined('model-viewer').then(() => {
  const model = document.getElementById('fishModel');
  const swimmer = document.getElementById('fishSwim');
  if (!model || !swimmer) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let lastFrame = 0;
  const start = performance.now();

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .05 }).observe(swimmer);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || reduced.matches || now - lastFrame < 80) return;
    lastFrame = now;
    const t = (now - start) / 12000 * Math.PI * 2;
    const x = 1.7 * Math.sin(t * .8);
    const y = 5.3 * Math.sin(t) + .7 * Math.sin(2 * t + .5);
    const roll = 1.2 * Math.sin(t * .85);
    swimmer.style.transform = `translate3d(${x}%,${y}%,0) rotate(${roll}deg) scale(${1.1 + .015 * Math.sin(t + .3)})`;
  }
  requestAnimationFrame(frame);
});
