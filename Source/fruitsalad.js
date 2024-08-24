class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cell {
    icon;
    drag = new Location(0, 0);
    fall = 0; //Y

    constructor(icon) {
        this.icon = icon
    }
}

/** @type Cell[] */
var matrix = [];
var images = [];

const scoreMultipliers = [1, 2.34, 3.5];
const timeMultipliers = [2, 2.5, 3];
const imageCounts = [5, 6, 7]

const size = new Location(10,9);
let isPaused = false;

let score;
let difficulty;
let scoreMultiplier;

let downCoord, firstCoord;
downCoord = null;

let bgMusic;

let eat;



function randomShape() {
    return Math.floor(Math.random() * imageCount);
}

function gameOver(){
    let winbg = $("bg-win");
    clearInterval(countDown);

    $("game").style.display = "none";
    $("timeEnd").style.display = "none";
    $("playAgain").style.display = "block";

    winbg.play();
    bgMusic.pause();

}

function setTime(){
    time--;

    if (time <= 0) {
       gameOver();
    }

    $("timeLeft").innerHTML = time;
    $("gameScore").innerHTML = score;
}


function difficult(diff){
    difficulty = diff;
    timeMultiplier = timeMultipliers[diff];
    scoreMultiplier = scoreMultipliers[diff];
    imageCount = imageCounts[difficulty];
}


function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x /= 79;
    y /= 79;
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= size.x || y >= size.y)
        return false;

    return { "x": x, "y": y };
}

function getTouchPosition(canvas, event) {
    event = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x /= 79;
    y /= 79;
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= size.x || y >= size.y)
        return false;

    return { "x": x, "y": y };
}

function gameValue() {
    for (let x = 0; x < size.x; x++) {
        let column = [];
        matrix.push(column);

        for (let y = 0; y < size.y; y++) {
            column.push(new Cell(randomShape()));
        }
    }

    for (let i = 0; i < imageCount; i++)
        images.push($("i" + i));
}

function drawScreen() {
    const playGame = $("playGame");
    const pg = playGame.getContext("2d");
    pg.clearRect(0, 0, playGame.width, playGame.height);

    for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
            let cell2 = matrix[x][y];

            if(downCoord !== null && downCoord.x == x && downCoord.y == y){
                pg.drawImage(
                    images[cell2.icon], 
                    79 * x+16, 
                    79 * y+16, 
                    79-26, 79-26
                );
            }
            else{
                pg.drawImage(
                    images[cell2.icon], 
                    79 * x, 
                    79 * y, 
                    79, 79
                );
            }
        }
    }
}

function remove(){
    var found = false;
    let cell;

    for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
            cell = matrix[x][y];
            let number = 0;
            while (true) {
                number++;

                if (y + number >= size.y || cell.icon == -1 || cell.icon != matrix[x][y + number].icon) {
                    break;
                }
            }

            if (number > 2) {
                if (eat === true) {
                    createjs.Sound.play("eat");
                }

                matrix[x].splice(y, number);
                for (k = 0; k < number; k++) {
                    matrix[x] = [new Cell(randomShape())].concat(matrix[x]);
                }
                found = true;

                time += Math.floor((number - 3) * timeMultiplier);
                score += Math.round((number + (number - 3)) * scoreMultiplier);
            }

        }
    }
    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            cell = matrix[x][y];
            let number = 0;
            while (true) {
                number++;

                if (x + number >= size.x || cell.icon != matrix[x + number][y].icon) {
                    break;
                }
            }

            if (number > 2) {
                if (eat == true) {
                    createjs.Sound.play("eat");
                }


                for (k = 0; k < number; k++) {
                    matrix[x+k].splice(y, 1);

                    matrix[x + k] = [new Cell(randomShape())].concat(matrix[x + k]);
                }
                found = true;

                time += Math.floor((number - 3) * timeMultiplier);
                score += Math.round((number + (number - 3)) * scoreMultiplier);
            }

        }
    }
    if (found == true) {
        remove();

        return true;
    }

    return false;
}

