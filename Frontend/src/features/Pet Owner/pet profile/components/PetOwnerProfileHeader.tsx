import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Camera,
  Check,
  Info,
  Mail,
  Pencil,
  Phone,
  Store,
  UserRound,
  X,
} from "lucide-react";

import Button from "@/shared/components/Button/Button";
import Card from "@/shared/components/Card/Card";
import { useAuth } from "@/features/Auth/hooks/authhook";
import { updatePetOwnerProfileApi } from "../api/petOwnerProfile.api";
import {
  petOwnerProfileSchema,
  type PetOwnerProfileFormData,
} from "../schemas/petOwnerProfile.schema";

import type {
  PetOwnerProfile,
  ProfileMetaProps,
} from "../types/petProfile.types";

type PetOwnerProfileHeaderProps = {
  profile: PetOwnerProfile;
  onProfileSaved: (profile: PetOwnerProfile) => void;
};

const DEFAULT_USER_BIO =
  "Manage your pets, veterinary appointments, and health information from one place.";

const getSafeProfileImage = (profileImageUrl?: string) => {
  if (!profileImageUrl) return "";
  if (profileImageUrl.toLowerCase().includes("enter your image")) return "";

  return profileImageUrl;
};

const getFallbackProfileImage = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Pet Owner",
  )}&background=EAF7F5&color=078b91`;
};

const PetOwnerProfileHeader = ({
  profile,
  onProfileSaved,
}: PetOwnerProfileHeaderProps) => {
  const { setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const fallbackProfileImage = useMemo(
    () => getFallbackProfileImage(profile.fullName),
    [profile.fullName],
  );

  const profileImage =
    imagePreview || getSafeProfileImage(profile.profileImageUrl) || fallbackProfileImage;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PetOwnerProfileFormData>({
    resolver: zodResolver(petOwnerProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      username: profile.username,
      phone: profile.phone || "",
      bio: profile.bio || DEFAULT_USER_BIO,
    },
  });

  const bioValue = watch("bio") || "";

  useEffect(() => {
    reset({
      fullName: profile.fullName,
      username: profile.username,
      phone: profile.phone || "",
      bio: profile.bio || DEFAULT_USER_BIO,
    });

    setImagePreview("");
    setProfileError("");
  }, [profile, reset]);

  const handleCancelEdit = () => {
    reset({
      fullName: profile.fullName,
      username: profile.username,
      phone: profile.phone || "",
      bio: profile.bio || DEFAULT_USER_BIO,
    });

    setImagePreview("");
    setProfileError("");
    setIsEditing(false);
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;

    setValue("profileImage", file, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (data: PetOwnerProfileFormData) => {
    try {
      setIsSaving(true);
      setProfileError("");

      const response = await updatePetOwnerProfileApi({
        fullName: data.fullName,
        username: data.username,
        phone: data.phone,
        bio: data.bio,
        profileImage: data.profileImage,
      });

      onProfileSaved(response.data);

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              data: {
                ...currentUser.data,
                name: response.data.fullName,
                username: response.data.username,
                profileImageUrl: response.data.profileImageUrl,
              },
            }
          : currentUser,
      );

      setImagePreview("");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);

      const message =
        axios.isAxiosError(error) &&
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Unable to update your profile. Please try again.";

      setProfileError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-[#178f95] via-[#20a3aa] to-[#F9C5A8] px-6 py-8 text-white sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80">
              My Profile
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Account & Seller Identity
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
              Your profile image, username, phone number, and description are
              also used as your marketplace seller identity.
            </p>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-fit gap-2 !border-white/30 !bg-white !text-[#178f95] hover:!bg-white/90"
            >
              <Pencil size={16} />
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="gap-2 !border-white/60 !bg-white/10 !text-white hover:!bg-white/20"
              >
                <X size={16} />
                Cancel
              </Button>

              <Button
                type="submit"
                form="pet-owner-inline-profile-form"
                disabled={isSaving}
                className="gap-2 !bg-white !text-[#178f95] hover:!bg-white/90"
              >
                <Check size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <form
        id="pet-owner-inline-profile-form"
        onSubmit={handleSubmit(handleProfileSubmit)}
        className="p-6 sm:p-8"
      >
        {profileError && (
          <p className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {profileError}
          </p>
        )}

        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-gray-100 bg-[#f8fbfb] p-5 text-center">
            <div className="relative mx-auto h-40 w-40">
              <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-[#EAF7F5] shadow-lg">
                <img
                  src={profileImage}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = fallbackProfileImage;
                  }}
                />
              </div>

              {isEditing && (
                <label className="absolute bottom-1 right-1 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#178f95] text-white shadow-md transition hover:bg-[#12757a]">
                  <Camera size={18} />

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) =>
                      handleImageChange(event.target.files?.[0])
                    }
                  />
                </label>
              )}
            </div>

            {errors.profileImage?.message && (
              <p className="mt-3 text-xs font-semibold text-red-600">
                {errors.profileImage.message}
              </p>
            )}

            <div className="mt-5">
              <h2 className="text-xl font-black text-[#101b3d]">
                {profile.fullName}
              </h2>

              <p className="mt-1 text-sm font-bold text-[#178f95]">
                @{profile.username}
              </p>

            </div>
          </div>

          <div className="min-w-0">
            {!isEditing ? (
              <div className="grid gap-5">
                <div>
                  <h3 className="text-2xl font-black tracking-[-0.03em] text-[#101b3d]">
                    {profile.fullName}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-600">
                    {profile.bio || DEFAULT_USER_BIO}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileMeta
                    icon={<UserRound size={18} />}
                    label="Username / Store Name"
                    value={`@${profile.username}`}
                  />

                  <ProfileMeta
                    icon={<Mail size={18} />}
                    label="Email"
                    value={profile.email}
                  />

                  <ProfileMeta
                    icon={<Phone size={18} />}
                    label="Phone"
                    value={profile.phone || "Not added"}
                  />

                  <ProfileMeta
                    icon={<Store size={18} />}
                    label="Marketplace Identity"
                    value="Pet Owner & Seller"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <ProfileInput
                    label="Full Name"
                    error={errors.fullName?.message}
                  >
                    <input
                      {...register("fullName")}
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#178f95] focus:ring-4 focus:ring-[#178f95]/10"
                      placeholder="Enter full name"
                    />
                  </ProfileInput>

                  <ProfileInput
                    label="Username / Store Name"
                    error={errors.username?.message}
                  >
                    <input
                      {...register("username")}
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#178f95] focus:ring-4 focus:ring-[#178f95]/10"
                      placeholder="Enter username"
                    />
                  </ProfileInput>

                  <ProfileInput label="Email">
                    <input
                      value={profile.email}
                      disabled
                      className="h-12 w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 text-sm font-semibold text-gray-500 outline-none"
                    />

                    <p className="mt-2 flex items-start gap-2 text-xs font-medium leading-5 text-gray-400">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      Email is used for login and verification. It cannot be
                      changed here.
                    </p>
                  </ProfileInput>

                  <ProfileInput
                    label="Phone Number"
                    error={errors.phone?.message}
                  >
                    <input
                      {...register("phone")}
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#178f95] focus:ring-4 focus:ring-[#178f95]/10"
                      placeholder="03000000000"
                    />
                  </ProfileInput>
                </div>

                <ProfileInput
                  label="Bio / Profile Description"
                  error={errors.bio?.message}
                >
                  <textarea
                    {...register("bio")}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-gray-800 outline-none transition focus:border-[#178f95] focus:ring-4 focus:ring-[#178f95]/10"
                    placeholder="Write a short description about yourself..."
                  />

                  <p className="mt-2 text-right text-xs font-semibold text-gray-400">
                    {bioValue.length}/220
                  </p>
                </ProfileInput>
              </div>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};

const ProfileMeta = ({ icon, label, value }: ProfileMetaProps & { label: string }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#178f95]">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
};

const ProfileInput = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-[#101b3d]">
        {label}
      </span>

      {children}

      {error && (
        <span className="mt-2 block text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
};

export default PetOwnerProfileHeader;