import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppShell from "./components/AppShell";
import BotDetail from "./pages/BotDetail";
import CreateBot from "./pages/CreateBot";
import Dashboard from "./pages/Dashboard";
import MyBots from "./pages/MyBots";

// ─── Route Tree ────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Toaster theme="dark" position="bottom-right" richColors />
      <Outlet />
    </>
  ),
});

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "shell",
  component: AppShell,
});

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/",
  component: Dashboard,
});

const createBotRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/create",
  component: CreateBot,
});

const myBotsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/bots",
  component: MyBots,
});

const botDetailRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/bots/$id",
  component: BotDetail,
});

const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    dashboardRoute,
    createBotRoute,
    myBotsRoute,
    botDetailRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
