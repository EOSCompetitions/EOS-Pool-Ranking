// State Management
let players = JSON.parse(localStorage.getItem('poolLeaguePlayers')) || [];
let currentUser = localStorage.getItem('poolLeagueCurrentUser') || null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI on page load
  updateDropdowns();
  updateLeaderboard();
  checkLockedUserStatus();

  // Handle Player Registration
  const addPlayerForm = document.getElementById('add-player-form');
  addPlayerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (currentUser) {
      alert("You have already joined the league on this device!");
      return;
    }

    const input = document.getElementById('player-name-input');
    const name = input.value.trim();

    if (!name) return;

    // Duplicate check
    const nameExists = players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      alert("A player with this name is already in the league!");
      return;
    }

    // Create player object with standard base Elo (1000)
    const newPlayer = {
      name: name,
      points: 1000,
      wins: 0,
      losses: 0
    };

    players.push(newPlayer);
    saveData();

    // Lock session identity to this name
    currentUser = name;
    localStorage.setItem('poolLeagueCurrentUser', currentUser);

    // Refresh UI
    lockPlayerInput(currentUser);
    updateDropdowns();
    updateLeaderboard();
  });
});

// Refresh dropdown lists with current players
function updateDropdowns() {
  const winnerSelect = document.getElementById('winner-select');
  const loserSelect = document.getElementById('loser-select');

  winnerSelect.innerHTML = '<option value="">Select Winner</option>';
  loserSelect.innerHTML = '<option value="">Select Loser</option>';

  players.forEach((player) => {
    winnerSelect.add(new Option(player.name, player.name));
    loserSelect.add(new Option(player.name, player.name));
  });
}

// Render dynamic rankings table sorted by points
function updateLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) return;

  leaderboardBody.innerHTML = '';

  // Sort descending by points
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  sortedPlayers.forEach((player, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHTML(player.name)}</td>
      <td>${Math.round(player.points)}</td>
      <td>${player.wins}/${player.losses}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

// Lock input field if user has already joined
function checkLockedUserStatus() {
  if (currentUser) {
    lockPlayerInput(currentUser);
  }
}

function lockPlayerInput(name) {
  const input = document.getElementById('player-name-input');
  const button = document.getElementById('add-player-btn');

  if (input && button) {
    input.value = name;
    input.disabled = true;
    button.disabled = true;
    button.textContent = "Joined";
  }
}

// Persist data locally
function saveData() {
  localStorage.setItem('poolLeaguePlayers', JSON.stringify(players));
}

// Helper to prevent script injection in player names
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}