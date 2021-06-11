kaboom.import();

let highScore = 0;
const SPEED = 150;
const WIDTH = 480;
const HEIGHT = 360;
const SHOOT_TIMEOUT = 0.1;
const BULLET_SPEED = 400;

init({
    width: WIDTH,
    height: HEIGHT,
    scale: 2,
});

scene("menu", (score) => {
    if (score && score > highScore) {
        highScore = score;
    }

    add([
        text("Joined Together"),
        pos(240, 80),
        scale(3),
    ]);
    add([
        text("High Score: " + highScore),
        pos(240, 160),
        scale(2),
    ]);

    add([
        rect(160, 20),
        pos(240, 240),
        "button",
        {
            clickAction: () => go('game'),
        },
    ]);

    add([
        text("Play game"),
        pos(240, 240),
        color(0, 0, 0)
    ]);

    action("button", b => {

        if (b.isHovered()) {
            b.use(color(0.7, 0.7, 0.7));
        } else {
            b.use(color(1, 1, 1));
        }

        if (b.isClicked()) {
            b.clickAction();
        }

    });

});

scene("game", () => {
    let score = 0;
    let shootTimeout = - SHOOT_TIMEOUT / 2;
    let player = add([
        rect(10, 10),
        pos(20, 180),
        origin("center"),
        "player"
    ]);
    let playerBallTop = add([
        rect(10, 10),
        pos(20, 160),
        origin("center"),
        "playerBall"
    ]);
    let playerBallBottom = add([
        rect(10, 10),
        pos(20, 200),
        origin("center"),
        "playerBall"
    ]);

    add([
        rect(WIDTH, 5),
        pos(0, 0),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);
    add([
        rect(WIDTH, 5),
        pos(0, HEIGHT - 5),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);
    add([
        rect(5, HEIGHT),
        pos(0, 0),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);
    add([
        rect(5, HEIGHT),
        pos(WIDTH - 5, 0),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);

    player.collides("border", () => {
        destroy(player);
        //camShake(120);
        makeExplosion(vec2(width() / 2, height() / 2), 12, 120, 30);
        wait(2, () => {
            go("menu", score);
        });
    });

    let makeExplosion = (p, n, rad, size) => {
        for (let i = 0; i < n; i++) {
            wait(rand(n * 0.1), () => {
                for (let i = 0; i < 2; i++) {
                    add([
                        pos(p.add(rand(vec2(-rad), vec2(rad)))),
                        rect(1, 1),
                        scale(1 * size, 1 * size),
                        lifespan(0.1),
                        grow(rand(48, 72) * size),
                        origin("center"),
                    ]);
                }
            });
        }
    };

    let lifespan = (time) => {
        let timer = 0;
        return {
            update() {
                timer += dt();
                if (timer >= time) {
                    destroy(this);
                }
            },
        };
    };

    let grow = (rate) => {
        return {
            update() {
                const n = rate * dt();
                this.scale.x += n;
                this.scale.y += n;
            },
        };
    };

    let shoot = () => {
        if (time() > shootTimeout + SHOOT_TIMEOUT) {
            shootTimeout = time();
            spawnBullet(playerBallBottom.pos.sub(0, 1));
            spawnBullet(playerBallBottom.pos.add(0, 1));
        }
    };
    let spawnBullet = (p) => {
        add([
            rect(6, 1),
            pos(p),
            origin("center"),
            "bullet",
        ]);
    };
    action("bullet", (bullet) => {
        bullet.move(BULLET_SPEED, 0);
        if (bullet.pos.x > WIDTH) {
            destroy(bullet);
        }
    });
    // Deal with ball and chain
    player.action(() => {
        // Draw the chain
        drawLine(player.pos, playerBallTop.pos, {
            width: 2,
            color: rgba(255, 255, 255, 1),
            z: 0.5,
        });
        drawLine(player.pos, playerBallBottom.pos, {
            width: 2,
            color: rgba(255, 255, 255, 1),
            z: 0.5,
        });
    });
    // Controls
    let move = (x, y) => {
        player.move(x * SPEED, y * SPEED);
        wait(0.5, () => {
            playerBallTop.move(x * SPEED, y * SPEED);
        });
        wait(0.5, () => {
            playerBallBottom.move(x * SPEED, y * SPEED);
        });
    };
    keyDown("right", () => { move(1, 0); });
    keyDown("left", () => { move(-1, 0); });
    keyDown("up", () => { move(0, -1); });
    keyDown("down", () => { move(0, 1); });
    keyDown("d", () => { move(1, 0); });
    keyDown("a", () => { move(-1, 0); });
    keyDown("w", () => { move(0, -1); });
    keyDown("s", () => { move(0, 1); });
    keyDown("space", () => { shoot(); });
});

start("game");