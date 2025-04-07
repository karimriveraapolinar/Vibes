const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 300;
canvas.height = 600;

// Game constants
const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;

// Game state
let score = 0;
let gameOver = false;
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;

// Add wave motion variables after game state
let waveOffset = 0;
let waveSpeed = 0.02;
let waveAmplitude = 5;

// Add after game state variables
const keyState = {
    left: false,
    right: false,
    down: false,
    up: false
};

// Add key repeat delay and interval
const KEY_REPEAT_DELAY = 170; // Initial delay before repeat starts
const KEY_REPEAT_INTERVAL = 50; // Interval between repeated actions
let keyRepeatTimers = {
    left: null,
    right: null,
    down: null,
    up: null
};

// Particle system
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
        this.size *= 0.95;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

let particles = [];
let screenShake = 0;

// Tetromino shapes
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// Add after canvas setup
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');

// Add after game state variables
let nextPiece = null;

// Add after game constants
const COLORS = [
    '#FF0D72', '#0DC2FF', '#0DFF72',
    '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
];

// Add after game constants
let pieceStyle = 'classic';
let customColors = [...COLORS];

// Add piece style functions
function updatePieceStyle(style) {
    pieceStyle = style;
}

function updatePieceColor(index, color) {
    customColors[index] = color;
}

// Modify drawBlock function to handle different styles
function drawBlock(x, y, color) {
    ctx.save();
    
    // Draw block with style first
    switch(pieceStyle) {
        case 'classic':
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            break;
            
        case 'modern':
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            // Add gradient effect
            const gradient = ctx.createLinearGradient(
                x * BLOCK_SIZE,
                y * BLOCK_SIZE,
                (x + 1) * BLOCK_SIZE,
                (y + 1) * BLOCK_SIZE
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            break;
            
        case 'neon':
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            // Add glow effect
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, 4, 4);
            break;
    }
    
    // Add visible glow outline
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    ctx.shadowBlur = 0;
    
    ctx.restore();
}

// Modify createPiece function to use custom colors
function createPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = customColors[Math.floor(Math.random() * customColors.length)];
    return { shape, color };
}

// Add function to get next piece
function getNextPiece() {
    if (!nextPiece) {
        nextPiece = createPiece();
    }
    const current = nextPiece;
    nextPiece = createPiece();
    return current;
}

// Modify drawHeldPiece function to use custom colors
function drawHeldPiece() {
    holdCtx.fillStyle = '#000';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    
    if (heldPiece) {
        const blockSize = 30;
        const offsetX = (holdCanvas.width - heldPiece.shape[0].length * blockSize) / 2;
        const offsetY = (holdCanvas.height - heldPiece.shape.length * blockSize) / 2;
        
        heldPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    holdCtx.fillStyle = heldPiece.color;
                    holdCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
}

// Modify drawUpcomingPieces function to use custom colors
function drawUpcomingPieces() {
    previewCtx.fillStyle = '#000';
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    if (nextPiece) {
        const blockSize = 30;
        const offsetX = (previewCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (previewCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    previewCtx.fillStyle = nextPiece.color;
                    previewCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
}

// Draw functions
function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                let drawX = x;
                let drawY = y;
                
                if (isShaking) {
                    // Add random movement during shake
                    drawX += (Math.random() - 0.5) * shakeIntensity;
                    drawY += (Math.random() - 0.5) * shakeIntensity;
                }
                
                drawBlock(drawX, drawY, board[y][x]);
            }
        }
    }
}

// Add after game state variables
let heldPiece = null;
let canHold = true;
let level = 1;
let combo = 0;
let lastClearWasDifficult = false;
let lastClearWasTspin = false;
let lastClearWasTetris = false;
let softDropScore = 0;
let hardDropScore = 0;
let stack = 0;
let lastClearWasStack = false;

// Add after game state variables
let lastRandomizeTime = 0;
const RANDOMIZE_INTERVAL = 30000; // 30 seconds in milliseconds

// Add grid drawing function after drawBlock function
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

