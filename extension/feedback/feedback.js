/**
 * Feedback form script for Time Spent Timer extension
 */

// DOM elements
const feedbackForm = document.getElementById('feedback-form');
const submitFeedbackBtn = document.getElementById('submit-feedback');
const cancelFeedbackBtn = document.getElementById('cancel-feedback');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const backToOptionsBtn = document.getElementById('back-to-options');
const tryAgainBtn = document.getElementById('try-again');

// Initialize feedback form
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load accessibility settings
    const accessibilitySettings = await getFromStorage(
      STORAGE_KEYS.ACCESSIBILITY_SETTINGS, 
      DEFAULT_ACCESSIBILITY_SETTINGS
    );
    
    // Apply accessibility settings
    applyAccessibilitySettings(accessibilitySettings);
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing feedback form:', error);
  }
});

/**
 * Apply accessibility settings to the feedback form
 * @param {Object} settings - Accessibility settings
 */
function applyAccessibilitySettings(settings) {
  const body = document.body;
  
  // High contrast mode
  if (settings.highContrast) {
    body.classList.add('high-contrast');
    
    // Check if dark mode is preferred
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark');
    }
  }
  
  // Large text
  if (settings.largeText) {
    body.classList.add('large-text');
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Submit feedback
  feedbackForm.addEventListener('submit', handleSubmitFeedback);
  
  // Cancel feedback
  cancelFeedbackBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Back to options
  backToOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Try again
  tryAgainBtn.addEventListener('click', () => {
    errorMessage.style.display = 'none';
    feedbackForm.style.display = 'block';
  });
}

/**
 * Handle feedback form submission
 * @param {Event} event - Form submit event
 */
async function handleSubmitFeedback(event) {
  event.preventDefault();
  
  try {
    // Get form data
    const formData = new FormData(feedbackForm);
    const feedback = {
      rating: formData.get('rating'),
      likes: formData.get('likes'),
      improvements: formData.get('improvements'),
      featureRequests: formData.get('featureRequests'),
      email: formData.get('email'),
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version
    };
    
    // Validate form
    if (!feedback.rating) {
      alert('Please provide a rating.');
      return;
    }
    
    // Save feedback to storage
    await saveFeedback(feedback);
    
    // Send feedback to background script
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SUBMIT_FEEDBACK,
      data: feedback
    });
    
    // Show success message
    feedbackForm.style.display = 'none';
    successMessage.style.display = 'block';
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    // Show error message
    feedbackForm.style.display = 'none';
    errorMessage.style.display = 'block';
  }
}

/**
 * Save feedback to storage
 * @param {Object} feedback - Feedback data
 */
async function saveFeedback(feedback) {
  try {
    // Get existing feedback
    const existingFeedback = await getFromStorage(STORAGE_KEYS.USER_FEEDBACK, []);
    
    // Add new feedback
    existingFeedback.push(feedback);
    
    // Save to storage
    await saveToStorage(STORAGE_KEYS.USER_FEEDBACK, existingFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
}
