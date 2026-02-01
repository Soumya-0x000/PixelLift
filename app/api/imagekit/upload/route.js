import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import imagekit from '../config';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const fileName = formData.get('fileName');
        const projectTitle = formData.get('projectTitle');
        const projectDescription = formData.get('projectDescription');

        // Validation
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!projectTitle) {
            return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate project ID for folder structure
        const projectId = uuidv4();
        const timestamp = Date.now();

        // Extract file extension
        const fileExt = fileName.split('.').pop() || 'jpg';
        const baseName = fileName.replace(`.${fileExt}`, '');

        // Create versioned filename: v0_original_timestamp.ext
        const versionedFileName = `v0_original_${timestamp}.${fileExt}`;

        // Create nested folder structure: /pixellift-projects/{userId}/{projectId}
        const imagekitFolder = `/pixellift-projects/${userId}/${projectId}`;

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: versionedFileName,
            folder: imagekitFolder,
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

        // Create project with versioning in Convex
        const projectData = await convex.mutation(api.createProjectWithVersion.createProjectWithVersion, {
            // Project metadata
            title: projectTitle,
            description: projectDescription || undefined,
            canvasState: undefined,

            // Image dimensions and size
            width: uploadResponse.width,
            height: uploadResponse.height,
            size: uploadResponse.size,

            // ImageKit data
            imgKitFileId: uploadResponse.fileId,
            imagekitUrl: uploadResponse.url,
            imagekitFolder: imagekitFolder,
            fileName: versionedFileName,
            thumbnailUrl: thumbnailUrl,
            format: fileExt.toLowerCase(),
            mimeType: mimeType,
        });

        return NextResponse.json({
            success: true,
            project: projectData,
            imagekit: {
                url: uploadResponse.url,
                thumbnailUrl,
                fileId: uploadResponse.fileId,
                folder: imagekitFolder,
                fileName: versionedFileName,
            },
            metadata: {
                width: uploadResponse.width,
                height: uploadResponse.height,
                size: uploadResponse.size,
                format: fileExt.toLowerCase(),
            },
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
