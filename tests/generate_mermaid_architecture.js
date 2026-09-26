const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';
const htmlPath = path.join(__dirname, 'mermaid_arch.html');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; padding: 20px;}
    .mermaid { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; width: 100%; text-align: center; }
  </style>
</head>
<body>
  <div class="mermaid">
    graph LR
    classDef paper fill:#1e293b,stroke:#64748b,stroke-width:2px,stroke-dasharray: 5 5,color:#cbd5e1
    classDef module fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#fff
    classDef moduleRed fill:#be123c,stroke:#9f1239,stroke-width:2px,color:#fff
    classDef modulePurple fill:#7e22ce,stroke:#6b21a8,stroke-width:2px,color:#fff
    classDef moduleOrange fill:#b45309,stroke:#92400e,stroke-width:2px,color:#fff
    classDef default font-size:16px;

    subgraph P1[Phase 1: Data Ingestion]
        DOM["DOM Extractor<br/>(content.js)"]:::module
        VP["Viewport Capture<br/>(background.js)"]:::module
    end

    subgraph P2[Phase 2: Zero-Latency Heuristics]
        P_Mathur["PAPER: Mathur (2019)<br/>Urgency/Scarcity"]:::paper
        Regex["Fast Regex Scan"]:::moduleOrange
        
        P_AidUI["PAPER: AidUI<br/>False Hierarchy Math"]:::paper
        CSSMath["Structural CSS Math"]:::moduleOrange
    end

    subgraph P3[Phase 3: DP Sentinel Hybrid AI]
        P_Schaefer["PAPER: Schaefer (2023)<br/>8-Category Semantic"]:::paper
        P_InContext["PAPER: In Context Learning<br/>Few-Shot Prompts"]:::paper
        DeepSeek["DeepSeek-R1 (Local)<br/>Text Pipeline"]:::module
        
        P_50Shades["PAPER: 50 Shades of DP<br/>21-Category Visual"]:::paper
        Qwen["Qwen2.5-VL (Local)<br/>Vision Pipeline"]:::modulePurple
    end

    subgraph P4[Phase 4: Countermeasure Execution]
        P_Schaefer24["PAPER: Schaefer (2024)<br/>Dynamic Countermeasures"]:::paper
        Mitigate["Mitigation Engine<br/>(content.js)"]:::moduleRed
    end

    P_Mathur -.-> Regex
    P_AidUI -.-> CSSMath
    
    P_Schaefer -.-> DeepSeek
    P_InContext -.-> DeepSeek
    P_50Shades -.-> Qwen
    
    P_Schaefer24 -.-> Mitigate

    DOM -- "HTML Text" --> Regex
    DOM -- "CSS Variables" --> CSSMath
    VP -- "Base64 Screenshot" --> Qwen
    
    Regex -- "Unmatched Ambiguous Text" --> DeepSeek
    CSSMath -- "Unmatched Complex Layouts" --> DeepSeek
    
    DeepSeek -- "JSON Trigger" --> Mitigate
    Qwen -- "JSON Trigger" --> Mitigate
  </div>
  <script>
    mermaid.initialize({ 
        startOnLoad: true, 
        theme: 'dark', 
        flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis' } 
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent);

(async () => {
    console.log("Launching Puppeteer for mermaid slide screenshot...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    
    await page.goto('file://' + htmlPath);
    
    // Wait for mermaid to render
    await new Promise(r => setTimeout(r, 4000));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }
    
    const outPath = path.join(ASSETS_DIR, 'architecture_slide_horizontal_clean.png');
    await page.screenshot({ path: outPath, fullPage: true });
    
    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log("Successfully created clean horizontal architecture slide at: " + outPath);
})();
