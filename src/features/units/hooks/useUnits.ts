import { useQuery } from '@tanstack/react-query'
import { unitsApi } from '../api/units.api'

export const useUnits = () => useQuery({
  queryKey: ['units'],
  queryFn: () => unitsApi.list().then((response) => response.data),
})
