/**
 * Settings sync functionality for Time Spent Timer extension
 */

// State variables
let syncState = {
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  deviceId: null
};

/**
 * Initialize sync functionality
 */
async function initializeSync() {
  try {
    // Load sync settings
    const syncSettings = await getFromStorage(STORAGE_KEYS.SYNC_SETTINGS, DEFAULT_SYNC_SETTINGS);
    
    // Generate device ID if not exists
    if (!syncSettings.deviceId) {
      syncSettings.deviceId = generateDeviceId();
      await saveToStorage(STORAGE_KEYS.SYNC_SETTINGS, syncSettings);
    }
    
    syncState.deviceId = syncSettings.deviceId;
    syncState.lastSyncTime = syncSettings.lastSynced;
    
    // Set up sync based on frequency
    if (syncSettings.enabled) {
      setupSyncSchedule(syncSettings.syncFrequency);
    }
  } catch (error) {
    console.error('Error initializing sync:', error);
    syncState.syncError = 'Failed to initialize sync';
  }
}

/**
 * Set up sync schedule based on frequency
 * @param {string} frequency - Sync frequency (daily, hourly, realtime)
 */
function setupSyncSchedule(frequency) {
  // Clear existing alarms
  chrome.alarms.clear('syncSettings');
  
  // Set up new alarm based on frequency
  if (frequency === 'daily') {
    chrome.alarms.create('syncSettings', { periodInMinutes: 24 * 60 }); // Once a day
  } else if (frequency === 'hourly') {
    chrome.alarms.create('syncSettings', { periodInMinutes: 60 }); // Once an hour
  } else if (frequency === 'realtime') {
    // For realtime, we'll sync whenever settings change
    // This is handled in the message listeners
  }
}

/**
 * Generate a unique device ID
 * @returns {string} - Unique device ID
 */
function generateDeviceId() {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Sync settings with Chrome sync storage
 */
async function syncSettings() {
  if (syncState.isSyncing) return;
  
  try {
    syncState.isSyncing = true;
    
    // Load sync settings
    const syncSettings = await getFromStorage(STORAGE_KEYS.SYNC_SETTINGS, DEFAULT_SYNC_SETTINGS);
    
    if (!syncSettings.enabled) {
      syncState.isSyncing = false;
      return;
    }
    
    // Get settings to sync
    const settingsToSync = await getSettingsToSync();
    
    // Save to Chrome sync storage
    await chrome.storage.sync.set(settingsToSync);
    
    // Update last sync time
    syncSettings.lastSynced = Date.now();
    await saveToStorage(STORAGE_KEYS.SYNC_SETTINGS, syncSettings);
    
    syncState.lastSyncTime = syncSettings.lastSynced;
    syncState.syncError = null;
    
    // Notify about successful sync
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SYNC_STATUS,
      data: {
        success: true,
        timestamp: syncSettings.lastSynced
      }
    });
  } catch (error) {
    console.error('Error syncing settings:', error);
    syncState.syncError = 'Failed to sync settings';
    
    // Notify about sync error
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SYNC_STATUS,
      data: {
        success: false,
        error: error.message
      }
    });
  } finally {
    syncState.isSyncing = false;
  }
}

/**
 * Get settings from Chrome sync storage
 */
async function getSettingsFromSync() {
  if (syncState.isSyncing) return;
  
  try {
    syncState.isSyncing = true;
    
    // Load sync settings
    const syncSettings = await getFromStorage(STORAGE_KEYS.SYNC_SETTINGS, DEFAULT_SYNC_SETTINGS);
    
    if (!syncSettings.enabled) {
      syncState.isSyncing = false;
      return;
    }
    
    // Get settings from Chrome sync storage
    const syncedSettings = await chrome.storage.sync.get(null);
    
    // Apply synced settings to local storage
    await applySettingsFromSync(syncedSettings);
    
    // Update last sync time
    syncSettings.lastSynced = Date.now();
    await saveToStorage(STORAGE_KEYS.SYNC_SETTINGS, syncSettings);
    
    syncState.lastSyncTime = syncSettings.lastSynced;
    syncState.syncError = null;
    
    // Notify about successful sync
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SYNC_STATUS,
      data: {
        success: true,
        timestamp: syncSettings.lastSynced
      }
    });
  } catch (error) {
    console.error('Error getting settings from sync:', error);
    syncState.syncError = 'Failed to get settings from sync';
    
    // Notify about sync error
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SYNC_STATUS,
      data: {
        success: false,
        error: error.message
      }
    });
  } finally {
    syncState.isSyncing = false;
  }
}

/**
 * Get settings to sync
 * @returns {Object} - Settings to sync
 */
