export function extractSpreadsheetId(input: string): string | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  // Match standard Google Sheet URL: /spreadsheets/d/([a-zA-Z0-9-_]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If user pasted raw ID directly
  if (/^[a-zA-Z0-9-_]{15,}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function createProfessionalSpreadsheet(accessToken: string): Promise<string> {
  window.gapi.client.setToken({ access_token: accessToken });
  
  const createResponse = await window.gapi.client.sheets.spreadsheets.create({
    resource: {
      properties: { title: 'OurNest - Household Finance' },
      sheets: [
        { 
          properties: { title: 'Dashboard', sheetId: 10, gridProperties: { frozenRowCount: 1, hideGridlines: true } }
        },
        { 
          properties: { title: 'Shoma', sheetId: 20, gridProperties: { frozenRowCount: 1, hideGridlines: true } }
        },
        { 
          properties: { title: 'Tram', sheetId: 30, gridProperties: { frozenRowCount: 1, hideGridlines: true } }
        },
        { 
          properties: { title: 'Ledger Data', sheetId: 0, gridProperties: { frozenRowCount: 1 } } 
        },
        { 
          properties: { title: 'System State', sheetId: 1, hidden: true } 
        }
      ]
    }
  });

  const id = createResponse.result.spreadsheetId;
  return id;
}

export async function ensureSpreadsheetStructure(accessToken: string, spreadsheetId: string): Promise<void> {
  window.gapi.client.setToken({ access_token: accessToken });

  try {
    const res = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });
    
    const existingTitles = new Set(
      (res.result.sheets || []).map((s: any) => s.properties?.title)
    );

    const requiredSheets = [
      { title: 'Dashboard', sheetId: 10, hideGridlines: true },
      { title: 'Shoma', sheetId: 20, hideGridlines: true },
      { title: 'Tram', sheetId: 30, hideGridlines: true },
      { title: 'Ledger Data', sheetId: 0 },
      { title: 'System State', sheetId: 1, hidden: true }
    ];

    const addRequests: any[] = [];
    requiredSheets.forEach((sheet, idx) => {
      if (!existingTitles.has(sheet.title)) {
        addRequests.push({
          addSheet: {
            properties: {
              title: sheet.title,
              sheetId: sheet.sheetId + Math.floor(Math.random() * 1000) + (idx * 50),
              hidden: sheet.hidden || false,
              gridProperties: sheet.hideGridlines ? { hideGridlines: true, frozenRowCount: 1 } : { frozenRowCount: 1 }
            }
          }
        });
      }
    });

    if (addRequests.length > 0) {
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests: addRequests }
      });
    }
  } catch (err) {
    console.warn('Could not inspect or add missing sheets (proceeding anyway):', err);
  }
}
