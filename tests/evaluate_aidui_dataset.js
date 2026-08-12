const fs = require('fs');
const path = require('path');
const http = require('http');

const DATASET_ROOT = path.resolve(__dirname, '../datasets/AidUI/evaluation/evaluation_dataset');
const PROGRESS_FILE = path.resolve(__dirname, 'aidui_evaluation_progress.json');

function buildVisionPrompt() {
return `
Kindly conduct a comprehensive analysis of the given image to identify any deceptive patterns, employing the provided taxonomy. While examining the image, consider the following categories of deceptive patterns:
1. **Nagging**: Spot any repetitive and unexpected pop-up windows that disrupt user activities. 
2. **Roach Motel**: Identify scenarios where opting in is easy, but opting out is complicated or obscure. 
3. **Price Comparison Prevention**: Detect any elements that hinder direct comparisons of prices or plans. 
4. **Intermediate Currency**: Look for instances where virtual currencies are used to obscure real financial costs. 
5. **Forced Continuity**: Examine if users are charged after a trial period ends without clear advance notice. 
6. **Hidden Costs**: Check for the late disclosure of additional costs such as taxes, delivery, or service fees. 
7. **Sneak into Basket**: Identify if items not actively selected by users are automatically added to the shopping cart. 
8. **Hidden Information**: Ensure that essential options or actions are not concealed or difficult to find. 
9. **Preselection**: Look for cases where options are preselected by default, without explicit user consent. 
10. **Toying with Emotion**: Evaluate design elements such as language, colors, or styles that are intended to elicit emotional responses and pressure users into making decisions. 
11. **False Hierarchy**: Observe if any option is made to appear more significant than other equivalent choices. 
12. **Disguised Ads**: Detect if advertisements are designed to resemble normal content. 
13. **Tricked Questions**: Identify any confusing or misleadingly worded questions. 
14. **Small Close Button**: Check if close buttons are too small to be easily located or clicked.
15. **Social Pyramid**: Look for incentives encouraging users to share content with friends for rewards. 
16. **Privacy Zuckering**: Assess if default options necessitate sharing unnecessary personal information. 
17. **Gamification**: Note if users are required to repeatedly perform tasks to earn rewards. 
18. **Countdown on Ads**: Identify if timers restrict users from closing ads immediately. 
19. **Watch Ads to Unlock**: Check if users must watch advertisements to access particular features or rewards. 
20. **Pay to Avoid Ads**: Note if users are charged to remove adverts. 
21. **Forced Enrollment**: Determine if users must sign up or sign in before they can utilize the service.
Additional steps for a thorough review: - **UI Color and Text**: Assess the user interface design elements such as color schemes and text that might manipulate user decisions. Focus particularly on color contrasts and overall readability. - **Information Visibility**: Verify that critical information is easily accessible without reliance on hidden links or convoluted navigation paths. - **User Experience Flow**: Evaluate the user journey to ensure smooth navigation with minimal interruptions. - **Call-to-Action Design**: Examine the visibility and clarity of call-to-action buttons and links compared to dismissive or less prominent options. - **Consistency**: Ensure that design elements and user expectations remain consistent across different pages or sections.

Your detailed review and precise identification of any deceptive patterns in this image are crucial to understand their impact and effectiveness.

Please return your findings in the following strict format (return ONLY the category name if found, or NORMAL if none found):
Category: [Insert Category Name or NORMAL]
Explanation: [A short 1-sentence explanation]
`;
}

async function callOllamaVision(prompt, base64Image) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 11434,
            path: '/api/generate',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const lines = data.trim().split('\n');
                    let fullResponse = '';
                    for (const line of lines) {
                        const parsed = JSON.parse(line);
                        fullResponse += parsed.response;
                    }
                    resolve(fullResponse);
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.write(JSON.stringify({
            model: "qwen2.5vl",
            prompt: prompt,
            images: [base64Image],
            stream: true,
            options: {
                temperature: 0.1,
                num_ctx: 2048
            }
        }));
        req.end();
    });
}

function processDirectory(type, progress, allTasks) {
    const jsonPath = path.join(DATASET_ROOT, type, 'result.json');
    if (!fs.existsSync(jsonPath)) {
        console.warn(`JSON missing: ${jsonPath}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const categoryMap = {};
    if (data.categories) {
        data.categories.forEach(c => categoryMap[c.id] = c.name);
    }

    // Map annotations to image IDs
    const imageAnnotations = {};
    if (data.annotations) {
        data.annotations.forEach(ann => {
            if (!imageAnnotations[ann.image_id]) {
                imageAnnotations[ann.image_id] = new Set();
            }
            if (categoryMap[ann.category_id]) {
                imageAnnotations[ann.image_id].add(categoryMap[ann.category_id]);
            }
        });
    }

    data.images.forEach(img => {
        let gt = Array.from(imageAnnotations[img.id] || []);
        if (gt.length === 0) gt = ["NO DP"];
        
        const absoluteImgPath = path.join(DATASET_ROOT, type, img.file_name);
        allTasks.push({
            id: `${type}_${img.id}`,
            type: type,
            filename: absoluteImgPath,
            groundTruth: gt
        });
    });
}

async function main() {
    let progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        console.log(`Loaded ${Object.keys(progress).length} previously processed items from checkpoint.`);
    }

    const allTasks = [];
    processDirectory('web', progress, allTasks);
    processDirectory('mobile', progress, allTasks);
    
    console.log(`Total images to process: ${allTasks.length}`);
    
    for (let i = 0; i < allTasks.length; i++) {
        const task = allTasks[i];
        
        if (progress[task.id]) continue;
        
        if (!fs.existsSync(task.filename)) {
            console.error(`Image not found: ${task.filename}`);
            continue;
        }

        console.log(`[${i+1}/${allTasks.length}] Processing ${task.id}...`);
        try {
            const imgBuffer = fs.readFileSync(task.filename);
            const base64Image = imgBuffer.toString('base64');
            const prompt = buildVisionPrompt();
            
            const llmResult = await callOllamaVision(prompt, base64Image);
            
            let detectedCat = "NORMAL";
            let explanation = "";
            
            const lines = llmResult.split('\n');
            for(let line of lines) {
                if (line.toLowerCase().startsWith('category:')) {
                    detectedCat = line.split(':')[1].trim();
                }
                if (line.toLowerCase().startsWith('explanation:')) {
                    explanation = line.split(':')[1].trim();
                }
            }

            progress[task.id] = {
                type: task.type,
                filename: task.filename,
                groundTruth: task.groundTruth,
                llmCategory: detectedCat,
                llmExplanation: explanation,
                rawResponse: llmResult
            };
            
            fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
            console.log(`  -> Saved result for ${task.id}: ${detectedCat}`);
            
        } catch (e) {
            console.error(`Error connecting to Ollama at image ${task.id}:`, e.message);
            console.log("Pausing execution. Restart the script when Ollama is ready.");
            process.exit(1);
        }
    }
    
    console.log("\n==================================");
    console.log("VISION EVALUATION COMPLETE!");
    console.log("Run `node tests/generate_aidui_report.js` to create the markdown report.");
}

main();
