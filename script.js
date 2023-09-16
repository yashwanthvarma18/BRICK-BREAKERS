//GLOBAL VARIABLES
var modal = document.getElementById('myModal'); // Reference to the modal
var modalScore = document.getElementById('modalScore'); // Reference to the score element in the modal
var modalTime = document.getElementById('modalTime'); // Reference to the time element in the modal
var tryAgainBtn = document.getElementById('tryAgainBtn'); // Reference to the "Try Again" button
var startTime = new Date().getTime(); // Store the start time of the game
const BRICK_GAP = 2; // Space between bricks
var BRICK_W = 80, // Width of each brick
    BRICK_H = 20; // Height of each brick
const BRICK_COLS = 20; // Number of brick columns
var brickRows = 14, // Number of brick rows
    brickGrid = new Array(BRICK_COLS * brickRows), // Grid to store brick information
    bricksLeft = 0, // Count of remaining bricks

    paddleX = 350.1, // X-coordinate of the paddle's top-left corner
    paddleSpeedX = 0; // Paddle's horizontal speed
var PADDLE_WIDTH = 100; // Width of the paddle
const PADDLE_THICKNESS = 10, // Thickness of the paddle
    PADDLE_DIST_FROM_EDGE = 60; // Distance of the paddle from the canvas edge

var element = document.getElementById('gameCanvas'); // Reference to the game canvas

var canvas, canvasContext, // Variables to store canvas and its context

    ballX = 0, // X-coordinate of the ball
    ballY = 0, // Y-coordinate of the ball
    ballSpeedX = 5, // Horizontal speed of the ball
    ballSpeedY = 6, // Vertical speed of the ball

    mouseX = 0, // X-coordinate of the mouse cursor
    mouseY = 0, // Y-coordinate of the mouse cursor

    playerLives = 3, // Number of player lives

    score = 0, // Player's score
    pointPerBrick = 2, // Points gained per brick
    multiplier = 1, // Score multiplier

    readyImg = false, // Flag to indicate if the game is ready to start
    ballHitPaddleLast = false, // Flag to track if the ball hit the paddle last
    scoreMode = false, // Flag for score mode
    randomMode = false; // Flag for random mode

// General functions

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';

    // Reset the game based on the selected mode
    if (randomMode) {
        randomBrickReset();
    } else {
        brickReset();
    }
    ballReset();
}

// Function to initialize the game when the window loads
window.onload = function() {
    canvas = document.getElementById('gameCanvas'); // Get the canvas element
    canvasContext = canvas.getContext('2d'); // Get the 2D rendering context

    var framesPerSecond = 60;
    setInterval(updateAll, 1000 / framesPerSecond); // Update the game regularly

    canvas.addEventListener('mousedown', handleMouseClick); // Listen for mouse clicks
    canvas.addEventListener('mousemove', updateMousePos); // Listen for mouse movements

    // Initialize the game based on the selected mode
    if (randomMode) {
        randomBrickReset();
    } else {
        brickReset();
    }

    // Delay ball reset to allow time for the game to set up
    setTimeout(function() {
        ballReset();
    }, 20);

    // Add event listener for the "Try Again" button
    var tryAgainBtn = document.getElementById('tryAgainBtn');
    tryAgainBtn.addEventListener('click', function() {
        closeModal();
        // Reset the game here based on the selected mode
        if (randomMode) {
            randomBrickReset();
        } else {
            brickReset();
        }
        ballReset();
    });
}

// Function to show the modal with score and time
function showModal(score, timeTakenInSeconds) {
    modal.style.display = 'block';

    // Clear the modal content first
    modalScore.textContent = '';
    modalTime.textContent = '';

    if (scoreMode) {
        // Display the score and time taken in the modal for score and random modes
        const minutes = Math.floor(timeTakenInSeconds / 60);
        const seconds = Math.floor(timeTakenInSeconds % 60);

        modalScore.textContent = 'Score: ' + score;
        modalTime.textContent = 'Time Taken: ' + minutes + ' minutes ' + seconds + ' seconds';
    }
}

// Function to update all game elements
function updateAll() {
    moveAll();
    drawAll();
}

// INPUT functions

// Function to update mouse position
function updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH / 2;
}

// Function to handle mouse click
function handleMouseClick(evt) {
    if (readyImg) {
        readyImg = false;
        ballSpeedX = .8;
        ballSpeedY = 5.5;
    }
}

// BRICK/BOARD functions

// Function to generate the game board
function generateBoard() {
    if (randomMode == false) {
        return;
    } else {
        ballReset();
        randomBrickReset();
        score = 0;
        multiplier = 1;
        if (scoreMode) {
            playerLives = 1;
        } else {
            playerLives = 3;
        }
    }
}

