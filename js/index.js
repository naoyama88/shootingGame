"use strict";

const ID_CONTAINER = "container";
const ID_BACKGROUND = "background";
const ID_HERO = "hero";
const ID_SCORE = "score";
const ID_PAUSE = "pause";
const ID_GAMEOVER = "gameover";
const ID_HOWTOPAGE = "howToPage";

const ID_STARTBUTTON = "startButton";
const ID_BACKTOSTART = "backToStart";
const ID_PLAYAGAIN = "playAgain";
const ID_HOWTOPLAYBUTTON = "howToButton";

const CLASS_MENUFOCUS = "menuFocus";

// will be delete
const ID_LOGO = "logo";

const HERO_MOVEMENT = 10;
const BASIC_SCORE_POINT = 100;
let elmBackground = document.getElementById(ID_BACKGROUND);
let elmHero = document.getElementById(ID_HERO);
let elmGameOver = document.getElementById(ID_GAMEOVER);
let elmScore = document.getElementById(ID_SCORE);
let elmPause = document.getElementById(ID_PAUSE);
let elmHowTo = document.getElementById(ID_HOWTOPAGE);
// for event loop setInterval
let t;

class Game {
    controller;
    match;
    startMenu;
    afterDefeatedMenu;
    constructor(controller) {
        this.controller = controller;
        this.match = null;
        this.startMenu = new Array();
        this.startMenu[this.startMenu.length] = new StartMenuButton(
            ID_STARTBUTTON,
            true
        );
        this.startMenu[this.startMenu.length] = new StartMenuButton(
            ID_HOWTOPLAYBUTTON,
            false
        );
        this.afterDefeatedMenu = new Array();
        this.afterDefeatedMenu[
            this.afterDefeatedMenu.length
        ] = new AfterDefeatedMenuButton(ID_PLAYAGAIN, true);
        this.afterDefeatedMenu[
            this.afterDefeatedMenu.length
        ] = new AfterDefeatedMenuButton(ID_BACKTOSTART, false);
    }

    start() {
        loop();
    }

    startMatch() {
        this.removeStartLogo();
        this.removeAllStartMenu();
        this.removeAllMenuOnAfterDefeatedScreen();

        this.match = new Match();
        this.createScore();
        this.createHero();
    }

    openHowToPlayScreen() {
        this.removeStartScreen();
        this.createHowToScreen();
    }

