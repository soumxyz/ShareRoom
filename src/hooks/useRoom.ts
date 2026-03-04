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

    // Polling fallback: catches file messages whose large base64 payload
    // exceeded Supabase Realtime's ~1MB limit and was dropped entirely
    const pollInterval = setInterval(async () => {
      setMessages((prev) => {
        const latest = prev[prev.length - 1];
        if (!latest) return prev;
        supabase
          .from('messages')
          .select('*')
          .eq('room_id', room.id)
          .gt('created_at', latest.created_at)
          .order('created_at', { ascending: true })
          .then(({ data }) => {
            if (data && data.length > 0) {
              setMessages((current) => {
                const existingIds = new Set(current.map((m) => m.id));
                const newMsgs = data.filter((m) => !existingIds.has(m.id));
                return newMsgs.length > 0 ? [...current, ...newMsgs as Message[]] : current;
              });
            }
          });
        return prev;
      });
    }, 5000);

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
        async (payload) => {
          const msg = payload.new as Message;
          // File messages carry a large base64 file_url — always fetch fresh
          // from DB to ensure we get the complete data even if payload was truncated
          if (msg.message_type === 'file') {
            const { data: fullMsg } = await supabase
              .from('messages')
              .select('*')
              .eq('id', msg.id)
              .single();
            if (fullMsg) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === fullMsg.id)) return prev;
                return [...prev, fullMsg as Message];
              });
            }
          } else {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
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
      clearInterval(pollInterval);
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

    // Optimistic update — show message immediately to the sender
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = {
      id: tempId,
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
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { data: inserted, error: insertError } = await supabase.from('messages').insert({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content,
      message_type: 'text',
      reply_to_id: replyToId || null,
    }).select().single();

    if (insertError) {
      // Roll back the optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast({ title: 'Failed to send message', description: insertError.message, variant: 'destructive' });
      return;
    }

    // Replace temp message with the real one from the server
    if (inserted) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (inserted as Message) : m))
      );
    }
  };

  // Send file
  const sendFile = async (file: File, onProgress?: (pct: number) => void) => {
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

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10 MB',
        variant: 'destructive',
      });
      return;
    }

    onProgress?.(0);

    // Convert file to base64 data URL, reporting read progress 0→90%
    const fileDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress?.(Math.round((e.loaded / e.total) * 90));
        }
      };
      reader.onload = () => {
        onProgress?.(90);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }).catch((err) => {
      toast({
        title: 'Failed to read file',
        description: err?.message ?? 'Unknown error',
        variant: 'destructive',
      });
      return null;
    });

    if (!fileDataUrl) return;

    // Saving to DB: show 95%
    onProgress?.(95);

    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        room_id: room.id,
        participant_id: participant.id,
        username: participant.username,
        content: `Shared file: ${file.name}`,
        message_type: 'file',
        file_url: fileDataUrl,
        file_name: file.name,
        file_type: file.type,
      })
      .select()
      .single();

    if (insertError) {
      toast({
        title: 'Failed to send file',
        description: insertError.message,
        variant: 'destructive',
      });
      return;
    }

    onProgress?.(100);

    // Manually push into state so sender sees it immediately,
    // regardless of realtime payload size limits
    if (newMessage) {
      setMessages((prev) => [...prev, newMessage as Message]);
    }
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
