import { computeMonth } from './HouseholdLedger';

export const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4", 
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];

export const SCOPES = "https://www.googleapis.com/auth/drive.file";

export async function initGapiClient() {
  return new Promise<void>((resolve, reject) => {
    const checkGapi = () => {
      if (window.gapi) {
        window.gapi.load('client:picker', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: DISCOVERY_DOCS,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        setTimeout(checkGapi, 100);
      }
    };
    checkGapi();
  });
}

export async function saveAppData(accessToken: string, spreadsheetId: string, data: any) {
  window.gapi.client.setToken({ access_token: accessToken });
  
  const entries = data.entries || [];
  const nameA = data.names?.a || 'Shoma';
  const nameB = data.names?.b || 'Tram';

  const rows = entries.map((e: any) => [
    e.date, e.type, e.person === 'a' ? nameA : nameB,
    e.scope, e.amount, e.category, e.note, e.id, e.isRecurring ? 'Yes' : 'No', e.recurringId || ''
  ]);
  const header = [['Date', 'Type', 'Person', 'Scope', 'Amount', 'Category', 'Note', 'ID', 'Recurring', 'RecurringID']];
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const M = computeMonth(data, currentMonth);

  const formatCurrency = (val: number) => '$' + (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const dashboardValues = [
    ['Household Dashboard', ''],
    ['Month', currentMonth],
    ['', ''],
    ['Total Income', formatCurrency(M.income)],
    ['Total Spent', formatCurrency(M.spend)],
    ['Savings', formatCurrency(M.savings)],
    ['Recurring Payments', formatCurrency(M.recurringHousehold || 0)],
    ['', ''],
    ['Settlement', ''],
    ['Gross Shared Bills', formatCurrency(M.sharedGross)],
    ['Shared Credits', formatCurrency(-M.creditTotal)],
    ['Net Shared Bills', formatCurrency(M.netShared)],
    [`${nameA} Target Share`, formatCurrency(M.shareA)],
    [`${nameB} Target Share`, formatCurrency(M.shareB)],
    [`${nameA} Actually Paid`, formatCurrency(M.netContribA)],
    [`${nameB} Actually Paid`, formatCurrency(M.netContribB)],
    [`Balance (${nameA} Owes/Due)`, formatCurrency(M.balance)]
  ];

  const aValues = [
    [`${nameA}'s Dashboard`, ''],
    ['Month', currentMonth],
    ['', ''],
    ['Your Income', formatCurrency(M.incA)],
    ['Your Total Spend', formatCurrency(M.spendA)],
    ['Your Savings', formatCurrency(M.savingsA)],
    ['Your Recurring', formatCurrency(M.recurringA || 0)],
  ];

  const bValues = [
    [`${nameB}'s Dashboard`, ''],
    ['Month', currentMonth],
    ['', ''],
    ['Your Income', formatCurrency(M.incB)],
    ['Your Total Spend', formatCurrency(M.spendB)],
    ['Your Savings', formatCurrency(M.savingsB)],
    ['Your Recurring', formatCurrency(M.recurringB || 0)],
  ];

  // We clear the ledger data first to prevent trailing rows when entries are deleted
  try {
    await window.gapi.client.sheets.spreadsheets.values.batchClear({
      spreadsheetId, 
      resource: {
        ranges: ["'Ledger Data'!A:J", "'Dashboard'!A:B", "'Shoma'!A:B", "'Tram'!A:B"]
      }
    });
  } catch (clearErr) {
    console.log('Clear failed or skipped (tabs might not exist yet):', clearErr);
  }

  await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: "'Ledger Data'!A1", values: [...header, ...rows] },
        { range: "'System State'!A1", values: [[JSON.stringify(data)]] }
      ]
    }
  });

  try {
    await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: "'Dashboard'!A1", values: dashboardValues },
          { range: "'Shoma'!A1", values: aValues },
          { range: "'Tram'!A1", values: bValues }
        ]
      }
    });
  } catch (err) {
    console.log('Skipped updating summary dashboards (tabs might not exist in old sheet)', err);
  }
}

export async function loadAppData(accessToken: string, spreadsheetId: string) {
  window.gapi.client.setToken({ access_token: accessToken });
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'System State'!A1"
    });
    const val = response.result.values?.[0]?.[0];
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}
