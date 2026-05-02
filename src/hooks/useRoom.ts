import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFingerprint } from '@/lib/fingerprint';
import { toast } from '@/hooks/use-toast';

// Types matching the Supabase schema
export interface Room {
  id: string;
  code: string;
  name: string;
  host_fingerprint: string;
  is_locked: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  username: string;
  fingerprint: string;
  is_muted: boolean;
  is_banned: boolean;
  joined_at: string;
}

export interface Message {
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

export const useRoom = (roomCode: string | null, username: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const participantRef = useRef<Participant | null>(null);

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

  // Main data loading
  const loadData = useCallback(async () => {
    if (!roomCode || !username || !fingerprint) return;

    try {
      const code = roomCode.toUpperCase();
      console.log('[useRoom] Looking up room:', code);

      // Fetch room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (roomError) throw roomError;
      if (!roomData) {
        setError('Room not found');
        setLoading(false);
        return;
      }

      console.log('[useRoom] Room found:', roomData.id);
      setRoom(roomData as Room);
      setIsHost(roomData.host_fingerprint === fingerprint);

      // Check if banned
      const { data: banData } = await supabase
        .from('banned_fingerprints')
        .select('id')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

      if (banData) {
        setError('You are banned from this room');
        setLoading(false);
        return;
      }

      // Check existing participant or create new
      let { data: existingParticipant } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('fingerprint', fingerprint)
        .maybeSingle();

      if (existingParticipant) {
        // Update username if changed
        if (existingParticipant.username !== username) {
          await supabase
            .from('room_participants')
            .update({ username })
            .eq('id', existingParticipant.id);
          existingParticipant.username = username;
        }
        setParticipant(existingParticipant as Participant);
      } else {
        // Join room - create participant
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
        setParticipant(newParticipant as Participant);

        // Add system message
        await supabase.from('messages').insert({
          room_id: roomData.id,
          participant_id: newParticipant.id,
          username: 'System',
          content: `${username} joined the room`,
          message_type: 'system',
          is_system: true,
        });
      }

      // Fetch participants
      const { data: participantsData } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('is_banned', false);

      setParticipants((participantsData || []) as Participant[]);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomData.id)
        .order('created_at', { ascending: true });

      setMessages((messagesData || []) as Message[]);
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

  // Real-time subscriptions via Supabase
  useEffect(() => {
    if (!room) return;

    const roomId = room.id;

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });
          if (data) setMessages(data as Message[]);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase
            .from('room_participants')
            .select('*')
            .eq('room_id', roomId)
            .eq('is_banned', false);
          if (data) {
            setParticipants(data as Participant[]);
            const me = participantRef.current;
            if (me) {
              const updatedMe = data.find((p: any) => p.id === me.id);
              if (updatedMe) {
                setParticipant(updatedMe as Participant);
                if (updatedMe.is_banned) {
                  setError('You have been kicked/banned from this room.');
                }
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        async () => {
          const { data } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .maybeSingle();
          if (data) setRoom(data as Room);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    await supabase.from('messages').insert({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content,
      message_type: 'text',
      reply_to_id: replyToId || null,
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

    await supabase.from('messages').insert({
      room_id: room.id,
      participant_id: participant.id,
      username: participant.username,
      content: `Shared file: ${file.name}`,
      message_type: 'file',
      file_url: fileDataUrl,
      file_name: file.name,
      file_type: file.type,
      is_system: false,
    });

    onProgress?.(100);
  };

  const toggleLock = async () => {
    if (!room || !isHost) return;
    await supabase
      .from('rooms')
      .update({ is_locked: !room.is_locked })
      .eq('id', room.id);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isHost && !participant) return;
    await supabase.from('messages').delete().eq('id', messageId);
  };

  const muteUser = async (participantId: string) => {
    if (!isHost) return;
    // Fetch current mute status first
    const { data } = await supabase
      .from('room_participants')
      .select('is_muted')
      .eq('id', participantId)
      .single();
    if (data) {
      await supabase
        .from('room_participants')
        .update({ is_muted: !data.is_muted })
        .eq('id', participantId);
    }
  };

  const kickUser = async (participantId: string, ban: boolean = false) => {
    if (!isHost || !room) return;

    // Get participant info for system message
    const { data: kickedParticipant } = await supabase
      .from('room_participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (!kickedParticipant) return;

    // Mark as banned
    await supabase
      .from('room_participants')
      .update({ is_banned: true })
      .eq('id', participantId);

    if (ban) {
      // Add to banned fingerprints
      await supabase.from('banned_fingerprints').insert({
        room_id: room.id,
        fingerprint: kickedParticipant.fingerprint,
      });
    }

    // System message
    await supabase.from('messages').insert({
      room_id: room.id,
      participant_id: null,
      username: 'System',
      content: `${kickedParticipant.username} was ${ban ? 'banned' : 'kicked'} from the room`,
      message_type: 'system',
      is_system: true,
    });
  };

  const leaveRoom = async () => {
    if (room && participant) {
      // Add leave message
      await supabase.from('messages').insert({
        room_id: room.id,
        participant_id: null,
        username: 'System',
        content: `${participant.username} left the room`,
        message_type: 'system',
        is_system: true,
      });

      // Remove participant
      await supabase
        .from('room_participants')
        .delete()
        .eq('id', participant.id);
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
