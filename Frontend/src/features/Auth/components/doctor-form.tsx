import { useForm, type SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AtSign,
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  FileUp,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  User,
  Wallet,
} from "lucide-react";
import { type ApiResponse } from "../api/doctor.api";

import { useDoctorAccountHook } from "../hooks/useDoctorAccount";
import LogoImage from "@/shared/components/Logo/LogoImage";

import {
  doctorSchema,
  type DoctorFormData,
  type DoctorFormInput,
} from "../schemas/doctor.schema";

const doctorFields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter Name",
    icon: <User className="h-5 w-5" />,
  },
  {
    name: "username",
    label: "User Name",
    type: "text",
    placeholder: "Enter UserName",
    icon: <AtSign className="h-5 w-5" />,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "example@gmail.com",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+923001234567",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    name: "experience",
    label: "Years of Experience",
    type: "number",
    placeholder: "5",
    icon: <Stethoscope className="h-5 w-5" />,
  },
  {
    name: "fees",
    label: "Fees",
    type: "number",
    placeholder: "Enter Checkup Fees",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    name: "medicalLicenseNumber",
    label: "Medical License Number",
    type: "text",
    placeholder: "LIC-123456",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    name: "education",
    label: "Education/Qualifications",
    type: "text",
    placeholder: "e.g., DVM, BVSc",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    name: "address",
    label: "Clinic Address",
    type: "text",
    placeholder: "Clinic Address",
    icon: <MapPin className="h-5 w-5" />,
  },
] as const;

const specializations = ["General Veterinary", "Pet Surgeon", "Animal Dentist"];

const steps = [
  {
    title: "Personal Info",
    fields: ["fullName", "username", "email", "phone"],
  },
  {
    title: "Professional Info",
    fields: [
      "specialization",
      "experience",
      "fees",
      "medicalLicenseNumber",
      "education",
      "address",
      "document",
    ],
  },
  {
    title: "Account Security",
    fields: ["password", "confirmPassword"],
  },
] as const;

