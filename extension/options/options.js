/**
 * Options page script for Time Spent Timer extension
 */

import { 
  STORAGE_KEYS, 
  DEFAULT_NUDGE_TIMINGS, 
  DEFAULT_NUDGE_MESSAGES, 
  DEFAULT_TIMER_SETTINGS,
  MESSAGE_TYPES
} from '../utils/constants.js';
import { getFromStorage, saveToStorage } from '../utils/storage.js';

// DOM elements
const positionSelect = document.getElementById('position');
const sizeSelect = document.getElementById('size');
const opacityRange = document.getElementById('opacity');
const opacityValue = document.getElementById('opacity-value');
const themeSelect = document.getElementById('theme');
const showSecondsCheckbox = document.getElementById('show-seconds');

const firstNudgeInput = document.getElementById('first-nudge');
const secondNudgeInput = document.getElementById('second-nudge');
const thirdNudgeInput = document.getElementById('third-nudge');
const firstMessageInput = document.getElementById('first-message');
const secondMessageInput = document.getElementById('second-message');
const thirdMessageInput = document.getElementById('third-message');
const doNotDisturbCheckbox = document.getElementById('do-not-disturb');

const blacklistEntry = document.getElementById('blacklist-entry');
const addBlacklistButton = document.getElementById('add-blacklist');
const blacklistElement = document.getElementById('blacklist');

const saveButton = document.getElementById('save-settings');
const resetButton = document.getElementById('reset-settings');
const statusMessage = document.getElementById('status-message');

// State variables
let blacklist = [];

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSettings();
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing options page:', error);
    showStatus('Error loading settings', false);
  }
});

/**
 * Load settings from storage and populate form
 */
async function loadSettings() {
  try {
    // Load timer settings
    const timerSettings = await getFromStorage(STORAGE_KEYS.TIMER_SETTINGS, DEFAULT_TIMER_SETTINGS);
    positionSelect.value = timerSettings.position;
    sizeSelect.value = timerSettings.size;
    opacityRange.value = timerSettings.opacity;
    opacityValue.textContent = timerSettings.opacity;
    themeSelect.value = timerSettings.theme;
    showSecondsCheckbox.checked = timerSettings.showSeconds;
    
    // Load nudge settings
    const nudgeTimings = await getFromStorage(STORAGE_KEYS.NUDGE_TIMINGS, DEFAULT_NUDGE_TIMINGS);
    firstNudgeInput.value = nudgeTimings.first;
    secondNudgeInput.value = nudgeTimings.second;
    thirdNudgeInput.value = nudgeTimings.third;
    
    const nudgeMessages = await getFromStorage(STORAGE_KEYS.NUDGE_MESSAGES, DEFAULT_NUDGE_MESSAGES);
    firstMessageInput.value = nudgeMessages.first;
    secondMessageInput.value = nudgeMessages.second;
    thirdMessageInput.value = nudgeMessages.third;
    
    // Load do not disturb setting
    const doNotDisturb = await getFromStorage(STORAGE_KEYS.DO_NOT_DISTURB, false);
    doNotDisturbCheckbox.checked = doNotDisturb;
    
    // Load blacklist
    blacklist = await getFromStorage(STORAGE_KEYS.SITE_BLACKLIST, []);
    renderBlacklist();
  } catch (error) {
    console.error('Error loading settings:', error);
    throw error;
  }
}

/**
 * Set up event listeners for form elements
 */
function setupEventListeners() {
  // Opacity range input
  opacityRange.addEventListener('input', () => {
    opacityValue.textContent = opacityRange.value;
  });
  
  // Add to blacklist button
  addBlacklistButton.addEventListener('click', addToBlacklist);
  blacklistEntry.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addToBlacklist();
    }
  });
  
  // Save settings button
  saveButton.addEventListener('click', saveSettings);
  
  // Reset settings button
  resetButton.addEventListener('click', resetSettings);
}

/**
 * Add a domain to the blacklist
 */
