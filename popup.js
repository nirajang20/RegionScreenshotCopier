document.getElementById("setRegion").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({ target: { tabId: tab.id }, func: selectRegion });
  window.close();
});

document.getElementById("takeScreenshot").addEventListener("click", () => {
  window.close();
  setTimeout(() => chrome.runtime.sendMessage({ action: "runRegionCapture" }), 100);
});

function selectRegion() {
  if (document.getElementById("__rsc_overlay")) document.getElementById("__rsc_overlay").remove();
  const overlay = document.createElement("div");
  overlay.id = "__rsc_overlay";
  Object.assign(overlay.style, {
    position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.25)", cursor: "crosshair", zIndex: 2147483647
  });
  document.body.appendChild(overlay);

  let startX, startY, box;

  overlay.onmousedown = (e) => {
    startX = e.clientX;
    startY = e.clientY;
    box = document.createElement("div");
    Object.assign(box.style, { position: "fixed", border: "2px dashed #fff", background: "rgba(255,255,255,0.2)", left: startX+"px", top: startY+"px" });
    overlay.appendChild(box);

    overlay.onmousemove = (ev) => {
      box.style.width = Math.abs(ev.clientX - startX) + "px";
      box.style.height = Math.abs(ev.clientY - startY) + "px";
      box.style.left = Math.min(ev.clientX, startX) + "px";
      box.style.top = Math.min(ev.clientY, startY) + "px";
    };

    overlay.onmouseup = (ev) => {
      const region = { x: Math.min(ev.clientX, startX), y: Math.min(ev.clientY, startY), width: Math.abs(ev.clientX - startX), height: Math.abs(ev.clientY - startY) };
      chrome.runtime.sendMessage({ action: "saveRegion", region });
      overlay.remove();
    };
  };

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") overlay.remove(); });
}
