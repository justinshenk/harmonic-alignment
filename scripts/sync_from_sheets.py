#!/usr/bin/env python3
"""
Sync traditions data from Google Sheets to JSON file.
Fetches published CSV from Google Sheet and converts to structured JSON.
"""

import json
import csv
import sys
from urllib.request import urlopen
from io import StringIO

# Google Sheet ID - update this with your actual sheet ID
# Get this from the sheet URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
SHEET_ID = "REPLACE_WITH_YOUR_SHEET_ID"

# Sheet must be published: File → Share → Publish to web → CSV
SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0"

def fetch_csv_data(url):
    """Fetch CSV data from Google Sheets."""
    try:
        response = urlopen(url)
        csv_data = response.read().decode('utf-8')
        return csv_data
    except Exception as e:
        print(f"Error fetching data from Google Sheets: {e}", file=sys.stderr)
        sys.exit(1)

def parse_traditions_csv(csv_data):
    """Parse CSV data into traditions structure."""
    reader = csv.DictReader(StringIO(csv_data))
    traditions = []

    for row in reader:
        # Skip empty rows
        if not row.get('id'):
            continue

        # Parse practices (comma-separated)
        practices = [p.strip() for p in row.get('practices', '').split(',') if p.strip()]

        # Parse parent traditions (comma-separated)
        parent_traditions = [p.strip() for p in row.get('parentTraditions', '').split(',') if p.strip()]

        # Parse citations (pipe-separated for multi-line)
        citations = [c.strip() for c in row.get('citations', '').split('|') if c.strip()]

        # Build effectiveness scores
        effectiveness = {}
        for metric in ['adhd', 'depression', 'anxiety', 'trauma', 'focus', 'metacognition',
                      'insight', 'compassion', 'communication', 'empathy',
                      'bodyAwareness', 'emotionalRegulation']:
            value = row.get(metric, '0').strip()
            effectiveness[metric] = int(value) if value.isdigit() else 0

        tradition = {
            'id': row.get('id', '').strip(),
            'name': row.get('name', '').strip(),
            'origin': row.get('origin', '').strip(),
            'yearOrigin': int(row.get('yearOrigin', '0')),
            'parentTraditions': parent_traditions,
            'description': row.get('description', '').strip(),
            'practices': practices,
            'timeCommitment': row.get('timeCommitment', '').strip(),
            'guidanceNeeded': row.get('guidanceNeeded', '').strip(),
            'accessibility': row.get('accessibility', '').strip(),
            'effectiveness': effectiveness,
            'researchSupport': row.get('researchSupport', '').strip(),
            'citations': citations
        }

        traditions.append(tradition)

    return traditions

def main():
    """Main sync function."""
    print(f"Fetching data from Google Sheets...")
    csv_data = fetch_csv_data(SHEET_URL)

    print("Parsing CSV data...")
    traditions = parse_traditions_csv(csv_data)

    print(f"Found {len(traditions)} traditions")

    # Build final structure
    data = {
        'traditions': traditions,
        'dimensions': {
            'mentalHealth': ['adhd', 'depression', 'anxiety', 'trauma'],
            'cognitive': ['focus', 'metacognition', 'insight'],
            'relational': ['compassion', 'communication', 'empathy'],
            'somatic': ['bodyAwareness', 'emotionalRegulation']
        },
        'scale': {
            '1': 'Minimal/No evidence',
            '2': 'Low effectiveness',
            '3': 'Moderate effectiveness',
            '4': 'High effectiveness',
            '5': 'Very high effectiveness'
        }
    }

    # Write to JSON file
    output_path = 'data/traditions.json'
    print(f"Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✓ Sync complete!")

if __name__ == '__main__':
    main()
