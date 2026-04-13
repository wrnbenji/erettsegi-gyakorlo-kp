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
