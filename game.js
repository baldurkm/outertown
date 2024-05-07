// Define variables for the build button and building icon
let buildButton;
let buildingIcon;
let buttonBackground;
const gridSize = 64;
const gridWidth = 20; // Set the width of the grid
const gridHeight = 20; // Set the height of the grid

// Define a 2D array to represent the building grid, initialized with empty values
let buildingGrid = [];

// Function to initialize the grid array
function initializebuildingGrid() {
    for (let i = 0; i < gridWidth; i++) {
        buildingGrid[i] = [];
        for (let j = 0; j < gridHeight; j++) {
            buildingGrid[i][j] = []; // Initialize each grid square as an empty array
        }
    }
}

// Function to check if a grid square contains a building
function isBuildingPlaced(gridX, gridY) {
    return buildingGrid[gridX][gridY].length > 0; // Return true if there are buildings in the grid square
}

// Function to place a building in the grid array
function placeBuildingInGrid(gridX, gridY, buildingType) {
    buildingGrid[gridX][gridY].push(buildingType); // Add the building to the array at the specified grid square
}

// Function to remove a building from the grid array
function removeBuildingFromGrid(gridX, gridY, buildingType) {
    const index = buildingGrid[gridX][gridY].indexOf(buildingType);
    if (index !== -1) {
        buildingGrid[gridX][gridY].splice(index, 1); // Remove the building from the array at the specified grid square
    }
}

// Function to create the build button
function createBuildButton() {
    // Add a semi-transparent background rectangle for the button
    buttonBackground = this.add.rectangle(20, 20, 150, 60, 0x000000, 0.5);
    buttonBackground.setOrigin(0); // Set the origin to the top-left corner

    // Add the build button text
    buildButton = this.add.text(95, 50, 'Build', { fill: '#ffffff', fontSize: '24px' }); // Adjust the fontSize as needed
    buildButton.setOrigin(0.5); // Set the origin to the center of the text
    buildButton.setInteractive(); // Enable interactivity
    buildButton.on('pointerdown', () => showBuildingGrid.call(this, gridSize)); // Show the building grid when clicked
}


// Function to show the building grid
function showBuildingGrid(gridSize) {
    console.log("Showing Building Grid.");

    // Remove any existing 'pointerdown' event listener
    this.input.off('pointerdown');

    // Create a graphics object to draw the grid lines
    const graphics = this.add.graphics();

    // Set line style for the grid lines
    graphics.lineStyle(2, 0xffffff, 1); // 2 pixels thick, black color, alpha 1 (fully opaque)

    // Draw vertical grid lines
    for (let x = 0; x <= this.cameras.main.width; x += gridSize) {
        graphics.moveTo(x, 0); // Move to the starting point of the line
        graphics.lineTo(x, this.cameras.main.height); // Draw a line from the starting point to the bottom of the screen
        console.log("Drew from " + x + " to " + this.cameras.main.height);
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= this.cameras.main.height; y += gridSize) {
        graphics.moveTo(0, y); // Move to the starting point of the line
        graphics.lineTo(this.cameras.main.width, y); // Draw a line from the starting point to the right edge of the screen
        console.log("Drew from " + y + " to " + this.cameras.main.width);
    }

    // Listen for pointer events on the building grid
    this.input.on('pointerdown', (pointer) => {
        // Calculate the grid position based on the pointer coordinates
        console.log("gridSize is " + gridSize + ". pointer.worldX is " + pointer.worldX + ". pointer.worldY is " + pointer.worldY + ".");
        const gridX = Math.floor(pointer.worldX / gridSize);
        const gridY = Math.floor(pointer.worldY / gridSize);
        console.log("Calculating grid position: " + gridX + ", " + gridY);
        console.log("isBuildingPlaced: " + isBuildingPlaced(gridX, gridY));

        // Check if a building is already placed at this grid position
        if (!isBuildingPlaced(gridX, gridY)) {
            // Place the building icon at the grid position
            placeBuildingInGrid(gridX, gridY, this);
        } else {
            // Confirm the building placement
            //placeBuildingInGrid.call(this, gridX, gridY);
        }
    });
}

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
        this.load.image('grid', 'assets/img/grass.png');
        this.load.image('buildingIcon', 'assets/img/building_icon.png'); // Load the building icon image
    }

    create() {
        // Add grid images
        this.add.image(0, 0, 'grid').setOrigin(0);
        this.add.image(1024, 0, 'grid').setOrigin(0);
        this.add.image(0, 1024, 'grid').setOrigin(0);
        this.add.image(1024, 1024, 'grid').setOrigin(0);

            initializebuildingGrid();

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

        // build button
        createBuildButton.call(this);
    }

update(time, delta) {
    // Update controls
    this.controls.update(delta);

    graphics.moveTo(0, 0);
    graphics.lineTo(500, 500);


    // Update the position of the build button based on the camera's position
    const cameraScrollX = this.cameras.main.scrollX;
    const cameraScrollY = this.cameras.main.scrollY;
    buttonBackground.x = 20 - cameraScrollX;
    buttonBackground.y = 20 - cameraScrollY;
    buildButton.x = 95 - cameraScrollX;
    buildButton.y = 50 - cameraScrollY;
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
