// Check if the device is iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Check if the device is a Mac
function isMac() {
    return /Macintosh/.test(navigator.userAgent) && !window.MSStream;
}

// Check if the browser is Safari
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

if (isIOS() || (isMac() && isSafari() )) {
    document.querySelectorAll('.time-input').forEach(input => {
        input.type = 'text';
        input.pattern = '^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$';
        input.placeholder = 'HH:MM:SS';
    });
}

let isFullscreen = false;

// Audio variables
let audio0;
let audio1;
let audio2;
let audio3;
let audio4;

// Initialize audio
function initAudio() {
    audio0 = new Audio('assets/audio/beep.mp3');
    audio0.load();
    audio1 = new Audio('assets/audio/bell-x1.mp3');
    audio1.load();
    audio2 = new Audio('assets/audio/bell-x2.mp3');
    audio2.load();
    audio3 = new Audio('assets/audio/bell-x3.mp3');
    audio3.load();
    audio4 = new Audio('assets/audio/bell-x4.mp3');
    audio4.load();
}

// Timer state
let timerState = 'idle';

// Update timer state
function updateTimerState(newState) {
    timerState = newState;
    let sectionLabelText = '';
    let backgroundColor = '';
    
    if (newState === 'idle') {
        showStartButton();
        const firstEnabledSection = getFirstEnabledSection();
        sectionLabelText = firstEnabledSection.label;
        backgroundColor = firstEnabledSection.color;
    } else {
        // 他の状態の処理（変更なし）
        switch (newState) {
            case 'running':
                showStopButton();
                sectionLabelText = getCurrentSectionLabel(elapsedTime);
                backgroundColor = getSectionColor(elapsedTime);
                break;
            case 'paused':
                showResetAndResumeButtons();
                sectionLabelText = 'Paused';
                backgroundColor = '#adb8c1';
                break;
            case 'finished':
                showResetButton();
                backgroundColor = '#f9dbd9';
                sectionLabelText = '&#x1f3c1; Time is up';
                elapsedTime = totalTime;
                stopButton.style.display = 'none';
                break;
        }
    }
    
    timerContainer.style.backgroundColor = backgroundColor;
    updateTimerDisplays(elapsedTime, sectionLabelText);
    updateProgressBar(elapsedTime);
}
let holdInterval;
let holdTimeout;

function getFirstEnabledSection() {
    if (document.getElementById('enable-countdown').checked && countdownBefore > 0) {
        return {
            label: sectionNames.countdownBefore,
            color: sectionColors.countdownBefore
        };
    } else if (document.getElementById('enable-section-a').checked && sectionA > 0) {
        return {
            label: sectionNames.sectionA,
            color: sectionColors.sectionA
        };
    } else if (document.getElementById('enable-section-b').checked && sectionB > 0) {
        return {
            label: sectionNames.sectionB,
            color: sectionColors.sectionB
        };
    } else if (document.getElementById('enable-section-c').checked && sectionC > 0) {
        return {
            label: sectionNames.sectionC,
            color: sectionColors.sectionC
        };
    } else if (document.getElementById('enable-section-d').checked && sectionD > 0) {
        return {
            label: sectionNames.sectionD,
            color: sectionColors.sectionD
        };
    } else {
        return {
            label: 'No sections enabled',
            color: '#c0c0c0'
        };
    }
}

function startHold(action, inputElement) {
    if (action === 'increment') {
        incrementTime(inputElement);
    } else if (action === 'decrement') {
        decrementTime(inputElement);
    }
    validateTimeInput(inputElement);
    updateSettings();

    holdTimeout = setTimeout(() => {
        holdInterval = setInterval(() => {
            if (action === 'increment') {
                incrementTime(inputElement);
            } else if (action === 'decrement') {
                decrementTime(inputElement);
            }
            validateTimeInput(inputElement);
            updateSettings();
        }, 100);
    }, 500);
}

function stopHold() {
    clearTimeout(holdTimeout);
    clearInterval(holdInterval);
}

// Timer variables
let timerInterval;
let countdownInterval;
let startTime;
let isRunning = false;
let elapsedTime = 0;
let isCountingDown = false;
let isSwapped = false;

// DOM elements
const timerDisplay = document.getElementById('timer');
const subTimerDisplay = document.getElementById('sub-timer');
const progressBar = document.getElementById('progress-bar');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const resetButton = document.getElementById('reset-btn');
const resumeButton = document.getElementById('resume-btn');
const toggleSubTimerBtn = document.getElementById('toggle-sub-timer-btn');
const swapTimerBtn = document.getElementById('swap-timer-btn');
const sectionLabel = document.getElementById('section-label');
const timerContainer = document.getElementById('timer-container');
const startTimeLabel = document.getElementById('start-time-label');
const endTimeLabel = document.getElementById('end-time-label');

