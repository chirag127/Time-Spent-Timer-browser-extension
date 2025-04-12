/**
 * Constants for the Time Spent Timer extension
 */

// Default nudge timings in minutes
const DEFAULT_NUDGE_TIMINGS = {
    first: 5,
    second: 10,
    third: 15,
};

// Default nudge messages
const DEFAULT_NUDGE_MESSAGES = {
    first: "Time flies when you're scrolling 🕊 — 5 minutes gone!",
    second: "10 minutes already! Want to take a stretch break?",
    third: "15 minutes here. Still intentional?",
};

// Timer UI default settings
const DEFAULT_TIMER_SETTINGS = {
    position: "top-right", // top-right, top-left, bottom-right, bottom-left
    size: "medium", // small, medium, large
    opacity: 0.8, // 0.0 to 1.0
    showSeconds: true,
    theme: "light", // light, dark
};

// Storage keys
const STORAGE_KEYS = {
    NUDGE_TIMINGS: "nudgeTimings",
    NUDGE_MESSAGES: "nudgeMessages",
    TIMER_SETTINGS: "timerSettings",
    SITE_BLACKLIST: "siteBlacklist",
    DO_NOT_DISTURB: "doNotDisturb",
    SITE_TIMERS: "siteTimers",
};

// Message types for communication between scripts
const MESSAGE_TYPES = {
    TIMER_UPDATE: "timerUpdate",
    TIMER_RESET: "timerReset",
    TIMER_PAUSE: "timerPause",
    TIMER_RESUME: "timerResume",
    SHOW_NUDGE: "showNudge",
    GET_SETTINGS: "getSettings",
    UPDATE_SETTINGS: "updateSettings",
    TOGGLE_DO_NOT_DISTURB: "toggleDoNotDisturb",
};
