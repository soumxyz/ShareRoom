import { Button } from '@/components/ui/button';
import { VolumeX, Volume2, UserX, Crown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Users } from 'lucide-react';

interface Participant {
  id: string;
  username: string;
  is_muted: boolean;
  fingerprint: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId: string | null;
  hostFingerprint: string;
  isHost: boolean;
  onMuteUser: (id: string) => void;
  onKickUser: (id: string) => void;
}

export const ParticipantsList = ({
  participants,
  currentUserId,
  hostFingerprint,
  isHost,
  onMuteUser,
  onKickUser,
}: ParticipantsListProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-mono-600 hover:text-mono-800 hover:bg-mono-200">
          <Users className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-mono-700 text-mono-100 text-xs rounded-full flex items-center justify-center">
            {participants.length}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-mono-50 border-mono-300">
        <SheetHeader>
          <SheetTitle className="text-mono-800">Participants ({participants.length})</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {participants.map((p) => {
            const isCurrentUser = p.id === currentUserId;
            const isParticipantHost = p.fingerprint === hostFingerprint;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isCurrentUser ? 'bg-mono-200 border border-mono-400' : 'bg-mono-100 border border-mono-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isParticipantHost
                        ? 'bg-mono-700 text-mono-100'
                        : 'bg-mono-300 text-mono-700'
                    }`}
                  >
                    {p.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-mono-800">{p.username}</span>
                      {isCurrentUser && (
                        <span className="text-xs text-mono-500">(you)</span>
                      )}
                      {isParticipantHost && (
                        <Crown className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    {p.is_muted && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <VolumeX className="w-3 h-3" />
                        Muted
                      </span>
                    )}
                  </div>
                </div>

                {isHost && !isCurrentUser && !isParticipantHost && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMuteUser(p.id)}
                      className="h-8 w-8 p-0 text-mono-500 hover:text-mono-800 hover:bg-mono-200"
                    >
                      {p.is_muted ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onKickUser(p.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-mono-200"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
