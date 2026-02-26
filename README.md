# MALFUFA — Salla Theme (Twilight Engine)

Custom bakery theme built for Salla platform using the Twilight (Twig) theme engine.

## FEATURES
- Delivery / Pickup tab toggle in header
- Address selector with dropdown search
- EN / Arabic language switcher with full RTL support
- Cart icon with live count (uses Salla cart events)
- Scroll-linked canvas animation (image sequence hero)
- Featured products grid
- Story / About section
- Categories section
- Product single page
- Cart page
- Footer with app store links + payment badges

---

## FOLDER STRUCTURE

```
malfufa-salla/
├── src/
│   ├── assets/
│   │   ├── js/
│   │   │   ├── theme.js            ← Header, cart, address, qty logic
│   │   │   └── scroll-animation.js ← Canvas frame animation
│   │   └── styles/
│   │       └── theme.css           ← All styles (+ RTL)
│   └── views/
│       ├── components/
│       │   ├── header/
│       │   │   └── header.twig     ← Header component
│       │   ├── footer/
│       │   │   └── footer.twig     ← Footer component
│       │   └── home/
│       │       ├── scroll-animation.twig
│       │       └── featured-products.twig
│       ├── layouts/
│       │   └── master.twig         ← Master layout (all pages extend this)
│       └── pages/
│           ├── index.twig          ← Homepage
│           ├── cart.twig           ← Cart page
│           └── product/
│               └── single.twig     ← Product page
├── locales/
│   ├── en.json                     ← English strings
│   └── ar.json                     ← Arabic strings
├── twilight.json                   ← Theme manifest & settings
└── package.json
```

---

## HOW TO USE ON SALLA

### Step 1 — Create a Salla Partner Account
Go to: https://partners.salla.sa → Sign up as a developer

### Step 2 — Install Salla CLI
```bash
npm install -g @salla.sa/cli
```

### Step 3 — Link your GitHub
- In Salla Partners Portal → connect your GitHub account
- Create a new theme → it will create a GitHub repo

### Step 4 — Clone and replace files
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_THEME_REPO.git
cd YOUR_THEME_REPO
# Copy all files from this zip into the repo, replacing defaults
git add .
git commit -m "MALFUFA theme initial"
git push
```

### Step 5 — Preview
```bash
salla theme preview
```

### Step 6 — Publish to a store
From Salla Partners Portal → select your theme → Preview on demo store → Publish

---

## SCROLL ANIMATION SETUP

1. Upload your frame images (frame_001.jpg ... frame_060.jpg) via:
   Salla Admin → Store Files (or use a CDN like Cloudinary / Bunny.net)

2. Get the base URL of your uploaded frames.
   Example: https://cdn.example.com/malfufa-frames/

3. In Salla Theme Editor → Theme Settings:
   - Find the field "Frame Images CDN Base URL"
   - Paste: https://cdn.example.com/malfufa-frames/
   - Set "Animation Frame Count" to match your actual number of frames

   OR edit twilight.json directly:
   ```json
   { "id": "hero_cdn_url", "default": "https://your-cdn.com/frames/" }
   ```

---

## CUSTOMIZING COLORS

In `src/assets/styles/theme.css` edit the CSS variables at the top:
```css
:root {
  --color-dark: #1c2b1e;   /* Header/footer background — change to your brand color */
  --color-accent: #c8a96e; /* Gold accent — change to match your logo */
  --color-bg: #faf8f3;     /* Page background */
}
```

---

## KEY DIFFERENCES — Shopify vs Salla

| Shopify (Liquid)               | Salla (Twig)                        |
|-------------------------------|-------------------------------------|
| `{{ 'key' | t }}`              | `{{ trans('key') }}`                |
| `{{ cart.item_count }}`        | `{{ cart.count }}`                  |
| `{{ product.url }}`            | `{{ product.url }}`                 |
| `{{ product.price | money }}`  | `{{ product.price.amount | currency }}` |
| `{% section 'header' %}`       | `{% include 'components/header/header.twig' %}` |
| `{{ 'file.css' | asset_url }}`  | `{{ 'styles/theme.css' | asset }}`  |
| `{{ request.locale.iso_code }}`| `{{ app.locale.code }}`             |

---

Built with ♥ for MALFUFA Bakery
