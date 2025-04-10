import { injectable } from "inversify";
import PDFDocument from "pdfkit";
import fs from "fs";
import path, { resolve } from "path";
import ExcelJS from "exceljs";
import Stream, { PassThrough } from "stream";
export interface FinancialReportItem {
  loanId: string;
  loanAmount: number;
  totalPaid: number;
  totalBalanceToPay: number;
  penaltyPaid: number;
  interestPaid: number;
}

@injectable()
export class ReportService {
  constructor() {}

  generateFinancialReportPdf(data: FinancialReportItem[]): any {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const today = new Date().toLocaleDateString();
      const reportsDir = path.join(process.cwd(), "reports");
    
      // if (!fs.existsSync(reportsDir)) {
      //   fs.mkdirSync(reportsDir, { recursive: true });
      // }

      // const filePath = path.join(
      //   reportsDir,
      //   `financial-report-${timestamp}.pdf`
      // );

      // Create PDF with professional margins and metadata
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        info: {
          Title: "Financial Report Summary",
          Author: "Report Service",
          Subject: "Loan Financial Report",
        },
      });

    const pdfStream=new PassThrough()
      // const writeStream = fs.createWriteStream(filePath);
      doc.pipe(pdfStream);


      // Page dimensions for alignment calculations
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 100; // Left and right margins (50 each)

      // Company header with logo placeholder - precisely positioned
      const logoStartX = 50;
      const logoStartY = 40;
      const logoWidth = 120;
      const logoHeight = 45;

      doc
        .rect(logoStartX, logoStartY, logoWidth, logoHeight)
        .fillOpacity(0.8)
        .fill("#3498db");
      doc.fillOpacity(1).fill("#fff");
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("COMPANY", logoStartX + logoWidth / 2 - 35, logoStartY + 8);
      doc
        .fontSize(11)
        .text("FINANCE", logoStartX + logoWidth / 2 - 25, logoStartY + 30);

      // Report information block - aligned right
      const infoBlockX = pageWidth - 170;
      const infoBlockY = logoStartY;
      doc.fontSize(10).font("Helvetica").fillColor("#000");
      doc.text(`Date: ${today}`, infoBlockX, infoBlockY);
      doc.text(
        `Report ID: FR-${timestamp.substring(0, 8)}`,
        infoBlockX,
        infoBlockY + 15
      );
      doc.text(
        `Generated: ${new Date().toLocaleTimeString()}`,
        infoBlockX,
        infoBlockY + 30
      );

      // Document Title with precise positioning and consistent spacing
      const titleY = logoStartY + logoHeight + 30;
      doc.rect(50, titleY, contentWidth, 45).fillOpacity(0.05).fill("#000");
      doc.fillOpacity(1).fill("#000");
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Financial Report Summary", 50, titleY + 12, {
          align: "center",
          width: contentWidth,
        });

      // Table configuration with precise column widths
      let tableTop = titleY + 75;
      let tableY = tableTop;

      // Calculate column widths based on percentage of content area for perfect alignment
      const tableWidth = contentWidth;
      const colWidths = [0.15, 0.17, 0.17, 0.17, 0.17, 0.17]; // Proportion of each column

      // Calculate actual column positions
      const colPos = [0];
      let runningWidth = 0;
      colWidths.forEach((width) => {
        runningWidth += width * tableWidth;
        colPos.push(runningWidth);
      });

      // Map column positions to actual X coordinates
      const columnX = colPos.map((pos) => pos + 50); // 50 is left margin

      // Table styling settings
      const itemHeight = 30;
      const headerColor = "#2c3e50";
      const alternateRowColor = "#f8f9fa";
      const borderColor = "#bdc3c7";

      const headers = [
        "Loan ID",
        "Loan",
        "Total Paid",
        "Balance To Pay",
        "Penalty Paid",
        "Interest Paid",
      ];

      // Draw table header with precise alignment
      const drawTableHeader = (y: number) => {
        // Header background
        doc
          .rect(columnX[0], y, tableWidth, itemHeight)
          .fillOpacity(1)
          .fill(headerColor);

        // Header text
        headers.forEach((text, i) => {
          const colWidth = colWidths[i] * tableWidth;
          const textX = columnX[i] + 5;
          doc
            .fillColor("#ffffff")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(text, textX, y + 10, {
              width: colWidth - 10,
              align: i === 0 ? "left" : "right",
            });
        });
      };

      // Draw table rows with proper text alignment
      const drawTableRow = (y: number, row: string[], isAlternate = false) => {
        // Row background for alternate rows
        if (isAlternate) {
          doc
            .rect(columnX[0], y, tableWidth, itemHeight)
            .fillOpacity(1)
            .fill(alternateRowColor);
        }

        // Reset fill opacity for text
        doc.fillOpacity(1);

        // Row data with proper alignment
        row.forEach((text, i) => {
          const colWidth = colWidths[i] * tableWidth;
          const textX = columnX[i] + 5;
          doc
            .fillColor("#000000")
            .font("Helvetica")
            .fontSize(10)
            .text(text, textX, y + 10, {
              width: colWidth - 10,
              align: i === 0 ? "left" : "right",
            });
        });
      };

      // Draw table borders with precise positioning
      const drawTableBorders = (startY: number, endY: number) => {
        // Outer border
        doc
          .strokeColor(borderColor)
          .lineWidth(1)
          .rect(columnX[0], startY, tableWidth, endY - startY)
          .stroke();

        // Vertical borders between columns
        columnX.forEach((x, i) => {
          if (i > 0 && i < columnX.length - 1) {
            doc
              .strokeColor(borderColor)
              .lineWidth(0.5)
              .moveTo(x, startY)
              .lineTo(x, endY)
              .stroke();
          }
        });
      };

      // Initialize table
      drawTableHeader(tableTop);
      tableY = tableTop + itemHeight;

      let totals = {
        loan: 0,
        paid: 0,
        balance: 0,
        penalty: 0,
        interest: 0,
      };

      // Table Data with consistent number formatting
      data.forEach((item, index) => {
        const row = [
          item.loanId,
          item.loanAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          item.totalPaid.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          item.totalBalanceToPay.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          item.penaltyPaid.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          item.interestPaid.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        ];

        // Page break handling with consistent header and borders
        if (tableY > doc.page.height - 100) {
          // Draw borders for current page before adding new page
          drawTableBorders(tableTop, tableY);

          doc.addPage();

          // Add header text to new page
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#000")
            .text("Financial Report Summary - Continued", 50, 40);
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`Report ID: FR-${timestamp.substring(0, 8)}`, {
              align: "right",
            });

          // Reset table position for new page
          tableTop = 70;
          tableY = tableTop;

          // Add header to new page
          drawTableHeader(tableY);
          tableY += itemHeight;
        }

        drawTableRow(tableY, row, index % 2 === 1);
        tableY += itemHeight;

        // Update totals
        totals.loan += item.loanAmount;
        totals.paid += item.totalPaid;
        totals.balance += item.totalBalanceToPay;
        totals.penalty += item.penaltyPaid;
        totals.interest += item.interestPaid;
      });

      // Finalize table with borders
      drawTableBorders(tableTop, tableY);

      // Format currency values for summary with consistent formatting
      // const formatCurrency = (value: number) => {
      //   return value.toLocaleString("en-US", {
      //     style: "currency",
      //     currency: "INR",
      //     minimumFractionDigits: 2,
      //   });
      // };

      // Summary section with precise positioning and alignment
      const summaryBoxWidth = 250;
      const summaryBoxX = pageWidth - summaryBoxWidth - 50; // 50px from right margin
      const summaryBoxY = tableY + 30;
      const summaryBoxHeight = 150;

      // Summary box with border
      doc
        .rect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight)
        .fillOpacity(0.05)
        .fill("#000")
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke();

      // Summary header
      doc.fillOpacity(1).fillColor("#000");
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("SUMMARY", summaryBoxX, summaryBoxY + 15, {
          width: summaryBoxWidth,
          align: "center",
          underline: true,
        });

      // Summary data
      const summaryData = [
        { label: "Total Loan Amount:", value: "Rs. " + (totals.loan).toFixed(2) },
        { label: "Total Paid:", value: "Rs. " + (totals.paid).toFixed(2) },
        { label: "Balance To Pay:", value: "Rs. " + (totals.balance).toFixed(2) },
        { label: "Penalty Paid:", value: "Rs. " + (totals.penalty).toFixed(2) },
        // { label: "Interest Paid:", value: "Rs. " + (totals.interest).toFixed(2) },
      ];

      // Display summary items with precise two-column layout
      const summaryStartY = summaryBoxY + 45;
      const labelWidth = 130;
      summaryData.forEach((item, i) => {
        const itemY = summaryStartY + i * 20;

        // Label (left-aligned)
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(item.label, summaryBoxX + 15, itemY);

        // Value (right-aligned)
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(item.value, summaryBoxX + labelWidth, itemY, {
            width: summaryBoxWidth - labelWidth - 15,
            align: "right",
          });
      });

      // Add professional footer with page numbering
      const footerTop = doc.page.height - 40;

      // Footer line
      doc
        .strokeColor("#dddddd")
        .lineWidth(0.5)
        .moveTo(50, footerTop - 10)
        .lineTo(pageWidth - 50, footerTop - 10)
        .stroke();

      // Footer text
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#777777")
        .text(
          "This is an automatically generated report. For any inquiries, please contact the finance department.",
          50,
          footerTop,
          { align: "left", width: contentWidth * 0.7 }
        );

      doc.fontSize(8).text(`Page 1 of 1`, pageWidth - 100, footerTop, {
        width: 50,
        align: "right",
      });

      doc.end();
      return pdfStream;
    } catch (err) {
      console.error("Failed to generate report:", err);
      
    }
  }

  // for exel sheet ----------------------------------------------------------------------------------------------------------------------------------------

 async  generateFinancialReportExcel(data: FinancialReportItem[]): Promise<any> {
    try {
      // Create timestamp and prepare directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const today = new Date().toLocaleDateString();
      const reportsDir = path.join(process.cwd(), "reports");

      // if (!fs.existsSync(reportsDir)) {
      //   fs.mkdirSync(reportsDir, { recursive: true });
      // }

      // const filePath = path.join(
      //   reportsDir,
      //   `financial-report-${timestamp}.xlsx`
      // ); 


      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook(); 
      workbook.creator = "Report Service";
      workbook.lastModifiedBy = "Report Service";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.properties.date1904 = true;

      const worksheet = workbook.addWorksheet("Financial Report", {
        pageSetup: {
          paperSize: 9, // A4
          orientation: "portrait",
          fitToPage: true,
          margins: {
            left: 0.7,
            right: 0.7,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          },
        },
      });

      // Define columns with precise widths
      worksheet.columns = [
        { header: "Loan ID", key: "loanId", width: 15 },
        { header: "Loan", key: "loanAmount", width: 17 },
        { header: "Total Paid", key: "totalPaid", width: 17 },
        { header: "Balance To Pay", key: "balanceToPay", width: 17 },
        { header: "Penalty Paid", key: "penaltyPaid", width: 17 },
        { header: "Interest Paid", key: "interestPaid", width: 17 },
      ];

      // Add title rows
      worksheet.mergeCells("A1:F2");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Financial Report Summary";
      titleCell.font = {
        name: "Arial",
        size: 18,
        bold: true,
      };
      titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F5F5F5" },
      };

      // Add report information
      worksheet.mergeCells("A3:C3");
      worksheet.getCell("A3").value = `Date: ${today}`;
      worksheet.mergeCells("D3:F3");
      worksheet.getCell("D3").value = `Report ID: FR-${timestamp.substring(
        0,
        8
      )}`;

      worksheet.mergeCells("A4:C4");
      worksheet.getCell(
        "A4"
      ).value = `Generated: ${new Date().toLocaleTimeString()}`;

      // Add Company info in a styled cell
      worksheet.mergeCells("A5:C5");
      const companyCell = worksheet.getCell("A5");
      companyCell.value = "COMPANY FINANCE";
      companyCell.font = {
        bold: true,
        size: 12,
      };
      companyCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3498DB" }, // Blue color similar to PDF
      };
      companyCell.font.color = { argb: "FFFFFF" }; // White text

      // Add blank row before table
      worksheet.addRow([]);

      // Style the header row
      const headerRow = worksheet.addRow([]);
      worksheet.columns.forEach((column, colNumber) => {
        const cell = headerRow.getCell(colNumber + 1);
        // Fix: Cast column.header to string to ensure it's a valid CellValue
        cell.value = column.header as string;
        cell.font = {
          bold: true,
          color: { argb: "FFFFFF" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "2C3E50" }, // Dark blue header color as in PDF
        };
        cell.alignment = {
          horizontal: colNumber === 0 ? "left" : "right",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Calculate totals as we add rows
      let totals = {
        loan: 0,
        paid: 0,
        balance: 0,
        penalty: 0,
        interest: 0,
      };

      // Add data rows with alternating colors
      data.forEach((item, index) => {
        const row = worksheet.addRow([
          item.loanId,
          item.loanAmount,
          item.totalPaid,
          item.totalBalanceToPay,
          item.penaltyPaid,
          item.interestPaid,
        ]);

        // Update totals
        totals.loan += item.loanAmount;
        totals.paid += item.totalPaid;
        totals.balance += item.totalBalanceToPay;
        totals.penalty += item.penaltyPaid;
        totals.interest += item.interestPaid;

        // Format cells
        row.eachCell((cell, colNumber) => {
          // Add alternating row color
          if (index % 2 === 1) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F8F9FA" }, // Light grey for alternate rows
            };
          }

          // Add borders
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Align text
          cell.alignment = {
            horizontal: colNumber === 1 ? "left" : "right",
            vertical: "middle",
          };

          // Format currency cells (all except first column)
          if (colNumber > 1) {
            cell.numFmt = "₹#,##0.00";
          }
        });
      });

      // Add blank row before summary
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Add summary section
      const summaryStartRow = worksheet.rowCount + 1;

      // Add summary header
      worksheet.mergeCells(`D${summaryStartRow}:F${summaryStartRow}`);
      const summaryHeaderCell = worksheet.getCell(`D${summaryStartRow}`);
      summaryHeaderCell.value = "SUMMARY";
      summaryHeaderCell.font = {
        bold: true,
        size: 12,
        underline: true,
      };
      summaryHeaderCell.alignment = { horizontal: "center" };

      // Add summary data
      const summaryData = [
        { label: "Total Loan Amount:", value: totals.loan },
        { label: "Total Paid:", value: totals.paid },
        { label: "Balance To Pay:", value: totals.balance },
        { label: "Penalty Paid:", value: totals.penalty },
        { label: "Interest Paid:", value: totals.interest },
      ];

      summaryData.forEach((item, i) => {
        const rowNumber = summaryStartRow + i + 1;
        worksheet.mergeCells(`D${rowNumber}:E${rowNumber}`);

        const labelCell = worksheet.getCell(`D${rowNumber}`);
        labelCell.value = item.label;
        labelCell.font = { bold: true };
        labelCell.alignment = { horizontal: "left" };

        const valueCell = worksheet.getCell(`F${rowNumber}`);
        valueCell.value = item.value;
        valueCell.numFmt = "₹#,##0.00";
        valueCell.alignment = { horizontal: "right" };

        // Add border around the summary cells
        [labelCell, valueCell].forEach((cell) => {
          cell.border = {
            // Fix: Use undefined instead of "none" for border style
            top: { style: i === 0 ? "thin" : undefined },
            left: { style: "thin" },
            bottom: {
              style: i === summaryData.length - 1 ? "thin" : undefined,
            },
            right: { style: "thin" },
          };

          // Light gray background for summary
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" },
          };
        });
      });

      // Add footer with disclaimer
      const footerRow = worksheet.rowCount + 3;
      worksheet.mergeCells(`A${footerRow}:F${footerRow}`);
      const footerCell = worksheet.getCell(`A${footerRow}`);
      footerCell.value =
        "This is an automatically generated report. For any inquiries, please contact the finance department.";
      footerCell.font = {
        size: 8,
        color: { argb: "777777" },
      };
      footerCell.alignment = { horizontal: "left" };

      const stream=new PassThrough()
     await workbook.xlsx.write(stream)
     stream.end()
     return stream


      
    } catch (err: unknown) {
      console.error("Failed to generate Excel report:", err);
    
    }
  }

  
}



