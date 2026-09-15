import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { userLogin, type ApiResponse } from '../api/loginuser.api'
import { type LoginFormData } from '../schemas/login.schema'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './authhook'

const getPostLoginPath = (role: string) => {
    if (role === "Admin") {
        return "/admin-dashboard";
    }

    if (role === "Doctor") {
        return "/doctor-dashboard";
    }

    if (role === "PetOwner" || role === "Seller") {
        return "/";
    }

    return "/";
};

export const useLogin = (options: UseMutationOptions<ApiResponse, Error, LoginFormData>) => {
    const navigate = useNavigate();
    const { setIsAuthenticateUser, setUser } = useAuth()
    return useMutation({
        mutationFn: userLogin,
        ...options,

        onSuccess: (data) => {
            console.log("Login Success", data)
            setUser(data);
            setIsAuthenticateUser(true);
            navigate(getPostLoginPath(data.data.role));
        },

        onError: (error) => {
            console.log("Login Error ", error.message)
        }

    })
}
