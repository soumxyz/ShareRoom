const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Reduce text bubble padding from py-[10px] to py-[6px]
content = content.replace(/px-\[20px\] py-\[10px\]/g, 'px-[16px] py-[6px]');

// Reduce file bubble padding from py-[14px] to py-[8px]
content = content.replace(/px-\[20px\] py-\[14px\]/g, 'px-[16px] py-[8px]');

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
