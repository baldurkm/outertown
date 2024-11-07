let buildMode = false;

class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        this.load.image('background', 'assets/img/background.jpg');
        this.load.image('playButton', 'assets/img/play_button.jpg');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        this.add.text(this.cameras.main.centerX, 100, 'Main Menu', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        const playButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'playButton').setInteractive();
        playButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.buildButton = null;
        this.buttonBackground = null;
    }

    preload() {
        this.load.image('buildingIcon', 'assets/img/building_icon.png');
        this.load.image('grass', 'assets/img/grass.png');
        this.load.image('desert', 'assets/img/desert.png');
        this.load.image('badlands', 'assets/img/badlands.png');
    }

    create() {
        this.initializeBuildingGrid();
        this.createControls();
        this.createBuildButton();
        this.generateTerrain();
    }

    update(time, delta) {
        if (buildMode) {
            this.drawGrid(gridSize);
        }
        this.controls.update(delta);
    }

    initializeBuildingGrid() {
        this.buildingGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill([]));
    }

    createControls() {
        const cursors = this.input.keyboard.createCursorKeys();
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
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    }

    generateTerrain() {
        const simplex = new SimplexNoise();
        const terrainTypes = ['grass', 'desert', 'badlands'];
        for (let y = 0; y < mapHeight; y += gridSize) {
            for (let x = 0; x < mapWidth; x += gridSize) {
                const noiseValue = simplex.noise2D(x * 0.001, y * 0.001);
                const terrainType = noiseValue < -0.5 ? 'desert' : noiseValue < 0 ? 'badlands' : 'grass';
                this.add.image(x, y, terrainType).setOrigin(0);
            }
        }
    }

    createBuildButton() {
        this.buttonBackground = this.add.rectangle(20, 20, 150, 60, 0x000000, 0.5).setOrigin(0).setScrollFactor(0);
        this.buildButton = this.add.text(95, 50, 'Build', { fill: '#ffffff', fontSize: '24px' }).setOrigin(0.5).setInteractive().setScrollFactor(0);
        this.buildButton.on('pointerdown', () => buildMode = true);
    }

    drawGrid(gridSize) {
        if (buildMode) {
            this.input.off('pointerdown');
            const graphics = this.add.graphics().clear().lineStyle(2, 0x000000, 1);
            for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
                graphics.moveTo(x, 0).lineTo(x, this.cameras.main.height);
            }
            for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
                graphics.moveTo(0, y).lineTo(this.cameras.main.width, y);
            }
            graphics.strokePath();
            this.input.once('pointerdown', (pointer) => this.handlePointerDown(pointer));
        } else {
            this.input.off('pointerdown');
        }
    }

    handlePointerDown(pointer) {
        const gridX = Math.floor(pointer.worldX / gridSize);
        const gridY = Math.floor(pointer.worldY / gridSize);
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            if (!this.isBuildingPlaced(gridX, gridY)) {
                this.placeBuildingInGrid(gridX, gridY);
                console.log("Placed building.");
            }
            buildMode = false;
            this.buildButton.setInteractive();
        }
    }

    isBuildingPlaced(gridX, gridY) {
        return this.buildingGrid[gridX][gridY].length > 0;
    }

    placeBuildingInGrid(gridX, gridY) {
        this.buildingGrid[gridX][gridY].push('buildingIcon');
        this.add.image(gridX * gridSize, gridY * gridSize, 'buildingIcon').setOrigin(0);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1920,
    backgroundColor: '#000000',
    scene: [MainMenu, GameScene]
};

const game = new Phaser.Game(config);
