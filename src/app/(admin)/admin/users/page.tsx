import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Mail, Phone, Calendar, Shield } from "lucide-react";
import { UsersManager } from "~/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return <UsersManager initialUsers={users} />;
}
