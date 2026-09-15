import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { type VerifyOtpFormData } from '../schemas/verify-otp.schema'
import { verifyUserOtp, type ApiResponse } from '../api/verifyotp.api'
import { useAuth } from './authhook'
import type { ApiResponse as SessionResponse } from '../api/loginuser.api'

export const useOtp = (options: UseMutationOptions<ApiResponse, Error, VerifyOtpFormData>) => {

    const { setUser, setIsAuthenticateUser } = useAuth();

    return useMutation({
        mutationFn: verifyUserOtp,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            console.log("Otp Send success", data)
            // Tokens are issued by the server only after the OTP is verified.
            if (data?.success) {
                setUser(data as SessionResponse);
                setIsAuthenticateUser(true);
            }
            options.onSuccess?.(data, variables, onMutateResult, context)
        },
        onError: (error, variables, onMutateResult, context) => {
            console.log("OTP Error ", error.message);
            options.onError?.(error, variables, onMutateResult, context)
        }
    })

}
