const SCANNED_ATTR = "data-ntlv-scanned";
  return false;
}

function readInlineHandler(el) {
  return [el.getAttribute("onclick") || "", el.getAttribute("onmousedown") || "", el.getAttribute("onmouseup") || ""].join(" ").toLowerCase();
}

function safeComputedStyle(el) {
  try {
    return window.getComputedStyle(el);
  } catch {
    return { cursor: "" };
  }
}

function installClickProbe() {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickable = target.closest("a, button, [role='link'], [onclick], div, span");
      if (!(clickable instanceof HTMLElement)) return;

      showFloatingBadge(clickable, clickable.hasAttribute(BLANK_ATTR) ? "新規タブ確定" : clickable.hasAttribute(MAYBE_ATTR) ? "新規タブの可能性" : "クリック検出");
    },
    true
  );
}

function patchWindowOpenProbe() {
  const originalOpen = window.open;

  window.open = function patchedOpen(...args) {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.classList.add("ntlv-outline-blank");
      active.setAttribute(BLANK_ATTR, "true");
      showFloatingBadge(active, "クリック後に新規タブを検出");
    }
    return originalOpen.apply(window, args);
  };
}

let badgeTimer = null;

function showFloatingBadge(el, text) {
  removeFloatingBadge();

  const badge = document.createElement("div");
  badge.className = "ntlv-floating-badge";
  badge.textContent = text;

  document.body.appendChild(badge);

  const rect = el.getBoundingClientRect();
  const top = Math.max(8, rect.top + window.scrollY - 30);
  const left = Math.max(8, rect.left + window.scrollX);

  badge.style.top = `${top}px`;
  badge.style.left = `${left}px`;

  badgeTimer = window.setTimeout(() => {
    removeFloatingBadge();
  }, 1400);
}

function removeFloatingBadge() {
  const old = document.querySelector(".ntlv-floating-badge");
  if (old) old.remove();
  if (badgeTimer) {
    clearTimeout(badgeTimer);
    badgeTimer = null;
  }
}