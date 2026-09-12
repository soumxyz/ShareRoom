const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/RoomHeader.tsx', 'utf-8');

// The fontStyle should use Inter
content = content.replace(
  /fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'/g,
  'fontFamily: \'"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif\''
);

// Title text size & letter spacing
content = content.replace(
  /text-\[17px\] font-semibold leading-tight/g,
  'text-[28px] leading-[0.95]'
);

content = content.replace(
  /style=\{\{ letterSpacing: '-0.02em', fontWeight: 600 \}\}/g,
  "style={{ letterSpacing: '-0.04em', fontWeight: 600 }}"
);

// Status text
content = content.replace(
  /text-\[12px\] leading-tight/g,
  'text-[14px] text-[#6E6E73]'
);

content = content.replace(
  /style=\{\{ fontWeight: 500, letterSpacing: '-0.01em' \}\}/g,
  "style={{ fontWeight: 500, letterSpacing: '-0.01em' }}"
);

// Green dot sizing (optional, but previously it was 6px, maybe revert to 8px to match the 14px text better)
content = content.replace(
  /w-\[6px\] h-\[6px\]/g,
  'w-[8px] h-[8px]'
);
content = content.replace(
  /gap-\[4px\]/g,
  'gap-[6px]'
);

fs.writeFileSync('src/components/shareroom/RoomHeader.tsx', content);
