import { getGoogleAuthUrlApi, type ApiResponse } from "../api/petOwner.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AxiosError } from "axios";
import { AtSign, CircleUserRound, Eye, EyeOff, Lock, Mail } from "lucide-react";

import {
  petOwnerSchema,
  type PetOwnerFormData,
} from "../schemas/petowner.schema";

import { usePetOwnerHook } from "../hooks/usePetOwnerAccount";
import type {
  PetOwnerFormFieldProps,
  PetOwnerPasswordFieldProps,
} from "../types/auth.types";

const PawIcon = () => (
  <svg
    viewBox="0 0 64 64"
    className="h-8 w-8 fill-[#009f9d]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="18" cy="22" r="7" />
    <circle cx="32" cy="16" r="7" />
    <circle cx="46" cy="22" r="7" />
    <circle cx="24" cy="34" r="6" />
    <circle cx="40" cy="34" r="6" />
    <path d="M18 47c0-9 6-17 14-17s14 8 14 17c0 6-5 9-14 9s-14-3-14-9z" />
  </svg>
);

export default function PetOwnerForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<string>("");

  const { mutate: createAccount } = usePetOwnerHook({
    onSuccess: (response: ApiResponse) => {
      console.log("Role is ", response);
      if (response.success) {
        reset();
      }
    },
    onError: (error) => {
      setIsError("Failed in Creating Account");
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status && status >= 400 && status < 500) {
        setIsError(message || "Invalid request");
      } else {
        setIsError("Something went wrong. Please try again.");
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetOwnerFormData>({
    resolver: zodResolver(petOwnerSchema),
  });

  const onSubmit = async (data: PetOwnerFormData) => {
    setIsError("");
    createAccount(data);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setIsError("");

      const result = await getGoogleAuthUrlApi();

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status && status >= 400 && status < 500) {
          setIsError(message || "Invalid request");
        } else {
          setIsError("Something went wrong. Please try again.");
        }

        console.log("Signup Error:", error);
      } else {
        setIsError("Something went wrong. Please try again.");
        console.log("Signup Error:", error);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d9f7f6] shadow-[0_10px_22px_rgba(0,159,157,0.22)]">
        <PawIcon />
      </div>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em] text-[#07182c] md:text-[28px]">
          Create Account
        </h1>

        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Join PetsVeta and care for your pets
        </p>
      </div>

      {isError && (
        <p className="mb-4 rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-center text-[13px] font-semibold text-[#d64545]">
          {isError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-4">
        {/* Full Name + Username */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Full Name"
            placeholder="Enter full name"
            error={errors.fullName?.message}
            icon={<CircleUserRound className="h-5 w-5" />}
            inputProps={{ autoComplete: "off", ...register("fullName") }}
          />

          <FormField
            label="Username"
            placeholder="Choose username"
            error={errors.username?.message}
            icon={<AtSign className="h-5 w-5" />}
            inputProps={{ autoComplete: "off", ...register("username") }}
          />
        </div>

        {/* Email */}
        <FormField
          label="Email Address"
          type="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          icon={<Mail className="h-5 w-5" />}
          inputProps={{ autoComplete: "off", ...register("email") }}
        />

        {/* Password */}
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          error={errors.password?.message}
          inputProps={{ autoComplete: "new-password", ...register("password") }}
        />

        {/* Confirm Password */}
        <PasswordField
          label="Confirm Password"
          placeholder="Confirm your password"
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
          error={errors.confirmPassword?.message}
          inputProps={{ autoComplete: "new-password", ...register("confirmPassword") }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,159,157,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_16px_32px_rgba(0,159,157,0.38)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating Account...
            </span>
          ) : (
            <>
              Sign Up
              <span className="text-lg leading-none">→</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 pt-1">
          <span className="h-px flex-1 bg-[#E8EDF4]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
            or
          </span>
          <span className="h-px flex-1 bg-[#E8EDF4]" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-white text-[15px] font-bold text-[#07182c] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.7l6.2 5.2C36.9 42.6 44 38 44 24c0-1.3-.1-2.6-.4-3.9z"
            />
          </svg>

          {isGoogleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="pt-1 text-center text-[13px] font-medium text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold text-[#009f9d] transition hover:text-[#008f8d]"
          >
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}

const FormField = ({
  label,
  placeholder,
  type = "text",
  error,
  icon,
  inputProps,
}: PetOwnerFormFieldProps) => {
  const borderClass = error
    ? "border-[#e4666b] focus-within:border-[#e4666b] focus-within:ring-[#e4666b]/15"
    : "border-[#E2E8F0] focus-within:border-[#009f9d] focus-within:ring-[#009f9d]/15";

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
        {label}
      </label>

      <div
        className={`flex h-[50px] items-center rounded-xl border bg-white pl-4 pr-4 shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-all duration-300 focus-within:ring-4 ${borderClass}`}
      >
        <span className="mr-3 shrink-0 text-slate-400">{icon}</span>

        <input
          type={type}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[14px] font-medium text-[#07182c] outline-none placeholder:text-slate-400"
          {...inputProps}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-[12px] font-semibold text-[#e4666b]">
          {error}
        </p>
      )}
    </div>
  );
};

const PasswordField = ({
  label,
  placeholder,
  showPassword,
  onTogglePassword,
  error,
  inputProps,
}: PetOwnerPasswordFieldProps) => {
  const borderClass = error
    ? "border-[#e4666b] focus-within:border-[#e4666b] focus-within:ring-[#e4666b]/15"
    : "border-[#E2E8F0] focus-within:border-[#009f9d] focus-within:ring-[#009f9d]/15";

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
        {label}
      </label>

      <div
        className={`flex h-[50px] items-center rounded-xl border bg-white pl-4 pr-2 shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-all duration-300 focus-within:ring-4 ${borderClass}`}
      >
        <span className="mr-3 shrink-0 text-slate-400">
          <Lock className="h-5 w-5" />
        </span>

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[14px] font-medium text-[#07182c] outline-none placeholder:text-slate-400"
          {...inputProps}
        />

        <button
          type="button"
          onClick={onTogglePassword}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:text-[#009f9d]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-[12px] font-semibold text-[#e4666b]">
          {error}
        </p>
      )}
    </div>
  );
};