import { useMe } from '../../features/auth/hooks/useMe'
export function useAuth() {
  const query = useMe()
  return { ...query, user: query.data ?? null, tenant: query.data?.tenant ?? null }
}