export default function DoctorForm() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormInput, unknown, DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    mode: "onChange",
  });

  const { mutate: createAccount } = useDoctorAccountHook({
    onSuccess: (response: ApiResponse) => {
      if (response.success) {
        setResponseMessage(response.message || "Account Created Successfully");
        reset();
        setStep(0);
      }
    },
    onError: (error) => {
      const serverMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      setErrorMessage(serverMessage || error.message || "Failed to create account");
      console.log("Error is Doctor", error);
    },
  });

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
    createAccount(formData);
  };

  const onError: SubmitErrorHandler<DoctorFormInput> = (formErrors) => {
    console.error("Zod Validation Failed! Check these fields:", formErrors);
  };

  const handleNext = async () => {
    setErrorMessage("");
    const valid = await trigger([...steps[step].fields]);
    if (valid) setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setErrorMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-[24px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(7,24,44,0.14)] sm:p-9">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            to="/"
            aria-label="PetsVeta home"
            className="mb-4 block overflow-hidden rounded-2xl bg-white shadow-[0_10px_22px_rgba(0,159,157,0.22)] transition hover:opacity-85"
          >
            <LogoImage className="h-14 w-14" />
          </Link>

          <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#07182c]">
            Doctor Registration
          </h1>

          <p className="mt-2 text-[13px] font-medium text-slate-500">
            {steps[step].title}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-7 flex items-center">
          {steps.map((s, index) => (
            <div
              key={s.title}
              className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold transition-all duration-300 ${
                    step > index
                      ? "bg-[#009f9d] text-white"
                      : step === index
                        ? "bg-[#d9f7f6] text-[#009f9d] ring-4 ring-[#c9f3f1]"
                        : "bg-[#EEF3F8] text-slate-400"
                  }`}
                >
                  {step > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={`mt-2 whitespace-nowrap text-[11px] font-bold ${
                    step === index
                      ? "text-[#009f9d]"
                      : step > index
                        ? "text-[#07182c]"
                        : "text-slate-400"
                  }`}
                >
                  {s.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mb-5 h-1 flex-1 rounded-full transition-colors duration-300 ${
                    step > index ? "bg-[#009f9d]" : "bg-[#EEF3F8]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {responseMessage && (
          <div className="mb-5 rounded-xl border border-[#BCE8C6] bg-[#F0FBF3] px-4 py-3 text-center text-[13px] font-semibold text-[#1E7A45]">
            {responseMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-center text-[13px] font-semibold text-[#d64545]">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          autoComplete="off"
        >
          {/* Step 1: Personal Info */}
          {step === 0 && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              {steps[0].fields.map((fieldName) => {
                const field = doctorFields.find((f) => f.name === fieldName)!;
                const fieldError = errors[fieldName];

                return (
                  <div
                    key={field.name}
                    className={fieldName === "phone" ? "sm:col-span-2" : ""}
                  >
                    <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
                      {field.label}
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {field.icon}
                      </span>

                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete="off"
                        aria-invalid={fieldError ? true : undefined}
                        className={`h-[50px] w-full rounded-xl border bg-white pl-12 pr-4 text-[14px] font-medium text-[#07182c] shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
                          fieldError
                            ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
                            : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15"
                        }`}
                        {...register(field.name)}
                      />
                    </div>

                    {fieldError && (
                      <p className="mt-1.5 text-[12px] font-semibold text-[#d64545]">
                        {fieldError.message as string}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              {/* Specialization */}
              <div className="flex w-full flex-col sm:col-span-2">
                <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
                  Specialization
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Stethoscope className="h-5 w-5" />
                  </span>

                  <select
                    aria-invalid={errors.specialization ? true : undefined}
                    className={`h-[50px] w-full appearance-none rounded-xl border bg-white pl-12 pr-12 text-[14px] font-medium text-[#07182c] shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors focus:ring-4 ${
                      errors.specialization
                        ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
                        : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15"
                    }`}
                    {...register("specialization")}
                  >
                    <option value="">Select specialization</option>
                    {specializations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>

                {errors.specialization && (
                  <p className="mt-1.5 text-[12px] font-semibold text-[#d64545]">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

              {doctorFields
                .filter((f) =>
                  [
                    "experience",
                    "fees",
                    "medicalLicenseNumber",
                    "education",
                    "address",
                  ].includes(f.name),
                )
                .map((field) => {
                  const fieldError = errors[field.name];

                  return (
                    <div
                      key={field.name}
                      className={
                        field.name === "address" ? "sm:col-span-2" : ""
                      }
                    >
                      <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
                        {field.label}
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {field.icon}
                        </span>

                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          autoComplete="off"
                          aria-invalid={fieldError ? true : undefined}
                          className={`h-[50px] w-full rounded-xl border bg-white pl-12 pr-4 text-[14px] font-medium text-[#07182c] shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
                            fieldError
                              ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
                              : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15"
                          }`}
                          {...register(field.name)}
                        />
                      </div>

                      {fieldError && (
                        <p className="mt-1.5 text-[12px] font-semibold text-[#d64545]">
                          {fieldError.message as string}
                        </p>
                      )}
                    </div>
                  );
                })}

              {/* Document Upload */}
              <div className="w-full sm:col-span-2">
                <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
                  Upload Verification Document
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <FileUp className="h-5 w-5" />
                  </span>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,application/pdf"
                    aria-invalid={errors.document ? true : undefined}
                    className={`w-full cursor-pointer rounded-xl border border-dashed bg-white py-3 pl-12 pr-4 text-[13px] font-medium text-slate-500 shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#d9f7f6] file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-[#009f9d] hover:border-[#009f9d]/50 focus:ring-4 ${
                      errors.document
                        ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
                        : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15"
                    }`}
                    {...register("document")}
                  />
                </div>

                {errors.document && (
                  <p className="mt-1.5 text-[12px] font-semibold text-[#d64545]">
                    {errors.document.message as string}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Account Security */}
          {step === 2 && (
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              {/* Password */}
              <div className="w-full">
                <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    autoComplete="new-password"
                    aria-invalid={errors.password ? true : undefined}
                    className={`h-[50px] w-full rounded-xl border bg-white pl-12 pr-12 text-[14px] font-medium text-[#07182c] shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
                      errors.password
                        ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
                        : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15"
                    }`}
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:text-[#009f9d]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-[12px] font-semibold text-[#d64545]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="w-full">
                <label className="mb-1.5 block text-[13px] font-bold text-[#07182c]">
                  Confirm Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    aria-invalid={errors.confirmPassword ? true : undefined}
                    className={`h-[50px] w-full rounded-xl border bg-white pl-12 pr-12 text-[14px] font-medium text-[#07182c] shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
                      errors.confirmPassword
                        ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
                        : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15"
                    }`}
                    {...register("confirmPassword")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:text-[#009f9d]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-[12px] font-semibold text-[#d64545]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-7 flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex h-[54px] w-auto items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-8 text-[15px] font-bold text-[#178f95] transition hover:bg-[#EFFCFB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-lg leading-none">←</span>
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_14px_28px_rgba(0,159,157,0.32)] active:translate-y-0"
              >
                Next
                <span className="text-lg leading-none">→</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#009f9d] text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008f8d] hover:shadow-[0_14px_28px_rgba(0,159,157,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Create Account"
                )}

                {!isSubmitting && <span className="text-lg leading-none">→</span>}
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4 pt-2">
            <span className="h-px flex-1 bg-[#E8EDF4]" />
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
              or
            </span>
            <span className="h-px flex-1 bg-[#E8EDF4]" />
          </div>

          <p className="pb-1 pt-3 text-center text-[14px] font-medium text-slate-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-bold text-[#009f9d] transition hover:text-[#008f8d]"
            >
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}