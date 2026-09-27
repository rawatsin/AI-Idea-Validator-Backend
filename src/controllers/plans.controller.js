import plans from "../config/plan.js";
import Razorpay from "razorpay";
import { prisma } from "../../config/prisma.js";
import { getEffectivePlan } from "../config/subscription.js";

export const postPlan = async (req, res) => {
  try {
    const user = req.user;
    const { plan } = req.body;

    // Make sure the requested plan is valid
    if (!plan) {
      return res.status(400).json({
        message: "Plan is required",
      });
    }

    if (!plans[plan]) {
      return res.status(400).json({
        message: "Invalid plan",
        validPlans: Object.keys(plans),
      });
    }

    // Check if the user already has a subscription
    const existingSubscription = await prisma.subscriptions.findFirst({
      where: {
        userId: user.id,
      },
    });

    const currentPlan = getEffectivePlan(existingSubscription);

    // Don't let users purchase the plan they're already on
    if (currentPlan === plan) {
      return res.status(400).json({
        message: "You already have this plan",
      });
    }

    // Downgrades are not supported right now
    if (
      (currentPlan === "pro" && plan === "free") ||
      (currentPlan === "premium" &&
        (plan === "pro" || plan === "free"))
    ) {
      return res.status(400).json({
        message: "Downgrade is not allowed",
      });
    }

    // Free plan doesn't need a payment
    if (plan === "free") {
      let subscription;

      if (existingSubscription) {
        subscription = await prisma.subscriptions.update({
          where: {
            id: existingSubscription.id,
          },
          data: {
            plan: "free",
            status: "active",
            startedAt: new Date(),
            expiryDate: null,
          },
        });
      } else {
        subscription = await prisma.subscriptions.create({
          data: {
            userId: user.id,
            plan: "free",
            status: "active",
            startedAt: new Date(),
            expiryDate: null,
          },
        });
      }

      return res.status(200).json({
        message: "Free plan activated",
        currentPlan,
        requestedPlan: plan,
        amount: 0,
        subscription,
      });
    }

    let amount;

    // For Pro → Premium, charge only the price difference
    if (currentPlan === "pro" && plan === "premium") {
      amount = plans.premium.amount - plans.pro.amount;
    } else {
      amount = plans[plan].amount;
    }

    // Create the subscription before starting the payment flow
    let subscription = existingSubscription;

    if (!subscription) {
      subscription = await prisma.subscriptions.create({
        data: {
          userId: user.id,
          plan,
          status: "pending",
          startedAt: new Date(),
          expiryDate: null,
        },
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: plans[plan].currency,
    });

    // Keep the payment linked to both the user and subscription
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        plan,
        razorpayOrderId: order.id,
        amount: amount * 100,
        currency: plans[plan].currency,
        status: "pending",
      },
    });

    return res.status(201).json({
      message: "Order created",
      currentPlan,
      requestedPlan: plan,
      amount: amount * 100,
      currency: plans[plan].currency,
      razorpayOrderId: order.id,
      paymentId: payment.id,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "API not working correctly",
    });
  }
};
