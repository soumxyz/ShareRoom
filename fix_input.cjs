const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/ChatInput.tsx', 'utf-8');

// The layout right now is:
// <div className={`flex items-end gap-1 sm:gap-2 p-2 sm:p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mobile-optimized...
// Inside: + button, text area, code mode button, send button.

// In the mockup:
// The Plus is separate on left.
// The Input is a separate white pill in the middle.
// Inside the input on the right is Image and Smile.
// On the right is a Send button (blue -> green).

// We'll replace the main container.

content = content.replace("import { Code, X, ArrowRight, Plus, Paperclip } from 'lucide-react';", "import { Code, X, ArrowUp, Plus, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';");

const oldRender = `      <div className={\`flex items-end gap-1 sm:gap-2 p-2 sm:p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mobile-optimized transition-[border-radius,height,background-color] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] \${isExpanded ? 'rounded-[1.5rem]' : 'rounded-full'}\`}>
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
              placeholder="Message..."
              disabled={disabled || isSendingFile}
              className={\`min-h-8 sm:min-h-9 py-1.5 sm:py-2 px-2 resize-none bg-transparent text-white caret-white placeholder:text-white/60 placeholder:align-middle focus-visible:ring-0 focus-visible:ring-offset-0 border-0 not-italic font-normal text-sm text-left leading-5 will-change-contents overflow-hidden \${codeMode ? 'font-mono' : ''}\`}
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
            className={\`shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full \${codeMode ? 'bg-mono-700 hover:bg-mono-600 text-mono-100' : 'text-mono-500 hover:text-mono-800 hover:bg-mono-200'}\`}
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
      </div>`;

const newRender = `      <div className="flex items-end gap-3 w-full pb-2">
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
          className="shrink-0 h-[46px] w-[46px] rounded-full bg-white shadow-sm border border-black/5 hover:bg-gray-50 text-gray-800 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </Button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-3 min-w-0">
          <div className={\`flex-1 flex items-center min-w-0 bg-white shadow-sm border border-black/5 transition-all duration-300 \${isExpanded ? 'rounded-[1.5rem]' : 'rounded-full'}\`}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Message..."
              disabled={disabled || isSendingFile}
              className={\`flex-1 min-h-[46px] max-h-[160px] py-[13px] pl-5 pr-2 resize-none bg-transparent text-gray-900 caret-blue-500 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 text-[15px] leading-5 overflow-hidden \${codeMode ? 'font-mono' : ''}\`}
              rows={1}
              style={{ WebkitAppearance: 'none', height: 'auto' }}
            />
            <div className="flex items-center gap-1 pr-3 py-2 shrink-0">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" onClick={() => setCodeMode(!codeMode)}>
                <Smile className="w-5 h-5" />
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
      </div>`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('src/components/shareroom/ChatInput.tsx', content);
