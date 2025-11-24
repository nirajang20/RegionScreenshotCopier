const setRegionBtn = document.getElementById("setRegion");
const takeScreenshotBtn = document.getElementById("takeScreenshot");
const regionStatusEl = document.getElementById("regionStatus");
const regionIndicator = document.getElementById("regionIndicator");
const platformTipEl = document.getElementById("platformTip");
const shortcutDisplay = document.getElementById("shortcutDisplay");

document.addEventListener("DOMContentLoaded", () => {
  applyPlatformCopy();
  chrome.storage.local.get(["region"], ({ region }) => updateRegionUI(region));
});

setRegionBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({ target: { tabId: tab.id }, func: selectRegion });
  window.close();
});

takeScreenshotBtn.addEventListener("click", () => {
  window.close();
  setTimeout(() => chrome.runtime.sendMessage({ action: "runRegionCapture" }), 100);
});

function applyPlatformCopy() {
  const platform = detectPlatform();
  const shortcut = platform === "mac" ? "⌘ + ⇧ + 1" : "Ctrl + Shift + 1";
  shortcutDisplay.textContent = shortcut;
  platformTipEl.textContent =
    platform === "mac"
      ? "Mac ready: use Command + Shift + 1 or customize in Chrome."
      : "Windows ready: use Ctrl + Shift + 1 or customize in Chrome.";
}

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "other";
}

function updateRegionUI(region) {
  if (region && region.width && region.height) {
    regionStatusEl.textContent = `Region saved: ${Math.round(region.width)}px x ${Math.round(region.height)}px`;
    regionIndicator.classList.add("ready");
  } else {
    regionStatusEl.textContent = "No region saved yet.";
    regionIndicator.classList.remove("ready");
  }
}

// Runs in the active tab to provide an animated selector overlay
function selectRegion() {
  const existing = document.getElementById("__rsc_overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "__rsc_overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(4, 7, 15, 0.32)",
    backdropFilter: "blur(1.2px)",
    cursor: "crosshair",
    zIndex: 2147483647,
    transition: "opacity 180ms ease",
    opacity: "0"
  });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => (overlay.style.opacity = "1"));

  const hint = document.createElement("div");
  hint.textContent = "Drag to select your region. Press Esc to cancel.";
  Object.assign(hint.style, {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
    fontFamily: "Inter, -apple-system, system-ui, sans-serif",
    fontSize: "13px",
    letterSpacing: "0.01em",
    border: "1px solid rgba(15, 23, 42, 0.08)"
  });
  overlay.appendChild(hint);

  let startX = 0;
  let startY = 0;
  let box;
  let label;

  const escHandler = (evt) => {
    if (evt.key === "Escape") fadeOut();
  };
  document.addEventListener("keydown", escHandler);

  overlay.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    startY = e.clientY;

    box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      border: "1px solid #7dd3fc",
      background: "rgba(137, 247, 254, 0.14)",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(255,255,255,0.25) inset",
      borderRadius: "10px",
      left: `${startX}px`,
      top: `${startY}px`,
      transition: "box-shadow 120ms ease"
    });
    overlay.appendChild(box);

    label = document.createElement("div");
    Object.assign(label.style, {
      position: "fixed",
      padding: "6px 10px",
      background: "#0f172a",
      color: "#fff",
      borderRadius: "8px",
      fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      fontSize: "12px",
      letterSpacing: "0.02em",
      pointerEvents: "none",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)"
    });
    label.textContent = "0px × 0px";
    overlay.appendChild(label);

    overlay.addEventListener("mousemove", onMove);
    overlay.addEventListener(
      "mouseup",
      (ev) => {
        overlay.removeEventListener("mousemove", onMove);
        const region = buildRegion(ev);
        if (region.width < 2 || region.height < 2) {
          fadeOut();
          return;
        }
        chrome.runtime.sendMessage({ action: "saveRegion", region });
        showSavedBadge(region);
        setTimeout(() => fadeOut(), 420);
      },
      { once: true }
    );
  });

  const onMove = (ev) => {
    if (!box) return;
    const region = buildRegion(ev);
    Object.assign(box.style, {
      left: `${region.x}px`,
      top: `${region.y}px`,
      width: `${region.width}px`,
      height: `${region.height}px`
    });
    label.textContent = `${Math.round(region.width)}px x ${Math.round(region.height)}px`;
    label.style.left = `${region.x + region.width / 2 - label.offsetWidth / 2}px`;
    label.style.top = `${region.y - 32}px`;
  };

  const buildRegion = (evt) => ({
    x: Math.min(evt.clientX, startX),
    y: Math.min(evt.clientY, startY),
    width: Math.abs(evt.clientX - startX),
    height: Math.abs(evt.clientY - startY)
  });

  const fadeOut = () => {
    document.removeEventListener("keydown", escHandler);
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 200);
  };

  const showSavedBadge = (region) => {
    const badge = document.createElement("div");
    badge.textContent = `Region saved (${Math.round(region.width)} x ${Math.round(region.height)})`;
    Object.assign(badge.style, {
      position: "fixed",
      bottom: "18px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "10px 14px",
      background: "#0f172a",
      color: "#fff",
      borderRadius: "12px",
      fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      fontSize: "13px",
      letterSpacing: "0.01em",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.22)",
      opacity: "0",
      transition: "opacity 180ms ease, transform 180ms ease"
    });
    overlay.appendChild(badge);
    requestAnimationFrame(() => {
      badge.style.opacity = "1";
      badge.style.transform = "translateX(-50%) translateY(-4px)";
    });
    setTimeout(() => {
      badge.style.opacity = "0";
      badge.style.transform = "translateX(-50%) translateY(6px)";
    }, 260);
  };
}
