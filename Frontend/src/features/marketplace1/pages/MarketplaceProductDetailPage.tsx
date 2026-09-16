import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/Auth/hooks/authhook";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaComments,
  FaHeart,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";

import Button from "@/shared/components/Button/Button";
import Card from "@/shared/components/Card/Card";
import { addToCart } from "@/features/cart/utils/cartStorage";
import { createOrGetDirectConversationApi } from "@/features/messages/api/message.api";

import {
  fetchMarketplaceProductById,
  getProductImage,
  getProductPrice,
  getSellerName,
  saveMarketplaceListing,
  toDisplayCategory,
  type MarketplaceProduct,
} from "../api/marketplace.api";

const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80";

const getCleanImageUrls = (
  product: MarketplaceProduct,
  failedImages: string[]
) => {
  const uploadedImages =
    product.images
      ?.map((image) => image.publicUrl?.trim())
      .filter((url): url is string => Boolean(url)) || [];

  const uniqueImages = Array.from(new Set(uploadedImages));

  const workingImages = uniqueImages.filter(
    (url) => !failedImages.includes(url)
  );

  if (workingImages.length > 0) {
    return workingImages;
  }

  const fallbackImage = getProductImage(product);

  if (fallbackImage && !failedImages.includes(fallbackImage)) {
    return [fallbackImage];
  }

  return [DEFAULT_LISTING_IMAGE];
};

const MarketplaceProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saveMessage, setSaveMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartNotice, setCartNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState("");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/marketplace1");
  };

  useEffect(() => {
    let ignore = false;

    const loadProduct = async () => {
      if (!id) {
        setError("Listing id missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMarketplaceProductById(id);

        if (!ignore) {
          setProduct(data);
        }
      } catch {
        if (!ignore) {
          setError("Listing not found.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setFailedImages([]);
  }, [product?.id]);

  const productImages = useMemo(() => {
    if (!product) return [];

    return getCleanImageUrls(product, failedImages);
  }, [failedImages, product]);

  useEffect(() => {
    if (selectedImageIndex >= productImages.length) {
      setSelectedImageIndex(0);
    }
  }, [productImages.length, selectedImageIndex]);

  const handleImageError = (imageUrl: string) => {
    if (imageUrl === DEFAULT_LISTING_IMAGE) return;

    setFailedImages((currentFailedImages) => {
      if (currentFailedImages.includes(imageUrl)) {
        return currentFailedImages;
      }

      return [...currentFailedImages, imageUrl];
    });

    setSelectedImageIndex(0);
  };

  const handlePreviousImage = () => {
    if (productImages.length <= 1) return;

    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? productImages.length - 1 : currentIndex - 1
    );
  };

  const handleNextImage = () => {
    if (productImages.length <= 1) return;

    setSelectedImageIndex((currentIndex) =>
      currentIndex === productImages.length - 1 ? 0 : currentIndex + 1
    );
  };

  const handleAddToCart = () => {
    if (!product || isAddingToCart) return;

    setCartNotice(null);
    setSaveMessage("");
    setMessageError("");

    if (product.status !== "ACTIVE" || product.stock <= 0) {
      setCartNotice({
        type: "error",
        message: "This listing is not available right now.",
      });
      return;
    }

    setIsAddingToCart(true);

    window.setTimeout(() => {
      const result = addToCart({
        productId: product.id,
        title: product.title,
        price: getProductPrice(product),
        image: productImages[0] || getProductImage(product),
        quantity: 1,
        sellerId: product.sellerId,
      });

      if (!result.success) {
        setCartNotice({
          type: "error",
          message: result.message,
        });

        setIsAddingToCart(false);
        return;
      }

      setCartNotice({
        type: "success",
        message: result.message || "Listing added to cart successfully.",
      });

      setIsAddingToCart(false);
    }, 350);
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setCartNotice(null);
      setSaveMessage("");
      setMessageError("");

      await saveMarketplaceListing(product.id);
      setSaveMessage("Listing saved.");
    } catch {
      navigate("/login", {
        state: { redirectTo: `/marketplace/product/${product.id}` },
      });
    }
  };

  const handleMessageSeller = async () => {
    if (!product) return;

    const currentUserId = user?.data?.id;
    const sellerUserId = product.seller?.user?.id;

    setCartNotice(null);
    setSaveMessage("");
    setMessageError("");

    if (!currentUserId) {
      navigate("/login", {
        state: { redirectTo: `/marketplace/product/${product.id}` },
      });
      return;
    }

    if (!sellerUserId) {
      setMessageError("Seller account not found for this listing.");
      return;
    }

    if (sellerUserId === currentUserId) {
      setMessageError("You cannot message your own listing.");
      return;
    }

    try {
      setMessageLoading(true);

      const conversation = await createOrGetDirectConversationApi(
        sellerUserId,
        "MARKETPLACE_PRODUCT",
        product.id
      );

      navigate(`/messages?conversationId=${conversation.id}`);
    } catch (chatError) {
      console.error("Message seller failed:", chatError);
      setMessageError(
        "Unable to open chat. Please check backend and login session."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7fbfb] px-5 pb-8 pt-28 lg:px-12">
        <div className="mb-6">
          <BackToMarketplaceButton onClick={handleBack} />
        </div>

        <Card>
          <h1 className="text-2xl font-semibold text-gray-900">
            Loading listing...
          </h1>
        </Card>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="min-h-screen bg-[#f7fbfb] px-5 pb-8 pt-28 lg:px-12">
        <div className="mb-6">
          <BackToMarketplaceButton onClick={handleBack} />
        </div>

        <Card>
          <h1 className="text-2xl font-semibold text-gray-900">
            {error || "Listing not found"}
          </h1>
        </Card>
      </main>
    );
  }

  const safeSelectedImageIndex =
    selectedImageIndex >= productImages.length ? 0 : selectedImageIndex;

  const selectedImage =
    productImages[safeSelectedImageIndex] || DEFAULT_LISTING_IMAGE;

  const thumbnailImages = productImages.slice(0, 5);

  const price = getProductPrice(product);
  const seller = getSellerName(product);
  const displayCategory = toDisplayCategory(product.category);
  const isOwnListing = user?.data?.id === product.seller?.user?.id;
  const isUnavailable = product.status !== "ACTIVE" || product.stock <= 0;
  const hasMultipleImages = productImages.length > 1;

  return (
    <main className="min-h-screen bg-[#f7fbfb] px-5 pb-8 pt-28 lg:px-12">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <BackToMarketplaceButton onClick={handleBack} />

          <p className="mt-4 text-sm text-gray-500">
            Marketplace / {displayCategory} / {product.title}
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/marketplace1")}>
          View Marketplace
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
        <Card className="overflow-hidden p-0">
          <div className="relative flex h-[520px] items-center justify-center bg-white">
            <img
              key={selectedImage}
              src={selectedImage}
              alt={product.title}
              onError={() => handleImageError(selectedImage)}
              className="h-full w-full object-contain p-4"
            />

            {isUnavailable && (
              <span className="absolute left-5 top-5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm">
                Sold Out
              </span>
            )}

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#07182c] shadow-md transition hover:bg-[#178f95] hover:text-white"
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#07182c] shadow-md transition hover:bg-[#178f95] hover:text-white"
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            <span className="absolute bottom-5 right-5 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
              {safeSelectedImageIndex + 1} / {productImages.length}
            </span>
          </div>

          {hasMultipleImages && (
            <div
              className="border-t border-gray-100 bg-white px-4 py-4"
              data-lenis-prevent
            >
              <div className="mx-auto flex w-fit max-w-full justify-center gap-3 overflow-x-auto pb-1">
                {thumbnailImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-gray-50 transition sm:h-28 sm:w-28 ${safeSelectedImageIndex === index
                        ? "border-[#178f95] ring-2 ring-[#178f95]/20"
                        : "border-gray-200 hover:border-[#178f95]"
                      }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      onError={() => handleImageError(image)}
                      className="h-full w-full object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <span className="rounded-full bg-[#178f95]/10 px-3 py-1 text-sm font-semibold text-[#178f95]">
            {displayCategory}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold text-[#07182c]">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            <span className="font-semibold text-gray-700">New</span>
            <span className="text-gray-500">
              {isUnavailable
                ? "Unavailable listing"
                : "Active marketplace listing"}
            </span>
          </div>

          <p className="mt-6 text-3xl font-extrabold text-[#07182c]">
            PKR {price.toLocaleString()}
          </p>

          <p className="mt-5 leading-7 text-gray-600">
            {product.description || "No description provided."}
          </p>

          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <FaStore className="text-[#178f95]" />
              Seller: {seller}

              {isOwnListing && (
                <span className="ml-1 rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">
                  Your Listing
                </span>
              )}
            </p>

            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-[#178f95]" />
              Location: {product.location || product.seller?.city || "Pakistan"}
            </p>

            <p className="flex items-center gap-2">
              <FaShieldAlt className="text-[#178f95]" />
              Pets-Veta marketplace user
            </p>
          </div>

          <p
            className={`mt-5 text-sm font-medium ${isUnavailable ? "text-red-600" : "text-green-600"
              }`}
          >
            {isUnavailable ? "Not Available" : "In Stock"}{" "}
            <span className="text-gray-500">{product.stock} available</span>
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {isOwnListing ? (
              <Button
                className="gap-2 !border-slate-200 !bg-gray-100 !text-slate-700 hover:!bg-slate-200"
                onClick={() => navigate(`/seller/edit-product/${product.id}`)}
              >
                Edit Listing
              </Button>
            ) : (
              <Button
                className="gap-2 !border-[#178f95] !bg-[#178f95] !text-white hover:!bg-[#12757a]"
                onClick={handleAddToCart}
                disabled={isUnavailable || isAddingToCart}
              >
                <FaShoppingCart />
                {isAddingToCart
                  ? "Adding..."
                  : isUnavailable
                    ? "Not Available"
                    : "Add to Cart"}
              </Button>
            )}

            {isOwnListing ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/seller/listings")}
              >
                View All Listings
              </Button>
            ) : (
              <Button variant="outline" className="gap-2" onClick={handleSave}>
                <FaHeart />
                Save Listing
              </Button>
            )}
          </div>

          {cartNotice && (
            <div
              className={`mt-3 rounded-lg px-4 py-3 text-sm font-semibold ${cartNotice.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
                }`}
            >
              <div className="flex items-start gap-2">
                {cartNotice.type === "success" && (
                  <FaCheckCircle className="mt-0.5 shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                  <p>{cartNotice.message}</p>

                  {cartNotice.type === "success" && (
                    <button
                      type="button"
                      onClick={() => navigate("/cart")}
                      className="mt-1 font-black text-[#178f95] underline-offset-2 transition hover:underline"
                    >
                      View Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {saveMessage && (
            <p className="mt-3 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              {saveMessage}
            </p>
          )}

          {!isOwnListing && (
            <Button
              variant="outline"
              className="mt-3 w-full gap-2"
              onClick={handleMessageSeller}
              disabled={messageLoading}
            >
              <FaComments />
              {messageLoading ? "Opening Chat..." : "Message Seller"}
            </Button>
          )}

          {messageError && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
              {messageError}
            </p>
          )}
        </Card>
      </div>
    </main>
  );
};

const BackToMarketplaceButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#07182c] shadow-sm transition hover:border-[#178f95] hover:text-[#178f95]"
    >
      <FaArrowLeft />
      Back
    </button>
  );
};

export default MarketplaceProductDetailPage;