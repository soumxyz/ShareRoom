const fs = require('fs');

let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Update Props
content = content.replace(
  /interface MessageBubbleProps \{/,
  `interface MessageBubbleProps {
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;`
);

content = content.replace(
  /export const MessageBubble = \(\{/,
  `export const MessageBubble = ({
  isLastInGroup = true,
  isFirstInGroup = true,`
);

// Update outer wrapper to handle spacing based on isLastInGroup
// Before: className={`group flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
content = content.replace(
  /className=\{`group flex flex-col \$\{isOwn \? 'items-end' : 'items-start'\}`\}/g,
  `className={\`group flex flex-col \${isOwn ? 'items-end' : 'items-start'} \${isLastInGroup ? 'mb-3' : 'mb-0.5'}\`}`
);

// We need an absolute positioning for the tail. 
// Before updating the bubble class, let's inject custom CSS just for this component, or use Tailwind arbitrary values.
// Actually, Tailwind pseudo-elements work. But they can get complicated. Let's write the styling directly.

const oldBubble = `                ) : (
                  <div key={i} className={\`px-3.5 sm:px-4 py-2 sm:py-2.5 \${isOwn ? 'rounded-2xl rounded-tr-sm bg-[#34C759] text-white' : 'rounded-[18px] rounded-tl-sm bg-[#f2f2f7] text-[#000000]'} shadow-sm\`}>
                    <p className="text-[15px] leading-snug whitespace-pre-wrap break-words font-sans">
                      {part.content}
                    </p>
                  </div>
                )`;

// For iMessage tail, if it's the last in group and own, bottom right tail. 
// If it's last in group and not own, bottom left tail.
// The padding in iMessage is generally slightly asymmetrical horizontally. We use px-[14px] py-[8px].
// Font sizes and font properties.
const newBubble = `                ) : (
                  <div key={i} className="relative max-w-full">
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
                  </div>
                )`;

content = content.replace(oldBubble, newBubble);

// Also apply the same rounded borders logic to image containers (Message type file)
// Let's replace the img rendering:
const oldImg = `<img
                    src={message.file_url}
                    alt={message.file_name || 'Shared image'}
                    className="max-w-full max-h-[200px] sm:max-h-[300px] rounded-lg object-contain"
                    loading="lazy"
                  />`;
const newImg = `<div className="relative">
                    <img
                      src={message.file_url}
                      alt={message.file_name || 'Shared image'}
                      className="max-w-full max-h-[200px] sm:max-h-[300px] object-cover"
                      style={{
                        borderRadius: '20px',
                        borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '20px',
                        borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '20px',
                      }}
                      loading="lazy"
                    />
                    {isLastInGroup && isOwn && (
                      <svg viewBox="0 0 16 16" width="16" height="16" style={{ position: 'absolute', bottom: '0', right: '-8px', fill: 'url(#image-pattern)' }}>
                        <defs>
                          <pattern id="image-pattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
                            <image href={message.file_url} x="-100" y="-100" width="200" height="200" />
                          </pattern>
                        </defs>
                        {/* Too complex to svg clip image on tail for now, iMessage just curves the image bubble itself without the external tail often, or uses a simple clip mask. Let's just use standard rounded corners for images. */}
                      </svg>
                    )}
                  </div>`;
// Actually, iMessage usually DOES NOT have a tail on photos. It just has rounded corners, with smaller rounding at bottom-right/left. Let's just do that.
const newImgSimple = `<img
                    src={message.file_url}
                    alt={message.file_name || 'Shared image'}
                    className="max-w-full max-h-[300px] sm:max-w-[300px] object-cover"
                    style={{
                      borderRadius: '20px',
                      borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '20px',
                      borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '20px',
                    }}
                    loading="lazy"
                  />`;

content = content.replace(oldImg, newImgSimple);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
