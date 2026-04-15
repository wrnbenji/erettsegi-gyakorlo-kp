// js/quiz-engine.js

import { loadExam } from './data-loader.js';
import { startTimer, stopTimer, togglePause, isTimerPaused, getElapsedSeconds, isTimerExpired } from './timer.js';
import { checkAnswer, saveQuizResult } from './scoring.js';
import { trackResult } from './mistakes.js';
import { navigateTo } from './router.js';

let currentExam = null;
let currentSection = null;
let currentTasks = [];

function backSection(sectionType) {
    if (sectionType === 'rovid' || sectionType === 'szoveges') return 'tortenelem';
    return sectionType;
}
let currentTaskIndex = 0;
let checkMode = 'summary'; // 'each' or 'summary'
let userAnswers = {};
let taskResults = {};
let quizFinished = false;
let sourceText = '';

// --- Public API ---

export async function startQuiz(examId, sectionType, options = {}) {
    quizFinished = false;
    userAnswers = {};
    taskResults = {};
    currentTaskIndex = 0;
    currentSection = sectionType;

    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;padding:40px;">Betöltés...</p>';

    const examData = await loadExam(examId);
    if (!examData || !examData.sections || !examData.sections[sectionType]) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--accent);">A feladatsor betöltése sikertelen.</p>';
        return;
    }

    currentExam = examData;
    const section = examData.sections[sectionType];
    let tasks = section.tasks || [];
    if (options.filterTaskIds && options.filterTaskIds.length) {
        tasks = tasks.filter(t => options.filterTaskIds.includes(t.id));
    }
    currentTasks = tasks;
    sourceText = section.sourceText || '';

    renderModeSelection(container, examData, sectionType, section);
}

export function initQuizEngine() {
    document.addEventListener('click', (e) => {
        const saveBtn = e.target.closest('.btn-save-rubric');
        if (saveBtn) {
            saveRubricScores(saveBtn);
        }
    });
}

// --- Mode Selection ---

function renderModeSelection(container, examData, sectionType, section) {
    const sectionLabels = {
        szovegertes: 'I. Szövegértés',
        muveleti: 'II. Nyelvi-irodalmi műveletek',
        szovegalkotas: 'III. Szövegalkotás',
        rovid: 'I. Rövid feladatok',
        szoveges: 'II. Szöveges feladatok'
    };
    const title = `${examData.year} ${examData.session} - ${sectionLabels[sectionType] || sectionType}`;

    container.innerHTML = `
        <div class="quiz-start">
            <h2>${title}</h2>
            <p>Feladatok száma: <strong>${currentTasks.length}</strong> | Maximális pontszám: <strong>${section.maxPoints}</strong> | Idő: <strong>${section.timeLimit} perc</strong></p>
            <div class="mode-selection">
                <h3>Ellenőrzési mód:</h3>
                <div class="mode-options">
                    <label class="mode-option">
                        <input type="radio" name="quiz-mode" value="each" checked>
                        <div class="mode-card">
                            <strong>Feladatonkénti ellenőrzés</strong>
                            <p>Minden feladat után megtudod, helyes-e a válaszod.</p>
                        </div>
                    </label>
                    <label class="mode-option">
                        <input type="radio" name="quiz-mode" value="summary">
                        <div class="mode-card">
                            <strong>Összesítés a végén</strong>
                            <p>A feladatsor végén kapsz részletes összesítést.</p>
                        </div>
                    </label>
                </div>
            </div>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;">
                <button class="btn-back" id="quiz-back-btn">Vissza</button>
                <button class="btn-start-quiz" id="quiz-start-btn">Indítás</button>
            </div>
        </div>
    `;

    document.getElementById('quiz-back-btn').addEventListener('click', () => {
        navigateTo(backSection(sectionType));
    });

    document.getElementById('quiz-start-btn').addEventListener('click', () => {
        const selected = document.querySelector('input[name="quiz-mode"]:checked');
        checkMode = selected ? selected.value : 'summary';
        startQuizSession(container, examData, sectionType, section);
    });
}

// --- Quiz Session ---

