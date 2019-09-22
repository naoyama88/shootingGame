export class Sprite {
    constructor(id, x, y, w, h) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

export class Laser extends Sprite {
    constructor(id, x, y, w, h) {
        super(id, x, y, w, h);
    }
}