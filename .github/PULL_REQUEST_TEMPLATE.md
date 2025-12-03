# Pull Request Template

## 🎯 Purpose

Describe the *why* behind this PR. What problem does it solve? What feature does it add?

**Link to Issue(s):** (e.g., `Closes #123`)

---

## 📝 Changes

List the key changes introduced in this PR. Be concise and use bullet points.

*   [ ] Added new feature X
*   [ ] Fixed bug Y
*   [ ] Refactored component Z
*   [ ] Updated documentation

---

## 🚀 How to Test

Provide clear, step-by-step instructions for how reviewers can test your changes.

1.  **Prerequisites:** (e.g., `npm install`, `uv pip sync`)
2.  **Steps:**
    *   Checkout branch `[your-branch-name]`
    *   Run command `[command-to-run]`
    *   Observe [expected outcome]
3.  **Specific Scenarios:** (If applicable, list edge cases or critical paths to test)

---

## 🧠 Reviewer Notes

Add any specific areas you'd like reviewers to focus on, potential concerns, or context that might be helpful for understanding the changes.

---

## ✅ Checklist

Ensure all the following points are addressed:

*   [ ] My code follows the project's style guidelines (Apex standards).
*   [ ] I have performed a self-review of my own code.
*   [ ] I have commented my code, particularly in hard-to-understand areas.
*   [ ] I have made corresponding changes to the documentation (if applicable).
*   [ ] My changes generate no new warnings or errors.
*   [ ] I have added new tests that prove my fix is effective or that my feature works.
*   [ ] All new and existing unit tests pass locally with my changes.
*   [ ] Any dependent changes have been merged and published.
*   [ ] I have updated the `AGENTS.md` file if any new tools or commands were introduced.

---

## 📚 AI Agent Directives Alignment

This PR aligns with the AI Agent Directives as defined in `AGENTS.md` by [briefly explain how, e.g., implementing a new feature that adheres to the established architecture, fixing a bug that violates an AI-guided principle, etc.].

*   **Current Tech Stack:** JavaScript, Browser Extension APIs, AI (Local Data Analysis/Nudges)
*   **Verification Commands:** (If new commands are relevant to AI testing)
    *   `npm run test:ai` (Example)
