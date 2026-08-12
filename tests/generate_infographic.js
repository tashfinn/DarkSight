const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0b1121; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    
    .infographic-container { display: flex; gap: 40px; background: #131c31; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    
    .panel { display: flex; flex-direction: column; align-items: center; width: 350px; }
    .panel-title { font-size: 28px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
    .detection-title { color: #3b82f6; }
    .countermeasure-title { color: #10b981; }
    
    .browser-window { background: white; border-radius: 8px; width: 100%; overflow: hidden; color: #333; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .browser-header { background: #e2e8f0; height: 30px; display: flex; align-items: center; padding: 0 10px; gap: 5px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }
    
    .browser-content { padding: 30px 20px; text-align: center; }
    .product-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
    
    /* Detection Specifics */
    .dark-pattern-element { border: 3px dashed #ef4444; background: #fee2e2; padding: 15px; border-radius: 6px; position: relative; }
    .dp-text { color: #b91c1c; font-weight: bold; font-size: 16px; }
    
    .scan-line { position: absolute; top: 50%; left: -10px; right: -10px; height: 2px; background: #3b82f6; box-shadow: 0 0 10px #3b82f6; }
    
    .tooltip { position: absolute; bottom: -45px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
    .tooltip::after { content: ''; position: absolute; top: -5px; left: 50%; transform: translateX(-50%); border-width: 0 6px 6px; border-style: solid; border-color: transparent transparent #ef4444; }

    /* Countermeasure Specifics */
    .mitigated-element { border: 3px solid #10b981; background: #ecfdf5; padding: 15px; border-radius: 6px; position: relative; display: flex; align-items: center; justify-content: center; height: 50px;}
    .mitigated-text { color: #047857; font-weight: bold; font-size: 16px; }
    
    .shield-icon { font-size: 24px; margin-right: 10px; }

    .tooltip-green { position: absolute; bottom: -45px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
    .tooltip-green::after { content: ''; position: absolute; top: -5px; left: 50%; transform: translateX(-50%); border-width: 0 6px 6px; border-style: solid; border-color: transparent transparent #10b981; }
    
    .arrow { color: #64748b; font-size: 40px; display: flex; align-items: center; padding-top: 50px; }

</style>
</head>
<body>

    <div class="infographic-container" id="capture-area">
        
        <!-- Phase 1: Detection -->
        <div class="panel">
            <div class="panel-title detection-title">1. Detection</div>
            <div class="browser-window">
                <div class="browser-header">
                    <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
                </div>
                <div class="browser-content">
                    <div class="product-title">Checkout Page</div>
                    
                    <div class="dark-pattern-element">
                        <div class="scan-line"></div>
                        <div class="dp-text">🔥 HURRY! Only 1 item left!</div>
                        <div class="tooltip">Identified: Scarcity Dark Pattern</div>
                    </div>
                    
                    <div style="margin-top: 60px; padding: 10px; background: #2563eb; color: white; border-radius: 4px; font-weight: bold;">Complete Purchase</div>
                </div>
            </div>
            <p style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 16px;">AI Engine scans DOM & Visuals<br>to flag manipulative content.</p>
        </div>
        
        <div class="arrow">➔</div>

        <!-- Phase 2: Countermeasure -->
        <div class="panel">
            <div class="panel-title countermeasure-title">2. Countermeasure</div>
            <div class="browser-window">
                <div class="browser-header">
                    <div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div>
                </div>
                <div class="browser-content">
                    <div class="product-title">Checkout Page</div>
                    
                    <div class="mitigated-element">
                        <span class="shield-icon">🛡️</span>
                        <div class="mitigated-text">Deceptive Element Blocked</div>
                        <div class="tooltip-green">Mitigated: User Protected</div>
                    </div>
                    
                    <div style="margin-top: 60px; padding: 10px; background: #2563eb; color: white; border-radius: 4px; font-weight: bold;">Complete Purchase</div>
                </div>
            </div>
            <p style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 16px;">DarkSight actively neutralizes<br>the threat to protect users.</p>
        </div>

    </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'infographic.html'), htmlContent);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 2 }); // High res
    await page.goto('file://' + path.join(__dirname, 'infographic.html'));
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    const elementHandle = await page.$('#capture-area');
    await elementHandle.screenshot({ path: path.join(ASSETS_DIR, 'detailed_concept_infographic.png'), omitBackground: true });

    await browser.close();
    console.log('Detailed infographic generated successfully!');
})();
