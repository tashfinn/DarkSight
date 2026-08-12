const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    
    .infographic-container { display: flex; align-items: center; justify-content: center; gap: 0px; background: transparent; padding: 40px; position: relative;}
    
    /* The connecting line */
    .connection-line { position: absolute; top: 50%; left: 100px; right: 100px; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #f97316); z-index: 0; transform: translateY(-50%); box-shadow: 0 0 15px rgba(255,255,255,0.2); }
    
    .node-container { display: flex; flex-direction: column; align-items: center; z-index: 1; padding: 0 40px; width: 220px; text-align: center; }
    
    .icon-circle { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 20px; background: #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 4px solid; position: relative; }
    
    .node-title { font-size: 22px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
    .node-desc { font-size: 15px; color: #94a3b8; line-height: 1.4; }
    
    /* Specific Colors */
    .dom .icon-circle { border-color: #3b82f6; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); }
    .dom .node-title { color: #60a5fa; }
    
    .nlp .icon-circle { border-color: #8b5cf6; box-shadow: 0 0 30px rgba(139, 92, 246, 0.4); }
    .nlp .node-title { color: #a78bfa; }
    
    .vision .icon-circle { border-color: #f97316; box-shadow: 0 0 30px rgba(249, 115, 22, 0.4); }
    .vision .node-title { color: #fb923c; }

</style>
</head>
<body>

    <div class="infographic-container" id="capture-area">
        
        <div class="connection-line"></div>

        <!-- Node 1 -->
        <div class="node-container dom">
            <div class="icon-circle">⚙️</div>
            <div class="node-title">DOM Engine</div>
            <div class="node-desc">Instant structural parsing & regex matching</div>
        </div>
        
        <!-- Node 2 -->
        <div class="node-container nlp">
            <div class="icon-circle">🧠</div>
            <div class="node-title">NLP Pipeline</div>
            <div class="node-desc">Mistral LLM semantic intent analysis</div>
        </div>
        
        <!-- Node 3 -->
        <div class="node-container vision">
            <div class="icon-circle">👁️</div>
            <div class="node-title">Vision Fallback</div>
            <div class="node-desc">LLaVA structural deception detection</div>
        </div>

    </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'architecture_diagram.html'), htmlContent);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 500, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(__dirname, 'architecture_diagram.html'));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    const elementHandle = await page.$('#capture-area');
    await elementHandle.screenshot({ path: path.join(ASSETS_DIR, 'detection_architecture.png'), omitBackground: true });

    await browser.close();
    console.log('Architecture diagram generated successfully!');
})();
