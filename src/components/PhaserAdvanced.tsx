import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import diagramImg from '../assets/diagram.svg';
import entityImg from '../assets/entity.png';

type Point = { x: number; y: number };

const PhaserAdvanced: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const speedRef = useRef(1); // Speed reference to avoid state re-rendering
  const [fpsValue, setFpsValue] = useState<number>(0);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(event.target.value);
    speedRef.current = newSpeed; // Update the speed directly without triggering a re-render
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const offsetValue = -165;
    const offsetValue2 = -260;
    const basePositions = {
      arrival: { x: 215 + offsetValue2, y: 560 + offsetValue },
      register: { x: 405 + offsetValue2, y: 560 + offsetValue },
      triage: { x: 570 + offsetValue2, y: 560 + offsetValue },
      lowAcuity: { x: 785 + offsetValue2, y: 445 + offsetValue },
      mainED: { x: 785 + offsetValue2, y: 560 + offsetValue },
      trauma: { x: 785 + offsetValue2, y: 675 + offsetValue },
      exit: { x: 975 + offsetValue2, y: 560 + offsetValue }
    };

    const paths = {
      initialPath: [
        basePositions.arrival,
        basePositions.register,
        basePositions.triage
      ],
      lowAcuityPath: [
        basePositions.triage,
        { x: basePositions.triage.x + 60, y: basePositions.triage.y },
        { x: basePositions.triage.x + 60, y: basePositions.lowAcuity.y - 15 },
        basePositions.lowAcuity,
        { x: basePositions.lowAcuity.x + 105, y: basePositions.lowAcuity.y - 15 },
        { x: basePositions.lowAcuity.x + 105, y: basePositions.exit.y },
        basePositions.exit
      ],
      mainEDPath: [
        basePositions.triage,
        { x: basePositions.triage.x + 80, y: basePositions.triage.y },
        basePositions.mainED,
        basePositions.exit
      ],
      traumaPath: [
        basePositions.triage,
        { x: basePositions.triage.x + 60, y: basePositions.triage.y },
        { x: basePositions.triage.x + 60, y: basePositions.trauma.y + 15 },
        basePositions.trauma,
        { x: basePositions.trauma.x + 105, y: basePositions.trauma.y + 15 },
        { x: basePositions.trauma.x + 105, y: basePositions.exit.y },
        basePositions.exit
      ]
    };

    // Define the custom scene class to properly handle TypeScript types
    class DiagramScene extends Phaser.Scene {
      cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
      cameraSpeed: number = 10;
      mainCamera?: Phaser.Cameras.Scene2D.Camera;
      updateFps: (fps: number) => void;
      
      constructor(updateFps: (fps: number) => void) {
        super({ key: 'DiagramScene' });
        this.updateFps = updateFps;
      }

      preload() {
        this.load.image('diagram', diagramImg);
        this.load.image('entity', entityImg);
      }

      create() {
        const background = this.add.image(400, 300, 'diagram');
        background.setScale(0.45, 0.75);

        // Setup camera
        this.setupCamera();
        
        // Setup keyboard controls
        // Make sure keyboard is enabled in the input plugin
        if (this.input.keyboard) {
          this.cursors = this.input.keyboard.createCursorKeys();
        } else {
          console.error("Keyboard plugin is not available");
        }

        const spriteObj = this.add.sprite(paths.initialPath[0].x, paths.initialPath[0].y, 'entity');
        spriteObj.setScale(0.3);

        let currentPath = paths.initialPath;
        let pointIndex = 0;
        let pathComplete = false;

        const moveToNextPoint = () => {
          if (pointIndex >= currentPath.length - 1) {
            if (currentPath === paths.initialPath && !pathComplete) {
              pathComplete = true;
              const randomValue = Math.random();
              if (randomValue < 0.33) {
                currentPath = paths.lowAcuityPath;
              } else if (randomValue < 0.66) {
                currentPath = paths.mainEDPath;
              } else {
                currentPath = paths.traumaPath;
              }
              pointIndex = 0;
              moveToNextPoint();
              return;
            }
            if (pathComplete) {
              currentPath = paths.initialPath;
              pointIndex = 0;
              pathComplete = false;
              spriteObj.x = paths.initialPath[0].x;
              spriteObj.y = paths.initialPath[0].y;
              this.time.delayedCall(1000, moveToNextPoint);
              return;
            }
          }

          const nextIndex = pointIndex + 1;
          if (nextIndex < currentPath.length) {
            const distance = Math.sqrt(
              Math.pow(currentPath[nextIndex].x - spriteObj.x, 2) +
              Math.pow(currentPath[nextIndex].y - spriteObj.y, 2)
            );
            const baseDuration = 800;
            const duration = Math.max(500, baseDuration * (distance / 100) * (3 - speedRef.current)); // Use speedRef for speed

            this.tweens.add({
              targets: spriteObj,
              x: currentPath[nextIndex].x,
              y: currentPath[nextIndex].y,
              duration: duration,
              ease: 'Linear',
              onComplete: () => {
                pointIndex = nextIndex;
                moveToNextPoint();
              }
            });
          }
        };

        moveToNextPoint();

        // Update FPS in React component every second
        this.time.addEvent({
          delay: 1000,
          callback: () => {
            const fps = Math.floor(this.game.loop.actualFps);
            this.updateFps(fps);
          },
          loop: true
        });
      }

      setupCamera() {
        // Get the main camera
        this.mainCamera = this.cameras.main;
        
        // Set bounds for the camera (adjust these to match your diagram size)
        // Make bounds larger than the visible area to allow scrolling
        this.mainCamera.setBounds(-500, -500, 2000, 2000);
        
        // Optional: Add smooth camera movement with damping
        this.mainCamera.setLerp(0.1, 0.1);
        
        // Make sure the UI text stays fixed to the camera by setting their scroll factor to 0
        // This ensures they don't move when the camera moves
        
        // Optional: Add mouse wheel zoom functionality
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
          if (!this.mainCamera) return;
          
          const zoom = this.mainCamera.zoom;
          if (deltaY > 0) {
            // Zoom out - smaller increment for slower zoom
            this.mainCamera.setZoom(Math.max(0.5, zoom - 0.05));  // Changed from 0.1 to 0.05
          } else {
            // Zoom in - smaller increment for slower zoom
            this.mainCamera.setZoom(Math.min(2, zoom + 0.05));    // Changed from 0.1 to 0.05
          }
        });
      }

      handleCameraMovement() {
        if (!this.cursors || !this.mainCamera) return;
        
        // Move camera with arrow keys
        if (this.cursors.left.isDown) {
          this.mainCamera.scrollX -= this.cameraSpeed;
        } else if (this.cursors.right.isDown) {
          this.mainCamera.scrollX += this.cameraSpeed;
        }
        
        if (this.cursors.up.isDown) {
          this.mainCamera.scrollY -= this.cameraSpeed;
        } else if (this.cursors.down.isDown) {
          this.mainCamera.scrollY += this.cameraSpeed;
        }
      }

      update(time: number, delta: number) {
        // Handle camera movement with arrow keys
        this.handleCameraMovement();
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 800,
      parent: containerRef.current,
      fps: {
        target: 240,
        forceSetTimeOut: false
        },
      scene: new DiagramScene((fps: number) => setFpsValue(fps)),
      // Explicitly enable keyboard input
      input: {
        keyboard: true
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} />
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px', color: 'white' }}>
        <label htmlFor="speedSlider" style={{ marginRight: '10px' }}>Speed:</label>
        <input
          ref={sliderRef}
          type="range"
          id="speedSlider"
          min="0.1"
          max="3"
          step="0.1"
          defaultValue="1"
          onChange={handleSliderChange}
          style={{ width: '200px' }}
        />
        <span style={{ marginRight: '20px' }}>{speedRef.current.toFixed(1)}x</span>
        
        {/* FPS Counter in React UI */}
        <span style={{ 
          padding: '5px 10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#00ff00',
          borderRadius: '3px',
          marginLeft: '10px'
        }}>
          FPS: {fpsValue}
        </span>
      </div>
      <div style={{ position: 'absolute', top: '70px', left: '20px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px', color: 'white' }}>
        <p>Camera Controls:</p>
        <p>- Arrow keys to move camera</p>
        <p>- Mouse wheel to zoom in/out</p>
      </div>
    </div>
  );
};

export default PhaserAdvanced;