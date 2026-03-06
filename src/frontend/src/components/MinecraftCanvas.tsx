import { useCallback, useEffect, useRef } from "react";

// ─── Block Types ───────────────────────────────────────────────────────────────

type BlockType =
  | "grass"
  | "dirt"
  | "stone"
  | "wood"
  | "water"
  | "sand"
  | "farmland"
  | "crops"
  | "empty"
  | "cobblestone"
  | "planks";

interface Block {
  type: BlockType;
}

type LogEntry = {
  time: string;
  message: string;
  type?: "info" | "success" | "warn" | "error";
};

// ─── Color Map ─────────────────────────────────────────────────────────────────

const BLOCK_COLORS: Record<BlockType, string[]> = {
  grass: ["#4a7c3f", "#5a9e3a", "#3d6b34", "#52883e"],
  dirt: ["#7a5230", "#8a6240", "#6a4428", "#7a5230"],
  stone: ["#5a5a5a", "#6a6a6a", "#4a4a4a", "#606060"],
  cobblestone: ["#5a5a5a", "#484848", "#626262", "#505050"],
  wood: ["#8B6914", "#9B7824", "#7B5910", "#8B6914"],
  planks: ["#c4a25d", "#d4b26d", "#b49248", "#c4a25d"],
  water: ["#2563eb", "#1d4ed8", "#3b82f6", "#2563eb"],
  sand: ["#c8b560", "#d8c570", "#b8a550", "#c8b560"],
  farmland: ["#5a3820", "#4a2810", "#6a4830", "#5a3820"],
  crops: ["#7ccd36", "#8cdd46", "#6cbd26", "#7ccd36"],
  empty: ["#1a2030", "#1a2030", "#1a2030", "#1a2030"],
};

// ─── World State ───────────────────────────────────────────────────────────────

const GRID_SIZE = 16;
const BLOCK_SIZE = 24;

interface BotState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  action: string;
  frame: number;
  ticksOnAction: number;
  speedMult: number;
}

interface WorldState {
  grid: Block[][];
  bot: BotState;
  tickCount: number;
}

// ─── World Generator ───────────────────────────────────────────────────────────

function createWorld(behaviors: string[]): WorldState {
  const grid: Block[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => {
      // Water stripe
      if (x === 7 || x === 8) return { type: "water" };
      // Some sand near water
      if ((x === 6 || x === 9) && y > 4 && y < 12) return { type: "sand" };
      // Some stone patches
      if ((x + y) % 7 === 0 && x < 6) return { type: "stone" };
      // Dirt patches
      if ((x * y) % 5 === 1 && y > 8) return { type: "dirt" };
      return { type: "grass" };
    }),
  );

  // Pre-place some structures based on behaviors
  if (behaviors.includes("build_houses")) {
    // Outline of a house
    for (let i = 1; i <= 4; i++) {
      grid[2][i] = { type: "planks" };
      grid[5][i] = { type: "planks" };
      grid[i + 1][1] = { type: "planks" };
      grid[i + 1][4] = { type: "planks" };
    }
  }
  if (behaviors.includes("farm_crops")) {
    for (let y = 10; y < 14; y++) {
      for (let x = 1; x < 5; x++) {
        grid[y][x] = y % 2 === 0 ? { type: "farmland" } : { type: "crops" };
      }
    }
  }

  return {
    grid,
    bot: {
      x: 5.5,
      y: 5.5,
      dx: 1,
      dy: 0,
      action: "idle",
      frame: 0,
      ticksOnAction: 0,
      speedMult: 1,
    },
    tickCount: 0,
  };
}

// ─── Simulation Tick ───────────────────────────────────────────────────────────

