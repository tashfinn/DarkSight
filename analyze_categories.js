const fs = require('fs');
function countCategories(file) {
    const data = fs.readFileSync(file, 'utf8');
    const rows = data.split('\n');
    const counts = {};
    for (const row of rows) {
        if (!row.includes('Category:')) continue;
        const matches = row.match(/Category:\s*([^\n\r,]+)/g);
        if (matches) {
            for (const m of matches) {
                let cat = m.replace(/Category:\s*/, '').trim();
                cat = cat.replace(/^"|"$/g, '').trim();
                if (cat !== 'NORMAL' && !cat.includes('ERROR') && cat !== '') {
                    counts[cat] = (counts[cat] || 0) + 1;
                }
            }
        }
    }
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    console.log(file);
    sorted.forEach(([k,v]) => console.log(k + ': ' + v));
    console.log('Total: ' + sorted.reduce((a,b)=>a+b[1], 0) + '\n');
}
countCategories('d:/Work/PROJECTS/CSE400 [CAPSTONE]/DarkSight/full_text_evaluation_results.csv');
countCategories('d:/Work/PROJECTS/CSE400 [CAPSTONE]/DarkSight/full_vision_evaluation_results.csv');