// Function to toggle random mode
function randomBoard() {
    if (randomMode) {
        randomMode = false;
        brickReset();
        if (scoreMode) {
            playerLives = 1;
        } else {
            playerLives = 3;
        }
    } else {
        randomMode = true;
        randomBrickReset();

        if (scoreMode) {
            playerLives = 1;
        } else {
            playerLives = 3;
            paddleX = canvas.width / 2;
        }
    }
    ballReset();
}

// Function to reset bricks randomly
function randomBrickReset() {
    bricksLeft = 0;
    var i;
    brickRows = 15 + (Math.random() * 5);
    for (i = 0; i < (1.5 + Math.random()) * BRICK_COLS; i++) {
        brickGrid[i] = false;
    }

    for (; i < BRICK_COLS * brickRows; i++) {
        if (Math.random() > 0.45) {
            brickGrid[i] = true;
            bricksLeft++;
        } else {
            brickGrid[i] = false;
        }
    }
}

// Function to reset bricks
function brickReset() {
    bricksLeft = 0;
    var i;
    brickRows = 14;
    for (i = 0; i < 3 * BRICK_COLS; i++) {
        brickGrid[i] = false;
    }
    for (; i < BRICK_COLS * brickRows; i++) {
        brickGrid[i] = true;
        bricksLeft++;
    }
}

// Function to check if there is a brick at a given column and row
function isBrickAtColRow(col, row) {
    if (col >= 0 && col < BRICK_COLS &&
        row >= 0 && row < brickRows) {
        var brickIndexUnderCoord = rowColToArrayIndex(col, row);
        return brickGrid[brickIndexUnderCoord];
    } else {
        return false;
    }
}

// Function to convert column and row to an array index
function rowColToArrayIndex(col, row) {
    return col + BRICK_COLS * row;
}

// Function to draw bricks on the canvas
function drawBricks() {
    for (var eachRow = 0; eachRow < brickRows; eachRow++) {
        for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
            var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
            if (brickGrid[arrayIndex]) {
                colorRect(BRICK_W * eachCol, BRICK_H * eachRow, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'red');
            }
        }
    }
}

// BALL functions

// Function to move the ball
function ballMove() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballX < 10 && ballSpeedX < 0.0) { // Ball hits left wall
        ballSpeedX *= -1;
    }
    if (ballX > canvas.width - 10 && ballSpeedX > 0.0) { // Ball hits right wall
        ballSpeedX *= -1;
    }
    if (ballY < 0 && ballSpeedY < 0.0) { // Ball hits top wall
        ballSpeedY *= -1;
    }
    if (ballY > canvas.height) { // Ball goes below the screen
        ballReset();
        playerLives--;

        // Check if the player is out of lives
        if (playerLives <= -1) {
            if (scoreMode || randomMode) {
                // Calculate the time taken
                var endTime = new Date().getTime();
                var timeTakenInSeconds = (endTime - startTime) / 1000;

                // Display the modal with score, time taken, and "Try Again" button for score and random modes
                showModal(score, timeTakenInSeconds);

                // Reset the game state for score mode and random mode
                playerLives = 1;
                score = 0;
                startTime = new Date().getTime();
                if (randomMode) {
                    randomBrickReset();
                } else {
                    brickReset();
                }
            } else {
                // Display the simplified modal with only the "Try Again" button for normal and normal random modes
                showModal();

                // Reset the game state for normal and normal random mode
                playerLives = 3;
                score = 0;
                if (randomMode) {
                    randomBrickReset();
                } else {
                    brickReset();
                }
            }
        }
    }
}

// Function to handle ball-brick collisions
function ballBrickHandling() {
    var ballBrickCol = Math.floor(ballX / BRICK_W);
    var ballBrickRow = Math.floor(ballY / BRICK_H);
    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

    if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
        ballBrickRow >= 0 && ballBrickRow < brickRows) {

        if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
            brickGrid[brickIndexUnderBall] = false; // Remove the brick
            ballHitPaddleLast = false;
            if (ballHitPaddleLast == false) {
                if (multiplier <= 9.5) {
                    pointPerBrick = 2 * Math.floor(multiplier);
                    multiplier += 0.5; // Increase multiplier per consecutive brick hit without hitting the paddle
                } else if (multiplier == 10) {
                    playerLives++;
                }
            }
            score += Math.floor(pointPerBrick);
            bricksLeft--;

            var prevBallX = ballX - ballSpeedX;
            var prevBallY = ballY - ballSpeedY;
            var prevBrickCol = Math.floor(prevBallX / BRICK_W);
            var prevBrickRow = Math.floor(prevBallY / BRICK_H);

            var bothTestsFailed = true;

            if (prevBrickCol != ballBrickCol) {
                if (isBrickAtColRow(prevBrickCol, ballBrickRow) == false) {
                    ballSpeedX *= -1;
                    bothTestsFailed = false;
                }
            }
            if (prevBrickRow != ballBrickRow) {
                if (isBrickAtColRow(ballBrickCol, prevBrickRow) == false) {
                    ballSpeedY *= -1;
                    bothTestsFailed = false;
                }
            }

            if (bothTestsFailed) { // Prevents the ball from passing through the corner of an L-shaped arrangement of bricks
                ballSpeedX *= -1;
                ballSpeedY *= -1;
            }
        }
    }
}