// Timer section durations
let countdownBefore = 5;
let sectionA = 10;
let sectionB = 10;
let sectionC = 10;
let sectionD = 5;
let totalTime = countdownBefore + sectionA + sectionB + sectionC + sectionD;

// Section names and colors
const sectionNames = {
    countdownBefore: '&#x23f1; Countdown',
    sectionA: 'Section A',
    sectionB: 'Section B',
    sectionC: 'Section C',
    sectionD: '&#x231b; Ending'
};

const sectionColors = {
    countdownBefore: '#a8b8f7',
    sectionA: '#94e3fe',
    sectionB: '#cce8b5',
    sectionC: '#ffe4a8',
    sectionD: '#ffc4ab'
};

let showSubTimer = true;

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Format time input to HH:MM:SS
function formatTimeInput(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Parse time input from HH:MM:SS
function parseTimeInput(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// Increment time input
function incrementTime(inputElement) {
    let [hours, minutes, seconds] = inputElement.value.split(':').map(Number);
    seconds += 1;
    if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds %= 60;
    }
    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes %= 60;
    }
    hours = Math.min(hours, 23);
    inputElement.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function decrementTime(inputElement) {
    let [hours, minutes, seconds] = inputElement.value.split(':').map(Number);
    seconds -= 1;
    if (seconds < 0) {
        minutes -= 1;
        seconds = 59;
    }
    if (minutes < 0) {
        hours -= 1;
        minutes = 59;
    }
    hours = Math.max(hours, 0);
    minutes = Math.max(minutes, 0);
    seconds = Math.max(seconds, 0);

    inputElement.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getCurrentSectionLabel(elapsedTime) {
    if (countdownBefore > 0 && elapsedTime < countdownBefore) {
        return sectionNames.countdownBefore;
    } else if (elapsedTime < countdownBefore + sectionA) {
        return sectionNames.sectionA;
    } else if (elapsedTime < countdownBefore + sectionA + sectionB) {
        return sectionNames.sectionB;
    } else if (elapsedTime < countdownBefore + sectionA + sectionB + sectionC) {
        return sectionNames.sectionC;
    } else if (elapsedTime < totalTime) {
        return sectionNames.sectionD;
    } else {
        return '&#x1f3c1; Time is up';
    }
}

// Update timer container color based on current section
function updateTimerContainerColor(elapsedTime) {
    let sectionLabelText = getCurrentSectionLabel(elapsedTime);
    if (countdownBefore > 0 && elapsedTime < countdownBefore) {
        timerContainer.style.backgroundColor = sectionColors.countdownBefore;
    } else if (sectionA > 0 && elapsedTime < countdownBefore + sectionA) {
        timerContainer.style.backgroundColor = sectionColors.sectionA;
    } else if (sectionB > 0 && elapsedTime < countdownBefore + sectionA + sectionB) {
        timerContainer.style.backgroundColor = sectionColors.sectionB;
    } else if (sectionC > 0 && elapsedTime < countdownBefore + sectionA + sectionB + sectionC) {
        timerContainer.style.backgroundColor = sectionColors.sectionC;
    } else if (sectionD > 0 && elapsedTime < totalTime) {
        timerContainer.style.backgroundColor = sectionColors.sectionD;
    }
    updateTimerDisplays(elapsedTime, sectionLabelText);
}

let sections;
// Update progress bar
function updateProgressBar(elapsedTime) {
    progressBar.innerHTML = '';
    let currentTime = 0;
    sections = [
        { name: 'countdownBefore', duration: countdownBefore },
        { name: 'sectionA', duration: sectionA },
        { name: 'sectionB', duration: sectionB },
        { name: 'sectionC', duration: sectionC },
        { name: 'sectionD', duration: sectionD }
    ];

    sections.forEach(section => {
        if (section.duration > 0) {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'progress-section';
            sectionElement.style.backgroundColor = sectionColors[section.name];
            sectionElement.style.left = `${(currentTime / totalTime) * 100}%`;
            
            const sectionWidth = (section.duration / totalTime) * 100;
            const progressWidth = Math.min(Math.max((elapsedTime - currentTime) / section.duration, 0), 1) * sectionWidth;
            sectionElement.style.width = `${progressWidth}%`;

            progressBar.appendChild(sectionElement);
            currentTime += section.duration;
        }
    });

    if (elapsedTime >= totalTime) {
        const lastSection = progressBar.lastElementChild;
        if (lastSection) {
            lastSection.style.width = `${100 - parseFloat(lastSection.style.left)}%`;
        }
    }

    updateMarkers();
}

// Start the timer
function startTimer() {
    startTime = Date.now() - elapsedTime * 1000; 
    updateTimerState('running');
    timerInterval = setInterval(() => {
        const previousElapsedTime = elapsedTime;
        elapsedTime = Math.min(Math.floor((Date.now() - startTime) / 1000), totalTime);
        
        if (elapsedTime !== previousElapsedTime) {
            const sectionLabelText = getCurrentSectionLabel(elapsedTime);
            updateTimerDisplays(elapsedTime, sectionLabelText);
            updateProgressBar(elapsedTime);
            updateTimerContainerColor(elapsedTime);
            checkSectionEnd(elapsedTime);
        }
        
        if (elapsedTime >= totalTime) {
            clearInterval(timerInterval);
            updateTimerState('finished');
            if (document.getElementById('sound-section-d').checked) {
                playSound("section-d");
            }
        }
    }, 100); 
}

// Check if a section has ended and play sound if needed
function checkSectionEnd(elapsedTime) {
    const sections = [
        { name: 'countdown', duration: countdownBefore },
        { name: 'section-a', duration: sectionA },
        { name: 'section-b', duration: sectionB },
        { name: 'section-c', duration: sectionC },
        { name: 'section-d', duration: sectionD }
    ];

    let currentTime = 0;
    for (let i = 0; i < sections.length; i++) {
        currentTime += sections[i].duration;
        if (elapsedTime === currentTime) {
            const soundElementId = `sound-${sections[i].name}`;
            if (document.getElementById(soundElementId).checked) {
                playSound(sections[i].name);
            }
            return;
        }
    }
}

function updateTimerDisplays(elapsedTime, sectionLabelText) {
    let mainTimerContent, subTimerContent;

    if (elapsedTime >= totalTime) {
        mainTimerContent = formatTime(totalTime - countdownBefore);
        subTimerContent = '00:00';
    } else if (countdownBefore > 0 && elapsedTime < countdownBefore) {
        mainTimerContent = `-${formatTime(countdownBefore - elapsedTime)}`;
        subTimerContent = 'Ready';
    } else {
        mainTimerContent = formatTime(elapsedTime - countdownBefore);
        subTimerContent = `-${formatTime(totalTime - elapsedTime)}`;
    }

    if (!sectionLabelText) {
        sectionLabelText = getCurrentSectionLabel(elapsedTime);
    }

    updateSVGTimer(mainTimerContent, subTimerContent, sectionLabelText, isFullscreen);
}

// End the timer
function endTimer() {
    clearInterval(timerInterval);
    elapsedTime = totalTime;
    updateTimerState('finished');
    checkSectionEnd(elapsedTime);
}

// Start countdown (for both before and after)
function startCountdown(duration, isBeforeCountdown) {
    isCountingDown = true;
    let countdown = duration;
    updateTimerState('running');
    countdownInterval = setInterval(() => {
        elapsedTime++;
        countdown--;
        const currentSectionLabel = getCurrentSectionLabel(elapsedTime);
        updateTimerDisplays(isBeforeCountdown ? elapsedTime : totalTime - countdown, currentSectionLabel);
        updateProgressBar(elapsedTime);
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            isCountingDown = false;
            if (isBeforeCountdown) {
                if (document.getElementById('sound-countdown').checked) {
                    playSound("countdown");
                }
                startTimer();
            } else {
                updateTimerState('finished');
            }
        }
    }, 1000);
}

// Start timing
function startTiming() {
    initAudio();

    clearInterval(timerInterval);
    clearInterval(countdownInterval);
    elapsedTime = 0;
    isCountingDown = false;

    if (countdownBefore > 0) {
        startCountdown(countdownBefore, true);
    } else {
        startTimer();
    }
    updateTimerState('running');
    disableSettings();
    setTimeInputButtonsState(true);
}

// End timing
function endTiming() {
    clearInterval(timerInterval);
    clearInterval(countdownInterval);
    updateTimerState('paused');
    setTimeInputButtonsState(true);
}

// Resume timing
function resumeTiming() {
    playSound('start');
    if (elapsedTime < countdownBefore) {
        startCountdown(countdownBefore - elapsedTime, true);
    } else if (elapsedTime >= totalTime - sectionD) {
        startCountdown(totalTime - elapsedTime, false);
    } else {
        startTimer();
    }
    disableSettings();
    setTimeInputButtonsState(true);
}

// Reset timing
function resetTiming() {
    clearInterval(timerInterval);
    clearInterval(countdownInterval);
    elapsedTime = 0;
    isCountingDown = false;
    updateTimerState('idle');
    enableSettings();
    setTimeInputButtonsState(false);
}

// Show start button
function showStartButton() {
    startButton.style.display = 'inline-block';
    stopButton.style.display = 'none';
    resetButton.style.display = 'none';
    resumeButton.style.display = 'none';
    toggleSubTimerBtn.style.display = 'inline-block';
    swapTimerBtn.style.display = 'inline-block';
}

// Show stop button
function showStopButton() {
    startButton.style.display = 'none';
    stopButton.style.display = 'inline-block';
    resetButton.style.display = 'none';
    resumeButton.style.display = 'none';
    toggleSubTimerBtn.style.display = 'inline-block';
    swapTimerBtn.style.display = 'inline-block';
}

// Show reset button
function showResetButton() {
    startButton.style.display = 'none';
    stopButton.style.display = 'none';
    resetButton.style.display = 'inline-block';
    resumeButton.style.display = 'none';
    toggleSubTimerBtn.style.display = 'inline-block';
    swapTimerBtn.style.display = 'inline-block';
    disableSettings();
}

// Show reset and resume buttons
function showResetAndResumeButtons() {
    startButton.style.display = 'none';
    stopButton.style.display = 'none';
    resetButton.style.display = 'inline-block';
    resumeButton.style.display = 'inline-block';
    toggleSubTimerBtn.style.display = 'inline-block';
    swapTimerBtn.style.display = 'inline-block';
}

// Enable settings
function enableSettings() {
    document.querySelectorAll('#settings input').forEach(input => {
        input.disabled = false;
    });
}

// Disable settings
function disableSettings() {
    document.querySelectorAll('#settings input').forEach(input => {
        input.disabled = true;
    });
}

// Set time input buttons state
function setTimeInputButtonsState(disabled) {
    document.querySelectorAll('.time-input-button').forEach(button => {
        button.disabled = disabled;
    });
}

// Update markers on progress bar
function updateMarkers() {
    progressBar.querySelectorAll('.marker').forEach(marker => marker.remove());

    let labelPosition = 'bottom';
    let firstSectionStarted = false;
    let lastNonZeroSection = null;

    const addMarker = (time, label, inputId, isNonZero, forcePosition = null) => {
        const percentage = (time / totalTime) * 100;
        const marker = document.createElement('div');
        marker.className = 'marker';
        marker.style.left = `${percentage}%`;

        if (isNonZero && !firstSectionStarted) {
            marker.classList.add('prominent');
            firstSectionStarted = true;
        }

        if (isNonZero) {
            lastNonZeroSection = marker;
        }

        if (label !== null) {
            const markerLabel = document.createElement('div');
            markerLabel.className = `marker-label marker-label-${forcePosition || labelPosition}`;
            markerLabel.textContent = label;
            markerLabel.addEventListener('click', () => {
                document.getElementById(inputId).focus();
            });
            marker.appendChild(markerLabel);
            if (!forcePosition) {
                labelPosition = labelPosition === 'top' ? 'bottom' : 'top';
            }
        }

        progressBar.appendChild(marker);
    };

    // Add marker for countdown start
    if (countdownBefore > 0) {
        addMarker(0, `-${formatTime(countdownBefore)}`, 'countdown', false, 'bottom');
        startTimeLabel.textContent = `-${formatTime(countdownBefore)}`;
        startTimeLabel.className = 'start-end-label-bottom';
        startTimeLabel.addEventListener('click', () => {
            document.getElementById('countdown').focus();
        });
    } else {
        startTimeLabel.textContent = '';
    }

    let currentTime = countdownBefore;
    // Primary start marker (always on top)
    addMarker(currentTime, '00:00', 'countdown', true, 'top');

    if (sectionA > 0) {
        currentTime += sectionA;
        addMarker(currentTime, formatTime(sectionA), 'section-a', true);
    }

    if (sectionB > 0) {
        currentTime += sectionB;
        addMarker(currentTime, formatTime(sectionA + sectionB), 'section-b', true);
    }

    if (sectionC > 0) {
        currentTime += sectionC;
        addMarker(currentTime, formatTime(sectionA + sectionB + sectionC), 'section-c', true);
    }

    // Add marker for section-d end if it's not 00:00:00
    if (sectionD > 0) {
        addMarker(totalTime, formatTime(totalTime - countdownBefore), 'section-d', true);
    }

    // Add end label
    endTimeLabel.textContent = formatTime(totalTime - countdownBefore);
    endTimeLabel.className = `start-end-label-${labelPosition}`;
    endTimeLabel.addEventListener('click', () => {
        document.getElementById('section-d').focus();
    });

    // Make the last non-zero section marker prominent
    if (lastNonZeroSection) {
        lastNonZeroSection.classList.add('prominent-end');
    }

    adjustMarkerLabels();
}

function adjustMarkerLabels() {
    const topLabels = Array.from(document.querySelectorAll('.marker-label-top, .start-end-label-top'));
    const bottomLabels = Array.from(document.querySelectorAll('.marker-label-bottom, .start-end-label-bottom'));

    function adjustLabels(labels, isTop) {
        let lastRight = -Infinity;
        let lastLabel = null;
        let hasOverlap = false;

        labels.sort((a, b) => a.offsetLeft - b.offsetLeft);

        labels.forEach((label) => {
            const rect = label.getBoundingClientRect();
            if (rect.left < lastRight) {
                hasOverlap = true;
                if (lastLabel && !lastLabel.classList.contains('marker-label-top') && !lastLabel.classList.contains('marker-label-bottom')) {
                    lastLabel.style.transform = `translateX(-50%) translateY(${isTop ? '-100%' : '100%'})`;
                }
                if (!label.classList.contains('marker-label-top') && !label.classList.contains('marker-label-bottom')) {
                    label.style.transform = 'translateX(-50%) translateY(0%)';
                }
            } else if (!hasOverlap) {
                if (!label.classList.contains('marker-label-top') && !label.classList.contains('marker-label-bottom')) {
                    label.style.transform = 'translateX(-50%) translateY(0%)';
                }
            }
            lastRight = rect.right;
            lastLabel = label;
        });

        if (!hasOverlap) {
            labels.forEach(label => {
                if (!label.classList.contains('marker-label-top') && !label.classList.contains('marker-label-bottom')) {
                    label.style.transform = 'translateX(-50%) translateY(0%)';
                }
            });
        }
    }

    adjustLabels(topLabels, true);
    adjustLabels(bottomLabels, false);
}

// Update settings
function updateSettings() {
    countdownBefore = document.getElementById('enable-countdown').checked ? parseTimeInput(document.getElementById('countdown').value) || 0 : 0;
    sectionA = document.getElementById('enable-section-a').checked ? parseTimeInput(document.getElementById('section-a').value) || 0 : 0;
    sectionB = document.getElementById('enable-section-b').checked ? parseTimeInput(document.getElementById('section-b').value) || 0 : 0;
    sectionC = document.getElementById('enable-section-c').checked ? parseTimeInput(document.getElementById('section-c').value) || 0 : 0;
    sectionD = document.getElementById('enable-section-d').checked ? parseTimeInput(document.getElementById('section-d').value) || 0 : 0;
    totalTime = countdownBefore + sectionA + sectionB + sectionC + sectionD;

    sectionNames.countdownBefore = document.getElementById('countdown-label').value || 'Countdown';
    sectionNames.sectionA = document.getElementById('section-a-label').value || 'Section A';
    sectionNames.sectionB = document.getElementById('section-b-label').value || 'Section B';
    sectionNames.sectionC = document.getElementById('section-c-label').value || 'Section C';
    sectionNames.sectionD = document.getElementById('section-d-label').value || 'Ending';

    sectionColors.countdownBefore = document.getElementById('countdown-color').value || '#d6d8d9';
    sectionColors.sectionA = document.getElementById('section-a-color').value || '#ffd966';
    sectionColors.sectionB = document.getElementById('section-b-color').value || '#d4edda';
    sectionColors.sectionC = document.getElementById('section-c-color').value || '#c3e6cb';
    sectionColors.sectionD = document.getElementById('section-d-color').value || '#f8d7da';

    updateMarkers();
    updateProgressBar(elapsedTime);
    updateFirstNonZeroSection();

    updateSettingGroupBackgrounds();
    updateTimerDisplays(elapsedTime, getCurrentSectionLabel(elapsedTime));
}

// Update background color for setting groups with 00:00:00
function updateSettingGroupBackgrounds() {
    const settingGroups = document.querySelectorAll('.setting-group');
    settingGroups.forEach(group => {
        const enableCheckbox = group.querySelector('.enable-setting');
        if (!enableCheckbox.checked) {
            group.style.backgroundColor = '#ccc';
        } else {
            group.style.backgroundColor = '#ffffff';
        }
    });
}

// Update the first non-zero section
function updateFirstNonZeroSection() {
    const currentSectionLabel = getCurrentSectionLabel(0);
    updateTimerDisplays(0, currentSectionLabel);
    timerContainer.style.backgroundColor = getSectionColor(0);
}

function getSectionColor(elapsedTime) {
    if (countdownBefore > 0 && elapsedTime < countdownBefore) {
        return sectionColors.countdownBefore;
    } else if (sectionA > 0 && elapsedTime < countdownBefore + sectionA) {
        return sectionColors.sectionA;
    } else if (sectionB > 0 && elapsedTime < countdownBefore + sectionA + sectionB) {
        return sectionColors.sectionB;
    } else if (sectionC > 0 && elapsedTime < countdownBefore + sectionA + sectionB + sectionC) {
        return sectionColors.sectionC;
    } else if (sectionD > 0 && elapsedTime < totalTime) {
        return sectionColors.sectionD;
    } else {
        return 'white';
    }
}

// Initialize inputs
function initializeInputs() {
    document.getElementById('countdown').value = formatTimeInput(countdownBefore);
    document.getElementById('section-a').value = formatTimeInput(sectionA);
    document.getElementById('section-b').value = formatTimeInput(sectionB);
    document.getElementById('section-c').value = formatTimeInput(sectionC);
    document.getElementById('section-d').value = formatTimeInput(sectionD);

    document.getElementById('countdown-color').value = sectionColors.countdownBefore;
    document.getElementById('section-a-color').value = sectionColors.sectionA;
    document.getElementById('section-b-color').value = sectionColors.sectionB;
    document.getElementById('section-c-color').value = sectionColors.sectionC;
    document.getElementById('section-d-color').value = sectionColors.sectionD;

    document.querySelectorAll('.time-input').forEach(input => {
        input.step = "1";
    });
}

// Add touch event listeners
function addTouchEventListeners() {
    startButton.addEventListener('touchstart', handleTouchStart);
    stopButton.addEventListener('touchstart', handleTouchStart);
    resetButton.addEventListener('touchstart', handleTouchStart);
    resumeButton.addEventListener('touchstart', handleTouchStart);
    toggleSubTimerBtn.addEventListener('touchstart', handleTouchStart);
    swapTimerBtn.addEventListener('touchstart', handleTouchStart);
}

function updateToggleLabel(toggle) {
    const label = toggle.nextElementSibling.querySelector('.toggle-label');
    if (toggle.checked) {
        label.textContent = 'Enabled';
    } else {
        label.textContent = 'Disabled';
    }
}

// Handle touch start
function handleTouchStart(event) {
    event.preventDefault();
    event.target.click();
}

// Swap timer and sub-timer
function swapTimers() {
    isSwapped = !isSwapped;
    const currentSectionLabel = getCurrentSectionLabel(elapsedTime);
    updateTimerDisplays(elapsedTime, currentSectionLabel);
}

// Initialize bell counts
const bellCounts = {
    'countdown': 1,
    'section-a': 1,
    'section-b': 1,
    'section-c': 1,
    'section-d': 2
};

function updateBellCount(section) {
    bellCounts[section] = (bellCounts[section] % 4) + 1;
    document.getElementById(`bell-count-${section}`).textContent = bellCounts[section];
}

document.querySelectorAll('.bell-icon').forEach(icon => {
    icon.addEventListener('click', (event) => {
        const section = event.target.getAttribute('data-sound');
        updateBellCount(section);
    });
});

function getAudio(section) {
    if (section === 'start') {
        return audio0;
    } else if (bellCounts[section] === 1) {
        return audio1;
    } else if (bellCounts[section] === 2) {
        return audio2;
    } else if (bellCounts[section] === 3) {
        return audio3;
    } else {
        return audio4;
    }
}

function playSound(section) {
    let audio = getAudio(section);
    if (audio) {
        audio.play().catch(error => {
            console.warn('Failed to play audio, retrying...', error);
        });
    } else {
        console.warn('Audio not initialized');
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    if (!isRunning) {
        playSound('start');
        startTiming();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    initAudio();
}, { once: true });

stopButton.addEventListener('click', endTiming);
resetButton.addEventListener('click', resetTiming);
resumeButton.addEventListener('click', resumeTiming);

toggleSubTimerBtn.addEventListener('click', () => {
    showSubTimer = !showSubTimer;
    const currentSectionLabel = getCurrentSectionLabel(elapsedTime);
    updateTimerDisplays(elapsedTime, currentSectionLabel);
    toggleSubTimerBtn.innerHTML = showSubTimer ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    timerContainer.classList.toggle('hide-sub-timer', !showSubTimer);
    
    const svgContainer = document.getElementById('svg-timer-container');
    svgContainer.classList.toggle('large-timer', !showSubTimer);
});

swapTimerBtn.addEventListener('click', swapTimers);

document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
        return;
    }

    if (event.code === 'Space') {
        event.preventDefault();
        switch (timerState) {
            case 'idle':
                startTiming();
                break;
            case 'running':
                endTiming();
                break;
            case 'paused':
                resumeTiming();
                break;
            case 'finished':
                resetTiming();
                break;
        }
    } else if (event.code === 'Enter') {
        event.preventDefault();
        isFullscreen = toggleFullscreen();
        updateFullscreenButtonIcon();
    }
});

