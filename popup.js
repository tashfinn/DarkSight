/* =========================================================
   DARKSIGHT POPUP CONTROLLER
   - Dual Independent Engines: Dark Patterns & Ad Blocker
   - Separate Per-Site & Global Controls
   ========================================================= */

// Navigation Tabs
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Dark Pattern Elements
const modeButtons = document.querySelectorAll(".mode-btn");
const dpMasterToggle = document.getElementById("master-toggle");
const dpSiteToggle = document.getElementById("site-toggle");

// Ad Blocker Elements
const adblockMasterToggle = document.getElementById("adblock-master-toggle");
const adblockSiteToggle = document.getElementById("adblock-site-toggle");
const adblockHeroCard = document.getElementById("adblock-hero-card");
const adblockStatusTitle = document.getElementById("adblock-status-title");
const adblockStatusSub = document.getElementById("adblock-status-sub");
const adblockCountEl = document.getElementById("adblock-count");
const ytShieldBadge = document.getElementById("yt-shield-badge");

let currentHostname = "";

/* =========================================================
   TAB SWITCHING LOGIC
   ========================================================= */

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove("active"));
        tabPanes.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add("active");

        chrome.storage.local.set({ last_active_tab: targetTab });
    });
});

/* =========================================================
   INITIALIZATION & STATE RETRIEVAL
   ========================================================= */

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url) {
        try {
            const url = new URL(tabs[0].url);
            currentHostname = url.hostname;
        } catch(e) {}
    }

    chrome.storage.local.get([
        "last_active_tab",
        "dp_mode",
        "dp_enabled",
        "disabled_sites",
        "adblock_enabled",
        "adblock_disabled_sites",
        "ai_provider",
        "ai_text_model",
        "ai_vision_model",
        "puter_auth_token",
        "puter_username",
        "ollama_url"
    ], res => {
        // Restore active tab
        if (res.last_active_tab) {
            const savedBtn = document.querySelector(`.tab-btn[data-tab="${res.last_active_tab}"]`);
            const savedPane = document.getElementById(res.last_active_tab);
            if (savedBtn && savedPane) {
                tabButtons.forEach(b => b.classList.remove("active"));
                tabPanes.forEach(p => p.classList.remove("active"));
                savedBtn.classList.add("active");
                savedPane.classList.add("active");
            }
        }

        // 1. Dark Pattern State Setup
        const currentMode = res.dp_mode || "HLE";
        const dpEnabled = res.dp_enabled !== false;
        const dpDisabledSites = res.disabled_sites || [];

        modeButtons.forEach(btn => {
            if (btn.dataset.mode === currentMode) {
                btn.classList.add("active");
            }
        });

        if (dpMasterToggle) {
            dpMasterToggle.checked = dpEnabled;
        }

        if (dpSiteToggle && currentHostname) {
            dpSiteToggle.checked = dpDisabledSites.includes(currentHostname);
        } else if (dpSiteToggle) {
            dpSiteToggle.disabled = true;
        }

        // 2. Ad Blocker State Setup
        const adblockEnabled = res.adblock_enabled !== false; // Default: true
        const adblockDisabledSites = res.adblock_disabled_sites || [];
        const isSiteAdBlockDisabled = adblockDisabledSites.includes(currentHostname);

        if (adblockMasterToggle) {
            adblockMasterToggle.checked = adblockEnabled;
        }

        if (adblockSiteToggle && currentHostname) {
            adblockSiteToggle.checked = isSiteAdBlockDisabled;
        } else if (adblockSiteToggle) {
            adblockSiteToggle.disabled = true;
        }

        updateAdBlockUI(adblockEnabled, isSiteAdBlockDisabled);
    });

    // Fetch Live Dark Pattern Counts
    if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getCounts" }, function(response) {
            if (!chrome.runtime.lastError && response) {
                const txt = document.getElementById("text-count");
                if (txt) txt.innerText = response.textualCount || 0;
                const struct = document.getElementById("struct-count");
                if (struct) struct.innerText = response.structuralCount || 0;
                const vis = document.getElementById("visual-count");
                if (vis) vis.innerText = response.visualCount || 0;
            }
        });

        // Fetch Live Ad Blocker Counts
        let bgNetworkAndPopups = 0;
        let contentAds = 0;

        const updateAdCountDisplay = () => {
            if (adblockCountEl) {
                adblockCountEl.innerText = bgNetworkAndPopups + contentAds;
            }
        };

        chrome.runtime.sendMessage({ action: "getTabAdStats", tabId: tabs[0].id }, (bgStats) => {
            if (!chrome.runtime.lastError && bgStats) {
                bgNetworkAndPopups = (bgStats.networkAds || 0);
                updateAdCountDisplay();
            }
        });

        chrome.tabs.sendMessage(tabs[0].id, { action: "getAdBlockCounts" }, function(response) {
            if (!chrome.runtime.lastError && response) {
                contentAds = response.adsBlockedCount || 0;
                updateAdCountDisplay();

                if (ytShieldBadge) {
                    if (response.isYouTube) {
                        ytShieldBadge.innerText = (response.adBlockEnabled && !response.isSiteDisabled) ? "Shielding Video" : "Paused";
                    }
                }
            }
        });
    }
});

