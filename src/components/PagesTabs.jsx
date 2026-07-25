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

  // Close dropdown menu when clicking anywhere on the document outside the open menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuPageId !== null) {
        setMenuPageId(null);
      }
    };
    if (menuPageId !== null) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
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
    onSelectPage(page.id);
    setMenuPageId(null);
  };

  const handleContextMenu = (page, e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPageId(page.id);
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
        overflowY: 'visible',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: 'relative',
        zIndex: 50
      }}
    >
      {pages.map((page) => {
        const isActive = currentPageId === page.id;
        const isEditing = editingPageId === page.id;
        const isMenuOpen = menuPageId === page.id;

        return (
          <div key={page.id} style={{ position: 'relative', display: 'inline-flex', overflow: 'visible' }}>
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
                userSelect: 'none',
                transition: 'all 0.2s'
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

            {/* Right-Click Custom Context Menu */}
            {isMenuOpen && (
              <div 
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  position: 'absolute',
                  left: '16px', 
                  top: 'calc(100% + 6px)', 
                  background: '#212530',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '8px 0', 
                  minWidth: '160px', 
                  zIndex: 9999,
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  backdropFilter: 'blur(16px)',
                  textAlign: 'left'
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuPageId(null);
                    setEditingPageId(page.id);
                    setEditingTitle(page.title);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 18px',
                    fontSize: '0.92rem',
                    color: '#e2e8f0',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Type size={18} style={{ color: '#94a3b8' }} />
                  <span>Rename</span>
                </button>

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 16px' }} />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuPageId(null);
                    if (pages.length <= 1) {
                      window.alert('You cannot delete your only dashboard page. Please add another page first.');
                      return;
                    }
                    if (window.confirm(`Are you sure you want to delete "${page.title}" and all its widgets?`)) {
                      onDeletePage(page.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 18px',
                    fontSize: '0.92rem',
                    color: '#e06c75',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224, 108, 117, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={17} style={{ color: '#e06c75' }} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button 
        className="tab-add-btn" 
        onClick={handleAddClick} 
        title="New Page"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '2px' }}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
