import React from 'react';
import { Point, Direction, GameMap, Ghost } from '../types';
import { isPointInArray, arePointsEqual } from '../gameUtils';

interface GameBoardProps {
  snake: Point[];
  food: Point;
  bonusFood: Point | null;
  gridSize: number;
  direction: Direction;
  map: GameMap;
  ghosts: Ghost[];
  powerMode: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, bonusFood, gridSize, direction, map, ghosts, powerMode }) => {
  // Get the segment type for a snake part
  const getSegmentType = (point: Point, index: number) => {
    if (index === 0) return 'head';
    
    // For body segments, determine the direction based on adjacent segments
    const prev = snake[index - 1]; // segment ahead of current
    const next = snake[index + 1]; // segment behind current (if exists)
    
    // Determine direction from current to previous segment
    let dirToPrev = '';
    if (prev.x < point.x) dirToPrev = 'left';
    else if (prev.x > point.x) dirToPrev = 'right';
    else if (prev.y < point.y) dirToPrev = 'up';
    else if (prev.y > point.y) dirToPrev = 'down';
    
    // If it's the tail
    if (!next) return `tail-${dirToPrev}`;
    
    // Determine direction from current to next segment
    let dirToNext = '';
    if (next.x < point.x) dirToNext = 'left';
    else if (next.x > point.x) dirToNext = 'right';
    else if (next.y < point.y) dirToNext = 'up';
    else if (next.y > point.y) dirToNext = 'down';
    
    // Return body segment type based on the directions
    // This helps determine if it's a straight segment or a turn
    if (
      (dirToPrev === 'left' && dirToNext === 'right') ||
      (dirToPrev === 'right' && dirToNext === 'left') ||
      (dirToPrev === 'up' && dirToNext === 'down') ||
      (dirToPrev === 'down' && dirToNext === 'up')
    ) {
      return 'body-straight';
    } else {
      return `body-turn-${dirToPrev}-${dirToNext}`;
    }
  };

  // Create a grid of cells
  const renderGrid = () => {
    const grid = [];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const currentPoint = { x, y };
        const snakeIndex = snake.findIndex(part => arePointsEqual(part, currentPoint));
        const isSnake = snakeIndex !== -1;
        const isHead = snakeIndex === 0;
        const isFood = arePointsEqual(currentPoint, food);
        const isBonusFood = bonusFood ? arePointsEqual(currentPoint, bonusFood) : false;
        const isObstacle = isPointInArray(currentPoint, map.obstacles);
        
        // Check if point is a portal
        const isPortalEntrance = map.portals.some(portal => 
          arePointsEqual(portal.entrance, currentPoint)
        );
        const isPortalExit = map.portals.some(portal => 
          arePointsEqual(portal.exit, currentPoint)
        );
        
        // Check if point is a ghost
        const ghost = ghosts.find(g => arePointsEqual(g.position, currentPoint));
        
        let className = 'cell';
        
        // Add appropriate classes based on cell content
        if (isSnake) {
          className += ' snake';
          if (isHead) {
            className += ' head';
            className += ` head-${direction.toLowerCase()}`;
          } else {
            // Add extra classes for body parts
            const segmentType = getSegmentType(currentPoint, snakeIndex);
            className += ` ${segmentType}`;
          }
        } else if (ghost) {
          // Ghost takes precedence over other elements
          className += ` ghost ${ghost.type}`;
          
          // Add frightened state if ghost is frightened
          if (ghost.state === 'frightened') {
            className += ' frightened';
          }
        } else if (isBonusFood) {
          className += ' bonus-food';
        } else if (isFood) {
          className += ' food';
        } else if (isObstacle) {
          className += ' obstacle';
        } else if (isPortalEntrance) {
          className += ' portal-entrance';
        } else if (isPortalExit) {
          className += ' portal-exit';
        }
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={className}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
          />
        );
      }
    }
    
    return grid;
  };
  
  return (
    <div 
      className="game-board"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 20px)`,
        gridTemplateRows: `repeat(${gridSize}, 20px)`,
      }}
    >
      {renderGrid()}
    </div>
  );
};

export default GameBoard;