/* =========================================================
   DARK PATTERN HANDLERS (INDEPENDENT)
   ========================================================= */

modeButtons.forEach(btn => {
    btn.onclick = () => {
        const mode = btn.dataset.mode;
        chrome.storage.local.set({ dp_mode: mode });

        modeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "updateMode", mode: mode }).catch(() => {});
            }
        });
    };
});

if (dpMasterToggle) {
    dpMasterToggle.addEventListener("change", (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ dp_enabled: isEnabled });

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleFeature", enabled: isEnabled }).catch(() => {});
            }
        });
    });
}

if (dpSiteToggle) {
    dpSiteToggle.addEventListener("change", (e) => {
        if (!currentHostname) return;
        const isDisabledForSite = e.target.checked;

        chrome.storage.local.get(["disabled_sites"], res => {
            let disabledSites = res.disabled_sites || [];

            if (isDisabledForSite && !disabledSites.includes(currentHostname)) {
                disabledSites.push(currentHostname);
            } else if (!isDisabledForSite) {
                disabledSites = disabledSites.filter(h => h !== currentHostname);
            }

            chrome.storage.local.set({ disabled_sites: disabledSites });

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSite", disabledForSite: isDisabledForSite }).catch(() => {});
                }
            });
        });
    });
}

/* =========================================================
   AD BLOCKER HANDLERS (INDEPENDENT)
   ========================================================= */

function updateAdBlockUI(isEnabled, isSiteDisabled) {
    if (!adblockHeroCard) return;

    if (!isEnabled) {
        adblockHeroCard.classList.add("disabled");
        if (adblockStatusTitle) adblockStatusTitle.innerText = "Ad Shield Disabled";
        if (adblockStatusSub) adblockStatusSub.innerText = "Turned off globally";
        if (ytShieldBadge) ytShieldBadge.innerText = "Disabled";
    } else if (isSiteDisabled) {
        adblockHeroCard.classList.add("disabled");
        if (adblockStatusTitle) adblockStatusTitle.innerText = "Paused on This Page";
        if (adblockStatusSub) adblockStatusSub.innerText = `${currentHostname || "This site"} is whitelisted`;
        if (ytShieldBadge) ytShieldBadge.innerText = "Paused";
    } else {
        adblockHeroCard.classList.remove("disabled");
        if (adblockStatusTitle) adblockStatusTitle.innerText = "Ad Shield Active";
        if (adblockStatusSub) adblockStatusSub.innerText = "Network & video ads blocked";
        if (ytShieldBadge) ytShieldBadge.innerText = "Active";
    }
}

if (adblockMasterToggle) {
    adblockMasterToggle.addEventListener("change", (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ adblock_enabled: isEnabled }, () => {
            // Sync background declarativeNetRequest rules
            chrome.runtime.sendMessage({ action: "syncAdBlock" }).catch(() => {});
        });

        const isSiteDisabled = adblockSiteToggle ? adblockSiteToggle.checked : false;
        updateAdBlockUI(isEnabled, isSiteDisabled);

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleAdBlockMaster", enabled: isEnabled }).catch(() => {});
            }
        });
    });
}

if (adblockSiteToggle) {
    adblockSiteToggle.addEventListener("change", (e) => {
        if (!currentHostname) return;
        const isDisabledForSite = e.target.checked;

        chrome.storage.local.get(["adblock_disabled_sites", "adblock_enabled"], res => {
            let disabledSites = res.adblock_disabled_sites || [];
            const adblockEnabled = res.adblock_enabled !== false;

            if (isDisabledForSite && !disabledSites.includes(currentHostname)) {
                disabledSites.push(currentHostname);
            } else if (!isDisabledForSite) {
                disabledSites = disabledSites.filter(h => h !== currentHostname);
            }

            chrome.storage.local.set({ adblock_disabled_sites: disabledSites }, () => {
                // Sync dynamic whitelist rules in background
                chrome.runtime.sendMessage({ action: "syncAdBlock" }).catch(() => {});
            });

            updateAdBlockUI(adblockEnabled, isDisabledForSite);

            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleAdBlockSite", disabledForSite: isDisabledForSite }).catch(() => {});
                }
            });
        });
    });
}

