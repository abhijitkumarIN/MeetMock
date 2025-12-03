import json
import logging
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from models import AutocompleteRequest, AutocompleteResponse, RoomResponse, ErrorResponse
from services.room_service import room_service
from services.autocomplete_service import autocomplete_service
from websocket.connection_manager import connection_manager

logger = logging.getLogger(__name__)

# Create API router
router = APIRouter()


@router.post("/rooms", response_model=RoomResponse, tags=["rooms"])
async def create_room():
    try:
        room_id = room_service.create_room()
        logger.info(f"Created new room: {room_id}")
        return RoomResponse(room_id=room_id)
    except Exception as e:
        logger.error(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail="Failed to create room")

@router.get("/rooms/{room_id}", tags=["rooms"])
async def get_room(room_id: str):
    room = room_service.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {
        "room_id": room_id,
        "code": room.code,
        "users": room.users,
        "active_connections": connection_manager.get_room_connection_count(room_id)
    }

@router.post("/autocomplete", response_model=AutocompleteResponse, tags=["autocomplete"])
async def get_autocomplete(request: AutocompleteRequest):
    try:
        response = autocomplete_service.get_suggestions(request)
        return response
    except Exception as e:
        logger.error(f"Error generating autocomplete suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")

@router.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    # Validate room exists or create it
    if not room_service.room_exists(room_id):
        # Create room with the specific room_id
        from models import Room
        room_service.rooms[room_id] = Room()
    
    # Connect user to room
    connected = await connection_manager.connect(websocket, room_id, user_id)
    if not connected:
        await websocket.close(code=1011, reason="Connection failed")
        return
    
    # Send current room state to new user
    try:
        room = room_service.get_room(room_id)
        if room:
            sync_message = {
                "type": "sync",
                "code": room.code,
                "users": room.users
            }
            await websocket.send_text(json.dumps(sync_message))
            
            # Notify other users about new user
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": "user_joined",
                    "user_id": user_id,
                    "users": room.users
                },
                exclude_user=user_id
            )
    
    except Exception as e:
        logger.error(f"Error sending sync message: {e}")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            await handle_websocket_message(message, room_id, user_id)
            
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected from room {room_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id} in room {room_id}: {e}")
    finally:
        # Clean up connection
        connection_manager.disconnect(websocket, room_id, user_id)
        
        # Notify other users about user leaving
        await connection_manager.broadcast_to_room(
            room_id,
            {
                "type": "user_left",
                "user_id": user_id,
                "users": room_service.get_room_users(room_id)
            }
        )

async def handle_websocket_message(message: dict, room_id: str, user_id: str):
    message_type = message.get("type")
    
    try:
        if message_type == "code_change":
            # Update room code
            code = message.get("code", "")
            room_service.update_room_code(room_id, code)
            
            # Broadcast to other users in room
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": "code_change",
                    "code": code,
                    "user_id": user_id
                },
                exclude_user=user_id
            )
            
        elif message_type == "cursor_position":
            # Broadcast cursor position to other users
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": "cursor_position",
                    "position": message.get("position"),
                    "user_id": user_id
                },
                exclude_user=user_id
            )
            
        elif message_type == "user_typing":
            # Broadcast typing indicator
            await connection_manager.broadcast_to_room(
                room_id,
                {
                    "type": "user_typing",
                    "user_id": user_id,
                    "is_typing": message.get("is_typing", False)
                },
                exclude_user=user_id
            )
            
        else:
            logger.warning(f"Unknown message type: {message_type}")
            
    except Exception as e:
        logger.error(f"Error handling message type {message_type}: {e}")