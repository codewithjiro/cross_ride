import { Suspense } from "react";
import { db } from "~/server/db";
import { TripsManager } from "~/components/admin/trips-manager";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function TripsPage() {
  const trips = await db.query.trips.findMany({
    with: {
      van: true,
      driver: true,
    },
  });

  const vans = await db.query.vans.findMany();
  const drivers = await db.query.drivers.findMany();

  return (
    <Suspense fallback={<div className="p-8 text-white">Loading trips...</div>}>
      <TripsManager initialTrips={trips} vans={vans} drivers={drivers} />
    </Suspense>
  );
}

export default TripsPage;
