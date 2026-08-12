const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';
const htmlPath = path.join(__dirname, 'dark_mermaid_arch.html');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { background: #020617; padding: 40px; font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh;}
    .mermaid { display: inline-block; background: #020617; max-width: 1600px; width: 100%; }
    
    /* Custom Subgraph Styling for Dark Theme */
    .cluster rect { fill: #0f172a !important; stroke: #334155 !important; stroke-width: 2px !important; rx: 12px !important; ry: 12px !important; }
    .cluster .label { font-weight: 700 !important; font-size: 16px !important; color: #94a3b8 !important; }
    
    /* Edge Path Styling */
    .edgePath .path { stroke: #64748b !important; stroke-width: 2px !important; }
    .edgeLabel { background-color: #0f172a !important; color: #cbd5e1 !important; font-size: 12px !important; border: 1px solid #334155; padding: 2px 6px; border-radius: 4px;}
  </style>
</head>
<body>
  <div class="mermaid" id="diagram">
    graph LR
    classDef default font-family:'Segoe UI', sans-serif, font-size:14px;
    classDef paper fill:#1e293b,stroke:#64748b,stroke-width:1.5px,stroke-dasharray: 5 5,color:#cbd5e1
    classDef modBlue fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px,color:#f8fafc,font-weight:bold
    classDef modOrange fill:#7c2d12,stroke:#fb923c,stroke-width:2px,color:#f8fafc,font-weight:bold
    classDef modPurple fill:#4c1d95,stroke:#c084fc,stroke-width:2px,color:#f8fafc,font-weight:bold
    classDef modRed fill:#7f1d1d,stroke:#f87171,stroke-width:2px,color:#f8fafc,font-weight:bold

    subgraph Phase 1: Data Ingestion
        DOM["DOM Extractor<br/>(content.js)"]:::modBlue
        VP["Viewport Capture<br/>(background.js)"]:::modBlue
    end

    subgraph Phase 2: Zero-Latency Heuristics
        P_Mathur["PAPER: Mathur (2019)<br/>Urgency/Scarcity Text"]:::paper
        Regex["Fast Regex Scan"]:::modOrange
        
        P_AidUI["PAPER: AidUI<br/>False Hierarchy Math"]:::paper
        CSSMath["Structural CSS Math"]:::modOrange
    end

    subgraph Phase 3: DP Sentinel Framework
        P_Schaefer["PAPER: Schaefer (2023)<br/>8-Category Semantic"]:::paper
        P_InContext["PAPER: In-Context Learning<br/>Few-Shot Prompting"]:::paper
        DeepSeek["DeepSeek-R1 (Local API)<br/>Text Pipeline"]:::modBlue
        
        P_50Shades["PAPER: 50 Shades of DP<br/>21-Category Visual"]:::paper
        Qwen["Qwen2.5-VL (Local API)<br/>Vision Pipeline"]:::modPurple
    end

    subgraph Phase 4: Countermeasure Execution
        P_Schaefer24["PAPER: Schaefer (2024)<br/>Dynamic Injection"]:::paper
        Mitigate["Mitigation Engine<br/>(content.js)"]:::modRed
    end

    %% Internal routing
    P_Mathur -. "Provides Rules" .-> Regex
    P_AidUI -. "Provides Rules" .-> CSSMath
    
    P_Schaefer -. "Semantic Logic" .-> DeepSeek
    P_InContext -. "Prevents Hallucinations" .-> DeepSeek
    P_50Shades -. "Visual Logic" .-> Qwen
    
    P_Schaefer24 -. "Dictates Strategy" .-> Mitigate

    %% Connections
    DOM -- "HTML Text" --> P_Mathur
    DOM -- "CSS Variables" --> P_AidUI
    VP -- "Base64 Screenshot Image" --> Qwen
    
    Regex -- "Unmatched Ambiguous Text" --> DeepSeek
    CSSMath -- "Unmatched Complex Layouts" --> DeepSeek
    
    DeepSeek -- "JSON Trigger" --> Mitigate
    Qwen -- "JSON Trigger" --> Mitigate
  </div>
  <script>
    mermaid.initialize({ 
        startOnLoad: true, 
        theme: 'dark', 
        flowchart: { 
            useMaxWidth: false, 
            htmlLabels: true, 
            curve: 'linear', /* Linear curves prevent sweeping arcs over titles */
            nodeSpacing: 50,
            rankSpacing: 80
        } 
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

(async () => {
    console.log("Launching Puppeteer for modern dark Mermaid slide screenshot...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set smaller width to make it less wide, but enough height to avoid cutoffs
    await page.setViewport({ width: 1800, height: 1000, deviceScaleFactor: 2 });
    
    await page.goto('file://' + htmlPath);
    
    await new Promise(r => setTimeout(r, 4000));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }
    
    const outPath = path.join(ASSETS_DIR, 'architecture_slide_modern_dark.png');
    
    const element = await page.$('#diagram');
    await element.screenshot({ path: outPath });
    
    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log("Successfully created modern dark architecture slide at: " + outPath);
})();
