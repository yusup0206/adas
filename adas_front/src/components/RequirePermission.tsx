import React, { type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface RequirePermissionProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user || !user.permissions) {
    return <>{fallback}</>;
  }

  const permissionsRequired = Array.isArray(permission) ? permission : [permission];
  const hasPermission = permissionsRequired.some((p) => user.permissions.includes(p));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RequirePermission;
