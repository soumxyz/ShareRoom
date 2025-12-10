import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, LogIn, Hash } from 'lucide-react';

interface RoomOptionsProps {
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  loading?: boolean;
}

export const RoomOptions = ({ onCreateRoom, onJoinRoom, loading }: RoomOptionsProps) => {
  const [mode, setMode] = useState<'choose' | 'join'>('choose');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    onJoinRoom(code);
  };

  if (mode === 'join') {
    return (
      <form onSubmit={handleJoin} className="w-full max-w-sm space-y-4 animate-fade-in">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-medium">
            Enter room code
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase().slice(0, 6));
                setError('');
              }}
              placeholder="ABCD12"
              className="pl-10 h-12 bg-secondary border-border font-mono text-lg tracking-widest uppercase focus:ring-2 focus:ring-primary"
              maxLength={6}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode('choose')}
            className="flex-1 h-12 border-border"
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={loading || roomCode.length !== 6}
          >
            {loading ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4 animate-fade-in">
      <Button
        onClick={onCreateRoom}
        disabled={loading}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg glow-primary transition-all"
      >
        <Plus className="mr-2 w-5 h-5" />
        {loading ? 'Creating...' : 'Create Room'}
      </Button>
      <Button
        onClick={() => setMode('join')}
        variant="outline"
        disabled={loading}
        className="w-full h-14 border-border hover:bg-secondary font-semibold text-lg"
      >
        <LogIn className="mr-2 w-5 h-5" />
        Join Room
      </Button>
    </div>
  );
};
