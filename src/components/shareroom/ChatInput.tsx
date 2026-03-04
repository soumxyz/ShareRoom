import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, X, ArrowRight, Plus, Paperclip } from 'lucide-react';
import { LoaderOne } from '@/components/ui/loader';
import { toast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSend: (content: string) => void;
  onFileUpload: (file: File, onProgress: (pct: number) => void) => Promise<void>;
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
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [fileProgress, setFileProgress] = useState<number | null>(null); // null=idle, 0–100=progress
  const [fileProgressName, setFileProgressName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  useEffect(() => {
    if (codeMode) {
      toast({
        title: 'Code mode ON',
        description: 'Messages will be sent as code blocks',
        duration: 2000,
      });
    }
  }, [codeMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    try {
      if (pastedImage) {
        setFileProgressName(pastedImage.name || 'image');
        setFileProgress(0);
        await onFileUpload(pastedImage, (pct) => setFileProgress(pct));
        setPastedImage(null);
        setFileProgress(null);
      } else if (message.trim() && !disabled) {
        if (codeMode) {
          const codeBlock = `\`\`\`\n${message}\n\`\`\``;
          await onSend(codeBlock);
        } else {
          await onSend(message.trim());
        }
        setMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    } finally {
      setSending(false);
      setFileProgress(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setPastedImage(file);
            e.preventDefault();
          }
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    setFileProgressName(file.name);
    setFileProgress(0);
    try {
      await onFileUpload(file, (pct) => setFileProgress(pct));
    } finally {
      setFileProgress(null);
      setFileProgressName('');
    }
  };

  const isSendingFile = fileProgress !== null;

  return (
    <div className="py-2 sm:py-3">
      {/* Reply indicator */}
      {replyTo && (
        <div className="indicator-bar justify-between mb-2">
          <span className="text-xs text-mono-500 truncate mr-2">
            Replying to <span className="font-medium text-mono-700">{replyTo.username}</span>
          </span>
          <Button size="sm" variant="ghost" onClick={onCancelReply} className="h-6 w-6 p-0 icon-btn shrink-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* File send progress indicator */}
      {isSendingFile && (
        <div className="mb-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Paperclip className="w-3.5 h-3.5 text-white/60 shrink-0" />
              <span className="text-xs text-white/80 truncate">{fileProgressName}</span>
            </div>
            <span className="text-xs text-white/60 shrink-0 ml-2">
              {fileProgress! < 95 ? `${Math.round(fileProgress!)}%` : 'Saving…'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${fileProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Pasted image preview */}
      {pastedImage && !isSendingFile && (
        <div className="mb-2 p-2 bg-mono-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-mono-600">Image ready to send</span>
            <Button size="sm" variant="ghost" onClick={() => setPastedImage(null)} className="h-6 w-6 p-0">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <img
            src={URL.createObjectURL(pastedImage)}
            alt="Pasted screenshot"
            className="max-w-full max-h-32 rounded object-contain"
          />
        </div>
      )}

      <div className="flex items-end gap-1 sm:gap-2 p-2 sm:p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg mobile-optimized smooth-transition">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.java,.c,.py,.cpp,.zip,.pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSendingFile}
          className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-1 sm:gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder=""
              disabled={disabled || isSendingFile}
              className={`min-h-[20px] sm:min-h-[24px] resize-none bg-transparent text-white caret-white placeholder:text-white/60 placeholder:align-middle focus-visible:ring-0 focus-visible:ring-offset-0 border-0 p-0 text-sm text-left leading-5 will-change-contents overflow-hidden ${codeMode ? 'font-mono' : ''}`}
              rows={1}
              style={{ WebkitAppearance: 'none', height: 'auto', maxHeight: '160px', overflowY: 'auto' }}
            />
          </div>

          <Button
            type="button"
            variant={codeMode ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setCodeMode(!codeMode)}
            disabled={disabled || isSendingFile}
            className={`shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full ${codeMode ? 'bg-mono-700 hover:bg-mono-600 text-mono-100' : 'text-mono-500 hover:text-mono-800 hover:bg-mono-200'}`}
            title={codeMode ? 'Code mode ON (click to turn off)' : 'Code mode OFF (click to turn on)'}
          >
            <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={disabled || isSendingFile || (!message.trim() && !pastedImage) || sending}
            className="shrink-0 bg-green-500 hover:bg-green-600 text-white h-8 w-8 sm:h-9 sm:w-9 rounded-full disabled:opacity-40 disabled:bg-gray-400"
          >
            {sending || isSendingFile ? <LoaderOne className="text-white" /> : <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};
