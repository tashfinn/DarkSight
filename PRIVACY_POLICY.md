# Privacy Policy for DarkSight

**Effective Date:** October 12, 2026  
**Last Updated:** October 12, 2026

DarkSight ("we", "our", or "the extension") is a privacy-first browser extension designed to protect users against deceptive online patterns (dark patterns) through on-device and local heuristic and artificial intelligence analysis.

Your privacy is our utmost priority. This Privacy Policy details our data practices and explains how DarkSight handles your data.

---

## 1. Summary of Principles

- **Zero Cloud Data Transmission:** DarkSight does **not** transmit your browsing history, DOM trees, webpage text, or screenshots to any external cloud servers or third parties.
- **Local On-Device AI Processing:** All Large Language Model (DeepSeek-R1) and Multimodal Vision Model (Qwen2.5-VL) analyses are executed entirely locally on your own machine via your local Ollama instance (`http://127.0.0.1:11434`).
- **No Tracking or Analytics:** We do not embed analytics tracking, telemetry, identifiers, or advertising scripts.
- **No Data Monetization:** We never collect, sell, or lease your personal information.

---

## 2. Information We Process and How It Is Handled

### A. Webpage Content & DOM Nodes
- **What is processed:** Webpage text and interactive DOM elements (buttons, banners, urgency notices) on active tabs.
- **How it is used:** Scanned in real-time using deterministic regular expressions (Mathur heuristic) and local AI classification to identify deceptive design patterns.
- **Where it is processed:** Directly inside your local browser sandbox and sent exclusively to your local loopback address (`http://127.0.0.1:11434`). Data is cleared immediately after analysis and is never stored permanently.

### B. Viewport Screenshots
- **What is processed:** When visual detection is enabled, a screenshot of the active visible tab is captured.
- **How it is used:** Passed directly to your local vision model to identify visual deceptive patterns (such as disguised ads, sneaking, or false hierarchies).
- **Where it is processed:** Kept in temporary local memory, delivered solely to the local Ollama daemon, and discarded immediately afterward.

### C. Extension Settings & Preferences
- **What is stored:** Selected countermeasure preference (Highlight & Explain, Hide, or Switch) and detection toggle states.
- **How it is stored:** Stored strictly on your local device using Chrome's native `chrome.storage.local` API. This data never leaves your browser.

---

## 3. Chrome Permissions and Single Purpose Justification

DarkSight requires specific Chrome extension permissions to fulfill its single purpose: **detecting and counteracting deceptive design patterns on the web**.

| Permission | Justification |
| :--- | :--- |
| `<all_urls>` | Required to inspect e-commerce, booking, and shopping websites visited by the user in order to detect and highlight dark patterns in real-time. |
| `http://127.0.0.1:11434/*` | Required for loopback network communication with the user's locally hosted Ollama server (DeepSeek-R1 and Qwen2.5-VL models) without relying on external cloud APIs. |
| `activeTab` / `scripting` | Required to inject non-intrusive UI overlays (bounding highlights, explanations, and countermeasure transformations) into pages where dark patterns are detected. |
| `storage` | Required to locally save user preferences (e.g. chosen countermeasure mode). |
| `declarativeNetRequest` | Used to manage rule configurations safely without intercepting arbitrary network traffic. |

---

## 4. Third-Party Services

DarkSight does **not** integrate with any third-party analytics, crash reporting, advertising networks, or remote cloud AI providers (such as OpenAI, Anthropic, or Google Cloud APIs). Everything runs completely offline or on your own local loopback server.

---

## 5. Security

Because all computations occur locally on your machine, your browsing activity remains confined to your personal environment. We adopt standard security practices and follow Chrome Extension Manifest V3 security boundaries.

---

## 6. Open Source Transparency

DarkSight is open-source software. You can inspect all extension source code, including content scripts, background service workers, and local prompt templates, directly on GitHub:  
[https://github.com/tashfin5/DarkSight](https://github.com/tashfin5/DarkSight)

---

## 7. Changes to This Policy

If we update this Privacy Policy to reflect future features or regulatory updates, changes will be published in this document and documented in the GitHub repository release notes.

---

## 8. Contact

If you have questions or feedback regarding this Privacy Policy or DarkSight, please reach out via GitHub Issues:  
[https://github.com/tashfin5/DarkSight/issues](https://github.com/tashfin5/DarkSight/issues)
