import React, { useReducer, useContext, useEffect, useState } from 'react';
import { FolderContext } from '../context/FolderContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatArea() {
  const { folders, setFolders, selectedFolder } = useContext(FolderContext);
  const [input, setInput] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editingMessageValue, setEditingMessageValue] = useState('');

  useEffect(() => {
  }, [folders, selectedFolder]);

  const sendMessage = async (editedMessageIndex = null) => {
    if (input) {
      let updatedFolders;
      if (editedMessageIndex !== null) {
        updatedFolders = folders.map((folder) => {
          if (folder.name === selectedFolder) {
            const updatedChats = folder.chats.map((chat, index) => {
              if (index === editedMessageIndex) {
                return { ...chat, text: input };
              }
              return chat;
            });
            return { ...folder, chats: updatedChats };
          }
          return folder;
        });
      } else {
        updatedFolders = folders.map((folder) => {
          if (folder.name === selectedFolder) {
            return {
              ...folder,
              chats: [...folder.chats, { text: input, sender: 'user' }],
            };
          }
          return folder;
        });
      }
      setFolders(updatedFolders);
      setInput('');
      setEditingMessageIndex(null);
      setEditingMessageValue('');

      const currentFolderChats = updatedFolders.find((folder) => folder.name === selectedFolder)?.chats || [];
      const chatHistory = currentFolderChats.map(chat => ({
        role: chat.sender === 'user' ? 'user' : 'assistant',
        content: chat.text
      }));

      const query = input.startsWith('/web') ? input.replace('/web', '').trim() : input;
      const endpoint = input.startsWith('/web') ? 'bing-search' : 'chat';
      const body = input.startsWith('/web') ? { query } : { message: input, history: chatHistory, chat_name: selectedFolder };

      if (input.startsWith('/web')) {
        console.log('Sending request to endpoint:', endpoint);
        fetch(`http://127.0.0.1:5001/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Received response from endpoint:', data);
            if (data?.results && Array.isArray(data.results)) {
              console.log('Processing search results:', data.results);
              const searchSummary = data.results.map(result => result.summary).join('\n');
              const assistantQuery = `Answer the user query using the provided web search summary\nUser: ${query}\nSearch Summary: ${searchSummary}`;
              const updatedChatHistory = [...chatHistory, { role: 'user', content: query }];
              console.log('Sending search summary to assistant');
              fetch('http://127.0.0.1:5001/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: assistantQuery, history: updatedChatHistory, chat_name: selectedFolder }),
              })
                .then((response) => response.json())
                .then((data) => {
                  const finalUpdatedFoldersWithAssistantResponse = updatedFolders.map((folder) => {
                    if (folder.name === selectedFolder) {
                      return {
                        ...folder,
                        chats: [...folder.chats, { text: data.response, sender: 'assistant' }],
                      };
                    }
                    return folder;
                  });
                  setFolders(finalUpdatedFoldersWithAssistantResponse);
                })
                .catch((error) => {
                  console.error('Error fetching assistant response:', error);
                });
            } else {
              console.error('Error: data.results is not an array or is undefined:', data.results);
              alert('An error occurred while fetching search results. Please try again later.');
            }
          })
          .catch((error) => {
            console.error('Error fetching assistant response:', error);
            alert('An error occurred while fetching assistant response. Please try again later.');
          });
      } else {
        console.log('Sending request to endpoint:', endpoint);
        fetch(`http://127.0.0.1:5001/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Received response from endpoint:', data);
            let updatedFoldersWithAssistantResponse = updatedFolders.map((folder) => {
              if (folder.name === selectedFolder) {
                return {
                  ...folder,
                  chats: [...folder.chats, { text: data.response, sender: 'assistant' }],
                };
              }
              return folder;
            });
            setFolders(updatedFoldersWithAssistantResponse);
          })
          .catch((error) => {
            console.error('Error fetching assistant response:', error);
            alert('An error occurred while fetching assistant response. Please try again later.');
          });
      }

      console.log('Sending request to endpoint:', endpoint);
      fetch(`http://127.0.0.1:5001/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Received response from endpoint:', data);
          let updatedFoldersWithAssistantResponse;
          if (input.startsWith('/web')) {
            if (data?.results && Array.isArray(data.results)) {
              console.log('Processing search results:', data.results);
              const searchSummary = data.results.map(result => result.summary).join('\n');
              const assistantQuery = `Answer the user query using the provided web search summary\nUser: ${query}\nSearch Summary: ${searchSummary}`;
              const updatedChatHistory = [...chatHistory, { role: 'user', content: query }];
              console.log('Sending search summary to assistant');
              fetch('http://127.0.0.1:5001/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: assistantQuery, history: updatedChatHistory, chat_name: selectedFolder }),
              })
                .then((response) => response.json())
                .then((data) => {
                  const finalUpdatedFoldersWithAssistantResponse = updatedFoldersWithAssistantResponse.map((folder) => {
                    if (folder.name === selectedFolder) {
                      return {
                        ...folder,
                        chats: [...folder.chats, { text: data.response, sender: 'assistant' }],
                      };
                    }
                    return folder;
                  });
                  setFolders(finalUpdatedFoldersWithAssistantResponse);
                })
                .catch((error) => {
                  console.error('Error fetching assistant response:', error);
                });
            } else {
              console.error('Error: data.results is not an array or is undefined:', data.results);
              alert('An error occurred while fetching search results. Please try again later.');
            }
          } else {
            updatedFoldersWithAssistantResponse = updatedFolders.map((folder) => {
              if (folder.name === selectedFolder) {
                return {
                  ...folder,
                  chats: [...folder.chats, { text: data.response, sender: 'assistant' }],
                };
              }
              return folder;
            });
            setFolders(updatedFoldersWithAssistantResponse);
          }
          setInput('');  // Clear the input field after processing
          setInput('');  // Clear the input field after processing
        })
        .catch((error) => {
          console.error('Error fetching assistant response:', error);
          alert('An error occurred while fetching assistant response. Please try again later.');
        });
    }
  };

  const handleSearch = () => {
    console.log('Searching for:', input);
    if (input) {
      fetch('http://127.0.0.1:5001/bing-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Search results:', data.results);
          const searchResults = data.results.map(result => `${result.name}: ${result.url}`).join('\n');
          const updatedFoldersWithSearchResults = folders.map((folder) => {
            if (folder.name === selectedFolder) {
              return {
                ...folder,
                chats: [...folder.chats, { text: searchResults, sender: 'assistant' }],
              };
            }
            return folder;
          });
          setFolders(updatedFoldersWithSearchResults);
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
        });
    }
  };

  const currentFolderChats = folders.find((folder) => folder.name === selectedFolder)?.chats || [];

  return (
    <div className="col-9 d-flex flex-column chat-area">
      <div className="flex-grow-1 bg-white p-3 border-bottom overflow-auto chat-messages">
        {currentFolderChats.length > 0 ? currentFolderChats.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`} style={{ textAlign: 'left' }}>
            {msg.sender === 'user' && editingMessageIndex === index ? (
                <input
                  type="text"
                  value={editingMessageValue}
                  onChange={(e) => setEditingMessageValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const updatedFolders = folders.map((folder) => {
                        if (folder.name === selectedFolder) {
                          const updatedChats = folder.chats.slice(0, index + 1).map((chat, i) => {
                            if (i === index) {
                              return { ...chat, text: editingMessageValue };
                            }
                            return chat;
                          });
                          return { ...folder, chats: updatedChats };
                        }
                        return folder;
                      });
                      setFolders(updatedFolders);
                      setEditingMessageIndex(null);
                      setEditingMessageValue('');
                      // Fetch assistant response with history up to the edited message
                      const currentFolderChats = updatedFolders.find((folder) => folder.name === selectedFolder)?.chats || [];
                      const chatHistory = currentFolderChats.slice(0, index + 1).map(chat => ({
                        role: chat.sender === 'user' ? 'user' : 'assistant',
                        content: chat.text
                      }));

                      fetch('http://127.0.0.1:5001/chat', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: editingMessageValue, history: chatHistory, chat_name: selectedFolder }),
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
                  }}
                  className="form-control"
                />
              ) : (
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
              )}
              {msg.sender === 'user' && (
                <i
                  className="fas fa-pencil-alt ml-2"
                  style={{ cursor: 'pointer', marginLeft: '10px' }}
                  onClick={() => {
                    setEditingMessageIndex(index);
                    setEditingMessageValue(msg.text);
                  }}
                ></i>
              )}
          </div>
        )) : <div>No messages yet</div>}
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
            <button className="btn btn-secondary" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
