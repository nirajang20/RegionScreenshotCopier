
# Region Screenshot Copier

**Region Screenshot Copier** is a powerful and lightweight Chrome extension designed to streamline the process of capturing and sharing specific areas of any webpage. With a focus on speed, privacy, and ease of use, this tool lets you select a custom region once and instantly copy screenshots of that region to your clipboard with a single keyboard shortcut—no files saved, no clutter, just seamless copy-paste functionality.

## In-Depth Description

Region Screenshot Copier is ideal for users who frequently need to share visual snippets from web pages, such as developers, designers, educators, and support teams. Unlike traditional screenshot tools that save files to your disk, this extension copies the selected region directly to your clipboard, making it perfect for quick sharing in chats, emails, or documents. The extension works entirely within the browser, ensuring your screenshots never leave your device, and no data is uploaded or stored externally.

**Key Advantages:**
- **One-time region selection:** Set your preferred capture area once and reuse it as often as needed.
- **Instant clipboard copy:** No need to manage files—just paste your screenshot wherever you need it.
- **Customizable shortcut:** Default is `⌘ + ⇧ + 1` on Mac and `Ctrl + Shift + 1` on Windows, but you can change it in Chrome's extension shortcuts settings.
- **Visual feedback:** Toast notifications confirm when your screenshot is successfully copied.
- **Privacy-first:** All processing happens locally in your browser; nothing is sent to external servers.
- **Lightweight and unobtrusive:** Minimal permissions and a simple, intuitive interface.

Whether you're reporting a bug, sharing a design, or saving a snippet for reference, Region Screenshot Copier makes the process fast and frictionless.

GitHub repository: [https://github.com/nirajang20/RegionScreenshotCopier](https://github.com/nirajang20/RegionScreenshotCopier)

---

## Features

* Set a **custom region** once and reuse it.
* Capture the region with a **keyboard shortcut**: `Command + Shift + 1` (Mac) or `Ctrl + Shift + 1` (Windows/Linux).
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
4. Press **⌘ + ⇧ + 1** (Mac) or **Ctrl + Shift + 1** (Windows/Linux) → the selected region is captured and copied to your clipboard.
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
* Default shortcut is **⌘ + ⇧ + 1** (Mac) or **Ctrl + Shift + 1** (Windows/Linux); you can adjust this in Chrome's extension shortcuts settings or in `manifest.json` if needed.
* Uses **Manifest V3** Chrome extension API.

---

## License

MIT License – free to use and modify.
