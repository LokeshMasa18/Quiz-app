import { getCurrentUser } from './auth.js';
import { safeCopy, showToast, escapeHtml } from './utils.js';
import { viewResults } from './dashboard.js';

const mainArea = document.getElementById("mainArea");

export function clearMain() {
  mainArea.innerHTML = "";
}

export function renderTemplate(tpl) {
  clearMain();
  const node = document.getElementById(tpl).content.cloneNode(true);
  mainArea.appendChild(node);
}

export function updateWho() {
  const node = document.getElementById("who");
  const user = getCurrentUser();
  node.textContent = user
    ? "Signed in: " + user.username
    : "Not signed in";
  const myDashboardBtn = document.getElementById("myDashboardBtn");
  if (myDashboardBtn) {
    myDashboardBtn.classList.toggle("ghost", !user);
  }
}

export function setupGlobalEventListeners() {
  document.addEventListener("click", async (e) => {
    const copyBtn = e.target.closest(".copyBtn");
    if (copyBtn) {
      const link = copyBtn.getAttribute("data-link") || copyBtn.dataset.link || "";
      if (link) safeCopy(link);
      return;
    }
    const viewBtn = e.target.closest(".viewResultsBtn");
    if (viewBtn) {
      const id = viewBtn.getAttribute("data-id") || viewBtn.dataset.id;
      if (id) viewResults(id);
      return;
    }
  });
}