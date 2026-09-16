import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaLock,
    FaPowerOff,
    FaShieldAlt,
    FaTrashAlt,
    FaUserCog,
} from "react-icons/fa";

import { logoutUserApi } from "@/features/Auth/api/loginuser.api";
import { useAuth } from "@/features/Auth/hooks/authhook";
import Button from "@/shared/components/Button/Button";
import Card from "@/shared/components/Card/Card";
import SellerHeader from "../components/SellerHeader";
import SellerSidebar from "../components/SellerSidebar";

const SellerSettingsPage = () => {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticateUser } = useAuth();

    const [logoutLoading, setLogoutLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = async () => {
        try {
            setLogoutLoading(true);
            setError("");

            await logoutUserApi();

            setUser(undefined);
            setIsAuthenticateUser(false);

            navigate("/login", { replace: true });
        } catch {
            setError("Unable to logout right now. Please try again.");
        } finally {
            setLogoutLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f7fbfb]">
            <SellerSidebar />

            <main className="flex-1">
                <SellerHeader />

                <section className="p-7">

                    <div className="mb-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#178f95]">
                            Account Control
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900">
                            Settings
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                            Manage account preferences, notifications, privacy, security, and
                            logout from your Pets-Veta dashboard.
                        </p>
                    </div>

                    {error && (
                        <p className="mb-5 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-5">
                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#178f95]/10 text-[#178f95]">
                                        <FaUserCog />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Profile Settings
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Your profile is also your marketplace seller identity.
                                            Username, profile image, city, and bio will be used across
                                            the website.
                                        </p>

                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate("/pet-owner/profile")}
                                            >
                                                Edit My Profile
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#178f95]/10 text-[#178f95]">
                                        <FaBell />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Notifications
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Control alerts for new messages, orders, saved listings,
                                            and appointment reminders.
                                        </p>

                                        <div className="mt-5 space-y-3">
                                            {[
                                                "New message notifications",
                                                "Order status notifications",
                                                "Appointment reminders",
                                                "Marketplace listing updates",
                                            ].map((item) => (
                                                <label
                                                    key={item}
                                                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
                                                >
                                                    <span>{item}</span>
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="h-4 w-4 accent-[#178f95]"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#178f95]/10 text-[#178f95]">
                                        <FaShieldAlt />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Privacy
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Choose what buyers can see on your public marketplace
                                            profile.
                                        </p>

                                        <div className="mt-5 space-y-3">
                                            {[
                                                "Show city on public listings",
                                                "Show profile image on public listings",
                                                "Allow buyers to message me",
                                            ].map((item) => (
                                                <label
                                                    key={item}
                                                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
                                                >
                                                    <span>{item}</span>
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="h-4 w-4 accent-[#178f95]"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-5">
                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                        <FaLock />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Security
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Password and sensitive account controls should stay inside
                                            settings.
                                        </p>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                            onClick={() => navigate("/forgot-password")}
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                        <FaPowerOff />
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Logout
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Logout from this device and return to the login page.
                                        </p>

                                        <Button
                                            size="sm"
                                            className="mt-4 border-red-600 bg-red-600 hover:bg-white hover:text-red-600"
                                            loading={logoutLoading}
                                            loadingText="Logging out..."
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-red-100 bg-red-50">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600">
                                        <FaTrashAlt />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-red-700">
                                            Danger Zone
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-red-600/80">
                                            Delete account functionality should only be connected
                                            after backend confirmation and safety checks.
                                        </p>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="mt-4 border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                                        >
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SellerSettingsPage;