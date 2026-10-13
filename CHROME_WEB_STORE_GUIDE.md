# 🚀 DarkSight Chrome Web Store Publishing Guide

This guide contains everything you need to publish **DarkSight v1.5.0** to the official **Google Chrome Web Store**. All fields, permissions justifications, and store descriptions are pre-written and ready to copy-paste.

---

## 📦 Step 1: Your Ready-to-Upload ZIP File

Your clean, production-grade package is compiled and ready:
- **Location:** [`dist/darksight-v1.5.0.zip`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/dist/darksight-v1.5.0.zip)
- **Size:** ~1.45 MB (clean Manifest V3 bundle, zero junk files)

*(If you ever make code changes, run `powershell -ExecutionPolicy Bypass -File package.ps1` to rebuild it).*

---

## 🌐 Step 2: Open Google Developer Dashboard

1. Go to the **[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)**.
2. Sign in with your Google account.
3. If this is your first time publishing, pay the one-time **$5 USD** developer registration fee.
4. Click the blue **"+ New Item"** button in the top right.
5. Drag and drop `dist/darksight-v1.5.0.zip` into the uploader.

---

## 📝 Step 3: Store Listing Tab (Copy & Paste)

Fill out the **Store Listing** fields as follows:

### Extension Name
```text
DarkSight - Dark Pattern & Ad Blocker Shield
```

### Summary (Short Description - max 132 characters)
```text
Real-time dark pattern detector, manipulative UI countermeasure shield, and native ad blocker powered by local and cloud AI.
```

### Detailed Description
```text
🛡️ DarkSight is a comprehensive browser protection shield that detects deceptive design patterns (dark patterns), shields you from psychological manipulation, and blocks intrusive ads across the web in real-time.

Built upon 7 landmark academic research papers (Mathur et al., Schaefer et al., AidUI, DP Sentinel), DarkSight continuously analyzes web elements to uncover hidden costs, artificial urgency, fake discounts, and manipulative button layouts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ CORE CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ REAL-TIME DARK PATTERN DETECTION
• Urgency & Scarcity: Detects countdown timers, expiring offers, "only 2 left in stock", and percentage claimed badges.
• Fake Discounts: Identifies exaggerated crossed-out prices and artificial price anchoring.
• False Hierarchy & Misdirection: Flags visually skewed buttons (e.g. giant glowing "Accept All" vs. tiny faint "Decline").
• Obstruction & Forced Action: Spots difficult cancellation processes and coerced newsletter agreements.
• Social Proof: Flags questionable claims like "140 people are looking at this item right now".

2️⃣ THREE DEFENSIVE COUNTERMEASURES
Choose how DarkSight protects you via the extension popup:
🔴 Highlight & Explain (HLE): Outlines deceptive elements in glowing red boxes with instant hover explanations.
🟣 Hide (HD): Automatically removes and hides manipulative elements from the page.
🟢 Switch (Fair UI): Replaces deceptive urgency text with fair, neutral phrasing.

3️⃣ HIGH-PERFORMANCE NATIVE AD BLOCKER
• Powered by Declarative Net Request (DNR) with full uBlock Origin Lite ruleset parity.
• Eliminates banners, popunders, click-jack traps, and Google AdSense without slowing down your browser.
• Real-Time YouTube Ad Defuser: Automatically accelerates and skips YouTube video ads and removes empty placeholder boxes.
• Facebook Sponsored Post Filter: Cleans promotional feed units and right-rail ads.

4️⃣ DUAL-ENGINE AI INTELLIGENCE
• ☁️ Zero-Login Cloud AI (Default): Works 100% out-of-the-box with zero accounts, zero API keys, and zero configuration.
• 💻 Local Ollama Engine: Connect your local GPU (DeepSeek-R1, Mistral, Qwen2.5-VL) for complete, 100% offline, on-device privacy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PRIVACY & TRANSPARENCY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Zero Tracking: We do not track, collect, or log your browsing history.
• Zero Data Monetization: We never sell or share user data.
• Open Source: Full source code is open and verifiable on GitHub.

GitHub Repository: https://github.com/tashfinn/DarkSight
```