/* =========================================================
   LIVE BROADCAST LISTENERS
   ========================================================= */

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "updateCount") {
        if (msg.textualCount !== undefined) {
            const textCountEl = document.getElementById("text-count");
            if (textCountEl) textCountEl.innerText = msg.textualCount;
        }
        if (msg.visualCount !== undefined) {
            const visCountEl = document.getElementById("visual-count");
            if (visCountEl) visCountEl.innerText = msg.visualCount;
        }
    }
});

/* =========================================================
   RELOAD ACTIVE PAGE ACTION
   ========================================================= */

const reloadPageBtn = document.getElementById("reload-page-btn");
if (reloadPageBtn) {
    reloadPageBtn.addEventListener("click", () => {
        reloadPageBtn.classList.add("reloading");
        const reloadText = reloadPageBtn.querySelector(".reload-text");
        if (reloadText) reloadText.textContent = "Reloading...";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.reload(tabs[0].id, { bypassCache: false }, () => {
                    setTimeout(() => {
                        if (reloadText) reloadText.textContent = "Reloaded!";
                        setTimeout(() => window.close(), 350);
                    }, 250);
                });
            } else {
                setTimeout(() => window.close(), 300);
            }
        });
    });
}

/* =========================================================
   AI INFERENCE & MODEL SETTINGS CONTROLLER
   ========================================================= */

const CLOUD_TEXT_MODELS = [
    { id: "openai", name: "GPT-4o Mini (Default • Fast & Free)" },
    { id: "deepseek", name: "DeepSeek-R1 (Zero-Login Cloud Reasoning)" },
    { id: "mistral", name: "Mistral Small (Fast Classifier)" },
    { id: "qwen", name: "Qwen 2.5 72B (Alibaba Cloud)" },
    { id: "llama", name: "Llama 3.3 70B (Meta AI)" },
    { id: "custom", name: "Custom Cloud Model..." }
];

const CLOUD_VISION_MODELS = [
    { id: "openai", name: "GPT-4o Mini Multimodal (Default Vision)" },
    { id: "qwen", name: "Qwen 2.5-VL Multimodal (Spatial UI Detection)" },
    { id: "custom", name: "Custom Cloud Vision..." }
];

const OLLAMA_TEXT_MODELS = [
    { id: "deepseek-r1", name: "DeepSeek-R1 (1.5B/7B) • Default Local CoT" },
    { id: "mistral", name: "Mistral (7B) • Schaefer Taxonomy" },
    { id: "llama3", name: "Llama 3 (8B) • Meta AI" },
    { id: "qwen2.5", name: "Qwen 2.5 • Alibaba Cloud" },
    { id: "custom", name: "Custom Ollama Model..." }
];

const OLLAMA_VISION_MODELS = [
    { id: "qwen2.5vl", name: "Qwen2.5-VL • Default Local Multimodal" },
    { id: "llava", name: "LLaVA (7B) • Baseline Vision" },
    { id: "custom", name: "Custom Ollama Vision Model..." }
];

const providerBtnCloud = document.getElementById("provider-btn-cloud");
const providerBtnOllama = document.getElementById("provider-btn-ollama");
const settingsProviderTitle = document.getElementById("settings-provider-title");
const settingsProviderSub = document.getElementById("settings-provider-sub");
const sectionCloudStatus = document.getElementById("section-cloud-status");
const sectionOllamaUrl = document.getElementById("section-ollama-url");
const cloudStatusBadge = document.getElementById("cloud-status-badge");
const cloudUserLabel = document.getElementById("cloud-user-label");
const selectTextModel = document.getElementById("select-text-model");
const inputCustomTextModel = document.getElementById("input-custom-text-model");
const selectVisionModel = document.getElementById("select-vision-model");
const inputCustomVisionModel = document.getElementById("input-custom-vision-model");
const inputOllamaUrl = document.getElementById("input-ollama-url");
const btnTestAI = document.getElementById("btn-test-ai");
const btnTestAIText = document.getElementById("btn-test-ai-text");
const testAIResult = document.getElementById("test-ai-result");
const headerAiStatus = document.getElementById("header-ai-status");
const headerAiDot = document.getElementById("header-ai-dot");
const headerAiText = document.getElementById("header-ai-text");
const cloudStatusSubtext = document.getElementById("cloud-status-subtext");

