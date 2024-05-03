class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        // Preload assets for the main menu
        this.load.image('background', 'assets/img/background.jpg');
        this.load.image('playButton', 'assets/img/play_button.png');
    }

    create() {
        // Add background image
        this.add.image(0, 0, 'background').setOrigin(0);

        // Add title text
        this.add.text(this.cameras.main.centerX, 100, 'Main Menu', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        // Add play button
        const playButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'playButton').setInteractive();
        
        // Add event listener to play button
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene'); // Start the game scene when the play button is clicked
        });
    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('grid', 'assets/img/grass.png');
    }

    create() {
        // Add grid images
        this.add.image(0, 0, 'grid').setOrigin(0);
        this.add.image(1024, 0, 'grid').setOrigin(0);
        this.add.image(0, 1024, 'grid').setOrigin(0);
        this.add.image(1024, 1024, 'grid').setOrigin(0);

        // Create cursors for keyboard input
        const cursors = this.input.keyboard.createCursorKeys();

        // Define control config for both keyboard and touch input
        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };

        // Create SmoothedKeyControl for keyboard input
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        // Add mobile touch controls
        this.input.on('pointerdown', function (pointer) {
            // Store initial touch position
            this.lastPointerX = pointer.x;
            this.lastPointerY = pointer.y;
        }, this);

        this.input.on('pointermove', function (pointer) {
            if (pointer.isDown && !pointer.isPinch) {
                // Calculate delta movement of touch
                const deltaX = pointer.x - this.lastPointerX;
                const deltaY = pointer.y - this.lastPointerY;

                // Move camera based on touch delta
                this.cameras.main.scrollX -= deltaX;
                this.cameras.main.scrollY -= deltaY;

                // Update last touch position
                this.lastPointerX = pointer.x;
                this.lastPointerY = pointer.y;
            }
        }, this);
    }

    update(time, delta) {
        // Update controls
        this.controls.update(delta);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1920,
    backgroundColor: '#000000',
    scene: [MainMenu, GameScene]
};

// Create a new Phaser game instance with the defined configuration
const game = new Phaser.Game(config);
