import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import diagramImg from '../assets/diagram.svg';
import entityImg from '../assets/entity.png';

type Point = { x: number; y: number };

const PhaserAdvanced: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const speedRef = useRef(1); // Speed reference to avoid state re-rendering

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

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 800,
      parent: containerRef.current,
      scene: {
        preload: function (this: Phaser.Scene & { fpsText?: Phaser.GameObjects.Text }) {
          this.load.image('diagram', diagramImg);
          this.load.image('entity', entityImg);
        },
        create: function (this: Phaser.Scene & { fpsText?: Phaser.GameObjects.Text }) {
          const background = this.add.image(400, 300, 'diagram');
          background.setScale(0.45, 0.75);

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

          this.fpsText = this.add.text(20, 20, 'FPS: 0', {
            font: '20px Courier',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { left: 6, right: 6, top: 4, bottom: 4 }
          });
          this.fpsText.setScrollFactor(0);
          this.fpsText.setDepth(999);
        },
        update: function (this: Phaser.Scene & { fpsText?: Phaser.GameObjects.Text }, time, delta) {
          if (this.fpsText) {
            const fps = (1000 / delta).toFixed(1);
            this.fpsText.setText(`FPS: ${fps}`);
          }
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} />
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
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
        <span>{speedRef.current.toFixed(1)}x</span>
      </div>
    </div>
  );
};

export default PhaserAdvanced;
