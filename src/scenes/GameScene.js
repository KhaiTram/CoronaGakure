

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image('clouds', 'assets/bg/clouds.png'); // Hintergrund
        this.load.image('hospital', 'assets/tilesets/hospital.jpg');
        this.load.image('bomb', 'assets/objects/bomb.png');
        this.load.image('mask', 'assets/objects/mask.png');
        this.load.image('bossAttack', 'assets/objects/bossAttack.png');
        this.load.image('test', 'assets/tilesets/test.png'); // das Tileset
        this.load.image('sanitizer', 'assets/objects/Desinfektion.png');
        this.load.image('medicine', 'assets/objects/Desinfektion.png');

        this.load.spritesheet('ninja', 'assets/spritesheets/Ninja.png', { // Animationssheet für Figur
            frameWidth: 120,
            frameHeight: 220
        });
        this.load.spritesheet('vaccine', 'assets/objects/vaccine.png', {
            frameWidth: 60,
            frameHeight: 30
        });
        this.load.spritesheet('shield', 'assets/objects/mask.png', {
            frameWidth: 85,
            frameHeight: 215
        })

        this.load.spritesheet('zombie', 'assets/spritesheets/Zombie.png', {
            frameWidth: 120,
            frameHeight: 220
        });
        this.load.spritesheet('virus', 'assets/spritesheets/Virus.png', {
            frameWidth: 120,
            frameHeight: 150
        });
        this.load.spritesheet('boss', 'assets/spritesheets/Boss.png', {
            frameWidth: 120,
            frameHeight: 220
        });

        this.load.tilemapTiledJSON('map', 'assets/tilemaps/gameMap2.json');

        this.load.image('chak', 'assets/objects/Chakra.png');

        //audio
        this.load.audio('audio_bomb','assets/sounds/bomb.wav');
        this.load.audio('audio_vaccine','assets/sounds/vaccine.mp3' );
        this.load.audio('bossAttack','assets/sounds/caugh.wav');
        this.load.audio('bgmusic','assets/sounds/bgmusic.mp3');
    }

    create() {
        // Input Events
        this.cursors = this.input.keyboard.createCursorKeys();
        this.q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.e = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        


        //sounds
        this.bombAudio = this.sound.add("audio_bomb");
        this.vaccineAudio = this.sound.add("audio_vaccine");
        this.bgmusic = this.sound.add("bgmusic");
        var musicConfig = {
            mute:false,
            volume:0.5,
            rate:1,
            detune:0,
            seek:0,
            loop:true,
            delay:0
        }
        this.bgmusic.play(musicConfig);

        // erstellen der tilemap mit dem key der json Datei (siehe preload)
        var map = this.make.tilemap({ key: 'map' });

        // hinzufügen des tileset-Images an die das entsprechende tileset in tiled
        // param1: name des tilesets in tiled(!)
        // param2: key des tilesets in phaser (siehe preload) 
        var tilesetBg = map.addTilesetImage('hospital', 'hospital');
        var tileset = map.addTilesetImage('test', 'test');


        // erstellen eines layers aus der map in phaser
        // param1: name des layers in tiled(!)
        // param2: das zu verwendende tileset (siehe oben)
        // param3+4: x und y Koordinaten von wo das Tileset aus in die World eingefügt wird
        map.createDynamicLayer('background', tilesetBg, 0, 0);
        this.ground = map.createDynamicLayer('ground', tileset, 0, 0);
        this.door1 = map.createDynamicLayer('door1', tilesetBg, 0, 0);
        this.door2 = map.createDynamicLayer('door2', tilesetBg, 0, 0);


        // registriere das layer für Kolissionsabfragen
        this.ground.setCollisionByExclusion(-1, true);
        this.door1.setCollisionByExclusion(-1, true);
        this.door2.setCollisionByExclusion(-1, true);



        // setze die Grenzen der world gleich den Dimensionen unseres ground Layers
        this.physics.world.bounds.width = this.ground.width;
        this.physics.world.bounds.height = this.ground.height;

        // Spieler
        this.player = this.physics.add.sprite(50, 1300, 'ninja');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.door1);
        this.physics.add.collider(this.player, this.door2);
        this.player.alive = true;
        this.player.virusScore = 0;
        this.player.zombieScore = 0;
        this.player.isShooting = false;
        this.player.sanatizerEquipped = false;
        this.player.vaccineEquipped = false;
        this.player.maskEquipped = false;
        this.player.hp = new HealthBar(this, this.player.x, this.player.y - 100);
        console.log("create:" + this.player.x);


        //anims

        //Spieler anims
        this.anims.create({
            key: 'dudeWalk',
            frames: this.anims.generateFrameNumbers('ninja', {
                start: 2,
                end: 3
            }),
            frameRate: 7,
            repeat: -1,
        });

        this.anims.create({
            key: 'dudeStop',
            frames: [{
                key: 'ninja',
                frame: 4
            }],
            frameRate: 1
        });

        this.anims.create({
            key: 'dudeJump',
            frames: [{
                key: 'ninja',
                frame: 3
            }],
            frameRate: 1
        });

        this.anims.create({
            key: 'dudeShoot',
            frames: [{
                key: 'ninja',
                frame: 1
            }],
        });

        this.anims.create({
            key: 'dudeSick',
            frames: [{
                key: 'ninja',
                frame: 0
            }],
        });

        //Zombie anims
        this.anims.create({
            key: 'zombieBreathe',
            frames: this.anims.generateFrameNumbers('zombie', {
                start: 1,
                end: 2
            }),
            frameRate: gameSettings.enemySpeed,
            repeat: -1,
        });
        this.anims.create({
            key: 'cured',
            frames: [{
                key: 'zombie',
                frame: 0
            }],
            frameRate: 0,
            repeat: 0,
        });

        //Virus anims
        this.anims.create({
            key: 'virus_anim',
            frames: this.anims.generateFrameNumbers('virus', {
                start: 0,
                end: 1
            }),
            frameRate: gameSettings.enemySpeed,
            repeat: -1,
        });

        //Zombie anims
        this.anims.create({
            key: 'bossWalk',
            frames: this.anims.generateFrameNumbers('boss', {
                start: 0,
                end: 1
            }),
            frameRate: gameSettings.enemySpeed,
            repeat: -1,
        });

        this.anims.create({
            key: 'bossAttack',
            frames: this.anims.generateFrameNumbers('boss', {
                start: 2,
                end:2,
            }),
            frameRate: 2,
            repeat: 0,
        });

        this.anims.create({
            key: 'bossCured',
            frames: this.anims.generateFrameNumbers('boss', {
                start: 3,
                end: 3
            }),
            frameRate: gameSettings.enemySpeed,
            repeat: -1,
        });



        //end anims

        //Desinfektionsmittel 
        this.sanitizer = this.physics.add.image(3950, 500, 'sanitizer');
        this.sanitizer.body.setAllowGravity(false);
        this.sanitizer.body.setImmovable();
        this.physics.add.overlap(this.player, this.sanitizer, this.equipSanitizer, null, this);

        //Medizin
        this.medicine = this.physics.add.image(1650, 1010, 'medicine');
        this.medicine.body.setAllowGravity(false);
        this.medicine.body.setImmovable();
        this.physics.add.overlap(this.player, this.medicine, this.equipVaccine, null, this);

        //Maske
        this.mask = this.physics.add.image(3900, 1400, 'mask');
        this.mask.body.setAllowGravity(false);
        this.mask.body.setImmovable();
        this.physics.add.overlap(this.player, this.mask, this.equipMask, null, this);

        //Schild
        this.shield = this.physics.add.image(0, 0, "shield");
        this.shield.body.setAllowGravity(false);
        this.shield.body.setImmovable();
        this.shield.body.enable = false;
        this.shield.setVisible(false);

        // Grenzen der Kamera sodass nie Kamera nicht über die Grenzen der Welt hinwegscrollt
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // Kamera folgt dem player-Objekt
        this.cameras.main.startFollow(this.player);

        //chakra particles 
        this.chakra = this.physics.add.group({
            key: 'chak',
            repeat: 3,
            setXY: { x: 350, y: 1200, stepY: -300 }
        });

        this.chakra.children.iterate(child => {
            child.body.setAllowGravity(false);
        });

        this.chakra2 = this.physics.add.group({
            key: 'chak',
            repeat: 3,
            setXY: { x: 4250, y: 1200, stepY: -300 }
        });

        this.chakra2.children.iterate(child => {
            child.body.setAllowGravity(false);
        });

        this.physics.add.overlap(this.player, this.chakra, this.bouncePlatform, null, this);
        this.physics.add.overlap(this.player, this.chakra2, this.bouncePlatform, null, this);

        //wolken
        var clouds = this.physics.add.image(2341, 879, 'clouds');
        clouds.body.setAllowGravity(false);
        clouds.body.setImmovable();

        //Tweens

        //sanitizer
        this.tweens.add({
            targets: this.sanitizer,
            y: 490,
            duration: 1000,
            ease: 'line',
            yoyo: true,
            repeat: -1
        });

        //medicine
        this.tweens.add({
            targets: this.medicine,
            y: 1000,
            duration: 1000,
            ease: 'line',
            yoyo: true,
            repeat: -1
        });

        //chakra tween
        this.tweens.add({
            targets: this.chakra.children.entries,
            x: 700,
            yoyo: true,
            duration: 3000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            delay: function (target, targetKey, value, targetIndex, totalTargets, tween) {
                return targetIndex * 1900;
            }
        });

        this.tweens.add({
            targets: this.chakra2.children.entries,
            x: 4600,
            yoyo: true,
            duration: 3000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            delay: function (target, targetKey, value, targetIndex, totalTargets, tween) {
                return targetIndex * 1900;
            }
        });

        //cloudstween
        this.tweens.add({
            targets: clouds,
            x: 2500,
            duration: 10000,
            ease: 'line',
            yoyo: true,
            repeat: -1
        });
    }

    update() { 

        this.managePlayerMovements();

        this.manageWeapons();

        this.updateHealth();
    }

    updateHealth() {
        this.player.hp.updateHealthBar(this.player);
        if (this.viruses != undefined) {
            this.viruses.children.iterate(child => {
                child.hp.updateHealthBar(child);
            });
        }
        if (this.zombies != undefined) {
            this.zombies.children.iterate(child => {
                child.hp.updateHealthBar(child);
            });
        }
        if (this.boss != undefined) {
            this.boss.hp.updateHealthBar(this.boss);
        }
    }

    //input listener for weapons
    manageWeapons() {
        if (this.player.alive) {
            if (Phaser.Input.Keyboard.JustDown(this.q) && this.player.sanatizerEquipped) {
                this.player.isShooting = true;
                this.shootBomb();
                setTimeout(() => { this.player.isShooting = false }, 200)
            }
            if (Phaser.Input.Keyboard.JustDown(this.w) && this.player.vaccineEquipped) {
                this.player.isShooting = true;
                this.shootVaccine();
                setTimeout(() => { this.player.isShooting = false }, 200)
            }
            if (this.e.isDown && this.player.maskEquipped) {
                this.player.isShooting = true;
                this.holdShield();
            } else if (Phaser.Input.Keyboard.JustUp(this.e)) {
                this.player.isShooting = false;
                this.shield.body.enable = false;
                this.shield.setVisible(false);
            }
        }
    }

    //input listener for playermovements
    managePlayerMovements() {
        if (this.player.alive) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-gameSettings.playerspeed);
                if (!this.player.isShooting) {
                    this.player.setFlipX(false)
                    this.player.anims.play('dudeWalk', true);
                }
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(gameSettings.playerspeed);
                if (!this.player.isShooting) {
                    this.player.setFlipX(true)
                    this.player.anims.play('dudeWalk', true);
                }
            }
            else {
                this.player.setVelocityX(0);
                if (!this.player.isShooting) {
                    this.player.anims.play('dudeStop');
                }
            }

            if (this.cursors.up.isDown && this.player.body.onFloor()) {
                this.player.setVelocityY(-gameSettings.playerjump);
            }

            if (!this.player.body.onFloor() && !this.player.isShooting) {
                this.player.anims.play('dudeJump');
            }

            if (this.player.isShooting) {
                this.player.anims.play('dudeShoot');
            }
        } else {
            this.player.anims.play('dudeSick', true);
        }
    }

    killVirus(virus) {
        virus.destroy();
        this.player.virusScore++;
        if (this.player.virusScore == 10) {
            this.removeDoor1();
        }
    }

    cureZombie(zombie) {
        zombie.anims.play('cured');
        zombie.setVelocityY(-200);
        zombie.setVelocityX(0);
        zombie.setCollideWorldBounds(false);
        zombie.body.checkCollision.none = true;
        this.player.zombieScore++;
        if (this.player.zombieScore == 10) {
            this.removeDoor2();
        }
    }

    cureBoss(boss) {
        boss.anims.play('bossCured');
        boss.setVelocityX(0);
        this.bossTween.stop();
        this.timedEvent.remove(false);
    }


    shootBomb() {
        var flip = true;
        var xPos = 0;
        if (this.player.flipX) {
            flip = true;
            xPos = this.player.x + 40;
        } else {
            flip = false;
            xPos = this.player.x - 40
        }

        var bomb = this.physics.add.image(xPos, this.player.y, "bomb")
        this.physics.add.collider(bomb, this.ground, (bomb, ground) => { bomb.destroy(); }, null, this)
        if (this.viruses != undefined) {
            this.viruses.children.iterate(child => {
                this.physics.add.overlap(bomb, child, this.reduceVirusHp, null, this);
            });
        }

        if (flip) {
            bomb.setVelocity(800, -300);
        } else {
            bomb.setVelocity(-800, -300);
        }
        this.bombAudio.play();
    }

    shootVaccine() {
        var flip = true;
        var xPos = 0;
        if (this.player.flipX) {
            flip = true;
            xPos = this.player.x + 40;
        } else {
            flip = false;
            xPos = this.player.x - 40
        }
        var vaccine = this.physics.add.image(xPos, this.player.y, "vaccine")
        this.physics.add.collider(vaccine, this.ground, (vaccine, ground) => { vaccine.destroy(); }, null, this)
        vaccine.body.setAllowGravity(false);
        if (this.zombies != undefined) {
            this.zombies.children.iterate(child => {
                this.physics.add.overlap(vaccine, child, this.reduceEnemyHp, null, this);
            });
        }
        if (this.boss != undefined) {
            this.physics.add.overlap(vaccine, this.boss, this.reduceBossHp, null, this);
        }

        if (flip) {
            vaccine.setFlipX(false);
            vaccine.body.setVelocityX(800);
        } else {
            vaccine.setFlipX(true);
            vaccine.body.setVelocityX(-800);
        }
    }

    holdShield() {

        var xPos = 0;
        var yPos = this.player.y - 10;
        if (this.player.flipX) {
            this.shield.setFlipX(false);
            xPos = this.player.x + 100;
        } else {
            this.shield.setFlipX(true);
            xPos = this.player.x - 100;
        }

        this.shield.x = xPos;
        this.shield.y = yPos;
        this.shield.body.enable = true;
        this.shield.setVisible(true);

    }

    bouncePlatform() {
        this.player.setVelocityY(-320);
        this.player.anims.play('dudeJump');
    }

    reduceVirusHp(bomb, virus) {
        if (virus.hp.decrease(50)) {
            this.killVirus(virus);
            virus.hp.bar.clear();
        }
        bomb.destroy();
    }

    reduceEnemyHp(vaccine, enemy) {
        if (enemy.hp.decrease(20)) {
            this.cureZombie(enemy);
        }
        vaccine.destroy();
    }

    reduceBossHp(vaccine, boss) {
        if (boss.hp.decrease(2)) {
            this.cureBoss(boss);
        }
        vaccine.destroy();
    }

    //Equip
    equipSanitizer(player, sanitizer) {
        player.sanatizerEquipped = true;
        sanitizer.destroy();
        this.spawnViruses();
    }

    equipVaccine(player, vaccine) {
        player.vaccineEquipped = true;
        vaccine.destroy();
        this.spawnZombies();
    }

    equipMask(player, mask) {
        player.maskEquipped = true;
        mask.destroy();
        this.spawnBoss();
    }

    spawnViruses() {
        this.viruses = this.physics.add.group({
            key: 'virus',
            repeat: 9,
            setXY: { x: 3000, y: 500 }
        });
        this.viruses.children.iterate(child => {
            child.setCollideWorldBounds(true);
            child.body.setAllowGravity(false);
            child.x = Phaser.Math.Between(1500, 3000);
            child.y = Phaser.Math.Between(450, 600);
            child.setVelocity(100, 100);
            child.setBounce(1);
            this.physics.add.collider(child, this.ground);
            this.physics.add.collider(child, this.door1);
            this.physics.add.collider(child, this.player, this.takeDamage, null, this);
            child.hp = new HealthBar(this, child.x, child.y - 100);
            child.play("virus_anim");
        });
    }

    spawnZombies() {
        this.zombies = this.physics.add.group({
            key: 'zombie',
            repeat: 9,
            setXY: { x: 1200, y: 1100 }
        });
        this.zombies.children.iterate(child => {
            child.setCollideWorldBounds(true);
            child.x = Phaser.Math.Between(2300, 3900);
            child.setBounce(0.2);
            this.physics.add.collider(child, this.ground);
            this.physics.add.collider(child, this.door1);
            this.physics.add.collider(child, this.door2);
            this.physics.add.collider(child, this.player, this.takeZombieDamage, null, this);
            child.hp = new HealthBar(this, child.x, child.y - 100);
            child.play("zombieBreathe");
            child.body.setMaxVelocity(100);
            child.body.setAccelerationX(-50);
        });
    }

    spawnBoss() {
        this.boss = this.physics.add.sprite(1500, 1400, 'boss');
        this.boss.setCollideWorldBounds(true);
        this.boss.hp = new HealthBar(this, this.boss.x, this.boss.y - 100);
        this.boss.play("bossWalk");
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.boss, this.ground);
        this.bossTween = this.tweens.add({
            targets: this.boss,
            x: 3000,
            duration: 30000,
            ease: 'line',
            yoyo: true,
            repeat: -1
        });

        this.timedEvent = this.time.addEvent({ delay: 3000, callback: this.bossAttack, callbackScope: this, loop: true });
    }

    bossAttack() {
        this.boss.play("bossAttack");
        setTimeout(() => { this.boss.play("bossWalk") }, 500)
        this.shootCorona()
    }

    shootCorona() {
        var xPos = this.boss.x + 40;
        var yPos = this.boss.y - 40;
        
        var bossAttack = this.physics.add.image(xPos, yPos, "bossAttack");
        this.physics.add.collider(bossAttack, this.shield, this.takeReducedDamage, null, this)
        this.physics.add.collider(bossAttack, this.player, this.takeCriticalDamage, null, this)
        bossAttack.body.setAllowGravity(false);
        bossAttack.body.setVelocityX(800);
    }

    removeDoor1() {
        this.door1.setCollisionByExclusion(false);
        this.door1.setVisible(false);
    }

    removeDoor2() {
        this.door2.setCollisionByExclusion(false);
        this.door2.setVisible(false);
    }

    takeDamage() {
        if (this.player.hp.decrease(30)) {
            this.player.alive = false;
            this.gameOver()
        }
    }

    takeCriticalDamage(attack,player) {
        attack.destroy();
        if (player.hp.decrease(70)) {
            player.alive = false;
            this.gameOver()
        }
    }

    takeZombieDamage() {
        if (this.player.hp.decrease(0.5)) {
            this.player.alive = false;
            this.gameOver()
        }
    }

    takeReducedDamage(attack,player) {
        attack.destroy();
        if (this.player.hp.decrease(5)) {
            this.player.alive = false;
            this.gameOver();
        }
    }

    gameOver() {
        this.player.setImmovable();
        this.player.play("dudesick");
    }
}



