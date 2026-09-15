import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../shared/components/Button/Button";
import BackButton from "../../../shared/components/Button";
import { useOtp } from "../hooks/useOtp";
import { useResendOtp } from "../hooks/useResendOtp";
import {
  verifyOtpSchema,
  type VerifyOtpFormData,
} from "../schemas/verify-otp.schema";

export default function VerifyOtpForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const otpFlow = (location.state as { from?: string } | null)?.from;

  const successPath = otpFlow === "forgot-password" ? "/reset-password" : "/";

  const [timer, setTimer] = useState(360);

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
      navigate(successPath);
    },
    onError: (error) => {
      console.log("==========>>", error);
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useResendOtp({
    onSuccess: () => {
      setTimer(360);
      setValue("otp", "");
    },
    onError: (error) => {
      console.log("==========>>", error);
    },
  });

  const onSubmit = (data: VerifyOtpFormData) => {
    verifyOtp(data);
  };

  const handleResendOtp = () => {
    resendOtp();
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-900">
          Verify OTP
        </h1>
        <p className="mt-2 text-gray-500">
          Enter the 6-digit code
        </p>
      </div>

      <p className="mb-6 text-center text-sm font-medium text-red-500">
        {timer > 0 ? (
          <>
            OTP expires in: {minutes}:
            {seconds < 10 ? `0${seconds}` : seconds}
          </>
        ) : (
          "OTP Expired"
        )}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
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
              border border-gray-300
              text-center text-2xl
              font-semibold tracking-[0.75em] outline-none
              focus:border-blue-900
            "
          />

          {errors.otp && (
            <p className="text-center text-sm text-red-500">
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
              font-medium text-blue-900
              hover:underline
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Resend OTP
          </button>
        </div>

        <Button type="submit" loading={isVerifying}>
          Verify OTP
        </Button>

        <BackButton
          href="/forgot-password"
          text="Back"
        />
      </form>
    </div>
  );
}