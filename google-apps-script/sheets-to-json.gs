/**
 * Google Apps Script to publish Google Sheet as JSON endpoint
 *
 * Setup:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Deploy → New deployment → Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Copy the web app URL
 * 8. Update GOOGLE_SHEET_ID in app.js to use this JSON endpoint instead of CSV
 */

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // First row is headers
  const headers = data[0];
  const traditions = [];

  // Process each row (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row[0]) continue;

    const tradition = {};

    // Map columns to object
    headers.forEach((header, index) => {
      const value = row[index];

      // Handle array fields (pipe-separated)
      if (['practices', 'parentTraditions', 'citations'].includes(header)) {
        tradition[header] = value ? value.toString().split('|').map(v => v.trim()).filter(v => v) : [];
      }
      // Handle numeric fields
      else if (['yearOrigin', 'adhd', 'depression', 'anxiety', 'trauma', 'focus',
                'metacognition', 'insight', 'compassion', 'communication',
                'empathy', 'bodyAwareness', 'emotionalRegulation'].includes(header)) {
        tradition[header] = parseInt(value) || 0;
      }
      // Handle string fields
      else {
        tradition[header] = value ? value.toString() : '';
      }
    });

    // Build effectiveness object
    tradition.effectiveness = {
      adhd: tradition.adhd || 0,
      depression: tradition.depression || 0,
      anxiety: tradition.anxiety || 0,
      trauma: tradition.trauma || 0,
      focus: tradition.focus || 0,
      metacognition: tradition.metacognition || 0,
      insight: tradition.insight || 0,
      compassion: tradition.compassion || 0,
      communication: tradition.communication || 0,
      empathy: tradition.empathy || 0,
      bodyAwareness: tradition.bodyAwareness || 0,
      emotionalRegulation: tradition.emotionalRegulation || 0
    };

    // Remove individual score fields from top level
    ['adhd', 'depression', 'anxiety', 'trauma', 'focus', 'metacognition',
     'insight', 'compassion', 'communication', 'empathy',
     'bodyAwareness', 'emotionalRegulation'].forEach(key => {
      delete tradition[key];
    });

    traditions.push(tradition);
  }

  const result = {
    traditions: traditions,
    dimensions: {
      mentalHealth: ['adhd', 'depression', 'anxiety', 'trauma'],
      cognitive: ['focus', 'metacognition', 'insight'],
      relational: ['compassion', 'communication', 'empathy'],
      somatic: ['bodyAwareness', 'emotionalRegulation']
    },
    scale: {
      '1': 'Minimal/No evidence',
      '2': 'Low effectiveness',
      '3': 'Moderate effectiveness',
      '4': 'High effectiveness',
      '5': 'Very high effectiveness'
    },
    lastUpdated: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
