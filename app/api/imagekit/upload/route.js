import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import imagekit from '../config';

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const fileName = formData.get('fileName');
        const imagekitFolder = formData.get('imagekitFolder'); // Pre-generated folder path

        // Validation
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!imagekitFolder) {
            return NextResponse.json({ error: 'ImageKit folder path is required' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();

        // Extract file extension
        const fileExt = fileName.split('.').pop() || 'jpg';

        // Create versioned filename: v0_original_timestamp.ext
        const versionedFileName = `v0_original_${timestamp}.${fileExt}`;

        // Upload to ImageKit with nested structure
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: versionedFileName,
            folder: imagekitFolder, // e.g., /pixellift-projects/{userId}/{projectId}/versions
        });

        // Generate thumbnail URL (on-the-fly transformation)
        const thumbnailUrl = imagekit.url({
            src: uploadResponse.url,
            transformation: [
                {
                    height: '300',
                    width: '400',
                    cropMode: 'maintain_ar',
                    quality: '80',
                },
            ],
        });

        // Determine MIME type
        const mimeTypeMap = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
        };
        const mimeType = mimeTypeMap[fileExt.toLowerCase()] || 'image/jpeg';

        return NextResponse.json({
            success: true,
            url: uploadResponse.url,
            thumbnailUrl,
            fileId: uploadResponse.fileId,
            width: uploadResponse.width,
            height: uploadResponse.height,
            size: uploadResponse.size,
            format: fileExt.toLowerCase(),
            mimeType: mimeType,
            fileName: versionedFileName,
            folder: imagekitFolder,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload image',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
