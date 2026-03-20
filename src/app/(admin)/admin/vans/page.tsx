import { Suspense } from "react";
import Link from "next/link";
import { db } from "~/server/db";
import { vans } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function VansTable() {
  const allVans = await db.query.vans.findMany();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Van Name</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Plate Number</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Capacity</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allVans.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                No vans yet. Create one to get started.
              </td>
            </tr>
          ) : (
            allVans.map((van) => (
              <tr key={van.id} className="border-b border-[#f1c44f]/10 hover:bg-[#0a2540]/50 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{van.name}</td>
                <td className="px-6 py-4 text-gray-300">{van.plateNumber}</td>
                <td className="px-6 py-4 text-gray-300">{van.capacity} seats</td>
                <td className="px-6 py-4">
                  <Badge variant={van.status === "active" ? "default" : "secondary"} className="bg-[#f1c44f]/20 text-[#f1c44f] capitalize">
                    {van.status}
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

export default function VansPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Vans</h1>
          <p className="text-gray-400">Manage your fleet of vehicles</p>
        </div>
        <Button className="gap-2 bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90">
          <Plus size={20} />
          Add Van
        </Button>
      </div>

      <Card className="bg-[#0a2540] border-[#f1c44f]/20">
        <Suspense fallback={<div className="p-8 text-white">Loading vans...</div>}>
          <VansTable />
        </Suspense>
      </Card>
    </div>
  );
}