// Initialize
resetTiming();
updateMarkers();
addTouchEventListeners();
initializeInputs();
updateTimerDisplays(0, getCurrentSectionLabel(0));
updateTimerState('idle');

// Add event listeners for real-time settings update
document.querySelectorAll('#settings input[type="time"], #settings input[type="color"]').forEach(input => {
    input.addEventListener('input', () => {
        updateSettings();
        updateSettingGroupBackgrounds();
    });
});

// Initial update of setting group backgrounds
updateSettingGroupBackgrounds();

// Add event listeners to enable/disable setting groups
document.querySelectorAll('.enable-setting').forEach(toggle => {
    toggle.addEventListener('change', (event) => {
        const settingGroup = event.target.closest('.setting-group');
        const isEnabled = event.target.checked;
        settingGroup.querySelectorAll('input[type="time"], input[type="color"], .time-input-button, .sound-setting').forEach(input => {
            input.disabled = !isEnabled;
        });
        updateToggleLabel(event.target);
        updateSettings();
    });
    updateToggleLabel(toggle);
});

window.addEventListener('resize', adjustMarkerLabels);

function createSVGText(text, x, y, fontSize, fontWeight = '700', strokeWidth = 2, className = '') {
    // if text only contains numbers, symbols, and spaces use "Roboto Mono" font
    const fontFamily = /^[0-9\s\W]*$/.test(text) ? 'Roboto Mono' : 'Montserrat';
    const id = `outline-${Math.random().toString(36).substr(2, 9)}`;
    return `
        <defs>
            <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
                <feMorphology operator="dilate" radius="${strokeWidth}" in="SourceAlpha" result="thicken" />
                <feFlood flood-color="white" result="flood" />
                <feComposite in="flood" in2="thicken" operator="in" result="outline" />
                <feMerge>
                    <feMergeNode in="outline" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="'${fontFamily}', sans-serif"" text-anchor="middle" dominant-baseline="middle" filter="url(#${id})" fill="black" class="${className}">
            ${text}
        </text>
    `;
}

