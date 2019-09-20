"use strict";

const ID_CONTAINER = "container";
const ID_BACKGROUND = "background";
const ID_HERO = "hero";
const ID_SCORE = "score";
const ID_PAUSE = "pause";
const ID_GAMEOVER = "gameover";
const ID_HOWTOPAGE = "howToPage";
const ID_RECORDPAGE = "recordPage";

const ID_STARTBUTTON = "startButton";
const ID_BACKTOSTART = "backToStart";
const ID_PLAYAGAIN = "playAgain";
const ID_HOWTOPLAYBUTTON = "howToButton";
const ID_RECORDBUTTON = "recordButton";

const CLASS_MENUFOCUS = "menuFocus";

// will be deleted
const ID_LOGO = "logo";

const HERO_MOVEMENT = 10;
const BASIC_SCORE_POINT = 100;
// for event loop setInterval
let t;

class Game {
    controller;
    match;
    startMenu;
    afterDefeatedMenu;
    scores;
    constructor(controller) {
        this.controller = controller;
        this.match = null;
        this.startMenu = new Array();
        let startBtn = new StartMenuButton(ID_STARTBUTTON, true);
        let howToPlayBtn = new StartMenuButton(ID_HOWTOPLAYBUTTON, false);
        let recordBtn = new StartMenuButton(ID_RECORDBUTTON, false);
        this.startMenu.push(startBtn);
        this.startMenu.push(howToPlayBtn);
        this.startMenu.push(recordBtn);
        this.afterDefeatedMenu = new Array();
        let playAgainBtn = new AfterDefeatedMenuButton(ID_PLAYAGAIN, true);
        let backToStartBtn = new AfterDefeatedMenuButton(ID_BACKTOSTART, false);
        this.afterDefeatedMenu.push(playAgainBtn);
        this.afterDefeatedMenu.push(backToStartBtn);

        this.scores = new Array();
        // TODO add real score instead of sample
        this.scores.push(2300);
        this.scores.push(2200);
        this.scores.push(2100);
        this.scores.push(2000);
        this.scores.push(1900);
    }

    start() {
        console.log('start()');
        View.createElementInContainer(ID_BACKGROUND, ID_BACKGROUND);
        this.loop();
    }

    startMatch() {
        console.log('startMatch()');
        // remove
        this.removeStartLogo();
        this.removeAllStartMenu();
        this.removeAllMenuOnAfterDefeatedScreen();
        // create
        this.match = new Match();
        this.createScore();
        this.createHero();
    }

    moveToHowToPlayScreen() {
        console.log('moveToHowToPlayScreen()');
        // remove
        this.removeStartScreen();
        // create
        this.createHowToScreen();
    }

    moveToRecordScreen() {
        console.log('moveToRecordScreen()');
        // remove
        this.removeStartScreen();
        // create
        this.createRecordScreen();
    }

    moveToDefeatedScreen() {
        console.log('moveToDefeatedScreen()');
        // remove
        this.removeStartScreen();
        // create
        this.createHowToScreen();
    }

    moveToStartScreen() {
        console.log('moveToStartScreen()');
        // remove
        this.removeStartScreen();
        // create
        this.createHowToScreen();
    }

    loop() {
        const time = new Date().getTime();
        if (this.match === null) {
            // not started game yet
            if (!View.exist(ID_LOGO) && !View.exist(ID_HOWTOPAGE) && !View.exist(ID_RECORDPAGE)) {
                this.createStartScreen();
                this.menuControls();
            } else if (!View.exist(ID_LOGO) && View.exist(ID_HOWTOPAGE) && !View.exist(ID_RECORDPAGE)) {
                this.howToControls();
            } else if (!View.exist(ID_LOGO) && !View.exist(ID_HOWTOPAGE) && View.exist(ID_RECORDPAGE)) {
                this.howToControls(); // TODO should I make new controlls for this?
            } else {
                this.menuControls();
            }
        } else if (this.match.paused) {
            this.shiftKeyControls();
        } else if (time - this.match.lastLoopRun > 40) {
            this.match.updatePosition();
            this.handleControls();
            this.match.checkCollisions();

            if (this.match.ended === false) {
                this.match.addEnemy();
            }

            this.match.showSprites();
            this.match.showScore();

            this.match.lastLoopRun = time;
            this.match.iterations++;

            this.match.createdLastLaserAt++;
        }
    }

