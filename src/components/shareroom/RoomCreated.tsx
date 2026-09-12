import { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomCreatedProps {
  roomCode: string;
  onGoToRoom: () => void;
}

export const RoomCreated = ({ roomCode, onGoToRoom }: RoomCreatedProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const codeChars = roomCode ? roomCode.split('') : ['G', 'U', 'R', 'R', '2', 'Z'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto flex flex-col items-center text-center select-none"
    >
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="font-sans font-medium text-[#0c1524] tracking-[-0.04em] leading-tight text-3xl sm:text-4xl md:text-[50px] mb-8 sm:mb-10"
      >
        Your room is ready
      </motion.h2>

      {/* Code Tiles + Copy Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          {/* 6 Segmented Character Boxes */}
          {codeChars.map((char, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={copyCode}
              className="w-10 h-13 sm:w-13 sm:h-16 md:w-[58px] md:h-[66px] rounded-2xl bg-[#faf8f3]/95 border border-[#ede9dd] shadow-[0_4px_14px_rgba(0,0,0,0.03)] flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-sans font-semibold text-[#0c1524] cursor-pointer transition-colors hover:bg-white"
            >
              {char}
            </motion.div>
          ))}

          {/* Copy Button */}
          <div className="ml-1 sm:ml-1.5">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
              type="button"
              aria-label="Copy Room Code"
              className="w-10 h-13 sm:w-13 sm:h-16 md:w-[58px] md:h-[66px] rounded-2xl bg-[#f4f1ea]/90 hover:bg-white border border-[#eae5d8] shadow-[0_4px_14px_rgba(0,0,0,0.03)] flex items-center justify-center cursor-pointer transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-[#2d4722]" strokeWidth="2.5" />
              ) : (
                <Copy className="w-5 h-5 text-[#374151]" strokeWidth="1.9" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Go to Room Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.3 }}
        className="mt-8 sm:mt-9 w-full flex justify-center"
      >
        <button
          onClick={onGoToRoom}
          type="button"
          className="w-full max-w-[280px] sm:max-w-[320px] h-[52px] sm:h-[56px] px-7 bg-[#48533c] hover:bg-[#3d4733] active:scale-[0.98] text-white font-sans font-medium text-sm sm:text-base rounded-full shadow-[0_14px_32px_-6px_rgba(65,75,54,0.36)] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
        >
          <span className="tracking-[-0.01em]">Go to Room</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 group-hover:translate-x-1 transition-transform" strokeWidth="2.2" />
        </button>
      </motion.div>
    </motion.div>
  );
};
