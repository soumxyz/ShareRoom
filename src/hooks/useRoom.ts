import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFingerprint } from '@/lib/fingerprint';
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

      // Check if banned
      const { data: banData } = await supabase
        .from('banned_fingerprints')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

      if (banData) {
        setError('You have been banned from this room');
        setLoading(false);
        return;
      }

      // Check if room is locked
      if (roomData.is_locked && roomData.host_fingerprint !== fingerprint) {
        setError('This room is locked');
        setLoading(false);
        return;
      }

      setRoom(roomData);
      setIsHost(roomData.host_fingerprint === fingerprint);

      // Check existing participant
      const { data: existingParticipant } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

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
      setError('Failed to join room');
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
          setRoom(payload.new as Room);
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

    // Check if muted
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

    const allowedTypes = ['.txt', '.java', '.c', '.py', '.cpp', '.zip', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      toast({
        title: 'Invalid file type',
        description: 'Only .txt, .java, .c, .py, .cpp, .zip, .pdf, .jpg, .jpeg, .png, .gif, .webp files allowed',
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
    
    // Check if user can delete (host or message owner)
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    const canDelete = isHost || message.participant_id === participant?.id;
    if (!canDelete) return;

    try {
      // Delete from database first - this will trigger realtime update for all users
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      
      if (error) {
        toast({
          title: 'Delete failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
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
    if (!target || target.fingerprint === fingerprint) return;

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

    // Reset all local state immediately to prevent stale data
    setMessages([]);
    setParticipants([]);
    setParticipant(null);
    setIsHost(false);
    setError(null);

    // Remove the specific channel first
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Remove all remaining channels to ensure no ghost presence
    await supabase.removeAllChannels();

    // Perform database cleanup if we had room and participant
    if (roomId && participantId) {
      try {
        // Send leave message
        await supabase.from('messages').insert({
          room_id: roomId,
          username: 'System',
          content: `${participantUsername} left the room`,
          message_type: 'system',
          is_system: true,
        });

        // Delete participant
        await supabase.from('room_participants').delete().eq('id', participantId);

        // Check if any non-banned participants remain
        const { data: remainingParticipants } = await supabase
          .from('room_participants')
          .select('id')
          .eq('room_id', roomId)
          .eq('is_banned', false);

        // If no participants left, delete all messages for this room
        if (!remainingParticipants || remainingParticipants.length === 0) {
          await supabase.from('messages').delete().eq('room_id', roomId);
        }
      } catch (err) {
        console.error('Error during leave cleanup:', err);
      }
    }

    // Reset room last to allow cleanup operations
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
