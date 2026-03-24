"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  LayoutDashboard,
  Ticket,
  History,
  User,
  LogOut,
  Plus,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Bookings",
    href: "/my-bookings",
    icon: Ticket,
  },
  {
    label: "Trip History",
    href: "/trip-history",
    icon: History,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function LayoutSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col overflow-hidden border-r border-[#f1c44f]/20 bg-[#0a2540]">
      {/* Header */}
      <div className="border-b border-[#f1c44f]/20 p-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/images/logohcc-150x150.png"
              alt="Holy Cross College Logo"
              fill
              sizes="40px"
              className="rounded-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f1c44f]">CrossRide</h1>
            <p className="mt-1 text-sm text-gray-400">Passenger Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
                    : "text-gray-400 hover:bg-[#f1c44f]/10 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}

        {/* Request Trip Button - Below Profile */}
        <Link href="/request-trip" className="block pt-4">
          <Button
            variant="ghost"
            className={`w-full justify-center gap-2 font-semibold ${
              pathname === "/request-trip"
                ? "bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
                : "text-gray-400 hover:bg-[#f1c44f]/10 hover:text-white"
            }`}
          >
            <Plus size={20} />
            Request a Trip
          </Button>
        </Link>
      </nav>

      {/* Footer */}
      <div className="space-y-4 border-t border-[#f1c44f]/20 p-6">
        <Separator className="bg-[#f1c44f]/20" />
        <Button
          onClick={handleSignOut}
          className="w-full gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30"
        >
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
