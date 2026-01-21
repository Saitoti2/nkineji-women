import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

export default function handler(request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>&desc=<desc>&img=<img>
        const title = searchParams.get('title')?.slice(0, 100) || 'Nkineji Community Initiative';
        const description = searchParams.get('desc')?.slice(0, 150) || 'Empowering the Maasai Mara';
        const image = searchParams.get('img');
        const type = searchParams.get('type');

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#fff',
                        position: 'relative',
                    }}
                >
                    {/* Full background image (Campaign Photo) */}
                    {image && (
                        <img
                            src={image}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                        }}
                    />

                    {/* Content Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            height: '100%',
                            padding: '60px',
                            position: 'relative',
                            zIndex: 10,
                        }}
                    >
                        {/* Branding Pill */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                padding: '8px 16px',
                                borderRadius: '50px',
                                alignSelf: 'flex-start',
                                marginBottom: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            }}
                        >
                            <img
                                src="https://inua-mama-initiative.vercel.app/logo.png"
                                width="32"
                                height="32"
                                style={{ borderRadius: '50%', marginRight: '10px' }}
                            />
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#e11d48' }}>
                                Nkineji Initiative
                            </span>
                        </div>

                        {/* Title */}
                        <div
                            style={{
                                fontSize: 60,
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1.1,
                                marginBottom: '10px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            }}
                        >
                            {title}
                        </div>

                        {/* Description */}
                        <div
                            style={{
                                fontSize: 30,
                                color: '#e5e7eb',
                                lineHeight: 1.4,
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                maxWidth: '90%',
                            }}
                        >
                            {description}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e) {
        console.error(e);
        return new Response(`Failed to generate image`, {
            status: 500,
        });
    }
}
