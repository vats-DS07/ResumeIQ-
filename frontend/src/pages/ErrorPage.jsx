import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ui/ErrorState';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ErrorPage = ({ message, onRetry }) => {
  const navigate = useNavigate();

  const handleDefaultRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center p-6 selection:bg-primary/20 animate-fade-in">
      <div className="max-w-md w-full flex flex-col gap-6">
        <ErrorState
          title="System Error"
          message={message || "Something went wrong on our end. Please try again or return to the dashboard."}
          onRetry={handleDefaultRetry}
        />
        {!onRetry && (
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="self-center font-bold"
          >
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
