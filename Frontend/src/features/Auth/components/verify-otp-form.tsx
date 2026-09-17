import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useOtp } from "../hooks/useOtp";
import { useResendOtp } from "../hooks/useResendOtp";
import {
  verifyOtpSchema,
  type VerifyOtpFormData,
} from "../schemas/verify-otp.schema";

const maskEmail = (email: string) => {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  const visible = local.slice(0, 2);
  const stars = "*".repeat(Math.max(4, local.length - 2));
  return `${visible}${stars}${domain}`;
};

export default function VerifyOtpForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as
    | { from?: string; expiresIn?: number; email?: string }
    | null;

  const otpFlow = state?.from;

  const successPath = otpFlow === "forgot-password" ? "/reset-password" : "/";
  const backPath = otpFlow === "forgot-password" ? "/forgot-password" : "/signup/pet-owner";
  const email = state?.email ?? "";

  const initialExpiry = state?.expiresIn ?? 60;

  const [timer, setTimer] = useState(initialExpiry);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendMessage, setResendMessage] = useState<string>("");

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useOtp({
    onSuccess: () => {
      setErrorMessage("");
      navigate(successPath);
    },
    onError: (error) => {
      console.log("==========>>", error);
      setResendMessage("");
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      const message = (
        error as {
          response?: { data?: { message?: string; err?: string } };
        }
      ).response?.data;
      const text =
        message?.message ||
        message?.err ||
        (status === 401
          ? "OTP session expired or invalid. Please resend a new code."
          : "Something went wrong. Please try again.");
      setErrorMessage(text);
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useResendOtp({
    onSuccess: (response) => {
      setErrorMessage("");
      setTimer(response?.data?.expiresIn ?? 60);
      setValue("otp", "");
      setResendMessage("A new code has been sent to your email.");
    },
    onError: (error) => {
      console.log("==========>>", error);
      setResendMessage("");
      const message = (
        error as {
          response?: { data?: { message?: string; err?: string } };
        }
      ).response?.data;
      const text =
        message?.message ||
        message?.err ||
        "Failed to resend the code. Please try again.";
      setErrorMessage(text);
    },
  });

  const onSubmit = (data: VerifyOtpFormData) => {
    setErrorMessage("");
    setResendMessage("");
    verifyOtp(data);
  };

  const handleResendOtp = () => {
    setErrorMessage("");
    setResendMessage("");
    resendOtp();
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="w-full">
      {/* Logo */}
      <Link
        to="/"
        aria-label="PetsVeta home"
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d9f7f6] shadow-[0_10px_22px_rgba(0,159,157,0.22)] transition hover:opacity-85"
      >
        <ShieldCheck className="h-7 w-7 text-[#009f9d]" />
      </Link>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em] text-[#07182c] md:text-[28px]">
          Verify OTP
        </h1>
        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Enter the 6-digit code we sent to
        </p>
        {email && (
          <p className="mt-1 text-[14px] font-bold text-[#07182c]">
            {maskEmail(email)}
          </p>
        )}
      </div>

      <p className="mb-6 text-center text-sm font-medium text-[#178f95]">
        {timer > 0 ? (
          <>
            OTP expires in: {minutes}:
            {seconds < 10 ? `0${seconds}` : seconds}
          </>
        ) : (
          "OTP Expired"
        )}
      </p>

      {errorMessage && (
        <p className="mb-4 rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-center text-[13px] font-semibold text-[#d64545]">
          {errorMessage}
        </p>
      )}

      {resendMessage && (
        <p className="mb-4 rounded-xl border border-[#B9F1EF] bg-[#EFFCFB] px-4 py-3 text-center text-[13px] font-semibold text-[#008f8d]">
          {resendMessage}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col items-center justify-center gap-2">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            {...register("otp", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              },
            })}
            className="
              h-14 w-full max-w-62.5 rounded-xl
              border border-[#E2E8F0] bg-white
              text-center text-2xl
              font-semibold tracking-[0.75em] text-[#07182c] outline-none
              shadow-[0_1px_2px_rgba(7,24,44,0.05)]
              transition-all duration-300
              placeholder:text-slate-300
              focus:border-[#009f9d] focus:ring-4 focus:ring-[#009f9d]/15
            "
          />

          {errors.otp && (
            <p className="text-center text-sm text-[#e4666b]">
              {errors.otp.message}
            </p>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="
              cursor-pointer text-sm
              font-bold text-[#009f9d]
              transition hover:text-[#008f8d] hover:underline
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        {/* Submit + Back */}
        <div className="space-y-1">
          <button
            type="submit"
            disabled={isVerifying}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,159,157,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_16px_32px_rgba(0,159,157,0.38)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Verifying...
              </span>
            ) : (
              <>
                Verify OTP
                <span className="text-lg leading-none">→</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-transparent text-[15px] font-bold text-[#178f95] transition hover:bg-[#EFFCFB]"
          >
            ← Back
          </button>
        </div>
      </form>
    </div>
  );
}