const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Replace all instances of '20px' with '24px' in the style objects for border radius
// And change px-[16px] py-[8px] to px-[20px] py-[10px] to accommodate the rounder edges

content = content.replace(
  /borderRadius: '20px',/g,
  "borderRadius: '24px',"
);

content = content.replace(
  /borderBottomRightRadius: isOwn && isLastInGroup \? '4px' : '20px',/g,
  "borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '24px',"
);

content = content.replace(
  /borderBottomLeftRadius: !isOwn && isLastInGroup \? '4px' : '20px',/g,
  "borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '24px',"
);

// Update padding for text bubbles
content = content.replace(
  /px-\[16px\] py-\[8px\]/g,
  "px-[20px] py-[10px]"
);

// Update padding for file bubbles
content = content.replace(
  /px-\[16px\] py-\[12px\]/g,
  "px-[20px] py-[14px]"
);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
