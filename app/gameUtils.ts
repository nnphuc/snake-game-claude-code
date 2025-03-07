import { Direction, Point, GameState, MapType, Portal, Ghost, GhostType } from './types';
import { getMap } from './maps';

// Check if two points are equal
export const arePointsEqual = (a: Point, b: Point): boolean => {
  return a.x === b.x && a.y === b.y;
};

// Check if a point is in an array
export const isPointInArray = (point: Point, array: Point[]): boolean => {
  return array.some(p => arePointsEqual(p, point));
};

// Find portal exit if the point is a portal entrance
export const findPortalExit = (point: Point, portals: Portal[]): Point | null => {
  for (const portal of portals) {
    if (arePointsEqual(point, portal.entrance)) {
      return portal.exit;
    }
  }
  return null;
};

// Generate a random food position
export const generateFood = (gameState: GameState): Point => {
  const { snake, gridSize, map } = gameState;
  let newFood: Point;
  
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (
    isPointInArray(newFood, snake) || 
    isPointInArray(newFood, map.obstacles) ||
    map.portals.some(portal => 
      arePointsEqual(newFood, portal.entrance) || 
      arePointsEqual(newFood, portal.exit)
    )
  );
  
  return newFood;
};

// Get the next head position based on current direction
export const getNextHead = (currentHead: Point, direction: Direction): Point => {
  const nextHead = { ...currentHead };
  
  switch (direction) {
    case 'UP':
      nextHead.y -= 1;
      break;
    case 'DOWN':
      nextHead.y += 1;
      break;
    case 'LEFT':
      nextHead.x -= 1;
      break;
    case 'RIGHT':
      nextHead.x += 1;
      break;
  }
  
  return nextHead;
};

// Check if the direction change is valid (can't immediately go in opposite direction)
export const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
  if (current === 'UP' && next === 'DOWN') return false;
  if (current === 'DOWN' && next === 'UP') return false;
  if (current === 'LEFT' && next === 'RIGHT') return false;
  if (current === 'RIGHT' && next === 'LEFT') return false;
  return true;
};

// Check if the game is over
// Generate a valid position for a ghost (not on snake, obstacles, food, or other ghosts)
export const generateGhostPosition = (
  gameState: GameState,
  existingGhosts: Ghost[]
): Point => {
  const { snake, food, map, gridSize } = gameState;
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  
  // Keep ghosts away from snake's starting position
  const minDistance = 5;
  
  let position: Point;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    // Try corners first, then random positions
    if (attempts < 4) {
      // Place in corners
      const cornerPositions = [
        { x: 1, y: 1 },                          // Top-left
        { x: gridSize - 2, y: 1 },               // Top-right
        { x: 1, y: gridSize - 2 },               // Bottom-left
        { x: gridSize - 2, y: gridSize - 2 }     // Bottom-right
      ];
      position = cornerPositions[attempts];
    } else {
      // Random position
      position = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    }
    
    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(
      Math.pow(position.x - centerX, 2) + 
      Math.pow(position.y - centerY, 2)
    );
    
    attempts++;
    
    // Ensure the ghost is not on snake, food, obstacle, or another ghost
    // and is a minimum distance from the snake's starting position
  } while (
    (isPointInArray(position, snake) ||
    arePointsEqual(position, food) ||
    isPointInArray(position, map.obstacles) ||
    existingGhosts.some(ghost => arePointsEqual(ghost.position, position)) ||
    map.portals.some(portal => 
      arePointsEqual(portal.entrance, position) || 
      arePointsEqual(portal.exit, position)
    )) && 
    attempts < maxAttempts
  );
  
  return position;
};

// Get a random direction
export const getRandomDirection = (): Direction => {
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  return directions[Math.floor(Math.random() * directions.length)];
};

// Generate ghosts
export const generateGhosts = (gameState: GameState): Ghost[] => {
  const ghostTypes: GhostType[] = ['blinky', 'pinky', 'inky'];
  const ghosts: Ghost[] = [];
  
  // Create each ghost
  for (let i = 0; i < ghostTypes.length; i++) {
    const position = generateGhostPosition(gameState, ghosts);
    
    ghosts.push({
      type: ghostTypes[i],
      position: position,
      direction: getRandomDirection(),
      speed: 3 + i, // Different speeds: blinky fastest, inky slowest
      moveCounter: 0,
      state: 'normal'
    });
  }
  
  return ghosts;
};

