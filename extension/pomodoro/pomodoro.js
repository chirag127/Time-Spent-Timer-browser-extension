/**
 * Pomodoro timer functionality for Time Spent Timer extension
 */

// State variables
let pomodoroState = {
  isActive: false,
  isBreak: false,
  isLongBreak: false,
  currentSession: 1,
  timeRemaining: 0, // in seconds
  totalSessions: 0,
  startTime: null,
  pauseTime: null,
  isPaused: false
};

// Initialize pomodoro
async function initializePomodoro() {
  try {
    // Load pomodoro settings
    const settings = await getFromStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
    
    // Reset pomodoro state
    resetPomodoroState(settings);
    
    // Set up alarm for pomodoro timer
    chrome.alarms.create('pomodoroTimer', { periodInMinutes: 0.1 }); // Check every 6 seconds
  } catch (error) {
    console.error('Error initializing pomodoro:', error);
  }
}

/**
 * Reset pomodoro state
 * @param {Object} settings - Pomodoro settings
 */
function resetPomodoroState(settings) {
  pomodoroState = {
    isActive: false,
    isBreak: false,
    isLongBreak: false,
    currentSession: 1,
    timeRemaining: settings.workDuration * 60, // Convert to seconds
    totalSessions: 0,
    startTime: null,
    pauseTime: null,
    isPaused: false
  };
}

/**
 * Start pomodoro timer
 */
async function startPomodoro() {
  try {
    const settings = await getFromStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
    
    if (!pomodoroState.isActive || pomodoroState.isPaused) {
      if (!pomodoroState.isPaused) {
        // Starting a new pomodoro
        pomodoroState.isActive = true;
        pomodoroState.isPaused = false;
        pomodoroState.isBreak = false;
        pomodoroState.isLongBreak = false;
        pomodoroState.timeRemaining = settings.workDuration * 60;
      } else {
        // Resuming a paused pomodoro
        pomodoroState.isPaused = false;
      }
      
      pomodoroState.startTime = Date.now();
      
      // Notify content script
      updatePomodoroUI();
    }
  } catch (error) {
    console.error('Error starting pomodoro:', error);
  }
}

/**
 * Pause pomodoro timer
 */
function pausePomodoro() {
  if (pomodoroState.isActive && !pomodoroState.isPaused) {
    pomodoroState.isPaused = true;
    pomodoroState.pauseTime = Date.now();
    
    // Calculate time remaining
    const elapsedSeconds = Math.floor((pomodoroState.pauseTime - pomodoroState.startTime) / 1000);
    pomodoroState.timeRemaining = Math.max(0, pomodoroState.timeRemaining - elapsedSeconds);
    
    // Notify content script
    updatePomodoroUI();
  }
}

/**
 * Stop pomodoro timer
 */
async function stopPomodoro() {
  try {
    const settings = await getFromStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
    resetPomodoroState(settings);
    
    // Notify content script
    updatePomodoroUI();
  } catch (error) {
    console.error('Error stopping pomodoro:', error);
  }
}

/**
 * Skip current break
 */
async function skipBreak() {
  try {
    if (pomodoroState.isActive && pomodoroState.isBreak) {
      const settings = await getFromStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
      
      pomodoroState.isBreak = false;
      pomodoroState.isLongBreak = false;
      pomodoroState.timeRemaining = settings.workDuration * 60;
      pomodoroState.startTime = Date.now();
      pomodoroState.isPaused = false;
      
      // Notify content script
      updatePomodoroUI();
    }
  } catch (error) {
    console.error('Error skipping break:', error);
  }
}

/**
 * Update pomodoro timer
 */
async function updatePomodoro() {
  try {
    if (!pomodoroState.isActive || pomodoroState.isPaused) {
      return;
    }
    
    const settings = await getFromStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - pomodoroState.startTime) / 1000);
    
    pomodoroState.timeRemaining = Math.max(0, pomodoroState.timeRemaining - elapsedSeconds);
    pomodoroState.startTime = now;
    
    // Check if timer has ended
    if (pomodoroState.timeRemaining <= 0) {
      if (pomodoroState.isBreak) {
        // Break ended, start work session
        handleBreakEnded(settings);
      } else {
        // Work session ended, start break
        handleWorkEnded(settings);
      }
    }
    
    // Notify content script
    updatePomodoroUI();
  } catch (error) {
    console.error('Error updating pomodoro:', error);
  }
}

/**
 * Handle work session ended
 * @param {Object} settings - Pomodoro settings
 */
function handleWorkEnded(settings) {
  // Increment session count
  pomodoroState.totalSessions++;
  
  // Determine if it's time for a long break
  const isLongBreak = pomodoroState.currentSession >= settings.sessionsBeforeLongBreak;
  
  pomodoroState.isBreak = true;
  pomodoroState.isLongBreak = isLongBreak;
  
  if (isLongBreak) {
    pomodoroState.timeRemaining = settings.longBreakDuration * 60;
    pomodoroState.currentSession = 1; // Reset session counter
  } else {
    pomodoroState.timeRemaining = settings.shortBreakDuration * 60;
    pomodoroState.currentSession++;
  }
  
  // Show notification
  showPomodoroNotification(
    'Work session completed!',
    `Time for a ${isLongBreak ? 'long' : 'short'} break.`
  );
  
  // Auto-start break if enabled
  if (!settings.autoStartBreaks) {
    pomodoroState.isPaused = true;
  }
}

/**
 * Handle break ended
 * @param {Object} settings - Pomodoro settings
 */
function handleBreakEnded(settings) {
  pomodoroState.isBreak = false;
  pomodoroState.isLongBreak = false;
  pomodoroState.timeRemaining = settings.workDuration * 60;
  
  // Show notification
  showPomodoroNotification(
    'Break completed!',
    'Time to get back to work.'
  );
  
  // Auto-start work if enabled
  if (!settings.autoStartWork) {
    pomodoroState.isPaused = true;
  }
}

/**
 * Show pomodoro notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function showPomodoroNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../assets/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
}

/**
 * Update pomodoro UI in content script
 */
function updatePomodoroUI() {
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, {
      type: 'pomodoroUpdate',
      data: {
        isActive: pomodoroState.isActive,
        isBreak: pomodoroState.isBreak,
        isLongBreak: pomodoroState.isLongBreak,
        timeRemaining: pomodoroState.timeRemaining,
        isPaused: pomodoroState.isPaused,
        currentSession: pomodoroState.currentSession,
        totalSessions: pomodoroState.totalSessions
      }
    }).catch(error => {
      // This can happen if the tab is closed or navigating
      console.log('Could not send pomodoro update:', error);
    });
  }
}

/**
 * Format pomodoro time
 * @param {number} seconds - Seconds to format
 * @returns {string} - Formatted time string (MM:SS)
 */
function formatPomodoroTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get pomodoro state
 * @returns {Object} - Current pomodoro state
 */
function getPomodoroState() {
  return {
    ...pomodoroState,
    formattedTime: formatPomodoroTime(pomodoroState.timeRemaining)
  };
}
