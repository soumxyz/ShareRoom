const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/ChatInput.tsx', 'utf-8');

// Add createPortal import
content = content.replace(
  "import { useState, useRef, useEffect, useCallback } from 'react';",
  "import { useState, useRef, useEffect, useCallback } from 'react';\nimport { createPortal } from 'react-dom';"
);

// Replace the current popup block
const oldPopup = `{/* Code Mode Pill Popup */}
      <div 
        className={\`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ease-out \${showCodePopup ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}\`}
      >
        <div className="bg-[#1D1D1F] text-white px-5 py-2.5 rounded-full text-[14px] font-medium shadow-[0_8px_16px_rgba(0,0,0,0.15)] flex items-center gap-2">
          <Code className="w-4 h-4 text-[#34C759]" strokeWidth={2.5} />
          Code Mode ON
        </div>
      </div>`;

const newPopup = `{/* Code Mode Pill Popup - Portaled to top of window */}
      {typeof document !== 'undefined' && createPortal(
        <div 
          className={\`fixed top-[84px] left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${showCodePopup ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95 pointer-events-none'}\`}
        >
          <div className="bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 text-[#1D1D1F] border border-black/[0.04] px-[20px] py-[10px] rounded-full text-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-[8px]" style={{ fontWeight: 500 }}>
            <Code className="w-[18px] h-[18px] text-[#34C759]" strokeWidth={2.5} />
            <span style={{ letterSpacing: '-0.01em' }}>Code Mode ON</span>
          </div>
        </div>,
        document.body
      )}`;

content = content.replace(oldPopup, newPopup);

fs.writeFileSync('src/components/shareroom/ChatInput.tsx', content);
