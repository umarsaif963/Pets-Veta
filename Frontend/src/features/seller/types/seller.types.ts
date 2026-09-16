import type { MarketplaceProduct } from "@/features/marketplace1/api/marketplace.api";
import type { SellerOrder } from "../api/seller.api";

export type SellerApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

export type SellerProfile = {
  id: string;
  userId: string;
  businessName: string | null;
  businessAddress: string | null;
  phoneNumber: string | null;
  city: string | null;
  storeDescription: string | null;
  storeLogo: string | null;
  isActive: boolean;
  isVerified: boolean;
  stripeOnboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName?: string | null;
    name?: string | null;
    username?: string | null;
    email: string;
    phone?: string | null;
    profileImageUrl?: string | null;
  };
  products?: MarketplaceProduct[];
};

export type SellerProfileResponse = {
  success: boolean;
  data: SellerProfile;
};

export type ProductPreviewCardProps = {
  image: string;
  title: string;
  category: string;
  price: string;
  stock: string;
  location: string;
  description: string;
  status: string;
};

export type ProductImageUploadProps = {
  previews: string[];
  onImageChange: (files: File[]) => void;
};

export type ProductCardProps = {
  product: MarketplaceProduct;
  stockUpdating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onStockChange: (productId: string, stock: number) => void;
  onMarkSoldOut: (productId: string) => void;
};

export type OrdersTableProps = {
  orders: SellerOrder[];
};

export type StockTableProps = {
  products: MarketplaceProduct[];
  onStockChange: (productId: string, stock: number) => void;
};

export type RecentOrdersProps = {
  orders: SellerOrder[];
  onViewAll: () => void;
};

export type StockOverviewProps = {
  products: MarketplaceProduct[];
};

export type SellerStatCardProps = {
  title: string;
  value: string;
  subtitle: string;
};