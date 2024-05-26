import React, { useState, useContext } from 'react';
import { FolderContext } from '../context/FolderContext';

function ChatArea() {
  const { folders, setFolders, selectedFolder } = useContext(FolderContext);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input) {
      console.log('Current folders before user message:', folders);
      console.log('Selected folder:', selectedFolder);
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
      console.log('Updated folders after user message:', updatedFolders);
      console.log('User message:', input);
      setInput('');

      const currentFolderChats = updatedFolders.find((folder) => folder.name === selectedFolder)?.chats || [];
      const chatHistory = currentFolderChats.map(chat => ({
        role: chat.sender === 'user' ? 'user' : 'assistant',
        content: chat.text
      }));

      // Make a request to the backend server
      fetch('http://127.0.0.1:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, history: chatHistory }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Assistant response:', data.response);
          const updatedFoldersWithAssistantResponse = updatedFolders.map((folder) => {
            if (folder.name === selectedFolder) {
              return {
                ...folder,
                chats: [...folder.chats, { text: data.response, sender: 'assistant' }],
              };
            }
            return folder;
          });
          console.log('Updated folders with assistant response:', updatedFoldersWithAssistantResponse);
          setFolders(updatedFoldersWithAssistantResponse);
        })
        .catch((error) => {
          console.error('Error fetching assistant response:', error);
        });
    }
  };

  const currentFolderChats = folders.find((folder) => folder.name === selectedFolder)?.chats || [];
  console.log('Current folder chats:', currentFolderChats);

  return (
    <div className="col-9 d-flex flex-column chat-area">
      <div className="flex-grow-1 bg-white p-3 border-bottom overflow-auto chat-messages">
        {currentFolderChats.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
        {console.log('Rendering chat messages:', currentFolderChats)}
      </div>
      <div className="p-3 bg-light">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
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