// Global constants and variables
const gridSize = 64;
var mapWidth = 18040;
var mapHeight = 9000;
var buildMode = false;
let buildButton, buttonBackground;

class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        // Load assets for the main menu
        this.load.image('background', 'assets/img/background.jpg');
        this.load.image('playButton', 'assets/img/play_button.jpg');
    }

    create() {
        // Add background and title text
        this.add.image(0, 0, 'background').setOrigin(0);
        this.add.text(this.cameras.main.centerX, 100, 'Main Menu', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        // Add play button and start game on click
        const playButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'playButton').setInteractive();
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.buildingGrid = [];
    }

    preload() {
        this.load.image('buildingIcon', 'assets/img/building_icon.png');
        this.load.image('grass', 'assets/img/grass.png');
        this.load.image('desert', 'assets/img/desert.png');
        this.load.image('badlands', 'assets/img/badlands.png');
    }

    create() {
        // Initialize grid, terrain, controls, and UI
        this.initializeBuildingGrid();
        this.generateTerrain();
        this.createControls();
        this.createBuildButton();
        this.setupCameraDragging();
    }

    update(time, delta) {
        if (buildMode) {
            this.drawGrid();
        }
        this.controls.update(delta);
    }

    initializeBuildingGrid() {
        // Build a 2D array for the grid
        this.buildingGrid = Array.from({ length: Math.ceil(mapWidth / gridSize) }, () => Array(Math.ceil(mapHeight / gridSize)).fill(null));
    }

    generateTerrain() {
        const simplex = new SimplexNoise();
        const terrainTypes = {
            grass: 'assets/img/grass.png',
            desert: 'assets/img/desert.png',
            badlands: 'assets/img/badlands.png'
        };

        // Load terrain images
        for (let type in terrainTypes) {
            this.load.image(type, terrainTypes[type]);
        }
        
        this.load.once('complete', () => {
            for (let y = 0; y < mapHeight; y += gridSize) {
                for (let x = 0; x < mapWidth; x += gridSize) {
                    const noiseValue = simplex.noise2D(x * 0.001, y * 0.001);
                    const terrain = noiseValue < -0.5 ? 'desert' : noiseValue < 0 ? 'badlands' : 'grass';
                    this.add.image(x, y, terrain).setOrigin(0);
                }
            }
        });
    }

    createControls() {
        const cursors = this.input.keyboard.createCursorKeys();
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
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
        });
    }

    setupCameraDragging() {
        this.input.on('pointerdown', (pointer) => {
            this.lastPointerX = pointer.x;
            this.lastPointerY = pointer.y;
        });

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && !pointer.isPinch) {
                const deltaX = pointer.x - this.lastPointerX;
                const deltaY = pointer.y - this.lastPointerY;
                this.cameras.main.scrollX -= deltaX;
                this.cameras.main.scrollY -= deltaY;
                this.lastPointerX = pointer.x;
                this.lastPointerY = pointer.y;
            }
        });
    }

    createBuildButton() {
        buttonBackground = this.add.rectangle(20, 20, 150, 60, 0x000000, 0.5).setOrigin(0).setScrollFactor(0);
        buildButton = this.add.text(95, 50, 'Build', { fill: '#ffffff', fontSize: '24px' }).setOrigin(0.5).setInteractive();
        buildButton.setScrollFactor(0);
        buildButton.on('pointerdown', () => {
            buildMode = !buildMode;
        });
    }

    drawGrid() {
        const graphics = this.add.graphics();
        graphics.clear();
        graphics.lineStyle(2, 0x000000, 1);

        // Draw grid lines
        for (let x = 0; x <= mapWidth; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, mapHeight);
        }
        for (let y = 0; y <= mapHeight; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(mapWidth, y);
        }
        graphics.strokePath();

        // Register pointer for building placement
        this.input.once('pointerdown', (pointer) => {
            const gridX = Math.floor(pointer.worldX / gridSize);
            const gridY = Math.floor(pointer.worldY / gridSize);

            if (!this.isBuildingPlaced(gridX, gridY)) {
                this.placeBuildingInGrid(gridX, gridY);
            }
            buildMode = false;
        });
    }

    isBuildingPlaced(gridX, gridY) {
        return this.buildingGrid[gridX] && this.buildingGrid[gridX][gridY] !== null;
    }

    placeBuildingInGrid(gridX, gridY) {
        this.buildingGrid[gridX][gridY] = 'buildingIcon';
        this.add.image(gridX * gridSize, gridY * gridSize, 'buildingIcon').setOrigin(0);
    }

    removeBuildingFromGrid(gridX, gridY) {
        if (this.buildingGrid[gridX][gridY]) {
            this.buildingGrid[gridX][gridY] = null;
        }
    }
}

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1920,
    backgroundColor: '#000000',
    scene: [MainMenu, GameScene]
};

const game = new Phaser.Game(config);
