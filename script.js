/**
 * Block Puzzle Game Logic
 * 
 * Core mechanics:
 * - 10x10 Grid
 * - Drag and Drop Tetrominoes
 * - Line clearing (Rows & Cols)
 * - Score tracking
 */

const BOARD_SIZE = 10;
const boardElement = document.getElementById('board');
const piecesDock = document.getElementById('pieces-dock');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let board = []; // 2D array: null or color string
let score = 0;
let bestScore = localStorage.getItem('blockPuzzleBestScore') || 0;
let draggedPiece = null;
let draggedPieceData = null; // { shape: [[0,1]...], color: '...' }
let startX, startY;
let initialPieceX, initialPieceY;

// Piece Definitions (Standard Tetrominoes + Dominos + Pentominoes)
const PIECES = [
    // --- Size 2 (Dominos) ---
    { shape: [[0, 0], [0, 1]], color: 'var(--color-2)' }, // Horizontal
    { shape: [[0, 0], [1, 0]], color: 'var(--color-2)' }, // Vertical

    // --- Size 3 (Trominoes) - Optional but good for variety ---
    { shape: [[0, 0], [0, 1], [0, 2]], color: 'var(--color-3)' }, // Line 3
    { shape: [[0, 0], [1, 0], [2, 0]], color: 'var(--color-3)' }, // Line 3 Vert
    { shape: [[0, 0], [0, 1], [1, 0]], color: 'var(--color-6)' }, // Corner

    // --- Size 4 (Tetrominoes) ---
    // I Shape
    { shape: [[0, 0], [0, 1], [0, 2], [0, 3]], color: 'var(--color-2)' },
    { shape: [[0, 0], [1, 0], [2, 0], [3, 0]], color: 'var(--color-2)' },
    // O Shape
    { shape: [[0, 0], [0, 1], [1, 0], [1, 1]], color: 'var(--color-5)' },
    // L Shape
    { shape: [[0, 0], [1, 0], [2, 0], [2, 1]], color: 'var(--color-6)' },
    { shape: [[0, 0], [0, 1], [0, 2], [1, 0]], color: 'var(--color-6)' },
    { shape: [[0, 0], [0, 1], [1, 1], [2, 1]], color: 'var(--color-6)' },
    { shape: [[1, 0], [1, 1], [1, 2], [0, 2]], color: 'var(--color-6)' },
    // J Shape
    { shape: [[0, 1], [1, 1], [2, 1], [2, 0]], color: 'var(--color-1)' },
    { shape: [[0, 0], [1, 0], [1, 1], [1, 2]], color: 'var(--color-1)' },
    { shape: [[0, 0], [0, 1], [1, 0], [2, 0]], color: 'var(--color-1)' },
    { shape: [[0, 0], [0, 1], [0, 2], [1, 2]], color: 'var(--color-1)' },
    // T Shape
    { shape: [[0, 0], [0, 1], [0, 2], [1, 1]], color: 'var(--color-7)' },
    { shape: [[1, 0], [1, 1], [1, 2], [0, 1]], color: 'var(--color-7)' },
    { shape: [[0, 0], [1, 0], [2, 0], [1, 1]], color: 'var(--color-7)' },
    { shape: [[0, 1], [1, 1], [2, 1], [1, 0]], color: 'var(--color-7)' },
    // S Shape
    { shape: [[0, 1], [0, 2], [1, 0], [1, 1]], color: 'var(--color-3)' },
    { shape: [[0, 0], [1, 0], [1, 1], [2, 1]], color: 'var(--color-3)' },
    // Z Shape
    { shape: [[0, 0], [0, 1], [1, 1], [1, 2]], color: 'var(--color-4)' },
    { shape: [[0, 1], [1, 1], [1, 0], [2, 0]], color: 'var(--color-4)' },

    // --- Size 5 (Pentominoes) ---
    // I5 (Long Line)
    { shape: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], color: 'var(--color-2)' },
    { shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], color: 'var(--color-2)' },
    // P Shape (Block with tail)
    { shape: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]], color: 'var(--color-5)' },
    { shape: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 1]], color: 'var(--color-5)' },
    // U Shape
    { shape: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]], color: 'var(--color-1)' },
    { shape: [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1]], color: 'var(--color-1)' }, // U rotated
    // X Shape (Plus)
    { shape: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], color: 'var(--color-4)' },
    // V Shape (Corner 3x3)
    { shape: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], color: 'var(--color-6)' },
    // W Shape
    { shape: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]], color: 'var(--color-3)' },
];

// --- Initialization ---

function initGame() {
    score = 0;
    updateScore(0);
    bestScoreElement.textContent = bestScore;
    createBoard();
    spawnPieces();
    gameOverModal.classList.add('hidden');
}

function createBoard() {
    boardElement.innerHTML = '';
    // Board stores objects: { color: string, type: 'normal'|'bomb'|'star' } or null
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            boardElement.appendChild(cell);
        }
    }

    addInitialNoise(5);
}

function addInitialNoise(count) {
    let placed = 0;
    while (placed < count) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[r][c]) {
            const color = '#b2bec3';
            board[r][c] = { color: color, type: 'normal' };

            const cell = getCell(r, c);
            cell.classList.add('filled');
            cell.style.backgroundColor = color;
            placed++;
        }
    }
}

function getCell(r, c) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null;
    return boardElement.children[r * BOARD_SIZE + c];
}

// --- Piece Spawning ---

function spawnPieces() {
    piecesDock.innerHTML = '';

    // Random chance for special piece
    const rand = Math.random();
    // 10% chance for Bomb, 10% chance for Star, 80% Normal
    if (rand < 0.1) {
        createSpecialPiece('bomb');
    } else if (rand < 0.2) {
        createSpecialPiece('star');
    } else {
        createDraggablePiece();
    }
}

function createSpecialPiece(type) {
    const container = document.createElement('div');
    container.classList.add('piece-container');

    const pieceEl = document.createElement('div');
    pieceEl.classList.add('draggable-piece');

    // Special pieces are single blocks 1x1
    pieceEl.style.gridTemplateRows = `1fr`;
    pieceEl.style.gridTemplateColumns = `1fr`;

    const cell = document.createElement('div');
    cell.classList.add('piece-cell');

    let color, shape;
    if (type === 'bomb') {
        color = '#333'; // Dark for bomb
        cell.classList.add('bomb');
        cell.textContent = '💣';
    } else {
        color = '#f1c40f'; // Gold for star
        cell.classList.add('star');
        cell.textContent = '⭐';
    }
    cell.style.backgroundColor = color;
    cell.style.display = 'flex';
    cell.style.justifyContent = 'center';
    cell.style.alignItems = 'center';
    cell.style.fontSize = '1.2rem';

    pieceEl.appendChild(cell);

    // Shape is just [[0,0]]
    shape = [[0, 0]];

    pieceEl.dataset.shape = JSON.stringify(shape);
    pieceEl.dataset.color = color;
    pieceEl.dataset.type = type; // Store type

    pieceEl.addEventListener('pointerdown', handleDragStart);

    container.appendChild(pieceEl);
    piecesDock.appendChild(container);
}

function createDraggablePiece() {
    const pieceData = PIECES[Math.floor(Math.random() * PIECES.length)];
    const container = document.createElement('div');
    container.classList.add('piece-container');

    const pieceEl = document.createElement('div');
    pieceEl.classList.add('draggable-piece');

    let maxR = 0, maxC = 0;
    pieceData.shape.forEach(([r, c]) => {
        maxR = Math.max(maxR, r);
        maxC = Math.max(maxC, c);
    });

    pieceEl.style.gridTemplateRows = `repeat(${maxR + 1}, 1fr)`;
    pieceEl.style.gridTemplateColumns = `repeat(${maxC + 1}, 1fr)`;

    for (let r = 0; r <= maxR; r++) {
        for (let c = 0; c <= maxC; c++) {
            const cell = document.createElement('div');
            const isFilled = pieceData.shape.some(([pr, pc]) => pr === r && pc === c);
            if (isFilled) {
                cell.classList.add('piece-cell');
                cell.style.backgroundColor = pieceData.color;
            }
            pieceEl.appendChild(cell);
        }
    }

    pieceEl.dataset.shape = JSON.stringify(pieceData.shape);
    pieceEl.dataset.color = pieceData.color;
    pieceEl.dataset.type = 'normal';

    pieceEl.addEventListener('pointerdown', handleDragStart);

    container.appendChild(pieceEl);
    piecesDock.appendChild(container);
}

