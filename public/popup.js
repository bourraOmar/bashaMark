document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('bookmark-url');
  const titleInput = document.getElementById('bookmark-title');
  const boardSelect = document.getElementById('board-select');
  const boardNameDisplay = document.getElementById('board-name-display');
  const saveForm = document.getElementById('save-form');
  
  let currentIconUrl = '';

  // 1. Get active tab info
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const tab = tabs[0];
      urlInput.value = tab.url || '';
      titleInput.value = tab.title || '';
      currentIconUrl = tab.favIconUrl || '';
    }
  });

  // 2. Load boards and settings
  chrome.storage.local.get(['settings', 'boards'], (data) => {
    const settings = data.settings || {};
    const boards = (data.boards || []).filter(b => !b.type || b.type === 'board');
    const targetBoardId = settings.quickSaveBoard;

    if (boards.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No boards available';
      boardSelect.appendChild(option);
      boardNameDisplay.textContent = 'None';
      return;
    }

    boards.forEach(board => {
      const option = document.createElement('option');
      option.value = board.id;
      option.textContent = board.title;
      boardSelect.appendChild(option);
      
      if (board.id === targetBoardId) {
        option.selected = true;
        boardNameDisplay.textContent = board.title;
      }
    });

    // If targetBoardId is not set or not found, select first one
    if (!targetBoardId || !boards.find(b => b.id === targetBoardId)) {
      boardSelect.value = boards[0].id;
      boardNameDisplay.textContent = boards[0].title;
    }

    // Update display name when select changes
    boardSelect.addEventListener('change', () => {
      const selectedOption = boardSelect.options[boardSelect.selectedIndex];
      boardNameDisplay.textContent = selectedOption.textContent;
    });
  });

  // 3. Handle Save
  saveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedBoardId = boardSelect.value;
    if (!selectedBoardId) {
      window.close();
      return;
    }

    const newUrl = urlInput.value.trim();
    const newTitle = titleInput.value.trim();

    chrome.storage.local.get(['boards'], (data) => {
      const boards = data.boards || [];
      let boardFound = false;
      
      const newBoards = boards.map(board => {
        if (board.id === selectedBoardId) {
          boardFound = true;
          return {
            ...board,
            bookmarks: [
              ...board.bookmarks,
              { 
                id: Date.now().toString(), 
                title: newTitle || 'Untitled', 
                url: newUrl, 
                iconUrl: currentIconUrl,
                description: '' 
              }
            ]
          };
        }
        return board;
      });

      if (boardFound) {
        chrome.storage.local.set({ boards: newBoards }, () => {
          // Close popup immediately after save
          window.close();
        });
      } else {
        window.close();
      }
    });
  });
});
