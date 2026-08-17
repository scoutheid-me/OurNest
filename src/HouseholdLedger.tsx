import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Settings, BarChart3, List, 
  Repeat, Trash2, Edit2, Plus, Users, User, ArrowRightLeft,
  ExternalLink, FileSpreadsheet, LogOut, Cloud, CheckCircle2
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Housing', 'Debt & loans', 'Utilities', 'Transportation', 'Subscriptions',
  'Home', 'Groceries', 'Eating out', 'Date', 'Activities', 'Hobbies', 'Travel', 'Health', 'Other'
];
const INCOME_CATEGORIES = ['Salary', 'Housing', 'Bonus', 'Freelance', 'Investments', 'Other income'];

export const INITIAL_IMPORTED_ENTRIES = [
  // 2026-08
  { id: '6db2xdj0msr53f0w', date: '2026-08-01', type: 'expense', person: 'b', scope: 'personal', amount: 512, category: 'Debt & loans', note: 'Car Payment', isRecurring: true, recurringId: 'equdp5x9msr53f0w' },
  { id: 'w1jhbbpfmsr5bxle', date: '2026-08-01', type: 'expense', person: 'b', scope: 'shared', amount: 8.25, category: 'Subscriptions', note: 'Spotify', isRecurring: true, recurringId: '4duructzmsr5bxle' },
  { id: 't4s14tupmsr5cj4o', date: '2026-08-01', type: 'expense', person: 'b', scope: 'shared', amount: 8.25, category: 'Subscriptions', note: 'Doordash', isRecurring: true, recurringId: 'wcpz26dbmsr5cj4o' },
  { id: 'untpbp4bmsr5ect6', date: '2026-08-01', type: 'expense', person: 'b', scope: 'shared', amount: 30, category: 'Housing', note: 'Pest Control', isRecurring: true, recurringId: '76zjyfx8msr5ect6' },
  { id: 'lseqn8fsmsr5ety6', date: '2026-08-01', type: 'expense', person: 'b', scope: 'shared', amount: 35.99, category: 'Subscriptions', note: 'City Sports', isRecurring: true, recurringId: 'tnnp2pskmsr5ety6' },
  { id: 'qf9y74immsr5gi2m', date: '2026-08-01', type: 'expense', person: 'b', scope: 'shared', amount: 100, category: 'Housing', note: 'Lawn', isRecurring: true, recurringId: 'adipjbscmsr5gi2m' },
  { id: 't468d62nmsr5h10s', date: '2026-08-01', type: 'expense', person: 'b', scope: 'shared', amount: 350, category: 'Housing', note: 'Solar', isRecurring: true, recurringId: '79klyiinmsrrn9pv' },
  { id: 'atfx67w1msr5i6o6', date: '2026-08-01', type: 'expense', person: 'a', scope: 'shared', amount: 72.59, category: 'Utilities', note: 'PGE', isRecurring: true, recurringId: '6eg8kftmmsrrn31h' },
  { id: '0uk52xm0msr5jdky', date: '2026-08-01', type: 'expense', person: 'a', scope: 'shared', amount: 6509.67, category: 'Debt & loans', note: 'House Mortgage', isRecurring: true, recurringId: 'm42igek0msr5jdky' },
  { id: 'qzlwz436msr5knjk', date: '2026-08-01', type: 'income', person: 'a', scope: 'shared', amount: 1250, category: 'Housing', note: 'Elvin Rent + Utilities', isRecurring: false },
  { id: 'l89zrog0msr5li2s', date: '2026-08-01', type: 'income', person: 'a', scope: 'shared', amount: 1300, category: 'Housing', note: 'Courtney Rent + Utilities', isRecurring: false },
  { id: 't631gtl6msr58g34', date: '2026-08-12', type: 'expense', person: 'b', scope: 'personal', amount: 200, category: 'Transportation', note: 'Car Insurance', isRecurring: true, recurringId: '2djsww7ymsr58g34' },

  // 2026-09
  { id: 'zpqbi3momsr4xbb9', date: '2026-09-01', type: 'income', person: 'a', scope: 'personal', amount: 6000, category: 'Salary', note: '', isRecurring: true, recurringId: 'i2a64dm4msr4xbb5' },
  { id: 'kevf7h2emsr57l4q', date: '2026-09-01', type: 'income', person: 'b', scope: 'personal', amount: 7730, category: 'Salary', note: '', isRecurring: true, recurringId: 'd15bq8yamsr57l4m' },
  { id: 'wo81tx1nmsr53f10', date: '2026-09-01', type: 'expense', person: 'b', scope: 'personal', amount: 512, category: 'Debt & loans', note: 'Car Payment', isRecurring: true, recurringId: 'equdp5x9msr53f0w' },
  { id: 'x80d8eg4msr5bxli', date: '2026-09-01', type: 'expense', person: 'b', scope: 'shared', amount: 8.25, category: 'Subscriptions', note: 'Spotify', isRecurring: true, recurringId: '4duructzmsr5bxle' },
  { id: 'm333f602msr5cj4s', date: '2026-09-01', type: 'expense', person: 'b', scope: 'personal', amount: 8.25, category: 'Subscriptions', note: 'Doordash', isRecurring: true, recurringId: 'wcpz26dbmsr5cj4o' },
  { id: 'zy9e8k2qmsr5ecta', date: '2026-09-01', type: 'expense', person: 'b', scope: 'personal', amount: 30, category: 'Housing', note: 'Pest Control', isRecurring: true, recurringId: '76zjyfx8msr5ect6' },
  { id: 'hryb1espmsr5etyc', date: '2026-09-01', type: 'expense', person: 'b', scope: 'personal', amount: 35.99, category: 'Subscriptions', note: 'City Sports', isRecurring: true, recurringId: 'tnnp2pskmsr5ety6' },
  { id: '0brug8spmsr5gi2r', date: '2026-09-01', type: 'expense', person: 'b', scope: 'shared', amount: 100, category: 'Housing', note: 'Lawn', isRecurring: true, recurringId: 'adipjbscmsr5gi2m' },
  { id: 'f6uoibcqmsrrn9pz', date: '2026-09-01', type: 'expense', person: 'b', scope: 'shared', amount: 350, category: 'Housing', note: 'Solar', isRecurring: true, recurringId: '79klyiinmsrrn9pv' },
  { id: 'me8vo25wmsrrn31n', date: '2026-09-01', type: 'expense', person: 'a', scope: 'shared', amount: 80, category: 'Utilities', note: 'PGE', isRecurring: true, recurringId: '6eg8kftmmsrrn31h' },
  { id: 'nkdronekmsr5jdl2', date: '2026-09-01', type: 'expense', person: 'a', scope: 'shared', amount: 6509.67, category: 'Debt & loans', note: 'House Mortgage', isRecurring: true, recurringId: 'm42igek0msr5jdky' },
  { id: 'wdvglc2nmsr58g38', date: '2026-09-12', type: 'expense', person: 'b', scope: 'personal', amount: 200, category: 'Transportation', note: 'Car Insurance', isRecurring: true, recurringId: '2djsww7ymsr58g34' },

  // 2026-10
  { id: 'sefe361tmsr4xdh9', date: '2026-10-01', type: 'income', person: 'a', scope: 'personal', amount: 6000, category: 'Salary', note: '', isRecurring: true, recurringId: 'i2a64dm4msr4xbb5' },
  { id: 'lkmypsssmsrrnm5m', date: '2026-10-01', type: 'income', person: 'b', scope: 'personal', amount: 7730, category: 'Salary', note: '', isRecurring: true, recurringId: 'd15bq8yamsr57l4m' },
  { id: 'khzpx9ebmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'personal', amount: 512, category: 'Debt & loans', note: 'Car Payment', isRecurring: true, recurringId: 'equdp5x9msr53f0w' },
  { id: 'kvambzrtmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'shared', amount: 8.25, category: 'Subscriptions', note: 'Spotify', isRecurring: true, recurringId: '4duructzmsr5bxle' },
  { id: 'x1oqh37cmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'personal', amount: 8.25, category: 'Subscriptions', note: 'Doordash', isRecurring: true, recurringId: 'wcpz26dbmsr5cj4o' },
  { id: 'hrv3mimlmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'personal', amount: 30, category: 'Housing', note: 'Pest Control', isRecurring: true, recurringId: '76zjyfx8msr5ect6' },
  { id: '77l3vc96msrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'personal', amount: 35.99, category: 'Subscriptions', note: 'City Sports', isRecurring: true, recurringId: 'tnnp2pskmsr5ety6' },
  { id: '3yaeds5xmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'shared', amount: 100, category: 'Housing', note: 'Lawn', isRecurring: true, recurringId: 'adipjbscmsr5gi2m' },
  { id: '27b99h8omsrrnm5m', date: '2026-10-01', type: 'expense', person: 'b', scope: 'shared', amount: 350, category: 'Housing', note: 'Solar', isRecurring: true, recurringId: '79klyiinmsrrn9pv' },
  { id: 'z27symtfmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'a', scope: 'shared', amount: 72.59, category: 'Utilities', note: 'PGE', isRecurring: true, recurringId: '6eg8kftmmsrrn31h' },
  { id: 'b79teislmsrrnm5m', date: '2026-10-01', type: 'expense', person: 'a', scope: 'shared', amount: 6509.67, category: 'Debt & loans', note: 'House Mortgage', isRecurring: true, recurringId: 'm42igek0msr5jdky' },
  { id: 'v5mycncrmsrrnm5m', date: '2026-10-12', type: 'expense', person: 'b', scope: 'personal', amount: 200, category: 'Transportation', note: 'Car Insurance', isRecurring: true, recurringId: '2djsww7ymsr58g34' },

  // 2026-11
  { id: 'xx2i4y40msrro9vk', date: '2026-11-01', type: 'income', person: 'a', scope: 'personal', amount: 6000, category: 'Salary', note: '', isRecurring: true, recurringId: 'i2a64dm4msr4xbb5' },
  { id: 'keo85iyamsrro9vk', date: '2026-11-01', type: 'income', person: 'b', scope: 'personal', amount: 7730, category: 'Salary', note: '', isRecurring: true, recurringId: 'd15bq8yamsr57l4m' },
  { id: 'ojt2wt3kmsrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'personal', amount: 512, category: 'Debt & loans', note: 'Car Payment', isRecurring: true, recurringId: 'equdp5x9msr53f0w' },
  { id: 'vbpceqzbmsrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'shared', amount: 8.25, category: 'Subscriptions', note: 'Spotify', isRecurring: true, recurringId: '4duructzmsr5bxle' },
  { id: 'hgilzki0msrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'personal', amount: 8.25, category: 'Subscriptions', note: 'Doordash', isRecurring: true, recurringId: 'wcpz26dbmsr5cj4o' },
  { id: 'jx8stw6pmsrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'personal', amount: 30, category: 'Housing', note: 'Pest Control', isRecurring: true, recurringId: '76zjyfx8msr5ect6' },
  { id: 'ghe51z0lmsrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'personal', amount: 35.99, category: 'Subscriptions', note: 'City Sports', isRecurring: true, recurringId: 'tnnp2pskmsr5ety6' },
  { id: 'pwg82vhcmsrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'shared', amount: 100, category: 'Housing', note: 'Lawn', isRecurring: true, recurringId: 'adipjbscmsr5gi2m' },
  { id: 'druag9gmmsrro9vk', date: '2026-11-01', type: 'expense', person: 'b', scope: 'shared', amount: 350, category: 'Housing', note: 'Solar', isRecurring: true, recurringId: '79klyiinmsrrn9pv' },
  { id: '6ib1c1e7msrro9vk', date: '2026-11-01', type: 'expense', person: 'a', scope: 'shared', amount: 72.59, category: 'Utilities', note: 'PGE', isRecurring: true, recurringId: '6eg8kftmmsrrn31h' },
  { id: '75wsx5svmsrro9vk', date: '2026-11-01', type: 'expense', person: 'a', scope: 'shared', amount: 6509.67, category: 'Debt & loans', note: 'House Mortgage', isRecurring: true, recurringId: 'm42igek0msr5jdky' },
  { id: 'rthkdno0msrro9vk', date: '2026-11-12', type: 'expense', person: 'b', scope: 'personal', amount: 200, category: 'Transportation', note: 'Car Insurance', isRecurring: true, recurringId: '2djsww7ymsr58g34' },
];

export const DEFAULT_DATA = {
  names: { a: 'Shoma', b: 'Tram' },
  incomes: { a: 0, b: 0 },
  split: { a: 50, b: 50 },
  goal: 1500,
  startMonth: '2026-08',
  budgets: {},
  entries: INITIAL_IMPORTED_ENTRIES,
};

const CHART_COLORS = {
  emerald: '#10b981',
  indigo: '#6366f1',
  rose: '#f43f5e',
  pink: '#ec4899',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
  red500: '#ef4444'
};

/* ---------------------------- helpers ---------------------------- */
const pad = (n: any) => String(n).padStart(2, '0');
const monthKeyOf = (d: any) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const shiftMonth = (key: any, delta: any) => {
  const [y, m] = key.split('-').map(Number);
  return monthKeyOf(new Date(y, m - 1 + delta, 1));
};
const monthLabel = (key: any, opts: any = { month: 'long', year: 'numeric' }) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', opts);
};
const money = (n: any, dp = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: dp, maximumFractionDigits: dp,
  }).format(n || 0);
const money0 = (n: any) => money(n, 0);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ---------------------------- month math ---------------------------- */
export function computeMonth(data: any, month: string) {
  const rows = data.entries.filter((e: any) => (e.date || '').slice(0, 7) === month);

  const isIncome = (e: any) => e.type === 'income';
  const incRowsA = rows.filter((e: any) => isIncome(e) && e.scope !== 'shared' && e.person === 'a');
  const incRowsB = rows.filter((e: any) => isIncome(e) && e.scope !== 'shared' && e.person === 'b');
  
  const baseIncA = Number(data.incomes?.a) || 0;
  if (baseIncA > 0) incRowsA.unshift({ id: 'salary-a', category: 'Monthly Salary', note: 'Monthly salary set', amount: baseIncA, person: 'a', scope: 'personal', readonly: true, date: `${month}-01` });
  
  const baseIncB = Number(data.incomes?.b) || 0;
  if (baseIncB > 0) incRowsB.unshift({ id: 'salary-b', category: 'Monthly Salary', note: 'Monthly salary set', amount: baseIncB, person: 'b', scope: 'personal', readonly: true, date: `${month}-01` });

  const incA = sum(incRowsA);
  const incB = sum(incRowsB);

  const credits = rows.filter((e: any) => isIncome(e) && e.scope === 'shared');
  const creditTotal = sum(credits);
  const recvA = sum(credits.filter((e: any) => e.person === 'a'));
  const recvB = sum(credits.filter((e: any) => e.person === 'b'));

  const shared = rows.filter((e: any) => e.type === 'expense' && e.scope === 'shared');
  const persA = rows.filter((e: any) => e.type === 'expense' && e.scope === 'personal' && e.person === 'a');
  const persB = rows.filter((e: any) => e.type === 'expense' && e.scope === 'personal' && e.person === 'b');

  const sharedGross = sum(shared);
  const netShared = sharedGross - creditTotal;     

  const splitA = data.split?.a !== undefined ? Number(data.split.a) / 100 : 0.5;
  const splitB = data.split?.b !== undefined ? Number(data.split.b) / 100 : 0.5;
  const shareA = netShared * splitA;
  const shareB = netShared * splitB;

  const paidSharedA = sum(shared.filter((e: any) => e.person === 'a'));
  const paidSharedB = sum(shared.filter((e: any) => e.person === 'b'));
  
  const netContribA = paidSharedA - recvA;
  const netContribB = paidSharedB - recvB;

  const personalA = sum(persA);
  const personalB = sum(persB);
  const income = incA + incB;
  const spend = netShared + personalA + personalB;

  const recurringHousehold = sum(rows.filter((e: any) => e.type === 'expense' && e.isRecurring));
  const recurringA = sum(persA.filter((e: any) => e.isRecurring)) + sum(shared.filter((e: any) => e.isRecurring)) * splitA;
  const recurringB = sum(persB.filter((e: any) => e.isRecurring)) + sum(shared.filter((e: any) => e.isRecurring)) * splitB;

  return {
    rows, incA, incB, incRowsA, incRowsB, income, shared, persA, persB,
    credits, creditTotal, recvA, recvB,
    sharedGross, netShared, splitA, splitB, shareA, shareB,
    paidSharedA, paidSharedB, netContribA, netContribB,
    personalA, personalB, spend,
    recurringHousehold, recurringA, recurringB,
    spendA: personalA + shareA,
    spendB: personalB + shareB,
    savings: income - spend,
    savingsA: incA - personalA - shareA,
    savingsB: incB - personalB - shareB,
    balance: netContribA - shareA, 
  };
}
const sum = (arr: any[]) => arr.reduce((t: number, e: any) => t + (Number(e.amount) || 0), 0);

/* ============================== APP ============================== */
export default function HouseholdLedger({ 
  initialData, 
  onSave, 
  backendMode = 'sheets', 
  spreadsheetId, 
  onSwitchSpreadsheet, 
  onLogout 
}: { 
  initialData: any, 
  onSave: (d: any) => Promise<void>, 
  backendMode?: 'sheets' | 'firebase',
  spreadsheetId?: string | null,
  onSwitchSpreadsheet?: () => void,
  onLogout?: () => void
}) {
  const [data, setData] = useState(initialData || DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(() => monthKeyOf(new Date()));
  const [tab, setTab] = useState<'ledger' | 'trends' | 'settings'>('ledger');
  const [viewMode, setViewMode] = useState<'household' | 'a' | 'b'>('household');
  
  const saveTimer = useRef<any>(null);
  const isFirstRender = useRef(true);

  // Recurring logic & Save trigger
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Process recurring entries first
    if (data.entries) {
      const threads: Record<string, any> = {};
      data.entries.forEach((e: any) => {
        if (e.recurringId) {
          if (!threads[e.recurringId] || e.date > threads[e.recurringId].date) {
            threads[e.recurringId] = e;
          }
        }
      });

      const newEntries: any[] = [];
      const currentMonthKey = monthKeyOf(new Date());
      const baseMonth = month > currentMonthKey ? month : currentMonthKey;
      const targetMonth = shiftMonth(baseMonth, 1);

      Object.values(threads).forEach((latest: any) => {
        if (latest.isRecurring) {
          let curr = latest.date.slice(0, 7);
          let currentDay = latest.date.slice(8, 10);
          
          while (curr < targetMonth) {
            curr = shiftMonth(curr, 1);
            let year = curr.slice(0, 4);
            let m = curr.slice(5, 7);
            let dateObj = new Date(parseInt(year), parseInt(m), 0);
            let maxDay = dateObj.getDate();
            let day = Math.min(parseInt(currentDay), maxDay);
            let newDate = `${year}-${m}-${pad(day)}`;

            newEntries.push({
              ...latest,
              id: uid(),
              date: newDate,
            });
          }
        }
      });

      if (newEntries.length > 0) {
        setData((prev: any) => ({ ...prev, entries: [...prev.entries, ...newEntries] }));
        return; // Let the next render handle the save
      }
    }

    // Save to backend
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        await onSave(data);
      } catch (e) {
        console.error('Could not save the ledger:', e);
      } finally {
        setSaving(false);
      }
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [data, onSave, month]);

  const patch = useCallback((p: any) => setData((d: any) => ({ ...d, ...p })), []);
  const addEntry = useCallback((e: any) => setData((d: any) => ({ ...d, entries: [...d.entries, e] })), []);
  const saveEntry = useCallback((e: any) => setData((d: any) => {
    let nextEntries = d.entries.map((x: any) => (x.id === e.id ? e : x));
    if (!e.isRecurring && e.recurringId) {
      nextEntries = nextEntries.filter((x: any) => !(x.recurringId === e.recurringId && x.date > e.date));
    }
    return { ...d, entries: nextEntries };
  }), []);
  const removeEntry = useCallback((id: any) => setData((d: any) => ({
    ...d, entries: d.entries.filter((x: any) => x.id !== id),
  })), []);

  const M = useMemo(() => computeMonth(data, month), [data, month]);

  const trend = useMemo(() => {
    const out = [];
    const startM = data.startMonth || '2026-08';
    for (let i = 5; i >= 0; i--) {
      const k = shiftMonth(month, -i);
      if (k < startM) continue; // Skip months before the start month
      
      const m = computeMonth(data, k);
      
      // Skip if no data was input for this month (no manual entries and no calculated spend)
      if (m.rows.length === 0 && m.spend === 0 && m.income === 0) continue;

      out.push({
        key: k, label: monthLabel(k, { month: 'short' }),
        savings: Math.round(m.savings * 100) / 100,
        savingsA: Math.round(m.savingsA * 100) / 100,
        savingsB: Math.round(m.savingsB * 100) / 100,
        income: m.income, spend: m.spend,
      });
    }
    return out;
  }, [data.entries, month, data.startMonth, data.incomes]);

  const nameA = data.names.a || 'Shoma';
  const nameB = data.names.b || 'Tram';

  return (
    <div className="bg-slate-50 min-h-full h-full overflow-y-auto text-slate-800 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                {saving ? 'Saving...' : (backendMode === 'sheets' ? 'Saved to Google Sheet' : 'Saved to Cloud')}
              </div>

              {backendMode === 'sheets' && spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Open Sheet
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {viewMode === 'household' ? 'OurNest' : (viewMode === 'a' ? `${nameA}'s Ledger` : `${nameB}'s Ledger`)}
              </h1>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner border border-slate-200">
              <button 
                onClick={() => setViewMode('household')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${viewMode === 'household' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Users className="w-4 h-4" /> Shared
              </button>
              <button 
                onClick={() => setViewMode('a')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${viewMode === 'a' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4" /> {nameA}
              </button>
              <button 
                onClick={() => setViewMode('b')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${viewMode === 'b' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <User className="w-4 h-4" /> {nameB}
              </button>
            </div>

            {/* Main Nav Tabs */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner border border-slate-200">
              <button onClick={() => setTab('ledger')} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tab === 'ledger' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <List className="w-4 h-4" /> Ledger
              </button>
              <button onClick={() => setTab('trends')} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tab === 'trends' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <BarChart3 className="w-4 h-4" /> Trends
              </button>
              <button onClick={() => setTab('settings')} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Settings className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigator */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center justify-between mb-8">
          <button onClick={() => setMonth(shiftMonth(month, -1))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-800">{monthLabel(month)}</div>
            {month !== monthKeyOf(new Date()) && (
              <button onClick={() => setMonth(monthKeyOf(new Date()))} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-1">
                Back to Current Month
              </button>
            )}
          </div>
          <button onClick={() => setMonth(shiftMonth(month, 1))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {tab === 'ledger' && (
          <LedgerTab 
            M={M} data={data} month={month} nameA={nameA} nameB={nameB} viewMode={viewMode}
            addEntry={addEntry} saveEntry={saveEntry} removeEntry={removeEntry}
            onSwitchToSettings={() => setTab('settings')}
          />
        )}
        {tab === 'trends' && (
          <TrendsTab M={M} trend={trend} data={data} nameA={nameA} nameB={nameB} viewMode={viewMode} />
        )}
        {tab === 'settings' && (
          <SettingsTab 
            data={data} 
            patch={patch} 
            setData={setData} 
            nameA={nameA} 
            nameB={nameB}
            backendMode={backendMode}
            spreadsheetId={spreadsheetId}
            onSwitchSpreadsheet={onSwitchSpreadsheet}
          />
        )}

      </div>
    </div>
  );
}

/* ============================ LEDGER TAB ============================ */
function LedgerTab({ M, data, month, nameA, nameB, viewMode, addEntry, saveEntry, removeEntry, onSwitchToSettings }: any) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [toast, setToast] = useState('');
  const formRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const startEdit = (entry: any) => {
    if (entry.readonly) {
      if (onSwitchToSettings) onSwitchToSettings();
      return;
    }
    setEditing(entry);
    setOpen(true);
  };
  const closeForm = () => { setOpen(false); setEditing(null); };

  const goal = Number(data.goal) || 0;
  const owed = Math.abs(M.balance);
  const creditor = M.balance > 0 ? nameA : nameB;
  const debtor = M.balance > 0 ? nameB : nameA;

  const viewInc = viewMode === 'household' ? M.income : (viewMode === 'a' ? M.incA : M.incB);
  const viewSpend = viewMode === 'household' ? M.spend : (viewMode === 'a' ? M.spendA : M.spendB);
  const viewSave = viewMode === 'household' ? M.savings : (viewMode === 'a' ? M.savingsA : M.savingsB);
  const viewRecurring = viewMode === 'household' ? M.recurringHousehold : (viewMode === 'a' ? M.recurringA : M.recurringB);

  const overBudget = useMemo(() => EXPENSE_CATEGORIES.filter((cat) => {
    const b = Number(data.budgets?.[cat]) || 0;
    if (!b) return false;
    let spent = 0;
    if (viewMode === 'household') {
      spent = sum(M.rows.filter((e: any) => e.type === 'expense' && e.category === cat));
    } else {
      // Personal budget view: their personal + their share of shared
      const pAmt = sum(M.rows.filter((e: any) => e.type === 'expense' && e.category === cat && e.scope === 'personal' && e.person === viewMode));
      const sAmt = sum(M.rows.filter((e: any) => e.type === 'expense' && e.category === cat && e.scope === 'shared')) * (viewMode === 'a' ? M.splitA : M.splitB);
      spent = pAmt + sAmt;
    }
    return spent > b;
  }), [M.rows, data.budgets, viewMode]);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={viewMode === 'household' ? 'Combined Income' : 'Your Income'} value={viewInc} accent="text-emerald-600" />
        <StatCard label={viewMode === 'household' ? 'Total Spent' : 'Your Total Spend (Inc. Half Shared)'} value={viewSpend} accent="text-slate-800" />
        <StatCard label={viewMode === 'household' ? 'Household Savings' : 'Your Savings'} value={viewSave} accent={viewSave >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
        <StatCard label="Recurring Payments" value={viewRecurring} accent="text-indigo-600" />
      </div>

      {/* Goal Progress (Household Only for simplicity, or scale it) */}
      {viewMode === 'household' && goal > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Monthly Savings Goal</h3>
            <span className="text-sm font-medium text-slate-500">
              <strong className={viewSave >= goal ? 'text-emerald-600' : 'text-slate-800'}>{money0(Math.max(0, viewSave))}</strong> saved of {money0(goal)} goal
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${viewSave >= goal ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
              style={{ width: `${Math.max(0, Math.min(100, (viewSave / goal) * 100))}%` }} 
            />
          </div>
        </div>
      )}

      {/* Shared Bills Settlement (Household only) */}
      {viewMode === 'household' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Household Settlement Breakdown</h3>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Gross Shared Bills</span><span className="font-semibold text-slate-800">{money(M.sharedGross)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Shared Credits/Income</span><span className="font-semibold text-emerald-600">-{money(M.creditTotal)}</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">Net Shared Total</span><span className="font-semibold text-slate-800">{money(M.netShared)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{nameA}'s Share ({Math.round(M.splitA * 100)}%)</span><span className="font-bold text-slate-800">{money(M.shareA)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{nameB}'s Share ({Math.round(M.splitB * 100)}%)</span><span className="font-bold text-slate-800">{money(M.shareB)}</span></div>
            
            <div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">{nameA} Paid</span><span className="font-semibold text-slate-800">{money(M.netContribA)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{nameB} Paid</span><span className="font-semibold text-slate-800">{money(M.netContribB)}</span></div>
          </div>
          
          <div className={`p-4 rounded-xl text-center font-bold text-lg ${owed < 0.005 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {owed < 0.005 ? 'All square — nothing to settle.' : `${debtor} owes ${creditor} ${money(owed)}`}
          </div>
        </div>
      )}

      {/* Add Entry Button / Form */}
      <div ref={formRef}>
        <button onClick={() => setOpen(true)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Add Income or Expense
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-xl my-auto bg-white rounded-3xl shadow-2xl p-1 md:p-6 animate-in zoom-in-95 duration-200">
              <EntryForm
                key={editing ? editing.id : 'new'}
                initial={editing} month={month} nameA={nameA} nameB={nameB}
                onCancel={closeForm} 
                onAdd={(e: any) => { addEntry(e); closeForm(); showToast('Entry added successfully!'); }}
                onSave={(e: any) => { saveEntry(e); closeForm(); showToast('Entry updated successfully!'); }}
                onDelete={(id: any) => { removeEntry(id); closeForm(); showToast('Entry deleted.'); }}
              />
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-medium px-6 py-3 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}

      {/* Main Ledger Columns */}
      <div className={`grid gap-6 ${viewMode === 'household' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {(viewMode === 'household' || viewMode === 'a') && (
          <LedgerColumn 
            title={`${nameA}'s Personal`} 
            accent="indigo" 
            total={M.personalA} 
            rows={M.persA} 
            incomeRows={M.incRowsA}
            incomeTotal={M.incA}
            incomeTitle="Personal Income"
            onEdit={startEdit} 
            nameA={nameA} nameB={nameB}
          />
        )}
        
        {viewMode === 'b' && (
          <LedgerColumn 
            title={`${nameB}'s Personal`} 
            accent="pink" 
            total={M.personalB} 
            rows={M.persB} 
            incomeRows={M.incRowsB}
            incomeTotal={M.incB}
            incomeTitle="Personal Income"
            onEdit={startEdit} 
            nameA={nameA} nameB={nameB}
          />
        )}

        <LedgerColumn 
          title={`Shared Bills (${Math.round(M.splitA * 100)}/${Math.round(M.splitB * 100)})`} 
          accent="emerald" 
          total={M.netShared} 
          rows={M.shared} 
          incomeRows={M.credits} 
          incomeTotal={M.creditTotal} 
          isCredit
          incomeTitle="Shared Credits / Income"
          onEdit={startEdit} 
          showPayer nameA={nameA} nameB={nameB} 
        />
        
        {viewMode === 'household' && (
          <LedgerColumn 
            title={`${nameB}'s Personal`} 
            accent="pink" 
            total={M.personalB} 
            rows={M.persB} 
            incomeRows={M.incRowsB}
            incomeTotal={M.incB}
            incomeTitle="Personal Income"
            onEdit={startEdit} 
            nameA={nameA} nameB={nameB}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</h3>
      <div className={`text-3xl font-bold tracking-tight ${accent}`}>{money(value)}</div>
    </div>
  );
}

function LedgerColumn({ title, accent, total, rows, incomeRows, incomeTitle = 'Income', incomeTotal = 0, isCredit, onEdit, showPayer, nameA, nameB }: any) {
  const [expandedCats, setExpandedCats] = useState<{ [key: string]: boolean }>({});
  const [showIncome, setShowIncome] = useState(false);

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const byCat = useMemo(() => {
    const m: any = {};
    rows.forEach((e: any) => { (m[e.category] = m[e.category] || []).push(e); });
    return Object.entries(m).sort((x: any, y: any) => sum(y[1]) - sum(x[1]));
  }, [rows]);

  const colorMap: any = {
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', bar: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
    pink: { text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', bar: 'bg-pink-500', badge: 'bg-pink-100 text-pink-700' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', bar: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  };
  const theme = colorMap[accent];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className={`p-5 border-b border-slate-100 ${theme.bg}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.text} mb-1`}>{title}</h3>
        <div className="text-2xl font-bold text-slate-900">{money(total)}</div>
        {isCredit && incomeTotal > 0 && <div className="text-xs font-semibold text-slate-500 mt-1">After {money0(incomeTotal)} in credits</div>}
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {incomeRows && incomeRows.length > 0 && (
          <div className={`mb-4 p-3.5 rounded-xl ${isCredit ? 'bg-emerald-50/70 border-emerald-100' : 'bg-slate-50 border-slate-200'} border`}>
            <button
              type="button"
              onClick={() => setShowIncome(!showIncome)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${isCredit ? 'text-emerald-700' : 'text-slate-700'} uppercase tracking-wider`}>
                  {incomeTitle}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/70 text-slate-600 border border-slate-200/50">
                  {incomeRows.length} {incomeRows.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isCredit ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {money(incomeTotal)}
                </span>
                {showIncome ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700" />
                )}
              </div>
            </button>

            {showIncome && (
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-200/60">
                {incomeRows.map((e: any) => (
                  <div key={e.id} className="flex justify-between items-start cursor-pointer hover:bg-white/80 p-2 -mx-1 rounded-lg transition-colors" onClick={() => onEdit(e)}>
                    <div>
                      <div className="text-sm font-medium text-slate-800 flex items-center gap-1">
                        {e.note || e.category} {e.isRecurring && <Repeat className="w-3 h-3 text-slate-400" />}
                      </div>
                      <div className="text-xs text-slate-500">{e.date.slice(5)} · {e.person === 'a' ? nameA : nameB}</div>
                    </div>
                    <div className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>+{money(e.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-8">No transactions yet.</div>
        ) : (
          <div className="space-y-2.5">
            {byCat.map(([cat, items]: any) => {
              const isExpanded = Boolean(expandedCats[cat]);
              const catTotal = sum(items);

              return (
                <div key={cat} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40 hover:bg-slate-50/80 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${theme.text}`}>{cat}</span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                        {items.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{money(catTotal)}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 pt-1 bg-white border-t border-slate-100 space-y-1">
                      {items.map((e: any) => (
                        <div 
                          key={e.id} 
                          className="flex justify-between items-center py-2 px-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100" 
                          onClick={() => onEdit(e)}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-700 truncate flex items-center gap-1.5">
                              {e.note || cat} {e.isRecurring && <Repeat className="w-3 h-3 text-slate-400 shrink-0" />}
                            </div>
                            <div className="text-xs text-slate-400">
                              {e.date.slice(5)}
                              {showPayer && <span className={e.person === 'a' ? 'text-indigo-600 font-medium' : 'text-pink-600 font-medium'}> · {e.person === 'a' ? nameA : nameB} paid</span>}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-slate-800 ml-3">{money(e.amount)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ ENTRY FORM ============================ */
function EntryForm({ initial, month, nameA, nameB, onAdd, onSave, onDelete, onCancel }: any) {
  const isEdit = Boolean(initial);
  const inThisMonth = month === monthKeyOf(new Date());
  const [type, setType] = useState(initial?.type || 'expense');
  const [person, setPerson] = useState(initial?.person || 'a');
  const [scope, setScope] = useState(initial?.scope || 'shared');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category || 'Housing');
  const [note, setNote] = useState(initial?.note || '');
  const [date, setDate] = useState(initial?.date || (inThisMonth ? todayISO() : `${month}-01`));
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring || false);
  const [error, setError] = useState('');

  const touchedType = useRef(false);
  const isCredit = type === 'income' && scope === 'shared';
  const cats = type === 'income' && !isCredit ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  const th = person === 'a' 
    ? { border: 'border-indigo-100', ring: 'focus:ring-indigo-500', bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-600' }
    : { border: 'border-pink-100', ring: 'focus:ring-pink-500', bg: 'bg-pink-600', hover: 'hover:bg-pink-700', text: 'text-pink-600' };

  useEffect(() => {
    if (!touchedType.current) return;
    setCategory(type === 'income' && scope !== 'shared' ? 'Salary' : 'Housing');
  }, [type, scope]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!isFinite(n) || n <= 0) return setError('Amount must be greater than zero.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Invalid date.');
    
    const entry = {
      id: initial?.id || uid(), type, person,
      amount: Math.round(n * 100) / 100,
      scope, category, note: note.trim(), date,
      isRecurring,
      recurringId: initial?.recurringId || (isRecurring ? uid() : undefined)
    };

    setError('');
    if (isEdit) onSave(entry);
    else onAdd(entry);
  };

  return (
    <form onSubmit={submit} className="bg-white p-2 md:p-4 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Transaction' : 'Record Transaction'}</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transaction Type</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => { touchedType.current = true; setType('expense'); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Expense</button>
            <button type="button" onClick={() => { touchedType.current = true; setType('income'); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Who paid/earned it?</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setPerson('a')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${person === 'a' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{nameA}</button>
            <button type="button" onClick={() => setPerson('b')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${person === 'b' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{nameB}</button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How is it handled?</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setScope('shared')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${scope === 'shared' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Shared</button>
            <button type="button" onClick={() => setScope('personal')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${scope === 'personal' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Personal</button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 font-bold text-slate-800 focus:ring-2 outline-none ${th.ring}`} placeholder="0.00" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:ring-2 outline-none ${th.ring}`}>
            {!cats.includes(category) && <option value={category}>{category}</option>}
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:ring-2 outline-none ${th.ring}`} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center h-4">Automation</label>
          <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className={`w-5 h-5 rounded outline-none ${th.text} ${th.ring}`} />
            <span className="font-semibold text-slate-700">Repeats monthly</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Note / Description (Optional)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:ring-2 outline-none ${th.ring}`} placeholder="E.g. Target run, electric bill..." />
        </div>
      </div>

      {error && <div className="text-rose-600 text-sm font-semibold p-3 bg-rose-50 rounded-lg">{error}</div>}

      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button type="submit" className={`flex-1 text-white font-bold py-4 rounded-xl shadow-md transition-colors ${th.bg} ${th.hover}`}>
          {isEdit ? 'Save Changes' : 'Add to Ledger'}
        </button>
        {isEdit && (
          <button type="button" onClick={() => onDelete(initial.id)} className="px-6 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-colors flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

/* ============================ TRENDS TAB ============================ */
function TrendsTab({ M, trend, data, nameA, nameB, viewMode }: any) {
  const goal = Number(data.goal) || 0;

  const catRows = useMemo(() => {
    const map: any = {};
    const bucket = (k: any) => (map[k] = map[k] || { category: k, shared: 0, a: 0, b: 0, credit: 0 });
    M.rows.forEach((e: any) => {
      const k = e.category || 'Other';
      const amt = Number(e.amount) || 0;
      if (e.type === 'expense') {
        if (e.scope === 'shared') bucket(k).shared += amt;
        else bucket(k)[e.person] += amt;
      } else if (e.scope === 'shared') {
        bucket(k).credit += amt;          
      }
    });
    return Object.values(map)
      .map((r: any) => ({
        ...r,
        gross: r.shared + r.a + r.b,
        total: r.shared + r.a + r.b - r.credit,   
        budget: Number(data.budgets?.[r.category]) || 0,
      }))
      .filter((r: any) => {
        if (viewMode === 'household') return r.gross > 0 || r.credit > 0;
        if (viewMode === 'a') return r.a > 0 || r.shared > 0;
        if (viewMode === 'b') return r.b > 0 || r.shared > 0;
        return false;
      })
      .sort((x: any, y: any) => y.total - x.total);
  }, [M.rows, data.budgets, viewMode]);

  const maxCat = Math.max(1, ...catRows.map((r: any) => Math.max(r.total, r.budget)));

  // Data key selection for chart
  const dataKey = viewMode === 'household' ? 'savings' : (viewMode === 'a' ? 'savingsA' : 'savingsB');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Savings History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [money(v), 'Saved']} />
              <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={60}>
                {trend.map((d: any, i: any) => (
                  <Cell key={i} fill={d[dataKey] >= 0 ? CHART_COLORS.emerald : CHART_COLORS.red500} />
                ))}
              </Bar>
              {viewMode === 'household' && goal > 0 && (
                <Line type="monotone" dataKey={() => goal} stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} name="Goal" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Categorical Breakdown</h3>
        
        {catRows.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No expenses found for this view.</div>
        ) : (
          <div className="space-y-6">
            {catRows.map((r: any) => {
              // Calculate width logic based on viewMode
              let wShared = 0, wA = 0, wB = 0;
              let totalDisplayed = 0;
              
              if (viewMode === 'household') {
                wShared = Math.max(0, r.shared - r.credit); wA = r.a; wB = r.b;
                totalDisplayed = r.total;
              } else if (viewMode === 'a') {
                wShared = Math.max(0, (r.shared - r.credit) * M.splitA); wA = r.a;
                totalDisplayed = wShared + wA;
              } else {
                wShared = Math.max(0, (r.shared - r.credit) * M.splitB); wB = r.b;
                totalDisplayed = wShared + wB;
              }

              const budgetTarget = viewMode === 'household' ? r.budget : (viewMode === 'a' ? r.budget * M.splitA : r.budget * M.splitB);
              const over = r.budget > 0 && totalDisplayed > budgetTarget;

              return (
                <div key={r.category}>
                  <div className="flex justify-between items-end mb-2">
                    <span className={`text-sm font-bold ${over ? 'text-rose-600' : 'text-slate-700'}`}>{r.category} {over && ' (Over Budget)'}</span>
                    <span className={`text-sm font-bold ${over ? 'text-rose-600' : 'text-slate-700'}`}>{money(totalDisplayed)}</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(wShared / maxCat) * 100}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${(wA / maxCat) * 100}%` }} className="bg-indigo-500 h-full" />
                    <div style={{ width: `${(wB / maxCat) * 100}%` }} className="bg-pink-500 h-full" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ SETTINGS TAB ============================ */
function SettingsTab({ data, patch, setData, nameA, nameB, backendMode, spreadsheetId, onSwitchSpreadsheet }: any) {
  const [confirmClear, setConfirmClear] = useState(false);
  return (
    <div className="space-y-6">
      {/* Backend Connection Status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Backend Connection</h3>
        
        {backendMode === 'sheets' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800">Linked Google Sheet</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                {spreadsheetId && (
                  <p className="text-xs text-slate-500 font-mono truncate max-w-md">
                    ID: {spreadsheetId}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {spreadsheetId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    Open Sheet
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {onSwitchSpreadsheet && (
                  <button
                    onClick={onSwitchSpreadsheet}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Switch Sheet URL
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-xs text-slate-500">
              🔒 <strong>Single-File Security:</strong> HomeLedger is granted access only to this specific spreadsheet file (<code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">drive.file</code> scope). No other files in your Google Drive can be accessed or viewed.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-800">Cloud Database (Firestore)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">High speed cloud database with real-time replication.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">User Profiles</h3>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">User 1 Name (Indigo)</label>
            <input type="text" value={data.names.a} onChange={(e) => patch({ names: { ...data.names, a: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">User 2 Name (Pink)</label>
            <input type="text" value={data.names.b} onChange={(e) => patch({ names: { ...data.names, b: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-rose-700 focus:ring-2 focus:ring-pink-500 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">User 1 Monthly Salary</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
              <input type="number" value={data.incomes?.a || ''} onChange={(e) => patch({ incomes: { ...data.incomes, a: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 4000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">User 2 Monthly Salary</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
              <input type="number" value={data.incomes?.b || ''} onChange={(e) => patch({ incomes: { ...data.incomes, b: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 font-medium text-slate-700 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="e.g. 4000" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Household Goals & Budgets</h3>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{nameA}'s Shared Bill Split (%)</label>
            <div className="relative">
              <input type="number" min="0" max="100" value={data.split?.a ?? 50} onChange={(e) => patch({ split: { a: Number(e.target.value), b: 100 - Number(e.target.value) } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-8 font-medium text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{nameB}'s Shared Bill Split (%)</label>
            <div className="relative">
              <input type="number" min="0" max="100" value={data.split?.b ?? 50} onChange={(e) => patch({ split: { b: Number(e.target.value), a: 100 - Number(e.target.value) } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-8 font-medium text-pink-700 focus:ring-2 focus:ring-pink-500 outline-none" />
              <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Combined Monthly Savings Goal</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
              <input type="number" value={data.goal} onChange={(e) => patch({ goal: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ledger Start Month</label>
            <input type="month" value={data.startMonth || '2026-08'} onChange={(e) => patch({ startMonth: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-700 mb-4">Category Budgets (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPENSE_CATEGORIES.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 w-32">{c}</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number" step="10" placeholder="No limit"
                  value={data.budgets?.[c] ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = { ...(data.budgets || {}) };
                    if (v === '') delete next[c]; else next[c] = v;
                    patch({ budgets: next });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-7 font-medium text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-800 mb-1">Danger Zone</h3>
          <p className="text-sm text-rose-600">Permanently delete all historical ledger entries.</p>
        </div>
        {confirmClear ? (
          <div className="flex gap-2">
            <button onClick={() => setConfirmClear(false)} className="bg-white border-2 border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => { setData((d:any) => ({ ...d, entries: [] })); setConfirmClear(false); }} className="bg-rose-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-rose-700 transition-colors shadow-sm">
              Yes, Delete All
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="bg-white border-2 border-rose-200 text-rose-700 font-bold py-2 px-6 rounded-xl hover:bg-rose-100 transition-colors">
            Clear Ledger
          </button>
        )}
      </div>
    </div>
  );
}
