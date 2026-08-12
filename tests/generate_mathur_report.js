const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.resolve(__dirname, 'mathur_evaluation_progress.json');
const REPORT_FILE = path.resolve(__dirname, 'Dataset_Evaluation_Report.md');

function generateReport() {
    if (!fs.existsSync(PROGRESS_FILE)) {
        console.error("No progress file found. Run evaluate_mathur_dataset.js first.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    const rows = Object.values(data);
    const total = rows.length;

    let regexDetectedCount = 0;
    let llmDetectedCount = 0;
    let hybridDetectedCount = 0;

    let categoryBreakdown = {};

    for (const row of rows) {
        if (row.regexDetected) regexDetectedCount++;
        if (row.llmDetected) llmDetectedCount++;
        if (row.regexDetected || row.llmDetected) hybridDetectedCount++;

        const gtCat = row.groundTruth || "Unknown";
        if (!categoryBreakdown[gtCat]) {
            categoryBreakdown[gtCat] = { total: 0, regexCaught: 0, llmCaught: 0, eitherCaught: 0 };
        }
        
        categoryBreakdown[gtCat].total++;
        if (row.regexDetected) categoryBreakdown[gtCat].regexCaught++;
        if (row.llmDetected) categoryBreakdown[gtCat].llmCaught++;
        if (row.regexDetected || row.llmDetected) categoryBreakdown[gtCat].eitherCaught++;
    }

    const hybridAccuracy = ((hybridDetectedCount / total) * 100).toFixed(2);
    const llmAccuracy = ((llmDetectedCount / total) * 100).toFixed(2);
    const regexAccuracy = ((regexDetectedCount / total) * 100).toFixed(2);

    let md = `# Mathur Dataset (11k Shopping Websites) - Evaluation Report

This report evaluates the performance of DarkSight's detection pipelines against the \`${total}\` deceptive text instances from the Mathur et al. dataset.

## Overall Performance

| Pipeline | Total Tested | Dark Patterns Caught | Recall (True Positive Rate) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Fast Regex)** | ${total} | ${regexDetectedCount} | **${regexAccuracy}%** |
| **Tier 2 (Mistral LLM)** | ${total} | ${llmDetectedCount} | **${llmAccuracy}%** |
| **DP Sentinel (Hybrid)** | ${total} | ${hybridDetectedCount} | **${hybridAccuracy}%** |

*Note: The Hybrid pipeline succeeds if EITHER the Regex or LLM successfully flags the deceptive pattern.*

## Performance by Deceptive Category (Ground Truth)

| Category | Total Instances | Caught (Hybrid) | Accuracy |
| :--- | :--- | :--- | :--- |
`;

    for (const [cat, stats] of Object.entries(categoryBreakdown)) {
        const catAcc = ((stats.eitherCaught / stats.total) * 100).toFixed(2);
        md += `| ${cat} | ${stats.total} | ${stats.eitherCaught} | ${catAcc}% |\n`;
    }

    md += `\n\n> **Methodology Note:** The Mistral LLM was tested using the exact Few-Shot In-Context Learning prompt defined in \`prompt.js\`, validating the integration of the Schaefer taxonomy on real-world data.\n`;

    fs.writeFileSync(REPORT_FILE, md);
    console.log("Report generated at " + REPORT_FILE);
}

generateReport();