// Modify drawPiece function to show held piece
function drawPiece() {
    if (!currentPiece) return;
    
    // Draw held piece preview
    if (heldPiece) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        heldPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x + COLS + 1, y + 2, heldPiece.color);
                }
            });
        });
        ctx.restore();
    }
    
    // Draw current piece
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(currentPieceX + x, currentPieceY + y, currentPiece.color);
            }
        });
    });
}

// Add after drawPiece function
function drawGhostPiece() {
    if (!currentPiece) return;
    
    // Find the landing position
    let ghostY = currentPieceY;
    while (!checkCollisionAt(currentPieceX, ghostY + 1)) {
        ghostY++;
    }
    
    // Draw ghost piece
    ctx.save();
    ctx.globalAlpha = 0.2;
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(currentPieceX + x, ghostY + y, currentPiece.color);
            }
        });
    });
    ctx.restore();
}

// Add helper function for ghost piece collision check
function checkCollisionAt(x, y) {
    return currentPiece.shape.some((row, dy) =>
        row.some((value, dx) => {
            if (!value) return false;
            const newX = x + dx;
            const newY = y + dy;
            return newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX];
        })
    );
}

// Add after game state variables
let lockDelay = 0;
const LOCK_DELAY_FRAMES = 30; // Half a second at 60fps
let isLocking = false;
let lastMoveTime = 0;
const MOVE_RESET_DELAY = 500; // 500ms to reset lock delay after movement

// Modify moveDown function
function moveDown() {
    currentPieceY++;
    softDropScore++;
    lastMoveTime = Date.now();
    
    if (checkCollision()) {
        currentPieceY--;
        if (!keyState.down) {
            // Place piece immediately if not using down key
            mergePiece();
            clearLines();
            currentPiece = getNextPiece();
            currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentPieceY = 0;
            if (checkCollision()) {
                gameOver = true;
            }
        } else {
            // Start lock delay if using down key
            isLocking = true;
            lockDelay = LOCK_DELAY_FRAMES;
        }
    } else {
        isLocking = false;
        lockDelay = 0;
    }
}

// Modify moveLeft function
function moveLeft() {
    currentPieceX--;
    lastMoveTime = Date.now();
    if (checkCollision()) {
        currentPieceX++;
    }
}

// Modify moveRight function
function moveRight() {
    currentPieceX++;
    lastMoveTime = Date.now();
    if (checkCollision()) {
        currentPieceX--;
    }
}

// Modify rotate function
function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const previousShape = currentPiece.shape;
    const previousX = currentPieceX;
    
    // Try rotation
    currentPiece.shape = rotated;
    lastMoveTime = Date.now();
    
    // Special handling for I-piece
    if (currentPiece.shape.length === 1) { // I-piece
        // Try different offsets for I-piece
        const offsets = [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: -2, y: 0 },
            { x: 2, y: 0 }
        ];
        
        let success = false;
        for (const offset of offsets) {
            currentPieceX += offset.x;
            if (!checkCollision()) {
                success = true;
                break;
            }
            currentPieceX -= offset.x;
        }
        
        if (!success) {
            currentPiece.shape = previousShape;
            currentPieceX = previousX;
            return;
        }
    } else {
        // Regular wall kicks for other pieces
        if (checkCollision()) {
            // Try moving left
            currentPieceX--;
            if (checkCollision()) {
                // Try moving right
                currentPieceX += 2;
                if (checkCollision()) {
                    // Try moving right more
                    currentPieceX++;
                    if (checkCollision()) {
                        // If all kicks fail, revert rotation
                        currentPiece.shape = previousShape;
                        currentPieceX = previousX;
                        return;
                    }
                }
            }
        }
    }
}

// Add after game constants
// Sound effects
const SOUNDS = {
    background: new Audio('citylights.mp3')
};

