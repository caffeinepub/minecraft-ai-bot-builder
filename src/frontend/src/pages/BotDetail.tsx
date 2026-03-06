import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link, useMatch, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  ChevronDown,
  Clock,
  Download,
  Edit3,
  Loader2,
  Play,
  RefreshCw,
  Save,
  Server,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MinecraftCanvas from "../components/MinecraftCanvas";
import {
  useDeleteBot,
  useGetBot,
  useSetBotStatus,
  useUpdateBot,
} from "../hooks/useQueries";

const BEHAVIORS_LIST = [
  "build_houses",
  "mine_resources",
  "farm_crops",
  "guard_area",
  "explore",
  "pvp_defense",
  "fishing",
  "trading",
];

const BEHAVIOR_COLORS: Record<string, string> = {
  build_houses: "bg-mc-gold/10 text-mc-gold border-mc-gold/20",
  mine_resources: "bg-mc-stone/10 text-mc-iron border-mc-iron/20",
  farm_crops: "bg-mc-emerald/10 text-mc-emerald border-mc-emerald/20",
  guard_area: "bg-mc-iron/10 text-mc-iron border-mc-iron/20",
  explore: "bg-mc-diamond/10 text-mc-diamond border-mc-diamond/20",
  pvp_defense: "bg-mc-redstone/10 text-mc-redstone border-mc-redstone/20",
  fishing: "bg-mc-lapis/10 text-mc-lapis border-mc-lapis/20",
  trading: "bg-mc-gold/10 text-mc-gold border-mc-gold/20",
};

const MC_VERSIONS = [
  "1.20.4",
  "1.20.1",
  "1.19.4",
  "1.18.2",
  "1.17.1",
  "1.16.5",
];

interface LogEntry {
  id: number;
  time: string;
  message: string;
  type?: "info" | "success" | "warn" | "error";
}

function generateConfig(bot: {
  name: string;
  username: string;
  behaviors: string[];
  activityLevel: string;
  chatPersonality: string;
  movementStyle: string;
  serverHost: string;
  serverPort: bigint;
  mcVersion: string;
}) {
  return {
    bot: {
      name: bot.name,
      username: bot.username,
      behaviors: bot.behaviors,
      activityLevel: bot.activityLevel,
      chatPersonality: bot.chatPersonality,
      movementStyle: bot.movementStyle,
    },
    server: {
      host: bot.serverHost,
      port: Number(bot.serverPort),
      version: bot.mcVersion,
      type: "aternos",
    },
    settings: {
      autoReconnect: true,
      reconnectDelay: 5000,
      logActions: true,
    },
  };
}

