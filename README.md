<div align="center">

# 🛡️ DarkSight
### Intelligent Real-Time Dark Pattern Detector, Countermeasure Shield & Ad Blocker

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![uBlock Origin Lite Engine](https://img.shields.io/badge/Ad_Blocker-uBlock_Origin_Lite_Rules-red)](https://github.com/gorhill/uBlock)
[![Zero-Login AI](https://img.shields.io/badge/Cloud_AI-Zero--Login_Puter_AI-orange)](https://puter.com)
[![Ollama](https://img.shields.io/badge/Local_AI-Ollama_Inference-black?logo=ollama&logoColor=white)](https://ollama.com)
[![DeepSeek-R1](https://img.shields.io/badge/Text_AI-DeepSeek--R1-blue)](https://ollama.com/library/deepseek-r1)
[![Qwen2.5-VL](https://img.shields.io/badge/Vision_AI-Qwen2.5--VL-purple)](https://ollama.com/library/qwen2.5vl)
[![Privacy First](https://img.shields.io/badge/Privacy-Zero_Tracking-success)](#-privacy--security)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**DarkSight** is an all-in-one browser protection extension that shields you from psychological manipulation (Dark Patterns), enforces fair user interfaces, and eliminates intrusive ads, popunders, and YouTube video ads in real-time.

</div>

---

## 🚀 Key Features

### 1️⃣ Real-Time Dark Pattern Detection & Countermeasures
Built upon 7 landmark academic research papers (*Mathur et al., Schaefer et al., AidUI, DP Sentinel*), DarkSight inspects web pages using a multi-tiered pipeline:
* **Microsecond Regex Heuristics:** Instantly catches countdown timers, expiring offers, "only 2 left in stock", and fake discounts.
* **Structural Visual Analysis (AidUI):** Compares button bounding boxes, computed styles, and color contrasts to flag asymmetric button pairs (False Hierarchies).
* **AI Cognitive Reasoning:** Uses Chain-of-Thought AI (DeepSeek-R1) and Multimodal Vision (Qwen2.5-VL) to detect subtle manipulation, disguised subscriptions, and manipulative layouts.

#### 🛡️ Three User-Selectable Countermeasures:
| Mode | Badge | Description |
| :--- | :---: | :--- |
| **Highlight & Explain (HLE)** | 🔴 | Outlines deceptive elements in glowing red boxes with instant hover explanations describing the tactic. |
| **Hide (HD)** | 🟣 | Suppresses and completely removes coercive DOM elements (fake countdowns, urgency tickers) from view. |
| **Switch (Fair UI)** | 🟢 | Neutralizes manipulative text into calm, honest language (e.g., replaces *"Only 2 left! Hurry!"* with clean stock indicators). |

---

### 2️⃣ High-Performance Native Ad Blocker (uBlock Origin Lite Parity)
* **Declarative Net Request (DNR):** Powered by Chrome's native network engine using official EasyList, EasyPrivacy, and uBlock filters to block trackers and ads with zero browser latency.
* **Real-Time YouTube Ad Defuser:** Automatically neutralizes video ads at the player engine level (`MAIN` world interceptor) and auto-skips pre-roll/mid-roll promotions.
* **Streaming & Popunder Neutralizer:** Silently defuses malicious popunders and click traps on streaming and download sites while preserving legitimate cloud downloads.
* **Cosmetic Filter & Social Cleaner:** Collapses empty ad placeholder boxes and cleans sponsored feed units on Facebook.

---

### 3️⃣ Flexible AI Intelligence (Cloud + Local)
* **☁️ Zero-Login Cloud AI (Default):** Works 100% out of the box with zero setup, zero accounts, and zero API keys via Puter.js integration.
* **💻 Local Ollama Engine (Optional):** Run completely offline on your own GPU/CPU using DeepSeek-R1 and Qwen2.5-VL for maximum on-device privacy.

---

## 🧠 Multi-Tier Hybrid Detection Architecture

```mermaid
graph TD
    A[Webpage DOM & Viewport] --> B[Tier 1: Heuristic Regex Scan]
    A --> C[Tier 2: Structural Contrast & Geometry Scan]
    A --> D[Tier 3: In-Context Reasoning AI]
    A --> E[Tier 4: Multimodal Vision Analysis]

    B -->|Fast Scarcity / Urgency Match| F[Detection Aggregator]
    C -->|False Hierarchy / Asymmetry| F
    D -->|Subtle Deceptive Phrasing| F
    E -->|Sneaking / Disguised Ads| F

    F --> G{Active Countermeasure Mode}
    G -->|HLE| H[🔴 Highlight & Tooltip Overlay]
    G -->|HD| I[🟣 Remove Elements from DOM]
    G -->|SW| J[🟢 Neutralize Manipulative Copy]
```

---

## 📦 Project Structure

```
DarkSight/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Service Worker (AI routing & network request bridge)
├── content.js                 # DOM scanner, AidUI geometry analyzer & Countermeasure injector
├── prompt.js                  # Few-shot prompts and academic taxonomy definitions
├── yt_defuser.js              # YouTube player ad defuser (MAIN world script)
├── adblocker.js               # Cosmetic ad filtering & DOM gap reflow engine
├── adblock.css                # Declarative ad suppression stylesheet
├── popup.html / popup.js      # Dual-tab extension popup UI (Dark Patterns & Ad Blocker)
├── popup.css / styles.css     # Dark-mode styling, glowing badges & tooltip animations
├── auth.html / auth.js        # Optional Puter Cloud AI account manager
├── rules.json                 # Core declarative blocking rules
├── adblock_rules.json         # High-priority ad & popunder DNR rules
├── rulesets/                  # uBlock Origin Lite ruleset parity (EasyList, EasyPrivacy, etc.)
├── web_accessible_resources/  # Surrogate defusers, script stubs & redirect resources
├── lib/                       # Local Puter.js runtime library
├── logo/                      # Extension icons (16px, 48px, 128px)
├── package.ps1                # Production packager for Chrome Web Store & Releases
├── PRIVACY_POLICY.md          # Formal privacy policy documentation
└── CHROME_WEB_STORE_GUIDE.md  # Step-by-step Chrome Web Store submission guide
```

---

## 🚀 Installation

### Option A: Install from Source (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/tashfinn/DarkSight.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the cloned `DarkSight` folder.
5. Pin **DarkSight** to your toolbar!

### Option B: Pre-packaged Release ZIP
1. Download the latest `darksight-v1.5.0.zip` from [Releases](https://github.com/tashfinn/DarkSight/releases).
2. Extract the archive into a folder.
3. Open `chrome://extensions/`, enable **Developer mode**, and click **Load unpacked**.

---

## ⚙️ Optional: Local AI Setup (Ollama)
If you prefer 100% offline local processing instead of the default zero-login cloud engine:
1. Install [Ollama](https://ollama.com/download).
2. Pull the models in your terminal:
   ```bash
   # Text Analysis Model
   ollama pull deepseek-r1:1.5b

   # Multimodal Vision Model
   ollama pull qwen2.5vl
   ```
3. In the DarkSight popup, select **Local Ollama** as your preferred AI engine.

---

## 🛠️ Build & Package Extension

To generate a clean `.zip` archive ready for the Chrome Web Store or GitHub Releases:

In PowerShell:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File package.ps1
```
The output file will be generated in `dist/darksight-v1.5.0.zip`.

---

## 🔒 Privacy & Security

- **Zero Tracking:** DarkSight never tracks, collects, or monetizes user browsing history.
- **Privacy First:** All DOM analysis and cosmetic ad blocking happen entirely within your local browser sandbox.
- Read our full [Privacy Policy](PRIVACY_POLICY.md).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE) - see the LICENSE file for details.
