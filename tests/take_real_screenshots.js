const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EXTENSION_PATH = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight';
const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: Arial, sans-serif; background: #fff; padding: 50px; }
    .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 30px; }
    .price { font-size: 24px; font-weight: bold; color: #b12704; margin-top: 10px; margin-bottom: 15px;}
    .btn { background: #ffd814; border: 1px solid #fcd200; border-radius: 100px; color: #111; padding: 10px 20px; cursor: pointer; font-weight: bold; }
</style>
</head>
<body>
    <h2>Checkout Process</h2>
    <div class="card" id="target-element">
        <h3 style="margin-top:0;">Premium Package</h3>
        <div class="price">$199.99</div>
        <p style="color: #c45500; font-weight: bold; font-size: 16px;">Ends in 05:00 mins! Only 2 left in stock!</p>
        <button class="btn">Checkout Now</button>
    </div>
</body>
</html>
`;

const htmlPath = path.join(__dirname, 'real_test.html');
fs.writeFileSync(htmlPath, htmlContent);

(async () => {
    console.log("Launching REAL Chrome with DarkSight Extension loaded...");
    const browser = await puppeteer.launch({
        headless: false, // User requested visible browser
        defaultViewport: null,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--window-size=1200,800'
        ]
    });

    const page = await browser.newPage();
    
    // Wait a moment for extension to fully boot
    await new Promise(r => setTimeout(r, 2000));

    console.log("Navigating to test page...");
    await page.goto('file://' + htmlPath);
    await new Promise(r => setTimeout(r, 3000)); // Wait for DarkSight HLE to apply

    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    // Capture HLE (Highlight + Explain)
    const element = await page.$('#target-element');
    console.log("Capturing HLE (Highlight & Explain)...");
    await element.screenshot({ path: path.join(ASSETS_DIR, 'actual_hle.png') });

    // Connect to Extension Background Worker to change mode
    const targets = await browser.targets();
    const bgTarget = targets.find(t => t.type() === 'service_worker' && t.url().includes('background.js'));
    
    if (bgTarget) {
        const worker = await bgTarget.worker();
        
        console.log("Switching mode to HD (Hide)...");
        await worker.evaluate(() => {
            chrome.storage.local.set({dp_mode: 'HD'});
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateMode", mode: "HD"});
            });
        });
        
        await new Promise(r => setTimeout(r, 2000));
        console.log("Capturing HD (Hide)...");
        await element.screenshot({ path: path.join(ASSETS_DIR, 'actual_hd.png') });

        console.log("Switching mode to SW (Switch)...");
        await worker.evaluate(() => {
            chrome.storage.local.set({dp_mode: 'SW'});
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateMode", mode: "SW"});
            });
        });
        
        await new Promise(r => setTimeout(r, 2000));
        console.log("Capturing SW (Switch)...");
        await element.screenshot({ path: path.join(ASSETS_DIR, 'actual_sw.png') });
    } else {
        console.log("Could not find background worker to change modes!");
    }

    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log("Screenshots saved as actual_hle.png, actual_hd.png, actual_sw.png in assets folder!");
})();
