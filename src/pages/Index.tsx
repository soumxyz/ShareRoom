import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '@/components/shareroom/Logo';
import { UsernameForm } from '@/components/shareroom/UsernameForm';
import { RoomOptions } from '@/components/shareroom/RoomOptions';
import { RoomCreated } from '@/components/shareroom/RoomCreated';
import { SplineBackground } from '@/components/shareroom/SplineBackground';
import { getFingerprint, generateRoomCode } from '@/lib/fingerprint';
import { localDB } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { FlipWordsDemo } from '@/components/ui/flip-words-demo';
import { Typewriter } from '@/components/ui/typewriter';


type Step = 'username' | 'options' | 'created';

const Index = () => {
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // Handle page load
  useEffect(() => {
    let mounted = true;
    
    const checkLoaded = () => {
      if (!mounted) return;
      
      if (document.readyState === 'complete') {
        setTimeout(() => {
          if (mounted) setIsPageLoaded(true);
        }, 1500);
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    
    checkLoaded();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    localStorage.setItem('shareroom_username', name);
    
    // If we have a join code from deep link, go directly to room
    if (joinCode) {
      navigate(`/room/${joinCode}?username=${encodeURIComponent(name)}`);
    } else {
      setStep('options');
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const fingerprint = await getFingerprint();
      const code = generateRoomCode();

      localDB.createRoom({
        code,
        name: `${username}'s Room`,
        host_fingerprint: fingerprint,
      });

      setRoomCode(code);
      setStep('created');
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (code: string) => {
    navigate(`/room/${code}?username=${encodeURIComponent(username)}`);
  };

  const handleGoToRoom = () => {
    navigate(`/room/${roomCode}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-neutral-900 to-neutral-700 relative overflow-hidden">
      {/* Spline 3D Background */}
      <SplineBackground />
      
      <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <Logo size="md" />
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 min-h-0">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg flex flex-col items-center gap-6 sm:gap-8">
          {/* Hero section */}
          {step === 'username' && (
            <div className="text-center space-y-6 sm:space-y-6 animate-fade-in w-full px-4 sm:px-0">
              <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-mono-900 leading-tight px-0 sm:px-2">
                                <span className="block sm:hidden text-center px-2 overflow-hidden"><Typewriter text="Share code and files instantly." speed={150} /></span>
                <span className="hidden sm:block"><FlipWordsDemo /></span>
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg max-w-md mx-auto px-0 sm:px-4 leading-relaxed whitespace-nowrap">
                Create temporary chat rooms. No signup required.
              </p>
            </div>
          )}

          {step === 'options' && (
            <div className="text-center animate-fade-in w-full">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white/90 font-mono truncate whitespace-nowrap overflow-hidden">
                <span className="text-white font-normal">Welcome, </span><Typewriter text={username} className="font-bold" speed={150} />
              </p>
            </div>
          )}

          {/* Step content */}
          {step === 'username' && (
            <UsernameForm onSubmit={handleUsernameSubmit} initialValue={username} />
          )}

          {step === 'options' && (
            <RoomOptions
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              loading={loading}
            />
          )}

          {step === 'created' && (
            <RoomCreated roomCode={roomCode} onGoToRoom={handleGoToRoom} />
          )}

          {/* Back button */}
          {step === 'options' && (
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg smooth-transition">
              <button
                onClick={() => setStep('username')}
                className="h-7 w-7 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-4 text-xs text-mono-400 shrink-0">
        <p className="hidden sm:block">Press ESC twice to panic close</p>
      </footer>
      </div>
    </div>
  );
};

export default Index;
