const Releasehistory = require("../Models/ReleaseHistorySchema");
const Inventory = require("../Models/InventorySchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const PDFDocument = require('pdfkit');
exports.addItem = AsyncErrorHandler(async (req, res) => {
  console.log(req.body);
  try {
    const { inventoryId, serialNumber } = req.body;
    const inventoryItem = await Inventory.findById(inventoryId).populate(
      "category",
      "name"
    );

    if (!inventoryItem) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    if (inventoryItem.stockQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot release: Stock is empty" });
    }

    const newRelease = new Releasehistory({
      item: inventoryItem.itemName,
      serialNumber: serialNumber || "N/A",
      category: inventoryItem.category.name,
      brand: inventoryItem.brand,
      date: new Date(),
    });

    await newRelease.save();

    inventoryItem.stockQuantity -= 1;
    await inventoryItem.save();

    const io = req.app.get("io"); 
    io.emit("releaseItemAdded", newRelease); // broadcast sa lahat ng clients

    res.status(201).json({
      status: "success",
      message: "Release added successfully",
      data: newRelease,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Serial number already exists" });
    }
    res.status(500).json({
      success: false,
      message: "Error adding release",
      error: error.message,
    });
  }
});

exports.getItems = async (req, res) => {
  try {
    const { 
      from, 
      to, 
      period = "", 
      limit = 10, 
      page = 1 
    } = req.query;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const matchStage = {};

    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const now = new Date();
    if (period === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: startOfWeek };
    } else if (period === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchStage.createdAt = { $gte: startOfMonth };
    } else if (period === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchStage.createdAt = { $gte: startOfYear };
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parsedLimit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await Releasehistory.aggregate(pipeline);

    const data = results[0]?.data || [];
    const totalItems = results[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      status: "success",
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / parsedLimit),
      currentPage: parsedPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { date, item, serialNumber, category, brand } = req.body;

    const updatedItem = await Releasehistory.findByIdAndUpdate(
      req.params.id,
      { date, item, serialNumber, category, brand },
      { new: true, runValidators: true }
    );

    if (!updatedItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    res.status(200).json({
      status: "success",
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Serial number already exists" });
    }
    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Releasehistory.findByIdAndDelete(req.params.id);

    if (!deletedItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    res
      .status(200)
      .json({ status: "success", message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};

exports.GenerateReleaseHistoryPDF = async (req, res) => {
  try {
    const { from, to, period = "" } = req.query;

    const matchStage = {};
    let displayFrom, displayTo;

    if (from || to) {
      matchStage.date = {};
      if (from) {
        matchStage.date.$gte = new Date(from);
        displayFrom = new Date(from).toLocaleDateString('en-PH');
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        matchStage.date.$lte = toDate;
        displayTo = new Date(to).toLocaleDateString('en-PH');
      }
    }

    const now = new Date();
    let periodLabel = "";

    if (period === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      matchStage.date = { $gte: startOfWeek };
      periodLabel = "This Week";
    } else if (period === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchStage.date = { $gte: startOfMonth };
      periodLabel = "This Month";
    } else if (period === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchStage.date = { $gte: startOfYear };
      periodLabel = "This Year";
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: { date: -1 } },
    ];

    const items = await Releasehistory.aggregate(pipeline);

    // PDF Headers
    res.setHeader('Content-Type', 'application/pdf');
    const filename = `release-history-report-${new Date().toISOString().slice(0,10)}.pdf`;
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    // Colors
    const primaryColor = '#2563eb';
    const headerBg = '#f1f5f9';
    const borderColor = '#cbd5e1';

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const FOOTER_HEIGHT = 50;
    const PAGE_BOTTOM = pageHeight - FOOTER_HEIGHT;

    // ===== BUSINESS HEADER =====
    const businessName = 'Doc. Saclolo Dental Clinic';
    const contactInfo = {
      email: 'saclolodentalclinic@gmail.com',   // ← Update as needed
      phone: '(02) 8123-4567',
      address: 'Naval,Biliran, Philippines'
    };

    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(businessName, margin, 20, { align: 'center' });

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Gmail: ${contactInfo.email}`, margin, 40, { align: 'center' })
       .text(`Phone: ${contactInfo.phone}`, margin, 52, { align: 'center' })
       .text(`Address: ${contactInfo.address}`, margin, 64, { align: 'center' });

    // Start main content after header
    let currentY = 90;
    doc.y = currentY;

    // ===== REPORT TITLE BANNER =====
    doc.rect(0, currentY, pageWidth, 40).fill(primaryColor);
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('RELEASE HISTORY REPORT', margin, currentY + 12, { align: 'center' });
    doc.moveDown(2);
    doc.fillColor('#000000');

    currentY = currentY + 50;
    doc.y = currentY;

    // ===== FILTER INFO =====
    let hasFilter = periodLabel || from || to;
    let filterText = '';

    if (periodLabel) filterText += `Period: ${periodLabel}\n`;
    if (from || to) {
      const fromText = displayFrom || 'Any';
      const toText = displayTo || 'Any';
      filterText += `Date Range: ${fromText} to ${toText}\n`;
    }

    if (hasFilter) {
      const filterY = doc.y;
      doc.roundedRect(margin, filterY, pageWidth - 2 * margin, 0, 5).fill(headerBg);
      doc.fillColor('#334155').fontSize(10)
         .text(filterText, margin + 15, filterY + 10, { width: pageWidth - 2 * margin - 30 });
      const filterHeight = doc.y - filterY + 10;
      doc.roundedRect(margin, filterY, pageWidth - 2 * margin, filterHeight, 5)
         .stroke(borderColor);
      doc.moveDown(1);
    }

    // Summary
    doc.fontSize(11).font('Helvetica-Bold')
       .text(`Total Releases: ${items.length}`, margin, doc.y);
    doc.moveDown(1.5);

    // ===== TABLE =====
    const drawTableHeader = (yPos) => {
      const y = yPos || doc.y;
      const headers = ['Date', 'Item', 'Serial No.', 'Category', 'Brand'];
      const colWidths = [100, 110, 90, 90, 90];
      let x = margin;

      doc.rect(margin, y - 5, pageWidth - 2 * margin, 25).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(h, x + 5, y, { width: colWidths[i] - 10 });
        x += colWidths[i];
      });
      doc.fillColor('#000000');
      return y + 25;
    };

    let tableY = drawTableHeader();
    doc.y = tableY + 5;
    const colWidths = [100, 110, 90, 90, 90];
    const rowHeight = 22;
    let rowIndex = 0;

    if (items.length === 0) {
      doc.fontSize(12).fillColor('#ef4444')
         .text('No release records found.', margin, doc.y);
    } else {
      items.forEach((item) => {
        const spaceNeeded = rowHeight + 5;
        const spaceAvailable = PAGE_BOTTOM - doc.y;

        if (spaceAvailable < spaceNeeded) {
          doc.addPage();
          tableY = drawTableHeader(50);
          doc.y = tableY + 5;
          rowIndex = 0;
        }

        const rowY = doc.y;
        if (rowIndex % 2 === 0) {
          doc.rect(margin, rowY - 3, pageWidth - 2 * margin, rowHeight).fill('#f8fafc');
        }

        const releaseDate = item.date
          ? new Date(item.date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A';

        const rowData = [
          { text: releaseDate, color: '#64748b' },
          { text: (item.item || '–').substring(0, 18), color: '#0f172a' },
          { text: (item.serialNumber || '–').substring(0, 15), color: '#1e293b' },
          { text: (item.category || '–').substring(0, 15), color: '#475569' },
          { text: (item.brand || '–').substring(0, 15), color: '#475569' },
        ];

        let x = margin;
        doc.fontSize(9).font('Helvetica');
        rowData.forEach((cell, i) => {
          doc.fillColor(cell.color)
             .text(cell.text, x + 5, rowY, {
               width: colWidths[i] - 10,
               ellipsis: true,
             });
          x += colWidths[i];
        });

        doc.strokeColor(borderColor).lineWidth(0.5)
           .moveTo(margin, rowY + rowHeight - 5)
           .lineTo(pageWidth - margin, rowY + rowHeight - 5)
           .stroke();

        doc.y += rowHeight;
        rowIndex++;
      });
    }

    // ===== SMART FOOTER =====
    const range = doc.bufferedPageRange();
    const totalPages = range.count;

    if (totalPages === 1) {
      const contentEndY = doc.y;
      let footerY;

      if (contentEndY > PAGE_BOTTOM - 20) {
        footerY = pageHeight - 40;
      } else {
        footerY = Math.max(contentEndY + 30, pageHeight - 100);
        footerY = Math.min(footerY, pageHeight - 40);
        if (footerY < contentEndY + 20) {
          footerY = contentEndY + 20;
        }
      }

      doc.strokeColor(borderColor)
         .lineWidth(0.5)
         .moveTo(margin, footerY)
         .lineTo(pageWidth - margin, footerY)
         .stroke();

      doc.fontSize(8).fillColor('#64748b')
         .text(`Generated on ${new Date().toLocaleString('en-PH')}`, margin, footerY + 8, { align: 'left' })
         .text(`Page 1 of 1`, pageWidth - margin, footerY + 8, { align: 'right' });
    } else {
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        const footerY = pageHeight - 40;

        doc.strokeColor(borderColor)
           .lineWidth(0.5)
           .moveTo(margin, footerY)
           .lineTo(pageWidth - margin, footerY)
           .stroke();

        doc.fontSize(8).fillColor('#64748b')
           .text(`Generated on ${new Date().toLocaleString('en-PH')}`, margin, footerY + 8, { align: 'left' })
           .text(`Page ${i + 1} of ${totalPages}`, pageWidth - margin, footerY + 8, { align: 'right' });
      }
    }

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate release history PDF',
        error: error.message,
      });
    }
  }
};
