import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, RefreshCcw } from "lucide-react";
import { useResetPassword } from "../hooks/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/reset-password.schema";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isError, setIsError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate: resetPassword, isPending } = useResetPassword({
    onSuccess: () => {
      reset();
      setIsSuccess("Password reset successfully.");
      setTimeout(() => navigate("/"), 1200);
    },
    onError: (error) => {
      console.log("Error in reset password", error);
      const status = (
        error as { response?: { status?: number } }
      ).response?.status;
      const message = (
        error as {
          response?: { data?: { message?: string; err?: string } };
        }
      ).response?.data;
      setIsError(
        message?.message ||
          message?.err ||
          (status && status >= 400 && status < 500
            ? "Invalid request"
            : "Something went wrong. Please try again.")
      );
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    setIsError("");
    setIsSuccess("");
    resetPassword(data);
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d9f7f6] shadow-[0_10px_22px_rgba(0,159,157,0.22)]">
        <RefreshCcw className="h-7 w-7 text-[#009f9d]" />
      </div>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em] text-[#07182c] md:text-[28px]">
          Reset Password
        </h1>

        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Create your new password
        </p>
      </div>

      {isError && (
        <p className="mb-4 rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-center text-[13px] font-semibold text-[#d64545]">
          {isError}
        </p>
      )}

      {isSuccess && (
        <p className="mb-4 rounded-xl border border-[#B9F1EF] bg-[#EFFCFB] px-4 py-3 text-center text-[13px] font-semibold text-[#008f8d]">
          {isSuccess}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          label="New Password"
          placeholder="Enter new password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          error={errors.password?.message}
          inputProps={{ autoComplete: "new-password", ...register("password") }}
        />

        <PasswordField
          label="Confirm Password"
          placeholder="Confirm new password"
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
          error={errors.confirmPassword?.message}
          inputProps={{
            autoComplete: "new-password",
            ...register("confirmPassword"),
          }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(0,159,157,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_16px_32px_rgba(0,159,157,0.38)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Resetting...
            </span>
          ) : (
            <>
              Reset Password
              <span className="text-lg leading-none">→</span>
            </>
          )}
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/verify-otp")}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-transparent text-[15px] font-bold text-[#178f95] transition hover:bg-[#EFFCFB]"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}

const PasswordField = ({
  label,
  placeholder,
  showPassword,
  onTogglePassword,
  error,
  inputProps,
}: {
  label: string;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) => {
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