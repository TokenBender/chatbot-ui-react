import React from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Header from './components/Header';
import BingSearch from './components/BingSearch';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container-fluid">
        <div className="row content">
          <Sidebar />
          <ChatArea />
          <BingSearch />
        </div>
      </div>
    </div>
  );
}

export default App;
