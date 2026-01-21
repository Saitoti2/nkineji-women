
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { url } = req;
    const filePath = path.join(process.cwd(), 'index.html'); // Vercel serves static files from root in some configs, or use require('path').resolve...
    // In Vercel serverless for frontend, reading index.html might be tricky if it's not bundled. 
    // A safer bet involves fetching the static index.html from ourselves if FS fails, OR just constructing the HTML.
    // But constructing means we lose the Vite scripts.

    // Try reading file
    let html;
    try {
        // Vercel Output File Tracing should find index.html if we require it or use fs 
        // For SPA, index.html is in root or dist.
        html = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        try {
            // Try dist/index.html
            html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
        } catch (e) {
            console.error('Failed to read index.html', err, e);
            return res.status(500).send('Server Error: Template not found');
        }
    }

    // Regex to replace meta tags
    const replaceMeta = (html, property, content) => {
        const regex = new RegExp(`<meta property="${property}" content="[^"]*" />`, 'g');
        return html.replace(regex, `<meta property="${property}" content="${content}" />`);
    };

    // Logic to fetch data
    // Using public API or hardcoded check
    // Url format: /impact/123 or /campaigns/123

    let title = "Nkineji Community Development Initiative";
    let description = "Empowering the marginalized heart of the Maasai Mara through GirlChild Education and Maternal Health.";
    let image = "https://inua-mama-initiative.vercel.app/og-logo.png";

    try {
        if (url.includes('/impact/')) {
            const id = url.split('/impact/')[1]?.split('?')[0];
            if (id) {
                // Fetch from API
                // Note: We need absolute URL for fetch in Node
                const apiUrl = process.env.VITE_API_URL || 'https://inua-mama-initiative.vercel.app/api/v1';
                const resp = await fetch(`${apiUrl}/impact-stories/${id}`);
                if (resp.ok) {
                    const data = await resp.json();
                    const story = data.data;
                    title = story.title;
                    description = story.impact_summary || story.short_bio;
                    // Ensure image is absolute
                    image = story.profile_image_url.startsWith('http')
                        ? story.profile_image_url
                        : `https://inua-mama-initiative.vercel.app${story.profile_image_url}`;
                }
            }
        } else if (url.includes('/campaigns/')) {
            const id = url.split('/campaigns/')[1]?.split('?')[0];
            if (id) {
                const apiUrl = process.env.VITE_API_URL || 'https://inua-mama-initiative.vercel.app/api/v1';
                const resp = await fetch(`${apiUrl}/campaigns/${id}`);
                if (resp.ok) {
                    const data = await resp.json();
                    const campaign = data.data;
                    title = campaign.title;
                    description = campaign.description;
                    image = campaign.image_url.startsWith('http')
                        ? campaign.image_url
                        : `https://inua-mama-initiative.vercel.app${campaign.image_url}`;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching data for OG', e);
        // Fallback to default
    }

    // Inject tags
    html = replaceMeta(html, 'og:title', title);
    html = replaceMeta(html, 'og:description', description);
    html = replaceMeta(html, 'og:image', image);
    html = replaceMeta(html, 'og:image:secure_url', image);
    html = replaceMeta(html, 'og:url', `https://inua-mama-initiative.vercel.app${url}`);

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
}
