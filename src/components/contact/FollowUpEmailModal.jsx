import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal.jsx";
import PrimaryButton from "@/components/ui/buttons/primary-button.jsx";
import SimpleRichTextEditor from "@/components/ui/simple-rich-text-editor.jsx";
import { Mail, Send, User, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useSendFollowUpEmailMutation } from "@/services/contact/contactApiSlice.js";

export default function FollowUpEmailModal({ isOpen, onClose, contact, onSuccess }) {
  const [subject, setSubject] = useState("");
  const [senderName, setSenderName] = useState("Md Abdul Hakim - Creatibuz Studio");
  const [content, setContent] = useState("");
  const [sendFollowUp, { isLoading }] = useSendFollowUpEmailMutation();

  useEffect(() => {
    if (contact && isOpen) {
      setSubject(`Re: Your Project Consultation with Creatibuz Studio`);
      
      const defaultTemplate = `
        <p>Dear ${contact.fullName || "Valued Client"},</p>
        <p>Thank you for reaching out to <strong>Creatibuz Studio</strong>. We have carefully reviewed your project details regarding your <strong>${contact.budget || "specified"}</strong> budget range:</p>
        <blockquote style="border-left: 3px solid #FE5A00; padding-left: 12px; color: #555; margin: 12px 0; font-style: italic;">
          "${contact.productDetails || ""}"
        </blockquote>
        <p>Our team specializes in high-impact UI/UX design, modern full-stack development, and scalable AI solutions. We would love to discuss how we can bring your concept to reality.</p>
        <p>Would you be available for a brief 15-minute discovery call this week? Alternatively, feel free to reply directly to this email or reach us via WhatsApp at <strong>+880 1968 657353</strong>.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>Md Abdul Hakim</strong><br/>
        Founder & CEO, Creatibuz Studio<br/>
        <a href="https://creatibuzstudio.com">creatibuzstudio.com</a></p>
      `;
      setContent(defaultTemplate);
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact?.email) {
      toast.error("Contact does not have a valid email address.");
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
      await sendFollowUp({
        contactId: contact.id,
        to: contact.email,
        subject: subject.trim(),
        message: content,
        senderName: senderName.trim() || "Creatibuz Studio",
      }).unwrap();

      toast.success(`Follow-up email successfully sent to ${contact.email}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to send follow-up email:", err);
      toast.error(
        err?.data?.message || err?.message || "Failed to send follow-up email"
      );
    }
  };

  if (!isOpen || !contact) return null;

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
            <div className="font-bold text-lg">Send Follow-up Email</div>
            <div className="text-xs text-gray-500 font-normal">
              Compose & send client follow-up via Hostinger SMTP (info@creatibuz.com)
            </div>
          </div>
        </div>
      }
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {/* Recipient Details Banner */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {contact.fullName?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {contact.fullName}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                {contact.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Budget:</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {contact.budget || "Not Specified"}
            </span>
          </div>
        </div>

        {/* Sender Name & Subject Line */}
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

          <div className="sm:col-span-2">
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
              Email Body (Rich Text Editor) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Pre-filled with inquiry context
            </span>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <SimpleRichTextEditor
              value={content}
              onChange={(newVal) => setContent(newVal)}
              height={320}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </button>

          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? "Sending Email..." : "Send Follow-up Email"}</span>
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
