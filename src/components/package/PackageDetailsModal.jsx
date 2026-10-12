import React from "react";
import Modal from "@/components/ui/modal";
import {
  Package,
  Layers,
  Clock,
  Calendar,
  CheckCircle2,
  DollarSign,
  Tag,
  Edit,
} from "lucide-react";
import moment from "moment";
import PrimaryButton from "@/components/ui/buttons/primary-button";

export default function PackageDetailsModal({
  isOpen,
  onClose,
  packageData,
  onEdit,
}) {
  if (!packageData) return null;

  const rawFeatures = Array.isArray(packageData.features)
    ? packageData.features
    : typeof packageData.features === "string"
    ? packageData.features.split(",").map((f) => f.trim()).filter(Boolean)
    : [];

  const isActive = packageData.isActive !== false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Package Details"
      size="lg"
    >
      <div className="space-y-6 py-2">
        {/* Hero Card */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-blue-50/50 to-primary/5 dark:from-primary/20 dark:via-gray-800 dark:to-primary/10 border border-primary/20 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary text-white shadow-sm">
                  <Package className="w-5 h-5" />
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {packageData.name || "Untitled Package"}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {packageData.category?.name && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs">
                    <Tag className="w-3 h-3 text-primary" />
                    {packageData.category.name}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isActive ? "bg-emerald-600" : "bg-red-600"
                    }`}
                  />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Pricing Tag */}
            <div className="sm:text-right bg-white dark:bg-gray-800/90 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Package Price
              </div>
              <div className="text-3xl font-extrabold text-primary flex items-baseline sm:justify-end gap-1">
                <span>${packageData.price ?? 0}</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  /{packageData.duration || "One-Time"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {packageData.description && (
            <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {packageData.description}
              </p>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Category
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {packageData.category?.name || "General"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Billing Cycle
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {packageData.duration || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Created Date
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {packageData.createdAt
                  ? moment(packageData.createdAt).format("MMM DD, YYYY")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Features Checklist Card */}
        <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Included Features & Services
            </h4>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {rawFeatures.length} {rawFeatures.length === 1 ? "Feature" : "Features"}
            </span>
          </div>

          {rawFeatures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {rawFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100/80 dark:border-gray-700/50 hover:border-primary/30 transition-colors"
                >
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500 italic">
              No features specified for this package.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t dark:border-gray-800">
          <PrimaryButton variant="secondary" onClick={onClose}>
            Close
          </PrimaryButton>
          {onEdit && (
            <PrimaryButton
              onClick={() => {
                onClose();
                onEdit(packageData);
              }}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Package
            </PrimaryButton>
          )}
        </div>
      </div>
    </Modal>
  );
}
