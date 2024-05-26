import React, { useState, useContext } from 'react';
import { FolderContext } from '../context/FolderContext';

function ChatArea() {
  const { folders, setFolders, selectedFolder } = useContext(FolderContext);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input) {
      const updatedFolders = folders.map((folder) => {
        if (folder.name === selectedFolder) {
          return {
            ...folder,
            chats: [...folder.chats, { text: input, sender: 'user' }],
          };
        }
        return folder;
      });
      setFolders(updatedFolders);
      setInput('');
      // Make a request to the backend server
      fetch('http://127.0.0.1:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })
        .then((response) => response.json())
        .then((data) => {
          const updatedFoldersWithBotResponse = folders.map((folder) => {
            if (folder.name === selectedFolder) {
              return {
                ...folder,
                chats: [...folder.chats, { text: data.response, sender: 'bot' }],
              };
            }
            return folder;
          });
          setFolders(updatedFoldersWithBotResponse);
        });
    }
  };

  const currentFolderChats = folders.find((folder) => folder.name === selectedFolder)?.chats || [];

  return (
    <div className="col-9 d-flex flex-column chat-area">
      <div className="flex-grow-1 bg-white p-3 border-bottom overflow-auto chat-messages">
        {currentFolderChats.map((msg, index) => (
          <div key={index} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
            <div className="d-inline-block p-2 mb-2 border rounded">
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-light">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
