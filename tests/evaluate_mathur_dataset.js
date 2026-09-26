const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const http = require('http');

const CSV_PATH = path.resolve(__dirname, '../datasets/dark-patterns/data/final-dark-patterns/dark-patterns.csv');
const PROGRESS_FILE = path.resolve(__dirname, 'mathur_evaluation_progress.json');

// --- 1. EXTRACTED DARK SIGHT LOGIC ---
function fastHeuristicScan(text) {
    const t = text.toLowerCase();
    if (t.includes("timer") || /(flash|mega|super|black friday)\s+sale/.test(t) || /sale is live/.test(t) || /limited time deal/.test(t) || /ends in \d+ (hrs|hours|mins)/.test(t)) {
        return "Urgency";
    }
    if (/only \d+ left/.test(t) || /selling fast/.test(t) || /high demand/.test(t) || /almost gone/.test(t) || /sold out soon/.test(t)) {
        return "Scarcity";
    }
    if (/9[0-9]% off/.test(t) || /flat 50% off your 1st order/.test(t) || /massive savings/.test(t)) {
        return "Fake Discount";
    }
    if (/(people|users|customers)\s+(bought|viewing|looking)/.test(t) || /in \d+ people'?s (cart|bag|shopping bag)/.test(t) || /trending (product|item)/.test(t)) {
        return "Social Proof";
    }
    return null;
}

