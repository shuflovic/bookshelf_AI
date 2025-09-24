
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  text: string;
  primary?: boolean;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, text, primary = false, disabled = false }) => {
  const baseClasses = "w-full sm:w-auto font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const primaryClasses = "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500";
  const secondaryClasses = "bg-gray-600 text-gray-200 hover:bg-gray-500 focus:ring-gray-500";
  
  const classes = `${baseClasses} ${primary ? primaryClasses : secondaryClasses}`;

  return (
    <button onClick={onClick} className={classes} disabled={disabled}>
      {text}
    </button>
  );
};

export default ActionButton;
