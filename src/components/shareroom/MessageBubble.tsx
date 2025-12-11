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

  if (message.is_system) {
    return (
      <div className="flex justify-center py-1.5 animate-fade-in">
        <span className="text-xs text-mono-500 bg-mono-100 px-3 py-1 rounded-full">
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
      className={`group flex flex-col gap-1 animate-fade-in ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      {/* Reply reference */}
      {replyMessage && (
        <button
          onClick={() => onScrollToMessage?.(replyMessage.id)}
          className="flex items-center gap-1.5 text-xs text-mono-500 hover:text-mono-700 transition-colors ml-10"
        >
          <Reply className="w-3 h-3" />
          <span className="truncate max-w-[200px]">
            Replying to {replyMessage.username}: {replyMessage.content?.slice(0, 30)}...
          </span>
        </button>
      )}

      <div className={`flex items-start gap-2.5 max-w-[85%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
            isOwn ? 'bg-mono-700 text-mono-100' : 'bg-mono-200 text-mono-700'
          }`}
        >
          {message.username[0].toUpperCase()}
        </div>

        {/* Message content */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-mono-800">{message.username}</span>
            <span className="text-xs text-mono-400">{time}</span>
          </div>

          <div
            className={`rounded-xl px-3 py-2.5 ${
              isOwn
                ? 'bg-mono-200'
                : 'bg-mono-100 border border-mono-200'
            }`}
          >
            {/* File message */}
            {message.message_type === 'file' && message.file_url && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isPdf ? (
                    <FileText className="w-5 h-5 text-destructive" />
                  ) : (
                    <File className="w-5 h-5 text-mono-500" />
                  )}
                  <span className="font-mono text-sm text-mono-800">{message.file_name}</span>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={message.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-mono-600 hover:text-mono-800 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </a>
                  {(isPdf || isTxt) && (
                    <button
                      onClick={() => setShowPdfViewer(!showPdfViewer)}
                      className="text-xs text-mono-500 hover:text-mono-700"
                    >
                      {showPdfViewer ? 'Hide' : 'Preview'}
                    </button>
                  )}
                </div>

                {showPdfViewer && isPdf && (
                  <iframe
                    src={message.file_url}
                    className="w-full h-[400px] rounded border border-mono-300"
                  />
                )}

                {showPdfViewer && isTxt && (
                  <iframe
                    src={message.file_url}
                    className="w-full h-[200px] rounded border border-mono-300 bg-mono-100"
                  />
                )}
              </div>
            )}

            {/* Text message with code blocks */}
            {message.message_type !== 'file' &&
              contentParts.map((part, i) =>
                part.type === 'code' ? (
                  <div key={i} className="mt-2 first:mt-0">
                    <CodeBlock code={part.content} language={part.language} />
                  </div>
                ) : (
                  <p key={i} className="text-sm whitespace-pre-wrap break-words text-mono-800">
                    {part.content}
                  </p>
                )
              )}
          </div>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onReply}
            className="h-7 w-7 p-0 text-mono-500 hover:text-mono-800 hover:bg-mono-200"
          >
            <Reply className="w-3.5 h-3.5" />
          </Button>

          {(isHost || isOwn) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-mono-500 hover:text-mono-800 hover:bg-mono-200">
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
    </div>
  );
};
