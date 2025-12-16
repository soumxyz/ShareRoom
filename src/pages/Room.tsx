import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/hooks/useRoom';
import { usePanicClose } from '@/hooks/usePanicClose';
import { useTheme } from '@/hooks/useTheme';
import { RoomHeader } from '@/components/shareroom/RoomHeader';
import { MessageBubble } from '@/components/shareroom/MessageBubble';
import { ChatInput } from '@/components/shareroom/ChatInput';
import { FakeScreen } from '@/components/shareroom/FakeScreen';
import { ParticipantsList } from '@/components/shareroom/ParticipantsList';
import { Loader2, AlertCircle, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getFingerprint } from '@/lib/fingerprint';

const Room = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const username = searchParams.get('username');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string; content: string } | null>(null);
  const [fakeMode, setFakeMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);

  const {
    room,
    messages,
    participants,
    participant,
    isHost,
    loading,
    error,
    sendMessage,
    sendFile,
    toggleLock,
    deleteMessage,
    muteUser,
    kickUser,
    leaveRoom,
  } = useRoom(code || null, username);

  // Panic close handler
  usePanicClose(async () => {
    await leaveRoom();
  });

  // Room access guard - check username and ban status
  useEffect(() => {
    const checkAccess = async () => {
      // If no username, redirect to home with code
      if (!username) {
        navigate(`/?code=${code}`, { replace: true });
        return;
      }

      // Get fingerprint
      const fingerprint = await getFingerprint();
      if (!fingerprint) {
        navigate('/', { replace: true });
        return;
      }

      // Check if room exists
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code?.toUpperCase() || '')
        .maybeSingle();

      if (!roomData) {
        navigate('/', { replace: true });
        return;
      }

      // Check if user is banned from this room
      const { data: banData } = await supabase
        .from('banned_fingerprints')
        .select('id')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

      if (banData) {
        navigate('/', { replace: true });
        return;
      }

      setAccessChecked(true);
    };

    checkAccess();
  }, [code, username, navigate]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 150; // More generous threshold
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  }, []);

  // Auto scroll to bottom only when user is at bottom
  useEffect(() => {
    if (isAtBottom && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isAtBottom]);

  const handleSend = async (content: string) => {
    await sendMessage(content, replyTo?.id);
    setReplyTo(null);
    // Scroll to bottom after sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBack = async () => {
    await leaveRoom();
    navigate('/', { replace: true });
  };

  const scrollToMessage = useCallback((id: string) => {
    const element = document.getElementById(`message-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-primary/10');
      setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
    }
  }, []);

  // Fake mode
  if (fakeMode) {
    return (
      <div onClick={() => setFakeMode(false)} className="cursor-pointer">
        <FakeScreen />
      </div>
    );
  }

  // Loading state - also wait for access check
  if (loading || !accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mono-0">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-mono-600 mx-auto" />
          <p className="text-mono-500 text-sm">Connecting to room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mono-0 px-4">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold text-mono-800">{error}</h2>
          <p className="text-mono-500 text-sm">
            The room may have been deleted or you may have been banned.
          </p>
          <Button onClick={() => navigate('/', { replace: true })} variant="outline" className="border-mono-300 bg-mono-100 hover:bg-mono-200 text-mono-800">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="h-[100dvh] flex flex-col bg-mono-0 overflow-hidden">
      {/* Header */}
      <RoomHeader
        roomCode={room.code}
        roomName={room.name}
        isLocked={room.is_locked}
        isHost={isHost}
        participantCount={participants.length}
        theme={theme}
        onBack={handleBack}
        onToggleLock={toggleLock}
        onToggleTheme={toggleTheme}
      />

      {/* Main content area with max-width */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="border-b border-mono-300 bg-mono-50 shrink-0">
          <div className="max-w-[780px] mx-auto w-full px-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <ParticipantsList
                  participants={participants}
                  currentUserId={participant?.id || null}
                  hostFingerprint={room.host_fingerprint}
                  isHost={isHost}
                  onMuteUser={muteUser}
                  onKickUser={(id) => kickUser(id, true)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFakeMode(true)}
                className="text-mono-500 hover:text-mono-800 hover:bg-mono-200 h-8 px-2 sm:px-3 text-xs"
              >
                <EyeOff className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Fake Screen</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        >
          <div className="max-w-[780px] mx-auto w-full px-4 py-4 sm:py-6">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 sm:py-16 text-mono-500">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}

              {messages.map((message) => {
                const replyMessage = message.reply_to_id
                  ? messages.find((m) => m.id === message.reply_to_id)
                  : null;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.participant_id === participant?.id}
                    isHost={isHost}
                    replyMessage={replyMessage}
                    onReply={() =>
                      setReplyTo({
                        id: message.id,
                        username: message.username,
                        content: message.content || '',
                      })
                    }
                    onDelete={isHost || message.participant_id === participant?.id ? () => deleteMessage(message.id) : undefined}
                    onMuteUser={message.participant_id ? () => muteUser(message.participant_id!) : undefined}
                    onKickUser={message.participant_id ? () => kickUser(message.participant_id!, true) : undefined}
                    onScrollToMessage={scrollToMessage}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </div>

        {/* Input - fixed at bottom */}
        <div className="border-t border-mono-300 bg-mono-50 shrink-0">
          <div className="max-w-[780px] mx-auto w-full px-4">
            <ChatInput
              onSend={handleSend}
              onFileUpload={sendFile}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              disabled={participant?.is_muted}
            />
          </div>
        </div>
      </div>

      {/* Panic hint - hidden on mobile */}
      <div className="hidden sm:block absolute bottom-24 left-4 text-xs text-mono-400/40">
        ESC×2 to panic close
      </div>
    </div>
  );
};

export default Room;
