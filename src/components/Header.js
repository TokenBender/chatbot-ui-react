import React from 'react';

function Header() {
  return (
    <nav className="navbar navbar-dark bg-dark">
      <span className="navbar-brand mb-0 h1">ChatKit</span>
      <div>
        <span className="navbar-text mr-3">GPT-3.5 Turbo</span>
        <span className="navbar-text">Using API Key</span>
      </div>
    </nav>
  );
}

export default Header;
