import React from "react";
import Modal from "@/components/ui/modal";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  count = 1,
  itemName = "user",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete" size="md">
      <div className="flex flex-col items-center space-y-6 p-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Are you sure?
        </h3>
        <p className="text-center text-gray-700 dark:text-gray-300">
          You are about to delete{" "}
          <span className="font-semibold text-red-600">
            {count} {itemName}
            {count > 1 ? "s" : ""}
          </span>
          . This action cannot be undone.
        </p>

        <div className="flex w-full justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
