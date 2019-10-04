// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(600,600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
PIXI.loader.
add(["images/Spaceship.png","images/explosions.png","images/SubScope.png","images/MuzFlash.png","images/Map.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene,ship, subScope,subSubScope,scoreLabel,lifeLabel,gameOverScoreLabel,shootSound,hitSound,fireballSound,currentTarget, muzzleFlash, map, gameOverSubText, wantedForText;
let gameOverScene;
let timeticker;
let goodhit, badhit;
let possibleReasonsWanted = [];

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let possibleColors = [];
let explosionTextures;
let score = 0;
let life = 3;
let levelNum = 1;
let paused = true;
let bulletShot = false;

let tripleFire = false;

function setup() {
    possibleColors.push(0xffffff);
    possibleColors.push(0xff0000);
    possibleColors.push(0x00ff00);
    possibleColors.push(0x0000ff);
    possibleColors.push(0xffff00);
    possibleColors.push(0x00ffff);
    possibleColors.push(0xff00ff);
    possibleColors.push(0x888888);
    
    possibleReasonsWanted.push("Jaywalking");
    possibleReasonsWanted.push("Screen-Peeking in Local Multiplayer");
    possibleReasonsWanted.push("Pronounces GIF wrong");
    possibleReasonsWanted.push("Stole your lunch money back in third grade");
    possibleReasonsWanted.push("Says OWO unironically");
    possibleReasonsWanted.push("Pours milk before cereal");
    possibleReasonsWanted.push("Plays kirby, only uses down-b");
    possibleReasonsWanted.push("Thought it was yanny instead of laurel");
    possibleReasonsWanted.push("Tax evasion");
    possibleReasonsWanted.push("Has an anime profile picture");
    possibleReasonsWanted.push("Subscribed to pewdiepie");
    possibleReasonsWanted.push("Enjoys javascript");
    possibleReasonsWanted.push("Hanzo main");
    possibleReasonsWanted.push("Is already Tracer");
    possibleReasonsWanted.push("Offered to be 'idea guy' for my game");
    possibleReasonsWanted.push("Furry avatar");
    possibleReasonsWanted.push("Kicked me from their minecraft server");
    possibleReasonsWanted.push("Enjoys licorice");
    possibleReasonsWanted.push("Hates dogs");
    possibleReasonsWanted.push("Doesnt break kit-kat bars correctly");
    possibleReasonsWanted.push("High treason");
    possibleReasonsWanted.push("Doesnt say thank you to the bus driver");
    
    
	stage = app.stage;
	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);
	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    
    map = new Map();
    gameScene.addChild(map);
	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();
	
	// #6 - Load Sounds
	// #6 - Load Sounds
    shootSound = new Howl({
	   src: ['sounds/shot.mp3']
    });

    hitSound = new Howl({
	   src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
	   src: ['sounds/fireball.mp3']
    });
    // #5 - Create ship
	ship = new Ship();
    gameScene.addChild(ship);
    subScope = new SubScope();
    gameScene.addChild(subScope);
    subSubScope = new SubSubScope();
    gameScene.addChild(subSubScope);
    muzzleFlash = new MuzzleFlash();
    gameScene.addChild(muzzleFlash);
	// #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();
	// #8 - Start update loop
	app.ticker.add(gameLoop);
	// #9 - Start listening for click events on the canvas
	app.view.onclick = fireBullet;
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){ 
    timeticker = 0;
    goodhit = false;
    badhit = false;
    //START SCENE
    let buttonStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 28,
        fontFamily: "Consolas",
        stroke: 0xFF0000,
        strokeThickness:6
    });
    
    let startLabel1 = new PIXI.Text("JSniper");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 144,
        fontFamily: "Consolas",
        fontStyle: "bold"
        //stroke: 0xFF0000,
        //strokeThickness: 6
    });
    startLabel1.x = 20;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);
    
    let startLabel2 = new PIXI.Text("-a head-clicking simulator-");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Consolas"
        //fontStyle: "italic",
        //stroke: 0xFF0000,
        //strokeThickness: 6
    });
    startLabel2.x = 60;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);
    
    let startButton = new PIXI.Text("Click here to start clicking on heads");
    startButton.style = buttonStyle;
    startButton.x =10;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e=>e.target.alpha = 0.7);
    startButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton)
    
    //GAME SCENE
    let textStyle = new PIXI.TextStyle({
        fill: 0xffffff,
        fontSize: 18,
        fontFamily: "Consolas",
        stroke: 0x000000,
        strokeThickness: 4
    });
    
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
    
    let targetTextStyle = new PIXI.TextStyle({
        fill: 0x22FF44,
        fontSize: 18,
        fontFamily: "Consolas",
        stroke: 0xFF0000,
        strokeThickness: 8
    });
    currentTarget = new PIXI.Text();
    currentTarget.style = targetTextStyle;
    currentTarget.x = 5;
    currentTarget.y = 47;
    gameScene.addChild(currentTarget);
    
    
    wantedForText = new PIXI.Text();
    wantedForText.style = textStyle;
    wantedForText.x = 5;
    wantedForText.y = 70;
    gameScene.addChild(wantedForText);
    assignNewTarget();
    
    //GAME OVER SCENE
    let gameOverText = new PIXI.Text("GAME OVER");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 100,
        fontFamily: "Consolas",
        //stroke: 0xFF0000,
        //strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 50;
    gameOverText.y = 50;
    gameOverScene.addChild(gameOverText);
    
    let gameOverSubText = new PIXI.Text("Too many innocent casualties");
    gameOverSubText.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Consolas",
        //stroke: 0xFF0000,
        //strokeThickness: 6
    });
    gameOverSubText.x = 50;
    gameOverSubText.y = 150;
    gameOverScene.addChild(gameOverSubText);
    
    let playAgainButton = new PIXI.Text("Start Over?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 220;
    playAgainButton.y = sceneHeight - 120;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on("pointerover", e=>e.target.alpha = 0.7);
    playAgainButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
    
    
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFF00,
        fontSize: 42,
        fontFamily: "Consolas",
        //stroke: 0xFF0000,
        //strokeThickness: 6
    });
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 150;
    gameOverScoreLabel.y = 200;
    gameOverScene.addChild(gameOverScoreLabel);
    
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    
    levelNum = 1;
    score = 0;
    life = 3;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    subScope.x = 300;
    subScope.y = 550;
    subSubScope.x = 300;
    subSubScope.y = 550;
    muzzleFlash.x = 300;
    muzzleFlash.y = 550;
    loadLevel();
    
    tripleFire = false;
}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = 'Score ' + score;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = "Lives " + life; 
}