async function getSettingsToSync() {
  // Get settings from local storage
  const nudgeTimings = await getFromStorage(STORAGE_KEYS.NUDGE_TIMINGS, DEFAULT_NUDGE_TIMINGS);
  const nudgeMessages = await getFromStorage(STORAGE_KEYS.NUDGE_MESSAGES, DEFAULT_NUDGE_MESSAGES);
  const timerSettings = await getFromStorage(STORAGE_KEYS.TIMER_SETTINGS, DEFAULT_TIMER_SETTINGS);
  const siteBlacklist = await getFromStorage(STORAGE_KEYS.SITE_BLACKLIST, []);
  const pomodoroSettings = await getFromStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
  const accessibilitySettings = await getFromStorage(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, DEFAULT_ACCESSIBILITY_SETTINGS);
  
  // Create sync object
  return {
    [STORAGE_KEYS.NUDGE_TIMINGS]: nudgeTimings,
    [STORAGE_KEYS.NUDGE_MESSAGES]: nudgeMessages,
    [STORAGE_KEYS.TIMER_SETTINGS]: timerSettings,
    [STORAGE_KEYS.SITE_BLACKLIST]: siteBlacklist,
    [STORAGE_KEYS.POMODORO_SETTINGS]: pomodoroSettings,
    [STORAGE_KEYS.ACCESSIBILITY_SETTINGS]: accessibilitySettings,
    'syncMetadata': {
      deviceId: syncState.deviceId,
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version
    }
  };
}

/**
 * Apply settings from sync
 * @param {Object} syncedSettings - Settings from sync
 */
async function applySettingsFromSync(syncedSettings) {
  // Check if synced settings exist
  if (!syncedSettings || !syncedSettings.syncMetadata) {
    return;
  }
  
  // Check if synced settings are from this device
  if (syncedSettings.syncMetadata.deviceId === syncState.deviceId) {
    return;
  }
  
  // Apply synced settings to local storage
  if (syncedSettings[STORAGE_KEYS.NUDGE_TIMINGS]) {
    await saveToStorage(STORAGE_KEYS.NUDGE_TIMINGS, syncedSettings[STORAGE_KEYS.NUDGE_TIMINGS]);
  }
  
  if (syncedSettings[STORAGE_KEYS.NUDGE_MESSAGES]) {
    await saveToStorage(STORAGE_KEYS.NUDGE_MESSAGES, syncedSettings[STORAGE_KEYS.NUDGE_MESSAGES]);
  }
  
  if (syncedSettings[STORAGE_KEYS.TIMER_SETTINGS]) {
    await saveToStorage(STORAGE_KEYS.TIMER_SETTINGS, syncedSettings[STORAGE_KEYS.TIMER_SETTINGS]);
  }
  
  if (syncedSettings[STORAGE_KEYS.SITE_BLACKLIST]) {
    await saveToStorage(STORAGE_KEYS.SITE_BLACKLIST, syncedSettings[STORAGE_KEYS.SITE_BLACKLIST]);
  }
  
  if (syncedSettings[STORAGE_KEYS.POMODORO_SETTINGS]) {
    await saveToStorage(STORAGE_KEYS.POMODORO_SETTINGS, syncedSettings[STORAGE_KEYS.POMODORO_SETTINGS]);
  }
  
  if (syncedSettings[STORAGE_KEYS.ACCESSIBILITY_SETTINGS]) {
    await saveToStorage(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, syncedSettings[STORAGE_KEYS.ACCESSIBILITY_SETTINGS]);
  }
}

/**
 * Toggle sync functionality
 * @param {boolean} enabled - Whether sync is enabled
 */
async function toggleSync(enabled) {
  try {
    // Load sync settings
    const syncSettings = await getFromStorage(STORAGE_KEYS.SYNC_SETTINGS, DEFAULT_SYNC_SETTINGS);
    
    // Update sync settings
    syncSettings.enabled = enabled;
    
    if (enabled) {
      // Generate device ID if not exists
      if (!syncSettings.deviceId) {
        syncSettings.deviceId = generateDeviceId();
      }
      
      // Set up sync schedule
      setupSyncSchedule(syncSettings.syncFrequency);
      
      // Perform initial sync
      await syncSettings();
    } else {
      // Clear sync alarm
      chrome.alarms.clear('syncSettings');
    }
    
    // Save sync settings
    await saveToStorage(STORAGE_KEYS.SYNC_SETTINGS, syncSettings);
    
    syncState.deviceId = syncSettings.deviceId;
  } catch (error) {
    console.error('Error toggling sync:', error);
    throw error;
  }
}

/**
 * Update sync frequency
 * @param {string} frequency - Sync frequency (daily, hourly, realtime)
 */
async function updateSyncFrequency(frequency) {
  try {
    // Load sync settings
    const syncSettings = await getFromStorage(STORAGE_KEYS.SYNC_SETTINGS, DEFAULT_SYNC_SETTINGS);
    
    // Update sync frequency
    syncSettings.syncFrequency = frequency;
    
    // Set up sync schedule if enabled
    if (syncSettings.enabled) {
      setupSyncSchedule(frequency);
    }
    
    // Save sync settings
    await saveToStorage(STORAGE_KEYS.SYNC_SETTINGS, syncSettings);
  } catch (error) {
    console.error('Error updating sync frequency:', error);
    throw error;
  }
}

/**
 * Get sync status
 * @returns {Object} - Sync status
 */
function getSyncStatus() {
  return {
    enabled: syncState.deviceId !== null,
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    syncError: syncState.syncError,
    deviceId: syncState.deviceId
  };
}
