"use strict";

const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const SPACE_KEY = 32;
const ENTER_KEY = 13;
const HERO_MOVEMENT = 10;

const INIT_HERO_POSITION_X = 250;
const INIT_HERO_POSITION_Y = 460;
const LASER_FROM_X = 0;
const LASER_FROM_Y = -120;
const INIT_ENEMY_POSITION_Y = -40;

const HERO_SIZE_X = 20;
const HERO_SIZE_Y = 20;
const LASER_SIZE_X = 2;
const LASER_SIZE_Y = 50;
const ENEMY_SIZE_X = 35;
const ENEMY_SIZE_Y = 35;

const SCREEN_LEFT = 20;
const SCREEN_RIGHT = 480;
const SCREEN_TOP = 20;
const SCREEN_BOTTOM = 480;

const FREQUENCY_OF_ENEMY_APPEARANCE_LV01 = 50;
const FREQUENCY_OF_ENEMY_APPEARANCE_LV02 = 35;
const FREQUENCY_OF_ENEMY_APPEARANCE_LV03 = 20;
const FREQUENCY_OF_ENEMY_APPEARANCE_LV04 = 5;

const ITERATIONS_LV01 = 0;
const ITERATIONS_LV02 = 500;
const ITERATIONS_LV03 = 1000;
const ITERATIONS_LV04 = 1500;

const BASIC_SCORE_POINT = 100;

let heroElm = document.getElementById("hero");
let elmGameOver = document.getElementById("gameover");
let elmRestart = document.getElementById("restart");
let scoreElement = document.getElementById("score");

let lastLoopRun = 0;
let score = 0;
let iterations = 0;
let ended = false;

class Controller {
    left;
    right;
    up;
    down;
    space;
    enter;
    constructor() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.space = false;
        this.enter = false;
    }

    get left() {
        return this.left;
    }

    get right() {
        return this.right;
    }

    get up() {
        return this.up;
    }

    get down() {
        return this.down;
    }

    get space() {
        return this.space;
    }

    get enter() {
        return this.enter;
    }

    set left(left) {
        return this.left;
    }

    set right(right) {
        this.right = right;
    }

    set up(up) {
        this.up = up;
    }

    set down(down) {
        this.down = down;
    }

    set space(space) {
        this.space = space;
    }

    set enter(enter) {
        this.enter = enter;
    }

    toggleKey(keyCode, isPressed) {
        if (keyCode === LEFT_KEY) {
            this.left = isPressed;
        }
        if (keyCode === RIGHT_KEY) {
            this.right = isPressed;
        }
        if (keyCode === UP_KEY) {
            this.up = isPressed;
        }
        if (keyCode === DOWN_KEY) {
            this.down = isPressed;
        }
        if (keyCode === SPACE_KEY) {
            this.space = isPressed;
        }
        if (keyCode === ENTER_KEY) {
            this.enter = isPressed;
        }
    }
}

let controller = new Controller();
let enemies = new Array();

let hero = createSprite(
    "hero",
    INIT_HERO_POSITION_X,
    INIT_HERO_POSITION_Y,
    HERO_SIZE_X,
    HERO_SIZE_Y
);
let laser = createSprite(
    "laser",
    LASER_FROM_X,
    LASER_FROM_Y,
    LASER_SIZE_X,
    LASER_SIZE_Y
);

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

document.onkeydown = function(e) {
    controller.toggleKey(e.keyCode, true);
};

document.onkeyup = function(e) {
    controller.toggleKey(e.keyCode, false);
};

function ensureBounds(sprite, ignoreY) {
    if (sprite.x < SCREEN_LEFT) {
        sprite.x = SCREEN_LEFT;
    }
    if (!ignoreY && sprite.y < SCREEN_TOP) {
        sprite.y = SCREEN_TOP;
    }
    if (sprite.x + sprite.w > SCREEN_RIGHT) {
        sprite.x = SCREEN_RIGHT - sprite.w;
    }
    if (!ignoreY && sprite.y + sprite.h > SCREEN_BOTTOM) {
        sprite.y = SCREEN_BOTTOM - sprite.h;
    }
}

function setPosition(sprite) {
    let e = document.getElementById(sprite.id);
    e.style.left = sprite.x + "px";
    e.style.top = sprite.y + "px";
}

function handleControls() {
    if (controller.up && !ended) {
        hero.y -= HERO_MOVEMENT;
    }
    if (controller.down && !ended) {
        hero.y += HERO_MOVEMENT;
    }
    if (controller.left && !ended) {
        hero.x -= HERO_MOVEMENT;
    }
    if (controller.right && !ended) {
        hero.x += HERO_MOVEMENT;
    }
    if (controller.space && laser.y <= LASER_FROM_Y && !ended) {
        // TODO this if statement is the thing that limit laser only one
        
        /**
         * theory of calculation
         *     laser.x = hero.x + (hero.w / 2) - (laser.w / 2)
         *     laser.y = hero.y - laser.h
         * But actually these thoery doesn't work on practice
         * So use correction value
         */
        laser.x = hero.x + hero.w / 2 - laser.w / 2 - 3; // "-3" is correction value
        laser.y = hero.y - laser.h + 25; // "+25" is correction value
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
            score += BASIC_SCORE_POINT;
        } else if (intersects(hero, enemies[i])) {
            gameOver();
        } else if (enemies[i].y + enemies[i].h >= SCREEN_BOTTOM + 40) {
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
    if (!ended) {
        scoreElement.innerHTML = "SCORE: " + score;
    }
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
    let interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV01;
    if (iterations > ITERATIONS_LV04) {
        interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV04;
    } else if (iterations > ITERATIONS_LV03) {
        interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV03;
    } else if (iterations > ITERATIONS_LV02) {
        interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV02;
    }

    if (getRandom(interval) === 0) {
        let elementName = "enemy" + getRandom(10000000);
        let enemy = createSprite(
            elementName,
            getRandom(450),
            INIT_ENEMY_POSITION_Y,
            ENEMY_SIZE_X,
            ENEMY_SIZE_Y
        );

        let element = document.createElement("div");
        element.id = enemy.id;
        element.className = "enemy";
        document.getElementById("container").appendChild(element);

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

function start() {
    console.log("start()");
    ended = false;
    hero = createSprite(
        "hero",
        INIT_HERO_POSITION_X,
        INIT_HERO_POSITION_Y,
        HERO_SIZE_X,
        HERO_SIZE_Y
    );
    laser = createSprite(
        "laser",
        LASER_FROM_X,
        LASER_FROM_Y,
        LASER_SIZE_X,
        LASER_SIZE_Y
    );
    score = 0;
    for (let i = 0; i < enemies.length; i++) {
        document.getElementById(enemies[i].id).remove();
    }
    enemies = new Array();
    setPosition(hero);
    setPosition(laser);
    getVisible(heroElm);
    getHidden(elmGameOver);
    getHidden(elmRestart);

    iterations = 0;
}

function getVisible(elm) {
    elm.style.visibility = "visible";
}

function getHidden(elm) {
    elm.style.visibility = "hidden";
}

elmRestart.addEventListener("click", start);

loop();
