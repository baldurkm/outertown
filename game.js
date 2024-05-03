class Example extends Phaser.Scene {
    constructor() {
        super();
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

/*        // Add GUI
        const cam = this.cameras.main;
        const gui = new dat.GUI();
        const help = {
            line1: 'Cursors to move',
            line2: 'Q & E to zoom'
        };
        const f1 = gui.addFolder('Camera');
        f1.add(cam, 'x').listen();
        f1.add(cam, 'y').listen();
        f1.add(cam, 'scrollX').listen();
        f1.add(cam, 'scrollY').listen();
        f1.add(cam, 'rotation').min(0).step(0.01).listen();
        f1.add(cam, 'zoom', 0.1, 2).step(0.1).listen();
        f1.add(help, 'line1');
        f1.add(help, 'line2');
        f1.open();
    }*/

    update(time, delta) {
        // Update controls
        this.controls.update(delta);
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1080,
    height: 1920,
    backgroundColor: '#000000',
    scene: Example
};

const game = new Phaser.Game(config);
