# BashaMark 

A beautifully organized, minimalist New Tab Chrome extension. Start each day calm and clear with a customizable workspace that turns your bookmarks, searches, and daily tools into an elegant glassmorphic dashboard.

## ✨ Features
- **Cloud Sync & Cross-Browser Support:** Sign in with your Google account to automatically sync your workspace across Chrome, Brave, and other browsers using Firebase.
- **Custom Tabs & Pages:** Organize your workspace into multiple tabs. Instantly move boards and widgets between tabs to keep your work focused.
- **Widgets System:** Enhance your productivity with built-in Notes, Calendar, Pomodoro Timer, Prayer Times, and Weather widgets.
- **Website-to-Board Quick Save:** Click the extension popup on any webpage to instantly beam the site into a specific board on your new tab page.
- **Ultra-Minimalist UI:** A clean, distraction-free interface built with beautiful frosted glass (glassmorphism) aesthetics.
- **Drag-and-Drop:** Seamlessly reorder bookmarks, widgets, and boards using `@dnd-kit`.
- **Privacy First:** Logging out instantly clears local data, keeping your workspace private when stepping away from shared devices.
- **Chrome Bookmarks Import:** Instantly import your existing Chrome bookmark folders with a single click.

## 🛠️ Built With
- React & Vite
- Firebase (Firestore & Google OAuth)
- `@dnd-kit` (Drag & Drop)
- Lucide React (Icons)
- Chrome Extension API (Manifest V3)

## 🚀 How to Install (Developer Mode)
1. Clone this repository: `git clone https://github.com/bourraOmar/bashaMark.git`
2. Run `npm install` to install dependencies.
3. Run `npm run build` to generate the extension files.
4. Open Chrome (or Brave) and go to `chrome://extensions/`.
5. Toggle on **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the generated `dist` folder.
7. Open a new tab and enjoy BashaMark!
