import type { ForgotPasswordFormData } from "../schemas/forgot-password.schema";
import { api, handleAxiosError } from "@/features/api interface/axios.interface";

type Data = {
    email: string,
    expiresIn?: number
}

export type ApiResponse = {
    success: boolean,
    message: string,
    data: Data
}

export const veriyUserEmail = async (data: ForgotPasswordFormData): Promise<ApiResponse> => {
    try {
        const response = await api.post("auth/verify/email", data)

        return response.data;

    } catch (error) {
        handleAxiosError(error)
        throw error

    }
}