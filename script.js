let audioElement;
let playTimeout, stopTimeout;
let playbackSchedule = [];

function getTimeInMilliseconds(hours, minutes) {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    if (target < now) {
        target.setDate(target.getDate() + 1); // Schedule for the next day if the target time has already passed
    }
    return target - now;
}

function startAudio() {
    audioElement.currentTime = 0;
    audioElement.play();
    console.log("Audio started");
}

function stopAudio() {
    audioElement.pause();
    console.log("Audio stopped");
}

function scheduleAudioPlayback(startHour, startMinute, stopHour, stopMinute) {
    const startDelay = getTimeInMilliseconds(startHour, startMinute);
    const stopDelay = getTimeInMilliseconds(stopHour, stopMinute);

    playTimeout = setTimeout(() => {
        startAudio();
        stopTimeout = setTimeout(stopAudio, stopDelay - startDelay);
    }, startDelay);

    // Save the schedule times for focus check
    playbackSchedule.push({
        start: startHour * 60 + startMinute,
        stop: stopHour * 60 + stopMinute,
    });
}

function scheduleDailyPlayback() {
    // Clear previous timeouts
    clearTimeout(playTimeout);
    clearTimeout(stopTimeout);

    // Clear previous schedule
    playbackSchedule = [];

    // First playback period
    scheduleAudioPlayback(20, 52, 20, 53); // Start at 1:00 AM, Stop at 1:20 AM

    // Second playback period
    scheduleAudioPlayback(3, 0, 3, 20); // Start at 3:00 AM, Stop at 3:20 AM

    // Set a daily interval to re-schedule playback periods
    setInterval(() => {
        scheduleDailyPlayback();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
}

// Check focus state and control audio playback accordingly
function checkFocus() {
    if (document.hidden) {
        audioElement.pause();
        console.log("Audio paused because tab is not in focus");
    } else {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        for (const schedule of playbackSchedule) {
            if (currentMinutes >= schedule.start && currentMinutes < schedule.stop) {
                audioElement.play();
                console.log("Audio resumed because tab is in focus");
                break;
            }
        }
    }
}

// Initialize the scheduling and focus check
function init() {
    audioElement = document.getElementById("myAudio");
    scheduleDailyPlayback();
    document.addEventListener('visibilitychange', checkFocus);
}

window.onload = init;
