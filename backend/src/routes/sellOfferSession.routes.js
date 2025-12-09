/**
 * @fileoverview Sell Offer Session Routes
 * @description Routes for managing sell offer sessions and price calculations
 * @author Cashify Development Team
 * @version 1.0.0
 */

const express = require("express");
const { body } = require("express-validator");
const {
  createSession,
  getSession,
  updateAnswers,
  updateDefects,
  updateAccessories,
  getCurrentPrice,
  extendSession,
  deleteSession,
  getUserSessions,
  getAllSessions,
  updateSessionStatus,
  cleanupExpiredSessions,
} = require("../controllers/sellOfferSession.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Validation middleware
const createSessionValidation = [
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ObjectId"),
  body("productId")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ObjectId"),
  body("variantId")
    .isMongoId()
    .withMessage("Variant ID must be a valid MongoDB ObjectId"),
  body("answers")
    .optional()
    .isObject()
    .withMessage("Answers must be an object"),
  body("defects").optional().isArray().withMessage("Defects must be an array"),
  body("accessories")
    .optional()
    .isArray()
    .withMessage("Accessories must be an array"),
];

const updateAnswersValidation = [
  body("answers").isObject().withMessage("Answers object is required"),
  body("answers.*").notEmpty().withMessage("Answer values cannot be empty"),
];

const updateDefectsValidation = [
  body("defects").isArray().withMessage("Defects array is required"),
  body("defects.*").isString().withMessage("Each defect must be a string"),
];

const updateAccessoriesValidation = [
  body("accessories").isArray().withMessage("Accessories array is required"),
  body("accessories.*")
    .isString()
    .withMessage("Each accessory must be a string"),
];

// Public routes - no authentication required
router.post("/create", createSessionValidation, createSession);
router.get("/:sessionId", getSession);
router.get("/:sessionId/price", getCurrentPrice);

// Protected routes - require authentication
router.use(protect);

// User session routes
router.post("/", createSessionValidation, createSession); // For authenticated users
router.get("/my-sessions", getUserSessions);
router.put("/:sessionId/answers", updateAnswersValidation, updateAnswers);
router.put("/:sessionId/defects", updateDefectsValidation, updateDefects);
router.put(
  "/:sessionId/accessories",
  updateAccessoriesValidation,
  updateAccessories
);
router.post("/:sessionId/extend", extendSession);
router.delete("/:sessionId", deleteSession);

// Admin only routes
router.get("/admin/all", authorize("admin"), getAllSessions);
router.patch(
  "/admin/:sessionId/status",
  authorize("admin"),
  updateSessionStatus
);
router.post("/admin/cleanup", authorize("admin"), cleanupExpiredSessions);

module.exports = router;
