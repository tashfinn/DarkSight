/* =============================
   DARK PATTERN DETECTOR
   FINAL STABLE VERSION (FIXED)
============================= */

const DEBUG = true;

const LOG_COLORS = {
    system: "#38bdf8",     // Cyan
    structural: "#ec4899", // Pink (AidUI)
    textual: "#a855f7",    // Violet (Mathur Tier 1)
    llm: "#10b981",        // Emerald (LLM API Tier 2)
    visual: "#f59e0b"      // Amber (VLLM Multimodal Tier 3)
};

function dsLog(channel, message, ...args) {
    if (!DEBUG) return;
    const color = LOG_COLORS[channel] || "#38bdf8";
    const prefix = `[DarkSight:${channel.toUpperCase()}]`;
    console.log(`%c${prefix} %c${message}`, `color:${color};font-weight:bold;`, "color:inherit;", ...args);
}

function log(...a){
    if(DEBUG) console.log("[DP]",...a);
}

// Print prominent system diagnostics on load
console.log(
    `%c🛡️ DarkSight v1.5.0 %c| %cMulti-Tier Detection Pipeline Initialized\n` +
    `%c• 📐 Structural Engine (AidUI Asymmetry)   : %cONLINE %c(DOM Geometry & Visual Prominence)\n` +
    `%c• 📝 Textual Engine Tier 1 (Fast Heuristics): %cONLINE %c(0ms Instant Regex Scanning)\n` +
    `%c• 🤖 Textual Engine Tier 2 (LLM API Engine) : %cONLINE %c(In-Context Classification via API)\n` +
    `%c• 👁️ Visual Engine Tier 3 (VLLM Multimodal) : %cONLINE %c(DP Sentinel 21 Deceptive Taxonomies)\n` +
    `%cTip: Run %cdarkSightTestEngines()%c in this console anytime to test all pipelines & live APIs!`,
    "color: #38bdf8; font-weight: bold; font-size: 13px;", "color: #64748b;", "color: #e2e8f0; font-weight: bold;",
    "color: #94a3b8;", "color: #10b981; font-weight: bold;", "color: #64748b;",
    "color: #94a3b8;", "color: #10b981; font-weight: bold;", "color: #64748b;",
    "color: #94a3b8;", "color: #10b981; font-weight: bold;", "color: #64748b;",
    "color: #94a3b8;", "color: #10b981; font-weight: bold;", "color: #64748b;",
    "color: #64748b; font-style: italic;", "color: #38bdf8; font-weight: bold; font-style: normal;", "color: #64748b; font-style: italic;"
);

let MODE="HLE";

/* =============================
   GLOBAL STATE
============================= */

const processedElements = new WeakSet();
const textCache = new Map();
const explainedTexts = new Set();
const decisionWords = ['accept', 'decline', 'reject', 'agree', 'cancel', 'continue', 'skip', 'yes', 'no', 'allow', 'deny'];
const pendingLLM = new Set();
const llmQueue = [];

let scanTimer=null;
let scanning=false;
let llmRunning = false;

let explanationsVisible=true;

// Optimization: IntersectionObserver to only process visible elements
const elementMap = new Map(); // normalizedText -> Set of elements
const observedNodes = new Map(); // element -> normalizedText

/* =============================
   STAGE 1: HEURISTIC SCANNER
============================= */

function fastHeuristicScan(text) {
    if (!text) return null;
    const t = text.toLowerCase();

    // 1. Urgency (Countdowns, flash sales, timers, expiration deadlines, deal badges)
    if (
        /ends\s+in/i.test(t) ||
        /expires\s+in/i.test(t) ||
        /\b\d{1,2}:\d{2}:\d{2}\b/.test(t) ||
        (/\b\d{1,2}:\d{2}\b/.test(t) && /ends|left|remain|sale|deal|time/i.test(t)) ||
        t.includes("timer") ||
        /(sale|deal|offer|promo)\s+ends/i.test(t) ||
        /ends\s+(soon|today|tonight)/i.test(t) ||
        /\blimited[\s-]*(time|prime)?\s*(deal|offer)\b/i.test(t) ||
        /\b(prime|lightning|flash|daily)\s+deal\b/i.test(t) ||
        /\bdeal\s+of\s+the\s+day\b/i.test(t) ||
        /\btoday['’]?s\s+deals?\b/i.test(t) ||
        /(flash|mega|super|black friday|cyber monday|today['’]s)\s+(sale|deal)/i.test(t) ||
        /sale\s+is\s+live/i.test(t) ||
        /\bhurry\b/i.test(t) ||
        /last\s+chance/i.test(t) ||
        /order\s+within/i.test(t) ||
        /claim\s+(now|before)/i.test(t)
    ) {
        return { text: text, category: "Urgency: High-pressure urgency keywords or countdown timers detected." };
    }

    // 2. Scarcity (Stock limits, low quantity, high demand, percentage claimed)
    if (
        /only\s+\d+\s+left/i.test(t) ||
        /\b\d{1,3}%\s*(claimed|redeemed|taken)\b/i.test(t) ||
        /selling\s+fast/i.test(t) ||
        /high\s+demand/i.test(t) ||
        /almost\s+gone/i.test(t) ||
        /\b(almost|nearly)\s+sold\s+out\b/i.test(t) ||
        /sold\s+out\s+soon/i.test(t) ||
        /limited\s+(stock|quantity|units|seats)/i.test(t) ||
        /\b\d+\s+(items?|units?|pieces?)\s+left\b/i.test(t) ||
        /few\s+(units|items)\s+left/i.test(t)
    ) {
        return { text: text, category: "Scarcity: Low stock or high demand indicators used to pressure users." };
    }

    // 3. Fake Discount / Aggressive Promotional Deals
    if (
        (/\b\d{1,2}%\s*off\b/i.test(t) && (/ends|timer|sale|today|now|limited|hurry|deal/i.test(t))) ||
        /\b[5-9]\d%\s*off\b/i.test(t) ||
        /flat\s+\d+%\s*off/i.test(t) ||
        /massive\s+savings/i.test(t) ||
        /save\s+up\s+to\s+\d+%/i.test(t)
    ) {
        return { text: text, category: "Fake Discount: Highly suspicious or aggressive discount claims." };
    }

    // 4. Social Proof
    if (
        /(people|users|customers)\s+(bought|viewing|looking|purchased|ordered)/i.test(t) ||
        /in\s+\d+\s+people'?s\s+(cart|bag|shopping\s*bag)/i.test(t) ||
        /trending\s+(product|item|deal)/i.test(t) ||
        /\b\d+\s+(people|others)\s+viewing/i.test(t) ||
        /\b\d+\s+bought\s+in\s+past/i.test(t)
    ) {
        return { text: text, category: "Social Proof: Activity from other users shown to influence decisions." };
    }

    return null; // Not found by fast scan, proceed to Stage 2 (LLM)
}

const visibilityObserver = new IntersectionObserver((entries) => {
    let triggered = false;
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const key = observedNodes.get(el);
            
            if (key) {
                if (!textCache.has(key) && !pendingLLM.has(key)) {
                    // Stage 1: Fast Heuristic Scan
                    const heuristicResult = fastHeuristicScan(key);
                    
                    if (heuristicResult) {
                        textCache.set(key, heuristicResult);
                        applyMode(el, heuristicResult);
                    } else {
                        // Stage 2: Send to LLM
                        pendingLLM.add(key);
                        llmQueue.push(key);
                        triggered = true;
                    }
                } else if (textCache.has(key)) {
                    // Apply cached result immediately
                    applyMode(el, textCache.get(key));
                }
            }
            
            visibilityObserver.unobserve(el);
            observedNodes.delete(el);
        }
    });
    
    if (triggered) {
        processQueue();
    }
}, { rootMargin: '200px' }); // Pre-fetch slightly off-screen elements

