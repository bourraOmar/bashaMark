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
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const domain = new URL(url).hostname;
  const faviconUrl = iconUrl || `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  const fallbackIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bookmark-item glass-item">
      <img 
        src={faviconUrl} 
        alt="" 
        className="bookmark-icon" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackIcon;
        }}
      />
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
      <div className="bookmark-item-actions">
        <MoreHorizontal size={14} />
      </div>
    </div>
  );
}
