# Minecraft AI Bot Builder

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Bot creation form with name, behavior attributes (build houses, mine resources, farm crops, guard area, explore, PvP defense), activity level, chat personality, and movement style
- Bot list/dashboard showing all created bots with status indicators
- Bot preview panel simulating a top-down/first-person Minecraft-style view of what the bot "sees" and is doing (animated canvas with blocks, terrain, activity log)
- Aternos server config generation: input fields for server IP, port, Minecraft username, version, and bot attributes — exports a `config.json` file the user can download
- Bot detail/edit page with full attribute controls
- Activity log per bot showing simulated actions
- Save/load bots from backend storage

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - `Bot` data type with id, name, attributes (array of behavior tags), serverConfig (host, port, username, version), status, createdAt
   - CRUD: createBot, getBots, getBot, updateBot, deleteBot
   - ServerConfig type embedded in Bot

2. Frontend:
   - App shell: sidebar navigation (Dashboard, Create Bot, My Bots, Settings)
   - Dashboard: stats cards (total bots, active bots), recent bots list
   - Create Bot page: multi-step form — Step 1: identity (name, username), Step 2: behaviors (multi-select cards for house building, mining, farming, exploring, guarding, PvP), Step 3: server config (Aternos host, port, version), Step 4: review and download config.json
   - My Bots page: grid of bot cards with status, edit, delete actions
   - Bot Detail page: full attribute display + live preview panel
   - Preview Panel: Canvas-based animated Minecraft-style simulation showing bot POV with block grid, movement animation, activity log sidebar
   - Config export: generate and trigger download of config.json with all bot settings
   - Professional dark theme with Minecraft-inspired green/stone color accents