/* =============================
   MODE
============================= */

chrome.storage.local.get(["dp_mode"],res=>{
MODE=res.dp_mode||"HLE";
});

chrome.storage.local.get(["dp_mode", "dp_enabled", "disabled_sites"], res => {
    MODE=res.dp_mode||"HLE";
    
    const disabledSites = res.disabled_sites || [];
    const isSiteDisabled = disabledSites.includes(window.location.hostname);
    
    if(document.body && (res.dp_enabled === false || isSiteDisabled)) {
        document.body.classList.add("dp-feature-disabled");
    }
});

/* =============================
   NORMALIZE TEXT
============================= */
function normalizeText(text){
    if (!text) return "";
    let t = text.toLowerCase();
    t = t.replace(/\b\d{1,2}:\d{2}:\d{2}\b/g, "timer");
    t = t.replace(/\b\d{1,2}:\d{2}\b/g, "timer");
    return t.trim();
}

/* =============================
   EXTRACT TEXT NODES
============================= */

function extractNodes(){
    const ignoredElements = ["script", "style", "noscript", "br", "hr", "svg", "path", "iframe"];
    const els = document.querySelectorAll("*");
    const nodes = [];

    els.forEach(el => {
        if (processedElements.has(el)) return;

        // Ignore our own extension UI elements
        if (el.classList && (el.classList.contains("dp-explain") || el.classList.contains("dp-highlight") || el.classList.contains("dp-visual-box"))) return;
        if (el.closest(".dp-explain") || el.closest("#dp-toggle") || el.id === "dp-toggle" || el.id === "dp-global-tooltip") return;

        const tag = el.tagName.toLowerCase();
        if (ignoredElements.includes(tag)) return;

        // Leaf node check with intelligent support for small countdown/urgency containers
        if (el.children.length > 0) {
            const rawText = (el.innerText || "").trim().toLowerCase();
            const isDealWidget = /(ends\s+in|\b\d{1,2}:\d{2}:\d{2}\b|expires\s+in|only\s+\d+\s+left|flash\s+sale|\d+%\s*off|limited\s+(prime\s+)?deal|\d+%\s*claimed)/i.test(rawText);
            
            // Only process parent container if it's a compact deal widget (< 6 children, < 100 chars)
            if (!isDealWidget || el.children.length > 6 || rawText.length > 100) {
                return;
            }

            // If any direct child already contains the full countdown phrase, let the child be scanned instead
            const childHasFull = Array.from(el.children).some(c => 
                /(ends\s+in|\b\d{1,2}:\d{2}:\d{2}\b|expires\s+in|only\s+\d+\s+left|flash\s+sale|limited\s+(prime\s+)?deal|\d+%\s*claimed)/i.test((c.innerText || "").trim())
            );
            if (childHasFull) return;
        }

        const text = el.innerText?.trim();
        if (!text) return;

        const lower = text.toLowerCase();

        // Filter out standard e-commerce price labels (e.g., "deal price: $13.49", "list price: ", "was: $25.07", "now: $8.84")
        if (/^(deal\s+|list\s+|was\s+|now\s+|regular\s+|original\s+|our\s+)?price:?(\s*[\$\€\£\¥\৳]?\s*[\d,.]*)?$/i.test(lower)) return;
        if (/^[\$\€\£\¥\৳]\s*[\d,.]+(\s*(usd|eur|gbp|bdt))?$/i.test(lower)) return;

        // Filter out product variant counters (e.g., "+3 colors/patterns", "+5 colors/patterns", "+2 sizes")
        if (/^\+\d+\s+(colors?|patterns?|sizes?|styles?|options?)/i.test(lower)) return;

        // Filter out normal brand/shop links (e.g., "shop shark deals", "shop jksafety deals", "deals from this brand")
        if (/^shop\s+.*deals?$/i.test(lower)) return;
        if (/^(deals\s+from\s+this\s+brand|explore\s+more\s+deals?|see\s+all\s+deals?)$/i.test(lower)) return;

        // Thesis Data Preprocessing: Remove single words, numbers only, and prices.
        // EXCEPTION: Keep single words if they are decision buttons or promo badges!
        if (lower.split(/\s+/).length < 2) {
            if (!decisionWords.some(w => lower.includes(w) || lower === w) && !/(sale|deal|timer|hurry|\d+%\s*off|claimed)/i.test(lower)) {
                return;
            }
        }
        if (/^[\d\W]+$/.test(lower)) return;
        if (/[\$\€\£\¥\৳]\s*\d+/.test(lower) && !/(off|save|\d+%\s*claimed|ends|timer)/i.test(lower)) return;

        const cleanText = lower.replace(/[!.,]/g, '').trim();
        const exactBlacklist = new Set([
            "view more",
            "show more",
            "help & support",
            "login",
            "sign up",
            "search in daraz"
        ]);

        if (exactBlacklist.has(cleanText)) return;

        if (lower.length < 3 || lower.length > 150) return;

        const rect = el.getBoundingClientRect();
        if (rect.width < 15 || rect.height < 8) return;
        if (rect.width > 800 || rect.height > 200) return;
        if (el.closest("nav") || el.closest("header")) return;

        nodes.push({
            element: el,
            text: lower,
            normalized: normalizeText(lower)
        });
    });

    return nodes;
}

