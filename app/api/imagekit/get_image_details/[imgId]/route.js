import { NextResponse } from 'next/server';
import imagekit from '../../config';

export async function GET(request, { params }) {
    try {
        const { imgId } = params;
        if (!imgId) {
            return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
        }

        const file = await imagekit.getFileDetails(imgId);
        return NextResponse.json({ success: true, data: file });
    } catch (error) {
        console.error('Image details error:', error);
        return NextResponse.json({ error: 'Failed to get image details' }, { status: 500 });
    }
}
