// javascript
import PrimaryButton from "@/components/ui/buttons/primary-button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * ModernPdfGenerator Component
 *
 * Generates professional PDF invoices with proper text positioning
 */
const ModernPdfGenerator = ({
  data = [],
  items = [],
  title = "INVOICE",
  invoiceNumber = "",
  fileName = "invoice",
  children,
  className = "",
  ...props
}) => {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Modern Color Palette
    const colors = {
      primary: "#180d05",
      secondary: "#fff7ed",
      accent: "#f9570c",
      text: "#374151",
      lightText: "#6b7280",
      white: "#ffffff",
    };

    const mainFont = "helvetica";

    // Header
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, 8, 297, "F");
    doc.setFont(mainFont, "bold");
    doc.setFontSize(24);
    doc.setTextColor(colors.primary);
    doc.text("CREATIBUZ STUDIO", 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(colors.accent);
    doc.text(title, 20, 32);

    doc.setFillColor(colors.secondary);
    doc.roundedRect(140, 15, 60, 25, 2, 2, "F");
    doc.setFont(mainFont, "bold");
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    doc.text("Invoice #", 145, 22);
    doc.setFont(mainFont, "normal");
    doc.setFontSize(12);
    doc.text(invoiceNumber || "INV-00000", 145, 30);
    doc.setFontSize(8);
    doc.setTextColor(colors.lightText);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Date: ${dateStr}`, 145, 36);

    let startY = 60;

    const metaLabels = ["division", "district"];
    const summaryData = data.filter(
      (item) => !metaLabels.includes(String(item.label || "").toLowerCase()),
    );
    const metaData = data.filter((item) =>
      metaLabels.includes(String(item.label || "").toLowerCase()),
    );

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    if (summaryData.length > 0) {
      const summaryBody = summaryData.map((item) => {
        let valueContent = item.value;
        let valueStyles = {};

        if (item.label.toLowerCase().includes("status")) {
          if (typeof valueContent === "string") {
            valueContent = valueContent.toUpperCase();
          }
          const lowerValue = String(item.value).toLowerCase();
          if (["paid", "success", "completed"].includes(lowerValue)) {
            valueStyles = { textColor: [34, 197, 94], fontStyle: "bold" };
          } else if (["pending"].includes(lowerValue)) {
            valueStyles = {
              textColor: [220, 38, 38],
              fontStyle: "bold",
            };
          }
        }

        return [item.label, { content: valueContent, styles: valueStyles }];
      });

      autoTable(doc, {
        startY: startY,
        body: summaryBody,
        theme: "plain",
        styles: {
          font: mainFont,
          fontSize: 9,
          textColor: colors.text,
          cellPadding: 2,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40 },
          1: { cellWidth: 100 },
        },
        margin: { left: 20 },
      });

      startY = doc.lastAutoTable.finalY + 10;
    }

    if (metaData.length > 0) {
      const boxX = 20;
      const boxY = startY;
      const lineHeight = 8;
      const boxHeight = 10 + metaData.length * lineHeight;

      doc.setFillColor(222, 235, 255);
      doc.roundedRect(boxX, boxY, 170, boxHeight, 2, 2, "F");

      let textY = boxY + 12;
      metaData.forEach((item) => {
        const label = String(item.label || "").toUpperCase();
        const value = String(item.value || "N/A");
        doc.setFont(mainFont, "bold");
        doc.setFontSize(8);
        doc.setTextColor(colors.text);
        doc.text(`${label}:`, boxX + 4, textY);
        doc.setFont(mainFont, "normal");
        doc.setTextColor(colors.primary);
        doc.text(value, boxX + 40, textY);
        textY += lineHeight;
      });

      startY = boxY + boxHeight + 10;
    }

    // ITEMS TABLE
    if (items.length > 0) {
      const itemBody = [];
      items.forEach((item, index) => {
        const name = item.item_name || "Item";
        let desc = item.description || "";

        // Add duration and price unit info to description
        const durationMonths = item.duration_months;
        const priceUnit = item.price_unit;
        const metadata = item.metadata || {};

        // Build duration string if available
        if (durationMonths && priceUnit) {
          const fromMonth = metadata.from_month;
          const fromYear = metadata.from_year;
          const toMonth = metadata.to_month;
          const toYear = metadata.to_year;

          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          let durationStr = "";
          if (fromMonth && fromYear && toMonth && toYear) {
            durationStr = `${monthNames[fromMonth - 1]} ${fromYear} - ${monthNames[toMonth - 1]} ${toYear}`;
          }

          // Build description lines
          const descLines = [];
          if (desc) {
            descLines.push(desc);
          }
          descLines.push(
            `Duration: ${durationMonths} month${durationMonths > 1 ? "s" : ""}${durationStr ? ` (${durationStr})` : ""}`,
          );

          desc = descLines.join("\n");
        }

        const row = [
          {
            content: index + 1,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: `${name}\n${desc}`,
            styles: {
              fontStyle: "bold",
              textColor: colors.primary,
              valign: "top",
            },
          },
          {
            content: item.quantity || 1,
            styles: { valign: "middle", halign: "center" },
          },
          {
            content: item.unit_price || item.price || "0.00",
            styles: { valign: "middle", halign: "right" },
          },
          {
            content: item.subtotal || item.total || "0.00",
            styles: { valign: "middle", halign: "right" },
          },
        ];

        itemBody.push(row);
      });

      autoTable(doc, {
        startY: startY,
        head: [["SL", "Item Description", "Qty", "Price", "Total"]],
        body: itemBody,
        theme: "grid",
        styles: {
          font: mainFont,
          fontSize: 10,
          textColor: colors.text,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: colors.primary,
          textColor: colors.white,
          fontStyle: "bold",
          fontSize: 10,
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: "auto", valign: "top" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 20, right: 20 },
        willDrawCell: (data) => {
          // Prevent default text rendering for item description column
          if (data.section === "body" && data.column.index === 1) {
            data.cell.text = []; // Clear text to prevent auto-rendering
          }
        },
        didDrawCell: (data) => {
          // Custom rendering for item description cell to show name in bold and description in gray
          if (data.section === "body" && data.column.index === 1) {
            const raw = data.cell.raw;
            if (!raw || !raw.content) return;

            const fullContent = String(raw.content);
            const lines = fullContent.split("\n");

            if (lines.length === 0) return;

            const paddingX = 4;
            const paddingY = 4;
            const textX = data.cell.x + paddingX;
            let textY = data.cell.y + paddingY;

            // Draw item name (first line) in bold, primary color
            const itemName = lines[0];
            doc.setFont(mainFont, "bold");
            doc.setFontSize(10);
            doc.setTextColor(colors.primary);
            textY += 3.5; // Baseline offset for first line
            doc.text(itemName, textX, textY);

            // Draw description lines (remaining lines) in normal, light gray
            if (lines.length > 1) {
              doc.setFont(mainFont, "normal");
              doc.setFontSize(7);
              doc.setTextColor(colors.lightText);

              const descLines = lines.slice(1);
              textY += 4; // Gap between item name and description

              descLines.forEach((line, index) => {
                if (line.trim()) {
                  doc.text(line, textX, textY);
                  textY += 2.8; // Line height for 7pt font
                }
              });
            }
          }
        },
      });

      // Calculate Totals aligned with the items table columns (same margins/column widths)
      const finalY = doc.lastAutoTable.finalY;
      const totalAmount = items
        .reduce((sum, item) => {
          const val = parseFloat(item.subtotal || item.total || 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0)
        .toFixed(2);

      // Create rows that match the 5-column layout so the amounts align perfectly
      const totalsBody = [
        [
          "", // SL
          "", // Item Description
          "", // Qty
          {
            content: "Subtotal:",
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: totalAmount,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
        [
          "",
          "",
          "",
          { content: "Total:", styles: { halign: "right", fontStyle: "bold" } },
          {
            content: totalAmount,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
      ];

      autoTable(doc, {
        startY: finalY + 5,
        body: totalsBody,
        theme: "plain",
        styles: {
          font: mainFont,
          fontSize: 10,
          textColor: colors.text,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
        },
        margin: { left: 20, right: 20 },
      });
    }

    // Footer - positioned at the bottom of the page
    const pageHeight = doc.internal.pageSize.height || 297;
    const footerY = pageHeight - 20;

    doc.setFontSize(8);
    doc.setTextColor(colors.lightText);
    doc.text("Creatibuz Studio", 20, footerY);
    doc.text("contact@creatibuzstudio.com", 20, footerY + 4);
    doc.text("Page 1 of 1", 190, footerY, { align: "right" });

    const finalFileName = `${fileName.toLowerCase().replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`;
    doc.save(finalFileName);
  };

  return (
    <PrimaryButton onClick={generatePDF} className={className} {...props}>
      {children || "Download PDF"}
    </PrimaryButton>
  );
};

export default ModernPdfGenerator;