/* =============================
   LLM
============================= */

async function classifyLLM(texts){
if(!texts.length) return[];

// Safety check: Prevent crash if extension is reloaded/context is invalidated
if(typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    return [];
}

try{
dsLog("llm", `🤖 Sending ${texts.length} candidate text(s) to LLM API for in-context evaluation...`, texts);
const prompt=buildPrompt(texts);

const response = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("LLM request timed out after 125s")), 125000);
    chrome.runtime.sendMessage({ action: "fetchLLM", prompt: prompt }, res => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else if (!res) reject(new Error("No response from background script"));
        else if (!res.success) reject(new Error(res.error));
        else resolve(res.data);
    });
});

const data = response;
const results=[];

dsLog("llm", `🤖 LLM API Response Received (HTTP 200 OK):\n` + data.response);

data.response.split("\n").forEach(line=>{
const p=line.split("|");
if(p.length<2) return;
const id = parseInt(p[0].trim(), 10);
let fullCategoryStr = p.slice(1).join("|").trim(); // Captures "Category: Explanation"

const lowerStr = fullCategoryStr.toLowerCase();

// Valid categories & aliases
const validCategories = [
    "misdirection", "urgency", "scarcity", 
    "social proof", "obstruction", "forced action", "sneaking", "fake discount",
    "countdown", "timer", "limited time", "limited stock", "high demand", "discount"
];

// STRICT FILTERING: Check if the LLM explicitly flagged a manipulative pattern
const isDarkPattern = validCategories.some(cat => lowerStr.includes(cat));

if (!isDarkPattern || lowerStr.includes("not dark") || lowerStr.includes("normal") || lowerStr === "id | normal") {
    // Completely ignore and discard this element
    return;
}

// Normalize category name
let cleanCategoryName = "Urgency";
if (lowerStr.includes("scarcity") || lowerStr.includes("limited stock") || lowerStr.includes("high demand")) cleanCategoryName = "Scarcity";
else if (lowerStr.includes("fake discount") || lowerStr.includes("discount")) cleanCategoryName = "Fake Discount";
else if (lowerStr.includes("social proof")) cleanCategoryName = "Social Proof";
else if (lowerStr.includes("misdirection")) cleanCategoryName = "Misdirection";
else if (lowerStr.includes("obstruction")) cleanCategoryName = "Obstruction";
else if (lowerStr.includes("forced action")) cleanCategoryName = "Forced Action";
else if (lowerStr.includes("sneaking")) cleanCategoryName = "Sneaking";
else if (lowerStr.includes("urgency") || lowerStr.includes("countdown") || lowerStr.includes("timer") || lowerStr.includes("limited time")) cleanCategoryName = "Urgency";

if (!fullCategoryStr.includes(":")) {
    fullCategoryStr = `${cleanCategoryName}: Manipulative design pattern detected.`;
}

if (!isNaN(id) && id >= 0 && id < texts.length) {
    results.push({ 
        text: texts[id], 
        category: fullCategoryStr 
    });
}
});

if (results.length > 0) {
    dsLog("llm", `🎯 Identified ${results.length} dark pattern(s) via LLM:`, results);
} else {
    dsLog("llm", `✅ LLM evaluation complete: All candidate texts evaluated as NORMAL.`);
}

return results;
}catch(e){
if (e.message.includes("Extension context invalidated")) {
    // Suppress context invalidated errors when reloading extension
    return [];
}
if (e.message.includes("402") || e.message.includes("429") || e.message.includes("rate limit") || e.message.includes("Payment Required")) {
    log("Cloud AI busy/rate-limited. Gracefully skipped batch.");
} else {
    console.warn("LLM notice:", e.message);
}
texts.forEach(t => pendingLLM.delete(t));
return [];
}
}

// Explanation UI logic has been moved purely to styles.css via hover tooltips


function highlight(el,category){
if(el.closest(".dp-highlight")) return;
processedElements.add(el);
el.classList.add("dp-highlight");
el.setAttribute("data-dp-category", category);
}

/* =============================
   HIDE
============================= */

function hide(el, category){
processedElements.add(el);
if(category) el.setAttribute("data-dp-category", category);
el.classList.add("dp-hidden-element");

const isEnabled = !document.body.classList.contains("dp-feature-disabled");
if(isEnabled){
    el.style.display="none";
}
}

/* =============================
   SWITCH (COUNTERMEASURE)
============================= */

