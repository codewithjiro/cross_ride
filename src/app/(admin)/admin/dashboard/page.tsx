import { Suspense } from "react";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import {
  Truck,
  Users,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function DashboardStats() {
  try {
    const [vansCount, driversCount, tripsCount, bookingsCount] =
      await Promise.all([
        db.query.vans.findMany().then((vans) => vans.length),
        db.query.drivers.findMany().then((drivers) => drivers.length),
        db.query.trips.findMany().then((trips) => trips.length),
        db.query.bookings.findMany().then((bookings) => bookings.length),
      ]);

    const stats = [
      {
        label: "Total Vans",
        value: vansCount,
        icon: Truck,
        bgGradient: "from-blue-600/20 to-blue-500/10",
        iconColor: "text-blue-400",
      },
      {
        label: "Total Drivers",
        value: driversCount,
        icon: Users,
        bgGradient: "from-emerald-600/20 to-emerald-500/10",
        iconColor: "text-emerald-400",
      },
      {
        label: "Total Trips",
        value: tripsCount,
        icon: MapPin,
        bgGradient: "from-purple-600/20 to-purple-500/10",
        iconColor: "text-purple-400",
      },
      {
        label: "Total Bookings",
        value: bookingsCount,
        icon: Briefcase,
        bgGradient: "from-orange-600/20 to-orange-500/10",
        iconColor: "text-orange-400",
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`relative border border-[#f1c44f]/20 bg-gradient-to-br ${stat.bgGradient} bg-[#0a2540] p-6 transition-all duration-300 hover:border-[#f1c44f]/40 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 backdrop-blur-sm ${stat.bgGradient}`}
                >
                  <Icon className={`${stat.iconColor} h-8 w-8`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  } catch {
    return <div className="text-red-500">Failed to load statistics</div>;
  }
}

async function RecentBookings() {
  try {
    const recentBookings = await db.query.bookings.findMany({
      limit: 5,
      with: {
        user: true,
        trip: {
          with: {
            van: true,
          },
        },
      },
      orderBy: (bookings, { desc }) => [desc(bookings.id)],
    });

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "approved":
          return <CheckCircle2 size={18} className="text-emerald-400" />;
        case "rejected":
          return <XCircle size={18} className="text-red-400" />;
        case "pending":
        default:
          return <Clock size={18} className="text-amber-400" />;
      }
    };

    return (
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <div className="mb-6 flex items-center gap-3">
          <Briefcase size={28} className="text-[#f1c44f]" />
          <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
        </div>
        <div className="space-y-3">
          {recentBookings.length === 0 ? (
            <p className="py-4 text-center text-gray-400">No bookings yet</p>
          ) : (
            recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="group flex flex-col gap-3 rounded-lg border border-[#f1c44f]/10 bg-gradient-to-r from-[#071d3a] to-[#0a2540] p-4 transition-all duration-300 hover:border-[#f1c44f]/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {booking.trip?.van?.name} • {booking.seatsBooked} seat
                      {booking.seatsBooked !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all duration-300"
                    style={{
                      backgroundColor:
                        booking.status === "approved"
                          ? "rgba(16, 185, 129, 0.15)"
                          : booking.status === "rejected"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(217, 119, 6, 0.15)",
                    }}
                  >
                    {getStatusIcon(booking.status)}
                    <span
                      style={{
                        color:
                          booking.status === "approved"
                            ? "#10b981"
                            : booking.status === "rejected"
                              ? "#ef4444"
                              : "#d97706",
                      }}
                      className="text-sm font-semibold tracking-wide uppercase"
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  } catch {
    return <div className="text-red-500">Failed to load recent bookings</div>;
  }
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mb-12 max-w-2xl">
        <h1 className="mb-2 text-5xl font-bold text-white">Dashboard</h1>
        <p className="text-lg text-gray-400">
          Welcome back! Here&apos;s an overview of your system.
        </p>
      </div>

      <Suspense
        fallback={<div className="text-white">Loading statistics...</div>}
      >
        <DashboardStats />
      </Suspense>

      <div className="mt-10">
        <Suspense
          fallback={<div className="text-white">Loading bookings...</div>}
        >
          <RecentBookings />
        </Suspense>
      </div>
    </div>
  );
}
