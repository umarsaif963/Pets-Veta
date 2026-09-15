import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { type PetOwnerFormData } from '../schemas/petowner.schema'
import { createPetOwnerAccount } from '../api/petOwner.api'
import { type ApiResponse } from '../api/petOwner.api'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../types/auth.types'


export const usePetOwnerHook = (options: UseMutationOptions<ApiResponse, AxiosError<ApiErrorResponse>, PetOwnerFormData>) => {

    const navigate = useNavigate();


    return useMutation({

        mutationFn: createPetOwnerAccount,

        ...options,

        onSuccess: (response, variables, onMutateResult, context) => {
            console.log("Account Success", response)
            if (response?.success) {
                navigate('/verify-otp', { state: { from: 'signup', expiresIn: response?.data?.expiresIn } })
            }
            options.onSuccess?.(response, variables, onMutateResult, context)

        },

        onError: (error, variables, onMutateResult, context) => {
            console.log("Account Error ", error.message)
            options.onError?.(error, variables, onMutateResult, context)

        }
    })
}
