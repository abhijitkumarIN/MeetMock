import json
import logging
from typing import Dict, List
from fastapi import WebSocket
from services.room_service import room_service

logger = logging.getLogger(__name__)

class ConnectionManager:
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_id: str) -> bool:
        try:
            await websocket.accept()
            
            # Initialize room connections if not exists
            if room_id not in self.active_connections:
                self.active_connections[room_id] = []
            
            # Add connection to room
            self.active_connections[room_id].append(websocket)
            self.user_connections[user_id] = websocket
            
            # Add user to room service
            room_service.add_user_to_room(room_id, user_id)
            
            logger.info(f"User {user_id} connected to room {room_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error connecting user {user_id} to room {room_id}: {e}")
            return False
    
    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        try:
            # Remove from room connections
            if room_id in self.active_connections:
                if websocket in self.active_connections[room_id]:
                    self.active_connections[room_id].remove(websocket)
                
                # Clean up empty room connections
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
            
            # Remove user connection mapping
            if user_id in self.user_connections:
                del self.user_connections[user_id]
            
            # Remove user from room service
            room_service.remove_user_from_room(room_id, user_id)
            
            logger.info(f"User {user_id} disconnected from room {room_id}")
            
        except Exception as e:
            logger.error(f"Error disconnecting user {user_id} from room {room_id}: {e}")
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        if room_id not in self.active_connections:
            return
        
        message_str = json.dumps(message)
        disconnected_connections = []
        
        for connection in self.active_connections[room_id]:
            # Skip excluded user
            if exclude_user and self.user_connections.get(exclude_user) == connection:
                continue
            
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.warning(f"Failed to send message to connection: {e}")
                disconnected_connections.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected_connections:
            if connection in self.active_connections[room_id]:
                self.active_connections[room_id].remove(connection)
    
    async def send_to_user(self, user_id: str, message: dict) -> bool:
        if user_id not in self.user_connections:
            return False
        
        try:
            await self.user_connections[user_id].send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to send message to user {user_id}: {e}")
            return False
    
    def get_room_connection_count(self, room_id: str) -> int:
        return len(self.active_connections.get(room_id, []))
    
    def is_user_connected(self, user_id: str) -> bool:
        return user_id in self.user_connections

# Global connection manager instance
connection_manager = ConnectionManager()