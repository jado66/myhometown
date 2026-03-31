"use client";
import { useEffect, useState, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const standalone =
      ("standalone" in window.navigator && (window.navigator as any).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;

    setIsIOS(ios);
    setIsStandalone(standalone);

    if (ios && !standalone) {
      setIsInstallable(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const installedHandler = () => {
      setIsInstallable(false);
      deferredPrompt.current = null;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    deferredPrompt.current = null;
  };

  return { isInstallable, isIOS, isStandalone, promptInstall };
}
