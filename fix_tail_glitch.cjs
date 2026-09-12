const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Revert 9999px back to 20px
content = content.replace(/9999px/g, '20px');

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