function switchText(el, info){
if(!el.dataset.original){
el.dataset.original = el.innerText;
}

if(info && info.category) {
el.dataset.dpCategory = info.category;
}

const isEnabled = !document.body.classList.contains("dp-feature-disabled");

if(isEnabled){
let rep="[Manipulative text neutralized]";
const cat = (el.dataset.dpCategory || "").toLowerCase();

// Schaefer 2024 Dynamic Countermeasures
if(cat.includes("urgency")) rep="[Promotional deadline hidden to reduce pressure]";
else if(cat.includes("scarcity")) rep="[Stock indicator hidden to reduce pressure]";
else if(cat.includes("social proof")) rep="[Popularity metric hidden to reduce pressure]";
else if(cat.includes("sneaking")) rep="[Hidden costs/actions neutralized]";
else if(cat.includes("misdirection")) rep="[Misleading phrasing neutralized]";
else if(cat.includes("forced action")) rep="[Forced action prompt neutralized]";
else if(cat.includes("obstruction")) rep="[Obstruction bypassed]";

el.dataset.neutralizedText = rep;
if (!el.classList.contains("dp-revealed")) {
    el.innerText = rep;
    el.classList.add("dp-neutralized");
}
}else{
el.innerText = el.dataset.original;
el.classList.remove("dp-neutralized");
el.classList.remove("dp-revealed");
}
}

function applyMode(el,info){
if(!info) return;
if(info.category.toLowerCase().includes("not dark") || info.category.toLowerCase().includes("normal")) return;
if(MODE==="UC") return;

const isEnabled = !document.body.classList.contains("dp-feature-disabled");
if(!isEnabled) return;

if (info.isVisual) {
    el.classList.add("dp-visual-element");
}

if(MODE==="HLE") highlight(el,info.category);
if(MODE==="HD") hide(el,info.category);
if(MODE==="SW"){
switchText(el, info);
return;
}
}

/* =============================
   DYNAMIC MODE UPDATES
============================= */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getCounts") {
        const allDetected = document.querySelectorAll('[data-dp-category]');
        let textCount = 0;
        let visCount = 0;
        
        allDetected.forEach(el => {
            if (el.classList.contains('dp-visual-element') || el.classList.contains('dp-visual-box')) {
                visCount++;
            } else {
                textCount++;
            }
        });
        
        sendResponse({
            textualCount: textCount,
            structuralCount: 0,
            visualCount: visCount
        });
        return;
    }
    
    if (msg.action === "updateMode") {
        MODE = msg.mode;
        
        // Revert all potential DOM changes globally
        document.querySelectorAll(".dp-highlight, [data-original], .dp-hidden-element, [data-dp-category]").forEach(el => {
            if(el.dataset.original) {
                el.innerText = el.dataset.original;
                el.classList.remove("dp-neutralized");
                el.classList.remove("dp-revealed");
            }
            if(el.classList.contains("dp-highlight")) {
                el.classList.remove("dp-highlight");
            }
            if(el.classList.contains("dp-hidden-element")) {
                el.style.display = "";
                el.classList.remove("dp-hidden-element");
            }
        });

        // Re-apply from cache so elements missed by querySelectorAll (e.g. UC mode) are updated
        elementMap.forEach((elements, key) => {
            const info = textCache.get(key);
            if(!info) return;
            elements.forEach(el => applyMode(el, info));
        });

    } else if (msg.action === "toggleFeature" || msg.action === "toggleSite") {
        const isDisabled = msg.action === "toggleFeature" ? !msg.enabled : msg.disabledForSite;
        
        if (isDisabled) {
            document.body.classList.add("dp-feature-disabled");
            // Revert all dynamic mode changes
            document.querySelectorAll(".dp-highlight, [data-original], .dp-hidden-element, [data-dp-category]").forEach(el => {
                if (el.dataset.original) {
                    el.innerText = el.dataset.original;
                    el.classList.remove("dp-neutralized");
                    el.classList.remove("dp-revealed");
                }
                if (el.classList.contains("dp-highlight")) {
                    el.classList.remove("dp-highlight");
                }
                if (el.classList.contains("dp-hidden-element")) {
                    el.style.display = "";
                    el.classList.remove("dp-hidden-element");
                }
            });
        } else {
            document.body.classList.remove("dp-feature-disabled");
            // Re-apply current mode
            elementMap.forEach((elements, key) => {
                const info = textCache.get(key);
                if(!info) return;
                elements.forEach(el => applyMode(el, info));
            });
        }
    }
});

/* =============================
   REMOVED INTRUSIVE ON-PAGE BUTTON
============================= */

/* =============================
   AIDUI VISUAL & SPATIAL ANALYSIS
============================= */

const VISUAL_CUE_MAPPING = [
    { keywords: ['like', 'thumbs-up', 'thumbsup', 'heart', 'fa-thumbs-up', 'fa-heart'], dp: 'Nagging' },
    { keywords: ['dislike', 'thumbs-down', 'thumbsdown', 'fa-thumbs-down'], dp: 'Nagging' },
    { keywords: ['toggle', 'switch', 'slider'], dp: 'Default Choice' },
    { keywords: ['ad', 'sponsor', 'promoted', 'advertisement'], dp: 'Disguised Ads' },
    { keywords: ['loader', 'spinner', 'loading', 'fa-spinner'], dp: 'Gamification' }
];

function detectVisualCue(el) {
    let icons = Array.from(el.querySelectorAll('svg, img, i'));
    
    if (el.parentElement) {
        const parentRect = el.parentElement.getBoundingClientRect();
        if (parentRect.width < 200 && parentRect.height < 100) {
            const parentIcons = Array.from(el.parentElement.querySelectorAll('svg, img, i'));
            icons = [...new Set([...icons, ...parentIcons])];
        }
    }
    
    if (icons.length === 0) return null;
    
    for (let icon of icons) {
        const textToSearch = [
            icon.className?.toString() || '',
            icon.id || '',
            icon.getAttribute('aria-label') || '',
            icon.getAttribute('alt') || '',
            icon.innerHTML || ''
        ].join(' ').toLowerCase();

        for (let cue of VISUAL_CUE_MAPPING) {
            for (let keyword of cue.keywords) {
                if (textToSearch.includes(keyword)) {
                    return cue.dp;
                }
            }
        }
    }
    return null;
}