let activeAIProvider = "cloud";

function setAIStatusDisplay(status, text, tooltip = "") {
    if (headerAiStatus && headerAiDot && headerAiText) {
        headerAiStatus.className = `header-ai-status ${status}`;
        headerAiDot.className = `ai-status-indicator ${status}`;
        headerAiText.textContent = text;
        if (tooltip) headerAiStatus.title = tooltip;
    }

    if (cloudStatusBadge) {
        if (status === "connected") {
            cloudStatusBadge.className = "puter-badge active";
            cloudStatusBadge.textContent = "✅ AI Working";
        } else if (status === "error") {
            cloudStatusBadge.className = "puter-badge error";
            cloudStatusBadge.textContent = "❌ AI Error";
        } else {
            cloudStatusBadge.className = "puter-badge";
            cloudStatusBadge.textContent = "⏳ Checking...";
        }
    }

    if (cloudStatusSubtext && tooltip) {
        cloudStatusSubtext.textContent = tooltip;
    }
}

function checkAIHealth() {
    setAIStatusDisplay("checking", "AI: Checking...", "Testing connection to AI engine...");

    chrome.runtime.sendMessage({ action: "testAIConnection" }, (res) => {
        if (chrome.runtime.lastError || !res || !res.success) {
            const err = res ? res.error : "Connection unreachable";
            setAIStatusDisplay("error", "AI ❌", `AI Not Working: ${err}`);
        } else {
            setAIStatusDisplay("connected", "AI ✅", `AI Working: Connected to ${res.provider} (${res.model}) in ${res.latencyMs}ms`);
        }
    });
}

// Automatically check AI status whenever popup opens
checkAIHealth();

function renderModelDropdown(selectEl, customInputEl, models, selectedValue) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    
    let isPreset = false;
    models.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === selectedValue) {
            opt.selected = true;
            isPreset = true;
        }
        selectEl.appendChild(opt);
    });

    if (!isPreset && selectedValue && selectedValue !== "custom") {
        selectEl.value = "custom";
        if (customInputEl) {
            customInputEl.style.display = "block";
            customInputEl.value = selectedValue;
        }
    } else {
        if (customInputEl) {
            customInputEl.style.display = selectEl.value === "custom" ? "block" : "none";
        }
    }
}

function updateAIProviderUI(provider, res = {}) {
    activeAIProvider = (provider === "ollama") ? "ollama" : "cloud";

    if (providerBtnCloud && providerBtnOllama) {
        if (activeAIProvider === "cloud") {
            providerBtnCloud.classList.add("active");
            providerBtnOllama.classList.remove("active");
            if (settingsProviderTitle) settingsProviderTitle.textContent = "Zero-Login Cloud AI";
            if (settingsProviderSub) settingsProviderSub.textContent = "100% Free • Zero Setup • No Accounts Needed";
            if (sectionCloudStatus) sectionCloudStatus.style.display = "block";
            if (sectionOllamaUrl) sectionOllamaUrl.style.display = "none";

            const textModel = res.ai_text_model || "openai";
            const visionModel = res.ai_vision_model || "openai";
            renderModelDropdown(selectTextModel, inputCustomTextModel, CLOUD_TEXT_MODELS, textModel);
            renderModelDropdown(selectVisionModel, inputCustomVisionModel, CLOUD_VISION_MODELS, visionModel);
        } else {
            providerBtnOllama.classList.add("active");
            providerBtnCloud.classList.remove("active");
            if (settingsProviderTitle) settingsProviderTitle.textContent = "Ollama Local Engine";
            if (settingsProviderSub) settingsProviderSub.textContent = "On-Device & 100% Private • Local GPU";
            if (sectionCloudStatus) sectionCloudStatus.style.display = "none";
            if (sectionOllamaUrl) sectionOllamaUrl.style.display = "block";

            const textModel = res.ai_text_model || "deepseek-r1";
            const visionModel = res.ai_vision_model || "qwen2.5vl";
            renderModelDropdown(selectTextModel, inputCustomTextModel, OLLAMA_TEXT_MODELS, textModel);
            renderModelDropdown(selectVisionModel, inputCustomVisionModel, OLLAMA_VISION_MODELS, visionModel);
        }
    }

    if (cloudStatusBadge && cloudUserLabel) {
        cloudStatusBadge.className = "puter-badge active";
        cloudStatusBadge.textContent = "Active & Ready";
        cloudUserLabel.textContent = "Zero-Login Cloud Engine";
    }

    if (inputOllamaUrl && res.ollama_url) {
        inputOllamaUrl.value = res.ollama_url;
    }
}

