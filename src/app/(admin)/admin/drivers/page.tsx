import { Suspense } from "react";
import { db } from "~/server/db";
import { drivers } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

async function DriversTable() {
  const allDrivers = await db.query.drivers.findMany();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Email
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Phone
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              License
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {allDrivers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                No drivers yet. Add your first driver to get started.
              </td>
            </tr>
          ) : (
            allDrivers.map((driver) => (
              <tr
                key={driver.id}
                className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {driver.name}
                </td>
                <td className="px-6 py-4 text-gray-300">{driver.email}</td>
                <td className="px-6 py-4 text-gray-300">
                  {driver.phoneNumber}
                </td>
                <td className="px-6 py-4 text-xs text-gray-300">
                  {driver.licenseNumber.slice(0, 6)}...
                </td>
                <td className="flex gap-2 px-6 py-4">
                  <button className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/20">
                    <Edit size={18} />
                  </button>
                  <button className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function DriversPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Drivers</h1>
          <p className="text-gray-400">Manage your transport team</p>
        </div>
        <Button className="gap-2 bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90">
          <Plus size={20} />
          Add Driver
        </Button>
      </div>

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading drivers...</div>}
        >
          <DriversTable />
        </Suspense>
      </Card>
    </div>
  );
}
