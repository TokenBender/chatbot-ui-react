import React, { useState, useContext, useEffect } from 'react';
import { FolderContext } from '../context/FolderContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatArea() {
  const { folders, setFolders, selectedFolder } = useContext(FolderContext);
  const [input, setInput] = useState('');

  useEffect(() => {
    console.log('Folders:', folders);
    console.log('Selected Folder:', selectedFolder);
  }, [folders, selectedFolder]);

  const sendMessage = () => {
    console.log('Sending message:', input);
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
        body: JSON.stringify({ message: input, history: chatHistory, chat_name: selectedFolder }),
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
        {currentFolderChats.length > 0 ? currentFolderChats.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`} style={{ textAlign: 'left' }}>
            <div className="message-content" style={{ textAlign: 'left' }}>
              <ReactMarkdown
                children={msg.text}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={dark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>
          </div>
        )) : <div>No messages yet</div>}
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
