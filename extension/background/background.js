/**
 * Background service worker for Time Spent Timer extension
 * Handles tab monitoring, timer logic, and alarm triggers
 */

// State variables
let activeTabId = null;
let activeTabUrl = null;
let activeTabDomain = null;
let timerStartTime = null;
let timerPaused = false;
let nudgesSent = {
    first: false,
    second: false,
    third: false,
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log("Time Spent Timer extension installed");
    await initializeStorage();
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await handleTabChange(activeInfo.tabId);
});

// Track URL changes within tabs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tabId === activeTabId) {
        const newDomain = extractDomain(tab.url);
        if (newDomain !== activeTabDomain) {
            await handleTabChange(tabId);
        }
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case MESSAGE_TYPES.GET_SETTINGS:
            handleGetSettings(sendResponse);
            return true; // Keep the message channel open for async response

        case MESSAGE_TYPES.UPDATE_SETTINGS:
            handleUpdateSettings(message.data);
            sendResponse({ success: true });
            break;

        case MESSAGE_TYPES.TIMER_PAUSE:
            handleTimerPause();
            sendResponse({ success: true });
            break;

        case MESSAGE_TYPES.TIMER_RESUME:
            handleTimerResume();
            sendResponse({ success: true });
            break;

        case MESSAGE_TYPES.TIMER_RESET:
            handleTimerReset();
            sendResponse({ success: true });
            break;

        case MESSAGE_TYPES.TOGGLE_DO_NOT_DISTURB:
            handleToggleDoNotDisturb(message.data);
            sendResponse({ success: true });
            break;
    }
});

// Set up alarms for periodic timer updates
chrome.alarms.create("timerUpdate", { periodInMinutes: 0.1 }); // Update every 6 seconds

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "timerUpdate") {
        await updateTimer();
    }
});

/**
 * Handle tab change by resetting timer and updating state
 * @param {number} tabId - The ID of the new active tab
 */
async function handleTabChange(tabId) {
    try {
        // Save current timer for the previous domain
        if (activeTabDomain) {
            await saveCurrentTimer();
        }

        // Get tab info
        const tab = await chrome.tabs.get(tabId);
        if (
            !tab.url ||
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://")
        ) {
            resetState();
            return;
        }

        // Update state with new tab info
        activeTabId = tabId;
        activeTabUrl = tab.url;
        activeTabDomain = extractDomain(tab.url);

        // Check if site is blacklisted
        const blacklist = await getFromStorage(STORAGE_KEYS.SITE_BLACKLIST, []);
        if (isUrlBlacklisted(activeTabUrl, blacklist)) {
            resetState();
            return;
        }

        // Reset nudges state
        nudgesSent = {
            first: false,
            second: false,
            third: false,
        };

        // Load existing timer for this domain if it exists
        const siteTimers = await getFromStorage(STORAGE_KEYS.SITE_TIMERS, {});
        if (siteTimers[activeTabDomain]) {
            timerStartTime = siteTimers[activeTabDomain];
        } else {
            timerStartTime = Date.now();
        }

        timerPaused = false;

        // Send initial timer update to content script
        await updateTimer();
    } catch (error) {
        console.error("Error handling tab change:", error);
        resetState();
    }
}

/**
 * Update timer and send updates to content script
 */
async function updateTimer() {
    if (!activeTabId || !activeTabDomain || timerPaused) return;

    try {
        const elapsedSeconds = calculateElapsedTime(timerStartTime);

        // Check if we need to send nudges
        await checkAndSendNudges(elapsedSeconds);

        // Send timer update to content script
        chrome.tabs
            .sendMessage(activeTabId, {
                type: MESSAGE_TYPES.TIMER_UPDATE,
                data: {
                    elapsedSeconds,
                    domain: activeTabDomain,
                },
            })
            .catch((error) => {
                // This can happen if the tab is closed or navigating
                console.log("Could not send timer update:", error);
            });

        // Save timer state periodically (every minute)
        if (elapsedSeconds % 60 === 0) {
            await saveCurrentTimer();
        }
    } catch (error) {
        console.error("Error updating timer:", error);
    }
}

/**
 * Check if nudges need to be sent based on elapsed time
 * @param {number} elapsedSeconds - Seconds elapsed on current site
 */
