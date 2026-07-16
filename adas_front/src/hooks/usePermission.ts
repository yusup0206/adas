import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

/**
 * Returns true if the current user has ALL of the given permissions.
 */
export const usePermission = (...perms: string[]): boolean => {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user?.permissions) return false;
  return perms.every((p) => user.permissions.includes(p));
};

/**
 * Returns true if the current user has at least ONE of the given permissions.
 */
export const useAnyPermission = (...perms: string[]): boolean => {
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user?.permissions) return false;
  return perms.some((p) => user.permissions.includes(p));
};
