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
  const [showCodeHelper, setShowCodeHelper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
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

  const insertCodeBlock = async () => {
    try {
      const clipboard = await navigator.clipboard.readText();
      const codeBlock = `\`\`\`\n${clipboard}\n\`\`\``;
      setMessage((prev) => prev + (prev ? '\n' : '') + codeBlock);
    } catch {
      const codeBlock = '```\n// Paste your code here\n```';
      setMessage((prev) => prev + (prev ? '\n' : '') + codeBlock);
    }
    setShowCodeHelper(false);
  };

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-secondary/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Replying to <span className="font-medium text-foreground">{replyTo.username}</span>
          </span>
          <Button size="sm" variant="ghost" onClick={onCancelReply} className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
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
          className="shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] resize-none pr-12 bg-secondary border-border focus:ring-2 focus:ring-primary"
            rows={1}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={insertCodeBlock}
          disabled={disabled}
          className="shrink-0"
          title="Paste code from clipboard"
        >
          <Code className="w-5 h-5" />
        </Button>

        <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};
