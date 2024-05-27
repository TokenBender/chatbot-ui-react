import React, { useEffect, useState } from 'react';
import './Header.css';

function Header() {
  const [modelInfo, setModelInfo] = useState({ model: '', using_api_key: false });
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:5001/config')
      .then(response => response.json())
      .then(data => {
        setModelInfo(data);
        setSelectedModel(data.model);
      })
      .catch(error => console.error('Error fetching config:', error));

    fetch('http://127.0.0.1:5001/models')
      .then(response => response.json())
      .then(data => setModels(data.models))
      .catch(error => console.error('Error fetching models:', error));
  }, []);

  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);

    fetch('http://127.0.0.1:5001/update-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: newModel }),
    })
      .then(response => response.json())
      .then(data => setModelInfo(data))
      .catch(error => console.error('Error updating model:', error));
  };

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <span className="navbar-brand mb-0 h1">ChatMaxx Furiousa</span>
      <div className="navbar-text ml-auto status-text">
        <select value={selectedModel} onChange={handleModelChange} className="form-control">
          {models.map((model, index) => (
            <option key={index} value={model}>{model}</option>
          ))}
        </select>
        {modelInfo.using_api_key ? <span className="api-key-text">Using API Key</span> : <span className="api-key-text">No API Key</span>}
      </div>
    </nav>
  );
}

export default Header;
