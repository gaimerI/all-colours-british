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

function calculateCriticalHit() {
    return Math.random() < 0.1 ? 1.5 : 1; // 10% chance of critical hit
}

function applyStatusEffects(creature) {
    if (creature.status === 'burn') {
        creature.hp -= 2; // Burn deals passive damage
        logMessage(`${creature.name} is hurt by burn!`);
    } else if (creature.status === 'paralyze' && Math.random() < 0.25) {
        logMessage(`${creature.name} is paralyzed and can't move!`);
        return false; // Skip turn
    }
    return true;
}

function updateUI() {
    // Update Player Info
    document.getElementById('player-name').innerText = `Name: ${playerCreature.name}`;
    document.getElementById('player-hp').innerText = `HP: ${playerCreature.hp}`;
    const playerAttacksDiv = document.getElementById('player-attacks');
    playerAttacksDiv.innerHTML = ''; // Clear existing attacks

    playerCreature.attacks.forEach(attack => {
        const button = document.createElement('button');
        const effectiveness = calculateTypeEffectiveness(attack.type, enemyCreature.type);
        button.innerText = `${attack.name} (Type: ${attack.type}${attack.damage ? `, Damage: ${attack.damage}, Effectiveness: ${effectiveness}x` : ''})`;
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

function endGame(message) {
    logMessage(message);
    const replayButton = document.createElement('button');
    replayButton.innerText = 'Play Again';
    replayButton.onclick = () => location.reload();
    document.getElementById('battle-log').appendChild(replayButton);
}

// Battle logic
function attackEnemy(attack) {
    if (enemyCreature.hp <= 0) {
        logMessage('Enemy is already defeated!');
        return;
    }

    if (attack.effect) {
        // Status moves
        if (attack.effect === 'heal') {
            const healAmount = Math.min(attack.value, playerCreature.maxHp - playerCreature.hp);
            playerCreature.hp += healAmount;
            logMessage(`${playerCreature.name} used ${attack.name} and healed ${healAmount} HP!`);
        } else if (attack.effect === 'boost') {
            playerCreature.attackBoost = (playerCreature.attackBoost || 1) + attack.value;
            logMessage(`${playerCreature.name} used ${attack.name} and boosted their attack!`);
        } else if (attack.effect === 'lowerAttack') {
            enemyCreature.attackBoost = (enemyCreature.attackBoost || 1) - attack.value;
            logMessage(`${playerCreature.name} used ${attack.name} and lowered ${enemyCreature.name}'s attack!`);
        } else if (attack.effect === 'status') {
            enemyCreature.status = attack.value;
            logMessage(`${enemyCreature.name} is now ${attack.value}!`);
        }
    } else {
        // Normal damage moves
        const isCritical = calculateCriticalHit();
        const effectiveness = calculateTypeEffectiveness(attack.type, enemyCreature.type);
        const damageDealt = attack.damage * effectiveness * isCritical * (playerCreature.attackBoost || 1);

        enemyCreature.hp -= damageDealt;
        logMessage(`${playerCreature.name} used ${attack.name}! ${isCritical > 1 ? "Critical hit! " : ""}${effectiveness > 1 ? "Super effective!" : effectiveness < 1 ? "Not very effective." : ""} It dealt ${damageDealt.toFixed(1)} damage!`);
    }

    // Check if enemy is defeated
    if (enemyCreature.hp <= 0) {
        logMessage(`${enemyCreature.name} is defeated! You win!`);
        endGame('Victory!');
        return;
    }

    // Enemy counterattacks
    if (!applyStatusEffects(enemyCreature)) {
        updateUI();
        return;
    }

    const enemyAttack = enemyCreature.attacks[Math.floor(Math.random() * enemyCreature.attacks.length)];
    const enemyEffectiveness = calculateTypeEffectiveness(enemyAttack.type, playerCreature.type);
    const enemyIsCritical = calculateCriticalHit();
    const enemyDamageDealt = enemyAttack.damage * enemyEffectiveness * enemyIsCritical * (enemyCreature.attackBoost || 1);

    playerCreature.hp -= enemyDamageDealt;
    logMessage(`${enemyCreature.name} used ${enemyAttack.name}! ${enemyIsCritical > 1 ? "Critical hit! " : ""}${enemyEffectiveness > 1 ? "Super effective!" : enemyEffectiveness < 1 ? "Not very effective." : ""} It dealt ${enemyDamageDealt.toFixed(1)} damage!`);

    // Check if player is defeated
    if (playerCreature.hp <= 0) {
        logMessage(`${playerCreature.name} is defeated! You lose!`);
        endGame('Defeat!');
        return;
    }

    updateUI();
}

// Initialize game
async function initGame() {
    const creatures = await fetchCreatureData();
    playerCreature = creatures[0]; // Assume player gets the first creature
    enemyCreature = creatures[2];  // Assume enemy gets the second creature

    // Add max HP for healing logic
    playerCreature.maxHp = playerCreature.hp;
    enemyCreature.maxHp = enemyCreature.hp;

    logMessage('Game started!');
    updateUI();
}

initGame();