function buildPrompt(texts) {
return `
Classify each of the following UI texts.

Return format for each text:
ID | Category

Context:

Definition of Dark Patterns

Dark patterns are deceptive user interface design techniques intentionally created to manipulate users into making decisions they might not otherwise make. These patterns exploit cognitive biases, hide critical information, create artificial pressure, or make certain actions intentionally difficult.
Your task is to classify whether a given text represents a dark pattern and determine which category it belongs to.

Classification of Dark Patterns

The system recognizes the following eight categories of dark patterns:

1. Misdirection
2. Urgency
3. Scarcity
4. Social Proof
5. Obstruction
6. Forced Action
7. Sneaking
8. Fake Discount

If the text does not belong to any of these categories, it should be classified as Not Dark Pattern.

Definition of Category 1 — Misdirection:
Misdirection occurs when a design intentionally draws the user’s attention toward one element to distract them from another important element. This may involve misleading visuals, confusing wording, or emotional manipulation (e.g., guilt or shame) to influence user choices.

Definition of Category 2 — Urgency:
Urgency occurs when users are pressured to act quickly using time-related pressure such as countdown timers, limited-time offers, messages indicating that an offer will expire soon, or highly aggressive promotional banners (e.g. "FLASH SALE", "SALE IS LIVE NOW", "MEGA SALE") that create artificial pressure to buy immediately.

Definition of Category 3 — Scarcity:
Scarcity occurs when users are pressured by suggesting limited availability, such as “Only 2 left in stock”, “Selling fast”, or “High demand”.

Definition of Category 4 — Social Proof:
Social Proof involves showing activity from other users to influence decisions. Examples include messages like “200 people bought this today”, “Trending product”, or testimonials with unclear sources.

Definition of Category 5 — Obstruction:
Obstruction occurs when a system makes certain actions unnecessarily difficult. A common example is making it easy to sign up for a service but difficult to cancel or unsubscribe.

Definition of Category 6 — Forced Action:
Forced Action occurs when users must perform an unwanted action (e.g., creating an account, sharing personal information, or enabling notifications) in order to access content or functionality.

Definition of Category 7 — Sneaking:
Sneaking involves hiding or delaying important information from the user. Examples include hidden fees appearing during checkout, automatically adding items to a cart, or enrolling users in subscriptions without clear consent.

Definition of Category 8 — Fake Discount:
Fake Discount occurs when a crossed-out original price is accompanied by highly suspicious, unbelievable claims (e.g., "99% OFF today only!"), OR when massive generic discounts (e.g. "Flat 50% off your 1st order", "15% off entire menu") are prominently advertised in banners to aggressively bait users. Standard crossed-out prices without aggressive text are common and should not be flagged.

Definition of Category 9 — NORMAL (Not Dark Pattern):
If the given text does not demonstrate any manipulative design strategy described above, or if it is a standard product name, classify it as NORMAL.

---

TRAINING EXAMPLES (Few-Shot Prompting):

Misdirection
- "No, I'll rather pay full price"
- "No thanks, I dont want a discount"

Urgency
- "Items reserved for 15:00"
- "1 day 08:15:25"
- "Limited time deal"
- "FLASH SALE"
- "SALE IS LIVE NOW"
- "MEGA EID SALE"

Scarcity
- "1 LEFT"
- "87% offers claimed. Hurry up!"

Social Proof
- "IN 43 PEOPLE'S SHOPPING BAG"
- "Armin Dinovic bought 10M Runescape 3 Gold Order total: 3,70 C About 10 seconds ago"

Obstruction
- "You may change the items in your order, or cancel the Smartship at anytime, up until 3 days prior to the scheduled ship date of your Smartship by calling Customer Service at 1-800-518-0284"
- "We may also disclose your information to third parties who may contact you with details of other products and services which may be of interest. If you do not want your name and mailing details made available in this way please email opt-out@nextdirect.com"

Forced Action
- "I would like to join Backstage Pass & agree to the Terms & Conditions & to receive emails & other promotional offers"
- "I agree to receive marketing emails from Natural Life and agree to our Privacy Policy and terms of use"

Sneaking
- "Order Subtotal $19.99 Standard Delivery $12.99 Care & Handling $2.99 Tax $2.38 Total $38.35 Savings Today $10.00"
- "Purchase protection added"

Fake Discount
- "Original Price $1,199.00 - Yours for $19.99! (98% OFF) CLAIM NOW!"
- "Was ৳5000, Now ৳50 (99% Savings!)"
- "Flat 50% off your 1st order"
- "15% off entire menu"

NORMAL (Not Dark Pattern)
- "Deals & Discounts"
- "More Buying Choices"
- "Add to cart"
- "May 26 - Jun 2"
- "Product specifications"
- "Mini Electric Massage Gun Portable Deep Tissue"
- "Zepto car shampoo sparkling clean vehicle"
- "Fashion sports led watch, upgraded version"
- "6 mutual friends"
- "John liked this post"
- "3 comments"
- "Keyboard & Mouse"
- "Sort by: Price High to Low"
- "Filter by Brand"
- "451 reviews"
- "1,304 reviews"
- "Getaway Deal"
- "BDT 10,849 BDT 6,509"

---

Processing Instructions:

1. Carefully analyze each text given below.
2. Determine whether it contains manipulative design characteristics.
3. Compare the text with the definitions and training examples of each dark pattern category.
Output Format:
Return EXACTLY one line per input text in the exact format: 
ID | Category: A short 1-sentence explanation of why it is manipulative.

If it is completely normal, not manipulative, or looks like random OCR garbage/fragments, return exactly: 
ID | NORMAL

Example Output:
0 | Urgency: The text uses a countdown timer to create artificial pressure to buy.
1 | NORMAL
2 | Sneaking: The text indicates hidden costs were added without consent.

CRITICAL RULES FOR EXPLANATIONS (MUST FOLLOW EXACTLY):
1. YOU MUST PROCESS EVERY SINGLE INPUT TEXT. Return exactly one line for each ID provided in the input.
2. If a text is NORMAL, YOU MUST OUTPUT EXACTLY "ID | NORMAL". DO NOT output any explanation after the word NORMAL.
   - CORRECT: "1 | NORMAL"
   - INCORRECT: "1 | NORMAL: The text is a product name."
3. For actual dark patterns, keep the explanation extremely short (under 15 words).
4. Evaluate each text COMPLETELY INDEPENDENTLY. 
5. NEVER reference other texts in your explanation (e.g., NEVER say "Similar to text #0").
6. If a text contains random symbols, OCR errors, or incomplete fragments (e.g., "55° |", "c%", "eee"), do NOT hallucinate a dark pattern. Classify it as NORMAL.

The Category MUST be exactly one of the 9 categories listed above.
DO NOT include any extra conversational text.

Texts:
${texts.map((t, i) => `${i} | ${t}`).join("\n")}
`;
}

