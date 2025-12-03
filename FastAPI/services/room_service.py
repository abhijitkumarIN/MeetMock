import uuid
from typing import Dict, Optional
from models import Room

class RoomService:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}
    
    def create_room(self) -> str:
        room_id = str(uuid.uuid4())[:8]
        self.rooms[room_id] = Room()
        return room_id
    
    def get_room(self, room_id: str) -> Optional[Room]:
        return self.rooms.get(room_id)
    
    def room_exists(self, room_id: str) -> bool:
        return room_id in self.rooms
    
    def update_room_code(self, room_id: str, code: str) -> bool:
        if room_id in self.rooms:
            self.rooms[room_id].code = code
            return True
        return False
    
    def add_user_to_room(self, room_id: str, user_id: str) -> bool:
        if room_id in self.rooms:
            if user_id not in self.rooms[room_id].users:
                self.rooms[room_id].users.append(user_id)
            return True
        return False
    
    def remove_user_from_room(self, room_id: str, user_id: str) -> bool:
        if room_id in self.rooms and user_id in self.rooms[room_id].users:
            self.rooms[room_id].users.remove(user_id)
            return True
        return False
    
    def get_room_users(self, room_id: str) -> list:
        if room_id in self.rooms:
            return self.rooms[room_id].users
        return []

# Global room service instance
room_service = RoomService()