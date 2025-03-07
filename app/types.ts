export type Point = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type MapType = 'classic' | 'obstacles' | 'maze' | 'portal';

export type Obstacle = Point;

export type Portal = {
  entrance: Point;
  exit: Point;
};

export type GameMap = {
  type: MapType;
  gridSize: number;
  obstacles: Obstacle[];
  portals: Portal[];
};

export type GhostType = 'blinky' | 'pinky' | 'inky';

export type GhostState = 'normal' | 'frightened' | 'eaten';

export type Ghost = {
  position: Point;
  type: GhostType;
  direction: Direction;
  speed: number; // Number of snake moves before ghost moves (lower = faster)
  moveCounter: number; // Counter to track when ghost should move
  state: GhostState; // Current state of the ghost
};

export type GameState = {
  snake: Point[];
  food: Point;
  bonusFood: Point | null; // Power pellet that appears occasionally
  direction: Direction;
  nextDirection: Direction;
  isGameOver: boolean;
  score: number;
  gridSize: number;
  speed: number;
  map: GameMap;
  ghosts: Ghost[];
  ghostsActive: boolean; // Flag to control if ghosts are active
  powerMode: boolean; // Whether snake can eat ghosts
  powerModeTimeLeft: number; // Countdown for power mode duration
  bonusFoodTimeLeft: number; // Countdown until bonus food disappears
  bonusFoodCounter: number; // Counter to track when to spawn bonus food
};