// --- Drag & Drop Logic ---

function handleDragStart(e) {
    e.preventDefault();
    draggedPiece = e.currentTarget;
    draggedPieceData = {
        shape: JSON.parse(draggedPiece.dataset.shape),
        color: draggedPiece.dataset.color,
        type: draggedPiece.dataset.type || 'normal'
    };

    const rect = draggedPiece.getBoundingClientRect();
    initialPieceX = rect.left;
    initialPieceY = rect.top;

    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    const placeholder = document.createElement('div');
    placeholder.style.width = rect.width + 'px';
    placeholder.style.height = rect.height + 'px';
    draggedPiece.parentNode.replaceChild(placeholder, draggedPiece);
    draggedPiece.placeholder = placeholder;

    document.body.appendChild(draggedPiece);
    draggedPiece.style.position = 'absolute';
    draggedPiece.style.zIndex = 1000;
    draggedPiece.style.width = rect.width + 'px';
    draggedPiece.style.height = rect.height + 'px';

    moveAt(e.clientX, e.clientY);

    document.addEventListener('pointermove', handleDragMove);
    document.addEventListener('pointerup', handleDragEnd);
}

function moveAt(pageX, pageY) {
    draggedPiece.style.left = pageX - startX + 'px';
    draggedPiece.style.top = pageY - startY + 'px';
}

function handleDragMove(e) {
    // Default movement (follow mouse)
    let moveX = e.clientX - startX;
    let moveY = e.clientY - startY;

    // We will update the style at the end, potentially overriding with snap

    const pieceRect = draggedPiece.getBoundingClientRect();
    // Note: pieceRect will be based on the *current* style.left/top. 
    // To calculate potential snap, we need to know where the piece *would be* if we just followed the mouse.
    // However, since we update on every move event, the current position is close enough to the mouse 
    // for the purpose of finding the grid cell. 
    // Better approach: Calculate "virtual" position based on mouse, then find grid cell, then snap if close.

    // Virtual position (where the piece would be without snap)
    const currentLeft = e.clientX - startX;
    const currentTop = e.clientY - startY;

    const boardRect = boardElement.getBoundingClientRect();
    const cellSize = boardRect.width / BOARD_SIZE;

    // Calculate center of the piece relative to board to find the "intended" cell
    // We use the initial offset of the piece relative to the mouse to find the top-left of the piece
    // piece.left = mouse.x - startX
    // piece.top = mouse.y - startY

    // Relative to board:
    const relativeX = currentLeft - boardRect.left + (cellSize / 2); // + half cell for better centering feel
    const relativeY = currentTop - boardRect.top + (cellSize / 2);

    const col = Math.floor(relativeX / cellSize);
    const row = Math.floor(relativeY / cellSize);

    clearGhost();

    let isSnapped = false;
    let targetRow = row;
    let targetCol = col;
    let valid = false;

    // Check exact position first
    if (isValidPlacement(row, col, draggedPieceData.shape)) {
        valid = true;
    } else {
        // Smart Snap: Search neighbors
        let minDistance = Infinity;
        let bestR = -1;
        let bestC = -1;

        // Search radius 1
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const nr = row + dr;
                const nc = col + dc;

                if (isValidPlacement(nr, nc, draggedPieceData.shape)) {
                    // Calculate distance to this neighbor's center
                    const neighborX = boardRect.left + (nc * cellSize) + (cellSize / 2);
                    const neighborY = boardRect.top + (nr * cellSize) + (cellSize / 2);

                    // Distance from piece center (approx)
                    const pieceCenterX = boardRect.left + relativeX;
                    const pieceCenterY = boardRect.top + relativeY;

                    const dist = Math.hypot(pieceCenterX - neighborX, pieceCenterY - neighborY);

                    if (dist < minDistance) {
                        minDistance = dist;
                        bestR = nr;
                        bestC = nc;
                    }
                }
            }
        }

        // If we found a valid neighbor within a reasonable distance (e.g., < 1.0 cell size)
        // Using 1.0 because if it's further than that, it's probably not "intended"
        if (bestR !== -1 && minDistance < cellSize * 1.0) {
            targetRow = bestR;
            targetCol = bestC;
            valid = true;
            isSnapped = true; // Force snap for smart correction
        }
    }

    if (valid) {
        showGhost(targetRow, targetCol, draggedPieceData.shape);
        draggedPiece.dataset.targetRow = targetRow;
        draggedPiece.dataset.targetCol = targetCol;

        const targetBoardX = boardRect.left + (targetCol * cellSize);
        const targetBoardY = boardRect.top + (targetRow * cellSize);

        // Distance check (if not already forced by smart snap)
        if (!isSnapped) {
            const dist = Math.hypot(currentLeft - targetBoardX, currentTop - targetBoardY);
            const snapThreshold = cellSize * 0.5;
            if (dist < snapThreshold) {
                isSnapped = true;
            }
        }

        if (isSnapped) {
            moveX = targetBoardX;
            moveY = targetBoardY;
        }

    } else {
        delete draggedPiece.dataset.targetRow;
        delete draggedPiece.dataset.targetCol;
    }

    draggedPiece.style.left = moveX + 'px';
    draggedPiece.style.top = moveY + 'px';

    if (isSnapped) {
        draggedPiece.classList.add('snapped');
    } else {
        draggedPiece.classList.remove('snapped');
    }
}

