import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { createOrderPaymentIntentApi } from "../api/payment.api";
import OrderPaymentForm from "../components/OrderPaymentForm";
import { api } from "@/features/api interface/axios.interface";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

const OrderPaymentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderId = searchParams.get("orderId");

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [currency, setCurrency] = useState<string>("pkr");
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [error, setError] = useState("");

    const appearance = useMemo(
        () => ({
            theme: "stripe" as const,
            variables: {
                colorPrimary: "#178f95",
                borderRadius: "12px",
            },
        }),
        []
    );

  
    useEffect(() => {
        if (!orderId) return;

        const handleBeforeUnload = () => {
            const isProcessing = sessionStorage.getItem(`payment-processing-${orderId}`) === "true";
            if (!isProcessing) {
                // Use keepalive to ensure the backend receives this request even if the tab is closing
                const url = `http://localhost:8000/api/v1/orders/${orderId}/cancel-hold`;
                fetch(url, {
                    method: "DELETE",
                    keepalive: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }
        };

        // Tab Close / Browser Exit Event Listener
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);

            // Trigger cleanup if navigating away within the single-page application context
            const isLeavingPendingCheckout = !window.location.pathname.startsWith("/order-payment");
            const isProcessing = sessionStorage.getItem(`payment-processing-${orderId}`) === "true";

            if (isLeavingPendingCheckout && !isProcessing) {
                // Safely cancel hold via silent async call
                api.delete(`/orders/${orderId}/cancel-hold`).catch((err) =>
                    console.error("Cleanup hold error during unmount:", err)
                );
            }
        };
    }, [orderId]);

    const handleContinuePayment = async () => {
        if (!orderId) {
            setError("Order ID is missing.");
            return;
        }

        try {
            setIsCreatingIntent(true);
            setError("");

            const result = await createOrderPaymentIntentApi(orderId);

            if (!result?.success || !result?.data?.clientSecret) {
                setError("Failed to start payment. Please try again.");
                return;
            }

            setClientSecret(result.data.clientSecret);
            setAmount(result.data.amount);
            setCurrency(result.data.currency);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Payment initialization failed.");
        } finally {
            setIsCreatingIntent(false);
        }
    };

    const handleCancelPayment = async () => {
        if (orderId) {
            try {
                await api.delete(`/orders/${orderId}/cancel-hold`);
            } catch (err) {
                console.error("Failed to cancel pending checkout session:", err);
            }
        }
        navigate("/cart");
    };

    const formattedAmount =
        amount !== null ? `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}` : null;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f0f9fa] px-4 py-10 text-[#20263D]">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-100">
                <h1 className="text-2xl font-extrabold text-slate-800">
                    Secure Store Checkout
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your order has been initiated. Complete the secure payment details below to confirm your purchase.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Order Reference
                    </p>
                    <p className="mt-2 break-all text-sm font-bold text-slate-700">
                        {orderId || "Missing Order ID"}
                    </p>

                    {formattedAmount && (
                        <div className="mt-4 border-t border-slate-200 pt-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Total Cost
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-[#178f95]">
                                PKR {formattedAmount}
                            </p>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                        {error}
                    </p>
                )}

                {!clientSecret && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleCancelPayment}
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={!orderId || isCreatingIntent}
                            onClick={handleContinuePayment}
                            className="rounded-xl bg-[#178f95] px-4 py-3 text-sm font-bold text-white hover:bg-[#12757a] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                            {isCreatingIntent ? "Connecting..." : "Pay Now"}
                        </button>
                    </div>
                )}

                {clientSecret && orderId && (publishableKey ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance,
                        }}
                    >
                        <OrderPaymentForm orderId={orderId} />
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

export default OrderPaymentPage;