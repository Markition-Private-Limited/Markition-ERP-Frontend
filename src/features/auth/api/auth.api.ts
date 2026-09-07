import { api } from '../../../shared/lib/axios'
import type { User } from '../../../shared/types'

export interface LoginInput { email: string; password: string }
export interface SignupInput { tenantName: string; email: string; password: string }

export const authApi = {
  signup: (body: SignupInput) => api.post('/auth/signup', body),
  login: (body: LoginInput) => api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
}

export const login = (input: LoginInput) => authApi.login(input).then((response) => response.data)
export const signup = (input: SignupInput) => authApi.signup(input).then((response) => response.data)
export const getMe = () => authApi.me().then((response) => response.data)
export const logout = () => authApi.logout()
