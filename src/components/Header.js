import React from 'react';
import './Header.css';

function Header() {
  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <span className="navbar-brand mb-0 h1">ChatKit</span>
      <div className="navbar-text ml-auto status-text">
        GPT-3.5 Turbo <span className="api-key-text">Using API Key</span>
      </div>
    </nav>
  );
}

export default Header;
