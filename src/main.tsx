import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import firebaseConfig from '../firebase-applet-config.json';

const GOOGLE_CLIENT_ID = firebaseConfig.oAuthClientId;

// Load gapi script
const script = document.createElement('script');
script.src = 'https://apis.google.com/js/api.js';
script.async = true;
script.defer = true;
document.head.appendChild(script);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
