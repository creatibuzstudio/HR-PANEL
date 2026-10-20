import React from "react";
import Modal from "@/components/ui/modal.jsx";
import PrimaryButton from "@/components/ui/buttons/primary-button.jsx";
import {
  Mail,
  MessageSquare,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  Send,
  User,
  Copy,
  CheckCircle2,
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

export default function ContactDetailsModal({
  isOpen,
  onClose,
  contact,
  onOpenFollowUp,
}) {
  if (!isOpen || !contact) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const whatsappClean = contact.whatsapp
    ? contact.whatsapp.replace(/[^0-9+]/g, "")
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-gray-900 dark:text-white">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-lg">Inquiry Details</div>
            <div className="text-xs text-gray-500 font-normal">
              Customer consultation inquiry submitted via website
            </div>
          </div>
        </div>
      }
      size="2xl"
    >
      <div className="space-y-6 pt-2">
        {/* Header Profile Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                contact.fullName || "Lead"
              )}&background=FE5A00&color=fff&size=128`}
              alt={contact.fullName}
              className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
            />
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {contact.fullName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Inquiry ID: <span className="font-mono text-gray-700 dark:text-gray-300">{contact.id?.slice(0, 8)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                contact.status === "REPLIED"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {contact.status || "PENDING"}
            </span>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                Email Address
              </span>
              <button
                onClick={() => copyToClipboard(contact.email, "Email")}
                className="hover:text-primary transition cursor-pointer"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <a
              href={`mailto:${contact.email}`}
              className="block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {contact.email}
            </a>
          </div>

          {/* WhatsApp Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                WhatsApp
              </span>
              {whatsappClean && (
                <button
                  onClick={() => copyToClipboard(contact.whatsapp, "WhatsApp number")}
                  className="hover:text-primary transition cursor-pointer"
                  title="Copy Phone"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {whatsappClean ? (
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{contact.whatsapp}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-sm text-gray-400">Not provided</span>
            )}
          </div>

          {/* Budget Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Project Budget
            </span>
            <div className="text-sm font-bold text-primary">
              {contact.budget || "N/A"}
            </div>
          </div>

          {/* Date Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              Submitted Date
            </span>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {contact.createdAt
                ? moment(contact.createdAt).format("MMM DD, YYYY - hh:mm A")
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Project & Requirement Details
          </label>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {contact.productDetails || "No details provided."}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div>
            {whatsappClean && (
              <a
                href={`https://wa.me/${whatsappClean}?text=Hello%20${encodeURIComponent(
                  contact.fullName
                )},%20this%20is%20Creatibuz%20Studio%20following%20up%20on%20your%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition cursor-pointer"
            >
              Close
            </button>

            <PrimaryButton
              onClick={() => {
                onClose();
                if (onOpenFollowUp) onOpenFollowUp(contact);
              }}
              className="flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Follow-up Email</span>
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
