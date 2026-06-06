# SEO Guide - DMS

> Owner: solo dev | Updated: 2026-06-06

## What was done in this pass

| Item | Status | Location |
|---|---|---|
| Title, description, keywords, robots | Done | `frontend/index.html` |
| Canonical + hreflang (en / bn / x-default) | Done | `frontend/index.html`, `frontend/src/components/SEO.jsx` |
| Open Graph + Twitter card | Done | `frontend/index.html` |
| OG image 1200×630 PNG | Done | `frontend/public/og-image.png` |
| Favicon set (16/32/180) | Done | `frontend/public/favicon-*.png`, `apple-touch-icon.png` |
| PWA manifest | Done | `frontend/public/manifest.webmanifest` |
| robots.txt | Done | `frontend/public/robots.txt` |
| sitemap.xml (en + bn alternates) | Done | `frontend/public/sitemap.xml` |
| JSON-LD: SoftwareApplication, Organization, WebSite, FAQPage | Done | `frontend/index.html` + `frontend/src/pages/Landing.jsx` |
| Per-route dynamic meta | Done | `frontend/src/components/SEO.jsx`, `RouteSeo.jsx` |
| NoJS fallback | Done | `<noscript>` block in `index.html` |
| Compression + security headers | Done | `backend/src/app.js` (helmet + compression) |
| Static asset caching (1y immutable for hashed assets) | Done | `backend/src/app.js` |
| `noindex` on private routes (`/dashboard`, `/products`, etc.) | Done | `SEO_CONFIG` map |

## Why your site was invisible before

1. **SPA shell** — your `index.html` had no `description`, no canonical, no OG, no JSON-LD. Google could still crawl the JS, but every other signal was missing.
2. **No robots.txt / sitemap** — Bing, Yandex, DuckDuckGo had no discovery path.
3. **No OG image** — when shared on Facebook/LinkedIn, your link showed a 32×32 favicon (kills CTR).
4. **No structured data** — Google can't show sitelinks, FAQ rich results, or app cards.
5. **No `noindex` on private pages** — the bot detector has a `*` catch-all that lets crawlers in to `/dashboard` etc. even though they 404 or 401. We fixed that via the `SEO_CONFIG` map (`noindex: true`).
6. **No compression** — slow TTFB hurts Core Web Vitals → ranking.

## Post-deploy checklist (do these once after redeploy)

### 1. Register properties
- **Google Search Console** — https://search.google.com/search-console
  - Add property → URL prefix → `https://dms-live.azurewebsites.net`
  - Verify via HTML file (drop the file in `frontend/public/.well-known/` and rebuild) or DNS TXT
  - Submit `sitemap.xml`
  - Request indexing for `/`, `/login`, `/register`, `/public-chat`
- **Bing Webmaster** — https://www.bing.com/webmasters (auto-imports from GSC)
- **Baidu / Yandex** — only if you target those markets

### 2. Analytics
Add **GA4** and **Microsoft Clarity** to `frontend/index.html` (replace `G-XXXXXXXX` with real IDs):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

Clarity script goes in the same `<head>` block.

### 3. Backlinks & indexing hints
- Submit your URL to Product Hunt, BetaList, AlternativeTo (free long-tail traffic)
- Post a launch on **LinkedIn, Facebook groups** (Bangladesh SME groups, distribution, FMCG, pharma)
- Add the URL to your **Twitter/X bio** and **GitHub README**
- Add it to **Crunchbase / AngelList** if applicable
- Submit to **Google My Business** (only if you have a physical office)

### 4. Local SEO (Bangladesh)
- Add structured data for `LocalBusiness` (replace the `Organization` block):
  ```json
  {
    "@type": "LocalBusiness",
    "name": "DMS",
    "address": {"@type": "PostalAddress", "addressCountry": "BD"},
    "geo": {"@type": "GeoCoordinates", "latitude": 23.8103, "longitude": 90.4125}
  }
  ```
- Get a Dhaka phone number with WhatsApp Business → add to footer
- Create a Google Business Profile (free)

### 5. Content (this is the long game)
- Add a **/blog** route (markdown or CMS). 2 posts/week, 800+ words each, target long-tail Bangla + English queries:
  - "কিভাবে ডিস্ট্রিবিউশন ব্যবসা ডিজিটাল করবেন"
  - "best distribution software Bangladesh 2026"
  - "stock management for FMCG distributors"
- Add a **/pricing** page with structured `Product` schema
- Add a **/changelog** page (developers link to it, Google indexes updates)
- Add a **/privacy** and **/terms** page (legally required, ranks for "[brand] privacy policy" type queries)

### 6. Performance (Core Web Vitals)
Your main JS bundle is **2.29 MB / 676 KB gzipped** — too big. Fix it:
- Use `React.lazy()` + `Suspense` on each route (the dashboard, products, reports etc. should be code-split)
- Run `vite build` with `build.rollupOptions.output.manualChunks` to split `lucide-react` and `jspdf` into their own chunks
- Move `html2canvas` / `jspdf` to dynamic import — only needed on the reports page

Sample `vite.config.js` chunking:
```js
build: {
  chunkSizeWarningLimit: 800,
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom', 'react-router-dom'],
        pdf: ['jspdf', 'jspdf-autotable', 'html2canvas', 'html2pdf.js'],
        excel: ['xlsx', 'file-saver'],
      }
    }
  }
}
```

### 7. Backlink monitoring
- Set up **Ahrefs free backlink checker** alerts for `dms-live.azurewebsites.net`
- Or use **Google Search Console → Links** report weekly

## How to add a new public route to SEO

Edit `frontend/src/components/SEO.jsx` → `SEO_CONFIG` map:

```js
'/my-new-page': {
  title: 'My New Page - DMS',
  description: '...',
  keywords: '...',
  path: '/my-new-page',
  noindex: false, // true if it should not appear in search
},
```

Then add the same path to `frontend/public/sitemap.xml`. That's it — `RouteSeo` picks it up automatically.

## How to add a new public route in the SPA router

```jsx
// App.jsx
<Route path="/pricing" element={<Pricing />} />
```

`RouteSeo` reads `useLocation()` and applies the right Helmet. No extra wiring.

## What NOT to do
- ❌ Don't stuff keywords in the title (`DMS DMS DMS Bangladesh Bangladesh`)
- ❌ Don't buy backlinks (Google penalty)
- ❌ Don't hide text (`display:none` with hidden keywords)
- ❌ Don't redirect `/` to `/login` for crawlers (Google will de-rank)
- ❌ Don't `noindex` the landing page

## How to verify it's working

After redeploy:
1. `curl -s https://dms-live.azurewebsites.net/ | grep -E "title|description|canonical"` — meta tags present
2. `curl -sI https://dms-live.azurewebsites.net/` — `content-encoding: gzip`, `cache-control` headers
3. https://search.google.com/test/rich-results — paste `https://dms-live.azurewebsites.net/` and check SoftwareApplication + FAQPage
4. https://www.opengraph.xyz/ — paste URL, see Facebook/LinkedIn preview
5. https://cards-dev.twitter.com/validator — Twitter card preview
6. Google Search Console → URL Inspection → enter `https://dms-live.azurewebsites.net/` → "Request Indexing"
7. Lighthouse → SEO score (target 95+)
