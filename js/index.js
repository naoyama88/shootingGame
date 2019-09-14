"use strict";

const HERO_MOVEMENT = 10;
const BASIC_SCORE_POINT = 100;
let heroElm = document.getElementById("hero");
let elmGameOver = document.getElementById("gameover");
let elmRestart = document.getElementById("restart");
let scoreElement = document.getElementById("score");

class Game {
    controller;
    match;
    constructor(controller) {
        this.controller = controller;
        this.match = null;
    }

    start() {
        this.match = new Match();
        loop();
    }

    handleControls() {
        if (this.match.ended) {
            if (this.controller.enter) {
                this.restart();
            }
        } else {
            if (this.controller.up) {
                this.match.hero.y -= HERO_MOVEMENT;
            }
            if (this.controller.down) {
                this.match.hero.y += HERO_MOVEMENT;
            }
            if (this.controller.left) {
                this.match.hero.x -= HERO_MOVEMENT;
            }
            if (this.controller.right) {
                this.match.hero.x += HERO_MOVEMENT;
            }
            if (this.controller.space) {
                this.match.newLaser();
            }
        }

        this.match.ensureBounds(this.match.hero);
    }

    gameOver() {
        if (!this.match.ended) {
            this.match.ended = true;
            View.setHidden(heroElm);
            View.setVisible(elmGameOver);
            View.setVisible(elmRestart);
        }
    }

    restart() {
        if (this.match !== null) {
            for (let i = 0; i < this.match.enemies.length; i++) {
                View.remove(this.match.enemies[i].id);
            }
            for (let i = 0; i < this.match.lasers.length; i++) {
                View.remove(this.match.lasers[i].id);
            }
        }

        this.match = new Match();
        View.setPosition(this.match.hero.id, this.match.hero.x, this.match.hero.y);
        View.setVisible(heroElm);
        View.setHidden(elmGameOver);
        View.setHidden(elmRestart);

        this.match.iterations = 0;
    }
}

class Match {
    lastLoopRun;
    iterations;
    ended;
    score;
    left;
    top;
    right;
    bottom;
    enemies;
    lasers;
    hero;
    createdLastLaserAt;
    constructor() {
        const SCREEN_LEFT = 20;
        const SCREEN_RIGHT = 480;
        const SCREEN_TOP = 20;
        const SCREEN_BOTTOM = 480;
        this.lastLoopRun = 0;
        this.iterations = 0;
        this.ended = false;
        this.score = 0;
        this.left = SCREEN_LEFT;
        this.top = SCREEN_TOP;
        this.right = SCREEN_RIGHT;
        this.bottom = SCREEN_BOTTOM;
        this.enemies = new Array();
        this.lasers = new Array();
        this.hero = new Hero((this.right - this.left) / 2, this.bottom);
        this.createdLastLaserAt = 0;
    }

    showScore() {
        if (!this.ended) {
            View.setInnerHtml(scoreElement, "SCORE: " + this.score);
        }
    }

    pushEnemy(enemy) {
        this.enemies[this.enemies.length] = enemy;
    }

    pushLaser(laser) {
        this.lasers[this.lasers.length] = laser;
    }

    ensureBounds(sprite, ignoreY) {
        if (sprite.x < this.left) {
            sprite.x = this.left;
        }
        if (!ignoreY && sprite.y < this.top) {
            sprite.y = this.top;
        }
        if (sprite.x + sprite.w > this.right) {
            sprite.x = this.right - sprite.w;
        }
        if (!ignoreY && sprite.y + sprite.h > this.bottom) {
            sprite.y = this.bottom - sprite.h;
        }
    }

    addEnemy() {
        const ITERATIONS_LV01 = 0;
        const ITERATIONS_LV02 = 500;
        const ITERATIONS_LV03 = 1000;
        const ITERATIONS_LV04 = 1500;

        const FREQUENCY_OF_ENEMY_APPEARANCE_LV01 = 50;
        const FREQUENCY_OF_ENEMY_APPEARANCE_LV02 = 35;
        const FREQUENCY_OF_ENEMY_APPEARANCE_LV03 = 20;
        const FREQUENCY_OF_ENEMY_APPEARANCE_LV04 = 5;
        // let interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV01;
        let interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV04;
        // if (iterations > ITERATIONS_LV04) {
        //     interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV04;
        // } else if (iterations > ITERATIONS_LV03) {
        //     interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV03;
        // } else if (iterations > ITERATIONS_LV02) {
        //     interval = FREQUENCY_OF_ENEMY_APPEARANCE_LV02;
        // }

        if (Util.getRandom(interval) === 0) {
            let enemy = new Pawn("enemy" + Util.getRandom(10000000));
            this.pushEnemy(enemy);
            View.createElementInContainer(enemy.id, "enemy");
        }
    }

    newLaser() {
        if (this.createdLastLaserAt < 20) {
            return;
        }
        this.createdLastLaserAt = 0;
        const laserId = "laser" + Util.getRandom(10000000);
        let laser = new NormalLaser(
            laserId,
            this.hero.x + this.hero.w / 2,
            this.hero.y
        );
        this.pushLaser(laser);
        View.createElementInContainer(laserId, "laser");
    }

