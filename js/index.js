let LEFT_KEY = 37;
let UP_KEY = 38;
let RIGHT_KEY = 39;
let DOWN_KEY = 40;
let SPACE_KEY = 32;
let ENTER_KEY = 13;
let HERO_MOVEMENT = 10;

let heroElm = document.getElementById("hero");
let elemGameOver = document.getElementById("gameover");
let elmRestart = document.getElementById("restart");

let lastLoopRun = 0;
let score = 0;
let iterations = 0;
let ended = false;

let controller = new Object();
let enemies = new Array();

let hero = createSprite("hero", 250, 460, 20, 20);
let laser = createSprite("laser", 0, -120, 2, 50);

let intersects = (a, b) => {
    return (
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
};

function createSprite(id, x, y, w, h) {
    let result = new Object();
    result.id = id;
    result.x = x;
    result.y = y;
    result.w = w;
    result.h = h;

    return result;
}

function toggleKey(keyCode, isPressed) {
    if (keyCode === LEFT_KEY) {
        controller.left = isPressed;
    }

    if (keyCode === RIGHT_KEY) {
        controller.right = isPressed;
    }

    if (keyCode === UP_KEY) {
        controller.up = isPressed;
    }

    if (keyCode === DOWN_KEY) {
        controller.down = isPressed;
    }
    if (keyCode === SPACE_KEY) {
        controller.space = isPressed;
    }
    if (keyCode === ENTER_KEY) {
        controller.enter = isPressed;
    }
}

function ensureBounds(sprite, ignoreY) {
    if (sprite.x < 20) {
        sprite.x = 20;
    }
    if (!ignoreY && sprite.y < 20) {
        sprite.y = 20;
    }
    if (sprite.x + sprite.w > 480) {
        sprite.x = 480 - sprite.w;
    }
    if (!ignoreY && sprite.y + sprite.h > 480) {
        sprite.y = 480 - sprite.h;
    }
}

function setPosition(sprite) {
    let e = document.getElementById(sprite.id);
    e.style.left = sprite.x + "px";
    e.style.top = sprite.y + "px";
}

function handleControls() {
    if (controller.up) {
        hero.y -= HERO_MOVEMENT;
    }
    if (controller.down) {
        hero.y += HERO_MOVEMENT;
    }
    if (controller.left) {
        hero.x -= HERO_MOVEMENT;
    }
    if (controller.right) {
        hero.x += HERO_MOVEMENT;
    }
    if (controller.space && laser.y <= -120) {
        laser.x = hero.x + 6;
        laser.y = hero.y - laser.h;
    }
    if (controller.enter && ended === true) {
        start();
    }

    ensureBounds(hero);
}

function checkCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        if (intersects(laser, enemies[i])) {
            let element = document.getElementById(enemies[i].id);
            element.style.visibility = "hidden";
            element.parentNode.removeChild(element);
            enemies.splice(i, 1);
            i--;
            laser.y = -laser.h;
            score += 100;
        } else if (intersects(hero, enemies[i])) {
            gameOver();
        } else if (enemies[i].y + enemies[i].h >= 500) {
            let element = document.getElementById(enemies[i].id);
            element.style.visibility = "hidden";
            element.parentNode.removeChild(element);
            enemies.splice(i, 1);
            i--;
        }
    }
}

function gameOver() {
    ended = true;
    let element = document.getElementById(hero.id);
    element.style.visibility = "hidden";
    elmGameOver = document.getElementById("gameover");
    elmGameOver.style.visibility = "visible";
    elmRestart = document.getElementById("restart");
    elmRestart.style.visibility = "visible";
}

function showSprites() {
    setPosition(hero);
    setPosition(laser);
    for (let i = 0; i < enemies.length; i++) {
        setPosition(enemies[i]);
    }
    let scoreElement = document.getElementById("score");
    scoreElement.innerHTML = "SCORE: " + score;
}

function updatePosition() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += 4;
        enemies[i].x += getRandom(7) - 3;
        ensureBounds(enemies[i], true);
    }
    laser.y -= 12;
}

function addEnemy() {
    let interval = 50;
    if (iterations > 1500) {
        interval = 5;
    } else if (iterations > 1000) {
        interval = 20;
    } else if (iterations > 500) {
        interval = 35;
    }

    if (getRandom(interval) === 0) {
        let elementName = "enemy" + getRandom(10000000);
        let enemy = createSprite(elementName, getRandom(450), -40, 35, 35);

        let element = document.createElement("div");
        element.id = enemy.id;
        element.className = "enemy";
        document.children[0].appendChild(element);

        enemies[enemies.length] = enemy;
    }
}

function getRandom(maxSize) {
    return parseInt(Math.random() * maxSize);
}

function loop() {
    if (new Date().getTime() - lastLoopRun > 40) {
        updatePosition();
        handleControls();
        checkCollisions();

        if (ended === false) {
            addEnemy();
        }

        showSprites();

        lastLoopRun = new Date().getTime();
        iterations++;
    }
    setTimeout("loop();", 2);
}

document.onkeydown = function(e) {
    toggleKey(e.keyCode, true);
};

document.onkeyup = function(e) {
    toggleKey(e.keyCode, false);
};

function start() {
    console.log("start()");
    ended = false;
    hero = createSprite("hero", 250, 460, 20, 20);
    laser = createSprite("laser", 0, -120, 2, 50);
    score = 0;
    for (let i = 0; i < enemies.length; i++) {
        document.getElementById(enemies[i].id).remove();
    }
    enemies = new Array();
    setPosition(hero);
    setPosition(laser);
    document.getElementById(hero.id).style.visibility = "visible";
    elemGameOver.style.visibility = "hidden";
    elmRestart.style.visibility = "hidden";

    iterations = 0;
}

elmRestart.addEventListener(MouseEvent, start());

loop();
