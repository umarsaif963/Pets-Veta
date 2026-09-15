import { PawPrint } from "lucide-react";
import type { LoginFormData } from "../../schemas/login.schema";
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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#009f9d] text-white">
            <PawPrint className="h-5 w-5" />
          </span>

          <span className="text-[22px] font-extrabold tracking-tight text-[#07182c]">
            PetsVeta
          </span>
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