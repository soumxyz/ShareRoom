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

      // Check if room exists
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .maybeSingle();

      if (roomError) throw roomError;
      if (!roomData) {
        setError('Room not found');
        setLoading(false);
        return;
      }

      setRoom(roomData);
      setIsHost(roomData.host_fingerprint === fingerprint);

      // Check if user is banned
      const { data: banData } = await supabase
        .from('banned_fingerprints')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

      if (banData) {
        setError('You are banned from this room');
        setLoading(false);
        return;
      }

      // Check existing participant
      const { data: existingParticipant } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

      // Check if room is locked (only allow host or existing participants)
      if (roomData.is_locked && !existingParticipant && roomData.host_fingerprint !== fingerprint) {
        setError('Room is locked');
        setLoading(false);
        return;
      }

      let currentParticipant = existingParticipant;

      if (!existingParticipant) {
        // Join as new participant
        const { data: newParticipant, error: joinError } = await supabase
          .from('room_participants')
          .insert({
            room_id: roomData.id,
            username,
            fingerprint,
          })
          .select()
          .single();

        if (joinError) throw joinError;
        currentParticipant = newParticipant;

        // Send join message
        await supabase.from('messages').insert({
          room_id: roomData.id,
          participant_id: newParticipant.id,
          username,
          content: `${username} joined the room`,
          message_type: 'system',
          is_system: true,
        });
      } else {
        // Update username if different
        if (existingParticipant.username !== username) {
          await supabase
            .from('room_participants')
            .update({ username })
            .eq('id', existingParticipant.id);
        }
      }

      setParticipant(currentParticipant);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomData.id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      // Fetch participants
      const { data: participantsData } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('is_banned', false);

      setParticipants(participantsData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error joining room:', err);
      // Don't set error here to avoid blocking UI if just network glitch, but maybe should?
      // setError('Failed to join room'); 
      // If error is set, the UI blocks. Let's strictly block only on known errors.
      if (err instanceof Error && (err.message.includes('not found') || err.message.includes('banned'))) {
        setError(err.message);
      }
      setLoading(false);
    }
  }, [roomCode, username, fingerprint]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from('room_participants')
            .select('*')
            .eq('room_id', room.id)
            .eq('is_banned', false);
          setParticipants(data || []);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const newRoom = payload.new as Room;
          setRoom(newRoom);
          // Kick if locked and we are not host/participant? Already participant. 
          // If room becomes locked, existing participants stay.
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
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

    await supabase.from('messages').insert({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content,
      message_type: 'text',
      reply_to_id: replyToId || null,
    });
  };

  // Send file
  const sendFile = async (file: File) => {
    if (!room || !participant) return;

    if (participant.is_muted) {
      toast({ title: 'Muted', description: 'You cannot send files while muted', variant: 'destructive' });
      return;
    }

    const allowedTypes = ['.txt', '.java', '.c', '.py', '.cpp', '.zip', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(ext)) {
      toast({
        title: 'Invalid file type',
        description: 'File type not allowed',
        variant: 'destructive',
      });
      return;
    }

    const filePath = `${room.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('room-files')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('room-files')
      .getPublicUrl(filePath);

    await supabase.from('messages').insert({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content: `Shared file: ${file.name}`,
      message_type: 'file',
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
    });
  };

  // Host actions
  const toggleLock = async () => {
    if (!room || !isHost) return;
    await supabase.from('rooms').update({ is_locked: !room.is_locked }).eq('id', room.id);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isHost && !participant) return;
    // Basic optimistic check or UI check, backend RLS should also enforce
    await supabase.from('messages').delete().eq('id', messageId);
  };

  const muteUser = async (participantId: string) => {
    if (!isHost) return;
    const target = participants.find((p) => p.id === participantId);
    if (target) {
      await supabase
        .from('room_participants')
        .update({ is_muted: !target.is_muted })
        .eq('id', participantId);
    }
  };

  const kickUser = async (participantId: string, ban: boolean = false) => {
    if (!isHost || !room) return;

    const target = participants.find((p) => p.id === participantId);
    if (!target) return;

    if (ban) {
      await supabase.from('banned_fingerprints').insert({
        room_id: room.id,
        fingerprint: target.fingerprint,
      });
    }

    await supabase.from('room_participants').update({ is_banned: true }).eq('id', participantId);

    await supabase.from('messages').insert({
      room_id: room.id,
      username: 'System',
      content: `${target.username} was ${ban ? 'banned' : 'kicked'} from the room`,
      message_type: 'system',
      is_system: true,
    });
  };

  const leaveRoom = async () => {
    const roomId = room?.id;
    const participantId = participant?.id;
    const participantUsername = participant?.username;

    setMessages([]);
    setParticipants([]);
    setParticipant(null);
    setIsHost(false);
    setError(null);
    setRoom(null);

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (roomId && participantId) {
      // Best effort leave
      await supabase.from('messages').insert({
        room_id: roomId,
        username: 'System',
        content: `${participantUsername} left the room`,
        message_type: 'system',
        is_system: true,
      });

      await supabase.from('room_participants').delete().eq('id', participantId);
    }
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
