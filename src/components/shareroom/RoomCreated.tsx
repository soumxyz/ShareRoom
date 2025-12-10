import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, QrCode, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';

interface RoomCreatedProps {
  roomCode: string;
  onGoToRoom: () => void;
}

export const RoomCreated = ({ roomCode, onGoToRoom }: RoomCreatedProps) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const roomUrl = `${window.location.origin}/join?code=${roomCode}`;

  useEffect(() => {
    QRCode.toDataURL(roomUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#14b8a6',
        light: '#0d1117',
      },
    }).then(setQrDataUrl);
  }, [roomUrl]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Room created successfully!</p>
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Room Code</p>
            <p className="text-4xl font-mono font-bold tracking-[0.3em] text-primary">
              {roomCode}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={copyCode}
              variant="outline"
              className="flex-1 border-border"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="border-border"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          {showQR && qrDataUrl && (
            <div className="pt-4 animate-scale-in">
              <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-lg" />
              <Button
                onClick={copyLink}
                variant="ghost"
                size="sm"
                className="mt-2 text-muted-foreground"
              >
                <Copy className="w-3 h-3 mr-2" />
                Copy Link
              </Button>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onGoToRoom}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-primary"
      >
        Go to Room
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};
