import { useState, useEffect } from 'react';

export const defaultSettings = {
  primaryColor: '#b47b44', // Orange/brown color from screenshot
  boardColor: '#000000', // Black
  opacity: 20, // 20%
  blur: 12, // 12px
  textSize: 'M', // S, M, L
  textWeight: 'Normal', // Normal, Bold
  numberOfColumns: 'Auto', // 'Auto', 4, 5, 6, 7, 8, 9
  boardWidth: 264, // px
  openLinksInNewTab: true,
  hideExtraBookmarks: '10', // '10', '20', 'All'
  showDescriptions: true,
  quickSaveBoard: 'Barre de favoris',
  quickSaveShortcut: 'Not set',
  region: 'Auto-detect',
  alwaysShowAllButtons: false
};

export function useSettings() {
  const [settings, setSettingsState] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          setSettingsState({ ...defaultSettings, ...result.settings });
        }
        setIsLoaded(true);
      });
    } else {
      const local = localStorage.getItem('settings');
      if (local) {
        setSettingsState({ ...defaultSettings, ...JSON.parse(local) });
      }
      setIsLoaded(true);
    }
  }, []);

  const setSettings = (newSettings) => {
    setSettingsState(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ settings: newSettings });
    } else {
      localStorage.setItem('settings', JSON.stringify(newSettings));
    }
  };

  return { settings, setSettings, isLoaded };
}
