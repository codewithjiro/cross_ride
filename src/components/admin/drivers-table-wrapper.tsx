"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, Trash2, Mail, Phone } from "lucide-react";
import { Card } from "~/components/ui/card";
import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";
import { EditDriverModal } from "./edit-driver-modal";

interface Driver {
  id: number;
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  experience?: string;
  specialization?: string;
  profileImage?: string;
}

export function DriversTableWrapper({
  drivers: initialDrivers,
}: {
  drivers: Driver[];
}) {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteError, setDeleteError] = useState<string>("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Refetch drivers when refreshKey changes
  useEffect(() => {
    if (refreshKey === 0) return;

    const fetchDrivers = async () => {
      try {
        const response = await fetch("/api/admin/drivers");
        if (response.ok) {
          const data = await response.json();
          setDrivers(data);
        }
      } catch (err) {
        console.error("Error fetching drivers:", err);
      }
    };

    fetchDrivers();
  }, [refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
  };

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/drivers/${driverToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setDeleteError(data.error || "Failed to delete driver");
        setDeleteConfirmOpen(false); // Close confirmation dialog
        setShowErrorDialog(true); // Show error dialog
        setIsDeleting(false);
        return;
      }

      setDrivers(drivers.filter((d) => d.id !== driverToDelete.id));
      setDeleteConfirmOpen(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error deleting driver";
      setDeleteError(errorMsg);
      setDeleteConfirmOpen(false); // Close confirmation dialog
      setShowErrorDialog(true); // Show error dialog
    } finally {
      setIsDeleting(false);
      setDriverToDelete(null);
    }
  };

  const handleRefreshDrivers = () => {
    setEditingDriver(null);
    setDrivers(
      drivers.map((d) => (d.id === editingDriver?.id ? editingDriver : d)),
    );
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  if (drivers.length === 0) {
    return (
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 text-center">
        <p className="text-gray-400">
          No drivers yet. Add your first driver to get started.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card
            key={driver.id}
            className="border-[#f1c44f]/20 bg-[#0a2540] p-4 transition-all hover:border-[#f1c44f]/40 hover:shadow-lg hover:shadow-[#f1c44f]/10"
          >
            {/* Driver Profile Image */}
            <div className="mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-black/30">
              {driver.profileImage ? (
                <Image
                  src={driver.profileImage}
                  alt={`${driver.firstName} ${driver.surname}`}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#1a3a5c] text-4xl font-bold text-[#f1c44f]">
                  {driver.firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Driver Info */}
            <div className="mb-4 space-y-2">
              <h3 className="text-lg font-bold text-white">
                {driver.firstName}{" "}
                {driver.middleName ? `${driver.middleName} ` : ""}
                {driver.surname}
              </h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  <span className="text-gray-300">Experience:</span>{" "}
                  {driver.experience || "—"}
                </p>
                <p>
                  <span className="text-gray-300">Specialty:</span>{" "}
                  {driver.specialization || "—"}
                </p>
              </div>

              {/* Email and Phone */}
              <div className="border-t border-[#f1c44f]/10 pt-2">
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={14} className="text-gray-400" /> {driver.email}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={14} className="text-gray-400" />{" "}
                  {driver.phoneNumber}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(driver)}
                className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
              >
                <Edit size={16} className="mr-1 inline" /> Edit
              </button>
              <button
                onClick={() => handleDeleteClick(driver)}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={16} className="mr-1 inline" /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      <EditDriverModal
        isOpen={editingDriver !== null}
        driver={editingDriver}
        onClose={() => setEditingDriver(null)}
        onSuccess={() => {
          triggerRefresh();
          setEditingDriver(null);
        }}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Delete Driver"
        description={`Are you sure you want to delete ${driverToDelete?.firstName} ${driverToDelete?.surname}? This action cannot be undone.`}
        confirmText="Delete Driver"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md border-red-500/30 bg-[#0a2540] p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-red-400">
                Cannot Delete Driver
              </h2>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-300">{deleteError}</p>
            </div>
            <button
              onClick={() => {
                setShowErrorDialog(false);
                setDeleteConfirmOpen(false);
                setDeleteError("");
              }}
              className="w-full rounded-lg bg-red-500/20 px-4 py-2 font-semibold text-red-400 transition-colors hover:bg-red-500/30"
            >
              OK
            </button>
          </Card>
        </div>
      )}
    </>
  );
}
