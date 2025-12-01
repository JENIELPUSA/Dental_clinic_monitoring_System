const Inventory = require("../Models/InventorySchema");
const Category = require("../Models/inventoryCategorySchema");
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');

exports.addInventory = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      supplier,
      stockQuantity,
      unit,
      expirationDate,
      dateAcquired,
      status,
      reorderLevel,
      notes,
    } = req.body;

    console.log(req.body)

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if item with same name, category, and brand already exists
    const existingItem = await Inventory.findOne({ itemName, category, brand });

    if (existingItem) {
      // Update stockQuantity
      existingItem.stockQuantity += parseInt(stockQuantity);
      await existingItem.save();
      return res
        .status(200)
        .json({ message: "Stock updated successfully", data: existingItem });
    }

    // Create new item if not exist
    const newItem = new Inventory({
      itemName,
      category,
      brand,
      stockQuantity,
      unit,
      expirationDate,
      dateAcquired,
      status,
      reorderLevel,
      notes,
    });

    await newItem.save();
    res.status(201).json({
      status: "success",
      message: "Inventory item added successfully",
      data: newItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding item", error: error.message });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const { search = "", limit = 10, page = 1 } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const matchStage = {};

    // Optional search: can match itemName, brand, supplier, or category name
    if (search.trim()) {
      const searchTerms = search.trim().split(/\s+/);
      matchStage.$and = searchTerms.map((term) => ({
        $or: [
          { itemName: { $regex: term, $options: "i" } },
          { brand: { $regex: term, $options: "i" } },
          { supplier: { $regex: term, $options: "i" } },
          { notes: { $regex: term, $options: "i" } },
          { "category.name": { $regex: term, $options: "i" } },
        ],
      }));
    }

    const pipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $match: matchStage },
      {
        $project: {
          itemName: 1,
          brand: 1,
          supplier: 1,
          stockQuantity: 1,
          unit: 1,
          expirationDate: 1,
          dateAcquired: 1,
          status: 1,
          reorderLevel: 1,
          notes: 1,
          "category._id": 1,
          "category.name": 1,
          "category.description": 1,
        },
      },
      { $sort: { dateAcquired: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parsedLimit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await Inventory.aggregate(pipeline);

    const data = results[0]?.data || [];
    const totalInventory = results[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      status: "success",
      data,
      totalInventory,
      totalPages: Math.ceil(totalInventory / parsedLimit),
      currentPage: parsedPage,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching inventory",
      error: error.message,
    });
  }
};


exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check kung valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message });
  }
};
exports.GenerateInventoryPDF = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const matchStage = {};

    if (search.trim()) {
      const searchTerms = search.trim().split(/\s+/);
      matchStage.$and = searchTerms.map((term) => ({
        $or: [
          { itemName: { $regex: term, $options: "i" } },
          { brand: { $regex: term, $options: "i" } },
          { supplier: { $regex: term, $options: "i" } },
          { notes: { $regex: term, $options: "i" } },
          { "category.name": { $regex: term, $options: "i" } },
        ],
      }));
    }

    const pipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      {
        $project: {
          itemName: 1,
          brand: 1,
          supplier: 1,
          stockQuantity: 1,
          unit: 1,
          expirationDate: 1,
          dateAcquired: 1,
          status: 1,
          reorderLevel: 1,
          notes: 1,
          categoryName: { $ifNull: ["$category.name", "Uncategorized"] },
        },
      },
      { $sort: { dateAcquired: -1 } },
    ];

    const inventoryItems = await Inventory.aggregate(pipeline);

    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `inventory-report-${timestamp}.pdf`;
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Create PDF with bufferPages for footer control
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4', 
      bufferPages: true 
    });
    doc.pipe(res);

    // Colors
    const primaryColor = '#2563eb';
    const headerBg = '#f1f5f9';
    const borderColor = '#cbd5e1';

    // Page dimensions
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const FOOTER_HEIGHT = 40;
    const PAGE_BOTTOM = pageHeight - FOOTER_HEIGHT;

    // ===== BUSINESS HEADER =====
    const businessName = 'Doc. Saclolo Dental Clinic';
    const contactInfo = {
      email: 'saclolodentalclinic@gmail.com',   // ← Gmail
      phone: '(02) 8123-4567',                  // ← Phone
      address: 'Naval,Biliran, Philippines' // ← Address
    };

    // Business name
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(businessName, margin, 20, { align: 'center' });

    // Contact info: Gmail, Phone, Address
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Gmail: ${contactInfo.email}`, margin, 40, { align: 'center' })
       .text(`Phone: ${contactInfo.phone}`, margin, 52, { align: 'center' })
       .text(`Address: ${contactInfo.address}`, margin, 64, { align: 'center' });

    // Start main report content after business header
    let currentY = 90;
    doc.y = currentY;

    // ===== REPORT TITLE BANNER =====
    doc.rect(0, currentY, pageWidth, 40).fill(primaryColor);
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('INVENTORY REPORT', margin, currentY + 12, { align: 'center' });

    doc.moveDown(2);
    doc.fillColor('#000000');

    // Update Y after title
    currentY = currentY + 50;
    doc.y = currentY;

    // ===== FILTER INFO =====
    if (search.trim()) {
      const filterText = `🔍 Search: "${search.trim()}"`;
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 20, 5).fill(headerBg);
      doc.fillColor('#334155')
         .fontSize(10)
         .text(filterText, margin + 15, currentY + 5, {
           width: pageWidth - 2 * margin - 30,
           align: 'left'
         });
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 20, 5).stroke(borderColor);
      currentY += 30;
      doc.y = currentY;
    }

    // Summary
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(`Total Items: ${inventoryItems.length}`, margin, doc.y);
    doc.moveDown(1.5);

    // ===== TABLE =====
    const drawTableHeader = (yPos) => {
      const y = yPos || doc.y;
      const headers = ['Item', 'Brand', 'Stock', 'Status', 'Exp. Date'];
      const colWidths = [120, 100, 90, 90, 100];
      let x = margin;

      doc.rect(margin, y - 5, pageWidth - 2 * margin, 25).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');

      headers.forEach((h, i) => {
        doc.text(h, x + 5, y, { width: colWidths[i] - 10, align: 'left' });
        x += colWidths[i];
      });

      doc.fillColor('#000000');
      return y + 25;
    };

    let tableY = drawTableHeader();
    doc.y = tableY + 5;
    
    const colWidths = [120, 100, 90, 90, 100];
    const rowHeight = 22;
    let rowIndex = 0;

    if (inventoryItems.length === 0) {
      doc.fontSize(12).fillColor('#ef4444').text('No inventory items found.', margin, doc.y);
    } else {
      inventoryItems.forEach((item) => {
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

        const expDate = item.expirationDate
          ? new Date(item.expirationDate).toLocaleDateString('en-PH')
          : 'N/A';

        const stockText = `${item.stockQuantity || 0} ${item.unit || ''}`.trim();
        const statusColor = 
          item.status === 'Low Stock' ? '#f59e0b' :
          item.status === 'Out of Stock' ? '#dc2626' :
          item.status === 'Active' ? '#16a34a' : '#64748b';

        const rowData = [
          { text: (item.itemName || '–').substring(0, 20), color: '#0f172a' },
          { text: (item.brand || '–').substring(0, 18), color: '#475569' },
          { text: stockText, color: '#1e293b' },
          { text: item.status || '–', color: statusColor },
          { text: expDate, color: '#64748b' },
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

        doc.strokeColor(borderColor)
           .lineWidth(0.5)
           .moveTo(margin, rowY + rowHeight - 5)
           .lineTo(pageWidth - margin, rowY + rowHeight - 5)
           .stroke();

        doc.y = rowY + rowHeight;
        rowIndex++;
      });
    }

    // ===== SMART FOOTER POSITIONING =====
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

      doc.fontSize(8)
         .fillColor('#64748b')
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

        doc.fontSize(8)
           .fillColor('#64748b')
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
        message: 'Failed to generate inventory PDF',
        error: error.message,
      });
    }
  }
};