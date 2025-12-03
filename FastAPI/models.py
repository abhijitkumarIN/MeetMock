from pydantic import BaseModel
from typing import List, Optional

class Room(BaseModel):
    code: str = ""
    users: List[str] = []

class AutocompleteRequest(BaseModel):
    code: str
    cursor_position: int
    language: str = "python"

class AutocompleteResponse(BaseModel):
    suggestions: List[str]

class WebSocketMessage(BaseModel):
    type: str
    code: Optional[str] = None
    position: Optional[int] = None
    user_id: Optional[str] = None
    users: Optional[List[str]] = None

class RoomResponse(BaseModel):
    room_id: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None