function start(diff){
    difficult(diff);

    $("scorePanel").style.display = "flex";
    $("game").style.display = "block";
    $("level").style.display = "none";

    bgMusic = $("bg-music");
    bgMusic.currentTime = 0;
    bgMusic.play();
    bgMusic.volume = 0.5;

    time = 0;
    score = 0;
    gameValue(); remove();

    time = 60;
    score = 0;
    countDown = setInterval(setTime, 1000);
    eat = true;
    $("timeLeft").innerHTML = time;
    $("gameScore").innerHTML = score;

    codeOfGame();
}

function image(){
    for (let i = 0; i < imageCount; i++)
        images.push($("i" + i));
}

function firstCoords(canvas, e){
    const rect = canvas.getBoundingClientRect();
        let x = (e.clientX - rect.left);
        let y = (e.clientY - rect.top);
        firstCoord = new Location(x, y);
}

function codeOfGame() {
    image();

    remove(); drawScreen();

    const canvas = $("playGame");
    let mouse = false;

    canvas.addEventListener("mousedown", function (e) {
        if(isPaused) return;

        firstCoords(canvas, e);
        downCoord = getCursorPosition(canvas, e);

        if (downCoord !== false) {
            mouse = true;
            selindex = downCoord;
            drawScreen();
        }
    });


    canvas.addEventListener("mousemove", function (e) {
        if (mouse == true) {

            let newCoord = getCursorPosition(canvas, e);

            if (newCoord === false) {
                drawScreen();
                return;
            }

            let moveX = newCoord.x - downCoord.x;
            let moveY = newCoord.y - downCoord.y;

            if (moveX <= -2 || moveX >= 2 || moveY <= -2 || moveY >= 2 || (moveX != 0 && moveY != 0)) {
                downCoord = null;
                mouse = false;
            }
            else if (moveX == -1 || moveX == 1 || moveY == -1 || moveY == 1) {
                let last2Coords = matrix[newCoord.x][newCoord.y].icon;
                let lastCoord = matrix[downCoord.x][downCoord.y].icon;

                matrix[newCoord.x][newCoord.y].icon = lastCoord;
                matrix[downCoord.x][downCoord.y].icon = last2Coords;

                let found = remove();
                if (found != true) {
                    matrix[newCoord.x][newCoord.y].icon = last2Coords;
                    matrix[downCoord.x][downCoord.y].icon = lastCoord;
                }

                downCoord = null;
                mouse = false;
            }

            drawScreen();
        }
    });


    canvas.addEventListener("mouseup", function () {
        mouse = false;
        downCoord = null;
        drawScreen();
    });

    canvas.addEventListener("touchstart", function (e) {
        if(isPaused) return;

        downCoord = getTouchPosition(canvas, e);
        if (downCoord !== false) {
            mouse = true;
            drawScreen();
        }
    });

    canvas.addEventListener("touchmove", function (e) {
        if (mouse == true) {
            let newCoord = getTouchPosition(canvas, e);

            if (newCoord === false) return;

            let moveX = newCoord.x - downCoord.x;
            let moveY = newCoord.y - downCoord.y;

            if (moveX <= -2 || moveX >= 2 || moveY <= -2 || moveY >= 2 || (moveX != 0 && moveY != 0)) {
                mouse = false;
                return;
            }

            else if (moveX == -1 || moveX == 1 || moveY == -1 || moveY == 1) {
                let last2Coords = matrix[newCoord.x][newCoord.y].icon;
                let lastCoord = matrix[downCoord.x][downCoord.y].icon;

                matrix[newCoord.x][newCoord.y].icon = lastCoord;
                matrix[downCoord.x][downCoord.y].icon = last2Coords;

                let found = remove();
                if (found != true) {
                    matrix[newCoord.x][newCoord.y].icon = last2Coords;
                    matrix[downCoord.x][downCoord.y].icon = lastCoord;
                }

                drawScreen();
                mouse = false;
            }
        }
    });


    canvas.addEventListener("touchend", function () {
        mouse = false;
        downCoord = null;
        drawScreen();
    });
}



window.addEventListener("load", () => {
    createjs.Sound.registerSound("audio/crunch.1.ogg", "eat");
});
