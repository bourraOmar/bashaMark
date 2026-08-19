import { useState, useEffect } from 'react';

import { syncDataToCloud } from '../utils/sync';

const defaultBoards = [];

export function useBoards(user) {
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('boards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse boards from local storage", e);
        return defaultBoards;
      }
    }
    return defaultBoards;
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'boards' && e.newValue) {
        try {
          setBoards(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Failed to parse updated boards from local storage", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveBoards = (newBoards, shouldSyncToCloud = true) => {
    setBoards((prevBoards) => {
      const resolved = typeof newBoards === 'function' ? newBoards(prevBoards) : newBoards;
      
      // Update local storage
      if (resolved.length === 0) {
        localStorage.setItem('boards', JSON.stringify(defaultBoards));
      } else {
        localStorage.setItem('boards', JSON.stringify(resolved));
      }
      
      if (shouldSyncToCloud && user) {
        syncDataToCloud(user.uid, { boards: resolved });
      }
      
      return resolved;
    });
  };

  const addBoard = (titleOrConfig, slotIndex = null, maxSlots = 5, pageId = 'page-home') => {
    let config = typeof titleOrConfig === 'string' ? { title: titleOrConfig, type: 'board' } : { ...titleOrConfig };
    if (!config.pageId) {
      config.pageId = pageId;
    }

    saveBoards(prev => {
      let newSlot = slotIndex;
      if (newSlot === null) {
        const slotCounts = Array(maxSlots).fill(0);
        prev.filter(b => (b.pageId || 'page-home') === config.pageId).forEach(b => {
          if (b.slotIndex >= 0 && b.slotIndex < maxSlots) {
            slotCounts[b.slotIndex]++;
          }
        });
        newSlot = slotCounts.indexOf(Math.min(...slotCounts));
      }

      const newBoard = {
        id: `board-${Date.now()}`,
        slotIndex: newSlot,
        bookmarks: [],
        ...config
      };
      return [...prev, newBoard];
    });
  };

  const addBookmark = (boardId, title, url) => {
    saveBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarks: [...board.bookmarks, { id: `bm-${Date.now()}`, title, url }]
        };
      }
      return board;
    }));
  };

  const renameBoard = (boardId, newTitle) => {
    saveBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return { ...board, title: newTitle };
      }
      return board;
    }));
  };

  const updateBoard = (boardId, updates) => {
    saveBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return { ...board, ...updates };
      }
      return board;
    }));
  };

  const deleteBoard = (boardId) => {
    saveBoards(prev => prev.filter(board => board.id !== boardId));
  };

  const editBookmark = (boardId, bookmarkId, newTitle, newUrl) => {
    saveBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarks: board.bookmarks.map(bm => 
            bm.id === bookmarkId ? { ...bm, title: newTitle, url: newUrl } : bm
          )
        };
      }
      return board;
    }));
  };

  const deleteBookmark = (boardId, bookmarkId) => {
    saveBoards(prev => prev.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarks: board.bookmarks.filter(bm => bm.id !== bookmarkId)
        };
      }
      return board;
    }));
  };

  const deleteBoardsByPage = (pageId) => {
    saveBoards(prev => prev.filter(board => (board.pageId || 'page-home') !== pageId));
  };

  return { boards, setBoards, saveBoards, addBoard, addBookmark, renameBoard, updateBoard, deleteBoard, deleteBoardsByPage, editBookmark, deleteBookmark };
}
