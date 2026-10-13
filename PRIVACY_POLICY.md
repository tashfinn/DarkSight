# Privacy Policy for DarkSight

**Effective Date:** October 14, 2026  
**Last Updated:** October 14, 2026

DarkSight ("we", "our", or "the extension") is an open-source, privacy-first browser extension created to protect users against deceptive web interfaces (dark patterns) and intrusive advertising through real-time detection, on-page countermeasures, and native network blocking.

Your privacy is our highest priority. This Privacy Policy outlines our data handling practices and details how DarkSight complies with Google Chrome Web Store Developer Program Policies.

---

## 1. Core Principles

- **No User Tracking or Analytics:** DarkSight does **not** track, record, or profile your browsing history, clicks, search queries, or personal identities.
- **No Data Collection or Monetization:** We do not collect, store, sell, lease, or monetize user data under any circumstance.
- **Zero-Account Architecture:** DarkSight requires zero accounts, zero registrations, zero email sign-ups, and zero API tokens to use.
- **Privacy-First Processing:** 
  - Structural analysis (AidUI) and fast heuristic pattern detection run 100% client-side in real-time.
  - When using Local AI (Ollama), all machine learning models execute entirely on your own device (`http://127.0.0.1:11434`) with zero data leaving your machine.
  - When using Zero-Login Cloud AI, only isolated, anonymized text candidate snippets (e.g. "Ends in 05:00") are temporarily evaluated for manipulation classification. No personal data or URLs are transmitted.

---

## 2. Information Handled by the Extension

### A. Webpage DOM Elements & Candidate Texts
- **What is evaluated:** Specific button labels, countdown timers, deal badges, and candidate promotional phrases on the active webpage.
- **How it is used:** Scanned to detect deceptive design patterns (Urgency, Scarcity, Fake Discounts, Social Proof, False Hierarchy, and Obstruction) and apply visual countermeasures (Highlight, Hide, or Neutralize).
- **Storage:** Candidate elements are processed in ephemeral memory and discarded immediately. No web content is saved to disk.

### B. Viewport Screenshots (Visual Pipeline)
- **What is evaluated:** When visual layout detection is enabled, a screenshot of the visible tab is captured to detect spatial deceptive layouts (e.g. disguised ads, sneaking).
- **How it is used:** Processed locally or by the chosen multimodal model. Discarded immediately after inference.

### C. Extension Settings & Preferences
- **What is stored:** Selected countermeasure mode (Highlight & Explain, Hide, or Switch), AI model preferences, and ad blocker toggle states.
- **Storage:** Stored exclusively on your local device using Chrome's native `chrome.storage.local` API.

---

## 3. Chrome Permissions & Single Purpose Justification

DarkSight requests the minimum permissions required to fulfill its single purpose: **identifying deceptive online patterns and shielding users from manipulative web elements and intrusive ads**.

| Permission | Technical Justification |
| :--- | :--- |
| `<all_urls>` | Required to scan web pages visited by the user for deceptive UI patterns and enforce cosmetic element hiding on ads across web domains. |
| `activeTab` / `scripting` | Required to render non-intrusive red highlight borders, tooltip explanations, and fair UI text replacements on identified dark pattern elements. |
| `storage` | Required to save user preferences locally (countermeasure mode, enabled filters, AI provider choice) via `chrome.storage.local`. |
| `declarativeNetRequest` / `declarativeNetRequestWithHostAccess` | Required to block intrusive ad networks, trackers, and popup scripts at the native browser network level with zero script overhead. |
| `tabs` | Required to monitor tab navigation states, manage page refreshes, and track active tab ad statistics. |
| `webRequest` | Required to count blocked requests accurately for the extension popup counter. |
| `http://127.0.0.1:11434/*` | Required for loopback network communication with the user's locally hosted Ollama server (DeepSeek-R1, Qwen2.5-VL) for 100% offline AI inference. |
| `https://text.pollinations.ai/*` | Required to connect to the zero-login, account-free Cloud AI inference endpoint for users who do not run a local GPU server. |

---

## 4. Third-Party Services & Data Sharing

DarkSight does **not** partner with advertising networks, analytics providers (e.g. Google Analytics, Mixpanel), or data brokers.
- **Local Ollama:** Completely offline and self-contained on your machine.
- **Zero-Login Cloud AI:** Powered by an anonymous OpenAI-compatible endpoint. Requests contain only short, detached UI phrases for classification, with no cookies, IP logging, or user identifiers attached.

---

## 5. Security & Manifest V3 Compliance

DarkSight strictly adheres to Google Chrome Manifest V3 security requirements:
- No remote code execution (zero use of `eval()` or externally hosted JavaScript).
- All libraries and rule sets are bundled statically inside the extension package.
- Content security policy (CSP) enforces strict script isolation.

---

## 6. Open Source Verification

DarkSight is open-source and developed transparently. Anyone can review the full source code on GitHub:  
[https://github.com/tashfinn/DarkSight](https://github.com/tashfinn/DarkSight)

---

## 7. Contact & Support

For questions, feature requests, or privacy inquiries, please open an issue on GitHub:  
[https://github.com/tashfinn/DarkSight/issues](https://github.com/tashfinn/DarkSight/issues)
