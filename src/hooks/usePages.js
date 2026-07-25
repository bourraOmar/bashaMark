import { useState, useEffect, useCallback } from 'react';

const defaultPages = [
  { id: 'page-home', title: 'Home' }
];

export function usePages() {
  const [pages, setPagesState] = useState(defaultPages);
  const [currentPageId, setCurrentPageIdState] = useState('page-home');
  const [isPagesLoaded, setIsPagesLoaded] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['pages', 'currentPageId'], (result) => {
        const loadedPages = (result.pages && Array.isArray(result.pages) && result.pages.length > 0) ? result.pages : defaultPages;
        setPagesState(loadedPages);

        if (result.currentPageId && loadedPages.some(p => p.id === result.currentPageId)) {
          setCurrentPageIdState(result.currentPageId);
        } else {
          setCurrentPageIdState(loadedPages[0].id);
        }
        setIsPagesLoaded(true);
      });
    } else {
      const localPages = localStorage.getItem('pages');
      const localCurrent = localStorage.getItem('currentPageId');
      const parsedPages = localPages ? JSON.parse(localPages) : defaultPages;
      const loadedPages = (Array.isArray(parsedPages) && parsedPages.length > 0) ? parsedPages : defaultPages;
      setPagesState(loadedPages);

      if (localCurrent && loadedPages.some(p => p.id === localCurrent)) {
        setCurrentPageIdState(localCurrent);
      } else {
        setCurrentPageIdState(loadedPages[0].id);
      }
      setIsPagesLoaded(true);
    }
  }, []);

  const savePages = (newPages) => {
    setPagesState(newPages);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ pages: newPages });
    } else {
      localStorage.setItem('pages', JSON.stringify(newPages));
    }
  };

  const setCurrentPageId = (newId) => {
    setCurrentPageIdState(newId);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ currentPageId: newId });
    } else {
      localStorage.setItem('currentPageId', newId);
    }
  };

  const addPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    const newPage = { id: newPageId, title: 'New Page' };
    const newPages = [...pages, newPage];
    savePages(newPages);
    setCurrentPageId(newPageId);
    return newPageId;
  }, [pages]);

  const renamePage = useCallback((pageId, newTitle) => {
    const trimmed = newTitle.trim() || 'Untitled';
    const newPages = pages.map(p => p.id === pageId ? { ...p, title: trimmed } : p);
    savePages(newPages);
  }, [pages]);

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
  }, [pages, currentPageId]);

  return {
    pages,
    currentPageId,
    setCurrentPageId,
    addPage,
    renamePage,
    deletePage,
    isPagesLoaded
  };
}
