import { api } from '../../../shared/lib/axios'

export interface HealthResponse { status: string; db: 'connected' | 'disconnected' }

export const healthApi = {
  get: () => api.get<HealthResponse>('/health'),
}
