const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.resolve('.');
const SCREENSHOT_DIR = path.resolve('.'); // Save SS in project folder

async function runTests() {
    console.log('Launching browser with extension enabled...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--window-size=1920,1080'
        ],
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        console.log('\n--- 1. Testing Custom HTML ---');
        const page1 = await browser.newPage();
        const customUrl = `file://${path.resolve('tests', 'custom_test.html')}`;
        await page1.goto(customUrl, { waitUntil: 'networkidle2' });
        
        console.log('Waiting 10 seconds for Mistral and AidUI to process...');
        await new Promise(r => setTimeout(r, 10000));
        
        console.log('Taking screenshot...');
        await page1.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_custom_html.png'), fullPage: true });
        
        const html1 = await page1.content();
        const highlights1 = (html1.match(/dp-highlight/g) || []).length;
        const neutralized1 = (html1.match(/dp-neutralized/g) || []).length;
        const hidden1 = (html1.match(/dp-hidden-element/g) || []).length;
        console.log(`Results on Custom HTML: ${highlights1} Highlights, ${neutralized1} Neutralized, ${hidden1} Hidden`);

        console.log('\n--- 2. Testing Amazon ---');
        const page2 = await browser.newPage();
        // Disguise a bit
        await page2.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        
        await page2.goto('https://www.amazon.com/dp/B08F7PTF53', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Timeout/Error on Amazon, but continuing...'));
        
        console.log('Waiting 15 seconds for processing on complex Amazon page...');
        await new Promise(r => setTimeout(r, 15000));
        
        console.log('Taking screenshot...');
        await page2.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_amazon.png'), fullPage: false });
        
        const html2 = await page2.content();
        const highlights2 = (html2.match(/dp-highlight/g) || []).length;
        console.log(`Results on Amazon: ${highlights2} Dark Patterns Highlighted`);

        console.log('\n--- 3. Testing eBay (Alternative E-Commerce) ---');
        const page3 = await browser.newPage();
        await page3.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page3.goto('https://www.ebay.com/itm/334861699943', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Timeout/Error on eBay, but continuing...'));
        
        console.log('Waiting 15 seconds for processing...');
        await new Promise(r => setTimeout(r, 15000));
        
        console.log('Taking screenshot...');
        await page3.screenshot({ path: path.join(SCREENSHOT_DIR, 'screenshot_ebay.png'), fullPage: false });
        
        const html3 = await page3.content();
        const highlights3 = (html3.match(/dp-highlight/g) || []).length;
        console.log(`Results on eBay: ${highlights3} Dark Patterns Highlighted`);
        
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await browser.close();
        console.log('\nTesting Complete. Screenshots saved in project root.');
    }
}

runTests();
