import React, { useEffect, useState } from 'react';
import './Header.css';

function Header() {
  const [modelInfo, setModelInfo] = useState({ model: '', using_api_key: false });

  useEffect(() => {
    fetch('http://127.0.0.1:5001/config')
      .then(response => response.json())
      .then(data => setModelInfo(data))
      .catch(error => console.error('Error fetching config:', error));
  }, []);

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <span className="navbar-brand mb-0 h1">ChatKit</span>
      <div className="navbar-text ml-auto status-text">
        {modelInfo.model} {modelInfo.using_api_key ? <span className="api-key-text">Using API Key</span> : <span className="api-key-text">No API Key</span>}
      </div>
    </nav>
  );
}

export default Header;