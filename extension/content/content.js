/**
 * Content script for Time Spent Timer extension
 * Injects and manages the floating timer UI
 */

// State variables
let timerElement = null;
let nudgeElement = null;
let timerSettings = null;
let currentElapsedSeconds = 0;
let currentDomain = "";

// Initialize content script
(async function () {
    try {
        // Request settings from background script
        const settings = await chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.GET_SETTINGS,
        });

        if (settings) {
            timerSettings = settings.timerSettings;

            // Create and inject timer UI
            createTimerUI();
        }
    } catch (error) {
        console.error("Error initializing content script:", error);
    }
})();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case MESSAGE_TYPES.TIMER_UPDATE:
            handleTimerUpdate(message.data);
            break;

        case MESSAGE_TYPES.SHOW_NUDGE:
            showNudge(message.data);
            break;
    }

    sendResponse({ success: true });
});

/**
 * Create and inject the timer UI
 */
function createTimerUI() {
    // Create timer container
    timerElement = document.createElement("div");
    timerElement.id = "time-spent-timer-container";

    // Apply settings
    updateTimerAppearance();

    // Add timer to the page
    document.body.appendChild(timerElement);

    // Set initial content
    timerElement.textContent = formatTime(0, timerSettings.showSeconds);

    // Add controls
    addTimerControls();
}

/**
 * Update timer appearance based on settings
 */
function updateTimerAppearance() {
    if (!timerElement || !timerSettings) return;

    // Clear existing classes
    timerElement.className = "";

    // Add position class
    timerElement.classList.add(timerSettings.position);

    // Add size class
    timerElement.classList.add(timerSettings.size);

    // Add theme class
    timerElement.classList.add(timerSettings.theme);

    // Set opacity
    timerElement.style.opacity = timerSettings.opacity;
}

/**
 * Add control buttons to the timer
 */
function addTimerControls() {
    if (!timerElement) return;

    // Create controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.id = "time-spent-timer-controls";

    // Create reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "↻";
    resetButton.title = "Reset Timer";
    resetButton.addEventListener("click", (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TIMER_RESET });
    });

    // Create pause/resume button
    const pauseResumeButton = document.createElement("button");
    pauseResumeButton.textContent = "⏸️";
    pauseResumeButton.title = "Pause Timer";
    pauseResumeButton.dataset.state = "running";
    pauseResumeButton.addEventListener("click", (e) => {
        e.stopPropagation();

        if (pauseResumeButton.dataset.state === "running") {
            chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TIMER_PAUSE });
            pauseResumeButton.textContent = "▶️";
            pauseResumeButton.title = "Resume Timer";
            pauseResumeButton.dataset.state = "paused";
        } else {
            chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TIMER_RESUME });
            pauseResumeButton.textContent = "⏸️";
            pauseResumeButton.title = "Pause Timer";
            pauseResumeButton.dataset.state = "running";
        }
    });

    // Add buttons to controls container
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(pauseResumeButton);

    // Add controls to timer
    timerElement.appendChild(controlsContainer);
}

/**
 * Handle timer update message from background script
 * @param {Object} data - Timer update data
 * @param {number} data.elapsedSeconds - Seconds elapsed on current site
 * @param {string} data.domain - Current domain
 */
function handleTimerUpdate(data) {
    if (!timerElement) return;

    currentElapsedSeconds = data.elapsedSeconds;
    currentDomain = data.domain;

    // Update timer display
    const timeDisplay = formatTime(
        currentElapsedSeconds,
        timerSettings?.showSeconds
    );

    // Update only the text node, not the controls
    const textNode = Array.from(timerElement.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE
    );

    if (textNode) {
        textNode.nodeValue = timeDisplay;
    } else {
        timerElement.prepend(timeDisplay);
    }
}

/**
 * Show a nudge notification
 * @param {Object} data - Nudge data
 * @param {string} data.level - Nudge level (first, second, third)
 * @param {string} data.message - Nudge message to display
 */
function showNudge(data) {
    // Remove existing nudge if present
    if (nudgeElement && nudgeElement.parentNode) {
        nudgeElement.parentNode.removeChild(nudgeElement);
    }

    // Create new nudge element
    nudgeElement = document.createElement("div");
    nudgeElement.id = "time-spent-timer-nudge";
    nudgeElement.classList.add(timerSettings?.theme || "light");
    nudgeElement.textContent = data.message;

    // Add nudge to the page
    document.body.appendChild(nudgeElement);

    // Remove nudge after animation completes (5 seconds)
    setTimeout(() => {
        if (nudgeElement && nudgeElement.parentNode) {
            nudgeElement.parentNode.removeChild(nudgeElement);
            nudgeElement = null;
        }
    }, 5000);
}
