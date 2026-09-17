import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

const ContinueAsPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen w-full overflow-hidden bg-[#f4fbff] text-[#07182c]">
      {/* Background glow accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#c9f3f1]/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#dff1ff]/60 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          aria-label="PetsVeta home"
          className="inline-flex items-center gap-3 transition hover:opacity-85"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#009f9d] text-white shadow-[0_10px_22px_rgba(0,159,157,0.32)]">
            <PawPrint className="h-6 w-6" />
          </span>

          <span className="text-left">
            <span className="block text-[22px] font-extrabold leading-none tracking-tight text-[#07182c]">
              PetsVeta
            </span>

            <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-[#009f9d]">
              Health • Care • Community
            </span>
          </span>
        </Link>

        {/* Heading */}
        <div className="mt-10 text-center">
          <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#07182c] sm:text-[40px]">
            Join PetsVeta
          </h1>

          <p className="mt-3 text-[15px] font-medium text-slate-500">
            Choose your account type to continue registration.
          </p>
        </div>

        {/* Role cards */}
        <div className="mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* Pet Owner */}
          <button
            type="button"
            onClick={() => navigate("/signup/pet-owner")}
            className="group flex flex-col rounded-[24px] border border-white bg-white p-7 text-left shadow-[0_20px_50px_rgba(7,24,44,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-[#009f9d]/30 hover:shadow-[0_28px_70px_rgba(0,159,157,0.18)] sm:p-8"
          >
            <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#d9f7f6] text-[#009f9d] transition group-hover:bg-[#009f9d] group-hover:text-white">
              <UserRound className="h-8 w-8" />
            </span>

            <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#07182c]">
              Pet Owner
            </h2>

            <p className="mt-3 flex-1 text-[14px] font-medium leading-[1.7] text-slate-500">
              Create an account to book veterinary appointments, manage your
              pets, and access pet care services.
            </p>

            <ul className="mt-5 space-y-2.5">
              {[
                "Book vet appointments",
                "Track pet health records",
                "Shop pet products & accessories",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-[13px] font-semibold text-[#178f95]"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#d9f7f6]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#009f9d]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <span className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#009f9d] px-6 py-3.5 text-[15px] font-bold text-white transition-all duration-300 group-hover:bg-[#008f8d] group-hover:shadow-[0_12px_26px_rgba(0,159,157,0.32)]">
              Register as Pet Owner
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </button>

          {/* Doctor */}
          <button
            type="button"
            onClick={() => navigate("/signup/doctor")}
            className="group flex flex-col rounded-[24px] border border-white bg-white p-7 text-left shadow-[0_20px_50px_rgba(7,24,44,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-[#009f9d]/30 hover:shadow-[0_28px_70px_rgba(0,159,157,0.18)] sm:p-8"
          >
            <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#d9f7f6] text-[#009f9d] transition group-hover:bg-[#009f9d] group-hover:text-white">
              <Stethoscope className="h-8 w-8" />
            </span>

            <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#07182c]">
              Doctor
            </h2>

            <p className="mt-3 flex-1 text-[14px] font-medium leading-[1.7] text-slate-500">
              Create your doctor profile, submit your verification document,
              manage availability, and handle appointments.
            </p>

            <ul className="mt-5 space-y-2.5">
              {[
                "Verified professional profile",
                "Manage availability & bookings",
                "Grow your veterinary practice",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-[13px] font-semibold text-[#178f95]"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#d9f7f6]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#009f9d]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <span className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#009f9d] px-6 py-3.5 text-[15px] font-bold text-white transition-all duration-300 group-hover:bg-[#008f8d] group-hover:shadow-[0_12px_26px_rgba(0,159,157,0.32)]">
              Register as Doctor
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>

        {/* Trust footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, label: "Secure & Verified" },
            { icon: <CalendarCheck className="h-5 w-5" />, label: "Easy Booking" },
          ].map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#178f95]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#009f9d] shadow">
                {item.icon}
              </span>
              {item.label}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-[14px] font-medium text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#009f9d] transition hover:text-[#008f8d]"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ContinueAsPage;