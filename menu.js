let highScore = 0;

loadSprite("tutorialShip", "img/TutorialShip.png");
loadSprite("tutorialEnemies", "img/TutorialEnemies.png");
loadSprite("tutorialPowerUps", "img/TutorialPowerUps.png");


scene("menu", (score) => {
    if (score && score > highScore) {
        highScore = score;
    }
    add([
        text("Triple Threat"),
        pos(240, 80),
        origin("center"),
        scale(3),
    ]);
    add([
        text("Your High Score: " + highScore),
        pos(240, 160),
        origin("center"),
        scale(2),
    ]);
    add([
        text("Author High Score: " + 200),
        pos(240, 200),
        origin("center"),
        scale(2),
    ]);
    add([
        rect(160, 20),
        pos(240, 240),
        origin("center"),
        "button",
        {
            clickAction: () => go('game'),
        },
    ]);
    add([
        text("Play game"),
        pos(240, 240),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        rect(160, 20),
        pos(240, 270),
        origin("center"),
        "button",
        {
            clickAction: () => go('instructions'),
        },
    ]);
    add([
        text("Instructions"),
        pos(240, 270),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        rect(160, 20),
        pos(240, 300),
        origin("center"),
        "button",
        {
            clickAction: () => go('credits'),
        },
    ]);
    add([
        text("Credits"),
        pos(240, 300),
        origin("center"),
        color(0, 0, 0)
    ]);
    // Music and SFX mute buttons
    add([
        rect(70, 20),
        pos(195, 330),
        origin("center"),
        "button",
        {
            clickAction: () => {
                musicMuted = !musicMuted;
                musicText.text = musicMuted ? "Muted" : "Music";
            }
        },
    ]);
    let musicText = add([
        text(musicMuted ? "Muted" : "Music"),
        pos(195, 330),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        rect(70, 20),
        pos(285, 330),
        origin("center"),
        "button",
        {
            clickAction: () => {
                sfxMuted = !sfxMuted;
                sfxText.text = sfxMuted ? "Muted" : "SFX";
            }
        },
    ]);
    let sfxText = add([
        text(sfxMuted ? "Muted" : "SFX"),
        pos(285, 330),
        origin("center"),
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
    keyPress("space", () => { go('game'); });
    keyPress("enter", () => { go('game'); });
    keyPress("1", () => { go('game'); });
    keyPress("2", () => { go('instructions'); });
    keyPress("3", () => { go('credits'); });
});

scene("credits", () => {
    add([
        rect(160, 20),
        pos(240, 300),
        origin("center"),
        "button",
        {
            clickAction: () => go('menu'),
        },
    ]);
    add([
        text("Back"),
        pos(240, 300),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        text("Programming:"),
        pos(240, 100),
        origin("center"),
        scale(1),
    ]);
    add([
        text("swilliamsio"),
        pos(240, 120),
        origin("center"),
        scale(2),
    ]);
    add([
        text("https://www.swilliams.io/"),
        pos(240, 140),
        origin("center"),
        scale(1),
        "button",
        {
            clickAction: () => {
                window.open("https://www.swilliams.io/", '_blank');
            }
        },
    ]);
    add([
        text("Music & SFX:"),
        pos(240, 180),
        origin("center"),
        scale(1),
    ]);
    add([
        text("Silverpine Project"),
        pos(240, 200),
        origin("center"),
        scale(2),
    ]);
    add([
        text("https://linktr.ee/silverpineproject"),
        pos(240, 220),
        origin("center"),
        scale(1),
        "button",
        {
            clickAction: () => {
                window.open("https://linktr.ee/silverpineproject", '_blank');
            }
        },
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
    keyPress("escape", () => { go('menu'); });
    keyPress("1", () => { go('menu'); });
    keyPress("2", () => { go('menu'); });
    keyPress("3", () => { go('menu'); });
});

scene("instructions", () => {
    add([
        rect(160, 20),
        pos(240, 270),
        origin("center"),
        "button",
        {
            clickAction: () => go('game'),
        },
    ]);
    add([
        text("<-- This is your ship.\n" +
            "It's made up of 3 parts.\n\n" +
            "The middle part has the engine.\n" +
            "Control it with WASD\n" +
            "or with Arrow Keys.\n\n" +
            "The bottom part has the missiles.\n" +
            "Fire with SPACE or LMB\n" +
            "or with Arrow Keys.\n" + 
            "Try and hit your enemies -->\n\n" +
            "The top part collects power ups.\n" +
            "These wipe the screen, give you\n" + 
            "invincibility or upgrade your\n" + 
            "weapon."),
        pos(240, 20),
        scale(1),
        origin("top")
    ]);
    add([
        sprite("tutorialShip"),
        pos(0, 0),
        origin("topleft"),
    ]);
    add([
        sprite("tutorialEnemies"),
        pos(width(), 0),
        origin("topright"),
    ]);
    add([
        sprite("tutorialPowerUps"),
        pos(240, 190),
        origin("center"),
    ]);
    add([
        text("Note the bars between ship parts cannot be damaged.\n\nGood luck!"),
        pos(240, 240),
        origin("center"),
    ]);
    add([
        text("Play game"),
        pos(240, 270),
        origin("center"),
        color(0, 0, 0)
    ]);
    add([
        rect(160, 20),
        pos(240, 300),
        origin("center"),
        "button",
        {
            clickAction: () => go('menu'),
        },
    ]);
    add([
        text("Back"),
        pos(240, 300),
        origin("center"),
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

    keyPress("space", () => { go('game'); });
    keyPress("enter", () => { go('game'); });
    keyPress("escape", () => { go('menu'); });
    keyPress("1", () => { go('game'); });
    keyPress("2", () => { go('menu'); });
    keyPress("3", () => { go('menu'); });
});

start("menu");