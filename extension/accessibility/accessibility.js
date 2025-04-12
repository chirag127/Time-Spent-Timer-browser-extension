/**
 * Accessibility settings script for Time Spent Timer extension
 */

// DOM elements
const highContrastCheckbox = document.getElementById('high-contrast');
const largeTextCheckbox = document.getElementById('large-text');
const darkModeCheckbox = document.getElementById('dark-mode');
const reducedMotionCheckbox = document.getElementById('reduced-motion');
const screenReaderOptimizedCheckbox = document.getElementById('screen-reader-optimized');
const keyboardShortcutsCheckbox = document.getElementById('keyboard-shortcuts');
const shortcutsList = document.getElementById('shortcuts-list');
const saveSettingsBtn = document.getElementById('save-settings');
const backToOptionsBtn = document.getElementById('back-to-options');
const statusMessage = document.getElementById('status-message');

// Initialize accessibility settings
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSettings();
    setupEventListeners();
    applyCurrentSettings();
  } catch (error) {
    console.error('Error initializing accessibility settings:', error);
  }
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    // Load accessibility settings
    const accessibilitySettings = await getFromStorage(
      STORAGE_KEYS.ACCESSIBILITY_SETTINGS, 
      DEFAULT_ACCESSIBILITY_SETTINGS
    );
    
    // Load timer settings for dark mode
    const timerSettings = await getFromStorage(
      STORAGE_KEYS.TIMER_SETTINGS, 
      DEFAULT_TIMER_SETTINGS
    );
    
    // Set checkbox values
    highContrastCheckbox.checked = accessibilitySettings.highContrast;
    largeTextCheckbox.checked = accessibilitySettings.largeText;
    darkModeCheckbox.checked = timerSettings.useDarkMode;
    reducedMotionCheckbox.checked = accessibilitySettings.reducedMotion;
    screenReaderOptimizedCheckbox.checked = accessibilitySettings.screenReaderOptimized;
    keyboardShortcutsCheckbox.checked = accessibilitySettings.keyboardShortcuts;
    
    // Show/hide shortcuts list
    shortcutsList.style.display = accessibilitySettings.keyboardShortcuts ? 'block' : 'none';
  } catch (error) {
    console.error('Error loading settings:', error);
    throw error;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // High contrast checkbox
  highContrastCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('high-contrast', highContrastCheckbox.checked);
  });
  
  // Large text checkbox
  largeTextCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('large-text', largeTextCheckbox.checked);
  });
  
  // Dark mode checkbox
  darkModeCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
  });
  
  // Reduced motion checkbox
  reducedMotionCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('reduced-motion', reducedMotionCheckbox.checked);
  });
  
  // Keyboard shortcuts checkbox
  keyboardShortcutsCheckbox.addEventListener('change', () => {
    shortcutsList.style.display = keyboardShortcutsCheckbox.checked ? 'block' : 'none';
  });
  
  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Back to options button
  backToOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Add keyboard focus class when using keyboard navigation
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-focus');
    }
  });
  
  // Remove keyboard focus class when using mouse
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-focus');
  });
}

/**
 * Apply current settings to the page
 */
function applyCurrentSettings() {
  // Apply high contrast
  document.body.classList.toggle('high-contrast', highContrastCheckbox.checked);
  
  // Apply large text
  document.body.classList.toggle('large-text', largeTextCheckbox.checked);
  
  // Apply dark mode
  document.body.classList.toggle('dark-mode', darkModeCheckbox.checked);
  
  // Apply reduced motion
  document.body.classList.toggle('reduced-motion', reducedMotionCheckbox.checked);
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    // Get accessibility settings
    const accessibilitySettings = {
      highContrast: highContrastCheckbox.checked,
      largeText: largeTextCheckbox.checked,
      screenReaderOptimized: screenReaderOptimizedCheckbox.checked,
      reducedMotion: reducedMotionCheckbox.checked,
      keyboardShortcuts: keyboardShortcutsCheckbox.checked
    };
    
    // Save accessibility settings
    await saveToStorage(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, accessibilitySettings);
    
    // Get timer settings
    const timerSettings = await getFromStorage(STORAGE_KEYS.TIMER_SETTINGS, DEFAULT_TIMER_SETTINGS);
    
    // Update dark mode setting
    timerSettings.useDarkMode = darkModeCheckbox.checked;
    
    // Save timer settings
    await saveToStorage(STORAGE_KEYS.TIMER_SETTINGS, timerSettings);
    
    // Notify background script of settings update
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.UPDATE_ACCESSIBILITY,
      data: accessibilitySettings
    });
    
    // Show success message
    showStatus('Settings saved successfully', true);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
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
