export interface AutocompleteState {
  show: boolean;
  suggestions: string[];
  position: { x: number; y: number };
  selectedIndex: number;
}

export interface WebSocketMessage {
  type: 'sync' | 'code_change' | 'cursor_position' | 'user_joined' | 'user_left';
  code?: string;
  users?: string[];
  user_id?: string;
  position?: number;
}

export interface Room {
  code: string;
  users: string[];
}

export interface AutocompleteRequest {
  code: string;
  cursor_position: number;
  language?: string;
}

export interface AutocompleteResponse {
  suggestions: string[];
}