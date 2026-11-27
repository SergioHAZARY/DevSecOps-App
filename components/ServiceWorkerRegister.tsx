"use client";

import * as React from "react";
import { checkForMobileUpdate } from "@/lib/mobile-update";
import { asset } from "@/lib/site";

/**
 * Registers the service worker that makes the app work offline, and surfaces the
 * "a new version is ready" update so the installed app (incl. the Android TWA/WebView)
 * refreshes itself without a reinstall.
 */
export function ServiceWorkerRegister() {
  const [waiting, setWaiting] = React.useState<ServiceWorker | null>(null);

  // Android app: pull a newer web bundle over the air (no-op on the website).
  React.useEffect(() => {
    void checkForMobileUpdate();
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register(asset("/sw.js"), { scope: asset("/") });

        const track = (worker: ServiceWorker | null) => {
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            // a new SW has installed while a previous one controls the page: an update is ready
            if (worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(worker);
          });
        };

        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        track(reg.installing);
        reg.addEventListener("updatefound", () => track(reg.installing));

        // check for a new version on load and every 30 min while the app stays open
        reg.update().catch(() => {});
        const interval = window.setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
        return () => window.clearInterval(interval);
      } catch {
        // offline on first load or SW unsupported: the app still works as a normal site
      }
    };

    const cleanup = register();
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      void cleanup.then((fn) => fn?.());
    };
  }, []);

  if (!waiting) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-lg border bg-card p-3 shadow-lg sm:left-auto sm:right-4">
      <div className="flex items-center gap-3">
        <p className="flex-1 text-sm">
          <span className="font-semibold">Mise à jour disponible</span>
          <span className="block text-muted-foreground">Update available</span>
        </p>
        <button
          type="button"
          onClick={() => {
            waiting.postMessage({ type: "SKIP_WAITING" });
            setWaiting(null);
          }}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Actualiser
        </button>
      </div>
    </div>
  );
}
