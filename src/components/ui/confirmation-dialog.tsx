"use client";

import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  showReasonInput?: boolean;
  reasonValue?: string;
  onReasonChange?: (value: string) => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  showReasonInput = false,
  reasonValue = "",
  onReasonChange,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-sm text-gray-300">{description}</p>

        {showReasonInput && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Reason for cancellation
            </label>
            <textarea
              value={reasonValue}
              onChange={(e) => onReasonChange?.(e.target.value)}
              disabled={isLoading}
              placeholder="Please provide a reason for cancelling this trip..."
              className="w-full rounded border border-[#f1c44f]/30 bg-[#071d3a] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none disabled:opacity-50"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 gap-2 ${
              isDangerous
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
            } disabled:opacity-50`}
            variant={isDangerous ? "outline" : "default"}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1 border-[#f1c44f]/50 text-[#f1c44f] hover:bg-[#f1c44f]/10 disabled:opacity-50"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}
