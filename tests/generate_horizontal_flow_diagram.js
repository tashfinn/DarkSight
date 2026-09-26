const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        background: transparent;
        color: #f8fafc;
        font-family: 'Outfit', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 30px;
        min-height: 100vh;
    }

    .diagram-container {
        width: 1760px;
        background: linear-gradient(145deg, #0e1626, #090d16);
        border: 1px solid #1e293b;
        border-radius: 24px;
        padding: 35px 35px 25px 35px;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.04);
        position: relative;
    }

    /* Grid of 4 horizontal phases with arrow columns */
    .flow-wrapper {
        display: flex;
        align-items: stretch;
        justify-content: space-between;
        gap: 12px;
        position: relative;
        z-index: 2;
    }

    .phase-card {
        background: rgba(15, 23, 42, 0.8);
        border-radius: 18px;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid #334155;
        position: relative;
        flex: 1;
    }

    .phase-1 { flex: 0.85; border-top: 4px solid #38bdf8; background: linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%); }
    .phase-2 { flex: 1.05; border-top: 4px solid #f59e0b; background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%); }
    .phase-3 { flex: 1.25; border-top: 4px solid #8b5cf6; background: linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%); }
    .phase-4 { flex: 1.05; border-top: 4px solid #ef4444; background: linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%); }

    .arrow-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        width: 32px;
        padding: 40px 0;
        color: #475569;
    }
    .arrow-icon {
        font-size: 24px;
        font-weight: 900;
        color: #64748b;
        background: #0f172a;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #334155;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }

    .phase-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .phase-title {
        font-size: 14.5px;
        font-weight: 800;
        letter-spacing: 0.8px;
        text-transform: uppercase;
    }
    .phase-tag {
        font-size: 10.5px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .p1-color { color: #38bdf8; }
    .p1-tag { background: rgba(56, 189, 248, 0.2); color: #7dd3fc; }

    .p2-color { color: #f59e0b; }
    .p2-tag { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }

    .p3-color { color: #a78bfa; }
    .p3-tag { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; }

    .p4-color { color: #f87171; }
    .p4-tag { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

    /* Module boxes */
    .module-box {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        position: relative;
    }

    .module-box.ingestion { border-left: 4px solid #38bdf8; }
    .module-box.heuristic { border-left: 4px solid #f59e0b; }
    .module-box.ai-text { border-left: 4px solid #818cf8; }
    .module-box.ai-vision { border-left: 4px solid #c084fc; }
    .module-box.countermeasure { border-left: 4px solid #ef4444; }

    .module-title {
        font-size: 14.5px;
        font-weight: 700;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .file-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        color: #94a3b8;
        background: #0f172a;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #334155;
    }

    .module-desc {
        font-size: 11.5px;
        color: #94a3b8;
        line-height: 1.4;
    }

    /* Paper badge boxes */
    .paper-box {
        background: rgba(30, 41, 59, 0.5);
        border: 1px dashed #475569;
        border-radius: 10px;
        padding: 8px 10px;
    }
    .paper-name {
        font-size: 11.5px;
        font-weight: 700;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
    }
    .paper-role {
        font-size: 10.5px;
        color: #64748b;
        line-height: 1.3;
    }

    /* Directional flow indicators */
    .flow-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 5px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        width: fit-content;
    }
    .flow-badge.fast { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .flow-badge.ai { background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .flow-badge.alert { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    /* Fast Bypass Banner */
    .fast-path-banner {
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.03));
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 10px;
        padding: 10px 16px;
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        color: #a7f3d0;
    }
    .fast-path-banner strong { color: #34d399; }

    .modes-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
    }
    .mode-item {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 7px 9px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .mode-icon {
        font-size: 15px;
        line-height: 1;
    }
    .mode-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
    }
    .mode-title {
        font-size: 12px;
        font-weight: 700;
        color: #f1f5f9;
    }
    .mode-desc {
        font-size: 10.5px;
        color: #94a3b8;
    }
</style>
</head>
<body>

<div class="diagram-container" id="horizontal-diagram">

    <div class="flow-wrapper">

        <!-- ================= PHASE 1 ================= -->
        <div class="phase-card phase-1">
            <div class="phase-header">
                <span class="phase-title p1-color">Phase 1: Ingestion</span>
                <span class="phase-tag p1-tag">Extract</span>
            </div>

            <!-- DOM Extractor -->
            <div class="module-box ingestion">
                <div class="module-title">
                    <span>DOM Extractor</span>
                    <span class="file-badge">content.js</span>
                </div>
                <div class="module-desc">
                    Traverses visible HTML leaf nodes, computes CSS &amp; bounding box coordinates.
                </div>
                <div class="flow-badge fast">➔ Text &amp; CSS Variables</div>
            </div>

            <!-- Viewport Capture -->
            <div class="module-box ingestion">
                <div class="module-title">
                    <span>Viewport Capture</span>
                    <span class="file-badge">background.js</span>
                </div>
                <div class="module-desc">
                    Captures full-resolution active viewport screenshot via Chrome tabs API.
                </div>
                <div class="flow-badge ai">➔ Base64 Screenshot Image</div>
            </div>
        </div>

        <!-- Arrow 1 ➔ 2 -->
        <div class="arrow-col">
            <div class="arrow-icon" title="Extracted Text">➔</div>
            <div class="arrow-icon" title="Screenshot Capture">➔</div>
        </div>

        <!-- ================= PHASE 2 ================= -->
        <div class="phase-card phase-2">
            <div class="phase-header">
                <span class="phase-title p2-color">Phase 2: Zero-Latency Heuristics</span>
                <span class="phase-tag p2-tag">&lt; 5ms</span>
            </div>

            <!-- Paper Mathur + Regex -->
            <div class="paper-box">
                <div class="paper-name">📄 Mathur et al. (2019)</div>
                <div class="paper-role">Predefined regex rules for Urgency &amp; Scarcity text.</div>
            </div>
            <div class="module-box heuristic">
                <div class="module-title">
                    <span>Fast Regex Scanner</span>
                    <span class="flow-badge fast">0ms AI Delay</span>
                </div>
                <div class="module-desc">
                    Matches high-frequency traps (<em>"Only 2 left"</em>, <em>"Flash Sale"</em>).
                </div>
            </div>

            <!-- Paper AidUI + CSS Math -->
            <div class="paper-box">
                <div class="paper-name">📄 AidUI (2023)</div>
                <div class="paper-role">Mathematical spatial &amp; contrast asymmetry formulas.</div>
            </div>
            <div class="module-box heuristic">
                <div class="module-title">
                    <span>Structural CSS Math</span>
                    <span class="flow-badge fast">DOM Analysis</span>
                </div>
                <div class="module-desc">
                    Detects False Hierarchies (microscopic "Cancel" vs giant "Accept").
                </div>
            </div>
        </div>

        <!-- Arrow 2 ➔ 3 -->
        <div class="arrow-col">
            <div class="arrow-icon" title="Ambiguous Text">➔</div>
            <div class="arrow-icon" title="Complex Layouts">➔</div>
        </div>

        <!-- ================= PHASE 3 ================= -->
        <div class="phase-card phase-3">
            <div class="phase-header">
                <span class="phase-title p3-color">Phase 3: DP Sentinel Hybrid AI</span>
                <span class="phase-tag p3-tag">Deep Reasoning</span>
            </div>

            <!-- Text Pipeline -->
            <div class="paper-box">
                <div class="paper-name">📄 Schaefer (2023) &amp; In-Context (2023)</div>
                <div class="paper-role">8-category taxonomy + Few-Shot prompt engineering (<code>prompt.js</code>).</div>
            </div>
            <div class="module-box ai-text">
                <div class="module-title">
                    <span>NLP Text Pipeline</span>
                    <span class="file-badge">DeepSeek-R1 / Mistral</span>
                </div>
                <div class="module-desc">
                    Evaluates ambiguous text batches for disguised obstruction &amp; confirmshaming.
                </div>
            </div>

            <!-- Vision Pipeline -->
            <div class="paper-box">
                <div class="paper-name">📄 50 Shades of Deceptive Patterns</div>
                <div class="paper-role">21-category visual taxonomy for viewport layout parsing.</div>
            </div>
            <div class="module-box ai-vision">
                <div class="module-title">
                    <span>Multimodal Vision Pipeline</span>
                    <span class="file-badge">Qwen2.5-VL / LLaVA</span>
                </div>
                <div class="module-desc">
                    Screenshots evaluated for complex visual traps (Disguised Ads, Roach Motel).
                </div>
            </div>
        </div>

        <!-- Arrow 3 ➔ 4 -->
        <div class="arrow-col">
            <div class="arrow-icon" title="Text Threat Flagged">➔</div>
            <div class="arrow-icon" title="Vision Threat Flagged">➔</div>
        </div>

        <!-- ================= PHASE 4 ================= -->
        <div class="phase-card phase-4">
            <div class="phase-header">
                <span class="phase-title p4-color">Phase 4: Countermeasures</span>
                <span class="phase-tag p4-tag">Active Defense</span>
            </div>

            <!-- Paper Schaefer 2024 -->
            <div class="paper-box">
                <div class="paper-name">📄 Schaefer et al. (2024)</div>
                <div class="paper-role">Dynamic UI Intervention &amp; Neutralization Framework.</div>
            </div>

            <div class="module-box countermeasure">
                <div class="module-title">
                    <span>Mitigation Engine</span>
                    <span class="file-badge">content.js</span>
                </div>

                <div class="modes-list">
                    <div class="mode-item">
                        <span class="mode-icon">🔴</span>
                        <div class="mode-info">
                            <span class="mode-title">Highlight &amp; Explain (HLE)</span>
                            <span class="mode-desc">Glowing red border + hover explanation tooltip.</span>
                        </div>
                    </div>
                    <div class="mode-item">
                        <span class="mode-icon">👁️</span>
                        <div class="mode-info">
                            <span class="mode-title">Hide (HD)</span>
                            <span class="mode-desc">Completely removes deceptive DOM element.</span>
                        </div>
                    </div>
                    <div class="mode-item">
                        <span class="mode-icon">🔄</span>
                        <div class="mode-info">
                            <span class="mode-title">Switch to Fair UI (SW)</span>
                            <span class="mode-desc">Replaces manipulative copy with neutral text.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Fast Path Bottom Ribbon -->
    <div class="fast-path-banner">
        <span>⚡ <strong>DP Sentinel Orchestration:</strong> Fast Heuristics (Phase 2) resolve ~70% of blatant traps in &lt;5ms directly to Countermeasures, while only complex/ambiguous elements trigger Deep AI (Phase 3).</span>
        <span class="flow-badge fast">Fast Bypass Enabled</span>
    </div>

</div>

</body>
</html>
`;

async function generateDiagram() {
    const htmlPath = path.join(__dirname, 'horizontal_workflow_diagram.html');
    fs.writeFileSync(htmlPath, htmlContent);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 900, deviceScaleFactor: 2 });
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

    const element = await page.$('#horizontal-diagram');
    
    // Save opaque version
    await element.screenshot({
        path: path.join(ASSETS_DIR, 'DarkSight_Horizontal_Workflow.png'),
        omitBackground: false
    });

    // Save transparent background version
    await element.screenshot({
        path: path.join(ASSETS_DIR, 'DarkSight_Horizontal_Workflow_transparent.png'),
        omitBackground: true
    });

    await browser.close();
    console.log('Ultra-crisp horizontal diagram generated successfully in assets folder!');
}

generateDiagram().catch(console.error);
