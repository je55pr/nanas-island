# Nana's Island

A phone-first cosy match-3 game with long-term island restoration, butterfly collecting, character comedy, and unlockable retro-style minigames.

## Current pillars
- Main activity: polished, readable match-3 designed for touch.
- Progression: restore and personalise a persistent island over many sessions.
- Butterfly sanctuary: grow special flowers to attract real butterfly species; discovered butterflies visibly fly around the sanctuary and enter a collection book.
- Leads: an anthropomorphic African elephant and gibbon who talk, wear outfits, and carry the story.
- Minigames: simple side games such as Pong, unlocked through progression and replayable later.
- Tone: warm, funny, colourful, low-pressure, with yellow/gold as a signature accent.
- Monetisation philosophy: no lives, energy timers, artificial frustration, FOMO streaks, pay-to-win boosters, or other mobile dark patterns.

## First vertical slice
Target roughly 10 match-3 levels, one small island hub, the butterfly sanctuary, 4-6 flowers, 3 discoverable butterfly species, the two leads, persistent save data, and Pong as the first minigame.

## Technical direction
Mobile-first HTML5 game with a single visible Canvas, touch-first controls, offline/PWA support, and desktop mouse support for development/testing.

## Run the prototype
Double-click `RUN.cmd`. It serves the game locally at `http://127.0.0.1:8977/` and opens it in the default browser.

The first playable prototype includes the island hub, a 7x8 touch-first match-3 board, persistent local progress, flower rewards, a butterfly sanctuary/field guide, and a tiny Pong minigame in the pavilion. Placeholder art is intentional; proposed generated-art slots are tracked in `docs/ART_APPROVALS.md`.

## Rendering architecture
All visible game UI is rendered through a single HTML5 canvas. The page itself is only a minimal PWA shell. The game uses a fixed 390x844 virtual portrait screen, scales cleanly to the device viewport/DPR, and keeps scrolling confined to intentional in-game regions such as the butterfly book.

## Live dev build
The `dev` branch automatically deploys through GitHub Actions to GitHub Pages after every push.
Live URL: `https://je55pr.github.io/nanas-island/`
