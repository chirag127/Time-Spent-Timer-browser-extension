/**
 * Analytics dashboard script for Time Spent Timer extension
 */

// DOM elements
const dailyBtn = document.getElementById('daily-btn');
const weeklyBtn = document.getElementById('weekly-btn');
const monthlyBtn = document.getElementById('monthly-btn');
const timeDistributionChart = document.getElementById('time-distribution-chart');
const usageTrendsChart = document.getElementById('usage-trends-chart');
const mostVisitedElement = document.getElementById('most-visited');
const mostVisitedTimeElement = document.getElementById('most-visited-time');
const totalTimeElement = document.getElementById('total-time');
const dailyAverageElement = document.getElementById('daily-average');
const sitesVisitedElement = document.getElementById('sites-visited');
const detailedDataTable = document.getElementById('detailed-data');
const exportCsvBtn = document.getElementById('export-csv');
const exportJsonBtn = document.getElementById('export-json');
const clearDataBtn = document.getElementById('clear-data');
const backToOptionsBtn = document.getElementById('back-to-options');
const confirmationModal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const modalCancelBtn = document.getElementById('modal-cancel');
const modalConfirmBtn = document.getElementById('modal-confirm');

// State variables
let currentPeriod = 'daily';
let analyticsData = null;
let distributionChartInstance = null;
let trendsChartInstance = null;
let pendingAction = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadAnalyticsData();
    setupEventListeners();
    updateDashboard();
  } catch (error) {
    console.error('Error initializing analytics dashboard:', error);
  }
});

/**
 * Load analytics data from storage
 */
async function loadAnalyticsData() {
  try {
    // Get historical data from storage
    analyticsData = await getFromStorage(STORAGE_KEYS.ANALYTICS_DATA, {
      sites: {},
      dailyTotals: {},
      lastUpdated: Date.now()
    });
    
    // If no data, create sample data for demonstration
    if (Object.keys(analyticsData.sites).length === 0) {
      createSampleData();
    }
  } catch (error) {
    console.error('Error loading analytics data:', error);
    throw error;
  }
}

/**
 * Create sample data for demonstration
 */
function createSampleData() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  analyticsData = {
    sites: {
      'example.com': {
        totalTime: 7200, // 2 hours in seconds
        visits: 15,
        lastVisit: now - day,
        dailyData: {}
      },
      'github.com': {
        totalTime: 10800, // 3 hours in seconds
        visits: 20,
        lastVisit: now,
        dailyData: {}
      },
      'youtube.com': {
        totalTime: 5400, // 1.5 hours in seconds
        visits: 10,
        lastVisit: now - 2 * day,
        dailyData: {}
      },
      'google.com': {
        totalTime: 3600, // 1 hour in seconds
        visits: 30,
        lastVisit: now - 3 * day,
        dailyData: {}
      },
      'reddit.com': {
        totalTime: 9000, // 2.5 hours in seconds
        visits: 12,
        lastVisit: now - day / 2,
        dailyData: {}
      }
    },
    dailyTotals: {},
    lastUpdated: now
  };
  
  // Generate daily data for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * day);
    const dateString = date.toISOString().split('T')[0];
    
    // Random daily total between 1-5 hours (in seconds)
    const dailyTotal = Math.floor(Math.random() * 14400) + 3600;
    analyticsData.dailyTotals[dateString] = dailyTotal;
    
    // Distribute the daily total among sites
    Object.keys(analyticsData.sites).forEach(site => {
      // Random percentage of daily total for this site
      const percentage = Math.random();
      const siteTime = Math.floor(dailyTotal * percentage);
      
      if (!analyticsData.sites[site].dailyData) {
        analyticsData.sites[site].dailyData = {};
      }
      
      analyticsData.sites[site].dailyData[dateString] = siteTime;
    });
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Period selector buttons
  dailyBtn.addEventListener('click', () => {
    setActivePeriod('daily');
  });
  
  weeklyBtn.addEventListener('click', () => {
    setActivePeriod('weekly');
  });
  
  monthlyBtn.addEventListener('click', () => {
    setActivePeriod('monthly');
  });
  
  // Export buttons
  exportCsvBtn.addEventListener('click', exportDataAsCsv);
  exportJsonBtn.addEventListener('click', exportDataAsJson);
  
  // Clear data button
  clearDataBtn.addEventListener('click', () => {
    showConfirmationModal('Are you sure you want to clear all analytics data? This action cannot be undone.', clearAllData);
  });
  
  // Back button
  backToOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Modal buttons
  modalCancelBtn.addEventListener('click', hideConfirmationModal);
  modalConfirmBtn.addEventListener('click', () => {
    if (pendingAction) {
      pendingAction();
      pendingAction = null;
    }
    hideConfirmationModal();
  });
}

