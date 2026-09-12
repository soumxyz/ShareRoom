const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Revert text bubble padding
content = content.replace(/px-\[20px\] py-\[10px\]/g, 'px-[16px] py-[8px]');

// Revert file bubble padding 
content = content.replace(/px-\[20px\] py-\[14px\]/g, 'px-[16px] py-[12px]');

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
