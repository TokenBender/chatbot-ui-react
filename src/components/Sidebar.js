import React, { useState, useEffect } from 'react';

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
  }, []);

  return (
    <div className="col-3 bg-light border-right vh-100 p-3">
      <div>
      </div>
      <ul className="list-group list-group-flush">
        {chats.map((chat, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {renamingChat === index ? (
              <>
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
              </>
            ) : (
              <>
                <span>{chat.name}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
