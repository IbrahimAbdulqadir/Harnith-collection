/* ==========================================================================
   HARNITH COLLECTION — store.js
   Loads the product catalog and holds shared render/format/cart/wishlist
   helpers, plus the site chrome that every page gets for free just by
   including this file: theme toggle, scroll progress, back-to-top, the
   cart drawer, the wishlist drawer, and the product quick-view modal.
   Data source priority: localStorage (admin edits) → products.json (seed).
   This is what makes the "admin panel" meaningful on a static host —
   changes made in /admin persist in the browser that made them, and can
   be exported to a real products.json file to commit to GitHub.
   ========================================================================== */

const STORAGE_KEY = "harnith_products_v1";
const CART_KEY = "harnith_cart_v1";
const WISHLIST_KEY = "harnith_wishlist_v1";
const SETTINGS_KEY = "harnith_settings_v1";
const THEME_KEY = "harnith_theme_v1";

// Cache of the last-loaded product list, so quick-view and other
// on-demand UI can look a product up by id without re-fetching.
let __productsCache = [];

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
    try {
      __productsCache = JSON.parse(local);
      return __productsCache;
    } catch (e) { /* fall through */ }
  }
  const res = await fetch("assets/data/products.json");
  const data = await res.json();
  __productsCache = data;
  return data;
}

// Used by pages nested one level deep (e.g. /admin/index.html)
async function loadProductsFrom(path) {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      __productsCache = JSON.parse(local);
      return __productsCache;
    } catch (e) { /* fall through */ }
  }
  const res = await fetch(path);
  const data = await res.json();
  __productsCache = data;
  return data;
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  __productsCache = products;
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

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
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
  unisex: `<svg viewBox="0 0 34 22" width="19" height="12" fill="currentColor"><circle cx="8" cy="4.4" r="2.3"/><path d="M5.3 8h5.4l.9 5.6h-2L9 20h-1.8l-.5-6.4-.5 6.4H4.4l.4-6.4h-2z"/><circle cx="26" cy="4.4" r="2.3"/><path d="M22.6 8h6.8l1.5 5.8h-2.6l.4 4.9h-1.8l-.8-3.6-.8 3.6h-1.8l.4-4.9h-2.6z"/><rect x="12.5" y="10.5" width="9" height="1.6" rx="0.8"/></svg>`,

  heart: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.2s-7.6-4.6-10-9.3C0.4 7.6 2 4 5.6 3.4c2-.3 3.9.6 5 2.3l1.4 2 1.4-2c1.1-1.7 3-2.6 5-2.3C22 4 23.6 7.6 22 10.9c-2.4 4.7-10 9.3-10 9.3z"/></svg>`,

  eye: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>`,

  sun: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"/></svg>`,

  moon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.6 15.3A8.7 8.7 0 1 1 8.7 3.4a7 7 0 0 0 11.9 11.9z"/></svg>`,

  close: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>`,

  up: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>`,

  bag: `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`
};

function genderMeta(gender) {
  if (gender === "unisex") return { label: "Unisex", icon: ICONS.unisex, cls: "unisex" };
  if (gender === "women") return { label: "Women", icon: ICONS.women, cls: "women" };
  return { label: "Men", icon: ICONS.men, cls: "men" };
}

// Stock is a simple front-end display field, not a live-decremented
// inventory count — this is a static-JSON catalog with no server to be the
// single source of truth, so two shoppers could still both "order" the
// last unit. Real inventory locking needs the backend this MVP doesn't
// have yet. Treat missing `stock` as unlimited (undefined check), so
// existing catalogs without the field don't accidentally show sold out.
function inStock(p) {
  return p.stock === undefined || p.stock > 0;
}
function isLowStock(p) {
  return typeof p.stock === "number" && p.stock > 0 && p.stock <= 3;
}

