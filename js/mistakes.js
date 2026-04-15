// js/mistakes.js
// Tracks mistakes per (examId, taskId). Auto-gradable types only.

const STORAGE_KEY = 'magyar-erettsegi-mistakes';

// Types that can be auto-graded and thus tracked as mistakes
export const TRACKABLE_TYPES = new Set([
    'fill-in', 'multiple-choice', 'ordering',
    'table-fill', 'matching', 'true-false',
]);

function loadStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Record the result of checking a single auto-gradable task.
 * - If incorrect and not yet tracked → add as active mistake.
 * - If incorrect and already tracked active → increment attemptCount.
 * - If incorrect and already archived → reopen (archivedAt cleared, re-active).
 * - If correct and tracked active → archive (set correctedAt).
 * - If correct and not tracked → no-op.
 *
 * @param {string} examId
 * @param {string} taskId
 * @param {boolean} isCorrect
 * @param {string} [taskType]
 */
export function trackResult(examId, taskId, isCorrect, taskType) {
    if (taskType && !TRACKABLE_TYPES.has(taskType)) return;
    if (!examId || !taskId) return;

    const store = loadStore();
    if (!store[examId]) store[examId] = {};
    const entry = store[examId][taskId];
    const now = Date.now();

    if (!isCorrect) {
        if (!entry) {
            store[examId][taskId] = {
                firstFailedAt: now,
                lastAttemptAt: now,
                attemptCount: 1,
                correctedAt: null,
            };
        } else {
            entry.lastAttemptAt = now;
            entry.attemptCount = (entry.attemptCount || 1) + 1;
            entry.correctedAt = null;  // reopen if previously archived
        }
    } else if (entry && !entry.correctedAt) {
        entry.lastAttemptAt = now;
        entry.attemptCount = (entry.attemptCount || 1) + 1;
        entry.correctedAt = now;
    }

    saveStore(store);
}

/** Returns flat array of {examId, taskId, ...entry} for active mistakes. */
export function getActive() {
    return flatten(loadStore(), e => !e.correctedAt);
}

/** Returns flat array for archived (corrected) mistakes. */
export function getArchived() {
    return flatten(loadStore(), e => !!e.correctedAt);
}

function flatten(store, predicate) {
    const out = [];
    for (const examId of Object.keys(store)) {
        for (const taskId of Object.keys(store[examId])) {
            const entry = store[examId][taskId];
            if (predicate(entry)) {
                out.push({ examId, taskId, ...entry });
            }
        }
    }
    // Most recent first
    out.sort((a, b) => b.lastAttemptAt - a.lastAttemptAt);
    return out;
}

export function countActive() {
    return getActive().length;
}

export function countArchived() {
    return getArchived().length;
}

/** Clears ALL tracked mistakes. */
export function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
}
