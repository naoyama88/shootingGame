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

class Game {
    constructor(controller) {
        this.controller = controller;
        this.match = null;
    }

    start() {
        let hero = new Sprite(
            "hero",
            INIT_HERO_POSITION_X - HERO_SIZE_X / 2,
            INIT_HERO_POSITION_Y,
            HERO_SIZE_X,
            HERO_SIZE_Y
        );
        let field = new Field(SCREEN_LEFT, SCREEN_TOP, SCREEN_RIGHT, SCREEN_BOTTOM, hero);
        this.match = new Match(field);
        loop();
    }

    handleControls() {
        if (this.controller.up && !this.match.ended) {
            this.match.field.hero.y -= HERO_MOVEMENT;
        }
        if (this.controller.down && !this.match.ended) {
            this.match.field.hero.y += HERO_MOVEMENT;
        }
        if (this.controller.left && !this.match.ended) {
            this.match.field.hero.x -= HERO_MOVEMENT;
        }
        if (this.controller.right && !this.match.ended) {
            this.match.field.hero.x += HERO_MOVEMENT;
        }
        if (this.controller.space && !this.ended) {
            this.match.field.newLaser();
        }
        if (this.controller.enter && this.ended === true) {
            this.restart();
        }

        this.match.field.ensureBounds(hero);
    }

    gameOver() {
        this.match.ended = true;
        let heroElm = document.getElementById(hero.id);
        heroElm.style.visibility = "hidden";
        gameOverElm = document.getElementById("gameover");
        gameOverElm.style.visibility = "visible";
        restartElm = document.getElementById("restart");
        restartElm.style.visibility = "visible";
    }

    restart() {
        console.log("restart()");

        for (let i = 0; i < this.match.field.enemies.length; i++) {
            document.getElementById(this.match.field.enemies[i].id).remove();
        }
        for (let i = 0; i < this.match.field.lasers.length; i++) {
            document.getElementById(this.match.field.lasers[i].id).remove();
        }

        let hero = new Sprite(
            "hero",
            INIT_HERO_POSITION_X - HERO_SIZE_X / 2,
            INIT_HERO_POSITION_Y,
            HERO_SIZE_X,
            HERO_SIZE_Y
        );
        let field = new Field(SCREEN_LEFT, SCREEN_TOP, SCREEN_RIGHT, SCREEN_BOTTOM, hero);
        this.match = new Match(field);
        this.match.field.enemies = new Array();
        this.match.field.lasers = new Array();
        this.match.field.hero.setPosition();
        View.setHidden(elmGameOver);
        View.setHidden(elmRestart);

        this.match.iterations = 0;
    }
}

class Match {
    constructor(field) {
        this.lastLoopRun = 0;
        this.iterations = 0;
        this.field = field;
        this.ended = false;
        this.score = 0;
    }

    showScore() {
        if (!this.ended) {
            scoreElement.innerHTML = "SCORE: " + this.score;
        }
    }
}

class Controller {
    leftKey;
    rightKey;
    upKey;
    downKey;
    spaceKey;
    enterKey;
    left = false;
    right = false;
    up = false;
    down = false;
    space = false;
    enter = false;
    constructor(leftKey, rightKey, upKey, downKey, spaceKey, enterKey) {
        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.upKey = upKey;
        this.downKey = downKey;
        this.spaceKey = spaceKey;
        this.enterKey = enterKey;
    }

