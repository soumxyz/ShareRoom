const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// Update text bubble styling
content = content.replace(
  /fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',/g,
  'fontFamily: \'"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif\',\n                         fontWeight: 400,'
);

content = content.replace(
  /lineHeight: '1.28',/g,
  "lineHeight: '1.35',"
);

// We should also remove the explicit `-0.24px` tracking from before, replacing it with the global -0.01em or keeping it empty (body has -0.01em). Let's let it inherit body, or set explicitly to letterSpacing: '-0.01em' if it's there.
content = content.replace(
  /letterSpacing: '-0.24px',/g,
  "letterSpacing: '-0.01em',"
);

// Do the same for file bubbles which had the font string too
content = content.replace(
  /fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',/g,
  'fontFamily: \'"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif\',\n                         fontWeight: 400,'
);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
