import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton } from '../ui/Skeleton';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show premium skeleton loading screen during initial authentication handshake
  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text p-8 flex flex-col gap-6 text-left max-w-7xl mx-auto pt-16">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton width="180px" height="28px" />
            <Skeleton width="280px" height="18px" />
          </div>
          <Skeleton width="140px" height="40px" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[320px]">
            <Skeleton width="100%" height="100%" className="rounded-xl" />
          </div>
          <div className="lg:col-span-8 h-[320px]">
            <Skeleton width="100%" height="100%" className="rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login with original request query path preserved
  if (!user) {
    const fullPath = location.pathname + location.search;
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(fullPath)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
