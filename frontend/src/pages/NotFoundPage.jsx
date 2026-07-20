import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6 selection:bg-primary/20 animate-fade-in">
      <div className="max-w-md w-full">
        <EmptyState
          icon={<FileQuestion className="w-12 h-12 text-primary animate-bounce" />}
          title="Page Not Found"
          description="The page you are looking for does not exist or has been moved. Check the URL or return to safety."
          actionButton={{
            onClick: () => navigate('/dashboard'),
            children: 'Back to Dashboard',
            className: 'font-bold px-6 shadow-md',
          }}
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
