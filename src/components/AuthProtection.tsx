
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthProtectionProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'shop';
}

const AuthProtection: React.FC<AuthProtectionProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userRole = localStorage.getItem('role');

      if (!token || !user) {
        router.push('/login');
        return;
      }

      // If a specific role is required, check if user has that role
      if (requiredRole && userRole !== requiredRole) {
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthProtection;