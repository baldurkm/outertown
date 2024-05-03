// Define variables for the build button and building icon
let buildButton;
let buildingIcon;

// Function to create the build button
function createBuildButton() {
    // Add a semi-transparent background rectangle for the button
    const buttonBackground = this.add.rectangle(20, 20, 150, 60, 0x000000, 0.5);
    buttonBackground.setOrigin(0); // Set the origin to the top-left corner

    // Add the build button text
    buildButton = this.add.text(95, 50, 'Build', { fill: '#ffffff', fontSize: '24px' }); // Adjust the fontSize as needed
    buildButton.setOrigin(0.5); // Set the origin to the center of the text
    buildButton.setInteractive(); // Enable interactivity
    buildButton.on('pointerdown', showBuildingGrid, this); // Show the building grid when clicked
}
// Function to show the building grid
function showBuildingGrid() {
    // Create a transparent rectangle to cover the screen and act as the building grid
    const buildingGrid = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x00ff00, 0.5);
    buildingGrid.setOrigin(0); // Set the origin to the top-left corner
    buildingGrid.setInteractive(); // Enable interactivity

    // Listen for pointer events on the building grid
    this.input.on('pointerdown', function(pointer) {
        // Calculate the grid position based on the pointer coordinates
        const gridX = Math.floor(pointer.worldX / gridSize);
        const gridY = Math.floor(pointer.worldY / gridSize);

        // Check if a building is already placed at this grid position
        if (!isBuildingPlaced(gridX, gridY)) {
            // Place the building icon at the grid position
            placeBuildingIcon(gridX, gridY);
        } else {
            // Confirm the building placement
            confirmBuildingPlacement(gridX, gridY);
        }
    });
}

// Function to check if a building is already placed at the specified grid position
function isBuildingPlaced(gridX, gridY) {
    // Your logic to check if a building is already placed at the specified grid position
    // Return true if a building is already placed, false otherwise
}

// Function to place the building icon at the specified grid position
function placeBuildingIcon(gridX, gridY) {
    // Remove any existing building icon
    if (buildingIcon) {
        buildingIcon.destroy();
    }

    // Create and position the building icon at the grid position
    buildingIcon = this.add.image(gridX * gridSize, gridY * gridSize, 'buildingIcon');
    buildingIcon.setOrigin(0); // Set the origin to the top-left corner of the icon
}

// Function to confirm the building placement
function confirmBuildingPlacement(gridX, gridY) {
    // Your logic to confirm the building placement
    // This could involve adding the building to the game world, deducting resources, etc.
    // Once confirmed, remove the building icon and building grid
    buildingIcon.destroy();
    this.input.off('pointerdown'); // Disable pointer events on the building grid
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