function updateSVGTimer(mainText, subText, sectionLabelText, isFullscreenMode) {
    const svgContainer = document.getElementById('svg-timer-container');
    const containerWidth = svgContainer.clientWidth;
    const containerHeight = svgContainer.clientHeight;

    const isNarrowScreen = window.innerWidth <= 768;
    const shouldAdjustSize = isNarrowScreen && !showSubTimer;

    const mainFontSize = isFullscreenMode ? '30vh' : (shouldAdjustSize ? '10vw' : '48px');
    const subFontSize = isFullscreenMode ? '8vh' : '24px';
    const sectionLabelFontSize = isFullscreenMode ? '8vh' : '24px';

    let sectionLabelSVG = showSubTimer ? createSVGText(sectionLabelText, containerWidth / 2, containerHeight * 0.2, sectionLabelFontSize, '700', 2, 'section-label') : '';
    let mainTimerSVG = createSVGText(
        isSwapped ? subText : mainText, 
        containerWidth / 2, 
        containerHeight / 2 + 5,
        mainFontSize,
        '700',
        2,
        'main-timer'
    );
    let subTimerSVG = showSubTimer ? createSVGText(isSwapped ? mainText : subText, containerWidth / 2, containerHeight * 0.8, subFontSize, '700', 2, 'sub-timer') : '';

    svgContainer.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${containerWidth} ${containerHeight}">
            ${sectionLabelSVG}
            ${mainTimerSVG}
            ${subTimerSVG}
        </svg>
    `;

    svgContainer.classList.toggle('large-timer', !showSubTimer);
    svgContainer.classList.toggle('narrow-screen', isNarrowScreen);
}


document.querySelectorAll('#countdown-label, #section-a-label, #section-b-label, #section-c-label, #section-d-label').forEach(input => {
    input.addEventListener('input', () => {
        updateSettings();
    });
});

function setCustomTabOrder() {
    const inputGroups = {
        labels: document.querySelectorAll('#countdown-label, #section-a-label, #section-b-label, #section-c-label, #section-d-label'),
        times: document.querySelectorAll('#countdown, #section-a, #section-b, #section-c, #section-d'),
        colors: document.querySelectorAll('#countdown-color, #section-a-color, #section-b-color, #section-c-color, #section-d-color'),
        sounds: document.querySelectorAll('#sound-countdown, #sound-section-a, #sound-section-b, #sound-section-c, #sound-section-d')
    };

    let tabIndex = 1;

    for (const group of Object.values(inputGroups)) {
        group.forEach(input => {
            input.tabIndex = tabIndex++;
        });
    }
}

setCustomTabOrder();
window.addEventListener('resize', setCustomTabOrder);

document.querySelectorAll('.enable-setting').forEach(toggle => {
    toggle.addEventListener('change', () => {
        setCustomTabOrder();
    });
});

// Validate time input
function validateTimeInput(input) {
    const timePattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!isIOS() && !timePattern.test(input.value)) {
        input.value = "00:00:00";
    }
    return timePattern.test(input.value);
}

// Handle time input change
function handleTimeInputChange(input) {
    if (validateTimeInput(input)) {
        updateSettings();
    }
}

// Add event listeners to time inputs
document.querySelectorAll('.time-input').forEach(input => {
    input.addEventListener('input', () => handleTimeInputChange(input));
    input.addEventListener('blur', () => {
        validateTimeInput(input);
        updateSettings();
    });
});

// Add event listeners to time input buttons
document.querySelectorAll('.time-input-button').forEach(button => {
    const input = button.closest('.time-input-container').querySelector('.time-input');
    const action = button.getAttribute('data-action');

    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startHold(action, input);
    });
    button.addEventListener('mouseup', stopHold);
    button.addEventListener('mouseleave', stopHold);
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHold(action, input);
    });
    button.addEventListener('touchend', stopHold);
});

// Toggle fullscreen mode
function toggleFullscreen() {
    const mainContent = document.querySelector('.main-content');
    if (!isFullscreen) {
        if (mainContent.requestFullscreen) {
            mainContent.requestFullscreen();
        } else if (mainContent.mozRequestFullScreen) {
            mainContent.mozRequestFullScreen();
        } else if (mainContent.webkitRequestFullscreen) {
            mainContent.webkitRequestFullscreen();
        } else if (mainContent.msRequestFullscreen) {
            mainContent.msRequestFullscreen();
        }
        document.querySelector('#start-btn').classList.add('fullscreen-btn');
        document.querySelector('#stop-btn').classList.add('fullscreen-btn');
        document.querySelector('#reset-btn').classList.add('fullscreen-btn');
        document.querySelector('#resume-btn').classList.add('fullscreen-btn');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        document.querySelector('#start-btn').classList.remove('fullscreen-btn');
        document.querySelector('#stop-btn').classList.remove('fullscreen-btn');
        document.querySelector('#reset-btn').classList.remove('fullscreen-btn');
        document.querySelector('#resume-btn').classList.remove('fullscreen-btn');
    }
    return !isFullscreen;
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement || 
                   !!document.webkitFullscreenElement || 
                   !!document.mozFullScreenElement ||
                   !!document.msFullscreenElement;

    updateFullscreenButtonIcon();
    document.body.classList.toggle('fullscreen-mode', isFullscreen);
    
    const currentSectionLabel = getCurrentSectionLabel(elapsedTime);
    updateTimerDisplays(elapsedTime, currentSectionLabel);

    window.dispatchEvent(new Event('resize'));
}

// Update fullscreen button icon
function updateFullscreenButtonIcon() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (isFullscreen) {
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Add event listener to fullscreen button
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', updateFullscreenButtonIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenButtonIcon);
document.addEventListener('mozfullscreenchange', updateFullscreenButtonIcon);
document.addEventListener('MSFullscreenChange', updateFullscreenButtonIcon);

// Bell icon click handler
const bellIcon = document.querySelector('.fa-bell-concierge');
let bellCount = 1;

bellIcon.addEventListener('click', () => {
    bellCount = (bellCount % 4) + 1;
    document.getElementById('bell-count').textContent = bellCount;
    playBellSound(bellCount);
});

function playBellSound(count) {
    const audio = new Audio(`assets/audio/bell-x${count}.mp3`);
    audio.play();
}

function adjustFooterPosition() {
    const settingsElement = document.getElementById('settings');
    const footerWrapper = document.querySelector('.footer-wrapper');
    
    const settingsBottom = settingsElement.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight;
    const footerHeight = footerWrapper.offsetHeight;

    if (settingsBottom + footerHeight + 20 < viewportHeight) { 
        footerWrapper.style.position = 'absolute';
        footerWrapper.style.bottom = '0';
    } else {
        footerWrapper.style.position = 'static';
    }
}

if(!isIOS()) {
    window.addEventListener('load', adjustFooterPosition);
    window.addEventListener('resize', adjustFooterPosition);
}
