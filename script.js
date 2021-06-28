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
const SHOOT_TIMEOUT = 0.15;
const BULLET_SPEED = 400;
const BULLET_DAMAGE = 1;
const ENEMY_HEALTH = 5;
const ENEMY_SPEED = 50;
const ENEMY_SHOT_FREQ = 5;
const STAR_SPEED = 400;
const POWERUP_DURATION = 15;
const POWERUP_SPAWN_DELAY = 20;
const POWERUP_FREQUENCY = 10;
const PLAYER_SECTION_OFFSET_X = 20;
const PLAYER_SECTION_OFFSET_Y = 20;
const MOVEMENT_DELAY = 0.5;
const MOVEMENT_RESET_TIMEOUT = 0.6;
const STRENGTH_MAX = 5;

loadSprite("playerTop", "sprites/PlayerTop.png");
loadSprite("playerMid", "sprites/PlayerMid.png");
loadSprite("playerBottom", "sprites/PlayerBottom.png");
loadSprite("playerTopInvincible", "sprites/PlayerTopInvincible.png");
loadSprite("playerMidInvincible", "sprites/PlayerMidInvincible.png");
loadSprite("playerBottomInvincible", "sprites/PlayerBottomInvincible.png");
loadSprite("powerUpInvincibility", "sprites/PowerUpInvincibility.png");
loadSprite("powerUpWipe", "sprites/PowerUpWipe.png");
loadSprite("powerUpStrength", "sprites/PowerUpStrength.png");
loadSprite("enemy", "sprites/Enemy.png");
loadSprite("enemyShooter", "sprites/EnemyShooter.png");

loadSound("spaceCrazy", "sfx/Space_Crazy.mp3");
loadSound("enemyDie1", "sfx/Enemy Die 1.wav");
loadSound("enemyDie2", "sfx/Enemy Die 2.wav");
loadSound("gameOver", "sfx/Game Over.wav");
loadSound("item1", "sfx/Item 1.wav");
loadSound("item2", "sfx/Item 2.wav");
loadSound("item3", "sfx/Item 3.wav");
loadSound("killAll", "sfx/Kill All Effect.wav");
loadSound("laser1", "sfx/Laser 1.wav");
loadSound("laser2", "sfx/Laser 2.wav");
loadSound("hum", "sfx/Low Humming.mp3");
const MUSIC_DETUNE = 200;

