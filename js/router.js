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
