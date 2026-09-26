const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';
const htmlPath = path.join(__dirname, 'final_mermaid_arch.html');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { background: #ffffff; padding: 50px; font-family: sans-serif; display: inline-block; min-width: 2000px; min-height: 1200px;}
    .mermaid { display: inline-block; background: #ffffff; }
    /* Inject CSS to style subgraphs directly */
    .label { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }
    .cluster rect { fill: #fefce8 !important; stroke: #fde047 !important; stroke-width: 2px !important; }
    .cluster .label { font-weight: bold; font-size: 16px; color: #333; }
  </style>
</head>
<body>
  <div class="mermaid" id="diagram">
    graph LR
    classDef default font-family:'Segoe UI', sans-serif, font-size:14px;
    classDef paper fill:#ffffff,stroke:#94a3b8,stroke-width:1.5px,stroke-dasharray: 5 5,color:#334155
    classDef modBlue fill:#e0f2fe,stroke:#3b82f6,stroke-width:2px,color:#0f172a,font-weight:bold
    classDef modOrange fill:#ffedd5,stroke:#f97316,stroke-width:2px,color:#0f172a,font-weight:bold
    classDef modPurple fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,color:#0f172a,font-weight:bold
    classDef modRed fill:#ffe4e6,stroke:#ef4444,stroke-width:2px,color:#0f172a,font-weight:bold

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

    P_Mathur -. "Provides Rules" .-> Regex
    P_AidUI -. "Provides Rules" .-> CSSMath
    
    P_Schaefer -. "Semantic Logic" .-> DeepSeek
    P_InContext -. "Prevents Hallucinations" .-> DeepSeek
    P_50Shades -. "Visual Logic" .-> Qwen
    
    P_Schaefer24 -. "Dictates Strategy" .-> Mitigate

    DOM -- "Extracted HTML Text" --> P_Mathur
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
        theme: 'default', 
        flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis' } 
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

(async () => {
    console.log("Launching Puppeteer for final Mermaid slide screenshot...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 2560, height: 1440, deviceScaleFactor: 2 });
    
    await page.goto('file://' + htmlPath);
    
    await new Promise(r => setTimeout(r, 4000));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }
    
    const outPath = path.join(ASSETS_DIR, 'architecture_slide_final.png');
    
    const element = await page.$('#diagram');
    await element.screenshot({ path: outPath });
    
    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log("Successfully created final architecture slide at: " + outPath);
})();
