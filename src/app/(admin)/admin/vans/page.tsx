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
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Van Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Plate Number
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Capacity
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {allVans.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                No vans yet. Create one to get started.
              </td>
            </tr>
          ) : (
            allVans.map((van) => (
              <tr
                key={van.id}
                className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50"
              >
                <td className="px-6 py-4 font-medium text-white">{van.name}</td>
                <td className="px-6 py-4 text-gray-300">{van.plateNumber}</td>
                <td className="px-6 py-4 text-gray-300">
                  {van.capacity} seats
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

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading vans...</div>}
        >
          <VansTable />
        </Suspense>
      </Card>
    </div>
  );
}
