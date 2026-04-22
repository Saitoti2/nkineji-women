import imageCompression from 'browser-image-compression';

export async function compressImage(file: File) {
    const options = {
        maxSizeMB: 0.5, // 500KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        return file; // Return original if compression fails
    }
}

export function getInstantPreview(file: File) {
    return URL.createObjectURL(file);
}
