import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure this import is present
import App from './App';
import { FolderProvider } from './context/FolderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FolderProvider>
    <App />
  </FolderProvider>
);
