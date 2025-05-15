// src/components/PhaserGame.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PhaserGame: React.FC = () => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const phaserGame = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainer.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainer.current,
      scene: {
        preload: function(this: Phaser.Scene) {
          // optional: load assets here
        },
        create: function(this: Phaser.Scene) {
          // Draw a simple graphics object
          const graphics = this.add.graphics({ fillStyle: { color: 0x00ff00 } });
          graphics.fillRect(100, 100, 200, 150);
        },
        update: function(this: Phaser.Scene, time: number, delta: number) {
          // game loop
        }
      }
    };

    phaserGame.current = new Phaser.Game(config);

    return () => {
      phaserGame.current?.destroy(true);
    };
  }, []);

  return <div ref={gameContainer} />;
};

export default PhaserGame;