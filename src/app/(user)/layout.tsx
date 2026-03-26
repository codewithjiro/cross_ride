"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutSidebar } from "~/components/user/sidebar";
import { SessionManager } from "~/components/session-manager";

interface AuthResponse {
  authenticated: boolean;
  role?: string;
  userId?: string;
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as AuthResponse;
          if (data.authenticated && data.role === "user") {
            setIsAuthenticated(true);
          } else {
            // Redirect to sign-in if not authenticated or is admin
            void router.push("/sign-in");
          }
        } else {
          void router.push("/sign-in");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        void router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071d3a]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-[#071d3a]">
      <LayoutSidebar />
      <main className="h-screen flex-1 overflow-y-auto">{children}</main>
      <SessionManager
        inactivityTimeoutMinutes={30}
        warningMinutesBefore={5}
        logoutOnClose={true}
        enableWarning={true}
      />
    </div>
  );
}
