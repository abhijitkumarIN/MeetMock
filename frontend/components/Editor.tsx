'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AutocompletePopup from './AutocompletePopup';
import Button from './ui/Button';
import { WebSocketMessage } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAutocomplete } from '../hooks/useAutocomplete';

const Editor: React.FC = () => {
  const router = useRouter();
  const params = useParams();

  const roomId = useMemo(() => {
    const value = params?.roomId;
    return Array.isArray(value) ? value[0] : value || '';
  }, [params]);

const [code, setCode] = useState<string>('');  
  const [users, setUsers] = useState<string[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('python');

  const userIdRef = useRef<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('userName') || 'Anonymous';
    setUserName(stored);
    if (!userIdRef.current) {
      userIdRef.current = `${stored}_${Math.random().toString(36).slice(2)}`;
    }
  }, []);

  useEffect(() => {
    if (userName !== null && !roomId) {
      router.push('/');
    }
  }, [userName, roomId, router]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'sync':
        if (message.code !== undefined) setCode(message.code);
        if (message.users) setUsers(message.users);
        break;
      case 'code_change':
        if (message.code !== undefined) {
        setCode(prev => (message.code !== undefined ? message.code : prev));
        }
        break;
      case 'user_joined':
        if (message.users) {
          setUsers(message.users);
        }
        break;
      case 'user_left':
        if (message.user_id) {
          setUsers(prev => prev.filter(u => u !== message.user_id));
        }
        break;
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket({
    roomId: roomId || '',
    userId: userIdRef.current,
    onMessage: handleWebSocketMessage,
  });

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const pos = textarea.selectionStart;
      const updated = code.slice(0, pos) + suggestion + code.slice(pos);

      setCode(updated);

      sendMessage({ type: 'code_change', code: updated });

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          pos + suggestion.length,
          pos + suggestion.length
        );
      });
    },
    [code, sendMessage]
  );

  const { autocomplete, triggerAutocomplete, handleKeyDown, hideAutocomplete } =
    useAutocomplete({ onSuggestionSelect: insertSuggestion, language });

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = e.target.value;
    setCode(updated);

    sendMessage({ type: 'code_change', code: updated });

    triggerAutocomplete(updated, e.target.selectionStart, textareaRef);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (handleKeyDown(e)) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart: start, selectionEnd: end } = textarea;

      const updated = code.slice(0, start) + '  ' + code.slice(end);
      setCode(updated);

      requestAnimationFrame(() =>
        textarea.setSelectionRange(start + 2, start + 2)
      );
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert('Room ID copied!');
    } catch (err) {
      console.error(err);
      alert('Failed to copy');
    }
  };

  if (!roomId || userName === null) {
    return null; 
  }

  return (
    <div className="h-screen flex flex-col bg-editor-bg">
      {/* Header */}
      <header className="bg-editor-secondary border-b border-editor-border p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">
            Room:
            <span className="text-editor-accent font-mono ml-1">{roomId}</span>
          </h1>
          <Button onClick={copyRoomId} variant="outline" size="sm">
            Copy Room ID
          </Button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 text-sm bg-editor-secondary border border-editor-border rounded text-white focus:outline-none focus:ring-2 focus:ring-editor-accent"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 mr-2">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
          {users.map((u, i) => (
            <span
              key={i}
              className="bg-editor-accent text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              {u.split('_')[0]}
            </span>
          ))}
        </div>
      </header>

      <main className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className="w-full h-full bg-editor-bg text-editor-text font-mono p-6"
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleTextareaKeyDown}
          spellCheck={false}
        />

        {autocomplete.show && (
          <AutocompletePopup
            suggestions={autocomplete.suggestions}
            position={autocomplete.position}
            selectedIndex={autocomplete.selectedIndex}
            onSelect={insertSuggestion}
            onClose={hideAutocomplete}
          />
        )}

        <div
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-editor-success text-white'
              : 'bg-editor-error text-white animate-pulse'
          }`}
        >
          {isConnected ? '● Connected' : '● Disconnected'}
        </div>
      </main>
    </div>
  );
};

export default Editor;
