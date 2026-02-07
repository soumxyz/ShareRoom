import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFingerprint } from '@/lib/fingerprint';
import { mockDb } from '@/lib/mockDb';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  room_id: string;
  participant_id: string | null;
  username: string;
  content: string | null;
  message_type: string;
  reply_to_id: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  is_system: boolean;
  created_at: string;
}

interface Participant {
  id: string;
  room_id: string;
  username: string;
  fingerprint: string;
  is_muted: boolean;
  is_banned: boolean;
  joined_at: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  host_fingerprint: string;
  is_locked: boolean;
  created_at: string;
  last_activity_at: string;
}

export const useRoom = (roomCode: string | null, username: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initialize fingerprint
  useEffect(() => {
    getFingerprint().then(setFingerprint);
  }, []);

  // Auto-cleanup old rooms (24 hours)
  useEffect(() => {
    const cleanupOldRooms = async () => {
      try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // Get rooms older than 24 hours
        const { data: oldRooms } = await supabase
          .from('rooms')
          .select('id')
          .lt('created_at', twentyFourHoursAgo.toISOString());

        if (oldRooms && oldRooms.length > 0) {
          const oldRoomIds = oldRooms.map(room => room.id);

          // Delete participants, messages, and rooms
          await supabase.from('room_participants').delete().in('room_id', oldRoomIds);
          await supabase.from('messages').delete().in('room_id', oldRoomIds);
          await supabase.from('banned_fingerprints').delete().in('room_id', oldRoomIds);
          await supabase.from('rooms').delete().in('id', oldRoomIds);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };

    // Run cleanup immediately and then every hour
    cleanupOldRooms();
    const interval = setInterval(cleanupOldRooms, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  // Join room
  const joinRoom = useCallback(async () => {
    if (!roomCode || !username || !fingerprint) return;

    try {
      setLoading(true);
      setError(null);

      const roomData = await mockDb.getRoomByCode(roomCode);

      if (!roomData) {
        setError('Room not found');
        setLoading(false);
        return;
      }

      setRoom(roomData);
      setIsHost(roomData.host_fingerprint === fingerprint);

      // Check if user is banned
      // Simplification: Banning not fully implemented in mock for now, or could check participant property
      const participants = await mockDb.getParticipants(roomData.id);

      // Check existing participant
      const existingParticipant = await mockDb.joinRoom(roomData.id, username, fingerprint);

      // Check if room is locked
      if (roomData.is_locked && !participants.find(p => p.fingerprint === fingerprint) && roomData.host_fingerprint !== fingerprint) {
        setError('Room is locked');
        setLoading(false);
        return;
      }

      setParticipant(existingParticipant);

      const messagesData = await mockDb.getMessages(roomData.id);
      setMessages(messagesData);

      const participantsData = await mockDb.getParticipants(roomData.id);
      setParticipants(participantsData);

      setLoading(false);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(null);
      setLoading(false);
    }
  }, [roomCode, username, fingerprint]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!room) return;

    const updateData = async () => {
      const messagesData = await mockDb.getMessages(room.id);
      setMessages(messagesData);

      const participantsData = await mockDb.getParticipants(room.id);
      setParticipants(participantsData);

      const roomData = await mockDb.getRoomById(room.id);
      if (roomData) setRoom(roomData);
    };

    // Subscriptions
    const unsubMessages = mockDb.subscribe('messages', updateData);
    const unsubParticipants = mockDb.subscribe('participants', updateData);
    const unsubRooms = mockDb.subscribe('rooms', updateData);

    return () => {
      unsubMessages();
      unsubParticipants();
      unsubRooms();
    };
  }, [room]);

  // Join when ready
  useEffect(() => {
    if (roomCode && username && fingerprint) {
      joinRoom();
    }
  }, [roomCode, username, fingerprint, joinRoom]);

  // Send message
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
      is_system: false
    });
  };

  // Send file
  const sendFile = async (file: File) => {
    if (!room || !participant) return;

    toast({
      title: 'Not supported',
      description: 'File sharing is not supported in offline demo mode',
      variant: 'destructive',
    });
  };

  // Host actions
  const toggleLock = async () => {
    if (!room || !isHost) return;
    await mockDb.toggleLock(room.id);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isHost && !participant) return;
    await mockDb.deleteMessage(messageId);
  };

  const muteUser = async (participantId: string) => {
    // Mock mute - effectively does nothing in DB but UI could update if we persisted it
    if (!isHost) return;
    toast({ title: "Mute", description: "Muting not fully supported in demo mode" });
  };

  const kickUser = async (participantId: string, ban: boolean = false) => {
    if (!isHost || !room) return;
    await mockDb.leaveRoom(room.id, participantId);
  };

  const leaveRoom = async () => {
    if (room && participant) {
      await mockDb.leaveRoom(room.id, participant.id);
    }
    setRoom(null);
    setParticipant(null);
    setMessages([]);
    setParticipants([]);
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