// Sound manager
const SoundManager = {
    play(soundName) {
        const sound = SOUNDS[soundName];
        if (sound) {
            if (soundName === 'background') {
                sound.loop = true;
                sound.volume = 0.5; // Set background music volume to 50%
            }
            sound.currentTime = 0;
            sound.play().catch(error => console.log('Sound play failed:', error));
        }
    },
    
    stop(soundName) {
        const sound = SOUNDS[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
};

// Modify mergePiece function to remove sound
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPieceY + y][currentPieceX + x] = currentPiece.color;
            }
        });
    });
    canHold = true;
}

// Modify update function to handle lock delay
function update() {
    if (gameOver) {
        // Only update particles and shake effects after game over
        particles = particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        
        if (screenShake > 0) {
            screenShake--;
        }
        
        if (isShaking) {
            shakeDuration -= 16;
            shakeIntensity = (shakeDuration / SHAKE_DURATION) * MAX_SHAKE_INTENSITY;
            
            if (shakeDuration <= 0) {
                isShaking = false;
                shakeIntensity = 0;
            }
        }
        return;
    }
    
    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Update screen shake
    if (screenShake > 0) {
        screenShake--;
    }
    
    // Update shake animation
    if (isShaking) {
        shakeDuration -= 16; // Approximately 60fps
        shakeIntensity = (shakeDuration / SHAKE_DURATION) * MAX_SHAKE_INTENSITY;
        
        if (shakeDuration <= 0) {
            isShaking = false;
            shakeIntensity = 0;
        }
    }
    
    // Handle lock delay only when using down key
    if (isLocking && keyState.down) {
        const timeSinceLastMove = Date.now() - lastMoveTime;
        if (timeSinceLastMove > MOVE_RESET_DELAY) {
            lockDelay--;
            if (lockDelay <= 0) {
                mergePiece();
                clearLines();
                currentPiece = getNextPiece();
                currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
                currentPieceY = 0;
                if (checkCollision()) {
                    gameOver = true;
                }
                isLocking = false;
                lockDelay = 0;
            }
        } else {
            // Reset lock delay if player moved recently
            lockDelay = LOCK_DELAY_FRAMES;
            isLocking = false;
        }
    }
    
    // Check for block randomization only if game is not over
    if (!gameOver) {
        const currentTime = Date.now();
        if (currentTime - lastRandomizeTime >= RANDOMIZE_INTERVAL) {
            console.log('Randomizing blocks...'); // Debug log
            randomizeBlocks();
            lastRandomizeTime = currentTime;
        }
    }
}

// Modify hardDrop function
function hardDrop() {
    let dropDistance = 0;
    while (!checkCollision()) {
        currentPieceY++;
        dropDistance++;
    }
    currentPieceY--;
    hardDropScore += dropDistance * 2;
    mergePiece();
    clearLines();
    currentPiece = getNextPiece();
    currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPieceY = 0;
    if (checkCollision()) {
        gameOver = true;
    }
    isLocking = false;
    lockDelay = 0;
}

// Add hold piece function
function holdPiece() {
    if (!canHold) return;
    
    if (heldPiece === null) {
        heldPiece = currentPiece;
        currentPiece = createPiece();
        currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
        currentPieceY = 0;
    } else {
        const temp = currentPiece;
        currentPiece = heldPiece;
        currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
        currentPieceY = 0;
        heldPiece = temp;
    }
    canHold = false;
}

// Add T-spin detection function
function isTSpin() {
    if (!currentPiece || currentPiece.shape.length !== 3) return false;
    
    // Check if piece is T-shaped
    const isTShape = currentPiece.shape[0].join('') === '111' && 
                    currentPiece.shape[1].join('') === '010' &&
                    currentPiece.shape[2].join('') === '000';
    
    if (!isTShape) return false;
    
    // Count filled spaces around T piece
    let filledSpaces = 0;
    const x = currentPieceX;
    const y = currentPieceY;
    
    // Check spaces around T piece
    if (board[y][x] || board[y][x + 1] || board[y][x + 2]) filledSpaces++;
    if (board[y + 1][x] || board[y + 1][x + 2]) filledSpaces++;
    if (board[y + 2][x] || board[y + 2][x + 1] || board[y + 2][x + 2]) filledSpaces++;
    
    return filledSpaces >= 3;
}

