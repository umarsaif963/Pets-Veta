import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createAppointmentPaymentIntent, releaseAppointmentHoldApi } from "../api/payment.api";
import AppointmentPaymentForm from "../components/AppointmentPayment";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

const AppointmentPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const appointmentId = searchParams.get("appointmentId");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("pkr");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState("");

  const appearance = useMemo(
    () => ({
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#0B8F5A",
        borderRadius: "12px",
      },
    }),
    []
  );

  const handleContinuePayment = async () => {
    if (!appointmentId) {
      setError("Appointment ID missing. Please select slot again.");
      return;
    }

    try {
      setIsCreatingIntent(true);
      setError("");

      const result = await createAppointmentPaymentIntent(appointmentId);

      console.log("Payment intent response:", result);

      if (!result?.success || !result?.data?.clientSecret) {
        setError("Failed to start payment. Please try again.");
        return;
      }

      setClientSecret(result.data.clientSecret);
      setAmount(result.data.amount);
      setCurrency(result.data.currency || "pkr");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while starting payment."
      );
    } finally {
      setIsCreatingIntent(false);
    }
  };


  const handleBack = async () => {
    if (appointmentId) {
      try {
        await releaseAppointmentHoldApi(appointmentId);
      } catch (err) {
        console.error("Failed to release appointment slot hold on back navigation:", err);
      }
    }
    navigate("/doctors");
  };

  const formattedAmount =
    amount !== null ? `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}` : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3FAF7] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-extrabold text-slate-800">
          Appointment Payment
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your pet issue report has been submitted successfully. Continue to pay
          your appointment fee.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Appointment ID
          </p>

          <p className="mt-2 break-all text-sm font-bold text-slate-700">
            {appointmentId || "Missing appointment ID"}
          </p>

          {formattedAmount && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Amount
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#0B8F5A]">
                {formattedAmount}
              </p>
            </div>
          )}
        </div>

        {!appointmentId && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
            Appointment ID missing. Please select slot again.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        {!clientSecret && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleBack} // 💡 Updated trigger handler to release slot instantly
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Back
            </button>

            <button
              type="button"
              disabled={!appointmentId || isCreatingIntent}
              onClick={handleContinuePayment}
              className="rounded-xl bg-[#0B8F5A] px-4 py-3 text-sm font-bold text-white hover:bg-[#097b4d] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isCreatingIntent ? "Starting..." : "Continue Payment"}
            </button>
          </div>
        )}

        {clientSecret && appointmentId && (publishableKey ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance,
            }}
          >
            <AppointmentPaymentForm appointmentId={appointmentId} />
          </Elements>
        ) : (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">
            Payment unavailable: Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in your environment.
          </p>
        ))}
      </section>
    </main>
  );
};

export default AppointmentPaymentPage;