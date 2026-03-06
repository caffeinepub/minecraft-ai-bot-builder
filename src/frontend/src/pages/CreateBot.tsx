import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Compass,
  Download,
  FileJson,
  Fish,
  Home,
  Layers,
  Loader2,
  Pickaxe,
  Save,
  Server,
  Shield,
  Sword,
  User,
  Wheat,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateBot } from "../hooks/useQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BotFormData {
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
}

const initialForm: BotFormData = {
  name: "",
  username: "",
  notes: "",
  behaviors: [],
  activityLevel: "moderate",
  chatPersonality: "friendly",
  movementStyle: "normal",
  serverHost: "",
  serverPort: "25565",
  mcVersion: "1.20.4",
};

// ─── Behavior Definitions ────────────────────────────────────────────────────

const BEHAVIORS = [
  {
    id: "build_houses",
    label: "Build Houses",
    icon: Home,
    color: "text-mc-wood",
  },
  {
    id: "mine_resources",
    label: "Mine Resources",
    icon: Pickaxe,
    color: "text-mc-stone",
  },
  { id: "farm_crops", label: "Farm Crops", icon: Wheat, color: "text-mc-gold" },
  {
    id: "guard_area",
    label: "Guard Area",
    icon: Shield,
    color: "text-mc-iron",
  },
  {
    id: "explore",
    label: "Explore World",
    icon: Compass,
    color: "text-mc-emerald",
  },
  {
    id: "pvp_defense",
    label: "PvP Defense",
    icon: Sword,
    color: "text-mc-redstone",
  },
  { id: "fishing", label: "Fishing", icon: Fish, color: "text-mc-diamond" },
  { id: "trading", label: "Trading", icon: Coins, color: "text-mc-gold" },
] as const;

const MC_VERSIONS = [
  "1.20.4",
  "1.20.1",
  "1.19.4",
  "1.18.2",
  "1.17.1",
  "1.16.5",
];

const STEPS = [
  { id: 1, label: "Identity", icon: User, ocid: "create_bot.step1.panel" },
  { id: 2, label: "Behaviors", icon: Layers, ocid: "create_bot.step2.panel" },
  { id: 3, label: "Server", icon: Server, ocid: "create_bot.step3.panel" },
  { id: 4, label: "Review", icon: FileJson, ocid: "create_bot.step4.panel" },
];

// ─── Config Generator ────────────────────────────────────────────────────────

function generateConfig(form: BotFormData) {
  return {
    bot: {
      name: form.name,
      username: form.username,
      behaviors: form.behaviors,
      activityLevel: form.activityLevel,
      chatPersonality: form.chatPersonality,
      movementStyle: form.movementStyle,
    },
    server: {
      host: form.serverHost,
      port: Number.parseInt(form.serverPort) || 25565,
      version: form.mcVersion,
      type: "aternos",
    },
    settings: {
      autoReconnect: true,
      reconnectDelay: 5000,
      logActions: true,
    },
  };
}