function downloadConfig(
  bot: Parameters<typeof generateConfig>[0] & { name: string },
) {
  const config = generateConfig(bot);
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${bot.name.toLowerCase().replace(/\s+/g, "_")}_config.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { bg: string; ring: string; label: string }> = {
    active: { bg: "bg-mc-green", ring: "ring-mc-green/30", label: "Active" },
    idle: { bg: "bg-mc-gold", ring: "ring-mc-gold/30", label: "Idle" },
    error: {
      bg: "bg-destructive",
      ring: "ring-destructive/30",
      label: "Error",
    },
  };
  const s = map[status] ?? map.idle;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ring-2 ${s.bg} ${s.ring} animate-pulse`}
      />
      <span className="text-sm font-mono font-semibold">
        {s.label.toUpperCase()}
      </span>
    </div>
  );
}

export default function BotDetail() {
  const match = useMatch({ from: "/shell/bots/$id", shouldThrow: false });
  const id = (match?.params as { id?: string } | undefined)?.id;
  const navigate = useNavigate();
  const botId = id ? BigInt(id) : null;

  const { data: bot, isLoading, isError } = useGetBot(botId);
  const updateBot = useUpdateBot();
  const deleteBot = useDeleteBot();
  const setStatus = useSetBotStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    username: string;
    notes: string;
    behaviors: string[];
    activityLevel: string;
    chatPersonality: string;
    movementStyle: string;
    serverHost: string;
    serverPort: string;
    mcVersion: string;
  } | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Seed initial logs when bot changes identity
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-seed when bot.id changes
  useEffect(() => {
    if (bot) {
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setLogs([
        {
          id: 1,
          time,
          message: `Bot "${bot.name}" loaded. Status: ${bot.status}`,
          type: "success",
        },
        {
          id: 2,
          time,
          message: `Connected to ${bot.serverHost}:${bot.serverPort}`,
          type: "info",
        },
        {
          id: 3,
          time,
          message: `Minecraft version: ${bot.mcVersion}`,
          type: "info",
        },
        {
          id: 4,
          time,
          message: `Active behaviors: ${bot.behaviors.join(", ") || "none"}`,
          type: "info",
        },
      ]);
    }
  }, [bot?.id]); // eslint-disable-line

  const logIdRef = useRef(100);
  const handleLog = useCallback((entry: Omit<LogEntry, "id">) => {
    setLogs((prev) => {
      logIdRef.current += 1;
      const next = [...prev, { ...entry, id: logIdRef.current }];
      return next.slice(-200); // keep last 200 entries
    });
  }, []);

  // Auto-scroll logs
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep on logs/autoScroll
  useEffect(() => {
    if (autoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Sync edit form with bot data
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only sync when bot id changes
  useEffect(() => {
    if (bot && !editForm) {
      setEditForm({
        name: bot.name,
        username: bot.username,
        notes: bot.notes ?? "",
        behaviors: [...bot.behaviors],
        activityLevel: bot.activityLevel,
        chatPersonality: bot.chatPersonality,
        movementStyle: bot.movementStyle,
        serverHost: bot.serverHost,
        serverPort: bot.serverPort.toString(),
        mcVersion: bot.mcVersion,
      });
    }
  }, [bot]);

  const handleSave = async () => {
    if (!bot || !editForm) return;
    try {
      await updateBot.mutateAsync({
        id: bot.id,
        input: {
          name: editForm.name,
          username: editForm.username,
          notes: editForm.notes || undefined,
          behaviors: editForm.behaviors,
          activityLevel: editForm.activityLevel,
          chatPersonality: editForm.chatPersonality,
          movementStyle: editForm.movementStyle,
          serverHost: editForm.serverHost,
          serverPort: Number.parseInt(editForm.serverPort) || 25565,
          mcVersion: editForm.mcVersion,
        },
      });
      toast.success("Bot updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update bot");
    }
  };

  const handleDelete = async () => {
    if (!bot) return;
    try {
      await deleteBot.mutateAsync(bot.id);
      toast.success("Bot deleted");
      navigate({ to: "/bots" });
    } catch {
      toast.error("Failed to delete bot");
    }
  };

  const handleToggleStatus = async () => {
    if (!bot) return;
    const newStatus = bot.status === "active" ? "idle" : "active";
    try {
      await setStatus.mutateAsync({ id: bot.id, status: newStatus });
      toast.success(`Bot ${newStatus === "active" ? "started" : "stopped"}`);
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      handleLog({
        time,
        message: `Status changed to ${newStatus}`,
        type: newStatus === "active" ? "success" : "warn",
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const toggleBehavior = (b: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      behaviors: editForm.behaviors.includes(b)
        ? editForm.behaviors.filter((x) => x !== b)
        : [...editForm.behaviors, b],
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div data-ocid="bot_detail.loading_state" className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-full w-full rounded-xl min-h-[400px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !bot) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div
          data-ocid="bot_detail.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4"
        >
          <AlertTriangle size={32} className="mx-auto text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Bot not found</h2>
          <p className="text-muted-foreground text-sm">
            This bot doesn't exist or could not be loaded.
          </p>
          <Button asChild variant="outline">
            <Link to="/bots">
              <ArrowLeft size={14} className="mr-2" />
              Back to Bots
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // currentForm used in template below
  const _currentForm = editForm ?? {
    name: bot.name,
    username: bot.username,
    notes: bot.notes ?? "",
    behaviors: bot.behaviors,
    activityLevel: bot.activityLevel,
    chatPersonality: bot.chatPersonality,
    movementStyle: bot.movementStyle,
    serverHost: bot.serverHost,
    serverPort: bot.serverPort.toString(),
    mcVersion: bot.mcVersion,
  };
  void _currentForm;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <Link to="/bots">
              <ArrowLeft size={16} className="mr-1" />
              Bots
            </Link>
          </Button>
          <span className="text-border">/</span>
          <h1 className="text-lg font-bold font-display text-foreground">
            {bot.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={setStatus.isPending}
            data-ocid="bot_detail.status.toggle"
            className={cn(
              "font-mono text-xs",
              bot.status === "active"
                ? "border-mc-green/40 text-mc-green hover:bg-mc-green/10"
                : "border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10",
            )}
          >
            {setStatus.isPending ? (
              <Loader2 size={12} className="mr-1.5 animate-spin" />
            ) : bot.status === "active" ? (
              <Square size={12} className="mr-1.5" />
            ) : (
              <Play size={12} className="mr-1.5" />
            )}
            {bot.status === "active" ? "Stop Bot" : "Start Bot"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadConfig(bot)}
            data-ocid="bot_detail.download_config.button"
            className="font-mono text-xs border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10"
          >
            <Download size={12} className="mr-1.5" />
            config.json
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bot</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete "{bot.name}"? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Left Column — Bot Info Panel */}
        <div className="space-y-4">
          {/* Status + Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <StatusDot status={bot.status} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                <Edit3 size={12} className="mr-1.5" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            {isEditing && editForm ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Bot Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="h-8 text-sm bg-secondary border-border font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Username</Label>
                  <Input
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="h-8 text-sm bg-secondary border-border font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    rows={2}
                    className="text-sm bg-secondary border-border font-mono resize-none"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={updateBot.isPending}
                  size="sm"
                  className="w-full bg-primary text-primary-foreground text-xs"
                  data-ocid="bot_detail.save_button"
                >
                  {updateBot.isPending ? (
                    <Loader2 size={12} className="mr-1.5 animate-spin" />
                  ) : (
                    <Save size={12} className="mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="font-bold text-foreground">{bot.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      @{bot.username}
                    </div>
                  </div>
                </div>
                {bot.notes && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                    {bot.notes}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Behaviors Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              Behaviors
              {isEditing && (
                <span className="text-primary normal-case">
                  (click to toggle)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {isEditing && editForm
                ? BEHAVIORS_LIST.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBehavior(b)}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-mono border transition-all",
                        editForm.behaviors.includes(b)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {b.replace(/_/g, " ")}
                    </button>
                  ))
                : bot.behaviors.map((b) => (
                    <span
                      key={b}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${
                        BEHAVIOR_COLORS[b] ??
                        "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {b.replace(/_/g, " ")}
                    </span>
                  ))}
            </div>
          </div>

          {/* Server Config Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Server Config
            </div>
            {isEditing && editForm ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Host</Label>
                  <Input
                    value={editForm.serverHost}
                    onChange={(e) =>
                      setEditForm({ ...editForm, serverHost: e.target.value })
                    }
                    className="h-8 text-sm bg-secondary border-border font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Port</Label>
                    <Input
                      value={editForm.serverPort}
                      onChange={(e) =>
                        setEditForm({ ...editForm, serverPort: e.target.value })
                      }
                      className="h-8 text-sm bg-secondary border-border font-mono"
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Version</Label>
                    <Select
                      value={editForm.mcVersion}
                      onValueChange={(v) =>
                        setEditForm({ ...editForm, mcVersion: v })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MC_VERSIONS.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      key: "activityLevel",
                      label: "Activity",
                      options: ["passive", "moderate", "aggressive"],
                    },
                    {
                      key: "chatPersonality",
                      label: "Chat",
                      options: ["silent", "friendly", "sarcastic", "helper"],
                    },
                    {
                      key: "movementStyle",
                      label: "Movement",
                      options: ["cautious", "normal", "speedy"],
                    },
                  ].map(({ key, label, options }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs">{label}</Label>
                      <Select
                        value={editForm[key as keyof typeof editForm] as string}
                        onValueChange={(v) =>
                          setEditForm({ ...editForm, [key]: v })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground font-mono">
                  <Server size={12} />
                  <span className="text-foreground">
                    {bot.serverHost}:{bot.serverPort.toString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Version",
                      value: bot.mcVersion,
                      color: "text-mc-green",
                    },
                    {
                      label: "Activity",
                      value: bot.activityLevel,
                      color: "text-mc-gold",
                    },
                    {
                      label: "Movement",
                      value: bot.movementStyle,
                      color: "text-mc-diamond",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-secondary rounded p-2">
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {label}
                      </div>
                      <div
                        className={`text-xs font-mono font-semibold capitalize mt-0.5 ${color}`}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-secondary rounded p-2">
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Chat Personality
                  </div>
                  <div className="text-xs font-mono font-semibold capitalize mt-0.5 text-mc-lapis">
                    {bot.chatPersonality}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Clock size={12} />
              <span>
                Created:{" "}
                {new Date(
                  Number(bot.createdAt) / 1_000_000,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column — Preview Panel */}
        <div className="space-y-4">
          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {/* Canvas Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-mc-redstone/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-mc-gold/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-mc-green/70" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Bot Simulation — {bot.name}
                </span>
              </div>
              <StatusDot status={bot.status} />
            </div>

            <div className="p-3">
              <MinecraftCanvas
                behaviors={bot.behaviors}
                movementStyle={bot.movementStyle}
                status={bot.status}
                onLog={handleLog}
              />
            </div>
          </motion.div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            data-ocid="bot_detail.activity_log.panel"
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Terminal size={13} className="text-mc-green" />
                <span className="text-xs font-mono text-muted-foreground">
                  Activity Log
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {logs.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded border transition-colors",
                    autoScroll
                      ? "border-mc-green/40 text-mc-green bg-mc-green/10"
                      : "border-border text-muted-foreground hover:border-mc-green/30",
                  )}
                >
                  <ChevronDown size={10} className="inline mr-1" />
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border border-border text-muted-foreground hover:border-destructive/30 hover:text-destructive transition-colors"
                >
                  <RefreshCw size={10} className="inline mr-1" />
                  Clear
                </button>
              </div>
            </div>

            <div
              ref={logsRef}
              className="h-56 overflow-y-auto p-3 space-y-0.5 font-mono-mc"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {logs.length === 0 ? (
                <div className="text-muted-foreground text-xs py-8 text-center">
                  Waiting for activity...
                </div>
              ) : (
                logs.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "text-[11px] font-mono leading-relaxed",
                      entry.type === "success"
                        ? "text-mc-green"
                        : entry.type === "warn"
                          ? "text-mc-gold"
                          : entry.type === "error"
                            ? "text-mc-redstone"
                            : "text-muted-foreground",
                    )}
                  >
                    <span className="text-mc-stone mr-2">[{entry.time}]</span>
                    <span>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