// Generate a bonus food (power pellet)
export const generateBonusFood = (gameState: GameState): Point | null => {
  const { snake, food, map, ghosts, gridSize } = gameState;
  
  // Only about 30% chance to generate bonus food
  if (Math.random() > 0.3) {
    return null;
  }
  
  let bonusFood: Point;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    bonusFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    
    attempts++;
    
    // Ensure the bonus food is not on snake, regular food, obstacle, ghost, or portal
  } while (
    (isPointInArray(bonusFood, snake) ||
    arePointsEqual(bonusFood, food) ||
    isPointInArray(bonusFood, map.obstacles) ||
    ghosts.some(ghost => arePointsEqual(ghost.position, bonusFood)) ||
    map.portals.some(portal => 
      arePointsEqual(portal.entrance, bonusFood) || 
      arePointsEqual(portal.exit, bonusFood)
    )) && 
    attempts < maxAttempts
  );
  
  return attempts < maxAttempts ? bonusFood : null;
};

// Calculate the next position for a ghost based on its AI behavior
export const getNextGhostPosition = (ghost: Ghost, snake: Point[], gridSize: number): Point => {
  const head = snake[0];
  const ghostPos = ghost.position;
  let nextPos: Point = { ...ghostPos };
  
  // Base ghost movement on its type
  switch (ghost.type) {
    case 'blinky': // Direct chaser - goes straight for the snake's head
      // Decide whether to move horizontally or vertically based on distance
      if (Math.abs(head.x - ghostPos.x) > Math.abs(head.y - ghostPos.y)) {
        // Move horizontally
        nextPos.x += head.x > ghostPos.x ? 1 : (head.x < ghostPos.x ? -1 : 0);
      } else {
        // Move vertically
        nextPos.y += head.y > ghostPos.y ? 1 : (head.y < ghostPos.y ? -1 : 0);
      }
      break;
      
    case 'pinky': // Ambusher - tries to get ahead of the snake
      // Predict where the snake is going based on its direction
      const targetPoint = { ...head };
      switch (snake.length > 1 ? getSnakeDirection(snake) : 'RIGHT') {
        case 'UP':
          targetPoint.y -= 4;
          break;
        case 'DOWN':
          targetPoint.y += 4;
          break;
        case 'LEFT':
          targetPoint.x -= 4;
          break;
        case 'RIGHT':
          targetPoint.x += 4;
          break;
      }
      
      // Move toward the target point
      if (Math.abs(targetPoint.x - ghostPos.x) > Math.abs(targetPoint.y - ghostPos.y)) {
        nextPos.x += targetPoint.x > ghostPos.x ? 1 : (targetPoint.x < ghostPos.x ? -1 : 0);
      } else {
        nextPos.y += targetPoint.y > ghostPos.y ? 1 : (targetPoint.y < ghostPos.y ? -1 : 0);
      }
      break;
      
    case 'inky': // Somewhat random - less predictable
      // 75% of time chase, 25% of time random
      if (Math.random() < 0.75) {
        // Chase but with some randomness
        if (Math.random() < 0.5) {
          nextPos.x += head.x > ghostPos.x ? 1 : (head.x < ghostPos.x ? -1 : 0);
        } else {
          nextPos.y += head.y > ghostPos.y ? 1 : (head.y < ghostPos.y ? -1 : 0);
        }
      } else {
        // Random move
        const randomDir = getRandomDirection();
        switch (randomDir) {
          case 'UP':
            nextPos.y -= 1;
            break;
          case 'DOWN':
            nextPos.y += 1;
            break;
          case 'LEFT':
            nextPos.x -= 1;
            break;
          case 'RIGHT':
            nextPos.x += 1;
            break;
        }
      }
      break;
  }
  
  // Handle wrapping around the grid
  if (nextPos.x < 0) nextPos.x = gridSize - 1;
  if (nextPos.x >= gridSize) nextPos.x = 0;
  if (nextPos.y < 0) nextPos.y = gridSize - 1;
  if (nextPos.y >= gridSize) nextPos.y = 0;
  
  return nextPos;
};

