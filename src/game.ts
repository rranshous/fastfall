interface Position {
  x: number;
  y: number;
  z: number; // Add depth for 3D-like effect
}

interface Platform {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  type: 'solid' | 'ring' | 'maze' | 'moving';
  rotation: number;
  color: string;
  movePattern?: {
    type: 'horizontal' | 'vertical' | 'circular';
    speed: number;
    amplitude: number;
    phase: number;
  };
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

class FastFallGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Position;
  private platforms: Platform[];
  private particles: Particle[];
  private gameSpeed: number;
  private altitude: number; // Start at 10,000 feet
  private isGameOver: boolean;
  private gameStarted: boolean;
  private keys: { [key: string]: boolean };
  private highScore: number;
  private wind: { x: number; strength: number };
  private camera: { shake: number; tilt: number };
  private frameCount: number;
  
  // Game constants
  private readonly PLAYER_SIZE = 15;
  private readonly PLAYER_SPEED = 8;
  private readonly INITIAL_GAME_SPEED = 3;
  private readonly MAX_GAME_SPEED = 15;
  private readonly PLATFORM_SPACING = 200;
  private readonly FOV = 500; // Field of view for 3D projection
  private readonly WIND_CHANGE_RATE = 0.002;
  
  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Make canvas full screen
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Player position in 3D space (screen center for POV)
    this.player = { 
      x: 0, // Relative to screen center
      y: 0, 
      z: 0  // Z is our falling distance
    };
    
    this.platforms = [];
    this.particles = [];
    this.gameSpeed = this.INITIAL_GAME_SPEED;
    this.altitude = 10000; // Start at 10,000 feet
    this.isGameOver = false;
    this.gameStarted = false;
    this.keys = {};
    this.highScore = parseInt(localStorage.getItem('fastfall-highscore') || '0');
    this.wind = { x: 0, strength: 5 };
    this.camera = { shake: 0, tilt: 0 };
    this.frameCount = 0;
    
