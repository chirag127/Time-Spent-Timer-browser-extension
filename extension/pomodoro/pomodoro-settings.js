/**
 * Pomodoro settings script for Time Spent Timer extension
 */

// DOM elements
const pomodoroEnabledCheckbox = document.getElementById('pomodoro-enabled');
const workDurationInput = document.getElementById('work-duration');
const shortBreakDurationInput = document.getElementById('short-break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');
const autoStartBreaksCheckbox = document.getElementById('auto-start-breaks');
const autoStartWorkCheckbox = document.getElementById('auto-start-work');
const notificationsCheckbox = document.getElementById('notifications');
const startPomodoroBtn = document.getElementById('start-pomodoro');
const stopPomodoroBtn = document.getElementById('stop-pomodoro');
const pomodoroStatusElement = document.getElementById('pomodoro-status');
const saveSettingsBtn = document.getElementById('save-settings');
const backToOptionsBtn = document.getElementById('back-to-options');
const statusMessage = document.getElementById('status-message');

// State variables
let pomodoroState = null;
let pomodoroStatusInterval = null;

// Initialize pomodoro settings
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSettings();
    setupEventListeners();
    await updatePomodoroStatus();
    
    // Start status update interval
    pomodoroStatusInterval = setInterval(updatePomodoroStatus, 1000);
  } catch (error) {
    console.error('Error initializing pomodoro settings:', error);
  }
});

// Clean up when page is unloaded
window.addEventListener('beforeunload', () => {
  if (pomodoroStatusInterval) {
    clearInterval(pomodoroStatusInterval);
  }
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    // Load pomodoro settings
    const pomodoroSettings = await getFromStorage(
      STORAGE_KEYS.POMODORO_SETTINGS, 
      DEFAULT_POMODORO_SETTINGS
    );
    
    // Load accessibility settings
    const accessibilitySettings = await getFromStorage(
      STORAGE_KEYS.ACCESSIBILITY_SETTINGS, 
      DEFAULT_ACCESSIBILITY_SETTINGS
    );
    
    // Apply accessibility settings
    applyAccessibilitySettings(accessibilitySettings);
    
    // Set form values
    pomodoroEnabledCheckbox.checked = pomodoroSettings.enabled;
    workDurationInput.value = pomodoroSettings.workDuration;
    shortBreakDurationInput.value = pomodoroSettings.shortBreakDuration;
    longBreakDurationInput.value = pomodoroSettings.longBreakDuration;
    sessionsBeforeLongBreakInput.value = pomodoroSettings.sessionsBeforeLongBreak;
    autoStartBreaksCheckbox.checked = pomodoroSettings.autoStartBreaks;
    autoStartWorkCheckbox.checked = pomodoroSettings.autoStartWork;
    notificationsCheckbox.checked = pomodoroSettings.notifications;
  } catch (error) {
    console.error('Error loading settings:', error);
    throw error;
  }
}

/**
 * Apply accessibility settings
 * @param {Object} settings - Accessibility settings
 */
function applyAccessibilitySettings(settings) {
  const body = document.body;
  
  // High contrast mode
  if (settings.highContrast) {
    body.classList.add('high-contrast');
    
    // Check if dark mode is preferred
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark-mode');
    }
  }
  
  // Large text
  if (settings.largeText) {
    body.classList.add('large-text');
  }
  
  // Reduced motion
  if (settings.reducedMotion) {
    body.classList.add('reduced-motion');
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Back to options button
  backToOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Start pomodoro button
  startPomodoroBtn.addEventListener('click', startPomodoro);
  
  // Stop pomodoro button
  stopPomodoroBtn.addEventListener('click', stopPomodoro);
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    // Validate inputs
    const workDuration = parseInt(workDurationInput.value);
    const shortBreakDuration = parseInt(shortBreakDurationInput.value);
    const longBreakDuration = parseInt(longBreakDurationInput.value);
    const sessionsBeforeLongBreak = parseInt(sessionsBeforeLongBreakInput.value);
    
    if (workDuration < 1 || shortBreakDuration < 1 || longBreakDuration < 1 || sessionsBeforeLongBreak < 1) {
      showStatus('All durations must be at least 1 minute', false);
      return;
    }
    
    // Create settings object
    const pomodoroSettings = {
      enabled: pomodoroEnabledCheckbox.checked,
      workDuration: workDuration,
      shortBreakDuration: shortBreakDuration,
      longBreakDuration: longBreakDuration,
      sessionsBeforeLongBreak: sessionsBeforeLongBreak,
      autoStartBreaks: autoStartBreaksCheckbox.checked,
      autoStartWork: autoStartWorkCheckbox.checked,
      notifications: notificationsCheckbox.checked
    };
    
    // Save to storage
    await saveToStorage(STORAGE_KEYS.POMODORO_SETTINGS, pomodoroSettings);
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.UPDATE_SETTINGS,
      data: {
        pomodoroSettings: pomodoroSettings
      }
    });
    
    showStatus('Settings saved successfully', true);
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', false);
  }
}

/**
 * Start pomodoro timer
 */
async function startPomodoro() {
  try {
    // Save settings first
    await saveSettings();
    
    // Send message to background script
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.START_POMODORO
    });
    
    // Update status
    await updatePomodoroStatus();
  } catch (error) {
    console.error('Error starting pomodoro:', error);
  }
}

/**
 * Stop pomodoro timer
 */
async function stopPomodoro() {
  try {
    // Send message to background script
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.STOP_POMODORO
    });
    
    // Update status
    await updatePomodoroStatus();
  } catch (error) {
    console.error('Error stopping pomodoro:', error);
  }
}

/**
 * Update pomodoro status
 */
async function updatePomodoroStatus() {
  try {
    // Get pomodoro state from background script
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.GET_POMODORO_STATE
    });
    
    pomodoroState = response;
    
    // Update status element
    updateStatusElement();
  } catch (error) {
    console.error('Error updating pomodoro status:', error);
  }
}

/**
 * Update status element based on pomodoro state
 */
function updateStatusElement() {
  if (!pomodoroState) {
    pomodoroStatusElement.innerHTML = '<p>Pomodoro timer is not active</p>';
    pomodoroStatusElement.className = 'pomodoro-status';
    return;
  }
  
  if (!pomodoroState.isActive) {
    pomodoroStatusElement.innerHTML = '<p>Pomodoro timer is not active</p>';
    pomodoroStatusElement.className = 'pomodoro-status';
    return;
  }
  
  let statusClass = 'pomodoro-status active';
  let statusText = '';
  
  if (pomodoroState.isPaused) {
    statusClass = 'pomodoro-status paused';
    statusText += '<p><strong>PAUSED</strong></p>';
  }
  
  if (pomodoroState.isBreak) {
    statusClass = 'pomodoro-status break';
    statusText += `<p><strong>${pomodoroState.isLongBreak ? 'Long Break' : 'Short Break'}</strong>: ${pomodoroState.formattedTime}</p>`;
  } else {
    statusText += `<p><strong>Work Session</strong>: ${pomodoroState.formattedTime}</p>`;
  }
  
  statusText += `<p>Session ${pomodoroState.currentSession} of ${pomodoroState.sessionsBeforeLongBreak}</p>`;
  statusText += `<p>Total completed sessions: ${pomodoroState.totalSessions}</p>`;
  
  pomodoroStatusElement.innerHTML = statusText;
  pomodoroStatusElement.className = statusClass;
}

/**
 * Show status message
 * @param {string} message - Message to display
 * @param {boolean} success - Whether the message is a success message
 */
function showStatus(message, success) {
  statusMessage.textContent = message;
  statusMessage.className = success ? 'success' : 'error';
  
  // Clear message after 3 seconds
  setTimeout(() => {
    statusMessage.className = '';
  }, 3000);
}
