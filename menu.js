let highScore = 0;

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
        text("Author High Score: " + 0),
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