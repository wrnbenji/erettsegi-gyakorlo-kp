# Interactive Erettsegi Practice Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static magyar erettsegi practice site into a fully interactive quiz platform with timer, scoring, search, and progress tracking.

**Architecture:** Modular vanilla JS with ES modules. Quiz data in JSON files loaded via fetch(). State persisted in LocalStorage. No framework, no build tools.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), LocalStorage, fetch API

**Spec:** `docs/superpowers/specs/2026-04-13-interactive-erettsegi-design.md`

---

## File Map

| File | Responsibility | Task |
|------|---------------|------|
| `index.html` | Main page — add quiz view, results section, search bars, module script | 1, 3, 6, 9, 10 |
| `style.css` | All styles — quiz layout, timer, search bar, results table | 1, 3, 4, 6, 7, 8, 9, 10 |
| `js/app.js` | Entry point — imports and initializes all modules | 1 |
| `js/router.js` | Section navigation, quiz view routing | 3 |
| `js/data-loader.js` | Fetch and cache JSON exam data | 2 |
| `js/timer.js` | Countdown timer with color changes, pause, alerts | 4 |
| `js/scoring.js` | Answer checking, point calculation, LocalStorage CRUD | 5 |
| `js/quiz-engine.js` | Render tasks, handle user input, manage quiz flow | 7, 8 |
| `js/search.js` | Filter bar logic, text search across loaded data | 6 |
| `data/2025-maj.json` | First complete exam data file | 2 |
| `data/2024-okt.json` | Exam data | 11 |
| `data/2024-maj.json` | Exam data | 11 |
| `data/2023-okt.json` | Exam data | 11 |
| `data/2023-maj.json` | Exam data | 11 |
| `data/2022-okt.json` | Exam data | 11 |
| `data/2022-maj.json` | Exam data | 11 |

---

### Task 1: Restructure project to ES modules

**Files:**
- Create: `js/app.js`
- Modify: `index.html`
- Delete: `app.js` (root — replaced by `js/app.js`)

- [ ] **Step 1: Create js/ and data/ directories**

```bash
mkdir -p js data
```

- [ ] **Step 2: Create js/app.js as ES module entry point**

Move the existing `app.js` logic into `js/app.js`, converting to ES module style. Keep the same functionality — navigation, exam list rendering, choice tabs. Remove the `exams` data array (will move to data-loader later), but keep it temporarily for backwards compatibility.

```js
// js/app.js

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
        szovegertes: { title: '2022 Majus - Szovegertes', desc: 'Szovegertesi feladatsor a 2022. majusi erettsegi vizsgabol.' },
        muveleti: { title: '2022 Majus - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2022. majusi vizsgabol.' },
        szovegalkotas: { title: '2022 Majus - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2022. majusi vizsgabol.' }
    },
    {
        id: '2022-okt',
        year: 2022,
        session: 'Oktober',
        date: '2022. oktober 17.',
        feladatsor: `${BASE_URL}/feladatok_2022osz_kozep/k_magyir_22okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2022osz_kozep/k_magyir_22okt_ut.pdf`,
        online: `${ONLINE_BASE}/2022-oktober`,
        szovegertes: { title: '2022 Oktober - Szovegertes', desc: 'Szovegertesi feladatsor a 2022. oktoberi erettsegi vizsgabol.' },
        muveleti: { title: '2022 Oktober - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2022. oktoberi vizsgabol.' },
        szovegalkotas: { title: '2022 Oktober - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2022. oktoberi vizsgabol.' }
    },
    {
        id: '2023-maj',
        year: 2023,
        session: 'Majus',
        date: '2023. majus 8.',
        feladatsor: `${BASE_URL}/feladatok_2023tavasz_kozep/k_magyir_23maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023tavasz_kozep/k_magyir_23maj_ut.pdf`,
        online: `${ONLINE_BASE}/2023-majus`,
        szovegertes: { title: '2023 Majus - Szovegertes', desc: 'Szovegertesi feladatsor a 2023. majusi erettsegi vizsgabol.' },
        muveleti: { title: '2023 Majus - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2023. majusi vizsgabol.' },
        szovegalkotas: { title: '2023 Majus - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2023. majusi vizsgabol.' }
    },
    {
        id: '2023-okt',
        year: 2023,
        session: 'Oktober',
        date: '2023. oktober 16.',
        feladatsor: `${BASE_URL}/feladatok_2023osz_kozep/k_magyir_23okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2023osz_kozep/k_magyir_23okt_ut.pdf`,
        online: `${ONLINE_BASE}/2023-oktober`,
        szovegertes: { title: '2023 Oktober - Szovegertes', desc: 'Szovegertesi feladatsor a 2023. oktoberi erettsegi vizsgabol.' },
        muveleti: { title: '2023 Oktober - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2023. oktoberi vizsgabol.' },
        szovegalkotas: { title: '2023 Oktober - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2023. oktoberi vizsgabol.' }
    },
    {
        id: '2024-maj',
        year: 2024,
        session: 'Majus',
        date: '2024. majus 6.',
        feladatsor: `${BASE_URL}/feladatok_2024tavasz_kozep/k_magyir_24maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024tavasz_kozep/k_magyir_24maj_ut.pdf`,
        online: `${ONLINE_BASE}/2024-majus`,
        szovegertes: { title: '2024 Majus - Szovegertes', desc: 'Szovegertesi feladatsor a 2024. majusi erettsegi vizsgabol.' },
        muveleti: { title: '2024 Majus - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2024. majusi vizsgabol.' },
        szovegalkotas: { title: '2024 Majus - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2024. majusi vizsgabol.' }
    },
    {
        id: '2024-okt',
        year: 2024,
        session: 'Oktober',
        date: '2024. oktober 14.',
        feladatsor: `${BASE_URL}/feladatok_2024osz_kozep/k_magyir_24okt_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2024osz_kozep/k_magyir_24okt_ut.pdf`,
        online: `${ONLINE_BASE}/2024-oktober`,
        szovegertes: { title: '2024 Oktober - Szovegertes', desc: 'Szovegertesi feladatsor a 2024. oktoberi erettsegi vizsgabol.' },
        muveleti: { title: '2024 Oktober - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2024. oktoberi vizsgabol.' },
        szovegalkotas: { title: '2024 Oktober - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2024. oktoberi vizsgabol.' }
    },
    {
        id: '2025-maj',
        year: 2025,
        session: 'Majus',
        date: '2025. majus 5.',
        feladatsor: `${BASE_URL}/feladatok_2025tavasz_kozep/k_magyir_25maj_fl.pdf`,
        megoldas: `${BASE_URL}/feladatok_2025tavasz_kozep/k_magyir_25maj_ut.pdf`,
        online: `${ONLINE_BASE}/2025-majus`,
        szovegertes: { title: '2025 Majus - Szovegertes', desc: 'Szovegertesi feladatsor a 2025. majusi erettsegi vizsgabol.' },
        muveleti: { title: '2025 Majus - Nyelvi-irodalmi muveletek', desc: 'Nyelvtani es irodalmi ismeretek feladatai a 2025. majusi vizsgabol.' },
        szovegalkotas: { title: '2025 Majus - Szovegalkotas', desc: 'Erveles es muertelmezoelemzes feladatok a 2025. majusi vizsgabol.' }
    }
];

export { exams };

// --- Navigation ---
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.section;
            showSection(target);
        });
    });

    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => {
            showSection(card.dataset.goto);
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

export { showSection };

function renderExamList(containerId, taskType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sortedExams = [...exams].reverse();

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
                    <a href="${exam.feladatsor}" target="_blank" class="btn-feladat">&#128196; Feladatsor PDF</a>
                    <a href="${exam.megoldas}" target="_blank" class="btn-megoldas">&#9989; Megoldas PDF</a>
                    <a href="${exam.online}" target="_blank" class="btn-online">&#127760; Online gyakorlas</a>
                </div>
            </div>
        `;
    }).join('');
}

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

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initChoiceTabs();
    renderExamList('szovegertes-list', 'szovegertes');
    renderExamList('muveleti-list', 'muveleti');
    renderExamList('szovegalkotas-list', 'szovegalkotas');
    renderFullExams();
});
```

- [ ] **Step 3: Update index.html to use ES module**

Replace `<script src="app.js"></script>` with `<script type="module" src="js/app.js"></script>`.

- [ ] **Step 4: Delete old app.js**

```bash
rm app.js
```

- [ ] **Step 5: Verify in browser**

Open `index.html` via a local server (ES modules require a server):

```bash
npx serve .
```

Navigate to `http://localhost:3000`. Verify all existing functionality works: navigation, exam lists, choice tabs.

- [ ] **Step 6: Commit**

```bash
git add js/app.js index.html .gitignore
git rm app.js
git commit -m "refactor: restructure to ES modules with js/ directory"
```

---

### Task 2: Data loader and first JSON exam file

**Files:**
- Create: `js/data-loader.js`
- Create: `data/2025-maj.json`

- [ ] **Step 1: Create js/data-loader.js**

```js
// js/data-loader.js

const cache = {};

const EXAM_IDS = [
    '2022-maj', '2022-okt',
    '2023-maj', '2023-okt',
    '2024-maj', '2024-okt',
    '2025-maj'
];

export async function loadExam(examId) {
    if (cache[examId]) return cache[examId];

    const response = await fetch(`data/${examId}.json`);
    if (!response.ok) return null;

    const data = await response.json();
    cache[examId] = data;
    return data;
}

export async function loadAllExams() {
    const results = await Promise.allSettled(
        EXAM_IDS.map(id => loadExam(id))
    );
    return results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);
}

export function getCachedExam(examId) {
    return cache[examId] || null;
}

export function getAllCachedExams() {
    return Object.values(cache);
}

export { EXAM_IDS };
```

- [ ] **Step 2: Create data/2025-maj.json**

This is the first complete exam data file. The content must be sourced from the actual 2025 május érettségi feladatsor PDF. Create the file with the full structure. Below is the template with realistic placeholder content that matches the actual exam format — the actual exam questions and answers must be filled in from the real PDF.