function startQuizSession(container, examData, sectionType, section) {
    const sectionLabels = {
        szovegertes: 'I. Szövegértés',
        muveleti: 'II. Nyelvi-irodalmi műveletek',
        szovegalkotas: 'III. Szövegalkotás',
        rovid: 'I. Rövid feladatok',
        szoveges: 'II. Szöveges feladatok'
    };
    const title = `${examData.year} ${examData.session} - ${sectionLabels[sectionType] || sectionType}`;
    const hasSource = sectionType === 'szovegertes' && sourceText;

    container.innerHTML = `
        <div class="quiz-layout">
            <div class="quiz-header">
                <div class="quiz-title">${title}</div>
                <div class="quiz-header-right">
                    <button class="btn-pause" id="btn-pause">Szünet</button>
                    <span id="timer-display">00:00</span>
                </div>
            </div>
            <div class="task-nav" id="task-nav"></div>
            <div class="quiz-body ${hasSource ? '' : 'no-source'}">
                ${hasSource ? `
                <div class="source-panel" id="source-panel">
                    <div class="source-header">
                        <span>Forrászszöveg</span>
                        <button class="source-toggle" id="source-toggle">Összecsukás</button>
                    </div>
                    <div class="source-content" id="source-content">${formatSourceText(sourceText)}</div>
                </div>` : ''}
                <div class="task-panel" id="task-panel"></div>
            </div>
            <div class="quiz-footer" id="quiz-footer"></div>
            <div class="quiz-pause-overlay" id="pause-overlay" style="display:none;">
                <div class="pause-message">Szünet – Kattints a folytatáshoz</div>
            </div>
        </div>
    `;

    // Timer
    startTimer(section.timeLimit, {
        onAlert: (minutes) => showTimerAlert(minutes),
        onExpire: () => finishQuiz()
    });

    // Pause button
    document.getElementById('btn-pause').addEventListener('click', handlePause);

    // Pause overlay click to resume
    document.getElementById('pause-overlay').addEventListener('click', handlePause);

    // Source toggle
    if (hasSource) {
        document.getElementById('source-toggle').addEventListener('click', toggleSource);
    }

    // Render task nav
    renderTaskNav();
    renderTask(currentTaskIndex);
    renderFooter();
}

function formatSourceText(text) {
    return text.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
}

// --- Pause ---

function handlePause() {
    const paused = togglePause();
    const overlay = document.getElementById('pause-overlay');
    const btn = document.getElementById('btn-pause');
    if (paused) {
        overlay.style.display = 'flex';
        btn.textContent = 'Folytatás';
    } else {
        overlay.style.display = 'none';
        btn.textContent = 'Szünet';
    }
}

// --- Source Panel ---

function toggleSource() {
    const content = document.getElementById('source-content');
    const btn = document.getElementById('source-toggle');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        btn.textContent = 'Összecsukás';
    } else {
        content.style.display = 'none';
        btn.textContent = 'Kinyitás';
    }
}

// --- Task Navigation ---

function renderTaskNav() {
    const nav = document.getElementById('task-nav');
    if (!nav) return;
    nav.innerHTML = currentTasks.map((task, i) => {
        let cls = 'task-nav-btn';
        if (i === currentTaskIndex) cls += ' current';
        if (userAnswers[task.id] !== undefined) cls += ' answered';
        if (taskResults[task.id]) cls += ' checked';
        return `<button class="${cls}" data-index="${i}">${i + 1}</button>`;
    }).join('');

    nav.querySelectorAll('.task-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            saveCurrentAnswer();
            currentTaskIndex = parseInt(btn.dataset.index);
            renderTask(currentTaskIndex);
            renderTaskNav();
            renderFooter();
        });
    });
}

// --- Task Rendering ---

function renderTask(index) {
    const panel = document.getElementById('task-panel');
    if (!panel || !currentTasks[index]) return;

    const task = currentTasks[index];
    const result = taskResults[task.id];

    let html = `
        <div class="task-header">
            <span class="task-number">${index + 1}. feladat</span>
            <span class="task-points">${task.points} pont</span>
        </div>
        <div class="task-question">${task.question || task.prompt || ''}</div>
        <div class="task-input" id="task-input">
    `;

    switch (task.type) {
        case 'multiple-choice': html += renderMultipleChoice(task); break;
        case 'true-false': html += renderTrueFalse(task); break;
        case 'fill-in': html += renderFillIn(task); break;
        case 'matching': html += renderMatching(task); break;
        case 'table-fill': html += renderTableFill(task); break;
        case 'short-answer': html += renderShortAnswer(task); break;
        case 'ordering': html += renderOrdering(task); break;
        case 'essay': html += renderEssay(task); break;
        default: html += `<p>Ismeretlen feladattípus.</p>`; break;
    }

    html += '</div>';

    if (result) {
        html += renderCheckResult(task, result);
    }

    panel.innerHTML = html;

    // Restore answer
    restoreAnswer(task);

    // Bind interactions
    bindTaskInteractions(task);
}