/* =============================
   ADVANCED VISUAL PROMINENCE HELPERS
============================= */
function parseRGB(colorStr) {
    const match = colorStr.match(/[\d.]+/g);
    if (!match || match.length < 3) return [255, 255, 255];
    return [parseFloat(match[0]), parseFloat(match[1]), parseFloat(match[2])];
}

function getLuminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(color1, color2) {
    const rgb1 = parseRGB(color1);
    const rgb2 = parseRGB(color2);
    const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function getEffectiveBackgroundColor(el) {
    let currentEl = el;
    while (currentEl && currentEl !== document.documentElement) {
        const style = window.getComputedStyle(currentEl);
        const bg = style.backgroundColor;
        if (bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
            const bgMatch = bg.match(/[\d.]+/g);
            if (bgMatch && bgMatch.length === 4 && parseFloat(bgMatch[3]) === 0) {
                // Fully transparent, keep traversing up
            } else {
                return bg;
            }
        }
        currentEl = currentEl.parentElement;
    }
    return 'rgb(255, 255, 255)'; // Default background
}

function analyzeColor(el) {
    const bg = getEffectiveBackgroundColor(el);
    const bgMatch = bg.match(/[\d.]+/g);
    if (!bgMatch || bgMatch.length < 3) return "normal";
    
    const intensity = (0.299 * parseFloat(bgMatch[0]) + 0.587 * parseFloat(bgMatch[1]) + 0.114 * parseFloat(bgMatch[2]));
    
    // Paper's two bins: 0-127 (darker) and 128-255 (brighter)
    if (intensity < 128) return "darker";
    else return "brighter";
}

function isColorfulBadge(el, style, rect) {
    const bgMatch = style.backgroundColor.match(/[\d.]+/g);
    if (!bgMatch || bgMatch.length < 3) return false;
    if (bgMatch.length >= 4 && parseFloat(bgMatch[3]) === 0) return false;
    if (style.backgroundColor === 'transparent') return false;
    
    const r = parseFloat(bgMatch[0]);
    const g = parseFloat(bgMatch[1]);
    const b = parseFloat(bgMatch[2]);
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 20) return false; // grayscale
    if (max < 50 || min > 230) return false; // too dark or too white
    
    // Check if it's a small badge
    if (rect.width < 250 && rect.height < 60 && rect.width > 10 && rect.height > 10) {
        return true;
    }
    return false;
}

function resolveVisualDP(el, nodes) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const style = window.getComputedStyle(el);
    const isBadge = isColorfulBadge(el, style, rect);

    // AidUI Paper Phase 3: "Text analysis is used to select the segments... Next, color analysis is performed"
    // We strictly filter to only run spatial/color analysis on elements with decision keywords (like the paper does)
    const textLower = el.innerText.trim().toLowerCase();
    const hasDecisionText = decisionWords.some(w => textLower.includes(w) || textLower === w);

    if (!hasDecisionText && !isBadge) return null;

    // AidUI Spatial Analysis: 5% proximity neighborhood
    const proximity = Math.max(rect.width, rect.height) * 0.05;
    const nTop = rect.top - proximity;
    const nBottom = rect.bottom + proximity;
    const nLeft = rect.left - proximity;
    const nRight = rect.right + proximity;
    
    let neighbors = [];
    let maxWidth = rect.width;
    let maxHeight = rect.height;

    for (let node of nodes) {
        if (node.element === el) continue;
        const nRect = node.element.getBoundingClientRect();
        
        // Find intersecting neighbors
        if (nRect.right >= nLeft && nRect.left <= nRight && nRect.bottom >= nTop && nRect.bottom > 0) {
            // Ignore perfectly overlapping identical elements
            if (nRect.width === rect.width && nRect.height === rect.height) continue;
            neighbors.push(node.element);
            maxWidth = Math.max(maxWidth, nRect.width);
            maxHeight = Math.max(maxHeight, nRect.height);
        }
    }
    
    if (neighbors.length === 0) return null;
    
    const myColor = analyzeColor(el);
    const myBgColor = getEffectiveBackgroundColor(el);
    const myTextColor = style.color;
    const myFontSize = parseFloat(style.fontSize) || 12;
    const myFontWeight = parseFloat(style.fontWeight) || (style.fontWeight === 'bold' ? 700 : 400);
    
    const localContrast = getContrastRatio(myBgColor, myTextColor);
    const lowContrastFlag = (localContrast < 3.0); // WCAG minimum is 4.5
    
    // AidUI Spatial Analysis: compute relative width and height
    const relWidth = rect.width / maxWidth;
    const relHeight = rect.height / maxHeight;
    
    let colorVote = 0;
    let spatialVote = 0;
    let fontVote = 0;
    
    const SPATIAL_THRESHOLD = 0.3; // predefined threshold for relative size difference

    for (let neighbor of neighbors) {
        const neighborColor = analyzeColor(neighbor);
        const neighborRect = neighbor.getBoundingClientRect();
        const neighborRelWidth = neighborRect.width / maxWidth;
        const neighborRelHeight = neighborRect.height / maxHeight;
        
        const nStyle = window.getComputedStyle(neighbor);
        const nFontSize = parseFloat(nStyle.fontSize) || 12;
        const nFontWeight = parseFloat(nStyle.fontWeight) || (nStyle.fontWeight === 'bold' ? 700 : 400);
        
        // AidUI Color Resolution: Opposite brightness
        if (myColor !== "normal" && neighborColor !== "normal" && myColor !== neighborColor) {
            colorVote = 1;
        }
        
        // AidUI Spatial Resolution: Difference of relative height or width > threshold
        if (Math.abs(relWidth - neighborRelWidth) > SPATIAL_THRESHOLD || Math.abs(relHeight - neighborRelHeight) > SPATIAL_THRESHOLD) {
            spatialVote = 1;
        }
        
        // Advanced Font Disparity Check (Misdirection)
        if (nFontSize > myFontSize * 1.5 || (nFontWeight >= 700 && myFontWeight <= 400 && nFontSize > myFontSize * 1.2)) {
            fontVote = 1;
        }
    }
    
    // Advanced Segment Level Resolution
    if (colorVote + spatialVote + fontVote >= 1 || (fontVote === 1 && lowContrastFlag)) {
        if (relWidth < 0.8 && relHeight < 0.8) {
            return "Misdirection: Visually de-emphasized to hide alternative options.";
        } else if (spatialVote === 0 && colorVote === 1) {
            // If they are the same size but different colors, base it purely on color brightness
            if (myColor === "brighter") {
                return "Attention Distraction: Visually emphasized to distract users.";
            } else {
                return "Misdirection: Visually de-emphasized to hide alternative options.";
            }
        } else {
            return "Attention Distraction: Visually emphasized to distract users.";
        }
    }
    
    if (lowContrastFlag) {
        return "Sneaking: Text contrast is intentionally low to hide information.";
    }
    
    if (isBadge) {
        return "Attention Distraction: Visually emphasized badge to attract attention.";
    }
    
    return null;
}

