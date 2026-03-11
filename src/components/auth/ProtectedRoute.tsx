import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    requiredPermission?: string;
}

export const ProtectedRoute = ({
    children,
    allowedRoles,
    requiredPermission
}: ProtectedRouteProps) => {
    const { isAuthenticated, user, isHydrated } = useAuthStore();
    const location = useLocation();

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user) {
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/dashboard" replace />;
        }

        if (requiredPermission && user.permissions) {
            const hasPermission = user.permissions.includes('*') ||
                user.permissions.includes(requiredPermission) ||
                user.permissions.includes(`${requiredPermission.split(':')[0]}:*`);

            if (!hasPermission) {
                return <Navigate to="/dashboard" replace />;
            }
        }
    }

    return <>{children}</>;
};