function handleDragEnd(e) {
    document.removeEventListener('pointermove', handleDragMove);
    document.removeEventListener('pointerup', handleDragEnd);

    clearGhost();

    const targetRow = parseInt(draggedPiece.dataset.targetRow);
    const targetCol = parseInt(draggedPiece.dataset.targetCol);

    if (!isNaN(targetRow) && !isNaN(targetCol)) {
        placePiece(targetRow, targetCol, draggedPieceData);
        draggedPiece.remove();
        draggedPiece.placeholder.parentNode.remove();

        if (piecesDock.children.length === 0) {
            spawnPieces();
        }

        if (checkGameOver()) {
            setTimeout(() => {
                finalScoreElement.textContent = score;
                gameOverModal.classList.remove('hidden');
            }, 500);
        }

    } else {
        returnToDock();
    }

    draggedPiece = null;
    draggedPieceData = null;
}

function returnToDock() {
    const piece = draggedPiece;
    const placeholder = piece.placeholder;
    const rect = placeholder.getBoundingClientRect();

    piece.style.transition = 'all 0.3s ease';
    piece.style.left = rect.left + 'px';
    piece.style.top = rect.top + 'px';

    setTimeout(() => {
        piece.style.position = '';
        piece.style.left = '';
        piece.style.top = '';
        piece.style.zIndex = '';
        piece.style.width = '';
        piece.style.height = '';
        piece.style.transition = '';

        placeholder.parentNode.replaceChild(piece, placeholder);
    }, 300);
}

// --- Game Logic ---

function isValidPlacement(r, c, shape) {
    for (let [dr, dc] of shape) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return false;
        // Check if the cell is already occupied by any type of block
        if (board[nr][nc] !== null) return false;
    }
    return true;
}

function showGhost(r, c, shape) {
    for (let [dr, dc] of shape) {
        const cell = getCell(r + dr, c + dc);
        if (cell) cell.classList.add('ghost');
    }
}

function clearGhost() {
    const ghosts = document.querySelectorAll('.ghost');
    ghosts.forEach(el => el.classList.remove('ghost'));
}

function placePiece(r, c, pieceData) {
    for (let [dr, dc] of pieceData.shape) {
        const nr = r + dr;
        const nc = c + dc;
        // Store object
        board[nr][nc] = { color: pieceData.color, type: pieceData.type };

        const cell = getCell(nr, nc);
        cell.style.backgroundColor = pieceData.color;
        cell.classList.add('filled');

        // Add special class
        // Add special class
        if (pieceData.type === 'bomb') {
            cell.classList.add('bomb');
        }
        if (pieceData.type === 'star') {
            cell.classList.add('star');
        }

        cell.classList.add('anim-pop');
        setTimeout(() => cell.classList.remove('anim-pop'), 300);
    }

    updateScore(score + pieceData.shape.length);
    checkLines();
}