    handleControls() {
        if (this.match.ended) {
            if (this.controller.upKeyWork && this.controller.up) {
                this.controller.up = false;
                disableUpKey();
                setTimeout(function() {
                    game.controller.upKeyWork = true;
                }, 100);
                for (let i = 0; i < this.afterDefeatedMenu.length; i++) {
                    if (this.afterDefeatedMenu[i].focus) {
                        this.afterDefeatedMenu[i].focus = false;
                        View.removeClass(
                            this.afterDefeatedMenu[i].id,
                            CLASS_MENUFOCUS
                        );
                        if (i === 0) {
                            this.afterDefeatedMenu[
                                this.afterDefeatedMenu.length - 1
                            ].focus = true;
                            View.addClass(
                                this.afterDefeatedMenu[
                                    this.afterDefeatedMenu.length - 1
                                ].id,
                                CLASS_MENUFOCUS
                            );
                        } else {
                            this.afterDefeatedMenu[i - 1].focus = true;
                            View.addClass(
                                this.afterDefeatedMenu[i - 1].id,
                                CLASS_MENUFOCUS
                            );
                        }
                        break;
                    }
                }
            } else if (this.controller.downKeyWork && this.controller.down) {
                this.controller.down = false;
                disableDownKey();
                setTimeout(function() {
                    game.controller.downKeyWork = true;
                }, 100);
                for (let i = 0; i < this.afterDefeatedMenu.length; i++) {
                    if (this.afterDefeatedMenu[i].focus) {
                        this.afterDefeatedMenu[i].focus = false;
                        View.removeClass(
                            this.afterDefeatedMenu[i].id,
                            CLASS_MENUFOCUS
                        );
                        if (i + 1 < this.afterDefeatedMenu.length) {
                            this.afterDefeatedMenu[i + 1].focus = true;
                            View.addClass(
                                this.afterDefeatedMenu[i + 1].id,
                                CLASS_MENUFOCUS
                            );
                        } else {
                            this.afterDefeatedMenu[0].focus = true;
                            View.addClass(
                                this.afterDefeatedMenu[0].id,
                                CLASS_MENUFOCUS
                            );
                        }
                        break;
                    }
                }
            } else if (this.controller.enterKeyWork && this.controller.enter) {
                this.controller.enter = false;
                disableEnterKey();
                setTimeout(function() {
                    game.controller.enterKeyWork = true;
                }, 100);
                for (let i = 0; i < this.afterDefeatedMenu.length; i++) {
                    if (this.afterDefeatedMenu[i].focus) {
                        if (this.afterDefeatedMenu[i].id === ID_PLAYAGAIN) {
                            this.playAgain();
                        } else if (
                            this.afterDefeatedMenu[i].id === ID_BACKTOSTART
                        ) {
                            this.backToStart();
                        }
                        break;
                    }
                }
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
            if (this.controller.shiftKeyWork && this.controller.shift) {
                if (!this.match.paused) {
                    this.match.paused = true;
                    this.pause();
                } else {
                    this.match.paused = false;
                    this.resume();
                }
            }

            this.match.ensureBounds(this.match.hero);
        }
    }

    shiftKeyControls() {
        if (this.controller.shiftKeyWork && this.controller.shift) {
            this.controller.shiftKeyWork = false;
            if (!this.match.paused) {
                this.match.paused = true;
                this.pause();
            } else {
                this.match.paused = false;
                this.resume();
            }
        }
    }

    menuControls() {
        if (this.controller.upKeyWork && this.controller.up) {
            this.controller.up = false;
            disableUpKey();
            setTimeout(function() {
                game.controller.upKeyWork = true;
            }, 100);
            for (let i = 0; i < this.startMenu.length; i++) {
                if (this.startMenu[i].focus) {
                    this.startMenu[i].focus = false;
                    View.removeClass(this.startMenu[i].id, CLASS_MENUFOCUS);
                    if (i === 0) {
                        this.startMenu[this.startMenu.length - 1].focus = true;
                        View.addClass(
                            this.startMenu[this.startMenu.length - 1].id,
                            CLASS_MENUFOCUS
                        );
                    } else {
                        this.startMenu[i - 1].focus = true;
                        View.addClass(
                            this.startMenu[i - 1].id,
                            CLASS_MENUFOCUS
                        );
                    }
                    break;
                }
            }
        } else if (this.controller.downKeyWork && this.controller.down) {
            this.controller.down = false;
            disableDownKey();
            setTimeout(function() {
                game.controller.downKeyWork = true;
            }, 100);
            for (let i = 0; i < this.startMenu.length; i++) {
                if (this.startMenu[i].focus) {
                    this.startMenu[i].focus = false;
                    View.removeClass(this.startMenu[i].id, CLASS_MENUFOCUS);
                    if (i + 1 < this.startMenu.length) {
                        this.startMenu[i + 1].focus = true;
                        View.addClass(
                            this.startMenu[i + 1].id,
                            CLASS_MENUFOCUS
                        );
                    } else {
                        this.startMenu[0].focus = true;
                        View.addClass(this.startMenu[0].id, CLASS_MENUFOCUS);
                    }
                    break;
                }
            }
        } else if (this.controller.enterKeyWork && this.controller.enter) {
            this.controller.enter = false;
            disableEnterKey();
            setTimeout(function() {
                game.controller.enterKeyWork = true;
            }, 100);
            for (let i = 0; i < this.startMenu.length; i++) {
                if (this.startMenu[i].focus) {
                    if (this.startMenu[i].id === ID_STARTBUTTON) {
                        this.startMatch();
                    } else if (this.startMenu[i].id === ID_HOWTOPLAYBUTTON) {
                        this.openHowToPlayScreen();
                    }
                    break;
                }
            }
        }
    }

    howToControls() {
        if (this.controller.enterKeyWork && this.controller.enter) {
            disableEnterKey();
            setTimeout(function() {
                game.controller.enterKeyWork = true;
            }, 100);
            this.controller.enter = false;
            this.removeHowToScreen();
            this.createStartScreen();

            this.backToStart();
        }
    }

    gameOver() {
        if (!this.match.ended) {
            this.match.ended = true;
            this.removeHero();
            this.createGameOverLogo();
            this.createPlayAgainButton();
            this.createBackToStartButton(true);
        }
    }

    playAgain() {
        // remove
        this.removeAllEnemies();
        this.removeAllLasers();
        this.removeGameOverLogo();
        this.removeAllMenuOnAfterDefeatedScreen();

        // create
        this.match = new Match();
        this.initHero();
    }

    backToStart() {
        // remove
        this.removeMatchScreen();
        this.removeGameOverScreen();
        this.removeHowToScreen();
        // create
        this.createStartScreen();
    }

    pause() {
        this.match.paused = true;
        View.setAnimationPlayState(elmBackground, false);
        disableShiftKey();
        setTimeout(function() {
            game.controller.shiftKeyWork = true;
        }, 100);
        View.setVisible(elmPause);
        // TODO animation play state pause
        this.controller.shift = false;
    }

    resume() {
        this.match.paused = false;
        View.setAnimationPlayState(elmBackground, true);
        disableShiftKey();
        setTimeout(function() {
            game.controller.shiftKeyWork = true;
        }, 100);
        View.setHidden(elmPause);
        // TODO animation play state running
        this.controller.shift = false;
    }

    createStartScreen() {
        // logo
        this.createStartLogo();
        // start button
        this.createStartButton(true);
        // how to button
        this.createHowToButton(false);
        // focus on first button
        game.startMenu[0].focus = true;
    }

    createStartLogo() {
        let elm = View.createElementInContainer(ID_LOGO, ID_LOGO);
        View.setInnerHtmlById(ID_LOGO, "Space War");

        return elm;
    }

    createStartButton(isFocused) {
        let elm = View.createElementInContainer(ID_STARTBUTTON, ID_STARTBUTTON);
        View.setInnerHtmlById(ID_STARTBUTTON, "Start");
        View.addEventListenerToElm(ID_STARTBUTTON, "click", startMatch);
        if (isFocused) {
            View.addClass(ID_STARTBUTTON, CLASS_MENUFOCUS);
        }

        return elm;
    }

    createHowToButton(isFocused) {
        let elm = View.createElementInContainer(
            ID_HOWTOPLAYBUTTON,
            ID_HOWTOPLAYBUTTON
        );
        View.setInnerHtmlById(ID_HOWTOPLAYBUTTON, "How To Play");
        View.addEventListenerToElm(
            ID_HOWTOPLAYBUTTON,
            "click",
            openHowToPlayScreen
        );
        if (isFocused) {
            View.addClass(ID_HOWTOPLAYBUTTON, CLASS_MENUFOCUS);
        }

        return elm;
    }

    createBackToStartButton(isFocused) {
        let elm = View.createElementInContainer(ID_BACKTOSTART, ID_BACKTOSTART);
        View.addEventListenerToElm(ID_BACKTOSTART, "click", backToStart);
        View.setInnerHtmlById(ID_BACKTOSTART, "Back To Start");
        if (isFocused) {
            View.addClass(ID_BACKTOSTART, CLASS_MENUFOCUS);
        }

        return elm;
    }

    createPlayAgainButton() {
        View.createElementInContainer(ID_PLAYAGAIN, ID_PLAYAGAIN);
        View.setInnerHtmlById(ID_PLAYAGAIN, "Play Again");
        View.addClass(ID_PLAYAGAIN, CLASS_MENUFOCUS);
        View.addEventListenerToElm(ID_PLAYAGAIN, "click", playAgain);
    }

    removeBackToStartButton() {
        View.remove(ID_BACKTOSTART);
    }

    removeStartScreen() {
        console.log("game.removeStartScreen()");
        if (document.getElementById(ID_LOGO) !== null) {
            View.remove(ID_LOGO);
        }
        this.removeAllStartMenu();
    }

    removeHowToScreen() {
        console.log("game.removeHowToScreen()");
        this.removeHowToPlayExplanation();
        this.removeBackToStartButton();
    }

    removeMatchScreen() {
        this.removeScore();
        this.removeAllEnemies();
        this.removeAllLasers();
        this.match = null;
    }

    removeGameOverScreen() {
        this.removeGameOverLogo();
        this.removeAllMenuOnAfterDefeatedScreen();
    }

    removeHero() {
        View.setHidden(elmHero);
    }

    createHowToScreen() {
        console.log("game.createHowToScreen()");
        View.setVisible(elmHowTo);
        this.createBackToStartButton(true);
    }

    removeScore() {
        View.setHidden(elmScore);
    }

    removeAllEnemies() {
        if (this.match !== null) {
            for (let i = 0; i < this.match.enemies.length; i++) {
                console.log("remove id = " + this.match.enemies[i].id);
                View.remove(this.match.enemies[i].id);
            }
        }
    }

    removeAllLasers() {
        if (this.match !== null) {
            for (let i = 0; i < this.match.lasers.length; i++) {
                console.log("remove id = " + this.match.lasers[i].id);
                View.remove(this.match.lasers[i].id);
            }
        }
    }

    removeStartLogo() {
        if (document.getElementById(ID_LOGO) !== null) {
            console.log("remove logo");
            View.remove(ID_LOGO);
        }
    }

    removeAllStartMenu() {
        for (let i = 0; i < this.startMenu.length; i++) {
            if (document.getElementById(this.startMenu[i].id) !== null) {
                console.log("remove id = " + this.startMenu[i].id);
                View.remove(this.startMenu[i].id);
            }
        }
    }

    createGameOverLogo() {
        View.setVisible(elmGameOver);
    }

    removeGameOverLogo() {
        View.setHidden(elmGameOver);
    }

    removeHowToPlayExplanation() {
        console.log("game.removeHowToPlayExplanation()");
        View.setHidden(elmHowTo);
    }

    removeAllMenuOnAfterDefeatedScreen() {
        for (let i = 0; i < this.afterDefeatedMenu.length; i++) {
            if (
                document.getElementById(this.afterDefeatedMenu[i].id) !== null
            ) {
                View.remove(this.afterDefeatedMenu[i].id);
            }
        }
    }

    createScore() {
        View.setVisible(elmScore);
    }

    createHero() {
        View.setVisible(elmHero);
    }

    initHero() {
        View.setPosition(
            this.match.hero.id,
            this.match.hero.x,
            this.match.hero.y
        );
        View.setVisible(elmHero);
    }
}

class StartMenuButton {
    id;
    focus;
    constructor(id, bool) {
        this.id = id;
        if (bool !== null) {
            this.focus = bool;
        } else {
            this.focus = false;
        }
    }
}

class AfterDefeatedMenuButton {
    id;
    focus;
    constructor(id, bool) {
        this.id = id;
        if (bool !== null) {
            this.focus = bool;
        } else {
            this.focus = false;
        }
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
    paused;
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
        this.paused = false;
    }

