import type { LoginFormData } from "../schemas/login.schema";
import { api,handleAxiosError } from "@/features/api interface/axios.interface";

type Data = {
    id: string,
    name?: string,
    email: string,
    role: string,
    username: string,
    profileImageUrl?: string
}

export type ApiResponse = {
    success: boolean,
    message: string,
    data: Data
}

export const userLogin = async<T>(data: LoginFormData): Promise<T> => {
    try {
        const response = await api.post("auth/login/user", data)
        return response.data;
    } catch (error) {
       handleAxiosError(error)
        throw error

    }
}


export const verifyUser = async (): Promise<ApiResponse> => {

    try {
        const response = await api.get("auth/me",
            {
                withCredentials: true
            }
        )
        return response.data;
    } catch (error) {
        handleAxiosError(error)
        throw error

    }
}


export const logoutUserApi = async (): Promise<ApiResponse> => {
    try {
        const response = await api.post("auth/logout/user");
        return response.data;
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};