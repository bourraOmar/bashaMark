import { useState, useEffect } from 'react';

const defaultBoards = [];

export function useBoards() {
  const [boards, setBoards] = useState(null);

  useEffect(() => {
    // Load from storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['boards'], (result) => {
        if (result.boards) {
          // Migration: Ensure all boards have valid slotIndex and type
          const migrated = result.boards.map((b, i) => {
            let res = b.slotIndex !== undefined ? b : { ...b, slotIndex: i };
            if (!res.type) res.type = 'board';
            if (!res.pageId) res.pageId = 'page-home';
            return res;
          });
          setBoards(migrated);
        } else {
          setBoards(defaultBoards);
        }
      });
    } else {
      // Fallback for local dev without extension environment
      const local = localStorage.getItem('boards');
      if (local) {
        const parsed = JSON.parse(local);
        const migrated = parsed.map((b, i) => {
          let res = b.slotIndex !== undefined ? b : { ...b, slotIndex: i };
          if (!res.type) res.type = 'board';
          if (!res.pageId) res.pageId = 'page-home';
          return res;
        });
        setBoards(migrated);
      } else {
        setBoards(defaultBoards);
      }
    }
  }, []);

  const setBoardsState = (newBoardsOrFn) => {
    setBoards(newBoardsOrFn);
  };

  const saveBoards = (newBoardsOrFn) => {
    setBoards(prev => {
      const resolved = typeof newBoardsOrFn === 'function' ? newBoardsOrFn(prev) : newBoardsOrFn;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ boards: resolved });
      } else {
        localStorage.setItem('boards', JSON.stringify(resolved));
      }
      return resolved;
    });
  };

  const addBoard = (titleOrConfig, slotIndex = null, maxSlots = 5, pageId = 'page-home') => {
    let config = typeof titleOrConfig === 'string' ? { title: titleOrConfig, type: 'board' } : { ...titleOrConfig };
    if (!config.pageId) {
      config.pageId = pageId;
    }

    // Find the slot with the fewest widgets on the current page (0 to maxSlots-1)
    let newSlot = slotIndex;
    if (newSlot === null) {
      const slotCounts = Array(maxSlots).fill(0);
      boards.filter(b => (b.pageId || 'page-home') === config.pageId).forEach(b => {
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
    saveBoards([...boards, newBoard]);
  };

  const addBookmark = (boardId, title, url) => {
    const newBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarks: [...board.bookmarks, { id: `bm-${Date.now()}`, title, url }]
        };
      }
      return board;
    });
    saveBoards(newBoards);
  };

  const renameBoard = (boardId, newTitle) => {
    const newBoards = boards.map(board => {
      if (board.id === boardId) {
        return { ...board, title: newTitle };
      }
      return board;
    });
    saveBoards(newBoards);
  };

  const updateBoard = (boardId, updates) => {
    const newBoards = boards.map(board => {
      if (board.id === boardId) {
        return { ...board, ...updates };
      }
      return board;
    });
    saveBoards(newBoards);
  };

  const deleteBoard = (boardId) => {
    const newBoards = boards.filter(board => board.id !== boardId);
    saveBoards(newBoards);
  };

  const editBookmark = (boardId, bookmarkId, newTitle, newUrl) => {
    const newBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarks: board.bookmarks.map(bm => 
            bm.id === bookmarkId ? { ...bm, title: newTitle, url: newUrl } : bm
          )
        };
      }
      return board;
    });
    saveBoards(newBoards);
  };

  const deleteBookmark = (boardId, bookmarkId) => {
    const newBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          bookmarks: board.bookmarks.filter(bm => bm.id !== bookmarkId)
        };
      }
      return board;
    });
    saveBoards(newBoards);
  };

  const deleteBoardsByPage = (pageId) => {
    const newBoards = boards.filter(board => (board.pageId || 'page-home') !== pageId);
    saveBoards(newBoards);
  };

  return { boards, setBoards: setBoardsState, saveBoards, addBoard, addBookmark, renameBoard, updateBoard, deleteBoard, deleteBoardsByPage, editBookmark, deleteBookmark };
}
