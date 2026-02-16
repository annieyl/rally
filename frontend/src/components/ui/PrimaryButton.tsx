import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ children, onClick, fullWidth = false, disabled = false }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  );
}
