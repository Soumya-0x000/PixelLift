import { internalAction } from '../_generated/server';
import { v } from 'convex/values';

const IMAGEKIT_BASE_URL = 'https://api.imagekit.io/v1/files';

/**
 * Get ImageKit auth header
 */
const getAuthHeader = () => {
    const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!IMAGEKIT_PRIVATE_KEY) {
        throw new Error('IMAGEKIT_PRIVATE_KEY not configured');
    }
    return `Basic ${btoa(`${IMAGEKIT_PRIVATE_KEY}:`)}`;
};

/**
 * Check if a file exists in ImageKit
 */
export const checkFileExists = internalAction({
    args: { fileId: v.string() },
    handler: async (ctx, { fileId }) => {
        try {
            const res = await fetch(`${IMAGEKIT_BASE_URL}/${fileId}/details`, {
                method: 'GET',
                headers: { Authorization: getAuthHeader() },
            });

            if (res.status === 404) return { exists: false };
            if (res.ok) return { exists: true };

            return { exists: 'unknown', status: res.status };
        } catch (err) {
            console.error(`Error checking file ${fileId}:`, err.message);
            return { exists: 'unknown', error: err.message };
        }
    },
});

/**
 * Delete a file from ImageKit
 */
export const deleteFile = internalAction({
    args: { fileId: v.string() },
    handler: async (ctx, { fileId }) => {
        if (!fileId) {
            return { success: false, status: 400, message: 'fileId missing' };
        }

        try {
            const res = await fetch(`${IMAGEKIT_BASE_URL}/${fileId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                return { success: true, status: res.status };
            }

            const errorData = await res.json().catch(() => ({}));
            return {
                success: false,
                status: res.status,
                message: errorData.message || 'ImageKit deletion failed',
            };
        } catch (err) {
            console.error(`Error deleting file ${fileId}:`, err.message);
            return { success: false, status: 500, message: err.message };
        }
    },
});
