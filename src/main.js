const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            tileBias: 32,
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        MenuScene,
        GameScene,
      ]
};

var gameSettings = {
    playerspeed: 300,
    playerjump: 320,
    enemySpeed: 2
} 

var game = new Phaser.Game(config);