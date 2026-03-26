import { Suspense } from "react";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Truck,
  Users,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import { AutoCompleteBookings } from "~/components/admin/auto-complete-bookings";

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

async function BookingStatistics() {
  try {
    const bookings = await db.query.bookings.findMany({
      with: {
        trip: true,
      },
    });

    // Calculate booking status distribution
    const statusStats = {
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };

    const maxStatus = Math.max(...Object.values(statusStats), 1);

    // Get top routes by bookings
    const routeBookings: { [key: string]: number } = {};
    bookings.forEach((b) => {
      const route = b.trip?.route || "Unknown";
      routeBookings[route] = (routeBookings[route] || 0) + 1;
    });

    const topRoutes = Object.entries(routeBookings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxRoute = Math.max(...topRoutes.map((r) => r[1]), 1);

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Status Distribution */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 size={28} className="text-[#f1c44f]" />
            <h2 className="text-2xl font-bold text-white">Booking Status</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-400 capitalize">
                    {status}
                  </span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#0a1f37]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      status === "pending"
                        ? "bg-amber-500"
                        : status === "approved"
                          ? "bg-blue-500"
                          : status === "completed"
                            ? "bg-green-500"
                            : status === "rejected"
                              ? "bg-red-500"
                              : "bg-gray-500"
                    }`}
                    style={{
                      width: `${(count / maxStatus) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Routes by Bookings */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp size={28} className="text-[#f1c44f]" />
            <h2 className="text-2xl font-bold text-white">Top Routes</h2>
          </div>
          <div className="space-y-4">
            {topRoutes.length > 0 ? (
              topRoutes.map(([route, count], index) => (
                <div key={route}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#f1c44f]/20 text-sm font-bold text-[#f1c44f]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold break-words text-gray-300">
                        {route}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#f1c44f]">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#0a1f37]">
                    <div
                      className="h-full bg-gradient-to-r from-[#f1c44f] to-[#d4a850] transition-all duration-300"
                      style={{
                        width: `${(count / maxRoute) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-gray-400">No routes yet</p>
            )}
          </div>
        </Card>
      </div>
    );
  } catch {
    return (
      <div className="text-red-500">Failed to load booking statistics</div>
    );
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
            driver: true,
          },
        },
      },
      orderBy: (bookings, { desc }) => [desc(bookings.id)],
    });

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "approved":
          return <CheckCircle2 size={18} className="text-emerald-400" />;
        case "completed":
          return <CheckCircle2 size={18} className="text-emerald-400" />;
        case "rejected":
          return <XCircle size={18} className="text-red-400" />;
        case "cancelled":
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
                className="group rounded-lg border border-[#f1c44f]/15 bg-gradient-to-br from-[#0f2d4a]/60 via-[#071d3a] to-[#0a1f37] p-5 transition-all duration-300 hover:border-[#f1c44f]/40 hover:from-[#0f2d4a]/80 hover:shadow-xl hover:shadow-[#f1c44f]/10"
              >
                {/* Header: User + Status */}
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#f1c44f]/10 pb-4">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          booking.user?.profileImage ||
                          "/profile/default_profile.jpg"
                        }
                        alt={`${booking.user?.firstName} ${booking.user?.lastName}`}
                        className="h-16 w-16 rounded-full border-2 border-[#f1c44f]/30 object-cover shadow-lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f1c44f]/40"></span>
                        {booking.trip?.van?.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 items-center gap-2.5 rounded-full border-2 px-4 py-2 font-semibold whitespace-nowrap shadow-md transition-all duration-300"
                    style={{
                      backgroundColor:
                        booking.status === "approved" ||
                        booking.status === "completed"
                          ? "rgba(16, 185, 129, 0.2)"
                          : booking.status === "rejected" ||
                              booking.status === "cancelled"
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(217, 119, 6, 0.2)",
                      borderColor:
                        booking.status === "approved" ||
                        booking.status === "completed"
                          ? "rgba(16, 185, 129, 0.4)"
                          : booking.status === "rejected" ||
                              booking.status === "cancelled"
                            ? "rgba(239, 68, 68, 0.4)"
                            : "rgba(217, 119, 6, 0.4)",
                    }}
                  >
                    {getStatusIcon(booking.status)}
                    <span
                      style={{
                        color:
                          booking.status === "approved" ||
                          booking.status === "completed"
                            ? "#10b981"
                            : booking.status === "rejected" ||
                                booking.status === "cancelled"
                              ? "#ef4444"
                              : "#d97706",
                      }}
                      className="text-xs font-bold tracking-widest uppercase"
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Route */}
                  <div className="col-span-2 rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/40 p-3 transition-colors hover:border-[#f1c44f]/20">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      <MapPin size={12} className="text-[#f1c44f]/60" />
                      Route
                    </p>
                    <p className="truncate text-sm font-semibold text-white">
                      {booking.trip?.route}
                    </p>
                  </div>

                  {/* Seats */}
                  <div className="rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/40 p-3 transition-colors hover:border-[#f1c44f]/20">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      <Users size={12} className="text-[#f1c44f]/60" />
                      Seats
                    </p>
                    <p className="text-sm font-bold text-[#f1c44f]">
                      {booking.seatsBooked}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/40 p-3 transition-colors hover:border-[#f1c44f]/20">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      <Clock size={12} className="text-[#f1c44f]/60" />
                      Time
                    </p>
                    <p className="text-sm font-bold text-white">
                      {new Date(booking.trip?.departureTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                    </p>
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
          fallback={<div className="text-white">Loading statistics...</div>}
        >
          <BookingStatistics />
        </Suspense>
      </div>

      <div className="mt-10">
        <AutoCompleteBookings />
      </div>

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
