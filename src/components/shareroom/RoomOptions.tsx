import { useState, useRef, useEffect } from 'react';
import { Plus, LogIn, ArrowRight, ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface RoomOptionsProps {
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (code: string) => void;
  onGoToRoom: () => void;
  mode: 'choose' | 'join' | 'created';
  setMode: (mode: 'choose' | 'join' | 'created') => void;
  createdRoomCode?: string;
  loading?: boolean;
}

export const RoomOptions = ({
  onCreateRoom,
  onJoinRoom,
  onGoToRoom,
  mode,
  setMode,
  createdRoomCode,
  loading,
}: RoomOptionsProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'join') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [mode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setJoining(true);
    setError('');
    try {
      const { data: room, error: fetchError } = await supabase
        .from('rooms')
        .select('id, is_locked')
        .eq('code', code)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!room) {
        setError('Room not found. Please check the code.');
        setJoining(false);
        return;
      }
      if (room.is_locked) {
        setError('This room is locked.');
        setJoining(false);
        return;
      }
      onJoinRoom(code);
    } catch (err) {
      setError('Failed to join room. Please try again.');
      setJoining(false);
    }
  };

  const copyCode = async () => {
    if (!createdRoomCode) return;
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        {mode === 'created' ? (
          /* Created State: Morphed in-place into identical horizontal pill bar */
          <motion.div
            key="created-mode"
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="w-full max-w-[340px] sm:max-w-[440px] flex flex-col items-center relative"
          >
            <div className="w-full h-[56px] sm:h-[60px] pl-6 pr-2 sm:pl-7 sm:pr-2.5 bg-white/95 hover:bg-white border border-[#dfdbce] rounded-full shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] transition-all duration-200 flex items-center justify-between gap-2 select-none">
              {/* Room Code Display + Copy */}
              <div
                onClick={copyCode}
                className="flex-1 flex items-center justify-center gap-2.5 cursor-pointer group pl-2 sm:pl-3"
                title="Click to copy"
              >
                <span className="font-mono font-semibold text-base sm:text-lg text-[#0c1524] tracking-[0.2em] sm:tracking-[0.25em]">
                  {createdRoomCode}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#f4f1ea] group-hover:bg-[#eae5db] flex items-center justify-center text-[#667085] group-hover:text-[#0c1524] transition-all shrink-0 shadow-2xs">
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#2d4722]" strokeWidth="2.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" strokeWidth="2" />
                  )}
                </div>
              </div>

              {/* Submit / Go to Room Arrow Button */}
              <button
                onClick={onGoToRoom}
                type="button"
                aria-label="Go to Room"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#556045] hover:bg-[#475139] active:scale-95 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer shrink-0"
              >
                <ArrowRight className="w-4 h-4 text-white" strokeWidth="2.4" />
              </button>
            </div>
          </motion.div>
        ) : mode === 'choose' ? (
          <motion.div
            key="choose-mode"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 w-full sm:w-auto"
          >
            {/* Create Room Button with Morph Layout ID */}
            <motion.button
              layoutId="room-morph-card"
              layout
              onClick={onCreateRoom}
              disabled={loading}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="w-full sm:w-[210px] md:w-[220px] h-[56px] sm:h-[60px] px-6 bg-[#556045] hover:bg-[#475139] active:scale-[0.98] text-white rounded-full shadow-[0_16px_36px_-8px_rgba(85,96,69,0.35)] transition-colors duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-90 select-none group shrink-0"
            >
              {loading && <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />}
              <span className="font-sans font-medium text-[15px] sm:text-[16px] text-white tracking-[-0.01em]">
                {loading ? 'Creating...' : 'Create Room'}
              </span>
              <ArrowRight className={`w-4 h-4 text-white/80 transition-all shrink-0 ${loading ? 'opacity-0' : 'group-hover:translate-x-0.5 group-hover:text-white'}`} strokeWidth="2.2" />
            </motion.button>

            {/* Join Room Button */}
            <motion.button
              layout
              onClick={() => {
                setMode('join');
                setError('');
              }}
              disabled={loading}
              className="w-full sm:w-[210px] md:w-[220px] h-[56px] sm:h-[60px] px-6 bg-white/95 hover:bg-white active:scale-[0.98] text-[#0c1524] border border-[#dfdbce] hover:border-[#cfc9ba] rounded-full shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 select-none group shrink-0"
            >
              <span className="font-sans font-medium text-[15px] sm:text-[16px] text-[#0c1524] tracking-[-0.01em]">
                Join Room
              </span>
              <ArrowRight className="w-4 h-4 text-[#0c1524]/80 group-hover:translate-x-0.5 group-hover:text-[#0c1524] transition-all shrink-0" strokeWidth="2.2" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="join-mode"
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="w-full max-w-[340px] sm:max-w-[440px] flex flex-col items-center relative"
          >
            <form
              onSubmit={handleJoin}
              className="w-full h-[56px] sm:h-[60px] pl-5 pr-2 sm:pl-6 sm:pr-2.5 bg-white/95 hover:bg-white focus-within:bg-white border border-[#dfdbce] focus-within:border-[#556045]/50 rounded-full shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] transition-all duration-200 flex items-center gap-2 select-none"
            >
              {/* Input for Room Code */}
              <input
                ref={inputRef}
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase().slice(0, 6));
                  setError('');
                }}
                placeholder="Room code goes here"
                maxLength={6}
                className="flex-1 min-w-0 bg-transparent border-none text-[#0c1524] placeholder:text-[#9ca3af] font-mono font-medium text-base sm:text-lg tracking-[0.15em] sm:tracking-[0.2em] uppercase focus:outline-none px-1 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
              />

              {/* Submit Arrow Button */}
              <button
                type="submit"
                disabled={loading || joining || roomCode.trim().length !== 6}
                aria-label="Submit room code"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#556045] hover:bg-[#475139] disabled:opacity-35 disabled:hover:bg-[#556045] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {joining ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth="2.4" />
                )}
              </button>
            </form>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute -bottom-6 text-xs sm:text-sm text-red-500 font-medium tracking-tight whitespace-nowrap"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};