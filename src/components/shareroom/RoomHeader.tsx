import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, QrCode, Lock, Unlock, Users, Moon, Sun, Shield } from 'lucide-react';
import { Logo } from './Logo';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const roomUrl = `${window.location.origin}/join?code=${roomCode}`;

  useEffect(() => {
    QRCode.toDataURL(roomUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: theme === 'dark' ? '#d4d4d4' : '#1a1a1a',
        light: theme === 'dark' ? '#0d0d0d' : '#ffffff',
      },
    }).then(setQrDataUrl);
  }, [roomUrl, theme]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-mono-300 bg-mono-100/95 backdrop-blur supports-[backdrop-filter]:bg-mono-100/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 text-mono-600 hover:text-mono-800 hover:bg-mono-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" showText={false} />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-sm text-mono-800">{roomName}</h1>
              <div className="flex items-center gap-2 text-xs text-mono-500">
                <Users className="w-3 h-3" />
                <span>{participantCount} online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Room code */}
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mono-200 hover:bg-mono-300 transition-colors border border-mono-300"
            >
              <span className="font-mono text-sm tracking-wider text-mono-800">{roomCode}</span>
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-mono-500" />
              )}
            </button>

            {/* QR button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQR(true)}
              className="hidden sm:flex text-mono-600 hover:text-mono-800 hover:bg-mono-200"
            >
              <QrCode className="w-5 h-5" />
            </Button>

            {/* Host controls */}
            {isHost && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleLock}
                className={`${isLocked ? 'text-warning' : 'text-mono-600'} hover:bg-mono-200`}
              >
                {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </Button>
            )}

            {isHost && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-mono-200 text-mono-600 text-xs border border-mono-300">
                <Shield className="w-3 h-3" />
                Host
              </div>
            )}

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={onToggleTheme} className="text-mono-600 hover:text-mono-800 hover:bg-mono-200">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-[320px] bg-mono-100 border-mono-300">
          <DialogHeader>
            <DialogTitle className="text-center text-mono-800">Share Room</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Room QR Code" className="rounded-lg" />
            )}
            <p className="font-mono text-2xl tracking-[0.3em] text-mono-800">
              {roomCode}
            </p>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(roomUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              variant="outline"
              className="w-full border-mono-300 bg-mono-100 hover:bg-mono-200 text-mono-800"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
