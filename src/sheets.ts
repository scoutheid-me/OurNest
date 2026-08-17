export async function createSpreadsheet(token: string, nameA: string, nameB: string) {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: 'Household Ledger Sync' },
      sheets: [
        { properties: { title: 'Dashboard' } },
        { properties: { title: nameA || 'User A' } },
        { properties: { title: nameB || 'User B' } },
        { properties: { title: 'Raw Data' } },
        { properties: { title: 'Settings' } },
      ],
    }),
  });
  
  if (!res.ok) throw new Error('Failed to create spreadsheet');
  const data = await res.json();
  return data.spreadsheetId;
}

export async function syncToSpreadsheet(token: string, spreadsheetId: string, appData: any, M: any) {
  const nameA = appData.names?.a || 'User A';
  const nameB = appData.names?.b || 'User B';

  // 1. Raw Data
  const rawDataHeader = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Person', 'Scope', 'Note', 'RecurringID', 'IsRecurring'];
  const rawDataRows = appData.entries.map((e: any) => [
    e.id, e.date, e.type, e.category, e.amount, e.person, e.scope, e.note || '', e.recurringId || '', e.isRecurring ? 'Yes' : 'No'
  ]);
  const rawDataValues = [rawDataHeader, ...rawDataRows];

  // 2. Settings (JSON string to avoid complex mapping, or key-value pairs)
  const settingsValues = [
    ['Setting', 'Value'],
    ['User A Name', nameA],
    ['User B Name', nameB],
    ['User A Income', appData.incomes?.a || 0],
    ['User B Income', appData.incomes?.b || 0],
    ['User A Split %', appData.split?.a || 50],
    ['User B Split %', appData.split?.b || 50],
    ['Goal', appData.goal || 1500],
    ['Start Month', appData.startMonth || '2026-08'],
    ['JSON Payload', JSON.stringify(appData)] // for easy reading back
  ];

  // 3. Dashboard (Current month summary)
  const dashboardValues = [
    ['Household Ledger - Dashboard', ''],
    ['Current Month', M.rows.length > 0 ? M.rows[0].date?.slice(0,7) : ''],
    ['Combined Income', M.income],
    ['Total Spent', M.spend],
    ['Household Savings', M.savings],
    ['Recurring Payments', M.recurringHousehold],
    ['', ''],
    ['Settlement Breakdown', ''],
    ['Gross Shared Bills', M.sharedGross],
    ['Shared Credits/Income', -M.creditTotal],
    ['Net Shared Total', M.netShared],
    [`${nameA}'s Share`, M.shareA],
    [`${nameB}'s Share`, M.shareB],
    [`${nameA} Paid`, M.netContribA],
    [`${nameB} Paid`, M.netContribB],
    [`Balance (${nameA} Owes/Due)`, M.balance],
  ];

  // 4. User A
  const aValues = [
    [`${nameA}'s Dashboard`, ''],
    ['Your Income', M.incA],
    ['Your Total Spend', M.spendA],
    ['Your Savings', M.savingsA],
    ['Your Recurring', M.recurringA],
  ];

  // 5. User B
  const bValues = [
    [`${nameB}'s Dashboard`, ''],
    ['Your Income', M.incB],
    ['Your Total Spend', M.spendB],
    ['Your Savings', M.savingsB],
    ['Your Recurring', M.recurringB],
  ];

  const resClear = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        'Raw Data!A:Z',
        'Settings!A:Z',
        'Dashboard!A:Z',
        `'${nameA}'!A:Z`,
        `'${nameB}'!A:Z`,
      ]
    }),
  });
  if (!resClear.ok) {
    console.warn('Batch clear failed, possibly sheets changed names');
  }

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'Raw Data!A1', values: rawDataValues },
        { range: 'Settings!A1', values: settingsValues },
        { range: 'Dashboard!A1', values: dashboardValues },
        { range: `'${nameA}'!A1`, values: aValues },
        { range: `'${nameB}'!A1`, values: bValues },
      ]
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Sync Error', err);
    throw new Error('Failed to sync to spreadsheet');
  }
}

export async function fetchFromSpreadsheet(token: string, spreadsheetId: string) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Settings!B10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch from spreadsheet');
  const data = await res.json();
  const jsonStr = data.values?.[0]?.[0];
  if (jsonStr) {
    return JSON.parse(jsonStr);
  }
  return null;
}
