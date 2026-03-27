import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HoldingDTO {
    id: HoldingId;
    name: string;
    createdAt: bigint;
    updatedAt: bigint;
    quantity: number;
    costBasis: number;
    walletAddressLabel: string;
    symbol: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ReferralLeaderboardEntry {
    username: string;
    referralCount: bigint;
}
export interface ReferralStats {
    referredUsers: Array<string>;
    referralCount: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransactionDTO {
    id: TransactionId;
    priceAtTime: number;
    transactionType: Variant_buy_sell;
    totalValue: number;
    date: bigint;
    notes: string;
    quantity: number;
    symbol: string;
}
export type UserId = Principal;
export type TransactionId = bigint;
export type HoldingId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PlatformStats {
    activeUsers: bigint;
    totalHoldings: bigint;
    totalUsers: bigint;
    suspendedUsers: bigint;
    totalTransactions: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_buy_sell {
    buy = "buy",
    sell = "sell"
}
export interface backendInterface {
    addHolding(symbol: string, name: string, quantity: number, costBasis: number, walletAddressLabel: string): Promise<HoldingId>;
    addTransaction(symbol: string, transactionType: Variant_buy_sell, quantity: number, priceAtTime: number, totalValue: number, notes: string): Promise<TransactionId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(transactionId: TransactionId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPlatformStats(): Promise<PlatformStats>;
    getPrices(): Promise<string>;
    getReferralLeaderboard(): Promise<Array<ReferralLeaderboardEntry>>;
    getReferralStats(userId: UserId): Promise<ReferralStats>;
    getUserHoldings(userId: UserId): Promise<Array<HoldingDTO>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTransactions(userId: UserId): Promise<Array<TransactionDTO>>;
    isCallerAdmin(): Promise<boolean>;
    removeHolding(holdingId: HoldingId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateHolding(holdingId: HoldingId, symbol: string, name: string, quantity: number, costBasis: number, walletAddressLabel: string): Promise<void>;
}
