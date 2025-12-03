# Security Policy

This repository is committed to the highest standards of security. We follow the Apex Technical Authority's mandate for **Zero-Defect, High-Velocity, Future-Proof** development. This policy outlines our approach to identifying, reporting, and addressing security vulnerabilities.

## Vulnerability Reporting

We welcome and thank every security researcher for responsibly disclosing vulnerabilities. All security-related issues should be reported to us using the GitHub Security Advisory feature. Please do not report security vulnerabilities through public GitHub issues.

**Reporting a Vulnerability:**

1.  Go to the **Security** tab of this repository: `https://github.com/chirag127/TimeWarden-AI-Powered-Time-Tracking-Browser-Extension/security/advisories`.
2.  Click on "New vulnerability alert" or "New advisory" to create a new security advisory.
3.  Provide a clear and detailed description of the vulnerability, including:
    *   The affected version(s) of the software.
    *   Steps to reproduce the vulnerability.
    *   Potential impact of the vulnerability.
    *   Any proof-of-concept (PoC) code, if available.
    *   Information about the browser environment (e.g., Chrome, Firefox, version) if relevant to the extension.
4.  Submit the advisory. Our security team will review it promptly.

## Security Development Lifecycle (SDLC)

Our development process incorporates security best practices at every stage:

*   **Apex Toolchain Integration:** We utilize the latest Apex standards, including automated security scanning tools integrated into our CI/CD pipeline (`.github/workflows/ci.yml`).
*   **Dependency Management:** All dependencies are managed using `uv` (for Python-based components, if any were integrated) or standard browser extension tooling. Dependencies are regularly audited and updated to patch known vulnerabilities. For this JavaScript/TypeScript extension, we rely on `npm` or `yarn` with security checks.
*   **Code Auditing:** Static and dynamic analysis tools are employed to identify potential security flaws during development. Linting with **Ruff** and **Biome** helps enforce secure coding practices.
*   **Testing:** Rigorous testing, including security-focused test cases and end-to-end testing with Playwright (if applicable to the browser extension context), helps validate security controls.
*   **AI Integration Security:** For any AI components (e.g., for enhanced time tracking analytics), we ensure secure API key management, input sanitization to prevent prompt injection, and output validation to guard against data leakage or misuse.
*   **Privacy by Design:** As a privacy-focused extension, user data is stored locally. We are committed to minimizing data collection and ensuring robust client-side security.

## Supported Versions

This policy applies to the latest stable release of the TimeWarden Browser Extension and its associated codebase. We aim to address security vulnerabilities in the most recent versions. For older, unsupported versions, please refer to the project's maintenance status.

## Disclosure Timeline

We aim to acknowledge all security reports within **48 hours**. We will work with reporters to understand the vulnerability and will disclose the fix publicly once a resolution is available and validated, following responsible disclosure principles. The disclosure timeline may vary depending on the complexity of the vulnerability.

## Security Contact

For urgent or sensitive security matters that cannot be reported via GitHub Advisories, you can reach out to `security@example.com` (a placeholder; replace with actual contact if available).

---**

Thank you for helping us keep TimeWarden secure and trustworthy.
