import { useState, useEffect } from 'react';

export function useBackground() {
  const [background, setBackground] = useState(null);

  useEffect(() => {
    // Load from storage on mount
    const loadBackground = async () => {
      let bg = null;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['customBackground'], (result) => {
          if (result.customBackground) {
            bg = result.customBackground;
            setBackground(bg);
            document.body.style.background = `url(${bg}) center/cover no-repeat fixed`;
          }
        });
      } else {
        const stored = localStorage.getItem('customBackground');
        if (stored) {
          bg = stored;
          setBackground(bg);
          document.body.style.background = `url(${bg}) center/cover no-repeat fixed`;
        }
      }
    };
    loadBackground();
  }, []);

  const changeBackground = (newBackground) => {
    setBackground(newBackground);
    document.body.style.background = `url(${newBackground}) center/cover no-repeat fixed`;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ customBackground: newBackground });
    } else {
      localStorage.setItem('customBackground', newBackground);
    }
  };

  return { background, changeBackground };
}
