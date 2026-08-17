import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { initGapiClient, loadAppData, saveAppData, SCOPES } from './google-api';
import { initFirebaseAuth, signInWithFirebase, signOutFirebase, loadFirebaseAppData, saveFirebaseAppData } from './firebase-api';
import { createProfessionalSpreadsheet, ensureSpreadsheetStructure, extractSpreadsheetId } from './spreadsheet-service';
import HouseholdLedger, { DEFAULT_DATA } from './HouseholdLedger';
import { FileSpreadsheet, ArrowRight, Loader2, LogOut, Database, Cloud, ExternalLink, Link2, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export default function App() {
  const [gapiReady, setGapiReady] = useState(false);
  const [authStage, setAuthStage] = useState<'login' | 'checking' | 'setup' | 'loading' | 'dashboard'>('login');
  const [backendMode, setBackendMode] = useState<'sheets' | 'firebase'>(
    (localStorage.getItem('homeLedger_backendMode') as 'sheets' | 'firebase') || 'sheets'
  );
  
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    localStorage.getItem('homeLedger_sheetId') || null
  );
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appData, setAppData] = useState<any>(null);
  
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initGapiClient().then(() => setGapiReady(true)).catch(console.error);
    
    // Listen for Firebase Auth state changes
    const unsubscribe = initFirebaseAuth(async (user) => {
      setFirebaseUser(user);
      if (user && localStorage.getItem('homeLedger_backendMode') === 'firebase') {
        setAuthStage('loading');
        try {
          const data = await loadFirebaseAppData(user.uid);
          setAppData(data || null);
          setAuthStage(data ? 'dashboard' : 'setup');
        } catch (e) {
          setAuthStage('setup');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const switchMode = (mode: 'sheets' | 'firebase') => {
    setBackendMode(mode);
    localStorage.setItem('homeLedger_backendMode', mode);
    setSetupError(null);
  };

  const fetchAppData = async (token: string, id: string) => {
    setAuthStage('loading');
    try {
      await ensureSpreadsheetStructure(token, id);
      const data = await loadAppData(token, id);
      setAppData(data || DEFAULT_DATA);
      setSpreadsheetId(id);
      localStorage.setItem('homeLedger_sheetId', id);
      setAuthStage('dashboard');
    } catch (err: any) {
      console.error('Error loading app data from sheet:', err);
      setSetupError('Unable to load data from this Google Sheet. Please verify permissions or URL.');
      setAuthStage('setup');
    }
  };

  const loginSheets = useGoogleLogin({
    scope: SCOPES,
    onSuccess: async (tokenResponse) => {
      if (!gapiReady) return;
      const token = tokenResponse.access_token;
      setAccessToken(token);
      setAuthStage('checking');
      
      try {
        const savedId = localStorage.getItem('homeLedger_sheetId');
        if (savedId) {
          setSpreadsheetId(savedId);
          await fetchAppData(token, savedId);
        } else {
          setAuthStage('setup');
        }
      } catch (e) {
        console.error('Error accessing saved spreadsheet:', e);
        setAuthStage('setup'); 
      }
    },
    onError: () => {
      console.error('Login Failed');
      alert('Google Sign-in failed. Please try again.');
    }
  });

  const handleFirebaseLogin = async () => {
    try {
      setAuthStage('checking');
      const user = await signInWithFirebase();
      const data = await loadFirebaseAppData(user.uid);
      if (data) {
        setAppData(data);
        setAuthStage('dashboard');
      } else {
        setAuthStage('setup');
      }
    } catch (error) {
      setAuthStage('login');
      alert('Failed to sign in to Cloud Database');
    }
  };

  const handleConnectByUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accessToken) return;
    setSetupError(null);

    const parsedId = extractSpreadsheetId(sheetUrlInput);
    if (!parsedId) {
      setSetupError('Invalid Google Sheets link. Please paste a full Google Sheets URL (e.g. https://docs.google.com/spreadsheets/d/...) or ID.');
      return;
    }

    setIsProcessing(true);
    try {
      await fetchAppData(accessToken, parsedId);
    } catch (err: any) {
      setSetupError('Could not connect to this spreadsheet. Ensure it is shared with your account or accessible.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPicker = () => {
    if (!accessToken) return;
    setSetupError(null);
    const pickerOrigin =
      window.location.ancestorOrigins &&
      window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    if (!window.google?.picker) {
      alert('Google Picker is loading. Please try again in a moment.');
      return;
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(accessToken)
      .setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          setIsProcessing(true);
          await fetchAppData(accessToken, file.id);
          setIsProcessing(false);
        }
      })
      .setOrigin(pickerOrigin)
      .build();
    picker.setVisible(true);
  };

  const handleGenerateSheets = async () => {
    if (!accessToken) return;
    setIsProcessing(true);
    setSetupError(null);
    try {
      const id = await createProfessionalSpreadsheet(accessToken);
      setSpreadsheetId(id);
      localStorage.setItem('homeLedger_sheetId', id);
      await fetchAppData(accessToken, id);
    } catch (error) {
      console.error('Error generating sheet:', error);
      setSetupError('Failed to create new spreadsheet in your Google Drive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFirebase = async () => {
    if (!firebaseUser) return;
    setIsProcessing(true);
    try {
      await saveFirebaseAppData(firebaseUser.uid, DEFAULT_DATA);
      setAppData(DEFAULT_DATA);
      setAuthStage('dashboard');
    } catch (error) {
      console.error('Error creating cloud ledger', error);
      alert('Failed to initialize cloud database');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    if (backendMode === 'firebase') {
      await signOutFirebase();
    }
    setAccessToken(null);
    setSpreadsheetId(null);
    setAppData(null);
    setAuthStage('login');
  };

  const handleSaveData = async (newData: any) => {
    setAppData(newData);
    if (backendMode === 'firebase' && firebaseUser) {
      await saveFirebaseAppData(firebaseUser.uid, newData);
    } else if (backendMode === 'sheets' && accessToken && spreadsheetId) {
      await saveAppData(accessToken, spreadsheetId, newData);
    }
  };

  const handleSwitchSpreadsheet = () => {
    setAuthStage('setup');
    setSheetUrlInput('');
    setSetupError(null);
  };

  return (
    <div className='h-screen w-full bg-[#f8fafc] text-slate-800 font-sans flex flex-col overflow-hidden'>
      {authStage !== 'dashboard' && (
        <header className='h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h1 className='text-base font-semibold tracking-tight text-slate-900'>OurNest</h1>
          </div>
          {(accessToken || firebaseUser) && (
            <button 
              onClick={handleLogout} 
              title="Sign Out"
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </header>
      )}

      <main className='flex-1 overflow-hidden flex flex-col'>
        {authStage === 'login' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            
            <div className='bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full flex flex-col items-center mb-6'>
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-5 text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-slate-900 mb-2'>Welcome to OurNest</h2>
              <p className='text-slate-600 text-sm mb-6 leading-relaxed'>
                {backendMode === 'sheets' 
                  ? 'Your shared household finance & expense ledger with live Google Sheets sync.' 
                  : 'Your shared household finance ledger powered by Cloud Database.'}
              </p>
              
              <button 
                onClick={() => backendMode === 'sheets' ? loginSheets() : handleFirebaseLogin()} 
                disabled={backendMode === 'sheets' && !gapiReady}
                className='bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 px-6 rounded-xl font-semibold transition-colors shadow-sm w-full flex items-center justify-center gap-2'
              >
                Sign in with Google
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100 w-full text-xs text-slate-500 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Single-File Access Only
                </div>
                <p className="text-slate-400">The app only accesses the specific Google Sheet you link or create.</p>
              </div>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => switchMode('sheets')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${backendMode === 'sheets' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Personal (Google Sheets)
              </button>
              <button 
                onClick={() => switchMode('firebase')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${backendMode === 'firebase' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Cloud className="w-4 h-4" /> Cloud DB (Optional)
              </button>
            </div>

          </div>
        )}

        {(authStage === 'checking' || authStage === 'loading' || isProcessing) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center text-slate-600 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-slate-900 mb-3" />
              <p className="font-semibold text-slate-800 text-sm">
                {authStage === 'checking' ? 'Connecting to Google...' : (isProcessing ? 'Configuring spreadsheet...' : 'Loading household ledger...')}
              </p>
            </div>
          </div>
        )}

        {authStage === 'setup' && !isProcessing && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className='bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg w-full'>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-slate-900'>Connect Your Google Sheet</h2>
                  <p className='text-xs text-slate-500'>Link a single spreadsheet to store your private finances</p>
                </div>
              </div>

              {setupError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{setupError}</span>
                </div>
              )}

              {backendMode === 'sheets' ? (
                <div className="space-y-6">
                  {/* Option 1: URL input */}
                  <form onSubmit={handleConnectByUrl} className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Option 1: Paste Google Sheet URL
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={sheetUrlInput}
                          onChange={(e) => setSheetUrlInput(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!sheetUrlInput.trim() || isProcessing}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Connect Sheet
                      </button>
                    </div>
                  </form>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase">Or choose from Drive</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Option 2 & 3: Picker or Create */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleOpenPicker}
                      disabled={isProcessing}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-1">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Select Existing Sheet
                      </div>
                      <span className="text-[11px] text-slate-500">Pick any spreadsheet from your Google Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateSheets}
                      disabled={isProcessing}
                      className="p-3.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition-colors flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs mb-1">
                        <PlusCircle className="w-4 h-4 text-emerald-700" />
                        Create New Sheet
                      </div>
                      <span className="text-[11px] text-emerald-700/80">Generate a pre-formatted OurNest ledger in Drive</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Initialize your secure Firestore Cloud Database to begin syncing transactions.
                  </p>
                  <button 
                    onClick={handleGenerateFirebase} 
                    disabled={isProcessing}
                    className='bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm w-full flex items-center justify-center gap-2 text-sm'
                  >
                    Initialize Cloud Database
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {authStage === 'dashboard' && (
          <HouseholdLedger 
            initialData={appData} 
            onSave={handleSaveData} 
            backendMode={backendMode}
            spreadsheetId={spreadsheetId}
            onSwitchSpreadsheet={handleSwitchSpreadsheet}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}
