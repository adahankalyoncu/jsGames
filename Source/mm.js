var elms = [];
var open1 = -1, open2 = -1;

function startingScore(count) {
    return Math.round((0.05485 * Math.pow(count, 3) - 1.599 * Math.pow(count, 2) + 18.912 * count - 45) * 1.5);
}

let backNumber = 0;
let countDown;
let score;

function createCard(icon) {
    let div = document.createElement("div");
    div.className = "back";

    //array index is the index of the card
    div.arr_ind = elms.length;
    //index of the symbol, two of each
    div.icon_ind = icon;

    div.onclick = function () {
        if (open1 == div.arr_ind) {
            return;
        }
        //if nothing is open
        else if (open1 == -1) {
            open1 = div.arr_ind;
            createjs.Sound.play("flip");
        }
        else if (open2 == -1) {
            open2 = div.arr_ind;
            createjs.Sound.play("flip");
            if (elms[open1].icon_ind == elms[open2].icon_ind) {
                elms[open1].onclick = function() { };
                div.onclick = function () { };
                open1 = -1;
                open2 = -1;
                backNumber--;

                if (backNumber == 0) {
                    let winbg = $("bg-win");
                    let wellbg = $("bg-well");
                    clearInterval(countDown);
                    $("gameScore").innerHTML = score;
                    $("cont").style.display = "none";
                    $("scorePanel").style.display = "block";
                    $("youWin").style.display = "flex";
                    $("youWin").style.height = "100%";
                    $("playAgain").style.display = "block";
                    $("basic").style.display = "block";
                    $("play").style.display = "none";
                    $("bg-music").pause();
                    winbg.play();
                    winbg.volume = 0.3;
                    wellbg.play();

                }
            }
        }
        else {
            elms[open1].className = "back";
            elms[open2].className = "back";
            createjs.Sound.play("flip");
            open1 = div.arr_ind;
            open2 = -1;
        }

        div.className = "front";
    };

    let img = document.createElement("img");
    img.src = "images/icons/" + icon + ".png";
    div.appendChild(img);
    $("cont").appendChild(div);
    elms.push(div);
}

function createCards(count) {
    let index = [];
    var bgMusic = $("bg-music");
    bgMusic.currentTime = 0;
    bgMusic.play();
    bgMusic.volume = 0.5;

    for (let i = 0; i < 36; i++) {
        index.push(i);
    }
    shuffle(index);
    index = index.slice(0, count)

    for (let i = 0; i < count; i++) {
        index.push(index[i]);
    }
    shuffle(index);

    for (let i of index) {
        createCard(i);
    }

    backNumber = count;
    const gameScore = $("gameScore");

    $("cont").style.display = "block";
    $("level").style.display = "none";
    $("label").style.display = "none";
    $("play").style.display = "flex";
    $("scorePanel").style.display = "block";
    $("youWin").style.display = "block";
    $("youWin").style.height = "";
    $("basic").style.display = "none";
    $("settings").style.display = "none";



    score = startingScore(count);

    countDown = setInterval(function () {
        score--;

        if (score <= 0) {
            let overbg = $("bg-over");
            let overgame = $("bg-over-2");
            score = 0;
            cont.style.display = "none";
            $("scorePanel").style.display = "none";
            $("gameOver").style.display = "flex";
            $("play").style.display = "none";
            bgMusic.pause();
            overbg.play();
            overgame.play();
            tryAgain.onclick = function () {
                location.reload();
            }

            clearInterval(countDown);
        }

        gameScore.innerHTML = score;
    }, 1000);


    gameScore.innerHTML = score;
}


window.addEventListener("load", () => {
    createjs.Sound.registerSound("audio/flip.mp3", "flip");
});

