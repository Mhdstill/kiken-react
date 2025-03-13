import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import frFR from 'antd/es/locale/fr_FR';
import App from './App';
import i18n from './services/i18n/i18n';
import DataManagerProvider from './services/dataManager/DataManagerProvider';
import { DefaultDataManager } from './services/dataManager/DefaultDataManager';
import { buildAxiosInstance } from './services/utils';
import { API_URL } from './services/utils';

import './antd.less';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const axiosClient = buildAxiosInstance({ baseURL: API_URL });
const dataManager = new DefaultDataManager(axiosClient);
const queryClient = new QueryClient();

// Détection de la PWA et stockage dans localStorage
const isPWAFromURL = new URLSearchParams(window.location.search).get('source') === 'pwa';
const isPWAFromStorage = localStorage.getItem('isPWA') === 'true';

// Si détecté comme PWA via l'URL, stocker dans localStorage
if (isPWAFromURL) {
  localStorage.setItem('isPWA', 'true');
  console.log('Application lancée depuis une PWA installée! (détecté via URL)');
}

// Si déjà stocké dans localStorage, c'est une PWA
if (isPWAFromStorage) {
  console.log('Application lancée depuis une PWA installée! (détecté via localStorage)');
}

// Si c'est une PWA (via URL ou localStorage), ajouter une classe au body
if (isPWAFromURL || isPWAFromStorage) {
  document.body.classList.add('pwa-mode');
  
  // Ajouter un badge visible pour indiquer que c'est une PWA (pour les tests)
  setTimeout(() => {
    const pwaBadge = document.createElement('div');
    pwaBadge.style.position = 'fixed';
    pwaBadge.style.top = '10px';
    pwaBadge.style.left = '50%';
    pwaBadge.style.transform = 'translateX(-50%)';
    pwaBadge.style.backgroundColor = 'green';
    pwaBadge.style.color = 'white';
    pwaBadge.style.padding = '10px 20px';
    pwaBadge.style.borderRadius = '20px';
    pwaBadge.style.zIndex = '9999';
    pwaBadge.textContent = 'Mode PWA Activé';
    document.body.appendChild(pwaBadge);
    
    // Faire disparaître le badge après 5 secondes
    setTimeout(() => {
      pwaBadge.style.opacity = '0';
      pwaBadge.style.transition = 'opacity 1s';
      setTimeout(() => pwaBadge.remove(), 1000);
    }, 5000);
  }, 1000);
}

root.render(
  <React.StrictMode>
    <Suspense fallback="loading">
      <I18nextProvider i18n={i18n}>
        <ConfigProvider locale={frFR}>
          <QueryClientProvider client={queryClient}>
            <DataManagerProvider dataManager={dataManager}>
              <App />
            </DataManagerProvider>
          </QueryClientProvider>
        </ConfigProvider>
      </I18nextProvider>
    </Suspense>
  </React.StrictMode>
);
