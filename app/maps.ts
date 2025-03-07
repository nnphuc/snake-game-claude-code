import { GameMap, MapType } from './types';

// Classic map - empty grid
export const classicMap = (gridSize: number): GameMap => ({
  type: 'classic',
  gridSize,
  obstacles: [],
  portals: [],
});

// Obstacles map - random obstacles
export const obstaclesMap = (gridSize: number): GameMap => {
  const obstacles = [];
  
  // Add some random obstacles (about 5% of the grid)
  const obstacleCount = Math.floor(gridSize * gridSize * 0.05);
  
  for (let i = 0; i < obstacleCount; i++) {
    // Keep obstacles away from the center to avoid blocking starting snake
    let x, y;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
    } while (
      // Avoid center area where snake starts
      (x >= gridSize / 2 - 3 && x <= gridSize / 2 + 3 && 
       y >= gridSize / 2 - 3 && y <= gridSize / 2 + 3)
    );
    
    obstacles.push({ x, y });
  }
  
  return {
    type: 'obstacles',
    gridSize,
    obstacles,
    portals: [],
  };
};

// Maze map - predefined maze pattern
export const mazeMap = (gridSize: number): GameMap => {
  const obstacles = [];
  const center = Math.floor(gridSize / 2);
  
  // We need to ensure there's enough space for the initial snake (3 segments)
  // Snake starts at the center facing right, so we need at least 3 spaces
  // for the initial snake plus some room to move
  
  // Create border obstacles
  for (let i = 0; i < gridSize; i++) {
    // Skip some positions to create openings in the border
    if (i !== Math.floor(gridSize / 4) && i !== Math.floor(3 * gridSize / 4)) {
      obstacles.push({ x: 0, y: i });                  // Left border
      obstacles.push({ x: gridSize - 1, y: i });       // Right border
    }
    
    if (i !== Math.floor(gridSize / 4) && i !== Math.floor(3 * gridSize / 4)) {
      obstacles.push({ x: i, y: 0 });                  // Top border
      obstacles.push({ x: i, y: gridSize - 1 });       // Bottom border
    }
  }
  
  // Add vertical dividers in quarters (but keep the center area clear)
  const quarterGridSize = Math.floor(gridSize / 4);
  for (let y = 3; y < gridSize - 3; y++) {
    // Skip the center row where the snake starts
    if (y !== center) {
      // Add vertical dividers at 1/4 and 3/4 width, but with gaps
      if (y % 3 !== 0) { // Create gaps every 3 units
        obstacles.push({ x: quarterGridSize, y });
        obstacles.push({ x: 3 * quarterGridSize, y });
      }
    }
  }
  
  // Add horizontal dividers, but keep center area clear for snake
  for (let x = 3; x < gridSize - 3; x++) {
    // Avoid placing obstacles in the snake's starting position
    // The snake starts at center with 3 segments going left
    if (x < center - 3 || x > center + 3) {
      // Add horizontal dividers at 1/4 and 3/4 height, but with gaps
      if (x % 4 !== 0) { // Create gaps every 4 units
        obstacles.push({ x, y: quarterGridSize });
        obstacles.push({ x, y: 3 * quarterGridSize });
      }
    }
  }
  
  return {
    type: 'maze',
    gridSize,
    obstacles,
    portals: [],
  };
};

// Portal map - has portals that teleport the snake
export const portalMap = (gridSize: number): GameMap => {
  // Create a few obstacles
  const obstacles = [];
  
  // Add some random obstacles (about 3% of the grid)
  const obstacleCount = Math.floor(gridSize * gridSize * 0.03);
  
  for (let i = 0; i < obstacleCount; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
    } while (
      // Avoid center area where snake starts
      (x >= gridSize / 2 - 3 && x <= gridSize / 2 + 3 && 
       y >= gridSize / 2 - 3 && y <= gridSize / 2 + 3)
    );
    
    obstacles.push({ x, y });
  }
  
  // Create portals
  const portals = [
    {
      entrance: { x: 2, y: 2 },
      exit: { x: gridSize - 3, y: gridSize - 3 }
    },
    {
      entrance: { x: 2, y: gridSize - 3 },
      exit: { x: gridSize - 3, y: 2 }
    }
  ];
  
  return {
    type: 'portal',
    gridSize,
    obstacles,
    portals,
  };
};

// Map selection function
export const getMap = (type: MapType, gridSize: number): GameMap => {
  switch (type) {
    case 'classic':
      return classicMap(gridSize);
    case 'obstacles':
      return obstaclesMap(gridSize);
    case 'maze':
      return mazeMap(gridSize);
    case 'portal':
      return portalMap(gridSize);
    default:
      return classicMap(gridSize);
  }
};