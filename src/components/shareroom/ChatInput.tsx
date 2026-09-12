import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, X, ArrowUp, Plus, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
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
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fileProgress, setFileProgress] = useState<number | null>(null); // null=idle, 0–100=progress
  const [fileProgressName, setFileProgressName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 160);
    el.style.height = newHeight + 'px';
    setIsExpanded(newHeight > 40); // 40px threshold to account for new padding
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setShowCodePopup(true);
    const timer = setTimeout(() => setShowCodePopup(false), 2500);
    return () => clearTimeout(timer);
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
        setIsExpanded(false);
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

      {/* Code Mode Pill Popup - Portaled to top of window */}
      {typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed top-[84px] left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${showCodePopup ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95 pointer-events-none'}`}
        >
          <div className="bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 text-[#1D1D1F] border border-black/[0.04] px-[20px] py-[10px] rounded-full text-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-[8px]" style={{ fontWeight: 500 }}>
            <Code className={`w-[18px] h-[18px] ${codeMode ? 'text-[#34C759]' : 'text-[#86868B]'}`} strokeWidth={2.5} />
            <span style={{ letterSpacing: '-0.01em' }}>{codeMode ? 'Code Mode ON' : 'Code Mode OFF'}</span>
          </div>
        </div>,
        document.body
      )}

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

      <div className="flex items-end gap-3 w-full pb-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.java,.c,.py,.cpp,.zip,.pdf,.jpg,.jpeg,.png,.gif,.webp,.ipynb,.pptx,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSendingFile}
          className="shrink-0 h-[46px] w-[46px] rounded-full bg-white shadow-sm border border-black/5 hover:bg-gray-50 text-gray-800 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </Button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-3 min-w-0">
          <div className={`flex-1 flex items-center min-w-0 bg-white shadow-sm border border-black/5 transition-all duration-300 ${isExpanded ? 'rounded-[1.5rem]' : 'rounded-full'}`}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Message..."
              disabled={disabled || isSendingFile}
              className={`flex-1 min-h-[46px] max-h-[160px] py-[13px] pl-5 pr-2 resize-none bg-transparent text-gray-900 caret-blue-500 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 text-[15px] leading-5 overflow-hidden ${codeMode ? 'font-mono' : ''}`}
              rows={1}
              style={{ WebkitAppearance: 'none', height: 'auto' }}
            />
            <div className="flex items-center pr-3 py-2 shrink-0">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-full transition-colors ${codeMode ? 'text-[#34C759] hover:text-[#2DB34E] hover:bg-green-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`} 
                onClick={() => setCodeMode(!codeMode)}
              >
                <Code className="w-5 h-5" strokeWidth={2.5} />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={disabled || isSendingFile || (!message.trim() && !pastedImage) || sending}
            className="shrink-0 bg-[#34C759] hover:bg-[#2DB34E] text-white h-[46px] w-[46px] rounded-full shadow-sm border border-black/5 disabled:opacity-40"
          >
            {sending || isSendingFile ? <LoaderOne className="text-white h-5 w-5" /> : <ArrowUp className="w-6 h-6" strokeWidth={2.5} />}
          </Button>
        </form>
      </div>
    </div>
  );
};
