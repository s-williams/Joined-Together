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
});

start("menu");