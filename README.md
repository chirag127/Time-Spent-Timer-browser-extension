# FlowState-Digital-Wellness-Time-Tracker-Browser-Extension

![Build Status](https://img.shields.io/github/actions/workflow/user/chirag127/FlowState-Digital-Wellness-Time-Tracker-Browser-Extension/ci.yml?style=flat-square&logo=github)
![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/FlowState-Digital-Wellness-Time-Tracker-Browser-Extension?style=flat-square&logo=codecov)
![Tech Stack](https://img.shields.io/badge/Tech%20Stack-TS%7CVite%7CTailwind%7CTauri-blue?style=flat-square&logo=javascript)
![Lint/Format](https://img.shields.io/badge/Lint%2FFmt-Biome-purple?style=flat-square&logo=biome)
![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-orange?style=flat-square&logo=creativecommons)
![GitHub Stars](https://img.shields.io/github/stars/chirag127/FlowState-Digital-Wellness-Time-Tracker-Browser-Extension?style=flat-square&logo=github)

<p align="center">
  <a href="https://github.com/chirag127/FlowState-Digital-Wellness-Time-Tracker-Browser-Extension/stargazers">
    <img src="https://img.shields.io/github/stars/chirag127/FlowState-Digital-Wellness-Time-Tracker-Browser-Extension?style=social" alt="Star on GitHub">
  </a>
</p>

## The Digital Sanctuary for Your Browsing Habits

FlowState is an elite, privacy-focused browser extension for digital wellness. It tracks time spent on websites and provides gentle, customizable nudges to encourage mindful browsing and maintain focus. Built with Manifest V3 and Zero-Telemetry principles.

## 🚀 Architecture Overview

mermaid
graph TD
    A[Browser Extension Core (Manifest V3)] --> B{Content Scripts}
    A --> C{Background Service Worker}
    B --> D[UI Components (React/Preact)]
    C --> E[Time Tracking Logic]
    C --> F[Nudge Engine]
    C --> G[Storage (Local/Sync)]
    E --> G
    F --> G
    A --> H[Popup UI]
    H --> C


## 🧭 Table of Contents

*   [About FlowState](#about-flowstate)
*   [Key Features](#key-features)
*   [Getting Started](#getting-started)
*   [Development](#development)
*   [Contribution](#contribution)
*   [License](#license)

## ✨ Key Features

*   **Privacy-First Design:** Zero telemetry. All data is stored locally or synced via browser sync storage. No external data exfiltration.
*   **Manifest V3 Compliant:** Built for the future of browser extensions.
*   **Intelligent Time Tracking:** Accurately monitors time spent on individual websites.
*   **Customizable Nudges:** Set personalized prompts and timers to encourage breaks or refocusing.
*   **Focus Modes:** Configure specific times or website lists for enhanced concentration.
*   **Elegant UI:** Clean and intuitive interface accessible via a browser popup.
*   **Performance Optimized:** Built with Vite for fast development builds and optimized production output.

## 💻 Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm or Yarn

### Installation

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/FlowState-Digital-Wellness-Time-Tracker-Browser-Extension.git
    cd FlowState-Digital-Wellness-Time-Tracker-Browser-Extension
    

2.  **Install dependencies:**
    bash
    npm install
    # or
    yarn install
    

3.  **Run in development mode:**
    bash
    npm run dev
    # or
    yarn dev
    
    This will build the extension and watch for changes. You can then load the `dist` folder as an unpacked extension in your browser (e.g., Chrome, Edge).

### Production Build

bash
npm run build
# or
yarn build


This command generates the optimized production build in the `dist` folder.

## 🛠️ Development Standards & Principles

This project adheres to the following core principles:

*   **SOLID:** Enhancing maintainability and scalability.
*   **DRY (Don't Repeat Yourself):** Minimizing code duplication.
*   **YAGNI (You Ain't Gonna Need It):** Focusing on essential features.
*   **Performance:** Prioritizing efficient code and resource usage.
*   **Security:** Implementing best practices for browser extensions, especially regarding Manifest V3 and data privacy.

## <details>
<summary>🤖 AI Agent Directives</summary>

### Core Directives

*   **Repository Name:** `FlowState-Digital-Wellness-Time-Tracker-Browser-Extension`
*   **Primary Function:** Digital Wellness & Time Tracking Browser Extension
*   **Platform:** Browser Extension (Manifest V3)
*   **Technology Stack:** TypeScript, Vite, TailwindCSS, Biome, Playwright, React/Preact.

### Architectural Patterns

*   **Adhere to Manifest V3 specifications:** Employ service workers, secure content scripts, and appropriate storage mechanisms.
*   **Feature-Sliced Design (FSD) principles:** Organize code into features, layers, and segments for maintainability and scalability.
*   **Component-Based Architecture:** Utilize React/Preact for declarative UI development.
*   **State Management:** Employ Signals or similar efficient state management patterns.

### Linting & Formatting

*   **Tool:** Biome (v1.7.0+)
*   **Configuration:** `.biome.json` file in the root directory.
*   **Verification Command:** `npm run lint` or `yarn lint`
*   **Formatting Command:** `npm run format` or `yarn format`

### Testing

*   **Unit Testing:** Vitest (v2.x+)
*   **E2E Testing:** Playwright (v1.x+)
*   **Test Runner:** `npm test` or `yarn test`

### Verification Commands

*   **Development Server:** `npm run dev` / `yarn dev`
*   **Production Build:** `npm run build` / `yarn build`
*   **Linting:** `npm run lint` / `yarn lint`
*   **Formatting:** `npm run format` / `yarn format`
*   **Unit Tests:** `npm test:unit` / `yarn test:unit`
*   **E2E Tests:** `npm test:e2e` / `yarn test:e2e`

### Security Protocols

*   **Manifest V3 Compliance:** Strict adherence to security best practices, including leveraging the service worker model and content security policies.
*   **Data Privacy:** No unnecessary data collection. User data remains local or uses browser sync storage only.
*   **Dependency Auditing:** Regularly audit dependencies for vulnerabilities.

</details>

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**.

See the `LICENSE` file for more details.
