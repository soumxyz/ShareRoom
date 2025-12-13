import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, Lock, Unlock, Users, Moon, Sun, Shield } from 'lucide-react';
import { Logo } from './Logo';

interface RoomHeaderProps {
  roomCode: string;
  roomName: string;
  isLocked: boolean;
  isHost: boolean;
  participantCount: number;
  theme: 'dark' | 'light';
  onBack: () => void;
  onToggleLock: () => void;
  onToggleTheme: () => void;
}

export const RoomHeader = ({
  roomCode,
  roomName,
  isLocked,
  isHost,
  participantCount,
  theme,
  onBack,
  onToggleLock,
  onToggleTheme,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-mono-200 bg-mono-50">
      <div className="flex items-center justify-between px-4 md:px-5 h-12">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 icon-btn-md"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Logo size="sm" showText={false} />
          <div className="hidden sm:block ml-1">
            <h1 className="font-medium text-sm text-mono-800 leading-tight">{roomName}</h1>
            <div className="flex items-center gap-1.5 text-xs text-mono-500">
              <Users className="w-3 h-3" />
              <span>{participantCount} online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Room code */}
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-mono-100 hover:bg-mono-200 transition-colors border border-mono-200"
          >
            <span className="font-mono text-xs tracking-wider text-mono-700">{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-mono-500" />
            )}
          </button>

          {/* Host controls */}
          {isHost && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLock}
              className={`icon-btn-md ${isLocked ? 'text-warning hover:text-warning' : ''}`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
          )}

          {isHost && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-mono-100 text-mono-600 text-xs border border-mono-200">
              <Shield className="w-3 h-3" />
              Host
            </div>
          )}

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="icon-btn-md">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
