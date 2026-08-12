const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const htmlPath = path.join(__dirname, 'countermeasures_diagram.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        background: #0b0f19;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        min-height: 100vh;
    }

    .slide-header {
        text-align: center;
        margin-bottom: 28px;
    }

    .slide-title {
        font-size: 44px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #ffffff;
        text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }

    .slide-subtitle {
        font-size: 18px;
        color: #94a3b8;
        font-weight: 500;
        margin-top: 6px;
    }

    /* Diagram Container */
    .diagram-container {
        width: 1680px;
        height: 840px;
        border: 2.5px solid #000000;
        background: #ffffff;
        display: flex;
        position: relative;
        border-radius: 6px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    /* Left Stage Swimlane */
    .left-stages {
        width: 270px;
        border-right: 2.5px solid #000000;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 24px 20px;
        background: #ffffff;
    }

    .stage-card {
        border: 2px solid #000000;
        border-radius: 10px;
        padding: 20px 16px;
        text-align: center;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 130px;
        gap: 6px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .stage-num {
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #059669;
        margin-bottom: 2px;
    }

    .stage-title {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.25;
    }

    .stage-sub {
        font-size: 13.5px;
        font-weight: 600;
        color: #64748b;
    }

    /* Main Branching Canvas */
    .main-canvas {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30px 60px;
        position: relative;
    }

    /* Columns */
    .col-input, .col-output {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 230px;
        position: relative;
        z-index: 3;
    }

    .col-pillars {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        width: 500px;
        padding: 16px 0;
        position: relative;
        z-index: 3;
    }

    /* Pillar Card */
    .pillar-card {
        border: 2.5px solid #000000;
        border-radius: 18px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 20px;
        background: #ffffff;
        box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        height: 185px;
    }

    .pillar-card.pillar-highlight {
        background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
        border-color: #f43f5e;
    }
    .pillar-card.pillar-hide {
        background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
        border-color: #8b5cf6;
    }
    .pillar-card.pillar-switch {
        background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
        border-color: #10b981;
    }

    .pillar-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .pillar-badge {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 3px 8px;
        border-radius: 6px;
        width: fit-content;
    }
    .badge-highlight { background: #ffe4e6; color: #e11d48; }
    .badge-hide { background: #ede9fe; color: #7c3aed; }
    .badge-switch { background: #d1fae5; color: #047857; }

    .pillar-title {
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 2px;
    }

    .pillar-tagline {
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
        margin-bottom: 2px;
    }

    .pillar-desc {
        font-size: 13px;
        font-weight: 500;
        color: #334155;
        line-height: 1.35;
    }

    /* Node Item (Single Column) */
    .node-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        z-index: 3;
    }

    .node-label {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 12px;
        line-height: 1.2;
    }

    .node-sublabel {
        font-size: 13.5px;
        font-weight: 500;
        color: #64748b;
        margin-top: 4px;
    }

    /* Icon Box Badges */
    .icon-box {
        width: 90px;
        height: 90px;
        border-radius: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.12));
    }

    /* Color Variants matching popup.html & popup.css */
    .box-blue {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 2.5px solid #2563eb;
    }
    .box-indigo {
        background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
        border: 2.5px solid #4f46e5;
    }
    .box-rose {
        background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
        border: 2.5px solid #f43f5e;
    }
    .box-purple {
        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
        border: 2.5px solid #8b5cf6;
    }
    .box-emerald {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border: 2.5px solid #10b981;
    }
    .box-cyan {
        background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
        border: 2.5px solid #0d9488;
    }

    /* SVG Connecting Curves */
    .turn-svg-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }
</style>
</head>
<body>

<div class="slide-header">
    <div class="slide-title">Countermeasure & Neutralization Architecture</div>
    <div class="slide-subtitle">How DarkSight Automatically Neutralizes Deception & Restores User Autonomy in the DOM</div>
</div>

<div class="diagram-container" id="diagram">
    
    <!-- Left Stages (Swimlane Labels) -->
    <div class="left-stages">
        <div class="stage-card">
            <div class="stage-num">Phase 1</div>
            <div class="stage-title">Pattern Ingestion</div>
            <div class="stage-sub">Receive Confirmed DPs</div>
        </div>

        <div class="stage-card">
            <div class="stage-num">Phase 2</div>
            <div class="stage-title">Strategy Dispatch</div>
            <div class="stage-sub">3-Mode Intervention Engine</div>
        </div>

        <div class="stage-card">
            <div class="stage-num">Phase 3</div>
            <div class="stage-title">Fair Webpage</div>
            <div class="stage-sub">Neutralized DOM Output</div>
        </div>
    </div>

    <!-- Main Canvas -->
    <div class="main-canvas" id="mainCanvas">

        <!-- SVG Gradients Definition & Connecting Branch Lines -->
        <svg class="turn-svg-overlay" id="overlaySvg">
            <defs>
                <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="#000000"/>
                </marker>
            </defs>
        </svg>

        <!-- Column 1: Input Detection & Strategy Dispatcher -->
        <div class="col-input" id="colInput">
            
            <!-- Ingest Node -->
            <div class="node-item" id="node_ingest" style="margin-bottom: 50px;">
                <div class="icon-box box-blue">
                    <!-- Target Ingest / Flag Icon -->
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                        <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                </div>
                <div class="node-label">Confirmed DP Flag</div>
                <div class="node-sublabel">Text, Style or Vision Flag</div>
            </div>

            <!-- Dispatcher Node -->
            <div class="node-item" id="node_dispatcher">
                <div class="icon-box box-indigo">
                    <!-- Dispatcher / Split Decision Icon -->
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 3v6"></path>
                        <path d="M12 15v6"></path>
                        <path d="M3 12h6"></path>
                        <path d="M15 12h6"></path>
                        <path d="m5.6 5.6 4.2 4.2"></path>
                        <path d="m14.2 14.2 4.2 4.2"></path>
                    </svg>
                </div>
                <div class="node-label">Strategy Dispatcher</div>
                <div class="node-sublabel">Policy & Severity Selector</div>
            </div>

        </div>

        <!-- Column 2: 3-Mode Intervention Cards matching popup.html -->
        <div class="col-pillars" id="colPillars">
            
            <!-- Mode 1: Highlight & Explain (HLE) -->
            <div class="pillar-card pillar-highlight" id="pillar_highlight">
                <div class="icon-box box-rose">
                    <!-- Sunburst / Sparkle Loader Icon from popup.html -->
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                </div>
                <div class="pillar-info">
                    <span class="pillar-badge badge-highlight">Mode 1 • HLE</span>
                    <div class="pillar-title">Highlight & Explain</div>
                    <div class="pillar-tagline">Identify and explain patterns</div>
                    <div class="pillar-desc">Injects warning badges, intent explanations, and visual borders around manipulative countdowns & scarcity text.</div>
                </div>
            </div>

            <!-- Mode 2: Hide (HD) -->
            <div class="pillar-card pillar-hide" id="pillar_hide">
                <div class="icon-box box-purple">
                    <!-- Eye-Slash Icon from popup.html -->
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                </div>
                <div class="pillar-info">
                    <span class="pillar-badge badge-hide">Mode 2 • HD</span>
                    <div class="pillar-title">Hide</div>
                    <div class="pillar-tagline">Remove manipulative elements</div>
                    <div class="pillar-desc">Removes obstruction overlays, unchecks sneaked pre-selected consent boxes, and silences aggressive banners.</div>
                </div>
            </div>

            <!-- Mode 3: Switch (SW) -->
            <div class="pillar-card pillar-switch" id="pillar_switch">
                <div class="icon-box box-emerald">
                    <!-- Shield Outline Icon from popup.html -->
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
                <div class="pillar-info">
                    <span class="pillar-badge badge-switch">Mode 3 • SW</span>
                    <div class="pillar-title">Switch</div>
                    <div class="pillar-tagline">Neutralize deceptive language</div>
                    <div class="pillar-desc">Equalizes button contrast, rebalances visual hierarchy, and injects clear 1-click alternative decline options.</div>
                </div>
            </div>

        </div>

        <!-- Column 3: Output DOM & Protected Page -->
        <div class="col-output" id="colOutput">
            
            <!-- Ingestion to DOM -->
            <div class="node-item" id="node_injector" style="margin-bottom: 50px;">
                <div class="icon-box box-cyan">
                    <!-- Code / DOM Mutation Icon -->
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                </div>
                <div class="node-label">DOM Transformer</div>
                <div class="node-sublabel">Direct Extension Mutation</div>
            </div>

            <!-- Final Protected State -->
            <div class="node-item" id="node_protected">
                <div class="icon-box box-emerald">
                    <!-- Shield Check / User Autonomy Icon -->
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <polyline points="9 12 11 14 15 10"></polyline>
                    </svg>
                </div>
                <div class="node-label">Fair & Safe UI</div>
                <div class="node-sublabel">User Autonomy Restored</div>
            </div>

        </div>

    </div>
</div>

<script>
    window.addEventListener('load', () => {
        const canvas = document.getElementById('mainCanvas');
        const svg = document.getElementById('overlaySvg');
        const canvasRect = canvas.getBoundingClientRect();

        const nIngest = document.getElementById('node_ingest').getBoundingClientRect();
        const nDispatcher = document.getElementById('node_dispatcher').getBoundingClientRect();
        const pHighlight = document.getElementById('pillar_highlight').getBoundingClientRect();
        const pHide = document.getElementById('pillar_hide').getBoundingClientRect();
        const pSwitch = document.getElementById('pillar_switch').getBoundingClientRect();
        const nInjector = document.getElementById('node_injector').getBoundingClientRect();
        const nProtected = document.getElementById('node_protected').getBoundingClientRect();

        // 1. Arrow: Ingest -> Dispatcher (Vertical)
        const xIng = nIngest.left + nIngest.width/2 - canvasRect.left;
        const yIngBottom = nIngest.bottom - canvasRect.top;
        const yDispTop = nDispatcher.top - canvasRect.top;

        drawArrow(xIng, yIngBottom, xIng, yDispTop - 6);

        // 2. Arrows: Dispatcher -> 3 Pillars (Branching Fan-out)
        const xDispRight = nDispatcher.right - canvasRect.left;
        const yDispCenter = nDispatcher.top + 45 - canvasRect.top;

        // Dispatcher to Highlight
        const xHLeft = pHighlight.left - canvasRect.left;
        const yHCenter = pHighlight.top + pHighlight.height/2 - canvasRect.top;
        drawCurve(xDispRight, yDispCenter, xHLeft - 6, yHCenter);

        // Dispatcher to Hide
        const xHdLeft = pHide.left - canvasRect.left;
        const yHdCenter = pHide.top + pHide.height/2 - canvasRect.top;
        drawCurve(xDispRight, yDispCenter, xHdLeft - 6, yHdCenter);

        // Dispatcher to Switch
        const xSwLeft = pSwitch.left - canvasRect.left;
        const ySwCenter = pSwitch.top + pSwitch.height/2 - canvasRect.top;
        drawCurve(xDispRight, yDispCenter, xSwLeft - 6, ySwCenter);

        // 3. Arrows: 3 Pillars -> DOM Transformer (Fan-in)
        const xInjLeft = nInjector.left - canvasRect.left;
        const yInjCenter = nInjector.top + 45 - canvasRect.top;

        const xHRight = pHighlight.right - canvasRect.left;
        drawCurve(xHRight, yHCenter, xInjLeft - 6, yInjCenter);

        const xHdRight = pHide.right - canvasRect.left;
        drawCurve(xHdRight, yHdCenter, xInjLeft - 6, yInjCenter);

        const xSwRight = pSwitch.right - canvasRect.left;
        drawCurve(xSwRight, ySwCenter, xInjLeft - 6, yInjCenter);

        // 4. Arrow: DOM Transformer -> Fair & Safe UI (Vertical)
        const xInjCenter = nInjector.left + nInjector.width/2 - canvasRect.left;
        const yInjBottom = nInjector.bottom - canvasRect.top;
        const yProtTop = nProtected.top - canvasRect.top;

        drawArrow(xInjCenter, yInjBottom, xInjCenter, yProtTop - 6);

        function drawArrow(x1, y1, x2, y2) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', \`M \${x1} \${y1} L \${x2} \${y2}\`);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000000');
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('marker-end', 'url(#arrowHead)');
            svg.appendChild(path);
        }

        function drawCurve(x1, y1, x2, y2) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const midX = (x1 + x2) / 2;
            path.setAttribute('d', \`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${y2}, \${x2} \${y2}\`);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#000000');
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('marker-end', 'url(#arrowHead)');
            svg.appendChild(path);
        }
    });
</script>

</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

async function renderDiagram() {
    console.log('Rendering Countermeasures diagram with exact DarkSight tool icons and names...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));

    // 1. Full Slide with Dark Background
    const slidePath = path.join(ASSETS_DIR, 'Countermeasures_Slide_Theme.png');
    await page.screenshot({ path: slidePath, fullPage: true });

    // 2. Card Only (Pure diagram container)
    const cardPath = path.join(ASSETS_DIR, 'Countermeasures_Pipeline_Diagram.png');
    const cardElem = await page.$('#diagram');
    await cardElem.screenshot({ path: cardPath });

    console.log(`✅ Countermeasures Slide generated: ${slidePath}`);
    console.log(`✅ Countermeasures Card generated: ${cardPath}`);
    await browser.close();
}

renderDiagram().catch(err => {
    console.error('Error generating diagram:', err);
});
