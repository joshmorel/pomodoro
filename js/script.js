$(function() {

  // GLOBAL VARIABLES start
  var timerRunning = false;
  var pomodorosBeforeLong = 4;
  var completedPomodoros = 0;
  var segmentDurationSeconds = {
    "Pomodoro": 15,
    "Short Break": 5,
    "Long Break": 10
  }
  var currentSegment = "Pomodoro";
  var lastSegment;
  var countdownSeconds = segmentDurationSeconds[currentSegment];
  var countdownTimer;
  var elapsedSeconds = segmentDurationSeconds[currentSegment];
  var elapsedTimer;
  // GLOBAL VARIABLES end

  updateCountdownDisplay(countdownSeconds, currentSegment);
  Notification.requestPermission();

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
    timerRunning = false;
    $("#startTimer").prop("disabled", false);
    $("#pauseTimer").prop("disabled", true);
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
    countdownSeconds = segmentDurationSeconds[currentSegment];
    $("h1").text(currentSegment);
    updateCountdownDisplay(countdownSeconds, currentSegment);

    $("#elapsed").css("display", "block");
    updateElapsedDisplay(elapsedSeconds, lastSegment);
    elapsedTimer = countElapsed(elapsedSeconds);
  }

  // EVENT LISTENERS start
  $("#resetTimer").click(function() {
    clearInterval(countdownTimer);
    timerRunning = false;
    countdownSeconds = segmentDurationSeconds[currentSegment];
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

