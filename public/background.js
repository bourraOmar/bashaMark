chrome.commands.onCommand.addListener((command) => {
  if (command === "quick-save") {
    // Get the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      
      const tab = tabs[0];
      // Only proceed if we have a valid URL
      if (!tab.url || tab.url.startsWith('chrome://')) return;

      const { title, url, favIconUrl } = tab;

      // Read settings and boards
      chrome.storage.local.get(['settings', 'boards'], (data) => {
        const settings = data.settings || {};
        const boards = data.boards || [];
        const targetBoardId = settings.quickSaveBoard;

        if (!targetBoardId || targetBoardId === 'None') return;

        // Add to the selected board
        let boardFound = false;
        const newBoards = boards.map(board => {
          if (board.id === targetBoardId) {
            boardFound = true;
            return {
              ...board,
              bookmarks: [
                ...board.bookmarks,
                { 
                  id: Date.now().toString(), 
                  title: title || 'Untitled', 
                  url: url, 
                  iconUrl: favIconUrl || '',
                  description: '' 
                }
              ]
            };
          }
          return board;
        });

        if (boardFound) {
          // Save the updated boards back to storage
          chrome.storage.local.set({ boards: newBoards }, () => {
            console.log('Saved bookmark to Quick Save board!');
          });
        }
      });
    });
  }
});
