import { useForm, type SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type ApiResponse } from "../api/doctor.api";


import Input from "../../../shared/components/Input/Input";
import Button from "../../../shared/components/Button/Button";
import { useDoctorAccountHook } from "../hooks/useDoctorAccount";

import {
  doctorSchema,
  type DoctorFormData,
  type DoctorFormInput,
} from "../schemas/doctor.schema";

const doctorFields = [
  { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter Name" },
  { name: "username", label: "User Name", type: "text", placeholder: "Enter UserName" },
  { name: "email", label: "Email Address", type: "email", placeholder: "example@gmail.com" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+923001234567" },
  { name: "experience", label: "Years of Experience", type: "number", placeholder: "5" },
  { name: "fees", label: "Fees", type: "number", placeholder: "Enter Checkup Fees" },
  { name: "medicalLicenseNumber", label: "Medical License Number", type: "text", placeholder: "LIC-123456" },
  { name: "education", label: "Education/Qualifications", type: "text", placeholder: "e.g., DVM, BVSc" },
  { name: "address", label: "Clinic Address", type: "text", placeholder: "Clinic Address" },
  { name: "document", label: "Upload Document", type: "file", placeholder: "" },
  { name: "password", label: "Password", type: "password", placeholder: "******" },
  { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "******" },
] as const;

const specializations = ["General Veterinary", "Pet Surgeon", "Animal Dentist"];


export default function DoctorForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormInput, unknown, DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    mode: "onChange",
  });

  const { mutate: createAccount } = useDoctorAccountHook({
    onSuccess: (response: ApiResponse) => {
      if (response.success) {
        setResponseMessage(response.message || "Account Created Successfully")
        reset();
      }
    },
    onError: (error) => {
      const serverMessage = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErrorMessage(serverMessage || error.message || "Failed to create account");
      console.log("Error is Doctor", error)
    }
  })

  const onSubmit = async (data: DoctorFormData) => {
    setErrorMessage("");
    setResponseMessage("");

    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key !== "document") {
        const value = data[key as keyof DoctorFormData];

        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    });

    if (data.document && data.document.length > 0) {
      formData.append("document", data.document[0]);
    }

    console.log("Submitting FormData...", data);
    createAccount(formData)

  };

  const onError: SubmitErrorHandler<DoctorFormInput> = (formErrors) => {
    console.error("Zod Validation Failed! Check these fields:", formErrors);
  };

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#078b91]">
          Doctor Registration
        </h1>
        <p className="mt-2 text-gray-500">
          Create your professional doctor account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
        {responseMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-center font-medium text-green-800">
              {responseMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-center font-medium text-red-800">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {doctorFields.map((field) => {
            const isPasswordField =
              field.name === "password" || field.name === "confirmPassword";

            return (
              <Input
                key={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder || ""}
                error={
                  errors[field.name as keyof DoctorFormInput]?.message as string
                }
                showPassword={isPasswordField ? showPassword : undefined}
                onTogglePassword={
                  isPasswordField
                    ? () => setShowPassword((prev) => !prev)
                    : undefined
                }
                {...register(field.name)}
              />
            );
          })}

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Specialization
            </label>

            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-600"
              {...register("specialization")}
            >
              <option value="">Select specialization</option>
              {specializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {errors.specialization && (
              <p className="text-sm text-red-500">
                {errors.specialization.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button type="submit" isSubmitting={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-900 hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}