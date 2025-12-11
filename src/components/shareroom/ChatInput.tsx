import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Code, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  onFileUpload: (file: File) => void;
  replyTo?: { id: string; username: string; content: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export const ChatInput = ({
  onSend,
  onFileUpload,
  replyTo,
  onCancelReply,
  disabled,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [codeMode, setCodeMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      if (codeMode) {
        // Wrap the message in code block, preserving exact indentation
        const codeBlock = `\`\`\`\n${message}\n\`\`\``;
        onSend(codeBlock);
      } else {
        onSend(message.trim());
      }
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="py-3">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-mono-100 rounded-lg border border-mono-200">
          <span className="text-xs text-mono-500">
            Replying to <span className="font-medium text-mono-700">{replyTo.username}</span>
          </span>
          <Button size="sm" variant="ghost" onClick={onCancelReply} className="h-6 w-6 p-0 text-mono-500 hover:text-mono-800 hover:bg-mono-200">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Code mode indicator */}
      {codeMode && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-mono-100 rounded-lg border border-mono-300">
          <Code className="w-3.5 h-3.5 text-mono-600" />
          <span className="text-xs text-mono-600">Code mode ON - your message will be sent as a code block</span>
        </div>
      )}

      <div className="flex items-end gap-2 p-3 bg-mono-100 rounded-xl border border-mono-200">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.java,.c,.py,.cpp,.zip,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 text-mono-500 hover:text-mono-800 hover:bg-mono-200 h-8 w-8"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={codeMode ? "Type your code... (indentation preserved)" : "Type a message..."}
              disabled={disabled}
              className={`min-h-[40px] max-h-[200px] resize-none bg-transparent border-0 text-mono-800 placeholder:text-mono-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm ${codeMode ? 'font-mono' : ''}`}
              rows={1}
            />
          </div>

          <Button
            type="button"
            variant={codeMode ? "default" : "ghost"}
            size="icon"
            onClick={() => setCodeMode(!codeMode)}
            disabled={disabled}
            className={`shrink-0 h-8 w-8 ${codeMode ? 'bg-mono-700 hover:bg-mono-600 text-mono-100' : 'text-mono-500 hover:text-mono-800 hover:bg-mono-200'}`}
            title={codeMode ? "Code mode ON (click to turn off)" : "Code mode OFF (click to turn on)"}
          >
            <Code className="w-4 h-4" />
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={disabled || !message.trim()}
            className="shrink-0 bg-mono-700 hover:bg-mono-600 text-mono-100 h-8 w-8 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
