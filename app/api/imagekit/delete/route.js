import { NextResponse } from 'next/server';
import imagekit from '../config';

export async function POST(req) {
    try {
        const { fileId } = await req.json();

        if (!fileId) return NextResponse.json({ error: 'fileId missing' }, { status: 400 });

        const res = await imagekit.deleteFile(fileId);
        return NextResponse.json({ success: true, data: res });
    } catch (error) {
        console.error('Image delete error:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
