import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";
import { getOrderPaymentStatusApi } from "../api/payment.api";

type OrderStatusResponse = {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: string;
    createdAt: string;
    seller?: {
        businessName?: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        price: string;
        product: {
            title: string;
        };
    }>;
};

const OrderPaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState<OrderStatusResponse | null>(null);
    const [error, setError] = useState("");

    const isConfirmed =
        order?.status === "CONFIRMED" && order?.paymentStatus === "SUCCEEDED";

    const isFailed =
        ["FAILED", "CANCELLED"].includes(order?.paymentStatus || "") ||
        order?.status === "CANCELLED";

    useEffect(() => {
        if (!orderId) {
            setError("Order ID is missing.");
            return;
        }

        let intervalId: number | undefined;
        let currentAttempts = 0;

        const fetchStatus = async () => {
            try {
                currentAttempts += 1;

                const result = await getOrderPaymentStatusApi(orderId);

                if (!result?.success) {
                    setError(result?.message || "Could not fetch order transaction status.");
                    return;
                }

                const data = result.data as OrderStatusResponse;
                setOrder(data);

                const confirmed =
                    data.status === "CONFIRMED" && data.paymentStatus === "SUCCEEDED";

                const failed =
                    ["FAILED", "CANCELLED"].includes(data.paymentStatus) ||
                    data.status === "CANCELLED";

                if (confirmed || failed || currentAttempts >= 15) {
                    if (intervalId) window.clearInterval(intervalId);
                }
            } catch (err: any) {
                setError(err?.message || "Something went wrong.");
                if (intervalId) window.clearInterval(intervalId);
            }
        };

        fetchStatus();
        intervalId = window.setInterval(fetchStatus, 2000);

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [orderId]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#eefaf8] px-4 py-10">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-100">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-[#178f95]">
                    {isConfirmed ? (
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    ) : isFailed ? (
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    ) : (
                        <Loader2 className="h-12 w-12 animate-spin" />
                    )}
                </div>

                <h1 className="mt-6 text-2xl font-extrabold text-slate-800">
                    {isConfirmed
                        ? "Order Confirmed!"
                        : isFailed
                            ? "Payment Issue"
                            : "Confirming Order..."}
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    {isConfirmed
                        ? "Your checkout payment was successful, and the seller has been notified."
                        : isFailed
                            ? "The payment session was abandoned or failed. Please contact billing support."
                            : "Validating transaction session balances with Stripe gateways..."}
                </p>

                {error && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                        {error}
                    </div>
                )}

                {order && (
                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left text-xs font-semibold text-slate-500 space-y-3.5">
                        <div className="flex justify-between border-b border-slate-200/60 pb-3">
                            <span>Order Number</span>
                            <span className="font-extrabold text-slate-800">{order.orderNumber}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Merchant Store</span>
                            <span className="font-bold text-slate-800">{order.seller?.businessName || "Pets Veta Merchant"}</span>
                        </div>

                        <div className="border-t border-slate-200/60 pt-3">
                            <span className="block text-slate-400 font-bold mb-2">Purchased Items</span>
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-slate-600 font-medium">
                                        <span>{item.product.title} (x{item.quantity})</span>
                                        <span className="font-semibold text-slate-800">PKR {Number(item.price).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between border-t border-slate-200/60 pt-3 text-sm font-black text-slate-800">
                            <span>Total Amount</span>
                            <span className="text-[#178f95]">PKR {Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            // 💡 Clean up session processing flags upon success screen unload navigation
                            if (orderId) {
                                sessionStorage.removeItem(`payment-processing-${orderId}`);
                            }
                            navigate("/marketplace1");
                        }}
                        className="w-full rounded-xl bg-[#178f95] py-3 text-sm font-bold text-white hover:bg-[#12757a] transition flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={16} />
                        Back to Marketplace
                    </button>
                </div>
            </section>
        </main>
    );
};

export default OrderPaymentSuccessPage;
