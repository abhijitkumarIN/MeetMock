import { useState, useRef, useCallback } from 'react';
import { AutocompleteState, AutocompleteRequest } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface UseAutocompleteProps {
  onSuggestionSelect: (suggestion: string) => void;
  language?: string;
}

interface UseAutocompleteReturn {
  autocomplete: AutocompleteState;
  triggerAutocomplete: (code: string, cursorPosition: number, textareaRef: React.RefObject<HTMLTextAreaElement | null>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
  hideAutocomplete: () => void;
}

export const useAutocomplete = ({ onSuggestionSelect, language = "python" }: UseAutocompleteProps): UseAutocompleteReturn => {
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    show: false,
    suggestions: [],
    position: { x: 0, y: 0 },
    selectedIndex: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideAutocomplete = useCallback(() => {
    setAutocomplete(prev => ({ ...prev, show: false }));
  }, []);

  const triggerAutocomplete = useCallback(async (
    code: string, 
    cursorPosition: number, 
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hide autocomplete initially
    hideAutocomplete();

    // Set new timeout for autocomplete
    timeoutRef.current = setTimeout(async () => {
      try {
        const requestBody: AutocompleteRequest = {
          code,
          cursor_position: cursorPosition,
          language
        };

        const response = await fetch(API_ENDPOINTS.AUTOCOMPLETE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.suggestions && data.suggestions.length > 0) {
          const textarea = textareaRef.current;
          if (!textarea) return;

          const rect = textarea.getBoundingClientRect();
          const textBeforeCursor = code.substring(0, cursorPosition);
          const lines = textBeforeCursor.split('\n');
          const currentLine = lines.length - 1;
          const currentColumn = lines[lines.length - 1].length;
          
          // More accurate position calculation
          const lineHeight = 22;
          const charWidth = 8.5;
          const scrollTop = textarea.scrollTop;
          const scrollLeft = textarea.scrollLeft;
          
          setAutocomplete({
            show: true,
            suggestions: data.suggestions,
            position: {
              x: Math.max(0, rect.left + (currentColumn * charWidth) - scrollLeft),
              y: Math.max(0, rect.top + (currentLine * lineHeight) + lineHeight - scrollTop)
            },
            selectedIndex: 0
          });
        }
      } catch (error) {
        console.error('Error fetching autocomplete:', error);
      }
    }, 600); // 600ms delay as specified
  }, [hideAutocomplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
    if (!autocomplete.show) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.suggestions.length - 1)
        }));
        return true;
      
      case 'ArrowUp':
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0)
        }));
        return true;
      
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        onSuggestionSelect(autocomplete.suggestions[autocomplete.selectedIndex]);
        hideAutocomplete();
        return true;
      
      case 'Escape':
        hideAutocomplete();
        return true;
      
      default:
        return false;
    }
  }, [autocomplete, onSuggestionSelect, hideAutocomplete]);

  return {
    autocomplete,
    triggerAutocomplete,
    handleKeyDown,
    hideAutocomplete,
  };
};