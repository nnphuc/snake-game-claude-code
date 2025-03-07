import React, { useState, useEffect, useCallback } from 'react';
import { Direction, GameState, MapType } from '../types';
import { initGameState, moveSnake } from '../gameUtils';
import GameBoard from './GameBoard';

const GRID_SIZE = 20;
const AVAILABLE_MAPS: MapType[] = ['classic', 'obstacles', 'maze', 'portal'];

// Map descriptions
const MAP_DESCRIPTIONS = {
  classic: "Traditional snake game with no obstacles. Perfect for beginners or purists. You can pass through walls!",
  obstacles: "Navigate around random obstacles scattered throughout the grid. Requires careful planning. Walls are passable!",
  maze: "Test your skills in a maze-like environment with strategic openings. Pass through walls to find shortcuts!",
  portal: "Use portal pairs to teleport across the grid, plus wall-passing for even more movement options!"
};

const Game: React.FC = () => {
  const [selectedMap, setSelectedMap] = useState<MapType>('classic');
  const [gameState, setGameState] = useState<GameState>(() => initGameState(selectedMap, GRID_SIZE));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.isGameOver) return;

    let newDirection: Direction = gameState.nextDirection;
    
    switch (e.key) {
      case 'ArrowUp':
        newDirection = 'UP';
        break;
      case 'ArrowDown':
        newDirection = 'DOWN';
        break;
      case 'ArrowLeft':
        newDirection = 'LEFT';
        break;
      case 'ArrowRight':
        newDirection = 'RIGHT';
        break;
      case ' ': // Space bar
        setIsRunning(prev => !prev);
        break;
      default:
        return;
    }
    
    setGameState(prev => ({
      ...prev,
      nextDirection: newDirection,
    }));
  }, [gameState.isGameOver, gameState.nextDirection]);

  // Setup key event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Game loop
  useEffect(() => {
    if (!isRunning || gameState.isGameOver) return;

    const gameLoop = setInterval(() => {
      setGameState(moveSnake);
    }, gameState.speed);

    return () => {
      clearInterval(gameLoop);
    };
  }, [isRunning, gameState.isGameOver, gameState.speed]);

  // Start new game
  const startNewGame = () => {
    setGameState(initGameState(selectedMap, GRID_SIZE));
    setIsRunning(true);
    setGameStarted(true);
  };
  
  // Reset game
  const resetGame = () => {
    setGameState(initGameState(selectedMap, GRID_SIZE));
    setIsRunning(false);
    setGameStarted(false);
  };
  
  // Change map
  const handleMapChange = (mapType: MapType) => {
    setSelectedMap(mapType);
    if (gameStarted) {
      setGameState(initGameState(mapType, GRID_SIZE));
      setIsRunning(false);
    }
  };

  // Pause/resume game
  const togglePause = () => {
    setIsRunning(prev => !prev);
  };

  // Handle direction button clicks for mobile users
  const handleDirectionClick = (direction: Direction) => {
    if (gameState.isGameOver) return;
    
    setGameState(prev => ({
      ...prev,
      nextDirection: direction,
    }));
  };
  
  // Toggle ghosts
  const toggleGhosts = () => {
    setGameState(prev => ({
      ...prev,
      ghostsActive: !prev.ghostsActive
    }));
  };

  return (
    <div className="game-container">
      {/* Game content - left side */}
      <div className="game-content">
        <h1>Snake Game</h1>
        
        {gameStarted && <div className="score">Score: {gameState.score}</div>}
        
        {gameStarted ? (
          <GameBoard 
            snake={gameState.snake}
            food={gameState.food}
            bonusFood={gameState.bonusFood}
            gridSize={GRID_SIZE}
            direction={gameState.direction}
            map={gameState.map}
            ghosts={gameState.ghosts}
            powerMode={gameState.powerMode}
          />
        ) : (
          <div className="map-preview-large" style={{
            width: `${GRID_SIZE * 20}px`,
            height: `${GRID_SIZE * 20}px`,
            backgroundImage: `linear-gradient(#f8f8f8 1px, transparent 1px),
                             linear-gradient(90deg, #f8f8f8 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            border: '3px solid #333',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
            <h2>Select a map and press Start</h2>
          </div>
        )}
        
        {gameStarted && (
          <>
            <div className="controls">
              <button onClick={gameState.isGameOver ? startNewGame : togglePause}>
                {gameState.isGameOver ? 'New Game' : (isRunning ? 'Pause' : 'Resume')}
              </button>
              <button onClick={resetGame}>
                Change Map
              </button>
              <button onClick={toggleGhosts}>
                {gameState.ghostsActive ? 'Disable Ghosts' : 'Enable Ghosts'}
              </button>
            </div>
            
            {/* Mobile controls */}
            <div className="controls">
              <button onClick={() => handleDirectionClick('UP')}>↑</button>
              <div>
                <button onClick={() => handleDirectionClick('LEFT')}>←</button>
                <button onClick={() => handleDirectionClick('RIGHT')}>→</button>
              </div>
              <button onClick={() => handleDirectionClick('DOWN')}>↓</button>
            </div>
          </>
        )}
        
        {gameState.isGameOver && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Your score: {gameState.score}</p>
            <button onClick={startNewGame}>Play Again</button>
            <button onClick={resetGame}>Change Map</button>
          </div>
        )}

        {gameStarted && (
          <div className="instructions">
            <p>Use arrow keys to move, space to pause/resume, or use on-screen controls.</p>
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-icon snake"></div>
                <span>Snake</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon food"></div>
                <span>Food</span>
              </div>
              {selectedMap !== 'classic' && (
                <>
                  <div className="legend-item">
                    <div className="legend-icon obstacle"></div>
                    <span>Obstacle</span>
                  </div>
                  {selectedMap === 'portal' && (
                    <>
                      <div className="legend-item">
                        <div className="legend-icon portal-entrance"></div>
                        <span>Portal In</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-icon portal-exit"></div>
                        <span>Portal Out</span>
                      </div>
                    </>
                  )}
                  {gameState.ghostsActive && (
                    <>
                      <div className="legend-item">
                        <div className="legend-icon ghost blinky"></div>
                        <span>Blinky (Chase)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-icon ghost pinky"></div>
                        <span>Pinky (Ambush)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-icon ghost inky"></div>
                        <span>Inky (Random)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-icon ghost frightened"></div>
                        <span>Frightened Ghost</span>
                      </div>
                    </>
                  )}
                  
                  <div className="legend-item">
                    <div className="legend-icon bonus-food"></div>
                    <span>Power Pellet</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Sidebar - right side */}
      <div className="game-sidebar">
        <div className="map-selection">
          <h3>Select Map</h3>
          
          {AVAILABLE_MAPS.map(mapType => (
            <div key={mapType} onClick={() => handleMapChange(mapType)}>
              <div className={`map-preview ${mapType} ${selectedMap === mapType ? 'active' : ''}`}>
                <div className="map-name">{mapType.charAt(0).toUpperCase() + mapType.slice(1)}</div>
              </div>
            </div>
          ))}
          
          <div className="map-description">
            {MAP_DESCRIPTIONS[selectedMap]}
          </div>
          
          {!gameStarted && (
            <button className="start-button" onClick={startNewGame}>
              Start Game
            </button>
          )}
        </div>
        
        {!gameStarted && (
          <div className="instructions">
            <p>
              <strong>How to Play:</strong><br />
              Use arrow keys to control the snake.<br />
              Collect food to grow longer.<br />
              Avoid obstacles, yourself, and ghosts!<br />
              Collect golden power pellets to eat ghosts for bonus points!<br />
              You can pass through walls to the opposite side!<br />
              Three ghosts will chase you, each with its own behavior.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;