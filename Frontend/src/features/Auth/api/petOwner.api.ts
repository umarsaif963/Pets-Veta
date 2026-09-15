import type { PetOwnerFormData } from "../schemas/petowner.schema";
import { api, handleAxiosError } from "@/features/api interface/axios.interface";

type Data = {
    id: string,
    email: string,
    username: string,
    role: string
}

export type ApiResponse = {
    success: boolean,
    message: string,
    data: Data
}

export const createPetOwnerAccount = async (data: PetOwnerFormData): Promise<ApiResponse> => {
    try {
        const response = await api.post("auth/register/pet-owner", data);

        return response.data;
    } catch (error) {
        handleAxiosError(error)
        throw error

    }
}

export const getGoogleAuthUrlApi = async () => {
    try {
        const response = await api.get("/auth/google/url");
        return response.data
    }
    catch (error) {
        handleAxiosError(error)
    }
}