import { initRouter, navigateToQuiz } from './router.js';
import { startQuiz, initQuizEngine } from './quiz-engine.js';
import { initSearch } from './search.js';
import { loadAllExams } from './data-loader.js';
import { getAllResults, clearAllResults, getAverageBySection, getCompletedExamCount, getOverallAverage } from './scoring.js';

// Exam data: all középszintű magyar érettségi feladatsorok 2022-2025
const BASE_URL = 'https://dload-oktatas.educatio.hu/erettsegi';

const exams = [
    {
        id: '2022-maj',
        year: 2022,
        session: 'Május',
        date: '2022. május 2.',
        feladatsor: `${BASE_URL}/feladatok_2022tavasz_kozep/k_magyir_22maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022tavasz_kozep/k_magyir_22maj_ut.pdf`,
        szovegertes: {
            title: '2022 Május - Szövegértés',
            desc: 'Szövegértési feladatsor a 2022. májusi érettségi vizsgából.'
        },
        muveleti: {
            title: '2022 Május - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2022. májusi vizsgából.'
        },
        szovegalkotas: {
            title: '2022 Május - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2022. májusi vizsgából.'
        }
    },
    {
        id: '2022-okt',
        year: 2022,
        session: 'Október',
        date: '2022. október 17.',
        feladatsor: `${BASE_URL}/feladatok_2022osz_kozep/k_magyir_22okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022osz_kozep/k_magyir_22okt_ut.pdf`,
        szovegertes: {
            title: '2022 Október - Szövegértés',
            desc: 'Szövegértési feladatsor a 2022. októberi érettségi vizsgából.'
        },
        muveleti: {
            title: '2022 Október - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2022. októberi vizsgából.'
        },
        szovegalkotas: {
            title: '2022 Október - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2022. októberi vizsgából.'
        }
    },
    {
        id: '2023-maj',
        year: 2023,
        session: 'Május',
        date: '2023. május 8.',
        feladatsor: `${BASE_URL}/feladatok_2023tavasz_kozep/k_magyir_23maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023tavasz_kozep/k_magyir_23maj_ut.pdf`,
        szovegertes: {
            title: '2023 Május - Szövegértés',
            desc: 'Szövegértési feladatsor a 2023. májusi érettségi vizsgából.'
        },
        muveleti: {
            title: '2023 Május - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2023. májusi vizsgából.'
        },
        szovegalkotas: {
            title: '2023 Május - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2023. májusi vizsgából.'
        }
    },
    {
        id: '2023-okt',
        year: 2023,
        session: 'Október',
        date: '2023. október 16.',
        feladatsor: `${BASE_URL}/feladatok_2023osz_kozep/k_magyir_23okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023osz_kozep/k_magyir_23okt_ut.pdf`,
        szovegertes: {
            title: '2023 Október - Szövegértés',
            desc: 'Szövegértési feladatsor a 2023. októberi érettségi vizsgából.'
        },
        muveleti: {
            title: '2023 Október - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2023. októberi vizsgából.'
        },
        szovegalkotas: {
            title: '2023 Október - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2023. októberi vizsgából.'
        }
    },
    {
        id: '2024-maj',
        year: 2024,
        session: 'Május',
        date: '2024. május 6.',
        feladatsor: `${BASE_URL}/feladatok_2024tavasz_kozep/k_magyir_24maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024tavasz_kozep/k_magyir_24maj_ut.pdf`,
        szovegertes: {
            title: '2024 Május - Szövegértés',
            desc: 'Szövegértési feladatsor a 2024. májusi érettségi vizsgából.'
        },
        muveleti: {
            title: '2024 Május - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2024. májusi vizsgából.'
        },
        szovegalkotas: {
            title: '2024 Május - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2024. májusi vizsgából.'
        }
    },
    {
        id: '2024-okt',
        year: 2024,
        session: 'Október',
        date: '2024. október 14.',
        feladatsor: `${BASE_URL}/feladatok_2024osz_kozep/k_magyir_24okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024osz_kozep/k_magyir_24okt_ut.pdf`,
        szovegertes: {
            title: '2024 Október - Szövegértés',
            desc: 'Szövegértési feladatsor a 2024. októberi érettségi vizsgából.'
        },
        muveleti: {
            title: '2024 Október - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2024. októberi vizsgából.'
        },
        szovegalkotas: {
            title: '2024 Október - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2024. októberi vizsgából.'
        }
    },
    {
        id: '2025-maj',
        year: 2025,
        session: 'Május',
        date: '2025. május 5.',
        feladatsor: `${BASE_URL}/feladatok_2025tavasz_kozep/k_magyir_25maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2025tavasz_kozep/k_magyir_25maj_ut.pdf`,
        szovegertes: {
            title: '2025 Május - Szövegértés',
            desc: 'Szövegértési feladatsor a 2025. májusi érettségi vizsgából.'
        },
        muveleti: {
            title: '2025 Május - Nyelvi-irodalmi műveletek',
            desc: 'Nyelvtani és irodalmi ismeretek feladatai a 2025. májusi vizsgából.'
        },
        szovegalkotas: {
            title: '2025 Május - Szövegalkotás',
            desc: 'Érvelés és műértelmező elemzés feladatok a 2025. májusi vizsgából.'
        }
    }
];

