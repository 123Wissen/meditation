// Audio Context for bell sound
let audioContext = null;

// Timer states
const timerStates = {
    countdown: { running: false, interval: null },
    duration: { running: false, interval: null },
    intervalTimer: { running: false, interval: null }
};

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeAudioContext();
    setupTimers();
});

// Initialize Audio Context
function initializeAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Generate bell sound
function playBellSound() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5);
}

// Setup all timers
function setupTimers() {
    setupCountdownTimer();
    setupDurationTimer();
    setupIntervalTimer();
}

// Countdown Timer
function setupCountdownTimer() {
    const section = document.querySelector('#countdown');
    const input = section.querySelector('.timer-input');
    const startBtn = section.querySelector('.start-btn');
    const resetBtn = section.querySelector('.reset-btn');
    const display = section.querySelector('.timer-display');
    const progress = section.querySelector('.circular-progress');

    startBtn.addEventListener('click', () => {
        if (timerStates.countdown.running) return;

        const minutes = parseInt(input.value);
        if (isNaN(minutes) || minutes <= 0) {
            alert('Please enter a valid number of minutes');
            return;
        }

        let totalSeconds = minutes * 60;
        const startTime = totalSeconds;

        timerStates.countdown.running = true;
        startBtn.disabled = true;
        input.disabled = true;
        section.classList.add('running');

        timerStates.countdown.interval = setInterval(() => {
            totalSeconds--;
            
            if (totalSeconds % 10 === 0) {
                playBellSound();
            }

            const percentage = ((startTime - totalSeconds) / startTime) * 100;
            progress.style.background = `conic-gradient(var(--primary-color) ${percentage}%, #E0E0E0 ${percentage}%)`;
            
            // Update clock hand
            const clockHand = section.querySelector('.clock-hand');
            const rotation = (360 * (startTime - totalSeconds)) / startTime;
            clockHand.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

            display.textContent = formatTime(totalSeconds);

            if (totalSeconds <= 0) {
                clearInterval(timerStates.countdown.interval);
                timerStates.countdown.running = false;
                startBtn.disabled = false;
                input.disabled = false;
                section.classList.remove('running');
                playBellSound();
            }
        }, 1000);
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerStates.countdown.interval);
        timerStates.countdown.running = false;
        startBtn.disabled = false;
        input.disabled = false;
        input.value = '';
        display.textContent = '00:00';
        progress.style.background = 'conic-gradient(var(--primary-color) 0%, #E0E0E0 0%)';
        section.classList.remove('running');
    });
}

// Duration Timer
function setupDurationTimer() {
    const section = document.querySelector('#duration');
    const input = section.querySelector('.timer-input');
    const startBtn = section.querySelector('.start-btn');
    const resetBtn = section.querySelector('.reset-btn');
    const display = section.querySelector('.timer-display');
    const progressBar = section.querySelector('.progress-bar');

    startBtn.addEventListener('click', () => {
        if (timerStates.duration.running) return;

        const minutes = parseInt(input.value);
        if (isNaN(minutes) || minutes <= 0) {
            alert('Please enter a valid number of minutes');
            return;
        }

        let seconds = 0;
        const totalSeconds = minutes * 60;

        timerStates.duration.running = true;
        startBtn.disabled = true;
        input.disabled = true;
        section.classList.add('running');

        timerStates.duration.interval = setInterval(() => {
            seconds++;
            
            if (seconds % 10 === 0) {
                playBellSound();
            }

            const percentage = (seconds / totalSeconds) * 100;
            progressBar.style.width = `${percentage}%`;
            
            // Update clock hand
            const clockHand = section.querySelector('.clock-hand');
            const rotation = (360 * seconds) / totalSeconds;
            clockHand.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

            display.textContent = formatTime(seconds);

            if (seconds >= totalSeconds) {
                clearInterval(timerStates.duration.interval);
                timerStates.duration.running = false;
                startBtn.disabled = false;
                input.disabled = false;
                section.classList.remove('running');
                playBellSound();
            }
        }, 1000);
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerStates.duration.interval);
        timerStates.duration.running = false;
        startBtn.disabled = false;
        input.disabled = false;
        input.value = '';
        display.textContent = '00:00';
        progressBar.style.width = '0%';
        section.classList.remove('running');
    });
}

