// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#f59e0b',
          colorBackground: '#0a2010',
          colorInputBackground: '#14532d',
          colorText: '#ffffff',
          colorTextSecondary: '#86efac',
          colorDanger: '#f87171',
          borderRadius: '0.75rem',
          fontFamily: 'Inter, Hind Siliguri, sans-serif',
        },
        elements: {
          card: 'shadow-2xl border border-green-700/50 bg-green-950/90',
          formButtonPrimary: 'bg-gold-500 hover:bg-gold-400 text-green-950 font-semibold',
          footerActionLink: 'text-gold-400 hover:text-gold-300',
          headerTitle: 'text-white font-bold',
          socialButtonsBlockButton: 'border-green-700/60 text-green-200 hover:bg-green-800/60',
        },
      }}
    >
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          gutter={8}
          toastOptions={{
            duration: 4500,
            style: {
              background: '#14532d',
              color: '#fff',
              border: '1px solid #166534',
              borderRadius: '12px',
              fontSize: '14px',
              maxWidth: '380px',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#052e16' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);
