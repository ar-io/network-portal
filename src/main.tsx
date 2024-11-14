import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import './index.css';
// setup sentry
import './services/sentry.ts';
import { Logger } from '@ar.io/sdk/web';

Logger.default.setLogLevel('none');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
