import { Suspense } from "react";
import { db } from "~/server/db";
import { adminLogs } from "~/server/db/schema";
import { Card } from "~/components/ui/card";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Badge } from "~/components/ui/badge";
import { Shield } from "lucide-react";

async function LogsTable() {
  const logs = await db.query.adminLogs.findMany({
    with: {
      admin: true,
    },
    orderBy: (adminLogs, { desc }) => [desc(adminLogs.createdAt)],
    limit: 100,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Admin
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Action
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Resource
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Description
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                No activity logs yet.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50"
              >
                <td className="flex items-center gap-2 px-6 py-4 font-medium text-white">
                  <Shield size={16} className="text-[#f1c44f]" />
                  {log.admin?.firstName} {log.admin?.lastName}
                </td>
                <td className="px-6 py-4">
                  <Badge className="bg-[#f1c44f]/20 text-[#f1c44f] capitalize">
                    {log.action.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-300 capitalize">
                  {log.entityType}
                </td>
                <td className="max-w-xs truncate px-6 py-4 text-gray-300">
                  {log.description}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function LogsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Activity Logs</h1>
        <p className="text-gray-400">
          View all admin actions and system events
        </p>
      </div>

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading logs...</div>}
        >
          <LogsTable />
        </Suspense>
      </Card>
    </div>
  );
}