// --- Individual Renderers ---

function renderMultipleChoice(task) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `<div class="mc-options">${task.options.map((opt, i) => `
        <label class="mc-option" data-index="${i}">
            <input type="radio" name="mc-${task.id}" value="${i}" style="display:none;">
            <span class="mc-letter">${letters[i]}</span>
            <span class="mc-text">${opt}</span>
        </label>
    `).join('')}</div>`;
}

function renderTrueFalse(task) {
    return `<div class="tf-options">
        <button class="tf-btn" data-value="true">Igaz</button>
        <button class="tf-btn" data-value="false">Hamis</button>
    </div>`;
}

function renderFillIn(task) {
    return `<input type="text" class="fill-input" id="fill-input-${task.id}" placeholder="Írd be a választ..." autocomplete="off">`;
}

function renderMatching(task) {
    const rightOptions = task.pairs.map(p => p.right);
    const shuffled = [...rightOptions].sort(() => Math.random() - 0.5);

    return `<div class="matching-grid">${task.pairs.map((pair, i) => `
        <div class="matching-row">
            <div class="matching-left">${pair.left}</div>
            <select class="matching-select" data-index="${i}">
                <option value="">-- Válassz --</option>
                ${shuffled.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
        </div>
    `).join('')}</div>`;
}

function renderTableFill(task) {
    let html = `<table class="table-fill"><thead><tr>`;
    task.headers.forEach(h => { html += `<th>${h}</th>`; });
    html += `</tr></thead><tbody>`;

    task.rows.forEach((row, rowIdx) => {
        html += '<tr>';
        task.headers.forEach(header => {
            if (row.given && row.given[header] !== undefined) {
                html += `<td class="given-cell">${row.given[header]}</td>`;
            } else {
                html += `<td><input type="text" class="table-input" data-row="${rowIdx}" data-col="${header}" placeholder="..." autocomplete="off"></td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

function renderShortAnswer(task) {
    return `
        <textarea class="short-answer-input" id="short-answer-${task.id}" placeholder="Írd be a válaszod..." rows="4"></textarea>
        <button class="btn-show-sample" data-task-id="${task.id}">Mutasd a mintaválaszt</button>
        <div class="sample-answer" id="sample-${task.id}" style="display:none;">
            <strong>Mintaválasz:</strong> ${task.sampleAnswer}
        </div>
    `;
}

function renderOrdering(task) {
    const answer = userAnswers[task.id];
    const items = answer ? answer.map(idx => task.items[idx]) : [...task.items];
    const indices = answer || task.items.map((_, i) => i);

    return `<div class="ordering-list" id="ordering-list">${indices.map((origIdx, pos) => `
        <div class="ordering-item" data-pos="${pos}" data-orig="${origIdx}">
            <span class="ordering-number">${pos + 1}.</span>
            <span class="ordering-text">${task.items[origIdx]}</span>
            <span class="ordering-btns">
                <button class="ordering-up" data-pos="${pos}" ${pos === 0 ? 'disabled' : ''}>&#9650;</button>
                <button class="ordering-down" data-pos="${pos}" ${pos === indices.length - 1 ? 'disabled' : ''}>&#9660;</button>
            </span>
        </div>
    `).join('')}</div>`;
}

function renderEssay(task) {
    const wordInfo = task.minWords && task.maxWords ? `(${task.minWords}-${task.maxWords} szó, ajánlott)` : '';
    return `
        <textarea class="essay-input" id="essay-${task.id}" placeholder="Írd meg a szöveget..." rows="12"></textarea>
        <div class="word-counter" id="word-counter-${task.id}">0 szó ${wordInfo}</div>
    `;
}

// --- Check Result ---

function getCorrectAnswerHtml(task) {
    let html = '';
    switch (task.type) {
        case 'multiple-choice':
            html = `<div class="correct-answer"><strong>Helyes válasz:</strong> ${String.fromCharCode(65 + task.correct)}) ${task.options[task.correct]}</div>`;
            break;
        case 'true-false':
            html = `<div class="correct-answer"><strong>Helyes válasz:</strong> ${task.correct ? 'Igaz' : 'Hamis'}</div>`;
            break;
        case 'fill-in':
            html = `<div class="correct-answer"><strong>Helyes válasz:</strong> ${task.correct.join(' / ')}</div>`;
            break;
        case 'matching':
            html = `<div class="correct-answer"><strong>Helyes párosítás:</strong><ul>${task.pairs.map(p => `<li>${p.left} → ${p.right}</li>`).join('')}</ul></div>`;
            break;
        case 'table-fill':
            html = `<div class="correct-answer"><strong>Helyes kitöltés:</strong><ul>${task.rows.map(r => Object.entries(r.answer).map(([col, val]) => `<li>${col}: ${val}</li>`).join('')).join('')}</ul></div>`;
            break;
        case 'ordering':
            html = `<div class="correct-answer"><strong>Helyes sorrend:</strong><ol>${task.correctOrder.map(i => `<li>${task.items[i]}</li>`).join('')}</ol></div>`;
            break;
        case 'short-answer':
            html = `<div class="correct-answer"><strong>Mintaválasz:</strong> ${task.sampleAnswer}</div>`;
            break;
    }
    if (task.explanation) {
        html += `<div class="explanation"><strong>Magyarázat:</strong> ${task.explanation}</div>`;
    }
    return html;
}

function renderCheckResult(task, result) {
    if (result.needsManualReview) {
        let html = `<div class="check-result manual">
            <span class="check-icon">&#9998;</span>
            Önértékelés szükséges.`;
        if (result.sampleAnswer) {
            html += `<div class="sample-answer" style="display:block;margin-top:8px;"><strong>Mintaválasz:</strong> ${result.sampleAnswer}</div>`;
        }
        html += '</div>';

        // Rubric for essay
        if (task.type === 'essay' && task.rubric) {
            html += renderRubric(task);
        }
        return html;
    }

    const correctAnswerHtml = getCorrectAnswerHtml(task);

    const explanationHtml = task.explanation ? `<div class="explanation"><strong>Magyarázat:</strong> ${task.explanation}</div>` : '';

    if (result.correct === true) {
        return `<div class="check-result correct"><span class="check-icon">&#10003;</span> Helyes! ${result.points}/${task.points} pont${explanationHtml}</div>`;
    } else if (result.correct === false) {
        let detail = '';
        if (result.correctCount !== undefined) {
            detail = ` (${result.correctCount}/${result.totalPairs} helyes)`;
        }
        if (result.correctCells !== undefined) {
            detail = ` (${result.correctCells}/${result.totalCells} helyes)`;
        }
        return `<div class="check-result incorrect"><span class="check-icon">&#10007;</span> Helytelen. ${result.points}/${task.points} pont${detail}${correctAnswerHtml}</div>`;
    }
    return '';
}

function renderRubric(task) {
    const saved = userAnswers[task.id + '_rubric'] || {};
    let html = `<div class="rubric-self-eval" data-task-id="${task.id}">
        <h4>Önértékelés – pontozás</h4>`;

    task.rubric.forEach((crit, i) => {
        const savedVal = saved[i] !== undefined ? saved[i] : '';
        html += `<div class="rubric-row">
            <label><strong>${crit.criterion}</strong> (max ${crit.maxPoints} pont)</label>
            <select class="rubric-select" data-crit-index="${i}">
                <option value="">-- Válassz --</option>
                ${crit.levels.map((level, li) => {
                    const match = level.match(/^(\d+(?:[–-]\d+)?)/);
                    const val = match ? match[1].split(/[–-]/).pop() : li;
                    return `<option value="${val}" ${String(savedVal) === String(val) ? 'selected' : ''}>${level}</option>`;
                }).join('')}
            </select>
        </div>`;
    });

    html += `<button class="btn-save-rubric" data-task-id="${task.id}">Mentés</button></div>`;
    return html;
}

// --- Bind Interactions ---

function bindTaskInteractions(task) {
    const disabled = !!taskResults[task.id];

    // Multiple choice click
    if (task.type === 'multiple-choice') {
        document.querySelectorAll('.mc-option').forEach(opt => {
            opt.addEventListener('click', () => {
                if (disabled) return;
                document.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                opt.querySelector('input').checked = true;
            });
        });
    }

    // True/false
    if (task.type === 'true-false') {
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (disabled) return;
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    // Short answer sample button
    if (task.type === 'short-answer') {
        const sampleBtn = document.querySelector('.btn-show-sample');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => {
                const el = document.getElementById(`sample-${task.id}`);
                if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
            });
        }
    }

    // Ordering up/down
    if (task.type === 'ordering') {
        document.querySelectorAll('.ordering-up').forEach(btn => {
            btn.addEventListener('click', () => {
                if (disabled) return;
                moveOrderingItem(parseInt(btn.dataset.pos), -1, task);
            });
        });
        document.querySelectorAll('.ordering-down').forEach(btn => {
            btn.addEventListener('click', () => {
                if (disabled) return;
                moveOrderingItem(parseInt(btn.dataset.pos), 1, task);
            });
        });
    }

    // Essay word counter
    if (task.type === 'essay') {
        const textarea = document.getElementById(`essay-${task.id}`);
        if (textarea) {
            textarea.addEventListener('input', () => updateWordCounter(task));
            updateWordCounter(task);
        }
    }
}

function moveOrderingItem(pos, direction, task) {
    saveCurrentAnswer();
    const answer = userAnswers[task.id] || task.items.map((_, i) => i);
    const newPos = pos + direction;
    if (newPos < 0 || newPos >= answer.length) return;

    // Swap
    const temp = answer[pos];
    answer[pos] = answer[newPos];
    answer[newPos] = temp;
    userAnswers[task.id] = answer;

    renderTask(currentTaskIndex);
}

function updateWordCounter(task) {
    const textarea = document.getElementById(`essay-${task.id}`);
    const counter = document.getElementById(`word-counter-${task.id}`);
    if (!textarea || !counter) return;

    const text = textarea.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    const info = task.minWords && task.maxWords ? ` (${task.minWords}-${task.maxWords} szó, ajánlott)` : '';

    counter.textContent = `${count} szó${info}`;
    counter.classList.remove('word-under', 'word-over', 'word-ok');
    if (task.minWords && count < task.minWords) {
        counter.classList.add('word-under');
    } else if (task.maxWords && count > task.maxWords) {
        counter.classList.add('word-over');
    } else {
        counter.classList.add('word-ok');
    }
}

// --- Save / Restore Answers ---

function saveCurrentAnswer() {
    const task = currentTasks[currentTaskIndex];
    if (!task) return;

    switch (task.type) {
        case 'multiple-choice': {
            const checked = document.querySelector(`input[name="mc-${task.id}"]:checked`);
            if (checked) userAnswers[task.id] = parseInt(checked.value);
            break;
        }
        case 'true-false': {
            const selected = document.querySelector('.tf-btn.selected');
            if (selected) userAnswers[task.id] = selected.dataset.value === 'true';
            break;
        }
        case 'fill-in': {
            const input = document.getElementById(`fill-input-${task.id}`);
            if (input) userAnswers[task.id] = input.value;
            break;
        }
        case 'matching': {
            const selects = document.querySelectorAll('.matching-select');
            const vals = [];
            selects.forEach(s => vals.push(s.value));
            if (vals.some(v => v)) userAnswers[task.id] = vals;
            break;
        }
        case 'table-fill': {
            const inputs = document.querySelectorAll('.table-input');
            const tableData = {};
            inputs.forEach(inp => {
                const row = inp.dataset.row;
                const col = inp.dataset.col;
                if (!tableData[row]) tableData[row] = {};
                tableData[row][col] = inp.value;
            });
            if (Object.keys(tableData).length) userAnswers[task.id] = tableData;
            break;
        }
        case 'short-answer': {
            const textarea = document.getElementById(`short-answer-${task.id}`);
            if (textarea) userAnswers[task.id] = textarea.value;
            break;
        }
        case 'ordering': {
            const items = document.querySelectorAll('.ordering-item');
            if (items.length) {
                const order = [];
                items.forEach(item => order.push(parseInt(item.dataset.orig)));
                userAnswers[task.id] = order;
            }
            break;
        }
        case 'essay': {
            const textarea = document.getElementById(`essay-${task.id}`);
            if (textarea) {
                const existing = userAnswers[task.id] || {};
                if (typeof existing === 'object' && !Array.isArray(existing)) {
                    existing.text = textarea.value;
                    userAnswers[task.id] = existing;
                } else {
                    userAnswers[task.id] = { text: textarea.value };
                }
            }
            break;
        }
    }
}

function restoreAnswer(task) {
    const answer = userAnswers[task.id];
    if (answer === undefined && task.type !== 'ordering') return;

    switch (task.type) {
        case 'multiple-choice': {
            if (answer === undefined) return;
            const radio = document.querySelector(`input[name="mc-${task.id}"][value="${answer}"]`);
            if (radio) {
                radio.checked = true;
                radio.closest('.mc-option').classList.add('selected');
            }
            break;
        }
        case 'true-false': {
            if (answer === undefined) return;
            const btn = document.querySelector(`.tf-btn[data-value="${answer}"]`);
            if (btn) btn.classList.add('selected');
            break;
        }
        case 'fill-in': {
            if (answer === undefined) return;
            const input = document.getElementById(`fill-input-${task.id}`);
            if (input) input.value = answer;
            break;
        }
        case 'matching': {
            if (!answer) return;
            const selects = document.querySelectorAll('.matching-select');
            selects.forEach((s, i) => {
                if (answer[i]) s.value = answer[i];
            });
            break;
        }
        case 'table-fill': {
            if (!answer) return;
            const inputs = document.querySelectorAll('.table-input');
            inputs.forEach(inp => {
                const row = inp.dataset.row;
                const col = inp.dataset.col;
                if (answer[row] && answer[row][col]) inp.value = answer[row][col];
            });
            break;
        }
        case 'short-answer': {
            if (answer === undefined) return;
            const textarea = document.getElementById(`short-answer-${task.id}`);
            if (textarea) textarea.value = answer;
            break;
        }
        case 'ordering': {
            // Already handled in renderOrdering via userAnswers
            break;
        }
        case 'essay': {
            if (!answer) return;
            const textarea = document.getElementById(`essay-${task.id}`);
            if (textarea && answer.text) textarea.value = answer.text;
            updateWordCounter(task);
            break;
        }
    }
}

// --- Footer ---

function renderFooter() {
    const footer = document.getElementById('quiz-footer');
    if (!footer) return;

    const isFirst = currentTaskIndex === 0;
    const isLast = currentTaskIndex === currentTasks.length - 1;
    const task = currentTasks[currentTaskIndex];
    const alreadyChecked = !!taskResults[task.id];

    let html = '';
    html += `<button class="btn-quiz-nav" id="btn-prev" ${isFirst ? 'disabled' : ''}>Előző</button>`;

    if (checkMode === 'each' && !alreadyChecked) {
        html += `<button class="btn-quiz-check" id="btn-check">Ellenőrzés</button>`;
    }

    if (isLast) {
        html += `<button class="btn-quiz-finish" id="btn-finish">Befejezés</button>`;
    } else {
        html += `<button class="btn-quiz-nav" id="btn-next">Következő</button>`;
    }

    footer.innerHTML = html;

    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const checkBtn = document.getElementById('btn-check');
    const finishBtn = document.getElementById('btn-finish');

    if (prevBtn) prevBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        currentTaskIndex--;
        renderTask(currentTaskIndex);
        renderTaskNav();
        renderFooter();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        currentTaskIndex++;
        renderTask(currentTaskIndex);
        renderTaskNav();
        renderFooter();
    });

    if (checkBtn) checkBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        checkCurrentTask();
    });

    if (finishBtn) finishBtn.addEventListener('click', () => {
        saveCurrentAnswer();
        finishQuiz();
    });
}

