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

export function getRemainingSeconds() { return remainingSeconds; }
export function isTimerExpired() { return totalSeconds > 0 && remainingSeconds <= 0; }
export function getElapsedSeconds() { return totalSeconds - remainingSeconds; }
export function isTimerPaused() { return isPaused; }
