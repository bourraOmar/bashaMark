import { useState, useEffect } from 'react';

export function isVideoUrl(url) {
  if (!url) return false;
  return url.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export function useBackground() {
  const [background, setBackground] = useState(null);

  const applyBodyBackground = (bg) => {
    if (!bg) {
      document.body.style.background = '#0a0d14';
      return;
    }
    if (isVideoUrl(bg)) {
      // Do not put video in CSS background url()
      document.body.style.background = '#0a0d14';
    } else {
      document.body.style.background = `url(${bg}) center/cover no-repeat fixed`;
    }
  };

  useEffect(() => {
    // Load from storage on mount
    const loadBackground = async () => {
      let bg = null;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['customBackground'], (result) => {
          if (result.customBackground) {
            bg = result.customBackground;
            setBackground(bg);
            applyBodyBackground(bg);
          }
        });
      } else {
        const stored = localStorage.getItem('customBackground');
        if (stored) {
          bg = stored;
          setBackground(bg);
          applyBodyBackground(bg);
        }
      }
    };
    loadBackground();

    // Listen for custom event across components in the same window
    const handleCustomChange = (e) => {
      const bg = e.detail || null;
      setBackground(bg);
      applyBodyBackground(bg);
    };
    window.addEventListener('customBackgroundChanged', handleCustomChange);

    // Listen for Chrome storage changes across tabs or background events
    let storageListener = null;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      storageListener = (changes, areaName) => {
        if (areaName === 'local' && changes.customBackground !== undefined) {
          const bg = changes.customBackground.newValue || null;
          setBackground(bg);
          applyBodyBackground(bg);
        }
      };
      chrome.storage.onChanged.addListener(storageListener);
    }

    return () => {
      window.removeEventListener('customBackgroundChanged', handleCustomChange);
      if (storageListener && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
    };
  }, []);

  const changeBackground = (newBackground) => {
    setBackground(newBackground);
    applyBodyBackground(newBackground);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ customBackground: newBackground });
    } else {
      localStorage.setItem('customBackground', newBackground);
    }
    // Notify all other components currently using useBackground (such as App.jsx) to immediately re-render
    window.dispatchEvent(new CustomEvent('customBackgroundChanged', { detail: newBackground }));
  };

  return { background, isVideo: isVideoUrl(background), changeBackground };
}