```json
{
    "id": "2025-maj",
    "year": 2025,
    "session": "Majus",
    "date": "2025. majus 5.",
    "sections": {
        "szovegertes": {
            "timeLimit": 60,
            "maxPoints": 40,
            "sourceText": "A FORRASSZOVEG TELJES SZOVEGE IDE KERUL A 2025 MAJUSI ERETTSEGI PDF-BOL.\n\nA szoveget a feladatsor alapjan kell beilleszteni.",
            "tasks": [
                {
                    "id": "sz-1",
                    "type": "multiple-choice",
                    "question": "1. feladat: A kerdes szovege a PDF alapjan.",
                    "options": ["A valasz", "B valasz", "C valasz", "D valasz"],
                    "correct": 0,
                    "points": 2
                },
                {
                    "id": "sz-2",
                    "type": "fill-in",
                    "question": "2. feladat: Egeszitsd ki a kovetkezo mondatot!",
                    "correct": ["helyes valasz 1", "helyes valasz 2"],
                    "points": 2
                },
                {
                    "id": "sz-3",
                    "type": "true-false",
                    "question": "3. feladat: Az allitas igaz vagy hamis a szoveg alapjan.",
                    "correct": true,
                    "points": 1
                },
                {
                    "id": "sz-4",
                    "type": "matching",
                    "question": "4. feladat: Parositsd ossze a fogalmakat!",
                    "pairs": [
                        {"left": "Fogalom A", "right": "Definicio A"},
                        {"left": "Fogalom B", "right": "Definicio B"},
                        {"left": "Fogalom C", "right": "Definicio C"}
                    ],
                    "points": 3
                },
                {
                    "id": "sz-5",
                    "type": "table-fill",
                    "question": "5. feladat: Toltsd ki a tablazatot a szoveg alapjan!",
                    "headers": ["Fogalom", "Jelentes", "Pelda"],
                    "rows": [
                        {"given": {"Fogalom": "Megadott fogalom"}, "answer": {"Jelentes": "helyes jelentes", "Pelda": "helyes pelda"}}
                    ],
                    "points": 4
                },
                {
                    "id": "sz-6",
                    "type": "short-answer",
                    "question": "6. feladat: Fogalmazd meg egy mondatban a szoveg fo gondolatat!",
                    "sampleAnswer": "A mintavalasz a javitasi utmutato alapjan.",
                    "points": 3
                },
                {
                    "id": "sz-7",
                    "type": "ordering",
                    "question": "7. feladat: Rakd idobeli sorrendbe az esemenyeket!",
                    "items": ["Masodik esemeny", "Elso esemeny", "Harmadik esemeny"],
                    "correctOrder": [1, 0, 2],
                    "points": 3
                }
            ]
        },
        "muveleti": {
            "timeLimit": 40,
            "maxPoints": 20,
            "tasks": [
                {
                    "id": "m-1",
                    "type": "multiple-choice",
                    "question": "1. feladat: Nyelvtani kerdes a PDF alapjan.",
                    "options": ["A valasz", "B valasz", "C valasz", "D valasz"],
                    "correct": 1,
                    "points": 2
                },
                {
                    "id": "m-2",
                    "type": "matching",
                    "question": "2. feladat: Parositsd a szerzot a muvel!",
                    "pairs": [
                        {"left": "Petofi Sandor", "right": "Janos vitez"},
                        {"left": "Arany Janos", "right": "Toldi"},
                        {"left": "Jokai Mor", "right": "Az arany ember"}
                    ],
                    "points": 3
                },
                {
                    "id": "m-3",
                    "type": "fill-in",
                    "question": "3. feladat: Nevezd meg a stilisztikai eszkozt!",
                    "correct": ["metafora"],
                    "points": 2
                },
                {
                    "id": "m-4",
                    "type": "table-fill",
                    "question": "4. feladat: Toltsd ki a tablazatot!",
                    "headers": ["Szo", "Szofaj", "Mondatresz"],
                    "rows": [
                        {"given": {"Szo": "szepen"}, "answer": {"Szofaj": "hatarozoszo", "Mondatresz": "modhatározo"}},
                        {"given": {"Szo": "fut"}, "answer": {"Szofaj": "ige", "Mondatresz": "allitmany"}}
                    ],
                    "points": 4
                },
                {
                    "id": "m-5",
                    "type": "true-false",
                    "question": "5. feladat: A barokk irodalom jellemzoje a tulozes es a diszitetteseg.",
                    "correct": true,
                    "points": 1
                },
                {
                    "id": "m-6",
                    "type": "short-answer",
                    "question": "6. feladat: Irj peldaategy alliteraciora!",
                    "sampleAnswer": "Mint mikor a Mura...",
                    "points": 2
                }
            ]
        },
        "szovegalkotas": {
            "timeLimit": 90,
            "maxPoints": 40,
            "tasks": [
                {
                    "id": "sa-erveles",
                    "type": "essay",
                    "prompt": "Erveles feladat: Fejtsd ki velemenyedet a kovetkezo temaban! (A pontos tema a PDF-bol kerul ide.)\n\nTerjedelem: 250-350 szo.",
                    "minWords": 250,
                    "maxWords": 350,
                    "sampleAnswer": "Az erveles mintamegoldasa a javitasi utmutato alapjan kerul ide.",
                    "rubric": [
                        {"criterion": "A tema kifejtese, az erveles minosege", "maxPoints": 12, "levels": ["0-4: A tema kifejtese hianyos", "5-8: A tema megfelelo kifejtese", "9-12: Igenyesen kifejtett erveles"]},
                        {"criterion": "Szerkezet, koherencia", "maxPoints": 8, "levels": ["0-2: Hianyos szerkezet", "3-5: Megfeleloen tagolt", "6-8: Logikus, koherens felepites"]},
                        {"criterion": "Nyelvhelyesseg, stilusalkalmazas", "maxPoints": 10, "levels": ["0-3: Sok nyelvi hiba", "4-7: Kisebb hibak", "8-10: Nyelvileg igenyesm igenyes"]},
                        {"criterion": "Terjedelem", "maxPoints": 5, "levels": ["0: Nagyon rovid vagy nagyon hosszu", "3: Kozelito", "5: Megfelelo terjedelem"]},
                        {"criterion": "Irasbeli kommunikacio (olvashatosag, keziras)", "maxPoints": 5, "levels": ["0-1: Nehezen olvashato", "2-3: Olvashato", "4-5: Igenyesen olvashato"]}
                    ]
                },
                {
                    "id": "sa-muertelmezo",
                    "type": "essay",
                    "prompt": "Muertelmezoelemzes feladat: Elemezd a kovetkezo muvet! (A pontos feladat a PDF-bol kerul ide.)\n\nTerjedelem: 300-400 szo.",
                    "minWords": 300,
                    "maxWords": 400,
                    "sampleAnswer": "A muertelmezo elemzes mintamegoldasa a javitasi utmutato alapjan kerul ide.",
                    "rubric": [
                        {"criterion": "A mu ertelmezese, az elemzes melysege", "maxPoints": 15, "levels": ["0-5: Feluletes ertelmez", "6-10: Megalapozott elemzes", "11-15: Mely, arnyalt ertelmez"]},
                        {"criterion": "Szerkezet, koherencia", "maxPoints": 8, "levels": ["0-2: Hianyos szerkezet", "3-5: Megfeleloen tagolt", "6-8: Logikus felepites"]},
                        {"criterion": "Szaknyelv hasznalata", "maxPoints": 7, "levels": ["0-2: Alig hasznal szaknyelvet", "3-5: Elfogadhato", "6-7: Igényes szaknyelv"]},
                        {"criterion": "Nyelvhelyesseg", "maxPoints": 5, "levels": ["0-1: Sok hiba", "2-3: Kisebb hibak", "4-5: Nyelvileg igenyes"]},
                        {"criterion": "Terjedelem", "maxPoints": 5, "levels": ["0: Nagyon rovid/hosszu", "3: Kozelito", "5: Megfelelo"]}
                    ]
                }
            ]
        }
    }
}
```

**Note:** The actual exam questions, source text, correct answers, and sample answers must be sourced from the official 2025 május középszintű magyar érettségi feladatsor and javítási útmutató PDFs. The structure above is the correct format — the content fields need to be filled with real exam data.

- [ ] **Step 3: Verify data loads**

Add a temporary test in browser console after serving:

```bash
npx serve .
```

Open browser console, run:
```js
import('js/data-loader.js').then(m => m.loadExam('2025-maj').then(console.log))
```

Should print the JSON object.

- [ ] **Step 4: Commit**

```bash
git add js/data-loader.js data/2025-maj.json
git commit -m "feat: add data loader module and first exam JSON (2025-maj)"
```

---

### Task 3: Router refactor and new HTML sections

**Files:**
- Create: `js/router.js`
- Modify: `js/app.js` — remove navigation logic, import router
- Modify: `index.html` — add quiz section, results section, update nav

- [ ] **Step 1: Create js/router.js**

```js
// js/router.js

let currentSection = 'home';

export function initRouter() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.section);
        });
    });

    document.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => {
            navigateTo(card.dataset.goto);
        });
    });
}

export function navigateTo(sectionId) {
    currentSection = sectionId;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

export function getCurrentSection() {
    return currentSection;
}

export function navigateToQuiz(examId, sectionType) {
    currentSection = 'quiz';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const quizSection = document.getElementById('quiz');
    if (quizSection) {
        quizSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
```

- [ ] **Step 2: Add quiz and results sections to index.html**

Add these sections before `</main>` in index.html:

```html
<!-- Quiz Section -->
<section id="quiz" class="section">
    <div id="quiz-container">
        <!-- Filled by quiz-engine.js -->
    </div>
</section>

<!-- Eredmenyeim Section -->
<section id="eredmenyek" class="section">
    <h2>Eredmenyeim</h2>
    <p class="section-desc">Korabbi kitoltesek es eredmenyek attekintese.</p>
    <div id="results-container">
        <!-- Filled by scoring.js -->
    </div>
</section>
```

Add "Eredmenyeim" button to the nav:

```html
<button class="nav-btn" data-section="eredmenyek">Eredmenyeim</button>
```

- [ ] **Step 3: Update js/app.js — replace inline navigation with router import**

Remove the `initNavigation`, `showSection` functions from app.js. Import and use router instead:

```js
// At top of js/app.js
import { initRouter, navigateTo } from './router.js';

// In DOMContentLoaded:
// Replace initNavigation() with:
initRouter();
```

