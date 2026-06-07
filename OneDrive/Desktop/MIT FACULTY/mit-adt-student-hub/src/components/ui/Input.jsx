import { forwardRef } from 'react';

/**
 * Input — labelled form field with error state.
 */
const Input = forwardRef(({
  label,
  error,
  placeholder,
  type = 'text',
  className = '',
  hint,
  ...props
}, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">
        {label}
      </label>
    )}
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      className={`input-field ${error ? 'border-red-500 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.12)]' : ''} ${className}`}
      {...props}
    />
    {error && (
      <p className="text-[12px] text-red-500 font-medium">{error}</p>
    )}
    {hint && !error && (
      <p className="text-[12px] text-[var(--color-text-tertiary)]">{hint}</p>
    )}
  </div>
));

Input.displayName = 'Input';
export default Input;