// Determine direction of snake movement
export const getSnakeDirection = (snake: Point[]): Direction => {
  if (snake.length < 2) return 'RIGHT'; // Default
  
  const head = snake[0];
  const neck = snake[1];
  
  if (head.x > neck.x) return 'RIGHT';
  if (head.x < neck.x) return 'LEFT';
  if (head.y > neck.y) return 'DOWN';
  if (head.y < neck.y) return 'UP';
  
  return 'RIGHT'; // Default fallback
};

// Generate a random position for a ghost to respawn
export const getGhostRespawnPosition = (gameState: GameState): Point => {
  const { gridSize } = gameState;
  
  // Respawn in a corner (randomly chosen)
  const corners = [
    { x: 1, y: 1 },                      // Top-left
    { x: gridSize - 2, y: 1 },           // Top-right
    { x: 1, y: gridSize - 2 },           // Bottom-left
    { x: gridSize - 2, y: gridSize - 2 } // Bottom-right
  ];
  
  return corners[Math.floor(Math.random() * corners.length)];
};

// Get nextPosition for a frightened ghost (run away from snake)
export const getFrightenedGhostNextPosition = (ghost: Ghost, snake: Point[], gridSize: number): Point => {
  const head = snake[0];
  const ghostPos = ghost.position;
  let nextPos: Point = { ...ghostPos };
  
  // Run away logic - move in the opposite direction of the snake
  // Decide based on horizontal vs vertical distance
  if (Math.abs(head.x - ghostPos.x) > Math.abs(head.y - ghostPos.y)) {
    // Move horizontally away
    nextPos.x += head.x > ghostPos.x ? -1 : 1;
  } else {
    // Move vertically away
    nextPos.y += head.y > ghostPos.y ? -1 : 1;
  }
  
  // 25% chance of random movement for more unpredictable behavior
  if (Math.random() < 0.25) {
    const randomDir = getRandomDirection();
    switch (randomDir) {
      case 'UP': nextPos.y -= 1; break;
      case 'DOWN': nextPos.y += 1; break;
      case 'LEFT': nextPos.x -= 1; break;
      case 'RIGHT': nextPos.x += 1; break;
    }
  }
  
  // Handle wrapping
  if (nextPos.x < 0) nextPos.x = gridSize - 1;
  if (nextPos.x >= gridSize) nextPos.x = 0;
  if (nextPos.y < 0) nextPos.y = gridSize - 1;
  if (nextPos.y >= gridSize) nextPos.y = 0;
  
  return nextPos;
};

// Move ghosts
export const moveGhosts = (gameState: GameState): Ghost[] => {
  const { ghosts, snake, map, gridSize, powerMode } = gameState;
  
  if (!gameState.ghostsActive) {
    return ghosts;
  }
  
  return ghosts.map(ghost => {
    // If ghost was eaten, don't move it
    if (ghost.state === 'eaten') {
      return ghost;
    }
    
    ghost.moveCounter += 1;
    
    // Only move the ghost when its counter reaches its speed
    // Frightened ghosts move slower
    const effectiveSpeed = ghost.state === 'frightened' ? ghost.speed * 1.5 : ghost.speed;
    
    if (ghost.moveCounter >= effectiveSpeed) {
      // Determine next position based on ghost state
      let nextPosition: Point;
      
      if (ghost.state === 'frightened') {
        nextPosition = getFrightenedGhostNextPosition(ghost, snake, gridSize);
      } else {
        nextPosition = getNextGhostPosition(ghost, snake, gridSize);
      }
      
      // Check if the next position is valid (not an obstacle or portal)
      const isValidPosition = !isPointInArray(nextPosition, map.obstacles) && 
                              !map.portals.some(portal => 
                                arePointsEqual(portal.entrance, nextPosition) || 
                                arePointsEqual(portal.exit, nextPosition)
                              );
      
      if (isValidPosition) {
        // Update ghost position
        ghost.position = nextPosition;
      } else {
        // If invalid, try a random direction
        ghost.direction = getRandomDirection();
      }
      
      // Reset counter
      ghost.moveCounter = 0;
    }
    
    // Update ghost state if power mode changes
    if (powerMode && ghost.state === 'normal') {
      ghost.state = 'frightened';
    } else if (!powerMode && ghost.state === 'frightened') {
      ghost.state = 'normal';
    }
    
    return ghost;
  });
};

