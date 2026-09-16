import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PawPrint,
  ShoppingCart,
  Stethoscope,
  UserRound,
  ShoppingBag, 
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import type { DashboardSidebarItem } from "../types/petOwnerDashboard.types";
import { useAuth } from "@/features/Auth/hooks/authhook";
import { logoutUserApi } from "@/features/Auth/api/loginuser.api";

const sidebarItems: DashboardSidebarItem[] = [
  {
    label: "Dashboard",
    path: "/pet-owner/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Appointments",
    path: "/pet-owner/appointments",
    icon: <CalendarDays size={20} />,
  },
  // 💡 Phase 4: Registered E-commerce Orders link
  {
    label: "My Purchases",
    path: "/pet-owner/orders",
    icon: <ShoppingBag size={20} />,
  },
  {
    label: "Find Doctor",
    path: "/doctors",
    icon: <Stethoscope size={20} />,
  },
  {
    label: "Marketplace",
    path: "/marketplace1",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Cart",
    path: "/cart",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Profile",
    path: "/pet-owner/profile",
    icon: <UserRound size={20} />,
  },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticateUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUserApi();
    } catch (error) {
      console.error("User logout failed:", error);
    } finally {

      setUser(undefined);
      setIsAuthenticateUser(false);
      navigate("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[260px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex w-full items-center gap-3 border-b border-slate-100 px-7 py-6 text-left"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF7F5] text-[#078b91]">
          <PawPrint size={27} />
        </div>

        <div>
          <h1 className="text-xl font-black text-[#078b91]">
            Pets Veta
          </h1>

          <p className="text-xs font-semibold text-slate-500">
            Care • Love • Heal
          </p>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition ${isActive
                ? "bg-[#EAF7F5] text-[#078b91]"
                : "text-[#20263D] hover:bg-slate-50"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="mx-5 mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 cursor-pointer"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default DashboardSidebar;