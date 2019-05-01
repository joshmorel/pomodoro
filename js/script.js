$(function() {
  // CONSTANTS start
  var DEFAULT_POMODOROS_BEFORE_LONG = 4;
  var DEFAULT_AUTO_START = false;
  var DEFAULT_INTERVAL_DURATION_MINUTES = {
    "Pomodoro": 25,
    "Short Break": 5,
    "Long Break": 30 
  }
  var CIRCLE_CANVAS_ID = "timerForeground";
  var CIRCLE_CANVAS_FILL = "#ff6666";
  // CONSTANTS end

  // GLOBAL VARIABLES start
  // Populate from localStorage, will either be null or string e.g. "false", "5", etc
  var pomodorosBeforeLongString = localStorage.getItem("pomodorosBeforeLong");
  var pomodorosBeforeLong = pomodorosBeforeLongString ? JSON.parse(pomodorosBeforeLongString) : DEFAULT_POMODOROS_BEFORE_LONG;

  var autoStartString = localStorage.getItem("autoStart");
  var autoStart = autoStartString ? JSON.parse(autoStartString) : DEFAULT_AUTO_START;

  var intervalDurationMinutesString = localStorage.getItem("intervalDurationMinutes");
  var intervalDurationMinutes = intervalDurationMinutesString ? JSON.parse(intervalDurationMinutesString) : DEFAULT_INTERVAL_DURATION_MINUTES;
  
  var timerRunning = false;
  var completedPomodoros = 0;
  var currentInterval = "Pomodoro";
  var lastInterval;
  var countdownSeconds = intervalDurationMinutes[currentInterval] * 60;
  var countdownTimer;
  var totalSeconds = intervalDurationMinutes[currentInterval] * 60;
  var elapsedTimer;
  var percentDone = 0;
  var prevPercentDone = 0;
  // GLOBAL VARIABLES end
  
  // UPDATE DOM start
  drawSegmentedCircle(CIRCLE_CANVAS_ID, CIRCLE_CANVAS_FILL, percentDone);
  updateCountdownDisplay(countdownSeconds, currentInterval);
  toggleStartIntervalButtonsActive(currentInterval);
  toggleStartPauseDisabled(false);
  $("#autoStart").prop("checked", autoStart);
  $("#pomodorosBeforeLong").val(pomodorosBeforeLong);
  $("#pomodoroMinutes").val(intervalDurationMinutes["Pomodoro"]);
  $("#shortBreakMinutes").val(intervalDurationMinutes["Short Break"]);
  $("#longBreakMinutes").val(intervalDurationMinutes["Long Break"]);
  // UPDATE DOM end

  if (window.Notification) {
    Notification.requestPermission();
  }

  function startCountdown() {

    return setInterval(function() {
      countdownSeconds--;

      prevPercentDone = percentDone;
      percentDone = 100 - Math.round(countdownSeconds / totalSeconds * 100);

      updateFavicon(percentDone, prevPercentDone);
      updateCountdownDisplay(countdownSeconds, currentInterval);
      drawSegmentedCircle(CIRCLE_CANVAS_ID, CIRCLE_CANVAS_FILL, percentDone);

      // check if zero then notify
      if (countdownSeconds === 0) {
        countdownSeconds = 0;
        onCountdownDone();
      }
    }, 1000);
  }

  function countElapsed() {
    return setInterval(function() {
      totalSeconds++;
      updateElapsedDisplay(totalSeconds, lastInterval);
    }, 1000);
  }

  function onCountdownDone() {
    if (window.Notification && Notification.permission === "granted") {
      var notification = new Notification(currentInterval + " is over!", {
        icon: "/img/notification-icon.png",
        body: displayTimeFromSeconds(intervalDurationMinutes[currentInterval] * 60) + " elapsed"
      });
      notification.onclick = function() {
        window.focus();
      }
    }

    $("#alarm").get(0).play();

    clearInterval(countdownTimer);
    resetDefaultFavicon();

    lastInterval = currentInterval;
    if (currentInterval === "Pomodoro") {
      completedPomodoros++;
      if (completedPomodoros < pomodorosBeforeLong) {
        currentInterval = "Short Break";
      } else {
        currentInterval = "Long Break";
        completedPomodoros = 0;
      }
    } else {
      currentInterval = "Pomodoro";
    }

    countdownSeconds = intervalDurationMinutes[currentInterval] * 60;
    percentDone = 0;

    updateCountdownDisplay(countdownSeconds, currentInterval);
    toggleStartIntervalButtonsActive(currentInterval);
    drawSegmentedCircle(CIRCLE_CANVAS_ID, CIRCLE_CANVAS_FILL, percentDone);

    if (autoStart) {
      totalSeconds = countdownSeconds;
      countdownTimer = startCountdown();
    } else {
      timerRunning = false;
      toggleStartPauseDisabled(false);

      $("#elapsed").css("display", "block");
      updateElapsedDisplay(totalSeconds, lastInterval);
      elapsedTimer = countElapsed(totalSeconds);
    }
  }

  // EVENT LISTENERS start
  $("#resetTimer").click(function() {
    clearInterval(countdownTimer);
    timerRunning = false;
    countdownSeconds = intervalDurationMinutes[currentInterval] * 60;
    clearInterval(elapsedTimer);
    totalSeconds = countdownSeconds;
    percentDone = 0;

    updateCountdownDisplay(countdownSeconds, currentInterval);
    drawSegmentedCircle(CIRCLE_CANVAS_ID, CIRCLE_CANVAS_FILL, percentDone);
    resetDefaultFavicon();
    toggleStartPauseDisabled(false);
    $("#elapsed").css("display", "none");
  });

  $("#startTimer").click(function() {
    if (timerRunning) return;
    
    clearInterval(elapsedTimer);
    countdownTimer = startCountdown();
    timerRunning = !timerRunning;

    // only reset totalSeconds if elapsed past countdown (not from pause)
    if (countdownSeconds === intervalDurationMinutes[currentInterval] * 60) {
      totalSeconds = countdownSeconds;
    }

    toggleStartPauseDisabled(true);
    $("#elapsed").css("display", "none");
  });

  $("#pauseTimer").click(function() {
    if (!timerRunning) return;

    clearInterval(countdownTimer);
    timerRunning = !timerRunning;
    
    toggleStartPauseDisabled(false);
  });

  $(".start-interval-btn").click(function() {
    // SET GLOBAL VARIABLES start
    currentInterval = $(this).text();
    clearInterval(countdownTimer);
    clearInterval(elapsedTimer);
    timerRunning = true;
    countdownSeconds = intervalDurationMinutes[currentInterval] * 60;
    totalSeconds = countdownSeconds;
    percentDone = 0;
    countdownTimer = startCountdown();
    // SET GLOBAL VARIABLES start

    // UPDATE DOM start
    updateCountdownDisplay(countdownSeconds, currentInterval);
    drawSegmentedCircle(CIRCLE_CANVAS_ID, CIRCLE_CANVAS_FILL, percentDone);
    toggleStartIntervalButtonsActive(currentInterval);
    resetDefaultFavicon();
    toggleStartPauseDisabled(true);
    $("#elapsed").css("display", "none");
    // UPDATE DOM end
  });

  $("#saveSettings").click(function() {
    var autoStartVal = $("#autoStart").prop("checked");

    var pomodorosBeforeLongVal = Math.floor($("#pomodorosBeforeLong").val());

    // validate numeric ranges are valid
    if (pomodorosBeforeLongVal < 1 || pomodorosBeforeLongVal > 9) {
      alert("Pomodoros before Long Break must be between 1 and 9");
      return;
    }

    var pomodoroMinutesVal = Math.floor($("#pomodoroMinutes").val());
    if (pomodoroMinutesVal < 1 || pomodoroMinutesVal > 99) {
      alert("Pomodoro Minutes must be between 1 and 99");
      return;
    }

    var shortBreakMinutesVal = Math.floor($("#shortBreakMinutes").val());
    if (shortBreakMinutesVal < 1 || shortBreakMinutesVal > 99) {
      alert("Short Break Minutes must be between 1 and 99");
      return;
    }

    var longBreakMinutesVal = Math.floor($("#longBreakMinutes").val());
    if (longBreakMinutesVal < 1 || longBreakMinutesVal > 99) {
      alert("Long Break Minutes must be between 1 and 99");
      return;
    }

    localStorage.setItem("autoStart", autoStartVal);
    localStorage.setItem("pomodorosBeforeLong", pomodorosBeforeLongVal);

    localStorage.setItem("intervalDurationMinutes", JSON.stringify({
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

  function updateCountdownDisplay(seconds, interval) {
    var timeToDisplay = displayTimeFromSeconds(seconds);
    $("title").text(timeToDisplay + " " + interval);
    $("#timerCountdown").text(timeToDisplay);
  }

  function updateElapsedDisplay(seconds, interval) {
    var timeToDisplay = displayTimeFromSeconds(seconds);
    $("#elapsed").text(timeToDisplay + " elapsed in last " + interval);
  }

  function drawSegmentedCircle(elementId, fillStyle, percentClockwise) {
    var FRACTION_START = Math.PI * 1.5; // top
    var fractionEnd = Math.PI * (2  * percentClockwise / 100 - 0.5);

    var canvas = document.getElementById(elementId);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // assume heigh/width same
    var radiusLength = canvas.width / 2;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(radiusLength, radiusLength);
    ctx.arc(radiusLength, radiusLength, canvas.height / 2, FRACTION_START, fractionEnd, true);
    ctx.fill();
  }

  function toggleStartIntervalButtonsActive(interval) {
    $.each($(".start-interval-btn"), function(index, value) {
      if ($(value).text() === interval) {
        $(value).addClass("active");
      } else {
        $(value).removeClass("active");
      }
    });
  }

  function updateFavicon(percent, prevPercent) {
    var percentTensDigit = Math.floor(percent / 10);
    // don't update DOM if same ten
    if (percentTensDigit === Math.floor(prevPercent / 10)) return;

    $("link[sizes='32x32']").attr('href', '/img/favicon-32x32-' + percentTensDigit + '0pct.png');
    $("link[sizes='16x16']").attr('href', '/img/favicon-16x16-' + percentTensDigit + '0pct.png');
  }

  function resetDefaultFavicon() {
    $("link[sizes='32x32']").attr('href', '/img/favicon-32x32.png');
    $("link[sizes='16x16']").attr('href', '/img/favicon-16x16.png');
  }

  function toggleStartPauseDisabled(setStartDisabled) {
    $("#startTimer").prop("disabled", setStartDisabled);
    $("#pauseTimer").prop("disabled", !setStartDisabled);
  }
  
  // HELPER FUNCTIONS end

});

