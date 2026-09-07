import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUnit } from '../api/units.api'

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUnit,
    onSuccess: (created) => {
      queryClient.setQueryData(['units'], (current: typeof created[] | undefined) =>
        current ? [...current.filter((unit) => unit.id !== created.id), created].sort((a, b) => a.name.localeCompare(b.name)) : [created],
      )
      void queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}
