import { NextResponse } from 'next/server';
import imagekit from '../../config';

export async function DELETE(req, { params }) {
    try {
        const { fileId } = params;

        if (!fileId) return NextResponse.json({ message: 'fileId missing' }, { status: 400 });

        const {
            $ResponseMetadata: { statusCode },
        } = await imagekit.deleteFile(fileId);
        if (statusCode !== 204) {
            return NextResponse.json({ message: 'Failed to delete image' }, { status: statusCode });
        }

        return NextResponse.json({ success: true, status: statusCode }, { status: 200 });
    } catch (error) {
        console.error('Image delete error:', error);
        return NextResponse.json({ message: 'Failed to delete image' }, { status: 500 });
    }
}
