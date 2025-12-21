# Steppy Scroller: Infinite Garden

An endless, procedurally generated climbing game. Traverse the infinite vine, avoid thorns, and choose your path.

## Vision: Infinite Garden
The game is evolving from a simple grid puzzle to an "Infinite Garden" metaphor. 
See [Design Doc](./docs/concept_infinite_garden.md) for detailed roadmap.

### Current Features (v0.2-garden)
- **Infinite Verticality:** No level cap. Procedurally generated terrain.
- **Camera Follow:** Viewport tracks the player's ascent.
- **Persistence:** Game state (including generated map) is saved.

## Local Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test:e2e
```

### Key Files
- `src/game-core/steppy.ts`: Core logic (PCG, movement).
- `src/main.ts`: Phaser 3 rendering (scrolling viewport).
- `api/state.ts`: Serverless function for state persistence.