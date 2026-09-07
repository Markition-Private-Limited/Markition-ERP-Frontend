import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory } from '../api/categories.api'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (created) => {
      queryClient.setQueryData(['categories'], (current: typeof created[] | undefined) =>
        current ? [...current.filter((category) => category.id !== created.id), created].sort((a, b) => a.name.localeCompare(b.name)) : [created],
      )
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
