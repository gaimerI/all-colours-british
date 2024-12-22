// Type effectiveness table
const typeEffectiveness = {
    fire: { grass: 2, water: 0.5, fire: 0.5, electric: 1 },
    water: { fire: 2, grass: 0.5, water: 0.5, electric: 1 },
    electric: { water: 2, grass: 1, electric: 0.5, fire: 1 },
    grass: { water: 2, fire: 0.5, grass: 0.5, electric: 1 },
    normal: { fire: 1, water: 1, electric: 1, grass: 1 },
    psychic: { fire: 1, water: 1, electric: 1, grass: 1 },
    steel: { fire: 0.5, water: 1, electric: 1, grass: 1 }
};

// Fetch creature data
async function fetchCreatureData() {
    const response = await fetch('stats.json');
    return await response.json();
}

// Game state
let playerCreature = null;
let enemyCreature = null;

// Helper functions
function calculateTypeEffectiveness(attackType, targetType) {
    return typeEffectiveness[attackType]?.[targetType] || 1;
}

function updateUI() {
    // Update Player Info
    document.getElementById('player-name').innerText = `Name: ${playerCreature.name}`;
    document.getElementById('player-hp').innerText = `HP: ${playerCreature.hp}`;
    const playerAttacksDiv = document.getElementById('player-attacks');
    playerAttacksDiv.innerHTML = ''; // Clear existing attacks

    playerCreature.attacks.forEach(attack => {
        const button = document.createElement('button');
        button.innerText = `${attack.name} (Damage: ${attack.damage}, Type: ${attack.type})`;
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

    // Calculate effectiveness
    const effectiveness = calculateTypeEffectiveness(attack.type, enemyCreature.type);
    const damageDealt = attack.damage * effectiveness;

    // Player attacks enemy
    enemyCreature.hp -= damageDealt;
    logMessage(`${playerCreature.name} used ${attack.name}! It's ${effectiveness > 1 ? "super effective" : effectiveness < 1 ? "not very effective" : "normal"}! It dealt ${damageDealt.toFixed(1)} damage!`);

    // Check if enemy is defeated
    if (enemyCreature.hp <= 0) {
        logMessage(`${enemyCreature.name} is defeated! You win!`);
        updateUI();
        return;
    }

    // Enemy counterattacks
    const enemyAttack = enemyCreature.attacks[Math.floor(Math.random() * enemyCreature.attacks.length)];
    const enemyEffectiveness = calculateTypeEffectiveness(enemyAttack.type, playerCreature.type);
    const enemyDamageDealt = enemyAttack.damage * enemyEffectiveness;

    playerCreature.hp -= enemyDamageDealt;
    logMessage(`${enemyCreature.name} used ${enemyAttack.name}! It's ${enemyEffectiveness > 1 ? "super effective" : enemyEffectiveness < 1 ? "not very effective" : "normal"}! It dealt ${enemyDamageDealt.toFixed(1)} damage!`);

    // Check if player is defeated
    if (playerCreature.hp <= 0) {
        logMessage(`${playerCreature.name} is defeated! You lose!`);
    }

    updateUI();
}

// Initialize game
async function initGame() {
    const creatures = await fetchCreatureData();
    playerCreature = creatures[2]; // Assume player gets the first creature
    enemyCreature = creatures[1];  // Assume enemy gets the second creature

    logMessage('Game started!');
    updateUI();
}

initGame();
