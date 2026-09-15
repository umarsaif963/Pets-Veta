import { useEffect, useState } from "react";
import PetOwnerForm from "../components/pets-owner";
import BrandPanel from "../components/login/BrandPanel";

const FIT_WIDTH = 1440;
const FIT_HEIGHT = 900;
const LG_BREAKPOINT = 1024;

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = () => setMatches(mql.matches);

    mql.addEventListener("change", handleChange);
    setMatches(mql.matches);

    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};

const useFitScale = () => {
  const compute = () =>
    Math.min(window.innerWidth / FIT_WIDTH, window.innerHeight / FIT_HEIGHT, 1);

  const [scale, setScale] = useState(compute);

  useEffect(() => {
    const handleResize = () => setScale(compute());
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return scale;
};

const PetOwnerSignupPage = () => {
  const isDesktop = useMediaQuery(`(min-width: ${LG_BREAKPOINT}px)`);
  const fitScale = useFitScale();

  return (
    <main className="login-page relative flex min-h-screen w-full overflow-hidden text-[#07182c] lg:h-screen">
      {/* Brand background (full page) */}
      <div className="absolute inset-0 z-0">
        <BrandPanel />
      </div>

      {/* Signup form overlay */}
      {isDesktop ? (
        <div className="absolute inset-0 z-10 flex items-center justify-end">
          <div
            className="relative"
            style={{ width: FIT_WIDTH * fitScale, height: FIT_HEIGHT * fitScale }}
          >
            <div
              className="flex h-full w-full items-center justify-end"
              style={{ transform: `scale(${fitScale})`, transformOrigin: "top left" }}
            >
              <SignupCard />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-5 py-10">
          <SignupCard />
        </div>
      )}
    </main>
  );
};

const SignupCard = () => {
  return (
    <div className="flex w-full items-center justify-center px-6 py-10 lg:mt-32 lg:w-[660px] lg:max-w-[660px] lg:px-6">
      <div className="w-full max-w-[620px] lg:max-w-none">
        <div className="rounded-[24px] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(7,24,44,0.16)] sm:p-9">
          <PetOwnerForm />
        </div>
      </div>
    </div>
  );
};

export default PetOwnerSignupPage;