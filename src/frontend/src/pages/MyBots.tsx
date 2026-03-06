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
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bot,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Server,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Bot as BotType } from "../backend.d";
import { useDeleteBot, useGetBots } from "../hooks/useQueries";

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; dot: string }> =
    {
      active: {
        label: "Active",
        className: "bg-mc-green/15 text-mc-green border-mc-green/30",
        dot: "bg-mc-green",
      },
      idle: {
        label: "Idle",
        className: "bg-mc-gold/15 text-mc-gold border-mc-gold/30",
        dot: "bg-mc-gold",
      },
      error: {
        label: "Error",
        className: "bg-destructive/15 text-destructive border-destructive/30",
        dot: "bg-destructive",
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

// ─── Bot Card ──────────────────────────────────────────────────────────────────

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

function BotCard({
  bot,
  index,
  onDelete,
  isDeleting,
}: {
  bot: BotType;
  index: number;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      data-ocid={`bots.item.${index + 1}`}
      className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-primary/30 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
            <Bot size={18} className="text-primary" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm leading-tight">
              {bot.name}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5">
              @{bot.username}
            </div>
          </div>
        </div>
        <StatusBadge status={bot.status} />
      </div>

      {/* Behaviors */}
      <div className="flex flex-wrap gap-1.5">
        {bot.behaviors.slice(0, 4).map((b) => (
          <span
            key={b}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
              BEHAVIOR_COLORS[b] ??
              "bg-muted text-muted-foreground border-border"
            }`}
          >
            {b.replace(/_/g, " ")}
          </span>
        ))}
        {bot.behaviors.length > 4 && (
          <span className="text-[10px] font-mono text-muted-foreground px-1">
            +{bot.behaviors.length - 4}
          </span>
        )}
      </div>

      {/* Server Info */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Server size={11} />
        <span className="truncate">{bot.serverHost}</span>
        <span className="text-border">:{bot.serverPort?.toString()}</span>
        <Badge
          variant="outline"
          className="ml-auto text-[10px] font-mono border-border text-muted-foreground"
        >
          {bot.mcVersion}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-1 h-8 text-xs text-muted-foreground hover:text-primary"
          data-ocid="bots.view_bot.button"
        >
          <Link to="/bots/$id" params={{ id: bot.id.toString() }}>
            <Eye size={13} className="mr-1.5" />
            Preview
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-1 h-8 text-xs text-muted-foreground hover:text-foreground"
          data-ocid="bots.edit_bot.button"
        >
          <Link to="/bots/$id" params={{ id: bot.id.toString() }}>
            <Edit size={13} className="mr-1.5" />
            Edit
          </Link>
        </Button>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              data-ocid="bots.delete_bot.button"
            >
              <Trash2 size={13} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            data-ocid="bots.delete.dialog"
            className="bg-card border-border"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-destructive" />
                Delete Bot
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  "{bot.name}"
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="bots.delete.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(bot.id);
                  setDeleteOpen(false);
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="bots.delete.confirm_button"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : null}
                Delete Bot
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-ocid="bots.empty_state"
      className="col-span-full flex flex-col items-center justify-center py-20 gap-5 text-center"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center">
          <Bot size={36} className="text-muted-foreground" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Plus size={14} className="text-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">No bots yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Create your first Minecraft AI bot to get started.
        </p>
      </div>
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Link to="/create">
          <Plus size={16} className="mr-2" />
          Create Your First Bot
        </Link>
      </Button>
    </motion.div>
  );
}

// ─── Skeleton Grid ─────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </>
  );
}

// ─── Main MyBots Page ─────────────────────────────────────────────────────────

export default function MyBots() {
  const { data: bots, isLoading, isError } = useGetBots();
  const deleteBotMutation = useDeleteBot();
  const [search, setSearch] = useState("");

  const handleDelete = async (id: bigint) => {
    try {
      await deleteBotMutation.mutateAsync(id);
      toast.success("Bot deleted successfully");
    } catch {
      toast.error("Failed to delete bot");
    }
  };

  const filtered = (bots ?? []).filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.username.toLowerCase().includes(search.toLowerCase()) ||
      b.serverHost.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black font-display text-foreground">
            My Bots
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading
              ? "Loading..."
              : `${bots?.length ?? 0} bot${bots?.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto"
        >
          <Link to="/create">
            <Plus size={16} className="mr-2" />
            New Bot
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      {!isLoading && (bots?.length ?? 0) > 0 && (
        <div className="relative mb-6">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search bots by name, username, or server..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border focus:border-primary font-mono text-sm"
          />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={16} className="text-destructive" />
          <span className="text-sm text-destructive">
            Failed to load bots. Please refresh the page.
          </span>
        </div>
      )}

      {/* Bots Grid */}
      <div
        data-ocid="bots.list.panel"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {isLoading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 && search ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <p>
              No bots match "<span className="text-foreground">{search}</span>"
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence>
            {filtered.map((bot, i) => (
              <BotCard
                key={bot.id.toString()}
                bot={bot}
                index={i}
                onDelete={handleDelete}
                isDeleting={deleteBotMutation.isPending}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
