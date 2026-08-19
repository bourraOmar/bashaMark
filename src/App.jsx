import { useState, useCallback, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Settings, X, Search, Image as ImageIcon, Grid, Bookmark, Trash2, Menu } from 'lucide-react';

const customRestrictToWindowMargins = ({ transform, draggingNodeRect, windowRect }) => {
  if (!draggingNodeRect) return transform;
  
  const winWidth = windowRect?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
  const winHeight = windowRect?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
  
  const margin = 48; // 48px solid barrier from window borders
  
  const minX = margin - draggingNodeRect.left;
  const maxX = (winWidth - margin) - (draggingNodeRect.left + draggingNodeRect.width);
  
  const minY = 10 - draggingNodeRect.top;
  const maxY = (winHeight - 10) - (draggingNodeRect.top + draggingNodeRect.height);
  
  return {
    ...transform,
    x: Math.min(Math.max(transform.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(transform.y, minY), Math.max(minY, maxY)),
  };
};
import SearchBar from './components/widgets/SearchBar';
import Column from './components/Column';
import Modal from './components/Modal';
import BookmarkSearchModal from './components/BookmarkSearchModal';
import WallpaperModal from './components/WallpaperModal';
import WidgetsMenu from './components/WidgetsMenu';
import SettingsModal from './components/SettingsModal';
import { useBoards } from './hooks/useBoards';
import { useBackground } from './hooks/useBackground';
import { useSettings } from './hooks/useSettings';
import { usePages } from './hooks/usePages';
import PagesTabs from './components/PagesTabs';
import HeaderRightWidgets from './components/HeaderRightWidgets';
import TrashModal from './components/TrashModal';
import { useTrash } from './hooks/useTrash';
import TourGuide from './components/TourGuide';
import { onAuthStateChange, subscribeToCloudData } from './utils/sync';

function App() {
  const [user, setUser] = useState(null);
  
  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const { boards, setBoards, saveBoards, addBoard, addBookmark, renameBoard, updateBoard, deleteBoard, deleteBoardsByPage, editBookmark, deleteBookmark } = useBoards(user);
  const { pages, currentPageId, setCurrentPageId, addPage, renamePage, deletePage, isPagesLoaded, savePages } = usePages(user);
  
  // Listen to Cloud Data
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToCloudData(user.uid, (cloudData) => {
        if (cloudData) {
          if (cloudData.boards) saveBoards(cloudData.boards, false);
          if (cloudData.pages) savePages(cloudData.pages, false);
        } else if (boards && boards.length > 0) {
          // Cloud has no data for this user yet. Push our local data to the cloud.
          import('./utils/sync').then(({ syncDataToCloud }) => {
            syncDataToCloud(user.uid, { boards, pages });
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user]); // We intentionally do not include 'boards' or 'pages' in the dependency array to prevent loops.

  const { trashItems, addToTrash, removeFromTrash, emptyTrash } = useTrash();
  const { settings, setSettings, isLoaded } = useSettings();

  // AUTO-FIX: If any boards belong to a page that no longer exists, move them to the current page
  useEffect(() => {
    if (boards && boards.length > 0 && pages && pages.length > 0 && currentPageId) {
      const validPageIds = pages.map(p => p.id);
      let needsFix = false;
      const fixedBoards = boards.map(b => {
        if (!b.pageId || !validPageIds.includes(b.pageId)) {
          needsFix = true;
          return { ...b, pageId: currentPageId };
        }
        return b;
      });
      
      if (needsFix) {
        console.log("Auto-fixing orphaned boards!");
        saveBoards(fixedBoards, true);
      }
    }
  }, [boards, pages, currentPageId]); // intentionally omitting saveBoards to avoid infinite loop

  // Consume pending bookmarks from Quick Save
  useEffect(() => {
    const processPending = () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && boards && boards.length > 0) {
        chrome.storage.local.get(['pendingBookmarks'], (data) => {
          if (data.pendingBookmarks && data.pendingBookmarks.length > 0) {
            let updated = false;
            let newBoards = [...boards];
            
            data.pendingBookmarks.forEach(bm => {
              const boardIndex = newBoards.findIndex(b => b.id === bm.boardId);
              if (boardIndex >= 0) {
                const { boardId, ...bookmarkData } = bm;
                newBoards[boardIndex] = {
                  ...newBoards[boardIndex],
                  bookmarks: [...newBoards[boardIndex].bookmarks, bookmarkData]
                };
                updated = true;
              }
            });
            
            if (updated) {
              saveBoards(newBoards, true);
              chrome.storage.local.remove(['pendingBookmarks']);
            }
          }
        });
      }
    };

    // Run on mount
    processPending();

    // Run when storage changes (so popup can trigger instant updates)
    const listener = (changes, area) => {
      if (area === 'local' && changes.pendingBookmarks) {
        processPending();
      }
    };
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(listener);
    }
    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(listener);
      }
    };
  }, [boards, saveBoards]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState(null);
  const [bookmarkFolders, setBookmarkFolders] = useState([]);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isWidgetsMenuOpen, setIsWidgetsMenuOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize background loader
  const { background, isVideo: isVideoBackground } = useBackground();

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
        overColumnIndex = over.data?.current?.slotIndex ?? null;
      } else if (overId.startsWith('board-')) {
        const overBoard = boards.find(b => b.id === overId);
        if (overBoard) overColumnIndex = overBoard.slotIndex;
      }

      if (overColumnIndex !== null) {
        setBoards(prev => {
          const activeIndex = prev.findIndex(b => b.id === activeId);
          if (activeIndex === -1) return prev;
          
          const currentSlot = prev[activeIndex].slotIndex;
          const slotChanged = currentSlot !== overColumnIndex;

          if (overId.startsWith('board-')) {
            const overIndex = prev.findIndex(b => b.id === overId);
            if (overIndex !== -1) {
              if (activeIndex !== overIndex || slotChanged) {
                let updated = [...prev];
                updated[activeIndex] = { ...updated[activeIndex], slotIndex: overColumnIndex };
                return arrayMove(updated, activeIndex, overIndex);
              }
            }
          } else if (slotChanged) {
            let updated = [...prev];
            updated[activeIndex] = { ...updated[activeIndex], slotIndex: overColumnIndex };
            return updated;
          }

          return prev;
        });
      }
    }
  }, [boards, setBoards]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id.toString().startsWith('board-')) {
      // Always persist final board positions & slot indices to Chrome storage on drop
      saveBoards(prev => [...prev]);
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
      saveBoards(boards.map(b => b.id === activeBoardId ? { ...b, bookmarks: newBookmarks } : b));
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
      saveBoards(newBoards);
    }
  }, [boards, saveBoards]);

  const handleImportFolder = (folder) => {
    let newSlot = targetSlotIndex;
    if (newSlot === null) newSlot = 0;

    const newBoard = {
      id: `board-imported-${folder.id}-${Date.now()}`,
      title: folder.title,
      slotIndex: newSlot,
      pageId: currentPageId,
      bookmarks: folder.children
        .filter(node => node.url)
        .map((node) => ({
          id: `bm-imported-${node.id}`,
          title: node.title,
          url: node.url
        }))
    };
    saveBoards([...(boards || []), newBoard]);
    setIsModalOpen(false);
    setTargetSlotIndex(null);
  };

  const handleCreateEmptyBoard = () => {
    addBoard('New Board', targetSlotIndex, 5, currentPageId);
    setIsModalOpen(false);
    setTargetSlotIndex(null);
  };

  const handleDeleteBoard = (boardId) => {
    const boardToDelete = boards?.find(b => b.id === boardId);
    if (boardToDelete && boardToDelete.type === 'board') {
      addToTrash(boardToDelete);
    }
    deleteBoard(boardId);
  };
  
  const handleRestoreFromTrash = (item) => {
    if (!boards?.find(b => b.id === item.id)) {
      saveBoards([...(boards || []), item]);
    }
    removeFromTrash(item.id);
  };

  const handleDeletePage = (pageId) => {
    const boardsToDelete = boards?.filter(b => (b.pageId || 'page-home') === pageId && b.type === 'board') || [];
    boardsToDelete.forEach(b => addToTrash(b));
    deleteBoardsByPage(pageId);
    deletePage(pageId);
  };



  // Convert hex to rgb for rgba usage
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  // Calculate relative perceived luminance to dynamically adjust text color for readability on bright vs dark boards
  const getLuminance = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };



  const getComputedColumns = () => {
    const padding = 140; 
    const gap = 18;
    const colWidth = settings.boardWidth + gap;
    const maxFitting = Math.max(1, Math.floor((windowWidth - padding + gap) / colWidth));

    if (settings.numberOfColumns !== 'Auto') {
      const userCols = parseInt(settings.numberOfColumns, 10);
      return Math.max(1, Math.min(userCols, maxFitting));
    }
    return maxFitting;
  };

  const TOTAL_SLOTS = getComputedColumns();
  const sideMarginWidth = Math.max(32, Math.floor((windowWidth - (TOTAL_SLOTS * (settings.boardWidth + 18) - 18)) / 2) - 12);



  const isLightBoard = getLuminance(settings.boardColor) > 0.55;

  const dynamicCSS = `
    :root {
      --primary-color: ${settings.primaryColor};
      --glass-bg: rgba(${hexToRgb(settings.boardColor)}, ${settings.opacity / 100});
      --glass-bg-hover: rgba(${hexToRgb(settings.boardColor)}, ${Math.min(1, (settings.opacity / 100) + 0.15)});
      --dropdown-bg: rgba(${hexToRgb(settings.boardColor)}, ${Math.max(0.92, settings.opacity / 100)});
      --dropdown-border: ${isLightBoard ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.22)'};
      --dropdown-shadow: ${isLightBoard ? '0 14px 40px rgba(0, 0, 0, 0.25)' : '0 14px 50px rgba(0, 0, 0, 0.65)'};
      --item-hover-bg: ${isLightBoard ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'};
      --glass-blur: blur(${settings.blur}px);
      --board-width: ${settings.boardWidth}px;
      --font-size-base: ${settings.textSize === 'S' ? '0.80rem' : settings.textSize === 'M' ? '0.88rem' : '0.96rem'};
      --font-weight-base: ${settings.textWeight === 'Bold' ? '600' : '400'};
      --text-color: ${isLightBoard ? '#1e293b' : '#f8fafc'};
      --text-muted: ${isLightBoard ? '#64748b' : '#94a3b8'};
    }
    
    .glass-panel, .tabs-container, .search-bar, .fab, .dropdown-menu, .placeholder-board:hover, .header-pill-widget {
      backdrop-filter: blur(${Math.max(16, settings.blur)}px) !important;
      -webkit-backdrop-filter: blur(${Math.max(16, settings.blur)}px) !important;
    }
  `;

  const clampedBoards = useMemo(() => {
    if (!boards) return [];
    return boards.map(b => 
      b.slotIndex >= TOTAL_SLOTS ? { ...b, slotIndex: Math.min(b.slotIndex, Math.max(0, TOTAL_SLOTS - 1)) } : b
    );
  }, [boards, TOTAL_SLOTS]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isLoaded && settings && !settings.hasCompletedTour) {
      setShowTour(true);
      setSettings({ ...settings, hasCompletedTour: true });
    }
  }, [isLoaded, settings]);

  if (!isLoaded || !isPagesLoaded || !boards) return null;

  return (
    <>
      <style>{dynamicCSS}</style>
      {showTour && (
        <TourGuide 
          onComplete={() => setShowTour(false)} 
          onImportClick={() => setIsModalOpen(true)} 
        />
      )}
      {isVideoBackground && background && (
        <video
          key={background}
          autoPlay
          loop
          muted
          playsInline
          src={background}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: -1,
            pointerEvents: 'none'
          }}
        />
      )}
      <div className="app-container">
      {isDragging && (
        <>
          <div className="drop-barrier" style={{ width: `${sideMarginWidth}px`, left: 0 }} title="Drop not allowed here" />
          <div className="drop-barrier" style={{ width: `${sideMarginWidth}px`, right: 0 }} title="Drop not allowed here" />
        </>
      )}
      <header className="top-header">
        <div style={{ display: 'flex', justifyContent: 'flex-start', maxWidth: '100%', overflow: 'hidden', paddingRight: '16px' }}>
          <PagesTabs
            pages={pages}
            currentPageId={currentPageId}
            onSelectPage={(id) => setCurrentPageId(id)}
            onAddPage={() => addPage()}
            onRenamePage={renamePage}
            onDeletePage={handleDeletePage}
          />
        </div>
        <div className="search-container">
          <SearchBar />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <HeaderRightWidgets />
        </div>
      </header>
      
      <main className="dashboard-grid" style={{ paddingRight: settings?.alwaysShowAllButtons ? '72px' : '16px' }}>
        <DndContext 
          sensors={sensors} 
          collisionDetection={customCollisionDetection} 
          modifiers={[customRestrictToWindowMargins]}
          onDragStart={() => setIsDragging(true)}
          onDragOver={handleDragOver}
          onDragEnd={(event) => {
            setIsDragging(false);
            handleDragEnd(event);
          }}
          onDragCancel={() => setIsDragging(false)}
        >
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
            const columnBoards = clampedBoards.filter(b => (b.pageId || 'page-home') === currentPageId && b.slotIndex === i);
            
            return (
              <Column 
                key={`column-${i}`} 
                id={`column-${i}`}
                slotIndex={i}
                boards={columnBoards}
                pages={pages}
                addBoard={(config, slot) => addBoard(config, slot, TOTAL_SLOTS, currentPageId)}
                addBookmark={addBookmark}
                renameBoard={renameBoard}
                updateBoard={updateBoard}
                deleteBoard={handleDeleteBoard}
                editBookmark={editBookmark}
                deleteBookmark={deleteBookmark}
                settings={settings}
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
        {(isFabMenuOpen || settings?.alwaysShowAllButtons) && (
          <div className="fab-menu-items">
            <button className="fab" title="Search" onClick={() => {
              setIsFabMenuOpen(false);
              setIsSearchModalOpen(true);
            }}><Search size={20} /></button>
            <button className="fab" title="Background" onClick={() => {
              setIsFabMenuOpen(false);
              setIsWallpaperModalOpen(true);
            }}><ImageIcon size={20} /></button>
            <button className="fab" title="Grid Layout" onClick={() => {
              setIsFabMenuOpen(false);
              setIsWidgetsMenuOpen(!isWidgetsMenuOpen);
            }}><Grid size={20} /></button>
            <button className="fab" title="Import Bookmarks" onClick={() => {
              setIsFabMenuOpen(false);
              setIsModalOpen(true);
            }}><Bookmark size={20} /></button>
            <button className="fab" title="Trash" onClick={() => {
              setIsFabMenuOpen(false);
              setIsTrashModalOpen(true);
            }}><Trash2 size={20} /></button>
          </div>
        )}
        {!settings?.alwaysShowAllButtons && (
          <button className="fab" title="Menu" onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}>
            {isFabMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <button className="fab fab-primary" title="Settings" onClick={() => setIsSettingsModalOpen(true)}>
          <Settings size={20} />
        </button>
      </div>

      <BookmarkSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      <WallpaperModal 
        isOpen={isWallpaperModalOpen} 
        onClose={() => setIsWallpaperModalOpen(false)} 
        settings={settings}
        setSettings={setSettings}
      />
      <WidgetsMenu isOpen={isWidgetsMenuOpen} onClose={() => setIsWidgetsMenuOpen(false)} addBoard={(config, slot) => addBoard(config, slot, TOTAL_SLOTS, currentPageId)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} setSettings={setSettings} boards={boards} user={user} />
      <TrashModal 
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        trashItems={trashItems}
        onRestore={handleRestoreFromTrash}
        onEmptyTrash={emptyTrash}
        onPermanentDelete={removeFromTrash}
      />
    </div>
    </>
  );
}

export default App;
