import { api, handleAxiosError } from "@/features/api interface/axios.interface";
import type { PetFormData } from "../schemas/pet.schema";

export interface PetResponse {
  id: string;
  name: string;
  age: number;
  breed: string;
  category: string;
}

export interface SubmitIssueResponse {
  success: boolean,
  message: string,
  data: {
    checkoutUrl: string
  }
}

export const submitPetData = async (data: PetFormData & { petOwnerId: string }): Promise<PetResponse | undefined> => {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("age", String(data.age));
    formData.append("breed", data.breed);
    formData.append("category", data.category);

    Array.from(data.photos).forEach((photo) => {
      formData.append("photos", photo);
    });

    const response = await api.post("petOwner/submit/pet-data", formData);
    return response.data?.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};
export const submitPetIssue = async (payload: {
  petId: string;
  issue: string;
  appointmentId?: string;
  appointmentType?: string;
  checkupTime?: string;
  petOwnerId?: string;
  doctorId?: string;
}) => {
  try {
    const response = await api.post("petOwner/submit/pet-issue", payload);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};



export const getPetsData = async (): Promise<PetResponse[] | undefined> => {
  try {
    const response = await api.get("petOwner/pets-data");
    return response.data?.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};
