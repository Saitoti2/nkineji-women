# How to Clear Link Preview Cache

Social media platforms (WhatsApp, Facebook, Twitter, etc.) cache link previews. Even after updating your meta tags, you need to clear the cache for the new logo to appear.

## Steps to Clear Cache:

### 1. Facebook/WhatsApp Cache (Most Important)
1. Visit: https://developers.facebook.com/tools/debug/
2. Enter your URL: `https://inua-mama-initiative.vercel.app`
3. Click **"Scrape Again"** button
4. Wait for it to process (may take 30-60 seconds)
5. Verify the preview shows your logo
6. Test sharing the link in WhatsApp

### 2. LinkedIn Cache
1. Visit: https://www.linkedin.com/post-inspector/
2. Enter your URL
3. Click "Inspect"

### 3. Twitter Cache
1. Visit: https://cards-dev.twitter.com/validator
2. Enter your URL
3. Click "Preview card"

### 4. General Tips
- Wait 5-10 minutes after deployment before clearing cache
- Clear cache multiple times if needed
- Test with a fresh link (add `?v=2` to URL to force refresh)
- Some platforms may take 24-48 hours to fully update

## Current Setup:
- **OpenGraph Image**: `og-image-1200x630.png` (1200x630 pixels)
- **Image URL**: `https://inua-mama-initiative.vercel.app/og-image-1200x630.png`
- **All meta tags**: Properly configured with absolute URLs

## Verification:
After clearing cache, the preview should show:
- ✅ Your logo (Inua Mama Initiative)
- ✅ Title: "Inua Mama Initiative | Maasai Mara Women Empowerment"
- ✅ Description about the initiative
- ❌ NO Lovable branding

