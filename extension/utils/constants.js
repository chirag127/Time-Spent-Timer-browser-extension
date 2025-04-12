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
    useDarkMode: false, // Auto-switch to dark mode based on system preference
    highContrast: false, // High contrast mode for accessibility
};

// Default Pomodoro settings
const DEFAULT_POMODORO_SETTINGS = {
    enabled: false,
    workDuration: 25, // minutes
    shortBreakDuration: 5, // minutes
    longBreakDuration: 15, // minutes
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: false,
    notifications: true,
};

// Default sync settings
const DEFAULT_SYNC_SETTINGS = {
    enabled: false,
    syncFrequency: "daily", // daily, hourly, realtime
    lastSynced: null,
    deviceId: null,
    syncToken: null,
};

// Default accessibility settings
const DEFAULT_ACCESSIBILITY_SETTINGS = {
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
    reducedMotion: false,
    keyboardShortcuts: true,
};

// Storage keys
const STORAGE_KEYS = {
    NUDGE_TIMINGS: "nudgeTimings",
    NUDGE_MESSAGES: "nudgeMessages",
    TIMER_SETTINGS: "timerSettings",
    SITE_BLACKLIST: "siteBlacklist",
    DO_NOT_DISTURB: "doNotDisturb",
    SITE_TIMERS: "siteTimers",
    ANALYTICS_DATA: "analyticsData",
    POMODORO_SETTINGS: "pomodoroSettings",
    SYNC_SETTINGS: "syncSettings",
    USER_FEEDBACK: "userFeedback",
    ACCESSIBILITY_SETTINGS: "accessibilitySettings",
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

    // Analytics messages
    LOG_SITE_VISIT: "logSiteVisit",
    GET_ANALYTICS_DATA: "getAnalyticsData",
    CLEAR_ANALYTICS_DATA: "clearAnalyticsData",

    // Pomodoro messages
    START_POMODORO: "startPomodoro",
    PAUSE_POMODORO: "pausePomodoro",
    STOP_POMODORO: "stopPomodoro",
    SKIP_BREAK: "skipBreak",
    GET_POMODORO_STATE: "getPomodoroState",

    // Sync messages
    SYNC_DATA: "syncData",
    SYNC_STATUS: "syncStatus",

    // Feedback messages
    SUBMIT_FEEDBACK: "submitFeedback",

    // Accessibility messages
    UPDATE_ACCESSIBILITY: "updateAccessibility",
};