function tickWorld(
  state: WorldState,
  behaviors: string[],
  movementStyle: string,
): { state: WorldState; log: LogEntry | null } {
  const newState: WorldState = {
    grid: state.grid.map((row) => row.map((b) => ({ ...b }))),
    bot: { ...state.bot },
    tickCount: state.tickCount + 1,
  };

  const bot = newState.bot;
  const tick = newState.tickCount;
  let log: LogEntry | null = null;

  // Speed multiplier based on movement style
  const speedMap: Record<string, number> = {
    cautious: 0.5,
    normal: 1,
    speedy: 2,
  };
  bot.speedMult = speedMap[movementStyle] ?? 1;

  bot.ticksOnAction++;

  // Determine action every 40 ticks
  if (bot.ticksOnAction > 40 / bot.speedMult) {
    bot.ticksOnAction = 0;
    const activeBehaviors = behaviors.length > 0 ? behaviors : ["explore"];
    const behavior = activeBehaviors[tick % activeBehaviors.length];

    // Map behavior to an action
    const actionMap: Record<string, string> = {
      build_houses: "building",
      mine_resources: "mining",
      farm_crops: "farming",
      guard_area: "patrolling",
      explore: "exploring",
      pvp_defense: "defending",
      fishing: "fishing",
      trading: "trading",
    };
    bot.action = actionMap[behavior] ?? "exploring";
  }

  // Movement
  const speed = 0.12 * bot.speedMult;
  bot.x += bot.dx * speed;
  bot.y += bot.dy * speed;

  // Bounce off edges (avoid water columns 7-8)
  if (bot.x <= 0.5 || bot.x >= GRID_SIZE - 1.5) {
    bot.dx = -bot.dx;
    bot.x = Math.max(0.5, Math.min(GRID_SIZE - 1.5, bot.x));
  }
  if (bot.y <= 0.5 || bot.y >= GRID_SIZE - 1.5) {
    bot.dy = -bot.dy;
    bot.y = Math.max(0.5, Math.min(GRID_SIZE - 1.5, bot.y));
  }

  // Avoid water
  const bx = Math.floor(bot.x);
  const by = Math.floor(bot.y);
  if (bx >= 0 && bx < GRID_SIZE && by >= 0 && by < GRID_SIZE) {
    if (newState.grid[by][bx].type === "water") {
      bot.dx = -bot.dx;
      bot.dy = -bot.dy;
    }
  }

  // Direction changes
  if (tick % 30 === 0) {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
    ];
    const d = dirs[tick % dirs.length];
    bot.dx = d.dx;
    bot.dy = d.dy;
  }

  // Behavior-specific world mutations
  const gx = Math.floor(bot.x);
  const gy = Math.floor(bot.y);
  const validPos = gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE;
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  if (validPos && tick % 60 === 0) {
    switch (bot.action) {
      case "mining":
        if (
          newState.grid[gy][gx].type === "stone" ||
          newState.grid[gy][gx].type === "cobblestone"
        ) {
          newState.grid[gy][gx] = { type: "empty" };
          const count = Math.floor(Math.random() * 32) + 8;
          log = { time, message: `Mined ${count}x stone at (${gx},${gy})` };
        } else {
          // Place stone to mine
          const nearGx = Math.min(GRID_SIZE - 1, gx + 1);
          if (newState.grid[gy][nearGx].type === "grass") {
            newState.grid[gy][nearGx] = { type: "cobblestone" };
          }
        }
        break;
      case "building":
        if (
          newState.grid[gy][gx].type === "grass" ||
          newState.grid[gy][gx].type === "dirt"
        ) {
          newState.grid[gy][gx] = { type: "planks" };
          log = { time, message: `Placed wood planks at (${gx},${gy})` };
        }
        break;
      case "farming":
        if (newState.grid[gy][gx].type === "grass") {
          newState.grid[gy][gx] = { type: "farmland" };
          log = { time, message: `Tilled farmland at (${gx},${gy})` };
        } else if (newState.grid[gy][gx].type === "farmland") {
          newState.grid[gy][gx] = { type: "crops" };
          log = { time, message: `Planted crops at (${gx},${gy})` };
        } else if (newState.grid[gy][gx].type === "crops") {
          const yield_ = Math.floor(Math.random() * 5) + 2;
          newState.grid[gy][gx] = { type: "farmland" };
          log = {
            time,
            message: `Harvested ${yield_}x wheat at (${gx},${gy})`,
          };
        }
        break;
      case "exploring":
        log = { time, message: `Exploring area around (${gx},${gy})` };
        break;
      case "fishing":
        log = {
          time,
          message: `Cast fishing rod at (${gx},${gy}). ${Math.random() > 0.5 ? "Caught a fish!" : "No luck..."}`,
        };
        break;
      case "trading":
        log = { time, message: `Looking for villagers near (${gx},${gy})` };
        break;
      case "patrolling":
        log = { time, message: `Patrolling sector (${gx},${gy}) — all clear` };
        break;
      case "defending":
        log = { time, message: `Scanning for threats near (${gx},${gy})` };
        break;
    }
  }

  bot.frame = (bot.frame + 1) % 8;

  return { state: newState, log };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

