# One family, eight firms and Tk 1200 cr plundering of public funds

The Daily Star, by Sukanta Halder. Photos: Habibur Rahman. Design & Development: Zyma Islam, Mir Rownak.

Goes live at **https://campaign.thedailystar.net/public-fund-plundered/** on 6 October 2026.

This folder is the finished website: plain static files, no build step, no server code, no calls to outside services (fonts and scripts are self-hosted). Every path inside it is relative, so it works both at the root of a domain (a Vercel preview) and inside the `/public-fund-plundered/` folder on the live server.

Don't edit these files by hand. They're copied here from the project folder by `tools/publish.py`.

---

## 1. Put it live

1. Copy **everything in this folder** (except `.git`) into a folder named `public-fund-plundered` at the web root of `campaign.thedailystar.net`, so that `index.html` is served at https://campaign.thedailystar.net/public-fund-plundered/.
   - `vercel.json` and this `README.md` aren't needed on the live server. They're harmless if copied.
2. **Keep the trailing slash.** `https://campaign.thedailystar.net/public-fund-plundered` (no slash) must redirect to `.../public-fund-plundered/`. nginx and Apache do this for real folders by default. As a safety net, the page adds the slash itself before it loads anything else.
3. If the site sits behind Cloudflare, purge the cache for `/public-fund-plundered/` after each upload.

Make sure these types are served (older servers may not know them): `.avif` as `image/avif`, `.webp` as `image/webp`, `.woff2` as `font/woff2`.

Suggested caching: `index.html` `no-cache`; `fonts/*` and `vendor/*` `public, max-age=31536000, immutable`; `img/*` and `js/*` `public, max-age=604800`. Serve HTML, JS, SVG and XML with gzip or Brotli: the page is measured with compression on.

**nginx:**

```nginx
location /public-fund-plundered/ {
    index index.html;
    add_header Cache-Control "no-cache";
}
location ~ ^/public-fund-plundered/(fonts|vendor)/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location /public-fund-plundered/img/ {
    add_header Cache-Control "public, max-age=604800";
}
```

**Apache** (a `.htaccess` inside `public-fund-plundered/`, if `AllowOverride` permits it):

```apache
DirectoryIndex index.html
AddType image/avif .avif
AddType image/webp .webp
AddType font/woff2 .woff2
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

---

## 2. Search engines and share cards

Already in the page:
- Title, description, keywords, author, robots directives (large image previews allowed) and the canonical URL https://campaign.thedailystar.net/public-fund-plundered/.
- Open Graph and X (Twitter) cards with `img/og-image.jpg`, a 1200 × 630 crop of the hero photo.
- `NewsArticle` structured data: headline, description, authors, contributors, publisher, publish date (6 October 2026) and the hero photo in 16:9, 4:3 and 1:1 crops.
- `sitemap.xml` (the page and its photos) and `robots.txt`.

**One step on the live server:** crawlers read `robots.txt` only at the root of a domain. If `https://campaign.thedailystar.net/robots.txt` exists, add this line to it (don't replace it); if it doesn't, create it with the contents of this folder's `robots.txt`:

```
Sitemap: https://campaign.thedailystar.net/public-fund-plundered/sitemap.xml
```

**After it's live:**
1. Google Search Console: submit the sitemap above and request indexing of the page.
2. Check the article data at https://search.google.com/test/rich-results.
3. Refresh the share card at https://developers.facebook.com/tools/debug/ ("Scrape Again"). Share cards only show the photo once the page is live at the address above.

A Vercel preview (`*.vercel.app`) sends `X-Robots-Tag: noindex`, so it never competes with the live page in search.

---

## Folder contents

| Path | What |
|---|---|
| `index.html` | The whole story, every paragraph in the HTML (readable with JavaScript off), with its stylesheet inlined |
| `js/story.min.js`, `js/main.min.js` | Scroll steps, reveals, the motion scenes and the photo carousel (minified) |
| `vendor/` | GSAP and ScrollTrigger (loaded after the page, skipped under reduced motion) |
| `fonts/` | Newsreader and IBM Plex (WOFF2, cut to the characters the page uses; OFL licences included) |
| `img/` | Photos (AVIF, WebP, JPEG at several sizes), share images, favicon |
| `robots.txt`, `sitemap.xml` | For search engines (see section 2) |
| `vercel.json` | Vercel preview settings only |
