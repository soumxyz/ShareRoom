const fs = require('fs');

let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Change the rendering of the bubble
const oldBubble = `                ) : (
                  <div key={i} className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-white font-mono" style={{ backgroundColor: '#1c1b1b' }}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-white font-mono">
                      {part.content}
                    </p>
                  </div>
                )`;

const newBubble = `                ) : (
                  <div key={i} className={\`px-3.5 sm:px-4 py-2 sm:py-2.5 \${isOwn ? 'rounded-2xl rounded-tr-sm bg-[#34C759] text-white' : 'rounded-2xl rounded-tl-sm bg-[#f2f2f7] text-[#000000]'} shadow-sm\`}>
                    <p className="text-[15px] leading-snug whitespace-pre-wrap break-words font-sans">
                      {part.content}
                    </p>
                  </div>
                )`;

content = content.replace(oldBubble, newBubble);

// Also remove time below bubble since mockup doesn't show it (or keep it if it's there but mockup doesn't show time).
// Mockup just shows bubbles next to each other. I'll just leave time or hide it to match mockup closer.
// Wait, mockup doesn't show any username or time for each message. It's just clean bubbles.
// Let's hide the username and time.
content = content.replace(/\{\/\* Username and time - only for other users \*\/\}[\s\S]*?\{\/\* Message bubble \*\/\}/, '{/* Message bubble */}');
content = content.replace(/\{\/\* Time for own messages - below bubble \*\/\}[\s\S]*?<\/div>\n  \);\n\};/, '    </div>\n  );\n};');

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
