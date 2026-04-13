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
            return { correct: null, points: 0, sampleAnswer: task.sampleAnswer, needsManualReview: true };

        case 'essay':
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
