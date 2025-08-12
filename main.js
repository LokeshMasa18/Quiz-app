import { load, save } from './utils.js';
import { getCurrentUser, doRegister, doLogin } from './auth.js';
import { clearMain, renderTemplate, updateWho, setupGlobalEventListeners } from './ui.js';
import { setupCreateQuiz } from './quizCreator.js';
import { renderQuizById } from './quizTaker.js';
import { populateDashboard } from './dashboard.js';

// Initialize storage if missing
if (!load("users", null)) save("users", []);
if (!load("quizzes", null)) save("quizzes", {});
if (!load("results", null)) save("results", []);

// Router on load for quiz link
function router() {
  const hash = location.hash || "";
  if (hash.startsWith("#quiz=")) {
    const id = hash.split("=")[1];
    renderQuizById(id);
    return;
  }
  clearMain();
  const welcomeMessage = `
    <div style="display:flex;gap:12px;align-items:center">
  <div style="flex:1">
    <h2>Welcome</h2>
    <div class='small'>Create quizzes, share links, and view results. Start by logging in or creating a quiz.</div>
  </div>
  <div style="width:220px;height:220px;display:flex;align-items:center;justify-content:center">
    <img src="./Quiz-3.jpg" alt="Quiz Platform" style="width:100%;height:100%;object-fit:contain;opacity:0.8;"/>
  </div>
</div>`
  document.getElementById("mainArea").innerHTML = welcomeMessage;
}

document.getElementById("openLoginBtn").addEventListener("click", () => {
  renderTemplate("loginTpl");
  document.getElementById("doRegister").onclick = doRegister;
  document.getElementById("doLogin").onclick = doLogin;
});

document.getElementById("createQuizBtn").addEventListener("click", () => {
  if (!getCurrentUser()) {
    alert("Please login/register first");
    renderTemplate("loginTpl");
    document.getElementById("doRegister").onclick = doRegister;
    document.getElementById("doLogin").onclick = doLogin;
    return;
  }
  renderTemplate("createQuizTpl");
  setupCreateQuiz();
});

document.getElementById("myDashboardBtn").addEventListener("click", () => {
  if (!getCurrentUser()) {
    alert("Please login first");
    renderTemplate("loginTpl");
    document.getElementById("doRegister").onclick = doRegister;
    document.getElementById("doLogin").onclick = doLogin;
    return;
  }
  renderTemplate("dashboardTpl");
  populateDashboard();
});

// Initial setup
window.addEventListener("hashchange", router);
router();
updateWho();
setupGlobalEventListeners();

window.viewResults = (id) => {
};
window._store = { load, save };