function productCardHTML(p, imgBase = "") {
  const g = genderMeta(p.gender);
  const liked = isWishlisted(p.id);
  const soldOut = !inStock(p);
  return `
    <a class="product-card product-link${soldOut ? " sold-out" : ""}" href="${imgBase}product.html?id=${p.id}">
      <span class="punch"></span>
      ${p.flagship && !soldOut ? '<span class="flagship-flag">Flagship</span>' : ""}
      <span class="gender-chip ${g.cls}">${g.icon}${g.label}</span>
      <button type="button" class="wishlist-btn${liked ? " active" : ""}" data-wishlist="${p.id}" aria-label="Save ${p.name} to wishlist" aria-pressed="${liked}">${ICONS.heart}</button>
      <div class="product-thumb">
        <img src="${imgBase}${p.image}" alt="${p.name}" loading="lazy"
          onload="this.classList.add('loaded')"
          onerror="this.onerror=null;this.src='${imgBase}assets/images/products/placeholder.svg';this.classList.add('loaded')">
        ${soldOut
          ? '<span class="stock-badge">Sold out</span>'
          : `<button type="button" class="quick-view-btn" data-quickview="${p.id}">${ICONS.eye} Quick view</button>`}
      </div>
      <div class="product-info">
        <p class="p-cat">${categoryLabel(p.category)}</p>
        <h3 class="p-name">${p.name}</h3>
        <p class="p-price">${formatPrice(p.price)}</p>
      </div>
    </a>`;
}

// Placeholder cards shown while loadProducts() is in flight, so a grid
// never sits on a blank white rectangle during the fetch.
function skeletonGridHTML(count = 8) {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += `
      <div class="skeleton-card">
        <div class="skeleton-thumb"></div>
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-line w-40"></div>
      </div>`;
  }
  return out;
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
  renderCartDrawer();
  openCartDrawer();
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
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

/* ---------------- Wishlist ---------------- */

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch (e) { return []; }
}

function saveWishlist(ids) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  updateWishlistCount();
}

function isWishlisted(id) {
  return getWishlist().includes(id);
}

function toggleWishlist(id) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  const nowActive = idx === -1;
  if (nowActive) list.push(id); else list.splice(idx, 1);
  saveWishlist(list);
  return nowActive;
}

