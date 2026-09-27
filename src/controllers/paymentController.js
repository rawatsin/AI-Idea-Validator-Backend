import crypto from "crypto";
import { prisma } from "../../config/prisma.js";
import plans from "../config/plan.js";

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // -------------------------
    // 1. Validate payment data
    // -------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details are required",
      });
    }

    // -------------------------
    // 2. Verify Razorpay signature
    // -------------------------

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // -------------------------
    // 3. Find payment
    // -------------------------

    const payment = await prisma.payment.findUnique({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // -------------------------
    // 4. Prevent duplicate verification
    // -------------------------

    if (payment.status === "success") {
      return res.status(400).json({
        message: "Payment already verified",
      });
    }

    // -------------------------
    // 5. Get requested plan
    // -------------------------

    const requestedPlan = payment.plan;

    // -------------------------
    // 6. Calculate expiry
    // -------------------------

    const startedAt = new Date();

    const expiryDate = new Date(startedAt);

    expiryDate.setDate(
      expiryDate.getDate() + plans[requestedPlan].validity
    );

    // -------------------------
    // 7. Update Payment +
    //    Subscription together
    // -------------------------

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: "success",
        },
      });

      const updatedSubscription = await tx.subscriptions.update({
        where: {
          id: payment.subscriptionId,
        },
        data: {
          plan: requestedPlan,
          status: "active",
          startedAt,
          expiryDate,
        },
      });

      return {
        payment: updatedPayment,
        subscription: updatedSubscription,
      };
    });

    // -------------------------
    // 8. Response
    // -------------------------

    return res.status(200).json({
      message: "Payment successful",
      ...result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

export const failPayment = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        message: "Razorpay order ID is required",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    if (payment.status === "success") {
      return res.status(400).json({
        message: "Payment already successful",
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "failed",
      },
    });

    return res.status(200).json({
      message: "Payment marked as failed",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update payment status",
    });
  }
};