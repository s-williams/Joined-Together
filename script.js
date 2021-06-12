kaboom({
    global: true,
    width: 480,
    height: 360,
    scale: 2,
    clearColor: [0, 0, 0, 1],
    crisp: false,
    debug: false,
});

const SPEED = 150;
const SHOOT_TIMEOUT = 0.1;
const BULLET_SPEED = 400;
const BULLET_DAMAGE = 1;
const ENEMY_HEALTH = 5;
const ENEMY_SPEED = 50;
const STAR_SPEED = 400;
const POWERUP_DURATION = 15;

loadSprite("playerTop", "sprites/PlayerTop.png");
loadSprite("playerMid", "sprites/PlayerMid.png");
loadSprite("playerBottom", "sprites/PlayerBottom.png");
loadSprite("playerTopInvincible", "sprites/PlayerTopInvincible.png");
loadSprite("playerMidInvincible", "sprites/PlayerMidInvincible.png");
loadSprite("playerBottomInvincible", "sprites/PlayerBottomInvincible.png");
loadSprite("powerUpInvincibility", "sprites/PowerUpInvincibility.png");
loadSprite("enemy", "sprites/Enemy.png");

scene("game", () => {
    let score = 0;
    let dead = false;
    let invincible = false;
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
        pos(40, 160),
        origin("center"),
        "playerBall"
    ]);
    let playerBallBottom = add([
        sprite("playerBottom"),
        scale(1),
        pos(40, 200),
        origin("center"),
        "playerBall"
    ]);
    // Borders
    add([
        rect(width(), 2),
        pos(0, 0),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);
    add([
        rect(width(), 2),
        pos(0, height() - 2),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);
    add([
        rect(2, height()),
        pos(0, 0),
        origin("topleft"),
        color(1, 0, 0),
        "border",
    ]);
    add([
        rect(2, height()),
        pos(width() - 2, 0),
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
                    camShake(12);
                    makeExplosion(this.pos, 3, 6, 1);
                    score++;
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

    // Generic enemy
    let spawnEnemy = () => {
        add([
            sprite("enemy"),
            pos(width() + 10, rand(0, height())),
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
            pos(width() + 10, rand(0, height())),
            origin("center"),
            color(1, 1, 1),
            "star",
            {
                speed: rand(STAR_SPEED * 0.5, STAR_SPEED * 1.5),
            },
        ]);
        add([
            rect(1, 1),
            pos(width() + 10, rand(0, height())),
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

    // Power up
    let spawnPowerUp = () => {
        add([
            sprite("powerUpInvincibility"),
            pos(width() + 10, rand(0, height())),
            origin("center"),
            "powerUp",
            "invincibility",
            {
                speed: rand(ENEMY_SPEED * 0.3, ENEMY_SPEED * 1.8),
            },
        ]);
        wait(2, spawnPowerUp);
    };
    action("powerUp", (powerUp) => { moveLeft(powerUp); });

    // Player death
    let die = () => {
        dead = true;
        destroy(player);
        destroy(playerBallBottom);
        destroy(playerBallTop);
        camShake(12);
        makeExplosion(vec2(width() / 2, height() / 2), 12, 120, 30);

        // Randomly move objects on screen in mega explosion
        for (let i = 0; i < 10; i++) {
            wait(0.1 * i, () => {
                every((obj) => {
                    obj.angle = rand(0, 360);
                    obj.move(rand(0, width()), rand(0, height()));
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
                spawnBullet(playerBallBottom.pos.sub(0, 2), "bullet");
                spawnBullet(playerBallBottom.pos.add(0, 2), "bullet");
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
        if (bullet.pos.x > width()) {
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
    player.collides("enemy", (enemy) => { if (!invincible) { die(); } else { enemy.hurt(999); } });
    playerBallTop.collides("enemy", (enemy) => { if (!invincible) { die(); } else { enemy.hurt(999); } });
    playerBallBottom.collides("enemy", (enemy) => { if (!invincible) { die(); } else { enemy.hurt(999); } });
    player.collides("enemyBullet", () => { if (!invincible) die(); });
    playerBallTop.collides("powerUp", (powerUp) => {
        if (powerUp.is("invincibility")) {
            player.changeSprite("playerMidInvincible");
            playerBallTop.changeSprite("playerTopInvincible");
            playerBallBottom.changeSprite("playerBottomInvincible");
            invincible = true;
            // Flash then turn off
            wait(POWERUP_DURATION - 2, () => {
                player.changeSprite("playerMid");
                playerBallTop.changeSprite("playerTop");
                playerBallBottom.changeSprite("playerBottom");
            });
            wait(POWERUP_DURATION - 1.5, () => {
                player.changeSprite("playerMidInvincible");
                playerBallTop.changeSprite("playerTopInvincible");
                playerBallBottom.changeSprite("playerBottomInvincible");
            }); 
            wait(POWERUP_DURATION - 1, () => {
                player.changeSprite("playerMid");
                playerBallTop.changeSprite("playerTop");
                playerBallBottom.changeSprite("playerBottom");
            });
            wait(POWERUP_DURATION - 0.5, () => {
                player.changeSprite("playerMidInvincible");
                playerBallTop.changeSprite("playerTopInvincible");
                playerBallBottom.changeSprite("playerBottomInvincible");
            });
            wait(POWERUP_DURATION, () => {
                player.changeSprite("playerMid");
                playerBallTop.changeSprite("playerTop");
                playerBallBottom.changeSprite("playerBottom");
                invincible = false;
            });

        }
        destroy(powerUp);
    });
    collides("bullet", "enemy", (bullet, enemy) => {
        destroy(bullet);
        enemy.hurt(BULLET_DAMAGE);
        makeExplosion(bullet.pos, 1, 6, 1);
    });

    // To start the adventure
    spawnEnemy();
    spawnStar();
    spawnPowerUp();
});