// Function to handle ball-paddle collisions
function ballPaddleHandling() {
    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

    if (ballY > paddleTopEdgeY && // Below the top of the paddle
        ballY < paddleBottomEdgeY && // Above the bottom of the paddle
        ballX > paddleLeftEdgeX && // Right of the left side of the paddle
        ballX < paddleRightEdgeX) { // Left of the right side of the paddle

        // Change score attack mode variables
        ballHitPaddleLast = true;
        pointPerBrick = 2;
        multiplier = 1;
        ballSpeedY *= -1;

        var centerOfPaddleX = paddleX + PADDLE_WIDTH / 2;
        var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
        ballSpeedX = ballDistFromPaddleCenterX * 0.35;

        if (bricksLeft == 0) {
            if (randomMode) {
                randomBrickReset();
            } else {
                brickReset();
            }
        }
    }
}

// Function to reset the ball's position
function ballReset() {
    ballX = canvas.width / 2;
    if (randomMode) {
        ballY = canvas.height / 2 + 100;
    } else {
        ballY = canvas.height / 2;
    }
    ballSpeedX = 0;
    ballSpeedY = 0;
    readyImg = true;
    pointPerBrick = 1;
    multiplier = 1;
}

// GAMEPLAY functions

// Function to switch between score attack and normal mode
function ScoreAttack() {
    if (scoreMode) {
        scoreMode = false;
        ballReset();
        if (randomMode) {
            randomBrickReset();
        } else {
            brickReset();
        }
        playerLives = 3;
        score = 0;
    } else {
        scoreMode = true;
        ballReset();
        if (randomMode) {
            randomBrickReset();
        } else {
            brickReset();
        }
        paddleX = canvas.width / 2;
        playerLives = 1;
        score = 0;
    }
}

// MOVEMENT functions

// Function to move all game elements
function moveAll() {
    ballMove();
    ballBrickHandling();
    ballPaddleHandling();
}

// DRAW functions

// Function to draw all game elements
function drawAll() {
    // Adjust canvas size based on the window size
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 75;
    PADDLE_WIDTH = canvas.width / 10;
    BRICK_W = canvas.width / 20;
    BRICK_H = canvas.height / 40;

    // Function to draw text with specified properties
    function colorText(showWords, textX, textY, fillColor, fontSize) {
        canvasContext.fillStyle = fillColor;
        canvasContext.font = fontSize + ' serif'; // Set the font size here
        canvasContext.fillText(showWords, textX, textY);
    }

    // Clear the canvas
    colorRect(0, 0, canvas.width, canvas.height, 'black');

    // Draw the ball
    canvasContext.font = '10pt serif';
    colorCirlce(ballX, ballY, 6, 'white');

    // Draw the paddle
    colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'yellow');

    // Draw the bricks
    drawBricks();

    // Display "PRESS TO START" text if the game is ready to start
    if (readyImg) {
        colorText("PRESS TO START", ballX - 140, ballY + 90, 'green', '40px');
    }

    // Display "Random On" text if random mode is enabled
    if (randomMode) {
        colorText("Random On", 60, canvas.height - 15, 'blue');
    }

    // Display the score if score mode is enabled
    if (scoreMode) {
        canvasContext.font = '20px Arial';
        colorText("SCORE: " + score, 10, 20, 'yellow');
    }

    // Display player lives as hearts
    canvasContext.font = '20px Arial';
    canvasContext.fillStyle = 'yellow';
    var text = '❤️' + playerLives;
    var textWidth = canvasContext.measureText(text).width;
    var x = canvas.width - textWidth - 10;
    var y = 30;
    canvasContext.fillText(text, x, y);
}

// Function to draw a filled rectangle on the canvas
function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

// Function to draw a filled circle on the canvas
function colorCirlce(centerX, centerY, radius, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

// Function to draw colored text on the canvas
function colorText(showWords, textX, textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}