async function checkAndSendNudges(elapsedSeconds) {
    try {
        const doNotDisturb = await getFromStorage(
            STORAGE_KEYS.DO_NOT_DISTURB,
            false
        );
        if (doNotDisturb) return;

        const nudgeTimings = await getFromStorage(
            STORAGE_KEYS.NUDGE_TIMINGS,
            DEFAULT_NUDGE_TIMINGS
        );
        const nudgeMessages = await getFromStorage(STORAGE_KEYS.NUDGE_MESSAGES);

        // Convert minutes to seconds for comparison
        const firstNudgeSeconds = nudgeTimings.first * 60;
        const secondNudgeSeconds = nudgeTimings.second * 60;
        const thirdNudgeSeconds = nudgeTimings.third * 60;

        // Send nudges if time thresholds are reached
        if (elapsedSeconds >= firstNudgeSeconds && !nudgesSent.first) {
            sendNudge("first", nudgeMessages.first);
            nudgesSent.first = true;
        }

        if (elapsedSeconds >= secondNudgeSeconds && !nudgesSent.second) {
            sendNudge("second", nudgeMessages.second);
            nudgesSent.second = true;
        }

        if (elapsedSeconds >= thirdNudgeSeconds && !nudgesSent.third) {
            sendNudge("third", nudgeMessages.third);
            nudgesSent.third = true;
        }
    } catch (error) {
        console.error("Error checking nudges:", error);
    }
}

/**
 * Send a nudge notification to the content script
 * @param {string} level - The nudge level (first, second, third)
 * @param {string} message - The nudge message to display
 */
function sendNudge(level, message) {
    if (!activeTabId) return;

    chrome.tabs
        .sendMessage(activeTabId, {
            type: MESSAGE_TYPES.SHOW_NUDGE,
            data: {
                level,
                message,
            },
        })
        .catch((error) => {
            console.log("Could not send nudge:", error);
        });
}

/**
 * Save the current timer state for the active domain
 */
async function saveCurrentTimer() {
    if (!activeTabDomain || !timerStartTime) return;

    try {
        const siteTimers = await getFromStorage(STORAGE_KEYS.SITE_TIMERS, {});
        siteTimers[activeTabDomain] = timerStartTime;
        await saveToStorage(STORAGE_KEYS.SITE_TIMERS, siteTimers);
    } catch (error) {
        console.error("Error saving current timer:", error);
    }
}

/**
 * Reset the extension state
 */
function resetState() {
    activeTabId = null;
    activeTabUrl = null;
    activeTabDomain = null;
    timerStartTime = null;
    timerPaused = false;
    nudgesSent = {
        first: false,
        second: false,
        third: false,
    };
}

/**
 * Handle get settings request
 * @param {Function} sendResponse - Function to send response back
 */
async function handleGetSettings(sendResponse) {
    try {
        const settings = {
            nudgeTimings: await getFromStorage(STORAGE_KEYS.NUDGE_TIMINGS),
            nudgeMessages: await getFromStorage(STORAGE_KEYS.NUDGE_MESSAGES),
            timerSettings: await getFromStorage(STORAGE_KEYS.TIMER_SETTINGS),
            siteBlacklist: await getFromStorage(STORAGE_KEYS.SITE_BLACKLIST),
            doNotDisturb: await getFromStorage(STORAGE_KEYS.DO_NOT_DISTURB),
        };
        sendResponse(settings);
    } catch (error) {
        console.error("Error getting settings:", error);
        sendResponse({ error: "Failed to get settings" });
    }
}

/**
 * Handle update settings request
 * @param {Object} settings - The settings to update
 */
async function handleUpdateSettings(settings) {
    try {
        if (settings.nudgeTimings) {
            await saveToStorage(
                STORAGE_KEYS.NUDGE_TIMINGS,
                settings.nudgeTimings
            );
        }
        if (settings.nudgeMessages) {
            await saveToStorage(
                STORAGE_KEYS.NUDGE_MESSAGES,
                settings.nudgeMessages
            );
        }
        if (settings.timerSettings) {
            await saveToStorage(
                STORAGE_KEYS.TIMER_SETTINGS,
                settings.timerSettings
            );
        }
        if (settings.siteBlacklist !== undefined) {
            await saveToStorage(
                STORAGE_KEYS.SITE_BLACKLIST,
                settings.siteBlacklist
            );
        }
    } catch (error) {
        console.error("Error updating settings:", error);
    }
}

/**
 * Handle timer pause request
 */
function handleTimerPause() {
    timerPaused = true;
}

/**
 * Handle timer resume request
 */
function handleTimerResume() {
    timerPaused = false;
}

/**
 * Handle timer reset request
 */
function handleTimerReset() {
    if (activeTabDomain) {
        timerStartTime = Date.now();
        nudgesSent = {
            first: false,
            second: false,
            third: false,
        };
    }
}

/**
 * Handle toggle do not disturb request
 * @param {boolean} enabled - Whether do not disturb is enabled
 */
async function handleToggleDoNotDisturb(enabled) {
    try {
        await saveToStorage(STORAGE_KEYS.DO_NOT_DISTURB, enabled);
    } catch (error) {
        console.error("Error toggling do not disturb:", error);
    }
}
