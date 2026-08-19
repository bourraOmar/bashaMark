import { useState, useEffect, useCallback } from 'react';

const defaultPages = [
  { id: 'page-home', title: 'Home' }
];

export function usePages(user) {
  const [pages, setPagesState] = useState(() => {
    const localPages = localStorage.getItem('pages');
    const parsedPages = localPages ? JSON.parse(localPages) : defaultPages;
    return (Array.isArray(parsedPages) && parsedPages.length > 0) ? parsedPages : defaultPages;
  });
  
  const [currentPageId, setCurrentPageIdState] = useState(() => {
    const localCurrent = localStorage.getItem('currentPageId');
    const localPages = localStorage.getItem('pages');
    const parsedPages = localPages ? JSON.parse(localPages) : defaultPages;
    const loadedPages = (Array.isArray(parsedPages) && parsedPages.length > 0) ? parsedPages : defaultPages;
    
    if (localCurrent && loadedPages.some(p => p.id === localCurrent)) {
      return localCurrent;
    }
    return loadedPages[0].id;
  });
  
  const [isPagesLoaded, setIsPagesLoaded] = useState(true);

  const savePages = useCallback((newPages, shouldSyncToCloud = true) => {
    setPagesState(newPages);
    localStorage.setItem('pages', JSON.stringify(newPages));
    
    if (shouldSyncToCloud && user) {
      import('../utils/sync').then(({ syncDataToCloud }) => {
        syncDataToCloud(user.uid, { pages: newPages });
      });
    }
  }, [user]);

  const setCurrentPageId = useCallback((newId) => {
    setCurrentPageIdState(newId);
    localStorage.setItem('currentPageId', newId);
  }, []);

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    const newPage = { id: newPageId, title: 'New Page' };
    const newPages = [...pages, newPage];
    savePages(newPages);
    setCurrentPageId(newPageId);
    return newPageId;
  }, [pages, savePages, setCurrentPageId]);

  const renamePage = useCallback((pageId, newTitle) => {
    const trimmed = newTitle.trim() || 'Untitled';
    const newPages = pages.map(p => p.id === pageId ? { ...p, title: trimmed } : p);
    savePages(newPages);
  }, [pages, savePages]);

  const deletePage = useCallback((pageId) => {
    if (pages.length <= 1) return null; // Cannot delete the only existing page
    const newPages = pages.filter(p => p.id !== pageId);
    savePages(newPages);
    
    let nextCurrentId = currentPageId;
    if (currentPageId === pageId) {
      nextCurrentId = newPages[0].id;
      setCurrentPageId(nextCurrentId);
    }
    return nextCurrentId;
  }, [pages, currentPageId, savePages, setCurrentPageId]);

  return {
    pages,
    currentPageId,
    setCurrentPageId,
    addPage,
    renamePage,
    deletePage,
    isPagesLoaded,
    savePages
  };
}
