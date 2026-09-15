import { api, handleAxiosError } from "@/features/api interface/axios.interface";

type Data = {
    id?: string,
    email: string,
    role: string,
    username: string,
    expiresIn?: number
}

export type ApiResponse = {
    success: boolean,
    message: string,
    data: Data
}

export const createDoctorAccount = async (data: FormData): Promise<ApiResponse> => {
    try {
        const response = await api.post("auth/register/doctor", data)

        return response.data;
    }
    catch (error) {
        handleAxiosError(error)
        throw error
    }
}