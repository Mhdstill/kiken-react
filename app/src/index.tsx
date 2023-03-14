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

import './antd.less';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const axiosClient = buildAxiosInstance({ baseURL: 'https://kiken-qr.com' });
const dataManager = new DefaultDataManager(axiosClient);
const queryClient = new QueryClient();

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