    handleControls() {
        if (this.match.ended) {
            if (this.controller.upKeyWork && this.controller.up) {
                this.controller.up = false;
                this.disableUpKey();
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
                this.disableDownKey();
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
                this.disableEnterKey();
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
                    this.pause();
                } else {
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
                this.pause();
            } else {
                this.resume();
            }
        }
    }

    menuControls() {
        if (this.controller.upKeyWork && this.controller.up) {
            this.controller.up = false;
            this.disableUpKey();
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
            this.disableDownKey();
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
            this.disableEnterKey();
            for (let i = 0; i < this.startMenu.length; i++) {
                if (this.startMenu[i].focus) {
                    if (this.startMenu[i].id === ID_STARTBUTTON) {
                        this.startMatch();
                    } else if (this.startMenu[i].id === ID_HOWTOPLAYBUTTON) {
                        this.moveToHowToPlayScreen();
                    } else if (this.startMenu[i].id === ID_RECORDBUTTON) {
                        this.moveToRecordScreen();
                    }
                    break;
                }
            }
        }
    }

    howToControls() {
        if (this.controller.enterKeyWork && this.controller.enter) {
            this.disableEnterKey();
            this.controller.enter = false;

            this.backToStart();
        }
    }

    gameOver() {
        console.log('gameOver()');
        if (!this.match.ended) {
            this.match.ended = true;

            this.updateScore();

            // remove
            this.removeHero();
            // create
            this.createGameOverLogo();
            this.createPlayAgainButton();
            this.createBackToStartButton();
        }
    }

    playAgain() {
        console.log('playAgain()');
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
        console.log('backToStart()');
        // remove
        this.removeMatchScreen();
        this.removeGameOverScreen();
        this.removeHowToScreen();
        this.removeRecordScreen();
        // create
        this.createStartScreen();
    }

    pause() {
        console.log('pause()');
        this.match.paused = true;
        GameView.createPauseText();
        View.setAnimationPlayState(ID_BACKGROUND, false);
        this.disableShiftKey();
        this.controller.shift = false;
    }

    resume() {
        console.log('resume()');
        this.match.paused = false;
        View.setAnimationPlayState(ID_BACKGROUND, true);
        this.disableShiftKey();
        View.remove(ID_PAUSE);
        // TODO animation play state running
        this.controller.shift = false;
    }

    createStartScreen() {
        console.log('createStartScreen()');
        // logo
        this.createStartLogo();
        // start button
        this.createStartButton(true);
        // how to button
        this.createHowToButton(false);
        // record button
        this.createRecordButton(false);
        // focus on first button
        game.startMenu[0].focus = true;
    }

    createStartLogo() {
        console.log('createStartLogo()');
        View.createElementInContainer(ID_LOGO, ID_LOGO);
        View.setInnerHtmlById(ID_LOGO, "Space War");
    }

    createStartButton(isFocused) {
        console.log('createStartButton()');
        View.createElementInContainer(ID_STARTBUTTON, ID_STARTBUTTON);
        View.setInnerHtmlById(ID_STARTBUTTON, "Start");
        View.addEventListenerToElm(ID_STARTBUTTON, "click", function () {
            game.startMatch();
        });
        if (isFocused) {
            View.addClass(ID_STARTBUTTON, CLASS_MENUFOCUS);
        }
    }

    createHowToButton(isFocused) {
        console.log('createHowToButton()');
        View.createElementInContainer(ID_HOWTOPLAYBUTTON, ID_HOWTOPLAYBUTTON);
        View.setInnerHtmlById(ID_HOWTOPLAYBUTTON, "How To Play");
        View.addEventListenerToElm(ID_HOWTOPLAYBUTTON, "click", function () {
            game.moveToHowToPlayScreen();
        });

        if (isFocused) {
            View.addClass(ID_HOWTOPLAYBUTTON, CLASS_MENUFOCUS);
        }
    }

