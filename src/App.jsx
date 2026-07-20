import { useState, useCallback, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Settings, X, Search, Image as ImageIcon, Grid, Bookmark, Trash2, Menu } from 'lucide-react';
import SearchBar from './components/widgets/SearchBar';
import Board from './components/Board';
import Modal from './components/Modal';
import { useBoards } from './hooks/useBoards';

function App() {
  const { boards, setBoards, addBoard, addBookmark, renameBoard, deleteBoard } = useBoards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarkFolders, setBookmarkFolders] = useState([]);

  // Fetch bookmarks when modal opens
  useEffect(() => {
    if (isModalOpen && typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.getTree((tree) => {
        // Collect all folders recursively
        const folders = [];
        const processNode = (node) => {
          if (node.children) {
            folders.push({
              id: node.id,
              title: node.title || 'Root',
              count: node.children.filter(c => c.url).length,
              children: node.children
            });
            node.children.forEach(processNode);
          }
        };
        processNode(tree[0]);
        // Filter out empty folders to keep it clean
        setBookmarkFolders(folders.filter(f => f.count > 0 && f.title !== 'Root'));
      });
    }
  }, [isModalOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;
    
    let activeBoardId = null;
    let overBoardId = null;
    
    boards.forEach(board => {
      if (board.bookmarks.some(b => b.id === active.id)) activeBoardId = board.id;
      if (board.bookmarks.some(b => b.id === over.id)) overBoardId = board.id;
    });
    
    if (!overBoardId) {
      const isBoard = boards.some(b => b.id === over.id);
      if (isBoard) overBoardId = over.id;
    }
    
    if (!activeBoardId || !overBoardId) return;
    
    const activeBoard = boards.find(b => b.id === activeBoardId);
    const overBoard = boards.find(b => b.id === overBoardId);
    
    if (activeBoardId === overBoardId) {
      const oldIndex = activeBoard.bookmarks.findIndex(b => b.id === active.id);
      const newIndex = overBoard.bookmarks.findIndex(b => b.id === over.id);
      const newBookmarks = arrayMove(activeBoard.bookmarks, oldIndex, newIndex);
      setBoards(boards.map(b => b.id === activeBoardId ? { ...b, bookmarks: newBookmarks } : b));
    } else {
      const activeBookmark = activeBoard.bookmarks.find(b => b.id === active.id);
      const overIndex = overBoard.bookmarks.findIndex(b => b.id === over.id);
      const insertIndex = overIndex >= 0 ? overIndex : overBoard.bookmarks.length;
      
      const newBoards = boards.map(board => {
        if (board.id === activeBoardId) {
          return { ...board, bookmarks: board.bookmarks.filter(b => b.id !== active.id) };
        }
        if (board.id === overBoardId) {
          const newBookmarks = [...board.bookmarks];
          newBookmarks.splice(insertIndex, 0, activeBookmark);
          return { ...board, bookmarks: newBookmarks };
        }
        return board;
      });
      setBoards(newBoards);
    }
  }, [boards, setBoards]);

  const handleImportFolder = (folder) => {
    const newBoard = {
      id: `board-imported-${folder.id}-${Date.now()}`,
      title: folder.title,
      bookmarks: folder.children
        .filter(node => node.url)
        .map((node) => ({
          id: `bm-imported-${node.id}`,
          title: node.title,
          url: node.url
        }))
    };
    setBoards([...(boards || []), newBoard]);
    setIsModalOpen(false);
  };

  const handleCreateEmptyBoard = () => {
    addBoard('New Board');
    setIsModalOpen(false);
  };

  if (!boards) return null;

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="top-header">
        {/* Left: Pages Tabs */}
        <div className="tabs-container">
          <button className="tab-btn active">Home</button>
          <button className="tab-add-btn" title="Add Page">
            <Plus size={18} />
          </button>
        </div>
        
        {/* Center: Search */}
        <div className="search-container">
          <SearchBar />
        </div>
        
        {/* Right empty spacing to balance the flex */}
        <div style={{ width: '100px' }}></div>
      </header>
      
      {/* Main Grid */}
      <main className="dashboard-grid">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {boards.map(board => (
            <Board 
              key={board.id} 
              id={board.id} 
              title={board.title} 
              bookmarks={board.bookmarks} 
              onAddBookmark={addBookmark} 
              onRenameBoard={renameBoard}
              onDeleteBoard={deleteBoard}
            />
          ))}
        </DndContext>
        
        {/* The Placeholder */}
        <div className="placeholder-board" onClick={() => setIsModalOpen(true)}>
          <Plus size={32} />
        </div>
      </main>

      {/* Right FABs */}
      <div className="fab-container">
        <button className="fab" title="Menu"><Menu size={20} /></button>
        <button className="fab fab-primary" title="Settings"><Settings size={20} /></button>
      </div>

      {/* Add Board Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Board or Bookmark Folder">
        <button onClick={handleCreateEmptyBoard} className="folder-item" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.1)' }}>
          <div className="folder-info">
            <span className="folder-name">+ Create Empty Board</span>
            <span className="folder-count">Start fresh</span>
          </div>
        </button>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '4px' }}>
          Import from Chrome
        </div>
        
        {bookmarkFolders.length === 0 && (
          <div style={{ padding: '12px', color: 'var(--text-muted)' }}>No folders found or API unavailable.</div>
        )}
        
        {bookmarkFolders.map(folder => (
          <div key={folder.id} className="folder-item">
            <div className="folder-info">
              <span className="folder-name">{folder.title}</span>
              <span className="folder-count">{folder.count} links</span>
            </div>
            <button onClick={() => handleImportFolder(folder)} className="glass-btn">
              Add
            </button>
          </div>
        ))}
      </Modal>
    </div>
  );
}

export default App;
