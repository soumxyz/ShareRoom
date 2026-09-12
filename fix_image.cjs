const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

const oldImageRender = `<div className="flex items-center gap-2">
                    <Image className={\`w-4 h-4 shrink-0 text-white/80\`} />
                    <span className={\`font-mono text-xs break-all \${isOwn ? 'text-mono-100' : 'text-mono-800'}\`}>
                      {message.file_name}
                    </span>
                  </div>`;

// Remove the file name for images to match iMessage clean aesthetic
content = content.replace(oldImageRender, `{/* Image filename hidden to match iMessage clean aesthetic */}`);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
