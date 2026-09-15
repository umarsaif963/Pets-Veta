import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../hooks/authhook";
import { getGoogleAuthUrlApi } from "../../api/petOwner.api";
import type { LoginFormData } from "../../schemas/login.schema";
import AuthCard from "./AuthCard";
import BrandPanel from "./BrandPanel";

const FIT_WIDTH = 1440;
const FIT_HEIGHT = 900;
const LG_BREAKPOINT = 1024;

const getPostLoginPath = (role: string) => {
  if (role === "Admin") {
    return "/admin-dashboard";
  }

  if (role === "Doctor") {
    return "/doctor-dashboard";
  }

  if (role === "PetOwner" || role === "Seller") {
    return "/choose-dashboard";
  }

  return "/";
};

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

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticatedUser, user } = useAuth();
  const { mutate: login, isPending: isSubmitting } = useLogin({});

  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isDesktop = useMediaQuery(`(min-width: ${LG_BREAKPOINT}px)`);
  const fitScale = useFitScale();

  useEffect(() => {
    if (isAuthenticatedUser && user?.data) {
      navigate(getPostLoginPath(user.data.role));
    }
  }, [isAuthenticatedUser, user, navigate]);

  const handleSubmit = (data: LoginFormData) => {
    setServerError(null);

    login(data, {
      onError: (error) => {
        const message =
          axios.isAxiosError(error) &&
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "Login failed. Please check your email and password.";

        setServerError(message);
      },
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setServerError(null);

      const result = await getGoogleAuthUrlApi();

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      setServerError("Google login failed. Please try again.");

      if (error instanceof Error) {
        console.error("Google Auth Error:", error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const authCardProps = {
    onSubmit: handleSubmit,
    isSubmitting,
    serverError,
    isGoogleLoading,
    onGoogleLogin: handleGoogleLogin,
  };

  return (
    <main className="login-page relative flex min-h-screen w-full overflow-hidden text-[#07182c] lg:h-screen">
      {/* Brand background (full page) */}
      <div className="absolute inset-0 z-0">
        <BrandPanel />
      </div>

      {/* Right-aligned login form overlay */}
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
              <AuthCard {...authCardProps} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen w-full items-center justify-center">
          <AuthCard {...authCardProps} />
        </div>
      )}
    </main>
  );
};

export default LoginPage;