class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cell {
    icon;
    fall = 0; //Y

    constructor(icon, fall) {
        this.icon = icon
        if(fall) this.fall = fall;
    }
}

/** @type Cell[] */
var matrix = [];
var images = [];

const scoreMultipliers = [1, 2.34, 3.5];
const timeMultipliers = [2, 2.5, 3];
const imageCounts = [5, 6, 7];
const animationTime = [1, 1.5, 2];

const size = new Location(10,9);
let isPaused = false;

let score;
let difficulty;
let scoreMultiplier;
let animate;

let downCoord, firstCoord;
downCoord = null;

let move;
move = null;

let bgMusic;

let eat;
let animating = false;



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
    animate = animationTime[difficulty];
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
            column.push(new Cell(randomShape(), size.y*79));
        }
    }

    for (let i = 0; i < imageCount; i++)
        images.push($("i" + i));
}

function fallAnimation() {
    if(!animating) return;

    let found = false;
    for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
            if (matrix[x][y].fall >= 7.9*animate){
                matrix[x][y].fall -= 7.9*animate;
                found = true;
            }
            else matrix[x][y].fall = 0;
        }
    }

    drawScreen();

    if(!found) {
        animating = false;
        remove();
    }
}

function drawScreen() {
    const playGame = $("playGame");
    const pg = playGame.getContext("2d");
    pg.clearRect(0, 0, playGame.width, playGame.height);

    for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
            let cell2 = matrix[x][y];

            if(downCoord !== null && downCoord.x == x && downCoord.y == y){
                if(move !== null){
                    pg.drawImage(
                        images[cell2.icon], 
                        79 * x + 16 + move.x, 
                        79 * y + 16 + move.y - cell2.fall, 
                        79-26, 79-26
                    );
                }
                else{
                    pg.drawImage(
                        images[cell2.icon], 
                        79 * x+16, 
                        79 * y+16 - cell2.fall, 
                        79-26, 79-26
                    );
                }
            }
            else{
                pg.drawImage(
                    images[cell2.icon], 
                    79 * x, 
                    79 * y - cell2.fall, 
                    79, 79
                );
            }
        }
    }
}

function remove(){
    var found = false;
    let cell;

    //vertical
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

                for (k = 0; k < number; k++) {
                    let fall = matrix[x][y+k].fall;

                    matrix[x].splice(y+k, 1);

                    matrix[x] = [new Cell(randomShape(), fall)].concat(matrix[x]);
                }
                found = true;


                if (eat === true) {
                    for (i = 0; i < y+number; i++){
                        matrix[x][i].fall += 79 * number;
                    }
                }

                time += Math.floor((number - 3) * timeMultiplier);
                score += Math.round((number + (number - 3)) * scoreMultiplier);
            }
        }
    }

    //horizontal
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
                    let fall = matrix[x+k][y].fall;
                    
                    matrix[x+k].splice(y, 1);

                    matrix[x + k] = [new Cell(randomShape(), fall)].concat(matrix[x + k]);
                }
                found = true;

                if(eat) {
                    for (k = x; k < x+number; k++) {
                        for (i = 0; i <= y; i++){
                            matrix[k][i].fall += 79;
                        }
                    }
                }

                time += Math.floor((number - 3) * timeMultiplier);
                score += Math.round((number + (number - 3)) * scoreMultiplier);
            }
        }
    }

    if(found) {
        animating = true;
    }

    return found;
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
    gameValue();

    time = 60;
    score = 0;
    countDown = setInterval(setTime, 1000);
    animation = setInterval(fallAnimation, 10);
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
    animating = true;

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
            const rect = canvas.getBoundingClientRect();
            let x = e.clientX - rect.left;  
            let y = e.clientY - rect.top;
            x -= firstCoord.x;
            y -= firstCoord.y;

            move = new Location(x, y);

            let newCoord = getCursorPosition(canvas, e);

            if (newCoord === false) {
                drawScreen();
                return;
            }

            let moveX = newCoord.x - downCoord.x;
            let moveY = newCoord.y - downCoord.y;

            if (moveX <= -2 || moveX >= 2 || moveY <= -2 || moveY >= 2 || (moveX != 0 && moveY != 0)) {
                downCoord = null;
                move = null;
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
                move = null;
                mouse = false;
            }

            drawScreen();
        }
    });


    canvas.addEventListener("mouseup", function () {
        mouse = false;
        move = null;
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
