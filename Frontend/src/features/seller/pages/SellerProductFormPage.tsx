import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
// 💡 Corrected: Included Loader2 in the lucide-react import list
import { AlertTriangle, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import Card from "@/shared/components/Card/Card";
import SellerHeader from "../components/SellerHeader";
import SellerSidebar from "../components/SellerSidebar";
import ProductImageUpload from "../components/ProductImageUpload";
import ProductPreviewCard from "../components/ProductPreviewCard";

import {
  toBackendCategory,
  toDisplayCategory,
} from "@/features/marketplace1/api/marketplace.api";
import {
  createSellerProduct,
  fetchSellerProducts,
  updateSellerProduct,
  fetchMySellerProfileApi,
} from "../api/seller.api";
import {
  sellerProductSchema,
  type SellerProductFormData,
} from "../schemas/sellerProduct.schema";

const toBackendStatus = (status: string) => {
  const map: Record<string, string> = {
    Active: "ACTIVE",
    Draft: "DRAFT",
    "Sold Out": "SOLD_OUT",
  };
  return map[status] || status;
};

const toDisplayStatus = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    DRAFT: "Draft",
    SOLD_OUT: "Sold Out",
  };
  return map[status] || status;
};

const productFormDefaultValues: SellerProductFormData = {
  title: "",
  category: "Food",
  price: "",
  stock: "1",
  location: "",
  description: "",
  status: "Active",
};

const SellerProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [previews, setPreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // State to verify if the seller has completed Stripe onboarding
  const [stripeOnboardingCompleted, setStripeOnboardingCompleted] = useState<boolean>(false);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SellerProductFormData>({
    resolver: zodResolver(sellerProductSchema),
    defaultValues: productFormDefaultValues,
  });

  const form = useWatch({ control });
  const isEditMode = Boolean(id);

  // Dynamic Rule check: Is the seller trying to list non-pet categories without Stripe Connect?
  const showStripeRestrictionWarning =
    form.category !== "Pets" && !stripeOnboardingCompleted;

  useEffect(() => {
    let ignore = false;

    // Load Seller's Stripe Profile credentials
    const checkSellerStripeCredentials = async () => {
      try {
        setLoadingProfile(true);
        const response = await fetchMySellerProfileApi();
        if (!ignore && response.success) {
          setStripeOnboardingCompleted(response.data.stripeOnboardingCompleted ?? false);
        }
      } catch (err) {
        console.error("Failed to load seller Stripe status details:", err);
      } finally {
        if (!ignore) {
          setLoadingProfile(false);
        }
      }
    };

    const loadProductForEdit = async () => {
      if (!id) return;
      try {
        const products = await fetchSellerProducts();
        const product = products.find((item) => item.id === id);

        if (!product) {
          setError("Listing not found.");
          return;
        }

        if (!ignore) {
          reset({
            title: product.title,
            category: toDisplayCategory(
              product.category
            ) as SellerProductFormData["category"],
            price: String(product.price),
            stock: String(product.stock),
            location: product.location || "",
            description: product.description || "",
            status: toDisplayStatus(
              product.status
            ) as SellerProductFormData["status"],
          });

          setPreviews(product.images?.map((image) => image.publicUrl) || []);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate("/login", { state: { redirectTo: `/seller/edit-product/${id}` } });
          return;
        }
        if (!ignore) {
          setError("Unable to load the listing for editing. Please try again.");
        }
      }
    };

    checkSellerStripeCredentials();
    loadProductForEdit();

    return () => {
      ignore = true;
    };
  }, [id, navigate, reset]);

  const onSubmit = async (data: SellerProductFormData) => {
    // Extra frontend safeguard check
    if (data.category !== "Pets" && !stripeOnboardingCompleted) {
      setError("You must link your bank details in your profile to list e-commerce items.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = new FormData();

      payload.append("title", data.title);
      payload.append("description", data.description || "");
      payload.append("category", toBackendCategory(data.category));
      payload.append("status", toBackendStatus(data.status));
      payload.append("price", data.price);
      payload.append("stock", data.stock);
      payload.append("location", data.location || "");

      imageFiles.forEach((file) => {
        payload.append("images", file);
      });

      if (id) {
        await updateSellerProduct(id, payload);
      } else {
        await createSellerProduct(payload);
      }

      setMessage(
        isEditMode
          ? "Listing updated successfully."
          : "Listing saved successfully."
      );

      navigate("/seller/listings");
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { redirectTo: "/seller/add-product" } });
        return;
      }
      setError(err?.response?.data?.message || "Unable to save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen bg-[#f7fbfb] items-center justify-center p-10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#178f95] mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-500">Checking store listing permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7fbfb]">
      <SellerSidebar />

      <main className="flex-1">
        <SellerHeader />

        <section className="p-6">

          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#178f95]">
              Marketplace Listing
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              {isEditMode ? "Edit Listing" : "Add Listing"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Dashboard / Add / Edit Product
            </p>
          </div>

          {/* Restricted Overlay Warning block when category is restricted and Stripe unlinked */}
          {showStripeRestrictionWarning && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-900 text-base">Stripe Connected Payout Wallet Required</h3>
                  <p className="text-sm font-medium text-amber-700 leading-relaxed mt-1">
                    Selling physical commodities like **{form.category}** requires active bank settlements. Please finalize your Stripe Connect settings in your profile first. You can still list live animals (**Pets**) without linking an account.
                  </p>
                </div>
              </div>
              
              <Link
                to="/seller/profile"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#15265d] px-5 text-sm font-bold text-white transition hover:bg-[#101e4c] shrink-0"
              >
                <CreditCard size={15} />
                Link Stripe Wallet
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <Card>
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Listing Information
              </h2>

              {message && (
                <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Product Title"
                    error={errors.title?.message}
                    {...register("title")}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Category
                    </label>

                    <select
                      {...register("category")}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#178f95]"
                    >
                      <option>Food</option>
                      <option>Pets</option>
                      <option>Accessories</option>
                    </select>

                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Price (PKR)"
                    type="number"
                    min="1"
                    error={errors.price?.message}
                    {...register("price")}
                  />

                  <Input
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    error={errors.stock?.message}
                    {...register("stock")}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Location"
                      error={errors.location?.message}
                      {...register("location")}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      {...register("description")}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#178f95]"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <ProductImageUpload
                    previews={previews}
                    onImageChange={(files) => {
                      setImageFiles(files);
                      setPreviews(
                        files.map((file) => URL.createObjectURL(file))
                      );
                    }}
                  />

                  <div className="grid content-start gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        {...register("status")}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#178f95]"
                      >
                        <option>Active</option>
                        <option>Draft</option>
                        <option>Sold Out</option>
                      </select>

                      {errors.status && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/seller/listings")}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : isEditMode
                        ? "Update Listing"
                        : "Save Listing"}
                  </Button>
                </div>
              </form>
            </Card>

            <ProductPreviewCard
              image={previews[0] || ""}
              title={form.title || ""}
              category={form.category || ""}
              price={form.price || ""}
              stock={form.stock || ""}
              location={form.location || ""}
              description={form.description || ""}
              status={form.status || ""}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default SellerProductFormPage;