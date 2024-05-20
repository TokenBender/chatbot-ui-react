import React, { useState } from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';
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
      // Simulate chatbot response
      setTimeout(() => {
        const updatedFoldersWithBotResponse = folders.map((folder) => {
          if (folder.name === selectedFolder) {
            return {
              ...folder,
              chats: [...folder.chats, { text: 'This is a bot response', sender: 'bot' }],
            };
          }
          return folder;
        });
        setFolders(updatedFoldersWithBotResponse);
      }, 1000);
    }
  };

  const currentFolderChats = folders.find((folder) => folder.name === selectedFolder)?.chats || [];

  return (
    <div className="col-9 d-flex flex-column">
      <div className="flex-grow-1 bg-white p-3 border-bottom">
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
