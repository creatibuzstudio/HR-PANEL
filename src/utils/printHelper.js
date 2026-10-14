/**
 * Print Utility for Invoices, Receipts, and Financial Statements
 * Opens an isolated invisible iframe with pure A4 portrait styling,
 * avoiding viewport clipping, overflow-hidden constraints, or dark-mode distortion.
 */

export const printElement = (elementOrId, title = "Creatibuz Studio Document") => {
  const el =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (!el) {
    window.print();
    return;
  }

  // Remove any stale print helper iframe
  const oldIframe = document.getElementById("print-invoice-iframe-helper");
  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "print-invoice-iframe-helper";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Collect all current stylesheets (Tailwind, fonts, custom CSS)
  const styleTags = Array.from(
    document.querySelectorAll("link[rel='stylesheet'], style")
  )
    .map((s) => s.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${styleTags}
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm 12mm;
        }
        *, *::before, *::after {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #111827 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 13px !important;
          line-height: 1.45 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        .invoice-print-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 8px 0 !important;
          background: #ffffff !important;
          color: #111827 !important;
        }
        /* Override dark mode background / text to paper-friendly high-contrast */
        .dark,
        [class*="dark:bg-"],
        [class*="dark:border-"] {
          background-color: transparent !important;
          border-color: #e5e7eb !important;
        }
        [class*="dark:text-"] {
          color: inherit !important;
        }
        .text-white {
          color: #111827 !important;
        }
        /* Keep brand badges and colored tags legible */
        .bg-emerald-100, .bg-emerald-50, [class*="bg-emerald-"] {
          background-color: #ecfdf5 !important;
          color: #065f46 !important;
          border-color: #a7f3d0 !important;
        }
        .bg-amber-100, .bg-amber-50, [class*="bg-amber-"] {
          background-color: #fffbeb !important;
          color: #92400e !important;
          border-color: #fde68a !important;
        }
        .bg-violet-100, .bg-violet-50, [class*="bg-violet-"] {
          background-color: #f5f3ff !important;
          color: #5b21b6 !important;
          border-color: #ddd6fe !important;
        }
        .bg-red-100, .bg-red-50, [class*="bg-red-"] {
          background-color: #fef2f2 !important;
          color: #991b1b !important;
          border-color: #fecaca !important;
        }
        .bg-gray-50, .bg-gray-100, [class*="bg-gray-"] {
          background-color: #f9fafb !important;
          color: #111827 !important;
        }
        /* Table formatting */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        tr, td, th {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Card borders */
        .border, [class*="border-"] {
          border-color: #e5e7eb !important;
        }
        /* Hide buttons, interactive elements, scrollbars */
        button, a[role="button"], .print\\:hidden, .no-print {
          display: none !important;
        }
        /* Ensure logo images render cleanly */
        img {
          max-width: 100% !important;
          display: block !important;
        }
      </style>
    </head>
    <body>
      <div class="invoice-print-container">
        ${el.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Delay slightly to let browser layout fonts & images in the iframe
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.warn("Iframe print fallback triggered:", err);
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2000);
    }
  }, 350);
};
