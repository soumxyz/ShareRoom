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
        dark: theme === 'dark' ? '#14b8a6' : '#0d9488',
        light: theme === 'dark' ? '#0d1117' : '#ffffff',
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
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" showText={false} />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-sm">{roomName}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{participantCount} online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Room code */}
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <span className="font-mono text-sm tracking-wider">{roomCode}</span>
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* QR button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQR(true)}
              className="hidden sm:flex"
            >
              <QrCode className="w-5 h-5" />
            </Button>

            {/* Host controls */}
            {isHost && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleLock}
                className={isLocked ? 'text-warning' : ''}
              >
                {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </Button>
            )}

            {isHost && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-accent/20 text-accent text-xs">
                <Shield className="w-3 h-3" />
                Host
              </div>
            )}

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={onToggleTheme}>
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
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="text-center">Share Room</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Room QR Code" className="rounded-lg" />
            )}
            <p className="font-mono text-2xl tracking-[0.3em] text-primary">
              {roomCode}
            </p>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(roomUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              variant="outline"
              className="w-full"
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
