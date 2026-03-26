"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "~/components/admin/sidebar";
import { SessionManager } from "~/components/session-manager";

interface AuthResponse {
  authenticated: boolean;
  role?: string;
  userId?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication status and admin role
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as AuthResponse;
          if (data.authenticated && data.role === "admin") {
            setIsAuthenticated(true);
            setIsAdmin(true);
          } else {
            // Redirect to sign-in if not authenticated or not admin
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

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-[#071d3a]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <SessionManager
        inactivityTimeoutMinutes={30}
        warningMinutesBefore={5}
        logoutOnClose={true}
        enableWarning={true}
      />
    </div>
  );
}
