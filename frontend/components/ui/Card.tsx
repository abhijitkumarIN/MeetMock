'use client'
import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'rounded-lg border border-editor-border bg-editor-secondary shadow-editor',
      className
    )}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight text-white', className)}>
      {children}
    </h3>
  );
};

const CardDescription: React.FC<CardProps> = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-gray-400', className)}>
      {children}
    </p>
  );
};

const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent };