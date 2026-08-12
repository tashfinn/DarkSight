const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: Arial, sans-serif; background: #fff; display: flex; flex-direction: column; gap: 50px; padding: 20px; }
    .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    
    /* Urgency */
    .urgency { border-color: #e77600; background: #fffaf4; }
    .timer { color: #cc0c39; font-weight: bold; font-size: 22px; display: flex; align-items: center; gap: 5px; margin-top: 5px; }
    .progress-bar { background: #ffd8d8; height: 10px; border-radius: 5px; margin-top: 10px; overflow: hidden; }
    .progress-fill { background: #cc0c39; width: 85%; height: 100%; }
    
    /* Scarcity */
    .scarcity { color: #b12704; font-weight: bold; font-size: 18px; margin-top: 5px; }
    .price { font-size: 24px; font-weight: bold; margin-top: 10px; }
    
    /* Social Proof */
    .social-proof { background: #ffebeb; border: 1px solid #ffc0c0; color: #d32f2f; padding: 12px; font-weight: bold; border-radius: 4px; display: flex; align-items: center; gap: 8px; margin-top: 10px;}
    
    /* Misdirection */
    .misdirection { display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center; }
    .btn-huge { background: #ffd814; border: 1px solid #fcd200; border-radius: 100px; color: #111; padding: 12px 24px; font-size: 16px; cursor: pointer; width: 100%; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .link-tiny { color: #565959; font-size: 12px; text-decoration: underline; cursor: pointer; margin-top: 10px; }
</style>
</head>
<body>

    <div id="urgency-container" class="card urgency">
        <div style="font-size:16px; color:#c45500; font-weight:bold;">Lightning Deal</div>
        <div class="price">$199.99</div>
        <div class="timer">Ends in 03:14:59</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
        <div style="font-size:12px; color:#555; margin-top:5px;">85% Claimed</div>
    </div>

    <div id="scarcity-container" class="card">
        <div style="font-size:18px; font-weight:bold; color: #0f1111;">Wireless Noise Cancelling Headphones</div>
        <div class="price">$249.00</div>
        <div class="scarcity">Only 2 left in stock - order soon.</div>
    </div>

    <div id="social-proof-container" class="card">
        <div style="font-size:18px; font-weight:bold; color: #0071c2;">Deluxe King Room</div>
        <div style="font-size:14px; color: #555; margin-top:5px;">Free cancellation</div>
        <div class="social-proof">
            <span style="font-size:18px;">🔥</span> 45 people are looking at this right now
        </div>
    </div>

    <div id="misdirection-container" class="card misdirection">
        <div style="font-size:18px; font-weight:bold; color: #0f1111;">Protect Your Purchase</div>
        <p style="font-size:14px; color: #555; margin:0;">Add a 2-year protection plan for $29.99</p>
        <button class="btn-huge">Add Protection</button>
        <a class="link-tiny">No thanks, I'll risk it</a>
    </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'mock_patterns.html'), htmlContent);

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('file://' + path.join(__dirname, 'mock_patterns.html'));
    
    // Ensure assets dir exists
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    const elements = [
        { id: '#urgency-container', name: 'urgency_ss.png' },
        { id: '#scarcity-container', name: 'scarcity_ss.png' },
        { id: '#social-proof-container', name: 'social_proof_ss.png' },
        { id: '#misdirection-container', name: 'misdirection_ss.png' }
    ];

    for (const el of elements) {
        const elementHandle = await page.$(el.id);
        await elementHandle.screenshot({ path: path.join(ASSETS_DIR, el.name) });
    }

    await browser.close();
    console.log('Clean individual screenshots generated successfully!');
})();