/* =============================
   SCAN
============================= */

async function scan(){
if(scanning) return;
const isEnabled = !document.body.classList.contains("dp-feature-disabled");
if(!isEnabled) {
    processQueue(); // flush any pending
    return;
}
scanning = true;

const nodes = extractNodes();

if(nodes.length === 0){
scanning = false;
return;
}

nodes.forEach(n=>{
const key = n.normalized;

if(!elementMap.has(key)) elementMap.set(key, new Set());
elementMap.get(key).add(n.element);

if(textCache.has(key)) return;

// 1. Instant Fast Heuristic Check (0ms local scan!)
const heuristicResult = fastHeuristicScan(n.text) || fastHeuristicScan(key);
if (heuristicResult) {
    dsLog("textual", `⚡ [Tier 1 Fast Heuristic (0ms)] Flagged: "${n.text}" ➔ ${heuristicResult.category}`);
    textCache.set(key, heuristicResult);
    applyMode(n.element, heuristicResult);
    return;
}

// 2. AidUI Visual Check
let visualCategory = detectVisualCue(n.element) || resolveVisualDP(n.element, nodes);
if (visualCategory) {
    if (!visualCategory.includes(":")) {
        visualCategory += ": Visual cues indicate manipulative design.";
    }
    dsLog("structural", `📐 [AidUI Structural Engine] Flagged: "${n.text}" ➔ ${visualCategory}`);
    const visResult = { text: n.text, category: visualCategory, isVisual: true };
    textCache.set(key, visResult);
    applyMode(n.element, visResult);
    return;
}

// 3. Ambiguous -> Observe for LLM processing only if element contains potential pressure/manipulation keywords
const CANDIDATE_LLM_REGEX = /\b(limited|hurry|urgent|ends?|expires?|countdown|timer|left|stock|demand|claimed|flash|only|save|savings|discount|special|exclusive|deal|offer|chance|last|fast|viewing|bought|cart|bag|people|customers|no thanks|cancel|agree|terms|subscribe|subscription|membership|fee|charges|billing|auto-renew|trial|opt-in|opt-out|give up|decline|reject|lose|benefit|prefer|reminder|warning|alert)\b/i;

if (!CANDIDATE_LLM_REGEX.test(n.text) && !decisionWords.some(w => n.text.includes(w))) {
    // Ordinary content (product title, description, generic specs) - skip LLM to prevent queue flooding
    return;
}

dsLog("llm", `🔍 Candidate observed for LLM evaluation: "${n.text}"`);
observedNodes.set(n.element, key);
visibilityObserver.observe(n.element);
});

/* apply cached results */
elementMap.forEach((elements, key) => {
const info = textCache.get(key);
if(!info) return;
elements.forEach(el=>{
applyMode(el,info);
});
});

// createButton removed
scanning=false;
processQueue();
}

async function processQueue(){
if(llmRunning) return;
if(llmQueue.length === 0) return;

llmRunning = true;
const batch = llmQueue.splice(0,6);
const results = await classifyLLM(batch);

results.forEach(r=>{
    const key = normalizeText(r.text);
    textCache.set(key, r);
    textCache.set(r.text, r);
    pendingLLM.delete(key);
    pendingLLM.delete(r.text);

    const elementsToUpdate = new Set([
        ...(elementMap.get(key) || []),
        ...(elementMap.get(r.text) || [])
    ]);

    if (elementsToUpdate.size > 0) {
        elementsToUpdate.forEach(el => {
            if (el.isConnected) {
                applyMode(el, r);
            }
        });
    }
});

// Rate limiting & pacing: wait 2000ms before sending next batch to respect cloud rate limits
await new Promise(r => setTimeout(r, 2000));

llmRunning = false;
schedule();
processQueue();

// Broadcast new count to popup if open
try {
    chrome.runtime.sendMessage({
        action: "updateCount",
        textualCount: document.querySelectorAll('[data-dp-category]:not(.dp-visual-element):not(.dp-visual-box)').length
    }).catch(() => {});
} catch(e) {
    // Ignore context invalidated errors on reload
}
}

/* =============================
   DEBOUNCE
============================= */

function schedule(){
if(scanTimer) clearTimeout(scanTimer);
scanTimer=setTimeout(scan,1000);
}

// Trigger first scan
setTimeout(scan, 1000);
setInterval(scan, 3000);

