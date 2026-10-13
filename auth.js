/* =========================================================
   DARKSIGHT PUTER.JS AUTHENTICATION CONTROLLER
   ========================================================= */

const btnConnect = document.getElementById("btn-puter-connect");
const btnText = document.getElementById("btn-text");
const statusBox = document.getElementById("status-box");
const manualToggle = document.getElementById("manual-toggle");
const manualSection = document.getElementById("manual-section");
const manualTokenInput = document.getElementById("manual-token-input");
const btnManualSave = document.getElementById("btn-manual-save");

// Check current connection state
chrome.storage.local.get(["puter_auth_token", "puter_username"], (res) => {
    if (res.puter_auth_token) {
        showSuccess(`✅ Already connected as <strong>${res.puter_username || "Puter User"}</strong>! You can close this tab or reconnect anytime.`);
        btnText.textContent = "Reconnect Puter Account";
        if (manualTokenInput) manualTokenInput.value = res.puter_auth_token;
    }
});

// One-click Connect via Puter.js
btnConnect.addEventListener("click", async () => {
    btnConnect.disabled = true;
    btnText.textContent = "Connecting to Puter...";

    try {
        if (typeof puter === "undefined") {
            throw new Error("Puter SDK is not loaded. Please ensure lib/puter.js is present.");
        }

        // Trigger sign-in modal/window
        await puter.auth.signIn({ attempt_temp_user_creation: true, request_auth: true });

        const token = puter.authToken;
        if (!token) {
            throw new Error("No authentication token was returned by Puter.");
        }

        let username = "Puter User";
        try {
            const user = await puter.getUser();
            if (user && user.username) username = user.username;
        } catch (e) {}

        // Persist token and activate Puter provider
        chrome.storage.local.set({
            puter_auth_token: token,
            puter_username: username,
            ai_provider: "puter"
        }, () => {
            showSuccess(`🎉 <strong>Successfully connected to Puter as ${username}!</strong><br>DarkSight is now using Puter Cloud AI for fast dark pattern detection.<br><br>You can safely close this tab now.`);
            btnText.textContent = "Connected!";
            btnConnect.disabled = false;
        });

    } catch (err) {
        console.error("Puter Auth Error:", err);
        showError(`Failed to connect: ${err.message || err}. You can also paste your token manually below.`);
        btnText.textContent = "Retry Connection";
        btnConnect.disabled = false;
    }
});

// Manual Token Input
manualToggle.addEventListener("click", () => {
    manualSection.classList.toggle("open");
});

btnManualSave.addEventListener("click", () => {
    const token = (manualTokenInput.value || "").trim();
    if (!token) {
        showError("Please enter a valid Puter Auth Token.");
        return;
    }

    chrome.storage.local.set({
        puter_auth_token: token,
        puter_username: "Custom Token User",
        ai_provider: "puter"
    }, () => {
        showSuccess("✅ Puter Auth Token saved successfully! DarkSight is ready to use Puter Cloud AI.");
    });
});

function showSuccess(html) {
    statusBox.className = "status-box success";
    statusBox.innerHTML = html;
}

function showError(msg) {
    statusBox.className = "status-box error";
    statusBox.textContent = msg;
}
