const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';
const htmlPath = path.join(__dirname, 'slide_architecture.html');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: radial-gradient(circle at center, #111827 0%, #030712 100%);
            color: #f8fafc;
            font-family: 'Outfit', sans-serif;
            width: 1920px;
            height: 1080px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .title {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 50px;
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
            color: #f8fafc;
        }
        
        .diagram-container {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: space-between;
            width: 1800px;
            height: 800px;
            gap: 20px;
            position: relative;
        }

        .phase-col {
            flex: 1;
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(71, 85, 105, 0.5);
            border-radius: 16px;
            padding: 25px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            position: relative;
            z-index: 2;
        }

        .phase-title {
            font-size: 24px;
            font-weight: 600;
            color: #38bdf8;
            text-align: center;
            border-bottom: 2px solid rgba(56, 189, 248, 0.2);
            padding-bottom: 15px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .box {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            position: relative;
        }
        
        .box-title {
            font-size: 20px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 8px;
        }
        
        .box-sub {
            font-size: 16px;
            color: #94a3b8;
            font-weight: 300;
        }

        .box-accent-orange { border-top: 4px solid #f59e0b; }
        .box-accent-blue { border-top: 4px solid #3b82f6; }
        .box-accent-purple { border-top: 4px solid #8b5cf6; }
        .box-accent-red { border-top: 4px solid #ef4444; }
        
        .paper-box {
            border: 1px dashed #64748b;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .paper-title { font-size: 15px; color: #cbd5e1; font-weight: 600; }
        .paper-desc { font-size: 14px; color: #94a3b8; margin-top: 5px; }

        .connection-down {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            color: #64748b;
        }
        
        .connection-down::after {
            content: '▼';
            font-size: 14px;
        }

        /* SVG layer for complex arrows */
        #svg-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }

        .path-line {
            fill: none;
            stroke: #475569;
            stroke-width: 3;
            stroke-dasharray: 6, 6;
            animation: dash 20s linear infinite;
        }
        
        .path-solid {
            fill: none;
            stroke: #64748b;
            stroke-width: 3;
        }

        @keyframes dash {
            to { stroke-dashoffset: -1000; }
        }
        
        .label {
            background: #1e293b;
            border: 1px solid #475569;
            color: #cbd5e1;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 3;
            white-space: nowrap;
        }
        
    </style>
</head>
<body>

    <div class="title">DarkSight Architecture Pipeline</div>

    <div class="diagram-container">
        <!-- SVG LAYER -->
        <svg id="svg-layer">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-dashed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
            </defs>
            
            <!-- P1 to P2 (Text) -->
            <path class="path-solid" d="M 430, 200 C 500, 200 500, 280 570, 280" marker-end="url(#arrow)" />
            <div class="label" style="left: 500px; top: 220px;">Extracted HTML Text</div>
            
            <!-- P1 to P2 (CSS) -->
            <path class="path-solid" d="M 430, 350 C 500, 350 500, 580 570, 580" marker-end="url(#arrow)" />
            <div class="label" style="left: 500px; top: 460px;">CSS Variables</div>
            
            <!-- P1 to P3 (Vision) -->
            <path class="path-solid" d="M 230, 410 C 230, 750 1025, 800 1025, 600" marker-end="url(#arrow)" />
            <div class="label" style="left: 630px; top: 760px;">Base64 Screenshot Image</div>
            
            <!-- P2 to P3 (Text Fallback) -->
            <path class="path-solid" d="M 865, 300 C 930, 300 930, 470 1025, 470" marker-end="url(#arrow)" />
            <div class="label" style="left: 950px; top: 380px;">Unmatched Ambiguous Text</div>
            
            <!-- P3 to P4 -->
            <path class="path-solid" d="M 1320, 480 C 1400, 480 1400, 400 1465, 400" marker-end="url(#arrow)" />
            <div class="label" style="left: 1390px; top: 430px;">JSON Trigger</div>
            
            <path class="path-solid" d="M 1320, 600 C 1400, 600 1400, 400 1465, 400" marker-end="url(#arrow)" />
        </svg>

        <!-- PHASE 1 -->
        <div class="phase-col">
            <div class="phase-title">Phase 1:<br>Data Ingestion</div>
            <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap: 40px;">
                <div class="box box-accent-blue" id="p1-dom">
                    <div class="box-title">DOM Extractor</div>
                    <div class="box-sub">content.js</div>
                </div>
                <div class="box box-accent-blue" id="p1-vp">
                    <div class="box-title">Viewport Capture</div>
                    <div class="box-sub">background.js</div>
                </div>
            </div>
        </div>

        <!-- PHASE 2 -->
        <div class="phase-col" style="flex: 1.2;">
            <div class="phase-title">Phase 2:<br>Zero-Latency Heuristics</div>
            <div style="display:flex; flex-direction:column; gap: 30px; margin-top:20px;">
                
                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                    <div class="paper-box">
                        <div class="paper-title">PAPER: Mathur (2019)</div>
                        <div class="paper-desc">Defines Urgency/Scarcity Signatures</div>
                    </div>
                    <div class="connection-down">Provides Rules</div>
                    <div class="box box-accent-orange" id="p2-regex">
                        <div class="box-title">Fast Regex Scan</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                    <div class="paper-box">
                        <div class="paper-title">PAPER: AidUI</div>
                        <div class="paper-desc">Defines False Hierarchy Math</div>
                    </div>
                    <div class="connection-down">Provides Rules</div>
                    <div class="box box-accent-orange" id="p2-css">
                        <div class="box-title">Structural CSS Math</div>
                    </div>
                </div>

            </div>
        </div>

        <!-- PHASE 3 -->
        <div class="phase-col" style="flex: 1.2;">
            <div class="phase-title">Phase 3:<br>DP Sentinel Framework</div>
            <div style="display:flex; flex-direction:column; gap: 30px; margin-top:20px;">
                
                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                    <div style="display:flex; gap:10px;">
                        <div class="paper-box" style="flex:1;">
                            <div class="paper-title">Schaefer (2023)</div>
                            <div class="paper-desc">8-Category Semantic Taxonomy</div>
                        </div>
                        <div class="paper-box" style="flex:1;">
                            <div class="paper-title">In-Context (2023)</div>
                            <div class="paper-desc">Few-Shot Prompt Engineering</div>
                        </div>
                    </div>
                    <div class="connection-down">Frames Semantic Logic</div>
                    <div class="box box-accent-blue" id="p3-text">
                        <div class="box-title">DeepSeek-R1 (Local API)</div>
                        <div class="box-sub">Text Pipeline</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid #334155;">
                    <div class="paper-box">
                        <div class="paper-title">PAPER: 50 Shades of DP</div>
                        <div class="paper-desc">21-Category Visual Taxonomy</div>
                    </div>
                    <div class="connection-down">Frames Visual Logic</div>
                    <div class="box box-accent-purple" id="p3-vision">
                        <div class="box-title">Qwen2.5-VL (Local API)</div>
                        <div class="box-sub">Vision Pipeline</div>
                    </div>
                </div>

            </div>
        </div>

        <!-- PHASE 4 -->
        <div class="phase-col">
            <div class="phase-title">Phase 4:<br>Countermeasures</div>
            <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid #334155;">
                    <div class="paper-box">
                        <div class="paper-title">PAPER: Schaefer (2024)</div>
                        <div class="paper-desc">Dynamic Highlight (HLE) & Hide (HD)</div>
                    </div>
                    <div class="connection-down" style="height: 60px;">Dictates Injection Strategy</div>
                    <div class="box box-accent-red" id="p4-mitigate">
                        <div class="box-title">Mitigation Engine</div>
                        <div class="box-sub">content.js</div>
                    </div>
                </div>
            </div>
        </div>

    </div>

</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

(async () => {
    console.log("Launching Puppeteer for slide screenshot...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Exact 1080p slide resolution
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    
    await page.goto('file://' + htmlPath);
    
    // Wait for fonts to load
    await new Promise(r => setTimeout(r, 1500));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }
    
    const outPath = path.join(ASSETS_DIR, 'architecture_slide_dark.png');
    await page.screenshot({ path: outPath });
    
    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log("Successfully created horizontal dark theme architecture slide at: " + outPath);
})();