// Interval Timer
function setupIntervalTimer() {
    const section = document.querySelector('#interval');
    const meditationInput = section.querySelector('.interval-inputs input:nth-child(1)');
    const restInput = section.querySelector('.interval-inputs input:nth-child(2)');
    const cyclesInput = section.querySelector('.interval-inputs input:nth-child(3)');
    const startBtn = section.querySelector('.start-btn');
    const resetBtn = section.querySelector('.reset-btn');
    const display = section.querySelector('.timer-display');
    const progressBar = section.querySelector('.progress-bar');

    startBtn.addEventListener('click', () => {
        if (timerStates.intervalTimer.running) return;

        const meditationMinutes = parseInt(meditationInput.value);
        const restMinutes = parseInt(restInput.value);
        const cycles = parseInt(cyclesInput.value);

        if (isNaN(meditationMinutes) || isNaN(restMinutes) || isNaN(cycles) ||
            meditationMinutes <= 0 || restMinutes <= 0 || cycles <= 0) {
            alert('Please enter valid values for all fields');
            return;
        }

        let currentCycle = 1;
        let isMeditation = true;
        let seconds = 0;
        let currentPeriod = meditationMinutes * 60;

        timerStates.intervalTimer.running = true;
        startBtn.disabled = true;
        meditationInput.disabled = true;
        restInput.disabled = true;
        cyclesInput.disabled = true;
        section.classList.add('running');

        const updateDisplay = () => {
            const phase = isMeditation ? 'Meditation' : 'Rest';
            display.textContent = `${formatTime(currentPeriod - seconds)}`;
            display.style.color = isMeditation ? 'var(--primary-color)' : 'var(--secondary-color)';
        };

        timerStates.intervalTimer.interval = setInterval(() => {
            seconds++;
            
            if (seconds % 10 === 0) {
                playBellSound();
            }

            if (seconds >= currentPeriod) {
                playBellSound();
                if (isMeditation) {
                    isMeditation = false;
                    seconds = 0;
                    currentPeriod = restMinutes * 60;
                    progressBar.style.backgroundColor = 'var(--secondary-color)';
                } else {
                    currentCycle++;
                    if (currentCycle > cycles) {
                        clearInterval(timerStates.intervalTimer.interval);
                        timerStates.intervalTimer.running = false;
                        startBtn.disabled = false;
                        meditationInput.disabled = false;
                        restInput.disabled = false;
                        cyclesInput.disabled = false;
                        section.classList.remove('running');
                        display.textContent = 'Complete!';
                        display.style.color = 'var(--primary-color)';
                        progressBar.style.width = '100%';
                        return;
                    }
                    isMeditation = true;
                    seconds = 0;
                    currentPeriod = meditationMinutes * 60;
                    progressBar.style.backgroundColor = 'var(--primary-color)';
                }
            }

            const percentage = (seconds / currentPeriod) * 100;
            progressBar.style.width = `${percentage}%`;
            
            // Update clock hand
            const clockHand = section.querySelector('.clock-hand');
            const rotation = (360 * seconds) / currentPeriod;
            clockHand.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

            updateDisplay();
        }, 1000);

        updateDisplay();
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerStates.intervalTimer.interval);
        timerStates.intervalTimer.running = false;
        startBtn.disabled = false;
        meditationInput.disabled = false;
        restInput.disabled = false;
        cyclesInput.disabled = false;
        meditationInput.value = '';
        restInput.value = '';
        cyclesInput.value = '';
        display.textContent = '00:00';
        progressBar.style.width = '0%';
        section.classList.remove('running');
    });
}

// Utility function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
} 