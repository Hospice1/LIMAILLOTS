import { AdminClient, AdminOrder } from "@/types/admin";

export interface ProductRatingSummary {
  rating: number;
  reviewCount: number;
  soldUnits: number;
  completedOrders: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function safeLogSignal(value: number): number {
  return Math.log1p(Math.max(0, value));
}

export function getProductRatingSummary(
  productId: string,
  clients: AdminClient[],
  orders: AdminOrder[],
): ProductRatingSummary {
  const publishedReviews = clients.flatMap((client) =>
    client.reviews.filter(
      (review) => review.productId === productId && review.status === "published",
    ),
  );

  const reviewCount = publishedReviews.length;
  const reviewAverage =
    reviewCount > 0
      ? publishedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  const completedOrdersForProduct = orders.filter(
    (order) =>
      order.status === "completed" &&
      order.items.some((item) => item.productId === productId),
  );

  const soldUnits = completedOrdersForProduct.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce(
        (orderSum, item) =>
          item.productId === productId ? orderSum + Math.max(0, Math.floor(item.quantity)) : orderSum,
        0,
      )
    );
  }, 0);

  const completedOrders = completedOrdersForProduct.length;
  const salesSignal = clamp(2.8 + safeLogSignal(soldUnits) * 0.7 + safeLogSignal(completedOrders) * 0.2, 1, 5);
  const blendedRating = reviewCount > 0
    ? reviewAverage * 0.72 + salesSignal * 0.28
    : salesSignal;

  return {
    rating: roundToOneDecimal(clamp(blendedRating, 1, 5)),
    reviewCount,
    soldUnits,
    completedOrders,
  };
}