// Initialize AI settings from storage
chrome.storage.local.get([
    "ai_provider",
    "ai_text_model",
    "ai_vision_model",
    "ollama_url"
], (res) => {
    let provider = res.ai_provider || "cloud";
    if (provider === "puter") provider = "cloud";
    updateAIProviderUI(provider, res);
});

// Provider toggle listeners
if (providerBtnCloud) {
    providerBtnCloud.addEventListener("click", () => {
        chrome.storage.local.get(["ai_text_model", "ai_vision_model"], (res) => {
            chrome.storage.local.set({ ai_provider: "cloud" });
            updateAIProviderUI("cloud", res);
        });
    });
}

if (providerBtnOllama) {
    providerBtnOllama.addEventListener("click", () => {
        chrome.storage.local.get(["ai_text_model", "ai_vision_model", "ollama_url"], (res) => {
            chrome.storage.local.set({ ai_provider: "ollama" });
            updateAIProviderUI("ollama", res);
        });
    });
}

// Text model dropdown change
if (selectTextModel) {
    selectTextModel.addEventListener("change", () => {
        if (selectTextModel.value === "custom") {
            if (inputCustomTextModel) inputCustomTextModel.style.display = "block";
        } else {
            if (inputCustomTextModel) inputCustomTextModel.style.display = "none";
            chrome.storage.local.set({ ai_text_model: selectTextModel.value });
        }
    });
}

if (inputCustomTextModel) {
    inputCustomTextModel.addEventListener("input", () => {
        const val = inputCustomTextModel.value.trim();
        if (val) chrome.storage.local.set({ ai_text_model: val });
    });
}

// Vision model dropdown change
if (selectVisionModel) {
    selectVisionModel.addEventListener("change", () => {
        if (selectVisionModel.value === "custom") {
            if (inputCustomVisionModel) inputCustomVisionModel.style.display = "block";
        } else {
            if (inputCustomVisionModel) inputCustomVisionModel.style.display = "none";
            chrome.storage.local.set({ ai_vision_model: selectVisionModel.value });
        }
    });
}

if (inputCustomVisionModel) {
    inputCustomVisionModel.addEventListener("input", () => {
        const val = inputCustomVisionModel.value.trim();
        if (val) chrome.storage.local.set({ ai_vision_model: val });
    });
}

// Ollama endpoint URL input
if (inputOllamaUrl) {
    inputOllamaUrl.addEventListener("input", () => {
        const val = inputOllamaUrl.value.trim();
        if (val) chrome.storage.local.set({ ollama_url: val });
    });
}

// Test AI Connection button
if (btnTestAI) {
    btnTestAI.addEventListener("click", () => {
        btnTestAI.disabled = true;
        if (btnTestAIText) btnTestAIText.textContent = "Testing Connection...";
        if (testAIResult) {
            testAIResult.style.display = "none";
            testAIResult.className = "test-result-box";
        }

        chrome.runtime.sendMessage({ action: "testAIConnection" }, (res) => {
            btnTestAI.disabled = false;
            if (btnTestAIText) btnTestAIText.textContent = "Test AI Connection";

            if (!testAIResult) return;
            testAIResult.style.display = "block";

            if (res && res.success) {
                testAIResult.className = "test-result-box success";
                testAIResult.innerHTML = `<strong>Connected!</strong><br>Provider: ${res.provider} • Model: ${res.model}<br>Latency: <strong>${res.latencyMs}ms</strong><br><em>"${res.reply}"</em>`;
                setAIStatusDisplay("connected", "AI ✅", `AI Working: Connected to ${res.provider} (${res.model}) in ${res.latencyMs}ms`);
            } else {
                testAIResult.className = "test-result-box error";
                testAIResult.innerHTML = `<strong>Connection Failed:</strong><br>${res ? res.error : "No response from background service worker."}`;
                setAIStatusDisplay("error", "AI ❌", `AI Error: ${res ? res.error : "Offline"}`);
            }
        });
    });
}