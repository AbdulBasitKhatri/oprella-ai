import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ value, onChange, disabled = false, required = false, minLength, placeholder = '', className = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-zinc-400 transition hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
