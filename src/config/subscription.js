export const getEffectivePlan = (subscription) => {
  if (!subscription) {
    return "none";
  }

  if (subscription.status === "pending") {
    return "none";
  }

  if (
    subscription.status === "expired" ||
    (subscription.expiryDate &&
      new Date(subscription.expiryDate) <= new Date())
  ) {
    return "free";
  }

  return subscription.plan;
};