function addToBlacklist() {
  const domain = blacklistEntry.value.trim().toLowerCase();
  
  if (!domain) {
    return;
  }
  
  // Check if domain is already in blacklist
  if (blacklist.includes(domain)) {
    showStatus('Domain is already in the blacklist', false);
    return;
  }
  
  // Add domain to blacklist
  blacklist.push(domain);
  blacklistEntry.value = '';
  
  // Update UI
  renderBlacklist();
}

/**
 * Remove a domain from the blacklist
 * @param {string} domain - Domain to remove
 */
function removeFromBlacklist(domain) {
  blacklist = blacklist.filter(item => item !== domain);
  renderBlacklist();
}

/**
 * Render the blacklist in the UI
 */
function renderBlacklist() {
  // Clear existing list
  blacklistElement.innerHTML = '';
  
  // Add each domain to the list
  if (blacklist.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No domains in blacklist';
    emptyItem.style.color = '#999';
    emptyItem.style.fontStyle = 'italic';
    blacklistElement.appendChild(emptyItem);
  } else {
    blacklist.forEach(domain => {
      const listItem = document.createElement('li');
      
      const domainText = document.createElement('span');
      domainText.textContent = domain;
      
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeFromBlacklist(domain));
      
      listItem.appendChild(domainText);
      listItem.appendChild(removeButton);
      blacklistElement.appendChild(listItem);
    });
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    // Validate nudge timings
    const first = parseInt(firstNudgeInput.value);
    const second = parseInt(secondNudgeInput.value);
    const third = parseInt(thirdNudgeInput.value);
    
    if (first >= second || second >= third) {
      showStatus('Nudge timings must be in ascending order', false);
      return;
    }
    
    // Save timer settings
    const timerSettings = {
      position: positionSelect.value,
      size: sizeSelect.value,
      opacity: parseFloat(opacityRange.value),
      theme: themeSelect.value,
      showSeconds: showSecondsCheckbox.checked
    };
    await saveToStorage(STORAGE_KEYS.TIMER_SETTINGS, timerSettings);
    
    // Save nudge settings
    const nudgeTimings = {
      first,
      second,
      third
    };
    await saveToStorage(STORAGE_KEYS.NUDGE_TIMINGS, nudgeTimings);
    
    const nudgeMessages = {
      first: firstMessageInput.value,
      second: secondMessageInput.value,
      third: thirdMessageInput.value
    };
    await saveToStorage(STORAGE_KEYS.NUDGE_MESSAGES, nudgeMessages);
    
    // Save do not disturb setting
    await saveToStorage(STORAGE_KEYS.DO_NOT_DISTURB, doNotDisturbCheckbox.checked);
    
    // Save blacklist
    await saveToStorage(STORAGE_KEYS.SITE_BLACKLIST, blacklist);
    
    // Notify background script of settings update
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.UPDATE_SETTINGS,
      data: {
        timerSettings,
        nudgeTimings,
        nudgeMessages,
        siteBlacklist: blacklist,
        doNotDisturb: doNotDisturbCheckbox.checked
      }
    });
    
    showStatus('Settings saved successfully', true);
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', false);
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    try {
      // Reset timer settings
      await saveToStorage(STORAGE_KEYS.TIMER_SETTINGS, DEFAULT_TIMER_SETTINGS);
      
      // Reset nudge settings
      await saveToStorage(STORAGE_KEYS.NUDGE_TIMINGS, DEFAULT_NUDGE_TIMINGS);
      await saveToStorage(STORAGE_KEYS.NUDGE_MESSAGES, DEFAULT_NUDGE_MESSAGES);
      
      // Reset do not disturb
      await saveToStorage(STORAGE_KEYS.DO_NOT_DISTURB, false);
      
      // Reset blacklist
      await saveToStorage(STORAGE_KEYS.SITE_BLACKLIST, []);
      
      // Reload settings
      await loadSettings();
      
      showStatus('Settings reset to defaults', true);
    } catch (error) {
      console.error('Error resetting settings:', error);
      showStatus('Error resetting settings', false);
    }
  }
}

/**
 * Show a status message
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
