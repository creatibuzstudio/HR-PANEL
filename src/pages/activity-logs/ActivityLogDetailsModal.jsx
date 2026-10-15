import React from "react";
import Modal from "@/components/ui/modal";
import { Copy, Shield, CheckCircle2, Clock, Globe, Laptop, Terminal, AlertCircle } from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

export default function ActivityLogDetailsModal({ isOpen, onClose, log }) {
  if (!log) return null;

  const copyDetails = () => {
    try {
      const text = JSON.stringify(log, null, 2);
      navigator.clipboard.writeText(text);
      toast.success("Log payload copied to clipboard");
    } catch {
      toast.error("Failed to copy payload");
    }
  };

  let formattedDetails = null;
  if (log.details) {
    try {
      const parsed = typeof log.details === "string" ? JSON.parse(log.details) : log.details;
      formattedDetails = JSON.stringify(parsed, null, 2);
    } catch {
      formattedDetails = String(log.details);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activity Log Deep-Dive" size="lg">
      <div className="space-y-4 text-xs">
        {/* Top Summary Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {log.userName?.charAt(0) || "U"}
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">
                {log.userName || "System User"}
              </div>
              <div className="text-gray-500 text-[11px]">
                {log.userEmail || "No Email Associated"} •{" "}
                <span className="uppercase font-semibold text-primary">{log.userRole || "Admin"}</span>
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
              log.status === "FAILED"
                ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                : log.status === "WARNING"
                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {log.status || "SUCCESS"}
          </span>
        </div>

        {/* Narrative Description */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">
            Operation Description
          </span>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
            {log.description}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Action Type</span>
            <span className="font-mono font-bold text-primary text-xs mt-0.5 block">{log.action}</span>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Module Category</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-xs mt-0.5 block">{log.module}</span>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Exact Timestamp</span>
            <span className="font-mono text-gray-700 dark:text-gray-300 text-xs mt-0.5 block">
              {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Client IP Address</span>
            <span className="font-mono text-gray-700 dark:text-gray-300 text-xs mt-0.5 block flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-500" />
              {log.ipAddress || "127.0.0.1"}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">User Agent / Client Device</span>
            <span className="text-gray-600 dark:text-gray-400 text-xs mt-0.5 block truncate flex items-center gap-1" title={log.userAgent}>
              <Laptop className="w-3 h-3 text-indigo-500 flex-shrink-0" />
              {log.userAgent || "Desktop Browser"}
            </span>
          </div>
        </div>

        {/* JSON Payload Details */}
        {formattedDetails && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                Contextual Event Payload / Metadata
              </span>
              <button
                type="button"
                onClick={copyDetails}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Copy JSON
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-gray-900 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-gray-800">
              {formattedDetails}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
