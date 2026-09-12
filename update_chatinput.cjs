const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/ChatInput.tsx', 'utf-8');

// 1. Replace the inner div icons with just a Code icon
const oldIcons = `<div className="flex items-center gap-1 pr-3 py-2 shrink-0">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" onClick={() => setCodeMode(!codeMode)}>
                <Smile className="w-5 h-5" />
              </Button>
            </div>`;

const newIcons = `<div className="flex items-center pr-3 py-2 shrink-0">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className={\`h-8 w-8 rounded-full transition-colors \${codeMode ? 'text-[#34C759] hover:text-[#2DB34E] hover:bg-green-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}\`} 
                onClick={() => setCodeMode(!codeMode)}
              >
                <Code className="w-5 h-5" strokeWidth={2.5} />
              </Button>
            </div>`;
content = content.replace(oldIcons, newIcons);

// 2. Add the custom popup. We can use a simple absolute div inside the component that portals or just fixed positions.
// Wait, `ChatInput` is already rendered inside `Room.tsx` in a sticky/fixed bottom area.
// It's better to just put a fixed pill at the top of the window inside `ChatInput` render.
const customPopup = `
      {/* Code Mode Pill Popup */}
      <div 
        className={\`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ease-out \${showCodePopup ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}\`}
      >
        <div className="bg-[#1D1D1F] text-white px-5 py-2.5 rounded-full text-[14px] font-medium shadow-[0_8px_16px_rgba(0,0,0,0.15)] flex items-center gap-2">
          <Code className="w-4 h-4 text-[#34C759]" strokeWidth={2.5} />
          Code Mode ON
        </div>
      </div>
`;

// Add a state for `showCodePopup`
const stateCodePopup = `const [showCodePopup, setShowCodePopup] = useState(false);`;
content = content.replace(/const \[codeMode, setCodeMode\] = useState\(false\);/, "const [codeMode, setCodeMode] = useState(false);\n  const [showCodePopup, setShowCodePopup] = useState(false);");

// Update the useEffect for codeMode to trigger the popup instead of standard toast
const oldUseEffect = `  useEffect(() => {
    if (codeMode) {
      toast({
        title: 'Code mode ON',
        description: 'Messages will be sent as code blocks',
        duration: 2000,
      });
    }
  }, [codeMode]);`;

const newUseEffect = `  useEffect(() => {
    if (codeMode) {
      setShowCodePopup(true);
      const timer = setTimeout(() => setShowCodePopup(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setShowCodePopup(false);
    }
  }, [codeMode]);`;
content = content.replace(oldUseEffect, newUseEffect);

// Inject the customPopup right inside the return of ChatInput
content = content.replace(/(<div className="py-2 sm:py-3">)/, "$1\n" + customPopup);

fs.writeFileSync('src/components/shareroom/ChatInput.tsx', content);
