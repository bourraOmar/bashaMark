import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Type, Trash2, AlertCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

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
  const [menu, setMenu] = useState(null); // { pageId, title, x, y }
  const [confirmDelete, setConfirmDelete] = useState(null); // { pageId, title }
  const [cannotDeleteAlert, setCannotDeleteAlert] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown menu when clicking anywhere on the document outside the open menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menu !== null) {
        setMenu(null);
      }
    };
    if (menu !== null) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('scroll', handleOutsideClick, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('scroll', handleOutsideClick, true);
    };
  }, [menu]);

  const handleAddClick = () => {
    const newId = onAddPage();
    setEditingPageId(newId);
    setEditingTitle('New Page');
    setMenu(null);
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
      // Clicking the active tab also toggles the action menu for easy left-click access!
      const rect = e.currentTarget.getBoundingClientRect();
      if (menu && menu.pageId === page.id) {
        setMenu(null);
      } else {
        setMenu({
          pageId: page.id,
          title: page.title,
          x: rect.left + 14,
          y: rect.bottom + 6
        });
      }
    } else {
      onSelectPage(page.id);
      setMenu(null);
    }
  };

  const handleContextMenu = (page, e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({
      pageId: page.id,
      title: page.title,
      x: rect.left + 14,
      y: rect.bottom + 6
    });
    setEditingPageId(null);
  };

  const handleDoubleClick = (page, e) => {
    e.preventDefault();
    setMenu(null);
    setEditingPageId(page.id);
    setEditingTitle(page.title);
  };

  return (
    <>
      <div 
        ref={containerRef}
        className="tabs-container"
        style={{ 
          maxWidth: '55vw', 
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          zIndex: 50
        }}
      >
        {pages.map((page) => {
          const isActive = currentPageId === page.id;
          const isEditing = editingPageId === page.id;

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

      {/* React Portal Context Menu - rendered directly in document.body to prevent clipping from overflow container */}
      {menu && createPortal(
        <div 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          style={{ 
            position: 'fixed',
            left: `${menu.x}px`, 
            top: `${menu.y}px`, 
            background: '#212530',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '8px 0', 
            minWidth: '160px', 
            zIndex: 999999,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(16px)',
            textAlign: 'left'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingPageId(menu.pageId);
              const targetPage = pages.find(p => p.id === menu.pageId);
              setEditingTitle(targetPage ? targetPage.title : '');
              setMenu(null);
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
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Type size={18} style={{ color: '#94a3b8' }} />
            <span>Rename</span>
          </button>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 16px' }} />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenu(null);
              if (pages.length <= 1) {
                setCannotDeleteAlert(true);
                return;
              }
              setConfirmDelete({ pageId: menu.pageId, title: menu.title });
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
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224, 108, 117, 0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={17} style={{ color: '#e06c75' }} />
            <span>Delete</span>
          </button>
        </div>,
        document.body
      )}

      {/* Custom Popup Confirmation Modal for Page Deletion */}
      <ConfirmModal 
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            onDeletePage(confirmDelete.pageId);
          }
        }}
        title="Delete Page?"
        message={`Are you sure you want to delete "${confirmDelete ? confirmDelete.title : ''}" and all its widgets? This action cannot be undone.`}
      />

      {/* Custom Popup Alarm/Modal for attempting to delete the only page */}
      {cannotDeleteAlert && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setCannotDeleteAlert(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '90%',
              maxWidth: '340px',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(245, 158, 11, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '4px',
              color: '#f59e0b'
            }}>
              <AlertCircle size={32} />
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-color)' }}>Cannot Delete Page</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                You cannot delete your only remaining dashboard page. Please create another page first before removing this one.
              </p>
            </div>

            <div style={{ display: 'flex', width: '100%', marginTop: '8px' }}>
              <button 
                onClick={() => setCannotDeleteAlert(false)}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  fontSize: '0.95rem', 
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
