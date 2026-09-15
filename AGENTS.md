# Nana's Island Project Instructions

## Product
- Working title: Nana's Island.
- Build for phone first, especially portrait touch use; desktop support is for development/testing.
- The game should feel generous and calming rather than manipulative.
- Never add lives, energy gates, forced wait timers, FOMO streak punishment, premium-currency pressure, or difficulty designed to sell boosters.
- Long-term progression should come from restoration, collection, discovery, decoration, characters, and minigames.

## World and characters
- Two main anthropomorphic leads: an African elephant and a gibbon.
- Both can speak, emote, and wear outfits.
- Butterfly collecting is a major persistent system.
- Butterflies are attracted by appropriate flowers/habitat; they choose to visit rather than being awarded as loot.
- Discovered species should appear visibly in the sanctuary as well as in a collection/field guide.
- Use real butterfly species where practical and keep species/plant facts accurate.

## Engineering
- Prefer HTML5 Canvas and browser-side systems.
- Keep interaction touch-first with large targets, tap alternatives, and swipe support where useful.
- Build responsive layouts from narrow phones upward rather than shrinking a desktop layout.
- Preserve offline play and local save/progress as first-class requirements.
- Keep systems deterministic/testable where practical.
- Do not import Bionicle IP/assets from the earlier throwaway prototype into this project.

## Accessibility and readability
- The primary player needs unusually large, high-legibility text and chunky controls.
- Treat 18px as the normal body-text floor on phone; secondary text should generally stay at 16px or larger.
- Important labels, objectives, dialogue, rewards, and navigation must be easy to read without zooming.
- Prefer large tap targets (about 52-60px or larger), generous spacing, strong contrast, and fewer controls over dense UI.
- Do not solve cramped layouts by shrinking text; reflow, stack, or simplify the layout instead.

## Screen layout and scrolling
- Treat the phone viewport as a game screen, not a scrolling web page.
- Main screens and the app shell must never scroll, even with the scrollbar hidden.
- Fit the current interaction into the viewport using composition, positioning, tabs, overlays, or compact information hierarchy.
- Never shrink important text to make a screen fit. Simplify or restructure instead.
- Scrolling is allowed only inside clearly bounded in-game regions that are intrinsically lists, books, inventories, collections, or similar panels.

## Rendering architecture
- Render all player-facing visuals through one HTML5 canvas; do not build visible game UI from DOM elements.
- Keep HTML as a minimal PWA/bootstrap shell only.
- Use a fixed virtual portrait coordinate system with device-pixel-ratio aware scaling and touch-to-game coordinate mapping.
- Preserve the fixed-screen rule: only bounded in-game regions such as books/lists may scroll, implemented inside the canvas.

## Screen-space efficiency
- Reserve the large Nana's Island title/branding for the island home screen; secondary gameplay screens should use compact local headers.
- Prefer giving reclaimed space to gameplay, large readable controls, and content rather than decorative repetition.
- The main match-3 board is 9x9.
## Match-3 core tiles and 4-match powers
- Base tiles are sunflower, orange/white caterpillar, water drop, purple hyacinth, strawberry, and leaf.
- A 4+ match preserves the moved tile as a tappable powered tile and clears the other matched tiles; cascade-created 4+ matches preserve a sensible tile in the run.
- Powered results: sunflower→sun (3x3), caterpillar→butterfly (all leaves), water→rain (its column), hyacinth→grapes (snaking vine path), strawberry→fruit salad (all caterpillars), leaf→tree (all water).
- Tapping a powered tile activates it without spending another move.
