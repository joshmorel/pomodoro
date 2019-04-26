$(function() {
  // DEFAULTS start
  var DEFAULT_POMODOROS_BEFORE_LONG = 4;
  var DEFAULT_AUTO_START = true;
  var DEFAULT_SEGMENT_DURATION_MINUTES = {
    "Pomodoro": 25,
    "Short Break": 5,
    "Long Break": 30 
  }
  // DEFAULTS end

  // GLOBAL VARIABLES start
  // Populate from localStorage, will either be null or string e.g. "false", "5", etc
  var pomodorosBeforeLongString = localStorage.getItem("pomodorosBeforeLong");
  var pomodorosBeforeLong = pomodorosBeforeLongString ? JSON.parse(pomodorosBeforeLongString) : DEFAULT_POMODOROS_BEFORE_LONG;

  var autoStartString = localStorage.getItem("autoStart");
  var autoStart = autoStartString ? JSON.parse(autoStartString) : DEFAULT_AUTO_START;

  var segmentDurationMinutesString = localStorage.getItem("segmentDurationMinutes");
  var segmentDurationMinutes = segmentDurationMinutesString ? JSON.parse(segmentDurationMinutesString) : DEFAULT_SEGMENT_DURATION_MINUTES;
  
  var timerRunning = false;
  var completedPomodoros = 0;
  var currentSegment = "Pomodoro";
  var lastSegment;
  var countdownSeconds = segmentDurationMinutes[currentSegment] * 60;
  var countdownTimer;
  var elapsedSeconds = segmentDurationMinutes[currentSegment] * 60;
  var elapsedTimer;
  // GLOBAL VARIABLES end
  
  // UPDATE DOM start
  updateCountdownDisplay(countdownSeconds, currentSegment);
  $("#autoStart").prop("checked", autoStart);
  $("#pomodorosBeforeLong").val(pomodorosBeforeLong);
  $("#pomodoroMinutes").val(segmentDurationMinutes["Pomodoro"]);
  $("#shortBreakMinutes").val(segmentDurationMinutes["Short Break"]);
  $("#longBreakMinutes").val(segmentDurationMinutes["Long Break"]);
  // UPDATE DOM end

  Notification.requestPermission();

  if (autoStart) {
    countdownTimer = startCountdown();
  }

  function startCountdown() {
    return setInterval(function() {
      countdownSeconds--;
      updateCountdownDisplay(countdownSeconds, currentSegment);

      // check if zero then notify
      if (countdownSeconds === 0) {
        countdownSeconds = 0;
        onCountdownDone();
      }
    }, 1000);
  }

  function countElapsed() {
    return setInterval(function() {
      elapsedSeconds++;
      updateElapsedDisplay(elapsedSeconds, lastSegment);
    }, 1000);
  }

  function onCountdownDone(showNotificaiton) {
    if (window.Notification && Notification.permission === "granted") {
      var notification = new Notification(currentSegment, { body: "Time's up" });
    }

    clearInterval(countdownTimer);

    lastSegment = currentSegment;
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

    countdownSeconds = segmentDurationMinutes[currentSegment] * 60;
    $("h1").text(currentSegment);
    updateCountdownDisplay(countdownSeconds, currentSegment);

    if (autoStart) {
      elapsedSeconds = countdownSeconds;
      countdownTimer = startCountdown();
    } else {
      timerRunning = false;
      $("#startTimer").prop("disabled", false);
      $("#pauseTimer").prop("disabled", true);

      $("#elapsed").css("display", "block");
      updateElapsedDisplay(elapsedSeconds, lastSegment);
      elapsedTimer = countElapsed(elapsedSeconds);
    }
  }

  // EVENT LISTENERS start
  $("#resetTimer").click(function() {
    clearInterval(countdownTimer);
    timerRunning = false;
    countdownSeconds = segmentDurationMinutes[currentSegment] * 60;
    clearInterval(elapsedTimer);
    elapsedSeconds = countdownSeconds;
    updateCountdownDisplay(countdownSeconds, currentSegment);

    $("#startTimer").prop("disabled", false);
    $("#pauseTimer").prop("disabled", true);
    $("#elapsed").css("display", "none");
  });

  $("#startTimer").click(function() {
    if (timerRunning) return;
    
    clearInterval(elapsedTimer);
    elapsedSeconds = countdownSeconds;
    countdownTimer = startCountdown();
    timerRunning = !timerRunning;

    $(this).prop("disabled", true);
    $("#pauseTimer").prop("disabled", false);
    $("#elapsed").css("display", "none");
  });

  $("#pauseTimer").click(function() {
    if (!timerRunning) return;

    clearInterval(countdownTimer);
    timerRunning = !timerRunning;
    
    $(this).prop("disabled", true);
    $("#startTimer").prop("disabled", false);
  });

  $("#saveSettings").click(function() {
    var autoStartVal = $("#autoStart").prop("checked");

    var pomodorosBeforeLongVal = $("#pomodorosBeforeLong").val();

    // validate numeric ranges are valid
    if (pomodorosBeforeLongVal < 1 || pomodorosBeforeLongVal > 9) {
      alert("Pomodoros before Long Break must be between 1 and 9");
      return;
    }

    var pomodoroMinutesVal = $("#pomodoroMinutes").val();
    if (pomodoroMinutesVal < 1 || pomodoroMinutesVal > 99) {
      alert("Pomodoro Minutes must be between 1 and 99");
      return;
    }

    var shortBreakMinutesVal = $("#shortBreakMinutes").val();
    if (shortBreakMinutesVal < 1 || shortBreakMinutesVal > 99) {
      alert("Short Break Minutes must be between 1 and 99");
      return;
    }

    var longBreakMinutesVal = $("#longBreakMinutes").val();
    if (longBreakMinutesVal < 1 || longBreakMinutesVal > 99) {
      alert("Long Break Minutes must be between 1 and 99");
      return;
    }

    localStorage.setItem("autoStart", autoStartVal);
    localStorage.setItem("pomodorosBeforeLong", pomodorosBeforeLongVal);

    localStorage.setItem("segmentDurationMinutes", JSON.stringify({
      "Pomodoro": pomodoroMinutesVal,
      "Short Break": shortBreakMinutesVal,
      "Long Break": longBreakMinutesVal
    }));

    location.reload();

  });
  // EVENT LISTENERS end

  // HELPER FUNCTIONS start
  function displayTimeFromSeconds(seconds) {
    var displayMinutes = String(Math.floor(Math.abs(seconds) / 60)).padStart(2, '0');
    var displaySeconds = String(Math.abs(seconds) % 60).padStart(2, '0');

    return displayMinutes + ":" + displaySeconds;
  }

  function updateCountdownDisplay(seconds, segment) {
    var timeToDisplay = displayTimeFromSeconds(seconds);
    $("title").text(timeToDisplay + " " + segment);
    $("#pomodoroTimer time").text(timeToDisplay);
  }

  function updateElapsedDisplay(seconds, segment) {
    var timeToDisplay = displayTimeFromSeconds(seconds);
    $("#elapsed").text(timeToDisplay + " Elapsed in " + segment);
  }

  // HELPER FUNCTIONS end

});