    createRecordButton(isFocused) {
        console.log('createRecordButton()');
        View.createElementInContainer(ID_RECORDBUTTON, ID_RECORDBUTTON);
        View.setInnerHtmlById(ID_RECORDBUTTON, "Record");
        View.addEventListenerToElm(ID_RECORDBUTTON, "click", function () {
            game.moveToRecordScreen();
        });

        if (isFocused) {
            View.addClass(ID_RECORDBUTTON, CLASS_MENUFOCUS);
        }
    }

    createBackToStartButton(isFocused) {
        console.log('createBackToStartButton()');
        View.createElementInContainer(ID_BACKTOSTART, ID_BACKTOSTART);
        if (isFocused) {
            View.addClass(ID_BACKTOSTART, CLASS_MENUFOCUS);
        }
        View.addEventListenerToElm(ID_BACKTOSTART, "click", function () {
            game.backToStart();
        });
        View.setInnerHtmlById(ID_BACKTOSTART, "Back To Start");
    }

    createPlayAgainButton() {
        console.log('createPlayAgainButton()');
        View.createElementInContainer(ID_PLAYAGAIN, ID_PLAYAGAIN);
        View.setInnerHtmlById(ID_PLAYAGAIN, "Play Again");
        View.addClass(ID_PLAYAGAIN, CLASS_MENUFOCUS);
        View.addEventListenerToElm(ID_PLAYAGAIN, "click", function () {
            game.playAgain();
        });
    }

    removeBackToStartButton() {
        console.log('removeBackToStartButton()');
        View.remove(ID_BACKTOSTART);
    }

    removeStartScreen() {
        console.log('removeStartScreen()');
        this.removeStartLogo();
        this.removeAllStartMenu();
    }

    removeHowToScreen() {
        console.log('removeHowToScreen()');
        this.removeHowToPlayExplanation();
        this.removeBackToStartButton();
    }

    removeRecordScreen() {
        console.log('removeRecordScreen()');
        this.removeRecordBoard();
        this.removeBackToStartButton();
    }

    removeMatchScreen() {
        console.log('removeMatchScreen()');
        this.removeScore();
        this.removeAllEnemies();
        this.removeAllLasers();
        this.match = null;
    }

    removeGameOverScreen() {
        console.log('removeGameOverScreen()');;
        this.removeGameOverLogo();
        this.removeAllMenuOnAfterDefeatedScreen();
    }

    removeHero() {
        console.log('removeHero()');
        View.remove(ID_HERO);
    }

    createHowToScreen() {
        console.log('createHowToScreen()');
        GameView.createHowToPlayExplanation();
        this.createBackToStartButton(true);
    }

    createRecordScreen() {
        console.log('createRecordScreen()');
        // TODO put scores as parameter
        GameView.createRecordBoard(this.scores);
        this.createBackToStartButton(true);
    }

    removeScore() {
        console.log('removeScore()');
        View.remove(ID_SCORE);
    }

    removeAllEnemies() {
        console.log('removeAllEnemies()');
        if (this.match !== null) {
            for (let i = 0; i < this.match.enemies.length; i++) {
                View.remove(this.match.enemies[i].id);
            }
        }
    }

    removeAllLasers() {
        console.log('removeAllLasers()');
        if (this.match !== null) {
            for (let i = 0; i < this.match.lasers.length; i++) {
                View.remove(this.match.lasers[i].id);
            }
        }
    }

    removeStartLogo() {
        console.log('removeStartLogo()');
        View.remove(ID_LOGO);
    }

    removeAllStartMenu() {
        console.log('removeAllStartMenu()');
        for (let i = 0; i < this.startMenu.length; i++) {
            View.remove(this.startMenu[i].id);
        }
    }

    createGameOverLogo() {
        console.log('createGameOverLogo()');
        GameView.createGameoverLogo();
    }

