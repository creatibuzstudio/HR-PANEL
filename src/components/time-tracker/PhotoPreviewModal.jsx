import React from "react";
import Modal from "@/components/ui/modal";
import { CheckCircle2, Calendar, User, Clock, ShieldCheck } from "lucide-react";
import moment from "moment";

export default function PhotoPreviewModal({ isOpen, onClose, data }) {
  if (!data || !data.photo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Identity & Camera Verification Snap" size="default">
      <div className="space-y-4">
        {/* Photo Container */}
        <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md">
          <img
            src={data.photo}
            alt="Verification Snapshot"
            className="w-full h-full object-contain"
          />

          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Camera Snapshot
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Employee</span>
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-primary" />
              {data.userName || "Team Member"}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Snapshot Type</span>
            <span
              className={`inline-block font-bold mt-0.5 uppercase text-[11px] ${
                data.type === "CLOCK_IN" ? "text-emerald-500" : "text-purple-500"
              }`}
            >
              {data.type === "CLOCK_IN" ? "Clock In Snapshot" : "Clock Out Snapshot"}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Timestamp</span>
            <span className="font-mono text-gray-700 dark:text-gray-300 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {data.timestamp ? moment(data.timestamp).format("MMM DD, YYYY hh:mm A") : "—"}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Shift Date</span>
            <span className="font-bold text-gray-700 dark:text-gray-300 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {data.date || moment().format("YYYY-MM-DD")}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t dark:border-gray-800 flex items-center justify-between">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Dashboard Face Match Score</span>
            <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {data.faceMatchScore ? `${data.faceMatchScore}% Match (Min 40% Quota Passed)` : "Verified"}
            </span>
          </div>
        </div>

        {data.note && (
          <div className="p-3 rounded-xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Note</span>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{data.note}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
