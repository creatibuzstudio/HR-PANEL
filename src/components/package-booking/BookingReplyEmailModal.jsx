import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal.jsx";
import PrimaryButton from "@/components/ui/buttons/primary-button.jsx";
import SimpleRichTextEditor from "@/components/ui/simple-rich-text-editor.jsx";
import { Mail, Send, Sparkles, Briefcase, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { useSendBookingReplyEmailMutation } from "@/services/package-booking/packageBookingApiSlice.js";
import { STATUS_OPTIONS } from "@/components/package-booking/PackageBookingForm.jsx";

export default function BookingReplyEmailModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) {
  const [subject, setSubject] = useState("");
  const [senderName, setSenderName] = useState("Md Abdul Hakim - Creatibuz Studio");
  const [newStatus, setNewStatus] = useState("");
  const [content, setContent] = useState("");
  const [sendReplyEmail, { isLoading }] = useSendBookingReplyEmailMutation();

  useEffect(() => {
    if (booking && isOpen) {
      const pkgName = booking.package?.name || "Service Package";
      setSubject(`Update regarding your ${pkgName} booking with Creatibuz Studio`);
      setNewStatus(booking.status || "CONFIRMED");

      const defaultTemplate = `
        <p>Dear ${booking.name || "Valued Client"},</p>
        <p>Thank you for choosing <strong>Creatibuz Studio</strong>. We are pleased to confirm that we have received your booking request for the <strong>${pkgName}</strong> (${booking.billingCycle || "Standard"} cycle).</p>
        
        <p>Our team is currently preparing the next steps for onboarding and kickoff. If you have any specific requirements, brand guidelines, or immediate questions, please feel free to reply directly to this email.</p>
        
        <p>You can also reach out to our team directly via WhatsApp anytime: <a href="https://wa.me/+8801968657353" style="color: #25d366; font-weight: bold;">+880 1968 657353</a>.</p>
        
        <br/>
        <p>Warm regards,</p>
        <p><strong>Md Abdul Hakim</strong><br/>
        Founder & CEO, Creatibuz Studio<br/>
        <a href="https://creatibuzstudio.com">creatibuzstudio.com</a></p>
      `;
      setContent(defaultTemplate);
    }
  }, [booking, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recipientEmail = booking?.userEmail || booking?.companyEmail;
    if (!recipientEmail) {
      toast.error("Booking does not have a valid client email.");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please provide an email subject.");
      return;
    }

    if (!content.trim()) {
      toast.error("Please provide email body content.");
      return;
    }

    try {
      await sendReplyEmail({
        bookingId: booking.id,
        to: recipientEmail,
        subject: subject.trim(),
        message: content,
        senderName: senderName.trim() || "Creatibuz Studio",
        newStatus: newStatus || undefined,
      }).unwrap();

      toast.success(`Reply email successfully sent to ${recipientEmail}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to send reply email:", err);
      toast.error(
        err?.data?.message || err?.message || "Failed to send reply email"
      );
    }
  };

  if (!isOpen || !booking) return null;

  const pkg = booking.package;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-gray-900 dark:text-white">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-lg">Send Email to Client</div>
            <div className="text-xs text-gray-500 font-normal">
              Compose & send client reply via Hostinger SMTP (info@creatibuzstudio.com)
            </div>
          </div>
        </div>
      }
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {/* Recipient & Booking Details Banner */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {booking.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{booking.name}</span>
                {booking.whatsappNumber && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Phone className="w-3 h-3" />
                    {booking.whatsappNumber}
                  </span>
                )}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {booking.userEmail} {booking.companyName ? `• ${booking.companyName}` : ""}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {pkg?.name || "Package Booking"}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {booking.billingCycle || "Monthly"}
            </span>
          </div>
        </div>

        {/* Sender Name, Status Update & Subject Line */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Sender Name
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
              placeholder="e.g. Md Abdul Hakim"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Update Status After Sending
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
            >
              <option value="">Keep current ({booking.status || "PENDING"})</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Set status to: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
              placeholder="Enter email subject"
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Message Body <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Pre-filled with booking details
            </span>
          </div>

          <SimpleRichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Type your reply message to the client here..."
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <PrimaryButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            {isLoading ? "Sending Email..." : "Send Client Email"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