    removeGameOverLogo() {
        console.log('removeGameOverLogo()');
        View.remove(ID_GAMEOVER);
    }

    removeHowToPlayExplanation() {
        console.log('removeHowToPlayExplanation()');
        View.remove(ID_HOWTOPAGE);
    }

    removeRecordBoard() {
        console.log('removeRecordBoard()');
        View.remove(ID_RECORDPAGE);
    }

    removeAllMenuOnAfterDefeatedScreen() {
        console.log('removeAllMenuOnAfterDefeatedScreen()');
        for (let i = 0; i < this.afterDefeatedMenu.length; i++) {
            View.remove(this.afterDefeatedMenu[i].id);
        }
    }

    createScore() {
        console.log('createScore()');
        View.createElementInContainer(ID_SCORE, ID_SCORE);
    }

    createHero() {
        console.log('createHero()');
        View.createElementInContainer(ID_HERO, ID_HERO);
    }

    initHero() {
        console.log('initHero()');
        View.createElementInContainer(ID_HERO, ID_HERO);
    }

    disableShiftKey(ms = 100) {
        console.log('disableShiftKey()');
        this.controller.shiftKeyWork = false;
        setTimeout(function () {
            game.controller.shiftKeyWork = true;
        }, ms);
    }

    disableEnterKey(ms = 100) {
        console.log('disableEnterKey()');
        this.controller.enterKeyWork = false;
        setTimeout(function () {
            game.controller.enterKeyWork = true;
        }, ms);
    }

    disableUpKey(ms = 100) {
        console.log('disableUpKey()');
        this.controller.upKeyWork = false;
        setTimeout(function () {
            game.controller.upKeyWork = true;
        }, ms);
    }

    disableDownKey(ms = 100) {
        console.log('disableDownKey()');
        this.controller.downKeyWork = false;
        setTimeout(function () {
            game.controller.downKeyWork = true;
        }, ms);
    }

    updateScore() {
        let score = this.match.score;
        this.scores.push(score);
        this.scores.sort(function (a, b) { return b - a });
        this.scores.pop();
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
    laserLevel;
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
        this.laserLevel = 1;
        this.createdLastLaserAt = 0;
        this.paused = false;
    }

