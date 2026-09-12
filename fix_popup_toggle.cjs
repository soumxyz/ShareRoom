const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/ChatInput.tsx', 'utf-8');

// 1. Update the useEffect logic
const oldUseEffect = `  useEffect(() => {
    if (codeMode) {
      setShowCodePopup(true);
      const timer = setTimeout(() => setShowCodePopup(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setShowCodePopup(false);
    }
  }, [codeMode]);`;

const newUseEffect = `  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setShowCodePopup(true);
    const timer = setTimeout(() => setShowCodePopup(false), 2500);
    return () => clearTimeout(timer);
  }, [codeMode]);`;

content = content.replace(oldUseEffect, newUseEffect);

// 2. Update the popup render to show ON or OFF dynamically
const oldPopupRender = `          <div className="bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 text-[#1D1D1F] border border-black/[0.04] px-[20px] py-[10px] rounded-full text-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-[8px]" style={{ fontWeight: 500 }}>
            <Code className="w-[18px] h-[18px] text-[#34C759]" strokeWidth={2.5} />
            <span style={{ letterSpacing: '-0.01em' }}>Code Mode ON</span>
          </div>`;

const newPopupRender = `          <div className="bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 text-[#1D1D1F] border border-black/[0.04] px-[20px] py-[10px] rounded-full text-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-[8px]" style={{ fontWeight: 500 }}>
            <Code className={\`w-[18px] h-[18px] \${codeMode ? 'text-[#34C759]' : 'text-[#86868B]'}\`} strokeWidth={2.5} />
            <span style={{ letterSpacing: '-0.01em' }}>{codeMode ? 'Code Mode ON' : 'Code Mode OFF'}</span>
          </div>`;

content = content.replace(oldPopupRender, newPopupRender);

fs.writeFileSync('src/components/shareroom/ChatInput.tsx', content);
