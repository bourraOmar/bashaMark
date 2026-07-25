import React, { useState, useEffect, useRef } from 'react';
import { Plus, Type, Trash2 } from 'lucide-react';

export default function PagesTabs({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage
}) {
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuPageId, setMenuPageId] = useState(null);
  const containerRef = useRef(null);

  // Close dropdown menu or save edit on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (menuPageId !== null) {
          setMenuPageId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuPageId]);

  const handleAddClick = () => {
    const newId = onAddPage();
    setEditingPageId(newId);
    setEditingTitle('New Page');
    setMenuPageId(null);
  };

  const handleSaveRename = (pageId) => {
    if (editingPageId === pageId) {
      onRenamePage(pageId, editingTitle);
      setEditingPageId(null);
    }
  };

  const handleTabClick = (page, e) => {
    if (editingPageId === page.id) return;
    if (currentPageId === page.id) {
      // Toggle menu when clicking active tab for quick access to Rename/Delete
      setMenuPageId(menuPageId === page.id ? null : page.id);
    } else {
      onSelectPage(page.id);
      setMenuPageId(null);
    }
  };

  const handleContextMenu = (page, e) => {
    e.preventDefault();
    setMenuPageId(menuPageId === page.id ? null : page.id);
    setEditingPageId(null);
  };

  const handleDoubleClick = (page, e) => {
    e.preventDefault();
    setMenuPageId(null);
    setEditingPageId(page.id);
    setEditingTitle(page.title);
  };

  return (
    <div 
      ref={containerRef}
      className="tabs-container"
      style={{ 
        maxWidth: '55vw', 
        overflowX: 'auto', 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {pages.map((page) => {
        const isActive = currentPageId === page.id;
        const isEditing = editingPageId === page.id;
        const isMenuOpen = menuPageId === page.id;

        return (
          <div key={page.id} style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={(e) => handleTabClick(page, e)}
              onContextMenu={(e) => handleContextMenu(page, e)}
              onDoubleClick={(e) => handleDoubleClick(page, e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isEditing ? 'text' : 'pointer',
                whiteSpace: 'nowrap',
                position: 'relative',
                border: 'none',
                userSelect: 'none'
              }}
            >
              {isEditing ? (
                <input
                  ref={(el) => {
                    if (el && !el.dataset.focused) {
                      el.focus();
                      el.select();
                      el.dataset.focused = 'true';
                    }
                  }}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(page.id);
                    if (e.key === 'Escape') setEditingPageId(null);
                  }}
                  onBlur={() => handleSaveRename(page.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
                    color: 'inherit',
                    outline: 'none',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    width: `${Math.max(70, editingTitle.length * 8 + 15)}px`,
                    textAlign: 'center',
                    padding: '0 2px'
                  }}
                />
              ) : (
                <span>{page.title}</span>
              )}
            </button>

            {/* Context Menu for Rename and Delete */}
            {isMenuOpen && (
              <div 
                className="dropdown-menu" 
                style={{ 
                  left: 0, 
                  top: '100%', 
                  marginTop: '6px', 
                  minWidth: '140px', 
                  zIndex: 1000,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.3)'
                }}
              >
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuPageId(null);
                    setEditingPageId(page.id);
                    setEditingTitle(page.title);
                  }}
                >
                  <Type size={16} style={{ opacity: 0.8 }} />
                  <span>Rename</span>
                </button>

                {pages.length > 1 && (
                  <>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuPageId(null);
                        if (window.confirm(`Are you sure you want to delete "${page.title}" and all its boards?`)) {
                          onDeletePage(page.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button 
        className="tab-add-btn" 
        onClick={handleAddClick} 
        title="New Page"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
