import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    AlertCircle,
    CalendarDays,
    Clock,
    CreditCard,
    FileText,
    Inbox,
    Loader2,
    MapPin,
    User,
} from "lucide-react";

import Card from "@/shared/components/Card/Card";
import Button from "@/shared/components/Button/Button";
import SellerHeader from "@/features/seller/components/SellerHeader";
import SellerSidebar from "@/features/seller/components/SellerSidebar";

import { getPetOwnerAppointmentsApi } from "../api/petOwnerDashboard.api";
import type { PetOwnerAppointment } from "../types/petOwnerDashboard.types";

type TabType = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

const PetOwnerAppointmentsPage = () => {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<PetOwnerAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("ALL");

    useEffect(() => {
        let ignore = false;

        const loadAppointments = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getPetOwnerAppointmentsApi();

                if (ignore) return;

                if (response.success) {
                    setAppointments(response.data);
                } else {
                    setError(response.message || "Failed to load appointments.");
                }
            } catch (err) {
                if (ignore) return;

                console.error("Fetch appointments error:", err);
                setError("Unable to connect to the server. Please try again.");
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        void loadAppointments();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredAppointments = useMemo(() => {
        return appointments.filter((appointment) => {
            if (activeTab === "ALL") return true;

            if (activeTab === "UPCOMING") {
                return [
                    "PAYMENT_PROCESSING",
                    "CONFIRMED",
                ].includes(appointment.status);
            }

            if (activeTab === "COMPLETED") {
                return appointment.status === "COMPLETED";
            }

            if (activeTab === "CANCELLED") {
                return [
                    "CANCELLED",
                    "EXPIRED",
                    "PAYMENT_FAILED",
                    "REFUNDED",
                    "NO_SHOW",
                ].includes(appointment.status);
            }

            return true;
        });
    }, [appointments, activeTab]);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "Date not available";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) return "Date not available";

        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timeString?: string | null) => {
        if (!timeString) return "Time not available";

        const date = new Date(timeString);

        if (Number.isNaN(date.getTime())) return "Time not available";

        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "border border-emerald-100 bg-emerald-50 text-emerald-700";

            case "PENDING_PAYMENT":
            case "PENDING_DETAILS":
            case "PENDING_REPORT":
                return "border border-amber-100 bg-amber-50 text-orange-600";

            case "COMPLETED":
                return "border border-blue-100 bg-blue-50 text-blue-700";

            case "CANCELLED":
            case "EXPIRED":
            case "PAYMENT_FAILED":
                return "border border-red-100 bg-red-50 text-red-700";

            default:
                return "border border-slate-100 bg-slate-50 text-slate-700";
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, " ");
    };

    return (
        <div className="flex min-h-screen bg-[#f7fbfb] text-[#20263D]">
            <SellerSidebar />

            <main className="flex-1">
                <SellerHeader />

                <section className="p-7">
                    <div className="mx-auto max-w-[1500px]">

                        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#178f95]">
                                    Appointment History
                                </p>

                                <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
                                    My Appointments
                                </h1>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    Track your veterinary consultations. New appointments should
                                    be booked from My Pets by selecting a pet first.
                                </p>
                            </div>

                            <Button
                                type="button"
                                onClick={() => navigate("/pet-owner/my-pets")}
                            >
                                Go to My Pets
                            </Button>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                            {(["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as TabType[]).map(
                                (tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`rounded-xl px-5 py-2.5 text-sm font-black transition ${activeTab === tab
                                                ? "bg-[#178f95] text-white shadow-md shadow-[#178f95]/10"
                                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                                    </button>
                                )
                            )}
                        </div>

                        {loading && (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-[#178f95]" />

                                <p className="mt-4 text-sm font-semibold text-slate-500">
                                    Fetching your appointment records...
                                </p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="flex items-start gap-4 rounded-3xl border border-red-100 bg-red-50 p-6">
                                <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />

                                <div>
                                    <h3 className="font-black text-red-800">
                                        Connection Error
                                    </h3>

                                    <p className="mt-1 text-sm font-semibold text-red-600">
                                        {error}
                                    </p>

                                    <Button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="mt-4 !border-red-600 !bg-red-600 text-white hover:!bg-red-700"
                                        size="sm"
                                    >
                                        Retry Loading
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!loading && !error && filteredAppointments.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF7F5] text-[#178f95]">
                                    <Inbox size={32} />
                                </div>

                                <h2 className="text-xl font-black text-[#101b3d]">
                                    No appointments found
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    You do not have any appointments under this tab. Go to My Pets
                                    and book an appointment for a selected pet.
                                </p>

                                <Button
                                    type="button"
                                    onClick={() => navigate("/pet-owner/my-pets")}
                                    className="mt-6"
                                >
                                    Go to My Pets
                                </Button>
                            </div>
                        )}

                        {!loading && !error && filteredAppointments.length > 0 && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {filteredAppointments.map((appointment) => {
                                    const doctorName =
                                        appointment.doctor?.user?.fullName || "Doctor";

                                    const doctorSpecialization =
                                        appointment.doctor?.specialization ||
                                        "Veterinary Specialist";

                                    const petName = appointment.pet?.name || "Unassigned";
                                    const petCategory = appointment.pet?.category || "";

                                    const issue =
                                        appointment.petIssueReport?.issue ||
                                        "Details not specified yet.";

                                    const startTime = appointment.doctorSchedule?.startTime;
                                    const endTime = appointment.doctorSchedule?.endTime;

                                    const paymentStatus = appointment.paymentStatus || "PENDING";
                                    const currency = appointment.currency || "PKR";

                                    return (
                                        <Card
                                            key={appointment.id}
                                            className="overflow-visible border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#178f95]/30 hover:shadow-md"
                                        >
                                            <div className="flex h-full flex-col justify-between gap-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex gap-4">
                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF7F5] text-[#178f95]">
                                                            <User size={26} />
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-black text-[#101b3d]">
                                                                Dr. {doctorName}
                                                            </h3>

                                                            <p className="mt-0.5 text-xs font-bold text-[#178f95]">
                                                                {doctorSpecialization}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(
                                                            appointment.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(appointment.status)}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                                                            <Activity size={14} />
                                                            Pet Patient
                                                        </span>

                                                        <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-700">
                                                            {petName} {petCategory ? `(${petCategory})` : ""}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400">
                                                            <FileText size={14} />
                                                            Issue Report
                                                        </span>

                                                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-600">
                                                            {issue}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 border-t border-slate-100/80 pt-4 text-xs font-semibold text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays
                                                            size={16}
                                                            className="shrink-0 text-[#178f95]"
                                                        />
                                                        <span>{formatDate(appointment.checkupTime)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Clock
                                                            size={16}
                                                            className="shrink-0 text-[#178f95]"
                                                        />
                                                        <span>
                                                            {formatTime(startTime)} - {formatTime(endTime)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <MapPin
                                                            size={16}
                                                            className="shrink-0 text-[#178f95]"
                                                        />
                                                        <span className="truncate">
                                                            In-clinic / Video Call
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <CreditCard
                                                            size={16}
                                                            className="shrink-0 text-[#178f95]"
                                                        />
                                                        <span className="font-extrabold text-slate-700">
                                                            {appointment.fees} {currency.toUpperCase()}
                                                            <span
                                                                className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] uppercase ${paymentStatus === "SUCCEEDED"
                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                        : "bg-amber-50 text-orange-600"
                                                                    }`}
                                                            >
                                                                {paymentStatus}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {appointment.status === "PENDING_PAYMENT" && (
                                                    <div className="pt-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/payment?appointmentId=${appointment.id}`
                                                                )
                                                            }
                                                            className="w-full border-[#0B8F5A] bg-[#0B8F5A] text-xs font-bold text-white hover:bg-[#097b4d]"
                                                            size="sm"
                                                        >
                                                            Complete Payment Hold
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PetOwnerAppointmentsPage;