const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// 1. Remove the conditional tail CSS classes
content = content.replace(
  /className=\{\`relative max-w-full \$\{isLastInGroup && isOwn \? 'imessage-tail-right' : ''\} \$\{isLastInGroup && !isOwn \? 'imessage-tail-left' : ''\}\`\}/g,
  'className="relative max-w-full"'
);

// 2. Remove the conditional 4px border radius for tails. Make it uniform 24px everywhere.
// For images:
content = content.replace(
  /borderRadius: '20px',\n\s*borderBottomRightRadius: isOwn && isLastInGroup \? '4px' : '20px',\n\s*borderBottomLeftRadius: !isOwn && isLastInGroup \? '4px' : '20px',/g,
  "borderRadius: '24px',"
);

// For text blocks:
content = content.replace(
  /borderRadius: '20px',\n\s*borderBottomRightRadius: isOwn && isLastInGroup \? '4px' : '20px',\n\s*borderBottomLeftRadius: !isOwn && isLastInGroup \? '4px' : '20px',/g,
  "borderRadius: '24px',"
);

// 3. Remove the marginRight / marginLeft shifting that was used to accommodate the tail geometry
content = content.replace(
  /marginRight: isOwn && isLastInGroup \? '8px' : '0',\n\s*marginLeft: !isOwn && isLastInGroup \? '8px' : '0'/g,
  "/* No tail margins needed */"
);

// Add the extra padding back so it looks like a clean pill
content = content.replace(/px-\[16px\] py-\[8px\]/g, 'px-[20px] py-[10px]');
content = content.replace(/px-\[16px\] py-\[12px\]/g, 'px-[20px] py-[14px]');


fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
