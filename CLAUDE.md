# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nutz Poker Timer** is a single-file web application for managing poker tournaments. The entire application is contained in `index.html` - no build process, dependencies, or backend required.

**Tech Stack:**
- Pure Vanilla JavaScript (ES6+)
- HTML5 + CSS3 (Grid & Flexbox)
- External dependency: Canvas Confetti (loaded via CDN)
- Audio API with Among Us sound effect
- LocalStorage for state persistence

**Live Demo:** https://jjllrrvvrr.github.io/NutzPokerTimer/

## Architecture

### Single-File Structure

All code lives in `index.html`:
1. **CSS (lines 8-243)**: CSS variables for theming, responsive layouts with mobile tabs
2. **HTML (lines 246-377)**: Navigation, mobile tabs, 3-panel layout (players/timer/payouts), settings modal
3. **JavaScript (lines 379-677)**: State management, timer logic, payout calculations, UI rendering

### State Management

The application uses a single global `state` object (line 388) persisted to localStorage:

```javascript
{
  theme: 'dark' | 'light',
  muted: boolean,
  name: string,           // Tournament name
  buyin: number,          // Buy-in amount
  rebuyPrice: number,     // Rebuy/Add-on price
  tableSize: number,      // Max players per table (0 = single table)
  duration: number,       // Minutes per level
  level: number,          // Current blind level index
  timeLeft: number,       // Seconds remaining
  playing: boolean,       // Timer running
  mode: 'qty' | 'list',   // Player input mode
  paidMode: 'auto' | '1' | '2' | '3' | 'custom',
  customPaidStr: string,  // Custom payout format
  players: Array<{name, out, rank, rebuys, table}>,
  structure: string[],    // Blind levels (e.g. "25/50", "100/200/200", "PAUSE5")
  isPause: boolean
}
```

**Key:** LocalStorage key is `nutz_pro_v6`. Changing this will reset all user data.

### Responsive Layout

- **Desktop (>1024px)**: 3-column grid (players | timer | payouts)
- **Mobile (≤1024px)**: Tabbed interface with `.mobile-tabs` navigation
- Active mobile tab gets `.active-mobile` class (line 239)

### Core Features

**Timer System (lines 618-640):**
- Runs via `setInterval` when `state.playing === true`
- Decrements `state.timeLeft` every second
- Triggers `handleLevelEnd()` at 0, which processes PAUSE logic or advances level
- `triggerAlert()` creates strobe effect by rapidly toggling theme

**Blind Structure Format:**
- Basic: `SB/BB` (e.g. "25/50")
- With Ante: `SB/BB/ANTE` (e.g. "100/200/200")
- With Pause: Append `/PAUSEXX` where XX is pause minutes (e.g. "75/150/PAUSE5")
- The toggle at line 437 automatically adds/removes ante (equal to BB)

**Payout Calculation (lines 489-554):**
- Auto mode: Pays 10-15% of field based on player count
- Predefined splits for Top 1/2/3
- Custom format: `"50/30/20"` (percentages) or `"25/10/5"` (exact amounts)
- Automatically rounds to nearest €1 or €5 and adjusts to match exact pot

**Player Management:**
- Right-click or long-press on player to open context menu with options:
  - Mark OUT / Reactivate player
  - Edit player name
  - Add/Remove rebuys
  - Change table (if multi-tables enabled)
- Auto-assigns rank based on alive count at elimination
- **Rebuys/Add-ons**: Rebuy count displayed as green badge (+1, +2, etc.)
  - Total pot automatically includes rebuys
- Confetti effects for winner celebration (different intensities for 1st, 2nd, and other paid places)

**Multi-Table Management:**
- Set `tableSize` in settings to enable multi-table mode (e.g., 9 for 9-max tables)
- **Initial Assignment**: Players randomly assigned to tables when settings are applied
  - Toast notification shows distribution (e.g., "Table 1: 9 players, Table 2: 8 players") for 10 seconds
- **Auto-Rebalancing**: Tables rebalanced ONLY when imbalance is significant (≥3 players difference)
  - Ensures roughly equal number of players per table without being too aggressive
  - Tables are compacted (no gaps in table numbers)
  - Toast notification shows which players moved (e.g., "Alice: T2→T1") for 10 seconds
- **Display**: Discrete badge "T1", "T2" etc. next to player name
  - Players automatically sorted by table number
  - Badge only visible for active players
- **Manual Override**: Can manually change a player's table via context menu
  - Toast notification confirms the manual change for 6 seconds
- **Toast Notifications**:
  - Duration: 6-10 seconds depending on type
  - Click anywhere on toast to dismiss immediately
  - Hover effect indicates clickability
  - Shows "Cliquez pour fermer" hint at bottom
- Functions:
  - `assignTables()` - Initial random assignment with notification
  - `rebalanceTables()` - Smart rebalancing with imbalance threshold (≥3 players), change detection and notification
  - `getTableStats()` - Returns player count per table
  - `changePlayerTable(i)` - Manual table change with notification
  - `showToast(title, content, duration=8000)` - Display dismissible toast notification

**Audio System:**
- Uses Among Us sound from myinstants.com CDN
- `unlockAudio()` must be called on user interaction before sound plays (mobile requirement)
- All interactive buttons call `unlockAudio()` to ensure audio works

## Development

### Testing Locally

Simply open `index.html` in any modern browser. No server required.

For live reload during development:
```bash
python3 -m http.server 8000
# or
npx serve
```

### Deploying

Already configured for GitHub Pages. The demo link points to `https://jjllrrvvrr.github.io/NutzPokerTimer/`.

## Important Implementation Notes

### When Modifying State

Always call `save()` (line 664) after state changes that should persist, and `render()` (line 556) to update UI.

### Theme System

Uses CSS variables in `:root` and `[data-theme="light"]` (lines 9-34). The `data-theme` attribute on `<body>` controls which theme is active.

### Mobile Tab Navigation

Function `openTab()` (line 381) manages tab switching by adding/removing `.active-mobile` class. Each section has id `tab-{name}`.

### Blind Level Parsing

Lines 563-586 parse blind structure strings. Format: Split on `/`, filter out PAUSE parts for display, show ante in parentheses if present.

### Confetti Trigger

Called via external library (line 7) when 2nd-to-last player is eliminated (line 641).

### Player Management Functions

**editPlayerName(i)** - Opens prompt to edit player name at index i

**addRebuy(i)** / **removeRebuy(i)** - Manage rebuy count for player at index i

**toggleOut(i)** - Mark player as eliminated/active, triggers confetti for paid places

### Confetti System

Three levels of confetti effects:
- **confettiSmall()** - 3rd place and below (simple burst)
- **confettiMedium()** - 2nd place (2-second silver effect)
- **confettiBig(winnerName)** - 1st place (5-second golden celebration + name overlay)

Winner overlay displays until user clicks/taps screen.

### LocalStorage Schema

Version is `nutz_pro_v6`. State is serialized as JSON. No migrations - changing key resets data.
