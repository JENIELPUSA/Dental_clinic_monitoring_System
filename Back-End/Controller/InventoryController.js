const Inventory = require("../Models/InventorySchema");
const Category = require("../Models/inventoryCategorySchema");
const mongoose = require("mongoose");

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
    const items = await Inventory.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
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
    ]);

    res.status(200).json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching inventory", error: error.message });
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
