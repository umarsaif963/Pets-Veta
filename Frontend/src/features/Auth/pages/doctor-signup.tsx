import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import DoctorForm from "../components/doctor-form";

export default function DoctorSignup() {
  return (
    <main className="relative flex min-h-screen w-full overflow-hidden bg-[#f4fbff] text-[#07182c]">
      {/* Background glow accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#c9f3f1]/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#dff1ff]/60 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-12 lg:flex-row lg:px-6">
        {/* Brand side */}
        <div className="w-full max-w-md lg:w-[38%]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#009f9d] text-white shadow-[0_10px_22px_rgba(0,159,157,0.32)]">
              <Stethoscope className="h-6 w-6" />
            </span>

            <span className="text-left">
              <span className="block text-[22px] font-extrabold leading-none tracking-tight text-[#07182c]">
                PetsVeta
              </span>

              <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-[#009f9d]">
                Health • Care • Community
              </span>
            </span>
          </div>

          <h1 className="mt-10 text-[34px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#07182c]">
            Join as a
            <br />
            <span className="text-[#00a7a5]">Veterinary Doctor</span>
          </h1>

          <p className="mt-4 text-[15px] font-medium leading-[1.7] text-slate-600">
            Create your professional profile, submit your verification
            document, and start booking appointments with pet owners in your
            area.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Manage availability & appointments easily",
              "Reach pet parents looking for expert care",
              "Verified profile builds trust faster",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d9f7f6] text-[#009f9d]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#009f9d]" />
                </span>

                <span className="text-[14px] font-medium text-slate-600">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 hidden rounded-3xl border border-[#c9f3f1] bg-white/80 p-6 backdrop-blur lg:block">
            <p className="text-center text-[18px] leading-snug text-[#009f9d]">
              Better Care Together
            </p>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full lg:w-[62%]">
          <DoctorForm />
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-10 text-center lg:hidden">
        <p className="text-[13px] font-medium text-slate-500">
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
}