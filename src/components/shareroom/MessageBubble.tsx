import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Trash2, MoreVertical, VolumeX, UserX, ExternalLink, FileText, File } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  username: string;
  content: string | null;
  message_type: string;
  is_system: boolean;
  reply_to_id: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  participant_id: string | null;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isHost: boolean;
  replyMessage?: Message | null;
  onReply: () => void;
  onDelete?: () => void;
  onMuteUser?: () => void;
  onKickUser?: () => void;
  onScrollToMessage?: (id: string) => void;
}

export const MessageBubble = ({
  message,
  isOwn,
  isHost,
  replyMessage,
  onReply,
  onDelete,
  onMuteUser,
  onKickUser,
  onScrollToMessage,
}: MessageBubbleProps) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // System messages - centered, fade in only
  if (message.is_system) {
    return (
      <div className="flex justify-center py-2 animate-message-system">
        <span className="text-[11px] text-mono-500 px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Parse content for code blocks
  const parseContent = (content: string | null) => {
    if (!content) return [];
    
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index).trim(),
        });
      }
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex).trim();
      if (remaining) {
        parts.push({ type: 'text', content: remaining });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content }];
  };

  const contentParts = parseContent(message.content);

  const isPdf = message.file_type?.includes('pdf');
  const isTxt = message.file_name?.endsWith('.txt');

  return (
    <div
      id={`message-${message.id}`}
      className={`group flex flex-col ${isOwn ? 'items-end animate-message-send' : 'items-start animate-message-receive'} mb-3`}
    >
      {/* Reply reference */}
      {replyMessage && (
        <button
          onClick={() => onScrollToMessage?.(replyMessage.id)}
          className={`flex items-center gap-1.5 text-xs text-mono-500 hover:text-mono-700 transition-colors mb-1 ${isOwn ? 'mr-2' : 'ml-2'}`}
        >
          <Reply className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-[280px]">
            Replying to {replyMessage.username}: {replyMessage.content?.slice(0, 30)}...
          </span>
        </button>
      )}

      {/* Username and time - only for other users */}
      {!isOwn && (
        <div className={`flex items-center gap-2 mb-1 ml-2`}>
          <span className="text-xs font-medium text-mono-700">{message.username}</span>
          <span className="text-[10px] text-mono-500">{time}</span>
        </div>
      )}

      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Message bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-mono-800 text-mono-50 rounded-br-md'
              : 'bg-mono-200 text-mono-800 rounded-bl-md'
          }`}
        >
          {/* File message */}
          {message.message_type === 'file' && message.file_url && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isPdf ? (
                  <FileText className={`w-4 h-4 shrink-0 ${isOwn ? 'text-mono-300' : 'text-destructive'}`} />
                ) : (
                  <File className={`w-4 h-4 shrink-0 ${isOwn ? 'text-mono-400' : 'text-mono-500'}`} />
                )}
                <span className={`font-mono text-xs sm:text-sm break-all ${isOwn ? 'text-mono-100' : 'text-mono-800'}`}>
                  {message.file_name}
                </span>
              </div>
              
              <div className="flex gap-3">
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 text-xs hover:underline ${isOwn ? 'text-mono-300 hover:text-mono-100' : 'text-mono-600 hover:text-mono-800'}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
                {(isPdf || isTxt) && (
                  <button
                    onClick={() => setShowPdfViewer(!showPdfViewer)}
                    className={`text-xs ${isOwn ? 'text-mono-400 hover:text-mono-200' : 'text-mono-500 hover:text-mono-700'}`}
                  >
                    {showPdfViewer ? 'Hide' : 'Preview'}
                  </button>
                )}
              </div>

              {showPdfViewer && isPdf && (
                <iframe
                  src={message.file_url}
                  className="w-full h-[250px] sm:h-[400px] rounded-md border border-mono-300 mt-2"
                />
              )}

              {showPdfViewer && isTxt && (
                <iframe
                  src={message.file_url}
                  className="w-full h-[150px] sm:h-[200px] rounded-md border border-mono-300 bg-mono-100 mt-2"
                />
              )}
            </div>
          )}

          {/* Text message with code blocks */}
          {message.message_type !== 'file' && (
            <div className="space-y-2">
              {contentParts.map((part, i) =>
                part.type === 'code' ? (
                  <div key={i} className="overflow-hidden rounded-lg -mx-1 my-1">
                    <CodeBlock code={part.content} language={part.language} />
                  </div>
                ) : (
                  <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {part.content}
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* Actions - visible on hover */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onReply}
            className="h-7 w-7 p-0 text-mono-500 hover:text-mono-700 hover:bg-mono-200"
          >
            <Reply className="w-3.5 h-3.5" />
          </Button>

          {(isHost || isOwn) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-mono-500 hover:text-mono-700 hover:bg-mono-200">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-mono-100 border-mono-300">
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {isHost && !isOwn && onMuteUser && (
                  <DropdownMenuItem onClick={onMuteUser}>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Mute User
                  </DropdownMenuItem>
                )}
                {isHost && !isOwn && onKickUser && (
                  <DropdownMenuItem onClick={onKickUser} className="text-destructive">
                    <UserX className="w-4 h-4 mr-2" />
                    Kick & Ban
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Time for own messages - below bubble */}
      {isOwn && (
        <span className="text-[10px] text-mono-500 mt-1 mr-2">{time}</span>
      )}
    </div>
  );
};