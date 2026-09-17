import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";

import { useForgotPassword } from "../hooks/useForgotPassword";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../schemas/forgot-password.schema";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [isError, setIsError] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate: forgotPassword, isPending } = useForgotPassword({
    onSuccess: (response) => {
      reset();
      navigate("/verify-otp", {
        state: {
          from: "forgot-password",
          expiresIn: response?.data?.expiresIn,
          email: response?.data?.email,
        },
      });
    },
    onError: (error) => {
      console.log(error);
      const status = (
        error as { response?: { status?: number } }
      ).response?.status;
      const message = (
        error as {
          response?: { data?: { message?: string; err?: string } };
        }
      ).response?.data;
      const text =
        message?.message ||
        message?.err ||
        (status && status >= 400 && status < 500
          ? "Invalid request"
          : "Something went wrong. Please try again.");
      setIsError(text);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setIsError("");
    forgotPassword(data);
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <Link
        to="/"
        aria-label="PetsVeta home"
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d9f7f6] shadow-[0_10px_22px_rgba(0,159,157,0.22)] transition hover:opacity-85"
      >
        <KeyRound className="h-7 w-7 text-[#009f9d]" />
      </Link>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em] text-[#07182c] md:text-[28px]">
          Forgot Password
        </h1>

        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Enter your registered email to reset your password
        </p>
      </div>

      {isError && (
        <p className="mb-4 rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-center text-[13px] font-semibold text-[#d64545]">
          {isError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
            Email Address
          </label>

          <div className="flex h-[50px] items-center rounded-xl border border-[#E2E8F0] bg-white pl-4 pr-4 shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-all duration-300 focus-within:ring-4 focus-within:border-[#009f9d] focus-within:ring-[#009f9d]/15">
            <span className="mr-3 shrink-0 text-slate-400">
              <Mail className="h-5 w-5" />
            </span>

            <input
              type="email"
              placeholder="example@gmail.com"
              className="h-full w-full bg-transparent text-[14px] font-medium text-[#07182c] outline-none placeholder:text-slate-400"
              {...register("email")}
            />
          </div>

          {errors.email && (
            <p className="mt-1.5 text-[12px] font-semibold text-[#e4666b]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,159,157,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_16px_32px_rgba(0,159,157,0.38)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending OTP...
            </span>
          ) : (
            <>
              Next
              <span className="text-lg leading-none">→</span>
            </>
          )}
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-transparent text-[15px] font-bold text-[#178f95] transition hover:bg-[#EFFCFB]"
        >
          ← Back
        </button>

        <p className="pt-1 text-center text-[13px] font-medium text-slate-500">
          Remembered your password?{" "}
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