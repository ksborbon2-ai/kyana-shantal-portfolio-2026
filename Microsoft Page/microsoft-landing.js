const motionSections = [...document.querySelectorAll(".motion-section")];
const motionCards = [...document.querySelectorAll(".motion-card")];
const campaignSection = document.querySelector(".campaign-grid");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  motionSections.forEach((section, index) => {
    section.style.setProperty("--motion-order", String(index));
    revealObserver.observe(section);
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const smooth = (value) => value * value * (3 - 2 * value);

  const stackStyle = [
    { rotate: -8.5, scale: 0.96, layer: 4, jitterX: -14, jitterY: 10 },
    { rotate: 6.5, scale: 1.0, layer: 6, jitterX: 0, jitterY: 0 },
    { rotate: -5.5, scale: 0.98, layer: 5, jitterX: 16, jitterY: -12 },
  ];

  const openState = [
    { x: -8, y: -10, rotate: -1 },
    { x: 12, y: 10, rotate: 0.8 },
    { x: -16, y: -18, rotate: -1.2 },
  ];

  const updateCardMotion = () => {
    if (!campaignSection) return;

    const viewportHeight = window.innerHeight || 1;
    const viewportWidth = window.innerWidth || 1;
    const sectionRect = campaignSection.getBoundingClientRect();
    const enter = clamp((viewportHeight - sectionRect.top) / (viewportHeight * 0.75), 0, 1);
    const exit = clamp(sectionRect.bottom / (viewportHeight * 0.8), 0, 1);
    const active = smooth(Math.min(enter, exit));

    const targetX = sectionRect.left + sectionRect.width * 0.5;
    const targetY = sectionRect.top + Math.min(sectionRect.height * 0.42, viewportHeight * 0.6);

    motionCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;
      const centered = (currentCenterY - viewportHeight / 2) / viewportHeight;
      const drift = clamp(centered, -1, 1);

      const stack = stackStyle[index] || stackStyle[0];
      const open = openState[index] || openState[0];

      const stackX = targetX - currentCenterX + stack.jitterX;
      const stackY = targetY - currentCenterY + stack.jitterY;
      const openX = open.x + drift * -10;
      const openY = open.y + drift * -18;
      const openRotate = open.rotate + drift * (index % 2 === 0 ? -0.8 : 0.8);

      const x = lerp(stackX, openX, active);
      const y = lerp(stackY, openY, active);
      const rotate = lerp(stack.rotate, openRotate, active);
      const scale = lerp(stack.scale, 1 - Math.abs(drift) * 0.01, active);
      const opacity = lerp(0.72, 1, active);
      const blur = lerp(3.5, 0, active);
      const layer = active < 0.78 ? stack.layer : 10 + index;

      card.style.setProperty("--card-shift-x", `${x.toFixed(2)}px`);
      card.style.setProperty("--card-shift-y", `${y.toFixed(2)}px`);
      card.style.setProperty("--card-rotate", `${rotate.toFixed(2)}deg`);
      card.style.setProperty("--card-scale", scale.toFixed(3));
      card.style.setProperty("--card-opacity", opacity.toFixed(3));
      card.style.setProperty("--card-blur", `${blur.toFixed(2)}px`);
      card.style.setProperty("--card-layer", String(layer));
    });
  };

  let ticking = false;

  const requestMotionUpdate = () => {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      updateCardMotion();
      ticking = false;
    });
  };

  updateCardMotion();
  window.addEventListener("scroll", requestMotionUpdate, { passive: true });
  window.addEventListener("resize", requestMotionUpdate);
}
