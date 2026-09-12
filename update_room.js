const fs = require('fs');

let content = fs.readFileSync('src/pages/Room.tsx', 'utf-8');

// Remove dark background and grid
content = content.replace(/className="min-h-screen w-full bg-black relative overflow-hidden"/, 'className="min-h-screen w-full bg-[#f8f9fa] relative overflow-hidden"');
content = content.replace(/\{\/\* Dark Grid Lines Background \*\/\}[\s\S]*?\/>\n      \{\/\* Your Content Here \*\/\}/, '{/* Background */}\n      {/* Your Content Here */}');

fs.writeFileSync('src/pages/Room.tsx', content);
