import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    AlertCircle,
    Inbox,
    ArrowLeft,
    Calendar,
    Store,
    MapPin,
    Phone,
    Tag,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import Card from "@/shared/components/Card/Card";
import Button from "@/shared/components/Button/Button";
import { showToast } from "@/shared/utils/toast";

import {
    getMyMarketplaceOrdersApi,
    completeMarketplaceOrderApi,
    refundMarketplaceOrderApi,
} from "../api/petOwnerDashboard.api";
import { dashboardData } from "../data/dashboard.data";

type FilterTab = "ALL" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const PetOwnerOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMyMarketplaceOrdersApi();
            if (response.success) {
                setOrders(response.data);
            } else {
                setError(response.message || "Failed to load e-commerce orders.");
            }
        } catch (err: any) {
            console.error("Fetch orders error:", err);
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (activeTab === "ALL") return true;
            return order.status === activeTab;
        });
    }, [orders, activeTab]);

    // 💡 Phase 4 Trigger Action: Confirm delivery receipt & release 85% to seller Connect wallet
    const handleCompleteOrder = async (orderId: string, orderNumber: string) => {
        const confirm = window.confirm(`Confirm receipt for Order ${orderNumber}? This releases payment to the seller.`);
        if (!confirm) return;

        try {
            setProcessingId(orderId);
            const response = await completeMarketplaceOrderApi(orderId);
            if (response.success) {
                showToast.success("Order completed successfully! Payout released to seller.");
                await loadOrders(); // Refresh table view
            } else {
                showToast.error(response.message || "Failed to complete order.");
            }
        } catch (err: any) {
            showToast.error(err?.response?.data?.message || "Internal transaction completion failure.");
        } finally {
            setProcessingId(null);
        }
    };

    // 💡 Phase 4 Trigger Action: Cancel transaction, restore inventory, & execute 100% Stripe card refund
    const handleRefundOrder = async (orderId: string, orderNumber: string) => {
        const confirm = window.confirm(`Are you sure you want to request a full refund for Order ${orderNumber}? This will reverse the transaction directly in Stripe.`);
        if (!confirm) return;

        try {
            setProcessingId(orderId);
            const response = await refundMarketplaceOrderApi(orderId);
            if (response.success) {
                showToast.success("Refund processed successfully! Funds returned to your card.");
                await loadOrders(); // Refresh table view
            } else {
                showToast.error(response.message || "Failed to process refund.");
            }
        } catch (err: any) {
            showToast.error(err?.response?.data?.message || "Internal refund execution failure.");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-amber-50 text-orange-600 border border-amber-100";
            case "COMPLETED":
                return "bg-emerald-50 text-emerald-700 border border-emerald-100";
            case "CANCELLED":
                return "bg-red-50 text-red-700 border border-red-100";
            default:
                return "bg-slate-50 text-slate-700 border border-slate-100";
        }
    };

    const getStatusLabel = (status: string) => {
        if (status === "CONFIRMED") return "Delivery Pending";
        if (status === "COMPLETED") return "Delivered & Payout Released";
        if (status === "CANCELLED") return "Cancelled & Refunded";
        return status;
    };

    return (
        <main className="min-h-screen bg-[#F8FAFA] text-[#20263D]">
            <DashboardSidebar />

            <section className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[260px] lg:px-8">
                <div className="mx-auto max-w-[1500px]">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 mt-14 lg:mt-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                            title="Go back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <DashboardHeader user={dashboardData.user} />
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black tracking-tight text-[#101b3d]">
                            My Purchased Orders
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Track delivery logs, complete order validations, or request refunds for your marketplace purchases.
                        </p>
                    </div>

                    {/* Filtering Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 mb-6">
                        {(["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"] as FilterTab[]).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`rounded-xl px-5 py-2.5 text-sm font-black transition cursor-pointer ${activeTab === tab
                                            ? "bg-[#178f95] text-white shadow-md shadow-[#178f95]/10"
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    {tab === "CONFIRMED"
                                        ? "In Transit / Pending"
                                        : tab === "COMPLETED"
                                            ? "Delivered"
                                            : tab === "CANCELLED"
                                                ? "Refunded"
                                                : "All Purchases"}
                                </button>
                            )
                        )}
                    </div>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                            <Loader2 className="h-10 w-10 animate-spin text-[#178f95]" />
                            <p className="mt-4 text-sm font-semibold text-slate-500">
                                Fetching purchase receipts...
                            </p>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && !loading && (
                        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-black text-red-800">Connection Error</h3>
                                <p className="mt-1 text-sm text-red-600 font-semibold">{error}</p>
                                <Button
                                    onClick={loadOrders}
                                    className="mt-4 !bg-red-650 !border-red-650 hover:!bg-red-700 text-white"
                                    size="sm"
                                >
                                    Retry Loading
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Empty View State */}
                    {!loading && !error && filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF7F5] text-[#178f95] mb-4">
                                <Inbox size={32} />
                            </div>
                            <h2 className="text-xl font-black text-[#101b3d]">
                                No orders found
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 max-w-sm leading-6">
                                No purchases meet this filter requirement. Check out the platform catalog to purchase quality feed and accessories.
                            </p>
                            <Button
                                onClick={() => navigate("/marketplace1")}
                                className="mt-6 bg-[#178f95] border-[#178f95] text-white hover:bg-[#12757a]"
                            >
                                Go to Marketplace
                            </Button>
                        </div>
                    )}

                    {/* Grid Render */}
                    {!loading && !error && filteredOrders.length > 0 && (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            {filteredOrders.map((order) => (
                                <Card
                                    key={order.id}
                                    className="overflow-visible border border-slate-200 bg-white p-5 shadow-sm transition flex flex-col justify-between h-full"
                                >
                                    <div className="space-y-5">
                                        {/* Header: ID and Status */}
                                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                                                <h3 className="text-base font-black text-slate-800 mt-0.5">{order.orderNumber}</h3>
                                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(order.createdAt)}</span>
                                                </div>
                                            </div>

                                            <span
                                                className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>

                                        {/* Stores & Shipping Info */}
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100/50 text-xs">
                                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                                    <Store size={12} className="text-[#178f95]" />
                                                    Store Merchant
                                                </span>
                                                <h4 className="font-extrabold text-slate-700">{order.seller?.businessName || "Verified Seller"}</h4>
                                                <p className="text-slate-400 mt-0.5">{order.seller?.city || "Pakistan"}</p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100/50 text-xs">
                                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                                    <MapPin size={12} className="text-[#178f95]" />
                                                    Shipping details
                                                </span>
                                                <p className="font-semibold text-slate-600 line-clamp-1" title={order.shippingAddress}>
                                                    {order.shippingAddress || "In-store pickup"}
                                                </p>
                                                <p className="text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                                                    <Phone size={10} />
                                                    {order.phoneNumber || "No contact digits"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Purchased Items List */}
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Ordered Items</span>
                                            {order.items?.map((item: any) => {
                                                const productImage =
                                                    item.product?.images?.[0]?.publicUrl ||
                                                    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=150&q=80";

                                                return (
                                                    <div key={item.id} className="flex items-center justify-between gap-4 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <img
                                                                src={productImage}
                                                                alt={item.product?.title}
                                                                className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                                            />
                                                            <div className="min-w-0 text-xs">
                                                                <h4 className="font-bold text-slate-700 truncate">{item.product?.title}</h4>
                                                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                                                    Qty: {item.quantity} • PKR {Number(item.price).toLocaleString()} each
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-800 shrink-0">
                                                            PKR {(Number(item.price) * item.quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Summary Cost & Operations Actions */}
                                    <div className="mt-5 border-t border-slate-100 pt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                <Tag size={14} className="text-[#178f95]" />
                                                Total Paid Amount
                                            </span>
                                            <span className="text-base font-black text-[#178f95]">
                                                PKR {Number(order.totalAmount).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Action buttons show up only if the order is PAID (status: CONFIRMED) and payout has not been released yet */}
                                        {order.status === "CONFIRMED" && (
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    disabled={processingId !== null}
                                                    onClick={() => handleRefundOrder(order.id, order.orderNumber)}
                                                    className="h-10 text-xs font-bold rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-50 cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                                >
                                                    {processingId === order.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <XCircle size={14} />
                                                    )}
                                                    Request Refund
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={processingId !== null}
                                                    onClick={() => handleCompleteOrder(order.id, order.orderNumber)}
                                                    className="h-10 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10"
                                                >
                                                    {processingId === order.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={14} />
                                                    )}
                                                    Confirm Delivery
                                                </button>
                                            </div>
                                        )}

                                        {/* Detailed info if order complete */}
                                        {order.status === "COMPLETED" && (
                                            <div className="rounded-xl bg-emerald-50 border border-emerald-100/60 p-2.5 text-center text-[11px] font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                                                <CheckCircle2 size={14} />
                                                You verified receipt. Funds have been split & disbursed to the merchant.
                                            </div>
                                        )}

                                        {/* Detailed info if order cancelled */}
                                        {order.status === "CANCELLED" && (
                                            <div className="rounded-xl bg-red-50 border border-red-150 p-2.5 text-center text-[11px] font-semibold text-red-800 flex items-center justify-center gap-1.5">
                                                <XCircle size={14} />
                                                Order cancelled. Stripe full transaction refund processed back to your card.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default PetOwnerOrdersPage;