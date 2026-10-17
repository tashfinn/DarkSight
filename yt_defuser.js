/* =========================================================
   DARKSIGHT YOUTUBE PLAYER DEFUSER (MAIN World Engine)
   Runs at document_start in the MAIN world.
   - Intercepts ytInitialPlayerResponse to neutralize pre-roll ads
   - Hooks JSON.parse to neutralize dynamic adPlacements payloads
   - Native movie_player monitor for instant 0ms ad skipping
   - Zero network hijacking (100% native fetch/XHR for comments & continuations)
   ========================================================= */

(function () {
    'use strict';
    if (window._ds_yt_defused) return;
    window._ds_yt_defused = true;

    function sanitizeData(data) {
        if (!data || typeof data !== 'object') return data;
        try {
            if (Array.isArray(data.adPlacements)) data.adPlacements = [];
            if (Array.isArray(data.adSlots)) data.adSlots = [];
            if (Array.isArray(data.playerAds)) data.playerAds = [];
            if (data.adConfig) delete data.adConfig;
            if (data.playerResponse && typeof data.playerResponse === 'object') {
                sanitizeData(data.playerResponse);
            }
            if (data.playbackTracking) {
                delete data.playbackTracking.videostatsPlaybackUrl;
                delete data.playbackTracking.videostatsDelayplayUrl;
                delete data.playbackTracking.videostatsWatchtimeUrl;
                delete data.playbackTracking.ptrackingUrl;
                delete data.playbackTracking.qoeUrl;
            }
        } catch (e) {}
        return data;
    }

    // 1. Hook JSON.parse - automatically neutralizes any JSON containing ad placements
    const origParse = JSON.parse;
    JSON.parse = function (...args) {
        const res = origParse.apply(this, args);
        if (res && typeof res === 'object') {
            if (res.adPlacements || res.playerAds || res.adSlots || res.playerResponse) {
                sanitizeData(res);
            }
        }
        return res;
    };

    // 2. Intercept window.ytInitialPlayerResponse
    let rawResponse = window.ytInitialPlayerResponse;
    if (rawResponse) {
        rawResponse = sanitizeData(rawResponse);
        window.ytInitialPlayerResponse = rawResponse;
    }
    try {
        Object.defineProperty(window, 'ytInitialPlayerResponse', {
            configurable: true,
            enumerable: true,
            get: () => rawResponse,
            set: (val) => {
                rawResponse = sanitizeData(val);
            }
        });
    } catch (e) {}

    // 3. Native movie_player monitor (MAIN world direct player object)
    // Silently neutralizes any active ad within 50ms without touching network stack
    setInterval(() => {
        try {
            const player = document.getElementById('movie_player');
            if (player) {
                if (typeof player.isAdShowing === 'function' && player.isAdShowing()) {
                    const video = player.querySelector('video') || document.querySelector('video');
                    if (video) {
                        video.muted = true;
                        video.playbackRate = 16.0;
                        if (isFinite(video.duration) && video.duration > 0.1) {
                            video.currentTime = video.duration;
                        }
                    }
                }
            }
        } catch (e) {}
    }, 50);
})();
