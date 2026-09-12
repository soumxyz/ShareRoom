import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Trash2, MoreVertical, VolumeX, UserX, ExternalLink, FileText, File, Image, Presentation, FileCode, FileType2 } from 'lucide-react';
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
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
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
  isLastInGroup = true,
  isFirstInGroup = true,
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

  const handleOpenDataUrl = (e: React.MouseEvent<HTMLAnchorElement>, url: string | null) => {
    if (!url) return;
    if (url.startsWith('data:')) {
      e.preventDefault();
      try {
        const [header, base64] = url.split(',');
        const mimeType = header.split(':')[1].split(';')[0];
        
        const byteCharacters = atob(base64);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        window.open(blobUrl, '_blank');
        
        // Clean up object URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000 * 60); 
      } catch (err) {
        console.error('Failed to open file:', err);
        window.open(url, '_blank');
      }
    }
  };

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
  const hasCode = contentParts.some((p) => p.type === 'code');

  const isPdf = message.file_type?.includes('pdf');
  const isPptx = message.file_name?.endsWith('.pptx');
  const isDocx = message.file_name?.endsWith('.docx');
  const isIpynb = message.file_name?.endsWith('.ipynb');
  const isTxt = message.file_name?.endsWith('.txt');
  const isImage = message.file_type?.startsWith('image/');

  return (
    <div
      id={`message-${message.id}`}
      className={`group flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${isLastInGroup ? 'mb-[16px]' : 'mb-[2px]'}`}
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

      {/* Username and time - hidden to match mockup */}
      {/*
      {!isOwn && (
        <div className={`flex items-center gap-2 mb-1 ml-2`}>
          <span className="text-xs font-medium text-mono-700">{message.username}</span>
          <span className="text-[10px] text-mono-500">{time}</span>
        </div>
      )}
      */}

      <div className={`flex items-end gap-1 sm:gap-2 ${hasCode ? 'max-w-[98%] sm:max-w-[85%]' : 'max-w-[90%] sm:max-w-[75%]'} ${isOwn ? 'flex-row-reverse ml-auto' : 'flex-row mr-auto'}`}>
        {/* Message bubble */}
        <div className="relative text-sm text-white min-w-0 w-full">
          {/* File message */}
          {message.message_type === 'file' && message.file_url && (
            <div className="space-y-2">
              {isImage ? (
                <div className="relative max-w-full">
                  <img
                    src={message.file_url}
                    alt={message.file_name || 'Shared image'}
                    className="max-w-full max-h-[300px] sm:max-w-[300px] object-cover"
                    style={{
                      borderRadius: '24px',
                    }}
                    loading="lazy"
                  />
                  {/* Image filename hidden to match iMessage clean aesthetic */}
                </div>
              ) : (
                <div className="relative max-w-full">
                  <div className={`px-[16px] py-[8px] flex flex-col gap-2 ${isOwn ? 'bg-[#34C759] text-white' : 'bg-[#E9E9EB] text-[#1D1D1F]'} `}
                       style={{ 
                         fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                         fontWeight: 400,
                         borderRadius: '24px',
                         /* No tail margins needed */
                       }}>
                  <div className="flex items-center gap-2">
                    {isPdf ? (
                      <FileText className={`w-4 h-4 shrink-0 ${isOwn ? 'text-white' : 'text-red-500'}`} />
                    ) : isPptx ? (
                      <Presentation className={`w-4 h-4 shrink-0 ${isOwn ? 'text-white' : 'text-orange-500'}`} />
                    ) : isDocx ? (
                      <FileType2 className={`w-4 h-4 shrink-0 ${isOwn ? 'text-white' : 'text-blue-500'}`} />
                    ) : isIpynb ? (
                      <FileCode className={`w-4 h-4 shrink-0 ${isOwn ? 'text-white' : 'text-yellow-600'}`} />
                    ) : (
                      <File className={`w-4 h-4 shrink-0 ${isOwn ? 'text-white/80' : 'text-gray-500'}`} />
                    )}
                    <span className={`font-mono text-[14px] leading-tight break-all ${isOwn ? 'text-white' : 'text-[#1D1D1F]'}`}>
                      {message.file_name}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={message.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleOpenDataUrl(e, message.file_url)}
                      className={`flex items-center gap-1 text-[13px] hover:underline font-medium ${isOwn ? 'text-white' : 'text-[#007AFF]'}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                    {(isPdf || isTxt) && (
                      <button
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                        className={`text-xs ${isOwn ? 'text-white/70 hover:text-white/90' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {showPdfViewer ? 'Hide' : 'Preview'}
                      </button>
                    )}
                  </div>

                  {showPdfViewer && isPdf && (
                    <iframe
                      src={message.file_url}
                      className="w-full h-[250px] sm:h-[400px] rounded-md border border-mono-300 mt-2 bg-white"
                    />
                  )}

                  {showPdfViewer && isTxt && (
                    <iframe
                      src={message.file_url}
                      className="w-full h-[150px] sm:h-[200px] rounded-md border border-mono-300 bg-white mt-2"
                    />
                  )}
                </div>
                </div>
              )}
            </div>
          )}

          {/* Text message with code blocks */}
          {message.message_type !== 'file' && (
            <div className="space-y-2">
              {contentParts.map((part, i) =>
                part.type === 'code' ? (
                  <div key={i} className="w-full my-1 rounded-lg overflow-hidden">
                    <CodeBlock code={part.content} language={part.language} />
                  </div>
                ) : (
                  <div key={i} className="relative max-w-full">
                    <div className={`px-[16px] py-[6px] flex flex-col ${isOwn ? 'bg-[#34C759] text-white' : 'bg-[#E9E9EB] text-[#1D1D1F]'}`}
                         style={{
                           fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                         fontWeight: 400,
                           fontSize: '17px',
                           lineHeight: '1.35',
                           letterSpacing: '-0.01em',
                           borderRadius: '24px',
                           /* No tail margins needed */
                         }}>
                      <p className="whitespace-pre-wrap break-words">
                        {part.content}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Actions - always visible on touch, hover on desktop */}
        <div className={`opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onReply}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-mono-500 hover:text-mono-700 hover:bg-mono-200"
          >
            <Reply className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>


        </div>
      </div>

      {/* Time for own messages - hidden to match mockup */}
      {/*
      {isOwn && (
        <span className="text-[10px] text-mono-500 mt-1 mr-2">{time}</span>
      )}
      */}
    </div>
  );
};