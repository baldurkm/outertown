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
        //this.load.image('grid', 'assets/img/grass.png');
        this.load.image('buildingIcon', 'assets/img/building_icon.png'); // Load the building icon image
        this.generateTerrain();
    }

    create() {
        // Add grid images


        // Initialize building grid
        this.initializeBuildingGrid();

        // Generate terrain


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

        // Build button
        this.createBuildButton();
    }

    update(time, delta) {
        // Update controls
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
        // Initialize simplex noise for terrain generation
        const simplex = new SimplexNoise();
        console.log("Starting terrain generation");
    
        // Define an object to hold terrain type image paths
        const terrainTypeImagePaths = {
            'grass': 'assets/img/grass.png',
            'desert': 'assets/img/desert.png',
            'badlands': 'assets/img/badlands.png'
        };
    
        // Preload terrain type images
        for (let terrainType in terrainTypeImagePaths) {
            const imagePath = terrainTypeImagePaths[terrainType];
            this.load.image(terrainType, imagePath);
            //console.log("Loaded image. " + terrainTypeImagePaths[terrainType]);
        }

        //console.log("Done loading images.");
    
        // Assign loaded images to terrainTypes after they are loaded
        const terrainTypes = {}; // Define an object to hold references to loaded terrain type images
        this.load.on('complete', () => {
            for (let terrainType in terrainTypeImagePaths) {
                terrainTypes[terrainType] = this.textures.get(terrainType);
                //console.log("Assigned image. " + terrainTypes[terrainType]);
            }
            //console.log("Done assigning images.");
    
            // Loop through each grid cell and assign a terrain type based on simplex noise
            const mapWidth = 4500; // Width of the game map
            const mapHeight = 9020; // Height of the game map
            const gridSize = 64;
            for (let y = 0; y < mapHeight; y += gridSize) {
                //console.log("Outer loop. " + y);
                for (let x = 0; x < mapWidth; x += gridSize) {
                    //console.log("Inner loop. " + x);
                    const noiseValue = simplex.noise2D(x * 0.001, y * 0.001);
                    const terrainType = noiseValue < -0.5 ? 'desert' : noiseValue < 0 ? 'badlands' : 'grass';
                    const tileX = Phaser.Math.Between(0, terrainTypes[terrainType].width / gridSize - 1) * gridSize;
                    const tileY = Phaser.Math.Between(0, terrainTypes[terrainType].height / gridSize - 1) * gridSize;
                    this.add.image(x, y, terrainType, tileX, tileY).setOrigin(0);
                    //console.log("Adding texture tile");
                }
            }
            //console.log("Passed for loops.");
        });
    }

    createBuildButton() {
        // Add a semi-transparent background rectangle for the button
        buttonBackground = this.add.rectangle(20, 20, 150, 60, 0x000000, 0.5);
        buttonBackground.setOrigin(0); // Set the origin to the top-left corner
        buttonBackground.setScrollFactor(0,0);

        // Add the build button text
        buildButton = this.add.text(95, 50, 'Build', { fill: '#ffffff', fontSize: '24px' }); // Adjust the fontSize as needed
        buildButton.setOrigin(0.5); // Set the origin to the center of the text
        buildButton.setInteractive(); // Enable interactivity
        buildButton.on('pointerdown', () => buildMode = true); // Show the building grid when clicked
        buildButton.setScrollFactor(0,0);
    }

    drawGrid(gridSize) {
        if (buildMode == true) {

        console.log("Showing Building Grid.");
    
        // Remove any existing 'pointerdown' event listener
        this.input.off('pointerdown');
    
        // Create a graphics object to draw the grid lines
        const graphics = this.add.graphics();
    
        // Set line style for the grid lines
        graphics.lineStyle(2, 0x000000, 1); // 2 pixels thick, black color, alpha 1 (fully opaque)
    
        // Draw vertical grid lines
        for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
            graphics.moveTo(x, 0); // Move to the starting point of the line
            graphics.lineTo(x, this.cameras.main.height); // Draw a line from the starting point to the bottom of the screen
        }
        graphics.strokePath(); // Stroke the path to actually draw the lines
    
        // Draw horizontal grid lines
        for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
            graphics.moveTo(0, y); // Move to the starting point of the line
            graphics.lineTo(this.cameras.main.width, y); // Draw a line from the starting point to the right edge of the screen
        }
        graphics.strokePath(); // Stroke the path to actually draw the lines
    
        // Listen for pointer events on the building grid
        this.input.on('pointerdown', (pointer) => {
            // Calculate the grid position based on the pointer coordinates
            const gridX = Math.floor(pointer.worldX / gridSize);
            const gridY = Math.floor(pointer.worldY / gridSize);
            console.log("Pointer down at " + gridX + ", " + gridY);
            console.log("Check for buildings: " + this.isBuildingPlaced(gridX, gridY));
            // Check if a building is already placed at this grid position
            if (!this.isBuildingPlaced(gridX, gridY)) {
                // Place the building icon at the grid position
                this.placeBuildingInGrid(gridX, gridY, this);
                console.log("Placed building.");
                buildButton.setInteractive(); // Re-enable the build button
                buildMode = false;
            } else {
                // Confirm the building placement
                //this.placeBuildingInGrid(gridX, gridY);
                buildButton.setInteractive(); // Re-enable the build button
                buildMode = false;
            }
        });
    }
    else // if build mode is not active
    {
        graphics.destroy();
        this.input.off('pointerdown');
    }

}

    isBuildingPlaced(gridX, gridY) {
        return this.buildingGrid[gridX][gridY].length > 0; // Return true if there are buildings in the grid square
    }

    placeBuildingInGrid(gridX, gridY, buildingType) {
        this.buildingGrid[gridX][gridY].push(buildingType); // Add the building to the array at the specified grid square
    }

    removeBuildingFromGrid(gridX, gridY, buildingType) {
        const index = this.buildingGrid[gridX][gridY].indexOf(buildingType);
        if (index !== -1) {
            this.buildingGrid[gridX][gridY].splice(index, 1); // Remove the building from the array at the specified grid square
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

// Create a new Phaser game instance with the defined configuration
const game = new Phaser.Game(config);