// --- Per-task check ---

function checkCurrentTask() {
    const task = currentTasks[currentTaskIndex];
    const answer = userAnswers[task.id];
    const result = checkAnswer(task, answer);
    taskResults[task.id] = result;

    if (result && result.correct !== null && currentExam) {
        trackResult(currentExam.id, task.id, result.correct, task.type);
    }

    renderTask(currentTaskIndex);
    renderTaskNav();
    renderFooter();
}

// --- Finish Quiz ---

function finishQuiz() {
    quizFinished = true;
    stopTimer();
    saveCurrentAnswer();

    const elapsed = getElapsedSeconds();

    // Check all tasks that haven't been checked yet
    currentTasks.forEach(task => {
        if (!taskResults[task.id]) {
            const answer = userAnswers[task.id];
            taskResults[task.id] = checkAnswer(task, answer);
        }
        const r = taskResults[task.id];
        if (r && r.correct !== null && currentExam) {
            trackResult(currentExam.id, task.id, r.correct, task.type);
        }
    });

    // Calculate totals
    let totalPoints = 0;
    let maxPoints = 0;
    currentTasks.forEach(task => {
        const result = taskResults[task.id];
        totalPoints += result ? result.points : 0;
        maxPoints += task.points;
    });

    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    // Save result
    saveQuizResult({
        examId: currentExam.id,
        section: currentSection,
        score: totalPoints,
        maxScore: maxPoints,
        percentage,
        timeUsed: elapsed,
        taskResults: { ...taskResults }
    });

    renderSummary(totalPoints, maxPoints, percentage, elapsed);
}

