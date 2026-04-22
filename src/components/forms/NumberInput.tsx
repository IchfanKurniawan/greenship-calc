interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  required?: boolean;
  hint?: string;
  error?: string;
  step?: string;
  integer?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  unit,
  placeholder,
  min,
  required,
  hint,
  error,
  step = '0.001',
  integer = false,
}) => {
  const inputPaddingClass = unit ? 'pr-16' : 'pr-4';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    if (integer) {
      if (raw === '' || /^\d+$/.test(raw)) {
        onChange(raw);
      }
      return;
    }

    if (raw === '' || /^\d*\.?\d{0,3}$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="label-sm text-[#1B4E4D]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          placeholder={placeholder ?? '0.000'}
          min={min}
          step={integer ? '1' : step}
          className={`
            w-full h-11 px-4 ${inputPaddingClass}
            border rounded-lg bg-white text-[#272727] text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1B4E4D]/30 focus:border-[#1B4E4D]
            transition-all duration-200
            ${error ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}
          `}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 label-sm text-slate-400 pointer-events-none select-none">
            {unit}
          </span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="text-xs text-orange-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">warning</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default NumberInput;
