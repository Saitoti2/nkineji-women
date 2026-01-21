
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
    let title = "Nkineji Community Development Initiative";
    let description = "Empowering the marginalized heart of the Maasai Mara through GirlChild Education and Maternal Health.";
    let image = "https://inua-mama-initiative.vercel.app/og-logo.png";

    try {
        const { id, type } = req.query;
        // console.log('SEO Request:', { id, type, url }); // DEBUG

        const apiUrl = process.env.VITE_API_URL || 'https://inua-mama-initiative.vercel.app/api/v1';

        if (type === 'impact' && id) {
            const resp = await fetch(`${apiUrl}/impact-stories/${id}`);
            if (resp.ok) {
                const data = await resp.json();
                const story = data.data;
                if (story) {
                    title = story.title || title;
                    description = story.impact_summary || story.short_bio || description;
                    if (story.profile_image_url) {
                        image = story.profile_image_url.startsWith('http')
                            ? story.profile_image_url
                            : `https://inua-mama-initiative.vercel.app${story.profile_image_url}`;
                    }
                }
            } else {
                console.error(`Failed to fetch impact story: ${resp.status}`);
            }
        } else if (type === 'campaign' && id) {
            const resp = await fetch(`${apiUrl}/campaigns/${id}`);
            if (resp.ok) {
                const data = await resp.json();
                const campaign = data.data;
                if (campaign) {
                    title = campaign.title || title;
                    description = campaign.description || description;
                    if (campaign.image_url) {
                        image = campaign.image_url.startsWith('http')
                            ? campaign.image_url
                            : `https://inua-mama-initiative.vercel.app${campaign.image_url}`;
                    }
                }
            } else {
                console.error(`Failed to fetch campaign: ${resp.status}`);
            }
        }
    } catch (e) {
        console.error('Error fetching data for OG', e);
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
