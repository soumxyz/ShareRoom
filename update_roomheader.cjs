const fs = require('fs');

const content = `import { useState } from 'react';
import { ChevronLeft, Copy, Check, Lock, Unlock, Users, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoomHeaderProps {
  roomCode: string;
  roomName: string;
  isLocked: boolean;
  isHost: boolean;
  participantCount: number;
  participants: any[];
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
  onBack,
  onToggleLock,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontStyle = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' };

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 bg-[#FAFAFA]"
      style={{ 
        height: 'calc(84px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)'
      }}
    >
      {/* LEFT - Back Button */}
      <div className="flex-1 flex justify-start">
        <button
          onClick={onBack}
          className="w-[44px] h-[44px] rounded-full bg-[#F3F3F5] hover:bg-[#E5E5EA] flex items-center justify-center transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-black/10"
        >
          <ChevronLeft className="w-[24px] h-[24px] text-[#1D1D1F]" strokeWidth={2} />
        </button>
      </div>

      {/* CENTER - Room Info */}
      <div className="flex flex-col items-center justify-center pointer-events-none" style={fontStyle}>
        <h1 
          className="text-[#1D1D1F] text-[28px] font-semibold leading-tight" 
          style={{ letterSpacing: '-0.02em', fontWeight: 600 }}
        >
          {roomName}
        </h1>
        <div className="flex items-center gap-[6px] mt-[2px]">
          <div className="w-[8px] h-[8px] rounded-full bg-[#34C759]" />
          <span 
            className="text-[#6E6E73] text-[14px] leading-tight"
            style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
          >
            {participantCount} online
          </span>
        </div>
      </div>

      {/* RIGHT - Overflow Menu */}
      <div className="flex-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-[44px] h-[44px] rounded-full bg-[#F3F3F5] hover:bg-[#E5E5EA] flex items-center justify-center transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-black/10">
              <MoreHorizontal className="w-[24px] h-[24px] text-[#1D1D1F]" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={8}
            className="w-[280px] bg-white rounded-[20px] p-[8px] border-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            style={fontStyle}
          >
            {/* 1. Room Code */}
            <DropdownMenuItem 
              onClick={copyCode} 
              className="h-[56px] px-[16px] flex items-center justify-between rounded-[14px] cursor-pointer hover:bg-[#F3F3F5] focus:bg-[#F3F3F5] transition-colors duration-150 outline-none group"
            >
              <div className="flex items-center gap-[12px] text-[#1D1D1F]">
                {copied ? <Check className="w-[20px] h-[20px] text-[#34C759]" strokeWidth={2} /> : <Copy className="w-[20px] h-[20px] text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" strokeWidth={2} />}
                <span className="text-[17px] font-medium" style={{ letterSpacing: '-0.01em' }}>Room Code</span>
              </div>
              <span className="text-[17px] text-[#86868B] tracking-wide uppercase">{roomCode}</span>
            </DropdownMenuItem>
            
            {/* 2. Members */}
            <DropdownMenuItem 
              className="h-[56px] px-[16px] flex items-center justify-between rounded-[14px] cursor-default focus:bg-[#F3F3F5] transition-colors duration-150 outline-none group"
            >
              <div className="flex items-center gap-[12px] text-[#1D1D1F]">
                <Users className="w-[20px] h-[20px] text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" strokeWidth={2} />
                <span className="text-[17px] font-medium" style={{ letterSpacing: '-0.01em' }}>Members</span>
              </div>
              <span className="text-[17px] text-[#86868B]">{participantCount} online</span>
            </DropdownMenuItem>

            {/* 3. Host Controls */}
            {isHost && (
              <DropdownMenuItem 
                onClick={onToggleLock} 
                className="h-[56px] px-[16px] flex items-center justify-between rounded-[14px] cursor-pointer hover:bg-[#F3F3F5] focus:bg-[#F3F3F5] transition-colors duration-150 outline-none group mt-[4px]"
              >
                <div className="flex items-center gap-[12px] text-[#1D1D1F]">
                  {isLocked ? <Lock className="w-[20px] h-[20px] text-[#FF3B30]" strokeWidth={2} /> : <Unlock className="w-[20px] h-[20px] text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" strokeWidth={2} />}
                  <span className="text-[17px] font-medium" style={{ letterSpacing: '-0.01em' }}>Host Controls</span>
                </div>
                <ChevronRight className="w-[20px] h-[20px] text-[#C7C7CC]" strokeWidth={2} />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
`;

fs.writeFileSync('src/components/shareroom/RoomHeader.tsx', content);
