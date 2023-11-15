console.log('main.js loaded', tamagotchiJson);
let keystrokeCount = 0;
let pet;
const animationsPossibility = {
    'walk': tamagotchiJson.small_yellow.walk.animation,
    'eat': tamagotchiJson.small_yellow.eat.animation,
};
const basicText = new PIXI.Text('code typed: ' + keystrokeCount);
basicText.x = 10;
basicText.y = 10;
basicText.style = new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 18,
    fontFamily: 'Arial',
    stroke: 0x000000,
    strokeThickness: 4,
    wordWrap: true,
    wordWrapWidth: 440,
    backgroundColor: '#ccffff'
});

setTimeout(async () => {
    const app = new PIXI.Application({ background: '#1099bb', width: window.innerWidth - 50, height: window.innerHeight - 50 });
    const tamagotchiMoveTicker = app.ticker;
    console.log('pixi app created', tamagotchiImages);

    // Adding the application's view to the DOM
    document.body.appendChild(app.view);

    // const base = new PIXI.BaseTexture(tamagotchiImages);
    console.log('PIXI.Loader.shared', PIXI.Assets);
    pet = await createAnimatedSprite(
        {
            animations: tamagotchiJson.small_yellow.walk.animation,
            app: app,
            animatedSpriteLength: 2,
        }
    );

    pet.y = app.renderer.height - pet.height;

    //create a square in top left corner of screen with string text inside
    // const square = new PIXI.Graphics();
    // square.beginFill(0xDE3249);
    // square.drawRect(0, 0, 100, 100);
    // square.endFill();
    // square.x = 50;
    // square.y = 50;
    // app.stage.addChild(square);

    //create a text object that will be updated..
    // create algorithm to change animation based on keystrokeCount


    app.stage.addChild(basicText);


    // Add a variable to count up the seconds our demo has been running
    let elapsed = 0.0;
    // Tell our application's ticker to run a new callback every frame, passing
    // in the amount of time that has passed since the last tick
    let move = +1;
    pet.play();
    tamagotchiMoveTicker.add((delta) => {

        // Add the time to our total elapsed time
        elapsed += delta;
        res = moveAnimatedSprite({
            animatedSprite: pet,
            app: app,
            move: move,
            elapsed: elapsed,
        });
        elapsed = res.elapsed;
        move = res.move;
        // Update the sprite's to let him walk across the screen horizontally
        // from left to right if he is not at the right side of the screen

    });

    function moveAnimatedSprite({
        animatedSprite,
        app,
        move,
        elapsed,
    }) {
        if (move === +1) {
            animatedSprite.scale.x = 1;
            animatedSprite.x = Math.floor(elapsed * 0.8 % app.renderer.width);
            if (animatedSprite.x >= app.renderer.width - animatedSprite.width) {
                move = -1;
                elapsed = 0.0;
            }
        }
        // Update the sprite's to let him walk across the screen horizontally
        // from right to left if move is -1 and he is not at the left side of the screen
        else if (move === -1) {
            // transform pet to flip horizontally
            animatedSprite.scale.x = -1;
            // Move the sprite to the left
            animatedSprite.x = Math.floor(app.renderer.width - (elapsed * 0.8 % app.renderer.width));
            // console.log('sprite.x', sprite.x, elapsed);
            if (animatedSprite.x === 0 + animatedSprite.width) {
                move = +1;
                elapsed = 0.0;
            }
        }
        return {
            move: move,
            elapsed: elapsed,
        };
    }

    async function createAnimatedSprite({
        animations,
        app,
    }) {
        const textureArray = [];
        for (let animation of animations) {
            const textLoaded = await PIXI.Assets.load(tamagotchiImages);
            let frame = await new PIXI.Rectangle(animation.x, animation.y, animation.width, animation.height);
            let text = new PIXI.Texture(textLoaded.baseTexture, frame);
            textureArray.push({ texture: text, time: animation.time });
        }

        const animatedSprite = await new PIXI.AnimatedSprite(textureArray);

        // add animation to the stage and play them one after another controll the speed
        animatedSprite.animationSpeed = 1;
        animatedSprite.play();
        app.stage.addChild(animatedSprite);

        // animatedSprite.onLoop = () => {
        //     console.log('loop', animatedSprite.currentFrame, textureArray);
        // };

        return animatedSprite;
    }

    async function updateAnimatedSprite({
        animatedSprite,
        animations,
    }) {
        const textureArray = [];
        for (let animation of animations) {
            const textLoaded = await PIXI.Assets.load(tamagotchiImages);
            let frame = await new PIXI.Rectangle(animation.x, animation.y, animation.width, animation.height);
            let text = new PIXI.Texture(textLoaded.baseTexture, frame);
            textureArray.push({ texture: text, time: animation.time });
        }

        animatedSprite.textures = textureArray;
        animatedSprite.play();
        animatedSprite.y = app.renderer.height - pet.height;
        return animatedSprite;
    }

    window.addEventListener('message', async event => {
        console.log('event received', event.data);  // Outputs: Hello, world!
        if (event.data.stroke !== undefined) {
            keystrokeCount = event.data.stroke;
            console.log(`stroke count: ${keystrokeCount}`);
            basicText.text = `code typed: ${keystrokeCount}`;
            if (keystrokeCount < 100) {
                updateAnimatedSprite({
                    animatedSprite: pet,
                    animations: animationsPossibility.eat,
                });
                tamagotchiMoveTicker.stop();
            } else {
                updateAnimatedSprite({
                    animatedSprite: pet,
                    animations: animationsPossibility.walk,
                });
            }
        }
        // if (event.data.tamagotchiImages !== undefined) {
        // const tamagotchiImages = event.data.tamagotchiImages;
        console.log("event received", tamagotchiImages);  // Outputs: Hello, world!

        var containerApp = document.getElementById('app');
        // Create a PixiJS application of type cavas with specify background color and make it resizes to the iframe window
        //resize to window -50px of height

        // }
    });
}, 0);





