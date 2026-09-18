import { Link } from "react-router-dom";
import type { LoginFormData } from "../../schemas/login.schema";
import LogoImage from "@/shared/components/Logo/LogoImage";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";

interface AuthCardProps {
  onSubmit: (data: LoginFormData) => void;
  isSubmitting: boolean;
  serverError: string | null;
  isGoogleLoading: boolean;
  onGoogleLogin: () => void;
}

const AuthCard = ({
  onSubmit,
  isSubmitting,
  serverError,
  isGoogleLoading,
  onGoogleLogin,
}: AuthCardProps) => {
  return (
    <div className="flex w-full items-center justify-center px-6 py-10 lg:mt-24 lg:w-[600px] lg:justify-center lg:px-6">
      <div className="w-full max-w-[600px]">
        {/* Mobile wordmark */}
        <div className="mb-7 flex items-center justify-center gap-2 lg:hidden">
          <Link
            to="/"
            aria-label="PetsVeta home"
            className="flex items-center gap-2 transition hover:opacity-85"
          >
            <span className="block overflow-hidden rounded-xl bg-white">
              <LogoImage className="h-9 w-9" />
            </span>

            <span className="text-[22px] font-extrabold tracking-tight text-[#07182c]">
              PetsVeta
            </span>
          </Link>
        </div>

        {/* Auth card */}
        <div className="rounded-[24px] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(7,24,44,0.16)] sm:p-9">
          <LoginHeader />

          <LoginForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            serverError={serverError}
            isGoogleLoading={isGoogleLoading}
            onGoogleLogin={onGoogleLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthCard;