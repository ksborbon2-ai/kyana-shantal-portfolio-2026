const revealItems = [...document.querySelectorAll(".reveal")];
const sections = [...document.querySelectorAll("[data-section]")];

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-order", String(index % 4));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const setSectionProgress = () => {
  const viewportHeight = window.innerHeight;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const total = rect.height + viewportHeight;
    const visible = Math.min(Math.max(viewportHeight - rect.top, 0), total);
    const progress = total === 0 ? 0 : visible / total;
    section.style.setProperty("--section-progress", progress.toFixed(3));
  });
};

let ticking = false;

const onScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      setSectionProgress();
      ticking = false;
    });
    ticking = true;
  }
};

setSectionProgress();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", setSectionProgress);