Remove the `showSection` export — replace with re-exporting `navigateTo` from router if needed.

- [ ] **Step 4: Verify in browser**

```bash
npx serve .
```

Check: all nav buttons work, new "Eredmenyeim" section appears (empty), quiz section exists but is empty.

- [ ] **Step 5: Commit**

```bash
git add js/router.js js/app.js index.html
git commit -m "feat: add router module with quiz and results sections"
```

---

### Task 4: Timer module

**Files:**
- Create: `js/timer.js`
- Modify: `style.css` — timer styles

- [ ] **Step 1: Create js/timer.js**

```js
// js/timer.js

let intervalId = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let isPaused = false;
let onTickCallback = null;
let onAlertCallback = null;
let onExpireCallback = null;
let alertsTriggered = { ten: false, five: false };

export function startTimer(minutes, { onTick, onAlert, onExpire } = {}) {
    stopTimer();
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    isPaused = false;
    alertsTriggered = { ten: false, five: false };
    onTickCallback = onTick || null;
    onAlertCallback = onAlert || null;
    onExpireCallback = onExpire || null;

    renderTimer();
    intervalId = setInterval(tick, 1000);
}

function tick() {
    if (isPaused) return;

    remainingSeconds--;

    if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        stopInterval();
        renderTimer();
        if (onExpireCallback) onExpireCallback();
        return;
    }

    // Alerts
    if (remainingSeconds === 600 && !alertsTriggered.ten) {
        alertsTriggered.ten = true;
        if (onAlertCallback) onAlertCallback(10);
    }
    if (remainingSeconds === 300 && !alertsTriggered.five) {
        alertsTriggered.five = true;
        if (onAlertCallback) onAlertCallback(5);
    }

    renderTimer();
    if (onTickCallback) onTickCallback(remainingSeconds, totalSeconds);
}

function renderTimer() {
    const el = document.getElementById('timer-display');
    if (!el) return;

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Color classes
    el.classList.remove('timer-green', 'timer-yellow', 'timer-red', 'timer-blink');
    const pct = remainingSeconds / totalSeconds;

    if (remainingSeconds <= 60) {
        el.classList.add('timer-blink');
    } else if (remainingSeconds <= 300) {
        el.classList.add('timer-red');
    } else if (pct <= 0.25) {
        el.classList.add('timer-yellow');
    } else {
        el.classList.add('timer-green');
    }
}

export function pauseTimer() {
    isPaused = true;
    const el = document.getElementById('timer-display');
    if (el) el.classList.add('timer-paused');
}

export function resumeTimer() {
    isPaused = false;
    const el = document.getElementById('timer-display');
    if (el) el.classList.remove('timer-paused');
}

export function togglePause() {
    if (isPaused) resumeTimer();
    else pauseTimer();
    return isPaused;
}

export function stopTimer() {
    stopInterval();
    remainingSeconds = 0;
    totalSeconds = 0;
}

function stopInterval() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

export function getRemainingSeconds() {
    return remainingSeconds;
}

export function isTimerExpired() {
    return totalSeconds > 0 && remainingSeconds <= 0;
}

export function getElapsedSeconds() {
    return totalSeconds - remainingSeconds;
}

export function isTimerPaused() {
    return isPaused;
}
```

- [ ] **Step 2: Add timer CSS to style.css**

Append to `style.css`:

```css
/* Timer */
#timer-display {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 8px;
    background: rgba(255,255,255,0.15);
    min-width: 80px;
    text-align: center;
}

.timer-green { color: #27ae60; background: #eafaf1 !important; }
.timer-yellow { color: #f39c12; background: #fef9e7 !important; }
.timer-red { color: #e74c3c; background: #fdedec !important; }

.timer-blink {
    color: #e74c3c;
    background: #fdedec !important;
    animation: timerBlink 0.5s ease-in-out infinite alternate;
}

@keyframes timerBlink {
    from { opacity: 1; }
    to { opacity: 0.3; }
}

.timer-paused {
    opacity: 0.5;
}

/* Timer alert toast */
.timer-alert {
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 14px 24px;
    border-radius: var(--radius);
    color: white;
    font-weight: 600;
    z-index: 200;
    animation: slideIn 0.3s ease, fadeOut 0.5s ease 3s forwards;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.timer-alert.warning { background: var(--warning); }
.timer-alert.danger { background: var(--accent); }

@keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
    to { opacity: 0; transform: translateY(-10px); }
}
```

- [ ] **Step 3: Commit**

```bash
git add js/timer.js style.css
git commit -m "feat: add timer module with countdown, color changes, pause, and alerts"
```

---

### Task 5: Scoring module

**Files:**
- Create: `js/scoring.js`

- [ ] **Step 1: Create js/scoring.js**

```js
// js/scoring.js

const STORAGE_KEY = 'magyar-erettsegi-results';

// --- Answer checking ---

export function checkAnswer(task, userAnswer) {
    switch (task.type) {
        case 'multiple-choice':
            return {
                correct: userAnswer === task.correct,
                points: userAnswer === task.correct ? task.points : 0
            };

        case 'true-false':
            return {
                correct: userAnswer === task.correct,
                points: userAnswer === task.correct ? task.points : 0
            };

        case 'fill-in': {
            const normalized = (userAnswer || '').trim().toLowerCase();
            const isCorrect = task.correct.some(ans => ans.toLowerCase() === normalized);
            return { correct: isCorrect, points: isCorrect ? task.points : 0 };
        }

        case 'matching': {
            let correctCount = 0;
            task.pairs.forEach((pair, i) => {
                if (userAnswer[i] === pair.right) correctCount++;
            });
            const allCorrect = correctCount === task.pairs.length;
            const partialPoints = Math.round((correctCount / task.pairs.length) * task.points);
            return { correct: allCorrect, points: partialPoints, correctCount, totalPairs: task.pairs.length };
        }

        case 'table-fill': {
            let correctCells = 0;
            let totalCells = 0;
            task.rows.forEach((row, rowIdx) => {
                for (const [col, expected] of Object.entries(row.answer)) {
                    totalCells++;
                    const given = (userAnswer[rowIdx] && userAnswer[rowIdx][col] || '').trim().toLowerCase();
                    if (given === expected.toLowerCase()) correctCells++;
                }
            });
            const allCorrect = correctCells === totalCells;
            const partialPoints = Math.round((correctCells / totalCells) * task.points);
            return { correct: allCorrect, points: partialPoints, correctCells, totalCells };
        }

        case 'ordering': {
            const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(task.correctOrder);
            return { correct: isCorrect, points: isCorrect ? task.points : 0 };
        }

        case 'short-answer':
            // Cannot auto-grade — return the sample answer for comparison
            return { correct: null, points: 0, sampleAnswer: task.sampleAnswer, needsManualReview: true };

        case 'essay':
            // Self-graded via rubric — points come from user's self-evaluation
            return { correct: null, points: userAnswer.selfScore || 0, needsManualReview: true };

        default:
            return { correct: false, points: 0 };
    }
}

// --- LocalStorage CRUD ---

function loadResults() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); }
    catch { return []; }
}

function saveResults(results) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function saveQuizResult(result) {
    const results = loadResults();
    results.push({
        ...result,
        date: new Date().toISOString()
    });
    saveResults(results);
}

export function getAllResults() {
    return loadResults();
}

export function getResultsForExam(examId, section) {
    return loadResults().filter(r =>
        r.examId === examId && (!section || r.section === section)
    );
}

export function getBestResult(examId, section) {
    const results = getResultsForExam(examId, section);
    if (results.length === 0) return null;
    return results.reduce((best, r) => r.percentage > best.percentage ? r : best);
}

export function getAverageBySection(section) {
    const results = loadResults().filter(r => r.section === section);
    if (results.length === 0) return null;
    const avg = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    return Math.round(avg);
}

export function getCompletedExamCount() {
    const results = loadResults();
    const unique = new Set(results.map(r => `${r.examId}-${r.section}`));
    return unique.size;
}

export function getOverallAverage() {
    const results = loadResults();
    if (results.length === 0) return null;
    return Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
}

export function clearAllResults() {
    localStorage.removeItem(STORAGE_KEY);
}

export function deleteResult(index) {
    const results = loadResults();
    results.splice(index, 1);
    saveResults(results);
}
```

- [ ] **Step 2: Commit**

```bash
git add js/scoring.js
git commit -m "feat: add scoring module with answer checking and LocalStorage persistence"
```

---

### Task 6: Search and filter module

**Files:**
- Create: `js/search.js`
- Modify: `index.html` — add filter bars to each section
- Modify: `style.css` — filter bar styles

- [ ] **Step 1: Create js/search.js**

