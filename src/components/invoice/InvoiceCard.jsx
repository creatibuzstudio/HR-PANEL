import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Box,
  Download,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import PrimaryButton from "@/components/ui/buttons/primary-button";
import ModernPdfGenerator from "@/components/ui/pdf/ModernPdfGenerator";
import moment from "moment";

export default function InvoiceCard({ invoice }) {
  const [isOpen, setIsOpen] = useState(false);

  // Status color mapping for the badge
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const INVOICE_TYPE_OPTIONS = [
    { label: "One Time", value: "one_time" },
    { label: "Subscription", value: "subscription" },
  ];

  // Prepare data for PDF
  const pdfData = [
    { label: "Customer Name", value: invoice?.customer_name || "N/A" },
    { label: "Email", value: invoice?.customer_email || "N/A" },
    { label: "Phone", value: invoice?.customer_phone || "N/A" },
    { label: "Address", value: invoice?.customer_address || "N/A" },
    { label: "Status", value: invoice?.status || "Pending" },
    {
      label: "Issue Date",
      value: invoice?.issue_date
        ? moment(invoice.issue_date).format("MMM DD, YYYY")
        : "N/A",
    },

    // Financials
    {
      label: "Discount",
      value: `${invoice?.discount_amount || "0.00"} ${invoice?.currency || ""}`,
    },
    {
      label: "Tax",
      value: `${invoice?.tax_amount || "0.00"} ${invoice?.currency || ""}`,
    },
    {
      label: "Total Due",
      value: `${invoice?.due_amount || "0.00"} ${invoice?.currency || ""}`,
    },
    {
      label: "Total Paid",
      value: `${invoice?.paid_amount || "0.00"} ${invoice?.currency || ""}`,
    },

    // Metadata (Location)
    {
      label: "Division",
      value:
        invoice?.metadata?.division_name ||
        invoice?.metadata?.division_Name ||
        "N/A",
    },
    {
      label: "District",
      value: invoice?.metadata?.district_name || "N/A",
    },
  ];

  return (
    <>
      {/* Header Row */}
      <TableRow
        className={`cursor-pointer hover:bg-muted/50 ${isOpen ? "bg-muted/50" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {invoice?.customer_name || "N/A"}
            </span>
            <span className="text-xs text-gray-500">
              {invoice?.customer_email}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <span className="font-mono text-xs text-gray-600">
            {invoice?.invoice_number}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">
            {invoice?.issue_date
              ? moment(invoice.issue_date).format("MMM DD, YYYY")
              : "N/A"}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">
            {INVOICE_TYPE_OPTIONS.find(
              (option) => option.value === invoice?.invoice_type,
            )?.label || "N/A"}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider border inline-flex ${getStatusBadgeColor(invoice?.status)}`}
          >
            {invoice?.status || "pending"}
          </span>
        </TableCell>
        <TableCell className="text-right font-medium">
          {invoice?.subtotal || "0.00"} {invoice?.currency}
        </TableCell>
        <TableCell>
          <div
            className="flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ModernPdfGenerator
              data={pdfData}
              items={invoice?.items || []}
              title="INVOICE"
              invoiceNumber={invoice?.invoice_number}
              fileName={`invoice_${invoice?.invoice_number || "details"}`}
              size="icon"
              className="inline-flex items-center justify-center rounded-full p-1.5 bg-gray-100"
            >
              <Download className="w-4 h-4 text-gray-600 hover:text-white" />
            </ModernPdfGenerator>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-1.5 bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Details Row */}
      {isOpen && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="p-0 border-b">
            <div className="p-5 bg-gray-50/50 border-t border-gray-100 shadow-inner">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-4">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200/50 pb-1">
                    Customer Info
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2" title="Email">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="truncate">
                        {invoice?.customer_email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2" title="Phone">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span>{invoice?.customer_phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Associated Information (Financials) */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200/50 pb-1">
                    Payment Info
                  </h4>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        {invoice?.subtotal || "0.00"} {invoice?.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Discount:</span>
                      <span>
                        -{invoice?.discount_amount || "0.00"}{" "}
                        {invoice?.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>Tax:</span>
                      <span>
                        +{invoice?.tax_amount || "0.00"} {invoice?.currency}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
                      <span>Total Due:</span>
                      <span>
                        {invoice?.due_amount || "0.00"} {invoice?.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Total Paid:</span>
                      <span>
                        {invoice?.paid_amount || "0.00"} {invoice?.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping / Address */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200/50 pb-1">
                    Billing Address
                  </h4>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
                    <span className="leading-tight">
                      {invoice?.customer_address}
                      {invoice?.customer_city && `, ${invoice.customer_city}`}
                    </span>
                  </div>
                </div>

                {/* Order Status & Dates */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200/50 pb-1">
                    Invoice Details
                  </h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        Issued:{" "}
                        {invoice?.issue_date
                          ? moment(invoice.issue_date).format("MMM DD, YYYY")
                          : "N/A"}
                      </span>
                    </div>
                    {invoice?.paid_at && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          Paid: {moment(invoice.paid_at).format("MMM DD, YYYY")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div onClick={(e) => e.stopPropagation()}>
                        <ModernPdfGenerator
                          data={pdfData}
                          items={invoice?.items || []}
                          title="INVOICE"
                          invoiceNumber={invoice?.invoice_number}
                          fileName={`invoice_${invoice?.invoice_number || "details"}`}
                          size="sm"
                          className="flex items-center gap-2 text-xs h-8 bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                        >
                          <Download className="w-3 h-3" />
                          Download Invoice
                        </ModernPdfGenerator>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Data - Separate Highlighted Section */}
              {(invoice?.metadata?.division_name ||
                invoice?.metadata?.division_Name ||
                invoice?.metadata?.district_name) && (
                <div className="mb-6 mt-2 rounded-xl border-2 border-blue-200 bg-blue-50/70 px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Division */}
                    {(invoice?.metadata?.division_name ||
                      invoice?.metadata?.division_Name) && (
                      <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-300 shadow-xs">
                        Division:&nbsp;
                        <span className="uppercase tracking-wide">
                          {invoice?.metadata?.division_name ||
                            invoice?.metadata?.division_Name}
                        </span>
                      </span>
                    )}
                    {/* District */}
                    {invoice?.metadata?.district_name && (
                      <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-300 shadow-xs">
                        District:&nbsp;
                        <span className="uppercase tracking-wide">
                          {invoice?.metadata?.district_name}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Products Included */}
              <div className="rounded-md border border-gray-200">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                  <Box className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Items Included
                  </h4>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[45%]">Item Details</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice?.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {item?.item_name || "Product Name"}
                            </span>
                            {item?.description && (
                              <span className="text-xs text-gray-500 line-clamp-1">
                                {item?.description}
                              </span>
                            )}
                            {/* Item metadata: date_range, duration */}
                            {(item?.metadata || item?.duration_months) && (
                              <div className="mt-1 text-xs text-gray-500">
                                {item?.metadata?.date_range && (
                                  <span className="block">
                                    Period: {item.metadata.date_range}
                                  </span>
                                )}
                                {(item?.duration_months ??
                                  item?.metadata?.duration_months) && (
                                  <span>
                                    Duration:{" "}
                                    {item?.duration_months ??
                                      item?.metadata?.duration_months}{" "}
                                    month
                                    {(item?.duration_months ??
                                      item?.metadata?.duration_months) > 1
                                      ? "s"
                                      : ""}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item?.quantity || 1}
                        </TableCell>
                        <TableCell className="text-right">
                          {item?.unit_price || "0.00"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item?.total || item?.subtotal || "0.00"}{" "}
                          {invoice?.currency}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!invoice?.items || invoice?.items?.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center h-24 text-gray-500"
                        >
                          No items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