// --- 2. OLLAMA API CALL ---
async function callOllama(prompt) {
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
            model: "deepseek-r1",
            prompt: prompt,
            stream: true,
            options: {
                temperature: 0.1,
                num_ctx: 4096
            }
        }));
        req.end();
    });
}

// --- 3. EVALUATION RUNNER ---
async function main() {
    let dataset = [];
    
    // Load Checkpoint
    let progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        console.log(`Loaded ${Object.keys(progress).length} previously processed items from checkpoint.`);
    }

    // Read CSV
    console.log("Reading Mathur dataset...");
    fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => {
            dataset.push({
                text: row['Pattern String'],
                groundTruth: row['Pattern Category']
            });
        })
        .on('end', async () => {
            console.log(`Dataset loaded. Total rows: ${dataset.length}`);
            
            const batchSize = 5;
            let currentBatch = [];
            let batchIndices = [];
            
            for (let i = 0; i < dataset.length; i++) {
                if (progress[i]) continue; // Skip already processed
                
                const item = dataset[i];
                
                // 1. Fast Heuristic Test
                const regexResult = fastHeuristicScan(item.text);
                
                currentBatch.push(item.text);
                batchIndices.push(i);
                
                if (currentBatch.length === batchSize || i === dataset.length - 1) {
                    console.log(`Processing batch ending at index ${i}...`);
                    try {
                        const prompt = buildPrompt(currentBatch);
                        const llmResult = await callOllama(prompt);
                        
                        // Parse LLM Results
                        const lines = llmResult.split('\n');
                        for (let line of lines) {
                            const parts = line.split('|');
                            if (parts.length >= 2) {
                                const localId = parseInt(parts[0].trim(), 10);
                                if (!isNaN(localId) && localId >= 0 && localId < currentBatch.length) {
                                    const globalId = batchIndices[localId];
                                    let rawCategory = parts.slice(1).join('|').trim();
                                    
                                    // Extract pure category from "Category: Explanation"
                                    let finalCategory = "NORMAL";
                                    const validCats = ["misdirection", "urgency", "scarcity", "social proof", "obstruction", "forced action", "sneaking", "fake discount"];
                                    
                                    if (!rawCategory.toLowerCase().includes("normal")) {
                                        for (let cat of validCats) {
                                            if (rawCategory.toLowerCase().includes(cat)) {
                                                finalCategory = cat;
                                                break;
                                            }
                                        }
                                    }
                                    
                                    // Store Result
                                    progress[globalId] = {
                                        text: dataset[globalId].text,
                                        groundTruth: dataset[globalId].groundTruth,
                                        regexDetected: regexResult !== null,
                                        regexCategory: regexResult,
                                        llmDetected: finalCategory !== "NORMAL",
                                        llmCategory: finalCategory,
                                        rawLlmResponse: rawCategory
                                    };
                                }
                            }
                        }
                        
                        // Handle missing IDs from LLM output (safety net)
                        for (const globalId of batchIndices) {
                            if (!progress[globalId]) {
                                progress[globalId] = {
                                    text: dataset[globalId].text,
                                    groundTruth: dataset[globalId].groundTruth,
                                    regexDetected: fastHeuristicScan(dataset[globalId].text) !== null,
                                    regexCategory: fastHeuristicScan(dataset[globalId].text),
                                    llmDetected: false,
                                    llmCategory: "NORMAL",
                                    rawLlmResponse: "LLM missed ID"
                                };
                            }
                        }

                        // Save checkpoint
                        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
                        console.log(`[Progress]: Saved up to index ${i} (${Object.keys(progress).length}/${dataset.length} complete)`);
                        
                    } catch (e) {
                        console.error(`Error connecting to Ollama at index ${i}:`, e.message);
                        console.log("Pausing execution. Restart the script when Ollama is ready.");
                        process.exit(1);
                    }
                    
                    // Reset batch
                    currentBatch = [];
                    batchIndices = [];
                }
            }
            
            console.log("\n==================================");
            console.log("EVALUATION COMPLETE!");
            console.log("Run `node tests/generate_mathur_report.js` to create the markdown report.");
        });
}

main();
