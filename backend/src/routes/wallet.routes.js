const express = require("express");
const { check } = require("express-validator");
const walletController = require("../controllers/wallet.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  validateRequest,
  validateObjectId,
} = require("../middlewares/validation.middleware");
const { asyncHandler } = require("../middlewares/errorHandler.middleware");

const router = express.Router();

// Partner wallet routes
// Get wallet details
router.get(
  "/",
  protect,
  authorize("partner"),
  asyncHandler(walletController.getWallet)
);

// Get wallet transactions
router.get(
  "/transactions",
  protect,
  authorize("partner"),
  [
    check("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    check("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    check("type")
      .optional()
      .isIn([
        "order_payment",
        "commission",
        "payout",
        "refund",
        "wallet_credit",
        "wallet_debit",
      ])
      .withMessage("Invalid transaction type"),
    check("status")
      .optional()
      .isIn(["pending", "completed", "failed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  asyncHandler(walletController.getTransactions)
);

// Request payout
router.post(
  "/payout",
  protect,
  authorize("partner"),
  [
    check("amount")
      .isNumeric()
      .withMessage("Amount must be a number")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Amount must be greater than 0");
        }
        return true;
      }),
    check("paymentMethod")
      .isIn(["Bank Transfer", "UPI"])
      .withMessage("Payment method must be Bank Transfer or UPI"),
    check("bankDetails")
      .optional()
      .isObject()
      .withMessage("Bank details must be an object"),
    check("bankDetails.accountNumber")
      .if(check("paymentMethod").equals("Bank Transfer"))
      .notEmpty()
      .withMessage("Account number is required for bank transfer"),
    check("bankDetails.ifscCode")
      .if(check("paymentMethod").equals("Bank Transfer"))
      .notEmpty()
      .withMessage("IFSC code is required for bank transfer"),
    check("bankDetails.accountHolderName")
      .if(check("paymentMethod").equals("Bank Transfer"))
      .notEmpty()
      .withMessage("Account holder name is required for bank transfer"),
    check("upiId")
      .if(check("paymentMethod").equals("UPI"))
      .notEmpty()
      .withMessage("UPI ID is required for UPI transfer"),
  ],
  validateRequest,
  asyncHandler(walletController.requestPayout)
);

// Update payout settings
router.put(
  "/settings",
  protect,
  authorize("partner"),
  [
    check("minimumPayoutAmount")
      .optional()
      .isNumeric()
      .withMessage("Minimum payout amount must be a number"),
    check("autoPayoutEnabled")
      .optional()
      .isBoolean()
      .withMessage("Auto payout enabled must be a boolean"),
    check("payoutSchedule")
      .optional()
      .isIn(["manual", "weekly", "biweekly", "monthly"])
      .withMessage("Invalid payout schedule"),
    check("bankDetails")
      .optional()
      .isObject()
      .withMessage("Bank details must be an object"),
    check("upiId").optional().isString().withMessage("UPI ID must be a string"),
  ],
  validateRequest,
  asyncHandler(walletController.updatePayoutSettings)
);

// Get payout history
router.get(
  "/payouts",
  protect,
  authorize("partner"),
  [
    check("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    check("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    check("status")
      .optional()
      .isIn(["pending", "completed", "failed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  asyncHandler(walletController.getPayoutHistory)
);

// Get wallet analytics
router.get(
  "/analytics",
  protect,
  authorize("partner"),
  [
    check("period")
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage("Period must be between 1 and 365 days"),
  ],
  validateRequest,
  asyncHandler(walletController.getWalletAnalytics)
);

// Admin routes for payout management
// Get all pending payouts (Admin only)
router.get(
  "/admin/payouts/pending",
  protect,
  authorize("admin"),
  [
    check("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    check("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  validateRequest,
  asyncHandler(walletController.getPendingPayouts)
);

// Get all payouts with optional status filter (Admin only)
router.get(
  "/admin/payouts/all",
  protect,
  authorize("admin"),
  [
    check("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    check("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    check("status")
      .optional()
      .isIn(["pending", "completed", "failed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  asyncHandler(walletController.getAllPayouts)
);

// Process payout (approve/reject) - Admin only
router.put(
  "/admin/payouts/:transactionId",
  protect,
  authorize("admin"),
  validateObjectId("transactionId"),
  [
    check("status")
      .isIn(["completed", "failed"])
      .withMessage("Status must be completed or failed"),
    check("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  validateRequest,
  asyncHandler(walletController.processPayout)
);

module.exports = router;