```js
// js/search.js

import { getAllCachedExams } from './data-loader.js';
import { exams as examMeta } from './app.js';

let activeFilters = {
    years: [],
    sessions: [],
    textQuery: ''
};

export function initSearch() {
    document.querySelectorAll('.filter-bar').forEach(bar => {
        // Year buttons
        bar.querySelectorAll('.filter-year').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                updateFiltersFromUI(bar);
            });
        });

        // Session buttons
        bar.querySelectorAll('.filter-session').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                updateFiltersFromUI(bar);
            });
        });

        // Text search
        const searchInput = bar.querySelector('.filter-text');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                updateFiltersFromUI(bar);
            });
        }

        // Clear button
        const clearBtn = bar.querySelector('.filter-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                bar.querySelectorAll('.filter-year, .filter-session').forEach(b => b.classList.remove('active'));
                const input = bar.querySelector('.filter-text');
                if (input) input.value = '';
                updateFiltersFromUI(bar);
            });
        }
    });
}

function updateFiltersFromUI(bar) {
    const years = [...bar.querySelectorAll('.filter-year.active')].map(b => parseInt(b.dataset.year));
    const sessions = [...bar.querySelectorAll('.filter-session.active')].map(b => b.dataset.session);
    const textQuery = (bar.querySelector('.filter-text')?.value || '').trim();

    activeFilters = { years, sessions, textQuery };

    const sectionId = bar.closest('.section')?.id;
    applyFilters(sectionId);
}

function applyFilters(sectionId) {
    const listId = getListIdForSection(sectionId);
    if (!listId) return;

    const container = document.getElementById(listId);
    if (!container) return;

    const items = container.querySelectorAll('.exam-item, .exam-full-card');

    items.forEach(item => {
        const examId = item.dataset.examId;
        if (!examId) { item.style.display = ''; return; }

        const meta = examMeta.find(e => e.id === examId);
        if (!meta) { item.style.display = 'none'; return; }

        let visible = true;

        // Year filter
        if (activeFilters.years.length > 0 && !activeFilters.years.includes(meta.year)) {
            visible = false;
        }

        // Session filter
        if (activeFilters.sessions.length > 0) {
            const sessionLower = meta.session.toLowerCase();
            if (!activeFilters.sessions.some(s => sessionLower.includes(s.toLowerCase()))) {
                visible = false;
            }
        }

        // Text search (min 3 chars)
        if (activeFilters.textQuery.length >= 3) {
            const query = activeFilters.textQuery.toLowerCase();
            const cachedExams = getAllCachedExams();
            const examData = cachedExams.find(e => e.id === examId);

            let textMatch = false;

            // Search in metadata
            const metaText = JSON.stringify(meta).toLowerCase();
            if (metaText.includes(query)) textMatch = true;

            // Search in loaded exam data
            if (!textMatch && examData) {
                const dataText = JSON.stringify(examData).toLowerCase();
                if (dataText.includes(query)) textMatch = true;
            }

            if (!textMatch) visible = false;
        }

        item.style.display = visible ? '' : 'none';
    });

    // Show "no results" message
    const visibleCount = container.querySelectorAll('.exam-item:not([style*="display: none"]), .exam-full-card:not([style*="display: none"])').length;
    let noResults = container.querySelector('.no-results');
    if (visibleCount === 0) {
        if (!noResults) {
            noResults = document.createElement('p');
            noResults.className = 'no-results';
            noResults.textContent = 'Nincs talalat a megadott szurokkel.';
            container.appendChild(noResults);
        }
        noResults.style.display = '';
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

function getListIdForSection(sectionId) {
    const map = {
        'szovegertes': 'szovegertes-list',
        'muveleti': 'muveleti-list',
        'szovegalkotas': 'szovegalkotas-list',
        'feladatsorok': 'feladatsorok-grid'
    };
    return map[sectionId] || null;
}

export function getActiveFilters() {
    return { ...activeFilters };
}
```

- [ ] **Step 2: Add filter bar HTML to each section in index.html**

Add this filter bar inside each section (szovegertes, muveleti, szovegalkotas, feladatsorok) before the exam-list/exam-grid div:

```html
<div class="filter-bar">
    <div class="filter-group">
        <span class="filter-label">Ev:</span>
        <button class="filter-year" data-year="2022">2022</button>
        <button class="filter-year" data-year="2023">2023</button>
        <button class="filter-year" data-year="2024">2024</button>
        <button class="filter-year" data-year="2025">2025</button>
    </div>
    <div class="filter-group">
        <span class="filter-label">Idoszak:</span>
        <button class="filter-session" data-session="Majus">Majus</button>
        <button class="filter-session" data-session="Oktober">Oktober</button>
    </div>
    <div class="filter-group">
        <input type="text" class="filter-text" placeholder="Kereses a feladatokban..." />
    </div>
    <button class="filter-clear">Szurok torlese</button>
</div>
```

- [ ] **Step 3: Add filter bar CSS to style.css**

```css
/* Filter bar */
.filter-bar {
    background: white;
    border-radius: var(--radius);
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-light);
    white-space: nowrap;
}

.filter-year,
.filter-session {
    padding: 6px 14px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.filter-year:hover,
.filter-session:hover {
    border-color: var(--primary-light);
}

.filter-year.active,
.filter-session.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.filter-text {
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.9rem;
    min-width: 200px;
    outline: none;
    transition: border-color 0.2s;
}

.filter-text:focus {
    border-color: var(--primary-light);
}

.filter-clear {
    padding: 6px 14px;
    border: none;
    background: var(--bg);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text-light);
    transition: all 0.2s;
}

.filter-clear:hover {
    background: var(--accent);
    color: white;
}

.no-results {
    text-align: center;
    color: var(--text-light);
    padding: 40px 20px;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .filter-bar {
        flex-direction: column;
        align-items: stretch;
    }
    .filter-text { min-width: unset; width: 100%; }
}
```

- [ ] **Step 4: Update exam item rendering to include data-exam-id attributes**

In `js/app.js`, update `renderExamList` so each `.exam-item` has `data-exam-id`:

Change the exam-item div to:
```html
<div class="exam-item" data-exam-id="${exam.id}">
```

Similarly in `renderFullExams`, update:
```html
<div class="exam-full-card" data-exam-id="${exam.id}">
```

- [ ] **Step 5: Wire up search in app.js**

Add to `js/app.js` imports:
```js
import { initSearch } from './search.js';
```

Call in DOMContentLoaded:
```js
initSearch();
```

- [ ] **Step 6: Verify in browser**

Open site. Check: filter buttons toggle active state, year/session filters hide/show exam items, text search filters after 3+ characters, "Szurok torlese" resets everything, "Nincs talalat" message appears when no matches.

- [ ] **Step 7: Commit**

```bash
git add js/search.js js/app.js index.html style.css
git commit -m "feat: add search and filter module with year, session, and text search"
```

---

### Task 7: Quiz engine — startup, layout, and task renderers

**Files:**
- Create: `js/quiz-engine.js`
- Modify: `index.html` — add "Gyakorlas" buttons to exam items
- Modify: `style.css` — quiz layout styles
- Modify: `js/app.js` — wire up quiz engine

This is the largest task. It creates the full quiz engine: exam selection → mode selection → split-view layout with all 8 task type renderers.

- [ ] **Step 1: Create js/quiz-engine.js**

