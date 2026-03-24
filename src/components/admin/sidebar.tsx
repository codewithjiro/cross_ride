"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Briefcase,
  LogOut,
  UserCheck,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Vans",
    href: "/admin/vans",
    icon: Truck,
  },
  {
    label: "Drivers",
    href: "/admin/drivers",
    icon: UserCheck,
  },
  {
    label: "Trips",
    href: "/admin/trips",
    icon: MapPin,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: Briefcase,
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [tripsCount, setTripsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          fetch("/api/admin/trips"),
          fetch("/api/admin/bookings"),
        ]);

        if (tripsRes.ok) {
          const trips = await tripsRes.json();
          // Count only scheduled trips
          const scheduledCount = Array.isArray(trips)
            ? trips.filter((t: any) => t.status === "scheduled").length
            : 0;
          setTripsCount(scheduledCount);
        }

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          // Count pending bookings
          const pendingCount = Array.isArray(bookings)
            ? bookings.filter((b: any) => b.status === "pending").length
            : 0;
          setBookingsCount(pendingCount);
        }
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoggingOut(false);
      setLogoutConfirmOpen(false);
    }
  };

  const handleCancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  return (
    <aside className="flex w-64 flex-col border-r border-[#f1c44f]/20 bg-[#0a2540]">
      {/* Logo */}
      <div className="border-b border-[#f1c44f]/20 p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logohcc-150x150.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#f1c44f]">CrossRide</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          // Get badge count
          let badgeCount = 0;
          if (item.label === "Trips") {
            badgeCount = tripsCount;
          } else if (item.label === "Bookings") {
            badgeCount = bookingsCount;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-4 py-2 transition-colors ${
                isActive
                  ? "bg-[#f1c44f]/20 text-[#f1c44f]"
                  : "text-gray-300 hover:bg-[#f1c44f]/10 hover:text-[#f1c44f]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
              {badgeCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1c44f] text-xs font-bold text-[#071d3a]">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#f1c44f]/20 p-4">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full gap-2 border-[#f1c44f]/50 text-[#f1c44f] hover:bg-[#f1c44f]/10 disabled:opacity-50"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={logoutConfirmOpen}
        title="Logout"
        description="Are you sure you want to logout? You will be signed out of your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </aside>
  );
}
