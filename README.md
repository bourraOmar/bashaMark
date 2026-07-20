# BashaMark 

A beautifully organized, minimalist New Tab Chrome extension. Start each day calm and clear with a customizable workspace that turns your bookmarks, searches, and daily tools into an elegant glassmorphic dashboard.

## ✨ Features
- **Ultra-Minimalist UI:** A clean, distraction-free interface built with frosted glass aesthetics.
- **Custom Bookmark Boards:** Organize your favorite sites into categorized columns.
- **Drag-and-Drop:** Seamlessly reorder bookmarks or move them between boards using `@dnd-kit`.
- **Chrome Bookmarks Import:** Instantly import your existing Chrome bookmark folders with a single click.
- **Interactive Placeholders:** Hover over empty space to add new boards effortlessly.
- **Local Persistence:** Everything saves automatically to `chrome.storage.local` so your layout is always exactly how you left it.

## 🛠️ Built With
- React
- Vite
- `@dnd-kit` (Drag & Drop)
- Lucide React (Icons)
- Chrome Extension API (Manifest V3)

## 🚀 How to Install (Developer Mode)
1. Clone this repository: `git clone https://github.com/bourraOmar/bashaMark.git`
2. Run `npm install` to install dependencies.
3. Run `npm run build` to generate the extension files.
4. Open Chrome and go to `chrome://extensions/`.
5. Toggle on **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the generated `dist` folder.
7. Open a new tab and enjoy BashaMark!