function updateWishlistCount() {
  document.querySelectorAll("[data-wishlist-count]").forEach(el => {
    el.textContent = getWishlist().length;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

/* ---------------- Theme ---------------- */

function applyTheme(theme) {
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.innerHTML = theme === "dark" ? ICONS.sun : ICONS.moon;
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  });
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  applyTheme(stored === "dark" ? "dark" : "light");
}

/* ---------------- Page chrome: injected once per page load ----------------
   Everything here is generated in JS rather than hand-written into every
   HTML file, so the whole storefront gets the same header controls, cart
   drawer, wishlist drawer, quick-view modal, scroll progress bar and
   back-to-top button just by including this one script. */

function injectChrome() {
  const isStorefront = !!document.querySelector(".site-header");

  // Scroll progress bar
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrolled / max, 1) : 0})`;
    backToTop.classList.toggle("show", scrolled > 480);
  };

  // Back to top
  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = ICONS.up;
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(backToTop);

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!isStorefront) return;

  // Theme toggle + wishlist entry point + cart link, grouped into one
  // wrapper so the compact mobile header (which flattens .header-actions
  // with display:contents to split the search box onto its own row) can
  // place all three icons as a single grid item instead of three
  // independently-placed ones that would overlap in the same cell.
  const cartLink = document.querySelector(".cart-link");
  if (cartLink) {
    const iconsWrap = document.createElement("div");
    iconsWrap.className = "header-icons";
    cartLink.insertAdjacentElement("beforebegin", iconsWrap);

    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "icon-btn theme-toggle";
    iconsWrap.appendChild(themeBtn);

    const wishlistLink = document.createElement("a");
    wishlistLink.href = "#";
    wishlistLink.className = "wishlist-link";
    wishlistLink.innerHTML = `${ICONS.heart} <span class="wishlist-count" data-wishlist-count>0</span>`;
    iconsWrap.appendChild(wishlistLink);

    iconsWrap.appendChild(cartLink);
  }
  applyTheme(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");
  updateWishlistCount();

  // Cart drawer
  const cartOverlay = document.createElement("div");
  cartOverlay.className = "cart-drawer-overlay";
  cartOverlay.id = "cart-drawer-overlay";
  const cartDrawer = document.createElement("aside");
  cartDrawer.className = "cart-drawer";
  cartDrawer.id = "cart-drawer";
  cartDrawer.setAttribute("aria-label", "Shopping cart");
  cartDrawer.innerHTML = `
    <div class="cart-drawer-header">
      <h3>Your bag</h3>
      <button type="button" class="cart-drawer-close" data-close-cart aria-label="Close cart">${ICONS.close}</button>
    </div>
    <div class="cart-drawer-body" id="cart-drawer-body"></div>
    <div class="cart-drawer-footer" id="cart-drawer-footer"></div>`;
  document.body.append(cartOverlay, cartDrawer);

  // Wishlist drawer
  const wishOverlay = document.createElement("div");
  wishOverlay.className = "cart-drawer-overlay";
  wishOverlay.id = "wishlist-drawer-overlay";
  const wishDrawer = document.createElement("aside");
  wishDrawer.className = "cart-drawer";
  wishDrawer.id = "wishlist-drawer";
  wishDrawer.setAttribute("aria-label", "Saved items");
  wishDrawer.innerHTML = `
    <div class="cart-drawer-header">
      <h3>Saved pieces</h3>
      <button type="button" class="cart-drawer-close" data-close-wishlist aria-label="Close saved items">${ICONS.close}</button>
    </div>
    <div class="cart-drawer-body" id="wishlist-drawer-body"></div>`;
  document.body.append(wishOverlay, wishDrawer);

  // Quick view modal
  const qvOverlay = document.createElement("div");
  qvOverlay.className = "modal-overlay";
  qvOverlay.id = "quick-view-overlay";
  qvOverlay.innerHTML = `
    <div class="quick-view-modal" id="quick-view-modal" role="dialog" aria-modal="true">
      <button type="button" class="qv-close" data-close-quickview aria-label="Close quick view">${ICONS.close}</button>
      <div id="quick-view-content"></div>
    </div>`;
  document.body.appendChild(qvOverlay);

  renderCartDrawer();
}

/* ---------------- Cart drawer rendering ---------------- */

function renderCartDrawer() {
  const body = document.getElementById("cart-drawer-body");
  const footer = document.getElementById("cart-drawer-footer");
  if (!body || !footer) return;
  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-drawer-empty">
        ${ICONS.bag}
        <p>Your bag is empty.</p>
        <a href="shop.html" class="btn btn-primary">Start shopping</a>
      </div>`;
    footer.innerHTML = "";
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-drawer-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cdi-info">
        <div class="cdi-name">${item.name}</div>
        <div class="cdi-meta">Size ${item.size}</div>
        <div class="cdi-row">
          <div class="qty-control">
            <button type="button" data-drawer-action="minus" data-id="${item.id}" data-size="${item.size}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-drawer-action="plus" data-id="${item.id}" data-size="${item.size}">+</button>
          </div>
          <span class="cdi-price">${formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
      <button type="button" class="cart-remove" data-drawer-action="remove" data-id="${item.id}" data-size="${item.size}" aria-label="Remove ${item.name}">${ICONS.close}</button>
    </div>
  `).join("");

  footer.innerHTML = `
    <div class="row"><span>Subtotal</span><span>${formatPrice(cartTotal())}</span></div>
    <a href="checkout.html" class="btn btn-primary btn-full">Checkout</a>
    <a href="cart.html" class="btn btn-outline btn-full">View full cart</a>`;
}

function renderWishlistDrawer() {
  const body = document.getElementById("wishlist-drawer-body");
  if (!body) return;
  const ids = getWishlist();
  const items = __productsCache.filter(p => ids.includes(p.id));

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-drawer-empty">
        ${ICONS.heart}
        <p>Nothing saved yet.</p>
        <a href="shop.html" class="btn btn-primary">Browse the collection</a>
      </div>`;
    return;
  }

  body.innerHTML = items.map(p => `
    <div class="cart-drawer-item">
      <img src="${p.image}" alt="${p.name}">
      <div class="cdi-info">
        <div class="cdi-name">${p.name}</div>
        <div class="cdi-meta">${formatPrice(p.price)}</div>
        <div class="cdi-row">
          <a href="product.html?id=${p.id}" class="qv-view-full">View item</a>
        </div>
      </div>
      <button type="button" class="cart-remove" data-drawer-action="unsave" data-id="${p.id}" aria-label="Remove ${p.name} from saved">${ICONS.close}</button>
    </div>
  `).join("");
}

