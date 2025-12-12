import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '@/components/shareroom/Logo';
import { UsernameForm } from '@/components/shareroom/UsernameForm';
import { RoomOptions } from '@/components/shareroom/RoomOptions';
import { RoomCreated } from '@/components/shareroom/RoomCreated';
import { supabase } from '@/integrations/supabase/client';
import { getFingerprint, generateRoomCode } from '@/lib/fingerprint';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Terminal } from 'lucide-react';

type Step = 'username' | 'options' | 'created';

const Index = () => {
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
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

      const { error } = await supabase.from('rooms').insert({
        code,
        name: `${username}'s Room`,
        host_fingerprint: fingerprint,
      });

      if (error) throw error;

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
    <div className="min-h-[100dvh] flex flex-col bg-mono-0 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-mono-300/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-mono-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0">
        <Logo size="md" />
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-mono-600 hover:text-mono-800 hover:bg-mono-200">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:pb-20">
        <div className="w-full max-w-md flex flex-col items-center gap-6 sm:gap-8">
          {/* Hero section */}
          {step === 'username' && (
            <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mono-200 border border-mono-300 text-mono-700 text-xs sm:text-sm mb-2 sm:mb-4">
                <Terminal className="w-4 h-4" />
                Anonymous · Temporary · Secure
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-mono-900">
                Share Code Instantly
              </h1>
              <p className="text-mono-500 text-base sm:text-lg max-w-sm mx-auto">
                Create temporary chat rooms to share code, text, and files in real-time. No signup required.
              </p>
            </div>
          )}

          {step === 'options' && (
            <div className="text-center animate-fade-in">
              <p className="text-mono-500 mb-2">Welcome,</p>
              <p className="text-xl sm:text-2xl font-bold text-mono-800 font-mono truncate max-w-[280px]">{username}</p>
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
            <button
              onClick={() => setStep('username')}
              className="text-sm text-mono-500 hover:text-mono-700 transition-colors"
            >
              ← Change username
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-4 text-xs text-mono-400 shrink-0">
        <p className="hidden sm:block">Press ESC twice to panic close</p>
      </footer>
    </div>
  );
};

export default Index;
