const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// 1. Fix the top level margin
const oldWrapper = 'className={`group flex flex-col ${isOwn ? \'items-end\' : \'items-start\'}`}';
const newWrapper = 'className={`group flex flex-col ${isOwn ? \'items-end\' : \'items-start\'} ${isLastInGroup ? \'mb-[16px]\' : \'mb-[2px]\'}`}';
content = content.replace(oldWrapper, newWrapper);

// 2. Fix the text rendering block inside contentParts.map
const oldTextRender = `                  <div key={i} className={\`px-3.5 sm:px-4 py-2 sm:py-2.5 \${isOwn ? 'rounded-2xl rounded-tr-sm bg-[#34C759] text-white' : 'rounded-[18px] rounded-tl-sm bg-[#f2f2f7] text-[#000000]'} shadow-sm\`}>
                    <p className="text-[15px] leading-snug whitespace-pre-wrap break-words font-sans">
                      {part.content}
                    </p>
                  </div>`;

const newTextRender = `                  <div key={i} className={\`relative max-w-full \${isLastInGroup && isOwn ? 'imessage-tail-right' : ''} \${isLastInGroup && !isOwn ? 'imessage-tail-left' : ''}\`}>
                    <div className={\`px-[16px] py-[8px] flex flex-col \${isOwn ? 'bg-[#34C759] text-white' : 'bg-[#E9E9EB] text-[#1D1D1F]'}\`}
                         style={{
                           fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                           fontSize: '17px',
                           lineHeight: '1.28',
                           letterSpacing: '-0.24px',
                           borderRadius: '20px',
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

content = content.replace(oldTextRender, newTextRender);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
