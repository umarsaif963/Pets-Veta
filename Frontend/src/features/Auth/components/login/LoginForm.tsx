import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  loginSchema,
  type LoginFormData,
} from "../../schemas/login.schema";
import FormInput from "./FormInput";
import SocialLoginButton from "./SocialLoginButton";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  isGoogleLoading?: boolean;
  onGoogleLogin?: () => void;
}

const LoginForm = ({
  onSubmit,
  isSubmitting = false,
  serverError,
  isGoogleLoading = false,
  onGoogleLogin,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-center text-[13px] font-semibold text-[#d64545]"
        >
          {serverError}
        </div>
      )}

      <div className="space-y-5">
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <FormInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          headerRight={
            <Link
              to="/forgot-password"
              className="text-[12px] font-bold text-[#009f9d] transition hover:text-[#008f8d]"
            >
              Forgot password?
            </Link>
          }
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:text-[#009f9d]"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
          {...register("password")}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_14px_28px_rgba(0,159,157,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Log In"
        )}

        {!isSubmitting && <span className="text-lg leading-none">→</span>}
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[#E8EDF4]" />
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
          or
        </span>
        <span className="h-px flex-1 bg-[#E8EDF4]" />
      </div>

      <SocialLoginButton onClick={onGoogleLogin} loading={isGoogleLoading} />

      <p className="mt-7 text-center text-[14px] font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/continue-as"
          className="font-bold text-[#009f9d] transition hover:text-[#008f8d]"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;