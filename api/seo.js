// api/seo.js — Social media crawler handler
// Bots (WhatsApp, Twitter, Facebook, Telegram, etc.) get a lightweight OG-only HTML page.
// Real browsers get redirected to the SPA (index.html served by the static catch-all).

const BOT_UA_REGEX =
  /whatsapp|facebookexternalhit|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|applebot|pinterest|slack-imgproxy|vkshare|w3c_validator|curl|wget/i;

const SITE_URL = 'https://nkineji.org';
const BACKEND_URL = process.env.VITE_API_URL || 'https://nkineji-api.vercel.app/api/v1';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

function buildOGPage({ title, description, image, url, type }) {
  const escaped = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escaped(title)}</title>
  <meta name="description" content="${escaped(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${type === 'campaign' ? 'website' : 'article'}" />
  <meta property="og:title" content="${escaped(title)}" />
  <meta property="og:description" content="${escaped(description)}" />
  <meta property="og:image" content="${escaped(image)}" />
  <meta property="og:image:secure_url" content="${escaped(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escaped(url)}" />
  <meta property="og:site_name" content="Nkineji Women Initiative" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escaped(title)}" />
  <meta name="twitter:description" content="${escaped(description)}" />
  <meta name="twitter:image" content="${escaped(image)}" />

  <!-- Redirect real browsers to SPA immediately -->
  <script>
    // Only redirect if this is a real browser (not a bot)
    if (typeof window !== 'undefined' && window.location) {
      window.location.replace(window.location.href);
    }
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=${escaped(url)}" />
  </noscript>
</head>
<body>
  <p>Redirecting to <a href="${escaped(url)}">${escaped(title)}</a>…</p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = BOT_UA_REGEX.test(userAgent);
  const { id, type } = req.query;

  // Real browsers: redirect to SPA index — the static CDN will serve it correctly with proper MIME types
  if (!isBot) {
    const destination = type === 'impact' ? `/impact/${id}` : `/campaigns/${id}`;
    res.setHeader('Location', destination);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(302).send('');
  }

  // Bots: fetch story/campaign data and serve lightweight OG page
  let title = 'Nkineji Women Initiative';
  let description = 'Transforming the lives of Maasai women and girls through holistic education, healthcare, and economic empowerment.';
  let image = DEFAULT_IMAGE;
  const pageUrl = `${SITE_URL}/${type}/${id}`;

  try {
    if (type === 'impact' && id) {
      const resp = await fetch(`${BACKEND_URL}/impact-stories/${id}`);
      if (resp.ok) {
        const { data: story } = await resp.json();
        if (story) {
          title = story.title || title;
          description = story.impact_summary || story.short_bio || story.content?.slice(0, 200) || description;

          // Resolve image URL — handle Cloudinary URLs, absolute URLs, and relative paths
          if (story.profile_image_url) {
            if (story.profile_image_url.startsWith('http')) {
              image = story.profile_image_url;
            } else if (story.profile_image_url.startsWith('/uploads')) {
              // Local upload — won't work for OG; fall back to default
              image = DEFAULT_IMAGE;
            } else {
              image = story.profile_image_url;
            }
          } else if (story.media?.[0]?.media_url) {
            const mediaUrl = story.media[0].media_url;
            image = mediaUrl.startsWith('http') ? mediaUrl : DEFAULT_IMAGE;
          }
        }
      }
    } else if (type === 'campaign' && id) {
      const resp = await fetch(`${BACKEND_URL}/campaigns/${id}`);
      if (resp.ok) {
        const { data: campaign } = await resp.json();
        if (campaign) {
          title = campaign.title || title;
          description = campaign.description?.slice(0, 200) || description;
          if (campaign.image_url) {
            image = campaign.image_url.startsWith('http') ? campaign.image_url : DEFAULT_IMAGE;
          }
        }
      }
    }
  } catch (e) {
    console.error('SEO handler fetch error:', e);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  return res.status(200).send(buildOGPage({ title, description, image, url: pageUrl, type }));
}
