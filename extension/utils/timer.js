/**
 * Timer utilities for the Time Spent Timer extension
 */

/**
 * Format seconds into a human-readable time string
 * @param {number} seconds - Total seconds to format
 * @param {boolean} showSeconds - Whether to include seconds in the output
 * @returns {string} - Formatted time string (e.g., "5m 30s" or "5m")
 */
function formatTime(seconds, showSeconds = true) {
    if (seconds < 0) seconds = 0;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let formattedTime = "";

    if (hours > 0) {
        formattedTime += `${hours}h `;
    }

    formattedTime += `${minutes}m`;

    if (showSeconds && (hours === 0 || remainingSeconds > 0)) {
        formattedTime += ` ${remainingSeconds}s`;
    }

    return formattedTime.trim();
}

/**
 * Extract domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - The domain (e.g., "example.com")
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        console.error("Error extracting domain:", error);
        return "";
    }
}

/**
 * Check if a URL is in the blacklist
 * @param {string} url - The URL to check
 * @param {Array<string>} blacklist - Array of blacklisted domains
 * @returns {boolean} - True if the URL is blacklisted
 */
function isUrlBlacklisted(url, blacklist) {
    if (!blacklist || !Array.isArray(blacklist) || blacklist.length === 0) {
        return false;
    }

    const domain = extractDomain(url);
    return blacklist.some((item) => {
        // Check for exact match or subdomain match
        return domain === item || domain.endsWith(`.${item}`);
    });
}

/**
 * Calculate time elapsed since a given timestamp
 * @param {number} startTime - Start timestamp in milliseconds
 * @returns {number} - Seconds elapsed
 */
function calculateElapsedTime(startTime) {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
}
