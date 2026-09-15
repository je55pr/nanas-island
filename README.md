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

The first playable prototype includes the island hub, a 9x9 touch-first match-3 board, persistent local progress, flower rewards, a butterfly sanctuary/field guide, and a tiny Pong minigame in the pavilion. Placeholder art is intentional; proposed generated-art slots are tracked in `docs/ART_APPROVALS.md`.

## Rendering architecture
All visible game UI is rendered through a single HTML5 canvas. The page itself is only a minimal PWA shell. The game uses a fixed 390x844 virtual portrait screen, scales cleanly to the device viewport/DPR, and keeps scrolling confined to intentional in-game regions such as the butterfly book.

## Live dev build
The `dev` branch automatically deploys through GitHub Actions to GitHub Pages after every push.
Live URL: `https://je55pr.github.io/nanas-island/`

## Current match-3 pieces
The board uses six base pieces: sunflower, caterpillar, water drop, purple hyacinth, strawberry, and leaf. Four-piece matches create tappable powered tiles with species/theme-specific effects rather than generic bombs.

## Current level content
There are now 10 authored match-3 missions followed by Garden Free Play. Missions exercise collecting specific pieces, using named 4-match powers, clearing weeds, dropping seed packets, freeing webbed caterpillars, and blooming soil beds. Rewards are persisted into the island save.

Milkweed from Level 1 can attract the Monarch in the sanctuary. Nettles from Level 4 can be planted later to attract a Peacock, giving the first authored progression chain from match-3 reward to habitat to butterfly discovery.
