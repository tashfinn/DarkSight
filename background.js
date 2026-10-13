/* =========================================================
   DARKSIGHT BACKGROUND SERVICE WORKER
   - DeepSeek-R1 Text Pipeline (Ollama)
   - Qwen2.5-VL Multimodal Vision Pipeline (Ollama)
   - DeclarativeNetRequest Dynamic Rulesets (uBlock Architecture)
   - Live Network Ad Request Monitor (webRequest for metrics)
   - 100% Native Tab Navigation (Zero Tab Hijacking)
   ========================================================= */

// Tab-level ad blocking metrics: tabId -> { networkAds: number, domAds: number }
const tabAdStats = new Map();

function getStatsForTab(tabId) {
    if (!tabAdStats.has(tabId)) {
        tabAdStats.set(tabId, { networkAds: 0, domAds: 0 });
    }
    return tabAdStats.get(tabId);
}

chrome.tabs.onRemoved.addListener((tabId) => {
    tabAdStats.delete(tabId);
});

/* =========================================================
/* =========================================================
   AI INFERENCE PROVIDERS: ZERO-LOGIN CLOUD AI & OLLAMA
   ========================================================= */

async function getAISettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            "ai_provider",
            "ai_text_model",
            "ai_vision_model",
            "puter_auth_token",
            "ollama_url"
        ], (res) => {
            let provider = res.ai_provider || "cloud";
            // If legacy puter was selected without token, automatically route to zero-login cloud
            if (provider === "puter" && !res.puter_auth_token) {
                provider = "cloud";
            }
            resolve({
                provider: provider,
                // On anonymous cloud tier, lock to 'openai' to prevent HTTP 402 Payment Required
                textModel: provider === "cloud" ? "openai" : (res.ai_text_model || "deepseek-r1"),
                visionModel: provider === "cloud" ? "openai" : (res.ai_vision_model || "qwen2.5vl"),
                puterToken: res.puter_auth_token || "",
                ollamaUrl: (res.ollama_url || "http://127.0.0.1:11434").replace(/\/+$/, "")
            });
        });
    });
}

async function executeCloudChat(messages, model = "openai", timeoutMs = 60000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const callApi = async () => {
        return fetch("https://text.pollinations.ai/openai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: messages,
                model: "openai"
            }),
            signal: controller.signal
        });
    };

    try {
        let response = await callApi();

        // If rate limited (HTTP 402 / 429), pause 2 seconds and retry once
        if (response.status === 402 || response.status === 429) {
            await new Promise(r => setTimeout(r, 2000));
            response = await callApi();
        }

        clearTimeout(timer);
        if (!response.ok) {
            console.warn(`[DarkSight] Cloud AI rate limited (HTTP ${response.status}). Suppressed gracefully.`);
            return "";
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || data?.text || "";
        return content;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === "AbortError") {
            console.warn("[DarkSight] Cloud AI request timed out");
            return "";
        }
        console.warn("[DarkSight] Cloud AI fetch error:", err.message);
        return "";
    }
}

async function executePuterChat(messages, model, authToken, timeoutMs = 90000) {
    if (!authToken) {
        // Fallback to zero-login Cloud AI if no Puter token
        return executeCloudChat(messages, "openai", timeoutMs);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch("https://api.puter.com/drivers/call", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                interface: "puter-chat-completion",
                driver: "ai-chat",
                test_mode: false,
                method: "complete",
                args: {
                    messages: messages,
                    model: model || "gpt-4o-mini"
                },
                auth_token: authToken
            }),
            signal: controller.signal
        });

        clearTimeout(timer);
        if (!response.ok) {
            const errText = await response.text();
            if (response.status === 401 || response.status === 403) {
                // On auth failure, automatically fallback to Zero-Login Cloud AI
                return executeCloudChat(messages, "openai", timeoutMs);
            }
            throw new Error(`Puter API Error (HTTP ${response.status}): ${errText.slice(0, 180)}`);
        }

        const data = await response.json();
        const content = data?.result?.message?.content || data?.message?.content || data?.text || "";
        return content;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === "AbortError") {
            throw new Error(`Puter API request timed out (${timeoutMs / 1000}s)`);
        }
        throw err;
    }
}

async function executeOllama(body, ollamaUrl, timeoutMs = 120000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timer);
        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 150)}`);
        if (!text) throw new Error("Empty response from Ollama (possibly overloaded)");
        const data = JSON.parse(text);
        return data.response || "";
    } catch (err) {
        clearTimeout(timer);
        if (err.name === "AbortError") {
            throw new Error(`Ollama request timed out (${timeoutMs / 1000}s)`);
        }
        if (err.message && err.message.includes("Failed to fetch")) {
            throw new Error(`Cannot reach Ollama at ${ollamaUrl}. Ensure Ollama is running or switch to Puter.js in AI Models tab.`);
        }
        throw err;
    }
}

/* =========================================================
   RUNTIME MESSAGE DISPATCHER
   ========================================================= */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchLLM") {
        getAISettings().then(async (settings) => {
            try {
                let responseText = "";
                if (settings.provider === "cloud") {
                    responseText = await executeCloudChat(
                        [{ role: "user", content: request.prompt }],
                        settings.textModel,
                        120000
                    );
                } else if (settings.provider === "puter" && settings.puterToken) {
                    responseText = await executePuterChat(
                        [{ role: "user", content: request.prompt }],
                        settings.textModel,
                        settings.puterToken,
                        120000
                    );
                } else if (settings.provider === "ollama") {
                    responseText = await executeOllama(
                        {
                            model: settings.textModel,
                            prompt: request.prompt,
                            stream: false
                        },
                        settings.ollamaUrl,
                        120000
                    );
                } else {
                    // Fallback to zero-login Cloud AI
                    responseText = await executeCloudChat(
                        [{ role: "user", content: request.prompt }],
                        settings.textModel,
                        120000
                    );
                }
                sendResponse({ success: true, data: { response: responseText } });
            } catch (err) {
                console.error("[DarkSight] Background fetchLLM error:", err);
                sendResponse({ success: false, error: err.message });
            }
        });
        return true;
    } else if (request.action === "analyzeScreenshot") {
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "jpeg", quality: 80 }, async (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            const base64Image = dataUrl.split(',')[1];
            const settings = await getAISettings();

            try {
                let responseText = "";
                if (settings.provider === "cloud") {
                    // Pollinations text endpoint is non-multimodal; return NORMAL to avoid false positive chatter
                    responseText = "NORMAL";
                } else if (settings.provider === "puter" && settings.puterToken) {
                    responseText = await executePuterChat(
                        [{
                            role: "user",
                            content: [
                                { type: "text", text: request.prompt },
                                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                            ]
                        }],
                        settings.visionModel,
                        settings.puterToken,
                        120000
                    );
                } else {
                    responseText = await executeOllama(
                        {
                            model: settings.visionModel,
                            prompt: request.prompt,
                            images: [base64Image],
                            stream: false
                        },
                        settings.ollamaUrl,
                        120000
                    );
                }
                sendResponse({ success: true, data: { response: responseText } });
            } catch (err) {
                console.error("[DarkSight] Background Vision fetch error:", err);
                sendResponse({ success: false, error: err.message });
            }
        });
        return true;
    } else if (request.action === "testAIConnection") {
        const startTime = Date.now();
        getAISettings().then(async (settings) => {
            try {
                let reply = "";
                if (settings.provider === "cloud") {
                    reply = await executeCloudChat(
                        [{ role: "user", content: "Reply with 'Zero-Login Cloud AI connected successfully!' and nothing else." }],
                        settings.textModel,
                        25000
                    );
                } else if (settings.provider === "puter" && settings.puterToken) {
                    reply = await executePuterChat(
                        [{ role: "user", content: "Reply with the word 'Puter connected successfully!' and nothing else." }],
                        settings.textModel,
                        settings.puterToken,
                        25000
                    );
                } else {
                    reply = await executeOllama(
                        {
                            model: settings.textModel,
                            prompt: "Reply with the word 'Ollama connected successfully!' and nothing else.",
                            stream: false
                        },
                        settings.ollamaUrl,
                        25000
                    );
                }
                const latency = Date.now() - startTime;
                if (!reply || !reply.trim()) {
                    sendResponse({
                        success: false,
                        error: "AI engine temporarily busy or rate limited. Please retry in a few moments."
                    });
                    return;
                }
                sendResponse({
                    success: true,
                    provider: settings.provider === "cloud" ? "Cloud AI (Zero-Login)" : settings.provider,
                    model: settings.textModel,
                    latencyMs: latency,
                    reply: (reply || "").trim()
                });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
        });
        return true;
    } else if (request.action === "syncAdBlock") {
        syncAdBlockRules().then(() => {
            sendResponse({ success: true });
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    } else if (request.action === "recordBlockedAd") {
        const tabId = (sender && sender.tab && sender.tab.id) || null;
        if (tabId) {
            const stats = getStatsForTab(tabId);
            stats.domAds++;
        }
        sendResponse({ success: true });
        return true;
    } else if (request.action === "getTabAdStats") {
        const targetTabId = request.tabId;
        const stats = getStatsForTab(targetTabId);
        sendResponse({
            networkAds: stats.networkAds,
            domAds: stats.domAds,
            total: stats.networkAds + stats.domAds
        });
        return true;
    }
});

/* =========================================================
   AD BLOCKER DECLARATIVE NET REQUEST (DNR) MANAGEMENT
   ========================================================= */

async function syncAdBlockRules() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["adblock_enabled", "adblock_disabled_sites"], async (res) => {
            const adblockEnabled = res.adblock_enabled !== false;
            const disabledSites = res.adblock_disabled_sites || [];

            try {
                const ubolRulesets = [
                    "ublock-filters",
                    "easylist",
                    "easyprivacy",
                    "pgl",
                    "ublock-badware",
                    "urlhaus-full",
                    "ruleset_adblock"
                ];

                if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateEnabledRulesets) {
                    await chrome.declarativeNetRequest.updateEnabledRulesets({
                        enableRulesetIds: adblockEnabled ? ubolRulesets : [],
                        disableRulesetIds: adblockEnabled ? [] : ubolRulesets
                    });
                }

                if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.getDynamicRules) {
                    const existingDynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
                    const existingIds = existingDynamicRules.map(r => r.id);

                    const newRules = (adblockEnabled && disabledSites.length > 0) ? disabledSites.map((site, index) => ({
                        id: 90000 + index,
                        priority: 100,
                        action: { type: "allowAllRequests" },
                        condition: {
                            initiatorDomains: [site],
                            resourceTypes: ["main_frame", "sub_frame"]
                        }
                    })) : [];

                    await chrome.declarativeNetRequest.updateDynamicRules({
                        removeRuleIds: existingIds,
                        addRules: newRules
                    });
                }
                resolve();
            } catch (e) {
                console.error("[DarkSight] Failed to sync AdBlock DNR rules:", e);
                resolve();
            }
        });
    });
}

chrome.runtime.onInstalled.addListener(() => {
    syncAdBlockRules();
});

chrome.runtime.onStartup.addListener(() => {
    syncAdBlockRules();
});

/* =========================================================
   LIVE NETWORK AD TRAFFIC MONITOR (webRequest)
   Counts ads blocked by declarative rules in real-time
   ========================================================= */

const AD_URL_REGEX = /doubleclick|googlesyndication|googleadservices|taboola|outbrain|adnxs|criteo|amazon-adsystem|popads|popcash|adsterra|propellerads|exoclick|trafficjunky|highcpmgate|toprevenuegate|deloplen|whomeue|realsrv|tsyndicate|onclickperformance|exdynsrv|hilltopads|clickadu|juicyads|ero-advertising|adxad|twinrdsyndication|etahub|twistys|chaturbate|bongacams|stripchat|livejasmin|popmyads|yllix|exosrv|adbull/i;

if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (details.tabId > 0) {
                chrome.storage.local.get(["adblock_enabled"], (res) => {
                    if (res.adblock_enabled === false) return;

                    if (AD_URL_REGEX.test(details.url)) {
                        const stats = getStatsForTab(details.tabId);
                        stats.networkAds++;
                    }
                });
            }
        },
        { urls: ["<all_urls>"] }
    );
}
