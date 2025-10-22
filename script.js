const gameState = {
  points: 0,
  baseGain: 1,
  multiplier: 1,
  upgradeCost: 10,
  lastTime: Date.now(),
  running: false,
  prestigeUnlocked: false,
  prestigeActive: false,
  gameTime: 0,
  startTime: null
};

// Main game loop
function gameLoop() {
  if (!gameState.running) return;
  const now = Date.now();
  const delta = now - gameState.lastTime;
  gameState.lastTime = now;

  // Update game time
  gameState.gameTime += delta / 1000; // Convert to seconds

  // You can use delta if you add auto gain features later
  updateUI();
  requestAnimationFrame(gameLoop);
}

// Format time in YY:MM:dd h:m:s, showing only relevant units
function formatTime(seconds) {
  const years = Math.floor(seconds / (365 * 24 * 60 * 60));
  const days = Math.floor((seconds % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  let timeStr = '';
  if (years > 0) timeStr += `${years}:`;
  if (days > 0 || years > 0) timeStr += `${days.toString().padStart(2, '0')}:`;
  if (hours > 0 || days > 0 || years > 0) timeStr += `${hours.toString().padStart(2, '0')}:`;
  timeStr += `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return timeStr;
}

function updateUI() {
  $("#points").text(`Points: ${Math.floor(gameState.points)}`);
  $("#upgrade").text(`Upgrade (Cost: ${Math.floor(gameState.upgradeCost)})`);

  // Update game time display
  const timeStr = formatTime(gameState.gameTime);
  $("#game-time").text(timeStr);

  // Unlock prestige at 1000 points
  if (gameState.points >= 1000 && !gameState.prestigeUnlocked) {
    $("#prestige").removeClass("disabled").text("Prestige (Available!)");
    gameState.prestigeUnlocked = true;
  }
}

// --- Buttons ---
$("#pause-restart").click(() => {
  if (gameState.running) {
    gameState.running = false;
    $("#pause-restart").text("▶️"); // Play icon when paused
  } else {
    gameState.running = true;
    gameState.lastTime = Date.now();
    $("#pause-restart").text("⏸️"); // Pause icon when running
    gameLoop();
  }
});

// Tab switching
$(".tab-btn").click(function () {
  const tabId = $(this).data("tab");

  // Update active tab button
  $(".tab-btn").removeClass("active");
  $(this).addClass("active");

  // Update active tab pane
  $(".tab-pane").removeClass("active");
  $(`#${tabId}`).addClass("active");
});

$(".multiplier-btn").click(function () {
  $(".multiplier-btn").removeClass("active");
  $(this).addClass("active");
  gameState.multiplier = parseInt($(this).attr("id").substring(1)); // x1, x2, x4
});

$("#gain").click(() => {
  gameState.points += gameState.baseGain * gameState.multiplier;
  updateUI();
});

$("#upgrade").click(() => {
  if (gameState.points >= gameState.upgradeCost) {
    gameState.points -= gameState.upgradeCost;
    gameState.baseGain *= 2;
    gameState.upgradeCost = Math.floor(gameState.upgradeCost * 1.7);
    updateUI();
  }
});

$("#prestige").click(() => {
  if (!gameState.prestigeUnlocked || gameState.points < 2500) return;
  if (!gameState.prestigeActive) {
    gameState.prestigeActive = true;
    gameState.baseGain *= 2;
    gameState.points = 0;
    gameState.prestigeUnlocked = false;
    gameState.upgradeCost = 10;
    $("#prestige").addClass("disabled").text("Prestige (Done)");

    // Unlock Business tab on first prestige
    if (!$('[data-tab="business"]').hasClass('unlocked')) {
      $('[data-tab="business"]').removeClass('hidden').addClass('unlocked');
    }

    updateUI();
  }
});

// Default selected multiplier
$("#x1").addClass("active");

// Set initial pause-restart state
$("#pause-restart").text("▶️"); // Start with play icon

updateUI();