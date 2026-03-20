const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/auth.middleware");
const {createItem, getItem, updateItem, deleteItem, markAsSold } = require("../controllers/item.controller");

/**
 * - Create Items Route
 * - Post api/items/:id
 */
router.post("/", protect , createItem);

/**
 * - Get Item Route
 * - Get api/items/:id
 */
router.get("/:id", protect , getItem);

/**
 * - Update items Route
 * - PUT api/items/:id
 */
router.put("/:id", protect, updateItem);

/**
 * - Delete Item Route
 * - DELETE api/items/:id
 */
router.delete("/:id", protect, deleteItem);

/**
 * - Mark as Sold Route
 * - PUT api/items/:id
 */
router.put("/:id/sold", protect, markAsSold);

module.exports = router;