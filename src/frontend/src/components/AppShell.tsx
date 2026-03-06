import { cn } from "@/lib/utils";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bot, Cpu, LayoutDashboard, Menu, PlusCircle, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
    exact: true,
  },
  {
    label: "Create Bot",
    href: "/create",
    icon: PlusCircle,
    ocid: "nav.create_bot.link",
  },
  {
    label: "My Bots",
    href: "/bots",
    icon: Bot,
    ocid: "nav.my_bots.link",
  },
];

function StatusBar() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 border border-border">
      <div className="w-2 h-2 rounded-full bg-mc-green animate-pulse glow-green" />
      <span className="text-xs text-muted-foreground font-mono">
        System Online
      </span>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
      <div className="relative w-9 h-9 flex-shrink-0">
        <img
          src="/assets/generated/minecraft-bot-logo-transparent.dim_64x64.png"
          alt="MCBotForge"
          className="w-full h-full mc-block"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mc-green rounded-sm glow-green" />
      </div>
      <div>
        <div className="font-display font-black text-sm tracking-tight text-foreground leading-none">
          MCBotForge
        </div>
        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
          AI Bot Builder
        </div>
      </div>
    </div>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border">
      <Logo />

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-3 px-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Navigation
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = item.exact
            ? currentPath === item.href
            : currentPath.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              data-ocid={item.ocid}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent",
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary glow-green" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-3">
        <StatusBar />
        <div className="flex items-center gap-2 px-2">
          <Cpu size={12} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-mono">
            Powered by ICP
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const currentPage = navItems.find((item) =>
    item.exact ? currentPath === item.href : currentPath.startsWith(item.href),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <h1 className="text-sm font-semibold text-foreground">
                {currentPage?.label ?? "MCBotForge"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-mc-green animate-pulse" />
              <span className="text-xs text-muted-foreground font-mono">
                v1.0.0
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-border px-6 py-3 flex items-center justify-center">
          <p className="text-[11px] text-muted-foreground font-mono">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
