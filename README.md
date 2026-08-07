# Harnith Collection — Store Site

A static e-commerce site for Harnith Collection (men's and women's sweatpants,
office trousers, collar shirts, sneakers, and thrift pieces), built to run
free on GitHub Pages with no domain and no server.

## 1. What's in this folder

```
harnith-collection/
├── index.html              Homepage — hero + flagship products
├── shop.html                Full catalog with search, filters, flagship-first sort
├── product.html              Single product page — sizes, quantity, add to cart
├── cart.html                  Cart — view/edit/remove items, running total
├── checkout.html            Shipping form + payment (currently a demo stub)
├── admin/
│   └── index.html            Admin panel — add/edit/delete products
├── assets/
│   ├── css/style.css         All styling
│   ├── js/store.js           Product loading, cart logic, search/filter, render helpers
│   ├── data/products.json    The product catalog (the actual source of truth)
│   └── images/products/      Product photos go here
└── README.md                 This file
```

There's no build step. No npm, no framework, no compiling. Every page is
plain HTML that pulls in `style.css` and `store.js`. That's deliberate —
it's what makes GitHub Pages hosting possible for free.

## 2. The one thing to understand about hosting this on GitHub Pages

GitHub Pages serves static files only — HTML, CSS, JS, images. There's no
server running behind it, no database, no PHP. That has real consequences:

- **Cart** works fully — it's stored in the visitor's browser (localStorage),
  not on a server. It's real, it just doesn't follow the customer to a
  different device.
- **Admin panel** lets you actually add/edit/delete products, but changes
  save to your browser, not to a shared database. You export the updated
  `products.json` and commit it to GitHub so the change goes live for
  everyone (step-by-step below).
- **Payment gateway** cannot go live on GitHub Pages at all, even with real
  keys, because verifying a payment requires a secret key that must live on
  a server, never in frontend code that anyone can view-source. The checkout
  page is fully built and wired for Paystack, just switched off — see
  section 6.

None of this is a shortcut taken because it's "just a demo" — it's the
actual ceiling of what free static hosting can do. When Harnith Collection
is ready to take real orders, the move is to point this same frontend at a
small backend (Node, or the PHP/MySQL stack from your other catalogue
project) on a few-dollars-a-month host. Nothing about the design or the
pages themselves needs to change.

## 3. Local setup (before you push anything)

You don't need XAMPP for this one, since there's no PHP. You just need to
view the files through a local server (not by double-clicking index.html —
the `fetch()` call that loads products.json won't work from a `file://`
path).

**Option A — VS Code Live Server extension**
1. Open the `harnith-collection` folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` → "Open with Live Server".

**Option B — Python (already usually installed)**
```
cd harnith-collection
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

Either way, you should see the homepage with the flagship products loading.

## 4. Adding her real product photos

Right now every product points at
`assets/images/products/placeholder.svg`, a plain "image pending" tag so
nothing looks broken. To swap in the real Pinterest photos:

1. Save the images into `assets/images/products/` — name them something
   sane, e.g. `sweatpants-men-01.jpg`.
2. Open `assets/data/products.json`, find the product, change its
   `"image"` field to the new filename, e.g.
   `"assets/images/products/sweatpants-men-01.jpg"`.
3. Refresh the site.

One image slot outside the product grid, same idea, but read this one twice
because a mismatch here is the single most common way this breaks:
- **Hero background** — `assets/images/hero-bg.svg`.
  1. Delete `assets/images/hero-bg.svg`.
  2. Add your real photo into `assets/images/`, name it **exactly**
     `hero-bg` followed by its real extension — e.g. `hero-bg.jpg` or
     `hero-bg.png`.
  3. Open `assets/css/style.css`, find the `.hero` rule near the top, and
     change this one line so the filename matches exactly what you just
     added:
     ```css
     background: var(--charcoal) url("../images/hero-bg.svg") center/cover no-repeat;
     ```
     becomes, for example:
     ```css
     background: var(--charcoal) url("../images/hero-bg.jpg") center/cover no-repeat;
     ```
  If you skip step 3, or the filename doesn't match exactly (including the
  extension), the browser silently falls back to the plain charcoal color
  with no image and no error on screen — it won't look broken, it'll just
  look like there's no photo at all. If this happens: open the browser's
  dev tools (F12) → Network tab → reload the page → look for `hero-bg` in
  the list. A red/404 line means the filename in the CSS doesn't match the
  actual file on disk.

A quick note on the Pinterest images: they're someone else's photography.
Fine for mockup/demo purposes while you're building this out with her, but
before this goes live and starts making sales, she'll want either her own
product photos or images she has explicit rights to use — Pinterest images
carry real copyright risk for a live business.

## 5. Using the admin panel

Go to `admin/index.html` (or click "Admin" if you link it somewhere).

- **Edit / Delete** — changes save to your browser's localStorage
  immediately, and the storefront pages (`shop.html`, `index.html`, etc.)
  will read from that saved copy instead of the original `products.json`
  the moment you make an edit.
- **New product** — same thing, adds to that local copy.
- **Export products.json** — downloads the current state of the catalog.
  Replace `assets/data/products.json` in your project with the downloaded
  file, then commit and push. That's what makes an admin change visible to
  every visitor, not just your browser.

This two-step "edit locally → export → commit" flow is the tradeoff for
free static hosting. It's slower than a live database, but it costs nothing
to run and needs no server maintenance — reasonable for a store still
finding its feet.

## 6. Turning on real payments later

`checkout.html` has a commented block showing exactly how to wire in
Paystack once Harnith has:
- A real Paystack (or Flutterwave) merchant account
- A live public key
- A small backend to verify the payment server-side (this is the part that
  genuinely needs real hosting, not GitHub Pages)

Until then, "Place demo order" just confirms the flow works and clears
nothing — no money moves, no order is actually created.

## 7. Deploying to GitHub Pages

1. Create a new repository on GitHub, e.g. `harnith-collection`.
2. Push this folder's contents to it:
   ```
   git init
   git add .
   git commit -m "Initial store build"
   git branch -M main
   git remote add origin https://github.com/<your-username>/harnith-collection.git
   git push -u origin main
   ```
3. On GitHub: Settings → Pages → Source → deploy from `main` branch, root
   folder.
4. The site goes live at
   `https://<your-username>.github.io/harnith-collection/`.

Every time you push a change (new products, updated images, a swapped
logo), the live site updates within a minute or two automatically.

## 8. What's still a placeholder

- **Logo** — there's no logo file yet, so the header uses a text wordmark
  ("Harnith Collection") styled in the display font instead. The moment
  she has a real logo, drop it into `assets/images/` and swap the `.logo`
  element in each HTML file's header for an `<img>` tag.
- **Product photos** — placeholder tag graphic until real photos are added
  (section 4).
- **Payment** — stubbed and clearly labeled (section 6).
- **Product copy** — the 16 seed products are realistic examples across all
  your categories (sweatpants, office trousers, collar shirts, sneakers,
  thrift) in both men's and women's versions, but the actual names, prices,
  and descriptions are placeholders for you to replace with her real stock
  through the admin panel or by editing `products.json` directly.

## 9. Where to go from here

Realistic next steps, roughly in order:
1. Swap in real product photos and real prices.
2. Get a first look from her, adjust colors/copy where it doesn't feel like
   the brand.
3. Once she has a logo, drop it in.
4. Push to GitHub Pages so she can see it live and share the link.
5. When she's ready to sell for real: move to paid hosting with a backend,
   connect a real payment gateway, and connect a domain if she wants one
   instead of the github.io subdomain.
