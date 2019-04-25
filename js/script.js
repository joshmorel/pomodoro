$(function() {

  // GLOBAL VARIABLES start
  var timerRunning = false;
  var pomodorosBeforeLong = 4;
  var completedPomodoros = 0;
  var segmentTimes = {
    "Pomodoro": 8,
    "Short Break": 2,
    "Long Break": 4
  }
  var currentSegment = "Pomodoro";
  var currentTime = segmentTimes[currentSegment];
  var currentTimer;
  // GLOBAL VARIABLES end

  updateTimeDisplayed(currentTime);
  Notification.requestPermission();

  function startTimer() {
    return setInterval(function() {
      currentTime--;
      updateTimeDisplayed(currentTime);

      // check if zero then notify
      if (currentTime === 0) {
        onTimerDone();
      }
    }, 1000);
  }

  function onTimerDone(showNotificaiton) {
    if (window.Notification && Notification.permission === "granted") {
      var notification = new Notification(currentSegment, { body: "Time's up" });
    }

    toggleStartPauseButtonDisplay(true);
    clearInterval(currentTimer);
    timerRunning = false;

    if (currentSegment === "Pomodoro") {
      completedPomodoros++;
      if (completedPomodoros < pomodorosBeforeLong) {
        currentSegment = "Short Break";
      } else {
        currentSegment = "Long Break";
        completedPomodoros = 0;
      }
    } else {
      currentSegment = "Pomodoro";
    }
    currentTime = segmentTimes[currentSegment];
    $("h1").text(currentSegment);
    updateTimeDisplayed(currentTime);
  }

  // EVENT LISTENERS start
  $("#resetTimer").click(function() {
    clearInterval(currentTimer);
    toggleStartPauseButtonDisplay(true);
    timerRunning = false;
    currentTime = segmentTimes[currentSegment];
    updateTimeDisplayed(currentTime);
  });

  $("#startPauseTimer").click(function() {
    if (timerRunning) {
      // pause
      clearInterval(currentTimer);
    } else {
      // start
      currentTimer = startTimer();
    }

    toggleStartPauseButtonDisplay(timerRunning);

    timerRunning = !timerRunning;
  });

  $("#forwardTimer").click(function() {
    toggleStartPauseButtonDisplay(false);
    clearInterval(currentTimer);
    timerRunning = true;

    if (currentSegment === "Pomodoro") {
      completedPomodoros++;
      if (completedPomodoros < pomodorosBeforeLong) {
        currentSegment = "Short Break";
      } else {
        currentSegment = "Long Break";
        completedPomodoros = 0;
      }
    } else {
      currentSegment = "Pomodoro";
    }
    currentTime = segmentTimes[currentSegment];
    $("h1").text(currentSegment);
    updateTimeDisplayed(currentTime);
    currentTimer = startTimer();
  });
  // EVENT LISTENERS end

  // HELPER FUNCTIONS start
  function toggleStartPauseButtonDisplay(toggleToStart) {
    if (toggleToStart) {
      $("#startPauseTimer i").removeClass("fa-pause").addClass("fa-play").attr("title", "Start timer");
    } else {
      $("#startPauseTimer i").removeClass("fa-play").addClass("fa-pause").attr("title", "Pause timer");
    }
  }

  function displayTimeFromSeconds(seconds) {
    var displayMinutes = String(Math.floor(Math.abs(seconds) / 60)).padStart(2, '0');
    var displaySeconds = String(Math.abs(seconds) % 60).padStart(2, '0');

    return (seconds < 0 ? "-" : "") + displayMinutes + ":" + displaySeconds;
  }

  function updateTimeDisplayed(seconds) {
    var timeToDisplay = displayTimeFromSeconds(seconds);
    $("title").text(timeToDisplay + " Pomodoro");
    $("#pomodoroTimer time").text(timeToDisplay);
  }
  // HELPER FUNCTIONS end

});

