const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/RoomHeader.tsx', 'utf-8');

// Revert title from 28px to 17px, and fix line-height
content = content.replace(
  /text-\[28px\] leading-\[0.95\]/g,
  'text-[17px] leading-tight'
);

// Revert status text from 14px to 12px
content = content.replace(
  /text-\[14px\] text-\[#6E6E73\]/g,
  'text-[12px] text-[#6E6E73]'
);

// Slightly adjust the green dot size back to 6px to fit the 12px text
content = content.replace(
  /w-\[8px\] h-\[8px\]/g,
  'w-[6px] h-[6px]'
);
content = content.replace(
  /gap-\[6px\] mt-\[2px\]/g,
  'gap-[4px] mt-[2px]'
);

fs.writeFileSync('src/components/shareroom/RoomHeader.tsx', content);
