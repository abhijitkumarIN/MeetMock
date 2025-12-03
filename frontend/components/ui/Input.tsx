'use client'
import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className, 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-editor-text">
          {label}
        </label>
      )}
      <input
        className={cn(
          'flex h-10 w-full rounded-md border border-editor-border bg-editor-bg px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-editor-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-editor-error focus:ring-editor-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-editor-error">{error}</p>
      )}
    </div>
  );
};

export default Input;