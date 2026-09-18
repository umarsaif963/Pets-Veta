import { CalendarDays, DollarSignIcon, Home, LogOut, Users, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/shared/components/Logo/Logo";
import type { DoctorSidebarProps } from "../doctor.types";
import { useAuth } from "@/features/Auth/hooks/authhook";
import { logoutUserApi } from "@/features/Auth/api/loginuser.api";

export const DoctorSidebar = ({ sidebarOpen, setSidebarOpen }: DoctorSidebarProps) => {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticateUser } = useAuth();

    const handleLogout = async () => {
        try {
            await logoutUserApi();
        } catch (error) {
            console.error("Doctor logout failed:", error);
        } finally {
           
            setUser(undefined);
            setIsAuthenticateUser(false);
            navigate("/login", { replace: true });
        }
    };
    const sidebarLinks = [
        { id: 1, label: "Dashboard", icon: Home, address: "doctor-dashboard" },
        { id: 2, label: "Appointments", icon: CalendarDays, address: "appointments" },
        { id: 4, label: "Availability", icon: CalendarDays, address: "doctor-availability" },
        { id: 5, label: "Pricing", icon: DollarSignIcon, address: "doctor-pricing" },
        { id: 6, label: "Profile", icon: Users, address: "doctor-profile" },
    ];

    return (
        <>
            {sidebarOpen && (
                <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                    aria-label="Close sidebar"
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav className="space-y-2 px-4 py-5">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                            <NavLink
                                to={link.address}
                                key={link.id}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `outline-none flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${isActive
                                    ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                            >
                                <Icon size={19} />
                                {link.label}
                            </NavLink>
                        );
                    })}

                    <div className="pt-8">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                        >
                            <LogOut size={19} />
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
};