/**
 * Set active time period
 * @param {string} period - The period to set active (daily, weekly, monthly)
 */
function setActivePeriod(period) {
  currentPeriod = period;
  
  // Update active button
  [dailyBtn, weeklyBtn, monthlyBtn].forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (period === 'daily') {
    dailyBtn.classList.add('active');
  } else if (period === 'weekly') {
    weeklyBtn.classList.add('active');
  } else if (period === 'monthly') {
    monthlyBtn.classList.add('active');
  }
  
  // Update charts and data
  updateDashboard();
}

/**
 * Update the dashboard with current data and period
 */
function updateDashboard() {
  updateTimeDistributionChart();
  updateUsageTrendsChart();
  updateStatistics();
  updateDetailedDataTable();
}

/**
 * Update the time distribution chart
 */
function updateTimeDistributionChart() {
  // Prepare data for the chart
  const sites = Object.keys(analyticsData.sites)
    .sort((a, b) => analyticsData.sites[b].totalTime - analyticsData.sites[a].totalTime)
    .slice(0, 5); // Top 5 sites
  
  const data = sites.map(site => analyticsData.sites[site].totalTime);
  
  // Destroy previous chart if it exists
  if (distributionChartInstance) {
    distributionChartInstance.destroy();
  }
  
  // Create new chart
  distributionChartInstance = new Chart(timeDistributionChart, {
    type: 'pie',
    data: {
      labels: sites,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(74, 108, 247, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(243, 156, 18, 0.8)',
          'rgba(231, 76, 60, 0.8)',
          'rgba(155, 89, 182, 0.8)'
        ],
        borderColor: [
          'rgba(74, 108, 247, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(155, 89, 182, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const formattedTime = formatTime(value);
              return `${context.label}: ${formattedTime}`;
            }
          }
        }
      }
    }
  });
}

/**
 * Update the usage trends chart
 */
function updateUsageTrendsChart() {
  // Get dates for the selected period
  const dates = getDatesForPeriod(currentPeriod);
  
  // Prepare data for the chart
  const labels = [];
  const data = [];
  
  dates.forEach(date => {
    labels.push(formatDate(date, currentPeriod));
    
    // Get total time for this date
    const totalTime = analyticsData.dailyTotals[date] || 0;
    data.push(totalTime / 3600); // Convert seconds to hours
  });
  
  // Destroy previous chart if it exists
  if (trendsChartInstance) {
    trendsChartInstance.destroy();
  }
  
  // Create new chart
  trendsChartInstance = new Chart(usageTrendsChart, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Hours Spent',
        data: data,
        backgroundColor: 'rgba(74, 108, 247, 0.2)',
        borderColor: 'rgba(74, 108, 247, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        }
      }
    }
  });
}

/**
 * Update the statistics section
 */
function updateStatistics() {
  // Calculate total time
  let totalTime = 0;
  Object.values(analyticsData.sites).forEach(site => {
    totalTime += site.totalTime;
  });
  
  // Find most visited site
  let mostVisitedSite = '';
  let mostVisitedTime = 0;
  
  Object.entries(analyticsData.sites).forEach(([site, data]) => {
    if (data.totalTime > mostVisitedTime) {
      mostVisitedSite = site;
      mostVisitedTime = data.totalTime;
    }
  });
  
  // Calculate daily average
  const dates = Object.keys(analyticsData.dailyTotals);
  const totalDays = dates.length || 1;
  const dailyAverage = totalTime / totalDays;
  
  // Update DOM elements
  mostVisitedElement.textContent = mostVisitedSite || 'No data';
  mostVisitedTimeElement.textContent = formatTime(mostVisitedTime);
  totalTimeElement.textContent = formatTime(totalTime);
  dailyAverageElement.textContent = formatTime(dailyAverage);
  sitesVisitedElement.textContent = Object.keys(analyticsData.sites).length;
}

