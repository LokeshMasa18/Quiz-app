export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    console.error("Failed to load from localStorage", e);
    return fallback;
  }
}

export function save(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

export function showToast(msg, ms = 1800) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  t.setAttribute("aria-hidden", "false");
  clearTimeout(t._to);
  t._to = setTimeout(() => {
    t.classList.remove("show");
    t.setAttribute("aria-hidden", "true");
  }, ms);
}

// HTML escaping helper
export function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function safeCopy(text) {
  text = String(text === undefined ? "" : text);
  try {
    const hasClipboardAPI = !!(
      navigator.clipboard &&
      navigator.clipboard.writeText &&
      window.isSecureContext
    );
    if (hasClipboardAPI) {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const perm = await navigator.permissions.query({
            name: "clipboard-write",
          });
          if (perm && perm.state === "denied") {
            throw new Error("clipboard-write permission denied");
          }
        }
      } catch (pErr) {
        console.warn("clipboard permission query failed or unavailable", pErr);
      }

      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard");
        return true;
      } catch (apiErr) {
        console.warn("navigator.clipboard.writeText failed", apiErr);
      }
    }
  } catch (e) {
    console.warn("clipboard check error", e);
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);

    ta.select();
    ta.setSelectionRange(0, ta.value.length);

    const ok = document.execCommand && document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) {
      showToast("Copied (fallback)");
      return true;
    }
  } catch (err) {
    console.warn("fallback copy failed", err);
  }
  try {
    prompt("Copy the link below (Ctrl/Cmd+C):", text);
  } catch (e) {
    console.warn("prompt fallback failed", e);
  }
  return false;
}