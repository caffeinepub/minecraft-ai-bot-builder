import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  ChevronRight,
  Clock,
  Compass,
  Home,
  Pickaxe,
  Plus,
  Server,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useGetBots } from "../hooks/useQueries";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; dot: string }> =
    {
      active: {
        label: "Active",
        className: "bg-mc-green/15 text-mc-green border-mc-green/30",
        dot: "bg-mc-green glow-green",
      },
      idle: {
        label: "Idle",
        className: "bg-mc-gold/15 text-mc-gold border-mc-gold/30",
        dot: "bg-mc-gold glow-yellow",
      },
      error: {
        label: "Error",
        className: "bg-destructive/15 text-destructive border-destructive/30",
        dot: "bg-destructive glow-red",
      },
    };
  const s = map[status] ?? map.idle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${s.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`} />
      {s.label}
    </span>
  );
}

function BehaviorIcon({ behavior }: { behavior: string }) {
  const map: Record<string, React.ReactNode> = {
    build_houses: <Home size={11} />,
    mine_resources: <Pickaxe size={11} />,
    explore: <Compass size={11} />,
  };
  return (map[behavior] ?? <Zap size={11} />) as React.ReactElement;
}

const SAMPLE_BOTS = [
  {
    id: BigInt(1),
    name: "BuilderBot Alpha",
    username: "builder_alpha",
    status: "active",
    behaviors: ["build_houses", "mine_resources"],
    serverHost: "alpha.aternos.me",
    mcVersion: "1.20.4",
    activityLevel: "moderate",
    chatPersonality: "friendly",
    movementStyle: "normal",
    owner: {} as never,
    createdAt: BigInt(Date.now()),
    serverPort: BigInt(25565),
  },
  {
    id: BigInt(2),
    name: "MinerBot X",
    username: "minerbot_x",
    status: "idle",
    behaviors: ["mine_resources", "trading"],
    serverHost: "mine.aternos.me",
    mcVersion: "1.20.1",
    activityLevel: "aggressive",
    chatPersonality: "sarcastic",
    movementStyle: "speedy",
    owner: {} as never,
    createdAt: BigInt(Date.now()),
    serverPort: BigInt(25565),
  },
  {
    id: BigInt(3),
    name: "FarmGuard Pro",
    username: "farmguard_3",
    status: "active",
    behaviors: ["farm_crops", "guard_area"],
    serverHost: "farm.aternos.me",
    mcVersion: "1.19.4",
    activityLevel: "passive",
    chatPersonality: "helper",
    movementStyle: "cautious",
    owner: {} as never,
    createdAt: BigInt(Date.now()),
    serverPort: BigInt(25565),
  },
];

export default function Dashboard() {
  const { data: bots, isLoading } = useGetBots();
  const displayBots = bots && bots.length > 0 ? bots : SAMPLE_BOTS;
  const recentBots = [...displayBots].slice(0, 5);

  const totalBots = displayBots.length;
  const activeBots = displayBots.filter((b) => b.status === "active").length;
  const idleBots = displayBots.filter((b) => b.status === "idle").length;

  const stats = [
    {
      label: "Total Bots",
      value: totalBots,
      icon: Bot,
      color: "text-mc-diamond",
      bg: "bg-mc-diamond/10 border-mc-diamond/20",
    },
    {
      label: "Active Bots",
      value: activeBots,
      icon: Activity,
      color: "text-mc-green",
      bg: "bg-mc-green/10 border-mc-green/20",
    },
    {
      label: "Idle Bots",
      value: idleBots,
      icon: Clock,
      color: "text-mc-gold",
      bg: "bg-mc-gold/10 border-mc-gold/20",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl border border-border bg-card p-8 noise-bg"
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, oklch(0.72 0.19 145) 0px, oklch(0.72 0.19 145) 1px, transparent 1px, transparent 32px),
                              repeating-linear-gradient(90deg, oklch(0.72 0.19 145) 0px, oklch(0.72 0.19 145) 1px, transparent 1px, transparent 32px)`,
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {(["#5a9e3a", "#6ab54b", "#4a8830"] as const).map((c) => (
                  <div
                    key={c}
                    className="w-3 h-3 mc-block"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-primary">
                minecraft.ai
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight text-foreground leading-tight">
              Minecraft AI <span className="text-primary">Bot Builder</span>
            </h1>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Create, configure, and deploy intelligent Minecraft bots with
              custom behaviors. Connect to your Aternos server in minutes.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Server size={12} />
              <span>Aternos Compatible</span>
              <span className="text-border">·</span>
              <Zap size={12} className="text-primary" />
              <span>ICP Powered</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="dashboard.create_bot.primary_button"
            >
              <Link to="/create">
                <Plus size={18} className="mr-2" />
                Create New Bot
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/bots">
                <Bot size={16} className="mr-2" />
                View All Bots
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className={`rounded-lg border p-5 bg-card ${stat.bg} flex items-center gap-4`}
            >
              <div className={`p-2.5 rounded-md ${stat.bg} border ${stat.bg}`}>
                <Icon size={20} className={stat.color} />
              </div>
              <div>
                <div
                  className={`text-2xl font-black font-display ${stat.color}`}
                >
                  {isLoading ? <Skeleton className="h-7 w-10" /> : stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Bots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground">
            Recent Bots
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/bots">
              View all <ChevronRight size={14} className="ml-1" />
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentBots.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Bot size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No bots created yet.{" "}
                <Link to="/create" className="text-primary hover:underline">
                  Create your first bot
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentBots.map((bot, idx) => (
                <motion.div
                  key={bot.id.toString()}
                  custom={idx}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {bot.name}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                        @{bot.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        {bot.serverHost}
                      </span>
                      <div className="flex gap-1">
                        {bot.behaviors.slice(0, 2).map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border"
                          >
                            <BehaviorIcon behavior={b} />
                            {b.replace(/_/g, " ")}
                          </span>
                        ))}
                        {bot.behaviors.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{bot.behaviors.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={bot.status} />
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs text-muted-foreground"
                    >
                      <Link to="/bots/$id" params={{ id: bot.id.toString() }}>
                        <ChevronRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <h3 className="text-sm font-bold text-foreground mb-4 font-display">
          Quick Start
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Configure Bot",
              desc: "Set behaviors, personality & movement style",
              color: "text-mc-green",
            },
            {
              step: "02",
              title: "Add Server",
              desc: "Enter your Aternos server host & port",
              color: "text-mc-diamond",
            },
            {
              step: "03",
              title: "Export & Deploy",
              desc: "Download config.json and run your bot",
              color: "text-mc-gold",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div
                className={`text-2xl font-black font-mono ${item.color} opacity-60 leading-none mt-0.5`}
              >
                {item.step}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
