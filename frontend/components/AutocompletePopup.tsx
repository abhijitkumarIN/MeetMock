'use client'
import React, { useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

interface AutocompletePopupProps {
  suggestions: string[];
  position: { x: number; y: number };
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
}

const AutocompletePopup: React.FC<AutocompletePopupProps> = ({ 
  suggestions, 
  position, 
  selectedIndex, 
  onSelect, 
  onClose 
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleItemClick = (suggestion: string): void => {
    onSelect(suggestion);
  };

  // Ensure popup stays within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 250),
    y: Math.min(position.y, window.innerHeight - (suggestions.length * 40 + 20))
  };

  return (
    <div
      ref={popupRef}
      className="absolute bg-editor-secondary border border-editor-border rounded-md shadow-popup z-50 min-w-48 max-w-64 animate-slide-up"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <div className="py-1">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={cn(
              'px-4 py-2 cursor-pointer text-sm font-mono transition-colors',
              index === selectedIndex 
                ? 'bg-editor-accent text-white' 
                : 'text-editor-text hover:bg-editor-tertiary'
            )}
            onClick={() => handleItemClick(suggestion)}
          >
            <span className="flex items-center">
              <span className="text-code-function mr-2">⚡</span>
              {suggestion}
            </span>
          </div>
        ))}
      </div>
      
      {/* Keyboard hint */}
      <div className="px-4 py-2 border-t border-editor-border bg-editor-tertiary">
        <div className="text-xs text-gray-400 flex items-center justify-between">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};

export default AutocompletePopup;