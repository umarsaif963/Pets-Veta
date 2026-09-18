import { useAuth } from "@/features/Auth/hooks/authhook";
import type React from "react";
import { Navigate } from "react-router-dom";


export const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticatedUser, isLoading } = useAuth();
    if (isLoading) {
        return <div>Loading....</div>
    }
    if (!isAuthenticatedUser) {
        return <Navigate to={'/login'} replace />
    }
    return children;
}