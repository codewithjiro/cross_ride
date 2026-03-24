"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Mail, Phone, Calendar, Shield, Crown } from "lucide-react";
import type { User } from "~/server/db/schema";

interface UsersManagerProps {
  initialUsers: User[];
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  const adminUsers = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role === "user");

  const handlePromoteToAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to promote this user to Admin?"))
      return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/promote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to promote user");
        setLoading(false);
        return;
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)),
      );
    } catch (error) {
      alert("Error promoting user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const UserCard = ({ user }: { user: User }) => {
    const createdAtFormatted = new Date(user.createdAt).toLocaleString(
      "en-US",
      {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    );
    const memberSince = new Date(user.createdAt).getFullYear();

    return (
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6 transition-all hover:border-[#f1c44f]/40">
        <div className="flex flex-col gap-6">
          {/* Header with Name and Role */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <Badge
              className={`capitalize ${
                user.role === "admin"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {user.role}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Email */}
            <div className="flex flex-col">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <Mail size={14} />
                Email
              </p>
              <p className="mt-2 text-sm break-all text-gray-300">
                {user.email}
              </p>
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <Phone size={14} />
                Phone
              </p>
              <p className="mt-2 text-sm text-gray-300">
                {user.phoneNumber || "Not provided"}
              </p>
            </div>

            {/* Joined Date */}
            <div className="flex flex-col">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <Calendar size={14} />
                Joined
              </p>
              <p className="mt-2 text-sm text-gray-300">{createdAtFormatted}</p>
            </div>

            {/* Member Since */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Member Since
              </p>
              <p className="mt-2 text-lg font-semibold text-[#f1c44f]">
                {memberSince}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {user.role === "user" && (
            <div className="flex gap-2">
              <Button
                onClick={() => handlePromoteToAdmin(user.id)}
                disabled={loading}
                className="gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                <Crown size={18} />
                Promote to Admin
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Users</h1>
        <p className="text-gray-400">
          Manage all registered users in the system
        </p>
      </div>

      {/* Admins Section */}
      {adminUsers.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield size={24} className="text-red-400" />
            <h2 className="text-2xl font-bold text-white">
              Administrators ({adminUsers.length})
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {adminUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {adminUsers.length > 0 && regularUsers.length > 0 && (
        <div className="my-8 border-t border-[#f1c44f]/20" />
      )}

      {/* Regular Users Section */}
      {regularUsers.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Mail size={24} className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              Users ({regularUsers.length})
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {regularUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && (
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 text-center">
          <p className="text-gray-400">No users found.</p>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-4xl font-bold text-[#f1c44f]">{users.length}</p>
        </Card>
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <p className="text-sm text-gray-400">Admins</p>
          <p className="text-4xl font-bold text-red-400">{adminUsers.length}</p>
        </Card>
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <p className="text-sm text-gray-400">Regular Users</p>
          <p className="text-4xl font-bold text-blue-400">
            {regularUsers.length}
          </p>
        </Card>
      </div>
    </div>
  );
}
