# Fort Sullivan — version 6

Version 3 (jimmyardis/sullivans2, the one Amanda and Vince chose), revised to the
September 2026 direction: image-led home page, separate history page, version 2's
year spine linking into the history chapters, and the aerial film as the hero.

- `index.tpl.html`, `history.tpl.html`, `archive.part.html` — page sources
- `build.py` — assembles `index.html` / `history.html` and copies the images they use
  from the source photo folder
- `site.js` — `HERO_FILM` at the top: set `mp4: 'hero.mp4'` once the original footage
  arrives, or change `start`/`end` to re-cut the YouTube excerpt
