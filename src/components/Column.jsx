import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import Board from './Board';
import NotesWidget from './widgets/NotesWidget';
import CalendarWidget from './widgets/CalendarWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import { PenTool, Calendar, Clock } from 'lucide-react';

export default function Column({ id, slotIndex, boards, addBoard, addBookmark, renameBoard, updateBoard, deleteBoard }) {
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
        {boards.map(board => {
          if (board.type === 'notes') {
            return <NotesWidget key={board.id} id={board.id} initialText={board.text} onUpdate={updateBoard} onDelete={() => deleteBoard(board.id)} />;
          }
          if (board.type === 'calendar') {
            return <CalendarWidget key={board.id} id={board.id} onDelete={() => deleteBoard(board.id)} />;
          }
          if (board.type === 'pomodoro') {
            return <PomodoroWidget key={board.id} id={board.id} onDelete={() => deleteBoard(board.id)} />;
          }
          
          return (
            <Board
              key={board.id}
              id={board.id}
              title={board.title}
              bookmarks={board.bookmarks}
              onAddBookmark={addBookmark}
              onRenameBoard={renameBoard}
              onDeleteBoard={deleteBoard}
            />
          );
        })}
      </SortableContext>
      
      {isAdding ? (
        <div className="board glass-panel" style={{ padding: '12px', marginTop: boards.length > 0 ? '0' : '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="board-header" style={{ padding: 0 }}>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New Board title..."
              style={{ 
                width: '100%', 
                padding: '4px 0', 
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
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>OR ADD WIDGET:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => { addBoard({ type: 'notes' }, slotIndex); setIsAdding(false); }}
                style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-color)' }}
                title="Notes"
              ><PenTool size={16} /></button>
              <button 
                onClick={() => { addBoard({ type: 'calendar' }, slotIndex); setIsAdding(false); }}
                style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-color)' }}
                title="Calendar"
              ><Calendar size={16} /></button>
              <button 
                onClick={() => { addBoard({ type: 'pomodoro' }, slotIndex); setIsAdding(false); }}
                style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-color)' }}
                title="Pomodoro"
              ><Clock size={16} /></button>
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
