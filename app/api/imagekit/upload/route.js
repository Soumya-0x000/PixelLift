import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import imagekit from '../config';

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const fileName = formData.get('fileName');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const id = crypto.randomUUID();

        const uniqueFileName = `${fileName}_${userId}_${id}`;

        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: uniqueFileName,
            folder: '/pixellift-projects',
        });

        const thumbnailUrl = imageKit.url({
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

        return NextResponse.json({
            success: true,
            url: uploadResponse.url,
            thumbnailUrl,
            fileId: uploadResponse.fileId,
            width: uploadResponse.width,
            height: uploadResponse.height,
            size: uploadResponse.size,
            name: uploadResponse.name,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload image', details: error.message },
            { status: 500 }
        );
    }
}
