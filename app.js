// app.js - Smart Tic Tac Toe Game with AI, Timer, Sound, Leaderboard

const boxes = document.querySelectorAll(".box");
const resetBtn = document.getElementById("resetBtn");
const newGameBtn = document.getElementById("newGameBtn");
const undoBtn = document.getElementById("undoBtn");
const modeSelector = document.getElementById("mode");
const themeSelector = document.getElementById("theme");
const playerOInput = document.getElementById("playerO");
const playerXInput = document.getElementById("playerX");
const msgContainer = document.getElementById("msgContainer");
const msgText = document.getElementById("msgText");
const leaderboardList = document.getElementById("leaderboardList");
const scoreO = document.getElementById("scoreO");
const scoreX = document.getElementById("scoreX");
const toggleDark = document.getElementById("toggleDark");
const timer = document.getElementById("timer");
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");

let board = ["", "", "", "", "", "", "", "", ""];
let turn = "O";
let isGameOver = false;
let isAIMode = false;
let moveHistory = [];
let scores = { O: 0, X: 0 };
let timeLeft = 10;
let timerInterval;

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function renderBoard() {
  boxes.forEach((box, i) => {
    box.innerText = board[i];
    box.classList.remove("animated-x", "animated-o", "win-highlight");
    if (board[i] === "X") box.classList.add("animated-x");
    if (board[i] === "O") box.classList.add("animated-o");
  });
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 10;
  timer.style.setProperty("--progress", "0");
  timer.textContent = `${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = `${timeLeft}s`;
    timer.style.setProperty("--progress", `${(10 - timeLeft) / 10}`);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      switchTurn();
    }
  }, 1000);
}

function switchTurn() {
  turn = turn === "X" ? "O" : "X";
  startTimer();
  if (isAIMode && turn === "X") aiMove();
}

function handleClick(i) {
  if (board[i] || isGameOver) return;

  board[i] = turn;
  moveSound.play();
  moveHistory.push(i);
  renderBoard();
  checkWinner();
  if (!isGameOver) switchTurn();
}

function aiMove() {
  const bestMove = getBestMove();
  setTimeout(() => {
    handleClick(bestMove);
  }, 500);
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "X";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  const result = evaluateBoard();
  if (result !== null) return result;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = "X";
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = "O";
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = "";
      }
    }
    return best;
  }
}

function evaluateBoard() {
  for (let pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] === "X" ? 1 : -1;
    }
  }
  if (board.every(cell => cell)) return 0;
  return null;
}

function checkWinner() {
  for (let pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      highlightWin([a, b, c]);
      winSound.play();
      isGameOver = true;
      clearInterval(timerInterval);

      const winnerName = turn === "O" ? playerOInput.value || "Player O" : playerXInput.value || "Player X";
      msgText.innerText = `🎉 ${winnerName} Wins!`;
      msgContainer.classList.add("show");

      scores[turn]++;
      updateScore();
      updateLeaderboard(winnerName);
    }
  }
  if (!isGameOver && board.every(cell => cell)) {
    msgText.innerText = "🤝 It's a Draw!";
    msgContainer.classList.add("show");
    isGameOver = true;
    clearInterval(timerInterval);
  }
}

function updateScore() {
  scoreO.textContent = `Player O: ${scores.O}`;
  scoreX.textContent = `Player X: ${scores.X}`;
}

function highlightWin(pattern) {
  pattern.forEach(i => boxes[i].classList.add("win-highlight"));
}

function updateLeaderboard(winnerName) {
  const li = document.createElement("li");
  li.innerHTML = `<span>${winnerName}</span><span>+1</span>`;
  leaderboardList.prepend(li);
}

function resetGame() {
  board = Array(9).fill("");
  turn = "O";
  isGameOver = false;
  renderBoard();
  moveHistory = [];
  msgContainer.classList.remove("show");
  startTimer();
  if (isAIMode && turn === "X") aiMove();
}

function undoMove() {
  if (moveHistory.length === 0 || isGameOver) return;
  const last = moveHistory.pop();
  board[last] = "";
  turn = turn === "X" ? "O" : "X";
  renderBoard();
  startTimer();
}

boxes.forEach((box, i) => box.addEventListener("click", () => handleClick(i)));
resetBtn.onclick = resetGame;
newGameBtn.onclick = resetGame;
undoBtn.onclick = undoMove;

modeSelector.onchange = () => {
  isAIMode = modeSelector.value === "ai";
  resetGame();
};

themeSelector.onchange = () => {
  const useEmoji = themeSelector.value === "emoji";
  const symbolMap = useEmoji ? { O: "⭕", X: "❌" } : { O: "O", X: "X" };
  board = board.map(val => (val === "O" ? symbolMap.O : val === "X" ? symbolMap.X : ""));
  renderBoard();
};

toggleDark.onclick = () => document.body.classList.toggle("dark-mode");

resetGame();
