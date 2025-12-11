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
import { Loader2, AlertCircle, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Room = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const username = searchParams.get('username');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string; content: string } | null>(null);
  const [fakeMode, setFakeMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Redirect if no username
  useEffect(() => {
    if (!username) {
      navigate(`/?code=${code}`);
    }
  }, [username, code, navigate]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    await sendMessage(content, replyTo?.id);
    setReplyTo(null);
  };

  const handleBack = async () => {
    await leaveRoom();
    navigate('/');
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mono-0">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-mono-600 mx-auto" />
          <p className="text-mono-500">Connecting to room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mono-0">
        <div className="text-center space-y-4 max-w-sm px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-mono-800">{error}</h2>
          <p className="text-mono-500">
            The room may have been deleted or you may have been banned.
          </p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-mono-300 bg-mono-100 hover:bg-mono-200 text-mono-800">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="h-screen flex flex-col bg-mono-0">
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

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-mono-300 bg-mono-100/50">
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
          className="text-mono-500 hover:text-mono-800 hover:bg-mono-200"
        >
          {fakeMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          Fake Screen
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-mono-500">
            <p>No messages yet. Start the conversation!</p>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onFileUpload={sendFile}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        disabled={participant?.is_muted}
      />

      {/* Panic hint */}
      <div className="absolute bottom-20 left-4 text-xs text-mono-400/50">
        ESC×2 to panic close
      </div>
    </div>
  );
};

export default Room;
