const Releasehistory = require("../Models/ReleaseHistorySchema");
const Inventory = require("../Models/InventorySchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
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