export const checkGameOver = (
  head: Point,
  snake: Point[],
  gameState: GameState
): boolean => {
  const { gridSize, map, ghosts, ghostsActive, powerMode } = gameState;
  
  // We'll handle wall collisions in moveSnake with wrapping
  // No need to check for wall collisions here
  
  // Check if snake hit itself (excluding the head)
  for (let i = 1; i < snake.length; i++) {
    if (arePointsEqual(head, snake[i])) {
      return true;
    }
  }
  
  // Check if snake hit an obstacle
  if (isPointInArray(head, map.obstacles)) {
    return true;
  }
  
  // In power mode, snake can eat ghosts
  // When not in power mode, hitting a ghost is game over
  if (ghostsActive && !powerMode) {
    const hitNormalGhost = ghosts.some(ghost => 
      ghost.state === 'normal' && arePointsEqual(head, ghost.position)
    );
    
    if (hitNormalGhost) {
      return true;
    }
  }
  
  return false;
};

// Move the snake one step
export const moveSnake = (gameState: GameState): GameState => {
  const { 
    snake, food, bonusFood, direction, nextDirection, 
    gridSize, score, speed, map, ghosts, ghostsActive,
    powerMode, powerModeTimeLeft, bonusFoodTimeLeft,
    bonusFoodCounter, stats
  } = gameState;
  
  // If game is over, don't do anything
  if (gameState.isGameOver) {
    return gameState;
  }
  
  // Use nextDirection if it's valid, otherwise keep current direction
  const newDirection = isValidDirectionChange(direction, nextDirection)
    ? nextDirection
    : direction;
  
  const currentHead = snake[0];
  let nextHead = getNextHead(currentHead, newDirection);
  
  // Implement wrapping around the grid (snake passes through walls)
  if (nextHead.x < 0) {
    nextHead.x = gridSize - 1; // Wrap to right edge
  } else if (nextHead.x >= gridSize) {
    nextHead.x = 0; // Wrap to left edge
  }
  
  if (nextHead.y < 0) {
    nextHead.y = gridSize - 1; // Wrap to bottom edge
  } else if (nextHead.y >= gridSize) {
    nextHead.y = 0; // Wrap to top edge
  }
  
  // Handle portal teleportation
  const portalExit = findPortalExit(nextHead, map.portals);
  if (portalExit) {
    nextHead = { ...portalExit };
  }
  
  // Update power mode timer
  let newPowerMode = powerMode;
  let newPowerModeTimeLeft = powerModeTimeLeft;
  
  if (powerMode) {
    newPowerModeTimeLeft = powerModeTimeLeft - 1;
    if (newPowerModeTimeLeft <= 0) {
      newPowerMode = false;
      newPowerModeTimeLeft = 0;
    }
  }
  
  // Update bonus food timer
  let newBonusFood = bonusFood;
  let newBonusFoodTimeLeft = bonusFoodTimeLeft;
  
  if (bonusFood) {
    newBonusFoodTimeLeft = bonusFoodTimeLeft - 1;
    if (newBonusFoodTimeLeft <= 0) {
      newBonusFood = null;
      newBonusFoodTimeLeft = 0;
    }
  }
  
  // Update bonus food spawn counter
  let newBonusFoodCounter = bonusFoodCounter + 1;
  
  // Try to spawn a new bonus food if none exists and counter reached threshold
  if (!newBonusFood && newBonusFoodCounter >= 50) { // Spawn roughly every 50 moves
    newBonusFood = generateBonusFood({
      ...gameState,
      snake: [nextHead, ...snake],
    });
    
    if (newBonusFood) {
      newBonusFoodTimeLeft = 30; // Bonus food lasts for 30 moves
      newBonusFoodCounter = 0;
    }
  }
  
  // Move ghosts
  let newGhosts = ghostsActive ? moveGhosts({
    ...gameState,
    snake: [nextHead, ...snake],
    powerMode: newPowerMode
  }) : ghosts;
  
  // Check if snake ate a ghost (in power mode)
  let ghostEaten = false;
  let ghostBonus = 0;
  
  if (ghostsActive && newPowerMode) {
    newGhosts = newGhosts.map(ghost => {
      if (ghost.state === 'frightened' && arePointsEqual(nextHead, ghost.position)) {
        // Snake ate a ghost!
        ghostEaten = true;
        ghostBonus += 50; // Bonus points for eating a ghost
        
        // Mark ghost as eaten and move it away
        return {
          ...ghost,
          state: 'eaten',
          position: getGhostRespawnPosition(gameState)
        };
      }
      return ghost;
    });
  }
  
  // Check if game over - after ghost movement
  const updatedGameState = {
    ...gameState,
    ghosts: newGhosts,
    powerMode: newPowerMode
  };
  
  if (checkGameOver(nextHead, snake, updatedGameState)) {
    return {
      ...updatedGameState,
      isGameOver: true,
    };
  }
  
  // Create new snake array
  const newSnake = [nextHead, ...snake];
  
  // Update statistics
  const newStats = {
    ...stats,
    movesMade: stats.movesMade + 1,
    maxLength: Math.max(stats.maxLength, newSnake.length)
  };
  
  // Check if snake ate regular food
  let newFood = food;
  let newScore = score + ghostBonus; // Add any ghost bonus points
  let newSpeed = speed;
  
  if (arePointsEqual(nextHead, food)) {
    // Snake ate food, generate new food and increase score
    newFood = generateFood({
      ...gameState,
      snake: newSnake,
      ghosts: newGhosts,
    });
    newScore += 10; // Regular food is 10 points
    // Increase speed slightly with each food eaten
    newSpeed = Math.max(50, speed - 5);
    // Update apples eaten stat
    newStats.applesEaten = stats.applesEaten + 1;
  } 
  // Check if snake ate bonus food
  else if (newBonusFood && arePointsEqual(nextHead, newBonusFood)) {
    // Snake ate bonus food!
    newScore += 30; // Bonus food is 30 points
    newPowerMode = true;
    newPowerModeTimeLeft = 20; // Power mode lasts for 20 moves
    newBonusFood = null;
    
    // Update ghost states to frightened
    newGhosts = newGhosts.map(ghost => ({
      ...ghost,
      state: ghost.state === 'eaten' ? 'eaten' : 'frightened'
    }));
  } 
  // If snake didn't eat anything, remove tail
  else if (!ghostEaten) {
    newSnake.pop();
  }
  
  // If a ghost was eaten, don't remove the tail (snake grows by 1)
  
  return {
    ...gameState,
    snake: newSnake,
    food: newFood,
    bonusFood: newBonusFood,
    direction: newDirection,
    nextDirection: newDirection,
    score: newScore,
    speed: newSpeed,
    ghosts: newGhosts,
    powerMode: newPowerMode,
    powerModeTimeLeft: newPowerModeTimeLeft,
    bonusFoodTimeLeft: newBonusFoodTimeLeft,
    bonusFoodCounter: newBonusFoodCounter,
    stats: newStats,
  };
};

// Initialize a new game state
export const initGameState = (mapType: MapType, gridSize: number): GameState => {
  // Get the map
  const map = getMap(mapType, gridSize);
  
  // Start with snake in the middle, moving right
  const startX = Math.floor(gridSize / 2);
  const startY = Math.floor(gridSize / 2);
  
  const initialSnake: Point[] = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
  
  const gameState: GameState = {
    snake: initialSnake,
    food: { x: 0, y: 0 }, // Temporary, will be updated below
    bonusFood: null, // No bonus food initially
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    isGameOver: false,
    score: 0,
    gridSize,
    speed: 200, // Initial speed in ms (lower is faster)
    map,
    ghosts: [], // Temporary, will be updated below
    ghostsActive: true, // Enable ghosts by default
    powerMode: false, // Start without power mode
    powerModeTimeLeft: 0, 
    bonusFoodTimeLeft: 0,
    bonusFoodCounter: 20, // Start counting from 20 to get bonus food quicker
    stats: {
      movesMade: 0,
      applesEaten: 0,
      maxLength: initialSnake.length
    }
  };
  
  // Generate initial food position
  gameState.food = generateFood(gameState);
  
  // Generate ghosts
  gameState.ghosts = generateGhosts(gameState);
  
  return gameState;
};