// Add function to check if clear is difficult
function isDifficultClear(linesCleared) {
    return isTSpin() || linesCleared === 4; // Tetris or T-spin
}

// Add function to check if clear is a stack
function isStack(linesCleared) {
    // A stack is when you clear lines with gaps between them
    let hasGap = false;
    let lastLine = -1;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            if (lastLine !== -1 && lastLine - y > 1) {
                hasGap = true;
                break;
            }
            lastLine = y;
        }
    }
    
    return hasGap && linesCleared >= 2;
}

// Modify clearLines function to remove sound
function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        let baseScore = 0;
        const isDifficult = isDifficultClear(linesCleared);
        const isTspin = isTSpin();
        const isStackClear = isStack(linesCleared);
        
        // Calculate base score
        switch(linesCleared) {
            case 1:
                baseScore = isTspin ? 800 : 100;
                break;
            case 2:
                baseScore = isTspin ? 1200 : 300;
                break;
            case 3:
                baseScore = isTspin ? 1600 : 500;
                break;
            case 4:
                baseScore = 800; // Tetris
                break;
        }
        
        // Apply level multiplier
        baseScore *= level;
        
        // Apply back-to-back bonus
        if (lastClearWasDifficult && isDifficult) {
            baseScore *= 1.5;
        }
        
        // Apply stack bonus
        if (isStackClear) {
            stack++;
            baseScore *= (1 + stack * 0.2); // 20% bonus per stack level
            lastClearWasStack = true;
        } else {
            stack = 0;
            lastClearWasStack = false;
        }
        
        // Apply combo bonus
        combo++;
        baseScore += 50 * combo * level;
        
        // Update score
        score += baseScore;
        
        // Update score display
        document.getElementById('scoreValue').textContent = score;
        document.getElementById('levelValue').textContent = level;
        document.getElementById('comboValue').textContent = combo;
        document.getElementById('stackValue').textContent = stack;
        
        // Update state
        lastClearWasDifficult = isDifficult;
        lastClearWasTspin = isTspin;
        lastClearWasTetris = linesCleared === 4;
        
        // Create particles and screen shake
        createParticles(linesCleared);
        screenShake = 5;
        
        // Update level every 10 lines
        if (score >= level * 1000) {
            level++;
        }
    } else {
        combo = 0;
        stack = 0;
    }
}

function createParticles(linesCleared) {
    for (let i = 0; i < linesCleared * 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        particles.push(new Particle(x, y, color));
    }
}

// Add after game state variables
let isShaking = false;
let shakeOffset = { x: 0, y: 0 };
let shakeIntensity = 0;
let shakeDuration = 0;
const SHAKE_DURATION = 1000; // 1 second shake
const MAX_SHAKE_INTENSITY = 20;

// Add checkCollision function
function checkCollision() {
    return currentPiece.shape.some((row, y) =>
        row.some((value, x) => {
            if (!value) return false;
            const newX = currentPieceX + x;
            const newY = currentPieceY + y;
            return newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX];
        })
    );
}

// Add helper function to check how many blocks are adjacent to a position
function getAdjacentBlocks(x, y) {
    let count = 0;
    const directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
    ];
    
    for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;
        if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS && board[newY][newX]) {
            count++;
        }
    }
    return count;
}

