var game;
var gameOptions = {
    tileSize: 200,
    tweenSpeed: 50,
    tileSpacing: 20
}

window.onload = function() {
    var gameConfig = {
        type: Phaser.CANVAS,
        width: gameOptions.tileSize * 4 + gameOptions.tileSpacing * 5,
        height: gameOptions.tileSize * 4 + gameOptions.tileSpacing * 5,
        backgroundColor: 0xfaf7ac,
        scene: [titleScene, playGame, gameOverScene],
        fps: {
            target: 30,
            forceSetTimeOut: true
        },
        audio: {
            disableWebAudio: true
        }
   };
    game = new Phaser.Game(gameConfig);
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}

var titleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function titleScene() {
        Phaser.Scene.call(this, {key: "TitleScene"});
    },
    preload: function() {
        this.load.image("background", "assets/images/background.png");
        this.load.image("button", "assets/images/play.png");
        this.load.audio('theme', 'assets/audio/bensound-littleidea.mp3');
    },
    create: function() {
        music = this.sound.add('theme');
        music.volume = 0.5;
        music.loop = true;
        music.play();
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        var playButton = this.add.image(450, 700, 'button').setDepth(1);
        playButton.setInteractive();
        this.input.on('gameobjectdown', this.onObjectClicked, this);
    },
    onObjectClicked: function() {
        this.scene.start('PlayGame')
    }
})

var gameOverScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function gameOverScene() {
        Phaser.Scene.call(this, {key: "GameOverScene"});
    },
    preload: function() {
        this.load.image("gameover", "assets/images/gameover.png");
        this.load.image("exit", "assets/images/continue.png");
        this.load.audio('theme', 'assets/audio/bensound-littleidea.mp3');
        this.load.bitmapFont('minecraft', 'assets/fonts/minecraft.png', 'assets/fonts/minecraft.xml');
    },
    create: function() {
        music = this.sound.add('theme');
        music.volume = 0.5;
        music.loop = true;
        music.play();

        this.add.image(450, 300, 'gameover');

        var Button = this.add.image(450, 700, 'exit').setDepth(0);
        Button.setInteractive();
        this.input.on('gameobjectdown', this.onObjectClicked, this);

        var text = this.add.bitmapText(450, 700, 'minecraft', 'CONTINUE', 45).setOrigin(0.5);
        text.tintFill
    },

    onObjectClicked: function() {
        this.scene.start('TitleScene')
    }
})

