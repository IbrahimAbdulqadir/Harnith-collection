/* ==========================================================================
   HARNITH COLLECTION — reveal.js
   Two motion systems live here:

   1. Section reveal (.reveal) — simple fade-up for section headers, the
      about block, cart/checkout panels. Fires once, first time it scrolls
      into view.

   2. Product grid entrance — every .product-grid's cards alternate sliding
      in from left/right instead of just fading up. Call
      revealProductGrid(gridElement) any time a grid's innerHTML changes:
      on first load, and again every time a search or filter re-renders it.
      If the grid is already visible on screen when you call it, it plays
      immediately ("arrives on call"). If it's below the fold, it waits
      until the visitor scrolls to it, same as before.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach(el => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  targets.forEach(el => observer.observe(el));
});

// Re-scan for .reveal elements added after the initial page load.
function observeReveal(selector = ".reveal, .reveal-left, .reveal-right") {
  const els = document.querySelectorAll(selector);
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => observer.observe(el));
}

/* ---------------- Product grid entrance ---------------- */

// Plays the alternating left/right entrance on every card in the grid,
// right now. Safe to call repeatedly on the same grid (e.g. every keystroke
// of a search box) — each call restarts the animation cleanly.
function animateProductGrid(container) {
  if (!container) return;
  const cards = container.querySelectorAll(".product-card");
  cards.forEach((card, i) => {
    card.classList.remove("enter-left", "enter-right");
    card.style.animationDelay = "";
    void card.offsetWidth; // force reflow so re-adding the class replays it
    const fromLeft = i % 2 === 0;
    card.style.animationDelay = Math.min(i, 9) * 55 + "ms";
    card.classList.add(fromLeft ? "enter-left" : "enter-right");
  });
}

// Call this after setting a product grid's innerHTML. If the grid is
// already on screen it animates immediately; otherwise it waits until the
// visitor scrolls to it.
function revealProductGrid(container) {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

  if (alreadyVisible || !("IntersectionObserver" in window)) {
    animateProductGrid(container);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateProductGrid(container);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
  observer.observe(container);
}