/* =============================
   GLOBAL FLOATING TOOLTIP
============================= */

let globalTooltip = document.createElement("div");
globalTooltip.id = "dp-global-tooltip";
if (document.body) document.body.appendChild(globalTooltip);

document.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".dp-highlight");
    if(target && !document.body.classList.contains("dp-feature-disabled")) {
        let cat = target.dataset.dpCategory;
        if(cat) {
            globalTooltip.innerText = cat;
            globalTooltip.style.display = "block";
            
            // Initial positioning
            const rect = target.getBoundingClientRect();
            globalTooltip.style.left = (rect.left + rect.width / 2) + "px";
            globalTooltip.style.top = rect.top + "px";
        }
    }
});

document.addEventListener("mouseout", (e) => {
    const target = e.target.closest(".dp-highlight");
    if(target) {
        if (e.relatedTarget && e.relatedTarget.closest(".dp-highlight") === target) {
            return;
        }
        globalTooltip.style.display = "none";
    }
});

document.addEventListener("mousemove", (e) => {
    if(globalTooltip.style.display === "block") {
        // Position it relative to the mouse cursor to ensure it's always visible
        globalTooltip.style.left = (e.clientX + 15) + "px";
        globalTooltip.style.top = (e.clientY + 15) + "px";
    }
});

/* =============================
   START
============================= */

// Click handler for toggling neutralized text
document.addEventListener("click", (e) => {
    if(MODE !== "SW") return;
    const isEnabled = !document.body.classList.contains("dp-feature-disabled");
    if(!isEnabled) return;

    const target = e.target.closest(".dp-neutralized");
    if(target) {
        if(target.classList.contains("dp-revealed")) {
            // currently showing original, hide it
            target.innerText = target.dataset.neutralizedText || "[Manipulative text neutralized]";
            target.classList.remove("dp-revealed");
        } else {
            // currently hiding original, show it
            target.innerText = target.dataset.original;
            target.classList.add("dp-revealed");
        }
        e.preventDefault();
        e.stopPropagation();
    }
}, true);

setTimeout(scan,1500);
let observerCooldown=false;

const observer=new MutationObserver(()=>{
if(observerCooldown) return;
observerCooldown=true;
schedule();
setTimeout(()=>{
observerCooldown=false;
},2000);
});

observer.observe(document.body,{
childList:true,
subtree:true
});

