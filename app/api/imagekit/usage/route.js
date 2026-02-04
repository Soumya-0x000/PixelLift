import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * ImageKit Usage API
 * Fetches account-level usage statistics from ImageKit
 *
 * Endpoint: GET /api/imagekit/usage
 * Query params:
 *   - startDate (optional): YYYY-MM-DD format, defaults to 30 days ago
 *   - endDate (optional): YYYY-MM-DD format, defaults to today
 *
 * Returns:
 *   - bandwidthBytes: Total bandwidth used
 *   - mediaLibraryStorageBytes: Total storage used
 *   - Other usage metrics
 */
export async function GET(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(req.url);

        // Default to last 30 days if not specified
        const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
        const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Validate date range (max 90 days)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (diffDays > 90) {
            return NextResponse.json({ error: 'Date range cannot exceed 90 days' }, { status: 400 });
        }

        // ImageKit API credentials
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

        if (!privateKey) {
            return NextResponse.json({ error: 'ImageKit credentials not configured' }, { status: 500 });
        }

        // Call ImageKit Usage API
        const url = `https://api.imagekit.io/v1/accounts/usage?startDate=${startDate}&endDate=${endDate}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${Buffer.from(privateKey + ':').toString('base64')}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch usage data');
        }

        const usageData = await response.json();

        // Format response
        return NextResponse.json({
            success: true,
            data: {
                // Storage metrics
                storageBytes: usageData.mediaLibraryStorageBytes || 0,
                storageGB: ((usageData.mediaLibraryStorageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2),

                // Bandwidth metrics
                bandwidthBytes: usageData.bandwidthBytes || 0,
                bandwidthGB: ((usageData.bandwidthBytes || 0) / (1024 * 1024 * 1024)).toFixed(2),

                // Date range
                startDate,
                endDate,

                // Raw data
                raw: usageData,
            },
        });
    } catch (error) {
        console.error('ImageKit usage API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch usage data',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
