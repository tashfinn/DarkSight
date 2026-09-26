import csv
import re
import os

log_path = r'd:\Work\PROJECTS\CSE400 [CAPSTONE]\DarkSight\kaggle_logs.txt'
original_csv = r'd:\Work\PROJECTS\CSE400 [CAPSTONE]\DarkSight\datasets\dark-patterns\data\final-dark-patterns\dark-patterns.csv'
out_path = r'd:\Work\PROJECTS\CSE400 [CAPSTONE]\DarkSight\full_text_evaluation_results.csv'

# Parse logs
results = {}
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        # Match e.g. [1/1818] Text: ...
        match = re.search(r'\[(\d+)/1818\]', line)
        if match:
            idx = int(match.group(1)) - 1  # 0-indexed
            # Look for Category
            cat_match = re.search(r'Category:\s*(.*)', line)
            if cat_match:
                cat = cat_match.group(1).strip()
                results[idx] = cat
            elif 'ERROR' in line.upper():
                results[idx] = 'ERROR'

print(f"Parsed {len(results)} rows from Kaggle logs.")

# Map numbers to category names
cat_map = {
    '1': 'Social Proof',
    '2': 'Urgency',
    '3': 'Scarcity',
    '4': 'Misdirection',
    '5': 'Forced Action',
    '6': 'Sneaking',
    '7': 'Fake Discount',
    '8': 'NORMAL'
}

def clean_cat(c):
    c = c.replace('[', '').replace(']', '').replace('.', '').strip()
    if c in cat_map:
        return cat_map[c]
    upper_c = c.upper()
    if 'NORMAL' in upper_c:
        return 'NORMAL'
    if 'ERROR' in upper_c:
        return 'ERROR'
    
    # If it's a number mixed with text like "1. Social Proof"
    for k, v in cat_map.items():
        if k in c and v.lower() in c.lower():
            return v
            
    # Default to whatever it is if we can't clean it
    return c

rows = []
with open(original_csv, 'r', encoding='utf-8') as f:
    reader = list(csv.reader(f))
    header = reader[0]
    header.append('AI_Classification')
    rows.append(header)
    
    for i, row in enumerate(reader[1:]):
        raw_cat = results.get(i, 'ERROR')
        clean = clean_cat(raw_cat)
        
        # Format it exactly as the prompt intended
        ai_class = f"ID: {i+1} | Category: {clean}" if clean != 'ERROR' else "Category: ERROR"
        row.append(ai_class)
        rows.append(row)

# Write out the perfect CSV
with open(out_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"Successfully wrote {len(rows)-1} rows to {out_path}!")
