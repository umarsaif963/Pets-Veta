import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FaBookmark,
  FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaShoppingCart,
  FaStore,
} from "react-icons/fa";

import Button from "@/shared/components/Button/Button";
import Card from "@/shared/components/Card/Card";
import SellerHeader from "../components/SellerHeader";
import SellerSidebar from "../components/SellerSidebar";

import {
  fetchSavedMarketplaceListings,
  getProductImage,
  getProductPrice,
  getSellerName,
  removeMarketplaceListing,
  toDisplayCategory,
  type MarketplaceProduct,
} from "@/features/marketplace1/api/marketplace.api";
import { addToCart } from "@/features/cart/utils/cartStorage";

type SavedListingItem = {
  productId: string;
  product: MarketplaceProduct;
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

const SellerSavedListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // 💡 Add Search Param hook

  const [savedListings, setSavedListings] = useState<SavedListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  const loadSavedListings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchSavedMarketplaceListings();
      setSavedListings(data);
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.response?.status === 401) {
        navigate("/login", {
          state: { redirectTo: "/seller/saved-listings" },
        });
        return;
      }

      setError(
        apiError.response?.data?.message ||
        "Unable to load saved listings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, searchParams, setSearchParams]);

  useEffect(() => {
    void loadSavedListings();
  }, [loadSavedListings]);

  const handleRemoveSaved = async (productId: string) => {
    try {
      setRemovingId(productId);
      setError("");
      setCartMessage("");

      await removeMarketplaceListing(productId);

      setSavedListings((currentListings) =>
        currentListings.filter((item) => item.productId !== productId)
      );
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
        "Unable to remove this listing from saved."
      );
    } finally {
      setRemovingId("");
    }
  };

  const handleAddToCart = (product: MarketplaceProduct) => {
    setError("");
    setCartMessage("");

    if (product.status !== "ACTIVE" || product.stock <= 0) {
      setError("This listing is not available right now.");
      return;
    }

    const result = addToCart({
      productId: product.id,
      title: product.title,
      price: getProductPrice(product),
      image: getProductImage(product),
      quantity: 1,
      sellerId: product.sellerId,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setCartMessage(result.message);
  };

  return (
    <div className="flex min-h-screen bg-[#f7fbfb] text-[#20263D]">
      <SellerSidebar />

      <main className="flex-1">
        <SellerHeader />

        <section className="mx-auto max-w-[1600px] p-7">

          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#178f95]">
                Marketplace Wishlist
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
                Saved Listings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                These are the pets and products you saved from the marketplace
                for later. Saved listings are not your own sale listings.
              </p>
            </div>

            <Button onClick={() => navigate("/marketplace1")}>
              Explore Marketplace
            </Button>
          </div>

          {error && (
            <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {cartMessage && (
            <p className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {cartMessage}
            </p>
          )}

          {loading && (
            <Card className="flex min-h-[260px] items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#178f95] border-t-transparent" />
            </Card>
          )}

          {!loading && savedListings.length === 0 && (
            <Card className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#178f95]/10 text-3xl text-[#178f95]">
                <FaRegHeart />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                No saved listings yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Browse the marketplace and click save on any pet or product you
                want to revisit later.
              </p>

              <Button className="mt-6" onClick={() => navigate("/marketplace1")}>
                Browse Marketplace
              </Button>
            </Card>
          )}

          {!loading && savedListings.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {savedListings.map(({ productId, product }) => {
                const image = getProductImage(product);
                const price = getProductPrice(product);
                const sellerName = getSellerName(product);
                const isUnavailable =
                  product.status !== "ACTIVE" || product.stock <= 0;

                return (
                  <Card key={productId} className="overflow-hidden p-0">
                    <div className="relative h-48 bg-gray-50">
                      <img
                        src={image}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#178f95] shadow-sm">
                        {toDisplayCategory(product.category)}
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleRemoveSaved(productId)}
                        disabled={removingId === productId}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
                        aria-label="Remove saved listing"
                      >
                        <FaHeart />
                      </button>

                      {isUnavailable && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                          Not Available
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="min-h-[52px]">
                        <h3 className="line-clamp-2 text-base font-bold text-gray-900">
                          {product.title}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-[#178f95]">
                          PKR {price.toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2 text-xs font-medium text-gray-500">
                        <p className="flex items-center gap-2">
                          <FaStore className="text-[#178f95]" />
                          {sellerName}
                        </p>

                        <p className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#178f95]" />
                          {product.location ||
                            product.seller?.city ||
                            "Location not added"}
                        </p>

                        <p className="flex items-center gap-2">
                          <FaBookmark className="text-[#178f95]" />
                          Stock: {product.stock}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/marketplace/product/${product.id}`)
                          }
                        >
                          View
                        </Button>

                        <Button
                          size="sm"
                          disabled={isUnavailable}
                          onClick={() => handleAddToCart(product)}
                          className="gap-2"
                        >
                          <FaShoppingCart />
                          Cart
                        </Button>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleRemoveSaved(productId)}
                        disabled={removingId === productId}
                        className="mt-4 w-full text-center text-xs font-bold text-red-500 transition hover:text-red-600 disabled:opacity-60"
                      >
                        {removingId === productId
                          ? "Removing..."
                          : "Remove from saved"}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SellerSavedListingsPage;
