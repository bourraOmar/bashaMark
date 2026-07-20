import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal } from 'lucide-react';

export default function BookmarkItem({ id, title, url, iconUrl }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const faviconUrl = iconUrl || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bookmark-item glass-item">
      <img src={faviconUrl} alt="" className="bookmark-icon" />
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
      <div className="bookmark-item-actions">
        <MoreHorizontal size={14} />
      </div>
    </div>
  );
}
