import { useState, useEffect } from 'react';

export const defaultSettings = {
  primaryColor: '#00003b', // Matches first wallpaper
  boardColor: '#00002f', // Matches first wallpaper
  opacity: 20, // 20%
  blur: 12, // 12px
  textSize: 'M', // S, M, L
  textWeight: 'Normal', // Normal, Bold
  numberOfColumns: 'Auto', // 'Auto', 4, 5, 6, 7, 8, 9
  boardWidth: 250, // px
  openLinksInNewTab: true,
  hideExtraBookmarksEnabled: true,
  hideExtraBookmarks: '10', // '10', '20', 'All'
  showDescriptions: true,
  quickSaveBoard: 'Barre de favoris',
  quickSaveShortcut: 'Not set',
  region: 'Safi, Morocco',
  alwaysShowAllButtons: false,
  hasCompletedTour: false
};

export function useSettings() {
  const [settings, setSettingsState] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          const loaded = { ...defaultSettings, ...result.settings };
          // If this is an existing user updating, they won't have hasCompletedTour in their saved settings.
          // We set it to true so we don't bother them with the tour.
          if (result.settings.hasCompletedTour === undefined) {
            loaded.hasCompletedTour = true;
          }
          if (loaded.boardWidth === 264) loaded.boardWidth = 250;
          setSettingsState(loaded);
        }
        setIsLoaded(true);
      });
    } else {
      const local = localStorage.getItem('settings');
      if (local) {
        const parsed = JSON.parse(local);
        const loaded = { ...defaultSettings, ...parsed };
        if (parsed.hasCompletedTour === undefined) {
          loaded.hasCompletedTour = true;
        }
        if (loaded.boardWidth === 264) loaded.boardWidth = 250;
        setSettingsState(loaded);
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
