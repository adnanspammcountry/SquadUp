// Sparks that fly off buttons.
// One full-screen canvas sits on top of the page (it ignores clicks) and every spark is drawn on it.
// Any element with the "fx" class gets sparks on hover and a bigger burst on click.

const sparkCanvas = $('#fx');
const sparkCtx = sparkCanvas.getContext('2d');
const SPARK_COLORS = ['#00FF66', '#FF5500', '#FFFFFF'];

let sparks = [];
let sparkFrame = 0;
let sparkLastTime = 0;
let lastHoverSpark = 0;

function resizeSparkCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  sparkCanvas.width = window.innerWidth * ratio;
  sparkCanvas.height = window.innerHeight * ratio;
  sparkCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function burst(x, y, count, power = 1) {
  if (prefersReducedMotion) return;

  for (let i = 0; i < count; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(90, 340) * power;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 120 * power, // bias upwards a little
      radius: randomBetween(1.6, 4.2),
      life: 1,
      fadeSpeed: randomBetween(1.1, 2.1),
      color: pickOne(SPARK_COLORS),
    });
  }

  // start the animation loop if it isn't already running
  if (!sparkFrame) {
    sparkLastTime = performance.now();
    sparkFrame = requestAnimationFrame(drawSparks);
  }
}

function drawSparks(now) {
  const dt = Math.min(0.04, (now - sparkLastTime) / 1000);
  sparkLastTime = now;

  sparkCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  sparks = sparks.filter(spark => spark.life > 0);

  for (const spark of sparks) {
    spark.vy += 700 * dt; // gravity
    spark.vx *= 0.985;    // a little air drag
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.life -= spark.fadeSpeed * dt;

    sparkCtx.globalAlpha = Math.max(spark.life, 0);
    sparkCtx.fillStyle = spark.color;
    sparkCtx.shadowColor = spark.color;
    sparkCtx.shadowBlur = 10;
    sparkCtx.beginPath();
    sparkCtx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
    sparkCtx.fill();
  }

  sparkCtx.globalAlpha = 1;
  sparkCtx.shadowBlur = 0;

  if (sparks.length > 0) {
    sparkFrame = requestAnimationFrame(drawSparks);
  } else {
    sparkFrame = 0;
    sparkCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

resizeSparkCanvas();
window.addEventListener('resize', resizeSparkCanvas);

document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  if (!event.target.closest('.fx')) return;

  // don't spawn sparks on every single mouse event
  const now = performance.now();
  if (now - lastHoverSpark < 45) return;
  lastHoverSpark = now;

  burst(event.clientX, event.clientY, 2, 0.45);
});

document.addEventListener('pointerdown', event => {
  if (event.target.closest('.fx')) {
    burst(event.clientX, event.clientY, 26, 1);
  }
});
