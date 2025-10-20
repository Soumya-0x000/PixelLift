import { v } from 'convex/values';
import { internalAction } from '../_generated/server';

const IMAGEKIT_BASE_URL = 'https://api.imagekit.io/v1/files';
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

export const deleteImageKitFile = internalAction({
    args: { fileId: v.string() },
    handler: async (ctx, { fileId }) => {
        if (!fileId) return { success: false, status: 400, message: 'fileId missing' };

        try {
            const res = await fetch(`${IMAGEKIT_BASE_URL}/${fileId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Basic ${btoa(`${IMAGEKIT_PRIVATE_KEY}:`)}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.success) {
                const errorData = await res.json().catch(() => ({}));
                return {
                    success: false,
                    status: res.status,
                    message: errorData.message || 'ImageKit deletion failed',
                };
            }

            return { success: true, status: res.status };
        } catch (err) {
            return { success: false, status: 500, message: err.message || 'Unknown error' };
        }
    },
});