function checkLines() {
    let linesCleared = 0;
    const rowsToClear = [];
    const colsToClear = [];

    // Check Rows
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (board[r].every(cell => cell !== null)) {
            rowsToClear.push(r);
        }
    }

    // Check Cols
    for (let c = 0; c < BOARD_SIZE; c++) {
        let full = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (board[r][c] === null) {
                full = false;
                break;
            }
        }
        if (full) colsToClear.push(c);
    }

    const allCellsToClear = new Set();
    let explosionCells = new Set();
    let bonusMultiplier = 1;

    // Identify cells to clear and check for specials
    const checkSpecial = (r, c) => {
        const cellData = board[r][c];
        if (!cellData) return;

        if (cellData.type === 'bomb') {
            // Trigger explosion: 5x5 area (radius 2)
            for (let br = r - 2; br <= r + 2; br++) {
                for (let bc = c - 2; bc <= c + 2; bc++) {
                    if (br >= 0 && br < BOARD_SIZE && bc >= 0 && bc < BOARD_SIZE) {
                        explosionCells.add(`${br},${bc}`);
                    }
                }
            }
        }
        if (cellData.type === 'star') {
            bonusMultiplier += 1; // Add to multiplier
        }
    };

    rowsToClear.forEach(r => {
        for (let c = 0; c < BOARD_SIZE; c++) {
            allCellsToClear.add(`${r},${c}`);
            checkSpecial(r, c);
        }
    });
    colsToClear.forEach(c => {
        for (let r = 0; r < BOARD_SIZE; r++) {
            allCellsToClear.add(`${r},${c}`);
            checkSpecial(r, c);
        }
    });

    // Merge explosion cells
    explosionCells.forEach(key => allCellsToClear.add(key));

    if (allCellsToClear.size > 0) {
        linesCleared = rowsToClear.length + colsToClear.length;
        // If explosion happened but no lines (unlikely as explosion needs line clear), 
        // but if explosion clears extra lines, we don't count them as "lines cleared" for base score,
        // but we count blocks cleared.

        allCellsToClear.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const cell = getCell(r, c);
            if (cell) {
                // Check if this cell was part of an explosion
                if (explosionCells.has(`${r},${c}`)) {
                    cell.classList.add('exploding');
                } else {
                    cell.classList.add('clearing');
                }

                // Remove special classes
                cell.classList.remove('bomb', 'star');
                cell.textContent = ''; // Remove icon text
                cell.style.display = ''; // Reset display
                cell.style.justifyContent = '';
                cell.style.alignItems = '';
                cell.style.fontSize = '';
            }
            board[r][c] = null;
        });

        setTimeout(() => {
            allCellsToClear.forEach(key => {
                const [r, c] = key.split(',').map(Number);
                const cell = getCell(r, c);
                if (cell) {
                    cell.classList.remove('clearing');
                    cell.classList.remove('exploding'); // Fix: Remove explosion class
                    cell.classList.remove('filled');
                    cell.style.backgroundColor = '';
                }
            });
        }, 600); // Increased to match explosion animation duration

        // Scoring
        // Base: 10 * lines * lines
        // Bonus: Blocks cleared * 2
        // Multiplier: Star
        let points = (linesCleared * 10 * linesCleared) + (allCellsToClear.size * 2);
        if (linesCleared === 0 && allCellsToClear.size > 0) points = allCellsToClear.size * 5; // Just explosion

        points = Math.floor(points * bonusMultiplier);

        updateScore(score + points);
    }
}

function updateScore(newScore) {
    score = newScore;
    scoreElement.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('blockPuzzleBestScore', bestScore);
    }
}

function checkGameOver() {
    const pieces = document.querySelectorAll('.piece-container .draggable-piece');
    if (pieces.length === 0) return false;

    for (let piece of pieces) {
        const shape = JSON.parse(piece.dataset.shape);

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (isValidPlacement(r, c, shape)) {
                    return false;
                }
            }
        }
    }

    return true;
}

// --- Start ---
restartBtn.addEventListener('click', initGame);
initGame();
