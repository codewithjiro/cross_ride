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
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Email</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Phone</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">License</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allDrivers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                No drivers yet. Add your first driver to get started.
              </td>
            </tr>
          ) : (
            allDrivers.map((driver) => (
              <tr key={driver.id} className="border-b border-[#f1c44f]/10 hover:bg-[#0a2540]/50 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{driver.name}</td>
                <td className="px-6 py-4 text-gray-300">{driver.email}</td>
                <td className="px-6 py-4 text-gray-300">{driver.phoneNumber}</td>
                <td className="px-6 py-4 text-gray-300 text-xs">{driver.licenseNumber.slice(0, 6)}...</td>
                <td className="px-6 py-4">
                  <Badge variant={driver.status === "active" ? "default" : "secondary"} className="bg-[#f1c44f]/20 text-[#f1c44f] capitalize">
                    {driver.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">
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

      <Card className="bg-[#0a2540] border-[#f1c44f]/20">
        <Suspense fallback={<div className="p-8 text-white">Loading drivers...</div>}>
          <DriversTable />
        </Suspense>
      </Card>
    </div>
  );
}
