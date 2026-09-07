import { api } from '../../../shared/lib/axios'

export interface CompanyProfile {
  tenant_id: string
  name: string | null
  address: string | null
  phone: string | null
  tax_number: string | null
  logo_url: string | null
  updated_at: string | null
}

export interface UpdateCompanyProfileInput {
  name?: string
  address?: string
  phone?: string
  tax_number?: string
}

export interface InvoiceReadiness {
  ready: boolean
  missing_fields: Array<'name' | 'tax_number'>
}

export const companyProfileApi = {
  get: () => api.get<CompanyProfile>('/company-profile'),
  getInvoiceReadiness: () => api.get<InvoiceReadiness>('/company-profile/invoice-readiness'),
  update: (body: UpdateCompanyProfileInput) => api.patch<CompanyProfile>('/company-profile', body),
  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<CompanyProfile>('/company-profile/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
