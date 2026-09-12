import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UsernameForm } from '@/components/shareroom/UsernameForm';
import { RoomOptions } from '@/components/shareroom/RoomOptions';
import { getFingerprint, generateRoomCode } from '@/lib/fingerprint';

import { FlipWordsDemo } from '@/components/ui/flip-words-demo';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';


type Step = 'username' | 'options';
type OptionsMode = 'choose' | 'join' | 'created';

const Index = () => {
  const [step, setStep] = useState<Step>('username');
  const [optionsMode, setOptionsMode] = useState<OptionsMode>('choose');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for deep link
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setJoinCode(code.toUpperCase());
    }
  }, [searchParams]);

  // Load saved username
  useEffect(() => {
    const saved = localStorage.getItem('shareroom_username');
    if (saved) {
      setUsername(saved);
    }
  }, []);

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    localStorage.setItem('shareroom_username', name);

    // If we have a join code from deep link, go directly to room
    if (joinCode) {
      router.push(`/room/${joinCode}?username=${encodeURIComponent(name)}`);
    } else {
      setStep('options');
      setOptionsMode('choose');
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const fingerprint = await getFingerprint();
      const code = generateRoomCode();
      
      const { data: newRoom, error } = await supabase
        .from('rooms')
        .insert({
          code,
          name: `${username}'s Room`,
          host_fingerprint: fingerprint,
        })
        .select()
        .single();

      if (error) throw error;

      setRoomCode(newRoom.code);
      setOptionsMode('created');
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (code: string) => {
    router.push(`/room/${code}?username=${encodeURIComponent(username)}`);
  };

  const handleGoToRoom = () => {
    router.push(`/room/${roomCode}?username=${encodeURIComponent(username)}`);
  };

  const handleBack = () => {
    if (step === 'options') {
      if (optionsMode === 'join' || optionsMode === 'created') {
        setOptionsMode('choose');
        setRoomCode('');
      } else {
        setStep('username');
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden bg-cover bg-center bg-no-repeat flex flex-col justify-between"
      style={{ backgroundImage: "url('/bg-image.png')" }}
    >
      {/* Top Bar: Back Button when not on initial step */}
      <header className="relative z-20 w-full flex items-center justify-between px-8 sm:px-12 lg:px-16 pt-8 sm:pt-10 shrink-0 min-h-[64px]">
        {step !== 'username' ? (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center gap-2 text-[#0c1524] hover:text-[#475467] active:scale-95 transition-all cursor-pointer font-sans font-medium text-sm sm:text-base group select-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f7f5ef] hover:bg-[#eeebe3] flex items-center justify-center shadow-sm transition-all group-hover:-translate-x-0.5">
              <ArrowLeft className="w-4 h-4 text-[#0c1524]" strokeWidth="2.2" />
            </div>
            <span className=" font-medium text-[#0c1524]">Back</span>
          </button>
        ) : (
          <div />
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 sm:pt-10 pb-16 min-h-0">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <LayoutGroup id="room-selection-flow">
            {step === 'username' ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="step-username"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex flex-col items-center"
                >
                  {/* H1 Heading - Scaled down nicely for desktop */}
                  <h1
                    className="font-sans font-medium text-center tracking-[-0.06em] flex flex-col items-center select-none"
                    style={{
                      fontSize: 'clamp(36px, 4.4vw, 64px)',
                      lineHeight: '1.04',
                      letterSpacing: '-0.06em',
                    }}
                  >
                    <span className="text-[#0c1524] block">
                      <FlipWordsDemo />
                    </span>
                    <span className="text-[#667085] block font-normal sm:font-medium">
                      and anonymously
                    </span>
                  </h1>

                  {/* Gap to Body */}
                  <p
                    className="mt-5 sm:mt-6 font-sans font-normal text-[#475467] text-center max-w-[480px] mx-auto leading-relaxed px-2"
                    style={{
                      fontSize: 'clamp(14px, 1.2vw, 17px)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Create temporary chat rooms for sharing files, images, code snippets, and documents. No signup required.
                  </p>

                  {/* Gap to Input */}
                  <div className="mt-8 sm:mt-9 w-full flex justify-center px-2">
                    <UsernameForm onSubmit={handleUsernameSubmit} initialValue={username} />
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                key="step-options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center text-center"
              >
                <div className="select-none">
                  <p className="font-sans font-normal text-[#667085] text-base sm:text-lg tracking-[-0.01em]">
                    Good to see you,
                  </p>
                  <h2
                    className="mt-1 font-sans font-medium text-[#0c1524] tracking-[-0.05em] leading-tight"
                    style={{
                      fontSize: 'clamp(40px, 5.2vw, 68px)',
                    }}
                  >
                    {username}
                  </h2>
                  <p className="mt-2 font-sans font-normal text-[#667085] text-sm sm:text-base tracking-[-0.01em]">
                    What would you like to do today?
                  </p>
                </div>

                {/* Buttons Row / In-Place Morphed Pill Bar */}
                <div className="mt-8 sm:mt-10 w-full flex justify-center">
                  <RoomOptions
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    onGoToRoom={handleGoToRoom}
                    mode={optionsMode}
                    setMode={setOptionsMode}
                    createdRoomCode={roomCode}
                    loading={loading}
                  />
                </div>
              </motion.div>
            )}
          </LayoutGroup>
        </div>
      </main>

      {/* Bottom spacer to keep main centered without moving anything */}
      <footer className="relative z-20 w-full shrink-0 min-h-[64px] pb-8 sm:pb-10 px-8 sm:px-12 lg:px-16 pointer-events-none" />
    </div>
  );
};

export default Index;
