const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

content = content.replace(
  /borderRadius: '24px',/g,
  "borderRadius: '9999px',"
);

content = content.replace(
  /borderBottomRightRadius: isOwn && isLastInGroup \? '4px' : '24px',/g,
  "borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '9999px',"
);

content = content.replace(
  /borderBottomLeftRadius: !isOwn && isLastInGroup \? '4px' : '24px',/g,
  "borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '9999px',"
);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
