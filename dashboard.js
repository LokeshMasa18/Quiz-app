import { load, escapeHtml } from './utils.js';
import { getCurrentUser } from './auth.js';
import { renderTemplate } from './ui.js';

export function populateDashboard() {
  const quizzes = load("quizzes", {});
  const results = load("results", []);
  const cu = getCurrentUser();
  const created = Object.values(quizzes).filter((q) => q.creator === cu.username);
  const myQuizzesWrap = document.getElementById("myQuizzes");
  myQuizzesWrap.innerHTML = "";
  const base = location.href.split("#")[0];
  created.forEach((q) => {
    const el = document.createElement("div");
    el.style.marginBottom = "8px";
    el.className = "q-item";
    const link = base + "#quiz=" + encodeURIComponent(q.id);
    el.innerHTML = `<strong>${escapeHtml(q.title)}</strong> <div class='small'>${new Date(q.createdAt).toLocaleString()}</div><div style='margin-top:8px;display:flex;gap:8px'><button class='link copyBtn' data-link='${escapeHtml(link)}'>Copy link</button><button class='ghost viewResultsBtn' data-id='${escapeHtml(q.id)}'>View results</button></div>`;
    myQuizzesWrap.appendChild(el);
  });
  
  const allResultsWrap = document.getElementById("allResults");
  allResultsWrap.innerHTML = "";
  const myResults = results.filter((r) => created.some((c) => c.id === r.quizId));
  if (myResults.length === 0) {
    allResultsWrap.innerHTML = '<div class="small">No results yet</div>';
    return;
  }
  const table = document.createElement("table");
  table.innerHTML = `<thead><tr><th>Quiz</th><th>Participant</th><th>Score</th><th>Date</th></tr></thead>`;
  const tb = document.createElement("tbody");
  myResults.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt)).forEach((r) => {
    const quiz = quizzes[r.quizId];
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(quiz.title)}</td><td>${escapeHtml(r.participant)}</td><td>${r.score} / ${r.total}</td><td class='small'>${new Date(r.takenAt).toLocaleString()}</td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  allResultsWrap.appendChild(table);
}

export function viewResults(quizId) {
  renderTemplate("dashboardTpl");
  populateDashboard();
  const allResults = load("results", []).filter((r) => r.quizId === quizId);
  const wrap = document.getElementById("allResults");
  wrap.innerHTML = "";
  if (allResults.length === 0) {
    wrap.innerHTML = '<div class="small">No results for this quiz</div>';
    return;
  }
  const t = document.createElement("table");
  t.innerHTML = `<thead><tr><th>Participant</th><th>Score</th><th>Date</th></tr></thead>`;
  const tb = document.createElement("tbody");
  allResults.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt)).forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(r.participant)}</td><td>${r.score} / ${r.total}</td><td class='small'>${new Date(r.takenAt).toLocaleString()}</td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  wrap.appendChild(t);
}