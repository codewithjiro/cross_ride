"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SessionManagerConfig {
  inactivityTimeoutMinutes?: number;
  warningMinutesBefore?: number;
  logoutOnClose?: boolean;
  enableWarning?: boolean;
}

const DEFAULT_CONFIG: SessionManagerConfig = {
  inactivityTimeoutMinutes: 30, // 30 minutes
  warningMinutesBefore: 5, // Warn 5 minutes before logout
  logoutOnClose: true, // Logout when window closes
  enableWarning: true, // Show warning dialog
};

export function useSessionManager(config: SessionManagerConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(
    finalConfig.warningMinutesBefore || 5,
  );

  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());
  const countdownRef = useRef<NodeJS.Timeout>();

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      router.push("/");
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);

    const inactivityMs =
      (finalConfig.inactivityTimeoutMinutes || 30) * 60 * 1000;
    const warningMs =
      ((finalConfig.inactivityTimeoutMinutes || 30) -
        (finalConfig.warningMinutesBefore || 5)) *
      60 *
      1000;

    // Set warning timer
    if (finalConfig.enableWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        if (finalConfig.warningMinutesBefore) {
          setTimeoutMinutes(finalConfig.warningMinutesBefore);
        }
      }, warningMs);
    }

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      setShowWarning(false);
      void handleLogout();
    }, inactivityMs);
  }, [finalConfig, handleLogout]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimer, showWarning]);

  // Handle window close logout
  useEffect(() => {
    if (!finalConfig.logoutOnClose) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Some browsers require returnValue to be set
      e.preventDefault();
      e.returnValue = "";

      // Logout when window closes
      await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [finalConfig.logoutOnClose]);

  // Initialize timer on mount
  useEffect(() => {
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [resetTimer]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    resetTimer();
  };

  const handleConfirmLogout = async () => {
    setShowWarning(false);
    await handleLogout();
  };

  return {
    showWarning,
    timeoutMinutes,
    handleStayLoggedIn,
    handleConfirmLogout,
  };
}
