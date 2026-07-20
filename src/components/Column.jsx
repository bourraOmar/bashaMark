import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import Board from './Board';

export default function Column({ id, slotIndex, boards, addBoard, addBookmark, renameBoard, deleteBoard }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { setNodeRef } = useDroppable({
    id,
    data: { type: 'column', slotIndex }
  });

  const handleCreateBoard = () => {
    if (newTitle.trim()) {
      addBoard(newTitle.trim(), slotIndex);
    }
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div ref={setNodeRef} className="board-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SortableContext items={boards.map(b => b.id)} strategy={verticalListSortingStrategy}>
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
      </SortableContext>
      
      {isAdding ? (
        <div className="board glass-panel" style={{ padding: '8px 0', marginTop: boards.length > 0 ? '0' : '0' }}>
          <div className="board-header">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New Board"
              style={{ 
                width: '100%', 
                padding: '2px 0', 
                background: 'transparent', 
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.2)', 
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateBoard();
                if (e.key === 'Escape') {
                  setNewTitle('');
                  setIsAdding(false);
                }
              }}
              onBlur={handleCreateBoard}
            />
            <div className="board-header-actions" style={{ marginLeft: '12px' }}>
               <Plus size={14} />
               <MoreHorizontal size={14} />
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsAdding(true)}
          className="placeholder-board"
          style={{ height: '60px' }}
        >
          <span style={{ fontSize: '24px', opacity: 0.5 }}>+</span>
        </div>
      )}
    </div>
  );
}
