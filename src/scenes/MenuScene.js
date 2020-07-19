class MenuScene extends Phaser.Scene{
    constructor(){
        super("MenuScene");
    }

    preload(){
        this.load.image('playBtn', 'assets/ui/playgame_button.png');
        this.load.image('title', 'assets/bg/titleScreen.jpg');
    }

    create(){
        let startBtn = this.add.image(200, 550, "playBtn");
        let bg = this.add.image(0, 0, 'title').setOrigin(0,0).setDepth(-10);
        startBtn.setInteractive({cursor : 'pointer'}); // ändere das Cursor Symbol
        startBtn.on("pointerdown", ()=>{ // bei Click auf Element, führe diese Funktion aus
            this.scene.start("GameScene");
        });
    }
}