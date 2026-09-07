import { api } from '../../../shared/lib/axios'

export interface Unit {
  id: string
  name: string
  code: string
  base_unit_id: string | null
  conversion_factor: string
}
export interface CreateUnitInput { name: string; code: string; base_unit_id?: string; conversion_factor?: number }
export type UpdateUnitInput = Partial<CreateUnitInput>

export const unitsApi = {
  create: (body: CreateUnitInput) => api.post<Unit>('/units', body),
  list: () => api.get<Unit[]>('/units'),
  getById: (id: string) => api.get<Unit>(`/units/${id}`),
  update: (id: string, body: UpdateUnitInput) => api.patch<Unit>(`/units/${id}`, body),
  delete: (id: string) => api.delete<Unit>(`/units/${id}`),
  seedDefaults: (body: { businessType: string }) => api.post<Unit[]>('/units/seed-defaults', body),
}

export const createUnit = (input: CreateUnitInput) => unitsApi.create(input).then((response) => response.data)
