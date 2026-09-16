import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { resendUserOtp, type ApiResponse } from '../api/verifyotp.api'


export const useResendOtp = (options: UseMutationOptions<ApiResponse, Error>) => {
    return useMutation({
        mutationFn: resendUserOtp,
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            console.log("Resend OTP Success ", data)
            options.onSuccess?.(data, variables, onMutateResult, context)
        },
        onError: (error, variables, onMutateResult, context) => {
            console.log("Resend OTP error ", error.message)
            options.onError?.(error, variables, onMutateResult, context)
        }
    })
}
