let lastCaptureTime = 0;

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy_region_screenshot") runRegionCapture();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "runRegionCapture") runRegionCapture();
  if (msg.action === "saveRegion") {
    chrome.storage.local.set({ region: msg.region }, () => {
      console.log("✅ Region saved:", msg.region);
    });
  }
});

function runRegionCapture() {
  const now = Date.now();
  if (now - lastCaptureTime < 500) return; // debounce
  lastCaptureTime = now;

  chrome.storage.local.get(["region"], (result) => {
    if (!result.region) {
      console.warn("Set a region first!");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        console.warn("Cannot capture this page type.");
        return;
      }

      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
        if (!dataUrl) {
          console.error("Capture failed");
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: processScreenshot,
          args: [dataUrl, result.region]
        });
      });
    });
  });
}

// Runs in content script context
function processScreenshot(dataUrl, region) {
  const img = new Image();
  img.onload = async () => {
    const canvas = document.createElement("canvas");
    const scale = window.devicePixelRatio || 1;
    canvas.width = region.width * scale;
    canvas.height = region.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, region.x * scale, region.y * scale, region.width * scale, region.height * scale, 0, 0, region.width * scale, region.height * scale);

    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast("📸 Screenshot copied ✅");
      } catch (err) {
        showToast("Clipboard write failed ✖");
        console.error(err);
      }
    }, "image/png");
  };
  img.src = dataUrl;

  function showToast(msg) {
    const t = document.createElement("div");
    t.innerText = msg;
    Object.assign(t.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 2147483647,
      opacity: 0,
      transition: "opacity 0.3s ease"
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => (t.style.opacity = 1));
    setTimeout(() => {
      t.style.opacity = 0;
      setTimeout(() => t.remove(), 500);
    }, 1800);
  }
}
