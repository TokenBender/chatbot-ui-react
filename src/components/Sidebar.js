import React, { useState, useEffect } from 'react';

const SAVE_INTERVAL_MS = 5000; // Save every 5 seconds

function saveChatsToLocalStorage(chats) {
  localStorage.setItem('chats', JSON.stringify(chats));
}

function Sidebar() {
  const [chats, setChats] = useState([]);
  const [renamingChat, setRenamingChat] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const generateDefaultChatName = () => {
    const modelName = "default_model"; // Replace with actual model name if available
    const dateTime = new Date().toLocaleString();
    return `${modelName}-${dateTime}`;
  };

  useEffect(() => {
    if (chats.length === 0) {
      setChats([{ name: generateDefaultChatName(), chats: [] }]);
    }
  }, [chats]);

  useEffect(() => {
    console.log('Chats state:', chats);
  }, [chats]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveChatsToLocalStorage(chats);
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [chats]);

  return (
    <div className="col-3 bg-light border-right vh-100 p-3">
      <div>
        {chats.length === 0 && <div>No chats available</div>}
      </div>
      <ul className="list-group list-group-flush">
        {chats.map((chat, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {renamingChat === index ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="form-control"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const updatedChats = [...chats];
                    updatedChats[index].name = renameValue;
                    setChats(updatedChats);
                    setRenamingChat(null);
                    setRenameValue('');
                  }
                }}
              />
            ) : (
              <span className="chat-name">{chat.name}</span>
            )}
            <div>
              <i
                className="fas fa-pencil-alt ml-2"
                style={{ cursor: 'pointer', marginRight: '10px' }}
                onClick={() => {
                  setRenamingChat(index);
                  setRenameValue(chat.name);
                }}
              ></i>
              <i
                className="fas fa-trash ml-2"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const updatedChats = chats.filter((_, i) => i !== index);
                  setChats(updatedChats);
                }}
              ></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