function downloadConfig(form: BotFormData) {
  const config = generateConfig(form);
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${form.name.toLowerCase().replace(/\s+/g, "_") || "bot"}_config.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Step 1: Identity ─────────────────────────────────────────────────────────

function Step1({
  form,
  setForm,
}: { form: BotFormData; setForm: (f: BotFormData) => void }) {
  return (
    <div data-ocid="create_bot.step1.panel" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Bot Identity
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Give your bot a name and Minecraft username.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bot-name" className="text-sm font-medium">
            Bot Name <span className="text-mc-redstone">*</span>
          </Label>
          <Input
            id="bot-name"
            data-ocid="create_bot.name.input"
            placeholder="e.g. BuilderBot Alpha"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-secondary border-border focus:border-primary font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Display name for your bot in the dashboard.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mc-username" className="text-sm font-medium">
            Minecraft Username <span className="text-mc-redstone">*</span>
          </Label>
          <Input
            id="mc-username"
            data-ocid="create_bot.username.input"
            placeholder="e.g. bot_alex_v2"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="bg-secondary border-border focus:border-primary font-mono"
          />
          <p className="text-xs text-muted-foreground">
            The in-game username. Must match your Minecraft account or cracked
            username.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            data-ocid="create_bot.notes.textarea"
            placeholder="Any notes about this bot's purpose or configuration..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="bg-secondary border-border focus:border-primary font-mono text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Behaviors ────────────────────────────────────────────────────────

function Step2({
  form,
  setForm,
}: { form: BotFormData; setForm: (f: BotFormData) => void }) {
  const toggleBehavior = (id: string) => {
    setForm({
      ...form,
      behaviors: form.behaviors.includes(id)
        ? form.behaviors.filter((b) => b !== id)
        : [...form.behaviors, id],
    });
  };

  return (
    <div data-ocid="create_bot.step2.panel" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Behaviors & Personality
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select behaviors and configure how your bot acts.
        </p>
      </div>

      {/* Behavior Cards */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Behaviors <span className="text-mc-redstone">*</span>
          <span className="text-muted-foreground font-normal ml-2 text-xs">
            ({form.behaviors.length} selected)
          </span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BEHAVIORS.map((b, idx) => {
            const Icon = b.icon;
            const selected = form.behaviors.includes(b.id);
            return (
              <button
                type="button"
                key={b.id}
                data-ocid={`create_bot.behavior.item.${idx + 1}`}
                onClick={() => toggleBehavior(b.id)}
                className={cn(
                  "behavior-card flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all",
                  selected
                    ? "border-primary bg-primary/10 selected"
                    : "border-border bg-secondary hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-md",
                    selected ? "bg-primary/20" : "bg-muted",
                  )}
                >
                  <Icon
                    size={16}
                    className={selected ? "text-primary" : b.color}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium leading-tight",
                    selected ? "text-primary" : "text-foreground",
                  )}
                >
                  {b.label}
                </span>
                {selected && (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Activity Level</Label>
          <Select
            value={form.activityLevel}
            onValueChange={(v) => setForm({ ...form, activityLevel: v })}
          >
            <SelectTrigger
              data-ocid="create_bot.activity_level.select"
              className="bg-secondary border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passive">🟢 Passive</SelectItem>
              <SelectItem value="moderate">🟡 Moderate</SelectItem>
              <SelectItem value="aggressive">🔴 Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Chat Personality</Label>
          <Select
            value={form.chatPersonality}
            onValueChange={(v) => setForm({ ...form, chatPersonality: v })}
          >
            <SelectTrigger
              data-ocid="create_bot.chat_personality.select"
              className="bg-secondary border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="silent">🤫 Silent</SelectItem>
              <SelectItem value="friendly">😊 Friendly</SelectItem>
              <SelectItem value="sarcastic">😏 Sarcastic</SelectItem>
              <SelectItem value="helper">🤝 Helper</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Movement Style</Label>
          <Select
            value={form.movementStyle}
            onValueChange={(v) => setForm({ ...form, movementStyle: v })}
          >
            <SelectTrigger
              data-ocid="create_bot.movement_style.select"
              className="bg-secondary border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cautious">🐢 Cautious</SelectItem>
              <SelectItem value="normal">🚶 Normal</SelectItem>
              <SelectItem value="speedy">⚡ Speedy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Server Config ────────────────────────────────────────────────────

function Step3({
  form,
  setForm,
}: { form: BotFormData; setForm: (f: BotFormData) => void }) {
  return (
    <div data-ocid="create_bot.step3.panel" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Server Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your Aternos server connection.
        </p>
      </div>

      {/* Aternos hint */}
      <div className="rounded-lg border border-mc-green/20 bg-mc-green/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-mc-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Server size={14} className="text-mc-green" />
          </div>
          <div>
            <div className="text-sm font-semibold text-mc-green">
              Aternos Server
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Your Aternos server address looks like:{" "}
              <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">
                yourserver.aternos.me
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Server Host <span className="text-mc-redstone">*</span>
          </Label>
          <Input
            data-ocid="create_bot.server_host.input"
            placeholder="e.g. myserver.aternos.me"
            value={form.serverHost}
            onChange={(e) => setForm({ ...form, serverHost: e.target.value })}
            className="bg-secondary border-border focus:border-primary font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Port</Label>
            <Input
              data-ocid="create_bot.server_port.input"
              placeholder="25565"
              value={form.serverPort}
              onChange={(e) => setForm({ ...form, serverPort: e.target.value })}
              className="bg-secondary border-border focus:border-primary font-mono"
              type="number"
              min={1}
              max={65535}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Minecraft Version</Label>
            <Select
              value={form.mcVersion}
              onValueChange={(v) => setForm({ ...form, mcVersion: v })}
            >
              <SelectTrigger
                data-ocid="create_bot.mc_version.select"
                className="bg-secondary border-border"
              >
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
      </div>
    </div>
  );
}

// ─── Step 4: Review ────────────────────────────────────────────────────────────

function Step4({
  form,
  onDownload,
  onSave,
  isSaving,
}: {
  form: BotFormData;
  onDownload: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const config = generateConfig(form);

  return (
    <div data-ocid="create_bot.step4.panel" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Review & Export
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your bot configuration before saving.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identity Summary */}
        <div className="rounded-lg border border-border bg-secondary p-4 space-y-3">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Identity
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-mono text-foreground">
                {form.name || "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Username</span>
              <span className="font-mono text-foreground">
                @{form.username || "—"}
              </span>
            </div>
            {form.notes && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                {form.notes}
              </div>
            )}
          </div>
        </div>

        {/* Server Summary */}
        <div className="rounded-lg border border-border bg-secondary p-4 space-y-3">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Server
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Host</span>
              <span className="font-mono text-foreground truncate ml-4">
                {form.serverHost || "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Port</span>
              <span className="font-mono text-foreground">
                {form.serverPort}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono text-mc-green">{form.mcVersion}</span>
            </div>
          </div>
        </div>

        {/* Behaviors Summary */}
        <div className="rounded-lg border border-border bg-secondary p-4 space-y-3">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Behaviors
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.behaviors.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                No behaviors selected
              </span>
            ) : (
              form.behaviors.map((b) => (
                <Badge
                  key={b}
                  className="bg-primary/15 text-primary border-primary/30 font-mono text-xs"
                  variant="outline"
                >
                  {b.replace(/_/g, " ")}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Personality Summary */}
        <div className="rounded-lg border border-border bg-secondary p-4 space-y-3">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Personality
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Activity</span>
              <span className="font-mono text-foreground capitalize">
                {form.activityLevel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chat</span>
              <span className="font-mono text-foreground capitalize">
                {form.chatPersonality}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Movement</span>
              <span className="font-mono text-foreground capitalize">
                {form.movementStyle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Preview */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <FileJson size={14} className="text-mc-gold" />
            <span className="text-xs font-mono text-muted-foreground">
              config.json preview
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-mc-redstone/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-mc-gold/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-mc-green/60" />
          </div>
        </div>
        <pre className="p-4 text-xs font-mono text-mc-green overflow-x-auto leading-relaxed">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onDownload}
          variant="outline"
          className="flex-1 border-mc-gold/40 text-mc-gold hover:bg-mc-gold/10 hover:border-mc-gold"
          data-ocid="create_bot.download_config.button"
        >
          <Download size={16} className="mr-2" />
          Download config.json
        </Button>
        <Button
          onClick={onSave}
          disabled={
            isSaving ||
            !form.name ||
            !form.username ||
            !form.serverHost ||
            form.behaviors.length === 0
          }
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          data-ocid="create_bot.save_bot.button"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Bot
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main CreateBot Component ─────────────────────────────────────────────────

export default function CreateBot() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BotFormData>(initialForm);
  const navigate = useNavigate();
  const createBot = useCreateBot();

  const canNext = () => {
    if (step === 1)
      return form.name.trim() !== "" && form.username.trim() !== "";
    if (step === 2) return form.behaviors.length > 0;
    if (step === 3)
      return form.serverHost.trim() !== "" && form.serverPort.trim() !== "";
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSave = async () => {
    try {
      const id = await createBot.mutateAsync({
        name: form.name,
        username: form.username,
        behaviors: form.behaviors,
        activityLevel: form.activityLevel,
        chatPersonality: form.chatPersonality,
        movementStyle: form.movementStyle,
        serverHost: form.serverHost,
        serverPort: Number.parseInt(form.serverPort) || 25565,
        mcVersion: form.mcVersion,
        notes: form.notes || undefined,
      });
      toast.success(`Bot "${form.name}" created successfully!`);
      navigate({ to: "/bots/$id", params: { id: id.toString() } });
    } catch {
      toast.error("Failed to create bot. Please try again.");
    }
  };

  const handleDownload = () => {
    downloadConfig(form);
    toast.success("config.json downloaded!");
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black font-display text-foreground">
          Create New Bot
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your Minecraft AI bot in a few simple steps.
        </p>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute top-5 left-0 right-0 h-px bg-border z-0" />
          <div
            className="absolute top-5 left-0 h-px bg-primary z-0 step-connector transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div
                key={s.id}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300",
                    isDone
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                        ? "bg-card border-primary text-primary"
                        : "bg-card border-border text-muted-foreground",
                  )}
                >
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={cn(
                    "text-xs font-mono hidden sm:block",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <Step1 form={form} setForm={setForm} />}
            {step === 2 && <Step2 form={form} setForm={setForm} />}
            {step === 3 && <Step3 form={form} setForm={setForm} />}
            {step === 4 && (
              <Step4
                form={form}
                onDownload={handleDownload}
                onSave={handleSave}
                isSaving={createBot.isPending}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            data-ocid="create_bot.back.button"
            className="min-w-[100px]"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canNext()}
            data-ocid="create_bot.next.button"
            className="min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
      {step === 4 && (
        <div className="flex justify-start mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            data-ocid="create_bot.back.button"
            className="min-w-[100px]"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
