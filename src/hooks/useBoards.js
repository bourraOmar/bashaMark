import { useState, useEffect } from 'react';

const defaultBoards = [
  {
    id: 'board-1',
    title: 'Work',
    slotIndex: 0,
    bookmarks: [
      { id: 'bm-1', title: 'Gmail', url: 'https://mail.google.com' },
      { id: 'bm-2', title: 'Google Calendar', url: 'https://calendar.google.com' }
    ]
  }
];

export function useBoards() {
  const [boards, setBoards] = useState(null);

  useEffect(() => {
    // Load from storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['boards'], (result) => {
        if (result.boards) {
          // Migration: Ensure all boards have a slotIndex and type
          const migrated = result.boards.map((b, i) => {
            const res = b.slotIndex !== undefined ? b : { ...b, slotIndex: i };
            if (!res.type) res.type = 'board';
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
          const res = b.slotIndex !== undefined ? b : { ...b, slotIndex: i };
          if (!res.type) res.type = 'board';
          return res;
        });
        setBoards(migrated);
      } else {
        setBoards(defaultBoards);
      }
    }
  }, []);

  const saveBoards = (newBoards) => {
    setBoards(newBoards);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ boards: newBoards });
    } else {
      localStorage.setItem('boards', JSON.stringify(newBoards));
    }
  };

  const addBoard = (titleOrConfig, slotIndex = null) => {
    let config = typeof titleOrConfig === 'string' ? { title: titleOrConfig, type: 'board' } : titleOrConfig;

    // Find first available slot if not provided
    let newSlot = slotIndex;
    if (newSlot === null) {
      const usedSlots = new Set(boards.map(b => b.slotIndex));
      newSlot = 0;
      while (usedSlots.has(newSlot)) newSlot++;
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
    const newBoards = boards.map(board => 
      board.id === boardId ? { ...board, title: newTitle } : board
    );
    saveBoards(newBoards);
  };

  const updateBoard = (boardId, updates) => {
    const newBoards = boards.map(board => 
      board.id === boardId ? { ...board, ...updates } : board
    );
    saveBoards(newBoards);
  };

  const deleteBoard = (boardId) => {
    const newBoards = boards.filter(board => board.id !== boardId);
    saveBoards(newBoards);
  };

  return { boards, setBoards: saveBoards, addBoard, addBookmark, renameBoard, updateBoard, deleteBoard };
}
