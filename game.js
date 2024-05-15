// Define variables for the build button and building icon
let buildButton;
let buttonBackground;
const gridSize = 64;
var mapWidth = 18040; // Width of the game map
var mapHeight = 9000; // Height of the game map
var buildMode = false;

class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        // Preload assets for the main menu
        this.load.image('background', 'assets/img/background.jpg');
        this.load.image('playButton', 'assets/img/play_button.jpg');
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
        this.load.image('buildingIcon', 'assets/img/building_icon.png'); // Load the building icon image
        this.generateTerrain();
    }

    create() {
        // Initialize building grid
        this.initializeBuildingGrid();

        // Create cursors for keyboard input
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

        this.input.on('pointerdown', function (pointer) {
            this.lastPointerX = pointer.x;
            this.lastPointerY = pointer.y;
        }, this);

        this.input.on('pointermove', function (pointer) {
            if (pointer.isDown && !pointer.isPinch) {
                const deltaX = pointer.x - this.lastPointerX;
                const deltaY = pointer.y - this.lastPointerY;

                this.cameras.main.scrollX -= deltaX;
                this.cameras.main.scrollY -= deltaY;

                this.lastPointerX = pointer.x;
                this.lastPointerY = pointer.y;
            }
        }, this);

        // Build button
        this.createBuildButton();
    }

    update(time, delta) {
        if (buildMode) {
            this.drawGrid(gridSize);
        }

        this.controls.update(delta);
    }

    initializeBuildingGrid() {
        this.buildingGrid = [];
        for (let i = 0; i < gridSize; i++) {
            this.buildingGrid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                this.buildingGrid[i][j] = [];
            }
        }
    }

    generateTerrain() {
        const simplex = new SimplexNoise();
        console.log("Starting terrain generation");

        const terrainTypeImagePaths = {
            'grass': 'assets/img/grass.png',
            'desert': 'assets/img/desert.png',
            'badlands': 'assets/img/badlands.png'
        };

        for (let terrainType in terrainTypeImagePaths) {
            const imagePath = terrainTypeImagePaths[terrainType];
            this.load.image(terrainType, imagePath);
        }

        const terrainTypes = {};
        this.load.on('complete', () => {
            for (let terrainType in terrainTypeImagePaths) {
                terrainTypes[terrainType] = this.textures.get(terrainType);
            }

            const mapWidth = 4500;
            const mapHeight = 9020;
            const gridSize = 64;
            for (let y = 0; y < mapHeight; y += gridSize) {
                for (let x = 0; x < mapWidth; x += gridSize) {
                    const noiseValue = simplex.noise2D(x * 0.001, y * 0.001);
                    const terrainType = noiseValue < -0.5 ? 'desert' : noiseValue < 0 ? 'badlands' : 'grass';
                    const tileX = Phaser.Math.Between(0, terrainTypes[terrainType].width / gridSize - 1) * gridSize;
                    const tileY = Phaser.Math.Between(0, terrainTypes[terrainType].height / gridSize - 1) * gridSize;
                    this.add.image(x, y, terrainType, tileX, tileY).setOrigin(0);
                }
            }
        });
    }

    createBuildButton() {
        buttonBackground = this.add.rectangle(20, 20, 150, 60, 0x000000, 0.5);
        buttonBackground.setOrigin(0);
        buttonBackground.setScrollFactor(0, 0);

        buildButton = this.add.text(95, 50, 'Build', { fill: '#ffffff', fontSize: '24px' });
        buildButton.setOrigin(0.5);
        buildButton.setInteractive();
        buildButton.on('pointerdown', () => buildMode = true);
        buildButton.setScrollFactor(0, 0);
    }

    drawGrid(gridSize) {
        if (buildMode) {
            console.log("Showing Building Grid.");

            this.input.off('pointerdown');

            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0x000000, 1);

            for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
                graphics.moveTo(x, 0);
                graphics.lineTo(x, this.cameras.main.height);
            }
            graphics.strokePath();

            for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
                graphics.moveTo(0, y);
                graphics.lineTo(this.cameras.main.width, y);
            }
            graphics.strokePath();

            this.input.on('pointerdown', (pointer) => {
                const gridX = Math.floor(pointer.worldX / gridSize);
                const gridY = Math.floor(pointer.worldY / gridSize);
                console.log("Pointer down at " + gridX + ", " + gridY);
                console.log("Check for buildings: " + this.isBuildingPlaced(gridX, gridY));
                if (!this.isBuildingPlaced(gridX, gridY)) {
                    this.placeBuildingInGrid(gridX, gridY);
                    console.log("Placed building.");
                    buildButton.setInteractive();
                    buildMode = false;
                } else {
                    buildButton.setInteractive();
                    buildMode = false;
                }
            });
        } else {
            this.input.off('pointerdown');
        }
    }

    isBuildingPlaced(gridX, gridY) {
        return this.buildingGrid[gridX][gridY].length > 0;
    }

    placeBuildingInGrid(gridX, gridY) {
        this.buildingGrid[gridX][gridY].push('buildingIcon'); // Store reference to the building
        this.add.image(gridX * gridSize, gridY * gridSize, 'buildingIcon').setOrigin(0); // Add the building image to the scene
    }

    removeBuildingFromGrid(gridX, gridY, buildingType) {
        const index = this.buildingGrid[gridX][gridY].indexOf(buildingType);
        if (index !== -1) {
            this.buildingGrid[gridX][gridY].splice(index, 1);
        }
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
