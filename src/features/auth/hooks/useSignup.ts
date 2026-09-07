import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signup } from '../api/auth.api'
export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: signup, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }) })
}
