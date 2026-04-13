// js/search.js

import { getAllCachedExams } from './data-loader.js';
import { exams as examMeta } from './app.js';

let activeFilters = { years: [], sessions: [], textQuery: '' };

export function initSearch() {
    document.querySelectorAll('.filter-bar').forEach(bar => {
        bar.querySelectorAll('.filter-year').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                updateFiltersFromUI(bar);
            });
        });
        bar.querySelectorAll('.filter-session').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                updateFiltersFromUI(bar);
            });
        });
        const searchInput = bar.querySelector('.filter-text');
        if (searchInput) {
            searchInput.addEventListener('input', () => updateFiltersFromUI(bar));
        }
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
        if (activeFilters.years.length > 0 && !activeFilters.years.includes(meta.year)) visible = false;
        if (activeFilters.sessions.length > 0) {
            const sessionLower = meta.session.toLowerCase();
            if (!activeFilters.sessions.some(s => sessionLower.includes(s.toLowerCase()))) visible = false;
        }
        if (activeFilters.textQuery.length >= 3) {
            const query = activeFilters.textQuery.toLowerCase();
            const cachedExams = getAllCachedExams();
            const examData = cachedExams.find(e => e.id === examId);
            let textMatch = false;
            const metaText = JSON.stringify(meta).toLowerCase();
            if (metaText.includes(query)) textMatch = true;
            if (!textMatch && examData) {
                const dataText = JSON.stringify(examData).toLowerCase();
                if (dataText.includes(query)) textMatch = true;
            }
            if (!textMatch) visible = false;
        }
        item.style.display = visible ? '' : 'none';
    });

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
    return { szovegertes: 'szovegertes-list', muveleti: 'muveleti-list', szovegalkotas: 'szovegalkotas-list', feladatsorok: 'feladatsorok-grid' }[sectionId] || null;
}

export function getActiveFilters() { return { ...activeFilters }; }
