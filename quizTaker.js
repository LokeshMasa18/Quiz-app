import { load, save, showToast, escapeHtml } from './utils.js';
import { getCurrentUser } from './auth.js';
import { clearMain, renderTemplate } from './ui.js';

export function renderQuizById(rawId) {
  const id = decodeURIComponent(rawId || "");
  const quizzes = load("quizzes", {});
  const q = quizzes[id];
  if (!q) {
    clearMain();
    document.getElementById("mainArea").innerHTML = '<div class="small">Quiz not found</div>';
    return;
  }
  
  // New: Prompt for participant name immediately
  let participantName = prompt("Enter your name to start the quiz:", "");
  if (!participantName) {
    participantName = "Guest";
  }

  renderTemplate("quizTakeTpl");
  document.getElementById("takingTitle").textContent = q.title;
  document.getElementById("quizMeta").textContent = `Created by: ${q.creator} • ${new Date(q.createdAt).toLocaleString()}`;
  const wrap = document.getElementById("quizQuestionWrap");
  let idx = 0;
  const answers = new Array(q.questions.length).fill(null).map(() => []);

  function showQuestion(i) {
    wrap.innerHTML = "";
    const question = q.questions[i];
    const block = document.createElement("div");
    block.innerHTML = `<div><strong>Question ${i + 1} of ${q.questions.length}</strong></div><div style='margin-top:8px'>${escapeHtml(question.text)}</div>`;
    
    const list = document.createElement("div");
    list.style.marginTop = "8px";
    
    const inputType = question.type === 'single' ? 'radio' : 'checkbox';
    
    question.choices.forEach((c, cidx) => {
      const r = document.createElement("div");
      r.style.margin = "6px 0";
      r.innerHTML = `<label style='cursor:pointer'>
        <input type='${inputType}' name='choice_${i}' value='${cidx}' ${answers[i].includes(cidx) ? "checked" : ""}/>
        ${escapeHtml(c)}
      </label>`;
      list.appendChild(r);
    });
    block.appendChild(list);
    wrap.appendChild(block);
    
    wrap.querySelectorAll(`input[name=choice_${i}]`).forEach((el) => {
      el.onchange = (e) => {
        const value = parseInt(e.target.value);
        if (question.type === 'single') {
          answers[i] = [value];
        } else {
          if (e.target.checked) {
            answers[i].push(value);
          } else {
            const index = answers[i].indexOf(value);
            if (index > -1) {
              answers[i].splice(index, 1);
            }
          }
          answers[i].sort();
        }
      };
    });
  }

  showQuestion(idx);
  document.getElementById("prevQ").onclick = () => {
    if (idx > 0) {
      idx--;
      showQuestion(idx);
    }
  };
  document.getElementById("nextQ").onclick = () => {
    if (idx < q.questions.length - 1) {
      idx++;
      showQuestion(idx);
    } else {
      finishQuiz();
    }
  };
  document.getElementById("submitWrap").innerHTML = `<button class='btn' id='submitAll'>Submit Quiz</button>`;
  document.getElementById("submitAll").onclick = finishQuiz;

  function finishQuiz() {
    let score = 0;
    q.questions.forEach((qq, i) => {
      const userAnsweredCorrectly = JSON.stringify(answers[i]) === JSON.stringify(qq.correct);
      if (userAnsweredCorrectly) {
        score++;
      }
    });
    const percent = Math.round((score / q.questions.length) * 100);
    const resDiv = document.getElementById("resultArea");
    resDiv.classList.remove("hidden");
    resDiv.innerHTML = `<div class='card' style='background:transparent;padding:12px;border-radius:8px'><strong>Score: ${score} / ${q.questions.length} (${percent}%)</strong><div class='small'>Saved your result</div></div>`;
    
    const results = load("results", []);
    results.push({
      quizId: id,
      participant: participantName,
      score,
      correct: score,
      total: q.questions.length,
      takenAt: new Date().toISOString(),
    });
    save("results", results);
    showToast("Result saved");
  }
}