/* ---------------- Drawer / modal open-close ---------------- */

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById("cart-drawer")?.classList.add("open");
  document.getElementById("cart-drawer-overlay")?.classList.add("open");
}
function closeCartDrawer() {
  document.getElementById("cart-drawer")?.classList.remove("open");
  document.getElementById("cart-drawer-overlay")?.classList.remove("open");
}

function openWishlistDrawer() {
  renderWishlistDrawer();
  document.getElementById("wishlist-drawer")?.classList.add("open");
  document.getElementById("wishlist-drawer-overlay")?.classList.add("open");
}
function closeWishlistDrawer() {
  document.getElementById("wishlist-drawer")?.classList.remove("open");
  document.getElementById("wishlist-drawer-overlay")?.classList.remove("open");
}

function renderQuickView(p) {
  const g = genderMeta(p.gender);
  const content = document.getElementById("quick-view-content");
  if (!content) return;
  const soldOut = !inStock(p);
  content.innerHTML = `
    <div class="qv-grid">
      <div class="qv-gallery"><img src="${p.image}" alt="${p.name}"></div>
      <div class="qv-info">
        <span class="eyebrow">${categoryLabel(p.category)} · <span class="pd-gender-icon">${g.icon}</span>${g.label}</span>
        <h2>${p.name}</h2>
        <div class="pd-price">${formatPrice(p.price)}</div>
        <p class="pd-desc">${p.description || ""}</p>
        ${soldOut ? '<p class="sold-out-note">Currently sold out.</p>' : ""}
        ${isLowStock(p) ? `<p class="low-stock-note">Only ${p.stock} left</p>` : ""}
        <span class="size-label">Select size</span>
        <div class="size-grid" id="qv-size-grid">
          ${p.sizes.map(s => `<button type="button" class="size-opt" data-qv-size="${s}" ${soldOut ? "disabled" : ""}>${s}</button>`).join("")}
        </div>
        <button class="btn btn-primary btn-full" id="qv-add-btn" data-qv-add="${p.id}" ${soldOut ? "disabled" : ""}>${soldOut ? "Sold out" : "Add to cart"}</button>
        <a href="product.html?id=${p.id}" class="qv-view-full">View full details →</a>
      </div>
    </div>`;
}

function openQuickView(id) {
  const p = __productsCache.find(x => x.id === id);
  if (!p) return;
  renderQuickView(p);
  document.getElementById("quick-view-overlay")?.classList.add("open");
}
function closeQuickView() {
  document.getElementById("quick-view-overlay")?.classList.remove("open");
}

function closeAllOverlays() {
  closeCartDrawer();
  closeWishlistDrawer();
  closeQuickView();
}

/* ---------------- Global event delegation ----------------
   One listener set handles every dynamically-rendered control (product
   cards get re-rendered on every search/filter, drawers get re-rendered
   on every cart change) instead of rebinding listeners after each render. */

