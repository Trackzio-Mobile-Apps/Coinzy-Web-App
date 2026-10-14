"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import {
  EXPERTS_USER_EVENTS,
  parseExpertsRealtimePayload,
  type ExpertsRealtimeMessage,
  type ExpertsSocketConfig,
} from "@/lib/experts/realtime";

type Listener = (message: ExpertsRealtimeMessage) => void;

let socket: Socket | null = null;
let connectPromise: Promise<void> | null = null;
const listeners = new Set<Listener>();

function emitToListeners(message: ExpertsRealtimeMessage) {
  for (const listener of listeners) {
    try {
      listener(message);
    } catch {
      /* ignore subscriber errors */
    }
  }
}

async function ensureSocket() {
  if (socket?.connected) return;
  if (connectPromise) {
    await connectPromise;
    return;
  }

  connectPromise = (async () => {
    const res = await fetch("/api/experts/socket-config", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as {
      error?: boolean;
      data?: ExpertsSocketConfig;
    } | null;
    if (!res.ok || body?.error || !body?.data?.url || !body?.data?.userId) return;

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    const { url, userId } = body.data;
    const next = io(url, {
      auth: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      forceNew: true,
    });

    for (const event of EXPERTS_USER_EVENTS) {
      next.on(event, (payload: unknown) => {
        const message = parseExpertsRealtimePayload(event, payload);
        if (message) emitToListeners(message);
      });
    }

    socket = next;
  })().finally(() => {
    connectPromise = null;
  });

  await connectPromise;
}

function releaseSocketIfIdle() {
  if (listeners.size > 0) return;
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

/**
 * Foreground Socket.IO for Experts (Android `ExpertsSocketManager` singleton).
 * Shared connection; each subscriber only registers a data-update callback.
 */
export function useExpertsRealtime(onEvent: Listener) {
  useEffect(() => {
    listeners.add(onEvent);
    void ensureSocket();
    return () => {
      listeners.delete(onEvent);
      releaseSocketIfIdle();
    };
  }, [onEvent]);
}
