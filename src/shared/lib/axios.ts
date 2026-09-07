import axios, { AxiosError } from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000', withCredentials: true })
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') window.location.href = '/login'
    return Promise.reject(error)
  },
)
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'Something went wrong. Please try again.'
}
