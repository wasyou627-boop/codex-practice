const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const config = {
  paddleWidth: 100,
  paddleHeight: 12,
  paddleSpeed: 7,
  ballRadius: 8,
  brickRows: 5,
  brickCols: 10,
  brickWidth: 54,
  brickHeight: 20,
  brickGap: 8,
  brickOffsetTop: 58,
  brickOffsetLeft: 22,
  initialLives: 3,
};

let paddleX;
let ballX;
let ballY;
let ballDX;
let ballDY;
let rightPressed = false;
let leftPressed = false;
let score;
let lives;
let gameState;
let bricks;

function buildBricks() {
  bricks = [];
  for (let row = 0; row < config.brickRows; row += 1) {
    bricks[row] = [];
    for (let col = 0; col < config.brickCols; col += 1) {
      bricks[row][col] = { alive: true };
    }
  }
}

function resetBallAndPaddle() {
  paddleX = (canvas.width - config.paddleWidth) / 2;
  ballX = canvas.width / 2;
  ballY = canvas.height - 52;
  ballDX = 4;
  ballDY = -4;
}

function resetGame() {
  score = 0;
  lives = config.initialLives;
  gameState = "playing";
  buildBricks();
  resetBallAndPaddle();
}

function drawPaddle() {
  ctx.fillStyle = "#63e6ff";
  ctx.fillRect(
    paddleX,
    canvas.height - config.paddleHeight - 10,
    config.paddleWidth,
    config.paddleHeight
  );
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, config.ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd43b";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let row = 0; row < config.brickRows; row += 1) {
    for (let col = 0; col < config.brickCols; col += 1) {
      if (!bricks[row][col].alive) {
        continue;
      }

      const brickX =
        col * (config.brickWidth + config.brickGap) + config.brickOffsetLeft;
      const brickY =
        row * (config.brickHeight + config.brickGap) + config.brickOffsetTop;

      ctx.fillStyle = `hsl(${200 + row * 18 + col * 2}, 80%, 60%)`;
      ctx.fillRect(brickX, brickY, config.brickWidth, config.brickHeight);
    }
  }
}

function drawHud() {
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(`SCORE: ${score}`, 18, 30);

  const hearts = "♥".repeat(lives);
  ctx.textAlign = "right";
  ctx.fillText(`LIFE: ${hearts}`, canvas.width - 18, 30);
}

function drawCenterMessage(mainText, subText) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 46px sans-serif";
  ctx.fillText(mainText, canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#dbe4ff";
  ctx.fillText(subText, canvas.width / 2, canvas.height / 2 + 34);
  ctx.restore();
}

function collisionDetection() {
  for (let row = 0; row < config.brickRows; row += 1) {
    for (let col = 0; col < config.brickCols; col += 1) {
      if (!bricks[row][col].alive) {
        continue;
      }

      const brickX =
        col * (config.brickWidth + config.brickGap) + config.brickOffsetLeft;
      const brickY =
        row * (config.brickHeight + config.brickGap) + config.brickOffsetTop;

      const withinX = ballX > brickX && ballX < brickX + config.brickWidth;
      const withinY = ballY > brickY && ballY < brickY + config.brickHeight;

      if (withinX && withinY) {
        ballDY = -ballDY;
        bricks[row][col].alive = false;
        score += 10;

        if (score === config.brickRows * config.brickCols * 10) {
          gameState = "won";
        }
      }
    }
  }
}

function updateBall() {
  if (ballX + ballDX > canvas.width - config.ballRadius || ballX + ballDX < config.ballRadius) {
    ballDX = -ballDX;
  }

  if (ballY + ballDY < config.ballRadius) {
    ballDY = -ballDY;
  } else if (ballY + ballDY > canvas.height - config.ballRadius - config.paddleHeight - 10) {
    if (ballX > paddleX && ballX < paddleX + config.paddleWidth) {
      ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - config.ballRadius) {
      lives -= 1;
      if (lives <= 0) {
        gameState = "gameover";
      } else {
        resetBallAndPaddle();
      }
      return;
    }
  }

  ballX += ballDX;
  ballY += ballDY;
}

function updatePaddle() {
  if (rightPressed && paddleX < canvas.width - config.paddleWidth) {
    paddleX += config.paddleSpeed;
  }
  if (leftPressed && paddleX > 0) {
    paddleX -= config.paddleSpeed;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawHud();

  if (gameState === "playing") {
    collisionDetection();
    updateBall();
    updatePaddle();
  } else if (gameState === "gameover") {
    drawCenterMessage("GAME OVER", "SPACEで再挑戦");
  } else if (gameState === "won") {
    drawCenterMessage("YOU WIN!", "SPACEで再挑戦");
  }

  requestAnimationFrame(draw);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowRight") {
    rightPressed = true;
  }
  if (event.code === "ArrowLeft") {
    leftPressed = true;
  }

  if (event.code === "Space" && gameState !== "playing") {
    resetGame();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowRight") {
    rightPressed = false;
  }
  if (event.code === "ArrowLeft") {
    leftPressed = false;
  }
});

resetGame();
draw();
