import { getCurrentUser } from './auth.js';
import { renderTemplate, clearMain } from './ui.js';
import { load, save, showToast, escapeHtml } from './utils.js';

export function setupCreateQuiz() {
  const questions = [];
  const questionsList = document.getElementById("questionsList");
  const qTypeText = document.getElementById("q_type_text");
  const correctIndexInput = document.getElementById("correctIndex");
  const questionTypeSelect = document.getElementById("questionType");
  const addQuestionBtn = document.getElementById("addQuestion");
  const saveQuizBtn = document.getElementById("saveQuiz");
  const cancelCreateBtn = document.getElementById("cancelCreate");

  // New handler to switch input based on question type
  questionTypeSelect.onchange = (e) => {
    const isSingle = e.target.value === "single";
    qTypeText.textContent = isSingle ? "Correct answer (enter 1-4)" : "Correct answers (comma-separated, e.g., 1,3)";
    correctIndexInput.placeholder = isSingle ? "1" : "1,3";
  };

  function refreshList() {
    questionsList.innerHTML = "";
    questions.forEach((q, idx) => {
      const el = document.createElement("div");
      el.className = "q-item";
      const correctAnswersDisplay = q.correct.map(c => c + 1).join(', ');
      el.innerHTML = `
        <strong>Q${idx + 1} (${q.type === 'single' ? 'Single Choice' : 'Multiple Choice'}):</strong> ${escapeHtml(q.text)}
        <div class='small'>Choices: ${q.choices.map((c) => escapeHtml(c)).join(" | ")} - Correct: ${correctAnswersDisplay}</div>
      `;
      questionsList.appendChild(el);
    });
  }

  addQuestionBtn.onclick = () => {
    const type = questionTypeSelect.value;
    const text = document.getElementById("q_text").value.trim();
    const choices = [
      document.getElementById("a1").value.trim(),
      document.getElementById("a2").value.trim(),
      document.getElementById("a3").value.trim(),
      document.getElementById("a4").value.trim(),
    ];
    const correctAnswersStr = correctIndexInput.value.trim();
    
    let correctIndices;
    if (type === 'single') {
      const index = parseInt(correctAnswersStr) - 1;
      correctIndices = isNaN(index) || index < 0 || index > 3 ? [] : [index];
    } else {
      correctIndices = correctAnswersStr.split(',').map(s => parseInt(s.trim()) - 1);
    }

    if (!text || choices.some((c) => !c) || correctIndices.some(isNaN)) {
      alert("Please fill in the question, all 4 answers, and the correct answers.");
      return;
    }
    
    const isValid = correctIndices.every(i => i >= 0 && i <= 3);
    if (!isValid || (type === 'single' && correctIndices.length !== 1)) {
        alert("Please enter a valid correct answer index(es).");
        return;
    }

    questions.push({ type, text, choices, correct: correctIndices.sort() });
    
    document.getElementById("q_text").value = "";
    ["a1", "a2", "a3", "a4"].forEach((id) => (document.getElementById(id).value = ""));
    correctIndexInput.value = "";
    
    refreshList();
  };

  saveQuizBtn.onclick = () => {
    const title = document.getElementById("quizTitle").value.trim();
    const gen = document.getElementById("generatedLink");
    if (!title || questions.length === 0) {
      alert("Add a title and at least 1 question");
      return;
    }
    const quizzes = load("quizzes", {});
    const id = "q_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    quizzes[id] = {
      id,
      title,
      creator: getCurrentUser().username,
      questions,
      createdAt: new Date().toISOString(),
    };
    save("quizzes", quizzes);
    const base = location.href.split("#")[0];
    const link = base + "#quiz=" + encodeURIComponent(id);
    gen.innerHTML = `Shareable link generated: <span class="small" style="display:inline-block;vertical-align:middle;max-width:100%;overflow-wrap:anywhere">${escapeHtml(link)}</span> <button class="btn copyBtn" data-link="${escapeHtml(link)}" style="margin-left:8px">Copy</button>`;
    showToast("Quiz saved");
  };

  cancelCreateBtn.onclick = () => {
    clearMain();
  };
}