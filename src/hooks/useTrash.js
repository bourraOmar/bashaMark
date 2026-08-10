import { useState, useEffect } from 'react';

export function useTrash() {
  const [trashItems, setTrashItems] = useState([]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['trash'], (result) => {
        if (result.trash) {
          setTrashItems(result.trash);
        }
      });
    } else {
      const local = localStorage.getItem('trash');
      if (local) {
        setTrashItems(JSON.parse(local));
      }
    }
  }, []);

  const saveTrash = (newTrash) => {
    setTrashItems(newTrash);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ trash: newTrash });
    } else {
      localStorage.setItem('trash', JSON.stringify(newTrash));
    }
  };

  const addToTrash = (item) => {
    // Only add if not already in trash
    if (!trashItems.find(t => t.id === item.id)) {
      const trashedItem = {
        ...item,
        deletedAt: Date.now()
      };
      saveTrash([trashedItem, ...trashItems]);
    }
  };

  const removeFromTrash = (id) => {
    saveTrash(trashItems.filter(item => item.id !== id));
  };

  const emptyTrash = () => {
    saveTrash([]);
  };

  return { trashItems, addToTrash, removeFromTrash, emptyTrash };
}
