const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.resolve(__dirname, 'aidui_evaluation_progress.json');
const REPORT_FILE = path.resolve(__dirname, 'Vision_Evaluation_Report.md');

function generateReport() {
    if (!fs.existsSync(PROGRESS_FILE)) {
        console.error("No progress file found. Run evaluate_aidui_dataset.js first.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    const rows = Object.values(data);
    const total = rows.length;

    let totalDP = 0;
    let caughtDP = 0;

    let categoryBreakdown = {};

    for (const row of rows) {
        // If groundTruth is just NO DP, it's a negative case.
        const isTrueDP = !row.groundTruth.includes('NO DP');
        if (isTrueDP) totalDP++;

        // We consider it 'caught' if LLaVA output ANY dark pattern class (not NORMAL)
        const llmFlagged = row.llmCategory && row.llmCategory.toUpperCase() !== 'NORMAL';

        if (isTrueDP && llmFlagged) caughtDP++;

        row.groundTruth.forEach(gt => {
            if (!categoryBreakdown[gt]) {
                categoryBreakdown[gt] = { total: 0, caught: 0 };
            }
            categoryBreakdown[gt].total++;
            if (llmFlagged) {
                categoryBreakdown[gt].caught++;
            }
        });
    }

    const overallRecall = totalDP > 0 ? ((caughtDP / totalDP) * 100).toFixed(2) : 0;

    let md = `# AidUI Dataset (ContextDP) - Vision Evaluation Report

This report evaluates the performance of the **DP Sentinel (LLaVA Multimodal)** vision pipeline against the \`${total}\` deceptive interface screenshots from the AidUI dataset.

## Overall Performance

| Metric | Value |
| :--- | :--- |
| **Total Images Tested** | ${total} |
| **Total Dark Patterns (Ground Truth)** | ${totalDP} |
| **Dark Patterns Caught (True Positives)** | ${caughtDP} |
| **Overall Recall** | **${overallRecall}%** |

*Note: The vision pipeline operates purely on pixels using a zero-shot/few-shot prompt via LLaVA.*

## Performance by Ground Truth Category

| AidUI Category | Total Instances | Caught by LLaVA | Accuracy |
| :--- | :--- | :--- | :--- |
`;

    for (const [cat, stats] of Object.entries(categoryBreakdown)) {
        if (cat === 'NO DP') continue;
        const catAcc = stats.total > 0 ? ((stats.caught / stats.total) * 100).toFixed(2) : 0;
        md += `| ${cat} | ${stats.total} | ${stats.caught} | ${catAcc}% |\n`;
    }

    md += `\n\n> **Methodology Note:** The LLaVA model was tested using the exact prompt defined in \`prompt.js\`, assessing 21 distinct visual categories (50 Shades of DP Taxonomy). Since the AidUI dataset labels are slightly different (e.g., *ACTIVITY MESSAGE*, *DEFAULT CHOICE*), this report measures binary detection success (was a deceptive pattern flagged?) rather than perfect category string mapping.\n`;

    fs.writeFileSync(REPORT_FILE, md);
    console.log("Report generated at " + REPORT_FILE);
}

generateReport();
