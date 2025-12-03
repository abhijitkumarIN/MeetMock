# Pair Programming App

A modern real-time collaborative code editor where you can code together with friends instantly. Just create a room, share the ID, and start coding!

## What it does

- **Real-time collaboration** - Multiple people can edit the same code simultaneously
- **Instant sync** - See changes as others type with WebSocket 
- **Smart autocomplete** - Get Python code suggestions based on context
- **Browser-based** - No downloads needed, works in any modern browser
- **User presence** - See who's currently coding with you
- **Room-based sessions** - Private rooms with shareable IDs

### Backend (FastAPI )
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Server runs on http://localhost:8000

### Frontend (Next.js + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
App available at http://localhost:3000

## How to use

1. **Enter your name** on the home page
2. **Create a new room** or **join existing room** with room ID
3. **Share the room ID** with friends
4. **Start coding together** - changes sync instantly!
5. **Use autocomplete** - suggestions appear as you type

## Tech Stack

**Backend:**
- FastAPI (Python web framework)
- WebSockets for real-time communication
- Pydantic for data validation
- Environment-based configuration

**Frontend:**
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Custom React hooks for WebSocket management
- Real-time autocomplete with debouncing

## Features

- **Structured codebase** with separated concerns
- **Custom hooks** for WebSocket and autocomplete logic
- **Type-safe** development with TypeScript
- **Modern UI** with Tailwind CSS and custom components
- **Environment configuration** for different deployments
- **Auto-reconnection** for WebSocket connections
- **Error handling** and validation throughout
