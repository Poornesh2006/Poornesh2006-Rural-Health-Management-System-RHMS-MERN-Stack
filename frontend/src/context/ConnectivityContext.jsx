import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { offlineDb } from "../services/offline-db";

const ConnectivityContext = createContext(null);

function createMutationId() {
  return `mut-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function ConnectivityProvider({ children }) {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [syncState, setSyncState] = useState("idle");
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  async function refreshPendingCount() {
    const items = await offlineDb.getAll("pendingMutations");
    setPendingCount(items.length);
  }

  async function syncPendingMutations() {
    if (!window.navigator.onLine) {
      return;
    }

    setSyncState("syncing");
    const items = await offlineDb.getAll("pendingMutations");

    for (const item of items) {
      try {
        await api.request({
          method: item.method,
          url: item.url,
          data: item.body,
          headers: {
            "x-idempotency-key": item.id,
          },
        });
        await offlineDb.deletePendingMutation(item.id);
      } catch (error) {
        if (error.response?.status === 409) {
          await offlineDb.set("syncMetadata", item.id, { ...item, conflict: true });
        }
      }
    }

    setLastSyncAt(new Date().toISOString());
    setSyncState("idle");
    await refreshPendingCount();
  }

  useEffect(() => {
    refreshPendingCount();

    function handleOnline() {
      setIsOnline(true);
      syncPendingMutations();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      syncState,
      lastSyncAt,
      pendingCount,
      async queueMutation({ method, url, body }) {
        const id = createMutationId();
        await offlineDb.addPendingMutation({
          id,
          method,
          url,
          body,
          queuedAt: new Date().toISOString(),
        });
        await refreshPendingCount();
        return id;
      },
      syncPendingMutations,
      async clearOfflineData() {
        await offlineDb.clearAll();
        await refreshPendingCount();
      },
    }),
    [isOnline, lastSyncAt, pendingCount, syncState],
  );

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error("useConnectivity must be used within ConnectivityProvider");
  }
  return context;
}
