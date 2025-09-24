
import React from 'react';
import ActionButton from './ActionButton';

interface ErrorDisplayProps {
  message: string;
  onReset: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 w-full max-w-lg" role="alert">
        <strong className="font-bold">An Error Occurred</strong>
        <span className="block sm:inline ml-2">{message}</span>
      </div>
      <ActionButton onClick={onReset} text="Try Again" primary={true} />
    </div>
  );
};

export default ErrorDisplay;
