import LoginPage from "./pages/login";
import ContinueAsPage from "./pages/ContinueAs";
import PetOwnerSignupPage from "./pages/pet-owner-signup";
import DoctorSignupPage from "./pages/doctor-signup";
import { AuthSuccess } from "./components/AuthSuccess";
import ForgotPasswordPage from "./pages/forgot-password";
import VerifyOtpPage from "./pages/verify-otp";
import ResetPasswordPage from "./pages/reset-password";


const AuthRouter = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/continue-as",
    element: <ContinueAsPage />,
  },
  {
    path: "/signup/pet-owner",
    element: <PetOwnerSignupPage />,
  },
  {
    path: "/signup/doctor",
    element: <DoctorSignupPage />,
  },
  {
    path: "/auth-success",
    element: <AuthSuccess />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtpPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
];

export default AuthRouter;
