import csv
import re

def analyze_text():
    total = 0
    errors = 0
    normals = 0
    dp = 0
    categories = {}
    
    with open('d:/Work/PROJECTS/CSE400 [CAPSTONE]/DarkSight/full_text_evaluation_results.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            cls = row.get('AI_Classification', '').upper()
            if 'ERROR' in cls:
                errors += 1
            elif 'NORMAL' in cls:
                normals += 1
            else:
                dp += 1
                # extract category name if possible
                match = re.search(r'CATEGORY:\s*([A-Z\s]+)', cls, re.IGNORECASE)
                cat = match.group(1).strip() if match else 'UNKNOWN'
                categories[cat] = categories.get(cat, 0) + 1
                
    return {'total': total, 'errors': errors, 'normals': normals, 'dp': dp, 'categories': categories}

def analyze_vision():
    total = 0
    errors = 0
    normals = 0
    dp = 0
    categories = {}
    
    with open('d:/Work/PROJECTS/CSE400 [CAPSTONE]/DarkSight/full_vision_evaluation_results.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            cls = row.get('Detection', '').upper()
            if 'ERROR' in cls:
                errors += 1
            elif 'NORMAL' in cls:
                normals += 1
            else:
                dp += 1
                match = re.search(r'CATEGORY:\s*([A-Z\s]+)', cls, re.IGNORECASE)
                cat = match.group(1).strip() if match else 'UNKNOWN'
                categories[cat] = categories.get(cat, 0) + 1
                
    return {'total': total, 'errors': errors, 'normals': normals, 'dp': dp, 'categories': categories}

print("TEXT:")
print(analyze_text())
print("VISION:")
print(analyze_vision())
