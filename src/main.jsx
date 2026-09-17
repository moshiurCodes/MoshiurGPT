import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import highlight.js dark/light base theme
import 'highlight.js/styles/atom-one-dark.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