// --- Summary ---

function renderSummary(totalPoints, maxPoints, percentage, elapsed) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins} perc ${secs} mp`;
    const pctClass = percentage >= 60 ? 'summary-pass' : 'summary-fail';

    let taskRows = currentTasks.map((task, i) => {
        const result = taskResults[task.id] || { points: 0 };
        const typeLabels = {
            'multiple-choice': 'Választós',
            'true-false': 'Igaz/Hamis',
            'fill-in': 'Kitöltős',
            'matching': 'Párosítás',
            'table-fill': 'Táblázat',
            'short-answer': 'Rövid válasz',
            'ordering': 'Sorrendbe rakós',
            'essay': 'Fogalmazás'
        };
        const statusIcon = result.correct === true ? '&#10003;' :
                          result.correct === false ? '&#10007;' :
                          result.needsManualReview ? '&#9998;' : '&#10007;';
        const statusClass = result.correct === true ? 'correct' :
                           result.correct === false ? 'incorrect' : 'manual';

        return `<div class="summary-task-row ${statusClass}">
            <span class="summary-task-num">${i + 1}.</span>
            <span class="summary-task-type">${typeLabels[task.type] || task.type}</span>
            <span class="summary-task-status">${statusIcon}</span>
            <span class="summary-task-score">${result.points}/${task.points}</span>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="quiz-summary">
            <div class="summary-header">
                <h2>Összesítés</h2>
                <p>${currentExam.year} ${currentExam.session} - ${currentSection}</p>
            </div>
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="summary-number ${pctClass}">${percentage}%</div>
                    <div class="summary-label">Eredmény</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-number">${totalPoints}/${maxPoints}</div>
                    <div class="summary-label">Pontszám</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-number">${timeStr}</div>
                    <div class="summary-label">Eltelt idő</div>
                </div>
            </div>
            <div class="summary-tasks">
                <h3>Feladatonkénti eredmény</h3>
                ${taskRows}
            </div>
            <div class="summary-actions">
                <button class="btn-back" id="summary-back">Vissza a főoldalra</button>
            </div>
        </div>
    `;

    document.getElementById('summary-back').addEventListener('click', () => {
        navigateTo(backSection(currentSection));
    });
}

// --- Rubric save ---

function saveRubricScores(btn) {
    const taskId = btn.dataset.taskId;
    const rubricEl = document.querySelector(`.rubric-self-eval[data-task-id="${taskId}"]`);
    if (!rubricEl) return;

    const selects = rubricEl.querySelectorAll('.rubric-select');
    const scores = {};
    let total = 0;
    selects.forEach(s => {
        const idx = s.dataset.critIndex;
        const val = parseInt(s.value) || 0;
        scores[idx] = val;
        total += val;
    });

    userAnswers[taskId + '_rubric'] = scores;

    // Update essay answer with selfScore
    if (!userAnswers[taskId]) userAnswers[taskId] = {};
    if (typeof userAnswers[taskId] === 'object') {
        userAnswers[taskId].selfScore = total;
    }

    // Update taskResult
    if (taskResults[taskId]) {
        taskResults[taskId].points = total;
    }

    btn.textContent = 'Mentve!';
    setTimeout(() => { btn.textContent = 'Mentés'; }, 1500);
}

// --- Timer Alert ---

function showTimerAlert(minutes) {
    const alertEl = document.createElement('div');
    alertEl.className = `timer-alert ${minutes <= 5 ? 'danger' : 'warning'}`;
    if (minutes === 0) {
        alertEl.textContent = 'Az idő lejárt!';
    } else {
        alertEl.textContent = `Már csak ${minutes} perc van hátra!`;
    }
    document.body.appendChild(alertEl);
    setTimeout(() => {
        if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl);
    }, 4000);
}
