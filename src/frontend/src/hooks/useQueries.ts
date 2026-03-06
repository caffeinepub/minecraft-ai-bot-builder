import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bot } from "../backend.d";
import { useActor } from "./useActor";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateBotInput {
  name: string;
  username: string;
  behaviors: string[];
  activityLevel: string;
  chatPersonality: string;
  movementStyle: string;
  serverHost: string;
  serverPort: number;
  mcVersion: string;
  notes?: string;
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useGetBots() {
  const { actor, isFetching } = useActor();
  return useQuery<Bot[]>({
    queryKey: ["bots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBots();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetBot(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Bot>({
    queryKey: ["bot", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getBot(id);
    },
    enabled: !!actor && !isFetching && id !== null,
    staleTime: 30_000,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateBot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBotInput) => {
      if (!actor) throw new Error("No actor");
      const id = await actor.createBot(
        input.name,
        input.username,
        input.behaviors,
        input.activityLevel,
        input.chatPersonality,
        input.movementStyle,
        input.serverHost,
        BigInt(input.serverPort),
        input.mcVersion,
        input.notes ?? null,
      );
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
    },
  });
}

export function useUpdateBot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: CreateBotInput }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateBot(
        id,
        input.name,
        input.username,
        input.behaviors,
        input.activityLevel,
        input.chatPersonality,
        input.movementStyle,
        input.serverHost,
        BigInt(input.serverPort),
        input.mcVersion,
        input.notes ?? null,
      );
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      qc.invalidateQueries({ queryKey: ["bot", id.toString()] });
    },
  });
}

export function useDeleteBot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteBot(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bots"] });
    },
  });
}

export function useSetBotStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.setStatus(id, status);
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["bots"] });
      qc.invalidateQueries({ queryKey: ["bot", id.toString()] });
    },
  });
}
