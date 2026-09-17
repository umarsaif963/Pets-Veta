import { PawPrint } from "lucide-react";
import { Link } from "react-router-dom";

const LoginHeader = () => {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <Link
        to="/"
        aria-label="PetsVeta home"
        className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#009f9d] text-white shadow-[0_12px_26px_rgba(0,159,157,0.32)] transition hover:opacity-85"
      >
        <PawPrint className="h-7 w-7" />
      </Link>

      <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-[#07182c]">
        Welcome Back
      </h1>

      <p className="mt-2 text-[14px] font-medium text-slate-500">
        Log in to your PetsVeta account
      </p>

      <span className="mt-4 h-1 w-12 rounded-full bg-[#009f9d]" />
    </div>
  );
};

export default LoginHeader;