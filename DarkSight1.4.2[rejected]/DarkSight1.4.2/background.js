let creatingOffscreen;

async function setupOffscreenDocument(path) {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL(path)]
    });

    if (existingContexts.length > 0) return;

    if (creatingOffscreen) {
        await creatingOffscreen;
    } else {
        creatingOffscreen = chrome.offscreen.createDocument({
            url: path,
            reasons: ['DOM_PARSER'],
            justification: 'Run ONNX Runtime Web and Tesseract OCR models'
        });
        await creatingOffscreen;
        creatingOffscreen = null;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchLLM") {
        fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt: request.prompt,
                stream: false
            })
        })
        .then(async res => {
            const text = await res.text();
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            if (!text) {
                throw new Error("Empty response from Ollama (possibly overloaded)");
            }
            return JSON.parse(text);
        })
        .then(data => sendResponse({ success: true, data: data }))
        .catch(err => {
            console.error("Background fetch error:", err);
            sendResponse({ success: false, error: err.message });
        });
        
        return true; // Keep the message channel open for the async response
    }
    
    if (request.action === "requestVisualScan") {
        (async () => {
            try {
                const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "jpeg", quality: 90 });
                await setupOffscreenDocument('offscreen.html');
                const response = await chrome.runtime.sendMessage({
                    action: "processImage",
                    dataUrl: dataUrl,
                    bannerRects: request.bannerRects,
                    dpr: request.dpr
                });
                sendResponse(response);
            } catch (err) {
                if (!err.message.includes("activeTab")) {
                    console.error("Visual scan error:", err);
                }
                sendResponse({ success: false, error: err.toString(), requiresInteraction: err.message.includes("activeTab") });
            }
        })();
        return true;
    }

    if (request.action === "terminateOffscreen") {
        chrome.offscreen.closeDocument().catch(() => {});
        return true;
    }
});
