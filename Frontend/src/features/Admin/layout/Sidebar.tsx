import Logo from "../../../shared/components/Logo/Logo";
import { NavLink, useNavigate } from "react-router-dom";
import { sidebarItems } from "../data/sidebar.data";
import { LogOut, X } from 'lucide-react'
import { logoutAdmin } from '../apis/adminlogin.api'
import { useAuth } from "@/features/Auth/hooks/authhook";
import type { SidebarProps } from "../types/admin.types";

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticateUser } = useAuth();
  const logOutUser = async () => {
    const response = await logoutAdmin();
    console.log(response);
    if (response.success) {
      setUser(undefined);
      setIsAuthenticateUser(false);
      navigate('/admin-login', { replace: true });
  
    }
  }
  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[210px] flex-col justify-between border-r border-gray-200 bg-white p-5 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={21} />
            </button>
          </div>

          <nav className="mt-10 space-y-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.address}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }: { isActive: boolean }) => `
                              flex items-center gap-3
                              px-4 py-3
                                rounded-xl
                              cursor-pointer
                                transition-all duration-300

                              ${isActive
                      ? "bg-[#06777D] text-white shadow-lg"
                      : "hover:bg-cyan-100 text-gray-700"}
                                `}
                >
                  <Icon />
                  {item.title}
                </NavLink>

              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-start gap-1.5">
          <button
            className="cursor-pointer font-semibold text-red-500"
            onClick={logOutUser}
          >
            Logout
          </button>
          <LogOut className="size-4 cursor-pointer text-red-500 hover:scale-75" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
