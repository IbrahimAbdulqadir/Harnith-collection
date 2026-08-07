/* ==========================================================================
   HARNITH COLLECTION — store.js
   Loads the product catalog and holds shared render/format helpers.
   Data source priority: localStorage (admin edits) → products.json (seed).
   This is what makes the "admin panel" meaningful on a static host —
   changes made in /admin persist in the browser that made them, and can
   be exported to a real products.json file to commit to GitHub.
   ========================================================================== */

const STORAGE_KEY = "harnith_products_v1";
const CART_KEY = "harnith_cart_v1";
const SETTINGS_KEY = "harnith_settings_v1";

async function loadSettings(path = "assets/data/settings.json") {
  const local = localStorage.getItem(SETTINGS_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (e) { /* fall through */ }
  }
  try {
    const res = await fetch(path);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) { return {}; }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

async function loadProducts() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (e) { /* fall through */ }
  }
  const res = await fetch("assets/data/products.json");
  const data = await res.json();
  return data;
}

// Used by pages nested one level deep (e.g. /admin/index.html)
async function loadProductsFrom(path) {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (e) { /* fall through */ }
  }
  const res = await fetch(path);
  return await res.json();
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function formatPrice(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function categoryLabel(cat) {
  const map = {
    "sweatpants": "Sweatpants",
    "office-trousers": "Office Trousers",
    "shirts": "Collar Shirts",
    "sneakers": "Sneakers",
    "thrift": "Thrift"
  };
  return map[cat] || cat;
}

/* ---------------- Icon set ----------------
   All icons use currentColor so they inherit whatever text color they're
   placed in. Gender icons are small pictograms: a straight-body figure for
   men, a flared/skirt-body figure for women, and two figures side by side
   with a small connecting bar (joined hands) for unisex. */
const ICONS = {
  cart: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M2.5 3h2.2l2 12.2a2 2 0 0 0 2 1.7h8.6a2 2 0 0 0 2-1.6l1.4-7.3H6.2"/></svg>`,

  search: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="20" y1="20" x2="15.3" y2="15.3"/></svg>`,

  men: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><circle cx="12" cy="4.6" r="2.6"/><path d="M9 9h6l1 6h-2.3L13 21h-2l-.7-6H8z"/></svg>`,

  women: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><circle cx="12" cy="4.6" r="2.6"/><path d="M8.2 9h7.6l1.7 6.5h-3l.5 5.5h-2l-.9-4-.9 4h-2l.5-5.5h-3z"/></svg>`,

  // Two small figures side by side with a short bar between their hands.
  unisex: `<svg viewBox="0 0 34 22" width="19" height="12" fill="currentColor"><circle cx="8" cy="4.4" r="2.3"/><path d="M5.3 8h5.4l.9 5.6h-2L9 20h-1.8l-.5-6.4-.5 6.4H4.4l.4-6.4h-2z"/><circle cx="26" cy="4.4" r="2.3"/><path d="M22.6 8h6.8l1.5 5.8h-2.6l.4 4.9h-1.8l-.8-3.6-.8 3.6h-1.8l.4-4.9h-2.6z"/><rect x="12.5" y="10.5" width="9" height="1.6" rx="0.8"/></svg>`
};

function genderMeta(gender) {
  if (gender === "unisex") return { label: "Unisex", icon: ICONS.unisex, cls: "unisex" };
  if (gender === "women") return { label: "Women", icon: ICONS.women, cls: "women" };
  return { label: "Men", icon: ICONS.men, cls: "men" };
}

function productCardHTML(p, imgBase = "") {
  const g = genderMeta(p.gender);
  return `
    <a class="product-card product-link" href="${imgBase}product.html?id=${p.id}">
      <span class="punch"></span>
      ${p.flagship ? '<span class="flagship-flag">Flagship</span>' : ""}
      <span class="gender-chip ${g.cls}">${g.icon}${g.label}</span>
      <div class="product-thumb">
        <img src="${imgBase}${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <p class="p-cat">${categoryLabel(p.category)}</p>
        <h3 class="p-name">${p.name}</h3>
        <p class="p-price">${formatPrice(p.price)}</p>
      </div>
    </a>`;
}

// Flagship items first, otherwise stable order
function sortFlagshipFirst(products) {
  return [...products].sort((a, b) => (b.flagship === true) - (a.flagship === true));
}

function filterProducts(products, { query, category, gender } = {}) {
  return products.filter(p => {
    if (category && category !== "all" && p.category !== category) return false;
    if (gender && gender !== "all" && p.gender !== gender) return false;
    if (query) {
      const q = query.trim().toLowerCase();
      const hay = `${p.name} ${categoryLabel(p.category)} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showToast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------------- Cart ---------------- */

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product, size, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id, name: product.name, price: product.price,
      image: product.image, size, qty
    });
  }
  saveCart(cart);
  showToast(`${product.name} (${size}) added to cart`);
}

function removeFromCart(id, size) {
  const cart = getCart().filter(i => !(i.id === id && i.size === size));
  saveCart(cart);
}

function updateCartQty(id, size, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) item.qty = Math.max(1, qty);
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cartCount();
  });
}

// Drop the shared icon set into header elements that expect them, so the
// SVG markup only has to live in one place (ICONS, above).
function injectHeaderIcons() {
  document.querySelectorAll(".cart-link").forEach(el => {
    if (el.querySelector("svg")) return; // already injected
    el.insertAdjacentHTML("afterbegin", ICONS.cart);
  });
  document.querySelectorAll(".search-box button").forEach(btn => {
    if (btn.querySelector("svg")) return;
    btn.innerHTML = ICONS.search;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  injectHeaderIcons();
  checkHeroImage();
  setupMobileNav();
});

// Mobile hamburger menu: toggles the dropdown, closes it when a link is
// tapped or when tapping anywhere outside the open menu.
function setupMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && e.target !== toggle) {
      closeNav();
    }
  });
}

// Confirms the hero background image path in CSS actually resolves to a
// real file. If it 404s, this prints a clear warning to the console instead
// of failing silently (a broken background-image shows nothing on screen,
// no visual error at all, which is easy to miss).
function checkHeroImage() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const bg = getComputedStyle(hero).backgroundImage;
  const match = bg.match(/url\(["']?(.*?)["']?\)/);
  if (!match) return;
  const url = match[1];
  const img = new Image();
  img.onerror = () => {
    console.warn(
      `[Harnith Collection] Hero background image failed to load: "${url}". ` +
      `Check that the filename in the .hero rule in style.css exactly matches ` +
      `a real file in assets/images/, including the extension.`
    );
  };
  img.src = url;
}


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
