# Idea

I like games which move very fast and i have to make quick movements while playing.

# Game idea

I am thinking we make a game where it appears the POV of the player is "falling" through obstacles. 

The user must navigate around these obstacles.

# Visuals

For now I'm picturing the obstacles as simple 2d boxes or walls which are "coming at" the user

# Tech

Typescript, Canvas

Single backend to serve all needs

# Context

This exploratory and fun, not production work

# Game Design Clarifications

## Controls
- WASD movement

## Collision & Game Over
- When you hit an obstacle you lose and have to start over
- No damage system or lives - one hit = game over

## Level Design
- Never ending level that increases in complexity over time
- Level is static/deterministic so players can learn patterns when they restart
- Purely about achieving high scores

## Scoring
- Track distance "fallen" 
- Keep high score between attempts
- No other scoring mechanics for now

## Scope Decisions
- No audio for initial version
- Skip tutorial/onboarding 
- No pause functionality needed