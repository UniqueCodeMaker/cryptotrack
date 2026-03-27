import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Variant_buy_sell } from "../backend";
import type { PriceData } from "../contexts/AppContext";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function usePrices() {
  const { actor, isFetching } = useActor();
  return useQuery<PriceData>({
    queryKey: ["prices"],
    queryFn: async () => {
      if (!actor) return {};
      const str = await actor.getPrices();
      return JSON.parse(str) as PriceData;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useHoldings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["holdings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserHoldings(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["transactions", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserTransactions(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["userRole", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useReferralStats() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["referralStats", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getReferralStats(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useReferralLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["referralLeaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReferralLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlatformStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHolding() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { identity } = useInternetIdentity();
  return useMutation({
    mutationFn: async (args: {
      symbol: string;
      name: string;
      quantity: number;
      costBasis: number;
      walletAddressLabel: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addHolding(
        args.symbol,
        args.name,
        args.quantity,
        args.costBasis,
        args.walletAddressLabel,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["holdings", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useUpdateHolding() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { identity } = useInternetIdentity();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      symbol: string;
      name: string;
      quantity: number;
      costBasis: number;
      walletAddressLabel: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateHolding(
        args.id,
        args.symbol,
        args.name,
        args.quantity,
        args.costBasis,
        args.walletAddressLabel,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["holdings", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useRemoveHolding() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { identity } = useInternetIdentity();
  return useMutation({
    mutationFn: async (holdingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeHolding(holdingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["holdings", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { identity } = useInternetIdentity();
  return useMutation({
    mutationFn: async (args: {
      symbol: string;
      transactionType: Variant_buy_sell;
      quantity: number;
      priceAtTime: number;
      totalValue: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTransaction(
        args.symbol,
        args.transactionType,
        args.quantity,
        args.priceAtTime,
        args.totalValue,
        args.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["transactions", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { identity } = useInternetIdentity();
  return useMutation({
    mutationFn: async (transactionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTransaction(transactionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["transactions", identity?.getPrincipal().toString()],
      });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { identity } = useInternetIdentity();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["userProfile", identity?.getPrincipal().toString()],
      });
    },
  });
}
