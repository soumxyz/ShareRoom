import { useState, useEffect, useCallback, useRef } from 'react';
import { mockDb, Message, Participant, Room } from '@/lib/mockDb';
import { getFingerprint } from '@/lib/fingerprint';
import { toast } from '@/hooks/use-toast';

export const useRoom = (roomCode: string | null, username: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  // Use refs for subscription callbacks so they always see latest state
  const roomRef = useRef<Room | null>(null);
  const participantRef = useRef<Participant | null>(null);

  // Keep refs in sync with state
  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { participantRef.current = participant; }, [participant]);

  // Initialize fingerprint
  useEffect(() => {
    let cancelled = false;
    getFingerprint().then((fp) => {
      if (!cancelled) setFingerprint(fp);
    });
    return () => { cancelled = true; };
  }, []);

  const loadData = useCallback(async () => {
    if (!roomCode || !username || !fingerprint) return;

    try {
      const code = roomCode.toUpperCase();
      console.log('[useRoom] Looking up room with code:', code);
      const roomData = await mockDb.getRoomByCode(code);
      
      if (!roomData) {
        console.error('[useRoom] Room not found for code:', code);
        setError('Room not found');
        setLoading(false);
        return;
      }

      console.log('[useRoom] Room found:', roomData.id, roomData.name);
      setRoom(roomData);
      setIsHost(roomData.host_fingerprint === fingerprint);

      // Join room
      const currentParticipant = await mockDb.joinRoom(roomData.id, username, fingerprint);
      
      if (currentParticipant.is_banned) {
        setError('You are banned from this room');
        setLoading(false);
        return;
      }

      console.log('[useRoom] Joined as participant:', currentParticipant.id, currentParticipant.username);
      setParticipant(currentParticipant);

      // Fetch participants
      const participantsData = await mockDb.getParticipants(roomData.id);
      setParticipants(participantsData);

      // Fetch messages
      const messagesData = await mockDb.getMessages(roomData.id);
      setMessages(messagesData);

      setLoading(false);
    } catch (err: any) {
      console.error('[useRoom] Error loading room:', err);
      setError(err.message || 'Failed to join room');
      setLoading(false);
    }
  }, [roomCode, username, fingerprint]);

  useEffect(() => {
    if (roomCode && username && fingerprint) {
      loadData();
    }
  }, [roomCode, username, fingerprint, loadData]);

  // Subscriptions for mockDb — uses refs to avoid re-subscribing on state changes
  useEffect(() => {
    if (!room) return;

    const roomId = room.id;

    const unsubRooms = mockDb.subscribe('rooms', async () => {
      const updatedRoom = await mockDb.getRoomById(roomId);
      if (updatedRoom) setRoom(updatedRoom);
    });

    const unsubParticipants = mockDb.subscribe('participants', async () => {
      const updatedParticipants = await mockDb.getParticipants(roomId);
      setParticipants(updatedParticipants);
      
      const currentParticipant = participantRef.current;
      if (currentParticipant) {
        const updatedMe = updatedParticipants.find(p => p.id === currentParticipant.id);
        if (updatedMe) {
          setParticipant(updatedMe);
          if (updatedMe.is_banned) {
             setError('You have been kicked/banned from this room.');
          }
        }
      }
    });

    const unsubMessages = mockDb.subscribe('messages', async () => {
      const updatedMessages = await mockDb.getMessages(roomId);
      setMessages(updatedMessages);
    });

    return () => {
      unsubRooms();
      unsubParticipants();
      unsubMessages();
    };
  // Only re-subscribe when the room ID changes, not on every participant change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  const sendMessage = async (content: string, replyToId?: string) => {
    if (!room || !participant) return;

    if (participant.is_muted) {
      toast({
        title: 'Muted',
        description: 'You are muted in this room',
        variant: 'destructive',
      });
      return;
    }

    await mockDb.addMessage({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content,
      message_type: 'text',
      reply_to_id: replyToId || null,
      file_url: null,
      file_name: null,
      file_type: null,
      is_system: false,
    });
  };

  const sendFile = async (file: File, onProgress?: (pct: number) => void) => {
    if (!room || !participant) return;

    if (participant.is_muted) {
      toast({ title: 'Muted', description: 'You cannot send files while muted', variant: 'destructive' });
      return;
    }

    onProgress?.(0);
    const fileDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 90));
      };
      reader.onload = () => {
        onProgress?.(90);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }).catch(() => null);

    if (!fileDataUrl) return;

    onProgress?.(95);

    await mockDb.addMessage({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content: `Shared file: ${file.name}`,
      message_type: 'file',
      reply_to_id: null,
      file_url: fileDataUrl,
      file_name: file.name,
      file_type: file.type,
      is_system: false,
    });

    onProgress?.(100);
  };

  const toggleLock = async () => {
    if (!room || !isHost) return;
    await mockDb.toggleLock(room.id);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isHost && !participant) return;
    await mockDb.deleteMessage(messageId);
  };

  const muteUser = async (participantId: string) => {
    if (!isHost) return;
    await mockDb.muteUser(participantId);
  };

  const kickUser = async (participantId: string, ban: boolean = false) => {
    if (!isHost || !room) return;
    await mockDb.kickUser(room.id, participantId, ban);
  };

  const leaveRoom = async () => {
    if (room && participant) {
      await mockDb.leaveRoom(room.id, participant.id);
    }
    setMessages([]);
    setParticipants([]);
    setParticipant(null);
    setIsHost(false);
    setError(null);
    setRoom(null);
  };

  return {
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
  };
};
