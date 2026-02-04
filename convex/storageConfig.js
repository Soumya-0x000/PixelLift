/**
 * Storage limits configuration for different user plans
 * Based on ImageKit free tier (20 GB total) and versioning requirements
 */

const BYTES_IN_MB = 1024 * 1024;
const BYTES_IN_GB = 1024 * 1024 * 1024;

export const STORAGE_LIMITS = {
    apprentice_user: 500 * BYTES_IN_MB, // 500 MB = 524,288,000 bytes
    master_user: 5 * BYTES_IN_GB, // 5 GB = 5,368,709,120 bytes
    deity_user: 15 * BYTES_IN_GB, // 15 GB = 16,106,127,360 bytes
};

/**
 * Get storage limit for a specific plan
 * @param {string} plan - User plan ('apprentice_user', 'master_user', 'deity_user')
 * @returns {number} Storage limit in bytes
 */
export function getStorageLimit(plan) {
    return STORAGE_LIMITS[plan] || STORAGE_LIMITS.apprentice_user;
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted string (e.g., "1.5 GB", "500 MB")
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate storage usage percentage
 * @param {number} used - Used storage in bytes
 * @param {number} limit - Storage limit in bytes
 * @returns {number} Percentage (0-100)
 */
export function getStoragePercentage(used, limit) {
    if (limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Check if user has enough storage for new upload
 * @param {number} currentUsage - Current storage usage in bytes
 * @param {number} limit - Storage limit in bytes
 * @param {number} newFileSize - Size of new file in bytes
 * @returns {boolean} True if upload is allowed
 */
export function canUpload(currentUsage, limit, newFileSize) {
    return currentUsage + newFileSize <= limit;
}

/**
 * Get remaining storage
 * @param {number} used - Used storage in bytes
 * @param {number} limit - Storage limit in bytes
 * @returns {number} Remaining storage in bytes
 */
export function getRemainingStorage(used, limit) {
    return Math.max(0, limit - used);
}