scene("game", () => {
    let score = 0;
    let dead = false;
    let invincible = false;
    let strength = 0;
    let shootTimeout = - SHOOT_TIMEOUT / 2;
    let secondTimer = 0;
    let lastMoved = 0;
    let wave = 0;

    const music = play("spaceCrazy", {
        loop: true,
    });

    // UI
    layers([
        "game",
        "ui",
    ], "game");
    let timerLabel = add([
        text(0),
        pos(5, 5),
        layer("ui"),
        origin("topleft"),
        {
            time: 0,
        },
    ]);
    timerLabel.action(() => {
        timerLabel.time += dt();
        timerLabel.text = timerLabel.time.toFixed(2);
        // Add 1 score every second
        if (timerLabel.time > secondTimer + 1) {
            secondTimer = timerLabel.time;
            score++;
        }
        // Reset movement after movement timeout (deals with glitch due to overloading JS)
        else if (time() > lastMoved + MOVEMENT_RESET_TIMEOUT) {
            lastMoved = time();
            resetMovement();
        }
    });
    let scoreLabel = add([
        text(0),
        pos(width() - 5, 5),
        origin("topright"),
    ]);
    scoreLabel.action(() => {
        scoreLabel.text = score;
    });

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
        pos(player.pos.x + PLAYER_SECTION_OFFSET_X, player.pos.y - PLAYER_SECTION_OFFSET_Y),
        origin("center"),
        "playerBall"
    ]);
    let playerBallBottom = add([
        sprite("playerBottom"),
        scale(1),
        pos(player.pos.x + PLAYER_SECTION_OFFSET_X, player.pos.y + PLAYER_SECTION_OFFSET_Y),
        origin("center"),
        "playerBall"
    ]);
    let resetMovement = () => {
        playerBallTop.pos.x = player.pos.x + PLAYER_SECTION_OFFSET_X;
        playerBallBottom.pos.x = player.pos.x + PLAYER_SECTION_OFFSET_X;
        playerBallTop.pos.y = player.pos.y - PLAYER_SECTION_OFFSET_Y;
        playerBallBottom.pos.y = player.pos.y + PLAYER_SECTION_OFFSET_Y;
    };
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

    // Enemy health manager
    let health = (hp) => {
        return {
            hurt(n) {
                hp -= (n === undefined ? 1 : n);
                this.trigger("hurt");
                camShake(4);
                play("enemyDie1");
                if (hp <= 0) {
                    play("enemyDie2");
                    destroy(this);
                    camShake(12);
                    makeExplosion(this.pos, 3, 6, 1);
                    if (this.is("enemyShooter")) {
                        score += 3;
                    } else {
                        score++;
                    }
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
    let spawnEnemy = (y) => {
        add([
            sprite("enemy"),
            pos(width() + 10, y),
            health(rand(ENEMY_HEALTH - 3, ENEMY_HEALTH + 3)),
            origin("center"),
            color(1, 1, 0),
            "enemy",
            {
                speed: rand(ENEMY_SPEED * 0.5, ENEMY_SPEED * 1.5),
            },
        ]);
    };
    action("enemy", (enemy) => { moveLeft(enemy); });

    // Shooting enemy
    let spawnEnemyShooter = (y) => {
        add([
            sprite("enemyShooter"),
            pos(width() + 10, y),
            health(rand(ENEMY_HEALTH - 0, ENEMY_HEALTH + 6)),
            origin("center"),
            color(1, 1, 0),
            "enemy",
            "enemyShooter",
            {
                speed: rand(ENEMY_SPEED * 0.2, ENEMY_SPEED * 1.2),
                shotFreq: rand(ENEMY_SHOT_FREQ * 0.9, ENEMY_SHOT_FREQ * 1.1),
                lastShot: time() - ENEMY_SHOT_FREQ / 2,
            },
        ]);
    };
    action("enemyShooter", (enemyShooter) => {
        if (time() > enemyShooter.lastShot + enemyShooter.shotFreq) {
            play("laser2");
            enemyShooter.lastShot = time();
            spawnBullet(enemyShooter.pos, rgb(255, 255, 0), 5, "enemyBullet");
        }
    });

    // Waves array, each row is a wave
    // First position decides delay 
    // Next positions decides enemies to spawn
    // g = generic, s = shooter
    const waves = [
        // Relative safety to start
        [1, "g"],
        [7, "g", "g"],
        [8, "g", "g", "g"],
        [8, "s"],
        // First proper wave
        [8, "g", "g", "g", "g", "g"],
        [2, "s", "s"],
        [12, "g", "g", "g", "g", "g", "g", "g"],
        [12, "g", "s", "g", "s", "g", "s", "g"],
        [12, "g", "g", "g", "g", "g", "g", "g"],
        [2, "s", "s", "s"],
        [12, "g", "g", "g", "g", "g", "g", "g", "g"],
        [2, "s", "s", "s", "s"],
        [1, "g"],
    ];
    // Spawn waves
    let spawnWave = (currentWave) => {
        if (currentWave < waves.length) {
            wait(waves[currentWave][0], () => {
                let enemyCountInWave = waves[currentWave].length - 1;
                for (let i = 1; i < waves.length; i++) {
                    let spawnPosition = Math.round(i * (((height() - 80) / (enemyCountInWave + 1)))) + 40;
                    if (waves[currentWave][i] === "g") {
                        spawnEnemy(spawnPosition);
                    } else if (waves[currentWave][i] === "s") {
                        spawnEnemyShooter(spawnPosition);
                    }
                }
                wave = wave + 1;
                spawnWave(wave);
            });
        } else {
            // Out of planned waves, just spawn chaotically
            spawnEndless(0.5, spawnEnemy);
            spawnEndless(1.5, spawnEnemyShooter);
        }
    };
    let spawnEndless = (delay, enemyFunction) => {
        enemyFunction(rand(5, height() - 5));
        wait(delay, () => spawnEndless(delay, enemyFunction));
    };

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
        let choose = strength >= STRENGTH_MAX ? rand(0, 2) : rand(0, 3);
        if (strength === 0 || choose > 2) {
            add([
                sprite("powerUpStrength"),
                pos(width() + 10, rand(50, height() - 50)),
                origin("center"),
                "powerUp",
                "strength",
                {
                    speed: rand(ENEMY_SPEED * 0.3, ENEMY_SPEED * 1.8),
                },
            ]);
        } else if (!invincible && choose > 1) {
            add([
                sprite("powerUpInvincibility"),
                pos(width() + 10, rand(50, height() - 50)),
                origin("center"),
                "powerUp",
                "invincibility",
                {
                    speed: rand(ENEMY_SPEED * 0.3, ENEMY_SPEED * 1.8),
                },
            ]);
        } else {
            add([
                sprite("powerUpWipe"),
                pos(width() + 10, rand(50, height() - 50)),
                origin("center"),
                "powerUp",
                "wipe",
                {
                    speed: rand(ENEMY_SPEED * 0.3, ENEMY_SPEED * 1.8),
                },
            ]);
        } 
        wait(rand(POWERUP_FREQUENCY * 0.8, POWERUP_FREQUENCY * 1.2), spawnPowerUp);
    };
    action("powerUp", (powerUp) => { moveLeft(powerUp); });

    // Player death
    let die = () => {
        dead = true;
        music.stop();
        play("gameOver");
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
                    camShake(4);
                    obj.move(rand(0, width()), rand(0, height()));
                });
            });
        }

        wait(2, () => {
            go("menu", score);
        });
    };

    // Shooting mechanics
    let shoot = () => {
        if (!dead) {
            if (time() > shootTimeout + SHOOT_TIMEOUT) {
                shootTimeout = time();
                if (strength === 0) {
                    spawnBullet(playerBallBottom.pos, rgb(255, 255, 255), 1, "bullet");
                    play("laser1", {
                        volume: 0.5,
                    });
                } else if (strength === 1) {
                    spawnBullet(playerBallBottom.pos.sub(0, 2), rgb(255, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.add(0, 2), rgb(255, 255, 255), 1, "bullet");
                    play("laser1", {
                        volume: 0.5,
                        detune: -100,
                    });
                } else if (strength === 2) {
                    spawnBullet(playerBallBottom.pos.sub(0, 2), rgb(255, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos, rgb(255, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.add(0, 2), rgb(255, 255, 255), 1, "bullet");
                    play("laser1", {
                        volume: 0.5,
                        detune: -200,
                    });
                } else if (strength === 3) {
                    spawnBullet(playerBallBottom.pos.sub(0, 4), rgb(255, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.sub(0, 2), rgb(255, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.add(0, 2), rgb(255, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.add(0, 4), rgb(255, 255, 255), 1, "bullet");
                    play("laser1", {
                        volume: 0.5,
                        detune: -300,
                    });
                } else {
                    spawnBullet(playerBallBottom.pos.sub(0, 4), rgb(0, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.sub(0, 2), rgb(0, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.add(0, 2), rgb(0, 255, 255), 1, "bullet");
                    spawnBullet(playerBallBottom.pos.add(0, 4), rgb(0, 255, 255), 1, "bullet");
                    play("laser1", {
                        volume: 0.5,
                        detune: -400,
                    });
                }
            }
        }
    };
    let spawnBullet = (position, colour, thickness, tag) => {
        add([
            rect(6, thickness),
            color(colour),
            pos(position),
            origin("center"),
            tag,
        ]);
    };
    action("enemyBullet", (bullet) => {
        bullet.move(-BULLET_SPEED *0.5, 0);
        if (bullet.pos.x < 0) {
            destroy(bullet);
        }
    });
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
            let engine = play("hum", {
                volume: 0.15,
            });
            lastMoved = time();
            player.move(x * SPEED, y * SPEED);
            wait(MOVEMENT_DELAY, () => {
                playerBallTop.move(x * SPEED, y * SPEED);
            });
            wait(MOVEMENT_DELAY, () => {
                playerBallBottom.move(x * SPEED, y * SPEED);
            });
        }
    };
    // right
    keyDown("d", () => { move(1, 0); });
    keyDown("right", () => { move(1, 0); });
    // left
    keyDown("a", () => { if (player.pos.x > 10) move(-1, 0); });
    keyDown("left", () => { if (player.pos.x > 10) move(-1, 0); });
    // up
    keyDown("w", () => { move(0, -1); });
    keyDown("up", () => { move(0, -1); });
    // down
    keyDown("s", () => { move(0, 1); });
    keyDown("down", () => { move(0, 1); });
    // shoot
    keyDown("space", () => { shoot(); });
    mouseDown(() => { shoot(); });

    // Collisions
    player.collides("border", () => { die(); });
    playerBallTop.collides("border", () => { die(); });
    playerBallBottom.collides("border", () => { die(); });
    player.collides("enemy", (enemy) => { if (!invincible) { die(); } else { enemy.hurt(999); } });
    playerBallTop.collides("enemy", (enemy) => { if (!invincible) { die(); } else { enemy.hurt(999); } });
    playerBallBottom.collides("enemy", (enemy) => { if (!invincible) { die(); } else { enemy.hurt(999); } });
    player.collides("enemyBullet", () => { if (!invincible) die(); });
    playerBallTop.collides("enemyBullet", () => { if (!invincible) die(); });
    playerBallBottom.collides("enemyBullet", () => { if (!invincible) die(); });
    playerBallTop.collides("powerUp", (powerUp) => {
        if (powerUp.is("invincibility")) {
            play("item1");
            player.changeSprite("playerMidInvincible");
            playerBallTop.changeSprite("playerTopInvincible");
            playerBallBottom.changeSprite("playerBottomInvincible");
            invincible = true;
            music.detune(MUSIC_DETUNE);
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
                music.detune(0);
            });

        } else if (powerUp.is("wipe")) {
            play("item2");
            play("killAll");
            every("enemy", (enemy) => {
                enemy.hurt(999);
            });
            every("enemyBullet", (enemyBullet) => {
                destroy(enemyBullet);
            });
        } else if (powerUp.is("strength")) {
            play("item3");
            strength++;
        }
        destroy(powerUp);
    });
    collides("bullet", "enemy", (bullet, enemy) => {
        destroy(bullet);
        enemy.hurt(BULLET_DAMAGE + strength);        
        makeExplosion(bullet.pos, 1, 6, 1);
    });

    // To start the adventure
    wait(1, () => spawnWave(wave));
    spawnStar();
    wait(POWERUP_SPAWN_DELAY, () => spawnPowerUp());
});
