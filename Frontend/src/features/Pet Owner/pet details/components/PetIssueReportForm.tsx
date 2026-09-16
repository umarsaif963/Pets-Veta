import {
  Calendar,
  ClipboardPlus,
  Info,
  Pencil,
  Send,
  ShieldPlus,
  Stethoscope,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import Button from "../../../../shared/components/Button/Button";
import {
  petIssueReportSchema,
  type PetIssueReportFormData,
} from "../schemas/petIssueReport.schema";
import { useAuth } from "@/features/Auth/hooks/authhook";
import { submitPetIssue } from "../apis/pet.api";
import type { PetIssueReportFormProps } from "../types/petDetails.types";

const PetIssueReportForm = ({
  preselectedPetId = "",
  doctorId,
  preselectedCheckupTime = "",
  onSubmitSuccess,
  onCancel,
}: PetIssueReportFormProps) => {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PetIssueReportFormData>({
    resolver: zodResolver(petIssueReportSchema),
    defaultValues: {
      petId: localStorage.getItem("petPatientId") || preselectedPetId,
      issue: "",
      appointmentType: "NORMAL_CHECKUP",
      checkupTime: preselectedCheckupTime,
    },
  });

  useEffect(() => {
    const savedPetId = localStorage.getItem("petPatientId") || preselectedPetId;
    if (savedPetId) {
      setValue("petId", savedPetId);
    }
  }, [preselectedPetId, setValue]);

  useEffect(() => {
    if (preselectedCheckupTime) {
      setValue("checkupTime", preselectedCheckupTime);
    }
  }, [preselectedCheckupTime, setValue]);

  const issue = watch("issue") || "";
  const appointmentType = watch("appointmentType");

  const onSubmit = async (data: PetIssueReportFormData) => {
    console.log("Working....")
    setSubmitError(null);
    console.log("Pet issue report:", data);
    const petOwnerId = user?.data?.id;

    if (!petOwnerId) {
      setSubmitError("You must be logged in to report a pet issue.");
      return;
    }

    if (!doctorId) {
      setSubmitError("Please select a doctor before booking an appointment.");
      return;
    }

    if (!data.petId) {
      setSubmitError("No pet identity found. Please go back and select a pet.");
      return;
    }

    try {
      const result = await submitPetIssue({
        ...data,
        petOwnerId,
        doctorId,
      });

      if (result.success && result?.data?.checkoutUrl) {
        reset();
        if (onSubmitSuccess) {
          onSubmitSuccess(result);
          window.location.href = result.data.checkoutUrl;
        } else {
          setSubmitError("Failed to initiate checkout session. Please try again");
        }
      } else {
        setSubmitError("Failed to submit issue report.");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting the issue report.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F3FAF7] px-4 py-8 text-[#17233F]">
      <section className="mx-auto max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-emerald-100">
        <div className="relative h-40 bg-gradient-to-br from-[#F4FFFA] to-[#DFF5EA] px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B8F5A] text-white">
            <ClipboardPlus size={22} />
          </div>

          <div className="relative z-10 mt-5">
            <h1 className="text-2xl font-black">Report Pet Issue</h1>
            <p className="mt-2 max-w-[250px] text-sm leading-5 text-slate-600">
              Tell us about your pet&apos;s health issue so we can assist you better
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=500&q=80"
            alt="Cat"
            className="absolute bottom-0 right-5 h-36 w-36 object-cover mix-blend-multiply"
          />

          <div className="absolute bottom-8 right-7 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#0B8F5A] shadow-sm">
            <ShieldPlus size={22} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-5 py-6">
          {(submitError || errors.petId) && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
              {submitError || errors.petId?.message || "A valid pet must be selected."}
            </div>
          )}

          {/* Hidden field containing the auto-selected pet Patient ID from localStorage */}
          <input type="hidden" {...register("petId")} />



          <div>
            <label className="mb-2 block text-sm font-black">
              Issue Details <span className="text-red-500">*</span>
            </label>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-[#0B8F5A] focus-within:ring-4 focus-within:ring-emerald-100">
              <div className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#0B8F5A]">
                  <Pencil size={18} />
                </span>

                <textarea
                  {...register("issue")}
                  maxLength={500}
                  placeholder="Describe the issue your pet is facing..."
                  className="min-h-24 w-full resize-none bg-transparent text-sm font-semibold text-slate-600 outline-none placeholder:text-slate-400"
                />
              </div>

              <p className="text-right text-xs font-semibold text-slate-400">
                {issue.length}/500
              </p>
            </div>

            {errors.issue && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.issue.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-black">
              Appointment Type <span className="text-red-500">*</span>
            </label>

            <div className="flex h-14 items-center rounded-xl border border-slate-200 bg-white px-4">
              <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#0B8F5A]">
                <Calendar size={18} />
              </span>

              <select
                {...register("appointmentType")}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-500 outline-none"
              >
                <option value="NORMAL_CHECKUP">Normal Checkup</option>
              </select>
            </div>

            {errors.appointmentType && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.appointmentType.message}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-[#EFFBF5] p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B8F5A] text-white">
                <Info size={16} />
              </div>

              <div>
                <h3 className="text-sm font-black text-[#0B8F5A]">
                  Appointment Type
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Choose normal checkup for regular pet health consultation.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setValue("appointmentType", "NORMAL_CHECKUP")}
              className={`w-full rounded-xl border p-3 text-left transition ${appointmentType === "NORMAL_CHECKUP"
                ? "border-[#0B8F5A] bg-white"
                : "border-slate-200 bg-white"
                }`}
            >
              <div className="flex items-start gap-3">
                <Stethoscope size={26} className="text-[#0B8F5A]" />
                <div>
                  <h4 className="text-sm font-black">Normal Checkup</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Book a regular consultation for your pet&apos;s health issue.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                if (onCancel) onCancel();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" isSubmitting={isSubmitting}>
              <span className="flex items-center justify-center gap-2">
                <Send size={17} />
                Submit Report
              </span>
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default PetIssueReportForm;