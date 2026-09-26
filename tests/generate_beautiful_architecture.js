const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';
const htmlPath = path.join(__dirname, 'beautiful_arch.html');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    
    body {
      background: radial-gradient(circle at top right, #0f172a 0%, #020617 100%);
      color: white; 
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 1920px; 
      height: 1080px; 
      overflow: hidden;
    }
    
    .header { 
      font-size: 48px; 
      font-weight: 800; 
      letter-spacing: 4px; 
      margin-bottom: 50px; 
      text-transform: uppercase; 
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 10px 30px rgba(56, 189, 248, 0.2);
    }
    
    .grid { 
      display: flex; 
      align-items: stretch; 
      width: 1820px; 
      height: 780px; 
    }
    
    .col { 
      flex: 1; 
      background: rgba(30,41,59,0.4); 
      border: 1px solid rgba(148,163,184,0.2); 
      border-radius: 24px; 
      padding: 35px 25px; 
      display: flex; 
      flex-direction: column; 
      gap: 20px;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.6); 
      backdrop-filter: blur(20px);
    }
    
    .col-title { 
      font-size: 22px; 
      font-weight: 800; 
      color: #94a3b8; 
      text-align: center; 
      border-bottom: 2px solid rgba(255,255,255,0.05); 
      padding-bottom: 20px; 
      margin-bottom: 10px; 
      letter-spacing: 1px;
    }
    .col-title span { font-size: 26px; display: block; margin-top: 5px; }
    
    .card { 
      background: linear-gradient(145deg, #1e293b, #0f172a); 
      border: 1px solid rgba(148,163,184,0.15); 
      border-radius: 16px; 
      padding: 25px 20px;
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: center; 
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    
    .card-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #f8fafc; }
    .card-sub { font-size: 15px; color: #94a3b8; font-weight: 600; font-family: monospace; }
    
    .card-blue { border-top: 4px solid #38bdf8; box-shadow: 0 -4px 25px rgba(56,189,248,0.15), 0 10px 25px rgba(0,0,0,0.5); }
    .card-orange { border-top: 4px solid #f97316; box-shadow: 0 -4px 25px rgba(249,115,22,0.15), 0 10px 25px rgba(0,0,0,0.5); }
    .card-purple { border-top: 4px solid #a855f7; box-shadow: 0 -4px 25px rgba(168,85,247,0.15), 0 10px 25px rgba(0,0,0,0.5); }
    .card-red { border-top: 4px solid #ef4444; box-shadow: 0 -4px 25px rgba(239,68,68,0.15), 0 10px 25px rgba(0,0,0,0.5); }
    
    .block-container {
      background: rgba(0,0,0,0.25); 
      padding: 20px; 
      border-radius: 16px; 
      border: 1px solid rgba(255,255,255,0.05);
    }

    .paper { 
      background: rgba(15,23,42,0.9); 
      border: 1px dashed #64748b; 
      padding: 15px; 
      border-radius: 12px; 
      margin-bottom: 15px; 
      width: 100%; 
      box-sizing: border-box; 
    }
    .paper-title { font-size: 15px; font-weight: 700; color: #bae6fd; text-transform: uppercase; letter-spacing: 0.5px;}
    .paper-desc { font-size: 14px; color: #cbd5e1; margin-top: 6px; }
    
    .flow-arrow { display: flex; flex-direction: column; align-items: center; color: #94a3b8; font-size: 14px; margin: 15px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;}
    .flow-arrow::after { content: '▼'; font-size: 12px; margin-top: 8px; color: #475569; }
    
    .col-connector { display: flex; flex-direction: column; align-items: center; width: 180px; }
    .chevron { width: 24px; height: 24px; border-right: 4px solid #475569; border-bottom: 4px solid #475569; transform: rotate(-45deg); margin: 0 auto; opacity: 0.7;}
    
    .badge { 
      background: #1e293b; 
      border: 1px solid #475569; 
      color: #e2e8f0; 
      padding: 8px 16px; 
      border-radius: 30px; 
      font-size: 14px; 
      font-weight: 600;
      margin-bottom: 15px; 
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  
  <div class="header">DarkSight Architecture Pipeline</div>
  
  <div class="grid">
    
    <!-- PHASE 1 -->
    <div class="col">
      <div class="col-title">PHASE 1<span style="color:#38bdf8">DATA INGESTION</span></div>
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap: 50px;">
        <div class="card card-blue">
          <div class="card-title">DOM Extractor</div>
          <div class="card-sub">content.js</div>
        </div>
        <div class="card card-blue">
          <div class="card-title">Viewport Capture</div>
          <div class="card-sub">background.js</div>
        </div>
      </div>
    </div>
    
    <!-- CONNECTOR 1 -->
    <div class="col-connector" style="justify-content: space-evenly;">
      <div><div class="badge">HTML Text</div><div class="chevron"></div></div>
      <div><div class="badge">CSS Variables</div><div class="chevron"></div></div>
      <div><div class="badge">Base64 Image</div><div class="chevron"></div></div>
    </div>

    <!-- PHASE 2 -->
    <div class="col">
      <div class="col-title">PHASE 2<span style="color:#f97316">ZERO-LATENCY HEURISTICS</span></div>
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap: 30px;">
        
        <div class="block-container">
          <div class="paper">
            <div class="paper-title">PAPER: Mathur (2019)</div>
            <div class="paper-desc">Urgency & Scarcity Signatures</div>
          </div>
          <div class="flow-arrow">Provides Rules</div>
          <div class="card card-orange"><div class="card-title">Fast Regex Scan</div></div>
        </div>
        
        <div class="block-container">
          <div class="paper">
            <div class="paper-title">PAPER: AidUI</div>
            <div class="paper-desc">False Hierarchy Box Calculations</div>
          </div>
          <div class="flow-arrow">Provides Rules</div>
          <div class="card card-orange"><div class="card-title">Structural CSS Math</div></div>
        </div>

      </div>
    </div>

    <!-- CONNECTOR 2 -->
    <div class="col-connector" style="justify-content: space-evenly;">
      <div><div class="badge" style="color:#f97316">Unmatched Text</div><div class="chevron"></div></div>
      <div><div class="badge" style="color:#f97316">Complex Layouts</div><div class="chevron"></div></div>
    </div>

    <!-- PHASE 3 -->
    <div class="col" style="flex: 1.2;">
      <div class="col-title">PHASE 3<span style="color:#a855f7">DP SENTINEL (HYBRID AI)</span></div>
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap: 30px;">
        
        <div class="block-container">
          <div style="display:flex; gap:15px; margin-bottom:15px;">
            <div class="paper" style="margin-bottom:0;"><div class="paper-title">Schaefer (2023)</div><div class="paper-desc">8-Category Semantic Taxonomy</div></div>
            <div class="paper" style="margin-bottom:0;"><div class="paper-title">In-Context</div><div class="paper-desc">Few-Shot Prompts</div></div>
          </div>
          <div class="flow-arrow">Frames Semantic Logic</div>
          <div class="card card-blue"><div class="card-title">DeepSeek-R1 (Local)</div><div class="card-sub">Text Pipeline</div></div>
        </div>
        
        <div class="block-container">
          <div class="paper">
            <div class="paper-title">PAPER: 50 Shades of DP</div>
            <div class="paper-desc">21-Category Visual Taxonomy</div>
          </div>
          <div class="flow-arrow">Frames Visual Logic</div>
          <div class="card card-purple"><div class="card-title">Qwen2.5-VL (Local)</div><div class="card-sub">Vision Pipeline</div></div>
        </div>

      </div>
    </div>

    <!-- CONNECTOR 3 -->
    <div class="col-connector" style="justify-content: center;">
      <div><div class="badge" style="color:#a855f7">JSON Trigger Payload</div><div class="chevron"></div></div>
    </div>

    <!-- PHASE 4 -->
    <div class="col">
      <div class="col-title">PHASE 4<span style="color:#ef4444">COUNTERMEASURES</span></div>
      <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
        <div class="block-container" style="padding: 30px 20px;">
          <div class="paper">
            <div class="paper-title">PAPER: Schaefer (2024)</div>
            <div class="paper-desc">Dynamic Highlight (HLE) & Hide (HD)</div>
          </div>
          <div class="flow-arrow" style="margin: 30px 0;">Dictates Strategy</div>
          <div class="card card-red"><div class="card-title">Mitigation Engine</div><div class="card-sub">content.js</div></div>
        </div>
      </div>
    </div>

  </div>
  
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

(async () => {
    console.log("Launching Puppeteer for beautiful slide screenshot...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    
    await page.goto('file://' + htmlPath);
    
    // Wait for fonts to load
    await new Promise(r => setTimeout(r, 2000));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }
    
    const outPath = path.join(ASSETS_DIR, 'architecture_slide_beautiful.png');
    await page.screenshot({ path: outPath });
    
    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log("Successfully created beautiful architecture slide at: " + outPath);
})();
