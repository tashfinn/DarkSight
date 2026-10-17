/* =========================================================
   DARKSIGHT AD BLOCKER (uBlock Origin Style)
   - Real-Time YouTube Video Ad Skipper (Pre-rolls & Mid-rolls)
   - Facebook Sponsored Post Remover
   - Pornhub Empty Space & Placeholder Collapse
   - Zero Click Interception (100% Native Link & Download Behavior)
   - Live DOM Statistics Reporting to Popup
   ========================================================= */

(function () {
    let adBlockEnabled = true;
    let isSiteDisabled = false;
    let ytLoop = null;
    let fbLoop = null;
    let pornhubLoop = null;
    let lastMutedByUs = false;
    let domObserver = null;

    const hostname = window.location.hostname.toLowerCase();
    const isYouTube = hostname.includes("youtube.com");
    const isFacebook = hostname.includes("facebook.com");
    const isPornhub = hostname.includes("pornhub.com");

    const COUNT_SELECTORS = [
        "ins.adsbygoogle",
        "[id^='google_ads_']",
        "[id^='div-gpt-ad']",
        "iframe[src*='doubleclick']",
        "iframe[src*='googlesyndication']",
        "iframe[src*='amazon-adsystem']",
        "iframe[src*='adnxs']",
        "iframe[src*='criteo']",
        "iframe[src*='taboola']",
        "iframe[src*='outbrain']",
        "iframe[src*='trafficjunky']",
        "iframe[src*='exoclick']",
        "iframe[src*='juicyads']",
        "iframe[src*='tsyndicate']",
        "iframe[src*='realsrv']",
        "iframe[src*='popads']",
        "iframe[src*='adsterra']",
        "iframe[src*='highcpmgate']",
        "iframe[src*='deloplen']",
        ".adsbygoogle",
        "#masthead-ad",
        "ytd-ad-slot-renderer",
        "ytd-promoted-sparkles-web-renderer",
        "ytd-banner-promo-renderer"
    ];

    /* =========================================================
       INITIALIZATION & SYNC
       ========================================================= */

    function init() {
        chrome.storage.local.get(["adblock_enabled", "adblock_disabled_sites"], (res) => {
            adBlockEnabled = res.adblock_enabled !== false;
            const disabledSites = res.adblock_disabled_sites || [];
            isSiteDisabled = disabledSites.includes(hostname);

            if (adBlockEnabled && !isSiteDisabled) {
                startShields();
            } else {
                stopShields();
            }
        });
    }

    function startShields() {
        if (isYouTube) {
            startYouTubeAdSkipper();
            cleanYouTubeGaps();
        }

        if (isFacebook) {
            cleanFacebookAds();
            if (!fbLoop) {
                fbLoop = setInterval(cleanFacebookAds, 500);
            }
        }

        if (isPornhub) {
            cleanPornhubAds();
            if (!pornhubLoop) {
                pornhubLoop = setInterval(cleanPornhubAds, 500);
            }
        }

        collapseUniversalAdPlaceholders();
        startDOMObserver();

        window.addEventListener("scroll", collapseUniversalAdPlaceholders, { passive: true });
        window.addEventListener("DOMContentLoaded", collapseUniversalAdPlaceholders);
        window.addEventListener("load", collapseUniversalAdPlaceholders);
    }

    function stopShields() {
        if (ytLoop) {
            clearInterval(ytLoop);
            ytLoop = null;
        }
        if (fbLoop) {
            clearInterval(fbLoop);
            fbLoop = null;
        }
        if (pornhubLoop) {
            clearInterval(pornhubLoop);
            pornhubLoop = null;
        }
        if (domObserver) {
            domObserver.disconnect();
            domObserver = null;
        }
    }

    function startDOMObserver() {
        if (domObserver) domObserver.disconnect();
        domObserver = new MutationObserver(() => {
            collapseUniversalAdPlaceholders();
        });

        const target = document.body || document.documentElement;
        if (target) {
            domObserver.observe(target, { childList: true, subtree: true });
        }
    }

    /* =========================================================
       FACEBOOK SPONSORED POST CLEANER
       ========================================================= */

    function cleanFacebookAds() {
        if (!isFacebook || !adBlockEnabled || isSiteDisabled) return;
        try {
            // 1. Right Rail / Sidebar Sponsored widgets & cards (e.g. Rokomari, Magoosh, TikTok)
            const rightRails = document.querySelectorAll('div[data-pagelet="RightRail"], div[role="complementary"], div[data-pagelet*="Right"]');
            for (const rail of rightRails) {
                // Find all section headers or elements containing "Sponsored"
                const elements = rail.querySelectorAll('span, h3, h4, div');
                for (const el of elements) {
                    const text = (el.textContent || "").replace(/[\u200B-\u200D\uFEFF\s]/g, "");
                    if (text.toLowerCase() === "sponsored") {
                        // Find the whole Sponsored section container (stop before enclosing sibling sections like Friend requests/Birthdays)
                        let section = el;
                        while (section && section.parentElement && section.parentElement !== rail) {
                            const pText = section.parentElement.textContent || "";
                            if (/friend requests|birthdays|contacts/i.test(pText)) {
                                break;
                            }
                            section = section.parentElement;
                        }
                        if (section && section !== rail && !section._ds_fb_cleaned) {
                            section.style.setProperty("display", "none", "important");
                            section.remove();
                            section._ds_fb_cleaned = true;
                        }
                    }
                }

                // Also find external ad links in right rail (l.facebook.com or target="_blank" or /ads/)
                const adLinks = rail.querySelectorAll('a[href*="l.facebook.com/l.php"], a[href*="facebook.com/l.php"], a[href*="/ads/about"], a[href*="/about/ads"], a[href*="ad_preferences"]');
                for (const link of adLinks) {
                    let card = link.closest('li') || link.closest('div[role="listitem"]');
                    if (!card) {
                        let cur = link;
                        while (cur && cur.parentElement && cur.parentElement !== rail) {
                            const pText = cur.parentElement.textContent || "";
                            if (/friend requests|birthdays|contacts/i.test(pText)) {
                                card = cur;
                                break;
                            }
                            cur = cur.parentElement;
                        }
                    }
                    if (card && card !== rail && !card._ds_fb_cleaned) {
                        card.style.setProperty("display", "none", "important");
                        card.remove();
                        card._ds_fb_cleaned = true;
                    }
                }
            }

            // 2. Feed Sponsored Posts
            const feedPosts = document.querySelectorAll('div[data-pagelet^="FeedUnit_"], div[role="feed"] > div, div[role="article"]');
            for (const post of feedPosts) {
                if (post._ds_fb_cleaned) continue;

                const hasAria = post.querySelector('[aria-label="Sponsored" i], [aria-label*="Sponsored" i], [aria-label*="Gesponsord" i], [aria-label*="Publicidad" i]');
                const hasAdLink = post.querySelector('a[href*="/ads/about"], a[href*="/about/ads"], a[href*="facebook.com/ad_preferences"], a[href*="/adpreferences"]');
                let hasSponsoredText = false;

                if (!hasAria && !hasAdLink) {
                    const spans = post.querySelectorAll('span, a');
                    for (const s of spans) {
                        const cleanS = (s.textContent || "").replace(/[\u200B-\u200D\uFEFF\s]/g, "");
                        if (/^Sponsored$/i.test(cleanS)) {
                            hasSponsoredText = true;
                            break;
                        }
                    }
                }

                if (hasAria || hasAdLink || hasSponsoredText) {
                    post.style.setProperty("display", "none", "important");
                    post.remove();
                    post._ds_fb_cleaned = true;
                }
            }
        } catch (e) {}
    }

    /* =========================================================
       YOUTUBE EMPTY GAP & MASTHEAD AD PURGER (Home & Browse Feeds Only)
       ========================================================= */

    function cleanYouTubeGaps() {
        if (!isYouTube || !adBlockEnabled || isSiteDisabled) return;
        // CRITICAL: NEVER run gap cleaner on watch pages! Watch pages host player, comments, and recommendations.
        if (window.location.pathname.startsWith("/watch")) return;

        try {
            const adContainers = document.querySelectorAll(`
                ytd-rich-section-renderer:has(ytd-ad-slot-renderer),
                ytd-rich-section-renderer:has(#masthead-ad),
                ytd-rich-section-renderer:has(ytd-banner-promo-renderer),
                ytd-rich-section-renderer:has(ytd-statement-banner-renderer),
                ytd-rich-section-renderer:has(ytd-in-feed-ad-layout-renderer),
                ytd-rich-section-renderer:has(ytd-brand-video-singleton-renderer),
                ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
                ytd-rich-item-renderer:has(ytd-in-feed-ad-layout-renderer),
                ytd-rich-section-renderer:has(a[href*="/playables"]),
                ytd-rich-section-renderer:has([title*="Playables" i]),
                #masthead-ad,
                ytd-ad-slot-renderer,
                ytd-banner-promo-renderer,
                ytd-statement-banner-renderer
            `);
            for (const el of adContainers) {
                // Safeguard comments and player columns
                if (el.closest("ytd-comments, #comments, ytd-comment-thread-renderer, ytd-watch-metadata, #primary, #primary-inner, ytd-watch-flexy")) continue;

                el.style.setProperty("display", "none", "important");
                el.style.setProperty("height", "0px", "important");
                el.style.setProperty("min-height", "0px", "important");
                el.style.setProperty("margin", "0px", "important");
                el.style.setProperty("padding", "0px", "important");
                el.remove();
            }

            // Collapse empty ad promo shelves on feed (only if specifically containing an ad slot)
            const sections = document.querySelectorAll("ytd-rich-section-renderer");
            for (const sec of sections) {
                if (!sec.querySelector("ytd-rich-item-renderer, ytd-video-renderer, ytd-reel-item-renderer")) {
                    if (sec.querySelector("ytd-ad-slot-renderer, #masthead-ad, ytd-banner-promo-renderer")) {
                        sec.style.setProperty("display", "none", "important");
                        sec.style.setProperty("height", "0px", "important");
                        sec.style.setProperty("margin", "0px", "important");
                        sec.remove();
                    }
                }
            }
        } catch (e) {}
    }

    /* =========================================================
       PORNHUB DEDICATED AD CLEANER (Isolated Strictly to Pornhub)
       ========================================================= */

    function cleanPornhubAds() {
        if (!isPornhub || !adBlockEnabled || isSiteDisabled) return;
        try {
            const adListItems = document.querySelectorAll(`
                li:has(.adSpot),
                li:has(.network-ad),
                li:has(.adBlockContainer),
                li:has(iframe[src*="trafficjunky"]),
                li:has(iframe[src*="exoclick"]),
                li:has(a[href*="trafficjunky"]),
                li:has(a[href*="exoclick"]),
                li.adListItem,
                li.commercial,
                li.grid_ad,
                li[data-segment="ad"],
                .adSpot,
                .network-ad,
                .adBlockContainer,
                .underplayerAd
            `);
            for (const item of adListItems) {
                item.style.setProperty("display", "none", "important");
                item.style.setProperty("height", "0px", "important");
                item.remove();
            }
        } catch (e) {}
    }

    /* =========================================================
       UNIVERSAL AD PLACEHOLDER COLLAPSER (All Websites)
       Zero UI Breakage: ONLY targets genuine ad network units
       NEVER modifies parent containers or collapses website grids
       ========================================================= */

    const UNIVERSAL_AD_SELECTORS = [
        "ins.adsbygoogle",
        "[id^='google_ads_']",
        "[id^='div-gpt-ad']",
        "[data-ad-client]",
        "[data-ad-slot]",
        "[data-ad-unit]",
        "[data-ad-zone]",
        "[data-dfp]",
        "[data-google-query-id]",
        ".adsbygoogle",
        ".trc_related_container",
        ".outbrain-widget",
        ".taboola-container"
    ];

    function collapseUniversalAdPlaceholders() {
        if (!adBlockEnabled || isSiteDisabled) return;
        try {
            if (isYouTube) cleanYouTubeGaps();
            if (isFacebook) cleanFacebookAds();
            if (isPornhub) cleanPornhubAds();

            const adElements = document.querySelectorAll(UNIVERSAL_AD_SELECTORS.join(", "));
            for (const el of adElements) {
                // Safeguard essential elements like YouTube masthead, comments, and popup containers
                if (isYouTube && el.closest("ytd-popup-container, #popup-container, ytd-multi-page-menu-renderer, tp-yt-iron-dropdown, ytd-comments, #comments, ytd-comment-thread-renderer, #masthead, ytd-masthead, #masthead-container, #primary, #primary-inner")) continue;
                if (el.id === "masthead-container" || el.closest("#masthead-container")) continue;

                el.style.setProperty("display", "none", "important");
                el.style.setProperty("height", "0px", "important");
                el.style.setProperty("min-height", "0px", "important");
                el.style.setProperty("max-height", "0px", "important");
                el.style.setProperty("margin", "0px", "important");
                el.style.setProperty("padding", "0px", "important");
                el.style.setProperty("border", "none", "important");
            }
        } catch (e) {}
    }

    /* =========================================================
       YOUTUBE REAL-TIME VIDEO AD SKIPPER
       ========================================================= */

    function clickAllSkipButtons() {
        // ONLY click skip buttons if a video ad is actually active!
        if (!isYouTubeAdActive()) return;

        // ONLY search within the active YouTube player, NEVER across the global document!
        const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
        if (!player) return;

        const skipSelectors = [
            ".ytp-skip-ad-button",
            ".ytp-ad-skip-button",
            ".ytp-ad-skip-button-modern",
            ".ytp-skip-ad-button-modern",
            ".ytp-ad-skip-button-slot button",
            ".ytp-ad-skip-button-slot",
            "div.ytp-skip-ad-button",
            "div.ytp-ad-skip-button",
            ".ytp-ad-skip-button-text",
            "[id^='ad-text'].ytp-ad-skip-button-text",
            "button[class*='ytp-ad-skip-button']",
            "button[class*='ytp-skip-ad-button']",
            "div[class*='ytp-ad-skip-button']",
            "div[class*='ytp-skip-ad-button']",
            ".ytp-ad-overlay-close-button",
            "button.ytp-ad-overlay-close-button",
            ".ytp-ad-player-overlay-layout button[aria-label*='skip' i]",
            ".video-ads button[aria-label*='skip' i]"
        ];
        for (const sel of skipSelectors) {
            const btns = player.querySelectorAll(sel);
            for (const btn of btns) {
                // Safeguard: NEVER click masthead navigation or outside dialogs
                if (btn.id === "skip-navigation" || btn.closest("#skip-navigation, #masthead, ytd-masthead, #masthead-container, ytd-popup-container, #popup-container")) continue;
                triggerClick(btn);
            }
        }
    }

    function isYouTubeAdActive() {
        // 1. YouTube player classes indicating active ad
        const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
        if (player && (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting"))) {
            return true;
        }

        // 2. Global ad indicators in DOM
        if (document.querySelector(".ad-showing, .ad-interrupting, .ytp-ad-player-overlay, .ytp-ad-player-overlay-layout")) {
            return true;
        }

        // 3. Active video ad module with children
        const videoAds = document.querySelector(".video-ads");
        if (videoAds && videoAds.children && videoAds.children.length > 0) {
            return true;
        }

        // 4. If ANY skip button exists inside the player, an ad is active
        if (player && player.querySelector(".ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button-modern, .ytp-ad-skip-button-slot, button[class*='ytp-ad-skip-button'], button[class*='ytp-skip-ad-button']")) {
            return true;
        }

        const adText = document.querySelector(".ytp-ad-text, .ytp-ad-preview-text, .ytp-ad-duration-remaining");
        if (adText && (adText.textContent || "").trim().length > 0) {
            return true;
        }

        return false;
    }

    function triggerClick(btn) {
        if (!btn) return;
        try {
            if (typeof btn.click === "function") btn.click();
            btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
            btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }));
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
            const childBtn = btn.querySelector("button");
            if (childBtn) {
                if (typeof childBtn.click === "function") childBtn.click();
                childBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
            }
        } catch (e) {}
    }

    function processYouTubeAd() {
        if (!adBlockEnabled || isSiteDisabled) return;

        const isAd = isYouTubeAdActive();
        const video = document.querySelector("video.html5-main-video") || document.querySelector("video");

        // Automatically bind ratechange and playback events to any video element
        if (video && !video._ds_hooked) {
            video._ds_hooked = true;
            video.addEventListener("timeupdate", processYouTubeAd);
            video.addEventListener("play", processYouTubeAd);
            video.addEventListener("playing", processYouTubeAd);
            video.addEventListener("ratechange", () => {
                if (isYouTubeAdActive() && video.playbackRate < 16.0) {
                    video.playbackRate = 16.0;
                }
            });
        }

        if (isAd) {
            if (video) {
                // Silently mute the ad
                if (!video.muted) {
                    video.muted = true;
                    lastMutedByUs = true;
                }

                // Force maximum playback rate
                video.playbackRate = 16.0;

                // Instantly advance to end of ad
                if (isFinite(video.duration) && video.duration > 0.1) {
                    video.currentTime = video.duration;
                }

                // Prevent ad from pausing itself
                if (video.paused) {
                    video.play().catch(() => {});
                }
            }

            // Click ad skip buttons (strictly scoped)
            clickAllSkipButtons();
        } else {
            // Restore normal playback speed and volume for actual video
            if (video) {
                if (video.playbackRate > 2.0) {
                    video.playbackRate = 1.0;
                }
                if (lastMutedByUs && video.muted) {
                    video.muted = false;
                    lastMutedByUs = false;
                }
            }
        }

        // Auto-dismiss anti-adblock warning dialogues & unpause
        const antiAdblockModal = document.querySelector("ytd-enforcement-message-view-model, tp-yt-paper-dialog[aria-label*='ad blocker' i]");
        if (antiAdblockModal) {
            antiAdblockModal.remove();
            document.querySelectorAll("tp-yt-iron-overlay-backdrop:has(~ ytd-enforcement-message-view-model)").forEach(b => b.remove());
            if (video && video.paused) {
                const playBtn = document.querySelector(".ytp-play-button");
                if (playBtn) playBtn.click();
            }
        }
    }

    function startYouTubeAdSkipper() {
        if (ytLoop) clearInterval(ytLoop);
        ytLoop = setInterval(processYouTubeAd, 50);

        // Gap cleaner runs periodically, not 20 times a second
        setInterval(cleanYouTubeGaps, 1000);

        function hookVideoEvents() {
            const video = document.querySelector("video");
            if (video && !video._ds_hooked) {
                video._ds_hooked = true;
                video.addEventListener("timeupdate", processYouTubeAd);
                video.addEventListener("play", processYouTubeAd);
                video.addEventListener("playing", processYouTubeAd);
                video.addEventListener("ratechange", () => {
                    if (isYouTubeAdActive() && video.playbackRate < 16.0) {
                        video.playbackRate = 16.0;
                    }
                });
            }
        }

        // Fast MutationObserver to click skip buttons within 0ms of entering DOM
        const ytObserver = new MutationObserver(() => {
            const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
            if (player && (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting"))) {
                processYouTubeAd();
            }
        });
        const target = document.getElementById("movie_player") || document.body || document.documentElement;
        if (target) {
            ytObserver.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
        }

        // Hook YouTube SPA navigation events
        window.addEventListener("yt-navigate-finish", () => {
            processYouTubeAd();
            cleanYouTubeGaps();
        });
        window.addEventListener("yt-page-data-updated", () => {
            processYouTubeAd();
            cleanYouTubeGaps();
        });
        window.addEventListener("spfdone", () => {
            processYouTubeAd();
            cleanYouTubeGaps();
        });
        document.addEventListener("yt-navigate-finish", () => {
            processYouTubeAd();
            cleanYouTubeGaps();
        });
        document.addEventListener("yt-page-data-updated", () => {
            processYouTubeAd();
            cleanYouTubeGaps();
        });

        hookVideoEvents();
        setTimeout(hookVideoEvents, 500);
        setTimeout(hookVideoEvents, 1500);
        setTimeout(hookVideoEvents, 3000);
    }

    /* =========================================================
       DOM SCANNER & STATS REPORTING
       ========================================================= */

    function getLiveBlockedCount() {
        if (!adBlockEnabled || isSiteDisabled) return 0;
        let count = 0;
        try {
            const elements = document.querySelectorAll(COUNT_SELECTORS.join(","));
            count = elements.length;
        } catch (e) {}
        return count;
    }

    /* =========================================================
       RUNTIME COMMUNICATION
       ========================================================= */

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === "getAdBlockCounts") {
            const liveTotal = getLiveBlockedCount();
            sendResponse({
                adsBlockedCount: liveTotal,
                adBlockEnabled: adBlockEnabled,
                isSiteDisabled: isSiteDisabled,
                isYouTube: isYouTube
            });
            return true;
        }

        if (msg.action === "toggleAdBlockMaster") {
            adBlockEnabled = msg.enabled;
            if (adBlockEnabled && !isSiteDisabled) {
                startShields();
            } else {
                stopShields();
            }
            sendResponse({ success: true, adBlockEnabled: adBlockEnabled });
            return true;
        }

        if (msg.action === "toggleAdBlockSite") {
            isSiteDisabled = msg.disabledForSite;
            if (adBlockEnabled && !isSiteDisabled) {
                startShields();
            } else {
                stopShields();
            }
            sendResponse({ success: true, isSiteDisabled: isSiteDisabled });
            return true;
        }
    });

    init();
})();
