const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const htmlPath = path.join(__dirname, 'phase1_short.html');

async function renderDiagram() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // 1. Full Slide Image
    const fullSlidePath = path.join(ASSETS_DIR, 'Phase1_Slide18_Theme.png');
    const bodyElem = await page.$('body');
    await bodyElem.screenshot({
        path: fullSlidePath,
        omitBackground: false
    });

    // 2. Card-Only Image
    const cardPath = path.join(ASSETS_DIR, 'Phase1_Diagram_Card_Only.png');
    const cardElem = await page.$('#card');
    await cardElem.screenshot({
        path: cardPath,
        omitBackground: false
    });

    console.log(`✅ Saved Full Slide: ${fullSlidePath}`);
    console.log(`✅ Saved Card Only: ${cardPath}`);
    await browser.close();
}

renderDiagram().catch(err => {
    console.error('Error generating short diagram:', err);
});
