const fs = require('fs');
const data = JSON.parse(fs.readFileSync('datasets/AidUI/evaluation/evaluation_dataset/web/result.json', 'utf8'));
console.log(data.categories);
