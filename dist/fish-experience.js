// Keep the model's fin and tail animation, with calm swimming and subtle eye movement.
customElements.whenDefined('model-viewer').then(() => {
  const model = document.getElementById('fishModel');
  const swimmer = document.getElementById('fishSwim');
  if (!model || !swimmer) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let lastFrame = 0;
  let start = performance.now();
  let nextBlink = start + 2200 + Math.random() * 2800;
  let blinkStart = -1;
  let face = null;

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .05 }).observe(swimmer);

  async function prepareFace() {
    if (face || !model.model?.materials?.[0]) return;
    const base = new Image();
    base.src = 'assets/fish-face-base.png';
    try { await base.decode(); } catch { return; }
    const texture = model.createCanvasTexture();
    const canvas = texture.source.element;
    canvas.width = base.naturalWidth;
    canvas.height = base.naturalHeight;
    const context = canvas.getContext('2d');
    const channel = model.model.materials[0].pbrMetallicRoughness.baseColorTexture;
    if (!context || !channel) return;
    face = { base, texture, context, channel };
    drawFace(0, 0, 0);
    channel.setTexture(texture);
  }

  function eye(context, x, y, lookX, lookY, closure) {
    // Keep the original silver outer ring; only the pupil and eyelids move.
    context.save();
    context.beginPath();
    context.ellipse(x, y, 10, 11, 0, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = '#687987';
    context.fillRect(x - 12, y - 13, 24, 26);
    const iris = context.createRadialGradient(x + lookX - 2, y + lookY - 2, 1, x + lookX, y + lookY, 9);
    iris.addColorStop(0, '#27343d');
    iris.addColorStop(.65, '#11191f');
    iris.addColorStop(1, '#566673');
    context.fillStyle = iris;
    context.beginPath();
    context.ellipse(x + lookX, y + lookY, 8, 9, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = 'rgba(240,247,249,.95)';
    context.beginPath();
    context.ellipse(x + lookX - 3, y + lookY - 3, 2.3, 2, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
    if (closure <= .01) return;
    const r = 16;
    const lid = context.createLinearGradient(x, y - r, x, y + r);
    lid.addColorStop(0, '#b8c2cb');
    lid.addColorStop(.5, '#8796a3');
    lid.addColorStop(1, '#697987');
    context.fillStyle = lid;
    for (const side of [-1, 1]) {
      context.beginPath();
      context.ellipse(x, y + side * (r - r * closure / 2), r, r * closure / 2, 0, 0, Math.PI * 2);
      context.fill();
    }
    if (closure > .7) {
      context.strokeStyle = 'rgba(56,69,79,.7)';
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x - 12, y);
      context.quadraticCurveTo(x, y + 2, x + 12, y);
      context.stroke();
    }
  }

  function drawFace(closure, lookX, lookY) {
    if (!face) return;
    const { base, texture, context } = face;
    context.drawImage(base, 0, 0);
    eye(context, 904, 248, lookX, lookY, closure);
    eye(context, 120, 772, -lookX, lookY, closure);
    texture.source.update();
  }

  model.addEventListener('load', prepareFace);
  if (model.loaded) prepareFace();

  function blinkAmount(now) {
    if (blinkStart < 0 && now >= nextBlink) blinkStart = now;
    if (blinkStart < 0) return 0;
    const phase = (now - blinkStart) / 240;
    if (phase >= 1) {
      blinkStart = -1;
      nextBlink = now + 2400 + Math.random() * 4200;
      return 0;
    }
    return Math.sin(Math.PI * phase);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || reduced.matches || now - lastFrame < 80) return;
    lastFrame = now;
    const t = (now - start) / 12000 * Math.PI * 2;
    const x = 1.7 * Math.sin(t * .8);
    const y = 5.3 * Math.sin(t) + .7 * Math.sin(2 * t + .5);
    const roll = 1.2 * Math.sin(t * .85);
    swimmer.style.transform = `translate3d(${x}%,${y}%,0) rotate(${roll}deg) scale(${1.1 + .015 * Math.sin(t + .3)})`;
    drawFace(blinkAmount(now), 2 * Math.sin(t * .75), 1.2 * Math.sin(t * .6 + .5));
  }
  requestAnimationFrame(frame);
});
