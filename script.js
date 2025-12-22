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

    // Add some initial random blocks (noise) as per requirements
    // "El tablero ya contiene algunos cuadros rellenos"
    addInitialNoise(5);
}

function addInitialNoise(count) {
    let placed = 0;
    while (placed < count) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[r][c]) {
            board[r][c] = 'var(--cell-empty)'; // Use a neutral color or random
            // Actually, let's use a specific color for initial blocks to look "fixed"
            // But requirements say "fixed" but usually in these games they are clearable.
            // "son fijos" -> usually means they are just pre-filled blocks that CAN be cleared.
            // If they were permanent obstacles, it would be very hard.
            // I'll assume they are normal blocks that just start there.
            const cell = getCell(r, c);
            cell.classList.add('filled');
            cell.style.backgroundColor = '#b2bec3'; // Greyish for initial
            board[r][c] = '#b2bec3';
            placed++;
        }
    }
}

function getCell(r, c) {
    return boardElement.children[r * BOARD_SIZE + c];
}

// --- Piece Spawning ---

function spawnPieces() {
    piecesDock.innerHTML = '';
    // Spawn 1 piece as requested ("Solo me debe aparecer una futura pieza")
    createDraggablePiece();
}

function createDraggablePiece() {
    const pieceData = PIECES[Math.floor(Math.random() * PIECES.length)];
    const container = document.createElement('div');
    container.classList.add('piece-container');

    const pieceEl = document.createElement('div');
    pieceEl.classList.add('draggable-piece');

    // Calculate grid dimensions for the piece to set CSS grid
    let maxR = 0, maxC = 0;
    pieceData.shape.forEach(([r, c]) => {
        maxR = Math.max(maxR, r);
        maxC = Math.max(maxC, c);
    });

    pieceEl.style.gridTemplateRows = `repeat(${maxR + 1}, 1fr)`;
    pieceEl.style.gridTemplateColumns = `repeat(${maxC + 1}, 1fr)`;

    // Fill grid
    // We need to map the shape coordinates to grid cells
    // A simple way is to create a grid of (maxR+1) x (maxC+1)
    // and fill occupied spots.

    for (let r = 0; r <= maxR; r++) {
        for (let c = 0; c <= maxC; c++) {
            const cell = document.createElement('div');
            // Check if this r,c is in shape
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

    // Event Listeners for Drag
    pieceEl.addEventListener('pointerdown', handleDragStart);

    container.appendChild(pieceEl);
    piecesDock.appendChild(container);
}

// --- Drag & Drop Logic ---

function handleDragStart(e) {
    e.preventDefault(); // Prevent scrolling
    draggedPiece = e.currentTarget;
    draggedPieceData = {
        shape: JSON.parse(draggedPiece.dataset.shape),
        color: draggedPiece.dataset.color
    };

    // Get initial position to revert if needed
    const rect = draggedPiece.getBoundingClientRect();
    initialPieceX = rect.left;
    initialPieceY = rect.top;

    // Offset to center under finger/mouse
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    // Move piece to body to allow free dragging over everything
    // We replace it with a placeholder in the dock to keep layout
    const placeholder = document.createElement('div');
    placeholder.style.width = rect.width + 'px';
    placeholder.style.height = rect.height + 'px';
    draggedPiece.parentNode.replaceChild(placeholder, draggedPiece);
    draggedPiece.placeholder = placeholder; // Link back

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
    moveAt(e.clientX, e.clientY);

    // Ghost piece logic
    // 1. Find which cell is under the finger/pointer (top-left of piece)
    // We approximate the "origin" of the piece (0,0 block) to be near the top-left of the dragged element.
    // A better approach is to check the element below the center of the first block of the piece.

    // Get the first block's visual offset
    // Since we are using CSS grid on the piece, the first block (0,0) is at the top-left.
    // Let's sample the position of the top-left of the dragged piece.

    const pieceRect = draggedPiece.getBoundingClientRect();
    // Sample point: center of the top-left cell of the piece
    // We assume cell size in dock is smaller, but on board it's bigger.
    // We need to map screen coordinates to board coordinates.

    const boardRect = boardElement.getBoundingClientRect();
    const cellSize = boardRect.width / BOARD_SIZE;

    // Relative position to board
    // We want the top-left of the piece to snap to a cell
    // Let's use the center of the piece for better feel? 
    // No, usually top-left or finger position.
    // Let's use the finger position relative to the piece start.
    // Actually, let's try to map the top-left of the piece to the nearest cell.

    const relativeX = pieceRect.left - boardRect.left + (cellSize / 2);
    const relativeY = pieceRect.top - boardRect.top + (cellSize / 2);

    const col = Math.floor(relativeX / cellSize);
    const row = Math.floor(relativeY / cellSize);

    clearGhost();

    if (isValidPlacement(row, col, draggedPieceData.shape)) {
        showGhost(row, col, draggedPieceData.shape);
        draggedPiece.dataset.targetRow = row;
        draggedPiece.dataset.targetCol = col;
    } else {
        delete draggedPiece.dataset.targetRow;
        delete draggedPiece.dataset.targetCol;
    }
}

function handleDragEnd(e) {
    document.removeEventListener('pointermove', handleDragMove);
    document.removeEventListener('pointerup', handleDragEnd);

    clearGhost();

    const targetRow = parseInt(draggedPiece.dataset.targetRow);
    const targetCol = parseInt(draggedPiece.dataset.targetCol);

    if (!isNaN(targetRow) && !isNaN(targetCol)) {
        // Place piece
        placePiece(targetRow, targetCol, draggedPieceData);
        // Remove from DOM
        draggedPiece.remove();
        // Remove placeholder
        draggedPiece.placeholder.parentNode.remove(); // Remove the container too

        // Check if dock is empty
        if (piecesDock.children.length === 0) {
            spawnPieces();
        }

        // Check Game Over
        if (checkGameOver()) {
            setTimeout(() => {
                finalScoreElement.textContent = score;
                gameOverModal.classList.remove('hidden');
            }, 500);
        }

    } else {
        // Revert
        returnToDock();
    }

    draggedPiece = null;
    draggedPieceData = null;
}

function returnToDock() {
    // Animate back
    const piece = draggedPiece; // Capture current piece
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
    // Check bounds and overlap
    for (let [dr, dc] of shape) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return false;
        if (board[nr][nc] !== null) return false;
    }
    return true;
}

function showGhost(r, c, shape) {
    for (let [dr, dc] of shape) {
        const cell = getCell(r + dr, c + dc);
        cell.classList.add('ghost');
    }
}

function clearGhost() {
    const ghosts = document.querySelectorAll('.ghost');
    ghosts.forEach(el => el.classList.remove('ghost'));
}

function placePiece(r, c, pieceData) {
    // Update Board Data & UI
    for (let [dr, dc] of pieceData.shape) {
        const nr = r + dr;
        const nc = c + dc;
        board[nr][nc] = pieceData.color;

        const cell = getCell(nr, nc);
        cell.style.backgroundColor = pieceData.color;
        cell.classList.add('filled');
        cell.classList.add('anim-pop');
        setTimeout(() => cell.classList.remove('anim-pop'), 300);
    }

    // Add Score for placement (number of blocks)
    updateScore(score + pieceData.shape.length);

    // Check Lines
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

    // Clear them
    const allCellsToClear = new Set();

    rowsToClear.forEach(r => {
        for (let c = 0; c < BOARD_SIZE; c++) allCellsToClear.add(`${r},${c}`);
    });
    colsToClear.forEach(c => {
        for (let r = 0; r < BOARD_SIZE; r++) allCellsToClear.add(`${r},${c}`);
    });

    if (allCellsToClear.size > 0) {
        linesCleared = rowsToClear.length + colsToClear.length;

        // Visual clear
        allCellsToClear.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const cell = getCell(r, c);
            cell.classList.add('clearing');
            // Logic clear
            board[r][c] = null;
        });

        // Wait for animation then reset style
        setTimeout(() => {
            allCellsToClear.forEach(key => {
                const [r, c] = key.split(',').map(Number);
                const cell = getCell(r, c);
                cell.classList.remove('clearing');
                cell.classList.remove('filled');
                cell.style.backgroundColor = '';
            });
        }, 400);

        // Bonus Score
        // 10 points per line, multiplied by number of lines
        const bonus = linesCleared * 10 * linesCleared;
        updateScore(score + bonus);
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
    // Check if ANY available piece can fit ANYWHERE
    const pieces = document.querySelectorAll('.piece-container .draggable-piece');
    if (pieces.length === 0) return false; // Should not happen as we respawn immediately

    for (let piece of pieces) {
        const shape = JSON.parse(piece.dataset.shape);

        // Try every position
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (isValidPlacement(r, c, shape)) {
                    return false; // Found a valid move
                }
            }
        }
    }

    return true; // No moves found
}

// --- Start ---
restartBtn.addEventListener('click', initGame);
initGame();