    showScore() {
        if (!this.ended) {
            View.setInnerHtmlById(ID_SCORE, "SCORE: " + this.score);
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
        let laserSec = 3;
        if (this.laserLevel === 1) {
            // TODO set Level
            laserSec = 3;
        }
        if (this.createdLastLaserAt < laserSec) {
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
        if (View.exist(this.hero.id)) {
            View.setPosition(this.hero.id, this.hero.x, this.hero.y);
        }
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
    constructor(id) {
        const INIT_ENEMY_POSITION_Y = -40;
        const ENEMY_SIZE_X = 35;
        const ENEMY_SIZE_Y = 35;
        super(
            id,
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

document.onkeydown = function (e) {
    game.controller.toggleKey(e.keyCode, true);
};

document.onkeyup = function (e) {
    game.controller.toggleKey(e.keyCode, false);
};

class View {

    constructor() { }

    static setPosition(id, x, y) {
        let elm = document.getElementById(id);
        elm.style.left = x + "px";
        elm.style.top = y + "px";
    }

    static setInnerHtmlById(id, content) {
        let elm = document.getElementById(id);
        elm.innerHTML = content;
    }

    static setInnerHtml(elm, content) {
        elm.innerHTML = content;
    }

    static createElementInContainer(id, className) {
        console.log('create id = ' + id);
        let elm = document.createElement("div");
        elm.id = id;
        elm.className = className;
        document.getElementById(ID_CONTAINER).appendChild(elm);

        return elm;
    }

    static addClass(id, className) {
        let elm = document.getElementById(id);
        elm.classList.add(className);
    }

    static remove(id) {
        let elm = document.getElementById(id);
        if (elm !== null) {
            console.log("remove id = " + id);
            elm.remove();
        }
    }

    static setAnimationPlayState(id, state) {
        let elm = document.getElementById(id);
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

    static exist(id) {
        return document.getElementById(id) !== null;
    }
}

class GameView extends View {

    constructor() { }

    static createGameoverLogo() {
        console.log('createGameoverLogo()');
        let elm = document.createElement("div");
        elm.id = ID_GAMEOVER;
        elm.className = ID_GAMEOVER;
        super.setInnerHtml(elm, 'GAME OVER');

        document.getElementById(ID_CONTAINER).appendChild(elm);
    }

    static createPauseText() {
        console.log('createPauseText()');
        let elm = document.createElement("div");
        elm.id = ID_PAUSE;
        elm.className = ID_PAUSE;
        super.setInnerHtml(elm, 'PAUSE');

        document.getElementById(ID_CONTAINER).appendChild(elm);
    }

    static createHowToPlayExplanation() {
        console.log('createHowToPlayExplanation()');
        let parentElm = document.createElement("div");
        parentElm.id = ID_HOWTOPAGE;
        parentElm.className = ID_HOWTOPAGE;

        let titleElm = document.createElement("div");
        super.setInnerHtml(titleElm, 'How To Play');

        let explanationShootElm = document.createElement("div");
        explanationShootElm.className = 'explanation howToShoot';
        let childShootElm = document.createElement("div");
        childShootElm.className = 'howToShoot';
        super.setInnerHtml(childShootElm, 'Space Key: Shoot');
        explanationShootElm.appendChild(childShootElm);

        let explanationMoveElm = document.createElement("div");
        explanationMoveElm.className = 'explanation howToMove';
        let childMoveElm = document.createElement("div");
        childMoveElm.className = 'howToMove';
        super.setInnerHtml(childMoveElm, 'Cross Key: Move');
        explanationMoveElm.appendChild(childMoveElm);

        let explanationPauseElm = document.createElement("div");
        explanationPauseElm.className = 'explanation howToPause';
        let childPauseElm = document.createElement("div");
        childPauseElm.className = 'howToPause';
        super.setInnerHtml(childPauseElm, 'Shift Key: Pause/Resume');
        explanationPauseElm.appendChild(childPauseElm);

        parentElm.appendChild(titleElm);
        parentElm.appendChild(explanationShootElm);
        parentElm.appendChild(explanationMoveElm);
        parentElm.appendChild(explanationPauseElm);

        document.getElementById(ID_CONTAINER).appendChild(parentElm);
    }

    static createRecordBoard(scores) {
        console.log('createRecordBoard()');
        let parentElm = document.createElement("div");
        parentElm.id = ID_RECORDPAGE;
        parentElm.className = ID_RECORDPAGE;

        let titleElm = document.createElement("div");
        super.setInnerHtml(titleElm, 'Record');

        let recordBoard = document.createElement("div");
        recordBoard.className = 'recordBoard';
        let ulElm = document.createElement("ul");
        let liElm01 = document.createElement("li");
        super.setInnerHtml(liElm01, '1st: ' + scores[0]);
        let liElm02 = document.createElement("li");
        super.setInnerHtml(liElm02, '2nd: ' + scores[1]);
        let liElm03 = document.createElement("li");
        super.setInnerHtml(liElm03, '3rd: ' + scores[2]);
        let liElm04 = document.createElement("li");
        super.setInnerHtml(liElm04, '4th: ' + scores[3]);
        let liElm05 = document.createElement("li");
        super.setInnerHtml(liElm05, '5th: ' + scores[4]);

        ulElm.appendChild(liElm01);
        ulElm.appendChild(liElm02);
        ulElm.appendChild(liElm03);
        ulElm.appendChild(liElm04);
        ulElm.appendChild(liElm05);
        recordBoard.appendChild(ulElm);

        parentElm.appendChild(titleElm);
        parentElm.appendChild(recordBoard);

        document.getElementById(ID_CONTAINER).appendChild(parentElm);
    }
}

class Util {
    static getRandom(maxSize) {
        return parseInt(Math.random() * maxSize);
    }
}

t = setLoop();

function setLoop() {
    return setInterval(function () {
        game.loop();
    }, 20);
}

game.start();
