import React from 'react';
import ReactDOM from 'react-dom/client';
import './aws-config';
import App from './App';
/* revert: keep original global styles */

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
