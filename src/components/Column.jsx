import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Board from './Board';
import NotesWidget from './widgets/NotesWidget';
import CalendarWidget from './widgets/CalendarWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import PrayerWidget from './widgets/PrayerWidget';
import WeatherWidget from './widgets/WeatherWidget';


export default function Column({ id, slotIndex, boards, pages, addBoard, addBookmark, renameBoard, updateBoard, deleteBoard, editBookmark, deleteBookmark, settings }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const addBoardRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isAdding && addBoardRef.current && !addBoardRef.current.contains(event.target)) {
        setIsAdding(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdding]);

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

  const baseStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  };

  return (
    <div ref={setNodeRef} className="board-column" style={baseStyle}>
      <SortableContext items={boards.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {boards.map(board => {
          if (board.type === 'notes') {
            return <NotesWidget key={board.id} id={board.id} initialText={board.text} board={board} onUpdate={updateBoard} onDelete={() => deleteBoard(board.id)} settings={settings} pages={pages} />;
          }
          if (board.type === 'calendar') {
            return <CalendarWidget key={board.id} id={board.id} board={board} onDelete={() => deleteBoard(board.id)} settings={settings} pages={pages} onUpdate={updateBoard} />;
          }
          if (board.type === 'pomodoro') {
            return <PomodoroWidget key={board.id} id={board.id} board={board} onDelete={() => deleteBoard(board.id)} settings={settings} pages={pages} onUpdate={updateBoard} />;
          }
          if (board.type === 'prayer') {
            return <PrayerWidget key={board.id} id={board.id} board={board} onUpdate={updateBoard} onDelete={() => deleteBoard(board.id)} settings={settings} pages={pages} />;
          }
          if (board.type === 'weather') {
            return <WeatherWidget key={board.id} id={board.id} board={board} onUpdate={updateBoard} onDelete={() => deleteBoard(board.id)} settings={settings} pages={pages} />;
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
              onEditBookmark={editBookmark}
              onDeleteBookmark={deleteBookmark}
              onUpdate={updateBoard}
              settings={settings}
              pages={pages}
            />
          );
        })}
      </SortableContext>
      
      {isAdding ? (
        <div ref={addBoardRef} className="board glass-panel" style={{ padding: '12px', marginTop: boards.length > 0 ? '0' : '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
