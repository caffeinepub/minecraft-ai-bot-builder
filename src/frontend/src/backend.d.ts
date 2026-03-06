import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Bot {
    id: bigint;
    status: string;
    activityLevel: string;
    username: string;
    movementStyle: string;
    behaviors: Array<string>;
    owner: Principal;
    mcVersion: string;
    name: string;
    createdAt: bigint;
    serverHost: string;
    serverPort: bigint;
    notes?: string;
    chatPersonality: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBot(name: string, username: string, behaviors: Array<string>, activityLevel: string, chatPersonality: string, movementStyle: string, serverHost: string, serverPort: bigint, mcVersion: string, notes: string | null): Promise<bigint>;
    deleteBot(id: bigint): Promise<void>;
    getBot(id: bigint): Promise<Bot>;
    getBots(): Promise<Array<Bot>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStatus(id: bigint, status: string): Promise<void>;
    updateBot(id: bigint, name: string, username: string, behaviors: Array<string>, activityLevel: string, chatPersonality: string, movementStyle: string, serverHost: string, serverPort: bigint, mcVersion: string, notes: string | null): Promise<void>;
}
