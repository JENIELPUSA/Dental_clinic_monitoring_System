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
    const items = await Releasehistory.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "success", data: items });
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
