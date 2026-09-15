import type { VerifyOtpFormData } from "../schemas/verify-otp.schema";
import { api, handleAxiosError } from "@/features/api interface/axios.interface";

type Data = {
    id: string,
    username: string,
    email: string,
    role: string,
    expiresIn?: number
}

type resendOtpData = {
    email: string,
    expiresIn?: number
}

export type ApiResponse = {
    success: boolean,
    message: string,
    data: Data | resendOtpData
}

export const verifyUserOtp = async (data: VerifyOtpFormData): Promise<ApiResponse> => {
    try {
        console.log("OTP code inside the function is ", data)
        const response = await api.post("auth/otp-verification",
            data,

        );


        return response.data;
    } catch (error) {
        handleAxiosError(error)
        throw error;

    }
}

export const resendUserOtp = async (): Promise<ApiResponse> => {
    try {
        const response = await api.get("auth/resend/otp");


        return response.data;
    } catch (error) {
        handleAxiosError(error)
        throw error;

    }
}