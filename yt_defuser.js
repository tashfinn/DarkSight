/* =========================================================
   DARKSIGHT YOUTUBE PLAYER DEFUSER (MAIN World Engine)
   Runs at document_start in the MAIN world.
   Intercepts ytInitialPlayerResponse, JSON.parse, fetch,
   and XMLHttpRequest to prune adPlacements before playback.
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

    // 3. Intercept fetch for /youtubei/v1/player, /youtubei/v1/next, and /youtubei/v1/reel
    const origFetch = window.fetch;
    if (typeof origFetch === 'function') {
        window.fetch = async function (...args) {
            const response = await origFetch.apply(this, args);
            try {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
                if (typeof url === 'string' && (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next') || url.includes('/youtubei/v1/reel'))) {
                    const clone = response.clone();
                    const text = await clone.text();
                    try {
                        const data = origParse(text);
                        sanitizeData(data);
                        return new Response(JSON.stringify(data), {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
                    } catch (err) {
                        return response;
                    }
                }
            } catch (e) {}
            return response;
        };
    }

    // 4. Intercept XMLHttpRequest for /youtubei/v1/player and /youtubei/v1/next
    try {
        const origOpen = XMLHttpRequest.prototype.open;
        const origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            this._ds_url = url;
            return origOpen.call(this, method, url, ...rest);
        };
        XMLHttpRequest.prototype.send = function (...args) {
            if (this._ds_url && typeof this._ds_url === 'string' && (this._ds_url.includes('/youtubei/v1/player') || this._ds_url.includes('/youtubei/v1/next'))) {
                this.addEventListener('readystatechange', function () {
                    if (this.readyState === 4 && this.status === 200) {
                        try {
                            const data = origParse(this.responseText);
                            sanitizeData(data);
                            const sanitizedText = JSON.stringify(data);
                            Object.defineProperty(this, 'responseText', { value: sanitizedText, configurable: true });
                            Object.defineProperty(this, 'response', { value: sanitizedText, configurable: true });
                        } catch (e) {}
                    }
                });
            }
            return origSend.apply(this, args);
        };
    } catch (e) {}

    // 5. Native movie_player monitor (MAIN world direct player object)
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
