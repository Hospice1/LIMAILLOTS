import { Product } from "@/types/store";

export type ReviewStatus = "published" | "pending" | "removed";

export interface AdminChangeHistoryItem {
  id: string;
  message: string;
  createdAt: string;
}

export interface ClientReview {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  status: ReviewStatus;
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdminClient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  totalSpent: number;
  completedOrders: number;
  pendingCarts: number;
  favoriteProductIds: string[];
  promoCodesUsed: string[];
  reviews: ClientReview[];
  notifications: ClientNotification[];
  lastActivityAt: string;
  deletedAt?: string;
  deletedReason?: string;
}

export interface AdminPromoCode {
  id: string;
  code: string;
  discountPercent: number;
  minSubtotal: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminMarqueeSettings {
  promoCode: string;
  message: string;
}

export interface AdminSalesPoint {
  period: string;
  revenue: number;
  orders: number;
}

export interface AdminOrder {
  id: string;
  clientId: string;
  total: number;
  status: "completed" | "pending";
  promoCode?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
}

export interface AdminStateData {
  products: Product[];
  clients: AdminClient[];
  promoCodes: AdminPromoCode[];
  marquee: AdminMarqueeSettings;
  sales: AdminSalesPoint[];
  orders: AdminOrder[];
  changeHistory: AdminChangeHistoryItem[];
}

export interface AdminSettings {
  adminEmail: string;
  recoveryEmail: string;
  updatedAt: string;
}

export interface AdminDatabase extends AdminStateData {
  settings: AdminSettings;
}

export interface PublicStoreState {
  products: Product[];
  promoCodes: AdminPromoCode[];
  marquee: AdminMarqueeSettings;
  clients: AdminClient[];
  orders: AdminOrder[];
}
