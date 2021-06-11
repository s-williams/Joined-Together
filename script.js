kaboom.import();

let highScore = 0;
const SPEED = 150;
const WIDTH = 480;
const HEIGHT = 360;
const SHOOT_TIMEOUT = 0.1;
const BULLET_SPEED = 400;
const BULLET_DAMAGE = 1;
const ENEMY_HEALTH = 5;
const ENEMY_SPEED = 50;
const STAR_SPEED = 400;

init({
    width: WIDTH,
    height: HEIGHT,
    scale: 2,
});

loadSprite("playerTop", "sprites/playerTop.png");
loadSprite("playerMid", "sprites/playerMid.png");
loadSprite("playerBottom", "sprites/playerBottom.png");

scene("menu", (score) => {
    if (score && score > highScore) {
        highScore = score;
    }

    add([
        text("Triple Threat"),
        pos(240, 80),
        scale(3),
    ]);
    add([
        text("Your High Score: " + highScore),
        pos(240, 160),
        scale(2),
    ]);
    add([
        text("Author High Score: " + 0),
        pos(240, 200),
        scale(2),
    ]);

    add([
        rect(160, 20),
        pos(240, 280),
        "button",
        {
            clickAction: () => go('game'),
        },
    ]);

    add([
        text("Play game"),
        pos(240, 280),
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
    let dead = false;
    let shootTimeout = - SHOOT_TIMEOUT / 2;
    // Player
    let player = add([
        sprite("playerMid"),
        scale(1),
        pos(20, 180),
        origin("center"),
        "player"
    ]);
    let playerBallTop = add([
        sprite("playerTop"),
        scale(1),
        pos(20, 160),
        origin("center"),
        "playerBall"
    ]);
    let playerBallBottom = add([
        sprite("playerBottom"),
        scale(1),
        pos(20, 200),
        origin("center"),
        "playerBall"
    ]);
    // Borders
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

    let health = (hp) => {
        return {
            hurt(n) {
                hp -= (n === undefined ? 1 : n);
                this.trigger("hurt");
                if (hp <= 0) {
                    destroy(this);
                    makeExplosion(this.pos, 3, 6, 1);
                }
            },
            hp() {
                return hp;
            },
        };
    };

    let moveLeft = (thing) => {
        thing.move(-thing.speed, 0);
        if (thing.pos.x < 0) {
            destroy(thing);
        }
    };

    let spawnEnemy = () => {
        add([
            rect(10, 10),
            pos(WIDTH + 10, rand(0, HEIGHT)),
            health(rand(ENEMY_HEALTH - 3, ENEMY_HEALTH + 3)),
            origin("center"),
            color(1, 1, 0),
            "enemy",
            {
                speed: rand(ENEMY_SPEED * 0.5, ENEMY_SPEED * 1.5),
            },
        ]);
        wait(0.3, spawnEnemy);
    };

    action("enemy", (enemy) => { moveLeft(enemy); });

    // Background stars
    let spawnStar = () => {
        add([
            rect(2, 2),
            pos(WIDTH + 10, rand(0, HEIGHT)),
            origin("center"),
            color(1, 1, 1),
            "star",
            {
                speed: rand(STAR_SPEED * 0.5, STAR_SPEED * 1.5),
            },

        ]);
        add([
            rect(1, 1),
            pos(WIDTH + 10, rand(0, HEIGHT)),
            origin("center"),
            color(1, 1, 1),
            "star",
            {
                speed: rand(STAR_SPEED * 0.5, STAR_SPEED * 1.5),
            },

        ]);
        wait(0.1, spawnStar);
    };
    action("star", (star) => { moveLeft(star); });

    // Player death
    let die = () => {
        dead = true;
        destroy(player);
        destroy(playerBallBottom);
        destroy(playerBallTop);
        makeExplosion(vec2(width() / 2, height() / 2), 12, 120, 30);

        // Randomly move objects on screen in mega explosion
        for (i = 0; i < 10; i++) {
            wait(0.1 * i, () => {
                every((obj) => {
                    obj.angle = rand(0, 360);
                    obj.move(rand(0, WIDTH), rand(0, HEIGHT));
                });
            });
        }

        wait(2, () => {
            go("menu", score);
        });
    };

    // Player shooting mechanics
    let shoot = () => {
        if (!dead) {
            if (time() > shootTimeout + SHOOT_TIMEOUT) {
                shootTimeout = time();
                spawnBullet(playerBallBottom.pos.sub(0, 1), "bullet");
                spawnBullet(playerBallBottom.pos.add(0, 1), "bullet");
            }
        }
    };
    let spawnBullet = (position, tag) => {
        add([
            rect(6, 1),
            pos(position),
            origin("center"),
            tag,
        ]);
    };
    action("bullet", (bullet) => {
        bullet.move(BULLET_SPEED, 0);
        if (bullet.pos.x > WIDTH) {
            destroy(bullet);
        }
    });
    // Deal with the chain between player components
    player.action(() => {
        drawLine(player.pos, playerBallTop.pos.add(vec2(0, 5)), {
            width: 2,
            color: rgba(255, 255, 255, 1),
            z: 0.5,
        });
        drawLine(player.pos, playerBallBottom.pos.sub(vec2(0, 5)), {
            width: 2,
            color: rgba(255, 255, 255, 1),
            z: 0.5,
        });
    });
    // Controls
    let move = (x, y) => {
        if (!dead) {
            player.move(x * SPEED, y * SPEED);
            wait(0.5, () => {
                playerBallTop.move(x * SPEED, y * SPEED);
            });
            wait(0.5, () => {
                playerBallBottom.move(x * SPEED, y * SPEED);
            });
        }
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
    mouseDown(() => { shoot(); });

    //Collisions
    player.collides("border", () => { die(); });
    playerBallTop.collides("border", () => { die(); });
    playerBallBottom.collides("border", () => { die(); });
    player.collides("enemy", () => { die(); });
    playerBallTop.collides("enemy", () => { die(); });
    playerBallBottom.collides("enemy", () => { die(); });
    player.collides("enemyBullet", () => { die(); });
    collides("bullet", "enemy", (bullet, enemy) => {
        destroy(bullet);
        enemy.hurt(BULLET_DAMAGE);
        makeExplosion(bullet.pos, 1, 6, 1);
    });

    // To start the adventure
    spawnEnemy();
    spawnStar();
});

start("game");