export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const API_ENDPOINTS = {
  ROOMS: `${API_BASE_URL}/rooms`,
  AUTOCOMPLETE: `${API_BASE_URL}/autocomplete`,
  WEBSOCKET: (roomId: string, userId: string) => `${WS_BASE_URL}/ws/${roomId}/${userId}`,
};