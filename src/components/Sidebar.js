import React, { useState, useContext } from 'react';
import { FolderContext } from '../context/FolderContext';

function Sidebar() {
  // Feature: Selecting a Folder
  const { folders, setFolders, selectedFolder, setSelectedFolder } = useContext(FolderContext);
  const [newFolder, setNewFolder] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Feature: Adding a New Folder
  const addFolder = () => {
    if (newFolder) {
      setFolders([...folders, { name: newFolder, chats: [] }]);
      setNewFolder('');
    }
  };

  // Feature: Renaming an Existing Folder
  const renameFolder = (index) => {
    const updatedFolders = [...folders];
    updatedFolders[index].name = renameValue;
    setFolders(updatedFolders);
    setRenamingFolder(null);
    setRenameValue('');
  };

  // Feature: Deleting a Folder
  const deleteFolder = (index) => {
    const updatedFolders = folders.filter((_, i) => i !== index);
    setFolders(updatedFolders);
    if (selectedFolder === folders[index].name) {
      setSelectedFolder('Default');
    }
  };

  return (
    <div className="col-3 bg-light border-right vh-100 p-3">
      <div>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="New Folder"
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
        />
        <button className="btn btn-primary btn-block mb-3" onClick={addFolder}>
          Add Folder
        </button>
      </div>
      <ul className="list-group list-group-flush">
        {folders.map((folder, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {renamingFolder === index ? (
              <>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="form-control"
                />
                <button className="btn btn-sm btn-success ml-2" onClick={() => renameFolder(index)}>
                  Save
                </button>
              </>
            ) : (
              <>
                <span onClick={() => setSelectedFolder(folder.name)}>{folder.name}</span>
                <div>
                  <button className="btn btn-sm btn-warning mr-2" onClick={() => setRenamingFolder(index)}>
                    Rename
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteFolder(index)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