```js
// js/quiz-engine.js

import { loadExam } from './data-loader.js';
import { startTimer, stopTimer, togglePause, isTimerPaused, getElapsedSeconds, isTimerExpired, getRemainingSeconds } from './timer.js';
import { checkAnswer, saveQuizResult } from './scoring.js';
import { navigateTo } from './router.js';

let currentExam = null;
let currentSection = null;
let currentTasks = [];
let currentTaskIndex = 0;
let userAnswers = {};
let checkMode = 'end'; // 'each' or 'end'
let checkedTasks = {};

export async function startQuiz(examId, sectionType) {
    const exam = await loadExam(examId);
    if (!exam) {
        alert('A feladatsor betoltese sikertelen.');
        return;
    }

    currentExam = exam;
    currentSection = sectionType;
    const section = exam.sections[sectionType];
    currentTasks = section.tasks;
    currentTaskIndex = 0;
    userAnswers = {};
    checkedTasks = {};

    renderModeSelection(exam, sectionType, section);
}

function renderModeSelection(exam, sectionType, section) {
    const container = document.getElementById('quiz-container');
    const sectionNames = { szovegertes: 'Szovegertes', muveleti: 'Nyelvi-irodalmi muveletek', szovegalkotas: 'Szovegalkotas' };

    container.innerHTML = `
        <div class="quiz-start">
            <h2>${exam.year}. ${exam.session} — ${sectionNames[sectionType]}</h2>
            <p>${section.tasks.length} feladat | ${section.maxPoints} pont | ${section.timeLimit} perc</p>
            <div class="mode-selection">
                <h3>Ellenorzesi mod</h3>
                <div class="mode-options">
                    <label class="mode-option">
                        <input type="radio" name="check-mode" value="each" />
                        <div class="mode-card">
                            <strong>Feladatonkenti ellenorzes</strong>
                            <p>Minden feladat utan megtudod, helyes-e a valaszod.</p>
                        </div>
                    </label>
                    <label class="mode-option">
                        <input type="radio" name="check-mode" value="end" checked />
                        <div class="mode-card">
                            <strong>Osszesites a vegen</strong>
                            <p>A feladatsor vegen kapsz reszletes osszesitest.</p>
                        </div>
                    </label>
                </div>
            </div>
            <button class="btn-start-quiz" id="btn-start-quiz">Inditas</button>
            <button class="btn-back" id="btn-back-from-quiz">Vissza</button>
        </div>
    `;

    document.getElementById('btn-start-quiz').addEventListener('click', () => {
        checkMode = document.querySelector('input[name="check-mode"]:checked').value;
        launchQuiz(section);
    });

    document.getElementById('btn-back-from-quiz').addEventListener('click', () => {
        stopTimer();
        navigateTo('home');
    });
}

function launchQuiz(section) {
    startTimer(section.timeLimit, {
        onAlert(minutes) {
            showTimerAlert(minutes);
        },
        onExpire() {
            showTimerAlert(0);
        }
    });

    renderQuizLayout();
    renderTask(0);
}

function showTimerAlert(minutes) {
    const existing = document.querySelector('.timer-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    if (minutes === 0) {
        alert.className = 'timer-alert danger';
        alert.textContent = 'Az ido lejart! Folytathatsz, de az osszesitoben jelezzuk a tullepest.';
    } else if (minutes <= 5) {
        alert.className = 'timer-alert danger';
        alert.textContent = `Mar csak ${minutes} perc van hatra!`;
    } else {
        alert.className = 'timer-alert warning';
        alert.textContent = `${minutes} perc van hatra.`;
    }
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

function renderQuizLayout() {
    const container = document.getElementById('quiz-container');
    const section = currentExam.sections[currentSection];
    const sectionNames = { szovegertes: 'Szovegertes', muveleti: 'Nyelvi-irodalmi muveletek', szovegalkotas: 'Szovegalkotas' };

    container.innerHTML = `
        <div class="quiz-header">
            <div class="quiz-title">${currentExam.year}. ${currentExam.session} — ${sectionNames[currentSection]}</div>
            <div class="quiz-header-right">
                <button class="btn-pause" id="btn-pause">Szunet</button>
                <div id="timer-display">00:00</div>
            </div>
        </div>
        <div class="task-nav" id="task-nav">
            ${currentTasks.map((t, i) => `<button class="task-nav-btn" data-index="${i}">${i + 1}</button>`).join('')}
        </div>
        <div class="quiz-body">
            ${section.sourceText ? `
                <div class="source-panel" id="source-panel">
                    <div class="source-header">
                        <span>Forrasszoveg</span>
                        <button class="source-toggle" id="source-toggle">Osszecsukas</button>
                    </div>
                    <div class="source-content" id="source-content">${formatText(section.sourceText)}</div>
                </div>
            ` : ''}
            <div class="task-panel" id="task-panel"></div>
        </div>
        <div class="quiz-footer">
            <button class="btn-quiz-nav" id="btn-prev" disabled>Elozo</button>
            ${checkMode === 'each' ? '<button class="btn-quiz-check" id="btn-check">Ellenorzes</button>' : ''}
            <button class="btn-quiz-nav btn-primary" id="btn-next">Kovetkezo</button>
            <button class="btn-quiz-finish" id="btn-finish" style="display:none">Befejezes</button>
        </div>
        <div class="quiz-pause-overlay" id="pause-overlay" style="display:none">
            <div class="pause-message">
                <h2>Szunet</h2>
                <p>A feladatok el vannak rejtve. Nyomd meg a Folytatas gombot a folytatáshoz.</p>
                <button class="btn-start-quiz" id="btn-resume">Folytatas</button>
            </div>
        </div>
    `;

    // Event listeners
    document.querySelectorAll('.task-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => renderTask(parseInt(btn.dataset.index)));
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
        if (currentTaskIndex > 0) renderTask(currentTaskIndex - 1);
    });

    document.getElementById('btn-next')?.addEventListener('click', () => {
        saveCurrentAnswer();
        if (currentTaskIndex < currentTasks.length - 1) renderTask(currentTaskIndex + 1);
    });

    document.getElementById('btn-check')?.addEventListener('click', () => {
        saveCurrentAnswer();
        showTaskResult(currentTaskIndex);
    });

    document.getElementById('btn-finish')?.addEventListener('click', () => {
        saveCurrentAnswer();
        finishQuiz();
    });

    document.getElementById('btn-pause')?.addEventListener('click', () => {
        const paused = togglePause();
        document.getElementById('pause-overlay').style.display = paused ? 'flex' : 'none';
        document.getElementById('btn-pause').textContent = paused ? 'Folytatas' : 'Szunet';
    });

    document.getElementById('btn-resume')?.addEventListener('click', () => {
        togglePause();
        document.getElementById('pause-overlay').style.display = 'none';
        document.getElementById('btn-pause').textContent = 'Szunet';
    });

    const sourceToggle = document.getElementById('source-toggle');
    if (sourceToggle) {
        sourceToggle.addEventListener('click', () => {
            const content = document.getElementById('source-content');
            const collapsed = content.classList.toggle('collapsed');
            sourceToggle.textContent = collapsed ? 'Kinyitas' : 'Osszecsukas';
        });
    }
}

function formatText(text) {
    return text.split('\n').map(p => `<p>${p}</p>`).join('');
}

function renderTask(index) {
    saveCurrentAnswer();
    currentTaskIndex = index;
    const task = currentTasks[index];

    // Update task nav
    document.querySelectorAll('.task-nav-btn').forEach((btn, i) => {
        btn.classList.remove('current');
        btn.classList.toggle('answered', userAnswers[currentTasks[i].id] !== undefined);
        btn.classList.toggle('checked', !!checkedTasks[currentTasks[i].id]);
        if (i === index) btn.classList.add('current');
    });

    // Update nav buttons
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const finishBtn = document.getElementById('btn-finish');
    const checkBtn = document.getElementById('btn-check');

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.style.display = index === currentTasks.length - 1 ? 'none' : '';
    if (finishBtn) finishBtn.style.display = index === currentTasks.length - 1 ? '' : 'none';
    if (checkBtn) checkBtn.disabled = !!checkedTasks[task.id];

    // Render task content
    const panel = document.getElementById('task-panel');
    panel.innerHTML = `
        <div class="task-header">
            <span class="task-number">${index + 1}. feladat</span>
            <span class="task-points">${task.points} pont</span>
        </div>
        <div class="task-question">${task.question || task.prompt || ''}</div>
        <div class="task-input" id="task-input">${renderTaskInput(task)}</div>
        ${checkedTasks[task.id] ? renderCheckResult(task) : ''}
    `;

    restoreAnswer(task);
    bindTaskInputEvents(task);
}

function renderTaskInput(task) {
    switch (task.type) {
        case 'multiple-choice':
            return task.options.map((opt, i) => `
                <label class="mc-option" data-index="${i}">
                    <input type="radio" name="mc-answer" value="${i}" />
                    <span class="mc-letter">${String.fromCharCode(65 + i)}</span>
                    <span class="mc-text">${opt}</span>
                </label>
            `).join('');

        case 'true-false':
            return `
                <div class="tf-options">
                    <button class="tf-btn" data-value="true">Igaz</button>
                    <button class="tf-btn" data-value="false">Hamis</button>
                </div>
            `;

        case 'fill-in':
            return `<input type="text" class="fill-input" id="fill-answer" placeholder="Ird be a valaszt..." />`;

        case 'matching':
            const shuffledRights = [...task.pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
            return `<div class="matching-grid">
                ${task.pairs.map((pair, i) => `
                    <div class="matching-row">
                        <span class="matching-left">${pair.left}</span>
                        <select class="matching-select" data-index="${i}">
                            <option value="">-- Valassz --</option>
                            ${shuffledRights.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>`;

        case 'table-fill':
            return `<table class="table-fill">
                <thead><tr>${task.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>
                    ${task.rows.map((row, ri) => `<tr>
                        ${task.headers.map(h => {
                            if (row.given[h] !== undefined) {
                                return `<td class="given-cell">${row.given[h]}</td>`;
                            }
                            return `<td><input type="text" class="table-input" data-row="${ri}" data-col="${h}" placeholder="..." /></td>`;
                        }).join('')}
                    </tr>`).join('')}
                </tbody>
            </table>`;

        case 'short-answer':
            return `
                <textarea class="short-answer-input" id="short-answer" placeholder="Ird be a valaszod..." rows="3"></textarea>
                <button class="btn-show-sample" id="btn-show-sample">Mutasd a mintavalaszt</button>
                <div class="sample-answer" id="sample-answer" style="display:none">
                    <strong>Mintavalasz:</strong> ${task.sampleAnswer}
                </div>
            `;

        case 'ordering': {
            const items = task.items.map((item, i) => ({ text: item, originalIndex: i }));
            return `<div class="ordering-list" id="ordering-list">
                ${items.map((item, i) => `
                    <div class="ordering-item" data-original="${item.originalIndex}">
                        <span class="ordering-number">${i + 1}.</span>
                        <span class="ordering-text">${item.text}</span>
                        <div class="ordering-btns">
                            <button class="ordering-up" data-pos="${i}" ${i === 0 ? 'disabled' : ''}>&#9650;</button>
                            <button class="ordering-down" data-pos="${i}" ${i === items.length - 1 ? 'disabled' : ''}>&#9660;</button>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        case 'essay':
            return `
                <textarea class="essay-input" id="essay-input" placeholder="Ird meg a szoveget..." rows="12"></textarea>
                <div class="word-counter" id="word-counter">0 szo (${task.minWords}-${task.maxWords} ajanlott)</div>
            `;

        default:
            return '<p>Ismeretlen feladattipus.</p>';
    }
}

function bindTaskInputEvents(task) {
    switch (task.type) {
        case 'true-false':
            document.querySelectorAll('.tf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            });
            break;

        case 'short-answer':
            document.getElementById('btn-show-sample')?.addEventListener('click', () => {
                document.getElementById('sample-answer').style.display = 'block';
            });
            break;

        case 'ordering':
            document.querySelectorAll('.ordering-up').forEach(btn => {
                btn.addEventListener('click', () => moveOrderingItem(parseInt(btn.dataset.pos), -1));
            });
            document.querySelectorAll('.ordering-down').forEach(btn => {
                btn.addEventListener('click', () => moveOrderingItem(parseInt(btn.dataset.pos), 1));
            });
            break;

        case 'essay':
            document.getElementById('essay-input')?.addEventListener('input', (e) => {
                const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0).length;
                const counter = document.getElementById('word-counter');
                counter.textContent = `${words} szo (${task.minWords}-${task.maxWords} ajanlott)`;
                counter.classList.toggle('word-under', words < task.minWords);
                counter.classList.toggle('word-over', words > task.maxWords);
                counter.classList.toggle('word-ok', words >= task.minWords && words <= task.maxWords);
            });
            break;
    }
}

function moveOrderingItem(pos, direction) {
    const list = document.getElementById('ordering-list');
    const items = [...list.querySelectorAll('.ordering-item')];
    const newPos = pos + direction;
    if (newPos < 0 || newPos >= items.length) return;

    if (direction === -1) {
        list.insertBefore(items[pos], items[newPos]);
    } else {
        list.insertBefore(items[newPos], items[pos]);
    }

    // Re-render numbers and buttons
    const newItems = [...list.querySelectorAll('.ordering-item')];
    newItems.forEach((item, i) => {
        item.querySelector('.ordering-number').textContent = `${i + 1}.`;
        const upBtn = item.querySelector('.ordering-up');
        const downBtn = item.querySelector('.ordering-down');
        upBtn.dataset.pos = i;
        downBtn.dataset.pos = i;
        upBtn.disabled = i === 0;
        downBtn.disabled = i === newItems.length - 1;

        // Re-bind
        upBtn.onclick = () => moveOrderingItem(i, -1);
        downBtn.onclick = () => moveOrderingItem(i, 1);
    });
}

function saveCurrentAnswer() {
    const task = currentTasks[currentTaskIndex];
    if (!task) return;

    switch (task.type) {
        case 'multiple-choice': {
            const checked = document.querySelector('input[name="mc-answer"]:checked');
            if (checked) userAnswers[task.id] = parseInt(checked.value);
            break;
        }
        case 'true-false': {
            const selected = document.querySelector('.tf-btn.selected');
            if (selected) userAnswers[task.id] = selected.dataset.value === 'true';
            break;
        }
        case 'fill-in': {
            const input = document.getElementById('fill-answer');
            if (input && input.value.trim()) userAnswers[task.id] = input.value.trim();
            break;
        }
        case 'matching': {
            const selects = document.querySelectorAll('.matching-select');
            const answers = {};
            selects.forEach(s => { answers[s.dataset.index] = s.value; });
            userAnswers[task.id] = answers;
            break;
        }
        case 'table-fill': {
            const inputs = document.querySelectorAll('.table-input');
            const answers = {};
            inputs.forEach(input => {
                const row = input.dataset.row;
                const col = input.dataset.col;
                if (!answers[row]) answers[row] = {};
                answers[row][col] = input.value.trim();
            });
            userAnswers[task.id] = answers;
            break;
        }
        case 'ordering': {
            const items = document.querySelectorAll('.ordering-item');
            userAnswers[task.id] = [...items].map(item => parseInt(item.dataset.original));
            break;
        }
        case 'short-answer': {
            const textarea = document.getElementById('short-answer');
            if (textarea) userAnswers[task.id] = textarea.value.trim();
            break;
        }
        case 'essay': {
            const textarea = document.getElementById('essay-input');
            if (textarea) userAnswers[task.id] = { text: textarea.value, selfScore: userAnswers[task.id]?.selfScore || 0 };
            break;
        }
    }
}

function restoreAnswer(task) {
    const answer = userAnswers[task.id];
    if (answer === undefined) return;

    switch (task.type) {
        case 'multiple-choice': {
            const radio = document.querySelector(`input[name="mc-answer"][value="${answer}"]`);
            if (radio) radio.checked = true;
            break;
        }
        case 'true-false': {
            const btn = document.querySelector(`.tf-btn[data-value="${answer}"]`);
            if (btn) btn.classList.add('selected');
            break;
        }
        case 'fill-in': {
            const input = document.getElementById('fill-answer');
            if (input) input.value = answer;
            break;
        }
        case 'matching': {
            Object.entries(answer).forEach(([idx, val]) => {
                const select = document.querySelector(`.matching-select[data-index="${idx}"]`);
                if (select) select.value = val;
            });
            break;
        }
        case 'table-fill': {
            Object.entries(answer).forEach(([row, cols]) => {
                Object.entries(cols).forEach(([col, val]) => {
                    const input = document.querySelector(`.table-input[data-row="${row}"][data-col="${col}"]`);
                    if (input) input.value = val;
                });
            });
            break;
        }
        case 'short-answer': {
            const textarea = document.getElementById('short-answer');
            if (textarea) textarea.value = answer;
            break;
        }
        case 'essay': {
            const textarea = document.getElementById('essay-input');
            if (textarea) textarea.value = answer.text || '';
            // Trigger word count update
            textarea?.dispatchEvent(new Event('input'));
            break;
        }
    }
}

function showTaskResult(index) {
    const task = currentTasks[index];
    const answer = userAnswers[task.id];
    const result = checkAnswer(task, answer);
    checkedTasks[task.id] = result;

    // Re-render to show result
    renderTask(index);
}

function renderCheckResult(task) {
    const result = checkedTasks[task.id];
    if (!result) return '';

    if (result.needsManualReview) {
        if (task.type === 'essay') {
            return `<div class="check-result manual">
                <p><strong>Mintamegoldas:</strong></p>
                <div class="sample-text">${task.sampleAnswer}</div>
                <div class="rubric-self-eval">
                    <h4>Onertekeles</h4>
                    ${task.rubric.map((r, i) => `
                        <div class="rubric-row">
                            <label>${r.criterion} (max ${r.maxPoints} pont)</label>
                            <select class="rubric-select" data-rubric="${i}" data-max="${r.maxPoints}">
                                ${r.levels.map(l => {
                                    const pts = parseInt(l.split(':')[0].split('-').pop() || l.split(':')[0]);
                                    return `<option value="${pts}">${l}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    `).join('')}
                    <button class="btn-save-rubric" id="btn-save-rubric">Onertekeles mentese</button>
                </div>
            </div>`;
        }
        return `<div class="check-result manual">
            <p><strong>Mintavalasz:</strong> ${task.sampleAnswer}</p>
            <p class="manual-note">Hasonlitsd ossze a valaszodat a mintavalasszal.</p>
        </div>`;
    }

    const cssClass = result.correct ? 'correct' : 'incorrect';
    let details = '';

    if (task.type === 'matching' || task.type === 'table-fill') {
        details = `<p>${result.correctCount || result.correctCells}/${result.totalPairs || result.totalCells} helyes — ${result.points}/${task.points} pont</p>`;
    } else {
        details = `<p>${result.points}/${task.points} pont</p>`;
    }

    return `<div class="check-result ${cssClass}">
        <span class="check-icon">${result.correct ? '&#9989;' : '&#10060;'}</span>
        ${details}
    </div>`;
}

function finishQuiz() {
    stopTimer();

    const section = currentExam.sections[currentSection];
    let totalScore = 0;
    let maxScore = section.maxPoints;
    const taskResults = [];

    currentTasks.forEach(task => {
        const answer = userAnswers[task.id];
        const result = checkAnswer(task, answer);
        totalScore += result.points;
        taskResults.push({ task, answer, result });
    });

    const elapsed = getElapsedSeconds();
    const overTime = isTimerExpired();
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Save result
    const quizResult = {
        examId: currentExam.id,
        section: currentSection,
        score: totalScore,
        maxScore,
        percentage,
        timeUsed: elapsed,
        timeLimit: section.timeLimit * 60,
        overTime,
        answers: {}
    };

    taskResults.forEach(({ task, answer, result }) => {
        quizResult.answers[task.id] = { given: answer, correct: result.correct, points: result.points };
    });

    saveQuizResult(quizResult);

    // Render summary
    renderSummary(quizResult, taskResults);
}

function renderSummary(quizResult, taskResults) {
    const container = document.getElementById('quiz-container');
    const sectionNames = { szovegertes: 'Szovegertes', muveleti: 'Nyelvi-irodalmi muveletek', szovegalkotas: 'Szovegalkotas' };
    const mins = Math.floor(quizResult.timeUsed / 60);
    const secs = quizResult.timeUsed % 60;

    container.innerHTML = `
        <div class="quiz-summary">
            <h2>Osszesites</h2>
            <div class="summary-header">
                <h3>${currentExam.year}. ${currentExam.session} — ${sectionNames[currentSection]}</h3>
            </div>
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="summary-number ${quizResult.percentage >= 60 ? 'good' : 'bad'}">${quizResult.percentage}%</div>
                    <div class="summary-label">Eredmeny</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-number">${quizResult.score}/${quizResult.maxScore}</div>
                    <div class="summary-label">Pont</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-number">${mins}:${String(secs).padStart(2, '0')}</div>
                    <div class="summary-label">Ido ${quizResult.overTime ? '(tullepve!)' : ''}</div>
                </div>
            </div>
            <div class="summary-tasks">
                <h3>Feladatok reszletezese</h3>
                ${taskResults.map(({ task, result }, i) => `
                    <div class="summary-task-row ${result.correct === true ? 'correct' : result.correct === false ? 'incorrect' : 'manual'}">
                        <span class="summary-task-num">${i + 1}.</span>
                        <span class="summary-task-name">${task.question || task.prompt || ''}</span>
                        <span class="summary-task-points">${result.points}/${task.points}</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-actions">
                <button class="btn-start-quiz" id="btn-retry">Ujra</button>
                <button class="btn-back" id="btn-back-home">Vissza a fooldalra</button>
            </div>
        </div>
    `;

    document.getElementById('btn-retry').addEventListener('click', () => {
        startQuiz(currentExam.id, currentSection);
    });

    document.getElementById('btn-back-home').addEventListener('click', () => {
        navigateTo('home');
    });
}

export function initQuizEngine() {
    // Bind rubric save buttons (delegated)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-save-rubric') {
            const selects = document.querySelectorAll('.rubric-select');
            let totalSelf = 0;
            selects.forEach(s => { totalSelf += parseInt(s.value) || 0; });
            const task = currentTasks[currentTaskIndex];
            if (userAnswers[task.id]) {
                userAnswers[task.id].selfScore = totalSelf;
            }
            e.target.textContent = `Mentve (${totalSelf} pont)`;
            e.target.disabled = true;
        }
    });
}
```

- [ ] **Step 2: Add quiz CSS to style.css**

Append to `style.css`:

```css
/* Quiz start screen */
.quiz-start {
    max-width: 600px;
    margin: 40px auto;
    text-align: center;
}

.quiz-start h2 { margin-bottom: 8px; }
.quiz-start > p { color: var(--text-light); margin-bottom: 30px; }

.mode-selection { margin-bottom: 30px; text-align: left; }
.mode-selection h3 { margin-bottom: 12px; }

.mode-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mode-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
}

.mode-option input { margin-top: 6px; }

.mode-card {
    background: white;
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    flex: 1;
    transition: border-color 0.2s;
}

.mode-option input:checked + .mode-card {
    border-color: var(--primary);
}

.mode-card strong { display: block; margin-bottom: 4px; }
.mode-card p { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.btn-start-quiz {
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: var(--radius);
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-right: 12px;
}

.btn-start-quiz:hover { background: var(--primary-light); }

.btn-back {
    background: var(--bg);
    color: var(--text);
    border: none;
    padding: 12px 24px;
    border-radius: var(--radius);
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-back:hover { background: var(--border); }

/* Quiz layout */
.quiz-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: white;
    padding: 14px 24px;
    border-radius: var(--radius) var(--radius) 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.quiz-title { font-weight: 600; font-size: 1.1rem; }

.quiz-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-pause {
    background: rgba(255,255,255,0.2);
    color: white;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
}

.btn-pause:hover { background: rgba(255,255,255,0.3); }

/* Task navigation bar */
.task-nav {
    display: flex;
    gap: 6px;
    padding: 12px 24px;
    background: white;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
}

.task-nav-btn {
    width: 36px;
    height: 36px;
    border: 2px solid var(--border);
    background: white;
    border-radius: 50%;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.task-nav-btn.current {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.task-nav-btn.answered {
    background: #eaf2f8;
    border-color: var(--primary-light);
    color: var(--primary);
}

.task-nav-btn.checked {
    background: var(--success);
    color: white;
    border-color: var(--success);
}

/* Quiz body — split view */
.quiz-body {
    display: flex;
    gap: 0;
    min-height: 400px;
    background: white;
}

.source-panel {
    width: 45%;
    border-right: 1px solid var(--border);
    overflow-y: auto;
    max-height: 70vh;
}

.source-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-light);
    position: sticky;
    top: 0;
}

.source-toggle {
    background: none;
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.source-content {
    padding: 20px;
    font-size: 0.95rem;
    line-height: 1.7;
}

.source-content.collapsed { display: none; }

.source-content p { margin-bottom: 12px; }

.task-panel {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    max-height: 70vh;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.task-number { font-weight: 700; font-size: 1.1rem; color: var(--primary); }
.task-points { background: var(--bg); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: var(--text-light); }

.task-question {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 20px;
}

/* Quiz footer */
.quiz-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 16px 24px;
    background: var(--bg);
    border-radius: 0 0 var(--radius) var(--radius);
    border-top: 1px solid var(--border);
}

.btn-quiz-nav {
    padding: 10px 24px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.btn-quiz-nav:hover { border-color: var(--primary-light); }
.btn-quiz-nav:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-quiz-nav.btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
.btn-quiz-nav.btn-primary:hover { background: var(--primary-light); }

.btn-quiz-check {
    padding: 10px 24px;
    border: none;
    background: var(--success);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-quiz-check:hover { background: #219a52; }
.btn-quiz-check:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-quiz-finish {
    padding: 10px 24px;
    border: none;
    background: var(--accent);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-quiz-finish:hover { background: #c0392b; }

/* Task type specific */
.mc-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 2px solid var(--border);
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.mc-option:hover { border-color: var(--primary-light); }
.mc-option input:checked + .mc-letter { background: var(--primary); color: white; }
.mc-option input { display: none; }

.mc-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg);
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
}

.mc-text { font-size: 0.95rem; }

.tf-options { display: flex; gap: 12px; }

.tf-btn {
    flex: 1;
    padding: 14px;
    border: 2px solid var(--border);
    background: white;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.tf-btn:hover { border-color: var(--primary-light); }
.tf-btn.selected { background: var(--primary); color: white; border-color: var(--primary); }

.fill-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}

.fill-input:focus { border-color: var(--primary-light); }

.matching-grid { display: flex; flex-direction: column; gap: 10px; }

.matching-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

.matching-left {
    flex: 1;
    font-weight: 500;
    padding: 10px 16px;
    background: var(--bg);
    border-radius: 6px;
}

.matching-select {
    flex: 1;
    padding: 10px 12px;
    border: 2px solid var(--border);
    border-radius: 6px;
    font-size: 0.95rem;
}

.table-fill {
    width: 100%;
    border-collapse: collapse;
}

.table-fill th, .table-fill td {
    padding: 10px 14px;
    border: 1px solid var(--border);
}

.table-fill th { background: var(--bg); font-size: 0.85rem; text-transform: uppercase; }
.given-cell { background: #eaf2f8; font-weight: 500; }

.table-input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 0.9rem;
}

.short-answer-input, .essay-input {
    width: 100%;
    padding: 14px;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 0.95rem;
    line-height: 1.6;
    resize: vertical;
    font-family: inherit;
    outline: none;
}

.short-answer-input:focus, .essay-input:focus { border-color: var(--primary-light); }

.btn-show-sample {
    margin-top: 12px;
    padding: 8px 18px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
}

.sample-answer {
    margin-top: 12px;
    padding: 16px;
    background: #eaf2f8;
    border-radius: 8px;
    border-left: 4px solid var(--primary-light);
    line-height: 1.6;
}

.word-counter {
    margin-top: 8px;
    font-size: 0.85rem;
    color: var(--text-light);
}

.word-under { color: var(--warning); }
.word-over { color: var(--accent); }
.word-ok { color: var(--success); }

.ordering-list { display: flex; flex-direction: column; gap: 8px; }

.ordering-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.ordering-number { font-weight: 700; color: var(--primary); min-width: 24px; }
.ordering-text { flex: 1; }

.ordering-btns { display: flex; flex-direction: column; gap: 2px; }

.ordering-up, .ordering-down {
    background: white;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 8px;
    cursor: pointer;
    font-size: 0.7rem;
}

.ordering-up:disabled, .ordering-down:disabled { opacity: 0.3; cursor: not-allowed; }

/* Check result */
.check-result {
    margin-top: 16px;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.check-result.correct { background: #eafaf1; border-left: 4px solid var(--success); }
.check-result.incorrect { background: #fdedec; border-left: 4px solid var(--accent); }
.check-result.manual { background: #eaf2f8; border-left: 4px solid var(--primary-light); flex-direction: column; align-items: flex-start; }

.check-icon { font-size: 1.5rem; }

/* Rubric self-evaluation */
.rubric-self-eval { width: 100%; margin-top: 12px; }
.rubric-self-eval h4 { margin-bottom: 12px; }

.rubric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
}

.rubric-row label { flex: 1; font-size: 0.9rem; }

.rubric-select {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 4px;
    min-width: 200px;
}

.btn-save-rubric {
    margin-top: 12px;
    padding: 10px 24px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

/* Quiz summary */
.quiz-summary {
    max-width: 700px;
    margin: 30px auto;
}

.quiz-summary h2 { text-align: center; margin-bottom: 8px; }

.summary-header { text-align: center; margin-bottom: 30px; }
.summary-header h3 { color: var(--text-light); font-weight: 400; }

.summary-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 30px;
}

.summary-stat {
    text-align: center;
    background: white;
    padding: 24px;
    border-radius: var(--radius);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.summary-number { font-size: 2rem; font-weight: 700; }
.summary-number.good { color: var(--success); }
.summary-number.bad { color: var(--accent); }
.summary-label { color: var(--text-light); font-size: 0.85rem; margin-top: 4px; }

.summary-tasks {
    background: white;
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    margin-bottom: 24px;
}

.summary-tasks h3 { margin-bottom: 16px; }

.summary-task-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
}

.summary-task-row:last-child { border-bottom: none; }
.summary-task-row.correct { background: #f0faf4; }
.summary-task-row.incorrect { background: #fdf2f2; }
.summary-task-row.manual { background: #f0f6fb; }

.summary-task-num { font-weight: 700; color: var(--primary); min-width: 28px; }
.summary-task-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.summary-task-points { font-weight: 600; white-space: nowrap; }

.summary-actions { text-align: center; }

/* Pause overlay */
.quiz-pause-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
}

.pause-message {
    background: white;
    padding: 40px;
    border-radius: var(--radius);
    text-align: center;
    max-width: 400px;
}

.pause-message h2 { margin-bottom: 12px; }
.pause-message p { color: var(--text-light); margin-bottom: 24px; }

/* Mobile quiz */
@media (max-width: 768px) {
    .quiz-body { flex-direction: column; }
    .source-panel { width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 40vh; }
    .task-panel { max-height: unset; }
    .summary-stats { grid-template-columns: 1fr; }
    .matching-row { flex-direction: column; gap: 6px; }
    .rubric-row { flex-direction: column; align-items: flex-start; }
    .rubric-select { min-width: unset; width: 100%; }
}
```

- [ ] **Step 3: Add "Gyakorlas" buttons to exam items in js/app.js**

Update the `renderExamList` function to include a "Gyakorlas" button. Add an import of `startQuiz` from `quiz-engine.js` and wire it up.

In `js/app.js`, add at top:
```js
import { startQuiz, initQuizEngine } from './quiz-engine.js';
import { navigateToQuiz } from './router.js';
```

Update the exam item links section in `renderExamList` to add:
```html
<button class="btn-gyakorlas" data-exam-id="${exam.id}" data-section="${taskType}">&#9998; Gyakorlas</button>
```

After `renderExamList` calls, add click delegation:
```js
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-gyakorlas');
    if (btn) {
        navigateToQuiz(btn.dataset.examId, btn.dataset.section);
        startQuiz(btn.dataset.examId, btn.dataset.section);
    }
});

initQuizEngine();
```

Add CSS for the button:
```css
.btn-gyakorlas {
    background: var(--primary);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.2s;
}

.btn-gyakorlas:hover { background: var(--primary-light); }
```

- [ ] **Step 4: Verify in browser**

```bash
npx serve .
```

Test the full flow:
1. Click "Gyakorlas" on any exam item → mode selection screen appears
2. Select mode → quiz launches with timer
3. Task navigation works (numbered buttons, prev/next)
4. Each task type renders correctly
5. Pause button hides tasks
6. "Befejezes" shows summary
7. Source text panel works (split view, collapse)

- [ ] **Step 5: Commit**

```bash
git add js/quiz-engine.js js/app.js index.html style.css
git commit -m "feat: add quiz engine with all 8 task types, split view, and summary"
```

---

### Task 8: Quiz engine — essay self-evaluation integration

**Files:**
- Modify: `js/quiz-engine.js` — wire rubric save to scoring

This task ensures the essay self-evaluation rubric properly saves points and integrates with the quiz summary.

- [ ] **Step 1: Update rubric save handler in quiz-engine.js**

The delegated click handler for `btn-save-rubric` in `initQuizEngine` already exists. Verify it correctly updates `userAnswers[task.id].selfScore`. Also update `finishQuiz` to use self-scores for essay tasks:

In the `finishQuiz` function, after `checkAnswer` is called for each task, if the task type is `essay` and the user provided a selfScore, use that:

```js
currentTasks.forEach(task => {
    const answer = userAnswers[task.id];
    let result;
    if (task.type === 'essay' && answer?.selfScore) {
        result = { correct: null, points: answer.selfScore, needsManualReview: true };
    } else {
        result = checkAnswer(task, answer);
    }
    totalScore += result.points;
    taskResults.push({ task, answer, result });
});
```

- [ ] **Step 2: Verify essay flow in browser**

1. Start a szovegalkotas quiz
2. Write text, see word counter update
3. Finish → see rubric
4. Select rubric values, save
5. Check summary includes self-score

- [ ] **Step 3: Commit**

```bash
git add js/quiz-engine.js
git commit -m "feat: integrate essay self-evaluation rubric with quiz scoring"
```

---

### Task 9: Results page (Eredmenyeim)

**Files:**
- Modify: `index.html` — results section HTML
- Modify: `js/app.js` — render results on section change
- Modify: `style.css` — results table styles

- [ ] **Step 1: Create results rendering function in js/app.js**

Add import:
```js
import { getAllResults, clearAllResults, getAverageBySection, getCompletedExamCount } from './scoring.js';
```

Add function:
```js
function renderResults() {
    const container = document.getElementById('results-container');
    const results = getAllResults();

    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">Meg nincs eredmenyed. Kezdj el gyakorolni!</p>';
        return;
    }

    const sectionNames = { szovegertes: 'Szovegertes', muveleti: 'Muveleti', szovegalkotas: 'Szovegalkotas' };

    const avgSz = getAverageBySection('szovegertes');
    const avgM = getAverageBySection('muveleti');
    const avgSa = getAverageBySection('szovegalkotas');

    container.innerHTML = `
        <div class="results-averages">
            <div class="results-avg-card">
                <div class="results-avg-num">${avgSz !== null ? avgSz + '%' : '-'}</div>
                <div class="results-avg-label">Szovegertes atlag</div>
            </div>
            <div class="results-avg-card">
                <div class="results-avg-num">${avgM !== null ? avgM + '%' : '-'}</div>
                <div class="results-avg-label">Muveleti atlag</div>
            </div>
            <div class="results-avg-card">
                <div class="results-avg-num">${avgSa !== null ? avgSa + '%' : '-'}</div>
                <div class="results-avg-label">Szovegalkotas atlag</div>
            </div>
        </div>
        <div class="results-table-wrap">
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Feladatsor</th>
                        <th>Szekcio</th>
                        <th>Pont</th>
                        <th>%</th>
                        <th>Ido</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.slice().reverse().map(r => {
                        const d = new Date(r.date);
                        const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
                        const mins = Math.floor(r.timeUsed / 60);
                        const secs = r.timeUsed % 60;
                        return `<tr>
                            <td>${dateStr}</td>
                            <td>${r.examId}</td>
                            <td>${sectionNames[r.section] || r.section}</td>
                            <td>${r.score}/${r.maxScore}</td>
                            <td class="${r.percentage >= 60 ? 'good' : 'bad'}">${r.percentage}%</td>
                            <td>${mins}:${String(secs).padStart(2,'0')} ${r.overTime ? '(!)' : ''}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <button class="btn-clear-results" id="btn-clear-results">Eredmenyek torlese</button>
    `;

    document.getElementById('btn-clear-results').addEventListener('click', () => {
        if (confirm('Biztosan torolni szeretned az osszes eredmenyt?')) {
            clearAllResults();
            renderResults();
            renderDynamicStats();
        }
    });
}
```

Call `renderResults()` when navigating to "eredmenyek" section. In the router or via app.js, listen for section changes and re-render:

```js
// In DOMContentLoaded, after initRouter():
document.querySelectorAll('.nav-btn[data-section="eredmenyek"]').forEach(btn => {
    btn.addEventListener('click', renderResults);
});
```

- [ ] **Step 2: Add results CSS to style.css**

```css
/* Results page */
.results-averages {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.results-avg-card {
    background: white;
    border-radius: var(--radius);
    padding: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.results-avg-num { font-size: 1.8rem; font-weight: 700; color: var(--primary); }
.results-avg-label { color: var(--text-light); font-size: 0.85rem; margin-top: 4px; }

.results-table-wrap {
    background: white;
    border-radius: var(--radius);
    overflow-x: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    margin-bottom: 20px;
}

.results-table { width: 100%; border-collapse: collapse; }
.results-table th, .results-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); }
.results-table th { background: var(--bg); font-size: 0.85rem; text-transform: uppercase; color: var(--text-light); }
.results-table td.good { color: var(--success); font-weight: 600; }
.results-table td.bad { color: var(--accent); font-weight: 600; }

.btn-clear-results {
    background: var(--accent);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
}

.btn-clear-results:hover { background: #c0392b; }

@media (max-width: 768px) {
    .results-averages { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify in browser**

1. Complete a quiz to generate results
2. Navigate to "Eredmenyeim" tab
3. Check: averages display, table shows result, "Eredmenyek torlese" works

- [ ] **Step 4: Commit**

```bash
git add js/app.js index.html style.css
git commit -m "feat: add results page with averages, history table, and clear button"
```

---

### Task 10: Dynamic home page stats

**Files:**
- Modify: `js/app.js` — update stat cards from LocalStorage

- [ ] **Step 1: Add renderDynamicStats function to js/app.js**

```js
function renderDynamicStats() {
    const results = getAllResults();
    const statCards = document.querySelectorAll('.stat-card');

    if (results.length === 0) return; // Keep default static stats

    const completed = getCompletedExamCount();
    const avg = getOverallAverage();

    // Update stat cards
    if (statCards[0]) {
        statCards[0].querySelector('.stat-number').textContent = `${completed}/21`;
        statCards[0].querySelector('.stat-label').textContent = 'Kitoltott szekcio';
    }
    if (statCards[1]) {
        statCards[1].querySelector('.stat-number').textContent = avg !== null ? `${avg}%` : '-';
        statCards[1].querySelector('.stat-label').textContent = 'Atlagos eredmeny';
    }
    if (statCards[2]) {
        statCards[2].querySelector('.stat-number').textContent = results.length;
        statCards[2].querySelector('.stat-label').textContent = 'Osszes kitoltes';
    }
}
```

Add import of `getOverallAverage` from scoring.js.

Call `renderDynamicStats()` in DOMContentLoaded.

- [ ] **Step 2: Verify in browser**

1. With no results: default stats (7, 3, 150) show
2. Complete a quiz, return to home: stats update dynamically

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: dynamic home page stats from LocalStorage results"
```

---

### Task 11: Remaining 6 JSON exam data files

**Files:**
- Create: `data/2024-okt.json`
- Create: `data/2024-maj.json`
- Create: `data/2023-okt.json`
- Create: `data/2023-maj.json`
- Create: `data/2022-okt.json`
- Create: `data/2022-maj.json`

- [ ] **Step 1: Create each JSON file**

Each file follows the exact same structure as `data/2025-maj.json`. The content (questions, correct answers, source texts, sample answers) must be sourced from the actual érettségi feladatsor and javítási útmutató PDFs from the Oktatási Hivatal.

Each file must contain:
- `id`, `year`, `session`, `date` matching the exam
- `sections.szovegertes` with `timeLimit: 60`, `maxPoints: 40`, `sourceText`, and `tasks` array
- `sections.muveleti` with `timeLimit: 40`, `maxPoints: 20`, and `tasks` array
- `sections.szovegalkotas` with `timeLimit: 90`, `maxPoints: 40`, and `tasks` array (1 essay for érvelés, 1 for műértelmező elemzés)

The tasks must use the correct `type` field matching the actual exam question format:
- `multiple-choice` for feleletválasztós
- `fill-in` for kiegészítős
- `matching` for párosítós
- `table-fill` for táblázatkitöltős
- `short-answer` for rövid szöveges
- `true-false` for igaz/hamis
- `ordering` for sorbarendezős
- `essay` for szövegalkotás

**Files to create (same structure, content from PDFs):**

```
data/2024-okt.json  (id: "2024-okt", year: 2024, session: "Oktober", date: "2024. oktober 14.")
data/2024-maj.json  (id: "2024-maj", year: 2024, session: "Majus", date: "2024. majus 6.")
data/2023-okt.json  (id: "2023-okt", year: 2023, session: "Oktober", date: "2023. oktober 16.")
data/2023-maj.json  (id: "2023-maj", year: 2023, session: "Majus", date: "2023. majus 8.")
data/2022-okt.json  (id: "2022-okt", year: 2022, session: "Oktober", date: "2022. oktober 17.")
data/2022-maj.json  (id: "2022-maj", year: 2022, session: "Majus", date: "2022. majus 2.")
```

- [ ] **Step 2: Verify all files load**

```bash
npx serve .
```

In browser console:
```js
import('./js/data-loader.js').then(m => m.loadAllExams().then(exams => console.log(`Loaded ${exams.length} exams`)))
```

Expected: `Loaded 7 exams`

- [ ] **Step 3: Commit**

```bash
git add data/
git commit -m "feat: add all 7 exam data JSON files (2022-2025)"
```

---

### Task 12: Final integration and polish

**Files:**
- Modify: `js/app.js` — wire up all modules on DOMContentLoaded
- Modify: `index.html` — final cleanup
- Modify: `style.css` — any remaining polish

- [ ] **Step 1: Ensure all imports and initialization are in place in js/app.js**

The final DOMContentLoaded should look like:

```js
import { initRouter, navigateTo, navigateToQuiz } from './router.js';
import { loadAllExams } from './data-loader.js';
import { startQuiz, initQuizEngine } from './quiz-engine.js';
import { initSearch } from './search.js';
import { getAllResults, clearAllResults, getAverageBySection, getCompletedExamCount, getOverallAverage } from './scoring.js';

document.addEventListener('DOMContentLoaded', async () => {
    initRouter();
    initChoiceTabs();
    initQuizEngine();

    renderExamList('szovegertes-list', 'szovegertes');
    renderExamList('muveleti-list', 'muveleti');
    renderExamList('szovegalkotas-list', 'szovegalkotas');
    renderFullExams();
    renderDynamicStats();

    // Pre-load exam data for search
    await loadAllExams();
    initSearch();

    // Gyakorlas button delegation
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-gyakorlas');
        if (btn) {
            navigateToQuiz(btn.dataset.examId, btn.dataset.section);
            startQuiz(btn.dataset.examId, btn.dataset.section);
        }
    });

    // Results page rendering
    document.querySelectorAll('.nav-btn[data-section="eredmenyek"]').forEach(btn => {
        btn.addEventListener('click', renderResults);
    });
});
```

- [ ] **Step 2: Add .superpowers/ to .gitignore if not already there**

Verify `.gitignore` contains `.superpowers/`.

- [ ] **Step 3: Full browser testing**

Test checklist:
1. Home page loads with correct stats
2. Navigation works for all sections
3. Filter bar works in each section (year, session, text search)
4. "Gyakorlas" button → mode selection → quiz starts
5. Timer counts down with correct colors
6. All 8 task types render and accept input
7. Task navigation bar works (click, prev/next)
8. Pause hides tasks, resume shows them
9. "Ellenorzes" mode shows per-task results
10. "Osszesites a vegen" mode shows summary at end
11. Essay word counter works, rubric self-eval works
12. Results saved to LocalStorage
13. "Eredmenyeim" page shows history and averages
14. Home page stats update after completing a quiz
15. Mobile responsive (narrow viewport)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete interactive erettsegi practice site with all features"
```
