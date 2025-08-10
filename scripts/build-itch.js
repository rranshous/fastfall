#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎮 Building FastFall for itch.io...');

// Clean and create itch build directory
const itchDir = path.join(__dirname, '..', 'dist', 'itch');
if (fs.existsSync(itchDir)) {
  fs.rmSync(itchDir, { recursive: true });
}
fs.mkdirSync(itchDir, { recursive: true });

console.log('📦 Compiling TypeScript...');
// Build the game
execSync('npm run build:game', { stdio: 'inherit' });

console.log('📁 Copying files...');
// Copy all public files
const publicDir = path.join(__dirname, '..', 'src', 'public');
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(itchDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`   ✓ Copied ${file}`);
});

// Create an itch-specific index.html with optimizations
const indexPath = path.join(itchDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Add itch.io optimizations and metadata
const itchOptimizations = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="FastFall - High-speed first-person falling game. Navigate through platforms as you plummet from 10,000 feet!">
    <meta name="keywords" content="game, html5, falling, obstacle, arcade, first-person">
    <meta name="author" content="codeflaw">
    <meta name="canonical" content="https://codeflaw.itch.io/fastfall">
    
    <!-- Itch.io optimizations -->
    <style>
      /* Ensure full viewport usage for itch iframe */
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      /* Remove any default margins/padding that might interfere with itch embedding */
      * {
        box-sizing: border-box;
      }
    </style>`;

// Insert optimizations before closing head tag
indexContent = indexContent.replace('</head>', itchOptimizations + '\n  </head>');

// Write optimized index.html
fs.writeFileSync(indexPath, indexContent);

// Create a README for the itch build
const readmePath = path.join(itchDir, 'README.txt');
const readmeContent = `FastFall - Itch.io Distribution
==============================

This is the itch.io build of FastFall v1.3.0

Game Info:
- High-speed first-person falling game
- Navigate through platforms as you plummet from 10,000 feet
- Use WASD to steer, SPACE to start/restart, F for debug mode

Technical:
- HTML5 Canvas game
- No external dependencies
- Optimized for itch.io embedding
- Self-contained build

Files included:
- index.html (main game page)
- game.js (compiled game logic)
- README.txt (this file)

Built on: ${new Date().toISOString()}
Version: v1.3.0-coordinate-system-rework
`;

fs.writeFileSync(readmePath, readmeContent);

// Create a simple manifest for reference
const manifestPath = path.join(itchDir, 'manifest.json');
const manifestContent = {
  name: "FastFall",
  version: "1.3.0",
  description: "High-speed first-person falling game",
  main: "index.html",
  type: "html5",
  files: files,
  build_date: new Date().toISOString(),
  itch_optimized: true
};

fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));

console.log('🎯 Creating zip file for itch.io upload...');
// Create a zip file for easy itch upload
try {
  execSync(`cd ${itchDir} && zip -r ../fastfall-itch.zip ./*`, { stdio: 'inherit' });
  console.log('📦 Zip file created at dist/fastfall-itch.zip');
} catch (error) {
  console.log('⚠️  Zip creation failed (zip command not found). Manual zip recommended.');
  console.log('   You can manually zip the contents of dist/itch/ for upload.');
}

console.log('\n✅ Itch.io build complete!');
console.log('📂 Build location: dist/itch/');
console.log('📦 Zip file: dist/fastfall-itch.zip (if zip available)');
console.log('\n🚀 Upload instructions:');
console.log('1. Go to itch.io and create a new game page');
console.log('2. Upload the fastfall-itch.zip file or the contents of dist/itch/');
console.log('3. Set "Kind of project" to "HTML"');
console.log('4. Check "This file will be played in the browser"');
console.log('5. Set viewport dimensions (recommended: 1024x768 or fullscreen)');
console.log('6. Publish your game!');
