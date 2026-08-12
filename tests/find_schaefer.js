const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('d:\\Work\\PROJECTS\\CSE400 [CAPSTONE]\\DarkSight\\papers\\Yasin_Sazid_MSSE_Thesis_Report.pdf');

pdf(dataBuffer).then(function(data) {
    const lines = data.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('schaefer') || lines[i].toLowerCase().includes('schäfer') || lines[i].toLowerCase().includes('schafer')) {
            console.log(`Line ${i}: ${lines[i]}`);
            // print context
            console.log(`Context: ${lines.slice(Math.max(0, i-2), Math.min(lines.length, i+3)).join('\n')}\n`);
        }
    }
});
