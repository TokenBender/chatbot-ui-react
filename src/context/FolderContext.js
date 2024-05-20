import React, { createContext, useState } from 'react';

export const FolderContext = createContext();

export const FolderProvider = ({ children }) => {
  const [folders, setFolders] = useState([{ name: 'Default', chats: [] }]);
  const [selectedFolder, setSelectedFolder] = useState('Default');

  return (
    <FolderContext.Provider value={{ folders, setFolders, selectedFolder, setSelectedFolder }}>
      {children}
    </FolderContext.Provider>
  );
};
