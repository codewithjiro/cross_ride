import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Briefcase,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Vans",
    href: "/admin/vans",
    icon: Truck,
  },
  {
    label: "Drivers",
    href: "/admin/drivers",
    icon: Users,
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
  {
    label: "Logs",
    href: "/admin/logs",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
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
    <aside className="flex w-64 flex-col border-r border-[#f1c44f]/20 bg-[#0a2540]">
      {/* Logo */}
      <div className="border-b border-[#f1c44f]/20 p-6">
        <h1 className="text-2xl font-bold text-[#f1c44f]">CrossRide</h1>
        <p className="text-sm text-gray-400">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-[#f1c44f]/10 hover:text-[#f1c44f]"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#f1c44f]/20 p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 border-[#f1c44f]/50 text-[#f1c44f] hover:bg-[#f1c44f]/10"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
