import axios from "axios";
import { api } from "../../api interface/axios.interface";

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type DoctorSchedule = {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

export type DoctorSchedulePayload = {
  date: string;      
  startTime: string;  
  endTime: string;    
};
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.log("Status Code", error.response?.status);
      console.log("Response Data", error.response?.data);
    } else if (error.request) {
      console.log("No Request Response Received from server", error.request);
    } else {
      console.error("Axios setup error:", error.message);
    }
  } else {
    console.error("Non-Axios Error:", error);
  }
};

export const getDoctorAvailability = async (): Promise<ApiResponse<DoctorSchedule[]> | undefined> => {
  try {
    const response = await api.get<ApiResponse<DoctorSchedule[]>>("doctor/schedule/me");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return undefined;
  }
};



export const createDoctorAvailabilitySlot = async (
  payload: DoctorSchedulePayload,
): Promise<ApiResponse<DoctorSchedule> | undefined> => {
  try {
    const response = await api.post<ApiResponse<DoctorSchedule>>(
      "doctor/schedule",
      payload,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return undefined;
  }
};


