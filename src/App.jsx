import { useState, useCallback, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Settings, X, Search, Image as ImageIcon, Grid, Bookmark, Trash2, Menu } from 'lucide-react';
import SearchBar from './components/widgets/SearchBar';
import Column from './components/Column';
import Modal from './components/Modal';
import { useBoards } from './hooks/useBoards';

const TOTAL_SLOTS = 15;

function App() {
  const { boards, setBoards, addBoard, addBookmark, renameBoard, deleteBoard } = useBoards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState(null);
  const [bookmarkFolders, setBookmarkFolders] = useState([]);

  useEffect(() => {
    if (isModalOpen && typeof chrome !== 'undefined' && chrome.bookmarks) {
      chrome.bookmarks.getTree((tree) => {
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
        setBookmarkFolders(folders.filter(f => f.count > 0 && f.title !== 'Root'));
      });
    }
  }, [isModalOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const customCollisionDetection = useCallback((args) => {
    const { active, droppableContainers } = args;
    const isDraggingBoard = active.id.toString().startsWith('board-');
    
    if (isDraggingBoard) {
      const filtered = droppableContainers.filter(c => 
        c.id.toString().startsWith('board-') || c.id.toString().startsWith('column-')
      );
      return closestCenter({ ...args, droppableContainers: filtered });
    } else {
      const filtered = droppableContainers.filter(c => 
        !c.id.toString().startsWith('column-')
      );
      return closestCenter({ ...args, droppableContainers: filtered });
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    if (activeId === overId) return;

    if (activeId.startsWith('board-')) {
      const activeBoard = boards.find(b => b.id === activeId);
      if (!activeBoard) return;

      let overColumnIndex = null;
      if (overId.startsWith('column-')) {
        overColumnIndex = over.data.current.slotIndex;
      } else if (overId.startsWith('board-')) {
        const overBoard = boards.find(b => b.id === overId);
        if (overBoard) overColumnIndex = overBoard.slotIndex;
      }

      if (overColumnIndex !== null && activeBoard.slotIndex !== overColumnIndex) {
        setBoards(prev => {
          const activeIndex = prev.findIndex(b => b.id === activeId);
          const newBoards = [...prev];
          newBoards[activeIndex] = { ...newBoards[activeIndex], slotIndex: overColumnIndex };
          
          if (overId.startsWith('board-')) {
            const overIndex = prev.findIndex(b => b.id === overId);
            return arrayMove(newBoards, activeIndex, overIndex);
          }
          return newBoards;
        });
      }
    }
  }, [boards, setBoards]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id.toString().startsWith('board-')) {
      if (active.id === over.id) return;
      const overId = over.id.toString();
      
      if (overId.startsWith('board-')) {
         const activeIndex = boards.findIndex(b => b.id === active.id);
         const overIndex = boards.findIndex(b => b.id === over.id);
         if (activeIndex !== -1 && overIndex !== -1) {
            setBoards(arrayMove(boards, activeIndex, overIndex));
         }
      }
      return;
    }

    let activeBoardId = null;
    let overBoardId = null;
    
    boards.forEach(board => {
      if (board.bookmarks.some(b => b.id === active.id)) activeBoardId = board.id;
      if (board.bookmarks.some(b => b.id === over.id)) overBoardId = board.id;
    });
    
    if (!overBoardId) {
      const isOverBoard = boards.some(b => b.id === over.id);
      if (isOverBoard) overBoardId = over.id;
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
    let newSlot = targetSlotIndex;
    if (newSlot === null) newSlot = 0;

    const newBoard = {
      id: `board-imported-${folder.id}-${Date.now()}`,
      title: folder.title,
      slotIndex: newSlot,
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
    setTargetSlotIndex(null);
  };

  const handleCreateEmptyBoard = () => {
    addBoard('New Board', targetSlotIndex);
    setIsModalOpen(false);
    setTargetSlotIndex(null);
  };

  const openModalForSlot = (index) => {
    setTargetSlotIndex(index);
    setIsModalOpen(true);
  };

  if (!boards) return null;

  return (
    <div className="app-container">
      <header className="top-header">
        <div className="tabs-container">
          <button className="tab-btn active">Home</button>
          <button className="tab-add-btn" title="Add Page">
            <Plus size={18} />
          </button>
        </div>
        <div className="search-container">
          <SearchBar />
        </div>
        <div style={{ width: '100px' }}></div>
      </header>
      
      <main className="dashboard-grid">
        <DndContext 
          sensors={sensors} 
          collisionDetection={customCollisionDetection} 
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
            const columnBoards = boards.filter(b => b.slotIndex === i);
            return (
              <Column 
                key={`column-${i}`} 
                id={`column-${i}`}
                slotIndex={i}
                boards={columnBoards}
                addBoard={addBoard}
                addBookmark={addBookmark}
                renameBoard={renameBoard}
                deleteBoard={deleteBoard}
              />
            );
          })}
        </DndContext>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Board or Bookmark Folder">
        <div className="folder-list">
          <button className="folder-item create-empty" onClick={handleCreateEmptyBoard}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Create Empty Board
          </button>
          <div className="dropdown-divider"></div>
          <h4 style={{ margin: '8px 12px', fontSize: '0.9rem', opacity: 0.7 }}>Import from Chrome</h4>
          {bookmarkFolders.map(folder => (
            <div key={folder.id} className="folder-item">
              <div className="folder-info">
                <span className="folder-name">{folder.title}</span>
                <span className="folder-count">{folder.count} links</span>
              </div>
              <button className="glass-btn add-folder-btn" onClick={() => handleImportFolder(folder)}>
                Add
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <div className="fab-container">
        <button className="fab" title="Menu"><Menu size={20} /></button>
        <button className="fab fab-primary" title="Settings"><Settings size={20} /></button>
      </div>
    </div>
  );
}

export default App;
