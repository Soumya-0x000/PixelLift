import { NextResponse } from 'next/server';
import imagekit from '../config';

export async function GET() {
    try {
        const files = await imagekit.listFiles({ limit: 10 });
        return NextResponse.json({ success: true, data: files });
    } catch (error) {
        console.error('Image list error:', error);
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }
}
