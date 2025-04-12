# Time Spent Timer Browser Extension

A lightweight, privacy-friendly browser extension that helps you manage your time online by displaying a floating timer on websites you visit. It gently nudges you after spending 5, 10, and 15 minutes on a site, encouraging mindful browsing.

## Features

-   **Floating Timer UI**: Displays time spent on the current site with customizable appearance
-   **Gentle Nudges**: Customizable reminders at 5, 10, and 15 minutes (adjustable)
-   **Do Not Disturb Mode**: Temporarily disable nudges when you need to focus
-   **Site Blacklist**: Disable the timer on specific sites
-   **Customizable Settings**: Adjust timer position, size, opacity, and theme
-   **Privacy-Focused**: All data stays on your device, no tracking or data collection

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "Time Spent Timer"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `extension` folder from this repository

## Usage

After installation, the extension will automatically start tracking time spent on websites:

-   A floating timer will appear on every website (can be customized in settings)
-   Nudges will appear after 5, 10, and 15 minutes (customizable)
-   Click the extension icon to see options for the current site
-   Access full settings by right-clicking the extension icon and selecting "Options"

## Customization

### Timer Appearance

-   **Position**: Top-right, top-left, bottom-right, or bottom-left
-   **Size**: Small, medium, or large
-   **Opacity**: Adjust transparency from 10% to 100%
-   **Theme**: Light or dark
-   **Show Seconds**: Toggle seconds display on/off

### Nudge Settings

-   **Timing**: Customize when nudges appear (in minutes)
-   **Messages**: Personalize the nudge messages
-   **Do Not Disturb**: Temporarily disable all nudges

### Site Blacklist

-   Add domains where you don't want the timer to appear

## Privacy

This extension:

-   Does not collect any data
-   Does not send any information to external servers
-   Stores all settings locally on your device
-   Does not track your browsing history

## Development

This extension is built using:

-   Manifest V3
-   HTML/CSS/JavaScript
-   Chrome Extension APIs

### Project Structure

```
extension/
├── manifest.json
├── background/
│   └── background.js            # Tab monitoring, timer logic, alarm triggers
├── content/
│   └── content.js               # Injects floating timer UI
│   └── timerUI.css              # Timer UI styles
├── popup/
│   └── popup.html               # Basic popup
│   └── popup.js
│   └── popup.css
├── options/
│   └── options.html             # Settings page
│   └── options.js               # Save/load preferences
│   └── options.css
├── utils/
│   └── timer.js                 # Timer utilities
│   └── storage.js               # Storage wrapper
│   └── constants.js             # Default settings
├── assets/
│   └── icon128.png              # Extension icon
│   └── icon48.png
│   └── icon16.png
└── _locales/
    └── en/
        └── messages.json        # i18n support
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-   Inspired by the need for mindful browsing in our increasingly digital world
-   Thanks to all contributors and users for their feedback and support
