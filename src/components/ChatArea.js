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
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.body.getReader();
      })
      .then(reader => {
        const decoder = new TextDecoder();
        let accumulatedData = '';

        const processText = ({ done, value }) => {
          if (done) {
            return;
          }

          const text = decoder.decode(value);
          accumulatedData += text;

          const lines = accumulatedData.split('\n');
          accumulatedData = lines.pop(); // Keep the last incomplete line for the next chunk

          lines.forEach(line => {
            if (line.trim().startsWith('data: ')) {
              const jsonString = line.trim().substring(6);
              try {
                const parsedData = JSON.parse(jsonString);
                const assistantMessage = parsedData.choices[0].message.content;
                const updatedFoldersWithAssistantResponse = folders.map((folder) => {
                  if (folder.name === selectedFolder) {
                    return {
                      ...folder,
                      chats: [...folder.chats, { text: assistantMessage, sender: 'assistant' }],
                    };
                  }
                  return folder;
                });
                setFolders(updatedFoldersWithAssistantResponse);
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          });

          reader.read().then(processText);
        };

        reader.read().then(processText);
      })
      .catch(error => console.error('Error fetching assistant response:', error));

      setInput('');
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