var playGame = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function playGame(){
        Phaser.Scene.call(this, {key: "PlayGame"});
    },
    preload: function(){
        this.load.image("tile", "tile.png");
        this.load.spritesheet("tiles", "assets/sprites/tiles.png", {
            frameWidth: gameOptions.tileSize,
            frameHeight: gameOptions.tileSize
        });
        this.load.audio('theme', 'assets/audio/bensound-littleidea.mp3');
        this.load.audio('score', 'assets/audio/pop.ogg');
    },
    create: function(){
        this.fieldArray = [];
        this.fieldGroup = this.add.group();
        music = this.sound.add('theme');
        music.volume = 0.25;
        music.loop = true;
        music.play();
        score = this.sound.add('score');
        score.volume = 1;
        for(var i = 0; i < 4; i++){
            this.fieldArray[i] = [];
            for(var j = 0; j < 4; j++){
                var two = this.add.sprite(this.tileDestination(j), this.tileDestination(i), "tiles");
                two.alpha = 0;
                two.visible = 0;
                this.fieldGroup.add(two);
                this.fieldArray[i][j] = {
                    tileValue: 0,
                    tileSprite: two,
                    canUpgrade: true
                }
            }
        }
        this.input.keyboard.on("keydown", this.handleKey, this);
        this.canMove = false;
        this.addTwo();
        this.addTwo();
        this.input.on("pointerup", this.endSwipe, this);
    },

    endSwipe: function(e){
        var swipeTime = e.upTime - e.downTime;
        var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        var swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);
        if(swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > 0.8 || Math.abs(swipeNormal.x) > 0.8)){
            var children = this.fieldGroup.getChildren();
            if(swipeNormal.x > 0.8) {
                for (var i = 0; i < children.length; i++){
                    children[i].depth = game.config.width - children[i].x;
                }
                this.handleMove(0, 1);
            }
            if(swipeNormal.x < -0.8) {
                for (var i = 0; i < children.length; i++){
                    children[i].depth = children[i].x;
                }
                this.handleMove(0, -1);
            }
            if(swipeNormal.y > 0.8) {
                for (var i = 0; i < children.length; i++){
                    children[i].depth = game.config.height - children[i].y;
                }
                this.handleMove(1, 0);
            }
            if(swipeNormal.y < -0.8) {
                for (var i = 0; i < children.length; i++){
                    children[i].depth = children[i].y;
                }
                this.handleMove(-1, 0);
            }
        }
    },
    addTwo: function(){
        var emptyTiles = [];
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                if(this.fieldArray[i][j].tileValue == 0){
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        var chosenTile = Phaser.Utils.Array.GetRandomElement(emptyTiles);
        this.fieldArray[chosenTile.row][chosenTile.col].tileValue = 1;
        this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
        this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
        this.tweens.add({
            targets: [this.fieldArray[chosenTile.row][chosenTile.col].tileSprite],
            alpha: 1,
            duration: gameOptions.tweenSpeed,
            onComplete: function(tween){
                tween.parent.scene.canMove = true;

                // when a move is completed, check for game over
                tween.parent.scene.checkGameOver();
            },
        });
	},
    handleKey: function(e){
        if(this.canMove){
            var children = this.fieldGroup.getChildren();
            switch(e.code){
                case "KeyA":
                case "ArrowLeft":
                    for (var i = 0; i < children.length; i++){
                        children[i].depth = children[i].x;
                    }
                    this.handleMove(0, -1);
                    break;
                case "KeyD":
                case "ArrowRight":
                    for (var i = 0; i < children.length; i++){
                        children[i].depth = game.config.width - children[i].x;
                    }
                    this.handleMove(0, 1);
                    break;
                case "KeyW":
                case "ArrowUp":
                    for (var i = 0; i < children.length; i++){
                        children[i].depth = children[i].y;
                    }
                    this.handleMove(-1, 0);
                    break;
                case "KeyS":
                case "ArrowDown":
                    for (var i = 0; i < children.length; i++){
                        children[i].depth = game.config.height - children[i].y;
                    }
                    this.handleMove(1, 0);
                    break;
            }
        }
    },
    handleMove: function(deltaRow, deltaCol){
        this.canMove = false;
        var somethingMoved = false;
        this.movingTiles = 0;
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                var colToWatch = deltaCol == 1 ? (4 - 1) - j : j;
                var rowToWatch = deltaRow == 1 ? (4 - 1) - i : i;
                var tileValue = this.fieldArray[rowToWatch][colToWatch].tileValue;
                if(tileValue != 0){
                    var colSteps = deltaCol;
                    var rowSteps = deltaRow;
                    while(this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == 0){
                        colSteps += deltaCol;
                        rowSteps += deltaRow;
                    }
                    if(this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && (this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == tileValue) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade && this.fieldArray[rowToWatch][colToWatch].canUpgrade){
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue ++;
                        this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
                        this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                        this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), true);
                        somethingMoved = true;
                    }
                    else{
                        colSteps = colSteps - deltaCol;
                        rowSteps = rowSteps - deltaRow;
                        if(colSteps != 0 || rowSteps != 0){
                            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue;
                            this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
                            this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), false);
                            somethingMoved = true;
                        }
                    }
                }
            }
        }
        if(!somethingMoved){
            this.canMove = true;
        }
    },
    moveTile: function(tile, row, col, distance, changeNumber){
        this.movingTiles ++;
        this.tweens.add({
            targets: [tile.tileSprite],
            x: this.tileDestination(col),
            y: this.tileDestination(row),
            duration: gameOptions.tweenSpeed * distance,
            onComplete: function(tween){
                tween.parent.scene.movingTiles --;
                if(changeNumber){
                    tween.parent.scene.transformTile(tile, row, col);
                }
                if(tween.parent.scene.movingTiles == 0){
                    tween.parent.scene.resetTiles();
                    tween.parent.scene.addTwo();
                }
            }
        })
    },
    transformTile: function(tile, row, col){
        this.movingTiles ++;
        tile.tileSprite.setFrame(this.fieldArray[row][col].tileValue - 1);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: gameOptions.tweenSpeed,
            yoyo: true,
            repeat: 1,
            onComplete: function(tween){
                tween.parent.scene.movingTiles --;
                if(tween.parent.scene.movingTiles == 0){
                    tween.parent.scene.resetTiles();
                    tween.parent.scene.addTwo();
                }
            }
        })
    },
    resetTiles: function(){
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                this.fieldArray[i][j].canUpgrade = true;
                this.fieldArray[i][j].tileSprite.x = this.tileDestination(j);
                this.fieldArray[i][j].tileSprite.y = this.tileDestination(i);
                if(this.fieldArray[i][j].tileValue > 0){
                    this.fieldArray[i][j].tileSprite.alpha = 1;
                    this.fieldArray[i][j].tileSprite.visible = true;
                    this.fieldArray[i][j].tileSprite.setFrame(this.fieldArray[i][j].tileValue - 1);
                }
                else{
                    this.fieldArray[i][j].tileSprite.alpha = 0;
                    this.fieldArray[i][j].tileSprite.visible = false;
                }
            }
        }
        score.play();
    },
    isInsideBoard: function(row, col){
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    },
    tileDestination: function(pos){
        return pos * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSize / 2 + gameOptions.tileSpacing
    },
    checkGameOver: function(){

        // loop through the entire board
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){

                // if there is an empty tile, it's not game over
                if(this.fieldArray[i][j].tileValue == 0){
                    return;
                }

                // if there are two vertical adjacent tiles with the same value, it's not game over
                if((i < 3) && this.fieldArray[i][j].tileValue == this.fieldArray[i + 1][j].tileValue){
                    return;
                }

                // if there are two horizontal adjacent tiles with the same value, it's not game over
                if((j < 3) && this.fieldArray[i][j].tileValue == this.fieldArray[i][j + 1].tileValue){
                    return
                }
            }
        }

        // ok, it's definitively game over
        this.scene.start('GameOverScene')
        alert("no more moves");
    }
});
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
