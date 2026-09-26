const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = 'd:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\assets';

async function generateMockup(mode, filename) {
    let dpElementHtml = '';
    
    if (mode === 'highlight') {
        dpElementHtml = `
            <div class="dark-pattern-element darksight-highlight">
                <span style="font-size: 20px;">🔥</span> 
                Hurry! 43 people are viewing this room and only 1 is left at this price!
                
                <div class="darksight-tooltip">
                    <div class="tooltip-header">
                        <div class="tooltip-icon">!</div>
                        <div class="tooltip-title">DarkSight Intercept</div>
                    </div>
                    <div class="tooltip-body">
                        This element is attempting to pressure your decision using artificial scarcity and urgency. Take your time.
                    </div>
                    <div class="tag">Pattern: Fake Urgency</div>
                </div>
            </div>
        `;
    } else if (mode === 'hide') {
        dpElementHtml = `
            <div style="padding: 15px; margin-bottom: 20px; border: 2px dashed #94a3b8; border-radius: 8px; text-align: center; background: #f8fafc; color: #64748b; font-size: 14px; font-weight: bold;">
                [ Element Hidden by DarkSight to Reduce Pressure ]
            </div>
        `;
    } else if (mode === 'switch') {
        dpElementHtml = `
            <div class="dark-pattern-element" style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;">
                <span style="font-size: 20px;">🛡️</span> 
                [Neutralized by DarkSight: This is a popular room.]
            </div>
        `;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: transparent; margin: 0; padding: 50px; display: flex; align-items: center; justify-content: center;}
        
        .browser-window { width: 1000px; background: white; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; position: relative;}
        
        .browser-header { background: #f1f5f9; padding: 15px 20px; display: flex; align-items: center; border-bottom: 1px solid #cbd5e1; }
        .dots { display: flex; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #eab308; }
        .dot-green { background: #22c55e; }
        .url-bar { flex: 1; margin: 0 30px; background: white; padding: 8px 15px; border-radius: 20px; color: #64748b; font-size: 14px; border: 1px solid #e2e8f0; text-align: center;}
        
        .page-content { padding: 50px; display: flex; flex-direction: column; align-items: center; background: #f8fafc;}
        
        .checkout-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; width: 600px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .checkout-card h2 { margin: 0 0 10px 0; font-size: 28px; color: #1e293b; }
        .price { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 30px; }
        
        .btn { background: #3b82f6; color: white; border: none; padding: 15px; border-radius: 8px; width: 100%; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px;}

        .dark-pattern-element { position: relative; padding: 15px; background: #fff1f2; color: #be123c; border-radius: 8px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 16px;}
        
        .darksight-highlight {
            border: 3px solid #ef4444;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.1);
        }
        
        .darksight-tooltip {
            position: absolute;
            top: -110px;
            right: -30px;
            background: #0f172a;
            color: white;
            padding: 20px;
            border-radius: 12px;
            width: 320px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 2px #ef4444;
            z-index: 10;
            font-weight: normal;
        }
        
        .darksight-tooltip::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 40px;
            border-width: 10px 10px 0;
            border-style: solid;
            border-color: #ef4444 transparent transparent transparent;
            display: block;
            width: 0;
        }
        .darksight-tooltip::before {
            content: '';
            position: absolute;
            bottom: -7px;
            right: 41px;
            border-width: 9px 9px 0;
            border-style: solid;
            border-color: #0f172a transparent transparent transparent;
            display: block;
            width: 0;
            z-index: 1;
        }

        .tooltip-header { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 10px;}
        .tooltip-icon { background: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;}
        .tooltip-title { color: #f8fafc; font-weight: bold; font-size: 16px; margin: 0;}
        .tooltip-body { color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0;}
        .tag { display: inline-block; background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-top: 10px; border: 1px solid rgba(239, 68, 68, 0.4);}

    </style>
    </head>
    <body>
        <div class="browser-window" id="capture-area">
            <div class="browser-header">
                <div class="dots">
                    <div class="dot dot-red"></div>
                    <div class="dot dot-yellow"></div>
                    <div class="dot dot-green"></div>
                </div>
                <div class="url-bar">🔒 https://www.example-booking.com/checkout</div>
            </div>
            
            <div class="page-content">
                <div class="checkout-card">
                    <h2>Luxury Ocean View Suite</h2>
                    <div class="price">$250.00 / night</div>
                    
                    ${dpElementHtml}
                    
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Free cancellation before Aug 15th. No prepayment needed.</p>
                    <button class="btn">Complete Booking</button>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const htmlPath = path.join(__dirname, 'temp_mockup.html');
    fs.writeFileSync(htmlPath, htmlContent);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    await page.goto('file://' + htmlPath);
    
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    const elementHandle = await page.$('#capture-area');
    await elementHandle.screenshot({ path: path.join(ASSETS_DIR, filename), omitBackground: true });

    await browser.close();
    fs.unlinkSync(htmlPath);
    console.log(`Generated ${filename} successfully!`);
}

(async () => {
    await generateMockup('highlight', 'countermeasure_highlight.png');
    await generateMockup('hide', 'countermeasure_hide.png');
    await generateMockup('switch', 'countermeasure_switch.png');
})();
