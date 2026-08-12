const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.resolve('.');
const SCREENSHOT_DIR = path.resolve('test_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR);
}

const TEST_SITES = [
    { name: 'Daraz', url: 'https://www.daraz.com.bd/' },
    { name: 'AliExpress', url: 'https://www.aliexpress.com/' },
    { name: 'Booking', url: 'https://www.booking.com/searchresults.html?ss=London' },
    { name: 'Walmart', url: 'https://www.walmart.com/shop/deals' },
    { name: 'Temu', url: 'https://www.temu.com/' }
];

async function runComprehensiveTests() {
    console.log('Launching HEADFUL browser for comprehensive testing...');
    
    const browser = await puppeteer.launch({
        headless: false, // Visible to bypass bots
        defaultViewport: null,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--start-maximized'
        ]
    });

    try {
        for (const site of TEST_SITES) {
            console.log(`\n--- Testing ${site.name} ---`);
            const page = await browser.newPage();
            
            // Basic anti-bot
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
            await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });

            console.log(`Navigating to ${site.url}...`);
            await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Timeout, continuing...'));
            
            // Scroll to load lazy content
            await page.evaluate(() => window.scrollBy(0, 1500));
            
            // Wait for LLM, Mathur, and AidUI to process
            console.log('Waiting 30 seconds for heuristics and Ollama models to process page...');
            await new Promise(r => setTimeout(r, 30000));
            
            // Count detected patterns
            const html = await page.content();
            const highlightCount = (html.match(/dp-highlight/g) || []).length;
            const visualCount = (html.match(/dp-visual-element/g) || []).length;
            console.log(`Found ${highlightCount} Text/Structural Patterns, ${visualCount} Visual Patterns.`);

            // Try to trigger tooltip on the first highlighted element
            try {
                const firstHighlight = await page.$('.dp-highlight');
                if (firstHighlight) {
                    console.log('Hovering over the first detected pattern to trigger explanation tooltip...');
                    await firstHighlight.hover();
                    // Wait a moment for tooltip animation/rendering
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (e) {
                console.log('Could not hover elements (maybe hidden).');
            }
            
            console.log('Taking screenshot...');
            const ssPath = path.join(SCREENSHOT_DIR, `${site.name}_result.png`);
            await page.screenshot({ path: ssPath });
            
            await page.close();
        }
        
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await browser.close();
        console.log('\nComprehensive Testing Complete. Screenshots saved in test_screenshots folder.');
    }
}

runComprehensiveTests();