    showScore() {
        if (!this.ended) {
            View.setInnerHtml(elmScore, "SCORE: " + this.score);
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
        if (this.createdLastLaserAt < 3) {
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
            let laser = this.lasers[i];
            View.setPosition(laser.id, laser.x, laser.y);
        }
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            View.setPosition(enemy.id, enemy.x, enemy.y);
        }
    }

    checkCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            if (!this.ended && intersects(this.hero, enemy)) {
                game.gameOver();
            } else if (enemy.y + enemy.h >= this.bottom + 40) {
                View.remove(enemy.id);
                this.enemies.splice(i, 1);
                i--;
                continue;
            }

            for (let y = 0; y < this.lasers.length; y++) {
                let laser = this.lasers[y];
                if (laser.y + laser.h <= this.top) {
                    View.remove(laser.id);
                    this.lasers.splice(y, 1);
                    y--;
                    continue;
                }
                if (!this.ended && intersects(laser, enemy)) {
                    View.remove(enemy.id);
                    this.enemies.splice(i, 1);
                    i--;
                    game.match.score += BASIC_SCORE_POINT;
                    View.remove(laser.id);
                    this.lasers.splice(y, 1);
                    y--;
                }
            }
        }
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
    shift;
    shiftKeyWork;
    enterKeyWork;
    upKeyWork;
    downKeyWork;
    constructor() {
        const LEFT_KEY = 37;
        const UP_KEY = 38;
        const RIGHT_KEY = 39;
        const DOWN_KEY = 40;
        const SPACE_KEY = 32;
        const ENTER_KEY = 13;
        const SHIFT_KEY = 16;
        this.leftKey = LEFT_KEY;
        this.upKey = UP_KEY;
        this.rightKey = RIGHT_KEY;
        this.downKey = DOWN_KEY;
        this.spaceKey = SPACE_KEY;
        this.enterKey = ENTER_KEY;
        this.shiftKey = SHIFT_KEY;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.space = false;
        this.enter = false;
        this.shift = false;
        this.upKeyWork = true;
        this.downKeyWork = true;
        this.shiftKeyWork = true;
        this.enterKeyWork = true;
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
                if (this.upKeyWork) {
                    this.up = isPressed;
                }
                break;
            case this.downKey:
                if (this.downKeyWork) {
                    this.down = isPressed;
                }
                break;
            case this.spaceKey:
                this.space = isPressed;
                break;
            case this.enterKey:
                if (this.enterKeyWork) {
                    this.enter = isPressed;
                }
                break;
            case this.shiftKey:
                if (this.shiftKeyWork) {
                    this.shift = isPressed;
                }
                break;
        }
    }
}