export { exams };

const historyExams = [
    {
        id: 'tort-2022-maj',
        year: 2022,
        session: 'Május',
        date: '2022. május 4.',
        feladatsor: `${BASE_URL}/feladatok_2022tavasz_kozep/k_tort_22maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022tavasz_kozep/k_tort_22maj_ut.pdf`
    },
    {
        id: 'tort-2022-okt',
        year: 2022,
        session: 'Október',
        date: '2022. október 19.',
        feladatsor: `${BASE_URL}/feladatok_2022osz_kozep/k_tort_22okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022osz_kozep/k_tort_22okt_ut.pdf`
    },
    {
        id: 'tort-2023-maj',
        year: 2023,
        session: 'Május',
        date: '2023. május 10.',
        feladatsor: `${BASE_URL}/feladatok_2023tavasz_kozep/k_tort_23maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023tavasz_kozep/k_tort_23maj_ut.pdf`
    },
    {
        id: 'tort-2023-okt',
        year: 2023,
        session: 'Október',
        date: '2023. október 18.',
        feladatsor: `${BASE_URL}/feladatok_2023osz_kozep/k_tort_23okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023osz_kozep/k_tort_23okt_ut.pdf`
    },
    {
        id: 'tort-2024-maj',
        year: 2024,
        session: 'Május',
        date: '2024. május 8.',
        feladatsor: `${BASE_URL}/feladatok_2024tavasz_kozep/k_tort_24maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024tavasz_kozep/k_tort_24maj_ut.pdf`
    },
    {
        id: 'tort-2024-okt',
        year: 2024,
        session: 'Október',
        date: '2024. október 16.',
        feladatsor: `${BASE_URL}/feladatok_2024osz_kozep/k_tort_24okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024osz_kozep/k_tort_24okt_ut.pdf`
    },
    {
        id: 'tort-2025-maj',
        year: 2025,
        session: 'Május',
        date: '2025. május 7.',
        feladatsor: `${BASE_URL}/feladatok_2025tavasz_kozep/k_tort_25maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2025tavasz_kozep/k_tort_25maj_ut.pdf`
    }
];

export { historyExams };

// --- Render exam items for a task type ---
function renderExamList(containerId, taskType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sortedExams = [...exams].reverse(); // newest first

    container.innerHTML = sortedExams.map(exam => {
        const info = exam[taskType];
        return `
            <div class="exam-item" data-exam-id="${exam.id}">
                <div class="exam-item-header">
                    <span class="exam-item-title">${info.title}</span>
                    <span class="exam-badge">${exam.date}</span>
                </div>
                <p class="exam-item-desc">${info.desc}</p>
                <div class="exam-item-links">
                    <a href="${exam.feladatsor}" target="_blank" class="btn-feladat">
                        &#128196; Feladatsor PDF
                    </a>
                    <a href="${exam.megoldas}" target="_blank" class="btn-megoldas">
                        &#9989; Megoldás PDF
                    </a>
                    <button class="btn-gyakorlas" data-exam-id="${exam.id}" data-section="${taskType}">Gyakorlás</button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Render történelem exam cards ---
function renderHistoryExams() {
    const container = document.getElementById('tortenelem-grid');
    if (!container) return;

    const sortedExams = [...historyExams].reverse();

    if (sortedExams.length === 0) {
        container.innerHTML = '<p class="empty-msg">Még nincs feltöltött történelem feladatsor.</p>';
        return;
    }

    container.innerHTML = sortedExams.map(exam => `
        <div class="exam-full-card" data-exam-id="${exam.id}">
            <div class="exam-full-header">
                <h3>${exam.year}. ${exam.session}</h3>
                <div class="date">${exam.date}</div>
            </div>
            <div class="exam-full-body">
                <ul class="links-list">
                    <li><a href="${exam.feladatsor}" target="_blank">&#128196; Feladatsor letöltése (PDF)</a></li>
                    <li><a href="${exam.megoldas}" target="_blank">&#9989; Javítási útmutató (PDF)</a></li>
                </ul>
                <div class="exam-item-links" style="margin-top:12px;">
                    <button class="btn-gyakorlas" data-exam-id="${exam.id}" data-section="rovid">I. Rövid feladatok</button>
                    <button class="btn-gyakorlas" data-exam-id="${exam.id}" data-section="szoveges">II. Szöveges feladatok</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- Render full exam cards ---
function renderFullExams() {
    const container = document.getElementById('feladatsorok-grid');
    if (!container) return;

    const sortedExams = [...exams].reverse();

    container.innerHTML = sortedExams.map(exam => `
        <div class="exam-full-card" data-exam-id="${exam.id}">
            <div class="exam-full-header">
                <h3>${exam.year}. ${exam.session}</h3>
                <div class="date">${exam.date}</div>
            </div>
            <div class="exam-full-body">
                <ul class="links-list">
                    <li><a href="${exam.feladatsor}" target="_blank">&#128196; Feladatsor letöltése (PDF)</a></li>
                    <li><a href="${exam.megoldas}" target="_blank">&#9989; Javítási útmutató (PDF)</a></li>
                </ul>
            </div>
        </div>
    `).join('');
}

// --- Choice tabs (szovegalkotas) ---
function initChoiceTabs() {
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.choice-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`${btn.dataset.choice}-info`);
            if (target) target.classList.add('active');
        });
    });
}

