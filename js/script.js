$(function() {
  // HELPER FUNCTIONS start
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

  // GLOBAL VARIABLES start
  var timerRunning = false;
  var defaultTimeSeconds = 1 * 60;
  var currentTime = defaultTimeSeconds;
  
  var currentTimer;
  // GLOBAL VARIABLES end

  function countdownTimer() {
    return setInterval(function() {
      currentTime--;
      updateTimeDisplayed(currentTime);
    }, 1000);
  }

  // EVENT LISTENERS start
  $("#backTimer").click(function() {
    clearInterval(currentTimer);
    $("#toggleTimer i").removeClass("fa-pause").addClass("fa-play");
    timerRunning = false;
    currentTime = defaultTimeSeconds;
    updateTimeDisplayed(currentTime);
  });

  $("#toggleTimer").click(function() {
    $("#toggleTimer i")
      .toggleClass("fa-play", timerRunning)
      .toggleClass("fa-pause", !timerRunning);

    if (timerRunning) {
      // pause
      clearInterval(currentTimer);
    } else {
      // start
      currentTimer = countdownTimer(defaultTimeSeconds);
    }

    timerRunning = !timerRunning;
  });
  // EVENT LISTENERS end
});