class Sprite {
    id;
    x;
    y;
    w;
    h;
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
        super(ID_HERO, x - W / 2, bottom - H, W, H);
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

    static setInnerHtmlById(id, content) {
        let elm = document.getElementById(id);
        View.setInnerHtml(elm, content);
    }

    static createElementInContainer(id, className) {
        let elm = document.createElement("div");
        elm.id = id;
        elm.className = className;
        document.getElementById("container").appendChild(elm);

        return elm;
    }

    static remove(id) {
        document.getElementById(id).remove();
    }

    static setAnimationPlayState(elm, state) {
        if (state) {
            elm.classList.add("animation-run");
            elm.classList.remove("animation-paused");
        } else {
            elm.classList.add("animation-paused");
            elm.classList.remove("animation-run");
        }
    }

    static addEventListenerToElm(id, eventName, func) {
        let elm = document.getElementById(id);
        elm.addEventListener(eventName, func);
    }

    static addClass(id, className) {
        let elm = document.getElementById(id);
        if (elm !== null) {
            elm.classList.add(className);
        }
    }

    static removeClass(id, className) {
        let elm = document.getElementById(id);
        if (elm !== null) {
            elm.classList.remove(className);
        }
    }
}

class Util {
    static getRandom(maxSize) {
        return parseInt(Math.random() * maxSize);
    }
}

function loop() {
    const time = new Date().getTime();
    if (game.match === null) {
        // not started game yet
        let elmLogo = document.getElementById(ID_LOGO);
        if (elmHowTo.style.visibility === "visible") {
            game.howToControls();
        } else if (elmLogo === null) {
            game.createStartScreen();
            game.menuControls();
        } else {
            game.menuControls();
        }
    } else if (game.match.paused) {
        game.shiftKeyControls();
    } else if (time - game.match.lastLoopRun > 40) {
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
}

function playAgain() {
    game.playAgain();
}

function backToStart() {
    game.backToStart();
}

function startMatch() {
    // press Start
    game.startMatch();
}

function openHowToPlayScreen() {
    game.openHowToPlayScreen();
}

let view = new View();

t = appSetInterval();

function appSetInterval() {
    return setInterval("loop()", 20);
}

function disableShiftKey() {
    game.controller.shiftKeyWork = false;
}

function disableEnterKey() {
    game.controller.enterKeyWork = false;
}

function disableUpKey() {
    game.controller.upKeyWork = false;
}

function disableDownKey() {
    game.controller.downKeyWork = false;
}

game.ended = false;
game.start();
