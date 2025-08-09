interface Position {
  x: number;
  y: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Position;
  private obstacles: Obstacle[];
  private gameSpeed: number;
  private distance: number;
  private isGameOver: boolean;
  private keys: { [key: string]: boolean };
  private highScore: number;
  
  // Game constants
  private readonly PLAYER_SIZE = 20;
  private readonly PLAYER_SPEED = 5;
  private readonly INITIAL_GAME_SPEED = 2;
  private readonly OBSTACLE_GAP = 150;
  private readonly MIN_OBSTACLE_GAP = 100;
  
  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.player = { x: this.canvas.width / 2, y: this.canvas.height - 50 };
    this.obstacles = [];
    this.gameSpeed = this.INITIAL_GAME_SPEED;
    this.distance = 0;
    this.isGameOver = false;
    this.keys = {};
    this.highScore = parseInt(localStorage.getItem('fastfall-highscore') || '0');
    
    this.setupEventListeners();
    this.generateInitialObstacles();
    this.gameLoop();
    this.updateUI();
  }
  
  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Restart game on space when game over
      if (e.key === ' ' && this.isGameOver) {
        this.restart();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  private generateInitialObstacles(): void {
    // Generate a static, deterministic level
    // Using a simple pattern that gets more complex over time
    for (let i = 0; i < 1000; i++) {
      const y = -i * this.OBSTACLE_GAP;
      
      // Create different patterns based on distance
      const complexity = Math.floor(i / 20); // Increase complexity every 20 obstacles
      
      if (complexity === 0) {
        // Simple single obstacles
        this.obstacles.push({
          x: (i % 3) * 250 + 100,
          y: y,
          width: 100,
          height: 30
        });
      } else if (complexity === 1) {
        // Two obstacles with gap
        this.obstacles.push({
          x: 50,
          y: y,
          width: 150,
          height: 30
        });
        this.obstacles.push({
          x: 600,
          y: y,
          width: 150,
          height: 30
        });
      } else {
        // More complex patterns
        const pattern = i % 4;
        switch (pattern) {
          case 0:
            // Three small obstacles
            for (let j = 0; j < 3; j++) {
              this.obstacles.push({
                x: j * 200 + 100 + (i % 2) * 50,
                y: y,
                width: 80,
                height: 30
              });
            }
            break;
          case 1:
            // Walls with narrow gaps
            this.obstacles.push({
              x: 0,
              y: y,
              width: 200,
              height: 30
            });
            this.obstacles.push({
              x: 350,
              y: y,
              width: 200,
              height: 30
            });
            this.obstacles.push({
              x: 600,
              y: y,
              width: 200,
              height: 30
            });
            break;
          default:
            // Random placement but deterministic
            const seed = i * 31 % 100;
            this.obstacles.push({
              x: (seed % 5) * 140 + 50,
              y: y,
              width: 120,
              height: 30
            });
        }
      }
    }
  }
  
  private updatePlayer(): void {
    if (this.isGameOver) return;
    
    // Handle WASD movement
    if (this.keys['a'] && this.player.x > 0) {
      this.player.x -= this.PLAYER_SPEED;
    }
    if (this.keys['d'] && this.player.x < this.canvas.width - this.PLAYER_SIZE) {
      this.player.x += this.PLAYER_SPEED;
    }
    if (this.keys['w'] && this.player.y > 0) {
      this.player.y -= this.PLAYER_SPEED;
    }
    if (this.keys['s'] && this.player.y < this.canvas.height - this.PLAYER_SIZE) {
      this.player.y += this.PLAYER_SPEED;
    }
  }
  
  private updateObstacles(): void {
    if (this.isGameOver) return;
    
    // Move obstacles down (creating falling effect)
    this.obstacles.forEach(obstacle => {
      obstacle.y += this.gameSpeed;
    });
    
    // Remove obstacles that are off screen
    this.obstacles = this.obstacles.filter(obstacle => 
      obstacle.y < this.canvas.height + 100
    );
    
    // Update distance and speed
    this.distance += this.gameSpeed;
    this.gameSpeed = this.INITIAL_GAME_SPEED + Math.floor(this.distance / 1000) * 0.5;
  }
  
  private checkCollisions(): void {
    if (this.isGameOver) return;
    
    for (const obstacle of this.obstacles) {
      if (this.player.x < obstacle.x + obstacle.width &&
          this.player.x + this.PLAYER_SIZE > obstacle.x &&
          this.player.y < obstacle.y + obstacle.height &&
          this.player.y + this.PLAYER_SIZE > obstacle.y) {
        this.gameOver();
        break;
      }
    }
  }
  
  private gameOver(): void {
    this.isGameOver = true;
    
    // Update high score
    if (this.distance > this.highScore) {
      this.highScore = this.distance;
      localStorage.setItem('fastfall-highscore', this.highScore.toString());
    }
    
    // Show game over screen
    const gameOverDiv = document.getElementById('gameOver')!;
    const finalDistance = document.getElementById('finalDistance')!;
    const finalHighScore = document.getElementById('finalHighScore')!;
    
    finalDistance.textContent = Math.floor(this.distance).toString();
    finalHighScore.textContent = Math.floor(this.highScore).toString();
    gameOverDiv.style.display = 'block';
  }
  
  private restart(): void {
    this.player = { x: this.canvas.width / 2, y: this.canvas.height - 50 };
    this.gameSpeed = this.INITIAL_GAME_SPEED;
    this.distance = 0;
    this.isGameOver = false;
    this.keys = {};
    
    // Reset obstacles to initial state
    this.obstacles = [];
    this.generateInitialObstacles();
    
    // Hide game over screen
    document.getElementById('gameOver')!.style.display = 'none';
    
    this.updateUI();
  }
  
  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw obstacles
    this.ctx.fillStyle = '#ff4444';
    this.obstacles.forEach(obstacle => {
      if (obstacle.y > -obstacle.height && obstacle.y < this.canvas.height) {
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    });
    
    // Draw player
    this.ctx.fillStyle = '#44ff44';
    this.ctx.fillRect(this.player.x, this.player.y, this.PLAYER_SIZE, this.PLAYER_SIZE);
  }
  
  private updateUI(): void {
    document.getElementById('distance')!.textContent = Math.floor(this.distance).toString();
    document.getElementById('highScore')!.textContent = Math.floor(this.highScore).toString();
  }
  
  private gameLoop(): void {
    this.updatePlayer();
    this.updateObstacles();
    this.checkCollisions();
    this.render();
    this.updateUI();
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Game('gameCanvas');
});
