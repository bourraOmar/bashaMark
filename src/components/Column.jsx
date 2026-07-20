import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Board from './Board';

export default function Column({ id, slotIndex, boards, addBookmark, renameBoard, deleteBoard, onAddBoardClick }) {
  const { setNodeRef } = useDroppable({
    id,
    data: { type: 'column', slotIndex }
  });

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
      <div 
        onClick={() => onAddBoardClick(slotIndex)}
        className="placeholder-board"
        style={{ height: '60px' }}
      >
        <span style={{ fontSize: '24px', opacity: 0.5 }}>+</span>
      </div>
    </div>
  );
}
