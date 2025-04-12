/**
 * Popup script for Time Spent Timer extension
 */

import { MESSAGE_TYPES, STORAGE_KEYS } from '../utils/constants.js';
import { formatTime, extractDomain } from '../utils/timer.js';
import { getFromStorage, saveToStorage } from '../utils/storage.js';

// DOM elements
const currentDomainElement = document.getElementById('current-domain');
const timeSpentElement = document.getElementById('time-spent');
const resetTimerButton = document.getElementById('reset-timer');
const toggleTimerButton = document.getElementById('toggle-timer');
const toggleIcon = document.getElementById('toggle-icon');
const toggleLabel = document.getElementById('toggle-label');
const toggleDndButton = document.getElementById('toggle-dnd');
const dndIcon = document.getElementById('dnd-icon');
const dndLabel = document.getElementById('dnd-label');
const openOptionsButton = document.getElementById('open-options');

// State variables
let currentTabId = null;
let currentDomain = '';
let timerPaused = false;
let doNotDisturb = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializePopup();
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing popup:', error);
    currentDomainElement.textContent = 'Error';
    timeSpentElement.textContent = 'Error';
  }
});

/**
 * Initialize popup with current tab and settings
 */
async function initializePopup() {
  try {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (!currentTab || !currentTab.url || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('chrome-extension://')) {
      currentDomainElement.textContent = 'Not available';
      timeSpentElement.textContent = 'Not available';
      disableControls();
      return;
    }
    
    currentTabId = currentTab.id;
    currentDomain = extractDomain(currentTab.url);
    currentDomainElement.textContent = currentDomain;
    
    // Get current timer state
    const siteTimers = await getFromStorage(STORAGE_KEYS.SITE_TIMERS, {});
    const startTime = siteTimers[currentDomain];
    
    if (startTime) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      timeSpentElement.textContent = formatTime(elapsedSeconds, true);
    } else {
      timeSpentElement.textContent = 'Just started';
    }
    
    // Get Do Not Disturb state
    doNotDisturb = await getFromStorage(STORAGE_KEYS.DO_NOT_DISTURB, false);
    updateDndButton();
  } catch (error) {
    console.error('Error in initializePopup:', error);
    throw error;
  }
}

/**
 * Set up event listeners for buttons
 */
function setupEventListeners() {
  // Reset timer button
  resetTimerButton.addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TIMER_RESET });
      timeSpentElement.textContent = 'Just reset';
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  });
  
  // Toggle timer button
  toggleTimerButton.addEventListener('click', async () => {
    try {
      timerPaused = !timerPaused;
      
      if (timerPaused) {
        await chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TIMER_PAUSE });
        toggleIcon.textContent = '▶️';
        toggleLabel.textContent = 'Resume Timer';
        toggleTimerButton.classList.add('paused');
      } else {
        await chrome.runtime.sendMessage({ type: MESSAGE_TYPES.TIMER_RESUME });
        toggleIcon.textContent = '⏸️';
        toggleLabel.textContent = 'Pause Timer';
        toggleTimerButton.classList.remove('paused');
      }
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  });
  
  // Toggle Do Not Disturb button
  toggleDndButton.addEventListener('click', async () => {
    try {
      doNotDisturb = !doNotDisturb;
      await saveToStorage(STORAGE_KEYS.DO_NOT_DISTURB, doNotDisturb);
      await chrome.runtime.sendMessage({ 
        type: MESSAGE_TYPES.TOGGLE_DO_NOT_DISTURB, 
        data: doNotDisturb 
      });
      updateDndButton();
    } catch (error) {
      console.error('Error toggling Do Not Disturb:', error);
    }
  });
  
  // Open options button
  openOptionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

/**
 * Update the Do Not Disturb button appearance
 */
function updateDndButton() {
  if (doNotDisturb) {
    dndIcon.textContent = '🔕';
    dndLabel.textContent = 'Notifications Off';
    toggleDndButton.classList.add('active');
  } else {
    dndIcon.textContent = '🔔';
    dndLabel.textContent = 'Do Not Disturb';
    toggleDndButton.classList.remove('active');
  }
}

/**
 * Disable controls when not on a valid page
 */
function disableControls() {
  resetTimerButton.disabled = true;
  toggleTimerButton.disabled = true;
  resetTimerButton.style.opacity = 0.5;
  toggleTimerButton.style.opacity = 0.5;
}
