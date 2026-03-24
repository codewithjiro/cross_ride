"use client";

import { useEffect, useState } from "react";

interface UserData {
  firstName?: string;
  createdAt?: string;
}

export function DashboardHeader() {
  const [user, setUser] = useState<UserData | null>(null);
  const [greeting, setGreeting] = useState("Good day");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get time-based greeting
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as {
            authenticated: boolean;
            user?: {
              firstName?: string;
              createdAt?: string;
            };
          };
          if (data.authenticated && data.user) {
            setUser({
              firstName: data.user.firstName,
              createdAt: data.user.createdAt,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Good day!</h1>
        <p className="mt-2 text-gray-400">
          Manage your bookings and explore available trips
        </p>
      </div>
    );
  }

  const firstName = user?.firstName || "User";
  const year = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white">
        {greeting}, {firstName}!
      </h1>
      <p className="mt-2 text-gray-400">Member since {year}</p>
    </div>
  );
}