    this.setupEventListeners();
    this.generatePlatforms();
    this.gameLoop();
    this.updateUI();
  }
  
  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  private setupEventListeners(): void {
    // Add click to focus
    document.addEventListener('click', () => {
      if (document.body) {
        document.body.focus();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Start game or restart on space
      if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll
        if (!this.gameStarted) {
          this.startGame();
        } else if (this.isGameOver) {
          this.restart();
        }
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  private startGame(): void {
    this.gameStarted = true;
    document.getElementById('intro')!.style.display = 'none';
  }
  
  private generatePlatforms(): void {
    // Generate platforms in 3D space that player must navigate around
    this.platforms = [];
    
    for (let i = 0; i < 500; i++) {
      const z = i * this.PLATFORM_SPACING + 300; // Distance ahead of player
      const complexity = Math.floor(i / 10) + 1; // Increase complexity over time
      
      // Different platform types based on distance fallen
      if (i < 5) {
        // Easy start - simple single platforms
        this.platforms.push(this.createPlatform(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 300,
          z,
          150 + Math.random() * 100,
          20 + Math.random() * 10,
          30,
          'solid',
          '#ff6b6b'
        ));
      } else if (i < 15) {
        // Ring platforms to fly through
        this.platforms.push(this.createRingPlatform(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200,
          z,
          200 + Math.random() * 100,
          30,
          '#4ecdc4'
        ));
      } else if (i < 30) {
        // Moving platforms
        this.platforms.push(this.createMovingPlatform(
          0, 0, z,
          120 + Math.random() * 80,
          15 + Math.random() * 10,
          25,
          '#45b7d1'
        ));
      } else {
        // Complex maze-like structures
        const mazeSize = 3 + Math.floor(complexity / 5);
        this.createMazePlatforms(z, mazeSize);
      }
    }
  }
  
  private createPlatform(x: number, y: number, z: number, width: number, height: number, depth: number, type: Platform['type'], color: string): Platform {
    return {
      x, y, z, width, height, depth, type, color,
      rotation: 0
    };
  }
  
  private createRingPlatform(x: number, y: number, z: number, radius: number, thickness: number, color: string): Platform {
    return {
      x, y, z,
      width: radius * 2,
      height: radius * 2,
      depth: thickness,
      type: 'ring',
      color,
      rotation: 0
    };
  }
  
  private createMovingPlatform(x: number, y: number, z: number, width: number, height: number, depth: number, color: string): Platform {
    return {
      x, y, z, width, height, depth,
      type: 'moving',
      color,
      rotation: 0,
      movePattern: {
        type: Math.random() > 0.5 ? 'horizontal' : 'circular',
        speed: 0.02 + Math.random() * 0.03,
        amplitude: 100 + Math.random() * 200,
        phase: Math.random() * Math.PI * 2
      }
    };
  }
  
  private createMazePlatforms(z: number, gridSize: number): void {
    const cellSize = 120;
    const wallThickness = 20;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Skip center for player path
        if (i === Math.floor(gridSize / 2) && j === Math.floor(gridSize / 2)) continue;
        
        // Random maze generation - create some walls
        if (Math.random() > 0.3) {
          this.platforms.push(this.createPlatform(
            (i - gridSize / 2) * cellSize,
            (j - gridSize / 2) * cellSize,
            z,
            cellSize - 10,
            wallThickness,
            cellSize - 10,
            'maze',
            '#ff9f43'
          ));
        }
      }
    }
  }
  
  private updatePlayer(): void {
    if (this.isGameOver || !this.gameStarted) return;
    
    // Handle WASD movement in 3D space
    const moveSpeed = this.PLAYER_SPEED;
    
    // A/D for horizontal steering (left/right)
    if (this.keys['a']) {
      this.player.x -= moveSpeed;
    }
    if (this.keys['d']) {
      this.player.x += moveSpeed;
    }
    
    // W/S for vertical steering (up/down)
    if (this.keys['w']) {
      this.player.y -= moveSpeed * 0.7; // Slightly slower vertical movement
    }
    if (this.keys['s']) {
      this.player.y += moveSpeed * 0.7;
    }
    
    // Apply wind effect
    this.player.x += this.wind.x * this.wind.strength * 0.1;
    
    // Limit player movement to reasonable bounds
    const maxOffset = 300;
    this.player.x = Math.max(-maxOffset, Math.min(maxOffset, this.player.x));
    this.player.y = Math.max(-maxOffset, Math.min(maxOffset, this.player.y));
    
    // Update camera shake based on speed
    this.camera.shake = this.gameSpeed * 0.5;
    this.camera.tilt = this.player.x * 0.001; // Tilt based on horizontal movement
  }
  
  private updatePlatforms(): void {
    if (this.isGameOver || !this.gameStarted) return;
    
    // Move platforms toward player (simulating falling)
    this.platforms.forEach(platform => {
      platform.z -= this.gameSpeed;
      
      // Update moving platforms
      if (platform.type === 'moving' && platform.movePattern) {
        const pattern = platform.movePattern;
        const time = this.frameCount * pattern.speed + pattern.phase;
        
        switch (pattern.type) {
          case 'horizontal':
            platform.x += Math.sin(time) * pattern.amplitude * 0.01;
            break;
          case 'vertical':
            platform.y += Math.sin(time) * pattern.amplitude * 0.01;
            break;
          case 'circular':
            platform.x += Math.sin(time) * pattern.amplitude * 0.01;
            platform.y += Math.cos(time) * pattern.amplitude * 0.01;
            break;
        }
      }
      
      // Rotate some platforms for visual effect
      if (platform.type !== 'solid') {
        platform.rotation += 0.01;
      }
    });
    
    // Remove platforms that have passed behind the player
    this.platforms = this.platforms.filter(platform => platform.z > -200);
    
    // Update game state
    this.altitude -= this.gameSpeed * 10; // Each unit of speed = 10 feet
    this.gameSpeed = Math.min(this.MAX_GAME_SPEED, this.INITIAL_GAME_SPEED + Math.floor((10000 - this.altitude) / 1000));
    
    // Update wind
    this.wind.x += (Math.random() - 0.5) * this.WIND_CHANGE_RATE;
    this.wind.x = Math.max(-1, Math.min(1, this.wind.x));
    this.wind.strength = 3 + Math.sin(this.frameCount * 0.01) * 2;
  }
  
  private updateParticles(): void {
    // Add wind/speed particles
    if (this.gameStarted && !this.isGameOver && Math.random() < 0.3) {
      this.particles.push({
        x: (Math.random() - 0.5) * this.canvas.width,
        y: (Math.random() - 0.5) * this.canvas.height,
        z: 1000 + Math.random() * 500,
        vx: this.wind.x * 2,
        vy: 0,
        vz: -this.gameSpeed * 2,
        life: 60,
        maxLife: 60,
        size: 1 + Math.random() * 3,
        color: '#ffffff'
      });
    }
    
    // Update existing particles
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;
      particle.life--;
    });
    
    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.life > 0 && particle.z > -100);
  }
  
  private checkCollisions(): void {
    if (this.isGameOver || !this.gameStarted) return;
    
    for (const platform of this.platforms) {
      // Only check platforms that are close to the player
      if (platform.z > -50 && platform.z < 50) {
        const distanceX = Math.abs(this.player.x - platform.x);
        const distanceY = Math.abs(this.player.y - platform.y);
        
        if (platform.type === 'ring') {
          // Ring collision - check if player is outside the ring
          const radius = platform.width / 2;
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          if (distance > radius - 30 && distance < radius + 30) {
            // Player is in the ring wall - collision!
            this.gameOver();
            return;
          }
        } else {
          // Solid platform collision
          if (distanceX < platform.width / 2 + this.PLAYER_SIZE &&
              distanceY < platform.height / 2 + this.PLAYER_SIZE) {
            this.gameOver();
            return;
          }
        }
      }
    }
  }
  
  private gameOver(): void {
    this.isGameOver = true;
    
    // Calculate final distance
    const distanceFallen = 10000 - this.altitude;
    
    // Update high score
    if (distanceFallen > this.highScore) {
      this.highScore = distanceFallen;
      localStorage.setItem('fastfall-highscore', this.highScore.toString());
    }
    
    // Show game over screen
    const gameOverDiv = document.getElementById('gameOver')!;
    const finalDistance = document.getElementById('finalDistance')!;
    const finalHighScore = document.getElementById('finalHighScore')!;
    
    finalDistance.textContent = Math.floor(distanceFallen).toString();
    finalHighScore.textContent = Math.floor(this.highScore).toString();
    gameOverDiv.style.display = 'block';
  }
  
  private restart(): void {
    // Reset player to center
    this.player = { x: 0, y: 0, z: 0 };
    this.gameSpeed = this.INITIAL_GAME_SPEED;
    this.altitude = 10000;
    this.isGameOver = false;
    this.gameStarted = true;
    this.keys = {};
    this.wind = { x: 0, strength: 5 };
    this.camera = { shake: 0, tilt: 0 };
    this.frameCount = 0;
    
    // Reset platforms
    this.platforms = [];
    this.particles = [];
    this.generatePlatforms();
    
    // Hide game over screen
    document.getElementById('gameOver')!.style.display = 'none';
    
    this.updateUI();
  }
  
  private project3D(x: number, y: number, z: number): { x: number; y: number; scale: number } {
    // Simple 3D to 2D projection
    const scale = this.FOV / (this.FOV + z);
    return {
      x: this.canvas.width / 2 + (x + this.camera.shake * (Math.random() - 0.5)) * scale,
      y: this.canvas.height / 2 + (y + this.camera.shake * (Math.random() - 0.5)) * scale,
      scale
    };
  }
  
  private render(): void {
    // Clear canvas with sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    const altitudeRatio = Math.max(0, this.altitude / 10000);
    
    // Color changes as you fall
    if (altitudeRatio > 0.7) {
      gradient.addColorStop(0, '#87CEEB'); // Sky blue
      gradient.addColorStop(1, '#4682B4'); // Steel blue
    } else if (altitudeRatio > 0.3) {
      gradient.addColorStop(0, '#4682B4'); // Steel blue
      gradient.addColorStop(1, '#2F4F4F'); // Dark slate gray
    } else {
      gradient.addColorStop(0, '#2F4F4F'); // Dark slate gray
      gradient.addColorStop(1, '#000000'); // Black
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply camera tilt
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(this.camera.tilt);
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    
    // Draw particles (wind/speed effects)
    this.drawParticles();
    
    // Draw platforms in distance order (far to near)
    const sortedPlatforms = [...this.platforms].sort((a, b) => b.z - a.z);
    
    for (const platform of sortedPlatforms) {
      if (platform.z > -100 && platform.z < 2000) {
        this.drawPlatform(platform);
      }
    }
    
    this.ctx.restore();
    
    // Draw crosshair (player indicator) - always in center
    this.drawCrosshair();
  }
  
  private drawPlatform(platform: Platform): void {
    const projected = this.project3D(platform.x, platform.y, platform.z);
    
    if (projected.scale <= 0) return; // Behind camera
    
    this.ctx.save();
    this.ctx.translate(projected.x, projected.y);
    this.ctx.scale(projected.scale, projected.scale);
    
    // Apply rotation
    if (platform.rotation !== 0) {
      this.ctx.rotate(platform.rotation);
    }
    
    // Set style based on distance
    const alpha = Math.min(1, Math.max(0.1, projected.scale));
    this.ctx.fillStyle = platform.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    this.ctx.strokeStyle = '#ffffff' + Math.floor(alpha * 128).toString(16).padStart(2, '0');
    this.ctx.lineWidth = 2;
    
    if (platform.type === 'ring') {
      // Draw ring
      const radius = platform.width / 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
      this.ctx.arc(0, 0, radius - platform.depth, 0, Math.PI * 2, true);
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      // Draw solid rectangle
      this.ctx.fillRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height);
      this.ctx.strokeRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height);
    }
    
    this.ctx.restore();
  }
  
  private drawParticles(): void {
    this.ctx.save();
    
    for (const particle of this.particles) {
      const projected = this.project3D(particle.x, particle.y, particle.z);
      
      if (projected.scale > 0) {
        const alpha = (particle.life / particle.maxLife) * projected.scale;
        this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        
        const size = particle.size * projected.scale;
        this.ctx.fillRect(projected.x - size / 2, projected.y - size / 2, size, size);
      }
    }
    
    this.ctx.restore();
  }
  
  private drawCrosshair(): void {
    // The crosshair is handled by CSS, but we can add additional effects here
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Draw speed indicator lines
    this.ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 + this.gameSpeed / this.MAX_GAME_SPEED * 0.7})`;
    this.ctx.lineWidth = 2;
    
    const speedLines = 8;
    for (let i = 0; i < speedLines; i++) {
      const angle = (i / speedLines) * Math.PI * 2;
      const length = 40 + this.gameSpeed * 3;
      
      this.ctx.beginPath();
      this.ctx.moveTo(
        centerX + Math.cos(angle) * 25,
        centerY + Math.sin(angle) * 25
      );
      this.ctx.lineTo(
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      );
      this.ctx.stroke();
    }
  }
  
  private updateUI(): void {
    const distanceFallen = 10000 - this.altitude;
    const speedMph = Math.floor(this.gameSpeed * 15); // Convert to mph
    
    document.getElementById('distance')!.textContent = Math.floor(this.altitude).toString();
    document.getElementById('highScore')!.textContent = Math.floor(this.highScore).toString();
    document.getElementById('speed')!.textContent = speedMph.toString();
    
    // Update wind indicator
    const windDirection = this.wind.x > 0 ? '→' : this.wind.x < 0 ? '←' : '↓';
    document.getElementById('windDirection')!.textContent = windDirection;
    document.getElementById('windSpeed')!.textContent = Math.floor(Math.abs(this.wind.strength)).toString();
  }
  
  private gameLoop(): void {
    this.frameCount++;
    
    this.updatePlayer();
    this.updatePlatforms();
    this.updateParticles();
    this.checkCollisions();
    this.render();
    this.updateUI();
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new FastFallGame('gameCanvas');
});
