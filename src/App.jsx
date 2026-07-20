import { useState, useCallback, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, SortableContext, rectSwappingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Settings, X, Search, Image as ImageIcon, Grid, Bookmark, Trash2, Menu } from 'lucide-react';
import SearchBar from './components/widgets/SearchBar';
import Board from './components/Board';
import Modal from './components/Modal';
import { useBoards } from './hooks/useBoards';

const TOTAL_SLOTS = 15;

function EmptySlot({ id, onClick }) {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id, data: { type: 'slot' } });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="placeholder-board" 
      onClick={onClick}
    >
      <Plus size={32} />
    </div>
  );
}

function App() {
  const { boards, setBoards, addBoard, addBookmark, renameBoard, deleteBoard } = useBoards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState(null);
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
    
    // Check if dragging a board (or empty slot) in the grid
    if (active.id.toString().startsWith('slot-') || active.id.toString().startsWith('board-')) {
      if (active.id === over.id) return;
      
      const isBoard = (id) => id.toString().startsWith('board-');
      const getSlotIndex = (id) => {
        if (id.toString().startsWith('slot-')) return parseInt(id.split('-')[1]);
        const board = boards.find(b => b.id === id);
        return board ? board.slotIndex : -1;
      };

      const activeSlotIndex = getSlotIndex(active.id);
      const overSlotIndex = getSlotIndex(over.id);

      if (activeSlotIndex !== -1 && overSlotIndex !== -1) {
        // Swap their slot indices
        const newBoards = boards.map(board => {
          if (board.slotIndex === activeSlotIndex) return { ...board, slotIndex: overSlotIndex };
          if (board.slotIndex === overSlotIndex) return { ...board, slotIndex: activeSlotIndex };
          return board;
        });
        setBoards(newBoards);
      }
      return;
    }

    // Otherwise, dragging a bookmark
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
    if (newSlot === null) {
      const usedSlots = new Set(boards.map(b => b.slotIndex));
      newSlot = 0;
      while (usedSlots.has(newSlot)) newSlot++;
    }

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

  // Prepare grid items (mix of boards and empty slots)
  const gridItems = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const board = boards.find(b => b.slotIndex === i);
    return board ? board : { id: `slot-${i}`, isEmpty: true, slotIndex: i };
  });

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
          <SortableContext items={gridItems.map(item => item.id)} strategy={rectSwappingStrategy}>
            {gridItems.map(item => {
              if (item.isEmpty) {
                return <EmptySlot key={item.id} id={item.id} onClick={() => openModalForSlot(item.slotIndex)} />;
              }
              return (
                <Board 
                  key={item.id} 
                  id={item.id} 
                  title={item.title} 
                  bookmarks={item.bookmarks} 
                  onAddBookmark={addBookmark} 
                  onRenameBoard={renameBoard}
                  onDeleteBoard={deleteBoard}
                />
              );
            })}
          </SortableContext>
        </DndContext>
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
