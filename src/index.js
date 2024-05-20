import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { FolderProvider } from './context/FolderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FolderProvider>
    <App />
  </FolderProvider>
);