# Google Sheets Setup Guide

## Quick Start

1. Create a new Google Sheet
2. Import `data/traditions-template.csv` or manually set up columns
3. Add data validation rules (see below)
4. Publish to web as CSV
5. Update `GOOGLE_SHEET_ID` in `app.js`

## Column Structure

### Required Columns
- `id` - Unique identifier (lowercase, hyphens)
- `name` - Display name
- `origin` - Cultural/historical origin
- `description` - Brief description

### Optional Columns
- `yearOrigin` - Year of origin (negative for BCE)
- `practices` - List practices separated by `|`
- `parentTraditions` - Parent tradition IDs separated by `|`
- `timeCommitment` - e.g., "15-30 min daily"
- `guidanceNeeded` - Low, Medium, High, etc.
- `accessibility` - Very High, High, Medium, Low
- `researchSupport` - Very High, High, Medium, Low
- `citations` - Research sources separated by `|`

### Effectiveness Scores (1-5)
- `adhd`, `depression`, `anxiety`, `trauma`
- `focus`, `metacognition`, `insight`
- `compassion`, `communication`, `empathy`
- `bodyAwareness`, `emotionalRegulation`

## Data Validation Rules

To prevent invalid data, set up these validation rules in Google Sheets:

### Score Columns (adhd, depression, etc.)
1. Select all effectiveness score columns
2. Data → Data validation
3. Criteria: Number between 1 and 5
4. On invalid data: Reject input
5. Show validation help text: "Enter a number from 1 (minimal) to 5 (very high)"

### ID Column
1. Select id column
2. Data → Data validation
3. Criteria: Text contains (no spaces)
4. On invalid data: Show warning

### Required Fields
1. Select id, name, origin columns
2. Format → Conditional formatting
3. Format cells if: Is empty
4. Formatting style: Light red fill (visual reminder)

## Protection Rules

### Protect Headers
1. Select row 1 (headers)
2. Data → Protect sheets and ranges
3. Set permissions: Only you can edit
4. This prevents accidental column deletion/renaming

### Suggested Permissions
- **Public editing**: Anyone with link can edit
  - Pro: Open contribution
  - Con: Risk of vandalism
- **Comment-only**: Anyone can suggest edits
  - Pro: Moderated updates
  - Con: Slower updates
- **Restricted**: Specific emails can edit
  - Pro: Quality control
  - Con: Less community driven

## Publishing to Web

1. File → Share → Publish to web
2. Entire document (or select specific sheet)
3. Format: **CSV** (not Web page)
4. Automatically republish when changes are made: **Checked**
5. Copy the link

## Getting Sheet ID

From your sheet URL:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit
                                          ↑
                                    This is the Sheet ID
```

Update in `app.js`:
```javascript
const GOOGLE_SHEET_ID = '1ABC123xyz...';
```

## Testing

1. Make a change in the sheet
2. Wait ~30 seconds for Google to republish
3. Refresh your site
4. Check browser console for "✓ Loaded from Google Sheets"

## Validation Features

The site automatically:
- ✓ Validates required columns exist
- ✓ Skips rows with missing id or name
- ✓ Clamps scores to 1-5 range
- ✓ Falls back to local JSON if sheet unavailable
- ✓ Sanitizes special characters in parsing

## Common Issues

**Changes not appearing?**
- Wait 30-60 seconds after editing
- Check "Automatically republish" is enabled
- Hard refresh browser (Cmd+Shift+R / Ctrl+F5)

**"Invalid sheet format" error?**
- Verify column names match exactly (case-sensitive)
- Check required columns: id, name, origin, description

**Scores showing as 0?**
- Column names must match: adhd, depression, anxiety, etc.
- Values must be numbers 1-5
- Check for extra spaces in column headers
