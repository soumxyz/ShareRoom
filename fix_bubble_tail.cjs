const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Replace the max-width class for normal text
content = content.replace(
  /'max-w-\[90%\] sm:max-w-\[75%\]'/g,
  "'max-w-[75%] sm:max-w-[65%]'"
);

// We need to replace the inline bubble div and SVGs with the CSS classes we just added.
const oldBubbleRender = `                  <div key={i} className="relative max-w-full">
                    <div className={\`px-[14px] py-[8px] \${isOwn ? 'bg-[#34C759] text-white' : 'bg-[#E9E9EB] text-[#1D1D1F]'} \`}
                         style={{ 
                           fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                           fontSize: '17px',
                           lineHeight: '1.28',
                           borderRadius: '20px',
                           borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '20px',
                           borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '20px',
                           marginRight: isOwn && isLastInGroup ? '6px' : '0',
                           marginLeft: !isOwn && isLastInGroup ? '6px' : '0'
                         }}>
                      <p className="whitespace-pre-wrap break-words">
                        {part.content}
                      </p>
                    </div>
                    
                    {/* iMessage Tail using SVGs for perfect geometry */}
                    {isLastInGroup && isOwn && (
                      <svg viewBox="0 0 16 16" width="16" height="16" style={{ position: 'absolute', bottom: '0', right: '-2px', fill: '#34C759', zIndex: -1 }}>
                        <path d="M0,16 C0,16 6,16 9,16 C12.5,16 15,13 16,9 C16,13 13,16 8,16 C3,16 0,16 0,16 Z" />
                      </svg>
                    )}
                    {isLastInGroup && !isOwn && (
                      <svg viewBox="0 0 16 16" width="16" height="16" style={{ position: 'absolute', bottom: '0', left: '-2px', fill: '#E9E9EB', transform: 'scaleX(-1)', zIndex: -1 }}>
                        <path d="M0,16 C0,16 6,16 9,16 C12.5,16 15,13 16,9 C16,13 13,16 8,16 C3,16 0,16 0,16 Z" />
                      </svg>
                    )}
                  </div>`;

const newBubbleRender = `                  <div key={i} className={\`relative max-w-full \${isLastInGroup && isOwn ? 'imessage-tail-right' : ''} \${isLastInGroup && !isOwn ? 'imessage-tail-left' : ''}\`}>
                    <div className={\`px-[16px] py-[8px] \${isOwn ? 'bg-[#34C759] text-white' : 'bg-[#E9E9EB] text-[#1D1D1F]'} \`}
                         style={{ 
                           fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                           fontSize: '17px',
                           lineHeight: '1.28',
                           letterSpacing: '-0.24px',
                           borderRadius: '20px',
                           /* Continuous rounded geometry simulation */
                           borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '20px',
                           borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '20px',
                           marginRight: isOwn && isLastInGroup ? '8px' : '0',
                           marginLeft: !isOwn && isLastInGroup ? '8px' : '0'
                         }}>
                      <p className="whitespace-pre-wrap break-words">
                        {part.content}
                      </p>
                    </div>
                  </div>`;

content = content.replace(oldBubbleRender, newBubbleRender);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
