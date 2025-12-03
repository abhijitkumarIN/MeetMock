'use client'
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ userName?: string; roomId?: string }>({});
  const router = useRouter()

  const validateForm = (checkRoomId = false): boolean => {
    const newErrors: { userName?: string; roomId?: string } = {};
    
    if (!userName.trim()) {
      newErrors.userName = 'Please enter your name';
    }
    
    if (checkRoomId && !roomId.trim()) {
      newErrors.roomId = 'Please enter a room ID';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createRoom = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ROOMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      localStorage.setItem('userName', userName.trim());
      router.push(`/room/${data.room_id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = (): void => {
    if (!validateForm(true)) return;

    localStorage.setItem('userName', userName.trim());
    router.push(`/room/${roomId.trim()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void): void => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-editor-bg p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-editor-accent to-blue-400 bg-clip-text text-transparent">
              Pair Programming
            </CardTitle>
            <CardDescription className="text-lg">
              Code together in real-time
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Input
              label="Your Name"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errors.userName) setErrors(prev => ({ ...prev, userName: undefined }));
              }}
              onKeyPress={(e) => handleKeyPress(e, createRoom)}
              error={errors.userName}
              disabled={isLoading}
            />

            <Button 
              onClick={createRoom} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Creating Room...' : 'Create New Room'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-editor-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-editor-secondary px-2 text-gray-400">or</span>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Room ID"
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  if (errors.roomId) setErrors(prev => ({ ...prev, roomId: undefined }));
                }}
                onKeyPress={(e) => handleKeyPress(e, joinRoom)}
                error={errors.roomId}
                disabled={isLoading}
              />
              
              <Button 
                onClick={joinRoom} 
                variant="secondary"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;