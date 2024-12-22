// Fetch creature data
async function fetchCreatureData() {
    const response = await fetch('stats.json');
    return await response.json();
}

// Game state
let playerCreature = null;
let enemyCreature = null;

// Helper functions
function updateUI() {
    // Update Player Info
    document.getElementById('player-name').innerText = `Name: ${playerCreature.name}`;
    document.getElementById('player-hp').innerText = `HP: ${playerCreature.hp}`;
    const playerAttacksDiv = document.getElementById('player-attacks');
    playerAttacksDiv.innerHTML = ''; // Clear existing attacks

    playerCreature.attacks.forEach(attack => {
        const button = document.createElement('button');
        button.innerText = `${attack.name} (Damage: ${attack.damage})`;
        button.onclick = () => attackEnemy(attack);
        playerAttacksDiv.appendChild(button);
    });

    // Update Enemy Info
    document.getElementById('enemy-name').innerText = `Name: ${enemyCreature.name}`;
    document.getElementById('enemy-hp').innerText = `HP: ${enemyCreature.hp}`;
}

function logMessage(message) {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('p');
    entry.innerText = message;
    log.appendChild(entry);
}

// Battle logic
function attackEnemy(attack) {
    if (enemyCreature.hp <= 0) {
        logMessage('Enemy is already defeated!');
        return;
    }

    // Player attacks enemy
    enemyCreature.hp -= attack.damage;
    logMessage(`${playerCreature.name} used ${attack.name}! It dealt ${attack.damage} damage!`);

    // Check if enemy is defeated
    if (enemyCreature.hp <= 0) {
        logMessage(`${enemyCreature.name} is defeated! You win!`);
        updateUI();
        return;
    }

    // Enemy counterattacks
    const enemyAttack = enemyCreature.attacks[Math.floor(Math.random() * enemyCreature.attacks.length)];
    playerCreature.hp -= enemyAttack.damage;
    logMessage(`${enemyCreature.name} used ${enemyAttack.name}! It dealt ${enemyAttack.damage} damage!`);

    // Check if player is defeated
    if (playerCreature.hp <= 0) {
        logMessage(`${playerCreature.name} is defeated! You lose!`);
    }

    updateUI();
}

// Initialize game
async function initGame() {
    const creatures = await fetchCreatureData();
    playerCreature = creatures[0]; // Assume player gets the first creature
    enemyCreature = creatures[1];  // Assume enemy gets the second creature

    logMessage('Game started!');
    updateUI();
}

initGame();
