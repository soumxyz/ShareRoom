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
        dark: '#d4d4d4',
        light: '#0d0d0d',
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
        <p className="text-sm text-mono-600">Room created successfully!</p>
        <div className="bg-mono-100 border border-mono-300 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-mono-500 uppercase tracking-wider">Room Code</p>
            <p className="text-4xl font-mono font-bold tracking-[0.3em] text-mono-800">
              {roomCode}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={copyCode}
              variant="outline"
              className="flex-1 border-mono-300 bg-mono-100 hover:bg-mono-200 text-mono-800"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="border-mono-300 bg-mono-100 hover:bg-mono-200 text-mono-800"
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
                className="mt-2 text-mono-500 hover:text-mono-700"
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
        className="w-full h-12 bg-mono-200 hover:bg-mono-300 text-mono-900 font-semibold border border-mono-300"
      >
        Go to Room
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};
