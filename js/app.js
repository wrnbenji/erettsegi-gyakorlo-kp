import { initRouter, navigateToQuiz } from './router.js';
import { startQuiz, initQuizEngine } from './quiz-engine.js';

// Exam data: all középszintű magyar érettségi feladatsorok 2022-2025
const BASE_URL = 'https://dload-oktatas.educatio.hu/erettsegi';
const ONLINE_BASE = 'https://erettsegigyakorlo.hu/Magyar/K%C3%B6z%C3%A9p';

const exams = [
    {
        id: '2022-maj',
        year: 2022,
        session: 'Majus',
        date: '2022. majus 2.',
        feladatsor: `${BASE_URL}/feladatok_2022tavasz_kozep/k_magyir_22maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022tavasz_kozep/k_magyir_22maj_ut.pdf`,
        online: `${ONLINE_BASE}/2022-majus`,
        szovegertes: {
            title: '2022 Majus - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2022. majusi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2022 Majus - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2022. majusi vizsgabol.'
        },
        szovegalkotas: {
            title: '2022 Majus - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2022. majusi vizsgabol.'
        }
    },
    {
        id: '2022-okt',
        year: 2022,
        session: 'Oktober',
        date: '2022. oktober 17.',
        feladatsor: `${BASE_URL}/feladatok_2022osz_kozep/k_magyir_22okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022osz_kozep/k_magyir_22okt_ut.pdf`,
        online: `${ONLINE_BASE}/2022-oktober`,
        szovegertes: {
            title: '2022 Oktober - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2022. oktoberi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2022 Oktober - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2022. oktoberi vizsgabol.'
        },
        szovegalkotas: {
            title: '2022 Oktober - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2022. oktoberi vizsgabol.'
        }
    },
    {
        id: '2023-maj',
        year: 2023,
        session: 'Majus',
        date: '2023. majus 8.',
        feladatsor: `${BASE_URL}/feladatok_2023tavasz_kozep/k_magyir_23maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023tavasz_kozep/k_magyir_23maj_ut.pdf`,
        online: `${ONLINE_BASE}/2023-majus`,
        szovegertes: {
            title: '2023 Majus - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2023. majusi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2023 Majus - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2023. majusi vizsgabol.'
        },
        szovegalkotas: {
            title: '2023 Majus - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2023. majusi vizsgabol.'
        }
    },
    {
        id: '2023-okt',
        year: 2023,
        session: 'Oktober',
        date: '2023. oktober 16.',
        feladatsor: `${BASE_URL}/feladatok_2023osz_kozep/k_magyir_23okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023osz_kozep/k_magyir_23okt_ut.pdf`,
        online: `${ONLINE_BASE}/2023-oktober`,
        szovegertes: {
            title: '2023 Oktober - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2023. oktoberi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2023 Oktober - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2023. oktoberi vizsgabol.'
        },
        szovegalkotas: {
            title: '2023 Oktober - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2023. oktoberi vizsgabol.'
        }
    },
    {
        id: '2024-maj',
        year: 2024,
        session: 'Majus',
        date: '2024. majus 6.',
        feladatsor: `${BASE_URL}/feladatok_2024tavasz_kozep/k_magyir_24maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024tavasz_kozep/k_magyir_24maj_ut.pdf`,
        online: `${ONLINE_BASE}/2024-majus`,
        szovegertes: {
            title: '2024 Majus - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2024. majusi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2024 Majus - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2024. majusi vizsgabol.'
        },
        szovegalkotas: {
            title: '2024 Majus - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2024. majusi vizsgabol.'
        }
    },
    {
        id: '2024-okt',
        year: 2024,
        session: 'Oktober',
        date: '2024. oktober 14.',
        feladatsor: `${BASE_URL}/feladatok_2024osz_kozep/k_magyir_24okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024osz_kozep/k_magyir_24okt_ut.pdf`,
        online: `${ONLINE_BASE}/2024-oktober`,
        szovegertes: {
            title: '2024 Oktober - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2024. oktoberi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2024 Oktober - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2024. oktoberi vizsgabol.'
        },
        szovegalkotas: {
            title: '2024 Oktober - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2024. oktoberi vizsgabol.'
        }
    },
    {
        id: '2025-maj',
        year: 2025,
        session: 'Majus',
        date: '2025. majus 5.',
        feladatsor: `${BASE_URL}/feladatok_2025tavasz_kozep/k_magyir_25maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2025tavasz_kozep/k_magyir_25maj_ut.pdf`,
        online: `${ONLINE_BASE}/2025-majus`,
        szovegertes: {
            title: '2025 Majus - Szovegertes',
            desc: 'Szovegertesi feladatsor a 2025. majusi erettsegi vizsgabol.'
        },
        muveleti: {
            title: '2025 Majus - Nyelvi-irodalmi muveletek',
            desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2025. majusi vizsgabol.'
        },
        szovegalkotas: {
            title: '2025 Majus - Szovegalkotas',
            desc: 'Erveles es muertelmezoelemzes feladatok a 2025. majusi vizsgabol.'
        }
    }
];

export { exams };

// --- Render exam items for a task type ---
function renderExamList(containerId, taskType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sortedExams = [...exams].reverse(); // newest first

    container.innerHTML = sortedExams.map(exam => {
        const info = exam[taskType];
        return `
            <div class="exam-item">
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
                        &#9989; Megoldas PDF
                    </a>
                    <a href="${exam.online}" target="_blank" class="btn-online">
                        &#127760; Online gyakorlas
                    </a>
                    <button class="btn-gyakorlas" data-exam-id="${exam.id}" data-section="${taskType}">Gyakorlas</button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Render full exam cards ---
function renderFullExams() {
    const container = document.getElementById('feladatsorok-grid');
    if (!container) return;

    const sortedExams = [...exams].reverse();

    container.innerHTML = sortedExams.map(exam => `
        <div class="exam-full-card">
            <div class="exam-full-header">
                <h3>${exam.year}. ${exam.session}</h3>
                <div class="date">${exam.date}</div>
            </div>
            <div class="exam-full-body">
                <ul class="links-list">
                    <li><a href="${exam.feladatsor}" target="_blank">&#128196; Feladatsor letoltese (PDF)</a></li>
                    <li><a href="${exam.megoldas}" target="_blank">&#9989; Javitasi utmutato (PDF)</a></li>
                    <li><a href="${exam.online}" target="_blank">&#127760; Online gyakorlas (erettsegigyakorlo.hu)</a></li>
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

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initChoiceTabs();

    renderExamList('szovegertes-list', 'szovegertes');
    renderExamList('muveleti-list', 'muveleti');
    renderExamList('szovegalkotas-list', 'szovegalkotas');
    renderFullExams();

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-gyakorlas');
        if (btn) {
            navigateToQuiz(btn.dataset.examId, btn.dataset.section);
            startQuiz(btn.dataset.examId, btn.dataset.section);
        }
    });
    initQuizEngine();
});