    showSprites() {
        View.setPosition(this.hero.id, this.hero.x, this.hero.y);
        for (let i = 0; i < this.lasers.length; i++) {
            View.setPosition(this.lasers[i].id, this.lasers[i].x, this.lasers[i].y);
        }
        for (let i = 0; i < this.enemies.length; i++) {
            View.setPosition(this.enemies[i].id, this.enemies[i].x, this.enemies[i].y);
        }
    }

    checkCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            for (let y = 0; y < this.lasers.length; y++) {
                let enemy = this.enemies[i];
                let laser = this.lasers[y];
                if (intersects(laser, enemy)) {
                    View.remove(enemy.id);
                    this.enemies.splice(i, 1);
                    i--;
                    this.score += BASIC_SCORE_POINT;
                    View.remove(laser.id);
                    this.lasers.splice(y, 1);
                    y--;
                } else if (intersects(this.hero, enemy)) {
                    game.gameOver();
                } else if (enemy.y + enemy.h >= this.bottom + 40) {
                    View.remove(enemy.id);
                    this.enemies.splice(i, 1);
                    i--;
                } else if (laser.y + laser.h <= this.top) {
                    View.remove(laser.id);
                    this.lasers.splice(y, 1);
                    y--;
                }
            }
        }

        // for (let y = 0; y < this.lasers.length; y++) {
        //     let laser = this.lasers[y];
        //     if (laser.y + laser.h <= this.top) {
        //         View.remove(laser.id);
        //         this.lasers.splice(y, 1);
        //         y--;
        //     }
        // }
    }

    updatePosition() {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].y += 4;
            this.enemies[i].x += Util.getRandom(7) - 3;
            this.ensureBounds(this.enemies[i], true);
        }

        for (let i = 0; i < this.lasers.length; i++) {
            this.lasers[i].y -= 12;
            this.ensureBounds(this.lasers[i], true);
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
    left;
    right;
    up;
    down;
    space;
    enter;
    constructor() {
        const LEFT_KEY = 37;
        const UP_KEY = 38;
        const RIGHT_KEY = 39;
        const DOWN_KEY = 40;
        const SPACE_KEY = 32;
        const ENTER_KEY = 13;
        this.leftKey = LEFT_KEY;
        this.upKey = UP_KEY;
        this.rightKey = RIGHT_KEY;
        this.downKey = DOWN_KEY;
        this.spaceKey = SPACE_KEY;
        this.enterKey = ENTER_KEY;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.space = false;
        this.enter = false;
    }

    toggleKey(keyCode, isPressed) {
        switch (keyCode) {
            case this.leftKey:
                this.left = isPressed;
                break;
            case this.rightKey:
                this.right = isPressed;
                break;
            case this.upKey:
                this.up = isPressed;
                break;
            case this.downKey:
                this.down = isPressed;
                break;
            case this.spaceKey:
                this.space = isPressed;
                break;
            case this.enterKey:
                this.enter = isPressed;
                break;
        }
    }
}

class Sprite {
    constructor(id, x, y, w, h) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Hero extends Sprite {
    constructor(x, bottom) {
        const W = 20;
        const H = 20;
        super("hero", x - W / 2, bottom - H, W, H);
    }
}

class Enemy extends Sprite {
    constructor(id, x, y, w, h) {
        super(id, x, y, w, h);
    }
}

class Pawn extends Enemy {
    constructor(name) {
        const INIT_ENEMY_POSITION_Y = -40;
        const ENEMY_SIZE_X = 35;
        const ENEMY_SIZE_Y = 35;
        super(
            name,
            Util.getRandom(450),
            INIT_ENEMY_POSITION_Y,
            ENEMY_SIZE_X,
            ENEMY_SIZE_Y
        );
    }
}

class Laser extends Sprite {
    constructor(id, x, y, w, h) {
        super(id, x, y, w, h);
    }
}

class NormalLaser extends Laser {
    constructor(id, heroX, heroY) {
        const LASER_W = 2;
        const LASER_H = 50;
        // "-3" is correction value
        const x = heroX - LASER_W / 2 - 3;
        // "+25" is correction value
        const y = heroY - LASER_H + 25;
        super(id, x, y, LASER_W, LASER_H);
    }
}

let controller = new Controller();
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
    static setVisible(elm) {
        elm.style.visibility = "visible";
    }

    static setHidden(elm) {
        elm.style.visibility = "hidden";
    }

    static setPosition(id, x, y) {
        let elm = document.getElementById(id);
        elm.style.left = x + "px";
        elm.style.top = y + "px";
    }

    static setInnerHtml(elm, content) {
        elm.innerHTML = content;
    }

    static createElementInContainer(id, className) {
        let elm = document.createElement("div");
        elm.id = id;
        elm.className = className;
        document.getElementById("container").appendChild(elm);
    }

    static remove(id) {
        document.getElementById(id).remove();
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
        game.match.updatePosition();
        game.handleControls();
        game.match.checkCollisions();

        if (game.match.ended === false) {
            game.match.addEnemy();
        }

        game.match.showSprites();
        game.match.showScore();

        game.match.lastLoopRun = time;
        game.match.iterations++;

        game.match.createdLastLaserAt++;
    }
    setInterval("loop()", 20);
}

function restart() {
    game.restart();
}

let view = new View();
elmRestart.addEventListener("click", restart);

game.ended = false;
game.start();