/**
 * Update the detailed data table
 */
function updateDetailedDataTable() {
  // Clear existing rows
  const tbody = detailedDataTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  // Calculate total time
  let totalTime = 0;
  Object.values(analyticsData.sites).forEach(site => {
    totalTime += site.totalTime;
  });
  
  // Sort sites by time spent (descending)
  const sortedSites = Object.entries(analyticsData.sites)
    .sort(([, a], [, b]) => b.totalTime - a.totalTime);
  
  // Add rows for each site
  sortedSites.forEach(([site, data]) => {
    const row = document.createElement('tr');
    
    // Website
    const websiteCell = document.createElement('td');
    websiteCell.textContent = site;
    row.appendChild(websiteCell);
    
    // Time spent
    const timeSpentCell = document.createElement('td');
    timeSpentCell.textContent = formatTime(data.totalTime);
    row.appendChild(timeSpentCell);
    
    // Percentage
    const percentageCell = document.createElement('td');
    const percentage = totalTime > 0 ? (data.totalTime / totalTime * 100).toFixed(1) : 0;
    percentageCell.textContent = `${percentage}%`;
    row.appendChild(percentageCell);
    
    // Last visit
    const lastVisitCell = document.createElement('td');
    lastVisitCell.textContent = formatLastVisit(data.lastVisit);
    row.appendChild(lastVisitCell);
    
    tbody.appendChild(row);
  });
  
  // If no data, show a message
  if (sortedSites.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.textContent = 'No data available';
    cell.colSpan = 4;
    cell.style.textAlign = 'center';
    row.appendChild(cell);
    tbody.appendChild(row);
  }
}

/**
 * Export data as CSV
 */
function exportDataAsCsv() {
  try {
    // Prepare CSV content
    let csvContent = 'Website,Total Time (seconds),Visits,Last Visit\n';
    
    Object.entries(analyticsData.sites).forEach(([site, data]) => {
      const row = [
        site,
        data.totalTime,
        data.visits,
        new Date(data.lastVisit).toISOString()
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-spent-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data as CSV:', error);
  }
}

/**
 * Export data as JSON
 */
function exportDataAsJson() {
  try {
    // Create download link
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-spent-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data as JSON:', error);
  }
}

/**
 * Clear all analytics data
 */
async function clearAllData() {
  try {
    analyticsData = {
      sites: {},
      dailyTotals: {},
      lastUpdated: Date.now()
    };
    
    await saveToStorage(STORAGE_KEYS.ANALYTICS_DATA, analyticsData);
    updateDashboard();
  } catch (error) {
    console.error('Error clearing analytics data:', error);
  }
}

/**
 * Show confirmation modal
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Function to call on confirmation
 */
function showConfirmationModal(message, onConfirm) {
  modalMessage.textContent = message;
  pendingAction = onConfirm;
  confirmationModal.style.display = 'flex';
}

/**
 * Hide confirmation modal
 */
function hideConfirmationModal() {
  confirmationModal.style.display = 'none';
}

/**
 * Get dates for the selected period
 * @param {string} period - The period (daily, weekly, monthly)
 * @returns {Array<string>} - Array of date strings in YYYY-MM-DD format
 */
function getDatesForPeriod(period) {
  const now = new Date();
  const dates = [];
  
  if (period === 'daily') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
  } else if (period === 'weekly') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      dates.push(date.toISOString().split('T')[0]);
    }
  } else if (period === 'monthly') {
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
}

/**
 * Format date for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} period - The period (daily, weekly, monthly)
 * @returns {string} - Formatted date string
 */
function formatDate(dateString, period) {
  const date = new Date(dateString);
  
  if (period === 'daily') {
    // Format as "Mon 01"
    return date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' });
  } else if (period === 'weekly') {
    // Format as "Week 1 Jan"
    const weekNumber = Math.ceil(date.getDate() / 7);
    return `Week ${weekNumber} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
  } else if (period === 'monthly') {
    // Format as "Jan 2023"
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  
  return dateString;
}

/**
 * Format last visit time
 * @param {number} timestamp - Timestamp of last visit
 * @returns {string} - Formatted time string
 */
function formatLastVisit(timestamp) {
  if (!timestamp) return 'Never';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return new Date(timestamp).toLocaleDateString();
}
