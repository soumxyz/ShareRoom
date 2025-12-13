import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowRight } from 'lucide-react';

interface RoomCreatedProps {
  roomCode: string;
  onGoToRoom: () => void;
}

export const RoomCreated = ({ roomCode, onGoToRoom }: RoomCreatedProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
      <div className="space-y-2">
        <p className="text-sm text-mono-600">Room created successfully!</p>
        <div className="card-elevated p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-mono-500 uppercase tracking-wider">Room Code</p>
            <p className="text-4xl font-mono font-bold tracking-[0.3em] text-mono-800">
              {roomCode}
            </p>
          </div>
          
          <Button
            onClick={copyCode}
            variant="outline"
            className="w-full border-mono-300 bg-mono-100 hover:bg-mono-200 text-mono-800"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>
      </div>

      <Button
        onClick={onGoToRoom}
        className="w-full h-12 bg-mono-200 hover:bg-mono-300 text-mono-900 font-semibold border border-mono-300"
      >
        Go to Room
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};
