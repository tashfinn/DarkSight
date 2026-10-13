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
        ".ad-container",
        ".ad-wrapper",
        ".ad-slot",
        ".ad-banner",
        ".advertisement",
        ".adSpot",
        ".ad-link",
        ".network-ad",
        ".adBlockContainer",
        "div[class*='adSpot']",
        "div[id*='adSpot']",
        "div[class*='ad_box']",
        "div[class*='banner_ad']",
        "div[class*='ad-placement']",
        "div[class*='sponsored']",
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
        if (isPornhub) {
            setInterval(collapseUniversalAdPlaceholders, 500);
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
       YOUTUBE EMPTY GAP & MASTHEAD AD PURGER
       ========================================================= */

    function cleanYouTubeGaps() {
        if (!isYouTube || !adBlockEnabled || isSiteDisabled) return;
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
                ytd-rich-item-renderer:has(#ad),
                #masthead-ad,
                ytd-ad-slot-renderer,
                ytd-banner-promo-renderer,
                ytd-statement-banner-renderer
            `);
            for (const el of adContainers) {
                el.style.setProperty("display", "none", "important");
                el.style.setProperty("height", "0px", "important");
                el.style.setProperty("min-height", "0px", "important");
                el.style.setProperty("margin", "0px", "important");
                el.style.setProperty("padding", "0px", "important");
                el.remove();
            }

            // Also collapse any empty rich sections at the top of the feed
            const sections = document.querySelectorAll("ytd-rich-section-renderer");
            for (const sec of sections) {
                if (!sec.querySelector("ytd-rich-item-renderer, ytd-video-renderer, ytd-reel-item-renderer")) {
                    if (sec.querySelector("ytd-ad-slot-renderer, #masthead-ad, ytd-banner-promo-renderer") || !sec.textContent.trim()) {
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
       UNIVERSAL AD PLACEHOLDER & BLANK SPACE VAPORIZER
       Runs across all websites to collapse empty ad boxes and margins
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
        ".ad-container",
        ".ad-wrapper",
        ".ad-slot",
        ".ad-banner",
        ".ad-box",
        ".ad-placeholder",
        ".advertisement",
        ".ad_container",
        ".ad_wrapper",
        ".ad_banner",
        ".ad_slot",
        ".ad_box",
        "div[class*='ad-placement']",
        "div[class*='ad-wrapper']",
        "div[class*='ad-container']",
        "div[class*='ad-slot']",
        "div[class*='banner-ad']",
        "div[class*='sponsor']",
        ".trc_related_container",
        ".outbrain-widget",
        ".taboola-container",
        ".adSpot",
        ".ad-link",
        ".network-ad",
        ".adBlockContainer",
        ".adSpotContainer",
        ".underplayerAd"
    ];

    function collapseUniversalAdPlaceholders() {
        if (!adBlockEnabled || isSiteDisabled) return;
        try {
            if (isYouTube) cleanYouTubeGaps();
            if (isFacebook) cleanFacebookAds();

            // 1. Detect and destroy any card or grid item hosting "Remove Ads", "Sponsored", or ad labels
            const removeAdButtons = document.querySelectorAll(`
                [class*="removeAds" i],
                [class*="remove-ad" i],
                [class*="remove_ad" i],
                [id*="removeAds" i],
                [id*="remove-ad" i],
                a[href*="premium"],
                a[href*="remove_ads"],
                .removeAds,
                span, button, a
            `);
            for (const btn of removeAdButtons) {
                const text = (btn.textContent || "").trim();
                if (/^remove\s*ads?$/i.test(text) || /^remove\s*advertising$/i.test(text)) {
                    const card = btn.closest('li, div[class*="video" i], div[class*="card" i], div[class*="col" i], div[class*="item" i], div[class*="box" i]') || btn.parentElement;
                    if (card && card !== document.body && card !== document.documentElement && card.id !== "masthead-container") {
                        card.style.setProperty("display", "none", "important");
                        card.style.setProperty("height", "0px", "important");
                        card.style.setProperty("min-height", "0px", "important");
                        card.style.setProperty("width", "0px", "important");
                        card.style.setProperty("margin", "0px", "important");
                        card.style.setProperty("padding", "0px", "important");
                        card.remove();
                    }
                }
            }

            // 2. Also check video list items (li) containing ad network iframes or ad links
            const adListItems = document.querySelectorAll(`
                li:has(.adSpot),
                li:has(.network-ad),
                li:has(.adBlockContainer),
                li:has(iframe[src*="trafficjunky"]),
                li:has(iframe[src*="exoclick"]),
                li:has(a[href*="trafficjunky"]),
                li:has(a[href*="exoclick"]),
                li:has(a[href*="/premium"]),
                li.adListItem,
                li.commercial,
                li.grid_ad,
                li[data-segment="ad"]
            `);
            for (const item of adListItems) {
                item.style.setProperty("display", "none", "important");
                item.style.setProperty("height", "0px", "important");
                item.style.setProperty("width", "0px", "important");
                item.style.setProperty("margin", "0px", "important");
                item.style.setProperty("padding", "0px", "important");
                item.remove();
            }

            const adElements = document.querySelectorAll(UNIVERSAL_AD_SELECTORS.join(", "));
            for (const el of adElements) {
                // Safeguard essential elements like YouTube masthead
                if (el.id === "masthead-container" || el.closest("#masthead-container")) continue;

                el.style.setProperty("display", "none", "important");
                el.style.setProperty("height", "0px", "important");
                el.style.setProperty("min-height", "0px", "important");
                el.style.setProperty("max-height", "0px", "important");
                el.style.setProperty("margin", "0px", "important");
                el.style.setProperty("padding", "0px", "important");
                el.style.setProperty("border", "none", "important");

                // If parent only contains this ad element and has no readable text or media, collapse parent
                const parent = el.parentElement;
                if (parent && parent !== document.body && parent !== document.documentElement && parent.id !== "masthead-container") {
                    const pClass = (parent.className || "").toString().toLowerCase();
                    const pId = (parent.id || "").toString().toLowerCase();
                    const isAdWrapper = /ad[-_]|sponsor|banner|promo/i.test(pClass) || /ad[-_]|banner|gpt/i.test(pId);

                    if (isAdWrapper || (parent.children.length === 1 && !parent.textContent.trim())) {
                        parent.style.setProperty("display", "none", "important");
                        parent.style.setProperty("height", "0px", "important");
                        parent.style.setProperty("min-height", "0px", "important");
                        parent.style.setProperty("margin", "0px", "important");
                        parent.style.setProperty("padding", "0px", "important");
                    }
                }
            }
        } catch (e) {}
    }

    /* =========================================================
       YOUTUBE REAL-TIME VIDEO AD SKIPPER
       ========================================================= */

    function isYouTubeAdActive() {
        const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
        if (player && (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting"))) {
            return true;
        }

        const videoAds = document.querySelector(".video-ads");
        if (videoAds && videoAds.children && videoAds.children.length > 0) {
            return true;
        }

        const skipBtn = document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button, button[class*='ytp-ad-skip-button']");
        if (skipBtn && skipBtn.offsetParent !== null) {
            return true;
        }

        const adOverlay = document.querySelector(".ytp-ad-player-overlay, .ytp-ad-player-overlay-layout");
        if (adOverlay && adOverlay.offsetParent !== null) {
            return true;
        }

        return false;
    }

    function triggerClick(btn) {
        if (!btn) return;
        btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        if (typeof btn.click === "function") btn.click();
    }

    function processYouTubeAd() {
        if (!adBlockEnabled || isSiteDisabled) return;

        cleanYouTubeGaps();

        const video = document.querySelector("video.html5-main-video") || document.querySelector("video");

        if (isYouTubeAdActive()) {
            if (video) {
                if (!video.muted) {
                    video.muted = true;
                    lastMutedByUs = true;
                }
                video.playbackRate = 16.0;
                if (isFinite(video.duration) && video.duration > 0.1) {
                    video.currentTime = video.duration - 0.05;
                }
            }

            const skipButtonSelectors = [
                "button.ytp-ad-skip-button-modern",
                ".ytp-ad-skip-button-slot button",
                ".ytp-ad-skip-button",
                ".ytp-skip-ad-button",
                ".ytp-ad-skip-button-container button",
                "button[class*='ytp-ad-skip-button']",
                ".ytp-ad-overlay-close-button",
                "button.ytp-ad-overlay-close-button"
            ];

            for (const selector of skipButtonSelectors) {
                const btn = document.querySelector(selector);
                if (btn && btn.offsetParent !== null) {
                    triggerClick(btn);
                    break;
                }
            }
        } else {
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

        const antiAdblockModal = document.querySelector("ytd-enforcement-message-view-model, tp-yt-paper-dialog[aria-label*='ad blocker' i]");
        if (antiAdblockModal) {
            antiAdblockModal.remove();
            document.querySelectorAll("tp-yt-iron-overlay-backdrop").forEach(b => b.remove());
            if (video && video.paused) {
                const playBtn = document.querySelector(".ytp-play-button");
                if (playBtn) playBtn.click();
            }
        }
    }

    function startYouTubeAdSkipper() {
        if (ytLoop) clearInterval(ytLoop);
        ytLoop = setInterval(processYouTubeAd, 50);

        function hookVideoEvents() {
            const video = document.querySelector("video");
            if (video) {
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