// Modify randomizeBlocks function to remove sound
function randomizeBlocks() {
    // Store current pieces and their positions
    const pieces = [];
    let totalBlocks = 0;
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                pieces.push({
                    x: x,
                    y: y,
                    color: board[y][x]
                });
                totalBlocks++;
                board[y][x] = 0; // Clear the board
            }
        }
    }
    
    // Start shaking animation
    isShaking = true;
    shakeDuration = SHAKE_DURATION;
    shakeIntensity = MAX_SHAKE_INTENSITY;
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = pieces[Math.floor(Math.random() * pieces.length)].color;
        particles.push(new Particle(x, y, color));
    }
    
    // Randomize final positions
    setTimeout(() => {
        // Shuffle pieces array
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        
        // Place pieces in new random positions
        pieces.forEach(piece => {
            let bestX = 0, bestY = 0;
            let bestScore = Infinity;
            let attempts = 0;
            const maxAttempts = 100; // Prevent infinite loop
            
            // Try to find the best position
            while (attempts < maxAttempts) {
                let newX = Math.floor(Math.random() * COLS);
                let newY;
                
                // 60% chance to place in lower half (reduced from 70%)
                if (Math.random() < 0.6) {
                    // Place in lower half, but not in top 5 rows
                    newY = Math.floor(Math.random() * (ROWS / 2 - 5)) + (ROWS / 2);
                } else {
                    // Place anywhere, but not in top 5 rows
                    newY = Math.floor(Math.random() * (ROWS - 5)) + 5;
                }
                
                if (!board[newY][newX]) {
                    // Calculate score based on adjacent blocks (inverse scoring)
                    const adjacentCount = getAdjacentBlocks(newX, newY);
                    const score = adjacentCount + (Math.random() * 0.5); // Add some randomness
                    
                    // Update best position if this one has fewer adjacent blocks
                    if (score < bestScore) {
                        bestScore = score;
                        bestX = newX;
                        bestY = newY;
                    }
                }
                
                attempts++;
            }
            
            // Place piece in the best position found
            board[bestY][bestX] = piece.color;
        });
        
        // Ensure there's space for the current piece
        if (checkCollision()) {
            // Clear the top few rows to make space
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < COLS; x++) {
                    board[y][x] = 0;
                }
            }
        }
        
        // Verify the number of blocks matches
        let currentBlocks = 0;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x]) currentBlocks++;
            }
        }
        
        // If blocks don't match, try to fix it
        if (currentBlocks !== totalBlocks) {
            console.log('Block count mismatch, fixing...');
            // Clear the board and try again
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    board[y][x] = 0;
                }
            }
            // Place pieces again
            pieces.forEach(piece => {
                let placed = false;
                let attempts = 0;
                while (!placed && attempts < 100) {
                    const x = Math.floor(Math.random() * COLS);
                    const y = Math.floor(Math.random() * (ROWS - 5)) + 5;
                    if (!board[y][x]) {
                        board[y][x] = piece.color;
                        placed = true;
                    }
                    attempts++;
                }
            });
        }
        
        isShaking = false;
        shakeIntensity = 0;
    }, SHAKE_DURATION);
}

// Modify draw function to handle shake effect
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Apply screen shake and wave motion
    ctx.save();
    if (screenShake > 0) {
        ctx.translate(
            Math.random() * screenShake - screenShake/2,
            Math.random() * screenShake - screenShake/2
        );
    }
    
    // Apply wave motion
    waveOffset += waveSpeed;
    const waveX = Math.sin(waveOffset) * waveAmplitude;
    ctx.translate(waveX, 0);
    
    // Draw game elements with shake effect
    drawBoard();
    drawGhostPiece();
    drawPiece();
    
    // Draw particles
    particles.forEach(particle => particle.draw());
    
    ctx.restore();
    
    // Draw held piece and upcoming pieces
    drawHeldPiece();
    drawUpcomingPieces();
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 60);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 - 20);
        ctx.fillText(`Level: ${level}`, canvas.width/2, canvas.height/2 + 10);
        ctx.fillText('Press R to Restart', canvas.width/2, canvas.height/2 + 50);
    }
}

