# Region Screenshot Copier

**Region Screenshot Copier** is a lightweight Chrome extension that allows you to capture a **custom region of any webpage** and copy it directly to your clipboard. No files are saved—just copy and paste anywhere. Designed for **Mac users** with a default shortcut `⌘ + ⇧ + 1`, but you can customize the region once and reuse it anytime.

GitHub repository: [https://github.com/nirajang20/RegionScreenshotCopier](https://github.com/nirajang20/RegionScreenshotCopier)

---

## Features

* Set a **custom region** once and reuse it.
* Capture the region with a **keyboard shortcut**: `Command + Shift + 1`.
* **Copies directly to clipboard**; no files are saved.
* **Toast notifications** confirm successful screenshot copy.
* Works on **any normal webpage** (does not capture `chrome://` pages).
* Lightweight and easy to use.

---

## Installation

1. Clone or download the repository:

```bash
git clone https://github.com/nirajang20/RegionScreenshotCopier.git
```

2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `RegionScreenshotCopier` folder.
5. The extension icon will appear in your toolbar.

---

## Usage

1. Open any normal webpage (not `chrome://`).
2. Click the extension icon → click **Set Region** → drag a box over the area you want to capture.
3. Close the popup.
4. Press **⌘ + ⇧ + 1** → the selected region is captured and copied to your clipboard.
5. Paste anywhere to see your screenshot.
6. You can reset the region anytime by repeating step 2.

---

## File Structure

```
RegionScreenshotCopier/
 ├── manifest.json       # Chrome extension manifest
 ├── background.js       # Handles shortcut and messaging
 ├── content.js          # Executes image processing in page context
 ├── popup.html          # Popup UI for setting region
 ├── popup.js            # Popup scripts for region selection and buttons
 └── style.css           # Popup styling
```

---

## Notes

* **Cannot capture** Chrome internal pages (`chrome://extensions`, `chrome://settings`) or the extension popup itself.
* Designed for **Mac** default shortcut; Windows/Linux may need to adjust in `manifest.json`.
* Uses **Manifest V3** Chrome extension API.

---

## License

MIT License – free to use and modify.