### Category
- **Primary:** `Productivity`
- **Secondary:** `Accessibility` (or `Developer Tools`)

### Language
- `English`

---

## 🔒 Step 4: Privacy Practices Tab (CRITICAL)

> [!IMPORTANT]
> Google reviews this section strictly. Use the exact answers below to ensure swift approval without rejection.

### 1. Single Purpose Description
Paste this into the **Single purpose description** box:
```text
DarkSight protects users while browsing by identifying manipulative dark patterns (such as artificial urgency, fake discounts, and false hierarchies) and blocking intrusive ad popups and network trackers.
```

### 2. Permissions Justifications
Google requires a technical explanation for every requested permission:

| Permission | Paste This Justification into Dashboard |
| :--- | :--- |
| **`host_permissions` (`<all_urls>`)** | `Required to inspect web pages visited by the user for deceptive user interface patterns and enforce cosmetic ad hiding across domains.` |
| **`activeTab` / `scripting`** | `Required to render visual highlight borders, explanation tooltips, and fair UI replacements directly on identified deceptive elements.` |
| **`storage`** | `Required to save user preferences locally (countermeasure mode, ad block toggles, and AI engine settings) via chrome.storage.local.` |
| **`declarativeNetRequest` / `declarativeNetRequestWithHostAccess`** | `Required to block intrusive ad networks, trackers, and popunder scripts natively at the browser network engine level with zero latency.` |
| **`tabs`** | `Required to track navigation state, handle page reloads from the popup, and update live blocked ad counters for the active tab.` |
| **`webRequest`** | `Required to monitor blocked network requests to display accurate blocked statistics in the popup UI.` |

### 3. Data Usage Declarations
Under **Data collection**, certify the following:
- Does this extension collect user data? **No** (select "I am not collecting or transferring user data").
- Check the three certification boxes:
  - ✅ *I certify that I do not sell user data to third parties.*
  - ✅ *I certify that I do not use or transfer user data for purposes unrelated to the extension's core functionality.*
  - ✅ *I certify that I do not use or transfer user data to determine creditworthiness or for lending purposes.*

### 4. Privacy Policy URL
Paste your public privacy policy URL:
```text
https://raw.githubusercontent.com/tashfinn/DarkSight/main/PRIVACY_POLICY.md
```
*(Or `https://github.com/tashfinn/DarkSight/blob/main/PRIVACY_POLICY.md`)*.

---

## 🎨 Step 5: Graphic Assets

Upload the required images in the **Store Listing** tab:

1. **Store Icon (128x128 PNG):**
   - File: [`logo/icon128.png`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/logo/icon128.png)
2. **Screenshots (1280x800 or 640x400 PNG/JPEG, 1 to 5 screenshots):**
   Recommended screenshots ready in the project:
   - Screenshot 1: [`test_screenshots/screenshot_amazon_offers.png`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/test_screenshots/screenshot_amazon_offers.png) *(Shows Amazon deal & urgency pattern detection)*
   - Screenshot 2: [`assets/Daraz_result.png`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/assets/Daraz_result.png) *(Shows e-commerce live pattern highlights)*
   - Screenshot 3: [`assets/AliExpress_result.png`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/assets/AliExpress_result.png) *(Shows AliExpress countdown & social proof detection)*
   - Screenshot 4: [`assets/Booking_result.png`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/assets/Booking_result.png) *(Shows booking scarcity patterns)*
   - Screenshot 5: [`assets/real_metaphor_detection_countermeasure.png`](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/assets/real_metaphor_detection_countermeasure.png) *(Shows countermeasure protection)*

---

## 🚀 Step 6: Submit for Review!

1. Click **"Save draft"** at the top right.
2. Review any yellow or red checkmarks on the left navigation sidebar.
3. Click the blue **"Submit for review"** button.
4. When prompted whether to publish automatically upon approval, select **"Publish automatically"**.

> [!NOTE]
> Chrome Web Store reviews typically take **24 to 72 hours**. You will receive an email from Google as soon as DarkSight is approved and live in the Chrome Web Store!
