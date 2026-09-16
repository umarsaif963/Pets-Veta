import { type ChangeEvent, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import Button from "@/shared/components/Button/Button";
import Input from "@/shared/components/Input/Input";
import {
    sellerProfileSchema,
    type SellerProfileFormData,
} from "../schemas/sellerProfile.schema";
import type { SellerProfile } from "../types/seller.types";

export interface EditSellerProfileModalProps {
    profile: SellerProfile;
    isSaving: boolean;
    error?: string;
    onCancel: () => void;
    onSubmit: (data: SellerProfileFormData) => void;
}

const EditSellerProfileModal = ({
    profile,
    isSaving,
    error,
    onCancel,
    onSubmit,
}: EditSellerProfileModalProps) => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<SellerProfileFormData>({
        resolver: zodResolver(sellerProfileSchema),
        defaultValues: {
            businessName: profile.businessName || "",
            phoneNumber: profile.phoneNumber || "",
            city: profile.city || "",
            businessAddress: profile.businessAddress || "",
            storeDescription: profile.storeDescription || "",
        },
    });

    const storeLogoFile = useWatch({ control, name: "storeLogo" });

    const fallbackLogo = "https://ui-avatars.com/api/?name=Seller+Store&background=E8F7F7&color=178f95";
    const currentLogoUrl = profile.storeLogo || fallbackLogo;

    const logoPreviewUrl = useMemo(() => {
        if (storeLogoFile && storeLogoFile instanceof File) {
            return URL.createObjectURL(storeLogoFile);
        }
        return currentLogoUrl;
    }, [storeLogoFile, currentLogoUrl]);

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setValue("storeLogo", file, { shouldDirty: true, shouldValidate: true });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 px-4 py-6 flex items-center justify-center backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Store Profile</h2>
                        <p className="mt-1 text-sm text-gray-500">Update your public brand listings and settings.</p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 border border-red-100">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    {/* Logo Upload Uploader */}
                    <div className="flex justify-center mb-6">
                        <label className="group relative cursor-pointer block">
                            <span className="block h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-md">
                                <img
                                    src={logoPreviewUrl}
                                    alt="Store Logo"
                                    className="h-full w-full object-cover"
                                />
                            </span>

                            <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#178f95] text-white shadow-sm transition group-hover:bg-[#12757a]">
                                <Camera size={16} />
                            </span>

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={handleLogoChange}
                            />
                        </label>
                    </div>

                    {errors.storeLogo && (
                        <p className="text-center text-xs font-bold text-red-600">
                            {errors.storeLogo.message as string}
                        </p>
                    )}

                    <Input
                        label="Business Name"
                        placeholder="e.g., Happy Paws Store"
                        error={errors.businessName?.message}
                        {...register("businessName")}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <Input
                            label="Contact Phone"
                            placeholder="e.g., +923001234567"
                            error={errors.phoneNumber?.message}
                            {...register("phoneNumber")}
                        />

                        <Input
                            label="City"
                            placeholder="e.g., Lahore"
                            error={errors.city?.message}
                            {...register("city")}
                        />
                    </div>

                    <Input
                        label="Store Address"
                        placeholder="e.g., Suite 12, Gulberg Boulevard"
                        error={errors.businessAddress?.message}
                        {...register("businessAddress")}
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Store Description
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Write a brief overview of your business..."
                            className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm font-semibold outline-none transition-all duration-300 placeholder:text-slate-400 ${errors.storeDescription
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-slate-200 focus:border-[#178f95] focus:ring-4 focus:ring-[#178f95]/10"
                                }`}
                            {...register("storeDescription")}
                        />
                        {errors.storeDescription && (
                            <p className="mt-1 text-xs font-bold text-red-500">
                                {errors.storeDescription.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="!bg-[#178f95] !border-[#178f95] !text-white hover:!bg-[#12757a]"
                            loading={isSaving}
                            loadingText="Saving Settings..."
                        >
                            Save Brand Settings
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSellerProfileModal;