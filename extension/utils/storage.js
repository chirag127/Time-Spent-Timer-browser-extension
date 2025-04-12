/**
 * Wrapper for Chrome storage API
 */

/**
 * Get a value from storage
 * @param {string} key - The key to get
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} - The value from storage
 */
async function getFromStorage(key, defaultValue = null) {
    try {
        const result = await chrome.storage.sync.get(key);
        return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
        console.error(`Error getting ${key} from storage:`, error);
        return defaultValue;
    }
}

/**
 * Save a value to storage
 * @param {string} key - The key to save
 * @param {any} value - The value to save
 * @returns {Promise<void>}
 */
async function saveToStorage(key, value) {
    try {
        await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
}

/**
 * Initialize storage with default values if they don't exist
 * @returns {Promise<void>}
 */
async function initializeStorage() {
    try {
        const nudgeTimings = await getFromStorage(STORAGE_KEYS.NUDGE_TIMINGS);
        if (!nudgeTimings) {
            await saveToStorage(
                STORAGE_KEYS.NUDGE_TIMINGS,
                DEFAULT_NUDGE_TIMINGS
            );
        }

        const nudgeMessages = await getFromStorage(STORAGE_KEYS.NUDGE_MESSAGES);
        if (!nudgeMessages) {
            await saveToStorage(
                STORAGE_KEYS.NUDGE_MESSAGES,
                DEFAULT_NUDGE_MESSAGES
            );
        }

        const timerSettings = await getFromStorage(STORAGE_KEYS.TIMER_SETTINGS);
        if (!timerSettings) {
            await saveToStorage(
                STORAGE_KEYS.TIMER_SETTINGS,
                DEFAULT_TIMER_SETTINGS
            );
        }

        const siteBlacklist = await getFromStorage(STORAGE_KEYS.SITE_BLACKLIST);
        if (!siteBlacklist) {
            await saveToStorage(STORAGE_KEYS.SITE_BLACKLIST, []);
        }

        const doNotDisturb = await getFromStorage(STORAGE_KEYS.DO_NOT_DISTURB);
        if (doNotDisturb === null) {
            await saveToStorage(STORAGE_KEYS.DO_NOT_DISTURB, false);
        }

        const siteTimers = await getFromStorage(STORAGE_KEYS.SITE_TIMERS);
        if (!siteTimers) {
            await saveToStorage(STORAGE_KEYS.SITE_TIMERS, {});
        }
    } catch (error) {
        console.error("Error initializing storage:", error);
    }
}

/**
 * Clear all site timers from storage
 * @returns {Promise<void>}
 */
async function clearSiteTimers() {
    try {
        await saveToStorage(STORAGE_KEYS.SITE_TIMERS, {});
    } catch (error) {
        console.error("Error clearing site timers:", error);
    }
}
