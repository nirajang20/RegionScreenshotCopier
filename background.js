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

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.storage.local.get(["region"], (result) => {
      if (!tab) return;

      if (!result.region) {
        injectToast(tab.id, "Set a region from the extension popup, then try again.", "warn");
        return;
      }

      if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        injectToast(tab.id, "Cannot capture this page type. Try a normal webpage.", "warn");
        return;
      }

      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
        if (!dataUrl) {
          injectToast(tab.id, "Capture failed. Refresh the tab and retry.", "warn");
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

function injectToast(tabId, message, tone = "info") {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (msg, t) => {
      renderToast(msg, t);
      function renderToast(text, tone) {
        ensureToastStyles();
        const toast = document.createElement("div");
        toast.className = `rsc-toast ${tone}`;
        const icon = document.createElement("div");
        icon.className = `rsc-toast-icon ${tone}`;
        icon.innerHTML = `
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>`;
        const label = document.createElement("div");
        label.className = "rsc-toast-text";
        label.textContent = text;
        toast.append(icon, label);
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("visible"));
        setTimeout(() => toast.classList.remove("visible"), 1800);
        setTimeout(() => toast.remove(), 2400);
      }
      function ensureToastStyles() {
        if (document.getElementById("__rsc_toast_styles")) return;
        const style = document.createElement("style");
        style.id = "__rsc_toast_styles";
        style.textContent = `
          .rsc-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 14px;
            border-radius: 12px;
            font: 600 14px/1.2 "Inter", "Segoe UI", sans-serif;
            color: #0f172a;
            background: #fff;
            border: 1px solid rgba(15, 23, 42, 0.1);
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
            opacity: 0;
            transform: translateY(12px) scale(0.98);
            transition: opacity 200ms ease, transform 200ms ease;
            z-index: 2147483647;
            min-width: 220px;
            overflow: hidden;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .rsc-toast.visible { opacity: 1; transform: translateY(0) scale(1); }
          .rsc-toast.success { border-color: rgba(16, 185, 129, 0.55); box-shadow: 0 12px 32px rgba(16, 185, 129, 0.22); }
          .rsc-toast.info { border-color: rgba(102, 166, 255, 0.55); box-shadow: 0 12px 32px rgba(102, 166, 255, 0.25); }
          .rsc-toast.warn { border-color: rgba(244, 144, 46, 0.6); box-shadow: 0 12px 32px rgba(244, 144, 46, 0.25); }
          .rsc-toast-text { flex: 1; }
          .rsc-toast-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            color: #fff;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
            transform: scale(0.86);
            opacity: 0;
            animation: rsc-icon-pop 200ms ease forwards;
          }
          .rsc-toast-icon.success { background: linear-gradient(135deg, #22c55e, #4ade80); }
          .rsc-toast-icon.info { background: linear-gradient(135deg, #60a5fa, #93c5fd); }
          .rsc-toast-icon.warn { background: linear-gradient(135deg, #fbbf24, #f97316); }
          .rsc-toast-icon svg {
            width: 16px;
            height: 16px;
            stroke-dasharray: 26;
            stroke-dashoffset: 26;
            animation: rsc-check-draw 360ms ease forwards 100ms;
          }
          .rsc-toast-progress {
            position: absolute;
            left: 0;
            bottom: 0;
            height: 3px;
            width: 100%;
            background: linear-gradient(90deg, #66a6ff, #89f7fe);
            transform: scaleX(0);
            transform-origin: left;
          }
          .rsc-toast-progress.animate { animation: rsc-progress 1800ms ease forwards; }
          @keyframes rsc-progress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          @keyframes rsc-icon-pop {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes rsc-check-draw {
            from { stroke-dashoffset: 26; }
            to { stroke-dashoffset: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    },
    args: [message, tone]
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
        renderToast("Screenshot copied to clipboard", "success");
      } catch (err) {
        renderToast("Clipboard write was blocked. Check permissions.", "warn");
        console.error(err);
      }
    }, "image/png");
  };
  img.src = dataUrl;

  function renderToast(text, tone = "success") {
    ensureToastStyles();
    const toast = document.createElement("div");
    toast.className = `rsc-toast ${tone}`;

    const icon = document.createElement("div");
    icon.className = `rsc-toast-icon ${tone}`;
    icon.innerHTML = `
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;

    const label = document.createElement("div");
    label.className = "rsc-toast-text";
    label.textContent = text;

    const progress = document.createElement("div");
    progress.className = "rsc-toast-progress";
    toast.append(icon, label, progress);

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add("visible");
      progress.classList.add("animate");
    });
    setTimeout(() => toast.classList.remove("visible"), 2000);
    setTimeout(() => toast.remove(), 2600);
  }

  function ensureToastStyles() {
    if (document.getElementById("__rsc_toast_styles")) return;
    const style = document.createElement("style");
    style.id = "__rsc_toast_styles";
    style.textContent = `
      .rsc-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 14px;
        border-radius: 12px;
        font: 600 14px/1.2 "Inter", "Segoe UI", sans-serif;
        color: #0f172a;
        background: #fff;
        border: 1px solid rgba(15, 23, 42, 0.1);
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
        opacity: 0;
        transform: translateY(12px) scale(0.98);
        transition: opacity 200ms ease, transform 200ms ease;
        z-index: 2147483647;
        min-width: 220px;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .rsc-toast.visible { opacity: 1; transform: translateY(0) scale(1); }
      .rsc-toast.success { border-color: rgba(16, 185, 129, 0.55); box-shadow: 0 12px 32px rgba(16, 185, 129, 0.22); }
      .rsc-toast.warn { border-color: rgba(244, 144, 46, 0.6); box-shadow: 0 12px 32px rgba(244, 144, 46, 0.25); }
      .rsc-toast-text { flex: 1; }
      .rsc-toast-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: #fff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
        transform: scale(0.86);
        opacity: 0;
        animation: rsc-icon-pop 200ms ease forwards;
      }
      .rsc-toast-icon.success { background: linear-gradient(135deg, #22c55e, #4ade80); }
      .rsc-toast-icon.warn { background: linear-gradient(135deg, #fbbf24, #f97316); }
      .rsc-toast-icon svg {
        width: 16px;
        height: 16px;
        stroke-dasharray: 26;
        stroke-dashoffset: 26;
        animation: rsc-check-draw 360ms ease forwards 100ms;
      }
      .rsc-toast-progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #66a6ff, #89f7fe);
        transform: scaleX(0);
        transform-origin: left;
      }
      .rsc-toast-progress.animate { animation: rsc-progress 1800ms ease forwards; }
      @keyframes rsc-progress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }
      @keyframes rsc-icon-pop {
        from { transform: scale(0.6); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes rsc-check-draw {
        from { stroke-dashoffset: 26; }
        to { stroke-dashoffset: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