function setupGlobalEvents() {
  document.addEventListener("click", (e) => {
    const themeBtn = e.target.closest(".theme-toggle");
    if (themeBtn) { toggleTheme(); return; }

    const wishBtnCard = e.target.closest("[data-wishlist]");
    if (wishBtnCard) {
      e.preventDefault();
      e.stopPropagation();
      const id = wishBtnCard.dataset.wishlist;
      const nowActive = toggleWishlist(id);
      wishBtnCard.classList.toggle("active", nowActive);
      wishBtnCard.classList.add("pop");
      wishBtnCard.setAttribute("aria-pressed", String(nowActive));
      setTimeout(() => wishBtnCard.classList.remove("pop"), 400);
      showToast(nowActive ? "Saved to wishlist" : "Removed from wishlist");
      return;
    }

    const qvBtn = e.target.closest("[data-quickview]");
    if (qvBtn) {
      e.preventDefault();
      e.stopPropagation();
      openQuickView(qvBtn.dataset.quickview);
      return;
    }

    const qvSize = e.target.closest("[data-qv-size]");
    if (qvSize) {
      document.querySelectorAll("#qv-size-grid .size-opt").forEach(b => b.classList.remove("selected"));
      qvSize.classList.add("selected");
      return;
    }

    const qvAdd = e.target.closest("[data-qv-add]");
    if (qvAdd) {
      const id = qvAdd.dataset.qvAdd;
      const selected = document.querySelector("#qv-size-grid .size-opt.selected");
      if (!selected) { showToast("Pick a size first"); return; }
      const p = __productsCache.find(x => x.id === id);
      if (p) {
        addToCart(p, selected.dataset.qvSize, 1);
        closeQuickView();
      }
      return;
    }

    const cartLinkEl = e.target.closest(".cart-link");
    if (cartLinkEl && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      openCartDrawer();
      return;
    }

    const wishLinkEl = e.target.closest(".wishlist-link");
    if (wishLinkEl) {
      e.preventDefault();
      openWishlistDrawer();
      return;
    }

    if (e.target.closest("[data-close-cart]") || e.target.id === "cart-drawer-overlay") { closeCartDrawer(); return; }
    if (e.target.closest("[data-close-wishlist]") || e.target.id === "wishlist-drawer-overlay") { closeWishlistDrawer(); return; }
    if (e.target.closest("[data-close-quickview]") || e.target.id === "quick-view-overlay") { closeQuickView(); return; }

    const drawerAction = e.target.closest("[data-drawer-action]");
    if (drawerAction) {
      const { drawerAction: action, id, size } = drawerAction.dataset;
      if (action === "unsave") {
        toggleWishlist(id);
        renderWishlistDrawer();
        return;
      }
      const cart = getCart();
      const item = cart.find(i => i.id === id && i.size === size);
      if (action === "remove") removeFromCart(id, size);
      else if (item) updateCartQty(id, size, action === "plus" ? item.qty + 1 : item.qty - 1);
      renderCartDrawer();
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllOverlays();
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
  initTheme();
  updateCartCount();
  updateWishlistCount();
  injectHeaderIcons();
  injectChrome();
  setupGlobalEvents();
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

/* ---------------- Scroll reveal ----------------
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
      until the visitor scrolls to it, same as before. */

document.addEventListener("DOMContentLoaded", () => {
  observeReveal();
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

/* ---------------- Sticky mobile add-to-cart bar (product page) ----------------
   Call from product.html once the real "Add to cart" button exists. Shows
   a fixed bottom bar with the same product info once the real button has
   scrolled out of view, so a shopper who's scrolled down to read sizing
   info doesn't have to scroll back up to buy. */
function setupStickyCTA(product) {
  const realBtn = document.getElementById("add-to-cart-btn");
  if (!realBtn || !product || !inStock(product)) return;

  let bar = document.querySelector(".mobile-cta");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "mobile-cta";
    bar.innerHTML = `
      <img src="${product.image}" alt="">
      <div class="mc-info">
        <div class="mc-name">${product.name}</div>
        <div class="mc-price">${formatPrice(product.price)}</div>
      </div>
      <button type="button" class="btn btn-primary">Add to cart</button>`;
    bar.querySelector("button").addEventListener("click", () => realBtn.click());
    document.body.appendChild(bar);
  }

  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(([entry]) => {
    bar.classList.toggle("show", !entry.isIntersecting && window.innerWidth <= 900);
  }, { threshold: 0 });
  observer.observe(realBtn);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) bar.classList.remove("show");
  });
}
