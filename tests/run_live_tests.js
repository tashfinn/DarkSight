const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve('.');
const SCREENSHOT_DIR = path.resolve('.'); // Save SS in project folder

async function runLiveTests() {
    console.log('Launching HEADFUL browser so you can see it and bypass bot detection...');
    
    // Launching headful (visible) Chrome
    const browser = await puppeteer.launch({
        headless: false, // Make it visible
        defaultViewport: null, // Use full available window size
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--start-maximized'
        ]
    });

    try {
        console.log('\n--- 1. Testing Amazon Today\'s Deals ---');
        const page1 = await browser.newPage();
        
        // Anti-bot evasions
        await page1.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page1.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        console.log('Navigating to Amazon Deals...');
        await page1.goto('https://www.amazon.com/gp/goldbox', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Timeout, but continuing'));
        
        // Scroll down a bit to load lazy elements
        await page1.evaluate(() => window.scrollBy(0, 1000));
        
        console.log('Waiting 25 seconds for you to observe and for LLM/Heuristics to process...');
        await new Promise(r => setTimeout(r, 25000)); // 25 seconds to process
        
        console.log('Taking screenshot...');
        await page1.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_amazon_offers.png') });
        
        const html1 = await page1.content();
        const highlights1 = (html1.match(/dp-highlight/g) || []).length;
        console.log(`Results on Amazon Offers: ${highlights1} Dark Patterns Highlighted`);

        console.log('\n--- 2. Testing eBay Deals ---');
        const page2 = await browser.newPage();
        
        await page2.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page2.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        console.log('Navigating to eBay Deals...');
        await page2.goto('https://www.ebay.com/deals', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Timeout, but continuing'));
        
        // Scroll down
        await page2.evaluate(() => window.scrollBy(0, 800));
        
        console.log('Waiting 25 seconds for processing...');
        await new Promise(r => setTimeout(r, 25000));
        
        console.log('Taking screenshot...');
        await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_ebay_offers.png') });
        
        const html2 = await page2.content();
        const highlights2 = (html2.match(/dp-highlight/g) || []).length;
        console.log(`Results on eBay Offers: ${highlights2} Dark Patterns Highlighted`);
        
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await browser.close();
        console.log('\nTesting Complete. Screenshots saved in project root.');
    }
}

runLiveTests();
