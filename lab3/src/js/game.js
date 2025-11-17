let currentState = "start";

const canvas = document.getElementById("atariBreakout");
const ctx = canvas.getContext("2d");

const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_TOP_OFFSET = 50;
const BRICK_LEFT_OFFSET = 35;

let brickGrid = [];
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;

const titleY = canvas.height / 2;
const titleX = canvas.width / 2;

const paddle = {
    width: 80,
    height: 15,
    x: 0,
    y: 0,
    speed: 6,
    movingLeft: false,
    movingRight: false
};

const ball = {
    width: 10,
    height: 10,
    x: 0,
    y: 0,
    speed: 4,
    dx: 0,
    dy: 0
};

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(e) {
    if (e.code === "ArrowLeft") paddle.movingLeft = true;
    if (e.code === "ArrowRight") paddle.movingRight = true;
}

function keyUp(e) {
    if (e.code === "ArrowLeft") paddle.movingLeft = false;
    if (e.code === "ArrowRight") paddle.movingRight = false;
}

function drawPaddle() {
    ctx.fillStyle = "white";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, 3);

    ctx.fillStyle = "rgba(180,180,180,1)";
    ctx.fillRect(paddle.x, paddle.y + paddle.height - 3, paddle.width, 3);
}

function drawBall() {
    ctx.fillStyle = "white";
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(ball.x, ball.y, ball.width, 2);
    ctx.fillRect(ball.x, ball.y, 2, ball.height);

    ctx.fillStyle = "rgba(180,180,180,1)";
    ctx.fillRect(ball.x, ball.y + ball.width - 2, ball.height, 2);
    ctx.fillRect(ball.x + ball.width - 2, ball.y, 2, ball.height);
}

function drawBrick(brick) {
    if (!brick.alive) return;

    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(brick.x, brick.y, brick.width, 3);
    ctx.fillRect(brick.x, brick.y, 3, brick.height);

    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(brick.x, brick.y + brick.height - 3, brick.width, 3);
    ctx.fillRect(brick.x + brick.width - 3, brick.y, 3, brick.height);
}

function drawBricks() {
    for (let row = 0; row < BRICK_ROW_COUNT; row++) {
        for (let col = 0; col < BRICK_COLUMN_COUNT; col++) {
            drawBrick(brickGrid[row][col]);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawScore() {
    ctx.textAlign = "left";
    ctx.font = "bold 18px Helvetica";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 20, 25);

    ctx.textAlign = "right";
    ctx.font = "bold 18px Helvetica";
    ctx.fillStyle = "white";
    ctx.fillText("Best: " + highScore, canvas.width - 20, 25);
}

function drawStartScreen() {
    ctx.font = "bold 36px Helvetica";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("BREAKOUT", titleX, titleY);

    ctx.font = "bold italic 18px Helvetica";
    ctx.fillText("Press SPACE to begin", titleX, titleY + 28); //28 = 10 + 18
    currentState === "start"
}

function drawGameOverScreen() {
    ctx.font = "bold 40px Helvetica";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", titleX, titleY);
}

function drawWinScreen() {
    ctx.font = "bold 40px Helvetica";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText("GAME WON", titleX, titleY);
}

function draw() {
    drawBackground();

    if (currentState === "start") {
        drawStartScreen();
        return;
    }

    drawScore();
    drawPaddle();
    drawBall();
    drawBricks();


    if (currentState === "gameover") {
        drawGameOverScreen();
        return;
    }

    if (currentState === "win") {
        drawWinScreen();
        return;
    }
}

function updatePaddle() {
    if (paddle.movingLeft) {
        paddle.x -= paddle.speed;
    }

    if (paddle.movingRight) {
        paddle.x += paddle.speed;
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    }

    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
        
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x <= 0 || ball.x + ball.height >= canvas.width) {
        ball.dx = -ball.dx;
    }

    if (ball.y <= 0) {
        ball.dy = -ball.dy;
    }

    if (
        ball.x + ball.width > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.height > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dy = -Math.abs(ball.dy);

        let hitPoint = (ball.x + ball.width / 2) - (paddle.x + paddle.width / 2);
        ball.dx = hitPoint * 0.1; 
    }

    if (ball.y > canvas.height) {
        currentState = "gameover";
    }
}

function checkBrickCollisions() {
    for (let row = 0; row < BRICK_ROW_COUNT; row++) {
        for (let col = 0; col < BRICK_COLUMN_COUNT; col++) {

            const brick = brickGrid[row][col];
            if (!brick.alive) continue;

            if (
                ball.x < brick.x + brick.width &&
                ball.x + ball.width > brick.x &&
                ball.y < brick.y + brick.height &&
                ball.y + ball.height > brick.y
            ) {
                brick.alive = false;
                ball.dy = -ball.dy;
                score += 1;

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }

                return;
            }
        }
    }
}

function update() {

    if (currentState === "start") {
        return;
    } else if (currentState === "playing") {
        updatePaddle();
        updateBall();
        checkBrickCollisions();

        if (allBricksDestroyed()) {
            currentState = "win";
        }

        if (currentState === "gameover" || currentState === "win") {
            return;
        }
    }
}

function allBricksDestroyed() {
    for (let row = 0; row < BRICK_ROW_COUNT; row++) {
        for (let col = 0; col < BRICK_COLUMN_COUNT; col++) {

            const brick = brickGrid[row][col];
            if (brick.alive) return false;
        }
    }

    return true;

}

function startGame() {
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - 40;

    ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
    ball.y = paddle.y - ball.height;

    if (Math.random() < 0.5) {
        ball.dx = ball.speed;
    } else {
        ball.dx = -ball.speed;
    }
    ball.dy = -ball.speed;

    initBricks();
}

function initBricks() {
    brickGrid = [];
    const colors = [
        "rgb(153, 51, 0)",
        "rgb(255, 0, 0)",
        "rgb(255, 153, 204)",
        "rgb(0, 255, 0)",
        "rgb(255, 255, 153)"
    ];

    for (let row = 0; row < BRICK_ROW_COUNT; row++) {
        brickGrid[row] = [];
        for (let col = 0; col < BRICK_COLUMN_COUNT; col++) {

            const x = BRICK_LEFT_OFFSET + col * (BRICK_WIDTH + BRICK_PADDING);
            const y = BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING);

            brickGrid[row][col] = {
                x: x,
                y: y,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                alive: true,
                color: colors[row]
            };
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        if (currentState === "start") { 
            startGame();
            currentState = "playing";
        }

        if (currentState === "gameover") {
            score = 0;
            currentState = "playing";
            startGame();
        }

        if (currentState === "win") {
            score = 0;
            currentState = "playing";
            startGame();
        }
    }
});

gameLoop();