// --- Results page ---
function renderResults() {
    const container = document.getElementById('results-container');
    if (!container) return;

    const results = getAllResults();

    if (results.length === 0) {
        container.innerHTML = '<p class="empty-msg">Még nincs eredményed. Kezdj el gyakorolni!</p>';
        return;
    }

    const szAvg = getAverageBySection('szovegertes');
    const muAvg = getAverageBySection('muveleti');
    const saAvg = getAverageBySection('szovegalkotas');

    const rows = results.map(r => {
        const pct = r.percentage || (r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0);
        const cls = pct >= 50 ? 'good' : 'bad';
        const timeUsed = r.timeUsed || 0;
        const mins = Math.floor(timeUsed / 60);
        const secs = String(timeUsed % 60).padStart(2, '0');
        const d = new Date(r.date);
        const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        return `<tr>
            <td>${dateStr}</td>
            <td>${r.examId}</td>
            <td>${r.section}</td>
            <td>${r.score}/${r.maxScore}</td>
            <td class="${cls}">${pct}%</td>
            <td>${mins}:${secs}</td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <div class="results-averages">
            <div class="results-avg-card">
                <div class="results-avg-num">${szAvg !== null ? szAvg + '%' : '-'}</div>
                <div class="results-avg-label">Szövegértés átlag</div>
            </div>
            <div class="results-avg-card">
                <div class="results-avg-num">${muAvg !== null ? muAvg + '%' : '-'}</div>
                <div class="results-avg-label">Műveleti átlag</div>
            </div>
            <div class="results-avg-card">
                <div class="results-avg-num">${saAvg !== null ? saAvg + '%' : '-'}</div>
                <div class="results-avg-label">Szövegalkotás átlag</div>
            </div>
        </div>
        <div class="results-table-wrap">
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Dátum</th>
                        <th>Feladatsor</th>
                        <th>Szekció</th>
                        <th>Pont</th>
                        <th>%</th>
                        <th>Idő</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <button class="btn-clear-results" id="btn-clear-results">Eredmények törlése</button>
    `;

    document.getElementById('btn-clear-results').addEventListener('click', () => {
        if (confirm('Biztosan törölni szeretnéd az összes eredményt?')) {
            clearAllResults();
            renderResults();
            renderDynamicStats();
        }
    });
}

// --- Dynamic home page stats ---
function renderDynamicStats() {
    const results = getAllResults();
    if (results.length === 0) return;

    const statNums = document.querySelectorAll('.stat-number');
    const statLabels = document.querySelectorAll('.stat-label');
    if (statNums.length < 3 || statLabels.length < 3) return;

    const completed = getCompletedExamCount();
    const overall = getOverallAverage();
    const total = results.length;

    statNums[0].textContent = `${completed}/21`;
    statLabels[0].textContent = 'Kitöltött szekció';

    statNums[1].textContent = `${overall}%`;
    statLabels[1].textContent = 'Átlagos eredmény';

    statNums[2].textContent = `${total}`;
    statLabels[2].textContent = 'Összes kitöltés';
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initChoiceTabs();

    renderExamList('szovegertes-list', 'szovegertes');
    renderExamList('muveleti-list', 'muveleti');
    renderExamList('szovegalkotas-list', 'szovegalkotas');
    renderFullExams();
    renderHistoryExams();
    renderDynamicStats();

    // Pre-load exam data for search, then init search
    loadAllExams().then(() => initSearch());

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-gyakorlas');
        if (btn) {
            navigateToQuiz(btn.dataset.examId, btn.dataset.section);
            startQuiz(btn.dataset.examId, btn.dataset.section);
        }

        const eredmenyekBtn = e.target.closest('[data-section="eredmenyek"]');
        if (eredmenyekBtn) {
            renderResults();
        }
    });
    initQuizEngine();
    initThemeToggle();
});

// --- Dark mode ---
function initThemeToggle() {
    const saved = localStorage.getItem('magyar-erettsegi-theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateToggleIcon(true);
    }

    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('magyar-erettsegi-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('magyar-erettsegi-theme', 'dark');
            }
            updateToggleIcon(!isDark);
        });
    }
}

function updateToggleIcon(isDark) {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = isDark ? '&#9788;' : '&#9790;';
}