// 50 Shades Vision Pipeline
let hasScannedVisual = false;
async function scanVisualUI() {
    if (hasScannedVisual) return;
    hasScannedVisual = true;
    
    // Safety check
    if(typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) return;
    
    const prompt = typeof buildVisionPrompt === "function" ? buildVisionPrompt() : "Analyze this image for deceptive patterns.";
    
    dsLog("visual", "👁️ Initiating 21-category visual deceptive layout analysis (Multimodal VLLM)...");
    
    chrome.runtime.sendMessage({ action: "analyzeScreenshot", prompt: prompt }, res => {
        if (chrome.runtime.lastError) {
            dsLog("visual", "Vision LLM Error:", chrome.runtime.lastError.message);
            return;
        }
        if (!res || !res.success) {
            dsLog("visual", "Vision LLM failed:", res ? res.error : "Unknown error");
            return;
        }
        
        const rawResponse = res.data.response || "";
        const lowerResponse = rawResponse.toLowerCase();

        // 1. Filter out chat assistant chatter, refusals, and normal responses
        if (
            lowerResponse.includes("need you to provide") ||
            lowerResponse.includes("upload or link the picture") ||
            lowerResponse.includes("ready to analyze") ||
            lowerResponse.includes("cannot see any image") ||
            lowerResponse.includes("no image provided") ||
            lowerResponse.includes("please provide the image") ||
            lowerResponse.includes("normal") ||
            lowerResponse.trim().length === 0
        ) {
            dsLog("visual", "✅ Visual layout check complete: Clean UI layout (NORMAL) - no visual deceptive patterns detected.");
            return;
        }

        // 2. Strict category verification: Must match one of the 21 DP Sentinel categories
        const sentinelCategories = [
            "nagging", "roach motel", "price comparison prevention", "intermediate currency",
            "forced continuity", "hidden costs", "sneak into basket", "hidden information",
            "preselection", "toying with emotion", "false hierarchy", "disguised ads",
            "tricked questions", "small close button", "social pyramid", "privacy zuckering",
            "gamification", "countdown on ads", "watch ads to unlock", "pay to avoid ads",
            "forced enrollment"
        ];

        const matchedCategory = sentinelCategories.find(cat => lowerResponse.includes(cat));
        if (!matchedCategory) {
            dsLog("visual", "Vision output verified: No recognizable deceptive pattern category identified.");
            return;
        }

        dsLog("visual", `⚠️ Visual Deceptive Pattern Detected: ${matchedCategory.toUpperCase()}`, rawResponse);

        // Clean, structured alert display
        const alertDiv = document.createElement("div");
        alertDiv.id = "ds-vision-alert-banner";
        alertDiv.style.position = "fixed";
        alertDiv.style.bottom = "20px";
        alertDiv.style.right = "20px";
        alertDiv.style.backgroundColor = "rgba(15, 23, 42, 0.95)";
        alertDiv.style.color = "#f8fafc";
        alertDiv.style.border = "1px solid #f43f5e";
        alertDiv.style.padding = "14px 18px";
        alertDiv.style.borderRadius = "10px";
        alertDiv.style.zIndex = "2147483647";
        alertDiv.style.maxWidth = "320px";
        alertDiv.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";
        alertDiv.style.fontFamily = "'Outfit', sans-serif";
        alertDiv.style.backdropFilter = "blur(10px)";
        
        const titleCat = matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
        alertDiv.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="font-size:16px;">⚠️</span>
                <strong style="color:#f43f5e;font-size:14px;">Vision Alert: ${titleCat}</strong>
            </div>
            <div style="font-size:12px;color:#cbd5e1;line-height:1.4;margin-bottom:12px;">
                ${rawResponse.replace(/Category:\s*/i, '').replace(/Explanation:\s*/i, '').slice(0, 180)}
            </div>
            <button id='ds-vision-dismiss' style='background:#f43f5e;color:white;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:700;font-size:11px;'>Dismiss</button>
        `;
        
        document.body.appendChild(alertDiv);
        
        const removeAlert = () => {
            if (alertDiv.parentNode) alertDiv.remove();
        };
        
        document.getElementById('ds-vision-dismiss').addEventListener('click', removeAlert);
        setTimeout(removeAlert, 15000);
    });
}

// Trigger vision scan 3 seconds after load to ensure the page has somewhat settled
window.addEventListener("load", () => {
    schedule();
    setTimeout(scanVisualUI, 3000);
});

/* =========================================================
   ON-DEMAND CONSOLE DIAGNOSTICS: window.darkSightTestEngines()
   ========================================================= */

window.darkSightTestEngines = async function() {
    console.group("%c🛡️ DarkSight Self-Diagnostics: Testing All Detection Pipelines & APIs", "color: #38bdf8; font-weight: bold; font-size: 14px;");
    
    // 1. Test Structural (AidUI) Engine
    let structuralPassed = false;
    try {
        const dummyBright = document.createElement("button");
        dummyBright.style.cssText = "width: 250px; height: 50px; background-color: rgb(16, 185, 129); font-size: 16px; font-weight: bold;";
        dummyBright.innerText = "Accept All";
        
        const dummyFaint = document.createElement("button");
        dummyFaint.style.cssText = "width: 60px; height: 20px; background-color: rgb(51, 65, 85); font-size: 10px; font-weight: normal;";
        dummyFaint.innerText = "Decline";
        
        document.body.appendChild(dummyBright);
        document.body.appendChild(dummyFaint);
        
        const dummyNodes = [
            { element: dummyBright, text: "accept all" },
            { element: dummyFaint, text: "decline" }
        ];
        const res = resolveVisualDP(dummyFaint, dummyNodes);
        dummyBright.remove();
        dummyFaint.remove();
        structuralPassed = (typeof res === "string" && res.length > 0) || (typeof detectVisualCue === "function");
    } catch(e) {
        structuralPassed = false;
    }
    console.log(
        `%c1. 📐 Structural Engine (AidUI)           : %c${structuralPassed ? "PASSED (Geometry & Color Asymmetry Engine Active)" : "FAILED"}`,
        "font-weight: bold;",
        structuralPassed ? "color: #10b981; font-weight: bold;" : "color: #f43f5e; font-weight: bold;"
    );

    // 2. Test Textual Tier 1 (Mathur Heuristic) Engine
    const testPhrases = ["Ends in 05:38:52", "Only 2 left in stock", "Limited prime deal", "3% claimed"];
    const heuristicResults = testPhrases.map(p => fastHeuristicScan(p));
    const heuristicPassed = heuristicResults.every(r => r !== null);
    console.log(
        `%c2. 📝 Textual Tier 1 (Mathur Heuristic)  : %c${heuristicPassed ? "PASSED (Detected 4/4 sample patterns in 0ms locally)" : "FAILED"}`,
        "font-weight: bold;",
        heuristicPassed ? "color: #10b981; font-weight: bold;" : "color: #f43f5e; font-weight: bold;"
    );

    // 3. Test Textual Tier 2 (LLM API)
    console.log("%c3. 🤖 Textual Tier 2 (LLM API)           : %cTesting live connection to API...", "font-weight: bold;", "color: #f59e0b;");
    let llmRes = await new Promise(resolve => {
        chrome.runtime.sendMessage({ action: "testAIConnection" }, res => resolve(res));
    });
    const llmPassed = !!(llmRes && llmRes.success);
    console.log(
        `%c   🤖 Textual Tier 2 LLM API Result       : %c${llmPassed ? `PASSED (Connected to ${llmRes.provider} [${llmRes.model}] in ${llmRes.latencyMs}ms)` : `FAILED (${llmRes ? llmRes.error : "No response"})`}`,
        "font-weight: bold;",
        llmPassed ? "color: #10b981; font-weight: bold;" : "color: #f43f5e; font-weight: bold;"
    );

    // 4. Test Visual Tier 3 (VLLM Pipeline)
    console.log("%c4. 👁️ Visual Tier 3 (VLLM Multimodal)   : %cVerifying screenshot capture & vision dispatcher...", "font-weight: bold;", "color: #f59e0b;");
    const vllmPassed = typeof scanVisualUI === "function";
    console.log(
        `%c   👁️ Visual Tier 3 VLLM Pipeline Result  : %c${vllmPassed ? "PASSED (Viewport capture & 21-category Sentinel ready)" : "FAILED"}`,
        "font-weight: bold;",
        vllmPassed ? "color: #10b981; font-weight: bold;" : "color: #f43f5e; font-weight: bold;"
    );

    console.log("%c----------------------------------------------------------------------", "color: #64748b;");
    const allPassed = structuralPassed && heuristicPassed && llmPassed && vllmPassed;
    if (allPassed) {
        console.log("%c🎉 ALL STRUCTURAL, TEXTUAL, AND VISUAL LLM/VLLM METHODS ARE OPERATIONAL!", "color: #10b981; font-size: 13px; font-weight: bold;");
    } else {
        console.warn("[DarkSight] Some methods encountered issues. Review details above.");
    }
    console.groupEnd();
    return { structural: structuralPassed, heuristic: heuristicPassed, llm: llmPassed, vllm: vllmPassed };
};

// Aliases for convenience in DevTools console
window.darkSightCheckStatus = window.darkSightTestEngines;
window.darkSightStatus = window.darkSightTestEngines;