function gameLoop(){
	if (paused) return; 
	
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;	
    
    // #2 - Move Ship
	let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let amount = 6 * dt;
    let newX = lerp(ship.x, mousePosition.x, amount);
    let newY = lerp(ship.y, mousePosition.y, amount);
    ship.x = clamp(newX, 0, sceneWidth);
    ship.y = clamp(newY, 0 , sceneHeight);
    
    // Move SubScope
	
    newX = lerp(subScope.x, ship.x, amount);
    newY = lerp(subScope.y, ship.y, amount);
    subScope.x = newX;
    subScope.y = newY;
    
    newX = lerp(subSubScope.x, subScope.x, amount);
    newY = lerp(subSubScope.y, subScope.y, amount);
    subSubScope.x = newX;
    subSubScope.y = newY;
    
    muzzleFlash.x = ship.x;
    muzzleFlash.y = ship.y;
    
	// #3 - Move Circles
	for(let c of circles){
        c.move(dt);
        if(c.x <= c.radius || c.x >= sceneWidth - c.radius){
            c.reflectX();
            c.move(dt);
        }
        if(c.y <= c.radius || c.y >= sceneHeight - c.radius){
            c.reflectY();
            c.move(dt);
        }
    }
	/*
	// #4 - Move Bullets
    for (let b of bullets){
		b.move(dt);
	}*/
	
	// #5 - Check for Collisions
	for(let c of circles){
        
        for(let b of bullets){
            if(rectsIntersect(c, b)){
                fireballSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                assignNewTarget();
            }
            
            if(b.y < -10) b.isAlive = false;
        }
        
        if (bulletShot && pointInsideRect(ship, c)){
            fireballSound.play();
            createExplosion(c.x,c.y,64,64);
            gameScene.removeChild(c);

            c.isAlive = false;
            if (parseInt(currentTarget.style.stroke.toString().substr(1, 7), 16) == c.circleColor)
            {
                increaseScoreBy(1);
                goodhit = true;
            }
            else
            {
                console.log("Color 1 : ", parseInt(currentTarget.style.fill.toString().substr(1, 7), 16));
                console.log("Color 2 : ", c.circleColor);
                decreaseLifeBy(1); 
                badhit = true;

            }
            
            assignNewTarget();

        }
        
        /*
        if(c.isAlive && rectsIntersect(c, ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
        */
    }
    if (bulletShot)   {
        if (goodhit && !badhit) {
            muzzleFlash.tint = 0xFFFFFF;
        }
        else if (badhit) {
            muzzleFlash.tint = 0xFF0000;
        }
        else{
            muzzleFlash.tint = 0x555555;
        }
        ship.y -= 60;
        ship.x += (Math.random()-0.5) * 40;
        muzzleFlash.x = ship.x;
        muzzleFlash.y = ship.y;
        muzzleFlash.alpha = 1;
        //ship.tint = 0xff0000;
        goodhit = false;
        badhit = false;
    }
    else{
        muzzleFlash.alpha -= 0.05;
    }
	bulletShot = false;
	// #6 - Now do some clean up
	bullets = bullets.filter(b => b.isAlive);
    circles = circles.filter(c => c.isAlive);
    explosions = explosions.filter(e => e.isAlive);
	
	// #7 - Is game over?
	if (life <= 0){
	   end();
	   return; // return here so we skip #8 below
    }
	
	// #8 - Load next level
    if (circles.length == 0){
	   levelNum ++;
	   loadLevel();
        //tripleFire = true;
    }
    //flash target text
    timeticker += 1/app.ticker.FPS;
    currentTarget.style.strokeThickness = 6 * (timeticker % 1);
    currentTarget.style.strokeThickness = 6 * (timeticker % 1);
}

