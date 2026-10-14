/**
 * Print Utility for Invoices, Receipts, and Financial Statements
 * Opens an isolated invisible iframe with exact A4 portrait dimensions (794px width),
 * ensuring media queries (sm, md, lg) and flex/grid layouts do not collapse to 0px.
 * Automatically waits for fonts and images to load before opening print dialog.
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

  // Remove any previous print helper iframe
  const oldIframe = document.getElementById("print-invoice-iframe-helper");
  if (oldIframe) {
    oldIframe.remove();
  }

  // Create iframe with real A4 dimensions positioned off-screen
  // (Prevents browser 0px viewport collapse that crushes grids & flexbox)
  const iframe = document.createElement("iframe");
  iframe.id = "print-invoice-iframe-helper";
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // Standard A4 width at 96 DPI
  iframe.style.height = "1123px"; // Standard A4 height at 96 DPI
  iframe.style.border = "none";
  iframe.style.zIndex = "-9999";
  iframe.style.backgroundColor = "#ffffff";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // 1. Gather all current stylesheets from document
  const styleElements = Array.from(
    document.querySelectorAll("link[rel='stylesheet'], style")
  )
    .map((s) => s.outerHTML)
    .join("\n");

  // 2. Clone active CSS rules from stylesheets to avoid any network delay in iframe
  let inlineCssRules = "";
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (const rule of rules) {
            inlineCssRules += rule.cssText + "\n";
          }
        }
      } catch (e) {
        // Cross-origin stylesheet access restriction - handled by outerHTML link tags
      }
    }
  } catch (e) {
    // Ignore error
  }

  // Clone target element
  const clonedElement = el.cloneNode(true);

  // Remove any interactive buttons, copy icons or print:hidden from cloned content
  const buttonsToHide = clonedElement.querySelectorAll(
    "button, a[role='button'], .print\\:hidden, .no-print"
  );
  buttonsToHide.forEach((b) => b.remove());

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <base href="${window.location.origin}/" />
      <title>${title}</title>
      ${styleElements}
      ${inlineCssRules ? `<style id="inlined-document-rules">${inlineCssRules}</style>` : ""}
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
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
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          font-size: 13px !important;
          line-height: 1.5 !important;
          width: 100% !important;
          -webkit-font-smoothing: antialiased !important;
        }

        .invoice-print-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #111827 !important;
        }

        /* Clean Card Layout for Paper */
        #printable-order-invoice,
        #printable-capital-invoice,
        #printable-expense-voucher,
        #printable-executive-dividend,
        #printable-employee-payslip,
        .invoice-print-container > div {
          box-shadow: none !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 24px !important;
          background: #ffffff !important;
          color: #111827 !important;
          width: 100% !important;
          margin: 0 !important;
        }

        /* Preserve Flex Header */
        .flex, [class*="flex"] {
          display: flex !important;
        }
        .flex-col {
          flex-direction: column !important;
        }
        .sm\\:flex-row {
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
        }
        .justify-between {
          justify-content: space-between !important;
        }
        .items-center {
          align-items: center !important;
        }

        /* Meta Grid Layout: Force clean 4 columns on A4 paper */
        .grid.lg\\:grid-cols-4,
        .grid.sm\\:grid-cols-2 {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 12px !important;
        }

        /* 2-Column Grid (e.g. Signatures, 2-col info) */
        .grid.grid-cols-2,
        .grid.sm\\:grid-cols-2:not(.lg\\:grid-cols-4) {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 20px !important;
        }

        /* Table Formatting */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 8px !important;
          margin-bottom: 8px !important;
        }

        th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 8px 12px !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        td {
          padding: 10px 12px !important;
          font-size: 12px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          color: #1f2937 !important;
        }

        /* Avoid Awkward Page Cuts */
        tr, td, th,
        .grid,
        .signature-block,
        .calculation-box {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        /* Financial Summary Box on Right */
        .w-full.sm\\:w-80 {
          width: 290px !important;
          flex-shrink: 0 !important;
          background: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 14px !important;
        }

        /* Logos & Signatures */
        img {
          max-height: 48px !important;
          width: auto !important;
          object-fit: contain !important;
          display: block !important;
        }

        /* Signature styling */
        .h-12, .h-14, .sm\\:h-14 {
          height: 44px !important;
        }

        /* Hide buttons & copy handles */
        button,
        a[role="button"],
        .print\\:hidden,
        .no-print,
        [title="Copy"] {
          display: none !important;
        }

        /* High Contrast Text */
        .text-white {
          color: #111827 !important;
        }
        .text-gray-900 {
          color: #111827 !important;
        }
        .text-gray-800 {
          color: #1f2937 !important;
        }
        .text-gray-700 {
          color: #374151 !important;
        }
        .text-gray-500 {
          color: #6b7280 !important;
        }
        .text-gray-400 {
          color: #6b7280 !important;
        }

        /* Brand Colors & Badges */
        .text-primary {
          color: #e01a5c !important;
        }
        .text-emerald-600, .text-emerald-700, .text-emerald-800 {
          color: #059669 !important;
        }
        .text-red-600, .text-red-700, .text-red-800 {
          color: #dc2626 !important;
        }
        .text-amber-600, .text-amber-700, .text-amber-800 {
          color: #d97706 !important;
        }
        .text-violet-600, .text-violet-700, .text-violet-800 {
          color: #7c3aed !important;
        }
        .bg-emerald-100, .bg-emerald-50 {
          background-color: #ecfdf5 !important;
          color: #065f46 !important;
          border-color: #a7f3d0 !important;
        }
        .bg-amber-100, .bg-amber-50 {
          background-color: #fffbeb !important;
          color: #92400e !important;
          border-color: #fde68a !important;
        }
        .bg-red-100, .bg-red-50 {
          background-color: #fef2f2 !important;
          color: #991b1b !important;
          border-color: #fecaca !important;
        }
        .bg-violet-100, .bg-violet-50 {
          background-color: #f5f3ff !important;
          color: #5b21b6 !important;
          border-color: #ddd6fe !important;
        }
      </style>
    </head>
    <body>
      <div class="invoice-print-container">
        ${clonedElement.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Helper to ensure all images and fonts are loaded before triggering print dialog
  const executePrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.warn("Iframe print fallback to window.print():", err);
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 3000);
    }
  };

  // Wait for all images in the iframe to finish loading
  const images = Array.from(doc.images || []);
  const imagePromises = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  // Also check fonts ready if supported
  const fontPromise = doc.fonts?.ready || Promise.resolve();

  Promise.all([...imagePromises, fontPromise])
    .then(() => {
      setTimeout(executePrint, 250);
    })
    .catch(() => {
      setTimeout(executePrint, 350);
    });
};