// Modify keydown event listener to include restart
document.addEventListener('keydown', (e) => {
    if (gameOver) {
        if (e.key.toLowerCase() === 'r') {
            restartGame();
        }
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            if (!keyState.left) {
                keyState.left = true;
                moveLeft();
                keyRepeatTimers.left = setTimeout(() => {
                    const repeatInterval = setInterval(moveLeft, KEY_REPEAT_INTERVAL);
                    keyRepeatTimers.left = repeatInterval;
                }, KEY_REPEAT_DELAY);
            }
            break;
        case 'ArrowRight':
            if (!keyState.right) {
                keyState.right = true;
                moveRight();
                keyRepeatTimers.right = setTimeout(() => {
                    const repeatInterval = setInterval(moveRight, KEY_REPEAT_INTERVAL);
                    keyRepeatTimers.right = repeatInterval;
                }, KEY_REPEAT_DELAY);
            }
            break;
        case 'ArrowDown':
            if (!keyState.down) {
                keyState.down = true;
                moveDown();
                keyRepeatTimers.down = setTimeout(() => {
                    const repeatInterval = setInterval(moveDown, KEY_REPEAT_INTERVAL);
                    keyRepeatTimers.down = repeatInterval;
                }, KEY_REPEAT_DELAY);
            }
            break;
        case 'ArrowUp':
            if (!keyState.up) {
                keyState.up = true;
                rotate();
                keyRepeatTimers.up = setTimeout(() => {
                    const repeatInterval = setInterval(rotate, KEY_REPEAT_INTERVAL);
                    keyRepeatTimers.up = repeatInterval;
                }, KEY_REPEAT_DELAY);
            }
            break;
        case ' ':
            hardDrop();
            break;
        case 'c':
        case 'C':
            holdPiece();
            break;
    }
});

// Modify keyup event listener
document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            keyState.left = false;
            if (keyRepeatTimers.left) {
                clearTimeout(keyRepeatTimers.left);
                clearInterval(keyRepeatTimers.left);
                keyRepeatTimers.left = null;
            }
            break;
        case 'ArrowRight':
            keyState.right = false;
            if (keyRepeatTimers.right) {
                clearTimeout(keyRepeatTimers.right);
                clearInterval(keyRepeatTimers.right);
                keyRepeatTimers.right = null;
            }
            break;
        case 'ArrowDown':
            keyState.down = false;
            if (keyRepeatTimers.down) {
                clearTimeout(keyRepeatTimers.down);
                clearInterval(keyRepeatTimers.down);
                keyRepeatTimers.down = null;
            }
            // Place piece when down key is released
            if (isLocking) {
                mergePiece();
                clearLines();
                currentPiece = getNextPiece();
                currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
                currentPieceY = 0;
                if (checkCollision()) {
                    gameOver = true;
                }
                isLocking = false;
                lockDelay = 0;
            }
            break;
        case 'ArrowUp':
            keyState.up = false;
            if (keyRepeatTimers.up) {
                clearTimeout(keyRepeatTimers.up);
                clearInterval(keyRepeatTimers.up);
                keyRepeatTimers.up = null;
            }
            break;
    }
});

// Start game with background music
currentPiece = createPiece();
currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
lastRandomizeTime = Date.now(); // Initialize the randomization timer
setInterval(moveDown, 1000);
SoundManager.play('background'); // Start background music
gameLoop();

// Modify restartGame function to start background music
function restartGame() {
    score = 0;
    level = 1;
    combo = 0;
    stack = 0;
    lastClearWasDifficult = false;
    lastClearWasTspin = false;
    lastClearWasTetris = false;
    lastClearWasStack = false;
    softDropScore = 0;
    hardDropScore = 0;
    gameOver = false;
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    lastRandomizeTime = Date.now();
    isShaking = false;
    shakeIntensity = 0;
    shakeDuration = 0;
    
    // Update score display
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('levelValue').textContent = level;
    document.getElementById('comboValue').textContent = combo;
    document.getElementById('stackValue').textContent = stack;
    
    particles = [];
    screenShake = 0;
    nextPiece = createPiece();
    currentPiece = getNextPiece();
    currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPieceY = 0;
    heldPiece = null;
    canHold = true;
    
    // Start background music
    SoundManager.play('background');
}

// Initialize next piece at game start
nextPiece = createPiece();

// Make functions available to HTML
window.updatePieceStyle = updatePieceStyle;
window.updatePieceColor = updatePieceColor;

// Add gameLoop function
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
} 