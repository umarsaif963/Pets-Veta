import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import Input from "../../../shared/components/Input/Input";
import Button from "../../../shared/components/Button/Button";
import BackButton from "../../../shared/components/Button";
import { useForgotPassword } from "../hooks/useForgotPassword";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../schemas/forgot-password.schema";

const forgotFields = [
  {
    name: "email",
    type: "email",
    placeholder: "Enter email ",
  },
] as const;

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

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
        state: { from: "forgot-password", expiresIn: response?.data?.expiresIn },
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Forgot Password</h1>

        <p className="mt-2 text-gray-500">
          Enter your registered email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {forgotFields.map((field) => (
          <Input
            key={field.name}
            label={""}
            type={field.type}
            placeholder={field.placeholder}
            error={errors[field.name]?.message as string}
            {...register(field.name)}
          />
        ))}

        <Button type="submit" loading={isPending}>
          Next
        </Button>

        <BackButton href="/login" text="Back " />
      </form>
    </div>
  );
}
