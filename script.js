const gameState = {
  points: 0,
  baseGain: 1,
  multiplier: 1,
  upgradeCost: 10,
  lastTime: Date.now(),
  running: false,
  prestigeUnlocked: false,
  prestigeActive: false
};

// Main game loop
function gameLoop() {
  if (!gameState.running) return;
  const now = Date.now();
  const delta = now - gameState.lastTime;
  gameState.lastTime = now;

  // You can use delta if you add auto gain features later
  updateUI();
  requestAnimationFrame(gameLoop);
}

function updateUI() {
  $("#points").text(`Points: ${Math.floor(gameState.points)}`);
  $("#upgrade").text(`Upgrade (Cost: ${Math.floor(gameState.upgradeCost)})`);

  // Unlock prestige at 1000 points
  if (gameState.points >= 1000 && !gameState.prestigeUnlocked) {
    $("#prestige").removeClass("disabled").text("Prestige (Available!)");
    gameState.prestigeUnlocked = true;
  }
}

// --- Buttons ---
$("#start").click(() => {
  if (!gameState.running) {
    gameState.running = true;
    gameState.lastTime = Date.now();
    gameLoop();
  }
});

$("#stop").click(() => {
  gameState.running = false;
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
    updateUI();
  }
});

// Default selected multiplier
$("#x1").addClass("active");

updateUI();