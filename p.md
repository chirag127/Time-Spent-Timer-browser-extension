Here’s a complete and production-ready **Product Requirements Document (PRD)** for the **Time Spent Timer** browser extension, followed by a **modular project structure** using Manifest V3.

---

## 🕒 PRD: Time Spent Timer

### 📌 Overview
**Time Spent Timer** is a lightweight, privacy-friendly browser extension that helps users manage their time online by displaying a floating timer on websites they visit. It gently nudges users after spending 5, 10, and 15 minutes on a site, encouraging mindful browsing.

---

### 🎯 Goals
- Increase user awareness of time spent on specific websites.
- Encourage healthier browsing habits.
- Stay unobtrusive, responsive, and fast.

---

### 🧑‍💻 Users
- Students
- Professionals with ADHD
- Digital minimalists
- Casual users who want subtle reminders

---

### 🛠️ Features

#### ✅ Core Features
- ⏱️ Floating timer UI that displays time spent on the current site.
- 🔔 Customizable nudges (after 5, 10, 15 minutes).
- 🔇 "Do Not Disturb" mode for focus.
- ⚙️ Settings page to customize:
  - Nudge timings
  - Messages
  - Timer style/position
  - Blacklist of sites (disable timer on specific sites)

#### 🌐 Site Awareness
- Timer resets when navigating to a different domain.
- Accurate per-domain tracking using `tabs` and `webNavigation` APIs.

---

### 🧩 Tech Stack
- **Manifest V3** (Browser Extension API)
- **HTML/CSS/JS** frontend
- Local storage for preferences
- Web APIs: `tabs`, `storage`, `alarms`, `runtime`, `scripting`

---

## 🗂️ Modular Project Structure

```
extension/
├── manifest.json
├── background/
│   └── background.js            # Tab monitoring, timer logic, alarm triggers
├── content/
│   └── content.js               # Injects floating timer UI
│   └── timerUI.css              # Timer UI styles
├── popup/
│   └── popup.html               # Basic popup (optional)
│   └── popup.js
│   └── popup.css
├── options/
│   └── options.html             # Settings page
│   └── options.js               # Save/load preferences
│   └── options.css
├── utils/
│   └── timer.js                 # Timer utilities (start, pause, reset, format)
│   └── storage.js               # Wrapper for chrome.storage APIs
│   └── constants.js             # Timing thresholds, default messages
├── assets/
│   └── icon128.png              # Extension icon
│   └── icon48.png
│   └── icon16.png
├── _locales/
│   └── en/
│       └── messages.json        # i18n support
└── README.md
```

---

### 🔐 Permissions
```json
"permissions": [
  "tabs",
  "storage",
  "alarms",
  "scripting",
  "activeTab"
],
"host_permissions": [
  "<all_urls>"
]
```

---

### 🔄 Manifest Highlights
```json
{
  "manifest_version": 3,
  "name": "Time Spent Timer",
  "version": "1.0",
  "description": "Shows a floating timer and nudges you after too much time on a site.",
  "background": {
    "service_worker": "background/background.js"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icon16.png",
      "48": "assets/icon48.png",
      "128": "assets/icon128.png"
    }
  },
  "options_page": "options/options.html",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"],
      "css": ["content/timerUI.css"]
    }
  ],
  "icons": {
    "16": "assets/icon16.png",
    "48": "assets/icon48.png",
    "128": "assets/icon128.png"
  }
}
```

---

### 🧠 Nudge Examples
- “Time flies when you're scrolling 🕊 — 5 minutes gone!”
- “10 minutes already! Want to take a stretch break?”
- “15 minutes here. Still intentional?”

---

### 🚀 other requiremnts
- Analytics dashboard for historical time usage
- Pomodoro mode
- Sync settings across devices
- User feedback mechanism
- Dark mode support
- Accessibility features (screen reader support, keyboard navigation)