    toggleKey(keyCode, isPressed) {
        console.log(keyCode);
        switch (keyCode) {
            case LEFT_KEY:
                this.left = isPressed;
                break;
            case RIGHT_KEY:
                this.right = isPressed;
                break;
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

class Sprite {
    id;
    x;
    y;
    width;
    height;
    constructor(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setPosition() {
        let e = document.getElementById(this.id);
        e.style.left = this.x + "px";
        e.style.top = this.y + "px";
    }
}

class Field {
    constructor(startX, startY, endX, endY, hero) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.enemies = new Array();
        this.lasers = new Array();
        this.hero = hero;
    }

    pushEnemy(enemy) {
        this.enemies.push(enemy);
    }

    pushLaser(laser) {
        this.lasers.push(laser);
    }

    ensureBounds(sprite, ignoreY) {
        if (sprite.x < this.startX) {
            sprite.x = this.startX;
        }
        if (!ignoreY && sprite.y < this.startY) {
            sprite.y = this.startY;
        }
        if (sprite.x + sprite.w > this.endX) {
            sprite.x = this.endX - sprite.w;
        }
        if (!ignoreY && sprite.y + sprite.h > this.endY) {
            sprite.y = this.endY - sprite.h;
        }
    }

    addEnemy() {
        let interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV01;
        // if (iterations > ITERATIONS_LV04) {
        //     interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV04;
        // } else if (iterations > ITERATIONS_LV03) {
        //     interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV03;
        // } else if (iterations > ITERATIONS_LV02) {
        //     interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV02;
        // }

        if (Util.getRandom(interval) === 0) {
            let elementName = "enemy" + Util.getRandom(10000000);
            let enemy = new Sprite(
                elementName,
                Util.getRandom(450),
                INIT_ENEMY_POSITION_Y,
                ENEMY_SIZE_X,
                ENEMY_SIZE_Y
            );

            let element = document.createElement("div");
            element.id = enemy.id;
            element.className = "enemy";
            document.getElementById("container").appendChild(element);

            this.pushEnemy(enemy);
        }
    }

    newLaser() {
        let laserName = "laser" + Util.getRandom(10000000);
        /**
         * theory of calculation
         *     laser.x = hero.x + (hero.w / 2) - (laser.w / 2)
         *     laser.y = hero.y - laser.h
         * But actually these thoery doesn't work on practice
         * So use correction value
         */
         // "-3" is correction value
         // "+25" is correction value
        let laser = new Sprite(
            laserName,
            game.match.field.hero.x + game.match.field.hero.w / 2 - LASER_SIZE_X / 2 - 3,
            game.match.field.hero.y - LASER_SIZE_Y + 25,
            LASER_SIZE_X,
            LASER_SIZE_Y
        );
        console.log(laser);

        let laserElm = document.createElement("div");
        laserElm.id = laser.id;
        laserElm.className = "laser";
        document.getElementById("container").appendChild(laserElm);

        game.match.field.pushLaser(laser);
    }

    showSprites() {
        this.hero.setPosition();
        for (let i = 0; i < this.lasers.length; i++) {
            this.lasers[i].setPosition();
        }
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].setPosition();
        }
    }

    checkCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            if (intersects(laser, this.enemies[i])) {
                let element = document.getElementById(
                    this.enemies[i].id
                );
                element.style.visibility = "hidden";
                element.parentNode.removeChild(element);
                this.enemies.splice(i, 1);
                i--;
                laser.y = -laser.h;
                score += BASIC_SCORE_POINT;
            } else if (intersects(hero, this.enemies[i])) {
                gameOver();
            } else if (
                this.enemies[i].y + this.enemies[i].h >=
                SCREEN_BOTTOM + 40
            ) {
                let element = document.getElementById(
                    this.enemies[i].id
                );
                element.style.visibility = "hidden";
                element.parentNode.removeChild(element);
                this.enemies.splice(i, 1);
                i--;
            }
        }
    }
}

let controller = new Controller(
    LEFT_KEY,
    RIGHT_KEY,
    UP_KEY,
    DOWN_KEY,
    SPACE_KEY,
    ENTER_KEY
);
let game = new Game(controller);

let intersects = (a, b) => {
    return (
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
};

document.onkeydown = function(e) {
    game.controller.toggleKey(e.keyCode, true);
};

document.onkeyup = function(e) {
    game.controller.toggleKey(e.keyCode, false);
};

class View {
    updatePosition() {
        for (let i = 0; i < game.match.field.enemies.length; i++) {
            game.match.field.enemies[i].y += 4;
            game.match.field.enemies[i].x += Util.getRandom(7) - 3;
            game.match.field.ensureBounds(game.match.field.enemies[i], true);
        }

        for (let i = 0; i < game.match.field.lasers.length; i++) {
            game.match.field.lasers[i].y -= 12;
            game.match.field.ensureBounds(game.match.field.lasers[i], true);
        }
    }

    static setVisible(elm) {
        elm.style.visibility = "visible";
    }
    
    static setHidden(elm) {
        elm.style.visibility = "hidden";
    }
}

class Util {
    static getRandom(maxSize) {
        return parseInt(Math.random() * maxSize);
    }
}

function loop() {
    const time = new Date().getTime();
    if (time - game.match.lastLoopRun > 40) {
        view.updatePosition();
        game.handleControls();
        game.match.field.checkCollisions();

        if (game.match.ended === false) {
            game.match.field.addEnemy();
        }

        game.match.field.showSprites();
        game.match.showScore();

        game.match.lastLoopRun = time;
        game.match.iterations++;
    }
    setInterval('loop()', 20);
}

let view = new View();
elmRestart.addEventListener("click", restart);

game.ended = false;
game.start();