function createCircles(numCircles){
    
    for(let i = 0; i < numCircles; i++){
        let c = new Circle(10, possibleColors[i % 8]);
        c.x = Math.random() * (sceneWidth * 0.8) + 10;
        c.y = Math.random() * (sceneHeight * 0.8) + 10;
        
        circles.push(c);
        gameScene.addChild(c);
    }
    
    gameScene.removeChild(ship);
    gameScene.addChild(ship);
    gameScene.removeChild(subScope);
    gameScene.addChild(subScope);
    gameScene.removeChild(subSubScope);
    gameScene.addChild(subSubScope);
    gameScene.removeChild(scoreLabel);
    gameScene.addChild(scoreLabel);
    gameScene.removeChild(lifeLabel);
    gameScene.addChild(lifeLabel);
    gameScene.removeChild(currentTarget);
    gameScene.addChild(currentTarget);
    gameScene.removeChild(muzzleFlash);
    gameScene.addChild(muzzleFlash);
    gameScene.removeChild(wantedForText);
    gameScene.addChild(wantedForText);
}

function loadLevel(){
	createCircles(levelNum * 5);
	paused = false;
}

function end(){
    paused = true;
    
    circles.forEach(c => gameScene.removeChild(c));
    circles = [];
    bullets.forEach(b => gameScene.removeChild(b));
    bullets = [];
    explosions.forEach(e => gameScene.removeChild(e));
    explosions = [];
    
    gameOverScene.visible = true;
    gameScene.visible = false;
    
    gameOverScoreLabel.text = 'Your score: ' + score;
}

function fireBullet(e){
    if(paused) return;
    shootSound.play();
    /*
    if(tripleFire){
         let b1 = new Bullet(0xFFFFFF, ship.x - 10, ship.y);
        bullets.push(b1);
        gameScene.addChild(b1);
        
         let b2 = new Bullet(0xFFFFFF, ship.x, ship.y);
        bullets.push(b2);
        gameScene.addChild(b2);
        
         let b3 = new Bullet(0xFFFFFF, ship.x + 10, ship.y);
        bullets.push(b3);
        gameScene.addChild(b3);
        
        return;
    }
    
    
    let b = new Bullet(0xFFFFFF, ship.x, ship.y);
    bullets.push(b);
    gameScene.addChild(b);
    */
    bulletShot = true;
}

function loadSpriteSheet(){
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for(let i = 0; i < numFrames; i++){
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight){
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = e=>gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

function assignNewTarget()
{
    wantedForText.text = "Wanted for : " + possibleReasonsWanted[Math.floor(Math.random() * possibleReasonsWanted.length)];
    //wantedForText.text = "Wanted for : " + possibleReasonsWanted[0];
    currentTarget.text = "COLOR OF TARGET";
    let thiscolor;
    let thiscircle;
    for(let j = 0; j < circles.length; j++)
    {
        if (gameScene.children.includes(circles[j]))
        {
            thiscircle = circles[j]; 
        }
    }
    if (!thiscircle)
        {
            currentTarget.style.stroke = possibleColors[0];
            currentTarget.style.fill = 0x000000;
            return;
        }
    if (circles.length > 0){
        for (let i = 0; i < possibleColors.length; i++){
            if (parseInt(possibleColors[i].toString()) == thiscircle.circleColor){
                currentTarget.style.stroke = possibleColors[i];
                currentTarget.style.fill = 0x000000;
                break;
            }
            else{
                //console.log("First", circles[0].circleColor); 
                //console.log("Second", parseInt(possibleColors[i].toString()))
            }
        }
    }
    else{
        currentTarget.style.stroke = possibleColors[0];
        currentTarget.style.fill = 0x000000;
    }
    
    
    currentTarget.text = "COLOR OF TARGET";
}