function renderWorld(ctx: CanvasRenderingContext2D, state: WorldState) {
  ctx.imageSmoothingEnabled = false;

  // Draw blocks
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const block = state.grid[y][x];
      const colors = BLOCK_COLORS[block.type];
      const colorIdx = (x + y) % colors.length;
      ctx.fillStyle = colors[colorIdx];
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

      // Pixel detail — darker shade on right/bottom edges
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(
        x * BLOCK_SIZE + BLOCK_SIZE - 3,
        y * BLOCK_SIZE,
        3,
        BLOCK_SIZE,
      );
      ctx.fillRect(
        x * BLOCK_SIZE,
        y * BLOCK_SIZE + BLOCK_SIZE - 3,
        BLOCK_SIZE - 3,
        3,
      );

      // Lighter shade on top/left
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 3);
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE);

      // Texture detail for certain blocks
      if (block.type === "grass") {
        ctx.fillStyle = "rgba(80,160,50,0.3)";
        ctx.fillRect(x * BLOCK_SIZE + 4, y * BLOCK_SIZE + 4, 4, 4);
        ctx.fillRect(x * BLOCK_SIZE + 14, y * BLOCK_SIZE + 14, 3, 3);
      }
      if (block.type === "water") {
        const wave = Math.sin(state.tickCount * 0.08 + x + y) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(100,180,255,${0.1 + wave * 0.15})`;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE + 8, BLOCK_SIZE, 4);
      }
      if (block.type === "crops") {
        ctx.fillStyle = "#5da020";
        ctx.fillRect(x * BLOCK_SIZE + 4, y * BLOCK_SIZE + 4, 2, 14);
        ctx.fillRect(x * BLOCK_SIZE + 10, y * BLOCK_SIZE + 4, 2, 14);
        ctx.fillRect(x * BLOCK_SIZE + 16, y * BLOCK_SIZE + 4, 2, 14);
      }
    }
  }

  // Draw bot (pixel sprite)
  const bx = state.bot.x * BLOCK_SIZE;
  const by = state.bot.y * BLOCK_SIZE;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(bx - 6, by + 10, 16, 5);

  // Body (skin-colored)
  ctx.fillStyle = "#c8955c";
  ctx.fillRect(bx - 4, by - 6, 12, 10);

  // Head
  ctx.fillStyle = "#d4a574";
  ctx.fillRect(bx - 3, by - 14, 10, 8);

  // Eyes
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(bx - 1, by - 12, 2, 2);
  ctx.fillRect(bx + 3, by - 12, 2, 2);

  // Armor/clothes
  ctx.fillStyle = "#2a4a8a";
  ctx.fillRect(bx - 4, by - 4, 12, 8);

  // Legs (animated)
  const legSwing = Math.sin(state.bot.frame * 0.8) * 2;
  ctx.fillStyle = "#1a2a6a";
  ctx.fillRect(bx - 3, by + 4, 4, 6 + legSwing);
  ctx.fillRect(bx + 1, by + 4, 4, 6 - legSwing);

  // Tool based on action
  if (state.bot.action === "mining") {
    ctx.fillStyle = "#a0a0a0";
    ctx.fillRect(bx + 8, by - 8, 3, 12);
    ctx.fillStyle = "#8B6914";
    ctx.fillRect(bx + 6, by - 10, 2, 4);
  } else if (state.bot.action === "building") {
    ctx.fillStyle = "#c4a25d";
    ctx.fillRect(bx + 8, by - 4, 6, 6);
  } else if (state.bot.action === "fishing") {
    ctx.fillStyle = "#8B6914";
    ctx.fillRect(bx + 8, by - 8, 2, 14);
    ctx.fillStyle = "#a0c8ff";
    // Fishing line
    ctx.strokeStyle = "#a0c8ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + 10, by - 4);
    ctx.lineTo(bx + 18, by + 8);
    ctx.stroke();
  }

  // Action indicator (small colored dot above head)
  const actionColors: Record<string, string> = {
    mining: "#a0a0a0",
    building: "#c4a25d",
    farming: "#7ccd36",
    exploring: "#2563eb",
    fishing: "#60a5fa",
    trading: "#f59e0b",
    patrolling: "#6366f1",
    defending: "#ef4444",
    idle: "#6b7280",
  };
  const dotColor = actionColors[state.bot.action] ?? "#6b7280";
  ctx.fillStyle = dotColor;
  ctx.fillRect(bx + 1, by - 18, 6, 6);
  // Pulsing effect
  const pulse = Math.sin(state.tickCount * 0.15) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(255,255,255,${0.2 * pulse})`;
  ctx.fillRect(bx + 1, by - 18, 6, 6);
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface MinecraftCanvasProps {
  behaviors: string[];
  movementStyle: string;
  status: string;
  onLog: (entry: Omit<LogEntry, "id">) => void;
}

export default function MinecraftCanvas({
  behaviors,
  movementStyle,
  status,
  onLog,
}: MinecraftCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<WorldState | null>(null);
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!worldRef.current) {
      worldRef.current = createWorld(behaviors);
    }

    if (status === "active" || status === "idle") {
      const { state, log } = tickWorld(
        worldRef.current,
        behaviors,
        movementStyle,
      );
      worldRef.current = state;
      if (log) onLog(log);
    }

    renderWorld(ctx, worldRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [behaviors, movementStyle, status, onLog]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - reset world on behavior/style change
  useEffect(() => {
    // Reset world when behaviors/style changes
    worldRef.current = createWorld(behaviors);
  }, [behaviors, movementStyle]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [animate]);

  const canvasWidth = GRID_SIZE * BLOCK_SIZE;
  const canvasHeight = GRID_SIZE * BLOCK_SIZE;

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      data-ocid="bot_detail.preview.canvas_target"
      className="pixel-canvas w-full rounded-lg border border-border"
      style={{
        maxWidth: "100%",
        aspectRatio: "1 / 1",
        imageRendering: "pixelated",
      }}
    />
  );
}
