const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');

const EXTENSION_PATH = path.resolve('.');
const SCREENSHOT_DIR = path.resolve('test_screenshots');

async function closePopups(page) {
    try {
        const closeSelectors = [
            '.close-btn', '.btn-close', '.ui-window-close', '.ui-dialog-titlebar-close',
            '[aria-label="Close"]', '[aria-label="Dismiss"]', 'button:has-text("No thanks")',
            '.bui-modal__close', '.b-button--close', '.modal-close',
            '.camp-pop-close', '#bui-empty-state-close', 'img[src*="close"]', '.pop-close',
            '.a-button-close', '#nav-main-close'
        ];
        
        for (const selector of closeSelectors) {
            const elements = await page.$$(selector);
            for (const el of elements) {
                if (await el.isIntersectingViewport()) {
                    await el.click();
                    console.log(`Closed a popup using selector: ${selector}`);
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    } catch (e) {
        // Ignore errors
    }
}

async function runInteractiveRecording() {
    console.log('Launching HEADFUL browser for Amazon interactive recording...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--start-maximized',
            '--autoplay-policy=no-user-gesture-required'
        ]
    });

    try {
        const page = await browser.newPage();
        const recorder = new PuppeteerScreenRecorder(page, { fps: 24, videoFrame: { width: 1920, height: 1080 } });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });

        console.log('\n--- Testing Amazon Interactive ---');
        await recorder.start(path.join(SCREENSHOT_DIR, 'amazon_session.mp4'));
        await page.goto('https://www.amazon.com/gp/goldbox', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        
        await new Promise(r => setTimeout(r, 8000));
        await closePopups(page);
        
        console.log('Scrolling naturally to load elements...');
        for(let i=0; i<4; i++) {
            await page.evaluate(() => window.scrollBy(0, 600));
            await new Promise(r => setTimeout(r, 1500));
        }

        console.log('Waiting for LLM and Heuristics processing (30s)...');
        await new Promise(r => setTimeout(r, 30000));

        try {
            const highlights = await page.$$('.dp-highlight');
            let hovered = false;
            for (const highlight of highlights) {
                if (await highlight.isIntersectingViewport()) {
                    console.log('Hovering over a VISIBLE highlighted pattern for explanation...');
                    await highlight.hover();
                    hovered = true;
                    await new Promise(r => setTimeout(r, 6000)); 
                    break;
                }
            }
            if (!hovered && highlights.length > 0) {
                 console.log('Scrolling to a highlighted pattern and hovering...');
                 await highlights[0].evaluate(b => b.scrollIntoView({block: "center"}));
                 await new Promise(r => setTimeout(r, 1000));
                 await highlights[0].hover();
                 await new Promise(r => setTimeout(r, 6000));
            }
        } catch(e) {
            console.log('Error hovering:', e);
        }
        
        await new Promise(r => setTimeout(r, 5000));
        
        await recorder.stop();
        
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await browser.close();
        console.log('\nInteractive Recording Complete. Videos saved in test_screenshots folder.');
    }
}

runInteractiveRecording();
