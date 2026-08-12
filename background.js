
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchLLM") {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

        fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "deepseek-r1",
                prompt: request.prompt,
                stream: false
            }),
            signal: controller.signal
        })
        .then(async res => {
            clearTimeout(timeoutId);
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
            clearTimeout(timeoutId);
            console.error("Background fetch error:", err);
            sendResponse({ success: false, error: err.name === 'AbortError' ? 'Ollama request timed out (120s)' : err.message });
        });
        
        return true; // Keep the message channel open for the async response
    } else if (request.action === "analyzeScreenshot") {
        // Capture the visible tab
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "jpeg", quality: 80 }, async (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            // Extract base64 part
            const base64Image = dataUrl.split(',')[1];
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout for vision model

            fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "qwen2.5vl", // using qwen2.5vl for state-of-the-art UI/Multimodal capability
                    prompt: request.prompt,
                    images: [base64Image],
                    stream: false
                }),
                signal: controller.signal
            })
            .then(async res => {
                clearTimeout(timeoutId);
                const text = await res.text();
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
                if (!text) throw new Error("Empty response from Ollama (possibly overloaded)");
                return JSON.parse(text);
            })
            .then(data => sendResponse({ success: true, data: data }))
            .catch(err => {
                clearTimeout(timeoutId);
                console.error("Background Vision fetch error:", err);
                sendResponse({ success: false, error: err.name === 'AbortError' ? 'Ollama Vision request timed out (120s)' : err.message });
            });
        });
        
        return true; // Keep the message channel open for the async response
    }
});
