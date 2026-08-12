const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; margin: 0; padding: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 1200px;}
    
    .canvas { width: 1500px; background: #1e293b; padding: 50px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative; }
    
    h1 { text-align: center; color: #f8fafc; font-size: 42px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;}
    .subtitle { text-align: center; color: #94a3b8; font-size: 20px; margin-bottom: 50px; }
    
    .headers { display: flex; margin-bottom: 20px; font-weight: bold; font-size: 22px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px;}
    .header-item { flex: 1; text-align: center; }
    
    .flow-row { display: flex; align-items: stretch; margin-bottom: 30px; gap: 15px; position: relative;}
    
    .col { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 25px 20px; border-radius: 12px; text-align: center; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; position: relative; z-index: 2;}
    
    .col.paper { border-left: 6px solid #3b82f6; }
    .col.mech { border-left: 6px solid #8b5cf6; }
    .col.ext { border-left: 6px solid #f97316; }
    .col.det { border-left: 6px solid #10b981; }
    
    .title { font-size: 24px; font-weight: 800; margin-bottom: 12px; color: #f8fafc; }
    .desc { font-size: 17px; color: #94a3b8; line-height: 1.5; }
    
    .arrow { display: flex; align-items: center; justify-content: center; font-size: 35px; color: #475569; z-index: 1; width: 50px;}
    
    /* Orchestration wrapper */
    .orchestration { background: rgba(51, 65, 85, 0.3); border: 2px dashed #475569; padding: 35px; border-radius: 16px; margin-top: 50px; display: flex; flex-direction: column;}
    .orch-title { text-align: center; font-size: 28px; font-weight: bold; color: #f8fafc; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px;}
    
</style>
</head>
<body>
    <div class="canvas" id="capture-area">
        <h1>DarkSight Hybrid Detection Methodology</h1>
        <div class="subtitle">Horizontal Flow: From Academic Paper ➔ Mechanism ➔ Extension Component ➔ Final Detection</div>
        
        <div class="headers">
            <div class="header-item" style="color: #60a5fa;">1. Academic Foundation</div>
            <div class="header-item" style="color: #a78bfa;">2. Core Mechanism</div>
            <div class="header-item" style="color: #fb923c;">3. DarkSight Extension</div>
            <div class="header-item" style="color: #34d399;">4. Detection Output</div>
        </div>

        <!-- Flow 1: DOM -->
        <div class="flow-row">
            <div class="col paper">
                <div class="title" style="color: #60a5fa;">Mathur (2019) & AidUI</div>
                <div class="desc">Text & Structural Taxonomies</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col mech">
                <div class="title" style="color: #a78bfa;">Regex & CSS Math</div>
                <div class="desc">Pattern matching & calculating Bounding Box Area/Contrast Ratios.</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col ext">
                <div class="title" style="color: #fb923c;">Tier 1: DOM Engine</div>
                <div class="desc">Executes instantly on the frontend upon page load.</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col det">
                <div class="title" style="color: #34d399;">Immediate Filtering</div>
                <div class="desc">Instantly traps obvious Manipulative Strings & False Hierarchies.</div>
            </div>
        </div>

        <!-- Flow 2: NLP -->
        <div class="flow-row">
            <div class="col paper">
                <div class="title" style="color: #60a5fa;">Schaefer & In-Context</div>
                <div class="desc">Semantic Taxonomy & LLM Framework</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col mech">
                <div class="title" style="color: #a78bfa;">Few-Shot Prompting</div>
                <div class="desc">Injecting strict definitions to evaluate underlying semantic intent.</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col ext">
                <div class="title" style="color: #fb923c;">Tier 2: NLP Pipeline</div>
                <div class="desc">Background orchestration of local Mistral AI model.</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col det">
                <div class="title" style="color: #34d399;">Contextual Deception</div>
                <div class="desc">Identifies nuanced manipulation (e.g., disguised Sneaking) missed by regex.</div>
            </div>
        </div>

        <!-- Flow 3: Vision -->
        <div class="flow-row">
            <div class="col paper">
                <div class="title" style="color: #60a5fa;">50 Shades of DP</div>
                <div class="desc">Baseline Visual Deception Study</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col mech">
                <div class="title" style="color: #a78bfa;">Spatial Taxonomy</div>
                <div class="desc">Mapping 21 deceptive visual categories to raw image pixels.</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col ext">
                <div class="title" style="color: #fb923c;">Tier 3: Vision Fallback</div>
                <div class="desc">Captures viewport screenshots and passes to LLaVA multimodal AI.</div>
            </div>
            <div class="arrow">➔</div>
            <div class="col det">
                <div class="title" style="color: #34d399;">Spatial Awareness</div>
                <div class="desc">Detects full-screen layout manipulations (e.g. Roach Motels, Disguised Ads).</div>
            </div>
        </div>
        
        <!-- Orchestration Integration -->
        <div class="orchestration">
            <div class="orch-title">System Integration & Mitigation</div>
            <div class="flow-row" style="margin-bottom: 0;">
                <div class="col paper" style="border-left-color: #ef4444;">
                    <div class="title" style="color: #f87171;">DP Sentinel & Schaefer</div>
                    <div class="desc">Hybrid Orchestration & Countermeasures</div>
                </div>
                <div class="arrow">➔</div>
                <div class="col mech" style="border-left-color: #ef4444;">
                    <div class="title" style="color: #f87171;">Multi-Tier Routing & HL+E</div>
                    <div class="desc">Dynamic fallback routing combined with "Highlight + Explanation" UI injection.</div>
                </div>
                <div class="arrow">➔</div>
                <div class="col ext" style="border-left-color: #ef4444;">
                    <div class="title" style="color: #f87171;">DarkSight Engine</div>
                    <div class="desc">Combines outputs from Tiers 1-3 to maximize speed and accuracy.</div>
                </div>
                <div class="arrow">➔</div>
                <div class="col det" style="border-left-color: #ef4444; background: rgba(239, 68, 68, 0.1);">
                    <div class="title" style="color: #fca5a5;">Final User Protection</div>
                    <div class="desc" style="color: #fee2e2;">Safeguards the user using visual glowing boundaries and educational tooltips.</div>
                </div>
            </div>
        </div>

    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'flow_diagram.html'), htmlContent);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1700, height: 1300, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(__dirname, 'flow_diagram.html'));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    const elementHandle = await page.$('#capture-area');
    await elementHandle.screenshot({ path: path.join(ASSETS_DIR, 'methodology_flow.png'), omitBackground: true });

    await browser.close();
    console.log('Horizontal Flow diagram generated successfully!');
})();
