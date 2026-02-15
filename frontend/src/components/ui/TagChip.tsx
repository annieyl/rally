interface TagChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function TagChip({ label, selected, onClick }: TagChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        selected
          ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
          : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      {label}
    </button>
  );
}
