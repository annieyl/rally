import { ReactNode } from 'react';

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export function SecondaryButton({ children, onClick }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm transition-colors hover:bg-gray-50"
    >
      {children}
    </button>
  );
}
