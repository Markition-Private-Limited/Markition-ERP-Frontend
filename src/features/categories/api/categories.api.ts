import { api } from '../../../shared/lib/axios'

export interface Category { id: string; name: string; parent_category_id: string | null }
export interface CreateCategoryInput { name: string; parent_category_id?: string }
export type UpdateCategoryInput = Partial<CreateCategoryInput>

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (body: CreateCategoryInput) => api.post<Category>('/categories', body),
  update: (id: string, body: UpdateCategoryInput) => api.patch<Category>(`/categories/${id}`, body),
  delete: (id: string) => api.delete<Category>(`/categories/${id}`),
}

export const createCategory = (input: CreateCategoryInput) => categoriesApi.create(input).then((response) => response.data)
