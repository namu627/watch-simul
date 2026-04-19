# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static single-page watch collection simulator. Users can drag-and-drop watches from a scrollable list into a 4-slot watch case (or click to add/remove). No build system, no dependencies.

## Running the Project

Open `index.html` directly in a browser. There is no server, build step, or package manager.

## Architecture

The entire app is three files:

- **`index.html`** — Minimal shell. The watch case has 4 `.slot` divs. The `.watch-list` div is populated by JS at runtime.
- **`script.js`** — All logic. On `DOMContentLoaded`, creates `<img>` elements from `WATCH_FILENAMES` and appends them to `.watch-list`. Handles:
  - Click on watch case toggles `.open` class (CSS-animated lid via `::before` pseudo-element)
  - Drag-and-drop between `.watch-list` and `.slot` elements
  - Click on watch item or slot moves watches between list and case
  - Mouse-drag horizontal scrolling on `.watch-list`
- **`style.css`** — The watch case lid animation uses `::before` with `rotateX(120deg)` on `.watch-case.open`.

## Adding a New Watch

1. Add the PNG to `images/`
2. Add the filename to `WATCH_FILENAMES` in `script.js`
